import type { TextNode } from './ast.js';
import type { SourceSpan } from './types.js';
/** Literal runs retain their source positions across lexer removals and strip. */
export declare const textSpans: (node: TextNode) => readonly SourceSpan[];
export declare const textPosition: (node: TextNode, offset: number) => SourceSpan;
export declare const stripText: (node: TextNode, final: boolean) => TextNode;
//# sourceMappingURL=text.d.ts.map