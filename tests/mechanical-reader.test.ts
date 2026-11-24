import { expect, test } from 'bun:test'
import { parse } from '../compiler/parser.js'
import { readContexts } from '../compiler/context.js'
import { UrlPrefix } from '../compiler/url.js'
import { countUrlReads } from './helpers.js'

const read = (text: string) => readContexts(parse({ id: 'mechanical', text }))

test('G-32: every ASCII name letter and HTML separator is read literally', () => {
	for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') {
		const source = `<${letter} DATA-${letter}="{ v }"></${letter}>`
		const output = read(source).children.find(n => n.kind === 'output')
		expect(output?.kind === 'output' && output.slot?.place).toBe(`attr:${letter.toLowerCase()}.data-${letter.toLowerCase()}`)
	}
	for (const space of ['\t', '\n', '\f', '\r', ' ']) {
		for (const source of [`<a${space}href${space}=${space}"{ v }"></a${space}>`, `<a title=x${space}href="{ v }">`, `<title>x</title${space}><a href="{ v }">`]) {
			expect(read(source).children.find(n => n.kind === 'output')?.slot?.url).toBe(true)
		}
		expect(() => read(`<a x${space}{#if p}hidden${space}{/if}href="{ v }">`)).not.toThrow()
	}
	for (const bad of ['<', '"', "'", '=', '`', '\0']) {
		for (const source of [`<a${bad}b>`, `</a${bad}b>`]) expect(() => read(source)).toThrow('G3014')
	}
	for (const bad of ['"', "'", '<', '`', '\0']) expect(() => read(`<a x${bad}b>`)).toThrow('G3014')
	for (const bad of ['"', "'", '<', '=', '`']) expect(() => read(`<a x=a${bad}b>`)).toThrow('G3014')
	for (const source of ['x<!---> -->', 'x<!--x--!> -->', 'x<!--x-->--!>', '<!DOCTYPE\thtml>', '<!DOCTYPE\nhtml>', '<!DOCTYPE\fhtml>', '<!DOCTYPE\rhtml>']) {
		if (source === 'x<!---> -->' || source === 'x<!--x--!> -->') expect(() => read(source)).toThrow('G3014')
		else expect(() => read(source)).not.toThrow()
	}
})

test('G-32: URL prefix transitions cover every ASCII code point and allowed scheme', () => {
	const allowed = ['http', 'https', 'mailto', 'tel']
	const check = (value: string, forbidden: boolean, settled?: boolean) => {
		const prefix = new UrlPrefix('href'); prefix.feed(value)
		expect(prefix.forbidden, JSON.stringify(value)).toBe(forbidden)
		if (settled !== undefined) expect(prefix.settled, JSON.stringify(value)).toBe(settled)
		if (forbidden) expect(() => prefix.check(true)).toThrow('G5001')
		else if (!value.includes('&')) expect(() => prefix.check(true)).not.toThrow()
	}
	for (const scheme of allowed) for (const value of [scheme, scheme.toUpperCase()]) check(value + ':', false, true)
	for (let code = 0; code < 128; code++) {
		const c = String.fromCharCode(code)
		const ignored = c === '\t' || c === '\n' || c === '\r'
		const schemeChar = /^[A-Za-z0-9+.-]$/.test(c)
		if (c !== '&') check('z' + c + ':', schemeChar || ignored || c === ':', !(schemeChar || ignored || c === ':'))
		if (code <= 32 && code !== 0) check(c + 'javascript:', true, false)
	}
	for (const value of ['//', '/\\', '\\/', '\\\\']) check(value, true, false)
	for (const value of ['/x', '\\x', '\0javascript:', '0x:', '+x:', '-x:', '.x:']) check(value, false, true)
	const prefix = new UrlPrefix('href')
	prefix.feed('javascript'); prefix.check(false); expect(prefix.checkpoints).toBe(0)
	prefix.feed(':'); expect(() => prefix.check(true)).toThrow('G5001')
	const settled = new UrlPrefix('href'), reads = countUrlReads(settled); settled.feed('/x'); const work = reads.mock.calls.length
	settled.feed('javascript:'); expect(reads.mock.calls.length).toBe(work)
	settled.check(true); expect(settled.checkpoints).toBe(1)
})

test('G-32: metadata targets and animation element names remain distinct', async () => {
	const { default: galley } = await import('../index.js')
	for (const source of ['<link content="{ v }" href="x">', '<meta href="{ v }" content="x">', '<div to="{ v }" from="{ v }" by="{ v }" values="{ v }">', '<set to{@const n = 1}>', '<set to {#if p}hidden{/if}>']) {
		const template = await galley(source)
		expect(await template.render({ v: '', p: false })).toBe(source.replaceAll('{ v }', '').replace('{@const n = 1}', '').replace('{#if p}hidden{/if}', ''))
	}
	for (const [source, context] of [['<a title="', 'double(a.title;'], ['<svg><title><b>', 'text(title;'], ['<a x="x"href="v">', 'tag(a;']]) {
		expect(() => read(source!)).toThrow(context!)
	}
})

test('G-32: foreign exits consume all HTML separators; HTML integration names still hold markup', async () => {
	const { default: galley } = await import('../index.js')
	for (const name of ['svg', 'math', 'template']) for (const space of ['\t', '\n', '\f', '\r', ' ']) {
		const source = `<${name}></${name}${space}><style>a<b</style>`
		const template = await galley(source)
		expect(await template.render({})).toBe(source)
	}
	for (const name of ['foreignObject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml']) {
		const template = await galley(`<${name}><b><a href="{ u }">x</a></b></${name}>`)
		expect(() => template.render({ u: 'javascript:x' })).toThrow('G5001')
	}
})

test('G-32: attribute terminators and metadata non-targets keep their meanings', async () => {
	const { default: galley } = await import('../index.js')
	for (const source of ['<a hidden>', '<a hidden/>', '<a x=v>', '<a x=v/>', '<title><!{ v }</title>', '<title><!--literal--></title>']) expect(() => read(source)).not.toThrow()
	for (const source of ['<a x/y>', '<a x={@const n = 1}"v">']) expect(() => read(source)).toThrow('G3014')
	for (const source of ['<meta content="x" title="{ v }">', '<link href="/x" title="{ v }">']) {
		const template = await galley(source)
		expect(await template.render({ v: '' })).toBe(source.replace('{ v }', ''))
	}
	const template = await galley('{#snippet s()}OK{/snippet}{#each xs as x}{@js}return s(){@js}{/each}', { allowCode: true })
	expect(await template.render({ xs: [1] })).toBe('OK')
})

test('G-32: every variant key field preserves placement and quote grammar', () => {
	const source = '{#snippet s(v)}{ v }{/snippet}<a title="{@render s(u)}"><b title="{@render s(u)}"><b class="{@render s(u)}"><title>{@render s(u)}</title><textarea>{@render s(u)}</textarea>'
	const snippet = read(source).children[0]!
	expect(snippet.kind).toBe('snippet')
	if (snippet.kind !== 'snippet') throw new Error('Expected snippet')
	expect(snippet.variants?.map(v => v.children.find(n => n.kind === 'output')?.slot?.place)).toEqual(['attr:a.title', 'attr:b.title', 'attr:b.class', 'text:title', 'text:textarea'])
	expect(() => read(`{#snippet s()}'{/snippet}<a title="{@render s()}"><a title='{@render s()}'>`)).toThrow('G3011')
	expect(() => read('{#snippet s(v)}{ v }{/snippet}<svg><title>{@render s(u)}</title><script>{@render s(u)}</script></svg>')).toThrow('G3013')
	for (const value of ['telx:', 'httpx:', 'httpsx:', 'mailtox:', 't:', 'te:', 'htt:', 'mail:']) {
		const prefix = new UrlPrefix('href'); prefix.feed(value)
		expect(() => prefix.check(true), value).toThrow('G5001')
	}
})

test('G-32: URL scans stop at settled and absorbing prefixes', () => {
	const relative = new UrlPrefix('href'), reads = countUrlReads(relative); relative.feed('/x' + 'a'.repeat(1000)); expect(reads.mock.calls.length).toBe(2)
	for (const value of ['javascript:', 'x&amp;']) {
		const prefix = new UrlPrefix('href'), reads = countUrlReads(prefix); prefix.feed(value); const work = reads.mock.calls.length
		prefix.feed('a'.repeat(1000)); expect(reads.mock.calls.length).toBe(work)
	}
})

test('G-32: static metadata, slot flags, strip boundaries and empty each paths are pinned', async () => {
	const { default: galley } = await import('../index.js')
	const text = read('{ v }').children[0]!
	expect(text.kind === 'output' && text.slot).toEqual({ place: 'text', url: false, metadata: false })
	const source = '<meta content="x{@const n = 1}">'
	const template = await galley(source)
	expect(await template.render({})).toBe('<meta content="x">')
	const stripped = await galley('<b>  { v }', { strip: true })
	expect(await stripped.render({ v: 'x' })).toBe('<b>  x')
	for (const source of ['<a{#each xs as x} {/each}href="{ u }">', '<a {#each xs as x}hidden{/each}href="{ u }">']) await expect(galley(source)).rejects.toThrow('G3014')
	await expect(galley('{#if p}<a {@const n = 1}{/if}')).rejects.toThrow('G3010')
	await expect(galley('{#if p}<a {@const n = 1}\n{/if}', { strip: true })).rejects.toThrow('G3010')
})

test('G-32: metadata indentation accumulates only static text and consumes one adjacent newline', async () => {
	const { render } = await import('./helpers.js')
	expect(await render('  {@const n = 1}  {#if p}<meta content="{ a }">{/if}', { p: true })).toBe('')
	expect(await render('  {#if p}<meta content="{ a }">{/if}x{#if q}\n{/if}', { p: true, q: true })).toBe('x\n')
	const suffix = '{#if p}<meta content="{ a }">{/if}'
	expect(await render('  {#snippet s(v)}{ v }{/snippet}{@render s(x)}' + suffix, { x: 'keep  ', p: true })).toBe('  keep  ')
	expect(await render('  {@js}return "keep  "{@js}' + suffix, { p: true }, { allowCode: true })).toBe('  keep  ')
})

test('G-32: each exit delimiters, strip traversal and nonempty metadata are pinned', async () => {
	const { render } = await import('./helpers.js')
	const { default: galley } = await import('../index.js')
	await expect(galley('<a {#each xs as x} hidden{/each}href="{ u }">')).rejects.toThrow('G3014')
	await expect(galley('x<!--x--!>{ v }')).rejects.toThrow('G3014')
	await expect(galley('{#snippet bad()}><select>{/snippet}<div {@render bad()}>')).rejects.toThrow('G3009')
	expect(await render('<meta content="{ a }{ b }">', { a: 'keep', b: '' })).toBe('<meta content="keep">')
	expect(await render('<meta content="{ a }" title="{ b }">', { a: '', b: 'keep' })).toBe('')
	const options = { strip: true, includes: { import: async () => 'x\n <b>\n' } }
	for (const source of ['{#each xs as x}x\n <b>\n{/each}', '{#snippet s()}x\n <b>\n{/snippet}{@render s()}', '{@partial p.sort}']) expect(await render(source, { xs: [1] }, options)).toBe('x<b>')
})

test('G-32: ordinary tag names cannot alter private context fields', async () => {
	const { render } = await import('./helpers.js')
	expect(await render('<strict>{@raw v}</strict>', { v: '<b>' })).toBe('<strict><b></strict>')
})
