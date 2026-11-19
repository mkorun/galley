// AB/BA comparison: bun ab.ts <probe.ts> <dirA> <dirB> [rounds=4]
// Each measurement runs in a fresh process; the order alternates A B B A A B B A …; reports per metric the median of A, of B,
// and B relative to A. With dirA = dirB it measures the noise.
const [probe, a, b, roundsArg] = process.argv.slice(2)
if (!probe || !a || !b) { console.error('usage: bun ab.ts <probe.ts> <dirA> <dirB> [rounds]'); process.exit(2) }
const rounds = Number(roundsArg ?? 4)
if (!Number.isInteger(rounds) || rounds < 4) { console.error('rounds must be an integer ≥ 4'); process.exit(2) }
const run = async (dir: string) => {
	const p = Bun.spawn(['bun', probe, dir], { timeout: 60000, stdout: 'pipe', stderr: 'inherit' })
	const text = await new Response(p.stdout).text()
	if (await p.exited !== 0) throw new Error(`probe failed for ${dir}`)
	return JSON.parse(text) as Record<string, number>
}
const res: Record<'A' | 'B', Record<string, number>[]> = { A: [], B: [] }
for (let r = 0; r < rounds; r++) {
	const order = r % 2 === 0 ? ['A', 'B'] as const : ['B', 'A'] as const
	for (const k of order) res[k].push(await run(k === 'A' ? a : b))
}
if (process.env.GALLEY_SAMPLES) await Bun.write(process.env.GALLEY_SAMPLES, JSON.stringify(res, null, 2) + '\n')
const median = (xs: number[]) => [...xs].sort((x, y) => x - y)[xs.length >> 1]!
console.log(`probe ${probe}\nA ${a}\nB ${b}\nrounds ${rounds} (AB/BA), bun ${Bun.version}\n`)
console.log('| metric | A µs | B µs | B/A |\n|---|---:|---:|---:|')
for (const m of Object.keys(res.A[0]!)) {
	const ma = median(res.A.map(x => { const value = x[m]; if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Missing metric ${m}`); return value })), mb = median(res.B.map(x => { const value = x[m]; if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`Missing metric ${m}`); return value }))
	console.log(`| ${m} | ${ma.toFixed(2)} | ${mb.toFixed(2)} | ${(mb / ma * 100 - 100).toFixed(1)} % |`)
}
