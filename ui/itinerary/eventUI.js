function eventUI(e){
 const stamp=e.time?`<time class="event-time" datetime="${e.time}">${time(e.time)}</time>`:`<span class="event-time event-phase">${esc(e.timeLabel)}</span>`;
 const foodNames={anshun:'安顺美食',guiyang:'贵阳市内美食',huaxi:'民宿周边美食'};
 const meals=e.foodRegions?.length?`<div class="event-actions" aria-label="选择用餐区域">${e.foodRegions.map(id=>`<button type="button" class="external-button" data-food-open="${id}">${foodNames[id]} →</button>`).join('')}</div>`:'';
 const map=e.routeMap;
 const routeMap=map?`<figure class="itinerary-route-map" data-route-map="${map.id}" aria-label="${esc(map.title)}">${map.src?`<img src="${esc(map.src)}" alt="${esc(map.title)}" loading="lazy" decoding="async"><figcaption>${esc(map.title)}</figcaption>`:`<div class="route-map-placeholder"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="8" width="36" height="32" rx="5"/><circle cx="16" cy="18" r="3"/><path d="m7 33 11-10 8 7 6-5 10 10"/></svg><strong>${esc(map.title)}</strong><span>路线图待补充</span></div>`}</figure>`:'';
 return `<article class="event" data-event="${e.id}" style="${styleDay(e.day)}">${stamp}<div class="event-card"><div class="event-heading">${icon(e.kind)}<h4>${esc(e.title)}</h4></div>${e.place?placeUI(e.place,{time:e.time,day:e.day,schedule:e.timeLabel,label:e.placeLabel}):''}${e.note?`<p class="event-note">${esc(e.note)}</p>`:''}${meals}${routeMap}</div></article>`;
}
