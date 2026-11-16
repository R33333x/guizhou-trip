import React, {useEffect, useLayoutEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import LiquidGlass from 'liquid-glass-react';
// The actual upstream component supplies separate warp, clean content and two rim layers.
// It is mounted as an aria-hidden material only; the site's semantic cards remain intact.
const selector='.card,.overview-day,.quick-tools button,.city-buttons button,.gallery-button,.route-panel';
const mounted=new Map();let scheduled=0,materialId=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)'),reducedTransparency=matchMedia('(prefers-reduced-transparency: reduce)');
function Material({host}){
 const [size,setSize]=useState(()=>({width:Math.max(1,host.offsetWidth),height:Math.max(1,host.offsetHeight)}));
 const [theme,setTheme]=useState(document.documentElement.dataset.theme);
 const [pointer,setPointer]=useState({x:0,y:0});
 useEffect(()=>{const resize=new ResizeObserver(()=>setSize({width:Math.max(1,host.offsetWidth),height:Math.max(1,host.offsetHeight)}));resize.observe(host);const themeObserver=new MutationObserver(()=>setTheme(document.documentElement.dataset.theme));themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});let frame=0;const move=event=>{if(reducedMotion.matches||event.pointerType!=='mouse')return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const rect=host.getBoundingClientRect();setPointer({x:(event.clientX-rect.left-rect.width/2)/rect.width*35,y:(event.clientY-rect.top-rect.height/2)/rect.height*35});});};const reset=()=>{cancelAnimationFrame(frame);setPointer({x:0,y:0});};host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',reset);reducedMotion.addEventListener('change',reset);return()=>{resize.disconnect();themeObserver.disconnect();cancelAnimationFrame(frame);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',reset);reducedMotion.removeEventListener('change',reset);};},[host]);
 useLayoutEffect(()=>{
  const warp=host.querySelector('.glass__warp');if(!warp)return;
  const filter=warp.style.filter;
  // Apply the upstream SVG to the backdrop itself: filtering a translucent paint
  // layer instead produces a grey SourceGraphic in Chromium. Safari uses the
  // component's blur/rim material because it does not support SVG backdrop warp.
  const safari=/Safari/.test(navigator.userAgent)&&!/Chrome|Chromium|Edg/.test(navigator.userAgent);
  warp.style.filter='none';
  const value=(safari?'':filter+' ')+'blur(3px) saturate(120%)';
  warp.style.backdropFilter=value;warp.style.webkitBackdropFilter=value;
 },[host,size.width,size.height]);
 return <LiquidGlass key={size.width+'x'+size.height} className="trip-liquid-material" cornerRadius={18} padding="0px" displacementScale={24} blurAmount={.07} saturation={125} aberrationIntensity={.35} elasticity={0} mode="standard" overLight={false} globalMousePos={{x:0,y:0}} mouseOffset={pointer} style={{position:'absolute',top:'50%',left:'50%',width:'100%',height:'100%'}}><span aria-hidden="true" data-material-theme={theme}/></LiquidGlass>;
}
function remove(host,entry){entry.root.unmount();entry.layer.remove();host.classList.remove('react-glass-card');mounted.delete(host);}
function refresh(){scheduled=0;for(const [host,entry] of mounted){if(!host.isConnected||!host.getClientRects().length||reducedTransparency.matches)remove(host,entry);}
 if(reducedTransparency.matches)return;
 document.querySelectorAll(selector).forEach(host=>{if(mounted.has(host)||!host.getClientRects().length||host.closest('.lightbox'))return;const layer=document.createElement('span');layer.className='react-glass-material';layer.setAttribute('aria-hidden','true');layer.setAttribute('inert','');host.prepend(layer);const root=createRoot(layer,{identifierPrefix:"trip-glass-"+(++materialId)+"-"});mounted.set(host,{root,layer});root.render(<Material host={host}/>);host.classList.add('react-glass-card');});
}
function requestRefresh(){if(!scheduled)scheduled=requestAnimationFrame(refresh);}
new MutationObserver(records=>{if(records.some(record=>{if(record.target instanceof Element&&record.target.closest('.react-glass-material'))return false;if(record.type==='attributes')return record.oldValue!==record.target.getAttribute(record.attributeName);return [...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&!node.matches('.react-glass-material,.glass-feedback'));}))requestRefresh();}).observe(document.querySelector('main'),{childList:true,subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['hidden']});
reducedTransparency.addEventListener('change',requestRefresh);requestRefresh();
