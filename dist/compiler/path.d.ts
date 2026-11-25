import type { PathExpression } from './ast.js';
import type { SourceSpan } from './types.js';
/** A number the template writes, in brackets or as a literal: without a leading zero, and within Number.MAX_SAFE_INTEGER as written. */
export declare const checkNumber: (raw: string, at: SourceSpan) => void;
/** Number diagnostics come from a complete expression: they stand where a malformed one would become literal text or another diagnostic. */
export declare const isNumberDiagnostic: (code: string) => boolean;
/** First path names and numbers are checked after parsing the complete expression, so an otherwise malformed brace stays literal under ADR-015. */
export declare const checkPath: (path: PathExpression) => void;
export declare const parsePath: (raw: string, at: SourceSpan) => PathExpression;
//# sourceMappingURL=path.d.ts.map