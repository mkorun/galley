import type { TemplateAst, TemplateNode } from './ast.js'
import { analyze } from './analysis.js'
import { generate } from './codegen.js'
import { GalleyDiagnosticError } from './diagnostics.js'
import { lintAst } from './lint.js'
import { parse } from './parser.js'
import type { CompileOptions, CompiledTemplate, Diagnostic, FilterMap, LintOptions, SourceFile } from './types.js'

export type * from './ast.js'
export type * from './types.js'
export { GalleyDiagnosticError, formatDiagnostic, locate } from './diagnostics.js'
export { lex } from './lexer.js'
export { parse } from './parser.js'

const HTML: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;' }

const expandPartials = async (ast: TemplateAst, options: CompileOptions): Promise<TemplateAst> => {
	const containsPartial = (nodes: readonly TemplateNode[]): boolean => nodes.some(node =>
		node.kind === 'partial'
		|| (node.kind === 'if' && node.branches.some(branch => containsPartial(branch.children)))
		|| ((node.kind === 'each' || node.kind === 'snippet') && containsPartial(node.children)),
	)
	if (!containsPartial(ast.children)) return ast
	const expand = async (nodes: readonly TemplateNode[]): Promise<readonly TemplateNode[]> => {
		const result: TemplateNode[] = []
		for (const node of nodes) {
			if (node.kind === 'partial') {
				if (!options.includes) throw new GalleyDiagnosticError({ code: 'G5001', severity: 'error', message: `Cannot load partial ${JSON.stringify(node.path)} without an include resolver`, span: node.span, help: 'Pass options.includes.import when the template uses {@partial}.' })
				const path = `${options.includes.basedir ?? '.'}/${node.path}`
				const text = await options.includes.import(path, 'utf-8')
				const source: SourceFile = { id: path, text }
				result.push(...await expand(parse(source).children))
			} else if (node.kind === 'if') {
				result.push({ ...node, branches: await Promise.all(node.branches.map(async branch => ({ ...branch, children: await expand(branch.children) }))) })
			} else if (node.kind === 'each' || node.kind === 'snippet') result.push({ ...node, children: await expand(node.children) })
			else result.push(node)
		}
		return result
	}
	return { ...ast, children: await expand(ast.children) }
}

export const lint = (template: string, options: LintOptions & { readonly sourceId?: string } = {}): readonly Diagnostic[] => {
	try {
		const source: SourceFile = { id: options.sourceId ?? '<template>', text: template }
		return lintAst(parse(source), options)
	} catch (error) {
		if (error instanceof GalleyDiagnosticError) return [error.diagnostic]
		throw error
	}
}

export default async function galley<
	Data extends object = Record<string, unknown>,
	Filters extends object = FilterMap,
>(template = '', options: CompileOptions = {}): Promise<CompiledTemplate<Data, Filters>> {
	const source: SourceFile = { id: options.sourceId ?? '<template>', text: template }
	const initial = parse(source)
	const parsed = template.includes('{@partial') ? await expandPartials(initial, options) : initial
	const ast = analyze(parsed, options.stripEmptyMeta !== false)
	const diagnostics = lintAst(ast, {
		allowCode: options.allowCode === true,
		...(options.knownFilters ? { knownFilters: options.knownFilters } : {}),
	})
	const fatal = diagnostics.find(diagnostic => diagnostic.severity === 'error')
	if (fatal) throw new GalleyDiagnosticError(fatal)
	const program = generate(ast, options)
	if (program.async) {
		const render = new Function('$$html', `return async function($,$$filters){${program.body}}`)(HTML) as (data: Data, filters: Filters) => Promise<string>
		return { async: true, diagnostics, render, ...(options.debug ? { source: program.body } : {}) }
	}
	const render = new Function('$$html', `return function($,$$filters){${program.body}}`)(HTML) as (data: Data, filters: Filters) => string
	return { async: false, diagnostics, render, ...(options.debug ? { source: program.body } : {}) }
}
