import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

// What a render writes into a URL attribute may make no URL of another scheme, nor another host without one (G5001).
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

	test('check every URL attribute, quoted either way or not, and a value only as the start of a URL', async () => {
		for (const t of ['<img src="{ u }">', "<img src='{ u }'>", '<img src={ u }>', '<form action="{ u }">', '<video poster="{ u }">', '<blockquote cite="{ u }">', '<use xlink:href="{ u }">', '<a\n  class="x"\n  HREF="{ u }">'])
			await expect(render(t, { u: 'javascript:x' })).rejects.toThrow(/G5001/)
		for (const t of ['<a href="/tags/{ u }/">', '<a title="{ u }">', '<p>{ u }</p>', '<a href="{ v }{ u }">'])
			expect(await render(t, { u: 'javascript:x', v: '/a/' })).toContain('javascript:x')
	})

	test('check a raw value too, and leave an empty <link> to stripEmptyMeta', async () => {
		await expect(render('<a href="{@raw u}">x</a>', { u: 'javascript:x' })).rejects.toThrow(/G5001/)
		expect(await render('<link rel="me" href="{ u }">', {})).toBe('')
	})

	// review 2026-10-26 (hadley, perf): the check read the template's text, and so missed a value in {#if}, after
	// an empty value and after a space
	test('check the value as the attribute holds it, whatever came before it there', async () => {
		const data = { u: 'javascript:alert(1)', author: { url: 'javascript:alert(1)' } }
		for (const t of [
			'<a href="{#if author}{ author.url }{/if}">x</a>',
			'<a href="{ unset }{ author.url }">x</a>',
			'<a href=" { author.url }">x</a>',
			'<a title="a>b" href="{ u }">x</a>',
			'<a href="java{ v }">x</a>',
			'{#snippet link()}{ u }{/snippet}<a href="{@render link()}">x</a>',
		])
			await expect(render(t, { ...data, v: 'script:x' })).rejects.toThrow(/G5001/)
		for (const t of ['<a href="/a/{#if author}{ author.url }{/if}">x</a>', '<a href="x" title="{ u }">x</a>', '<a href="x">{ u }</a>'])
			expect(await render(t, data)).toContain('javascript:alert(1)')
	})

	// review 2026-10-26 (hadley, dev server): 0.3.1 handed a raw number to a helper that needs a string
	test('write a raw value that is no string, as before', async () => {
		expect(await render('<p>{@raw n}</p>', { n: 42 })).toBe('<p>42</p>')
		expect(await render('<p>{@raw b}{@raw o}</p>', { b: true, o: { toString: () => '<b>x</b>' } })).toBe('<p>true<b>x</b></p>')
	})
})
