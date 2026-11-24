import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'

const render = async (source: string, data: object = {}) => (await galley(source)).render(data)

test('B9: position counts array and object items from one while indices keep their meaning', async () => {
	const source = '{#each xs as x, i}{ position }:{ i }:{ x };{/each}'
	expect(await render(source, { xs: ['A', 'B'] })).toBe('1:0:A;2:1:B;')
	expect(await render(source, { xs: { b: 'B', a: 'A' } })).toBe('1:b:B;2:a:A;')
	expect(await render(source, { xs: [] })).toBe('')
})

test('B9: position shadows every outer binding, nested loops own it and empty fallbacks inherit it', async () => {
	const data = { position: 'ROOT', xs: ['A', 'B'], ys: [1, 2] }
	expect(await render('{ position }{#each xs as x}{ position }/{ $.position };{/each}{ position }', data)).toBe('ROOT1/ROOT;2/ROOT;ROOT')
	expect(await render('{#each xs as x}{ position }[{#each ys as y}{ position }{/each}]{ position };{/each}', data)).toBe('1[12]1;2[12]2;')
	expect(await render('{#each xs as x}{#each empty as y}{ position }{:else}{ position }{/each}{/each}', data)).toBe('12')
	expect(await render('{#each empty as x}{ position }{:else}{ position }{/each}', data)).toBe('ROOT')
	expect(await render('{@const position = "constant"}{#each xs as x}{ position }/{ $.position };{/each}{ position }', data)).toBe('1/ROOT;2/ROOT;constant')
	expect(await render('{#snippet s(position)}{#each xs as x}{ position }/{ $.position };{/each}{ position }{/snippet}{@render s("parameter")}', data)).toBe('1/ROOT;2/ROOT;parameter')
})

test('B9: position is discovered in operands, constants, snippet arguments, bodies and partials', async () => {
	const source = '{#each xs as x}{@const n = position}{#snippet s(a, b)}{ a }{ b }{ position }{/snippet}{@render s(n, position)}{#if (position | oneOf(2)) && isLast}Y{/if}{/each}'
	expect(await render(source, { xs: [1, 2] })).toBe('111222Y')
	const partial = await galley('{#each xs as x}{@partial p.sort}{/each}', { includes: { import: async () => '{ position }' } })
	expect(partial.render({ xs: [1, 2] })).toBe('12')
})

test('B9: all loop metadata names share reservation and duplicate-binding rules', async () => {
	for (const name of ['position', 'length', 'isFirst', 'isLast']) {
		for (const names of [name, `x, ${name}`]) await expect(galley(`{#each xs as ${names}}x{/each}`)).rejects.toThrow('G2213')
		expect((await lint(`{#each xs as x}{@const ${name} = 1}{/each}`))[0]?.code).toBe('G3021')
	}
	expect(await render('{#each xs as x}{#if true}{@const position = 7}{ position }{/if}{ position }{/each}', { xs: [1] })).toBe('71')
})

test('B9: position is generated only when used and needs a counter but no collection size', async () => {
	for (const source of ['{#each xs as x}{ x }{/each}', '{#each xs as x}{ $.position }{/each}', '{#each xs as x}{:else}{ position }{/each}']) {
		const template = await galley(source, { debug: true })
		expect(template.source).not.toContain('const position=')
		expect(template.source).not.toContain('let $$n')
	}
	const template = await galley('{#each xs as x}{ position }{/each}', { debug: true })
	expect(template.source).toContain('const position=')
	expect(template.source).not.toContain('Object.keys')
	expect(template.source).not.toContain('const length=')
	expect(template.render({ xs: ['A', 'B'] })).toBe('12')
})
