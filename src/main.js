import {Sand,W,H} from './sand.js';
import {AtelierScene} from './scene.js';
import {Flow,PointerGate,FramePacer,drainPose,appendStroke} from './interaction.js';
import {loadSettings,saveSettings,profileSettings,doseFor} from './settings.js';
import {supplyPlan,supplyPose,supplyQuota} from './supply.js';
import {HoldCascade} from './hold-cascade.js';
import {DeviceTilt} from './tilt.js';
import {PaperMotion} from './paper-motion.js';
import {completionStatus,resumeIndex} from './progress.js';
const $=s=>document.querySelector(s),canvas=$('#art'),dialog=$('#settings');
import {levels,selectLevel} from './levels.js';
import {FEELS,feelSettings,brushRadius,pourFraction} from './feel.js';
const level=selectLevel(location.search),stages=level.stages;
import {drawGlitter} from './coating.js';
import {piecesByStage} from './peel-pieces.js';
import {peelAt,peelDuration,revealPolygon} from './peel.js';
import {posterBlob,downloadPoster} from './completion.js';
import {installButtonMotion} from './ui-motion.js';
installButtonMotion();
let settings;try{settings=loadSettings(localStorage)}catch{settings=loadSettings({getItem:()=>null})}
if(new URLSearchParams(location.search).get('mod')==='egim')settings={...settings,controlMode:'tilt'};
if(new URLSearchParams(location.search).get('mod')==='basili')settings={...settings,controlMode:'hold'};
let cascade=null,holdLatched=false,holdSupplyPending=false;
let tiltAutoStart=false,tiltFrame={x:0,y:0,active:false};
const deviceTilt=new DeviceTilt({onChange:()=>{updateTiltUI();if(deviceTilt.status==='active'&&tiltAutoStart&&!dialog.open&&view&&flow.phase==='peel'){tiltAutoStart=false;beginRoll();}}});
const paperMotion=new PaperMotion();
let paperPose={x:0,y:0,cup:0};
const flow=new Flow(),gate=new PointerGate(),pacer=new FramePacer(settings.frameLimit),assets={},masks={},strokes=[];
let refillAfterShake=false;
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
const paperBase=document.createElement('canvas');paperBase.width=W;paperBase.height=H;const bc=paperBase.getContext('2d');bc.fillStyle='#f5e7a5';bc.fillRect(0,0,W,H);
for(let i=0;i<45000;i++){bc.fillStyle=Math.random()>.5?'#fff9d118':'#ad945212';bc.fillRect(Math.random()*W,Math.random()*H,1,1)}
const baked=document.createElement('canvas');baked.width=W;baked.height=H;const bakedContext=baked.getContext('2d');
const coat=document.createElement('canvas');coat.width=W;coat.height=H;const cc=coat.getContext('2d');
const paintMask=document.createElement('canvas');paintMask.width=W;paintMask.height=H;const mc=paintMask.getContext('2d');
const glitter=document.createElement('canvas');glitter.width=W;glitter.height=H;const tc=glitter.getContext('2d');
let lastCoated=-1;
function makeGlitter(color){drawGlitter(tc,color,W,H,settings.controlMode==='hold'?settings.holdGrainSize:1)}
function updateCoat(force=false,finish=false){
 if(!sand||(!force&&lastCoated===sand.coveredWeight))return;
 lastCoated=sand.coveredWeight;cc.clearRect(0,0,W,H);cc.fillStyle='#fff';
 // Seal only the tiny raster seams of an already completed coat when baking it.
 if(finish&&ready())cc.fillRect(0,0,W,H);
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
 if(soundOn&&flow.phase==='pour'&&flow.elapsed>=.48&&flow.elapsed<flow.pourDuration-.35&&playedPour!==flow.serial&&audioBuffers.pour){
  playedPour=flow.serial;pourSource?.stop();pourSource=audioCtx.createBufferSource();pourSource.buffer=audioBuffers.pour;pourSource.loop=true;pourSource.connect(audioCtx.destination);pourSource.start();
 }
 if((!soundOn||flow.phase!=='pour')&&pourSource){try{pourSource.stop()}catch{}pourSource=null;}
}
$('#sound').textContent='Ses: açık';$('#sound').setAttribute('aria-label','Sesi kapat');
$('#sound').onclick=async()=>{soundOn=!soundOn;await audio();sound(0);$('#sound').textContent=soundOn?'Ses: açık':'Ses: kapalı';$('#sound').setAttribute('aria-label',soundOn?'Sesi kapat':'Sesi aç')};
function releaseAll(){holdLatched=false;paperMotion.end();down=false;gate.cancel();strokes.length=0;sound(0)}
function settingsTab(name){
 document.querySelectorAll('[data-settings-tab]').forEach(e=>e.hidden=e.dataset.settingsTab!==name);
 document.querySelectorAll('[data-tab]').forEach(e=>e.setAttribute('aria-selected',String(e.dataset.tab===name)));
 document.querySelector('.settings-body').scrollTop=0;
}
document.querySelectorAll('[data-tab]').forEach(e=>e.onclick=()=>settingsTab(e.dataset.tab));
function closeSettings(){dialog.close();pointer.visible=false;readySince=0;
 if(holdSupplyPending&&settings.controlMode==='hold'&&['brush','pour'].includes(flow.phase)){holdSupplyPending=false;flow.phase='brush';if(sand.hasLoose()){refillAfterShake=true;startShake(false);}else addSand();}
}
$('#settings-open').onclick=()=>{releaseAll();pointer.visible=false;syncSettings();dialog.showModal()};
$('#settings-close').onclick=closeSettings;$('#settings-done').onclick=closeSettings;dialog.addEventListener('cancel',()=>{releaseAll();readySince=0});
function applySettings(next){
 const previousSurface=settings?.surface,previousControl=settings?.controlMode,previousHoldSize=settings?.holdGrainSize;settings=next;document.body.dataset.control=settings.controlMode;document.body.dataset.layout=settings.controlMode==='hold'?'flow':settings.layout;$('#perf-hud').hidden=!settings.showStats;
 try{saveSettings(localStorage,settings)}catch{}
 if(previousControl!==settings.controlMode){releaseAll();paperMotion.reset();if(previousControl==='hold'&&pour?.kind==='hold'){pour=null;view?.posePour(null);flow.phase='brush';}cascade=null;holdSupplyPending=settings.controlMode==='hold';if(settings.controlMode!=='tilt'){deviceTilt.stop();tiltAutoStart=false;}}
 if(partLayers.length&&(previousControl!==settings.controlMode||settings.controlMode==='hold'&&previousHoldSize!==settings.holdGrainSize)){makeGlitter(stages[index].color);updateCoat(true);}
 sand?.setBehavior(settings);if(cascade)cascade.depth=settings.heapDepth;view?.applySettings(settings);
 if(partLayers.length&&previousSurface!==settings.surface){for(const layer of partLayers)paintGlue(layer);gc.clearRect(0,0,W,H);const count=revealedParts;revealedParts=0;revealUntil(count);repaintPaper();}pacer.setLimit(settings.frameLimit);if(!settings.autoAdvance)autoKick=0;syncSettings();readySince=0;updateUI();updateTiltUI();
}
function syncSettings(){
 document.querySelectorAll('input[name="layout"]').forEach(e=>e.checked=e.value===settings.layout);
 for(const [id,key] of Object.entries({'auto-advance':'autoAdvance','show-stats':'showStats',sparkles:'sparkles',reflections:'reflections',relief:'relief','moving-light':'movingLight'}))$('#'+id).checked=settings[key];
 for(const [id,key] of Object.entries({'quality-profile':'profile','render-scale':'renderScale','shadow-quality':'shadow','frame-limit':'frameLimit','pour-amount':'pourAmount',pace:'pace','brush-shape':'brushShape','jar-shape':'jarShape','pour-style':'pourStyle','supply-style':'supply','paper-motion':'paperMotion','control-mode':'controlMode','tilt-sensitivity':'tiltSensitivity','heap-depth':'heapDepth','surface-style':'surface','hold-density':'holdDensity','hold-grain-size':'holdGrainSize','hold-rows':'holdRows','brush-width':'brushWidth','grain-size':'grainSize',mobility:'mobility',response:'response'}))$('#'+id).value=settings[key];
 document.querySelectorAll('input[name=feel]').forEach(e=>e.checked=e.value===settings.feel);
 for(const [id,key] of [['mobility','mobility'],['response','response'],['brush-width','brushWidth'],['grain-size','grainSize'],['heap-depth','heapDepth'],['tilt-sensitivity','tiltSensitivity'],['hold-density','holdDensity'],['hold-grain-size','holdGrainSize']])$('#'+id+'-readout').textContent='%'+Math.round(settings[key]*100);
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
for(const [id,key,numeric] of [['brush-shape','brushShape',false],['jar-shape','jarShape',false],['pour-style','pourStyle',false],['surface-style','surface',false],['supply-style','supply',false],['paper-motion','paperMotion',false],['heap-depth','heapDepth',true],['control-mode','controlMode',false],['tilt-sensitivity','tiltSensitivity',true],['brush-width','brushWidth',true],['grain-size','grainSize',true],['mobility','mobility',true],['response','response',true],['hold-density','holdDensity',true],['hold-grain-size','holdGrainSize',true],['hold-rows','holdRows',true]]){
 $('#'+id).addEventListener(numeric&&id!=='hold-rows'?'input':'change',e=>applySettings({...settings,[key]:numeric?Number(e.target.value):e.target.value,feel:['jarShape','pourStyle','surface','supply','paperMotion','heapDepth','controlMode','tiltSensitivity','holdDensity','holdGrainSize','holdRows'].includes(key)?settings.feel:'custom'}));
}
const tiltMessages={off:'Telefonu rahat tut, sonra hareketi aç.',requesting:'Hareket izni bekleniyor…',waiting:'Sensör bekleniyor; telefonu hafifçe eğ.',active:'Hareket açık · bu konumu düz sayabilirsin.',demo:'Ekran eğimi açık · sensör kullanılmıyor.',denied:'Hareket izni verilmedi. Yeniden dene veya tarayıcı izinlerini kontrol et.',unsupported:'Bu cihazda hareket sensörü yok. Ekrandaki eğimle deneyebilirsin.',insecure:'Hareket sensörü için oyunu HTTPS bağlantısından aç.',empty:'Hareket verisi gelmedi. Telefonda Safari veya Chrome ile açabilir ya da ekranda deneyebilirsin.',stale:'Hareket verisi durdu; akış güvenli biçimde duraklatıldı.'};
function updateTiltUI(){
 const enabled=settings.controlMode==='tilt',hold=settings.controlMode==='hold',live=['active','demo'].includes(deviceTilt.status);
 for(const id of ['response','brush-shape','brush-width','paper-motion'])$('#'+id).closest('label').hidden=enabled||hold;
 $('#feel-name').textContent=hold?'Basılı akış':FEELS[settings.feel]?.name||'Özel karışım';$('#hold-detail').hidden=!hold;$('#hold-detail').textContent=`Sim üst kenara ${settings.holdRows===2?'iki yatay sıra':'bir yatay sıra'} halinde dökülür. Ekrana basılı tut: kâğıt bükülsün, sim aşağı aksın. Bırakınca durur. Biraz sim kâğıtta kalır; son bükmede kutuya dökülür. Renkler otomatik ilerler.`;$('#hold-options').hidden=!hold;for(const id of ['pour-amount','grain-size'])$('#'+id).closest('label').hidden=hold;for(const id of ['supply-style','mobility','pour-style'])$('#'+id).closest('label').hidden=hold;document.querySelector('.feel-options').hidden=hold;
 $('#pour-hint').textContent=hold?'Sonraki yatay şeritteki fazla sim miktarını değiştirir.':enabled?'Sim hedefin biraz üstüne dökülür. Telefonu eğerek yapışkana taşı.':'Sim hedefin biraz üstüne dökülür. Fırçayla taşıman gerekir.';
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
function openLevel(id){const url=new URL(location.href);url.search='';url.searchParams.set('v','17');if(settings.controlMode==='hold')url.searchParams.set('mod','basili');if(settings.controlMode==='tilt')url.searchParams.set('mod','egim');url.searchParams.set('bolum',id);location.assign(url)}
for(const entry of levels){
 const button=document.createElement('button');button.className='level-card'+(entry.id===level.id?' current':'');button.innerHTML=`<img src="assets/${entry.preview}.png" alt=""><span><strong>${entry.name}</strong><small>${entry.subtitle}</small></span><b>${entry.id===level.id?'Oynuyorsun':'Başla →'}</b>`;button.onclick=()=>{if(entry.id!==level.id)openLevel(entry.id)};$('#levels').append(button);
}
const following=levels[(levels.indexOf(level)+1)%levels.length];$('#next-level-name').textContent=following.name;$('#complete-level').textContent=level.name+' · TAMAMLANDI';$('#next-level').onclick=()=>openLevel(following.id);
$('#level-name').textContent=level.name;
function ready(){return sand&&completionStatus(sand.coverage,settings.pace,sand.targetCount*25).ready}
function updateUI(){
 if(!sand)return;
 canvas.setAttribute('aria-label',settings.controlMode==='hold'?'Basılı tutarak kâğıdı bük ve simleri yukarıdan aşağıya akıt':settings.controlMode==='tilt'?'Telefonu eğerek simleri yapışkan alana taşı':'Sıradaki kâğıdı açmak için dokun, ardından simi fırçayla yay');
 const phase=flow.phase,percent=completionStatus(sand.coverage,settings.pace,sand.targetCount*25).percent;
 $('#stage-label').textContent=`${String(index+1).padStart(2,'0')} / ${stages.length}`;$('#stage-label').title=stages[index].name;$('#color-dot').style.background=stages[index].color;
 $('#coverage').textContent=percent+'%';$('#progress-fill').style.width=percent+'%';
 const messages={peel:['↗','Bir kez dokun.','Sıradaki kâğıt rulolanarak açılsın.','SOY'],rolling:['↗','Kâğıt açılıyor…','Açılan taralı alan simi tutacak.','SOY'],pour:['⠿','Bir yığın parıltı.','Kap boşalsın; sonra simi parmağınla yay.','DÖK'],brush:['▰','Yığından başla, kenarlara yay.','Sim yetmezse + Sim ile bir yığın daha ekle.','YAY'],shake:['∪','İki yandan bük, ortaya topla.','Fazla sim ortadaki oluktan kutuya akıyor.','BOŞALT'],complete:['✧','Ellerine sağlık.','Biraz sabır, binlerce küçük parıltı.','BİTTİ']};
 if(phase==='rolling')messages.rolling=['↗',`Parça ${activePart+1} / ${partLayers.length} · ${(down||holdLatched)?'hızlı':'yavaşça'} soyuluyor`,(down||holdLatched)?'Hızlı soyuluyor · bırakınca yavaşlar.':'Basılı tutarak daha hızlı soyabilirsin.','SOY'];
 if(settings.controlMode==='tilt'){messages.brush=['◉','Telefonu eğ, simi akıt.','Yapışkana değen taneler kendiliğinden tutunur.','EĞ'];messages.pour=['⠿','Sim dökülüyor.','Birazdan telefonu eğerek simleri taşı.','DÖK'];}
 if(settings.controlMode==='brush'&&phase==='brush'&&settings.paperMotion==='hands')messages.brush[2]='Simleri yay; kâğıdı eğmek için yan kenarını tut.';
 if(settings.controlMode==='hold'){messages.peel=['↗','Bir kez dokun.','Kâğıt açılsın, üst kenara sim şeridi dökülsün.','HAZIRLA'];messages.pour=['⠿',settings.holdRows===2?'Üst kenara iki sıra sim.':'Üst kenara bir şerit sim.','Şerit hazırlanınca ekrana basılı tut.','DÖK'];messages.brush=['∪',(down||holdLatched)?'Bükülüyor, simler akıyor.':'Basılı tut, simi akıt.','Bırakınca durur. Yapışkana ulaşan simler tutunur.','BASILI TUT'];}
 const m=messages[phase]||messages.brush;$('#phase-icon').textContent=m[0];$('#instruction-title').textContent=m[1];$('#instruction-text').textContent=phase==='brush'&&settings.layout!=='flow'&&settings.controlMode==='brush'?'Sim ekle ile açık alanın üstüne yeni bir yığın dökebilirsin.':m[2];$('#phase-label').textContent=m[3];
 const canNext=phase==='brush'&&ready()&&!finished;
 $('#next').hidden=!canNext||settings.controlMode==='hold';$('#next').disabled=!canNext;$('#next').innerHTML=index===stages.length-1?'Eserini tamamla <span>✧</span>':'Sonraki renk <span>→</span>';
 $('#auto-status').hidden=true;
 if(paperMotion.grip){$('#instruction-title').textContent='Kâğıdı hafifçe yönlendir.';$('#instruction-text').textContent='Taneler eğime doğru akıyor; bırakınca masa düzleşir.';}
 if(canNext){$('#instruction-title').textContent='Renk tamamlandı.';$('#instruction-text').textContent=settings.controlMode==='hold'?'Bırak; kâğıdı büküp kalan simleri dökelim.':settings.autoAdvance?'Parmağını kaldır; sıradaki renge geçelim.':'Sonraki renk ile devam et.';}
 updateTiltUI();
 $('#hold-control').hidden=finished||!(phase==='rolling'||settings.controlMode==='hold'&&phase==='brush');$('#hold-control').setAttribute('aria-label',phase==='rolling'?'Kâğıdı daha hızlı soymak için basılı tut':'Basılı tut, kâğıdı bük ve simi akıt');$('#hold-control').setAttribute('aria-pressed',String(down||holdLatched));$('#hold-control b').textContent=phase==='rolling'?((down||holdLatched)?'Hızlı soyuluyor':'Basılı tut · hızlı soy'):canNext?'Bırak · simleri dök':(down||holdLatched)?'Akıyor · bırakınca durur':'Basılı tut · akıt';
 $('#quick-actions').hidden=settings.controlMode==='hold'||phase!=='brush'||finished||canNext;
 for(const button of document.querySelectorAll('[data-tool]')){
  const t=button.dataset.tool;if(t==='brush'){button.querySelector('b').textContent=settings.controlMode==='tilt'?'Telefonu eğ':'Fırça';button.querySelector('span').textContent=settings.controlMode==='tilt'?'◉':'▰';button.setAttribute('aria-label',settings.controlMode==='tilt'?'Telefon eğimini etkinleştir':'Fırçayı seç');}const selected=t===(phase==='shake'?'clean':phase==='rolling'?'peel':phase);
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
 cascade=null;holdLatched=false;holdSupplyPending=false;paperMotion.reset();sand=new Sand();sand.setBehavior(settings);sand.setMask(masks[stages[index].id]);flow.reset();peeled=false;peel=0;pour=null;readySince=0;strokes.length=0;activePart=0;revealedParts=0;
 gc.globalCompositeOperation='source-over';gc.clearRect(0,0,W,H);partLayers=makePartLayers();flow.setRollDuration(peelDuration(partLayers.map(p=>p.piece)));
 makeGlitter(stages[index].color);lastCoated=-1;cc.clearRect(0,0,W,H);view.setStage(index);updateCoat(true);repaintPaper();view.setPeelPiece(partLayers[0].paper,partLayers[0].piece);updateUI();
}
function beginRoll(){if(soundOn)audio();if(finished||!flow.roll())return;down=false;strokes.length=0;peel=0;updateUI()}
function prepareDose(){
 if(settings.controlMode==='hold'){
  holdSupplyPending=false;cascade=new HoldCascade(sand,settings);flow.setPourDuration(cascade.duration);playedPour=-1;pour={...cascade.sourcePose(0),kind:'hold',spots:[{x:0,y:22},{x:600,y:22}],duration:cascade.duration,dose:cascade.routes.length,emitted:0,elapsed:0};return;
 }
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
   const score=nearby-Math.abs(y-referenceY)*.05;if(score>best){best=score;anchor={x,y};}
  }
 }
 const plan=supplyPlan(anchor,sand.mask,sand.bound,sand.targetCount,{...settings,pieces:partLayers.map(l=>l.piece),refill:sand.coverage>.15});flow.setPourDuration(plan.duration);playedPour=-1;pour={...plan,...plan.spots[0],fan:plan.small?30:settings.pourStyle==='ribbon'?32:plan.kind==='curtain'?40:52,dose,emitted:0,elapsed:0};
}
$('#hold-repour').onclick=()=>{
 if(settings.controlMode!=='hold'||finished)return;releaseAll();view.reset();activate();flow.phase='pour';peeled=true;peel=1;revealUntil(partLayers.length);view.peelProgress(1);prepareDose();repaintPaper();closeSettings();updateUI();
};
function addSand(){if(finished||flow.busy)return;sand.compact();view.currentInitialized=0;if(sand.capacity-sand.count<200&&sand.hasLoose()){refillAfterShake=true;startShake(false);return;}if(!flow.pour())return;releaseAll();prepareDose();readySince=0;updateUI()}
function startShake(advance=false){if(finished||!flow.shake(advance))return;shakeRuns++;releaseAll();view.beginCleanup();if(advance)updateCoat(true,true);pour=null;view.posePour(null);readySince=0;updateUI()}
function nextStage(){
 refillAfterShake=false;nextRuns++;updateCoat(true,true);bakedContext.drawImage(coat,0,0);view.updateGrains(sand);
 if(index<stages.length-1){index++;activate();autoKick=(settings.autoAdvance||settings.controlMode==='hold')?.22:0;}
 else{finished=true;flow.phase='complete';pointer.visible=false;view.current.visible=false;view.heap.visible=false;$('#complete').hidden=false;document.body.dataset.complete='true';deviceTilt.stop();completedPoster=posterBlob(paperCanvas).catch(()=>null);releaseAll();$('#complete-title').focus({preventScroll:true});updateUI();}
}
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{const t=button.dataset.tool;if(t==='peel')beginRoll();else if(t==='pour')addSand();else if(t==='clean')startShake(false);else if(t==='brush'&&settings.controlMode==='tilt'&&!tiltFrame.active)enableTilt();else updateUI()};
$('#add-sand').onclick=addSand;$('#shake').onclick=()=>startShake(false);$('#next').onclick=()=>{if(ready())startShake(true)};
function reset(){if(!view)return;releaseAll();refillAfterShake=false;finished=false;index=0;autoKick=0;bakedContext.clearRect(0,0,W,H);cc.clearRect(0,0,W,H);view.reset();$('#complete').hidden=true;delete document.body.dataset.complete;completedPoster=null;sharing=false;$('#share').disabled=false;$('#save').disabled=false;$('#share-status').textContent='';activate()}
$('#reset').onclick=()=>{reset();closeSettings()};$('#again').onclick=reset;
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
 e.preventDefault();if(!view||finished||(flow.busy&&flow.phase!=='rolling')||!gate.begin(e.pointerId,e.isPrimary!==false))return;
 e.currentTarget.setPointerCapture(e.pointerId);pointer={...view.mapPointer(e),visible:true};previous={...pointer};pointerTime=e.timeStamp;
 if(soundOn)audio();
 if(flow.phase==='peel'){beginRoll();down=flow.phase==='rolling';pointer.visible=false;updateUI();return;}
 if(flow.phase==='rolling'){down=true;pointer.visible=false;updateUI();return;}
 if(settings.controlMode==='hold'&&flow.phase==='brush'){down=true;pointer.visible=false;updateUI();return;}
 if(settings.controlMode==='tilt'&&flow.phase==='brush'){pointer.visible=false;return;}
 if(settings.paperMotion==='hands'&&flow.phase==='brush'&&(pointer.x<24||pointer.x>576)){paperMotion.begin(pointer);updateUI();return;}
 down=true;
}
canvas.addEventListener('pointerdown',beginPointer);$('#hold-control').addEventListener('pointerdown',beginPointer);
$('#hold-control').onclick=e=>{if(e.detail!==0||!(flow.phase==='rolling'||settings.controlMode==='hold'&&flow.phase==='brush'))return;holdLatched=!holdLatched;if(soundOn)audio();updateUI();};
canvas.addEventListener('pointermove',e=>{
 if(!view||finished||e.isPrimary===false)return;
 if(gate.active===null&&e.pointerType==='mouse'&&!e.buttons){pointer={...view.mapPointer(e),visible:true};return;}
 if(!gate.owns(e.pointerId)||flow.phase!=='brush'||settings.controlMode!=='brush')return;
 if(paperMotion.grip){pointer={...view.mapPointer(e),visible:true};paperMotion.move(pointer);return;}
 if(!down)return;
 const p=view.mapPointer(e);pointer={...p,visible:true};
 if(Math.hypot(p.x-previous.x,p.y-previous.y)>.1){appendStroke(strokes,{from:{...previous},to:{...p},seconds:Math.max(.001,Math.min(.1,(e.timeStamp-pointerTime)/1000))})}previous=p;pointerTime=e.timeStamp;
});
function pointerEnd(e){if(!gate.end(e.pointerId))return;paperMotion.end();down=false;if(e.pointerType!=='mouse')pointer.visible=false;sound(0);updateUI()}
for(const target of [canvas,$('#hold-control')])for(const type of ['pointerup','pointercancel','lostpointercapture'])target.addEventListener(type,pointerEnd);
canvas.addEventListener('pointerleave',e=>{if(gate.active===null)pointer.visible=false});window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{releaseAll();if(deviceTilt.status==='active'){deviceTilt.model.zero=null;deviceTilt.model.x=deviceTilt.model.y=0;}});
function updateStats(){
 const s=sand.stats(),m=view.metrics();
 Object.assign(canvas.dataset,{version:'17',heroProgress:view.heroProgress.toFixed(3),celebrationStars:view.celebration.visible?view.celebrationStars.length:0,holdDensity:settings.holdDensity,holdGrainSize:settings.holdGrainSize,holdRows:settings.holdRows,activeRows:cascade?.rows||0,particleCapacity:sand.capacity,retained:cascade?.retainedCount||0,peelSpeed:flow.phase==='rolling'&&(down||holdLatched)&&!dialog.open?'4':'1',holding:Number(down||holdLatched),holdTime:cascade?.elapsed.toFixed(3)||'0',holdFront:cascade?.front.toFixed(1)||'0',controlMode:settings.controlMode,tiltStatus:deviceTilt.status,tiltX:tiltFrame.x.toFixed(3),tiltY:tiltFrame.y.toFixed(3),contactAdhesion:settings.controlMode==='tilt'&&tiltFrame.active&&!dialog.open&&flow.phase==='brush'?1:0,supply:settings.supply,heapDepth:settings.heapDepth,paperMotion:settings.paperMotion,paperX:paperPose.x.toFixed(3),paperY:paperPose.y.toFixed(3),paperCup:paperPose.cup.toFixed(3),supplySpots:pour?.spots.length||0,pourDuration:flow.pourDuration,level:level.id,feel:settings.feel,brushShape:settings.brushShape,brushRadius:brushRadius(settings).toFixed(1),mobility:settings.mobility,response:settings.response,jarShape:settings.jarShape,pourStyle:settings.pourStyle,surface:settings.surface,phase:flow.phase,layout:settings.layout,activePointer:gate.active??'',emitted:s.emitted,air:s.air,free:s.free,pressed:s.pressedFree,fresh:s.freshFree,moundHeight:s.maxMoundHeight.toFixed(2),bound:s.bound,lost:s.lost,coverage:s.coverage.toFixed(5),height:s.maxHeight.toFixed(2),stage:index,peelPart:activePart+1,peelParts:partLayers.length,peelProgress:peel.toFixed(3),collected:view.collectedCount,detached:view.spill.count,triangles:m.triangles,draws:m.draws,shakes:shakeRuns,advances:nextRuns,cameraZ:view.camera.position.z.toFixed(2),fps:Math.round(fps),flowSerial:flow.serial,shaking:flow.phase==='shake'?1:0});
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
  pour.elapsed=flow.elapsed;const progress=Math.max(0,Math.min(1,(flow.elapsed-.5)/(pour.duration-1))),pose=pour.kind==='hold'?cascade.sourcePose(progress):supplyPose(pour,progress);Object.assign(pour,pose);view.posePour(pour);
  if(pour.kind==='hold'){const source=view.pourOrigin();cascade.pour(progress,Math.max(12,source.z));pour.emitted=cascade.emitted;}else{
  const fraction=pourFraction(supplyQuota(pour,progress),settings.pourStyle),desired=Math.floor(pour.dose*fraction),n=desired-pour.emitted;
  if(n>0&&pose.flow){const source=view.pourOrigin();pour.emitted+=sand.emit(source.x,source.y,n,{spread:4,fan:pour.fan,height:Math.max(12,source.z)});Object.assign(canvas.dataset,{emitterX:source.x.toFixed(2),emitterY:source.y.toFixed(2),emitterZ:source.z.toFixed(2)});}
  }
 }
 let dx=0,dy=0;for(const stroke of strokes){dx+=stroke.to.x-stroke.from.x;dy+=stroke.to.y-stroke.from.y;moved+=sand.brush(stroke.from,stroke.to,brushRadius(settings),stroke.seconds);}strokes.length=0;
 const speed=Math.hypot(dx,dy)/Math.max(dt,.001),decay=Math.exp(-dt*18);brushMotion={dx:dx||brushMotion.dx,dy:dy||brushMotion.dy,speed:brushMotion.speed*decay+Math.min(1200,speed)*(1-decay),load:brushMotion.load*decay+Math.min(1,moved/350)*(1-decay)};
 tiltFrame=deviceTilt.tick(Math.min(dt,.04),settings.tiltSensitivity);
 const tiltPlaying=settings.controlMode==='tilt'&&tiltFrame.active&&!dialog.open&&flow.phase==='brush'&&!finished;
 const holding=settings.controlMode==='hold'&&(down||holdLatched)&&!dialog.open&&flow.phase==='brush'&&!finished;
 if(settings.controlMode==='hold'&&cascade&&['pour','brush'].includes(flow.phase))cascade.step(Math.min(dt,.04),holding);
 paperPose=settings.controlMode==='hold'?(cascade?.pose||{x:0,y:0,cup:0,pitch:0}):settings.controlMode==='tilt'?{x:tiltPlaying?tiltFrame.x*.25:0,y:tiltPlaying?tiltFrame.y*.25:0,cup:0}:paperMotion.step(Math.min(dt,.04),settings.paperMotion,brushMotion,down);
 const drainage=flow.phase==='shake'?drainPose(flow.progress):{bend:paperPose.cup,pitch:paperPose.pitch||0};view.setCardPose(paperPose,flow.phase,drainage);
 if(!finished&&!(settings.controlMode==='hold'&&cascade&&['pour','brush'].includes(flow.phase)))sand.step(Math.min(dt,.04),{shaking:flow.phase==='shake',bend:drainage.bend,tilt:drainage.pitch,tiltX:tiltPlaying?tiltFrame.x:paperPose.x,tiltY:tiltPlaying?tiltFrame.y:paperPose.y,cup:paperPose.cup,contactAdhesion:tiltPlaying,granular:settings.controlMode==='tilt'&&flow.phase!=='shake'});
 if(!finished)view.collectSpill(sand,true);
 const event=flow.tick(dt,{peelHeld:(down||holdLatched)&&!dialog.open,drainComplete:flow.phase!=='shake'||(!sand.hasLoose()&&view.spills.length===0)});
 if(event==='rolled'){releaseAll();revealUntil(partLayers.length);peeled=true;peel=1;repaintPaper();view.peelProgress(1);prepareDose();updateUI()}
 if(event==='poured'){pour=null;view.posePour(null);updateUI()}
 if(event==='shaken'||event==='advance'){
  view.collectSpill(sand);sand.removeLoose();sand.compact();view.currentInitialized=0;
  if(event==='advance')nextStage();else if(refillAfterShake){refillAfterShake=false;addSand();}else updateUI();
 }
 if((settings.autoAdvance||settings.controlMode==='hold')&&flow.phase==='brush'&&ready()&&gate.active===null&&!holdLatched&&!dialog.open&&!finished){readySince+=dt;if(readySince>.55)startShake(true)}else readySince=0;
 // Commit new coverage before bound grains leave the moving mesh, avoiding a blank frame.
 updateCoat();
 simMs=simMs*.85+(performance.now()-simStart)*.15;
 sound(flow.phase==='pour'?.14:flow.phase==='shake'?.15:flow.phase==='rolling'?.06:holding?.035:moved?Math.min(.16,.015+moved*.00003):0);
 const drawStart=performance.now();view.render(sand,{time:t,dt,phase:flow.phase,down,pointer,brushMotion,paperPose,showBrush:settings.controlMode==='brush',paperHeld:!!paperMotion.grip||(settings.controlMode==='hold'&&(cascade?.press||0)>.02),peeled,pour,shakeProgress:flow.phase==='shake'?flow.progress:0,finished});renderMs=renderMs*.85+(performance.now()-drawStart)*.15;
 if((statClock+=dt)>.2){statClock=0;updateUI();updateStats();}
}
applySettings(settings);
try{
 await Promise.all([level.lines,...stages.map(s=>s.id)].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[id]=im;resolve()};im.onerror=()=>reject(Error('Şablon yüklenemedi: '+id));im.src=`assets/${id}.png?v=17`})));
 assets.lines=assets[level.lines];
 for(const stage of stages){gc.clearRect(0,0,W,H);gc.drawImage(assets[stage.id],0,0);const data=gc.getImageData(0,0,W,H).data,mask=new Uint8Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=data[i*4+3]>80?1:0;masks[stage.id]=mask;}
 index=resumeIndex(location.search,stages.length);
 for(let i=0;i<index;i++){
  makeGlitter(stages[i].color);cc.clearRect(0,0,W,H);cc.drawImage(glitter,0,0);cc.globalCompositeOperation='destination-in';cc.drawImage(assets[stages[i].id],0,0);cc.globalCompositeOperation='source-over';bakedContext.drawImage(coat,0,0);
 }
 cc.clearRect(0,0,W,H);repaintPaper();view=new AtelierScene(canvas,paperCanvas,stages.map(s=>s.color),settings);activate();requestAnimationFrame(frame);
}catch(error){$('#instruction-title').textContent='Atölye açılamadı.';$('#instruction-text').textContent='Sayfayı güncel bir tarayıcıda yenileyerek tekrar dene.';console.error(error);}
