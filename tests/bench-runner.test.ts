import { expect, test } from 'bun:test'

test('benchmark runner requires an output directory and keeps results there', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-bench-runner.py'], { stdout: 'pipe', stderr: 'pipe', timeout: 30000 })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
}, 31000)
