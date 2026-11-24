import { fail, GalleyDiagnosticError, span } from './diagnostics.js';
import { parseExpression } from './expression.js';
import { lex } from './lexer.js';
import { textSpans } from './text.js';
import { checkPathRoots, parsePath } from './path.js';
// Preserve the parser's reason by original source offset; HTML context decides whether this brace may stay literal.
const literalBraces = new WeakMap();
export const braceDiagnostic = (source, offset) => {
    const braces = literalBraces.get(source);
    if (!braces)
        throw new Error(`Missing brace diagnostics for ${source.id}; parse the source before reading its HTML context`);
    return braces.get(offset);
};
const expressionSpan = (token, raw) => {
    const local = token.value.indexOf(raw);
    const start = local < 0 ? token.span.start : token.valueStart + local;
    return span(token.span.source, start, local < 0 ? token.span.end : start + raw.length);
};
/** Lexical removals and ADR-015 can leave a seam inside literal HTML. Read it as one text. */
const joinTexts = (nodes) => {
    const result = [];
    let joinedSpans = null;
    for (const node of nodes) {
        const last = result[result.length - 1];
        if (node.kind === 'text' && last?.kind === 'text') {
            joinedSpans ??= [...textSpans(last)];
            for (const part of textSpans(node))
                joinedSpans.push(part);
            result[result.length - 1] = { ...last, value: last.value + node.value, sourceSpans: joinedSpans, span: span(last.span.source, last.span.start, node.span.end) };
        }
        else {
            result.push(node);
            joinedSpans = null;
        }
    }
    return result;
};
export const parseTokens = (source, input) => {
    const tokens = [...input];
    const braces = new Map();
    literalBraces.set(source, braces);
    // ADR-014 as a token transform: structural tags on otherwise empty lines do
    // not leak their indentation/newline into the semantic AST.
    let sourceLineStart = 0, nextNewline = source.text.indexOf('\n');
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token || (token.kind !== 'block-open' && token.kind !== 'block-close' && token.kind !== 'continuation'))
            continue;
        const previous = tokens[i - 1];
        const next = tokens[i + 1];
        // Use the source line: a preceding expression is not an empty line.
        while (nextNewline >= 0 && nextNewline < token.span.start) {
            sourceLineStart = nextNewline + 1;
            nextNewline = source.text.indexOf('\n', sourceLineStart);
        }
        const previousText = source.text.slice(sourceLineStart, token.span.start);
        let before = 0;
        while (previousText.charCodeAt(before) === 32 || previousText.charCodeAt(before) === 9)
            before++;
        if (before !== previousText.length || next?.kind !== 'text')
            continue;
        let after = 0;
        while (next.value.charCodeAt(after) === 32 || next.value.charCodeAt(after) === 9)
            after++;
        if (next.value.charCodeAt(after) === 13 && next.value.charCodeAt(after + 1) === 10)
            after += 2;
        else if (next.value.charCodeAt(after) === 10)
            after++;
        else
            continue;
        if (previous?.kind === 'text') {
            const value = previous.value.slice(0, previous.value.length - previousText.length);
            tokens[i - 1] = { ...previous, value };
        }
        tokens[i + 1] = { ...next, value: next.value.slice(after), valueStart: next.valueStart + after };
    }
    let cursor = 0;
    /** `continuations` names the block whose `{:…}` tags end these children: `{#if}` takes `{:else if}` and `{:else}`, `{#each}` only `{:else}`. */
    const parseChildren = (closing, continuations = null) => {
        const children = [];
        while (cursor < tokens.length) {
            const token = tokens[cursor] ?? fail('G2999', 'Internal parser cursor escaped the token stream', astSpan);
            if ((token.kind === 'block-close' && token.value === closing) || (continuations && token.kind === 'continuation' && (token.value === 'else' || (continuations === 'if' && token.value.startsWith('else if ')))))
                return { children: joinTexts(children), stop: token };
            cursor++;
            switch (token.kind) {
                case 'text':
                    children.push({ kind: 'text', value: token.value, span: span(source, token.valueStart, token.valueStart + token.value.length) });
                    break;
                case 'expression': {
                    try {
                        children.push({ kind: 'output', expression: parseExpression(token.value, expressionSpan(token, token.value)), raw: false, span: token.span });
                    }
                    catch (error) {
                        if (!(error instanceof GalleyDiagnosticError))
                            throw error;
                        if (error.diagnostic.code === 'G1007')
                            braces.set(token.span.start, { code: 'G3019', severity: 'error', message: `Literal { in text: ${error.diagnostic.message}`, span: span(source, token.span.start, token.span.start + 1), help: `Write \\{ for a literal brace, or use $. to reach a data key with :, + or -.` });
                        // ADR-015: an expression-shaped CSS/JS collision remains literal text.
                        children.push({ kind: 'text', value: token.span.source.text.slice(token.span.start, token.span.end), span: token.span });
                    }
                    break;
                }
                case 'js': {
                    const node = { kind: 'js', code: token.value.trim(), awaits: token.value.includes('await'), span: token.span };
                    children.push(node);
                    break;
                }
                case 'directive':
                    children.push(parseDirective(token));
                    break;
                case 'block-open':
                    children.push(parseBlock(token));
                    break;
                case 'block-close': return fail('G2001', `Closing tag {/${token.value}} without matching opening tag`, token.span);
                case 'continuation':
                    if (continuations === 'each')
                        return fail('G2002', `{#each} takes {:else} only, not {:${token.value}}`, token.span, 'Put an {#if} inside the {:else} branch.');
                    return fail('G2002', `Continuation tag {:${token.value}} is only valid inside {#if}, and a single {:else} inside {#each}`, token.span);
            }
        }
        return { children: joinTexts(children), stop: null };
    };
    const parseDirective = (token) => {
        const space = token.value.search(/\s/);
        const name = space < 0 ? token.value : token.value.slice(0, space);
        const arg = space < 0 ? '' : token.value.slice(space).trim();
        const at = expressionSpan(token, arg);
        switch (name) {
            case 'raw':
                if (!arg)
                    fail('G2101', '{@raw} requires an expression', token.span, 'Example: {@raw markup}');
                return { kind: 'output', expression: parseExpression(arg, at), raw: true, span: token.span };
            case 'partial':
                if (!source.text.startsWith('{@partial', token.span.start))
                    fail('G4002', 'Whitespace after @ is not supported for {@partial}', token.span, 'Write {@partial path} without whitespace after @.');
                if (!arg)
                    fail('G2102', '{@partial} requires a path', token.span);
                if (arg.includes('\0') || /^(?:[/\\]|[A-Za-z]:)/.test(arg) || arg.split(/[/\\]/).includes('..'))
                    fail('G2109', `Unsafe partial path ${JSON.stringify(arg)}`, token.span, 'Use a relative path that stays inside the configured partial directory.');
                return { kind: 'partial', path: arg, span: token.span };
            case 'const': {
                const equals = arg.indexOf('=');
                if (equals < 0)
                    fail('G2103', '{@const} requires "=" between its name and expression', token.span, 'Example: {@const title = meta.title}');
                const variable = arg.slice(0, equals).trim();
                const rawExpression = arg.slice(equals + 1).trim();
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variable))
                    fail('G2104', `Invalid variable name in {@const}: ${JSON.stringify(variable)}`, token.span);
                if (!rawExpression)
                    fail('G2105', `Const ${variable} requires a value`, token.span);
                try {
                    return { kind: 'const', name: variable, expression: parseExpression(rawExpression, expressionSpan(token, rawExpression)), span: token.span };
                }
                catch (error) {
                    if (!(error instanceof GalleyDiagnosticError))
                        throw error;
                    return fail('G2108', `Invalid expression in {@const ${arg}}`, expressionSpan(token, rawExpression), error.diagnostic.message);
                }
            }
            case 'render': {
                const open = arg.indexOf('('), close = arg.lastIndexOf(')');
                if (open < 1 || close !== arg.length - 1)
                    fail('G2106', '{@render} requires name(argument)', token.span, 'Example: {@render card(article)}');
                const snippet = arg.slice(0, open).trim();
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(snippet))
                    fail('G2107', `Invalid snippet name ${JSON.stringify(snippet)}`, token.span);
                const rawArgument = arg.slice(open + 1, close).trim();
                return { kind: 'render', name: snippet, argument: rawArgument ? parseExpression(rawArgument, expressionSpan(token, rawArgument)) : null, span: token.span };
            }
            default: return fail('G2100', `Unknown directive {@${name}}`, token.span, 'Supported directives are raw, partial, const, and render.');
        }
    };
    const parseBlock = (token) => {
        if (token.value.startsWith('if ') || token.value.startsWith('if\t'))
            return parseIf(token);
        if (token.value.startsWith('each ') || token.value.startsWith('each\t'))
            return parseEach(token);
        if (token.value.startsWith('snippet ') || token.value.startsWith('snippet\t'))
            return parseSnippet(token);
        return fail('G2200', `Unknown block {#${token.value}}`, token.span, 'Supported blocks are if, each, and snippet.');
    };
    const parseIf = (opening) => {
        const conditionRaw = opening.value.slice(2).trim();
        if (!conditionRaw)
            fail('G2201', '{#if} requires a condition', opening.span);
        const branches = [];
        let condition = parseExpression(conditionRaw, expressionSpan(opening, conditionRaw));
        while (true) {
            const result = parseChildren('if', 'if');
            branches.push({ condition, children: result.children, span: opening.span });
            const stop = result.stop ?? fail('G2202', `Unclosed {#if ${conditionRaw}}`, opening.span, 'Add {/if} after the block.');
            cursor++;
            if (stop.kind === 'block-close')
                return { kind: 'if', branches, span: span(opening.span.source, opening.span.start, stop.span.end) };
            if (stop.value === 'else') {
                const final = parseChildren('if');
                const finalStop = final.stop ?? fail('G2202', `Unclosed {#if ${conditionRaw}}`, opening.span);
                cursor++;
                branches.push({ condition: null, children: final.children, span: stop.span });
                return { kind: 'if', branches, span: span(opening.span.source, opening.span.start, finalStop.span.end) };
            }
            const nextRaw = stop.value.slice(7).trim();
            condition = parseExpression(nextRaw, expressionSpan(stop, nextRaw));
        }
    };
    const parseEach = (opening) => {
        const body = opening.value.slice(4).trim();
        const as = body.indexOf(' as ');
        if (as < 0)
            fail('G2210', '{#each} requires "collection as item"', opening.span);
        const collectionRaw = body.slice(0, as).trim();
        const names = body.slice(as + 4).split(',').map(s => s.trim());
        const item = names[0] ?? fail('G2211', 'Missing item name in {#each}', opening.span);
        if (names.length > 2 || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(item))
            fail('G2211', 'Invalid item name in {#each}', opening.span);
        const index = names[1] || null;
        if (index && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(index))
            fail('G2212', `Invalid index name ${JSON.stringify(index)}`, opening.span);
        for (const name of [item, index])
            if (name && ['length', 'isFirst', 'isLast'].includes(name))
                fail('G2213', `Loop name ${name} collides with loop metadata`, opening.span, 'Choose another item or index name.');
        if (index === item)
            fail('G2214', 'Item and index names must differ', opening.span);
        let collection;
        try {
            collection = parsePath(collectionRaw, expressionSpan(opening, collectionRaw));
            checkPathRoots(collection);
        }
        catch (error) {
            if (!(error instanceof GalleyDiagnosticError))
                throw error;
            return fail('G2216', `Invalid collection expression in {#each}: ${JSON.stringify(collectionRaw)}`, expressionSpan(opening, collectionRaw), error.diagnostic.message);
        }
        const result = parseChildren('each', 'each');
        const stop = result.stop ?? fail('G2215', `Unclosed {#each ${body}}`, opening.span, 'Add {/each} after the loop.');
        cursor++;
        if (stop.kind === 'block-close')
            return { kind: 'each', collection, item, index, children: result.children, span: span(opening.span.source, opening.span.start, stop.span.end) };
        const fallback = parseChildren('each');
        const fallbackStop = fallback.stop ?? fail('G2215', `Unclosed {#each ${body}}`, opening.span, 'Add {/each} after the {:else} branch.');
        cursor++;
        return { kind: 'each', collection, item, index, children: result.children, fallback: fallback.children, span: span(opening.span.source, opening.span.start, fallbackStop.span.end) };
    };
    const parseSnippet = (opening) => {
        const body = opening.value.slice(7).trim();
        const open = body.indexOf('('), close = body.lastIndexOf(')');
        if (open < 1 || close !== body.length - 1)
            fail('G2220', '{#snippet} requires name(parameter)', opening.span);
        const name = body.slice(0, open).trim(), param = body.slice(open + 1, close).trim() || null;
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
            fail('G2221', `Invalid snippet name ${JSON.stringify(name)}`, opening.span);
        if (param && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(param))
            fail('G2222', `Invalid snippet parameter ${JSON.stringify(param)}`, opening.span);
        const result = parseChildren('snippet');
        const stop = result.stop ?? fail('G2223', `Unclosed {#snippet ${body}}`, opening.span, 'Add {/snippet} after the snippet.');
        cursor++;
        return { kind: 'snippet', name, param, children: result.children, span: span(opening.span.source, opening.span.start, stop.span.end) };
    };
    const astSpan = span(source, 0, source.text.length);
    const result = parseChildren(null);
    return { kind: 'template', children: result.children, span: astSpan };
};
export const parse = (source) => parseTokens(source, lex(source));
//# sourceMappingURL=parser.js.map