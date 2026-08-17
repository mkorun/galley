import type { CompileOptions, CompiledTemplate, Diagnostic, FilterMap, LintOptions } from './types.js';
export type * from './ast.js';
export type * from './types.js';
export { GalleyDiagnosticError, formatDiagnostic, locate } from './diagnostics.js';
export { lex } from './lexer.js';
export { parse } from './parser.js';
export declare const lint: (template: string, options?: LintOptions & {
    readonly sourceId?: string;
}) => readonly Diagnostic[];
export default function galley<Data extends object = Record<string, unknown>, Filters extends object = FilterMap>(template?: string, options?: CompileOptions): Promise<CompiledTemplate<Data, Filters>>;
//# sourceMappingURL=index.d.ts.map