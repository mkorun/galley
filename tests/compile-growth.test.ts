import { expect, spyOn, test } from 'bun:test'
import { GROWTH_LIMIT, measureGrowth } from './support/compile-growth.js'

test('G-41: compiler time at 64n stays below 32 times 4n across seventeen shapes', async () => {
	const rows = await measureGrowth()
	expect(rows).toHaveLength(17)
	for (const row of rows) expect(row.ratio, JSON.stringify(row)).toBeLessThan(GROWTH_LIMIT)
}, 300000)

test('growth uses the least delayed sample at each size and retains quadratic failures', async () => {
	for (const large of [160, 490]) {
		const samples = [[10, 10, 10, 100, 100], [large, 400 + large, 400 + large, 400 + large, 900 + large]]
		const timings = samples[0]!.flatMap((small, index) => index % 2 ? [samples[1]![index]!, small] : [small, samples[1]![index]!])
		const spawn = spyOn(Bun, 'spawn').mockImplementation(() => ({
			stdout: new Response(JSON.stringify({ ms: timings.shift(), bytes: 1 })).body!,
			stderr: new Response('').body!, exited: Promise.resolve(0),
		}) as any)
		try {
			const [row] = await measureGrowth(['textElements'])
			expect(row!.samples).toEqual(samples)
			expect(row!.smallMs).toBe(10)
			expect(row!.largeMs).toBe(large)
			expect(row!.ratio < GROWTH_LIMIT).toBe(large === 160)
		} finally { spawn.mockRestore() }
	}
})
