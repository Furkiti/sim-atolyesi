import test from 'node:test';import assert from 'node:assert/strict';import {Sand,FREE,BOUND,LOST} from '../src/sand.js';import {paperExit,exitVelocity} from '../src/spill.js';import {AtelierScene} from '../src/scene.js';import * as T from 'three';
function rng(){let seed=271;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
const sd=a=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/a.length)};
test('a tilted dense mound shears into individual streams instead of translating as a rigid disk',()=>{
 const s=new Sand({random:rng()});s.emit(300,350,6000,{spread:38,height:0,fan:0});s.state.fill(FREE);for(let i=0;i<s.count;i++){s.z[i]=2+s.seed[i]*25;s.vx[i]=s.vy[i]=0;}
 for(let f=0;f<60;f++)s.step(1/60,{contactAdhesion:true});const before=s.x.slice(0,s.count),core=[];for(let i=0;i<s.count;i++)if(Math.abs(before[i]-300)<12&&Math.abs(s.y[i]-350)<12)core.push(i);
 for(let f=0;f<90;f++)s.step(1/60,{contactAdhesion:true,tiltX:.35});
 assert.ok(sd(core.map(i=>s.x[i]-before[i]))>20);assert.ok(sd(Array.from(s.x.slice(0,s.count)))/sd(Array.from(before))>1.3);assert.equal(s.emitted,6000);assert.equal(s.stats().free+s.stats().bound+s.stats().lost,6000);
});
test('the lowest grain physically settles onto glue under a thick pile, without a brush or attraction',()=>{
 const s=new Sand({capacity:100,random:rng()}),mask=new Uint8Array(480000);for(let y=350;y<355;y++)for(let x=300;x<305;x++)mask[y*600+x]=1;s.setMask(mask);s.emit(302,352,100,{spread:0,height:0,fan:0});
 s.state.fill(FREE);s.z.fill(25);s.vx.fill(0);s.vy.fill(0);s.vz.fill(0);s.step(1/60,{contactAdhesion:true});assert.equal(s.stats().bound,0);
 for(let f=0;f<45;f++)s.step(1/60,{contactAdhesion:true});assert.equal(s.coverage,1);assert.equal(s.stats().bound,1);for(let i=0;i<s.count;i++)if(s.state[i]===BOUND)assert.equal(s.onGlue(s.x[i],s.y[i]),true);
});
test('a level settled grain does not drift or rotate on its own; compaction preserves rolling state',()=>{
 const s=new Sand({capacity:2});s.emit(200,200,2,{spread:0,height:0,fan:0});s.state.fill(FREE);s.z.fill(2);s.vx.fill(0);s.vy.fill(0);for(let f=0;f<120;f++)s.step(1/60,{contactAdhesion:true});assert.equal(s.x[0],200);assert.equal(s.y[0],200);assert.equal(s.roll[0],0);
 s.roll[1]=3;s.previousX[1]=199;s.state[0]=LOST;s.compact();assert.equal(s.roll[0],3);assert.equal(s.previousX[0],199);
});
test('all four exits use the swept edge crossing and preserve outward momentum',()=>{
 for(const [x,y,edge,nx,ny] of [[-8,400,'left',-1,0],[609,400,'right',1,0],[300,-10,'top',0,-1],[300,810,'bottom',0,1]]){
  const e=paperExit(300,400,x,y);assert.equal(e.edge,edge);assert.equal(e.nx,nx);assert.equal(e.ny,ny);assert.ok(e.x>=0&&e.x<=600&&e.y>=0&&e.y<=800);
  const v=exitVelocity(e,nx*120,ny*120);assert.equal(v.vx,nx*120);assert.equal(v.vy,ny*120);const cleanup=exitVelocity(e,0,0,true);assert.ok(cleanup.vx*nx+cleanup.vy*ny>=45);if(edge==='top')assert.ok(cleanup.vy<0);if(nx)assert.equal(cleanup.vy,0);
 }
 const corner=paperExit(590,790,620,830);assert.equal(corner.edge,'bottom');assert.equal(corner.y,800);assert.equal(corner.x,597.5);
});
test('scene detachment maps top and side grains to their actual edges with the current paper pose',()=>{
 const sand=new Sand({capacity:4}),group=new T.Group();group.rotation.set(.08,-.1,.018);group.position.z=65;
 const scene={paperGroup:group,colors:['#ff00aa'],activeColor:0,spills:[],bend:0,pitch:0,draining:false};
 const exits=[[-5,400], [605,400], [300,-5], [300,805]];
 for(const [x,y] of exits){const i=sand.count++;sand.x[i]=x;sand.y[i]=y;sand.previousX[i]=300;sand.previousY[i]=400;sand.z[i]=2;sand.vx[i]=Math.sign(x-300)*120;sand.vy[i]=Math.sign(y-400)*120;sand.state[i]=FREE;}
 AtelierScene.prototype.collectSpill.call(scene,sand,true);assert.equal(scene.spills.length,4);assert.equal(sand.lost,4);for(const p of scene.spills){const local=new T.Vector3(p.x,p.y,p.z);group.worldToLocal(local);assert.ok(local.x<=-302||local.x>=302||local.y>=402||local.y<=-402);const velocity=new T.Vector3(p.vx,p.vy,p.vz).applyQuaternion(group.quaternion.clone().invert());if(p.edge==='top')assert.ok(velocity.y>0);if(p.edge==='left')assert.ok(velocity.x<0);if(p.edge==='right')assert.ok(velocity.x>0);}
});

test('depth occlusion hides far-edge drops behind the card while side and near-edge drops remain outside',()=>{
 const paper=new T.Mesh(new T.PlaneGeometry(600,800),new T.MeshBasicMaterial({side:T.DoubleSide}));paper.updateMatrixWorld();const eye=new T.Vector3(0,-700,1700);
 const occluded=p=>{const ray=new T.Raycaster(eye,p.clone().sub(eye).normalize(),0,eye.distanceTo(p));return ray.intersectObject(paper).length>0;};
 assert.equal(occluded(new T.Vector3(0,405,-20)),true);assert.equal(occluded(new T.Vector3(0,-405,-20)),false);assert.equal(occluded(new T.Vector3(310,0,-20)),false);assert.equal(occluded(new T.Vector3(-310,0,-20)),false);
});

test('a grain leaving the bent bottom lip keeps its raised height and reaches the collector',async()=>{
 const {TRAY,stepFalling}=await import('../src/collector.js');const sand=new Sand({capacity:1});sand.count=1;sand.x[0]=300;sand.y[0]=802;sand.previousX[0]=300;sand.previousY[0]=798;sand.z[0]=2;sand.vy[0]=500;sand.state[0]=FREE;
 const scene={paperGroup:new T.Group(),colors:['#ff00aa'],activeColor:0,spills:[],bend:1,pitch:.58,draining:true};AtelierScene.prototype.collectSpill.call(scene,sand,true);const p=scene.spills[0];assert.ok(p.z>110,p.z);assert.ok(p.vz<-200);let caught=false;for(let f=0;f<100&&!caught;f++)caught=stepFalling(p,1/60,TRAY);assert.equal(caught,true);
});
