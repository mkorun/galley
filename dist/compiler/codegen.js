import { fail } from './diagnostics.js';
const escapeJs = (value) => /[\\'\n\r\u2028\u2029]/.test(value)
    ? value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
        .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
    : value;
const isIdentifier = (value) => {
    let code = value.charCodeAt(0);
    if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36))
        return false;
    for (let index = 1; index < value.length; index++) {
        code = value.charCodeAt(index);
        if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 95 || code === 36))
            return false;
    }
    return true;
};
const safeProperty = (value) => isIdentifier(value) ? `?.${value}` : `?.[${JSON.stringify(value)}]`;
const pathCode = (path, scope) => {
    let code = scope.has(path.root) ? path.root : `$${safeProperty(path.root)}`;
    for (const segment of path.segments) {
        if (segment.kind === 'property')
            code += safeProperty(segment.value);
        else if (typeof segment.value === 'number')
            code += `?.[${segment.value}]`;
        else if (typeof segment.value === 'string')
            code += `?.[${JSON.stringify(segment.value)}]`;
        else
            code += `?.[${pathCode(segment.value, scope)}]`;
    }
    return code;
};
export const generate = (ast, options, allowCode) => {
    const places = [];
    const place = (at) => { places.push(at); return places.length - 1; };
    const checked = (code, at) => options.strictUndefined ? `$$defined(${code},${place(at)})` : code;
    const expressionCode = (expression, scope, condition = false) => {
        switch (expression.kind) {
            case 'path': return pathCode(expression, scope);
            case 'literal': return typeof expression.value === 'string' ? JSON.stringify(expression.value) : expression.raw;
            case 'unary': return `!(${expressionCode(expression.operand, scope, condition)})`;
            case 'binary': return `(${expressionCode(expression.left, scope, condition)}${expression.operator}${expressionCode(expression.right, scope, condition)})`;
            case 'pipe': {
                const input = expressionCode(expression.input, scope, condition);
                return expression.pipes.reduce((input, pipe) => `$$filter(${place(pipe.span)},'${pipe.name}',${input}${pipe.args.map(arg => `,${expressionCode(arg, scope, condition)}`).join('')})`, condition ? input : checked(input, expression.input.span));
            }
        }
    };
    const strip = options.stripEmptyMeta !== false;
    const hasMetadata = (nodes) => nodes.some(node => {
        if (node.kind === 'text')
            return node.records?.some(record => record.kind === 'tag-open' && record.dynamic) === true;
        if (node.kind === 'if')
            return node.branches.some(branch => hasMetadata(branch.children));
        if (node.kind === 'each')
            return hasMetadata(node.children) || hasMetadata(node.fallback ?? []);
        if (node.kind === 'snippet')
            return node.variants?.some(variant => hasMetadata(variant.children)) === true;
        return false;
    });
    const trackIndent = strip && hasMetadata(ast.children);
    // $$url: the prefix of the URL value being written. $$tag: the <meta> or <link> start tag being written; $$meta: its target value.
    let body = "'use strict';if(arguments.length>1)throw new TypeError('Pass filters in options.filters, not render(data, filters)');$??={};let $$='',$$url=null,$$meta=null,$$tag=null,$$indent=0,$$skipNewline=false;";
    body += `const $$str=v=>v==null?'':$$stringify(v,${options.debug === true}),$$filter=(p,n,...a)=>$$filterWithWarnings(${options.debug === true},n,$$places[p],$$filters[n],...a);`;
    if (options.strictUndefined)
        body += 'const $$defined=(v,p)=>{if(v===undefined)throw $$undefinedError($$places[p]);return v;};';
    if (options.debug)
        body += '// [galley] AST compiler debug output\n';
    let sequence = 0;
    /** The record of a value when something at render depends on it. */
    const live = (record) => record?.dynamic && (record.url !== null || (record.tag !== null && strip)) ? record : null;
    /** What a write into a checked value owes: the URL check and the mark for stripEmptyMeta. A snippet has fed the prefix itself. */
    const written = (slot, value, feed, escaped = false, nonempty = `${value}.length>0`) => (slot?.url ? `${feed ? `$$url.feed(${value},${escaped});` : ''}$$url.check(${nonempty});` : '')
        + (slot?.metadata && strip ? `if($$meta){$$meta.dynamic=true;$$meta.nonempty||=${value}.length>0;}` : '');
    /** Static text is one literal, cut only where a record has something to do at render. */
    const emitText = (node, buffer) => {
        const value = node.value;
        let from = 0;
        let open = live(node.open);
        const literal = (to) => {
            if (to > from) {
                const text = escapeJs(value.slice(from, to));
                const newline = value.startsWith('\r\n', from) ? 2 : value.startsWith('\n', from) ? 1 : 0;
                if (trackIndent && newline)
                    body += `if($$skipNewline){${buffer}+='${escapeJs(value.slice(from + newline, to))}';}else{${buffer}+='${text}';}`;
                else
                    body += `${buffer}+='${text}';`;
                if (trackIndent)
                    body += '$$skipNewline=false;';
                if (trackIndent) {
                    const literal = value.slice(from, to);
                    let trailing = 0;
                    while (literal.charCodeAt(literal.length - trailing - 1) === 32 || literal.charCodeAt(literal.length - trailing - 1) === 9)
                        trailing++;
                    body += trailing === literal.length ? `$$indent+=${trailing};` : `$$indent=${trailing};`;
                }
                if (open?.url)
                    body += `$$url.feed('${text}');`;
                if (open?.tag && strip)
                    body += 'if($$meta)$$meta.nonempty=true;';
            }
            from = to;
        };
        for (const record of node.records ?? []) {
            switch (record.kind) {
                case 'tag-open': {
                    if (!record.dynamic || !strip)
                        break;
                    literal(record.at);
                    body += `$$tag={start:${buffer}.length-$$indent,target:null,current:null};`;
                    break;
                }
                case 'target':
                    if (!record.tag.dynamic || !strip)
                        break;
                    // The first target attribute of the tag is the one a browser keeps.
                    body += '$$tag.current=$$tag.target?null:($$tag.target={dynamic:false,nonempty:false});';
                    break;
                case 'value-open':
                    if (!live(record))
                        break;
                    literal(record.at);
                    open = record;
                    if (record.url)
                        body += `$$url=new $$UrlPrefix('${record.url}');`;
                    if (record.tag && strip)
                        body += '$$meta=$$tag.current;';
                    break;
                case 'value-close':
                    if (!open)
                        break;
                    literal(record.at);
                    if (open.url)
                        body += '$$url.check($$url.checkpoints > 0);';
                    open = null;
                    break;
                case 'tag-close': {
                    if (!record.tag.dynamic || !strip)
                        break;
                    literal(record.at);
                    // A tag that goes takes the line break after it along.
                    const newline = value.startsWith('\r\n', from) ? '\r\n' : value.startsWith('\n', from) ? '\n' : '';
                    body += `if($$tag.target?.dynamic&&!$$tag.target.nonempty){${buffer}=${buffer}.slice(0,$$tag.start);$$skipNewline=${newline.length === 0};}else{${buffer}+='${escapeJs(newline)}';$$skipNewline=false;}$$tag=null;`;
                    from += newline.length;
                    break;
                }
            }
        }
        literal(value.length);
    };
    const emitNodes = (nodes, scope, buffer, bindings = []) => {
        const localNames = [];
        const declare = (name) => {
            if (!scope.has(name)) {
                scope.add(name);
                localNames.push(name);
            }
        };
        for (const name of bindings)
            declare(name);
        for (const node of nodes) {
            switch (node.kind) {
                case 'text':
                    emitText(node, buffer);
                    break;
                case 'output': {
                    const value = `$$v${++sequence}`;
                    const expr = checked(expressionCode(node.expression, scope), node.expression.span);
                    body += `{const ${value}=$$str(${expr})${node.raw ? '' : ".replace(/[&<>'\"]/g,c=>$$html[c])"};`;
                    body += `${written(node.slot, value, true, !node.raw)}${buffer}+=${value};${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}`;
                    break;
                }
                case 'const':
                    body += `const ${node.name}=(${checked(expressionCode(node.expression, scope), node.expression.span)}??'');`;
                    declare(node.name);
                    break;
                case 'if': {
                    node.branches.forEach((branch, index) => {
                        body += index === 0 ? `if(${expressionCode(branch.condition, scope, true)}){` : branch.condition ? `else if(${expressionCode(branch.condition, scope, true)}){` : 'else{';
                        emitNodes(branch.children, scope, buffer);
                        body += '}';
                    });
                    break;
                }
                case 'each': {
                    const id = ++sequence, collection = `$$l${id}`, array = `$$a${id}`, count = `$$c${id}`, empty = `$$e${id}`;
                    const metadata = node.metadata ?? new Set();
                    const needsCount = metadata.has('length') || metadata.has('isLast');
                    const needsCounter = metadata.has('isFirst') || metadata.has('isLast') || metadata.has('position');
                    body += `{const ${collection}=${checked(pathCode(node.collection, scope), node.collection.span)};${node.fallback ? `let ${empty}=true;` : ''}if(${collection}){const ${array}=Array.isArray(${collection});`;
                    if (needsCount)
                        body += `const ${count}=${array}?${collection}.length:Object.keys(${collection}).length;`;
                    const bindings = [node.item, ...metadata];
                    if (node.index)
                        bindings.push(node.index);
                    if (needsCounter)
                        body += `let $$n${id}=0;`;
                    if (node.index)
                        body += `for(const [${node.index},${node.item}] of ${array}?${collection}.entries():Object.entries(${collection})){`;
                    else
                        body += `for(const ${node.item} of (${array}?${collection}:Object.values(${collection}))){`;
                    if (node.fallback)
                        body += `${empty}=false;`;
                    if (metadata.has('position'))
                        body += `const position=$$n${id}+1;`;
                    if (metadata.has('length'))
                        body += `const length=${count};`;
                    if (metadata.has('isFirst'))
                        body += `const isFirst=$$n${id}===0;`;
                    if (metadata.has('isLast'))
                        body += `const isLast=$$n${id}===${count}-1;`;
                    emitNodes(node.children, scope, buffer, bindings);
                    body += `${needsCounter ? `$$n${id}++;` : ''}}}`;
                    // The one rule: the fallback renders when the body ran zero times, whatever the collection was.
                    if (node.fallback) {
                        body += `if(${empty}){`;
                        emitNodes(node.fallback, scope, buffer);
                        body += '}';
                    }
                    body += '}';
                    break;
                }
                case 'snippet': {
                    for (const variant of node.variants ?? []) {
                        const snippetBuffer = `$$s${++sequence}`;
                        body += `function ${variant.name}(${[...node.params, '$$url', '$$meta'].join(',')}){let ${snippetBuffer}='',$$tag=null,$$indent=0,$$skipNewline=false;`;
                        emitNodes(variant.children, scope, snippetBuffer, node.params);
                        body += `return ${snippetBuffer};}`;
                    }
                    // {@js} calls the snippet as ordinary content. It hands over no value that is being written.
                    if (node.js)
                        body += `function ${node.name}(...$$args){if($$args.length!==${node.params.length})throw new TypeError('Snippet ${node.name} takes ${node.params.length} argument${node.params.length === 1 ? '' : 's'}, JavaScript passes '+$$args.length);return ${node.js}(...$$args);}`;
                    break;
                }
                case 'render': {
                    const value = `$$v${++sequence}`;
                    // Check the complete result only if this call checked a nonempty dynamic write. Static-only results owe no checkpoint.
                    const checkpoint = `$$check${sequence}`;
                    if (node.slot?.url)
                        body += `{const ${checkpoint}=$$url.checkpoints;`;
                    else
                        body += '{';
                    body += `const ${value}=${node.specialization ?? node.name}(${[...node.arguments.map(argument => expressionCode(argument, scope)), '$$url', '$$meta'].join(',')});`;
                    body += `${written(node.slot, value, false, false, `$$url.checkpoints!==${checkpoint}`)}${buffer}+=${value};${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}`;
                    break;
                }
                case 'js':
                    body += `{const $$j=$$str(${node.awaits ? `await (async()=>{${node.code}})()` : `(()=>{${node.code}})()`});`;
                    body += `${written(node.slot, '$$j', true)}${buffer}+=$$j;${trackIndent ? '$$indent=0;$$skipNewline=false;' : ''}}`;
                    break;
                case 'partial': fail('G4002', `Partial ${JSON.stringify(node.path)} was not expanded before code generation`, node.span);
            }
        }
        for (const name of localNames)
            scope.delete(name);
    };
    // '$' is seeded as an always-in-scope root so a path rooted at exactly "$"
    // addresses the data parameter itself, not a property literally named "$".
    emitNodes(ast.children, new Set(['$']), '$$');
    body += 'return $$;';
    return { body, async: allowCode, places };
};
//# sourceMappingURL=codegen.js.map