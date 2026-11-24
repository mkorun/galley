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

const name=process.argv[3]
if(!name || !shapes[name]) throw new Error('Expected a known benchmark shape')
const tpl=await galley(shapes[name])
const start=performance.now()
const output=await tpl.render(data)
const micros=(performance.now()-start)*1000
if(typeof output!=='string'||!output)throw new Error('Missing first-render output')
console.log(micros)
