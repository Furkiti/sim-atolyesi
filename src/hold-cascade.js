import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS} from './sand.js';
export const HOLD_MAX_CAPACITY=112000;
export function holdLooseCount(settings={}){return Math.round(10500*(settings.holdDensity??settings.pourAmount??1));}
// Directed material choreography for the hold interaction. Each coating cell
// consumes an actual packet that travels from the top reservoir to that cell.
export class HoldCascade {
 constructor(sand,settings={}){
  this.rows=settings.holdRows===2?2:1;sand.reserve(Math.min(HOLD_MAX_CAPACITY,Math.max(sand.capacity,19200+holdLooseCount(settings))));this.sand=sand;this.depth=settings.heapDepth||1.25;this.elapsed=0;this.press=0;this.emitted=0;this.routes=[];this.byParticle=new Map();this.activeRoutes=[];this.retainedIndices=[];this.dustAssigned=0;this.dustChance=Math.min(.055,650/holdLooseCount(settings));
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]&&!sand.bound[k]){
   const x0=k%COLS*CELL,y0=Math.floor(k/COLS)*CELL;let pixel=null;
   for(let y=y0;y<y0+CELL&&!pixel;y++)for(let x=x0;x<x0+CELL;x++)if(sand.onGlue(x+.5,y+.5)){pixel={x:x+.5,y:y+.5};break;}
   if(pixel)this.routes.push({...pixel,target:true,row:this.rows===2&&pixel.y>104?(k*37%101)%2:0});
  }
  const available=sand.capacity-sand.count,loose=Math.min(holdLooseCount(settings),Math.max(0,available-this.routes.length));
  for(let j=0;j<loose&&this.routes.length<available;j++)this.routes.push({x:.5+(Math.floor(j/this.rows)+.5)/Math.ceil(loose/this.rows)*(W-1),target:false,row:j%this.rows});
  this.routes.sort((a,b)=>a.row-b.row||(a.row===1?b.x-a.x:a.x-b.x));this.routes.length=Math.min(available,this.routes.length);this.rowBoundary=this.routes.findIndex(r=>r.row===1);this.duration=this.rows===2?6:4;
 }
 pourState(progress){
  const p=Math.max(0,Math.min(1,progress));let desired=Math.floor(p*this.routes.length),flow=1;
  if(this.rows===2){
   if(p<.5)desired=Math.floor(p*2*this.rowBoundary);
   else if(p<.57){desired=this.rowBoundary;flow=0;}
   else desired=this.rowBoundary+Math.floor((p-.57)/.43*(this.routes.length-this.rowBoundary));
  }
  desired=Math.max(0,Math.min(this.routes.length,desired));
  const route=this.routes[Math.min(this.routes.length-1,desired)],row=this.rows===2&&p>=.5?1:0;
  return {desired,x:route?.x||300,y:22+72*(flow?row:((p-.5)/.07)),flow,spot:row};
 }
 sourcePose(progress){return this.pourState(progress);}
 pour(progress,height=139){
  const {desired}=this.pourState(progress),s=this.sand;
  while(this.emitted<desired){const route=this.routes[this.emitted++],i=s.count;if(!s.emit(route.x,22+72*route.row,1,{spread:0,height,fan:0}))break;
   const seed=s.seed[i];route.i=i;const top=72*route.row;route.startY=route.target?Math.max(top+.02,Math.min(route.y-.2,top+2+seed*27)):top+2+seed*28;
   // A small fine fraction stops independently along its real travel path.
   // Fresh random samples per pour replace the old fixed mound destinations.
   if(!route.target&&this.dustAssigned<750&&s.random()<this.dustChance){
    const yMin=top+48;route.rest={x:route.x,y:yMin+s.random()*(H-42-yMin),z:2+s.random()*.5};s.dust[i]=1;this.dustAssigned++;
   }
   route.delay=(seed*97%1)*1.1;route.speed=105+(seed*197%1)*43;route.distance=0;
   s.y[i]=route.startY;s.previousY[i]=route.startY;s.vx[i]=s.vy[i]=0;s.vz[i]=-85;this.byParticle.set(i,route);this.activeRoutes.push(route);
  }
 }
 step(dt,held=false,refresh=true){
  const s=this.sand;this.press+=(Number(held)-this.press)*(1-Math.exp(-dt*(held?8:11)));
  const previousTime=this.elapsed;if(held)this.elapsed+=dt;
  let active=0;for(let at=0;at<this.activeRoutes.length;at++){
   const route=this.activeRoutes[at],i=route.i;if(s.state[i]===BOUND||s.state[i]===LOST)continue;this.activeRoutes[active++]=route;
   if(s.state[i]===AIR){s.vz[i]-=1050*dt;s.z[i]+=s.vz[i]*dt;const floor=5+(s.seed[i]*127%1)*25*this.depth/1.25;if(s.z[i]<=floor){s.z[i]=floor;s.vz[i]=0;s.state[i]=FREE;}continue;}
   s.previousX[i]=s.x[i];s.previousY[i]=s.y[i];s.vx[i]=s.vy[i]=0;if(!held)continue;
   if(route.parked){s.z[i]+=(route.rest.z-s.z[i])*Math.min(1,dt*14);continue;}
   if(route.landing!==undefined){
    route.landing+=dt;const progress=Math.min(1,route.landing/.18),ease=progress*progress*(3-2*progress);
    s.z[i]=route.contactZ+(2.2-route.contactZ)*ease;s.roll[i]+=dt*2;
    if(progress===1){s.z[i]=2.2;s.bind(i,true);}continue;
   }
   const travel=route.speed*(Math.max(0,this.elapsed-route.delay)-Math.max(0,previousTime-route.delay));if(travel<=0)continue;
   const old=s.y[i],next=old+travel;route.distance+=travel;
   // A dense rolling front becomes a thinner trail. The motion is tied only to
   // held time: releasing cannot grow, paint or advance the stream.
   s.z[i]=2.2+(s.seed[i]*127%1)*(4+23*Math.exp(-route.distance/300))*this.depth/1.25;
   s.x[i]=route.x+(route.target?0:Math.sin(route.distance*.035+s.seed[i]*31)*2.2);
   s.x[i]=Math.max(.2,Math.min(W-.2,s.x[i]));s.y[i]=next;s.vy[i]=route.speed;s.roll[i]+=travel*.075;
   if(route.rest&&next>=route.rest.y){s.x[i]=route.rest.x;s.y[i]=route.rest.y;s.vy[i]=0;route.parked=true;this.retainedIndices.push(i);continue;}
   if(route.target&&old<=route.y&&next>=route.y){s.x[i]=route.x;s.y[i]=route.y;s.vy[i]=0;route.contactZ=s.z[i];s.z[i]=route.contactZ;route.landing=0;}
  }
  this.activeRoutes.length=active;
  // Reuse the existing density/height representation without advancing its
  // independent physics solver. Painting is exclusively the travelling packets.
  if(refresh)this.refresh();
 }
 refresh(){this.sand.step(0,{granular:true,refreshOnly:true});}
 get retainedCount(){let count=0;for(const i of this.retainedIndices)if(this.sand.state[i]===FREE)count++;return count;}
 get pose(){return {x:0,y:0,cup:this.press*.38,pitch:this.press*.34};}
 get front(){return Math.min(H,this.elapsed*125);}
}
