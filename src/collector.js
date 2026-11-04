export const TRAY={halfWidth:112,halfDepth:88,centerY:-520,bottom:5,rim:63};
// Falling grains use the same world-space gravity and an open box collider.
export function stepFalling(p,dt,box){
 const steps=Math.max(1,Math.ceil(dt/.016)),h=dt/steps;
 for(let i=0;i<steps;i++){
  const previous={x:p.x,y:p.y,z:p.z};p.vz-=980*h;p.x+=p.vx*h;p.y+=p.vy*h;p.z+=p.vz*h;
  const insideX=Math.abs(p.x)<=box.halfWidth,insideY=Math.abs(p.y-box.centerY)<=box.halfDepth;
  if(insideX&&insideY&&p.vz<0&&previous.z>=box.bottom&&p.z<=box.bottom){p.z=box.bottom;return true;}
  if(p.z<box.rim&&p.z>box.bottom){
   if(insideY&&Math.abs(previous.x)<box.halfWidth&&Math.abs(p.x)>box.halfWidth){p.x=Math.sign(p.x)*(box.halfWidth-1);p.vx*=-.2;}
   if(insideX&&Math.abs(previous.y-box.centerY)<box.halfDepth&&Math.abs(p.y-box.centerY)>box.halfDepth){p.y=box.centerY+Math.sign(p.y-box.centerY)*(box.halfDepth-1);p.vy*=-.2;}
  }
 }
 return false;
}
