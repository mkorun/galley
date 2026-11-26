/**
 * Numbers where they meet the literal-brace fallback: the shipped compiler against recorded 0.5.0 results.
 * 0.6.0 may refuse more only in a tag that 0.5.0 compiled as a galley expression, for a numeric token of 0.5.0's own
 * parse that breaks the new rule; every other case must keep 0.5.0's output, or its error, code, severity, message,
 * help and place.
 */
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Diagnostic, Expression, TemplateNode } from '../compiler/index.js'

export const NUMBERS = ['7', '0', '0.5', '007', '-01', '9007199254740991', '9007199254740992', '-9007199254740993', '9007199254740991.1', '-9007199254740991.499', '9007199254740991.0', '1000000000000000000000', '9'.repeat(310)]
/** N is the number. The quoted keys are controls: a number in a string is no number. */
export const EXPRESSIONS = ['N', 'a[N]', 'a[ N ]', 'a.b[N].c', 'b[a[N]]', 'a[N]()', 'a[N] === foo-bar', 'foo-bar === a[N]', 'n === N', 'N === n', 'n === N || f()', 'a[N] === f()', '!a[N]', '(a[N])', 'a[N] ?? N', 'a[N] | upper', 'n | oneOf(N)', 'n | oneOf(a[N])', 'n | oneOf(N, )', 'n | oneOf(N) | 1x', 'a[N] | nofilter', 'user-name[N]', '$.a[N]', 'a[N]b', "a['N']", "a['[N]']"]
/** E is the expression; a partial form writes it in the partial, and {@js} forms enable code. */
export const FORMS: readonly { readonly template: string; readonly partial?: string; readonly allowCode?: true }[] = [
	{ template: '{ E }' }, { template: '{ E; }' }, { template: '{@raw E}' }, { template: '{@const x = E}{ x }' }, { template: '{#if E}y{/if}' },
	{ template: '{#each E as x}{ x }{/each}' }, { template: '{#each l as x}{ x }{:else}{ E }{/each}' }, { template: '{ n | oneOf(E) }' },
	{ template: '{#snippet s(x)}{ x }{/snippet}{@render s(E)}' }, { template: '{#snippet u()}{ E }{/snippet}' },
	{ template: '{@partial p.sort}', partial: '{ E }' },
	{ template: '{ E }{@js}return (;{@js}', allowCode: true }, { template: '{ E }{@js}return 1{@js}', allowCode: true },
]
/** F is the form. */
export const CONTEXTS = ['<p>F</p>', '<script>if (true) F</script>', '<style>p F</style>', '<p title="F"></p>']
const DATA = { a: { 7: 'seven', 0: 'zero', b: { 7: { c: 'c' } } }, b: { seven: 'b' }, l: [], n: 7 }

export interface Case { readonly source: string; readonly partial: string | null; readonly strictBraces: boolean; readonly allowCode: boolean }
/** Code, severity, a digest of message and help, source file and offsets. What the compiler threw otherwise has no place. */
type Place = [code: string, severity: string, text: string, file: string, start: number, end: number]
/** `output` is a digest of the rendered text, or of what the render threw. */
export interface Result { readonly output: string | null; readonly error: Place | null; readonly lint: readonly Place[] }
/** A numeric literal or a number in brackets, as 0.5.0 parsed it: a new refusal must stand on one. */
type NumberToken = [kind: 'literal' | 'bracket', file: string, start: number, end: number]
export interface Recorded extends Result { readonly numbers: readonly NumberToken[] }
type Options = { strictBraces: boolean; allowCode: boolean; includes?: { import(path: string): Promise<string> } }
export interface Compiler {
	readonly default: (source: string, options: Options) => Promise<{ render(data: object): string | Promise<string> }>
	readonly lint: (source: string, options: Options) => Promise<Diagnostic[]>
	readonly parse: (source: { id: string; text: string }) => { children: readonly TemplateNode[] }
	readonly GalleyDiagnosticError: new (...args: never[]) => Error & { diagnostic: Diagnostic }
}
/** The file name the compiler gives the partial `p.sort` under the default base directory. */
const PARTIAL = './p.sort'

export const corpus = (): Case[] => {
	const cases: Case[] = []
	for (const number of NUMBERS) for (const expression of EXPRESSIONS) for (const form of FORMS) for (const context of CONTEXTS) {
		const written = expression.replaceAll('N', number)
		const source = context.replace('F', () => form.template.replace('E', () => written))
		const partial = form.partial?.replace('E', () => written) ?? null
		for (const strictBraces of [false, true]) cases.push({ source, partial, strictBraces, allowCode: form.allowCode === true })
	}
	return cases
}
export const corpusDigest = (cases: readonly Case[]): string => new Bun.CryptoHasher('sha256').update(JSON.stringify(cases)).digest('hex')

const digest = (text: string): string => new Bun.CryptoHasher('sha256').update(text).digest('hex').slice(0, 10)
const place = (diagnostic: Diagnostic): Place => [diagnostic.code, diagnostic.severity, digest(JSON.stringify([diagnostic.message, diagnostic.help ?? null])), diagnostic.span.source.id, diagnostic.span.start, diagnostic.span.end]
const options = (item: Case): Options => ({ strictBraces: item.strictBraces, allowCode: item.allowCode, ...(item.partial === null ? {} : { includes: { import: async () => item.partial! } }) })

export const run = async (compiler: Compiler, item: Case): Promise<Result> => {
	let output: string | null = null, error: Place | null = null
	try {
		const template = await compiler.default(item.source, options(item))
		try { output = digest(await template.render(DATA)) }
		catch (thrown) { output = digest(`threw: ${String(thrown)}`) }
	} catch (thrown) {
		// Generated code that does not compile is the compiler's result too; any other fault stops the comparison.
		if (thrown instanceof SyntaxError) error = [thrown.name, 'thrown', digest(thrown.message), '', -1, -1]
		else if (thrown instanceof compiler.GalleyDiagnosticError) error = place(thrown.diagnostic)
		else throw thrown
	}
	return { output, error, lint: (await compiler.lint(item.source, options(item))).map(place) }
}

const numberTokens = (compiler: Compiler, item: Case): NumberToken[] => {
	const tokens: NumberToken[] = []
	const expression = (node: Expression): void => {
		if (node.kind === 'literal') { if (typeof node.value === 'number') tokens.push(['literal', node.span.source.id, node.span.start, node.span.end]) }
		else if (node.kind === 'path') for (const segment of node.segments) {
			if (typeof segment.value === 'object') expression(segment.value)
			else if (typeof segment.value === 'number') {
				// 0.5.0 keeps the span of the brackets; the number is their trimmed content.
				const inside = segment.span.source.text.slice(segment.span.start + 1, segment.span.end - 1), from = segment.span.start + 1 + inside.indexOf(inside.trim())
				tokens.push(['bracket', segment.span.source.id, from, from + inside.trim().length])
			}
		}
		else if (node.kind === 'unary') expression(node.operand)
		else if (node.kind === 'binary') { expression(node.left); expression(node.right) }
		else if (node.kind === 'pipe') { expression(node.input); for (const pipe of node.pipes) pipe.args.forEach(expression) }
	}
	const visit = (nodes: readonly TemplateNode[]): void => {
		for (const node of nodes) {
			if (node.kind === 'output' || node.kind === 'const') expression(node.expression)
			else if (node.kind === 'render') node.arguments.forEach(expression)
			else if (node.kind === 'if') for (const branch of node.branches) { if (branch.condition) expression(branch.condition); visit(branch.children) }
			else if (node.kind === 'each') { expression(node.collection); visit(node.children); visit(node.fallback ?? []) }
			else if (node.kind === 'snippet') visit(node.children)
		}
	}
	for (const [id, text] of [['<template>', item.source], [PARTIAL, item.partial]] as const) {
		if (text === null) continue
		try { visit(compiler.parse({ id, text }).children) }
		catch (thrown) { if (!(thrown instanceof compiler.GalleyDiagnosticError)) throw thrown }
	}
	return tokens
}

export const record = async (compiler: Compiler, cases: readonly Case[]): Promise<{ corpus: string; results: Recorded[] }> => {
	const results: Recorded[] = []
	for (const item of cases) results.push({ ...await run(compiler, item), numbers: numberTokens(compiler, item) })
	return { corpus: corpusDigest(cases), results }
}

/** The new rule, written independently of the compiler: a leading zero, or a magnitude above the bound as written. */
const breaksNewRule = (code: string, number: string): boolean => {
	if (code === 'G1106') return /^-?0\d/.test(number)
	const [integer = '', fraction = ''] = number.replace('-', '').split('.')
	const bound = String(Number.MAX_SAFE_INTEGER)
	return code === 'G1107' && (integer.length > bound.length || (integer.length === bound.length && (integer > bound || (integer === bound && /[^0]/.test(fraction)))))
}

/** Every case gets one class; any class but `same` and the new refusals is a fault. */
export const classify = (item: Case, before: Recorded, after: Result): string => {
	if (JSON.stringify([before.output, before.error, before.lint]) === JSON.stringify([after.output, after.error, after.lint])) return 'same'
	// Where galley keeps 0.5.0's thrown error, the generated code does not compile; lint never compiles it and may add the refusal.
	const thrownKept = before.error?.[1] === 'thrown' && JSON.stringify(before.error) === JSON.stringify(after.error)
	if (!thrownKept && (before.error || !after.error || after.output !== null)) return 'unexpected: 0.5.0 result changed'
	const error = thrownKept ? after.lint.at(-1) : after.error
	if (!error) return 'unexpected: 0.5.0 lint changed'
	const [code, , , file, start, end] = error
	// G1106 of a literal is 0.5.0's own; the new one stands on a number in brackets.
	const token = before.numbers.find(([kind, source, from, to]) => source === file && from === start && to === end && (code !== 'G1106' || kind === 'bracket'))
	if (!token) return `unexpected: ${code} on no ${code === 'G1106' ? 'number in brackets' : 'number'} of 0.5.0's parse`
	if (!breaksNewRule(code, (file === PARTIAL ? item.partial! : item.source).slice(start, end))) return `unexpected: ${code} for a number the new rule allows`
	if (JSON.stringify(after.lint) !== JSON.stringify([...before.lint, error])) return `unexpected: lint differs beyond ${code}`
	return `new refusal ${code}${code === 'G1106' ? ' (number in brackets)' : ''}${thrownKept ? ' in lint, beside the error galley keeps' : ''}`
}

export const compare = async (compiler: Compiler, recorded: { corpus: string; results: readonly Recorded[] }, cases = corpus()): Promise<{ classes: Record<string, number>; examples: Record<string, string> }> => {
	if (recorded.corpus !== corpusDigest(cases) || recorded.results.length !== cases.length) throw new Error('The recorded 0.5.0 results belong to another corpus; record them again from 0.5.0')
	const classes: Record<string, number> = {}, examples: Record<string, string> = {}
	for (const [index, item] of cases.entries()) {
		const kind = classify(item, recorded.results[index]!, await run(compiler, item))
		classes[kind] = (classes[kind] ?? 0) + 1
		const shown = (text: string) => JSON.stringify(text.length > 200 ? text.slice(0, 200) + '…' : text)
		examples[kind] ??= `${shown(item.source)}${item.partial === null ? '' : ` partial ${shown(item.partial)}`} strictBraces=${item.strictBraces}${item.allowCode ? ' allowCode' : ''}`
	}
	return { classes, examples }
}

const unexpected = (classes: Record<string, number>): boolean => Object.keys(classes).some(kind => kind.startsWith('unexpected'))
type Row = [Result['output'], Result['error'], Result['lint'], Recorded['numbers']]

/** `--record <directory>` runs 0.5.0 from a copy of its sources; without arguments the shipped compiler is compared. */
export const main = async (args: readonly string[], file: URL, cases = corpus()): Promise<boolean> => {
	if (args.length === 2 && args[0] === '--record') {
		const recorded = await record(await import(pathToFileURL(join(args[1]!, 'index.ts')).href) as Compiler, cases)
		// Distinct rows (output, error, lint, numbers) once each; every case names its row.
		const rows: string[] = [], index = new Map<string, number>()
		const cased = recorded.results.map(result => {
			const row = JSON.stringify([result.output, result.error, result.lint, result.numbers])
			if (!index.has(row)) { index.set(row, rows.length); rows.push(row) }
			return index.get(row)!
		})
		await Bun.write(file, `{"corpus":${JSON.stringify(recorded.corpus)},"cases":${JSON.stringify(cased)},"rows":[\n${rows.join(',\n')}\n]}\n`)
		console.log(`Recorded ${recorded.results.length} cases in ${rows.length} distinct rows`)
		return true
	}
	if (args.length) throw new Error('usage: bun differential/numbers-run.ts [--record <directory with 0.5.0 sources>]')
	const { corpus: digestOfCorpus, cases: cased, rows } = JSON.parse(await Bun.file(file).text()) as { corpus: string; cases: number[]; rows: Row[] }
	const results = cased.map(row => { const [output, error, lint, numbers] = rows[row]!; return { output, error, lint, numbers } })
	const report = await compare(await import('../index.js') as Compiler, { corpus: digestOfCorpus, results }, cases)
	console.log(JSON.stringify(report, null, 2))
	return !unexpected(report.classes)
}
