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

const numberError = async (source: string, number: string, code: string, help: string) => {
	const error = await galley(source).catch(error => error)
	expect(error).toBeInstanceOf(GalleyDiagnosticError)
	expect(error.diagnostic.code).toBe(code)
	expect(error.diagnostic.span.start).toBe(source.indexOf(number))
	expect(error.diagnostic.span.end).toBe(source.indexOf(number) + number.length)
	expect(error.diagnostic.help).toBe(help)
	expect((await lint(source))[0]).toEqual(error.diagnostic)
	return error.diagnostic.message as string
}
const placements = (path: string) => [`{ ${path} }`, `{@raw ${path}}`, `{@const x = ${path}}`, `{#if ${path}}y{/if}`, `{#each ${path} as x}{/each}`, `{#snippet s(x)}{ x }{/snippet}{@render s(${path})}`]

test('G1106: a leading zero in brackets is refused as in a literal, with the same message and spelling', async () => {
	for (const [number, replacement] of [['007', '7'], ['-01', '-1'], ['00', '0'], ['-00', '-0']]) {
		for (const path of [`a[${number}]`, `a[ ${number} ]`, `a.b[${number}].c`]) {
			for (const source of placements(path)) {
				expect(await numberError(source, number, 'G1106', `Write ${replacement} without leading zeros.`)).toBe(`Number ${number} has a leading zero`)
			}
		}
	}
})

test('G1107: a number beyond Number.MAX_SAFE_INTEGER is refused in brackets and as a literal', async () => {
	const help = 'Write it as a quoted string, or pass it in template data.'
	const nines = '9'.repeat(310)
	for (const number of ['9007199254740992', '9007199254740993', '-9007199254740993', '1000000000000000000000', nines]) {
		for (const source of placements(`a[${number}]`)) {
			expect(await numberError(source, number, 'G1107', help)).toBe(`Number ${number} exceeds the largest safe integer, ${Number.MAX_SAFE_INTEGER}, in magnitude`)
		}
	}
	for (const number of ['9007199254740992', '9007199254740993', '-9007199254740993', '9007199254740991.5', '1000000000000000000000', nines, `${nines}.5`]) {
		for (const source of [`{@raw ${number}}`, `{#if n === ${number}}y{/if}`, `{@const n = ${number}}`, `{ n ?? ${number} }`, `{ n | oneOf(${number}) }`]) await numberError(source, number, 'G1107', help)
	}
	// Decided on the spelling: Number() rounds each of these to the bound itself.
	const rounded = ['9007199254740991.1', '-9007199254740991.1', '9007199254740991.499', '-9007199254740991.000001', ...'123456789'.split('').map(digit => `9007199254740991.0${digit}`)]
	for (const number of rounded) {
		for (const source of [`{@raw ${number}}`, `{@const n = ${number}}{ n }`, `{ n | oneOf(${number}) }`, `{#snippet s(x)}{ x }{/snippet}{@render s(${number})}`]) await numberError(source, number, 'G1107', help)
		const includes = { import: () => Promise.resolve(`{@raw ${number}}`) }
		for (const result of [await galley('{@partial p.sort}', { includes }).catch(error => error.diagnostic), (await lint('{@partial p.sort}', { includes }))[0]]) {
			expect(result.code).toBe('G1107')
			expect(result.span.source.text.slice(result.span.start, result.span.end)).toBe(number)
		}
	}
	// 0.5.0 wrote Infinity as an identifier that a constant could shadow.
	await numberError(`{@const Infinity = 'x'}{ a[${nines}] }`, nines, 'G1107', help)
})

test('a safe integer in brackets reaches the generated code as the integer the template wrote', async () => {
	const a = { '9007199254740991': 'max', '-9007199254740991': 'min', '7': 'seven', '0': 'zero' }
	for (const [path, expected] of [['a[9007199254740991]', 'max'], ['a[-9007199254740991]', 'min'], ['a[ 7 ]', 'seven'], ['a[0]', 'zero'], ['a[-0]', 'zero']]) {
		const source = `{ ${path} }`
		expect(await lint(source)).toEqual([])
		const template = await galley(source, { debug: true })
		expect(template.render({ a })).toBe(expected)
		expect(template.source).toContain(`?.[${path.slice(2, -1).trim().replace('-0', '0')}]`)
	}
	for (const number of ['9007199254740991', '-9007199254740991', '9007199254740991.0', '-9007199254740991.000', '9007199254740990.5', '0.5', '1.25', '-1.25']) {
		expect(await lint(`{ ${number} }`)).toEqual([])
		expect((await galley(`{@raw ${number}}`)).render({})).toBe(String(Number(number)))
	}
})

test('a brace that is no galley expression stays text whatever numbers it holds, as in 0.5.0', async () => {
	for (const tag of ['a[9007199254740992]()', 'a[007]()', 'a[007] === f()', 'a[9007199254740991.1]()']) {
		const script = `<script>if (true) { ${tag}; }</script>`
		const text = `<p>{ ${tag} }</p>`
		for (const strictBraces of [false, true]) {
			expect(await lint(script, { strictBraces })).toEqual([])
			expect((await galley(script, { strictBraces })).render({})).toBe(script)
		}
		expect(await lint(text)).toEqual([])
		expect((await galley(text)).render({})).toBe(text)
		// With strictBraces the brace is refused for the reason 0.5.0 gave, not for its number.
		const error = await galley(text, { strictBraces: true }).catch(error => error)
		expect(error).toBeInstanceOf(GalleyDiagnosticError)
		expect(error.diagnostic.code).toBe('G3019')
		expect(error.diagnostic.message).toBe(tag.includes('.1]') ? 'Literal { in text: Expected a path segment, found "9"' : 'Literal { in text: Unexpected "()" after path')
		expect(error.diagnostic.span.start).toBe(3)
		expect((await lint(text, { strictBraces: true }))[0]).toEqual(error.diagnostic)
	}
	// A directive stops either way; a malformed one keeps the diagnostic 0.5.0 gave.
	for (const [source, code] of [['{@const a = a[007]()}', 'G2108'], ['{#each a[007]() as x}{/each}', 'G2216'], ['{#if a[007]()}y{/if}', 'G1006'], ['{@raw a[9007199254740992]()}', 'G1006']]) {
		const error = await galley(source!).catch(error => error)
		expect(error.diagnostic.code).toBe(code)
		expect((await lint(source!))[0]).toEqual(error.diagnostic)
	}
})
