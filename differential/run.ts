import galley from '../index.js'
import util from '../util.js'
import { browserPage, readBrowserOutput } from './browser.js'
import { decode, encode, extend, generate, SEED, type Fixture } from './model.js'
import { violations, type Result } from './oracle.js'

const args = process.argv.slice(2)
if (args.length) throw new Error('usage: bun differential/run.ts')
const corpusText = await Bun.file(new URL('./corpus.json', import.meta.url)).text()
const corpus = JSON.parse(corpusText) as { version: number; cases: unknown[] }
if (corpus.version !== 1 || !Array.isArray(corpus.cases)) throw new Error('Unsupported corpus format')
const generated = [...generate(), ...extend()]
const pins = JSON.parse(await Bun.file(new URL('./pins.json', import.meta.url)).text()) as { generated: string; corpus: string }
const inputDigest = new Bun.CryptoHasher('sha256').update(JSON.stringify(generated.map(encode))).digest('hex')
const corpusDigest = new Bun.CryptoHasher('sha256').update(corpusText).digest('hex')
if (inputDigest !== pins.generated || corpusDigest !== pins.corpus) throw new Error('Pinned differential inputs changed')
const fixtures = [...corpus.cases.map(value => decode(value) as Fixture), ...generated]
const path = '/tmp/galley-context-differential.html'
await Bun.write(path, browserPage(fixtures))
const browser = Bun.spawnSync(['chromium', '--headless', '--renderer-process-limit=1', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--dump-dom', `file://${path}`], { timeout: 30000, stdout: 'pipe', stderr: 'pipe' })
if (browser.exitCode !== 0) throw new Error('Required Chromium failed: ' + new TextDecoder().decode(browser.stderr))
const observations = readBrowserOutput(new TextDecoder().decode(browser.stdout))
if (observations.length !== fixtures.length) throw new Error('Browser case count differs')
let checkpoints = 0, stops = 0, refusals = 0
const failures = []
for (let index = 0; index < fixtures.length; index++) {
	const fixture = fixtures[index]!
	let result: Result
	try {
		const compiled = await galley(fixture.source)
		try { result = { phase: 'render', output: await compiled.render(fixture.data, util) } }
		catch (error) { result = { phase: 'render', error: String((error as Error).message) }; stops++ }
	} catch (error) { result = { phase: 'compile', error: String((error as Error).message) }; refusals++ }
	checkpoints += fixture.writes.length
	for (const failure of violations(fixture, observations[index]!, result)) failures.push({ id: fixture.id, ...failure })
}
const version = Bun.spawnSync(['chromium', '--version'], { timeout: 10000, stdout: 'pipe', stderr: 'pipe' })
if (version.exitCode !== 0) throw new Error('Cannot read browser version')
const family = (name: string): number => generated.filter(fixture => fixture.id.startsWith(name + '-')).length
const report = { inputDigest, corpusDigest, seed: '0x' + SEED.toString(16), browser: new TextDecoder().decode(version.stdout).trim(), corpus: corpus.cases.length, generated: generated.length, fresh: family('fresh'), mutations: family('mutated'), boundary: family('boundary'), snippet: family('snippet'), foreign: family('foreign'), numeric: family('numeric'), cases: fixtures.length, checkpoints, stops, refusals, failures }
await Bun.write(new URL('./RESULT.json', import.meta.url), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (failures.length) process.exitCode = 1
