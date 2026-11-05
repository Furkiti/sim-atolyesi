const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class PaperMotion{
 constructor(){this.x=0;this.y=0;this.cup=0;this.vx=0;this.vy=0;this.vc=0;this.grip=null;}
 begin(point){this.grip={...point};return true;}
 move(point){if(this.grip)this.hand={x:clamp((point.x-this.grip.x)/650,-.16,.16),y:clamp((point.y-this.grip.y)/650,-.13,.2)}}
 end(){this.grip=null;this.hand=null;}
 step(dt,mode,motion,down){
  const active=mode!=='still',target=this.hand&&mode==='hands'?this.hand:{x:active&&down?clamp(-motion.dx/2500,-.018,.018):0,y:active&&down?clamp(motion.dy/2600,-.02,.02):0};
  const cup=active?(this.hand?.12:down?.045+Math.min(.055,motion.load*.05):0):0;
  // Stable substeps give the same spring response at 30 and 60 FPS.
  const count=Math.ceil(dt/.012),h=dt/count;
  for(let i=0;i<count;i++)for(const [p,v,t] of [['x','vx',target.x],['y','vy',target.y],['cup','vc',cup]]){this[v]+=(t-this[p])*100*h;this[v]*=Math.exp(-18*h);this[p]+=this[v]*h;}
  return {x:this.x,y:this.y,cup:this.cup};
 }
 reset(){this.x=this.y=this.cup=this.vx=this.vy=this.vc=0;this.end();}
}
