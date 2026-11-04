import {Sand,W,H} from './sand.js';
import {AtelierScene} from './scene.js';
import {Flow,PointerGate,FramePacer,drainPose,appendStroke} from './interaction.js';
import {loadSettings,saveSettings,profileSettings,doseFor} from './settings.js';
import {planPour,pourPoint} from './pouring.js';
import {completionStatus,resumeIndex} from './progress.js';
const $=s=>document.querySelector(s),canvas=$('#art'),dialog=$('#settings');
import {levels,selectLevel} from './levels.js';
import {FEELS,feelSettings,brushRadius,pourFraction} from './feel.js';
const level=selectLevel(location.search),stages=level.stages;
import {drawGlitter} from './coating.js';
import {piecesByStage} from './peel-pieces.js';
import {peelAt,peelDuration,revealPolygon} from './peel.js';
let settings;try{settings=loadSettings(localStorage)}catch{settings=loadSettings({getItem:()=>null})}
const flow=new Flow(),gate=new PointerGate(),pacer=new FramePacer(settings.frameLimit),assets={},masks={},strokes=[];
let shakeRuns=0,nextRuns=0,partLayers=[],activePart=0,revealedParts=0;
let view,sand,index=0,finished=false,pour=null,peeled=false,peel=0,readySince=0,autoKick=0;
let pointer={x:300,y:282,visible:false},previous={x:300,y:282},down=false,lastRender=0,statClock=0,fpsClock=0,frames=0,fps=0,frameMs=16.7,simMs=0,renderMs=0,moved=0;
let pointerTime=0;
let brushMotion={dx:0,dy:0,speed:0,load:0};
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
 pc.drawImage(glue,0,0);
 if(flow.phase==='rolling'&&partLayers[activePart]){
  const layer=partLayers[activePart],polygon=revealPolygon(layer.piece,peel);
  if(polygon.length){pc.save();pc.beginPath();polygon.forEach((p,i)=>i?pc.lineTo(p.x,p.y):pc.moveTo(p.x,p.y));pc.closePath();pc.clip();pc.drawImage(layer.brown,layer.piece.bounds.x,layer.piece.bounds.y);pc.restore();}
 }
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
 brushGain.gain.setTargetAtTime(soundOn&&flow.phase==='brush'?Math.min(1,amount*5*(.8+brushMotion.load*.35)):0,audioCtx.currentTime,.035);
 if(brushSource)brushSource.playbackRate.setTargetAtTime(.85+Math.min(.35,brushMotion.speed/1800),audioCtx.currentTime,.06);
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
 const previousSurface=settings?.surface;settings=next;document.body.dataset.layout=settings.layout;$('#perf-hud').hidden=!settings.showStats;
 try{saveSettings(localStorage,settings)}catch{}
 sand?.setBehavior(settings);view?.applySettings(settings);
 if(partLayers.length&&previousSurface!==settings.surface){for(const layer of partLayers)paintGlue(layer);gc.clearRect(0,0,W,H);const count=revealedParts;revealedParts=0;revealUntil(count);repaintPaper();}pacer.setLimit(settings.frameLimit);if(!settings.autoAdvance)autoKick=0;syncSettings();readySince=0;updateUI();
}
function syncSettings(){
 document.querySelectorAll('input[name="layout"]').forEach(e=>e.checked=e.value===settings.layout);
 for(const [id,key] of Object.entries({'auto-advance':'autoAdvance','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'}))$('#'+id).checked=settings[key];
 for(const [id,key] of Object.entries({'quality-profile':'profile','render-scale':'renderScale','shadow-quality':'shadow','frame-limit':'frameLimit','pour-amount':'pourAmount',pace:'pace','brush-shape':'brushShape','jar-shape':'jarShape','pour-style':'pourStyle','surface-style':'surface','brush-width':'brushWidth','grain-size':'grainSize',mobility:'mobility',response:'response'}))$('#'+id).value=settings[key];
 document.querySelectorAll('input[name=feel]').forEach(e=>e.checked=e.value===settings.feel);
 for(const [id,key] of [['mobility','mobility'],['response','response'],['brush-width','brushWidth'],['grain-size','grainSize']])$('#'+id+'-readout').textContent='%'+Math.round(settings[key]*100);
 $('#feel-name').textContent=FEELS[settings.feel]?.name||'Özel karışım';
 $('#resolution-readout').textContent='%'+Math.round(settings.renderScale*100);$('#pour-readout').textContent='%'+Math.round(settings.pourAmount*100);
}
document.querySelectorAll('input[name="layout"]').forEach(e=>e.onchange=()=>applySettings({...settings,layout:e.value,autoAdvance:e.value==='flow'}));
$('#quality-profile').onchange=e=>{if(e.target.value!=='custom')applySettings(profileSettings(settings,e.target.value))};
const checks={'auto-advance':'autoAdvance','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'};
for(const [id,key] of Object.entries(checks))$('#'+id).onchange=e=>applySettings({...settings,[key]:e.target.checked,profile:['autoAdvance','showStats'].includes(key)?settings.profile:'custom'});
for(const [id,key,numeric] of [['render-scale','renderScale',true],['pour-amount','pourAmount',true],['shadow-quality','shadow',false],['frame-limit','frameLimit',true],['pace','pace',false]]){
 $('#'+id).addEventListener(id.includes('scale')||id.includes('amount')?'input':'change',e=>applySettings({...settings,[key]:numeric?Number(e.target.value):e.target.value,profile:['renderScale','shadow','frameLimit'].includes(key)?'custom':settings.profile}));
}
document.querySelectorAll('input[name=feel]').forEach(e=>e.onchange=()=>applySettings(feelSettings(settings,e.value)));
for(const [id,key,numeric] of [['brush-shape','brushShape',false],['jar-shape','jarShape',false],['pour-style','pourStyle',false],['surface-style','surface',false],['brush-width','brushWidth',true],['grain-size','grainSize',true],['mobility','mobility',true],['response','response',true]]){
 $('#'+id).addEventListener(numeric?'input':'change',e=>applySettings({...settings,[key]:numeric?Number(e.target.value):e.target.value,feel:['jarShape','pourStyle','surface'].includes(key)?settings.feel:'custom'}));
}
function openLevel(id){const url=new URL(location.href);url.search='';url.searchParams.set('v','6');url.searchParams.set('bolum',id);location.assign(url)}
for(const entry of levels){
 const button=document.createElement('button');button.className='level-card'+(entry.id===level.id?' current':'');button.innerHTML=`<img src="assets/${entry.preview}.png" alt=""><span><strong>${entry.name}</strong><small>${entry.subtitle}</small></span><b>${entry.id===level.id?'Oynuyorsun':'Başla →'}</b>`;button.onclick=()=>{if(entry.id!==level.id)openLevel(entry.id)};$('#levels').append(button);
}
$('#next-level').textContent=(level.id==='gotham'?'Ay Bahçesi’ne geç':'Gotham’a dön')+' →';$('#next-level').onclick=()=>openLevel(level.id==='gotham'?'ay-bahcesi':'gotham');
$('#level-name').textContent=level.name;
function ready(){return sand&&completionStatus(sand.coverage,settings.pace,sand.targetCount*25).ready}
function updateUI(){
 if(!sand)return;
 const phase=flow.phase,percent=completionStatus(sand.coverage,settings.pace,sand.targetCount*25).percent;
 $('#stage-label').textContent=`${String(index+1).padStart(2,'0')} / ${stages.length}`;$('#stage-label').title=stages[index].name;$('#color-dot').style.background=stages[index].color;
 $('#coverage').textContent=percent+'%';$('#progress-fill').style.width=percent+'%';
 const messages={peel:['↗','Bir kez dokun.','Sıradaki kâğıt rulolanarak açılsın.','SOY'],rolling:['↗','Kâğıt açılıyor…','Açılan taralı alan simi tutacak.','SOY'],pour:['⠿','Bir yığın parıltı.','Kap boşalsın; sonra simi parmağınla yay.','DÖK'],brush:['▰','Yığından başla, kenarlara yay.','Sim yetmezse + Sim ile bir yığın daha ekle.','YAY'],shake:['∪','İki yandan bük, ortaya topla.','Fazla sim ortadaki oluktan kutuya akıyor.','BOŞALT'],complete:['✧','Ellerine sağlık.','Biraz sabır, binlerce küçük parıltı.','BİTTİ']};
 if(phase==='rolling')messages.rolling=['↗',`Parça ${activePart+1} / ${partLayers.length} · yavaşça soyuluyor`,peel<.2?'Cımbız kenardan tutuyor.':'Sarı kâğıt ayrılıyor, yapışkan açılıyor.','SOY'];
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
function makePartLayers(){
 return piecesByStage[stages[index].id].map(piece=>{
  const b=piece.bounds,mask=document.createElement('canvas');mask.width=b.w;mask.height=b.h;const m=mask.getContext('2d');m.fillStyle='#fff';for(const [y,x,length] of piece.runs)m.fillRect(x,y,length,1);
  const paper=document.createElement('canvas');paper.width=b.w;paper.height=b.h;const p=paper.getContext('2d');p.drawImage(paperBase,b.x,b.y,b.w,b.h,0,0,b.w,b.h);p.globalAlpha=.96;p.drawImage(assets.lines,b.x,b.y,b.w,b.h,0,0,b.w,b.h);p.globalAlpha=1;p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);
  const brown=document.createElement('canvas');brown.width=b.w;brown.height=b.h;const layer={piece,paper,brown,mask};paintGlue(layer);return layer;
 });
}
function paintGlue(layer){
 const {brown,mask}=layer,c=brown.getContext('2d'),b=layer.piece.bounds;
 c.globalCompositeOperation='source-over';c.clearRect(0,0,b.w,b.h);
 c.fillStyle={slate:'#738493',dark:'#405c60',kraft:'#b98e65'}[settings.surface]||'#738493';c.fillRect(0,0,b.w,b.h);
 c.strokeStyle=settings.surface==='kraft'?'#e3c39a40':'#d0dce339';c.lineWidth=.65;
 c.beginPath();for(let x=-b.h;x<b.w;x+=8){c.moveTo(x,0);c.lineTo(x+b.h,b.h)}c.stroke();
 c.globalCompositeOperation='destination-in';c.drawImage(mask,0,0);c.globalCompositeOperation='source-over';
}
function revealUntil(count){while(revealedParts<count){const layer=partLayers[revealedParts++];gc.drawImage(layer.brown,layer.piece.bounds.x,layer.piece.bounds.y);}}
function animatePeel(){
 const pose=peelAt(partLayers.map(p=>p.piece),flow.elapsed);revealUntil(pose.index);
 if(activePart!==pose.index){activePart=pose.index;view.setPeelPiece(partLayers[activePart].paper,partLayers[activePart].piece);}
 peel=pose.progress;view.peelProgress(peel);repaintPaper();
}
function activate(){
 sand=new Sand();sand.setBehavior(settings);sand.setMask(masks[stages[index].id]);flow.reset();peeled=false;peel=0;pour=null;readySince=0;strokes.length=0;activePart=0;revealedParts=0;
 gc.globalCompositeOperation='source-over';gc.clearRect(0,0,W,H);partLayers=makePartLayers();flow.setRollDuration(peelDuration(partLayers.map(p=>p.piece)));
 makeGlitter(stages[index].color);lastCoated=-1;cc.clearRect(0,0,W,H);view.setStage(index);updateCoat(true);repaintPaper();view.setPeelPiece(partLayers[0].paper,partLayers[0].piece);updateUI();
}
function beginRoll(){if(soundOn)audio();if(finished||!flow.roll())return;down=false;strokes.length=0;peel=0;updateUI()}
function prepareDose(){
 const amount=doseFor(sand.targetCount,settings,sand.capacity);
 if(sand.capacity-sand.count<amount){sand.compact();view.currentInitialized=0;}
 const dose=doseFor(sand.targetCount,settings,sand.capacity-sand.count);
 if(dose<50){flow.phase='brush';$('#instruction-text').textContent='Kâğıtta bol sim var. Önce yay veya fazlasını kutuya boşalt.';return;}
 let anchor=stages[index].pour;
 // Refill over unfinished adhesive, rather than repeatedly burying a finished patch.
 if(sand.coverage>.15){let best=-Infinity;const referenceY=anchor.y;
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]>12&&!sand.bound[k]){
   const x=k%120*5+2,y=Math.floor(k/120)*5+2;if(!sand.onGlue(x,y))continue;
   let nearby=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const q=k+dy*120+dx;if(q>=0&&q<sand.target.length&&!sand.bound[q])nearby+=sand.target[q];}
   const score=nearby-Math.abs(y-referenceY)*1.2;if(score>best){best=score;anchor={x,y};}
  }
 }
 const plan=planPour(anchor,sand.targetCount,settings.pourStyle);playedPour=-1;pour={...plan.anchor,...plan,dose,emitted:0,elapsed:0};
}
function addSand(){if(finished||!flow.pour())return;down=false;strokes.length=0;prepareDose();readySince=0;updateUI()}
function startShake(advance=false){if(finished||!flow.shake(advance))return;shakeRuns++;releaseAll();view.beginCleanup();if(advance)updateCoat(true,true);pour=null;view.posePour(null);readySince=0;updateUI()}
function nextStage(){
 nextRuns++;updateCoat(true,true);bakedContext.drawImage(coat,0,0);view.updateGrains(sand);
 if(index<stages.length-1){index++;activate();autoKick=settings.autoAdvance?.22:0;}
 else{finished=true;flow.phase='complete';pointer.visible=false;view.current.visible=false;view.heap.visible=false;$('#complete').hidden=false;updateUI();}
}
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{const t=button.dataset.tool;if(t==='peel')beginRoll();else if(t==='pour')addSand();else if(t==='clean')startShake(false);else updateUI()};
$('#add-sand').onclick=addSand;$('#shake').onclick=()=>startShake(false);$('#next').onclick=()=>{if(ready())startShake(true)};
function reset(){if(!view)return;releaseAll();finished=false;index=0;autoKick=0;bakedContext.clearRect(0,0,W,H);cc.clearRect(0,0,W,H);view.reset();$('#complete').hidden=true;activate()}
$('#reset').onclick=()=>{reset();closeSettings()};$('#again').onclick=reset;
$('#save').onclick=()=>{const a=document.createElement('a');a.href=view.capture();a.download='sim-atolyesi-'+level.id+'.png';a.click()};
canvas.addEventListener('pointerdown',e=>{
 e.preventDefault();if(!view||finished||flow.busy||!gate.begin(e.pointerId,e.isPrimary!==false))return;
 canvas.setPointerCapture(e.pointerId);pointer={...view.mapPointer(e),visible:true};previous={...pointer};pointerTime=e.timeStamp;
 if(soundOn)audio();
 if(flow.phase==='peel'){beginRoll();return;}
 down=true;
});
canvas.addEventListener('pointermove',e=>{
 if(!view||finished||e.isPrimary===false)return;
 if(gate.active===null&&e.pointerType==='mouse'&&!e.buttons){pointer={...view.mapPointer(e),visible:true};return;}
 if(!gate.owns(e.pointerId)||!down||flow.phase!=='brush')return;
 const p=view.mapPointer(e);pointer={...p,visible:true};
 if(Math.hypot(p.x-previous.x,p.y-previous.y)>.1){appendStroke(strokes,{from:{...previous},to:{...p},seconds:Math.max(.001,Math.min(.1,(e.timeStamp-pointerTime)/1000))})}previous=p;pointerTime=e.timeStamp;
});
function pointerEnd(e){if(!gate.end(e.pointerId))return;down=false;if(e.pointerType!=='mouse')pointer.visible=false;sound(0);updateUI()}
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,pointerEnd);
canvas.addEventListener('pointerleave',e=>{if(gate.active===null)pointer.visible=false});window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',releaseAll);
function updateStats(){
 const s=sand.stats(),m=view.metrics();
 Object.assign(canvas.dataset,{version:'6',level:level.id,feel:settings.feel,brushShape:settings.brushShape,brushRadius:brushRadius(settings).toFixed(1),mobility:settings.mobility,response:settings.response,jarShape:settings.jarShape,pourStyle:settings.pourStyle,surface:settings.surface,phase:flow.phase,layout:settings.layout,activePointer:gate.active??'',emitted:s.emitted,air:s.air,free:s.free,pressed:s.pressedFree,fresh:s.freshFree,moundHeight:s.maxMoundHeight.toFixed(2),bound:s.bound,lost:s.lost,coverage:s.coverage.toFixed(5),height:s.maxHeight.toFixed(2),stage:index,peelPart:activePart+1,peelParts:partLayers.length,peelProgress:peel.toFixed(3),collected:view.collectedCount,detached:view.spill.count,triangles:m.triangles,draws:m.draws,shakes:shakeRuns,advances:nextRuns,cameraZ:view.camera.position.z.toFixed(2),fps:Math.round(fps),flowSerial:flow.serial,shaking:flow.phase==='shake'?1:0});
 $('#hud-fps').textContent=Math.round(fps)+' FPS';$('#hud-detail').textContent=frameMs.toFixed(1)+' ms';
 for(const [id,value] of Object.entries({'stat-fps':Math.round(fps),'stat-frame':frameMs.toFixed(1),'stat-sim':simMs.toFixed(1),'stat-render':renderMs.toFixed(1),'stat-particles':(s.air+s.free+view.spill.count+(view.boxGroup.visible?view.collected.count:0)).toLocaleString('tr'),'stat-draws':m.draws,'stat-triangles':m.triangles.toLocaleString('tr'),'stat-memory':performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1):'—'}))$('#'+id).textContent=value;
 $('#buffer-size').textContent=`${m.width} × ${m.height} piksel · oyun sıfırlanmaz`;
}
function frame(t){
 requestAnimationFrame(frame);if(document.hidden)return;
 const delta=t-lastRender;if(!pacer.shouldRender(t))return;
 const dt=Math.min(lastRender?delta/1000:1/60,.06);if(!lastRender)fpsClock=t;lastRender=t;frames++;
 if(t-fpsClock>=700){fps=frames*1000/(t-fpsClock);fpsClock=t;frames=0;}
 frameMs=frameMs*.9+(dt*1000)*.1;const simStart=performance.now();moved=0;
 if(autoKick>0&&!dialog.open){autoKick-=dt;if(autoKick<=0)beginRoll()}
 if(flow.phase==='rolling')animatePeel();
 if(flow.phase==='pour'&&pour){
  pour.elapsed=flow.elapsed;Object.assign(pour,pourPoint(pour,Math.max(0,(flow.elapsed-.48)/.82)));view.posePour(pour);
  const fraction=pourFraction((flow.elapsed-.48)/.82,settings.pourStyle),desired=Math.floor(pour.dose*fraction),n=desired-pour.emitted;
  if(n>0){const source=view.pourOrigin();pour.emitted+=sand.emit(source.x,source.y,n,{spread:4,fan:pour.fan,height:Math.max(12,source.z)});Object.assign(canvas.dataset,{emitterX:source.x.toFixed(2),emitterY:source.y.toFixed(2),emitterZ:source.z.toFixed(2)});}
 }
 let dx=0,dy=0;for(const stroke of strokes){dx+=stroke.to.x-stroke.from.x;dy+=stroke.to.y-stroke.from.y;moved+=sand.brush(stroke.from,stroke.to,brushRadius(settings),stroke.seconds);}strokes.length=0;
 const speed=Math.hypot(dx,dy)/Math.max(dt,.001),decay=Math.exp(-dt*18);brushMotion={dx:dx||brushMotion.dx,dy:dy||brushMotion.dy,speed:brushMotion.speed*decay+Math.min(1200,speed)*(1-decay),load:brushMotion.load*decay+Math.min(1,moved/350)*(1-decay)};
 const drainage=flow.phase==='shake'?drainPose(flow.progress):{bend:0,pitch:0};view.updateBend(drainage.bend,drainage.pitch);
 sand.step(Math.min(dt,.04),{shaking:flow.phase==='shake',bend:drainage.bend,tilt:drainage.pitch});
 view.collectSpill(sand,true);
 const event=flow.tick(dt,{drainComplete:flow.phase!=='shake'||(!sand.hasLoose()&&view.spills.length===0)});
 if(event==='rolled'){revealUntil(partLayers.length);peeled=true;peel=1;repaintPaper();view.peelProgress(1);prepareDose();updateUI()}
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
 const drawStart=performance.now();view.render(sand,{time:t,dt,phase:flow.phase,down,pointer,brushMotion,peeled,pour,shakeProgress:flow.phase==='shake'?flow.progress:0,finished});renderMs=renderMs*.85+(performance.now()-drawStart)*.15;
 if((statClock+=dt)>.2){statClock=0;updateUI();updateStats();}
}
applySettings(settings);
try{
 await Promise.all([level.lines,...stages.map(s=>s.id)].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[id]=im;resolve()};im.onerror=()=>reject(Error('Şablon yüklenemedi: '+id));im.src=`assets/${id}.png?v=6`})));
 assets.lines=assets[level.lines];
 for(const stage of stages){gc.clearRect(0,0,W,H);gc.drawImage(assets[stage.id],0,0);const data=gc.getImageData(0,0,W,H).data,mask=new Uint8Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=data[i*4+3]>80?1:0;masks[stage.id]=mask;}
 index=resumeIndex(location.search,stages.length);
 for(let i=0;i<index;i++){
  makeGlitter(stages[i].color);cc.clearRect(0,0,W,H);cc.drawImage(glitter,0,0);cc.globalCompositeOperation='destination-in';cc.drawImage(assets[stages[i].id],0,0);cc.globalCompositeOperation='source-over';bakedContext.drawImage(coat,0,0);
 }
 cc.clearRect(0,0,W,H);repaintPaper();view=new AtelierScene(canvas,paperCanvas,stages.map(s=>s.color),settings);activate();requestAnimationFrame(frame);
}catch(error){$('#instruction-title').textContent='Atölye açılamadı.';$('#instruction-text').textContent='Sayfayı güncel bir tarayıcıda yenileyerek tekrar dene.';console.error(error);}
