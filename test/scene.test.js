import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {AtelierScene} from '../src/scene.js';import {bentPoint,bendAmount} from '../src/interaction.js';import {Sand,FREE,BOUND,COLS,ROWS} from '../src/sand.js';
const mesh=()=>new T.Mesh(new T.PlaneGeometry(600,800,2,2),new T.MeshBasicMaterial());
function card(){const paper=mesh(),edge=mesh();return {paper,edge,paperBase:paper.geometry.attributes.position.array.slice(),edgeBase:edge.geometry.attributes.position.array.slice(),bend:0};}

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
