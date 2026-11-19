import React, {useEffect, useLayoutEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import LiquidGlass from 'liquid-glass-react';
// Keep semantic content in the page. Upstream renders only an inert material
// behind navigation, reading panels and popup controls.
const selector='.card:not(.food-live-atlas),.alert,.map-fold,.route-panel,.event-card,.stay-intro,.food-detail-copy,.daily-kit,.overview-day,.city-buttons button,.gallery-button,.overview-stay,.external-button,.food-detail-actions a,.food-map-fit,.food-dialog-head,.food-dialog-footer,.lightbox-top,.lightbox-bottom';
const mounted=new Map(),materialLimit=28;
let scheduled=0,materialId=0;
const reducedTransparency=matchMedia('(prefers-reduced-transparency: reduce)');
function Material({host}){
 const [size,setSize]=useState(()=>({width:Math.max(1,host.offsetWidth),height:Math.max(1,host.offsetHeight)}));
 useEffect(()=>{
  const resize=new ResizeObserver(()=>setSize(previous=>{
   const width=Math.max(1,host.offsetWidth),height=Math.max(1,host.offsetHeight);
   return previous.width===width&&previous.height===height?previous:{width,height};
  }));
  resize.observe(host);return()=>resize.disconnect();
 },[host]);
 useLayoutEffect(()=>{
  const warp=host.querySelector('.glass__warp');if(!warp)return;
  const filter=warp.style.filter;
  // Safari retains a clear blur/rim fallback where SVG backdrop warp is absent.
  const safari=/Safari/.test(navigator.userAgent)&&!/Chrome|Chromium|Edg/.test(navigator.userAgent);
  warp.style.filter='none';
  const value=(safari?'':filter+' ')+'blur(3px) saturate(120%)';
  warp.style.backdropFilter=value;warp.style.webkitBackdropFilter=value;
 },[host,size.width,size.height]);
 return <LiquidGlass key={size.width+'x'+size.height} className="trip-liquid-material" cornerRadius={14} padding="0px" displacementScale={24} blurAmount={.07} saturation={125} aberrationIntensity={.35} elasticity={0} mode="standard" overLight={false} globalMousePos={{x:0,y:0}} mouseOffset={{x:0,y:0}} style={{position:'absolute',top:'50%',left:'50%',width:'100%',height:'100%'}}><span aria-hidden="true"/></LiquidGlass>;
}
function remove(host,entry){entry.root.unmount();entry.layer.remove();host.classList.remove('react-glass-card');mounted.delete(host);}
function refresh(){
 scheduled=0;
 const candidates=reducedTransparency.matches?[]:[...document.querySelectorAll(selector)].filter(host=>{
  if(!host.getClientRects().length||host.closest('[hidden],dialog:not([open])'))return false;
  const rect=host.getBoundingClientRect();
  return rect.width>0&&rect.height>0&&rect.bottom>=-180&&rect.top<=innerHeight+180&&rect.right>=0&&rect.left<=innerWidth;
 }).sort((a,b)=>{
  const popup=host=>Boolean(host.closest('dialog[open],.lightbox:not([hidden])'));
  if(popup(a)!==popup(b))return popup(a)?-1:1;
  const distance=host=>Math.abs(host.getBoundingClientRect().top+host.offsetHeight/2-innerHeight/2);
  return distance(a)-distance(b);
 }).slice(0,materialLimit);
 const active=new Set(candidates);
 for(const [host,entry] of mounted)if(!host.isConnected||!active.has(host))remove(host,entry);
 for(const host of candidates){
  if(mounted.has(host))continue;
  const layer=document.createElement('span');layer.className='react-glass-material';layer.setAttribute('aria-hidden','true');layer.setAttribute('inert','');host.prepend(layer);
  const root=createRoot(layer,{identifierPrefix:'trip-glass-'+(++materialId)+'-'});
  mounted.set(host,{root,layer});root.render(<Material host={host}/>);host.classList.add('react-glass-card');
 }
}
function requestRefresh(){if(!scheduled)scheduled=requestAnimationFrame(refresh);}
// Observe popup controls outside main as well. Ignore our own material subtree.
new MutationObserver(records=>{
 if(records.some(record=>{
  if(record.target instanceof Element&&record.target.closest('.react-glass-material'))return false;
  if(record.type==='attributes')return record.oldValue!==record.target.getAttribute(record.attributeName);
  return [...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&!node.matches('.react-glass-material,.glass-feedback'));
 }))requestRefresh();
}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['hidden','open']});
window.addEventListener('scroll',requestRefresh,{passive:true,capture:true});
window.addEventListener('resize',requestRefresh,{passive:true});
reducedTransparency.addEventListener('change',requestRefresh);requestRefresh();
