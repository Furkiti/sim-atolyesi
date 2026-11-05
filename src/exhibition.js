// Follow the finger, then commit a short deliberate swipe to one artwork.
export class ExhibitionRail {
 constructor(count,index=0){this.count=count;this.focus=this.target=this.clamp(index);this.drag=null;}
 clamp(value){return Math.max(0,Math.min(this.count-1,value));}
 select(index){this.target=this.clamp(Math.round(index));this.drag=null;return this.target;}
 begin(x,time=0){this.drag={x,lastX:x,lastTime:time,origin:this.focus,originTarget:this.target,distance:0,velocity:0,span:300};}
 move(x,pixelsPerFrame,time=0){if(!this.drag)return;const d=this.drag,delta=time-d.lastTime;d.span=Math.max(1,pixelsPerFrame);d.distance=d.x-x;if(delta>0)d.velocity=(d.lastX-x)/delta;d.lastX=x;d.lastTime=time;this.focus=this.clamp(d.origin+d.distance/d.span);this.target=Math.round(this.focus);}
 end(cancel=false){
  const d=this.drag;if(!d)return this.target;
  const deliberate=Math.abs(d.distance)>=Math.min(36,d.span*.12)||(Math.abs(d.distance)>10&&Math.abs(d.velocity)>.3);
  return this.select(cancel||!deliberate?d.originTarget:d.originTarget+Math.sign(d.distance));
 }
 step(dt){if(!this.drag){this.focus+=(this.target-this.focus)*(1-Math.exp(-dt*13));if(Math.abs(this.focus-this.target)<.0001)this.focus=this.target;}return this.focus;}
}
export function galleryOffset(index,current,spacing){return(index-current)*spacing;}
export function entryProgress(seconds,reduced=false){const t=Math.min(1,Math.max(0,seconds/(reduced?.4:1.7)));return t*t*(3-2*t);}

export function entryZoomDistance(aspect,fov=35){return Math.max(600/aspect,800)/(2*Math.tan(fov*Math.PI/360))*1.04;}
export function entryFrameOpacity(progress){const t=Math.max(0,Math.min(1,(progress-.25)/.65));return 1-t*t*(3-2*t);}
