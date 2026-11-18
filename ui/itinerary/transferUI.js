function transferUI(journey,index){
 if(!journey)return '';
 if(index===1&&journey.id==='shanghai')return `<div class="timeline">${[ev('d4-car'),ev('d4-airport')].map(eventUI).join('')}</div>`;
 const leg=journey.legs[index],rail=journey.mode==='高铁';
 if(index===1){
  const transfer={id:'d4-transfer-'+journey.id,day:4,timeLabel:'接送',title:`${journey.city}组 · 从民宿${rail?'送站':'送机'}`,place:'hotel',kind:'transport',note:`${leg.depart} 从${leg.from}${rail?'乘车':'起飞'}。按本组班次倒推民宿出发时间，给${rail?'进站安检':'值机、托运与安检'}留出余量；接送时间、上车点及是否与其他组同车在群里确认。`};
  return `<div class="timeline" data-transfer-pending>${eventUI(transfer)}</div>`;
 }
 return `<aside class="transfer-pending" data-transfer-pending><strong>抵达后安排 · ${journey.city}组</strong>${leg.arrive} 抵达${leg.to}后，按各自到达时间安排进城吃正餐；接人、集合位置和同行伙伴在群里确认。</aside>`;
}
