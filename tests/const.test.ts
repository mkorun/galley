import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('{@const} — local template variable', () => {

	test('binds a simple path to a name', async () => {
		const tpl = '{@const t = meta.title}<p>{ t }</p>'
		expect(await render(tpl, { meta: { title: 'Hello' } })).toBe('<p>Hello</p>')
	})

	test('escapes output when used in { }', async () => {
		const tpl = '{@const t = title}<p>{ t }</p>'
		expect(await render(tpl, { title: '<b>bold</b>' })).toBe('<p>&lt;b&gt;bold&lt;/b&gt;</p>')
	})

	test('supports fallback via ??', async () => {
		const tpl = '{@const t = meta.missing ?? \'Untitled\'}<p>{ t }</p>'
		expect(await render(tpl, { meta: {} })).toBe('<p>Untitled</p>')
	})

	test('supports pipes', async () => {
		const tpl = '{@const up = title | upper}<p>{ up }</p>'
		expect(await render(tpl, { title: 'hello' }, { upper: (s: string) => s.toUpperCase() }))
			.toBe('<p>HELLO</p>')
	})

	test('can be used in {#if} condition', async () => {
		const tpl = '{@const active = meta.status}{#if active}<span>yes</span>{/if}'
		expect(await render(tpl, { meta: { status: true } })).toBe('<span>yes</span>')
		expect(await render(tpl, { meta: { status: false } })).toBe('')
	})

	test('multiple consts in the same template', async () => {
		const tpl = '{@const a = x}{@const b = y}<p>{ a }-{ b }</p>'
		expect(await render(tpl, { x: 'foo', y: 'bar' })).toBe('<p>foo-bar</p>')
	})

	test('inside {#each}: scoped to the loop', async () => {
		const tpl = '{#each items as item}{@const label = item.name}<li>{ label }</li>{/each}'
		expect(await render(tpl, { items: [{ name: 'A' }, { name: 'B' }] }))
			.toBe('<li>A</li><li>B</li>')
	})

	test('inside {#if}: accessible within the block', async () => {
		const tpl = '{#if show}{@const msg = title}<p>{ msg }</p>{/if}'
		expect(await render(tpl, { show: true, title: 'Hi' })).toBe('<p>Hi</p>')
		expect(await render(tpl, { show: false, title: 'Hi' })).toBe('')
	})

	test('inside {#if}: does not leak into the following JavaScript scope', async () => {
		const tpl = '{#if show}{@const msg = title}<p>{ msg }</p>{/if}<footer>ok</footer>'
		expect(await render(tpl, { show: true, title: 'Hi' })).toBe('<p>Hi</p><footer>ok</footer>')
	})

	test('consts are scoped independently across if branches', async () => {
		const tpl = '{#if show}{@const msg = a}{ msg }{:else}{@const msg = b}{ msg }{/if}'
		expect(await render(tpl, { show: true, a: 'A', b: 'B' })).toBe('A')
		expect(await render(tpl, { show: false, a: 'A', b: 'B' })).toBe('B')
	})

	test('throws on missing "="', async () => {
		await expect(render('{@const x title}', {}))
			.rejects.toThrow(/requires "="/)
	})

	test('throws on invalid variable name', async () => {
		await expect(render('{@const 1x = title}', {}))
			.rejects.toThrow(/Invalid variable name/)
	})

	test('throws on invalid galley expression', async () => {
		await expect(render('{@const x = a + b}', {}))
			.rejects.toThrow(/Invalid expression/)
	})

})
