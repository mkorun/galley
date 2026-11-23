import { expect, test } from 'bun:test'

test('G-43: fresh mutation campaigns use a copy, passing baselines and conclusive outcomes', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-mutation-driver.py'], { stdout: 'pipe', stderr: 'pipe', timeout: 30000 })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
	const output = new TextDecoder().decode(child.stdout)
	expect(output).toContain('fresh campaigns, copy isolation, baselines, --bail, loop budget and kill reporting passed')
	expect(output).toContain(process.platform === 'win32' ? 'Real-signal checks skipped on Windows' : 'Real-signal checks passed:')
	console.log(output.trim())
}, 31000)
