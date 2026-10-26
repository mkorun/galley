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

export const analyze = (ast: TemplateAst, dynamicEmptyAttributes = true): TemplateAst => {
	const annotate = (nodes: readonly TemplateNode[], metadata?: Set<LoopMetadata>): readonly TemplateNode[] => {
		let recentText = ''
		let changed: TemplateNode[] | null = null
		for (let index = 0; index < nodes.length; index++) {
			const node = nodes[index]!
			let annotated: TemplateNode = node
			if (node.kind === 'text') recentText += node.value
			if (node.kind === 'output') {
				if (metadata) collectExpressionMetadata(node.expression, metadata)
				if (dynamicEmptyAttributes) {
					const openTag = recentText.slice(recentText.lastIndexOf('<'))
					const tagInitial = openTag.charCodeAt(1) | 32
					if (tagInitial === 109 && /^<meta\b[^>]*\bcontent=(?:"[^"]*|'[^']*)$/i.test(openTag)) annotated = { ...node, emptyAttribute: 'content' }
					else if (tagInitial === 108 && /^<link\b[^>]*\bhref=(?:"[^"]*|'[^']*)$/i.test(openTag)) annotated = { ...node, emptyAttribute: 'href' }
				}
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
			else if (node.kind === 'snippet') {
				const children = annotate(node.children, metadata)
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
