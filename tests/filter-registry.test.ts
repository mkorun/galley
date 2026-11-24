import { expect, spyOn, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index.js'
import util from '../util.js'
import * as diagnostics from '../compiler/diagnostics.js'

test('B4: built-ins are linked without util; default and unknown filters fail at compile', async () => {
	expect(await (await galley('{#if xs | length}y{:else}n{/if}')).render({ xs: [1] })).toBe('y')
	for (const name of ['default', 'slugfiy', 'constructor', 'toString']) {
		const source = `line\n{ value | ${name} }`
		const error = await galley(source, { sourceId: 'article.chase' }).catch(error => error)
		expect(error).toBeInstanceOf(GalleyDiagnosticError)
		expect(error.diagnostic).toMatchObject({ code: 'G3001', severity: 'error', message: `Unknown filter "${name}"` })
		expect(error.diagnostic.span.start).toBe(source.indexOf(name))
		expect(error.diagnostic.help).toContain('upper')
		expect((await lint(source))[0]?.code).toBe('G3001')
	}
})

test('B4: galley and lint share custom filters, overrides and a compile-time snapshot', async () => {
	const filters = { upper: (value: string) => value + '!', custom: (value: string) => value + '?' }
	const source = '{ value | upper | custom }'
	expect(await lint(source, { filters })).toEqual([])
	const template = await galley(source, { filters })
	filters.upper = () => 'changed'
	filters.custom = () => 'changed'
	expect(template.render({ value: 'a' })).toBe('a!?')
	expect(await (await galley('{ x | constructor }', { filters: { constructor: () => 'own' } })).render({})).toBe('own')
})

test('B4: a custom __proto__ filter remains an own entry and renders', async () => {
	const filters = { ['__proto__']: (value: string) => value + '!' }
	const source = '{ value | __proto__ }'
	expect(await lint(source, { filters })).toEqual([])
	expect((await galley(source, { filters })).render({ value: 'own' })).toBe('own!')
})

test('B4: JavaScript cannot replace a linked filter for this or later renders', async () => {
	const source = '{@js}try { $$filters.upper = () => "changed" } catch (error) { if (!(error instanceof TypeError)) throw error }{@js}{ value | upper }'
	const template = await galley(source, { allowCode: true })
	expect(await template.render({ value: 'first' })).toBe('FIRST')
	expect(await template.render({ value: 'later' })).toBe('LATER')
})

test('B4: old API arguments and invalid filter entries fail loudly', async () => {
	for (const allowCode of [false, true]) {
		const template = await galley('ok', { allowCode })
		for (const extra of [{}, undefined]) {
			await expect(Promise.resolve().then(() => (template.render as any)({}, extra))).rejects.toThrow('options.filters')
		}
	}
	for (const compile of [galley, lint]) {
		for (const knownFilters of [new Set(), undefined]) await expect(compile('ok', { knownFilters } as any)).rejects.toThrow(TypeError)
		for (const filters of [null, [], 1, { upper: null }, { custom: 1 }]) await expect(compile('ok', { filters } as any)).rejects.toThrow('options.filters')
	}
})

test('B4: every throwing filter names its own source place and preserves its cause', async () => {
	for (const allowCode of [false, true]) for (const cause of [new Error('boom'), 'thrown value']) {
		const source = 'line\n{ value | upper | explode }'
		const template = await galley(source, { allowCode, sourceId: 'article.chase', filters: { explode() { throw cause } } })
		const error = await Promise.resolve().then(() => template.render({ value: 'v' })).catch(error => error)
		expect(error.message).toBe(`G5003: filter explode failed at article.chase:2:19: ${cause instanceof Error ? cause.message : cause}`)
		expect(error.cause).toBe(cause)
	}
	const template = await galley('{@partial filters.sort}', { includes: { import: async () => '\n{ value | explode }' }, filters: { explode() { throw new Error('partial') } } })
	expect(() => template.render({})).toThrow('filters.sort:2:11')
})

test('B4: successful filter calls do not compute line and column', async () => {
	const template = await galley('{ x | upper }')
	const locate = spyOn(diagnostics, 'locate')
	try { expect(template.render({ x: 'ok' })).toBe('OK'); expect(locate).not.toHaveBeenCalled() }
	finally { locate.mockRestore() }
})


test('B4: successful and throwing filters restore the direct-call warning policy', async () => {
	const value = { toString() { throw new Error('conversion failed') } }
	const warning = spyOn(console, 'warn').mockImplementation(() => {})
	try {
		for (const throws of [false, true]) {
			const template = await galley('{ value | custom }', { debug: true, filters: { custom() {
				if (throws) throw new Error('filter failed')
				return 'ok'
			} } })
			if (throws) expect(() => template.render({})).toThrow('G5003')
			else expect(template.render({})).toBe('ok')
			expect(util.number(value as any)).toBe('[object Object]')
			expect(warning).not.toHaveBeenCalled()
		}
	} finally { warning.mockRestore() }
})
