import {supplyDose} from './supply.js';
import {GAME_SPEEDS} from './game-clock.js';
export const SETTINGS_KEY='sim-atelier-v4';
export const PROFILES={
 economy:{renderScale:.65,shadow:'off',sparkles:false,reflections:false,relief:false,movingLight:false,frameLimit:30},
 balanced:{renderScale:.85,shadow:'off',sparkles:true,reflections:true,relief:true,movingLight:true,frameLimit:60},
 quality:{renderScale:1.2,shadow:'high',sparkles:true,reflections:true,relief:true,movingLight:true,frameLimit:60}
};
export const DEFAULTS={gameSpeed:1,layout:'flow',autoAdvance:true,extraFinish:false,finishStyle:'tap',posterShine:'classic',galleryMusic:true,showStats:true,profile:'balanced',...PROFILES.balanced,pourAmount:1,pace:'fast',feel:'natural',mobility:1,response:1,brushWidth:1,brushShape:'flat',grainSize:1,jarShape:'glass',pourStyle:'fan',surface:'slate',supply:'auto',paperMotion:'brush',heapDepth:1.25,controlMode:'hold',tiltSensitivity:1.25,holdDensity:5,holdGrainSize:1.7,holdRows:1,holdPlacement:'width',holdPresetVersion:22,entryMode:'classic',recovery:'classic'};
export function normalizeSettings(input={}){
 const s={...DEFAULTS};
 for(const key of ['autoAdvance','extraFinish','galleryMusic','showStats','sparkles','reflections','relief','movingLight'])if(typeof input[key]==='boolean')s[key]=input[key];
 for(const [key,values] of Object.entries({gameSpeed:GAME_SPEEDS,layout:['flow','edge','dock'],shadow:['off','low','medium','high'],frameLimit:[30,45,60],pace:['fast','relaxed'],profile:['economy','balanced','quality','custom'],feel:['velvet','natural','fluid','custom'],brushShape:['flat','round','fan'],jarShape:['glass','slim','bowl'],pourStyle:['fan','ribbon','pulse'],surface:['slate','dark','kraft'],supply:['auto','generous','islands','curtain'],paperMotion:['still','brush','hands'],controlMode:['brush','tilt','hold'],holdRows:[1,2],holdPlacement:['sheet','width','local','joined'],finishStyle:['tap','variety'],posterShine:['classic','radiant'],entryMode:['classic','direct'],recovery:['classic','trough','rills','bowl','table']}))if(values.includes(input[key]))s[key]=input[key];
 for(const [key,min,max] of [['renderScale',.5,1.5],['pourAmount',.75,1.75],['mobility',.25,1.8],['response',.5,1.4],['brushWidth',.7,1.4],['grainSize',.7,1.4],['heapDepth',.8,1.6],['tiltSensitivity',.5,2.5],['holdDensity',.5,8],['holdGrainSize',.7,4]])if(typeof input[key]==='number'&&Number.isFinite(input[key]))s[key]=Math.max(min,Math.min(max,input[key]));
 return s;
}
export function loadSettings(storage){try{
 const input=JSON.parse(storage.getItem(SETTINGS_KEY)||'{}')||{};
 // Apply the newly requested play preset once; subsequent adjustments persist.
 if(input.holdPresetVersion!==22)Object.assign(input,{controlMode:'hold',holdPlacement:'width',holdDensity:5,holdGrainSize:1.7,extraFinish:false});
 return normalizeSettings(input);
}catch{return normalizeSettings()}}
export function saveSettings(storage,settings){try{storage.setItem(SETTINGS_KEY,JSON.stringify(normalizeSettings(settings)))}catch{/* Gameplay also works when storage is unavailable. */}}
export function profileSettings(current,name){return normalizeSettings({...current,...PROFILES[name],profile:name})}
export const doseFor=supplyDose;

export const HOLD_INACTIVE=['layout','autoAdvance','pace','feel','supply','pourAmount','paperMotion','mobility','response','brushShape','brushWidth','grainSize','pourStyle','tiltSensitivity'];
export function settingAvailable(key,mode){return !(mode==='hold'&&HOLD_INACTIVE.includes(key));}
