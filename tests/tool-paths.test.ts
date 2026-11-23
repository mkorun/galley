import { expect, spyOn, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

test('timing probes spawn native paths even when their directory needs URL escaping', async () => {
	// Copied fixture modules belong under the existing tests/** coverage exclusion.
	const directory = await mkdtemp(join(fileURLToPath(new URL('./', import.meta.url)), 'galley probes # %-'))
	const argv = process.argv
	const spawn = spyOn(Bun, 'spawn').mockImplementation(() => ({
		stdout: new Response('{"ms":1,"bytes":1}').body!,
		stderr: new Response('').body!, exited: Promise.resolve(0),
	}) as any)
	const spawnSync = spyOn(Bun, 'spawnSync').mockReturnValue({ exitCode: 0, stdout: new TextEncoder().encode('1'), stderr: new Uint8Array() } as any)
	const log = spyOn(console, 'log').mockImplementation(() => {})
	try {
		for (const [folder, name] of [['support', 'compile-growth.ts'], ['support', 'compile-shapes.ts'], ['bench', 'first-probe.ts']] as const) {
			await Bun.write(join(directory, name), await Bun.file(new URL(`./${folder}/${name}`, import.meta.url)).text())
		}
		const growth = await import(pathToFileURL(join(directory, 'compile-growth.ts')).href)
		await growth.measureGrowth(['textElements'])
		expect(spawn).toHaveBeenCalledTimes(10)
		for (const [command] of spawn.mock.calls) expect(command[1]).toBe(join(directory, 'compile-time.ts'))
		process.argv = [argv[0]!, 'first-probe.ts', directory]
		await import(pathToFileURL(join(directory, 'first-probe.ts')).href)
		expect(spawnSync).toHaveBeenCalledTimes(4)
		for (const [command] of spawnSync.mock.calls) expect(command[1]).toBe(join(directory, 'first-shape.ts'))
	} finally {
		process.argv = argv
		spawn.mockRestore()
		spawnSync.mockRestore()
		log.mockRestore()
		await rm(directory, { recursive: true, force: true })
	}
})

test('mutation loader recognises both native path separators and instruments loops', async () => {
	const loader = new URL('./support/mutation-budget.ts', import.meta.url)
	const inspection = Bun.spawnSync(['bun', '--eval', `
		const { compilerPath } = await import(${JSON.stringify(loader.href)})
		for (const path of ${JSON.stringify(['/tmp/space dir/compiler/probe.ts', 'C:\\space dir\\compiler\\probe.ts'])}) {
			if (!compilerPath.test(path)) throw new Error('Loader missed compiler path: ' + path)
		}
		if (compilerPath.test('/tmp/tests/probe.ts')) throw new Error('Loader includes tests')
	`], { timeout: 2000, stdout: 'pipe', stderr: 'pipe' })
	expect(inspection.exitCode, new TextDecoder().decode(inspection.stderr)).toBe(0)
	const directory = await mkdtemp(join(tmpdir(), 'galley loop # %-'))
	try {
		const path = join(directory, 'compiler', 'probe.ts')
		await Bun.write(path, 'while (true) {}')
		const loop = Bun.spawnSync(['bun', '--preload', fileURLToPath(loader), path], { timeout: 2000, stdout: 'pipe', stderr: 'pipe' })
		expect(loop.exitedDueToTimeout).toBe(false)
		expect(loop.exitCode).not.toBe(0)
		expect(new TextDecoder().decode(loop.stderr)).toContain('deterministic loop budget exhausted')
	} finally { await rm(directory, { recursive: true, force: true }) }
})
