import type { CompileOptions, CompiledTemplate, Diagnostic, FilterMap } from './types.js';
export type * from './ast.js';
export type * from './types.js';
export { GalleyDiagnosticError, formatDiagnostic, locate } from './diagnostics.js';
export { lex } from './lexer.js';
export { parse } from './parser.js';
/** Lint uses the compiler's reader; unresolved partials preserve their entry context. */
export declare function lint(template: string, options?: CompileOptions): Promise<Diagnostic[]>;
export default function galley<Data extends object = Record<string, unknown>, Filters extends object = FilterMap>(template?: string, options?: CompileOptions): Promise<CompiledTemplate<Data, Filters>>;
//# sourceMappingURL=index.d.ts.map