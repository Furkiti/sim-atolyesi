// An original quiet, looping gallery score. No network/third-party audio asset.
export class GalleryMusic {
 constructor(context){
  this.context=context;this.gain=context.createGain();this.gain.gain.value=0;this.gain.connect(context.destination);
  const rate=context.sampleRate,seconds=32,offline=new OfflineAudioContext(2,rate*seconds,rate),chords=[[130.8128,164.8138,195.9977],[110,130.8128,164.8138],[87.3071,110,130.8128],[97.9989,123.4708,146.8324]];
  for(let bar=0;bar<4;bar++)for(let k=0;k<3;k++){
   const oscillator=offline.createOscillator(),gain=offline.createGain(),start=bar*8;
   oscillator.type='sine';oscillator.frequency.value=chords[bar][k];gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.065,start+2);gain.gain.setValueAtTime(.065,start+5.5);gain.gain.linearRampToValueAtTime(0,start+8);oscillator.connect(gain);gain.connect(offline.destination);oscillator.start(start);oscillator.stop(start+8);
  }
  for(let note=0;note<8;note++){const oscillator=offline.createOscillator(),gain=offline.createGain(),start=note*4+.25;oscillator.frequency.value=chords[Math.floor(note/2)][note%3]*4;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.025,start+.04);gain.gain.exponentialRampToValueAtTime(.00001,Math.min(seconds,start+3.7));oscillator.connect(gain);gain.connect(offline.destination);oscillator.start(start);oscillator.stop(Math.min(seconds,start+3.75));}
  offline.startRendering().then(buffer=>{this.source=context.createBufferSource();this.source.buffer=buffer;this.source.loop=true;this.source.connect(this.gain);this.source.start();});
 }
 setActive(active){if(this.active===active)return;this.active=active;this.gain.gain.setTargetAtTime(active?.28:0,this.context.currentTime,active?.7:.22);}
}
export function audioScene({exhibition,transitioning,finished,dialog,visible=true}){return !visible?'silent':exhibition||transitioning||finished?'gallery':dialog?'silent':'work';}
