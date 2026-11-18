"""Build concise navigation and move travel tips below the packing checklist."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[2];src=Path(__file__).resolve().parent;p=root/'public/index.html';s=p.read_text()
views="const VIEWS=[{id:'overview',label:'总览'},...TRIP.days.map(d=>({id:'day-'+d.day,label:date(d.date)+' '+weekday(d.date),day:d.day})),{id:'stay',label:'住宿'},{id:'food',label:'美食'},{id:'flights',label:'交通'},{id:'packing',label:'行李'},{id:'weather',label:'天气'}];"
s=re.sub(r'const VIEWS=\[.*?\];',lambda _:views,s,count=1)
s=re.sub(r'function renderHeader\(\)\{[\s\S]*?\n\}\n(?=function renderOverview)',lambda _:(src/'render_header.js').read_text(),s,count=1)
if 'id="prepare"' in s:
 start=s.index('<section class="view" id="prepare"');end=s.index('<footer class="footer">',start)
 old=s[start:end];tips_start=old.index('<section class="section" aria-labelledby="tips-title">')
 tips=old[tips_start:old.rfind('</section>')].strip().replace('class="section"','class="section packing-tips"',1)
 s=s[:start]+s[end:]
 pack_start=s.index('<section class="view" id="packing"');pack_end=s.index('<section class="view" id="weather"',pack_start)
 packing=s[pack_start:pack_end];close=packing.rfind('</section>');packing=packing[:close]+tips+packing[close:]
 s=s[:pack_start]+packing+s[pack_end:]
 s=re.sub(r'function renderConfirmed\(\)\{[\s\S]*?\n\}\n(?=function renderDays)', '', s,count=1)
 s=s.replace('renderConfirmed();','')
start='/* BEGIN NAVIGATION_STYLES */';end='/* END NAVIGATION_STYLES */';block=start+'\n'+(src/'navigation.css').read_text()+'\n'+end
if start in s:s=re.sub(re.escape(start)+r'[\s\S]*?'+re.escape(end),lambda _:block,s)
else:s=s.replace('</head>','<style>\n'+block+'\n</style>\n</head>',1)
p.write_text(s);print('Built seven concise navigation buttons; packing includes travel tips.')
