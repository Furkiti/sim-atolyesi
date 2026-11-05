export const FUNNEL={radius:132,throat:18,centerY:-470,rim:65,tilt:.9,length:112,jarRadius:40,jarTop:-126,bottom:-203};
const COS=Math.cos(FUNNEL.tilt),SIN=Math.sin(FUNNEL.tilt);
// Local z follows the inclined funnel axis; the mouth is z=0.
export function funnelLocal(p,f=FUNNEL){const c=f.tilt===FUNNEL.tilt?COS:Math.cos(f.tilt),s=f.tilt===FUNNEL.tilt?SIN:Math.sin(f.tilt),y=p.y-f.centerY,z=p.z-f.rim;return{x:p.x,y:y*c-z*s,z:y*s+z*c};}
export function funnelWorld(p,f=FUNNEL){const c=f.tilt===FUNNEL.tilt?COS:Math.cos(f.tilt),s=f.tilt===FUNNEL.tilt?SIN:Math.sin(f.tilt);return{x:p.x,y:f.centerY+p.y*c+p.z*s,z:f.rim-p.y*s+p.z*c};}
const ease=t=>t*t*(3-2*t);
export function stepFunnel(p,dt,f=FUNNEL){
 const steps=Math.max(1,Math.ceil(dt/.016)),h=dt/steps;
 if(!p.funnelStage&&(f.radius<=0||Math.abs(p.x)>f.radius+Math.abs(p.vx)*dt+2)){for(let i=0;i<steps;i++){p.vz-=980*h;p.x+=p.vx*h;p.y+=p.vy*h;p.z+=p.vz*h;}return false;}
 for(let i=0;i<steps;i++){
  if(p.funnelStage==='slide'){
   p.funnelAge+=h;const t=Math.min(1,p.funnelAge/(.3+p.seed*.3)),s=ease(t),a=p.funnelEntry,r=a.radius+(f.throat*.65-a.radius)*s,angle=a.angle+Math.sin(s*Math.PI)*.16;
   const local={x:Math.cos(angle)*r,y:Math.sin(angle)*r,z:-f.length+Math.max(0,(r-f.throat)/(f.radius-f.throat))*f.length+2},q=funnelWorld(local,f);
   p.vx=(q.x-p.x)/h;p.vy=(q.y-p.y)/h;p.vz=(q.z-p.z)/h;Object.assign(p,q);
   if(t===1){p.funnelStage='jar';p.vx*=.08;p.vy*=.08;p.vz=-45;}
   continue;
  }
  const previous=funnelLocal(p,f);p.vz-=980*h;p.x+=p.vx*h;p.y+=p.vy*h;p.z+=p.vz*h;const local=funnelLocal(p,f),r=Math.hypot(local.x,local.y);
  if(p.funnelStage==='jar'){
   if(r>f.jarRadius-3){const q=(f.jarRadius-3)/r;local.x*=q;local.y*=q;Object.assign(p,funnelWorld(local,f));p.vx*=.2;p.vy*=.2;}
   if(local.z<=f.bottom){local.z=f.bottom;Object.assign(p,funnelWorld(local,f));return true;}continue;
  }
  if(f.radius<=0||local.z>0||r>f.radius||local.z<-f.length-5)continue;
  const surface=-f.length+Math.max(0,(r-f.throat)/(f.radius-f.throat))*f.length,priorRadius=Math.hypot(previous.x,previous.y),priorSurface=-f.length+Math.max(0,(priorRadius-f.throat)/(f.radius-f.throat))*f.length;
  if(previous.z>=priorSurface&&local.z<=surface+1){local.z=surface+2;Object.assign(p,funnelWorld(local,f));p.funnelStage='slide';p.funnelAge=0;p.funnelEntry={radius:r,angle:Math.atan2(local.y,local.x)};}
 }
 return false;
}
