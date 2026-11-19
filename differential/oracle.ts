import type { Fixture } from './model.js'
export interface Observation { decoded: string[]; slots: string[] }
export interface Result { phase: 'render' | 'compile'; output?: string; error?: string }
export interface Violation { component: string; kind: string; cause: string }

/** Independent whole-prefix rule; decoding is supplied by Chromium, never by galley. */
export const forbidden = (decoded: string): boolean => {
	const value = decoded.replace(/^[\x00-\x20]+/, '').replace(/[\t\n\r]/g, '')
	const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)
	return scheme ? !['http', 'https', 'mailto', 'tel'].includes(scheme[1]!.toLowerCase()) : /^[\\/]{2}/.test(value)
}
const markers = (value: string): string => value.replace(/&#xE00([0-3]);/g, (_, digit: string) => String.fromCharCode(0xe000 + Number(digit)))
export const violations = (fixture: Fixture, observation: Observation, result: Result): Violation[] => {
	if (observation.decoded.length !== fixture.writes.length) throw new Error('Oracle checkpoint count differs')
	const failures: Violation[] = []
	if (fixture.refusal) {
		if (result.phase !== 'compile' || !result.error?.includes('[galley:' + fixture.refusal + ']')) failures.push({ component: 'compile', kind: 'missing-compile-refusal', cause: fixture.refusal })
		// A refusal with a hazard is shown to be needed: the browser reads the value in that attribute, where the template text does not say so.
		if (fixture.hazard !== undefined && !observation.slots.includes(fixture.hazard)) failures.push({ component: 'placement', kind: 'browser-hazard-differs', cause: fixture.id })
		return failures
	}
	const first = observation.decoded.findIndex((value, index) => fixture.writes[index]!.undecided || forbidden(value))
	if (first >= 0) {
		const write = fixture.writes[first]!
		const expected = `G5001: ${write.attribute}=${JSON.stringify(write.serialized)} is no URL a template may write there:`
		if (result.phase !== 'render' || !result.error?.startsWith(expected)) failures.push({ component: write.attribute, kind: 'missing-attributed-stop', cause: fixture.id.startsWith('near-miss-') ? nearMiss(fixture.data.active === true, first > 0 ? fixture.writes[first - 1]!.serialized : '') : write.cause })
	} else if (result.error) failures.push({ component: 'output', kind: 'unexpected-refusal', cause: fixture.id })
	if (result.output !== undefined || !result.error) {
		if (result.output === undefined || markers(result.output) !== markers(fixture.expected)) failures.push({ component: 'output', kind: 'output-mismatch', cause: fixture.id })
		for (const component of fixture.components ?? []) {
			const output = result.output ?? ''
			const start = output.indexOf(component.before)
			const end = output.indexOf(component.after, start + component.before.length)
			if (start < 0 || end < 0 || output.slice(start + component.before.length, end) !== component.expected) failures.push({ component: component.id, kind: 'slot-value-mismatch', cause: fixture.id })
		}
	}
	if (fixture.slot === null ? observation.slots.length > 0 : !observation.slots.includes(fixture.slot)) failures.push({ component: 'placement', kind: 'browser-slot-differs', cause: fixture.id })
	return failures
}

/** A witness stays tied to the executed near-miss branch and prior nonempty contributions. */
export const nearMiss = (active: boolean, prior: string): string => `${active ? 'quoted-angle' : 'quoted-plain'}:${prior ? 'prior-contribution' : 'no-prior-contribution'}`
export const replay = (expected: readonly Violation[], actual: readonly Violation[]): boolean => expected.length > 0 && expected.every(witness => actual.some(item => item.component === witness.component && item.kind === witness.kind && item.cause === witness.cause))
