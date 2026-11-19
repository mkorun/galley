import { expect, test } from 'bun:test'
import galley, { parse } from '../index.js'
import { readContexts } from '../compiler/context.js'
import { render } from './helpers.js'

test('G-41: scripted snippet marking preserves hoisting, shadowing and restored visibility', async () => {
	const source = `{#snippet s()}outer{/snippet}{#if p}{#snippet s()}inner{/snippet}{@js} return s() {@js}{/if}{@js} return s() {@js}{@js} return s() {@js}`
	expect(await render(source, { p: true }, { allowCode: true })).toBe('innerouterouter')
	expect(await render(source, { p: false }, { allowCode: true })).toBe('outerouter')
	const shadowed = readContexts(parse({ id: 'G-41', text: `{#snippet s()}outer{/snippet}{#if p}{#snippet s()}inner{/snippet}{@js} return s() {@js}{/if}` }))
	const outer = shadowed.children[0]!
	expect(outer.kind === 'snippet' && outer.js).toBeUndefined()
	const template = await galley(`{#snippet s()}outer{/snippet}{@partial p.sort}{@js} return s() {@js}`, { allowCode: true, includes: { import: async () => `{@js} return s() {@js}` } })
	expect(await template.render({}, {})).toBe('outerouter')
	// Out-of-scope declarations must not acquire a text specialization at a later JS block.
	for (const source of [
		`{#if p}{#snippet hidden()}<{/snippet}{/if}{@js} return '' {@js}`,
		`{#if p}{#snippet hidden()}<{/snippet}{/if}{#if p}{#snippet hidden()}x{/snippet}{/if}{@js} return '' {@js}`,
	]) expect(await render(source, { p: true }, { allowCode: true })).toBe('')
	expect(await render(`{#snippet s()}<{/snippet}{#if p}{#snippet s()}first{/snippet}{/if}{#if p}{#snippet s()}second{/snippet}{@js} return s() {@js}{/if}`, { p: true }, { allowCode: true })).toBe('second')
})

test('G-41: local names stay in their lexical scope without copying all visible names', async () => {
	const source = `{@const a = 'outer'}{#if p}{@const a = 'inner'}{@const b = a}{ b }{/if}{ a }{ b }{#each xs as a}{ a }{/each}{ a }{#snippet s(a)}{ a }{/snippet}{@render s(v)}{ a }`
	expect(await render(source, { p: true, b: 'data', xs: ['loop'], v: 'param' })).toBe('innerouterdataloopouterparamouter')
})
