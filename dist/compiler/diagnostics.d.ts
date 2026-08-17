import type { Diagnostic, SourceFile, SourceSpan } from './types.js';
export declare const span: (source: SourceFile, start: number, end: number) => SourceSpan;
export declare const locate: (source: SourceFile, offset: number) => {
    line: number;
    column: number;
};
export declare const formatDiagnostic: (diagnostic: Diagnostic) => string;
export declare class GalleyDiagnosticError extends Error {
    readonly diagnostic: Diagnostic;
    constructor(diagnostic: Diagnostic);
}
export declare const fail: (code: string, message: string, at: SourceSpan, help?: string) => never;
//# sourceMappingURL=diagnostics.d.ts.map