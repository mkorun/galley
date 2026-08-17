import { describe, expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index'
import util from '../util'

// The legacy oracle lives outside this repo (private/, a maintainer-only
// benchmark/conformance workspace) and is never published or cloned with
// galley itself. These three tests are the only ones that need it, and skip
// themselves when it isn't present instead of failing the whole file.
const legacyModule = await import('../../private/legacy/index').catch(() => null)
const galleyLegacy = legacyModule?.default as typeof galley | undefined

const render = async (template: string, data: Record<string, unknown> = {}) => {
	const compiled = await galley(template)
	return compiled.render(data, util as any)
}

describe('AST compiler baseline', () => {
	test.skipIf(!galleyLegacy)('matches the current compiler on representative language features', async () => {
		const cases: Array<[string, Record<string, unknown>]> = [
			['plain text', {}],
			['{ title }/{@raw html}', { title: '<x>', html: '<b>ok</b>' }],
			['{ missing ?? "fallback" }', {}],
			['{#if a}A{:else if b}B{:else}C{/if}', { a: false, b: true }],
			['{#each items as item, i}{ i }:{ item }/{ length }/{ isFirst }/{ isLast };{/each}', { items: ['a', 'b'] }],
			['{@const x = title | upper}{ x }', { title: 'hello' }],
			['{#snippet card(x)}<b>{ x }</b>{/snippet}{@render card(value)}', { value: 'v' }],
			['{ meta["og:title"] }/{ items[0] }', { meta: { 'og:title': 'OG' }, items: ['first'] }],
			['before\\{ title }after', { title: 'ignored' }],
			['<galley:config>ignored</galley:config>ok', {}],
			['before\n<!-- standalone -->\nafter', {}],
		]
		for (const [template, data] of cases) {
			const legacy = await galleyLegacy!(template, { includes: { import: async () => '' } })
			const compiled = await galley(template)
			expect(await compiled.render(data, util as any)).toBe(await legacy.render(data, util))
		}
	})

	test('expands partial ASTs while preserving their source identity', async () => {
		const compiled = await galley('A{@partial p.sort}B', {
			includes: { import: async path => path.endsWith('/p.sort') ? '<b>{ title }</b>' : '' },
		})
		expect(compiled.render({ title: 'T' }, util as any)).toBe('A<b>T</b>B')
	})

	test.skipIf(!galleyLegacy)('matches ADR-014 structural whitespace behavior', async () => {
		const cases: Array<[string, Record<string, unknown>]> = [
			['<div>\n{#if show}\n  content\n{/if}\n</div>', { show: true }],
			['before\n{#if show}\n  hidden\n{/if}\nafter', { show: false }],
			['<p>\n{#if a}\nyes\n{:else}\nno\n{/if}\n</p>', { a: false }],
			['<ul>\n{#each items as item}\n<li>{ item }</li>\n{/each}\n</ul>', { items: ['a', 'b'] }],
			['[\n{#if a}\n{#if b}\nAB\n{/if}\n{/if}\n]', { a: true, b: true }],
		]
		for (const [template, data] of cases) {
			const legacy = await galleyLegacy!(template, { includes: { import: async () => '' } })
			const compiled = await galley(template)
			expect(compiled.render(data, util as any)).toBe(legacy.render(data, util))
		}
	})

	test.skipIf(!galleyLegacy)('matches dynamic empty meta/link behavior without removing static empty tags', async () => {
		const template = '<meta name="literal" content="">\n<meta name="dynamic" content="{ description }">\n<link href="{ url }">'
		for (const data of [{}, { description: 'D', url: '/x' }]) {
			const legacy = await galleyLegacy!(template, { includes: { import: async () => '' } })
			const compiled = await galley(template)
			expect(compiled.render(data, util as any)).toBe(legacy.render(data, util))
		}
		const preserved = await galley('<meta content="{ value }">', { stripEmptyMeta: false })
		expect(preserved.render({}, util as any)).toBe('<meta content="">')
	})

	test('compiler production patterns avoid unsupported RE2 constructs', async () => {
		const files = ['lexer.ts', 'expression.ts', 'path.ts', 'parser.ts', 'analysis.ts', 'codegen.ts', 'diagnostics.ts', 'lint.ts']
		for (const file of files) {
			const source = await Bun.file(new URL(`../compiler/${file}`, import.meta.url)).text()
			expect(source).not.toMatch(/\(\?<?[=!]/)
			expect(source).not.toMatch(/\\[1-9]/)
		}
	})

	test('renders escaped/raw output, conditions, loops and fallbacks', async () => {
		const template = '{#if show}<h1>{ title ?? "Untitled" }</h1>{/if}<ul>{#each tags as tag, i}<li>{ i }:{ tag }</li>{/each}</ul>{@raw html}'
		expect(await render(template, { show: true, title: '<Hi>', tags: ['a', 'b'], html: '<b>x</b>' }))
			.toBe('<h1>&lt;Hi&gt;</h1><ul><li>0:a</li><li>1:b</li></ul><b>x</b>')
	})

	test('supports const, snippets and pipes', async () => {
		const template = '{@const heading = title | upper}{#snippet card(x)}<b>{ x }</b>{/snippet}{ heading }:{@render card(value)}'
		expect(await render(template, { title: 'hello', value: 'v' })).toBe('HELLO:<b>v</b>')
	})

	test('produces structured, speaking diagnostics', async () => {
		try {
			await galley('{#each items as length}{ length }{/each}', { sourceId: 'page.chase' })
			throw new Error('expected compilation to fail')
		} catch (error) {
			expect(error).toBeInstanceOf(GalleyDiagnosticError)
			expect((error as GalleyDiagnosticError).diagnostic.code).toBe('G2213')
			expect(String(error)).toContain('page.chase:1:1')
			expect(String(error)).toContain('Choose another item or index name')
		}
	})

	test('lint reports unknown filters and unused snippets without codegen', () => {
		const diagnostics = lint('{#snippet unused(x)}{ x }{/snippet}{ title | slugfiy }', {
			knownFilters: new Set(['slugify']),
		})
		expect(diagnostics.map(d => d.code)).toEqual(['G3001', 'G3006'])
	})

	test('compile options pass known filters into diagnostics', async () => {
		const compiled = await galley('{ title | slugfiy }', { knownFilters: new Set(['slugify']) })
		expect(compiled.diagnostics.map(diagnostic => diagnostic.code)).toEqual(['G3001'])
	})

	test('compiler internals cannot be shadowed by template variables', async () => {
		expect(await render('{@const util = title}{util|upper}', { title: 'hello' })).toBe('HELLO')
		expect(await render('{#each list as util}{util|upper}{/each}', { list: ['a', 'b'] })).toBe('AB')
	})

	test('multiline string literals fail with a structured diagnostic', async () => {
		for (const newline of ['\n', '\r']) {
			try {
				await galley(`{@const x = 'hello${newline}world'}{x}`, { sourceId: 'literal.chase' })
				throw new Error('expected compilation to fail')
			} catch (error) {
				expect(error).toBeInstanceOf(GalleyDiagnosticError)
				expect((error as GalleyDiagnosticError).diagnostic.code).toBe('G2108')
				expect(String(error)).toContain('String literals may not contain line breaks')
			}
		}
	})

	test('loop metadata is emitted only when referenced', async () => {
		const plain = await galley('{#each items as item}{ item }{/each}', { debug: true })
		const withMeta = await galley('{#each items as item}{ item }/{ length }{/each}', { debug: true })
		expect(plain.source).not.toContain('const length=')
		expect(plain.source).not.toContain('Object.keys')
		expect(withMeta.source).toContain('const length=')
	})

	test('generated render functions opt into strict JavaScript semantics', async () => {
		const compiled = await galley('ok', { debug: true })
		expect(compiled.source?.startsWith("'use strict';")).toBe(true)
	})

	test('await in trusted JS creates a discriminated async template', async () => {
		const compiled = await galley('{@js}return await Promise.resolve("ok"){@js}', { allowCode: true })
		expect(compiled.async).toBe(true)
		expect(await compiled.render({}, util as any)).toBe('ok')
	})
})
