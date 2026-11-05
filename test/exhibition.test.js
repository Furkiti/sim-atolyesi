import test from 'node:test';import assert from 'node:assert/strict';
import {ExhibitionRail,galleryOffset,entryProgress} from '../src/exhibition.js';
import {HoldCascade} from '../src/hold-cascade.js';import {Sand} from '../src/sand.js';
import {AtelierScene} from '../src/scene.js';import {bentPoint} from '../src/interaction.js';import * as T from 'three';

test('exhibition has a finite beginning and end, with no fabricated preceding panel',()=>{
 const rail=new ExhibitionRail(6);rail.select(-1);assert.equal(rail.target,0);assert.equal(galleryOffset(0,0,810),0);rail.select(99);assert.equal(rail.target,5);assert.equal(galleryOffset(1,0,810),810);
});
test('touch dragging follows the finger and release settles smoothly on a real painting',()=>{
 const rail=new ExhibitionRail(6);rail.begin(320);rail.move(60,300);assert.equal(rail.target,1);assert.ok(rail.focus>.8&&rail.focus<1);rail.end();let last=rail.focus;for(let f=0;f<90;f++){rail.step(1/60);assert.ok(rail.focus>=last&&rail.focus<=1);last=rail.focus;}assert.equal(rail.focus,1);
 rail.begin(100);rail.move(900,300);rail.end();assert.equal(rail.target,0);
});
test('entry motion is independent of game speed and reaches its endpoints without overshoot',()=>{
 assert.equal(entryProgress(0),0);assert.equal(entryProgress(1.7),1);assert.equal(entryProgress(.4,true),1);let last=0;for(let t=0;t<2;t+=.01){const p=entryProgress(t);assert.ok(p>=last&&p<=1);last=p;}
});
test('one density refresh per rendered frame preserves exact travelling packets and adhesion',()=>{
 const run=batch=>{let n=71;const s=new Sand({random:()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296)}),m=new Uint8Array(480000);for(let y=180;y<260;y++)for(let x=200;x<300;x++)m[y*600+x]=1;s.setMask(m);const c=new HoldCascade(s,{holdDensity:.5});c.pour(1,0);
 for(let f=0;f<180;f++){for(let step=0;step<2;step++)c.step(1/30,f>15,!batch);if(batch)c.refresh();}return s;};
 const a=run(false),b=run(true);assert.deepEqual(a.x,b.x);assert.deepEqual(a.y,b.y);assert.deepEqual(a.z,b.z);assert.deepEqual(a.state,b.state);assert.deepEqual(a.bound,b.bound);assert.equal(a.emitted,b.emitted);assert.equal(a.coverage,1);
});
test('batched grain transforms match the original bend, and upload only the populated instance range',()=>{
 const capacity=48000,geometry=new T.BufferGeometry();geometry.setAttribute('flakeSeed',new T.InstancedBufferAttribute(new Float32Array(capacity),1));const current=new T.InstancedMesh(geometry,new T.MeshBasicMaterial(),capacity);current.instanceColor=new T.InstancedBufferAttribute(new Float32Array(capacity*3),3);
 const scene={current,colors:['#f04f4f'],activeColor:0,bend:.7,pitch:.3,settings:{controlMode:'hold',holdGrainSize:2}},s=new Sand();s.emit(300,250,50,{spread:180,height:10});
 AtelierScene.prototype.updateGrains.call(scene,s);for(let i=0;i<50;i++){const q=bentPoint(s.x[i]-300,400-s.y[i],3+s.z[i],.7,.3),a=current.instanceMatrix.array;for(const [axis,value] of [[12,q.x],[13,q.y],[14,q.z]])assert.ok(Math.abs(a[i*16+axis]-value)<.0001);}
 assert.deepEqual(current.instanceMatrix.updateRanges,[{start:0,count:50*16}]);assert.equal(scene.grainUploadBytes,50*80);
 const colorVersion=current.instanceColor.version;AtelierScene.prototype.updateGrains.call(scene,s);assert.equal(current.instanceColor.version,colorVersion);assert.equal(scene.grainUploadBytes,50*64);
});

test('level replacement cannot reset the camera for one frame under either entry cover',()=>{
 for(const entryMode of ['classic','direct']){
 const camera=new T.PerspectiveCamera(35,390/844,1,16000),play=new T.Vector3(0,-669,2230),paperGroup=new T.Group();camera.position.copy(play);
 const scene={restoreEntryFrame:AtelierScene.prototype.restoreEntryFrame,camera,playCameraPosition:play,playCameraQuaternion:new T.Quaternion(),paperGroup,finishClock:1.65,reducedMotion:{matches:false},settings:{sparkles:false,entryMode},celebration:{visible:false},galleryFrame:{visible:true},gallerySides:{visible:true},paperOutline:{visible:true},galleryMaterials:[],galleryNeighbors:[],floor:{material:{color:new T.Color()}},scene:{background:new T.Color()},floorRestColor:new T.Color(),galleryWallColor:new T.Color(),coatUniforms:{uCelebrate:{value:0}},heroFrame:{x:73,y:252,width:244,height:318},canvas:{clientHeight:844},galleryCurrent:0,galleryFocus:1,celebrationStars:[],bend:0,pitch:0,updateBend(){},entryCover:new T.Mesh(new T.PlaneGeometry(600,800),new T.MeshBasicMaterial())};
 let covered=0,done=0;AtelierScene.prototype.beginEntry.call(scene,1,{width:480,height:640},()=>{covered++;camera.position.copy(play);scene.galleryCurrent=1;},()=>done++);
 let sawCovered=false;for(let f=0;f<260;f++){
  AtelierScene.prototype.updateCompletion.call(scene,f<104,1/60,f*1000/60);
  if(covered&&!sawCovered){sawCovered=true;assert.ok(camera.position.distanceTo(scene.entry.start)<1e-8,'reset callback must not move the covered camera');assert.ok(scene.entryCover.visible);assert.equal(scene.entryCover.material.opacity,1);}
 }
 assert.equal(covered,1);assert.equal(done,1);assert.ok(camera.position.distanceTo(play)<1e-8);assert.equal(scene.entryCover.visible,false);
 }
});
