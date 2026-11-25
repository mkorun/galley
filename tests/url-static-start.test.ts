import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'
import { render } from './helpers.js'

test('cached snippet text is checked against every URL-list caller, in either order', async () => {
	for (const attribute of ['srcset', 'imagesrcset']) {
		for (const firstTag of ['img', 'source']) {
			for (const nested of [false, true]) {
				const snippets = '{#snippet q()}?a=1&amp;b=2 1x{/snippet}' + (nested ? '{#snippet outer()}{@render q()}{/snippet}' : '')
				const call = nested ? '{@render outer()}' : '{@render q()}'
				const staticTag = `<${firstTag} ${attribute}="/s.png${call}">`
				const dynamicTag = `<img ${attribute}="{#if p}{ v }, {/if}/b.png${call}">`
				expect(await lint(snippets + staticTag)).toEqual([])
				for (const tags of [[staticTag, dynamicTag], [dynamicTag, staticTag]]) {
					const source = snippets + tags.join('')
					expect((await lint(source)).map(d => d.code)).toEqual(['G3015'])
					await expect(galley(source)).rejects.toThrow('G3015')
					await expect(galley(source)).rejects.toThrow('Move query text into an escaped value')
				}
			}
		}
	}
})

test('cached callers retain their own forbidden prefixes and script/style diagnostic help', async () => {
	const snippets = '{#snippet q()}tail{/snippet}'
	const staticTag = '<a href="javascript:{@render q()}">'
	const dynamicTag = '<a href="{ v }{@render q()}">'
	for (const tags of [[staticTag, dynamicTag], [dynamicTag, staticTag]]) {
		expect(await lint(snippets + tags.join(''))).toEqual([])
		await expect(galley(snippets + tags.join(''))).resolves.toBeDefined()
		const source = snippets + tags.join('') + '<a href="javascript:{ v }{@render q()}">'
		expect((await lint(source))[0]).toMatchObject({ code: 'G3015', message: expect.stringContaining('forbidden static prefix') })
		await expect(galley(source)).rejects.toThrow('forbidden static prefix')
	}
	for (const owner of ['script', 'style']) {
		const source = `{#snippet q()}{ v }{/snippet}<title>{@render q()}</title><title>{@render q()}</title><${owner}>{@render q()}</${owner}>`
		const diagnostic = (await lint(source))[0]!
		expect(diagnostic.code).toBe('G3018')
		expect(diagnostic.help).toContain(`Rendered by {@render q()} at <template>:1:${source.lastIndexOf('{@render') + 1}.`)
		await expect(galley(source)).rejects.toMatchObject({ diagnostic })
	}
})

test('static-text obligations propagate through cached recursive variants', async () => {
	const snippets = '{#snippet a()}{#if p}{@render b()}{/if}?a=1&amp;b=2 1x{/snippet}{#snippet b()}{@render a()}{/snippet}'
	for (const attribute of ['srcset', 'imagesrcset']) {
		const source = snippets + `<img ${attribute}="/s.png{@render a()}"><img ${attribute}="{ v }{@render b()}">`
		expect((await lint(source)).map(d => d.code)).toEqual(['G3015'])
		await expect(galley(source)).rejects.toThrow('G3015')
	}
})

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

