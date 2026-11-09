import {startTable,stepTable,TABLE_Z} from './table-spill.js';
import {Recovery,startRecovery,stepRecovery,transferPacket} from './recovery.js';
import {RecoveryVisual} from './recovery-visual.js';
import {exitOpacity,FINISH_DUST_SCALE} from './spill-appearance.js';
const MAX_RENDER_GRAINS=128000;
const grainScale=settings=>settings?.controlMode==='hold'?(settings.holdGrainSize||1):(settings?.grainSize||1);
import {paperExit,exitVelocity} from './spill.js';
import * as T from 'three';
import {drainPose,bentPoint,surfaceVelocity,smooth} from './interaction.js';
import {peelFront,peelPoint} from './peel.js';
import {FUNNEL,stepFunnel} from './funnel.js';
import {paperLift} from './paper-motion.js';
import {completionLayout,completionEase,galleryCamera,GALLERY} from './completion.js';
import {entryZoomDistance,entryFrameOpacity,workOpacity,galleryOffset,entryProgress} from './exhibition.js';
import {BRUSHES} from './feel.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {AIR,FREE,BOUND,LOST,W,H,CELL,COLS,ROWS,MAX_HEAP_HEIGHT,MAX_GRAIN_HEIGHT} from './sand.js';
const TAU=Math.PI*2,NO_FUNNEL={...FUNNEL,radius:-1},JAR_SAMPLES=2200;
function canvasTexture(draw,size=256){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function noiseTexture(){return canvasTexture((c,s)=>{c.fillStyle='#b9bcba';c.fillRect(0,0,s,s);for(let i=0;i<55000;i++){const v=150+Math.random()*85;c.fillStyle=`rgba(${v},${v+1},${v+3},.16)`;c.fillRect(Math.random()*s,Math.random()*s,.5+Math.random()*2,1)}},512)}
function flakeGeometry(){
 const geo=new T.BufferGeometry(),v=[];const n=3;
 for(let j=0;j<n;j++){const a=j/n*TAU,b=(j+1)/n*TAU;v.push(0,0,.12,Math.cos(a),Math.sin(a),0,Math.cos(b),Math.sin(b),0);}
 geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.computeVertexNormals();return geo;
}
export class AtelierScene {
 constructor(canvas,paperCanvas,colors,settings){
  this.settings=settings;this.baseDpr=Math.min(devicePixelRatio||1,matchMedia('(pointer: coarse)').matches?1.4:2);
  this.finishClock=0;this.heroProgress=0;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  this.canvas=canvas;this.colors=colors;this.activeColor=0;this.time=0;this.renderTick=0;this.mouse=new T.Vector2();this.ray=new T.Raycaster();this.hit=new T.Vector3();this.localRay=new T.Ray();this.inversePaper=new T.Matrix4();
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(this.baseDpr*settings.renderScale);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;
  this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
  this.scene=new T.Scene();this.scene.background=new T.Color('#c9ccca');this.camera=new T.PerspectiveCamera(35,1,80,16000);
  const pmrem=new T.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
  this.scene.environmentIntensity=.55;
  this.scene.add(new T.HemisphereLight('#fff7dd','#505668',1.5));
  this.key=new T.DirectionalLight('#fff6e4',2.8);this.key.position.set(-300,340,750);this.key.castShadow=true;
  this.key.shadow.mapSize.set(1536,1536);Object.assign(this.key.shadow.camera,{left:-600,right:600,top:700,bottom:-650,near:1,far:1800});this.key.shadow.bias=-.00008;this.key.shadow.normalBias=.15;this.key.shadow.radius=3;this.scene.add(this.key);
  this.fill=new T.DirectionalLight('#b9d4ff',.8);this.fill.position.set(500,-200,400);this.scene.add(this.fill);
  const floorTex=noiseTexture();floorTex.wrapS=floorTex.wrapT=T.RepeatWrapping;floorTex.repeat.set(10,10);
  const floor=new T.Mesh(new T.PlaneGeometry(18000,6000),new T.MeshStandardMaterial({map:floorTex,bumpMap:floorTex,bumpScale:.8,roughness:.94,color:'#d9ddda',depthWrite:false}));floor.position.z=-8;floor.renderOrder=-20;floor.receiveShadow=true;this.scene.add(floor);this.floor=floor;this.floorRestColor=new T.Color('#d9ddda');this.galleryWallColor=new T.Color('#dfd7c7');
  this.paperGroup=new T.Group();this.paperGroup.rotation.z=.018;this.scene.add(this.paperGroup);
  const edge=new T.Mesh(new T.BoxGeometry(W,H,3.2,30,40,1),new T.MeshStandardMaterial({color:'#d6c68b',roughness:.85}));edge.castShadow=true;edge.receiveShadow=true;this.paperGroup.add(edge);this.edge=edge;this.edgeBase=edge.geometry.attributes.position.array.slice();
  this.paperTexture=new T.CanvasTexture(paperCanvas);this.paperTexture.colorSpace=T.SRGBColorSpace;this.paperTexture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());
  const surfaceGeo=new T.PlaneGeometry(W,H,30,40),pp=surfaceGeo.attributes.position;
  for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),edge=Math.max(Math.abs(x)/300,Math.abs(y)/400);pp.setZ(i,2.8+Math.pow(edge,14)*1.5+Math.sin(x*.013+y*.006)*.12)}surfaceGeo.computeVertexNormals();
  this.paper=new T.Mesh(surfaceGeo,new T.MeshBasicMaterial({map:this.paperTexture,color:'#ffffff',toneMapped:false}));this.paper.receiveShadow=true;this.paperGroup.add(this.paper);this.paperBase=pp.array.slice();this.bend=0;this.pitch=0;
  const perimeter=[];for(let i=0;i<30;i++)perimeter.push(new T.Vector3(-300+i*20,-400,4.8));for(let i=0;i<40;i++)perimeter.push(new T.Vector3(300,-400+i*20,4.8));for(let i=0;i<30;i++)perimeter.push(new T.Vector3(300-i*20,400,4.8));for(let i=0;i<40;i++)perimeter.push(new T.Vector3(-300,400-i*20,4.8));
  const outline=new T.BufferGeometry().setFromPoints(perimeter);this.outlineBase=outline.attributes.position.array.slice();
  this.paperOutline=new T.LineLoop(outline,new T.LineBasicMaterial({color:'#8a7950',transparent:true,opacity:.48}));this.paperGroup.add(this.paperOutline);
  this.contactData=new Uint8Array(COLS*ROWS*4);this.contactSeen=new Uint8Array(COLS*ROWS);this.contactTexture=new T.DataTexture(this.contactData,COLS,ROWS);this.contactTexture.magFilter=T.NearestFilter;this.contactTexture.minFilter=T.NearestFilter;this.contactTexture.needsUpdate=true;
  const noise=new Uint8Array(W*H*4);for(let i=0;i<W*H;i++){noise[i*4]=Math.random()*255;noise[i*4+1]=Math.random()>.988?90+Math.random()*165:0;noise[i*4+3]=255;}
  this.sparkleField=new T.DataTexture(noise,W,H);this.sparkleField.generateMipmaps=true;this.sparkleField.minFilter=T.LinearMipmapLinearFilter;this.sparkleField.magFilter=T.LinearFilter;this.sparkleField.needsUpdate=true;
  this.workUniform={value:1};this.workAlpha=1;this.coatUniforms={uTiltGrip:{value:settings.controlMode==='tilt'?1:0},uActiveAlpha:{value:1},uRadiant:{value:settings.posterShine==='radiant'?1:0},uSparkleField:{value:this.sparkleField},uContact:{value:this.contactTexture},uTime:{value:0},uSparkle:{value:settings.sparkles?1:0},uCoat:{value:null},uCelebrate:{value:0},uActiveMask:{value:null},uActiveGlitter:{value:null},uLineArt:{value:null}};
  this.paper.material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,this.coatUniforms);
   shader.fragmentShader='uniform sampler2D uSparkleField; uniform sampler2D uActiveMask; uniform sampler2D uActiveGlitter; uniform sampler2D uLineArt; uniform float uTiltGrip; uniform float uActiveAlpha; uniform float uRadiant; uniform float uCelebrate; uniform float uTime; uniform float uSparkle; uniform sampler2D uCoat; uniform sampler2D uContact;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    vec4 contactInk=texture2D(uContact,vec2(vMapUv.x,1.0-vMapUv.y));
    float activeMask=texture2D(uActiveMask,vMapUv).a;
    float liveCoat=activeMask*step(.5,contactInk.r)*uActiveAlpha;
    vec4 artLine=texture2D(uLineArt,vMapUv);
    vec3 livePigment=linearToOutputTexel(texture2D(uActiveGlitter,vMapUv)).rgb;
    livePigment=mix(livePigment,linearToOutputTexel(artLine).rgb,artLine.a*.96);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,livePigment,liveCoat);
    float sweep=pow(max(0.0,1.0-abs(vMapUv.x*.7+vMapUv.y-(mod(uTime*.18,2.8)-.5))/.06),2.0);
    gl_FragColor.rgb+=uCelebrate*uSparkle*max(texture2D(uCoat,vMapUv).a,liveCoat)*sweep*.035;
    vec2 cell=floor(vMapUv*vec2(600.0,800.0));
    vec2 field=texture2D(uSparkleField,vMapUv).rg;
    float rnd=field.r;
    float flicker=pow(max(0.0,sin(uTime*1.4+rnd*197.0)),32.0);
    float coat=max(texture2D(uCoat,vMapUv).a*(1.0-activeMask),liveCoat);
    gl_FragColor.rgb+=coat*uSparkle*field.g*flicker*.24;
    float shimmer=pow(max(0.0,sin(uTime*.83+rnd*173.0)),38.0);
    float lightPass=pow(max(0.0,cos((vMapUv.x*.6+vMapUv.y*.85-uTime*.11)*6.28318)),32.0);
    float breath=pow(max(0.0,sin(uTime*.69)),6.0);
    gl_FragColor.rgb+=coat*uSparkle*uRadiant*(field.g*shimmer*.9+lightPass*breath*(.035+field.g*.6))*vec3(1.0,.96,.83);
    vec4 contact=contactInk;
    float birth=floor(contact.g*255.0+.5)+floor(contact.b*255.0+.5)*256.0;
    float age=mod(uTime*60.0-birth+65536.0,65536.0);
    float seated=contact.r*(1.0-smoothstep(0.0,19.0,age))*coat*uSparkle;
    // Brief, faceted seating sheen, confined to newly coated mask pixels.
    gl_FragColor.rgb+=seated*(.035+step(.73,rnd)*.14)*vec3(1.0,.93,.76);
    float tack=liveCoat*uTiltGrip*(1.0-smoothstep(0.0,12.0,age));
    gl_FragColor.rgb+=tack*(.10+.29*step(.75,rnd))*vec3(1.0,.91,.69);`);
  };
  this.shaders=[];this.sparkLight=new T.Vector3(-.35,.45,1);
  this.grainMaterial=new T.MeshStandardMaterial({color:'#ffffff',metalness:.95,roughness:.43,envMapIntensity:.5,side:T.DoubleSide,alphaHash:true});
  this.grainMaterial.onBeforeCompile=shader=>{
   shader.uniforms.uWorkAlpha=this.workUniform;shader.uniforms.uSparkLight={value:this.sparkLight};shader.uniforms.uSparkEnabled={value:this.settings.sparkles?1:0};shader.vertexShader='attribute float flakeSeed; varying float vFlakeSeed;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFlakeSeed=flakeSeed;');
   shader.fragmentShader='uniform float uWorkAlpha; uniform float uSparkEnabled; uniform vec3 uSparkLight; varying float vFlakeSeed;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    // Preserve pigment under the strong studio lamps; only highlights bleach.
    vec3 pigment=linearToOutputTexel(vec4(diffuseColor.rgb,1.0)).rgb;
    gl_FragColor.rgb=mix(pigment,gl_FragColor.rgb,.28);
    vec3 halfLight=normalize(uSparkLight+normalize(vViewPosition));
    float glint=pow(max(dot(normal,halfLight),0.0),140.0);
    gl_FragColor.rgb+=uSparkEnabled*step(.975,vFlakeSeed)*glint*1.8*vec3(1.0,0.95,0.82);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphahash_fragment>','diffuseColor.a*=uWorkAlpha;\n#include <alphahash_fragment>');this.shaders.push(shader);
  };
  this.current=this.makeGrains(48000);
  // Bend only each flake's centre, exactly as the CPU path does. All triangles,
  // normals, pigment and sparkle remain unchanged; the GPU handles the curve.
  this.grainBendUniforms={uSurfaceBend:{value:0},uSurfacePitch:{value:0}};
  this.current.material=this.grainMaterial.clone();this.current.userData.gpuBend=true;
  this.current.material.customProgramCacheKey=()=> 'surface-grains-v20';
  this.current.material.onBeforeCompile=shader=>{
   this.grainMaterial.onBeforeCompile(shader);Object.assign(shader.uniforms,this.grainBendUniforms);
   shader.vertexShader=`uniform float uSurfaceBend; uniform float uSurfacePitch;
   vec3 surfaceOffset(vec3 p){
    if(p.y < -400.0 || (uSurfaceBend <= .000001 && uSurfacePitch <= .000001))return vec3(0.0);
    float curve=1.22*uSurfaceBend,r=curve>.000001?300.0/curve:0.0,theta=p.x/300.0*curve;
    float crossX=curve>.000001?sin(theta)*r:p.x,crossZ=curve>.000001?2.0*pow(sin(theta*.5),2.0)*r:0.0,along=p.y+400.0;
    return vec3(crossX,-400.0+along*cos(uSurfacePitch)-crossZ*sin(uSurfacePitch),p.z+110.0*uSurfaceBend+along*sin(uSurfacePitch)+crossZ*cos(uSurfacePitch))-p;
   }
`+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',T.ShaderChunk.project_vertex.replace('mvPosition = instanceMatrix * mvPosition;','mvPosition = instanceMatrix * mvPosition; mvPosition.xyz += surfaceOffset(instanceMatrix[3].xyz);'));
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',T.ShaderChunk.worldpos_vertex.replace('worldPosition = instanceMatrix * worldPosition;','worldPosition = instanceMatrix * worldPosition; worldPosition.xyz += surfaceOffset(instanceMatrix[3].xyz);'));
  };
  this.savedCount=0;this.currentInitialized=0;
  this.spill=this.makeGrains(48000);this.paperGroup.remove(this.spill);this.scene.add(this.spill);this.spill.material=this.grainMaterial.clone();this.spill.material.depthTest=true;this.spill.material.depthWrite=true;this.spill.material.transparent=false;
  this.spill.material.customProgramCacheKey=()=> 'soft-spill-v22';this.spill.material.onBeforeCompile=shader=>{
   this.grainMaterial.onBeforeCompile(shader);shader.vertexShader='attribute float grainOpacity; varying float vGrainOpacity;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGrainOpacity=grainOpacity;');
   shader.fragmentShader='varying float vGrainOpacity;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a*=vGrainOpacity;\n#include <opaque_fragment>');
  };this.spills=[];this.spillObject=new T.Object3D();
  this.coatMask=new T.CanvasTexture(document.createElement('canvas'));this.coatUniforms.uCoat.value=this.coatMask;
  this.heapTexture=canvasTexture((c,s)=>{c.fillStyle='#898989';c.fillRect(0,0,s,s);for(let i=0;i<18000;i++){const g=Math.random()*255|0;c.fillStyle=`rgb(${g},${g},${g})`;c.fillRect(Math.random()*s,Math.random()*s,1,1)}},128);this.heapTexture.wrapS=this.heapTexture.wrapT=T.RepeatWrapping;this.heapTexture.repeat.set(11,15);
  this.heapGeo=new T.PlaneGeometry(W,H,COLS/2,ROWS/2);
  this.heapGeo.setAttribute('heapAmount',new T.Float32BufferAttribute(new Float32Array(this.heapGeo.attributes.position.count),1));
  this.heapMat=new T.MeshStandardMaterial({alphaHash:true,color:colors[0],roughness:.65,metalness:.9,bumpMap:this.heapTexture,bumpScale:.7,envMapIntensity:.8});
  const clipHeap=shader=>{shader.uniforms.uWorkAlpha=this.workUniform;shader.fragmentShader='uniform float uWorkAlpha;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <alphahash_fragment>','diffuseColor.a*=uWorkAlpha;\n#include <alphahash_fragment>');shader.vertexShader='attribute float heapAmount; varying float vHeap;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeap=heapAmount;');shader.fragmentShader='varying float vHeap;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() {\nif(vHeap<3.0) discard;');shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb=mix(linearToOutputTexel(vec4(diffuseColor.rgb,1.0)).rgb,gl_FragColor.rgb,.35);\n#ifdef USE_BUMPMAP\nvec2 tile=floor(vBumpMapUv*128.0);float fleck=fract(sin(dot(tile,vec2(12.9898,78.233)))*43758.5453);gl_FragColor.rgb*=.78+fleck*.36;gl_FragColor.rgb+=step(.983,fleck)*.32;\n#endif');};
  this.heapMat.onBeforeCompile=clipHeap;this.heap=new T.Mesh(this.heapGeo,this.heapMat);this.heap.frustumCulled=false;this.heap.receiveShadow=true;this.heap.castShadow=true;this.heap.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});this.heap.customDepthMaterial.onBeforeCompile=clipHeap;this.paperGroup.add(this.heap);
  this.heapShadowGeo=new T.PlaneGeometry(W,H,COLS/2,ROWS/2);this.heapShadowGeo.setAttribute('heapAmount',new T.Float32BufferAttribute(new Float32Array(this.heapShadowGeo.attributes.position.count),1));
  const shadowMat=new T.MeshBasicMaterial({color:'#1c2830',transparent:true,opacity:.23,depthWrite:false});
  shadowMat.onBeforeCompile=shader=>{shader.vertexShader='attribute float heapAmount; varying float vHeap;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHeap=heapAmount;');shader.fragmentShader='varying float vHeap;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a*=smoothstep(0.0,12.0,vHeap);\n#include <opaque_fragment>');};
  this.heapShadow=new T.Mesh(this.heapShadowGeo,shadowMat);this.heapShadow.frustumCulled=false;this.paperGroup.add(this.heapShadow);
  this.peelGeo=new T.PlaneGeometry(W,H,24,160);
  this.peelSheet=new T.Mesh(this.peelGeo,new T.MeshStandardMaterial({color:'#fff2b2',roughness:.8,transparent:true,alphaTest:.08,side:T.DoubleSide}));
  const clipAttached=shader=>{shader.vertexShader='attribute float peelLift; varying float vPeelLift;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPeelLift=peelLift;');shader.fragmentShader='varying float vPeelLift;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() {\nif(vPeelLift<.35) discard;');};
  this.peelSheet.material.onBeforeCompile=clipAttached;this.peelSheet.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide});this.peelSheet.customDepthMaterial.onBeforeCompile=clipAttached;
  this.peelSheet.frustumCulled=false;this.peelSheet.castShadow=true;this.peelSheet.visible=false;this.paperGroup.add(this.peelSheet);
  this.makeBrush();this.makeTweezers();this.makeGlints();this.makeCelebration();this.makeGallery();this.makeJars();this.makeCollector();this.makeTable();this.makeHands();this.hint=this.makeHint();this.paperGroup.add(this.hint);
  this.desiredBrush={x:130,y:250,angle:-.72,contact:false,visible:false};this.brushPoint={x:130,y:250};this.pourPoint={x:140,y:180};this.autoPour=false;
  this.applySettings(settings);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();this.warmReady=this.warmCollection();
 }
 warmCollection(){
  // Compile the late funnel/stream materials during the opening peel. A small
  // offscreen scene shares geometry/materials; it never draws into the canvas.
  const warm=new T.Scene();warm.environment=this.scene.environment;warm.environmentIntensity=this.scene.environmentIntensity;warm.add(this.key.clone(),this.fill.clone(),new T.HemisphereLight('#fff7dd','#505668',1.5));
  const collector=this.boxGroup.clone(true);collector.visible=true;warm.add(collector);const stream=new T.InstancedMesh(this.spill.geometry,this.spill.material,1);stream.frustumCulled=false;stream.instanceColor=new T.InstancedBufferAttribute(new Float32Array([1,1,1]),3);warm.add(stream);const desk=new T.InstancedMesh(this.tablePool.geometry,this.tablePool.material,1);desk.instanceColor=stream.instanceColor;desk.frustumCulled=false;warm.add(desk);
  return this.renderer.compileAsync(warm,this.camera).then(()=>{warm.clear();stream.dispose();desk.dispose();}).catch(error=>console.warn('Toplama malzemesi hazırlığı:',error));
 }
 makeTable(){
  this.tableTime=0;this.tableActive=0;this.tableLanded=0;this.tableCleared=0;this.tableDrawCount=0;this.tableAdds=[];this.tableUniform={value:0};
  this.tablePool=this.makeGrains(4096);this.paperGroup.remove(this.tablePool);this.scene.add(this.tablePool);
  this.tablePool.geometry.setAttribute('tableBirth',new T.InstancedBufferAttribute(new Float32Array(4096),1));
  const material=this.grainMaterial.clone();material.transparent=false;material.depthWrite=true;material.alphaHash=true;material.customProgramCacheKey=()=> 'desk-grains-v25';
  material.onBeforeCompile=shader=>{
   this.grainMaterial.onBeforeCompile(shader);shader.uniforms.uTableTime=this.tableUniform;
   shader.vertexShader='uniform float uTableTime; attribute float tableBirth; varying float vTableOpacity;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat age=uTableTime-tableBirth;vTableOpacity=1.0-smoothstep(.45+flakeSeed*.3,1.10+flakeSeed*.55,age);');
   shader.fragmentShader='varying float vTableOpacity;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphahash_fragment>','diffuseColor.a*=vTableOpacity;\n#include <alphahash_fragment>');
  };this.tablePool.material=material;
 }
 reserveTable(required){
  if(required<=this.tablePool.instanceMatrix.count)return;
  const birth=this.tablePool.geometry.attributes.tableBirth.array;this.ensureGrainCapacity('tablePool',required);
  const data=new Float32Array(this.tablePool.instanceMatrix.count);data.set(birth);this.tablePool.geometry.setAttribute('tableBirth',new T.InstancedBufferAttribute(data,1));
 }
 resetTable(){this.tableTime=0;this.tableActive=0;this.tableLanded=0;this.tableCleared=0;this.tableDrawCount=0;this.tableAdds.length=0;this.tablePool.count=0;this.tableUploadBytes=0;}
 landOnTable(p){this.tableActive++;this.tableLanded+=p.mass||1;p.tableBirth=this.tableTime;this.tableAdds.push(p);}
 syncTable(){
  this.tableUniform.value=this.tableTime;this.tableUploadBytes=0;
  if(!this.tableAdds.length){if(!this.tableActive){this.tablePool.count=0;this.tableDrawCount=0;}return;}
  const start=this.tableDrawCount,n=this.tableAdds.length;this.reserveTable(start+n);
  const mesh=this.tablePool,a=mesh.instanceMatrix.array,c=mesh.instanceColor.array,seeds=mesh.geometry.attributes.flakeSeed,birth=mesh.geometry.attributes.tableBirth,size=grainScale(this.settings);
  for(let k=0;k<n;k++){
   const p=this.tableAdds[k],i=start+k,j=i*16,seed=p.seed,angle=seed*79,cs=Math.cos(angle),sn=Math.sin(angle),scale=(1.8+seed)*size*(p.tiny?FINISH_DUST_SCALE:1);
   a[j]=cs*scale;a[j+1]=sn*scale;a[j+2]=(seed*17%1-.5)*.25*scale;a[j+3]=0;a[j+4]=-sn*scale;a[j+5]=cs*scale;a[j+6]=(seed*31%1-.5)*.25*scale;a[j+7]=0;a[j+8]=a[j+9]=0;a[j+10]=scale*.35;a[j+11]=0;a[j+12]=p.x;a[j+13]=p.y;a[j+14]=p.z;a[j+15]=1;
   c[i*3]=p.color.r;c[i*3+1]=p.color.g;c[i*3+2]=p.color.b;seeds.array[i]=seed;birth.array[i]=p.tableBirth;
  }
  for(const attr of [mesh.instanceMatrix,mesh.instanceColor,seeds,birth]){attr.clearUpdateRanges();attr.addUpdateRange(start*attr.itemSize,n*attr.itemSize);attr.needsUpdate=true;}
  this.tableDrawCount+=n;mesh.count=this.tableDrawCount;this.tableUploadBytes=n*84;this.tableAdds.length=0;
 }
 makeGrains(capacity){
  const g=flakeGeometry(),seeds=new Float32Array(capacity);for(let i=0;i<capacity;i++)seeds[i]=((i*16807)%2147483647)/2147483647;
  g.setAttribute('flakeSeed',new T.InstancedBufferAttribute(seeds,1));g.setAttribute('grainOpacity',new T.InstancedBufferAttribute(new Float32Array(capacity).fill(1),1));
  const m=new T.InstancedMesh(g,this.grainMaterial,capacity);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.instanceColor=new T.InstancedBufferAttribute(new Float32Array(capacity*3),3);m.frustumCulled=false;m.count=0;this.paperGroup.add(m);return m;
 }
 ensureGrainCapacity(name,required){
  const previous=this[name];if(required<=previous.instanceMatrix.count)return previous;
  const capacity=Math.min(MAX_RENDER_GRAINS,Math.max(required,previous.instanceMatrix.count*2)),parent=previous.parent,replacement=this.makeGrains(capacity);
  replacement.material=previous.material;replacement.userData.gpuBend=previous.userData.gpuBend;replacement.count=previous.count;replacement.visible=previous.visible;replacement.castShadow=previous.castShadow;replacement.receiveShadow=previous.receiveShadow;
  replacement.instanceMatrix.array.set(previous.instanceMatrix.array);replacement.instanceColor.array.set(previous.instanceColor.array);replacement.geometry.attributes.flakeSeed.array.set(previous.geometry.attributes.flakeSeed.array);
  replacement.instanceMatrix.needsUpdate=true;replacement.instanceColor.needsUpdate=true;replacement.geometry.attributes.flakeSeed.needsUpdate=true;if(name==='collected'){const flags=new Uint8Array(capacity);flags.set(this.collectedDust);this.collectedDust=flags;}parent.add(replacement);parent.remove(previous);previous.dispose();previous.geometry.dispose();this[name]=replacement;return replacement;
 }
 makeBrush(){
  this.brush=new T.Group();this.brush.visible=false;this.paperGroup.add(this.brush);this.brushVariants={};this.brushAngle=.65;
  const wood=new T.MeshStandardMaterial({color:'#263538',roughness:.33,metalness:.12}),metal=new T.MeshStandardMaterial({color:'#bfc4be',metalness:.85,roughness:.25});
  for(const [shape,dim] of Object.entries(BRUSHES)){
   const group=new T.Group();this.brush.add(group);const width=dim.width;
   const handle=new T.Mesh(new T.CylinderGeometry(5.5,8,155,16),wood);handle.position.set(0,-127,19);handle.rotation.x=.075;handle.castShadow=true;group.add(handle);
   const end=new T.Mesh(new T.SphereGeometry(5.5,10,6),wood);end.position.set(0,-204,13);group.add(end);
   const ferrule=new T.Mesh(new T.BoxGeometry(width*.69,32,11),metal);ferrule.position.set(0,-34,14);group.add(ferrule);
   for(const y of [-47,-21]){const ring=new T.Mesh(new T.BoxGeometry(width*.71,1.5,11.5),metal);ring.position.set(0,y,14);group.add(ring);}
   const geo=new T.CylinderGeometry(width*.5,width*.34,dim.depth,shape==='round'?24:32,1);geo.scale(1,1,shape==='round'?.62:.24);
   const mat=new T.MeshStandardMaterial({color:'#b58b55',roughness:.94}),tuft=new T.Mesh(geo,mat);tuft.position.set(0,-2,8);tuft.castShadow=true;group.add(tuft);
   const points=[],seeds=[];for(let i=0;i<100;i++){const seed=((i*16807)%997)/997,x=(seed-.5)*width,z=3+(i*37%101)/101*8;points.push(x*.68,-17,z+3,x,dim.depth*.5-Math.abs(x)/width*6,z*.55);seeds.push(seed);}
   const bristleGeo=new T.BufferGeometry();bristleGeo.setAttribute('position',new T.Float32BufferAttribute(points,3));const strands=new T.LineSegments(bristleGeo,new T.LineBasicMaterial({color:'#ead5b3',transparent:true,opacity:.72}));group.add(strands);
   this.brushVariants[shape]={group,tuft,strands,mat,base:Float32Array.from(points),dim};
  }
  this.tuftMat=this.brushVariants.flat.mat;
 }
 makeJars(){
  this.jars=[];
  const stand=new T.Mesh(new T.BoxGeometry(470,65,8),new T.MeshStandardMaterial({color:'#46524f',metalness:.32,roughness:.4}));stand.position.set(0,460,-2);stand.castShadow=true;this.scene.add(stand);this.stand=stand;stand.visible=false;
  const fillTexture=canvasTexture((c,size)=>{c.fillStyle='#f5f5f5';c.fillRect(0,0,size,size);for(let i=0;i<6500;i++){c.fillStyle=i%17===0?'#ffffff':'#9c9c9c';c.fillRect((i*47%997)/997*size,(i*113%991)/991*size,.8,.8)}},128);
  const profiles={glass:{points:[[18,0],[22,5],[24,45],[24,59]],mouth:59,radius:24,fill:38},slim:{points:[[14,0],[17,4],[18,55],[16,67]],mouth:67,radius:16,fill:45},bowl:{points:[[16,0],[27,7],[31,23],[31,43]],mouth:43,radius:31,fill:26}};
  const glassMat=new T.MeshPhysicalMaterial({color:'#d9efeb',transparent:true,opacity:.22,roughness:.12,metalness:0,clearcoat:1,side:T.DoubleSide,depthWrite:false}),rimMat=new T.MeshStandardMaterial({color:'#e3e9e1',roughness:.2,metalness:.65});
  for(let i=0;i<6;i++){
   const g=new T.Group();g.position.set(850,460,180);g.visible=false;g.rotation.x=Math.PI/2;this.scene.add(g);g.userData.variants={};
   for(const [name,profile] of Object.entries(profiles)){
    const group=new T.Group();g.add(group);const glass=new T.Mesh(new T.LatheGeometry(profile.points.map(([x,y])=>new T.Vector2(x,y)),24),glassMat);group.add(glass);
    const bottom=new T.Mesh(new T.CylinderGeometry(profile.points[0][0],profile.points[0][0],3,24),glassMat);bottom.position.y=1;group.add(bottom);
    const fill=new T.Mesh(new T.CylinderGeometry(profile.radius-3,profile.points[0][0]-2,profile.fill,24),new T.MeshBasicMaterial({color:this.colors[i%this.colors.length],map:fillTexture,toneMapped:false}));fill.position.y=4+profile.fill/2;group.add(fill);
    const rim=new T.Mesh(new T.TorusGeometry(profile.radius,1.25,6,24),rimMat);rim.rotation.x=Math.PI/2;rim.position.y=profile.mouth;group.add(rim);
    const band=new T.Mesh(new T.CylinderGeometry(profile.radius+.2,profile.radius+.2,5,24,1,true),rimMat);band.position.y=profile.mouth-4;group.add(band);
    g.userData.variants[name]={group,fill,profile};
   }
   const grip=new T.Group(),skin=new T.MeshStandardMaterial({color:'#d9ac8e',roughness:.8});
   const palm=new T.Mesh(new T.CapsuleGeometry(19,65,4,12),skin);palm.rotation.z=-.7;palm.position.set(54,13,0);grip.add(palm);
   for(const y of [14,30]){const finger=new T.Mesh(new T.CapsuleGeometry(7,28,4,10),skin);finger.rotation.z=Math.PI/2;finger.position.set(25,y,14);grip.add(finger);}g.add(grip);
   g.userData.home=g.position.clone();g.userData.homeRotation=g.quaternion.clone();this.jars.push(g);
  }
 }
 makeTweezers(){
  this.tweezers=new T.Group();this.paperGroup.add(this.tweezers);this.tweezers.visible=false;
  const metal=new T.MeshStandardMaterial({color:'#c8d4d7',roughness:.29,metalness:.82}),outline=new T.MeshBasicMaterial({color:'#263e48',side:T.BackSide}),grip=new T.MeshStandardMaterial({color:'#bd735f',roughness:.7});
  for(const side of [-1,1]){
   const arm=new T.Group();arm.position.set(side*6,-60,25);arm.rotation.z=side*.075;arm.rotation.x=.16;this.tweezers.add(arm);
   const body=new T.Mesh(new T.BoxGeometry(6.2,130,5),metal);body.castShadow=true;arm.add(body);
   const rim=new T.Mesh(new T.BoxGeometry(9.2,133,8),outline);arm.add(rim);
   const handle=new T.Mesh(new T.BoxGeometry(7.2,40,6),grip);handle.position.y=-28;arm.add(handle);
   const shine=new T.Mesh(new T.BoxGeometry(.9,78,.3),new T.MeshBasicMaterial({color:'#ecf7f8'}));shine.position.set(-1.6,13,2.65);arm.add(shine);
  }
 }
 makeCollector(){
  this.boxGroup=new T.Group();this.boxGroup.position.set(0,FUNNEL.centerY,0);this.boxGroup.visible=false;this.scene.add(this.boxGroup);this.boxMotion=0;this.collectorBox={...FUNNEL};this.collectedCount=0;this.collectedDust=new Uint8Array(JAR_SAMPLES);this.trayBins=new Uint16Array(28*22);
  this.funnelBody=new T.Group();this.funnelBody.rotation.x=-FUNNEL.tilt;this.funnelBody.position.z=FUNNEL.rim;this.boxGroup.add(this.funnelBody);
  const profile=[[22,-125],[23,-111],[29,-101],[46,-83],[74,-55],[104,-27],[129,-5],[136,1],[135,7],[131,10],[126,6],[126,0],[108,-21],[78,-50],[48,-80],[24,-104],[18,-113],[18,-125],[22,-125]];
  const curve=new T.CatmullRomCurve3(profile.map(([r,z])=>new T.Vector3(r,z,0))),cone=new T.LatheGeometry(curve.getPoints(64).map(p=>new T.Vector2(p.x,p.y)),64),colours=[];
  const mint=new T.Color('#a8cfbd'),cream=new T.Color('#f1e4c9'),positions=cone.attributes.position;
  for(let i=0;i<positions.count;i++){const c=mint.clone().lerp(cream,smooth((positions.getY(i)+5)/13));colours.push(c.r,c.g,c.b);}cone.setAttribute('color',new T.Float32BufferAttribute(colours,3));cone.rotateX(Math.PI/2);
  const shell=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,metalness:0,roughness:.64,side:T.DoubleSide});
  const bowl=new T.Mesh(cone,shell);bowl.castShadow=true;bowl.receiveShadow=true;this.funnelBody.add(bowl);
  const glass=new T.MeshPhysicalMaterial({color:'#ddebe5',transparent:true,opacity:.3,roughness:.12,metalness:.05,side:T.DoubleSide,depthWrite:false});
  const jar=new T.Mesh(new T.CylinderGeometry(43,39,80,40,1,true),glass);jar.rotation.x=Math.PI/2;jar.position.z=-FUNNEL.length-54;this.funnelBody.add(jar);
  const lip=new T.Mesh(new T.TorusGeometry(43,2.8,10,40),new T.MeshStandardMaterial({color:'#bdcfc1',roughness:.65,metalness:0}));lip.position.z=-FUNNEL.length-14;this.funnelBody.add(lip);
  const base=new T.Mesh(new T.CylinderGeometry(39,39,4,40),glass);base.rotation.x=Math.PI/2;base.position.z=-FUNNEL.length-94;this.funnelBody.add(base);
  const outline=new T.BufferGeometry().setFromPoints([new T.Vector3(-43,0,-FUNNEL.length-14),new T.Vector3(-39,0,-FUNNEL.length-94),new T.Vector3(43,0,-FUNNEL.length-14),new T.Vector3(39,0,-FUNNEL.length-94)]);
  this.funnelBody.add(new T.LineSegments(outline,new T.LineBasicMaterial({color:'#789084',transparent:true,opacity:.7})));
  const footRing=new T.Mesh(new T.TorusGeometry(39,1.25,6,40),new T.MeshStandardMaterial({color:'#8a9d90',roughness:.55}));footRing.position.z=-FUNNEL.length-94;this.funnelBody.add(footRing);
  this.jarFill=new T.Mesh(new T.CylinderGeometry(36,36,1,40),new T.MeshStandardMaterial({color:this.colors[0],map:this.heapTexture,bumpMap:this.heapTexture,bumpScale:1,roughness:.5,metalness:.7}));this.jarFill.rotation.x=Math.PI/2;this.jarFill.visible=false;this.funnelBody.add(this.jarFill);
  this.collected=this.makeGrains(JAR_SAMPLES);this.paperGroup.remove(this.collected);this.funnelBody.add(this.collected);
  this.recovery=new Recovery(this.settings.recovery||'classic');this.recoveryColor=new T.Color(this.colors[0]);
  this.recoveryVisual=new RecoveryVisual(this.scene,this.heapTexture,this.grainMaterial.clone(),n=>{const mesh=this.makeGrains(n);this.paperGroup.remove(mesh);return mesh;});
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
 makeCelebration(){
  this.celebration=new T.Group();this.paperGroup.add(this.celebration);this.celebration.visible=false;
  this.celebrationStars=[];
  for(let i=0;i<36;i++){
   const sprite=new T.Sprite(new T.SpriteMaterial({map:this.glints[0].material.map,color:i%3===0?'#b4e7ff':i%3===1?'#ffe8aa':'#ffffff',transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));
   // Top/bottom halos and narrow side sparkles stay outside the artwork.
   const side=i%4,along=((i*17%37)/36-.5);
   sprite.userData={x:side<2?(side===0?-349:349):along*620,y:side<2?along*795:(side===2?452:-452),seed:i*2.399};
   this.celebration.add(sprite);this.celebrationStars.push(sprite);
  }
 }
 makeGallery(){
  const ring=(w,h,iw,ih,depth,bevel=0)=>{
   const shape=new T.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();
   const hole=new T.Path();hole.moveTo(-iw/2,-ih/2);hole.lineTo(-iw/2,ih/2);hole.lineTo(iw/2,ih/2);hole.lineTo(iw/2,-ih/2);hole.closePath();shape.holes.push(hole);
   return new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel*.7,bevelSegments:2,curveSegments:1});
  };
  this.galleryMaterials=[new T.MeshStandardMaterial({color:'#8d7e65',roughness:.58,metalness:.18,alphaHash:true}),new T.MeshStandardMaterial({color:'#302a22',roughness:.8,alphaHash:true})];
  // One continuous lip overlaps the opaque artwork. No coplanar cream rings.
  const geometries=[ring(660,860,598,798,14,2),new T.BoxGeometry(654,854,6)],zs=[0,-12];
  const frame=()=>{const group=new T.Group();for(let i=0;i<geometries.length;i++){const mesh=new T.Mesh(geometries[i],this.galleryMaterials[i]);mesh.userData.framePart=true;mesh.position.z=zs[i];mesh.castShadow=i===0;mesh.receiveShadow=true;group.add(mesh)}return group};
  this.galleryFrame=frame();this.galleryFrame.visible=false;this.paperGroup.add(this.galleryFrame);
  this.gallerySides=new T.Group();this.gallerySides.visible=false;this.scene.add(this.gallerySides);this.galleryNeighbors=[];
  this.frameFactory=frame;this.galleryCurrent=0;this.galleryFocus=0;this.galleryActive=false;this.entry=null;
  this.entryCover=new T.Mesh(new T.PlaneGeometry(W,H),new T.MeshBasicMaterial({transparent:true,opacity:0,toneMapped:false,depthWrite:false,depthTest:false}));this.entryCover.position.z=3;this.entryCover.renderOrder=90;this.entryCover.visible=false;this.paperGroup.add(this.entryCover);
 }
 setLobbyImage(image){
  if(!this.lobbyCover){this.lobbyCover=new T.Mesh(new T.PlaneGeometry(W,H),new T.MeshBasicMaterial({toneMapped:false,depthWrite:false,depthTest:false}));this.lobbyCover.position.z=4;this.lobbyCover.renderOrder=80;this.paperGroup.add(this.lobbyCover);}
  this.lobbyCover.material.map?.dispose();const texture=new T.CanvasTexture(image);texture.colorSpace=T.SRGBColorSpace;this.lobbyCover.material.map=texture;this.lobbyCover.material.needsUpdate=true;this.lobbyCover.visible=true;this.renderer.initTexture(texture);
 }
 hideLobby(){if(this.lobbyCover){this.lobbyCover.visible=false;this.lobbyCover.material.map?.dispose();this.lobbyCover.material.map=null;}}
 setGalleryEntries(entries,current){
  if(this.galleryEntries?.length===entries.length&&this.galleryEntries.every((entry,i)=>entry===entries[i])&&this.galleryNeighbors.length===entries.length){this.galleryCurrent=current;for(const item of this.galleryNeighbors)item.group.position.x=galleryOffset(item.index,current,GALLERY.spacing);return;}this.galleryEntries=entries;
  for(const item of this.galleryNeighbors){item.picture.material.map?.dispose();item.picture.material.dispose();item.picture.geometry.dispose();item.label.material.map?.dispose();item.label.material.dispose();item.label.geometry.dispose();this.gallerySides.remove(item.group);}
  this.galleryNeighbors=[];this.galleryCurrent=current;
  entries.forEach((entry,index)=>{
   const group=this.frameFactory();group.position.set(galleryOffset(index,current,GALLERY.spacing),0,110);this.gallerySides.add(group);
   const map=new T.CanvasTexture(entry.image);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
   const picture=new T.Mesh(new T.PlaneGeometry(W,H),new T.MeshBasicMaterial({map,toneMapped:false}));picture.position.z=3;group.add(picture);
   if(entry.completed){picture.material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,{uTime:this.coatUniforms.uTime,uRadiant:this.coatUniforms.uRadiant,uSparkle:this.coatUniforms.uSparkle,uSparkleField:this.coatUniforms.uSparkleField});shader.fragmentShader='uniform float uTime; uniform float uRadiant; uniform float uSparkle; uniform sampler2D uSparkleField;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
    vec2 field=texture2D(uSparkleField,vMapUv).rg;float flash=pow(max(0.0,sin(uTime*.83+field.r*173.0)),38.0);float pass=pow(max(0.0,cos((vMapUv.x*.6+vMapUv.y*.85-uTime*.11)*6.28318)),32.0);float breath=pow(max(0.0,sin(uTime*.69)),6.0);gl_FragColor.rgb+=uSparkle*uRadiant*(field.g*flash*.9+pass*breath*(.035+field.g*.6))*vec3(1.0,.96,.83);`);};picture.material.customProgramCacheKey=()=> 'gallery-radiant-v28';}
   this.renderer.initTexture(map);
   const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=96;const c=labelCanvas.getContext('2d');c.fillStyle='#e4dccb';c.fillRect(0,0,512,96);c.fillStyle='#4e493e';c.font='500 24px sans-serif';c.fillText(String(index+1).padStart(2,'0')+'   '+entry.name,22,39);c.fillStyle='#8c806a';c.font='14px sans-serif';c.fillText(entry.completed?'SİM ÜZERİNE IŞIK · KOLEKSİYONUN':'YENİ BİR PARILTI SENİ BEKLİYOR',22,70);
   const labelMap=new T.CanvasTexture(labelCanvas);labelMap.colorSpace=T.SRGBColorSpace;const label=new T.Mesh(new T.PlaneGeometry(300,56),new T.MeshBasicMaterial({map:labelMap,toneMapped:false,transparent:true}));label.position.set(140,-488,-20);group.add(label);
   group.visible=index!==current;this.galleryNeighbors.push({group,picture,label,index});
  });
 }
 pickArtwork(e){
  const r=this.canvas.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.mouse,this.camera);
  const choices=[];if(this.galleryFrame.visible){choices.push({mesh:this.paper,index:this.galleryCurrent});for(const mesh of this.galleryFrame.children)choices.push({mesh,index:this.galleryCurrent});}
  for(const item of this.galleryNeighbors)if(item.group.visible){choices.push({mesh:item.picture,index:item.index});for(const mesh of item.group.children)if(mesh.userData.framePart)choices.push({mesh,index:item.index});}
  const hits=this.ray.intersectObjects(choices.map(c=>c.mesh),false);return hits.length?choices.find(c=>c.mesh===hits[0].object).index:null;
 }
 restoreEntryFrame(entry){for(const item of entry.frameMaterials||[]){item.mesh.material.dispose();item.mesh.material=item.original;}if(entry.pictureState){const {picture,original,sharp}=entry.pictureState;picture.material.map=original;sharp.dispose();entry.pictureState=null;}}
 beginEntry(index,image,onCovered,onDone){
  const resume=!image,item=this.galleryNeighbors[index],texture=resume?null:new T.CanvasTexture(image);if(texture)texture.colorSpace=T.SRGBColorSpace;
  if(texture){this.entryCover.material.map?.dispose();this.entryCover.material.map=texture;this.entryCover.material.needsUpdate=true;this.renderer?.initTexture(texture);}
  // The same sharp picture is used on both sides of the coordinate rebase.
  let pictureState=null;if(texture&&item&&index!==this.galleryCurrent){const original=item.picture.material.map,sharp=texture.clone();item.picture.material.map=sharp;sharp.needsUpdate=true;this.renderer?.initTexture(sharp);pictureState={picture:item.picture,original,sharp};}
  const frame=index===this.galleryCurrent?this.galleryFrame:item?.group,frameMaterials=[];
  for(const mesh of frame?.children||[])if(mesh.userData.framePart){const original=mesh.material;mesh.material=original.clone();mesh.material.opacity=1;mesh.material.transparent=true;mesh.material.alphaHash=false;mesh.material.depthWrite=false;frameMaterials.push({mesh,original});}
  if(this.renderer){const visible=this.entryCover.visible;this.entryCover.visible=!!texture;this.renderer.compile(this.scene,this.camera);this.entryCover.visible=visible;}
  this.entry={pictureState,workStart:this.workAlpha??0,resume,index,age:0,stage:'in',style:this.settings.entryMode||'classic',frameMaterials,start:this.camera.position.clone(),rotation:this.camera.quaternion.clone(),onCovered,onDone};
 }
 updateCompletion(finished,dt,time){
  const active=finished||this.galleryActive;this.finishClock=Math.max(0,Math.min(1.65,this.finishClock+(active?dt:-dt)*1.3));
  const e=completionEase(this.finishClock,this.reducedMotion.matches&&active);this.heroProgress=e;
  this.camera.position.copy(this.playCameraPosition);this.camera.quaternion.copy(this.playCameraQuaternion);
  this.paperGroup.rotation.z=.018+(this.cardTapRoll||0);this.celebration.visible=finished&&this.settings.sparkles&&!this.reducedMotion.matches;
  this.galleryFrame.visible=this.gallerySides.visible=e>.002;if(!this.entry){this.entryFrameAlpha=e;for(const material of this.galleryMaterials){material.opacity=e;}}
  this.paperOutline.visible=e<.1;
  for(const neighbor of this.galleryNeighbors){neighbor.group.visible=neighbor.index!==this.galleryCurrent;neighbor.label.visible=neighbor.index!==Math.round(this.galleryFocus);}
  this.floor.material.color.lerpColors(this.floorRestColor,this.galleryWallColor,e);this.scene.background.copy(this.floor.material.color);
  this.coatUniforms.uCelebrate.value=finished&&!this.reducedMotion.matches?e:0;
  if(e>0){
   this.updateBend(this.bend*(1-e),this.pitch*(1-e));
   const pose=galleryCamera(this.heroFrame,this.canvas.clientHeight,this.camera.fov);pose.x+=galleryOffset(this.galleryFocus,this.galleryCurrent,GALLERY.spacing);
   this.camera.position.lerp(new T.Vector3(pose.x,pose.y,pose.z),e);this.camera.quaternion.slerp(new T.Quaternion().setFromEuler(new T.Euler(0,GALLERY.yaw,0)),e);
   this.paperGroup.position.z=110*e;this.paperGroup.rotation.set(0,0,.018*(1-e));this.paperGroup.updateMatrixWorld(true);
  }
  const entry=this.entry;
  if(entry){
   entry.age+=dt;
   if(entry.stage==='in'){
    const p=entryProgress(entry.age,this.reducedMotion.matches),pan=smooth(Math.min(1,p/.52)),zoom=smooth(Math.max(0,(p-.25)/.75)),x=galleryOffset(entry.index,this.galleryCurrent,GALLERY.spacing);
    const distance=Math.min(W/this.camera.aspect,H)/(2*Math.tan(this.camera.fov*Math.PI/360))*.89;
    if(entry.style==='direct'){
     const d=entryZoomDistance(this.camera.aspect,this.camera.fov),normal=new T.Vector3(0,0,1).applyQuaternion(entry.rotation),end=new T.Vector3(x,0,113).addScaledVector(normal,d);
     const initialDepth=Math.max(1,entry.start.z-113);end.y+=this.heroFrame?((this.heroFrame.y+this.heroFrame.height/2)/this.canvas.clientHeight-.5)*2*Math.tan(this.camera.fov*Math.PI/360)*d:entry.start.y*d/initialDepth;
     this.camera.position.copy(entry.start).lerp(end,p);this.camera.quaternion.copy(entry.rotation);
    }else{
    this.camera.position.copy(entry.start);this.camera.position.x+=(x-entry.start.x)*pan;this.camera.position.y=entry.start.y*(1-zoom);this.camera.position.z=entry.start.z+(110+distance-entry.start.z)*zoom;this.camera.quaternion.copy(entry.rotation).slerp(new T.Quaternion(),zoom);
    }
    this.entryFrameAlpha=entryFrameOpacity(p);for(const item of entry.frameMaterials||[])item.mesh.material.opacity=this.entryFrameAlpha;
    if(p===1){
     this.restoreEntryFrame(entry);this.camera.position.x-=x;entry.start.copy(this.camera.position);entry.rotation.copy(this.camera.quaternion);entry.stage='out';entry.age=0;
     entry.onCovered();this.camera.position.copy(entry.start);this.camera.quaternion.copy(entry.rotation);this.finishClock=0;this.galleryActive=false;this.galleryFrame.visible=this.gallerySides.visible=false;this.paperGroup.position.set(0,0,110);this.paperGroup.rotation.set(0,0,0);this.entryCover.visible=!entry.resume;this.entryCover.material.opacity=entry.resume?0:1;
    }
   }else{
    const p=entryProgress(entry.age*1.3,this.reducedMotion.matches);
    this.camera.position.copy(entry.start).lerp(this.playCameraPosition,p);this.camera.quaternion.copy(entry.rotation).slerp(this.playCameraQuaternion,p);this.paperGroup.position.z=110*(1-p);this.paperGroup.rotation.z=.018*p;
    this.entryCover.material.opacity=1-smooth(Math.max(0,(p-.18)/.72));this.entryCover.visible=!entry.resume&&p<.9;
    if(p===1){this.entry=null;this.entryCover.visible=false;entry.onDone();}
   }
  }
  for(const star of this.celebrationStars){
   const {x,y,seed}=star.userData,age=this.finishClock,drift=(1-Math.exp(-age*.9))*12;
   star.position.set(x+Math.sign(x)*drift*.35+Math.sin(time*.0008+seed)*3,y+Math.sign(y)*drift+Math.cos(time*.0007+seed)*4,24);
   const flash=Math.pow(Math.max(0,Math.sin(time*.002+seed)),5);star.scale.setScalar(7+flash*15);star.material.opacity=e*(.12+flash*.75);star.material.rotation=Math.sin(time*.0004+seed)*.3;
  }
 }
 makeHint(){const map=canvasTexture((c,s)=>{c.strokeStyle='#ffffee';c.lineWidth=5;c.beginPath();c.arc(s/2,s/2,48,0,TAU);c.stroke();c.fillStyle='#fffef0';c.beginPath();c.arc(s/2,s/2,7,0,TAU);c.fill()},256);const sp=new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthTest:false}));sp.scale.set(90,90,1);return sp}
 applySettings(settings){
  const old=this.settings,ratioOfGrains=grainScale(settings)/grainScale(old);this.settings={...settings};
  if(settings.recovery==='table'&&old?.recovery!=='table'&&this.tablePool){
   for(const p of this.spills)if(!p.table){p.recoveryMass=p.recovery==='transfer';startTable(p);}this.reserveTable(Math.max(48000,this.spills.length+this.tableDrawCount));
  }
  if(this.collectedCount&&ratioOfGrains!==1){const matrices=this.collected.instanceMatrix.array;for(let i=0;i<this.collected.count;i++)for(const axis of [0,1,2,4,5,6,8,9,10])matrices[i*16+axis]*=ratioOfGrains;this.collected.instanceMatrix.needsUpdate=true;}
  const ratio=Math.max(.5,Math.min(2.75,this.baseDpr*settings.renderScale));this.renderer.setPixelRatio(ratio);
  const shadowSize={off:0,low:512,medium:1024,high:1536}[settings.shadow];
  this.renderer.shadowMap.enabled=shadowSize>0;this.key.castShadow=shadowSize>0;
  if(shadowSize&&this.key.shadow.mapSize.x!==shadowSize){this.key.shadow.map?.dispose();this.key.shadow.map=null;this.key.shadow.mapSize.set(shadowSize,shadowSize);}
  this.key.shadow.needsUpdate=true;
  this.scene.environmentIntensity=settings.reflections?.55:0;
  this.grainMaterial.envMapIntensity=settings.reflections?.5:0;this.grainMaterial.metalness=settings.reflections?.95:.85;this.grainMaterial.roughness=settings.sparkles?.43:.6;for(const key of ['metalness','roughness','envMapIntensity'])this.current.material[key]=this.grainMaterial[key];
  this.coatUniforms.uRadiant.value=settings.posterShine==='radiant'?1:0;this.heapMat.envMapIntensity=settings.reflections?.25:0;this.coatUniforms.uSparkle.value=settings.sparkles?1:0;
  for(const shader of this.shaders)shader.uniforms.uSparkEnabled.value=settings.sparkles?1:0;
  if(old?.shadow!==settings.shadow)this.scene.traverse(o=>{if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.needsUpdate=true;}});
  for(const sp of this.glints)if(!settings.sparkles)sp.visible=false;
  for(const jar of this.jars){
   for(const [name,variant] of Object.entries(jar.userData.variants))variant.group.visible=name===settings.jarShape;
   const selected=jar.userData.variants[settings.jarShape]||jar.userData.variants.glass;jar.userData.fill=selected.fill;jar.userData.profile=selected.profile;
  }
  for(const [name,variant] of Object.entries(this.brushVariants))variant.group.visible=name===settings.brushShape;
  this.brush.scale.setScalar(settings.brushWidth);
  this.resize();
 }
 resize(){
  const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;
  this.renderer.setSize(w,h,false);this.camera.aspect=w/h;
  const t=Math.tan(35*Math.PI/360),dist=Math.max(1000/(2*t),650/(2*t*this.camera.aspect));
  const inset=parseFloat(getComputedStyle(document.querySelector('#complete')).paddingTop)||0,offset=inset*2*t*dist/h;
  this.camera.position.set(0,-dist*.30+offset,dist);this.camera.lookAt(0,-75+offset,20);this.camera.updateProjectionMatrix();
  this.playCameraPosition=this.camera.position.clone();this.playCameraQuaternion=this.camera.quaternion.clone();
  const overlay=getComputedStyle(document.querySelector('#complete'));this.heroFrame=completionLayout(w,h,parseFloat(overlay.paddingTop)||0,parseFloat(overlay.paddingBottom)||0);
 }
 metrics(){const info=this.renderer.info;return{antialias:!!this.renderer.getContext().getContextAttributes()?.antialias,width:this.canvas.width,height:this.canvas.height,draws:info.render.calls,triangles:info.render.triangles,visible:this.current.count+this.spill.count+(this.tablePool?.count||0)+(this.boxGroup.visible?this.collected.count:0)};}
 posePour(pour){
  const jar=this.jars[this.activeColor%6];if(!jar)return;
  for(const other of this.jars)other.visible=other===jar&&!!pour;
  if(!pour){jar.position.copy(jar.userData.home);jar.quaternion.copy(jar.userData.homeRotation);jar.userData.fill.scale.y=1;jar.userData.fill.position.y=4+jar.userData.profile.fill/2;return;}
  const t=pour.elapsed,unit=t/pour.duration,travel=smooth(Math.min(1,pour.kind==='hold'?t/.45:unit/.12)),back=smooth(Math.max(0,pour.kind==='hold'?(t-(pour.duration-.45))/.45:(unit-.89)/.11)),weight=travel*(1-back);
  this.paperGroup.updateMatrixWorld(true);
  const profile=jar.userData.profile;
  const tilted=new T.Quaternion().setFromEuler(new T.Euler(Math.PI+.30,0,this.paperGroup.rotation.z));
  const lip=new T.Vector3(0,profile.mouth,profile.radius*.5).applyQuaternion(tilted);
  const destination=this.paperGroup.localToWorld(new T.Vector3(pour.x-300,400-pour.y,142)).sub(lip);
  jar.position.copy(jar.userData.home).lerp(destination,weight);jar.quaternion.copy(jar.userData.homeRotation).slerp(tilted,weight);
  const empty=1-Math.min(1,Math.max(0,(t-.5)/(pour.duration-1)))*.88;
  jar.userData.fill.scale.y=1+(empty-1)*weight;jar.userData.fill.position.y=4+profile.fill/2*jar.userData.fill.scale.y;
  jar.updateMatrixWorld(true);
 }
 pourOrigin(){
  const jar=this.jars[this.activeColor%6],mouth=jar.localToWorld(new T.Vector3(0,jar.userData.profile.mouth,jar.userData.profile.radius*.5));
  this.paperGroup.worldToLocal(mouth);return{x:mouth.x+300,y:400-mouth.y,z:mouth.z-3};
 }
 mapPointer(e){
  const r=this.canvas.getBoundingClientRect();this.mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.mouse,this.camera);
  this.paperGroup.updateMatrixWorld(true);this.inversePaper.copy(this.paperGroup.matrixWorld).invert();this.localRay.copy(this.ray.ray).applyMatrix4(this.inversePaper);
  let z=3;for(let i=0;i<3;i++){const t=(z-this.localRay.origin.z)/this.localRay.direction.z;this.localRay.at(t,this.hit);z=bentPoint(this.hit.x,this.hit.y,3,this.bend,this.pitch).z;}
  return{x:this.hit.x+300,y:400-this.hit.y};
 }

 setStage(index){this.resetTable();this.recovery?.reset();this.catchSamples=[];this.catchSampleCursor=0;this.collectedCount=0;this.collected.count=0;this.contactData.fill(0);this.contactSeen.fill(0);this.contactTexture.needsUpdate=true;this.updateBend(0);this.heapGeo.attributes.heapAmount.array.fill(0);this.current.visible=true;this.activeColor=index;if(this.recoveryColor)this.recoveryColor.set(this.colors[index]);this.current.count=0;this.currentInitialized=0;this.currentColorDirty=true;this.heapMat.color.set(this.colors[index]);for(const variant of Object.values(this.brushVariants))variant.mat.color.set('#b58b55');this.heap.visible=true;this.heapShadow.visible=true;this.hint.visible=true;for(const v of Object.values(this.jars[index%6].userData.variants))v.fill.material.color.set(this.colors[index]);}
 initInstance(mesh,i,seed,color){
  const mat=new T.Matrix4(),q=new T.Quaternion().setFromEuler(new T.Euler((seed*17%1-.5)*1.3,(seed*31%1-.5)*1.3,seed*79)),scale=1.15+(seed*197%1)*.9;
  mat.compose(new T.Vector3(0,0,-1000),q,new T.Vector3(scale,scale,scale));mesh.instanceMatrix.array.set(mat.elements,i*16);
  const c=new T.Color(color),v=.60+(seed*47%1)*.7;c.multiplyScalar(v);if(seed*127%1>.965)c.lerp(new T.Color('#c2c8da'),.65);mesh.instanceColor.array.set([c.r,c.g,c.b],i*3);
 }
 updateGrains(sand){
  if(sand.count>this.current.instanceMatrix.count)this.ensureGrainCapacity('current',sand.count);
  const curve=1.22*this.bend,r=curve>1e-6?300/curve:0,cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
  const a=this.current.instanceMatrix.array,c=this.current.instanceColor.array,seeds=this.current.geometry.attributes.flakeSeed,color=new T.Color(this.colors[this.activeColor]);let out=0,changedFrom=Infinity,changedTo=0;
  for(let i=0;i<sand.count;i++){
   if(sand.state[i]===BOUND||sand.state[i]===LOST)continue;
   const j=out*16,seed=sand.seed[i],angle=seed*79+(sand.roll?.[i]||0),cs=Math.cos(angle),sn=Math.sin(angle),scale=(1.35+(seed*197%1)*.9)*grainScale(this.settings)*(sand.finishDust?.[i]?FINISH_DUST_SCALE:1)*(sand.granular?.86:1);
   let px=sand.x[i]-300,py=400-sand.y[i],pz=3+(sand.state[i]===FREE?Math.min(MAX_GRAIN_HEIGHT,sand.z[i]):sand.z[i]);
   if(!this.current.userData?.gpuBend&&py>=-400&&(this.bend||this.pitch)){const theta=px/300*curve,crossZ=curve>1e-6?2*Math.sin(theta/2)**2*r:0,along=py+400;px=curve>1e-6?Math.sin(theta)*r:px;py=-400+along*cp-crossZ*sp;pz+=110*this.bend+along*sp+crossZ*cp;}
   a[j]=cs*scale;a[j+1]=sn*scale;a[j+2]=(seed*17%1-.5)*(sand.pressed[i]?.3:1.2)*scale;a[j+3]=0;
   a[j+4]=-sn*scale;a[j+5]=cs*scale;a[j+6]=(seed*31%1-.5)*(sand.pressed[i]?.3:1.2)*scale;a[j+7]=0;
   a[j+8]=0;a[j+9]=0;a[j+10]=scale;a[j+11]=0;a[j+12]=px;a[j+13]=py;a[j+14]=pz;a[j+15]=1;
   if(this.currentColorDirty||seeds.array[out]!==seed){const light=.7+(seed*47%1)*.5;c[out*3]=color.r*light;c[out*3+1]=color.g*light;c[out*3+2]=color.b*light;seeds.array[out]=seed;changedFrom=Math.min(changedFrom,out);changedTo=out+1;}out++;
  }
  this.current.visible=true;this.current.count=out;this.currentColorDirty=false;this.grainUploadBytes=out*64+(changedTo?(changedTo-changedFrom)*16:0);
  this.current.instanceMatrix.clearUpdateRanges();if(out){this.current.instanceMatrix.addUpdateRange(0,out*16);this.current.instanceMatrix.needsUpdate=true;}
  if(changedTo)for(const [attribute,size] of [[this.current.instanceColor,3],[seeds,1]]){attribute.clearUpdateRanges();attribute.addUpdateRange(changedFrom*size,(changedTo-changedFrom)*size);attribute.needsUpdate=true;}
 }
 updateHeap(sand,dt=1/60){
  const p=this.heapGeo.attributes.position,cols=COLS/2,rows=ROWS/2;
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
   const x=Math.min(col*2,COLS-1),y=Math.min(row*2,ROWS-1),k=y*COLS+x;
   const h=Math.min(MAX_HEAP_HEIGHT,(sand.moundHeight[k]+sand.moundHeight[y*COLS+Math.max(x-1,0)]+sand.moundHeight[Math.max(y-1,0)*COLS+x]+sand.moundHeight[Math.max(y-1,0)*COLS+Math.max(x-1,0)])*.25);
   const vertex=row*(cols+1)+col,old=this.heapGeo.attributes.heapAmount.getX(vertex),height=h>0?old+(h*.8-old)*Math.min(1,dt*30):0;
   this.heapGeo.attributes.heapAmount.setX(vertex,height);
   const q=bentPoint(col/cols*W-300,400-row/rows*H,3+height,this.bend,this.pitch);p.setXYZ(vertex,q.x,q.y,q.z);
   if(this.heapShadowGeo){const shadow=bentPoint(Math.min(300,col/cols*W-300+height*.14),Math.max(-400,400-row/rows*H-height*.32),4.5,this.bend,this.pitch);this.heapShadowGeo.attributes.position.setXYZ(vertex,shadow.x,shadow.y,shadow.z);this.heapShadowGeo.attributes.heapAmount.setX(vertex,height);}
  }
  p.needsUpdate=true;this.heapGeo.attributes.heapAmount.needsUpdate=true;if(this.heapShadowGeo){this.heapShadowGeo.attributes.position.needsUpdate=true;this.heapShadowGeo.attributes.heapAmount.needsUpdate=true;}if(this.heap?.visible!==false&&this.renderTick++%4===0)this.heapGeo.computeVertexNormals();
 }
 updateBend(amount,pitch=amount*.58){
  if(amount<=1e-6)amount=0;
  if(pitch<=1e-6)pitch=0;
  if(amount===this.bend&&pitch===(this.pitch||0))return;
  this.bend=amount;this.pitch=pitch;if(this.grainBendUniforms){this.grainBendUniforms.uSurfaceBend.value=amount;this.grainBendUniforms.uSurfacePitch.value=pitch;}
  for(const [mesh,base] of [[this.paper,this.paperBase],[this.edge,this.edgeBase]]){
   const p=mesh.geometry.attributes.position;
   for(let i=0;i<p.count;i++){const q=bentPoint(base[i*3],base[i*3+1],base[i*3+2],amount,pitch);p.setXYZ(i,q.x,q.y,q.z);}
   p.needsUpdate=true;mesh.geometry.computeVertexNormals();
  }
  const outline=this.paperOutline.geometry.attributes.position;for(let i=0;i<outline.count;i++){const q=bentPoint(this.outlineBase[i*3],this.outlineBase[i*3+1],this.outlineBase[i*3+2],amount,pitch);outline.setXYZ(i,q.x,q.y,q.z);}outline.needsUpdate=true;
 }
 setCardPose(paperPose,phase,bendPose){
  this.updateBend(bendPose.bend,bendPose.pitch);
  this.cardTapRoll=bendPose.roll||0;this.paperGroup.rotation.x=phase==='shake'?(bendPose.tiltY||0):paperPose.y;this.paperGroup.rotation.y=phase==='shake'?(bendPose.tiltX||0):paperPose.x;this.paperGroup.rotation.z=.018+this.cardTapRoll;this.paperGroup.position.z=phase==='shake'?(bendPose.lift||0):paperLift(paperPose);this.paperGroup.updateMatrixWorld(true);
 }
 markContacts(bound){
  const frame=Math.floor((this.time||0)*.06)%65536;let changed=0;
  for(let k=0;k<bound.length;k++)if(bound[k]&&!this.contactSeen[k]){this.contactSeen[k]=1;const i=k*4;this.contactData[i]=255;this.contactData[i+1]=frame%256;this.contactData[i+2]=Math.floor(frame/256);this.contactData[i+3]=255;changed++;}
  if(changed)this.contactTexture.needsUpdate=true;
  return changed;
 }
 setActiveCoat(mask,glitter,lines){
  for(const [key,image] of [['uActiveMask',mask],['uActiveGlitter',glitter],['uLineArt',lines]]){
   const uniform=this.coatUniforms[key];if(uniform.value?.image!==image){uniform.value?.dispose();const texture=new T.Texture(image);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=this.paperTexture.anisotropy;texture.needsUpdate=true;uniform.value=texture;}else if(key==='uActiveGlitter')uniform.value.needsUpdate=true;
  }
 }
 setCoatMask(canvas){this.coatMask.image=canvas;this.coatMask.needsUpdate=true;}
 preserve(sand){this.collectSpill(sand);}
 collectSpill(sand,outsideOnly=false){
  this.paperGroup.updateMatrixWorld(true);const color=new T.Color(this.colors[this.activeColor]);
  for(let i=0;i<sand.count;i++)if(sand.state[i]!==BOUND&&sand.state[i]!==LOST&&this.spills.length<MAX_RENDER_GRAINS){
   if(outsideOnly&&(sand.state[i]!==FREE||sand.cell(sand.x[i],sand.y[i])>=0))continue;
   const outside=sand.cell(sand.x[i],sand.y[i])<0,exit=outside?paperExit(sand.previousX[i],sand.previousY[i],sand.x[i],sand.y[i]):null;
   const x=exit?exit.x:sand.x[i],y=exit?exit.y:sand.y[i];
   const q=bentPoint(x-300,400-y,3+(sand.state[i]===FREE?Math.min(MAX_GRAIN_HEIGHT,sand.z[i]):sand.z[i]),this.bend,this.pitch);
   // Offset along the bent surface tangent, rather than sampling past its lip:
   // bentPoint deliberately treats y < -400 as detached, flat coordinates.
   if(exit){const offset=surfaceVelocity(x-300,exit.nx*2,exit.ny*2,this.bend,this.pitch);q.x+=offset.x;q.y+=offset.y;q.z+=offset.z;}
   const m=this.paperGroup.matrixWorld.elements,wx=m[0]*q.x+m[4]*q.y+m[8]*q.z+m[12],wy=m[1]*q.x+m[5]*q.y+m[9]*q.z+m[13],wz=m[2]*q.x+m[6]*q.y+m[10]*q.z+m[14];
   const tangent=exit?exitVelocity(exit,sand.vx[i],sand.vy[i],this.draining):{vx:sand.vx[i],vy:sand.vy[i]};
   const speed=surfaceVelocity(x-300,tangent.vx,tangent.vy,this.bend,this.pitch);speed.z+=Math.min(-15,sand.vz[i]);
   const vx=m[0]*speed.x+m[4]*speed.y+m[8]*speed.z,vy=m[1]*speed.x+m[5]*speed.y+m[9]*speed.z,vz=m[2]*speed.x+m[6]*speed.y+m[10]*speed.z;
   const detached={x:wx,y:wy,z:wz,vx,vy,vz,seed:sand.seed[i],dust:!!sand.dust?.[i],tiny:!!sand.finishDust?.[i],fadeOnExit:!this.draining,fadeAge:0,edge:exit?.edge||'bottom',color};if(this.settings?.recovery==='table')startTable(detached);else if(this.settings?.recovery&&this.settings.recovery!=='classic'){detached.fadeOnExit=false;startRecovery(detached);}this.spills.push(detached);sand.state[i]=LOST;sand.lost++;
  }
 }
 beginCleanup(){this.draining=true;this.recovery?.open();if((!this.settings.recovery||this.settings.recovery==='classic')&&!this.recovery?.deposited){this.collectedCount=0;this.collected.count=0;this.catchSamples=[];this.catchSampleCursor=0;}this.trayBins.fill(0);this.jarFill.material.color.set(this.colors[this.activeColor]);}
 updateCollector(phase,dt){
  this.draining=phase==='shake';this.boxMotion=Math.max(0,Math.min(1,this.boxMotion+(this.draining?1:-1)*dt*2.8));
  this.boxGroup.visible=(!this.settings.recovery||this.settings.recovery==='classic')&&this.boxMotion>0;this.boxGroup.position.y=FUNNEL.centerY-(1-smooth(this.boxMotion))*360;
  this.collectorBox.centerY=this.boxGroup.position.y;
  if(this.recovery){this.recovery.style=this.settings.recovery||'classic';this.recoveryVisual.update(this.recovery.style,this.recovery,grainScale(this.settings),this.colors[this.activeColor],phase!=='complete'&&!this.galleryActive&&!this.entry,this.collectedCount);}
  const fill=Math.min(62,Math.cbrt(this.collectedCount)*1.2*Math.pow(grainScale(this.settings),.65));this.jarFill.visible=this.collectedCount>0;this.jarFill.scale.y=Math.max(.01,fill);this.jarFill.position.z=FUNNEL.bottom+fill/2;this.collected.position.set(0,0,FUNNEL.bottom+fill);
  for(let side=0;side<2;side++){
   const hand=this.hands[side];hand.visible=this.draining;const x=side?300:-300,q=bentPoint(x,0,5,this.bend,this.pitch);
   hand.position.set(q.x+(side?8:-8),q.y,q.z+this.paperGroup.position.z);hand.rotation.set(0,(side?-1:1)*this.bend*.7,0);
  }
 }
 catchGrain(p){
  const samples=this.catchSamples||(this.catchSamples=[]),i=this.catchSampleCursor||0;samples[i]=p;this.catchSampleCursor=(i+1)%JAR_SAMPLES;this.collectedCount+=p.mass||1;this.collectedDirty=true;
 }

 updateSpill(dt,sync=true){
  let out=0;const recovery=this.recovery;this.tableTime=(this.tableTime||0)+dt;
  for(const p of this.spills){
   if(p.table){
    const wasRest=p.tableRest;
    if(stepTable(p,dt)){this.tableActive--;this.tableCleared+=p.mass||1;if(p.recoveryMass)recovery.clear(p.mass);continue;}
    if(!wasRest&&p.tableRest)this.landOnTable(p);
   }else if(p.recovery){
    if(stepRecovery(p,dt)){
     if(p.recovery==='intake')recovery.deposit(p.mass||1);
     else{recovery.catch(p.mass);this.catchGrain(p);}continue;
    }
   }else{
    p.fadeAge=(p.fadeAge||0)+dt;if(p.fadeOnExit&&exitOpacity(p.fadeAge)<=0)continue;
    if(stepFunnel(p,dt,!p.fadeOnExit&&this.boxMotion>.95?this.collectorBox:NO_FUNNEL)){this.catchGrain(p);continue;}
   }
   this.spills[out++]=p;
  }
  this.spills.length=out;
  if(recovery?.pending)recovery.step(dt,packet=>{const p=transferPacket(packet,recovery.style,this.recoveryColor);if(recovery.style==='table'){p.recoveryMass=true;startTable(p);}this.spills.push(p);});
  if(sync)this.syncSpills();
 }
 syncSpills(){
  if(this.spills.length>this.spill.instanceMatrix.count)this.ensureGrainCapacity('spill',this.spills.length);
  const matrix=this.spill.instanceMatrix.array,colours=this.spill.instanceColor.array,alpha=this.spill.geometry.attributes.grainOpacity,seeds=this.spill.geometry.attributes.flakeSeed,projected=this.spillProjection||(this.spillProjection=new T.Vector3()),size=grainScale(this.settings),cx=Math.cos(.2),sx=Math.sin(.2),cy=Math.cos(.1),sy=Math.sin(.1);let out=0,kept=0,fading=false;
  for(const p of this.spills){
   if(p.tableRest){this.spills[kept++]=p;continue;}
   projected.set(p.x,p.y,p.z).project(this.camera);
   if(projected.y>1.3||projected.y< -1.15||Math.abs(projected.x)>1.3||projected.z>1){if(p.recovery||p.table)this.spills[kept++]=p;continue;}this.spills[kept++]=p;
   const cs=p.cs??(p.cs=Math.cos(p.seed*79)),sn=p.sn??(p.sn=Math.sin(p.seed*79)),scale=(1.8+p.seed)*size*(p.tiny?FINISH_DUST_SCALE:1),j=out*16,k=out*3;
   matrix[j]=cy*cs*scale;matrix[j+1]=(cx*sn+sx*sy*cs)*scale;matrix[j+2]=(sx*sn-cx*sy*cs)*scale;matrix[j+3]=0;
   matrix[j+4]=-cy*sn*scale;matrix[j+5]=(cx*cs-sx*sy*sn)*scale;matrix[j+6]=(sx*cs+cx*sy*sn)*scale;matrix[j+7]=0;
   matrix[j+8]=sy*scale;matrix[j+9]=-sx*cy*scale;matrix[j+10]=cx*cy*scale;matrix[j+11]=0;
   matrix[j+12]=p.x;matrix[j+13]=p.y;matrix[j+14]=p.z;matrix[j+15]=1;
   colours[k]=p.color.r;colours[k+1]=p.color.g;colours[k+2]=p.color.b;alpha.array[out]=p.fadeOnExit?exitOpacity(p.fadeAge):1;seeds.array[out]=p.seed;fading ||=!!p.fadeOnExit;out++;
  }
  this.spills.length=kept;this.spill.count=out;this.spillUploadBytes=out*84;
  // Full-opacity funnel flow writes depth; this avoids the dense transparent
  // overdraw hotspot. Only the short legacy edge fade needs alpha blending.
  if(this.spill.material.transparent!==fading){this.spill.material.transparent=fading;this.spill.material.depthWrite=!fading;this.spill.material.needsUpdate=true;}
  for(const attr of [this.spill.instanceMatrix,this.spill.instanceColor,alpha,seeds]){attr.clearUpdateRanges();if(out){attr.addUpdateRange(0,out*attr.itemSize);attr.needsUpdate=true;}}
  if(this.collectedDirty){
   const object=this.spillObject,samples=this.catchSamples||[];
   for(let i=0;i<samples.length;i++){const p=samples[i],seed=p.seed,angle=seed*7919,r=Math.sqrt(seed*197%1)*35;
    object.position.set(Math.cos(angle)*r,Math.sin(angle)*r,seed*13%1*2);object.rotation.set(.05,.03,seed*79);const grain=size*(p.tiny?FINISH_DUST_SCALE:1);object.scale.set(2.1*grain,2.1*grain,.65*grain);object.updateMatrix();
    this.collected.setMatrixAt(i,object.matrix);this.collected.setColorAt(i,p.color);this.collected.geometry.attributes.flakeSeed.setX(i,seed);
   }
   this.collected.count=samples.length;
   for(const attr of [this.collected.instanceMatrix,this.collected.instanceColor,this.collected.geometry.attributes.flakeSeed]){attr.clearUpdateRanges();if(samples.length){attr.addUpdateRange(0,samples.length*attr.itemSize);attr.needsUpdate=true;}}
   this.collectedDirty=false;
  }
 }

 reset(){this.resetTable();this.recovery?.reset();if(this.recoveryVisual)this.recoveryVisual.group.visible=false;this.catchSamples=[];this.catchSampleCursor=0;this.collectedDirty=false;this.galleryFrame.visible=this.gallerySides.visible=false;this.floor.material.color.copy(this.floorRestColor);this.finishClock=0;this.heroProgress=0;this.celebration.visible=false;this.coatUniforms.uCelebrate.value=0;this.camera.position.copy(this.playCameraPosition);this.camera.quaternion.copy(this.playCameraQuaternion);this.stand.visible=false;for(const jar of this.jars)jar.visible=false;this.savedCount=0;this.current.count=0;this.spills.length=0;this.spill.count=0;this.currentInitialized=0;this.collectedCount=0;this.collected.count=0;this.boxMotion=0;this.boxGroup.visible=false;this.updateBend(0);}
 setPeelPiece(image,piece){
  this.peelPiece=piece;this.peelAnchor=piece.grip;
  const {w,h}=piece.bounds,step=this.settings.profile==='economy'?14:10;
  this.peelSegments={x:Math.max(4,Math.ceil(w/step)),y:Math.max(4,Math.ceil(h/step))};
  this.peelGeo.dispose();this.peelGeo=new T.PlaneGeometry(w,h,this.peelSegments.x,this.peelSegments.y);this.peelSheet.geometry=this.peelGeo;this.peelGeo.setAttribute('peelLift',new T.Float32BufferAttribute(new Float32Array(this.peelGeo.attributes.position.count),1));
  this.peelSheet.material.map?.dispose();this.peelSheet.material.map=new T.CanvasTexture(image);this.peelSheet.material.map.colorSpace=T.SRGBColorSpace;this.peelSheet.customDepthMaterial.map=this.peelSheet.material.map;this.peelSheet.customDepthMaterial.alphaTest=.08;this.peelSheet.customDepthMaterial.needsUpdate=true;this.peelSheet.material.color.set('#ffffff');this.peelSheet.material.needsUpdate=true;this.peelProgress(0);
 }
 peelProgress(progress){
  this.peelValue=progress;if(!this.peelPiece)return;
  this.peelSheet.visible=progress>.2&&progress<1;const p=this.peelGeo.attributes.position,lift=this.peelGeo.attributes.peelLift,front=peelFront(this.peelPiece,progress),{x:nx,y:ny}=this.peelSegments,b=this.peelPiece.bounds;
  for(let row=0;row<=ny;row++)for(let col=0;col<=nx;col++){
   const x=b.x+col/nx*b.w,y=b.y+row/ny*b.h,q=peelPoint(this.peelPiece,x,y,progress),i=row*(nx+1)+col;const along=(x-this.peelPiece.grip.x)*this.peelPiece.axis.x+(y-this.peelPiece.grip.y)*this.peelPiece.axis.y;lift.setX(i,front-along);p.setXYZ(i,q.x,q.y,q.z);
  }
  p.needsUpdate=true;lift.needsUpdate=true;this.peelGeo.computeVertexNormals();
 }
 paperChanged(){this.paperTexture.needsUpdate=true}
 render(sand,{time,dt,realDt=dt,phase,down,pointer,peeled,pour,brushMotion={dx:0,dy:0,speed:0,load:0},paperPose={x:0,y:0,cup:0},paperHeld=false,showBrush=true,shakeProgress=0,cleanupPose=null,finished=false}){
  this.time=time;const pose=phase==='shake'?(cleanupPose||drainPose(shakeProgress)):{bend:paperPose.cup,pitch:paperPose.pitch||0};this.setCardPose(paperPose,phase,pose);this.updateCompletion(finished,realDt,time);this.updateCollector(finished||this.galleryActive||this.entry?'complete':phase,finished||this.galleryActive||this.entry?realDt:0);this.coatUniforms.uTiltGrip.value=this.settings.controlMode==='tilt'?1:0;this.coatUniforms.uTime.value=time*.001;this.workAlpha=finished?0:workOpacity(this.heroProgress,this.entry,this.reducedMotion.matches);this.workUniform.value=this.workAlpha;this.coatUniforms.uActiveAlpha.value=finished?1:this.workAlpha;
  if(this.entry?.stage==='out'){const p=entryProgress(this.entry.age*1.3,this.reducedMotion.matches);this.updateBend(pose.bend*p,pose.pitch*p);this.paperGroup.rotation.x=paperPose.y*p;this.paperGroup.rotation.y=paperPose.x*p;}
  if(this.workAlpha>.001&&!finished)this.updateGrains(sand);this.current.visible=this.workAlpha>.001&&!finished;this.syncSpills();this.syncTable();this.tablePool.visible=this.workAlpha>.001;
  const showHeap=this.settings.relief&&this.workAlpha>.001&&!finished&&phase!=='shake'&&sand.surfaceCount>0;
  this.heap.visible=showHeap&&!sand.granular;this.heapShadow.visible=showHeap;this.heapShadow.material.opacity=(sand.granular?.10:.23)*this.workAlpha;if(showHeap)this.updateHeap(sand,dt);
  if(this.settings.movingLight){
   this.key.position.x+=((-300+(pointer.x-300)*.4+Math.sin(time*.00023)*50)-this.key.position.x)*.045;
   this.key.position.y+=((340-(pointer.y-400)*.25)-this.key.position.y)*.045;
  }
  this.sparkLight.set(this.key.position.x*.0015,this.key.position.y*.0015,1).normalize();
  if(paperHeld&&phase==='brush')for(let i=0;i<2;i++){const q=bentPoint(i?300:-300,0,5,this.bend,this.pitch),hand=this.hands[i];hand.visible=true;hand.position.copy(this.paperGroup.localToWorld(new T.Vector3(q.x+(i?8:-8),q.y,q.z)));hand.rotation.y=(i?-1:1)*this.bend*.7;}
  this.brush.visible=showBrush&&phase==='brush'&&pointer.visible&&!finished;this.tweezers.visible=phase==='rolling';this.hint.visible=phase==='peel';
  if(phase==='peel'){this.hint.position.set(this.peelAnchor.x-300,400-this.peelAnchor.y,12);this.hint.material.opacity=.65+.25*Math.sin(time*.004);}
  if(phase==='rolling'&&this.peelPiece){
   const progress=this.peelValue||0,q=peelPoint(this.peelPiece,this.peelAnchor.x,this.peelAnchor.y,progress),approach=1-smooth(progress/.17);
   const angle=Math.atan2(-this.peelPiece.axis.y,this.peelPiece.axis.x)-Math.PI/2;
   this.tweezers.position.lerp(new T.Vector3(q.x+Math.sin(angle)*4+approach*110,q.y-Math.cos(angle)*4+approach*90,q.z-20+approach*110),Math.min(1,dt*18));this.tweezers.rotation.z=angle;
  }
  const rate=Math.min(1,dt*35);this.brushPoint.x+=(pointer.x-this.brushPoint.x)*rate;this.brushPoint.y+=(pointer.y-this.brushPoint.y)*rate;
  const brushCell=sand.cell(pointer.x,pointer.y),brushHeight=brushCell<0?0:sand.height[brushCell];
  this.brush.position.set(this.brushPoint.x-300,400-this.brushPoint.y,down?4+Math.min(brushHeight*.15,9):28);
  if(down&&brushMotion.speed>12){const desired=Math.atan2(-brushMotion.dy,brushMotion.dx)-Math.PI/2,delta=Math.atan2(Math.sin(desired-this.brushAngle),Math.cos(desired-this.brushAngle));this.brushAngle+=delta*Math.min(1,dt*13);}
  this.brush.rotation.z=this.brushAngle;
  const variant=this.brushVariants[this.settings.brushShape]||this.brushVariants.flat,flex=down?Math.min(1,.15+brushMotion.speed/700+brushMotion.load*.3):0;
  variant.tuft.scale.set(1+flex*.13,1-flex*.16,1-flex*.35);variant.tuft.rotation.x=-flex*.12;
  const p=variant.strands.geometry.attributes.position,base=variant.base;
  for(let i=0;i<p.count;i++){const tip=i%2;p.setXYZ(i,base[i*3]*(1+tip*flex*.2),base[i*3+1]+tip*flex*5,base[i*3+2]*(1-tip*flex*.55));}p.needsUpdate=true;
  variant.mat.color.set('#b58b55').lerp(new T.Color(this.colors[this.activeColor]),Math.min(.4,brushMotion.load*.5));
  if(phase==='shake'&&cleanupPose&&!this.galleryActive&&!this.entry){
   for(let side=0;side<2;side++){const hand=this.hands[side],x=side?300:-300,y=370*(cleanupPose.gripTop||0),q=bentPoint(x,y,5,this.bend,this.pitch);hand.position.copy(this.paperGroup.localToWorld(new T.Vector3(q.x+(side?8:-8),q.y,q.z)));}
   if(cleanupPose.sweep){this.hands[1].visible=false;const hand=this.hands[0],t=smooth(cleanupPose.sweepProgress||0);hand.position.copy(this.paperGroup.localToWorld(new T.Vector3(-240+480*t,cleanupPose.sweepY||0,18)));hand.rotation.set(0,0,-.9);}
  }
  this.posePour(pour);
  const sampleCount=this.settings.sparkles&&!finished?Math.min(sand.count,28):0;
  for(let j=0;j<28;j++){
   const sp=this.glints[j],i=sand.count?Math.floor((j*7919+3571)%sand.count):0;
   if(j>=sampleCount||sand.state[i]===LOST||sand.state[i]===AIR){sp.visible=false;continue;}
   const flash=Math.pow(Math.max(0,Math.sin(time*.0015+sand.seed[i]*300+this.sparkLight.x*8+this.sparkLight.y*5)),28);
   const k=sand.cell(sand.x[i],sand.y[i]);if(flash<.1||(sand.state[i]===FREE&&k>=0&&sand.z[i]<sand.height[k]*.73)){sp.visible=false;continue;}
   sp.visible=true;const glintPoint=bentPoint(sand.x[i]-300,400-sand.y[i],sand.z[i]+4,this.bend,this.pitch);sp.position.set(glintPoint.x,glintPoint.y,glintPoint.z);sp.scale.setScalar(8+flash*7);sp.material.opacity=flash*.8;
  }
  if(this.galleryActive||finished||this.entry){this.brush.visible=this.tweezers.visible=this.hint.visible=this.peelSheet.visible=false;if(this.workAlpha<=.001)this.current.visible=this.heap.visible=this.heapShadow.visible=false;for(const hand of this.hands)hand.visible=false;for(const jar of this.jars)jar.visible=false;for(const glint of this.glints)glint.visible=false;}
  this.spill.visible=this.workAlpha>.001;
  this.renderer.render(this.scene,this.camera);
 }
 capture(){this.renderer.render(this.scene,this.camera);return this.canvas.toDataURL('image/png')}
}
