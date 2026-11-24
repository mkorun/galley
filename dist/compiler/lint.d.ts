import type { TemplateAst } from './ast.js';
import type { Diagnostic, FilterMap, LintOptions, SourceSpan } from './types.js';
export declare const lintAst: (ast: TemplateAst, options: LintOptions, filters: FilterMap, scripted: ReadonlySet<SourceSpan>) => readonly Diagnostic[];
//# sourceMappingURL=lint.d.ts.map