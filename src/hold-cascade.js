import {aimSpeed} from './workshop.js';
import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS} from './sand.js';
import {holdLayout,holdSourceBand} from './hold-layout.js';
import {residuePlan} from './cleanup.js';
export const HOLD_MAX_CAPACITY=112000;
export function holdLooseCount(settings={}){return Math.round(10500*(settings.holdDensity??settings.pourAmount??1));}
function reflectOnSheet(value,extent){
 const margin=6;
 if(value<margin)return 2*margin-value;
 if(value>extent-margin)return 2*(extent-margin)-value;
 return value;
}
// Directed material choreography for the hold interaction. Each coating cell
// consumes an actual packet that travels from the top reservoir to that cell.
export class HoldCascade {
 constructor(sand,settings={}){
  const layout=holdLayout(sand.mask,settings);Object.assign(this,{placement:layout.placement,rows:layout.rows,bands:layout.bands});
  const plannedLoose=Math.round(holdLooseCount(settings)*layout.doseScale);
  sand.reserve(Math.min(HOLD_MAX_CAPACITY,Math.max(sand.capacity,19200+plannedLoose)));this.sand=sand;this.depth=settings.heapDepth||1.25;this.elapsed=0;this.press=0;this.emitted=0;this.routes=[];this.activeRoutes=[];this.retainedIndices=[];this.dustAssigned=0;
  this.directional=this.placement==='point';this.exits=[];this.airborne=0;this.revision=0;this.surfaceRevision=-1;this.wasHeld=false;
  this.pointEpoch=0;this.runoffX=Infinity;this.runoffY=Infinity;
  const counts=new Uint32Array(this.bands.length);
  this.layerCapacity=Uint8Array.from(sand.target,pixels=>Math.min(24,Math.max(1,Math.ceil(pixels/(1.25*(settings.holdGrainSize||1)**2)))));this.pendingLayers=new Uint8Array(sand.target.length);this.pendingLayerCount=0;this.adheredLayers=0;
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]&&!sand.bound[k]){
   const x0=k%COLS*CELL,y0=Math.floor(k/COLS)*CELL;let pixel=null;
   for(let y=y0;y<y0+CELL&&!pixel;y++)for(let x=x0;x<x0+CELL;x++)if(sand.onGlue(x+.5,y+.5)){pixel={x:x+.5,y:y+.5};break;}
   if(pixel){
    const row=this.rows===2&&(['local','joined'].includes(this.placement)||pixel.y>104)?(k*37%101)%2:0,band=['local','joined'].includes(this.placement)?holdSourceBand(this.bands,pixel.x,pixel.y,row):Math.min(this.bands.length-1,row);this.routes.push({...pixel,target:true,row,band,cell:k});counts[band]++;
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
   const u=p===1?1:Math.max(0,Math.min(1,(local-b.travel)/b.seconds)),desired=Math.min(this.routes.length,Math.floor(b.start+(b.end-b.start)*u)),route=this.routes[Math.min(b.end-1,desired)];return {desired,x:route?.x||b.x0,y:b.y,flow:1,spot:index};
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
  if(this.emitted<desired)this.revision++;
  while(this.emitted<desired){const route=this.routes[this.emitted++],band=this.bands[route.band],i=s.count;if(!s.emit(route.x,band.y,1,{spread:0,height,fan:0}))break;
   const seed=s.seed[i];route.i=i;const top=Math.max(-1.8,band.y-22);route.startY=route.target?Math.max(top+.02,Math.min(route.y-.2,top+2+seed*27)):top+2+seed*28;
   if(this.directional){
    route.startY=band.y+(seed-.5)*25;
    route.offsetX=(seed*137%1-.5)*66;
    route.offsetY=(seed*173%1-.5)*54;
    route.runoffEpoch=-1;
    route.runoffDistance=44+(seed*199%1)*124;
    route.runoffSpread=(seed*149%1-.5)*150;
    route.runoffSpeed=.46+(seed*211%1)*.44;
   }
   // A small fine fraction stops independently along its real travel path.
   // Fresh random samples per pour replace the old fixed mound destinations.
   if(!this.directional&&!route.target&&this.dustAssigned<this.residue.budget&&s.random()<this.dustChance*(.35+.95*Math.exp(-(((route.x-this.residue.centerX)/this.residue.spreadX)**2)))){
    const yMin=top+48,uniform=yMin+s.random()*(H-42-yMin),cluster=this.residue.centerY+(s.random()-.5)*this.residue.spreadY*2,y=Math.max(yMin,Math.min(H-42,(s.random()<.2?uniform:uniform*(1-this.residue.bias)+cluster*this.residue.bias)));route.rest={x:route.x,y,z:2+s.random()*.5};s.dust[i]=1;this.dustAssigned++;
   }
   route.delay=(seed*97%1)*1.1;route.speed=105+(seed*197%1)*43;route.distance=0;
   route.height=seed*127%1;route.wave=seed*31;
   s.y[i]=route.startY;s.previousY[i]=route.startY;s.vx[i]=s.vy[i]=0;s.vz[i]=-85;this.airborne++;this.activeRoutes.push(route);
  }
 }
 releaseLayer(route){if(route.layerCell===undefined)return;this.pendingLayers[route.layerCell]--;this.pendingLayerCount--;delete route.layerCell;}
 requestFinish(){this.finishing=true;this.sealing=true;this.finishElapsed??=0;}
 step(dt,held=false,refresh=true,{aim=null,power=1,point=null}={}){
  held=held||!!this.finishing;if(this.finishing)this.finishElapsed+=dt;
  const s=this.sand;this.press+=(Number(held)-this.press)*(1-Math.exp(-dt*(held?8:11)));
  this.exits.length=0;
  const released=this.wasHeld&&!held;this.wasHeld=held;
  if(!held&&!this.airborne&&!released){if(refresh)this.refresh();return;}
  const previousTime=this.elapsed;if(held)this.elapsed+=dt*(this.finishing?1:power);
  if(this.directional&&held&&this.pointIdle&&!this.airborne&&point?.x===this.pointX&&point?.y===this.pointY)return;
  if(this.directional&&held&&point&&((point.x-this.runoffX)**2+(point.y-this.runoffY)**2>12**2)){
   this.runoffX=point.x;this.runoffY=point.y;this.pointEpoch++;
  }
  const travelTime=this.elapsed-previousTime,depth=this.depth/1.25;
  let moved=this.airborne>0||(!this.directional&&held);
  let active=0;for(let at=0;at<this.activeRoutes.length;at++){
   const route=this.activeRoutes[at],i=route.i;if(s.state[i]===BOUND||s.state[i]===LOST){this.releaseLayer(route);continue;}this.activeRoutes[active++]=route;
   if(s.state[i]===AIR){s.vz[i]-=1050*dt;s.z[i]+=s.vz[i]*dt;const floor=5+route.height*25*depth;if(s.z[i]<=floor){s.z[i]=floor;s.vz[i]=0;s.state[i]=FREE;this.airborne--;if(s.y[i]<0)this.exits.push(i);}continue;}
   if(!held&&!released)continue;
   s.previousX[i]=s.x[i];s.previousY[i]=s.y[i];s.vx[i]=s.vy[i]=0;if(!held)continue;
   if(route.parked){s.z[i]+=(route.rest.z-s.z[i])*Math.min(1,dt*14);continue;}
   if(route.landing!==undefined){
    moved=true;
    route.landing+=dt;const progress=Math.min(1,route.landing/.18),ease=progress*progress*(3-2*progress);
    s.z[i]=route.contactZ+(2.2-route.contactZ)*ease;s.roll[i]+=dt*2;
    if(progress===1){s.z[i]=2.2;const cell=route.layerCell,layer=cell!==undefined&&!!s.bound[cell];this.releaseLayer(route);const bound=layer?(!this.directional||s.bound[cell]<this.layerCapacity[cell])&&s.bindLayer(i):s.bind(i,true);if(layer&&bound)this.adheredLayers++;if(!bound){delete route.landing;delete route.contactZ;}}continue;
   }
   const guidedSpeed=aim===null||this.finishing?1:aimSpeed(route.x,aim);
   const travel=guidedSpeed*route.speed*(route.delay<=previousTime?travelTime:Math.max(0,this.elapsed-route.delay));if(travel<=0&&!(this.finishing&&route.target))continue;
   if(this.directional){moved=this.moveTowardPoint(route,point,travel,dt,depth)||moved;continue;}
   const old=s.y[i],next=this.finishing&&route.target?old+(route.y-old)*Math.min(1,dt/Math.max(.001,.30-this.finishElapsed)):old+travel;route.distance+=travel;
   // A dense rolling front becomes a thinner trail. The motion is tied only to
   // held time: releasing cannot grow, paint or advance the stream.
   s.z[i]=2.2+route.height*(4+23*Math.exp(-route.distance/300))*depth;
   const steer=aim===null?0:Math.max(-1,Math.min(1,(aim-route.x)/150));
   const approach=route.target?Math.max(0,Math.min(1,(route.y-next)/75)):1;
   const sway=steer*approach*24*Math.min(1,route.distance/42);
   s.x[i]=route.x+sway+(route.target?0:Math.sin(route.distance*.035+route.wave)*2.2);
   s.x[i]=Math.max(.2,Math.min(W-.2,s.x[i]));s.y[i]=next;s.vy[i]=route.speed;s.roll[i]+=travel*.075;
   if(route.rest&&next>=route.rest.y){s.x[i]=route.rest.x;s.y[i]=route.rest.y;s.vy[i]=0;route.parked=true;this.retainedIndices.push(i);continue;}
   if(!route.target&&!route.rest&&!this.sealing){
    const samples=Math.max(1,Math.ceil((next-old)/CELL));
    for(let n=1;n<=samples;n++){
     const y=Math.fround(old+(next-old)*n/samples),k=s.cell(s.x[i],y);
     if(k<0||!s.bound[k]||s.bound[k]+this.pendingLayers[k]>=this.layerCapacity[k]||!s.onGlue(s.x[i],y))continue;
     s.y[i]=y;s.vy[i]=0;route.layerCell=k;route.contactZ=s.z[i];route.landing=0;this.pendingLayers[k]++;this.pendingLayerCount++;break;
    }
   }
   if(route.target&&old<=route.y&&next>=route.y){s.x[i]=route.x;s.y[i]=route.y;s.vy[i]=0;route.contactZ=s.z[i];s.z[i]=route.contactZ;route.landing=0;}
   if(s.y[i]<0||s.y[i]>=H)this.exits.push(i);
  }
  this.activeRoutes.length=active;if(this.finishing&&s.coverage===1)this.sealing=true;
  if(moved)this.revision++;
  if(this.directional&&held){
   this.pointX=point?.x;this.pointY=point?.y;this.pointIdle=!moved&&this.elapsed>=1.1;
  }
  // Reuse the existing density/height representation without advancing its
  // independent physics solver. Painting is exclusively the travelling packets.
  if(refresh)this.refresh();
 }
 moveTowardPoint(route,point,travel,dt,depth){
  if(!point||this.finishing)return false;
  const s=this.sand,i=route.i,x=s.x[i],y=s.y[i];
  // Reserve a grain for each empty stencil cell so even a small detail can
  // fill when the player aims at that area.
  const target=route.target&&!s.bound[route.cell];
  const guided=target&&((route.x-point.x)**2+(route.y-point.y)**2<105**2);
  const runningOff=!guided&&route.runoffEpoch===this.pointEpoch;
  const tx=guided?route.x:runningOff?route.runoffX:Math.max(.5,Math.min(W-.5,point.x+route.offsetX));
  const ty=guided?route.y:runningOff?route.runoffY:Math.max(.5,Math.min(H-.5,point.y+route.offsetY));
  const dx=tx-x,dy=ty-y,distance=Math.sqrt(dx*dx+dy*dy);
  const speed=guided?1.35:runningOff?route.runoffSpeed*Math.min(1,.32+distance/65):Math.min(1.48,.78+distance/110);
  const length=Math.min(distance,travel*speed);
  if(length<.001&&runningOff)return false;
  const reached=length>=distance,ratio=reached?1:length/distance;
  s.x[i]=reached?tx:x+dx*ratio;s.y[i]=reached?ty:y+dy*ratio;
  s.vx[i]=dx*ratio/dt;s.vy[i]=dy*ratio/dt;
  route.distance+=length;s.roll[i]+=length*.075;
  s.z[i]=2.2+route.height*(4+18*Math.exp(-route.distance/240))*depth;
  if(guided&&reached){route.contactZ=s.z[i];route.landing=0;return true;}
  // Carry momentum through the touch. Each flake loses speed on a different
  // downstream path, so the loose layer keeps rolling instead of converging.
  if(reached&&!runningOff){
   const angle=s.seed[i]*Math.PI*2;
   const ux=distance>.001?dx/distance:Math.cos(angle),uy=distance>.001?dy/distance:Math.sin(angle);
   route.runoffX=reflectOnSheet(tx+ux*route.runoffDistance-uy*route.runoffSpread,W);
   route.runoffY=reflectOnSheet(ty+uy*route.runoffDistance+ux*route.runoffSpread,H);
   route.runoffEpoch=this.pointEpoch;
  }
  if(target)return true;
  const cell=s.cell(s.x[i],s.y[i]);
  if(!s.target[cell]||s.bound[cell]+this.pendingLayers[cell]>=this.layerCapacity[cell]||!s.onGlue(s.x[i],s.y[i]))return true;
  route.layerCell=cell;route.contactZ=s.z[i];route.landing=0;this.pendingLayers[cell]++;
  this.pendingLayerCount++;
  return true;
 }
 refresh(now){
  if(this.surfaceRevision===this.revision)return;
  // Only the rendered shadow and glints read this field in hold mode.
  // The actual grain and contact simulation still runs on every step.
  if(now!==undefined&&now-(this.lastSurfaceAt??-Infinity)<31)return;
  this.lastSurfaceAt=now;
  this.surfaceRevision=this.revision;
  this.sand.step(0,{granular:true,refreshOnly:true});
 }
 get retainedCount(){let count=0;for(const i of this.retainedIndices)if(this.sand.state[i]===FREE)count++;return count;}
 get pose(){return this.directional?{x:0,y:0,cup:this.press*.12,pitch:0}:{x:0,y:0,cup:this.press*.38,pitch:this.press*.34};}
 get front(){return Math.min(H,this.elapsed*125);}
}
