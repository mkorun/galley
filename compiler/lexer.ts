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
	let textStart = 0
	const pushText = (end: number) => {
		if (end > textStart) tokens.push({ kind: 'text', value: text.slice(textStart, end), valueStart: textStart, span: span(source, textStart, end) })
	}
	while (cursor < text.length) {
		const current = text.charCodeAt(cursor)
		if (current !== 123 && current !== 60) {
			const brace = text.indexOf('{', cursor + 1)
			const angle = text.indexOf('<', cursor + 1)
			if (brace < 0) cursor = angle < 0 ? text.length : angle
			else cursor = angle < 0 ? brace : Math.min(brace, angle)
			continue
		}
		if (text.startsWith('<galley:config>', cursor)) {
			const close = text.indexOf('</galley:config>', cursor + 15)
			if (close >= 0) {
				pushText(cursor)
				cursor = close + 16; textStart = cursor; continue
			}
		}
		if (text.startsWith('<!--', cursor)) {
			const close = text.indexOf('-->', cursor + 4)
			const previousNewline = text.lastIndexOf('\n', cursor - 1)
			if (close >= 0 && text.slice(previousNewline + 1, cursor).trim() === '') {
				let after = close + 3
				while (text[after] === ' ' || text[after] === '\t') after++
				if (after === text.length || text[after] === '\n' || (text[after] === '\r' && text[after + 1] === '\n')) {
					pushText(after === text.length ? Math.max(0, previousNewline) : previousNewline + 1)
					if (text[after] === '\r') after += 2
					else if (text[after] === '\n') after++
					cursor = after; textStart = after; continue
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
			cursor = end; textStart = end; continue
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
		cursor = close + 1; textStart = cursor
	}
	pushText(text.length)
	return tokens
}
