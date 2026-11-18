"""Rebuild the food guide's inline CSS/data/runtime; preserve the trip and glass."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2];src=Path(__file__).resolve().parent;target=root/'public/index.html';s=target.read_text()
def replace_block(kind,content):
 global s
 marker=f'<!-- BEGIN FOOD_{kind} -->' if kind in ['SECTION','DIALOG'] else f'/* BEGIN FOOD_{kind} */'
 end=f'<!-- END FOOD_{kind} -->' if kind in ['SECTION','DIALOG'] else f'/* END FOOD_{kind} */'
 block=marker+'\n'+content+'\n'+end
 if marker in s:s=re.sub(re.escape(marker)+r'[\s\S]*?'+re.escape(end),lambda _:block,s)
 elif kind=='STYLES':s=s.replace('</head>','<style>'+block+'</style>\n</head>',1)
 elif kind=='SECTION':s=s.replace('<section class="view" id="flights"',block+'\n<section class="view" id="flights"',1)
 elif kind=='DIALOG':s=s.replace('<script>',block+'\n<script>',1)
 elif kind=='RUNTIME':s=s.replace('/* BEGIN TRIP_GLASS_RUNTIME */',block+'\n/* BEGIN TRIP_GLASS_RUNTIME */',1)
 else:raise ValueError(kind)
if "id:'food'" not in s:
 s=s.replace("{id:'stay',label:'住宿介绍'},", "{id:'stay',label:'住宿介绍'},{id:'food',label:'美食地图'},",1)
 s=s.replace("['flights','packing','weather','prepare']", "['food','flights','packing','weather','prepare']",1)
 s=s.replace("if(id==='weather')renderWeather();", "if(id==='weather')renderWeather();\n if(id==='food')initFood();",1)
 # Add a direct overview entry within the existing quick tools.
 s=s.replace('<div class="quick-tools"><button type="button" data-view="flights">','<div class="quick-tools"><button type="button" data-view="food">寻味贵州<small>贵阳 / 安顺 / 民宿周边</small></button><button type="button" data-view="flights">',1)
replace_block('STYLES',(src/'food.css').read_text())
replace_block('SECTION',(src/'food.html').read_text())
replace_block('DIALOG','''<dialog class="food-photo-dialog" id="food-photo-dialog" aria-labelledby="food-photo-title"><div class="food-dialog-head"><div><h2 id="food-photo-title"></h2><p id="food-photo-subtitle"></p></div><button type="button" id="food-photo-close" aria-label="关闭美食图片">关闭 ×</button></div><img class="food-dialog-image" id="food-photo-full" alt=""><div class="food-dialog-footer"><span>看看图片，再选想吃的</span><a id="food-photo-source" target="_blank" rel="noopener noreferrer">单独打开图片 ↗</a></div></dialog>''')
data=json.loads((src/'food-data.json').read_text())
js='const FOOD_SHOPS='+json.dumps(data['shops'],ensure_ascii=False,separators=(',',':'))+';\n'+(src/'food.js').read_text()
replace_block('RUNTIME',js.replace('</script','<\\/script'))
# Keep a dedicated hash for opening the review without altering the default home.
if "location.hash==='#food'" not in s:
 s=s.replace('initBotanicalOptics();',"initBotanicalOptics();\nif(location.hash==='#food')showView('food',{scroll:true});",1)
target.write_text(s)
print('Built food guide:',len(data['shops']),'shops;',len(data['images']),'images')
