// Deterministic endurance exercise. Actual browser interaction is verified separately.
import {Sand,FREE,BOUND,LOST,MAX_HEAP_HEIGHT,MAX_GRAIN_HEIGHT} from '../src/sand.js';
import {FEELS,pourFraction} from '../src/feel.js';import {supplyPlan,supplyPose,supplyDose,supplyQuota} from '../src/supply.js';import {DEFAULTS} from '../src/settings.js';import {levels} from '../src/levels.js';import {PNG} from 'pngjs';import {readFileSync,writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
const results=[],start=performance.now();
function mask(id){const d=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url))).data;return Uint8Array.from({length:480000},(_,i)=>d[i*4+3]>80?1:0)}
let seed=47;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
for(const [feel,preset] of Object.entries(FEELS))for(const supply of ['generous','islands','curtain']){
 const stage=levels[0].stages.at(-1),settings={...DEFAULTS,...preset,feel,supply},s=new Sand({random});s.setBehavior(settings);s.setMask(mask(stage.id));
 let emitted=0,maxHeight=0,maxAir=0,brushes=0,dumps=0,pour=null,minCoverage=0;const ticks=90*30,begin=performance.now();
 function startPour(){s.compact();const plan=supplyPlan(stage.pour,s.mask,s.bound,s.targetCount,settings);pour={...plan,dose:supplyDose(s.targetCount,settings,s.capacity-s.count),emitted:0,time:0};}
 startPour();
 for(let f=0;f<ticks;f++){
  const t=f/30,draining=t%45>36;
  if(pour){const p=Math.min(1,pour.time/(pour.duration-1)),pose=supplyPose(pour,p),desired=Math.floor(pour.dose*pourFraction(supplyQuota(pour,p),settings.pourStyle)),n=desired-pour.emitted;if(n>0&&pose.flow)pour.emitted+=s.emit(pose.x,pose.y,n,{spread:4,fan:52,height:139});pour.time+=1/30;if(p>=1){emitted+=pour.emitted;pour=null;}}
  if(!pour&&!draining&&f%3===0){
   const phase=Math.floor(t/3)%4,y=100+((t*40)%600),x=phase%2?480:120,other=phase%2?120:480;s.brush({x,y},{x:other,y:y+35},42,.1);brushes++;
  }
  s.step(1/30,{shaking:draining,bend:draining?1:0,tilt:draining?.58:0,tiltX:!draining?Math.sin(t*.7)*.02:0});
  // Leaving the card during a physical drain transfers packets to the off-card pool.
  if(draining){for(let i=0;i<s.count;i++)if(s.state[i]!==BOUND&&s.state[i]!==LOST&&s.y[i]>820){s.state[i]=LOST;s.lost++;}}
  if(f%30===0){const st=s.stats();assert.equal(st.air+st.free+st.bound+st.lost,s.emitted);assert.ok(s.coverage>=minCoverage-1e-8);minCoverage=s.coverage;maxHeight=Math.max(maxHeight,st.maxHeight);maxAir=Math.max(maxAir,st.air);assert.ok(st.maxHeight<=MAX_HEAP_HEIGHT);for(let i=0;i<s.count;i++){assert.ok(Number.isFinite(s.x[i]+s.y[i]+s.z[i]));if(s.state[i]===FREE)assert.ok(s.z[i]<=MAX_GRAIN_HEIGHT+.01);}}
  if(f>0&&f%(45*30)===0){s.removeLoose();s.compact();dumps++;startPour();}
 }
 const st=s.stats();results.push({feel,supply,simulatedSeconds:90,brushes,dumps,emitted:s.emitted,coverage:+s.coverage.toFixed(5),peakHeight:+maxHeight.toFixed(2),seconds:+((performance.now()-begin)/1000).toFixed(2),conserved:st.air+st.free+st.bound+st.lost===s.emitted});console.log(JSON.stringify(results.at(-1)));
}
const report={simulatedSeconds:results.reduce((a,r)=>a+r.simulatedSeconds,0),seconds:+((performance.now()-start)/1000).toFixed(2),results};writeFileSync(new URL('../qa/v7-soak.json',import.meta.url),JSON.stringify(report,null,2));console.log('SOAK COMPLETE',report.simulatedSeconds,report.seconds);
