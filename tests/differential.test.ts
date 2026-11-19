import { expect, test } from 'bun:test'
import { encode, decode, extend, generate, random, SEED, type Fixture } from '../differential/model.js'
import { forbidden, nearMiss, replay, violations, type Violation } from '../differential/oracle.js'
import { browserPage, readBrowserOutput } from '../differential/browser.js'

const fixture = (overrides: Partial<Fixture> = {}): Fixture => ({ id: 'fixture', source: '<a href="{ a }">', data: { a: '/x' }, expected: '<a href="/x">', writes: [{ attribute: 'href', serialized: '/x', cause: 'first' }], html: '<a href="GALLEY_SLOT">', slot: 'href', ...overrides })

test('differential PRNG independently agrees far into its stream and bounded generation is reproducible', () => {
	let reference = BigInt(SEED)
	const next = random(SEED)
	for (let index = 0; index < 10000; index++) {
		reference = (reference * 1664525n + 1013904223n) & 0xffffffffn
		expect(next()).toBe(Number(reference))
	}
	const cases = generate()
	expect(cases).toHaveLength(512)
	expect(cases.filter(item => item.id.startsWith('mutated'))).toHaveLength(256)
	expect(new Set(cases.flatMap(item => item.slot ? [item.slot] : [])).size).toBe(7)
	expect(generate()).toEqual(cases)
	for (const [seed, count] of [[-1, 1], [0x100000000, 1], [1.1, 1], [1, 0], [1, 4097], [1, 1.5]]) expect(() => generate(seed, count)).toThrow('Invalid seed or count')
})

test('lossless corpus codec preserves UTF-16, special numbers, undefined keys and rejects malformed records', () => {
	const value = { missingValue: undefined, text: '\ud800\ufeff\ue000', array: [null, undefined, -0, NaN, Infinity, -Infinity, 1.25, true], object: { value: 'x' } }
	const restored = decode(JSON.parse(JSON.stringify(encode(value)))) as typeof value
	expect(restored).toEqual(value)
	expect(Object.hasOwn(restored, 'missingValue')).toBe(true)
	expect(Object.is(restored.array[2], -0)).toBe(true)
	expect(Object.keys(decode(['object', [['__proto__', ['scalar', 'safe']]]]) as object)).toEqual(['__proto__'])
	for (const bad of [null, 1, [], ['bad'], ['scalar', undefined], ['number', 'wat'], ['array', 'x'], ['object', [[2, ['scalar', 'x']]]], ['object', [['x', ['scalar', 1]]]], ['object', [['x', ['scalar', 'a']], ['x', ['scalar', 'b']]]], ['undefined', null, null]]) expect(() => decode(bad)).toThrow()
	expect(() => encode(Symbol('unsupported'))).toThrow('Unsupported corpus value')
})

test('oracle faults: protocols, trusted suffixes, empty writes, output loss, markers and attribution', () => {
	for (const value of ['//other.example/x', '\\\\other.example', 'ftp://base.example/x', '\tjava\nscript:x']) expect(forbidden(value)).toBe(true)
	for (const value of ['https://other.example/x', '/tags/javascript:x', '\ufeffjavascript:x', '\ufffdjavascript:x']) expect(forbidden(value)).toBe(false)
	const observation = { decoded: ['/x'], slots: ['href'] }
	expect(violations(fixture(), observation, { phase: 'render', output: '<a href="/x">' })).toEqual([])
	expect(violations(fixture(), observation, { phase: 'render', output: '<a href="">' })[0]?.kind).toBe('output-mismatch')
	expect(violations(fixture(), observation, { phase: 'render', error: 'reject all' })[0]?.kind).toBe('unexpected-refusal')
	const dangerous = fixture({ writes: [{ attribute: 'href', serialized: 'javascript:x', cause: 'second-with-prior' }] })
	for (const result of [{ phase: 'render', output: dangerous.expected }, { phase: 'compile', error: 'G5001: href="javascript:x" is no URL a template may write there:' }, { phase: 'render', error: 'G5001 include failed' }, { phase: 'render', error: 'G5001: src="javascript:x" is no URL a template may write there:' }, { phase: 'render', error: 'G5001: href="another" is no URL a template may write there:' }] as const) expect(violations(dangerous, { decoded: ['javascript:x'], slots: ['href'] }, result)[0]?.cause).toBe('second-with-prior')
	expect(violations(dangerous, { decoded: ['javascript:x'], slots: ['href'] }, { phase: 'render', error: 'G5001: href="javascript:x" is no URL a template may write there: details' })).toEqual([])
	expect(violations(fixture({ expected: '\ue000\ue001\ue002\ue003' }), observation, { phase: 'render', output: '&#xE000;&#xE001;&#xE002;&#xE003;' })).toEqual([])
	expect(violations(fixture({ writes: [], expected: '<a href="javascript:x">' }), { decoded: [], slots: ['href'] }, { phase: 'render', output: '<a href="javascript:x">' })).toEqual([])
	expect(violations(fixture({ slot: null }), { decoded: ['/x'], slots: ['href'] }, { phase: 'render', output: '' })).toHaveLength(2)
	expect(violations(fixture(), { decoded: ['/x'], slots: [] }, { phase: 'render', output: '' })).toHaveLength(2)
	expect(violations(fixture({ refusal: 'G3008', writes: [] }), { decoded: [], slots: [] }, { phase: 'render', output: '' })[0]?.kind).toBe('missing-compile-refusal')
	expect(() => violations(fixture(), { decoded: [], slots: [] }, { phase: 'render', output: '' })).toThrow('Oracle checkpoint count differs')
})

test('witness near-miss causes, allowed reductions and failed final replay remain distinct', () => {
	const witnesses: Violation[] = [{ component: 'href', kind: 'missing-attributed-stop', cause: nearMiss(true, 'java') }]
	expect(nearMiss(true, 'java')).not.toBe(nearMiss(false, 'java'))
	expect(nearMiss(true, '')).not.toBe(nearMiss(true, 'java'))
	expect(replay(witnesses, witnesses)).toBe(true)
	expect(replay(witnesses, [...witnesses, { ...witnesses[0]!, component: 'src' }])).toBe(true)
	expect(replay(witnesses, [{ ...witnesses[0]!, cause: nearMiss(false, 'java') }])).toBe(false)
	expect(replay(witnesses, [])).toBe(false)
	expect(replay([], [])).toBe(false)
})

test('browser transport rejects absent/malformed observations and safely quotes corpus HTML', () => {
	expect(browserPage([fixture({ html: '</script>\ud800' })])).not.toContain('"</script>')
	const wrap = (value: unknown) => '<pre id="result">' + btoa(JSON.stringify(value)) + '</pre>'
	expect(readBrowserOutput(wrap([{ decoded: ['ok'], slots: ['href'] }]))).toEqual([{ decoded: ['ok'], slots: ['href'] }])
	for (const value of [null, [null], [{}], [{ decoded: [1], slots: [] }], [{ decoded: [], slots: [1] }]]) expect(() => readBrowserOutput(wrap(value))).toThrow('Malformed browser observations')
	expect(() => readBrowserOutput('<pre></pre>')).toThrow('Chromium returned no oracle observations')
})

test('required Chromium differential and committed corpus replay', async () => {
	const argv = process.argv
	process.argv = [argv[0]!, 'differential/run.ts']
	try { await import('../differential/run.ts') }
	finally { process.argv = argv }
	const result = await Bun.file(new URL('../differential/RESULT.json', import.meta.url)).json()
	expect(result.failures).toEqual([])
	expect(result.cases).toBe(1002)
	expect([result.boundary, result.snippet, result.foreign, result.numeric]).toEqual([168, 120, 120, 0])
	expect(result.seed).toBe('0x20261117')
}, 30000)


test('oracle preserves secondary slot failures and actual near-miss branch causes', () => {
	const f = fixture({ expected: '<i>A</i><b>B</b>', writes: [], slot: null, components: [{ id: 'a', before: '<i>', after: '</i>', expected: 'A' }, { id: 'b', before: '<b>', after: '</b>', expected: 'B' }] })
	const failures = violations(f, { decoded: [], slots: [] }, { phase: 'render', output: '<i></i><b></b>' })
	expect(failures.filter(item => item.kind === 'slot-value-mismatch').map(item => item.component)).toEqual(['a', 'b'])
	for (const active of [true, false]) {
		const source = fixture({ id: 'near-miss-' + active, data: { active }, writes: [{ attribute: 'href', serialized: 'java', cause: 'first' }, { attribute: 'href', serialized: 'javascript:x', cause: 'second' }] })
		expect(violations(source, { decoded: ['java', 'javascript:x'], slots: ['href'] }, { phase: 'render', output: source.expected })[0]?.cause).toBe(nearMiss(active, 'java'))
	}
})

test('a planted synchronous hang is killed and the next subprocess succeeds', () => {
	const hung = Bun.spawnSync(['bun', '--eval', 'while(true){}'], { timeout: 100, stdout: 'pipe', stderr: 'pipe' })
	expect(hung.exitCode).not.toBe(0)
	const crashed = Bun.spawnSync(['bun', '--eval', 'process.exit(3)'], { timeout: 2000, stdout: 'pipe', stderr: 'pipe' })
	expect(crashed.exitCode).toBe(3)
	const next = Bun.spawnSync(['bun', '--eval', 'console.log("restarted")'], { timeout: 2000, stdout: 'pipe', stderr: 'pipe' })
	expect(next.exitCode).toBe(0)
	expect(new TextDecoder().decode(next.stdout)).toBe('restarted\n')
})


test('correction-round families: block boundaries, snippets in tags, foreign content and numeric references are reproducible', () => {
	const cases = extend()
	expect(extend()).toEqual(cases)
	expect(extend(1)).not.toEqual(cases)
	const family = (name: string) => cases.filter(item => item.id.startsWith(name + '-'))
	expect(['boundary', 'snippet', 'foreign', 'numeric'].map(name => family(name).length)).toEqual([168, 120, 120, 0])
	// Every family but the numeric one holds shapes that must compile and shapes that must be refused; a refusal claims no slot.
	for (const name of ['boundary', 'foreign']) {
		expect(family(name).some(item => item.refusal && item.hazard)).toBe(true)
		expect(family(name).some(item => !item.refusal && item.writes.length > 0)).toBe(true)
	}
	for (const item of cases) {
		expect(item.source).not.toContain('$')
		expect(item.html).not.toContain('$')
		expect(item.refusal ? item.slot === null && item.writes.length === 0 : item.html.includes(`${item.slot}="GALLEY_SLOT"`) || item.html.includes(`${item.slot}='GALLEY_SLOT'`)).toBe(true)
	}
	expect(family('numeric')).toEqual([])
	expect(family('numeric').every(item => /&#[0-9a-fA-FxX]*\{/.test(item.source))).toBe(true)
	expect(family('boundary').some(item => item.source.includes('\n'))).toBe(true)
})

test('oracle faults: a refusal must happen, and its hazard must be what the browser reads', () => {
	const refused = fixture({ refusal: 'G3010', hazard: 'href', writes: [], slot: null })
	const compile = { phase: 'compile', error: '[galley:G3010] <template>:1:1' } as const
	expect(violations(refused, { decoded: [], slots: ['href'] }, compile)).toEqual([])
	expect(violations(refused, { decoded: [], slots: ['title'] }, compile).map(item => item.kind)).toEqual(['browser-hazard-differs'])
	expect(violations(refused, { decoded: [], slots: [] }, { phase: 'render', output: '' }).map(item => item.kind)).toEqual(['missing-compile-refusal', 'browser-hazard-differs'])
	expect(violations(refused, { decoded: [], slots: ['href'] }, { phase: 'compile', error: '[galley:G3008] other' }).map(item => item.kind)).toEqual(['missing-compile-refusal'])
	expect(violations(fixture({ refusal: 'G3011', writes: [], slot: null }), { decoded: [], slots: ['href'] }, { phase: 'compile', error: '[galley:G3011] x' })).toEqual([])
})


test('oracle visits only HTML template contents in a foreign-content batch', async () => {
	const html = [
		'<svg><template><a href="GALLEY_SLOT"></a></template></svg>',
		'<math><template><a href="GALLEY_SLOT"></a></template></math>',
		'<template><template><a href="GALLEY_SLOT"></a></template></template>',
	]
	const path = '/tmp/galley-oracle-template-regression.html'
	await Bun.write(path, browserPage(html.map(value => fixture({ html: value }))))
	const child = Bun.spawnSync(['chromium', '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--dump-dom', `file://${path}`], { timeout: 10000, stdout: 'pipe', stderr: 'pipe' })
	expect(child.exitCode).toBe(0)
	expect(readBrowserOutput(new TextDecoder().decode(child.stdout))).toEqual(html.map(() => ({ decoded: ['/x'], slots: ['href'] })))
}, 15000)

test('strict random alphabets are pinned, bounded, and reject unknown inputs', async () => {
	const { randomSources, RANDOM_RUNS } = await import('../differential/random.js')
	expect(RANDOM_RUNS.map(item => item.seed)).toEqual([0x5eed0001, 0x5eed0002, 0x5eed0003])
	for (const { alphabet, seed } of RANDOM_RUNS) {
		expect(randomSources(alphabet, seed, 100)).toEqual(randomSources(alphabet, seed, 100))
		expect(randomSources(alphabet, seed, 100).length).toBe(100)
	}
	for (const args of [['bad', 1, 1], ['tags', -1, 1], ['mixed', 1, 0], ['foreign', 1, 60001]] as const) expect(() => randomSources(...args)).toThrow('Invalid random family')
})

test('strict browser transport and placement oracle reject broken observations and browser failures by case name', async () => {
	const { strictPage, readStrictOutput, observeStrict } = await import('../differential/strict-browser.js')
	const { placementFailures } = await import('../differential/strict-families.js')
	const { spyOn } = await import('bun:test')
	const cases = [{ id: 'a', kind: 'places' as const, html: '<p>javascript:M1=1 N1=2</p>' }]
	expect(strictPage(cases)).toContain('frame.remove()')
	const wrap = (value: unknown) => '<pre id="result">' + btoa(JSON.stringify(value)) + '</pre>'
	expect(() => readStrictOutput('', cases)).toThrow('no strict observations')
	for (const value of [null, [], [null], [{ id: 'a', places: [1], foreign: false, text: false }]]) expect(() => readStrictOutput(wrap(value), cases)).toThrow('Malformed strict observations')
	expect(readStrictOutput(wrap([{ id: 'a', places: [], urls: ['/x'], foreign: false, text: false }]), cases)).toHaveLength(1)
	expect(placementFailures(['1|attr:a.href', '1|name', '1|tag', '1|comment', '1|text:title'], new Set(['text:title']))).toHaveLength(4)
	expect(placementFailures(['1|text:p'], new Set(['text']))).toEqual([])
	const browser = spyOn(Bun, 'spawnSync').mockImplementation(() => ({ exitCode: 1, stdout: new Uint8Array(), stderr: new Uint8Array() }) as any)
	try { await expect(observeStrict([...cases, { ...cases[0]!, id: 'b' }])).rejects.toThrow('case a') }
	finally { browser.mockRestore() }
})

test('strict differential families run real compile, render and fresh Chromium frames on the smoke domains', async () => {
	const argv = process.argv
	process.argv = [argv[0]!, 'differential/strict-run.ts', '--smoke']
	let report
	try { report = (await import('../differential/strict-run.js')).report }
	finally { process.argv = argv }
	expect(report.failures).toEqual([])
	expect(report.foreign.cases).toBe(650)
	expect(report.foreign.noForeignEntry + report.foreign.refused + report.foreign.observed).toBe(report.foreign.cases)
	expect(report.foreign.browserForeignAmongAccepted).toBe(0)
	expect(report.text.pairs).toBe(144)
}, 30000)

test('strict family oracle detects planted name, text-owner and foreign-count disagreements', async () => {
	const browser = await import('../differential/strict-browser.js')
	const { strictFamilies } = await import('../differential/strict-families.js')
	const { spyOn } = await import('bun:test')
	const observe = spyOn(browser, 'observeStrict').mockImplementation(async cases => cases.map(item => ({ id: item.id, places: ['1|tag'], urls: ['javascript:x'], foreign: true, text: false })))
	try {
		const report = await strictFamilies(false)
		expect(report.failures.some(item => item.detail === '1|tag')).toBe(true)
		expect(report.failures.some(item => item.detail === 'forbidden URL carrying marker')).toBe(true)
		expect(report.failures.some(item => item.detail === 'browser foreign but probe compiled')).toBe(true)
		expect(report.failures.some(item => item.detail === 'accepted text owner did not hold probe as text')).toBe(true)
	} finally { observe.mockRestore() }
	const unknown = Bun.spawnSync(['bun', 'differential/strict-run.ts', '--bad'], { timeout: 10000, stdout: 'pipe', stderr: 'pipe' })
	expect(unknown.exitCode).not.toBe(0)
	expect(new TextDecoder().decode(unknown.stderr)).toContain('usage: bun differential/strict-run.ts')
})

test('strict Chromium transport reports planted URL, name, tag and comment markers', async () => {
	const { observeStrict } = await import('../differential/strict-browser.js')
	const html = ['<a href="javascript:M1=1 N1=2">', '<div n1="value">', '<n1></n1>', '<!--javascript:M1=1 N1=2-->']
	const readings = await observeStrict(html.map((value, index) => ({ id: `planted-${index}`, html: value, kind: 'places' })))
	expect(readings[0]?.urls).toEqual(['javascript:M1=1 N1=2'])
	expect(readings[0]?.places).toContain('1|attr:a.href')
	expect(readings[1]?.places).toContain('1|name')
	expect(readings[2]?.places).toContain('1|tag')
	expect(readings[3]?.places).toContain('1|comment')
}, 10000)


test('G-31: placement oracle folds foreignObject and checks plain text parents', async () => {
	const { placementFailures } = await import('../differential/strict-families.js')
	const { observeStrict } = await import('../differential/strict-browser.js')
	expect(placementFailures(['1|text:foreignObject'], new Set(['text:foreignobject']))).toEqual([])
	for (const parent of ['script', 'style', 'title', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']) {
		expect(placementFailures([`1|text:${parent}`], new Set(['text']))).toEqual([`1|text:${parent}`])
	}
	const [reading] = await observeStrict([{ id: 'G-31-foreignObject', html: '<svg><foreignObject>GALLEY_TEXT&lt;i data-galley-probe&gt;</foreignObject></svg>', kind: 'text', owner: 'foreignobject' }])
	expect(reading?.text).toBe(true)
})
