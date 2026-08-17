import { describe, expect, test } from 'bun:test'
import galley from './compiler'
import util from '../util'

const noPartials = { import: () => Promise.resolve(''), basedir: '.' }

describe('GalleyOptions', () => {

	// ── debug mode ────────────────────────────────────────────────────────────

	test('debug: true — source property is present', async () => {
		const tpl = await galley('{ title }', { includes: noPartials, debug: true })
		expect(tpl.source).toBeDefined()
		expect(typeof tpl.source).toBe('string')
	})

	test('debug: false (default) — source property absent', async () => {
		const tpl = await galley('{ title }', { includes: noPartials })
		expect(tpl.source).toBeUndefined()
	})

	test('debug source contains line comment annotations', async () => {
		const tpl = await galley('{ title }', { includes: noPartials, debug: true })
		expect(tpl.source).toContain('// [galley]')
	})

	// ── strip option ──────────────────────────────────────────────────────────

	test('strip: true — newlines removed and whitespace around tags collapsed', async () => {
		const tpl = await galley(
			'<p>\n  <span>{ title }</span>\n</p>',
			{ includes: noPartials, strip: true },
		)
		// strip removes \n and collapses whitespace around HTML tags
		expect(tpl.render({ title: 'hi' }, util)).toBe('<p><span>hi</span></p>')
	})

	test('strip: false (default) — whitespace preserved', async () => {
		const tpl = await galley(
			'<p>\n  <span>{ title }</span>\n</p>',
			{ includes: noPartials },
		)
		expect(tpl.render({ title: 'hi' }, util)).toBe('<p>\n  <span>hi</span>\n</p>')
	})

	// ── allowCode ────────────────────────────────────────────────────────────

	test('allowCode: false (default) — {@js} throws', async () => {
		await expect(galley('{@js}return "x"{@js}', { includes: noPartials }))
			.rejects.toThrow('allowCode')
	})

	test('allowCode: true — {@js} renders', async () => {
		const tpl = await galley('{@js}return "ok"{@js}', { includes: noPartials, allowCode: true })
		expect(await tpl.render({}, util)).toBe('ok')
	})

	// ── empty template ────────────────────────────────────────────────────────

	test('empty template renders empty string', async () => {
		const tpl = await galley('', { includes: noPartials })
		expect(tpl.render({}, util)).toBe('')
	})

	// ── galley:config stripped ───────────────────────────────────────────────

	test('<galley:config> blocks are stripped before rendering', async () => {
		const tpl = await galley(
			'<galley:config>\nkey: value\n</galley:config>hello',
			{ includes: noPartials },
		)
		expect(tpl.render({}, util)).toBe('hello')
	})

	// ── stripEmptyMeta ────────────────────────────────────────────────────────

	test('stripEmptyMeta: true (default) — removes <meta content=""> when expression is empty', async () => {
		const tpl = await galley(
			'before\n<meta name="x" content="{ val }">\nafter',
			{ includes: noPartials },
		)
		expect(tpl.render({}, util)).toBe('before\nafter')
	})

	test('stripEmptyMeta: true (default) — removes self-closing <meta content=""/> when empty', async () => {
		const tpl = await galley(
			'before\n<meta name="x" content="{ val }"/>\nafter',
			{ includes: noPartials },
		)
		expect(tpl.render({}, util)).toBe('before\nafter')
	})

	test('stripEmptyMeta: true (default) — keeps <meta> with non-empty content', async () => {
		const tpl = await galley(
			'<meta name="x" content="{ val }">',
			{ includes: noPartials },
		)
		expect(tpl.render({ val: 'hello' }, util)).toBe('<meta name="x" content="hello">')
	})

	test('stripEmptyMeta: false — preserves <meta content=""> unchanged', async () => {
		const tpl = await galley(
			'before\n<meta name="x" content="{ val }">\nafter',
			{ includes: noPartials, stripEmptyMeta: false },
		)
		expect(tpl.render({}, util)).toBe('before\n<meta name="x" content="">\nafter')
	})

	test('stripEmptyMeta: true (default) — no content expression → regex not injected, literal content="" preserved', async () => {
		// No expression inside content="..." → hasContentExpr stays false → no regex
		const tpl = await galley(
			'before\n<meta name="x" content="">\nafter',
			{ includes: noPartials },
		)
		// Literal content="" (not from a template expression) is NOT stripped
		expect(tpl.render({}, util)).toBe('before\n<meta name="x" content="">\nafter')
	})

	test('stripEmptyMeta only removes the tag whose dynamic content is empty', async () => {
		const tpl = await galley(
			'<meta name="literal" content="">\n<meta name="dynamic" content="{ val }">',
			{ includes: noPartials },
		)
		expect(tpl.render({}, util)).toBe('<meta name="literal" content="">\n')
	})

	test('stripEmptyMeta tracks expressions after a literal attribute prefix', async () => {
		const tpl = await galley('<meta content="{ a }{ b }">', { includes: noPartials })
		expect(tpl.render({}, util)).toBe('')
		expect(tpl.render({ b: 'x' }, util)).toBe('<meta content="x">')
	})

	test('stripEmptyMeta: true — dynamic empty meta from variable is stripped', async () => {
		const tpl = await galley(
			'<meta name="desc" content="{ desc }">',
			{ includes: noPartials, stripEmptyMeta: true },
		)
		expect(tpl.render({ desc: '' }, util)).toBe('')
	})

	test('stripEmptyMeta: true — dynamic non-empty meta is kept', async () => {
		const tpl = await galley(
			'<meta name="desc" content="{ desc }">',
			{ includes: noPartials, stripEmptyMeta: true },
		)
		expect(tpl.render({ desc: 'My description' }, util)).toBe('<meta name="desc" content="My description">')
	})

	// ── stripEmptyMeta: link href stripping ───────────────────────────────────

	test('stripEmptyMeta: true (default) — removes <link href=""> when expression is empty', async () => {
		const tpl = await galley(
			'before\n<link rel="me" href="{ url }">\nafter',
			{ includes: noPartials },
		)
		expect(tpl.render({}, util)).toBe('before\nafter')
	})

	test('stripEmptyMeta: true (default) — keeps <link> with non-empty href', async () => {
		const tpl = await galley(
			'<link rel="me" href="{ url }">',
			{ includes: noPartials },
		)
		expect(tpl.render({ url: 'https://github.com/mkorun' }, util)).toBe('<link rel="me" href="https://github.com/mkorun">')
	})

	test('stripEmptyMeta: false — preserves <link href=""> unchanged', async () => {
		const tpl = await galley(
			'before\n<link rel="me" href="{ url }">\nafter',
			{ includes: noPartials, stripEmptyMeta: false },
		)
		expect(tpl.render({}, util)).toBe('before\n<link rel="me" href="">\nafter')
	})

	test('stripEmptyMeta: true — literal <link href=""> (no expression) is NOT stripped', async () => {
		const tpl = await galley(
			'before\n<link rel="me" href="">\nafter',
			{ includes: noPartials },
		)
		expect(tpl.render({}, util)).toBe('before\n<link rel="me" href="">\nafter')
	})

	test('stripEmptyMeta: true — multiple links, only empty ones removed', async () => {
		const tpl = await galley(
			'<link rel="me" href="{ a }">\n<link rel="me" href="{ b }">\n<link rel="me" href="{ c }">',
			{ includes: noPartials },
		)
		expect(tpl.render({ a: 'https://github.com', c: 'https://npm.com' }, util))
			.toBe('<link rel="me" href="https://github.com">\n<link rel="me" href="https://npm.com">')
	})

})

// ── util.stripWhitespace — direct unit tests ──────────────────────────────────

describe('util.stripWhitespace', () => {

	test('removes all newlines', () => {
		expect(util.stripWhitespace('a\nb\nc')).toBe('abc')
	})

	test('collapses whitespace before <', () => {
		expect(util.stripWhitespace('  <p>')).toBe('<p>')
		expect(util.stripWhitespace('\t  <p>')).toBe('<p>')
	})

	test('collapses whitespace between ><', () => {
		expect(util.stripWhitespace('></p>  <p>')).toBe('></p><p>')
	})

	test('collapses trailing whitespace after >', () => {
		expect(util.stripWhitespace('<p>  ')).toBe('<p>')
	})

	test('returns non-string values unchanged', () => {
		expect(util.stripWhitespace(null as any)).toBe(null)
		expect(util.stripWhitespace('' as any)).toBe('')
		expect(util.stripWhitespace(42 as any)).toBe(42 as any)
	})

})
