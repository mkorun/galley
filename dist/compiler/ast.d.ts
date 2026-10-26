import type { SourceSpan } from './types.js';
/**
 * @experimental The AST is exported for lint/editor tooling, but its exact
 * shape is not covered by Galley's 0.x compatibility promise yet.
 */
export interface PathSegment {
    readonly kind: 'property' | 'computed';
    readonly value: string | number | PathExpression;
    readonly span: SourceSpan;
}
export interface PathExpression {
    readonly kind: 'path';
    readonly root: string;
    readonly segments: readonly PathSegment[];
    readonly span: SourceSpan;
}
export interface LiteralExpression {
    readonly kind: 'literal';
    readonly value: string | number | boolean | null | undefined;
    readonly raw: string;
    readonly span: SourceSpan;
}
export interface UnaryExpression {
    readonly kind: 'unary';
    readonly operator: '!';
    readonly operand: Expression;
    readonly span: SourceSpan;
}
export interface BinaryExpression {
    readonly kind: 'binary';
    readonly operator: '===' | '!==' | '>' | '<' | '>=' | '<=' | '&&' | '||' | '??';
    readonly left: Expression;
    readonly right: Expression;
    readonly span: SourceSpan;
}
export interface PipeCall {
    readonly name: string;
    readonly args: readonly Expression[];
    readonly span: SourceSpan;
}
export interface PipeExpression {
    readonly kind: 'pipe';
    readonly input: Expression;
    readonly pipes: readonly PipeCall[];
    readonly span: SourceSpan;
}
export type Expression = PathExpression | LiteralExpression | UnaryExpression | BinaryExpression | PipeExpression;
interface NodeBase {
    readonly span: SourceSpan;
}
export interface TextNode extends NodeBase {
    readonly kind: 'text';
    readonly value: string;
}
export interface OutputNode extends NodeBase {
    readonly kind: 'output';
    readonly expression: Expression;
    readonly raw: boolean;
    readonly emptyAttribute?: 'content' | 'href';
    readonly urlAttribute?: string;
}
export interface ConstNode extends NodeBase {
    readonly kind: 'const';
    readonly name: string;
    readonly expression: Expression;
}
export interface IfBranch {
    readonly condition: Expression | null;
    readonly children: readonly TemplateNode[];
    readonly span: SourceSpan;
}
export interface IfNode extends NodeBase {
    readonly kind: 'if';
    readonly branches: readonly IfBranch[];
}
export interface EachNode extends NodeBase {
    readonly kind: 'each';
    readonly collection: PathExpression;
    readonly item: string;
    readonly index: string | null;
    readonly children: readonly TemplateNode[];
    readonly metadata?: ReadonlySet<'length' | 'isFirst' | 'isLast'>;
}
export interface SnippetNode extends NodeBase {
    readonly kind: 'snippet';
    readonly name: string;
    readonly param: string | null;
    readonly children: readonly TemplateNode[];
}
export interface RenderNode extends NodeBase {
    readonly kind: 'render';
    readonly name: string;
    readonly argument: Expression | null;
}
export interface PartialNode extends NodeBase {
    readonly kind: 'partial';
    readonly path: string;
}
export interface JsNode extends NodeBase {
    readonly kind: 'js';
    readonly code: string;
    readonly awaits: boolean;
}
export type TemplateNode = TextNode | OutputNode | ConstNode | IfNode | EachNode | SnippetNode | RenderNode | PartialNode | JsNode;
export interface TemplateAst {
    readonly kind: 'template';
    readonly children: readonly TemplateNode[];
    readonly span: SourceSpan;
}
export {};
//# sourceMappingURL=ast.d.ts.map