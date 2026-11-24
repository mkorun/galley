import type { PathExpression } from './ast.js';
import type { SourceSpan } from './types.js';
/** Check after parsing the complete expression, so an otherwise malformed brace stays literal under ADR-015. */
export declare const checkPathRoots: (path: PathExpression) => void;
export declare const parsePath: (raw: string, at: SourceSpan) => PathExpression;
//# sourceMappingURL=path.d.ts.map