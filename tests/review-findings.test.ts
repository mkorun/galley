// One test per finding of the review of the context model (P1 1 to P3 12, G-12 to G-18). Each holds the review's reproductions.
import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index.js'
import { render } from './helpers.js'

const stop = async (template: string, data: object, prefix: string, options: Parameters<typeof galley>[1] = {}) => {
	const compiled = await galley(template, options)
	let message = 'rendered'
	try { await compiled.render(data) }
	catch (error) { message = (error as Error).message }
	expect(message).toStartWith(`G5001: href=${JSON.stringify(prefix)} is no URL`)
}
const refuse = async (source: string, code: string, options: Parameters<typeof galley>[1] = {}): Promise<string> => {
	let failure: unknown
	try { await galley(source, options) }
	catch (error) { failure = error }
	expect(failure).toBeInstanceOf(GalleyDiagnosticError)
	const diagnostic = (failure as GalleyDiagnosticError).diagnostic
	expect(diagnostic.code).toBe(code)
	return diagnostic.help ?? ''
}

test('G-13/G-17: static references, including decimal x, are G3015; raw references stop undecided', async () => {
	for (const prefix of ['javascript&#58', '/&#47', 'http&#9x:', '&#9x:', '&#x6A;', '&#X6a', '&#0x6a;', '&#49x:']) await refuse(`<a href="${prefix}{ u }">`, 'G3015')
	for (const u of ['javascript&#58x1=1,alert(1)', '/&#47xa.evil.example/p', '&#10x6a;avascript:x']) await stop('<a href="{@raw u}">', { u }, u)
	await stop('<a href="{@raw a}{@raw b}">', { a: 'javascript&#5', b: '8x1' }, 'javascript&#5')
})

test('P2 5 (G-17): conditional attributes in a row, and on lines of their own, compile as on main', async () => {
	const item = { unpublished: true, isCurrent: true }
	expect(await render('<a href="/x"{#if item.unpublished} data-link-unpublished{/if}{#if item.isCurrent} class="series-current" aria-current="true"{/if}>', { item }))
		.toBe('<a href="/x" data-link-unpublished class="series-current" aria-current="true">')
	const two = '<a{#if a} aria-current="page"{/if}{#if b} data-link-unpublished{/if}>'
	expect(await render(two, { a: true, b: true })).toBe('<a aria-current="page" data-link-unpublished>')
	expect(await render(two, { a: false, b: true })).toBe('<a data-link-unpublished>')
	expect(await render(two, { a: true, b: false })).toBe('<a aria-current="page">')
	expect(await render(two, {})).toBe('<a>')
	const lines = '<a href="/x"\n\t{#if a}\n\taria-current="page"\n\t{/if}\n\t{#if b}\n\tdata-link-unpublished\n\t{/if}\n>'
	expect(await render(lines, { a: true, b: true })).toBe('<a href="/x"\n\taria-current="page"\n\tdata-link-unpublished\n>')
	expect(await render(lines, { a: false, b: true })).toBe('<a href="/x"\n\tdata-link-unpublished\n>')
	expect(await render('<body{#if dark} data-color-toggle{/if}{#if scheme} data-color-scheme="{ scheme }"{/if}\n>', { dark: true, scheme: 'dark' })).toBe('<body data-color-toggle data-color-scheme="dark"\n>')
	expect(await render('<img{#if ai} data-ai-generated{/if}/>', { ai: true })).toBe('<img data-ai-generated/>')
})

test('P1 4 (G-16): {@js} calls the variant of a snippet for ordinary content, whatever was rendered first', async () => {
	const data = { a: 'ok', b: '/ok', u: 'javascript:alert(1)' }
	await stop('{#snippet s(u)}<a href="{ u }">link</a>{/snippet}<title>{@render s(a)}</title>{@js}return s($.u){@js}{@render s(b)}', data, 'javascript:alert(1)', { allowCode: true })
	// The other way round: a snippet first rendered into href is plain text when {@js} calls it.
	expect(await render('{#snippet s(u)}{ u }{/snippet}<a href="{@render s(a)}">x</a>{@js}return s($.u){@js}', data, { allowCode: true })).toBe('<a href="ok">x</a>javascript:alert(1)')
	// A snippet in a partial and a snippet inside a snippet have their own.
	const includes = { import: async () => '{#snippet s(u)}<a href="{ u }">p</a>{/snippet}' }
	await stop('<title>{@render s(a)}</title>{@partial s.sort}{@js}return s($.u){@js}', data, 'javascript:alert(1)', { allowCode: true, includes })
	await stop('{#snippet outer(u)}{#snippet s(u)}<a href="{ u }">i</a>{/snippet}<title>{@render s(u)}</title>{@js}return s($.u){@js}{/snippet}{@render outer(a)}', data, 'javascript:alert(1)', { allowCode: true })
})

test('P3 9 (G-18): a boolean content or href that ends at a block boundary is the first target of stripEmptyMeta', async () => {
	expect(await render('<meta content content="{ a }">', { a: '' })).toBe('<meta content content="">')
	expect(await render('<meta {#if p}content{/if} content="{ a }">', { p: true, a: '' })).toBe('<meta content content="">')
	expect(await render('<meta {#if p}content{/if} content="{ a }">', { p: false, a: '' })).toBe('')
	expect(await render('<link {#if p}href {/if} href="{ a }">', { p: true, a: '' })).toBe('<link href  href="">')
	expect(await render('<meta {@partial p.sort} content="{ a }">', { a: '' }, { includes: { import: async () => 'content' } })).toBe('<meta content content="">')
	expect(await render('<meta content{#if p} name="x"{/if} content="{ a }">', { a: '' })).toBe('<meta content content="">')
	expect(await render('<meta{#if p} name="x"{/if} content="{ a }">\nnext', { p: true, a: '' })).toBe('next')
	expect(await render('<meta{#if p} name="x"{/if} content="{ a }">\nnext', { p: true, a: 'v' })).toBe('<meta name="x" content="v">\nnext')
	expect(await render('<meta {#if p}content{/if} content="{ a }">', { p: true, a: '' }, { stripEmptyMeta: false })).toBe('<meta content content="">')
})

test('P3 10 (G-18): standalone comments go as on main, across text nodes, after <meta> and at the end', async () => {
	// The review expected "hello" here; main prints "hello\n", and so does this.
	expect(await render('hello\n<!-- first -->\n<!-- second -->')).toBe('hello\n')
	expect(await render('<meta name="x">\n<!-- comment -->')).toBe('<meta name="x">')
	expect(await render('  <!-- { a + b } -->\nafter')).toBe('after')
	expect(await render('  <!-- \\{ -->\nafter')).toBe('after')
	expect(await render('<meta content="{ a }">\n<!-- comment -->\nnext', { a: '' })).toBe('next')
	expect(await render('<meta content="{ a }">\n<!-- comment -->', { a: 'v' })).toBe('<meta content="v">')
	// Metadata and URL records are made at the positions in the resulting text.
	expect(await render('x\n<!-- c -->\n  <meta content="{ a }">\nnext', { a: '' })).toBe('x\nnext')
	expect(await render('x\n<!-- c -->\n<meta content="{ a }">\n<!-- d -->\n<a href="java{ u }">', { a: 'v', u: '' })).toBe('x\n<meta content="v">\n<a href="java">')
	await stop('x\n<!-- c -->\n<a href="java{ u }">', { u: 'script:x' }, 'javascript:x')
	expect(await render('a\r\n\t<!-- c -->  \r\nb')).toBe('a\r\nb')
	expect(await render('a\n<!-- one\n  two -->\nb\n<!-- c -->\n<!-- d -->')).toBe('a\nb\n')
	expect(await render('<!-- only -->')).toBe('')
	expect(await render('a <!-- inline -->\nb\n<!-- c --> d')).toBe('a <!-- inline -->\nb\n<!-- c --> d')
	// Lexical comment-line removal also applies in raw text, RCDATA, attributes and tags.
	for (const source of ['<script>\n<!-- c -->\n</script>', '<style>\n<!-- c -->\n</style>', '<title>\n<!-- c -->\n</title>', '<textarea>\n<!-- c -->\n</textarea>', '<p title="\n<!-- c -->\n">', '<p\n<!-- c -->\n>']) expect(await render(source)).toBe(source.replace('<!-- c -->\n', ''))
	// The lexer removes the line before specialization, in both insertion contexts.
	expect(await render('{#snippet s()}\n<!-- c -->\nx{/snippet}<p>{@render s()}</p><title>{@render s()}</title>')).toBe('<p>x</p><title>x</title>')
	// Template tags held by a standalone comment line go with that line.
	expect(await render('a\n<!-- {#if p}x{/if} -->\nb', { p: true })).toBe('a\nb')
	expect(await render('a\n<!-- {@partial p.sort} -->\nb', {}, { includes: { import: async () => 'x' } })).toBe('a\nb')
	expect(await render('a\n<!<galley:config>x</galley:config>-- c -->\nb')).toBe('a\n<!-- c -->\nb')
	expect(await render('{#each xs as x}\n<!-- c -->\n{ x }\n{/each}', { xs: [1, 2] })).toBe('1\n2\n')
})

test('a name the template ends in is an incomplete root, not a block that runs on', async () => {
	await refuse('<a hidden{#if p}{/if}', 'G3012')
	await refuse('<a{#if p} hidden{/if}', 'G3012')
})

test('P3 11 (G-18): lint keeps its warnings beside a context error, and reads contexts around a partial', async () => {
	const codes = async (source: string, options: Parameters<typeof lint>[1] = {}) => (await lint(source, { ...options, includes: { import: async () => '' } })).map(item => item.code)
	expect(await codes('{#snippet unused()}x{/snippet}{@raw y | unknownPipe}<a { z }>')).toEqual(['G3001', 'G3002', 'G3006'])
	expect(await codes('<a { x }>{@partial p.sort}')).toEqual(['G3008'])
	expect(await codes('{@partial p.sort}<a href={ x }>')).toEqual(['G3008'])
	// G-26: use resolved empty partials; unresolved partials defer context checks.
	expect(await codes('<a hidden{@partial attrs.sort}>{@partial body.sort}</a><p title="{@partial t.sort}">')).toEqual([])
	expect(await codes('{@raw y}{:else}')).toEqual(['G2002'])
	expect(await codes('{@render missing()}<a { z }>')).toEqual(['G3005'])
})

test('P3 9: the target that ends at a boundary is recorded in its own text, whatever was read in between', async () => {
	// With {@js} in the template a snippet declaration is read as ordinary content where it stands.
	const source = '<meta {#if p}content{#snippet s()}<i>x</i>{/snippet}{/if} content="{ a }">{@js}return ""{@js}'
	expect(await render(source, { p: true, a: '' }, { allowCode: true })).toBe('<meta content content="">')
	expect(await render(source, { p: false, a: '' }, { allowCode: true })).toBe('')
})

test('G-22: lexer removes the whole CRLF before a final comment, everywhere', async () => {
	expect(await render('a\r\n<!-- c -->')).toBe('a')
	for (const tag of ['script', 'title']) expect(await render(`<${tag}>\n<!-- { missing } -->\n</${tag}>`)).toBe(`<${tag}>\n</${tag}>`)
})
