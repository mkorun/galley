import type { FilterMap } from './types.js'

// The compiler depends on this contract, not on the concrete JS filters.
// A Rust implementation can expose the same names through native functions.
export type CompilerFilters = FilterMap

export const isFilterMap = (value: unknown): value is FilterMap =>
	typeof value === 'object' && value !== null && Object.values(value).every(item => typeof item === 'function')
