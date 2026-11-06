export const FUNNEL={radius:132,throat:18,centerY:-470,rim:65,tilt:.9,length:112,jarRadius:40,jarTop:-126,bottom:-203};
const COS=Math.cos(FUNNEL.tilt),SIN=Math.sin(FUNNEL.tilt);
// Local z follows the inclined funnel axis; the mouth is z=0.
export function funnelLocal(p,f=FUNNEL){const c=f.tilt===FUNNEL.tilt?COS:Math.cos(f.tilt),s=f.tilt===FUNNEL.tilt?SIN:Math.sin(f.tilt),y=p.y-f.centerY,z=p.z-f.rim;return{x:p.x,y:y*c-z*s,z:y*s+z*c};}
export function funnelWorld(p,f=FUNNEL){const c=f.tilt===FUNNEL.tilt?COS:Math.cos(f.tilt),s=f.tilt===FUNNEL.tilt?SIN:Math.sin(f.tilt);return{x:p.x,y:f.centerY+p.y*c+p.z*s,z:f.rim-p.y*s+p.z*c};}
const ease=t=>t*t*(3-2*t);
export function stepFunnel(p,dt,f=FUNNEL){
 const steps=Math.max(1,Math.ceil(dt/.016)),h=dt/steps;
 if(!p.funnelStage&&(f.radius<=0||Math.abs(p.x)>f.radius+Math.abs(p.vx)*dt+2)){for(let i=0;i<steps;i++){p.vz-=980*h;p.x+=p.vx*h;p.y+=p.vy*h;p.z+=p.vz*h;}return false;}
 const c=f.tilt===FUNNEL.tilt?COS:Math.cos(f.tilt),s=f.tilt===FUNNEL.tilt?SIN:Math.sin(f.tilt),range=f.radius-f.throat;
 for(let i=0;i<steps;i++){
  if(p.funnelStage==='slide'){
   p.funnelAge+=h;const t=Math.min(1,p.funnelAge/(.3+p.seed*.3)),u=ease(t),a=p.funnelEntry,r=a.radius+(f.throat*.65-a.radius)*u,angle=a.angle+Math.sin(u*Math.PI)*.16,lx=Math.cos(angle)*r,ly=Math.sin(angle)*r,lz=-f.length+Math.max(0,(r-f.throat)/range)*f.length+2;
   const y=f.centerY+ly*c+lz*s,z=f.rim-ly*s+lz*c;p.vx=(lx-p.x)/h;p.vy=(y-p.y)/h;p.vz=(z-p.z)/h;p.x=lx;p.y=y;p.z=z;
   if(t===1){p.funnelStage='jar';p.vx*=.08;p.vy*=.08;p.vz=-45;}continue;
  }
  const priorY=(p.y-f.centerY)*c-(p.z-f.rim)*s,priorZ=(p.y-f.centerY)*s+(p.z-f.rim)*c,priorX=p.x;
  p.vz-=980*h;p.x+=p.vx*h;p.y+=p.vy*h;p.z+=p.vz*h;
  let ly=(p.y-f.centerY)*c-(p.z-f.rim)*s,lz=(p.y-f.centerY)*s+(p.z-f.rim)*c,lx=p.x;const r=Math.hypot(lx,ly);
  if(p.funnelStage==='jar'){
   if(r>f.jarRadius-3){const q=(f.jarRadius-3)/r;lx*=q;ly*=q;p.x=lx;p.y=f.centerY+ly*c+lz*s;p.z=f.rim-ly*s+lz*c;p.vx*=.2;p.vy*=.2;}
   if(lz<=f.bottom){lz=f.bottom;p.x=lx;p.y=f.centerY+ly*c+lz*s;p.z=f.rim-ly*s+lz*c;return true;}continue;
  }
  if(f.radius<=0||lz>0||r>f.radius||lz<-f.length-5)continue;
  const surface=-f.length+Math.max(0,(r-f.throat)/range)*f.length,priorRadius=Math.hypot(priorX,priorY),priorSurface=-f.length+Math.max(0,(priorRadius-f.throat)/range)*f.length;
  if(priorZ>=priorSurface&&lz<=surface+1){lz=surface+2;p.y=f.centerY+ly*c+lz*s;p.z=f.rim-ly*s+lz*c;p.funnelStage='slide';p.funnelAge=0;p.funnelEntry={radius:r,angle:Math.atan2(ly,lx)};}
 }
 return false;
}
