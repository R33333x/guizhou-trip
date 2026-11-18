function placeUI(id,context={}){
 const p=placeById(id),detailId='place-detail-'+(++detailCount);
 const times=context.time?[context.time]:EVENTS.filter(e=>e.place===id&&e.time&&(!context.day||e.day===context.day)).map(e=>e.time);
 const label=context.label||p.name,days=[...new Set(times.map(t=>date(t)))];
 const schedule=context.schedule||(times.length?days.map(d=>d+' '+[...new Set(times.filter(t=>date(t)===d).map(time))].join(' / ')).join('；'):'按当天实际安排');
 return `<div class="place"><button type="button" class="place-toggle" aria-expanded="false" aria-controls="${detailId}">${icon('pin')}<span>${esc(label)}</span>${icon('chevron','chevron')}</button><div class="place-detail" id="${detailId}" hidden>${addressRow(p)}<p>电话：${esc(p.phone||'见群公告')}</p><p>行程安排：${esc(schedule)}</p><p>${esc(p.tip)}</p></div></div>`;
}
