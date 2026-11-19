import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('G-37: finished URL prefixes stop snippet cycles and character-reference colons', async () => {
	const cycle = '{#snippet a(n)}{@render b(n)}:alert(1){/snippet}{#snippet b(n)}{#if n}{@render a(false)}{/if}{/snippet}<a href="{ x }{@render a(false)}">first</a><a href="{ u }{@render b(true)}">second</a>'
	await expect(render(cycle, { x: 'https://example.org/', u: 'javascript' })).rejects.toThrow('G5001')
	for (const attribute of ['a href', 'a xlink:href', 'form action', 'iframe src']) {
		for (const colon of ['&#58;', '&#58', '&colon;', '&#x3A;']) {
			await expect(render(`<${attribute}="{ u }${colon}alert(1)">${attribute.startsWith('iframe') ? '</iframe>' : ''}`, { u: 'javascript' })).rejects.toThrow('G5001')
		}
	}
})

test('G-38: finished prefixes with no nonempty dynamic write render static fallbacks', async () => {
	for (const [source, expected] of [
		['<a href="{#if u}{ u }{:else}javascript:void(0){/if}">', '<a href="javascript:void(0)">'],
		['<img src="{#if src}{ src }{:else}data:image/gif;base64,AA=={/if}">', '<img src="data:image/gif;base64,AA==">'],
		['<a href="{#if u}{ u }{:else}ftp://files.example.org/{/if}">', '<a href="ftp://files.example.org/">'],
		['<a href="{#if a}app:local{/if}{ u }">', '<a href="app:local">'],
		['<a href="java{ u }script:x">', '<a href="javascript:x">'],
	]) expect(await render(source!, { u: '', src: '', a: true })).toBe(expected!)
})

test('G-36: end checks reject unsettled bare words followed by references or port literals', async () => {
	for (const suffix of ['&amp;b=1', ':8080/']) await expect(render(`<a href="{ u }${suffix}">`, { u: 'host' })).rejects.toThrow('G5001')
})

