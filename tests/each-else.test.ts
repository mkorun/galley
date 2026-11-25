import { expect, test } from 'bun:test'
import galley, { lint } from '../index.js'

type Options = NonNullable<Parameters<typeof galley>[1]>
const render = async (source: string, data: object = {}, options: Options = {}): Promise<string> => (await galley(source, options)).render(data)
const refuse = async (source: string, code: string, options: Options = {}): Promise<void> => {
	await expect(galley(source, options), source).rejects.toThrow(code)
}

test('each-else: the fallback renders exactly when the body ran zero times', async () => {
	const source = '{#each items as x, i}[{ i }:{ x }]{:else}none{/each}'
	for (const items of [[], {}, undefined, null, 0, '', false, 3, true]) expect(await render(source, { items }), JSON.stringify(items)).toBe('none')
	expect(await render(source, { items: ['a', 'b'] })).toBe('[0:a][1:b]')
	expect(await render(source, { items: { k: 'v' } })).toBe('[k:v]')
	expect(await render('{#each items as x}{ x }{:else}{/each}|', {})).toBe('|')
	expect(await render('{#each items as x}{ x }{/each}|', { items: [1] })).toBe('1|')
})

test('each-else: the fallback stands outside the loop', async () => {
	// Item and index are not bound there; a metadata name belongs to the enclosing loop, or to the data.
	expect(await render('{#each items as x}{ x }{:else}[{ x }]{/each}', { x: 'root' })).toBe('[root]')
	expect(await render('{#each items as x}{ x }{:else}{ length }{/each}', { length: 7 })).toBe('7')
	const nested = '{#each outer as o}{#each o as inner}{ inner }{:else}{ isLast }{/each};{/each}'
	expect(await render(nested, { outer: [[], ['a'], []] })).toBe('false;a;true;')
	expect(await render('{#each a as x}{#each b as y}{ y }{:else}inner{/each}{:else}outer{/each}', { a: [1] })).toBe('inner')
	expect(await render('{#each a as x}{#each b as y}{ y }{:else}inner{/each}{:else}outer{/each}', {})).toBe('outer')
})

test('each-else: {:else} on a line of its own leaves no line behind', async () => {
	const source = '<ul>\n{#each items as x}\n<li>{ x }</li>\n{:else}\n<li>none</li>\n{/each}\n</ul>'
	expect(await render(source, { items: [] })).toBe('<ul>\n<li>none</li>\n</ul>')
	expect(await render(source, { items: [1] })).toBe('<ul>\n<li>1</li>\n</ul>')
})

test('each-else: only one {:else}, no {:else if}, and the block still needs its end', async () => {
	await refuse('{#each items as x}{ x }{:else if p}none{/each}', '{#each} takes {:else} only')
	await refuse('{#each items as x}{ x }{:else}a{:else}b{/each}', 'G2002')
	await refuse('{#each items as x}{ x }{:else}none', 'G2215')
	await refuse('{#each items as x}{ x }', 'G2215')
	await refuse('{:else}', 'G2002')
	await refuse('{#if p}a{:else}b{:else if q}c{/if}', 'G2002')
})

test('each-else: continuation words remain text or values unless written as continuation tags', async () => {
	expect(await render('{#each xs as x}else{ else }{:else}empty{/each}', { xs: [1], else: 'V' })).toBe('elseV')
	expect(await render('{#if p}else if value{:else if q}second{:else}last{/if}', { p: true })).toBe('else if value')
	expect(await render('{#if p}first{:else if q}second{:else}last{/if}', { q: true })).toBe('second')
	for (const source of ['{#each xs as x}{/if}', '{#if p}{/each}']) await refuse(source, 'G2001')
	for (const source of ['{#if p}{:unknown}{/if}', '{#each xs as x}{:unknown}{/each}']) await refuse(source, 'G2002')
})

test('each-else: partials, strip, lint and scripted snippets reach the fallback', async () => {
	const includes = { import: async () => '<b>P</b>' }
	expect(await render('{#each items as x}{ x }{:else}{@partial p.sort}{/each}', {}, { includes })).toBe('<b>P</b>')
	expect(await render('{#each items as x}{ x }{:else}a\n  <b>\n{/each}', {}, { strip: true })).toBe('a<b>')
	expect((await lint('{#each items as x}{ x }{:else}{@js}return 1{@js}{/each}')).map(item => item.code)).toEqual(['G3004'])
	// A snippet of the body is not visible in the fallback: each has a scope of its own, like the branches of {#if}.
	await refuse('{#each items as x}{#snippet s()}a{/snippet}{@render s()}{:else}{@render s()}{/each}', 'G3005')
	const scripted = '{#each items as x}{ x }{:else}{#snippet s()}OK{/snippet}{@js}return s(){@js}{/each}'
	expect(await render(scripted, {}, { allowCode: true })).toBe('OK')
	expect(await render('{#each items as x}{ x }{:else}before \t<meta content="{ a }">\nafter{/each}', { a: '' })).toBe('beforeafter')
})

test('metadata indentation follows each bodies, fallbacks, branches and snippet variants', async () => {
	for (const source of [
		'before{#each xs as x} \t<meta content="{ x }">\n{/each}after',
		'before{#each missing as x}{ x }{:else} \t<meta content="{ v }">\n{/each}after',
		'before{#if p} \t<meta content="{ v }">\n{/if}after',
		'before{#snippet s()} \t<meta content="{ v }">\n{/snippet}{@render s()}after',
	]) expect(await render(source, { xs: [''], v: '', p: true })).toBe('beforeafter')
})

test('each-else, rule 11: the fallback is a path of its own and must leave the context it entered', async () => {
	for (const source of [
		'{#each xs as x}a{:else}<a {/each}',
		'{#each xs as x}<a {:else}a{/each}',
		'<a title="{#each xs as x}{ x }{:else}" href="{/each}">',
		'<a{#each xs as x} hidden{:else}>{/each}',
		'<svg>{#each xs as x}a{:else}<desc>{/each}</svg>',
		'{#each xs as x}a{:else}<template>{/each}<col>',
		'<title>{#each xs as x}a{:else}</title><textarea>{/each}</textarea>',
	]) await refuse(source, 'G3010')
	await refuse('<a x={#each xs as x}"v"{:else}"w"{/each}>', 'G3010')
	await refuse('<svg><set to="{#each xs as x}a{:else}b{/each}"/></svg>', 'G3016')
	await refuse('{#each xs as x}a{:else}<a href={ u }>{/each}', 'G3008')
	await refuse('{#each xs as x}a{:else}a < b{/each}', 'G3014')
})

test('each-else, rule 11: whitespace before the next attribute holds on the body path and on the fallback path', async () => {
	// Refused: one path ends directly before `href`, or the fallback begins with a name directly after `title="x"`.
	for (const source of [
		'<a{#each xs as x} hidden {:else} title="x"{/each}href="{ u }">',
		'<a{#each xs as x} hidden{:else} title="x" {/each}href="{ u }">',
		'<a title="x"{#each xs as x} hidden {:else}{/each}href="{ u }">',
		'<a title="x"{#each xs as x} hidden {:else}lang="en" {/each}href="{ u }">',
	]) await refuse(source, 'G3014')
	// Accepted: both paths end in whitespace. With a fallback, zero iterations no longer pass the block's own entry on.
	const source = '<a title="x"{#each xs as x} hidden {:else} lang="en" {/each}href="{ u }">'
	expect(await render(source, { xs: [], u: '/ok' })).toBe('<a title="x" lang="en" href="/ok">')
	expect(await render(source, { xs: [1, 2], u: '/ok' })).toBe('<a title="x" hidden  hidden href="/ok">')
	for (const xs of [[], [1]]) await expect(render(source, { xs, u: 'javascript:x' })).rejects.toThrow('G5001')
	// The fallback starts as the block does: after whitespace it may begin with a name, and an empty one passes that whitespace on.
	expect(await render('<a title="x" {#each xs as x} hidden {:else}lang="en" {/each}href="{ u }">', { u: '/ok' })).toBe('<a title="x" lang="en" href="/ok">')
	expect(await render('<a title="x" {#each xs as x} hidden {:else}{/each}href="{ u }">', { u: '/ok' })).toBe('<a title="x" href="/ok">')
	// The body follows itself and never starts after whitespace, as at HEAD; without a fallback zero iterations pass the entry on.
	await refuse('<a title="x" {#each xs as x}hidden {:else} lang="en" {/each}href="{ u }">', 'G3014')
	await refuse('<a title="x"{#each xs as x} hidden {/each}href="{ u }">', 'G3014')
	expect(await render('<a title="x" {#each xs as x} hidden {/each}href="{ u }">', { u: '/ok' })).toBe('<a title="x" href="/ok">')
})

test('each-else: a value written in the fallback is checked like any other', async () => {
	const inHref = '<a href="{#each xs as x}/x/{ x }{:else}{ u }{/each}">'
	await expect(render(inHref, { u: 'javascript:x' })).rejects.toThrow('G5001')
	expect(await render(inHref, { u: '/ok' })).toBe('<a href="/ok">')
	expect(await render(inHref, { xs: ['a'], u: 'javascript:x' })).toBe('<a href="/x/a">')
	await refuse('<a href="javascript:{#each xs as x}x{:else}{ u }{/each}">', 'G3015')
	// The write hides in the fallback of a snippet: the forbidden static start is still found at compile time.
	await refuse('{#snippet s(v)}{#each xs as x}a{:else}{ v }{/each}{/snippet}<a href="javascript:{@render s(u)}">', 'G3015')
	expect(await render('{#snippet s(v)}{#each xs as x}a{:else}b{/each}{/snippet}<a href="javascript:{@render s(u)}">')).toBe('<a href="javascript:b">')
	// The same when the snippet's reading is reused for a second value: the fallback counts among what the snippet writes.
	await refuse('{#snippet s(v)}{#each xs as x}a{:else}{ v }{/each}{/snippet}<a href="x{@render s(u)}"><a href="javascript:{@render s(u)}">', 'G3015')
	const places = '{#each xs as x}{ x }{:else}<title>{ t }</title><a href="{ u }" title=\'{ t }\'>{/each}'
	expect(await render(places, { t: '<"\'>', u: '/a&b' })).toBe('<title>&lt;&quot;&apos;&gt;</title><a href="/a&amp;b" title=\'&lt;&quot;&apos;&gt;\'>')
})

test('B2: fallback bindings have their own scope and retain the attribute policy', async () => {
	expect(await render('{#each xs as x}{@const n = 1}{ n }{:else}{@const n = 2}{@const length = 3}{ n }{ length }{/each}')).toBe('23')
	await refuse('{#each xs as x}{:else}{@const n = 1}{@const n = 2}{/each}', 'G3021')
	await refuse('{#each xs as x}{:else}{@const await = 1}{/each}', 'G3007')
	await refuse('{#each xs as x}{:else}{#snippet s()}ok{/snippet}{@const s = 1}{@js}return s(){@js}{/each}', 'G3021', { allowCode: true })
	for (const strip of [false, true]) {
		await refuse('<a onclick="{#each xs as x}x{:else}y{/each}">', 'G3017', { strip })
		await refuse('{#each xs as x}{:else}<iframe srcdoc="{ v }"></iframe>{/each}', 'G3017', { strip })
		await refuse('<img srcset="{#each xs as x}{ x }{:else}/a&amp;b { v }{/each}">', 'G3015', { strip })
		const source = '<img srcset="{#each xs as x}{ x }{:else}{ list }{/each}">'
		expect(await render(source, { list: '/a 1x, /b 2x' }, { strip })).toBe('<img srcset="/a 1x, /b 2x">')
		await expect(render(source, { list: '/a 1x, //other/b 2x' }, { strip })).rejects.toThrow('G5001')
	}
})
