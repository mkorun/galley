export const span = (source, start, end) => ({ source, start, end });
export const locate = (source, offset) => {
    let line = 1;
    let lineStart = 0;
    for (let i = 0; i < Math.min(offset, source.text.length); i++) {
        if (source.text.charCodeAt(i) === 10) {
            line++;
            lineStart = i + 1;
        }
    }
    return { line, column: offset - lineStart + 1 };
};
export const formatDiagnostic = (diagnostic) => {
    const { source, start } = diagnostic.span;
    const { line, column } = locate(source, start);
    const lines = source.text.split('\n');
    const text = lines[line - 1] ?? '';
    const pointer = `${' '.repeat(Math.max(0, column - 1))}^`;
    const help = diagnostic.help ? `\nhelp: ${diagnostic.help}` : '';
    return `[galley:${diagnostic.code}] ${source.id}:${line}:${column} (line ${line}, col ${column}): ${diagnostic.message}\n${text}\n${pointer}${help}`;
};
export class GalleyDiagnosticError extends Error {
    diagnostic;
    constructor(diagnostic) {
        super(formatDiagnostic(diagnostic));
        this.name = 'GalleyDiagnosticError';
        this.diagnostic = diagnostic;
    }
}
export const fail = (code, message, at, help) => {
    throw new GalleyDiagnosticError({ code, severity: 'error', message, span: at, ...(help ? { help } : {}) });
};
//# sourceMappingURL=diagnostics.js.map