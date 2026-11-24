import { expect, test } from 'bun:test'

test('the gate schedules one fresh release campaign and refuses incomplete or dirty releases', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-release-command.py'], { timeout: 60000, stdout: 'pipe', stderr: 'pipe' })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
	expect(new TextDecoder().decode(child.stdout)).toContain('release argument handling passed')
}, 61000)
