import type { TemplateAst } from './ast.js';
export interface GeneratedProgram {
    readonly body: string;
    readonly async: boolean;
}
export declare const generate: (ast: TemplateAst, options?: {
    readonly allowCode?: boolean;
    readonly strip?: boolean;
    readonly stripEmptyMeta?: boolean;
    readonly debug?: boolean;
}) => GeneratedProgram;
//# sourceMappingURL=codegen.d.ts.map