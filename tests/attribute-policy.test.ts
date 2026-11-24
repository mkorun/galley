import { expect, spyOn, test } from 'bun:test'
import galley from '../index.js'
import { UrlPrefix } from '../compiler/url.js'

type Options = NonNullable<Parameters<typeof galley>[1]>
const render = async (source: string, data: object = {}, options: Options = {}): Promise<string> => (await galley(source, options)).render(data)
const refuse = async (source: string, code: string, options: Options = {}): Promise<void> => {
	await expect(galley(source, options), source).rejects.toThrow(code)
}
const stop = async (source: string, data: object, options: Options = {}): Promise<void> => {
	await expect(render(source, data, options), source).rejects.toThrow('G5001')
}

test('rule 16: no template tag of any kind stands in an on* attribute or in srcdoc', async () => {
	const options = { allowCode: true, includes: { import: async () => 'x' } }
	for (const attribute of ['onclick', 'onload', 'ONCLICK', 'onbegin', 'on', 'once', 'srcdoc', 'SrcDoc']) {
		for (const value of ['{ x }', 'go(\'{ x }\')', '{@raw x}', '{#if p}a(){:else}b(){/if}', '{#each xs as x}a{/each}', '{@render s()}', '{@partial p.sort}', '{@js}return "x"{@js}', '{@const x = 1}', '{#snippet unused()}x{/snippet}']) {
			await refuse(`{#snippet s()}x{/snippet}<a ${attribute}="${value}">`, 'G3017', options)
		}
		await refuse(`<a ${attribute}='{ x }'>`, 'G3017')
		await refuse(`<a ${attribute}={ x }>`, 'G3017')
		// A block may not open such a value and leave it to the text after it.
		await refuse(`<a {#if p}${attribute}="x{/if}">`, 'G3017')
		expect(await render(`<a ${attribute}="go('x')" title="{ t }">`, { t: 'T' })).toBe(`<a ${attribute}="go('x')" title="T">`)
	}
	for (const source of ['<svg onload="{ x }"></svg>', '<math><mi onclick="{ x }"></mi></math>', '<iframe srcdoc="<p>{ x }</p>"></iframe>']) await refuse(source, 'G3017')
	await refuse('<a onclick="x" {@partial p.sort}>', 'G3017', { includes: { import: async () => ' onfocus="{ x }"' } })
})

test('rule 16: other attributes, whole attributes in a block, and the animation rule stay as they were', async () => {
	for (const attribute of ['title', 'data-on', 'data-onclick', 'x-on:click', 'no', 'o', 'srcdocs', 'data-srcdoc']) expect(await render(`<a ${attribute}="{ x }">`, { x: 'v' })).toBe(`<a ${attribute}="v">`)
	const whole = '<a{#if p} onclick="a()"{:else} onclick="b()"{/if}>'
	expect(await render(whole, { p: true })).toBe('<a onclick="a()">')
	expect(await render(whole, { p: false })).toBe('<a onclick="b()">')
	expect(await render('<button data-id="{ id }" onclick="go(this.dataset.id)">', { id: '\');x(\'' })).toBe('<button data-id="&apos;);x(&apos;" onclick="go(this.dataset.id)">')
	await refuse('<svg><set to="{ x }"/></svg>', 'G3016')
	await refuse('<svg><set onbegin="{ x }"/></svg>', 'G3017')
})

test('URL lists: every piece that follows the start, whitespace or a comma is admitted like a URL of its own', async () => {
	for (const attribute of ['srcset', 'imagesrcset']) {
		const source = `<img ${attribute}="{ list }">`
		for (const list of ['/a.png', '/a.png 1x, /b.png 2x', 'a.png 640w,b.png 1280w', 'https://cdn.example/a.png 1.5x', 'HTTPS://cdn.example/a,b.png', '', 'a.png, b.png', '/a?x=1&y=2 1x', 'mailto:x', '\u00a0javascript:x']) {
			expect(await render(source, { list })).toBe(`<img ${attribute}="${list.replace(/&/g, '&amp;')}">`)
		}
		for (const list of ['javascript:x', 'data:image/png;base64,AA==', '//cdn.example/a.png', '\\\\cdn.example/a.png', ' javascript:x', '\u0001javascript:x', 'java\tscript:x',
			'/a.png 1x, javascript:x 2x', '/a.png 1x,javascript:x', '/a.png,javascript:x', '/a.png 1x, //cdn.example/b.png', '/a.png javascript:x', '/a.png (a, javascript:x) 1x', ', javascript:x']) await stop(source, { list })
		for (const separator of [' ', ',', '\t', '\n', '\f', '\r']) await stop(source, { list: `/a.png${separator}javascript:x` })
	}
	// One URL attribute still holds one URL: a separator begins nothing there.
	expect(await render('<a href="{ u }">', { u: '/a.png, javascript:x' })).toBe('<a href="/a.png, javascript:x">')
})

test('URL lists: static and dynamic pieces are one list, across blocks, loops and snippets', async () => {
	const pattern = '<img srcset="/img/{ name }-640.webp 640w, /img/{ name }-1280.webp 1280w">'
	expect(await render(pattern, { name: 'cover' })).toBe('<img srcset="/img/cover-640.webp 640w, /img/cover-1280.webp 1280w">')
	await stop(pattern, { name: 'x 1x, javascript:x' })
	const loop = '<img srcset="{#each sources as s}{ s.url } { s.width }w, {/each}/fallback.png">'
	expect(await render(loop, { sources: [{ url: '/a.png', width: 640 }, { url: 'https://cdn.example/b.png', width: 1280 }] })).toBe('<img srcset="/a.png 640w, https://cdn.example/b.png 1280w, /fallback.png">')
	await stop(loop, { sources: [{ url: '/a.png', width: 640 }, { url: 'data:x', width: 1280 }] })
	await stop(loop, { sources: [{ url: '/a.png', width: '1w, javascript:x' }] })
	// A piece is judged whole: its beginning may be static, written earlier, or written by a snippet.
	await stop('<img srcset="/a.png 1x, java{ rest } 2x">', { rest: 'script:x' })
	await stop('<img srcset="/a.png 1x, { a }script:x 2x">', { a: 'java' })
	await stop('<img srcset="/a.png 1x, { a }{ b } 2x">', { a: 'java', b: 'script:x' })
	await stop('{#snippet piece(v)}{ v }script:x{/snippet}<img srcset="/a.png 1x, {@render piece(a)} 2x">', { a: 'java' })
	expect(await render('<img srcset="/a.png 1x, { a }script 2x">', { a: 'java' })).toBe('<img srcset="/a.png 1x, javascript 2x">')
	// A forbidden piece is not forgotten at the next separator.
	await stop('<img srcset="{ a } 1x, /b.png 2x, { c }">', { a: 'data:x', c: '/c.png' })
})

test('URL lists: a value nothing is written into stays the author\'s; a forbidden static piece beside a write is refused', async () => {
	for (const source of ['<img srcset="data:image/png;base64,AA== 1x, //cdn.example/b.png 2x">', '<img srcset="/a.png?x=1&amp;y=2 1x">', '<img srcset="/a.png 1x{#if p}, //cdn.example/b.png 2x{/if}">']) {
		expect(await render(source, { p: true })).toBe(source.replace('{#if p}', '').replace('{/if}', ''))
	}
	for (const source of ['<img srcset="//cdn.example/{ file } 1x">', '<img srcset="/a.png 1x, data:{ rest }">', '<img srcset="javascript:x 1x, { other }">']) await refuse(source, 'G3015')
	expect(await render('<img srcset="/a.png 1x, { other }">', { other: '/b.png 2x' })).toBe('<img srcset="/a.png 1x, /b.png 2x">')
})

test('URL lists: a character reference could stand for a separator, so none stands in the static text of a written value', async () => {
	for (const source of [
		'<img srcset="/a.png?x=1&amp;y={ v } 1x">',
		'<img srcset="/a.png&#44;&#32;{ v }">',
		'<img srcset="{ v } 1x, /b.png?x=1&amp;y=2 2x">',
		'<img srcset="{ v }&#44;&#32;{ w }">',
		'<img srcset="{#if p}{ v }{/if}&Tab;x">',
		"<img srcset='{ v }{#if p}a{:else}&comma;{/if}'>",
	]) await refuse(source, 'G3015')
	// The refusal points at the reference.
	const source = '<img srcset="{ v } 1x,\n /b.png?x=1&amp;y=2 2x">'
	await expect(galley(source)).rejects.toThrow('<template>:2:12')
	await expect(galley(source)).rejects.toThrow('Move query text into an escaped value')
	// From an escaped value, & is the character itself; raw output is judged when written.
	expect(await render('<img srcset="{ v }">', { v: '/a.png?x=1&y=2 1x' })).toBe('<img srcset="/a.png?x=1&amp;y=2 1x">')
	await stop('<img srcset="{@raw v}">', { v: '/a.png&#44;&#32;javascript:x' })
	await stop('<img srcset="{@raw r}{ v }">', { r: '/a.png&#44;&#32;', v: 'javascript:x' })
	await stop('<img srcset="{@raw r}{ v }">', { r: '/a.png?x=1&amp;y=2 1x, ', v: '/b.png' })
	// A snippet's static text is read in the value it is rendered into: the same refusal, at the snippet.
	await refuse('{#snippet s(v)}{ v }&amp;x{/snippet}<img srcset="{@render s(u)}">', 'G3015')
	expect(await render('{#snippet s(v)}{ v }&amp;x{/snippet}<p title="{@render s(u)}">{@render s(u)}</p>', { u: 'a' })).toBe('<p title="a&amp;x">a&amp;x</p>')
	// In one URL a reference after a settled start stays allowed, as at HEAD.
	expect(await render('<a href="/x?a=1&amp;b={ v }">', { v: 'x' })).toBe('<a href="/x?a=1&amp;b=x">')
})

test('URL lists: the check restarts a piece at exactly six separators, and a forbidden piece stays forbidden', () => {
	for (let code = 0; code < 128; code++) {
		const char = String.fromCharCode(code)
		const list = new UrlPrefix('srcset'), single = new UrlPrefix('href')
		list.feed('/ok' + char + 'javascript:x'); single.feed('/ok' + char + 'javascript:x')
		expect(() => single.check(true), JSON.stringify(char)).not.toThrow()
		if (' ,\t\n\f\r&'.includes(char)) expect(() => list.check(true), JSON.stringify(char)).toThrow('G5001')
		else expect(() => list.check(true), JSON.stringify(char)).not.toThrow()
	}
	const list = new UrlPrefix('srcset')
	expect(list.settled).toBe(false)
	list.feed('/a.png 1x, https://cdn.example/b.png 2x'); expect(list.settled).toBe(false); expect(list.forbidden).toBe(false)
	list.feed(', htt'); list.check(true); list.feed('px:'); expect(list.forbidden).toBe(true)
	list.feed(' /ok.png'); expect(list.forbidden).toBe(true)
	const scheme = new UrlPrefix('srcset')
	scheme.feed('javascript, x:'); expect(scheme.forbidden).toBe(true)
	const restarted = new UrlPrefix('srcset')
	restarted.feed('ftp tel:1 mailto:x https://x http://x'); expect(() => restarted.check(true)).not.toThrow()
})

test('URL lists: the check does linear work, by count: no character of a value is searched or read twice', () => {
	// The skip in UrlPrefix.feed searches for the end of a settled piece. Counted here without a counter in the checker:
	// the characters every regular-expression search covers, and the characters the checker reads.
	const work = (feeds: readonly string[]): number => {
		const list = new UrlPrefix('srcset'), reads = spyOn(list as unknown as { read(code: number): void }, 'read')
		const search = RegExp.prototype.test
		let searched = 0
		const searches = spyOn(RegExp.prototype, 'test').mockImplementation(function (this: RegExp, text: string): boolean {
			const from = this.lastIndex, found = search.call(this, text)
			searched += (found ? this.lastIndex : text.length) - from
			return found
		})
		try { for (const text of feeds) { list.feed(text, true); list.check(true) } } finally { searches.mockRestore() }
		return searched + reads.mock.calls.length
	}
	for (const length of [1000, 2000, 4000, 8000]) {
		// One long settled piece and its separator; many short pieces; one long piece written in many parts.
		for (const feeds of [['/' + 'a'.repeat(length) + ' '], ['/a '.repeat(length)], Array.from({ length }, () => 'ab'), ['https://h/' + 'a,'.repeat(length)]]) {
			const characters = feeds.reduce((sum, text) => sum + text.length, 0)
			expect(work(feeds), `${feeds.length} writes, ${characters} characters`).toBeLessThanOrEqual(2 * characters)
		}
	}
})

test('what the surviving mutants asked for: the rule in the message, the end of the searched text, imagesrcset by name', async () => {
	// A refusal names its rule: 16 for on* and srcdoc, 15 for an animation value.
	await refuse('<a onclick="{ x }">', 'rule 16')
	await refuse('<svg><set to="{ x }"/></svg>', 'rule 15')
	// Only the value's own static text is searched for a reference: one after its closing quote belongs to another attribute.
	expect(await render('<img srcset="{ v } 1x" alt="a &amp; b">', { v: '/a.png' })).toBe('<img srcset="/a.png 1x" alt="a &amp; b">')
	// imagesrcset by its name, not by reading the set under test.
	await stop('<link rel="preload" as="image" imagesrcset="{ list }">', { list: '/a.png 1x, javascript:x 2x' })
	await refuse('<link rel="preload" as="image" imagesrcset="/a.png?x=1&amp;y={ v } 1x">', 'G3015')
})


test('B3: a forbidden single URL keeps that reason when a raw reference follows in the same write', async () => {
	for (const [source, data] of [
		['<a href="{@raw u}">', { u: 'javascript:&x' }],
		['<a href="{ u }">', { u: 'javascript:&x' }],
		['<a href="{@raw u}{@raw rest}">', { u: 'javascript:', rest: '&x' }],
	] as const) {
		const error = await render(source, data).catch(error => error)
		expect(error).toBeInstanceOf(Error)
		expect(error.message).toContain('G5001: href=')
		expect(error.message).toContain('a relative one, or one of http:, https:, mailto:, tel:')
		expect(error.message).not.toContain('undecided')
	}
})
