import { expect, test } from 'bun:test'
import { render } from './helpers.js'

test('G-43: a comment after a multiline config removes the indentation before the config', async () => {
	for (const newline of ['\n', '\r\n']) {
		for (const suffix of [newline + 'rest', '']) {
			const source = ['a', '  <galley:config>', 'k: v', '</galley:config><!-- c -->'].join(newline) + suffix
			expect(await render(source)).toBe(suffix ? 'a' + newline + 'rest' : 'a')
		}
	}
})
