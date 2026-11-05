export const PROGRESS_KEY='sim-atolyesi-progress-v1';
// A completed image is a memory; this small independent record owns unlocks.
export class LevelProgress {
 constructor(storage,ids,history=[]){
  this.storage=storage;this.ids=[...ids];this.completed=new Set();
  try{const saved=JSON.parse(storage?.getItem(PROGRESS_KEY)||'[]');if(Array.isArray(saved))for(const id of saved)if(this.ids.includes(id))this.completed.add(id);}catch{}
  for(const entry of history)if(this.ids.includes(entry.id))this.completed.add(entry.id);
  this.persist();
 }
 get frontier(){let i=0;while(i<this.ids.length&&this.completed.has(this.ids[i]))i++;return i;}
 canPlay(id){const i=this.ids.indexOf(id);return i>=0&&i<=this.frontier;}
 isComplete(id){return this.completed.has(id);}
 complete(id){if(!this.ids.includes(id)||!this.canPlay(id))return false;this.completed.add(id);this.persist();return true;}
 persist(){try{this.storage?.setItem(PROGRESS_KEY,JSON.stringify([...this.completed]));}catch{}}
}
