import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {PNG} from 'pngjs';
import {levels,selectLevel} from '../src/levels.js';import {Sand,FREE} from '../src/sand.js';import {piecesByStage} from '../src/peel-pieces.js';
test('new garden level covers the entire card with eight disjoint, playable colours',()=>{
 const level=levels[1];assert.equal(level.stages.length,8);const seen=new Uint8Array(600*800);
 for(const stage of level.stages){
  const png=PNG.sync.read(readFileSync(new URL(`../assets/${stage.id}.png`,import.meta.url)));assert.equal(png.width,600);assert.equal(png.height,800);const mask=Uint8Array.from({length:480000},(_,i)=>png.data[i*4+3]>80?1:0);assert.equal(mask.reduce((a,b)=>a+b,0),stage.area);for(let i=0;i<seen.length;i++)seen[i]+=mask[i];
  const s=new Sand();s.setMask(mask);for(let k=0;k<s.target.length;k++)if(s.target[k]){
   const x0=k%120*5,y0=Math.floor(k/120)*5;let point;for(let y=y0;y<y0+5&&!point;y++)for(let x=x0;x<x0+5;x++)if(s.onGlue(x,y)){point={x,y};break;}
   const i=s.count++;s.x[i]=point.x;s.y[i]=point.y;s.state[i]=FREE;s.pressed[i]=1;assert.ok(s.bind(i));
  }
  assert.equal(s.coverage,1,stage.id);assert.ok(piecesByStage[stage.id].length);
 }
 assert.ok(seen.every(n=>n===1));
});
test('level selection and resume remain separate; unknown levels safely open Gotham',()=>{
 assert.equal(selectLevel('?bolum=ay-bahcesi&devam=6').id,'ay-bahcesi');assert.equal(selectLevel('?devam=6').id,'gotham');assert.equal(selectLevel('?bolum=unknown').id,'gotham');
});

test('all three sweet illustrations exactly partition a complete card and have playable peel pieces',()=>{
 for(const level of levels.slice(2)){assert.equal(level.stages.length,8);const seen=new Uint8Array(480000);for(const stage of level.stages){const data=PNG.sync.read(readFileSync(new URL(`../assets/${stage.id}.png`,import.meta.url))).data;let area=0;for(let i=0;i<seen.length;i++)if(data[i*4+3]>80){seen[i]++;area++;}assert.equal(area,stage.area);assert.ok(piecesByStage[stage.id].length);}assert.ok(seen.every(n=>n===1),level.id);}
});
