import {SPRAY_COLUMNS,SPRAY_SLOTS} from './spray.js';

const bottleArt=`<span class="spray-bottle" aria-hidden="true">
 <svg viewBox="0 0 62 77"><path class="spray-glass" d="M22 7c0-4 18-4 18 0v15c11 5 15 12 15 22v10c0 14-7 20-24 20S7 68 7 54V44c0-10 4-17 15-22Z"/>
 <path class="spray-neck" d="M21 6q10-4 20 0v6q-10 3-20 0Z"/>
 <path fill="#fff" opacity=".24" d="M15 39q3-11 10-13l3 2q-9 5-9 14Z"/>
 <path fill="#140c31" opacity=".18" d="M8 56q20 20 46 1-2 16-23 16Q12 73 8 56Z"/>
 <path fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2" opacity=".34" d="M40 65q5-2 7-6"/>
 </svg><b class="spray-count"></b></span>`;

export class SprayRackView {
 constructor(panel,{load,unload}){
  this.panel=panel;this.feedback=panel.querySelector('#spray-feedback');
  this.slots=Array.from({length:SPRAY_SLOTS},(_,slot)=>{
   const button=this.button('spray-pocket');
   button.onclick=()=>unload(slot);
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
  return button;
 }
 showBottle(button,bottle,stages){
  button.dataset.occupied=String(!!bottle);
  if(bottle){
   button.style.setProperty('--pigment',stages[bottle.color].color);
   button.querySelector('.spray-count').textContent=bottle.remaining;
  }
 }
 render(board,stages,visible){
  this.panel.hidden=!visible;
  if(!visible||!board)return;
  const key=[board.revision,board.paintRevision,board.band].join(':');
  if(this.board===board&&key===this.key)return;
  this.board=board;this.key=key;
  for(const [slot,button] of this.slots.entries()){
   const bottle=board.slots[slot],firing=bottle&&board.canFire(bottle);
   this.showBottle(button,bottle,stages);
   button.dataset.firing=String(!!firing);
   button.disabled=!bottle?.remaining||!!bottle.air||!!firing;
   button.setAttribute('aria-label',bottle?`Yuva ${slot+1}, ${stages[bottle.color].name}, ${bottle.remaining} atış${button.disabled?'':', geri al'}`:`Boş yuva ${slot+1}`);
  }
  this.trays.forEach((tray,column)=>{
   for(const [row,button] of [...tray.children].entries()){
    const bottle=board.trays[column][row];
    this.showBottle(button,bottle,stages);
    button.disabled=row!==0||!bottle||!board.slots.includes(null);
    button.dataset.ready=String(!!bottle&&board.canFire(bottle));
    button.setAttribute('aria-label',bottle?`${stages[bottle.color].name}, ${bottle.remaining} atış`:'Boş şişe yeri');
   }
  });
  this.feedback.textContent=board.active?'Simler yüzeye oturuyor':board.flights.length?'Son taneler yerleşiyor':board.slots.some(Boolean)?'Bekleyen şişeye dokunup geri alabilirsin':'Alt sıraya ulaşan bir rengi seç';
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
