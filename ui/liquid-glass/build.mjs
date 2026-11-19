import {build} from 'esbuild';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join,dirname,resolve} from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
const dir=dirname(fileURLToPath(import.meta.url)),target=resolve(dir,'../../public/index.html');
const temp=await mkdtemp(join(tmpdir(),'guizhou-art-'));
try{
 execFileSync('python3',[join(dir,'artwork.py'),temp]);
 execFileSync('python3',[join(dir,'palette_css.py')]);
 const result=await build({entryPoints:[join(dir,'material.jsx')],bundle:true,minify:true,format:'iife',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof',write:false});
 const read=name=>readFile(join(dir,name),'utf8');
 const css=await readFile(join(temp,'art.css'),'utf8');
 const editorial=await read('palette.css')+'\n'+await read('material.css')+'\n'+await readFile(join(dir,'../editorial/overview.css'),'utf8');
 const js=await read('effects.js')+'\nconst BOTANICAL_ART='+await readFile(join(temp,'art.json'),'utf8')+';\n'+await read('palette.js')+'\n'+await read('optics.js')+'\n'+result.outputFiles[0].text;
 let html=await readFile(target,'utf8');
 for(const [kind,content] of [['STYLES',css],['RUNTIME',js.replaceAll('</script','<\\/script')]]){
  const pattern=new RegExp('/\\* BEGIN TRIP_GLASS_'+kind+' \\*/[\\s\\S]*?/\\* END TRIP_GLASS_'+kind+' \\*/');
  if(!pattern.test(html))throw Error('Missing glass build marker: '+kind);
  html=html.replace(pattern,()=>`/* BEGIN TRIP_GLASS_${kind} */\n${content}\n/* END TRIP_GLASS_${kind} */`);
 }
 const editorialBlock='<style>\n/* BEGIN TRIP_EDITORIAL_STYLES */\n'+editorial+'\n/* END TRIP_EDITORIAL_STYLES */\n</style>';
 if(html.includes('/* BEGIN TRIP_EDITORIAL_STYLES */'))html=html.replace(/<style>\s*\/\* BEGIN TRIP_EDITORIAL_STYLES \*\/[\s\S]*?\/\* END TRIP_EDITORIAL_STYLES \*\/\s*<\/style>/,()=>editorialBlock);
 else html=html.replace('</head>',()=>editorialBlock+'\n</head>');
 await writeFile(target,html);console.log('Updated inline glass material in '+target);
}finally{await rm(temp,{recursive:true,force:true});}
