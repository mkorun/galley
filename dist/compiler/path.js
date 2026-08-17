import { fail, span } from './diagnostics.js';
const isStart = (code) => (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36;
const isSpecial = (code) => isStart(code) || (code >= 48 && code <= 57) || code === 58 || code === 43 || code === 45;
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
            i++;
            if (/^-?\d+$/.test(inner)) {
                segments.push({ kind: 'computed', value: Number(inner), span: localSpan(start, i) });
            }
            else {
                const innerOffset = raw.indexOf(inner, innerStart);
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