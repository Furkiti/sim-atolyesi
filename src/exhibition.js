// One finite rail: no imaginary picture before the first artwork, no wrapping.
export class ExhibitionRail {
 constructor(count,index=0){this.count=count;this.focus=this.target=this.clamp(index);this.drag=null;}
 clamp(value){return Math.max(0,Math.min(this.count-1,value));}
 select(index){this.target=this.clamp(Math.round(index));this.drag=null;return this.target;}
 begin(x){this.drag={x,origin:this.focus};}
 move(x,pixelsPerFrame){if(this.drag){this.focus=this.clamp(this.drag.origin+(this.drag.x-x)/Math.max(1,pixelsPerFrame));this.target=Math.round(this.focus);}}
 end(){return this.select(this.focus);}
 step(dt){if(!this.drag){this.focus+=(this.target-this.focus)*(1-Math.exp(-dt*9));if(Math.abs(this.focus-this.target)<.0001)this.focus=this.target;}return this.focus;}
}
export function galleryOffset(index,current,spacing){return(index-current)*spacing;}
export function entryProgress(seconds,reduced=false){const t=Math.min(1,Math.max(0,seconds/(reduced?.4:1.7)));return t*t*(3-2*t);}
