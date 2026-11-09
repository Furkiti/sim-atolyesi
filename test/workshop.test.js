import test from 'node:test';
import assert from 'node:assert/strict';
import {CartridgeRack,cartridgeChoices} from '../src/workshop.js';
import {Sand,FREE,BOUND} from '../src/sand.js';
import {gameSteps} from '../src/game-clock.js';
import {HoldCascade} from '../src/hold-cascade.js';

test('only the matching cartridge fires and the other slot survives for the next color',()=>{
  const rack=new CartridgeRack();
  assert.equal(rack.load(0,1),true);
  assert.equal(rack.begin(0),false);
  assert.equal(rack.load(1,0),true);
  assert.equal(rack.begin(0),true);
  assert.equal(rack.load(1,2),false);
  rack.remove(1);
  assert.deepEqual(rack.slots,[1,0]);
  rack.finish();
  assert.deepEqual(rack.slots,[1,null]);
  assert.equal(rack.begin(1),true);
  const stages=[{color:'#ffff00'},{color:'#888888'},{color:'#000000'}];
  assert.deepEqual(cartridgeChoices(stages,2),[2,1,0]);
});

test('tilt consumes extra real contact grains without double counting coverage',()=>{
  const sand=new Sand({capacity:12,random:()=>.5});
  const mask=new Uint8Array(480000);
  for(let y=300;y<305;y++)for(let x=200;x<205;x++)mask[y*600+x]=1;
  sand.setMask(mask);
  sand.emit(202,302,12,{spread:0,height:0,fan:0});
  sand.state.fill(FREE);sand.z.fill(2);sand.vz.fill(0);
  for(let frame=0;frame<30;frame++)sand.step(1/60,{contactAdhesion:true,tiltLayers:true});
  assert.equal(sand.coverage,1);
  assert.equal(sand.stats().bound,10);
  assert.equal(sand.stats().free,2);
  for(let i=0;i<sand.count;i++){
    if(sand.state[i]===BOUND)assert.ok(sand.onGlue(sand.x[i],sand.y[i]));
  }
  sand.compact({archiveBound:true});
  assert.equal(sand.count,2);
  assert.equal(sand.coverage,1);
  assert.equal(sand.stats().bound,10);
  assert.equal(sand.emit(205,302,10),10);
  assert.equal(sand.stats().bound+sand.stats().free+sand.stats().air,sand.emitted);
});

test('directional hold favors one side and still reaches the exact mask without more material',()=>{
  const sand=new Sand();
  const mask=new Uint8Array(480000);
  for(let y=245;y<250;y++)for(let x=30;x<570;x++)mask[y*600+x]=1;
  sand.setMask(mask);
  const flow=new HoldCascade(sand,{holdDensity:.5});
  flow.pour(1,0);
  for(let frame=0;frame<145;frame++)flow.step(1/60,true,false,{aim:20});
  let left=0,right=0;
  for(const route of flow.routes){
    if(!route.target||sand.state[route.i]!==BOUND)continue;
    if(route.x<150)left++;
    if(route.x>450)right++;
  }
  assert.ok(left>right);
  for(let frame=0;frame<720;frame++)flow.step(1/60,true,false,{aim:20});
  assert.equal(sand.coverage,1);
  assert.equal(sand.emitted,flow.routes.length);
});

test('tilt bounds catch-up work after a slow frame while keeping normal speed',()=>{
  assert.deepEqual(gameSteps(1/60,4,3),gameSteps(1/60,4));
  const capped=gameSteps(.06,4,3);
  assert.equal(capped.count,3);
  assert.ok(capped.dt<=.04);
});

test('point hold flows above and below a middle ribbon, pauses, and coats only by real contact',()=>{
  let seed=47;
  const sand=new Sand({random:()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32)});
  const mask=new Uint8Array(480000);
  for(const [left,top] of [[150,210],[440,545]]){
    for(let y=top;y<top+32;y++)for(let x=left;x<left+36;x++)mask[y*600+x]=1;
  }
  sand.setMask(mask);
  const flow=new HoldCascade(sand,{holdExperiment:'point',holdPointPlacement:'middle',holdDensity:.5,holdRows:2});
  assert.equal(flow.bands.length,1);
  assert.equal(flow.sourcePose(.1).y,flow.sourcePose(.9).y);
  assert.ok(flow.bands[0].y>350&&flow.bands[0].y<430);
  flow.pour(1,0);
  for(let frame=0;frame<45;frame++)flow.step(1/60,false,false);
  assert.equal(sand.coverage,0);
  const loose=flow.routes.find(route=>!route.target&&route.x>280&&route.x<310);
  const first={x:168,y:226},second={x:458,y:561},startY=sand.y[loose.i];
  for(let frame=0;frame<100;frame++)flow.step(1/60,true,false,{point:first});
  assert.ok(sand.x[loose.i]<270&&sand.y[loose.i]<startY-70);
  for(let frame=0;frame<140;frame++)flow.step(1/60,true,false,{point:first});
  assert.ok(sand.coverage>.45&&sand.coverage<.6);
  flow.step(1/60,false,false,{point:second});
  const paused=sand.y.slice(0,sand.count),revision=flow.revision;
  for(let frame=0;frame<60;frame++)flow.step(1/60,false,false,{point:second});
  assert.deepEqual(sand.y.slice(0,sand.count),paused);
  assert.equal(flow.revision,revision);
  for(let frame=0;frame<270;frame++)flow.step(1/60,true,false,{point:second});
  assert.equal(sand.coverage,1);
  assert.ok(sand.y[loose.i]>startY+80||sand.state[loose.i]===BOUND);
  const stats=sand.stats();
  assert.equal(stats.bound+stats.free,stats.emitted);
  for(let i=0;i<sand.count;i++)if(sand.state[i]===BOUND)assert.ok(sand.onGlue(sand.x[i],sand.y[i]));
});
