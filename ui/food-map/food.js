/* Source records are inserted by build_food.py. User text is always escaped. */
const FOOD_REGIONS=[
 {id:'guiyang',name:'贵阳市内',days:'11/27 抵达日 · 11/29 黔灵山那天',short:'抵达日 / 黔灵山',city:'贵阳市',note:'进城后，可以按想吃的店分头逛吃。清单集中在云岩、南明一带；六厂门糯米饭标注只有早上才有，留意到店时间。'},
 {id:'anshun',name:'安顺',days:'11/28 铜鼓荡 · 11/29 黄果树',short:'铜鼓荡 / 黄果树',city:'安顺市',note:'清单中的店主要在安顺市区，徒步或游览结束后可结合返程路线安排。黄果树、铜鼓荡与市区之间需要转场，先核对用车与集合时间，再决定去哪家。'},
 {id:'huaxi',name:'民宿周边',days:'花溪片区 · 从禧竹山房出发',short:'花溪 / 民宿一带',city:'贵阳市花溪区',note:'民宿在青岩古镇西门。这三家是花溪区的备选，未必能从民宿步行到达；先点地图核对距离与营业情况，再决定打车、结伴或打包。'}
];
let foodRegion='guiyang',foodMeal='all',foodQuery='',foodReady=false,foodImageTrigger=null,foodBodyOverflow='';
function foodMapUrl(shop){
 const area=FOOD_REGIONS.find(r=>r.id===shop.region);
 const query=[shop.name,shop.address||area.city].join(' ');
 return 'https://uri.amap.com/search?keyword='+encodeURIComponent(query)+'&city='+encodeURIComponent(area.city)+'&view=map&src=guizhou-trip';
}
function foodVisibleShops(){const query=foodQuery.trim().toLocaleLowerCase();return FOOD_SHOPS.filter(s=>s.region===foodRegion&&(foodMeal==='all'||s.meal===foodMeal)&&(!query||[s.name,s.meal,s.category,s.features,s.address,s.note].join(' ').toLocaleLowerCase().includes(query)));}
function foodShopUI(shop){
 const photo=shop.image?`<button type="button" class="food-photo" data-food-photo="${shop.id}" aria-label="放大${esc(shop.name)}的图片"><img src="${shop.thumbnail}" alt="${esc(shop.name)} · ${esc(shop.category||shop.meal)}" loading="lazy" decoding="async" width="${shop.imageWidth}" height="${shop.imageHeight}"><span class="food-photo-hint">点击放大</span></button>`:`<div class="food-no-photo"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 30h48c-2 15-11 22-24 22S10 45 8 30ZM20 11v11m12-14v14m12-11v11M19 57h26"/></svg><span>先记在想吃清单里</span></div>`;
 const detail=(title,value,cls='')=>value?`<div class="${cls}"><dt>${title}</dt><dd>${esc(value)}</dd></div>`:'';
 return `<article class="card food-shop" id="${shop.id}" data-food-id="${shop.id}">${photo}<div class="food-shop-body"><div class="food-shop-tags"><span class="food-meal-tag">${esc(shop.meal)}</span>${shop.category?`<span>${esc(shop.category)}</span>`:''}</div><h4>${esc(shop.name)}</h4><dl>${detail('想吃的理由',shop.features)}${detail('记得留意',shop.note,'food-note')}${detail('店铺地址',shop.address,'food-address')}</dl>${shop.address?'':'<p class="food-address-missing">地址待补充，可先按店名找店。</p>'}<div class="food-shop-actions"><a href="${foodMapUrl(shop)}" target="_blank" rel="noopener noreferrer" aria-label="在高德地图搜索${esc(shop.name)}">地图找店 ↗</a><button type="button" data-copy="${esc(shop.address||shop.name)}">${shop.address?'复制地址':'复制店名'}</button><button type="button" data-food-share="${shop.id}">分享这家</button></div></div></article>`;
}
function renderFoodResults(){
 if(!foodReady)return;
 const region=FOOD_REGIONS.find(r=>r.id===foodRegion),shops=foodVisibleShops(),total=FOOD_SHOPS.filter(s=>s.region===foodRegion).length;
 $('food-region-title').textContent=region.name+'的想吃清单';$('food-region-days').textContent=region.days;$('food-region-note').textContent=region.note;
 document.querySelectorAll('[data-food-region]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.foodRegion===foodRegion)));
 document.querySelectorAll('[data-food-meal]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.foodMeal===foodMeal)));
 $('food-grid').innerHTML=shops.map(foodShopUI).join('');$('food-empty').hidden=shops.length!==0;
 $('food-result-count').textContent=`${region.name} · 显示 ${shops.length} / ${total} 家`;
}
function initFood(){
 if(foodReady)return;foodReady=true;
 $('food-regions').innerHTML=FOOD_REGIONS.map(r=>`<button type="button" data-food-region="${r.id}" aria-pressed="${r.id===foodRegion}">${r.name}<small>${r.short} · ${FOOD_SHOPS.filter(s=>s.region===r.id).length} 家</small></button>`).join('');
 renderFoodResults();
}
function setFoodRegion(id){if(!FOOD_REGIONS.some(r=>r.id===id))return;initFood();foodRegion=id;foodMeal='all';foodQuery='';$('food-search').value='';renderFoodResults();}
function openFoodGuide(region){showView('food',{scroll:true});if(region)setFoodRegion(region);}
function resetFoodFilters(){foodMeal='all';foodQuery='';$('food-search').value='';renderFoodResults();$('food-search').focus({preventScroll:true});}
function foodShareText(shop){return [shop.name,shop.category,shop.features,shop.note,shop.address,'地图找店：'+foodMapUrl(shop)].filter(Boolean).join('\n');}
async function shareFood(shop,button){const text=foodShareText(shop);if(typeof navigator.share==='function'){try{await navigator.share({title:shop.name,text});return;}catch(error){if(error.name==='AbortError')return;}}await copy(text,button);}
function openFoodPhoto(shop,trigger){
 const dialog=$('food-photo-dialog');foodImageTrigger=trigger;foodBodyOverflow=document.body.style.overflow;
 $('food-photo-title').textContent=shop.name;$('food-photo-subtitle').textContent='图片来自美食清单 · 长图可上下滚动查看';
 const img=$('food-photo-full');img.src=shop.image;img.alt=shop.name+'，美食清单配图';img.width=shop.imageWidth;img.height=shop.imageHeight;
 $('food-photo-source').href=shop.image;
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';$('food-photo-close').focus({preventScroll:true});
}
function closeFoodPhoto(){const dialog=$('food-photo-dialog');if(dialog.open)dialog.close();}
$('food-photo-dialog').addEventListener('close',()=>{document.body.style.overflow=foodBodyOverflow;if(foodImageTrigger?.isConnected)foodImageTrigger.focus({preventScroll:true});});
$('food-photo-dialog').addEventListener('click',event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeFoodPhoto();});
$('food-photo-close').addEventListener('click',closeFoodPhoto);
$('food-search').addEventListener('input',event=>{foodQuery=event.target.value;renderFoodResults();});
$('food-reset').addEventListener('click',resetFoodFilters);$('food-clear-search').addEventListener('click',resetFoodFilters);
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return;
 const area=event.target.closest('[data-food-region]');if(area){setFoodRegion(area.dataset.foodRegion);return;}
 const meal=event.target.closest('[data-food-meal]');if(meal){foodMeal=meal.dataset.foodMeal;renderFoodResults();return;}
 const view=event.target.closest('[data-food-open]');if(view){openFoodGuide(view.dataset.foodOpen);return;}
 const photo=event.target.closest('[data-food-photo]');if(photo){const shop=FOOD_SHOPS.find(s=>s.id===photo.dataset.foodPhoto);if(shop?.image)openFoodPhoto(shop,photo);return;}
 const share=event.target.closest('[data-food-share]');if(share){const shop=FOOD_SHOPS.find(s=>s.id===share.dataset.foodShare);if(shop)shareFood(shop,share);}
});
document.addEventListener('keydown',event=>{const map=event.target instanceof Element&&event.target.closest('.food-map-region');if(map&&['Enter',' '].includes(event.key)){event.preventDefault();setFoodRegion(map.dataset.foodRegion);}});
// Route hints add a food entry without changing the timed itinerary.
function addFoodDayLinks(){
 for(const day of [1,2,3,4]){
  const host=$('day-'+day);if(!host||host.querySelector('.food-day-link'))continue;
  const regions=day===1?['guiyang']:day===2?['anshun']:day===3?['anshun','guiyang']:['huaxi'];
  const area=regions.map(id=>FOOD_REGIONS.find(r=>r.id===id));
  const aside=document.createElement('aside');aside.className='food-day-link';aside.innerHTML=`<span>这一站吃什么</span>${area.map(r=>`<button type="button" class="external-button" data-food-open="${r.id}">${r.name}美食 →</button>`).join('')}`;
  host.querySelector('.day-footer')?.before(aside);
 }
}
addFoodDayLinks();
new MutationObserver(addFoodDayLinks).observe($('days'),{childList:true});
