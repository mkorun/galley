import type { Expression, PathExpression, TemplateAst, TemplateNode } from './ast.js'
import { fail } from './diagnostics.js'

export interface GeneratedProgram { readonly body: string; readonly async: boolean }

const escapeJs = (value: string): string => /[\\'\n\r\u2028\u2029]/.test(value)
	? value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')
		.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
	: value

const isIdentifier = (value: string): boolean => {
	let code = value.charCodeAt(0)
	if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 95 || code === 36)) return false
	for (let index = 1; index < value.length; index++) {
		code = value.charCodeAt(index)
		if (!((code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code === 95 || code === 36)) return false
	}
	return true
}

const safeProperty = (value: string): string => isIdentifier(value) ? `?.${value}` : `?.[${JSON.stringify(value)}]`

const pathCode = (path: PathExpression, scope: readonly string[]): string => {
	let code = scope.includes(path.root) ? path.root : `$${safeProperty(path.root)}`
	for (const segment of path.segments) {
		if (segment.kind === 'property') code += safeProperty(segment.value as string)
		else if (typeof segment.value === 'number') code += `?.[${segment.value}]`
		else if (typeof segment.value === 'string') code += `?.[${JSON.stringify(segment.value)}]`
		else code += `?.[${pathCode(segment.value, scope)}]`
	}
	return code
}

const expressionCode = (expression: Expression, scope: readonly string[]): string => {
	switch (expression.kind) {
		case 'path': return pathCode(expression, scope)
		case 'literal': return expression.raw
		case 'unary': return `!(${expressionCode(expression.operand, scope)})`
		case 'binary': return `(${expressionCode(expression.left, scope)}${expression.operator}${expressionCode(expression.right, scope)})`
		case 'pipe': return expression.pipes.reduce((input, pipe) =>
			`$$filters.${pipe.name}(${input}${pipe.args.map(arg => `,${expressionCode(arg, scope)}`).join('')})`, expressionCode(expression.input, scope))
	}
}

export const generate = (ast: TemplateAst, options: { readonly allowCode?: boolean; readonly strip?: boolean; readonly stripEmptyMeta?: boolean; readonly debug?: boolean } = {}): GeneratedProgram => {
	let body = "'use strict';$??={};let $$='';"
	if (options.debug) body += '// [galley] AST compiler debug output\n'
	const markerOpen = '\uE000galley-meta\uE001', markerClose = '\uE002galley-meta\uE003'
	let hasContentAttribute = false, hasHrefAttribute = false
	let sequence = 0
	let isAsync = false

	const emitNodes = (nodes: readonly TemplateNode[], scope: string[], buffer: string): void => {
		for (const node of nodes) {
			switch (node.kind) {
				case 'text': body += `${buffer}+='${escapeJs(node.value)}';`; break
				case 'output': {
					const value = `$$v${++sequence}`
					const expr = expressionCode(node.expression, scope)
					if (node.emptyAttribute === 'content') hasContentAttribute = true
					if (node.emptyAttribute === 'href') hasHrefAttribute = true
					if (node.emptyAttribute) body += `${buffer}+='${markerOpen}';`
					if (node.raw) body += `${buffer}+=(${expr}??'');`
					else body += `{const ${value}=${expr};${buffer}+=${value}==null?'':String(${value}).replace(/[&<>'"]/g,c=>$$html[c]);}`
					if (node.emptyAttribute) body += `${buffer}+='${markerClose}';`
					break
				}
				case 'const': body += `const ${node.name}=(${expressionCode(node.expression, scope)}??'');`; scope.push(node.name); break
				case 'if': {
					node.branches.forEach((branch, index) => {
						body += index === 0 ? `if(${expressionCode(branch.condition!, scope)}){` : branch.condition ? `else if(${expressionCode(branch.condition, scope)}){` : 'else{'
						emitNodes(branch.children, scope.slice(), buffer)
						body += '}'
					})
					break
				}
				case 'each': {
					const id = ++sequence, collection = `$$l${id}`, array = `$$a${id}`, count = `$$c${id}`
					const metadata = node.metadata ?? new Set<'length' | 'isFirst' | 'isLast'>()
					const needsCount = metadata.size > 0
					const needsCounter = metadata.has('isFirst') || metadata.has('isLast')
					body += `{const ${collection}=${pathCode(node.collection, scope)};if(${collection}){const ${array}=Array.isArray(${collection});`
					if (needsCount) body += `const ${count}=${array}?${collection}.length:Object.keys(${collection}).length;`
					const childScope = scope.slice(); childScope.push(node.item); if (node.index) childScope.push(node.index); for (const name of metadata) childScope.push(name)
					if (needsCounter) body += `let $$n${id}=0;`
					if (node.index) body += `for(const [${node.index},${node.item}] of ${array}?${collection}.entries():Object.entries(${collection})){`
					else body += `for(const ${node.item} of (${array}?${collection}:Object.values(${collection}))){`
					if (metadata.has('length')) body += `const length=${count};`
					if (metadata.has('isFirst')) body += `const isFirst=$$n${id}===0;`
					if (metadata.has('isLast')) body += `const isLast=$$n${id}===${count}-1;`
					emitNodes(node.children, childScope, buffer)
					body += `${needsCounter ? `$$n${id}++;` : ''}}}}`
					break
				}
				case 'snippet': {
					const snippetBuffer = `$$s${++sequence}`
					body += `function ${node.name}(${node.param ?? ''}){let ${snippetBuffer}='';`
					const childScope = scope.slice(); if (node.param) childScope.push(node.param)
					emitNodes(node.children, childScope, snippetBuffer)
					body += `return ${snippetBuffer};}`
					break
				}
				case 'render': body += `${buffer}+=(${node.name}(${node.argument ? expressionCode(node.argument, scope) : ''})??'');`; break
				case 'js':
					if (!options.allowCode) fail('G4001', '{@js} cannot be generated while allowCode is false', node.span, 'Enable allowCode only for trusted templates.')
					isAsync ||= node.awaits
					body += `${buffer}+=(${node.awaits ? `await (async()=>{${node.code}})()` : `(()=>{${node.code}})()`}??'');`
					break
				case 'partial': fail('G4002', `Partial ${JSON.stringify(node.path)} was not expanded before code generation`, node.span)
			}
		}
	}

	// '$' is seeded as an always-in-scope root so a path rooted at exactly "$"
	// addresses the data parameter itself, not a property literally named "$".
	emitNodes(ast.children, ['$'], '$$')
	if (options.strip) body += '$$=$$filters.stripWhitespace($$);'
	if (options.stripEmptyMeta !== false && hasContentAttribute) body += `$$=$$.replace(/[ \\t]*<meta\\b[^<>]*\\bcontent=(?:"(?:${markerOpen}|${markerClose})+"|'(?:${markerOpen}|${markerClose})+')[^<>]*\\/?>(?:\\r?\\n)?/g,'');`
	if (options.stripEmptyMeta !== false && hasHrefAttribute) body += `$$=$$.replace(/[ \\t]*<link\\b[^<>]*\\bhref=(?:"(?:${markerOpen}|${markerClose})+"|'(?:${markerOpen}|${markerClose})+')[^<>]*\\/?>(?:\\r?\\n)?/g,'');`
	if (hasContentAttribute || hasHrefAttribute) body += `$$=$$.split('${markerOpen}').join('').split('${markerClose}').join('');`
	body += 'return $$;'
	return { body, async: isAsync || options.allowCode === true }
}
