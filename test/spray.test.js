import test from 'node:test';
import assert from 'node:assert/strict';
import {SprayBoard,sprayPosterPixels} from '../src/spray.js';
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
  const board=new SprayBoard(level.stages.map(stage=>readMask(stage.id)));
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
