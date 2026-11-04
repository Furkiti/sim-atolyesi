// Each particle is material. A brush may move it, but cannot create or stamp it.
export const AIR=0, FREE=1, BOUND=2, LOST=3;
export const W=600,H=800,CELL=5,COLS=W/CELL,ROWS=H/CELL;
const FLOW_X=[-1,1,0,0,-.707,.707,-.707,.707],FLOW_Y=[0,0,-1,1,-.707,-.707,.707,.707];
export class Sand {
  constructor({capacity=76000,random=Math.random}={}) {
    this.capacity=capacity;this.random=random;this.count=0;this.emitted=0;
    for (const name of ['x','y','z','vx','vy','vz','seed']) this[name]=new Float32Array(capacity);
    this.state=new Uint8Array(capacity);this.bin=new Int32Array(capacity);
    this.density=new Uint16Array(COLS*ROWS);this.height=new Float32Array(COLS*ROWS);
    this.flowSum=new Float32Array(COLS*ROWS);this.flowCDF=new Float32Array(COLS*ROWS*8);this.flowForce=new Float32Array(COLS*ROWS*8);
    this.bound=new Uint8Array(COLS*ROWS);this.target=new Uint8Array(COLS*ROWS);
    this.mask=new Uint8Array(W*H);this.targetCount=0;this.coveredWeight=0;this.lost=0;
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
  emit(x,y,n,{spread=13,height=165}={}){
    if(!Number.isFinite(x)||!Number.isFinite(y))throw new TypeError("A pile needs finite paper coordinates");
    let added=0;
    for(let j=0;j<n&&this.count<this.capacity;j++){
      const i=this.count++,a=this.random()*Math.PI*2,r=Math.sqrt(this.random())*spread;
      this.seed[i]=this.random();this.x[i]=x+Math.cos(a)*r;this.y[i]=y+Math.sin(a)*r;
      this.z[i]=height+this.random()*32;this.vz[i]=-45-this.random()*35;this.vx[i]=(this.random()-.5)*16;this.vy[i]=(this.random()-.5)*16;this.state[i]=AIR;added++;
    }
    this.emitted+=added;return added;
  }
  bind(i){
    const k=this.cell(this.x[i],this.y[i]);if(k<0||!this.target[k]||!this.onGlue(this.x[i],this.y[i])||this.bound[k]>=6)return false;
    this.state[i]=BOUND;this.z[i]=1.7+this.seed[i]*.8;this.vx[i]=this.vy[i]=this.vz[i]=0;
    const needed=Math.max(1,Math.ceil(this.target[k]/10));
    if(this.bound[k]<needed)this.coveredWeight+=(this.target[k]/(CELL*CELL))/needed;
    this.bound[k]++;return true;
  }
  brush(from,to,radius=37){
    const dx=to.x-from.x,dy=to.y-from.y,d=Math.hypot(dx,dy);if(d<.2)return 0;
    const steps=Math.max(1,Math.ceil(d/5)),sx=dx/steps,sy=dy/steps,ux=dx/d,uy=dy/d,rr=radius*radius;let moved=0;
    // Integrate a fast pointer path in short strokes. This transports a heap
    // continuously instead of leaving an individual mound at every DOM event.
    for(let n=0;n<steps;n++){
      const cx=from.x+sx*(n+.5),cy=from.y+sy*(n+.5);
      for(let i=0;i<this.count;i++){
        if(this.state[i]!==FREE)continue;
        const ax=this.x[i]-cx,ay=this.y[i]-cy,dist2=ax*ax+ay*ay;if(dist2>rr)continue;
        const strength=.48+.50*Math.sqrt(1-dist2/rr);
        this.x[i]+=sx*strength;this.y[i]+=sy*strength;
        if(this.onGlue(this.x[i],this.y[i])&&this.random()<.075&&this.bind(i)){moved++;continue;}
        const side=(ax*(-uy)+ay*ux)/radius;
        this.vx[i]=ux*(20+strength*55)-uy*side*12;
        this.vy[i]=uy*(20+strength*55)+ux*side*12;
        this.z[i]=Math.min(this.z[i]+.12*strength,38);moved++;
      }
    }
    return moved;
  }
  step(dt,{shaking=false}={}){
    this.density.fill(0);
    for(let i=0;i<this.count;i++)if(this.state[i]===FREE){const k=this.cell(this.x[i],this.y[i]);this.bin[i]=k;if(k>=0)this.density[k]++;}
    for(let k=0;k<this.height.length;k++)this.height[k]=this.density[k]*.22;
    // Pressure is a property of a cell, computed once rather than allocating
    // neighbour lists for every flake on every frame.
    for(let k=0;k<this.height.length;k++){
      const h=this.height[k];this.flowSum[k]=0;if(h<=3.4)continue;
      const col=k%COLS,row=(k/COLS)|0,ns=[col>0?k-1:k,col<COLS-1?k+1:k,row>0?k-COLS:k,row<ROWS-1?k+COLS:k,row>0&&col>0?k-COLS-1:k,row>0&&col<COLS-1?k-COLS+1:k,row<ROWS-1&&col>0?k+COLS-1:k,row<ROWS-1&&col<COLS-1?k+COLS+1:k];
      let sum=0;
      for(let j=0;j<8;j++){const force=Math.max(0,Math.min((h-this.height[ns[j]])/(j<4?1:1.414)-3.4,45))*55;this.flowForce[k*8+j]=force;sum+=force;this.flowCDF[k*8+j]=sum;}
      this.flowSum[k]=sum;
    }
    const friction=Math.exp(-10*dt);
    for(let i=0;i<this.count;i++){
      const s=this.state[i];if(s===BOUND||s===LOST)continue;
      let k=this.cell(this.x[i],this.y[i]);
      if(shaking){this.vy[i]+=850*dt;this.vx[i]+=Math.sin(i*2.4)*95*dt;this.z[i]=Math.max(this.z[i],3);}
      if(s===AIR){
        this.vz[i]-=1050*dt;this.z[i]+=this.vz[i]*dt;
        const floor=k<0?1:this.height[k]+2;
        if(this.z[i]<=floor){this.state[i]=FREE;this.z[i]=floor;this.vz[i]=0;this.vx[i]+=(this.random()-.5)*24;this.vy[i]+=(this.random()-.5)*24;}
      }else if(k<0&&!shaking){
        this.vz[i]-=900*dt;this.z[i]=Math.max(-9,this.z[i]+this.vz[i]*dt);if(this.z[i]<=-9)this.vz[i]=0;
      }else if(k>=0&&!shaking){
        const h=this.height[k];let fx=0,fy=0;
        if(this.flowSum[k]>0){
          const choice=this.seed[i]*this.flowSum[k];let j=0;
          while(j<7&&choice>this.flowCDF[k*8+j])j++;
          const force=this.flowForce[k*8+j];fx=FLOW_X[j]*force;fy=FLOW_Y[j]*force;
        }
        this.vx[i]+=fx*dt;this.vy[i]+=fy*dt;
        const floor=1.7+h*(.10+this.seed[i]*.90);
        this.z[i]+=(floor-this.z[i])*Math.min(1,dt*15);
        if(this.z[i]<5.5&&this.random()<dt*12)this.bind(i);
      }
      if(this.state[i]===BOUND)continue;
      this.x[i]+=this.vx[i]*dt;this.y[i]+=this.vy[i]*dt;
      if(!shaking){this.vx[i]*=friction;this.vy[i]*=friction;}
      if(this.x[i]<-50||this.x[i]>W+50||this.y[i]<-65||this.y[i]>H+65){this.state[i]=LOST;this.lost++;}
    }
  }
  removeLoose(){for(let i=0;i<this.count;i++)if(this.state[i]!==BOUND&&this.state[i]!==LOST){this.state[i]=LOST;this.lost++;}this.height.fill(0);this.density.fill(0)}
  compact(){
    let out=0;
    for(let i=0;i<this.count;i++)if(this.state[i]!==LOST){
      if(out!==i){for(const key of ['x','y','z','vx','vy','vz','seed','state','bin'])this[key][out]=this[key][i];}
      out++;
    }
    this.count=out;
  }
  get coverage(){return this.targetCount?Math.min(1,this.coveredWeight/this.targetCount):0}
  stats(){let air=0,free=0,bound=0;for(let i=0;i<this.count;i++){if(this.state[i]===AIR)air++;else if(this.state[i]===FREE)free++;else if(this.state[i]===BOUND)bound++;}return{air,free,bound,lost:this.lost,emitted:this.emitted,coverage:this.coverage,maxHeight:Math.max(...this.height)}}
}
