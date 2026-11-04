import * as T from 'three';
import {drainPose,bentPoint,surfaceVelocity,smooth} from './interaction.js';
import {peelPoint} from './peel.js';
import {TRAY,stepFalling} from './collector.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS,ROWS} from './sand.js';
const TAU=Math.PI*2,NO_BOX={...TRAY,halfWidth:-1};
function canvasTexture(draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function noiseTexture(){return canvasTexture((c,s)=>{c.fillStyle='#b9bcba';c.fillRect(0,0,s,s);for(let i=0;i<55000;i++){const v=150+Math.random()*85;c.fillStyle=`rgba(${v},${v+1},${v+3},.16)`;c.fillRect(Math.random()*s,Math.random()*s,.5+Math.random()*2,1)}},512)}
function flakeGeometry(){
 const geo=new T.BufferGeometry(),v=[];const n=5;
 for(let j=0;j<n;j++){const a=j/n*TAU,b=(j+1)/n*TAU;v.push(0,0,.12,Math.cos(a),Math.sin(a),0,Math.cos(b),Math.sin(b),0);}
 geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.computeVertexNormals();return geo;
}
export class AtelierScene {
 constructor(canvas,paperCanvas,colors,settings){
  this.settings=settings;this.baseDpr=Math.min(devicePixelRatio||1,matchMedia('(pointer: coarse)').matches?1.4:2);
  this.canvas=canvas;this.colors=colors;this.activeColor=0;this.time=0;this.renderTick=0;this.mouse=new T.Vector2();this.ray=new T.Raycaster();this.hit=new T.Vector3();
  this.renderer=new T.WebGLRenderer({canvas,antialias:!matchMedia('(pointer: coarse)').matches,alpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(this.baseDpr*settings.renderScale);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
  this.scene=new T.Scene();this.scene.background=new T.Color('#c9ccca');this.camera=new T.PerspectiveCamera(35,1,1,5000);
  const pmrem=new T.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
  this.scene.environmentIntensity=.55;
  this.scene.add(new T.HemisphereLight('#fff7dd','#505668',1.5));
  this.key=new T.DirectionalLight('#fff6e4',2.8);this.key.position.set(-300,340,750);this.key.castShadow=true;
  this.key.shadow.mapSize.set(1536,1536);Object.assign(this.key.shadow.camera,{left:-600,right:600,top:700,bottom:-650,near:1,far:1800});this.key.shadow.bias=-.00008;this.key.shadow.normalBias=.15;this.key.shadow.radius=3;this.scene.add(this.key);
  this.fill=new T.DirectionalLight('#b9d4ff',.8);this.fill.position.set(500,-200,400);this.scene.add(this.fill);
  const floorTex=noiseTexture();floorTex.wrapS=floorTex.wrapT=T.RepeatWrapping;floorTex.repeat.set(4,4);
  const floor=new T.Mesh(new T.PlaneGeometry(2400,2400),new T.MeshStandardMaterial({map:floorTex,bumpMap:floorTex,bumpScale:.8,roughness:.94,color:'#d9ddda'}));floor.position.z=-8;floor.receiveShadow=true;this.scene.add(floor);
  this.paperGroup=new T.Group();this.paperGroup.rotation.z=.018;this.scene.add(this.paperGroup);
  const edge=new T.Mesh(new T.BoxGeometry(W,H,3.2,30,40,1),new T.MeshStandardMaterial({color:'#d6c68b',roughness:.85}));edge.castShadow=true;edge.receiveShadow=true;this.paperGroup.add(edge);this.edge=edge;this.edgeBase=edge.geometry.attributes.position.array.slice();
  this.paperTexture=new T.CanvasTexture(paperCanvas);this.paperTexture.colorSpace=T.SRGBColorSpace;this.paperTexture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
  const surfaceGeo=new T.PlaneGeometry(W,H,30,40),pp=surfaceGeo.attributes.position;
  for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),edge=Math.max(Math.abs(x)/300,Math.abs(y)/400);pp.setZ(i,2.8+Math.pow(edge,14)*1.5+Math.sin(x*.013+y*.006)*.12)}surfaceGeo.computeVertexNormals();
  this.paper=new T.Mesh(surfaceGeo,new T.MeshBasicMaterial({map:this.paperTexture,color:'#ffffff',toneMapped:false}));this.paper.receiveShadow=true;this.paperGroup.add(this.paper);this.paperBase=pp.array.slice();this.bend=0;this.pitch=0;
  this.coatUniforms={uTime:{value:0},uSparkle:{value:settings.sparkles?1:0},uCoat:{value:null}};
  this.paper.material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,this.coatUniforms);
   shader.fragmentShader='uniform float uTime; uniform float uSparkle; uniform sampler2D uCoat;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    vec2 cell=floor(vMapUv*vec2(600.0,800.0));
    float rnd=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
    float flicker=pow(max(0.0,sin(uTime*1.4+rnd*197.0)),32.0);
    float coat=texture2D(uCoat,vMapUv).a;
    gl_FragColor.rgb+=coat*uSparkle*step(.986,rnd)*flicker*.65;`);
  };
  this.shaders=[];this.sparkLight=new T.Vector3(-.35,.45,1);
  this.grainMaterial=new T.MeshStandardMaterial({color:'#ffffff',metalness:.95,roughness:.43,envMapIntensity:.5,side:T.DoubleSide});
  this.grainMaterial.onBeforeCompile=shader=>{
   shader.uniforms.uSparkLight={value:this.sparkLight};shader.uniforms.uSparkEnabled={value:this.settings.sparkles?1:0};shader.vertexShader='attribute float flakeSeed; varying float vFlakeSeed;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFlakeSeed=flakeSeed;');
   shader.fragmentShader='uniform float uSparkEnabled; uniform vec3 uSparkLight; varying float vFlakeSeed;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    vec3 halfLight=normalize(uSparkLight+normalize(vViewPosition));
    float glint=pow(max(dot(normal,halfLight),0.0),140.0);
    gl_FragColor.rgb+=uSparkEnabled*step(.975,vFlakeSeed)*glint*1.8*vec3(1.0,0.95,0.82);`);
   this.shaders.push(shader);
  };
  this.current=this.makeGrains(30000);this.savedCount=0;this.currentInitialized=0;
  this.spill=this.makeGrains(30000);this.paperGroup.remove(this.spill);this.scene.add(this.spill);this.spill.material=this.grainMaterial.clone();this.spill.material.depthTest=false;this.spill.material.depthWrite=false;this.spill.renderOrder=20;this.spills=[];this.spillObject=new T.Object3D();
  this.coatMask=new T.CanvasTexture(document.createElement('canvas'));this.coatUniforms.uCoat.value=this.coatMask;
  this.heapTexture=canvasTexture((c,s)=>{c.fillStyle='#898989';c.fillRect(0,0,s,s);for(let i=0;i<18000;i++){const g=Math.random()*255|0;c.fillStyle=`rgb(${g},${g},${g})`;c.fillRect(Math.random()*s,Math.random()*s,1,1)}},128);this.heapTexture.wrapS=this.heapTexture.wrapT=T.RepeatWrapping;this.heapTexture.repeat.set(11,15);
  this.heapGeo=new T.PlaneGeometry(W,H,COLS/2,ROWS/2);
  this.heapGeo.setAttribute('heapAmount',new T.Float32BufferAttribute(new Float32Array(this.heapGeo.attributes.position.count),1));
  this.heapMat=new T.MeshStandardMaterial({color:colors[0],roughness:.65,metalness:.9,bumpMap:this.heapTexture,bumpScale:.7,envMapIntensity:.8});
  const clipHeap=shader=>{shader.vertexShader='attribute float heapAmount; varying float vHeap;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeap=heapAmount;');shader.fragmentShader='varying float vHeap;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() {\nif(vHeap<.7) discard;');};
  this.heapMat.onBeforeCompile=clipHeap;this.heap=new T.Mesh(this.heapGeo,this.heapMat);this.heap.frustumCulled=false;this.heap.receiveShadow=true;this.heap.castShadow=true;this.heap.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});this.heap.customDepthMaterial.onBeforeCompile=clipHeap;this.paperGroup.add(this.heap);
  this.peelGeo=new T.PlaneGeometry(W,H,24,160);
  this.peelSheet=new T.Mesh(this.peelGeo,new T.MeshStandardMaterial({color:'#fff2b2',roughness:.8,transparent:true,alphaTest:.08,side:T.DoubleSide}));
  this.peelSheet.frustumCulled=false;this.peelSheet.castShadow=true;this.peelSheet.visible=false;this.paperGroup.add(this.peelSheet);
  this.makeBrush();this.makeTweezers();this.makeGlints();this.makeJars();this.makeCollector();this.makeHands();this.hint=this.makeHint();this.paperGroup.add(this.hint);
  this.desiredBrush={x:130,y:250,angle:-.72,contact:false,visible:false};this.brushPoint={x:130,y:250};this.pourPoint={x:140,y:180};this.autoPour=false;
  this.applySettings(settings);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
 }
 makeGrains(capacity){
  const g=flakeGeometry(),seeds=new Float32Array(capacity);for(let i=0;i<capacity;i++)seeds[i]=((i*16807)%2147483647)/2147483647;
  g.setAttribute('flakeSeed',new T.InstancedBufferAttribute(seeds,1));
  const m=new T.InstancedMesh(g,this.grainMaterial,capacity);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(capacity*3),3);m.frustumCulled=false;m.count=0;this.paperGroup.add(m);return m;
 }
 makeBrush(){
  this.brush=new T.Group();this.brush.visible=false;this.paperGroup.add(this.brush);
  const wood=new T.MeshStandardMaterial({color:'#1d2028',roughness:.27,metalness:.15});
  const handle=new T.Mesh(new T.CylinderGeometry(6,10,165,20),wood);handle.position.set(0,-133,19);handle.rotation.x=.075;handle.castShadow=true;this.brush.add(handle);
  const end=new T.Mesh(new T.SphereGeometry(6,12,8),wood);end.position.set(0,-215,13);this.brush.add(end);
  const ferrule=new T.Mesh(new T.BoxGeometry(45,35,12),new T.MeshStandardMaterial({color:'#b6b9ba',metalness:1,roughness:.21}));ferrule.position.set(0,-34,14);ferrule.castShadow=true;this.brush.add(ferrule);
  const ringMat=new T.MeshStandardMaterial({color:'#e4e2dc',metalness:.95,roughness:.19});for(let y of [-48,-20]){const line=new T.Mesh(new T.BoxGeometry(46,2,12.5),ringMat);line.position.set(0,y,14);this.brush.add(line)}
  const tuftGeo=new T.CylinderGeometry(22,29,37,32,1,false);tuftGeo.scale(1,1,.24);
  this.tuftMat=new T.MeshStandardMaterial({color:'#795235',roughness:.8});this.tuft=new T.Mesh(tuftGeo,this.tuftMat);this.tuft.position.set(0,0,9);this.tuft.castShadow=true;this.brush.add(this.tuft);
  const bristleGeo=new T.BufferGeometry(),points=[];for(let i=0;i<150;i++){const x=(Math.random()-.5)*48,z=4+Math.random()*10;points.push(x*.8,-15,z+2,x,17-Math.abs(x)*.13,z*.7)}bristleGeo.setAttribute('position',new T.Float32BufferAttribute(points,3));this.bristles=new T.LineSegments(bristleGeo,new T.LineBasicMaterial({color:'#c09965',transparent:true,opacity:.65}));this.brush.add(this.bristles);
 }
 makeJars(){
  this.jars=[];
  const stand=new T.Mesh(new T.BoxGeometry(470,65,9),new T.MeshStandardMaterial({color:'#41464b',metalness:.25,roughness:.35}));stand.position.set(0,460,-2);stand.castShadow=true;this.scene.add(stand);
  for(let i=0;i<6;i++){
   const g=new T.Group();g.position.set((i-2.5)*72,460,4);g.rotation.x=Math.PI/2;this.scene.add(g);
   const glass=new T.Mesh(new T.CylinderGeometry(23,19,58,24,1,true),new T.MeshPhysicalMaterial({color:'#f5ffff',transparent:true,opacity:.29,roughness:.1,metalness:0,clearcoat:1,side:T.DoubleSide,depthWrite:false}));glass.position.y=30;glass.castShadow=true;g.add(glass);
   const fill=new T.Mesh(new T.CylinderGeometry(20,17,37,24),new T.MeshStandardMaterial({color:this.colors[i],roughness:.28,metalness:.65,bumpMap:this.heapTexture,bumpScale:.8,envMapIntensity:1.2}));fill.position.y=27;g.add(fill);g.userData.fill=fill;
   const rim=new T.Mesh(new T.TorusGeometry(23,1.1,8,24),new T.MeshStandardMaterial({color:'#ffffff',roughness:.12,metalness:.7}));rim.rotation.x=Math.PI/2;rim.position.y=59;g.add(rim);g.userData.home=g.position.clone();g.userData.homeRotation=g.quaternion.clone();this.jars.push(g);
  }
 }
 makeTweezers(){
  this.tweezers=new T.Group();this.paperGroup.add(this.tweezers);this.tweezers.visible=false;
  const mat=new T.MeshStandardMaterial({color:'#b8c0c1',roughness:.2,metalness:.95});for(let side of [-1,1]){const arm=new T.Mesh(new T.BoxGeometry(4,130,4),mat);arm.position.set(side*5,-60,25);arm.rotation.z=side*.075;arm.rotation.x=.16;arm.castShadow=true;this.tweezers.add(arm)}
 }
 makeCollector(){
  this.boxGroup=new T.Group();this.boxGroup.position.set(0,TRAY.centerY,0);this.boxGroup.visible=false;this.scene.add(this.boxGroup);this.boxMotion=0;this.collectorBox={...TRAY};this.collectedCount=0;this.trayBins=new Uint16Array(28*22);
  const shell=new T.MeshStandardMaterial({color:'#c6cdbf',roughness:.42,metalness:.25}),dark=new T.MeshStandardMaterial({color:'#343e35',roughness:.8});
  const bottom=new T.Mesh(new T.BoxGeometry(240,192,8),shell);bottom.castShadow=true;this.boxGroup.add(bottom);
  const floor=new T.Mesh(new T.PlaneGeometry(224,176),dark);floor.position.z=4.1;this.boxGroup.add(floor);
  for(const side of [-1,1]){const wall=new T.Mesh(new T.BoxGeometry(8,192,63),shell);wall.position.set(side*116,0,31.5);wall.castShadow=true;this.boxGroup.add(wall);}
  const back=new T.Mesh(new T.BoxGeometry(224,8,63),shell);back.position.set(0,92,31.5);this.boxGroup.add(back);
  const front=new T.Mesh(new T.BoxGeometry(224,5,51),new T.MeshPhysicalMaterial({color:'#e5ebdf',transparent:true,opacity:.38,roughness:.2,metalness:.1,depthWrite:false}));front.position.set(0,-92,25.5);this.boxGroup.add(front);
  for(const x of [-96,96])for(const y of [-70,70]){const foot=new T.Mesh(new T.BoxGeometry(18,18,4),dark);foot.position.set(x,y,-6);this.boxGroup.add(foot);}
  this.collected=this.makeGrains(30000);this.paperGroup.remove(this.collected);this.boxGroup.add(this.collected);
 }
 makeHands(){
  this.hands=[];const skin=new T.MeshStandardMaterial({color:'#d9ac8e',roughness:.85}),nail=new T.MeshStandardMaterial({color:'#f0cec0',roughness:.42});
  for(const side of [-1,1]){
   const hand=new T.Group();hand.visible=false;this.scene.add(hand);
   const palm=new T.Mesh(new T.SphereGeometry(29,16,10),skin);palm.scale.set(1.1,1.2,.58);palm.position.set(side*34,-15,-4);hand.add(palm);
   for(const [y,z,r,length] of [[8,12,10,31],[-4,-5,8,37]]){const finger=new T.Mesh(new T.CapsuleGeometry(r,length,4,10),skin);finger.rotation.z=Math.PI/2;finger.position.set(side*13,y,z);finger.castShadow=true;hand.add(finger);}
   const tip=new T.Mesh(new T.SphereGeometry(8,12,8),nail);tip.scale.set(1.05,.65,.18);tip.position.set(side*-3,8,21);hand.add(tip);this.hands.push(hand);
  }
 }
 makeGlints(){
  const map=canvasTexture((c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'#fffef5ff');g.addColorStop(.08,'#fff3cbaa');g.addColorStop(.4,'#ffe9b922');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,s,s);c.strokeStyle='#fff9e9cc';c.lineWidth=1;for(let i=0;i<4;i++){const a=i*Math.PI/2;c.beginPath();c.moveTo(s/2,s/2);c.lineTo(s/2+Math.cos(a)*s*.32,s/2+Math.sin(a)*s*.32);c.stroke()}},64);
  this.glints=[];for(let i=0;i<28;i++){const sp=new T.Sprite(new T.SpriteMaterial({map,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.visible=false;this.paperGroup.add(sp);this.glints.push(sp)}
 }
 makeHint(){const map=canvasTexture((c,s)=>{c.strokeStyle='#ffffee';c.lineWidth=5;c.beginPath();c.arc(s/2,s/2,48,0,TAU);c.stroke();c.fillStyle='#fffef0';c.beginPath();c.arc(s/2,s/2,7,0,TAU);c.fill()},256);const sp=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthTest:false}));sp.scale.set(90,90,1);return sp}
 applySettings(settings){
  const old=this.settings;this.settings={...settings};
  const ratio=Math.max(.5,Math.min(2.75,this.baseDpr*settings.renderScale));this.renderer.setPixelRatio(ratio);
  const shadowSize={off:0,low:512,medium:1024,high:1536}[settings.shadow];
  this.renderer.shadowMap.enabled=shadowSize>0;this.key.castShadow=shadowSize>0;
  if(shadowSize&&this.key.shadow.mapSize.x!==shadowSize){this.key.shadow.map?.dispose();this.key.shadow.map=null;this.key.shadow.mapSize.set(shadowSize,shadowSize);}
  this.key.shadow.needsUpdate=true;
  this.scene.environmentIntensity=settings.reflections?.55:0;
  this.grainMaterial.envMapIntensity=settings.reflections?.5:0;this.grainMaterial.metalness=settings.reflections?.95:.85;this.grainMaterial.roughness=settings.sparkles?.43:.6;
  this.heapMat.envMapIntensity=settings.reflections?.25:0;this.coatUniforms.uSparkle.value=settings.sparkles?1:0;
  for(const shader of this.shaders)shader.uniforms.uSparkEnabled.value=settings.sparkles?1:0;
  if(old?.shadow!==settings.shadow)this.scene.traverse(o=>{if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.needsUpdate=true;}});
  for(const sp of this.glints)if(!settings.sparkles)sp.visible=false;
  this.resize();
 }
 resize(){
  const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;
  this.renderer.setSize(w,h,false);this.camera.aspect=w/h;
  const t=Math.tan(35*Math.PI/360),dist=Math.max(1180/(2*t),650/(2*t*this.camera.aspect));
  this.camera.position.set(0,-dist*.18,dist);this.camera.lookAt(0,-35,20);this.camera.updateProjectionMatrix();
 }
 metrics(){const info=this.renderer.info;return{width:this.canvas.width,height:this.canvas.height,draws:info.render.calls,triangles:info.render.triangles,visible:this.current.count+this.spill.count+(this.boxGroup.visible?this.collected.count:0)};}
 posePour(pour){
  const jar=this.jars[this.activeColor%6];if(!jar)return;
  if(!pour){jar.position.copy(jar.userData.home);jar.quaternion.copy(jar.userData.homeRotation);jar.userData.fill.scale.y=1;jar.userData.fill.position.y=27;return;}
  const t=pour.elapsed,travel=smooth(Math.min(1,t/.34)),back=smooth(Math.max(0,(t-1.32)/.33)),weight=travel*(1-back);
  this.paperGroup.updateMatrixWorld(true);
  const destination=this.paperGroup.localToWorld(new T.Vector3(pour.x-300,400-pour.y+56,176));
  jar.position.copy(jar.userData.home).lerp(destination,weight);
  const tilted=new T.Quaternion().setFromEuler(new T.Euler(Math.PI+.24,0,this.paperGroup.rotation.z));
  jar.quaternion.copy(jar.userData.homeRotation).slerp(tilted,weight);
  const empty=1-Math.min(1,Math.max(0,(t-.48)/.82))*.86;
  jar.userData.fill.scale.y=1+(empty-1)*weight;jar.userData.fill.position.y=8.5+18.5*jar.userData.fill.scale.y;
  jar.updateMatrixWorld(true);
 }
 pourOrigin(){
  const jar=this.jars[this.activeColor%6],mouth=jar.localToWorld(new T.Vector3(0,59,17));
  this.paperGroup.worldToLocal(mouth);return{x:mouth.x+300,y:400-mouth.y,z:mouth.z-3};
 }
 mapPointer(e){const r=this.canvas.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.mouse,this.camera);const plane=new T.Plane(new T.Vector3(0,0,1),-3);if(!this.ray.ray.intersectPlane(plane,this.hit))return{x:300,y:400};this.paperGroup.worldToLocal(this.hit);return{x:this.hit.x+300,y:400-this.hit.y}}
 setStage(index){this.updateBend(0);this.heapGeo.attributes.heapAmount.array.fill(0);this.current.visible=true;this.activeColor=index;this.current.count=0;this.currentInitialized=0;this.heapMat.color.set(this.colors[index]);this.tuftMat.color.set('#795235');this.heap.visible=true;this.hint.visible=true;this.jars[index%6].userData.fill.material.color.set(this.colors[index]);}
 initInstance(mesh,i,seed,color){
  const mat=new T.Matrix4(),q=new T.Quaternion().setFromEuler(new T.Euler((seed*17%1-.5)*1.3,(seed*31%1-.5)*1.3,seed*79)),scale=1.15+(seed*197%1)*.9;
  mat.compose(new T.Vector3(0,0,-1000),q,new T.Vector3(scale,scale,scale));mesh.instanceMatrix.array.set(mat.elements,i*16);
  const c=new T.Color(color),v=.60+(seed*47%1)*.7;c.multiplyScalar(v);if(seed*127%1>.965)c.lerp(new T.Color('#c2c8da'),.65);mesh.instanceColor.array.set([c.r,c.g,c.b],i*3);
 }
 updateGrains(sand){
  const a=this.current.instanceMatrix.array,c=this.current.instanceColor.array,seeds=this.current.geometry.attributes.flakeSeed,color=new T.Color(this.colors[this.activeColor]);let out=0;
  for(let i=0;i<sand.count;i++){
   if(sand.state[i]===BOUND||sand.state[i]===LOST)continue;
   const j=out*16,seed=sand.seed[i],angle=seed*79,cs=Math.cos(angle),sn=Math.sin(angle),scale=1.5+(seed*197%1)*1.1;
   const point=bentPoint(sand.x[i]-300,400-sand.y[i],3+sand.z[i],this.bend,this.pitch);
   a[j]=cs*scale;a[j+1]=sn*scale;a[j+2]=(seed*17%1-.5)*(sand.pressed[i]?.3:1.2)*scale;a[j+3]=0;
   a[j+4]=-sn*scale;a[j+5]=cs*scale;a[j+6]=(seed*31%1-.5)*(sand.pressed[i]?.3:1.2)*scale;a[j+7]=0;
   a[j+8]=0;a[j+9]=0;a[j+10]=scale;a[j+11]=0;a[j+12]=point.x;a[j+13]=point.y;a[j+14]=point.z;a[j+15]=1;
   const light=.7+(seed*47%1)*.5;c[out*3]=color.r*light;c[out*3+1]=color.g*light;c[out*3+2]=color.b*light;seeds.setX(out,seed);out++;
  }
  this.current.count=out;this.current.instanceMatrix.needsUpdate=true;this.current.instanceColor.needsUpdate=true;seeds.needsUpdate=true;
 }
 updateHeap(sand,dt=1/60){
  const p=this.heapGeo.attributes.position,cols=COLS/2,rows=ROWS/2;
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
   const x=Math.min(col*2,COLS-1),y=Math.min(row*2,ROWS-1),k=y*COLS+x;
   const h=(sand.moundHeight[k]+sand.moundHeight[y*COLS+Math.max(x-1,0)]+sand.moundHeight[Math.max(y-1,0)*COLS+x]+sand.moundHeight[Math.max(y-1,0)*COLS+Math.max(x-1,0)])*.25;
   const vertex=row*(cols+1)+col,old=this.heapGeo.attributes.heapAmount.getX(vertex),height=h>0?old+(h*.8-old)*Math.min(1,dt*30):0;
   this.heapGeo.attributes.heapAmount.setX(vertex,height);
   const q=bentPoint(col/cols*W-300,400-row/rows*H,3+height,this.bend,this.pitch);p.setXYZ(vertex,q.x,q.y,q.z);
  }
  p.needsUpdate=true;this.heapGeo.attributes.heapAmount.needsUpdate=true;if(this.renderTick++%4===0)this.heapGeo.computeVertexNormals();
 }
 updateBend(amount,pitch=amount*.58){
  if(amount<=1e-6)amount=0;
  if(pitch<=1e-6)pitch=0;
  if(amount===this.bend&&pitch===(this.pitch||0))return;
  this.bend=amount;this.pitch=pitch;
  for(const [mesh,base] of [[this.paper,this.paperBase],[this.edge,this.edgeBase]]){
   const p=mesh.geometry.attributes.position;
   for(let i=0;i<p.count;i++){const q=bentPoint(base[i*3],base[i*3+1],base[i*3+2],amount,pitch);p.setXYZ(i,q.x,q.y,q.z);}
   p.needsUpdate=true;mesh.geometry.computeVertexNormals();
  }
 }
 setCoatMask(canvas){this.coatMask.image=canvas;this.coatMask.needsUpdate=true;}
 preserve(sand){this.collectSpill(sand);}
 collectSpill(sand,outsideOnly=false){
  this.paperGroup.updateMatrixWorld(true);const color=new T.Color(this.colors[this.activeColor]);
  for(let i=0;i<sand.count;i++)if(sand.state[i]!==BOUND&&sand.state[i]!==LOST&&this.spills.length<30000){
   if(outsideOnly&&(sand.state[i]!==FREE||sand.cell(sand.x[i],sand.y[i])>=0))continue;
   const q=bentPoint(sand.x[i]-300,400-(this.draining?Math.min(800,sand.y[i]):sand.y[i]),3+sand.z[i],this.bend,this.pitch),v=this.paperGroup.localToWorld(new T.Vector3(q.x,q.y,q.z));
   const speed=this.draining?surfaceVelocity(sand.x[i]-300,sand.vx[i],Math.max(180,sand.vy[i]),this.bend,this.pitch):{x:sand.vx[i],y:-sand.vy[i],z:Math.min(-15,sand.vz[i])};
   const velocity=new T.Vector3(speed.x,speed.y,speed.z).applyQuaternion(this.paperGroup.quaternion);
   this.spills.push({x:v.x,y:v.y,z:v.z,vx:velocity.x,vy:velocity.y,vz:velocity.z,seed:sand.seed[i],color});sand.state[i]=LOST;sand.lost++;
  }
 }
 beginCleanup(){this.draining=true;this.collectedCount=0;this.collected.count=0;this.trayBins.fill(0);}
 updateCollector(phase,dt){
  this.draining=phase==='shake';this.boxMotion=Math.max(0,Math.min(1,this.boxMotion+(this.draining?1:-1)*dt*2.8));
  this.boxGroup.visible=this.boxMotion>0;this.boxGroup.position.y=TRAY.centerY-(1-smooth(this.boxMotion))*360;
  this.collectorBox={...TRAY,centerY:this.boxGroup.position.y};
  for(let side=0;side<2;side++){
   const hand=this.hands[side];hand.visible=this.draining;const x=side?300:-300,q=bentPoint(x,0,5,this.bend,this.pitch);
   hand.position.set(q.x+(side?8:-8),q.y,q.z);hand.rotation.y=(side?-1:1)*this.bend*.7;
  }
 }
 catchGrain(p){
  if(this.collectedCount>=30000)return;
  const col=Math.max(0,Math.min(27,Math.floor((p.x+TRAY.halfWidth)/(TRAY.halfWidth*2)*28))),row=Math.max(0,Math.min(21,Math.floor((p.y-this.collectorBox.centerY+TRAY.halfDepth)/(TRAY.halfDepth*2)*22)));
  let chosen=row*28+col,score=this.trayBins[chosen]*.32;
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const x=col+dx,y=row+dy;if(x<0||x>=28||y<0||y>=22)continue;const k=y*28+x,cost=this.trayBins[k]*.32+Math.hypot(dx,dy)*1.3;if(cost<score){chosen=k;score=cost;}}
  const lowest=this.trayBins[chosen];
  const x=(chosen%28+.2+(p.seed*31%1)*.6)/28*TRAY.halfWidth*2-TRAY.halfWidth,y=(Math.floor(chosen/28)+.2+(p.seed*47%1)*.6)/22*TRAY.halfDepth*2-TRAY.halfDepth;
  const object=this.spillObject;object.position.set(x,y,TRAY.bottom+Math.min(42,lowest*.32));object.rotation.set(.05,.03,p.seed*79);object.scale.set(2.1,2.1,.65);object.updateMatrix();
  const i=this.collectedCount++;this.collected.setMatrixAt(i,object.matrix);this.collected.setColorAt(i,p.color);this.collected.geometry.attributes.flakeSeed.setX(i,p.seed);this.trayBins[chosen]++;
 }
 updateSpill(dt){
  let out=0;const object=this.spillObject,projected=new T.Vector3();
  for(const p of this.spills){
   const caught=stepFalling(p,dt,this.boxMotion>.95?this.collectorBox:NO_BOX);
   if(caught){this.catchGrain(p);continue;}
   projected.set(p.x,p.y,p.z).project(this.camera);
   if(projected.y < -1.15 || Math.abs(projected.x)>1.3 || projected.z>1)continue;
   object.position.set(p.x,p.y,p.z);object.rotation.set(.2,.1,p.seed*79);object.scale.setScalar(1.8+p.seed);object.updateMatrix();
   this.spill.setMatrixAt(out,object.matrix);this.spill.setColorAt(out,p.color);this.spills[out++]=p;
  }
  this.spills.length=out;this.spill.count=out;this.spill.instanceMatrix.needsUpdate=true;this.spill.instanceColor.needsUpdate=true;
  this.collected.count=this.collectedCount;this.collected.instanceMatrix.needsUpdate=true;this.collected.instanceColor.needsUpdate=true;this.collected.geometry.attributes.flakeSeed.needsUpdate=true;
 }
 reset(){this.savedCount=0;this.current.count=0;this.spills.length=0;this.spill.count=0;this.currentInitialized=0;this.collectedCount=0;this.collected.count=0;this.boxMotion=0;this.boxGroup.visible=false;this.updateBend(0);}
 setPeelPiece(image,piece){
  this.peelPiece=piece;this.peelAnchor=piece.grip;
  const {w,h}=piece.bounds,step=this.settings.profile==='economy'?14:10;
  this.peelSegments={x:Math.max(4,Math.ceil(w/step)),y:Math.max(4,Math.ceil(h/step))};
  this.peelGeo.dispose();this.peelGeo=new T.PlaneGeometry(w,h,this.peelSegments.x,this.peelSegments.y);this.peelSheet.geometry=this.peelGeo;
  this.peelSheet.material.map?.dispose();this.peelSheet.material.map=new T.CanvasTexture(image);this.peelSheet.material.map.colorSpace=T.SRGBColorSpace;this.peelSheet.material.color.set('#ffffff');this.peelSheet.material.needsUpdate=true;this.peelProgress(0);
 }
 peelProgress(progress){
  this.peelValue=progress;if(!this.peelPiece)return;
  this.peelSheet.visible=progress>.12&&progress<1;const p=this.peelGeo.attributes.position,{x:nx,y:ny}=this.peelSegments,b=this.peelPiece.bounds;
  for(let row=0;row<=ny;row++)for(let col=0;col<=nx;col++){
   const q=peelPoint(this.peelPiece,b.x+col/nx*b.w,b.y+row/ny*b.h,progress);p.setXYZ(row*(nx+1)+col,q.x,q.y,q.z);
  }
  p.needsUpdate=true;this.peelGeo.computeVertexNormals();
 }
 paperChanged(){this.paperTexture.needsUpdate=true}
 render(sand,{time,dt,phase,down,pointer,peeled,pour,shakeProgress=0,finished=false}){
  this.time=time;const pose=drainPose(shakeProgress);this.updateBend(pose.bend,pose.pitch);this.updateCollector(phase,dt);this.coatUniforms.uTime.value=time*.001;this.updateGrains(sand);this.updateSpill(dt);
  const showHeap=this.settings.relief&&!finished&&phase!=='shake'&&sand.freshCount>0;
  this.heap.visible=showHeap;if(showHeap)this.updateHeap(sand,dt);
  if(this.settings.movingLight){
   this.key.position.x+=((-300+(pointer.x-300)*.4+Math.sin(time*.00023)*50)-this.key.position.x)*.045;
   this.key.position.y+=((340-(pointer.y-400)*.25)-this.key.position.y)*.045;
  }
  this.sparkLight.set(this.key.position.x*.0015,this.key.position.y*.0015,1).normalize();
  this.paperGroup.rotation.x=0;this.paperGroup.position.z=0;
  this.paperGroup.updateMatrixWorld(true);
  this.brush.visible=phase==='brush'&&pointer.visible&&!finished;this.tweezers.visible=phase==='rolling';this.hint.visible=phase==='peel';
  if(phase==='peel'){this.hint.position.set(this.peelAnchor.x-300,400-this.peelAnchor.y,12);this.hint.material.opacity=.65+.25*Math.sin(time*.004);}
  if(phase==='rolling'&&this.peelPiece){
   const progress=this.peelValue||0,q=peelPoint(this.peelPiece,this.peelAnchor.x,this.peelAnchor.y,progress),approach=1-smooth(progress/.17);
   const angle=Math.atan2(-this.peelPiece.axis.y,this.peelPiece.axis.x)-Math.PI/2;
   this.tweezers.position.lerp(new T.Vector3(q.x+Math.sin(angle)*4+approach*110,q.y-Math.cos(angle)*4+approach*90,q.z-35+approach*110),Math.min(1,dt*18));this.tweezers.rotation.z=angle;
  }
  const rate=Math.min(1,dt*35);this.brushPoint.x+=(pointer.x-this.brushPoint.x)*rate;this.brushPoint.y+=(pointer.y-this.brushPoint.y)*rate;
  const brushCell=sand.cell(pointer.x,pointer.y),brushHeight=brushCell<0?0:sand.height[brushCell];
  this.brush.position.set(this.brushPoint.x-300,400-this.brushPoint.y,down?3+Math.min(brushHeight*.2,14):35);this.brush.rotation.z=.65;
  this.tuft.scale.set(1+(down?.08:0),down?.83:1,1);this.bristles.scale.y=down?1.14:1;
  this.posePour(pour);
  const sampleCount=this.settings.sparkles&&!finished?Math.min(sand.count,28):0;
  for(let j=0;j<28;j++){
   const sp=this.glints[j],i=sand.count?Math.floor((j*7919+3571)%sand.count):0;
   if(j>=sampleCount||sand.state[i]===LOST||sand.state[i]===AIR){sp.visible=false;continue;}
   const flash=Math.pow(Math.max(0,Math.sin(time*.0015+sand.seed[i]*300+this.sparkLight.x*8+this.sparkLight.y*5)),28);
   const k=sand.cell(sand.x[i],sand.y[i]);if(flash<.1||(sand.state[i]===FREE&&k>=0&&sand.z[i]<sand.height[k]*.73)){sp.visible=false;continue;}
   sp.visible=true;sp.position.set(sand.x[i]-300,400-sand.y[i],sand.z[i]+4);sp.scale.setScalar(8+flash*7);sp.material.opacity=flash*.8;
  }
  this.renderer.render(this.scene,this.camera);
 }
 capture(){this.renderer.render(this.scene,this.camera);return this.canvas.toDataURL('image/png')}
}
