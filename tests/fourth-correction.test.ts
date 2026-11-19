import { expect, test } from 'bun:test'
import { render } from './helpers.js'

test('G-42: a URL that is also a metadata target receives its end check', async () => {
	await expect(render('<link rel="stylesheet" href="{ u }//cdn.evil.example/x.css">', { u: '/' })).rejects.toThrow('G5001')
})

test('G-42: JS in a URL can call a snippet with its own URL without replacing the caller prefix', async () => {
	await expect(render(`{#snippet s(v)}<link href='{ v }'>{/snippet}<a href="{ u }{@js} return s('') {@js}:alert(1)">`, { u: 'javascript' }, { allowCode: true })).rejects.toThrow('G5001')
})
