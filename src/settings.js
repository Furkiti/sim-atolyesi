import {supplyDose} from './supply.js';
export const SETTINGS_KEY='sim-atelier-v4';
export const PROFILES={
 economy:{renderScale:.65,shadow:'off',sparkles:false,reflections:false,relief:false,movingLight:false,frameLimit:30},
 balanced:{renderScale:.85,shadow:'off',sparkles:true,reflections:true,relief:true,movingLight:true,frameLimit:60},
 quality:{renderScale:1.2,shadow:'high',sparkles:true,reflections:true,relief:true,movingLight:true,frameLimit:60}
};
export const DEFAULTS={layout:'flow',autoAdvance:true,showStats:true,profile:'balanced',...PROFILES.balanced,pourAmount:1,pace:'fast',feel:'natural',mobility:1,response:1,brushWidth:1,brushShape:'flat',grainSize:1,jarShape:'glass',pourStyle:'fan',surface:'slate',supply:'auto',paperMotion:'brush',heapDepth:1.25,controlMode:'brush',tiltSensitivity:1.25};
export function normalizeSettings(input={}){
 const s={...DEFAULTS};
 for(const key of ['autoAdvance','showStats','sparkles','reflections','relief','movingLight'])if(typeof input[key]==='boolean')s[key]=input[key];
 for(const [key,values] of Object.entries({layout:['flow','edge','dock'],shadow:['off','low','medium','high'],frameLimit:[30,45,60],pace:['fast','relaxed'],profile:['economy','balanced','quality','custom'],feel:['velvet','natural','fluid','custom'],brushShape:['flat','round','fan'],jarShape:['glass','slim','bowl'],pourStyle:['fan','ribbon','pulse'],surface:['slate','dark','kraft'],supply:['auto','generous','islands','curtain'],paperMotion:['still','brush','hands'],controlMode:['brush','tilt','hold']}))if(values.includes(input[key]))s[key]=input[key];
 for(const [key,min,max] of [['renderScale',.5,1.5],['pourAmount',.75,1.75],['mobility',.25,1.8],['response',.5,1.4],['brushWidth',.7,1.4],['grainSize',.7,1.4],['heapDepth',.8,1.6],['tiltSensitivity',.5,2.5]])if(typeof input[key]==='number'&&Number.isFinite(input[key]))s[key]=Math.max(min,Math.min(max,input[key]));
 return s;
}
export function loadSettings(storage){try{return normalizeSettings(JSON.parse(storage.getItem(SETTINGS_KEY)||'{}'))}catch{return normalizeSettings()}}
export function saveSettings(storage,settings){try{storage.setItem(SETTINGS_KEY,JSON.stringify(normalizeSettings(settings)))}catch{/* Gameplay also works when storage is unavailable. */}}
export function profileSettings(current,name){return normalizeSettings({...current,...PROFILES[name],profile:name})}
export const doseFor=supplyDose;
