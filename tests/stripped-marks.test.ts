import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

// The marks of stripEmptyMeta leave the text after the check of URL attributes: a value must not bring them along.
describe('a value with the marks of stripEmptyMeta', () => {
	const open = '\uE000galley-meta\uE001', close = '\uE002galley-meta\uE003'
	const meta = '<meta name="description" content="{ d }">'

	test('passes no URL through the check, into either kind of value', async () => {
		for (const u of [`java${open}script:alert(1)`, `java${close}script:alert(1)`, `/${open}/evil.example`]) {
			for (const output of ['{ u }', '{@raw u}']) {
				const html = await render(`${meta}<a href="${output}">x</a>`, { d: 'd', u })
				expect(html).not.toContain('href="javascript:')
				expect(html).not.toContain('href="//')
			}
		}
	})

	test('stays the same text for a browser', async () => {
		expect(await render('<p>{ v }</p>', { v: 'a\uE000b' })).toBe('<p>a\uE000b</p>')
		expect(await render('<p>{@raw v}</p>', { v: 'a\uE003b' })).toBe('<p>a\uE003b</p>')
	})

	test('leaves a meta element without a value to be removed, as before', async () => {
		expect(await render(meta, { d: '' })).toBe('')
		expect(await render(meta, { d: 'x' })).toBe('<meta name="description" content="x">')
	})
})

describe('a snippet rendered into the target of stripEmptyMeta', () => {
	const tags = [['<meta name="d" content="', '">'], ['<link rel="x" href="', '">']] as const

	test('marks the tag only through the dynamic values the snippet writes when it runs', async () => {
		const kept = [
			['{#snippet s()}{/snippet}', '{@render s()}', {}, ''],
			['{#snippet s()}x{/snippet}', '{@render s()}', {}, 'x'],
			['{#snippet s()}{#if p}x{/if}{/snippet}', '{@render s()}', { p: false }, ''],
			['{#snippet s(v)}{#each v as x}y{/each}{/snippet}', '{@render s(v)}', { v: [] }, ''],
			['{#snippet inner()}{/snippet}{#snippet s()}{@render inner()}{/snippet}', '{@render s()}', {}, ''],
			['{#snippet inner()}{#if p}x{/if}{/snippet}{#snippet s()}{@render inner()}{/snippet}', '{@render s()}{@render inner()}', { p: false }, ''],
			['{#snippet s(v)}{#if v}{ v }{/if}{/snippet}', '{@render s(v)}', { v: '' }, ''],
			['{#snippet inner(v)}{ v }{/snippet}{#snippet s(v)}{#if v}{@render inner(v)}{/if}{/snippet}', '{@render s(v)}', { v: '' }, ''],
		] as const
		const removed = [
			['{#snippet s(v)}{ v }{/snippet}', '{@render s(v)}', { v: '' }],
			['{#snippet s(v)}{@raw v}{/snippet}', '{@render s(v)}', { v: '' }],
			['{#snippet s()}{/snippet}', '{@render s()}{ v }', { v: '' }],
			['{#snippet inner(v)}{ v }{/snippet}{#snippet s(v)}{@render inner(v)}{/snippet}', '{@render s(v)}', { v: '' }],
		] as const
		for (const [open, close] of tags) {
			for (const [declarations, value, data, written] of kept) expect(await render(`${declarations}${open}${value}${close}`, data)).toBe(`${open}${written}${close}`)
			for (const [declarations, value, data] of removed) expect(await render(`${declarations}${open}${value}${close}`, data)).toBe('')
			// A snippet that does write keeps the tag when the value is not empty.
			expect(await render(`{#snippet s(v)}{ v }{/snippet}${open}{@render s(v)}${close}`, { v: 'x' })).toBe(`${open}x${close}`)
		}
	})

	test('a snippet decides as its body written in place does', async () => {
		const bodies = ['{#if v}{ v }{/if}', '{ v }', '{@raw v}', '{#if p}x{/if}', 'x', '', '{#if p}{ v }{/if}{ v }', '{#each l as i}{ i }{/each}']
		for (const [open, close] of tags) for (const body of bodies) for (const data of [{ v: '', p: false, l: [] }, { v: '', p: true, l: [''] }, { v: 'x', p: true, l: ['y'] }]) {
			const inPlace = await render(`${open}${body}${close}`, data)
			expect(await render(`{#snippet s()}${body}{/snippet}${open}{@render s()}${close}`, data)).toBe(inPlace)
			expect(await render(`{#snippet inner()}${body}{/snippet}{#snippet s()}{@render inner()}{/snippet}${open}{@render s()}${close}`, data)).toBe(inPlace)
		}
		// Side by side, the case 0.5.0 and the first fix removed: an empty value behind {#if} keeps the tag either way.
		for (const [open, close] of tags) {
			expect(await render(`${open}{#if v}{ v }{/if}${close}`, { v: '' })).toBe(`${open}${close}`)
			expect(await render(`{#snippet s(v)}{#if v}{ v }{/if}{/snippet}${open}{@render s(v)}${close}`, { v: '' })).toBe(`${open}${close}`)
		}
	})

	test('one snippet variant marks each tag it is rendered into by itself', async () => {
		const source = '{#snippet w(v)}{ v }{/snippet}<meta content="{@render w(a)}">\n<meta content="{@render w(b)}">\n<link href="{@render w(b)}">\n<link href="{@render w(a)}">'
		expect(await render(source, { a: 'x', b: '' })).toBe('<meta content="x">\n<link href="x">')
	})

	test('the same snippet keeps a separate decision in each tag', async () => {
		const source = '{#snippet e()}{/snippet}{#snippet w(v)}{ v }{/snippet}<meta content="{@render e()}">\n<meta content="{@render w(v)}">\n<link href="{@render e()}">'
		expect(await render(source, { v: '' })).toBe('<meta content="">\n<link href="">')
	})
})

describe('what a template may not do to the generated code', () => {
	test('a scripted snippet or a constant may not take a global the generated code reads', async () => {
		for (const name of ['String', 'Object', 'Array', 'TypeError', 'undefined']) {
			await expect(render(`{#snippet ${name}(x)}{/snippet}{@js}return ''{@js}`, {}, { allowCode: true })).rejects.toThrow(/cannot be bound by the generated code/)
			await expect(render(`{@const ${name} = 1}`)).rejects.toThrow(/cannot be bound by the generated code/)
		}
	})

	test('a value whose toString is no function writes as an object, and stops no render', async () => {
		expect(await render('<p>{ v }</p>', { v: { toString: 1 } })).toBe('<p>[object Object]</p>')
		expect(await render('<p>{@raw v}</p>', { v: { toString: 1 } })).toBe('<p>[object Object]</p>')
	})
})

describe('a partial that includes itself', () => {
	test('stops with the chain, directly and through another', async () => {
		const files: Record<string, string> = { './a.sort': 'x{@partial a.sort}', './b.sort': '{@partial c.sort}', './c.sort': '{@partial b.sort}' }
		const includes = { import: (path: string) => Promise.resolve(files[path] ?? ''), basedir: '.' }
		await expect(render('{@partial a.sort}', {}, { includes })).rejects.toThrow(/includes itself/)
		await expect(render('{@partial b.sort}', {}, { includes })).rejects.toThrow(/b\.sort.*c\.sort.*b\.sort/)
	})

	test('a partial used twice side by side is no cycle', async () => {
		const includes = { import: () => Promise.resolve('p'), basedir: '.' }
		expect(await render('{@partial a.sort}{@partial a.sort}', {}, { includes })).toBe('pp')
	})
})
