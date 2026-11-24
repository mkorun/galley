import util from '../util.js'
import type { FilterFunction, FilterMap, LintOptions } from './types.js'

/** Snapshot the functions once; render never consults the caller's mutable registry. */
export const filterRegistry = (options: LintOptions): FilterMap => {
	if ('knownFilters' in options) throw new TypeError('knownFilters was removed; register functions in options.filters')
	if (options.filters !== undefined && (options.filters === null || typeof options.filters !== 'object' || Array.isArray(options.filters))) throw new TypeError('options.filters must be a map of functions')
	const filters: Record<string, FilterFunction> = Object.assign(Object.create(null), util, options.filters)
	for (const [name, filter] of Object.entries(filters)) {
		if (typeof filter !== 'function') throw new TypeError(`options.filters.${name} must be a function`)
	}
	return Object.freeze(filters)
}
