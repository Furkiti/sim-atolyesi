export function installButtonMotion(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled||reduced.matches)return;
  // Individual scale preserves existing translate transforms on floating controls.
  button.getAnimations().filter(animation=>animation.id==='button-press').forEach(animation=>animation.cancel());
  const press=button.animate([{scale:1},{scale:.94,offset:.24},{scale:1.025,offset:.65},{scale:1}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});press.id='button-press';
 });
}
