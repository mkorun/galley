import type { Expression, IfBranch, TemplateAst, TemplateNode } from './ast.js'

type LoopMetadata = 'length' | 'isFirst' | 'isLast'
const LOOP_METADATA: ReadonlySet<string> = new Set<LoopMetadata>(['length', 'isFirst', 'isLast'])

const collectExpressionMetadata = (expression: Expression, used: Set<LoopMetadata>): void => {
	if (expression.kind === 'path') {
		if (LOOP_METADATA.has(expression.root)) used.add(expression.root as LoopMetadata)
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
	|| ((node.kind === 'each' || node.kind === 'snippet' || node.kind === 'partial') && contains(node.children ?? [], kind)),
)

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
				if (metadata && node.argument) collectExpressionMetadata(node.argument, metadata)
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
				const ownMetadata = new Set<LoopMetadata>()
				annotated = { ...node, children: annotate(node.children, ownMetadata), metadata: ownMetadata }
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
