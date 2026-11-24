import type { SourceSpan } from './types.js';
import type { TemplateAst, TemplateNode } from './ast.js';
/** Whether a node of that kind stands anywhere in the nodes, the bodies of blocks, snippets and loaded partials included. */
export declare const contains: (nodes: readonly TemplateNode[], kind: "partial" | "js") => boolean;
/** Snippets callable by visible JS need a binding. Span identities survive strip and other node copies. */
export declare const scriptedSnippets: (nodes: readonly TemplateNode[]) => ReadonlySet<SourceSpan>;
export declare const analyze: (ast: TemplateAst) => TemplateAst;
//# sourceMappingURL=analysis.d.ts.map