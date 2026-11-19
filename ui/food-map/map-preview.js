/* The basemap uses WGS84. External providers receive their own coordinate type. */
let foodLiveMap=null,foodLiveTiles=null,foodLiveMarkers=[],foodDistanceLine=null,foodLodgingMarker=null;
let foodMapInitPromise=null,foodMapSelected='food-48',foodTilesLoaded=0,foodTilesFailed=0;
const foodMapPlaces=FOOD_MAP_PREVIEW.places;
function foodMapAccent(){const style=getComputedStyle($('food-live-map'));return style.getPropertyValue('--map-accent').trim()||style.getPropertyValue('--accent').trim()||style.color;}
let foodMapColorFrame=0;
new MutationObserver(()=>{if(foodMapColorFrame)return;foodMapColorFrame=requestAnimationFrame(()=>{foodMapColorFrame=0;if(foodDistanceLine)foodDistanceLine.setStyle({color:foodMapAccent()});});}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-palette','data-look']});
function foodMapDistance(a,b){const r=Math.PI/180,lat=(b.coordinates[0]-a.coordinates[0])*r,lng=(b.coordinates[1]-a.coordinates[1])*r,h=Math.sin(lat/2)**2+Math.cos(a.coordinates[0]*r)*Math.cos(b.coordinates[0]*r)*Math.sin(lng/2)**2;return 6371008.8*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
function foodDistanceText(d){return d>=1000?(d/1000).toFixed(2)+' 公里':Math.max(10,Math.round(d/10)*10)+' 米';}
function foodRouteUrls(a,b){
 const apple='https://maps.apple.com/directions?'+new URLSearchParams({source:a.name+' '+a.address,'source-place-id':new URL(a.appleUrl).searchParams.get('place-id'),destination:b.name+' '+b.address,'destination-place-id':new URL(b.appleUrl).searchParams.get('place-id'),mode:'walking'});
 const params=new URLSearchParams({origin:'latlng:'+a.gcj02.join(',')+'|name:'+a.name,destination:'latlng:'+b.gcj02.join(',')+'|name:'+b.name,mode:'walking',coord_type:'gcj02',region:foodRegionInfo(a.region).city,output:'html',src:'andr.guizhou.trip'});
 const baidu='https://api.map.baidu.com/direction?'+params;
 const android='intent://map/direction?'+params+'#Intent;scheme=bdapp;package=com.baidu.BaiduMap;S.browser_fallback_url='+encodeURIComponent(baidu)+';end';
 return {apple,baidu,android};
}
function foodRouteLinks(a,b){const urls=foodRouteUrls(a,b),device=foodDevice(),aTag=(url,label,cls='')=>`<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;return device==='ios'?aTag(urls.apple,'苹果地图步行'):device==='android'?aTag(urls.android,'百度地图步行')+aTag(urls.baidu,'网页版','food-route-secondary'):aTag(urls.apple,'苹果地图步行')+aTag(urls.baidu,'百度地图步行');}
function updateFoodMapDistance({fit=false}={}){
 const a=foodPlace($('food-distance-from').value),b=foodPlace($('food-distance-to').value);
 if(foodDistanceLine){foodDistanceLine.remove();foodDistanceLine=null;}
 const routes=$('food-distance-routes');routes.innerHTML='';
 if(!a||!b){$('food-distance-result').textContent='暂无可比较的地点';return;}
 if(a.shopId===b.shopId){$('food-distance-result').textContent='请选择两家不同的店';return;}
 $('food-distance-result').textContent='直线约 '+foodDistanceText(foodMapDistance(a,b));routes.innerHTML=foodRouteLinks(a,b);
 if(foodLiveMap&&document.querySelector('.food-distance-panel').open){foodDistanceLine=L.polyline([a.coordinates,b.coordinates],{color:foodMapAccent(),weight:3,opacity:.9,dashArray:'7 8',interactive:false}).addTo(foodLiveMap);if(fit)foodLiveMap.fitBounds(L.latLngBounds([a.coordinates,b.coordinates]),{padding:[55,55],maxZoom:16,animate:false});}
}
function foodSelectedDetail(shop){
 if(!shop)return '';
 const p=foodPlace(shop.id),reason=(title,value)=>value?`<div><dt>${title}</dt><dd>${esc(value)}</dd></div>`:'';
 const photo=shop.image?`<button type="button" class="food-detail-photo" data-food-photo="${shop.id}" aria-label="放大${esc(shop.name)}的图片"><img src="${esc(shop.image)}" alt="${esc(shop.name)}" loading="lazy" width="${shop.imageWidth}" height="${shop.imageHeight}"><span>放大图片 ↗</span></button>`:'';
 const links=`<a href="${esc(p?.appleUrl||foodAppleSearch(shop))}" target="_blank" rel="noopener noreferrer" aria-label="在苹果地图打开${esc(shop.name)}">苹果地图 ↗</a><a href="${esc(foodMapUrl(shop))}" target="_blank" rel="noopener noreferrer" aria-label="在高德地图打开${esc(shop.name)}">高德地图 ↗</a><a href="${esc(foodDianpingWeb(shop))}" target="_blank" rel="noopener noreferrer" aria-label="在大众点评打开${esc(shop.name)}">大众点评 ↗</a>`;
 return `<div class="food-detail-grid${photo?'':' food-detail-without-photo'}">${photo}<div class="food-detail-copy"><p class="food-detail-category">${esc(shop.category||shop.meal)}</p><h4 tabindex="-1">${esc(shop.name)}</h4><p class="food-detail-description">${esc(foodShopDescription(shop))}</p><dl class="food-original">${reason('备注',shop.note)}${reason('地址',shop.address)}</dl><div class="food-detail-actions">${links}</div></div></div>`;
}
function selectFoodMapPlace(id,{pan=true}={}){
 const shop=foodVisibleShops().find(s=>s.id===id);if(!shop)return;
 foodMapSelected=id;
 document.querySelectorAll('[data-food-map-place]').forEach(b=>{const selected=b.dataset.foodMapPlace===id;b.setAttribute('aria-pressed',String(selected));b.closest('.food-shop-row')?.classList.toggle('is-selected',selected);});
 $('food-map-selected').innerHTML=foodSelectedDetail(shop);
 foodLiveMarkers.forEach(({marker,place})=>{const el=marker.getElement();el?.classList.toggle('is-selected',place.shopId===id);el?.setAttribute('aria-pressed',String(place.shopId===id));marker.setZIndexOffset(place.shopId===id?1000:0);});
 const p=foodPlace(id);if(foodLiveMap&&pan&&p)foodLiveMap.panTo(p.coordinates,{animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
 if(p){const from=$('food-distance-from'),to=$('food-distance-to');from.value=id;if(to.value===id){const other=[...to.options].find(o=>o.value!==id);if(other)to.value=other.value;}updateFoodMapDistance();}
}
function renderFoodExplorer(shops,{fit=false}={}){
 const places=shops.map(s=>foodPlace(s.id)).filter(Boolean),previousFrom=$('food-distance-from').value,previousTo=$('food-distance-to').value;

 const options=places.map(p=>`<option value="${p.shopId}">${p.number}. ${esc(p.shortName)}</option>`).join('');
 $('food-distance-from').innerHTML=options;$('food-distance-to').innerHTML=options;
 $('food-distance-from').disabled=$('food-distance-to').disabled=places.length<2;
 if(places.some(p=>p.shopId===previousFrom))$('food-distance-from').value=previousFrom;
 if(places.some(p=>p.shopId===previousTo))$('food-distance-to').value=previousTo;
 else if(places[1])$('food-distance-to').value=places[1].shopId;
 if(foodLiveMap){foodLiveMarkers.forEach(({marker})=>marker.remove());foodLiveMarkers=[];if(foodLodgingMarker){foodLodgingMarker.remove();foodLodgingMarker=null;}
  foodLiveMarkers=places.map(place=>{const s=FOOD_SHOPS.find(s=>s.id===place.shopId),icon=L.divIcon({className:'food-pin'+(s.meal==='小吃'?' food-pin-snack':''),html:`<span class="food-pin-number"><span>${place.number}</span></span>`,iconSize:[36,42],iconAnchor:[17,39],tooltipAnchor:[0,-35]});const marker=L.marker(place.coordinates,{icon,title:place.name,alt:place.name,keyboard:true,riseOnHover:true}).addTo(foodLiveMap);marker.bindTooltip(place.shortName,{direction:'top',opacity:1});marker.on('click',()=>{selectFoodMapPlace(place.shopId,{pan:false});const b=document.querySelector(`[data-food-map-place="${place.shopId}"]`);if(b){const row=b.closest('.food-shop-row'),list=$('food-grid');list.scrollTop=Math.max(0,row.offsetTop-list.clientHeight/2+row.clientHeight/2);}});marker.getElement()?.setAttribute('aria-label',place.number+'. '+place.name);return {marker,place};});
  if(foodRegion==='huaxi'){foodLodgingMarker=L.marker(FOOD_MAP_PREVIEW.lodging.coordinates,{icon:L.divIcon({className:'food-lodging-pin',html:'<span>⌂</span>',iconSize:[36,36],iconAnchor:[18,18]}),title:'禧竹山房（民宿）',alt:'禧竹山房民宿'}).addTo(foodLiveMap).bindTooltip('禧竹山房 · 民宿',{permanent:true,direction:'top'});}
  if(fit)fitFoodLiveMap();
 }
 if(foodMapSelected)selectFoodMapPlace(foodMapSelected,{pan:false});else $('food-map-selected').innerHTML=foodSelectedDetail(null);
 updateFoodMapDistance();
}
function fitFoodLiveMap(){if(!foodLiveMap)return;foodLiveMap.invalidateSize({pan:false});const p=foodVisibleShops().map(s=>foodPlace(s.id)).filter(Boolean);if(p.length)foodLiveMap.fitBounds(L.latLngBounds(p.map(p=>p.coordinates)),{padding:[45,45],maxZoom:16,animate:false});else if(foodRegion==='huaxi')foodLiveMap.setView(FOOD_MAP_PREVIEW.lodging.coordinates,13,{animate:false});else foodLiveMap.setView(foodRegion==='anshun'?[26.246,105.933]:[26.584,106.709],14,{animate:false});}
function foodMapTileStatus(){$('food-map-loading').hidden=true;$('food-map-network').hidden=!(foodTilesLoaded===0&&foodTilesFailed>0);}
async function initFoodLiveMap(){
 if(foodMapInitPromise){await foodMapInitPromise;if(foodLiveMap)requestAnimationFrame(()=>foodLiveMap.invalidateSize({pan:false}));return;}
 document.querySelector('.food-distance-panel').addEventListener('toggle',()=>updateFoodMapDistance());
 $('food-distance-from').addEventListener('change',()=>updateFoodMapDistance({fit:true}));$('food-distance-to').addEventListener('change',()=>updateFoodMapDistance({fit:true}));$('food-map-fit').addEventListener('click',fitFoodLiveMap);$('food-map-fit').disabled=true;
 $('food-map-retry').addEventListener('click',()=>{foodTilesLoaded=foodTilesFailed=0;$('food-map-loading').hidden=false;$('food-map-network').hidden=true;if(foodLiveTiles)foodLiveTiles.redraw();else location.reload();});
 foodMapInitPromise=(async()=>{try{
  if(!window.L)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/leaflet/leaflet.js';script.onload=resolve;script.onerror=()=>reject(new Error('Leaflet could not load'));document.head.appendChild(script);});
  foodLiveMap=L.map('food-live-map',{zoomControl:false,scrollWheelZoom:false,touchZoom:true,keyboard:true,attributionControl:true,minZoom:3,maxZoom:19});L.control.zoom({position:'topright',zoomInTitle:'放大地图',zoomOutTitle:'缩小地图'}).addTo(foodLiveMap);L.control.scale({position:'bottomleft',imperial:false}).addTo(foodLiveMap);
  foodLiveTiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'});foodLiveTiles.on('tileload',()=>{foodTilesLoaded++;$('food-map-network').hidden=true;$('food-map-loading').hidden=true;});foodLiveTiles.on('tileerror',()=>{foodTilesFailed++;});foodLiveTiles.on('load',foodMapTileStatus);foodLiveTiles.addTo(foodLiveMap);
  renderFoodExplorer(foodVisibleShops(),{fit:true});$('food-map-fit').disabled=false;
  new ResizeObserver(()=>{if($('food-live-map').offsetWidth>0)foodLiveMap.invalidateSize({pan:false});}).observe($('food-live-map'));
 }catch(error){$('food-map-loading').textContent='地图组件暂时无法加载';$('food-map-network').hidden=false;}})();await foodMapInitPromise;
}
