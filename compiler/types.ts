export interface SourceFile {
	readonly id: string
	readonly text: string
}

export interface SourceSpan {
	readonly source: SourceFile
	readonly start: number
	readonly end: number
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info'

export interface Diagnostic {
	readonly code: string
	readonly severity: DiagnosticSeverity
	readonly message: string
	readonly span: SourceSpan
	readonly help?: string
}

export interface IncludeResolver {
	/** Resolve an already validated, relative partial path. The host remains responsible for filesystem boundary enforcement. */
	readonly import: (path: string, encoding: 'utf-8') => Promise<string>
	readonly basedir?: string
}

export interface CompileOptions extends LintOptions {
	readonly includes?: IncludeResolver
	readonly sourceId?: string
	readonly strip?: boolean
	readonly debug?: boolean
	readonly stripEmptyMeta?: boolean
}

/** Hadley's project-level compiler configuration always provides partial loading. */
export interface GalleyOptions extends Omit<CompileOptions, 'includes'> {
	readonly includes: IncludeResolver
}

/** Dynamic runtime filter boundary; individual filters retain their precise signatures. */
export type FilterFunction = (value: any, ...args: any[]) => unknown
export type FilterMap = Readonly<Record<string, FilterFunction>>

export interface SyncTemplate<Data extends object = Record<string, unknown>> {
	readonly async: false
	readonly diagnostics: readonly Diagnostic[]
	readonly source?: string
	render(data: Data): string
}

export interface AsyncTemplate<Data extends object = Record<string, unknown>> {
	readonly async: true
	readonly diagnostics: readonly Diagnostic[]
	readonly source?: string
	render(data: Data): Promise<string>
}

export type CompiledTemplate<Data extends object = Record<string, unknown>> =
	| SyncTemplate<Data>
	| AsyncTemplate<Data>

export type GalleyTemplate<Data extends object = Record<string, unknown>> = SyncTemplate<Data>
export type GalleyTemplateAsync<Data extends object = Record<string, unknown>> = AsyncTemplate<Data>

export interface LintOptions {
	readonly filters?: FilterMap
	readonly allowCode?: boolean
}
