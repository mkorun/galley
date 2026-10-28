import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('{#if} / {:else if} / {:else} / {/if}', () => {
	test('separately parenthesized operands compose with logical operators', async () => {
		expect(await render('{#if (a) && (b)}yes{/if}', { a: true, b: true })).toBe('yes')
		expect(await render('{#if (a) || (b)}yes{/if}', { a: false, b: true })).toBe('yes')
		expect(await render("{#if (status === 'live') && (count > 0)}yes{/if}", { status: 'live', count: 1 })).toBe('yes')
	})

	test('renders block when condition is truthy', async () => {
		expect(await render('{#if show}<p>yes</p>{/if}', { show: true })).toBe('<p>yes</p>')
	})

	test('skips block when condition is falsy', async () => {
		expect(await render('{#if show}<p>yes</p>{/if}', { show: false })).toBe('')
	})

	test('skips block when condition is undefined', async () => {
		expect(await render('{#if show}<p>yes</p>{/if}', {})).toBe('')
	})

	test('{:else} branch renders when condition is falsy', async () => {
		expect(await render('{#if a}A{:else}B{/if}', { a: false })).toBe('B')
	})

	test('{:else if} branch renders when first is false, second is true', async () => {
		expect(await render('{#if a}A{:else if b}B{:else}C{/if}', { a: false, b: true })).toBe('B')
	})

	test('{:else} fallback when all conditions false', async () => {
		expect(await render('{#if a}A{:else if b}B{:else}C{/if}', { a: false, b: false })).toBe('C')
	})

	test('nested {#if}', async () => {
		expect(await render('{#if a}{#if b}AB{/if}{/if}', { a: true, b: true })).toBe('AB')
	})

	test('nested {#if} — inner false', async () => {
		expect(await render('{#if a}{#if b}AB{/if}{/if}', { a: true, b: false })).toBe('')
	})

	test('condition on nested path', async () => {
		expect(await render('{#if meta.show}yes{/if}', { meta: { show: true } })).toBe('yes')
	})

	test('inline if with surrounding content', async () => {
		expect(await render('A{#if x}B{/if}C', { x: true })).toBe('ABC')
	})

	test('condition with ?? fallback evaluates truthy fallback', async () => {
		expect(await render("{#if val ?? 'default'}yes{/if}", {})).toBe('yes')
	})

	test('non-empty string is truthy', async () => {
		expect(await render('{#if title}yes{/if}', { title: 'Hello' })).toBe('yes')
	})

	test('empty string is falsy', async () => {
		expect(await render('{#if title}yes{/if}', { title: '' })).toBe('')
	})

	test('0 is falsy', async () => {
		expect(await render('{#if count}yes{/if}', { count: 0 })).toBe('')
	})

	test('non-empty array is truthy', async () => {
		expect(await render('{#if items}yes{/if}', { items: ['a'] })).toBe('yes')
	})

	test('{:else} skips when condition is true', async () => {
		expect(await render('{#if a}A{:else}B{/if}', { a: true })).toBe('A')
	})

	test('{:else if} first branch wins when both conditions true', async () => {
		expect(await render('{#if a}A{:else if b}B{:else}C{/if}', { a: true, b: true })).toBe('A')
	})

	test('safe when parent path is undefined', async () => {
		expect(await render('{#if meta.subtitle}yes{/if}', {})).toBe('')
	})

	test('outer false, inner ignored', async () => {
		expect(await render('{#if a}{#if b}AB{/if}{/if}', { a: false, b: true })).toBe('')
	})

})

describe('{#if !expr} — negation', () => {

	test('!false is truthy', async () => {
		expect(await render('{#if !flag}yes{/if}', { flag: false })).toBe('yes')
	})

	test('!true is falsy', async () => {
		expect(await render('{#if !flag}yes{/if}', { flag: true })).toBe('')
	})

	test('!undefined is truthy', async () => {
		expect(await render('{#if !flag}yes{/if}', {})).toBe('yes')
	})

	test('!nested.path', async () => {
		expect(await render('{#if !meta.hide}visible{/if}', { meta: { hide: false } })).toBe('visible')
		expect(await render('{#if !meta.hide}visible{/if}', { meta: { hide: true } })).toBe('')
	})

	test('!undefined nested path is truthy', async () => {
		expect(await render('{#if !meta.hide}visible{/if}', {})).toBe('visible')
	})

	test('{:else if !cond}', async () => {
		expect(await render('{#if a}A{:else if !b}C{:else}B{/if}', { a: false, b: false })).toBe('C')
		expect(await render('{#if a}A{:else if !b}C{:else}B{/if}', { a: false, b: true })).toBe('B')
	})

	test('!scopeVar in {#each}', async () => {
		expect(await render(
			'{#each items as item}{ item }{#if !isLast}|{/if}{/each}',
			{ items: ['a', 'b', 'c'] },
		)).toBe('a|b|c')
	})

})

describe('{#if} comparisons', () => {

	test('=== string literal', async () => {
		expect(await render("{#if status === 'published'}yes{/if}", { status: 'published' })).toBe('yes')
		expect(await render("{#if status === 'published'}yes{/if}", { status: 'draft' })).toBe('')
	})

	test('!== string literal', async () => {
		expect(await render("{#if status !== 'published'}unpublished{/if}", { status: 'draft' })).toBe('unpublished')
		expect(await render("{#if status !== 'published'}unpublished{/if}", { status: 'published' })).toBe('')
	})

	test('> number literal', async () => {
		expect(await render('{#if count > 0}yes{/if}', { count: 1 })).toBe('yes')
		expect(await render('{#if count > 0}yes{/if}', { count: 0 })).toBe('')
	})

	test('>= number literal', async () => {
		expect(await render('{#if count >= 3}yes{/if}', { count: 3 })).toBe('yes')
		expect(await render('{#if count >= 3}yes{/if}', { count: 2 })).toBe('')
	})

	test('< number literal', async () => {
		expect(await render('{#if count < 5}yes{/if}', { count: 4 })).toBe('yes')
		expect(await render('{#if count < 5}yes{/if}', { count: 5 })).toBe('')
	})

	test('array length > 0', async () => {
		expect(await render('{#if items.length > 0}yes{/if}', { items: ['a'] })).toBe('yes')
		expect(await render('{#if items.length > 0}yes{/if}', { items: [] })).toBe('')
	})

	test('nested path comparison', async () => {
		expect(await render("{#if meta.status === 'active'}yes{/if}", { meta: { status: 'active' } })).toBe('yes')
	})

	test('path === path', async () => {
		expect(await render('{#if a === b}yes{/if}', { a: 'x', b: 'x' })).toBe('yes')
		expect(await render('{#if a === b}yes{/if}', { a: 'x', b: 'y' })).toBe('')
	})

	test('=== true / false / null / undefined literals', async () => {
		expect(await render('{#if isDraft === true}yes{/if}', { isDraft: true })).toBe('yes')
		expect(await render('{#if isDraft === true}yes{/if}', { isDraft: false })).toBe('')
		expect(await render('{#if isDraft === false}yes{/if}', { isDraft: false })).toBe('yes')
		expect(await render('{#if val === null}yes{/if}', { val: null })).toBe('yes')
		expect(await render('{#if val === undefined}yes{/if}', { val: undefined })).toBe('yes')
		expect(await render('{#if val !== null}yes{/if}', { val: 'x' })).toBe('yes')
	})

	test('{:else if} with comparison', async () => {
		expect(await render(
			"{#if count > 10}big{:else if count > 0}small{:else}zero{/if}",
			{ count: 5 },
		)).toBe('small')
	})

	test('in {#each} loop', async () => {
		expect(await render(
			'{#each items as item}{#if item.n > 2}{ item.n } {/if}{/each}',
			{ items: [{ n: 1 }, { n: 3 }, { n: 5 }] },
		)).toBe('3 5 ')
	})

})

describe('{#if} logical operators — && and ||', () => {

	test('&& — both true', async () => {
		expect(await render('{#if a && b}yes{/if}', { a: true, b: true })).toBe('yes')
	})

	test('&& — one false', async () => {
		expect(await render('{#if a && b}yes{/if}', { a: true, b: false })).toBe('')
		expect(await render('{#if a && b}yes{/if}', { a: false, b: true })).toBe('')
	})

	test('|| — one true', async () => {
		expect(await render('{#if a || b}yes{/if}', { a: false, b: true })).toBe('yes')
		expect(await render('{#if a || b}yes{/if}', { a: true, b: false })).toBe('yes')
	})

	test('|| — both false', async () => {
		expect(await render('{#if a || b}yes{/if}', { a: false, b: false })).toBe('')
	})

	test('&& with nested paths', async () => {
		expect(await render('{#if meta.show && meta.title}yes{/if}', { meta: { show: true, title: 'Hi' } })).toBe('yes')
		expect(await render('{#if meta.show && meta.title}yes{/if}', { meta: { show: true, title: '' } })).toBe('')
	})

	test('&& with comparison on left side', async () => {
		expect(await render("{#if status === 'published' && flag}yes{/if}", { status: 'published', flag: true })).toBe('yes')
		expect(await render("{#if status === 'published' && flag}yes{/if}", { status: 'draft', flag: true })).toBe('')
	})

	test('|| with comparison', async () => {
		expect(await render("{#if status === 'draft' || status === 'seed'}unpublished{/if}", { status: 'seed' })).toBe('unpublished')
		expect(await render("{#if status === 'draft' || status === 'seed'}unpublished{/if}", { status: 'published' })).toBe('')
	})

	test('precedence: && binds tighter than ||', async () => {
		// a || b && c  ≡  a || (b && c)
		expect(await render('{#if a || b && c}yes{/if}', { a: false, b: true, c: true })).toBe('yes')
		expect(await render('{#if a || b && c}yes{/if}', { a: false, b: true, c: false })).toBe('')
		expect(await render('{#if a || b && c}yes{/if}', { a: true, b: false, c: false })).toBe('yes')
	})

	test('! binds tighter than || and &&', async () => {
		expect(await render('{#if !a || b}yes{:else}no{/if}', { a: false, b: true })).toBe('yes')
		expect(await render('{#if !a || b}yes{:else}no{/if}', { a: true, b: false })).toBe('no')
		expect(await render('{#if !a && b}yes{:else}no{/if}', { a: false, b: false })).toBe('no')
		expect(await render('{#if b || !a}yes{:else}no{/if}', { a: true, b: false })).toBe('no')
		expect(await render('{#if !a || !b}yes{:else}no{/if}', { a: true, b: false })).toBe('yes')
	})

	test('! binds tighter than comparisons', async () => {
		expect(await render('{#if !a === true}yes{:else}no{/if}', { a: false })).toBe('yes')
		expect(await render('{#if !a === true}yes{:else}no{/if}', { a: true })).toBe('no')
	})

	test('!( … ) negates the whole group', async () => {
		expect(await render('{#if !(a || b)}yes{:else}no{/if}', { a: false, b: true })).toBe('no')
		expect(await render('{#if !(a || b)}yes{:else}no{/if}', { a: false, b: false })).toBe('yes')
	})

	test('! combined with &&', async () => {
		expect(await render('{#if !a && b}yes{/if}', { a: false, b: true })).toBe('yes')
		expect(await render('{#if !a && b}yes{/if}', { a: true, b: true })).toBe('')
	})

	test('{:else if} with &&', async () => {
		expect(await render(
			"{#if a && b}AB{:else if a}A{:else}none{/if}",
			{ a: true, b: false },
		)).toBe('A')
	})

	test('undefined paths are falsy in &&', async () => {
		expect(await render('{#if isUpdated && meta.publishFrom}yes{/if}', { isUpdated: true, meta: {} })).toBe('')
		expect(await render('{#if isUpdated && meta.publishFrom}yes{/if}', { isUpdated: true, meta: { publishFrom: '2026-01-01' } })).toBe('yes')
	})

})
