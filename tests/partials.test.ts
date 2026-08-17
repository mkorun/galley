import { describe, expect, test } from 'bun:test'
import galley from './compiler'
import util from '../util'

// In-memory virtual filesystem — maps path → template source
const withFiles = (files: Record<string, string>) => ({
	import: (path: string) => {
		// Normalise path: strip leading "./" and "//"
		const key = path.replace(/^\.\//, '').replace(/\/\//g, '/')
		const src = files[key]
		if (src === undefined) return Promise.reject(new Error(`Partial not found: ${path}`))
		return Promise.resolve(src)
	},
	basedir: '.',
})

const render = async (
	template: string,
	data: object,
	files: Record<string, string> = {},
) => {
	const tpl = await galley(template, { includes: withFiles(files) })
	const result = tpl.render(data, util)
	if (result instanceof Promise) return result
	return result as string
}

describe('{@partial}', () => {
	test('a following error is reported against the parent source', async () => {
		await expect(render(
			'{@partial partials/_ok.sort}\n{#each broken}',
			{},
			{ 'partials/_ok.sort': 'ok' },
		)).rejects.toThrow(/line 2/)
	})

	test('inlines partial content', async () => {
		expect(await render(
			'before{@partial partials/_nav.sort}after',
			{},
			{ 'partials/_nav.sort': '<nav>menu</nav>' },
		)).toBe('before<nav>menu</nav>after')
	})

	test('partial has access to template data', async () => {
		expect(await render(
			'{@partial partials/_title.sort}',
			{ title: 'Hello' },
			{ 'partials/_title.sort': '<h1>{ title }</h1>' },
		)).toBe('<h1>Hello</h1>')
	})

	test('partial has access to nested data', async () => {
		expect(await render(
			'{@partial partials/_lang.sort}',
			{ meta: { lang: 'de' } },
			{ 'partials/_lang.sort': '{ meta.lang }' },
		)).toBe('de')
	})

	test('partial with conditional', async () => {
		const partial = '{#if isDraft}<span>draft</span>{/if}'
		const files = { 'partials/_badge.sort': partial }

		expect(await render('{@partial partials/_badge.sort}', { isDraft: true }, files))
			.toBe('<span>draft</span>')
		expect(await render('{@partial partials/_badge.sort}', { isDraft: false }, files))
			.toBe('')
	})

	test('partial with loop', async () => {
		expect(await render(
			'[{@partial partials/_list.sort}]',
			{ items: ['a', 'b', 'c'] },
			{ 'partials/_list.sort': '{#each items as item}{@raw item}{/each}' },
		)).toBe('[abc]')
	})

	test('multiple partials', async () => {
		expect(await render(
			'{@partial partials/_head.sort}{@partial partials/_foot.sort}',
			{},
			{ 'partials/_head.sort': '<head></head>', 'partials/_foot.sort': '<footer></footer>' },
		)).toBe('<head></head><footer></footer>')
	})

	test('partial shares scope with parent template', async () => {
		// Partials are compiled inline — they see the same data as the parent
		expect(await render(
			'{#each tags as tag}{@partial partials/_tag.sort}{/each}',
			{ tags: ['JS', 'TS'] },
			{ 'partials/_tag.sort': '<li>{ tag }</li>' },
		)).toBe('<li>JS</li><li>TS</li>')
	})

	test('partial nested inside another partial', async () => {
		expect(await render(
			'{@partial partials/_outer.sort}',
			{ text: 'hello' },
			{
				'partials/_outer.sort': '<div>{@partial partials/_inner.sort}</div>',
				'partials/_inner.sort': '<p>{ text }</p>',
			},
		)).toBe('<div><p>hello</p></div>')
	})

	test('unsafe traversal and absolute partial paths are rejected before import', async () => {
		let imports = 0
		const includes = { import: async () => { imports++; return 'secret' }, basedir: '/templates' }
		for (const path of ['../secret.sort', '/etc/passwd', 'C:\\secret.sort', 'C:relative.sort']) {
			await expect(galley(`{@partial ${path}}`, { includes })).rejects.toThrow(/unsafe partial path/i)
		}
		expect(imports).toBe(0)
	})

})

// ── HTML comment stripping ────────────────────────────────────────────────────

describe('HTML comment stripping', () => {

	const noPartials = { import: () => Promise.resolve(''), basedir: '.' }

	const compile = async (template: string) => {
		const tpl = await galley(template, { includes: noPartials })
		const result = tpl.render({}, util)
		if (result instanceof Promise) return result
		return result as string
	}

	test('comment on its own line is removed', async () => {
		expect(await compile('before\n<!-- comment -->\nafter')).toBe('before\nafter')
	})

	test('standalone comment on the first line is removed', async () => {
		expect(await compile('<!-- comment -->\nHello')).toBe('Hello')
	})

	test('comment with leading whitespace on its own line is removed', async () => {
		expect(await compile('before\n  <!-- indented comment -->\nafter')).toBe('before\nafter')
	})

	test('multiline comment block is removed', async () => {
		expect(await compile('before\n<!-- line 1\n     line 2 -->\nafter')).toBe('before\nafter')
	})

	test('inline comment (same line as content) is NOT removed', async () => {
		expect(await compile('text <!-- inline --> more')).toBe('text <!-- inline --> more')
	})

	test('comment at end of file with no trailing newline', async () => {
		expect(await compile('before\n<!-- eof comment -->')).toBe('before')
	})

	test('multiple standalone comments are all removed', async () => {
		expect(await compile('a\n<!-- one -->\nb\n<!-- two -->\nc')).toBe('a\nb\nc')
	})

	test('template without comments is unaffected', async () => {
		expect(await compile('<p>hello</p>')).toBe('<p>hello</p>')
	})

})
