import {W,H} from './sand.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function boundsOf(mask){let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(mask[y*W+x]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return x1<0?{x:0,y:0,w:W,h:H}:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
// A ribbon supplies every lower adhesive island inside its horizontal flow.
// Check the union as well: two upper ribbons can jointly replace a lower one.
function supplied(bounds,sources){
 let edge=bounds.x+.5;const right=bounds.x+bounds.w-.5;
 for(const source of sources.filter(s=>s.y<=Math.max(2,bounds.y)).sort((a,b)=>a.x0-b.x0)){
  if(source.x1<edge)continue;if(source.x0>edge)return false;edge=Math.max(edge,source.x1);if(edge>=right)return true;
 }
 return false;
}
export function holdLayout(mask,settings={}){
 const placement=settings.holdPlacement||'sheet',rows=settings.holdRows===2?2:1,full=boundsOf(mask),parts=placement==='local'&&settings.pieces?.length?settings.pieces:[{bounds:full}],bands=[];
 let sources=parts.map(({bounds})=>{
  const padding=clamp(bounds.w*.2+14,24,85);
  return {bounds,x0:placement==='sheet'?.5:clamp(bounds.x-padding,.5,W-.5),x1:placement==='sheet'?W-.5:clamp(bounds.x+bounds.w+padding,.5,W-.5),y:placement==='local'?Math.max(2,bounds.y-65):22};
 });
 if(placement==='local'){
  // Remove the smallest/lower redundant supplies first, keeping the broad upper
  // pour whenever it can serve the whole mask. Recheck all islands each time so
  // deleting a source never leaves targets assigned to an unreachable stream.
  const removable=[...sources].sort((a,b)=>(a.x1-a.x0)-(b.x1-b.x0)||b.y-a.y);
  for(const source of removable){const rest=sources.filter(s=>s!==source);if(rest.length&&parts.every(p=>supplied(p.bounds,rest)))sources=rest;}
  sources.sort((a,b)=>a.y-b.y||b.x1-b.x0-(a.x1-a.x0));
 }
 for(const [group,source] of sources.entries())for(let row=0;row<rows;row++)bands.push({...source,group,row,y:placement==='local'?Math.max(2,source.y-(rows-1-row)*72):22+row*72});
 const length=bands.reduce((sum,b)=>sum+b.x1-b.x0,0),doseScale=placement==='sheet'?1:length/(W*rows);
 return {placement,rows,bands,doseScale};
}
export function holdSourceBand(bands,x,y,row){
 let chosen=0,nearest=-Infinity;
 for(let i=0;i<bands.length;i++){const b=bands[i];if(b.row===row&&x>=b.x0&&x<=b.x1&&b.y<=Math.max(2,y)&&b.y>=nearest){chosen=i;nearest=b.y;}}
 return chosen;
}
