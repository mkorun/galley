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
	expect(report.classes).toEqual({ same: 13456, 'new refusal G1106 (number in brackets)': 328, 'new refusal G1107': 1192 })
	expect(report.examples).toEqual({ same: '"<p>{ 7 }</p>" strictBraces=false', 'new refusal G1106 (number in brackets)': '"<p>{ a[007] }</p>" strictBraces=false', 'new refusal G1107': '"<p>{@raw 9007199254740992}</p>" strictBraces=false' })
}, 70000)

test('the review cases are in the corpus and stay as 0.5.0 left them', async () => {
	const { rows } = JSON.parse(await Bun.file(recorded).text()) as { rows: [string | null, never, never[], [number, number][]][] }
	for (const source of ['<script>if (true) { a[9007199254740992] === foo-bar }</script>', '<script>if (true) { a[007] === foo-bar }</script>', '<p>{ n === 007 || f() }</p>']) {
		for (const strictBraces of [false, true]) {
			const index = corpus().findIndex(item => item.source === source && item.strictBraces === strictBraces)
			expect(index).toBeGreaterThanOrEqual(0)
			const [output, error, lint, expressions] = rows[index]!
			expect(classify(corpus()[index]!, { output, error, lint, expressions }, await run(compiler, corpus()[index]!))).toBe('same')
		}
	}
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
		changed.rows[0][0] = 'changed'
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
	const source = '<p>{ a[9007199254740992] }</p>', item = { source, strictBraces: false }
	const at = source.indexOf('9007'), number = [at, at + 16] as const
	const compiled: Recorded = { output: 'x', error: null, lint: [], expressions: [[5, 24]] }
	const refused = (code: string, start: number, end: number) => ({ output: null, error: [code, 'm', start, end] as [string, string, number, number], lint: [[code, 'm', start, end] as [string, string, number, number]] })
	expect(classify(item, compiled, refused('G1107', ...number))).toBe('new refusal G1107')
	expect(classify(item, { ...compiled, error: ['G3001', 'm', 0, 1], output: null }, refused('G1107', ...number))).toBe('unexpected: 0.5.0 result changed')
	expect(classify(item, compiled, { ...compiled, output: 'y' })).toBe('unexpected: 0.5.0 result changed')
	expect(classify(item, compiled, refused('G1106', ...number))).toBe('unexpected: G1106 for a number the new rule allows')
	expect(classify(item, compiled, refused('G1107', 3, 4))).toBe('unexpected: G1107 for a number the new rule allows')
	expect(classify(item, { ...compiled, expressions: [] }, refused('G1107', ...number))).toBe('unexpected: G1107 outside an expression 0.5.0 compiled')
	expect(classify(item, { ...compiled, lint: [['G3002', 'm', 3, 4]] }, refused('G1107', ...number))).toBe('unexpected: lint differs beyond G1107')
	const bracket = { source: '<p>{ a[ 007 ] }</p>', strictBraces: false }, zero = bracket.source.indexOf('007')
	expect(classify(bracket, compiled, refused('G1106', zero, zero + 3))).toBe('new refusal G1106 (number in brackets)')
	expect(classify({ source: '<p>{ 007 }</p>', strictBraces: false }, compiled, refused('G1106', 5, 8))).toBe('unexpected: G1106 for a number the new rule allows')
})

test('a render that throws is a result, and a fault outside the compiler stops the comparison', async () => {
	const item = { source: '<p>{ n }</p>', strictBraces: false }
	const throwing = { ...compiler, default: async () => ({ render: () => { throw new Error('render') } }) } as Compiler
	expect((await run(throwing, item)).output).toHaveLength(12)
	const broken = { ...compiler, default: async () => { throw new TypeError('broken') } } as Compiler
	await expect(run(broken, item)).rejects.toThrow('broken')
	const unparsable = { ...compiler, parse: () => { throw new TypeError('parse') } } as Compiler
	await expect(record(unparsable, [item])).rejects.toThrow('parse')
})
