import {W,H} from './sand.js';
import {loadGalleryImage} from './gallery.js';
// Keep the current and neighbouring level ready. In-flight requests are shared.
export class LevelLoader {
 constructor(){this.cache=new Map();}
 load(level){
  if(this.cache.has(level.id)){const pending=this.cache.get(level.id);this.cache.delete(level.id);this.cache.set(level.id,pending);return pending;}
  const pending=Promise.all([level.lines,...level.stages.map(s=>s.id)].map(async id=>[id,await loadGalleryImage(`assets/${id}.png?v=30`)])).then(entries=>{
   const assets=Object.fromEntries(entries),masks={},canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const c=canvas.getContext('2d',{willReadFrequently:true});
   for(const stage of level.stages){c.clearRect(0,0,W,H);c.drawImage(assets[stage.id],0,0);const pixels=c.getImageData(0,0,W,H).data,mask=new Uint8Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=Number(pixels[i*4+3]>80);masks[stage.id]=mask;}
   assets.lines=assets[level.lines];return{assets,masks};
  }).catch(error=>{this.cache.delete(level.id);throw error;});
  this.cache.set(level.id,pending);while(this.cache.size>3)this.cache.delete(this.cache.keys().next().value);return pending;
 }
}
