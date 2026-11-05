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
// First form a trough between both hands, then tip its central lip over the box.
export function drainPose(progress){
 const p=Math.max(0,Math.min(1,progress)),returning=1-smooth((p-.82)/.18);
 return {bend:smooth(p/.22)*returning,pitch:.58*smooth((p-.22)/.22)*returning};
}
export function bendAmount(progress){return drainPose(progress).bend}
export function bentPoint(x,y,z,amount,pitch=amount*.58){
 if(y<-400||(amount<=1e-6&&pitch<=1e-6))return{x,y,z};
 const curve=1.22*amount,theta=x/300*curve,r=curve>1e-6?300/curve:0;
 const crossX=curve>1e-6?Math.sin(theta)*r:x,crossZ=curve>1e-6?2*Math.sin(theta/2)**2*r:0,along=y+400;
 return{x:crossX,y:-400+along*Math.cos(pitch)-crossZ*Math.sin(pitch),z:z+110*amount+along*Math.sin(pitch)+crossZ*Math.cos(pitch)};
}
export function surfaceVelocity(x,vx,vy,amount,pitch=amount*.58){
 const theta=x/300*1.22*amount;
 return{x:vx*Math.cos(theta),y:-vy*Math.cos(pitch)-vx*Math.sin(theta)*Math.sin(pitch),z:-vy*Math.sin(pitch)+vx*Math.sin(theta)*Math.cos(pitch)};
}
// One phase owns its timers. Repeated taps cannot enqueue duplicate pours or shakes.
export class Flow {
 constructor(){this.reset()}
 reset(){this.phase='peel';this.elapsed=0;this.advance=false;this.pendingNext=false;this.serial=0;this.rollDuration=2.8;this.pourDuration=1.65;this.drainDoneAt=null;this.returnDuration=1;}
 setPourDuration(seconds){if(Number.isFinite(seconds)&&seconds>0)this.pourDuration=seconds;}
 setRollDuration(seconds){if(Number.isFinite(seconds)&&seconds>0)this.rollDuration=seconds;}
 get busy(){return ['rolling','pour','shake'].includes(this.phase)}
 roll(){if(this.phase!=='peel')return false;this.phase='rolling';this.elapsed=0;this.serial++;return true;}
 pour(){if(!['brush','peel'].includes(this.phase))return false;this.phase='pour';this.elapsed=0;this.serial++;return true;}
 shake(advance=false){if(this.phase!=='brush')return false;this.phase='shake';this.elapsed=0;this.advance=advance;this.drainDoneAt=null;this.serial++;return true;}
 tick(dt,{drainComplete=true,peelHeld=false}={}){
  if(!this.busy)return null;this.elapsed+=dt;
  if(this.phase==='rolling'&&this.elapsed>=this.rollDuration){this.phase='pour';this.elapsed=0;return'rolled';}
  if(this.phase==='pour'&&this.elapsed>=this.pourDuration){this.phase='brush';this.elapsed=0;return'poured';}
  if(this.phase==='shake'){
   if(this.elapsed>=3.9&&drainComplete&&this.drainDoneAt===null)this.drainDoneAt=Math.max(3.9,this.elapsed-dt);
   if(this.drainDoneAt!==null&&this.elapsed-this.drainDoneAt>=this.returnDuration){this.phase='brush';this.elapsed=0;const next=this.advance;this.advance=false;return next?'advance':'shaken';}
  }
  return null;
 }
 get progress(){
  if(this.phase==='shake')return this.drainDoneAt===null?Math.min(.8,this.elapsed/4.875):Math.min(1,.8+.2*(this.elapsed-this.drainDoneAt)/this.returnDuration);
  return Math.max(0,Math.min(1,this.elapsed/(this.phase==='rolling'?this.rollDuration:this.pourDuration)));
 }
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

// Coalesce a busy pointer stream without losing the beginning of the sweep.
export function appendStroke(queue,stroke,limit=18){
 queue.push(stroke);
 while(queue.length>limit){const first=queue.shift();queue[0].from=first.from;if(first.seconds!==undefined||queue[0].seconds!==undefined)queue[0].seconds=(first.seconds||0)+(queue[0].seconds||0);}
}
