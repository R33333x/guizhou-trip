// 视觉反馈只叠加在原有交互之上，动态重绘后仍由事件委托处理。
function initGlassEffects(){
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
 let pressed=null,hovered=null,frame=0,point=null;
 const rebounds=new Set();
 function spring(surface){
  if(reducedMotion.matches||!surface.isConnected||typeof surface.animate!=='function')return;
  surface.getAnimations().filter(animation=>animation.id==='glass-spring').forEach(animation=>animation.cancel());
  const animation=surface.animate([{scale:.97,offset:0},{scale:1.009,offset:.52},{scale:.999,offset:.78},{scale:1,offset:1}],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'});animation.id='glass-spring';rebounds.add(animation);
  animation.finished.then(()=>rebounds.delete(animation),()=>rebounds.delete(animation));
 }
 function release(rebound=false){if(pressed){const surface=pressed;pressed=null;surface.classList.remove('glass-pressed');if(rebound)spring(surface);}}
 function ripple(surface,x,y){
  if(reducedMotion.matches)return;
  const rect=surface.getBoundingClientRect();if(!rect.width||!rect.height)return;
  surface.querySelector(':scope > .glass-feedback')?.remove();
  const layer=document.createElement('span');layer.className='glass-feedback';layer.setAttribute('aria-hidden','true');
  const wave=document.createElement('i');wave.style.setProperty('--ripple-x',(x??rect.width/2)+'px');wave.style.setProperty('--ripple-y',(y??rect.height/2)+'px');wave.style.setProperty('--ripple-size',Math.hypot(rect.width,rect.height)*2+'px');
  layer.appendChild(wave);surface.appendChild(layer);wave.addEventListener('animationend',()=>layer.remove(),{once:true});setTimeout(()=>layer.remove(),800);
 }
 document.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0||!(event.target instanceof Element))return;
  release();const surface=event.target.closest('button:not(:disabled),.card');if(!surface)return;
  if(!reducedMotion.matches&&surface.matches('button')){surface.getAnimations().filter(animation=>animation.id==='glass-spring').forEach(animation=>animation.cancel());pressed=surface;surface.classList.add('glass-pressed');}
  const rect=surface.getBoundingClientRect();ripple(surface,event.clientX-rect.left,event.clientY-rect.top);
 },{passive:true});
 window.addEventListener('pointerup',()=>release(true),{passive:true});window.addEventListener('pointercancel',()=>release(),{passive:true});window.addEventListener('blur',()=>release());
 document.addEventListener('click',event=>{if(event.detail!==0||!(event.target instanceof Element))return;const surface=event.target.closest('button:not(:disabled)');if(surface){ripple(surface);spring(surface);}});
 function clearHover(){if(!hovered)return;['--glass-x','--glass-y','--glass-angle','--glass-tilt-x','--glass-tilt-y'].forEach(key=>hovered.style.removeProperty(key));hovered=null;}
 document.addEventListener('pointermove',event=>{
  if(!finePointer.matches||reducedMotion.matches||event.pointerType!=='mouse')return;
  point={x:event.clientX,y:event.clientY,target:event.target};if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;const surface=point.target instanceof Element?point.target.closest('.nav button,.city-buttons button,.quick-tools button,.overview-day,.gallery-button,.card'):null;
   if(surface!==hovered){clearHover();hovered=surface;}if(!surface)return;
   const rect=surface.getBoundingClientRect(),x=point.x-rect.left,y=point.y-rect.top;
   surface.style.setProperty('--glass-x',Math.round(x)+'px');surface.style.setProperty('--glass-y',Math.round(y)+'px');surface.style.setProperty('--glass-angle',(Math.atan2(y-rect.height/2,x-rect.width/2)+Math.PI/2)+'rad');
   if(surface.matches('.overview-day,.gallery-button')){surface.style.setProperty('--glass-tilt-x',(-(y/rect.height-.5)*1.3).toFixed(2)+'deg');surface.style.setProperty('--glass-tilt-y',((x/rect.width-.5)*1.3).toFixed(2)+'deg');}
  });
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',clearHover,{passive:true});
 function stopEffects(){release();clearHover();if(frame){cancelAnimationFrame(frame);frame=0;}rebounds.forEach(animation=>animation.cancel());rebounds.clear();document.querySelectorAll('.glass-feedback').forEach(layer=>layer.remove());}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEffects();});reducedMotion.addEventListener('change',stopEffects);finePointer.addEventListener('change',clearHover);
}
initGlassEffects();
