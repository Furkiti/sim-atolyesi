import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS} from './sand.js';
import {holdLayout} from './hold-layout.js';
import {residuePlan} from './cleanup.js';
export const HOLD_MAX_CAPACITY=112000;
export function holdLooseCount(settings={}){return Math.round(10500*(settings.holdDensity??settings.pourAmount??1));}
// Directed material choreography for the hold interaction. Each coating cell
// consumes an actual packet that travels from the top reservoir to that cell.
export class HoldCascade {
 constructor(sand,settings={}){
  const layout=holdLayout(sand.mask,settings);Object.assign(this,{placement:layout.placement,rows:layout.rows,bands:layout.bands});
  const plannedLoose=Math.round(holdLooseCount(settings)*layout.doseScale);
  sand.reserve(Math.min(HOLD_MAX_CAPACITY,Math.max(sand.capacity,19200+plannedLoose)));this.sand=sand;this.depth=settings.heapDepth||1.25;this.elapsed=0;this.press=0;this.emitted=0;this.routes=[];this.byParticle=new Map();this.activeRoutes=[];this.retainedIndices=[];this.dustAssigned=0;
  const counts=new Uint32Array(this.bands.length);
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]&&!sand.bound[k]){
   const x0=k%COLS*CELL,y0=Math.floor(k/COLS)*CELL;let pixel=null;
   for(let y=y0;y<y0+CELL&&!pixel;y++)for(let x=x0;x<x0+CELL;x++)if(sand.onGlue(x+.5,y+.5)){pixel={x:x+.5,y:y+.5};break;}
   if(pixel){let group=layout.labels?.[Math.floor(pixel.y)*W+Math.floor(pixel.x)]||0;if(group===255)group=0;
    const row=this.rows===2&&(this.placement==='local'||pixel.y>104)?(k*37%101)%2:0,band=Math.min(this.bands.length-1,group*this.rows+row);this.routes.push({...pixel,target:true,row,band});counts[band]++;
   }
  }
  const available=sand.capacity-sand.count,loose=Math.min(plannedLoose,Math.max(0,available-this.routes.length)),totalWidth=this.bands.reduce((sum,b)=>sum+b.x1-b.x0,0);let assigned=0;
  this.bands.forEach((b,band)=>{const n=band===this.bands.length-1?loose-assigned:Math.floor(loose*(b.x1-b.x0)/totalWidth);for(let j=0;j<n;j++)this.routes.push({x:b.x0+(j+.5)/Math.max(1,n)*(b.x1-b.x0),target:false,row:b.row,band});counts[band]+=n;assigned+=n;});
  this.residue=residuePlan(sand.random,loose);this.dustChance=this.residue.chance;
  this.routes.sort((a,b)=>a.band-b.band||(a.row===1?b.x-a.x:a.x-b.x));this.routes.length=Math.min(available,this.routes.length);this.rowBoundary=this.routes.findIndex(r=>r.row===1);
  let cursor=0,units=0;this.bands.forEach((b,i)=>{b.start=cursor;b.end=cursor+=counts[i];b.travel=i?.16:0;b.seconds=Math.max(.28,Math.min(2.9,(b.x1-b.x0)/205));b.clock=units;units+=b.travel+b.seconds;});
  this.units=units;this.duration=this.placement==='sheet'?(this.rows===2?6:4):Math.max(1.6,1+units);
 }
 pourState(progress){
  const p=Math.max(0,Math.min(1,progress));
  if(this.placement!=='sheet'){
   const t=p*this.units;let b=this.bands.at(-1);for(const candidate of this.bands)if(t<candidate.clock+candidate.travel+candidate.seconds){b=candidate;break;}
   const local=t-b.clock,index=this.bands.indexOf(b),previous=this.bands[Math.max(0,index-1)];
   if(local<b.travel){const u=local/b.travel,e=u*u*(3-2*u),fromX=this.routes[Math.max(0,previous.end-1)]?.x||previous.x1,toX=this.routes[b.start]?.x||b.x0;return{desired:b.start,x:fromX+(toX-fromX)*e,y:previous.y+(b.y-previous.y)*e,flow:0,spot:index};}
   const u=Math.max(0,Math.min(1,(local-b.travel)/b.seconds)),desired=Math.min(this.routes.length,Math.floor(b.start+(b.end-b.start)*u)),route=this.routes[Math.min(b.end-1,desired)];return {desired,x:route?.x||b.x0,y:b.y,flow:1,spot:index};
  }
  let desired=Math.floor(p*this.routes.length),flow=1;
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
  while(this.emitted<desired){const route=this.routes[this.emitted++],band=this.bands[route.band],i=s.count;if(!s.emit(route.x,band.y,1,{spread:0,height,fan:0}))break;
   const seed=s.seed[i];route.i=i;const top=Math.max(-1.8,band.y-22);route.startY=route.target?Math.max(top+.02,Math.min(route.y-.2,top+2+seed*27)):top+2+seed*28;
   // A small fine fraction stops independently along its real travel path.
   // Fresh random samples per pour replace the old fixed mound destinations.
   if(!route.target&&this.dustAssigned<this.residue.budget&&s.random()<this.dustChance*(.35+.95*Math.exp(-(((route.x-this.residue.centerX)/this.residue.spreadX)**2)))){
    const yMin=top+48,uniform=yMin+s.random()*(H-42-yMin),cluster=this.residue.centerY+(s.random()-.5)*this.residue.spreadY*2,y=Math.max(yMin,Math.min(H-42,(s.random()<.2?uniform:uniform*(1-this.residue.bias)+cluster*this.residue.bias)));route.rest={x:route.x,y,z:2+s.random()*.5};s.dust[i]=1;this.dustAssigned++;
   }
   route.delay=(seed*97%1)*1.1;route.speed=105+(seed*197%1)*43;route.distance=0;
   s.y[i]=route.startY;s.previousY[i]=route.startY;s.vx[i]=s.vy[i]=0;s.vz[i]=-85;this.byParticle.set(i,route);this.activeRoutes.push(route);
  }
 }
 requestFinish(){this.finishing=true;this.finishElapsed??=0;}
 step(dt,held=false,refresh=true){
  held=held||!!this.finishing;if(this.finishing)this.finishElapsed+=dt;
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
   const travel=route.speed*(Math.max(0,this.elapsed-route.delay)-Math.max(0,previousTime-route.delay));if(travel<=0&&!(this.finishing&&route.target))continue;
   const old=s.y[i],next=this.finishing&&route.target?old+(route.y-old)*Math.min(1,dt/Math.max(.001,.30-this.finishElapsed)):old+travel;route.distance+=travel;
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
