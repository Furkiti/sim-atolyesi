import * as T from 'three';
const TAU=Math.PI*2;
function rounded(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
const soft=(color)=>new T.MeshStandardMaterial({color,roughness:.67,metalness:0});
function plate(w,h,color,z=0){const m=new T.Mesh(new T.ExtrudeGeometry(rounded(w,h,Math.min(18,h*.3)),{depth:5,bevelEnabled:true,bevelSize:5,bevelThickness:4,bevelSegments:3,steps:1,curveSegments:10}),soft(color));m.position.z=z;return m;}
function rail(points,r,color){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),36,r,8,false),soft(color));}
function channel(points,r,color){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),vertices=[],indices=[],rows=36,columns=10;
 for(let i=0;i<=rows;i++){const p=curve.getPoint(i/rows),t=curve.getTangent(i/rows),length=Math.hypot(t.x,t.y)||1;
  for(let j=0;j<=columns;j++){const a=j/columns*Math.PI,lateral=Math.cos(a)*r;vertices.push(p.x-t.y/length*lateral,p.y+t.x/length*lateral,p.z-Math.sin(a)*r);}}
 for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){const a=i*(columns+1)+j,b=a+columns+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const material=soft(color);material.side=T.DoubleSide;return new T.Mesh(g,material);
}
export class RecoveryVisual {
 constructor(scene,texture,grainMaterial,makeGrains){
  this.group=new T.Group();this.group.position.set(0,-455,0);scene.add(this.group);this.group.visible=false;this.styles={};
  this.channels=new T.Group();this.group.add(this.channels);
  for(const side of [-1,1])this.channels.add(rail([[side*337,850,-15],[side*337,350,-15],[side*337,30,-12],[side*285,0,12]],3.5,'#9ab6a9'));
  const trough=new T.Group();trough.add(plate(638,98,'#a7cbb8'),plate(607,72,'#ece5cf',8));this.group.add(trough);this.styles.trough=trough;
  const rills=new T.Group();for(const side of [-1,1]){
   rills.add(channel([[side*306,27,8],[side*225,0,18],[side*125,-17,3],[0,-35,-20]],18,'#b2d0c7'));
   rills.add(channel([[side*306,27,10],[side*225,0,20],[side*125,-17,5],[0,-35,-18]],14,'#f0edd9'));
   const cap=plate(34,40,'#d89b84',11);cap.position.set(side*301,25,11);rills.add(cap);
  }this.group.add(rills);this.styles.rills=rills;
  const bowl=new T.Group(),profile=[[0,-12],[.3,-11],[.7,-4],[.96,12],[1,20],[1.02,23],[1.04,19],[1.025,10],[.95,-3],[.65,-21],[.2,-26],[0,-26]],geo=new T.LatheGeometry(profile.map(([r,z])=>new T.Vector2(r*300,z)),64);geo.rotateX(Math.PI/2);geo.scale(1,.20,1);bowl.add(new T.Mesh(geo,soft('#dfad9e')));const rim=new T.Mesh(new T.TorusGeometry(306,5,10,64),soft('#f1e1c8'));rim.scale.y=.20;rim.position.z=20;bowl.add(rim);this.group.add(bowl);this.styles.bowl=bowl;
  // A small visible throat keeps the final "filled the jar" beat in every style.
  this.neck=plate(65,31,'#cfdfc7',-18);this.neck.position.y=-48;this.group.add(this.neck);
  const glass=new T.MeshPhysicalMaterial({color:'#d6e6dd',transparent:true,opacity:.23,roughness:.2,metalness:0,depthWrite:false,side:T.DoubleSide});
  const jar=new T.Mesh(new T.CylinderGeometry(40,36,78,32,1,true),glass);jar.position.set(0,-111,-54);this.group.add(jar);
  for(const y of [-72,-150]){const ring=new T.Mesh(new T.TorusGeometry(y===-72?40:36,2.4,8,40),soft('#aec1b4'));ring.rotation.x=Math.PI/2;ring.position.set(0,y,-54);this.group.add(ring);}
  this.fill=new T.Mesh(new T.CylinderGeometry(34,32,1,32),new T.MeshStandardMaterial({color:'#b0315a',map:texture,bumpMap:texture,bumpScale:.7,roughness:.47,metalness:.55}));this.fill.position.set(0,-148,-54);this.group.add(this.fill);
  this.top=makeGrains(550);this.top.material=grainMaterial;this.group.add(this.top);this.top.count=550;const dummy=new T.Object3D(),color=new T.Color('#ffffff');
  for(let i=0;i<550;i++){const seed=(i*.61803398875)%1,r=Math.sqrt((i*.754877666)%1)*32,a=seed*TAU;dummy.position.set(Math.cos(a)*r,0,Math.sin(a)*r);dummy.rotation.set(Math.PI/2,0,a);dummy.scale.setScalar(1.8);dummy.updateMatrix();this.top.setMatrixAt(i,dummy.matrix);this.top.setColorAt(i,color);}this.top.instanceMatrix.needsUpdate=true;
  const bedGeometry=new T.PlaneGeometry(574,48,36,6);this.bed=new T.Mesh(bedGeometry,new T.MeshStandardMaterial({color:'#b0315a',map:texture,bumpMap:texture,bumpScale:1.3,roughness:.48,metalness:.55}));this.bed.position.z=17;this.group.add(this.bed);this.bedBase=bedGeometry.attributes.position.array.slice();this.amount=-1;
  this.gate=plate(58,12,'#789b86',23);this.gate.position.y=-34;this.group.add(this.gate);
 }
 update(style,model,size,color,visible,jarCount=model.jar){
  this.group.visible=visible&&style!=='classic';if(!this.group.visible)return;
  for(const [key,g] of Object.entries(this.styles))g.visible=style===key;
  const stored=model.stored,fill=Math.min(68,Math.cbrt(jarCount)*1.1*Math.pow(size,.65)),height=Math.min(22,Math.cbrt(stored)*.62),open=model.opened?Math.min(1,Math.max(0,(model.age-.35)/.4)):style==='rills'?1:0;
  this.gate.position.x=open*49;this.gate.visible=style==='trough';this.styles.bowl.rotation.x=style==='bowl'?open*.22:0;
  this.fill.visible=this.top.visible=jarCount>0;this.fill.scale.y=Math.max(.01,fill);this.fill.position.y=-149+fill/2;this.top.position.set(0,-149+fill,-54);if(this.topSize!==size){const ratio=size/(this.topSize||1),a=this.top.instanceMatrix.array;for(let i=0;i<550;i++)for(const k of [0,1,2,4,5,6,8,9,10])a[i*16+k]*=ratio;this.top.instanceMatrix.needsUpdate=true;this.topSize=size;}this.fill.material.color.set(color);this.top.material.color.set(color);
  const parent=style==='bowl'?this.styles.bowl:this.group;if(this.bed.parent!==parent)parent.add(this.bed);this.bed.visible=stored>0&&style!=='rills';this.bed.material.color.set(color);if(Math.abs(height-this.amount)>.08||this.bedStyle!==style){this.amount=height;this.bedStyle=style;const p=this.bed.geometry.attributes.position;
   for(let i=0;i<p.count;i++){const x=this.bedBase[i*3],y=this.bedBase[i*3+1],edge=Math.max(0,1-(x/294)**4)*Math.max(0,1-(y/29)**4);p.setY(i,style==='bowl'?y*Math.sqrt(Math.max(.05,1-(x/300)**2))*1.9:y);p.setZ(i,edge*height*(.86+.14*Math.sin(x*.063+y*.2)));}p.needsUpdate=true;this.bed.geometry.computeVertexNormals();}
 }
}
