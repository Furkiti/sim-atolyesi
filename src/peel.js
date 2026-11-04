import {smooth} from './interaction.js';
export const PEEL_GAP=.24;
export function peelDuration(pieces){return pieces.reduce((sum,p)=>sum+p.duration,0)+Math.max(0,pieces.length-1)*PEEL_GAP}
export function peelAt(pieces,elapsed){
 let cursor=0;for(let i=0;i<pieces.length;i++){const end=cursor+pieces[i].duration;if(elapsed<=end||i===pieces.length-1)return{index:i,progress:Math.max(0,Math.min(1,(elapsed-cursor)/pieces[i].duration)),count:pieces.length};if(elapsed<end+PEEL_GAP)return{index:i,progress:1,count:pieces.length};cursor=end+PEEL_GAP;}
 return{index:0,progress:0,count:0};
}
export function peelFront(piece,progress){return -2+smooth((progress-.20)/.65)*(piece.length+78)}
export function peelPoint(piece,x,y,progress){
 const {grip,axis}=piece,s=(x-grip.x)*axis.x+(y-grip.y)*axis.y,r=(x-grip.x)*(-axis.y)+(y-grip.y)*axis.x,front=peelFront(piece,progress),d=Math.max(0,front-s);
 if(d<=0)return{x:x-300,y:400-y,z:4.5};
 const radius=16+Math.min(8,d*.009),angle=d/radius,along=front-radius*Math.sin(angle),exit=smooth((progress-.85)/.15);
 const px=grip.x+axis.x*along-axis.y*r+exit*390,py=grip.y+axis.y*along+axis.x*r-exit*70;
 return{x:px-300,y:400-py,z:4.5+radius*(1-Math.cos(angle))+Math.min(55,d*.32)*smooth((progress-.2)/.65)+exit*150};
}
export function revealPolygon(piece,progress){
 const b=piece.bounds,front=peelFront(piece,progress),distance=p=>(p.x-piece.grip.x)*piece.axis.x+(p.y-piece.grip.y)*piece.axis.y-front;
 const input=[{x:b.x,y:b.y},{x:b.x+b.w,y:b.y},{x:b.x+b.w,y:b.y+b.h},{x:b.x,y:b.y+b.h}],out=[];
 for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],da=distance(a),db=distance(b);if(da<=0)out.push(a);if((da<0)!==(db<0)){const t=da/(da-db);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}}
 return out;
}
