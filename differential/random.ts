// Productions from the supplied prototype, with col and colgroup added to every alphabet.
import { random } from './model.js'
const WELL = ['<col>', '<colgroup>', '<a href="@">', "<a href='@'>", '</a>', '<p>', '</p>', '<b>', '</b>', '<p title="@">', '<img src="@">', '@', 'text', ' ', '\n', '<!-- c -->', '\n<!-- c -->\n', '\n  <!-- c -->\n',
	'<meta content="%">', '<link href="%">', '\n<meta name="d" content="%">\n', '<title>', '</title>', '<style>', '</style>', '<script>', '</script>', '<textarea>', '</textarea>',
	'<svg>', '</svg>', '<math>', '</math>', '<g>', '</g>', '<desc>', '</desc>', '<foreignObject>', '</foreignObject>', '<mtext>', '</mtext>', '<mi>', '</mi>', '<path d="M0 0"/>', '<br>', '<div>', '</div>',
	'<table>', '</table>', '<tr>', '<td>', '<template>', '</template>', ' aria-current="page"', ' hidden', ' title="a < b"', ' href="@"', " title='>'", '<a', '<p', '<use', '>', '/>', '<a href="/x/@">', '<a class="c" href="@">x</a>',
	'<noscript>', '</noscript>', '<annotation-xml>', '</annotation-xml>']
const NOISE = ['<', '</', '>', '/', '=', '"', "'", 'a', 'x=', 'x="', '</a ', 'title="', '<!--', '-->', '--!>', '<!-->', '<!', '<?', '?>', '<![CDATA[', ']]>', '<title/>', '<style/>', '<svg/>', '</svg ', '-', '!',
	'</title', '</script ', '<script', '&#10', '&lt;', '< ', '<a/href="@">', 'title="x"href="@"', '</p x="', '<plaintext>', '</p >', '</a\n>', 'href=@', '<a @>', '<@', '<xmp>', '</xmp>', '<b x=`', '\t', '<p/>', '</br>', '<font color="r">', '</desc', '--', '<!---', 'href', ' =', '<a href=/x>']
const BLOCKS: [string, string][] = [['{#if p}', '{/if}'], ['{#if p}', '{:else}'], ['{#each xs as x}', '{/each}']]

const FOREIGN = ['<svg>', '</svg>', '<math>', '</math>', '<g>', '</g>', '<desc>', '</desc>', '<foreignObject>', '</foreignObject>', '<mtext>', '</mtext>', '<mi>', '</mi>', '<annotation-xml>', '</annotation-xml>', '<title>', '</title>', '<style>', '</style>',
	'<script>', '</script>', '<textarea>', '</textarea>', '<p>', '</p>', '<div>', '</div>', '<b>', '</b>', '<table>', '</table>', '<td>', '<br>', '</br>', '<font color="r">', '<a href="@">', '</a>', '<use xlink:href="@"/>', '<path d="M0 0"/>', '@', 'text', '<svg/>', '<desc/>', '<foreignObject/>',
	'<svg viewBox="0 0 1 1">', '<!-- c -->', '\n<!-- c -->\n', '<a title="@">', '<img src="@">', '<template>', '</template>', '<mglyph>', '<malignmark>', '<annotation-xml encoding="text/html">', '<span>', '</span>', '<h1>', '</h1>', '<li>', '<ul>', '</ul>', '<form>', '</form>', '<button>', '</button>', '<nobr>', '<xmp>', '</xmp>', '<iframe>', '</iframe>']
const TAGS = ['<a', '<p', '<meta', '<link', '<use', '>', '/>', ' ', '\n', ' href="@"', " href='@'", ' title="@"', ' content="%"', ' hidden', ' data-x', ' aria-current="page"', ' title="a < b"', " title='>'", 'href="@"', 'title="x"', 'hidden', '=', '="@"', ' =', '"', "'", '/', ' class="c@"', ' x=1', ' x=a/b', 'x', '</a>', '</p>', 'text', '@',
	'\n<!-- c -->\n', '<a href="@">x</a>', ' src="@"', ' xlink:href="@"', ' href="/x/@"', '\t']

export const RANDOM_RUNS = [
	{ alphabet: 'mixed', seed: 0x5eed0001, count: 60000 },
	{ alphabet: 'foreign', seed: 0x5eed0002, count: 40000 },
	{ alphabet: 'tags', seed: 0x5eed0003, count: 60000 },
] as const
export const randomSources = (alphabet: string, seed: number, count: number): string[] => {
	if (!['mixed', 'foreign', 'tags'].includes(alphabet) || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || !Number.isInteger(count) || count < 1 || count > 60000) throw new Error('Invalid random family')
	const stream = random(seed)
	const next = (bound: number): number => Math.floor(stream() / 0x100000000 * bound)
	const sources: string[] = []
	for (let iteration = 0; iteration < count; iteration++) {
		const parts: string[] = []
		const length = alphabet === 'mixed' ? 2 + next(9) : 3 + next(10)
		const list = [...(alphabet === 'foreign' ? FOREIGN : TAGS), '<col>', '<colgroup>']
		for (let index = 0; index < length; index++) parts.push(alphabet === 'mixed' ? (next(100) < 70 ? WELL[next(WELL.length)]! : NOISE[next(NOISE.length)]!) : list[next(list.length)]!)
		for (let blocks = next(alphabet === 'tags' ? 4 : alphabet === 'foreign' ? 2 : 3); blocks > 0; blocks--) {
			const from = next(parts.length + 1), to = from + next(parts.length + 1 - from)
			const [open, close] = BLOCKS[next(BLOCKS.length)]!
			if (close === '{:else}') {
				const middle = from + next(to - from + 1)
				parts.splice(to, 0, '{/if}'); parts.splice(middle, 0, '{:else}'); parts.splice(from, 0, open)
			} else { parts.splice(to, 0, close); parts.splice(from, 0, open) }
		}
		let slot = 0
		sources.push(parts.join('').replace(/[@%]/g, char => `{ ${char === '@' ? 'v' : 'e'}${++slot} }`))
	}
	return sources
}
