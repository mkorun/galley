import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint, lex } from '../index.js'
import { render } from './helpers.js'

test('G-32/P3: JS inside a partial marks visible snippets and keeps the lexer line flag', async () => {
	const options = { allowCode: true, includes: { import: async () => '{@js}return s(){@js}' } }
	expect(await render('{#snippet s()}OK{/snippet}{@partial js.sort}', {}, options)).toBe('OK')
	const source = '{@js}return 1{@js}<!-- same line -->\n'
	expect(lex({ id: 'js', text: source }).map(t => t.kind)).toEqual(['js', 'text'])
	expect(await render(source, {}, { allowCode: true })).toBe('1<!-- same line -->\n')
	expect(await render('<svg><title>x</title>{@raw x}</svg>', { x: '<path/>' })).toBe('<svg><title>x</title><path/></svg>')
})

test('G-32/P3: rule 5 and 9 refusals point to the start tag, including a split start tag', async () => {
	for (const source of ['hello\n<title/>', 'hello\n<select>', 'hello\n<template><col>', 'hello\n<title {#if p}x{/if}/>']) {
		try { await galley(source); throw new Error('Expected refusal') }
		catch (error) {
			expect(error).toBeInstanceOf(GalleyDiagnosticError)
			const diagnostic = (error as GalleyDiagnosticError).diagnostic
			expect(diagnostic.span.start).toBe(source.indexOf(source.includes('<col>') ? '<col>' : source.includes('<select>') ? '<select>' : '<title'))
		}
	}
})

test('G-32/P3: config and standalone comments commute in both orders', async () => {
	for (const comment of ['<!-- c -->', '<!-- {#if p}x{/if} -->']) for (const ending of ['', '\nafter', '\r\nafter']) {
		for (const text of [comment + '<galley:config>{}</galley:config>', '<galley:config>{}</galley:config>' + comment]) {
			expect(await render(text + ending)).toBe(ending ? 'after' : '')
			expect(await render('before\n  ' + text + ending)).toBe(ending ? 'before\nafter' : 'before')
		}
	}
	expect(await render('inline<!-- c --><galley:config>{}</galley:config>\nafter')).toBe('inline<!-- c -->\nafter')
})

test('G-32/P3: empty metadata removes static indentation across blocks and leaves values intact', async () => {
	expect(await render('<head>\n  {#if p}<meta content="{ a }">{/if}\n</head>', { p: true })).toBe('<head>\n</head>')
	expect(await render('{ x } \t{#if p}<meta content="{ a }">{/if}\n', { x: 'keep  ', p: true })).toBe('keep  ')
	expect(await render('  {#if p}{ x }<meta content="{ a }">{/if}', { x: 'keep  ', p: true })).toBe('  keep  ')
	expect(await render('  {#if p}<meta content="{ a }">{/if}', { p: false })).toBe('  ')
})

test('G-32/P3: context identity mismatches show both tag identities', async () => {
	await expect(galley('<a {#if p}><a {/if}>')).rejects.toThrow(/tagId=1.*tagId=2/)
})

test('G-32/P3: foreign count underflow is killed without Chromium', async () => {
	for (const foreign of ['svg', 'math']) await expect(galley(`</${foreign}><${foreign}><style>a<b</style>`)).rejects.toThrow('G3013')
	await expect(galley('</template><template><col>')).rejects.toThrow('G3013')
})
