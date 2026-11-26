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
	const lineStart = start - column + 1
	const from = Math.max(lineStart, start - 40)
	const newline = source.text.indexOf('\n', start)
	const to = Math.min(newline < 0 ? source.text.length : newline, from + 120)
	const prefix = from > lineStart ? '…' : ''
	const text = prefix + source.text.slice(from, to) + (to < (newline < 0 ? source.text.length : newline) ? '…' : '')
	const pointer = `${' '.repeat(prefix.length + start - from)}^`
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

/** Syntax failures can be explained at an output tag; value restrictions retain their own source spans. */
export class GalleySyntaxError extends GalleyDiagnosticError {}

export const failSyntax = (code: string, message: string, at: SourceSpan, help?: string): never => {
	throw new GalleySyntaxError({ code, severity: 'error', message, span: at, ...(help ? { help } : {}) })
}

export const invalidTag = (message: string, at: SourceSpan, help?: string): never => {
	return fail('G3019', `Invalid template tag: ${message}`, at, `Write \\{ for a literal brace.${help ? ` ${help}` : ''}`)
}
