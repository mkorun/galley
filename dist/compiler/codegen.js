import { fail } from './diagnostics.js';
/**
 * The check of what a render writes into a URL attribute, as the generated render function runs it. Next to each
 * buffer, the function keeps what it wrote since the last `<` (the buffer's name and `t`), so the open tag a value is
 * written into is known without reading the buffer. When a value goes into `href`, `src`, `action`, `formaction`,
 * `poster`, `cite` or `xlink:href`, the attribute's value with it, read as a browser reads a URL (leading controls and
 * spaces dropped, tabs and newlines removed), must be relative or have the scheme http, https, mailto or tel, and
 * name no other host without a scheme (`//host`, `\\host`); anything else stops the render with error G5001. What
 * came before the value in the attribute counts, however it got there: text, other values, values written in an
 * {#if} or by a snippet.
 */
const URL_CHECK = String.raw `const $$urlTag=/^<[a-z][^\s\/>]*(?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>\x60]+))?)*\s+(href|src|action|formaction|poster|cite|xlink:href)\s*=\s*(?:"([^"]*)|'([^']*)|([^\s"'=<>\x60]*))$/i;const $$url=(t,v)=>{if(v==null||v===''||t[0]!=='<'||t.indexOf('=')<0)return v;const m=$$urlTag.exec(t);if(!m)return v;const s=(m[2]??m[3]??m[4]??'')+String(v),u=s.replace(/^[\u0000- ]+/,'').replace(/[\t\n\r]/g,'');if(/^[a-z][a-z0-9+.-]*:/i.test(u)?!/^(?:https?|mailto|tel):/i.test(u):/^[\\/][\\/]/.test(u))throw new Error('G5001: '+m[1].toLowerCase()+'='+JSON.stringify(s)+' is no URL a template may write there: a relative one, or one of http:, https:, mailto:, tel:');return v};const $$tail=(t,w)=>{w=String(w);const k=w.lastIndexOf('<');return k<0?t+w:w.slice(k)};const $$str=v=>{try{return String(v)}catch{return Object.prototype.toString.call(v)}};const $$raw=v=>v==null?v:$$str(v).replace(/[\uE000-\uE003]/g,c=>$$html[c]);`;
/** The globals the generated code calls. A template that names one for all of its render would change what it does. */
const GENERATED_GLOBALS = new Set(['String', 'Object', 'Array']);
const notGenerated = (name, at) => {
    if (GENERATED_GLOBALS.has(name))
        fail('G3007', `The name ${name} is needed by the generated code`, at);
};
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
    let code = scope.includes(path.root) ? path.root : `$${safeProperty(path.root)}`;
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
const expressionCode = (expression, scope) => {
    switch (expression.kind) {
        case 'path': return pathCode(expression, scope);
        case 'literal': return expression.raw;
        case 'unary': return `!(${expressionCode(expression.operand, scope)})`;
        case 'binary': return `(${expressionCode(expression.left, scope)}${expression.operator}${expressionCode(expression.right, scope)})`;
        case 'pipe': return expression.pipes.reduce((input, pipe) => `$$filters.${pipe.name}(${input}${pipe.args.map(arg => `,${expressionCode(arg, scope)}`).join('')})`, expressionCode(expression.input, scope));
    }
};
export const generate = (ast, options = {}) => {
    let body = "'use strict';$??={};let $$='',$$t='';";
    if (options.debug)
        body += '// [galley] AST compiler debug output\n';
    const markerOpen = '\uE000galley-meta\uE001', markerClose = '\uE002galley-meta\uE003';
    let hasContentAttribute = false, hasHrefAttribute = false;
    let sequence = 0;
    let isAsync = false;
    const emitNodes = (nodes, scope, buffer) => {
        for (const node of nodes) {
            switch (node.kind) {
                case 'text': {
                    body += `${buffer}+='${escapeJs(node.value)}';`;
                    // what was written since the last <, for URL_CHECK
                    const open = node.value.lastIndexOf('<');
                    if (open >= 0)
                        body += `${buffer}t='${escapeJs(node.value.slice(open))}';`;
                    else if (node.value)
                        body += `${buffer}t+='${escapeJs(node.value)}';`;
                    break;
                }
                case 'output': {
                    const value = `$$v${++sequence}`;
                    const expr = expressionCode(node.expression, scope);
                    if (node.emptyAttribute === 'content')
                        hasContentAttribute = true;
                    if (node.emptyAttribute === 'href')
                        hasHrefAttribute = true;
                    if (node.emptyAttribute)
                        body += `${buffer}+='${markerOpen}';`;
                    // checked before it is written, with what its open tag holds (URL_CHECK); an escaped value holds no <. The
                    // marks of stripEmptyMeta, which leave the text after this check, are written as references: no value makes one
                    if (node.raw)
                        body += `{const ${value}=$$url(${buffer}t,$$raw(${expr}))??'';${buffer}+=${value};${buffer}t=$$tail(${buffer}t,${value});}`;
                    else
                        body += `{const ${value}=${expr};if(${value}!=null){const e=$$url(${buffer}t,$$str(${value}).replace(/[&<>'"\\uE000-\\uE003]/g,c=>$$html[c]));${buffer}+=e;${buffer}t+=e;}}`;
                    if (node.emptyAttribute)
                        body += `${buffer}+='${markerClose}';`;
                    break;
                }
                case 'const':
                    notGenerated(node.name, node.span);
                    body += `const ${node.name}=(${expressionCode(node.expression, scope)}??'');`;
                    scope.push(node.name);
                    break;
                case 'if': {
                    node.branches.forEach((branch, index) => {
                        body += index === 0 ? `if(${expressionCode(branch.condition, scope)}){` : branch.condition ? `else if(${expressionCode(branch.condition, scope)}){` : 'else{';
                        emitNodes(branch.children, scope.slice(), buffer);
                        body += '}';
                    });
                    break;
                }
                case 'each': {
                    const id = ++sequence, collection = `$$l${id}`, array = `$$a${id}`, count = `$$c${id}`;
                    const metadata = node.metadata ?? new Set();
                    const needsCount = metadata.size > 0;
                    const needsCounter = metadata.has('isFirst') || metadata.has('isLast');
                    body += `{const ${collection}=${pathCode(node.collection, scope)};if(${collection}){const ${array}=Array.isArray(${collection});`;
                    if (needsCount)
                        body += `const ${count}=${array}?${collection}.length:Object.keys(${collection}).length;`;
                    const childScope = scope.slice();
                    childScope.push(node.item);
                    if (node.index)
                        childScope.push(node.index);
                    for (const name of metadata)
                        childScope.push(name);
                    if (needsCounter)
                        body += `let $$n${id}=0;`;
                    if (node.index)
                        body += `for(const [${node.index},${node.item}] of ${array}?${collection}.entries():Object.entries(${collection})){`;
                    else
                        body += `for(const ${node.item} of (${array}?${collection}:Object.values(${collection}))){`;
                    if (metadata.has('length'))
                        body += `const length=${count};`;
                    if (metadata.has('isFirst'))
                        body += `const isFirst=$$n${id}===0;`;
                    if (metadata.has('isLast'))
                        body += `const isLast=$$n${id}===${count}-1;`;
                    emitNodes(node.children, childScope, buffer);
                    body += `${needsCounter ? `$$n${id}++;` : ''}}}}`;
                    break;
                }
                case 'snippet': {
                    notGenerated(node.name, node.span);
                    const snippetBuffer = `$$s${++sequence}`;
                    body += `function ${node.name}(${node.param ?? ''}){let ${snippetBuffer}='',${snippetBuffer}t='';`;
                    const childScope = scope.slice();
                    if (node.param)
                        childScope.push(node.param);
                    emitNodes(node.children, childScope, snippetBuffer);
                    body += `return ${snippetBuffer};}`;
                    break;
                }
                case 'render': {
                    const value = `$$v${++sequence}`;
                    const call = `${node.name}(${node.argument ? expressionCode(node.argument, scope) : ''})`;
                    body += `{const ${value}=$$url(${buffer}t,${call})??'';${buffer}+=${value};${buffer}t=$$tail(${buffer}t,${value});}`;
                    break;
                }
                case 'js':
                    if (!options.allowCode)
                        fail('G4001', '{@js} cannot be generated while allowCode is false', node.span, 'Enable allowCode only for trusted templates.');
                    isAsync ||= node.awaits;
                    body += `{const $$j=(${node.awaits ? `await (async()=>{${node.code}})()` : `(()=>{${node.code}})()`}??'');${buffer}+=$$j;${buffer}t=$$tail(${buffer}t,String($$j));}`;
                    break;
                case 'partial': fail('G4002', `Partial ${JSON.stringify(node.path)} was not expanded before code generation`, node.span);
            }
        }
    };
    // '$' is seeded as an always-in-scope root so a path rooted at exactly "$"
    // addresses the data parameter itself, not a property literally named "$".
    emitNodes(ast.children, ['$'], '$$');
    // after the directive, which must stay the first statement
    body = body.replace("'use strict';", () => `'use strict';${URL_CHECK}`);
    if (options.strip)
        body += '$$=$$filters.stripWhitespace($$);';
    if (options.stripEmptyMeta !== false && hasContentAttribute)
        body += `$$=$$.replace(/[ \\t]*<meta\\b[^<>]*\\bcontent=(?:"(?:${markerOpen}|${markerClose})+"|'(?:${markerOpen}|${markerClose})+')[^<>]*\\/?>(?:\\r?\\n)?/g,'');`;
    if (options.stripEmptyMeta !== false && hasHrefAttribute)
        body += `$$=$$.replace(/[ \\t]*<link\\b[^<>]*\\bhref=(?:"(?:${markerOpen}|${markerClose})+"|'(?:${markerOpen}|${markerClose})+')[^<>]*\\/?>(?:\\r?\\n)?/g,'');`;
    if (hasContentAttribute || hasHrefAttribute)
        body += `$$=$$.split('${markerOpen}').join('').split('${markerClose}').join('');`;
    body += 'return $$;';
    return { body, async: isAsync || options.allowCode === true };
};
//# sourceMappingURL=codegen.js.map