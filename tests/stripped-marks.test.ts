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
		expect(await render('<p>{ v }</p>', { v: 'a\uE000b' })).toBe('<p>a&#xE000;b</p>')
		expect(await render('<p>{@raw v}</p>', { v: 'a\uE003b' })).toBe('<p>a&#xE003;b</p>')
	})

	test('leaves a meta element without a value to be removed, as before', async () => {
		expect(await render(meta, { d: '' })).toBe('')
		expect(await render(meta, { d: 'x' })).toBe('<meta name="description" content="x">')
	})
})

describe('what a template may not do to the generated code', () => {
	test('a snippet or a constant may not take a global the generated code calls', async () => {
		for (const name of ['String', 'Object', 'Array']) {
			await expect(render(`{#snippet ${name}(x)}{/snippet}`)).rejects.toThrow(/needed by the generated code/)
			await expect(render(`{@const ${name} = 1}`)).rejects.toThrow(/needed by the generated code/)
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
