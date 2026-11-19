"""Build the verified weather snapshot and concise, itinerary-aware cards."""
from pathlib import Path
import json,re
source=Path(__file__).resolve().parent
page=source.parents[1]/'public/index.html'
html=page.read_text().replace('贵阳城区预报参考，出发前再看一次。','按每天所在地查看，临近出发再确认。')
data=json.loads((source/'weather.json').read_text())
assert len(data['days'])==4 and all(d['condition'] and isinstance(d['low'],int) and isinstance(d['high'],int) for d in data['days'])
html,count=re.subn(r'^const WEATHER=[\s\S]*?;\n',lambda _:'const WEATHER='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',html,count=1,flags=re.M)
assert count==1
start=html.index('function renderWeather(');end=html.index('\nlet activeView=',start)
html=html[:start]+(source/'renderWeather.js').read_text().rstrip()+html[end:]
block='/* BEGIN WEATHER_STYLES */\n'+(source/'weather.css').read_text()+'\n/* END WEATHER_STYLES */'
if '/* BEGIN WEATHER_STYLES */' in html:
 html=re.sub(r'/\* BEGIN WEATHER_STYLES \*/[\s\S]*?/\* END WEATHER_STYLES \*/',lambda _:block,html,count=1)
else:
 html=html.replace('</head>','<style>\n'+block+'\n</style>\n</head>',1)
page.write_text(html)
print('Built weather: '+data['issued']+' · Guiyang / Anshun · all 4 trip dates')
