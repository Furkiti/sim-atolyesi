import test from 'node:test';import assert from 'node:assert/strict';import {PNG} from 'pngjs';import {readFileSync} from 'node:fs';
import {holdLayout,holdSourceBand} from '../src/hold-layout.js';import {HoldCascade} from '../src/hold-cascade.js';import {Sand,FREE,LOST} from '../src/sand.js';import {levels} from '../src/levels.js';import {piecesByStage} from '../src/peel-pieces.js';import {normalizeSettings,DEFAULTS} from '../src/settings.js';
const rng=()=>{let n=631;return()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)};
function mask(id){const png=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url)));return Uint8Array.from({length:480000},(_,i)=>Number(png.data[i*4+3]>80));}
test('width mode limits the top ribbon to the adhesive width plus a modest overlap',()=>{
 const m=new Uint8Array(480000);for(let y=350;y<400;y++)for(let x=240;x<300;x++)m[y*600+x]=1;const layout=holdLayout(m,{holdPlacement:'width'}),b=layout.bands[0];assert.equal(b.y,22);assert.ok(b.x0<240&&b.x1>300);assert.ok(b.x1-b.x0<150);assert.ok(layout.doseScale<.25);assert.equal(normalizeSettings({holdPlacement:'width'}).holdPlacement,'width');
});
test('local supply is shared by downstream components and closes the bottle only for necessary moves',()=>{
 const m=mask('skin'),pieces=piecesByStage.skin,s=new Sand({random:rng()});s.setMask(m);const c=new HoldCascade(s,{...DEFAULTS,holdPlacement:'local',pieces});assert.equal(c.bands.length,3);
 for(const route of c.routes.filter(r=>r.target)){const b=c.bands[route.band];assert.ok(route.x>=b.x0&&route.x<=b.x1);assert.ok(b.y<route.y);}
 const b=c.bands[1],progress=(b.clock+b.travel*.5)/c.units;c.pour(progress,0);const count=s.emitted;assert.equal(c.sourcePose(progress).flow,0);c.pour((b.clock+b.travel*.8)/c.units,0);assert.equal(s.emitted,count);
});
test('the broad upper pour in the hat portrait replaces all seven redundant lower supplies',()=>{
 for(const rows of [1,2]){const pieces=piecesByStage['cap-ink'],s=new Sand({random:rng()});s.setMask(mask('cap-ink'));const c=new HoldCascade(s,{...DEFAULTS,holdDensity:.5,holdPlacement:'local',holdRows:rows,pieces});assert.equal(pieces.length,8);assert.equal(c.bands.length,rows);assert.ok(c.bands.every(b=>b.x0===.5&&b.x1===599.5&&b.y<=39));
  for(const r of c.routes.filter(r=>r.target)){const b=c.bands[r.band];assert.ok(r.x>=b.x0&&r.x<=b.x1);assert.ok(b.y<r.y);}
  c.pour(1,0);const emitted=s.emitted;for(let n=0;n<360;n++)c.step(1/30,true,false);assert.equal(s.coverage,1);assert.equal(s.emitted,emitted);
 }
});
test('a wide lower pour cannot replace an upper target it cannot flow towards',()=>{
 const pieces=[{bounds:{x:250,y:90,w:35,h:20}},{bounds:{x:40,y:430,w:520,h:50}}],l=holdLayout(new Uint8Array(480000),{holdPlacement:'local',pieces});assert.equal(l.bands.length,2);assert.ok(l.bands[0].y<90);assert.ok(l.bands[1].y>90);
 const i=holdSourceBand(l.bands,260,100,0);assert.equal(i,0);
});
test('upper ribbons can jointly supply a lower island while retaining the only source for an uncovered side',()=>{
 const pieces=[{bounds:{x:60,y:110,w:150,h:20}},{bounds:{x:245,y:110,w:150,h:20}},{bounds:{x:100,y:430,w:260,h:30}},{bounds:{x:540,y:550,w:35,h:20}}],l=holdLayout(new Uint8Array(480000),{holdPlacement:'local',pieces});assert.equal(l.bands.length,3);assert.equal(l.bands.filter(b=>b.y<110).length,2);assert.equal(l.bands.filter(b=>b.bounds.y===430).length,0);
 for(const [x,y] of [[110,440],[350,440],[555,555]]){const b=l.bands[holdSourceBand(l.bands,x,y,0)];assert.ok(b.x0<=x&&b.x1>=x&&b.y<y);}
});
test('equal-height overlapping local pours keep one wide source rather than deleting each other',()=>{
 const pieces=[{bounds:{x:200,y:150,w:100,h:20}},{bounds:{x:215,y:150,w:80,h:20}}],l=holdLayout(new Uint8Array(480000),{holdPlacement:'local',pieces});assert.equal(l.bands.length,1);assert.equal(l.bands[0].bounds.w,100);
});
test('both targeted placements coat every exact mask, without premature painting or material duplication',()=>{
 for(const placement of ['width','local','joined'])for(const level of levels)for(const stage of level.stages){const s=new Sand({random:rng()});s.setMask(mask(stage.id));const c=new HoldCascade(s,{...DEFAULTS,holdDensity:.5,holdRows:2,holdPlacement:placement,pieces:piecesByStage[stage.id]});c.pour(1,0);for(let n=0;n<30;n++)c.step(1/30,false,false);assert.equal(s.coverage,0);
  for(const r of c.routes.filter(r=>r.target)){const b=c.bands[r.band];assert.ok(r.x>=b.x0&&r.x<=b.x1,stage.id+': horizontal source');if(['local','joined'].includes(placement))assert.ok(b.y<=Math.max(2,r.y),stage.id+': upstream source');}
  const total=s.emitted;for(let n=0;n<330;n++){c.step(1/30,true,false);for(let i=0;i<s.count;i++)if(s.state[i]===FREE&&s.y[i]>=800){s.state[i]=LOST;s.lost++;}}
  assert.equal(s.coverage,1,placement+':'+stage.id);assert.equal(s.emitted,total);const stats=s.stats();assert.equal(stats.air+stats.free+stats.bound+stats.lost,total);
 }
});
