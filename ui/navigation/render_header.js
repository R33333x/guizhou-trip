function renderHeader(){
 $('trip-subtitle').textContent=`${date(TRIP.start)}—${date(TRIP.end)} · 4 天 3 晚 · ${TRIP.people} 人`;
 $('countdown-label').textContent=`距离 ${date(TRIP.start)} 旅行开始`;
 const symbols={overview:'🗺️',stay:'🏡',food:'🍜',flights:'✈️',packing:'🎒',weather:'🌤️'};
 const caption=(symbol,label)=>`<span class="nav-caption"><span class="nav-emoji" aria-hidden="true">${symbol}</span><span>${label}</span></span>`;
 const tab=(v)=>`<button type="button" role="tab" id="tab-${v.id}" data-view="${v.id}" aria-controls="${v.id}" aria-selected="${v.id==='overview'}" tabindex="${v.id==='overview'?0:-1}"${v.day?` style="${styleDay(v.day)}"`:''}>${caption(v.day?['🛬','🥾','🏞️','🧳'][v.day-1]:symbols[v.id],v.day?date(dayDate(v.day)):v.label)}${v.day?`<small>${weekday(dayDate(v.day))} · ${TRIP.days[v.day-1].short}</small>`:''}</button>`;
 $('day-nav').innerHTML=`<div class="nav-primary">${tab(VIEWS[0])}<button type="button" id="daily-menu" data-view="day-1" aria-controls="daily-buttons" aria-expanded="false">${caption('📅','行程')}</button>${tab(VIEWS.find(v=>v.id==='stay'))}</div><div class="nav-tools">${VIEWS.filter(v=>['food','flights','packing','weather'].includes(v.id)).map(v=>tab(v)).join('')}</div><div class="nav-days" id="daily-buttons" hidden>${VIEWS.filter(v=>v.day).map(tab).join('')}</div>`;
 $('updated').textContent='最后更新：'+TRIP.updated;
}
