import type { TemplateAst } from './ast.js';
import type { Diagnostic, FilterMap, SourceSpan } from './types.js';
export declare const lintAst: (ast: TemplateAst, allowCode: boolean, filters: FilterMap, scripted: ReadonlySet<SourceSpan>) => readonly Diagnostic[];
//# sourceMappingURL=lint.d.ts.map