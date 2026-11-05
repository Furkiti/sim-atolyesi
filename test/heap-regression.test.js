import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {PNG} from 'pngjs';import * as T from 'three';
import {Sand,FREE,MAX_HEAP_HEIGHT,MAX_GRAIN_HEIGHT,COLS,ROWS} from '../src/sand.js';import {AtelierScene} from '../src/scene.js';import {planPour,pourPoint} from '../src/pouring.js';import {doseFor,DEFAULTS} from '../src/settings.js';import {stages} from '../src/palette.js';
const rng=()=>{let seed=7;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}};
function mask(id){const {data}=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url)));return Uint8Array.from({length:480000},(_,i)=>data[i*4+3]>80?1:0)}
function settle(s,frames=180){for(let f=0;f<frames;f++)s.step(1/60)}
test('18,000 grains crowded in one cell cannot create a vertical spike or extra material',()=>{
 const s=new Sand({random:rng()});s.emit(300,200,18000,{spread:0,height:145,fan:0});
 for(let f=0;f<180;f++){s.step(1/60);assert.ok(s.stats().maxHeight<=MAX_HEAP_HEIGHT);assert.ok(s.stats().maxMoundHeight<=MAX_HEAP_HEIGHT);for(let i=0;i<s.count;i++)if(s.state[i]===FREE)assert.ok(s.z[i]<=MAX_GRAIN_HEIGHT+.001,`z ${s.z[i]}`);}
 const stats=s.stats();assert.equal(stats.air+stats.free+stats.bound+stats.lost,18000);assert.equal(s.emitted,18000);
});
test('the rendered mound has a second height limit even if a density field is extreme',()=>{
 const heapGeo=new T.PlaneGeometry(600,800,COLS/2,ROWS/2);heapGeo.setAttribute('heapAmount',new T.Float32BufferAttribute(new Float32Array(heapGeo.attributes.position.count),1));const scene={heapGeo,bend:0,pitch:0,renderTick:0},s=new Sand();s.moundHeight.fill(1e6);
 for(let f=0;f<12;f++)AtelierScene.prototype.updateHeap.call(scene,s,1/60);
 const p=heapGeo.attributes.position;for(let i=0;i<p.count;i++)assert.ok(p.getZ(i)<=3+MAX_HEAP_HEIGHT*.8+.001);
});
test('the mouth stays unpainted after pouring and becomes paintable only through actual brush contact',()=>{
 const stage=stages.find(s=>s.id==='mouth'),s=new Sand({random:rng()});s.setMask(mask('mouth'));const plan=planPour(stage.pour,s.targetCount),dose=doseFor(s.targetCount,DEFAULTS,s.capacity);
 assert.ok(dose>=1400&&dose<=1600);assert.ok(plan.anchor.y<=stage.pour.y-75);
 for(let f=0;f<50;f++){const p=pourPoint(plan,f/49);s.emit(p.x,p.y,Math.round(dose/50),{spread:4,fan:plan.fan,height:142});s.step(1/60);}settle(s);
 assert.equal(s.coverage,0);assert.equal(s.stats().bound,0);
 s.brush(plan.anchor,{x:stage.pour.x,y:stage.pour.y+20},48);settle(s,60);assert.ok(s.coverage>.25,`${s.coverage}`);
});
test('even a pour directly onto a tiny target cannot auto-complete it without a brush',()=>{
 const s=new Sand({random:rng()});s.setMask(mask('mouth'));s.emit(312,420,360,{spread:0,height:0});settle(s,240);assert.equal(s.coverage,0);assert.equal(s.stats().bound,0);assert.equal(s.bind(0),false);
});
