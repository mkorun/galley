import { braceDiagnostic } from './parser.js';
import { scriptedSnippets } from './analysis.js';
import { textPosition, textSpans } from './text.js';
import { fail, GalleyDiagnosticError, locate } from './diagnostics.js';
import { URL_LISTS, UrlPrefix } from './url.js';
const asciiLower = (value) => value.replace(/[A-Z]/g, letter => String.fromCharCode(letter.charCodeAt(0) + 32));
const SPACE = /[\t\n\f\r ]/;
const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href']);
const ANIMATION_ELEMENTS = new Set(['set', 'animate', 'animatemotion', 'animatetransform']);
const ANIMATION_VALUES = new Set(['to', 'from', 'by', 'values']);
const TEXT_ELEMENTS = new Set(['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']);
const INTEGRATION = new Set(['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml']);
const excerpt = (text) => JSON.stringify(text.length > 80 ? text.slice(0, 80) + '…' : text);
const isTarget = (tag, attribute) => (tag === 'meta' && attribute === 'content') || (tag === 'link' && attribute === 'href');
const HELP = {
    G3008: 'Put the value in text or inside a quoted attribute value.',
    G3009: 'Put raw output, JS or a snippet in text or inside a quoted attribute value; snippets write no attributes.',
    G3010: 'Open and close tags and quotes within the same block; separate attributes with whitespace on every path.',
    G3011: 'A partial or snippet must preserve its entry context; recursion must use the same context.',
    G3012: 'Finish the tag, quoted value or text element before the template ends.',
    G3013: 'Keep delimiters literal. Inside <svg> or <math>, text elements hold no <, {@raw} or {@js}.',
    G3016: 'Write animation to, from, by and values attributes statically, without any template tags.',
    G3017: 'An on* attribute holds script and srcdoc holds a document: write them statically, without any template tags, and hand values over in data-* attributes.',
    G3018: 'HTML escaping does not secure script or style. Pass data through data-* attributes, or use {@raw} with your own JavaScript or CSS encoding. Write \\{ for a literal brace that was never meant as a value.',
    G3014: 'Follow HTML writing rules: write names and end tags in one piece, separate attributes with whitespace, quote values, and write a literal < as &lt;.',
};
const position = (at) => typeof at === 'function' ? at() : at;
const data = () => ({ state: 'data', tag: '', attribute: '', delimited: false, owner: '', strict: false, svg: 0, math: 0, template: 0, tagId: 0, quote: 0, tagAt: null, open: null, capture: null });
const same = (a, b) => a.owner === b.owner && a.svg === b.svg && a.math === b.math && a.template === b.template && a.tagId === b.tagId && a.quote === b.quote;
const describe = (context) => `${context.state}(${context.tag || context.owner}${context.attribute ? '.' + context.attribute : ''}; tagId=${context.tagId}, quote=${context.quote}, svg=${context.svg}, math=${context.math}, template=${context.template})`;
const refuse = (code, at, context, rule, text) => fail(code, `HTML context ${describe(context)}; rule ${rule}: ${excerpt(text)}`, position(at), HELP[code]);
/** Values that hold another language a browser runs. HTML escaping does not secure it, so no template tag stands in them. */
const staticValue = (context, at) => {
    if (context.state !== 'double' && context.state !== 'single' && context.state !== 'before-value')
        return;
    const animation = ANIMATION_ELEMENTS.has(context.tag) && ANIMATION_VALUES.has(context.attribute);
    if (animation || context.attribute.startsWith('on') || context.attribute === 'srcdoc') {
        const where = position(at);
        refuse(animation ? 'G3016' : 'G3017', where, context, animation ? '15' : '16', where.source.text.slice(where.start, where.end));
    }
};
/** The only HTML reader: accept writing rules, without predicting browser repair. */
export const readContexts = (ast, strictBraces = false, scripted = scriptedSnippets(ast.children)) => {
    let identity = 0, sequence = 0;
    const starts = [];
    const variants = new Map();
    let currentVariant = null;
    const recordStart = (start) => {
        starts.push(start);
        if (currentVariant?.value === start.value)
            currentVariant.start ??= start;
    };
    const actualWrites = new Set();
    const renderWrites = [];
    const finishTag = (context, selfClosing) => {
        const at = context.tagAt;
        const tag = context.tag;
        if (tag === 'select' || tag === 'frameset' || tag === 'plaintext' || (tag === 'col' && context.template > 0))
            refuse('G3013', at, context, '9', tag);
        // HTML ignores the self-closing flag on template. Count every start conservatively.
        if (tag === 'template')
            context.template++;
        else if ((tag === 'svg' || tag === 'math') && !selfClosing)
            context[tag]++;
        const foreign = context.svg + context.math > 0;
        const text = TEXT_ELEMENTS.has(tag) || (foreign && INTEGRATION.has(tag));
        if (TEXT_ELEMENTS.has(tag) && selfClosing)
            refuse('G3013', at, context, '5', tag);
        Object.assign(context, { state: 'data', tag: '', attribute: '', delimited: false, tagId: 0, quote: 0, tagAt: null, capture: null });
        if (text && !selfClosing)
            Object.assign(context, { state: 'text', owner: tag, strict: foreign });
    };
    const endTag = (value, at, context, where) => {
        const match = /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/.exec(value.slice(at));
        if (!match || /[<"'=`\0]/.test(match[1]))
            return refuse('G3014', where, context, '6', value.slice(at));
        const name = asciiLower(match[1]);
        if (name === 'svg' || name === 'math' || name === 'template')
            context[name] = Math.max(0, context[name] - 1);
        return at + match[0].length;
    };
    const read = (node, context, tagFollows) => {
        const value = node.value;
        const at = (offset) => textPosition(node, offset);
        const records = [];
        const open = context.open;
        let index = 0, brace = value.indexOf('{'), sourcePart = 0, sourceOffset = 0;
        const spans = textSpans(node);
        while (index < value.length) {
            const char = value[index];
            const scriptOrStyle = context.owner === 'script' || context.owner === 'style';
            switch (context.state) {
                case 'data': {
                    const less = value.indexOf('<', index);
                    if (less < 0) {
                        index = value.length;
                        break;
                    }
                    if (less > index) {
                        index = less;
                        break;
                    }
                    const rest = value.slice(less);
                    if (rest.startsWith('<!--')) {
                        const body = less + 4, close = value.indexOf('-->', body);
                        const bang = value.slice(body, close < 0 ? value.length : close).includes('--!>');
                        if (value.startsWith('>', body) || value.startsWith('->', body) || bang)
                            refuse('G3014', at(less), context, '7', rest);
                        if (close < 0)
                            refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest);
                        index = close + 3;
                    }
                    else if (/^<!doctype[\t\n\f\r ]/i.test(rest)) {
                        const close = /^![^<>]*>/.exec(rest.slice(1));
                        if (!close)
                            refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest);
                        index = less + 1 + close[0].length;
                    }
                    else if (rest.startsWith('</'))
                        index = endTag(value, less, context, () => at(less));
                    else {
                        const name = /^<([A-Za-z][^\t\n\f\r \/>]*)/.exec(rest);
                        if (!name || /[<"'=`\0]/.test(name[1]))
                            return refuse('G3014', at(less), context, '1/2', rest);
                        Object.assign(context, { state: 'tag', tag: asciiLower(name[1]), attribute: '', delimited: false, tagId: ++identity, tagAt: () => at(less) });
                        if (context.tag === 'meta' || context.tag === 'link') {
                            context.capture = { kind: 'tag-open', at: less, dynamic: false };
                            records.push(context.capture);
                        }
                        index = less + name[0].length;
                    }
                    break;
                }
                case 'tag': {
                    if (SPACE.test(char)) {
                        context.delimited = true;
                        index++;
                        break;
                    }
                    if (char === '>' || value.startsWith('/>', index)) {
                        index += char === '>' ? 1 : 2;
                        if (context.capture)
                            records.push({ kind: 'tag-close', at: index, tag: context.capture });
                        finishTag(context, char !== '>');
                        break;
                    }
                    if (char === '/' || char === '=' || !context.delimited)
                        refuse('G3014', at(index), context, '3/5', value.slice(index));
                    const name = /^[^\t\n\f\r \/>=]+/.exec(value.slice(index))[0];
                    if (/["'<`\0]/.test(name))
                        refuse('G3014', at(index), context, '3', name);
                    context.attribute = asciiLower(name);
                    context.delimited = false;
                    index += name.length;
                    if (isTarget(context.tag, context.attribute))
                        records.push({ kind: 'target', at: index, tag: context.capture });
                    if (value[index] === '=') {
                        context.state = 'before-value';
                        index++;
                    }
                    else if (SPACE.test(value[index]))
                        context.state = 'after-name';
                    break;
                }
                case 'after-name':
                    if (SPACE.test(char)) {
                        index++;
                        break;
                    }
                    if (char === '=') {
                        context.state = 'before-value';
                        index++;
                    }
                    else
                        Object.assign(context, { state: 'tag', delimited: true, attribute: '' });
                    break;
                case 'before-value': {
                    if (SPACE.test(char)) {
                        index++;
                        break;
                    }
                    if (char === '"' || char === "'") {
                        context.state = char === '"' ? 'double' : 'single';
                        context.quote = ++identity;
                        index++;
                        if (value.indexOf(char, index) < 0) {
                            const start = index;
                            const prefix = URL_ATTRIBUTES.has(context.attribute) || URL_LISTS.has(context.attribute) ? new UrlPrefix(context.attribute) : null;
                            const startText = value.slice(start), ampersand = startText.indexOf('&');
                            prefix?.feed(ampersand < 0 ? startText : startText.slice(0, ampersand));
                            const url = prefix && !prefix.settled ? context.attribute : null;
                            const tag = isTarget(context.tag, context.attribute) ? context.capture : null;
                            if (url !== null || tag) {
                                context.open = { kind: 'value-open', at: index, url, tag, dynamic: false };
                                records.push(context.open);
                                if (prefix && !prefix.settled && (prefix.forbidden || ampersand >= 0))
                                    recordStart({ value: context.open, text: value.slice(start), at: offset => at(start + offset), forbidden: prefix.forbidden });
                            }
                        }
                        break;
                    }
                    const unquoted = /^[^\t\n\f\r >]+/.exec(value.slice(index));
                    if (!unquoted || /["'<=`]/.test(unquoted[0]) || index + unquoted[0].length === value.length)
                        return refuse('G3014', at(index), context, '4', value.slice(index));
                    index += unquoted[0].length;
                    Object.assign(context, { state: 'tag', attribute: '', delimited: false });
                    break;
                }
                case 'double':
                case 'single': {
                    const close = value.indexOf(context.state === 'double' ? '"' : "'", index);
                    // In a URL list a reference may stand for a separator, wherever it is: none in the static text of a value that is written into.
                    const rest = value.slice(index, close < 0 ? value.length : close), start = index, list = context.open;
                    if (list?.url && URL_LISTS.has(list.url) && rest.includes('&'))
                        recordStart({ value: list, text: rest, at: offset => at(start + offset), forbidden: false });
                    if (close < 0) {
                        index = value.length;
                        break;
                    }
                    if (context.open)
                        records.push({ kind: 'value-close', at: close });
                    index = close + 1;
                    Object.assign(context, { state: 'tag', attribute: '', delimited: false, quote: 0, open: null });
                    break;
                }
                case 'text': {
                    const less = value.indexOf('<', index);
                    if (less < 0) {
                        index = value.length;
                        break;
                    }
                    if (less > index) {
                        index = less;
                        break;
                    }
                    const end = '</' + context.owner;
                    const rest = asciiLower(value.slice(less, less + end.length + 1));
                    if (rest.startsWith(end) && /^[\t\n\f\r \/>]/.test(rest.slice(end.length))) {
                        Object.assign(context, { state: 'data', owner: '', strict: false });
                        break;
                    }
                    if (((end + '>').startsWith(rest) || (context.owner === 'script' && '<!--'.startsWith(rest))))
                        refuse('G3014', at(less), context, '8', rest);
                    if (context.strict || (context.owner === 'script' && rest.startsWith('<!--')))
                        refuse('G3013', at(less), context, '8/13', rest);
                    index = less + 1;
                    break;
                }
            }
            while (brace >= 0 && brace < index) {
                if (!scriptOrStyle) {
                    while (sourceOffset + spans[sourcePart].end - spans[sourcePart].start <= brace) {
                        sourceOffset += spans[sourcePart].end - spans[sourcePart].start;
                        sourcePart++;
                    }
                    const part = spans[sourcePart];
                    const diagnostic = braceDiagnostic(part.source, part.start + brace - sourceOffset, strictBraces);
                    if (diagnostic)
                        throw new GalleyDiagnosticError(diagnostic);
                }
                brace = value.indexOf('{', brace + 1);
            }
        }
        return { ...node, records, ...(open ? { open } : {}) };
    };
    const boundary = (context, at, code = 'G3014') => {
        if (context.state === 'after-name')
            Object.assign(context, { state: 'tag', delimited: true, attribute: '' });
        else if (context.state === 'tag')
            context.attribute = '';
        else if (context.state === 'before-value') {
            const where = position(at);
            refuse(code, where, context, '11', where.source.text.slice(where.start, where.end));
        }
    };
    const slot = (context, at, opaque, render = false) => {
        const place = context.state === 'data' ? 'text' : context.state === 'text' ? `text:${context.owner}` : `attr:${context.tag}.${context.attribute}`;
        if (context.state === 'double' || context.state === 'single') {
            const value = context.open;
            if (value) {
                value.dynamic = true;
                if (!render)
                    actualWrites.add(value);
                if (value.tag)
                    value.tag.dynamic = true;
            }
            return { place, url: value?.url != null, metadata: value?.tag != null };
        }
        if (context.state === 'data' || context.state === 'text') {
            if (context.strict && (opaque || context.owner === 'script' || context.owner === 'style'))
                refuse('G3013', at, context, '13', at.source.text.slice(at.start, at.end));
            if (!opaque && !render && (context.owner === 'script' || context.owner === 'style'))
                refuse('G3018', at, context, '17', at.source.text.slice(at.start, at.end));
            return { place, url: false, metadata: false };
        }
        return refuse(opaque || render ? 'G3009' : 'G3008', at, context, '10', at.source.text.slice(at.start, at.end));
    };
    const declare = (nodes, scope) => {
        for (const node of nodes) {
            if (node.kind === 'snippet')
                scope.bindings.set(node.name, { node, scope, list: [], variants: new Map(), active: null });
            else if (node.kind === 'partial')
                declare(node.children ?? [], scope);
        }
    };
    const openScope = (nodes, parent) => {
        const scope = { parent, bindings: new Map() };
        declare(nodes, scope);
        return scope;
    };
    const resolve = (scope, name) => {
        for (let current = scope; current; current = current.parent) {
            const binding = current.bindings.get(name);
            if (binding)
                return binding;
        }
        throw new Error(`Unresolved checked snippet ${name}`);
    };
    const path = (children, entry, scope, code, at, closes = true) => {
        const exit = { ...entry }, result = visit(children, exit, scope, closes);
        const last = children[children.length - 1];
        const end = () => last?.kind === 'text' && last.value.length ? textPosition(last, last.value.length - 1) : at;
        if (closes)
            staticValue(exit, end);
        boundary(exit, end, code);
        if (!same(entry, exit))
            refuse(code, end, entry, '11', describe(exit));
        return { children: result, delimited: exit.delimited };
    };
    const specialize = (binding, entry, at) => {
        const key = JSON.stringify([entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null]);
        const known = binding.variants.get(key);
        if (known)
            return known.name;
        if (binding.active)
            refuse('G3011', at, binding.active, '11', describe(entry));
        const variant = { name: `$$snippet${++sequence}`, value: entry.open, startCallers: [], children: [], writes: false, start: null };
        variants.set(variant.name, variant);
        binding.variants.set(key, variant);
        binding.list.push(variant);
        binding.active = entry;
        const parent = currentVariant;
        currentVariant = variant;
        try {
            variant.children = path(binding.node.children, entry, openScope(binding.node.children, binding.scope), 'G3011', binding.node.span).children;
        }
        catch (error) {
            if (!(error instanceof GalleyDiagnosticError) || error.diagnostic.code !== 'G3018')
                throw error;
            const { line, column } = locate(at.source, at.start);
            throw new GalleyDiagnosticError({ ...error.diagnostic, help: `${error.diagnostic.help} Rendered by ${at.source.text.slice(at.start, at.end)} at ${at.source.id}:${line}:${column}.` });
        }
        finally {
            binding.active = null;
            currentVariant = parent;
        }
        return variant.name;
    };
    const visit = (nodes, context, scope, closes = false) => {
        const result = [];
        for (const [index, node] of nodes.entries()) {
            if (node.kind === 'text') {
                result.push(read(node, context, index + 1 < nodes.length || closes));
                continue;
            }
            staticValue(context, node.span);
            if (node.kind === 'const') {
                boundary(context, node.span);
                result.push(node);
                continue;
            }
            if (node.kind === 'snippet') {
                boundary(context, node.span);
                const binding = scope.bindings.get(node.name);
                result.push({ ...node, variants: binding.list, ...(scripted.has(node.span) ? { js: specialize(binding, data(), node.span) } : {}) });
                continue;
            }
            if (node.kind === 'output' || node.kind === 'js') {
                result.push({ ...node, slot: slot(context, node.span, node.kind === 'js' || node.raw) });
                continue;
            }
            boundary(context, node.span, node.kind === 'render' ? 'G3009' : node.kind === 'partial' ? 'G3011' : 'G3010');
            switch (node.kind) {
                case 'if': {
                    const paths = node.branches.map(branch => path(branch.children, context, openScope(branch.children, scope), 'G3010', branch.span));
                    const ends = paths.map(item => item.delimited);
                    if (node.branches[node.branches.length - 1].condition !== null)
                        ends.push(context.delimited);
                    context.delimited = ends.every(Boolean);
                    result.push({ ...node, branches: node.branches.map((branch, index) => ({ ...branch, children: paths[index].children })) });
                    break;
                }
                case 'each': {
                    const body = path(node.children, { ...context, delimited: false }, openScope(node.children, scope), 'G3010', node.span);
                    // Zero iterations write the fallback, or nothing: that path starts as the block does, like a branch of {#if}.
                    const fallback = node.fallback ? path(node.fallback, context, openScope(node.fallback, scope), 'G3010', node.span) : null;
                    context.delimited = body.delimited && (fallback ? fallback.delimited : context.delimited);
                    result.push({ ...node, children: body.children, ...(fallback ? { fallback: fallback.children } : {}) });
                    break;
                }
                case 'partial': {
                    const body = path(node.children ?? [], context, scope, 'G3011', node.span, false);
                    context.delimited = body.delimited;
                    result.push(...body.children);
                    break;
                }
                case 'render': {
                    // Inspect animation attributes supplied by a snippet before the general attribute-writing refusal.
                    let specialization;
                    if (ANIMATION_ELEMENTS.has(context.tag))
                        specialization = specialize(resolve(scope, node.name), context, node.span);
                    const written = slot(context, node.span, false, true);
                    specialization ??= specialize(resolve(scope, node.name), context, node.span);
                    if (context.open) {
                        renderWrites.push({ value: context.open, name: specialization });
                        if (currentVariant?.value === context.open)
                            variants.get(specialization).startCallers.push(currentVariant);
                    }
                    result.push({ ...node, slot: written, specialization });
                    break;
                }
            }
        }
        return result;
    };
    const scope = openScope(ast.children, null);
    const context = data(), children = visit(ast.children, context, scope);
    if (context.state !== 'data')
        refuse('G3012', { ...ast.span, start: ast.span.end }, context, '12', describe(context));
    // Static-only snippets feed literal suffixes, but do not turn a static URL into a dynamic one.
    // Propagate actual writes backwards over snippet calls; the queue visits each edge once, including cycles.
    const callers = new Map(), pending = [], pendingStarts = [];
    const inspect = (nodes, variant) => {
        for (const node of nodes) {
            if (node.kind === 'output' || node.kind === 'js')
                variant.writes = true;
            else if (node.kind === 'render') {
                const name = node.specialization;
                const list = callers.get(name) ?? [];
                list.push(variant);
                callers.set(name, list);
            }
            else if (node.kind === 'if')
                for (const branch of node.branches)
                    inspect(branch.children, variant);
            else if (node.kind === 'each') {
                inspect(node.children, variant);
                inspect(node.fallback ?? [], variant);
            }
        }
    };
    for (const variant of variants.values()) {
        inspect(variant.children, variant);
        if (variant.writes)
            pending.push(variant);
        if (variant.start)
            pendingStarts.push(variant);
    }
    for (let index = 0; index < pending.length; index++)
        for (const caller of callers.get(pending[index].name) ?? []) {
            if (!caller.writes) {
                caller.writes = true;
                pending.push(caller);
            }
        }
    // A cached variant owes its entry value's static-text check to every caller, including through cycles.
    for (let index = 0; index < pendingStarts.length; index++)
        for (const caller of pendingStarts[index].startCallers) {
            if (!caller.start) {
                caller.start = pendingStarts[index].start;
                pendingStarts.push(caller);
            }
        }
    for (const render of renderWrites) {
        const variant = variants.get(render.name);
        if (variant.writes)
            actualWrites.add(render.value);
        if (variant.start)
            starts.push({ ...variant.start, value: render.value });
    }
    for (const start of starts)
        if (actualWrites.has(start.value)) {
            if (start.forbidden)
                fail('G3015', `HTML context URL; forbidden static prefix: ${excerpt(start.text)}`, start.at(0), 'Use a relative URL, or http:, https:, mailto: or tel:, before a dynamic value.');
            fail('G3015', `HTML context URL; rule 14: ${excerpt(start.text)}`, start.at(start.text.indexOf('&')), URL_LISTS.has(start.value.url) ? 'Move query text into an escaped value in a URL list.' : 'Write the character itself, not a reference, before a value in a URL.');
        }
    return { ...ast, children };
};
//# sourceMappingURL=context.js.map