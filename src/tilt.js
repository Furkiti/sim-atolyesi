const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wrap=v=>((v+180)%360+360)%360-180;
export function screenTilt(x,y,angle=0){const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return{x:x*c+y*s,y:y*c-x*s}}
export class TiltModel{
 constructor(){this.reset()}
 reset(){this.raw=null;this.zero=null;this.x=0;this.y=0;this.angle=null;}
 accept(beta,gamma,angle=0){
  if(!Number.isFinite(beta)||!Number.isFinite(gamma))return false;
  if(this.angle!==angle){this.zero=null;this.x=this.y=0;}this.angle=angle;this.raw={beta,gamma};
  if(!this.zero)this.calibrate();return true;
 }
 calibrate(){if(!this.raw)return false;this.zero={...this.raw};this.x=this.y=0;return true;}
 step(dt,sensitivity=1,live=true){
  let x=0,y=0;if(live&&this.raw&&this.zero){const d=screenTilt(wrap(this.raw.gamma-this.zero.gamma),wrap(this.raw.beta-this.zero.beta),this.angle);const response=v=>Math.sign(v)*Math.max(0,Math.abs(v)-1)*.55/28*sensitivity;x=clamp(response(d.x),-.65,.65);y=clamp(response(d.y),-.65,.65);}
  const a=1-Math.exp(-Math.min(dt,.1)/.09);this.x+=(x-this.x)*a;this.y+=(y-this.y)*a;return{x:this.x,y:this.y};
 }
}
export class DeviceTilt{
 constructor({host=globalThis.window,clock=()=>performance.now(),onChange=()=>{}}={}){
  this.host=host;this.clock=clock;this.onChange=onChange;this.model=new TiltModel();this.status='off';this.serial=0;this.lastSample=-Infinity;this.startedAt=0;this.listening=false;
  this.receive=e=>{const angle=this.host.screen?.orientation?.angle??this.host.orientation??0;if(this.model.accept(e.beta,e.gamma,Number(angle)||0)){this.lastSample=this.clock();this.setStatus('active');}};
 }
 setStatus(value){if(this.status!==value){this.status=value;this.onChange(value)}}
 start(){
  this.stop();const serial=this.serial,host=this.host,Ctor=host?.DeviceOrientationEvent;
  if(host?.isSecureContext===false){this.setStatus('insecure');return Promise.resolve(false)}
  if(!Ctor){this.setStatus('unsupported');return Promise.resolve(false)}
  this.model.reset();this.setStatus('requesting');
  // Called immediately inside the button gesture, before awaiting anything (iOS).
  let request;try{request=typeof Ctor.requestPermission==='function'?Ctor.requestPermission():Promise.resolve('granted')}catch{this.setStatus('denied');return Promise.resolve(false)}
  return Promise.resolve(request).then(result=>{
   if(serial!==this.serial)return false;if(result!=='granted'){this.setStatus('denied');return false}
   host.addEventListener('deviceorientation',this.receive,{passive:true});this.listening=true;this.startedAt=this.clock();this.lastSample=-Infinity;this.setStatus('waiting');return true;
  }).catch(()=>{if(serial===this.serial)this.setStatus('denied');return false});
 }
 stop(){this.serial++;if(this.listening)this.host.removeEventListener('deviceorientation',this.receive);this.listening=false;this.lastSample=-Infinity;this.model.reset();this.setStatus('off');}
 calibrate(){return this.model.calibrate()}
 demo(){this.stop();this.model.accept(0,0,0);this.lastSample=this.clock();this.setStatus('demo');}
 setDemo(x,y){if(this.status!=='demo')this.demo();this.model.accept(y,x,0);}
 tick(dt,sensitivity=1){
  const now=this.clock();if(this.status==='waiting'&&now-this.startedAt>4500)this.setStatus('empty');
  if(this.status==='active'&&now-this.lastSample>1000)this.setStatus('stale');
  const live=this.status==='demo'||this.status==='active';return{...this.model.step(dt,sensitivity,live),active:live,status:this.status};
 }
}
