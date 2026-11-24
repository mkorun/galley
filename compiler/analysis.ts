import { LOOP_METADATA } from './ast.js'
import type { LoopMetadata, Expression, IfBranch, SnippetNode, TemplateAst, TemplateNode } from './ast.js'

const collectExpressionMetadata = (expression: Expression, used: Set<LoopMetadata>): void => {
	if (expression.kind === 'path') {
		if (LOOP_METADATA.includes(expression.root as LoopMetadata)) used.add(expression.root as LoopMetadata)
		for (const segment of expression.segments) if (typeof segment.value === 'object') collectExpressionMetadata(segment.value, used)
	} else if (expression.kind === 'unary') collectExpressionMetadata(expression.operand, used)
	else if (expression.kind === 'binary') {
		collectExpressionMetadata(expression.left, used)
		collectExpressionMetadata(expression.right, used)
	} else if (expression.kind === 'pipe') {
		collectExpressionMetadata(expression.input, used)
		for (const pipe of expression.pipes) for (const argument of pipe.args) collectExpressionMetadata(argument, used)
	}
}

/** Whether a node of that kind stands anywhere in the nodes, the bodies of blocks, snippets and loaded partials included. */
export const contains = (nodes: readonly TemplateNode[], kind: 'partial' | 'js'): boolean => nodes.some(node =>
	node.kind === kind
	|| (node.kind === 'if' && node.branches.some(branch => contains(branch.children, kind)))
	|| ((node.kind === 'each' || node.kind === 'snippet' || node.kind === 'partial') && contains(node.children ?? [], kind))
	|| (node.kind === 'each' && contains(node.fallback ?? [], kind)),
)

/** Snippets callable by a visible JS block need a plain function binding as well as their variants. */
export const scriptedSnippets = (nodes: readonly TemplateNode[]): ReadonlySet<SnippetNode> => {
	const scripted = new Set<SnippetNode>()
	// Only unmarked visible bindings need a visit at a JS block. Shadowing temporarily hides them.
	const visible = new Map<string, SnippetNode>(), unmarked = new Set<SnippetNode>()
	const visit = (nodes: readonly TemplateNode[], sameScope = false): void => {
		const local = new Map<string, SnippetNode>(), previous = new Map<string, SnippetNode>()
		const declare = (nodes: readonly TemplateNode[]): void => {
			for (const node of nodes) {
				if (node.kind === 'snippet') local.set(node.name, node)
				else if (node.kind === 'partial') declare(node.children ?? [])
			}
		}
		if (!sameScope) declare(nodes)
		for (const [name, binding] of local) {
			const outer = visible.get(name)
			if (outer) { previous.set(name, outer); unmarked.delete(outer) }
			visible.set(name, binding); unmarked.add(binding)
		}
		for (const node of nodes) {
			if (node.kind === 'js') {
				for (const binding of unmarked) scripted.add(binding)
				unmarked.clear()
			} else if (node.kind === 'partial') visit(node.children ?? [], true)
			else if (node.kind === 'if') for (const branch of node.branches) visit(branch.children)
			else if (node.kind === 'snippet') visit(node.children)
			else if (node.kind === 'each') for (const children of [node.children, node.fallback ?? []]) visit(children)
		}
		for (const [name, binding] of local) { visible.delete(name); unmarked.delete(binding) }
		for (const [name, binding] of previous) {
			visible.set(name, binding)
			if (!scripted.has(binding)) unmarked.add(binding)
		}
	}
	visit(nodes)
	return scripted
}

export const analyze = (ast: TemplateAst): TemplateAst => {
	const annotate = (nodes: readonly TemplateNode[], metadata?: Set<LoopMetadata>): readonly TemplateNode[] => {
		let changed: TemplateNode[] | null = null
		for (let index = 0; index < nodes.length; index++) {
			const node = nodes[index]!
			let annotated: TemplateNode = node
			if (node.kind === 'output') {
				if (metadata) collectExpressionMetadata(node.expression, metadata)
			}
			else if (node.kind === 'const') {
				if (metadata) collectExpressionMetadata(node.expression, metadata)
			}
			else if (node.kind === 'render') {
				if (metadata) for (const argument of node.arguments) collectExpressionMetadata(argument, metadata)
			}
			else if (node.kind === 'if') {
				let branchChanged = false
				const branches: readonly IfBranch[] = node.branches.map(branch => {
					if (metadata && branch.condition) collectExpressionMetadata(branch.condition, metadata)
					const children = annotate(branch.children, metadata)
					if (children === branch.children) return branch
					branchChanged = true
					return { ...branch, children }
				})
				if (branchChanged) annotated = { ...node, branches }
			}
			else if (node.kind === 'each') {
				if (metadata) collectExpressionMetadata(node.collection, metadata)
				const ownMetadata = new Set<LoopMetadata>()
				// The fallback stands outside this loop: a metadata name in it belongs to the enclosing loop, if any.
				annotated = { ...node, children: annotate(node.children, ownMetadata), metadata: ownMetadata, ...(node.fallback ? { fallback: annotate(node.fallback, metadata) } : {}) }
			}
			else if (node.kind === 'snippet' || (node.kind === 'partial' && node.children)) {
				const children = annotate(node.children!, metadata)
				if (children !== node.children) annotated = { ...node, children }
			}
			if (annotated !== node) {
				if (!changed) changed = nodes.slice(0, index) as TemplateNode[]
				changed.push(annotated)
			} else if (changed) changed.push(node)
		}
		return changed ?? nodes
	}
	const children = annotate(ast.children)
	return children === ast.children ? ast : { ...ast, children }
}
