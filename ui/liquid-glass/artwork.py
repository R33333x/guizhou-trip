from pathlib import Path
import sys
output=Path(sys.argv[1])
from math import sin,cos,pi
from urllib.parse import quote

def fern(x,y,scale,angle,color):
 out=[f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})" fill="{color}">']
 out.append('<path d="M0 250C10 163-9 73 0 0L3 0C-4 80 17 166 3 250Z"/>')
 for i in range(10):
  yy=24+i*20; w=14+sin((i+1)/11*pi)*43
  out.append(f'<path d="M1 {yy+12}C{-w*.48} {yy+7} {-w*1.08} {yy-12} {-w} {yy-31}C{-w*.63} {yy-22} {-w*.14} {yy-14} 1 {yy+12}Z"/>')
  out.append(f'<path d="M2 {yy+17}C{w*.48} {yy+6} {w*1.04} {yy-9} {w*.91} {yy-28}C{w*.66} {yy-19} {w*.17} {yy-8} 2 {yy+17}Z"/>')
 out.append('</g>');return ''.join(out)
def fan(x,y,s,angle,color,alt):
 out=[f'<g transform="translate({x} {y}) rotate({angle}) scale({s})">']
 for i in range(9):
  a=-94+i*22;length=90+20*sin(i/8*pi)
  out.append(f'<path transform="rotate({a})" fill="{alt if i%3==0 else color}" d="M0 0C-12 -30-19 -{length*.70:.1f} 0 -{length:.1f}C15 -{length*.72:.1f} 12 -29 0 0Z"/>')
 out.append(f'<path fill="{color}" d="M-2-3C-9 30-4 48 2 63L6 61C0 41-3 22 2-3Z"/></g>');return ''.join(out)
def seed(x,y,s,angle):
 return f'<g transform="translate({x} {y}) rotate({angle}) scale({s})"><path fill="#c49d51" d="M0 30C-28 4-15-25 0-43C18-23 28 3 0 30Z"/><path fill="#234ed0" d="M0 19C-16 2-9-13 0-24C11-10 17 2 0 19Z"/><path fill="#103c2f" d="M0 9C-7 1-4-6 0-10C5-4 7 3 0 9Z"/></g>'
# Flat, cut-paper foliage and ornamental flowers inspired by the supplied cover.
def feather(x,y,s,angle,color,alt):
 out=[f'<g transform="translate({x} {y}) rotate({angle}) scale({s})">',f'<path d="M0 275Q-25 135 7 0" fill="none" stroke="{color}" stroke-width="3"/>']
 for i in range(9):
  yy=30+i*25;w=28+26*sin((i+1)/10*pi)
  for side in [-1,1]:
   out.append(f'<path transform="translate(0 {yy}) scale({side} 1)" fill="{alt if i%4==0 else color}" d="M0 10C14-9 {w-15}-19 {w}-48C{w+10}-9 22 9 0 10Z"/>')
 return ''.join(out)+'</g>'
def flower(x,y,s,angle,color,alt):
 out=[f'<g transform="translate({x} {y}) rotate({angle}) scale({s})">']
 for i in range(8):
  out.append(f'<path transform="rotate({i*45})" fill="{alt if i%2 else color}" d="M0 5C-26-13-24-44 0-67C24-44 26-13 0 5Z"/>')
 out.append(f'<circle r="15" fill="{alt}"/><circle r="7" fill="{color}"/></g>')
 return ''.join(out)
def split_leaf(x,y,s,angle,color,alt):
 out=[f'<g transform="translate({x} {y}) rotate({angle}) scale({s})">']
 # Lobes are separate silhouettes: the open cuts stay transparent on either theme.
 for side in [-1,1]:
  for i in range(6):
   yy=25+i*25;w=44+35*sin((i+1)/7*pi)
   out.append(f'<path transform="scale({side} 1)" fill="{alt if i==1 else color}" d="M2 {yy+36}C{w*.45} {yy+31} {w+14} {yy+16} {w} {yy-16}C{w*.65} {yy+3} 22 {yy+6} 2 {yy+14}Z"/>')
 out.append(f'<path fill="{color}" d="M-3 219Q12 114-1 0L5 0Q19 119 2 220Z"/></g>')
 return ''.join(out)
def eye(x,y,s,angle,color,alt):
 return f'<g transform="translate({x} {y}) rotate({angle}) scale({s})">'+feather(0,-95,.58,0,color,alt)+f'<path fill="{alt}" d="M0-35C-39-19-34 22 0 37C34 22 39-19 0-35Z"/><path fill="{color}" d="M0-23C-23-12-22 15 0 26C22 15 23-12 0-23Z"/><ellipse rx="8" ry="13" fill="#103c2f"/></g>'
def tile(w,h,parts):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'+''.join(parts)+'</svg>'

def svg(w,h,parts):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><path fill="#103c2f" d="M0 0H{w}V{h}H0Z"/>'+''.join(parts)+'</svg>'

hero=svg(1440,670,[fern(190,-38,1.7,-23,'#285aca'),fern(1250,-63,1.7,25,'#284dbd'),fan(49,362,1.8,36,'#2859c4','#237a62'),fan(1420,405,1.72,-35,'#305bcc','#227f65'),fern(293,370,1.45,-44,'#2b5ac9'),fern(1179,341,1.5,42,'#264fba'),seed(394,226,.46,-24),seed(1061,301,.46,29)])
heroMobile=svg(430,690,[fern(-29,-38,1.23,-16,'#285aca'),fern(461,-51,1.23,17,'#284dbd'),fan(-6,309,1.12,34,'#2b5dcc','#238068'),fan(451,424,1.2,-35,'#305bcc','#207b64'),fern(30,467,.94,-38,'#2b5ac9'),fern(392,498,.88,32,'#264fba'),seed(76,174,.32,-24),seed(376,278,.32,29)])
# A seamless vertical repeat keeps the botanical surround present on long pages.
# Both ends leave room for the neighbouring tile; no motif is cut at a repeat edge.
main=tile(1120,1680,[
 fan(1008,135,1.18,-35,'#476f9b','#557e65'),fern(35,194,1.4,-26,'#4a7198'),
 flower(590,110,.55,15,'#476f9b','#557e65'),
 split_leaf(1060,420,1.25,30,'#476f9b','#557e65'),
 feather(85,625,1.15,-30,'#4a7198','#557e65'),
 fan(621,499,1.25,24,'#567ca0','#5e826a'),
 eye(965,895,.7,25,'#476f9b','#557e65'),
 flower(130,1050,.82,-18,'#476f9b','#557e65'),
 feather(1040,1130,1.18,28,'#4a7198','#557e65'),
 split_leaf(90,1270,1.3,-32,'#476f9b','#557e65'),
 fan(653,1455,1.1,-15,'#567ca0','#5e826a'),
 seed(375,861,.65,-25),seed(872,1495,.5,25)])
mainMobile=tile(430,1560,[
 fan(403,92,.65,-28,'#476f9b','#557e65'),
 feather(14,145,.72,-24,'#4a7198','#557e65'),
 flower(234,285,.34,18,'#476f9b','#557e65'),
 split_leaf(409,375,.73,25,'#476f9b','#557e65'),
 fan(20,633,.86,28,'#567ca0','#5e826a'),
 eye(381,750,.4,25,'#476f9b','#557e65'),
 flower(61,870,.53,-15,'#476f9b','#557e65'),
 feather(411,962,.84,24,'#4a7198','#557e65'),
 split_leaf(27,1176,.77,-28,'#476f9b','#557e65'),
 fan(348,1434,.74,-22,'#567ca0','#5e826a'),
 seed(221,1095,.4,-20),seed(132,1476,.38,25)])
# Add a few smaller cover ornaments without changing the shared hero/nav canvas.
hero=hero.replace('</svg>',flower(391,445,.42,-12,'#476f9b','#557e65')+eye(1074,166,.38,28,'#476f9b','#557e65')+'</svg>')
heroMobile=heroMobile.replace('</svg>',flower(365,161,.27,12,'#476f9b','#557e65')+eye(49,514,.28,-18,'#476f9b','#557e65')+'</svg>')
import json
import re
original={name:s for name,s in [('cover',hero),('coverMobile',heroMobile),('main',main),('mainMobile',mainMobile)]}
# Recolor the established SVG silhouettes without changing paths or placement.
schemes=json.loads((Path(__file__).resolve().parent/'schemes.json').read_text())
assets={}
primary=['#285aca','#284dbd','#2859c4','#305bcc','#2b5ac9','#264fba','#2b5dcc','#476f9b','#4a7198','#567ca0','#55769b']
alternate=['#237a62','#227f65','#238068','#207b64','#557e65','#5e826a']
for look,scheme in schemes.items():
 assets[look]={}
 for theme,colors in ((theme,scheme[theme]) for theme in ['light','dark']):
  assets[look][theme]={}
  def recolor(match):
   color=match[0]
   if color=='#103c2f':return colors['bg']
   if color in primary:return colors['primary']
   if color in alternate:return colors['alternate']
   if color=='#c49d51':return colors['seed']
   if color=='#234ed0':return colors['alternate']
   return color
  for name,svgText in original.items():
   svgText=re.sub(r'#[0-9A-Fa-f]{6}',recolor,svgText)
   assets[look][theme][name]='data:image/svg+xml,'+quote(svgText,safe='')
(output/'art.json').write_text(json.dumps(assets))
css=[]
for look,themes in assets.items():
 for theme,urls in themes.items():
  selector=':root[data-look="'+look+'"][data-palette="'+theme+'"]'
  css.append(selector+'{--botanical-cover:url("'+urls['cover']+'");--botanical-main:url("'+urls['main']+'");}')
  css.append('@media(max-width:767px){'+selector+'{--botanical-cover:url("'+urls['coverMobile']+'");--botanical-main:url("'+urls['mainMobile']+'");}}')
(output/'art.css').write_text('\n'.join(css))
