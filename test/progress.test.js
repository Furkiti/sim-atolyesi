import test from 'node:test';import assert from 'node:assert/strict';
import {completionStatus,resumeIndex} from '../src/progress.js';import {Flow} from '../src/interaction.js';

test('small remaining gaps finish at 95 percent in fast mode and 98 in detailed mode',()=>{
 for(const pace of ['fast','relaxed'])for(const coverage of [0,.1,.949999,.95,.979999,.98,.994,.995,.99999,1]){
  const status=completionStatus(coverage,pace);assert.equal(status.percent===100,status.ready,`${pace}: ${coverage}`);
 }
 assert.deepEqual(completionStatus(.9499),{ready:false,percent:95});
 assert.deepEqual(completionStatus(.95),{ready:true,percent:100});
 assert.equal(completionStatus(.97,'relaxed').ready,false);assert.equal(completionStatus(.98,'relaxed').ready,true);
});

test('a visually complete first colour can clean up and advance exactly once',()=>{
 const flow=new Flow();flow.roll();assert.equal(flow.tick(2.81),'rolled');assert.equal(flow.tick(1.66),'poured');
 assert.ok(completionStatus(.998).ready);assert.ok(flow.shake(true));assert.equal(flow.shake(true),false);
 assert.equal(flow.tick(5.1),'advance');assert.equal(flow.tick(2),null);
});

test('resume links select only a valid numbered colour',()=>{
 assert.equal(resumeIndex('?v=4.1&devam=2',11),1);assert.equal(resumeIndex('?devam=11',11),10);
 for(const value of ['','0','12','-1','NaN','2.5','Infinity','2x'])assert.equal(resumeIndex('?devam='+value,11),0);
});
