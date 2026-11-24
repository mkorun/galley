import type { SourceSpan } from './types.js'

/**
 * @experimental The AST is exported for lint/editor tooling, but its exact
 * shape is not covered by Galley's 0.x compatibility promise yet.
 */

export const LOOP_METADATA = ['length', 'isFirst', 'isLast', 'position'] as const
export type LoopMetadata = typeof LOOP_METADATA[number]

export interface PathSegment {
	readonly kind: 'property' | 'computed'
	readonly value: string | number | PathExpression
	readonly span: SourceSpan
}

interface ExpressionBase { readonly parenthesized?: boolean }

export interface PathExpression extends ExpressionBase {
	readonly kind: 'path'
	readonly root: string
	readonly segments: readonly PathSegment[]
	readonly span: SourceSpan
}

export interface LiteralExpression extends ExpressionBase {
	readonly kind: 'literal'
	readonly value: string | number | boolean | null | undefined
	readonly raw: string
	readonly span: SourceSpan
}

export interface UnaryExpression extends ExpressionBase {
	readonly kind: 'unary'
	readonly operator: '!'
	readonly operand: Expression
	readonly span: SourceSpan
}

export interface BinaryExpression extends ExpressionBase {
	readonly kind: 'binary'
	readonly operator: '===' | '!==' | '>' | '<' | '>=' | '<=' | '&&' | '||' | '??'
	readonly left: Expression
	readonly right: Expression
	readonly span: SourceSpan
}

export interface PipeCall {
	readonly name: string
	readonly args: readonly Expression[]
	readonly span: SourceSpan
}

export interface PipeExpression extends ExpressionBase {
	readonly kind: 'pipe'
	readonly input: Expression
	readonly pipes: readonly PipeCall[]
	readonly span: SourceSpan
}

export type Expression = PathExpression | LiteralExpression | UnaryExpression | BinaryExpression | PipeExpression

interface NodeBase { readonly span: SourceSpan }
/** What an output writes into, as far as code generation needs to know. */
export interface HtmlSlot {
	readonly place: string
	/** The value of a quoted URL attribute that its static start does not settle: each write is checked. */
	readonly url: boolean
	/** The value of the first `content` of `<meta>` or `href` of `<link>`: a write decides whether stripEmptyMeta removes the tag. */
	readonly metadata: boolean
}
/**
 * What the context reader found in a text node; `at` is an offset into its value. There are records only where a render
 * has something to do. The reader sets `dynamic` once a write depends on the record; without it, code generation skips it.
 */
export interface TagRecord { readonly kind: 'tag-open'; readonly at: number; dynamic: boolean }
export interface ValueRecord { readonly kind: 'value-open'; readonly at: number; readonly url: string | null; readonly tag: TagRecord | null; dynamic: boolean }
export type HtmlRecord =
	/** The `<` of a `<meta>` or `<link>` start tag. */
	| TagRecord
	/** After the opening quote of a URL attribute (`url` names it, null once its static start settles the URL) or of a metadata target (`tag`). */
	| ValueRecord
	/** Before the closing quote of such a value. */
	| { readonly kind: 'value-close'; readonly at: number }
	/** The end of the name of a `content` or `href` attribute in that tag: the first one is the target of stripEmptyMeta. */
	| { readonly kind: 'target'; readonly at: number; readonly tag: TagRecord }
	/** After the `>` of that tag. */
	| { readonly kind: 'tag-close'; readonly at: number; readonly tag: TagRecord }
export interface TextNode extends NodeBase {
	readonly kind: 'text'; readonly value: string
	/** Contiguous literal source runs, when lexer removals or strip joined distant characters. */
	readonly sourceSpans?: readonly SourceSpan[]
	readonly records?: readonly HtmlRecord[]
	/** The recorded value this text begins in. */
	readonly open?: ValueRecord
}
export interface OutputNode extends NodeBase {
	readonly kind: 'output'
	readonly expression: Expression
	readonly raw: boolean
	readonly slot?: HtmlSlot
}
export interface ConstNode extends NodeBase { readonly kind: 'const'; readonly name: string; readonly expression: Expression }
export interface IfBranch { readonly condition: Expression | null; readonly children: readonly TemplateNode[]; readonly span: SourceSpan }
export interface IfNode extends NodeBase { readonly kind: 'if'; readonly branches: readonly IfBranch[] }
export interface EachNode extends NodeBase {
	readonly kind: 'each'; readonly collection: PathExpression; readonly item: string; readonly index: string | null
	readonly children: readonly TemplateNode[]
	/** `{:else}`: what renders once when the body ran zero times. It stands outside the loop: no item, index or loop metadata. */
	readonly fallback?: readonly TemplateNode[]
	readonly metadata?: ReadonlySet<LoopMetadata>
}
export interface SnippetNode extends NodeBase {
	readonly kind: 'snippet'; readonly name: string; readonly params: readonly string[]; readonly children: readonly TemplateNode[]
	/** The body once for every HTML context the snippet is rendered in. */
	readonly variants?: readonly { readonly name: string; readonly children: readonly TemplateNode[] }[]
	/** The variant for ordinary content, which `{@js}` calls by the snippet's name. Only for declarations lexically visible to `{@js}`. */
	readonly js?: string
}
export interface RenderNode extends NodeBase { readonly kind: 'render'; readonly name: string; readonly arguments: readonly Expression[]; readonly slot?: HtmlSlot; readonly specialization?: string }
export interface PartialNode extends NodeBase { readonly kind: 'partial'; readonly path: string; readonly children?: readonly TemplateNode[] }
export interface JsNode extends NodeBase { readonly kind: 'js'; readonly code: string; readonly awaits: boolean; readonly slot?: HtmlSlot }

export type TemplateNode = TextNode | OutputNode | ConstNode | IfNode | EachNode | SnippetNode | RenderNode | PartialNode | JsNode

export interface TemplateAst {
	readonly kind: 'template'
	readonly children: readonly TemplateNode[]
	readonly span: SourceSpan
}
