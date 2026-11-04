import {Sand,W,H} from './sand.js';
import {AtelierScene} from './scene.js';
import {Flow,PointerGate,FramePacer,rollFront} from './interaction.js';
import {loadSettings,saveSettings,profileSettings,doseFor,pourPoint} from './settings.js';
import {completionStatus,resumeIndex} from './progress.js';
const $=s=>document.querySelector(s),canvas=$('#art'),dialog=$('#settings');
import {stages} from './palette.js';
import {drawGlitter} from './coating.js';
let settings;try{settings=loadSettings(localStorage)}catch{settings=loadSettings({getItem:()=>null})}
const flow=new Flow(),gate=new PointerGate(),pacer=new FramePacer(settings.frameLimit),assets={},masks={},strokes=[];
let shakeRuns=0,nextRuns=0;
let view,sand,index=0,finished=false,pour=null,peeled=false,peel=0,readySince=0,autoKick=0;
let pointer={x:300,y:282,visible:false},previous={x:300,y:282},down=false,lastRender=0,statClock=0,fpsClock=0,frames=0,fps=0,frameMs=16.7,simMs=0,renderMs=0,moved=0;
let initialWidth=innerWidth;
// iOS browser bars may change innerHeight mid-stroke. Keep the game viewport
// stable for a width/orientation; only a real orientation change reframes it.
function stableViewport(force=false){if(force||Math.abs(innerWidth-initialWidth)>60){initialWidth=innerWidth;document.documentElement.style.setProperty('--app-height',innerHeight+'px')}}
stableViewport(true);window.addEventListener('resize',()=>stableViewport());window.addEventListener('orientationchange',()=>setTimeout(()=>stableViewport(true),150));
for(const event of ['gesturestart','gesturechange','gestureend'])document.addEventListener(event,e=>e.preventDefault(),{passive:false});
canvas.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('wheel',e=>{if(e.ctrlKey||e.target===canvas)e.preventDefault()},{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
const blockedPointers=new Map();
for(const type of ['pointerdown','pointerup'])document.addEventListener(type,e=>{
 if(e.isPrimary===false||(gate.active!==null&&e.pointerId!==gate.active)){
  blockedPointers.set(e.pointerId,performance.now());e.preventDefault();e.stopImmediatePropagation();
 }else if(type==='pointerdown')blockedPointers.delete(e.pointerId);
},{capture:true,passive:false});
document.addEventListener('click',e=>{const blocked=blockedPointers.get(e.pointerId);if(blocked!==undefined&&performance.now()-blocked<1200){e.preventDefault();e.stopImmediatePropagation();blockedPointers.delete(e.pointerId)}},{capture:true});
const paperCanvas=document.createElement('canvas');paperCanvas.width=W;paperCanvas.height=H;const pc=paperCanvas.getContext('2d');
const paperBase=document.createElement('canvas');paperBase.width=W;paperBase.height=H;const bc=paperBase.getContext('2d');bc.fillStyle='#f5e7a5';bc.fillRect(0,0,W,H);
for(let i=0;i<45000;i++){bc.fillStyle=Math.random()>.5?'#fff9d118':'#ad945212';bc.fillRect(Math.random()*W,Math.random()*H,1,1)}
const baked=document.createElement('canvas');baked.width=W;baked.height=H;const bakedContext=baked.getContext('2d');
const coat=document.createElement('canvas');coat.width=W;coat.height=H;const cc=coat.getContext('2d');
const paintMask=document.createElement('canvas');paintMask.width=W;paintMask.height=H;const mc=paintMask.getContext('2d');
const glitter=document.createElement('canvas');glitter.width=W;glitter.height=H;const tc=glitter.getContext('2d');
let lastCoated=-1;
function makeGlitter(color){drawGlitter(tc,color,W,H)}
function updateCoat(force=false,finish=false){
 if(!sand||(!force&&lastCoated===sand.coveredWeight))return;
 lastCoated=sand.coveredWeight;cc.clearRect(0,0,W,H);cc.fillStyle='#fff';
 // Seal only the tiny raster seams of an already completed coat when baking it.
 if(finish&&ready())cc.fillRect(0,0,W,H);
 else for(let k=0;k<sand.bound.length;k++)if(sand.bound[k])cc.fillRect((k%120)*5,Math.floor(k/120)*5,5,5);
 cc.globalCompositeOperation='destination-in';cc.drawImage(assets[stages[index].id],0,0);cc.globalCompositeOperation='source-in';cc.drawImage(glitter,0,0);cc.globalCompositeOperation='source-over';
 mc.clearRect(0,0,W,H);mc.drawImage(baked,0,0);mc.drawImage(coat,0,0);view?.setCoatMask(paintMask);repaintPaper();
}
const glue=document.createElement('canvas');glue.width=W;glue.height=H;const gc=glue.getContext('2d');
function repaintPaper(){
 pc.clearRect(0,0,W,H);pc.drawImage(paperBase,0,0);
 pc.globalAlpha=.035;for(let i=index;i<stages.length;i++)pc.drawImage(assets[stages[i].id],0,0);
 // The next sheet is highlighted as a whole; no tiny target needs to be found.
 if(!peeled&&peel===0){pc.globalAlpha=.10;pc.drawImage(assets[stages[index].id],0,0)}pc.globalAlpha=1;
 if(peel>0){pc.save();pc.beginPath();pc.rect(0,0,W,Math.min(H,rollFront(peel)));pc.clip();pc.drawImage(glue,0,0);pc.restore()}
 pc.drawImage(baked,0,0);pc.drawImage(coat,0,0);
 pc.globalAlpha=.96;pc.drawImage(assets.lines,0,0);pc.globalAlpha=1;view?.paperChanged();
}
let audioCtx,soundOn=true,brushSource,brushGain,pourSource,playedPour=-1;
const audioBuffers={};
async function audio(){
 if(!audioCtx){
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();brushGain=audioCtx.createGain();brushGain.gain.value=0;brushGain.connect(audioCtx.destination);
  await Promise.all(['brush','pour'].map(async id=>{try{const data=await(await fetch(`audio/${id}.m4a?v=4`)).arrayBuffer();audioBuffers[id]=await audioCtx.decodeAudioData(data)}catch(error){console.warn('Ses yüklenemedi',id,error)}}));
  if(audioBuffers.brush){brushSource=audioCtx.createBufferSource();brushSource.buffer=audioBuffers.brush;brushSource.loop=true;brushSource.connect(brushGain);brushSource.start();}
 }
 await audioCtx.resume();
}
function sound(amount=0){
 if(!audioCtx||!brushGain)return;
 brushGain.gain.setTargetAtTime(soundOn&&flow.phase==='brush'?Math.min(1,amount*5):0,audioCtx.currentTime,.035);
 if(soundOn&&flow.phase==='pour'&&flow.elapsed>=.48&&flow.elapsed<1.3&&playedPour!==flow.serial&&audioBuffers.pour){
  playedPour=flow.serial;pourSource?.stop();pourSource=audioCtx.createBufferSource();pourSource.buffer=audioBuffers.pour;pourSource.connect(audioCtx.destination);pourSource.start();
 }
 if(!soundOn&&pourSource){try{pourSource.stop()}catch{}pourSource=null;}
}
$('#sound').textContent='Ses: açık';$('#sound').setAttribute('aria-label','Sesi kapat');
$('#sound').onclick=async()=>{soundOn=!soundOn;await audio();sound(0);$('#sound').textContent=soundOn?'Ses: açık':'Ses: kapalı';$('#sound').setAttribute('aria-label',soundOn?'Sesi kapat':'Sesi aç')};
function releaseAll(){down=false;gate.cancel();strokes.length=0;sound(0)}
function closeSettings(){dialog.close();pointer.visible=false;readySince=0;}
$('#settings-open').onclick=()=>{releaseAll();pointer.visible=false;syncSettings();dialog.showModal()};
$('#settings-close').onclick=closeSettings;$('#settings-done').onclick=closeSettings;dialog.addEventListener('cancel',()=>{releaseAll();readySince=0});
function applySettings(next){
 settings=next;document.body.dataset.layout=settings.layout;$('#perf-hud').hidden=!settings.showStats;
 try{saveSettings(localStorage,settings)}catch{}
 view?.applySettings(settings);pacer.setLimit(settings.frameLimit);if(!settings.autoAdvance)autoKick=0;syncSettings();readySince=0;updateUI();
}
function syncSettings(){
 document.querySelectorAll('input[name="layout"]').forEach(e=>e.checked=e.value===settings.layout);
 for(const [id,key] of Object.entries({'auto-advance':'autoAdvance','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'}))$('#'+id).checked=settings[key];
 for(const [id,key] of Object.entries({'quality-profile':'profile','render-scale':'renderScale','shadow-quality':'shadow','frame-limit':'frameLimit','pour-amount':'pourAmount',pace:'pace'}))$('#'+id).value=settings[key];
 $('#resolution-readout').textContent='%'+Math.round(settings.renderScale*100);$('#pour-readout').textContent='%'+Math.round(settings.pourAmount*100);
}
document.querySelectorAll('input[name="layout"]').forEach(e=>e.onchange=()=>applySettings({...settings,layout:e.value,autoAdvance:e.value==='flow'}));
$('#quality-profile').onchange=e=>{if(e.target.value!=='custom')applySettings(profileSettings(settings,e.target.value))};
const checks={'auto-advance':'autoAdvance','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'};
for(const [id,key] of Object.entries(checks))$('#'+id).onchange=e=>applySettings({...settings,[key]:e.target.checked,profile:['autoAdvance','showStats'].includes(key)?settings.profile:'custom'});
for(const [id,key,numeric] of [['render-scale','renderScale',true],['pour-amount','pourAmount',true],['shadow-quality','shadow',false],['frame-limit','frameLimit',true],['pace','pace',false]]){
 $('#'+id).addEventListener(id.includes('scale')||id.includes('amount')?'input':'change',e=>applySettings({...settings,[key]:numeric?Number(e.target.value):e.target.value,profile:['renderScale','shadow','frameLimit'].includes(key)?'custom':settings.profile}));
}
function ready(){return sand&&completionStatus(sand.coverage).ready}
function updateUI(){
 if(!sand)return;
 const phase=flow.phase,percent=completionStatus(sand.coverage).percent;
 $('#stage-label').textContent=`${String(index+1).padStart(2,'0')} / ${stages.length}`;$('#stage-label').title=stages[index].name;$('#color-dot').style.background=stages[index].color;
 $('#coverage').textContent=percent+'%';$('#progress-fill').style.width=percent+'%';
 const messages={peel:['↗','Bir kez dokun.','Sıradaki kâğıt rulolanarak açılsın.','SOY'],rolling:['↗','Kâğıt açılıyor…','Açılan kahverengi alan simi tutacak.','SOY'],pour:['⠿','Bir yığın parıltı.','Kap boşalsın; sonra simi parmağınla yay.','DÖK'],brush:['▰','Yığından başla, kenarlara yay.','Sim yetmezse + Sim ile bir yığın daha ekle.','YAY'],shake:['≋','Kâğıt bükülüyor…','Yapışan parıltılar kâğıtta kalır.','BOŞALT'],complete:['✧','Ellerine sağlık.','Biraz sabır, binlerce küçük parıltı.','BİTTİ']};
 const m=messages[phase]||messages.brush;$('#phase-icon').textContent=m[0];$('#instruction-title').textContent=m[1];$('#instruction-text').textContent=phase==='brush'&&settings.layout!=='flow'?'Sim ekle ile açık alanın üstüne yeni bir yığın dökebilirsin.':m[2];$('#phase-label').textContent=m[3];
 const canNext=phase==='brush'&&ready()&&!finished;
 $('#next').hidden=!canNext;$('#next').disabled=!canNext;$('#next').innerHTML=index===stages.length-1?'Eserini tamamla <span>✧</span>':'Sonraki renk <span>→</span>';
 $('#auto-status').hidden=true;
 if(canNext){$('#instruction-title').textContent='Renk tamamlandı.';$('#instruction-text').textContent=settings.autoAdvance?'Parmağını kaldır; sıradaki renge geçelim.':'Sonraki renk ile devam et.';}
 $('#quick-actions').hidden=phase!=='brush'||finished||canNext;
 for(const button of document.querySelectorAll('[data-tool]')){
  const t=button.dataset.tool,selected=t===(phase==='shake'?'clean':phase==='rolling'?'peel':phase);
  button.classList.toggle('selected',selected);button.disabled=finished||flow.busy||(t==='peel'?phase!=='peel':phase==='peel');
 }
}
function activate(){
 sand=new Sand();sand.setMask(masks[stages[index].id]);flow.reset();peeled=false;peel=0;pour=null;readySince=0;strokes.length=0;
 gc.clearRect(0,0,W,H);gc.fillStyle='#b98e65';gc.fillRect(0,0,W,H);gc.globalCompositeOperation='destination-in';gc.drawImage(assets[stages[index].id],0,0);gc.globalCompositeOperation='source-over';
 makeGlitter(stages[index].color);lastCoated=-1;cc.clearRect(0,0,W,H);view.setStage(index);updateCoat(true);repaintPaper();view.setPeelMask(assets[stages[index].id],stages[index].pour);updateUI();
}
function beginRoll(){if(soundOn)audio();if(finished||!flow.roll())return;down=false;strokes.length=0;peel=0;updateUI()}
function prepareDose(){
 const amount=doseFor(sand.targetCount,settings,sand.capacity);
 if(sand.capacity-sand.count<amount){sand.compact();view.currentInitialized=0;}
 const dose=doseFor(sand.targetCount,settings,sand.capacity-sand.count);
 if(dose<50){flow.phase='brush';$('#instruction-text').textContent='Kâğıtta bol sim var. Önce yay veya fazlasını silkele.';return;}
 let anchor=stages[index].pour;
 // Refill over unfinished adhesive, rather than repeatedly burying a finished patch.
 if(sand.coverage>.15){let best=-Infinity;const referenceY=anchor.y;
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]>12&&!sand.bound[k]){
   const x=k%120*5+2,y=Math.floor(k/120)*5+2;if(!sand.onGlue(x,y))continue;
   let nearby=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const q=k+dy*120+dx;if(q>=0&&q<sand.target.length&&!sand.bound[q])nearby+=sand.target[q];}
   const score=nearby-Math.abs(y-referenceY)*1.2;if(score>best){best=score;anchor={x,y};}
  }
 }
 playedPour=-1;pour={...anchor,anchor,dose,emitted:0,elapsed:0};
}
function addSand(){if(finished||!flow.pour())return;down=false;strokes.length=0;prepareDose();readySince=0;updateUI()}
function startShake(advance=false){if(finished||!flow.shake(advance))return;shakeRuns++;releaseAll();pour=null;view.posePour(null);readySince=0;updateUI()}
function nextStage(){
 nextRuns++;updateCoat(true,true);bakedContext.drawImage(coat,0,0);view.updateGrains(sand);
 if(index<stages.length-1){index++;activate();autoKick=settings.autoAdvance?.22:0;}
 else{finished=true;flow.phase='complete';pointer.visible=false;view.current.visible=false;view.heap.visible=false;$('#complete').hidden=false;updateUI();}
}
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{const t=button.dataset.tool;if(t==='peel')beginRoll();else if(t==='pour')addSand();else if(t==='clean')startShake(false);else updateUI()};
$('#add-sand').onclick=addSand;$('#shake').onclick=()=>startShake(false);$('#next').onclick=()=>{if(ready())startShake(true)};
function reset(){if(!view)return;releaseAll();finished=false;index=0;autoKick=0;bakedContext.clearRect(0,0,W,H);cc.clearRect(0,0,W,H);view.reset();$('#complete').hidden=true;activate()}
$('#reset').onclick=()=>{reset();closeSettings()};$('#again').onclick=reset;
$('#save').onclick=()=>{const a=document.createElement('a');a.href=view.capture();a.download='sim-atolyesi-gotham.png';a.click()};
canvas.addEventListener('pointerdown',e=>{
 e.preventDefault();if(!view||finished||flow.busy||!gate.begin(e.pointerId,e.isPrimary!==false))return;
 canvas.setPointerCapture(e.pointerId);pointer={...view.mapPointer(e),visible:true};previous={...pointer};
 if(soundOn)audio();
 if(flow.phase==='peel'){beginRoll();return;}
 down=true;
});
canvas.addEventListener('pointermove',e=>{
 if(!view||finished||e.isPrimary===false)return;
 if(gate.active===null&&e.pointerType==='mouse'&&!e.buttons){pointer={...view.mapPointer(e),visible:true};return;}
 if(!gate.owns(e.pointerId)||!down||flow.phase!=='brush')return;
 const p=view.mapPointer(e);pointer={...p,visible:true};
 if(Math.hypot(p.x-previous.x,p.y-previous.y)>.1){strokes.push({from:{...previous},to:{...p}});if(strokes.length>18)strokes.splice(0,strokes.length-18)}previous=p;
});
function pointerEnd(e){if(!gate.end(e.pointerId))return;down=false;if(e.pointerType!=='mouse')pointer.visible=false;sound(0);updateUI()}
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,pointerEnd);
canvas.addEventListener('pointerleave',e=>{if(gate.active===null)pointer.visible=false});window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',releaseAll);
function updateStats(){
 const s=sand.stats(),m=view.metrics();
 Object.assign(canvas.dataset,{version:'4.1',phase:flow.phase,layout:settings.layout,activePointer:gate.active??'',emitted:s.emitted,air:s.air,free:s.free,bound:s.bound,lost:s.lost,coverage:s.coverage.toFixed(5),height:s.maxHeight.toFixed(2),stage:index,detached:view.spill.count,triangles:m.triangles,draws:m.draws,shakes:shakeRuns,advances:nextRuns,cameraZ:view.camera.position.z.toFixed(2),fps:Math.round(fps),flowSerial:flow.serial,shaking:flow.phase==='shake'?1:0});
 $('#hud-fps').textContent=Math.round(fps)+' FPS';$('#hud-detail').textContent=frameMs.toFixed(1)+' ms';
 for(const [id,value] of Object.entries({'stat-fps':Math.round(fps),'stat-frame':frameMs.toFixed(1),'stat-sim':simMs.toFixed(1),'stat-render':renderMs.toFixed(1),'stat-particles':(s.air+s.free+view.spill.count).toLocaleString('tr'),'stat-draws':m.draws,'stat-triangles':m.triangles.toLocaleString('tr'),'stat-memory':performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1):'—'}))$('#'+id).textContent=value;
 $('#buffer-size').textContent=`${m.width} × ${m.height} piksel · oyun sıfırlanmaz`;
}
function frame(t){
 requestAnimationFrame(frame);if(document.hidden)return;
 const delta=t-lastRender;if(!pacer.shouldRender(t))return;
 const dt=Math.min(lastRender?delta/1000:1/60,.06);if(!lastRender)fpsClock=t;lastRender=t;frames++;
 if(t-fpsClock>=700){fps=frames*1000/(t-fpsClock);fpsClock=t;frames=0;}
 frameMs=frameMs*.9+(dt*1000)*.1;const simStart=performance.now();moved=0;
 if(autoKick>0&&!dialog.open){autoKick-=dt;if(autoKick<=0)beginRoll()}
 if(flow.phase==='rolling'){peel=flow.progress;repaintPaper();view.peelProgress(peel);}
 if(flow.phase==='pour'&&pour){
  pour.elapsed=flow.elapsed;Object.assign(pour,pourPoint(masks[stages[index].id],pour.anchor,Math.max(0,(flow.elapsed-.48)/.82)));view.posePour(pour);
  const fraction=Math.min(1,Math.max(0,(flow.elapsed-.48)/.82)),desired=Math.floor(pour.dose*fraction),n=desired-pour.emitted;
  if(n>0){const source=view.pourOrigin();pour.emitted+=sand.emit(source.x,source.y,n,{spread:7,height:Math.max(12,source.z)});Object.assign(canvas.dataset,{emitterX:source.x.toFixed(2),emitterY:source.y.toFixed(2),emitterZ:source.z.toFixed(2)});}
 }
 for(const stroke of strokes)moved+=sand.brush(stroke.from,stroke.to,settings.pace==='fast'?48:39);strokes.length=0;
 sand.step(Math.min(dt,.04),{shaking:flow.phase==='shake'});
 view.collectSpill(sand,true);
 const event=flow.tick(dt);
 if(event==='rolled'){peeled=true;peel=1;repaintPaper();view.peelProgress(1);prepareDose();updateUI()}
 if(event==='poured'){pour=null;view.posePour(null);updateUI()}
 if(event==='shaken'||event==='advance'){
  view.collectSpill(sand);sand.removeLoose();sand.compact();view.currentInitialized=0;
  if(event==='advance')nextStage();else updateUI();
 }
 if(settings.autoAdvance&&flow.phase==='brush'&&ready()&&gate.active===null&&!dialog.open&&!finished){readySince+=dt;if(readySince>.55)startShake(true)}else readySince=0;
 // Commit new coverage before bound grains leave the moving mesh, avoiding a blank frame.
 updateCoat();
 simMs=simMs*.85+(performance.now()-simStart)*.15;
 sound(flow.phase==='pour'?.14:flow.phase==='shake'?.15:flow.phase==='rolling'?.06:moved?Math.min(.16,.015+moved*.00003):0);
 const drawStart=performance.now();view.render(sand,{time:t,dt,phase:flow.phase,down,pointer,peeled,pour,shakeProgress:flow.phase==='shake'?flow.progress:0,finished});renderMs=renderMs*.85+(performance.now()-drawStart)*.15;
 if((statClock+=dt)>.2){statClock=0;updateUI();updateStats();}
}
applySettings(settings);
try{
 await Promise.all(['lines',...stages.map(s=>s.id)].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[id]=im;resolve()};im.onerror=()=>reject(Error('Şablon yüklenemedi: '+id));im.src=`assets/${id}.png?v=4`})));
 for(const stage of stages){gc.clearRect(0,0,W,H);gc.drawImage(assets[stage.id],0,0);const data=gc.getImageData(0,0,W,H).data,mask=new Uint8Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=data[i*4+3]>80?1:0;masks[stage.id]=mask;}
 index=resumeIndex(location.search,stages.length);
 for(let i=0;i<index;i++){
  makeGlitter(stages[i].color);cc.clearRect(0,0,W,H);cc.drawImage(glitter,0,0);cc.globalCompositeOperation='destination-in';cc.drawImage(assets[stages[i].id],0,0);cc.globalCompositeOperation='source-over';bakedContext.drawImage(coat,0,0);
 }
 cc.clearRect(0,0,W,H);repaintPaper();view=new AtelierScene(canvas,paperCanvas,stages.map(s=>s.color),settings);activate();requestAnimationFrame(frame);
}catch(error){$('#instruction-title').textContent='Atölye açılamadı.';$('#instruction-text').textContent='Sayfayı güncel bir tarayıcıda yenileyerek tekrar dene.';console.error(error);}
