const KEY='sim-atolyesi-gallery-v1',LIMIT=6;
export class GalleryHistory{
 constructor(storage,ids){this.storage=storage;this.ids=new Set(ids);this.entries=[];try{const saved=JSON.parse(storage?.getItem(KEY)||'[]');if(Array.isArray(saved))for(const entry of saved)this.accept(entry);}catch{}}
 valid(entry){return entry&&this.ids.has(entry.id)&&typeof entry.image==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(entry.image)&&entry.image.length<550000&&Number.isFinite(entry.completedAt)}
 accept(entry){if(!this.valid(entry)||this.entries.some(item=>item.id===entry.id)||this.entries.length>=LIMIT)return;this.entries.push({id:entry.id,image:entry.image,completedAt:entry.completedAt})}
 previous(id){return this.entries.find(entry=>entry.id!==id)||null}
 remember(entry){if(!this.valid(entry))return;this.entries=this.entries.filter(item=>item.id!==entry.id);this.entries.unshift({id:entry.id,image:entry.image,completedAt:entry.completedAt});this.entries.length=Math.min(this.entries.length,LIMIT);try{this.storage?.setItem(KEY,JSON.stringify(this.entries))}catch{}}
}
export function galleryThumbnail(source){const canvas=document.createElement('canvas');canvas.width=480;canvas.height=640;canvas.getContext('2d').drawImage(source,0,0,480,640);return canvas.toDataURL('image/jpeg',.86)}
export function loadGalleryImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Galeri önizlemesi yüklenemedi'));image.src=src})}
// Small, separable box passes run once per preview, including on Safari without canvas filters.
export function blurPixels(input,width,height,radius=3,passes=3){
 let data=new Uint8ClampedArray(input),temp=new Uint8ClampedArray(input.length);
 for(let pass=0;pass<passes;pass++)for(const horizontal of [true,false]){
  const length=horizontal?width:height,lines=horizontal?height:width;
  for(let line=0;line<lines;line++)for(let channel=0;channel<4;channel++){
   let sum=0;const offset=n=>(horizontal?line*width+Math.max(0,Math.min(length-1,n)):Math.max(0,Math.min(length-1,n))*width+line)*4+channel;
   for(let n=-radius;n<=radius;n++)sum+=data[offset(n)];
   for(let n=0;n<length;n++){temp[offset(n)]=sum/(radius*2+1);sum+=data[offset(n+radius+1)]-data[offset(n-radius)];}
  }
  [data,temp]=[temp,data];
 }
 return data;
}
export function galleryPicture(image,blur=false){
 const canvas=document.createElement('canvas');canvas.width=blur?75:480;canvas.height=blur?100:640;const context=canvas.getContext('2d');context.drawImage(image,0,0,canvas.width,canvas.height);
 if(blur){const pixels=context.getImageData(0,0,75,100);pixels.data.set(blurPixels(pixels.data,75,100));context.putImageData(pixels,0,0);}
 return canvas;
}
