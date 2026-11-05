import test from 'node:test';import assert from 'node:assert/strict';
import {LevelProgress,PROGRESS_KEY} from '../src/level-progress.js';import {ExhibitionRail} from '../src/exhibition.js';import {FUNNEL,stepFunnel,funnelLocal,funnelWorld} from '../src/funnel.js';import {CleanupCycle,residuePlan} from '../src/cleanup.js';import {Sand,FREE,LOST,BOUND} from '../src/sand.js';import {bentPoint,surfaceVelocity} from '../src/interaction.js';import {DEFAULTS,normalizeSettings} from '../src/settings.js';
const rng=n=>()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296);
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)}};
test('only the immediate next level unlocks; reloads and legacy gallery keep earned progress',()=>{
 const saved=memory(),ids=['a','b','c','d'],p=new LevelProgress(saved,ids);assert.equal(p.canPlay('a'),true);assert.equal(p.canPlay('b'),false);assert.equal(p.complete('c'),false);p.complete('a');assert.equal(p.canPlay('b'),true);assert.equal(p.canPlay('c'),false);
 const q=new LevelProgress(saved,ids);assert.equal(q.frontier,1);q.complete('b');assert.equal(q.canPlay('c'),true);assert.equal(q.canPlay('d'),false);
 const migrated=new LevelProgress(memory(),ids,[{id:'a'},{id:'c'}]);assert.equal(migrated.canPlay('c'),false);migrated.complete('b');assert.equal(migrated.canPlay('d'),true);
});
test('corrupt or full progress storage cannot unlock arbitrary levels or break play',()=>{
 const p=new LevelProgress({getItem:()=>JSON.stringify(['bogus',123]),setItem:()=>{throw Error('full')}},['a','b']);assert.equal(p.frontier,0);assert.equal(p.complete('a'),true);assert.equal(p.canPlay('b'),true);assert.equal(p.canPlay('bogus'),false);
 assert.equal(new LevelProgress({getItem:()=>'{broken'},['a','b']).frontier,0);
});
test('a short swipe advances one painting, a small tap does not, and cancel snaps back',()=>{
 const rail=new ExhibitionRail(6);rail.begin(200,0);rail.move(160,300,160);assert.ok(rail.focus<.5);assert.equal(rail.end(),1);for(let n=0;n<90;n++)rail.step(1/60);rail.begin(200,200);rail.move(195,300,220);assert.equal(rail.end(),1);
 rail.begin(200,300);rail.move(185,300,320);assert.equal(rail.end(),2);rail.begin(200,400);rail.move(70,300,500);assert.equal(rail.end(true),2);rail.select(5);rail.begin(200);rail.move(0,300);assert.equal(rail.end(),5);
});
test('residue amounts and locations vary per colour instead of a fixed fine-powder quota',()=>{
 const random=rng(912),plans=Array.from({length:30},()=>residuePlan(random,10500));assert.ok(Math.max(...plans.map(p=>p.budget))-Math.min(...plans.map(p=>p.budget))>900);assert.ok(Math.max(...plans.map(p=>p.centerY))-Math.min(...plans.map(p=>p.centerY))>400);assert.ok(plans.every(p=>p.budget>=55&&p.budget<=1500));assert.equal(normalizeSettings({extraFinish:false}).extraFinish,false);assert.equal(DEFAULTS.extraFinish,true);
});
test('grains meet the cone, travel through its narrow throat and land inside the small jar',()=>{
 const p={...funnelWorld({x:80,y:0,z:70}),vx:-15,vy:-20,vz:-50,seed:.31};let caught=false,sawSlide=false,sawJar=false;
 for(let n=0;n<240&&!caught;n++){caught=stepFunnel(p,1/60);sawSlide ||=p.funnelStage==='slide';sawJar ||=p.funnelStage==='jar';assert.ok(Number.isFinite(p.x+p.y+p.z));}
 assert.ok(sawSlide&&sawJar&&caught);assert.ok(Math.abs(funnelLocal(p).z-FUNNEL.bottom)<1e-8);assert.ok(Math.hypot(funnelLocal(p).x,funnelLocal(p).y)<FUNNEL.jarRadius);
 const outside={x:250,y:FUNNEL.centerY,z:145,vx:0,vy:0,vz:0,seed:.3};for(let n=0;n<100;n++)assert.equal(stepFunnel(outside,1/60),false);assert.equal(outside.funnelStage,undefined);
});
test('optional last taps release real held-back material after the fold without altering glued grains',()=>{
 const random=rng(929),s=new Sand({capacity:500,random});s.emit(300,350,400,{spread:220,height:0});for(let i=0;i<s.count;i++){s.state[i]=FREE;s.z[i]=3;}s.state[0]=BOUND;const coat=s.bound.slice(),total=s.emitted,cycle=new CleanupCycle(s,[],random),falling=[];let caught=0,escaped=0,sawTap=false,maxLate=0;
 assert.ok(cycle.heldCount>0&&cycle.heldCount<400);
 for(let f=0;f<1500&&!cycle.done;f++){
  const pose=cycle.pose;s.step(1/60,{shaking:true,bend:pose.bend,tilt:pose.pitch,pinned:cycle.pinned});cycle.advance(1/60,falling.length);sawTap ||=cycle.tapping;maxLate=Math.max(maxLate,cycle.releasedCount);
  for(let i=0;i<s.count;i++)if(s.state[i]===FREE&&s.cell(s.x[i],s.y[i])<0){const q=bentPoint(s.x[i]-300,-400,3+s.z[i],pose.bend,pose.pitch),v=surfaceVelocity(s.x[i]-300,s.vx[i],Math.max(180,s.vy[i]),pose.bend,pose.pitch);falling.push({x:q.x,y:q.y,z:q.z+(pose.lift||0),vx:v.x,vy:v.y,vz:v.z-15,seed:s.seed[i]});s.state[i]=LOST;s.lost++;}
  for(let i=falling.length-1;i>=0;i--){if(stepFunnel(falling[i],1/60)){caught++;falling.splice(i,1);}else if(falling[i].z<-1500){escaped++;falling.splice(i,1);}}
 }
 assert.ok(cycle.done);assert.ok(sawTap);assert.equal(maxLate,cycle.heldCount);assert.deepEqual(s.bound,coat);assert.equal(s.state[0],BOUND);assert.equal(s.emitted,total);assert.equal(caught+escaped,total-1);assert.ok(caught/(total-1)>.8,`${caught} caught, ${escaped} missed`);
});

test('small peel sections move quickly while broad curls retain their deliberate pace',async()=>{
 const {peelSeconds,peelGap}=await import('../src/peel.js');assert.ok(peelSeconds(150)<.5);assert.ok(peelSeconds(1400)<1);assert.ok(peelSeconds(18000)>2.4);assert.ok(peelGap({area:150})<.1);assert.ok(peelGap({area:18000})>.2);
});
