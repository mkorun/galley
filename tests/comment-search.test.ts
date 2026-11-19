import { expect, test } from 'bun:test'
import galley from '../index.js'

test('G-39: cached comment terminators ignore data and retain later invalid comments', async () => {
	for (const source of ['--!><p>x</p><!-- valid -->', '--!><!-- valid -->--!><!-- valid -->']) await expect(galley(source)).resolves.toBeDefined()
	for (const source of ['--!><!-- invalid --!> -->', '<!-- valid -->--!><!-- invalid --!> -->']) await expect(galley(source)).rejects.toThrow('G3014')
})
