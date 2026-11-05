import test from 'node:test';import assert from 'node:assert/strict';import {HoldCascade} from '../src/hold-cascade.js';import {Sand,FREE,BOUND,LOST} from '../src/sand.js';import {normalizeSettings,DEFAULTS as CURRENT_DEFAULTS} from '../src/settings.js';import {levels} from '../src/levels.js';import {PNG} from 'pngjs';import {readFileSync} from 'node:fs';
const DEFAULTS={...CURRENT_DEFAULTS,holdDensity:1,holdGrainSize:1,holdPlacement:'sheet'};
function rng(){let seed=631;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function mask(id){const data=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url))).data;return Uint8Array.from({length:480000},(_,i)=>data[i*4+3]>80?1:0)}
function leave(s){for(let i=0;i<s.count;i++)if(s.state[i]===FREE&&s.y[i]>=800){s.state[i]=LOST;s.lost++;}}
test('hold mode survives settings normalization',()=>assert.equal(normalizeSettings({controlMode:'hold'}).controlMode,'hold'));
test('the full finite supply forms a horizontal top strip, never paints before holding, and pauses exactly on release',()=>{
 const s=new Sand({random:rng()});s.setMask(mask('berry-pink'));const c=new HoldCascade(s,DEFAULTS);c.pour(1,0);const total=s.emitted;
 for(let i=0;i<60;i++)c.step(1/60,false);assert.equal(s.coverage,0);assert.ok(Math.max(...s.y.slice(0,s.count))<31);assert.ok(Math.min(...s.x.slice(0,s.count))<1&&Math.max(...s.x.slice(0,s.count))>599);
 for(let i=0;i<160;i++)c.step(1/60,true);assert.ok(s.coverage>.05&&s.coverage<1);const y=s.y.slice(0,s.count),coverage=s.coverage,elapsed=c.elapsed;
 for(let i=0;i<90;i++)c.step(1/60,false);assert.equal(s.coverage,coverage);assert.equal(c.elapsed,elapsed);assert.deepEqual(s.y.slice(0,s.count),y);assert.ok(c.press<.001);assert.equal(s.emitted,total);
});
test('every colour in every level fills completely from travelling packets, including one-pixel mask edges',()=>{
 for(const level of levels)for(const stage of level.stages){
  const s=new Sand({random:rng()}),m=mask(stage.id);s.setMask(m);const c=new HoldCascade(s,{...DEFAULTS,holdDensity:.5});c.pour(1,0);for(let f=0;f<30;f++)c.step(1/30,false);const emitted=s.emitted;
  for(let f=0;f<330;f++){c.step(1/30,true);leave(s);}assert.equal(s.coverage,1,stage.id);const st=s.stats();assert.equal(st.air+st.free+st.bound+st.lost,emitted,stage.id);assert.equal(s.emitted,emitted);assert.equal(st.free,c.retainedCount,stage.id);assert.ok(c.retainedCount>150&&c.retainedCount<=1500,stage.id);
  for(let i=0;i<s.count;i++)if(s.state[i]===BOUND){assert.equal(s.onGlue(s.x[i],s.y[i]),true);assert.equal(s.pressed[i],0);}
 }
});
test('a partially baked colour retains its coat and the new strip supplies only missing coating packets',()=>{
 const s=new Sand({random:rng()}),m=new Uint8Array(480000);for(let y=200;y<220;y++)for(let x=200;x<220;x++)m[y*600+x]=1;s.setMask(m);s.emit(202,202,1,{spread:0,height:0});s.state[0]=FREE;s.z[0]=2;s.bind(0,true);const prior=s.coverage,c=new HoldCascade(s,DEFAULTS);assert.equal(c.routes.filter(r=>r.target).length,15);c.pour(1,0);for(let f=0;f<30;f++)c.step(1/30,false);assert.equal(s.coverage,prior);for(let f=0;f<330;f++)c.step(1/30,true);assert.equal(s.coverage,1);
});
test('directed flow stays stable at 30 and 60 FPS and the paper bends only while held',()=>{
 const run=hz=>{const s=new Sand({random:rng()});s.setMask(mask('mouth'));const c=new HoldCascade(s,DEFAULTS);c.pour(1,0);for(let i=0;i<hz;i++)c.step(1/hz,false);for(let i=0;i<hz*3;i++)c.step(1/hz,true);return {s,c};};
 const a=run(30),b=run(60);assert.ok(Math.abs(a.s.coverage-b.s.coverage)<.001);assert.ok(a.c.pose.pitch>.3&&a.c.pose.cup>.3);const elapsed=a.c.elapsed;for(let i=0;i<60;i++)a.c.step(1/60,false);assert.ok(a.c.pose.pitch<.001);assert.equal(a.c.elapsed,elapsed);
});


test('fine scattered dust stays on the sheet, then the normal end fold drains it without changing the coat',()=>{
 const s=new Sand({random:rng()});s.setMask(mask('berry-pink'));const c=new HoldCascade(s,DEFAULTS);c.pour(1,0);for(let f=0;f<30;f++)c.step(1/30,false);for(let f=0;f<330;f++){c.step(1/30,true);leave(s);}
 assert.equal(s.coverage,1);assert.ok(c.retainedCount>150&&c.retainedCount<=1500);const positions=c.retainedIndices.map(i=>[s.x[i],s.y[i],s.z[i]]),count=s.emitted;
 for(let f=0;f<90;f++){c.step(1/30,true);leave(s);}assert.deepEqual(c.retainedIndices.map(i=>[s.x[i],s.y[i],s.z[i]]),positions);
 for(let f=0;f<480;f++){s.step(1/60,{shaking:true,bend:Math.min(1,f/40),tilt:.58*Math.min(1,Math.max(0,(f-40)/40))});leave(s);}
 assert.equal(s.hasLoose(),false);assert.equal(c.retainedCount,0);assert.equal(s.coverage,1);const stats=s.stats();assert.equal(stats.bound+stats.lost,count);
});

test('a target packet settles at the contact point before binding, and release freezes that contact too',()=>{
 const s=new Sand({random:rng()}),m=new Uint8Array(480000);m[100*600+300]=1;s.setMask(m);const c=new HoldCascade(s,DEFAULTS);c.pour(1,0);for(let f=0;f<30;f++)c.step(1/30,false);const target=c.routes.find(r=>r.target);
 for(let f=0;f<200&&target.landing===undefined;f++)c.step(1/60,true);assert.equal(s.coverage,0);assert.equal(s.y[target.i],100.5);assert.ok(s.z[target.i]>2.2);const z=s.z[target.i];
 for(let f=0;f<60;f++)c.step(1/60,false);assert.equal(s.coverage,0);assert.equal(s.z[target.i],z);
 for(let f=0;f<20;f++)c.step(1/60,true);assert.equal(s.coverage,1);assert.equal(s.state[target.i],BOUND);assert.ok(s.z[target.i]<3);
});


test('hold density, piece size and row settings persist independently with useful upper bounds',()=>{
 const settings=normalizeSettings({controlMode:'hold',holdDensity:100,holdGrainSize:20,holdRows:2,grainSize:1});assert.equal(settings.holdDensity,8);assert.equal(settings.holdGrainSize,4);assert.equal(settings.holdRows,2);assert.equal(settings.grainSize,1);assert.equal(normalizeSettings({holdRows:7}).holdRows,1);
 const roundTrip=normalizeSettings(JSON.parse(JSON.stringify(settings)));assert.deepEqual(roundTrip,settings);
});

test('two rows are poured as separate horizontal passes, without emitting during the move between them',()=>{
 const s=new Sand({random:rng()});s.setMask(mask('berry-pink'));const c=new HoldCascade(s,{...DEFAULTS,holdRows:2,holdDensity:2});assert.equal(c.duration,6);c.pour(.5,0);const first=s.emitted;c.pour(.53,0);assert.equal(s.emitted,first);assert.equal(c.sourcePose(.53).flow,0);assert.ok(c.sourcePose(.53).y>22&&c.sourcePose(.53).y<94);c.pour(1,0);
 for(let f=0;f<30;f++)c.step(1/30,false);assert.equal(s.coverage,0);for(const row of [0,1]){const points=c.routes.filter(r=>!r.target&&r.row===row);assert.ok(points.length>10000);assert.ok(Math.min(...points.map(r=>s.x[r.i]))<1);assert.ok(Math.max(...points.map(r=>s.x[r.i]))>599);for(const r of points)assert.ok(s.y[r.i]>=row*72&&s.y[r.i]<row*72+31);}
 assert.equal(s.emitted,c.routes.length);
});

test('maximum density with two rows still covers the entire paper and conserves over 100000 packets',()=>{
 const s=new Sand({random:rng()}),mask=new Uint8Array(480000).fill(1);s.setMask(mask);const c=new HoldCascade(s,{...DEFAULTS,holdRows:2,holdDensity:8});assert.equal(c.routes.length,103200);assert.ok(s.capacity>=103200);c.pour(1,0);for(let f=0;f<30;f++)c.step(1/30,false);
 for(let f=0;f<330;f++){c.step(1/30,true);leave(s);}assert.equal(s.coverage,1);assert.equal(s.stats().free,c.retainedCount);assert.ok(c.retainedCount>300&&c.retainedCount<=1500);const st=s.stats();assert.equal(st.air+st.free+st.bound+st.lost,s.emitted);assert.equal(s.emitted,103200);
});

test('growing particle storage preserves its finite material, mask and contact state',()=>{
 const s=new Sand({capacity:2,random:rng()});s.emit(100,100,2,{spread:0,height:0});s.state[0]=FREE;s.z[0]=3;s.pressed[0]=1;s.dust[0]=1;s.roll[1]=7;s.previousY[1]=97;s.reserve(10);assert.equal(s.capacity,10);assert.equal(s.count,2);assert.equal(s.emitted,2);assert.equal(s.state[0],FREE);assert.equal(s.pressed[0],1);assert.equal(s.dust[0],1);assert.equal(s.roll[1],7);assert.equal(s.previousY[1],97);s.emit(200,200,8);assert.equal(s.emitted,10);assert.equal(s.count,10);
});


test('residue changes each pour and spreads across the paper instead of forming fixed heaps',()=>{
 const random=rng(),sample=()=>{const s=new Sand({random});const c=new HoldCascade(s,DEFAULTS);c.pour(1,0);return c.routes.filter(r=>r.rest).map(r=>r.rest);};
 const first=sample(),second=sample();assert.notDeepEqual(first,second);assert.ok(first.length>150&&first.length<=1500);const bins=new Map();
 for(const p of first){const key=Math.floor(p.x/20)+':'+Math.floor(p.y/20);bins.set(key,(bins.get(key)||0)+1);assert.ok(p.z>=2&&p.z<=2.5);}
 assert.ok(Math.max(...first.map(p=>p.x))-Math.min(...first.map(p=>p.x))>550);assert.ok(Math.max(...first.map(p=>p.y))-Math.min(...first.map(p=>p.y))>600);assert.ok(Math.max(...bins.values())<=7);assert.ok(bins.size>first.length*.65);
});
