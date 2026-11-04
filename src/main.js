import {Sand,W,H} from './sand.js';
import {AtelierScene} from './scene.js';
import {Flow,PointerGate,FramePacer,rollFront} from './interaction.js';
import {loadSettings,saveSettings,profileSettings,completionThreshold,doseFor,PILE_CENTER} from './settings.js';
const $=s=>document.querySelector(s),canvas=$('#art'),dialog=$('#settings');
const stages=[
 {id:'black',name:'Gece siyahı',color:'#171c2b'},
 {id:'blue',name:'Gotham mavisi',color:'#1644e8'},
 {id:'red',name:'Kırmızı gülüş',color:'#c50e35'},
 {id:'green',name:'Zehir yeşili',color:'#168c45'},
 {id:'purple',name:'Kadife moru',color:'#782b93'},
 {id:'gold',name:'Son bir parıltı',color:'#e7ae20'}
];
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
const glue=document.createElement('canvas');glue.width=W;glue.height=H;const gc=glue.getContext('2d');
function repaintPaper(){
 pc.clearRect(0,0,W,H);pc.drawImage(paperBase,0,0);
 pc.globalAlpha=.035;for(let i=index;i<stages.length;i++)pc.drawImage(assets[stages[i].id],0,0);
 // The next sheet is highlighted as a whole; no tiny target needs to be found.
 if(!peeled&&peel===0){pc.globalAlpha=.18;pc.drawImage(assets[stages[index].id],0,0)}pc.globalAlpha=1;
 if(peel>0){pc.save();pc.beginPath();pc.rect(0,0,W,Math.min(H,rollFront(peel)));pc.clip();pc.drawImage(glue,0,0);pc.restore()}
 pc.globalAlpha=.86;pc.drawImage(assets.lines,0,0);pc.globalAlpha=1;view?.paperChanged();
}
let audioCtx,gain,filter,soundOn=false;
function audio(){if(audioCtx)return;audioCtx=new(window.AudioContext||window.webkitAudioContext)();const b=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=(v+(Math.random()-.5)*.065)/1.035;d[i]=v*4}const src=audioCtx.createBufferSource();src.buffer=b;src.loop=true;filter=audioCtx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1600;filter.Q.value=.5;gain=audioCtx.createGain();gain.gain.value=0;src.connect(filter).connect(gain).connect(audioCtx.destination);src.start()}
function sound(amount=0){if(!audioCtx)return;gain.gain.setTargetAtTime(soundOn?amount:0,audioCtx.currentTime,.06);filter.frequency.setTargetAtTime(flow.phase==='pour'?2400:800+Math.min(moved,300)*5,audioCtx.currentTime,.1)}
$('#sound').onclick=async()=>{audio();await audioCtx.resume();soundOn=!soundOn;$('#sound').textContent=soundOn?'Ses: açık':'Ses: kapalı';$('#sound').setAttribute('aria-label',soundOn?'Sesi kapat':'Sesi aç')};
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
function ready(){return sand&&sand.coverage>=completionThreshold(settings)}
function updateUI(){
 if(!sand)return;
 const phase=flow.phase,percent=Math.round(sand.coverage*100);
 $('#stage-label').textContent=`0${index+1} / 06`;$('#stage-label').title=stages[index].name;$('#color-dot').style.background=stages[index].color;
 $('#coverage').textContent=percent+'%';$('#progress-fill').style.width=percent+'%';
 const messages={peel:['↗','Bir kez dokun.','Sıradaki kâğıt rulolanarak açılsın.','SOY'],rolling:['↗','Kâğıt açılıyor…','Sim birazdan merkez üstüne dökülecek.','SOY'],pour:['⠿','Bir yığın parıltı.','Kap boşalsın; sonra simi parmağınla yay.','DÖK'],brush:['▰','Yığından başla, kenarlara yay.','Sim yetmezse + Sim ile bir yığın daha ekle.','YAY'],shake:['≋','Fazlalıklar dökülsün.','Yapışan parıltılar kâğıtta kalır.','SİLKELE'],complete:['✧','Ellerine sağlık.','Biraz sabır, binlerce küçük parıltı.','BİTTİ']};
 const m=messages[phase]||messages.brush;$('#phase-icon').textContent=m[0];$('#instruction-title').textContent=m[1];$('#instruction-text').textContent=phase==='brush'&&settings.layout!=='flow'?'Sim ekle ile merkezde yeni bir yığın oluşturabilirsin.':m[2];$('#phase-label').textContent=m[3];
 const canNext=phase==='brush'&&ready()&&!finished;
 $('#next').hidden=!canNext||settings.autoAdvance;$('#next').disabled=!canNext;$('#next').innerHTML=index===5?'Eserini tamamla <span>✧</span>':'Sonraki renk <span>→</span>';
 $('#auto-status').hidden=!canNext||!settings.autoAdvance||gate.active!==null;
 $('#quick-actions').hidden=phase!=='brush'||finished;
 for(const button of document.querySelectorAll('[data-tool]')){
  const t=button.dataset.tool,selected=t===(phase==='shake'?'clean':phase==='rolling'?'peel':phase);
  button.classList.toggle('selected',selected);button.disabled=finished||flow.busy||(t==='peel'?phase!=='peel':phase==='peel');
 }
}
function activate(){
 sand=new Sand();sand.setMask(masks[stages[index].id]);flow.reset();peeled=false;peel=0;pour=null;readySince=0;strokes.length=0;
 gc.clearRect(0,0,W,H);gc.fillStyle='#d6b885';gc.fillRect(0,0,W,H);gc.globalCompositeOperation='destination-in';gc.drawImage(assets[stages[index].id],0,0);gc.globalCompositeOperation='source-over';
 view.setStage(index);repaintPaper();view.setPeelMask(assets[stages[index].id]);updateUI();
}
function beginRoll(){if(finished||!flow.roll())return;down=false;strokes.length=0;peel=0;updateUI()}
function prepareDose(){
 const amount=doseFor(sand.targetCount,settings,sand.capacity);
 if(sand.capacity-sand.count<amount){sand.compact();view.currentInitialized=0;}
 const dose=doseFor(sand.targetCount,settings,sand.capacity-sand.count);
 if(dose<1500){flow.phase='brush';$('#instruction-text').textContent='Kâğıtta bol sim var. Önce yay veya fazlasını silkele.';return;}
 pour={...PILE_CENTER,dose,emitted:0,elapsed:0};
}
function addSand(){if(finished||!flow.pour())return;down=false;strokes.length=0;prepareDose();readySince=0;updateUI()}
function startShake(advance=false){if(finished||!flow.shake(advance))return;shakeRuns++;releaseAll();pour=null;view.posePour(null);readySince=0;updateUI()}
function nextStage(){
 nextRuns++;view.updateGrains(sand);view.preserve(sand);
 if(index<5){index++;activate();autoKick=settings.autoAdvance?.22:0;}
 else{finished=true;flow.phase='complete';pointer.visible=false;view.current.visible=false;view.heap.visible=false;$('#complete').hidden=false;updateUI();}
}
for(const button of document.querySelectorAll('[data-tool]'))button.onclick=()=>{const t=button.dataset.tool;if(t==='peel')beginRoll();else if(t==='pour')addSand();else if(t==='clean')startShake(false);else updateUI()};
$('#add-sand').onclick=addSand;$('#shake').onclick=()=>startShake(false);$('#next').onclick=()=>{if(ready())startShake(true)};
function reset(){if(!view)return;releaseAll();finished=false;index=0;autoKick=0;view.reset();$('#complete').hidden=true;activate()}
$('#reset').onclick=()=>{reset();closeSettings()};$('#again').onclick=reset;
$('#save').onclick=()=>{const a=document.createElement('a');a.href=view.capture();a.download='sim-atolyesi-gotham.png';a.click()};
canvas.addEventListener('pointerdown',e=>{
 e.preventDefault();if(!view||finished||flow.busy||!gate.begin(e.pointerId,e.isPrimary!==false))return;
 canvas.setPointerCapture(e.pointerId);pointer={...view.mapPointer(e),visible:true};previous={...pointer};
 if(soundOn)audioCtx.resume();
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
 Object.assign(canvas.dataset,{version:'3',phase:flow.phase,layout:settings.layout,activePointer:gate.active??'',emitted:s.emitted,air:s.air,free:s.free,bound:s.bound,lost:s.lost,coverage:s.coverage.toFixed(5),height:s.maxHeight.toFixed(2),stage:index,shakes:shakeRuns,advances:nextRuns,cameraZ:view.camera.position.z.toFixed(2),fps:Math.round(fps),flowSerial:flow.serial,shaking:flow.phase==='shake'?1:0});
 $('#hud-fps').textContent=Math.round(fps)+' FPS';$('#hud-detail').textContent=frameMs.toFixed(1)+' ms';
 for(const [id,value] of Object.entries({'stat-fps':Math.round(fps),'stat-frame':frameMs.toFixed(1),'stat-sim':simMs.toFixed(1),'stat-render':renderMs.toFixed(1),'stat-particles':(s.air+s.free+s.bound+view.savedCount).toLocaleString('tr'),'stat-draws':m.draws,'stat-triangles':m.triangles.toLocaleString('tr'),'stat-memory':performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1):'—'}))$('#'+id).textContent=value;
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
  pour.elapsed=flow.elapsed;view.posePour(pour);
  const fraction=Math.min(1,Math.max(0,(flow.elapsed-.48)/.82)),desired=Math.floor(pour.dose*fraction),n=desired-pour.emitted;
  if(n>0){const source=view.pourOrigin();pour.emitted+=sand.emit(source.x,source.y,n,{spread:5,height:Math.max(12,source.z)});Object.assign(canvas.dataset,{emitterX:source.x.toFixed(2),emitterY:source.y.toFixed(2),emitterZ:source.z.toFixed(2)});}
 }
 for(const stroke of strokes)moved+=sand.brush(stroke.from,stroke.to,settings.pace==='fast'?48:39);strokes.length=0;
 sand.step(Math.min(dt,.033),{shaking:flow.phase==='shake'});
 const event=flow.tick(dt);
 if(event==='rolled'){peeled=true;peel=1;repaintPaper();view.peelProgress(1);prepareDose();updateUI()}
 if(event==='poured'){pour=null;view.posePour(null);updateUI()}
 if(event==='shaken'||event==='advance'){
  sand.removeLoose();sand.compact();view.currentInitialized=0;
  if(event==='advance')nextStage();else updateUI();
 }
 if(settings.autoAdvance&&flow.phase==='brush'&&ready()&&gate.active===null&&!dialog.open&&!finished){readySince+=dt;if(readySince>.55)startShake(true)}else readySince=0;
 simMs=simMs*.85+(performance.now()-simStart)*.15;
 sound(flow.phase==='pour'?.14:flow.phase==='shake'?.15:flow.phase==='rolling'?.06:moved?Math.min(.16,.015+moved*.00003):0);
 const drawStart=performance.now();view.render(sand,{time:t,dt,phase:flow.phase,down,pointer,peeled,pour,shakeProgress:flow.phase==='shake'?flow.progress:0,finished});renderMs=renderMs*.85+(performance.now()-drawStart)*.15;
 if((statClock+=dt)>.2){statClock=0;updateUI();updateStats();}
}
applySettings(settings);
try{
 await Promise.all(['lines',...stages.map(s=>s.id)].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[id]=im;resolve()};im.onerror=()=>reject(Error('Şablon yüklenemedi: '+id));im.src=`assets/${id}.png`})));
 for(const stage of stages){gc.clearRect(0,0,W,H);gc.drawImage(assets[stage.id],0,0);const data=gc.getImageData(0,0,W,H).data,mask=new Uint8Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=data[i*4+3]>80?1:0;masks[stage.id]=mask;}
 repaintPaper();view=new AtelierScene(canvas,paperCanvas,stages.map(s=>s.color),settings);activate();requestAnimationFrame(frame);
}catch(error){$('#instruction-title').textContent='Atölye açılamadı.';$('#instruction-text').textContent='Sayfayı güncel bir tarayıcıda yenileyerek tekrar dene.';console.error(error);}
