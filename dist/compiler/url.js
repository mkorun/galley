const SCHEMES = ['http', 'https', 'mailto', 'tel'];
const TAB = 9, LF = 10, CR = 13, SPACE = 32, AMPERSAND = 38, PLUS = 43, MINUS = 45, PERIOD = 46, SLASH = 47, COLON = 58, BACKSLASH = 92;
const isLetter = (code) => (code >= 97 && code <= 122) || (code >= 65 && code <= 90);
const isDigit = (code) => code >= 48 && code <= 57;
export class UrlPrefix {
    attribute;
    mode = 'leading';
    /** Characters of the scheme candidate that some allowed scheme still matches, and a bit per such scheme. */
    schemeLength = 0;
    schemes = (1 << SCHEMES.length) - 1;
    chunks = [];
    /** Nonempty dynamic writes checked so far, including completed dynamic snippet results. */
    checkpoints = 0;
    constructor(attribute) {
        this.attribute = attribute;
    }
    /** No later character can make the value another scheme's URL or one that starts with two slashes. */
    get settled() { return this.mode === 'relative' || this.mode === 'allowed'; }
    get forbidden() { return this.mode === 'forbidden'; }
    /** One character of the value as the browser reads it, without decoding. */
    read(code) {
        if (code === TAB || code === LF || code === CR)
            return;
        if (this.mode === 'leading') {
            if (code <= SPACE)
                return;
            if (code === SLASH || code === BACKSLASH) {
                this.mode = 'slash';
                return;
            }
            if (!isLetter(code)) {
                this.mode = 'relative';
                return;
            }
            this.mode = 'scheme';
        }
        else if (this.mode === 'slash') {
            this.mode = code === SLASH || code === BACKSLASH ? 'forbidden' : 'relative';
            return;
        }
        if (this.mode !== 'scheme')
            return;
        if (code === COLON) {
            let allowed = false;
            for (let index = 0; index < SCHEMES.length; index++)
                allowed ||= (this.schemes & (1 << index)) !== 0 && SCHEMES[index].length === this.schemeLength;
            this.mode = allowed ? 'allowed' : 'forbidden';
        }
        else if (isLetter(code) || isDigit(code) || code === PLUS || code === MINUS || code === PERIOD) {
            // `| 32` lowers a letter and leaves digits, +, - and . as they are.
            for (let index = 0; index < SCHEMES.length; index++)
                if (SCHEMES[index].charCodeAt(this.schemeLength) !== (code | 32))
                    this.schemes &= ~(1 << index);
            // Once no allowed scheme can match, the length need not grow.
            if (this.schemes)
                this.schemeLength++;
        }
        else
            this.mode = 'relative';
    }
    /** Escaped output's & begins one of the five HTML escapes and cannot continue a scheme. */
    feed(text, escaped = false) {
        if (text === '' || this.settled)
            return;
        this.chunks.push(text);
        if (this.mode === 'forbidden' || this.mode === 'undecided')
            return;
        for (let index = 0; index < text.length && !this.settled; index++) {
            const code = text.charCodeAt(index);
            if (code === AMPERSAND && !escaped) {
                this.mode = 'undecided';
                return;
            }
            this.read(code === 0 ? 0xfffd : code);
        }
    }
    check(nonempty) {
        if (!nonempty)
            return;
        this.checkpoints++;
        if (this.settled)
            return;
        if (this.mode === 'forbidden' || this.mode === 'undecided')
            throw new Error('G5001: ' + this.attribute + '=' + JSON.stringify(this.chunks.join('')) + ' is no URL a template may write there: ' + (this.mode === 'undecided' ? '& before a settled prefix is undecided' : 'a relative one, or one of http:, https:, mailto:, tel:'));
    }
}
//# sourceMappingURL=url.js.map