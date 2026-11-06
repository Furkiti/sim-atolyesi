// CPU transforms/physics only; not a physical phone FPS or GPU measurement.
import {execFileSync} from 'node:child_process';import {writeFile,mkdir} from 'node:fs/promises';import {performance} from 'node:perf_hooks';import * as T from 'three';import {AtelierScene} from '../src/scene.js';
await mkdir(new URL('../qa/',import.meta.url),{recursive:true});
await writeFile(new URL('../qa/funnel-collection-baseline.js',import.meta.url),execFileSync('git',['show','94a5a13:src/funnel.js'],{encoding:'utf8'}));
await writeFile(new URL('../qa/scene-collection-baseline.js',import.meta.url),execFileSync('git',['show','94a5a13:src/scene.js'],{encoding:'utf8'}).replaceAll("from './","from '../src/").replace("from '../src/funnel.js'","from './funnel-collection-baseline.js'"));
const {AtelierScene:Before}=await import('../qa/scene-collection-baseline.js');
function mesh(n){const g=new T.BufferGeometry();for(const k of ['flakeSeed','grainOpacity'])g.setAttribute(k,new T.InstancedBufferAttribute(new Float32Array(n).fill(1),1));const m=new T.InstancedMesh(g,new T.MeshBasicMaterial(),n);m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3),3);return m;}
function run(Class,count,speed){
 const camera=new T.PerspectiveCamera(35,390/844,80,16000);camera.position.set(0,-669,2230);camera.lookAt(0,-75,20);camera.updateMatrixWorld();const color=new T.Color('#bd1634'),s={camera,spill:mesh(count),collected:mesh(2200),spills:[],spillObject:new T.Object3D(),collectedCount:0,settings:{controlMode:'hold',holdGrainSize:1.7},boxMotion:1,collectorBox:{radius:132,throat:18,centerY:-470,rim:65,tilt:.9,length:112,jarRadius:40,jarTop:-126,bottom:-203},catchGrain:Class.prototype.catchGrain,syncSpills:Class.prototype.syncSpills};
 for(let i=0;i<count;i++){const seed=((i*16807)%65521)/65521;s.spills.push({x:(seed-.5)*230,y:-365+(i%17),z:250+seed*60,vx:0,vy:-60,vz:-80,seed,color,fadeAge:0});}
 let time=0,peak=0;const steps=Math.ceil(speed/60/.04);
 for(let f=0;f<75;f++){const t=performance.now();for(let j=0;j<steps;j++)Class.prototype.updateSpill.call(s,speed/60/steps,false);if(Class.prototype.syncSpills)Class.prototype.syncSpills.call(s);const ms=performance.now()-t;if(f>=8){time+=ms;peak=Math.max(peak,ms);}}
 return {meanMs:time/67,peakMs:peak,caught:s.collectedCount};
}
const results=[];for(const [count,speed] of [[12000,1],[48000,1],[48000,4]]){const median=Class=>Array.from({length:3},()=>run(Class,count,speed)).sort((a,b)=>a.meanMs-b.meanMs)[1];results.push({count,speed,before:median(Before),after:median(AtelierScene)});}
console.log(JSON.stringify({runtime:process.version,method:'median of 3, 67 measured frames, CPU physics + populated transforms, GPU excluded',results},null,2));
