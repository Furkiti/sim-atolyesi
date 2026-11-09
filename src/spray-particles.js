import * as T from 'three';

const CAPACITY=6144, STRIDE=12;
const vertexShader=`
 uniform float uClock, uScale, uStyle;
 attribute vec3 destination, flight, pigment;
 varying vec3 vPigment;
 varying float vSeed, vAge, vOpacity, vMuzzle;
 void main(){
  float age=uClock-flight.x, life=flight.y, seed=flight.z;
  float flightT=clamp(age/life,0.0,1.0), impact=max(0.0,age-life);
  float lifeAfter=uStyle>1.5?.19:.33;
  if(age<0.0||age>life+lifeAfter){
   gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=0.0;
   vOpacity=0.0;return;
  }
  float t=flightT*flightT*(1.65-.65*flightT);
  vec3 p=mix(position,destination,t);
  vec2 path=destination.xy-position.xy;
  vec2 side=vec2(-path.y,path.x)/max(1.0,length(path));
  float fan=uStyle>1.5?37.0:20.0;
  p.xy+=side*sin(flightT*3.14159)*(fract(seed*137.0)-.5)*fan;
  p.z+=sin(flightT*3.14159)*(26.0+seed*60.0);
  float splash=clamp(impact/lifeAfter,0.0,1.0), angle=seed*189.0;
  float bounce=step(uStyle>1.5?.84:.51,seed);
  p.xy+=vec2(cos(angle),sin(angle))*splash*(4.0+seed*17.0)*bounce;
  p.z+=sin(splash*3.14159)*8.0*bounce;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
  vMuzzle=(1.0-smoothstep(.012,.063,age))*step(.67,seed);
  gl_PointSize=uScale*(1.35+fract(seed*197.0)*2.65+vMuzzle*1.5)*(1.0-splash*.65);
  vPigment=pigment;vSeed=seed;vAge=age;
  vOpacity=(1.0-smoothstep(.03,lifeAfter,impact))*mix(1.0,bounce,step(life+.035,age));
 }
`;
const fragmentShader=`
 uniform float uStyle;
 varying vec3 vPigment;
 varying float vSeed, vAge, vOpacity, vMuzzle;
 void main(){
  vec2 q=gl_PointCoord-.5;
  float turn=vSeed*43.0+vAge*16.0;
  q=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*q;
  float edge=uStyle>1.5?length(q):max(abs(q.x)*.84,abs(q.y)+abs(q.x)*.25);
  float alpha=(1.0-smoothstep(.28,.49,edge))*vOpacity;
  if(alpha<.02)discard;
  float facet=.72+step(0.0,q.x-q.y)*.29;
  float flash=step(.88,vSeed)*pow(max(0.0,sin(vSeed*239.0+vAge*27.0)),6.0);
  vec3 color=vPigment*facet+vec3(1.0,.90,.67)*(flash*(uStyle>1.5?.30:1.1)+vMuzzle*.24);
  gl_FragColor=vec4(color,alpha);
  #include <colorspace_fragment>
 }
`;

export class SprayParticles {
 constructor(){
  this.data=new T.InterleavedBuffer(new Float32Array(CAPACITY*STRIDE),STRIDE).setUsage(T.DynamicDrawUsage);
  const geometry=new T.BufferGeometry();
  for(const [name,offset] of [['position',0],['destination',3],['flight',6],['pigment',9]]){
   geometry.setAttribute(name,new T.InterleavedBufferAttribute(this.data,3,offset));
  }
  geometry.setDrawRange(0,0);
  this.uniforms={uClock:{value:0},uScale:{value:1},uStyle:{value:0}};
  const material=new T.ShaderMaterial({vertexShader,fragmentShader,uniforms:this.uniforms,transparent:true,depthWrite:false});
  this.mesh=new T.Points(geometry,material);
  this.mesh.frustumCulled=false;this.mesh.visible=false;this.mesh.renderOrder=2;
  this.cursor=0;this.count=0;this.visibleUntil=0;this.color=new T.Color();
 }
 clear(){
  this.cursor=this.count=this.visibleUntil=0;
  this.mesh.geometry.setDrawRange(0,0);
  this.mesh.visible=false;
 }
 emit(shot,source,color,now,duration){
  this.color.set(color);
  const {r,g,b}=this.color,buffer=this.data.array,first=this.cursor;
  const number=Math.min(72,35+shot.cells.length*2);
  for(let i=0;i<number;i++){
   const target=shot.cells[i%shot.cells.length],seed=Math.random(),at=this.cursor*STRIDE;
   buffer[at]=source.x-300+(Math.random()-.5)*7;
   buffer[at+1]=400-source.y+(Math.random()-.5)*5;
   buffer[at+2]=8+seed*10;
   buffer[at+3]=target.x-300+(Math.random()-.5)*4;
   buffer[at+4]=400-target.y+(Math.random()-.5)*4;
   buffer[at+5]=5.4+seed*1.5;
   buffer[at+6]=now+seed*.026;
   buffer[at+7]=duration*(.84+seed*.14);
   buffer[at+8]=seed;
   buffer[at+9]=r;buffer[at+10]=g;buffer[at+11]=b;
   this.cursor=(this.cursor+1)%CAPACITY;
  }
  const firstLength=Math.min(number,CAPACITY-first);
  this.data.addUpdateRange(first*STRIDE,firstLength*STRIDE);
  if(firstLength<number)this.data.addUpdateRange(0,(number-firstLength)*STRIDE);
  this.data.needsUpdate=true;
  this.count=Math.min(CAPACITY,this.count+number);
  this.visibleUntil=now+duration+.36;
  this.mesh.geometry.setDrawRange(0,this.count);
 }
 render(now,style,pixelRatio,show){
  this.uniforms.uClock.value=now;
  this.uniforms.uStyle.value=style;
  this.uniforms.uScale.value=pixelRatio;
  this.mesh.visible=show&&now<this.visibleUntil;
  if(now>=this.visibleUntil&&this.count)this.clear();
 }
}
