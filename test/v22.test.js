import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {DEFAULTS,HOLD_INACTIVE,loadSettings,saveSettings,settingAvailable} from '../src/settings.js';
import {shouldFinishHeld} from '../src/progress.js';import {HoldCascade} from '../src/hold-cascade.js';import {Sand,FREE,BOUND} from '../src/sand.js';import {CleanupCycle} from '../src/cleanup.js';import {exitOpacity,FINISH_DUST_SCALE} from '../src/spill-appearance.js';import {entryZoomDistance,entryFrameOpacity} from '../src/exhibition.js';import {AtelierScene} from '../src/scene.js';
const random=()=>{let n=53;return()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)};
test('v22 hold preset migrates once, preserves quality and speed, then keeps personal adjustments',()=>{
 let value=JSON.stringify({controlMode:'brush',holdDensity:2,holdGrainSize:3,extraFinish:true,gameSpeed:1.75,renderScale:1.2});const store={getItem:()=>value,setItem:(k,v)=>value=v};let s=loadSettings(store);
 for(const [key,expected] of Object.entries({controlMode:'hold',holdPlacement:'width',holdDensity:5,holdGrainSize:1.7,extraFinish:false,gameSpeed:1.75,renderScale:1.2,holdPresetVersion:22}))assert.equal(s[key],expected,key);
 saveSettings(store,{...s,holdDensity:3,holdGrainSize:2,holdPlacement:'local',extraFinish:true});s=loadSettings(store);assert.equal(s.holdDensity,3);assert.equal(s.holdGrainSize,2);assert.equal(s.holdPlacement,'local');assert.equal(s.extraFinish,true);assert.equal(DEFAULTS.entryMode,'classic');
});
test('hold mode disables brush, motion and old tolerance controls but retains meaningful visual controls',()=>{
 for(const key of HOLD_INACTIVE){assert.equal(settingAvailable(key,'hold'),false,key);assert.equal(settingAvailable(key,'brush'),true,key);}
 for(const key of ['heapDepth','holdDensity','holdGrainSize','holdRows','holdPlacement','entryMode','gameSpeed','surface','jarShape','extraFinish','renderScale','shadow'])assert.equal(settingAvailable(key,'hold'),true,key);
});
test('at 96 percent remaining real target packets finish without releasing the held input or adding material',()=>{
 for(const value of [.9,.95,.95999])assert.equal(shouldFinishHeld(value,'hold'),false);for(const value of [.96,.96001,1])assert.equal(shouldFinishHeld(value,'hold'),true);for(const mode of ['brush','tilt'])assert.equal(shouldFinishHeld(.99,mode),false);for(const value of [NaN,Infinity])assert.equal(shouldFinishHeld(value,'hold'),false);
 const s=new Sand({random:random()}),mask=new Uint8Array(480000);for(let y=180;y<380;y++)for(let x=100;x<420;x++)mask[y*600+x]=1;s.setMask(mask);const c=new HoldCascade(s,{...DEFAULTS,holdDensity:.5});c.pour(1,0);const total=s.emitted;
 for(let f=0;f<2000&&!shouldFinishHeld(s.coverage,'hold');f++)c.step(1/60,true);assert.ok(s.coverage>=.96&&s.coverage<1);c.requestFinish();const before=s.coverage;c.step(1/60,true);assert.ok(s.coverage>=before&&s.coverage<1,'no instant mask fill');
 for(let f=0;f<40;f++)c.step(1/60,true);assert.equal(s.coverage,1);assert.equal(s.emitted,total);for(let i=0;i<s.count;i++)if(s.state[i]===BOUND)assert.equal(s.onGlue(s.x[i],s.y[i]),true);
});
test('optional final tap keeps very few particles and only shrinks them after the normal fold',()=>{
 const s=new Sand({capacity:1000,random:random()});s.emit(300,350,1000,{spread:150,height:0});s.state.fill(FREE);s.state[0]=BOUND;const c=new CleanupCycle(s,[],s.random);assert.ok(c.heldCount>0&&c.heldCount<=24);assert.equal(s.finishDust.some(Boolean),false);c.transition('unfold');assert.equal(s.finishDust.reduce((a,b)=>a+b,0),c.heldCount);assert.equal(s.finishDust[0],0);assert.ok(FINISH_DUST_SCALE<.5);
});
test('early edge spills fade smoothly to zero in 280ms',()=>{
 assert.equal(exitOpacity(0),1);assert.equal(exitOpacity(.28),0);assert.equal(exitOpacity(1),0);let last=1;for(let t=0;t<.28;t+=.01){assert.ok(exitOpacity(t)<=last);last=exitOpacity(t);}assert.equal(exitOpacity(.14),.5);
});
test('direct entry fits the complete artwork at portrait and landscape aspect ratios with the gallery yaw preserved',()=>{
 for(const aspect of [390/844,844/390,1]){const camera=new T.PerspectiveCamera(35,aspect,80,16000),rotation=new T.Quaternion().setFromEuler(new T.Euler(0,.075,0)),normal=new T.Vector3(0,0,1).applyQuaternion(rotation);camera.position.set(810,0,113).addScaledVector(normal,entryZoomDistance(aspect));camera.quaternion.copy(rotation);camera.updateMatrixWorld(true);
  for(const x of [-300,300])for(const y of [-400,400]){const q=new T.Vector3(810+x,y,113).project(camera);assert.ok(Math.abs(q.x)<=1&&Math.abs(q.y)<=1,`${aspect}: ${q.x}, ${q.y}`);}
 }
 let alpha=1;for(let p=0;p<=1;p+=.01){const next=entryFrameOpacity(p);assert.ok(next<=alpha&&next>=0);alpha=next;}assert.equal(entryFrameOpacity(0),1);assert.equal(entryFrameOpacity(1),0);assert.ok(entryFrameOpacity(.5)>0&&entryFrameOpacity(.5)<1);
});
test('painting ray hits the actual art, and restoring a faded frame preserves its original shared material',()=>{
 const camera=new T.PerspectiveCamera(35,390/844,80,16000);camera.position.z=2400;camera.updateMatrixWorld();const paper=new T.Mesh(new T.PlaneGeometry(600,800),new T.MeshBasicMaterial()),frame=new T.Group(),original=new T.MeshStandardMaterial(),part=new T.Mesh(new T.BoxGeometry(5,5,5),original.clone());frame.add(part);frame.visible=true;paper.updateMatrixWorld();
 const scene={camera,paper,galleryFrame:frame,galleryCurrent:2,galleryNeighbors:[],mouse:new T.Vector2(),ray:new T.Raycaster(),canvas:{getBoundingClientRect:()=>({left:0,top:0,width:390,height:844})}};assert.equal(AtelierScene.prototype.pickArtwork.call(scene,{clientX:195,clientY:422}),2);assert.equal(AtelierScene.prototype.pickArtwork.call(scene,{clientX:1,clientY:1}),null);AtelierScene.prototype.restoreEntryFrame.call(scene,{frameMaterials:[{mesh:part,original}]});assert.equal(part.material,original);assert.equal(original.opacity,1);
});
test('pre-funnel spills disappear by fading while the normal funnel flow keeps full opacity and selected size',()=>{
 const grains=count=>{const g=new T.BufferGeometry();for(const name of ['grainOpacity','flakeSeed'])g.setAttribute(name,new T.InstancedBufferAttribute(new Float32Array(count),1));const mesh=new T.InstancedMesh(g,new T.MeshBasicMaterial(),count);mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(count*3),3);return mesh;};
 const camera=new T.PerspectiveCamera(35,390/844,80,16000);camera.position.z=2400;camera.updateMatrixWorld();const particle=()=>({x:0,y:0,z:200,vx:0,vy:0,vz:0,seed:.3,color:new T.Color('#f00')});const scene={syncSpills:AtelierScene.prototype.syncSpills,camera,spills:[{...particle(),fadeOnExit:true},particle(),{...particle(),tiny:true}],spill:grains(4),collected:grains(4),spillObject:new T.Object3D(),boxMotion:0,collectedCount:0,settings:{controlMode:'hold',holdGrainSize:1.7}};
 AtelierScene.prototype.updateSpill.call(scene,.14);assert.equal(scene.spill.count,3);const alpha=scene.spill.geometry.attributes.grainOpacity;assert.equal(alpha.getX(0),.5);assert.equal(alpha.getX(1),1);assert.ok(Math.abs(scene.spill.instanceMatrix.array[32]/scene.spill.instanceMatrix.array[16]-FINISH_DUST_SCALE)<1e-6);
 AtelierScene.prototype.updateSpill.call(scene,.14);assert.equal(scene.spill.count,2);assert.equal(alpha.getX(0),1);assert.equal(alpha.getX(1),1);assert.deepEqual(scene.spill.instanceMatrix.updateRanges,[{start:0,count:32}]);
});
