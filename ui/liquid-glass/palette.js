// Resolve the existing persisted preference without replacing its storage key.
function syncTripPalette(){
 const preference=document.documentElement.dataset.theme;
 document.documentElement.dataset.palette=preference==='dark'||(preference!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
}
syncTripPalette();
new MutationObserver(syncTripPalette).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTripPalette);
