export const SETTINGS_KEY='sim-atelier-v3';
export const PROFILES={
 economy:{renderScale:.65,shadow:'off',sparkles:false,reflections:false,relief:false,movingLight:false,frameLimit:30},
 balanced:{renderScale:.9,shadow:'low',sparkles:true,reflections:true,relief:true,movingLight:true,frameLimit:60},
 quality:{renderScale:1.2,shadow:'high',sparkles:true,reflections:true,relief:true,movingLight:true,frameLimit:60}
};
export const DEFAULTS={layout:'flow',autoAdvance:true,showStats:true,profile:'balanced',...PROFILES.balanced,pourAmount:1,pace:'fast'};
export function normalizeSettings(input={}){
 const s={...DEFAULTS};
 for(const key of ['autoAdvance','showStats','sparkles','reflections','relief','movingLight'])if(typeof input[key]==='boolean')s[key]=input[key];
 for(const [key,values] of Object.entries({layout:['flow','edge','dock'],shadow:['off','low','medium','high'],frameLimit:[30,45,60],pace:['fast','relaxed'],profile:['economy','balanced','quality','custom']}))if(values.includes(input[key]))s[key]=input[key];
 for(const [key,min,max] of [['renderScale',.5,1.5],['pourAmount',.75,1.75]])if(typeof input[key]==='number'&&Number.isFinite(input[key]))s[key]=Math.max(min,Math.min(max,input[key]));
 return s;
}
export function loadSettings(storage){try{return normalizeSettings(JSON.parse(storage.getItem(SETTINGS_KEY)||'{}'))}catch{return normalizeSettings()}}
export function saveSettings(storage,settings){try{storage.setItem(SETTINGS_KEY,JSON.stringify(normalizeSettings(settings)))}catch{/* Gameplay also works when storage is unavailable. */}}
export function profileSettings(current,name){return normalizeSettings({...current,...PROFILES[name],profile:name})}
export function completionThreshold(settings){return settings.pace==='fast'?.8:.9}
export function doseFor(areaCells,settings,remaining){return Math.min(remaining,Math.ceil(Math.max(11000,Math.min(48000,areaCells*13))*settings.pourAmount))}
export const PILE_CENTER={x:300,y:282};
