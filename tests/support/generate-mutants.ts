/** Mechanical compiler mutations. Uses the installed TypeScript parser, never text guesses about expressions. */
import ts from 'typescript'
const mutants: { file: string; start: number; end: number; before: string; after: string; kind: string; line: number; id: string }[] = []
for (const file of ['compiler/ast.ts', 'util.ts', 'compiler/filters.ts', 'compiler/stringify.ts', 'compiler/analysis.ts', 'compiler/context.ts', 'compiler/url.ts', 'compiler/codegen.ts', 'compiler/lexer.ts', 'compiler/index.ts', 'compiler/lint.ts', 'compiler/expression.ts', 'compiler/path.ts', 'compiler/parser.ts']) {
	const source = await Bun.file(file).text()
	const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
	const add = (start: number, end: number, after: string, kind: string) => {
		const before = source.slice(start, end)
		if (before === after || mutants.some(m => m.file === file && m.start === start && m.end === end && m.after === after)) return
		const line = ast.getLineAndCharacterOfPosition(start).line + 1
		const context: string[] = []
		const enclosing = (node: ts.Node) => {
			if (node.getStart(ast) > start || node.end < end) return
			if (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) context.push(node.name?.getText(ast) ?? '<anonymous>')
			if (ts.isPropertyAssignment(node)) context.push(`property ${node.name.getText(ast)}`)
			if (ts.isCallExpression(node)) context.push(`call ${node.expression.getText(ast)} argument ${node.arguments.findIndex(arg => arg.getStart(ast) <= start && arg.end >= end)}`)
			if (ts.isBinaryExpression(node)) context.push(`binary ${node.getText(ast)} ${node.left.end >= end ? 'left' : 'right'}`)
			if (ts.isConditionalExpression(node)) context.push(`conditional ${node.getText(ast)} ${node.condition.end >= end ? 'condition' : node.whenTrue.end >= end ? 'then' : 'else'}`)
			if (ts.isCaseClause(node)) context.push(`case ${node.expression.getText(ast)}`)
			ts.forEachChild(node, enclosing)
		}
		enclosing(ast)
		mutants.push({ file, start, end, before, after, kind, line, id: JSON.stringify([file, context, source.slice(source.lastIndexOf('\n', start - 1) + 1, source.indexOf('\n', end) < 0 ? source.length : source.indexOf('\n', end)).trim(), before, after, kind]) })
	}
	const change = (node: ts.Node, after: string, kind: string) => add(node.getStart(ast), node.end, after, kind)
	const flip = (node: ts.Node) => change(node, `!(${node.getText(ast)})`, 'predicate')
	// Compiler walks, grammar additions and URL checkpoint generation.
	const regions = file.endsWith('ast.ts') ? [
		[source.indexOf('export const LOOP_METADATA'), source.indexOf('export interface PathSegment')],
	] : file === 'util.ts' ? [
		[source.indexOf('const oneOf'), source.indexOf('// ── stripWhitespace')],
	] : file.endsWith('stringify.ts') ? [
		[source.indexOf('export const filterWithWarnings'), source.length],
	] : file.endsWith('analysis.ts') ? [
		[source.indexOf('const collectExpressionMetadata'), source.length],
	] : file.endsWith('codegen.ts') ? [
		[source.indexOf('const places:'), source.length],
	] : file.endsWith('lexer.ts') ? [
		[source.indexOf('const inspectLine ='), source.indexOf('const configEnd =')],
		[source.indexOf("if (text.startsWith('{@js}'"), source.indexOf('let kind:')],
	] : file.endsWith('index.ts') ? [[source.indexOf('const codeAllowed'), source.length]] : file.endsWith('parser.ts') ? [
		[source.indexOf("if (!(error instanceof GalleyDiagnosticError) || isNumberDiagnostic(error.diagnostic.code)) throw error\n\t\t\t\t\treturn fail('G2108'"), source.indexOf("return fail('G2108'")],
		[source.indexOf("case 'render':"), source.indexOf("default: return fail('G2100'")],
		[source.indexOf('const parseSnippet'), source.indexOf('const astSpan')],
		// B7a: a missing brace table is an error; only a first-name parse failure becomes G3019.
		[source.indexOf('const literalBraces'), source.indexOf('/** Lexical removals')],
		[source.indexOf('if (isNumberDiagnostic(error.diagnostic.code)) throw error'), source.indexOf('// ADR-015:')],
		[source.indexOf('const braces = new Map<number'), source.indexOf('// ADR-014')],
		// B2: which continuation ends a branch, and the each fallback's parse and source span.
		[source.indexOf('const parseChildren ='), source.indexOf('const children: TemplateNode[]')],
		[source.indexOf("if ((token.kind === 'block-close'"), source.indexOf('\n\t\t\tcursor++')],
		[source.indexOf("case 'continuation':"), source.indexOf('\n\t\treturn { children: joinTexts(children), stop: null }')],
		[source.indexOf("const result = parseChildren('each', 'each')"), source.indexOf('const parseSnippet')],
		// Collection paths use the same first-name check as complete expressions.
		[source.indexOf('for (const name of [item, index])'), source.indexOf('if (index === item)')],
		[source.indexOf('try { collection = parsePath'), source.indexOf("const result = parseChildren('each', 'each')")],
	] : [[0, source.length]]
	if (regions.some(([a,b]) => a! < 0 || b! <= a!)) throw new Error(`Unknown checkpoint region in ${file}`)
	const visit = (node: ts.Node) => {
		// Every grammar caller must retain its own offset, including callers outside the older checkpoint regions.
		if (file === 'compiler/parser.ts' && ts.isCallExpression(node) && node.expression.getText(ast) === 'expressionSpan') {
			change(node.arguments[1]!, '0', 'expression source offset')
			if (node.arguments[2]) change(node.arguments[2], 'undefined', 'expression source length')
		}
		if (file === 'compiler/parser.ts' && ts.isCallExpression(node) && node.expression.getText(ast) === 'parseChildren' && node.arguments[1]) change(node.arguments[1], 'null', 'drop branch continuation')
		if (file === 'compiler/parser.ts' && ts.isBinaryExpression(node) && node.getStart(ast) >= source.indexOf('const expressionSpan') && node.end < source.indexOf('/** Lexical removals')) change(node, node.left.getText(ast), 'span arithmetic')

		if (!regions.some(([a,b]) => node.getStart(ast) >= a! && node.end <= b!)) { ts.forEachChild(node, visit); return }
		if (ts.isExpressionStatement(node)) change(node, ';', 'delete statement')
		if (ts.isReturnStatement(node) && node.expression) change(node.expression, 'undefined', 'drop returned value')
		if (ts.isIfStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node) || ts.isSwitchStatement(node) || ts.isConditionalExpression(node)) flip(ts.isConditionalExpression(node) ? node.condition : node.expression)
		if (ts.isForStatement(node) && node.condition) flip(node.condition)
		if (file === 'compiler/parser.ts' && ts.isIfStatement(node) && node.expression.getText(ast) === "source.text[offset - 1] === '\\\\'") change(node.expression, `(${node.expression.getText(ast)} || source.text[offset - 2] === '\\\\')`, 'nonadjacent brace escape')
		if (ts.isCaseClause(node)) change(node.expression, JSON.stringify('__mutation_unreachable_case__'), 'case comparison')
		if (ts.isBinaryExpression(node)) {
			const op = node.operatorToken.kind
			if ([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.LessThanToken, ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.GreaterThanEqualsToken].includes(op)) flip(node)
			if (op === ts.SyntaxKind.AmpersandAmpersandEqualsToken || op === ts.SyntaxKind.BarBarEqualsToken) {
				change(node, `${node.left.getText(ast)} = ${node.right.getText(ast)}`, 'assignment condition')
				change(node.right, op === ts.SyntaxKind.AmpersandAmpersandEqualsToken ? 'true' : 'false', 'assignment operand')
			}
			if (op === ts.SyntaxKind.AmpersandAmpersandToken || op === ts.SyntaxKind.BarBarToken) {
				const neutral = op === ts.SyntaxKind.AmpersandAmpersandToken ? 'true' : 'false'
				change(node.left, neutral, 'operand'); change(node.right, neutral, 'operand')
			}
		}
		if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) change(node, node.operand.getText(ast), 'negation')
		if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) change(node, node.kind === ts.SyntaxKind.TrueKeyword ? 'false' : 'true', 'boolean')
		if (ts.isCallExpression(node) && node.expression.getText(ast) === 'Math.max' && node.arguments.length === 2) change(node, node.arguments[1]!.getText(ast), 'remove clamp')
		if (file === 'compiler/codegen.ts' && ts.isCallExpression(node)) {
			if (node.expression.getText(ast) === 'checked') change(node, node.arguments[0]!.getText(ast), 'remove undefined check')
			if (node.expression.getText(ast) === 'expressionCode' && node.arguments[2]?.getText(ast) === 'condition') {
				change(node.arguments[2], 'false', 'check condition pipe'); change(node.arguments[2], 'true', 'skip operand pipe check')
			}
		}
		if (file === 'compiler/index.ts' && ts.isCallExpression(node) && ['lintAst', 'readContexts'].includes(node.expression.getText(ast))) change(node, `${node.expression.getText(ast)}(${node.arguments.slice(0, -1).map(arg => arg.getText(ast)).join(', ')})`, 'repeat snippet marking')
		if (file === 'compiler/index.ts' && ts.isCallExpression(node) && ['lintAst', 'generate'].includes(node.expression.getText(ast))) {
			for (const argument of node.arguments) if (argument.getText(ast) === 'allowCode') change(argument, 'options.allowCode', 'repeat code option read')
		}
		if (file === 'compiler/codegen.ts' && ts.isPropertyAssignment(node) && node.name.getText(ast) === 'async' && node.initializer.getText(ast) === 'allowCode') change(node.initializer, '!allowCode', 'async flag')
		// Registry construction and source spans are observable through the public compiler too.
		if (file === 'compiler/filters.ts' && ts.isCallExpression(node)) {
			if (node.expression.getText(ast) === 'Object.create') change(node, '{}', 'registry prototype')
			if (node.expression.getText(ast) === 'Object.freeze') change(node, node.arguments[0]!.getText(ast), 'registry freeze')
		}
		if (file === 'compiler/expression.ts' && ts.isCallExpression(node) && node.expression.getText(ast) === 'pipeOperatorHelp') change(node, 'undefined', 'pipe grouping help')
		if (file === 'compiler/expression.ts' && ts.isCallExpression(node) && node.expression.getText(ast) === 'trimSpan' && node.getStart(ast) > source.indexOf('const parsePiped')) change(node, '{ text: rawInput, span: atInput }', 'untrimmed pipe expression')
		if (file === 'compiler/expression.ts' && ts.isPropertyAssignment(node) && node.name.getText(ast) === 'span' && node.initializer.getText(ast) === 'at' && node.parent.parent.getText(ast).startsWith('node: PipeExpression')) change(node.initializer, 'atInput', 'pipe result span')
		if (file === 'util.ts' && ts.isNumericLiteral(node) && node.text === '100') {
			change(node, '99', 'cache bound below'); change(node, '101', 'cache bound above')
		}
		if (file === 'compiler/expression.ts' && ts.isPropertyAssignment(node) && node.name.getText(ast) === 'span' && node.initializer.getText(ast) === 'at' && node.parent.parent.getText(ast).startsWith('return { name,')) change(node.initializer, 'atInput', 'pipe name span')
		if (file === 'compiler/lint.ts' && ts.isPropertyAssignment(node) && node.name.getText(ast) === 'span' && node.initializer.getText(ast) === 'expr.span') change(node.initializer, 'input.span', 'pipe expression span')
		if (ts.isArrayLiteralExpression(node) && node.elements.length && node.elements.every(ts.isStringLiteral)) {
			for (const member of node.elements) change(node, `[${node.elements.filter(x => x !== member).map(x => x.getText(ast)).join(', ')}]`, `set ${member.getText(ast)}`)
		}
		// Comparisons inside generated JavaScript live in template/string token text rather than TS expressions.
		if (file.endsWith('codegen.ts') && (ts.isStringLiteral(node) || ts.isTemplateLiteralToken(node))) {
			const raw = node.getText(ast)
			if (raw.includes('return v;')) change(node, raw.replace('return v;', 'return undefined;'), 'drop checked value')
			for (const match of raw.matchAll(/\+1\b/g)) change(node, raw.slice(0, match.index) + raw.slice(match.index! + 2), 'drop generated one-based offset')
			for (const match of raw.matchAll(/,\$\$[A-Za-z0-9_]+=(?:null|0|false)(?=[,;])/g)) change(node, raw.slice(0, match.index) + raw.slice(match.index! + match[0].length), `drop generated declaration ${match[0]}`)
			const inverse: Record<string,string> = { '!==': '===', '===': '!==', '!=': '==', '==': '!=', '>=': '<', '<=': '>', '>': '<=', '<': '>=' }
			for (const match of raw.matchAll(/!==|===|!=|==|>=|<=|>|</g)) {
				if (match[0] === '>' && raw[match.index! - 1] === '=') continue // Arrow syntax is not a comparison.
				change(node, raw.slice(0, match.index) + inverse[match[0]] + raw.slice(match.index! + match[0].length), `generated comparison ${match.index}`)
			}
			for (const match of raw.matchAll(/&&=|\|\|=/g)) change(node, raw.slice(0, match.index) + '=' + raw.slice(match.index! + 3), `generated assignment ${match.index}`)
			const fragment = raw.replace(/^[`'"}]/, ' ').replace(/\$\{$/, '  ').replace(/[`'"]$/, ' ')
			const js = ts.createSourceFile('generated.js', fragment, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
			const generated = (part: ts.Node) => {
				if (ts.isBinaryExpression(part) && (part.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken || part.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
					const neutral = part.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ? 'true' : 'false'
					for (const operand of [part.left, part.right]) {
						const start = operand.getStart(js), end = operand.end
						if (end > start) change(node, raw.slice(0, start) + neutral + raw.slice(end), `generated operand ${start}`)
					}
				}
				ts.forEachChild(part, generated)
			}
			generated(js)
		}
		if (ts.isNewExpression(node) && node.expression.getText(ast) === 'Set' && node.arguments?.length && !ts.isArrayLiteralExpression(node.arguments[0]!)) throw new Error(`Unsupported set construction: ${node.getText(ast)}`)
		if (ts.isNewExpression(node) && node.expression.getText(ast) === 'Set' && node.arguments?.[0] && ts.isArrayLiteralExpression(node.arguments[0])) {
			const array = node.arguments[0]
			if (!array.elements.every(ts.isStringLiteral)) throw new Error(`Unsupported set members: ${node.getText(ast)}`)
			for (const member of array.elements) change(array, `[${array.elements.filter(x => x !== member).map(x => x.getText(ast)).join(', ')}]`, `set ${member.getText(ast)}`)
		}
		if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'key' && node.initializer && ts.isCallExpression(node.initializer)) {
			const array = node.initializer.arguments[0]
			if (!array || !ts.isArrayLiteralExpression(array)) throw new Error('Unknown variant key shape')
			for (const member of array.elements) change(array, `[${array.elements.filter(x => x !== member).map(x => x.getText(ast)).join(', ')}]`, `key ${member.getText(ast)}`)
		}
		if (node.kind === ts.SyntaxKind.RegularExpressionLiteral) {
			const raw = node.getText(ast)
			if (raw.includes('\\]')) throw new Error(`Unsupported escaped class terminator: ${raw}`)
			// Enumerate class atoms, expanding literal ASCII ranges so every code point gets its own deletion.
			const classes = /\[(\^?)([^\]]*)\]/g
			for (const match of raw.matchAll(classes)) {
				if (/\\[pPsSdDwW]|\\\]/.test(match[2]!)) throw new Error(`Unsupported character class: ${raw}`)
				const atoms = match[2]!.match(/\\(?:u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)|[^\\]/g) ?? []
				const members: string[] = []
				for (let i = 0; i < atoms.length; i++) {
					if (atoms[i + 1] === '-' && atoms[i]!.length === 1 && atoms[i + 2]?.length === 1) {
						for (let c = atoms[i]!.charCodeAt(0); c <= atoms[i + 2]!.charCodeAt(0); c++) members.push(String.fromCharCode(c))
						i += 2
					} else members.push(atoms[i]!)
				}
				for (let i = 0; i < members.length; i++) {
					const replacement = '[' + match[1] + members.filter((_, j) => i !== j).join('') + ']'
					change(node, raw.slice(0, match.index) + replacement + raw.slice(match.index! + match[0].length), `class ${JSON.stringify(members[i])}`)
				}
			}
		}
		ts.forEachChild(node, visit)
	}
	visit(ast)
}
// Repeated statements in the same function need stable occurrence numbers, independent of source line numbers.
const occurrences = new Map<string, typeof mutants>()
for (const mutant of mutants) {
	const group = occurrences.get(mutant.id) ?? []
	group.push(mutant); occurrences.set(mutant.id, group)
}
for (const group of occurrences.values()) if (group.length > 1) {
	for (const [index, mutant] of group.entries()) mutant.id = JSON.stringify([...JSON.parse(mutant.id), index])
}
if (new Set(mutants.map(mutant => mutant.id)).size !== mutants.length) throw new Error('Ambiguous mutation context')
console.log(JSON.stringify(mutants))
