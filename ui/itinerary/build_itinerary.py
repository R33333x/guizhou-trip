"""Build the agreed four-day timelines, meal links and route map slots."""
from pathlib import Path
import json
import re
import shutil
import subprocess

source = Path(__file__).resolve().parent
root = source.parents[1]
page = root / 'public/index.html'
html = page.read_text()
plan = json.loads((source / 'plan.json').read_text())
names = ['TRIP', 'PLACES', 'EVENTS', 'INFO', 'TIPS', 'PACKING']
patterns = {name: r'^const ' + name + r'=([\s\S]*?);\n' for name in names}
declarations = []
for name in names:
    match = re.search(patterns[name], html, re.M)
    if not match:
        raise ValueError('Missing data declaration: ' + name)
    declarations.append(match[0])
node = shutil.which('node')
if not node:
    raise RuntimeError('Node.js is required to read the existing trip data.')
program = ''.join(declarations) + '\nprocess.stdout.write(JSON.stringify({' + ','.join(names) + '}));'
data = json.loads(subprocess.run([node], input=program, text=True, check=True, capture_output=True).stdout)
data['TRIP'].pop('guides', None)
data['TRIP']['updated'] = plan['updated']
for update in plan['days']:
    next(d for d in data['TRIP']['days'] if d['day'] == update['day']).update(update)
planned_days = {d['day'] for d in plan['days']}
data['EVENTS'] = plan['events'] + [e for e in data['EVENTS'] if e['day'] not in planned_days]
data['PLACES'] = [p for p in data['PLACES'] if p['id'] not in plan['removePlaces']]
for update in plan['places']:
    place = next((p for p in data['PLACES'] if p['id'] == update['id']), None)
    if place is None:
        data['PLACES'].append(update)
    else:
        place.update(update)
data['TIPS'] = plan['tips']
for key in ['fallback', 'risk', 'mileage']:
    data['INFO'].pop(key, None)
data['INFO']['car'] = '车辆、司机、上车点与返程接送提前在群内确认。'
for item in data['PACKING']:
    if item['id'] == 'water':
        item['note'] = '徒步前装好，按个人消耗和当天行程备足饮水。'
    elif item['id'] == 'light':
        item['note'] = '徒步备用照明，头灯更方便腾手；提前充电或另备电池。'
for name in names:
    declaration = 'const ' + name + '=' + json.dumps(data[name], ensure_ascii=False, separators=(',', ':')) + ';\n'
    html, count = re.subn(patterns[name], lambda _: declaration, html, count=1, flags=re.M)
    assert count == 1
for name in ['placeUI', 'eventUI', 'transferUI', 'renderDays', 'renderMap']:
    start = re.search(r'^function ' + name + r'\(', html, re.M).start()
    if name == 'eventUI':
        end = html.index('\nconst VIEWS=', start)
    elif name == 'renderMap':
        end = html.index('\nlet storageAvailable', start)
    else:
        end = html.index('\nfunction ', start + 1)
    html = html[:start] + (source / (name + '.js')).read_text().rstrip() + html[end:]
html = html.replace(
    "${date(ev('d1-checkin').time)} ${time(ev('d1-checkin').time)} 团队参考到店",
    "${date(TRIP.start)} 按各自返店时间入住"
)
html = html.replace('隧道路线带手电或头灯，并提前与向导核对头盔等装备。', '手电或头灯可作徒步备用照明，出发前检查电量。')
html = html.replace('出发前听向导说明。', '出发前核对当地天气和路况。')
html = html.replace('徒步是否出发以当地预警与向导安排为准。', '徒步是否出发以当地预警和实际路况为准。')
html = html.replace('团队路线示意 · 含上海组机场接送', '团队路线示意 · 具体交通按出发城市查看')
css = '\n/* BEGIN ITINERARY_STYLES */\n' + (source / 'itinerary.css').read_text() + '\n/* END ITINERARY_STYLES */\n'
if '/* BEGIN ITINERARY_STYLES */' in html:
    html = re.sub(r'/\* BEGIN ITINERARY_STYLES \*/[\s\S]*?/\* END ITINERARY_STYLES \*/', lambda _: css.strip(), html, count=1)
else:
    html = html.replace('</head>', '<style>' + css + '</style>\n</head>', 1)
obsolete = ['向导', 'A/B 两', 'A 线', 'B 线', 'd2-a-end', 'd2-b-end']
assert not any(text in html for text in obsolete), [(text, html[max(0,m.start()-70):m.end()+70]) for text in obsolete for m in re.finditer(re.escape(text), html)]
page.write_text(html)
print('Built four-day timelines with three route map slots and contextual meal links.')
