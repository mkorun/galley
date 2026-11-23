import { fileURLToPath } from 'node:url'
const out: Record<string, number>={}
const dir=process.argv[2]
if(!dir) throw new Error('Expected a package directory')
for(const shape of ['base','loop','urls','hrefEach']){
 const child=Bun.spawnSync(['bun',fileURLToPath(new URL('./first-shape.ts',import.meta.url)),dir,shape],{timeout:10000,stdout:'pipe',stderr:'pipe'})
 if(child.exitCode!==0)throw new Error(new TextDecoder().decode(child.stderr))
 out[shape+'.firstRender']=Number(new TextDecoder().decode(child.stdout))
}
console.log(JSON.stringify(out))
