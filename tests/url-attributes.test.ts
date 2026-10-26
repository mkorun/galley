import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

// A value that begins a URL attribute may write no URL of another scheme, nor another host without one (G5001).
describe('URL attributes', () => {
	const template = '<a href="{ u }">x</a>'

	test('write a relative URL and one of http, https, mailto, tel as they are', async () => {
		for (const u of ['/a/', 'b.png', '#f', '?q=1', '', 'https://example.com/x', 'HTTP://example.com', 'mailto:a@b.c', 'tel:+491'])
			expect(await render(template, { u })).toBe(`<a href="${u}">x</a>`)
	})

	test('stop at another scheme, however a browser would read it, and at another host without a scheme', async () => {
		for (const u of ['javascript:alert(1)', ' javascript:x', '\tjava\nscript:x', 'JAVASCRIPT:x', 'data:text/html,x', 'vbscript:x', '//evil.example/x', '\\\\evil.example', '/\\evil.example'])
			await expect(render(template, { u })).rejects.toThrow(/^G5001: href=.* is no URL a template may write there/)
	})

	test('check every URL attribute, quoted either way, and only a value that begins one', async () => {
		for (const t of ['<img src="{ u }">', "<img src='{ u }'>", '<form action="{ u }">', '<video poster="{ u }">', '<blockquote cite="{ u }">', '<use xlink:href="{ u }">', '<a\n  class="x"\n  HREF="{ u }">'])
			await expect(render(t, { u: 'javascript:x' })).rejects.toThrow(/G5001/)
		for (const t of ['<a href="/tags/{ u }/">', '<a title="{ u }">', '<p>{ u }</p>', '<a href="{ v }{ u }">'])
			expect(await render(t, { u: 'javascript:x', v: '/a/' })).toContain('javascript:x')
	})

	test('check a raw value too, and leave an empty <link> to stripEmptyMeta', async () => {
		await expect(render('<a href="{@raw u}">x</a>', { u: 'javascript:x' })).rejects.toThrow(/G5001/)
		expect(await render('<link rel="me" href="{ u }">', {})).toBe('')
	})
})
