import type { SourceFile, SourceSpan } from './types.js';
export type TokenKind = 'text' | 'expression' | 'block-open' | 'continuation' | 'block-close' | 'directive' | 'js';
export interface Token {
    readonly kind: TokenKind;
    readonly value: string;
    readonly valueStart: number;
    readonly span: SourceSpan;
}
export declare const lex: (source: SourceFile) => readonly Token[];
//# sourceMappingURL=lexer.d.ts.map