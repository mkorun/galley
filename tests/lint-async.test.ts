import { expect, test } from 'bun:test'
import galley, { lint, type CompileOptions } from '../index.js'
import { render } from './helpers.js'

test('only boolean true allows JavaScript in compilation and lint', async () => {
	for (const allowCode of [undefined, null, false, 0, '', 1, 'false', 'yes', {}, [], true]) {
		const options = { allowCode: allowCode as boolean }
		for (const source of ['{@js}return "ran"{@js}', '{@js}return await Promise.resolve("ran"){@js}']) {
			if (allowCode === true) {
				expect(await lint(source, options)).toEqual([])
				const template = await galley(source, options)
				expect(template.async).toBe(true)
				expect(await template.render({})).toBe('ran')
			} else {
				expect((await lint(source, options)).map(d => d.code)).toEqual(['G3004'])
				await expect(galley(source, options)).rejects.toMatchObject({ diagnostic: { code: 'G3004' } })
			}
		}
	}
})

test('inherited options retain their values and original getter receivers', async () => {
	const options: CompileOptions = Object.create({
		sourceId: 'inherited.sort',
		get strictUndefined() { expect(this).toBe(options); return true },
		get filters() { expect(this).toBe(options); return { mark: (value: unknown) => `[${value}]` } },
		get includes() { expect(this).toBe(options); return { import: async () => '{ missing }' } },
	})
	const template = await galley('{ missing }', options)
	expect(() => template.render({})).toThrow('G5002: missing is undefined at inherited.sort:1:3')
	await expect(galley('{', options)).rejects.toMatchObject({ diagnostic: { code: 'G3019', span: { source: { id: 'inherited.sort' } } } })
	expect((await lint('{', options)).map(d => d.code)).toEqual(['G3019'])
	const filtered = await galley('{ value | mark }', options)
	expect(await filtered.render({ value: 'V' })).toBe('[V]')
	expect(await lint('{ value | mark }', options)).toEqual([])
	const partial = await galley('{@partial p.sort}', options)
	expect(() => partial.render({})).toThrow('G5002')
	expect(await lint('{@partial p.sort}', options)).toEqual([])
})

test('allowCode is read once per public call and shared by every JS block', async () => {
	const source = '{@js}return "A"{@js}{@js}return await Promise.resolve("B"){@js}'
	for (const value of [undefined, false, 1, 'false', {}, true]) {
		let reads = 0
		const options: CompileOptions = { get allowCode() { reads++; return value as boolean } }
		if (value === true) {
			const template = await galley(source, options)
			expect(template.async).toBe(true)
			expect(await template.render({})).toBe('AB')
		} else await expect(galley(source, options)).rejects.toMatchObject({ diagnostic: { code: 'G3004' } })
		expect(reads).toBe(1)
		reads = 0
		expect((await lint(source, options)).map(d => d.code)).toEqual(value === true ? [] : ['G3004', 'G3004'])
		expect(reads).toBe(1)
	}
})

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

