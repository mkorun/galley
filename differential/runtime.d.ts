/** Narrow declarations for the offline harness; no new dependency or build emission. */
declare const Bun: {
	version: string
	spawn(command: string[], options: { timeout: number; stdout: 'pipe'; stderr: 'inherit' | 'pipe' }): { stdout: ReadableStream<Uint8Array>; stderr: ReadableStream<Uint8Array>; exited: Promise<number> }
	CryptoHasher: new (algorithm: 'sha256') => { update(data: string): { digest(encoding: 'hex'): string } }
	file(path: string | URL): { text(): Promise<string> }
	write(path: string | URL, data: string): Promise<number>
	spawnSync(command: string[], options: { timeout: number; stdout: 'pipe'; stderr: 'pipe' }): { exitCode: number; stdout: Uint8Array; stderr: Uint8Array }
}
declare const process: { argv: string[]; env: Record<string, string | undefined>; exit(code: number): never; exitCode?: number }

interface ImportMeta { readonly main: boolean }
declare module 'node:fs/promises' {
	export function mkdtemp(prefix: string): Promise<string>
	export function rm(path: string, options: { recursive: boolean; force: boolean }): Promise<void>
}
declare module 'node:os' { export function tmpdir(): string }
declare module 'node:path' { export function join(...parts: string[]): string }
