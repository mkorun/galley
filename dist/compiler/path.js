import { fail, span } from './diagnostics.js';
const isStart = (code) => (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36;
const isSpecial = (code) => isStart(code) || (code >= 48 && code <= 57) || code === 58 || code === 43 || code === 45;
/** A numeric literal meets this check where 0.5.0 parsed it; a number in brackets meets it in checkNumber. */
export const checkLeadingZero = (raw, at) => {
    if (/^-?0\d/.test(raw))
        fail('G1106', `Number ${raw} has a leading zero`, at, `Write ${raw.replace(/^(-?)0+(\d)/, '$1$2')} without leading zeros.`);
};
/** A number the template writes, in brackets or as a literal: without a leading zero, and within Number.MAX_SAFE_INTEGER as written. */
export const checkNumber = (raw, at) => {
    checkLeadingZero(raw, at);
    // Decide on the spelling: Number() already rounds 9007199254740991.1 down to the bound.
    const [integer = '', fraction = ''] = raw.replace('-', '').split('.');
    const limit = BigInt(Number.MAX_SAFE_INTEGER);
    if (BigInt(integer) > limit || (BigInt(integer) === limit && /[^0]/.test(fraction)))
        fail('G1107', `Number ${raw} exceeds the largest safe integer, ${Number.MAX_SAFE_INTEGER}, in magnitude`, at, 'Write it as a quoted string, or pass it in template data.');
};
/** Number diagnostics come from a complete expression: they stand where a malformed one would become literal text or another diagnostic. */
export const isNumberDiagnostic = (code) => code === 'G1106' || code === 'G1107';
/** First path names and numbers are checked after parsing the complete expression, so an otherwise malformed brace stays literal under ADR-015. */
export const checkPath = (path) => {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(path.root))
        fail('G1007', `The first path name must be an identifier: ${JSON.stringify(path.root)}`, path.span, `Use $.${path.root} to reach that data key.`);
    for (const segment of path.segments) {
        if (typeof segment.value === 'object')
            checkPath(segment.value);
        else if (segment.number)
            checkNumber(segment.number.raw, segment.number.span);
    }
};
export const parsePath = (raw, at) => {
    let i = 0;
    const skip = () => { while (raw[i] === ' ' || raw[i] === '\t')
        i++; };
    const localSpan = (start, end) => span(at.source, at.start + start, at.start + end);
    const property = () => {
        const start = i;
        if (!isStart(raw.charCodeAt(i)))
            fail('G1001', `Expected a path segment, found ${JSON.stringify(raw[i] ?? 'end of expression')}`, localSpan(i, i + 1), 'Path names must begin with a letter, _ or $.');
        i++;
        while (i < raw.length && isSpecial(raw.charCodeAt(i)))
            i++;
        const value = raw.slice(start, i);
        return { value, start, end: i };
    };
    skip();
    const root = property();
    const segments = [];
    while (i < raw.length) {
        skip();
        if (raw[i] === '.') {
            i++;
            const part = property();
            segments.push({ kind: 'property', value: part.value, span: localSpan(part.start, part.end) });
            continue;
        }
        if (raw[i] === '[') {
            const start = i++;
            skip();
            if (raw[i] === "'" || raw[i] === '"') {
                const quote = raw[i++];
                const valueStart = i;
                while (i < raw.length && raw[i] !== quote && raw[i] !== '\\')
                    i++;
                if (raw[i] !== quote)
                    fail('G1003', 'Unclosed or escaped bracket string is not supported', localSpan(start, i), 'Use a plain quoted key without escapes.');
                const value = raw.slice(valueStart, i++);
                skip();
                if (raw[i++] !== ']')
                    fail('G1004', 'Expected ] after bracket key', localSpan(start, i));
                segments.push({ kind: 'computed', value, span: localSpan(start, i) });
                continue;
            }
            const innerStart = i;
            while (i < raw.length && raw[i] !== ']')
                i++;
            if (i >= raw.length)
                fail('G1005', 'Unclosed bracket path', localSpan(start, raw.length));
            const inner = raw.slice(innerStart, i).trim();
            const innerOffset = raw.indexOf(inner, innerStart);
            i++;
            if (/^-?\d+$/.test(inner)) {
                segments.push({ kind: 'computed', value: Number(inner), span: localSpan(start, i), number: { raw: inner, span: localSpan(innerOffset, innerOffset + inner.length) } });
            }
            else {
                segments.push({ kind: 'computed', value: parsePath(inner, localSpan(innerOffset, innerOffset + inner.length)), span: localSpan(start, i) });
            }
            continue;
        }
        break;
    }
    skip();
    if (i !== raw.length)
        fail('G1006', `Unexpected ${JSON.stringify(raw.slice(i))} after path`, localSpan(i, raw.length), 'Function calls and arbitrary JavaScript are not valid galley paths.');
    return { kind: 'path', root: root.value, segments, span: at };
};
//# sourceMappingURL=path.js.map