import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index.js'

test('G-40: lint visits filter arguments and declaration expressions', async () => {
	for (const source of [
		'{ x | known(y | missing) }',
		'{@const n = x | missing}', '{#if x | missing}x{/if}',
		'{#snippet s(v)}{ v }{/snippet}{@render s(x | missing)}',
		'{#each xs as x}{ x | missing }{/each}',
		'{#snippet s()}{ x | missing }{/snippet}{@render s()}',
	]) {
		const diagnostics = await lint(source, { knownFilters: new Set(['known']) })
		expect(diagnostics.map(d => d.code), source).toEqual(['G3001'])
		expect(diagnostics[0]?.message).toContain('missing')
	}
	expect(await lint('{ x | known }', { knownFilters: new Set(['known']) })).toEqual([])
})

test('G-40: lint resolves snippets through partial scopes and suppresses duplicate unused warnings', async () => {
	const options = { includes: { import: async () => '{#snippet s()}x{/snippet}{@render s()}' } }
	expect(await lint('{@partial p.sort}', options)).toEqual([])
	const duplicates = await lint('{#snippet s()}x{/snippet}{#snippet s()}y{/snippet}')
	expect(duplicates.map(d => d.code)).toEqual(['G3003', 'G3006'])
	expect(await lint('{#snippet s()}x{/snippet}{@render s()}')).toEqual([])
})

test('G-40: compile and lint preserve async flags and debug output', async () => {
	for (const allowCode of [false, true]) {
		const template = await galley('text', { allowCode, debug: true })
		expect(template.async).toBe(allowCode)
		expect(template.source).toContain('[galley] AST compiler debug output')
		if (allowCode) expect(template.render({}, {})).toBeInstanceOf(Promise)
	}
})

test('G-40: reserved names diagnose declarations and partial declarations share their enclosing scope', async () => {
	expect((await lint('{@render String()}')).map(d => d.code)).toEqual(['G3005'])
	const options = { includes: { import: async () => '{#snippet s()}inner{/snippet}{@render s()}' } }
	expect((await lint('{#snippet s()}outer{/snippet}{@partial p.sort}', options)).map(d => d.code)).toEqual(['G3003'])
})

test('lint and compile report the same G3014 message after stripping trailing whitespace', async () => {
	const source = '<p>a < b</p> '
	const diagnostics = await lint(source, { strip: true })
	expect(diagnostics.map(item => item.code)).toEqual(['G3014'])
	const error = await galley(source, { strip: true }).then(() => undefined, error => error)
	expect(error).toBeInstanceOf(GalleyDiagnosticError)
	expect(error.diagnostic.code).toBe('G3014')
	expect(diagnostics[0]!.message).toBe(error.diagnostic.message)
})
