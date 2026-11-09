import {CELL,COLS,ROWS} from './sand.js';

export class CoverageGuide {
 constructor(){
  this.visited=new Uint8Array(COLS*ROWS);
  this.queue=new Uint16Array(COLS*ROWS);
  this.marks=[];
 }
 find(sand){
  const {target,bound}=sand,{visited,queue,marks}=this;
  visited.fill(0);marks.length=0;
  for(let cell=0;cell<target.length;cell++){
   if(!target[cell]||bound[cell]||visited[cell])continue;
   let count=1,weight=0,sumX=0,sumY=0;
   queue[0]=cell;visited[cell]=1;
   for(let i=0;i<count;i++){
    const k=queue[i],col=k%COLS,row=(k/COLS)|0,w=target[k],base=k*8;
    weight+=w;sumX+=(col+.5)*w;sumY+=(row+.5)*w;
    for(let d=0;d<4;d++){
     const n=sand.neighbors[base+d];
     if(!visited[n]&&target[n]&&!bound[n]){queue[count++]=n;visited[n]=1;}
    }
   }
   // Keep the marker on the patch even when the centroid lies in a hole.
   const cx=sumX/weight,cy=sumY/weight;
   let best=Infinity,x=cx,y=cy;
   for(let i=0;i<count;i++){
    const k=queue[i],col=k%COLS+.5,row=((k/COLS)|0)+.5,d=(col-cx)**2+(row-cy)**2;
    if(d<best){best=d;x=col;y=row;}
   }
   marks.push({x:x*CELL,y:y*CELL,weight});
  }
  marks.sort((a,b)=>b.weight-a.weight);
  marks.length=Math.min(marks.length,7);
  return marks;
 }
}
