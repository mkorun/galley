/**
 * Numbers where they meet the literal-brace fallback: the shipped compiler against recorded 0.5.0 results.
 * 0.6.0 may refuse more only in a tag that 0.5.0 compiled as a galley expression, for a number that breaks the new
 * rule; every other case must keep 0.5.0's output and diagnostics, code, message and place.
 */
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Diagnostic, Expression, TemplateNode } from '../compiler/index.js'

export const NUMBERS = ['7', '0', '0.5', '007', '-01', '9007199254740991', '9007199254740992', '-9007199254740993', '9007199254740991.1', '-9007199254740991.499', '9007199254740991.0', '1000000000000000000000', '9'.repeat(310)]
/** N is the number. */
export const EXPRESSIONS = ['N', 'a[N]', 'a[ N ]', 'a.b[N].c', 'b[a[N]]', 'a[N]()', 'a[N] === foo-bar', 'foo-bar === a[N]', 'n === N', 'N === n', 'n === N || f()', 'a[N] === f()', '!a[N]', '(a[N])', 'a[N] ?? N', 'a[N] | upper', 'n | oneOf(N)', 'n | oneOf(a[N])', 'n | oneOf(N, )', 'n | oneOf(N) | 1x', 'a[N] | nofilter', 'user-name[N]', '$.a[N]', 'a[N]b']
/** E is the expression: output, statement-shaped brace, raw, const, if, each, filter argument and snippet argument. */
export const FORMS = ['{ E }', '{ E; }', '{@raw E}', '{@const x = E}{ x }', '{#if E}y{/if}', '{#each E as x}{ x }{/each}', '{ n | oneOf(E) }', '{#snippet s(x)}{ x }{/snippet}{@render s(E)}']
/** F is the form. */
export const CONTEXTS = ['<p>F</p>', '<script>if (true) F</script>', '<style>p F</style>']
const DATA = { a: { 7: 'seven', 0: 'zero', b: { 7: { c: 'c' } } }, b: { seven: 'b' }, n: 7 }

export interface Case { readonly source: string; readonly strictBraces: boolean }
/** The message is a digest, to keep the record small. */
type Place = [code: string, message: string, start: number, end: number]
/** `output` is a digest of the rendered text, or of what the render threw. */
export interface Result { readonly output: string | null; readonly error: Place | null; readonly lint: readonly Place[] }
/** 0.5.0 also records where its parser found expressions: a new refusal must stand inside one. */
export interface Recorded extends Result { readonly expressions: readonly [number, number][] }
export interface Compiler {
	readonly default: (source: string, options: { strictBraces: boolean }) => Promise<{ render(data: object): string | Promise<string> }>
	readonly lint: (source: string, options: { strictBraces: boolean }) => Promise<Diagnostic[]>
	readonly parse: (source: { id: string; text: string }) => { children: readonly TemplateNode[] }
	readonly GalleyDiagnosticError: new (...args: never[]) => Error & { diagnostic: Diagnostic }
}

export const corpus = (): Case[] => {
	const cases: Case[] = []
	for (const number of NUMBERS) for (const expression of EXPRESSIONS) for (const form of FORMS) for (const context of CONTEXTS) {
		const source = context.replace('F', () => form.replace('E', () => expression.replaceAll('N', number)))
		for (const strictBraces of [false, true]) cases.push({ source, strictBraces })
	}
	return cases
}
export const corpusDigest = (cases: readonly Case[]): string => new Bun.CryptoHasher('sha256').update(JSON.stringify(cases)).digest('hex')

const digest = (text: string): string => new Bun.CryptoHasher('sha256').update(text).digest('hex').slice(0, 12)
const place = (diagnostic: Diagnostic): Place => [diagnostic.code, digest(diagnostic.message), diagnostic.span.start, diagnostic.span.end]

export const run = async (compiler: Compiler, item: Case): Promise<Result> => {
	const options = { strictBraces: item.strictBraces }
	let output: string | null = null, error: Place | null = null
	try {
		const template = await compiler.default(item.source, options)
		try { output = digest(await template.render(DATA)) }
		catch (thrown) { output = digest(`threw: ${String(thrown)}`) }
	} catch (thrown) {
		if (!(thrown instanceof compiler.GalleyDiagnosticError)) throw thrown
		error = place(thrown.diagnostic)
	}
	return { output, error, lint: (await compiler.lint(item.source, options)).map(place) }
}

const expressionSpans = (compiler: Compiler, source: string): [number, number][] => {
	const spans: [number, number][] = []
	const add = (expression: Expression) => spans.push([expression.span.start, expression.span.end])
	const visit = (nodes: readonly TemplateNode[]): void => {
		for (const node of nodes) {
			if (node.kind === 'output' || node.kind === 'const') add(node.expression)
			else if (node.kind === 'render') node.arguments.forEach(add)
			else if (node.kind === 'if') for (const branch of node.branches) { if (branch.condition) add(branch.condition); visit(branch.children) }
			else if (node.kind === 'each') { add(node.collection); visit(node.children); visit(node.fallback ?? []) }
			else if (node.kind === 'snippet') visit(node.children)
		}
	}
	try { visit(compiler.parse({ id: '<template>', text: source }).children) }
	catch (thrown) { if (!(thrown instanceof compiler.GalleyDiagnosticError)) throw thrown }
	return spans
}

export const record = async (compiler: Compiler, cases: readonly Case[]): Promise<{ corpus: string; results: Recorded[] }> => {
	const results: Recorded[] = []
	for (const item of cases) results.push({ ...await run(compiler, item), expressions: expressionSpans(compiler, item.source) })
	return { corpus: corpusDigest(cases), results }
}

/** The new rule, written independently of the compiler: a leading zero in brackets, or a magnitude above the bound as written. */
const breaksNewRule = (code: string, source: string, start: number, end: number): boolean => {
	const number = source.slice(start, end)
	if (!/^-?\d+(?:\.\d+)?$/.test(number)) return false
	if (code === 'G1106') return /^-?0\d/.test(number) && /\[\s*$/.test(source.slice(0, start)) && /^\s*\]/.test(source.slice(end))
	const [integer = '', fraction = ''] = number.replace('-', '').split('.')
	const bound = String(Number.MAX_SAFE_INTEGER)
	return code === 'G1107' && (integer.length > bound.length || (integer.length === bound.length && (integer > bound || (integer === bound && /[^0]/.test(fraction)))))
}

/** Every case gets one class; any class but `same` and the new refusals is a fault. */
export const classify = (item: Case, before: Recorded, after: Result): string => {
	if (JSON.stringify([before.output, before.error, before.lint]) === JSON.stringify([after.output, after.error, after.lint])) return 'same'
	const error = after.error
	if (before.error || !error || after.output !== null) return 'unexpected: 0.5.0 result changed'
	const [code, , start, end] = error
	if (!breaksNewRule(code, item.source, start, end)) return `unexpected: ${code} for a number the new rule allows`
	if (!before.expressions.some(([from, to]) => from <= start && end <= to)) return `unexpected: ${code} outside an expression 0.5.0 compiled`
	if (JSON.stringify(after.lint) !== JSON.stringify([...before.lint, error])) return `unexpected: lint differs beyond ${code}`
	return `new refusal ${code}${code === 'G1106' ? ' (number in brackets)' : ''}`
}

export const compare = async (compiler: Compiler, recorded: { corpus: string; results: readonly Recorded[] }, cases = corpus()): Promise<{ classes: Record<string, number>; examples: Record<string, string> }> => {
	if (recorded.corpus !== corpusDigest(cases) || recorded.results.length !== cases.length) throw new Error('The recorded 0.5.0 results belong to another corpus; record them again from 0.5.0')
	const classes: Record<string, number> = {}, examples: Record<string, string> = {}
	for (const [index, item] of cases.entries()) {
		const kind = classify(item, recorded.results[index]!, await run(compiler, item))
		classes[kind] = (classes[kind] ?? 0) + 1
		examples[kind] ??= `${JSON.stringify(item.source.length > 200 ? item.source.slice(0, 200) + '…' : item.source)} strictBraces=${item.strictBraces}`
	}
	return { classes, examples }
}

const unexpected = (classes: Record<string, number>): boolean => Object.keys(classes).some(kind => kind.startsWith('unexpected'))

/** `--record <directory>` runs 0.5.0 from a copy of its sources; without arguments the shipped compiler is compared. */
export const main = async (args: readonly string[], file: URL): Promise<boolean> => {
	if (args.length === 2 && args[0] === '--record') {
		const recorded = await record(await import(pathToFileURL(join(args[1]!, 'index.ts')).href) as Compiler, corpus())
		// One row per case: output, error, lint, expressions.
		const rows = recorded.results.map(result => JSON.stringify([result.output, result.error, result.lint, result.expressions]))
		await Bun.write(file, `{"corpus":${JSON.stringify(recorded.corpus)},"rows":[\n${rows.join(',\n')}\n]}\n`)
		console.log(`Recorded ${recorded.results.length} cases`)
		return true
	}
	if (args.length) throw new Error('usage: bun differential/numbers-run.ts [--record <directory with 0.5.0 sources>]')
	const { corpus: digestOfCorpus, rows } = JSON.parse(await Bun.file(file).text()) as { corpus: string; rows: [Result['output'], Result['error'], Result['lint'], Recorded['expressions']][] }
	const results = rows.map(([output, error, lint, expressions]) => ({ output, error, lint, expressions }))
	const report = await compare(await import('../index.js') as Compiler, { corpus: digestOfCorpus, results })
	console.log(JSON.stringify(report, null, 2))
	return !unexpected(report.classes)
}
