import galley, { GalleyDiagnosticError } from '../index.js'
import type { CompileOptions } from '../compiler/types.js'
import { observeStrict, type BrowserCase } from './strict-browser.js'
import { placementFailures } from './strict-families.js'

const MARKER = 'javascript:M1=1 N1=2'

/** Independent expected bytes and refusals across text owners, call paths and source-removal seams. */
export const rule17Cases = () => {
	const cases = []
	for (const owner of ['script', 'style', 'title', 'textarea', 'p', 'attribute']) {
		const prefix = owner === 'attribute' ? '<p title="' : `<${owner}>`
		const suffix = owner === 'attribute' ? '"></p>' : `</${owner}>`
		const place = owner === 'attribute' ? 'attr:p.title' : `text:${owner}`
		const protectedText = owner === 'script' || owner === 'style'
		for (const [kind, fragment, written] of [
			['value', '{ value }', MARKER], ['root', '{ $.user-name }', MARKER], ['raw', '{@raw value}', MARKER],
			['first-name', '{ user-name }', '{ user-name }'], ['escaped-brace', '\\{ user-name }', '{ user-name }'],
			['malformed', '{ user-name + 1 }', '{ user-name + 1 }'], ['static', 'literal', 'literal'], ['non-tag', '{ !flag }', '{ !flag }'], ['unclosed', '{ !', '{ !'],
		] as const) for (const form of ['direct', 'snippet', 'partial', 'fallback']) for (const strip of [false, true]) for (const strictBraces of [false, true]) {
			const id = `${owner}-${kind}-${form}-${strip}-${strictBraces}`
			const body = fragment + ' ' + MARKER
			const removal = '<galley:config>x</galley:config><!-- removed -->\n\\{ ignored-name }\n'
			const source = removal + (form === 'snippet' ? `{#snippet s()}${body}{/snippet}${prefix}{@render s()}${suffix}`
				: form === 'fallback' ? `${prefix}{#each xs as x}unused{:else}${body}{/each}${suffix}`
				: form === 'partial' ? `${prefix}{@partial p.sort}${suffix}` : prefix + body + suffix)
			const options: CompileOptions = { strip, strictBraces, ...(form === 'partial' ? { includes: { import: async () => body } } : {}) }
			const refusal = protectedText && (kind === 'value' || kind === 'root') ? 'G3018'
				: !protectedText && (kind === 'first-name' || (strictBraces && ['malformed', 'non-tag', 'unclosed'].includes(kind))) ? 'G3019' : null
			const expected = '{ ignored-name }' + (strip ? '' : '\n') + prefix + written + ' ' + MARKER + suffix
			cases.push({ id, source, options, refusal, expected, place, offset: form === 'partial' ? body.indexOf(fragment) : source.indexOf(fragment) })
		}
	}
	// Literal ranges consumed as comments, doctypes, or immediately after a text owner's end tag.
	for (const owner of ['comment', 'doctype', 'script-end', 'style-end']) for (const escaped of [false, true]) for (const strip of [false, true]) for (const strictBraces of [false, true]) {
		const fragment = `${escaped ? '\\' : ''}{ !flag }`
		const prefix = owner === 'comment' ? '<p><!-- ' : owner === 'doctype' ? '<!doctype html ' : `<${owner.slice(0, -4)}>{ !flag }</${owner.slice(0, -4)}><p>`
		const suffix = owner === 'comment' ? ` ${MARKER} --></p>` : owner === 'doctype' ? `><p>${MARKER}</p>` : ` ${MARKER}</p>`
		const source = prefix + fragment + suffix
		cases.push({ id: `${owner}-${escaped}-${strip}-${strictBraces}`, source, options: { strip, strictBraces }, refusal: strictBraces && !escaped ? 'G3019' : null, expected: prefix + '{ !flag }' + suffix, place: owner === 'comment' ? 'comment' : 'text:p', offset: prefix.length })
	}
	return cases
}

export const rule17Family = async () => {
	const cases = rule17Cases(), pages: BrowserCase[] = [], places = new Map<string, string>()
	const failures: { id: string; detail: string }[] = []
	let accepted = 0, refused = 0
	for (const item of cases) {
		let template: Awaited<ReturnType<typeof galley>>
		try { template = await galley(item.source, item.options) }
		catch (error) {
			if (!(error instanceof GalleyDiagnosticError)) throw error
			refused++
			if (error.diagnostic.code !== item.refusal) failures.push({ id: item.id, detail: `Expected ${item.refusal ?? 'acceptance'}, got ${error.diagnostic.code}` })
			else if (error.diagnostic.span.start !== item.offset) failures.push({ id: item.id, detail: 'Unexpected refusal location' })
			continue
		}
		accepted++
		if (item.refusal) { failures.push({ id: item.id, detail: `Missing ${item.refusal}` }); continue }
		const html = await template.render({ value: MARKER, 'user-name': MARKER, xs: [] })
		if (html !== item.expected) failures.push({ id: item.id, detail: 'Unexpected rendered bytes' })
		pages.push({ id: item.id, html, kind: 'places' }); places.set(item.id, item.place)
	}
	for (const reading of await observeStrict(pages)) {
		const expected = new Set([places.get(reading.id)!])
		if (reading.places.length === 0) failures.push({ id: reading.id, detail: 'Missing marker' })
		for (const detail of placementFailures(reading.places, expected)) failures.push({ id: reading.id, detail })
	}
	return { cases: cases.length, accepted, refused, observed: pages.length, failures }
}
