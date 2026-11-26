import type { SourceSpan } from './types.js';
import type { TemplateAst, TemplateNode } from './ast.js';
/** Whether a node of that kind stands anywhere in the nodes, the bodies of blocks, snippets and loaded partials included. */
export declare const contains: (nodes: readonly TemplateNode[], kind: "partial" | "js") => boolean;
/** Snippets callable by visible JS need a binding. Span identities survive strip and other node copies. */
export declare const scriptedSnippets: (nodes: readonly TemplateNode[]) => ReadonlySet<SourceSpan>;
export declare const analyze: (ast: TemplateAst) => TemplateAst;
/**
 * The number checks 0.6.0 added run last, on a template that passed every check of 0.5.0: so 0.6.0 refuses more only
 * in templates 0.5.0 compiled, and a brace that 0.5.0 kept as text stays text.
 */
export declare const checkTemplateNumbers: (nodes: readonly TemplateNode[]) => void;
//# sourceMappingURL=analysis.d.ts.map