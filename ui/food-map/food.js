/* Excel text and research provenance are retained in the source data. */
const FOOD_REGIONS=[
 {id:'anshun',name:'安顺区域',short:'安顺',city:'安顺市'},
 {id:'guiyang',name:'贵阳市中心',short:'贵阳市中心',city:'贵阳市'},
 {id:'huaxi',name:'民宿附近',short:'花溪区',city:'贵阳市花溪区'}
];
let foodRegion='guiyang',foodMeal='all',foodReady=false,foodImageTrigger=null,foodBodyOverflow='';
function foodExtra(s){return FOOD_ENRICHMENT[s.id]||{};}
function foodPlace(id){return FOOD_MAP_PREVIEW.places.find(p=>p.shopId===id);}
function foodRegionInfo(id=foodRegion){return FOOD_REGIONS.find(r=>r.id===id);}
function foodDevice(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Macintosh/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1)?'ios':/Android/i.test(navigator.userAgent)?'android':'desktop';}
function foodMapUrl(shop){const p=foodPlace(shop.id);return p?'https://uri.amap.com/marker?'+new URLSearchParams({position:[p.gcj02[1],p.gcj02[0]].join(','),name:shop.name,coordinate:'gaode',src:'guizhou-trip',callnative:'1'}):'https://uri.amap.com/search?'+new URLSearchParams({keyword:shop.name+' '+(shop.address||foodRegionInfo(shop.region).city),city:foodRegionInfo(shop.region).city,view:'map',src:'guizhou-trip'});}
function foodAppleSearch(shop){return 'https://maps.apple.com/?'+new URLSearchParams({q:shop.name+' '+(shop.address||foodRegionInfo(shop.region).city)});}
function foodDianpingWeb(shop){const id=foodExtra(shop).dianpingId;return id?'https://m.dianping.com/shop/'+id:'https://m.dianping.com/search/keyword/'+(shop.region==='anshun'?'261':'258')+'/0_'+encodeURIComponent(shop.name);}
function foodVisibleShops(){return FOOD_SHOPS.filter(s=>s.region===foodRegion&&(foodMeal==='all'||s.meal===foodMeal));}
function foodShopDescription(shop){return shop.features||foodExtra(shop).blurb||foodExtra(shop).description||'';}
function foodShopUI(shop){const p=foodPlace(shop.id);return `<div class="food-shop-row${shop.id===foodMapSelected?' is-selected':''}" data-food-row="${shop.id}"><button type="button" class="food-shop-pick" data-food-map-place="${shop.id}" aria-pressed="${shop.id===foodMapSelected}"><span class="food-list-photo">${shop.thumbnail?`<img src="${esc(shop.thumbnail)}" alt="" loading="lazy" width="62" height="62">`:'<span aria-hidden="true">🍜</span>'}${p?`<b class="${shop.meal==='小吃'?'snack':''}">${p.number}</b>`:''}</span><span class="food-list-copy"><strong>${esc(shop.name)}</strong><small>${esc(shop.category||shop.meal)}</small><span>${esc(foodShopDescription(shop))}</span></span></button></div>`;}
function renderFoodResults({fit=false}={}){
 if(!foodReady)return;
 const shops=foodVisibleShops();
 if(!shops.some(s=>s.id===foodMapSelected))foodMapSelected=(shops.find(s=>s.id==='food-48')||shops[0])?.id||null;
 $('food-region-title').textContent=foodRegion==='huaxi'?'花溪区':foodRegionInfo().name;
 document.querySelectorAll('[data-food-region]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.foodRegion===foodRegion)));
 document.querySelectorAll('[data-food-meal]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.foodMeal===foodMeal)));
 $('food-grid').innerHTML=shops.map(foodShopUI).join('');$('food-empty').hidden=shops.length!==0;
 $('food-result-count').textContent=shops.length+' 家';renderFoodExplorer(shops,{fit});
}
function initFood(){
 if(foodReady){initFoodLiveMap();return;}
 foodReady=true;
 $('food-regions').innerHTML=FOOD_REGIONS.map(r=>`<button type="button" data-food-region="${r.id}" aria-pressed="${r.id===foodRegion}"><span>${r.name}</span><small>${r.id==='huaxi'?'花溪区 · ':''}${FOOD_SHOPS.filter(s=>s.region===r.id).length} 家</small></button>`).join('');
 renderFoodResults({fit:true});initFoodLiveMap();
}
function setFoodRegion(id){if(!FOOD_REGIONS.some(r=>r.id===id))return;initFood();foodRegion=id;foodMeal='all';foodMapSelected=null;$('food-grid').scrollTop=0;renderFoodResults({fit:true});}
function openFoodGuide(region){showView('food',{scroll:true});if(region)setFoodRegion(region);}
$('food-clear-filters').addEventListener('click',()=>{foodMeal='all';renderFoodResults({fit:true});});
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return;
 const area=event.target.closest('[data-food-region]');if(area){setFoodRegion(area.dataset.foodRegion);return;}
 const meal=event.target.closest('[data-food-meal]');if(meal){foodMeal=meal.dataset.foodMeal;$('food-grid').scrollTop=0;renderFoodResults({fit:true});return;}
 const view=event.target.closest('[data-food-open]');if(view){openFoodGuide(view.dataset.foodOpen);return;}
 const choose=event.target.closest('[data-food-map-place]');if(choose){selectFoodMapPlace(choose.dataset.foodMapPlace);return;}
 const photo=event.target.closest('[data-food-photo]');if(photo){const shop=FOOD_SHOPS.find(s=>s.id===photo.dataset.foodPhoto);if(shop?.image)openFoodPhoto(shop,photo);}
});
function openFoodPhoto(shop,trigger){
 const dialog=$('food-photo-dialog');foodImageTrigger=trigger;foodBodyOverflow=document.body.style.overflow;
 $('food-photo-title').textContent=shop.name;$('food-photo-subtitle').textContent='';
 const img=$('food-photo-full');img.src=shop.image;img.alt=shop.name;img.width=shop.imageWidth;img.height=shop.imageHeight;
 $('food-photo-source').href=shop.image;
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';$('food-photo-close').focus({preventScroll:true});
}
function closeFoodPhoto(){const dialog=$('food-photo-dialog');if(dialog.open)dialog.close();}
$('food-photo-dialog').addEventListener('close',()=>{document.body.style.overflow=foodBodyOverflow;if(foodImageTrigger?.isConnected)foodImageTrigger.focus({preventScroll:true});});
$('food-photo-dialog').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeFoodPhoto();});
$('food-photo-close').addEventListener('click',closeFoodPhoto);
// Food entries follow each day’s flexible meal areas.
function addFoodDayLinks(){
 for(const day of [1,2,3,4]){
  const host=$('day-'+day);if(!host||host.querySelector('.food-day-link'))continue;
  const regions=day===1?['guiyang']:day===2?['anshun','huaxi']:day===3?['guiyang']:['huaxi'];
  const area=regions.map(id=>FOOD_REGIONS.find(r=>r.id===id));
  const aside=document.createElement('aside');aside.className='food-day-link';aside.innerHTML=`<span>这一站吃什么</span>${area.map(r=>`<button type="button" class="external-button" data-food-open="${r.id}">${r.name}美食 →</button>`).join('')}`;
  host.querySelector('.day-footer')?.before(aside);
 }
}
addFoodDayLinks();
new MutationObserver(addFoodDayLinks).observe($('days'),{childList:true});
