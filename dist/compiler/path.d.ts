import type { PathExpression } from './ast.js';
import type { SourceSpan } from './types.js';
/** A numeric literal meets this check where 0.5.0 parsed it; a number in brackets meets it in checkNumber. */
export declare const checkLeadingZero: (raw: string, at: SourceSpan) => void;
/** A number the template writes, in brackets or as a literal: without a leading zero, and within Number.MAX_SAFE_INTEGER as written. */
export declare const checkNumber: (raw: string, at: SourceSpan) => void;
/** Check after parsing the complete expression, so an otherwise malformed brace stays literal under ADR-015. */
export declare const checkPathRoots: (path: PathExpression) => void;
export declare const parsePath: (raw: string, at: SourceSpan) => PathExpression;
//# sourceMappingURL=path.d.ts.map