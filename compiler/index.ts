import type { TemplateAst, TemplateNode } from './ast.js'
import { analyze, contains } from './analysis.js'
import { readContexts } from './context.js'
import { UrlPrefix } from './url.js'
import { stringify, filterWithWarnings } from './stringify.js'
import { generate } from './codegen.js'
import { GalleyDiagnosticError } from './diagnostics.js'
import { lintAst } from './lint.js'
import { stripText } from './text.js'
import { parse } from './parser.js'
import type { CompileOptions, CompiledTemplate, Diagnostic, FilterMap, SourceFile } from './types.js'

export type * from './ast.js'
export type * from './types.js'
export { GalleyDiagnosticError, formatDiagnostic, locate } from './diagnostics.js'
export { lex } from './lexer.js'
export { parse } from './parser.js'

const HTML: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' }

const expandPartials = async (ast: TemplateAst, options: CompileOptions): Promise<TemplateAst> => {
	if (!contains(ast.children, 'partial')) return ast
	// chain: the partials open around these nodes, so that one that includes itself is named, not followed for ever
	const expand = async (nodes: readonly TemplateNode[], chain: readonly string[]): Promise<readonly TemplateNode[]> => {
		const result: TemplateNode[] = []
		for (const node of nodes) {
			if (node.kind === 'partial') {
				if (!options.includes) throw new GalleyDiagnosticError({ code: 'G5001', severity: 'error', message: `Cannot load partial ${JSON.stringify(node.path)} without an include resolver`, span: node.span, help: 'Pass options.includes.import when the template uses {@partial}.' })
				const path = `${options.includes.basedir ?? '.'}/${node.path}`
				if (chain.includes(path)) throw new GalleyDiagnosticError({ code: 'G4003', severity: 'error', message: `Partial ${JSON.stringify(node.path)} includes itself: ${[...chain, path].join(' → ')}`, span: node.span })
				const text = await options.includes.import(path, 'utf-8')
				const source: SourceFile = { id: path, text }
				result.push({ ...node, children: await expand(parse(source).children, [...chain, path]) })
			} else if (node.kind === 'if') {
				result.push({ ...node, branches: await Promise.all(node.branches.map(async branch => ({ ...branch, children: await expand(branch.children, chain) }))) })
			} else if (node.kind === 'each') result.push({ ...node, children: await expand(node.children, chain), ...(node.fallback ? { fallback: await expand(node.fallback, chain) } : {}) })
			else if (node.kind === 'snippet') result.push({ ...node, children: await expand(node.children, chain) })
			else result.push(node)
		}
		return result
	}
	return { ...ast, children: await expand(ast.children, []) }
}

/** Whitespace is removed before reading, only from literal text; values retain all their bytes. */
const stripStatic = (nodes: readonly TemplateNode[], root = false): readonly TemplateNode[] => nodes.map((node, index) => {
	if (node.kind === 'text') return stripText(node, root && index === nodes.length - 1)
	if (node.kind === 'if') return { ...node, branches: node.branches.map(branch => ({ ...branch, children: stripStatic(branch.children) })) }
	if (node.kind === 'each') return { ...node, children: stripStatic(node.children), ...(node.fallback ? { fallback: stripStatic(node.fallback) } : {}) }
	if (node.kind === 'snippet') return { ...node, children: stripStatic(node.children) }
	if (node.kind === 'partial') return { ...node, children: stripStatic(node.children ?? []) }
	return node
})

/** Lint uses the compiler's reader; unresolved partials preserve their entry context. */
export async function lint(template: string, options: CompileOptions = {}): Promise<Diagnostic[]> {
	const diagnostics: Diagnostic[] = []
	try {
		const parsed = parse({ id: options.sourceId ?? '<template>', text: template })
		const ast = analyze(options.includes ? await expandPartials(parsed, options) : parsed)
		diagnostics.push(...lintAst(ast, options))
		if (!diagnostics.some(item => item.severity === 'error')) {
			const prepared = options.strip ? { ...ast, children: stripStatic(ast.children, true) } : ast
			readContexts(prepared)
		}
	} catch (error) {
		if (!(error instanceof GalleyDiagnosticError)) throw error
		diagnostics.push(error.diagnostic)
	}
	return diagnostics
}

export default async function galley<
	Data extends object = Record<string, unknown>,
	Filters extends object = FilterMap,
>(template = '', options: CompileOptions = {}): Promise<CompiledTemplate<Data, Filters>> {
	const source: SourceFile = { id: options.sourceId ?? '<template>', text: template }
	const initial = parse(source)
	const parsed = await expandPartials(initial, options)
	const ast = analyze(parsed)
	const diagnostics = lintAst(ast, {
		allowCode: options.allowCode === true,
		...(options.knownFilters ? { knownFilters: options.knownFilters } : {}),
	})
	const fatal = diagnostics.find(diagnostic => diagnostic.severity === 'error')
	if (fatal) throw new GalleyDiagnosticError(fatal)
	const prepared = options.strip ? { ...ast, children: stripStatic(ast.children, true) } : ast
	const program = generate(readContexts(prepared), options)
	if (program.async) {
		const render = new Function('$$html', '$$UrlPrefix', '$$stringify', '$$filterWithWarnings', `return async function($,$$filters){${program.body}}`)(HTML, UrlPrefix, stringify, filterWithWarnings) as (data: Data, filters: Filters) => Promise<string>
		return { async: true, diagnostics, render, ...(options.debug ? { source: program.body } : {}) }
	}
	const render = new Function('$$html', '$$UrlPrefix', '$$stringify', '$$filterWithWarnings', `return function($,$$filters){${program.body}}`)(HTML, UrlPrefix, stringify, filterWithWarnings) as (data: Data, filters: Filters) => string
	return { async: false, diagnostics, render, ...(options.debug ? { source: program.body } : {}) }
}
