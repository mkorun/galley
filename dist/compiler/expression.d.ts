import type { Expression } from './ast.js';
import type { SourceSpan } from './types.js';
/** Pipe and snippet arguments share one top-level comma splitter and retain each argument's source. */
export declare const parseArguments: (raw: string, at: SourceSpan, owner: string) => Expression[];
/** The checks that wait for the complete expression: first path names and numbers. */
export declare const checkExpression: (expression: Expression) => void;
export declare const parseExpression: (raw: string, at: SourceSpan) => Expression;
//# sourceMappingURL=expression.d.ts.map