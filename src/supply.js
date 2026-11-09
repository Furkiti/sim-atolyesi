const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const SUPPLIES={
 generous:{name:'Bol yığın',scale:2.25,spots:1},
 islands:{name:'Adacıklar',scale:2.6,spots:3},
 curtain:{name:'Üstten şelale',scale:2.8,spots:2}
};
export function supplyDose(areaCells,settings,remaining){
 const chosen=settings.controlMode==='tilt'?'generous':settings.supply==='auto'&&areaCells>9000?'curtain':settings.supply;const preset=SUPPLIES[chosen]||SUPPLIES.generous;
 const minimum=settings.controlMode==='tilt'?180:650;
 const base=Math.max(minimum,Math.min(14500,areaCells*1.6+180));
 return Math.min(remaining,Math.ceil(base*preset.scale*(settings.pourAmount||1)));
}
// Quantiles of unfinished adhesive place supplies near each group, always above it.
export function supplyPlan(target,mask,bound,areaCells,settings={}){
 const small=areaCells<300;
 if(settings.controlMode==='tilt'){
  const x=areaCells>9000&&!settings.refill?300:target.x;
  return {kind:'single',spots:[{x:clamp(x,65,535),y:clamp(target.y-(small?90:60),60,680)}],duration:small?2.6:3.5,small};
 }
 const kind=settings.supply==='auto'?(areaCells>9000?'curtain':areaCells>500&&settings.pieces?.length>=3?'islands':'generous'):settings.supply||'generous';
 const points=[];
 if(!small&&mask){
  for(let y=45;y<770;y+=5)for(let x=20;x<580;x+=5){const k=Math.floor(y/5)*120+Math.floor(x/5);if(mask[y*600+x]&&!bound?.[k])points.push({x,y});}
 }
 if(small||points.length<30)return {kind,spots:[{x:clamp(target.x,50,550),y:clamp(target.y-90,55,690)}],duration:2.6,small:true};
 const selected=settings.refill?points.filter(p=>Math.abs(p.y-target.y)<150):points;const working=selected.length>20?selected:points;
 const ys=working.map(p=>p.y).sort((a,b)=>a-b),top=ys[Math.floor(ys.length*.04)],cut=ys[Math.floor(ys.length*.32)],band=working.filter(p=>p.y<=cut).sort((a,b)=>a.x-b.x);
 const count=SUPPLIES[kind]?.spots||1,spots=[];
 for(let i=0;i<count;i++){
  let p=band[Math.min(band.length-1,Math.floor(band.length*(i+.5)/count))];
  if(kind==='islands'&&!settings.refill&&settings.pieces?.length>=3){const piece=[...settings.pieces].sort((a,b)=>b.area-a.area)[i];p={x:piece.bounds.x+piece.bounds.w*.5,y:piece.bounds.y+Math.min(piece.bounds.h*.25,55)};}
  // Large backgrounds start in the upper centre, like the final red pour.
  const x=kind==='curtain'?150+(i/(Math.max(1,count-1)))*300:kind==='generous'&&areaCells>9000&&!settings.refill?300:settings.refill&&kind==='generous'?target.x:p.x;
  const y=kind==='curtain'?(settings.refill?clamp(target.y-85,60,680):Math.max(60,top+12)):Math.max(60,p.y-65);
  spots.push({x:clamp(x,65,535),y:clamp(y,60,680)});
 }
 return {kind,spots,duration:kind==='islands'?4.5:3.5,small:false};
}
export function supplyPose(plan,progress){
 const p=clamp(progress,0,1),n=plan.spots.length;
 if(plan.kind==='single')return {...plan.spots[0],flow:1,spot:0};
 if(plan.kind==='curtain'&&!plan.small){return {x:150+300*p,y:plan.spots[0].y+Math.sin(p*Math.PI)*7,flow:1,spot:0};}
 const slot=Math.min(n-1,Math.floor(p*n)),u=Math.min(1,p*n-slot),current=plan.spots[slot],previous=plan.spots[Math.max(0,slot-1)];
 const travel=slot>0&&u<.24,t=travel?u/.24:1,ease=t*t*(3-2*t);
 return {x:previous.x+(current.x-previous.x)*ease+Math.sin(p*Math.PI*4)*8,y:previous.y+(current.y-previous.y)*ease+Math.sin(p*Math.PI*3)*4,flow:travel?0:1,spot:slot};
}
// One cumulative quota per stationary pour: the bottle shuts while travelling.
export function supplyQuota(plan,progress){
 const p=clamp(progress,0,1),n=plan.spots.length;if(n===1||plan.kind==='curtain')return p;
 const slot=Math.min(n-1,Math.floor(p*n)),u=Math.min(1,p*n-slot),local=slot===0?u:clamp((u-.24)/.76,0,1);
 return (slot+local)/n;
}
