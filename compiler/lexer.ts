import type { SourceFile, SourceSpan } from './types.js'
import { span } from './diagnostics.js'

export type TokenKind = 'text' | 'expression' | 'block-open' | 'continuation' | 'block-close' | 'directive' | 'js'
export interface Token { readonly kind: TokenKind; readonly value: string; readonly valueStart: number; readonly span: SourceSpan }

const isIdentifierStart = (code: number): boolean =>
	(code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36

// Deliberately cursor-based: no lookarounds, backreferences, or regex engine dependency.
export const lex = (source: SourceFile): readonly Token[] => {
	const tokens: Token[] = []
	const text = source.text
	let cursor = 0
	let nextBrace = text.indexOf('{'), nextAngle = text.indexOf('<')
	let textStart = 0
	let lineIsWhitespace = true
	let lineStart = 0, newline = -1, nextNewline = text.indexOf('\n')
	const inspectLine = (): boolean => {
		while (nextNewline >= 0 && nextNewline < cursor) {
			newline = nextNewline; nextNewline = text.indexOf('\n', newline + 1)
		}
		// Newlines inside a removed config do not move the beginning of the emitted line.
		if (newline >= textStart) {
			lineStart = newline + 1
			return text.slice(lineStart, cursor).trim() === ''
		}
		return lineIsWhitespace && text.slice(textStart, cursor).trim() === ''
	}
	const configEnd = (at: number): number => {
		if (!text.startsWith('<galley:config>', at)) return -1
		const close = text.indexOf('</galley:config>', at + 15)
		return close < 0 ? -1 : close + 16
	}
	const pushText = (end: number) => {
		if (end > textStart) tokens.push({ kind: 'text', value: text.slice(textStart, end), valueStart: textStart, span: span(source, textStart, end) })
	}
	while (cursor < text.length) {
		const current = text.charCodeAt(cursor)
		if (current !== 123 && current !== 60) {
			if (nextBrace >= 0 && nextBrace < cursor) nextBrace = text.indexOf('{', cursor + 1)
			if (nextAngle >= 0 && nextAngle < cursor) nextAngle = text.indexOf('<', cursor + 1)
			const brace = nextBrace, angle = nextAngle
			if (brace < 0) cursor = angle < 0 ? text.length : angle
			else cursor = angle < 0 ? brace : Math.min(brace, angle)
			continue
		}
		const config = configEnd(cursor)
		if (config >= 0) {
			pushText(cursor)
			lineIsWhitespace = inspectLine()
			cursor = config; textStart = cursor; continue
		}

		if (text.startsWith('<!--', cursor)) {
			const close = text.indexOf('-->', cursor + 4)
			if (close >= 0 && inspectLine()) {
				let after = close + 3
				while (true) {
					while (text[after] === ' ' || text[after] === '\t') after++
					const config = configEnd(after)
					if (config < 0) break
					after = config
				}
				if (after === text.length || text[after] === '\n' || (text[after] === '\r' && text[after + 1] === '\n')) {
					const end = after === text.length ? Math.max(0, lineStart - (text[lineStart - 2] === '\r' ? 2 : 1)) : lineStart
					pushText(end)
					// A removed config may already have emitted this line's indentation or preceding newline.
					while (tokens.length) {
						const last = tokens[tokens.length - 1]!
						if (last.kind !== 'text' || last.span.end <= end) break
						if (last.valueStart < end) { tokens[tokens.length - 1] = { ...last, value: last.value.slice(0, end - last.valueStart), span: span(source, last.valueStart, end) }; break }
						tokens.pop()
					}
					if (text[after] === '\r') after += 2
					else if (text[after] === '\n') after++
					cursor = after; textStart = after; lineIsWhitespace = true; lineStart = after; continue
				}
			}
		}
		if (current !== 123) { cursor++; continue }
		if (cursor > 0 && text.charCodeAt(cursor - 1) === 92) {
			pushText(cursor - 1)
			textStart = cursor
			cursor++
			continue
		}
		if (text.startsWith('{@js}', cursor)) {
			const close = text.indexOf('{@js}', cursor + 5)
			if (close < 0) { cursor++; continue }
			pushText(cursor)
			const end = close + 5
			tokens.push({ kind: 'js', value: text.slice(cursor + 5, close), valueStart: cursor + 5, span: span(source, cursor, end) })
			cursor = end; textStart = end; lineIsWhitespace = false; continue
		}
		let kind: TokenKind | null = null
		let contentStart = cursor + 1
		const sigil = text.charCodeAt(cursor + 1)
		if (sigil === 35) { kind = 'block-open'; contentStart++ }
		else if (sigil === 58) { kind = 'continuation'; contentStart++ }
		else if (sigil === 47) { kind = 'block-close'; contentStart++ }
		else if (sigil === 64) { kind = 'directive'; contentStart++ }
		else {
			let p = contentStart
			while (text.charCodeAt(p) === 32 || text.charCodeAt(p) === 9) p++
			if (isIdentifierStart(text.charCodeAt(p))) kind = 'expression'
		}
		if (!kind) { cursor++; continue }
		const close = text.indexOf('}', contentStart)
		if (close < 0) { cursor++; continue }
		pushText(cursor)
		let valueStart = contentStart, valueEnd = close
		while (valueStart < valueEnd && /\s/.test(text.charAt(valueStart))) valueStart++
		while (valueEnd > valueStart && /\s/.test(text.charAt(valueEnd - 1))) valueEnd--
		tokens.push({ kind, value: text.slice(valueStart, valueEnd), valueStart, span: span(source, cursor, close + 1) })
		cursor = close + 1; textStart = cursor; lineIsWhitespace = false
	}
	pushText(text.length)
	return tokens
}
