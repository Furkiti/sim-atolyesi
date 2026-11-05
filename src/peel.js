import {smooth} from './interaction.js';
export const PEEL_GAP=.24;
export function peelSeconds(area){
 if(area<600)return .35+.25*Math.sqrt(Math.max(0,area)/600);
 if(area<2400)return .6+(area-600)/1800*.5;
 if(area<6000)return 1.1+(area-2400)/3600*1.2;
 return 2.05+Math.min(.95,Math.sqrt(area)/310);
}
export const peelGap=piece=>piece.area<1800?.07:piece.area<5000?.12:PEEL_GAP;
export function peelDuration(pieces){return pieces.reduce((sum,p,i)=>sum+p.duration+(i<pieces.length-1?peelGap(p):0),0)}
export function peelAt(pieces,elapsed){
 let cursor=0;for(let i=0;i<pieces.length;i++){const end=cursor+pieces[i].duration;if(elapsed<=end||i===pieces.length-1)return{index:i,progress:Math.max(0,Math.min(1,((elapsed-cursor)/pieces[i].duration)+1e-12)),count:pieces.length};if(elapsed<end+peelGap(pieces[i]))return{index:i,progress:1,count:pieces.length};cursor=end+peelGap(pieces[i]);}
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
