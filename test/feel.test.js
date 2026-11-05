import test from 'node:test';import assert from 'node:assert/strict';
import {Sand,FREE,BOUND} from '../src/sand.js';import {FEELS,brushRadius,feelSettings,pourFraction} from '../src/feel.js';import {normalizeSettings,DEFAULTS,loadSettings,saveSettings} from '../src/settings.js';
const rng=()=>{let seed=53;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}};
function loose(profile){const s=new Sand({capacity:1500,random:rng()});s.setBehavior(FEELS[profile]);s.emit(250,350,1000,{spread:10,height:0});s.state.fill(FREE);s.z.fill(2);return s}
function meanX(s){return s.x.subarray(0,s.count).reduce((a,b)=>a+b,0)/s.count}
test('three material presets give distinct transport and settling without creating glitter',()=>{
 const shifts=[];
 for(const id of Object.keys(FEELS)){
  const s=loose(id),before=meanX(s);s.brush({x:250,y:350},{x:360,y:350},40);const after=meanX(s);shifts.push(after-before);
  for(let i=0;i<120;i++)s.step(1/60);
  const st=s.stats();assert.equal(st.air+st.free+st.bound+st.lost,s.emitted);assert.equal(s.emitted,1000);assert.ok(st.maxHeight<=32);assert.equal(st.bound,0);
 }
 assert.ok(shifts[1]>shifts[0]+3,shifts);assert.ok(shifts[2]>shifts[1]+.5,shifts);
});
test('higher mobility leaves more real residual travel after the same stroke',()=>{
 const distances=[];for(const mobility of [.3,1,1.8]){
  const s=loose('natural');s.setBehavior({mobility,response:1});s.brush({x:250,y:350},{x:290,y:350},40);const x=meanX(s);for(let i=0;i<30;i++)s.step(1/60);distances.push(meanX(s)-x);
 }
 assert.ok(distances[2]>distances[0]*2,distances);
});
test('once bristle contact ends, a parked grain cannot start filling distant gaps later',()=>{
 const s=loose('natural'),mask=new Uint8Array(600*800);mask.fill(1);s.setMask(mask);
 s.time=10;s.pressed.fill(1);s.contactTime.fill(0);for(let i=0;i<120;i++)s.step(1/60);
 assert.equal(s.coverage,0);assert.equal(s.stats().bound,0);
});
test('every stream schedule is monotone and emits exactly one dose',()=>{
 for(const style of ['fan','ribbon','pulse']){let previous=0;for(let i=0;i<=1000;i++){const v=pourFraction(i/1000,style);assert.ok(v>=previous-1e-10&&v<=1+1e-10);previous=v;}assert.equal(pourFraction(0,style),0);assert.equal(pourFraction(1,style),1);}
});
test('experiment controls persist without replacing performance choices or accepting corrupt numbers',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)},s=normalizeSettings(feelSettings({...DEFAULTS,renderScale:.65,shadow:'off'},'fluid'));
 saveSettings(storage,s);assert.deepEqual(loadSettings(storage),s);assert.equal(s.renderScale,.65);assert.equal(s.shadow,'off');assert.equal(s.feel,'fluid');assert.ok(brushRadius(s)>brushRadius(DEFAULTS));
 const bad=normalizeSettings({mobility:NaN,response:Infinity,grainSize:20,brushShape:'x',jarShape:'x'});assert.equal(bad.mobility,1);assert.equal(bad.response,1);assert.equal(bad.grainSize,1.4);assert.equal(bad.brushShape,'flat');
});
test('fast and slow strokes carry the same finite grains but fast strokes leave greater momentum',()=>{
 const distances=[];for(const seconds of [.5,.03]){
  const s=loose('natural');s.brush({x:250,y:350},{x:290,y:350},40,seconds);const x=meanX(s);for(let i=0;i<30;i++)s.step(1/60);distances.push(meanX(s)-x);assert.equal(s.emitted,1000);
 }
 assert.ok(distances[1]>distances[0]*2,distances);
});
