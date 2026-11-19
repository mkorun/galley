/** Bounded, closed productions with independent expected output and emission traces. */
export interface Write { undecided?: boolean; attribute: string; serialized: string; cause: string }
export interface Fixture { components?: { id: string; before: string; after: string; expected: string }[]; refusal?: string; hazard?: string; id: string; source: string; data: Record<string, unknown>; expected: string; writes: Write[]; html: string; slot: string | null }
export const SEED = 0x20261117
export const escape = (value: unknown): string => value == null ? '' : String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
export const random = (seed: number): (() => number) => () => seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
const VALUES: unknown[] = ['javascript:x', '//other.example/x', '\\\\', '/\\', '\\/', 'ftp://base.example/x', 'https://other.example/x', '/tags/', '', null, undefined, [], ['e:'], { x: 1 }, '\0javascript:x', '\ufeffjavascript:x', '\u00a0javascript:x', '\ud800', '\ue000', '&Tab;javascript:x', '\tjava\nscript:x', -0, NaN, Infinity, -Infinity, '<&"\'']
const SHAPES = ['<a href="@">x</a>', '<a/href="@">x</a>', '<a title="x"/href="@">x</a>', '<a title="x"href="@">x</a>', '<a title="a < b" href="@">x</a>', "<a title='a < b' href='@'>x</a>", '<a\t\n\fHREF="@">x</a>', '<a href="/tags/@/">x</a>']
const INERT = ['', '<!-- <b x=" -->', '<script>if(a<b)t="</script>', '<title><b x="</title>', '<style><b x="</style>', '<textarea><b x="</textarea>', '<noscript><b x="</noscript>', '<![CDATA[x>']
/** Refused templates claim no successful writes or insertion slot. */
const admission = (fixture: Fixture): Fixture => fixture.refusal ? { ...fixture, writes: [], slot: null } : fixture
export const generate = (seed = SEED, count = 512): Fixture[] => {
	if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || !Number.isInteger(count) || count < 1 || count > 4096) throw new Error('Invalid seed or count')
	const next = random(seed)
	const cases: Fixture[] = []
	for (let index = 0; index < count; index++) {
		const value = VALUES[index % VALUES.length]
		const attribute = ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'][(next() >>> 16) % 7]!
		const shape = SHAPES[(next() >>> 16) % SHAPES.length]!
		const inert = INERT[(next() >>> 16) % INERT.length]!
		const mutation = index >= Math.ceil(count / 2)
		const prefix = shape.includes('/tags/') ? '/tags/' : mutation ? ['java', ' ', '&#106;', 'java&Tab;', '&#x2f;', '&tab;'][(next() >>> 16) % 6]! : ''
		const actualShape = shape.replace(/href/gi, attribute).replace('/tags/@/', '@').replace('@', prefix + '{ a }{ b }')
		const second = mutation ? VALUES[(next() >>> 16) % VALUES.length] : ''
		const a = escape(value), b = escape(second)
		const write = (serialized: string, cause: string): Write => ({ attribute, serialized, cause })
		const writes = [...(a ? [write(prefix + a, 'first')] : []), ...(b ? [write(prefix + a + b, a ? 'later-with-contribution' : 'later-without-contribution')] : [])]
		const refusal = /<a\/|["']\/?(?:href|src|action|formaction|poster|cite|xlink:href)=/.test(actualShape) || inert.startsWith('<![CDATA[') ? 'G3014' : prefix.includes('&') ? 'G3015' : undefined
		cases.push({ ...(refusal ? { refusal } : {}), id: `${mutation ? 'mutated' : 'fresh'}-${index}`, source: inert + actualShape, data: { a: value, b: second }, expected: inert + actualShape.replace('{ a }{ b }', a + b), writes, html: inert + actualShape.replace('{ a }{ b }', 'GALLEY_SLOT'), slot: attribute })
	}
	return cases.map(admission)
}

/**
 * A template shape of the correction round. `$A` is the URL attribute, `$V` the place of the two outputs. `text` is what a
 * render writes, built without galley: p and q are the conditions, n the number of loop items. A shape with `refusal`
 * must not compile; its `hazard` names the attribute in which a browser reads the value on the path with p, q and one item.
 */
interface Shape { source: string; text: (p: boolean, q: boolean, n: number) => string; refusal?: string; hazard?: string }
const when = (condition: boolean, text: string): string => condition ? text : ''
/** Block boundaries inside start tags: names that end at a boundary, and those that would run on across it. */
const BOUNDARY: Shape[] = [
	{ source: '<a{#if p} title="x"{/if} $A="$V">', text: p => `<a${when(p, ' title="x"')} $A="$V">` },
	{ source: '<a {#if p}hidden{/if} $A="$V">', text: p => `<a ${when(p, 'hidden')} $A="$V">` },
	{ source: '<a data-x {#if p}title="x"{/if} $A="$V">', text: p => `<a data-x ${when(p, 'title="x"')} $A="$V">` },
	{ source: '<a{#if p} aria-current="page"{/if}{#if q} data-u{/if} $A="$V">', text: (p, q) => `<a${when(p, ' aria-current="page"')}${when(q, ' data-u')} $A="$V">` },
	{ source: '<a{#if p} title="x"{:else} title="y"{/if}$A="$V">', refusal: 'G3014', text: p => `<a title="${p ? 'x' : 'y'}"$A="$V">` },
	{ source: '<a {#each xs as x} data-n{/each} $A="$V">', text: (_p, _q, n) => `<a ${' data-n'.repeat(n)} $A="$V">` },
	{ source: '<a hidden {#if p}title="a < b" {/if}$A="$V">', text: p => `<a hidden ${when(p, 'title="a < b" ')}$A="$V">` },
	{ source: '<a\n\t{#if p}\n\tdata-a\n\t{/if}\n\t$A="$V">', text: p => `<a\n${when(p, '\tdata-a\n')}\t$A="$V">` },
	{ source: '<a $A="$V"{#if p} data-u{/if}{#if q} class="c"{/if}>', text: (p, q) => `<a $A="$V"${when(p, ' data-u')}${when(q, ' class="c"')}>` },
	{ source: '<a {#if p}hidden {/if}$A="$V">', text: p => `<a ${when(p, 'hidden ')}$A="$V">` },
	{ source: '<a data-x {#if p}$A{/if} ="$V">', text: p => `<a data-x ${when(p, '$A')} ="$V">`, refusal: 'G3014', hazard: '$A' },
	{ source: '<a data-x{#each xs as x} $A{/each} ="$V">', text: (_p, _q, n) => `<a data-x${' $A'.repeat(n)} ="$V">`, refusal: 'G3014', hazard: '$A' },
	{ source: '<a {#if p}hidden{/if}$A="$V">', text: p => `<a ${when(p, 'hidden')}$A="$V">`, refusal: 'G3014', hazard: 'hidden$A' },
	{ source: '<a{#if p}b{/if} $A="$V">', text: p => `<a${when(p, 'b')} $A="$V">`, refusal: 'G3014', hazard: '$A' },
]
/** Snippets at the tag name and between attributes. */
const SNIPPET: Shape[] = [
	{ source: '{#snippet s(v)} title="{ v }"{/snippet}<a{@render s(t)} $A="$V">', refusal: 'G3009', text: () => '<a title="T" $A="$V">' },
	{ source: '{#snippet s(v)}title="{ v }"{/snippet}<a {@render s(t)} $A="$V">', refusal: 'G3009', text: () => '<a title="T" $A="$V">' },
	{ source: '{#snippet attrs()}$A="$V"{/snippet}<a {@render attrs()}>', refusal: 'G3009', text: () => '<a $A="$V">' },
	{ source: '{#snippet attrs()} $A="$V"{/snippet}<a{@render attrs()}>', refusal: 'G3009', text: () => '<a $A="$V">' },
	{ source: '{#snippet s()} hidden{/snippet}<a{@render s()} $A="$V"><b {@render s()}>', refusal: 'G3009', text: () => '<a hidden $A="$V"><b  hidden>' },
	{ source: '{#snippet s()}{#if p} data-p{/if}{/snippet}<a hidden{@render s()} $A="$V">', refusal: 'G3009', text: p => `<a hidden${when(p, ' data-p')} $A="$V">` },
	{ source: '{#snippet s()} $A{/snippet}<a data-x{@render s()} ="$V">', text: () => '<a data-x $A ="$V">', refusal: 'G3009', hazard: '$A' },
	{ source: '{#snippet s()}hidden{/snippet}<a {@render s()}$A="$V">', text: () => '<a hidden$A="$V">', refusal: 'G3009', hazard: 'hidden$A' },
	{ source: `{#snippet s()}ipt{/snippet}<scr {@render s()} ></scr><scr{@render s()} >var x = '<b title="';</script><a $A='$V' data-close=">">`, text: () => `<scr ipt ></scr><script >var x = '<b title="';</script><a $A='$V' data-close=">">`, refusal: 'G3009', hazard: '$A' },
	{ source: '{#snippet s()}<a{@render s()}>{/snippet}{@render s()}<a $A="$V">', text: () => '', refusal: 'G3009' },
]
/** Foreign content: what both readings treat alike renders, the rest is refused. */
const FOREIGN: Shape[] = [
	{ source: '<svg><title>{ t }</title><a $A="$V">x</a></svg>', text: () => '<svg><title>T</title><a $A="$V">x</a></svg>' },
	{ source: '<svg><style>a > b &amp; c</style></svg><a $A="$V">x</a>', text: () => '<svg><style>a > b &amp; c</style></svg><a $A="$V">x</a>' },
	{ source: '<svg/><style><b x="</style><a $A="$V">x</a>', text: () => '<svg/><style><b x="</style><a $A="$V">x</a>' },
	{ source: '<math><mi>x</mi></math><script>if(a<b)t="</script><a $A="$V">x</a>', text: () => '<math><mi>x</mi></math><script>if(a<b)t="</script><a $A="$V">x</a>' },
	{ source: '<svg><desc>d</desc><textarea>{ t }</textarea></svg><a $A="$V">x</a>', text: () => '<svg><desc>d</desc><textarea>T</textarea></svg><a $A="$V">x</a>' },
	{ source: '<svg><svg/><script>let a = 1</script></svg><title><b x="</title><a $A="$V">x</a>', text: () => '<svg><svg/><script>let a = 1</script></svg><title><b x="</title><a $A="$V">x</a>' },
	{ source: '<svg><style><b><a $A="$V">x</a></style></svg>', text: () => '<svg><style><b><a $A="$V">x</a></style></svg>', refusal: 'G3013', hazard: '$A' },
	{ source: '<svg><title><b><a $A="$V">x</a></title></svg>', text: () => '<svg><title><b><a $A="$V">x</a></title></svg>', refusal: 'G3013', hazard: '$A' },
	{ source: '<math><xmp><a $A="$V">x</a></xmp></math>', text: () => '<math><xmp><a $A="$V">x</a></xmp></math>', refusal: 'G3013', hazard: '$A' },
	{ source: `<svg><![CDATA[ > <b x=" ]]><a $A='$V'>x</a>"></svg>`, text: () => `<svg><![CDATA[ > <b x=" ]]><a $A='$V'>x</a>"></svg>`, refusal: 'G3014', hazard: '$A' },
]
const FAMILIES: [string, Shape[], number][] = [['boundary', BOUNDARY, 168], ['snippet', SNIPPET, 120], ['foreign', FOREIGN, 120]]

/** The cases of the correction round: every shape of a family in turn, with seeded attributes, conditions and values. */
export const extend = (seed = SEED): Fixture[] => {
	const next = random(seed ^ 0x5eed)
	const pick = <T>(items: readonly T[]): T => items[(next() >>> 16) % items.length]!
	const cases: Fixture[] = []
	for (const [family, shapes, count] of FAMILIES) for (let index = 0; index < count; index++) {
		const shape = shapes[index % shapes.length]!
		const attribute = pick(['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'])
		const p = pick([true, false]), q = pick([true, false]), n = pick([0, 1, 2])
		const prefix = pick(['', '', 'java', '/'])
		const first = VALUES[index % VALUES.length]
		const second = pick(VALUES)
		const a = escape(first), b = escape(second)
		const fill = (text: string, value: string): string => text.replaceAll('$A', attribute).replace('$V', () => value)
		const id = `${family}-${index}`
		const source = fill(shape.source, `${prefix}{ a }{ b }`)
		const data = { a: first, b: second, p, q, xs: Array(n).fill(1), t: 'T' }
		if (shape.refusal) {
			cases.push({ id, source, data, expected: '', writes: [], html: fill(shape.text(true, true, 1), 'GALLEY_SLOT'), slot: null, refusal: shape.refusal, ...(shape.hazard ? { hazard: fill(shape.hazard, '') } : {}) })
			continue
		}
		const write = (serialized: string, cause: string): Write => ({ attribute, serialized, cause })
		const writes = [...(a ? [write(prefix + a, 'first')] : []), ...(b ? [write(prefix + a + b, a ? 'later-with-contribution' : 'later-without-contribution')] : [])]
		cases.push({ id, source, data, expected: fill(shape.text(p, q, n), prefix + a + b), writes, html: fill(shape.text(p, q, n), 'GALLEY_SLOT'), slot: attribute })
	}
	return cases.map(admission)
}

/** JSON tags preserve undefined keys, special numbers and every UTF-16 code unit. */
export type Encoded = [string, unknown?]
export const encode = (value: unknown): Encoded => {
	if (value === undefined) return ['undefined']
	if (typeof value === 'number') return ['number', Number.isNaN(value) ? 'NaN' : Object.is(value, -0) ? '-0' : String(value)]
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return ['scalar', value]
	if (Array.isArray(value)) return ['array', value.map(encode)]
	if (typeof value === 'object') return ['object', Object.entries(value).map(([key, item]) => [key, encode(item)])]
	throw new Error('Unsupported corpus value')
}
export const decode = (input: unknown): unknown => {
	if (!Array.isArray(input) || typeof input[0] !== 'string' || input.length > 2) throw new Error('Malformed corpus record')
	const [tag, value] = input
	if (tag === 'undefined' && input.length === 1) return undefined
	if (tag === 'scalar' && (value === null || typeof value === 'string' || typeof value === 'boolean')) return value
	if (tag === 'number' && typeof value === 'string' && ['NaN', 'Infinity', '-Infinity', '-0'].includes(value)) return value === '-0' ? -0 : Number(value)
	if (tag === 'number' && typeof value === 'string' && Number.isFinite(Number(value)) && String(Number(value)) === value) return Number(value)
	if (tag === 'array' && Array.isArray(value)) return value.map(decode)
	if (tag === 'object' && Array.isArray(value)) {
		const result: Record<string, unknown> = {}
		for (const entry of value) {
			if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || Object.hasOwn(result, entry[0])) throw new Error('Malformed corpus object')
			Object.defineProperty(result, entry[0], { value: decode(entry[1]), enumerable: true, writable: true, configurable: true })
		}
		return result
	}
	throw new Error('Unknown or malformed corpus tag')
}
