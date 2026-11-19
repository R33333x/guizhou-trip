"""Build semantic tokens for the approved D day / B night palette."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
schemes=json.loads((root/'schemes.json').read_text())
css=[]
for look,scheme in schemes.items():
 for mode in ('light','dark'):
  c=scheme[mode]
  tokens={
   '--bg':c['bg'],'--surface':c['bg'],'--text':c['text'],
   '--muted':f"color-mix(in srgb,{c['text']} 84%,{c['bg']})",
   '--line':f"color-mix(in srgb,{c['text']} 20%,transparent)",
   '--accent':c['accent'],'--secondary':'#558F14','--on-accent':'#232826',
   '--on-secondary':'#232826',
   '--map-accent':'#509EAB','--map-secondary':'#558F14','--map-on-color':'#232826',
   '--soft':f"color-mix(in srgb,{c['text']} 7%,{c['bg']})",
   '--hero':c['bg'],'--on-hero':c['text'],'--hero-muted':c['text'],
   '--d1':'#509EAB','--d2':'#558F14','--d3':'#509EAB','--d4':'#558F14',
   '--glass-fill':f"color-mix(in srgb,{c['bg']} 20%,transparent)",
   '--glass-overlay':f"color-mix(in srgb,{c['bg']} 16%,transparent)",
   '--nav-overlay':f"color-mix(in srgb,{c['bg']} 62%,transparent)",
   '--nav-selected':f"color-mix(in srgb,{c['bg']} 75%,transparent)",
   '--glass-selected':f"color-mix(in srgb,{c['text']} 10%,transparent)",
   '--glass-line':f"color-mix(in srgb,{c['text']} 27%,transparent)",
   '--glass-sheen':'#DAECF44D','--glint':'#DAECF41c','--glass-edge':'#23282618',
   '--glass-dialog':f"color-mix(in srgb,{c['bg']} 68%,transparent)",
   '--shade':'#23282616',
   '--solid-panel':c['bg'],
   '--warn':c['text'],'--warn-bg':f"color-mix(in srgb,{c['text']} 8%,{c['bg']})",
   'color-scheme':'light' if c['bg'].upper()=='#DAECF4' else 'dark',
  }
  css.append(':root[data-look="'+look+'"][data-palette="'+mode+'"]{'+''.join(k+':'+v+';' for k,v in tokens.items())+'}')
(root/'palette.css').write_text('\n'.join(css)+'\n')
