import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint, parse } from '../index.js'
import type { SourceSpan } from '../index.js'

const sourceId = 'spans.chase'
const checkSpan = (at: SourceSpan, text: string, start: number, value: string) => {
	expect(at).toEqual({ source: { id: sourceId, text }, start, end: start + value.length })
	expect(text.slice(at.start, at.end)).toBe(value)
}
const runtimeError = async (text: string, start: number, value: string, data: object = {}, options = {}) => {
	const template = await galley(text, { strictUndefined: true, sourceId, ...options })
	const lines = text.slice(0, start).split('\n')
	try { await template.render(data); throw new Error('Expected G5002') }
	catch (error) { expect((error as Error).message).toBe(`G5002: ${value} is undefined at ${sourceId}:${lines.length}:${lines.at(-1)!.length + 1}`) }
}
const compileError = async (text: string, code: string, start: number, value: string) => {
	const diagnostics = await lint(text, { sourceId })
	expect(diagnostics[0]!.code).toBe(code)
	checkSpan(diagnostics[0]!.span, text, start, value)
	const error = await galley(text, { sourceId }).catch(error => error)
	expect(error).toBeInstanceOf(GalleyDiagnosticError)
	expect(error.diagnostic).toEqual(diagnostics[0])
}

test('const values follow the equals sign, even when the binding repeats their text', async () => {
	for (const prefix of ['{@const title = ', '{@const\ttitle =\n\t', '{@  const title  =  ']) {
		const text = prefix + 'title  }'
		const node = parse({ id: sourceId, text }).children[0]!
		if (node.kind !== 'const') throw new Error('Expected const')
		checkSpan(node.expression.span, text, prefix.length, 'title')
		await runtimeError(text, prefix.length, 'title')
	}
	for (const prefix of ['{@const n007 = ', '{@const\tn007 =\n  ']) await compileError(prefix + '007 }', 'G1106', prefix.length, '007')
	const prefix = '{@const bad = '
	await compileError(prefix + 'bad() }', 'G2108', prefix.length, 'bad()')
})

test('raw output follows the directive name; escaped output and repeated operands keep their positions', async () => {
	for (const [prefix, value] of [['{@raw ', 'raw'], ['{@ raw\t ', 'raw'], ['{  ', 'title']]) {
		const text = prefix + value + ' }'
		const node = parse({ id: sourceId, text }).children[0]!
		if (node.kind !== 'output') throw new Error('Expected output')
		checkSpan(node.expression.span, text, prefix!.length, value!)
		await runtimeError(text, prefix!.length, value!)
	}
	for (const prefix of ['{ ', '{@raw ']) {
		const text = prefix + 'title ?? title }'
		const node = parse({ id: sourceId, text }).children[0]!
		if (node.kind !== 'output' || node.expression.kind !== 'binary') throw new Error('Expected binary output')
		checkSpan(node.expression.left.span, text, prefix.length, 'title')
		checkSpan(node.expression.right.span, text, prefix.length + 9, 'title')
		await runtimeError(text, prefix.length, 'title ?? title')
	}
	await compileError('{ title ?? 007 }', 'G1106', 11, '007')
	await compileError('{@raw raw ?? 007}', 'G1106', 13, '007')
})

test('each collection spans exclude the keyword and the as/item suffix', async () => {
	for (const prefix of ['{#each ', '{#each\t  ']) {
		const text = prefix + 'each  as item}{ item }{/each}'
		const node = parse({ id: sourceId, text }).children[0]!
		if (node.kind !== 'each') throw new Error('Expected each')
		checkSpan(node.collection.span, text, prefix.length, 'each')
		await runtimeError(text, prefix.length, 'each')
	}
	await compileError('{#each each-name as item}{/each}', 'G2216', 7, 'each-name')
})

test('if and else-if conditions retain repeated keyword paths and operator operands', async () => {
	for (const name of ['if', 'i', 'f']) {
		const prefix = '{#if\t ', text = prefix + name + '}yes{:else}no{/if}'
		const node = parse({ id: sourceId, text }).children[0]!
		if (node.kind !== 'if') throw new Error('Expected if')
		checkSpan(node.branches[0]!.condition!.span, text, prefix.length, name)
		expect((await galley(text, { strictUndefined: true })).render({ [name]: true })).toBe('yes')
	}
	for (const name of ['else', 'if', 'e']) {
		const prefix = '{#if no}no{:else if \t ', text = prefix + name + '}yes{:else}no{/if}'
		const node = parse({ id: sourceId, text }).children[0]!
		if (node.kind !== 'if') throw new Error('Expected if')
		checkSpan(node.branches[1]!.condition!.span, text, prefix.length, name)
		expect((await galley(text, { strictUndefined: true })).render({ [name]: true })).toBe('yes')
	}
	await compileError('{#if if-name}yes{/if}', 'G1007', 5, 'if-name')
	await compileError('{#if no}no{:else if else-name}yes{/if}', 'G1007', 20, 'else-name')
})

test('render arguments repeat the snippet name without reusing its span', async () => {
	const declaration = '{#snippet render(a, b)}{ a }{ b }{/snippet}'
	const prefix = declaration + '{@render\t render( ', text = prefix + 'render, render )}'
	const node = parse({ id: sourceId, text }).children[1]!
	if (node.kind !== 'render') throw new Error('Expected render')
	checkSpan(node.arguments[0]!.span, text, prefix.length, 'render')
	checkSpan(node.arguments[1]!.span, text, prefix.length + 8, 'render')
	expect((await galley(text)).render({ render: 'X' })).toBe('XX')
	const piped = declaration + '{@render render(render, render | upper)}'
	await runtimeError(piped, declaration.length + 24, 'render')
	const invalid = declaration + '{@render render(render, render-name)}'
	await compileError(invalid, 'G1007', declaration.length + 24, 'render-name')
})

test('pipes in parentheses and arguments exclude surrounding whitespace from diagnostics', async () => {
	for (const whitespace of [' ', '\t', '\n  ']) {
		for (const text of [`{@const c = (${whitespace}value | vanish${whitespace})}`, `{@const c = value | oneOf((${whitespace}value | vanish${whitespace}) | upper)}`]) {
			await runtimeError(text, text.indexOf('value | vanish'), 'value | vanish', { value: 'x' }, { filters: { vanish: () => undefined } })
		}
		for (const text of [`{@const c = (${whitespace}value === other | upper${whitespace})}`, `{@const c = value | oneOf(${whitespace}value === other | upper${whitespace})}`]) {
			const start = text.indexOf('value === other | upper')
			await compileError(text, 'G3022', start, 'value === other | upper')
			const lines = text.slice(0, start).split('\n')
			const error = await galley(text, { sourceId }).catch(error => error)
			expect(error.message).toContain(`${sourceId}:${lines.length}:${lines.at(-1)!.length + 1}`)
			expect(error.diagnostic.message).toBe('A pipe beside an operator needs explicit grouping')
		}
	}
})

test('source locations survive partials, removals and strip with repeated text', async () => {
	const partial = '<galley:config>title</galley:config><!-- title -->\n{@const title =\n  title}'
	for (const strip of [false, true]) for (const allowCode of [false, true]) {
		const options = { strip, allowCode, strictUndefined: true, includes: { basedir: 'parts', import: async () => partial } }
		const template = await galley('{@partial partial.sort}', options)
		try { await template.render({}); throw new Error('Expected G5002') }
		catch (error) { expect((error as Error).message).toBe('G5002: title is undefined at parts/partial.sort:3:3') }
	}
	const partialTag = '{@partial partial.sort}'
	const node = parse({ id: sourceId, text: partialTag }).children[0]!
	if (node.kind !== 'partial') throw new Error('Expected partial')
	expect(node.path).toBe('partial.sort')
	checkSpan(node.span, partialTag, 0, partialTag)
})
