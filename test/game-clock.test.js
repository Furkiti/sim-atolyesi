import test from 'node:test';import assert from 'node:assert/strict';
import {GAME_SPEEDS,gameSteps} from '../src/game-clock.js';import {DEFAULTS,normalizeSettings,loadSettings,saveSettings,profileSettings} from '../src/settings.js';import {Flow} from '../src/interaction.js';import {HoldCascade} from '../src/hold-cascade.js';import {Sand} from '../src/sand.js';

test('all seven speed choices persist independently of visual and feel settings',()=>{
 assert.deepEqual(GAME_SPEEDS,[1,1.25,1.5,1.75,2,3,4]);const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 for(const gameSpeed of GAME_SPEEDS){const settings=normalizeSettings({gameSpeed});saveSettings(storage,settings);assert.equal(loadSettings(storage).gameSpeed,gameSpeed);assert.equal(profileSettings(settings,'economy').gameSpeed,gameSpeed);}
 for(const gameSpeed of [0,-1,1.3,5,Infinity,NaN,'4',null])assert.equal(normalizeSettings({gameSpeed}).gameSpeed,1);assert.equal(DEFAULTS.gameSpeed,1);
});
test('time scales exactly at 30 and 60 FPS while physics steps stay at most 40 ms',()=>{
 for(const hz of [30,60])for(const speed of GAME_SPEEDS){let total=0;for(let frame=0;frame<hz;frame++){const plan=gameSteps(1/hz,speed);assert.ok(plan.dt<=.04);assert.ok(plan.count>=1&&plan.count<=6);assert.ok(Math.abs(plan.dt*plan.count-plan.total)<1e-12);total+=plan.total;}assert.ok(Math.abs(total-speed)<1e-10);}
 assert.equal(gameSteps(.06,4).count,6);assert.equal(gameSteps(10,4).total,.24);assert.equal(gameSteps(NaN,4).total,0);assert.equal(gameSteps(-1,4).total,0);
});
test('peeling, pouring and cleanup preserve their order and shorten proportionally at every speed',()=>{
 for(const speed of GAME_SPEEDS)for(const held of [false,true]){
  const flow=new Flow();flow.setRollDuration(3);flow.setPourDuration(2);flow.roll();let wall=0;const events=[];
  for(let frame=0;frame<1000&&events.length<3;frame++){wall+=1/60;const plan=gameSteps(1/60,speed);for(let i=0;i<plan.count;i++){const event=flow.tick(plan.dt,{peelHeld:held});if(event){events.push({event,wall});if(event==='poured')flow.shake(true);}}}
  assert.deepEqual(events.map(e=>e.event),['rolled','poured','advance']);assert.ok(Math.abs(events[0].wall-3/speed)<.04);assert.ok(Math.abs(events[1].wall-events[0].wall-2/speed)<.04);assert.ok(Math.abs(events[2].wall-events[1].wall-4.9/speed)<.07);assert.equal(flow.phase,'brush');
 }
});
test('even 4x at 30 FPS coats every adhesive island with finite, conserved hold-mode glitter',()=>{
 const mask=new Uint8Array(480000);for(const y0 of [100,700])for(let y=y0;y<y0+10;y++)for(let x=190;x<410;x++)mask[y*600+x]=1;
 let emitted;
 for(const speed of GAME_SPEEDS){let seed=19;const sand=new Sand({random:()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)});sand.setMask(mask);const cascade=new HoldCascade(sand,{...DEFAULTS,holdDensity:.5});cascade.pour(1,0);const count=sand.emitted;
  for(let wall=0;wall<12/speed;wall+=1/30){const plan=gameSteps(1/30,speed);for(let i=0;i<plan.count;i++)cascade.step(plan.dt,true);}
  assert.equal(sand.coverage,1,`${speed}x`);assert.equal(sand.emitted,count);assert.ok(sand.x.subarray(0,sand.count).every(Number.isFinite));if(emitted===undefined)emitted=count;assert.equal(count,emitted);
 }
});
