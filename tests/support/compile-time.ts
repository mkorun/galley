/** One timed compile per fresh process. Warm the compiler using a different source. */
import galley from '../../index.js'
import { shapes } from './compile-shapes.js'
const shape = shapes[process.argv[2]!], size = Number(process.argv[3])
if (!shape || !Number.isSafeInteger(size) || size <= 0) throw new Error('Expected a known shape and positive size')
const [warm, warmOptions] = shape.make(shape.n + 1)
for (let i = 0; i < 3; i++) await galley(warm, warmOptions)
const [source, options] = shape.make(size)
const start = performance.now()
for (let i = 0; i < (shape.repetitions ?? 1); i++) await galley(source, options)
console.log(JSON.stringify({ ms: performance.now() - start, bytes: source.length }))
