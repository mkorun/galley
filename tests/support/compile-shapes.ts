import type { CompileOptions } from '../../compiler/types.js'
/** Two large sizes (4n and 64n); depths grow to 256; batches keep tiny compiles above timing noise. */
export const shapes: Record<string, { n: number; repetitions?: number; make(n: number): [string, CompileOptions] }> = {
	textElements: { n: 4096, make: n => ['<script>' + 'if(a<b)x=a<<2;\n'.repeat(n) + '</script>', {}] },
	strip: { n: 2048, make: n => ['<p class="a">some text</p>\n'.repeat(n), { strip: true }] },
	comments: { n: 2048, make: n => ['<p>x</p>\n<!-- gone -->\n'.repeat(n), {}] },
	escapes: { n: 2048, make: n => ['<p>a \\{ b }</p>\n'.repeat(n), {}] },
	attributes: { n: 4096, make: n => ['<p' + ' data-x="v"'.repeat(n) + '>x</p>', {}] },
	tags: { n: 4096, make: n => ['<p>x</p>'.repeat(n), {}] },
	nestedBlocks: { n: 4, repetitions: 64, make: n => ['{#if p}'.repeat(n) + 'x' + '{/if}'.repeat(n), {}] },
	longUrls: { n: 8192, make: n => ['<a href="' + 'a'.repeat(n * 20) + '{ u }">', {}] },
	partials: { n: 1024, make: n => ['{@partial p.sort}'.repeat(n), { includes: { import: async () => '<p>x</p>' } }] },
	inlineComments: { n: 4096, make: n => ['<p>x</p><!-- c -->'.repeat(n) + '--!>' + '<p>x</p><!-- c -->'.repeat(n), {}] },
	metaSpaces: { n: 4096, repetitions: 64, make: n => [' '.repeat(n) + 'x<meta content="{ a }">x', {}] },
	manyValues: { n: 2048, make: n => ['<p>{ a }</p>'.repeat(n), {}] },
	manyUrls: { n: 4096, make: n => ['<a href="{ u }">'.repeat(n), {}] },
	snippetCalls: { n: 1024, make: n => ['{#snippet s(v)}{ v }{/snippet}' + '{@render s(u)}'.repeat(n), {}] },
	scriptedSnippets: { n: 256, make: n => [Array.from({ length: n }, (_, i) => `{#snippet s${i}()}{@js} return '' {@js}{/snippet}`).join(''), { allowCode: true }] },
	constBranches: { n: 512, make: n => [Array.from({ length: n }, (_, i) => `{@const c${i} = 1}`).join('') + '{#if p}x{/if}'.repeat(n), {}] },
	usedConsts: { n: 512, make: n => [Array.from({ length: n }, (_, i) => `{@const c${i} = 1}`).join('') + Array.from({ length: n }, (_, i) => `{ c${i} }`).join(''), {}] },
}
