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
html = re.sub(r'/\* BEGIN DAILY_KIT_RUNTIME \*/[\s\S]*?/\* END DAILY_KIT_RUNTIME \*/\n?', '', html)
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
data['INFO']['car'] = '周六 06:15 民宿出发，11:00 安顺市中心集合去黄果树，17:00 大巴返程，预计 19:00 到花溪吃晚饭；周日结伴打车往返贵阳市区。'
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
# The overview has compact date links; the route sketch remains its opening element.
html, overview_count = re.subn(
    r'^function renderOverview\(\)\{[\s\S]*?\n\}\n(?=function renderStay)',
    lambda _: (source.parent / 'navigation/render_overview.js').read_text(),
    html, count=1, flags=re.M
)
assert overview_count == 1, 'Missing overview renderer'
overview_start = html.index('<section class="view" id="overview"')
overview_end = html.index('<div id="days">', overview_start)
overview = html[overview_start:overview_end]
overview = re.sub(r'<div class="page-head">[\s\S]*?</div><p class="page-desc">[\s\S]*?</p></div>', '', overview, count=1)
html = html[:overview_start] + overview + html[overview_end:]
html = html.replace(
    "${date(ev('d1-checkin').time)} ${time(ev('d1-checkin').time)} 团队参考到店",
    "${date(TRIP.start)} 按各自返店时间入住"
)
html = html.replace('隧道路线带手电或头灯，并提前与向导核对头盔等装备。', '手电或头灯可作徒步备用照明，出发前检查电量。')
html = html.replace('出发前听向导说明。', '出发前核对当地天气和路况。')
html = html.replace('徒步是否出发以当地预警与向导安排为准。', '徒步是否出发以当地预警和实际路况为准。')
html = html.replace('万峰顶、铜鼓荡与黄果树在安顺', '铜鼓荡与黄果树在安顺')
html = html.replace('团队路线示意 · 含上海组机场接送', '团队路线示意 · 具体交通按出发城市查看')
# Keep the route sketch first in the overview and expanded by default.
match = re.search(r'<details class="map-fold"[^>]*>[\s\S]*?</details>', html)
if not match:
    raise ValueError('Missing overview route sketch')
route = re.sub(r'<details class="map-fold"[^>]*>', '<details class="map-fold" open>', match[0], count=1)
route = route.replace('展开路线示意', '路线示意')
route = route.replace('团队路线示意 · 具体交通按出发城市查看', '周六大巴 · 周日打车')
html = html[:match.start()] + html[match.end():]
anchor = re.search(r'<section class="view" id="overview"[^>]*>', html)
if not anchor:
    raise ValueError('Missing overview section')
html = html[:anchor.end()] + route + html[anchor.end():]
css = '\n/* BEGIN ITINERARY_STYLES */\n' + (source / 'itinerary.css').read_text() + '\n/* END ITINERARY_STYLES */\n'
if '/* BEGIN ITINERARY_STYLES */' in html:
    html = re.sub(r'/\* BEGIN ITINERARY_STYLES \*/[\s\S]*?/\* END ITINERARY_STYLES \*/', lambda _: css.strip(), html, count=1)
else:
    html = html.replace('</head>', '<style>' + css + '</style>\n</head>', 1)
obsolete = ['向导', 'A/B 两', 'A 线', 'B 线', 'd2-a-end', 'd2-b-end']
assert not any(text in html for text in obsolete), [(text, html[max(0,m.start()-70):m.end()+70]) for text in obsolete for m in re.finditer(re.escape(text), html)]
kit_config = json.loads((source / 'daily-kit.json').read_text())
kit_runtime = '/* BEGIN DAILY_KIT_RUNTIME */\nconst DAILY_KITS=' + json.dumps(kit_config, ensure_ascii=False, separators=(',', ':')) + ';\n' + (source / 'dailyKit.js').read_text() + '\n/* END DAILY_KIT_RUNTIME */\n'
html = html.replace('function renderDays(){', kit_runtime + 'function renderDays(){', 1)
route_runtime = '/* BEGIN ROUTE_IMAGE_RUNTIME */\n' + (source / 'routeImages.js').read_text() + '\n/* END ROUTE_IMAGE_RUNTIME */'
if '/* BEGIN ROUTE_IMAGE_RUNTIME */' in html:
    html = re.sub(r'/\* BEGIN ROUTE_IMAGE_RUNTIME \*/[\s\S]*?/\* END ROUTE_IMAGE_RUNTIME \*/', lambda _: route_runtime, html, count=1)
else:
    html = html.replace('/* BEGIN FOOD_RUNTIME */', route_runtime + '\n/* BEGIN FOOD_RUNTIME */', 1)
page.write_text(html)
print('Built four-day timelines with two themed route maps and contextual meal links.')
