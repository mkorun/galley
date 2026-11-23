import { expect, test } from 'bun:test'

test('G-43: fresh mutation campaigns use a copy, passing baselines and conclusive outcomes', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-mutation-driver.py'], { stdout: 'pipe', stderr: 'pipe', timeout: 30000 })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
	expect(new TextDecoder().decode(child.stdout)).toContain('fresh campaigns, copy isolation, baselines, --bail, loop budget and kill reporting passed')
})
