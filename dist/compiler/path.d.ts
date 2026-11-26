import type { PathExpression } from './ast.js';
import type { SourceSpan } from './types.js';
/** A number the template writes, in brackets or as a literal: without a leading zero, and within Number.MAX_SAFE_INTEGER as written. */
export declare const checkNumber: (raw: string, at: SourceSpan) => void;
/** Check every first name after parsing the complete expression. Later property names may contain :, + and -. */
export declare const checkPathRoots: (path: PathExpression) => void;
export declare const parsePath: (raw: string, at: SourceSpan) => PathExpression;
//# sourceMappingURL=path.d.ts.map