import { eachFamily } from './each-families.js'
import { strictSourceDigest } from './strict-families.js'
const [family, mode, ...extra] = process.argv.slice(2)
if (!['joins', 'moved'].includes(family ?? '') || (mode !== undefined && mode !== '--smoke') || extra.length) throw new Error('usage: bun differential/each-run.ts joins|moved [--smoke]')
const pins = JSON.parse(await Bun.file(new URL('./pins.json', import.meta.url)).text()) as { strictSources: string }
if (pins.strictSources !== await strictSourceDigest()) throw new Error('Pinned strict differential sources changed')
export const report = await eachFamily(family!, mode !== '--smoke')
console.log(JSON.stringify(report, null, 2))
if (report.failures.length) process.exitCode = 1
