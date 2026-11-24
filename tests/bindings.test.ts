import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index.js'

const bindings = (name: string) => [
	`{#each xs as ${name}}{ ${name} }{/each}`,
	`{#each xs as item, ${name}}{ ${name} }{/each}`,
	`{#snippet s(${name})}{ ${name} }{/snippet}{@render s(value)}`,
	`{@const ${name} = value}{ ${name} }`,
	`{#snippet ${name}()}ok{/snippet}{@js}return ''{@js}`,
]

test('B1: every binding refuses engine-invalid names and generated globals with a place', async () => {
	for (const name of ['class', 'new', 'let', 'eval', 'arguments', 'yield', 'implements', 'interface', 'await', 'String', 'Object', 'Array', 'TypeError', 'undefined']) {
		for (const source of bindings(name)) {
			const error = await galley(source, { sourceId: 'bindings.chase', allowCode: true }).catch(error => error)
			expect(error, source).toBeInstanceOf(GalleyDiagnosticError)
			expect(error.diagnostic.code, source).toBe('G3007')
			expect(error.message).toContain(name)
			expect(error.message).toContain('bindings.chase:1:1')
			expect((await lint(source, { allowCode: true })).some(item => item.code === 'G3007')).toBe(true)
		}
	}
	for (const name of ['async', 'of', 'from', 'get', 'set', 'constructor']) {
		for (const source of bindings(name)) expect((await lint(source, { allowCode: true })).some(item => item.severity === 'error')).toBe(false)
	}
	await expect(galley('{@const await = 1}{@js}return await Promise.resolve(1){@js}', { allowCode: true })).rejects.toThrow('G3007')
	await expect(galley('{#snippet s(Array)}{#each xs as x}{ x }{/each}{/snippet}{@render s(value)}')).rejects.toThrow('G3007')
	await expect(galley('{#each xs as Object}{#each xs as x}{ x }{/each}{/each}')).rejects.toThrow('G3007')
})

test('B1: only snippet names bound for JS must pass the binding questions', async () => {
	for (const name of ['new', 'String', 'undefined']) {
		const source = `{#snippet ${name}(x)}{ x }{/snippet}{@render ${name}(1)}`
		expect(await (await galley(source)).render({})).toBe('1')
		await expect(galley(source + "{@js}return ''{@js}", { allowCode: true })).rejects.toThrow('G3007')
	}
	await expect(galley('{#snippet s(x)}[{ x }]{/snippet}{@const undefined = "LEAK"}{@render s()}')).rejects.toThrow('G3007')
})

test('B1: duplicate declarations report the second source, including expanded partials', async () => {
	for (const [source, second] of [
		['{@const a = 1}{@const a = 2}', '{@const a = 2}'],
		['{#snippet s(x)}{@const x = 1}{ x }{/snippet}{@render s(value)}', '{@const x = 1}'],
		...['length', 'isFirst', 'isLast'].map(name => [`{#each xs as x}{@const ${name} = 5}{ ${name} }{/each}`, `{@const ${name} = 5}`]),
		['{#snippet s(x)}x{/snippet}{@const s = 1}{@js}return s(){@js}', '{@const s = 1}'],
		['{@const s = 1}{#snippet s(x)}x{/snippet}{@js}return s(){@js}', '{#snippet s(x)}'],
		['{#snippet s(x)}{#snippet x(y)}b{/snippet}{@js}return x(1){@js}{/snippet}{@render s(1)}', '{#snippet x(y)}'],
	] as const) {
		const error = await galley(source!, { allowCode: true }).catch(error => error)
		expect(error, source).toBeInstanceOf(GalleyDiagnosticError)
		expect(error.diagnostic.code).toBe('G3021')
		expect(error.diagnostic.span.start).toBe(source!.indexOf(second!))
		expect((await lint(source!, { allowCode: true })).some(item => item.code === 'G3021')).toBe(true)
	}
	const options = { includes: { import: async () => '{@const a = 1}' } }
	const error = await galley('{@partial const.sort}{@partial const.sort}', options).catch(error => error)
	expect(error).toBeInstanceOf(GalleyDiagnosticError)
	expect(error.diagnostic.code).toBe('G3021')
	expect(error.diagnostic.span.source.id).toBe('./const.sort')
	expect(error.message).toContain('const.sort:1:1')
	expect(error.diagnostic.message).toContain('{@partial const.sort} at <template>:1:1')
	expect(error.diagnostic.message).toContain('{@partial const.sort} at <template>:1:22')
	expect(error.diagnostic.help).not.toContain('Rename the second declaration')
})

test('B1: inner constants shadow parameters and loop items; unscripted snippets have no JS binding', async () => {
	for (const [source, output] of [
		['{#snippet s(x)}{#if x}{@const x = 2}{ x }{/if}{/snippet}{@render s(value)}', '2'],
		['{#each xs as x}{@const x = 2}{ x }{/each}', '2'],
		['{#each xs as x, i}{@const i = 2}{ i }{/each}', '2'],
		['{#snippet s()}snippet{/snippet}{@const s = 1}{ s }{@render s()}', '1snippet'],
		['{@const a = 1}{#if value}{@const a = 2}{ a }{/if}{ a }', '21'],
		['{@const a = 1}{#each empty as x}{:else}{@const a = 2}{ a }{/each}{ a }', '21'],
		['{#snippet s()}outer{/snippet}{@const s = 1}{#if value}{#snippet s()}inner{/snippet}{@js}return s(){@js}{/if}{ s }', 'inner1'],
		['{ missing ?? value }', 'V'],
	]) expect(await (await galley(source!, { allowCode: true })).render({ xs: [1], value: 'V' })).toBe(output!)
})


test('B1: an engine failure other than invalid binding syntax is not hidden', async () => {
	const original = globalThis.Function
	try {
		globalThis.Function = function () { throw new EvalError('engine unavailable') } as unknown as FunctionConstructor
		await expect(lint('{@const a = 1}')).rejects.toThrow('engine unavailable')
	} finally { globalThis.Function = original }
})
