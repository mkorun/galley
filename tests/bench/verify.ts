// One measurement of galley at the package directory given as argument; prints JSON medians in µs.
// Shapes: plain text and attributes, a loop, URL attributes (the code the URL_CHECK fix touches), and {#each} inside href.
const dir = process.argv[2]
const galley = (await import(`${dir}/index.ts`)).default
const util = (await import(`${dir}/util.ts`)).default

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

const candidate = (await import('../../index.js')).default
const candidateUtil = (await import('../../util.js')).default
const E=(value: unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[c]!)
const expected: Record<string,string> = {
 base: '<html lang="de"><head><meta charset="utf-8"></head><body><h1 title="'+E(data.title)+'">'+E(data.title)+'<em>D</em></h1></body></html>',
 loop: '<ul>'+data.tags.map(tag=>'<li class="t">'+E(tag)+'</li>').join('')+'</ul>',
 urls: '<nav>'+data.links.map(l=>'<a title="'+E(l.t)+'" href="'+E(l.u)+'">'+E(l.t)+'</a><img src="/i/'+l.i+'.png" alt="'+E(l.t)+'">').join('')+'</nav>',
 hrefEach: '<a href="/q?'+data.tags.map(tag=>'t='+E(tag)+'&amp;').join('')+'">q</a>',
}
for(const [name, source] of Object.entries(shapes)) {
 const a=await galley(source), b=await candidate(source)
 const actualA=await a.render(data,util), actualB=await b.render(data,candidateUtil)
 if(actualA!==expected[name]||actualB!==expected[name])throw new Error('Benchmark output differs for '+name)
}
console.log('All four benchmark outputs equal independent expected strings in main and candidate')
