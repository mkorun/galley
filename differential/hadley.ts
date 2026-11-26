import { join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import galley, { type CompileOptions } from '../index.js'
import corpus from './HADLEY-TEMPLATES.json' with { type: 'json' }

interface Collection { name: string; files: Record<string, string>; outputs: Record<string, string> }
const digest = (text: string) => new Bun.CryptoHasher('sha256').update(text).digest('hex')

/** Replay hadley's entry selection and include resolver against the branch's pre-change generated code. */
export const measureHadley = async (collections: readonly Collection[] = corpus.collections, reference?: typeof galley) => {
	let compilations = 0
	const entries = new Set<string>(), reached = new Set<string>()
	for (const collection of collections) {
		const { files, outputs } = collection
		const entryNames = Object.keys(files).filter(name => (!name.includes('/') && name.endsWith('.chase')) || name === 'markup/heading.sort')
		if (!entryNames.length) throw new Error(`No entry templates in ${collection.name}`)
		for (const name of entryNames) {
			entries.add(`${collection.name}/${name}`)
			reached.add(`${collection.name}/${name}`)
			const options: CompileOptions = {
				debug: true,
				includes: { basedir: collection.name, import: async path => {
					const partial = path.slice(collection.name.length + 1)
					if (!path.startsWith(collection.name + '/') || !Object.hasOwn(files, partial)) throw new Error(`Unknown partial: ${path}`)
					reached.add(path)
					return files[partial]!
				} },
			}
			const generated = async (compile: typeof galley) => {
				const template = await compile(files[name]!, options)
				if (template.source === undefined) throw new Error(`Missing generated code: ${name}`)
				return digest(template.source)
			}
			const expected = reference ? await generated(reference) : outputs[name]
			if (await generated(galley) !== expected) throw new Error(`Generated code differs from ${reference ? 'reference compiler' : corpus.baseline}: ${collection.name}/${name}`)
			compilations++
		}
	}
	return { entries: entries.size, files: reached.size, compilations }
}

export const normalizeTemplatePath = (path: string, separator = sep) => path.replaceAll(separator, '/')

/** Read only template files; external collections and their generated code are never recorded. */
const readCollections = async (root: string): Promise<Collection[]> => {
	const paths: string[] = []
	for await (const path of new Bun.Glob('**/templates/**/*.{chase,sort}').scan(root)) {
		paths.push(normalizeTemplatePath(path))
	}
	if (!paths.length) throw new Error(`No template collections in ${root}`)
	const collections = new Map<string, Collection>()
	for (const path of paths.sort()) {
		const parts = path.split('/'), split = parts.lastIndexOf('templates') + 1
		const name = parts.slice(0, split).join('/'), file = parts.slice(split).join('/')
		let collection = collections.get(name)
		if (!collection) { collection = { name, files: {}, outputs: {} }; collections.set(name, collection) }
		collection.files[file] = await Bun.file(join(root, path)).text()
	}
	return [...collections.values()]
}

export const runHadley = async (args: string[]) => {
	if (!args.length) return measureHadley()
	if (args.length !== 2) throw new Error('Usage: bun differential/hadley.ts [template-corpus-directory reference-compiler.ts]')
	const { default: reference } = await import(pathToFileURL(args[1]!).href)
	if (typeof reference !== 'function') throw new Error(`Reference compiler must export a default function: ${args[1]}`)
	return measureHadley(await readCollections(args[0]!), reference)
}

if (import.meta.main) console.log(await runHadley(process.argv.slice(2)))
