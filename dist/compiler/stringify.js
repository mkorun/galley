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
export const filterWithWarnings = (debug, filter, ...args) => {
    const previous = warnOnFailure;
    warnOnFailure = debug;
    try {
        return filter(...args);
    }
    finally {
        warnOnFailure = previous;
    }
};
//# sourceMappingURL=stringify.js.map