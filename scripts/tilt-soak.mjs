// Deterministic CPU simulation; real browser UI and physical sensors are separate checks.
import assert from 'node:assert/strict';import {Sand,FREE,LOST,MAX_GRAIN_HEIGHT} from '../src/sand.js';import {FEELS} from '../src/feel.js';import {DEFAULTS} from '../src/settings.js';
let seed=271;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
for(const [feel,preset] of Object.entries(FEELS)){
 const s=new Sand({random});s.setBehavior({...DEFAULTS,...preset});const mask=new Uint8Array(480000);for(let y=100;y<700;y++)for(let x=60;x<540;x++)if((x+y)%23<16)mask[y*600+x]=1;s.setMask(mask);s.emit(300,180,24000,{spread:75,height:139,fan:52});
 let peakStep=0,steps=0,cpu=0,lastCoverage=0;for(let frame=0;frame<60*45;frame++){
  const t=frame/60,start=performance.now();s.step(1/60,{contactAdhesion:true,tiltX:Math.sin(t*1.7)*.55,tiltY:Math.cos(t*1.3)*.55});const ms=performance.now()-start;peakStep=Math.max(peakStep,ms);cpu+=ms;steps++;
  for(let i=0;i<s.count;i++)if(s.state[i]===FREE&&s.cell(s.x[i],s.y[i])<0){s.state[i]=LOST;s.lost++;}
  if(frame%60===0){const st=s.stats();assert.equal(st.air+st.free+st.bound+st.lost,s.emitted);assert.ok(s.coverage>=lastCoverage);lastCoverage=s.coverage;for(let i=0;i<s.count;i++){assert.ok(Number.isFinite(s.x[i]+s.y[i]+s.z[i]));if(s.state[i]===FREE)assert.ok(s.z[i]<=MAX_GRAIN_HEIGHT+.01);}}
 }
 console.log(JSON.stringify({feel,simulatedSeconds:45,emitted:s.emitted,coverage:s.coverage,cpuMsPerStep:cpu/steps,peakStepMs:peakStep,conserved:true}));
}
