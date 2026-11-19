// Daily checks are independent from the trip-wide packing checklist.
let dailyKitMemory=null;
function readDailyKit(){
 if(dailyKitMemory!==null)return dailyKitMemory;
 try{const saved=JSON.parse(readStorage('guizhou-daily-kit-v1','{}'));dailyKitMemory=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};}catch{dailyKitMemory={};}
 return dailyKitMemory;
}
function dailyKitUI(day){
 const items=DAILY_KITS[day]||[],state=readDailyKit(),done=items.filter(item=>state[day+':'+item.id]===true).length;
 return `<section class="daily-kit" aria-labelledby="daily-kit-title-${day}" data-daily-kit="${day}"><div class="daily-kit-heading"><h3 id="daily-kit-title-${day}">今天随身带</h3><span class="daily-kit-progress" role="status" aria-live="polite">${done} / ${items.length}</span></div><div class="daily-kit-list">${items.map(item=>{const key=day+':'+item.id,checked=state[key]===true;return `<label class="daily-kit-item${checked?' is-checked':''}" for="daily-kit-${day}-${item.id}"><input type="checkbox" id="daily-kit-${day}-${item.id}" data-daily-check="${key}"${checked?' checked':''}><span>${esc(item.title)}${item.optional?'<small>可选</small>':''}</span></label>`;}).join('')}</div></section>`;
}
document.addEventListener('change',event=>{
 const input=event.target;if(!(input instanceof HTMLInputElement)||!input.matches('[data-daily-check]'))return;
 const host=input.closest('[data-daily-kit]');if(!host)return;
 const day=host.dataset.dailyKit,items=DAILY_KITS[day]||[],key=input.dataset.dailyCheck;
 if(!items.some(item=>day+':'+item.id===key))return;
 const state=readDailyKit();state[key]=input.checked;
 input.closest('label').classList.toggle('is-checked',input.checked);
 host.querySelector('.daily-kit-progress').textContent=items.filter(item=>state[day+':'+item.id]===true).length+' / '+items.length;
 if(!writeStorage('guizhou-daily-kit-v1',JSON.stringify(state)))toast('勾选仅本次打开有效');
});
