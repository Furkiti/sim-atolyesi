// Node CPU benchmark. Does not pretend to measure a physical phone's GPU/FPS.
import {execFileSync} from 'node:child_process';import {writeFile,mkdir} from 'node:fs/promises';import {performance} from 'node:perf_hooks';import * as T from 'three';
import {Sand} from '../src/sand.js';import {HoldCascade} from '../src/hold-cascade.js';import {AtelierScene} from '../src/scene.js';
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
for(const name of ['hold-cascade','scene']){const old=execFileSync('git',['show',`v19-handoff:src/${name}.js`],{encoding:'utf8'}).replaceAll("from './","from '../src/");await writeFile(new URL(`../qa/${name}-baseline.js`,import.meta.url),old);}
const {HoldCascade:OldHold}=await import('../qa/hold-cascade-baseline.js'),{AtelierScene:OldScene}=await import('../qa/scene-baseline.js');
function sample(density,speed,batch){
 let seed=19;const sand=new Sand({random:()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296)});sand.setMask(new Uint8Array(480000).fill(1));const Hold=batch?HoldCascade:OldHold,c=new Hold(sand,{holdDensity:density,holdRows:2});c.pour(1,0);
 const capacity=sand.capacity,geometry=new T.BufferGeometry();geometry.setAttribute('flakeSeed',new T.InstancedBufferAttribute(new Float32Array(capacity),1));const current=new T.InstancedMesh(geometry,new T.MeshBasicMaterial(),capacity);current.instanceColor=new T.InstancedBufferAttribute(new Float32Array(capacity*3),3);const scene={current,colors:['#cf1960'],activeColor:0,bend:.38,pitch:.34,settings:{controlMode:'hold',holdGrainSize:1}};
 current.userData.gpuBend=batch;
 const update=(batch?AtelierScene:OldScene).prototype.updateGrains,steps=Math.ceil(speed/60/.04);let time=0,upload=0;
 for(let f=0;f<110;f++){const start=performance.now();for(let j=0;j<steps;j++)c.step(speed/60/steps,true,!batch);if(batch)c.refresh();update.call(scene,sand);if(f>=20){time+=performance.now()-start;upload+=batch?scene.grainUploadBytes:capacity*80;}}
 return{ms:time/90,uploadBytes:Math.round(upload/90),particles:sand.count};
}
const results=[];for(const [density,speed] of [[1,1],[1,4],[8,1],[8,4]]){const before=[],after=[];for(let i=0;i<5;i++){before.push(sample(density,speed,false));after.push(sample(density,speed,true));}before.sort((a,b)=>a.ms-b.ms);after.sort((a,b)=>a.ms-b.ms);results.push({density,speed,before:before[2],after:after[2]});}
console.log(JSON.stringify({runtime:process.version,method:'Median of 5 runs; 90 measured frames; CPU hold + grain transforms; v20 curve runs on GPU (GPU time excluded); no GPU render',results},null,2));
