import { main } from './numbers.js'

// 0.5.0 is recorded from a copy of its sources: git archive v0.5.0 compiler index.ts types.ts util.ts | tar -x -C <directory>
if (!await main(process.argv.slice(2), new URL('./NUMBERS-0.5.0.json', import.meta.url))) process.exitCode = 1
