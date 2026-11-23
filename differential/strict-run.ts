import { strictFamilies, strictSourceDigest } from './strict-families.js'

const args = process.argv.slice(2)
const full = args.length === 0
if (!full && (args.length !== 1 || args[0] !== '--smoke')) throw new Error('usage: bun differential/strict-run.ts [--smoke]')
const pins = JSON.parse(await Bun.file(new URL('./pins.json', import.meta.url)).text()) as { strictSources: string }
if (pins.strictSources !== await strictSourceDigest()) throw new Error('Pinned strict differential sources changed')
export const report = await strictFamilies(full)
if (full) await Bun.write(new URL('./STRICT-RESULT.json', import.meta.url), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (report.failures.length) process.exitCode = 1
