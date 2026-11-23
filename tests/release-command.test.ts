import { expect, test } from 'bun:test'

test('the gate handles arguments and refuses dirty releases, missing gitleaks and changed inventory', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-release-command.py'], { timeout: 15000, stdout: 'pipe', stderr: 'pipe' })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
	expect(new TextDecoder().decode(child.stdout)).toContain('release argument handling passed')
})
