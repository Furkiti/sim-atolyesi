const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
// Stage coordinates describe the adhesive, not the bottle's landing spot.
// Leave a visible brush stroke between the loose pile and a small target.
export function planPour(target,areaCells,style='fan'){
 const small=areaCells<300,offset=small?80:65;
 return {target:{...target},anchor:{x:clamp(target.x,32,568),y:clamp(target.y-offset,35,700)},fan:style==='ribbon'?(small?20:34):style==='pulse'?(small?44:80):(small?38:65),sway:style==='ribbon'?24:(small?10:18)};
}
export function pourPoint(plan,t=0){
 return {x:clamp(plan.anchor.x+Math.sin(t*Math.PI*3)*plan.sway,20,580),y:clamp(plan.anchor.y+Math.sin(t*Math.PI*2)*5,20,740)};
}
