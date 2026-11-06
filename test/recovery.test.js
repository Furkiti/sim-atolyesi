import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {Recovery,RECOVERY_STYLES,startRecovery,stepRecovery,transferPacket} from '../src/recovery.js';import {DEFAULTS,normalizeSettings,loadSettings,saveSettings} from '../src/settings.js';import {AtelierScene} from '../src/scene.js';import {FUNNEL,stepFunnel} from '../src/funnel.js';
const color=new T.Color('#bc1234');
test('collection modes persist without changing the established preset or hold preferences',()=>{
 assert.equal(DEFAULTS.recovery,'classic');let value;const storage={getItem:()=>value,setItem:(k,v)=>value=v};for(const recovery of RECOVERY_STYLES){const s=normalizeSettings({recovery,holdDensity:7,holdPlacement:'local'});saveSettings(storage,s);const saved=loadSettings(storage);assert.equal(saved.recovery,recovery);assert.equal(saved.holdDensity,7);assert.equal(saved.holdPlacement,'local');}assert.equal(normalizeSettings({recovery:'bad'}).recovery,'classic');
});
test('stored glitter and final fold glitter reach the same jar with exact finite mass at 1x and 4x',()=>{
 for(const style of ['trough','rills','bowl'])for(const speed of [1,4]){
  const model=new Recovery(style),packets=[];model.deposit(43000);let total=43000,maxPackets=0,gotEarlyJar=false;
  for(let frame=0;frame<1200;frame++){
   const dt=speed/120;if(frame===240){model.deposit(17000);total+=17000;model.open();}
   model.step(dt,p=>packets.push(transferPacket(p,style,color)));maxPackets=Math.max(maxPackets,packets.length);
   for(let i=packets.length-1;i>=0;i--)if(stepRecovery(packets[i],dt)){model.catch(packets[i].mass);packets.splice(i,1);}
   assert.equal(model.stored+model.inTransit+model.jar,total);if(frame===239)gotEarlyJar=model.jar>0;
  }
  assert.equal(gotEarlyJar,style==='rills');assert.equal(model.pending,0);assert.equal(model.jar,60000);assert.equal(model.deposited,60000);assert.ok(maxPackets<6000);
 }
});
test('all four paper exits reach collection while side/top routes travel behind the paper or along its outside',()=>{
 for(const edge of ['bottom','top','left','right']){const p={edge,x:edge==='left'?-302:edge==='right'?302:30,y:edge==='top'?402:edge==='bottom'?-402:50,z:30,seed:.36};startRecovery(p);let landed=false;
  for(let n=0;n<150&&!landed;n++){landed=stepRecovery(p,1/60);assert.ok(Number.isFinite(p.x+p.y+p.z));if(edge!=='bottom'&&p.routeAge/p.routeDuration>.2&&p.routeAge/p.routeDuration<.82){assert.ok(Math.abs(p.x)>330);assert.ok(p.z<0);}}
  assert.ok(landed);assert.equal(p.y,-455);assert.equal(p.z,20);
 }
});
test('a reservoir does not emit before its gate opens and reset never carries material into the next colour',()=>{
 const m=new Recovery('trough');m.deposit(3000);for(let n=0;n<120;n++)m.step(1/60,()=>assert.fail('closed gate'));assert.equal(m.stored,3000);m.open();for(let n=0;n<20;n++)m.step(1/60,()=>assert.fail('gate animation'));m.reset();assert.equal(m.pending+m.jar,0);assert.equal(m.deposited,0);assert.equal(m.opened,false);
});
test('optimized funnel trajectories and capture match the recorded v23 paths',async()=>{
 const {readFileSync}=await import('node:fs');const reference=JSON.parse(readFileSync(new URL('fixtures/funnel-v23.json',import.meta.url)));
 for(const path of reference.paths){const p={...path.input};let frame=0;for(const sample of path.samples){let caught=false;while(frame<sample.frame){caught=stepFunnel(p,reference.dt);frame++;}assert.equal(caught,sample.caught);assert.ok(Math.abs(p.x-sample.x)+Math.abs(p.y-sample.y)+Math.abs(p.z-sample.z)<1e-7);}}
});
test('many catches update total material immediately while retaining at most 2200 visible top samples',()=>{
 const scene={collectedCount:0};for(let i=0;i<48000;i++)AtelierScene.prototype.catchGrain.call(scene,{seed:(i*.31)%1,color,mass:2});assert.equal(scene.collectedCount,96000);assert.equal(scene.catchSamples.length,2200);assert.equal(scene.collectedDirty,true);
});
