import { runChromium } from './chromium.js'
import galley, { GalleyDiagnosticError, parse } from '../index.js'
import type { TemplateNode } from '../compiler/ast.js'
import { readContexts } from '../compiler/context.js'
import util from '../util.js'
import { forbidden } from './oracle.js'
import { randomSources, RANDOM_RUNS } from './random.js'
import { observeStrict, type BrowserCase } from './strict-browser.js'

// The spec supplies the depth and size, but not its original 25-piece alphabet. This committed alphabet covers
// foreign nesting, integration, HTML breakouts, template insertion modes, and unmatched closes.
export const FOREIGN_PIECES = ['<svg>', '</svg>', '<math>', '</math>', '<g>', '</g>', '<desc>', '</desc>', '<foreignObject>', '</foreignObject>', '<title>', '</title>', '<mtext>', '</mtext>', '<mi>', '</mi>', '<annotation-xml>', '</annotation-xml>', '<p>', '</p>', '<div>', '</div>', '<template>', '</template>', '<col>']
export const ELEMENTS = ('a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noembed noframes noscript object ol optgroup option output p picture plaintext pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr xmp frameset svg math desc foreignObject mi mo mn ms mtext annotation-xml mglyph malignmark g path').split(' ')
export const TEXT_OWNERS = ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']
const marker = (index: number): string => `javascript:M${index}=1 N${index}=2`
const refusal = (error: unknown): string => {
	if (!(error instanceof GalleyDiagnosticError)) throw error
	return error.diagnostic.code
}
export const valuePlaces = (nodes: readonly TemplateNode[], found = new Map<string, Set<string>>()): Map<string, Set<string>> => {
	for (const node of nodes) {
		if (node.kind === 'output' && node.expression.kind === 'path') {
			const name = node.expression.root, places = found.get(name) ?? new Set<string>()
			places.add(node.slot!.place); found.set(name, places)
		} else if (node.kind === 'if') for (const branch of node.branches) valuePlaces(branch.children, found)
		else if (node.kind === 'each') { valuePlaces(node.children, found); valuePlaces(node.fallback ?? [], found) }
	}
	return found
}
export const placementFailures = (places: readonly string[], expected: ReadonlySet<string>): string[] => places.filter(place => {
	const actual = place.slice(place.indexOf('|') + 1).toLowerCase()
	return !expected.has(actual) && !(actual.startsWith('text:') && expected.has('text') && !TEXT_OWNERS.includes(actual.slice(5)))
})

/** Smoke mode runs the same code on small domains; the committed evidence uses full mode. */
export const strictFamilies = async (full: boolean) => {
	const failures: { id: string; detail: string }[] = []
	const randomReports = []
	const digest = new Bun.CryptoHasher('sha256')
	for (const settings of RANDOM_RUNS) {
		const sources = randomSources(settings.alphabet, settings.seed, full ? settings.count : 40)
		const cases: BrowserCase[] = [], expected = new Map<string, Set<string>>(), seen = new Set<string>()
		let accepted = 0, stopped = 0, rendered = 0
		for (let index = 0; index < sources.length; index++) {
			const source = sources[index]!
			digest.update(source + '\0')
			let template: Awaited<ReturnType<typeof galley>>
			try { template = await galley(source) } catch (error) { refusal(error); continue }
			accepted++
			const reading = valuePlaces(readContexts(parse({ id: 'random', text: source })).children)
			const names = [...reading.keys()]
			for (const selected of names) for (const p of [false, true]) for (const emptyMeta of [false, true]) {
				const data: Record<string, unknown> = { p, xs: [1, 2] }
				for (const name of names) data[name] = name === selected ? marker(1) : 'x='
				if (emptyMeta) for (const name of names) if (name.startsWith('e')) data[name] = ''
				const id = `${settings.alphabet}-${index}-${selected}-${p}-${emptyMeta}`
				try {
					const html = await template.render(data, util)
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
		const readings = await observeStrict(cases)
		for (const result of readings) {
			for (const detail of placementFailures(result.places, expected.get(result.id)!)) failures.push({ id: result.id, detail })
			if (result.urls.some(forbidden)) failures.push({ id: result.id, detail: 'forbidden URL carrying marker' })
		}
		randomReports.push({ ...settings, generated: sources.length, accepted, rendered, stopped, observed: readings.length })
		console.log(`${settings.alphabet}: ${sources.length} generated, ${readings.length} browser cases`)
	}
	let foreignCases = 0, browserForeign = 0, refused = 0, noForeignEntry = 0, foreignObserved = 0
	let sequences = [...FOREIGN_PIECES]
	for (let depth = 1; depth <= (full ? 4 : 2); depth++) {
		const cases: BrowserCase[] = []
		for (const source of sequences) {
			const id = `foreign-${foreignCases++}`
			const html = source + '<style><i data-galley-probe></i></style>'
			digest.update(html + '\0')
			try { const template = await galley(html); await template.render({}, util) }
			catch (error) { refusal(error); refused++; continue }
			// A refused source already satisfies the implication. With this closed alphabet, a source without
			// either foreign entry token cannot enter a foreign namespace. Observe every remaining candidate.
			if (!source.includes('<svg>') && !source.includes('<math>')) { noForeignEntry++; continue }
			cases.push({ id, html, kind: 'foreign' })
		}
		for (const result of await observeStrict(cases, 5000)) if (result.foreign) {
			browserForeign++
			failures.push({ id: result.id, detail: 'browser foreign but probe compiled' })
		}
		foreignObserved += cases.length
		console.log(`foreign depth ${depth}: ${sequences.length} sequences, ${cases.length} browser candidates`)
		if (depth < (full ? 4 : 2)) sequences = sequences.flatMap(source => FOREIGN_PIECES.map(piece => source + piece))
	}
	const names = full ? ELEMENTS : ['div', 'svg', 'template', 'col']
	const textCases: BrowserCase[] = []
	let textPairs = 0, textRefused = 0
	for (const a of names) for (const b of names) for (const owner of TEXT_OWNERS) {
		const source = `<${a}><${b}><${owner}>GALLEY_TEXT<i data-galley-probe></i>{ value }</${owner}>`
		const id = `text-${a}-${b}-${owner}`
		textPairs++; digest.update(source + '\0')
		try {
			const template = await galley(source), html = await template.render({ value: 'x=' }, util)
			textCases.push({ id, html, kind: 'text', owner })
		}
		catch (error) { refusal(error); textRefused++ }
	}
	for (const result of await observeStrict(textCases)) if (!result.text) failures.push({ id: result.id, detail: 'accepted text owner did not hold probe as text' })
	const version = runChromium(['--version'], 10000)
	return { mode: full ? 'full' : 'smoke', browser: new TextDecoder().decode(version.stdout).trim(), inputDigest: digest.update('').digest('hex'), random: randomReports, foreign: { alphabet: FOREIGN_PIECES.length, depth: full ? 4 : 2, cases: foreignCases, browserForeignAmongAccepted: browserForeign, refused, noForeignEntry, observed: foreignObserved }, text: { names: names.length, owners: TEXT_OWNERS.length, pairs: textPairs, refused: textRefused, observed: textCases.length }, failures }
}

/** Pin the committed productions and browser/placement oracle before starting the extended campaign. */
export const strictSourceDigest = async (): Promise<string> => {
	const digest = new Bun.CryptoHasher('sha256')
	for (const file of ['random.ts', 'strict-families.ts', 'strict-browser.ts', 'chromium.ts', 'each-families.ts', 'each-moved.ts', 'rule17-families.ts', 'pieces-families.ts', 'srcset.ts']) digest.update(await Bun.file(new URL(file, import.meta.url)).text())
	return digest.update('').digest('hex')
}
