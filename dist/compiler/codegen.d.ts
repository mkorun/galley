import type { TemplateAst } from './ast.js';
import type { SourceSpan } from './types.js';
export interface GeneratedProgram {
    readonly body: string;
    readonly async: boolean;
    readonly places: readonly SourceSpan[];
}
export declare const generate: (ast: TemplateAst, options: {
    readonly strictUndefined?: boolean;
    readonly strip?: boolean;
    readonly stripEmptyMeta?: boolean;
    readonly debug?: boolean;
}, allowCode: boolean) => GeneratedProgram;
//# sourceMappingURL=codegen.d.ts.map