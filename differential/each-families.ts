import galley, { GalleyDiagnosticError, parse } from '../index.js'
import { readContexts } from '../compiler/context.js'
import { forbidden } from './oracle.js'
import { randomSources, RANDOM_RUNS } from './random.js'
import { observeStrict, type BrowserCase } from './strict-browser.js'
import { valuePlaces, placementFailures } from './strict-families.js'
import { MOVED_INDICES, MOVED_DIGEST } from './each-moved.js'

const MARKER = 'javascript:M1=1 N1=2'

const joins = (): string[] => {
	// ` hr` … `ef="@"` is the split name of G-28: a path that writes nothing in between makes it `href` in the browser.
	const before = ['', ' ', ' title="x"', ' title="x" ', ' hr']
	const inside = ['', ' ', 'hidden', ' hidden', 'hidden ', ' hidden ', ' title="@"', ' title="@" ', 'title="@" ', ' data-x', '="@"', ' href="@"', ' href="@" ', '"', '>', '/']
	const after = ['href="@"', ' href="@"', '', ' ', '="@"', 'ef="@"', 'title="@"']
	const sources: string[] = []
	for (const a of before) for (const body of inside) for (const fallback of inside) for (const z of after) {
		let slot = 0
		sources.push(`<a${a}{#each xs as x}${body}{:else}${fallback}{/each}${z}>`.replace(/@/g, () => `{ v${++slot} }`))
	}
	return sources
}

/** Keep the exact pre-feature population without carrying an old compiler in the repository. */
export const eachSources = (family: string): string[] => {
	if (family === 'joins') return joins()
	if (family !== 'moved') throw new Error(`Unknown each-else family ${family}`)
	const sources = RANDOM_RUNS.flatMap((settings, familyIndex) => {
		const generated = randomSources(settings.alphabet, settings.seed, settings.count)
		return MOVED_INDICES[familyIndex]!.map(index => {
			const source = generated[index]
			if (source === undefined) throw new Error(`Missing moved source ${settings.alphabet}-${index}`)
			return source
		})
	})
	const digest = new Bun.CryptoHasher('sha256')
	for (const source of sources) digest.update(source + '\0')
	if (sources.length !== 3733 || digest.update('').digest('hex') !== MOVED_DIGEST) throw new Error('Pinned moved sources changed')
	return sources
}

/** The prototype's joins and moved campaigns; smoke mode samples forty evenly spaced sources per family. */
export const eachFamily = async (family: string, full: boolean) => {
	const all = eachSources(family)
	const sources = full ? all : Array.from({ length: 40 }, (_, index) => all[Math.floor(index * all.length / 40)]!)
	const refusals: Record<string, number> = {}
	const cases: BrowserCase[] = [], expected = new Map<string, Set<string>>(), seen = new Set<string>()
	let accepted = 0, rendered = 0, stopped = 0
	for (const [index, source] of sources.entries()) {
		let template: Awaited<ReturnType<typeof galley>>
		try { template = await galley(source) }
		catch (error) {
			if (!(error instanceof GalleyDiagnosticError)) throw error
			refusals[error.diagnostic.code] = (refusals[error.diagnostic.code] ?? 0) + 1
			continue
		}
		accepted++
		const reading = valuePlaces(readContexts(parse({ id: 'campaign', text: source })).children)
		const names = [...reading.keys()]
		// Only the moved sources still hold an {#if p}.
		for (const selected of names) for (const xs of [[], [1, 2]]) for (const emptyMeta of [false, true]) for (const p of family === 'moved' ? [false, true] : [false]) {
			const data: Record<string, unknown> = { xs, p }
			for (const name of names) data[name] = name === selected ? MARKER : emptyMeta && name.startsWith('e') ? '' : 'x='
			const id = `${family}-${index}-${selected}-${xs.length}-${emptyMeta}-${p}`
			try {
				const html = await template.render(data)
				rendered++
				const places = reading.get(selected)!
				const key = JSON.stringify([source, html, [...places].sort()])
				if (!seen.has(key)) { seen.add(key); cases.push({ id, html, kind: 'places' }); expected.set(id, places) }
			} catch (error) {
				if (!(error instanceof Error) || !error.message.startsWith('G5001:')) throw error
				stopped++
			}
		}
	}
	const failures: { id: string; detail: string }[] = []
	for (const result of await observeStrict(cases)) {
		for (const detail of placementFailures(result.places, expected.get(result.id)!)) failures.push({ id: result.id, detail })
		if (result.urls.some(forbidden)) failures.push({ id: result.id, detail: 'forbidden URL carrying marker' })
	}
	return { family, mode: full ? 'full' : 'smoke', withElse: sources.length, accepted, refusals, rendered, stopped, observed: cases.length, failures }
}
