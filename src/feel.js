// Material response and tool dimensions are shared by simulation and rendering.
export const FEELS={
 velvet:{name:'Kadife',note:'Ağır taneler, dar iz, kısa kayış.',mobility:.45,response:.75,brushWidth:.9,brushShape:'round',grainSize:.9,jarShape:'slim',pourStyle:'ribbon'},
 natural:{name:'Doğal',note:'Fırçanın önünde birikir, kenarlardan hafifçe açılır.',mobility:1,response:1,brushWidth:1,brushShape:'flat',grainSize:1,jarShape:'glass',pourStyle:'fan'},
 fluid:{name:'Akışkan',note:'Daha geniş yelpaze, daha uzun kayış.',mobility:1.6,response:1.2,brushWidth:1.1,brushShape:'fan',grainSize:1.08,jarShape:'bowl',pourStyle:'pulse'}
};
export const BRUSHES={flat:{radius:34,width:68,depth:26},round:{radius:23,width:46,depth:38},fan:{radius:46,width:92,depth:30}};
export function brushRadius(s){return (BRUSHES[s.brushShape]||BRUSHES.flat).radius*(s.brushWidth||1)}
export function materialResponse(s={}){
 const mobility=s.mobility??1,response=s.response??1;
 return {mobility,response,drag:19-mobility*6,pressure:.45+mobility*.55,repose:6-mobility*1.5,carry:Math.min(.98,.65+response*.25),fan:.08+mobility*.18,inertia:8+mobility*24};
}
export function feelSettings(current,id){return {...current,...FEELS[id],feel:id}}
export function pourFraction(t,style='fan'){
 const u=Math.max(0,Math.min(1,t));
 // Cumulative, monotone emission: changing stream shape never adds material.
 return style==='pulse'?u-Math.sin(u*Math.PI*6)*.65/(Math.PI*6):style==='ribbon'?u*u*(3-2*u):u;
}
