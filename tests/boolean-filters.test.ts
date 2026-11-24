import { expect, spyOn, test } from 'bun:test'
import galley, { lint, parse } from '../index.js'
import util from '../util.js'

const render = async (source: string, data: object = {}) => (await galley(source)).render(data)

test('B5: oneOf uses strict equality for literals, paths and every edge', async () => {
	const object = {}, other = {}
	for (const [value, candidate, expected] of [[1, '1', false], [NaN, NaN, false], [object, object, true], [object, other, false], [null, null, true], [0, -0, true]]) {
		expect(util.oneOf(value, candidate)).toBe(expected as boolean)
		expect(await render('{#if value | oneOf(candidate)}y{:else}n{/if}', { value, candidate })).toBe(expected ? 'y' : 'n')
	}
	expect(util.oneOf('x')).toBe(false)
	expect(await render("{#if style | oneOf('lines', 'ink', 'dots')}y{/if}", { style: 'ink' })).toBe('y')
})

test('B5: parenthesized pipes are operands and grouping stays in the AST', async () => {
	const data = { hidden: true, s: 'published', n: 2, xs: ['a', 'b'] }
	for (const condition of ["hidden || (s | oneOf('draft'))", "!(s | oneOf('draft'))", "(s | oneOf('published')) && n > 1", "(s | upper) === 'PUBLISHED'", "(s | upper | lower) === s"]) {
		expect(await render(`{#if ${condition}}y{:else}n{/if}`, data)).toBe('y')
	}
	expect(await render("{ x ?? (s | upper) }", data)).toBe('PUBLISHED')
	expect(await render("{#each xs as x}{#if (isFirst | oneOf(true)) && (isLast | oneOf(false))}{ length }{/if}{/each}", data)).toBe('2')
	const ast = parse({ id: 'group', text: '{@const c = (a || b) | upper}' })
	expect(ast.children[0]).toMatchObject({ expression: { input: { parenthesized: true, kind: 'binary' } } })
})

test('B5: outputs with parenthesized pipes render or report the registered-filter and script/style rules', async () => {
	const output = '{ a || (b | upper) }'
	expect(await render(`<p>${output}</p>`, { b: 'b' })).toBe('<p>B</p>')
	await expect(galley('<p>{ a || (b | absent) }</p>')).rejects.toThrow('G3001')
	for (const tag of ['script', 'style']) {
		await expect(galley(`<${tag}>{ a || (b | absent) }</${tag}>`)).rejects.toThrow('G3001')
		await expect(galley(`<${tag}>${output}</${tag}>`)).rejects.toThrow('G3018')
	}
	for (const tag of ['p', 'script', 'style']) {
		expect(await render(`<${tag}>\\${output}</${tag}>`)).toBe(`<${tag}>${output}</${tag}>`)
	}
})

test('B5: operators after a pipe name parentheses in G1102 and G1103 help', async () => {
	for (const operator of ['??', '||', '&&', '===', '!==', '<', '>', '<=', '>=']) {
		for (const [pipe, code] of [['upper', 'G1102'], ["oneOf('published')", 'G1103']]) {
			const source = `{#if s | ${pipe} ${operator} n}y{/if}`
			const [diagnostic] = await lint(source)
			expect(diagnostic?.code).toBe(code!)
			expect(diagnostic?.help).toContain("{#if (s | oneOf('published')) && n > 1}")
			await expect(galley(source)).rejects.toThrow(code!)
		}
	}
	for (const [pipe, code] of [['bad-name', 'G1102'], ["oneOf('||') trailing", 'G1103'], ['upper(a || b', 'G1103'], ['upper[a || b]', 'G1102']]) {
		const [diagnostic] = await lint(`{#if s | ${pipe}}y{/if}`)
		expect(diagnostic?.code).toBe(code!)
		expect(diagnostic?.help).toBeUndefined()
	}
	expect(await render("{#if (s | oneOf('published')) && n > 1}y{/if}", { s: 'published', n: 2 })).toBe('y')
	expect(await render('{#if (b | upper) || a}y{/if}', { b: 'b' })).toBe('y')
})

test('B5: G3022 points at the complete pipe expression, including its nested source', async () => {
	const source = 'line\n{#if flag && (a || b | upper)}y{/if}'
	const error = await galley(source, { sourceId: 'article.chase' }).catch(error => error)
	const [diagnostic] = await lint(source, { sourceId: 'article.chase' })
	for (const item of [diagnostic, error.diagnostic]) {
		expect(item.code).toBe('G3022')
		expect(item.span.start).toBe(source.indexOf('a || b'))
		expect(item.span.end).toBe(source.indexOf('upper') + 'upper'.length)
	}
})

test('B5: G3022 refuses ungrouped operators with a rewrite for their position', async () => {
	for (const operator of ['||', '&&', '===', '!==', '<', '>', '<=', '>=']) {
		for (const source of [`{ a ${operator} b | upper }`, `{@const c = a ${operator} b | upper}`, `{#if a ${operator} b | upper}y{/if}`, `{#if no}n{:else if a ${operator} b | upper}y{/if}`]) {
			const [diagnostic] = await lint(source)
			expect(diagnostic).toMatchObject({ code: 'G3022', severity: 'error' })
			expect(diagnostic!.help).toContain(source.startsWith('{ a') ? '{@const' : 'parentheses')
			await expect(galley(source)).rejects.toThrow('G3022')
		}
	}
	await expect(galley('{#if !a | upper}y{/if}')).rejects.toThrow('G3022')
	expect(await render('{@const chosen = a || b}{ chosen | upper }', { b: 'b' })).toBe('B')
	expect(await render('{@const chosen = (a || b) | upper}{ chosen }', { b: 'b' })).toBe('B')
	expect(await render('{#if (!a) | oneOf(true)}y{/if}', {})).toBe('y')
	expect(await render("{ a ?? 'fallback' | upper }")).toBe('FALLBACK')
	expect(await render("{ a || b ?? 'fallback' | upper }")).toBe('FALLBACK')
	expect(await render('{ (a || b) | upper }', { b: 'b' })).toBe('{ (a || b) | upper }')
})

test('B5: lint finds filters and ambiguous pipes throughout expression trees', async () => {
	for (const expression of ['(x | absent) || y', 'x && (y | absent)', '!(x | absent)', '(x | absent) | upper', 'x | oneOf(y | absent)']) {
		expect((await lint(`{#if ${expression}}y{/if}`)).map(item => item.code)).toEqual(['G3001'])
	}
	for (const expression of ['(a || b | upper) | lower', '!(a || b | upper)', 'x && (a || b | upper)', '(a || b | upper) && x', 'x | oneOf(a || b | upper)']) {
		expect((await lint(`{#if ${expression}}y{/if}`)).map(item => item.code)).toEqual(['G3022'])
	}
})

test('B5: plural uses host categories, including fractions and negative counts', async () => {
	const forms = { one: 'Kommentar', other: 'Kommentare', few: 'pliki', many: 'plików' }
	for (const [count, locale, expected] of [[1, 'de', 'Kommentar'], [3, 'de', 'Kommentare'], [3, 'pl', 'pliki'], [5, 'pl', 'plików'], [-1, 'de', 'Kommentar'], [1.5, 'de', 'Kommentare']] as const) {
		expect(util.plural(count, locale, forms)).toBe(expected)
		expect(await render('{ count } { count | plural(locale, forms) }', { count, locale, forms })).toBe(`${count} ${expected}`)
	}
})

test('B5: plural rejects guesses with located failures and original error types', async () => {
	for (const count of [NaN, Infinity, -Infinity, '1', null, undefined]) expect(() => util.plural(count as number, 'de', {})).toThrow(TypeError)
	for (const locale of ['zz', 3, null, undefined]) expect(() => util.plural(1, locale as string, {})).toThrow(TypeError)
	for (const locale of ['', 'bad_locale']) expect(() => util.plural(1, locale, {})).toThrow(RangeError)
	for (const forms of [null, undefined, 'word', { few: 3 }, { other: 'fallback' }]) expect(() => util.plural(3, 'pl', forms as any)).toThrow('plural has no form "few" for 3 in pl')
	const template = await galley('{ count | plural(locale, forms) }', { sourceId: 'plural.chase' })
	const error = await Promise.resolve().then(() => template.render({ count: NaN, locale: 'de', forms: {} })).catch(error => error)
	expect(error.message).toBe('G5003: filter plural failed at plural.chase:1:11: plural needs a finite number, not NaN')
	expect(error.cause).toBeInstanceOf(TypeError)
})


test('B5: plural caches rules per locale, without repeating host discovery', () => {
	const supported = spyOn(Intl.PluralRules, 'supportedLocalesOf')
	try {
		const forms = { one: 'one', other: 'other' }
		expect(util.plural(1, 'fr', forms)).toBe('one')
		expect(util.plural(2, 'fr', forms)).toBe('other')
		expect(supported).toHaveBeenCalledTimes(1)
	} finally { supported.mockRestore() }
})

test('B5: plural keeps the first 100 locales and discovers overflow locales on every render', () => {
	// A fresh process gives the public compiler an empty cache, independent of other tests.
	const child = Bun.spawnSync([process.execPath, '--eval', `
		import galley from './index.ts'
		import assert from 'node:assert/strict'
		let discoveries = 0
		const supported = Intl.PluralRules.supportedLocalesOf
		Intl.PluralRules.supportedLocalesOf = (...args) => { discoveries++; return supported(...args) }
		const template = await galley('{ count | plural(locale, forms) }')
		const totals = []
		for (let pass = 0; pass < 3; pass++) {
			for (let index = 0; index < 101; index++) {
				assert.equal(template.render({ count: 1, locale: 'en-x-cache' + index, forms: { one: 'one' } }), 'one')
			}
			totals.push(discoveries)
		}
		console.log(JSON.stringify(totals))
	`], { stdout: 'pipe', stderr: 'pipe', timeout: 3000 })
	expect(child.exitCode, child.stderr.toString()).toBe(0)
	expect(JSON.parse(child.stdout.toString())).toEqual([101, 102, 103])
})


test('B5: plural requires a locale string and an object of forms, even for host-coercible inputs', () => {
	for (const locale of [['de'], { 0: 'de', length: 1 }, new String('de')]) {
		expect(() => util.plural(1, locale as any, { one: 'one' })).toThrow('plural has no rules for the locale')
	}
	const callable = Object.assign(() => {}, { one: 'one' })
	expect(() => util.plural(1, 'de', callable as any)).toThrow('plural has no form "one"')
})
