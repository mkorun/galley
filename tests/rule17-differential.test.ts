import { expect, spyOn, test } from 'bun:test'
import { rule17Cases, rule17Family } from '../differential/rule17-families.js'
import * as browser from '../differential/strict-browser.js'
import * as compiler from '../index.js'

test('B7a: the rule 17 family checks all contexts, call paths and source seams in Chromium', async () => {
	expect(rule17Cases()).toHaveLength(896)
	const argv = process.argv
	process.argv = [argv[0]!, 'differential/rule17-run.ts']
	let report
	try { report = (await import('../differential/rule17-run.js')).report }
	finally { process.argv = argv }
	expect(report.cases).toBe(896)
	expect(report.accepted).toBe(664)
	expect(report.refused).toBe(232)
	expect(report.observed).toBe(664)
	expect(report.failures).toEqual([])
}, 56000)

test('B7a: rule 17 oracle detects lost or misplaced markers, missing refusals and changed bytes', async () => {
	const observe = spyOn(browser, 'observeStrict').mockImplementation(async cases => cases.map((item, index) => ({ id: item.id, places: index % 2 ? ['1|tag'] : [], urls: [], lists: [], foreign: false, text: false })))
	try {
		const report = await rule17Family()
		expect(report.failures.some(item => item.detail === 'Missing marker')).toBe(true)
		expect(report.failures.some(item => item.detail === '1|tag')).toBe(true)
		const compile = spyOn(compiler, 'default').mockResolvedValue({ render: () => 'lost', async: false, diagnostics: [] })
		try {
			const broken = await rule17Family()
			expect(broken.failures.some(item => item.detail === 'Missing G3018')).toBe(true)
			expect(broken.failures.some(item => item.detail === 'Missing G3019')).toBe(true)
			expect(broken.failures.some(item => item.detail === 'Unexpected rendered bytes')).toBe(true)
		} finally { compile.mockRestore() }
		const invalid = spyOn(compiler, 'default').mockRejectedValue(new compiler.GalleyDiagnosticError({ code: 'G9999', severity: 'error', message: 'planted refusal', span: { source: { id: 'fault', text: '' }, start: 0, end: 0 } }))
		try {
			expect((await rule17Family()).failures).toHaveLength(896)
			invalid.mockRejectedValue(new compiler.GalleyDiagnosticError({ code: 'G3019', severity: 'error', message: 'wrong location', span: { source: { id: 'fault', text: 'xx' }, start: 1, end: 2 } }))
			expect((await rule17Family()).failures.some(item => item.detail === 'Unexpected refusal location')).toBe(true)
			invalid.mockRejectedValue(new Error('compiler unavailable'))
			await expect(rule17Family()).rejects.toThrow('compiler unavailable')
		} finally { invalid.mockRestore() }
	} finally { observe.mockRestore() }
	const invalid = Bun.spawnSync(['bun', 'differential/rule17-run.ts', '--bad'], { timeout: 10000, stdout: 'pipe', stderr: 'pipe' })
	expect(invalid.exitCode).not.toBe(0)
	expect(new TextDecoder().decode(invalid.stderr)).toContain('usage: bun differential/rule17-run.ts')
}, 11000)
