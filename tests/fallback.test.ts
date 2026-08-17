import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('?? fallback operator', () => {

	test('missing key uses fallback string', async () => {
		expect(await render("{ title ?? 'Untitled' }", {})).toBe('Untitled')
	})

	test('present key ignores fallback', async () => {
		expect(await render("{ title ?? 'Untitled' }", { title: 'Hello' })).toBe('Hello')
	})

	test('null value uses fallback', async () => {
		expect(await render("{ title ?? 'none' }", { title: null })).toBe('none')
	})

	test('undefined value uses fallback', async () => {
		expect(await render("{ title ?? 'none' }", { title: undefined })).toBe('none')
	})

	test('0 is NOT nullish — renders "0"', async () => {
		expect(await render("{ count ?? 'none' }", { count: 0 })).toBe('0')
	})

	test('false is NOT nullish — renders "false"', async () => {
		expect(await render("{ flag ?? 'none' }", { flag: false })).toBe('false')
	})

	test('empty string is NOT nullish — renders ""', async () => {
		expect(await render("{ label ?? 'none' }", { label: '' })).toBe('')
	})

	test('numeric fallback', async () => {
		expect(await render('{ count ?? 42 }', {})).toBe('42')
	})

	test('nested path missing — fallback used', async () => {
		expect(await render("{ meta.title ?? 'No title' }", {})).toBe('No title')
	})

	test('nested path present — value used', async () => {
		expect(await render("{ meta.title ?? 'No title' }", { meta: { title: 'Yes' } })).toBe('Yes')
	})

	test('fallback escapes HTML', async () => {
		expect(await render("{ missing ?? '<b>bold</b>' }", {})).toBe('&lt;b&gt;bold&lt;/b&gt;')
	})

	test('fallback combined with pipe', async () => {
		expect(await render("{ missing ?? 'hello' | upper }", {})).toBe('HELLO')
	})

	test('double-quoted fallback string', async () => {
		expect(await render('{ title ?? "Untitled" }', {})).toBe('Untitled')
	})

	test('single-quoted fallback string', async () => {
		expect(await render("{ title ?? 'Kein Titel' }", {})).toBe('Kein Titel')
	})

})

describe('{@raw} with ?? fallback', () => {

	test('uses value when present — raw output not escaped', async () => {
		expect(await render('{@raw markup ?? "<em>empty</em>"}', { markup: '<b>Hi</b>' }))
			.toBe('<b>Hi</b>')
	})

	test('uses fallback when value is undefined — raw output', async () => {
		expect(await render('{@raw markup ?? "<em>empty</em>"}', {}))
			.toBe('<em>empty</em>')
	})

	test('empty string fallback', async () => {
		expect(await render('{@raw html ?? ""}', {})).toBe('')
	})

})
