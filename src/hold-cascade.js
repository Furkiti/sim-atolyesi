import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS} from './sand.js';
// Directed material choreography for the hold interaction. Each coating cell
// consumes an actual packet that travels from the top reservoir to that cell.
export class HoldCascade {
 constructor(sand,settings={}){
  this.sand=sand;this.depth=settings.heapDepth||1.25;this.elapsed=0;this.press=0;this.emitted=0;this.routes=[];this.byParticle=new Map();
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]&&!sand.bound[k]){
   const x0=k%COLS*CELL,y0=Math.floor(k/COLS)*CELL;let pixel=null;
   for(let y=y0;y<y0+CELL&&!pixel;y++)for(let x=x0;x<x0+CELL;x++)if(sand.onGlue(x+.5,y+.5)){pixel={x:x+.5,y:y+.5};break;}
   if(pixel)this.routes.push({...pixel,target:true});
  }
  const loose=Math.min(18000,Math.round(10500*(settings.pourAmount||1))),available=sand.capacity-sand.count;
  for(let j=0;j<loose&&this.routes.length<available;j++)this.routes.push({x:.5+(j+.5)/loose*(W-1),target:false});
  this.routes.sort((a,b)=>a.x-b.x);this.routes.length=Math.min(available,this.routes.length);this.duration=4;
 }
 sourcePose(progress){const route=this.routes[Math.min(this.routes.length-1,Math.floor(Math.max(0,Math.min(1,progress))*this.routes.length))];return{x:route?.x||300,y:22,flow:1,spot:0};}
 pour(progress,height=139){
  const desired=Math.floor(Math.max(0,Math.min(1,progress))*this.routes.length),s=this.sand;
  while(this.emitted<desired){const route=this.routes[this.emitted++],i=s.count;if(!s.emit(route.x,22,1,{spread:0,height,fan:0}))break;
   const seed=s.seed[i];route.i=i;route.startY=route.target?Math.max(.02,Math.min(route.y-.2,2+seed*27)):2+seed*28;
   route.delay=(seed*97%1)*1.1;route.speed=105+(seed*197%1)*43;route.distance=0;
   s.y[i]=route.startY;s.previousY[i]=route.startY;s.vx[i]=s.vy[i]=0;s.vz[i]=-85;this.byParticle.set(i,route);
  }
 }
 step(dt,held=false){
  const s=this.sand;this.press+=(Number(held)-this.press)*(1-Math.exp(-dt*(held?8:11)));
  const previousTime=this.elapsed;if(held)this.elapsed+=dt;
  for(const route of this.byParticle.values()){
   const i=route.i;if(s.state[i]===BOUND||s.state[i]===LOST)continue;
   if(s.state[i]===AIR){s.vz[i]-=1050*dt;s.z[i]+=s.vz[i]*dt;const floor=5+(s.seed[i]*127%1)*25*this.depth/1.25;if(s.z[i]<=floor){s.z[i]=floor;s.vz[i]=0;s.state[i]=FREE;}continue;}
   s.previousX[i]=s.x[i];s.previousY[i]=s.y[i];s.vx[i]=s.vy[i]=0;if(!held)continue;
   const travel=route.speed*(Math.max(0,this.elapsed-route.delay)-Math.max(0,previousTime-route.delay));if(travel<=0)continue;
   const old=s.y[i],next=old+travel;route.distance+=travel;
   // A dense rolling front becomes a thinner trail. The motion is tied only to
   // held time: releasing cannot grow, paint or advance the stream.
   s.z[i]=2.2+(s.seed[i]*127%1)*(4+23*Math.exp(-route.distance/300))*this.depth/1.25;
   s.x[i]=route.x+(route.target?0:Math.sin(route.distance*.035+s.seed[i]*31)*2.2);
   s.x[i]=Math.max(.2,Math.min(W-.2,s.x[i]));s.y[i]=next;s.vy[i]=route.speed;s.roll[i]+=travel*.075;
   if(route.target&&old<=route.y&&next>=route.y){s.x[i]=route.x;s.y[i]=route.y;s.z[i]=2.2;if(s.bind(i,true))continue;s.y[i]=next;}
  }
  // Reuse the existing density/height representation without advancing its
  // independent physics solver. Painting is exclusively the travelling packets.
  s.step(0,{granular:true,refreshOnly:true});
 }
 get pose(){return {x:0,y:0,cup:this.press*.38,pitch:this.press*.34};}
 get front(){return Math.min(H,this.elapsed*125);}
}
