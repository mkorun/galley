import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('G-40: single-quoted suffixes stop forbidden schemes', async () => {
	await expect(render("<a href='{ u }:alert(1)'>", { u: 'javascript' })).rejects.toThrow('G5001')
})

test('G-40: writes propagate through three snippet levels to a second caller', async () => {
	const declarations = '{#snippet a(v)}{ v }{/snippet}{#snippet b(v)}{@render a(v)}{/snippet}{#snippet c(v)}{@render b(v)}{/snippet}'
	await expect(render(declarations + '<a href="{@render c(x)}"><a href="{@render c(u)}:alert(1)">', { x: '/ok', u: 'javascript' })).rejects.toThrow('G5001')
	await expect(galley(declarations + '<a href="{@render c(x)}"><a href="ftp://{@render c(u)}">')).rejects.toThrow('G3015')
})

test('G-40: removable metadata at the start of a snippet owns its indentation', async () => {
	const source = '{#snippet s()}<meta content="{ a }"><p>kept</p>{/snippet}    {@render s()}'
	expect(await render(source, { a: '' })).toBe('    <p>kept</p>')
})


test('G-40: cached conditional and loop writes propagate to every caller', async () => {
	for (const body of ['{#if p}{ v }{/if}', '{#each xs as x}{ x }{/each}']) {
		await expect(galley(`{#snippet s(v)}${body}{/snippet}<a href="{@render s(x)}"><a href="ftp://{@render s(u)}">`)).rejects.toThrow('G3015')
	}
})

test('G-40: a template boundary clears the previous attribute in diagnostics', async () => {
	await expect(galley('<a hidden{@const n = 1}href="x">')).rejects.toThrow('tag(a;')
})

test('G-40: literal metadata after an empty write keeps its tag', async () => {
	expect(await render('<meta content="{ a }x">', { a: '' })).toBe('<meta content="x">')
})

test('G-40: snippets own the pending metadata newline flag', async () => {
	const source = 'x{#snippet s()}\n<p>x</p>{/snippet}<meta content="{ a }">{@render s()}'
	expect(await render(source, { a: '' })).toBe('x\n<p>x</p>')
})

test('G-40: an unmatched JS delimiter is a malformed tag', async () => {
	await expect(render('a{@js}missing')).rejects.toThrow('G3019')
	expect(await render('a\\{@js}missing')).toBe('a{@js}missing')
})
