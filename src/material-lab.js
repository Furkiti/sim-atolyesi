import {HOLD_MATERIALS} from './hold-material.js';
import {W,H,BOUND,AIR} from './sand.js';
import {advanceTrial,createTrial,trialInput,trialMask,trialMetrics,trialStyle,TRIAL_BEATS,TRIAL_END,TRIAL_FPS} from './material-trial.js';

const $=id=>document.getElementById(id);
const mask=trialMask(),palette=['#7e541b','#9f7428','#c29843','#edc468','#fff1b5','#9b671c','#f4d77a'];
const points=new Intl.NumberFormat('tr-TR');
const paper=document.createElement('canvas');
paper.width=W;paper.height=H;
const back=paper.getContext('2d');
const surface=back.createLinearGradient(0,0,0,H);
surface.addColorStop(0,'#c2b497');surface.addColorStop(.7,'#ad9b7b');surface.addColorStop(1,'#9e896a');
const glue=back.createImageData(W,H);
for(let i=0;i<mask.length;i++)if(mask[i])glue.data.set([86,76,56,(i%W+Math.floor(i/W))%9<3?179:135],i*4);
back.putImageData(glue,0,0); // Composite the mask over the shared sheet below.
back.globalCompositeOperation='destination-over';
back.fillStyle=surface;back.fillRect(0,0,W,H);
back.globalCompositeOperation='source-over';

const views=Object.entries(HOLD_MATERIALS).map(([key,recipe])=>{
 const card=document.createElement('article');
 card.className='card';
 card.innerHTML=`<h2>${recipe.name}</h2><p class="desc">${recipe.description}</p><canvas width="420" height="560" role="img" aria-label="${recipe.name} akış görünümü"></canvas>
 <dl class="stats"><div><dt>Hareketli</dt><dd></dd></div><div><dt>Yükseklik</dt><dd></dd></div><div><dt>Kaplama</dt><dd></dd></div><div><dt>Tutunan</dt><dd></dd></div></dl>
 <a class="open" href="./?v=38&amp;akis=point&amp;malzeme=${key}&amp;serit=ust&amp;giris=direct">Oyunda dene ↗</a>`;
 $('cards').append(card);
 return {key,card,ctx:card.querySelector('canvas').getContext('2d',{alpha:false}),stats:card.querySelectorAll('dd'),trial:createTrial(key,mask)};
});

function draw(view){
 const {ctx,trial}=view,{sand,frame}=trial;
 ctx.setTransform(ctx.canvas.width/W,0,0,ctx.canvas.height/H,0,0);
 ctx.drawImage(paper,0,0);
 const paths=palette.map(()=>new Path2D()),shadow=new Path2D();
 for(let i=0;i<sand.count;i++){
  const state=sand.state[i],height=sand.z[i],x=sand.x[i],y=sand.y[i],seed=sand.seed[i];
  const size=1.1+seed*1.6;
  if(state!==BOUND&&height>7&&i%3===0)shadow.rect(x+height*.22,y+height*.17,size*2.1,1.5);
  const angle=sand.roll[i]*.41+seed*8,c=Math.cos(angle)*size,s=Math.sin(angle)*size;
  const px=x-height*.16,py=y-height*.70,path=paths[trialStyle(sand,i)];
  path.moveTo(px-c,py-s);path.lineTo(px-s*.45,py+c*.45);path.lineTo(px+c,py+s);path.lineTo(px+s*.45,py-c*.45);path.closePath();
 }
 ctx.fillStyle='rgba(71,46,20,.14)';ctx.fill(shadow);
 // Paint settled grains before the free surface so the thin trail remains visible.
 for(const index of [5,6,0,1,2,3,4]){ctx.fillStyle=palette[index];ctx.fill(paths[index]);}
 const {point}=trialInput(frame);
 if(point){
  ctx.beginPath();ctx.arc(point.x,point.y,12,0,Math.PI*2);ctx.strokeStyle='#fff5cd';ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.arc(point.x,point.y,2,0,Math.PI*2);ctx.fillStyle='#fff5cd';ctx.fill();
 }
 const m=trialMetrics(sand);
 view.stats[0].textContent=points.format(m.moving);
 view.stats[1].textContent=m.q90+' px';
 view.stats[3].textContent=points.format(m.bound);
 view.stats[2].textContent='%'+(m.coverage*100).toFixed(1).replace('.',',');
}

let frame=0,running=false,started=0,request=0;
function seek(target){
 frame=Math.max(0,Math.min(TRIAL_END,target));
 for(const view of views){
  if(view.trial.frame>frame)view.trial=createTrial(view.key,mask);
  advanceTrial(view.trial,frame);
  if(!view.card.hidden)draw(view);
 }
 $('frame').value=frame;
 $('clock').textContent=(frame/TRIAL_FPS).toFixed(2).replace('.',',')+' sn · '+frame;
}
function pause(){running=false;cancelAnimationFrame(request);$('play').textContent='Oynat';}
function tick(now){
 if(!running)return;
 const target=Math.min(TRIAL_END,Math.floor((now-started)*TRIAL_FPS/1000));
 // The film advances at 60 simulation steps per second, with a 30 Hz draw.
 if(target-frame>=2||target===TRIAL_END)seek(target);
 if(frame===TRIAL_END)pause();
 else request=requestAnimationFrame(tick);
}
function play(){
 if(running){pause();return;}
 if(frame===TRIAL_END)seek(0);
 running=true;started=performance.now()-frame*1000/TRIAL_FPS;
 $('play').textContent='Duraklat';request=requestAnimationFrame(tick);
}
for(const beat of TRIAL_BEATS){
 const button=document.createElement('button');button.type='button';button.textContent=beat.name;
 button.onclick=()=>{pause();seek(beat.frame);};$('beats').append(button);
}
$('play').onclick=play;
$('back').onclick=()=>{pause();seek(frame-1);};
$('next').onclick=()=>{pause();seek(frame+1);};
$('frame').addEventListener('input',()=>{pause();seek(Number($('frame').value));});
$('view').addEventListener('change',()=>{
 const key=$('view').value;
 $('cards').classList.toggle('single',key!=='all');
 for(const view of views){view.card.hidden=key!=='all'&&key!==view.key;if(!view.card.hidden)draw(view);}
});
seek(Number($('frame').value));
