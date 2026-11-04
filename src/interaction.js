export class PointerGate {
 constructor(){this.active=null;}
 begin(id,isPrimary=true){if(!isPrimary||this.active!==null)return false;this.active=id;return true;}
 owns(id){return this.active===id;}
 end(id){if(!this.owns(id))return false;this.active=null;return true;}
 cancel(){this.active=null;}
}
export const smooth=p=>{p=Math.max(0,Math.min(1,p));return p*p*(3-2*p)};
export function rollFront(progress,height=800){return smooth(progress)*(height+120)}
export function rolledPoint(x,y,progress){
 const front=rollFront(progress),d=Math.max(0,front-y);
 if(d===0)return{x,y:400-y,z:4.1};
 const radius=24+Math.floor(d/(Math.PI*48))*.55,angle=d/radius;
 return{x,y:400-front+radius*Math.sin(angle),z:4.1+radius*(1-Math.cos(angle))+Math.max(0,progress-.83)*120};
}
// A single smooth bend, rather than an oscillating shake. All layers share it.
export function bendAmount(progress){return progress<=0||progress>=1?0:Math.sin(Math.PI*progress)**.8;}
export function bentPoint(x,y,z,amount){
 if(y<-400)return{x,y,z};
 const along=(y+400)/800,angle=along*1.05*amount,r=800/Math.max(.0001,1.05*amount);
 return {x,y:amount>0?-400+Math.sin(angle)*r:y,z:z+(amount>0?(1-Math.cos(angle))*r:0)};
}
// One phase owns its timers. Repeated taps cannot enqueue duplicate pours or shakes.
export class Flow {
 constructor(){this.reset()}
 reset(){this.phase='peel';this.elapsed=0;this.advance=false;this.pendingNext=false;this.serial=0;}
 get busy(){return ['rolling','pour','shake'].includes(this.phase)}
 roll(){if(this.phase!=='peel')return false;this.phase='rolling';this.elapsed=0;this.serial++;return true;}
 pour(){if(!['brush','peel'].includes(this.phase))return false;this.phase='pour';this.elapsed=0;this.serial++;return true;}
 shake(advance=false){if(this.phase!=='brush')return false;this.phase='shake';this.elapsed=0;this.advance=advance;this.serial++;return true;}
 tick(dt){
  if(!this.busy)return null;this.elapsed+=dt;
  if(this.phase==='rolling'&&this.elapsed>=.95){this.phase='pour';this.elapsed=0;return'rolled';}
  if(this.phase==='pour'&&this.elapsed>=1.65){this.phase='brush';this.elapsed=0;return'poured';}
  if(this.phase==='shake'&&this.elapsed>=1.8){this.phase='brush';this.elapsed=0;const next=this.advance;this.advance=false;return next?'advance':'shaken';}
  return null;
 }
 get progress(){return Math.max(0,Math.min(1,this.elapsed/(this.phase==='rolling'?.95:this.phase==='shake'?1.8:1.65)))}
}
export class FramePacer {
 constructor(limit=60){this.limit=limit;this.deadline=null;}
 setLimit(limit){if(limit!==this.limit){this.limit=limit;this.deadline=null;}}
 shouldRender(time){
  const interval=1000/this.limit;
  if(this.deadline===null)this.deadline=time;
  if(time+.6<this.deadline)return false;
  if(time-this.deadline>interval*2)this.deadline=time;
  this.deadline+=interval;return true;
 }
}
