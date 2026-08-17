import { describe, expect, test } from 'bun:test'
import { GalleyDiagnosticError, lint } from '../index'
import { render } from './helpers'

describe('{#snippet} / {@render}', () => {

	test('basic snippet definition and render', async () => {
		expect(await render(
			'{#snippet greet(name)}<b>Hello { name }</b>{/snippet}{@render greet(who)}',
			{ who: 'World' }
		)).toBe('<b>Hello World</b>')
	})

	test('snippet without parameter', async () => {
		expect(await render(
			'{#snippet banner()}<div>Banner</div>{/snippet}{@render banner()}',
			{}
		)).toBe('<div>Banner</div>')
	})

	test('snippet called multiple times', async () => {
		expect(await render(
			'{#snippet item(x)}<li>{ x }</li>{/snippet}{@render item(a)}{@render item(b)}',
			{ a: 'first', b: 'second' }
		)).toBe('<li>first</li><li>second</li>')
	})

	test('snippet used inside {#each}', async () => {
		expect(await render(
			'{#snippet card(article)}<article>{ article.title }</article>{/snippet}' +
			'{#each articles as article}{@render card(article)}{/each}',
			{ articles: [{ title: 'A' }, { title: 'B' }] }
		)).toBe('<article>A</article><article>B</article>')
	})

	test('snippet sees outer loop variable via closure', async () => {
		expect(await render(
			'{#each sections as section}' +
			'{#snippet card(article)}<p>{ section.name }: { article.title }</p>{/snippet}' +
			'{#each section.articles as article}{@render card(article)}{/each}' +
			'{/each}',
			{ sections: [{ name: 'S1', articles: [{ title: 'A1' }] }] }
		)).toBe('<p>S1: A1</p>')
	})

	test('snippet with HTML escaping', async () => {
		expect(await render(
			'{#snippet item(x)}<b>{ x }</b>{/snippet}{@render item(val)}',
			{ val: '<script>' }
		)).toBe('<b>&lt;script&gt;</b>')
	})

	test('nested snippet restores its parent snippet buffer', async () => {
		expect(await render(
			'{#snippet outer(x)}A{#snippet inner(y)}I{ y }{/snippet}B{@render inner(x)}C{/snippet}{@render outer(v)}',
			{ v: 'V' },
		)).toBe('ABIVC')
	})

	test('snippet declared in an if branch is not visible outside it', async () => {
		const source = '{#if false}{#snippet local()}Hi{/snippet}{/if}{@render local()}'
		expect(lint(source).map(diagnostic => diagnostic.code)).toContain('G3005')
		await expect(render(source)).rejects.toBeInstanceOf(GalleyDiagnosticError)
	})

	test('snippet declared in a loop is not visible outside it', async () => {
		const source = '{#each items as item}{#snippet local()}Hi{/snippet}{/each}{@render local()}'
		expect(lint(source).map(diagnostic => diagnostic.code)).toContain('G3005')
		await expect(render(source, { items: [] })).rejects.toBeInstanceOf(GalleyDiagnosticError)
	})

	test('same snippet name is allowed in independent branches', async () => {
		const source = '{#if first}{#snippet local()}A{/snippet}{@render local()}{:else}{#snippet local()}B{/snippet}{@render local()}{/if}'
		expect(lint(source).filter(diagnostic => diagnostic.severity === 'error')).toEqual([])
		expect(await render(source, { first: true })).toBe('A')
		expect(await render(source, { first: false })).toBe('B')
	})

	test('nested snippet shadowing cannot replace the outer binding', async () => {
		const source = '{#snippet local()}OUTER{/snippet}{#if show}{#snippet local()}INNER{/snippet}{@render local()}{/if}{@render local()}'
		expect(lint(source).filter(diagnostic => diagnostic.severity === 'error')).toEqual([])
		expect(await render(source, { show: true })).toBe('INNEROUTER')
	})

	test('unrendered nested snippet cannot affect an outer render', async () => {
		const source = '{#snippet local()}OUTER{/snippet}{#if show}{#snippet local()}INNER{/snippet}{/if}{@render local()}'
		expect(lint(source).map(diagnostic => diagnostic.code)).toEqual(['G3006'])
		expect(await render(source, { show: true })).toBe('OUTER')
	})

	test('loop-local snippet shadowing remains local to each iteration', async () => {
		const source = '{#snippet local()}OUTER{/snippet}{#each items as item}{#snippet local()}INNER{/snippet}{@render local()}{/each}{@render local()}'
		expect(await render(source, { items: [1, 2] })).toBe('INNERINNEROUTER')
	})

	test('strict mode preserves render-before-declaration and recursion', async () => {
		expect(await render('{@render later()}{#snippet later()}L{/snippet}')).toBe('L')
		expect(await render('{#snippet self(x)}{#if x}A{@render self(false)}{/if}{/snippet}{@render self(true)}')).toBe('A')
		expect(await render('{#snippet a(x)}A{#if x}{@render b(false)}{/if}{/snippet}{#snippet b(x)}B{/snippet}{@render a(true)}')).toBe('AB')
	})

	test('util is a regular snippet parameter and cannot shadow compiler filters', async () => {
		expect(await render('{#snippet card(util)}{util|upper}{/snippet}{@render card(title)}', { title: 'hello' })).toBe('HELLO')
	})

})
