/** Narrow declarations for the isolated Bun mutation loader, without a dependency or build emission. */
declare var __mutationStep: () => void

declare module 'bun' {
	export function plugin(plugin: {
		name: string
		setup(build: {
			onLoad(options: { filter: RegExp }, load: (args: { path: string }) => Promise<{ contents: string; loader: 'ts' }>): void
		}): void
	}): void
}
