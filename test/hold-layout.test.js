import test from 'node:test';import assert from 'node:assert/strict';import {PNG} from 'pngjs';import {readFileSync} from 'node:fs';
import {holdLayout} from '../src/hold-layout.js';import {HoldCascade} from '../src/hold-cascade.js';import {Sand,FREE,LOST} from '../src/sand.js';import {levels} from '../src/levels.js';import {piecesByStage} from '../src/peel-pieces.js';import {normalizeSettings,DEFAULTS} from '../src/settings.js';
const rng=()=>{let n=631;return()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)};
function mask(id){const png=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url)));return Uint8Array.from({length:480000},(_,i)=>Number(png.data[i*4+3]>80));}
test('width mode limits the top ribbon to the adhesive width plus a modest overlap',()=>{
 const m=new Uint8Array(480000);for(let y=350;y<400;y++)for(let x=240;x<300;x++)m[y*600+x]=1;const layout=holdLayout(m,{holdPlacement:'width'}),b=layout.bands[0];assert.equal(b.y,22);assert.ok(b.x0<240&&b.x1>300);assert.ok(b.x1-b.x0<150);assert.ok(layout.doseScale<.25);assert.equal(normalizeSettings({holdPlacement:'width'}).holdPlacement,'width');
});
test('local mode creates a separate supply above each peeled component and closes the bottle while moving',()=>{
 const m=mask('skin'),pieces=piecesByStage.skin,s=new Sand({random:rng()});s.setMask(m);const c=new HoldCascade(s,{...DEFAULTS,holdPlacement:'local',pieces});assert.equal(c.bands.length,pieces.length);
 for(let i=0;i<pieces.length;i++){const b=c.bands[i],p=pieces[i].bounds;assert.ok(b.x0<=p.x&&b.x1>=p.x+p.w-1);if(p.y>80)assert.ok(b.y<=p.y-45);}
 const b=c.bands[1],progress=(b.clock+b.travel*.5)/c.units;c.pour(progress,0);const count=s.emitted;assert.equal(c.sourcePose(progress).flow,0);c.pour((b.clock+b.travel*.8)/c.units,0);assert.equal(s.emitted,count);
});
test('both targeted placements coat every exact mask, without premature painting or material duplication',()=>{
 for(const placement of ['width','local'])for(const level of levels)for(const stage of level.stages){const s=new Sand({random:rng()});s.setMask(mask(stage.id));const c=new HoldCascade(s,{...DEFAULTS,holdDensity:.5,holdRows:2,holdPlacement:placement,pieces:piecesByStage[stage.id]});c.pour(1,0);for(let n=0;n<30;n++)c.step(1/30,false,false);assert.equal(s.coverage,0);
  const total=s.emitted;for(let n=0;n<330;n++){c.step(1/30,true,false);for(let i=0;i<s.count;i++)if(s.state[i]===FREE&&s.y[i]>=800){s.state[i]=LOST;s.lost++;}}
  assert.equal(s.coverage,1,placement+':'+stage.id);assert.equal(s.emitted,total);const stats=s.stats();assert.equal(stats.air+stats.free+stats.bound+stats.lost,total);
 }
});
