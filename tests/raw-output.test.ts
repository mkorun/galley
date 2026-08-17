import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('{@raw}', () => {

	test('outputs unescaped HTML', async () => {
		expect(await render('{@raw markup}', { markup: '<p>Hello</p>' })).toBe('<p>Hello</p>')
	})

	test('HTML is not double-escaped', async () => {
		expect(await render('{@raw markup}', { markup: '<b>bold</b>' })).toBe('<b>bold</b>')
	})

	test('undefined outputs empty string', async () => {
		expect(await render('{@raw missing}')).toBe('')
	})

	test('?? fallback', async () => {
		expect(await render("{@raw markup ?? '<em>none</em>'}", { }))
			.toBe('<em>none</em>')
	})

	test('nested path', async () => {
		expect(await render('{@raw article.html}', { article: { html: '<p>text</p>' } }))
			.toBe('<p>text</p>')
	})

	test('null outputs empty string', async () => {
		expect(await render('{@raw val}', { val: null })).toBe('')
	})

	test('is distinct from { } escaped output', async () => {
		const data = { val: '<b>test</b>' }
		const escaped = await render('{ val }', data)
		const raw     = await render('{@raw val}', data)
		expect(escaped).toBe('&lt;b&gt;test&lt;/b&gt;')
		expect(raw).toBe('<b>test</b>')
	})

	test('{@raw} with present value — fallback ignored', async () => {
		expect(await render("{@raw markup ?? '<em>empty</em>'}", { markup: '<b>Hi</b>' }))
			.toBe('<b>Hi</b>')
	})

	test('{@raw} with absent value — fallback is raw HTML', async () => {
		expect(await render("{@raw markup ?? '<em>empty</em>'}", {}))
			.toBe('<em>empty</em>')
	})

})
