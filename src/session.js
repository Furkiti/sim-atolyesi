export const SESSION_KEY='sim-atolyesi-session-v1';
// Persist completed colour boundaries, not volatile falling particle arrays.
export class AtelierSession {
 constructor(storage,levels){
  this.storage=storage;this.levels=levels;this.stages={};this.last=null;
  try{const data=JSON.parse(storage?.getItem(SESSION_KEY)||'null');if(data&&typeof data==='object'){if(levels.some(l=>l.id===data.last))this.last=data.last;for(const l of levels){const entry=data.stages?.[l.id];if(entry&&Number.isInteger(entry.index)&&entry.index>=0&&entry.index<l.stages.length&&typeof entry.finished==='boolean')this.stages[l.id]={index:entry.index,finished:entry.finished};}}}catch{}
 }
 checkpoint(id,index,finished=false){const level=this.levels.find(l=>l.id===id);if(!level||!Number.isInteger(index)||index<0||index>=level.stages.length)return;this.stages[id]={index,finished:!!finished};this.last=id;this.persist();}
 focus(id){if(!this.levels.some(l=>l.id===id))return;this.last=id;this.persist();}
 persist(){try{this.storage?.setItem(SESSION_KEY,JSON.stringify({last:this.last,stages:this.stages}));}catch{}}
 start(search,progression,history=[]){
  const requested=new URLSearchParams(search).get('bolum'),fallback=this.levels[Math.min(progression.frontier,this.levels.length-1)],id=requested||this.last||history[0]?.id||fallback.id;
  const level=this.levels.find(l=>l.id===id)||fallback,entry=this.stages[level.id];
  // A locked gallery frame may be remembered, but never becomes playable.
  const active=progression.canPlay(level.id)?level:fallback,saved=this.stages[active.id];
  return {level:active,focus:level.id,index:saved?.index||0,finished:saved?.finished??progression.isComplete(active.id)};
 }
}
