import { expect, spyOn, test } from 'bun:test'
import galley, { lint } from '../index.js'
import * as analysis from '../compiler/analysis.js'

test('templates without dynamic metadata generate the same code with metadata removal enabled or disabled', async () => {
	for (const source of ['<a href="{ url }">link</a>', '<meta content="static"><p>{ title }</p>']) {
		const enabled = await galley(source, { debug: true })
		const disabled = await galley(source, { debug: true, stripEmptyMeta: false })
		expect(enabled.source).toBe(disabled.source)
	}
})

test('scripted snippet analysis is shared with the reader and spans survive strip', async () => {
	for (const strip of [false, true]) {
		const marking = spyOn(analysis, 'scriptedSnippets')
		try {
			const source = '{#snippet s()}\n x\n{/snippet}{#each xs as x}{@js}return s(){@js}{/each}'
			const options = { strip, allowCode: true }
			const template = await galley(source, options)
			expect(marking).toHaveBeenCalledTimes(1)
			expect(await template.render({ xs: [1] })).toBe(strip ? ' x' : ' x\n')
			marking.mockClear()
			expect((await lint(source, options)).filter(d => d.severity === 'error')).toEqual([])
			expect(marking).toHaveBeenCalledTimes(1)
		} finally { marking.mockRestore() }
	}
})

test('a template without JS does not walk snippet scopes to mark bindings', async () => {
	let marked = 0
	const add = Set.prototype.add
	const spy = spyOn(Set.prototype, 'add').mockImplementation(function (this: Set<unknown>, value: unknown) {
		if (typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'snippet') marked++
		return add.call(this, value)
	})
	try {
		expect((await galley('{#snippet s()}x{/snippet}{@render s()}')).render({})).toBe('x')
		// Lint records the declaration and its use; marking would add it again to the visible set.
		expect(marked).toBe(2)
	} finally { spy.mockRestore() }
})

test('loop metadata collisions retain the loop declaration source through partials', async () => {
	const source = '{@partial outer.sort}'
	const options = { includes: { basedir: 'parts', import: async (path: string) => path.endsWith('outer.sort') ? '{#each xs as x}{@partial inner.sort}{/each}' : '{@const position = 1}' } }
	const diagnostics = await lint(source, options)
	expect(diagnostics).toHaveLength(1)
	expect(diagnostics[0]!.code).toBe('G3021')
	expect(diagnostics[0]!.message).toBe('The name position is declared twice in the same generated scope: {@partial outer.sort} at <template>:1:1 -> parts/outer.sort:1:1 and {@partial outer.sort} at <template>:1:1 -> {@partial inner.sort} at parts/outer.sort:1:16 -> parts/inner.sort:1:1')
	await expect(galley(source, options)).rejects.toThrow('G3021')
	expect((await galley('{#each xs as x}{#if x}{@const position = 3}{ position }{/if}{:else}{@const position = 4}{ position }{/each}')).render({ xs: [] })).toBe('4')
})

test('a loop without declarations builds no metadata-name map', async () => {
	let entries = 0
	const set = Map.prototype.set
	const spy = spyOn(Map.prototype, 'set').mockImplementation(function (this: Map<unknown, unknown>, key: unknown, value: unknown) {
		if (['length', 'isFirst', 'isLast', 'position'].includes(key as string) && Array.isArray(value)) entries++
		return set.call(this, key, value)
	})
	try {
		expect((await galley('{#each xs as x}{ x }{/each}')).render({ xs: [1] })).toBe('1')
		expect(entries).toBe(0)
	} finally { spy.mockRestore() }
})
