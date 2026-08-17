import { describe, expect, test } from 'bun:test'
import { lint } from '../index'
import { render } from './helpers'

// Regression tests for three code-injection vectors found in review (2026-08-17):
// bracket-notation paths, pipe arguments, and comparison-RHS string literals
// could all smuggle arbitrary JS into the generated render function — even
// with allowCode:false and no {@js} block involved. Fixed by validating the
// content spliced into generated code at each of these points.

describe('bracket-notation paths reject non-path content', () => {
	test('quoted special dot segment cannot escape generated property access', async () => {
		;(globalThis as any).__PWNED = false
		const html = await render('{ meta.bad-"].constructor }', { meta: {} })
		expect((globalThis as any).__PWNED).toBe(false)
		expect(html).toContain('meta.bad-"')
	})

	test('function-call payload in bracket path does not execute, falls back to literal', async () => {
		;(globalThis as any).__PWNED = false
		const html = await render(
			`{ meta[$.constructor.constructor('globalThis.__PWNED=true')()] }`,
			{ meta: { title: 'x' } },
		)
		expect((globalThis as any).__PWNED).toBe(false)
		expect(html).toContain('constructor')
	})

	test('nested brackets fall back to literal instead of producing broken JS', async () => {
		const html = await render(`{ meta[tags[0]] }`, { meta: { a: 1 }, tags: ['a'] })
		expect(html).toContain('meta[tags[0]]')
	})

	test('plain numeric index still resolves', async () => {
		expect(await render('{ items[0] }', { items: ['first', 'second'] })).toBe('first')
	})

	test('scope-variable index in a loop still resolves', async () => {
		expect(await render('{#each items as item, i}{ items[i] }{/each}', { items: ['a', 'b'] }))
			.toBe('ab')
	})

	test('string-key bracket access still resolves', async () => {
		expect(await render(`{ meta['og:title'] }`, { meta: { 'og:title': 'Hi' } })).toBe('Hi')
	})

})

describe('{#each} collection expression rejects code injection', () => {

	test('function-call payload as collection throws a compile error', async () => {
		await expect(render(
			`{#each meta[$.constructor.constructor('return [1]')()] as x}{ x }{/each}`,
			{ meta: {} },
		)).rejects.toThrow(/Invalid collection expression/i)
	})

})

describe('pipe arguments reject non-literal, non-path content', () => {

	test('call-expression pipe argument does not execute, falls back to literal', async () => {
		;(globalThis as any).__PWNED = false
		const html = await render(
			`{ meta.title | dateFormat(($.constructor.constructor('globalThis.__PWNED=true')(),0)) }`,
			{ meta: { title: 'x' } },
		)
		expect((globalThis as any).__PWNED).toBe(false)
		expect(html).toContain('constructor')
	})

	test('single literal arg still works', async () => {
		expect(await render('{ title | truncate(5) }', { title: 'hello world' })).toBe('hello…')
	})

	test('multiple comma-separated literal args still work', async () => {
		expect(await render("{ title | truncate(5, '...') }", { title: 'hello world' }))
			.toBe('hello...')
	})

	test('scope-path arg still works', async () => {
		const result = await render("{ d | dateFormat(meta.lang) }", { d: '2024-01-15', meta: { lang: 'en' } })
		expect(result).toContain('2024')
	})

})

describe('comparison RHS rejects code injection disguised as a string literal', () => {

	test('string-concatenation payload is rejected at compile time', async () => {
		await expect(render(
			`{#if status === 'x'+($.constructor.constructor('return 1')())+'y'}HIT{/if}`,
			{ status: 'x' },
		)).rejects.toThrow()
	})

	test('plain string-literal comparison still works', async () => {
		expect(await render(`{#if status === 'published'}live{/if}`, { status: 'published' }))
			.toBe('live')
		expect(await render(`{#if status === 'published'}live{/if}`, { status: 'draft' }))
			.toBe('')
	})

	test('number-literal comparison still works', async () => {
		expect(await render('{#if count > 0}yes{/if}', { count: 3 })).toBe('yes')
	})

	test('path-vs-path comparison still works', async () => {
		expect(await render('{#if a === b}equal{/if}', { a: 'x', b: 'x' })).toBe('equal')
	})

})

describe('special path roots remain data keys, never generated JavaScript', () => {
	test('plus payload cannot reach a JavaScript global from ordinary output', async () => {
		process.env.GALLEY_INJECTION_SECRET = 'TOP-SECRET'
		try {
			expect(await render('{ a+process.env.GALLEY_INJECTION_SECRET }', {})).toBe('')
			expect(await render('{ a+process.env.GALLEY_INJECTION_SECRET }', {
				'a+process': { env: { GALLEY_INJECTION_SECRET: 'data-only' } },
			})).toBe('data-only')
		} finally {
			delete process.env.GALLEY_INJECTION_SECRET
		}
	})

	test('special roots are safe in const, if, each and pipe arguments', async () => {
		process.env.GALLEY_INJECTION_SECRET = 'TOP-SECRET'
		try {
			expect(await render('{@const x = a+process.env.GALLEY_INJECTION_SECRET}{x}', {})).toBe('')
			expect(await render('{#if a+process.env.GALLEY_INJECTION_SECRET}yes{/if}', {})).toBe('')
			expect(await render('{#each a+process.env as value}{value}{/each}', {})).toBe('')
			expect(await render('{ value | truncate(a+process.env.LIMIT) }', { value: 'abcdef' })).toBe('abcdef')
		} finally {
			delete process.env.GALLEY_INJECTION_SECRET
		}
	})

	test('colon root uses safe key access and lint remains side-effect free', async () => {
		expect(await render('{og:title}', { 'og:title': 'Open Graph' })).toBe('Open Graph')
		expect(lint('{a+process.env.SECRET}')).toEqual([])
	})

	test('bare "$" root addresses the context object, not a JavaScript binding, and does not reopen injection', async () => {
		process.env.GALLEY_INJECTION_SECRET = 'TOP-SECRET'
		try {
			// "$" resolves to the data object itself — never to the outer render-function scope.
			expect(await render('{@const whole = $}{ whole.title }', { title: 'ok' })).toBe('ok')
			// Only an exact "$" root gets this treatment; "$"-prefixed roots stay ordinary data keys.
			expect(await render('{ $process }', { '$process': 'data-only' })).toBe('data-only')
			expect(await render('{ $process.env.GALLEY_INJECTION_SECRET }', {})).toBe('')
		} finally {
			delete process.env.GALLEY_INJECTION_SECRET
		}
	})
})
