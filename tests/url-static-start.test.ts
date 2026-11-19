import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('G-34: forbidden static starts need an actual dynamic write', async () => {
	const includes = { import: async () => 'AA==' }
	for (const source of [
		'<script src="//cdn.example.org/lib.js{#if dev}?dev=1{/if}"></script>',
		'<img src="data:image/png;base64,{@partial img.b64}">',
		'<a href="javascript:void(0){#if a} {/if}">x</a>',
		'<a href="ftp://example.org/{#if p}x{/if}">x</a>',
		'<a href="ftp://example.org/{@const x = 1}">',
	]) expect(await render(source, {}, { includes })).toBe(source.replace('{#if dev}?dev=1{/if}', '').replace('{@partial img.b64}', 'AA==').replace('{#if a} {/if}', '').replace('{#if p}x{/if}', '').replace('{@const x = 1}', ''))
	await expect(galley('<a href="//x')).rejects.toThrow('G3012')
	await expect(galley('<a href="//x{#if p}{ u }{/if}">')).rejects.toThrow('G3015')
})

