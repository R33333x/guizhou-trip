"""Create coordinated light/dark route maps from the supplied geographic basemaps.

Requires Pillow. Rasterize each SVG at 1440 x 2180 after generation.
"""
from pathlib import Path
from html import escape
import base64
import math
import colorsys
from io import BytesIO
from PIL import Image

source=Path(__file__).resolve().parent
target=source.parents[2]/'public/assets/routes'
target.mkdir(parents=True,exist_ok=True)
MODE='dark'
BG='#232826'; TEXT='#DAECF4'; BLUE='#509EAB'; GREEN='#558F14'
PANEL='#2d3735'

def recolor(image, mode):
    # Keep every road, contour and label in place; remap only the source palette.
    image=image.convert('RGB').quantize(colors=256,dither=Image.Dither.NONE)
    original=image.getpalette(); mapped=[]
    for i in range(256):
        r,g,b=original[3*i:3*i+3]
        h,l,s=colorsys.rgb_to_hls(r/255,g/255,b/255)
        if mode=='light':
            if l>.62: color=(35,40,38)
            elif l>.43: color=(72,99,100)
            elif .56<h<.75 and s>.38: color=(119,178,190)
            elif .40<h<.54 and s>.53: color=(192,213,174)
            elif l<.12: color=(232,242,245)
            elif .57<h<.79: color=(192,210,211)
            else:
                v=max(0,min(1,(l-.16)/.23))
                color=tuple(round(a+(z-a)*v) for a,z in zip((214,230,224),(198,219,215)))
        else:
            if l>.62: color=(218,236,244)
            elif l>.43: color=(128,166,169)
            elif .56<h<.75 and s>.38: color=(42,87,104)
            elif .40<h<.54 and s>.53: color=(43,66,43)
            elif l<.12: color=(28,34,32)
            elif .57<h<.79: color=(48,64,65)
            else:
                v=max(0,min(1,(l-.16)/.23))
                color=tuple(round(a+(z-a)*v) for a,z in zip((38,53,47),(53,74,65)))
        mapped.extend(color)
    image.putpalette(mapped)
    return image.convert('RGB')

def embed(image):
    stream=BytesIO(); image.save(stream,format='PNG',optimize=True)
    return base64.b64encode(stream.getvalue()).decode()

def text(x,y,label,size=30,fill=None,weight=400,anchor='start'):
    if fill is None: fill=TEXT
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}">{escape(label)}</text>'

def base(title,sub,day):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1440" height="2180" viewBox="0 0 1440 2180" role="img" aria-label="{escape(title)}">
<defs><clipPath id="map-clip"><rect x="60" y="260" width="1320" height="1609" rx="30"/></clipPath><pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="{TEXT}" fill-opacity=".06"/></pattern></defs>
<style>text{{font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif}}.route{{fill:none;stroke-linejoin:round;stroke-linecap:round}}</style>
<rect width="1440" height="2180" fill="{BG}"/>
<path d="M1250 -80Q1050 120 1370 260M1410 0Q1120 170 1380 380" stroke="{BLUE}" stroke-width="55" opacity=".1" fill="none"/>
{text(70,80,'贵州同行 · '+day,24,BLUE,500)}
{text(68,158,title,59,TEXT,600)}
{text(70,217,sub,27,TEXT)}'''

def badge(x,y,n,r=27):
    return f'<circle cx="{x}" cy="{y}" r="{r+5}" fill="{BG}" fill-opacity=".88"/><circle cx="{x}" cy="{y}" r="{r}" fill="{BLUE}" stroke="{TEXT}" stroke-width="3"/>'+text(x,y+10,str(n),28,TEXT,650,'middle')

def arrow(x,y,angle,color=None):
    if color is None: color=TEXT
    return f'<path d="M-10 -13L8 0L-10 13" fill="none" stroke="{BG}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" transform="translate({x} {y}) rotate({angle})"/><path d="M-10 -13L8 0L-10 13" fill="none" stroke="{color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate({x} {y}) rotate({angle})"/>'

def route(d):
    return f'<path class="route" d="{d}" stroke="{BG}" stroke-opacity=".8" stroke-width="17"/><path class="route" d="{d}" stroke="{BLUE}" stroke-width="11"/><path class="route" d="{d}" stroke="{TEXT}" stroke-width="5"/>'

def qianling():
    image=embed(recolor(Image.open(source/'source/qianling-base.jpg'),MODE))
    svg=base('黔灵山 · 南门环线','南门进出 · 按编号与箭头顺序游览','11/29 周日')
    svg+=f'<g clip-path="url(#map-clip)"><image x="60" y="260" width="1320" height="1609" href="data:image/png;base64,{image}"/><rect x="60" y="260" width="1320" height="1609" fill="{BG}" opacity=".07"/>'
    svg+='<g transform="translate(60 260)">'
    segments=[
        'M878 1420 L840 1330 L822 1265 L856 1170 L871 1060 L875 955 L887 845 L908 732',
        'M908 732 L930 681 L975 639 L1038 605 L1071 529 L1072 407',
        'M1072 407 L1056 337 L1031 294 L979 283 L948 240 L945 184 L970 107',
        'M970 107 L933 151 L911 187 L887 224 L859 251',
        'M859 251 L830 292 L812 348 L823 421 L811 500 L762 575 L710 602 L643 611 L575 599 L522 614 L478 653 L435 674 L449 711 L424 768 L359 803 L280 830 L217 847',
        'M217 847 L315 824 L414 812 L455 860 L498 913 L536 996 L574 1052 L604 1098',
        'M604 1098 L577 1147 L567 1188 L618 1214',
        'M618 1214 L637 1172 L680 1148 L718 1128 L756 1120',
        'M756 1120 L788 1202 L816 1274 L840 1330 L878 1420',
    ]
    for d in segments:svg+=route(d)
    for x,y,a in [(873,1008,-84),(1059,564,-73),(1000,291,-155),(922,170,120),(811,463,99),(515,621,155),(397,815,5),(550,1025,60),(574,1166,93),(674,1153,-20),(806,1244,68)]:svg+=arrow(x,y,a)
    for x,y,n in [(878,1420,'1/10'),(908,732,2),(1072,407,3),(970,107,4),(859,251,5),(217,847,6),(604,1098,7),(618,1214,8),(756,1120,9)]:
        svg+=badge(x,y,n,39 if isinstance(n,str) else 27)
    svg+=f'<rect x="260" y="815" width="218" height="63" rx="15" fill="{BG}" fill-opacity=".94"/>'+text(278,858,'黔灵湖畔',31,TEXT,600)
    svg+='</g></g>'
    svg+=f'<rect x="60" y="260" width="1320" height="1609" rx="30" fill="none" stroke="{BLUE}" stroke-opacity=".5" stroke-width="2"/>'
    names=['南门 · 进园','麒麟洞','大熊猫馆','食草动物区','灵长馆','黔灵湖','罗汉堂','瞰筑亭','九曲径','南门 · 出园']
    for i,name in enumerate(names):
        col=i%5;row=i//5;x=86+col*265;y=1932+row*74
        svg+=badge(x,y,i+1,19)+text(x+34,y+9,name,25)
    svg+=text(70,2128,'线路为底图上的顺序示意；岔路以园内指引为准。',25,BLUE)
    svg+='</svg>'
    return svg

def panel(x,y,w,h):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="24" fill="{BG}" fill-opacity=".95" stroke="{BLUE}" stroke-opacity=".35" stroke-width="2"/>'

def small_label(x,y,label,w):
    return f'<rect x="{x-12}" y="{y-34}" width="{w}" height="49" rx="12" fill="{BG}" fill-opacity=".94"/>'+text(x,y,label,28,TEXT,600)

def huangguoshu():
    # Crop the phone chrome. The retained image preserves all five useful POIs
    # and their north/south relationship without inventing internal footpaths.
    image=Image.open(source/'source/huangguoshu-base.png').crop((0,330,1050,2540))
    image=embed(recolor(image,MODE))
    svg=base('黄果树 · 瀑布游览线','霞客亭 → 大瀑布 / 水帘洞 → 天星桥下半程','11/28 周六')
    svg+=f'<g clip-path="url(#map-clip)"><rect x="60" y="260" width="1320" height="1609" fill="{PANEL}"/>'
    svg+=f'<image x="60" y="260" width="764.457" height="1609" href="data:image/png;base64,{image}"/>'
    svg+=f'<path d="M795 260V1869" stroke="{BLUE}" stroke-opacity=".10" stroke-width="2"/>'
    # Coordinate conversion is the same uniform scale used for the basemap.
    def point(x,y): return (60+x*1609/2210,260+(y-330)*1609/2210)
    doup=point(478,810); falls=point(301,960)
    gao=point(491,2248); silver=point(481,2478)
    # A walking-order cue near the two northern scenic areas. It is not a GPS
    # trace: the supplied screenshot does not show the Xia Ke pavilion path.
    svg+=route(f'M{doup[0]} {doup[1]} Q310 644 {falls[0]} {falls[1]}')
    svg+=arrow(320,664,128)
    # Curved dashed transfer is explicitly a schematic sightseeing-bus leg.
    bus=f'M{falls[0]+28} {falls[1]+30} C675 908 618 1370 {gao[0]+20} {gao[1]-50}'
    svg+=f'<path class="route" d="{bus}" stroke="{BG}" stroke-width="17"/><path class="route" d="{bus}" stroke="{BLUE}" stroke-width="8" stroke-dasharray="16 16"/>'
    svg+=arrow(560,1160,91,BLUE)
    svg+=f'<rect x="451" y="1209" width="258" height="94" rx="17" fill="{BG}" fill-opacity=".94"/>'
    svg+=text(580,1247,'观光车转场',28,BLUE,600,'middle')
    svg+=text(580,1280,'示意连线',23,TEXT,400,'middle')
    svg+=route(f'M{gao[0]} {gao[1]} C{gao[0]-52} {gao[1]+55} {silver[0]-56} {silver[1]-76} {silver[0]} {silver[1]}')
    svg+=arrow(387,1740,91)
    svg+=badge(*doup,1,30)+small_label(448,607,'陡坡塘一带',205)
    svg+=badge(*falls,2,30)+small_label(321,720,'大瀑布',150)
    svg+=badge(*gao,3,30)+small_label(463,1657,'高老庄',150)
    svg+=f'<circle cx="{silver[0]}" cy="{silver[1]}" r="11" fill="{BLUE}" stroke="{TEXT}" stroke-width="4"/>'
    svg+=small_label(452,1826,'银链坠潭瀑布',216)
    # The screenshot omits these exact internal locations, so their sequence
    # belongs in the adjacent guide, rather than fictitious geographical pins.
    svg+=panel(744,310,590,112)
    svg+=text(778,356,'12:00 左右到园',30,TEXT,600)
    svg+=text(778,395,'17:00 集合，乘大巴返程',27,BLUE,500)
    svg+=panel(744,458,590,318)
    svg+=badge(787,510,1,23)+text(827,522,'霞客亭 · 看全景',35,TEXT,600)
    svg+=text(778,575,'陡坡塘站下车后，过马路',28)
    svg+=text(778,620,'经保安亭右侧，步行约 10 分钟',28)
    svg+=text(778,665,'先看大瀑布全景，再去大瀑布',28)
    svg+=text(778,726,'不进入陡坡塘景区',29,BLUE,600)
    svg+=panel(744,816,590,327)
    svg+=badge(787,869,2,23)+text(827,881,'大瀑布 + 水帘洞',35,TEXT,600)
    svg+=text(778,935,'沿观景步道下行 → 各观景台',28)
    svg+=text(778,980,'→ 水帘洞 → 扶梯上行',28)
    svg+=text(778,1025,'游览约 1 小时，再乘观光车转场',28)
    svg+=text(778,1092,'水帘洞开放与预约以景区通知为准',25,BLUE,500)
    svg+=panel(744,1183,590,480)
    svg+=badge(787,1236,3,23)+text(827,1248,'天星桥 · 下半程',35,TEXT,600)
    svg+=text(778,1304,'跳过上半程，按现场指引进步道',28)
    svg+=text(778,1353,'左侧楼梯 → 高老庄',30,TEXT,600)
    svg+=text(778,1405,'→ 天星洞',30,TEXT,600)
    svg+=text(778,1457,'→ 银链坠潭瀑布',30,TEXT,600)
    svg+=text(778,1509,'→ 星峡飞瀑出口',30,TEXT,600)
    svg+=text(778,1569,'下半程约 2—3 小时',28,BLUE,500)
    svg+=text(778,1618,'留好出园与观光车换乘时间',26)
    svg+=panel(744,1693,590,152)
    svg+=text(778,1734,'N ↑',26,BLUE,600)
    svg+=text(778,1787,'实线：步行顺序',25)
    svg+=text(778,1828,'虚线：观光车转场',25)
    svg+='</g>'
    svg+=f'<rect x="60" y="260" width="1320" height="1609" rx="30" fill="none" stroke="{BLUE}" stroke-opacity=".45" stroke-width="2"/>'
    svg+=badge(95,1938,1,23)+text(135,1948,'霞客亭看全景',29,TEXT,600)
    svg+=badge(515,1938,2,23)+text(555,1948,'大瀑布 / 水帘洞',29,TEXT,600)
    svg+=badge(1024,1938,3,23)+text(1064,1948,'天星桥下半程',29,TEXT,600)
    svg+=text(70,2030,'17:00 大巴返程 · 预计 19:00 到花溪吃晚饭',30,TEXT,600)
    svg+=text(70,2090,'连线为游览顺序示意；内部步道与上下车点以景区指引为准。',25,BLUE)
    svg+=text(70,2138,'底图：高德地图',22,BLUE)
    return svg+'</svg>'


if __name__=='__main__':
    for mode in ('light','dark'):
        MODE=mode
        BG='#DAECF4' if mode=='light' else '#232826'
        TEXT='#232826' if mode=='light' else '#DAECF4'
        PANEL='#ccdedb' if mode=='light' else '#2d3735'
        for name,draw in [('qianling',qianling),('huangguoshu',huangguoshu)]:
            content=draw()
            path=target/f'{name}-route-{mode}.svg'
            path.write_text(content)
            if mode=='dark':
                (target/f'{name}-route.svg').write_text(content)
            print(path)
