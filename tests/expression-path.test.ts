import { expect, spyOn, test } from 'bun:test'
import galley, { parse } from '../index.js'
import * as paths from '../compiler/path.js'
import { parseExpression } from '../compiler/expression.js'
import { parsePath } from '../compiler/path.js'
import { span } from '../compiler/diagnostics.js'

const expression = (raw: string) => parseExpression(raw, span({ id: 'expression', text: raw }, 0, raw.length))
const path = (raw: string) => parsePath(raw, span({ id: 'path', text: raw }, 0, raw.length))
const render = async (source: string, data: object = {}, filters: object = {}) => (await galley(source, { filters: filters as any })).render(data)

test('path and pipe names retain every allowed ASCII letter, digit and underscore', async () => {
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_'
	for (const letter of letters + '$') for (const name of [letter + 'value', 'value' + letter]) {
		expect(await render(`{ ${name} }`, { [name]: 'V' }), name).toBe('V')
	}
	for (const letter of letters) for (const name of [letter + 'filter', 'filter' + letter]) {
		expect(await render(`{ value | ${name} }`, { value: 'V' }, { [name]: (value: string) => value + 'F' }), name).toBe('VF')
	}
	for (const digit of '0123456789') {
		expect(await render(`{ v${digit} | f${digit} }`, { ['v' + digit]: 'V' }, { ['f' + digit]: (value: string) => value + 'F' })).toBe('VF')
	}
})

test('expression separators respect quoted strings, computed paths and nested pipe arguments', async () => {
	const filters = { f: (...args: unknown[]) => args.join(';'), g: (value: unknown) => value }
	const data = { a: 'A', b: 'B', c: 'C', values: { 'x|y': 'K', 'a(b)c|d': 'L' } }
	for (const [source, result] of [
		[`{ a | f("a|b", 'c,d', values["x|y"]) | g }`, 'A;a|b;c,d;K'],
		[`{ values["a(b)c|d"] | f('a)b', "c[d", 'e]f') | g }`, 'L;a)b;c[d;e]f'],
		['{ a | f(b | g, c) | g }', 'A;B;C'],
		['{@raw (a || b) | f(c) | g}', 'A;C'],
		['{ values["x|y"] || b }', 'K'],
		['{@raw (a) && (b)}', 'B'],
	]) expect(await render(source!, data, filters)).toBe(result!)
})

test('expression literals and malformed strings keep their distinct values and diagnostics', () => {
	for (const [raw, value] of [['-9.5', -9.5], ['0', 0], ['9', 9], ['false', false], ['true', true], ['null', null], ['undefined', undefined], ["'a'", 'a'], ['"b"', 'b']] as const) {
		expect(expression(raw)).toMatchObject({ kind: 'literal', value, raw })
	}
	for (const raw of ["'", '"', "'a", '"b', '1x', '-name', '09x']) expect(() => expression(raw)).toThrow('G1001')
	for (const raw of ["name'", 'name"']) expect(() => expression(raw)).toThrow('G1006')
	for (const raw of ["'a'b'", '"a"b"', "'a\\b'", '"a\\b"']) expect(() => expression(raw)).toThrow('G1101')
	for (const char of ['\n', '\r', '\u2028', '\u2029']) expect(() => expression(`'a${char}b'`)).toThrow('G1105')
	expect(() => expression(' \t\n\r')).toThrow('G1100')
})

test('expression operators keep precedence, associativity and quoted punctuation', async () => {
	for (const [raw, result] of [
		['3 >= 3', 'true'], ['3 > 3', 'false'], ['3 <= 3', 'true'], ['3 < 3', 'false'],
		['false && true', 'false'], ['true || false', 'true'], ['null ?? 2', '2'],
		['1 === 1 === true', 'true'], ['1 !== 1', 'false'], ['!true || true', 'true'],
		['(false || true) && false', 'false'], [`a === 'a||b'`, 'true'],
		['"a(b)" !== value', 'true'], ['(1) < (2)', 'true'],
		[`('a)b')`, 'a)b'], ['("a(b")', 'a(b'], [`('a|b')`, 'a|b'], ['("a)b") === value', 'false'],
		['false && true || true', 'true'], ['true || true && false', 'true'], ['1 === 1 && 2 === 2', 'true'],
		['((1) < (2))', 'true'], ['value === "c[d]"', 'true'],
	]) expect(await render(`{@raw ${raw}}`, { a: 'a||b', value: 'c[d]' }), raw).toBe(result!)
	for (const raw of ['x(a)', 'x("a")']) expect(() => expression(raw)).toThrow('G1006')
	expect(() => expression('a ==== b')).toThrow('G1001')
})

test('expression and path whitespace preserve the source spans of operands and computed keys', () => {
	const raw = ' \t\n\rleft \t\n\r|| \t\n\rright \t\n\r'
	const parsed = expression(raw)
	expect(parsed.kind).toBe('binary')
	if (parsed.kind !== 'binary') throw new Error('Expected binary expression')
	for (const [node, name] of [[parsed.left, 'left'], [parsed.right, 'right']] as const) {
		expect(node.span.start).toBe(raw.indexOf(name))
		expect(node.span.end).toBe(raw.indexOf(name) + name.length)
	}
	const spaced = path(' \tvalue \t.thing [ \t"key" \t] \t[ -1 ] \t[ key ] \t')
	expect(spaced.root).toBe('value')
	expect(spaced.segments.map(segment => typeof segment.value === 'object' ? segment.value.root : segment.value)).toEqual(['thing', 'key', -1, 'key'])
	expect(path("value['key']").segments[0]?.value).toBe('key')
	for (const [raw, code] of [['value["key"x]', 'G1004'], ["value['escaped\\key']", 'G1003'], ['value["key', 'G1003'], ['value[key', 'G1005'], ['value.0', 'G1001'], ['value.é', 'G1001'], ['é', 'G1001'], ['value()', 'G1006']]) expect(() => path(raw!)).toThrow(code!)
})

test('each collection errors keep G2216 and preserve unrelated parser failures', () => {
	for (const raw of ['user-name', 'items()', 'items[key-name]']) expect(() => parse({ id: 'collection', text: `{#each ${raw} as item}{ item }{/each}` })).toThrow('G2216')
	const failure = new Error('path parser unavailable')
	const read = spyOn(paths, 'parsePath').mockImplementation(() => { throw failure })
	try { expect(() => parse({ id: 'collection', text: '{#each items as item}{/each}' })).toThrow(failure) }
	finally { read.mockRestore() }
})

test('malformed pipes name invalid filters, missing delimiters and empty arguments', () => {
	for (const name of ['bad-name', '$filter', '1filter', 'f.name', '']) expect(() => expression(`value | ${name}`)).toThrow('G1102')
	expect(() => expression('value | f(1')).toThrow('G1103')
	for (const raw of ['value | f()', 'value | f(,1)', 'value | f(1,)']) expect(() => expression(raw)).toThrow('G1104')
})

test('malformed quoted expressions keep the complete offending span through every scanner', () => {
	for (const [raw, code, start, end] of [
		['((a)', 'G1001', 0, 1],
		[' \t\n\r', 'G1100', 4, 4],
		["'a\\'|b' | f", 'G1101', 0, 7],
		['("a\\")")', 'G1101', 1, 7],
		["'a\\' || b' === value", 'G1101', 0, 10],
	] as const) {
		let failure
		try { expression(raw) } catch (error) { failure = error }
		expect(failure, raw).toMatchObject({ diagnostic: { code, span: { start, end } } })
	}
})
