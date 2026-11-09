import test from 'node:test';import assert from 'node:assert/strict';
import {TiltModel,DeviceTilt,screenTilt} from '../src/tilt.js';import * as T from 'three';import {paperLift} from '../src/paper-motion.js';
import {Sand,FREE,AIR,BOUND} from '../src/sand.js';import {normalizeSettings,DEFAULTS} from '../src/settings.js';
function maskRect(x0,y0,x1,y1){const m=new Uint8Array(480000);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)m[y*600+x]=1;return m}
function rng(){let seed=31;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function run(model,n=120,live=true){let v;for(let i=0;i<n;i++)v=model.step(1/60,1.25,live);return v}
function host(request=()=>Promise.resolve('granted')){const listeners=new Map();function Orientation(){}if(request)Orientation.requestPermission=request;return {DeviceOrientationEvent:Orientation,isSecureContext:true,screen:{orientation:{angle:0}},listeners,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:(n,f)=>{if(listeners.get(n)===f)listeners.delete(n)}}}
test('a comfortable held position is neutral; relative right/down tilts move in screen directions',()=>{
 const t=new TiltModel();t.accept(48,-7);assert.deepEqual(run(t),{x:0,y:0});t.accept(68,13);const v=run(t);assert.ok(v.x>.45&&v.y>.45);t.calibrate();assert.deepEqual(run(t),{x:0,y:0});
});
test('portrait, landscape and upside-down axes rotate consistently; rotating screen recalibrates safely',()=>{
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);near(screenTilt(10,20,90).x,20);near(screenTilt(10,20,90).y,-10);near(screenTilt(10,20,180).x,-10);near(screenTilt(10,20,180).y,-20);
 const t=new TiltModel();t.accept(30,0,0);t.accept(50,20,0);assert.ok(run(t).x>.4);t.accept(50,20,90);assert.deepEqual(run(t),{x:0,y:0});
});
test('sensor jitter, angle wrapping, sensitivity and invalid samples remain bounded',()=>{
 const t=new TiltModel();t.accept(179,0);t.accept(-179,.5);assert.ok(run(t).y>0&&run(t).y<.1);assert.ok(Math.abs(run(t).x)<1e-6);assert.equal(t.accept(null,NaN),false);t.accept(-70,80);const v=run(t);assert.ok(Math.abs(v.x)<=.65&&Math.abs(v.y)<=.65);assert.deepEqual(run(t,240,false),{x:t.x,y:t.y});assert.ok(Math.abs(t.x)+Math.abs(t.y)<1e-8);
 const s=normalizeSettings({controlMode:'tilt',tiltSensitivity:9});assert.equal(s.controlMode,'tilt');assert.equal(s.tiltSensitivity,2.5);assert.equal(normalizeSettings({controlMode:'x',tiltSensitivity:NaN}).controlMode,DEFAULTS.controlMode);
});
test('iOS permission is requested synchronously from start; only a grant attaches a receiver',async()=>{
 let requested=false;const h=host(()=>{requested=true;return Promise.resolve('granted')}),d=new DeviceTilt({host:h,clock:()=>0});const p=d.start();assert.equal(requested,true);assert.equal(d.status,'requesting');assert.equal(h.listeners.size,0);assert.equal(await p,true);assert.equal(d.status,'waiting');assert.equal(h.listeners.size,1);h.listeners.get('deviceorientation')({beta:45,gamma:0});assert.equal(d.status,'active');d.stop();assert.equal(h.listeners.size,0);
 const denied=new DeviceTilt({host:host(()=>Promise.resolve('denied'))});assert.equal(await denied.start(),false);assert.equal(denied.status,'denied');assert.equal(denied.listening,false);
});
test('permission rejection, insecure contexts and missing devices do not claim to be active',async()=>{
 for(const [h,status] of [[{isSecureContext:false},'insecure'],[{isSecureContext:true},'unsupported'],[host(()=>Promise.reject(Error('denied'))),'denied']]){const d=new DeviceTilt({host:h});await d.start();assert.equal(d.status,status);assert.equal(d.tick(1/60).active,false);}
});
test('changing mode during an outstanding permission prompt cannot attach a late listener',async()=>{
 let resolve;const h=host(()=>new Promise(r=>resolve=r)),d=new DeviceTilt({host:h});const p=d.start();d.stop();resolve('granted');assert.equal(await p,false);assert.equal(d.status,'off');assert.equal(h.listeners.size,0);
});
test('no data and stale data pause gravity, and fresh events can resume',async()=>{
 let now=0;const h=host(null),d=new DeviceTilt({host:h,clock:()=>now});await d.start();now=5000;assert.equal(d.tick(1/60).status,'empty');h.listeners.get('deviceorientation')({beta:20,gamma:0});h.listeners.get('deviceorientation')({beta:40,gamma:20});assert.equal(d.tick(1/60).active,true);now+=1200;assert.equal(d.tick(1/60).active,false);assert.equal(d.status,'stale');h.listeners.get('deviceorientation')({beta:35,gamma:10});assert.equal(d.tick(1/60).active,true);
});
test('screen demo follows the same filtered tilt model without claiming a real sensor',()=>{
 const d=new DeviceTilt({host:{}});d.demo();d.setDemo(25,-20);let v;for(let i=0;i<120;i++)v=d.tick(1/60,1);assert.equal(v.status,'demo');assert.ok(v.x>0&&v.y<0);d.stop();assert.equal(d.tick(1/60).active,false);
});
test('tilted glitter flows onto adhesive and sticks without a single brush stroke',()=>{
 const s=new Sand({random:rng()});s.setMask(maskRect(260,360,340,440));s.emit(220,400,900,{spread:12,height:0});s.state.fill(FREE);s.z.fill(2);
 for(let i=0;i<240;i++)s.step(1/60,{tiltX:.45,contactAdhesion:true});assert.ok(s.coverage>.1,s.coverage);let bound=0;for(let i=0;i<s.count;i++)if(s.state[i]===BOUND){bound++;assert.equal(s.pressed[i],0);assert.ok(s.onGlue(s.x[i],s.y[i]));}assert.ok(bound>0);const st=s.stats();assert.equal(st.air+st.free+st.bound+st.lost,s.emitted);assert.equal(s.emitted,900);
});
test('brush mode still requires brushing, even with the same phone-like forces',()=>{
 const s=new Sand({random:rng()});s.setMask(maskRect(260,360,340,440));s.emit(220,400,900,{spread:12,height:0});s.state.fill(FREE);s.z.fill(2);for(let i=0;i<240;i++)s.step(1/60,{tiltX:.45,contactAdhesion:false});assert.equal(s.coverage,0);assert.equal(s.stats().bound,0);
});
test('contact adhesion never attracts material from neighbouring pixels or floating above the paper',()=>{
 const s=new Sand();s.setMask(maskRect(100,100,105,105));s.emit(99.5,102,1,{spread:0,height:0});s.state[0]=FREE;s.z[0]=2;s.vx[0]=s.vy[0]=s.vz[0]=0;assert.equal(s.bind(0,true),false);for(let i=0;i<90;i++)s.step(1/60,{contactAdhesion:true});assert.equal(s.coverage,0);
 s.x[0]=102;s.z[0]=20;assert.equal(s.bind(0,true),false);s.state[0]=AIR;s.z[0]=2;assert.equal(s.bind(0,true),false);s.state[0]=FREE;assert.equal(s.bind(0,true),true);
});
test('a fast-moving surface grain cannot tunnel through a one-pixel adhesive strip',()=>{
 const s=new Sand();s.setMask(maskRect(250,390,251,410));s.emit(248.2,400,1,{spread:0,height:0});s.state[0]=FREE;s.z[0]=2;s.vx[0]=500;s.step(1/30,{contactAdhesion:true});assert.equal(s.state[0],BOUND);assert.ok(s.x[0]>=250&&s.x[0]<251);
});
test('airborne glitter cannot colour a target before physically landing',()=>{
 const s=new Sand({random:rng()});s.setMask(maskRect(290,390,310,410));s.emit(300,400,100,{height:139,spread:0,fan:0});for(let i=0;i<5;i++)s.step(1/60,{contactAdhesion:true,tiltLayers:true});assert.equal(s.coverage,0);assert.equal(s.stats().bound,0);
});

test('the loose tilt stream visibly thins downstream of adhesive and every missing grain stays on the mask',()=>{
 const random=rng(),s=new Sand({random}),count=3000;
 s.setMask(maskRect(90,200,300,250));
 for(let i=0;i<count;i++){
  const x=140+random()*120,y=100+random()*60,z=1.7+random()*2.5;
  for(const lane of [x,x+220]){
   const j=s.count;s.emit(lane,y,1,{spread:0,height:0,fan:0});
   s.state[j]=FREE;s.z[j]=z;s.vz[j]=0;s.vy[j]=180;
  }
 }
 for(let i=0;i<90;i++)s.step(1/60,{contactAdhesion:true,tiltLayers:true,tiltY:.46});
 const downstream=[0,0],stats=s.stats();
 for(let i=0;i<s.count;i++){
  if(s.state[i]===BOUND){assert.equal(i%2,0);assert.ok(s.onGlue(s.x[i],s.y[i]));}
  if(s.state[i]===FREE&&s.y[i]>250)downstream[i%2]++;
 }
 assert.ok(downstream[0]<downstream[1]*.12,downstream.join(' / '));
 assert.ok(downstream[1]>count*.8);
 assert.ok(s.coverage>.7,s.coverage);
 assert.equal(stats.free,count*2-stats.bound);
});

test('all corners stay above the table when the card tilts in either direction',()=>{
 for(const x of [-.18,0,.18])for(const y of [-.18,0,.18]){const rotation=new T.Euler(y,x,.018),lift=paperLift({x,y});for(const px of [-300,300])for(const py of [-400,400]){const p=new T.Vector3(px,py,-1.6).applyEuler(rotation);assert.ok(p.z+lift>=-1.61,JSON.stringify({x,y,z:p.z+lift}));}}assert.equal(paperLift({x:0,y:0}),0);
});
