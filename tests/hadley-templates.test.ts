import { expect, test } from 'bun:test'
import { measureHadley, runHadley } from '../differential/hadley.js'

import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import corpus from '../differential/HADLEY-TEMPLATES.json' with { type: 'json' }

test('hadley: the committed corpus contains only the two public themes, with identical code', async () => {
	expect(corpus.collections.map(collection => collection.name)).toEqual([
		'hadley/themes/hems/templates', 'hadley/themes/punch/templates',
	])
	expect(corpus.collections.reduce((total, collection) => total + Object.keys(collection.files).length, 0)).toBe(31)
	expect(await runHadley([])).toEqual({ entries: 18, files: 29, compilations: 18 })
	const first = corpus.collections[0]!
	const key = Object.keys(first.outputs)[0]! as keyof typeof first.outputs
	const expected = first.outputs[key]
	try {
		first.outputs[key] = 'wrong'
		await expect(measureHadley()).rejects.toThrow('Generated code differs from')
	} finally { first.outputs[key] = expected }
})

test('hadley: an external directory is compared with an explicit reference compiler without recording sources', async () => {
	const root = await mkdtemp(join(tmpdir(), 'galley-hadley-'))
	try {
		const reference = join(root, 'reference.ts')
		await Bun.write(reference, `export { default } from ${JSON.stringify(fileURLToPath(new URL('../index.ts', import.meta.url)))}`)
		await expect(runHadley([root])).rejects.toThrow('Usage:')
		await expect(runHadley([root, reference, 'extra'])).rejects.toThrow('Usage:')
		await expect(runHadley([root, reference])).rejects.toThrow('No template collections')
		await Bun.write(`${root}/example/templates/unused.sort`, 'unused')
		await expect(runHadley([root, reference])).rejects.toThrow('No entry templates')
		await Bun.write(`${root}/example/templates/page.chase`, '{@partial parts/body.sort}')
		await Bun.write(`${root}/example/templates/parts/body.sort`, '<p>{ title }</p>')
		await Bun.write(`${root}/example/templates/markup/heading.sort`, '{ title }')
		expect(await runHadley([root, reference])).toEqual({ entries: 2, files: 3, compilations: 2 })
		const changed = join(root, 'changed.ts')
		await Bun.write(changed, 'export default async () => ({ source: "changed" })')
		await expect(runHadley([root, changed])).rejects.toThrow('Generated code differs from')
		const missing = join(root, 'missing.ts')
		await Bun.write(missing, 'export default async () => ({})')
		await expect(runHadley([root, missing])).rejects.toThrow('Missing generated code:')
		const invalid = join(root, 'invalid.ts')
		await Bun.write(invalid, 'export default null')
		await expect(runHadley([root, invalid])).rejects.toThrow('Reference compiler must export a default function:')
		await Bun.write(`${root}/example/templates/page.chase`, '{@partial absent.sort}')
		await expect(runHadley([root, reference])).rejects.toThrow('Unknown partial:')
	} finally { await rm(root, { recursive: true, force: true }) }
})
