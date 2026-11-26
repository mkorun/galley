import type { Expression } from './ast.js';
import type { SourceSpan } from './types.js';
/** Pipe and snippet arguments share one top-level comma splitter and retain each argument's source. */
export declare const parseArguments: (raw: string, at: SourceSpan, owner: string) => Expression[];
export declare const checkRoots: (expression: Expression) => void;
/** The number checks 0.6.0 added: a leading zero in brackets and a magnitude beyond Number.MAX_SAFE_INTEGER. */
export declare const checkNumbers: (expression: Expression) => void;
export declare const parseExpression: (raw: string, at: SourceSpan) => Expression;
//# sourceMappingURL=expression.d.ts.map