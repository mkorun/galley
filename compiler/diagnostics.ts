import type { Diagnostic, SourceFile, SourceSpan } from './types.js'

export const span = (source: SourceFile, start: number, end: number): SourceSpan => ({ source, start, end })

export const locate = (source: SourceFile, offset: number): { line: number; column: number } => {
	let line = 1
	let lineStart = 0
	for (let i = 0; i < Math.min(offset, source.text.length); i++) {
		if (source.text.charCodeAt(i) === 10) { line++; lineStart = i + 1 }
	}
	return { line, column: offset - lineStart + 1 }
}

export const formatDiagnostic = (diagnostic: Diagnostic): string => {
	const { source, start } = diagnostic.span
	const { line, column } = locate(source, start)
	const lines = source.text.split('\n')
	const text = lines[line - 1] ?? ''
	const pointer = `${' '.repeat(Math.max(0, column - 1))}^`
	const help = diagnostic.help ? `\nhelp: ${diagnostic.help}` : ''
	return `[galley:${diagnostic.code}] ${source.id}:${line}:${column} (line ${line}, col ${column}): ${diagnostic.message}\n${text}\n${pointer}${help}`
}

export class GalleyDiagnosticError extends Error {
	readonly diagnostic: Diagnostic

	constructor(diagnostic: Diagnostic) {
		super(formatDiagnostic(diagnostic))
		this.name = 'GalleyDiagnosticError'
		this.diagnostic = diagnostic
	}
}

export const fail = (
	code: string,
	message: string,
	at: SourceSpan,
	help?: string,
): never => {
	throw new GalleyDiagnosticError({ code, severity: 'error', message, span: at, ...(help ? { help } : {}) })
}
