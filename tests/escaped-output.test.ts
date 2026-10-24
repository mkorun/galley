import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('escaped output — { expr }', () => {
	test('numeric dot segments fall back to literal template text', async () => {
		expect(await render('{ items.0.name }', { items: [{ name: 'x' }] })).toBe('{ items.0.name }')
	})

	test('U+2028 and U+2029 in literal template text compile safely', async () => {
		expect(await render('a\u2028b\u2029c', {})).toBe('a\u2028b\u2029c')
	})

	test('simple path', async () => {
		expect(await render('{ title }', { title: 'Hello' })).toBe('Hello')
	})

	test('nested path', async () => {
		expect(await render('{ meta.title }', { meta: { title: 'Nested' } })).toBe('Nested')
	})

	test('HTML characters are escaped', async () => {
		expect(await render('{ title }', { title: '<b>Test & "quoted"</b>' }))
			.toBe('&lt;b&gt;Test &amp; &quot;quoted&quot;&lt;/b&gt;')
	})

	// 0.1.0 escaped only strings: an array or object from the data reached the HTML as it was
	test('arrays, objects and other values are escaped as their string form', async () => {
		const evil = '</title><script>alert(1)</script>'
		expect(await render('{ v }', { v: [evil, 'b'] })).toBe('&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;,b')
		expect(await render('{ v }', { v: { toString: () => evil } })).toBe('&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;')
		expect(await render('{ v ?? "x" }', { v: [evil] })).not.toContain('<script')
		expect(await render('{ v | first }', { v: [[evil]] })).not.toContain('<script')
		expect(await render('{ v }', { v: true })).toBe('true')
	})

	test('apostrophe is escaped', async () => {
		expect(await render("{ title }", { title: "it's" })).toBe('it&apos;s')
	})

	test('undefined path outputs empty string', async () => {
		expect(await render('{ meta.missing }', { meta: {} })).toBe('')
	})

	test('null value outputs empty string', async () => {
		expect(await render('{ val }', { val: null })).toBe('')
	})

	test('numeric value outputs as string', async () => {
		expect(await render('{ count }', { count: 42 })).toBe('42')
	})

	test('?? fallback used when value is undefined', async () => {
		expect(await render("{ meta.title ?? 'Fallback' }", { meta: {} })).toBe('Fallback')
	})

	test('?? fallback not used when value is present', async () => {
		expect(await render("{ meta.title ?? 'Fallback' }", { meta: { title: 'Real' } })).toBe('Real')
	})

	test('bracket notation for keys with colon', async () => {
		expect(await render('{ meta.og:title }', { meta: { 'og:title': 'OG Title' } })).toBe('OG Title')
	})

	test('array index access', async () => {
		expect(await render('{ tags[0] }', { tags: ['first', 'second'] })).toBe('first')
	})

	test('expression in attribute', async () => {
		expect(await render('<a href="{ url }">link</a>', { url: '/path/' }))
			.toBe('<a href="/path/">link</a>')
	})

	test('CSS-like content not treated as tag (ADR-015)', async () => {
		expect(await render('<style>.btn {margin: 0}</style>')).toBe('<style>.btn {margin: 0}</style>')
	})

	test('no-space variant also works', async () => {
		expect(await render('{title}', { title: 'NoSpace' })).toBe('NoSpace')
	})

	test('deeply nested path (a.b.c)', async () => {
		expect(await render('{ a.b.c }', { a: { b: { c: 'deep' } } })).toBe('deep')
	})

	test('deeply undefined path returns empty string', async () => {
		expect(await render('{ a.b.c }', {})).toBe('')
	})

	test('property with hyphen (data-value) via bracket notation', async () => {
		expect(await render('{ meta.data-value }', { meta: { 'data-value': '42' } })).toBe('42')
	})

	test('double spaces inside delimiters are trimmed', async () => {
		expect(await render('{  title  }', { title: 'Hello' })).toBe('Hello')
	})

	describe('individual HTML escape chars', () => {
		test('escapes &', async () => {
			expect(await render('{ val }', { val: 'a & b' })).toBe('a &amp; b')
		})

		test('escapes <', async () => {
			expect(await render('{ val }', { val: '<script>' })).toBe('&lt;script&gt;')
		})

		test('escapes "', async () => {
			expect(await render('{ val }', { val: '"quoted"' })).toBe('&quot;quoted&quot;')
		})
	})

})
