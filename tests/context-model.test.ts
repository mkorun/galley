import { expect, test, spyOn } from 'bun:test'
import galley, { GalleyDiagnosticError, lint, parse } from '../index.js'
import { readContexts } from '../compiler/context.js'
import { generate } from '../compiler/codegen.js'
import { UrlPrefix } from '../compiler/url.js'
import util from '../util.js'
import { render, countUrlReads } from './helpers.js'

const stop = async (template: string, data: object, attribute = 'href', prefix?: string) => {
	const compiled = await galley(template)
	expect(() => compiled.render(data)).toThrow(prefix === undefined ? new RegExp(`^G5001: ${attribute}=`) : `G5001: ${attribute}=${JSON.stringify(prefix)} is no URL`)
}
const refuse = async (source: string, code: string) => {
	try { await galley(source); throw new Error('expected refusal') }
	catch (error) {
		expect(error).toBeInstanceOf(GalleyDiagnosticError)
		const diagnostic = (error as GalleyDiagnosticError).diagnostic
		expect(diagnostic.code).toBe(code)
		expect(diagnostic.help).toBeTruthy()
		expect(diagnostic.message).toContain('HTML context')
		expect(diagnostic.span.source.text).toBe(source)
	}
}

test('G-1/G-2 appendix near-miss branches both retain their contributions', async () => {
	const source = '<a {#if active}title="a < b"{:else}title="x"{/if} href="{ a }{ b }">'
	for (const active of [true, false]) {
		await stop(source, { active, a: 'java', b: 'script:x' }, 'href', 'javascript:x')
		expect(await render(source, { active, a: '/tags/', b: 'javascript:x' })).toContain('/tags/javascript:x')
	}
})

test('seven URL attributes, both quotes, safe schemes and all four slash pairs', async () => {
	for (const attribute of ['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href']) for (const quote of ['"', "'"]) {
		const source = `<a ${attribute}=${quote}{ u }${quote}>`
		for (const u of ['javascript:x', 'ftp://base.example/x', '//', '\\\\', '/\\', '\\/']) await stop(source, { u }, attribute, u)
		for (const u of ['http:x', 'https://other.example/x', 'MAILTO:x', 'tel:1', '/tags/javascript:x', 'a+b.c-d', '1:x', './x', '\u00a0javascript:x', '\ufeffjavascript:x', '\x7fjavascript:x']) expect(await render(source, { u })).toBe(source.replace('{ u }', u))
	}
})

test('G-3 linear work through 16,000 parts and long scheme candidates', async () => {
	for (const length of [0, 1, 8, 64, 500, 1000, 2000, 4000, 8000, 16000]) {
		const url = new UrlPrefix('href'), reads = countUrlReads(url)
		for (let index = 0; index < length; index++) { url.feed('a'); url.check(true) }
		expect(reads.mock.calls.length).toBe(length)
		url.feed(':x')
		if (length) expect(() => url.check(true)).toThrow('G5001')
		else url.check(true)
		expect(reads.mock.calls.length).toBeLessThanOrEqual(length + 2)
		const source = '<a href="{#each parts as p}{ p }{/each}">x</a>'
		expect(await render(source, { parts: Array(length).fill('a') })).toBe('<a href="' + 'a'.repeat(length) + '">x</a>')
		if (length) await stop(source, { parts: [...Array(length).fill('a'), ':x'] })
	}
	const candidate = 'a'.repeat(100000)
	await stop('<a href="{ a }{ b }">', { a: candidate, b: ':' })
	const numeric = new UrlPrefix('src'), reads = countUrlReads(numeric)
	numeric.feed('&#' + '0'.repeat(100000) + '106;'); expect(() => numeric.check(true)).toThrow('G5001')
	numeric.feed('avascript:'); expect(() => numeric.check(true)).toThrow('G5001')
	expect(reads.mock.calls.length).toBe(0)
}, 30000)

test('G-4 raw references and raw quote breakout stays outside the boundary', async () => {
	for (const u of ['&#6s:', '&#106;avascript:alert(1)', '&#x5c/p', '&#x2f\\']) await stop('<a href="{@raw u}">x</a>', { u })
	expect(await render('<a href="{@raw u}">', { u: '" title="outside' })).toBe('<a href="" title="outside">')
	expect(await render('{@raw open}href="{ u }">', { open: '<a ', u: 'javascript:x' })).toBe('<a href="javascript:x">')
})

test('G-6 shared conversion for filters and outputs, with debug warnings and restoration', async () => {
	const values = [{ toString() { throw new Error('no') } }, { toString() { return {} }, valueOf() { return {} } }, Object.create(null)]
	const warning = spyOn(console, 'warn').mockImplementation(() => {})
	try {
		for (const value of values) for (const filter of ['', '|join', '|number']) {
			expect(await render(`<p>{ value ${filter}}</p>`, { value }, { debug: true })).toBe('<p>[object Object]</p>')
		}
		expect(warning).toHaveBeenCalledTimes(9)
		expect(await render('{ value | join }', { value: [values[0], null] })).toBe('[object Object], ')
		const compiled = await galley('{ x | explode }', { debug: true, filters: { explode() { throw new Error('filter error') } } })
		expect(() => compiled.render({})).toThrow('filter error')
		expect(await render('{ value | number }', { value: values[0] })).toBe('[object Object]')
		expect(warning).toHaveBeenCalledTimes(9)
	} finally { warning.mockRestore() }
})

test('G-7 five static reference prefixes', async () => {
	for (const [prefix, u] of [['java&#115;', 'cript:x'], ['&#106;', 'avascript:x'], ['java&Tab;', 'script:x'], ['&#x2f;', '/evil.example'], ['java&#58;', 'x']]) await refuse(`<a href="${prefix}{ u }">x</a>`, 'G3015')
})

test('G-9 literal NUL and numeric-zero replacement', async () => {
	for (const u of ['\0javascript:x', '\0//x']) expect(await render('<a href="{ u }">', { u })).toBe(`<a href="${u}">`)
	for (const prefix of ['&#0;', '&#x0;', '&#55296;', '&#x110000;', '&#999999999999999999999;', '&#128;', '&#13;', '&#9;']) await refuse(`<a href="${prefix}{ u }">`, 'G3015')
})

test('G-10 complete snippet results have a caller checkpoint, including nested calls', async () => {
	for (const [tail, u] of [['script:x', 'java'], ['/', '/']]) {
		for (const nested of [false, true]) {
			const source = `{#snippet s(v)}{ v }${tail}{/snippet}${nested ? '{#snippet outer(v)}{@render s(v)}{/snippet}' : ''}<a href="{@render ${nested ? 'outer' : 's'}(u)}">`
			await stop(source, { u })
		}
	}
	// A duplicated sink feed turns the single slash into a forbidden pair.
	expect(await render('{#snippet s(v)}{ v }{/snippet}<a href="{@render s(u)}">', { u: '/' })).toBe('<a href="/">')
	await refuse('{#snippet attrs(v)}href="{ v }"{/snippet}<a {@render attrs(u)}>', 'G3009')
})

test('G-11 quoted-context snippet and exact double-escaped script fixture', async () => {
	expect(await render('{#snippet s(v)}a <b { v }{/snippet}<p title="{@render s(u)}">', { u: 'x' })).toBe('<p title="a <b x">')
	const script = '<script><!--<script>\n// </script>\n// <a { u }>\n</script>\n'
	await refuse(script, 'G3013')
	expect(await render('<p title="<a href=\'{ u }\'>">', { u: 'javascript:x' })).toBe('<p title="<a href=\'javascript:x\'>">')
	await refuse('</a title=">" { e }>', 'G3014')
})

test('recursion, specialization, lexical bindings and JS retain their names and isolated buffers', async () => {
	const source = '{#snippet s(v)}{#if v}{ v }{@render s(false)}{/if}{/snippet}<p>{@render s(u)}</p><a href="{@render s(u)}">'
	expect(await render(source, { u: '/ok' })).toBe('<p>/ok</p><a href="/ok">')
	await stop(source, { u: 'javascript:x' })
	const js = '{#snippet s(v)}{ v }{/snippet}<a href="{@js}return s("/ok"){@js}">'
	expect(await render(js, {}, { allowCode: true })).toBe('<a href="/ok">')
	const isolation = '{#snippet s(v)}{ v }script:x{/snippet}<a href="{@js}return s("java"){@js}">'
	await expect(render(isolation, {}, { allowCode: true })).rejects.toThrow(/^G5001: href="javascript:x"/)
	const both = '{#snippet s(v)}{ v }{/snippet}<p>{@render s(u)}</p>{@js}return s("x"){@js}'
	expect(await render(both, { u: 'v' }, { allowCode: true })).toBe('<p>v</p>x')
	await expect(render('<a href="{@js}return "javascript:x"{@js}">', {}, { allowCode: true })).rejects.toThrow('G5001')
})

test('real metadata boundaries: inert contexts, quoted angles, branches, snippets, partials and markers', async () => {
	for (const tag of ['meta content', 'link href']) {
		const [name, attribute] = tag.split(' ')
		const source = `<${name} title="a < b > c" ${attribute}="{#if yes}{ a }{:else}{ b }{/if}">`
		expect(await render(source, { yes: true })).toBe('')
		expect(await render(source, { yes: false, b: 'x' })).toContain('="x"')
		expect(await render(source, {})).toBe('')
		expect(await render(source, {}, { stripEmptyMeta: false })).toContain(`${attribute}=""`)
		const snippet = `{#snippet s(v)}{ v }{/snippet}<${name} ${attribute}="{@render s(a)}">`
		expect(await render(snippet)).toBe('')
		expect(await render(snippet, { a: 'x' })).toBe(`<${name} ${attribute}="x">`)
		expect(await render(`<${name} ${attribute}="{@partial value.sort}">`, {}, { includes: { import: async () => '{ a }' } })).toBe('')
	}
	for (const owner of ['title', 'textarea', 'script', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']) {
		const source = `<${owner}><meta content="{ a }"></${owner}>`
		if (owner === 'script' || owner === 'style') {
			await expect(galley(source)).rejects.toThrow('G3018')
			expect(await render(source.replace('{ a }', '{@raw a}'))).toBe(source.replace('{ a }', ''))
		} else expect(await render(source)).toBe(source.replace('{ a }', ''))
	}
	expect(await render('<div title="<meta content=\'{ a }\'>">')).toBe('<div title="<meta content=\'\'>">')
	expect(await render('<meta content="{#if yes}{ a }{/if}">')).toBe('<meta content="">')
	expect(await render('A\n \t<META content="{ a }">\r\nB')).toBe('A\nB')
	expect(await render('{#snippet m()}<meta content="{ a }">{/snippet}{@render m()}')).toBe('')
	const marks = '\ue000galley-meta\ue001\ue002galley-meta\ue003'
	expect(await render('<p>{@raw a}</p><meta content="{ b }">', { a: marks })).toBe(`<p>${marks}</p>`)
})

test('compiler boundary diagnostics and independent existing helper branches', async () => {
	expect((await lint('{:else}'))[0]?.code).toBe('G2002')
	expect((await lint('{@unknown x}'))[0]?.code).toBe('G2100')
	expect((await lint('{#unknown x}'))[0]?.code).toBe('G2200')
	expect((await lint('{#snippet s()}A{/snippet}{#snippet s()}B{/snippet}')).map(item => item.code)).toContain('G3003')
	await expect(lint({ indexOf() { throw new Error('host failure') } } as any)).rejects.toThrow('host failure')
	const unresolved = parse({ id: 'unresolved', text: '{@render missing()}' })
	expect(() => readContexts(unresolved)).toThrow('Unresolved checked snippet')
	expect(await render('<a {#if p}{@const n = 1}{#snippet unused()}x{/snippet}hidden{/if} >', { p: true })).toBe('<a hidden >')
	expect(await render('{ v | upper }', { v: 'x' })).toBe('X')
	expect(util.round(1.234, 2)).toBe(1.23); expect(util.round('x' as any)).toBe('x')
	expect(util.first([1])).toBe(1); expect(util.first(1 as any)).toBeUndefined()
	expect(util.last([1])).toBe(1); expect(util.last(1 as any)).toBeUndefined()
	expect(util.length(null as any)).toBe(0)
	await refuse('<p>a < b { u }</p>', 'G3014')
	await refuse('</ <a>', 'G3014')
	expect(await render('x<!---x-->y')).toBe('x<!---x-->y')
	expect((await lint('{@const x = a | upper( )}'))[0]?.code).toBe('G2108')
	await expect(galley('{#if yes}{@partial p.sort}{/if}', { includes: { import: async () => 'x' } })).resolves.toBeDefined()
	expect(() => generate(parse({ id: 'partial', text: '{@partial p.sort}' }))).toThrow('G4002')
	const ast = parse({ id: 'direct', text: 'text' })
	expect(generate(ast).body).toContain('text')
})


test('DOCTYPE abrupt greater-than follows the browser; partial declarations retain lexical scope', async () => {
	await stop('<!DOCTYPE html PUBLIC "a > <a href="{ u }">', { u: 'javascript:x' })
	const includes = { import: async () => '{#snippet s(v)}<b>{ v }</b>{/snippet}' }
	expect(await render('{@partial s.sort}{@render s(u)}', { u: 'x' }, { includes })).toBe('<b>x</b>')
	expect(await render('{@render s(u)}{@partial s.sort}', { u: 'x' }, { includes })).toBe('<b>x</b>')
	await expect(galley('{#snippet s()}A{/snippet}{@partial s.sort}', { includes })).rejects.toThrow('G3003')
})


test('metadata duplicate and boolean targets follow the first actual attribute', async () => {
	for (const source of ['<meta content="static" content="{ a }">', '<meta content=x content="{ a }">', '<meta content content="{ a }">']) expect(await render(source)).toBe(source.replace('{ a }', ''))
	expect(await render('<meta content="{ a }" content="static">')).toBe('')
	expect(await render('<meta {#if p}content="static"{/if} content="{ a }">', { p: true })).toBe('<meta content="static" content="">')
	expect(await render('<meta {#if p}content="static"{/if} content="{ a }">', { p: false })).toBe('')
})


test('complete attributes immediately after literal tag names remain compatible', async () => {
	for (const p of [true, false]) {
		expect(await render('<script{#if p} async{/if}>x</script>', { p })).toBe(p ? '<script async>x</script>' : '<script>x</script>')
		expect(await render('<a{#if p} title="x"{/if}>', { p })).toBe(p ? '<a title="x">' : '<a>')
	}
	await refuse('{#snippet attrs()} title="x"{/snippet}<a{@render attrs()}>', 'G3009')
	await refuse('<a{#if p}b{/if}>', 'G3014')
})


test('JS-discarded snippet output cannot mutate its caller URL sink', async () => {
	const source = '{#snippet s(v)}{ v }{/snippet}<a href="java{@js}s("script:x");return ""{@js}{ u }">'
	expect(await render(source, { u: 'x' }, { allowCode: true })).toBe('<a href="javax">')
})


test('supplied template scan: every recorded complete shape still compiles', async () => {
	const sources = await Bun.file(new URL('./template-scan.json', import.meta.url)).json() as string[]
	expect(sources.length).toBe(52)
	for (const source of sources) await expect(galley(source)).resolves.toBeDefined()
})


test('JS name aliases retain a cached text specialization at template end', async () => {
	const source = '{@js}return s("x"){@js}{#snippet s(v)}{ v }{/snippet}{@render s(u)}'
	expect(await render(source, { u: 'V' }, { allowCode: true })).toBe('xV')
})


test('comment stripping uses original source lines across output and block boundaries', async () => {
	for (const source of ['{ u }<!-- inline -->', '<!-- inline -->{ u }', '{#if yes}<!-- inline -->{/if}']) {
		expect(await render(source, { u: 'X', yes: true })).toBe(source.startsWith('{#if') ? '<!-- inline -->' : source.replace('{ u }', 'X'))
	}
	expect(await render('{#if yes}\n<!-- standalone -->\n{/if}after', { yes: true })).toBe('after')
	expect(await render('{ u }\n<!-- standalone -->\nafter', { u: 'X' })).toBe('X\nafter')
})
