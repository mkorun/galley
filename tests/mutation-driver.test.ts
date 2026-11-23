import { expect, test } from 'bun:test'

test('G-43: mutations use a copy and reuse only a complete run with matching inputs', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-mutation-driver.py'], { stdout: 'pipe', stderr: 'pipe', timeout: 30000 })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
	expect(new TextDecoder().decode(child.stdout)).toContain('copy isolation, cache invalidation, --bail, loop budget and kill reporting passed')
})
