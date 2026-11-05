import test from 'node:test';import assert from 'node:assert/strict';import {GalleryHistory,blurPixels} from '../src/gallery.js';
const image='data:image/jpeg;base64,AAAA',entry=(id,n)=>({id,image,completedAt:n}),ids=['a','b','c','d','e','f','g'];
function storage(){const map=new Map();return{getItem:key=>map.get(key),setItem:(key,value)=>map.set(key,value)}}
test('only completed artwork is remembered across level navigations, with the previous distinct artwork on the left',()=>{
 const saved=storage(),first=new GalleryHistory(saved,ids);assert.equal(first.previous('a'),null);first.remember(entry('a',1));assert.equal(first.previous('a'),null);
 const second=new GalleryHistory(saved,ids);assert.equal(second.previous('b').id,'a');second.remember(entry('b',2));second.remember(entry('b',3));assert.equal(second.entries.length,2);
 const third=new GalleryHistory(saved,ids);assert.equal(third.previous('b').id,'a');assert.equal(third.previous('c').id,'b');assert.equal(third.entries[0].completedAt,3);
});
test('gallery storage is bounded and ignores corrupt, disabled or non-image entries',()=>{
 const saved=storage(),gallery=new GalleryHistory(saved,ids);for(let n=0;n<ids.length;n++)gallery.remember(entry(ids[n],n));assert.equal(gallery.entries.length,6);assert.equal(gallery.entries.at(-1).id,'b');
 gallery.remember(entry('closed',8));gallery.remember({...entry('a',9),image:'data:image/svg+xml,script'});gallery.remember({...entry('a',9),image:'data:image/jpeg;base64,'+'A'.repeat(550000)});assert.equal(gallery.entries[0].id,'g');
 assert.deepEqual(new GalleryHistory({getItem:()=>'{broken'},ids).entries,[]);
 const restored=new GalleryHistory({getItem:()=>JSON.stringify([entry('closed',1),entry('a',2),entry('a',3),{id:'b',image}])},ids);assert.deepEqual(restored.entries.map(item=>item.id),['a']);
});
test('private or full storage does not interrupt completion or its in-memory gallery',()=>{
 const gallery=new GalleryHistory({getItem:()=>{throw Error('blocked')},setItem:()=>{throw Error('full')}},ids);gallery.remember(entry('a',1));gallery.remember(entry('b',2));assert.equal(gallery.previous('b').id,'a');
});
test('the next poster is blurred once with opaque edges and no mutation of the sharp source',()=>{
 const w=31,h=31,pixels=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const offset=(y*w+x)*4;pixels[offset]=pixels[offset+1]=pixels[offset+2]=(x+y)%2?255:0;pixels[offset+3]=255;}
 const copy=pixels.slice(),blurred=blurPixels(pixels,w,h);assert.deepEqual(pixels,copy);let low=255,high=0;for(let i=0;i<w*h;i++){low=Math.min(low,blurred[i*4]);high=Math.max(high,blurred[i*4]);assert.equal(blurred[i*4+3],255);}assert.ok(high-low<60);
 const flat=new Uint8ClampedArray(5*7*4).fill(123);assert.deepEqual(blurPixels(flat,5,7),flat);
});
