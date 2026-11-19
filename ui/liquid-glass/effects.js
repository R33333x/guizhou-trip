// Quiet feedback follows the site's existing interactions and focus behavior.
function initGlassEffects(){
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const animations=new Set();let pressed=null;
 const controls='button:not(:disabled),a[href],summary,[role="button"]';
 function animate(surface,frames,options,id){
  if(reducedMotion.matches||!surface.isConnected||typeof surface.animate!=='function')return null;
  surface.getAnimations().filter(animation=>animation.id===id).forEach(animation=>animation.cancel());
  const animation=surface.animate(frames,options);animation.id=id;animations.add(animation);
  animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));return animation;
 }
 function interactive(target){
  if(!(target instanceof Element)||target.closest('.leaflet-container,.react-glass-material'))return null;
  return target.closest(controls);
 }
 function release(immediate=false){
  if(!pressed)return;
  const {surface,animation}=pressed;pressed=null;
  const scale=getComputedStyle(surface).scale;
  animation?.cancel();
  if(!immediate)animate(surface,[{scale:scale==='none'?'1':scale},{scale:'1'}],{duration:160,easing:'cubic-bezier(.2,.7,.2,1)'},'trip-press');
 }
 document.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  release(true);const surface=interactive(event.target);if(!surface||reducedMotion.matches)return;
  const animation=animate(surface,[{scale:'1'},{scale:'.988'}],{duration:100,easing:'ease-out',fill:'forwards'},'trip-press');
  pressed={surface,animation};
 },{passive:true});
 window.addEventListener('pointerup',()=>release(),{passive:true});
 window.addEventListener('pointercancel',()=>release(true),{passive:true});
 window.addEventListener('blur',()=>release(true));
 document.addEventListener('click',event=>{
  if(event.detail!==0)return;const surface=interactive(event.target);if(!surface)return;
  animate(surface,[{scale:'.99'},{scale:'1'}],{duration:180,easing:'cubic-bezier(.2,.7,.2,1)'},'trip-press');
 });
 function arrive(surface,move=true){
  if(!surface||!surface.getClientRects().length)return;
  const from={opacity:.5},to={opacity:1};
  if(move){from.transform='translateY(3px)';to.transform='translateY(0)';}
  animate(surface,[from,to],{duration:move?200:220,easing:'cubic-bezier(.2,.7,.2,1)'},'trip-arrive');
 }
 // Views fade without moving their map. Compact, newly selected details may
 // rise by three pixels; no stagger, tilt, ripple or spring overshoot is used.
 new MutationObserver(records=>{
  const arrivals=new Map();
  for(const record of records){
   const target=record.target;if(!(target instanceof Element)||target.closest('.react-glass-material'))continue;
   if(record.type==='attributes'){
    if(record.attributeName==='hidden'&&record.oldValue!==null&&!target.hasAttribute('hidden')){
     if(target.matches('.view'))arrivals.set(target,false);
     else if(target.matches('.place-detail'))arrivals.set(target,true);
     else if(target.matches('.lightbox'))for(const shell of target.querySelectorAll('.lightbox-top,.lightbox-bottom'))arrivals.set(shell,true);
    }else if(record.attributeName==='open'&&record.oldValue===null&&target.matches('dialog[open]')){
     for(const shell of target.querySelectorAll('.food-dialog-head,.food-dialog-footer'))arrivals.set(shell,true);
    }
   }else if(target.id==='food-map-selected'&&[...record.addedNodes].some(node=>node instanceof Element&&node.matches('.food-detail-grid'))){
    arrivals.set(target.firstElementChild,true);
   }
  }
  for(const [surface,move] of arrivals)arrive(surface,move);
 }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['hidden','open']});
 function stopEffects(){release(true);animations.forEach(animation=>animation.cancel());animations.clear();}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopEffects();});
 reducedMotion.addEventListener('change',stopEffects);
}
initGlassEffects();
