/** Median wall-clock ratios include every compiler operation, including unnamed native work. */
import { shapes } from './compile-shapes.js'
export const GROWTH_LIMIT = 32
export const measureGrowth = async (names = Object.keys(shapes), runs = 5) => {
	const rows = []
	for (const name of names) {
		const shape = shapes[name]
		if (!shape) throw new Error(`Unknown shape ${name}`)
		const sizes = [shape.n * 4, shape.n * 64]
		const samples: number[][] = [[], []], bytes: number[] = []
		for (let run = 0; run < runs; run++) {
			// Alternate size order; every observation gets its own process and compiler.
			for (const index of run % 2 ? [1, 0] : [0, 1]) {
				const child = Bun.spawn(['bun', new URL('./compile-time.ts', import.meta.url).pathname, name, String(sizes[index])], { stdout: 'pipe', stderr: 'pipe', timeout: 60000 })
				const [stdout, stderr, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
				if (exit !== 0) throw new Error(`Compile timing failed for ${name}: ${stderr}`)
				const result = JSON.parse(stdout) as { ms: number; bytes: number }
				if (!(result.ms > 0) || !Number.isFinite(result.ms)) throw new Error(`Invalid timing for ${name}`)
				samples[index]!.push(result.ms); bytes[index] = result.bytes
			}
		}
		const medians = samples.map(values => [...values].sort((a,b) => a-b)[runs >> 1]!)
		rows.push({ name, sizes, repetitions: shape.repetitions ?? 1, bytes, samples, smallMs: medians[0]!, largeMs: medians[1]!, ratio: medians[1]! / medians[0]! })
	}
	return rows
}
if (import.meta.main) console.log(JSON.stringify(await measureGrowth(process.argv.slice(2).length ? process.argv.slice(2) : undefined), null, 2))
