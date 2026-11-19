/** A deterministic loop budget makes nontermination mutants fail assertions without a wall-clock kill. */
import ts from 'typescript'
import { plugin } from 'bun'
let remaining = 5_000_000
;globalThis.__mutationStep = () => { if (--remaining < 0) throw new Error('G-32: deterministic loop budget exhausted') }
plugin({ name: 'mutation-loop-budget', setup(build) {
	build.onLoad({ filter: /\/compiler\/[^/]+\.ts$/ }, async args => {
		let contents = await Bun.file(args.path).text()
		const ast = ts.createSourceFile(args.path, contents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
		const edits: { at: number; text: string }[] = []
		const visit = (node: ts.Node) => {
			if (ts.isIterationStatement(node, false)) {
				if (ts.isBlock(node.statement)) edits.push({ at: node.statement.getStart(ast) + 1, text: ';globalThis.__mutationStep();' })
				else edits.push({ at: node.statement.getStart(ast), text: '{globalThis.__mutationStep();' }, { at: node.statement.end, text: '}' })
			}
			ts.forEachChild(node, visit)
		}
		visit(ast)
		for (const edit of edits.sort((a,b) => b.at-a.at)) contents = contents.slice(0, edit.at) + edit.text + contents.slice(edit.at)
		return { contents, loader: 'ts' }
	})
} })
