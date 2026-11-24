import { rule17Family } from './rule17-families.js'
import { strictSourceDigest } from './strict-families.js'
if (process.argv.length !== 2) throw new Error('usage: bun differential/rule17-run.ts')
const pins = JSON.parse(await Bun.file(new URL('./pins.json', import.meta.url)).text()) as { strictSources: string }
if (pins.strictSources !== await strictSourceDigest()) throw new Error('Pinned strict differential sources changed')
export const report = await rule17Family()
console.log(JSON.stringify(report, null, 2))
if (report.failures.length) process.exitCode = 1
