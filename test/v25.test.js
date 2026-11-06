import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {Sand,FREE,BOUND} from '../src/sand.js';import {HoldCascade} from '../src/hold-cascade.js';import {startTable,stepTable,TABLE_Z,tableHold,tableFade,tableOpacity} from '../src/table-spill.js';import {AtelierScene} from '../src/scene.js';import {Recovery} from '../src/recovery.js';
const rng=()=>{let n=911;return()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)};
test('the moving supply depletes only into real bound grains over adhesive, with no extra loss or emission',()=>{
 const s=new Sand({random:rng()}),mask=new Uint8Array(480000);for(let y=140;y<420;y++)for(let x=210;x<390;x++)mask[y*600+x]=1;s.setMask(mask);const c=new HoldCascade(s,{holdDensity:5,holdGrainSize:1.7,holdPlacement:'sheet'});c.pour(1,0);const emitted=s.emitted;
 for(let n=0;n<30;n++)c.step(1/30,false,false);assert.equal(s.stats().bound,0);
 for(let n=0;n<330;n++)c.step(1/30,true,false);
 const st=s.stats(),primaries=c.routes.filter(r=>r.target&&s.state[r.i]===BOUND).length;assert.ok(c.adheredLayers>2500);assert.equal(st.bound,primaries+c.adheredLayers);assert.equal(st.air+st.free+st.bound,emitted);assert.equal(st.lost,0);assert.equal(s.emitted,emitted);assert.equal(s.coverage,1);
 for(let i=0;i<s.count;i++)if(s.state[i]===BOUND)assert.equal(s.onGlue(s.x[i],s.y[i]),true);for(let k=0;k<s.bound.length;k++)assert.ok(s.bound[k]<=c.layerCapacity[k]);
});
test('release freezes both the moving front and grains seating into the additional adhesive layer',()=>{
 const s=new Sand({random:rng()}),mask=new Uint8Array(480000);for(let y=150;y<250;y++)for(let x=200;x<400;x++)mask[y*600+x]=1;s.setMask(mask);const c=new HoldCascade(s,{holdDensity:5,holdGrainSize:1.7});c.pour(1,0);
 for(let n=0;n<300&&!c.pendingLayerCount;n++)c.step(1/60,true,false);assert.ok(c.pendingLayerCount>0);const positions=s.y.slice(),states=s.state.slice(),bound=s.stats().bound,pending=c.pendingLayerCount;
 for(let n=0;n<60;n++)c.step(1/60,false,false);assert.deepEqual(s.y,positions);assert.deepEqual(s.state,states);assert.equal(s.stats().bound,bound);assert.equal(c.pendingLayerCount,pending);
});
test('all paper exits land on the desk, stay there briefly and fade without falling through it',()=>{
 for(const edge of ['top','bottom','left','right'])for(const dt of [1/60,.04]){const p={x:edge==='left'?-304:edge==='right'?304:0,y:edge==='top'?404:-402,z:90,vx:edge==='left'?-45:edge==='right'?45:0,vy:edge==='top'?50:-100,vz:-25,seed:.43,edge};startTable(p);
  for(let n=0;n<200&&!p.tableRest;n++){assert.equal(stepTable(p,dt),false);assert.ok(p.z>=TABLE_Z);}assert.ok(p.tableRest);const landed={x:p.x,y:p.y,z:p.z};assert.equal(tableOpacity(0,p.seed),1);
  for(let n=0;n<Math.floor(tableHold(p.seed)/dt);n++){assert.equal(stepTable(p,dt),false);assert.equal(tableOpacity(p.tableAge,p.seed),1);}assert.deepEqual({x:p.x,y:p.y,z:p.z},landed);
  let last=1,done=false;for(let n=0;n<200&&!done;n++){done=stepTable(p,dt);const opacity=tableOpacity(p.tableAge,p.seed);assert.ok(opacity<=last);last=opacity;assert.deepEqual({x:p.x,y:p.y,z:p.z},landed);}assert.ok(done);assert.equal(last,0);
 }
});
test('settled desk grains upload once; waiting and fading update only the time uniform',()=>{
 const scene={scene:new T.Group(),paperGroup:new T.Group(),grainMaterial:new T.MeshStandardMaterial(),makeGrains:AtelierScene.prototype.makeGrains,ensureGrainCapacity:AtelierScene.prototype.ensureGrainCapacity,reserveTable:AtelierScene.prototype.reserveTable,settings:{controlMode:'hold',holdGrainSize:1.7}};AtelierScene.prototype.makeTable.call(scene);
 const p={x:24,y:-470,z:TABLE_Z,seed:.4,color:new T.Color('#e92727')};AtelierScene.prototype.landOnTable.call(scene,p);AtelierScene.prototype.syncTable.call(scene);assert.equal(scene.tablePool.count,1);assert.equal(scene.tableUploadBytes,84);const matrix=scene.tablePool.instanceMatrix.array.slice(),version=scene.tablePool.instanceMatrix.version;
 for(let n=0;n<60;n++){scene.tableTime+=1/60;AtelierScene.prototype.syncTable.call(scene);assert.equal(scene.tableUploadBytes,0);assert.equal(scene.tablePool.instanceMatrix.version,version);}assert.deepEqual(scene.tablePool.instanceMatrix.array,matrix);assert.equal(scene.tableUniform.value,scene.tableTime);assert.equal(scene.tablePool.material.depthWrite,true);
 scene.tableActive=0;AtelierScene.prototype.syncTable.call(scene);assert.equal(scene.tablePool.count,0);
});
test('switching an existing recovery batch to desk fade clears its mass once without putting it into the jar',()=>{
 const r=new Recovery('table'),packets=[];r.deposit(1500);for(let n=0;n<180;n++){r.step(1/60,p=>packets.push(p));for(const p of packets.splice(0))r.clear(p.mass);assert.equal(r.stored+r.inTransit+r.jar+r.cleared,r.deposited);}assert.equal(r.pending,0);assert.equal(r.jar,0);assert.equal(r.cleared,1500);
});
test('the lighter final bend preserves recorded v24 trajectories, including pinned and bound grains',async()=>{
 const {readFileSync}=await import('node:fs');const reference=JSON.parse(readFileSync(new URL('fixtures/drain-v24.json',import.meta.url))),s=new Sand({capacity:32});s.count=s.emitted=32;reference.initial.forEach((values,i)=>Object.entries(values).forEach(([key,value])=>s[key][i]=value));const pinned=Uint8Array.from(reference.pinned);let frame=0;
 for(const sample of reference.samples){while(frame<sample.frame){s.step(1/60,{shaking:true,bend:.8,tilt:.58,pinned});frame++;}sample.values.forEach((values,i)=>{for(const [key,value] of Object.entries(values))assert.ok(Math.abs(s[key][i]-value)<1e-6,`${frame}:${i}:${key}`);});}
});
