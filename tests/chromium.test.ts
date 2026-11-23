import { expect, spyOn, test } from 'bun:test'
import { runChromium } from '../differential/chromium.js'

test('Chromium wrapper uses GALLEY_CHROMIUM, defaults only when unset and names startup failures', () => {
	const previous = process.env.GALLEY_CHROMIUM
	const spawn = spyOn(Bun, 'spawnSync').mockReturnValue({ exitCode: 0, stdout: new Uint8Array(), stderr: new Uint8Array() } as any)
	try {
		for (const executable of [undefined, '/custom/browser with spaces', '']) {
			if (executable === undefined) delete process.env.GALLEY_CHROMIUM
			else process.env.GALLEY_CHROMIUM = executable
			runChromium(['--version'], 1234)
			expect(spawn).toHaveBeenLastCalledWith([executable ?? 'chromium', '--version'], { timeout: 1234, stdout: 'pipe', stderr: 'pipe' })
		}
		process.env.GALLEY_CHROMIUM = '/missing/browser'
		spawn.mockImplementation(() => { throw new Error('not found') })
		expect(() => runChromium(['--version'], 1234)).toThrow('GALLEY_CHROMIUM="/missing/browser"')
		spawn.mockReturnValue({ exitCode: 1, stdout: new Uint8Array(), stderr: new TextEncoder().encode('cannot start') } as any)
		expect(() => runChromium(['--version'], 1234)).toThrow('cannot start')
		expect(spawn).toHaveBeenCalledTimes(5)
	} finally {
		spawn.mockRestore()
		if (previous === undefined) delete process.env.GALLEY_CHROMIUM
		else process.env.GALLEY_CHROMIUM = previous
	}
})


test('Chromium timeouts name the timeout and selected executable', () => {
	const previous = process.env.GALLEY_CHROMIUM
	process.env.GALLEY_CHROMIUM = process.execPath
	try {
		expect(() => runChromium(['-e', 'while (true) {}'], 30)).toThrow('timeout after 30 ms')
	} finally {
		if (previous === undefined) delete process.env.GALLEY_CHROMIUM
		else process.env.GALLEY_CHROMIUM = previous
	}
})
