/**
 * The HTML standard's "parse a srcset attribute", written from the standard and independent of compiler/url.ts: the URL
 * of every image candidate and the offset it begins at. Descriptors are skipped, not validated, so this names at least
 * every URL a browser can take from the list.
 */
const WHITESPACE = '\t\n\f\r '
export const candidates = (input: string): { url: string; at: number }[] => {
	const found: { url: string; at: number }[] = []
	let position = 0
	while (true) {
		while (position < input.length && (WHITESPACE.includes(input[position]!) || input[position] === ',')) position++
		if (position >= input.length) return found
		const at = position
		while (position < input.length && !WHITESPACE.includes(input[position]!)) position++
		const url = input.slice(at, position)
		if (url.endsWith(',')) { found.push({ url: url.replace(/,+$/, ''), at }); continue }
		found.push({ url, at })
		// Descriptors run to the next comma outside parentheses.
		let parenthesis = false
		while (position < input.length) {
			const char = input[position++]!
			if (parenthesis) parenthesis = char !== ')'
			else if (char === '(') parenthesis = true
			else if (char === ',') break
		}
	}
}
