import {SPRAY_COLUMNS,SPRAY_SLOTS} from './spray.js';

const bottleArt=`<span class="spray-bottle" aria-hidden="true">
 <svg viewBox="0 0 62 77"><path class="spray-glass" d="M22 7c0-4 18-4 18 0v15c11 5 15 12 15 22v10c0 14-7 20-24 20S7 68 7 54V44c0-10 4-17 15-22Z"/>
 <path class="spray-neck" d="M21 6q10-4 20 0v6q-10 3-20 0Z"/>
 <path fill="#fff" opacity=".24" d="M15 39q3-11 10-13l3 2q-9 5-9 14Z"/>
 <path fill="#140c31" opacity=".18" d="M8 56q20 20 46 1-2 16-23 16Q12 73 8 56Z"/>
 <path fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" opacity=".34" d="M40 65q5-2 7-6"/>
 </svg><b class="spray-count"></b></span>`;

export class SprayRackView {
 constructor(panel,{load,unload,openUnlock}){
  this.panel=panel;this.feedback=panel.querySelector('#spray-feedback');
  this.balance=panel.querySelector('#spray-balance');this.recover=panel.querySelector('#spray-unstick');
  this.recover.onclick=openUnlock;
  this.slots=Array.from({length:SPRAY_SLOTS},(_,slot)=>{
   const button=this.button('spray-pocket');
   button.onclick=()=>button.dataset.locked==='true'?openUnlock():unload(slot);
   return button;
  });
  this.trays=Array.from({length:SPRAY_COLUMNS},(_,column)=>{
   const tray=document.createElement('div');
   tray.className='spray-column';
   for(let row=0;row<3;row++){
    const button=this.button('spray-tray-bottle');
    button.onclick=()=>load(column);
    tray.append(button);
   }
   return tray;
  });
  panel.querySelector('#spray-slots').replaceChildren(...this.slots);
  panel.querySelector('#spray-trays').replaceChildren(...this.trays);
 }
 button(className){
  const button=document.createElement('button');
  button.type='button';button.className=className;button.innerHTML=bottleArt;
  button.insertAdjacentHTML('beforeend','<span class="spray-badge" aria-hidden="true"></span>');
  return button;
 }
 showBottle(button,bottle,stages){
  button.dataset.occupied=String(!!bottle);
  if(bottle){
   button.style.setProperty('--pigment',stages[bottle.color].color);
   button.querySelector('.spray-count').textContent=bottle.remaining;
  }
 }
 render(board,stages,visible,wallet){
  this.panel.hidden=!visible;
  if(!visible||!board)return;
  const key=[board.revision,board.band,board.flights.length,wallet.coins].join(':');
  if(this.board===board&&key===this.key)return;
  this.board=board;this.key=key;
  const full=board.full,jammed=board.jammed,canUnlock=board.capacity<SPRAY_SLOTS;
  const ranked=board.recommendations(),lead=ranked[0];
  this.panel.dataset.jammed=String(jammed);
  this.recover.hidden=!jammed;this.balance.textContent=`${wallet.coins} ◈`;
  this.balance.setAttribute('aria-label',`${wallet.coins} atölye jetonu`);
  for(const [slot,button] of this.slots.entries()){
   const bottle=board.slots[slot],firing=bottle&&board.canFire(bottle);
   const locked=slot>=board.capacity,returnable=!!bottle?.remaining&&!bottle.air&&!firing;
   this.showBottle(button,bottle,stages);
   button.dataset.firing=String(!!firing);
   button.dataset.locked=String(locked);button.dataset.returnable=String(returnable);
   button.querySelector('.spray-badge').textContent=locked?'＋':returnable?'↶':bottle&&!firing?'…':'';
   button.disabled=locked?slot!==board.capacity:!returnable;
   button.setAttribute('aria-label',locked?`${slot+1}. yuvayı aç${slot!==board.capacity?', önce bir önceki yuvayı aç':''}`:bottle?`Yuva ${slot+1}, ${stages[bottle.color].name}, ${bottle.remaining} atış${returnable?', bekliyor, geri al':''}`:`Boş yuva ${slot+1}`);
  }
  this.trays.forEach((tray,column)=>{
   for(const [row,button] of [...tray.children].entries()){
    const bottle=board.trays[column][row];
    this.showBottle(button,bottle,stages);
    const rank=row===0?ranked.findIndex(item=>item.column===column):-1;
    const option=rank>=0?ranked[rank]:null;
    button.disabled=row!==0||!bottle;
    button.dataset.ready=String(!!option);button.dataset.lead=String(rank===0&&!full);
    const badge=button.querySelector('.spray-badge');badge.textContent=!bottle||row!==0?'':option?rank===0?'Şimdi':'Hazır':'Sonra';
    button.setAttribute('aria-label',bottle?`${stages[bottle.color].name}, ${bottle.remaining} atış${row===0?option?`, ${rank===0?'önerilen, ':''}${option.ready} atış hazır`:', sonraki sırayı bekler':''}`:'Boş şişe yeri');
   }
  });
  const message=jammed?'Yuvalar dolu · bir yer aç':full?'Yuvalar dolu · sim akıyor':lead?`Sıradaki · ${stages[lead.bottle.color].name}`:board.active?'Sim akıyor · sıradaki renk açılıyor':board.flights.length?'Son taneler yerleşiyor':board.complete?'Tablo tamamlandı':canUnlock?'Bekleyen şişeyi geri alabilirsin':'Şişe sırasını kontrol et';
  if(this.feedback.textContent!==message)this.feedback.textContent=message;
  this.lead=lead?.bottle.color??-1;
 }
 indicateFull(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  this.panel.querySelector('#spray-slots').animate([{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:150});
 }
 mouth(slot){
  const rect=this.slots[slot].getBoundingClientRect();
  return {clientX:rect.left+rect.width*.5,clientY:rect.top+rect.height*.04};
 }
 animateDock(column,slot,color,remaining){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const source=this.trays[column].firstElementChild.getBoundingClientRect(),target=this.slots[slot].getBoundingClientRect();
  const float=document.createElement('div');
  float.className='spray-docking';float.innerHTML=bottleArt;float.style.setProperty('--pigment',color);
  float.querySelector('.spray-count').textContent=remaining;
  Object.assign(float.style,{left:source.left+'px',top:source.top+'px',width:source.width+'px',height:source.height+'px'});
  document.body.append(float);
  const animation=float.animate([
   {transform:'translate(0,0) rotate(0) scale(1)',opacity:1},
   {transform:`translate(${(target.left-source.left)*.72}px,${target.top-source.top-18}px) rotate(-14deg) scale(.92)`,opacity:1,offset:.74},
   {transform:`translate(${target.left-source.left+(target.width-source.width)*.5}px,${target.top-source.top}px) rotate(0) scale(.87)`,opacity:0}
  ],{duration:235,easing:'cubic-bezier(.18,.75,.27,1)'});
  animation.finished.then(()=>float.remove(),()=>float.remove());
 }
}

export class SprayUnlockView {
 constructor(dialog,{unlock,release}){
  this.dialog=dialog;this.unlock=unlock;this.release=release;
  const $=id=>dialog.querySelector('#'+id);
  this.offer=$('spray-offer');this.demo=$('spray-ad');this.coin=$('spray-buy');this.ad=$('spray-watch');
  this.refund=$('spray-release');this.balance=$('spray-unlock-copy');this.title=$('spray-unlock-title');
  this.progress=$('spray-ad-progress');this.clock=$('spray-ad-clock');this.claim=$('spray-ad-claim');
  $('spray-unlock-close').onclick=()=>this.close();
  dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
  this.coin.onclick=()=>{if(this.unlock('coins',this.capacity))this.close();};
  this.ad.onclick=()=>this.playDemo();
  this.claim.onclick=()=>{if(!this.claim.disabled&&this.unlock('demo',this.capacity))this.close();};
  this.refund.onclick=()=>{if(this.release())this.close();};
 }
 get open(){return this.dialog.open;}
 show(board,wallet){
  if(this.open)return;
  this.capacity=board.capacity;
  this.offer.hidden=false;this.demo.hidden=true;
  this.coin.hidden=this.ad.hidden=!wallet.price;this.coin.disabled=wallet.coins<wallet.price;
  this.refund.hidden=!board.jammed;
  this.title.textContent=board.jammed?'Yuvalar doldu':`${board.capacity+1}. yuvayı aç`;
  this.balance.textContent=wallet.price?`${wallet.coins} jetonun var. Ek yuva bu cihazda açık kalır.`:'Bekleyen bir şişeyi kuyruğa geri koyup kaldığın yerden devam et.';
  this.coin.textContent=`${wallet.price} jetonla aç`;
  this.dialog.showModal();
 }
 playDemo(){
  this.offer.hidden=true;this.demo.hidden=false;this.claim.disabled=true;
  this.title.textContent='Deneme reklamı';
  const started=performance.now(),duration=3200;
  const tick=()=>{
   const remaining=Math.max(0,duration-(performance.now()-started));
   this.progress.value=duration-remaining;
   this.clock.textContent=remaining?`${Math.ceil(remaining/1000)} sn`:'Ödül hazır';
   if(!remaining){clearInterval(this.timer);this.claim.disabled=false;}
  };
  this.timer=setInterval(tick,120);tick();
 }
 close(){clearInterval(this.timer);this.dialog.close();}
}
