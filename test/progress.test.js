import test from 'node:test';import assert from 'node:assert/strict';
import {completionStatus,resumeIndex} from '../src/progress.js';import {Flow} from '../src/interaction.js';

test('every displayed 100 percent is ready, including the reported 99.5–99.99 percent case',()=>{
 for(const coverage of [0,.1,.994,.994999999,.995,.996,.999,.99999,1]){
  const status=completionStatus(coverage);assert.equal(status.percent===100,status.ready,String(coverage));
 }
 assert.deepEqual(completionStatus(.998),{ready:true,percent:100});
 assert.deepEqual(completionStatus(.9949),{ready:false,percent:99});
});

test('a visually complete first colour can clean up and advance exactly once',()=>{
 const flow=new Flow();flow.roll();assert.equal(flow.tick(.96),'rolled');assert.equal(flow.tick(1.66),'poured');
 assert.ok(completionStatus(.998).ready);assert.ok(flow.shake(true));assert.equal(flow.shake(true),false);
 assert.equal(flow.tick(1.81),'advance');assert.equal(flow.tick(2),null);
});

test('resume links select only a valid numbered colour',()=>{
 assert.equal(resumeIndex('?v=4.1&devam=2',11),1);assert.equal(resumeIndex('?devam=11',11),10);
 for(const value of ['','0','12','-1','NaN','2.5','Infinity','2x'])assert.equal(resumeIndex('?devam='+value,11),0);
});
