import { expect, test } from 'bun:test'
import { GROWTH_LIMIT, measureGrowth } from './support/compile-growth.js'

test('G-41: compiler time at 64n stays below 32 times 4n across seventeen shapes', async () => {
	const rows = await measureGrowth()
	expect(rows).toHaveLength(17)
	for (const row of rows) expect(row.ratio, JSON.stringify(row)).toBeLessThan(GROWTH_LIMIT)
}, 300000)
