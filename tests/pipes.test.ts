import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('Filter/Pipes — { value | filter }', () => {
	test('unknown filter fails clearly at render time', async () => {
		await expect(render('{ value | slugfiy }', { value: 'Hello' }))
			.rejects.toThrow(/slugfiy/)
	})

	test('upper', async () => {
		expect(await render('{ title | upper }', { title: 'hello' })).toBe('HELLO')
	})

	test('lower', async () => {
		expect(await render('{ title | lower }', { title: 'HELLO' })).toBe('hello')
	})

	test('capitalize', async () => {
		expect(await render('{ title | capitalize }', { title: 'hello world' })).toBe('Hello world')
	})

	test('trim', async () => {
		expect(await render('{ title | trim }', { title: '  hello  ' })).toBe('hello')
	})

	test('truncate', async () => {
		expect(await render('{ title | truncate(5) }', { title: 'hello world' })).toBe('hello…')
	})

	test('truncate with custom suffix', async () => {
		expect(await render("{ title | truncate(5, '...') }", { title: 'hello world' })).toBe('hello...')
	})

	test('truncate — string shorter than limit unchanged', async () => {
		expect(await render('{ title | truncate(20) }', { title: 'short' })).toBe('short')
	})

	test('replace', async () => {
		expect(await render("{ title | replace('o', '0') }", { title: 'foo' })).toBe('f00')
	})

	test('pipe character inside string literal is not a pipe separator', async () => {
		expect(await render("{ title | replace('|', '-') }", { title: 'a|b' })).toBe('a-b')
		expect(await render('{ title | replace("|", "-") }', { title: 'a|b' })).toBe('a-b')
	})

	test('escaped quote inside string literal does not break pipe parsing', async () => {
		expect(await render(`{ title | replace("'s", '') }`, { title: "it's" })).toBe('it')
	})

	test('auto-escape applies after pipes — { } always escapes', async () => {
		expect(await render('{ title | upper }', { title: '<b>hello</b>' }))
			.toBe('&lt;B&gt;HELLO&lt;/B&gt;')
	})

	test('striptags', async () => {
		expect(await render('{ content | striptags }', { content: '<p>Hello <b>world</b></p>' }))
			.toBe('Hello world')
	})

	test('slugify', async () => {
		expect(await render('{ title | slugify }', { title: 'Héllo Wörld!' })).toBe('hello-world')
	})

	test('join array', async () => {
		expect(await render('{ tags | join }', { tags: ['a', 'b', 'c'] })).toBe('a, b, c')
	})

	test('join with custom separator', async () => {
		expect(await render("{ tags | join(' / ') }", { tags: ['a', 'b'] })).toBe('a / b')
	})

	test('first', async () => {
		expect(await render('{ items | first }', { items: ['x', 'y'] })).toBe('x')
	})

	test('last', async () => {
		expect(await render('{ items | last }', { items: ['x', 'y'] })).toBe('y')
	})

	test('length of array', async () => {
		expect(await render('{ items | length }', { items: [1, 2, 3] })).toBe('3')
	})

	test('chained pipes', async () => {
		expect(await render('{ title | truncate(5) | upper }', { title: 'hello world' })).toBe('HELLO…')
	})

	test('pipe with ?? fallback', async () => {
		expect(await render("{ missing ?? 'default' | upper }", {})).toBe('DEFAULT')
	})

	test('pipe in loop', async () => {
		expect(await render('{#each tags as tag}{ tag | upper } {/each}', { tags: ['a', 'b'] }))
			.toBe('A B ')
	})

	test('scope path as pipe argument', async () => {
		// truncate(n) where n comes from context data, not a literal
		expect(await render('{ title | truncate(limit) }', { title: 'hello world', limit: 5 }))
			.toBe('hello…')
	})

	test('nested scope path as pipe argument', async () => {
		expect(await render("{ d | dateFormat(meta.lang) }", { d: '2024-01-15', meta: { lang: 'en' } }))
			.toContain('2024')
	})

	describe('isoDate', () => {
		test('date string → ISO timestamp', async () => {
			const result = await render('{ d | isoDate }', { d: '2024-01-15' })
			expect(result).toMatch(/^2024-01-15T/)
		})

		test('empty string → empty string', async () => {
			expect(await render('{ d | isoDate }', { d: '' })).toBe('')
		})

		test('undefined → empty (via ??)', async () => {
			expect(await render("{ d ?? '' | isoDate }", {})).toBe('')
		})
	})

	describe('dateFormat', () => {
		test('locale mode: de-DE → long format', async () => {
			const result = await render("{ d | dateFormat('de-DE') }", { d: '2024-01-15' })
			// Should contain the year and be a human-readable string
			expect(result).toContain('2024')
			expect(result.length).toBeGreaterThan(10)
		})

		test('pattern mode: yyyy-MM-dd', async () => {
			expect(await render("{ d | dateFormat('yyyy-MM-dd') }", { d: '2024-01-15' }))
				.toBe('2024-01-15')
		})

		test('pattern mode: dd.MM.yyyy', async () => {
			expect(await render("{ d | dateFormat('dd.MM.yyyy') }", { d: '2024-03-07' }))
				.toBe('07.03.2024')
		})

		test('pattern with repeated token yyyy-MM-dd (yyyy)', async () => {
			expect(await render("{ d | dateFormat('yyyy-MM-dd (yyyy)') }", { d: '2024-03-07' }))
				.toBe('2024-03-07 (2024)')
		})

		test('empty string passthrough', async () => {
			expect(await render("{ d | dateFormat('yyyy-MM-dd') }", { d: '' })).toBe('')
		})
	})

	describe('dateShort', () => {
		test('day + long month, locale-aware', async () => {
			expect(await render("{ d | dateShort('en-US') }", { d: '2024-07-11' })).toBe('July 11')
			expect(await render("{ d | dateShort('de') }", { d: '2024-07-11' })).toBe('11. Juli')
		})

		test('empty string passthrough', async () => {
			expect(await render("{ d | dateShort('en-US') }", { d: '' })).toBe('')
		})
	})

	describe('dateDay', () => {
		test('day of month as string', async () => {
			expect(await render('{ d | dateDay }', { d: '2024-07-11' })).toBe('11')
		})

		test('empty string passthrough', async () => {
			expect(await render('{ d | dateDay }', { d: '' })).toBe('')
		})
	})

	describe('dateMonthShort', () => {
		test('short month name without trailing period', async () => {
			expect(await render("{ d | dateMonthShort('en-US') }", { d: '2024-07-11' })).toBe('Jul')
			expect(await render("{ d | dateMonthShort('de') }", { d: '2024-09-11' })).not.toMatch(/\.$/)
		})

		test('empty string passthrough', async () => {
			expect(await render("{ d | dateMonthShort('en-US') }", { d: '' })).toBe('')
		})
	})

})
