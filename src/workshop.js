export const HOLD_EXPERIMENTS=['classic','aim','point','pulse','slots'];
export const AMMO=12;

export class CartridgeRack {
  constructor(){this.slots=[null,null];this.selected=null;this.active=-1;}
  load(slot,color){
    if(slot<0||slot>=this.slots.length||!Number.isInteger(color))return false;
    if(slot===this.active||this.slots.includes(color))return false;
    this.slots[slot]=color;
    return true;
  }
  remove(slot){
    if(slot===this.active)return;
    this.slots[slot]=null;
  }
  begin(color){
    const slot=this.slots.indexOf(color);
    if(slot<0)return false;
    this.active=slot;
    return true;
  }
  finish(){
    if(this.active>=0)this.slots[this.active]=null;
    this.active=-1;
  }
}

export function cartridgeChoices(stages,index){
  const choices=[];
  for(let offset=0;offset<Math.min(3,stages.length);offset++){
    choices.push((index+offset)%stages.length);
  }
  return choices.sort((a,b)=>stages[a].color.localeCompare(stages[b].color));
}

export function rhythmCharge(charge,held,dt){
  return Math.max(0,Math.min(1,charge+dt*(held?-.9:2.5)));
}

export function aimSpeed(x,aim){
  return .52+1.25*Math.max(0,1-Math.abs(x-aim)/300);
}
