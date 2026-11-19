// Restore the approved D day / B night arrangement. Old preview URLs resolve here.
document.documentElement.dataset.look='original';
const tripPreviewMode=new URLSearchParams(location.search).get('mode');
if(['light','dark'].includes(tripPreviewMode))setTheme(tripPreviewMode);
function syncTripPalette(){
 const preference=document.documentElement.dataset.theme;
 document.documentElement.dataset.palette=preference==='dark'||(preference!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
}
syncTripPalette();
new MutationObserver(syncTripPalette).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTripPalette);
