import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {piecesByStage} from '../src/peel-pieces.js';
import {AtelierScene} from '../src/scene.js';import {bentPoint,bendAmount} from '../src/interaction.js';import {Sand,FREE,BOUND,COLS,ROWS} from '../src/sand.js';
const mesh=()=>new T.Mesh(new T.PlaneGeometry(600,800,2,2),new T.MeshBasicMaterial());
function card(){const paper=mesh(),edge=mesh(),paperOutline=new T.LineLoop(new T.BufferGeometry().setFromPoints([new T.Vector3(-300,-400,4.8),new T.Vector3(300,-400,4.8),new T.Vector3(300,400,4.8),new T.Vector3(-300,400,4.8)]));return {paper,edge,paperOutline,outlineBase:paperOutline.geometry.attributes.position.array.slice(),paperBase:paper.geometry.attributes.position.array.slice(),edgeBase:edge.geometry.attributes.position.array.slice(),bend:0};}

test('tiny final-frame bends preserve paper height instead of collapsing it into a line',()=>{
 for(const amount of [0,1e-20,1e-12,1e-7,1e-6,1e-5,.00009,.0001]){
  const bottom=bentPoint(0,-400,3,amount),top=bentPoint(0,400,3,amount);
  assert.ok(top.y-bottom.y>799.99,`${amount}: ${top.y-bottom.y}`);
  assert.ok(Number.isFinite(top.y+top.z));
 }
});

test('the scene restores the exact original vertices after an almost-zero final bend',()=>{
 const scene=card();for(let cycle=0;cycle<12;cycle++){
  for(const p of [0,.2,.5,.9,1-1e-14,1])AtelierScene.prototype.updateBend.call(scene,bendAmount(p));
  assert.equal(scene.bend,0);assert.deepEqual(scene.paper.geometry.attributes.position.array,scene.paperBase);assert.deepEqual(scene.edge.geometry.attributes.position.array,scene.edgeBase);
 }
});

test('each moving grain keeps its own sparkle seed when another grain binds',()=>{
 const geometry=new T.BufferGeometry();geometry.setAttribute('flakeSeed',new T.InstancedBufferAttribute(new Float32Array(2),1));
 const current=new T.InstancedMesh(geometry,new T.MeshBasicMaterial(),2);current.instanceColor=new T.InstancedBufferAttribute(new Float32Array(6),3);
 const scene={current,colors:['#10121a'],activeColor:0,bend:0},sand=new Sand({capacity:2});sand.emit(100,200,2);sand.state.fill(FREE);
 AtelierScene.prototype.updateGrains.call(scene,sand);const seed=geometry.attributes.flakeSeed.getX(1);sand.state[0]=BOUND;
 AtelierScene.prototype.updateGrains.call(scene,sand);assert.equal(current.count,1);assert.equal(geometry.attributes.flakeSeed.getX(0),seed);
});

test('fresh heaps settle smoothly but removed material leaves no phantom heap',()=>{
 const heapGeo=new T.PlaneGeometry(600,800,COLS/2,ROWS/2);heapGeo.setAttribute('heapAmount',new T.Float32BufferAttribute(new Float32Array(heapGeo.attributes.position.count),1));
 const scene={heapGeo,bend:0,renderTick:0},sand=new Sand();sand.moundHeight.fill(20);
 AtelierScene.prototype.updateHeap.call(scene,sand,1/60);const before=heapGeo.attributes.heapAmount.getX(0);assert.ok(before>0&&before<16);
 sand.moundHeight.fill(5);AtelierScene.prototype.updateHeap.call(scene,sand,1/60);const after=heapGeo.attributes.heapAmount.getX(0);assert.ok(after>0&&after<before);sand.moundHeight.fill(0);AtelierScene.prototype.updateHeap.call(scene,sand,1/60);assert.equal(heapGeo.attributes.heapAmount.getX(0),0);
});


test('a flat attached peel sheet is hidden until its grip lifts; lifted clipping uses a signed distance',()=>{
 const piece=piecesByStage.blue[0],b=piece.bounds,geometry=new T.PlaneGeometry(b.w,b.h,8,8);geometry.setAttribute('peelLift',new T.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count),1));
 const scene={peelPiece:piece,peelGeo:geometry,peelSheet:{visible:true},peelSegments:{x:8,y:8}};
 for(const p of [0,.05,.12,.19,.2]){AtelierScene.prototype.peelProgress.call(scene,p);assert.equal(scene.peelSheet.visible,false);}
 AtelierScene.prototype.peelProgress.call(scene,.35);assert.equal(scene.peelSheet.visible,true);const distances=geometry.attributes.peelLift.array;assert.ok(Math.min(...distances)<0);assert.ok(Math.max(...distances)>0);AtelierScene.prototype.peelProgress.call(scene,1);assert.equal(scene.peelSheet.visible,false);
});

test('contact sheen timestamps only newly coated cells and does not relight old coating',()=>{
 const scene={time:1000,contactData:new Uint8Array(16),contactSeen:new Uint8Array(4),contactTexture:{needsUpdate:false}},bound=new Uint8Array([0,1,0,0]);
 AtelierScene.prototype.markContacts.call(scene,bound);assert.equal(scene.contactData[4],255);assert.equal(scene.contactData[5],60);assert.equal(scene.contactData[0],0);scene.time=5000;bound[3]=1;AtelierScene.prototype.markContacts.call(scene,bound);assert.equal(scene.contactData[5],60);assert.equal(scene.contactData[13],44);assert.equal(scene.contactData[14],1);
});


test('hold piece size scales live grain geometry fourfold without changing its position or count',()=>{
 const geometry=new T.BufferGeometry();geometry.setAttribute('flakeSeed',new T.InstancedBufferAttribute(new Float32Array(1),1));const current=new T.InstancedMesh(geometry,new T.MeshBasicMaterial(),1);current.instanceColor=new T.InstancedBufferAttribute(new Float32Array(3),3);
 const scene={current,colors:['#006633'],activeColor:0,bend:0,settings:{controlMode:'hold',holdGrainSize:1}},s=new Sand({capacity:1});s.emit(150,200,1);s.state[0]=FREE;AtelierScene.prototype.updateGrains.call(scene,s);const before=current.instanceMatrix.array.slice();scene.settings.holdGrainSize=4;AtelierScene.prototype.updateGrains.call(scene,s);assert.ok(Math.abs(current.instanceMatrix.array[0]-before[0]*4)<1e-5);assert.equal(current.instanceMatrix.array[12],before[12]);assert.equal(current.count,1);
});

test('growing an instanced grain pool retains its material, transforms, colors and parent',()=>{
 const scene={paperGroup:new T.Group(),grainMaterial:new T.MeshBasicMaterial(),makeGrains:AtelierScene.prototype.makeGrains};scene.current=scene.makeGrains(2);scene.current.count=1;scene.current.setMatrixAt(0,new T.Matrix4().makeTranslation(12,34,56));scene.current.setColorAt(0,new T.Color('#990033'));const old=scene.current,material=old.material,color=old.instanceColor.array.slice();AtelierScene.prototype.ensureGrainCapacity.call(scene,'current',6);assert.equal(scene.current.instanceMatrix.count,6);assert.equal(scene.current.count,1);assert.equal(scene.current.material,material);assert.equal(scene.current.parent,scene.paperGroup);assert.equal(old.parent,null);assert.equal(scene.current.instanceMatrix.array[12],12);assert.deepEqual(scene.current.instanceColor.array.slice(0,3),color.slice(0,3));
});


test('retained residue follows the selected glitter size instead of becoming forced fine dust',()=>{
 const geometry=new T.BufferGeometry();geometry.setAttribute('flakeSeed',new T.InstancedBufferAttribute(new Float32Array(1),1));const current=new T.InstancedMesh(geometry,new T.MeshBasicMaterial(),1);current.instanceColor=new T.InstancedBufferAttribute(new Float32Array(3),3);
 const scene={current,colors:['#006633'],activeColor:0,bend:0,settings:{controlMode:'hold',holdGrainSize:1}},s=new Sand({capacity:1});s.emit(150,200,1);s.state[0]=FREE;s.dust[0]=1;AtelierScene.prototype.updateGrains.call(scene,s);const before=current.instanceMatrix.array.slice();scene.settings.holdGrainSize=4;AtelierScene.prototype.updateGrains.call(scene,s);assert.ok(Math.abs(current.instanceMatrix.array[0]-before[0]*4)<1e-5);assert.equal(current.instanceMatrix.array[12],before[12]);assert.equal(current.instanceMatrix.array[13],before[13]);
});
