import test from 'node:test';import assert from 'node:assert/strict';
import {completionStatus,resumeIndex} from '../src/progress.js';import {Flow} from '../src/interaction.js';

test('only invisible raster remnants may finish; visible gaps never auto-paint',()=>{
 for(const pace of ['fast','relaxed'])for(const coverage of [0,.95,.98,.998,.999,.9999,1]){
  const status=completionStatus(coverage,pace);assert.equal(status.percent===100,status.ready);
 }
 for(const coverage of [.95,.98,.998,.9999])assert.equal(completionStatus(coverage).ready,false);
 assert.equal(completionStatus(1-8/275476,'fast',275476).ready,true);
 assert.equal(completionStatus(1-9/275476,'fast',275476).ready,false);
 assert.equal(completionStatus(1-3/275476,'relaxed',275476).ready,false);
 assert.equal(completionStatus(1-2/275476,'relaxed',275476).ready,true);
 assert.equal(completionStatus(594/595,'fast',595).ready,false);
 assert.equal(completionStatus(1,'fast',595).ready,true);
});

test('a visually complete first colour can clean up and advance exactly once',()=>{
 const flow=new Flow();flow.roll();assert.equal(flow.tick(2.81),'rolled');assert.equal(flow.tick(1.66),'poured');
 assert.ok(completionStatus(1-2/86834,'fast',86834).ready);assert.ok(flow.shake(true));assert.equal(flow.shake(true),false);
 assert.equal(flow.tick(5.1),'advance');assert.equal(flow.tick(2),null);
});

test('tilt and hold finish at 98 percent for any target size without rounding up before it',()=>{
 for(const pace of ['fast','relaxed'])for(const pixels of [595,86834,275476]){
  for(const mode of ['tilt','hold']){
   assert.deepEqual(completionStatus(.97999,pace,pixels,mode),{ready:false,percent:97});
   assert.deepEqual(completionStatus(.98,pace,pixels,mode),{ready:true,percent:100});
   assert.equal(completionStatus(.95,pace,pixels,mode).ready,false);
   for(const value of [NaN,Infinity])assert.equal(completionStatus(value,pace,pixels,mode).ready,false);
  }
  assert.equal(completionStatus(.98,pace,pixels,'brush').ready,false);
 }
});

test('resume links select only a valid numbered colour',()=>{
 assert.equal(resumeIndex('?v=4.1&devam=2',11),1);assert.equal(resumeIndex('?devam=11',11),10);
 for(const value of ['','0','12','-1','NaN','2.5','Infinity','2x'])assert.equal(resumeIndex('?devam='+value,11),0);
});
