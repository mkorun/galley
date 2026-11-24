import galley, { GalleyDiagnosticError, parse } from '../index.js'
import { readContexts } from '../compiler/context.js'
import { forbidden } from './oracle.js'
import { observeStrict, type BrowserCase } from './strict-browser.js'
import { valuePlaces, placementFailures } from './strict-families.js'
import { candidates } from './srcset.js'

const PAYLOADS = ['javascript:M1=1 N1=2', '/ok.png 1x, javascript:M1=1 N1=2', '/ok.png,javascript:M1=1 N1=2', 'script:M1=1 N1=2']
const RAW_REFERENCE = '&#44;&#32;'

/** The attribute-policy prototype's complete list-piece domain, in its original order. */
export const piecesSources = (): string[] => {
	// % is a value; r is raw output that writes a reference to a comma and a space.
	const alphabet = ['%', ' ', ',', '/a.png', ' 1x', 'java', 'script:', '//', '&#44;&#32;', 'https://h/', '{@raw r}', '{#if p}', '{/if}']
	let sequences = alphabet, all: string[] = []
	for (let length = 1; length <= 4; length++) {
		all = all.concat(sequences)
		if (length < 4) sequences = sequences.flatMap(sequence => alphabet.map(piece => sequence + piece))
	}
	return all.filter(sequence => sequence.includes('%')).map(sequence => { let slot = 0; return `<img srcset="${sequence.replace(/%/g, () => `{ v${++slot} }`)}">` })
}

/** Compile, render and observe each list; smoke mode samples forty evenly spaced sources. */
export const piecesFamily = async (full: boolean) => {
	const all = piecesSources()
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
		const reading = valuePlaces(readContexts(parse({ id: 'pieces', text: source })).children)
		// The prototype's raw r always writes RAW_REFERENCE; only escaped values carry the selected payload.
		reading.delete('r')
		const names = [...reading.keys()]
		for (const selected of names) for (const [payloadIndex, payload] of PAYLOADS.entries()) for (const p of [false, true]) {
			const data: Record<string, unknown> = { p, r: RAW_REFERENCE }
			for (const name of names) data[name] = name === selected ? payload : 'x='
			const id = `pieces-${index}-${selected}-${payloadIndex}-${p}`
			try {
				const html = await template.render(data, {})
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
	let listsWithMarker = 0
	for (const result of await observeStrict(cases)) {
		for (const detail of placementFailures(result.places, expected.get(result.id)!)) failures.push({ id: result.id, detail })
		if (result.urls.some(forbidden)) failures.push({ id: result.id, detail: 'forbidden URL carrying marker' })
		for (const place of result.places) if (/\|attr:[^.]*\.(on|srcdoc$)/.test(place)) failures.push({ id: result.id, detail: `marker in ${place}` })
		for (const list of result.lists) {
			listsWithMarker++
			const bad = candidates(list).find(candidate => forbidden(candidate.url))
			if (bad) failures.push({ id: result.id, detail: `forbidden candidate ${JSON.stringify(bad.url)} in ${JSON.stringify(list)}` })
		}
	}
	return { family: 'pieces', mode: full ? 'full' : 'smoke', sources: sources.length, accepted, refusals, rendered, stopped, observed: cases.length, listsWithMarker, failures }
}
