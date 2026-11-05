import test from 'node:test';import assert from 'node:assert/strict';import {PNG} from 'pngjs';import {readFileSync} from 'node:fs';
import {piecesByStage} from '../src/peel-pieces.js';import {peelAt,peelDuration,peelPoint,peelFront,revealPolygon,PEEL_GAP,peelGap,peelSeconds} from '../src/peel.js';import {Flow} from '../src/interaction.js';
test('sequential peel pieces exactly partition every target colour',()=>{
 for(const [id,pieces] of Object.entries(piecesByStage)){
  const data=PNG.sync.read(readFileSync(new URL(`../assets/${id}.png`,import.meta.url))).data,seen=new Uint8Array(600*800);
  for(const p of pieces){assert.ok(p.duration>=.35&&p.duration<=3);if(p.area>=6000)assert.ok(p.duration>=2.29);for(const [y,x,n] of p.runs)for(let i=0;i<n;i++){const k=(p.bounds.y+y)*600+p.bounds.x+x+i;assert.equal(seen[k],0);seen[k]=1;}assert.equal(seen[Math.floor(p.grip.y)*600+Math.floor(p.grip.x)],1);}
  for(let i=0;i<seen.length;i++)assert.equal(seen[i],data[i*4+3]>80?1:0,`${id}:${i}`);
 }
});
test('blue peels the two linings and forehead separately, with a quick tiny section and slow large linings, before any pour',()=>{
 const pieces=piecesByStage.blue,total=peelDuration(pieces);assert.equal(pieces.length,3);assert.ok(total>4);
 assert.equal(peelAt(pieces,0).index,0);assert.equal(peelAt(pieces,pieces[0].duration+peelGap(pieces[0])+.05).index,1);assert.equal(peelAt(pieces,total).progress,1);
 const flow=new Flow();flow.setRollDuration(total);flow.roll();assert.equal(flow.tick(total-.01),null);assert.equal(flow.phase,'rolling');assert.equal(flow.tick(.02),'rolled');assert.equal(flow.phase,'pour');
});
test('a peel begins at its own edge and curls while the distant paper stays attached',()=>{
 for(const piece of piecesByStage.blue){const {grip}=piece;assert.deepEqual(peelPoint(piece,grip.x,grip.y,0),{x:grip.x-300,y:400-grip.y,z:4.5});assert.ok(peelPoint(piece,grip.x,grip.y,.5).z>10);
  for(const progress of [.1,.4,.7,1])for(const p of revealPolygon(piece,progress)){const s=(p.x-grip.x)*piece.axis.x+(p.y-grip.y)*piece.axis.y;assert.ok(s<=peelFront(piece,progress)+1e-7);}
 }
});

test('holding no longer accelerates sequential peeling or pouring',()=>{
 const pieces=piecesByStage['berry-pink'],total=peelDuration(pieces),flow=new Flow();flow.setRollDuration(total);flow.roll();flow.tick(.25);assert.equal(flow.elapsed,.25);
 flow.tick(.25,{peelHeld:true});assert.equal(flow.elapsed,.5);flow.tick(.25,{peelHeld:false});assert.equal(flow.elapsed,.75);
 const seen=new Set([peelAt(pieces,flow.elapsed).index]);let rolled=0,acceleratedTicks=0;
 for(let i=0;i<1000&&flow.phase==='rolling';i++){acceleratedTicks++;if(flow.tick(1/60,{peelHeld:true})==='rolled')rolled++;else seen.add(peelAt(pieces,flow.elapsed).index);}
 assert.equal(seen.size,pieces.length);assert.equal(rolled,1);assert.equal(flow.phase,'pour');assert.equal(flow.elapsed,0);assert.ok(Math.abs(acceleratedTicks/60-(total-.75))<1/60+.00001);
 // Continuing to hold after the transition must not accelerate the bottle.
 flow.tick(.25,{peelHeld:true});assert.equal(flow.elapsed,.25);assert.equal(flow.phase,'pour');
});

test('held input does not change the pour or fold/collection timer',()=>{
 const f=new Flow();f.pour();f.tick(.2,{peelHeld:true});assert.equal(f.elapsed,.2);f.phase='brush';f.shake();f.tick(.2,{peelHeld:true});assert.equal(f.elapsed,.2);assert.equal(f.progress,.2/4.875);
});
