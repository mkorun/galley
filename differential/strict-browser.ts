import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface BrowserCase { id: string; html: string; kind: 'places' | 'foreign' | 'text'; owner?: string }
export interface BrowserReading { id: string; places: string[]; urls: string[]; foreign: boolean; text: boolean }
/** Every case gets a new scripting-enabled browsing context. CSP forbids execution and resource loads. */
export const strictPage = (cases: readonly BrowserCase[]): string => `<!doctype html><meta charset="utf-8"><pre id="result"></pre><script>
const cases=${JSON.stringify(cases).replace(/</g, '\\u003c')};
const results=cases.map(item=>{
 const frame=document.createElement('iframe');frame.hidden=true;document.body.append(frame);
 const root=frame.contentDocument;root.open();root.write(${JSON.stringify('<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'">')}+item.html);root.close();
 const places=[],urls=[];let foreign=false,text=false;
 const visit=node=>{
  for(const child of node.childNodes){
   if(child.nodeType===3){for(const m of child.data.matchAll(/javascript:M(\\d+)=1 N\\1=2/g))places.push(m[1]+'|text:'+ (node.localName||'#fragment').toLowerCase());if(node.localName?.toLowerCase()===item.owner?.toLowerCase()&&child.data.includes('GALLEY_TEXT<i data-galley-probe>'))text=true;}
   else if(child.nodeType===8){for(const m of child.data.matchAll(/[MN](\\d+)=/g))places.push(m[1]+'|comment');}
   else if(child.nodeType===1){
    if(child.hasAttribute('data-galley-probe')&&child.localName==='i')foreign=true;
    for(const m of child.localName.matchAll(/(?:javascript:m|n)(\\d+)/gi))places.push(m[1]+'|tag');
    for(const attr of child.attributes){
     for(const m of attr.name.matchAll(/(?:javascript:m|n)(\\d+)/gi))places.push(m[1]+'|name');
     for(const m of attr.value.matchAll(/javascript:M(\\d+)=/g))places.push(m[1]+'|attr:'+child.localName.toLowerCase()+'.'+attr.name);
     if(attr.value.includes('javascript:M')&&['href','src','action','formaction','poster','cite','xlink:href'].includes(attr.name))urls.push(attr.value);
    }
    visit(child);if(child.namespaceURI==='http://www.w3.org/1999/xhtml'&&child.localName==='template')visit(child.content);
   }
  }
 };visit(root);frame.remove();return {id:item.id,places,urls,foreign,text};
});
document.getElementById('result').textContent=btoa(unescape(encodeURIComponent(JSON.stringify(results))));
</script>`

export const readStrictOutput = (output: string, cases: readonly BrowserCase[]): BrowserReading[] => {
	const match = /<pre id="result">([A-Za-z0-9+/=]+)<\/pre>/.exec(output)
	if (!match) throw new Error('Chromium returned no strict observations')
	const results = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(match[1]!), char => char.charCodeAt(0))))
	if (!Array.isArray(results) || results.length !== cases.length || results.some((item, index) => !item || item.id !== cases[index]!.id || !Array.isArray(item.places) || !item.places.every((place: unknown) => typeof place === 'string') || !Array.isArray(item.urls) || !item.urls.every((url: unknown) => typeof url === 'string') || typeof item.foreign !== 'boolean' || typeof item.text !== 'boolean')) throw new Error('Malformed strict observations')
	return results
}

export const observeStrict = async (cases: readonly BrowserCase[], batch = 1000): Promise<BrowserReading[]> => {
	const directory = await mkdtemp(join(tmpdir(), 'galley-strict-'))
	const run = async (items: readonly BrowserCase[]): Promise<BrowserReading[]> => {
		const path = join(directory, 'page.html')
		await Bun.write(path, strictPage(items))
		const child = Bun.spawnSync(['chromium', '--headless', '--renderer-process-limit=1', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking', '--dump-dom', `file://${path}`], { timeout: 55000, stdout: 'pipe', stderr: 'pipe' })
		try {
			if (child.exitCode !== 0) throw new Error('Chromium failed')
			return readStrictOutput(new TextDecoder().decode(child.stdout), items)
		} catch (error) {
			// Diagnose a browser failure by case, never silently drop the batch.
			if (items.length === 1) throw new Error(`Chromium cannot finish case ${items[0]!.id}: ${String(error)}`)
			const middle = items.length >> 1
			return [...await run(items.slice(0, middle)), ...await run(items.slice(middle))]
		}
	}
	try {
		const readings: BrowserReading[] = []
		for (let from = 0; from < cases.length; from += batch) readings.push(...await run(cases.slice(from, from + batch)))
		return readings
	} finally { await rm(directory, { recursive: true, force: true }) }
}
