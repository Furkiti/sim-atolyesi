import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS,ROWS} from './sand.js';
const TAU=Math.PI*2;
function canvasTexture(draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function noiseTexture(){return canvasTexture((c,s)=>{c.fillStyle='#b9bcba';c.fillRect(0,0,s,s);for(let i=0;i<55000;i++){const v=150+Math.random()*85;c.fillStyle=`rgba(${v},${v+1},${v+3},.16)`;c.fillRect(Math.random()*s,Math.random()*s,.5+Math.random()*2,1)}},512)}
function flakeGeometry(){
 const geo=new T.BufferGeometry(),v=[];const n=5;
 for(let j=0;j<n;j++){const a=j/n*TAU,b=(j+1)/n*TAU;v.push(0,0,.12,Math.cos(a),Math.sin(a),0,Math.cos(b),Math.sin(b),0);}
 geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.computeVertexNormals();return geo;
}
export class AtelierScene {
 constructor(canvas,paperCanvas,colors){
  this.canvas=canvas;this.colors=colors;this.activeColor=0;this.time=0;this.renderTick=0;this.mouse=new T.Vector2();this.ray=new T.Raycaster();this.hit=new T.Vector3();
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
  this.scene=new T.Scene();this.scene.background=new T.Color('#c9ccca');this.camera=new T.PerspectiveCamera(35,1,1,5000);
  const pmrem=new T.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
  this.scene.environmentIntensity=.55;
  this.scene.add(new T.HemisphereLight('#fff7dd','#505668',1.5));
  this.key=new T.DirectionalLight('#fff6e4',2.8);this.key.position.set(-300,340,750);this.key.castShadow=true;
  this.key.shadow.mapSize.set(1536,1536);Object.assign(this.key.shadow.camera,{left:-600,right:600,top:700,bottom:-650,near:1,far:1800});this.key.shadow.bias=-.0004;this.key.shadow.normalBias=.3;this.key.shadow.radius=3;this.scene.add(this.key);
  this.fill=new T.DirectionalLight('#b9d4ff',.8);this.fill.position.set(500,-200,400);this.scene.add(this.fill);
  const floorTex=noiseTexture();floorTex.wrapS=floorTex.wrapT=T.RepeatWrapping;floorTex.repeat.set(4,4);
  const floor=new T.Mesh(new T.PlaneGeometry(2400,2400),new T.MeshStandardMaterial({map:floorTex,bumpMap:floorTex,bumpScale:.8,roughness:.94,color:'#d9ddda'}));floor.position.z=-8;floor.receiveShadow=true;this.scene.add(floor);
  this.paperGroup=new T.Group();this.paperGroup.rotation.z=.038;this.scene.add(this.paperGroup);
  const edge=new T.Mesh(new T.BoxGeometry(W,H,3.2),new T.MeshStandardMaterial({color:'#d6c68b',roughness:.85}));edge.castShadow=true;edge.receiveShadow=true;this.paperGroup.add(edge);
  this.paperTexture=new T.CanvasTexture(paperCanvas);this.paperTexture.colorSpace=T.SRGBColorSpace;this.paperTexture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
  const surfaceGeo=new T.PlaneGeometry(W,H,30,40),pp=surfaceGeo.attributes.position;
  for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),edge=Math.max(Math.abs(x)/300,Math.abs(y)/400);pp.setZ(i,2.1+Math.pow(edge,14)*1.5+Math.sin(x*.013+y*.006)*.12)}surfaceGeo.computeVertexNormals();
  this.paper=new T.Mesh(surfaceGeo,new T.MeshStandardMaterial({map:this.paperTexture,color:'#f2d782',roughness:.93}));this.paper.receiveShadow=true;this.paperGroup.add(this.paper);
  this.shaders=[];this.sparkLight=new T.Vector3(-.35,.45,1);
  this.grainMaterial=new T.MeshStandardMaterial({color:'#ffffff',metalness:.72,roughness:.19,envMapIntensity:1.85,side:T.DoubleSide});
  this.grainMaterial.onBeforeCompile=shader=>{
   shader.uniforms.uSparkLight={value:this.sparkLight};shader.vertexShader='attribute float flakeSeed; varying float vFlakeSeed;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFlakeSeed=flakeSeed;');
   shader.fragmentShader='uniform vec3 uSparkLight; varying float vFlakeSeed;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    vec3 halfLight=normalize(uSparkLight+normalize(vViewPosition));
    float glint=pow(max(dot(normal,halfLight),0.0),140.0);
    gl_FragColor.rgb+=glint*1.8*vec3(1.0,0.95,0.82);`);
   this.shaders.push(shader);
  };
  this.current=this.makeGrains(76000);this.saved=this.makeGrains(145000);this.savedCount=0;this.currentInitialized=0;this.flattened=new Uint8Array(76000);
  this.heapTexture=canvasTexture((c,s)=>{c.fillStyle='#898989';c.fillRect(0,0,s,s);for(let i=0;i<18000;i++){const g=Math.random()*255|0;c.fillStyle=`rgb(${g},${g},${g})`;c.fillRect(Math.random()*s,Math.random()*s,1,1)}},128);this.heapTexture.wrapS=this.heapTexture.wrapT=T.RepeatWrapping;this.heapTexture.repeat.set(11,15);
  this.heapGeo=new T.PlaneGeometry(W,H,COLS,ROWS);
  this.heapMat=new T.MeshStandardMaterial({color:colors[0],roughness:.43,metalness:.55,bumpMap:this.heapTexture,bumpScale:.7,envMapIntensity:.8});
  const clipHeap=shader=>{shader.vertexShader='varying float vHeap;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeap=position.z-3.0;');shader.fragmentShader='varying float vHeap;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() {\nif(vHeap<.7) discard;');};
  this.heapMat.onBeforeCompile=clipHeap;this.heap=new T.Mesh(this.heapGeo,this.heapMat);this.heap.frustumCulled=false;this.heap.receiveShadow=true;this.heap.castShadow=true;this.heap.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});this.heap.customDepthMaterial.onBeforeCompile=clipHeap;this.paperGroup.add(this.heap);
  this.peelGeo=new T.PlaneGeometry(W,H,32,48);
  this.peelSheet=new T.Mesh(this.peelGeo,new T.MeshStandardMaterial({color:'#fff2b2',roughness:.8,transparent:true,alphaTest:.08,side:T.DoubleSide}));
  this.peelSheet.castShadow=true;this.peelSheet.visible=false;this.paperGroup.add(this.peelSheet);
  this.makeBrush();this.makeJar();this.makeTweezers();this.makeGlints();this.makeJars();this.hint=this.makeHint();this.paperGroup.add(this.hint);
  this.desiredBrush={x:130,y:250,angle:-.72,contact:false,visible:false};this.brushPoint={x:130,y:250};this.pourPoint={x:140,y:180};this.autoPour=false;
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
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
 makeJar(){
  this.pourJar=new T.Group();this.paperGroup.add(this.pourJar);this.pourJar.visible=false;
  const glass=new T.MeshPhysicalMaterial({color:'#f5ffff',transparent:true,opacity:.24,roughness:.08,metalness:0,clearcoat:1,side:T.DoubleSide,depthWrite:false});
  const body=new T.Mesh(new T.CylinderGeometry(25,22,73,28,1,true),glass);body.castShadow=true;this.pourJar.add(body);
  this.jarFill=new T.Mesh(new T.CylinderGeometry(22,20,47,24),new T.MeshStandardMaterial({color:this.colors[0],roughness:.25,metalness:.7,bumpMap:this.heapTexture,bumpScale:.5}));this.jarFill.position.y=-11;this.pourJar.add(this.jarFill);
  const rim=new T.Mesh(new T.TorusGeometry(25,1.8,8,36),new T.MeshStandardMaterial({color:'#eeeeea',roughness:.12,metalness:.6}));rim.rotation.x=Math.PI/2;rim.position.y=36;this.pourJar.add(rim);this.pourJar.rotation.set(.8,0,-.9);
 }
 makeJars(){
  this.jars=[];
  const stand=new T.Mesh(new T.BoxGeometry(470,65,9),new T.MeshStandardMaterial({color:'#41464b',metalness:.25,roughness:.35}));stand.position.set(0,484,-2);stand.castShadow=true;this.scene.add(stand);
  for(let i=0;i<6;i++){
   const g=new T.Group();g.position.set((i-2.5)*72,484,4);g.rotation.x=Math.PI/2;this.scene.add(g);
   const glass=new T.Mesh(new T.CylinderGeometry(23,19,58,24,1,true),new T.MeshPhysicalMaterial({color:'#f5ffff',transparent:true,opacity:.29,roughness:.1,metalness:0,clearcoat:1,side:T.DoubleSide,depthWrite:false}));glass.position.y=30;glass.castShadow=true;g.add(glass);
   const fill=new T.Mesh(new T.CylinderGeometry(20,17,37,24),new T.MeshStandardMaterial({color:this.colors[i],roughness:.28,metalness:.65,bumpMap:this.heapTexture,bumpScale:.8,envMapIntensity:1.2}));fill.position.y=27;g.add(fill);
   const rim=new T.Mesh(new T.TorusGeometry(23,1.1,8,24),new T.MeshStandardMaterial({color:'#ffffff',roughness:.12,metalness:.7}));rim.rotation.x=Math.PI/2;rim.position.y=59;g.add(rim);this.jars.push(g);
  }
 }
 makeTweezers(){
  this.tweezers=new T.Group();this.paperGroup.add(this.tweezers);this.tweezers.visible=false;
  const mat=new T.MeshStandardMaterial({color:'#b8c0c1',roughness:.2,metalness:.95});for(let side of [-1,1]){const arm=new T.Mesh(new T.BoxGeometry(4,130,4),mat);arm.position.set(side*5,-60,25);arm.rotation.z=side*.075;arm.rotation.x=.16;arm.castShadow=true;this.tweezers.add(arm)}
 }
 makeGlints(){
  const map=canvasTexture((c,s)=>{const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'#fffef5ff');g.addColorStop(.08,'#fff3cbaa');g.addColorStop(.4,'#ffe9b922');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,0,s,s);c.strokeStyle='#fff9e9cc';c.lineWidth=1;for(let i=0;i<4;i++){const a=i*Math.PI/2;c.beginPath();c.moveTo(s/2,s/2);c.lineTo(s/2+Math.cos(a)*s*.32,s/2+Math.sin(a)*s*.32);c.stroke()}},64);
  this.glints=[];for(let i=0;i<28;i++){const sp=new T.Sprite(new T.SpriteMaterial({map,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));sp.visible=false;this.paperGroup.add(sp);this.glints.push(sp)}
 }
 makeHint(){const map=canvasTexture((c,s)=>{c.strokeStyle='#ffffee';c.lineWidth=5;c.beginPath();c.arc(s/2,s/2,48,0,TAU);c.stroke();c.fillStyle='#fffef0';c.beginPath();c.arc(s/2,s/2,7,0,TAU);c.fill()},256);const sp=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthTest:false}));sp.scale.set(90,90,1);return sp}
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;const t=Math.tan(35*Math.PI/360),dist=Math.max(960/(2*t),700/(2*t*this.camera.aspect));this.camera.position.set(0,-dist*.28,dist);this.camera.lookAt(0,35,0);this.camera.updateProjectionMatrix()}
 mapPointer(e){const r=this.canvas.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.mouse,this.camera);const plane=new T.Plane(new T.Vector3(0,0,1),-3);if(!this.ray.ray.intersectPlane(plane,this.hit))return{x:300,y:400};this.paperGroup.worldToLocal(this.hit);return{x:this.hit.x+300,y:400-this.hit.y}}
 setStage(index){this.current.visible=true;this.activeColor=index;this.current.count=0;this.currentInitialized=0;this.heapMat.color.set(this.colors[index]);this.jarFill.material.color.set(this.colors[index]);this.tuftMat.color.set('#795235');this.heap.visible=true;this.hint.visible=true;}
 initInstance(mesh,i,seed,color){
  const mat=new T.Matrix4(),q=new T.Quaternion().setFromEuler(new T.Euler((seed*17%1-.5)*1.3,(seed*31%1-.5)*1.3,seed*79)),scale=1.15+(seed*197%1)*.9;
  mat.compose(new T.Vector3(0,0,-1000),q,new T.Vector3(scale,scale,scale));mesh.instanceMatrix.array.set(mat.elements,i*16);
  const c=new T.Color(color),v=.60+(seed*47%1)*.7;c.multiplyScalar(v);if(seed*127%1>.965)c.lerp(new T.Color('#c2c8da'),.65);mesh.instanceColor.array.set([c.r,c.g,c.b],i*3);
 }
 updateGrains(sand){
  for(let i=this.currentInitialized;i<sand.count;i++){this.initInstance(this.current,i,sand.seed[i],this.colors[this.activeColor]);this.flattened[i]=0;}
  if(sand.count!==this.currentInitialized){this.current.instanceColor.needsUpdate=true;this.currentInitialized=sand.count;}
  const a=this.current.instanceMatrix.array;
  for(let i=0;i<sand.count;i++){
   const j=i*16;
   // A flake lies flat on glue: a wider, thinner footprint, still represented
   // by that same particle. No brush-sized coverage mask is generated.
   if(sand.state[i]===BOUND&&!this.flattened[i]){
     for(const k of [0,1,2,4,5,6])a[j+k]*=1.7;
     for(const k of [8,9,10])a[j+k]*=.35;
     this.flattened[i]=1;
   }
   a[j+12]=sand.x[i]-300;a[j+13]=400-sand.y[i];a[j+14]=sand.state[i]===LOST?-1000:3+sand.z[i];}
  this.current.count=sand.count;this.current.instanceMatrix.needsUpdate=true;
 }
 updateHeap(sand){
  const p=this.heapGeo.attributes.position;
  for(let row=0;row<=ROWS;row++)for(let col=0;col<=COLS;col++){
   const x=Math.min(col,COLS-1),y=Math.min(row,ROWS-1),k=y*COLS+x;
   const h=(sand.height[k]+sand.height[y*COLS+Math.max(x-1,0)]+sand.height[Math.max(y-1,0)*COLS+x]+sand.height[Math.max(y-1,0)*COLS+Math.max(x-1,0)])*.25;
   p.setZ(row*(COLS+1)+col,3+h*.80);
  }
  p.needsUpdate=true;this.heapGeo.computeVertexNormals();
 }
 preserve(sand){
  for(let i=0;i<sand.count;i++)if(sand.state[i]===BOUND&&this.savedCount<145000){const j=this.savedCount++;this.saved.instanceMatrix.array.set(this.current.instanceMatrix.array.subarray(i*16,i*16+16),j*16);this.saved.instanceColor.array.set(this.current.instanceColor.array.subarray(i*3,i*3+3),j*3);}
  this.saved.count=this.savedCount;this.saved.instanceMatrix.needsUpdate=true;this.saved.instanceColor.needsUpdate=true;
 }
 reset(){this.savedCount=0;this.saved.count=0;this.current.count=0;this.currentInitialized=0;}
 setPeelMask(image){
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(image,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff0ae';x.fillRect(0,0,W,H);
  this.peelSheet.material.map?.dispose();this.peelSheet.material.map=new T.CanvasTexture(c);this.peelSheet.material.map.colorSpace=T.SRGBColorSpace;this.peelSheet.material.needsUpdate=true;this.peelProgress(0);
 }
 peelProgress(progress){
  this.peelSheet.visible=progress>0&&progress<1;const p=this.peelGeo.attributes.position;
  for(let row=0;row<=48;row++)for(let col=0;col<=32;col++){
   const i=row*33+col,x=col/32*W-W/2,y=row/48*H,d=Math.max(0,H*progress-y),bend=Math.min(d/130,Math.PI);
   p.setXYZ(i,x,400-y+Math.max(0,d-35)*.58,3.5+(1-Math.cos(bend))*55+Math.max(0,d-130)*.20);
  }
  p.needsUpdate=true;this.peelGeo.computeVertexNormals();
 }
 paperChanged(){this.paperTexture.needsUpdate=true}
 render(sand,{time,dt,tool,down,pointer,peeled,anchor,pour,shaking,lightInspection=false}){
  this.time=time;this.updateGrains(sand);if(this.renderTick++%2===0)this.updateHeap(sand);if(!Number.isFinite(this.renderTick))this.renderTick=0;
  this.key.position.x+=((-300+(pointer.x-300)*.40+Math.sin(time*.00023)*50)-this.key.position.x)*.045;
  this.key.position.y+=((340-(pointer.y-400)*.25)-this.key.position.y)*.045;
  this.sparkLight.set(this.key.position.x*.0015,this.key.position.y*.0015,1).normalize();
  const swing=shaking?Math.sin(time*.025)*.07:0;this.paperGroup.rotation.x+=(swing-this.paperGroup.rotation.x)*.25;
  this.brush.visible=tool==='brush'&&pointer.visible&&!lightInspection;this.tweezers.visible=tool==='peel'&&pointer.visible;this.pourJar.visible=!!pour;
  const rate=Math.min(1,dt*35);this.brushPoint.x+=(pointer.x-this.brushPoint.x)*rate;this.brushPoint.y+=(pointer.y-this.brushPoint.y)*rate;
  const brushCell=sand.cell(pointer.x,pointer.y),brushHeight=brushCell<0?0:sand.height[brushCell];this.brush.position.set(this.brushPoint.x-300,400-this.brushPoint.y,down?3+Math.min(brushHeight*.2,14):35);this.brush.rotation.z=.65;
  this.tuft.scale.set(1+(down?.08:0),down?.83:1,1);this.bristles.scale.y=down?1.14:1;
  this.tweezers.position.set(pointer.x-300,400-pointer.y,25);this.tweezers.rotation.z=-.65;
  if(pour){this.pourJar.position.set(pour.x-300+46,400-pour.y+25,145);this.pourJar.rotation.z=-.9+Math.sin(time*.008)*.035;}
  this.hint.visible=!peeled;this.hint.position.set(anchor[0]-300,400-anchor[1],8);this.hint.material.opacity=.65+Math.sin(time*.004)*.25;
  const sampleCount=Math.min(sand.count,28);
  for(let j=0;j<28;j++){
   const sp=this.glints[j],i=sand.count?Math.floor(((j*7919+3571)%sand.count)):0;
   if(j>=sampleCount||sand.state[i]===LOST||sand.state[i]===AIR){sp.visible=false;continue;}
   const flash=Math.pow(Math.max(0,Math.sin(time*.0015+sand.seed[i]*300+this.sparkLight.x*8+this.sparkLight.y*5)),28);
   const k=sand.cell(sand.x[i],sand.y[i]);if(flash<.1||(sand.state[i]===FREE&&k>=0&&sand.z[i]<sand.height[k]*.73)){sp.visible=false;continue;}
   sp.visible=true;sp.position.set(sand.x[i]-300,400-sand.y[i],sand.z[i]+4);sp.scale.setScalar(8+flash*7);sp.material.opacity=flash*.8;
  }
  for(let i=0;i<this.jars.length;i++)this.jars[i].position.z+=((i===this.activeColor?12:4)-this.jars[i].position.z)*.08;
  this.renderer.render(this.scene,this.camera);
 }
 capture(){return this.canvas.toDataURL('image/png')}
}
