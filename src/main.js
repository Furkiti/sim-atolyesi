import {Sand,AIR,FREE,BOUND,W,H,CELL} from './sand.js';
import {AtelierScene} from './scene.js';
const $=s=>document.querySelector(s),canvas=$('#art');
const stages=[
 {id:'black',name:'Gece siyahı',color:'#171c2b',anchor:[128,310],pile:[151,185]},
 {id:'blue',name:'Gotham mavisi',color:'#1644e8',anchor:[205,405],pile:[212,320]},
 {id:'red',name:'Kırmızı gülüş',color:'#c50e35',anchor:[322,423],pile:[322,412]},
 {id:'green',name:'Zehir yeşili',color:'#168c45',anchor:[301,293],pile:[299,280]},
 {id:'purple',name:'Kadife moru',color:'#782b93',anchor:[184,559],pile:[199,503]},
 {id:'gold',name:'Son bir parıltı',color:'#e7ae20',anchor:[338,519],pile:[337,510]}
];
let index=0,tool='peel',peeled=false,peel=0,down=false,pointer={x:150,y:200,visible:false},prev={x:150,y:200};
let sand,view,pour=null,pourNumber=0,finished=false,last=0,statsClock=0,fpsClock=0,frameCounter=0,shaking=0,moved=0,stepCount=0;
const assets={},masks={},strokes=[];
const paperCanvas=document.createElement('canvas');paperCanvas.width=W;paperCanvas.height=H;const pc=paperCanvas.getContext('2d');
const paperBase=document.createElement('canvas');paperBase.width=W;paperBase.height=H;const bc=paperBase.getContext('2d');
bc.fillStyle='#f5e7a5';bc.fillRect(0,0,W,H);for(let i=0;i<55000;i++){bc.fillStyle=Math.random()>.5?'#fff9d118':'#ad945212';bc.fillRect(Math.random()*W,Math.random()*H,1,1)}
const glue=document.createElement('canvas');glue.width=W;glue.height=H;const gc=glue.getContext('2d');
function repaintPaper(){
 pc.clearRect(0,0,W,H);pc.drawImage(paperBase,0,0);pc.globalAlpha=.07;
 for(let i=index;i<stages.length;i++)pc.drawImage(assets[stages[i].id],0,0);pc.globalAlpha=1;
 if(peel>0){pc.save();pc.beginPath();pc.rect(0,0,W,H*peel);pc.clip();pc.drawImage(glue,0,0);pc.restore()}
 pc.globalAlpha=.84;pc.drawImage(assets.lines,0,0);pc.globalAlpha=1;view?.paperChanged();
}
let audioCtx,gain,filter,soundOn=false;
function audio(){if(audioCtx)return;audioCtx=new(window.AudioContext||window.webkitAudioContext)();const b=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=(v+(Math.random()-.5)*.065)/1.035;d[i]=v*4}const s=audioCtx.createBufferSource();s.buffer=b;s.loop=true;filter=audioCtx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1600;filter.Q.value=.5;gain=audioCtx.createGain();gain.gain.value=0;s.connect(filter).connect(gain).connect(audioCtx.destination);s.start()}
function sound(amount=0){if(!audioCtx)return;gain.gain.setTargetAtTime(soundOn?amount:0,audioCtx.currentTime,.06);filter.frequency.setTargetAtTime(pour?2400:800+Math.min(moved,300)*5,audioCtx.currentTime,.1)}
$('#sound').onclick=async()=>{audio();await audioCtx.resume();soundOn=!soundOn;$('#sound').innerHTML=soundOn?'Ses açık <span>◉</span>':'Ses kapalı <span>◌</span>';$('#sound').setAttribute('aria-label',soundOn?'Sesi kapat':'Sesi aç')};
function hint(text){$('#instruction-text').textContent=text}
function progress(){
 const percent=Math.round(sand.coverage*100),ready=sand.coverage>=.86;
 $('#coverage').textContent=percent+'%';$('#progress-fill').style.width=percent+'%';
 $('#next').disabled=!ready||finished||!!pour;$('#next').innerHTML=ready?(index===5?'Eserini tamamla <span>✧</span>':'Sonraki renge geç <span>→</span>'):'Simi açık bölgelere yay <span>→</span>';
 if(ready&&!finished&&!pour){$('#instruction-title').textContent='Renk yerini buldu.';hint('Fazlayı silkele; yapışan taneler kâğıtta kalsın.')}
 const s=sand.stats();Object.assign(canvas.dataset,{version:'2',emitted:s.emitted,free:s.free,air:s.air,bound:s.bound,lost:s.lost,coverage:s.coverage.toFixed(5),height:s.maxHeight.toFixed(2),moved,stage:index,tool});
}
function ui(){
 $('#stage-label').textContent=`0${index+1} / 06 · ${stages[index].name.toLocaleUpperCase('tr')}`;
 document.querySelectorAll('[data-tool]').forEach(el=>el.classList.toggle('selected',el.dataset.tool===tool));
 document.querySelectorAll('.jar').forEach((el,i)=>el.classList.toggle('active',i===index));
 document.querySelectorAll('.chapter').forEach((el,i)=>{el.classList.toggle('active',i===index);el.classList.toggle('done',i<index)});
 const text=tool==='peel'?['Kâğıdı tut. Yavaşça kaldır.','Halkalı yerden sürükle. Ardından bir yığın sim dökülecek.','↗']:tool==='pour'?['Bir yığın daha dök.','Kâğıtta bir yere dokun; sim oraya kendiliğinden dökülsün.','⠿']:tool==='brush'?['Yığını gerçekten yay.','Yığından başlayıp sürükle. Boş yerde fırça iz bırakmaz.','▰']:['Fazlalıklar dökülsün.','Yalnızca açık bölgeye yapışan taneler kalır.','≋'];
 $('#instruction-title').textContent=text[0];hint(text[1]);$('#step-icon').textContent=text[2];progress();
}
function activate(){
 sand=new Sand();sand.setMask(masks[stages[index].id]);peeled=false;peel=0;tool='peel';pour=null;pourNumber=0;shaking=0;strokes.length=0;moved=0;
 gc.clearRect(0,0,W,H);gc.fillStyle='#d9bc8d';gc.fillRect(0,0,W,H);gc.globalCompositeOperation='destination-in';gc.drawImage(assets[stages[index].id],0,0);gc.globalCompositeOperation='source-over';
 view.setStage(index);view.setPeelMask(assets[stages[index].id]);repaintPaper();ui();
}
function startPour(point){
 if(pour||shaking>0||!peeled||finished)return;
 const dose=Math.ceil(Math.min(37000,Math.max(6000,sand.targetCount*8)));
 if(sand.capacity-sand.count<dose){sand.compact();view.currentInitialized=0;}
 if(sand.capacity-sand.count<1800){hint('Kâğıtta bol sim var. Önce yay veya fazlasını silkele.');return;}
 const px=Array.isArray(point)?point[0]:point.x,py=Array.isArray(point)?point[1]:point.y;
 const x=Math.max(45,Math.min(W-45,px)),y=Math.max(45,Math.min(H-45,py));
 pour={x,y,remaining:Math.min(dose,sand.capacity-sand.count),duration:1.7,rate:dose/1.7};pourNumber++;tool='pour';down=false;ui();
 $('#instruction-title').textContent='Sim dökülüyor…';hint('Yığın kabarsın. Sonra fırçayla kenarlara doğru it.');
}
function select(t){
 if(finished||pour)return;
 if(!peeled&&t!=='peel'){hint('Önce halkalı yerden kâğıdı soy.');return;}
 if(peeled&&t==='peel'){hint('Kâğıt açıldı. Yığını fırçayla dağıtabilirsin.');return;}
 tool=t;down=false;strokes.length=0;ui();
 if(t==='clean'){shaking=1.5;view.brush.visible=false;}
}
document.querySelectorAll('[data-tool]').forEach(el=>el.onclick=()=>select(el.dataset.tool));
for(const [i,s] of stages.entries()){
 const b=document.createElement('button');b.className='jar';b.style.setProperty('--color',s.color);b.title=s.name;b.setAttribute('aria-label',s.name);b.innerHTML='<span></span>';b.onclick=()=>{if(i===index&&peeled)startPour(stages[index].pile);else if(i!==index)hint(`Şu an ${stages[index].name.toLocaleLowerCase('tr')} üzerinde çalışıyoruz.`)};$('#jars').append(b);
 const ch=document.createElement('div');ch.className='chapter';$('#chapters').append(ch);
}
canvas.addEventListener('pointerdown',e=>{
 if(!view||finished||pour||shaking>0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);const p=view.mapPointer(e);pointer={...p,visible:true};prev=p;
 if(tool==='peel'&&!sand.onGlue(p.x,p.y)&&Math.hypot(p.x-stages[index].anchor[0],p.y-stages[index].anchor[1])>65){hint('Halkalı bölgeden tutup sürükle.');return;}
 down=true;if(soundOn)audioCtx.resume();if(tool==='pour'){startPour(p);return;}
});
canvas.addEventListener('pointermove',e=>{
 if(!view)return;const p=view.mapPointer(e);pointer={...p,visible:true};if(!down||pour)return;
 const d=Math.hypot(p.x-prev.x,p.y-prev.y);
 if(tool==='peel'&&!peeled){peel=Math.min(1,peel+d/220);repaintPaper();view.peelProgress(peel);if(peel>=.98){peel=1;peeled=true;down=false;repaintPaper();view.peelProgress(1);startPour(stages[index].pile);}}
 else if(tool==='brush'&&d>.1){strokes.push({from:{...prev},to:{...p}});if(strokes.length>20)strokes.splice(0,strokes.length-20);}
 prev=p;
});
function release(){down=false;sound(0)}
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
canvas.addEventListener('pointerleave',()=>{pointer.visible=false});window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);
function frame(t){
 const dt=Math.min((t-last)/1000,.033)||.016;last=t;moved=0;frameCounter++;
 if(t-fpsClock>1000){canvas.dataset.fps=Math.round(frameCounter*1000/(t-fpsClock));fpsClock=t;frameCounter=0;}
 if(!document.hidden){
  if(pour){const n=Math.min(pour.remaining,Math.max(1,Math.round(pour.rate*dt)));sand.emit(pour.x,pour.y,n);pour.remaining-=n;if(pour.remaining<=0){pour=null;tool='brush';ui();}}
  for(const stroke of strokes)moved+=sand.brush(stroke.from,stroke.to);strokes.length=0;
  sand.step(dt,{shaking:shaking>0});if(shaking>0){shaking-=dt;if(shaking<=0){shaking=0;sand.removeLoose();sand.compact();view.currentInitialized=0;tool='brush';ui();}}
  sound(pour?.14:shaking>0?.16:moved>0?Math.min(.16,.015+moved*.00005):0);
  view.render(sand,{time:t,dt,tool,down,pointer,peeled,anchor:stages[index].anchor,pour,shaking:shaking>0});
  if((statsClock+=dt)>.23){statsClock=0;progress();}
 }
 requestAnimationFrame(frame);
}
$('#next').onclick=()=>{
 if(sand.coverage<.86||pour||finished)return;release();view.updateGrains(sand);view.preserve(sand);
 if(index<5){index++;activate();}else{finished=true;pointer.visible=false;tool='done';view.current.visible=false;view.heap.visible=false;view.brush.visible=false;view.hint.visible=false;sand.removeLoose();$('#complete').hidden=false;$('#next').disabled=true;}
};
function reset(){if(!view)return;release();view.reset();index=0;finished=false;$('#complete').hidden=true;activate()}
$('#reset').onclick=reset;$('#again').onclick=reset;
$('#save').onclick=()=>{const a=document.createElement('a');a.href=view.capture();a.download='sim-atolyesi-gotham-3d.png';a.click()};
$('#research-open').onclick=()=>$('#research').showModal();$('#research-close').onclick=()=>$('#research').close();
const notes=document.createElement('button');notes.textContent='Mekanik notları ↗';notes.className='text-button mobile-notes';notes.onclick=()=>$('#research').showModal();$('footer').append(notes);
try{
 await Promise.all(['lines',...stages.map(s=>s.id)].map(id=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{assets[id]=im;resolve()};im.onerror=()=>reject(Error('Şablon yüklenemedi: '+id));im.src=`assets/${id}.png`;})));
 for(const s of stages){gc.clearRect(0,0,W,H);gc.drawImage(assets[s.id],0,0);const d=gc.getImageData(0,0,W,H).data,mask=new Uint8Array(W*H);for(let i=0;i<mask.length;i++)mask[i]=d[i*4+3]>80?1:0;masks[s.id]=mask;}
 repaintPaper();view=new AtelierScene(canvas,paperCanvas,stages.map(s=>s.color));
 activate();requestAnimationFrame(frame);
}catch(e){$('#instruction-title').textContent='3B atölye açılamadı.';hint('WebGL destekli güncel bir tarayıcıda tekrar dene.');console.error(e);}
