import {FREE,BOUND,LOST,H} from './sand.js';
import {drainPose,smooth} from './interaction.js';
export function residuePlan(random,loose){
 const amount=random(),budget=Math.round(Math.min(loose*.16,55+Math.pow(amount,1.45)*1445));
 return {budget,chance:Math.min(.2,budget/Math.max(1,loose)),centerX:50+random()*500,centerY:90+random()*580,spreadX:65+random()*210,spreadY:80+random()*230,bias:.2+random()*.75};
}
// The second pass moves existing loose packets only. Nothing is spawned or painted.
export class CleanupCycle {
 constructor(sand,candidates=[],random=sand.random){
  this.sand=sand;this.stage='fold';this.elapsed=0;this.pinned=new Uint8Array(sand.capacity);this.routes=[];this.random=random;
  const eligible=(candidates.length?candidates:Array.from({length:sand.count},(_,i)=>i)).filter(i=>sand.state[i]===FREE&&sand.cell(sand.x[i],sand.y[i])>=0);
  const limit=Math.min(24,Math.ceil(eligible.length*.04),6+Math.floor(random()*17)),fraction=eligible.length?limit/eligible.length:0;this.tapCount=1+Math.floor(random()*3);this.strength=.55+random()*.6;
  for(const i of eligible)if(this.routes.length<limit&&random()<fraction){this.pinned[i]=1;this.routes.push({i,x:sand.x[i],y:sand.y[i],delay:.05+random()*.42,duration:.5+random()*.65,endX:300+(random()-.5)*115,hop:4+random()*13,turn:(random()-.5)*.06,released:false});}
  this.heldCount=this.routes.length;this.tapDuration=this.heldCount?Math.max(1.1,this.tapCount*.48):0;this.releasedCount=0;
 }
 get done(){return this.stage==='done';}
 get tapping(){return this.stage==='tap'||this.stage==='settle';}
 transition(stage){this.stage=stage;this.elapsed=0;if(stage==='unfold')for(const route of this.routes)this.sand.finishDust[route.i]=1;}
 advance(dt,falling=0){
  this.elapsed+=dt;const s=this.sand;
  if(this.stage==='fold'){
   let moving=false;for(let i=0;i<s.count;i++)if(!this.pinned[i]&&s.state[i]!==BOUND&&s.state[i]!==LOST){moving=true;break;}
   if(this.elapsed>=3.9&&!moving&&falling===0)this.transition('unfold');
  }else if(this.stage==='unfold'&&this.elapsed>=.65)this.transition(this.heldCount?'tap':'done');
  else if(this.stage==='tap'){
   let left=false;
   for(const route of this.routes){const i=route.i;if(s.state[i]===LOST){this.pinned[i]=0;if(!route.released){route.released=true;this.releasedCount++;}continue;}
    const p=Math.min(1,Math.max(0,(this.elapsed-route.delay)/route.duration));if(p===0){left=true;continue;}
    const easing=p*p*(3-2*p),x=route.x+(route.endX-route.x)*easing,y=route.y+(H+8-route.y)*easing;
    s.previousX[i]=s.x[i];s.previousY[i]=s.y[i];s.vx[i]=(x-s.x[i])/dt;s.vy[i]=(y-s.y[i])/dt;s.x[i]=x;s.y[i]=y;s.z[i]=2.5+Math.max(0,Math.sin(p*Math.PI*3))*route.hop*(1-p);s.vz[i]=0;s.roll[i]+=dt*9;
    if(p===1){this.pinned[i]=0;if(!route.released){route.released=true;this.releasedCount++;}}else left=true;
   }
   if(!left&&this.elapsed>=this.tapDuration)this.transition('settle');
  }else if(this.stage==='settle'&&this.elapsed>=.4&&!s.hasLoose()&&falling===0)this.transition('done');
 }
 get pose(){
  if(this.stage==='fold')return {...drainPose(Math.min(.78,this.elapsed/4.875)),lift:0,roll:0};
  if(this.stage==='unfold'){const pose=drainPose(.78+.22*smooth(this.elapsed/.65));return {...pose,lift:this.heldCount?(1-pose.bend)*110:0,roll:0};}
  if(this.tapping){
   const t=this.elapsed,window=this.stage==='tap'?1:Math.max(0,1-t/.22),pulse=Math.max(0,Math.sin(t*Math.PI/ .24));
   return {bend:.07*window,pitch:.17*window,lift:(this.stage==='tap'?110:110*(1-smooth(t/.35)))+(3+pulse*15)*window*this.strength,roll:Math.sin(t*25)*.012*window*this.strength};
  }
  return {bend:0,pitch:0,lift:0,roll:0};
 }
}
