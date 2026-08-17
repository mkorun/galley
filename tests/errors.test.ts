import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

// Error detection — ported from v1 test suite

describe('unclosed blocks', () => {

	test('unclosed {#if} throws with tag name and line', async () => {
		await expect(render('{#if flag}text', { flag: true }))
			.rejects.toThrow(/line 1.*unclosed.*flag/i)
	})

	test('unclosed {#each} throws', async () => {
		await expect(render('{#each items as item}<li>{ item }</li>', { items: ['a'] }))
			.rejects.toThrow(/unclosed.*items/i)
	})

	test('reports the correct line number of the opening tag', async () => {
		const tpl = 'line1\nline2\n{#if flag}\ntext'
		await expect(render(tpl, { flag: true }))
			.rejects.toThrow(/line 3/)
	})

})

describe('unmatched closing tags', () => {

	test('{/if} without matching {#if} throws', async () => {
		await expect(render('text{/if}', {}))
			.rejects.toThrow(/without matching/i)
	})

	test('{/each} without matching {#each} throws', async () => {
		await expect(render('text{/each}', {}))
			.rejects.toThrow(/without matching/i)
	})

})

describe('type mismatch', () => {

	test('closing {/each} inside {#if} throws', async () => {
		await expect(render('{#if flag}{/each}{/if}', { flag: true }))
			.rejects.toThrow(/without matching/i)
	})

	test('closing {/if} inside {#each} throws', async () => {
		await expect(render('{#each items as item}{/if}{/each}', { items: ['a'] }))
			.rejects.toThrow(/without matching/i)
	})

})

describe('valid nesting still works', () => {

	test('nested {#if} blocks compile and render correctly', async () => {
		const tpl = '{#if a}{#if b}both{/if}only-a{/if}'
		expect(await render(tpl, { a: true,  b: true  })).toBe('bothonly-a')
		expect(await render(tpl, { a: true,  b: false })).toBe('only-a')
		expect(await render(tpl, { a: false, b: false })).toBe('')
	})

	test('{#if} with {:else} inside outer block', async () => {
		const tpl = '{#if a}{#if b}both{:else}only-a{/if}{/if}'
		expect(await render(tpl, { a: true,  b: true  })).toBe('both')
		expect(await render(tpl, { a: true,  b: false })).toBe('only-a')
		expect(await render(tpl, { a: false             })).toBe('')
	})

	test('{#each} inside {#if}', async () => {
		const tpl = '{#if items}<ul>{#each items as item}<li>{ item }</li>{/each}</ul>{/if}'
		expect(await render(tpl, { items: ['a', 'b'] })).toBe('<ul><li>a</li><li>b</li></ul>')
		expect(await render(tpl, {})).toBe('')
	})

})
