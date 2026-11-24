import { expect, spyOn, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint, parse } from '../index.js'
import * as parser from '../compiler/parser.js'
import * as text from '../compiler/text.js'
import { readContexts } from '../compiler/context.js'

const render = async (source: string, data: object = {}, options = {}) => (await galley(source, options)).render(data)
const errorAt = async (source: string, code: string, offset: number, options = {}) => {
	const error = await galley(source, { sourceId: 'reader.chase', ...options }).catch(error => error)
	expect(error, source).toBeInstanceOf(GalleyDiagnosticError)
	expect(error.diagnostic.code, source).toBe(code)
	expect(error.diagnostic.span.start, source).toBe(offset)
	expect(error.message).toContain('reader.chase:')
	expect((await lint(source, options)).some(item => item.code === code)).toBe(true)
	return error
}

test('B7a: every listed migration is always on', async () => {
	for (const strictBraces of [false, true]) {
		const options = { strictBraces }
		for (const source of ['<style>b{margin:0}</style>', '<script>var o={k:1}</script>', '<script>var n = "{ user-name }"</script>']) expect(await render(source, { 'user-name': 'Ada' }, options)).toBe(source)
		for (const source of ['[{ n-1 }]', '{ user-name }']) await errorAt(source, 'G3019', source.indexOf('{'), options)
		expect(await render('{ $.user-name }', { 'user-name': 'Ada' }, options)).toBe('Ada')
		const script = '<script>var l = "{ lang }"</script>'
		await errorAt(script, 'G3018', script.indexOf('{ lang }'), options)
		const snippet = '{#snippet s(x)}{ x }{/snippet}<script>var l = "{@render s(lang)}"</script>'
		const error = await errorAt(snippet, 'G3018', snippet.indexOf('{ x }'), options)
		expect(error.diagnostic.help).toContain('Rendered by {@render s(lang)} at reader.chase:1:')
	}
})

test('B7a: first-name failures outside script and style keep their brace and original source location', async () => {
	for (const strip of [false, true]) for (const strictBraces of [false, true]) {
		for (const body of ['{ user-name }', '<title>{ user-name }</title>', '<textarea>{ user-name }</textarea>', '<p title="{ user-name }">', "<p title='{ user-name }'>", 'x<!-- { user-name } -->', '<script>{ user-name }</script>{ user-name }', '<style>{ user-name }</style>{ user-name }']) {
			const source = '<galley:config>config</galley:config>\n<!-- removed -->\n\\{ ignored-name }\n' + body
			await errorAt(source, 'G3019', source.lastIndexOf('{ user-name }'), { strip, strictBraces })
		}
		const escaped = '\\{ user-name }<title>\\{ user-name }</title><p title="\\{ user-name }">'
		expect(await render(escaped, {}, { strip, strictBraces })).toBe(escaped.replaceAll('\\{', '{'))
	}
})

test('B7a: later path names stay broad; every first path name is checked after the whole expression parses', async () => {
	const data = { 'user-name': [{ value: 'Ada' }], meta: { 'og:image': 'cover', 'a+b': 'plus', 'a-b': 'minus' }, key: 'og:image', values: { 'a-b': 'key' }, 'key-name': 'a-b' }
	expect(await render('{ meta.og:image } { meta.a+b } { meta.a-b } { values[$.key-name] }', data)).toBe('cover plus minus key')
	for (const source of ['{ user-name || a }', '{ user-name | f }', '{ a || user-name }', '{ a | f(user-name) }', '{ values[key-name] }', '{ a ?? user+name }']) await errorAt(source, 'G3019', 0)
	for (const source of ['{ user-name + 1 }', '{ user-name || bad() }', '{ a | f(user-name, bad()) }', '{ n + 1 }', '{ user name }', '{ x.toString() }']) expect(await render(source)).toBe(source)
	for (const source of ['{#if user-name}x{/if}', '{@const c = user-name}', '{#each user-name as x}{ x }{/each}', '{@raw user-name}', '{#snippet s(x)}{ x }{/snippet}{@render s(user-name)}']) await expect(galley(source)).rejects.toBeInstanceOf(GalleyDiagnosticError)
	expect(await render('{#if $.user-name}{@const c = $.user-name}{#each c as x}{ x.value }{/each}{/if}', data)).toBe('Ada')
	await expect(galley('{#if !user-name}x{/if}')).rejects.toThrow('G1007')
})

test('B7a: a first-name failure before a less-than operator names the brace fix', async () => {
	for (const operator of ['<', '<=']) for (const owner of ['p', 'svg><title', 'math><textarea']) {
		const source = `<${owner}>{ user-name ${operator} a }`
		const error = await errorAt(source, 'G3019', source.indexOf('{'))
		expect(error.diagnostic.help).toContain('Write \\{')
		expect(error.diagnostic.help).toContain('$.')
	}
})

test('B7a: brace diagnostics require the parser table for that source object', () => {
	const source = { id: 'braces.chase', text: '{ user-name }' }
	expect(() => parser.braceDiagnostic(source, 0)).toThrow('Missing brace diagnostics for braces.chase')
	parse(source)
	expect(parser.braceDiagnostic(source, 0)?.code).toBe('G3019')
	expect(parser.braceDiagnostic(source, 1)).toBeUndefined()
	expect(() => parser.braceDiagnostic({ ...source }, 0)).toThrow('Missing brace diagnostics')
})

test('B7a: script and style diagnostics explain how to keep a literal brace', async () => {
	for (const owner of ['script', 'style']) {
		const error = await errorAt(`<${owner}>{ value }</${owner}>`, 'G3018', owner.length + 2)
		expect(error.diagnostic.help).toContain('Write \\{ for a literal brace')
		expect(await render(`<${owner}>\\{ value }</${owner}>`)).toBe(`<${owner}>{ value }</${owner}>`)
	}
})

test('B7a: rule 17 follows each rendered variant; static, raw and JS content retain their contracts', async () => {
	for (const owner of ['script', 'style']) {
		for (const source of [`<${owner}>{ value }</${owner}>`, `{#each xs as x}{:else}<${owner}>{ value }</${owner}>{/each}`, `{#snippet s(x)}{ x }{/snippet}<p>{@render s(value)}</p><${owner}>{@render s(value)}</${owner}>`]) await errorAt(source, 'G3018', source.includes('{ x }') ? source.indexOf('{ x }') : source.indexOf('{ value }'))
		const source = `{#snippet s()}({k:1}){/snippet}{#snippet r(x)}{@raw x}{/snippet}<${owner}>{@render s()}{@render r(value)}</${owner}>`
		expect(await render(source, { value: 'RAW' })).toBe(`<${owner}>({k:1})RAW</${owner}>`)
		expect(await render(`<${owner}>{@js}return 'JS'{@js}</${owner}>`, {}, { allowCode: true })).toBe(`<${owner}>JS</${owner}>`)
		const braces = `{#snippet s()}{ user-name }{/snippet}<${owner}>{@render s()}</${owner}>`
		expect(await render(braces)).toBe(`<${owner}>{ user-name }</${owner}>`)
		await errorAt(braces + '<p>{@render s()}</p>', 'G3019', braces.indexOf('{ user-name }'))
	}
	const partial = '<script>{@partial p.sort}</script>'
	const error = await galley(partial, { includes: { import: async () => '{ value }' } }).catch(error => error)
	expect(error.diagnostic.code).toBe('G3018')
	expect(error.diagnostic.span.source.id).toBe('./p.sort')
})


test('B7a: specializing a snippet preserves unrelated failures', async () => {
	const source = '{#snippet s()}\\{ literal }{/snippet}{@render s()}'
	const at = parse({ id: 'other', text: source }).span
	for (const failure of [new Error('reader unavailable'), new GalleyDiagnosticError({ code: 'G3014', severity: 'error', message: 'other refusal', span: at })]) {
		const explain = spyOn(parser, 'braceDiagnostic').mockImplementation(() => { throw failure })
		try { expect(await galley(source).catch(error => error)).toBe(failure) }
		finally { explain.mockRestore() }
	}
})

test('B7a: brace source lookup advances through retained spans with linear work', () => {
	const count = 400
	const ast = parse({ id: 'spans', text: '\\{ literal }'.repeat(count) })
	const spans = text.textSpans
	let reads = 0
	const locate = spyOn(text, 'textSpans').mockImplementation(node => spans(node).map(part => new Proxy(part, {
		get(target, key) { if (key === 'start' || key === 'end') reads++; return Reflect.get(target, key) },
	})))
	try {
		readContexts(ast)
		expect(reads).toBeGreaterThan(count)
		expect(reads).toBeLessThanOrEqual(12 * count)
	} finally { locate.mockRestore() }
})

test('B7a: static snippet variants still distinguish foreign counts', async () => {
	const snippet = '{#snippet s()}<style><b></style>{/snippet}{@render s()}'
	expect(await render(snippet)).toBe('<style><b></style>')
	for (const foreign of ['svg', 'math']) await expect(galley(snippet + `<${foreign}>{@render s()}</${foreign}>`)).rejects.toThrow('G3013')
})
