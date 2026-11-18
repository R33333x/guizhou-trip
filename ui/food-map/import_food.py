"""Extract the source text and Excel in-cell images without changing the workbook."""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import argparse,json,hashlib,posixpath,io
from PIL import Image, ImageOps

parser=argparse.ArgumentParser();parser.add_argument('workbook',type=Path);parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2]);args=parser.parse_args()
root=args.root;assets=root/'public/assets/food';assets.mkdir(parents=True,exist_ok=True)
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.microsoft.com/office/spreadsheetml/2017/richdata','p':'http://schemas.openxmlformats.org/package/2006/relationships','o':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
with ZipFile(args.workbook) as z:
 shared=[''.join(si.itertext()) for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
 rels={r.get('Id'):posixpath.normpath('xl/richData/'+r.get('Target')) for r in ET.fromstring(z.read('xl/richData/_rels/richValueRel.xml.rels'))}
 relIDs=[r.get('{'+ns['o']+'}id') for r in ET.fromstring(z.read('xl/richData/richValueRel.xml'))]
 rich=[int(r.find('r:v',ns).text) for r in ET.fromstring(z.read('xl/richData/rdrichvalue.xml'))]
 metadata=ET.fromstring(z.read('xl/metadata.xml'));values=metadata.find('s:valueMetadata',ns)
 future=metadata.find("s:futureMetadata[@name='XLRICHVALUE']",ns)
 def image_at(c):
  idx=int(c.get('vm'))-1;future_idx=int(values[idx].find('s:rc',ns).get('v'));rv=int(future[future_idx].find('.//r:rvb',ns).get('i'));return rels[relIDs[rich[rv]]]
 rows=[];region='';images={}
 for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',ns):
  fields={};source_image=None
  for c in row.findall('s:c',ns):
   col=''.join(filter(str.isalpha,c.get('r')));v=c.findtext('s:v',default='',namespaces=ns)
   if c.get('t')=='s':v=shared[int(v)]
   elif c.get('t')=='inlineStr':v=''.join(c.find('s:is',ns).itertext())
   if c.get('vm'):source_image=image_at(c);v=''
   if v:fields[col]=v
  name=fields.get('A','');rn=int(row.get('r'))
  if name.startswith('安顺区域'):region='anshun';continue
  if name.startswith('花溪区'):region='huaxi';continue
  if name.startswith('贵阳市中心'):region='guiyang';continue
  if not name or name=='名称':continue
  record={'id':f'food-{rn}','region':region,'name':name,'meal':fields.get('B',''),'category':fields.get('C',''),'features':fields.get('E',''),'address':fields.get('F',''),'note':fields.get('G',''),'sourceRow':rn}
  if source_image:
   key=Path(source_image).stem
   if key not in images:
    raw=z.read(source_image);im=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB');size=im.size
    full=im.copy();full.save(assets/f'{key}.webp','WEBP',quality=90,method=6)
    # Contain thumbnail keeps text and collages intact; full image remains available.
    thumb=im.copy();thumb.thumbnail((760,1100),Image.Resampling.LANCZOS);thumb.save(assets/f'{key}-thumb.webp','WEBP',quality=86,method=6)
    images[key]={'source':source_image,'originalWidth':size[0],'originalHeight':size[1],'width':full.width,'height':full.height,'sha256':hashlib.sha256(raw).hexdigest()}
   meta=images[key];record.update({'image':f'assets/food/{key}.webp','thumbnail':f'assets/food/{key}-thumb.webp','imageWidth':meta['width'],'imageHeight':meta['height']})
  rows.append(record)
 data={'source':'贵阳美食清单.xlsx','sheet':'三区域','sourceSha256':hashlib.sha256(args.workbook.read_bytes()).hexdigest(),'imported':'2026-11-17','shops':rows,'images':images}
 (root/'ui/food-map/food-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'shops':len(rows),'perRegion':{r:sum(s['region']==r for s in rows) for r in ['guiyang','anshun','huaxi']},'uniqueImages':len(images),'imageDimensions':images},ensure_ascii=False,indent=2))
