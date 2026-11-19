import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint, parse, locate } from '../index.js'
import { readContexts } from '../compiler/context.js'
import { stripText, textPosition } from '../compiler/text.js'
import { render } from './helpers.js'

const refuse = async (source: string, code = 'G3014', options = {}) => {
	await expect(galley(source, options), source).rejects.toThrow(code)
}

test('G-1/G-2: valid quoted angles stop; K1–K3 and malformed attributes are G3014', async () => {
	await expect(render('<a title="a < b" href="{ u }">', { u: 'javascript:x' })).rejects.toThrow('G5001')
	for (const source of ['<a/href="{ u }">', '<a title="x"/href="{ u }">', '<a title="x"href="{ u }">', '<a x"y="x">', '<a=x>', '<a =x>', '<a x=a=b>', '<a x=`v`>', '<a x=>', '<a / >', '<a\0>', '<a x\0>', '</a\0>', '</a/ >']) await refuse(source)
	for (const source of ['<a hidden href="{ u }">', '<a title=x href="{ u }">', '<a href\n=\n"{ u }">']) await expect(render(source, { u: 'javascript:x' })).rejects.toThrow('G5001')
})

test('G-8: comments and text elements do not hide the following checked URL', async () => {
	for (const prefix of ['<!-- <b x=" -->', '<script>if(a<b)t="</script>', '<style>a <b x="</style>', '<textarea>a <b x="</textarea>', '<title>a <b x="</title>']) await expect(render(`${prefix}<a title='a < b' href="{ u }">`, { u: 'javascript:x' })).rejects.toThrow('G5001')
})

test('G-5/G-15: output and snippets only stand in text or quoted values', async () => {
	for (const source of ['<a { x }>', '<a href={ x }>', '<h{ x }>x</h>', '<a data-{ x }="v">', '<a href="x"{ x }>']) await refuse(source, 'G3008')
	for (const source of ['<a {@raw x}>', '{#snippet s()}hidden{/snippet}<a hidden {@render s()}>']) await refuse(source, 'G3009')
	await refuse('<a {@js}return "x"{@js}>', 'G3009', { allowCode: true })
	for (const source of ['<{ x }>', '<{@raw x}>']) await refuse(source)
})

test('G-14: blocks preserve structure and whitespace is a forward fact', async () => {
	for (const source of ['<a data-x {#if p}title="x"{/if} ="{ u }">', '<a data-x {#if p}href{/if} ="{ u }">', '<a {#if p}hidden{/if}href="{ u }">', '<a{#if p}b{/if}>', '<a hidden {@const n = 1} ="x">', '<a hidden {#snippet s()}x{/snippet}="x">']) await refuse(source)
	for (const source of ['{#if p}<a title="x"{/if}>', '<a {#each xs as x} title="{/each}>', '<a title="{#if p}" href="{/if}">', '<a {#if p}>{:else}>{/if}']) await refuse(source, 'G3010')
	for (const p of [true, false]) {
		expect(await render('<a{#if p} title="x"{/if}{#if q} hidden{/if}>', { p, q: true })).toContain(' hidden>')
		expect(await render('<a {#if p}hidden {:else}title="x" {/if}href="/ok">', { p })).toContain('href="/ok"')
	}
	expect(await render('<a{#each xs as x} title="{ x }"{/each}>', { xs: [1, 2] })).toBe('<a title="1" title="2">')
	await refuse('<a x={@partial p.sort}>', 'G3011', { includes: { import: async () => '"v"' } })
	await refuse('{@partial p.sort}', 'G3011', { includes: { import: async () => '<a ' } })
})

test('G-17/G-22: preserving recursion is independent of call order; context-changing recursion refuses', async () => {
	const s = '{#snippet s(v)}{ v.n }{#if v.next}{@render s(v.next)}{/if}{/snippet}'
	for (const body of ['<p>{@render s(a)}</p><a href="{@render s(a)}">', '<a href="{@render s(a)}"><p>{@render s(a)}</p>']) expect(await render(s + body, { a: { n: 'x', next: { n: 'y' } } })).toContain('xy')
	for (const source of ['{#snippet s()}<svg>{@render s()}</svg>{/snippet}{@render s()}', '{#snippet s()}<a title="{@render s()}">{/snippet}{@render s()}', '{#snippet s()}<a {/snippet}{@render s()}']) await refuse(source, 'G3011')
	const quoted = '{#snippet s(v)}a &lt;b { v }{/snippet}<p title="{@render s(u)}">{@js}return ""{@js}'
	expect(await render(quoted, { u: 'x' }, { allowCode: true })).toBe('<p title="a &lt;b x">')
})

test('G-19: end tags have a literal name, whitespace and >, without attributes', async () => {
	for (const source of ['</a { u } title="><a href=\'{ v }\'>', '</a x={ u }"><a href="{ v }">', '</a { u } title="><a { v }>', '</a x>', '</a/>', '</a "x">']) await refuse(source)
	expect(await render('</A \n>')).toBe('</A \n>')
})

test('G-20/G-22: no deletion can complete a stray <; parser joins lexer and ADR-015 seams', async () => {
	for (const source of ['< <meta content="{ a }">a href="{ u }">', '<{#if p}{/if}\n<!-- c -->\na href="{ u }">', '<{#if p}meta content="{ a }"{/if}>', '<\n<!-- c -->a href="{ u }">']) await refuse(source)
	await refuse('{@partial p.sort}a href="{ u }">', 'G3014', { includes: { import: async () => '<\n<!-- c -->' } })
	expect(await render('<a<galley:config>x</galley:config> href="{ u }">', { u: '/ok' })).toBe('<a href="/ok">')
	expect(await render('<style>{ color: red }</style>')).toBe('<style>{ color: red }</style>')
	expect(parse({ id: 'join', text: 'a\\{b}c' }).children).toHaveLength(1)
})

test('rules 1/7/8: comments and declarations are whole, and text end tags cannot straddle a template tag', async () => {
	for (const source of ['a < b', '<?xml?>', '<![CDATA[x]]>', '<!foo>', 'x<!-->y', 'x<!--> -->y', 'x<!--->y', 'x<!--x--!>y', 'x<!--x', '<!DOCTYPE>', '<!DOCTYPEhtml>', '<!DOCTYPE html', '<!DOCTYPE <x>>', '<title>a</tit{ x }le></title>', '<script><!{ x }</script>', '<style>x</style x>']) await refuse(source)
	for (const source of ['x<!-- { x } -->', 'x<!-- {#if p}x{/if} -->', '<!DOCTYPE { x }>']) await refuse(source, 'G3013')
	await refuse('<script><!--<script></script>', 'G3013')
	for (const source of ['<!doctype html><p>x</p>', 'x<!---->y', 'x<!---x-->y', '<title>a<b>{ x }</title>', '<script>a<!x{ x }</script>']) expect(await render(source, { x: 'X' })).toContain('>')
	for (const source of ['<a', '<a href="', '<title>x', '<script>x']) await refuse(source, 'G3012')
	await refuse('<a x="', 'G3012')
})

test('records expose each insertion place and snippets keep their URL/metadata contracts', async () => {
	const ast = readContexts(parse({ id: 'places', text: '{ a }<title>{ b }</title><a href="{ c }" title=\'{ d }\'>' }))
	const places = ast.children.flatMap(node => node.kind === 'output' ? [node.slot?.place] : [])
	expect(places).toEqual(['text', 'text:title', 'attr:a.href', 'attr:a.title'])
	expect(await lint('{@partial p.sort}<a hidden{@partial q.sort}>')).toEqual([])
	expect(await render('<a hidden{@partial p.sort}>', {}, { includes: { import: async () => ' title="x"' } })).toBe('<a hidden title="x">')
})

test('G-12/G-21: foreign integration points admit text only and counts never underflow', async () => {
	for (const foreign of ['svg', 'math']) for (const owner of ['foreignObject', 'desc', 'title', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml', 'script', 'style', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']) {
		await refuse(`<${foreign}><${owner}><p></${foreign}></p></${owner}>`, 'G3013')
		await refuse(`<${foreign}><${owner}>{@raw v}</${owner}></${foreign}>`, 'G3013')
		await refuse(`<${foreign}><${owner}>{@js}return ""{@js}</${owner}></${foreign}>`, 'G3013', { allowCode: true })
		const source = `<${foreign}><${owner}>{ v }</${owner}></${foreign}>`
		if (owner === 'script' || owner === 'style') await refuse(source, 'G3013')
		else expect(await render(source, { v: '<c>' })).toBe(source.replace('{ v }', '&lt;c&gt;'))
	}
	for (const source of ['<svg><desc><p></svg></p></desc><style><b><a href="{ u }">', '<svg><foreignObject><div></svg></div></foreignObject><style><b>', '<math><mtext><p></math></p></mtext><style><b>']) await refuse(source, 'G3013')
	for (const source of ['<svg/><style>a<b</style>', '<math /><style>a<b</style>', '<svg><svg/></svg><style>a<b</style>', '<svg><math></math></svg></svg></math><style>a<b</style>', '</svg><style>a<b</style>', '<svg></svg ><script>if(a<b)x()</script>', '<svg><desc/><path/></svg>', '<math><mi/></math>']) expect(await render(source)).toBe(source)
	await refuse('<svg><svg></svg><style>a<b</style></svg>', 'G3013')
	await refuse('<svg><math></svg><style>a<b</style>', 'G3013')
	await refuse('<svg><desc></descx></desc></svg>', 'G3013')
	expect(await render('{#snippet s(v)}{ v }{/snippet}<svg><title>{@render s(t)}</title></svg>', { t: 'X' })).toBe('<svg><title>X</title></svg>')
})

test('G-22/G-23 rule 9: refuse text self-closing and col only while template count is positive', async () => {
	for (const source of ['<svg><title/></svg>', '<svg><style/></svg>', '<title/>', '<select>', '<frameset>', '<plaintext>', '<template><col><title></template><a href="{ u }">x</a></title>', '<template><template></template><col>', '<template>{#if p}</template>{/if}<col>']) await refuse(source, source.includes('{#if') ? 'G3010' : 'G3013')
	for (const source of ['<table><colgroup><col></colgroup></table>', '<col>', '</template><col>', '<template></template><col>']) expect(await render(source)).toBe(source)
	await refuse('<template><col/>', 'G3013')
})

test('G3015 rule 14: references before the first template tag refuse, settled prefixes keep &', async () => {
	for (const prefix of ['java&#115;', '&#0;', '&#0x6a;', 'a&amp;', '&', 'javascript:&x']) await refuse(`<a href="${prefix}{ u }">`, 'G3015')
	for (const source of ['<a href="/x?a=1&amp;b={ v }">', '<a href="https://host/?a=1&amp;b={ v }">', '<a href="#{ v }&amp;x">']) expect(await render(source, { v: 'x' })).toContain('x')
	expect(await render('<a href="&amp;static">')).toBe('<a href="&amp;static">')
})

test('URL sources: escaped &, raw/JS &, and references after a template tag have distinct admission', async () => {
	for (const u of ['&Tab;javascript:x', '<x>', '"x', "'x"]) expect(await render('<a href="{ u }">', { u })).toContain('&')
	for (const source of ['<a href="{ a }&#58;{ b }">', '<a href="{ a }&amp;{ b }">', '{#snippet s(v)}{ v }&#58;{/snippet}<a href="{@render s(a)}{ b }">']) await expect(render(source, { a: 'javascript', b: 'x' })).rejects.toThrow('G5001')
	await expect(render('<a href="{@raw a}">', { a: 'x&amp;' })).rejects.toThrow('G5001')
	await expect(render('<a href="{@js}return "x&amp;"{@js}">', {}, { allowCode: true })).rejects.toThrow('G5001')
	expect(await render('<a href="{ a }&amp;{ b }">', { a: '/x', b: 'y' })).toBe('<a href="/x&amp;y">')
	expect(await render('<a href="java{ a }script:x">', { a: '' })).toBe('<a href="javascript:x">')
	await expect(render('<a href="java{ a }script:{ b }">', { a: '', b: 'x' })).rejects.toThrow('G5001')
	await expect(render('<a href="{ a }&amp;{ b }">', { a: 'x', b: '' })).rejects.toThrow('G5001')
	for (const u of ['', null, undefined, []]) await expect(render('<a href="javascript:{ u }">', { u })).rejects.toThrow('G3015')
	expect(await render('{#snippet empty()}{/snippet}<a href="javascript:{@render empty()}">')).toBe('<a href="javascript:">')
	await expect(render('<a href="\x01 \x1fjava\tscr\nip\rt{ u }">', { u: ':x' })).rejects.toThrow('G5001')
})

test('G-16/G-18: JS-discarded data snippets keep metadata captures local', async () => {
	const source = '{#snippet s(v)}<meta content="{ v }">{/snippet}<meta content="{@js}s("x");return ""{@js}{ value }">'
	await expect(render(source, {}, { allowCode: true })).resolves.toBe('')
	await expect(render(source, { value: 'A' }, { allowCode: true })).resolves.toBe('<meta content="A">')
	await expect(render(source, {}, { allowCode: true, stripEmptyMeta: false })).resolves.toBe('<meta content="">')
})

test('G-23 self-closing template starts still count because HTML ignores their closing flag', async () => {
	for (const source of ['<template/><col><title></template><a href="{ u }">x</a></title>', '<template/><col>', '<template><template/></template><col>', '<svg><p><template/></svg><col>']) await refuse(source, 'G3013')
	for (const source of ['<template/></template><col>', '<template><template/></template></template><col>']) expect(await render(source)).toBe(source)
})

test('G-28: each entry, missing else, tag/quote identities and math count stay distinct', async () => {
	for (const source of [
		'<a {#each xs as x}ef="{ x }" hr{/each}>',
		'<a hr{#if p} {/if}ef="{ u }">',
		'<meta {#if p}><meta {/if}content="{ a }">',
		'<a href="/safe{#if p}" href="{/if}{ u }">',
		'{#if p}<math>{/if}<style><b><a href="{ u }">x</a></style>',
		'<a title=abc{#if p}{/if}>',
	]) await expect(galley(source), source).rejects.toThrow(/G301[04]/)
})

test('G-28: snippet variants retain whether URL writes are checked', async () => {
	const source = '{#snippet s(v)}{ v }{/snippet}<a href="/x/{@render s(u)}">a</a><a href="{@render s(u)}">b</a>'
	await expect(render(source, { u: 'javascript:x' })).rejects.toThrow('G5001')
})

test('G-28: strip removes trailing static spaces only from the final root text', async () => {
	expect(await render('{#if p}<b>  {/if}', { p: true }, { strip: true })).toBe('<b>  ')
	expect(await render('{@partial p.sort}', {}, { strip: true, includes: { import: async () => '<b>  ' } })).toBe('<b>  ')
	expect(await render('<b>  ', {}, { strip: true })).toBe('<b>')
})

test('G-30: refusals locate the offending character and bound their excerpts', async () => {
	const cases: [string, string, object][] = [
		['hello\n'.repeat(6000) + '<p>a < b</p>', '< b', {}],
		['a'.repeat(6000) + '< b', '< b', {}],
		['header\n<p>a < b</p>' + 'x'.repeat(40000), '< b', {}],
		['a\n<a href="some&amp;{ u }">', '&', {}],
		['<a href="some<galley:config>{}</galley:config>&{ u }">', '&', {}],
		['<a href="some\n&{ u }">', '&', { strip: true }],
		['a<galley:config>{}</galley:config> < b', '< b', {}],
		['a\n<!-- gone -->\n < b', '< b', {}],
		['a\\{literal}\n < b', '< b', {}],
		['a\n   < b', '< b', { strip: true }],
		['a<galley:config>{}</galley:config>  \n < b', '< b', { strip: true }],
		['<a x="x"href="x">', 'href', {}],
		['<a x="a" bad"name="x">', 'bad', {}],
		['<a x=a=b>', 'a=b', {}],
		['<a></a x>', '</a', {}],
		['<script>x<!--</script>', '<!--', {}],
		['<title>x</ti{ x }tle>', '</ti', {}],
		['{#if p}<a href={/if}', '=', {}],
	]
	for (const [source, offending, options] of cases) {
		try { await galley(source, options); throw new Error('Expected refusal') }
		catch (error) {
			expect(error).toBeInstanceOf(GalleyDiagnosticError)
			const diagnostic = (error as GalleyDiagnosticError).diagnostic
			expect(locate(diagnostic.span.source, diagnostic.span.start)).toEqual(locate({ id: '', text: source }, source.indexOf(offending)))
			expect((error as Error).message.length).toBeLessThan(650)
		}
	}
	await expect(galley('a\n{@partial p.sort}', { includes: { import: async () => 'ok\n < b' } })).rejects.toThrow('./p.sort:2:2')
})

test('G-30: context mismatches name every foreign and template count', async () => {
	for (const tag of ['svg', 'math', 'template']) {
		await expect(galley(`{#if p}<${tag}>{/if}`)).rejects.toThrow(`${tag}=1`)
	}
})


test('G-30: source tracking preserves the order of static strip transformations', async () => {
	expect(await render('a \n \t<b> \n \t', {}, { strip: true })).toBe('a<b>')
	expect(await render('{#if p}a \n \t<b> \n \t{/if}', { p: true }, { strip: true })).toBe('a<b>  \t')
	await expect(galley('<a href="' + 'a'.repeat(5000) + '&{ u }">')).rejects.toThrow('G3015')
})

test('G-30: the end of joined and stripped text retains its source boundary', () => {
	const source = { id: 'mapped-end', text: 'a\n<galley:config>{}</galley:config>b' }
	const node = parse(source).children[0]!
	if (node.kind !== 'text') throw new Error('Expected one joined text node')
	for (const text of [node, stripText(node, true)]) {
		expect(textPosition(text, text.value.length)).toEqual({ source, start: source.text.length, end: source.text.length })
		expect(textPosition(text, text.value.length - 1).start).toBe(source.text.length - 1)
	}
})

test('G-31: a static snippet creates no URL checkpoint; dynamic and nested suffixes do', async () => {
	for (const body of ['x&amp;y', 'ftp://x', '{ value }x&amp;y']) {
		const source = `{#snippet q()}${body}{/snippet}{#snippet outer()}{@render q()}{/snippet}<a href="{@render outer()}">x</a>`
		expect(await render(source)).toBe('<a href="' + body.replace('{ value }', '') + '">x</a>')
	}
	const source = '{#snippet q(v)}{ v }script:x{/snippet}<a href="{@render q(u)}">'
	await expect(render(source, { u: 'java' })).rejects.toThrow('G5001')
})

test('G-31: reader folds only ASCII names and cut foreign end tags give rule 8', async () => {
	const source = 'a <lin\u212A href="{ a }">b'
	expect(await render(source)).toBe('a <lin\u212A href="">b')
	await refuse('<svg><title>a</ti{ x }tle></svg>', 'G3014')
	await refuse('<svg><TITLE>a</TI{ x }TLE></svg>', 'G3014')
})

test('G-31: forbidden static URL starts fail at compile with specific help', async () => {
	for (const source of ['<script src="//cdn.example.org/{ file }"></script>', '<img src="data:image/png;base64,{ b }">', '<a href="javascript:{ u }">', '<a href="javascript:&amp;{ u }">']) {
		try { await galley(source); throw new Error('Expected compile refusal') }
		catch (error) {
			expect(error).toBeInstanceOf(GalleyDiagnosticError)
			const diagnostic = (error as GalleyDiagnosticError).diagnostic
			expect(diagnostic.code).toBe('G3015')
			expect(diagnostic.help).toContain('relative URL')
			expect(diagnostic.help).not.toContain('reference')
		}
	}
	expect(await render('<a href="ftp://static">')).toBe('<a href="ftp://static">')
})

test('G-31: G5001 names only the reason that applies', async () => {
	await expect(render('<a href="{ u }">', { u: 'ftp://x' })).rejects.toThrow('relative one')
	await expect(render('<a href="{ u }">', { u: 'ftp://x' })).rejects.not.toThrow('undecided')
	await expect(render('<a href="{ a }&amp;{ b }">', { a: 'x', b: 'y' })).rejects.toThrow('& before a settled prefix is undecided')
	await expect(render('<a href="{ a }&amp;{ b }">', { a: 'x', b: 'y' })).rejects.not.toThrow('relative one')
})

test('G-25: spaced partial directives give G4002 before expansion or strip', async () => {
	let loaded = false
	const includes = { import: async () => { loaded = true; return 'LOADED' } }
	for (const strip of [true, false]) {
		await refuse('a{@ partial p.sort}b', 'G4002', { strip, includes })
		await refuse('{@\tpartial p.sort}', 'G4002', { strip, includes })
	}
	expect(loaded).toBe(false)
	expect(await render('a{@partial p.sort}b', {}, { includes })).toBe('aLOADEDb')
})

test('G-26: lint resolves partials before the same context and strip checks as galley', async () => {
	for (const strip of [false, true]) {
		const options = { strip, includes: { import: async () => ' title="x" ' } }
		const source = '<a hidden{@partial p.sort}href="/ok">'
		expect(await lint(source, options)).toEqual([])
		await expect(galley(source, options)).resolves.toBeDefined()
	}
	const options = { includes: { import: async () => '<a href="' } }
	expect((await lint('{@partial p.sort}', options)).map(item => item.code)).toEqual(['G3011'])
	await refuse('{@partial p.sort}', 'G3011', options)
	expect((await lint('{@partial p.sort}', { includes: { import: async () => '{@js}return 1{@js}' } })).map(item => item.code)).toEqual(['G3004'])
	expect((await lint('{@partial p.sort}', { includes: { import: async () => '{:else}' } })).map(item => item.code)).toEqual(['G2002'])
	await expect(lint('{@partial p.sort}', { includes: { import: async () => { throw new Error('resolver failed') } } })).rejects.toThrow('resolver failed')
	expect(await lint('{:else}', { includes: { import: async () => '' } })).toHaveLength(1)
})

test('G-27: JS specialises only lexically visible snippets, including ancestor and shadowed names', async () => {
	for (const body of [
		'{#if false}{#snippet s()}a < b{/snippet}{/if}',
		'{#each xs as x}{#snippet s()}a < b{/snippet}{/each}',
		'{#snippet outer()}{#snippet s()}a < b{/snippet}{/snippet}',
	]) expect(await render(body + '{@js}return 1{@js}', {}, { allowCode: true })).toBe('1')
	const shadowed = '{#snippet s()}a < b{/snippet}{#if p}{#snippet s()}OK{/snippet}{@js}return s(){@js}{/if}'
	expect(await render(shadowed, { p: true }, { allowCode: true })).toBe('OK')
	const ancestor = '{#snippet s()}OK{/snippet}{#if p}{@js}return s(){@js}{/if}'
	expect(await render(ancestor, { p: true }, { allowCode: true })).toBe('OK')
	await refuse('<p title="{#snippet s(v)}a < b { v }{/snippet}{@render s(u)}"></p>{@js}return s("x"){@js}', 'G3014', { allowCode: true })
})

test('G-27: config removal precedes standalone comment recognition on its line', async () => {
	expect(await render('  <galley:config>{}</galley:config><!-- comment -->')).toBe('')
	expect(await render('before\r\n  <galley:config>{}</galley:config><!-- comment -->')).toBe('before')
	for (const comment of ['<!-- comment -->', '<!-- {#if p}x{/if} -->']) {
		expect(await render('<galley:config>{}</galley:config>' + comment + '\nafter')).toBe('after')
		expect(await render('before\n<galley:config>{}</galley:config>' + comment)).toBe('before')
		expect(await render('inline<galley:config>{}</galley:config><!-- comment -->')).toBe('inline<!-- comment -->')
	}
})

test('G-27: comment and DOCTYPE codes depend on actual template tags, not source length', async () => {
	for (const start of ['x<!-- unclosed', '<!DOCTYPE html']) {
		await refuse(start, 'G3014')
		await refuse(start + '<galley:config>{}</galley:config>', 'G3014')
		await refuse(start + '{ x }', 'G3013')
		await refuse('{#if p}' + start + '{/if}', 'G3013')
		await refuse('{@partial p.sort}', 'G3014', { includes: { import: async () => start } })
	}
})

test('G-27: render, blocks and partials immediately after = have their own diagnostics', async () => {
	await refuse('{#snippet s()}{/snippet}<a x={@render s()}>', 'G3009')
	await refuse('<a x={#if p}"v"{/if}>', 'G3010')
	await refuse('<a x={#each xs as x}"v"{/each}>', 'G3010')
	await refuse('<a x={@partial p.sort}>', 'G3011', { includes: { import: async () => '"v"' } })
})

test('G-27: empty metadata removes only preceding static whitespace', async () => {
	for (const tag of ['meta content', 'link href']) {
		const [name, attribute] = tag.split(' ')
		expect(await render(`{ x } \t<${name} ${attribute}="{ a }">\n`, { x: 'keep  ', a: '' })).toBe('keep  ')
		expect(await render(`before \t<${name} ${attribute}="{ a }">\nafter`)).toBe('beforeafter')
	}
})

test('G-24: SVG animation values refuse every template-tag kind in any namespace', async () => {
	for (const source of [
		'<svg><a><set attributeName="href" to="{ u }"/><rect width="9" height="9"/></a></svg>',
		'<svg><a><animate attributeName="href" values="{ u }"/><rect width="9" height="9"/></a></svg>',
	]) await refuse(source, 'G3016')
	for (const tag of ['set', 'animate', 'animateMotion', 'animateTransform']) {
		for (const attribute of ['to', 'from', 'by', 'values']) {
			for (const prefix of ['', '<svg>', '<math>']) {
				const suffix = prefix ? prefix.replace('<', '</') : ''
				await refuse(`${prefix}<${tag} attributeName="fill" ${attribute}="{ u }"/>${suffix}`, 'G3016')
				await refuse(`${prefix}<${tag.toUpperCase()} ${attribute.toUpperCase()}='{ u }'/>${suffix}`, 'G3016')
			}
		}
	}
	for (const value of ['{ x }', '{@raw x}', '{#if p}x{:else}y{/if}', '{#each xs as x}x{/each}', '{@render s()}', '{@partial p.sort}', '{@js}return "x"{@js}', '{@const x = 1}', '{#snippet unused()}x{/snippet}']) {
		await refuse(`{#snippet s()}x{/snippet}<svg><set to="${value}"/></svg>`, 'G3016', { allowCode: true, includes: { import: async () => 'x' } })
	}
	await refuse('<set to={ x }>', 'G3016')
	await refuse('<set {#if p}to="x{/if}">', 'G3016')
})

test('G-24: animation attributes supplied by snippets and partials also refuse', async () => {
	await refuse('{#snippet attrs()} to="{ u }"{/snippet}<svg><set {@render attrs()}/></svg>', 'G3016')
	await refuse('<svg><animate {@partial attrs.sort}/></svg>', 'G3016', { includes: { import: async () => ' values="{ u }"' } })
	await refuse('{#snippet value()}{ u }{/snippet}<animate to="{@render value()}">', 'G3016')
	// The existing no-attribute-writing-snippets contract remains in force for static attribute snippets.
	await refuse('{#snippet attrs()} to="x"{/snippet}<set {@render attrs()}>', 'G3009')
})

test('G-24: static animation values and ordinary dynamic attributes still compile', async () => {
	for (const tag of ['set', 'animate', 'animateMotion', 'animateTransform']) {
		const source = `<svg><${tag} attributeName="href" to="/safe" from="/old" by="1" values="/a;/b" dur="{ time }"/></svg>`
		expect(await render(source, { time: 2 })).toBe(source.replace('{ time }', '2'))
	}
	expect(await render('<set {#if p}to="x"{/if}>', { p: true })).toBe('<set to="x">')
	expect(await render('<svg><set {@partial attrs.sort}/></svg>', {}, { includes: { import: async () => ' to="x"' } })).toBe('<svg><set  to="x"/></svg>')
})


test('G-32: every review bypass keeps its refusal or URL checkpoint', async () => {
	const cases: [string, string][] = [
		['<title>a</title/><a href="{ u }">x</a></title>', 'G3014'],
		['<title>a</title\f><a href="{ u }">x</a></title>', 'G5001'],
		['<title>{#if p}</title><textarea>{/if}</textarea><a href="{ u }">x</a></title>', 'G3010'],
		['{#snippet s(u)}<style><b><a href="{ u }">x</a></style>{/snippet}{@render s(a)}<math>{@render s(u)}</math>', 'G3013'],
		['{#snippet s(u)}<col><title></template><a href="{ u }">x</a></title>{/snippet}<table>{@render s(a)}</table><template>{@render s(u)}', 'G3013'],
	]
	for (const [source, code] of cases) await expect(render(source, { u: 'javascript:x', a: '/ok', p: true })).rejects.toThrow(code)
})
