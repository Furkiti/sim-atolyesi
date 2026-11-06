// Finite material ledger. Visible transfer packets may represent several grains;
// their summed mass is removed from the reservoir and added once to the jar.
export const RECOVERY_STYLES=['classic','trough','rills','bowl'];
export class Recovery {
 constructor(style='classic'){this.style=style;this.reset();}
 reset(){this.deposited=0;this.stored=0;this.inTransit=0;this.jar=0;this.opened=false;this.age=0;this.releaseCredit=0;this.serial=0;}
 deposit(mass=1){this.deposited+=mass;this.stored+=mass;}
 open(){if(!this.opened){this.opened=true;this.age=0;}}
 get pending(){return this.stored+this.inTransit;}
 step(dt,emit){
  if(this.opened)this.age+=dt;
  const continuous=this.style==='rills'||this.style==='classic',ready=continuous||(this.opened&&this.age>.55);
  if(!ready||!this.stored)return;
  const pulse=this.style==='bowl'?.5+.5*Math.sin(Math.min(1,(this.age-.55)/1.7)*Math.PI):1;
  const rate=Math.max(2800,this.stored*3.2)*pulse;this.releaseCredit+=rate*dt;
  let budget=Math.min(this.stored,Math.floor(this.releaseCredit));this.releaseCredit-=budget;
  // At most 48 additions per physics tick: preserve all mass at high density/4x.
  const packet=Math.max(1,Math.ceil(budget/48));
  while(budget>0){const mass=Math.min(packet,budget),seed=(++this.serial* .61803398875)%1;this.stored-=mass;this.inTransit+=mass;budget-=mass;emit({mass,seed});}
 }
 catch(mass){this.inTransit-=mass;this.jar+=mass;}
}
const smooth=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
export function startRecovery(p){
 p.recovery='intake';p.routeAge=0;p.routeX=p.x;p.routeY=p.y;p.routeZ=p.z;p.routeSide=p.x<0?-1:1;p.routeDuration=p.edge==='bottom'?.32+p.seed*.22:.78+p.seed*.38;
}
export function transferPacket(packet,style,color){
 const seed=packet.seed,side=seed<.5?-1:1;
 return {...packet,color,recovery:'transfer',routeAge:0,routeDuration:.58+seed*.25,style,routeSide:side,x:style==='rills'?side*225:(seed-.5)*180,y:-460,z:24,vx:0,vy:0,vz:0};
}
// The side/top exits go behind the paper and down the outer rails, not through
// its visible face. Bottom exits land directly on the wide receiving surface.
export function stepRecovery(p,dt){
 p.routeAge+=dt;const t=Math.min(1,p.routeAge/p.routeDuration),e=smooth(t);
 if(p.recovery==='intake'){
  const endX=Math.max(-278,Math.min(278,p.routeX));
  if(p.edge==='bottom'){p.x=mix(p.routeX,endX,e);p.y=mix(p.routeY,-455,e);p.z=mix(p.routeZ,20,e)+Math.sin(t*Math.PI)*9;}
  else if(t<.2){const u=smooth(t/.2);p.x=mix(p.routeX,p.routeSide*337,u);p.y=p.routeY;p.z=mix(p.routeZ,-12,u);}
  else if(t<.82){const u=smooth((t-.2)/.62);p.x=p.routeSide*337;p.y=mix(p.routeY,-455,u);p.z=-12;}
  else{const u=smooth((t-.82)/.18);p.x=mix(p.routeSide*337,endX,u);p.y=-455;p.z=mix(-12,20,u);}
 }else{
  const spread=(p.seed-.5)*20,start=p.style==='rills'?p.routeSide*225:(p.seed-.5)*180;
  if(t<.48){const u=smooth(t/.48);p.x=mix(start,spread,u);p.y=-460-30*u;p.z=24-45*u;}
  else{const u=smooth((t-.48)/.52);p.x=spread*(1-u*.6);p.y=mix(-490,-600,u);p.z=mix(-21,-54,u);}
 }
 return t===1;
}
