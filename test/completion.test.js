import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {completionLayout,completionEase,galleryCamera,GALLERY} from '../src/completion.js';

test('the angled gallery camera keeps the entire frame clear of header and actions',()=>{
 for(const [w,h,top,bottom] of [[390,844,0,0],[393,852,59,34],[320,568,0,0],[844,390,0,21],[1280,720,0,0],[1920,1080,0,0]]){
  const f=completionLayout(w,h,top,bottom),pose=galleryCamera(f,h),camera=new T.PerspectiveCamera(35,w/h,1,5000);camera.position.set(pose.x,pose.y,pose.z);camera.rotation.y=GALLERY.yaw;camera.updateMatrixWorld();
  assert.ok(Math.abs(f.width/f.height-GALLERY.width/GALLERY.height)<1e-12);
  for(const x of [-332,332])for(const y of [-432,432])for(const z of [102,125]){
   const p=new T.Vector3(x,y,z).project(camera),px=(p.x+1)*w/2,py=(1-p.y)*h/2;
   assert.ok(px>0&&px<w,`${w}×${h}: horizontal frame clipping`);assert.ok(py>=top+(h<520?68:112),`${w}×${h}: header overlap`);assert.ok(py<=h-bottom-(h<520?92:132),`${w}×${h}: actions overlap`);
  }
  if(w<h&&w<450)for(const side of [-1,1]){
   const point=new T.Vector3(-side*330,0,10).applyEuler(new T.Euler(0,-side*.045,0));point.x+=side*GALLERY.spacing;point.z+=68;point.project(camera);const px=(point.x+1)*w/2;
   assert.ok(px>0&&px<w,'adjacent frame must peek into view');assert.ok(side<0?px<f.x:px>f.x+f.width,'neighbor must stay outside the main frame');
  }
 }
});
test('completion approach settles without overshoot and skips motion when requested',()=>{
 let previous=0;for(let elapsed=0;elapsed<4;elapsed+=.016){const value=completionEase(elapsed);assert.ok(value>=previous&&value<=1);previous=value;}
 assert.equal(completionEase(0),0);assert.equal(completionEase(2),1);assert.equal(completionEase(0,true),1);
});
