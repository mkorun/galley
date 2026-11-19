import type { Fixture } from './model.js'
import type { Observation } from './oracle.js'

/** A fresh iframe for each fixture, keeps scripting enabled for tokenization; CSP blocks all script execution and resource loads. */
export const browserPage = (fixtures: readonly Fixture[]): string => `<!doctype html><meta charset="utf-8"><pre id="result"></pre><script>
const fixtures=${JSON.stringify(fixtures.map(fixture => ({ writes: fixture.writes, html: fixture.html }))).replace(/</g, '\\u003c')};
const observations=fixtures.map(fixture=>{
 const frame=document.createElement('iframe');frame.hidden=true;document.body.append(frame);
 const root=frame.contentDocument;root.open();root.write(${JSON.stringify('<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'">')}+fixture.html);root.close();
 const slots=[];
 const visit=root=>{for(const element of root.querySelectorAll('*')){for(const attr of element.attributes)if(attr.value.includes('GALLEY_SLOT'))slots.push(attr.name);if(element.namespaceURI==='http://www.w3.org/1999/xhtml'&&element.localName==='template')visit(element.content);}};
 visit(root);
 const decoded=fixture.writes.map(write=>{const t=document.createElement('template');t.innerHTML='<a data-prefix="'+write.serialized.replaceAll('"','&quot;')+'">';return t.content.firstChild.getAttribute('data-prefix');});
 frame.remove();return {decoded,slots};
});
document.getElementById('result').textContent=btoa(unescape(encodeURIComponent(JSON.stringify(observations))));
</script>`

export const readBrowserOutput = (output: string): Observation[] => {
	const match = /<pre id="result">([A-Za-z0-9+/=]+)<\/pre>/.exec(output)
	if (!match) throw new Error('Chromium returned no oracle observations')
	const observations: unknown = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(match[1]!), char => char.charCodeAt(0))))
	if (!Array.isArray(observations) || observations.some(value => value === null || typeof value !== 'object' || !Array.isArray(value.decoded) || !value.decoded.every((item: unknown) => typeof item === 'string') || !Array.isArray(value.slots) || !value.slots.every((item: unknown) => typeof item === 'string'))) throw new Error('Malformed browser observations')
	return observations as Observation[]
}
