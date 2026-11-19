import { span } from './diagnostics.js';
/** Literal runs retain their source positions across lexer removals and strip. */
export const textSpans = (node) => node.sourceSpans ?? [node.span];
export const textPosition = (node, offset) => {
    const spans = textSpans(node);
    for (const part of spans) {
        const length = part.end - part.start;
        if (offset < length)
            return span(part.source, part.start + offset, part.start + offset + 1);
        offset -= length;
    }
    const last = spans[spans.length - 1];
    return span(last.source, last.end, last.end);
};
export const stripText = (node, final) => {
    const pattern = final ? /[ \t\n]+<|>[ \t\n]+$|\n/g : /[ \t\n]+<|\n/g;
    const spans = textSpans(node), kept = [];
    const pieces = [];
    let part = 0, sourceOffset = 0, from = 0;
    const retain = (start, end) => {
        if (start === end)
            return;
        pieces.push(node.value.slice(start, end));
        while (start < end) {
            const run = spans[part], length = run.end - run.start;
            if (start >= sourceOffset + length) {
                sourceOffset += length;
                part++;
                continue;
            }
            const to = Math.min(end, sourceOffset + length);
            kept.push(span(run.source, run.start + start - sourceOffset, run.start + to - sourceOffset));
            start = to;
        }
    };
    for (const match of node.value.matchAll(pattern)) {
        // Include the delimiter in the match for RE2, but retain its original source position.
        retain(from, match.index + (match[0].startsWith('>') ? 1 : 0));
        from = match.index + match[0].length - (match[0].endsWith('<') ? 1 : 0);
    }
    if (from === 0)
        return node;
    retain(from, node.value.length);
    return { ...node, value: pieces.join(''), sourceSpans: kept };
};
//# sourceMappingURL=text.js.map