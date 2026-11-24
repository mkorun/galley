import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

// ADR-014: Block-tags on their own line get their "own" newline stripped.
// The backward strip removes only trailing spaces/tabs (keeps the \n of the preceding line).
// The forward strip removes leading [ \t]*\n (the tag's own line-ending).
//
// Result: block-tag lines disappear; surrounding content newlines are preserved.

describe('ADR-014 — bidirectional whitespace stripping', () => {

	// ── {#if} ─────────────────────────────────────────────────────────────────

	test('{#if} on own line — tag lines removed, content newlines kept', async () => {
		expect(await render(
			'<div>\n{#if show}\n  content\n{/if}\n</div>',
			{ show: true },
		)).toBe('<div>\n  content\n</div>')
	})

	test('{#if} false — no blank line where the block was', async () => {
		expect(await render(
			'before\n{#if show}\n  hidden\n{/if}\nafter',
			{ show: false },
		)).toBe('before\nafter')
	})

	test('{:else} branch — tag lines removed', async () => {
		expect(await render(
			'<p>\n{#if a}\nyes\n{:else}\nno\n{/if}\n</p>',
			{ a: false },
		)).toBe('<p>\nno\n</p>')
	})

	test('{:else} true branch — same', async () => {
		expect(await render(
			'<p>\n{#if a}\nyes\n{:else}\nno\n{/if}\n</p>',
			{ a: true },
		)).toBe('<p>\nyes\n</p>')
	})

	test('{:else if} — correct branch, tag lines removed', async () => {
		expect(await render(
			'[\n{#if x}\nA\n{:else if y}\nB\n{:else}\nC\n{/if}\n]',
			{ x: false, y: true },
		)).toBe('[\nB\n]')
	})

	// ── {#each} ───────────────────────────────────────────────────────────────

	test('{#each} on own line — tag lines removed', async () => {
		expect(await render(
			'<ul>\n{#each items as item}\n<li>{ item }</li>\n{/each}\n</ul>',
			{ items: ['a', 'b'] },
		)).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>')
	})

	test('{#each} empty array — no blank line', async () => {
		expect(await render(
			'before\n{#each items as item}\n{ item }\n{/each}\nafter',
			{ items: [] },
		)).toBe('before\nafter')
	})

	// ── inline (no stripping) ─────────────────────────────────────────────────

	test('inline block tag — not on own line, no stripping', async () => {
		expect(await render(
			'x{#if show}y{/if}z',
			{ show: true },
		)).toBe('xyz')
	})

	test('tag with non-whitespace before it on same line — no backward strip', async () => {
		// "text " is not pure-whitespace last-line → backward condition fails
		// Forward strip still happens (next text starts with \n)
		expect(await render(
			'text {#if show}\ncontent\n{/if}',
			{ show: true },
		)).toBe('text \ncontent\n')
	})

	// ── indented block tags ───────────────────────────────────────────────────

	test('indented block tag — trailing indent stripped, preceding line kept', async () => {
		// "  " trailing indent stripped from "<div>\n  " → "<div>\n"
		expect(await render(
			'<div>\n  {#if show}\n  content\n  {/if}\n</div>',
			{ show: true },
		)).toBe('<div>\n  content\n</div>')
	})

	// ── nested blocks ─────────────────────────────────────────────────────────

	test('nested {#if} — inner block strips via wsPrevWasEmpty path', async () => {
		// After outer {#if} strips "\n", the inner {#if} has no prev text.
		// wsPrevWasEmpty allows the inner block to still do a forward strip.
		expect(await render(
			'[\n{#if a}\n{#if b}\nAB\n{/if}\n{/if}\n]',
			{ a: true, b: true },
		)).toBe('[\nAB\n]')
	})

	test('indented nested {#if} — both blocks strip correctly', async () => {
		expect(await render(
			'{#if a}\n  {#if b}\n    content\n  {/if}\n{/if}',
			{ a: true, b: true },
		)).toBe('    content\n')
	})

	// ── strip: true option ────────────────────────────────────────────────────

	test('strip option compresses whitespace in final output', async () => {
		const galley = (await import('./compiler')).default
		const util  = (await import('../util')).default
		const tpl = await galley(
			'<p>\n  { title }\n</p>',
			{ includes: { import: () => Promise.resolve(''), basedir: '.' }, strip: true },
		)
		const result = tpl.render({ title: 'hi' })
		expect(result).not.toContain('\n')
	})

})

 test('G-22 ADR-014: inline expressions and blocks retain their following newline', async () => {
	expect(await render('{ x }{#if p}\nhello{/if}', { x: 'A', p: true })).toBe('A\nhello')
	expect(await render('<a{#if p}{/if}\nhref="/ok">')).toBe('<a\nhref="/ok">')
 })
 test('G-20 strip runs before reading and preserves dynamic whitespace', async () => {
	const galley = (await import('../index.js')).default
	const util = (await import('../util.js')).default
	const blocked = await galley('<a hr\nef="{ u }">', { strip: true })
	expect(() => blocked.render({ u: 'javascript:x' })).toThrow('G5001')
	const template = await galley('{@const n = 1}{#snippet s()}<i> x </i>{/snippet}{#if p}<b>{ v }</b>{/if}{#each xs as x}<i>{ x }</i>{/each}{@partial p.sort}<p>  ', { strip: true, includes: { import: async () => '<em>\nx</em>' } })
	expect(await template.render({ p: true, v: '\n  < x', xs: ['\n '] })).toBe('<b>\n  &lt; x</b><i>\n </i><em>x</em><p>')
 })
