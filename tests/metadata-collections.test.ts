import { expect, test } from 'bun:test'
import galley from '../index.js'

const render = async (source: string, data: object) => (await galley(source)).render(data)
const lists = { 1: ['ONE'], 2: ['TWO'], true: ['TRUE'], false: ['FALSE'], root: ['ROOT'] }
const cases = [['length', 'TWOTWO'], ['position', 'ONETWO'], ['isFirst', 'TRUEFALSE'], ['isLast', 'FALSETRUE']] as const

test('the recorded nested length collection reads loop metadata', async () => {
	expect(await render('{#each xs as x}{#each lists[length] as y}{ y }{/each}{/each}', { xs: [1], lists: { 1: ['OK'] } })).toBe('OK')
})

test('conditional branches retain loop annotations, including loops in an each fallback', async () => {
	const source = '{#if show}{#each missing as x}{ x }{:else}{#each xs as y}{ position }/{ length }/{ isLast };{/each}{/each}{/if}'
	const data = { show: true, xs: ['a', 'b'] }
	expect(await render(source, data)).toBe('1/2/false;2/2/true;')
	expect(await render(source, { ...data, show: false })).toBe('')
})

test('conditions outside loops read metadata names from data', async () => {
	for (const name of ['length', 'position', 'isFirst', 'isLast']) {
		const source = `{#if ${name}}yes{:else}no{/if}`
		expect(await render(source, { [name]: true })).toBe('yes')
		expect(await render(source, { [name]: false })).toBe('no')
	}
})

for (const [name, expected] of cases) {
	for (const path of [`lists[${name}]`, `nested.lists[${name}]`]) {
		test(`nested collection ${path} discovers surrounding metadata`, async () => {
			const data = { xs: [1, 2], lists, nested: { lists }, [name]: 'root' }
			expect(await render(`{#each xs as x}{#each ${path} as y}{ y }{/each}{/each}`, data)).toBe(expected)
		})
	}
}

test('collection metadata belongs to the enclosing loop, not the new loop or its fallback', async () => {
	const data = { xs: [1, 2], lists, position: 2 }
	expect(await render('{#each lists[position] as y}{ y }{/each}', data)).toBe('TWO')
	expect(await render('{#each xs as x}{#each lists[position] as y}{ position }:{ y };{/each}{/each}', data)).toBe('1:ONE;1:TWO;')
	expect(await render('{#each xs as x}{#each missing as y}{:else}{#each lists[position] as z}{ z }{/each}{/each}{/each}', data)).toBe('ONETWO')
})

test('output, const, render, pipe arguments and conditions already discover metadata independently', async () => {
	for (const [name, expected] of cases) {
		const data = { xs: [1, 2], lists, [name]: 'root' }
		for (const body of [
			`{ lists[${name}] }`,
			`{@const chosen = lists[${name}]}{ chosen }`,
			`{@render s(lists[${name}])}`,
			`{ lists[${name}] | join }`,
			`{ value | take(lists[${name}]) }`,
		]) {
			const template = await galley(`{#snippet s(value)}{ value }{/snippet}{#each xs as x}${body}{/each}`, { filters: { take: (_value, chosen) => chosen } })
			expect(await template.render(data), body).toBe(expected)
		}
		const template = `{#each xs as x}{#if ${name} === 1}ONE{:else if ${name} === 2}TWO{:else if ${name} === true}TRUE{:else if ${name} === false}FALSE{:else}ROOT{/if}{/each}`
		expect(await render(template, data), template).toBe(expected)
	}
})


test('unary operands independently discover every loop metadata name', async () => {
	for (const [name, expected] of [['length', 'falsefalse'], ['position', 'falsefalse'], ['isFirst', 'falsetrue'], ['isLast', 'truefalse']]) {
		expect(await render(`{#each xs as x}{@raw !${name}}{/each}`, { xs: [1, 2] })).toBe(expected!)
	}
})
