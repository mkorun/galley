import type { FilterFunction, SourceSpan } from './types.js';
export declare const stringify: (value: unknown, debug?: boolean) => string;
/** Filters run synchronously; restore the caller's policy even on failure or recursion. */
export declare const filterWithWarnings: (debug: boolean, name: string, at: SourceSpan, filter: FilterFunction, ...args: [unknown, ...unknown[]]) => unknown;
/** Construct the strict-undefined error only on failure; successful checks do no source lookup. */
export declare const undefinedError: (at: SourceSpan) => Error;
//# sourceMappingURL=stringify.d.ts.map