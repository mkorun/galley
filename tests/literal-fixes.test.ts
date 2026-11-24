import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index.js'

test('G1106: leading-zero numbers fail at the literal, including negatives and decimals', async () => {
	for (const [number, replacement] of [['007', '7'], ['-01', '-1'], ['00', '0'], ['-00', '-0'], ['00.5', '0.5'], ['0009.50', '9.50']]) {
		for (const source of [`{#if n === ${number}}yes{/if}`, `{@const n = ${number}}`, `{@raw ${number}}`, `{ n ?? ${number} }`, `{ n | oneOf(${number}) }`, `{#snippet s(x)}{ x }{/snippet}{@render s(${number})}`]) {
			const error = await galley(source).catch(error => error)
			expect(error).toBeInstanceOf(GalleyDiagnosticError)
			expect(error.diagnostic.code).toBe('G1106')
			expect(error.diagnostic.span.start).toBe(source.indexOf(number!))
			expect(error.diagnostic.span.end).toBe(source.indexOf(number!) + number!.length)
			expect(error.diagnostic.help).toBe(`Write ${replacement} without leading zeros.`)
			expect((await lint(source))[0]).toEqual(error.diagnostic)
		}
	}
	for (const number of ['0', '-0', '0.5', '-0.5', '10', '-10', '123.45']) {
		expect((await galley(`{@raw ${number}}`)).render({})).toBe(String(Number(number)))
	}
})

test('quoted operands form comparisons; a literal containing its own quote is still G1101', async () => {
	for (const [expression, expected] of [["'x' === 'y'", 'no'], ['"x" === "x"', 'yes'], ["'a' !== 'b'", 'yes'], ["'a' < 'b'", 'yes'], ["'a' === 'a' && 'b' === 'b'", 'yes'], ["'a' === 'b' || 'c' === 'c'", 'yes'], ["'a===b' === 'a===b'", 'yes'], ["'!<=>|?' === '!<=>|?'", 'yes']]) {
		const source = `{#if ${expression}}yes{:else}no{/if}`
		expect(await lint(source)).toEqual([])
		expect((await galley(source)).render({})).toBe(expected)
		expect((await galley(`{@const result = ${expression}}{ result }`)).render({})).toBe(expected === 'yes' ? 'true' : 'false')
	}
	for (const literal of ["'a'b'", '"a"b"', "'a\\b'", "'a<=>b'c'", "'a' + 'b'"]) {
		await expect(galley(`{#if ${literal}}yes{/if}`)).rejects.toThrow('G1101')
		expect((await lint(`{#if ${literal}}yes{/if}`))[0]!.code).toBe('G1101')
	}
})

test('a quote at only one end cannot turn a path into a string', async () => {
	for (const value of ["name'", 'name"', "'name", '"name']) {
		for (const directive of ['raw', 'const result =']) {
			const source = `{@${directive} ${value}}`
			const code = directive === 'raw' ? (value.startsWith('name') ? 'G1006' : 'G1001') : 'G2108'
			const error = await galley(source).catch(error => error)
			expect(error).toBeInstanceOf(GalleyDiagnosticError)
			expect(error.diagnostic.code).toBe(code)
			expect((await lint(source))[0]).toEqual(error.diagnostic)
		}
	}
})

test('outputs containing quoted comparisons render values; escaping the brace preserves text', async () => {
	for (const source of ["<p>{ a || 'x' === 'y' }</p>", "<p>{ a | oneOf('x' === 'y') }</p>"]) {
		expect((await galley(source)).render({ a: 0 })).toBe('<p>false</p>')
		const escaped = source.replace('{', '\\{')
		expect((await galley(escaped)).render({ a: 0 })).toBe(source)
	}
})
