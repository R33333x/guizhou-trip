// Route maps have their own zoomable viewer; lodging and food viewers keep
// their existing image lists and navigation.
function initRouteImages(){
 if(document.getElementById('route-image-dialog'))return;
 const dialog=document.createElement('dialog');dialog.id='route-image-dialog';dialog.className='route-image-dialog';dialog.setAttribute('aria-labelledby','route-image-title');
 dialog.innerHTML=`<div class="route-image-head"><h3 id="route-image-title"></h3><button type="button" class="external-button" data-route-close aria-label="关闭路线图">关闭 ×</button></div><div class="route-image-scroll" tabindex="0" role="region" aria-label="路线图，可滚动查看"><div class="route-image-canvas"><img id="route-image-full" alt=""></div></div><div class="route-image-tools"><button type="button" class="external-button" data-route-zoom="out" aria-label="缩小路线图">−</button><button type="button" class="external-button" data-route-zoom="reset" aria-label="适合屏幕">适合屏幕</button><button type="button" class="external-button" data-route-zoom="in" aria-label="放大路线图">＋</button><span class="route-image-scale" role="status" aria-live="polite">100%</span><a class="external-button" id="route-image-original" target="_blank" rel="noopener">打开原图 ↗</a></div>`;
 document.body.append(dialog);
 const image=dialog.querySelector('#route-image-full'),canvas=dialog.querySelector('.route-image-canvas'),scroller=dialog.querySelector('.route-image-scroll');
 let zoom=1,trigger=null,currentMap=null,previousOverflow='';
 function updateFullImage(map){
  const source=routeImageSource(map);if(image.getAttribute('src')!==source)image.src=source;
  dialog.querySelector('#route-image-original').href=source;
 }
 function syncRouteImages(){
  document.querySelectorAll('[data-route-image] img').forEach(thumbnail=>{
   const map=EVENTS.map(e=>e.routeMap).find(m=>m?.id===thumbnail.closest('[data-route-image]').dataset.routeImage);
   const source=routeImageSource(map);if(source&&thumbnail.getAttribute('src')!==source)thumbnail.src=source;
  });
  if(dialog.open&&currentMap)updateFullImage(currentMap);
 }
 new MutationObserver(syncRouteImages).observe(document.documentElement,{attributes:true,attributeFilter:['data-palette']});
 syncRouteImages();
 function setZoom(value){
  const old=zoom;zoom=Math.max(1,Math.min(4,value));
  const centerX=(scroller.scrollLeft+scroller.clientWidth/2)/old,centerY=(scroller.scrollTop+scroller.clientHeight/2)/old;
  canvas.style.width=(100*zoom)+'%';
  dialog.querySelector('.route-image-scale').textContent=Math.round(zoom*100)+'%';
  dialog.querySelector('[data-route-zoom="out"]').disabled=zoom===1;dialog.querySelector('[data-route-zoom="in"]').disabled=zoom===4;
  requestAnimationFrame(()=>{scroller.scrollLeft=zoom===1?0:centerX*zoom-scroller.clientWidth/2;scroller.scrollTop=zoom===1?0:centerY*zoom-scroller.clientHeight/2;});
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-route-image]');if(!button)return;
  const map=EVENTS.map(e=>e.routeMap).find(m=>m?.id===button.dataset.routeImage&&routeImageSource(m));if(!map)return;
  trigger=button;currentMap=map;previousOverflow=document.body.style.overflow;
  updateFullImage(map);image.alt=map.title;image.width=map.width||1440;image.height=map.height||2180;
  dialog.querySelector('#route-image-title').textContent=map.title;
  dialog.showModal();document.body.style.overflow='hidden';zoom=1;setZoom(1);scroller.scrollTop=scroller.scrollLeft=0;dialog.querySelector('[data-route-close]').focus({preventScroll:true});
 });
 dialog.addEventListener('click',event=>{
  if(event.target.closest('[data-route-close]')){dialog.close();return;}
  const control=event.target.closest('[data-route-zoom]');if(control){setZoom(control.dataset.routeZoom==='reset'?1:zoom+(control.dataset.routeZoom==='in'?.5:-.5));return;}
  if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}
 });
 dialog.addEventListener('close',()=>{currentMap=null;document.body.style.overflow=previousOverflow;if(trigger?.isConnected)trigger.focus({preventScroll:true});});
}
initRouteImages();
