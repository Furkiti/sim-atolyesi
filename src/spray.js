import {W,H,CELL,COLS,ROWS} from './sand.js';

export const SPRAY_SLOTS=5, SPRAY_COLUMNS=4;
const ROWS_PER_BAND=18, SHOTS_PER_BOTTLE=50, SHOT_INTERVAL=.047;

export class SprayBoard {
 constructor(masks,restored=0){
  this.owner=new Uint8Array(W*H);
  for(const [color,mask] of masks.entries()){
   for(let pixel=0;pixel<mask.length;pixel++)if(mask[pixel])this.owner[pixel]=color+1;
  }
  this.tiles=new Uint8Array(COLS*ROWS*4);
  this.slots=Array(SPRAY_SLOTS).fill(null);
  this.trays=Array.from({length:SPRAY_COLUMNS},()=>[]);
  this.time=0;this.covered=0;this.total=0;this.band=0;this.revision=0;this.paintRevision=0;
  this.flights=[];this.shots=0;
  const rows=Array.from({length:Math.ceil(ROWS/ROWS_PER_BAND)},()=>Array.from({length:masks.length},()=>[]));
  const counts=new Uint8Array(masks.length),samples=new Int32Array(masks.length);
  let tiles=0;
  for(let row=ROWS-1;row>=0;row--){
   const band=Math.floor((ROWS-1-row)/ROWS_PER_BAND);
   for(let col=0;col<COLS;col++){
    counts.fill(0);
    const x0=col*CELL,y0=row*CELL;
    for(let y=y0;y<y0+CELL;y++)for(let x=x0;x<x0+CELL;x++){
     const pixel=y*W+x,color=this.owner[pixel]-1;
     if(color<0)continue;
     if(!counts[color]||x===x0+2&&y===y0+2)samples[color]=pixel;
     counts[color]++;
    }
    for(let color=0;color<counts.length;color++)if(counts[color]){
     const pixel=samples[color];
     rows[band][color].push({cell:row*COLS+col,weight:counts[color],x:pixel%W+.5,y:Math.floor(pixel/W)+.5});
     this.total+=counts[color];tiles++;
    }
   }
  }
  this.bands=[];
  const shotSize=Math.max(4,Math.ceil(tiles/670));
  const groups=Array.from({length:masks.length},()=>[]);
  for(const [row,colors] of rows.entries()){
   const count=colors.reduce((sum,cells)=>sum+cells.length,0);
   if(!count)continue;
   const band=this.bands.length;
   this.bands.push({remaining:count,front:Math.max(0,H-(row+1)*ROWS_PER_BAND*CELL)});
   colors.forEach((cells,color)=>{
    for(let i=0;i<cells.length;i+=shotSize){
     const shot={band,color,cells:cells.slice(i,i+shotSize)};
     if(band<restored)this.deposit(shot,false);
     else groups[color].push(shot);
    }
   });
  }
  this.advanceFront();
  const bottles=[];
  let id=0;
  for(const [color,shots] of groups.entries())for(let i=0;i<shots.length;i+=SHOTS_PER_BOTTLE){
   const rounds=shots.slice(i,i+SHOTS_PER_BOTTLE);
   bottles.push({id:++id,color,rounds,remaining:rounds.length,air:0,nextAt:0});
  }
  bottles.sort((a,b)=>a.rounds[0].band-b.rounds[0].band||a.color-b.color);
  bottles.forEach((bottle,i)=>{
   bottle.column=i%SPRAY_COLUMNS;this.trays[bottle.column].push(bottle);
  });
 }
 get complete(){return this.band===this.bands.length;}
 get coverage(){return this.total?this.covered/this.total:1;}
 get front(){return this.bands[this.band]?.front??0;}
 get active(){return this.slots.some(bottle=>bottle&&this.canFire(bottle));}
 nextRound(bottle){return bottle?.rounds[bottle.rounds.length-bottle.remaining];}
 canFire(bottle){return this.nextRound(bottle)?.band===this.band;}
 load(column){
  const slot=this.slots.indexOf(null),bottle=this.trays[column]?.[0];
  if(slot<0||!bottle)return -1;
  this.trays[column].shift();this.slots[slot]=bottle;
  bottle.nextAt=this.time+.22;
  this.revision++;
  return slot;
 }
 returnBottle(slot){
  const bottle=this.slots[slot];
  if(!bottle?.remaining||bottle.air||this.canFire(bottle))return false;
  this.slots[slot]=null;
  const tray=this.trays[bottle.column];
  tray.push(bottle);tray.sort((a,b)=>this.nextRound(a).band-this.nextRound(b).band||a.id-b.id);
  this.revision++;return true;
 }
 advanceFront(){
  while(this.band<this.bands.length&&!this.bands[this.band].remaining)this.band++;
 }
 deposit(shot,flash=true){
  const channel=shot.color>>3,bit=1<<(shot.color%8),stamp=flash?(Math.floor(this.time*60)+1)%65536:0;
  for(const target of shot.cells){
   const at=target.cell*4;
   this.tiles[at+channel]|=bit;
   this.tiles[at+2]=stamp%256;this.tiles[at+3]=stamp>>8;
   this.covered+=target.weight;
  }
  this.bands[shot.band].remaining-=shot.cells.length;
  this.paintRevision++;
 }
 step(dt,{fire,impact}={}){
  this.time+=dt;
  let pending=0;
  for(const flight of this.flights){
   if(flight.landsAt>this.time){this.flights[pending++]=flight;continue;}
   flight.bottle.air--;
   this.deposit(flight.shot);
   impact?.(flight.shot);
  }
  this.flights.length=pending;
  this.advanceFront();
  for(let slot=0;slot<this.slots.length;slot++){
   const bottle=this.slots[slot];
   if(!bottle)continue;
   if(!bottle.remaining&&!bottle.air){this.slots[slot]=null;this.revision++;continue;}
   if(!this.canFire(bottle)||bottle.nextAt>this.time)continue;
   const shot=this.nextRound(bottle);
   bottle.nextAt=this.time+SHOT_INTERVAL;bottle.remaining--;bottle.air++;
   const duration=Math.max(.16,fire?.(shot,slot)??.29);
   this.flights.push({shot,bottle,landsAt:this.time+duration});
   this.shots++;this.revision++;
  }
 }
}

export function sprayPosterPixels(owner,colors){
 const palette=colors.map(color=>parseInt(color.slice(1),16));
 const rgba=new Uint8ClampedArray(owner.length*4);
 for(let pixel=0;pixel<owner.length;pixel++){
  const color=owner[pixel];
  if(!color)continue;
  const rgb=palette[color-1],seed=Math.imul(pixel+1,0x9e3779b1)>>>0;
  const light=.66+(seed&255)/255*.54,glint=(seed&8191)<180?63:0,at=pixel*4;
  rgba[at]=(rgb>>16)*light+glint;
  rgba[at+1]=(rgb>>8&255)*light+glint;
  rgba[at+2]=(rgb&255)*light+glint;
  rgba[at+3]=255;
 }
 return rgba;
}
