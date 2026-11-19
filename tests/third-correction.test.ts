import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('G-40/P3: rule 14 requires a dynamic write, including through snippets', async () => {
	for (const source of ['<a href="x&amp;y{#if p}z{/if}">', '<a href="page&amp;x=1{@const n = 1}">', '{#snippet s()}z{/snippet}<a href="x&amp;y{@render s()}">']) {
		expect((await lint(source)).filter(d => d.severity === 'error')).toEqual([])
		await expect(render(source)).resolves.toContain('&amp;')
	}
	for (const source of ['<a href="x&amp;y{ u }">', '{#snippet s(v)}{ v }{/snippet}<a href="x&amp;y{@render s(u)}">']) {
		await expect(galley(source)).rejects.toThrow('G3015')
		expect((await lint(source)).some(d => d.code === 'G3015')).toBe(true)
	}
})

test('G-40/P3: settled metadata URLs keep static ampersands before writes', async () => {
	for (const prefix of ['/x?a=1&amp;b=', 'https://example.org/?a=1&amp;b=']) {
		const source = `<link href="${prefix}{ v }">`
		expect(await lint(source)).toEqual([])
		expect(await render(source, { v: 'z' })).toBe(`<link href="${prefix}z">`)
	}
})

test('G-40/P3: lint and compile agree on generated global names', async () => {
	for (const source of ['{@const String = 1}', '{#snippet Object()}x{/snippet}', '{#if p}{@const Array = 1}{/if}', '{@partial p.sort}']) {
		const options = { includes: { import: async () => '{@const TypeError = 1}' } }
		await expect(galley(source, options)).rejects.toThrow('G3007')
		expect((await lint(source, options)).some(d => d.code === 'G3007')).toBe(true)
	}
})
