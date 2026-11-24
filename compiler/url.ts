/** Targeted attribute-prefix admission, never an HTML parser. */
type Mode = 'leading' | 'slash' | 'scheme' | 'relative' | 'allowed' | 'forbidden' | 'undecided'
const SCHEMES = ['http', 'https', 'mailto', 'tel']
const TAB = 9, LF = 10, FF = 12, CR = 13, SPACE = 32, AMPERSAND = 38, PLUS = 43, COMMA = 44, MINUS = 45, PERIOD = 46, SLASH = 47, COLON = 58, BACKSLASH = 92
/** Attributes that hold a list of URLs. A browser begins a URL of the list only at its start, after whitespace or after a comma. */
export const URL_LISTS: ReadonlySet<string> = new Set(['srcset', 'imagesrcset'])
/** A list separator or the beginning of a character reference: what can end a piece of a list. */
const PIECE_END = /[\t\n\f\r ,&]/g
const isListSeparator = (code: number): boolean => code === SPACE || code === COMMA || code === TAB || code === LF || code === FF || code === CR
const isLetter = (code: number): boolean => (code >= 97 && code <= 122) || (code >= 65 && code <= 90)
const isDigit = (code: number): boolean => code >= 48 && code <= 57
export class UrlPrefix {
	private mode: Mode = 'leading'
	/** Characters of the scheme candidate that some allowed scheme still matches, and a bit per such scheme. */
	private schemeLength = 0
	private schemes = (1 << SCHEMES.length) - 1
	private readonly chunks: string[] = []
	/** Nonempty dynamic writes checked so far, including completed dynamic snippet results. */
	checkpoints = 0
	/** In a list, every piece between separators is admitted like a URL of its own. */
	private readonly list: boolean
	constructor(readonly attribute: string) { this.list = URL_LISTS.has(attribute) }

	/** No later character can make the value another scheme's URL or one that starts with two slashes. A list never settles: its next piece may. */
	get settled(): boolean { return !this.list && (this.mode === 'relative' || this.mode === 'allowed') }

	get forbidden(): boolean { return this.mode === 'forbidden' }

	/** One character of the value as the browser reads it, without decoding. */
	private read(code: number): void {
		if (code === TAB || code === LF || code === CR) return
		if (this.mode === 'leading') {
			if (code <= SPACE) return
			if (code === SLASH || code === BACKSLASH) { this.mode = 'slash'; return }
			if (!isLetter(code)) { this.mode = 'relative'; return }
			this.mode = 'scheme'
		} else if (this.mode === 'slash') {
			this.mode = code === SLASH || code === BACKSLASH ? 'forbidden' : 'relative'
			return
		}
		if (this.mode !== 'scheme') return
		if (code === COLON) {
			let allowed = false
			for (let index = 0; index < SCHEMES.length; index++) allowed ||= (this.schemes & (1 << index)) !== 0 && SCHEMES[index]!.length === this.schemeLength
			this.mode = allowed ? 'allowed' : 'forbidden'
		} else if (isLetter(code) || isDigit(code) || code === PLUS || code === MINUS || code === PERIOD) {
			// `| 32` lowers a letter and leaves digits, +, - and . as they are.
			for (let index = 0; index < SCHEMES.length; index++) if (SCHEMES[index]!.charCodeAt(this.schemeLength) !== (code | 32)) this.schemes &= ~(1 << index)
			// Once no allowed scheme can match, the length need not grow.
			if (this.schemes) this.schemeLength++
		} else this.mode = 'relative'
	}

	/** Escaped output's & begins one of the five HTML escapes and cannot continue a scheme. */
	feed(text: string, escaped = false): void {
		if (text === '' || this.settled) return
		this.chunks.push(text)
		if (this.mode === 'forbidden' || this.mode === 'undecided') return
		for (let index = 0; index < text.length && !this.settled; index++) {
			let code = text.charCodeAt(index)
			// Only a list comes here with a piece that is settled: of the rest of that piece, a separator or a reference matters, nothing else.
			if (this.mode === 'relative' || this.mode === 'allowed') {
				PIECE_END.lastIndex = index
				if (!PIECE_END.test(text)) return
				index = PIECE_END.lastIndex - 1; code = text.charCodeAt(index)
			}
			if (code === AMPERSAND && !escaped) { this.mode = 'undecided'; return }
			if (this.list && isListSeparator(code)) { this.mode = 'leading'; this.schemeLength = 0; this.schemes = (1 << SCHEMES.length) - 1; continue }
			this.read(code === 0 ? 0xfffd : code)
			// A forbidden piece stays forbidden: no later separator begins the value anew.
			if (this.forbidden) return
		}
	}

	check(nonempty: boolean): void {
		if (!nonempty) return
		this.checkpoints++
		if (this.settled) return
		if (this.mode === 'forbidden' || this.mode === 'undecided') throw new Error('G5001: ' + this.attribute + '=' + JSON.stringify(this.chunks.join('')) + ' is no URL a template may write there: ' + (this.mode === 'undecided' ? '& before a settled prefix is undecided' : 'a relative one, or one of http:, https:, mailto:, tel:'))
	}
}
