import { expect, test } from 'bun:test'

test('G-40: mutation keys survive earlier source edits and cover statement/data-flow loss and lint', () => {
	const child = Bun.spawnSync(['python3', 'tests/support/check-mutation-keys.py'], { stdout: 'pipe', stderr: 'pipe', timeout: 30000 })
	expect(child.exitCode, new TextDecoder().decode(child.stderr)).toBe(0)
	expect(new TextDecoder().decode(child.stdout)).toContain('stable keys')
}, 31000)
