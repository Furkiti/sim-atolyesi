import {HoldCascade} from './hold-cascade.js';
import {AIR,FREE,BOUND,W,H,Sand} from './sand.js';

export const TRIAL_FPS=60;
export const TRIAL_END=480;
const UPPER={x:286,y:318},LOWER={x:410,y:584};
export const TRIAL_BEATS=[
 {frame:96,name:'İlk dokunuş'},
 {frame:156,name:'İlk dalga'},
 {frame:216,name:'Temas'},
 {frame:264,name:'Bırak'},
 {frame:310,name:'İkinci hedef'},
 {frame:410,name:'Yerleşme'}
];

export function trialMask(){
 const mask=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const wave=Math.sin((x-128)/350*Math.PI);
  const ribbon=x>=125&&x<=450&&Math.abs(y-(319+wave*26))<(8+wave*16);
  const oval=((x-LOWER.x)/76)**2+((y-LOWER.y)/51)**2<1;
  const cutout=((x-LOWER.x+24)/45)**2+((y-LOWER.y+16)/37)**2<1;
  mask[y*W+x]=ribbon||(oval&&!cutout)?1:0;
 }
 return mask;
}

export function trialInput(frame){
 const held=frame>=96&&frame<264||frame>=310;
 return {held,point:held?(frame<310?UPPER:LOWER):null};
}

export function createTrial(material,mask,density=1){
 let seed=1559;
 const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
 const sand=new Sand({capacity:20000,random});
 sand.setMask(mask);
 const cascade=new HoldCascade(sand,{holdExperiment:'point',holdPointPlacement:'top',holdDensity:density,holdGrainSize:1.7,holdMaterial:material});
 return {sand,cascade,frame:0};
}

export function advanceTrial(trial,frame){
 const {cascade}=trial;
 while(trial.frame<frame){
  const next=++trial.frame;
  if(next<=69)cascade.pour(next/69,53);
  const {held,point}=trialInput(next);
  cascade.step(1/TRIAL_FPS,held,false,{point});
 }
}

export function trialMetrics(sand){
 const heights=new Uint32Array(64);
 let bound=0,free=0,moving=0,y=0;
 for(let i=0;i<sand.count;i++){
  if(sand.state[i]===BOUND){bound++;continue;}
  if(sand.state[i]!==FREE)continue;
  free++;y+=sand.y[i];
  heights[Math.min(63,Math.floor(sand.z[i]))]++;
  if(sand.vx[i]**2+sand.vy[i]**2>20**2)moving++;
 }
 let q90=0,cumulative=0;
 for(;q90<heights.length-1;q90++){
  cumulative+=heights[q90];
  if(cumulative>=free*.9)break;
 }
 return {bound,free,moving,q90,y:free?y/free:0,coverage:sand.coverage,air:sand.count-bound-free,emitted:sand.emitted};
}

export function trialStyle(sand,i){
 if(sand.state[i]===AIR)return 3;
 if(sand.state[i]===BOUND)return sand.seed[i]<.11?6:5;
 const grade=(sand.seed[i]*91)%1;
 return grade>.92?4:sand.z[i]>12?3:grade>.52?2:1;
}
