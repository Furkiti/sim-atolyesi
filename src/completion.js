// Reserve separate header and action rails; the poster never sits behind buttons.
export function completionLayout(width,height,safeTop=0,safeBottom=0){
 const top=safeTop+(height<520?68:112),bottom=safeBottom+(height<520?82:112);
 const availableHeight=Math.max(100,height-top-bottom),posterHeight=Math.min(availableHeight,(width-12)*4/3)*.99;
 const posterWidth=posterHeight*.75;
 return{x:(width-posterWidth)/2,y:top+(availableHeight-posterHeight)/2,width:posterWidth,height:posterHeight};
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
