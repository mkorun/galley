import type { PathExpression } from './ast.js';
import type { SourceSpan } from './types.js';
/** A number the template writes, in brackets or as a literal: without a leading zero, and small enough for the generated code to read exactly. */
export declare const parseNumber: (raw: string, at: SourceSpan) => number;
/** Number diagnostics stand where a malformed expression would otherwise become literal text or another diagnostic. */
export declare const isNumberDiagnostic: (code: string) => boolean;
/** Check after parsing the complete expression, so an otherwise malformed brace stays literal under ADR-015. */
export declare const checkPathRoots: (path: PathExpression) => void;
export declare const parsePath: (raw: string, at: SourceSpan) => PathExpression;
//# sourceMappingURL=path.d.ts.map