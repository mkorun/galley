import type { Expression, TemplateAst, TemplateNode } from './ast.js'
import { scriptedSnippets } from './analysis.js'
import { locate } from './diagnostics.js'
import type { Diagnostic, LintOptions, SourceSpan } from './types.js'

/** Names used by generated runtime calls must not be shadowed by template declarations. */
const GENERATED_GLOBALS = new Set(['String', 'Object', 'Array', 'TypeError', 'undefined'])

export const lintAst = (ast: TemplateAst, options: LintOptions = {}): readonly Diagnostic[] => {
	const diagnostics: Diagnostic[] = []
	type Snippet = TemplateNode & { kind: 'snippet' }
	interface Scope { readonly parent: Scope | null; readonly snippets: Map<string, Snippet>; readonly names: Map<string, readonly SourceSpan[]> }
	const declarations = new Set<Snippet>()
	const used = new Set<Snippet>()
	const duplicate = new Set<Snippet>()
	const scripted = scriptedSnippets(ast.children)
	const invalidNames = new Map<string, boolean>()
	const binding = (name: string, at: SourceSpan): void => {
		if (!invalidNames.has(name)) {
			let invalid = GENERATED_GLOBALS.has(name)
			try { new Function(`return async function(){'use strict';let ${name};}`) }
			catch (error) {
				if (!(error instanceof SyntaxError)) throw error
				invalid = true
			}
			invalidNames.set(name, invalid)
		}
		if (invalidNames.get(name)) report({ code: 'G3007', severity: 'error', message: `The name ${name} cannot be bound by the generated code`, span: at, help: `Choose a name allowed in strict async JavaScript outside ${[...GENERATED_GLOBALS].join(', ')}.` })
	}
	const report = (diagnostic: Diagnostic) => diagnostics.push(diagnostic)
	// parseCore builds pipe inputs and unary/binary operands without pipes; only arguments can nest pipes.
	const expression = (expr: Expression) => {
		if (expr.kind === 'pipe') {
			for (const pipe of expr.pipes) {
				if (options.knownFilters && !options.knownFilters.has(pipe.name)) report({ code: 'G3001', severity: 'warning', message: `Unknown pipe ${JSON.stringify(pipe.name)}`, span: pipe.span, help: 'Check the spelling or add the custom filter to knownFilters.' })
				for (const arg of pipe.args) expression(arg)
			}
		}
	}
	const resolve = (scope: Scope, name: string): Snippet | undefined => {
		for (let current: Scope | null = scope; current; current = current.parent) {
			const snippet = current.snippets.get(name)
			if (snippet) return snippet
		}
		return undefined
	}
	const declaration = (sites: readonly SourceSpan[]): string => sites.map((at, index) => {
		const { line, column } = locate(at.source, at.start)
		return `${index < sites.length - 1 ? at.source.text.slice(at.start, at.end) + ' at ' : ''}${at.source.id}:${line}:${column}`
	}).join(' -> ')
	const visit = (nodes: readonly TemplateNode[], parent: Scope | null, sameScope = false, names = new Map<string, readonly SourceSpan[]>(), partials: readonly SourceSpan[] = []) => {
		const local = sameScope ? parent!.snippets : new Map<string, Snippet>()
		const declare = (items: readonly TemplateNode[]): void => {
			for (const node of items) {
				if (node.kind === 'partial' && node.children) { declare(node.children); continue }
				if (node.kind !== 'snippet') continue
				declarations.add(node)
				if (local.has(node.name)) {
					duplicate.add(node)
					report({ code: 'G3003', severity: 'error', message: `Duplicate snippet ${JSON.stringify(node.name)} in the same block`, span: node.span, help: 'Rename one snippet or move it to a different lexical block.' })
				} else local.set(node.name, node)
			}
		}
		if (!sameScope) declare(nodes)
		const scope: Scope = sameScope ? parent! : { parent, snippets: local, names }
		for (const node of nodes) {
			if (node.kind === 'const' || (node.kind === 'snippet' && scripted.has(node))) {
				binding(node.name, node.span)
				const sites = [...partials, node.span], previous = scope.names.get(node.name)
				if (previous) report({ code: 'G3021', severity: 'error', message: `The name ${node.name} is declared twice in the same generated scope: ${declaration(previous)} and ${declaration(sites)}`, span: node.span, help: 'Use distinct names or put the declarations or partial inclusions in separate blocks.' })
				scope.names.set(node.name, sites)
			}
			switch (node.kind) {
				case 'output': expression(node.expression); if (node.raw) report({ code: 'G3002', severity: 'info', message: 'Raw output bypasses HTML escaping', span: node.span, help: 'Use raw output only for trusted HTML.' }); break
				case 'const': expression(node.expression); break
				case 'if': for (const branch of node.branches) { if (branch.condition) expression(branch.condition); visit(branch.children, scope, false, undefined, partials) } break
				case 'each':
					binding(node.item, node.span); if (node.index) binding(node.index, node.span)
					visit(node.children, scope, false, new Map(['length', 'isFirst', 'isLast'].map(name => [name, [...partials, node.span]])), partials);
					if (node.fallback) visit(node.fallback, scope, false, undefined, partials); break
				case 'partial': if (node.children) visit(node.children, scope, true, undefined, [...partials, node.span]); break
				case 'snippet': {
					const names = new Map<string, readonly SourceSpan[]>()
					if (node.param) { binding(node.param, node.span); names.set(node.param, [...partials, node.span]) }
					visit(node.children, scope, false, names, partials); break
				}
				case 'render': {
					const snippet = resolve(scope, node.name)
					if (snippet) used.add(snippet)
					else report({ code: 'G3005', severity: 'error', message: `Snippet ${JSON.stringify(node.name)} is not visible in this block`, span: node.span, help: 'Declare the snippet in this block or an enclosing block before rendering it.' })
					if (node.argument) expression(node.argument)
					break
				}
				case 'js': if (!options.allowCode) report({ code: 'G3004', severity: 'error', message: '{@js} requires allowCode: true', span: node.span }); break
			}
		}
	}
	visit(ast.children, null)
	for (const node of declarations) if (!used.has(node) && !duplicate.has(node)) report({ code: 'G3006', severity: 'warning', message: `Snippet ${JSON.stringify(node.name)} is never rendered`, span: node.span })
	return diagnostics
}
