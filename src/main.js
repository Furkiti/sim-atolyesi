import {SprayBoard,sprayPosterPixels} from './spray.js';
import {SprayRackView,SprayUnlockView} from './spray-rack.js';
import {SprayWallet} from './spray-wallet.js';
import {AMMO,CartridgeRack,HOLD_EXPERIMENTS,cartridgeChoices,rhythmCharge} from './workshop.js';
import {AtelierSession} from './session.js';
import {GalleryMusic,audioScene} from './gallery-audio.js';
import {Sand,W,H} from './sand.js';
import {AtelierScene} from './scene.js';
import {Flow,PointerGate,FramePacer,drainPose,appendStroke} from './interaction.js';
import {loadSettings,saveSettings,profileSettings,doseFor,settingAvailable} from './settings.js';
import {supplyPlan,supplyPose,supplyQuota} from './supply.js';
import {CleanupCycle} from './cleanup.js';
import {LevelProgress} from './level-progress.js';
import {HoldCascade} from './hold-cascade.js';
import {HOLD_MATERIALS} from './hold-material.js';
import {DeviceTilt} from './tilt.js';
import {PaperMotion} from './paper-motion.js';
import {completionStatus,resumeIndex} from './progress.js';
const $=s=>document.querySelector(s),canvas=$('#art'),dialog=$('#settings');
import {levels,selectLevel} from './levels.js';
import {FEELS,feelSettings,brushRadius,pourFraction} from './feel.js';
let level=selectLevel(location.search),stages=level.stages;
import {drawGlitter} from './coating.js';
import {piecesByStage} from './peel-pieces.js';
import {peelAt,peelDuration,revealPolygon} from './peel.js';
import {posterBlob,downloadPoster} from './completion.js';
import {installButtonMotion} from './ui-motion.js';
import {GalleryHistory,galleryThumbnail,loadGalleryImage,galleryPicture} from './gallery.js';
import {ExhibitionRail} from './exhibition.js';
import {LevelLoader} from './level-loader.js';
import {gameSteps} from './game-clock.js';
installButtonMotion();
const sessionId=String(Date.now());
let gallery;try{gallery=new GalleryHistory(localStorage,levels.map(entry=>entry.id))}catch{gallery=new GalleryHistory(null,levels.map(entry=>entry.id))}
let progression;try{progression=new LevelProgress(localStorage,levels.map(e=>e.id),gallery.entries)}catch{progression=new LevelProgress(null,levels.map(e=>e.id),gallery.entries)}
let session;try{session=new AtelierSession(localStorage,levels)}catch{session=new AtelierSession(null,levels)}
const bootChoice=session.start(location.search,progression,gallery.entries),resumeRequested=new URLSearchParams(location.search).has('devam');
level=bootChoice.level;stages=level.stages;
let booting=true,lobby=false;
const loader=new LevelLoader(),rail=new ExhibitionRail(levels.length,levels.indexOf(level)),previewCache=new Map();
let exhibition=false,transitioning=false,galleryArt=[],following=levels[Math.min(levels.indexOf(level)+1,levels.length-1)],cleanup=null;
let settings;try{settings=loadSettings(localStorage)}catch{settings=loadSettings({getItem:()=>null})}
const recoveryQuery=new URLSearchParams(location.search).get('toplama');if(['classic','trough','rills','bowl','table'].includes(recoveryQuery))settings={...settings,recovery:recoveryQuery};
if(new URLSearchParams(location.search).get('giris')==='direct')settings={...settings,entryMode:'direct'};
if(new URLSearchParams(location.search).get('mod')==='egim')settings={...settings,controlMode:'tilt'};
if(new URLSearchParams(location.search).get('mod')==='basili')settings={...settings,controlMode:'hold'};
const experimentQuery=new URLSearchParams(location.search).get('akis');
if(HOLD_EXPERIMENTS.includes(experimentQuery))settings={...settings,controlMode:'hold',holdExperiment:experimentQuery};
if(new URLSearchParams(location.search).get('mod')==='puskurt')settings={...settings,controlMode:'spray'};
if(new URLSearchParams(location.search).get('mod')==='firca')settings={...settings,controlMode:'brush'};
const ribbonQuery=new URLSearchParams(location.search).get('serit');
if(ribbonQuery==='orta'||ribbonQuery==='ust')settings={...settings,holdPointPlacement:ribbonQuery==='orta'?'middle':'top'};
const materialQuery=new URLSearchParams(location.search).get('malzeme');
if(Object.hasOwn(HOLD_MATERIALS,materialQuery))settings={...settings,holdMaterial:materialQuery};
let cascade=null,holdLatched=false,holdSupplyPending=false;
let spray=null,sprayClock=0,spraySavedBand=0,spraySavedPaint=0,spraySaveClock=0,sprayMuzzles=[],sprayFinishTime=0;
const spraySequence=new URLSearchParams(location.search).get('sira')==='klasik'?'classic':'ripple';
const sprayWallet=new SprayWallet(gallery.storage);
const sprayRack=new SprayRackView($('#spray-panel'),{load:loadSprayBottle,unload:unloadSprayBottle,openUnlock:openSprayUnlock});
const sprayUnlock=new SprayUnlockView($('#spray-unlock'),{unlock:unlockSpraySlot,release:releaseSpraySlot});
window.addEventListener('pagehide',()=>{if(spray)saveSprayBand(spray.checkpoint());});
window.addEventListener('resize',()=>{sprayMuzzles=[];});
let rack=new CartridgeRack(),rackKey='',holdAim=300,holdCharge=1,tiltGrip=0;
const holdPoint={x:W/2,y:H/2};
const rackMode=()=>settings.controlMode==='hold'&&settings.holdExperiment==='slots';
let tiltAutoStart=false,tiltFrame={x:0,y:0,active:false};
const deviceTilt=new DeviceTilt({onChange:()=>{updateTiltUI();if(deviceTilt.status==='active'&&tiltAutoStart&&!dialog.open&&view&&flow.phase==='peel'){tiltAutoStart=false;beginRoll();}}});
const paperMotion=new PaperMotion();
let paperPose={x:0,y:0,cup:0};
const flow=new Flow(),gate=new PointerGate(),pacer=new FramePacer(settings.frameLimit),assets={},masks={},strokes=[];
let refillAfterShake=false;
let lastCleanupHeld=0,lastCleanupReleased=0;
let shakeRuns=0,nextRuns=0,partLayers=[],activePart=0,revealedParts=0;
let view,sand,index=0,finished=false,pour=null,peeled=false,peel=0,readySince=0,autoKick=0;
let pointer={x:300,y:282,visible:false},previous={x:300,y:282},down=false,lastRender=0,statClock=0,fpsClock=0,frames=0,fps=0,frameMs=16.7,simMs=0,renderMs=0,moved=0;
let galleryTap=null;
let pointerTime=0,gameTime=0,exhibitTime=0,holding=false;
let brushMotion={dx:0,dy:0,speed:0,load:0};
let initialWidth=innerWidth;
// iOS browser bars may change innerHeight mid-stroke. Keep the game viewport
// stable for a width/orientation; only a real orientation change reframes it.
function stableViewport(force=false){if(force||Math.abs(innerWidth-initialWidth)>60){initialWidth=innerWidth;document.documentElement.style.setProperty('--app-height',innerHeight+'px')}}
stableViewport(true);window.addEventListener('resize',()=>stableViewport());window.addEventListener('orientationchange',()=>setTimeout(()=>stableViewport(true),150));
for(const event of ['gesturestart','gesturechange','gestureend'])document.addEventListener(event,e=>e.preventDefault(),{passive:false});
// iOS's loupe is driven by native touch handling, before dblclick/selection.
// Keep pointer input; suppress only touch defaults on the two gameplay surfaces.
for(const target of [canvas,$('#hold-control')]){
 target.setAttribute('draggable','false');
 for(const event of ['touchstart','touchend','dblclick'])target.addEventListener(event,e=>e.preventDefault(),{passive:false});
}

document.addEventListener('wheel',e=>{if(e.ctrlKey||e.target===canvas)e.preventDefault()},{passive:false});
document.addEventListener('selectstart',e=>e.preventDefault());document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('selectionchange',()=>{const selection=document.getSelection();if(selection&&!selection.isCollapsed)selection.removeAllRanges();});
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
const blockedPointers=new Map();
for(const type of ['pointerdown','pointerup'])document.addEventListener(type,e=>{
 if(e.isPrimary===false||(gate.active!==null&&e.pointerId!==gate.active)){
  blockedPointers.set(e.pointerId,performance.now());e.preventDefault();e.stopImmediatePropagation();
 }else if(type==='pointerdown')blockedPointers.delete(e.pointerId);
},{capture:true,passive:false});
document.addEventListener('click',e=>{const blocked=blockedPointers.get(e.pointerId);if(blocked!==undefined&&performance.now()-blocked<1200){e.preventDefault();e.stopImmediatePropagation();blockedPointers.delete(e.pointerId)}},{capture:true});
const paperCanvas=document.createElement('canvas');paperCanvas.width=W;paperCanvas.height=H;const pc=paperCanvas.getContext('2d');
// Rendering keeps the active coat separate so gallery transitions can fade it.
// The full paperCanvas remains unchanged for export and saved completed artwork.
const displayPaper=document.createElement('canvas');displayPaper.width=W;displayPaper.height=H;const dc=displayPaper.getContext('2d');
const paperBase=document.createElement('canvas');paperBase.width=W;paperBase.height=H;const bc=paperBase.getContext('2d');bc.fillStyle='#f5e7a5';bc.fillRect(0,0,W,H);
for(let i=0;i<45000;i++){bc.fillStyle=Math.random()>.5?'#fff9d118':'#ad945212';bc.fillRect(Math.random()*W,Math.random()*H,1,1)}
const baked=document.createElement('canvas');baked.width=W;baked.height=H;const bakedContext=baked.getContext('2d');
const coat=document.createElement('canvas');coat.width=W;coat.height=H;const cc=coat.getContext('2d');
const paintMask=document.createElement('canvas');paintMask.width=W;paintMask.height=H;const mc=paintMask.getContext('2d');
const glitter=document.createElement('canvas');glitter.width=W;glitter.height=H;const tc=glitter.getContext('2d');
let lastCoated=-1,preparedStage=null;
function makeGlitter(color){if(preparedStage?.glitter){tc.clearRect(0,0,W,H);tc.drawImage(preparedStage.glitter,0,0);}else drawGlitter(tc,color,W,H,settings.controlMode==='hold'?settings.holdGrainSize:1);view?.setActiveCoat(assets[stages[index].id],glitter,assets.lines)}
function updateCoat(force=false,finish=false){
 if(!sand||(!force&&lastCoated===sand.coveredWeight))return;
 lastCoated=sand.coveredWeight;
 // Moving coverage is composed in the paper shader from the existing small
 // contact grid. Bake the full-resolution canvas only for phase changes/export.
 if(!force){const caught=view?.markContacts(sand.bound)||0;if(settings.controlMode==='tilt')tiltGrip=Math.max(tiltGrip,Math.min(.08,caught*.003));return;}
 cc.clearRect(0,0,W,H);cc.fillStyle='#fff';
 // Finish is set only after a qualified color has run its cleanup.
 if(finish)cc.fillRect(0,0,W,H);
 else for(let k=0;k<sand.bound.length;k++)if(sand.bound[k])cc.fillRect((k%120)*5,Math.floor(k/120)*5,5,5);
 cc.globalCompositeOperation='destination-in';cc.drawImage(assets[stages[index].id],0,0);cc.globalCompositeOperation='source-in';cc.drawImage(glitter,0,0);cc.globalCompositeOperation='source-over';
 mc.clearRect(0,0,W,H);mc.drawImage(baked,0,0);mc.drawImage(coat,0,0);view?.setCoatMask(paintMask);view?.markContacts(sand.bound);repaintPaper();
}
const glue=document.createElement('canvas');glue.width=W;glue.height=H;const gc=glue.getContext('2d');
function repaintPaper(){
 pc.clearRect(0,0,W,H);pc.drawImage(paperBase,0,0);
 pc.globalAlpha=.035;for(let i=index;i<stages.length;i++)pc.drawImage(assets[stages[i].id],0,0);
 // Keep the protective paper's pigment unchanged before the grip lifts.
 pc.globalAlpha=1;
 pc.drawImage(glue,0,0);
 if(flow.phase==='rolling'&&partLayers[activePart]){
  const layer=partLayers[activePart],polygon=revealPolygon(layer.piece,peel);
  if(polygon.length){pc.save();pc.beginPath();polygon.forEach((p,i)=>i?pc.lineTo(p.x,p.y):pc.moveTo(p.x,p.y));pc.closePath();pc.clip();pc.drawImage(layer.brown,layer.piece.bounds.x,layer.piece.bounds.y);pc.restore();}
 }
 pc.drawImage(baked,0,0);dc.clearRect(0,0,W,H);dc.drawImage(paperCanvas,0,0);dc.globalAlpha=.96;dc.drawImage(assets.lines,0,0);dc.globalAlpha=1;pc.drawImage(coat,0,0);
 pc.globalAlpha=.96;pc.drawImage(assets.lines,0,0);pc.globalAlpha=1;view?.paperChanged();
}
let audioCtx,soundOn=true,brushSource,brushGain,pourSource,playedPour=-1,galleryMusic;
const audioBuffers={};
async function audio(){
 if(!audioCtx){
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();brushGain=audioCtx.createGain();brushGain.gain.value=0;brushGain.connect(audioCtx.destination);
  await Promise.all(['brush','pour'].map(async id=>{try{const data=await(await fetch(`audio/${id}.m4a?v=4`)).arrayBuffer();audioBuffers[id]=await audioCtx.decodeAudioData(data)}catch(error){console.warn('Ses yüklenemedi',id,error)}}));
  if(audioBuffers.brush){brushSource=audioCtx.createBufferSource();brushSource.buffer=audioBuffers.brush;brushSource.loop=true;brushSource.connect(brushGain);brushSource.start();}
 }
 await audioCtx.resume();
 if(!galleryMusic)galleryMusic=new GalleryMusic(audioCtx);
}
function sound(amount=0){
 const scene=audioScene({exhibition,transitioning,finished,dialog:dialog.open,visible:!document.hidden});canvas.dataset.audioScene=scene;canvas.dataset.pourPlaying=String(!!pourSource);canvas.dataset.galleryMusic=String(!!galleryMusic?.active);
 if(!audioCtx||!brushGain)return;
 galleryMusic?.setActive(soundOn&&settings.galleryMusic&&scene==='gallery');
 brushGain.gain.setTargetAtTime(soundOn&&scene==='work'&&flow.phase==='brush'?Math.min(1,amount*5*(.8+brushMotion.load*.35)):0,audioCtx.currentTime,.035);
 if(brushSource)brushSource.playbackRate.setTargetAtTime(.85+Math.min(.35,brushMotion.speed/1800),audioCtx.currentTime,.06);
 if(soundOn&&scene==='work'&&flow.phase==='pour'&&flow.elapsed>=.48&&flow.elapsed<flow.pourDuration-.35&&playedPour!==flow.serial&&audioBuffers.pour){
  playedPour=flow.serial;pourSource?.stop();pourSource=audioCtx.createBufferSource();pourSource.buffer=audioBuffers.pour;pourSource.loop=true;pourSource.connect(audioCtx.destination);pourSource.start();
 }
 if((!soundOn||scene!=='work'||flow.phase!=='pour')&&pourSource){try{pourSource.stop()}catch{}pourSource=null;playedPour=-1;}
}
$('#sound').textContent='Ses: açık';$('#sound').setAttribute('aria-label','Sesi kapat');
$('#sound').onclick=async()=>{soundOn=!soundOn;await audio();sound(0);$('#sound').textContent=soundOn?'Ses: açık':'Ses: kapalı';$('#sound').setAttribute('aria-label',soundOn?'Sesi kapat':'Sesi aç')};
document.addEventListener('visibilitychange',()=>{if(document.hidden)sound(0)});
document.addEventListener('pointerdown',()=>{if(!booting&&exhibition&&soundOn)audio()},{passive:true});
function releaseAll(){if(rail.drag)rail.end(true);holdLatched=false;paperMotion.end();down=false;gate.cancel();strokes.length=0;sound(0)}
function settingsTab(name){
 document.querySelectorAll('[data-settings-tab]').forEach(e=>e.hidden=e.dataset.settingsTab!==name);
 document.querySelectorAll('[data-tab]').forEach(e=>e.setAttribute('aria-selected',String(e.dataset.tab===name)));
 document.querySelector('.settings-body').scrollTop=0;
}
document.querySelectorAll('[data-tab]').forEach(e=>e.onclick=()=>settingsTab(e.dataset.tab));
function closeSettings(){dialog.close();pointer.visible=false;readySince=0;
 if(flow.phase==='load'&&!rackMode()){flow.pour();prepareDose();updateUI();}

 if(holdSupplyPending&&settings.controlMode==='hold'&&['brush','pour'].includes(flow.phase)){holdSupplyPending=false;flow.phase='brush';if(sand.hasLoose()){refillAfterShake=true;startShake(false);}else addSand();}
}
$('#settings-open').onclick=()=>{releaseAll();pointer.visible=false;syncSettings();dialog.showModal()};
$('#settings-close').onclick=closeSettings;$('#settings-done').onclick=closeSettings;dialog.addEventListener('cancel',event=>{event.preventDefault();releaseAll();closeSettings();});
function applySettings(next){
 const previousSurface=settings?.surface,previousControl=settings?.controlMode,previousHoldSize=settings?.holdGrainSize,wasPoint=settings?.holdExperiment==='point';settings=next;document.body.dataset.control=settings.controlMode;document.body.dataset.recovery=settings.recovery;const recoveryURL=new URL(location.href);if(recoveryURL.searchParams.has('toplama')&&recoveryURL.searchParams.get('toplama')!==settings.recovery){recoveryURL.searchParams.set('toplama',settings.recovery);history.replaceState(history.state,'',recoveryURL);}document.body.dataset.layout=settings.controlMode==='hold'?'flow':settings.layout;$('#perf-hud').hidden=!settings.showStats;
 try{saveSettings(localStorage,settings)}catch{}
 if(previousControl!==settings.controlMode){releaseAll();paperMotion.reset();if(previousControl==='hold'&&pour?.kind==='hold'){rack.finish();pour=null;view?.posePour(null);flow.phase='brush';}cascade=null;holdSupplyPending=settings.controlMode==='hold';if(settings.controlMode!=='tilt'){deviceTilt.stop();tiltAutoStart=false;}}
 if(cascade&&wasPoint!==(settings.holdExperiment==='point')&&['pour','brush'].includes(flow.phase)){
  rack.finish();pour=null;view.posePour(null);flow.phase='brush';holdSupplyPending=true;
 }
 if(partLayers.length&&(previousControl!==settings.controlMode||settings.controlMode==='hold'&&previousHoldSize!==settings.holdGrainSize)){makeGlitter(stages[index].color);updateCoat(true);}
 sand?.setBehavior(settings);if(cascade)cascade.depth=settings.heapDepth;view?.applySettings(settings);
 if(partLayers.length&&previousSurface!==settings.surface){for(const layer of partLayers)paintGlue(layer);gc.clearRect(0,0,W,H);const count=revealedParts;revealedParts=0;revealUntil(count);repaintPaper();}pacer.setLimit(settings.frameLimit);if(!settings.autoAdvance&&settings.controlMode!=='tilt')autoKick=0;syncSettings();readySince=0;updateUI();updateTiltUI();
}
function syncSettings(){
 $('#finish-style').disabled=!settings.extraFinish;$('#poster-shine').disabled=!settings.sparkles;
 document.querySelectorAll('input[name="layout"]').forEach(e=>e.checked=e.value===settings.layout);
 for(const [id,key] of Object.entries({'auto-advance':'autoAdvance','extra-finish':'extraFinish','gallery-music':'galleryMusic','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'}))$('#'+id).checked=settings[key];
 for(const [id,key] of Object.entries({'quality-profile':'profile','render-scale':'renderScale','shadow-quality':'shadow','frame-limit':'frameLimit','pour-amount':'pourAmount',pace:'pace','brush-shape':'brushShape','jar-shape':'jarShape','pour-style':'pourStyle','supply-style':'supply','paper-motion':'paperMotion','control-mode':'controlMode','tilt-sensitivity':'tiltSensitivity','heap-depth':'heapDepth','surface-style':'surface','hold-density':'holdDensity','hold-grain-size':'holdGrainSize','hold-rows':'holdRows','hold-placement':'holdPlacement','hold-experiment':'holdExperiment','hold-point-placement':'holdPointPlacement','hold-material':'holdMaterial','entry-mode':'entryMode','finish-style':'finishStyle','poster-shine':'posterShine','adhesion-style':'adhesionStyle','coverage-guide':'coverageGuide','brush-width':'brushWidth','grain-size':'grainSize',mobility:'mobility',response:'response'}))$('#'+id).value=settings[key];
 document.querySelectorAll('input[name=recovery]').forEach(e=>e.checked=e.value===settings.recovery);
 document.querySelectorAll('input[name=feel]').forEach(e=>e.checked=e.value===settings.feel);
 document.querySelectorAll('input[name=game-speed]').forEach(e=>e.checked=Number(e.value)===settings.gameSpeed);$('#speed-readout').textContent=settings.gameSpeed+'x';
 for(const [id,key] of [['mobility','mobility'],['response','response'],['brush-width','brushWidth'],['grain-size','grainSize'],['heap-depth','heapDepth'],['tilt-sensitivity','tiltSensitivity'],['hold-density','holdDensity'],['hold-grain-size','holdGrainSize']])$('#'+id+'-readout').textContent='%'+Math.round(settings[key]*100);
 $('#feel-name').textContent=FEELS[settings.feel]?.name||'Özel karışım';
 $('#resolution-readout').textContent='%'+Math.round(settings.renderScale*100);$('#pour-readout').textContent='%'+Math.round(settings.pourAmount*100);
}
document.querySelectorAll('input[name="layout"]').forEach(e=>e.onchange=()=>applySettings({...settings,layout:e.value,autoAdvance:e.value==='flow'}));
$('#quality-profile').onchange=e=>{if(e.target.value!=='custom')applySettings(profileSettings(settings,e.target.value))};
const checks={'auto-advance':'autoAdvance','extra-finish':'extraFinish','gallery-music':'galleryMusic','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'};
for(const [id,key] of Object.entries(checks))$('#'+id).onchange=e=>applySettings({...settings,[key]:e.target.checked,profile:['autoAdvance','extraFinish','showStats'].includes(key)?settings.profile:'custom'});
for(const [id,key,numeric] of [['render-scale','renderScale',true],['pour-amount','pourAmount',true],['shadow-quality','shadow',false],['frame-limit','frameLimit',true],['pace','pace',false]]){
 $('#'+id).addEventListener(id.includes('scale')||id.includes('amount')?'input':'change',e=>applySettings({...settings,[key]:numeric?Number(e.target.value):e.target.value,profile:['renderScale','shadow','frameLimit'].includes(key)?'custom':settings.profile}));
}
document.querySelectorAll('input[name=game-speed]').forEach(e=>e.onchange=()=>applySettings({...settings,gameSpeed:Number(e.value)}));
document.querySelectorAll('input[name=feel]').forEach(e=>e.onchange=()=>applySettings(feelSettings(settings,e.value)));
for(const [id,key,numeric] of [['brush-shape','brushShape',false],['jar-shape','jarShape',false],['pour-style','pourStyle',false],['surface-style','surface',false],['supply-style','supply',false],['paper-motion','paperMotion',false],['heap-depth','heapDepth',true],['control-mode','controlMode',false],['tilt-sensitivity','tiltSensitivity',true],['brush-width','brushWidth',true],['grain-size','grainSize',true],['mobility','mobility',true],['response','response',true],['hold-density','holdDensity',true],['hold-grain-size','holdGrainSize',true],['hold-rows','holdRows',true],['hold-placement','holdPlacement',false],['hold-experiment','holdExperiment',false],['hold-point-placement','holdPointPlacement',false],['hold-material','holdMaterial',false],['entry-mode','entryMode',false],['finish-style','finishStyle',false],['poster-shine','posterShine',false],['adhesion-style','adhesionStyle',false],['coverage-guide','coverageGuide',false]]){
 $('#'+id).addEventListener(numeric&&id!=='hold-rows'?'input':'change',e=>{
  if(key==='controlMode'&&(settings.controlMode==='spray')!==(e.target.value==='spray')){
   const mode=e.target.value,params=new URL(location.href);
   for(const key of ['akis','devam','serit','malzeme'])params.searchParams.delete(key);
   params.searchParams.set('mod',({spray:'puskurt',hold:'basili',tilt:'egim',brush:'firca'})[mode]);
   params.searchParams.set('bolum',level.id);
   try{saveSettings(localStorage,{...settings,controlMode:mode});}catch{}
   location.replace(params);
   return;
  }
  applySettings({...settings,[key]:numeric?Number(e.target.value):e.target.value,feel:['jarShape','pourStyle','surface','supply','paperMotion','heapDepth','controlMode','tiltSensitivity','holdDensity','holdGrainSize','holdRows','holdPlacement','holdExperiment','holdPointPlacement','holdMaterial','entryMode'].includes(key)||key==='adhesionStyle'||key==='coverageGuide'?settings.feel:'custom'});});
}
document.querySelectorAll('input[name=recovery]').forEach(e=>e.onchange=()=>applySettings({...settings,recovery:e.value}));
const tiltMessages={off:'Telefonu rahat tut, sonra hareketi aç.',requesting:'Hareket izni bekleniyor…',waiting:'Sensör bekleniyor; telefonu hafifçe eğ.',active:'Hareket açık · bu konumu düz sayabilirsin.',demo:'Ekran eğimi açık · sensör kullanılmıyor.',denied:'Hareket izni verilmedi. Yeniden dene veya tarayıcı izinlerini kontrol et.',unsupported:'Bu cihazda hareket sensörü yok. Ekrandaki eğimle deneyebilirsin.',insecure:'Hareket sensörü için oyunu HTTPS bağlantısından aç.',empty:'Hareket verisi gelmedi. Telefonda Safari veya Chrome ile açabilir ya da ekranda deneyebilirsin.',stale:'Hareket verisi durdu; akış güvenli biçimde duraklatıldı.'};
function updateTiltUI(){
 const enabled=settings.controlMode==='tilt',hold=settings.controlMode==='hold',spraying=settings.controlMode==='spray',live=['active','demo'].includes(deviceTilt.status);
 for(const id of ['response','brush-shape','brush-width','paper-motion'])$('#'+id).closest('label').hidden=enabled||hold;
 $('#feel-name').textContent=spraying?'Sim Püskürtücü':hold?'Basılı akış':FEELS[settings.feel]?.name||'Özel karışım';$('#hold-detail').hidden=!hold;$('#hold-detail').textContent=`${['local','joined'].includes(settings.holdPlacement)?(settings.holdPlacement==='joined'?'Yakın parçalar için tek kesintisiz yerel şerit dökülür.':'Ortak üst akışın ulaşamadığı parçalara ek şerit dökülür.'):settings.holdPlacement==='width'?'Üstte yalnızca hedef genişliği kadar bir şerit dökülür.':`Sim üst kenara ${settings.holdRows===2?'iki yatay sıra':'bir yatay sıra'} halinde dökülür.`} Basılı tut: kâğıt bükülsün, sim aksın. %98’de kendisi tamamlanır. ${settings.recovery==='table'?'Kalan taneler masada sönerek kaybolur.':'Kalan taneler seçilen toplama alanına dökülür.'} Son dokunuş açıksa ${settings.finishStyle==='variety'?'rastgele bir hareket':'küçük vuruşlar'} temizliği tamamlar.`;$('#hold-options').hidden=!hold;for(const id of ['pour-amount','grain-size'])$('#'+id).closest('label').hidden=hold;for(const id of ['supply-style','mobility','pour-style'])$('#'+id).closest('label').hidden=hold;document.querySelector('.feel-options').hidden=hold||spraying;
 const controls={'supply-style':'supply','pour-amount':'pourAmount','paper-motion':'paperMotion',mobility:'mobility',response:'response','brush-shape':'brushShape','brush-width':'brushWidth','grain-size':'grainSize','pour-style':'pourStyle','tilt-sensitivity':'tiltSensitivity','auto-advance':'autoAdvance',pace:'pace'};
 for(const [id,key] of Object.entries(controls)){const active=settingAvailable(key,settings.controlMode);$('#'+id).disabled=!active;$('#'+id).closest('label').hidden=!active||(enabled&&['response','brush-shape','brush-width','paper-motion'].includes(id));}
 for(const e of document.querySelectorAll('input[name=feel],input[name=layout]'))e.disabled=hold||spraying;
 $('#layout-experiments').hidden=hold||spraying;for(const id of ['hold-density','hold-grain-size','hold-rows','hold-placement','hold-experiment','hold-repour'])$('#'+id).disabled=!hold;
 const point=hold&&settings.holdExperiment==='point';
 for(const id of ['hold-placement','hold-rows']){$('#'+id).closest('label').hidden=point;$('#'+id).disabled=!hold||point;}
 for(const id of ['hold-point-placement','hold-material'])$('#'+id).closest('label').hidden=$('#'+id).disabled=!point;
 $('#hold-lab-link').hidden=!point;
 $('#hold-material-note').textContent=HOLD_MATERIALS[settings.holdMaterial].description+' Sonraki döküşte uygulanır.';
 if(point)$('#hold-detail').textContent='Kâğıtta bir yere basılı tut veya parmağını sürükle. Simler o noktaya akar, bırakınca durur. Renk %98’de otomatik tamamlanır.';
 for(const id of ['tilt-demo-x','tilt-demo-y','tilt-demo-start'])$('#'+id).disabled=hold;
 $('#pour-hint').textContent=hold?'Sonraki yatay şeritteki fazla sim miktarını değiştirir.':enabled?'Sim hedefin üstünde tek bir noktaya dökülür. Telefonu eğerek yapışkana taşı.':'Sim hedefin biraz üstüne dökülür. Fırçayla taşıman gerekir.';
 $('#tilt-panel').hidden=!enabled;$('#tilt-detail').textContent=tiltMessages[deviceTilt.status]||tiltMessages.off;
 $('#tilt-status').textContent=live?(deviceTilt.status==='demo'?'Ekran eğimi':'Telefonu eğ'):({requesting:'İzin bekleniyor',waiting:'Sensör bekleniyor',denied:'İzin verilmedi',unsupported:'Sensör yok',insecure:'HTTPS gerekli',empty:'Veri gelmedi',stale:'Hareket durdu'}[deviceTilt.status]||'Hareket kapalı');
 $('#tilt-enable').disabled=deviceTilt.status==='requesting';$('#tilt-enable').textContent=live?'Hareketi yeniden aç':'Hareketi aç';
 $('#tilt-start').hidden=live;$('#tilt-center').disabled=!live;$('#tilt-recenter').disabled=!live;
 $('#tilt-toolbar').hidden=!enabled||finished||(flow.phase==='brush'&&ready());
}
async function enableTilt(){
 if(settings.controlMode!=='tilt')applySettings({...settings,controlMode:'tilt'});
 tiltAutoStart=true;const pending=deviceTilt.start();if(soundOn)audio();
 if(dialog.open)closeSettings();await pending;updateTiltUI();
 if(deviceTilt.status==='active'&&flow.phase==='peel'){tiltAutoStart=false;beginRoll();}
}
$('#tilt-enable').onclick=enableTilt;$('#tilt-start').onclick=enableTilt;
function recenterTilt(){deviceTilt.calibrate();tiltFrame={x:0,y:0,active:false};paperMotion.reset();updateTiltUI();}
$('#tilt-center').onclick=recenterTilt;$('#tilt-recenter').onclick=recenterTilt;
$('#tilt-demo-start').onclick=()=>{deviceTilt.demo();deviceTilt.setDemo(Number($('#tilt-demo-x').value),Number($('#tilt-demo-y').value));tiltAutoStart=false;if(dialog.open)closeSettings();if(flow.phase==='peel')beginRoll();updateTiltUI();};
for(const id of ['tilt-demo-x','tilt-demo-y'])$('#'+id).oninput=()=>{deviceTilt.setDemo(Number($('#tilt-demo-x').value),Number($('#tilt-demo-y').value));updateTiltUI();};
function installBundle(bundle){for(const key of Object.keys(assets))delete assets[key];for(const key of Object.keys(masks))delete masks[key];Object.assign(assets,bundle.assets);Object.assign(masks,bundle.masks);}
function levelLabels(){
 following=levels[Math.min(levels.indexOf(level)+1,levels.length-1)];$('#level-name').textContent=level.name;
 document.querySelectorAll('.level-card').forEach((button,i)=>{button.classList.toggle('current',levels[i]===level);const locked=!progression.canPlay(levels[i].id);button.disabled=locked;button.classList.toggle('locked',locked);button.setAttribute('aria-label',levels[i].name+(locked?' · Önce '+levels[i-1]?.name+' bölümünü tamamla':''));button.querySelector('b').textContent=locked?'Kilitli':levels[i]===level?'Oynuyorsun':progression.isComplete(levels[i].id)?'Yeniden yap':'Başla →';});
 if(progression.canPlay(following.id))loader.load(following).catch(console.warn);
}
async function galleryPictures(){
 const entries=await Promise.all(levels.map(async entry=>{
  const record=gallery.entries.find(item=>item.id===entry.id),locked=!progression.canPlay(entry.id),completed=progression.isComplete(entry.id)&&!locked,key=entry.id+':'+(record?.completedAt||'preview')+':'+locked+':'+completed;
  for(const cached of previewCache.keys())if(cached.startsWith(entry.id+':')&&cached!==key)previewCache.delete(cached);
  if(!previewCache.has(key))previewCache.set(key,loadGalleryImage((!locked&&record?.image)||`assets/${entry.preview}.png?v=39`).then(image=>({id:entry.id,name:entry.name,locked,completed,image:galleryPicture(image,!completed,locked),sharp:galleryPicture(image)})).catch(error=>{previewCache.delete(key);throw error}));
  return previewCache.get(key);
 }));galleryArt=entries;view.setGalleryEntries(entries,levels.indexOf(level));return entries;
}
function galleryLabels(){
 const selected=levels[rail.target],current=rail.target===levels.indexOf(level),record=gallery.entries.find(e=>e.id===selected.id),locked=!progression.canPlay(selected.id),last=current&&finished&&levels.indexOf(level)===levels.length-1;
 $('#complete-level').textContent=finished&&current?level.name+' · TAMAMLANDI':locked?'KİLİTLİ ESER':'KOLEKSİYONUN';
 $('#complete-title').textContent=finished&&current?'Biraz ışık, biraz sabır.':selected.name;
 $('#gallery-caption').textContent=`${String(rail.target+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}  ·  ${selected.name}`;
 $('#gallery-prev').disabled=rail.target===0;$('#gallery-next').disabled=rail.target===levels.length-1;
 $('#next-level-name').textContent=locked?'Önce '+levels[rail.target-1].name:last?'Koleksiyonun':finished&&current?following.name:selected.name;$('#next-level').disabled=locked;
 $('#enter-label').textContent=locked?'Kilitli':last?'Sergiyi gez':current?(finished?'Yeni bölüm':'Devam et'):progression.isComplete(selected.id)?'Yeniden yap':'Bu esere gir';
 $('#share').hidden=$('#save').hidden=!(finished&&current);$('#again').hidden=!(finished&&record&&!locked);$('#again').setAttribute('aria-label',selected.name+' bölümünü yeniden oyna');$('#exhibition-close').hidden=finished;
 document.querySelectorAll('#gallery-dots button').forEach((button,i)=>button.setAttribute('aria-current',String(i===rail.target)));
}
function selectArtwork(index){rail.select(index);session.focus(levels[rail.target].id);galleryLabels();if(progression.canPlay(levels[rail.target].id))loader.load(levels[rail.target]).catch(console.warn);}
function showExhibition({silent=false}={}){
 if(spray&&!booting&&!exhibition&&!transitioning)saveSprayBand(spray.checkpoint());
 if(!view||transitioning)return;releaseAll();pointer.visible=false;exhibition=true;sound(0);if(soundOn&&!silent)audio();rail.focus=rail.target=levels.indexOf(level);view.galleryActive=true;view.galleryFocus=rail.focus;document.body.dataset.exhibition='true';$('#complete').hidden=false;galleryLabels();galleryPictures().catch(console.warn);
}
function closeExhibition(){
 if(transitioning||finished||!exhibition)return;if(soundOn)audio();releaseAll();transitioning=true;document.body.dataset.transition='entering';rail.focus=rail.target=levels.indexOf(level);
 view.beginEntry(levels.indexOf(level),lobby?galleryArt[levels.indexOf(level)].sharp:null,()=>{lobby=false;view.hideLobby();exhibition=false;view.galleryActive=false;delete document.body.dataset.exhibition;$('#complete').hidden=true;},()=>{transitioning=false;delete document.body.dataset.transition;updateUI();});
}

async function openLevel(id,replace=false){
 const target=levels.find(entry=>entry.id===id);if(!target||!view||transitioning||!progression.canPlay(target.id))return;
 if(target===level&&!finished){closeExhibition();return;}
 if(soundOn)audio();if(dialog.open)closeSettings();if(settings.entryMode!=='direct'||!exhibition)showExhibition();selectArtwork(levels.indexOf(target));transitioning=true;document.body.dataset.transition='loading';releaseAll();
 try{
  const [bundle]=await Promise.all([loader.load(target),galleryArt.length?Promise.resolve():galleryPictures()]);
  const image=galleryArt[levels.indexOf(target)].sharp;document.body.dataset.transition='entering';
  await prepareStage(target,bundle);
  view.beginEntry(levels.indexOf(target),image,()=>{
   lobby=false;view.hideLobby();level=target;stages=level.stages;installBundle(bundle);view.colors=stages.map(stage=>stage.color);exhibition=false;view.galleryCurrent=levels.indexOf(level);rail.focus=rail.target=levels.indexOf(level);
   reset();levelLabels();document.body.dataset.transition='arriving';delete document.body.dataset.exhibition;
   // Same renderer, same document. Only the local level bundle is replaced.
   const url=new URL(location.href);url.search='';url.searchParams.set('v','39');url.searchParams.set('bolum',level.id);if(settings.controlMode==='hold')url.searchParams.set('mod','basili');if(settings.controlMode==='tilt')url.searchParams.set('mod','egim');if(settings.controlMode==='spray'){url.searchParams.set('mod','puskurt');if(spraySequence==='classic')url.searchParams.set('sira','klasik');}history[replace?'replaceState':'pushState']({level:level.id},'',url);
   view.setGalleryEntries(galleryArt,levels.indexOf(level));
  },()=>{transitioning=false;delete document.body.dataset.transition;updateUI();});
 }catch(error){transitioning=false;delete document.body.dataset.transition;$('#share-status').textContent='Eser yüklenemedi. Yeniden deneyebilirsin.';console.error(error);}
}
for(const entry of levels){
 const button=document.createElement('button');button.className='level-card';button.innerHTML=`<img src="assets/${entry.preview}.png" alt=""><span><strong>${entry.name}</strong><small>${entry.subtitle}</small></span><b>Başla →</b>`;button.onclick=()=>{if(entry!==level)openLevel(entry.id)};$('#levels').append(button);
 const dot=document.createElement('button');dot.setAttribute('aria-label',entry.name+' tablosuna git');dot.onclick=()=>selectArtwork(levels.indexOf(entry));$('#gallery-dots').append(dot);
}
$('#next-level').onclick=()=>{if(finished&&rail.target===levels.length-1&&level===levels.at(-1)){selectArtwork(0);return;}if(rail.target===levels.indexOf(level)&&!finished)closeExhibition();else openLevel(rail.target===levels.indexOf(level)?following.id:levels[rail.target].id);};
$('#exhibition-open').onclick=showExhibition;$('#exhibition-close').onclick=closeExhibition;$('#gallery-prev').onclick=()=>selectArtwork(rail.target-1);$('#gallery-next').onclick=()=>selectArtwork(rail.target+1);
window.addEventListener('keydown',event=>{if(!(exhibition||finished)||transitioning||dialog.open)return;if(event.key==='ArrowRight'){event.preventDefault();selectArtwork(rail.target+1)}if(event.key==='ArrowLeft'){event.preventDefault();selectArtwork(rail.target-1)}if(event.key==='Escape')closeExhibition();});
window.addEventListener('popstate',()=>{const selected=selectLevel(location.search);if(selected!==level)openLevel(selected.id,true);});
levelLabels();

function rackButton(color,caption){
 const button=document.createElement('button');
 button.type='button';
 if(color!==null){
  const nozzle=document.createElement('b');
  nozzle.className='rack-nozzle';nozzle.style.setProperty('--cartridge',stages[color].color);
  nozzle.textContent=AMMO;button.append(nozzle);
 }
 const label=document.createElement('span');
 label.textContent=caption;button.append(label);
 return button;
}
function updateWorkshop(){
 const visible=!exhibition&&!finished&&!transitioning;
 const panel=$('#cartridge-rack');
 panel.hidden=!visible||!rackMode()||!(flow.phase==='load'||rack.active>=0&&flow.phase==='pour');
 if(!panel.hidden){
  const choices=cartridgeChoices(stages,index).filter(color=>!rack.slots.includes(color));
  const key=[level.id,index,rack.selected,rack.active,...rack.slots,...choices].join(':');
  if(key!==rackKey){
   rackKey=key;
   $('#rack-title').textContent='Hedef · '+stages[index].name;
   const parked=rack.slots.some(color=>color!==null);
   let feedback='Bir kartuş seç, sonra yuvaya dokun.';
   if(parked)feedback='Park edilen kartuş bekliyor. Hedef rengi tak.';
   if(rack.selected!==null)feedback='Seçilen kartuşu bir yuvaya koy.';
   if(rack.active>=0)feedback='Sonraki rengi boş yuvaya hazırlayabilirsin.';
   $('#rack-feedback').textContent=feedback;
   $('#rack-slots').replaceChildren(...rack.slots.map((color,slot)=>{
    const button=rackButton(color,color===null?'Yuva '+(slot+1):stages[color].name);
    button.setAttribute('aria-label','Yuva '+(slot+1)+(color===null?' boş':', '+stages[color].name));
    button.dataset.firing=String(slot===rack.active);
    button.disabled=slot===rack.active;
    button.onclick=()=>{
     if(rack.selected===null)rack.remove(slot);
     else if(rack.load(slot,rack.selected)){
      rack.selected=null;
      if(flow.phase==='load'&&rack.slots.includes(index)){flow.pour();prepareDose();}
     }
     updateUI();
    };
    return button;
   }));
   $('#rack-colors').replaceChildren(...choices.map(color=>{
    const button=rackButton(color,stages[color].name);
    button.setAttribute('aria-pressed',String(rack.selected===color));
    button.onclick=()=>{rack.selected=rack.selected===color?null:color;updateWorkshop();};
    return button;
   }));
  }
  if(rack.active>=0&&pour){
   const counter=$('#rack-slots [data-firing=true] .rack-nozzle');
   if(counter)counter.textContent=Math.ceil(AMMO*Math.max(0,1-pour.emitted/pour.dose));
  }
 }
 const assist=visible&&settings.controlMode==='hold'&&flow.phase==='brush';
 const aim=assist&&settings.holdExperiment==='aim',pulse=assist&&settings.holdExperiment==='pulse';
 $('#hold-assist').hidden=!aim&&!pulse;
 $('#hold-assist label').hidden=$('#hold-aim').hidden=!aim;
 $('#hold-pulse').hidden=$('#hold-pulse-label').hidden=!pulse;
}
$('#hold-aim').oninput=e=>{holdAim=Number(e.target.value);};
function colorStatus(){if(spray)return {ready:spray.complete,percent:Math.floor(spray.coverage*100)};return completionStatus(sand.coverage,settings.pace,sand.targetCount*25,settings.controlMode)}
function ready(){return sand&&colorStatus().ready}
function saveSprayBand(band){
 try{
  const key='sim-atolyesi-spray-v1:'+level.id;
  if(band)localStorage.setItem(key,JSON.stringify(band));else localStorage.removeItem(key);
 }catch{}
}
function activateSpray(){
 let restored=0;
 try{restored=JSON.parse(localStorage.getItem('sim-atolyesi-spray-v1:'+level.id)||'0');}catch{}
 sprayWallet.refresh();
 spray=new SprayBoard(stages.map(stage=>masks[stage.id]),restored,{sequence:spraySequence,capacity:sprayWallet.capacity});
 spraySavedBand=spray.band;spraySavedPaint=spray.paintRevision;sprayClock=spraySaveClock=sprayFinishTime=0;sprayMuzzles=[];
 flow.phase='spray';autoKick=0;view.setSpray(spray);
}
function updateSprayUI(){
 const visible=!exhibition&&!transitioning&&!finished;
 const band=Math.min(spray.band+1,spray.bands.length),percent=Math.floor(spray.coverage*100);
 canvas.setAttribute('aria-label','Resmi renkli şişelerle aşağıdan yukarı simle');
 $('#stage-label').textContent=String(band).padStart(2,'0')+' / '+spray.bands.length;
 $('#stage-label').title='Aşağıdan yukarı · aktif sıra';
 $('#coverage').textContent=percent+'%';$('#color-dot').style.background='#f4c674';
 for(const id of ['quick-actions','tilt-toolbar','hold-control','next','hold-assist','cartridge-rack'])$('#'+id).hidden=true;
 sprayRack.render(spray,stages,visible,sprayWallet);
 if(visible)spray.lead=sprayRack.lead;
}
function openSprayUnlock(){
 if(!spray||dialog.open||exhibition||transitioning||spray.complete)return;
 sprayWallet.refresh();
 if(spray.capacity!==sprayWallet.capacity){spray.setCapacity(sprayWallet.capacity);updateSprayUI();}
 if(sprayWallet.price||spray.jammed)sprayUnlock.show(spray,sprayWallet);
}
function unlockSpraySlot(method,capacity){
 if(!spray||!sprayUnlock.open)return false;
 const unlocked=sprayWallet.unlock(method,capacity);
 if(!unlocked&&spray.capacity===sprayWallet.capacity)return false;
 spray.setCapacity(sprayWallet.capacity);updateSprayUI();return true;
}
function releaseSpraySlot(){
 if(!spray?.releaseWaiting())return false;
 updateSprayUI();return true;
}
function loadSprayBottle(column){
 if(!spray||dialog.open||sprayUnlock.open||exhibition||transitioning||spray.complete)return;
 const bottle=spray.trays[column][0],slot=spray.load(column);
 if(slot<0){if(spray.jammed)openSprayUnlock();else if(spray.full)sprayRack.indicateFull();return;}
 if(soundOn)audio();
 sprayRack.animateDock(column,slot,stages[bottle.color].color,bottle.remaining);
 sprayMuzzles[slot]=view.mapPointer(sprayRack.mouth(slot));
 updateSprayUI();
}
function unloadSprayBottle(slot){
 if(!sprayUnlock.open&&spray?.returnBottle(slot))updateSprayUI();
}
let sprayNoise,lastHiss=-Infinity,lastTick=-Infinity;
function sprayChime(){
 if(!soundOn||audioCtx?.state!=='running')return;
 const now=audioCtx.currentTime;
 for(const [index,note] of [659,880,1175].entries()){
  const at=now+index*.042,voice=audioCtx.createOscillator(),gain=audioCtx.createGain();
  voice.type='sine';voice.frequency.value=note;
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.028,at+.009);
  gain.gain.exponentialRampToValueAtTime(.0001,at+.16);
  voice.connect(gain).connect(audioCtx.destination);voice.start(at);voice.stop(at+.17);
 }
}
function spraySound(impact){
 if(!soundOn||audioCtx?.state!=='running')return;
 const now=audioCtx.currentTime;
 if(impact){
  if(now-lastTick<.085)return;
  lastTick=now;
  const voice=audioCtx.createOscillator(),gain=audioCtx.createGain();
  voice.frequency.setValueAtTime(1450,now);voice.frequency.exponentialRampToValueAtTime(580,now+.063);
  gain.gain.setValueAtTime(.032,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.073);
  voice.connect(gain).connect(audioCtx.destination);voice.start(now);voice.stop(now+.077);
  return;
 }
 if(now-lastHiss<.075)return;
 lastHiss=now;
 if(!sprayNoise){
  sprayNoise=audioCtx.createBuffer(1,Math.ceil(audioCtx.sampleRate*.11),audioCtx.sampleRate);
  const noise=sprayNoise.getChannelData(0);
  for(let i=0;i<noise.length;i++)noise[i]=(Math.random()*2-1);
 }
 const burst=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();
 burst.buffer=sprayNoise;filter.type='bandpass';filter.frequency.value=2350;filter.Q.value=.65;
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.24,now+.012);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.105);
 burst.connect(filter).connect(gain).connect(audioCtx.destination);burst.start(now);
}
const sprayEvents={
 fire(shot,slot){
  const source=sprayMuzzles[slot]??(sprayMuzzles[slot]=view.mapPointer(sprayRack.mouth(slot)));
  const middle=shot.cells[Math.floor(shot.cells.length*.5)],ripple=spraySequence==='ripple';
  const duration=(ripple?.145:.22)+Math.min(.16,Math.hypot(middle.x-source.x,middle.y-source.y)*.00025);
  view.sprayParticles.emit(shot,source,stages[shot.color].color,spray.time,duration,ripple);
  spraySound(false);
  return duration;
 },
 impact(){spraySound(true);}
};
function advanceSpray(dt){
 spray.step(dt,sprayEvents);
 spraySaveClock+=dt;
 if(spray.band!==spraySavedBand){
  spraySavedBand=spray.band;sprayWallet.grantThrough(level.id,spray.band);
  if(spraySequence==='ripple')sprayChime();
 }
 if(spraySaveClock>=.35&&spraySavedPaint!==spray.paintRevision){
  spraySaveClock=0;spraySavedPaint=spray.paintRevision;saveSprayBand(spray.checkpoint());
 }
 if((sprayClock+=dt)>.08){sprayClock=0;updateSprayUI();}
 if(!spray.complete)return;
 if(!sprayFinishTime){sprayFinishTime=spray.time+.52;return;}
 if(spray.time<sprayFinishTime)return;
 const pixels=sprayPosterPixels(spray.owner,stages.map(stage=>stage.color));
 bakedContext.putImageData(new ImageData(pixels,W,H),0,0);
 cc.clearRect(0,0,W,H);mc.clearRect(0,0,W,H);mc.drawImage(baked,0,0);view.setCoatMask(paintMask);
 index=stages.length-1;repaintPaper();saveSprayBand(0);spray=null;view.setSpray(null);
 finishArtwork();
}
function updateUI(){
 if(!sand)return;
 if(spray&&flow.phase==='spray'){updateSprayUI();return;}
 sprayRack.render(null,stages,false);
 canvas.setAttribute('aria-label',settings.controlMode==='hold'?'Basılı tutarak kâğıdı bük ve simleri yukarıdan aşağıya akıt':settings.controlMode==='tilt'?'Telefonu eğerek simleri yapışkan alana taşı':'Sıradaki kâğıdı açmak için dokun, ardından simi fırçayla yay');
 const phase=flow.phase,percent=phase==='shake'&&flow.advance?100:colorStatus().percent;
 $('#stage-label').textContent=`${String(index+1).padStart(2,'0')} / ${stages.length}`;$('#stage-label').title=stages[index].name;$('#color-dot').style.background=stages[index].color;
 $('#coverage').textContent=percent+'%';$('#progress-fill').style.width=percent+'%';
 const messages={peel:['↗','Kâğıt hazırlanıyor.','Cımbız sıradaki parçayı alıyor.','SOY'],rolling:['↗','Kâğıt açılıyor…','Açılan taralı alan simi tutacak.','SOY'],pour:['⠿','Bir yığın parıltı.','Kap boşalsın; sonra simi parmağınla yay.','DÖK'],brush:['▰','Yığından başla, kenarlara yay.','Sim yetmezse + Sim ile bir yığın daha ekle.','YAY'],shake:['∪','İki yandan bük, ortaya topla.','Simler huniden küçük kavanoza akıyor.','BOŞALT'],complete:['✧','Ellerine sağlık.','Biraz sabır, binlerce küçük parıltı.','BİTTİ']};
 if(phase==='rolling')messages.rolling=['↗',`Parça ${activePart+1} / ${partLayers.length} · ${settings.gameSpeed>1?settings.gameSpeed+'x hızla':'yavaşça'} soyuluyor`,'Küçük parçalar kısa, büyük parçalar yavaşça açılır.','SOY'];
 if(settings.controlMode==='tilt'){messages.brush=['◉','Telefonu eğ, simi akıt.','Yapışkana değen taneler kendiliğinden tutunur.','EĞ'];messages.pour=['⠿','Sim tek noktaya dökülüyor.','Birazdan telefonu eğerek simleri taşı.','DÖK'];}
 if(settings.controlMode==='brush'&&phase==='brush'&&settings.paperMotion==='hands')messages.brush[2]='Simleri yay; kâğıdı eğmek için yan kenarını tut.';
 if(settings.controlMode==='hold'){messages.peel=['↗','Kâğıt hazırlanıyor.','Parçalar açılınca üst kenara sim dökülecek.','HAZIRLA'];messages.pour=['⠿',['local','joined'].includes(settings.holdPlacement)?'Gerekli parçalara ortak döküş.':settings.holdPlacement==='width'?'Hedef genişliğinde bir şerit.':settings.holdRows===2?'Üst kenara iki sıra sim.':'Üst kenara bir şerit sim.','Şerit hazırlanınca ekrana basılı tut.','DÖK'];messages.brush=['∪',(down||holdLatched)?'Bükülüyor, simler akıyor.':'Basılı tut, simi akıt.','Bırakınca durur. Yapışkana ulaşan simler tutunur.','BASILI TUT'];}
 if(settings.recovery!=='classic'){messages.brush[2]=settings.recovery==='rills'?'Düşen simler kanallardan kavanoza akıyor.':'Düşen simler altta birikiyor; sonda kavanoza akacak.';messages.shake=['∪',settings.recovery==='rills'?'Son simleri de kavanoza akıt.':'Biriken simleri kavanoza doldur.','Oyun boyunca topladığın simler de aynı kavanoza giriyor.','TOPLA'];}
 if(settings.recovery==='table'){messages.brush[2]='Düşen simler masada kalıp yavaşça sönüyor.';messages.shake=['∪','Simler masaya dökülsün.','Masanın üstünde durup yumuşakça kaybolacaklar.','MASAYA BIRAK'];}
 if(phase==='shake'&&cleanup?.tapping)messages.shake=['⋰','Son tanelere hafif bir vuruş.','Kâğıtta kalan simler de huniye dökülüyor.','SON DOKUNUŞ'];
 if(phase==='load')messages.load=['◉','Renk kartuşunu tak.','Hedefle aynı rengi seçip bir yuvaya koy.','EŞLE'];
 if(settings.controlMode==='hold'&&phase==='brush'){
  if(settings.holdExperiment==='aim')messages.brush=['↔','Basılı tut ve yana kaydır.','Parmağının altındaki akış hızlanır.','YÖNLENDİR'];
  if(settings.holdExperiment==='pulse')messages.brush=['◉','Kısa basışlarla hızlan.','Bırakınca güç çubuğu yeniden dolar.','RİTİM'];
 }
 if(settings.controlMode==='hold'&&settings.holdExperiment==='point'){
  canvas.setAttribute('aria-label','Kâğıdın üzerinde bir noktaya basılı tutarak simi o yöne akıt');
  messages.peel[2]='Parçalar açılınca sim tek şerit halinde dökülecek.';
  messages.pour=['⠿',settings.holdPointPlacement==='middle'?'Ortadan bir şerit sim.':'Üstten bir şerit sim.','Sonra simi akıtmak istediğin yere bas.','DÖK'];
  messages.brush=['◎','Simleri dokunduğun yere akıt.','Kâğıtta bir noktaya basılı tut. Yön değiştirmek için sürükle.','YÖNLENDİR'];
 }
 const m=messages[phase]||messages.brush;$('#phase-icon').textContent=m[0];$('#instruction-title').textContent=m[1];$('#instruction-text').textContent=phase==='brush'&&settings.layout!=='flow'&&settings.controlMode==='brush'?'Sim ekle ile açık alanın üstüne yeni bir yığın dökebilirsin.':m[2];$('#phase-label').textContent=m[3];
 const canNext=phase==='brush'&&ready()&&!finished;
 $('#next').hidden=!canNext||settings.controlMode!=='brush';$('#next').disabled=!canNext;$('#next').innerHTML=index===stages.length-1?'Eserini tamamla <span>✧</span>':'Sonraki renk <span>→</span>';
 $('#auto-status').hidden=true;
 if(paperMotion.grip){$('#instruction-title').textContent='Kâğıdı hafifçe yönlendir.';$('#instruction-text').textContent='Taneler eğime doğru akıyor; bırakınca masa düzleşir.';}
 if(canNext){$('#instruction-title').textContent='Renk tamamlandı.';$('#instruction-text').textContent=settings.controlMode==='hold'?'Kâğıt bükülüp kalan simler huniye akacak.':settings.autoAdvance?'Parmağını kaldır; sıradaki renge geçelim.':'Sonraki renk ile devam et.';}
 updateTiltUI();
 $('#hold-control').hidden=finished||settings.controlMode!=='hold'||phase!=='brush';$('#hold-control').setAttribute('aria-label','Basılı tut, kâğıdı bük ve simi akıt');$('#hold-control').setAttribute('aria-pressed',String(down||holdLatched));$('#hold-control b').textContent=cascade?.finishing?'Son taneler yerleşiyor':(down||holdLatched)?'Akıyor · %98’de otomatik':'Basılı tut · akıt';
 updateWorkshop();
 $('#quick-actions').hidden=settings.controlMode==='hold'||phase!=='brush'||finished||canNext;
 for(const button of document.querySelectorAll('[data-tool]')){
  const t=button.dataset.tool;if(t==='brush'){button.querySelector('b').textContent=settings.controlMode==='tilt'?'Telefonu eğ':'Fırça';button.querySelector('span').textContent=settings.controlMode==='tilt'?'◉':'▰';button.setAttribute('aria-label',settings.controlMode==='tilt'?'Telefon eğimini etkinleştir':'Fırçayı seç');}const selected=t===(phase==='shake'?'clean':phase==='rolling'?'peel':phase);
  button.classList.toggle('selected',selected);button.disabled=finished||flow.busy||(t==='peel'?phase!=='peel':phase==='peel');
 }
}
function makePartLayers(stage=stages[index],source=assets){
 return piecesByStage[stage.id].map(piece=>{
  const b=piece.bounds,mask=document.createElement('canvas');mask.width=b.w;mask.height=b.h;const m=mask.getContext('2d');m.fillStyle='#fff';for(const [y,x,length] of piece.runs)m.fillRect(x,y,length,1);
  const paper=document.createElement('canvas');paper.width=b.w;paper.height=b.h;const p=paper.getContext('2d');p.drawImage(paperBase,b.x,b.y,b.w,b.h,0,0,b.w,b.h);p.globalAlpha=.96;p.drawImage(source.lines,b.x,b.y,b.w,b.h,0,0,b.w,b.h);p.globalAlpha=1;p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);
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
async function prepareStage(target,bundle){
 // Do expensive raster preparation before the camera moves, never at the covered seam.
 await new Promise(resolve=>requestAnimationFrame(resolve));
 const stage=target.stages[0],sand=new Sand();sand.setBehavior(settings);sand.setMask(bundle.masks[stage.id]);
 const texture=document.createElement('canvas');texture.width=W;texture.height=H;drawGlitter(texture.getContext('2d'),stage.color,W,H,settings.controlMode==='hold'?settings.holdGrainSize:1);
 preparedStage={id:stage.id,sand,layers:makePartLayers(stage,bundle.assets),glitter:texture};
 await new Promise(resolve=>requestAnimationFrame(resolve));
}
function activate(){
 holdPoint.x=W/2;holdPoint.y=H/2;
 holdCharge=1;tiltGrip=0;cascade=null;cleanup=null;holdLatched=false;holdSupplyPending=false;autoKick=.38;paperMotion.reset();paperPose={x:0,y:0,cup:0,pitch:0};if(preparedStage?.id!==stages[index].id)preparedStage=null;sand=preparedStage?.sand||new Sand();sand.setBehavior(settings);if(!preparedStage)sand.setMask(masks[stages[index].id]);flow.reset();peeled=false;peel=0;pour=null;readySince=0;strokes.length=0;activePart=0;revealedParts=0;
 gc.globalCompositeOperation='source-over';gc.clearRect(0,0,W,H);partLayers=preparedStage?.layers||makePartLayers();flow.setRollDuration(peelDuration(partLayers.map(p=>p.piece)));
 makeGlitter(stages[index].color);lastCoated=-1;cc.clearRect(0,0,W,H);view.setStage(index);updateCoat(true);repaintPaper();view.setPeelPiece(partLayers[0].paper,partLayers[0].piece);preparedStage=null;
 if(settings.controlMode==='spray')activateSpray();
 else session.checkpoint(level.id,index,false);
 updateUI();
}
function beginRoll(){if(soundOn)audio();if(finished||!flow.roll())return;down=false;strokes.length=0;peel=0;updateUI()}
function prepareDose(){
 if(rackMode()&&rack.active<0&&!rack.begin(index)){
  flow.phase='load';
  flow.elapsed=0;
  pour=null;
  return;
 }
 if(settings.controlMode==='hold'){
  holdSupplyPending=false;cascade=new HoldCascade(sand,{...settings,pieces:partLayers.map(layer=>layer.piece)});flow.setPourDuration(cascade.duration);playedPour=-1;if(settings.recovery==='table')view.reserveTable(cascade.routes.length);pour={...cascade.sourcePose(0),kind:'hold',spots:cascade.bands.map(b=>({x:(b.x0+b.x1)/2,y:b.y})),duration:cascade.duration,dose:cascade.routes.length,emitted:0,elapsed:0};return;
 }
 const amount=doseFor(sand.targetCount,settings,sand.capacity);
 if(sand.capacity-sand.count<amount){sand.compact();view.currentInitialized=0;}
 const dose=doseFor(sand.targetCount,settings,sand.capacity-sand.count);
 if(dose<50){flow.phase='brush';$('#instruction-text').textContent='Kâğıtta bol sim var. Önce yay veya fazlasını kutuya boşalt.';return;}
 let anchor=stages[index].pour;
 // Refill over unfinished adhesive, rather than repeatedly burying a finished patch.
 if(sand.coverage>.15&&settings.controlMode==='tilt'){
  anchor=view.coverageGuide.find(sand)[0]??anchor;
 }else if(sand.coverage>.15){let best=-Infinity;const referenceY=anchor.y;
  for(let k=0;k<sand.target.length;k++)if(sand.target[k]>12&&!sand.bound[k]){
   const x=k%120*5+2,y=Math.floor(k/120)*5+2;if(!sand.onGlue(x,y))continue;
   let nearby=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const q=k+dy*120+dx;if(q>=0&&q<sand.target.length&&!sand.bound[q])nearby+=sand.target[q];}
   const score=nearby-Math.abs(y-referenceY)*.05;if(score>best){best=score;anchor={x,y};}
  }
 }
 const plan=supplyPlan(anchor,sand.mask,sand.bound,sand.targetCount,{...settings,pieces:partLayers.map(l=>l.piece),refill:sand.coverage>.15});flow.setPourDuration(plan.duration);playedPour=-1;pour={...plan,...plan.spots[0],fan:plan.kind==='single'?22:plan.small?30:settings.pourStyle==='ribbon'?32:plan.kind==='curtain'?40:52,dose,emitted:0,elapsed:0};
}
$('#hold-repour').onclick=()=>{
 if(settings.controlMode!=='hold'||finished)return;rack.finish();releaseAll();view.reset();activate();flow.phase='pour';peeled=true;peel=1;revealUntil(partLayers.length);view.peelProgress(1);prepareDose();repaintPaper();closeSettings();updateUI();
};
function addSand(){if(finished||flow.busy)return;sand.compact({archiveBound:settings.controlMode!=='brush'});view.currentInitialized=0;if(sand.capacity-sand.count<200&&sand.hasLoose()){refillAfterShake=true;startShake(false);return;}if(!flow.pour())return;releaseAll();prepareDose();readySince=0;updateUI()}
function startShake(advance=false){if(finished||!flow.shake(advance))return;shakeRuns++;releaseAll();cleanup=settings.extraFinish?new CleanupCycle(sand,cascade?.retainedIndices,sand.random,{style:settings.finishStyle}):null;flow.returnDuration=cleanup?.28:1;view.beginCleanup();pour=null;view.posePour(null);readySince=0;updateUI()}
function nextStage(){
 refillAfterShake=false;nextRuns++;updateCoat(true,true);bakedContext.drawImage(coat,0,0);view.updateGrains(sand);
 if(index<stages.length-1){index++;activate();autoKick=(settings.autoAdvance||settings.controlMode!=='brush')?.22:0;}
 else finishArtwork();
}
function finishArtwork(){
 finished=true;flow.phase='complete';pointer.visible=false;view.current.visible=false;view.heap.visible=false;
 $('#complete').hidden=false;document.body.dataset.complete='true';progression.complete(level.id);session.checkpoint(level.id,index,true);levelLabels();
 try{gallery.remember({id:level.id,image:galleryThumbnail(paperCanvas),completedAt:Date.now()})}catch{}
 $('#gallery-caption').textContent=gallery.entries.length<2?'Galerinin ilk eseri':`Galerinde ${gallery.entries.length} eser`;
 showExhibition();galleryPictures().catch(console.warn);deviceTilt.stop();completedPoster=posterBlob(paperCanvas).catch(()=>null);releaseAll();$('#complete-title').focus({preventScroll:true});updateUI();
}
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{const t=button.dataset.tool;if(t==='peel')beginRoll();else if(t==='pour')addSand();else if(t==='clean')startShake(false);else if(t==='brush'&&settings.controlMode==='tilt'&&!tiltFrame.active)enableTilt();else updateUI()};
$('#add-sand').onclick=addSand;$('#shake').onclick=()=>startShake(false);$('#next').onclick=()=>{if(ready())startShake(true)};
function reset({restartSpray=false}={}){if(!view)return;if(restartSpray&&settings.controlMode==='spray')saveSprayBand(0);rack=new CartridgeRack();rackKey='';lobby=false;view.hideLobby();releaseAll();exhibition=false;view.galleryActive=false;delete document.body.dataset.exhibition;refillAfterShake=false;finished=false;index=0;autoKick=0;bakedContext.clearRect(0,0,W,H);cc.clearRect(0,0,W,H);view.reset();$('#complete').hidden=true;delete document.body.dataset.complete;completedPoster=null;sharing=false;$('#share').disabled=false;$('#save').disabled=false;$('#share-status').textContent='';activate()}
$('#reset').onclick=()=>{reset({restartSpray:true});closeSettings()};$('#again').onclick=()=>openLevel(levels[rail.target].id);
let sharing=false,completedPoster=null;
async function exportPoster(share=false){
 if(sharing||!finished)return;sharing=true;const button=$(share?'#share':'#save');button.disabled=true;$('#share-status').textContent='Poster hazırlanıyor…';
 try{
  const blob=await completedPoster||await posterBlob(paperCanvas),file=new File([blob],`sim-atolyesi-${level.id}.png`,{type:'image/png'});
  if(share&&navigator.canShare?.({files:[file]})&&navigator.share){$('#share-status').textContent='Paylaşım seçenekleri açıldı.';await navigator.share({files:[file],title:`${level.name} · Sim Atölyesi`});$('#share-status').textContent='Paylaşıldı ✦';}
  else{downloadPoster(blob,level.id);$('#share-status').textContent=share?'Poster indirildi. Galerinden paylaşabilirsin.':'Poster indirildi ✦';}
 }catch(error){$('#share-status').textContent=error.name==='AbortError'?'':'Kaydedilemedi. Tekrar deneyebilirsin.';}
 finally{sharing=false;button.disabled=false;}
}
$('#save').onclick=()=>exportPoster();$('#share').onclick=()=>exportPoster(true);
function beginPointer(e){
 e.preventDefault();if(view&&(exhibition||finished)&&!transitioning){if(!gate.begin(e.pointerId,e.isPrimary!==false))return;e.currentTarget.setPointerCapture(e.pointerId);rail.begin(e.clientX,e.timeStamp);galleryTap={x:e.clientX,y:e.clientY,time:e.timeStamp};return;}if(transitioning||booting)return;if(!view||finished||flow.phase==='load'||(flow.busy&&flow.phase!=='rolling')||!gate.begin(e.pointerId,e.isPrimary!==false))return;
 if(spray&&flow.phase==='spray'){gate.end(e.pointerId);return;}
 e.currentTarget.setPointerCapture(e.pointerId);pointer={...view.mapPointer(e),visible:true};previous={...pointer};pointerTime=e.timeStamp;
 if(soundOn)audio();
 if(flow.phase==='peel'){beginRoll();down=false;pointer.visible=false;updateUI();return;}
 if(flow.phase==='rolling'){down=false;pointer.visible=false;updateUI();return;}
 if(settings.controlMode==='hold'&&flow.phase==='brush'){
  if(settings.holdExperiment==='aim'&&e.currentTarget===canvas)setHoldAim(e);
  if(settings.holdExperiment==='point'&&e.currentTarget===canvas)setHoldPoint(pointer);
  down=true;pointer.visible=false;updateUI();return;}
 if(settings.controlMode==='tilt'&&flow.phase==='brush'){pointer.visible=false;return;}
 if(settings.paperMotion==='hands'&&flow.phase==='brush'&&(pointer.x<24||pointer.x>576)){paperMotion.begin(pointer);updateUI();return;}
 down=true;
}
canvas.addEventListener('pointerdown',beginPointer);$('#hold-control').addEventListener('pointerdown',beginPointer);
$('#hold-control').onclick=e=>{if(e.detail!==0||!(settings.controlMode==='hold'&&flow.phase==='brush'))return;holdLatched=!holdLatched;if(soundOn)audio();updateUI();};
$('#hold-control').onkeydown=e=>{
 if(settings.holdExperiment!=='point')return;
 const offset={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]}[e.key];
 if(offset){e.preventDefault();setHoldPoint({x:holdPoint.x+offset[0],y:holdPoint.y+offset[1]});}
};
function setHoldPoint({x,y}){
 holdPoint.x=Math.max(1,Math.min(W-1,x));holdPoint.y=Math.max(1,Math.min(H-1,y));
}
function setHoldAim(e){
 const bounds=canvas.getBoundingClientRect();
 holdAim=Math.max(0,Math.min(600,600*(e.clientX-bounds.left)/bounds.width));
 $('#hold-aim').value=holdAim;
}
function moveHoldAim(e){
 if(down&&gate.owns(e.pointerId)&&settings.controlMode==='hold'&&settings.holdExperiment==='aim')setHoldAim(e);
}
$('#hold-control').addEventListener('pointermove',moveHoldAim);
canvas.addEventListener('pointermove',e=>{
 moveHoldAim(e);
 if((exhibition||finished)&&!transitioning){if(gate.owns(e.pointerId)){rail.move(e.clientX,view.heroFrame.width*810/660,e.timeStamp);galleryLabels();}return;}
 if(transitioning||!view||finished||e.isPrimary===false)return;
 if(down&&gate.owns(e.pointerId)&&settings.controlMode==='hold'&&settings.holdExperiment==='point'){setHoldPoint(view.mapPointer(e));return;}
 if(gate.active===null&&e.pointerType==='mouse'&&!e.buttons&&settings.controlMode==='brush'){pointer={...view.mapPointer(e),visible:true};return;}
 if(!gate.owns(e.pointerId)||flow.phase!=='brush'||settings.controlMode!=='brush')return;
 if(paperMotion.grip){pointer={...view.mapPointer(e),visible:true};paperMotion.move(pointer);return;}
 if(!down)return;
 const p=view.mapPointer(e);pointer={...p,visible:true};
 if(Math.hypot(p.x-previous.x,p.y-previous.y)>.1){appendStroke(strokes,{from:{...previous},to:{...p},seconds:Math.max(.001,Math.min(.1,(e.timeStamp-pointerTime)/1000))})}previous=p;pointerTime=e.timeStamp;
});
function pointerEnd(e){if(!gate.end(e.pointerId))return;if(exhibition||finished){
 const tap=galleryTap;galleryTap=null;rail.end(e.type==='pointercancel');session.focus(levels[rail.target].id);galleryLabels();
 if(tap&&e.type==='pointerup'&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<10&&e.timeStamp-tap.time<500){const hit=view.pickArtwork(e);if(hit!==null){selectArtwork(hit);if(progression.canPlay(levels[hit].id))openLevel(levels[hit].id);}}
 return;
 }paperMotion.end();down=false;if(e.pointerType!=='mouse')pointer.visible=false;sound(0);updateUI()}
for(const target of [canvas,$('#hold-control')])for(const type of ['pointerup','pointercancel','lostpointercapture'])target.addEventListener(type,pointerEnd);
canvas.addEventListener('pointerleave',e=>{if(gate.active===null)pointer.visible=false});window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{releaseAll();if(deviceTilt.status==='active'){deviceTilt.model.zero=null;deviceTilt.model.x=deviceTilt.model.y=0;}});
function updateStats(){
 const s=sand.stats(),m=view.metrics();
 $('#gallery-caption').style.top=(view.heroFrame.y+view.heroFrame.height+16)+'px';
 Object.assign(canvas.dataset,{sprayBand:spray?.band??0,sprayShots:spray?.shots??0,sprayCoverage:spray?.coverage.toFixed(5)??'0',version:'39',holdMaterial:cascade?.material??settings.holdMaterial,holdExperiment:settings.holdExperiment,holdAim:holdAim.toFixed(1),holdPointX:holdPoint.x.toFixed(1),holdPointY:holdPoint.y.toFixed(1),holdPointPlacement:settings.holdPointPlacement,holdCharge:holdCharge.toFixed(3),cartridgeSlot:rack.active,cartridgeAmmo:rack.active>=0&&pour?Math.ceil(AMMO*Math.max(0,1-pour.emitted/pour.dose)):0,booting:Number(booting),lobby:Number(lobby),activeCoatAlpha:(view.coatUniforms.uActiveAlpha.value).toFixed(3),workAlpha:(view.workAlpha??1).toFixed(3),finishAction:cleanup?.action||'',posterShine:settings.posterShine,phaseTime:flow.elapsed.toFixed(2),spillDrawCount:view.spill.count,antialias:Number(m.antialias),depthNear:view.camera.near,session:sessionId,adheredLayers:cascade?.adheredLayers||0,pendingLayers:cascade?.pendingLayerCount||0,tableLanded:view.tableLanded||0,tableCleared:view.tableCleared||0,tableActive:view.tableActive||0,tableUploadBytes:view.tableUploadBytes||0,entryMode:settings.entryMode,recovery:settings.recovery,recovered:view.recovery?.deposited||0,reservoir:view.recovery?.stored||0,transferMass:view.recovery?.inTransit||0,recoveryJar:view.recovery?.jar||0,spillUploadBytes:view.spillUploadBytes||0,entryStage:view.entry?.stage||'',entryProgress:view.entry?.age.toFixed(3)||'0',entryFrameAlpha:(view.entryFrameAlpha??1).toFixed(3),finishing:Number(!!cascade?.finishing),unlockedCount:Math.min(levels.length,progression.frontier+1),galleryLocked:Number(!progression.canPlay(levels[rail.target].id)),cleanupElapsed:cleanup?.elapsed.toFixed(2)||'0',lastCleanupHeld,lastCleanupReleased,cleanupStage:cleanup?.stage||'',cleanupHeld:cleanup?.heldCount||0,cleanupReleased:cleanup?.releasedCount||0,extraFinish:Number(settings.extraFinish),residueBudget:cascade?.residue.budget||0,collector:settings.recovery==='table'?'desk':'funnel',transition:document.body.dataset.transition||'',galleryFocus:rail.focus.toFixed(3),gallerySelected:levels[rail.target]?.id||'',galleryPanels:view.galleryNeighbors.length,grainUploadBytes:view.grainUploadBytes||0,gameSpeed:settings.gameSpeed,gameTime:gameTime.toFixed(3),galleryPrevious:levels[levels.indexOf(level)-1]?.id||'',galleryNext:following.id,galleryCount:gallery.entries.length,heroProgress:view.heroProgress.toFixed(3),celebrationStars:view.celebration.visible?view.celebrationStars.length:0,holdDensity:settings.holdDensity,holdGrainSize:settings.holdGrainSize,holdRows:settings.holdRows,holdPlacement:settings.holdPlacement,activeBands:cascade?.bands.length||0,activeRows:cascade?.rows||0,particleCapacity:sand.capacity,retained:cascade?.retainedCount||0,peelSpeed:settings.gameSpeed,holding:Number(down||holdLatched),holdTime:cascade?.elapsed.toFixed(3)||'0',holdFront:cascade?.front.toFixed(1)||'0',controlMode:settings.controlMode,tiltStatus:deviceTilt.status,tiltX:tiltFrame.x.toFixed(3),tiltY:tiltFrame.y.toFixed(3),contactAdhesion:settings.controlMode==='tilt'&&tiltFrame.active&&!dialog.open&&flow.phase==='brush'?1:0,supply:settings.supply,heapDepth:settings.heapDepth,paperMotion:settings.paperMotion,paperX:paperPose.x.toFixed(3),paperY:paperPose.y.toFixed(3),paperCup:paperPose.cup.toFixed(3),supplySpots:pour?.spots.length||0,pourDuration:flow.pourDuration,level:level.id,feel:settings.feel,brushShape:settings.brushShape,brushRadius:brushRadius(settings).toFixed(1),mobility:settings.mobility,response:settings.response,jarShape:settings.jarShape,pourStyle:settings.pourStyle,surface:settings.surface,phase:flow.phase,layout:settings.layout,activePointer:gate.active??'',emitted:s.emitted,air:s.air,free:s.free,pressed:s.pressedFree,fresh:s.freshFree,moundHeight:s.maxMoundHeight.toFixed(2),bound:s.bound,lost:s.lost,coverage:s.coverage.toFixed(5),height:s.maxHeight.toFixed(2),stage:index,peelPart:activePart+1,peelParts:partLayers.length,peelProgress:peel.toFixed(3),collected:view.collectedCount,detached:view.spill.count,triangles:m.triangles,draws:m.draws,shakes:shakeRuns,advances:nextRuns,cameraZ:view.camera.position.z.toFixed(2),fps:Math.round(fps),flowSerial:flow.serial,shaking:flow.phase==='shake'?1:0});
 $('#stat-recovery-label').textContent=settings.recovery==='table'?'Masaya inen / sönen':'Toplanan / kavanoz';$('#hud-fps').textContent=Math.round(fps)+' FPS';$('#hud-detail').textContent=frameMs.toFixed(1)+' ms';
 for(const [id,value] of Object.entries({'stat-table-upload':((view.tableUploadBytes||0)/1024).toFixed(1),'stat-recovery':(settings.recovery==='table'?(view.tableLanded||0):(view.recovery?.deposited||0)).toLocaleString('tr')+' / '+(settings.recovery==='table'?(view.tableCleared||0):view.collectedCount).toLocaleString('tr'),'stat-fps':Math.round(fps),'stat-frame':frameMs.toFixed(1),'stat-sim':simMs.toFixed(1),'stat-render':renderMs.toFixed(1),'stat-particles':(s.air+s.free+view.spill.count+(view.tableActive||0)+(view.boxGroup.visible?view.collected.count:0)).toLocaleString('tr'),'stat-draws':m.draws,'stat-triangles':m.triangles.toLocaleString('tr'),'stat-transfer':((m.visible?view.grainUploadBytes||0:0)/1024).toFixed(0),'stat-memory':performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1):'—'}))$('#'+id).textContent=value;
 $('#buffer-size').textContent=`${m.width} × ${m.height} piksel · oyun sıfırlanmaz`;
}
function advanceGame(dt,reuseSurface=false){
 if(spray&&flow.phase==='spray'){
  if(!dialog.open&&!sprayUnlock.open)advanceSpray(dt);
  return;
 }
 if(autoKick>0&&!dialog.open){autoKick-=dt;if(autoKick<=0)beginRoll()}
 if(flow.phase==='pour'&&pour){
  pour.elapsed=flow.elapsed;const progress=Math.max(0,Math.min(1,(flow.elapsed-.5)/(pour.duration-1))),pose=pour.kind==='hold'?cascade.sourcePose(progress):supplyPose(pour,progress);Object.assign(pour,pose);view.posePour(pour);
  if(pour.kind==='hold'){const source=view.pourOrigin();Object.assign(canvas.dataset,{emitterX:source.x.toFixed(2),emitterY:source.y.toFixed(2),emitterZ:source.z.toFixed(2)});cascade.pour(progress,Math.max(12,source.z));pour.emitted=cascade.emitted;}else{
  const fraction=pourFraction(supplyQuota(pour,progress),settings.pourStyle),desired=Math.floor(pour.dose*fraction),n=desired-pour.emitted;
  if(n>0&&pose.flow){const source=view.pourOrigin();pour.emitted+=sand.emit(source.x,source.y,n,{spread:4,fan:pour.fan,height:Math.max(12,source.z)});Object.assign(canvas.dataset,{emitterX:source.x.toFixed(2),emitterY:source.y.toFixed(2),emitterZ:source.z.toFixed(2)});}
  }
 }
 const tiltPlaying=settings.controlMode==='tilt'&&tiltFrame.active&&!dialog.open&&flow.phase==='brush'&&!finished;
 holding=settings.controlMode==='hold'&&(down||holdLatched)&&!dialog.open&&flow.phase==='brush'&&!finished;
 const holdFlow=settings.controlMode==='hold'&&cascade&&['pour','brush'].includes(flow.phase);
 if(holdFlow)cascade.step(dt,holding,false,{
  aim:settings.holdExperiment==='aim'?holdAim:null,
  power:settings.holdExperiment==='pulse'?.22+1.38*holdCharge:1,
  point:holdPoint
 });
 paperPose=settings.controlMode==='hold'?(['pour','brush'].includes(flow.phase)?cascade?.pose:null)||{x:0,y:0,cup:0,pitch:0}:settings.controlMode==='tilt'?{x:tiltPlaying?tiltFrame.x*.25:0,y:tiltPlaying?tiltFrame.y*.25:0,cup:0}:paperMotion.step(dt,settings.paperMotion,brushMotion,down);
 if(settings.controlMode==='hold'&&settings.holdExperiment==='aim'&&holding&&cascade){
  paperPose.x=(holdAim-300)/300*cascade.press*.09;
 }
 if(holdFlow&&cascade.directional){
  paperPose.x=(holdPoint.x-W/2)/(W/2)*cascade.press*.16;
  paperPose.y=(holdPoint.y-H/2)/(H/2)*cascade.press*.15;
 }
 const drainage=flow.phase==='shake'?(cleanup?.pose||drainPose(flow.progress)):{bend:paperPose.cup,pitch:paperPose.pitch||0};if(!holdFlow||cascade.exits.length)view.setCardPose(paperPose,flow.phase,drainage);
 if(!finished&&!holdFlow)sand.step(dt,{shaking:flow.phase==='shake',bend:drainage.bend,tilt:drainage.pitch,tiltX:tiltPlaying?tiltFrame.x:paperPose.x,tiltY:tiltPlaying?tiltFrame.y:paperPose.y,cup:paperPose.cup,contactAdhesion:tiltPlaying,tiltLayers:tiltPlaying,reuseSurface,granular:settings.controlMode==='tilt'&&flow.phase!=='shake',pinned:flow.phase==='shake'?cleanup?.pinned:null});
 if(flow.phase==='shake'&&cleanup)cleanup.advance(dt,view.spills.length+(view.recovery?.pending||0));
 if(!finished&&(!holdFlow||cascade.exits.length))view.collectSpill(sand,true,holdFlow?cascade.exits:null);
 if(!holdFlow)view.updateCollector(flow.phase,dt);
 view.updateSpill(dt,false);
 const event=flow.tick(dt,{drainComplete:flow.phase!=='shake'||(cleanup?cleanup.done:!sand.hasLoose()&&view.spills.length===0&&!(view.recovery?.pending))});
 if(event==='rolled'){releaseAll();revealUntil(partLayers.length);peeled=true;peel=1;repaintPaper();view.peelProgress(1);prepareDose();updateUI()}
 if(event==='poured'){rack.finish();pour=null;view.posePour(null);updateUI()}
 if(event==='shaken'||event==='advance'){
  view.collectSpill(sand);sand.removeLoose();sand.compact();view.currentInitialized=0;lastCleanupHeld=cleanup?.heldCount||0;lastCleanupReleased=cleanup?.releasedCount||0;cleanup=null;
  if(event==='advance')nextStage();else if(refillAfterShake){refillAfterShake=false;addSand();}else updateUI();
 }
 if(flow.phase==='brush'&&!dialog.open&&!finished&&ready()){
  if(settings.controlMode==='hold'){
   cascade?.requestFinish();
   if(!cascade?.pendingLayerCount)startShake(true);
   return;
  }
  if(settings.controlMode==='tilt'){startShake(true);return;}
  if(settings.autoAdvance&&gate.active===null){
   readySince+=dt;
   if(readySince>.55)startShake(true);
   return;
  }
 }
 readySince=0;
}
function frame(t){
 requestAnimationFrame(frame);if(document.hidden)return;
 const delta=t-lastRender;if(!pacer.shouldRender(t))return;
 const dt=Math.min(lastRender?delta/1000:1/60,.06);if(!lastRender)fpsClock=t;lastRender=t;frames++;
 if(t-fpsClock>=700){fps=frames*1000/(t-fpsClock);fpsClock=t;frames=0;}
 frameMs=frameMs*.9+(dt*1000)*.1;const simStart=performance.now();moved=0;
 let dx=0,dy=0;for(const stroke of strokes){dx+=stroke.to.x-stroke.from.x;dy+=stroke.to.y-stroke.from.y;moved+=sand.brush(stroke.from,stroke.to,brushRadius(settings),stroke.seconds);}strokes.length=0;
 const speed=Math.hypot(dx,dy)/Math.max(dt,.001),decay=Math.exp(-dt*18);brushMotion={dx:dx||brushMotion.dx,dy:dy||brushMotion.dy,speed:brushMotion.speed*decay+Math.min(1200,speed)*(1-decay),load:brushMotion.load*decay+Math.min(1,moved/350)*(1-decay)};
 tiltFrame=deviceTilt.tick(Math.min(dt,.04),settings.tiltSensitivity);
 tiltGrip*=Math.exp(-dt*14);
 if(settings.controlMode==='hold'&&settings.holdExperiment==='pulse'&&flow.phase==='brush'&&!exhibition&&!transitioning&&!dialog.open){
  holdCharge=rhythmCharge(holdCharge,down||holdLatched,dt);
  $('#hold-pulse i').style.transform='scaleX('+holdCharge+')';
  $('#hold-pulse').setAttribute('aria-valuenow',String(Math.round(holdCharge*100)));
 }

 const steps=gameSteps(dt,settings.gameSpeed,settings.controlMode==='brush'?Infinity:3);if(!exhibition&&!transitioning&&!finished)gameTime+=steps.total;else exhibitTime+=dt;
 if(!exhibition&&!transitioning&&!finished){for(let i=0;i<steps.count;i++)advanceGame(steps.dt,i>0);
 if(settings.controlMode==='hold'&&cascade&&['pour','brush'].includes(flow.phase))cascade.refresh(t);}
 rail.step(dt);view.galleryFocus=rail.focus;
 if(flow.phase==='rolling'&&!exhibition&&!transitioning)animatePeel();
 // Commit new coverage before bound grains leave the moving mesh, avoiding a blank frame.
 updateCoat();simMs=simMs*.85+(performance.now()-simStart)*.15;
 sound(exhibition||transitioning?0:flow.phase==='pour'?.14:flow.phase==='shake'?.15:flow.phase==='rolling'?.06:holding?.035:tiltGrip|| (moved?Math.min(.16,.015+moved*.00003):0));
 const drawStart=performance.now();view.render(sand,{time:(gameTime+exhibitTime)*1000,dt:steps.total,realDt:dt,phase:flow.phase,down,pointer,brushMotion,paperPose,showBrush:settings.controlMode==='brush',paperHeld:!!paperMotion.grip||(settings.controlMode==='hold'&&(cascade?.press||0)>.02),peeled,pour,shakeProgress:flow.phase==='shake'?flow.progress:0,cleanupPose:flow.phase==='shake'?cleanup?.pose:null,finished,holdFlow:settings.controlMode==='hold'&&['pour','brush'].includes(flow.phase)?cascade:null,holdPoint:holding&&cascade?.directional?holdPoint:null,spray});renderMs=renderMs*.85+(performance.now()-drawStart)*.15;
 if((statClock+=dt)>.2){statClock=0;updateUI();updateStats();}
}
function loadingStatus(message,percent){$('#loading-message').textContent=message;$('#loading-progress').style.width=percent+'%';$('#loading-screen').setAttribute('aria-valuenow',String(percent));}
applySettings(settings);
try{
 loadingStatus('Renkler hazırlanıyor',12);installBundle(await loader.load(level));
 index=settings.controlMode==='spray'?0:resumeRequested?resumeIndex(location.search,stages.length):bootChoice.index;
 const bootFinished=!resumeRequested&&bootChoice.finished;if(bootFinished)index=stages.length-1;
 loadingStatus('Tablon hazırlanıyor',40);
 for(let i=0;i<(bootFinished?stages.length:index);i++){
  makeGlitter(stages[i].color);cc.clearRect(0,0,W,H);cc.drawImage(glitter,0,0);cc.globalCompositeOperation='destination-in';cc.drawImage(assets[stages[i].id],0,0);cc.globalCompositeOperation='source-over';bakedContext.drawImage(coat,0,0);
 }
 cc.clearRect(0,0,W,H);repaintPaper();view=new AtelierScene(canvas,displayPaper,stages.map(s=>s.color),settings);activate();
 loadingStatus('Sergin açılıyor',75);await Promise.all([galleryPictures(),view.warmReady]);
 finished=bootFinished;if(finished){if(spray){spray=null;view.setSpray(null);}flow.phase='complete';autoKick=0;completedPoster=posterBlob(paperCanvas).catch(()=>null);document.body.dataset.complete='true';}
 lobby=true;showExhibition({silent:true});selectArtwork(levels.findIndex(l=>l.id===bootChoice.focus));view.galleryFocus=rail.focus=rail.target;view.finishClock=1.65;view.setLobbyImage(galleryArt[levels.indexOf(level)].image);if(!spray)session.checkpoint(level.id,index,finished);session.focus(levels[rail.target].id);
 requestAnimationFrame(frame);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 loadingStatus('Hazır',100);booting=false;canvas.dataset.booting='0';document.body.removeAttribute('data-loading');$('#app').inert=false;$('#app').setAttribute('aria-busy','false');$('#loading-screen').classList.add('leaving');setTimeout(()=>{$('#loading-screen').hidden=true},450);
}catch(error){loadingStatus('Atölye açılamadı. Yeniden deneyebilirsin.',0);$('#loading-retry').hidden=false;console.error(error);}
$('#loading-retry').onclick=()=>location.reload();
