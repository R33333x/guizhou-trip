function renderOverview(){
 const journey=currentJourney();
 document.querySelectorAll('#overview .quick-tools').forEach(el=>el.remove());
 const names={1:'抵达贵阳',2:'黄果树 · 铜鼓荡',3:'黔灵山',4:'青岩 · 返程'};
 $('overview-days').innerHTML=TRIP.days.map(d=>`<button type="button" class="overview-day" data-view="day-${d.day}" style="${styleDay(d.day)}" aria-label="查看 ${date(d.date)} ${d.theme}行程"><span class="overview-day-date"><strong>${date(d.date)}</strong><small>${weekday(d.date)}</small></span><span class="day-name">${names[d.day]}</span><span class="day-open" aria-hidden="true">↗</span></button>`).join('');
 const summary=journey?`<div class="card travel-summary">${journey.legs.map(l=>`<div><small>${l.direction} · ${date(l.date)} · ${l.code}</small><strong>${l.depart}<span>—</span>${l.arrive}</strong><p>${l.from} → ${l.to}</p></div>`).join('')}</div>`:`<div class="card origin-summary"><span>查看自己的往返交通</span><button type="button" class="text-button" data-change-origin>选择出发城市 ↗</button></div>`;
 $('overview-bottom').innerHTML=summary+`<button type="button" class="card overview-stay" data-view="stay" aria-label="查看禧竹山房住宿介绍">${icon('hotel')}<span><small>三晚同住 · 青岩古镇</small><strong>${esc(placeById('hotel').name)}</strong></span><span aria-hidden="true">↗</span></button>`;
}
