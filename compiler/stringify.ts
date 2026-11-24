import { locate } from './diagnostics.js'
import type { FilterFunction, SourceSpan } from './types.js'

/** One conversion contract for output and the built-in filters. */
let warnOnFailure = false

export const stringify = (value: unknown, debug = warnOnFailure): string => {
	try { return String(value) }
	catch {
		if (debug) console.warn('[galley] String conversion failed; using [object Object]')
		return '[object Object]'
	}
}

/** Filters run synchronously; restore the caller's policy even on failure or recursion. */
export const filterWithWarnings = (debug: boolean, name: string, at: SourceSpan, filter: FilterFunction, ...args: [unknown, ...unknown[]]): unknown => {
	const previous = warnOnFailure
	warnOnFailure = debug
	try { return filter(...args) }
	catch (cause) {
		const { line, column } = locate(at.source, at.start)
		throw new Error(`G5003: filter ${name} failed at ${at.source.id}:${line}:${column}: ${cause instanceof Error ? cause.message : stringify(cause)}`, { cause })
	}
	finally { warnOnFailure = previous }
}
