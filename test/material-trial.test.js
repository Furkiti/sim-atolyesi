import test from 'node:test';
import assert from 'node:assert/strict';
import {BOUND,FREE,W,H,Sand} from '../src/sand.js';
import {HoldCascade} from '../src/hold-cascade.js';
import {HOLD_MATERIALS} from '../src/hold-material.js';
import {normalizeSettings} from '../src/settings.js';
import {advanceTrial,createTrial,trialMetrics,trialMask} from '../src/material-trial.js';

test('hold experiments compare the same dose and freeze after the hand lifts',()=>{
 const mask=trialMask(),trials=Object.keys(HOLD_MATERIALS).map(material=>createTrial(material,mask,.5));
 const early=[];
 for(const trial of trials){
  advanceTrial(trial,216);
  early.push(trialMetrics(trial.sand));
  advanceTrial(trial,264);
  const released=trialMetrics(trial.sand);
  advanceTrial(trial,309);
  assert.deepEqual(trialMetrics(trial.sand),released);
  advanceTrial(trial,480);
  const {sand}=trial,m=trialMetrics(sand);
  assert.equal(m.bound+m.free,m.emitted);
  assert.ok(m.coverage>released.coverage);
  for(let i=0;i<sand.count;i++)if(sand.state[i]===BOUND)assert.ok(sand.onGlue(sand.x[i],sand.y[i]));
 }
 assert.equal(new Set(early.map(m=>m.emitted)).size,1);
 assert.equal(new Set(early.map(m=>m.bound)).size,3);
 assert.ok(early[2].q90>early[1].q90);
});

test('each point material can complete a small exact stencil and stays opt-in',()=>{
 const mask=new Uint8Array(W*H);
 for(let y=325;y<348;y++)for(let x=282;x<314;x++)mask[y*W+x]=1;
 for(const material of Object.keys(HOLD_MATERIALS)){
  const sand=new Sand({random:()=>.43});
  sand.setMask(mask);
  const settings={holdDensity:.5,holdMaterial:material,holdExperiment:'point'};
  const flow=new HoldCascade(sand,settings);
  flow.pour(1,0);
  for(let frame=0;frame<500&&sand.coverage<1;frame++)flow.step(1/60,true,false,{point:{x:300,y:335}});
  assert.equal(sand.coverage,1);
  assert.ok(sand.state.slice(0,sand.count).includes(FREE));
  assert.equal(new HoldCascade(sand,{...settings,holdExperiment:'aim'}).material,'classic');
 }
 assert.equal(normalizeSettings({holdMaterial:'unknown'}).holdMaterial,'classic');
 assert.equal(normalizeSettings({holdMaterial:'avalanche',posterShine:'facets'}).holdMaterial,'avalanche');
 assert.equal(normalizeSettings({posterShine:'facets'}).posterShine,'facets');
});
