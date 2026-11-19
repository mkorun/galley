import type { HtmlRecord, HtmlSlot, SnippetNode, TagRecord, TemplateAst, TemplateNode, TextNode, ValueRecord } from './ast.js'
import { textPosition } from './text.js'
import { fail } from './diagnostics.js'
import type { SourceSpan } from './types.js'
import { UrlPrefix } from './url.js'

const asciiLower = (value: string): string => value.replace(/[A-Z]/g, letter => String.fromCharCode(letter.charCodeAt(0) + 32))
const SPACE = /[\t\n\f\r ]/
const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction', 'poster', 'cite', 'xlink:href'])
const ANIMATION_ELEMENTS = new Set(['set', 'animate', 'animatemotion', 'animatetransform'])
const ANIMATION_VALUES = new Set(['to', 'from', 'by', 'values'])
const TEXT_ELEMENTS = new Set(['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript'])
const INTEGRATION = new Set(['foreignobject', 'desc', 'mi', 'mo', 'mn', 'ms', 'mtext', 'annotation-xml'])
const excerpt = (text: string): string => JSON.stringify(text.length > 80 ? text.slice(0, 80) + '…' : text)
const isTarget = (tag: string, attribute: string): boolean => (tag === 'meta' && attribute === 'content') || (tag === 'link' && attribute === 'href')
const HELP = {
	G3008: 'Put the value in text or inside a quoted attribute value.',
	G3009: 'Put raw output, JS or a snippet in text or inside a quoted attribute value; snippets write no attributes.',
	G3010: 'Open and close tags and quotes within the same block; separate attributes with whitespace on every path.',
	G3011: 'A partial or snippet must preserve its entry context; recursion must use the same context.',
	G3012: 'Finish the tag, quoted value or text element before the template ends.',
	G3013: 'Keep delimiters literal. Inside <svg> or <math>, text elements hold no <, {@raw} or {@js}.',
	G3016: 'Write animation to, from, by and values attributes statically, without any template tags.',
	G3014: 'Follow HTML writing rules: write names and end tags in one piece, separate attributes with whitespace, quote values, and write a literal < as &lt;.',
}
type Refusal = keyof typeof HELP
type Position = SourceSpan | (() => SourceSpan)
const position = (at: Position): SourceSpan => typeof at === 'function' ? at() : at
type State = 'data' | 'tag' | 'after-name' | 'before-value' | 'double' | 'single' | 'text'
interface Context {
	state: State
	tag: string; attribute: string; delimited: boolean
	owner: string; strict: boolean
	svg: number; math: number; template: number
	/** Identities prevent a block closing one tag or quote and opening another. */
	tagId: number; quote: number
	tagAt: Position | null
	/** Runtime records, derived from the structure above. */
	open: ValueRecord | null; capture: TagRecord | null
}
const data = (): Context => ({ state: 'data', tag: '', attribute: '', delimited: false, owner: '', strict: false, svg: 0, math: 0, template: 0, tagId: 0, quote: 0, tagAt: null, open: null, capture: null })
const same = (a: Context, b: Context): boolean => a.owner === b.owner && a.svg === b.svg && a.math === b.math && a.template === b.template && a.tagId === b.tagId && a.quote === b.quote
const describe = (context: Context): string => `${context.state}(${context.tag || context.owner}${context.attribute ? '.' + context.attribute : ''}; tagId=${context.tagId}, quote=${context.quote}, svg=${context.svg}, math=${context.math}, template=${context.template})`
const refuse = (code: Refusal, at: Position, context: Context, rule: string, text: string): never => fail(code, `HTML context ${describe(context)}; rule ${rule}: ${excerpt(text)}`, position(at), HELP[code])
const animationValue = (context: Context, at: Position): void => {
	if ((context.state === 'double' || context.state === 'single' || context.state === 'before-value')
		&& ANIMATION_ELEMENTS.has(context.tag) && ANIMATION_VALUES.has(context.attribute)) {
		const where = position(at)
		refuse('G3016', where, context, '15', where.source.text.slice(where.start, where.end))
	}
}
interface Variant { readonly name: string; children: readonly TemplateNode[]; writes: boolean }
interface Binding { readonly node: SnippetNode; readonly scope: Scope; readonly list: Variant[]; readonly variants: Map<string, Variant>; active: Context | null }
interface Scope { readonly parent: Scope | null; readonly bindings: Map<string, Binding> }

/** The only HTML reader: accept writing rules, without predicting browser repair. */
export const readContexts = (ast: TemplateAst): TemplateAst => {
	let identity = 0, sequence = 0
	const starts: { value: ValueRecord; text: string; at: (offset: number) => SourceSpan; forbidden: boolean }[] = []
	const scripted = new Set<SnippetNode>()
	const variants = new Map<string, Variant>()
	const actualWrites = new Set<ValueRecord>()
	const renderWrites: { value: ValueRecord; name: string }[] = []
	const finishTag = (context: Context, selfClosing: boolean): void => {
		const at = context.tagAt!
		const tag = context.tag
		if (tag === 'select' || tag === 'frameset' || tag === 'plaintext' || (tag === 'col' && context.template > 0)) refuse('G3013', at, context, '9', tag)
		// HTML ignores the self-closing flag on template. Count every start conservatively.
		if (tag === 'template') context.template++
		else if ((tag === 'svg' || tag === 'math') && !selfClosing) context[tag]++
		const foreign = context.svg + context.math > 0
		const text = TEXT_ELEMENTS.has(tag) || (foreign && INTEGRATION.has(tag))
		if (TEXT_ELEMENTS.has(tag) && selfClosing) refuse('G3013', at, context, '5', tag)
		Object.assign(context, { state: 'data', tag: '', attribute: '', delimited: false, tagId: 0, quote: 0, tagAt: null, capture: null })
		if (text && !selfClosing) Object.assign(context, { state: 'text', owner: tag, strict: foreign })
	}
	const endTag = (value: string, at: number, context: Context, where: Position): number => {
		const match = /^<\/([A-Za-z][^\t\n\f\r \/>]*)[\t\n\f\r ]*>/.exec(value.slice(at))
		if (!match || /[<"'=`\0]/.test(match[1]!)) return refuse('G3014', where, context, '6', value.slice(at))
		const name = asciiLower(match[1]!)
		if (name === 'svg' || name === 'math' || name === 'template') context[name] = Math.max(0, context[name] - 1)
		return at + match[0].length
	}
	const read = (node: TextNode, context: Context, tagFollows: boolean): TextNode => {
		const value = node.value
		const at = (offset: number): SourceSpan => textPosition(node, offset)
		const records: HtmlRecord[] = []
		const open = context.open
		let index = 0
		while (index < value.length) {
			const char = value[index]!
			switch (context.state) {
				case 'data': {
					const less = value.indexOf('<', index)
					if (less < 0) { index = value.length; break }
					const rest = value.slice(less)
					if (rest.startsWith('<!--')) {
						const body = less + 4, close = value.indexOf('-->', body)
						const bang = value.slice(body, close < 0 ? value.length : close).includes('--!>')
						if (value.startsWith('>', body) || value.startsWith('->', body) || bang) refuse('G3014', at(less), context, '7', rest)
						if (close < 0) refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest)
						index = close + 3
					} else if (/^<!doctype[\t\n\f\r ]/i.test(rest)) {
						const close = /^![^<>]*>/.exec(rest.slice(1))
						if (!close) refuse(tagFollows ? 'G3013' : 'G3014', at(less), context, '7', rest)
						index = less + 1 + close![0].length
					} else if (rest.startsWith('</')) index = endTag(value, less, context, () => at(less))
					else {
						const name = /^<([A-Za-z][^\t\n\f\r \/>]*)/.exec(rest)
						if (!name || /[<"'=`\0]/.test(name[1]!)) return refuse('G3014', at(less), context, '1/2', rest)
						Object.assign(context, { state: 'tag', tag: asciiLower(name[1]!), attribute: '', delimited: false, tagId: ++identity, tagAt: () => at(less) })
						if (context.tag === 'meta' || context.tag === 'link') {
							context.capture = { kind: 'tag-open', at: less, dynamic: false }
							records.push(context.capture)
						}
						index = less + name[0].length
					}
					break
				}
				case 'tag': {
					if (SPACE.test(char)) { context.delimited = true; index++; break }
					if (char === '>' || value.startsWith('/>', index)) {
						index += char === '>' ? 1 : 2
						if (context.capture) records.push({ kind: 'tag-close', at: index, tag: context.capture })
						finishTag(context, char !== '>')
						break
					}
					if (char === '/' || char === '=' || !context.delimited) refuse('G3014', at(index), context, '3/5', value.slice(index))
					const name = /^[^\t\n\f\r \/>=]+/.exec(value.slice(index))![0]
					if (/["'<`\0]/.test(name)) refuse('G3014', at(index), context, '3', name)
					context.attribute = asciiLower(name)
					context.delimited = false
					index += name.length
					if (isTarget(context.tag, context.attribute)) records.push({ kind: 'target', at: index, tag: context.capture! })
					if (value[index] === '=') { context.state = 'before-value'; index++ }
					else if (SPACE.test(value[index]!)) context.state = 'after-name'
					break
				}
				case 'after-name':
					if (SPACE.test(char)) { index++; break }
					if (char === '=') { context.state = 'before-value'; index++ }
					else Object.assign(context, { state: 'tag', delimited: true, attribute: '' })
					break
				case 'before-value': {
					if (SPACE.test(char)) { index++; break }
					if (char === '"' || char === "'") {
						context.state = char === '"' ? 'double' : 'single'; context.quote = ++identity; index++
						if (value.indexOf(char, index) < 0) {
							const start = index
							const prefix = URL_ATTRIBUTES.has(context.attribute) ? new UrlPrefix(context.attribute) : null
							const startText = value.slice(start), ampersand = startText.indexOf('&')
							prefix?.feed(ampersand < 0 ? startText : startText.slice(0, ampersand))
							const url = prefix && !prefix.settled ? context.attribute : null
							const tag = isTarget(context.tag, context.attribute) ? context.capture : null
							if (url !== null || tag) { context.open = { kind: 'value-open', at: index, url, tag, dynamic: false }; records.push(context.open)
								if (prefix && !prefix.settled && (prefix.forbidden || ampersand >= 0)) starts.push({ value: context.open, text: value.slice(start), at: offset => at(start + offset), forbidden: prefix.forbidden })
							}
						}
						break
					}
					const unquoted = /^[^\t\n\f\r >]+/.exec(value.slice(index))
					if (!unquoted || /["'<=`]/.test(unquoted[0]) || index + unquoted[0].length === value.length) return refuse('G3014', at(index), context, '4', value.slice(index))
					index += unquoted[0].length
					Object.assign(context, { state: 'tag', attribute: '', delimited: false })
					break
				}
				case 'double': case 'single': {
					const close = value.indexOf(context.state === 'double' ? '"' : "'", index)
					if (close < 0) { index = value.length; break }
					if (context.open) records.push({ kind: 'value-close', at: close })
					index = close + 1
					Object.assign(context, { state: 'tag', attribute: '', delimited: false, quote: 0, open: null })
					break
				}
				case 'text': {
					const less = value.indexOf('<', index)
					if (less < 0) { index = value.length; break }
					const end = '</' + context.owner
					const rest = asciiLower(value.slice(less, less + end.length + 1))
					if (rest.startsWith(end) && /^[\t\n\f\r \/>]/.test(rest.slice(end.length))) {
						Object.assign(context, { state: 'data', owner: '', strict: false })
						break
					}
					if (((end + '>').startsWith(rest) || (context.owner === 'script' && '<!--'.startsWith(rest)))) refuse('G3014', at(less), context, '8', rest)
					if (context.strict || (context.owner === 'script' && rest.startsWith('<!--'))) refuse('G3013', at(less), context, '8/13', rest)
					index = less + 1
					break
				}
			}
		}
		return { ...node, records, ...(open ? { open } : {}) }
	}
	const boundary = (context: Context, at: Position, code: Refusal = 'G3014'): void => {
		if (context.state === 'after-name') Object.assign(context, { state: 'tag', delimited: true, attribute: '' })
		else if (context.state === 'tag') context.attribute = ''
		else if (context.state === 'before-value') { const where = position(at); refuse(code, where, context, '11', where.source.text.slice(where.start, where.end)) }
	}
	const slot = (context: Context, at: SourceSpan, opaque: boolean, render = false): HtmlSlot => {
		const place = context.state === 'data' ? 'text' : context.state === 'text' ? `text:${context.owner}` : `attr:${context.tag}.${context.attribute}`
		if (context.state === 'double' || context.state === 'single') {
			const value = context.open
			if (value) { value.dynamic = true; if (!render) actualWrites.add(value); if (value.tag) value.tag.dynamic = true }
			return { place, url: value?.url != null, metadata: value?.tag != null }
		}
		if (context.state === 'data' || context.state === 'text') {
			if (context.strict && (opaque || context.owner === 'script' || context.owner === 'style')) refuse('G3013', at, context, '13', at.source.text.slice(at.start, at.end))
			return { place, url: false, metadata: false }
		}
		return refuse(opaque || render ? 'G3009' : 'G3008', at, context, '10', at.source.text.slice(at.start, at.end))
	}
	const declare = (nodes: readonly TemplateNode[], scope: Scope): void => {
		for (const node of nodes) {
			if (node.kind === 'snippet') scope.bindings.set(node.name, { node, scope, list: [], variants: new Map(), active: null })
			else if (node.kind === 'partial') declare(node.children ?? [], scope)
		}
	}
	const openScope = (nodes: readonly TemplateNode[], parent: Scope | null): Scope => {
		const scope: Scope = { parent, bindings: new Map() }; declare(nodes, scope); return scope
	}
	// Only unmarked visible bindings need a visit at a JS block. Shadowing temporarily hides them.
	const visible = new Map<string, Binding>(), unmarked = new Set<Binding>()
	const markScripted = (nodes: readonly TemplateNode[], scope: Scope): void => {
		const previous = new Map<string, Binding>()
		for (const [name, binding] of scope.bindings) {
			const outer = visible.get(name)
			if (outer) { previous.set(name, outer); unmarked.delete(outer) }
			visible.set(name, binding); unmarked.add(binding)
		}
		for (const node of nodes) {
			if (node.kind === 'js') {
				for (const binding of unmarked) scripted.add(binding.node)
				unmarked.clear()
			} else if (node.kind === 'partial') markScripted(node.children ?? [], { parent: scope, bindings: new Map() })
			else if (node.kind === 'if') for (const branch of node.branches) markScripted(branch.children, openScope(branch.children, scope))
			else if (node.kind === 'each' || node.kind === 'snippet') markScripted(node.children, openScope(node.children, scope))
		}
		for (const [name, binding] of scope.bindings) { visible.delete(name); unmarked.delete(binding) }
		for (const [name, binding] of previous) {
			visible.set(name, binding)
			if (!scripted.has(binding.node)) unmarked.add(binding)
		}
	}
	const resolve = (scope: Scope, name: string): Binding => {
		for (let current: Scope | null = scope; current; current = current.parent) { const binding = current.bindings.get(name); if (binding) return binding }
		throw new Error(`Unresolved checked snippet ${name}`)
	}
	const path = (children: readonly TemplateNode[], entry: Context, scope: Scope, code: Refusal, at: SourceSpan, closes = true): { children: readonly TemplateNode[]; delimited: boolean } => {
		const exit = { ...entry }, result = visit(children, exit, scope, closes)
		const last = children[children.length - 1]
		const end = (): SourceSpan => last?.kind === 'text' && last.value.length ? textPosition(last, last.value.length - 1) : at
		if (closes) animationValue(exit, end)
		boundary(exit, end, code)
		if (!same(entry, exit)) refuse(code, end, entry, '11', describe(exit))
		return { children: result, delimited: exit.delimited }
	}
	const specialize = (binding: Binding, entry: Context, at: SourceSpan): string => {
		const key = JSON.stringify([entry.state, entry.tag, entry.attribute, entry.owner, entry.svg, entry.math, entry.template, entry.open?.url != null])
		const known = binding.variants.get(key)
		if (known) return known.name
		if (binding.active) refuse('G3011', at, binding.active, '11', describe(entry))
		const variant: Variant = { name: `$$snippet${++sequence}`, children: [], writes: false }
		variants.set(variant.name, variant)
		binding.variants.set(key, variant); binding.list.push(variant); binding.active = entry
		variant.children = path(binding.node.children, entry, openScope(binding.node.children, binding.scope), 'G3011', binding.node.span).children
		binding.active = null
		return variant.name
	}
	const visit = (nodes: readonly TemplateNode[], context: Context, scope: Scope, closes = false): readonly TemplateNode[] => {
		const result: TemplateNode[] = []
		for (const [index, node] of nodes.entries()) {
			if (node.kind === 'text') { result.push(read(node, context, index + 1 < nodes.length || closes)); continue }
			animationValue(context, node.span)
			if (node.kind === 'const') { boundary(context, node.span); result.push(node); continue }
			if (node.kind === 'snippet') {
				boundary(context, node.span)
				const binding = scope.bindings.get(node.name)!
				result.push({ ...node, variants: binding.list, ...(scripted.has(node) ? { js: specialize(binding, data(), node.span) } : {}) }); continue
			}
			if (node.kind === 'output' || node.kind === 'js') { result.push({ ...node, slot: slot(context, node.span, node.kind === 'js' || node.raw) }); continue }
			boundary(context, node.span, node.kind === 'render' ? 'G3009' : node.kind === 'partial' ? 'G3011' : 'G3010')
			switch (node.kind) {
				case 'if': {
					const paths = node.branches.map(branch => path(branch.children, context, openScope(branch.children, scope), 'G3010', branch.span))
					const ends = paths.map(item => item.delimited)
					if (node.branches[node.branches.length - 1]!.condition !== null) ends.push(context.delimited)
					context.delimited = ends.every(Boolean)
					result.push({ ...node, branches: node.branches.map((branch, index) => ({ ...branch, children: paths[index]!.children })) }); break
				}
				case 'each': {
					const body = path(node.children, { ...context, delimited: false }, openScope(node.children, scope), 'G3010', node.span)
					context.delimited &&= body.delimited
					result.push({ ...node, children: body.children }); break
				}
				case 'partial': {
					const body = path(node.children ?? [], context, scope, 'G3011', node.span, false)
					context.delimited = body.delimited; result.push(...body.children); break
				}
				case 'render': {
					// Inspect animation attributes supplied by a snippet before the general attribute-writing refusal.
					let specialization: string | undefined
					if (ANIMATION_ELEMENTS.has(context.tag)) specialization = specialize(resolve(scope, node.name), context, node.span)
					const written = slot(context, node.span, false, true)
					specialization ??= specialize(resolve(scope, node.name), context, node.span)
					if (context.open) renderWrites.push({ value: context.open, name: specialization })
					result.push({ ...node, slot: written, specialization }); break
				}
			}
		}
		return result
	}
	const scope = openScope(ast.children, null)
	markScripted(ast.children, scope)
	const context = data(), children = visit(ast.children, context, scope)
	if (context.state !== 'data') refuse('G3012', { ...ast.span, start: ast.span.end }, context, '12', describe(context))
	// Static-only snippets feed literal suffixes, but do not turn a static URL into a dynamic one.
	// Propagate actual writes backwards over snippet calls; the queue visits each edge once, including cycles.
	const callers = new Map<string, Variant[]>(), pending: Variant[] = []
	const inspect = (nodes: readonly TemplateNode[], variant: Variant): void => {
		for (const node of nodes) {
			if (node.kind === 'output' || node.kind === 'js') variant.writes = true
			else if (node.kind === 'render') {
				const name = node.specialization!
				const list = callers.get(name) ?? []; list.push(variant); callers.set(name, list)
			} else if (node.kind === 'if') for (const branch of node.branches) inspect(branch.children, variant)
			else if (node.kind === 'each') inspect(node.children, variant)
		}
	}
	for (const variant of variants.values()) { inspect(variant.children, variant); if (variant.writes) pending.push(variant) }
	for (let index = 0; index < pending.length; index++) for (const caller of callers.get(pending[index]!.name) ?? []) {
		if (!caller.writes) { caller.writes = true; pending.push(caller) }
	}
	for (const render of renderWrites) if (variants.get(render.name)!.writes) actualWrites.add(render.value)
	for (const start of starts) if (actualWrites.has(start.value)) {
		if (start.forbidden) fail('G3015', `HTML context URL; forbidden static prefix: ${excerpt(start.text)}`, start.at(0), 'Use a relative URL, or http:, https:, mailto: or tel:, before a dynamic value.')
		fail('G3015', `HTML context URL; rule 14: ${excerpt(start.text)}`, start.at(start.text.indexOf('&')), 'Write the character itself, not a reference, before a value in a URL.')
	}
	return { ...ast, children }
}
