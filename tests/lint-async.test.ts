import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('G-35: lint always returns a Promise; partials preserve context without a resolver', async () => {
	for (const options of [{}, { includes: { import: async () => '' } }]) {
		const result: Promise<import('../compiler/types.js').Diagnostic[]> = lint('ok', options)
		expect(result).toBeInstanceOf(Promise)
		expect(await result).toEqual([])
		expect((await lint('<p>a < b</p>{@partial x.sort}', options)).map(d => d.code)).toEqual(['G3014'])
		expect((await lint('<a hr\nef="javascript:{ u }">{@partial x.sort}', { ...options, strip: true })).map(d => d.code)).toEqual(['G3015'])
		expect((await lint('<a hr\nef="javascript:{ u }">{@partial x.sort}', { ...options, strip: false })).map(d => d.code)).toEqual([])
	}
	expect(await lint('{@partial p.sort}')).toEqual([])
	expect((await lint('<p>{ v }{@partial p.sort}</p>')).map(d => d.code)).toEqual([])
	const options = { includes: { import: async () => ' title="x" ' } }
	const source = '<a hidden{@partial p.sort}href="/ok">'
	expect(await lint(source, options)).toEqual([])
	await expect(galley(source, options)).resolves.toBeDefined()
})

