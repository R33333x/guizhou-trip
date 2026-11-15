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
def svg(w,h,parts):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><path fill="#103c2f" d="M0 0H{w}V{h}H0Z"/>'+''.join(parts)+'</svg>'

hero=svg(1440,670,[fern(190,-38,1.7,-23,'#285aca'),fern(1250,-63,1.7,25,'#284dbd'),fan(49,362,1.8,36,'#2859c4','#237a62'),fan(1420,405,1.72,-35,'#305bcc','#227f65'),fern(293,370,1.45,-44,'#2b5ac9'),fern(1179,341,1.5,42,'#264fba'),seed(394,226,.46,-24),seed(1061,301,.46,29)])
heroMobile=svg(430,690,[fern(-29,-38,1.23,-16,'#285aca'),fern(461,-51,1.23,17,'#284dbd'),fan(-6,309,1.12,34,'#2b5dcc','#238068'),fan(451,424,1.2,-35,'#305bcc','#207b64'),fern(30,467,.94,-38,'#2b5ac9'),fern(392,498,.88,32,'#264fba'),seed(76,174,.32,-24),seed(376,278,.32,29)])
# Sparse artwork sits behind card glass, away from long text blocks.
main='<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="1350" viewBox="0 0 1120 1350">'+fan(1008,135,1.18,-35,'#476f9b','#557e65')+fern(35,194,1.4,-26,'#4a7198')+fan(621,499,1.5,24,'#567ca0','#5e826a')+fern(1113,793,1.55,29,'#55769b')+'</svg>'
import json
assets={name:'data:image/svg+xml,'+quote(s,safe='') for name,s in [('cover',hero),('coverMobile',heroMobile),('main',main)]}
(output/'art.json').write_text(json.dumps(assets))
(output/'art.css').write_text(':root{--botanical-cover:url("'+assets['cover']+'");--botanical-main:url("'+assets['main']+'");}\n@media(max-width:767px){:root{--botanical-cover:url("'+assets['coverMobile']+'");}}\n')
