import test from 'node:test';import assert from 'node:assert/strict';import {Sand,FREE,LOST} from '../src/sand.js';import {TRAY,stepFalling} from '../src/collector.js';import {Flow,drainPose,bentPoint,surfaceVelocity} from '../src/interaction.js';
test('both sides rise around a lower central channel without clipping the table',()=>{
 for(const progress of [.1,.3,.6,.8]){const pose=drainPose(progress),left=bentPoint(-300,0,3,pose.bend,pose.pitch),center=bentPoint(0,0,3,pose.bend,pose.pitch),right=bentPoint(300,0,3,pose.bend,pose.pitch);assert.ok(left.z>center.z);assert.ok(right.z>center.z);assert.ok(center.z>3);}
 assert.deepEqual(drainPose(1),{bend:0,pitch:0});
});
test('falling material hits the open box floor; material outside the opening is not teleported in',()=>{
 const grain={x:0,y:TRAY.centerY,z:130,vx:0,vy:0,vz:-30};let caught=false;for(let i=0;i<100&&!caught;i++)caught=stepFalling(grain,1/60,TRAY);assert.ok(caught);assert.equal(grain.z,TRAY.bottom);
 const outside={x:300,y:TRAY.centerY,z:130,vx:0,vy:0,vz:-30};for(let i=0;i<100;i++)assert.equal(stepFalling(outside,1/60,TRAY),false);assert.ok(outside.z<0);
});
test('a full sheet of loose grains converges centrally and falls into the box under gravity',()=>{
 const sand=new Sand({capacity:800});let count=0;for(let y=15;y<800;y+=40)for(let x=15;x<600;x+=30){const i=count++;sand.x[i]=x;sand.y[i]=y;sand.z[i]=3;sand.seed[i]=(i*17%101)/101;sand.state[i]=FREE;}sand.count=count;
 const falling=[];let caught=0,escaped=0;
 for(let frame=0;frame<600;frame++){
  const pose=drainPose(Math.min(.8,frame/60/4.875));sand.step(1/60,{shaking:true,bend:pose.bend,tilt:pose.pitch});
  for(let i=0;i<sand.count;i++)if(sand.state[i]===FREE&&sand.cell(sand.x[i],sand.y[i])<0){const q=bentPoint(sand.x[i]-300,-400,3+sand.z[i],pose.bend,pose.pitch),v=surfaceVelocity(sand.x[i]-300,sand.vx[i],Math.max(180,sand.vy[i]),pose.bend,pose.pitch);falling.push({x:q.x,y:q.y,z:q.z,vx:v.x,vy:v.y,vz:v.z});sand.state[i]=LOST;}
  for(let i=falling.length-1;i>=0;i--){if(stepFalling(falling[i],1/60,TRAY)){caught++;falling.splice(i,1);}else if(falling[i].z<-1000){escaped++;falling.splice(i,1);}}
 }
 assert.equal(sand.hasLoose(),false);assert.ok(caught/count>.97,`${caught}/${count}, missed ${escaped}`);assert.equal(caught+escaped+falling.length,count);
});
test('cleanup waits for real material to leave before returning flat or changing colour',()=>{
 const flow=new Flow();flow.phase='brush';flow.shake(true);assert.equal(flow.tick(6,{drainComplete:false}),null);assert.equal(flow.phase,'shake');assert.ok(flow.progress<=.8);assert.equal(flow.tick(.1,{drainComplete:true}),null);assert.equal(flow.tick(1.01,{drainComplete:true}),'advance');assert.equal(flow.tick(1),null);
});
test('a wider falling cone spreads a pour after leaving the actual bottle mouth',()=>{
 function spread(fan){let seed=7;const s=new Sand({capacity:400,random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}});s.emit(300,300,400,{spread:4,height:160,fan});for(let i=0;i<20;i++)s.step(1/60);return Math.max(...s.x)-Math.min(...s.x);}
 assert.ok(spread(75)>spread(16)*2.5);
});
