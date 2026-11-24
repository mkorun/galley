import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'

const render = async (source: string, data: object = {}, options = {}) => (await galley(source, options)).render(data)

test('B6: several positional expressions preserve commas, filters and parameter order', async () => {
	expect(await render('{#snippet card(article, featured)}{ article }{ featured }{/snippet}{@render card(b, 3)}', { b: 'B' })).toBe('B3')
	expect(await render('{#snippet s(a, b, c)}{ a };{ b };{ c }{/snippet}{@render s("a,b", value | replace(",", ";"), (flag | oneOf(true)))}', { value: 'x,y', flag: true })).toBe('a,b;x;y;true')
	expect(await render('{#each xs as x}{#snippet s(a, b)}{ a }{ b }{/snippet}{@render s(isFirst, isLast)}{/each}', { xs: [1, 2] })).toBe('truefalsefalsetrue')
})

test('B6: render arity is exact in both directions and resolves lexical declarations', async () => {
	for (const [params, args, expected, actual] of [['x', '', 1, 0], ['', 'value', 0, 1], ['x, y', 'value', 2, 1], ['x', 'value, value', 1, 2]] as const) {
		const source = `{#snippet s(${params})}fixed{/snippet}{@render s(${args})}`
		const diagnostic = (await lint(source))[0]!
		expect(diagnostic).toMatchObject({ code: 'G3020', severity: 'error', message: `Snippet s takes ${expected} argument${expected === 1 ? '' : 's'}, {@render} passes ${actual}` })
		expect(diagnostic.span.start).toBe(source.indexOf('{@render'))
		await expect(galley(source)).rejects.toThrow('G3020')
	}
	expect(await render('{#snippet s(x)}{ x }{/snippet}{#if true}{#snippet s(x, y)}{ x }{ y }{/snippet}{@render s(1, 2)}{/if}{@render s(3)}')).toBe('123')
	expect(await render('{#snippet s(x)}[{ x }]{/snippet}{@render s(undefined)}')).toBe('[]')
})

test('B6: every parameter is a distinct valid binding and owns its body scope', async () => {
	for (const params of ['x, x', 'x,', ',x', 'x, bad-name', 'x = 1', '...x']) await expect(galley(`{#snippet s(${params})}x{/snippet}`)).rejects.toThrow('G2222')
	for (const name of ['await', 'Array', 'undefined']) await expect(galley(`{#snippet s(x, ${name})}x{/snippet}`)).rejects.toThrow('G3007')
	await expect(galley('{#snippet s(x, y)}{@const y = 1}{/snippet}')).rejects.toThrow('G3021')
	expect(await render('{#snippet s(x, y)}{#if true}{@const y = 3}{ y }{/if}{ y }{/snippet}{@render s(1, 2)}')).toBe('32')
	for (const args of ['a,', ',a', 'a,,b']) await expect(galley(`{#snippet s(x, y)}x{/snippet}{@render s(${args})}`)).rejects.toThrow('Empty argument')
})

test('B6: JS forwards every parameter and checks argument counts at runtime', async () => {
	const options = { allowCode: true }
	expect(await render("{#snippet s(a, b)}[{ a }][{ b }]{/snippet}{@js}return s('a', 'b'){@js}", {}, options)).toBe('[a][b]')
	expect(await render("{#snippet s()}fixed{/snippet}{@js}return s(){@js}", {}, options)).toBe('fixed')
	for (const [params, args, expected, actual] of [['a, b', "'a'", 2, 1], ['a', '', 1, 0], ['', "'a'", 0, 1], ['a', "'a', 'b'", 1, 2]] as const) {
		const error = await render(`{#snippet s(${params})}fixed{/snippet}{@js}return s(${args}){@js}`, {}, options).catch(error => error)
		expect(error).toBeInstanceOf(TypeError)
		expect(error.message).toBe(`Snippet s takes ${expected} argument${expected === 1 ? '' : 's'}, JavaScript passes ${actual}`)
	}
})

test('B6: hidden URL and metadata parameters remain after the complete author list', async () => {
	const snippet = '{#snippet s(a, b)}{ a }{ b }{/snippet}'
	expect(await render(snippet + '<a href="{@render s(a, b)}">', { a: 'https:', b: '//example.org' })).toBe('<a href="https://example.org">')
	await expect(render(snippet + '<a href="{@render s(a, b)}">', { a: 'java', b: 'script:x' })).rejects.toThrow('G5001')
	expect(await render(snippet + '<meta content="{@render s(a, b)}">', { a: '', b: '' })).toBe('')
	expect(await render(snippet + '<meta content="{@render s(a, b)}">', { a: '', b: 'x' })).toBe('<meta content="x">')
	const js = snippet + '<a href="https://example.org/{@js}s("java", "script:x"); return "ok"{@js}">'
	expect(await render(js, {}, { allowCode: true })).toBe('<a href="https://example.org/ok">')
	expect(await render('{#snippet empty()}fixed{/snippet}<a href="/{@render empty()}">')).toBe('<a href="/fixed">')
})

test('B6: partial snippet libraries suppress only their unused warnings and retain argument places', async () => {
	const options = { includes: { import: async () => '{#snippet card(a, b)}{ a }{ b }{/snippet}{#snippet badge()}B{/snippet}' } }
	const source = '{@partial library.sort}{@render card("A", "B")}'
	expect(await lint(source, options)).toEqual([])
	expect(await render(source, {}, options)).toBe('AB')
	expect((await lint(source + '{#snippet unused()}U{/snippet}', options)).map(item => item.code)).toEqual(['G3006'])
	await expect(galley('{@partial library.sort}{@render card("A")}', options)).rejects.toThrow('G3020')
	const bad = '{#snippet s(a, b)}{ a }{ b }{/snippet}{@render s(x, s | missing)}'
	const diagnostic = (await lint(bad))[0]!
	expect(diagnostic.code).toBe('G3001')
	expect(diagnostic.span.start).toBe(bad.indexOf('missing'))
})


test('B6: nested filter argument failures retain their exact original offsets', async () => {
	const source = '{#snippet s(a, b)}{ a }{ b }{/snippet}{@render s(x, x | oneOf(y | missing))}'
	const diagnostic = (await lint(source))[0]!
	expect(diagnostic.code).toBe('G3001')
	expect(diagnostic.span.start).toBe(source.indexOf('missing'))
})


test('B6: every identifier character is accepted in snippet names and parameters', async () => {
	for (const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789') {
		const names = ['name' + char, ...(/[0-9]/.test(char) ? [] : [char + 'name'])]
		for (const name of names) {
			expect(await render(`{#snippet ${name}(${name}, other)}{ ${name} }{ other }{/snippet}{@render ${name}(1, 2)}`)).toBe('12')
		}
	}
})

test('B6: recursive calls and zero-parameter dynamic snippets preserve hidden arguments', async () => {
	expect(await render('{#snippet s(x, y)}{ y }{#if x}{@render s(false, "B")}{/if}{/snippet}{@render s(true, "A")}')).toBe('AB')
	const source = '{#snippet s()}{ value }{/snippet}<a href="{@render s()}">'
	expect(await render(source, { value: '/ok' })).toBe('<a href="/ok">')
	await expect(render(source, { value: 'javascript:x' })).rejects.toThrow('G5001')
})


test('B6: malformed snippet declarations and calls retain their structural diagnostic codes', async () => {
	for (const [source, code] of [
		['{@render (value)}', 'G2106'],
		['{@render s(value) trailing}', 'G2106'],
		['{@render s(value}', 'G2106'],
		['{@render bad-name(value)}', 'G2107'],
		['{@render 1s()}', 'G2107'],
		['{#snippet (x)}x{/snippet}', 'G2220'],
		['{#snippet s(x) trailing}x{/snippet}', 'G2220'],
		['{#snippet s(x}x{/snippet}', 'G2220'],
		['{#snippet bad-name(x)}x{/snippet}', 'G2221'],
		['{#snippet 1s()}x{/snippet}', 'G2221'],
	]) {
		expect((await lint(source!))[0]?.code, source).toBe(code)
		await expect(galley(source!)).rejects.toThrow(code!)
	}
})
