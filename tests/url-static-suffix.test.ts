import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('G-36: literal scheme completions checkpoint attribute ends, including static snippets', async () => {
	for (const source of [
		'<a href="{ u }:alert(1)">', '<a href="{ u }:8080/">',
		'{#snippet a()}:alert(1){/snippet}<a href="{ u }{@render a()}">',
		'{#snippet a()}:alert(1){/snippet}<a href="{ u }{@render a()}"><a href="{ v }{@render a()}">',
		'{#snippet a()}:alert(1){/snippet}{#snippet b()}{@render a()}{/snippet}<a href="{ u }{@render b()}">',
		'<a href="{ u }{#if p}:alert(1){/if}">',
	]) {
		await expect(render(source, { u: 'javascript', v: 'javascript', p: true })).rejects.toThrow('G5001')
		await expect(render(source, { u: 'https://example.org', v: 'https://example.org', p: true })).resolves.toContain('https://example.org')
	}
	for (const source of ['<a href="{ u }/x">', '<a href="{ u }/x:y">', '<a href="{ u }?x:y">', '<a href="{ u }#x:y">', '<a href="https://{ host }">']) {
		const template = await galley(source, { debug: true })
		expect(template.source?.match(/\.check\(/g)?.length ?? 0).toBe(source.includes('{ u }') ? 2 : 0)
	}
	const suffix = await galley('<a href="{ u }:x">', { debug: true })
	expect(suffix.source?.match(/\.check\(/g)?.length).toBe(2)
})



test('G-34/G-36: static-only snippets stay static; actual writes propagate through calls and cycles', async () => {
	expect(await render('{#snippet a()}ftp://x{/snippet}{#snippet b()}{@render a()}{/snippet}<a href="{@render b()}">')).toBe('<a href="ftp://x">')
	expect(await render('{#snippet a()}x{/snippet}<a href="ftp://{@render a()}">')).toBe('<a href="ftp://x">')
	for (const body of ['{#if p}{ v }{/if}', '{#each xs as x}{ x }{/each}', '{@js}return "x"{@js}']) {
		await expect(galley(`{#snippet a()}${body}{/snippet}{#snippet b()}{@render a()}{/snippet}<a href="ftp://{@render b()}">`, { allowCode: true })).rejects.toThrow('G3015')
	}
	const recursive = '{#snippet a(v)}{#if v.next}{@render b(v.next)}{/if}{/snippet}{#snippet b(v)}{ v.x }{#if v.next}{@render a(v.next)}{/if}{/snippet}<a href="ftp://{@render a(u)}">'
	await expect(galley(recursive)).rejects.toThrow('G3015')
})

test('G-32/G-36: cached suffix and write summaries apply to every caller value', async () => {
	const suffix = '{#snippet s()}:alert(1){/snippet}<a href="{ u }{@render s()}"><a href="{ v }{@render s()}">'
	await expect(render(suffix, { u: 'https://example.org', v: 'javascript' })).rejects.toThrow('G5001')
	for (const body of ['{ v }', '{@js}return "x"{@js}']) {
		const declarations = `{#snippet s(v)}${body}{/snippet}{#snippet outer(v)}{@render s(v)}{/snippet}`
		for (const name of ['s', 'outer']) await expect(galley(declarations + `<a href="{@render ${name}(u)}"><a href="ftp://{@render ${name}(u)}">`, { allowCode: true })).rejects.toThrow('G3015')
	}
	for (const source of ['<a href="{ u }:{@const n = 1}">', '{#snippet colon()}:{/snippet}<a href="{ u }{@render colon()}">']) await expect(render(source, { u: 'javascript' })).rejects.toThrow('G5001')
	const allowed = '{#snippet s(v)}{ v }{/snippet}<a href="{@render s(u)}ps:">'
	expect(await render(allowed, { u: 'htt' })).toBe('<a href="https:">')
	for (const source of ['<a href="{ u }">after:x', '{#snippet s(v)}{ v.x }{#if v.next}{@render s(v.next)}{/if}{/snippet}<a href="{@render s(u)}">']) {
		const template = await galley(source, { debug: true })
		expect(template.source?.includes('$$url.check(true);')).toBe(false)
	}
})
