import { expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as galley from '../index.js'
import { classify, compare, corpus, corpusDigest, main, record, run, type Compiler, type Recorded } from '../differential/numbers.js'

const compiler = galley as unknown as Compiler
const recorded = new URL('../differential/NUMBERS-0.5.0.json', import.meta.url)

test('against recorded 0.5.0, numbers differ only by the new refusals, in tags 0.5.0 compiled', () => {
	// The full corpus runs in its own process: the campaign's loop budget is shared by the whole test process.
	const result = Bun.spawnSync(['bun', 'differential/numbers-run.ts'], { cwd: join(import.meta.dir, '..'), stdout: 'pipe', stderr: 'pipe', timeout: 60000 })
	expect(new TextDecoder().decode(result.stderr)).toBe('')
	expect(result.exitCode).toBe(0)
	const report = JSON.parse(new TextDecoder().decode(result.stdout))
	expect(report.classes).toEqual({
		same: 31472,
		'new refusal G1106 (number in brackets)': 768,
		'new refusal G1106 (number in brackets) in lint, beside the error galley keeps': 48,
		'new refusal G1107': 2704,
		'new refusal G1107 in lint, beside the error galley keeps': 160,
	})
	expect(report.examples).toEqual({
		same: '"<p>{ 7 }</p>" strictBraces=false',
		'new refusal G1106 (number in brackets)': '"<p>{ a[007] }</p>" strictBraces=false',
		'new refusal G1106 (number in brackets) in lint, beside the error galley keeps': '"<p>{ a[007] }{@js}return (;{@js}</p>" strictBraces=false allowCode',
		'new refusal G1107': '"<p>{@raw 9007199254740992}</p>" strictBraces=false',
		'new refusal G1107 in lint, beside the error galley keeps': '"<p>{ a[9007199254740992] }{@js}return (;{@js}</p>" strictBraces=false allowCode',
	})
}, 70000)

const recordedCase = async (index: number): Promise<Recorded> => {
	const { cases, rows } = JSON.parse(await Bun.file(recorded).text()) as { cases: number[]; rows: [Recorded['output'], Recorded['error'], Recorded['lint'], Recorded['numbers']][] }
	const [output, error, lint, numbers] = rows[cases[index]!]!
	return { output, error, lint, numbers }
}
const find = (source: string, strictBraces = false): number => {
	const index = corpus().findIndex(item => item.source === source && item.strictBraces === strictBraces)
	expect(index).toBeGreaterThanOrEqual(0)
	return index
}

test('the review cases are in the corpus and stay as 0.5.0 left them', async () => {
	for (const source of ['<script>if (true) { a[9007199254740992] === foo-bar }</script>', '<script>if (true) { a[007] === foo-bar }</script>', '<p>{ n === 007 || f() }</p>', '<p>{ 9007199254740992 }{@js}return (;{@js}</p>', "<p>{ a['9007199254740992'] }</p>", "<p>{ a['[007]'] }</p>"]) {
		for (const strictBraces of [false, true]) {
			const index = find(source, strictBraces)
			expect(classify(corpus()[index]!, await recordedCase(index), await run(compiler, corpus()[index]!))).toBe('same')
		}
	}
})

test('planted faults: a refusal on a quoted key and a changed help text are caught', async () => {
	// The compiler refusing the number inside a quoted key, at that number's place.
	for (const source of ["<p>{ a['9007199254740992'] }</p>", "<p>{ a['[007]'] }</p>"]) {
		const index = find(source), item = corpus()[index]!, at = source.search(/\d/), length = source.includes('[007]') ? 3 : 16
		const code = length === 3 ? 'G1106' : 'G1107'
		const refusal = [code, 'error', 'digest', '<template>', at, at + length] as const
		const after = { output: null, error: [...refusal] as never, lint: [[...refusal]] as never }
		expect(classify(item, await recordedCase(index), after)).toBe(`unexpected: ${code} on no ${code === 'G1106' ? 'number in brackets' : 'number'} of 0.5.0's parse`)
	}
	// The same diagnostic with another help text.
	const index = find('<p>{ user-name[7] }</p>'), item = corpus()[index]!
	const changed = { ...compiler, default: (source: string, options: never) => compiler.default(source, options).catch(error => { throw new compiler.GalleyDiagnosticError({ ...error.diagnostic, help: 'other help' } as never) }) } as Compiler
	const before = await recordedCase(index)
	expect(before.error?.[0]).toBe('G3019')
	expect(classify(item, before, await run(compiler, item))).toBe('same')
	expect(classify(item, before, await run(changed, item))).toBe('unexpected: 0.5.0 result changed')
})

test('the comparison records, reads back and rejects another corpus or a usage it does not know', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'galley-numbers-'))
	try {
		const file = pathToFileURL(join(directory, 'record.json'))
		const cases = corpus().filter((_, index) => index % 1000 === 0)
		expect(await main(['--record', join(import.meta.dir, '..')], file, cases)).toBe(true)
		expect(await main([], file, cases)).toBe(true)
		await expect(main([], recorded, cases)).rejects.toThrow('another corpus')
		const changed = JSON.parse(await Bun.file(file).text())
		changed.rows[changed.cases[0]][0] = 'changed'
		await Bun.write(file, JSON.stringify(changed))
		expect(await main([], file, cases)).toBe(false)

		await expect(main(['--record'], file)).rejects.toThrow('usage')
	} finally { await rm(directory, { recursive: true, force: true }) }
	const cases = corpus().slice(0, 4)
	const own = await record(compiler, cases)
	await expect(compare(compiler, own)).rejects.toThrow('another corpus')
	expect((await compare(compiler, own, cases)).classes).toEqual({ same: 4 })
	expect(own.corpus).toBe(corpusDigest(cases))
}, 30000)

test('the classes name every way a result can leave 0.5.0', () => {
	const source = '<p>{ a[9007199254740992] }</p>', item = { source, partial: null as string | null, strictBraces: false, allowCode: false }
	const at = source.indexOf('9007'), number = [at, at + 16] as const
	type Place = [string, string, string, string, number, number]
	const compiled: Recorded = { output: 'x', error: null, lint: [], numbers: [['bracket', '<template>', ...number]] }
	const refused = (code: string, start: number, end: number) => ({ output: null, error: [code, 'error', 'm', '<template>', start, end] as Place, lint: [[code, 'error', 'm', '<template>', start, end] as Place] })
	expect(classify(item, compiled, refused('G1107', ...number))).toBe('new refusal G1107')
	expect(classify(item, { ...compiled, error: ['G3001', 'error', 'm', '<template>', 0, 1], output: null }, refused('G1107', ...number))).toBe('unexpected: 0.5.0 result changed')
	expect(classify(item, compiled, { ...compiled, output: 'y' })).toBe('unexpected: 0.5.0 result changed')
	expect(classify(item, compiled, refused('G1106', ...number))).toBe('unexpected: G1106 for a number the new rule allows')
	expect(classify(item, compiled, refused('G3001', ...number))).toBe('unexpected: G3001 for a number the new rule allows')
	expect(classify(item, compiled, refused('G1107', 3, 4))).toBe('unexpected: G1107 on no number of 0.5.0\'s parse')
	expect(classify(item, { ...compiled, numbers: [] }, refused('G1107', ...number))).toBe('unexpected: G1107 on no number of 0.5.0\'s parse')
	expect(classify(item, { ...compiled, lint: [['G3002', 'info', 'm', '<template>', 3, 4]] }, refused('G1107', ...number))).toBe('unexpected: lint differs beyond G1107')
	const bracket = { ...item, source: '<p>{ a[ 007 ] }</p>' }, zero = bracket.source.indexOf('007')
	expect(classify(bracket, { ...compiled, numbers: [['bracket', '<template>', zero, zero + 3]] }, refused('G1106', zero, zero + 3))).toBe('new refusal G1106 (number in brackets)')
	// A literal's G1106 is 0.5.0's own: a new one there has no number in brackets to stand on.
	expect(classify({ ...item, source: '<p>{ 007 }</p>' }, { ...compiled, numbers: [['literal', '<template>', 5, 8]] }, refused('G1106', 5, 8))).toBe('unexpected: G1106 on no number in brackets of 0.5.0\'s parse')
	// In a partial, the place names the partial's file.
	const inPartial = { ...item, source: '{@partial p.sort}', partial: '{ a[9007199254740992] }' }, partialAt = inPartial.partial.indexOf('9007')
	const partialRefusal = { output: null, error: ['G1107', 'error', 'm', './p.sort', partialAt, partialAt + 16] as Place, lint: [['G1107', 'error', 'm', './p.sort', partialAt, partialAt + 16] as Place] }
	expect(classify(inPartial, { ...compiled, numbers: [['bracket', './p.sort', partialAt, partialAt + 16]] }, partialRefusal)).toBe('new refusal G1107')
	expect(classify(inPartial, { ...compiled, numbers: [['bracket', '<template>', partialAt, partialAt + 16]] }, partialRefusal)).toBe('unexpected: G1107 on no number of 0.5.0\'s parse')
	// Where galley keeps 0.5.0's thrown error, only lint may add the refusal.
	const thrown = ['SyntaxError', 'thrown', 'm', '', -1, -1] as Place
	expect(classify(item, { ...compiled, output: null, error: thrown }, { ...refused('G1107', ...number), error: thrown })).toBe('new refusal G1107 in lint, beside the error galley keeps')
	expect(classify(item, { ...compiled, output: null, error: thrown, lint: [['G3002', 'info', 'm', '<template>', 3, 4]] }, { output: null, error: thrown, lint: [] })).toBe('unexpected: 0.5.0 lint changed')
})

test('a render that throws is a result, and a fault outside the compiler stops the comparison', async () => {
	const item = { source: '<p>{ n }</p>', partial: null, strictBraces: false, allowCode: false }
	const throwing = { ...compiler, default: async () => ({ render: () => { throw new Error('render') } }) } as Compiler
	expect((await run(throwing, item)).output).toHaveLength(10)
	const uncompiled = { ...compiler, default: async () => { throw new SyntaxError('generated') } } as Compiler
	expect((await run(uncompiled, item)).error?.slice(0, 2)).toEqual(['SyntaxError', 'thrown'])
	const broken = { ...compiler, default: async () => { throw new TypeError('broken') } } as Compiler
	await expect(run(broken, item)).rejects.toThrow('broken')
	const unparsable = { ...compiler, parse: () => { throw new TypeError('parse') } } as Compiler
	await expect(record(unparsable, [item])).rejects.toThrow('parse')
})
