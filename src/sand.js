import {materialResponse} from './feel.js';
// Each particle is material. A brush may move it, but cannot create or stamp it.
export const AIR=0, FREE=1, BOUND=2, LOST=3;
export const W=600,H=800,CELL=5,COLS=W/CELL,ROWS=H/CELL;
export const MAX_HEAP_HEIGHT=52;
export const MAX_GRAIN_HEIGHT=MAX_HEAP_HEIGHT+2;
const FLOW_X=[-1,1,0,0,-.707,.707,-.707,.707],FLOW_Y=[0,0,-1,1,-.707,-.707,.707,.707];
export class Sand {
  constructor({capacity=48000,random=Math.random}={}) {
    this.heapDepth=1.25;this.behavior=materialResponse();this.lastMoved=0;this.capacity=capacity;this.random=random;this.time=0;this.count=0;this.emitted=0;
    for (const name of ['x','y','z','vx','vy','vz','seed','contactTime','previousX','previousY','roll']) this[name]=new Float32Array(capacity);
    this.dust=new Uint8Array(capacity);this.pressed=new Uint8Array(capacity);this.freshCount=0;this.state=new Uint8Array(capacity);this.bin=new Int32Array(capacity);
    this.density=new Float32Array(COLS*ROWS);this.height=new Float32Array(COLS*ROWS);this.pressure=new Float32Array(COLS*ROWS);this.top=new Float32Array(COLS*ROWS);this.moundDensity=new Float32Array(COLS*ROWS);this.moundHeight=new Float32Array(COLS*ROWS);
    this.ground=new Int32Array(COLS*ROWS);this.slopeX=new Float32Array(COLS*ROWS);this.slopeY=new Float32Array(COLS*ROWS);
    this.neighbors=new Int32Array(COLS*ROWS*8);
    for(let k=0;k<COLS*ROWS;k++){const c=k%COLS,r=(k/COLS)|0;this.neighbors.set([c>0?k-1:k,c<COLS-1?k+1:k,r>0?k-COLS:k,r<ROWS-1?k+COLS:k,r>0&&c>0?k-COLS-1:k,r>0&&c<COLS-1?k-COLS+1:k,r<ROWS-1&&c>0?k+COLS-1:k,r<ROWS-1&&c<COLS-1?k+COLS+1:k],k*8);}
    this.flowSum=new Float32Array(COLS*ROWS);this.flowCDF=new Float32Array(COLS*ROWS*8);this.flowForce=new Float32Array(COLS*ROWS*8);
    this.bound=new Uint8Array(COLS*ROWS);this.target=new Uint8Array(COLS*ROWS);
    this.mask=new Uint8Array(W*H);this.targetCount=0;this.coveredWeight=0;this.lost=0;
  }
  reserve(capacity){
    if(capacity<=this.capacity)return;
    for(const key of ['x','y','z','vx','vy','vz','seed','contactTime','previousX','previousY','roll','dust','pressed','state','bin']){const previous=this[key],next=new previous.constructor(capacity);next.set(previous);this[key]=next;}
    this.capacity=capacity;
  }
  setMask(mask) {
    this.mask.set(mask);this.target.fill(0);this.bound.fill(0);this.targetCount=0;this.coveredWeight=0;
    for(let y=0;y<H;y+=CELL)for(let x=0;x<W;x+=CELL){
      let hits=0;for(let dy=0;dy<CELL;dy++)for(let dx=0;dx<CELL;dx++)hits+=!!mask[(y+dy)*W+x+dx];
      if(hits>=1){this.target[(y/CELL)*COLS+x/CELL]=hits;this.targetCount+=hits/(CELL*CELL);}
    }
  }
  cell(x,y){return x>=0&&x<W&&y>=0&&y<H?Math.floor(y/CELL)*COLS+Math.floor(x/CELL):-1}
  onGlue(x,y){return x>=0&&x<W&&y>=0&&y<H&&this.mask[(y|0)*W+(x|0)]>0}
  emit(x,y,n,{spread=13,height=165,fan=16}={}){
    if(!Number.isFinite(x)||!Number.isFinite(y))throw new TypeError("A pile needs finite paper coordinates");
    let added=0;
    for(let j=0;j<n&&this.count<this.capacity;j++){
      const i=this.count++,a=this.random()*Math.PI*2,r=Math.sqrt(this.random())*spread;
      this.dust[i]=0;this.pressed[i]=0;this.seed[i]=this.random();this.x[i]=x+Math.cos(a)*r;this.y[i]=y+Math.sin(a)*r;
      this.previousX[i]=this.x[i];this.previousY[i]=this.y[i];this.roll[i]=0;this.z[i]=height+this.random()*32;this.vz[i]=-45-this.random()*35;const cone=Math.sqrt(this.random())*fan;this.vx[i]=Math.cos(a)*cone;this.vy[i]=Math.sin(a)*cone;this.state[i]=AIR;added++;
    }
    this.emitted+=added;return added;
  }
  bind(i,contact=false){
    if((!this.pressed[i]&&!contact)||this.state[i]===BOUND||this.state[i]===LOST)return false;
    const cell=this.cell(this.x[i],this.y[i]);if(cell<0)return false;
    let k=cell;
    // Tilt mode binds only a real surface packet already over this exact adhesive pixel.
    if(contact&&(this.state[i]!==FREE||this.z[i]>4.5||!this.target[k]||this.bound[k]||!this.onGlue(this.x[i],this.y[i])))return false;
    if(!this.target[k]||this.bound[k]||!this.onGlue(this.x[i],this.y[i])){
      // Surface grains roll a few millimetres into neighbouring adhesive gaps.
      // This consumes a real packet, including at a one-pixel stencil boundary.
      let nearest=65,point=null;
      const cx=cell%COLS,cy=Math.floor(cell/COLS);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const col=cx+dx,row=cy+dy;if(col<0||col>=COLS||row<0||row>=ROWS)continue;
        const candidate=row*COLS+col;if(!this.target[candidate]||this.bound[candidate])continue;
        for(let y=row*CELL;y<(row+1)*CELL;y++)for(let x=col*CELL;x<(col+1)*CELL;x++){
          const distance=(x+.5-this.x[i])**2+(y+.5-this.y[i])**2;
          if(distance<nearest&&this.mask[y*W+x]){nearest=distance;point={x:x+.5,y:y+.5,k:candidate};}
        }
      }
      if(!point)return false;this.x[i]=point.x;this.y[i]=point.y;k=point.k;
    }
    this.state[i]=BOUND;this.z[i]=1.7+this.seed[i]*.8;this.vx[i]=this.vy[i]=this.vz[i]=0;
    // One finite material packet coats the mask pixels inside one 5 mm cell.
    // Its visible grain texture is dense; no thousands of static meshes remain.
    this.coveredWeight+=this.target[k]/(CELL*CELL);
    this.bound[k]++;return true;
  }
  setBehavior(settings){this.behavior=materialResponse(settings);this.heapDepth=settings.heapDepth||1.25}
  brush(from,to,radius=34,seconds=1/60){
    const dx=to.x-from.x,dy=to.y-from.y,d2=dx*dx+dy*dy,d=Math.sqrt(d2);if(d<.02)return 0;
    const rr=radius*radius,ux=dx/d,uy=dy/d,b=this.behavior,speed=Math.min(1.5,d/Math.max(.001,seconds)/700);let moved=0;
    // A swept capsule visits each mobile packet once, including fast strokes.
    for(let i=0;i<this.count;i++){
      if(this.state[i]!==FREE)continue;
      const t=Math.max(0,Math.min(1,((this.x[i]-from.x)*dx+(this.y[i]-from.y)*dy)/d2));
      const ax=this.x[i]-from.x-t*dx,ay=this.y[i]-from.y-t*dy,q=ax*ax+ay*ay;if(q>rr)continue;
      // Bristles shear and fan real grains, rather than dragging a rigid blob.
      // Never move material farther merely because a pointer sends more events.
      const contact=Math.sqrt(Math.max(0,1-q/rr)),cell=this.cell(this.x[i],this.y[i]);
      const load=cell<0?0:this.density[cell],mass=1/(1+Math.min(70,load)*.0006/b.response);
      const strength=b.carry*(.95+.05*contact)*(.95+.05*this.seed[i])*mass,travel=d*(1-t)*strength;
      const side=(ax*(-uy)+ay*ux)/radius,fan=(side+(this.seed[i]*137%1-.5)*.4)*b.fan*(.65+.35*speed);
      this.pressed[i]=1;this.contactTime[i]=this.time;
      if(cell>=0)this.z[i]=Math.min(this.z[i],1.7+this.height[cell]*.32*(.1+this.seed[i]*.9));
      const steps=Math.max(1,Math.ceil(travel/4));
      for(let n=0;n<steps;n++){
        this.x[i]+=(ux-uy*fan)*travel/steps;this.y[i]+=(uy+ux*fan)*travel/steps;
        if(this.bind(i))break;
      }
      if(this.state[i]!==BOUND){const impulse=Math.max(.05,speed)*b.inertia;this.vx[i]=ux*impulse-uy*side*impulse*.45;this.vy[i]=uy*impulse+ux*side*impulse*.45;}
      moved++;
    }
    this.lastMoved=moved;return moved;
  }
  step(dt,{shaking=false,bend=shaking?1:0,tilt=bend*.58,tiltX=0,tiltY=0,cup=0,contactAdhesion=false,granular=contactAdhesion,refreshOnly=false}={}){
    this.time+=dt;this.granular=granular;this.ground.fill(-1);this.top.fill(0);this.surfaceCount=0;this.density.fill(0);this.moundDensity.fill(0);this.moundHeight.fill(0);this.freshCount=0;
    for(let i=0;i<this.count;i++)if(this.state[i]===FREE){const k=this.cell(this.x[i],this.y[i]);this.bin[i]=k;if(k>=0){if(granular&&(this.ground[k]<0||this.z[i]<this.z[this.ground[k]]))this.ground[k]=i;this.density[k]+=this.pressed[i]?.45:1;if(!this.pressed[i]){this.moundDensity[k]+=.95;this.freshCount++;}else if(this.z[i]>6){this.moundDensity[k]+=.65;}this.top[k]=Math.max(this.top[k],this.z[i]);this.surfaceCount++;}}
    for(let k=0;k<this.height.length;k++){
      this.pressure[k]=this.density[k]*.95;
      let load=this.density[k]*4,fresh=this.moundDensity[k]*4;
      for(let j=0;j<8;j++){const n=this.neighbors[k*8+j],weight=j<4?2:1;load+=this.density[n]*weight;fresh+=this.moundDensity[n]*weight;}
      load*=.95/16;fresh/=16;
      // Pressure can be large; the physical sheet of glitter cannot become a tower.
      this.height[k]=load>0?MAX_HEAP_HEIGHT*(1-Math.exp(-load*2.15*this.heapDepth/MAX_HEAP_HEIGHT)):0;
      let top=this.top[k];for(let j=0;j<8;j++)top=Math.max(top,this.top[this.neighbors[k*8+j]]);
      this.moundHeight[k]=fresh>0?Math.min(top,MAX_HEAP_HEIGHT*(1-Math.exp(-fresh*2.15*this.heapDepth/MAX_HEAP_HEIGHT))):0;
    }
    if(refreshOnly)return;
    // Pressure is a property of a cell, computed once rather than allocating
    // neighbour lists for every flake on every frame.
    for(let k=0;k<this.height.length;k++){
      if(granular){
        // A height gradient produces avalanches; the same force cannot translate
        // an entire mound as one disk. Only slopes above repose yield.
        const n=k*8,dx=(this.height[this.neighbors[n+1]]-this.height[this.neighbors[n]])/(2*CELL),dy=(this.height[this.neighbors[n+3]]-this.height[this.neighbors[n+2]])/(2*CELL);
        this.slopeX[k]=Math.sign(dx)*Math.min(.8,Math.max(0,Math.abs(dx)-.14));this.slopeY[k]=Math.sign(dy)*Math.min(.8,Math.max(0,Math.abs(dy)-.14));continue;
      }
      const h=this.pressure[k],repose=this.behavior.repose;this.flowSum[k]=0;if(h<=repose)continue;
      let sum=0;
      for(let j=0;j<8;j++){const force=Math.max(0,Math.min((h-this.pressure[this.neighbors[k*8+j]])/(j<4?1:1.414)-repose,45))*55*this.behavior.pressure;this.flowForce[k*8+j]=force;sum+=force;this.flowCDF[k*8+j]=sum;}
      this.flowSum[k]=sum;
    }
    const friction=Math.exp(-this.behavior.drag*(granular?.58:1)*dt);
    for(let i=0;i<this.count;i++){
      const s=this.state[i];if(s===BOUND||s===LOST)continue;
      let k=this.cell(this.x[i],this.y[i]);
      if(shaking&&k<0){this.vz[i]-=900*dt;this.z[i]+=this.vz[i]*dt;}
      if(shaking&&k>=0){
        const offset=this.x[i]-W/2;
        this.vx[i]-=1150*Math.sin(offset/300*1.22*bend)*dt;
        const channel=Math.max(.05,1-(Math.abs(offset)/140)**2);
        this.vy[i]+=1150*Math.sin(tilt)*channel*dt;
        this.vx[i]*=Math.exp(-4.5*dt);this.vy[i]*=Math.exp(-.65*dt);
        this.z[i]+=(2.5+this.seed[i]*1.1-this.z[i])*Math.min(1,dt*14);
      }
      if(s===AIR){
        const previousZ=this.z[i];this.vz[i]-=1050*dt;this.z[i]+=this.vz[i]*dt;
        const floor=k<0?1:this.height[k]+2;
        if(this.z[i]<=floor){this.state[i]=FREE;this.z[i]=Math.max(1.7,Math.min(previousZ,floor));this.vz[i]=0;this.vx[i]+=(this.random()-.5)*24;this.vy[i]+=(this.random()-.5)*24;}
      }else if(k<0&&!shaking){
        this.vz[i]-=900*dt;this.z[i]=Math.max(-9,this.z[i]+this.vz[i]*dt);if(this.z[i]<=-9)this.vz[i]=0;
      }else if(k>=0&&!shaking){
        const h=this.height[k];let fx=980*(granular?2.4:1)*Math.sin(tiltX)-220*Math.sin((this.x[i]-300)/300*cup),fy=980*(granular?2.4:1)*Math.sin(tiltY);
        if(!granular&&this.flowSum[k]>0){
          const choice=((this.seed[i]+this.time*.17)%1)*this.flowSum[k];let j=0;
          while(j<7&&choice>this.flowCDF[k*8+j])j++;
          const force=this.flowForce[k*8+j],skew=(this.seed[i]*97%1-.5)*.75;fx+=(FLOW_X[j]-FLOW_Y[j]*skew)*force;fy+=(FLOW_Y[j]+FLOW_X[j]*skew)*force;
        }
        if(granular){
          const layer=Math.min(1,Math.max(0,(this.z[i]-1.7)/(h+1))),rough=this.seed[i]*137%1;
          fx-=760*this.slopeX[k];fy-=760*this.slopeY[k];
          const frictionFeel=this.behavior.drag/13;
          let speed=Math.hypot(this.vx[i],this.vy[i]);const force=Math.hypot(fx,fy),staticFriction=(150+(1-layer)*170+rough*100)*frictionFeel;
          if(speed<2&&force<staticFriction){this.vx[i]=this.vy[i]=0;}
          else {
            // Grain-scale friction and depth shear make upper grains overtake
            // lower grains. Rolling collisions deflect moving grains only.
            const jitter=(this.seed[i]*197%1-.5)*Math.min(1,speed/35)*95,ux=speed>1?this.vx[i]/speed:0,uy=speed>1?this.vy[i]/speed:0;
            this.vx[i]+=(fx-uy*jitter)*dt;this.vy[i]+=(fy+ux*jitter)*dt;
            speed=Math.hypot(this.vx[i],this.vy[i]);const resistance=(75+(1-layer)*120+rough*75)*frictionFeel*dt,drag=Math.exp(-(3.2+(1-layer)*4.5+rough*2)*frictionFeel*dt);
            const scale=speed>0?Math.max(0,Math.min(400,speed-resistance))/speed*drag:0;this.vx[i]*=scale;this.vy[i]*=scale;
          }
          // Every occupied cell has an actual bottom grain. A permanent random
          // layer must never hold all material above exposed adhesive.
          const floor=this.ground[k]===i?1.7:1.7+h*(.03+this.seed[i]*.97);
          if(this.z[i]>floor){this.vz[i]=Math.min(0,this.vz[i])-900*dt;this.z[i]=Math.max(floor,this.z[i]+this.vz[i]*dt);if(this.z[i]===floor)this.vz[i]=0;}
          else {this.z[i]+=(floor-this.z[i])*Math.min(1,dt*6);this.vz[i]=0;}
        }else{
          this.vx[i]+=fx*dt;this.vy[i]+=fy*dt;
          const resting=1.7+h*(.10+this.seed[i]*.90),floor=this.pressed[i]?Math.min(this.z[i],resting):resting;
          this.z[i]+=(floor-this.z[i])*Math.min(1,dt*15);
        }
        if(this.pressed[i]&&this.time-this.contactTime[i]<.16&&this.z[i]<5.5)this.bind(i);
      }
      if(this.state[i]===BOUND)continue;
      const oldX=this.x[i],oldY=this.y[i];this.previousX[i]=oldX;this.previousY[i]=oldY;this.x[i]+=this.vx[i]*dt;this.y[i]+=this.vy[i]*dt;
      if(contactAdhesion&&!shaking&&this.state[i]===FREE&&this.z[i]<=4.5){
        const endX=this.x[i],endY=this.y[i],steps=Math.max(1,Math.ceil(Math.hypot(endX-oldX,endY-oldY)));
        for(let n=1;n<=steps;n++){this.x[i]=oldX+(endX-oldX)*n/steps;this.y[i]=oldY+(endY-oldY)*n/steps;if(this.bind(i,true))break;}
      }
      if(shaking&&this.y[i]>H-3&&Math.abs(this.x[i]-W/2)>102){this.y[i]=H-3;this.vy[i]=0;}
      if(granular)this.roll[i]+=Math.hypot(this.vx[i],this.vy[i])*dt*.065;
      if(!shaking&&(!granular||s===AIR)){const drag=s===AIR?Math.exp(-.7*dt):friction;this.vx[i]*=drag;this.vy[i]*=drag;}
      if(this.x[i]<-3000||this.x[i]>W+3000||this.y[i]<-3000||this.y[i]>H+3000){this.state[i]=LOST;this.lost++;}
    }
  }
  hasLoose(){for(let i=0;i<this.count;i++)if(this.state[i]===AIR||this.state[i]===FREE)return true;return false}
  removeLoose(){for(let i=0;i<this.count;i++)if(this.state[i]!==BOUND&&this.state[i]!==LOST){this.state[i]=LOST;this.lost++;}this.height.fill(0);this.density.fill(0);this.moundHeight.fill(0);this.freshCount=0}
  compact(){
    let out=0;
    for(let i=0;i<this.count;i++)if(this.state[i]!==LOST){
      if(out!==i){for(const key of ['x','y','z','vx','vy','vz','seed','contactTime','previousX','previousY','roll','dust','pressed','state','bin'])this[key][out]=this[key][i];}
      out++;
    }
    this.count=out;
  }
  get coverage(){if(!this.targetCount)return 0;const ratio=this.coveredWeight/this.targetCount;return ratio>1-1e-9?1:ratio}
  stats(){let air=0,free=0,bound=0,pressedFree=0;for(let i=0;i<this.count;i++){if(this.state[i]===AIR)air++;else if(this.state[i]===FREE){free++;if(this.pressed[i])pressedFree++;}else if(this.state[i]===BOUND)bound++;}return{air,free,bound,pressedFree,freshFree:free-pressedFree,maxMoundHeight:Math.max(...this.moundHeight),lost:this.lost,emitted:this.emitted,coverage:this.coverage,maxHeight:Math.max(...this.height)}}
}
