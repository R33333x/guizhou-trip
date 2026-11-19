function renderDays(){
 const journey=currentJourney();
 $('days').innerHTML=TRIP.days.map(d=>{
  let body='';
  if(d.day===1){
   body=journey?personalTravelUI(journey,0):originPendingUI();
   body+=`<section class="team-schedule" aria-label="首日弹性安排"><div class="journey-section-heading"><h3>抵达后的自由安排</h3><span class="day-common-label">各自到达 · 灵活安排</span></div><p>按各自到达时间安排吃饭、逛街或回民宿。</p>${transferUI(journey,0)}<div class="timeline">${EVENTS.filter(e=>e.day===1).map(eventUI).join('')}</div></section>`;
  }else if(d.day===2){
   body=`<aside class="alert"><strong>大巴往返</strong>先黄果树，后铜鼓荡；安顺吃完晚饭，一起回民宿。</aside><div class="timeline">${EVENTS.filter(e=>e.day===2).map(eventUI).join('')}</div>`;
  }else if(d.day===4){
   const common=EVENTS.filter(e=>e.day===4&&['d4-morning','d4-checkout','d4-lunch'].includes(e.id));
   body=`<div class="journey-section-heading"><h3>把上午留给自己</h3><span class="day-common-label">睡懒觉 / 青岩慢逛</span></div><div class="timeline">${common.map(eventUI).join('')}</div><section class="team-schedule" aria-label="我的返程安排"><div class="journey-section-heading"><h3>各自从容返程</h3><span class="day-common-label">按出发城市查看</span></div>${journey?transferUI(journey,1)+personalTravelUI(journey,1):originPendingUI()}</section>`;
  }else{
   body=`<div class="timeline">${EVENTS.filter(e=>e.day===d.day).map(eventUI).join('')}</div><aside class="alert"><strong>凭证件入园</strong>${INFO.tickets}</aside>`;
  }
  const route=d.day===4?(journey?`青岩 → ${journey.mode==='高铁'?'车站':'机场'} → ${journey.city}`:'青岩 → 机场 / 车站'):d.map;
  return `<section class="view day" role="tabpanel" aria-labelledby="tab-day-${d.day}" tabindex="0" hidden id="day-${d.day}" style="${styleDay(d.day)}"><div class="day-heading"><span class="day-index">D${d.day}</span><div><h2 id="day-heading-${d.day}">${date(d.date)} ${weekday(d.date)}</h2><p>${route}</p></div><span class="day-title">${d.theme}</span></div>${dailyKitUI(d.day)}${body}<div class="day-footer"><button type="button" data-view="${d.day===1?'overview':'day-'+(d.day-1)}">← ${d.day===1?'总览':date(dayDate(d.day-1))}</button><button type="button" data-view="${d.day===4?'stay':'day-'+(d.day+1)}">${d.day===4?'看看民宿':date(dayDate(d.day+1))} →</button></div></section>`;
 }).join('');
}
