import { expect, spyOn, test } from 'bun:test'
import { eachFamily, eachSources } from '../differential/each-families.js'
import * as random from '../differential/random.js'
import * as browser from '../differential/strict-browser.js'

test('B2: joins and moved preserve the prototype populations and reject changed inputs', () => {
	expect(eachSources('joins')).toHaveLength(8960)
	expect(eachSources('moved')).toHaveLength(3733)
	expect(() => eachSources('unknown')).toThrow('Unknown each-else family')
	const generate = random.randomSources
	const missing = spyOn(random, 'randomSources').mockReturnValue([])
	try { expect(() => eachSources('moved')).toThrow('Missing moved source') }
	finally { missing.mockRestore() }
	const changed = spyOn(random, 'randomSources').mockImplementation((...args) => generate(...args).map(source => source + 'x'))
	try { expect(() => eachSources('moved')).toThrow('Pinned moved sources changed') }
	finally { changed.mockRestore() }
}, 11000)

test('B2: each-else smoke families compile, render and observe real Chromium pages', async () => {
	const argv = process.argv
	process.argv = [argv[0]!, 'differential/each-run.ts', 'joins', '--smoke']
	let joins
	try { joins = (await import('../differential/each-run.js')).report }
	finally { process.argv = argv }
	for (const report of [joins, await eachFamily('moved', false)]) {
		expect(report.withElse).toBe(40)
		expect(report.accepted).toBeGreaterThan(0)
		expect(report.observed).toBeGreaterThan(0)
		expect(report.failures).toEqual([])
	}
}, 56000)

test('B2: each-else oracle detects misplaced markers and forbidden URLs across the full join domain', async () => {
	const observe = spyOn(browser, 'observeStrict').mockImplementation(async cases => cases.map(item => ({ id: item.id, places: ['1|tag'], urls: ['javascript:x'], lists: [], foreign: false, text: false })))
	try {
		const report = await eachFamily('joins', true)
		expect(report.withElse).toBe(8960)
		expect(report.failures.some(item => item.detail === '1|tag')).toBe(true)
		expect(report.failures.some(item => item.detail === 'forbidden URL carrying marker')).toBe(true)
	} finally { observe.mockRestore() }
	const invalid = Bun.spawnSync(['bun', 'differential/each-run.ts', 'joins', '--bad'], { timeout: 10000, stdout: 'pipe', stderr: 'pipe' })
	expect(invalid.exitCode).not.toBe(0)
	expect(new TextDecoder().decode(invalid.stderr)).toContain('usage: bun differential/each-run.ts')
}, 11000)
