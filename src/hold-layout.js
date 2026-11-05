import {W,H} from './sand.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function boundsOf(mask){let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(mask[y*W+x]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return x1<0?{x:0,y:0,w:W,h:H}:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
export function holdLayout(mask,settings={}){
 const placement=settings.holdPlacement||'sheet',rows=settings.holdRows===2?2:1,full=boundsOf(mask),parts=placement==='local'&&settings.pieces?.length?settings.pieces:[{bounds:full}],bands=[];
 let labels=null;if(placement==='local'&&parts[0].runs){labels=new Uint8Array(W*H).fill(255);parts.forEach((p,i)=>{for(const [y,x,n] of p.runs)labels.fill(i,(p.bounds.y+y)*W+p.bounds.x+x,(p.bounds.y+y)*W+p.bounds.x+x+n);});}
 for(let group=0;group<(placement==='local'?parts.length:1);group++){
  const bounds=placement==='local'?parts[group].bounds:full,padding=clamp(bounds.w*.2+14,24,85),x0=placement==='sheet'?.5:clamp(bounds.x-padding,.5,W-.5),x1=placement==='sheet'?W-.5:clamp(bounds.x+bounds.w+padding,.5,W-.5);
  for(let row=0;row<rows;row++)bands.push({group,row,x0,x1,y:placement==='local'?Math.max(2,bounds.y-65-(rows-1-row)*72):22+row*72,bounds});
 }
 const length=bands.reduce((sum,b)=>sum+b.x1-b.x0,0),doseScale=placement==='sheet'?1:length/(W*rows);
 return {placement,rows,bands,labels,doseScale};
}
