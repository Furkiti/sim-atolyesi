import {readFileSync,writeFileSync} from 'node:fs';import {PNG} from 'pngjs';import {levelCatalog} from '../src/levels.js';
const stages=levelCatalog.flatMap(l=>l.stages);
const W=600,H=800,result={};
for(const stage of stages){
 const {data}=PNG.sync.read(readFileSync(new URL(`../assets/${stage.id}.png`,import.meta.url))),labels=new Int32Array(W*H),queue=new Int32Array(W*H),components=[];
 for(let start=0;start<labels.length;start++)if(!labels[start]&&data[start*4+3]>80){
  const id=components.length+1,pixels=[];let head=0,tail=1;queue[0]=start;labels[start]=id;let sx=0,sy=0;
  while(head<tail){const p=queue[head++],x=p%W,y=(p/W)|0;pixels.push(p);sx+=x;sy+=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=W||yy<0||yy>=H)continue;const q=yy*W+xx;if(!labels[q]&&data[q*4+3]>80){labels[q]=id;queue[tail++]=q;}}
  }
  components.push({pixels,cx:sx/pixels.length,cy:sy/pixels.length});
 }
 const primary=components.filter(c=>c.pixels.length>=120);if(!primary.length)primary.push(components.reduce((a,b)=>a.pixels.length>b.pixels.length?a:b));
 for(const c of components)if(!primary.includes(c)){let nearest=primary[0],best=Infinity;for(const p of primary){const d=(c.cx-p.cx)**2+(c.cy-p.cy)**2;if(d<best){best=d;nearest=p;}}nearest.pixels.push(...c.pixels);}
 primary.sort((a,b)=>a.cy-b.cy||b.pixels.length-a.pixels.length);
 result[stage.id]=primary.map((c,index)=>{
  c.pixels.sort((a,b)=>a-b);let x0=W,y0=H,x1=0,y1=0;
  for(const p of c.pixels){const x=p%W,y=(p/W)|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const w=x1-x0+1,h=y1-y0+1,dx=-.45*w,dy=h,n=Math.hypot(dx,dy),axis={x:dx/n,y:dy/n};let gripPixel=c.pixels[0],min=Infinity,max=-Infinity;
  for(const p of c.pixels){const projection=p%W*axis.x+((p/W)|0)*axis.y;if(projection<min){min=projection;gripPixel=p;}max=Math.max(max,projection);}
  const grip={x:gripPixel%W+.5,y:((gripPixel/W)|0)+.5},runs=[];
  for(let i=0;i<c.pixels.length;){const start=c.pixels[i],y=(start/W)|0,x=start%W;let length=1;while(i+length<c.pixels.length&&c.pixels[i+length]===start+length&&((start+length)/W|0)===y)length++;runs.push([y-y0,x-x0,length]);i+=length;}
  return {id:`${stage.id}-${index}`,area:c.pixels.length,bounds:{x:x0,y:y0,w,h},grip,axis,length:Math.ceil(max-min+1),duration:+(2.05+Math.min(.95,Math.sqrt(c.pixels.length)/310)).toFixed(2),runs};
 });
}
writeFileSync(new URL('../src/peel-pieces.js',import.meta.url),'// Generated from the exact colour masks by scripts/build-peels.mjs.\nexport const piecesByStage='+JSON.stringify(result)+';\n');
console.log('Peel pieces:',Object.fromEntries(Object.entries(result).map(([id,p])=>[id,p.length])));
