// One measurement of galley at the package directory given as argument; prints JSON medians in µs.
// Shapes: plain text and attributes, a loop, URL attributes (the code the URL_CHECK fix touches), and {#each} inside href.
const dir = process.argv[2]
const galley = (await import(`${dir}/index.ts`)).default

const shapes: Record<string, string> = {
	base: '<html lang="{ meta.lang }"><head><meta charset="{ meta.charset }"></head><body><h1 title="{ title }">{ title }{#if draft}<em>D</em>{/if}</h1></body></html>',
	loop: '<ul>{#each tags as tag}<li class="t">{ tag }</li>{/each}</ul>',
	urls: '<nav>{#each links as l}<a title="{ l.t }" href="{ l.u }">{ l.t }</a><img src="/i/{ l.i }.png" alt="{ l.t }">{/each}</nav>',
	hrefEach: '<a href="/q?{#each tags as tag}t={ tag }&amp;{/each}">q</a>',
}
const data = {
	meta: { lang: 'de', charset: 'utf-8' }, title: 'A & B <c>', draft: true,
	tags: Array.from({ length: 50 }, (_, i) => `tag-${i}`),
	links: Array.from({ length: 50 }, (_, i) => ({ t: `Link ${i} "x"`, u: i % 2 ? `https://example.org/p/${i}` : `/local/${i}?a=1&b=2`, i })),
}
const median = (xs: number[]) => xs.sort((a, b) => a - b)[xs.length >> 1]!
const out: Record<string, number> = {}
for (const [name, src] of Object.entries(shapes)) {
	const compiles: number[] = []
	for (let r = 0; r < 7; r++) {
		const t = performance.now()
		for (let i = 0; i < 500; i++) await galley(src)
		compiles.push((performance.now() - t) * 1000 / 500)
	}
	const tpl = await galley(src)
	for (let i = 0; i < 2000; i++) tpl.render(data)
	const renders: number[] = []
	for (let r = 0; r < 7; r++) {
		const t = performance.now()
		for (let i = 0; i < 2000; i++) tpl.render(data)
		renders.push((performance.now() - t) * 1000 / 2000)
	}
	out[`${name}.compile`] = median(compiles)
	out[`${name}.render`] = median(renders)
}
console.log(JSON.stringify(out))
