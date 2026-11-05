import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {completionLayout,completionEase} from '../src/completion.js';

test('completion camera fits every poster corner between the header and action rails',()=>{
 for(const [w,h,top,bottom] of [[390,844,0,0],[393,852,59,34],[320,568,0,0],[844,390,0,21],[1280,720,0,0],[1920,1080,0,0]]){
  const f=completionLayout(w,h,top,bottom);assert.ok(f.x>=6);assert.ok(f.y>=top+(h<520?68:112));assert.ok(f.y+f.height<=h-bottom-(h<520?82:112));assert.ok(Math.abs(f.width/f.height-.75)<1e-12);
  const tan=Math.tan(35*Math.PI/360),distance=800*h/(2*tan*f.height),cy=((f.y+f.height/2)/h-.5)*2*tan*distance,camera=new T.PerspectiveCamera(35,w/h,1,5000);camera.position.set(0,cy,distance+110);camera.updateMatrixWorld();
  for(const x of [-300,300])for(const y of [-400,400]){const p=new T.Vector3(x,y,110).project(camera),px=(p.x+1)*w/2,py=(1-p.y)*h/2;assert.ok(px>=f.x-.001&&px<=f.x+f.width+.001);assert.ok(py>=f.y-.001&&py<=f.y+f.height+.001);}
 }
});
test('completion approach settles without overshoot and skips motion when requested',()=>{
 let previous=0;for(let elapsed=0;elapsed<4;elapsed+=.016){const value=completionEase(elapsed);assert.ok(value>=previous&&value<=1);previous=value;}
 assert.equal(completionEase(0),0);assert.equal(completionEase(2),1);assert.equal(completionEase(0,true),1);
});
