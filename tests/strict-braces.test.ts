import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint } from '../index.js'

const malformed = ["{ n > 2 ? 'big' : 'small' }", '{ n + 1 }', '{ i + 1 }', "{ 'a' + b }", '{ b.toLowerCase() }', '{!-- note --}', '{ user name }', '{ b | }', '{ n == 3 }', '{ !flag }', '{ (b) }', '{ 3 }', '{}', '{ b']

test('B7b: every malformed unescaped brace is G3019; defaults preserve literal bytes', async () => {
	for (const fragment of malformed) {
		for (const options of [{}, { strictBraces: false }]) expect((await galley(fragment, options)).render({})).toBe(fragment)
		const error = await galley(fragment, { strictBraces: true }).catch(error => error)
		expect(error).toBeInstanceOf(GalleyDiagnosticError)
		expect(error.diagnostic.code).toBe('G3019')
		expect(error.diagnostic.span.start).toBe(0)
		expect(error.diagnostic.span.end).toBe(1)
		expect(error.diagnostic.help).toContain('Write \\{')
		expect(error.diagnostic.help).toContain('Arithmetic, the ternary operator and method calls')
		expect((await lint(fragment, { strictBraces: true }))[0]).toEqual(error.diagnostic)
		expect((await galley('\\' + fragment, { strictBraces: true })).render({})).toBe(fragment)
	}
	expect((await galley('{#each xs as x, i}{ i + 1 }{/each}')).render({ xs: [1, 2] })).toBe('{ i + 1 }{ i + 1 }')
	await expect(galley('{#each xs as x, i}{ i + 1 }{/each}', { strictBraces: true })).rejects.toThrow('G3019')
	expect((await galley('{!-- note --}x')).render({})).toBe('{!-- note --}x')
	expect((await galley('}', { strictBraces: true })).render({})).toBe('}')
})

test('B7b: parser reasons and lexer non-tags have distinct explanations', async () => {
	for (const [source, reason] of [['{ n + 1 }', 'Unexpected "+ 1" after path'], ['{ b', 'no closing }'], ['{}', 'a tag begins with a name, #, :, / or @']]) {
		expect((await lint(source!, { strictBraces: true }))[0]!.message).toBe(`Literal { in text: ${reason}`)
	}
})

test('B7b: only a backslash directly before the brace escapes it', async () => {
	for (const source of ['\\ { n + 1 }', 'a\\b{ n + 1 }']) {
		const error = await galley(source, { strictBraces: true }).catch(error => error)
		expect(error).toBeInstanceOf(GalleyDiagnosticError)
		expect(error.diagnostic.code).toBe('G3019')
		expect(error.diagnostic.span.start).toBe(source.indexOf('{'))
		expect((await lint(source, { strictBraces: true }))[0]).toEqual(error.diagnostic)
	}
})

test('B7b: unused snippets are not judged, including in shared partials', async () => {
	const includes = { basedir: 'parts', import: async () => '{#snippet s()}{ n + 1 }{/snippet}' }
	const source = '{@partial library.sort}'
	const options = { includes, strictBraces: true }
	expect((await galley(source + 'x', options)).render({})).toBe('x')
	expect((await galley(source + '<script>{@render s()}</script>', options)).render({})).toBe('<script>{ n + 1 }</script>')
	const error = await galley(source + '<p>{@render s()}</p>', options).catch(error => error)
	expect(error.diagnostic.code).toBe('G3019')
	expect(error.diagnostic.span.source.id).toBe('parts/library.sort')
	expect((await lint(source + '<p>{@render s()}</p>', options))[0]).toEqual(error.diagnostic)
})

test('B7b: consumed ranges keep source offsets and escapes across removals and strip', async () => {
	for (const strip of [false, true]) for (const [prefix, suffix] of [['', ''], ['<title>', '</title>'], ['<textarea>', '</textarea>'], ['<p title="', '"></p>'], ['<p><!-- inline ', ' --></p>'], ['<!doctype html ', '>']]) {
		const before = '<galley:config>{ ignored }</galley:config><!-- { ignored } -->\n\\{ escaped }\n'
		const source = before + prefix + '{ !flag }' + suffix
		const error = await galley(source, { strictBraces: true, strip, sourceId: 'braces.chase' }).catch(error => error)
		expect(error.diagnostic.code).toBe('G3019')
		expect(error.diagnostic.span.source.id).toBe('braces.chase')
		expect(error.diagnostic.span.start).toBe(source.indexOf('{ !flag }'))
		expect((await lint(source, { strictBraces: true, strip }))[0]!.span.start).toBe(source.indexOf('{ !flag }'))
	}
})

test('B7b: script/style exemption ends at the end tag, and snippets use each call context', async () => {
	for (const owner of ['script', 'style']) {
		const prefix = `<${owner}>{ !flag }</${owner}>`
		expect((await galley(prefix, { strictBraces: true })).render({})).toBe(prefix)
		await expect(galley(prefix + '{ !flag }', { strictBraces: true })).rejects.toThrow('G3019')
		const snippet = '{#snippet s()}{ !flag }{/snippet}'
		expect((await galley(snippet + `<${owner}>{@render s()}</${owner}>`, { strictBraces: true })).render({})).toBe(prefix)
		const error = await galley(snippet + `<${owner}>{@render s()}</${owner}><p>{@render s()}</p>`, { strictBraces: true }).catch(error => error)
		expect(error.diagnostic.code).toBe('G3019')
		expect(error.diagnostic.span.start).toBe(snippet.indexOf('{ !flag }'))
	}
	const options = { strictBraces: true, includes: { basedir: 'parts', import: async () => '\n{ !flag }' } }
	const error = await galley('{@partial p.sort}', options).catch(error => error)
	expect(error.diagnostic.span.source.id).toBe('parts/p.sort')
	expect(error.diagnostic.span.start).toBe(1)
	expect((await lint('{@partial p.sort}', options))[0]!.code).toBe('G3019')
})
