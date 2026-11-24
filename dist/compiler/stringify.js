import { locate } from './diagnostics.js';
/** One conversion contract for output and the built-in filters. */
let warnOnFailure = false;
export const stringify = (value, debug = warnOnFailure) => {
    try {
        return String(value);
    }
    catch {
        if (debug)
            console.warn('[galley] String conversion failed; using [object Object]');
        return '[object Object]';
    }
};
/** Filters run synchronously; restore the caller's policy even on failure or recursion. */
export const filterWithWarnings = (debug, name, at, filter, ...args) => {
    const previous = warnOnFailure;
    warnOnFailure = debug;
    try {
        return filter(...args);
    }
    catch (cause) {
        const { line, column } = locate(at.source, at.start);
        throw new Error(`G5003: filter ${name} failed at ${at.source.id}:${line}:${column}: ${cause instanceof Error ? cause.message : stringify(cause)}`, { cause });
    }
    finally {
        warnOnFailure = previous;
    }
};
/** Construct the strict-undefined error only on failure; successful checks do no source lookup. */
export const undefinedError = (at) => {
    const { line, column } = locate(at.source, at.start);
    return new Error(`G5002: ${at.source.text.slice(at.start, at.end)} is undefined at ${at.source.id}:${line}:${column}`);
};
//# sourceMappingURL=stringify.js.map