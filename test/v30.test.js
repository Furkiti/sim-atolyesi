import test from 'node:test';import assert from 'node:assert/strict';import {AtelierSession,SESSION_KEY} from '../src/session.js';import {LevelProgress} from '../src/level-progress.js';import {Sand,FREE,BOUND,LOST} from '../src/sand.js';import {HoldCascade} from '../src/hold-cascade.js';
const levels=[{id:'a',stages:[1,2,3]},{id:'b',stages:[1,2]},{id:'c',stages:[1]}],memory=()=>{const m=new Map();return {getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)}};
const rng=()=>{let n=31;return()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)};
test('startup remembers the active painting and completed colour boundaries across reloads',()=>{
 const storage=memory(),p=new LevelProgress(storage,levels.map(l=>l.id)),s=new AtelierSession(storage,levels);s.checkpoint('a',2,false);let start=new AtelierSession(storage,levels).start('',p);assert.equal(start.level.id,'a');assert.equal(start.index,2);assert.equal(start.finished,false);s.checkpoint('a',2,true);p.complete('a');s.checkpoint('b',1,false);start=new AtelierSession(storage,levels).start('',p);assert.equal(start.level.id,'b');assert.equal(start.index,1);assert.equal(start.finished,false);
});
test('gallery focus can remember a locked frame without unlocking it or discarding the real checkpoint',()=>{
 const storage=memory(),p=new LevelProgress(storage,levels.map(l=>l.id)),s=new AtelierSession(storage,levels);s.checkpoint('a',1,false);s.focus('c');const start=new AtelierSession(storage,levels).start('',p);assert.equal(start.focus,'c');assert.equal(start.level.id,'a');assert.equal(start.index,1);assert.equal(p.canPlay('c'),false);
});
test('invalid/full session storage, old gallery history and explicit artwork links have safe startup choices',()=>{
 const p=new LevelProgress(null,levels.map(l=>l.id));for(const value of ['broken','null','[]','{"last":"bad","stages":{"a":{"index":99,"finished":true}}}']){const s=new AtelierSession({getItem:()=>value,setItem:()=>{throw Error('full')}},levels);assert.equal(s.start('',p).level.id,'a');s.checkpoint('a',1);}
 p.complete('a');const s=new AtelierSession(memory(),levels);assert.equal(s.start('',p,[{id:'a'}]).finished,true);s.checkpoint('b',1);assert.equal(s.start('?bolum=a',p).level.id,'a');assert.equal(s.start('?bolum=c',p).level.id,'b');assert.equal(s.start('?bolum=c',p).index,1);
});
function contact(){const s=new Sand({random:rng()}),mask=new Uint8Array(480000);for(let x=200;x<210;x++)mask[499*600+x]=1;s.setMask(mask);const c=new HoldCascade(s,{holdDensity:.5});c.pour(1,0);const route=c.routes.find(r=>!r.target&&!r.rest),i=route.i;s.state.fill(LOST);s.state[i]=FREE;s.x[i]=route.x=202;s.y[i]=499.5;s.z[i]=2.2;s.bound[s.cell(202,499.5)]=1;route.delay=0;route.speed=100;route.distance=0;delete route.landing;c.activeRoutes=[route];return {s,c,route,i};}
test('contact is tested at the stored Float32 coordinate, so boundary rounding cannot create a forever-landing grain',()=>{
 const {s,c,route}=contact();c.step(.004999999,true,false);assert.equal(s.y[route.i],500);assert.equal(route.layerCell,undefined);assert.equal(c.pendingLayerCount,0);c.requestFinish();for(let f=0;f<100;f++)c.step(1/60,true,false);assert.equal(c.pendingLayerCount,0);
});
test('a failed or externally detached landing releases its reservation exactly once and never blocks full coverage',()=>{
 for(const detached of [false,true]){const {s,c,route,i}=contact(),k=s.cell(s.x[i],s.y[i]);route.layerCell=k;route.landing=.17;route.contactZ=4;c.pendingLayerCount=1;c.pendingLayers[k]=1;if(detached)s.state[i]=LOST;else s.y[i]=500;c.requestFinish();for(let f=0;f<80;f++)c.step(1/60,true,false);assert.equal(c.pendingLayerCount,0);assert.equal(c.pendingLayers[k],0);assert.equal(route.layerCell,undefined);assert.equal(s.state[i]===BOUND,false);}
});
