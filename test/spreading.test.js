import test from 'node:test';import assert from 'node:assert/strict';import {Sand,FREE,LOST} from '../src/sand.js';
import {appendStroke} from '../src/interaction.js';
function rng(seed=7){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function settle(s,n=120){for(let i=0;i<n;i++)s.step(1/60)}

test('brushed grains do not regenerate the solid poured mound after release',()=>{
 const sand=new Sand({random:rng()});sand.emit(300,400,1200,{spread:7});settle(sand);
 assert.ok(sand.stats().maxMoundHeight>5);assert.equal(sand.stats().freshFree,1200);
 sand.brush({x:270,y:400},{x:330,y:400},160);sand.step(1/60);
 assert.equal(sand.stats().pressedFree,1200);assert.equal(sand.stats().maxMoundHeight,0);
 const before=sand.emitted,heights=sand.z.slice(0,sand.count);settle(sand,180);for(let i=0;i<sand.count;i++)assert.ok(sand.z[i]<=heights[i]+1e-6);assert.equal(sand.stats().maxMoundHeight,0);assert.equal(sand.emitted,before);assert.equal(sand.stats().free,1200);
});

test('sub-pixel pointer events do not amplify a twenty-pixel stroke into a large jump',()=>{
 const sand=new Sand({random:rng()});sand.emit(300,400,1,{spread:0,height:0});sand.state[0]=FREE;sand.z[0]=2;
 for(let i=0;i<100;i++)sand.brush({x:300+i*.2,y:400},{x:300+(i+1)*.2,y:400});
 assert.ok(sand.x[0]>=300&&sand.x[0]<=320.1,`x=${sand.x[0]}`);assert.equal(sand.emitted,1);
});

test('a broad sweep fans material instead of transporting a rigid copy of the original pile',()=>{
 const sand=new Sand({random:rng()});sand.emit(300,400,300,{spread:0,height:0});sand.state.fill(FREE);sand.z.fill(2);
 sand.brush({x:300,y:400},{x:460,y:400});const xs=Array.from(sand.x.subarray(0,sand.count)),ys=Array.from(sand.y.subarray(0,sand.count));
 assert.ok(Math.max(...xs)-Math.min(...xs)>5);assert.ok(Math.max(...ys)-Math.min(...ys)>8);assert.equal(sand.count,300);assert.equal(sand.emitted,300);
});

test('compaction preserves whether a packet was brushed and only a new pour makes fresh grains',()=>{
 const sand=new Sand({random:rng()});sand.emit(300,400,3,{spread:0,height:0});sand.state.fill(FREE);sand.pressed.fill(1);sand.state[0]=LOST;sand.lost=1;sand.compact();
 assert.equal(sand.count,2);assert.equal(sand.pressed[0],1);assert.equal(sand.pressed[1],1);sand.emit(350,400,1,{spread:0,height:0});assert.equal(sand.pressed[2],0);
});

test('a fast pointer stream retains its initial material-contact path',()=>{
 const strokes=[];for(let x=0;x<100;x++)appendStroke(strokes,{from:{x,y:12},to:{x:x+1,y:12}});
 assert.equal(strokes.length,18);assert.deepEqual(strokes[0].from,{x:0,y:12});assert.deepEqual(strokes.at(-1).to,{x:100,y:12});
 for(let i=1;i<strokes.length;i++)assert.deepEqual(strokes[i].from,strokes[i-1].to);
});
