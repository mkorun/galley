import { expect, spyOn, test } from 'bun:test'
import { piecesFamily, piecesSources } from '../differential/pieces-families.js'
import { candidates } from '../differential/srcset.js'
import * as browser from '../differential/strict-browser.js'
import * as compiler from '../index.js'

test('B3: srcset candidates skip descriptors and retain URL offsets independently of the checker', () => {
	expect(candidates(' \t\n\f\r,/a.png,,, https://h/b.png 2x, /c.png (a,b) 3x, /d.png')).toEqual([
		{ url: '/a.png', at: 6 }, { url: 'https://h/b.png', at: 16 }, { url: '/c.png', at: 36 }, { url: '/d.png', at: 53 },
	])
	expect(candidates('data:image/png;base64,AA== 1x, /b.png')).toEqual([{ url: 'data:image/png;base64,AA==', at: 0 }, { url: '/b.png', at: 31 }])
})

test('B3: pieces smoke observes real Chromium lists and catches a missing separator restart', async () => {
	expect(piecesSources()).toHaveLength(8320)
	const argv = process.argv
	process.argv = [argv[0]!, 'differential/attribute-run.ts', 'pieces', '--smoke']
	let report
	try { report = (await import('../differential/attribute-run.js')).report }
	finally { process.argv = argv }
	expect(report.sources).toBe(40)
	expect(report.accepted).toBeGreaterThan(0)
	expect(report.listsWithMarker).toBeGreaterThan(0)
	expect(report.failures).toEqual([])
}, 56000)

test('B3: pieces oracle judges every candidate of a marker-bearing list and rejects misplaced markers', async () => {
	const observe = spyOn(browser, 'observeStrict').mockImplementation(async cases => cases.map(item => ({ id: item.id, places: ['1|tag', '1|attr:a.onclick', '1|attr:iframe.srcdoc'], urls: ['javascript:x'], lists: ['/ok.png 1x, javascript:M1=1 2x'], foreign: false, text: false })))
	try {
		const report = await piecesFamily(false)
		expect(report.sources).toBe(40)
		expect(report.accepted).toBe(12)
		expect(report.observed).toBe(18)
		expect(report.failures.some(item => item.detail === '1|tag')).toBe(true)
		expect(report.failures.some(item => item.detail === 'forbidden URL carrying marker')).toBe(true)
		expect(report.failures.some(item => item.detail === 'marker in 1|attr:a.onclick')).toBe(true)
		expect(report.failures.some(item => item.detail === 'marker in 1|attr:iframe.srcdoc')).toBe(true)
		expect(report.failures.some(item => item.detail.startsWith('forbidden candidate'))).toBe(true)
		const compile = spyOn(compiler, 'default').mockRejectedValue(new Error('compiler unavailable'))
		try {
			await expect(piecesFamily(false)).rejects.toThrow('compiler unavailable')
			compile.mockResolvedValue({ render: () => { throw new Error('renderer unavailable') }, async: false, diagnostics: [] })
			await expect(piecesFamily(false)).rejects.toThrow('renderer unavailable')
		} finally { compile.mockRestore() }
	} finally { observe.mockRestore() }
	const invalid = Bun.spawnSync(['bun', 'differential/attribute-run.ts', 'pieces', '--bad'], { timeout: 10000, stdout: 'pipe', stderr: 'pipe' })
	expect(invalid.exitCode).not.toBe(0)
	expect(new TextDecoder().decode(invalid.stderr)).toContain('usage: bun differential/attribute-run.ts')
}, 11000)
