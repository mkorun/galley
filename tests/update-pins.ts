// Explicit maintenance command: regenerate input digests after reviewing fixture changes.
import { generate, extend } from '../differential/model.js'
import { strictSourceDigest } from '../differential/strict-families.js'
import { encode } from '../differential/model.js'
const hash = (text: string) => new Bun.CryptoHasher('sha256').update(text).digest('hex')
await Bun.write(new URL('../differential/pins.json', import.meta.url), JSON.stringify({ strictSources: await strictSourceDigest(), generated: hash(JSON.stringify([...generate(), ...extend()].map(encode))), corpus: hash(await Bun.file(new URL('../differential/corpus.json', import.meta.url)).text()) }, null, 2) + '\n')
