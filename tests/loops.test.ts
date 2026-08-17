import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('{#each} / {/each}', () => {
	test('rejects item/index names reserved for loop metadata', async () => {
		await expect(render('{#each items as length}{ length }{/each}', { items: ['a'] }))
			.rejects.toThrow(/collides with loop metadata/i)
		await expect(render('{#each items as item, isLast}{ item }{/each}', { items: ['a'] }))
			.rejects.toThrow(/collides with loop metadata/i)
	})

	test('iterates array', async () => {
		expect(await render('{#each items as item}<li>{ item }</li>{/each}', { items: ['a', 'b', 'c'] }))
			.toBe('<li>a</li><li>b</li><li>c</li>')
	})

	test('empty array renders nothing', async () => {
		expect(await render('{#each items as item}<li>{ item }</li>{/each}', { items: [] })).toBe('')
	})

	test('undefined collection renders nothing', async () => {
		expect(await render('{#each items as item}<li>{ item }</li>{/each}', {})).toBe('')
	})

	test('with numeric index', async () => {
		expect(await render('{#each items as item, i}{ i }:{ item } {/each}', { items: ['a', 'b'] }))
			.toBe('0:a 1:b ')
	})

	test('item property access', async () => {
		expect(await render('{#each articles as article}<h2>{ article.title }</h2>{/each}', {
			articles: [{ title: 'First' }, { title: 'Second' }],
		})).toBe('<h2>First</h2><h2>Second</h2>')
	})

	test('iterates object — key is string', async () => {
		expect(await render('{#each obj as val, key}{ key }={ val } {/each}', {
			obj: { a: '1', b: '2' },
		})).toBe('a=1 b=2 ')
	})

	test('nested loops with different variable names', async () => {
		expect(await render(
			'{#each sections as section}{#each section.items as item}{ section.name }/{ item } {/each}{/each}',
			{ sections: [{ name: 'A', items: ['x', 'y'] }, { name: 'B', items: ['z'] }] }
		)).toBe('A/x A/y B/z ')
	})

	test('outer loop variable accessible inside nested loop', async () => {
		expect(await render(
			'{#each rows as row, ri}{#each row as cell, ci}{ ri },{ ci }:{ cell } {/each}{/each}',
			{ rows: [['a', 'b'], ['c']] }
		)).toBe('0,0:a 0,1:b 1,0:c ')
	})

	test('conditional on loop variable (truthy check)', async () => {
		// {#if} takes a galley-expression (path/truthy check), not JS comparisons
		expect(await render('{#each items as item}{#if item.active}{ item.name } {/if}{/each}', {
			items: [{ name: 'A', active: true }, { name: 'B', active: false }, { name: 'C', active: true }],
		})).toBe('A C ')
	})

	test('{ item } HTML-escapes in loop', async () => {
		expect(await render('{#each items as item}{ item }{/each}', { items: ['<b>', '<i>'] }))
			.toBe('&lt;b&gt;&lt;i&gt;')
	})

	test('{@raw item} outputs unescaped in loop', async () => {
		expect(await render('{#each items as item}{@raw item}{/each}', { items: ['<b>bold</b>'] }))
			.toBe('<b>bold</b>')
	})

	test('outer context { var } accessible inside loop', async () => {
		// $?.title resolves via main context; loop var is a separate JS local
		expect(await render('{#each items as item}{@raw item}-{ title } {/each}', {
			items: ['a', 'b'],
			title: 'X',
		})).toBe('a-X b-X ')
	})

	test('item.prop raw output — {@raw item.html}', async () => {
		expect(await render('{#each items as item}{@raw item.html} {/each}', {
			items: [{ html: '<b>bold</b>' }, { html: '<i>italic</i>' }],
		})).toBe('<b>bold</b> <i>italic</i> ')
	})

	test('item.prop escaped — { item.name } escapes HTML', async () => {
		expect(await render('{#each items as item}{ item.name }{/each}', {
			items: [{ name: '<script>' }],
		})).toBe('&lt;script&gt;')
	})

	test('item.prop with bracket notation key (colon)', async () => {
		expect(await render('{#each items as item}{ item.og:title } {/each}', {
			items: [{ 'og:title': 'A' }, { 'og:title': 'B' }],
		})).toBe('A B ')
	})

	test('item.deep.prop accesses nested properties', async () => {
		expect(await render('{#each items as item}{ item.meta.title } {/each}', {
			items: [{ meta: { title: 'X' } }, { meta: { title: 'Y' } }],
		})).toBe('X Y ')
	})

	test('iterates nested object property (site.pages)', async () => {
		expect(await render('{#each site.pages as page}{ page.title } {/each}', {
			site: { pages: [{ title: 'Home' }, { title: 'About' }] },
		})).toBe('Home About ')
	})

	test('loop var name does not shadow outer context', async () => {
		// Outside a loop, { value } accesses the outer $ context normally
		expect(await render('{ value }', { value: 'outer' })).toBe('outer')
	})

	test('$.prop reaches the top-level context even when a loop var shadows the name', async () => {
		expect(await render('{#each items as title}[{ title }]-[{ $.title }]{/each}', {
			title: 'TOPLEVEL', items: ['a', 'b'],
		})).toBe('[a]-[TOPLEVEL][b]-[TOPLEVEL]')
	})

	test('$ alone refers to the whole context object, not a "$"-named property', async () => {
		expect(await render('{@const whole = $}{ whole.value }', { value: 'x' })).toBe('x')
	})

	test('$ works as an {#each} collection', async () => {
		expect(await render('{#each $ as v, k}{ k }={ v } {/each}', { a: '1', b: '2' })).toBe('a=1 b=2 ')
	})

	test('object values via Object.values — no index variant', async () => {
		expect(await render('{#each obj as v}{ v } {/each}', { obj: { a: '1', b: '2' } }))
			.toBe('1 2 ')
	})

	test('object iteration index is the key', async () => {
		expect(await render('{#each obj as v, k}{ k }={ v } {/each}', { obj: { x: 'X', y: 'Y' } }))
			.toBe('x=X y=Y ')
	})

	test('two-level array nesting', async () => {
		expect(await render('{#each rows as row}[{#each row as cell}{@raw cell}{/each}]{/each}', {
			rows: [['a', 'b'], ['c', 'd']],
		})).toBe('[ab][cd]')
	})

	test('item.prop with ?? fallback', async () => {
		expect(await render("{#each items as item}{ item.label ?? '–' }{/each}", {
			items: [{ label: 'A' }, {}, { label: 'C' }],
		})).toBe('A–C')
	})

})

// ── isFirst / isLast / length ─────────────────────────────────────────────────

describe('loop meta-vars: isFirst, isLast, length', () => {

	test('length equals array length', async () => {
		expect(await render('{#each items as item}{ length }{/each}', { items: ['a', 'b', 'c'] }))
			.toBe('333')
	})

	test('isFirst is true only on first item', async () => {
		expect(await render('{#each items as item}{#if isFirst}FIRST{/if}{/each}', { items: ['a', 'b', 'c'] }))
			.toBe('FIRST')
	})

	test('isLast is true only on last item', async () => {
		expect(await render('{#each items as item}{#if isLast}LAST{/if}{/each}', { items: ['a', 'b', 'c'] }))
			.toBe('LAST')
	})

	test('isFirst and isLast both true for single-item array', async () => {
		expect(await render('{#each items as item}{#if isFirst}F{/if}{#if isLast}L{/if}{/each}', { items: ['x'] }))
			.toBe('FL')
	})

	test('isFirst/isLast used for separator pattern', async () => {
		expect(await render('{#each items as item}{ item }{#if isLast}{:else}, {/if}{/each}', { items: ['a', 'b', 'c'] }))
			.toBe('a, b, c')
	})

	test('length with object iteration', async () => {
		expect(await render('{#each obj as v}{ length }{/each}', { obj: { a: '1', b: '2', c: '3' } }))
			.toBe('333')
	})

	test('isFirst with object iteration', async () => {
		expect(await render('{#each obj as v, k}{#if isFirst}[{ k }]{/if}{/each}', { obj: { x: '1', y: '2' } }))
			.toBe('[x]')
	})

	test('nested loops have independent meta-vars', async () => {
		expect(await render(
			'{#each outer as o}{#each inner as i}{ isFirst }{/each}{/each}',
			{ outer: ['a', 'b'], inner: ['x', 'y', 'z'] }
		)).toBe('truefalsefalsetruefalsefalse')
	})

	test('length in nested inner loop is inner length', async () => {
		expect(await render(
			'{#each outer as o}{ length }{#each inner as i}{ length }{/each}{/each}',
			{ outer: ['a', 'b'], inner: ['x', 'y'] }
		)).toBe('222222')
	})

})
