import { describe, expect, test } from 'bun:test'
import { render, renderCode } from './helpers'

describe('{@js} blocks', () => {

	// ── allowCode guard ───────────────────────────────────────────────────────

	test('throws when allowCode is false (default)', async () => {
		expect(render('{@js}return "x"{@js}')).rejects.toThrow('allowCode')
	})

	// ── basic output ──────────────────────────────────────────────────────────

	test('return value is inserted unescaped', async () => {
		expect(await renderCode('{@js}return "<b>bold</b>"{@js}')).toBe('<b>bold</b>')
	})

	test('return string concatenation', async () => {
		expect(await renderCode('{@js}return "hel" + "lo"{@js}')).toBe('hello')
	})

	test('multiline block', async () => {
		expect(await renderCode(`{@js}
  const a = 1
  const b = 2
  return String(a + b)
{@js}`)).toBe('3')
	})

	test('null return outputs empty string', async () => {
		expect(await renderCode('{@js}return null{@js}')).toBe('')
	})

	test('no return outputs empty string', async () => {
		expect(await renderCode('{@js}const x = 1{@js}')).toBe('')
	})

	// ── context access ────────────────────────────────────────────────────────

	test('accesses $ context', async () => {
		expect(await renderCode(
			'{@js}return $.meta.title{@js}',
			{ meta: { title: 'From context' } }
		)).toBe('From context')
	})

	test('accesses nested $ path', async () => {
		expect(await renderCode(
			'{@js}return $.site.lang.toUpperCase(){@js}',
			{ site: { lang: 'de' } }
		)).toBe('DE')
	})

	// ── output is NOT HTML-escaped ────────────────────────────────────────────

	test('output is unescaped — HTML passthrough', async () => {
		expect(await renderCode(
			'{@js}return `<time datetime="${$.iso}">${$.display}</time>`{@js}',
			{ iso: '2026-05-27', display: '27. Mai 2026' }
		)).toBe('<time datetime="2026-05-27">27. Mai 2026</time>')
	})

	test('output is unescaped — angle brackets not escaped', async () => {
		expect(await renderCode('{@js}return "<script>alert(1)</script>"{@js}'))
			.toBe('<script>alert(1)</script>')
	})

	// ── surrounding template ──────────────────────────────────────────────────

	test('inline with surrounding content', async () => {
		expect(await renderCode(
			'<p>{@js}return $.title{@js}</p>',
			{ title: 'Hello' }
		)).toBe('<p>Hello</p>')
	})

	test('multiple js blocks in one template', async () => {
		expect(await renderCode(
			'{@js}return $.a{@js} and {@js}return $.b{@js}',
			{ a: 'foo', b: 'bar' }
		)).toBe('foo and bar')
	})

	// ── async / await ─────────────────────────────────────────────────────────

	test('await resolves a Promise', async () => {
		expect(await renderCode(
			'{@js}return await Promise.resolve("async result"){@js}'
		)).toBe('async result')
	})

	test('render() returns Promise<string> when allowCode: true', async () => {
		const galley = (await import('./compiler')).default
		const tpl = await galley('{@js}return "x"{@js}', {
			includes: { import: () => Promise.resolve(''), basedir: '.' },
			allowCode: true,
		})
		const result = tpl.render({}, {})
		expect(result).toBeInstanceOf(Promise)
		expect(await result).toBe('x')
	})

	// ── in loop context ───────────────────────────────────────────────────────

	test('accesses loop variable via $', async () => {
		// Loop vars are local JS variables — accessible in {@js} via closure
		expect(await renderCode(
			'{#each items as item}{@js}return item.name.toUpperCase(){@js} {/each}',
			{ items: [{ name: 'alpha' }, { name: 'beta' }] }
		)).toBe('ALPHA BETA ')
	})

	// ── ported from v1 code-blocks suite ─────────────────────────────────────

	test('ternary expression', async () => {
		expect(await renderCode('{@js}return $.x > 0 ? "pos" : "neg"{@js}', { x: 5 })).toBe('pos')
		expect(await renderCode('{@js}return $.x > 0 ? "pos" : "neg"{@js}', { x: -1 })).toBe('neg')
	})

	test('arithmetic expression', async () => {
		expect(await renderCode('{@js}return String(2 + 2){@js}')).toBe('4')
	})

	test('accesses loop variable by name (closure)', async () => {
		expect(await renderCode(
			'{#each items as item}{@js}return item.label{@js}{/each}',
			{ items: [{ label: 'A' }, { label: 'B' }] }
		)).toBe('AB')
	})

	test('separator pattern in loop via index', async () => {
		expect(await renderCode(
			'{#each items as item, i}{@js}return item{@js}{@js}return i < 2 ? "·" : ""{@js}{/each}',
			{ items: ['a', 'b', 'c'] }
		)).toBe('a·b·c')
	})

	test('conditional return pattern', async () => {
		const tpl = `{@js}if ($.show) { return '<span>visible</span>' } return ''{@js}`
		expect(await renderCode(tpl, { show: true })).toBe('<span>visible</span>')
		expect(await renderCode(tpl, { show: false })).toBe('')
	})

	test('multi-line block with context', async () => {
		const tpl = `{@js}
			const lang = $.meta.lang
			return 'lang=' + lang
		{@js}`
		expect(await renderCode(tpl, { meta: { lang: 'de' } })).toBe('lang=de')
	})

	test('computed HTML from template literal', async () => {
		expect(await renderCode(
			'{@js}return `<b>${$.title}</b>`{@js}',
			{ title: 'Test' }
		)).toBe('<b>Test</b>')
	})

	test('accesses outer context while in loop', async () => {
		expect(await renderCode(
			'{#each items as item}{@js}return item + "-" + $.title{@js} {/each}',
			{ items: ['a', 'b'], title: 'X' }
		)).toBe('a-X b-X ')
	})

	test('multi-line with array join', async () => {
		const tpl = `{@js}
			const parts = $.items.join(', ')
			return '[' + parts + ']'
		{@js}`
		expect(await renderCode(tpl, { items: ['a', 'b', 'c'] })).toBe('[a, b, c]')
	})

})
