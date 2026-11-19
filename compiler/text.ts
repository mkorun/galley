import type { TextNode } from './ast.js'
import { span } from './diagnostics.js'
import type { SourceSpan } from './types.js'

/** Literal runs retain their source positions across lexer removals and strip. */
export const textSpans = (node: TextNode): readonly SourceSpan[] => node.sourceSpans ?? [node.span]

export const textPosition = (node: TextNode, offset: number): SourceSpan => {
	const spans = textSpans(node)
	for (const part of spans) {
		const length = part.end - part.start
		if (offset < length) return span(part.source, part.start + offset, part.start + offset + 1)
		offset -= length
	}
	const last = spans[spans.length - 1]!
	return span(last.source, last.end, last.end)
}

export const stripText = (node: TextNode, final: boolean): TextNode => {
	const pattern = final ? /[ \t\n]+<|>[ \t\n]+$|\n/g : /[ \t\n]+<|\n/g
	const spans = textSpans(node), kept: SourceSpan[] = []
	const pieces: string[] = []
	let part = 0, sourceOffset = 0, from = 0
	const retain = (start: number, end: number): void => {
		if (start === end) return
		pieces.push(node.value.slice(start, end))
		while (start < end) {
			const run = spans[part]!, length = run.end - run.start
			if (start >= sourceOffset + length) { sourceOffset += length; part++; continue }
			const to = Math.min(end, sourceOffset + length)
			kept.push(span(run.source, run.start + start - sourceOffset, run.start + to - sourceOffset))
			start = to
		}
	}
	for (const match of node.value.matchAll(pattern)) {
		// Include the delimiter in the match for RE2, but retain its original source position.
		retain(from, match.index + (match[0].startsWith('>') ? 1 : 0))
		from = match.index + match[0].length - (match[0].endsWith('<') ? 1 : 0)
	}
	if (from === 0) return node
	retain(from, node.value.length)
	return { ...node, value: pieces.join(''), sourceSpans: kept }
}
