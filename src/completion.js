export const GALLERY={width:660,height:860,spacing:810,yaw:.075};
// Fit the complete frame between the header/actions, leaving room for adjacent artworks.
export function completionLayout(width,height,safeTop=0,safeBottom=0){
 const top=safeTop+(height<520?68:112),bottom=safeBottom+(height<520?92:132),ratio=GALLERY.width/GALLERY.height;
 const availableHeight=Math.max(100,height-top-bottom),posterHeight=Math.min(availableHeight,width*.65/ratio)*.96,posterWidth=posterHeight*ratio;
 return{x:(width-posterWidth)/2,y:top+(availableHeight-posterHeight)/2,width:posterWidth,height:posterHeight};
}
export function galleryCamera(frame,height,fov=35){
 const tan=Math.tan(fov*Math.PI/360),distance=GALLERY.height*height/(2*tan*frame.height);
 return{x:Math.sin(GALLERY.yaw)*distance,y:((frame.y+frame.height/2)/height-.5)*2*tan*distance,z:110+Math.cos(GALLERY.yaw)*distance,distance};
}
export function completionEase(elapsed,reduced=false){const t=Math.max(0,Math.min(1,reduced?1:elapsed/1.65));return t*t*(3-2*t)}
export async function posterBlob(source){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;
 canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Poster hazırlanamadı')),'image/png'));
}
export function downloadPoster(blob,id){
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`sim-atolyesi-${id}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
