import { fail, span } from './diagnostics.js';
import { parsePath } from './path.js';
const PRECEDENCE = { '??': 1, '||': 2, '&&': 3, '===': 4, '!==': 4, '>': 4, '<': 4, '>=': 4, '<=': 4 };
const ORDERED_OPERATORS = ['===', '!==', '>=', '<=', '??', '||', '&&', '>', '<'];
const splitTopLevel = (raw, separator) => {
    const positions = [];
    let quote = '', depth = 0;
    for (let i = 0; i <= raw.length - separator.length; i++) {
        const c = raw[i];
        if (quote) {
            if (c === quote && raw[i - 1] !== '\\')
                quote = '';
            continue;
        }
        if (c === "'" || c === '"') {
            quote = c;
            continue;
        }
        if (c === '(' || c === '[') {
            depth++;
            continue;
        }
        if (c === ')' || c === ']') {
            depth--;
            continue;
        }
        if (depth === 0 && raw.startsWith(separator, i)) {
            positions.push(i);
            i += separator.length - 1;
        }
    }
    return positions;
};
const trimSpan = (raw, at) => {
    let start = 0, end = raw.length;
    while (raw[start] === ' ' || raw[start] === '\t' || raw[start] === '\n' || raw[start] === '\r')
        start++;
    while (end > start && /\s/.test(raw.charAt(end - 1)))
        end--;
    return { text: raw.slice(start, end), span: span(at.source, at.start + start, at.start + end) };
};
const literal = (raw, at) => {
    if ((raw[0] === "'" && raw.at(-1) === "'") || (raw[0] === '"' && raw.at(-1) === '"')) {
        const quote = raw[0];
        const body = raw.slice(1, -1);
        if (body.includes(quote) || body.includes('\\'))
            fail('G1101', 'String literals may not contain quotes or escapes', at);
        if (/[\n\r\u2028\u2029]/.test(body))
            fail('G1105', 'String literals may not contain line breaks', at, 'Keep the literal on one line or provide the value through template data.');
        return { kind: 'literal', value: body, raw, span: at };
    }
    const first = raw.charCodeAt(0);
    if ((first === 45 || (first >= 48 && first <= 57)) && /^-?\d+(?:\.\d+)?$/.test(raw))
        return { kind: 'literal', value: Number(raw), raw, span: at };
    if (raw === 'true' || raw === 'false')
        return { kind: 'literal', value: raw === 'true', raw, span: at };
    if (raw === 'null')
        return { kind: 'literal', value: null, raw, span: at };
    if (raw === 'undefined')
        return { kind: 'literal', value: undefined, raw, span: at };
    return null;
};
const hasOuterParentheses = (raw) => {
    if (raw[0] !== '(' || raw.at(-1) !== ')')
        return false;
    let depth = 0, quote = '';
    for (let i = 0; i < raw.length; i++) {
        const char = raw[i];
        if (quote) {
            if (char === quote && raw[i - 1] !== '\\')
                quote = '';
            continue;
        }
        if (char === "'" || char === '"') {
            quote = char;
            continue;
        }
        if (char === '(')
            depth++;
        else if (char === ')') {
            depth--;
            if (depth === 0 && i !== raw.length - 1)
                return false;
            if (depth < 0)
                return false;
        }
    }
    return depth === 0 && !quote;
};
const parsePipe = (raw, at) => {
    const open = raw.indexOf('(');
    const name = (open < 0 ? raw : raw.slice(0, open)).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name))
        fail('G1102', `Invalid pipe name ${JSON.stringify(name)}`, at);
    if (open < 0)
        return { name, args: [], span: at };
    if (!raw.endsWith(')'))
        fail('G1103', `Pipe ${name} is missing its closing )`, at);
    const body = raw.slice(open + 1, -1);
    const commaPositions = splitTopLevel(body, ',');
    const args = [];
    let start = 0;
    for (const end of [...commaPositions, body.length]) {
        const chunk = body.slice(start, end);
        const argAt = span(at.source, at.start + open + 1 + start, at.start + open + 1 + end);
        if (chunk.trim())
            args.push(parseExpression(chunk, argAt));
        else
            fail('G1104', `Empty argument in pipe ${name}`, argAt);
        start = end + 1;
    }
    return { name, args, span: at };
};
const parseCore = (rawInput, atInput) => {
    const { text: raw, span: at } = trimSpan(rawInput, atInput);
    if (!raw)
        fail('G1100', 'Expected an expression', at);
    if (hasOuterParentheses(raw))
        return parseCore(raw.slice(1, -1), span(at.source, at.start + 1, at.end - 1));
    const literalNode = literal(raw, at);
    if (literalNode)
        return literalNode;
    // The dominant template expression is a plain path. Avoid the operator
    // scanner entirely when no operator-leading character occurs.
    if (!/[?&|=!<>]/.test(raw))
        return parsePath(raw, at);
    let selected = null;
    let quote = '', depth = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw[i];
        if (quote) {
            if (char === quote && raw[i - 1] !== '\\')
                quote = '';
            continue;
        }
        if (char === "'" || char === '"') {
            quote = char;
            continue;
        }
        if (char === '(' || char === '[') {
            depth++;
            continue;
        }
        if (char === ')' || char === ']') {
            depth--;
            continue;
        }
        if (depth !== 0)
            continue;
        const operator = ORDERED_OPERATORS.find(candidate => raw.startsWith(candidate, i));
        if (!operator)
            continue;
        const precedence = PRECEDENCE[operator];
        if (!selected || precedence < selected.precedence || (precedence === selected.precedence && i > selected.position))
            selected = { operator, position: i, precedence };
        i += operator.length - 1;
    }
    if (selected) {
        const { operator, position } = selected;
        const leftAt = span(at.source, at.start, at.start + position);
        const rightAt = span(at.source, at.start + position + operator.length, at.end);
        return { kind: 'binary', operator, left: parseCore(raw.slice(0, position), leftAt), right: parseCore(raw.slice(position + operator.length), rightAt), span: at };
    }
    // ! binds tighter than every binary operator, as in JavaScript: it is taken only once none is left at the top level
    if (raw.startsWith('!')) {
        const operandAt = span(at.source, at.start + 1, at.end);
        const node = { kind: 'unary', operator: '!', operand: parseCore(raw.slice(1), operandAt), span: at };
        return node;
    }
    return parsePath(raw, at);
};
export const parseExpression = (rawInput, atInput) => {
    if (!rawInput.includes('|'))
        return parseCore(rawInput, atInput);
    const pipePositions = splitTopLevel(rawInput, '|').filter(i => rawInput[i - 1] !== '|' && rawInput[i + 1] !== '|');
    if (!pipePositions.length)
        return parseCore(rawInput, atInput);
    const first = pipePositions[0] ?? fail('G1199', 'Internal pipe parser error', atInput);
    const input = parseCore(rawInput.slice(0, first), span(atInput.source, atInput.start, atInput.start + first));
    const pipes = [];
    let start = first + 1;
    for (const end of [...pipePositions.slice(1), rawInput.length]) {
        pipes.push(parsePipe(rawInput.slice(start, end).trim(), span(atInput.source, atInput.start + start, atInput.start + end)));
        start = end + 1;
    }
    const node = { kind: 'pipe', input, pipes, span: atInput };
    return node;
};
//# sourceMappingURL=expression.js.map