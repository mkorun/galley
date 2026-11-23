/** One browser selection for every differential transport and version probe. */
export const runChromium = (args: string[], timeout: number) => {
	const executable = process.env.GALLEY_CHROMIUM ?? 'chromium'
	try {
		const child = Bun.spawnSync([executable, ...args], { timeout, stdout: 'pipe', stderr: 'pipe' })
		if (child.exitedDueToTimeout) throw new Error(`timeout after ${timeout} ms`)
		if (child.exitCode !== 0) throw new Error(`exit ${child.exitCode}: ${new TextDecoder().decode(child.stderr)}`)
		return child
	} catch (error) {
		throw new Error(`Chromium selected by GALLEY_CHROMIUM=${JSON.stringify(executable)} failed: ${String(error)}`)
	}
}
