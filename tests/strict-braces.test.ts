import { expect, test } from 'bun:test'
import galley, { GalleyDiagnosticError, lint, lex, parse } from '../index.js'

const malformed = ["{ n > 2 ? 'big' : 'small' }", '{ n + 1 }', '{ i + 1 }', "{ 'a' + b }", '{ b.toLowerCase() }', '{!-- note --}', '{ user name }', '{ b | }', '{ n == 3 }', '{ !flag }', '{ (b) }', '{ 7 }', '{}', '{\nb }', '{ b', '{#if b', '{@raw b', '{@js}return 1']
const owners = ['', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'script', 'style', 'attribute', 'comment']
const surround = (body: string, owner: string) => owner === 'attribute' ? `<p title="${body}"></p>` : owner === 'comment' ? `<p><!-- ${body} --></p>` : owner ? `<${owner}>${body}</${owner}>` : body

const braceError = async (source: string, options = {}, offset = source.indexOf('{')) => {
	const error = await galley(source, options).catch(error => error)
	expect(error, source).toBeInstanceOf(GalleyDiagnosticError)
	expect(error.diagnostic.code, source).toBe('G3019')
	expect(error.diagnostic.span.start).toBe(offset)
	expect(error.diagnostic.span.end).toBe(offset + 1)
	expect(error.diagnostic.help).toContain('Write \\{')
	expect(await lint(source, options)).toEqual([error.diagnostic])
	return error.diagnostic
}

test('every unescaped opening brace requires a valid tag, in every text context', async () => {
	for (const fragment of malformed) for (const owner of owners) {
		await braceError(surround(fragment, owner))
		const escaped = surround('\\' + fragment, owner)
		expect((await galley(escaped)).render({})).toBe(surround(fragment, owner))
	}
	await braceError('{#each xs as x, i}{ i + 1 }{/each}', {}, 18)
	expect((await galley('}')).render({})).toBe('}')
})

test('malformed tags explain the parser reason; invalid openers and missing delimiters explain the grammar', async () => {
	for (const [source, reason] of [['{ n + 1 }', 'Unexpected "+ 1" after path'], ['{ b', 'no closing }'], ['{}', 'a tag begins with a name (preceded only by spaces or tabs), #, :, / or @'], ['{@js}return 1', 'no closing {@js}']]) {
		expect((await braceError(source!)).message).toBe(`Invalid template tag: ${reason}`)
	}
	const firstName = await braceError('{ user-name }')
	expect(firstName.message).toContain('first path name must be an identifier')
	expect(firstName.help).toContain('$.user-name')
	for (const text of ['{}', '{ value', '{@js}']) expect(() => lex({ id: 'lex', text })).toThrow('G3019')
	expect(() => parse({ id: 'parse', text: '{ n + 1 }' })).toThrow('G3019')
})

test('structural errors explain how to escape literal code braces', async () => {
	for (const [source, code] of [
		['<script>function f() {/* noop */}</script>', 'G2001'],
		['<style>{#id}</style>', 'G2200'], ['<style>{@media}</style>', 'G2100'],
		['<script>x = {:a}</script>', 'G2002'], ['{#each xs as x}{:a}{/each}', 'G2002'],
	]) {
		const error = await galley(source!).catch(error => error)
		expect(error).toBeInstanceOf(GalleyDiagnosticError)
		expect(error.diagnostic.code).toBe(code)
		expect(error.diagnostic.help).toContain('Write \\{ for a literal brace.')
		expect(await lint(source!)).toEqual([error.diagnostic])
	}
})

test('every ordinary tag kind ends at the first closing brace, regardless of quotes or line breaks', () => {
	for (const quote of ["'", '"']) for (const newline of ['', '\n', '\r', '\u2028', '\u2029']) {
		for (const [kind, content] of [
			['expression', ` x ?? ${quote}${newline}`], ['block-open', `#if x === ${quote}${newline}`],
			['continuation', `:else if x === ${quote}${newline}`], ['block-close', `/if ${quote}${newline}`],
			['directive', `@raw ${quote}${newline}`],
		]) {
			const text = `{${content}}${quote} }`
			const tokens = lex({ id: 'boundary', text })
			expect(tokens.map(token => token.kind)).toEqual([kind, 'text'])
			expect(tokens[0]!.span.end).toBe(text.indexOf('}') + 1)
			expect(tokens[0]!.value).toBe((kind === 'expression' ? content! : content!.slice(1)).trim())
			expect(tokens[1]!.value).toBe(`${quote} }`)
		}
	}
})

test('missing closing braces are G3019 at the brace, without interpreting quotes in later text', async () => {
	for (const source of ["<p>{ name</p>\n<p>Don't</p>", "{ x ?? 'open\nnext", '{@raw "open', '{#if value']) {
		expect((await braceError(source)).message).toBe('Invalid template tag: no closing }')
	}
})

test('quoted closing braces fail in every text context; strings passed through data still render', async () => {
	for (const expression of ["x ?? '}'", "x | default('}')", "a['}']"]) {
		for (const owner of owners) await braceError(surround(`{ ${expression} }`, owner))
	}
	const options = { filters: { default: (value: unknown, fallback: unknown) => value ?? fallback } }
	for (const source of ['{ x ?? fallback }', '{ x | default(fallback) }', '{ a[key] }']) {
		expect((await galley(source, options)).render({ fallback: '}', key: '}', a: { '}': '}' } })).toBe('}')
		expect(await lint(source, options)).toEqual([])
	}
})

test('malformed outputs preserve the parser reason without inferring why quotes are unmatched', async () => {
	for (const quote of ["'", '"']) {
		const pathReason = `Expected a path segment, found ${JSON.stringify(quote)}`
		for (const [expression, reason] of [
			[`x ?? ${quote}}${quote}`, pathReason], [`x ?? ${quote}text}${quote}`, pathReason],
			[`x | default(${quote}}${quote})`, 'Pipe default is missing its closing )'],
			[`a[${quote}}${quote}]`, 'Unclosed or escaped bracket string is not supported'],
			[`x ?? ${quote}${quote === "'" ? '"' : "'"}${quote}()`, pathReason],
			[`x | default(${quote}ok${quote})()`, pathReason],
		]) {
			expect((await braceError(`{ ${expression} }`)).message).toBe(`Invalid template tag: ${reason}`)
		}
	}
	for (const source of ["{ y ?? 'it's' }", String.raw`{ x ?? 'it\'s' } and Bob's`]) {
		expect((await braceError(source)).message).toBe('Invalid template tag: String literals may not contain quotes or escapes')
	}
	expect((await braceError("<p>{ name</p>\n<p>Don't</p>{ x }")).message).toBe('Invalid template tag: Expected a path segment, found "/"')
})

test('only an adjacent backslash escapes the brace; removed sections and JS bodies keep their treatment', async () => {
	for (const source of ['\\ { n + 1 }', 'a\\b{ n + 1 }']) await braceError(source)
	const source = '<galley:config>{ broken</galley:config><!-- { broken -->\n{@js}const o = { k: "{" }; return o.k;{@js}'
	expect(await (await galley(source, { allowCode: true })).render({})).toBe('{')
})

test('malformed snippets are rejected even unused, through partials and every render context', async () => {
	for (const owner of ['', 'p', 'script', 'style']) {
		const body = '\n{#snippet s()}{ n + 1 }{/snippet}'
		const call = owner ? surround('{@render s()}', owner) : ''
		await braceError(body + call, {}, body.indexOf('{ n'))
		const includes = { basedir: 'parts', import: async () => body }
		const error = await braceError('{@partial library.sort}' + call, { includes }, body.indexOf('{ n'))
		expect(error.span.source.id).toBe('parts/library.sort')
	}
})

test('source removals and strip preserve the original error offset', async () => {
	for (const strip of [false, true]) for (const owner of owners) {
		const before = '<galley:config>{ ignored }</galley:config><!-- { ignored } -->\n\\{ escaped }\n'
		const source = before + surround('{ !flag }', owner)
		const error = await braceError(source, { strip, sourceId: 'braces.chase' }, source.indexOf('{ !flag }'))
		expect(error.span.source.id).toBe('braces.chase')
	}
})

test('strictBraces is accepted but never read; valid tags keep their context checks', async () => {
	const options = { get strictBraces(): boolean { throw new Error('deprecated option was read') } }
	expect((await galley('{ value }', options)).render({ value: 'ok' })).toBe('ok')
	expect(await lint('{ value }', options)).toEqual([])
	await braceError('{ n + 1 }', options)
	for (const [source, code] of [['<script>{ value }</script>', 'G3018'], ['<style>{ value }</style>', 'G3018'], ['<p onclick="{ value }">', 'G3017'], ['<p><!-- { value } --></p>', 'G3013']]) {
		await expect(galley(source!)).rejects.toThrow(code!)
		expect((await lint(source!))[0]!.code).toBe(code!)
	}
})

test('output openers accept spaces and tabs, retaining value spans, but reject other leading whitespace', async () => {
	for (const padding of [' ', '\t', ' \t', '\t ']) {
		const text = `{${padding}value${padding}}`
		expect((await galley(text)).render({ value: 'ok' })).toBe('ok')
		expect(await lint(text)).toEqual([])
		const token = lex({ id: 'tabs', text })[0]!
		expect(token.value).toBe('value')
		expect(token.valueStart).toBe(1 + padding.length)
	}
	for (const whitespace of ['\n', '\r', '\f', '\u00a0']) {
		expect((await braceError(`{${whitespace}value }`)).message).toContain('preceded only by spaces or tabs')
	}
})
