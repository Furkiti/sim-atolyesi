import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {PNG} from 'pngjs';
import {workOpacity,entryProgress} from '../src/exhibition.js';import {audioScene} from '../src/gallery-audio.js';import {CleanupCycle,FINISH_ACTIONS} from '../src/cleanup.js';import {holdLayout,holdSourceBand} from '../src/hold-layout.js';import {HoldCascade} from '../src/hold-cascade.js';import {Sand,FREE,BOUND,LOST} from '../src/sand.js';import {DEFAULTS,normalizeSettings} from '../src/settings.js';import {piecesByStage} from '../src/peel-pieces.js';
const rng=n=>()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296);
test('loose glitter fades monotonically with gallery motion and returns during both entry paths',()=>{
 let previous=1;for(let f=0;f<=100;f++){const a=workOpacity(f/100,null);assert.ok(a<=previous&&a>=0);previous=a;}assert.equal(previous,0);
 for(const resume of [false,true]){previous=0;for(let f=0;f<=130;f++){const a=workOpacity(0,{resume,stage:'out',age:f/60});assert.ok(a>=previous&&a<=1);previous=a;}assert.equal(previous,1);assert.equal(workOpacity(1,{stage:'in',age:.5}),0);}
 assert.equal(workOpacity(0,{stage:'in',age:0,workStart:.6}),.6);assert.equal(workOpacity(0,{stage:'in',age:.3,workStart:.6}),0);
});
test('gallery audio replaces work loops even when the saved gameplay phase is still pour',()=>{
 assert.equal(audioScene({exhibition:true}), 'gallery');assert.equal(audioScene({transitioning:true}),'gallery');assert.equal(audioScene({finished:true}),'gallery');assert.equal(audioScene({dialog:true}),'silent');assert.equal(audioScene({exhibition:true,visible:false}),'silent');assert.equal(audioScene({}),'work');
});
test('joined local placement makes one continuous ribbon across the neighbouring Barcelona red islands',()=>{
 const id='barca-burgundy',png=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url))),mask=Uint8Array.from({length:480000},(_,i)=>Number(png.data[i*4+3]>80)),pieces=piecesByStage[id];
 const local=holdLayout(mask,{holdPlacement:'local',pieces}),joined=holdLayout(mask,{holdPlacement:'joined',pieces});assert.ok(local.bands.length>1);assert.equal(joined.bands.length,1);
 const s=new Sand({random:rng(31)});s.setMask(mask);const c=new HoldCascade(s,{...DEFAULTS,holdDensity:.5,holdPlacement:'joined',pieces});c.pour(1,0);const total=s.emitted;
 for(const route of c.routes.filter(r=>r.target)){const b=c.bands[route.band];assert.ok(route.x>=b.x0&&route.x<=b.x1&&b.y<=route.y);}
 for(let f=0;f<500;f++)c.step(1/30,true,false);assert.equal(s.coverage,1);assert.equal(s.emitted,total);
 const separate=holdLayout(mask,{holdPlacement:'joined',pieces:[{bounds:{x:30,y:100,w:40,h:10}},{bounds:{x:500,y:500,w:40,h:10}}]});assert.equal(separate.bands.length,2);
});
test('every optional final gesture moves only existing loose grains, with a genuine no-extra-gesture outcome',()=>{
 for(const [n,action] of FINISH_ACTIONS.entries()){
  const random=rng(929),s=new Sand({capacity:500,random});s.emit(300,350,400,{spread:220,height:0});s.state.fill(FREE);s.z.fill(3);s.state[0]=BOUND;const count=s.emitted,bound=s.bound.slice();let first=true;
  const c=new CleanupCycle(s,[],()=>first?(first=false,(n+.1)/FINISH_ACTIONS.length):random(),{style:'variety'});assert.equal(c.action,action);assert.equal(c.heldCount===0,action==='none');
  c.transition('unfold');const unfoldEnd=(()=>{c.elapsed=.65;return c.pose})();c.transition(c.heldCount?'tap':'done');const start=c.pose;assert.ok(Math.abs(start.lift-unfoldEnd.lift)<.001);
  for(let f=0;f<400&&!c.done;f++){c.advance(1/60);for(const route of c.routes)if(!c.pinned[route.i]&&s.cell(s.x[route.i],s.y[route.i])<0)s.state[route.i]=LOST;for(let i=0;i<s.count;i++)if(!c.pinned[i]&&i!==0)s.state[i]=LOST;}
  assert.ok(c.done,action);assert.equal(c.releasedCount,c.heldCount);assert.equal(s.emitted,count);assert.equal(s.state[0],BOUND);assert.deepEqual(s.bound,bound);assert.deepEqual(c.pose,{bend:0,pitch:0,lift:0,roll:0});
  if(['left','right'].includes(action))assert.ok(c.routes.every(r=>action==='left'?r.endX<0:r.endX>600));
 }
});
test('new appearance and gesture choices persist without changing the existing play preset',()=>{
 const s=normalizeSettings({holdPlacement:'joined',posterShine:'radiant',finishStyle:'variety',galleryMusic:false});assert.equal(s.holdPlacement,'joined');assert.equal(s.posterShine,'radiant');assert.equal(s.finishStyle,'variety');assert.equal(s.galleryMusic,false);assert.equal(s.holdPresetVersion,22);assert.equal(s.extraFinish,false);assert.equal(DEFAULTS.posterShine,'classic');
});
test('final gesture settling begins at exactly the previous pose and eases back to rest',()=>{
 const s=new Sand({random:rng(88)});s.emit(300,350,500,{spread:80,height:0});s.state.fill(FREE);const c=new CleanupCycle(s,[],rng(99));c.transition('tap');c.elapsed=c.tapDuration;const before=c.pose;c.transition('settle');for(const key of ['bend','pitch','lift','roll'])assert.equal(c.pose[key],before[key]);c.elapsed=.399999;for(const key of ['bend','pitch','lift','roll'])assert.ok(Math.abs(c.pose[key])<1e-6,key);
});
