import test from 'node:test';import assert from 'node:assert/strict';import {supplyPlan,supplyPose,supplyQuota,supplyDose,SUPPLIES} from '../src/supply.js';import {PaperMotion} from '../src/paper-motion.js';import {Sand,FREE,MAX_HEAP_HEIGHT} from '../src/sand.js';import {DEFAULTS} from '../src/settings.js';import {levels} from '../src/levels.js';import {PNG} from 'pngjs';import {readFileSync} from 'node:fs';
function mask(id){const data=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url))).data;return Uint8Array.from({length:480000},(_,i)=>data[i*4+3]>80?1:0)}
test('all masks support bounded supply positions and monotone exact quotas in all three modes',()=>{
 for(const level of levels)for(const stage of level.stages)for(const supply of Object.keys(SUPPLIES)){
  const m=mask(stage.id),plan=supplyPlan(stage.pour,m,null,stage.area/25,{supply});let quota=0;
  for(let i=0;i<=100;i++){const p=i/100,pose=supplyPose(plan,p),q=supplyQuota(plan,p);assert.ok(Number.isFinite(pose.x+pose.y));assert.ok(pose.x>=20&&pose.x<=580&&pose.y>=20&&pose.y<=740,stage.id);assert.ok(q>=quota-1e-9&&q<=1);if(!pose.flow)assert.equal(q,Math.floor(p*plan.spots.length)/plan.spots.length);quota=q;}
  assert.equal(quota,1);if(stage.area<7500)assert.equal(plan.spots.length,1);
 }
});
test('final background receives a larger supply above the figure instead of being buried at a corner',()=>{
 const stage=levels[0].stages.at(-1),s=new Sand();s.setMask(mask(stage.id));const plan=supplyPlan(stage.pour,s.mask,s.bound,s.targetCount,{...DEFAULTS,supply:'generous'});assert.equal(plan.spots[0].x,300);assert.ok(plan.spots[0].y<200);assert.ok(supplyDose(s.targetCount,DEFAULTS,s.capacity)>30000);
 const islands=supplyPlan(stage.pour,s.mask,s.bound,s.targetCount,{...DEFAULTS,supply:'islands'});assert.equal(islands.spots.length,3);assert.ok(islands.spots[2].x-islands.spots[0].x>100);
});
test('paper spring remains bounded and returns flat at both 30 and 60 FPS',()=>{
 for(const rate of [30,60]){const p=new PaperMotion();p.begin({x:0,y:300});p.move({x:400,y:600});for(let i=0;i<rate*4;i++){const q=p.step(1/rate,'hands',{dx:0,dy:0,load:0},false);assert.ok(Math.abs(q.x)<=.17&&Math.abs(q.y)<=.21&&q.cup<=.13);}p.end();for(let i=0;i<rate*4;i++)p.step(1/rate,'hands',{dx:0,dy:0,load:0},false);assert.ok(Math.abs(p.x)+Math.abs(p.y)+Math.abs(p.cup)<1e-5);}
});
test('manual paper tilt moves actual material downhill while still paper does not invent momentum',()=>{
 const make=()=>{const s=new Sand();s.emit(300,400,1,{spread:0,height:0});s.state[0]=FREE;s.z[0]=2;return s;},flat=make(),tilted=make();for(let i=0;i<120;i++){flat.step(1/60);tilted.step(1/60,{tiltX:.13,tiltY:.15});}assert.ok(tilted.x[0]-flat.x[0]>10);assert.ok(tilted.y[0]-flat.y[0]>10);assert.equal(flat.emitted,1);assert.equal(tilted.emitted,1);
});
test('the abundant heap has a visible physical crown and cannot exceed its height guard',()=>{
 let seed=4;const s=new Sand({random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});s.emit(300,200,28000,{spread:4,fan:40,height:142});for(let i=0;i<180;i++)s.step(1/60);assert.ok(s.stats().maxMoundHeight>20,s.stats().maxMoundHeight);assert.ok(s.stats().maxMoundHeight<=MAX_HEAP_HEIGHT);assert.equal(s.emitted,28000);
});

test('automatic supply chooses a curtain for large backgrounds and one above-target pile for tiny details',()=>{
 const large=supplyPlan({x:480,y:119},null,null,11000,{supply:'auto'});assert.equal(large.kind,'curtain');
 const stage=levels[0].stages.at(-1),m=mask(stage.id),background=supplyPlan(stage.pour,m,null,stage.area/25,{supply:'auto'});assert.equal(background.kind,'curtain');assert.equal(background.spots.length,2);
 const mouth=supplyPlan({x:312,y:420},null,null,24,{supply:'auto'});assert.equal(mouth.spots.length,1);assert.ok(mouth.spots[0].y<350);
});

test('tilt pours scale down for small details and keep a full single pile for wide targets',()=>{
 const tilt={...DEFAULTS,controlMode:'tilt'},brush={...DEFAULTS,controlMode:'brush'};
 assert.ok(supplyDose(24,tilt,48000)<supplyDose(24,brush,48000)*.4);
 assert.equal(supplyDose(11000,tilt,48000),supplyDose(11000,{...brush,supply:'generous'},48000));
});

test('every tilt pour and refill keeps one fixed source for small and wide targets',()=>{
 const target={x:430,y:620},tilt={...DEFAULTS,controlMode:'tilt'};
 for(const area of [24,3200,11000])for(const supply of ['auto',...Object.keys(SUPPLIES)])for(const refill of [false,true]){
  const plan=supplyPlan(target,null,null,area,{...tilt,supply,refill});
  assert.equal(plan.spots.length,1);
  assert.deepEqual(plan.spots[0],{x:area>9000&&!refill?300:430,y:area<300?530:560});
  for(const p of [0,.13,.45,.86,1]){
   assert.deepEqual(supplyPose(plan,p),{...plan.spots[0],flow:1,spot:0});
   assert.equal(supplyQuota(plan,p),p);
  }
 }
});

test('a refill for a low unfinished area moves the supply down instead of repeating the original top band',()=>{
 const m=new Uint8Array(480000);for(let y=600;y<800;y++)for(let x=0;x<600;x++)m[y*600+x]=1;
 const p=supplyPlan({x:300,y:740},m,null,11000,{supply:'auto',refill:true});assert.equal(p.kind,'curtain');assert.ok(p.spots.every(s=>s.y>=600&&s.y<740));
});
