import test from 'node:test';
import assert from 'node:assert/strict';
import {SprayBoard,sprayPosterPixels} from '../src/spray.js';
import {SprayWallet} from '../src/spray-wallet.js';
import {CoverageGuide} from '../src/coverage-guide.js';
import {Sand,W,H} from '../src/sand.js';
import {levels} from '../src/levels.js';
import {PNG} from 'pngjs';
import {readFileSync} from 'node:fs';

const rectangle=(x,y,w,h)=>{
 const mask=new Uint8Array(W*H);
 for(let row=y;row<y+h;row++)mask.fill(1,row*W+x,row*W+x+w);
 return mask;
};
function readMask(id){
 const {data}=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url)));
 return Uint8Array.from({length:W*H},(_,i)=>Number(data[i*4+3]>80));
}

test('spray keeps future ammo, paints only after impact and uncovers higher colors in order',()=>{
 const bottom=rectangle(120,640,130,65),top=rectangle(120,330,100,60);
 const board=new SprayBoard([bottom,top]);
 const future=board.trays.findIndex(tray=>tray[0]?.color===1),current=board.trays.findIndex(tray=>tray[0]?.color===0);
 assert.ok(future>=0&&current>=0&&future!==current);
 const waiting=board.trays[future][0],slot=board.load(future),amount=waiting.remaining;
 board.step(1);assert.equal(board.shots,0);assert.equal(waiting.remaining,amount);
 assert.ok(board.returnBottle(slot));assert.equal(board.load(future),slot);
 board.load(current);
 const launch=[];
 const events={fire(shot){launch.push([shot.color,shot.band]);return .25;}};
 board.step(.22,events);
 assert.deepEqual(launch,[[0,0]]);
 assert.equal(board.coverage,0);
 board.step(.24,events);assert.equal(board.coverage,0);
 board.step(.02,events);assert.ok(board.coverage>0);
 for(let frame=0;frame<2400&&!board.complete;frame++){
  for(let column=0;column<board.trays.length;column++)if(board.canFire(board.trays[column][0]))board.load(column);
  board.step(1/60,events);
 }
 assert.equal(board.coverage,1);assert.ok(board.complete);
 assert.deepEqual(launch.map(([,band])=>band),launch.map(([,band])=>band).sort((a,b)=>a-b));
});

test('spray mask ownership paints an overlapping pixel once and restores completed bands',()=>{
 const first=rectangle(140,680,90,36),second=rectangle(155,680,60,36);
 const board=new SprayBoard([first,second],1);
 assert.equal(board.total,90*36);
 assert.equal(board.coverage,1/6);
 assert.equal(board.band,1);
 assert.equal(board.owner[690*W+156],2);
 const rgba=sprayPosterPixels(board.owner,['#aa2233','#0055ff']);
 assert.equal(rgba[(690*W+156)*4+3],255);
 assert.ok(rgba[(690*W+156)*4+2]>rgba[(690*W+156)*4]);
 assert.equal(rgba[3],0);
});

test('every published artwork can be completed with finite, recoverable bottle queues',()=>{
 for(const level of levels){
  const masks=level.stages.map(stage=>readMask(stage.id));
  for(const sequence of ['classic','ripple']){
  const board=new SprayBoard(masks,0,{sequence,capacity:3});
  const ammo=board.trays.flat().reduce((total,bottle)=>total+bottle.remaining,0);
  for(let frame=0;frame<15000&&!board.complete;frame++){
   for(let slot=0;slot<board.slots.length;slot++)board.returnBottle(slot);
   for(let column=0;column<board.trays.length;column++)if(board.canFire(board.trays[column][0]))board.load(column);
   if(!board.active&&!board.flights.length)assert.fail('No reachable bottle in '+level.id+' band '+board.band);
   board.step(.04);
  }
  assert.equal(board.coverage,1,level.id);
  assert.equal(board.shots,ammo,level.id);
  }
 }
});

test('ripple opens an overlapping band, recommends live ammo and restores only landed shots',()=>{
 const masks=[rectangle(20,725,60,70),rectangle(260,725,35,70),rectangle(25,625,50,60),rectangle(420,540,40,60)];
 const board=new SprayBoard(masks,0,{sequence:'ripple',capacity:3});
 const first=board.recommendations().find(item=>item.bottle.color===0);
 const upper=board.trays.findIndex(tray=>tray[0]?.color===2);
 assert.ok(first?.current>0);assert.ok(upper>=0);
 const futureIds=new Set(board.trays[upper][0].rounds.map(shot=>shot.id));
 board.load(upper);board.load(first.column);
 for(let frame=0;frame<240&&board.exposed===0;frame++)board.step(1/60);
 assert.equal(board.band,0);assert.equal(board.exposed,1);
 assert.equal(board.canFire(board.slots[0]),true);
 for(let frame=0;frame<60&&!board.checkpoint().landed.some(id=>futureIds.has(id));frame++)board.step(1/60);
 const checkpoint=board.checkpoint(),restored=new SprayBoard(masks,checkpoint,{sequence:'ripple',capacity:3});
 assert.ok(checkpoint.landed.some(id=>futureIds.has(id)));
 assert.deepEqual(restored.checkpoint(),checkpoint);
 assert.equal(restored.coverage,board.coverage);
 const shotsLeft=restored.trays.flat().reduce((sum,bottle)=>sum+bottle.remaining,0);
 assert.ok(shotsLeft>0);
});

test('a full board can release a waiting bottle or unlock capacity without discarding paint',()=>{
 const masks=[rectangle(40,725,50,60),rectangle(40,625,50,60),rectangle(40,540,50,60),rectangle(40,450,50,60)];
 const board=new SprayBoard(masks,0,{sequence:'ripple',capacity:3});
 const ready=board.recommendations()[0].column;
 for(let column=0;column<4;column++)if(column!==ready)assert.ok(board.load(column)>=0);
 assert.equal(board.load(ready),-1);assert.equal(board.jammed,true);
 assert.ok(board.releaseWaiting());assert.equal(board.jammed,false);
 assert.ok(board.load(ready)>=0);assert.equal(board.full,true);assert.equal(board.jammed,false);
 board.setCapacity(4);assert.equal(board.full,false);
});

test('slot purchases persist and rewards and duplicate claims are counted once',()=>{
 const data=new Map(),storage={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
 const wallet=new SprayWallet(storage);
 assert.equal(wallet.unlock('coins',3),true);assert.equal(wallet.coins,40);
 assert.equal(wallet.unlock('coins',4),false);assert.equal(wallet.unlock('demo',3),false);
 assert.equal(wallet.unlock('demo',4),true);assert.equal(wallet.unlock('demo',4),false);
 assert.equal(wallet.grantThrough('gotham',2),20);assert.equal(wallet.grantThrough('gotham',1),0);
 assert.equal(new SprayWallet(storage).capacity,5);assert.equal(new SprayWallet(storage).coins,60);
});

test('missing-area guide keeps separate markers and drops painted patches',()=>{
 const sand=new Sand(),mask=rectangle(75,85,45,35);
 mask[461*W+402]=1;
 sand.setMask(mask);
 const guide=new CoverageGuide();
 const marks=guide.find(sand);
 assert.equal(marks.length,2);
 assert.equal(marks[1].weight,1);
 sand.bound[sand.cell(402,461)]=1;
 assert.equal(guide.find(sand).length,1);
});
