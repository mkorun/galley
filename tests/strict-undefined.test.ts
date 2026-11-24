import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'

const filters = { text: (value: unknown) => value == null ? '' : String(value), vanish: () => undefined, second: (_: unknown, value: unknown) => value, keep: (value: unknown) => value }
const render = async (source: string, data: object = {}, options = {}) => (await galley(source, { filters, strictUndefined: true, ...options })).render(data)
const stops = async (source: string, expression: string, data: object = {}, options = {}) => {
	const template = await galley(source, { filters, strictUndefined: true, sourceId: 'strict.chase', ...options })
	const offset = source.indexOf(expression), before = source.slice(0, offset).split('\n')
	const message = `G5002: ${expression} is undefined at strict.chase:${before.length}:${before.at(-1)!.length + 1}`
	try { await template.render(data); throw new Error('Expected G5002') }
	catch (error) { expect((error as Error).message).toBe(message) }
}

test('B8: output, raw, collection and const check the whole value before coercion', async () => {
	for (const source of ['{ user.address.city }', '{@raw user.address.city}', '<a href="{ user.address.city }">link</a>', '{@const x = user.address.city}', '{@const x = user.address.city}{#if x}yes{/if}', '{#each user.address.city as x}{ x }{/each}']) {
		for (const data of [{}, { user: {} }, { user: { address: {} } }]) await stops('\n' + source, 'user.address.city', data)
		for (const options of [{}, { strictUndefined: false }]) expect(await (await galley(source, options)).render({})).toBe(source.startsWith('<a') ? '<a href="">link</a>' : '')
	}
	for (const value of [null, false, 0, '']) expect(await render('[{ value }][{@raw value}]{@const x = value}[{ x }]', { value })).toBe(value === null ? '[][][]' : `[${value}][${value}][${value}]`)
	for (const fallback of ['', '{:else}empty']) {
		const source = `{#each xs as x}{ x }${fallback}{/each}`
		await stops(source, 'xs')
		for (const xs of [null, [], {}]) expect(await render(source, { xs })).toBe(fallback ? 'empty' : '')
	}
	expect(await render("{ missing ?? 'd' }{ a || b }", { b: 'B' })).toBe('dB')
	expect(await render("{@const optional = missing ?? ''}{#if optional}yes{:else}no{/if}")).toBe('no')
})

test('B8: only the first filter input is checked; results and arguments belong to the filter', async () => {
	await stops('{ missing | upper }', 'missing')
	await stops('{ value | vanish }', 'value | vanish', { value: 'x' })
	await stops('{ value | vanish | upper }', 'value | vanish | upper', { value: 'x' })
	expect(await render('{ value | vanish | text }', { value: 'x' })).toBe('')
	expect(await render('{ value | second(missing) | text }', { value: 'x' })).toBe('')
	await stops('{ value | second(missing) }', 'value | second(missing)', { value: 'x' })
	await stops('{ value | second(missing | upper) }', 'missing', { value: 'x' })
	await stops('{@const live = missing | oneOf(1)}', 'missing')
	expect(await render("{@const live = missing ?? '' | oneOf(1)}{ live }")).toBe('false')
})

test('B8: conditions propagate leniency through every operand and nested filter argument', async () => {
	for (const condition of ['missing', '!missing', '!(missing | upper)', '(missing | upper) | text', 'missing || (other | upper)', '(missing | upper) === other', 'value | second(missing | upper)']) {
		expect(await lint(`{#if ${condition}}yes{:else if ${condition}}yes{:else}no{/if}`, { filters, strictUndefined: true })).toEqual([])
		await render(`{#if ${condition}}yes{:else if ${condition}}yes{:else}no{/if}`, { value: 'x' })
	}
	await stops('{ a || (missing | upper) }', 'missing', { a: false })
	await stops('{@const live = !(missing | upper)}', 'missing')
	await stops('{@const live = (missing | upper) | text}', 'missing')
	await stops('{@raw (missing | upper) || value}', 'missing', { value: 'x' })
	for (const [expression, data, expected] of [['a || (missing | upper)', { a: 'A' }, 'A'], ['a && (missing | upper)', { a: false }, 'false'], ['a ?? (missing | upper)', { a: '' }, '']] as const) {
		expect(await render(`{ ${expression} }`, data)).toBe(expected)
	}
})

test('B8: snippet arguments are checked at use, but a pipe in an argument is checked there', async () => {
	const declaration = '{#snippet s(x)}{#if x}yes{:else}no{/if}{/snippet}'
	expect(await render(declaration + '{@render s(missing)}')).toBe('no')
	await stops(declaration + '{@render s(missing | upper)}', 'missing')
	for (const body of ['{ x }', '{@const y = x}', '{#each x as y}{ y }{/each}', '{ x | upper }']) {
		const template = await galley(`{#snippet s(x)}${body}{/snippet}{@render s(missing)}`, { strictUndefined: true })
		expect(() => template.render({})).toThrow('G5002: x is undefined')
	}
})

test('B8: getters and proxies are read once in all four positions, also when undefined', async () => {
	for (const source of ['{ value }', '{@raw value}', '{@const x = value}', '{#each value as x}{ x }{/each}', '{#snippet s(x)}static{/snippet}{@render s(value | keep)}']) for (const value of [undefined, ['ok']]) {
		let reads = 0
		const data = new Proxy({ get value() { reads++; return value } }, { get(target, key, receiver) { return Reflect.get(target, key, receiver) } })
		if (value === undefined) await stops(source, 'value', data)
		else await render(source, data)
		expect(reads).toBe(1)
	}
})

test('B8: source places survive partials, strip, async render and snippet specialization', async () => {
	const source = '\n<!-- removed -->\n<galley:config>ignored</galley:config>\n  { missing.path }'
	for (const allowCode of [false, true]) for (const strip of [false, true]) await stops(source, 'missing.path', {}, { allowCode, strip })
	const template = await galley('{@partial p.sort}', { strictUndefined: true, strip: true, includes: { basedir: 'parts', import: async () => '\n{ missing.path }' } })
	expect(() => template.render({})).toThrow('G5002: missing.path is undefined at parts/p.sort:2:3')
	const off = await galley('{ value }', { debug: true })
	expect(off.source).toBe((await galley('{ value }', { debug: true, strictUndefined: false })).source)
	expect(off.source).not.toContain('$$defined')
})
