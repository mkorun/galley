import type { SnippetNode, TemplateAst, TemplateNode } from './ast.js';
/** Whether a node of that kind stands anywhere in the nodes, the bodies of blocks, snippets and loaded partials included. */
export declare const contains: (nodes: readonly TemplateNode[], kind: "partial" | "js") => boolean;
/** Snippets callable by a visible JS block need a plain function binding as well as their variants. */
export declare const scriptedSnippets: (nodes: readonly TemplateNode[]) => ReadonlySet<SnippetNode>;
export declare const analyze: (ast: TemplateAst) => TemplateAst;
//# sourceMappingURL=analysis.d.ts.map