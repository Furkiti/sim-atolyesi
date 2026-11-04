var _h=[-1,1,0,0,-.707,.707,-.707,.707],xh=[0,0,-1,1,-.707,-.707,.707,.707],Zr=class{constructor({capacity:t=3e4,random:e=Math.random}={}){this.capacity=t,this.random=e,this.time=0,this.count=0,this.emitted=0;for(let n of["x","y","z","vx","vy","vz","seed"])this[n]=new Float32Array(t);this.pressed=new Uint8Array(t),this.freshCount=0,this.state=new Uint8Array(t),this.bin=new Int32Array(t),this.density=new Float32Array(19200),this.height=new Float32Array(19200),this.pressure=new Float32Array(19200),this.moundDensity=new Float32Array(19200),this.moundHeight=new Float32Array(19200),this.neighbors=new Int32Array(19200*8);for(let n=0;n<19200;n++){let s=n%120,r=n/120|0;this.neighbors.set([s>0?n-1:n,s<119?n+1:n,r>0?n-120:n,r<159?n+120:n,r>0&&s>0?n-120-1:n,r>0&&s<119?n-120+1:n,r<159&&s>0?n+120-1:n,r<159&&s<119?n+120+1:n],n*8)}this.flowSum=new Float32Array(19200),this.flowCDF=new Float32Array(19200*8),this.flowForce=new Float32Array(19200*8),this.bound=new Uint8Array(19200),this.target=new Uint8Array(19200),this.mask=new Uint8Array(600*800),this.targetCount=0,this.coveredWeight=0,this.lost=0}setMask(t){this.mask.set(t),this.target.fill(0),this.bound.fill(0),this.targetCount=0,this.coveredWeight=0;for(let e=0;e<800;e+=5)for(let n=0;n<600;n+=5){let s=0;for(let r=0;r<5;r++)for(let a=0;a<5;a++)s+=!!t[(e+r)*600+n+a];s>=1&&(this.target[e/5*120+n/5]=s,this.targetCount+=s/25)}}cell(t,e){return t>=0&&t<600&&e>=0&&e<800?Math.floor(e/5)*120+Math.floor(t/5):-1}onGlue(t,e){return t>=0&&t<600&&e>=0&&e<800&&this.mask[(e|0)*600+(t|0)]>0}emit(t,e,n,{spread:s=13,height:r=165,fan:a=16}={}){if(!Number.isFinite(t)||!Number.isFinite(e))throw new TypeError("A pile needs finite paper coordinates");let o=0;for(let l=0;l<n&&this.count<this.capacity;l++){let c=this.count++,h=this.random()*Math.PI*2,f=Math.sqrt(this.random())*s;this.pressed[c]=0,this.seed[c]=this.random(),this.x[c]=t+Math.cos(h)*f,this.y[c]=e+Math.sin(h)*f,this.z[c]=r+this.random()*32,this.vz[c]=-45-this.random()*35;let u=Math.sqrt(this.random())*a;this.vx[c]=Math.cos(h)*u,this.vy[c]=Math.sin(h)*u,this.state[c]=0,o++}return this.emitted+=o,o}bind(t){if(!this.pressed[t]||this.state[t]===2||this.state[t]===3)return!1;let e=this.cell(this.x[t],this.y[t]);if(e<0)return!1;let n=e;if(!this.target[n]||this.bound[n]||!this.onGlue(this.x[t],this.y[t])){let s=65,r=null,a=e%120,o=Math.floor(e/120);for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++){let h=a+c,f=o+l;if(h<0||h>=120||f<0||f>=160)continue;let u=f*120+h;if(!(!this.target[u]||this.bound[u]))for(let d=f*5;d<(f+1)*5;d++)for(let g=h*5;g<(h+1)*5;g++){let v=(g+.5-this.x[t])**2+(d+.5-this.y[t])**2;v<s&&this.mask[d*600+g]&&(s=v,r={x:g+.5,y:d+.5,k:u})}}if(!r)return!1;this.x[t]=r.x,this.y[t]=r.y,n=r.k}return this.state[t]=2,this.z[t]=1.7+this.seed[t]*.8,this.vx[t]=this.vy[t]=this.vz[t]=0,this.coveredWeight+=this.target[n]/25,this.bound[n]++,!0}brush(t,e,n=46){let s=e.x-t.x,r=e.y-t.y,a=s*s+r*r,o=Math.sqrt(a);if(o<.02)return 0;let l=n*n,c=s/o,h=r/o,f=0;for(let u=0;u<this.count;u++){if(this.state[u]!==1)continue;let d=Math.max(0,Math.min(1,((this.x[u]-t.x)*s+(this.y[u]-t.y)*r)/a)),g=this.x[u]-t.x-d*s,v=this.y[u]-t.y-d*r,m=g*g+v*v;if(m>l)continue;let p=(.96+.04*Math.sqrt(1-m/l))*(.96+.04*this.seed[u]),M=o*(1-d)*p,A=(g*-h+v*c)/n,b=A*.28+(this.seed[u]*137%1-.5)*.16,E=this.cell(this.x[u],this.y[u]);this.pressed[u]=1,E>=0&&(this.z[u]=Math.min(this.z[u],1.7+this.height[E]*.45*(.1+this.seed[u]*.9)));let T=Math.max(1,Math.ceil(M/4));for(let _=0;_<T&&(this.x[u]+=(c-h*b)*M/T,this.y[u]+=(h+c*b)*M/T,!this.bind(u));_++);this.state[u]!==2&&(this.vx[u]=c*12-h*A*8,this.vy[u]=h*12+c*A*8),f++}return f}step(t,{shaking:e=!1,bend:n=e?1:0,tilt:s=n*.58}={}){this.time+=t,this.density.fill(0),this.moundDensity.fill(0),this.moundHeight.fill(0),this.freshCount=0;for(let a=0;a<this.count;a++)if(this.state[a]===1){let o=this.cell(this.x[a],this.y[a]);this.bin[a]=o,o>=0&&(this.density[o]+=this.pressed[a]?.45:1,this.pressed[a]||(this.moundDensity[o]+=.95,this.freshCount++))}for(let a=0;a<this.height.length;a++){this.pressure[a]=this.density[a]*.95;let o=this.density[a]*4,l=this.moundDensity[a]*4;for(let c=0;c<8;c++){let h=this.neighbors[a*8+c],f=c<4?2:1;o+=this.density[h]*f,l+=this.moundDensity[h]*f}o*=.95/16,l/=16,this.height[a]=o>0?32*(1-Math.exp(-o/32)):0,this.moundHeight[a]=l>0?32*(1-Math.exp(-l/32)):0}for(let a=0;a<this.height.length;a++){let o=this.pressure[a];if(this.flowSum[a]=0,o<=3.4)continue;let l=0;for(let c=0;c<8;c++){let h=Math.max(0,Math.min((o-this.pressure[this.neighbors[a*8+c]])/(c<4?1:1.414)-3.4,45))*55;this.flowForce[a*8+c]=h,l+=h,this.flowCDF[a*8+c]=l}this.flowSum[a]=l}let r=Math.exp(-10*t);for(let a=0;a<this.count;a++){let o=this.state[a];if(o===2||o===3)continue;let l=this.cell(this.x[a],this.y[a]);if(e&&l<0&&(this.vz[a]-=900*t,this.z[a]+=this.vz[a]*t),e&&l>=0){let c=this.x[a]-300;this.vx[a]-=1150*Math.sin(c/300*1.22*n)*t;let h=Math.max(.05,1-(Math.abs(c)/140)**2);this.vy[a]+=1150*Math.sin(s)*h*t,this.vx[a]*=Math.exp(-4.5*t),this.vy[a]*=Math.exp(-.65*t),this.z[a]+=(2.5+this.seed[a]*1.1-this.z[a])*Math.min(1,t*14)}if(o===0){let c=this.z[a];this.vz[a]-=1050*t,this.z[a]+=this.vz[a]*t;let h=l<0?1:this.height[l]+2;this.z[a]<=h&&(this.state[a]=1,this.z[a]=Math.max(1.7,Math.min(c,h)),this.vz[a]=0,this.vx[a]+=(this.random()-.5)*24,this.vy[a]+=(this.random()-.5)*24)}else if(l<0&&!e)this.vz[a]-=900*t,this.z[a]=Math.max(-9,this.z[a]+this.vz[a]*t),this.z[a]<=-9&&(this.vz[a]=0);else if(l>=0&&!e){let c=this.height[l],h=0,f=0;if(this.flowSum[l]>0){let g=(this.seed[a]+this.time*.17)%1*this.flowSum[l],v=0;for(;v<7&&g>this.flowCDF[l*8+v];)v++;let m=this.flowForce[l*8+v],p=(this.seed[a]*97%1-.5)*.75;h=(_h[v]-xh[v]*p)*m,f=(xh[v]+_h[v]*p)*m}this.vx[a]+=h*t,this.vy[a]+=f*t;let u=1.7+c*(.1+this.seed[a]*.9),d=this.pressed[a]?Math.min(this.z[a],u):u;this.z[a]+=(d-this.z[a])*Math.min(1,t*15),this.pressed[a]&&this.z[a]<5.5&&this.random()<t*12&&this.bind(a)}if(this.state[a]!==2){if(this.x[a]+=this.vx[a]*t,this.y[a]+=this.vy[a]*t,e&&this.y[a]>797&&Math.abs(this.x[a]-600/2)>102&&(this.y[a]=797,this.vy[a]=0),!e){let c=o===0?Math.exp(-.7*t):r;this.vx[a]*=c,this.vy[a]*=c}(this.x[a]<-3e3||this.x[a]>3600||this.y[a]<-3e3||this.y[a]>3800)&&(this.state[a]=3,this.lost++)}}}hasLoose(){for(let t=0;t<this.count;t++)if(this.state[t]===0||this.state[t]===1)return!0;return!1}removeLoose(){for(let t=0;t<this.count;t++)this.state[t]!==2&&this.state[t]!==3&&(this.state[t]=3,this.lost++);this.height.fill(0),this.density.fill(0),this.moundHeight.fill(0),this.freshCount=0}compact(){let t=0;for(let e=0;e<this.count;e++)if(this.state[e]!==3){if(t!==e)for(let n of["x","y","z","vx","vy","vz","seed","pressed","state","bin"])this[n][t]=this[n][e];t++}this.count=t}get coverage(){if(!this.targetCount)return 0;let t=this.coveredWeight/this.targetCount;return t>1-1e-9?1:t}stats(){let t=0,e=0,n=0,s=0;for(let r=0;r<this.count;r++)this.state[r]===0?t++:this.state[r]===1?(e++,this.pressed[r]&&s++):this.state[r]===2&&n++;return{air:t,free:e,bound:n,pressedFree:s,freshFree:e-s,maxMoundHeight:Math.max(...this.moundHeight),lost:this.lost,emitted:this.emitted,coverage:this.coverage,maxHeight:Math.max(...this.height)}}};var jh=0,nc=1,tu=2;var Bi=1,eu=2,Rs=3,Mi=0,Oe=1,Qe=2,zi=0,Ps=1,br=2,ic=3,sc=4,nu=5;var ki=100,iu=101,su=102,ru=103,au=104,ou=200,lu=201,cu=202,hu=203,rc=204,ac=205,uu=206,du=207,fu=208,pu=209,mu=210,gu=211,_u=212,xu=213,yu=214,ba=0,wa=1,Ta=2,ps=3,Aa=4,Ea=5,Ca=6,Ra=7,to=0,vu=1,Mu=2,On=0,oc=1,lc=2,cc=3,wr=4,hc=5,uc=6,dc=7;var fc=300,Gi=301,Is=302,eo=303,no=304,Di=1e3,Dn=1001,Pa=1002,Le=1003,Su=1004;var Tr=1005;var Ye=1006,io=1007;var ti=1008;var je=1009,pc=1010,mc=1011,Ls=1012,so=1013,En=1014,xn=1015,Cn=1016,ro=1017,ao=1018,Vi=1020,gc=35902,_c=35899,xc=1021,yc=1022,Rn=1023,Kn=1026,ei=1027,oo=1028,lo=1029,Si=1030,co=1031;var ho=1033,Ar=33776,Er=33777,Cr=33778,Rr=33779,uo=35840,fo=35841,po=35842,mo=35843,go=36196,_o=37492,xo=37496,yo=37488,vo=37489,Pr=37490,Mo=37491,So=37808,bo=37809,wo=37810,To=37811,Ao=37812,Eo=37813,Co=37814,Ro=37815,Po=37816,Io=37817,Lo=37818,Do=37819,No=37820,Uo=37821,Fo=36492,Oo=36494,Bo=36495,zo=36283,ko=36284,Ir=36285,Go=36286;var js=2300,Ia=2301,Ma=2302,Yl=2303,Zl=2400,Jl=2401,$l=2402;var bu=3200,vc=3201;var Lr=0,wu=1,ni="",Ie="srgb",tr="srgb-linear",er="linear",te="srgb";var Sa=7680;var Tu=519,Au=512,Eu=513,Cu=514,Mc=515,Ru=516,Pu=517,Sc=518,bc=519,wc=35044,Tc=35048;var Ac="300 es",mn=2e3,ms=2001;function sf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function rf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function nr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Iu(){let i=nr("canvas");return i.style.display="block",i}var yh={},gs=null;function ir(...i){let t="THREE."+i.shift();gs?gs("log",t,...i):console.log(t,...i)}function Lu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Et(...i){i=Lu(i);let t="THREE."+i.shift();if(gs)gs("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Pt(...i){i=Lu(i);let t="THREE."+i.shift();if(gs)gs("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Li(...i){let t=i.join(" ");t in yh||(yh[t]=!0,Et(...i))}function Du(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Nu={[ba]:ba,[Ta]:Ca,[Aa]:Aa,[ps]:Ea,[wa]:wa,[Ca]:Ta,[Ra]:Ra,[Ea]:ps},Nn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var bl=Math.PI/180,La=180/Math.PI;function Hi(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ge[i&255]+Ge[i>>8&255]+Ge[i>>16&255]+Ge[i>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[n&255]+Ge[n>>8&255]+Ge[n>>16&255]+Ge[n>>24&255]).toLowerCase()}function Jt(i,t,e){return Math.max(t,Math.min(e,i))}function af(i,t){return(i%t+t)%t}function wl(i,t,e){return(1-e)*i+e*t}function Uu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Vo(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Fu(i,t){if(t.constructor===Float32Array)return i;let e=Vo(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/e,-1)}function Ou(i,t){if(t.constructor===Float32Array)return i;let e=Vo(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*e)}var Lt=class{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},rn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],f=n[s+3],u=r[a+0],d=r[a+1],g=r[a+2],v=r[a+3];if(f!==v||l!==u||c!==d||h!==g){let m=l*u+c*d+h*g+f*v;m<0&&(u=-u,d=-d,g=-g,v=-v,m=-m);let p=1-o;if(m<.9995){let M=Math.acos(m),A=Math.sin(M);p=Math.sin(p*M)/A,o=Math.sin(o*M)/A,l=l*p+u*o,c=c*p+d*o,h=h*p+g*o,f=f*p+v*o}else{l=l*p+u*o,c=c*p+d*o,h=h*p+g*o,f=f*p+v*o;let M=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=M,c*=M,h*=M,f*=M}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],f=r[a],u=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*f+l*d-c*u,t[e+1]=l*g+h*u+c*f-o*d,t[e+2]=c*g+h*d+o*u-l*f,t[e+3]=h*g-o*f-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),f=o(r/2),u=l(n/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"YXZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"ZXY":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"ZYX":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"YZX":this._x=u*h*f+c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f-u*d*g;break;case"XZY":this._x=u*h*f-c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f+u*d*g;break;default:Et("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],f=e[10],u=n+o+f;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>f){let d=2*Math.sqrt(1+n-o-f);this._w=(h-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>f){let d=2*Math.sqrt(1+o-n-f);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+f-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Jt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class{static{this.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(vh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(vh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+l*c+a*f-o*h,this.y=n+l*h+o*c-r*f,this.z=s+l*f+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this.z=Jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this.z=Jt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Tl.copy(this).projectOnVector(t),this.sub(Tl)}reflect(t){return this.sub(Tl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Jt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Tl=new U,vh=new rn,Dt=class{static{this.prototype.isMatrix3=!0}constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],f=n[7],u=n[2],d=n[5],g=n[8],v=s[0],m=s[3],p=s[6],M=s[1],A=s[4],b=s[7],E=s[2],T=s[5],_=s[8];return r[0]=a*v+o*M+l*E,r[3]=a*m+o*A+l*T,r[6]=a*p+o*b+l*_,r[1]=c*v+h*M+f*E,r[4]=c*m+h*A+f*T,r[7]=c*p+h*b+f*_,r[2]=u*v+d*M+g*E,r[5]=u*m+d*A+g*T,r[8]=u*p+d*b+g*_,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],f=h*a-o*c,u=o*l-h*r,d=c*r-a*l,g=e*f+n*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return t[0]=f*v,t[1]=(s*c-h*n)*v,t[2]=(o*n-s*a)*v,t[3]=u*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-o*e)*v,t[6]=d*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Li("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Al.makeScale(t,e)),this}rotate(t){return Li("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Al.makeRotation(-t)),this}translate(t,e){return Li("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Al.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Al=new Dt,Mh=new Dt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Sh=new Dt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function of(){let i={enabled:!0,workingColorSpace:tr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===te&&(s.r=$n(s.r),s.g=$n(s.g),s.b=$n(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===te&&(s.r=fs(s.r),s.g=fs(s.g),s.b=fs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ni?er:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[tr]:{primaries:t,whitePoint:n,transfer:er,toXYZ:Mh,fromXYZ:Sh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ie},outputColorSpaceConfig:{drawingBufferColorSpace:Ie}},[Ie]:{primaries:t,whitePoint:n,transfer:te,toXYZ:Mh,fromXYZ:Sh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ie}}}),i}var Zt=of();function $n(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function fs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ji,Da=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Ji===void 0&&(Ji=nr("canvas")),Ji.width=t.width,Ji.height=t.height;let s=Ji.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Ji}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=nr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=$n(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor($n(e[n]/255)*255):e[n]=$n(e[n]);return{data:e,width:t.width,height:t.height}}else return Et("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},lf=0,_s=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:lf++}),this.uuid=Hi(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(El(s[a].image)):r.push(El(s[a]))}else r=El(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function El(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Da.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Et("Texture: Unable to serialize Texture."),{})}var cf=0,Cl=new U,Ze=class i extends Nn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Dn,s=Dn,r=Ye,a=ti,o=Rn,l=je,c=i.DEFAULT_ANISOTROPY,h=ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cf++}),this.uuid=Hi(),this.name="",this.source=new _s(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Lt(0,0),this.repeat=new Lt(1,1),this.center=new Lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Dt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Cl).x}get height(){return this.source.getSize(Cl).y}get depth(){return this.source.getSize(Cl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Et(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Et(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==fc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Di:t.x=t.x-Math.floor(t.x);break;case Dn:t.x=t.x<0?0:1;break;case Pa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Di:t.y=t.y-Math.floor(t.y);break;case Dn:t.y=t.y<0?0:1;break;case Pa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ze.DEFAULT_IMAGE=null;Ze.DEFAULT_MAPPING=fc;Ze.DEFAULT_ANISOTROPY=1;var fe=class{static{this.prototype.isVector4=!0}constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],f=l[8],u=l[1],d=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let A=(c+1)/2,b=(d+1)/2,E=(p+1)/2,T=(h+u)/4,_=(f+v)/4,S=(g+m)/4;return A>b&&A>E?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=T/n,r=_/n):b>E?b<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),n=T/s,r=S/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=_/r,s=S/r),this.set(n,s,r,e),this}let M=Math.sqrt((m-g)*(m-g)+(f-v)*(f-v)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(f-v)/M,this.z=(u-h)/M,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this.z=Jt(this.z,t.z,e.z),this.w=Jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this.z=Jt(this.z,t,e),this.w=Jt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Jt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Na=class extends Nn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ye,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new fe(0,0,t,e),this.scissorTest=!1,this.viewport=new fe(0,0,t,e),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Ze({width:t,height:e,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ye,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new _s(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},an=class extends Na{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},sr=class extends Ze{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Le,this.minFilter=Le,this.wrapR=Dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ua=class extends Ze{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Le,this.minFilter=Le,this.wrapR=Dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Qt=class i{static{this.prototype.isMatrix4=!0}constructor(t,e,n,s,r,a,o,l,c,h,f,u,d,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,f,u,d,g,v,m)}set(t,e,n,s,r,a,o,l,c,h,f,u,d,g,v,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=f,p[14]=u,p[3]=d,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/$i.setFromMatrixColumn(t,0).length(),r=1/$i.setFromMatrixColumn(t,1).length(),a=1/$i.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let u=a*h,d=a*f,g=o*h,v=o*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=d+g*c,e[5]=u-v*c,e[9]=-o*l,e[2]=v-u*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*h,d=l*f,g=c*h,v=c*f;e[0]=u+v*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*f,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=v+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*h,d=l*f,g=c*h,v=c*f;e[0]=u-v*o,e[4]=-a*f,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=v-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*h,d=a*f,g=o*h,v=o*f;e[0]=l*h,e[4]=g*c-d,e[8]=u*c+v,e[1]=l*f,e[5]=v*c+u,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=v-u*f,e[8]=g*f+d,e[1]=f,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*f+g,e[10]=u-v*f}else if(t.order==="XZY"){let u=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=u*f+v,e[5]=a*h,e[9]=d*f-g,e[2]=g*f-d,e[6]=o*h,e[10]=v*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hf,t,uf)}lookAt(t,e,n){let s=this.elements;return en.subVectors(t,e),en.lengthSq()===0&&(en.z=1),en.normalize(),ci.crossVectors(n,en),ci.lengthSq()===0&&(Math.abs(n.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),ci.crossVectors(n,en)),ci.normalize(),Jr.crossVectors(en,ci),s[0]=ci.x,s[4]=Jr.x,s[8]=en.x,s[1]=ci.y,s[5]=Jr.y,s[9]=en.y,s[2]=ci.z,s[6]=Jr.z,s[10]=en.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],f=n[5],u=n[9],d=n[13],g=n[2],v=n[6],m=n[10],p=n[14],M=n[3],A=n[7],b=n[11],E=n[15],T=s[0],_=s[4],S=s[8],D=s[12],R=s[1],N=s[5],F=s[9],G=s[13],P=s[2],H=s[6],q=s[10],V=s[14],et=s[3],X=s[7],Q=s[11],j=s[15];return r[0]=a*T+o*R+l*P+c*et,r[4]=a*_+o*N+l*H+c*X,r[8]=a*S+o*F+l*q+c*Q,r[12]=a*D+o*G+l*V+c*j,r[1]=h*T+f*R+u*P+d*et,r[5]=h*_+f*N+u*H+d*X,r[9]=h*S+f*F+u*q+d*Q,r[13]=h*D+f*G+u*V+d*j,r[2]=g*T+v*R+m*P+p*et,r[6]=g*_+v*N+m*H+p*X,r[10]=g*S+v*F+m*q+p*Q,r[14]=g*D+v*G+m*V+p*j,r[3]=M*T+A*R+b*P+E*et,r[7]=M*_+A*N+b*H+E*X,r[11]=M*S+A*F+b*q+E*Q,r[15]=M*D+A*G+b*V+E*j,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],f=t[6],u=t[10],d=t[14],g=t[3],v=t[7],m=t[11],p=t[15],M=l*d-c*u,A=o*d-c*f,b=o*u-l*f,E=a*d-c*h,T=a*u-l*h,_=a*f-o*h;return e*(v*M-m*A+p*b)-n*(g*M-m*E+p*T)+s*(g*A-v*E+p*_)-r*(g*b-v*T+m*_)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],f=t[9],u=t[10],d=t[11],g=t[12],v=t[13],m=t[14],p=t[15],M=e*o-n*a,A=e*l-s*a,b=e*c-r*a,E=n*l-s*o,T=n*c-r*o,_=s*c-r*l,S=h*v-f*g,D=h*m-u*g,R=h*p-d*g,N=f*m-u*v,F=f*p-d*v,G=u*p-d*m,P=M*G-A*F+b*N+E*R-T*D+_*S;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/P;return t[0]=(o*G-l*F+c*N)*H,t[1]=(s*F-n*G-r*N)*H,t[2]=(v*_-m*T+p*E)*H,t[3]=(u*T-f*_-d*E)*H,t[4]=(l*R-a*G-c*D)*H,t[5]=(e*G-s*R+r*D)*H,t[6]=(m*b-g*_-p*A)*H,t[7]=(h*_-u*b+d*A)*H,t[8]=(a*F-o*R+c*S)*H,t[9]=(n*R-e*F-r*S)*H,t[10]=(g*T-v*b+p*M)*H,t[11]=(f*b-h*T-d*M)*H,t[12]=(o*D-a*N-l*S)*H,t[13]=(e*N-n*D+s*S)*H,t[14]=(v*A-g*E-m*M)*H,t[15]=(h*E-f*A+u*M)*H,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,f=o+o,u=r*c,d=r*h,g=r*f,v=a*h,m=a*f,p=o*f,M=l*c,A=l*h,b=l*f,E=n.x,T=n.y,_=n.z;return s[0]=(1-(v+p))*E,s[1]=(d+b)*E,s[2]=(g-A)*E,s[3]=0,s[4]=(d-b)*T,s[5]=(1-(u+p))*T,s[6]=(m+M)*T,s[7]=0,s[8]=(g+A)*_,s[9]=(m-M)*_,s[10]=(1-(u+v))*_,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=$i.set(s[0],s[1],s[2]).length(),o=$i.set(s[4],s[5],s[6]).length(),l=$i.set(s[8],s[9],s[10]).length();r<0&&(a=-a),bn.copy(this);let c=1/a,h=1/o,f=1/l;return bn.elements[0]*=c,bn.elements[1]*=c,bn.elements[2]*=c,bn.elements[4]*=h,bn.elements[5]*=h,bn.elements[6]*=h,bn.elements[8]*=f,bn.elements[9]*=f,bn.elements[10]*=f,e.setFromRotationMatrix(bn),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=mn,l=!1){let c=this.elements,h=2*r/(e-t),f=2*r/(n-s),u=(e+t)/(e-t),d=(n+s)/(n-s),g,v;if(l)g=r/(a-r),v=a*r/(a-r);else if(o===mn)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===ms)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=mn,l=!1){let c=this.elements,h=2/(e-t),f=2/(n-s),u=-(e+t)/(e-t),d=-(n+s)/(n-s),g,v;if(l)g=1/(a-r),v=a/(a-r);else if(o===mn)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===ms)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},$i=new U,bn=new Qt,hf=new U(0,0,0),uf=new U(1,1,1),ci=new U,Jr=new U,en=new U,bh=new Qt,wh=new rn,on=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],f=s[2],u=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(Jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Jt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Jt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Jt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:Et("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return bh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(bh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return wh.setFromEuler(this),this.setFromQuaternion(wh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};on.DEFAULT_ORDER="XYZ";var xs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},df=0,Th=new U,Ki=new rn,Wn=new Qt,$r=new U,Hs=new U,ff=new U,pf=new rn,Ah=new U(1,0,0),Eh=new U(0,1,0),Ch=new U(0,0,1),Rh={type:"added"},mf={type:"removed"},Qi={type:"childadded",child:null},Rl={type:"childremoved",child:null},ge=class i extends Nn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:df++}),this.uuid=Hi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new U,e=new on,n=new rn,s=new U(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Qt},normalMatrix:{value:new Dt}}),this.matrix=new Qt,this.matrixWorld=new Qt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ki.setFromAxisAngle(t,e),this.quaternion.multiply(Ki),this}rotateOnWorldAxis(t,e){return Ki.setFromAxisAngle(t,e),this.quaternion.premultiply(Ki),this}rotateX(t){return this.rotateOnAxis(Ah,t)}rotateY(t){return this.rotateOnAxis(Eh,t)}rotateZ(t){return this.rotateOnAxis(Ch,t)}translateOnAxis(t,e){return Th.copy(t).applyQuaternion(this.quaternion),this.position.add(Th.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Ah,t)}translateY(t){return this.translateOnAxis(Eh,t)}translateZ(t){return this.translateOnAxis(Ch,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Wn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?$r.copy(t):$r.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Hs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Wn.lookAt(Hs,$r,this.up):Wn.lookAt($r,Hs,this.up),this.quaternion.setFromRotationMatrix(Wn),s&&(Wn.extractRotation(s.matrixWorld),Ki.setFromRotationMatrix(Wn),this.quaternion.premultiply(Ki.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Pt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Rh),Qi.child=t,this.dispatchEvent(Qi),Qi.child=null):Pt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(mf),Rl.child=t,this.dispatchEvent(Rl),Rl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Wn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Wn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Wn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Rh),Qi.child=t,this.dispatchEvent(Qi),Qi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hs,t,ff),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hs,pf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),f=a(t.shapes),u=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),u.length>0&&(n.skeletons=u),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ge.DEFAULT_UP=new U(0,1,0);ge.DEFAULT_MATRIX_AUTO_UPDATE=!0;ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ke=class extends ge{constructor(){super(),this.isGroup=!0,this.type="Group"}},gf={type:"move"},ys=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ke,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ke,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ke,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let v of t.hand.values()){let m=e.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(gf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Ke;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Bu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},hi={h:0,s:0,l:0},Kr={h:0,s:0,l:0};function Pl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Ct=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ie){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Zt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Zt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Zt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Zt.workingColorSpace){if(t=af(t,1),e=Jt(e,0,1),n=Jt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Pl(a,r,t+1/3),this.g=Pl(a,r,t),this.b=Pl(a,r,t-1/3)}return Zt.colorSpaceToWorking(this,s),this}setStyle(t,e=Ie){function n(r){r!==void 0&&parseFloat(r)<1&&Et("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Et("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Et("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ie){let n=Bu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Et("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=$n(t.r),this.g=$n(t.g),this.b=$n(t.b),this}copyLinearToSRGB(t){return this.r=fs(t.r),this.g=fs(t.g),this.b=fs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ie){return Zt.workingToColorSpace(Ve.copy(this),t),Math.round(Jt(Ve.r*255,0,255))*65536+Math.round(Jt(Ve.g*255,0,255))*256+Math.round(Jt(Ve.b*255,0,255))}getHexString(t=Ie){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Zt.workingColorSpace){Zt.workingToColorSpace(Ve.copy(this),e);let n=Ve.r,s=Ve.g,r=Ve.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=h<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Zt.workingColorSpace){return Zt.workingToColorSpace(Ve.copy(this),e),t.r=Ve.r,t.g=Ve.g,t.b=Ve.b,t}getStyle(t=Ie){Zt.workingToColorSpace(Ve.copy(this),t);let e=Ve.r,n=Ve.g,s=Ve.b;return t!==Ie?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(hi),this.setHSL(hi.h+t,hi.s+e,hi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(hi),t.getHSL(Kr);let n=wl(hi.h,Kr.h,e),s=wl(hi.s,Kr.s,e),r=wl(hi.l,Kr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ve=new Ct;Ct.NAMES=Bu;var Ni=class extends ge{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new on,this.environmentIntensity=1,this.environmentRotation=new on,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},wn=new U,Xn=new U,Il=new U,qn=new U,ji=new U,ts=new U,Ph=new U,Ll=new U,Dl=new U,Nl=new U,Ul=new fe,Fl=new fe,Ol=new fe,Jn=class i{constructor(t=new U,e=new U,n=new U){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),wn.subVectors(t,e),s.cross(wn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){wn.subVectors(s,e),Xn.subVectors(n,e),Il.subVectors(t,e);let a=wn.dot(wn),o=wn.dot(Xn),l=wn.dot(Il),c=Xn.dot(Xn),h=Xn.dot(Il),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let u=1/f,d=(c*l-o*h)*u,g=(a*h-o*l)*u;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,qn)===null?!1:qn.x>=0&&qn.y>=0&&qn.x+qn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,qn.x),l.addScaledVector(a,qn.y),l.addScaledVector(o,qn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ul.setScalar(0),Fl.setScalar(0),Ol.setScalar(0),Ul.fromBufferAttribute(t,e),Fl.fromBufferAttribute(t,n),Ol.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ul,r.x),a.addScaledVector(Fl,r.y),a.addScaledVector(Ol,r.z),a}static isFrontFacing(t,e,n,s){return wn.subVectors(n,e),Xn.subVectors(t,e),wn.cross(Xn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return wn.subVectors(this.c,this.b),Xn.subVectors(this.a,this.b),wn.cross(Xn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;ji.subVectors(s,n),ts.subVectors(r,n),Ll.subVectors(t,n);let l=ji.dot(Ll),c=ts.dot(Ll);if(l<=0&&c<=0)return e.copy(n);Dl.subVectors(t,s);let h=ji.dot(Dl),f=ts.dot(Dl);if(h>=0&&f<=h)return e.copy(s);let u=l*f-h*c;if(u<=0&&l>=0&&h<=0&&l-h>0)return a=l/(l-h),e.copy(n).addScaledVector(ji,a);Nl.subVectors(t,r);let d=ji.dot(Nl),g=ts.dot(Nl);if(g>=0&&d<=g)return e.copy(r);let v=d*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(ts,o);let m=h*g-d*f;if(m<=0&&f-h>=0&&d-g>=0)return Ph.subVectors(r,s),o=(f-h)/(f-h+(d-g)),e.copy(s).addScaledVector(Ph,o);let p=1/(m+v+u);return a=v*p,o=u*p,e.copy(n).addScaledVector(ji,a).addScaledVector(ts,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Un=class{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Tn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Tn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Tn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Tn):Tn.fromBufferAttribute(r,a),Tn.applyMatrix4(t.matrixWorld),this.expandByPoint(Tn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Qr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Qr.copy(n.boundingBox)),Qr.applyMatrix4(t.matrixWorld),this.union(Qr)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Tn),Tn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ws),jr.subVectors(this.max,Ws),es.subVectors(t.a,Ws),ns.subVectors(t.b,Ws),is.subVectors(t.c,Ws),ui.subVectors(ns,es),di.subVectors(is,ns),Ci.subVectors(es,is);let e=[0,-ui.z,ui.y,0,-di.z,di.y,0,-Ci.z,Ci.y,ui.z,0,-ui.x,di.z,0,-di.x,Ci.z,0,-Ci.x,-ui.y,ui.x,0,-di.y,di.x,0,-Ci.y,Ci.x,0];return!Bl(e,es,ns,is,jr)||(e=[1,0,0,0,1,0,0,0,1],!Bl(e,es,ns,is,jr))?!1:(ta.crossVectors(ui,di),e=[ta.x,ta.y,ta.z],Bl(e,es,ns,is,jr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Tn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Tn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Yn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Yn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Yn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Yn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Yn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Yn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Yn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Yn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Yn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Yn=[new U,new U,new U,new U,new U,new U,new U,new U],Tn=new U,Qr=new Un,es=new U,ns=new U,is=new U,ui=new U,di=new U,Ci=new U,Ws=new U,jr=new U,ta=new U,Ri=new U;function Bl(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ri.fromArray(i,r);let o=s.x*Math.abs(Ri.x)+s.y*Math.abs(Ri.y)+s.z*Math.abs(Ri.z),l=t.dot(Ri),c=e.dot(Ri),h=n.dot(Ri);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var ve=new U,ea=new Lt,_f=0,gn=class extends Nn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_f++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=wc,this.updateRanges=[],this.gpuType=xn,this.version=0,this._normalizationScale=t!==void 0?Vo(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)ea.fromBufferAttribute(this,e),ea.applyMatrix3(t),this.setXY(e,ea.x,ea.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix3(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyMatrix4(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.applyNormalMatrix(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ve.fromBufferAttribute(this,e),ve.transformDirection(t),this.setXYZ(e,ve.x,ve.y,ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Fu(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Ou(t,this.array)}};var rr=class extends gn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var ar=class extends gn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ee=class extends gn{constructor(t,e,n){super(new Float32Array(t),e,n)}},xf=new Un,Xs=new U,zl=new U,Qn=class{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):xf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Xs.subVectors(t,this.center);let e=Xs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Xs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(zl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Xs.copy(t.center).add(zl)),this.expandByPoint(Xs.copy(t.center).sub(zl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},yf=0,pn=new Qt,kl=new ge,ss=new U,nn=new Un,qs=new Un,Pe=new U,Fe=class i extends Nn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yf++}),this.uuid=Hi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(sf(t)?ar:rr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Dt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return pn.makeRotationFromQuaternion(t),this.applyMatrix4(pn),this}rotateX(t){return pn.makeRotationX(t),this.applyMatrix4(pn),this}rotateY(t){return pn.makeRotationY(t),this.applyMatrix4(pn),this}rotateZ(t){return pn.makeRotationZ(t),this.applyMatrix4(pn),this}translate(t,e,n){return pn.makeTranslation(t,e,n),this.applyMatrix4(pn),this}scale(t,e,n){return pn.makeScale(t,e,n),this.applyMatrix4(pn),this}lookAt(t){return kl.lookAt(t),kl.updateMatrix(),this.applyMatrix4(kl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ss).negate(),this.translate(ss.x,ss.y,ss.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ee(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Et("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Un);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Pt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Pe.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Pe),Pe.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Pe)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Pt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Pt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){let n=this.boundingSphere.center;if(nn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];qs.setFromBufferAttribute(o),this.morphTargetsRelative?(Pe.addVectors(nn.min,qs.min),nn.expandByPoint(Pe),Pe.addVectors(nn.max,qs.max),nn.expandByPoint(Pe)):(nn.expandByPoint(qs.min),nn.expandByPoint(qs.max))}nn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Pe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Pe));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Pe.fromBufferAttribute(o,c),l&&(ss.fromBufferAttribute(t,c),Pe.add(ss)),s=Math.max(s,n.distanceToSquared(Pe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Pt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Pt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new gn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(n.count);for(let D=0;D<n.count;D++)o[D]=new U,l[D]=new U;let h=new U,f=new U,u=new U,d=new Lt,g=new Lt,v=new Lt,m=new U,p=new U;function M(D,R,N){c[D]=c[R]=c[N]=1,h.fromBufferAttribute(n,D),f.fromBufferAttribute(n,R),u.fromBufferAttribute(n,N),d.fromBufferAttribute(r,D),g.fromBufferAttribute(r,R),v.fromBufferAttribute(r,N),f.sub(h),u.sub(h),g.sub(d),v.sub(d);let F=1/(g.x*v.y-v.x*g.y);isFinite(F)&&(m.copy(f).multiplyScalar(v.y).addScaledVector(u,-g.y).multiplyScalar(F),p.copy(u).multiplyScalar(g.x).addScaledVector(f,-v.x).multiplyScalar(F),o[D].add(m),o[R].add(m),o[N].add(m),l[D].add(p),l[R].add(p),l[N].add(p))}let A=this.groups;A.length===0&&(A=[{start:0,count:t.count}]);for(let D=0,R=A.length;D<R;++D){let N=A[D],F=N.start,G=N.count;for(let P=F,H=F+G;P<H;P+=3)M(t.getX(P+0),t.getX(P+1),t.getX(P+2))}let b=new U,E=new U,T=new U,_=new U;function S(D){T.fromBufferAttribute(s,D),_.copy(T);let R=o[D];b.copy(R),b.sub(T.multiplyScalar(T.dot(R))).normalize(),E.crossVectors(_,R);let F=E.dot(l[D])<0?-1:1;a.setXYZW(D,b.x,b.y,b.z,F)}for(let D=0,R=n.count;D<R;++D)c[D]&&S(D);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new gn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);let s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,h=new U,f=new U;if(t)for(let u=0,d=t.count;u<d;u+=3){let g=t.getX(u+0),v=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=e.count;u<d;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Pe.fromBufferAttribute(t,e),Pe.normalize(),t.setXYZ(e,Pe.x,Pe.y,Pe.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,f=o.normalized,u=new c.constructor(l.length*h),d=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let p=0;p<h;p++)u[g++]=c[d++]}return new gn(u,h,f)}if(this.index===null)return Et("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,f=c.length;h<f;h++){let u=c[h],d=t(u,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){let d=c[f];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],f=r[c];for(let u=0,d=f.length;u<d;u++)h.push(f[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Fa=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=wc,this.updateRanges=[],this.version=0,this.uuid=Hi()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={});let e=Ih(this.array);t.arrayBuffers[e]===void 0&&(t.arrayBuffers[e]=this.array.slice(0).buffer);let n=new this.array.constructor(t.arrayBuffers[e]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={});let e=Ih(this.array);t.arrayBuffers[e]===void 0&&(t.arrayBuffers[e]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:e,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Ih(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=Hi()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}var qe=new U,or=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s,this._normalizationScale=t!==void 0?Vo(t.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)qe.fromBufferAttribute(this,e),qe.applyMatrix4(t),this.setXYZ(e,qe.x,qe.y,qe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)qe.fromBufferAttribute(this,e),qe.applyNormalMatrix(t),this.setXYZ(e,qe.x,qe.y,qe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)qe.fromBufferAttribute(this,e),qe.transformDirection(t),this.setXYZ(e,qe.x,qe.y,qe.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=this._denormalize(e)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=this._denormalize(e)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=this._denormalize(e)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=this._denormalize(e)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=this._normalize(e),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){ir("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new gn(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){ir("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Fu(t,this.data.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Ou(t,this.data.array)}},Gl=new U,vf=new U,Mf=new Dt,sn=class{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Gl.subVectors(n,e).cross(vf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(Gl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Mf.getNormalMatrix(t),s=this.coplanarPoint(Gl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Sf=0,An=class extends Nn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sf++}),this.uuid=Hi(),this.name="",this.type="Material",this.blending=Ps,this.side=Mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rc,this.blendDst=ac,this.blendEquation=ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ct(0,0,0),this.blendAlpha=0,this.depthFunc=ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Tu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Sa,this.stencilZFail=Sa,this.stencilZPass=Sa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Et(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Et(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ct().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new sn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Lt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Lt().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Ui=class extends An{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ct(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},rs,Ys=new U,as=new U,os=new U,ls=new Lt,Zs=new Lt,zu=new Qt,na=new U,Js=new U,ia=new U,Lh=new Lt,Vl=new Lt,Dh=new Lt,vs=class extends ge{constructor(t=new Ui){if(super(),this.isSprite=!0,this.type="Sprite",rs===void 0){rs=new Fe;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Fa(e,5);rs.setIndex([0,1,2,0,2,3]),rs.setAttribute("position",new or(n,3,0,!1)),rs.setAttribute("uv",new or(n,2,3,!1))}this.geometry=rs,this.material=t,this.center=new Lt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&Pt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),as.setFromMatrixScale(this.matrixWorld),zu.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),os.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&as.multiplyScalar(-os.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;sa(na.set(-.5,-.5,0),os,a,as,s,r),sa(Js.set(.5,-.5,0),os,a,as,s,r),sa(ia.set(.5,.5,0),os,a,as,s,r),Lh.set(0,0),Vl.set(1,0),Dh.set(1,1);let o=t.ray.intersectTriangle(na,Js,ia,!1,Ys);if(o===null&&(sa(Js.set(-.5,.5,0),os,a,as,s,r),Vl.set(0,1),o=t.ray.intersectTriangle(na,ia,Js,!1,Ys),o===null))return;let l=t.ray.origin.distanceTo(Ys);l<t.near||l>t.far||e.push({distance:l,point:Ys.clone(),uv:Jn.getInterpolation(Ys,na,Js,ia,Lh,Vl,Dh,new Lt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}toJSON(t){let e=super.toJSON(t);return e.object.center=this.center.toArray(),e}};function sa(i,t,e,n,s,r){ls.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Zs.x=r*ls.x-s*ls.y,Zs.y=s*ls.x+r*ls.y):Zs.copy(ls),i.copy(t),i.x+=Zs.x,i.y+=Zs.y,i.applyMatrix4(zu)}var Zn=new U,Hl=new U,ra=new U,aa=new U,Ms=class{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Zn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Zn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Zn.copy(this.origin).addScaledVector(this.direction,e),Zn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Hl.copy(t).add(e).multiplyScalar(.5),ra.copy(e).sub(t).normalize(),aa.copy(this.origin).sub(Hl);let r=t.distanceTo(e)*.5,a=-this.direction.dot(ra),o=aa.dot(this.direction),l=-aa.dot(ra),c=aa.lengthSq(),h=Math.abs(1-a*a),f,u,d,g;if(h>0)if(f=a*l-o,u=a*o-l,g=r*h,f>=0)if(u>=-g)if(u<=g){let v=1/h;f*=v,u*=v,d=f*(f+a*u+2*o)+u*(a*f+u+2*l)+c}else u=r,f=Math.max(0,-(a*u+o)),d=-f*f+u*(u+2*l)+c;else u=-r,f=Math.max(0,-(a*u+o)),d=-f*f+u*(u+2*l)+c;else u<=-g?(f=Math.max(0,-(-a*r+o)),u=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+u*(u+2*l)+c):u<=g?(f=0,u=Math.min(Math.max(-r,-l),r),d=u*(u+2*l)+c):(f=Math.max(0,-(a*r+o)),u=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+u*(u+2*l)+c);else u=a>0?-r:r,f=Math.max(0,-(a*u+o)),d=-f*f+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Hl).addScaledVector(ra,u),d}intersectSphere(t,e){if(t.radius<0)return null;Zn.subVectors(t.center,this.origin);let n=Zn.dot(this.direction),s=Zn.dot(Zn)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-u.z)*f,l=(t.max.z-u.z)*f):(o=(t.max.z-u.z)*f,l=(t.min.z-u.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Zn)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,f=t.x-a.x,u=t.y-a.y,d=t.z-a.z,g=e.x-a.x,v=e.y-a.y,m=e.z-a.z,p=n.x-a.x,M=n.y-a.y,A=n.z-a.z,b=Math.abs(l),E=Math.abs(c),T=Math.abs(h),_,S,D,R,N,F,G,P,H,q,V,et;if(b>=E&&b>=T?(D=l,F=f,H=g,et=p,l>=0?(_=c,S=h,R=u,N=d,G=v,P=m,q=M,V=A):(_=h,S=c,R=d,N=u,G=m,P=v,q=A,V=M)):E>=T?(D=c,F=u,H=v,et=M,c>=0?(_=h,S=l,R=d,N=f,G=m,P=g,q=A,V=p):(_=l,S=h,R=f,N=d,G=g,P=m,q=p,V=A)):(D=h,F=d,H=m,et=A,h>=0?(_=l,S=c,R=f,N=u,G=g,P=v,q=p,V=M):(_=c,S=l,R=u,N=f,G=v,P=g,q=M,V=p)),D===0)return null;let X=_/D,Q=S/D,j=1/D,Mt=R-X*F,Ft=N-Q*F,J=G-X*H,pt=P-Q*H,xt=q-X*et,Tt=V-Q*et,mt=xt*pt-Tt*J,Bt=Mt*Tt-Ft*xt,xe=J*Ft-pt*Mt;if(s){if(mt<0||Bt<0||xe<0)return null}else if((mt<0||Bt<0||xe<0)&&(mt>0||Bt>0||xe>0))return null;let Rt=mt+Bt+xe;if(Rt===0)return null;let ne=j*(mt*F+Bt*H+xe*et);return(Rt>0?ne<0:ne>0)?null:this.at(ne/Rt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ss=class extends An{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ct(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.combine=to,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Nh=new Qt,Pi=new Ms,oa=new Qn,Uh=new U,la=new U,ca=new U,ha=new U,Wl=new U,ua=new U,Fh=new U,da=new U,Ut=class extends ge{constructor(t=new Fe,e=new Ss){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){ua.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],f=r[l];h!==0&&(Wl.fromBufferAttribute(f,t),a?ua.addScaledVector(Wl,h):ua.addScaledVector(Wl.sub(e),h))}e.add(ua)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(r),Pi.copy(t.ray).recast(t.near),!(oa.containsPoint(Pi.origin)===!1&&(Pi.intersectSphere(oa,Uh)===null||Pi.origin.distanceToSquared(Uh)>(t.far-t.near)**2))&&(Nh.copy(r).invert(),Pi.copy(t.ray).applyMatrix4(Nh),!(n.boundingBox!==null&&Pi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Pi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=u.length;g<v;g++){let m=u[g],p=a[m.materialIndex],M=Math.max(m.start,d.start),A=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let b=M,E=A;b<E;b+=3){let T=o.getX(b),_=o.getX(b+1),S=o.getX(b+2);s=fa(this,p,t,n,c,h,f,T,_,S),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){let M=o.getX(m),A=o.getX(m+1),b=o.getX(m+2);s=fa(this,a,t,n,c,h,f,M,A,b),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=u.length;g<v;g++){let m=u[g],p=a[m.materialIndex],M=Math.max(m.start,d.start),A=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let b=M,E=A;b<E;b+=3){let T=b,_=b+1,S=b+2;s=fa(this,p,t,n,c,h,f,T,_,S),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){let M=m,A=m+1,b=m+2;s=fa(this,a,t,n,c,h,f,M,A,b),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function bf(i,t,e,n,s,r,a,o){let l;if(t.side===Oe?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Mi,o),l===null)return null;da.copy(o),da.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(da);return c<e.near||c>e.far?null:{distance:c,point:da.clone(),object:i}}function fa(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,la),i.getVertexPosition(l,ca),i.getVertexPosition(c,ha);let h=bf(i,t,e,n,la,ca,ha,Fh);if(h){let f=new U;Jn.getBarycoord(Fh,la,ca,ha,f),s&&(h.uv=Jn.getInterpolatedAttribute(s,o,l,c,f,new Lt)),r&&(h.uv1=Jn.getInterpolatedAttribute(r,o,l,c,f,new Lt)),a&&(h.normal=Jn.getInterpolatedAttribute(a,o,l,c,f,new U),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new U,materialIndex:0};Jn.getNormal(la,ca,ha,u.normal),h.face=u,h.barycoord=f}return h}var lr=class extends Ze{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Le,h=Le,f,u){super(null,a,o,l,c,h,s,r,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var pi=class extends gn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},cs=new Qt,Oh=new Qt,pa=[],Bh=new Un,wf=new Qt,$s=new Ut,Ks=new Qn,Fi=class extends Ut{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new pi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,wf)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Un),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,cs),Bh.copy(t.boundingBox).applyMatrix4(cs),this.boundingBox.union(Bh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Qn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,cs),Ks.copy(t.boundingSphere).applyMatrix4(cs),this.boundingSphere.union(Ks)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if($s.geometry=this.geometry,$s.material=this.material,$s.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ks.copy(this.boundingSphere),Ks.applyMatrix4(n),t.ray.intersectsSphere(Ks)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,cs),Oh.multiplyMatrices(n,cs),$s.matrixWorld=Oh,$s.raycast(t,pa);for(let a=0,o=pa.length;a<o;a++){let l=pa[a];l.instanceId=r,l.object=this,e.push(l)}pa.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new pi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new lr(new Float32Array(s*this.count),s,this.count,oo,xn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ii=new Qn,Tf=new Lt(.5,.5),ma=new U,mi=class{constructor(t=new sn,e=new sn,n=new sn,s=new sn,r=new sn,a=new sn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=mn,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],f=r[5],u=r[6],d=r[7],g=r[8],v=r[9],m=r[10],p=r[11],M=r[12],A=r[13],b=r[14],E=r[15];if(s[0].setComponents(c-a,d-h,p-g,E-M).normalize(),s[1].setComponents(c+a,d+h,p+g,E+M).normalize(),s[2].setComponents(c+o,d+f,p+v,E+A).normalize(),s[3].setComponents(c-o,d-f,p-v,E-A).normalize(),n)s[4].setComponents(l,u,m,b).normalize(),s[5].setComponents(c-l,d-u,p-m,E-b).normalize();else if(s[4].setComponents(c-l,d-u,p-m,E-b).normalize(),e===mn)s[5].setComponents(c+l,d+u,p+m,E+b).normalize();else if(e===ms)s[5].setComponents(l,u,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ii.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ii.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ii)}intersectsSprite(t){Ii.center.set(0,0,0);let e=Tf.distanceTo(t.center);return Ii.radius=.7071067811865476+e,Ii.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ii)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(ma.x=s.normal.x>0?t.max.x:t.min.x,ma.y=s.normal.y>0?t.max.y:t.min.y,ma.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ma)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},zh=new Qt,Oa=class i{constructor(){this.coordinateSystem=mn,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,n=this._frustums;for(let s=0;s<e.length;s++){let r=e[s];zh.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new mi),n[s].setFromProjectionMatrix(zh,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,n=t._frustums;for(let s=0;s<t._count;s++)e[s]===void 0&&(e[s]=new mi),e[s].copy(n[s]);return this._count=t._count,this}clone(){return new i().copy(this)}};var bs=class extends An{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ct(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Ba=new U,za=new U,kh=new Qt,Qs=new Ms,ga=new Qn,Xl=new U,Gh=new U,ka=class extends ge{constructor(t=new Fe,e=new bs){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Ba.fromBufferAttribute(e,s-1),za.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Ba.distanceTo(za);t.setAttribute("lineDistance",new ee(n,1))}else Et("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ga.copy(n.boundingSphere),ga.applyMatrix4(s),ga.radius+=r,t.ray.intersectsSphere(ga)===!1)return;kh.copy(s).invert(),Qs.copy(t.ray).applyMatrix4(kh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){let d=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=d,m=g-1;v<m;v+=c){let p=h.getX(v),M=h.getX(v+1),A=_a(this,t,Qs,l,p,M,v);A&&e.push(A)}if(this.isLineLoop){let v=h.getX(g-1),m=h.getX(d),p=_a(this,t,Qs,l,v,m,g-1);p&&e.push(p)}}else{let d=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let v=d,m=g-1;v<m;v+=c){let p=_a(this,t,Qs,l,v,v+1,v);p&&e.push(p)}if(this.isLineLoop){let v=_a(this,t,Qs,l,g-1,d,g-1);v&&e.push(v)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function _a(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(Ba.fromBufferAttribute(o,s),za.fromBufferAttribute(o,r),e.distanceSqToSegment(Ba,za,Xl,Gh)>n)return;Xl.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Xl);if(!(c<t.near||c>t.far))return{distance:c,point:Gh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Vh=new U,Hh=new U,cr=class extends ka{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Vh.fromBufferAttribute(e,s),Hh.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Vh.distanceTo(Hh);t.setAttribute("lineDistance",new ee(n,1))}else Et("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var hr=class extends Ze{constructor(t=[],e=Gi,n,s,r,a,o,l,c,h){super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},gi=class extends Ze{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var jn=class extends Ze{constructor(t,e,n=En,s,r,a,o=Le,l=Le,c,h=Kn,f=1){if(h!==Kn&&h!==ei)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:f};super(u,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new _s(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},ur=class extends jn{constructor(t,e=En,n=Gi,s,r,a=Le,o=Le,l,c=Kn){let h={width:t,height:t,depth:1},f=[h,h,h,h,h,h];super(t,t,e,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},dr=class extends Ze{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},we=class i extends Fe{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],f=[],u=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ee(c,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(f,2));function g(v,m,p,M,A,b,E,T,_,S,D){let R=b/_,N=E/S,F=b/2,G=E/2,P=T/2,H=_+1,q=S+1,V=0,et=0,X=new U;for(let Q=0;Q<q;Q++){let j=Q*N-G;for(let Mt=0;Mt<H;Mt++){let Ft=Mt*R-F;X[v]=Ft*M,X[m]=j*A,X[p]=P,c.push(X.x,X.y,X.z),X[v]=0,X[m]=0,X[p]=T>0?1:-1,h.push(X.x,X.y,X.z),f.push(Mt/_),f.push(1-Q/S),V+=1}}for(let Q=0;Q<S;Q++)for(let j=0;j<_;j++){let Mt=u+j+H*Q,Ft=u+j+H*(Q+1),J=u+(j+1)+H*(Q+1),pt=u+(j+1)+H*Q;l.push(Mt,Ft,pt),l.push(Ft,J,pt),et+=6}o.addGroup(d,et,D),d+=et,u+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},fr=class i extends Fe{constructor(t=1,e=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:s,heightSegments:r},e=Math.max(0,e),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=e/2,f=Math.PI/2*t,u=e,d=2*f+u,g=n*2+r,v=s+1,m=new U,p=new U;for(let M=0;M<=g;M++){let A=0,b=0,E=0,T=0;if(M<=n){let D=M/n,R=D*Math.PI/2;b=-h-t*Math.cos(R),E=t*Math.sin(R),T=-t*Math.cos(R),A=D*f}else if(M<=n+r){let D=(M-n)/r;b=-h+D*e,E=t,T=0,A=f+D*u}else{let D=(M-n-r)/n,R=D*Math.PI/2;b=h+t*Math.sin(R),E=t*Math.cos(R),T=t*Math.sin(R),A=f+u+D*f}let _=Math.max(0,Math.min(1,A/d)),S=0;M===0?S=.5/s:M===g&&(S=-.5/s);for(let D=0;D<=s;D++){let R=D/s,N=R*Math.PI*2,F=Math.sin(N),G=Math.cos(N);p.x=-E*G,p.y=b,p.z=E*F,o.push(p.x,p.y,p.z),m.set(-E*G,T,E*F),m.normalize(),l.push(m.x,m.y,m.z),c.push(R+S,_)}if(M>0){let D=(M-1)*v;for(let R=0;R<s;R++){let N=D+R,F=D+R+1,G=M*v+R,P=M*v+R+1;a.push(N,F,G),a.push(F,P,G)}}}this.setIndex(a),this.setAttribute("position",new ee(o,3)),this.setAttribute("normal",new ee(l,3)),this.setAttribute("uv",new ee(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}};var _i=class i extends Fe{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],f=[],u=[],d=[],g=0,v=[],m=n/2,p=0;M(),a===!1&&(t>0&&A(!0),e>0&&A(!1)),this.setIndex(h),this.setAttribute("position",new ee(f,3)),this.setAttribute("normal",new ee(u,3)),this.setAttribute("uv",new ee(d,2));function M(){let b=new U,E=new U,T=0,_=(e-t)/n;for(let S=0;S<=r;S++){let D=[],R=S/r,N=R*(e-t)+t;for(let F=0;F<=s;F++){let G=F/s,P=G*l+o,H=Math.sin(P),q=Math.cos(P);E.x=N*H,E.y=-R*n+m,E.z=N*q,f.push(E.x,E.y,E.z),b.set(H,_,q).normalize(),u.push(b.x,b.y,b.z),d.push(G,1-R),D.push(g++)}v.push(D)}for(let S=0;S<s;S++)for(let D=0;D<r;D++){let R=v[D][S],N=v[D+1][S],F=v[D+1][S+1],G=v[D][S+1];(t>0||D!==0)&&(h.push(R,N,G),T+=3),(e>0||D!==r-1)&&(h.push(N,F,G),T+=3)}c.addGroup(p,T,0),p+=T}function A(b){let E=g,T=new Lt,_=new U,S=0,D=b===!0?t:e,R=b===!0?1:-1;for(let F=1;F<=s;F++)f.push(0,m*R,0),u.push(0,R,0),d.push(.5,.5),g++;let N=g;for(let F=0;F<=s;F++){let P=F/s*l+o,H=Math.cos(P),q=Math.sin(P);_.x=D*q,_.y=m*R,_.z=D*H,f.push(_.x,_.y,_.z),u.push(0,R,0),T.x=H*.5+.5,T.y=q*.5*R+.5,d.push(T.x,T.y),g++}for(let F=0;F<s;F++){let G=E+F,P=N+F;b===!0?h.push(P,P+1,G):h.push(P+1,P,G),S+=3}c.addGroup(p,S,b===!0?1:2),p+=S}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var _n=class i extends Fe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,f=t/o,u=e/l,d=[],g=[],v=[],m=[];for(let p=0;p<h;p++){let M=p*u-a;for(let A=0;A<c;A++){let b=A*f-r;g.push(b,-M,0),v.push(0,0,1),m.push(A/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){let A=M+c*p,b=M+c*(p+1),E=M+1+c*(p+1),T=M+1+c*p;d.push(A,b,T),d.push(b,E,T)}this.setIndex(d),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(v,3)),this.setAttribute("uv",new ee(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var Oi=class i extends Fe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],f=new U,u=new U,d=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){let M=[],A=p/n,b=a+A*o,E=t*Math.cos(b),T=Math.sqrt(t*t-E*E),_=0;p===0&&a===0?_=.5/e:p===n&&l===Math.PI&&(_=-.5/e);for(let S=0;S<=e;S++){let D=S/e,R=s+D*r;f.x=-T*Math.cos(R),f.y=E,f.z=T*Math.sin(R),g.push(f.x,f.y,f.z),u.copy(f).normalize(),v.push(u.x,u.y,u.z),m.push(D+_,1-A),M.push(c++)}h.push(M)}for(let p=0;p<n;p++)for(let M=0;M<e;M++){let A=h[p][M+1],b=h[p][M],E=h[p+1][M],T=h[p+1][M+1];(p!==0||a>0)&&d.push(A,b,T),(p!==n-1||l<Math.PI)&&d.push(b,E,T)}this.setIndex(d),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(v,3)),this.setAttribute("uv",new ee(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var pr=class i extends Fe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],f=[],u=new U,d=new U,g=new U;for(let v=0;v<=n;v++){let m=a+v/n*o;for(let p=0;p<=s;p++){let M=p/s*r;d.x=(t+e*Math.cos(m))*Math.cos(M),d.y=(t+e*Math.cos(m))*Math.sin(M),d.z=e*Math.sin(m),c.push(d.x,d.y,d.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),g.subVectors(d,u).normalize(),h.push(g.x,g.y,g.z),f.push(p/s),f.push(v/n)}}for(let v=1;v<=n;v++)for(let m=1;m<=s;m++){let p=(s+1)*v+m-1,M=(s+1)*(v-1)+m-1,A=(s+1)*(v-1)+m,b=(s+1)*v+m;l.push(p,M,b),l.push(M,A,b)}this.setIndex(l),this.setAttribute("position",new ee(c,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Wi(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Wh(s))s.isRenderTargetTexture?(Et("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Wh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function We(i){let t={};for(let e=0;e<i.length;e++){let n=Wi(i[e]);for(let s in n)t[s]=n[s]}return t}function Wh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Af(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Ec(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Zt.workingColorSpace}var ku={clone:Wi,merge:We},Ef=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Cf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Fn=class extends An{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ef,this.fragmentShader=Cf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Wi(t.uniforms),this.uniformsGroups=Af(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Ct().setHex(s.value);break;case"v2":this.uniforms[n].value=new Lt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new fe().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Dt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Qt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ga=class extends Fn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},he=class extends An{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ct(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ct(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lr,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ws=class extends he{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Lt(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Jt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Ct(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ct(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ct(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){this._diffuseRoughness>0!=t>0&&this.version++,this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}get iridescenceThicknessRange(){return Li('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){Li('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var mr=class extends An{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ct(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ct(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lr,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new on,this.combine=to,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ts=class extends An{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=bu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Va=class extends An{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function hs(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function xa(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var xi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ha=class extends xi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Zl,endingEnd:Zl}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Jl:r=t,o=2*e-n;break;case $l:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Jl:a=t,l=2*n-e;break;case $l:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,f=this._offsetNext,u=this._weightPrev,d=this._weightNext,g=(n-e)/(s-e),v=g*g,m=v*g,p=-u*m+2*u*v-u*g,M=(1+u)*m+(-1.5-2*u)*v+(-.5+u)*g+1,A=(-1-d)*m+(1.5+d)*v+.5*g,b=d*m-d*v;for(let E=0;E!==o;++E)r[E]=p*a[h+E]+M*a[c+E]+A*a[l+E]+b*a[f+E];return r}},Wa=class extends xi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(n-e)/(s-e),f=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*f+a[l+u]*h;return r}},Xa=class extends xi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},qa=class extends xi{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,f=this.outTangents;if(!h||!f){let g=(n-e)/(s-e),v=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*v+a[l+m]*g;return r}let u=o*2,d=t-1;for(let g=0;g!==o;++g){let v=a[c+g],m=a[l+g],p=d*u+g*2,M=f[p],A=f[p+1],b=t*u+g*2,E=h[b],T=h[b+1],_=Pf(n,e,M,E,s);r[g]=Gu(_,v,A,T,m)}return r}};function Gu(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Rf(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Pf(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=Gu(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Rf(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var ln=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=hs(e,this.TimeBufferType),this.values=hs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:hs(t.times,Array),values:hs(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),xa(t.settings)&&(n.settings={inTangents:hs(t.settings.inTangents,Array),outTangents:hs(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Xa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Wa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Ha(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new qa(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case js:e=this.InterpolantFactoryMethodDiscrete;break;case Ia:e=this.InterpolantFactoryMethodLinear;break;case Ma:e=this.InterpolantFactoryMethodSmooth;break;case Yl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Et("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return js;case this.InterpolantFactoryMethodLinear:return Ia;case this.InterpolantFactoryMethodSmooth:return Ma;case this.InterpolantFactoryMethodBezier:return Yl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t;xa(this.settings)&&(Xh(this.settings.inTangents,t),Xh(this.settings.outTangents,t))}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;xa(this.settings)&&(qh(this.settings.inTangents,t),qh(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Pt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Pt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Pt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Pt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&rf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Pt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ma,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let f=o*n,u=f-n,d=f+n;for(let g=0;g!==n;++g){let v=e[f+g];if(v!==e[u+g]||v!==e[d+g]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let f=o*n,u=a*n;for(let d=0;d!==n;++d)e[u+d]=e[f+d]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,xa(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Xh(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]+=t}function qh(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}ln.prototype.ValueTypeName="";ln.prototype.TimeBufferType=Float32Array;ln.prototype.ValueBufferType=Float32Array;ln.prototype.DefaultInterpolation=Ia;var yi=class extends ln{constructor(t,e,n){super(t,e,n)}};yi.prototype.ValueTypeName="bool";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=js;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ya=class extends ln{constructor(t,e,n,s){super(t,e,n,s)}};Ya.prototype.ValueTypeName="color";var Za=class extends ln{constructor(t,e,n,s){super(t,e,n,s)}};Za.prototype.ValueTypeName="number";var Ja=class extends xi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)rn.slerpFlat(r,0,a,c-o,a,c,l);return r}},gr=class extends ln{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new Ja(this.times,this.values,this.getValueSize(),t)}};gr.prototype.ValueTypeName="quaternion";gr.prototype.InterpolantFactoryMethodSmooth=void 0;var vi=class extends ln{constructor(t,e,n){super(t,e,n)}};vi.prototype.ValueTypeName="string";vi.prototype.ValueBufferType=Array;vi.prototype.DefaultInterpolation=js;vi.prototype.InterpolantFactoryMethodLinear=void 0;vi.prototype.InterpolantFactoryMethodSmooth=void 0;var $a=class extends ln{constructor(t,e,n,s){super(t,e,n,s)}};$a.prototype.ValueTypeName="vector";var Ka=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,u=c.length;f<u;f+=2){let d=c[f],g=c[f+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Vu=new Ka,Qa=class{constructor(t){this.manager=t!==void 0?t:Vu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}};Qa.DEFAULT_MATERIAL_NAME="__DEFAULT";var As=class extends ge{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ct(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},_r=class extends As{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ge.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ct(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ql=new Qt,Yh=new U,Zh=new U,xr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Lt(512,512),this.mapType=je,this.map=null,this.mapPass=null,this.matrix=new Qt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new mi,this._frameExtents=new Lt(1,1),this._viewportCount=1,this._viewports=[new fe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Yh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Yh),Zh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Zh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){ql.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(ql,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===ms||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(ql)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},ya=new U,va=new rn,Ln=new U,yr=class extends ge{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qt,this.projectionMatrix=new Qt,this.projectionMatrixInverse=new Qt,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(ya,va,Ln),Ln.x===1&&Ln.y===1&&Ln.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ya,va,Ln.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(ya,va,Ln),Ln.x===1&&Ln.y===1&&Ln.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ya,va,Ln.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},fi=new U,Jh=new Lt,$h=new Lt,He=class extends yr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=La*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(bl*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return La*2*Math.atan(Math.tan(bl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){fi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(fi.x,fi.y).multiplyScalar(-t/fi.z),fi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fi.x,fi.y).multiplyScalar(-t/fi.z)}getViewSize(t,e){return this.getViewBounds(t,Jh,$h),e.subVectors($h,Jh)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(bl*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Kl=class extends xr{constructor(){super(new He(90,1,.5,500)),this.isPointLightShadow=!0}},vr=class extends As{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Kl}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},Mr=class extends yr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Ql=class extends xr{constructor(){super(new Mr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Es=class extends As{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ge.DEFAULT_UP),this.updateMatrix(),this.target=new ge,this.shadow=new Ql}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var us=-90,ds=1,Cs=class extends ge{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new He(us,ds,t,e);s.layers=this.layers,this.add(s);let r=new He(us,ds,t,e);r.layers=this.layers,this.add(r);let a=new He(us,ds,t,e);a.layers=this.layers,this.add(a);let o=new He(us,ds,t,e);o.layers=this.layers,this.add(o);let l=new He(us,ds,t,e);l.layers=this.layers,this.add(l);let c=new He(us,ds,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ms)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.mipmapsAutoUpdate=v,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(f,u,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ja=class extends He{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}};var Cc="\\[\\]\\.:\\/",If=new RegExp("["+Cc+"]","g"),Rc="[^"+Cc+"]",Lf="[^"+Cc.replace("\\.","")+"]",Df=/((?:WC+[\/:])*)/.source.replace("WC",Rc),Nf=/(WCOD+)?/.source.replace("WCOD",Lf),Uf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Rc),Ff=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Rc),Of=new RegExp("^"+Df+Nf+Uf+Ff+"$"),Bf=["material","materials","bones","map"],jl=class{constructor(t,e,n){let s=n||ce.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},ce=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(If,"")}static parseTrackName(t){let e=Of.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Bf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Et("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Pt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Pt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Pt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Pt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Pt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Pt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Pt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Pt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Pt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Pt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ce.Composite=jl;ce.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ce.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ce.prototype.GetterByBindingType=[ce.prototype._getValue_direct,ce.prototype._getValue_array,ce.prototype._getValue_arrayElement,ce.prototype._getValue_toArray];ce.prototype.SetterByBindingTypeAndVersioning=[[ce.prototype._setValue_direct,ce.prototype._setValue_direct_setNeedsUpdate,ce.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ce.prototype._setValue_array,ce.prototype._setValue_array_setNeedsUpdate,ce.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ce.prototype._setValue_arrayElement,ce.prototype._setValue_arrayElement_setNeedsUpdate,ce.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ce.prototype._setValue_fromArray,ce.prototype._setValue_fromArray_setNeedsUpdate,ce.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Gg=new Float32Array(1);var Kh=new Qt,Sr=class{constructor(t,e,n=0,s=1/0){this.ray=new Ms(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new xs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Pt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Kh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Kh),this}intersectObject(t,e=!0,n=[]){return tc(t,this,n,e),n.sort(Qh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)tc(t[s],this,n,e);return n.sort(Qh),n}};function Qh(i,t){return i.distance-t.distance}function tc(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)tc(r[a],t,e,!0)}}var ec=class{static{this.prototype.isMatrix2=!0}constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};function Pc(i,t,e,n){let s=zf(n);switch(e){case xc:return i*t;case oo:return i*t/s.components*s.byteLength;case lo:return i*t/s.components*s.byteLength;case Si:return i*t*2/s.components*s.byteLength;case co:return i*t*2/s.components*s.byteLength;case yc:return i*t*3/s.components*s.byteLength;case Rn:return i*t*4/s.components*s.byteLength;case ho:return i*t*4/s.components*s.byteLength;case Ar:case Er:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Cr:case Rr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case fo:case mo:return Math.max(i,16)*Math.max(t,8)/4;case uo:case po:return Math.max(i,8)*Math.max(t,8)/2;case go:case _o:case yo:case vo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case xo:case Pr:case Mo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case So:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case bo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case wo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case To:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Ao:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Eo:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Co:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ro:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Po:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Io:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Lo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Do:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case No:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Uo:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Fo:case Oo:case Bo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case zo:case ko:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Ir:case Go:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function zf(i){switch(i){case je:case pc:return{byteLength:1,components:1};case Ls:case mc:case Cn:return{byteLength:2,components:1};case ro:case ao:return{byteLength:2,components:4};case En:case so:case xn:return{byteLength:4,components:1};case gc:case _c:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Et("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function hd(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Gf(i){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,f=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){let h=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,h);else{f.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<f.length;d++){let g=f[u],v=f[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,f[u]=v)}f.length=u+1;for(let d=0,g=f.length;d<g;d++){let v=f[d];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Vf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Wf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Xf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,qf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Yf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Jf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$f=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Kf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,tp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ep=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,np=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ip=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,sp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ap=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,op=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,lp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,cp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,hp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,up=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,dp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,fp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,gp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,_p="gl_FragColor = linearToOutputTexel( gl_FragColor );",xp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,yp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,vp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Mp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Sp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,wp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Tp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ap=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ep=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Cp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Rp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Pp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ip=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Lp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Dp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Np=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Up=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Fp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Op=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Bp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,zp=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,kp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Gp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Vp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hp=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Wp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Yp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Jp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,$p=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Kp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Qp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,t0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,e0=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,n0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,i0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,s0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,r0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,a0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,o0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,l0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,c0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,h0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,u0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,d0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,f0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,p0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,m0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,g0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,_0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,x0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,y0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,v0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,M0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,S0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,b0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,w0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,T0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,A0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,E0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,C0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,R0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,P0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,I0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,L0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,D0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,N0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,U0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,F0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,O0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,B0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,z0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,k0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,G0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,V0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,W0=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,X0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,q0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Y0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Z0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,J0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,$0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,K0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Q0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,j0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,t1=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,e1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,n1=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,i1=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,s1=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,r1=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,a1=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,o1=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,l1=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,c1=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,h1=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,u1=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,d1=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f1=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,p1=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,m1=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,g1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_1=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,x1=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,y1=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,v1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Gt={alphahash_fragment:Vf,alphahash_pars_fragment:Hf,alphamap_fragment:Wf,alphamap_pars_fragment:Xf,alphatest_fragment:qf,alphatest_pars_fragment:Yf,aomap_fragment:Zf,aomap_pars_fragment:Jf,batching_pars_vertex:$f,batching_vertex:Kf,begin_vertex:Qf,beginnormal_vertex:jf,bsdfs:tp,iridescence_fragment:ep,bumpmap_pars_fragment:np,clipping_planes_fragment:ip,clipping_planes_pars_fragment:sp,clipping_planes_pars_vertex:rp,clipping_planes_vertex:ap,color_fragment:op,color_pars_fragment:lp,color_pars_vertex:cp,color_vertex:hp,common:up,defaultnormal_vertex:dp,displacementmap_pars_vertex:fp,displacementmap_vertex:pp,emissivemap_fragment:mp,emissivemap_pars_fragment:gp,colorspace_fragment:_p,colorspace_pars_fragment:xp,envmap_fragment:yp,envmap_common_pars_fragment:vp,envmap_pars_fragment:Mp,envmap_pars_vertex:Sp,envmap_physical_pars_fragment:Dp,envmap_vertex:bp,fog_vertex:wp,fog_pars_vertex:Tp,fog_fragment:Ap,fog_pars_fragment:Ep,gradientmap_pars_fragment:Cp,lightmap_pars_fragment:Rp,lights_lambert_fragment:Pp,lights_lambert_pars_fragment:Ip,lights_pars_begin:Lp,lights_toon_fragment:Np,lights_toon_pars_fragment:Up,lights_phong_fragment:Fp,lights_phong_pars_fragment:Op,lights_physical_fragment:Bp,lights_physical_pars_fragment:zp,lights_fragment_begin:kp,lights_fragment_maps:Gp,lights_fragment_end:Vp,lightprobes_pars_fragment:Hp,logdepthbuf_fragment:Wp,logdepthbuf_pars_fragment:Xp,logdepthbuf_pars_vertex:qp,logdepthbuf_vertex:Yp,map_fragment:Zp,map_pars_fragment:Jp,map_particle_fragment:$p,map_particle_pars_fragment:Kp,metalnessmap_fragment:Qp,metalnessmap_pars_fragment:jp,morphinstance_vertex:t0,morphcolor_vertex:e0,morphnormal_vertex:n0,morphtarget_pars_vertex:i0,morphtarget_vertex:s0,normal_fragment_begin:r0,normal_fragment_maps:a0,normal_pars_fragment:o0,normal_pars_vertex:l0,normal_vertex:c0,normalmap_pars_fragment:h0,clearcoat_normal_fragment_begin:u0,clearcoat_normal_fragment_maps:d0,clearcoat_pars_fragment:f0,iridescence_pars_fragment:p0,opaque_fragment:m0,packing:g0,premultiplied_alpha_fragment:_0,project_vertex:x0,dithering_fragment:y0,dithering_pars_fragment:v0,roughnessmap_fragment:M0,roughnessmap_pars_fragment:S0,shadowmap_pars_fragment:b0,shadowmap_pars_vertex:w0,shadowmap_vertex:T0,shadowmask_pars_fragment:A0,skinbase_vertex:E0,skinning_pars_vertex:C0,skinning_vertex:R0,skinnormal_vertex:P0,specularmap_fragment:I0,specularmap_pars_fragment:L0,tonemapping_fragment:D0,tonemapping_pars_fragment:N0,transmission_fragment:U0,transmission_pars_fragment:F0,uv_pars_fragment:O0,uv_pars_vertex:B0,uv_vertex:z0,worldpos_vertex:k0,background_vert:G0,background_frag:V0,backgroundCube_vert:H0,backgroundCube_frag:W0,cube_vert:X0,cube_frag:q0,depth_vert:Y0,depth_frag:Z0,distance_vert:J0,distance_frag:$0,equirect_vert:K0,equirect_frag:Q0,linedashed_vert:j0,linedashed_frag:t1,meshbasic_vert:e1,meshbasic_frag:n1,meshlambert_vert:i1,meshlambert_frag:s1,meshmatcap_vert:r1,meshmatcap_frag:a1,meshnormal_vert:o1,meshnormal_frag:l1,meshphong_vert:c1,meshphong_frag:h1,meshphysical_vert:u1,meshphysical_frag:d1,meshtoon_vert:f1,meshtoon_frag:p1,points_vert:m1,points_frag:g1,shadow_vert:_1,shadow_frag:x1,sprite_vert:y1,sprite_frag:v1},ft={common:{diffuse:{value:new Ct(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Dt},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Dt}},envmap:{envMap:{value:null},envMapRotation:{value:new Dt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Dt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Dt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Dt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Dt},normalScale:{value:new Lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Dt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Dt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Dt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Dt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ct(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ct(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0},uvTransform:{value:new Dt}},sprite:{diffuse:{value:new Ct(16777215)},opacity:{value:1},center:{value:new Lt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Dt},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0}}},zn={basic:{uniforms:We([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:We([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,ft.lights,{emissive:{value:new Ct(0)},envMapIntensity:{value:1}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:We([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,ft.lights,{emissive:{value:new Ct(0)},specular:{value:new Ct(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:We([ft.common,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.roughnessmap,ft.metalnessmap,ft.fog,ft.lights,{emissive:{value:new Ct(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:We([ft.common,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.gradientmap,ft.fog,ft.lights,{emissive:{value:new Ct(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:We([ft.common,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:We([ft.points,ft.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:We([ft.common,ft.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:We([ft.common,ft.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:We([ft.common,ft.bumpmap,ft.normalmap,ft.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:We([ft.sprite,ft.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new Dt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Dt}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distance:{uniforms:We([ft.common,ft.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distance_vert,fragmentShader:Gt.distance_frag},shadow:{uniforms:We([ft.lights,ft.fog,{color:{value:new Ct(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};zn.physical={uniforms:We([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Dt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Dt},clearcoatNormalScale:{value:new Lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Dt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Dt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Dt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Dt},sheen:{value:0},sheenColor:{value:new Ct(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Dt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Dt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Dt},transmissionSamplerSize:{value:new Lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Dt},attenuationDistance:{value:0},attenuationColor:{value:new Ct(0)},specularColor:{value:new Ct(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Dt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Dt},anisotropyVector:{value:new Lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Dt}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};var Ho={r:0,b:0,g:0},M1=new Qt,ud=new Dt;ud.set(-1,0,0,0,1,0,0,0,1);function S1(i,t,e,n,s,r){let a=new Ct(0),o=s===!0?0:1,l,c,h=null,f=0,u=null;function d(M){let A=M.isScene===!0?M.background:null;if(A&&A.isTexture){let b=M.backgroundBlurriness>0;A=t.get(A,b)}return A}function g(M){let A=!1,b=d(M);b===null?m(a,o):b&&b.isColor&&(m(b,1),A=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(M,A){let b=d(A);b&&b.isCubeTexture?(c===void 0&&(c=new Ut(new we(1,1,1),new Fn({name:"BackgroundCubeMaterial",uniforms:Wi(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:Oe,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,T,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(M1.makeRotationFromEuler(A.backgroundRotation)).transpose(),b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(ud),c.material.toneMapped=Zt.getTransfer(b.colorSpace)!==te,(h!==b||f!==b.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,h=b,f=b.version,u=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new Ut(new _n(2,2),new Fn({name:"BackgroundMaterial",uniforms:Wi(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:Mi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Zt.getTransfer(b.colorSpace)!==te,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(h!==b||f!==b.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,h=b,f=b.version,u=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,A){M.getRGB(Ho,Ec(i)),e.buffers.color.setClear(Ho.r,Ho.g,Ho.b,A,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,A=1){a.set(M),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:g,addToRenderList:v,dispose:p}}function b1(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(N,F,G,P,H){let q=!1,V=f(N,P,G,F);r!==V&&(r=V,c(r.object)),q=d(N,P,G,H),q&&g(N,P,G,H),H!==null&&t.update(H,i.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,b(N,F,G,P),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function f(N,F,G,P){let H=P.wireframe===!0,q=n[F.id];q===void 0&&(q={},n[F.id]=q);let V=N.isInstancedMesh===!0?N.id:0,et=q[V];et===void 0&&(et={},q[V]=et);let X=et[G.id];X===void 0&&(X={},et[G.id]=X);let Q=X[H];return Q===void 0&&(Q=u(l()),X[H]=Q),Q}function u(N){let F=[],G=[],P=[];for(let H=0;H<e;H++)F[H]=0,G[H]=0,P[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:G,attributeDivisors:P,object:N,attributes:{},index:null}}function d(N,F,G,P){let H=r.attributes,q=F.attributes,V=0,et=G.getAttributes();for(let X in et)if(et[X].location>=0){let j=H[X],Mt=q[X];if(Mt===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(Mt=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(Mt=N.instanceColor)),j===void 0||j.attribute!==Mt||Mt&&j.data!==Mt.data)return!0;V++}return r.attributesNum!==V||r.index!==P}function g(N,F,G,P){let H={},q=F.attributes,V=0,et=G.getAttributes();for(let X in et)if(et[X].location>=0){let j=q[X];j===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(j=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(j=N.instanceColor));let Mt={};Mt.attribute=j,j&&j.data&&(Mt.data=j.data),H[X]=Mt,V++}r.attributes=H,r.attributesNum=V,r.index=P}function v(){let N=r.newAttributes;for(let F=0,G=N.length;F<G;F++)N[F]=0}function m(N){p(N,0)}function p(N,F){let G=r.newAttributes,P=r.enabledAttributes,H=r.attributeDivisors;G[N]=1,P[N]===0&&(i.enableVertexAttribArray(N),P[N]=1),H[N]!==F&&(i.vertexAttribDivisor(N,F),H[N]=F)}function M(){let N=r.newAttributes,F=r.enabledAttributes;for(let G=0,P=F.length;G<P;G++)F[G]!==N[G]&&(i.disableVertexAttribArray(G),F[G]=0)}function A(N,F,G,P,H,q,V){V===!0?i.vertexAttribIPointer(N,F,G,H,q):i.vertexAttribPointer(N,F,G,P,H,q)}function b(N,F,G,P){v();let H=P.attributes,q=G.getAttributes(),V=F.defaultAttributeValues;for(let et in q){let X=q[et];if(X.location>=0){let Q=H[et];if(Q===void 0&&(et==="instanceMatrix"&&N.instanceMatrix&&(Q=N.instanceMatrix),et==="instanceColor"&&N.instanceColor&&(Q=N.instanceColor)),Q!==void 0){let j=Q.normalized,Mt=Q.itemSize,Ft=t.get(Q);if(Ft===void 0)continue;let J=Ft.buffer,pt=Ft.type,xt=Ft.bytesPerElement,Tt=pt===i.INT||pt===i.UNSIGNED_INT||Q.gpuType===so;if(Q.isInterleavedBufferAttribute){let mt=Q.data,Bt=mt.isInterleavedBuffer===!0?mt.stride:mt.itemSize,xe=Q.offset;if(mt.isInstancedInterleavedBuffer||mt.isInstancedBufferAttribute){for(let Rt=0;Rt<X.locationSize;Rt++)p(X.location+Rt,mt.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=mt.meshPerAttribute*mt.count)}else for(let Rt=0;Rt<X.locationSize;Rt++)m(X.location+Rt);i.bindBuffer(i.ARRAY_BUFFER,J);for(let Rt=0;Rt<X.locationSize;Rt++)A(X.location+Rt,Mt/X.locationSize,pt,j,Bt*xt,(xe+Mt/X.locationSize*Rt)*xt,Tt)}else{if(Q.isInstancedBufferAttribute){for(let mt=0;mt<X.locationSize;mt++)p(X.location+mt,Q.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let mt=0;mt<X.locationSize;mt++)m(X.location+mt);i.bindBuffer(i.ARRAY_BUFFER,J);for(let mt=0;mt<X.locationSize;mt++)A(X.location+mt,Mt/X.locationSize,pt,j,Mt*xt,Mt/X.locationSize*mt*xt,Tt)}}else if(V!==void 0){let j=V[et];if(j!==void 0)switch(j.length){case 2:i.vertexAttrib2fv(X.location,j);break;case 3:i.vertexAttrib3fv(X.location,j);break;case 4:i.vertexAttrib4fv(X.location,j);break;default:i.vertexAttrib1fv(X.location,j)}}}}M()}function E(){D();for(let N in n){let F=n[N];for(let G in F){let P=F[G];for(let H in P){let q=P[H];for(let V in q)h(q[V].object),delete q[V];delete P[H]}}delete n[N]}}function T(N){if(n[N.id]===void 0)return;let F=n[N.id];for(let G in F){let P=F[G];for(let H in P){let q=P[H];for(let V in q)h(q[V].object),delete q[V];delete P[H]}}delete n[N.id]}function _(N){for(let F in n){let G=n[F];for(let P in G){let H=G[P];if(H[N.id]===void 0)continue;let q=H[N.id];for(let V in q)h(q[V].object),delete q[V];delete H[N.id]}}}function S(N){for(let F in n){let G=n[F],P=N.isInstancedMesh===!0?N.id:0,H=G[P];if(H!==void 0){for(let q in H){let V=H[q];for(let et in V)h(V[et].object),delete V[et];delete H[q]}delete G[P],Object.keys(G).length===0&&delete n[F]}}}function D(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:D,resetDefaultState:R,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:S,releaseStatesOfProgram:_,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function w1(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let u=0;for(let d=0;d<h;d++)u+=c[d];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function T1(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let _=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(_){return!(_!==Rn&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(_){let S=_===Cn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(_!==je&&_!==xn&&!S&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Et("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),u=e.logarithmicDepthBuffer===!0&&f===!1;e.reversedDepthBuffer===!0&&f===!1&&Et("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&f===!0&&Et("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),T=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:A,maxFragmentUniforms:b,maxSamples:E,samples:T}}function A1(i){let t=this,e=null,n=0,s=!1,r=!1,a=new sn,o=new Dt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){let d=f.length!==0||u||n!==0||s;return s=u,n=f.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,d){let g=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,p=i.get(f);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let M=r?0:n,A=M*4,b=p.clippingState||null;l.value=b,b=h(g,u,A,d);for(let E=0;E!==A;++E)b[E]=e[E];p.clippingState=b,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(f,u,d,g){let v=f!==null?f.length:0,m=null;if(v!==0){if(m=l.value,g!==!0||m===null){let p=d+v*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,b=d;A!==v;++A,b+=4)a.copy(f[A]).applyMatrix4(M,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}var Ur=class extends an{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new hr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new we(5,5,5),r=new Fn({name:"CubemapFromEquirect",uniforms:Wi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Oe,blending:zi});r.uniforms.tEquirect.value=e;let a=new Ut(s,r),o=e.minFilter;return e.minFilter===ti&&(e.minFilter=Ye),new Cs(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}},Hu=256,E1=3,C1=20,dd=256,fd=16,R1=3,P1=new U,I1=new Ct,Ns=class i{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Cs(1,10,null),this._boxMesh=new Ut(new we(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=P1}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),h=this._getSourceTarget(!0);e>0&&(h.texture.mipmapsAutoUpdate=!1);let f=l.autoClear,u=l.autoClearColor,d=l.autoClearDepth,g=l.autoClearStencil,v=t.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,v===null&&(t.background=l.getClearColor(I1));let m=new Cs(n,s,h);return m.position.copy(o),m.update(l,t),l.autoClear=f,l.autoClearColor=u,l.autoClearDepth=d,l.autoClearStencil=g,t.background=v,e>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(c,e)),this._applyPMREM(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(Hu,Uu(t))}_fromTexture(t,e){t.mapping===Gi||t.mapping===Is?this._setSize(t.image.length===0?Hu:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);let n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){let t=this._cubeSize,e=Wu(t,!1,!1),n=Math.log2(t)-E1;for(let s=0;s<=n;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==e||t&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Wu(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=t,r.activeMipmapLevel=e;let a=t.width>>e;t.viewport.set(0,0,a,a),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===Gi||t.mapping===Is?(this._cubemapMaterial===null&&(this._cubemapMaterial=qu()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Xu()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=L1(),this._integrationMaterial=D1());let e=this._cubeSize,n=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/fd);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-R1)r.roughness.value=o,this._renderCube(t,a,this._integrationMaterial);else{let l=o>0?Math.log2(e)+.5*Math.log2(6/(dd*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(t,a,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=N1());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,n),s.envMap.value=t.texture,this._renderCube(r,0,n)}};function Wu(i,t,e){return new Ur(i,{minFilter:ti,generateMipmaps:t,type:Cn,colorSpace:tr,depthBuffer:e})}function Fr(i,t,e){return new Fn({name:i,uniforms:t,vertexShader:Gt.cube_vert,fragmentShader:e,side:Oe,blending:zi,depthTest:!1,depthWrite:!1})}function L1(){return Fr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${dd}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function D1(){return Fr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:fd}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function N1(){return Fr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${C1}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Xu(){return Fr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function qu(){return Fr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function U1(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,d=!1){return u==null?null:d?a(u):r(u)}function r(u){if(u&&u.isTexture){let d=u.mapping;if(d===eo||d===no)if(t.has(u)){let g=t.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let v=new Ur(g.height);return v.fromEquirectangularTexture(i,u),t.set(u,v),u.addEventListener("dispose",c),o(v.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture&&u.isPMREMTexture!==!0){let d=u.mapping,g=d===eo||d===no,v=d===Gi||d===Is;if(g||v){let m=e.get(u),p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return n===null&&(n=new Ns(i)),m=g?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),m.texture;if(m!==void 0)return m.texture;{let M=u.image;return g&&M&&M.height>0||v&&M&&l(M)?(n===null&&(n=new Ns(i)),m=g?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,d){return d===eo?u.mapping=Gi:d===no&&(u.mapping=Is),u}function l(u){let d=0,g=6;for(let v=0;v<g;v++)u[v]!==void 0&&d++;return d===g}function c(u){let d=u.target;d.removeEventListener("dispose",c);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function h(u){let d=u.target;d.removeEventListener("dispose",h);let g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function f(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function F1(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Li("WebGLRenderer: "+n+" extension not supported."),s}}}function O1(i,t,e,n){let s={},r=new WeakMap,a=new FinalizationRegistry(g=>delete s[g]);function o(g){l(g.target)}function l(g){g.index!==null&&t.remove(g.index);for(let m in g.attributes)t.remove(g.attributes[m]);g.removeEventListener("dispose",o),delete s[g.id],a.unregister(g);let v=r.get(g);v&&(t.remove(v),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,e.memory.geometries--}function c(g,v){return s[v.id]!==void 0||(v.addEventListener("dispose",o),s[v.id]=new WeakRef(v),a.register(v,v.id,v),e.memory.geometries++),v}function h(g){let v=g.attributes;for(let m in v)t.update(v[m],i.ARRAY_BUFFER)}function f(g){let v=g.index,m=g.attributes.position,p=0;if(m===void 0)return;let M=v!==null?v.array.length:m.array.length/3-1,A=m.count>=65535?ar:rr,b=new A(Math.ceil(M/3)*6,1),E=b.array;if(v!==null){let _=v.array;p=v.version;for(let S=0,D=0;S<M;S+=3){let R=_[S+0],N=_[S+1],F=_[S+2];E[D++]=R,E[D++]=N,E[D++]=N,E[D++]=F,E[D++]=F,E[D++]=R}}else{p=m.version;for(let _=0,S=0;_<M;_+=3){let D=_+0,R=_+1,N=_+2;E[S++]=D,E[S++]=R,E[S++]=R,E[S++]=N,E[S++]=N,E[S++]=D}}b.version=p;let T=r.get(g);T&&t.remove(T),r.set(g,b)}function u(g){let v=r.get(g);if(v){let m=g.index;m!==null&&v.version<m.version&&f(g)}else f(g);return r.get(g)}function d(){for(let g in s){let v=s[g].deref();v!==void 0&&l(v)}}return{get:c,update:h,getWireframeAttribute:u,dispose:d}}function B1(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,u){i.drawElements(n,u,r,f*a),e.update(u,n,1)}function c(f,u,d){d!==0&&(i.drawElementsInstanced(n,u,r,f*a,d),e.update(u,n,d))}function h(f,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,f,0,d);let v=0;for(let m=0;m<d;m++)v+=u[m];e.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function z1(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:Pt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function k1(i,t,e){let n=new WeakMap,s=new fe;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0,u=n.get(o);if(u===void 0||u.count!==f){let D=function(){_.dispose(),n.delete(o),o.removeEventListener("dispose",D)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],A=0;d===!0&&(A=1),g===!0&&(A=2),v===!0&&(A=3);let b=o.attributes.position.count*A,E=1;b>t.maxTextureSize&&(E=Math.ceil(b/t.maxTextureSize),b=t.maxTextureSize);let T=new Float32Array(b*E*4*f),_=new sr(T,b,E,f);_.type=xn,_.needsUpdate=!0;let S=A*4;for(let R=0;R<f;R++){let N=m[R],F=p[R],G=M[R],P=b*E*4*R;for(let H=0;H<N.count;H++){let q=H*S;d===!0&&(s.fromBufferAttribute(N,H),T[P+q+0]=s.x,T[P+q+1]=s.y,T[P+q+2]=s.z,T[P+q+3]=0),g===!0&&(s.fromBufferAttribute(F,H),T[P+q+4]=s.x,T[P+q+5]=s.y,T[P+q+6]=s.z,T[P+q+7]=0),v===!0&&(s.fromBufferAttribute(G,H),T[P+q+8]=s.x,T[P+q+9]=s.y,T[P+q+10]=s.z,T[P+q+11]=G.itemSize===4?s.w:1)}}u={count:f,texture:_,size:new Lt(b,E)},n.set(o,u),o.addEventListener("dispose",D)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let v=0;v<c.length;v++)d+=c[v];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function G1(i,t,e,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,f=c.geometry,u=t.get(c,f);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==h&&(d.update(),r.set(d,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var V1={[oc]:"LINEAR_TONE_MAPPING",[lc]:"REINHARD_TONE_MAPPING",[cc]:"CINEON_TONE_MAPPING",[wr]:"ACES_FILMIC_TONE_MAPPING",[uc]:"AGX_TONE_MAPPING",[dc]:"NEUTRAL_TONE_MAPPING",[hc]:"CUSTOM_TONE_MAPPING"};function H1(i,t,e,n,s,r){let a=new an(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,h=new Fe;h.setAttribute("position",new ee([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new ee([0,2,0,0,2,0],2));let f=new Ga({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new Ut(h,f),d=new Mr(-1,1,1,-1,0,1),g=null,v=null,m=!1,p,M=null,A=[],b=!1;this.setSize=function(E,T){a.setSize(E,T),o!==null&&o.setSize(E,T),l!==null&&l.setSize(E,T);for(let _=0;_<A.length;_++){let S=A[_];S.setSize&&S.setSize(E,T)}},this.setEffects=function(E){A=E,b=A.length>0&&A[0].isRenderPass===!0;let T=a.width,_=a.height;A.length>0&&o===null&&(o=new an(T,_,{type:Cn,depthBuffer:!1,stencilBuffer:!1}),l=new an(T,_,{type:Cn,depthBuffer:!1,stencilBuffer:!1}));let S=s===!0&&A.some(D=>D.needsDepthTexture===!0);S!==(a.depthTexture!==null)&&(S===!0&&c===null&&(c=new jn(T,_),r===!0&&(c.format=ei,c.type=Vi)),a.dispose(),a.depthTexture=S?c:null,a.resolveDepthBuffer=S,a.storeMultisampledDepthBuffer=S);for(let D=0;D<A.length;D++){let R=A[D];R.setSize&&R.setSize(T,_),S&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(E,T){if(m||E.toneMapping===On&&A.length===0)return!1;if(M=T,T!==null){let _=T.width,S=T.height;(a.width!==_||a.height!==S)&&this.setSize(_,S)}return b===!1&&E.setRenderTarget(a),p=E.toneMapping,E.toneMapping=On,!0},this.hasRenderPass=function(){return b},this.end=function(E,T){E.toneMapping=p,m=!0;let _=a,S=o;for(let D=0;D<A.length;D++){let R=A[D];R.enabled!==!1&&(R.render(E,S,_,T),R.needsSwap!==!1&&(_=S,S=S===o?l:o))}if(g!==E.outputColorSpace||v!==E.toneMapping){g=E.outputColorSpace,v=E.toneMapping,f.defines={},Zt.getTransfer(g)===te&&(f.defines.SRGB_TRANSFER="");let D=V1[v];D&&(f.defines[D]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=_.texture,E.setRenderTarget(M),E.render(u,d),M=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),h.dispose(),f.dispose()}}var pd=new Ze,md=new jn(1,1),gd=new ur(1),_d=new sr,xd=new Ua,yd=new hr,Yu=[],Zu=[],Ju=new Float32Array(16),$u=new Float32Array(9),Ku=new Float32Array(4);function Us(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Yu[s];if(r===void 0&&(r=new Float32Array(s),Yu[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Te(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ae(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function qo(i,t){let e=Zu[t];e===void 0&&(e=new Int32Array(t),Zu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function W1(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function X1(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2fv(this.addr,t),Ae(e,t)}}function q1(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;i.uniform3fv(this.addr,t),Ae(e,t)}}function Y1(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4fv(this.addr,t),Ae(e,t)}}function Z1(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,n))return;Ku.set(n),i.uniformMatrix2fv(this.addr,!1,Ku),Ae(e,n)}}function J1(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,n))return;$u.set(n),i.uniformMatrix3fv(this.addr,!1,$u),Ae(e,n)}}function $1(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Te(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,n))return;Ju.set(n),i.uniformMatrix4fv(this.addr,!1,Ju),Ae(e,n)}}function K1(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Q1(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2iv(this.addr,t),Ae(e,t)}}function j1(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3iv(this.addr,t),Ae(e,t)}}function tm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4iv(this.addr,t),Ae(e,t)}}function em(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function nm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;i.uniform2uiv(this.addr,t),Ae(e,t)}}function im(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;i.uniform3uiv(this.addr,t),Ae(e,t)}}function sm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;i.uniform4uiv(this.addr,t),Ae(e,t)}}function Yo(i){return i.version===0&&(i.compareFunction=bc,i.needsUpdate=!0),i}function rm(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=Yo(md):r=pd,e.setTexture2D(t||r,s)}function am(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||xd,s)}function om(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=Yo(gd):r=yd,e.setTextureCube(t||r,s)}function lm(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||_d,s)}function cm(i){switch(i){case 5126:return W1;case 35664:return X1;case 35665:return q1;case 35666:return Y1;case 35674:return Z1;case 35675:return J1;case 35676:return $1;case 5124:case 35670:return K1;case 35667:case 35671:return Q1;case 35668:case 35672:return j1;case 35669:case 35673:return tm;case 5125:return em;case 36294:return nm;case 36295:return im;case 36296:return sm;case 35678:case 36198:case 36298:case 36306:case 35682:return rm;case 35679:case 36299:case 36307:return am;case 35680:case 36300:case 36308:case 36293:return om;case 36289:case 36303:case 36311:case 36292:return lm}}function hm(i,t){i.uniform1fv(this.addr,t)}function um(i,t){let e=Us(t,this.size,2);i.uniform2fv(this.addr,e)}function dm(i,t){let e=Us(t,this.size,3);i.uniform3fv(this.addr,e)}function fm(i,t){let e=Us(t,this.size,4);i.uniform4fv(this.addr,e)}function pm(i,t){let e=Us(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function mm(i,t){let e=Us(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function gm(i,t){let e=Us(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function _m(i,t){i.uniform1iv(this.addr,t)}function xm(i,t){i.uniform2iv(this.addr,t)}function ym(i,t){i.uniform3iv(this.addr,t)}function vm(i,t){i.uniform4iv(this.addr,t)}function Mm(i,t){i.uniform1uiv(this.addr,t)}function Sm(i,t){i.uniform2uiv(this.addr,t)}function bm(i,t){i.uniform3uiv(this.addr,t)}function wm(i,t){i.uniform4uiv(this.addr,t)}function Tm(i,t,e){let n=this.cache,s=t.length,r=qo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Ae(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Yo(md):a=pd;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function Am(i,t,e){let n=this.cache,s=t.length,r=qo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Ae(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||xd,r[a])}function Em(i,t,e){let n=this.cache,s=t.length,r=qo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Ae(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=Yo(gd):a=yd;for(let o=0;o!==s;++o)e.setTextureCube(t[o]||a,r[o])}function Cm(i,t,e){let n=this.cache,s=t.length,r=qo(e,s);Te(n,r)||(i.uniform1iv(this.addr,r),Ae(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||_d,r[a])}function Rm(i){switch(i){case 5126:return hm;case 35664:return um;case 35665:return dm;case 35666:return fm;case 35674:return pm;case 35675:return mm;case 35676:return gm;case 5124:case 35670:return _m;case 35667:case 35671:return xm;case 35668:case 35672:return ym;case 35669:case 35673:return vm;case 5125:return Mm;case 36294:return Sm;case 36295:return bm;case 36296:return wm;case 35678:case 36198:case 36298:case 36306:case 35682:return Tm;case 35679:case 36299:case 36307:return Am;case 35680:case 36300:case 36308:case 36293:return Em;case 36289:case 36303:case 36311:case 36292:return Cm}}var Dc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=cm(e.type)}},Nc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Rm(e.type)}},Uc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Ic=/(\w+)(\])?(\[|\.)?/g;function Qu(i,t){i.seq.push(t),i.map[t.id]=t}function Pm(i,t,e){let n=i.name,s=n.length;for(Ic.lastIndex=0;;){let r=Ic.exec(n),a=Ic.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Qu(e,c===void 0?new Dc(o,i,t):new Nc(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new Uc(o),Qu(e,f)),e=f}}}var Ds=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Pm(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function ju(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Im=37297,Lm=0;function Dm(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var td=new Dt;function Nm(i){Zt._getMatrix(td,Zt.workingColorSpace,i);let t=`mat3( ${td.elements.map(e=>e.toFixed(4))} )`;switch(Zt.getTransfer(i)){case er:return[t,"LinearTransferOETF"];case te:return[t,"sRGBTransferOETF"];default:return Et("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function ed(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Dm(i.getShaderSource(t),o)}else return r}function Um(i,t){let e=Nm(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Fm={[oc]:"Linear",[lc]:"Reinhard",[cc]:"Cineon",[wr]:"ACESFilmic",[uc]:"AgX",[dc]:"Neutral",[hc]:"Custom"};function Om(i,t){let e=Fm[t];return e===void 0?(Et("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Wo=new U;function Bm(){Zt.getLuminanceCoefficients(Wo);let i=Wo.x.toFixed(4),t=Wo.y.toFixed(4),e=Wo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function zm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Nr).join(`
`)}function km(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Gm(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Nr(i){return i!==""}function nd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function id(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Vm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fc(i){return i.replace(Vm,Hm)}function Hm(i,t){let e=Gt[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return Fc(e)}var Wm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function sd(i){return i.replace(Wm,Xm)}function Xm(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function rd(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var qm={[Bi]:"SHADOWMAP_TYPE_PCF",[Rs]:"SHADOWMAP_TYPE_VSM"};function Ym(i){return qm[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Zm={[Is]:"ENVMAP_MODE_REFRACTION"};function Jm(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Zm[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var $m={[to]:"ENVMAP_BLENDING_MULTIPLY",[vu]:"ENVMAP_BLENDING_MIX",[Mu]:"ENVMAP_BLENDING_ADD"};function Km(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":$m[i.combine]||"ENVMAP_BLENDING_NONE"}function Qm(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=Ym(e),c=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=Jm(e),f=Km(e),u=zm(e),d=km(r),g=s.createProgram(),v,m,p=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(v=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d].filter(Nr).join(`
`),v.length>0&&(v+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d].filter(Nr).join(`
`),m.length>0&&(m+=`
`)):(v=[rd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Nr).join(`
`),m=[rd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,d,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==On?"#define TONE_MAPPING":"",e.toneMapping!==On?Gt.tonemapping_pars_fragment:"",e.toneMapping!==On?Om("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,Um("linearToOutputTexel",e.outputColorSpace),Bm(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Nr).join(`
`)),a=Fc(a),a=nd(a,e),a=id(a,e),o=Fc(o),o=nd(o,e),o=id(o,e),a=sd(a),o=sd(o),e.isRawShaderMaterial!==!0&&(p=`#version 300 es
`,v=[u,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,m=["#define varying in",e.glslVersion===Ac?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ac?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let M=p+v+a,A=p+m+o,b=ju(s,s.VERTEX_SHADER,M),E=ju(s,s.FRAGMENT_SHADER,A);s.attachShader(g,b),s.attachShader(g,E),e.index0AttributeName!==void 0?s.bindAttribLocation(g,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function T(R){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(g)||"",F=s.getShaderInfoLog(b)||"",G=s.getShaderInfoLog(E)||"",P=N.trim(),H=F.trim(),q=G.trim(),V=!0,et=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,b,E);else{let X=ed(s,b,"vertex"),Q=ed(s,E,"fragment");Pt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+P+`
`+X+`
`+Q)}else P!==""?Et("WebGLProgram: Program Info Log:",P):(H===""||q==="")&&(et=!1);et&&(R.diagnostics={runnable:V,programLog:P,vertexShader:{log:H,prefix:v},fragmentShader:{log:q,prefix:m}})}s.deleteShader(b),s.deleteShader(E),_=new Ds(s,g),S=Gm(s,g)}let _;this.getUniforms=function(){return _===void 0&&T(this),_};let S;this.getAttributes=function(){return S===void 0&&T(this),S};let D=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=s.getProgramParameter(g,Im)),D},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Lm++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=b,this.fragmentShader=E,this}var jm=0,Oc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Bc(t),e.set(t,n)),n}},Bc=class{constructor(t){this.id=jm++,this.code=t,this.usedTimes=0}};function tg(i){return i===Si||i===Pr||i===Ir}function eg(i,t,e,n,s,r){let a=new xs,o=new Oc,l=new Set,c=[],h=new Map,f=n.logarithmicDepthBuffer,u={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(_){return l.add(_),_===0?"uv":`uv${_}`}function g(_,S,D,R,N,F){let G=R.fog,P=N.geometry,H=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,q=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,V=t.get(_.envMap||H,q),et=u[_.type],X=n.precision;_.precision!==null&&(X=n.getMaxPrecision(_.precision),X!==_.precision&&Et("WebGLProgram.getParameters:",_.precision,"not supported, using",X,"instead."));let Q=P.morphAttributes.position||P.morphAttributes.normal||P.morphAttributes.color,j=Q!==void 0?Q.length:0,Mt=0;P.morphAttributes.position!==void 0&&(Mt=1),P.morphAttributes.normal!==void 0&&(Mt=2),P.morphAttributes.color!==void 0&&(Mt=3);let Ft,J,pt,xt;if(et){let dt=zn[et];Ft=dt.vertexShader,J=dt.fragmentShader}else{Ft=_.vertexShader,J=_.fragmentShader;let dt=o.getVertexShaderStage(_),ie=o.getFragmentShaderStage(_);o.update(_,dt,ie),pt=dt.id,xt=ie.id}let Tt=i.getRenderTarget(),mt=i.state.buffers.depth.getReversed(),Bt=N.isInstancedMesh===!0,xe=N.isBatchedMesh===!0,Rt=!!_.map,ne=!!_.matcap,ae=!!V,Xt=ae&&V.isPMREMTexture===!0,Ne=!!_.aoMap,Se=!!_.lightMap,$e=!!_.bumpMap&&_.wireframe===!1,pe=!!_.normalMap,In=!!_.displacementMap,Ee=!!_.emissiveMap,hn=!!_.metalnessMap,un=!!_.roughnessMap,dn=_.anisotropy>0,L=_.clearcoat>0,fn=_.diffuseRoughness>0,ue=_.dispersion>0,de=_.retroreflectivity>0,ut=_.iridescence>0,be=_.sheen>0,At=_.transmission>0,Nt=dn&&!!_.anisotropyMap,w=L&&!!_.clearcoatMap,x=L&&!!_.clearcoatNormalMap,B=L&&!!_.clearcoatRoughnessMap,tt=fn&&!!_.diffuseRoughnessMap,K=ut&&!!_.iridescenceMap,st=ut&&!!_.iridescenceThicknessMap,ct=be&&!!_.sheenColorMap,Y=be&&!!_.sheenRoughnessMap,Z=!!_.specularMap,at=!!_.specularColorMap,C=!!_.specularIntensityMap,$=At&&!!_.transmissionMap,W=At&&!!_.thicknessMap,ot=!!_.gradientMap,it=!!_.alphaMap,rt=_.alphaTest>0,bt=!!_.alphaHash,kt=!!_.extensions,nt=On;_.toneMapped&&(Tt===null||Tt.isXRRenderTarget===!0)&&(nt=i.toneMapping);let wt=Xt?V.isCompressedCubeTexture?V.image[0].mipmaps:V.mipmaps:null,zt={shaderID:et,shaderType:_.type,shaderName:_.name,vertexShader:Ft,fragmentShader:J,defines:_.defines,customVertexShaderID:pt,customFragmentShaderID:xt,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:X,batching:xe,batchingColor:xe&&N._colorsTexture!==null,instancing:Bt,instancingColor:Bt&&N.instanceColor!==null,instancingMorph:Bt&&N.morphTexture!==null,outputColorSpace:Tt===null?i.outputColorSpace:Tt.isXRRenderTarget===!0?Tt.texture.colorSpace:Zt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Rt,matcap:ne,envMap:ae,envMapMode:ae&&V.mapping,envMapPMREM:Xt,envMapMaxLod:Xt?wt.length-1:null,envMapSize:Xt?wt[0].width:null,aoMap:Ne,lightMap:Se,bumpMap:$e,normalMap:pe,displacementMap:In,emissiveMap:Ee,normalMapObjectSpace:pe&&_.normalMapType===wu,normalMapTangentSpace:pe&&_.normalMapType===Lr,packedNormalMap:pe&&_.normalMapType===Lr&&tg(_.normalMap.format),metalnessMap:hn,roughnessMap:un,anisotropy:dn,anisotropyMap:Nt,clearcoat:L,clearcoatMap:w,clearcoatNormalMap:x,clearcoatRoughnessMap:B,diffuseRoughness:fn,diffuseRoughnessMap:tt,dispersion:ue,retroreflection:de,iridescence:ut,iridescenceMap:K,iridescenceThicknessMap:st,sheen:be,sheenColorMap:ct,sheenRoughnessMap:Y,specularMap:Z,specularColorMap:at,specularIntensityMap:C,transmission:At,transmissionMap:$,thicknessMap:W,gradientMap:ot,opaque:_.transparent===!1&&_.blending===Ps&&_.alphaToCoverage===!1,alphaMap:it,alphaTest:rt,alphaHash:bt,combine:_.combine,mapUv:Rt&&d(_.map.channel),aoMapUv:Ne&&d(_.aoMap.channel),lightMapUv:Se&&d(_.lightMap.channel),bumpMapUv:$e&&d(_.bumpMap.channel),normalMapUv:pe&&d(_.normalMap.channel),displacementMapUv:In&&d(_.displacementMap.channel),emissiveMapUv:Ee&&d(_.emissiveMap.channel),metalnessMapUv:hn&&d(_.metalnessMap.channel),roughnessMapUv:un&&d(_.roughnessMap.channel),anisotropyMapUv:Nt&&d(_.anisotropyMap.channel),clearcoatMapUv:w&&d(_.clearcoatMap.channel),clearcoatNormalMapUv:x&&d(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:B&&d(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:tt&&d(_.diffuseRoughnessMap.channel),iridescenceMapUv:K&&d(_.iridescenceMap.channel),iridescenceThicknessMapUv:st&&d(_.iridescenceThicknessMap.channel),sheenColorMapUv:ct&&d(_.sheenColorMap.channel),sheenRoughnessMapUv:Y&&d(_.sheenRoughnessMap.channel),specularMapUv:Z&&d(_.specularMap.channel),specularColorMapUv:at&&d(_.specularColorMap.channel),specularIntensityMapUv:C&&d(_.specularIntensityMap.channel),transmissionMapUv:$&&d(_.transmissionMap.channel),thicknessMapUv:W&&d(_.thicknessMap.channel),alphaMapUv:it&&d(_.alphaMap.channel),vertexTangents:!!P.attributes.tangent&&(pe||dn),vertexNormals:!!P.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!P.attributes.color&&P.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!P.attributes.uv&&(Rt||it),fog:!!G,useFog:_.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||P.attributes.normal===void 0&&pe===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:mt,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:P.attributes.position!==void 0,morphTargets:P.morphAttributes.position!==void 0,morphNormals:P.morphAttributes.normal!==void 0,morphColors:P.morphAttributes.color!==void 0,morphTargetsCount:j,morphTextureStride:Mt,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:F.filter(dt=>dt.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:nt,decodeVideoTexture:Rt&&_.map.isVideoTexture===!0&&Zt.getTransfer(_.map.colorSpace)===te,decodeVideoTextureEmissive:Ee&&_.emissiveMap.isVideoTexture===!0&&Zt.getTransfer(_.emissiveMap.colorSpace)===te,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Qe,flipSided:_.side===Oe,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:kt&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(kt&&_.extensions.multiDraw===!0||xe)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return zt.vertexUv1s=l.has(1),zt.vertexUv2s=l.has(2),zt.vertexUv3s=l.has(3),l.clear(),zt}function v(_){let S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(let D in _.defines)S.push(D),S.push(_.defines[D]);return _.isRawShaderMaterial===!1&&(m(S,_),p(S,_),S.push(i.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function m(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapPMREM),_.push(S.envMapMaxLod),_.push(S.envMapSize),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.diffuseRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.numSunLights),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numSunLightShadows),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.numLightProbeGrids),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function p(_,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.retroreflection&&a.enable(24),S.diffuseRoughness&&a.enable(25),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function M(_){let S=u[_.type],D;if(S){let R=zn[S];D=ku.clone(R.uniforms)}else D=_.uniforms;return D}function A(_,S){let D=h.get(S);return D!==void 0?++D.usedTimes:(D=new Qm(i,S,_,s),c.push(D),h.set(S,D)),D}function b(_){if(--_.usedTimes===0){let S=c.indexOf(_);c[S]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function E(_){o.remove(_)}function T(){o.dispose()}return{getParameters:g,getProgramCacheKey:v,getUniforms:M,acquireProgram:A,releaseProgram:b,releaseShaderCache:E,programs:c,dispose:T}}function ng(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function ig(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function ad(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function od(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u){let d=0;return u.isInstancedMesh&&(d+=2),u.isSkinnedMesh&&(d+=1),d}function o(u,d,g,v,m,p){let M=i[t];return M===void 0?(M={id:u.id,object:u,geometry:d,material:g,materialVariant:a(u),groupOrder:v,renderOrder:u.renderOrder,z:m,group:p},i[t]=M):(M.id=u.id,M.object=u,M.geometry=d,M.material=g,M.materialVariant=a(u),M.groupOrder=v,M.renderOrder=u.renderOrder,M.z=m,M.group=p),t++,M}function l(u,d,g,v,m,p,M){M.reversedDepth===!0&&(m=-m);let A=o(u,d,g,v,m,p);g.transmission>0?n.push(A):g.transparent===!0?s.push(A):e.push(A)}function c(u,d,g,v,m,p){let M=o(u,d,g,v,m,p);g.transmission>0?n.unshift(M):g.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,d){e.length>1&&e.sort(u||ig),n.length>1&&n.sort(d||ad),s.length>1&&s.sort(d||ad)}function f(){for(let u=t,d=i.length;u<d;u++){let g=i[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:h}}function sg(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new od,i.set(n,[a])):s>=r.length?(a=new od,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function rg(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new U,color:new Ct};break;case"SpotLight":e={position:new U,direction:new U,color:new Ct,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new Ct,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new Ct,groundColor:new Ct};break;case"RectAreaLight":e={color:new Ct,position:new U,halfWidth:new U,halfHeight:new U};break}return i[t.id]=e,e}}}function ag(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var og=0;function lg(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function cg(i){let t=new rg,e=ag(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new Qt,a=new Qt;function o(c){let h=0,f=0,u=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let d=0,g=0,v=0,m=0,p=0,M=0,A=0,b=0,E=0,T=0,_=0,S=0,D=0,R=0;c.sort(lg);for(let F=0,G=c.length;F<G;F++){let P=c[F],H=P.color,q=P.intensity,V=P.distance,et=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Si?et=P.shadow.map.texture:et=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=H.r*q,f+=H.g*q,u+=H.b*q;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],q);R++}else if(P.isSunLight){let X=t.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Q=P.shadow,j=e.get(P);j.shadowIntensity=Q.intensity,j.shadowBias=Q.bias,j.shadowNormalBias=Q.normalBias,j.shadowRadius=Q.radius,j.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),n.sunShadow[g]=j,n.sunShadowMap[g]=et;let Mt=Q.getViewportCount();for(let Ft=0;Ft<Mt;Ft++)n.sunShadowMatrix[v+Ft]=Q.getMatrix(Ft),n.sunShadowCascade[v+Ft]=Q._cascadeData[Ft];v+=Mt,g++}n.sun[d]=X,d++}else if(P.isDirectionalLight){let X=t.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Q=P.shadow,j=e.get(P);j.shadowIntensity=Q.intensity,j.shadowBias=Q.bias,j.shadowNormalBias=Q.normalBias,j.shadowRadius=Q.radius,j.shadowMapSize=Q.mapSize,n.directionalShadow[m]=j,n.directionalShadowMap[m]=et,n.directionalShadowMatrix[m]=P.shadow.matrix,E++}n.directional[m]=X,m++}else if(P.isSpotLight){let X=t.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(H).multiplyScalar(q),X.distance=V,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[M]=X;let Q=P.shadow;if(P.map&&(n.spotLightMap[S]=P.map,S++,Q.updateMatrices(P),P.castShadow&&D++),n.spotLightMatrix[M]=Q.matrix,P.castShadow){let j=e.get(P);j.shadowIntensity=Q.intensity,j.shadowBias=Q.bias,j.shadowNormalBias=Q.normalBias,j.shadowRadius=Q.radius,j.shadowMapSize=Q.mapSize,n.spotShadow[M]=j,n.spotShadowMap[M]=et,_++}M++}else if(P.isRectAreaLight){let X=t.get(P);X.color.copy(H).multiplyScalar(q),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[A]=X,A++}else if(P.isPointLight){let X=t.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){let Q=P.shadow,j=e.get(P);j.shadowIntensity=Q.intensity,j.shadowBias=Q.bias,j.shadowNormalBias=Q.normalBias,j.shadowRadius=Q.radius,j.shadowMapSize=Q.mapSize,j.shadowCameraNear=Q.camera.near,j.shadowCameraFar=Q.camera.far,n.pointShadow[p]=j,n.pointShadowMap[p]=et,n.pointShadowMatrix[p]=P.shadow.matrix,T++}n.point[p]=X,p++}else if(P.isHemisphereLight){let X=t.get(P);X.skyColor.copy(P.color).multiplyScalar(q),X.groundColor.copy(P.groundColor).multiplyScalar(q),n.hemi[b]=X,b++}}A>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ft.LTC_FLOAT_1,n.rectAreaLTC2=ft.LTC_FLOAT_2):(n.rectAreaLTC1=ft.LTC_HALF_1,n.rectAreaLTC2=ft.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=u;let N=n.hash;(N.sunLength!==d||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==M||N.rectAreaLength!==A||N.hemiLength!==b||N.numSunShadows!==g||N.numDirectionalShadows!==E||N.numPointShadows!==T||N.numSpotShadows!==_||N.numSpotMaps!==S||N.numLightProbes!==R)&&(n.sun.length=d,n.directional.length=m,n.spot.length=M,n.rectArea.length=A,n.point.length=p,n.hemi.length=b,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+S-D,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=D,n.numLightProbes=R,N.sunLength=d,N.directionalLength=m,N.pointLength=p,N.spotLength=M,N.rectAreaLength=A,N.hemiLength=b,N.numSunShadows=g,N.numDirectionalShadows=E,N.numPointShadows=T,N.numSpotShadows=_,N.numSpotMaps=S,N.numLightProbes=R,n.version=og++)}function l(c,h){let f=0,u=0,d=0,g=0,v=0,m=0,p=h.matrixWorldInverse;for(let M=0,A=c.length;M<A;M++){let b=c[M];if(b.isSunLight){let E=n.sun[f];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),f++}else if(b.isDirectionalLight){let E=n.directional[u];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),u++}else if(b.isSpotLight){let E=n.spot[g];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),g++}else if(b.isRectAreaLight){let E=n.rectArea[v];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),a.identity(),r.copy(b.matrixWorld),r.premultiply(p),a.extractRotation(r),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),v++}else if(b.isPointLight){let E=n.point[d];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),d++}else if(b.isHemisphereLight){let E=n.hemi[m];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:o,setupView:l,state:n}}function ld(i){let t=new cg(i),e=[],n=[],s=[];function r(f){h.camera=f,e.length=0,n.length=0,s.length=0}function a(f){f.isLightProbeGrid?s.push(f):e.push(f)}function o(f){n.push(f)}function l(){t.setup(e),s.sort((f,u)=>f.priority-u.priority||f.id-u.id)}function c(f){t.setupView(e,f)}let h={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function hg(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new ld(i),t.set(s,[o])):r>=a.length?(o=new ld(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var ug=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,dg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,fg=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],pg=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],cd=new Qt,Dr=new U,Lc=new U;function mg(i,t,e){let n=new mi,s=new Lt,r=new Lt,a=new fe,o=new Ts,l=new Va,c={},h=e.maxTextureSize,f={[Mi]:Oe,[Oe]:Mi,[Qe]:Qe},u=new Fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Lt},radius:{value:4}},vertexShader:ug,fragmentShader:dg}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let g=new Fe;g.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new Ut(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Bi;let p=this.type;this.render=function(T,_,S){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===eu&&(Et("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Bi);let D=i.getRenderTarget(),R=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),F=i.state;F.setBlending(zi),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let G=p!==this.type;G&&_.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(H=>H.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,H=T.length;P<H;P++){let q=T[P],V=q.shadow;if(V===void 0){Et("WebGLShadowMap:",q,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let et=V.getFrameExtents();s.multiply(et),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/et.x),s.x=r.x*et.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/et.y),s.y=r.y*et.y,V.mapSize.y=r.y));let X=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=X,V.map===null||G===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Rs){if(q.isPointLight){Et("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new an(s.x,s.y,{format:Si,type:Cn,minFilter:Ye,magFilter:Ye,generateMipmaps:!1}),V.map.texture.name=q.name+".shadowMap",V.map.depthTexture=new jn(s.x,s.y,xn),V.map.depthTexture.name=q.name+".shadowMapDepth",V.map.depthTexture.format=Kn,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Le,V.map.depthTexture.magFilter=Le}else q.isPointLight?(V.map=new Ur(s.x),V.map.depthTexture=new ur(s.x,En)):(V.map=new an(s.x,s.y),V.map.depthTexture=new jn(s.x,s.y,En)),V.map.depthTexture.name=q.name+".shadowMap",V.map.depthTexture.format=Kn,this.type===Bi?(V.map.depthTexture.compareFunction=X?Sc:Mc,V.map.depthTexture.minFilter=Ye,V.map.depthTexture.magFilter=Ye):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Le,V.map.depthTexture.magFilter=Le);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let Q=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();q.isPointLight!==!0&&V.updateMatrices(q,S);let j=(V.camera.layers.mask&4294967294)!==0?V.camera.layers:S.layers;for(let Mt=0;Mt<Q;Mt++){let Ft=V.getCamera(Mt);if(q.isPointLight){let J=V.camera,pt=V.matrix,xt=q.distance||J.far;xt!==J.far&&(J.far=xt,J.updateProjectionMatrix()),Dr.setFromMatrixPosition(q.matrixWorld),J.position.copy(Dr),Lc.copy(J.position),Lc.add(fg[Mt]),J.up.copy(pg[Mt]),J.lookAt(Lc),J.updateMatrixWorld(),pt.makeTranslation(-Dr.x,-Dr.y,-Dr.z),cd.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),V._frustum.setFromProjectionMatrix(cd,J.coordinateSystem,J.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,Mt),i.clear();else{Mt===0&&(i.setRenderTarget(V.map),i.clear());let J=V.getViewport(Mt);a.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),F.viewport(a)}n=V.getFrustum(Mt),b(_,S,Ft,q,j,this.type)}V.isPointLightShadow!==!0&&this.type===Rs&&M(V,S),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(D,R,N)};function M(T,_){let S=t.update(v);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new an(s.x,s.y,{format:Si,type:Cn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value.set(T.map.width,T.map.height),u.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(_,null,S,u,v,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(_,null,S,d,v,null)}function A(T,_,S,D){let R=null,N=S.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(N!==void 0)R=N;else if(R=S.isPointLight===!0?l:o,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){let F=R.uuid,G=_.uuid,P=c[F];P===void 0&&(P={},c[F]=P);let H=P[G];H===void 0&&(H=R.clone(),P[G]=H,_.addEventListener("dispose",E)),R=H}if(R.visible=_.visible,R.wireframe=_.wireframe,D===Rs?R.side=_.shadowSide!==null?_.shadowSide:_.side:R.side=_.shadowSide!==null?_.shadowSide:f[_.side],R.alphaMap=_.alphaMap,R.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,R.map=_.map,R.clipShadows=_.clipShadows,R.clippingPlanes=_.clippingPlanes,R.clipIntersection=_.clipIntersection,R.displacementMap=_.displacementMap,R.displacementScale=_.displacementScale,R.displacementBias=_.displacementBias,R.wireframeLinewidth=_.wireframeLinewidth,R.linewidth=_.linewidth,S.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let F=i.properties.get(R);F.light=S}return R}function b(T,_,S,D,R,N){if(T.visible===!1)return;if(T.layers.test(R)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&N===Rs)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,T.matrixWorld);let P=t.update(T),H=T.material;if(Array.isArray(H)){let q=P.groups;for(let V=0,et=q.length;V<et;V++){let X=q[V],Q=H[X.materialIndex];if(Q&&Q.visible){let j=A(T,Q,D,N);T.onBeforeShadow(i,T,_,S,P,j,X),i.renderBufferDirect(S,null,P,j,T,X),T.onAfterShadow(i,T,_,S,P,j,X)}}}else if(H.visible){let q=A(T,H,D,N);T.onBeforeShadow(i,T,_,S,P,q,null),i.renderBufferDirect(S,null,P,q,T,null),T.onAfterShadow(i,T,_,S,P,q,null)}}let G=T.children;for(let P=0,H=G.length;P<H;P++)b(G[P],_,S,D,R,N)}function E(T){T.target.removeEventListener("dispose",E);for(let S in c){let D=c[S],R=T.target.uuid;R in D&&(D[R].dispose(),delete D[R])}}}function gg(i,t){function e(){let C=!1,$=new fe,W=null,ot=new fe(0,0,0,0);return{setMask:function(it){W!==it&&!C&&(i.colorMask(it,it,it,it),W=it)},setLocked:function(it){C=it},setClear:function(it,rt,bt,kt,nt){nt===!0&&(it*=kt,rt*=kt,bt*=kt),$.set(it,rt,bt,kt),ot.equals($)===!1&&(i.clearColor(it,rt,bt,kt),ot.copy($))},reset:function(){C=!1,W=null,ot.set(-1,0,0,0)}}}function n(){let C=!1,$=!1,W=null,ot=null,it=null;return{setReversed:function(rt){if($!==rt){let bt=t.get("EXT_clip_control");rt?bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.ZERO_TO_ONE_EXT):bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.NEGATIVE_ONE_TO_ONE_EXT),$=rt;let kt=it;it=null,this.setClear(kt)}},getReversed:function(){return $},setTest:function(rt){rt?mt(i.DEPTH_TEST):Bt(i.DEPTH_TEST)},setMask:function(rt){W!==rt&&!C&&(i.depthMask(rt),W=rt)},setFunc:function(rt){if($&&(rt=Nu[rt]),ot!==rt){switch(rt){case ba:i.depthFunc(i.NEVER);break;case wa:i.depthFunc(i.ALWAYS);break;case Ta:i.depthFunc(i.LESS);break;case ps:i.depthFunc(i.LEQUAL);break;case Aa:i.depthFunc(i.EQUAL);break;case Ea:i.depthFunc(i.GEQUAL);break;case Ca:i.depthFunc(i.GREATER);break;case Ra:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ot=rt}},setLocked:function(rt){C=rt},setClear:function(rt){it!==rt&&(it=rt,$&&(rt=1-rt),i.clearDepth(rt))},reset:function(){C=!1,W=null,ot=null,it=null,$=!1}}}function s(){let C=!1,$=null,W=null,ot=null,it=null,rt=null,bt=null,kt=null,nt=null;return{setTest:function(wt){C||(wt?mt(i.STENCIL_TEST):Bt(i.STENCIL_TEST))},setMask:function(wt){$!==wt&&!C&&(i.stencilMask(wt),$=wt)},setFunc:function(wt,zt,dt){(W!==wt||ot!==zt||it!==dt)&&(i.stencilFunc(wt,zt,dt),W=wt,ot=zt,it=dt)},setOp:function(wt,zt,dt){(rt!==wt||bt!==zt||kt!==dt)&&(i.stencilOp(wt,zt,dt),rt=wt,bt=zt,kt=dt)},setLocked:function(wt){C=wt},setClear:function(wt){nt!==wt&&(i.clearStencil(wt),nt=wt)},reset:function(){C=!1,$=null,W=null,ot=null,it=null,rt=null,bt=null,kt=null,nt=null}}}let r=new e,a=new n,o=new s,l={},c=new WeakMap,h={},f={},u={},d=new WeakMap,g=[],v=null,m=!1,p=null,M=null,A=null,b=null,E=null,T=null,_=null,S=new Ct(0,0,0),D=0,R=!1,N=null,F=null,G=null,P=null,H=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,et=0,X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(et=parseFloat(/^WebGL (\d)/.exec(X)[1]),V=et>=1):X.indexOf("OpenGL ES")!==-1&&(et=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),V=et>=2);let Q=null,j={},Mt=i.getParameter(i.SCISSOR_BOX),Ft=i.getParameter(i.VIEWPORT),J=new fe().fromArray(Mt),pt=new fe().fromArray(Ft);function xt(C,$,W,ot){let it=new Uint8Array(4),rt=i.createTexture();i.bindTexture(C,rt),i.texParameteri(C,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(C,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let bt=0;bt<W;bt++)C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY?i.texImage3D($,0,i.RGBA,1,1,ot,0,i.RGBA,i.UNSIGNED_BYTE,it):i.texImage2D($+bt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,it);return rt}let Tt={};Tt[i.TEXTURE_2D]=xt(i.TEXTURE_2D,i.TEXTURE_2D,1),Tt[i.TEXTURE_CUBE_MAP]=xt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Tt[i.TEXTURE_2D_ARRAY]=xt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Tt[i.TEXTURE_3D]=xt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),mt(i.DEPTH_TEST),a.setFunc(ps),$e(!1),pe(nc),mt(i.CULL_FACE),Ne(zi);function mt(C){h[C]!==!0&&(i.enable(C),h[C]=!0)}function Bt(C){h[C]!==!1&&(i.disable(C),h[C]=!1)}function xe(C,$){return u[C]!==$?(i.bindFramebuffer(C,$),u[C]=$,C===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=$),C===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=$),!0):!1}function Rt(C,$){let W=g,ot=!1;if(C){W=d.get($),W===void 0&&(W=[],d.set($,W));let it=C.textures;if(W.length!==it.length||W[0]!==i.COLOR_ATTACHMENT0){for(let rt=0,bt=it.length;rt<bt;rt++)W[rt]=i.COLOR_ATTACHMENT0+rt;W.length=it.length,ot=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,ot=!0);ot&&i.drawBuffers(W)}function ne(C){return v!==C?(i.useProgram(C),v=C,!0):!1}let ae={[ki]:i.FUNC_ADD,[iu]:i.FUNC_SUBTRACT,[su]:i.FUNC_REVERSE_SUBTRACT};ae[ru]=i.MIN,ae[au]=i.MAX;let Xt={[ou]:i.ZERO,[lu]:i.ONE,[cu]:i.SRC_COLOR,[rc]:i.SRC_ALPHA,[mu]:i.SRC_ALPHA_SATURATE,[fu]:i.DST_COLOR,[uu]:i.DST_ALPHA,[hu]:i.ONE_MINUS_SRC_COLOR,[ac]:i.ONE_MINUS_SRC_ALPHA,[pu]:i.ONE_MINUS_DST_COLOR,[du]:i.ONE_MINUS_DST_ALPHA,[gu]:i.CONSTANT_COLOR,[_u]:i.ONE_MINUS_CONSTANT_COLOR,[xu]:i.CONSTANT_ALPHA,[yu]:i.ONE_MINUS_CONSTANT_ALPHA};function Ne(C,$,W,ot,it,rt,bt,kt,nt,wt){if(C===zi){m===!0&&(Bt(i.BLEND),m=!1);return}if(m===!1&&(mt(i.BLEND),m=!0),C!==nu){if(C!==p||wt!==R){if((M!==ki||E!==ki)&&(i.blendEquation(i.FUNC_ADD),M=ki,E=ki),wt)switch(C){case Ps:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case br:i.blendFunc(i.ONE,i.ONE);break;case ic:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Pt("WebGLState: Invalid blending: ",C);break}else switch(C){case Ps:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case br:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ic:Pt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sc:Pt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Pt("WebGLState: Invalid blending: ",C);break}A=null,b=null,T=null,_=null,S.set(0,0,0),D=0,p=C,R=wt}return}it=it||$,rt=rt||W,bt=bt||ot,($!==M||it!==E)&&(i.blendEquationSeparate(ae[$],ae[it]),M=$,E=it),(W!==A||ot!==b||rt!==T||bt!==_)&&(i.blendFuncSeparate(Xt[W],Xt[ot],Xt[rt],Xt[bt]),A=W,b=ot,T=rt,_=bt),(kt.equals(S)===!1||nt!==D)&&(i.blendColor(kt.r,kt.g,kt.b,nt),S.copy(kt),D=nt),p=C,R=!1}function Se(C,$){C.side===Qe?Bt(i.CULL_FACE):mt(i.CULL_FACE);let W=C.side===Oe;$&&(W=!W),$e(W),C.blending===Ps&&C.transparent===!1?Ne(zi):Ne(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),a.setFunc(C.depthFunc),a.setTest(C.depthTest),a.setMask(C.depthWrite),r.setMask(C.colorWrite);let ot=C.stencilWrite;o.setTest(ot),ot&&(o.setMask(C.stencilWriteMask),o.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),o.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),Ee(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?mt(i.SAMPLE_ALPHA_TO_COVERAGE):Bt(i.SAMPLE_ALPHA_TO_COVERAGE)}function $e(C){N!==C&&(C?i.frontFace(i.CW):i.frontFace(i.CCW),N=C)}function pe(C){C!==jh?(mt(i.CULL_FACE),C!==F&&(C===nc?i.cullFace(i.BACK):C===tu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Bt(i.CULL_FACE),F=C}function In(C){C!==G&&(V&&i.lineWidth(C),G=C)}function Ee(C,$,W){C?(mt(i.POLYGON_OFFSET_FILL),(P!==$||H!==W)&&(P=$,H=W,a.getReversed()&&($=-$,W=-W),i.polygonOffset($,W))):Bt(i.POLYGON_OFFSET_FILL)}function hn(C){C?mt(i.SCISSOR_TEST):Bt(i.SCISSOR_TEST)}function un(C){C===void 0&&(C=i.TEXTURE0+q-1),Q!==C&&(i.activeTexture(C),Q=C)}function dn(C,$,W){W===void 0&&(Q===null?W=i.TEXTURE0+q-1:W=Q);let ot=j[W];ot===void 0&&(ot={type:void 0,texture:void 0},j[W]=ot),(ot.type!==C||ot.texture!==$)&&(Q!==W&&(i.activeTexture(W),Q=W),i.bindTexture(C,$||Tt[C]),ot.type=C,ot.texture=$)}function L(){let C=j[Q];C!==void 0&&C.type!==void 0&&(i.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function fn(){try{i.compressedTexImage2D(...arguments)}catch(C){Pt("WebGLState:",C)}}function ue(){try{i.compressedTexImage3D(...arguments)}catch(C){Pt("WebGLState:",C)}}function de(){try{i.texSubImage2D(...arguments)}catch(C){Pt("WebGLState:",C)}}function ut(){try{i.texSubImage3D(...arguments)}catch(C){Pt("WebGLState:",C)}}function be(){try{i.compressedTexSubImage2D(...arguments)}catch(C){Pt("WebGLState:",C)}}function At(){try{i.compressedTexSubImage3D(...arguments)}catch(C){Pt("WebGLState:",C)}}function Nt(){try{i.texStorage2D(...arguments)}catch(C){Pt("WebGLState:",C)}}function w(){try{i.texStorage3D(...arguments)}catch(C){Pt("WebGLState:",C)}}function x(){try{i.texImage2D(...arguments)}catch(C){Pt("WebGLState:",C)}}function B(){try{i.texImage3D(...arguments)}catch(C){Pt("WebGLState:",C)}}function tt(C){return f[C]!==void 0?f[C]:i.getParameter(C)}function K(C,$){f[C]!==$&&(i.pixelStorei(C,$),f[C]=$)}function st(C){J.equals(C)===!1&&(i.scissor(C.x,C.y,C.z,C.w),J.copy(C))}function ct(C){pt.equals(C)===!1&&(i.viewport(C.x,C.y,C.z,C.w),pt.copy(C))}function Y(C,$){let W=c.get($);W===void 0&&(W=new WeakMap,c.set($,W));let ot=W.get(C);ot===void 0&&(ot=i.getUniformBlockIndex($,C.name),i.uniformBlockBinding($,ot,ot),W.set(C,ot))}function Z(C,$,W){let it=c.get($).get(C);l[it]!==W&&(i.bindBufferBase(i.UNIFORM_BUFFER,it,W),l[it]=W)}function at(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},f={},Q=null,j={},u={},l={},d=new WeakMap,g=[],v=null,m=!1,p=null,M=null,A=null,b=null,E=null,T=null,_=null,S=new Ct(0,0,0),D=0,R=!1,N=null,F=null,G=null,P=null,H=null,J.set(0,0,i.canvas.width,i.canvas.height),pt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:mt,disable:Bt,bindFramebuffer:xe,drawBuffers:Rt,useProgram:ne,setBlending:Ne,setMaterial:Se,setFlipSided:$e,setCullFace:pe,setLineWidth:In,setPolygonOffset:Ee,setScissorTest:hn,activeTexture:un,bindTexture:dn,unbindTexture:L,compressedTexImage2D:fn,compressedTexImage3D:ue,texImage2D:x,texImage3D:B,pixelStorei:K,getParameter:tt,updateUBOMapping:Y,uniformBlockBinding:Z,texStorage2D:Nt,texStorage3D:w,texSubImage2D:de,texSubImage3D:ut,compressedTexSubImage2D:be,compressedTexSubImage3D:At,scissor:st,viewport:ct,reset:at}}function _g(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Lt,h=new WeakMap,f=new Set,u,d=new WeakMap,g=new Set,v=new FinalizationRegistry(w=>g.delete(w)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(w,x){return m?new OffscreenCanvas(w,x):nr("canvas")}function M(w,x,B){let tt=1,K=Nt(w);if((K.width>B||K.height>B)&&(tt=B/Math.max(K.width,K.height)),tt<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){let st=Math.floor(tt*K.width),ct=Math.floor(tt*K.height);u===void 0&&(u=p(st,ct));let Y=x?p(st,ct):u;return Y.width=st,Y.height=ct,Y.getContext("2d").drawImage(w,0,0,st,ct),Et("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+st+"x"+ct+")."),Y}else return"data"in w&&Et("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),w;return w}function A(w){return w.generateMipmaps}function b(w){i.generateMipmap(w)}function E(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(w,x,B,tt,K,st=!1){if(w!==null){if(i[w]!==void 0)return i[w];Et("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let ct;tt&&(ct=t.get("EXT_texture_norm16"),ct||Et("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=x;if(x===i.RED&&(B===i.FLOAT&&(Y=i.R32F),B===i.HALF_FLOAT&&(Y=i.R16F),B===i.UNSIGNED_BYTE&&(Y=i.R8),B===i.UNSIGNED_SHORT&&ct&&(Y=ct.R16_EXT),B===i.SHORT&&ct&&(Y=ct.R16_SNORM_EXT)),x===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.R8UI),B===i.UNSIGNED_SHORT&&(Y=i.R16UI),B===i.UNSIGNED_INT&&(Y=i.R32UI),B===i.BYTE&&(Y=i.R8I),B===i.SHORT&&(Y=i.R16I),B===i.INT&&(Y=i.R32I)),x===i.RG&&(B===i.FLOAT&&(Y=i.RG32F),B===i.HALF_FLOAT&&(Y=i.RG16F),B===i.UNSIGNED_BYTE&&(Y=i.RG8),B===i.UNSIGNED_SHORT&&ct&&(Y=ct.RG16_EXT),B===i.SHORT&&ct&&(Y=ct.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RG8UI),B===i.UNSIGNED_SHORT&&(Y=i.RG16UI),B===i.UNSIGNED_INT&&(Y=i.RG32UI),B===i.BYTE&&(Y=i.RG8I),B===i.SHORT&&(Y=i.RG16I),B===i.INT&&(Y=i.RG32I)),x===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),B===i.UNSIGNED_INT&&(Y=i.RGB32UI),B===i.BYTE&&(Y=i.RGB8I),B===i.SHORT&&(Y=i.RGB16I),B===i.INT&&(Y=i.RGB32I)),x===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),B===i.UNSIGNED_INT&&(Y=i.RGBA32UI),B===i.BYTE&&(Y=i.RGBA8I),B===i.SHORT&&(Y=i.RGBA16I),B===i.INT&&(Y=i.RGBA32I)),x===i.RGB&&(B===i.UNSIGNED_SHORT&&ct&&(Y=ct.RGB16_EXT),B===i.SHORT&&ct&&(Y=ct.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(Y=i.R11F_G11F_B10F)),x===i.RGBA){let Z=st?er:Zt.getTransfer(K);B===i.FLOAT&&(Y=i.RGBA32F),B===i.HALF_FLOAT&&(Y=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Y=Z===te?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&ct&&(Y=ct.RGBA16_EXT),B===i.SHORT&&ct&&(Y=ct.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function _(w,x){let B;return w?x===null||x===En||x===Vi?B=i.DEPTH24_STENCIL8:x===xn?B=i.DEPTH32F_STENCIL8:x===Ls&&(B=i.DEPTH24_STENCIL8,Et("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===En||x===Vi?B=i.DEPTH_COMPONENT24:x===xn?B=i.DEPTH_COMPONENT32F:x===Ls&&(B=i.DEPTH_COMPONENT16),B}function S(w,x){return A(w)===!0||w.isFramebufferTexture&&w.minFilter!==Le&&w.minFilter!==Ye?Math.log2(Math.max(x.width,x.height))+1:w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?x.mipmaps.length:1}function D(w){let x=new WeakRef(w);n.get(w).__ref=x,g.add(x),v.register(w,x,x)}function R(w){let x=n.get(w).__ref;x!==void 0&&(g.delete(x),v.unregister(x))}function N(w){G(w.target)}function F(w){P(w.target)}function G(w){w.removeEventListener("dispose",N),R(w),q(w),w.isVideoTexture&&h.delete(w),w.isHTMLTexture&&f.delete(w)}function P(w){w.removeEventListener("dispose",F),R(w),et(w)}function H(){for(let w of g){let x=w.deref();x!==void 0&&(x.isRenderTarget===!0?P(x):G(x))}g.clear(),f.clear()}function q(w){let x=n.get(w);if(x.__webglInit===void 0)return;let B=w.source,tt=d.get(B);if(tt){let K=tt[x.__cacheKey];K.usedTimes--,K.usedTimes===0&&V(w),Object.keys(tt).length===0&&d.delete(B)}n.remove(w)}function V(w){let x=n.get(w);i.deleteTexture(x.__webglTexture);let B=w.source,tt=d.get(B);delete tt[x.__cacheKey],a.memory.textures--}function et(w){let x=n.get(w);x.__depthDisposeCallback&&x.__depthDisposeCallback();let B=w.depthTexture;if(B&&B.renderTarget===w&&G(B),w.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(x.__webglFramebuffer[K]))for(let st=0;st<x.__webglFramebuffer[K].length;st++)i.deleteFramebuffer(x.__webglFramebuffer[K][st]);else i.deleteFramebuffer(x.__webglFramebuffer[K]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[K])}else{if(Array.isArray(x.__webglFramebuffer))for(let K=0;K<x.__webglFramebuffer.length;K++)i.deleteFramebuffer(x.__webglFramebuffer[K]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let K=0;K<x.__webglColorRenderbuffer.length;K++)x.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[K]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let tt=w.textures;for(let K=0,st=tt.length;K<st;K++){let ct=n.get(tt[K]);ct.__webglTexture&&(i.deleteTexture(ct.__webglTexture),a.memory.textures--),n.remove(tt[K])}n.remove(w)}let X=0;function Q(){X=0}function j(){return X}function Mt(w){X=w}function Ft(){let w=X;return w>=s.maxTextures&&Et("WebGLTextures: Trying to use "+(w+1)+" texture units while this GPU supports only "+s.maxTextures),X+=1,w}function J(w){let x=[];return x.push(w.wrapS),x.push(w.wrapT),x.push(w.wrapR||0),x.push(w.magFilter),x.push(w.minFilter),x.push(w.anisotropy),x.push(w.internalFormat),x.push(w.format),x.push(w.type),x.push(w.generateMipmaps),x.push(w.mipmapsAutoUpdate),x.push(w.premultiplyAlpha),x.push(w.flipY),x.push(w.unpackAlignment),x.push(w.colorSpace),x.join()}function pt(w,x){let B=n.get(w);if(w.isVideoTexture&&be(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&B.__version!==w.version){let tt=w.image;if(tt===null)Et("WebGLRenderer: Texture marked for update but no image data found.");else if(tt.complete===!1)Et("WebGLRenderer: Texture marked for update but image is incomplete");else{Se(B,w,x);return}}else w.isExternalTexture&&(B.__webglTexture=w.sourceTexture?w.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+x)}function xt(w,x){let B=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&B.__version!==w.version){Se(B,w,x);return}else w.isExternalTexture&&(B.__webglTexture=w.sourceTexture?w.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+x)}function Tt(w,x){let B=n.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&B.__version!==w.version){Se(B,w,x);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+x)}function mt(w,x){let B=n.get(w);if(w.version>0&&B.__version!==w.version){$e(B,w,x);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+x)}let Bt={[Di]:i.REPEAT,[Dn]:i.CLAMP_TO_EDGE,[Pa]:i.MIRRORED_REPEAT},xe={[Le]:i.NEAREST,[Su]:i.NEAREST_MIPMAP_NEAREST,[Tr]:i.NEAREST_MIPMAP_LINEAR,[Ye]:i.LINEAR,[io]:i.LINEAR_MIPMAP_NEAREST,[ti]:i.LINEAR_MIPMAP_LINEAR},Rt={[Au]:i.NEVER,[bc]:i.ALWAYS,[Eu]:i.LESS,[Mc]:i.LEQUAL,[Cu]:i.EQUAL,[Sc]:i.GEQUAL,[Ru]:i.GREATER,[Pu]:i.NOTEQUAL};function ne(w,x){if(x.type===xn&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===Ye||x.magFilter===io||x.magFilter===Tr||x.magFilter===ti||x.minFilter===Ye||x.minFilter===io||x.minFilter===Tr||x.minFilter===ti)&&Et("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,Bt[x.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,Bt[x.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,Bt[x.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,xe[x.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,xe[x.minFilter]),x.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Rt[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Le||x.minFilter!==Tr&&x.minFilter!==ti||x.type===xn&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(w,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function ae(w,x){let B=!1;w.__webglInit===void 0&&(w.__webglInit=!0,x.addEventListener("dispose",N),D(x));let tt=x.source,K=d.get(tt);K===void 0&&(K={},d.set(tt,K));let st=J(x);if(st!==w.__cacheKey){K[st]===void 0&&(K[st]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),K[st].usedTimes++;let ct=K[w.__cacheKey];ct!==void 0&&(K[w.__cacheKey].usedTimes--,ct.usedTimes===0&&V(x)),w.__cacheKey=st,w.__webglTexture=K[st].texture}return B}function Xt(w,x,B){return Math.floor(Math.floor(w/B)/x)}function Ne(w,x,B,tt){let st=w.updateRanges;if(st.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,B,tt,x.data);else{st.sort((C,$)=>C.start-$.start);let ct=0;for(let C=1;C<st.length;C++){let $=st[ct],W=st[C],ot=$.start+$.count,it=Xt(W.start,x.width,4),rt=Xt($.start,x.width,4);W.start<=ot+1&&it===rt&&Xt(W.start+W.count-1,x.width,4)===it?$.count=Math.max($.count,W.start+W.count-$.start):(++ct,st[ct]=W)}st.length=ct+1;let Y=e.getParameter(i.UNPACK_ROW_LENGTH),Z=e.getParameter(i.UNPACK_SKIP_PIXELS),at=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let C=0,$=st.length;C<$;C++){let W=st[C],ot=Math.floor(W.start/4),it=Math.ceil(W.count/4),rt=ot%x.width,bt=Math.floor(ot/x.width),kt=it,nt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,rt),e.pixelStorei(i.UNPACK_SKIP_ROWS,bt),e.texSubImage2D(i.TEXTURE_2D,0,rt,bt,kt,nt,B,tt,x.data)}w.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Y),e.pixelStorei(i.UNPACK_SKIP_PIXELS,Z),e.pixelStorei(i.UNPACK_SKIP_ROWS,at)}}function Se(w,x,B){let tt=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(tt=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(tt=i.TEXTURE_3D);let K=ae(w,x),st=x.source;e.bindTexture(tt,w.__webglTexture,i.TEXTURE0+B);let ct=n.get(st);if(st.version!==ct.__version||K===!0){if(e.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let nt=Zt.getPrimaries(Zt.workingColorSpace),wt=x.colorSpace===ni?null:Zt.getPrimaries(x.colorSpace),zt=x.colorSpace===ni||nt===wt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,zt)}e.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let Z=M(x.image,!1,s.maxTextureSize);Z=At(x,Z);let at=r.convert(x.format,x.colorSpace),C=r.convert(x.type),$=T(x.internalFormat,at,C,x.normalized,x.colorSpace,x.isVideoTexture);ne(tt,x);let W,ot=x.mipmaps,it=x.isVideoTexture!==!0,rt=ct.__version===void 0||K===!0,bt=st.dataReady,kt=S(x,Z);if(x.isDepthTexture)$=_(x.format===ei,x.type),rt&&(it?e.texStorage2D(i.TEXTURE_2D,1,$,Z.width,Z.height):e.texImage2D(i.TEXTURE_2D,0,$,Z.width,Z.height,0,at,C,null));else if(x.isDataTexture)if(ot.length>0){it&&rt&&e.texStorage2D(i.TEXTURE_2D,kt,$,ot[0].width,ot[0].height);for(let nt=0,wt=ot.length;nt<wt;nt++)W=ot[nt],it?bt&&e.texSubImage2D(i.TEXTURE_2D,nt,0,0,W.width,W.height,at,C,W.data):e.texImage2D(i.TEXTURE_2D,nt,$,W.width,W.height,0,at,C,W.data);x.generateMipmaps=!1}else it?(rt&&e.texStorage2D(i.TEXTURE_2D,kt,$,Z.width,Z.height),bt&&Ne(x,Z,at,C)):e.texImage2D(i.TEXTURE_2D,0,$,Z.width,Z.height,0,at,C,Z.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){it&&rt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,kt,$,ot[0].width,ot[0].height,Z.depth);for(let nt=0,wt=ot.length;nt<wt;nt++)if(W=ot[nt],x.format!==Rn)if(at!==null)if(it){if(bt)if(x.layerUpdates.size>0){let zt=Pc(W.width,W.height,x.format,x.type);for(let dt of x.layerUpdates){let ie=W.data.subarray(dt*zt/W.data.BYTES_PER_ELEMENT,(dt+1)*zt/W.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,nt,0,0,dt,W.width,W.height,1,at,ie)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,nt,0,0,0,W.width,W.height,Z.depth,at,W.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,nt,$,W.width,W.height,Z.depth,0,W.data,0,0);else Et("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else it?bt&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,nt,0,0,0,W.width,W.height,Z.depth,at,C,W.data):e.texImage3D(i.TEXTURE_2D_ARRAY,nt,$,W.width,W.height,Z.depth,0,at,C,W.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{it&&rt&&e.texStorage2D(i.TEXTURE_2D,kt,$,ot[0].width,ot[0].height);for(let nt=0,wt=ot.length;nt<wt;nt++)W=ot[nt],x.format!==Rn?at!==null?it?bt&&e.compressedTexSubImage2D(i.TEXTURE_2D,nt,0,0,W.width,W.height,at,W.data):e.compressedTexImage2D(i.TEXTURE_2D,nt,$,W.width,W.height,0,W.data):Et("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):it?bt&&e.texSubImage2D(i.TEXTURE_2D,nt,0,0,W.width,W.height,at,C,W.data):e.texImage2D(i.TEXTURE_2D,nt,$,W.width,W.height,0,at,C,W.data)}else if(x.isDataArrayTexture)if(it){if(rt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,kt,$,Z.width,Z.height,Z.depth),bt)if(x.layerUpdates.size>0){let nt=Pc(Z.width,Z.height,x.format,x.type);for(let wt of x.layerUpdates){let zt=Z.data.subarray(wt*nt/Z.data.BYTES_PER_ELEMENT,(wt+1)*nt/Z.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,wt,Z.width,Z.height,1,at,C,zt)}x.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,at,C,Z.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,$,Z.width,Z.height,Z.depth,0,at,C,Z.data);else if(x.isData3DTexture)it?(rt&&e.texStorage3D(i.TEXTURE_3D,kt,$,Z.width,Z.height,Z.depth),bt&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,at,C,Z.data)):e.texImage3D(i.TEXTURE_3D,0,$,Z.width,Z.height,Z.depth,0,at,C,Z.data);else if(x.isFramebufferTexture){if(rt)if(it)e.texStorage2D(i.TEXTURE_2D,kt,$,Z.width,Z.height);else{let nt=Z.width,wt=Z.height;for(let zt=0;zt<kt;zt++)e.texImage2D(i.TEXTURE_2D,zt,$,nt,wt,0,at,C,null),nt>>=1,wt>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let nt=i.canvas;if(nt.hasAttribute("layoutsubtree")||nt.setAttribute("layoutsubtree","true"),Z.parentNode!==nt){nt.appendChild(Z),f.add(x),nt.onpaint=wt=>{let zt=wt.changedElements;for(let dt of f)zt.includes(dt.image)&&(dt.needsUpdate=!0)},nt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Z);else{let zt=i.RGBA,dt=i.RGBA,ie=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,zt,dt,ie,Z)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(ot.length>0){if(it&&rt){let nt=Nt(ot[0]);e.texStorage2D(i.TEXTURE_2D,kt,$,nt.width,nt.height)}for(let nt=0,wt=ot.length;nt<wt;nt++)W=ot[nt],it?bt&&e.texSubImage2D(i.TEXTURE_2D,nt,0,0,at,C,W):e.texImage2D(i.TEXTURE_2D,nt,$,at,C,W);x.generateMipmaps=!1}else if(it){if(rt){let nt=Nt(Z);e.texStorage2D(i.TEXTURE_2D,kt,$,nt.width,nt.height)}bt&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,at,C,Z)}else e.texImage2D(i.TEXTURE_2D,0,$,at,C,Z);A(x)&&x.mipmapsAutoUpdate===!0&&b(tt),ct.__version=st.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function $e(w,x,B){if(x.image.length!==6)return;let tt=ae(w,x),K=x.source;e.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+B);let st=n.get(K);if(K.version!==st.__version||tt===!0){e.activeTexture(i.TEXTURE0+B);let ct=Zt.getPrimaries(Zt.workingColorSpace),Y=x.colorSpace===ni?null:Zt.getPrimaries(x.colorSpace),Z=x.colorSpace===ni||ct===Y?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Z);let at=x.isCompressedTexture||x.image[0].isCompressedTexture,C=x.image[0]&&x.image[0].isDataTexture,$=[];for(let dt=0;dt<6;dt++)!at&&!C?$[dt]=M(x.image[dt],!0,s.maxCubemapSize):$[dt]=C?x.image[dt].image:x.image[dt],$[dt]=At(x,$[dt]);let W=$[0],ot=r.convert(x.format,x.colorSpace),it=r.convert(x.type),rt=T(x.internalFormat,ot,it,x.normalized,x.colorSpace),bt=x.isVideoTexture!==!0,kt=st.__version===void 0||tt===!0,nt=K.dataReady,wt=S(x,W);ne(i.TEXTURE_CUBE_MAP,x);let zt;if(x.isDepthTexture){if(rt=_(x.format===ei,x.type),kt)if(bt)e.texStorage2D(i.TEXTURE_CUBE_MAP,1,rt,W.width,W.height);else for(let dt=0;dt<6;dt++)e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0,rt,W.width,W.height,0,ot,it,null)}else if(at){bt&&kt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,rt,W.width,W.height);for(let dt=0;dt<6;dt++){zt=$[dt].mipmaps;for(let ie=0;ie<zt.length;ie++){let Ce=zt[ie];x.format!==Rn?ot!==null?bt?nt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie,0,0,Ce.width,Ce.height,ot,Ce.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie,rt,Ce.width,Ce.height,0,Ce.data):Et("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):bt?nt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie,0,0,Ce.width,Ce.height,ot,it,Ce.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie,rt,Ce.width,Ce.height,0,ot,it,Ce.data)}}}else{if(zt=x.mipmaps,bt&&kt){zt.length>0&&wt++;let dt=Nt($[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,rt,dt.width,dt.height)}for(let dt=0;dt<6;dt++)if(C){bt?nt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0,0,0,$[dt].width,$[dt].height,ot,it,$[dt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0,rt,$[dt].width,$[dt].height,0,ot,it,$[dt].data);for(let ie=0;ie<zt.length;ie++){let oi=zt[ie].image[dt].image;bt?nt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie+1,0,0,oi.width,oi.height,ot,it,oi.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie+1,rt,oi.width,oi.height,0,ot,it,oi.data)}}else{bt?nt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0,0,0,ot,it,$[dt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0,rt,ot,it,$[dt]);for(let ie=0;ie<zt.length;ie++){let Ce=zt[ie];bt?nt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie+1,0,0,ot,it,Ce.image[dt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+dt,ie+1,rt,ot,it,Ce.image[dt])}}}A(x)&&x.mipmapsAutoUpdate===!0&&b(i.TEXTURE_CUBE_MAP),st.__version=K.version,x.onUpdate&&x.onUpdate(x)}w.__version=x.version}function pe(w,x,B,tt,K,st){let ct=r.convert(B.format,B.colorSpace),Y=r.convert(B.type),Z=T(B.internalFormat,ct,Y,B.normalized,B.colorSpace),at=n.get(x),C=n.get(B);if(C.__renderTarget=x,!at.__hasExternalTextures){let $=Math.max(1,x.width>>st),W=Math.max(1,x.height>>st);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?e.texImage3D(K,st,Z,$,W,x.depth,0,ct,Y,null):e.texImage2D(K,st,Z,$,W,0,ct,Y,null)}e.bindFramebuffer(i.FRAMEBUFFER,w),ut(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,tt,K,C.__webglTexture,0,de(x)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,tt,K,C.__webglTexture,st),e.bindFramebuffer(i.FRAMEBUFFER,null)}function In(w,x,B){if(i.bindRenderbuffer(i.RENDERBUFFER,w),x.depthBuffer){let tt=x.depthTexture,K=tt&&tt.isDepthTexture?tt.type:null,st=_(x.stencilBuffer,K),ct=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ut(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,de(x),st,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,de(x),st,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,st,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ct,i.RENDERBUFFER,w)}else{let tt=x.textures;for(let K=0;K<tt.length;K++){let st=tt[K],ct=r.convert(st.format,st.colorSpace),Y=r.convert(st.type),Z=T(st.internalFormat,ct,Y,st.normalized,st.colorSpace);ut(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,de(x),Z,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,de(x),Z,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Z,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ee(w,x,B){let tt=x.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,w),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(x.depthTexture);K.__renderTarget=x;let st=tt?x.depthTexture.image[0]:x.depthTexture.image;(!K.__webglTexture||st.width!==x.width||st.height!==x.height)&&(st.width=x.width,st.height=x.height,x.depthTexture.needsUpdate=!0),tt?mt(x.depthTexture,0):pt(x.depthTexture,0);let ct=K.__webglTexture,Y=de(x),Z=tt?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,at=x.depthTexture.format===ei?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Kn)ut(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,at,Z,ct,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,at,Z,ct,0);else if(x.depthTexture.format===ei)ut(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,at,Z,ct,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,at,Z,ct,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function hn(w){let x=n.get(w),B=w.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==w.depthTexture){let tt=w.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),tt){let K=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,tt.removeEventListener("dispose",K)};tt.addEventListener("dispose",K),x.__depthDisposeCallback=K}x.__boundDepthTexture=tt}if(w.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let tt=0;tt<6;tt++)Ee(x.__webglFramebuffer[tt],w,tt);else w.texture.mipmaps.length>0?Ee(x.__webglFramebuffer[0],w,0):Ee(x.__webglFramebuffer,w,0);else if(B){x.__webglDepthbuffer=[];for(let tt=0;tt<6;tt++)if(e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[tt]),x.__webglDepthbuffer[tt]===void 0)x.__webglDepthbuffer[tt]=i.createRenderbuffer(),In(x.__webglDepthbuffer[tt],w,!1);else{let K=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,st=x.__webglDepthbuffer[tt];i.bindRenderbuffer(i.RENDERBUFFER,st),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,st)}}else if(w.texture.mipmaps.length>0?e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),In(x.__webglDepthbuffer,w,!1);else{let K=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,st=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,st),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,st)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function un(w,x,B){let tt=n.get(w);x!==void 0&&pe(tt.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&hn(w)}function dn(w){let x=w.texture,B=n.get(w),tt=n.get(x);w.addEventListener("dispose",F),D(w);let K=w.textures,st=w.isWebGLCubeRenderTarget===!0,ct=K.length>1;if(ct||(tt.__webglTexture===void 0&&(tt.__webglTexture=i.createTexture()),tt.__version=x.version,a.memory.textures++),st){B.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(x.mipmaps.length>0){B.__webglFramebuffer[Y]=[];for(let Z=0;Z<x.mipmaps.length;Z++)B.__webglFramebuffer[Y][Z]=i.createFramebuffer()}else B.__webglFramebuffer[Y]=i.createFramebuffer()}else{if(x.mipmaps.length>0){B.__webglFramebuffer=[];for(let Y=0;Y<x.mipmaps.length;Y++)B.__webglFramebuffer[Y]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(ct)for(let Y=0,Z=K.length;Y<Z;Y++){let at=n.get(K[Y]);at.__webglTexture===void 0&&(at.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&ut(w)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Y=0;Y<K.length;Y++){let Z=K[Y];B.__webglColorRenderbuffer[Y]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[Y]);let at=r.convert(Z.format,Z.colorSpace),C=r.convert(Z.type),$=T(Z.internalFormat,at,C,Z.normalized,Z.colorSpace,w.isXRRenderTarget===!0),W=de(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,W,$,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Y,i.RENDERBUFFER,B.__webglColorRenderbuffer[Y])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),In(B.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(st){e.bindTexture(i.TEXTURE_CUBE_MAP,tt.__webglTexture),ne(i.TEXTURE_CUBE_MAP,x);for(let Y=0;Y<6;Y++)if(x.mipmaps.length>0)for(let Z=0;Z<x.mipmaps.length;Z++)pe(B.__webglFramebuffer[Y][Z],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Z);else pe(B.__webglFramebuffer[Y],w,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);A(x)?b(i.TEXTURE_CUBE_MAP):x.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),e.unbindTexture()}else if(ct){for(let Y=0,Z=K.length;Y<Z;Y++){let at=K[Y],C=n.get(at),$=i.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&($=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture($,C.__webglTexture),ne($,at),pe(B.__webglFramebuffer,w,at,i.COLOR_ATTACHMENT0+Y,$,0),A(at)&&b($)}e.unbindTexture()}else{let Y=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Y=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Y,tt.__webglTexture),ne(Y,x),x.mipmaps.length>0)for(let Z=0;Z<x.mipmaps.length;Z++)pe(B.__webglFramebuffer[Z],w,x,i.COLOR_ATTACHMENT0,Y,Z);else pe(B.__webglFramebuffer,w,x,i.COLOR_ATTACHMENT0,Y,0);A(x)?b(Y):x.mipmaps.length>0&&i.texParameteri(Y,i.TEXTURE_MAX_LEVEL,x.mipmaps.length-1),e.unbindTexture()}w.depthBuffer&&hn(w)}function L(w){let x=w.textures;for(let B=0,tt=x.length;B<tt;B++){let K=x[B];if(A(K)&&K.mipmapsAutoUpdate===!0){let st=E(w),ct=n.get(K).__webglTexture;e.bindTexture(st,ct),b(st),e.unbindTexture()}}}let fn=[];function ue(w){if(w.samples>0){if(ut(w)===!1){let x=w.textures,B=w.width,tt=w.height,K=i.COLOR_BUFFER_BIT,st=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=n.get(w),Y=x.length>1;if(Y)for(let at=0;at<x.length;at++)e.bindFramebuffer(i.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ct.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ct.__webglMultisampledFramebuffer),w.texture.mipmaps.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ct.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ct.__webglFramebuffer);for(let at=0;at<x.length;at++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),Y){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ct.__webglColorRenderbuffer[at]);let C=n.get(x[at]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,C,0)}i.blitFramebuffer(0,0,B,tt,0,0,B,tt,K,i.NEAREST),l===!0&&(fn.length=0,fn.push(i.COLOR_ATTACHMENT0+at),w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&fn.push(st),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,fn))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Y)for(let at=0;at<x.length;at++){e.bindFramebuffer(i.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,ct.__webglColorRenderbuffer[at]);let C=n.get(x[at]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ct.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.TEXTURE_2D,C,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ct.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.storeMultisampledDepthBuffer===!1&&l){let x=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function de(w){return Math.min(s.maxSamples,w.samples)}function ut(w){let x=n.get(w);return w.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function be(w){let x=a.render.frame;h.get(w)!==x&&(h.set(w,x),w.update())}function At(w,x){let B=w.colorSpace,tt=w.format,K=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||B!==tr&&B!==ni&&(Zt.getTransfer(B)===te?(tt!==Rn||K!==je)&&Et("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Pt("WebGLTextures: Unsupported texture color space:",B)),x}function Nt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=Ft,this.resetTextureUnits=Q,this.getTextureUnits=j,this.setTextureUnits=Mt,this.setTexture2D=pt,this.setTexture2DArray=xt,this.setTexture3D=Tt,this.setTextureCube=mt,this.rebindTextures=un,this.setupRenderTarget=dn,this.updateRenderTargetMipmap=L,this.updateMultisampleRenderTarget=ue,this.setupDepthRenderbuffer=hn,this.setupFrameBufferTexture=pe,this.useMultisampledRTT=ut,this.dispose=H}function xg(i,t){function e(n,s=ni){let r,a=Zt.getTransfer(s);if(n===je)return i.UNSIGNED_BYTE;if(n===ro)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ao)return i.UNSIGNED_SHORT_5_5_5_1;if(n===gc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===_c)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===pc)return i.BYTE;if(n===mc)return i.SHORT;if(n===Ls)return i.UNSIGNED_SHORT;if(n===so)return i.INT;if(n===En)return i.UNSIGNED_INT;if(n===xn)return i.FLOAT;if(n===Cn)return i.HALF_FLOAT;if(n===xc)return i.ALPHA;if(n===yc)return i.RGB;if(n===Rn)return i.RGBA;if(n===Kn)return i.DEPTH_COMPONENT;if(n===ei)return i.DEPTH_STENCIL;if(n===oo)return i.RED;if(n===lo)return i.RED_INTEGER;if(n===Si)return i.RG;if(n===co)return i.RG_INTEGER;if(n===ho)return i.RGBA_INTEGER;if(n===Ar||n===Er||n===Cr||n===Rr)if(a===te)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ar)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Cr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ar)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Er)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Cr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Rr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===uo||n===fo||n===po||n===mo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===uo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===fo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===po)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===mo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===go||n===_o||n===xo||n===yo||n===vo||n===Pr||n===Mo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===go||n===_o)return a===te?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===xo)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===yo)return r.COMPRESSED_R11_EAC;if(n===vo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Pr)return r.COMPRESSED_RG11_EAC;if(n===Mo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===So||n===bo||n===wo||n===To||n===Ao||n===Eo||n===Co||n===Ro||n===Po||n===Io||n===Lo||n===Do||n===No||n===Uo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===So)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===bo)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===wo)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===To)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ao)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Eo)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Co)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ro)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Po)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Io)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Lo)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Do)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===No)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Uo)return a===te?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Fo||n===Oo||n===Bo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Fo)return a===te?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Bo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===zo||n===ko||n===Ir||n===Go)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===zo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ko)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ir)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Go)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Vi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var yg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,vg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,zc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new dr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Fn({vertexShader:yg,fragmentShader:vg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ut(new _n(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},kc=class extends Nn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,f=null,u=null,d=null,g=null,v=typeof XRWebGLBinding<"u",m=new zc,p={},M=e.getContextAttributes(),A=null,b=null,E=[],T=[],_=new Lt,S=null,D=null,R=new He;R.viewport=new fe;let N=new He;N.viewport=new fe;let F=[R,N],G=new ja,P=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let pt=E[J];return pt===void 0&&(pt=new ys,E[J]=pt),pt.getTargetRaySpace()},this.getControllerGrip=function(J){let pt=E[J];return pt===void 0&&(pt=new ys,E[J]=pt),pt.getGripSpace()},this.getHand=function(J){let pt=E[J];return pt===void 0&&(pt=new ys,E[J]=pt),pt.getHandSpace()};function q(J){let pt=T.indexOf(J.inputSource);if(pt===-1)return;let xt=E[pt];xt!==void 0&&(xt.update(J.inputSource,J.frame,c||a),xt.dispatchEvent({type:J.type,data:J.inputSource}))}function V(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",et);for(let J=0;J<E.length;J++){let pt=T[J];pt!==null&&(T[J]=null,E[J].disconnect(pt))}P=null,H=null,m.reset();for(let J in p)delete p[J];if(t.setRenderTarget(A),d=null,u=null,f=null,s=null,b=null,Ft.stop(),n.isPresenting=!1,t.setPixelRatio(S),t.setSize(_.width,_.height,!1),D!==null){let J=D.camera;J.fov=D.fov,J.zoom=D.zoom,J.updateProjectionMatrix(),D=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&Et("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&Et("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,e)),f},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(A=t.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",V),s.addEventListener("inputsourceschange",et),M.xrCompatible!==!0&&await e.makeXRCompatible(),S=t.getPixelRatio(),t.getSize(_),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,Tt=null,mt=null;M.depth&&(mt=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,xt=M.stencil?ei:Kn,Tt=M.stencil?Vi:En);let Bt={colorFormat:e.RGBA8,depthFormat:mt,scaleFactor:r};f=this.getBinding(),u=f.createProjectionLayer(Bt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),b=new an(u.textureWidth,u.textureHeight,{format:Rn,type:je,depthTexture:new jn(u.textureWidth,u.textureHeight,Tt,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let xt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,xt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),b=new an(d.framebufferWidth,d.framebufferHeight,{format:Rn,type:je,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Ft.setContext(s),Ft.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function et(J){for(let pt=0;pt<J.removed.length;pt++){let xt=J.removed[pt],Tt=T.indexOf(xt);Tt>=0&&(T[Tt]=null,E[Tt].disconnect(xt))}for(let pt=0;pt<J.added.length;pt++){let xt=J.added[pt],Tt=T.indexOf(xt);if(Tt===-1){for(let Bt=0;Bt<E.length;Bt++)if(Bt>=T.length){T.push(xt),Tt=Bt;break}else if(T[Bt]===null){T[Bt]=xt,Tt=Bt;break}if(Tt===-1)break}let mt=E[Tt];mt&&mt.connect(xt)}}function X(J,pt){pt===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(pt.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let pt=J.near,xt=J.far;m.texture!==null&&(m.depthNear>0&&(pt=m.depthNear),m.depthFar>0&&(xt=m.depthFar)),G.near=N.near=R.near=pt,G.far=N.far=R.far=xt,(P!==G.near||H!==G.far)&&(s.updateRenderState({depthNear:G.near,depthFar:G.far}),P=G.near,H=G.far),G.layers.mask=J.layers.mask|6,R.layers.mask=G.layers.mask&-5,N.layers.mask=G.layers.mask&-3;let Tt=J.parent,mt=G.cameras;X(G,Tt);for(let Bt=0;Bt<mt.length;Bt++)X(mt[Bt],Tt);G.projectionMatrix.copy(R.projectionMatrix),G.projectionMatrixInverse.copy(R.projectionMatrixInverse),D===null&&J.isPerspectiveCamera&&(D={camera:J,fov:J.fov,zoom:J.zoom}),Q(J,G,Tt)};function Q(J,pt,xt){xt===null?J.matrix.copy(pt.matrixWorld):(J.matrix.copy(xt.matrixWorld),J.matrix.invert(),J.matrix.multiply(pt.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(pt.projectionMatrix),J.projectionMatrixInverse.copy(pt.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=La*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(G)},this.getCameraTexture=function(J){return p[J]};let j=null;function Mt(J,pt){if(h=pt.getViewerPose(c||a),g=pt,h!==null){let xt=h.views;d!==null&&(t.setRenderTargetFramebuffer(b,d.framebuffer),t.setRenderTarget(b));let Tt=!1;xt.length!==G.cameras.length&&(G.cameras.length=0,Tt=!0);for(let Rt=0;Rt<xt.length;Rt++){let ne=xt[Rt],ae=null;if(d!==null)ae=d.getViewport(ne);else{let Ne=f.getViewSubImage(u,ne);ae=Ne.viewport,Rt===0&&(t.setRenderTargetTextures(b,Ne.colorTexture,Ne.depthStencilTexture),t.setRenderTarget(b))}let Xt=F[Rt];Xt===void 0&&(Xt=new He,Xt.layers.enable(Rt),Xt.viewport=new fe,F[Rt]=Xt),Xt.matrix.fromArray(ne.transform.matrix),Xt.matrix.decompose(Xt.position,Xt.quaternion,Xt.scale),Xt.projectionMatrix.fromArray(ne.projectionMatrix),Xt.projectionMatrixInverse.copy(Xt.projectionMatrix).invert(),Xt.viewport.set(ae.x,ae.y,ae.width,ae.height),Rt===0&&(G.matrix.copy(Xt.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),Tt===!0&&G.cameras.push(Xt)}let mt=s.enabledFeatures;if(mt&&mt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=n.getBinding();let Rt=f.getDepthInformation(xt[0]);Rt&&Rt.isValid&&Rt.texture&&m.init(Rt,s.renderState)}if(mt&&mt.includes("camera-access")&&v){t.state.unbindTexture(),f=n.getBinding();for(let Rt=0;Rt<xt.length;Rt++){let ne=xt[Rt].camera;if(ne){let ae=p[ne];ae||(ae=new dr,p[ne]=ae);let Xt=f.getCameraImage(ne);ae.sourceTexture=Xt}}}}for(let xt=0;xt<E.length;xt++){let Tt=T[xt],mt=E[xt];Tt!==null&&mt!==void 0&&mt.update(Tt,pt,c||a)}j&&j(J,pt),pt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:pt}),g=null}let Ft=new hd;Ft.setAnimationLoop(Mt),this.setAnimationLoop=function(J){j=J},this.dispose=function(){}}},Mg=new Qt,vd=new Dt;vd.set(-1,0,0,0,1,0,0,0,1);function Sg(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Ec(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,M,A,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),f(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&d(m,p,b)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,A):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Oe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Oe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let M=t.get(p),A=M.envMap,b=M.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(Mg.makeRotationFromEuler(b)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(vd),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=A*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function f(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,M){m.ior.value=p.ior,p.diffuseRoughness>0&&(m.diffuseRoughness.value=p.diffuseRoughness,p.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=p.diffuseRoughnessMap,e(p.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Oe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=p.iridescenceThicknessMaximum,p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){let M=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function bg(i,t,e,n){let s={},r={};function a(M,A){let b=A.program;n.uniformBlockBinding(M,b,s[M.id])}function o(M,A){let b=s[M.id];b===void 0&&(g(M),b=l(M),s[M.id]=b,M.addEventListener("dispose",m));let E=A.program;n.updateUBOMapping(M,E);let T=t.render.frame;r[M.id]!==T&&(c(M),r[M.id]=T)}function l(M){let A=i.createBuffer(),b=M.__size,E=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,b,E),i.bindBuffer(i.UNIFORM_BUFFER,null),A}function c(M){let A=s[M.id],b=M.uniforms,E=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,A);for(let T=0,_=b.length;T<_;T++){let S=b[T];if(Array.isArray(S))for(let D=0,R=S.length;D<R;D++)h(S[D],T,D,E);else h(S,T,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(M,A,b,E){if(u(M,A,b,E)===!0){let T=M.__offset,_=M.value;if(Array.isArray(_)){let S=0;for(let D=0;D<_.length;D++){let R=_[D],N=v(R,!0);f(R,M.__data,S),S+=N.storage/Float32Array.BYTES_PER_ELEMENT}}else f(_,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,T,M.__data)}}function f(M,A,b){typeof M=="number"||typeof M=="boolean"?A[b]=M:M.isMatrix3?(A[b]=M.elements[0],A[b+1]=M.elements[1],A[b+2]=M.elements[2],A[b+3]=0,A[b+4]=M.elements[3],A[b+5]=M.elements[4],A[b+6]=M.elements[5],A[b+7]=0,A[b+8]=M.elements[6],A[b+9]=M.elements[7],A[b+10]=M.elements[8],A[b+11]=0):ArrayBuffer.isView(M)?A.set(M.subarray(0,A.length-b),b):M.toArray(A,b)}function u(M,A,b,E){let T=M.value,_=A+"_"+b;if(Array.isArray(T)){E[_]===void 0&&(E[_]=[]);let S=E[_],D=!1;for(let R=0;R<T.length;R++)d(T[R],S,R)===!0&&(D=!0);return D}return d(T,E,_)}function d(M,A,b){if(A[b]===void 0)return typeof M=="number"||typeof M=="boolean"?A[b]=M:ArrayBuffer.isView(M)?A[b]=M.slice():A[b]=M.clone(),!0;{let E=A[b];if(typeof M=="number"||typeof M=="boolean"){if(E!==M)return A[b]=M,!0}else{if(ArrayBuffer.isView(M))return!0;if(E.equals(M)===!1)return E.copy(M),!0}}return!1}function g(M){let A=M.uniforms,b=0,E=16;for(let _=0,S=A.length;_<S;_++){let D=Array.isArray(A[_])?A[_]:[A[_]];for(let R=0,N=D.length;R<N;R++){let F=D[R],G=Array.isArray(F.value)?F.value:[F.value],P=Array.isArray(A[_])||Array.isArray(F.value),H=b;for(let V=0,et=G.length;V<et;V++){let X=G[V],Q=v(X,P),j=b%E,Mt=j%Q.boundary,Ft=j+Mt;b+=Mt,Ft!==0&&E-Ft<Q.storage&&(b+=E-Ft),V===0&&(H=b),b+=Q.storage}let q=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new q((b-H)/Float32Array.BYTES_PER_ELEMENT),F.__offset=H}}let T=b%E;return T>0&&(b+=E-T),M.__size=b,M.__cache={},this}function v(M,A){let b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=16,b.storage=48):M.isMatrix4?(b.boundary=16,b.storage=64):M.isTexture?Et("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(b.boundary=16,b.storage=M.byteLength):Et("WebGLRenderer: Unsupported uniform value type.",M),A===!0&&(b.boundary=16,b.storage=Math.ceil(b.storage/16)*16),b}function m(M){let A=M.target;A.removeEventListener("dispose",m),i.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function p(){for(let M in s)i.deleteBuffer(s[M]);s={},r={}}return{bind:a,update:o,dispose:p}}var wg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Bn=null;function Tg(){return Bn===null&&(Bn=new lr(wg,16,16,Si,Cn),Bn.name="DFG_LUT",Bn.minFilter=Ye,Bn.magFilter=Ye,Bn.wrapS=Dn,Bn.wrapT=Dn,Bn.generateMipmaps=!1,Bn.needsUpdate=!0),Bn}var Xo=class{constructor(t={}){let{canvas:e=Iu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:u=!1,outputBufferType:d=je}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let v=d,m=new Set([ho,co,lo]),p=new Set([je,En,Ls,Vi,ro,ao]),M=new Uint32Array(4),A=new Int32Array(4),b={textures:[],min:[],max:[],resolution:[]},E=null,T=null,_=[],S=[],D=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=On,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,N=!1,F=null,G=null,P=null,H=null;this._outputColorSpace=Ie;let q=0,V=0,et=null,X=-1,Q=null,j=new fe,Mt=new fe,Ft=null,J=new Ct(0),pt=0,xt=e.width,Tt=e.height,mt=1,Bt=null,xe=null,Rt=new fe(0,0,xt,Tt),ne=new fe(0,0,xt,Tt),ae=!1,Xt=new mi,Ne=new Oa,Se=!1,$e=!1,pe=new Qt,In=new U,Ee=new fe,hn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},un=!1;function dn(){return et===null?mt:1}let L=n;function fn(y,I){return e.getContext(y,I)}let ue,de,ut,be,At,Nt,w,x,B,tt,K,st,ct,Y,Z,at,C,$,W,ot,it,rt,bt;try{let y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"187"}`),e.addEventListener("webglcontextlost",wt,!1),e.addEventListener("webglcontextrestored",zt,!1),e.addEventListener("webglcontextcreationerror",dt,!1),L===null){let I="webgl2";if(L=fn(I,y),L===null)throw fn(I)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}kt()}catch(y){throw e.removeEventListener("webglcontextlost",wt,!1),e.removeEventListener("webglcontextrestored",zt,!1),e.removeEventListener("webglcontextcreationerror",dt,!1),Pt("WebGLRenderer: "+y.message),y}function kt(){ue=new F1(L),ue.init(),it=new xg(L,ue),de=new T1(L,ue,t,it),ut=new gg(L,ue),de.reversedDepthBuffer&&u&&ut.buffers.depth.setReversed(!0),G=L.createFramebuffer(),P=L.createFramebuffer(),H=L.createFramebuffer(),be=new z1(L),At=new ng,Nt=new _g(L,ue,ut,At,de,it,be),w=new U1(R),x=new Gf(L),rt=new b1(L,x),B=new O1(L,x,be,rt),tt=new G1(L,B,x,rt,be),$=new k1(L,de,Nt),Z=new A1(At),K=new eg(R,w,ue,de,rt,Z),st=new Sg(R,At),ct=new sg,Y=new hg(ue),C=new S1(R,w,ut,tt,g,l),at=new mg(R,tt,de),bt=new bg(L,be,de,ut),W=new w1(L,ue,be),ot=new B1(L,ue,be),be.programs=K.programs,R.capabilities=de,R.extensions=ue,R.properties=At,R.renderLists=ct,R.shadowMap=at,R.state=ut,R.info=be}v!==je&&(D=new H1(v,e.width,e.height,o,s,r));let nt=new kc(R,L);this.xr=nt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let y=ue.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){let y=ue.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return mt},this.setPixelRatio=function(y){y!==void 0&&(mt=y,this.setSize(xt,Tt,!1))},this.getSize=function(y){return y.set(xt,Tt)},this.setSize=function(y,I,k=!0){if(nt.isPresenting){Et("WebGLRenderer: Can't change size while VR device is presenting.");return}xt=y,Tt=I,e.width=Math.floor(y*mt),e.height=Math.floor(I*mt),k===!0&&(e.style.width=y+"px",e.style.height=I+"px"),D!==null&&D.setSize(e.width,e.height),this.setViewport(0,0,y,I)},this.getDrawingBufferSize=function(y){return y.set(xt*mt,Tt*mt).floor()},this.setDrawingBufferSize=function(y,I,k){xt=y,Tt=I,mt=k,e.width=Math.floor(y*k),e.height=Math.floor(I*k),this.setViewport(0,0,y,I)},this.setEffects=function(y){if(v===je){Pt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let I=0;I<y.length;I++)if(y[I].isOutputPass===!0){Et("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}D.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(j)},this.getViewport=function(y){return y.copy(Rt)},this.setViewport=function(y,I,k,O){y.isVector4?Rt.set(y.x,y.y,y.z,y.w):Rt.set(y,I,k,O),ut.viewport(j.copy(Rt).multiplyScalar(dn()).round())},this.getScissor=function(y){return y.copy(ne)},this.setScissor=function(y,I,k,O){y.isVector4?ne.set(y.x,y.y,y.z,y.w):ne.set(y,I,k,O),ut.scissor(Mt.copy(ne).multiplyScalar(dn()).round())},this.getScissorTest=function(){return ae},this.setScissorTest=function(y){ut.setScissorTest(ae=y)},this.setOpaqueSort=function(y){Bt=y},this.setTransparentSort=function(y){xe=y},this.getClearColor=function(y){return y.copy(C.getClearColor())},this.setClearColor=function(){C.setClearColor(...arguments)},this.getClearAlpha=function(){return C.getClearAlpha()},this.setClearAlpha=function(){C.setClearAlpha(...arguments)},this.clear=function(y=!0,I=!0,k=!0){let O=0;if(y){let z=!1;if(et!==null){let ht=et.texture.format;z=m.has(ht)}if(z){let ht=et.texture.type,_t=p.has(ht),lt=C.getClearColor(),gt=C.getClearAlpha(),St=lt.r,Ot=lt.g,qt=lt.b;_t?(M[0]=St,M[1]=Ot,M[2]=qt,M[3]=gt,L.clearBufferuiv(L.COLOR,0,M)):(A[0]=St,A[1]=Ot,A[2]=qt,A[3]=gt,L.clearBufferiv(L.COLOR,0,A))}else O|=L.COLOR_BUFFER_BIT}I&&(O|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),k&&(O|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&L.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),F=y},this.dispose=function(){e.removeEventListener("webglcontextlost",wt,!1),e.removeEventListener("webglcontextrestored",zt,!1),e.removeEventListener("webglcontextcreationerror",dt,!1),C.dispose(),ct.dispose(),Y.dispose(),Nt.dispose(),At.dispose(),w.dispose(),tt.dispose(),B.dispose(),rt.dispose(),bt.dispose(),K.dispose(),nt.dispose(),nt.removeEventListener("sessionstart",oh),nt.removeEventListener("sessionend",lh),Ti.stop()};function wt(y){y.preventDefault(),ir("WebGLRenderer: Context Lost."),N=!0}function zt(){ir("WebGLRenderer: Context Restored."),N=!1;let y=be.autoReset,I=at.enabled,k=at.autoUpdate,O=at.needsUpdate,z=at.type;kt(),be.autoReset=y,at.enabled=I,at.autoUpdate=k,at.needsUpdate=O,at.type=z}function dt(y){Pt("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function ie(y){let I=y.target;I.removeEventListener("dispose",ie),Ce(I)}function Ce(y){oi(y),At.remove(y)}function oi(y){let I=At.get(y).programs;I!==void 0&&(I.forEach(function(k){K.releaseProgram(k)}),y.isShaderMaterial&&K.releaseShaderCache(y))}this.renderBufferDirect=function(y,I,k,O,z,ht){I===null&&(I=hn);let _t=z.isMesh&&z.matrixWorld.determinantAffine()<0,lt=tf(y,I,k,O,z);ut.setMaterial(O,_t);let gt=k.index,St=1;if(O.wireframe===!0){if(gt=B.getWireframeAttribute(k),gt===void 0)return;St=2}let Ot=k.drawRange,qt=k.attributes.position,yt=Ot.start*St,Yt=(Ot.start+Ot.count)*St;ht!==null&&(yt=Math.max(yt,ht.start*St),Yt=Math.min(Yt,(ht.start+ht.count)*St)),gt!==null?(yt=Math.max(yt,0),Yt=Math.min(Yt,gt.count)):qt!=null&&(yt=Math.max(yt,0),Yt=Math.min(Yt,qt.count));let ye=Yt-yt;if(ye<0||ye===1/0)return;rt.setup(z,O,lt,k,gt);let le,oe=W;if(gt!==null&&(le=x.get(gt),oe=ot,oe.setIndex(le)),z.isMesh)O.wireframe===!0?(ut.setLineWidth(O.wireframeLinewidth*dn()),oe.setMode(L.LINES)):oe.setMode(L.TRIANGLES);else if(z.isLine){let ze=O.linewidth;ze===void 0&&(ze=1),ut.setLineWidth(ze*dn()),z.isLineSegments?oe.setMode(L.LINES):z.isLineLoop?oe.setMode(L.LINE_LOOP):oe.setMode(L.LINE_STRIP)}else z.isPoints?oe.setMode(L.POINTS):z.isSprite&&oe.setMode(L.TRIANGLES);if(z.isBatchedMesh)if(ue.get("WEBGL_multi_draw"))oe.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let ze=z._multiDrawStarts,vt=z._multiDrawCounts,Xe=z._multiDrawCount,jt=gt?x.get(gt).bytesPerElement:1,Ai=At.get(O).currentProgram.getUniforms();for(let ke=0;ke<Xe;ke++)Ai.setValue(L,"_gl_DrawID",ke),oe.render(ze[ke]/jt,vt[ke])}else if(z.isInstancedMesh)oe.renderInstances(yt,ye,z.count);else if(k.isInstancedBufferGeometry){let ze=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,vt=Math.min(k.instanceCount,ze);oe.renderInstances(yt,ye,vt)}else oe.render(yt,ye)};function ah(y,I,k,O){F!==null&&y.isNodeMaterial&&F.setObject(O,y),Se===!0&&Z.setState(y,k,!1),y.transparent===!0&&y.side===Qe&&y.forceSinglePass===!1?(y.side=Oe,y.needsUpdate=!0,Vs(y,I,O),y.side=Mi,y.needsUpdate=!0,Vs(y,I,O),y.side=Qe):Vs(y,I,O)}this.compile=function(y,I,k=null){k===null&&(k=y),F!==null&&F.renderStart(y,I,k),T=Y.get(k),T.init(I),S.push(T),k.traverseVisible(function(z){z.isLight&&z.layers.test(I.layers)&&(T.pushLight(z),z.castShadow&&T.pushShadow(z))}),y!==k&&y.traverseVisible(function(z){z.isLight&&z.layers.test(I.layers)&&(T.pushLight(z),z.castShadow&&T.pushShadow(z))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),$e=this.localClippingEnabled,Se=Z.init(this.clippingPlanes,$e),Se===!0&&Z.setGlobalState(this.clippingPlanes,I),F!==null&&at.render(T.state.shadowsArray,k,I);let O=new Set;return y.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let ht=z.material;if(ht)if(Array.isArray(ht))for(let _t=0;_t<ht.length;_t++){let lt=ht[_t];ah(lt,k,I,z),O.add(lt)}else ah(ht,k,I,z),O.add(ht)}),T=S.pop(),F!==null&&F.renderEnd(),O},this.compileAsync=function(y,I,k=null){let O=this.compile(y,I,k);return new Promise(z=>{function ht(){if(O.forEach(function(_t){let gt=At.get(_t).currentProgram;(gt===void 0||gt.isReady())&&O.delete(_t)}),O.size===0){z(y);return}setTimeout(ht,10)}ue.get("KHR_parallel_shader_compile")!==null?ht():setTimeout(ht,10)})};let Ml=null;function Qd(y){Ml&&Ml(y)}function oh(){Ti.stop()}function lh(){Ti.start()}let Ti=new hd;Ti.setAnimationLoop(Qd),typeof self<"u"&&Ti.setContext(self),this.setAnimationLoop=function(y){Ml=y,nt.setAnimationLoop(y),y===null?Ti.stop():Ti.start()},nt.addEventListener("sessionstart",oh),nt.addEventListener("sessionend",lh),this.render=function(y,I){if(I!==void 0&&I.isCamera!==!0){Pt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;F!==null&&F.renderStart(y,I);let k=nt.enabled===!0&&nt.isPresenting===!0,O=D!==null&&(et===null||k)&&D.begin(R,et);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),nt.enabled===!0&&nt.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(nt.cameraAutoUpdate===!0&&nt.updateCamera(I),I=nt.getCamera()),y.isScene===!0&&y.onBeforeRender(R,y,I,et),T=Y.get(y,S.length),T.init(I),T.state.textureUnits=Nt.getTextureUnits(),S.push(T),pe.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),I.isArrayCamera?Ne.setFromArrayCamera(I):Xt.setFromProjectionMatrix(pe,mn,I.reversedDepth),$e=this.localClippingEnabled,Se=Z.init(this.clippingPlanes,$e),E=ct.get(y,_.length),E.init(),_.push(E),this.info.render.frame++,nt.enabled===!0&&nt.isPresenting===!0){let _t=R.xr.getDepthSensingMesh();_t!==null&&Sl(_t,I,-1/0,R.sortObjects)}Sl(y,I,0,R.sortObjects),E.finish(),F!==null&&F.updateLights(T.state.lightsArray),R.sortObjects===!0&&E.sort(Bt,xe),un=nt.enabled===!1||nt.isPresenting===!1||nt.hasDepthSensing()===!1,un&&C.addToRenderList(E,y),this.info.autoReset===!0&&this.info.reset(),Se===!0&&Z.beginShadows();let z=T.state.shadowsArray;if(at.render(z,y,I),Se===!0&&Z.endShadows(),(O&&D.hasRenderPass())===!1){let _t=E.opaque,lt=E.transmissive;if(T.setupLights(),I.isArrayCamera){let gt=I.cameras;if(lt.length>0)for(let St=0,Ot=gt.length;St<Ot;St++){let qt=gt[St];hh(_t,lt,y,qt)}un&&C.render(y);for(let St=0,Ot=gt.length;St<Ot;St++){let qt=gt[St];ch(E,y,qt,qt.viewport)}}else lt.length>0&&hh(_t,lt,y,I),un&&C.render(y),ch(E,y,I)}et!==null&&V===0&&(Nt.updateMultisampleRenderTarget(et),Nt.updateRenderTargetMipmap(et)),O&&D.end(R),y.isScene===!0&&y.onAfterRender(R,y,I),rt.resetDefaultState(),X=-1,Q=null,S.pop(),S.length>0?(T=S[S.length-1],Nt.setTextureUnits(T.state.textureUnits),Se===!0&&Z.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,_.pop(),_.length>0?E=_[_.length-1]:E=null,F!==null&&F.renderEnd()};function Sl(y,I,k,O){if(y.visible===!1)return;if(y.layers.test(I.layers)){if(y.isGroup)k=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(I);else if(y.isLight)T.pushLight(y),y.castShadow&&T.pushShadow(y);else if(y.isSprite){let _t=I.isArrayCamera?Ne:Xt;if(!y.frustumCulled||y.intersectsFrustum(_t)){O&&Ee.setFromMatrixPosition(y.matrixWorld).applyMatrix4(pe);let lt=tt.update(y),gt=y.material;gt.visible&&E.push(y,lt,gt,k,Ee.z,null,I)}}else if(y.isMesh||y.isLine||y.isPoints){let _t=I.isArrayCamera?Ne:Xt;if(!y.frustumCulled||y.intersectsFrustum(_t)){let lt=tt.update(y),gt=y.material;if(O&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Ee.copy(y.boundingSphere.center)):(lt.boundingSphere===null&&lt.computeBoundingSphere(),Ee.copy(lt.boundingSphere.center)),Ee.applyMatrix4(y.matrixWorld).applyMatrix4(pe)),Array.isArray(gt)){let St=lt.groups;for(let Ot=0,qt=St.length;Ot<qt;Ot++){let yt=St[Ot],Yt=gt[yt.materialIndex];Yt&&Yt.visible&&E.push(y,lt,Yt,k,Ee.z,yt,I)}}else gt.visible&&E.push(y,lt,gt,k,Ee.z,null,I)}}}let ht=y.children;for(let _t=0,lt=ht.length;_t<lt;_t++)Sl(ht[_t],I,k,O)}function ch(y,I,k,O){let{opaque:z,transmissive:ht,transparent:_t}=y;T.setupLightsView(k),Se===!0&&Z.setGlobalState(R.clippingPlanes,k),O&&ut.viewport(j.copy(O)),z.length>0&&qr(z,I,k),ht.length>0&&qr(ht,I,k),_t.length>0&&qr(_t,I,k),ut.buffers.depth.setTest(!0),ut.buffers.depth.setMask(!0),ut.buffers.color.setMask(!0),ut.setPolygonOffset(!1)}function hh(y,I,k,O){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[O.id]===void 0){let yt=ue.has("EXT_color_buffer_half_float")||ue.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[O.id]=new an(1,1,{generateMipmaps:!0,type:yt?Cn:je,minFilter:ti,samples:Math.max(4,de.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Zt.workingColorSpace})}let ht=T.state.transmissionRenderTarget[O.id],_t=O.viewport||j;ht.setSize(_t.z*R.transmissionResolutionScale,_t.w*R.transmissionResolutionScale);let lt=R.getRenderTarget(),gt=R.getActiveCubeFace(),St=R.getActiveMipmapLevel();R.setRenderTarget(ht),R.getClearColor(J),pt=R.getClearAlpha(),pt<1&&R.setClearColor(16777215,.5),R.clear(),un&&C.render(k);let Ot=R.toneMapping;R.toneMapping=On;let qt=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),T.setupLightsView(O),Se===!0&&Z.setGlobalState(R.clippingPlanes,O),qr(y,k,O),Nt.updateMultisampleRenderTarget(ht),Nt.updateRenderTargetMipmap(ht),ue.has("WEBGL_multisampled_render_to_texture")===!1){let yt=!1;for(let Yt=0,ye=I.length;Yt<ye;Yt++){let le=I[Yt],{object:oe,geometry:ze,material:vt,group:Xe}=le;if(vt.side===Qe&&oe.layers.test(O.layers)){let jt=vt.side;vt.side=Oe,vt.needsUpdate=!0,uh(oe,k,O,ze,vt,Xe),vt.side=jt,vt.needsUpdate=!0,yt=!0}}yt===!0&&(Nt.updateMultisampleRenderTarget(ht),Nt.updateRenderTargetMipmap(ht))}R.setRenderTarget(lt,gt,St),R.setClearColor(J,pt),qt!==void 0&&(O.viewport=qt),R.toneMapping=Ot}function qr(y,I,k){let O=I.isScene===!0?I.overrideMaterial:null;for(let z=0,ht=y.length;z<ht;z++){let _t=y[z],{object:lt,geometry:gt,group:St}=_t,Ot=_t.material;Ot.allowOverride===!0&&O!==null&&(Ot=O),lt.layers.test(k.layers)&&uh(lt,I,k,gt,Ot,St)}}function uh(y,I,k,O,z,ht){F!==null&&z.isNodeMaterial&&F.setObject(y,z),y.onBeforeRender(R,I,k,O,z,ht),y.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),z.onBeforeRender(R,I,k,O,y,ht),z.transparent===!0&&z.side===Qe&&z.forceSinglePass===!1?(z.side=Oe,z.needsUpdate=!0,R.renderBufferDirect(k,I,O,z,y,ht),z.side=Mi,z.needsUpdate=!0,R.renderBufferDirect(k,I,O,z,y,ht),z.side=Qe):R.renderBufferDirect(k,I,O,z,y,ht),y.onAfterRender(R,I,k,O,z,ht)}function dh(y){let I=0;for(let k of y)k.texture!==null&&I++;return I}function Vs(y,I,k){I.isScene!==!0&&(I=hn);let O=At.get(y),z=T.state.lights,ht=T.state.shadowsArray,_t=z.state.version,lt=K.getParameters(y,z.state,ht,I,k,T.state.lightProbeGridArray),gt=K.getProgramCacheKey(lt),St=O.programs;O.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?I.environment:null,O.fog=I.fog;let Ot=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;O.envMap=w.get(y.envMap||O.environment,Ot),O.envMapRotation=O.environment!==null&&y.envMap===null?I.environmentRotation:y.envMapRotation,St===void 0&&(y.addEventListener("dispose",ie),St=new Map,O.programs=St,O.programVariants=new Map);let qt=St.get(gt);if(qt!==void 0){if(O.currentProgram===qt&&O.lightsStateVersion===_t)return ph(y,lt),qt}else lt.uniforms=K.getUniforms(y),F!==null&&y.isNodeMaterial&&F.build(y,k,lt),y.onBeforeCompile(lt,R),qt=K.acquireProgram(lt,gt),St.set(gt,qt),O.uniforms=lt.uniforms;let yt=O.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(yt.clippingPlanes=Z.uniform),ph(y,lt),O.needsLights=nf(y),O.lightsStateVersion=_t,O.needsLights&&(yt.ambientLightColor.value=z.state.ambient,yt.lightProbe.value=z.state.probe,yt.sunLights.value=z.state.sun,yt.sunLightShadows.value=z.state.sunShadow,yt.directionalLights.value=z.state.directional,yt.directionalLightShadows.value=z.state.directionalShadow,yt.spotLights.value=z.state.spot,yt.spotLightShadows.value=z.state.spotShadow,yt.rectAreaLights.value=z.state.rectArea,yt.ltc_1.value=z.state.rectAreaLTC1,yt.ltc_2.value=z.state.rectAreaLTC2,yt.pointLights.value=z.state.point,yt.pointLightShadows.value=z.state.pointShadow,yt.hemisphereLights.value=z.state.hemi,yt.sunShadowMatrix.value=z.state.sunShadowMatrix,yt.sunShadowCascade.value=z.state.sunShadowCascade,yt.directionalShadowMatrix.value=z.state.directionalShadowMatrix,yt.spotLightMatrix.value=z.state.spotLightMatrix,yt.spotLightMap.value=z.state.spotLightMap,yt.pointShadowMatrix.value=z.state.pointShadowMatrix),O.numLightProbeGrids=dh(T.state.lightProbeGridArray),O.currentProgram=qt,O.uniformsList=null,qt}function jd(y,I,k,O,z){let ht=At.get(y),_t=ht.currentProgram.id+","+O+","+z,lt=ht.programVariants.get(_t);return lt===void 0?(lt=Vs(y,I,k),ht.programVariants.set(_t,lt)):(ht.currentProgram=lt,ht.uniformsList=null,ht.outputColorSpace=O,ht.toneMapping=z),lt}function fh(y){if(y.uniformsList===null){let I=y.currentProgram.getUniforms();y.uniformsList=Ds.seqWithValue(I.seq,y.uniforms)}return y.uniformsList}function ph(y,I){let k=At.get(y);k.outputColorSpace=I.outputColorSpace,k.batching=I.batching,k.batchingColor=I.batchingColor,k.instancing=I.instancing,k.instancingColor=I.instancingColor,k.instancingMorph=I.instancingMorph,k.skinning=I.skinning,k.morphTargets=I.morphTargets,k.morphNormals=I.morphNormals,k.morphColors=I.morphColors,k.morphTargetsCount=I.morphTargetsCount,k.numClippingPlanes=I.numClippingPlanes,k.numIntersection=I.numClipIntersection,k.vertexAlphas=I.vertexAlphas,k.vertexTangents=I.vertexTangents,k.toneMapping=I.toneMapping}function tf(y,I,k,O,z){I.isScene!==!0&&(I=hn),Nt.resetTextureUnits();let ht=I.fog,_t=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?I.environment:null,lt=et===null?R.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:Zt.workingColorSpace,gt=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,St=w.get(O.envMap||_t,gt),Ot=O.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,qt=!!k.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),yt=!!k.morphAttributes.position,Yt=!!k.morphAttributes.normal,ye=!!k.morphAttributes.color,le=On;O.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(le=R.toneMapping);let oe=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,ze=oe!==void 0?oe.length:0,vt=At.get(O),Xe=T.state.lights;if(Se===!0&&($e===!0||y!==Q)){let me=y===Q&&O.id===X;Z.setState(O,y,me)}let jt=!1,Ai=!1;O.version===vt.__version?vt.needsLights&&vt.lightsStateVersion!==Xe.state.version||z.isBatchedMesh&&vt.batching===!1||!z.isBatchedMesh&&vt.batching===!0||z.isBatchedMesh&&vt.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&vt.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&vt.instancing===!1||!z.isInstancedMesh&&vt.instancing===!0||z.isSkinnedMesh&&vt.skinning===!1||!z.isSkinnedMesh&&vt.skinning===!0||z.isInstancedMesh&&vt.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&vt.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&vt.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&vt.instancingMorph===!1&&z.morphTexture!==null||vt.envMap!==St||O.fog===!0&&vt.fog!==ht||vt.numClippingPlanes!==void 0&&(vt.numClippingPlanes!==Z.numPlanes||vt.numIntersection!==Z.numIntersection)||vt.vertexAlphas!==Ot||vt.vertexTangents!==qt||vt.morphTargets!==yt||vt.morphNormals!==Yt||vt.morphColors!==ye||vt.morphTargetsCount!==ze||vt.numLightProbeGrids!==dh(T.state.lightProbeGridArray)?jt=!0:(vt.outputColorSpace!==lt||vt.toneMapping!==le)&&(Ai=!0):(jt=!0,vt.__version=O.version);let ke=vt.currentProgram;(jt===!0||Ai===!0)&&(ke=Ai===!0?jd(O,I,z,lt,le):Vs(O,I,z),F&&O.isNodeMaterial&&F.onUpdateProgram(O,ke,vt));let Yr=!1,li=!1,Ei=!1,$t=ke.getUniforms(),Ue=vt.uniforms;if(ut.useProgram(ke.program)&&(Yr=!0,li=!0,Ei=!0),O.id!==X&&(X=O.id,li=!0),Yr||Q!==y){ut.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),$t.setValue(L,"projectionMatrix",y.projectionMatrix),$t.setValue(L,"viewMatrix",y.matrixWorldInverse);let Re=$t.map.cameraPosition;Re!==void 0&&Re.setValue(L,In.setFromMatrixPosition(y.matrixWorld)),de.logarithmicDepthBuffer&&$t.setValue(L,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&$t.setValue(L,"isOrthographic",y.isOrthographicCamera===!0),Q!==y&&(Q=y,li=!0,Ei=!0)}if(vt.needsLights&&(Xe.state.sunShadowMap.length>0&&$t.setValue(L,"sunShadowMap",Xe.state.sunShadowMap,Nt),Xe.state.directionalShadowMap.length>0&&$t.setValue(L,"directionalShadowMap",Xe.state.directionalShadowMap,Nt),Xe.state.spotShadowMap.length>0&&$t.setValue(L,"spotShadowMap",Xe.state.spotShadowMap,Nt),Xe.state.pointShadowMap.length>0&&$t.setValue(L,"pointShadowMap",Xe.state.pointShadowMap,Nt)),z.isSkinnedMesh){$t.setOptional(L,z,"bindMatrix"),$t.setOptional(L,z,"bindMatrixInverse");let me=z.skeleton;me&&(me.boneTexture===null&&me.computeBoneTexture(),$t.setValue(L,"boneTexture",me.boneTexture,Nt))}z.isBatchedMesh&&($t.setOptional(L,z,"batchingTexture"),$t.setValue(L,"batchingTexture",z._matricesTexture,Nt),$t.setOptional(L,z,"batchingIdTexture"),$t.setValue(L,"batchingIdTexture",z._indirectTexture,Nt),$t.setOptional(L,z,"batchingColorTexture"),z._colorsTexture!==null&&$t.setValue(L,"batchingColorTexture",z._colorsTexture,Nt));let Sn=k.morphAttributes;if((Sn.position!==void 0||Sn.normal!==void 0||Sn.color!==void 0)&&$.update(z,k,ke),(li||vt.receiveShadow!==z.receiveShadow)&&(vt.receiveShadow=z.receiveShadow,$t.setValue(L,"receiveShadow",z.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&I.environment!==null&&(Ue.envMapIntensity.value=I.environmentIntensity),Ue.dfgLUT!==void 0&&(Ue.dfgLUT.value=Tg()),li){if($t.setValue(L,"toneMappingExposure",R.toneMappingExposure),vt.needsLights&&ef(Ue,Ei),ht&&O.fog===!0&&st.refreshFogUniforms(Ue,ht),st.refreshMaterialUniforms(Ue,O,mt,Tt,T.state.transmissionRenderTarget[y.id]),vt.needsLights&&vt.numLightProbeGrids>0){let me=b,Re=0;for(let Hn of T.state.lightProbeGridArray)Hn.texture!==null&&(me.textures[Re]=Hn.texture,me.min[Re]=Hn.boundingBox.min,me.max[Re]=Hn.boundingBox.max,me.resolution[Re]=Hn.resolution,Re++);for(let Hn in me)me[Hn].length=Re;Ue.probesSH.value=me.textures,Ue.probesMin.value=me.min,Ue.probesMax.value=me.max,Ue.probesResolution.value=me.resolution}Ds.upload(L,fh(vt),Ue,Nt)}if(O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(Ds.upload(L,fh(vt),Ue,Nt),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&$t.setValue(L,"center",z.center),$t.setValue(L,"modelViewMatrix",z.modelViewMatrix),$t.setValue(L,"normalMatrix",z.normalMatrix),$t.setValue(L,"modelMatrix",z.matrixWorld),O.uniformsGroups!==void 0){let me=O.uniformsGroups;for(let Re=0,Hn=me.length;Re<Hn;Re++){let gh=me[Re];bt.update(gh,ke),bt.bind(gh,ke)}}return ke}function ef(y,I){y.ambientLightColor.needsUpdate=I,y.lightProbe.needsUpdate=I,y.sunLights.needsUpdate=I,y.sunLightShadows.needsUpdate=I,y.directionalLights.needsUpdate=I,y.directionalLightShadows.needsUpdate=I,y.pointLights.needsUpdate=I,y.pointLightShadows.needsUpdate=I,y.spotLights.needsUpdate=I,y.spotLightShadows.needsUpdate=I,y.rectAreaLights.needsUpdate=I,y.hemisphereLights.needsUpdate=I}function nf(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return et},this.setRenderTargetTextures=function(y,I,k){let O=At.get(y);O.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),At.get(y.texture).__webglTexture=I,At.get(y.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:k,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,I){let k=At.get(y);k.__webglFramebuffer=I,k.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(y,I=0,k=0){et=y,q=I,V=k;let O=null,z=!1,ht=!1;if(y){let lt=At.get(y);if(lt.__useDefaultFramebuffer!==void 0){ut.bindFramebuffer(L.FRAMEBUFFER,lt.__webglFramebuffer),j.copy(y.viewport),Mt.copy(y.scissor),Ft=y.scissorTest,ut.viewport(j),ut.scissor(Mt),ut.setScissorTest(Ft),X=-1;return}else if(lt.__webglFramebuffer===void 0)Nt.setupRenderTarget(y);else if(lt.__hasExternalTextures)Nt.rebindTextures(y,At.get(y.texture).__webglTexture,At.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){let Ot=y.depthTexture;if(lt.__boundDepthTexture!==Ot){if(Ot!==null&&At.has(Ot)&&(y.width!==Ot.image.width||y.height!==Ot.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Nt.setupDepthRenderbuffer(y)}}let gt=y.texture;(gt.isData3DTexture||gt.isDataArrayTexture||gt.isCompressedArrayTexture)&&(ht=!0);let St=At.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(St[I])?O=St[I][k]:O=St[I],z=!0):y.samples>0&&Nt.useMultisampledRTT(y)===!1?O=At.get(y).__webglMultisampledFramebuffer:Array.isArray(St)?O=St[k]:O=St,j.copy(y.viewport),Mt.copy(y.scissor),Ft=y.scissorTest}else j.copy(Rt).multiplyScalar(mt).floor(),Mt.copy(ne).multiplyScalar(mt).floor(),Ft=ae;if(k!==0&&(O=G),ut.bindFramebuffer(L.FRAMEBUFFER,O)&&ut.drawBuffers(y,O),ut.viewport(j),ut.scissor(Mt),ut.setScissorTest(Ft),z){let lt=At.get(y.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+I,lt.__webglTexture,k)}else if(ht){let lt=I;for(let gt=0;gt<y.textures.length;gt++){let St=At.get(y.textures[gt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+gt,St.__webglTexture,k,lt)}}else if(y!==null&&k!==0){let lt=At.get(y.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,lt.__webglTexture,k)}X=-1};function mh(y){let I=At.get(y);return(I.__readFormat!==y.format||I.__readType!==y.type)&&(I.__readFormat=y.format,I.__readType=y.type,I.__formatReadable=de.textureFormatReadable(y.format),I.__typeReadable=de.textureTypeReadable(y.type)),I}this.readRenderTargetPixels=function(y,I,k,O,z,ht,_t,lt=0){if(!(y&&y.isWebGLRenderTarget)){Pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let gt=At.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&_t!==void 0&&(gt=gt[_t],Array.isArray(gt)&&(gt=gt[0])),gt){ut.bindFramebuffer(L.FRAMEBUFFER,gt);try{let St=y.textures[lt],Ot=St.format,qt=St.type;y.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+lt);let yt=mh(St);if(yt.__formatReadable===!1){Pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(yt.__typeReadable===!1){Pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=y.width-O&&k>=0&&k<=y.height-z&&L.readPixels(I,k,O,z,it.convert(Ot),it.convert(qt),ht)}finally{let St=et!==null?At.get(et).__webglFramebuffer:null;ut.bindFramebuffer(L.FRAMEBUFFER,St)}}},this.readRenderTargetPixelsAsync=async function(y,I,k,O,z,ht,_t,lt=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let gt=At.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&_t!==void 0&&(gt=gt[_t],Array.isArray(gt)&&(gt=gt[0])),gt)if(I>=0&&I<=y.width-O&&k>=0&&k<=y.height-z){ut.bindFramebuffer(L.FRAMEBUFFER,gt);let St=y.textures[lt],Ot=St.format,qt=St.type;y.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+lt);let yt=mh(St);if(yt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(yt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Yt=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Yt),L.bufferData(L.PIXEL_PACK_BUFFER,ht.byteLength,L.STREAM_READ),L.readPixels(I,k,O,z,it.convert(Ot),it.convert(qt),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let ye=et!==null?At.get(et).__webglFramebuffer:null;ut.bindFramebuffer(L.FRAMEBUFFER,ye);let le=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Du(L,le,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Yt),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,ht),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(Yt),L.deleteSync(le),ht}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,I=null,k=0){let O=Math.pow(2,-k),z=Math.floor(y.image.width*O),ht=Math.floor(y.image.height*O),_t=I!==null?I.x:0,lt=I!==null?I.y:0;Nt.setTexture2D(y,0),L.copyTexSubImage2D(L.TEXTURE_2D,k,0,0,_t,lt,z,ht),ut.unbindTexture()},this.copyTextureToTexture=function(y,I,k=null,O=null,z=0,ht=0){let _t,lt,gt,St,Ot,qt,yt,Yt,ye,le=y.isCompressedTexture?y.mipmaps[ht]:y.image;if(k!==null)_t=k.max.x-k.min.x,lt=k.max.y-k.min.y,gt=k.isBox3?k.max.z-k.min.z:1,St=k.min.x,Ot=k.min.y,qt=k.isBox3?k.min.z:0;else{let $t=Math.pow(2,-z);_t=Math.floor(le.width*$t),lt=Math.floor(le.height*$t),y.isDataArrayTexture?gt=le.depth:y.isData3DTexture?gt=Math.floor(le.depth*$t):gt=1,St=0,Ot=0,qt=0}O!==null?(yt=O.x,Yt=O.y,ye=O.z):(yt=0,Yt=0,ye=0);let oe=it.convert(I.format),ze=it.convert(I.type),vt;I.isData3DTexture?(Nt.setTexture3D(I,0),vt=L.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(Nt.setTexture2DArray(I,0),vt=L.TEXTURE_2D_ARRAY):(Nt.setTexture2D(I,0),vt=L.TEXTURE_2D),ut.activeTexture(L.TEXTURE0),ut.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,I.flipY),ut.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),ut.pixelStorei(L.UNPACK_ALIGNMENT,I.unpackAlignment);let Xe=ut.getParameter(L.UNPACK_ROW_LENGTH),jt=ut.getParameter(L.UNPACK_IMAGE_HEIGHT),Ai=ut.getParameter(L.UNPACK_SKIP_PIXELS),ke=ut.getParameter(L.UNPACK_SKIP_ROWS),Yr=ut.getParameter(L.UNPACK_SKIP_IMAGES);ut.pixelStorei(L.UNPACK_ROW_LENGTH,le.width),ut.pixelStorei(L.UNPACK_IMAGE_HEIGHT,le.height),ut.pixelStorei(L.UNPACK_SKIP_PIXELS,St),ut.pixelStorei(L.UNPACK_SKIP_ROWS,Ot),ut.pixelStorei(L.UNPACK_SKIP_IMAGES,qt);let li=y.isDataArrayTexture||y.isData3DTexture,Ei=I.isDataArrayTexture||I.isData3DTexture;if(y.isDepthTexture){let $t=At.get(y),Ue=At.get(I),Sn=At.get($t.__renderTarget),me=At.get(Ue.__renderTarget);ut.bindFramebuffer(L.READ_FRAMEBUFFER,Sn.__webglFramebuffer),ut.bindFramebuffer(L.DRAW_FRAMEBUFFER,me.__webglFramebuffer);for(let Re=0;Re<gt;Re++)li&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,At.get(y).__webglTexture,z,qt+Re),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,At.get(I).__webglTexture,ht,ye+Re)),L.blitFramebuffer(St,Ot,St+_t,Ot+lt,yt,Yt,yt+_t,Yt+lt,L.DEPTH_BUFFER_BIT,L.NEAREST);ut.bindFramebuffer(L.READ_FRAMEBUFFER,null),ut.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(z!==0||y.isRenderTargetTexture||At.has(y)){let $t=At.get(y),Ue=At.get(I);ut.bindFramebuffer(L.READ_FRAMEBUFFER,P),ut.bindFramebuffer(L.DRAW_FRAMEBUFFER,H);for(let Sn=0;Sn<gt;Sn++)li?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,$t.__webglTexture,z,qt+Sn):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,$t.__webglTexture,z),Ei?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ue.__webglTexture,ht,ye+Sn):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ue.__webglTexture,ht),z!==0?L.blitFramebuffer(St,Ot,St+_t,Ot+lt,yt,Yt,yt+_t,Yt+lt,L.COLOR_BUFFER_BIT,L.NEAREST):Ei?L.copyTexSubImage3D(vt,ht,yt,Yt,ye+Sn,St,Ot,_t,lt):L.copyTexSubImage2D(vt,ht,yt,Yt,St,Ot,_t,lt);ut.bindFramebuffer(L.READ_FRAMEBUFFER,null),ut.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Ei?y.isDataTexture||y.isData3DTexture?L.texSubImage3D(vt,ht,yt,Yt,ye,_t,lt,gt,oe,ze,le.data):I.isCompressedArrayTexture?L.compressedTexSubImage3D(vt,ht,yt,Yt,ye,_t,lt,gt,oe,le.data):L.texSubImage3D(vt,ht,yt,Yt,ye,_t,lt,gt,oe,ze,le):y.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,ht,yt,Yt,_t,lt,oe,ze,le.data):y.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,ht,yt,Yt,le.width,le.height,oe,le.data):L.texSubImage2D(L.TEXTURE_2D,ht,yt,Yt,_t,lt,oe,ze,le);ut.pixelStorei(L.UNPACK_ROW_LENGTH,Xe),ut.pixelStorei(L.UNPACK_IMAGE_HEIGHT,jt),ut.pixelStorei(L.UNPACK_SKIP_PIXELS,Ai),ut.pixelStorei(L.UNPACK_SKIP_ROWS,ke),ut.pixelStorei(L.UNPACK_SKIP_IMAGES,Yr),ht===0&&I.generateMipmaps===!0&&I.mipmapsAutoUpdate===!0&&L.generateMipmap(vt),ut.unbindTexture()},this.initRenderTarget=function(y){At.get(y).__webglFramebuffer===void 0&&Nt.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Nt.setTextureCube(y,0):y.isData3DTexture?Nt.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Nt.setTexture2DArray(y,0):Nt.setTexture2D(y,0),ut.unbindTexture()},this.resetState=function(){q=0,V=0,et=null,ut.reset(),rt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Zt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Zt._getUnpackColorSpace()}};var Zo=class{constructor(){this.active=null}begin(t,e=!0){return!e||this.active!==null?!1:(this.active=t,!0)}owns(t){return this.active===t}end(t){return this.owns(t)?(this.active=null,!0):!1}cancel(){this.active=null}},yn=i=>(i=Math.max(0,Math.min(1,i)),i*i*(3-2*i));function Ko(i){let t=Math.max(0,Math.min(1,i)),e=1-yn((t-.82)/.18);return{bend:yn(t/.22)*e,pitch:.58*yn((t-.22)/.22)*e}}function Fs(i,t,e,n,s=n*.58){if(t<-400||n<=1e-6&&s<=1e-6)return{x:i,y:t,z:e};let r=1.22*n,a=i/300*r,o=r>1e-6?300/r:0,l=r>1e-6?Math.sin(a)*o:i,c=r>1e-6?2*Math.sin(a/2)**2*o:0,h=t+400;return{x:l,y:-400+h*Math.cos(s)-c*Math.sin(s),z:e+110*n+h*Math.sin(s)+c*Math.cos(s)}}function Md(i,t,e,n,s=n*.58){let r=i/300*1.22*n;return{x:t*Math.cos(r),y:-e*Math.cos(s)-t*Math.sin(r)*Math.sin(s),z:-e*Math.sin(s)+t*Math.sin(r)*Math.cos(s)}}var Jo=class{constructor(){this.reset()}reset(){this.phase="peel",this.elapsed=0,this.advance=!1,this.pendingNext=!1,this.serial=0,this.rollDuration=2.8,this.drainDoneAt=null}setRollDuration(t){Number.isFinite(t)&&t>0&&(this.rollDuration=t)}get busy(){return["rolling","pour","shake"].includes(this.phase)}roll(){return this.phase!=="peel"?!1:(this.phase="rolling",this.elapsed=0,this.serial++,!0)}pour(){return["brush","peel"].includes(this.phase)?(this.phase="pour",this.elapsed=0,this.serial++,!0):!1}shake(t=!1){return this.phase!=="brush"?!1:(this.phase="shake",this.elapsed=0,this.advance=t,this.drainDoneAt=null,this.serial++,!0)}tick(t,{drainComplete:e=!0}={}){if(!this.busy)return null;if(this.elapsed+=t,this.phase==="rolling"&&this.elapsed>=this.rollDuration)return this.phase="pour",this.elapsed=0,"rolled";if(this.phase==="pour"&&this.elapsed>=1.65)return this.phase="brush",this.elapsed=0,"poured";if(this.phase==="shake"&&(this.elapsed>=3.9&&e&&this.drainDoneAt===null&&(this.drainDoneAt=Math.max(3.9,this.elapsed-t)),this.drainDoneAt!==null&&this.elapsed-this.drainDoneAt>=1)){this.phase="brush",this.elapsed=0;let n=this.advance;return this.advance=!1,n?"advance":"shaken"}return null}get progress(){return this.phase==="shake"?this.drainDoneAt===null?Math.min(.8,this.elapsed/4.875):Math.min(1,.8+.2*(this.elapsed-this.drainDoneAt)):Math.max(0,Math.min(1,this.elapsed/(this.phase==="rolling"?this.rollDuration:1.65)))}},$o=class{constructor(t=60){this.limit=t,this.deadline=null}setLimit(t){t!==this.limit&&(this.limit=t,this.deadline=null)}shouldRender(t){let e=1e3/this.limit;return this.deadline===null&&(this.deadline=t),t+.6<this.deadline?!1:(t-this.deadline>e*2&&(this.deadline=t),this.deadline+=e,!0)}};function Sd(i,t,e=18){for(i.push(t);i.length>e;){let n=i.shift();i[0].from=n.from}}var Gc=.24;function bd(i){return i.reduce((t,e)=>t+e.duration,0)+Math.max(0,i.length-1)*Gc}function wd(i,t){let e=0;for(let n=0;n<i.length;n++){let s=e+i[n].duration;if(t<=s||n===i.length-1)return{index:n,progress:Math.max(0,Math.min(1,(t-e)/i[n].duration)),count:i.length};if(t<s+Gc)return{index:n,progress:1,count:i.length};e=s+Gc}return{index:0,progress:0,count:0}}function Td(i,t){return-2+yn((t-.2)/.65)*(i.length+78)}function Vc(i,t,e,n){let{grip:s,axis:r}=i,a=(t-s.x)*r.x+(e-s.y)*r.y,o=(t-s.x)*-r.y+(e-s.y)*r.x,l=Td(i,n),c=Math.max(0,l-a);if(c<=0)return{x:t-300,y:400-e,z:4.5};let h=16+Math.min(8,c*.009),f=c/h,u=l-h*Math.sin(f),d=yn((n-.85)/.15),g=s.x+r.x*u-r.y*o+d*390,v=s.y+r.y*u+r.x*o-d*70;return{x:g-300,y:400-v,z:4.5+h*(1-Math.cos(f))+Math.min(55,c*.32)*yn((n-.2)/.65)+d*150}}function Ad(i,t){let e=i.bounds,n=Td(i,t),s=o=>(o.x-i.grip.x)*i.axis.x+(o.y-i.grip.y)*i.axis.y-n,r=[{x:e.x,y:e.y},{x:e.x+e.w,y:e.y},{x:e.x+e.w,y:e.y+e.h},{x:e.x,y:e.y+e.h}],a=[];for(let o=0;o<r.length;o++){let l=r[o],c=r[(o+1)%r.length],h=s(l),f=s(c);if(h<=0&&a.push(l),h<0!=f<0){let u=h/(h-f);a.push({x:l.x+(c.x-l.x)*u,y:l.y+(c.y-l.y)*u})}}return a}var Je={halfWidth:112,halfDepth:88,centerY:-520,bottom:5,rim:63};function Ed(i,t,e){let n=Math.max(1,Math.ceil(t/.016)),s=t/n;for(let r=0;r<n;r++){let a={x:i.x,y:i.y,z:i.z};i.vz-=980*s,i.x+=i.vx*s,i.y+=i.vy*s,i.z+=i.vz*s;let o=Math.abs(i.x)<=e.halfWidth,l=Math.abs(i.y-e.centerY)<=e.halfDepth;if(o&&l&&i.vz<0&&a.z>=e.bottom&&i.z<=e.bottom)return i.z=e.bottom,!0;i.z<e.rim&&i.z>e.bottom&&(l&&Math.abs(a.x)<e.halfWidth&&Math.abs(i.x)>e.halfWidth&&(i.x=Math.sign(i.x)*(e.halfWidth-1),i.vx*=-.2),o&&Math.abs(a.y-e.centerY)<e.halfDepth&&Math.abs(i.y-e.centerY)>e.halfDepth&&(i.y=e.centerY+Math.sign(i.y-e.centerY)*(e.halfDepth-1),i.vy*=-.2))}return!1}var Qo=class extends Ni{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new we;t.deleteAttribute("uv");let e=new he({side:Oe}),n=new he,s=new vr(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Ut(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new Fi(t,n,6),o=new ge;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new Ut(t,Os(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Ut(t,Os(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Ut(t,Os(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let f=new Ut(t,Os(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);let u=new Ut(t,Os(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,.1),this.add(u);let d=new Ut(t,Os(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function Os(i){return new mr({color:0,emissive:16777215,emissiveIntensity:i})}var nl=Math.PI*2,Rg={...Je,halfWidth:-1};function el(i,t=256){let e=document.createElement("canvas");e.width=e.height=t,i(e.getContext("2d"),t);let n=new gi(e);return n.colorSpace=Ie,n}function Pg(){return el((i,t)=>{i.fillStyle="#b9bcba",i.fillRect(0,0,t,t);for(let e=0;e<55e3;e++){let n=150+Math.random()*85;i.fillStyle=`rgba(${n},${n+1},${n+3},.16)`,i.fillRect(Math.random()*t,Math.random()*t,.5+Math.random()*2,1)}},512)}function Ig(){let i=new Fe,t=[],e=5;for(let n=0;n<e;n++){let s=n/e*nl,r=(n+1)/e*nl;t.push(0,0,.12,Math.cos(s),Math.sin(s),0,Math.cos(r),Math.sin(r),0)}return i.setAttribute("position",new ee(t,3)),i.computeVertexNormals(),i}var il=class{constructor(t,e,n,s){this.settings=s,this.baseDpr=Math.min(devicePixelRatio||1,matchMedia("(pointer: coarse)").matches?1.4:2),this.canvas=t,this.colors=n,this.activeColor=0,this.time=0,this.renderTick=0,this.mouse=new Lt,this.ray=new Sr,this.hit=new U,this.renderer=new Xo({canvas:t,antialias:!matchMedia("(pointer: coarse)").matches,alpha:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(this.baseDpr*s.renderScale),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Bi,this.renderer.outputColorSpace=Ie,this.renderer.toneMapping=wr,this.renderer.toneMappingExposure=.95,this.scene=new Ni,this.scene.background=new Ct("#c9ccca"),this.camera=new He(35,1,1,5e3);let r=new Ns(this.renderer),a=new Qo;this.scene.environment=r.fromScene(a,.04).texture,a.dispose(),r.dispose(),this.scene.environmentIntensity=.55,this.scene.add(new _r("#fff7dd","#505668",1.5)),this.key=new Es("#fff6e4",2.8),this.key.position.set(-300,340,750),this.key.castShadow=!0,this.key.shadow.mapSize.set(1536,1536),Object.assign(this.key.shadow.camera,{left:-600,right:600,top:700,bottom:-650,near:1,far:1800}),this.key.shadow.bias=-8e-5,this.key.shadow.normalBias=.15,this.key.shadow.radius=3,this.scene.add(this.key),this.fill=new Es("#b9d4ff",.8),this.fill.position.set(500,-200,400),this.scene.add(this.fill);let o=Pg();o.wrapS=o.wrapT=Di,o.repeat.set(4,4);let l=new Ut(new _n(2400,2400),new he({map:o,bumpMap:o,bumpScale:.8,roughness:.94,color:"#d9ddda"}));l.position.z=-8,l.receiveShadow=!0,this.scene.add(l),this.paperGroup=new Ke,this.paperGroup.rotation.z=.018,this.scene.add(this.paperGroup);let c=new Ut(new we(600,800,3.2,30,40,1),new he({color:"#d6c68b",roughness:.85}));c.castShadow=!0,c.receiveShadow=!0,this.paperGroup.add(c),this.edge=c,this.edgeBase=c.geometry.attributes.position.array.slice(),this.paperTexture=new gi(e),this.paperTexture.colorSpace=Ie,this.paperTexture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());let h=new _n(600,800,30,40),f=h.attributes.position;for(let d=0;d<f.count;d++){let g=f.getX(d),v=f.getY(d),m=Math.max(Math.abs(g)/300,Math.abs(v)/400);f.setZ(d,2.8+Math.pow(m,14)*1.5+Math.sin(g*.013+v*.006)*.12)}h.computeVertexNormals(),this.paper=new Ut(h,new Ss({map:this.paperTexture,color:"#ffffff",toneMapped:!1})),this.paper.receiveShadow=!0,this.paperGroup.add(this.paper),this.paperBase=f.array.slice(),this.bend=0,this.pitch=0,this.coatUniforms={uTime:{value:0},uSparkle:{value:s.sparkles?1:0},uCoat:{value:null}},this.paper.material.onBeforeCompile=d=>{Object.assign(d.uniforms,this.coatUniforms),d.fragmentShader=`uniform float uTime; uniform float uSparkle; uniform sampler2D uCoat;
`+d.fragmentShader,d.fragmentShader=d.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
    vec2 cell=floor(vMapUv*vec2(600.0,800.0));
    float rnd=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
    float flicker=pow(max(0.0,sin(uTime*1.4+rnd*197.0)),32.0);
    float coat=texture2D(uCoat,vMapUv).a;
    gl_FragColor.rgb+=coat*uSparkle*step(.986,rnd)*flicker*.65;`)},this.shaders=[],this.sparkLight=new U(-.35,.45,1),this.grainMaterial=new he({color:"#ffffff",metalness:.95,roughness:.43,envMapIntensity:.5,side:Qe}),this.grainMaterial.onBeforeCompile=d=>{d.uniforms.uSparkLight={value:this.sparkLight},d.uniforms.uSparkEnabled={value:this.settings.sparkles?1:0},d.vertexShader=`attribute float flakeSeed; varying float vFlakeSeed;
`+d.vertexShader,d.vertexShader=d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vFlakeSeed=flakeSeed;`),d.fragmentShader=`uniform float uSparkEnabled; uniform vec3 uSparkLight; varying float vFlakeSeed;
`+d.fragmentShader,d.fragmentShader=d.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
    vec3 halfLight=normalize(uSparkLight+normalize(vViewPosition));
    float glint=pow(max(dot(normal,halfLight),0.0),140.0);
    gl_FragColor.rgb+=uSparkEnabled*step(.975,vFlakeSeed)*glint*1.8*vec3(1.0,0.95,0.82);`),this.shaders.push(d)},this.current=this.makeGrains(3e4),this.savedCount=0,this.currentInitialized=0,this.spill=this.makeGrains(3e4),this.paperGroup.remove(this.spill),this.scene.add(this.spill),this.spill.material=this.grainMaterial.clone(),this.spill.material.depthTest=!1,this.spill.material.depthWrite=!1,this.spill.renderOrder=20,this.spills=[],this.spillObject=new ge,this.coatMask=new gi(document.createElement("canvas")),this.coatUniforms.uCoat.value=this.coatMask,this.heapTexture=el((d,g)=>{d.fillStyle="#898989",d.fillRect(0,0,g,g);for(let v=0;v<18e3;v++){let m=Math.random()*255|0;d.fillStyle=`rgb(${m},${m},${m})`,d.fillRect(Math.random()*g,Math.random()*g,1,1)}},128),this.heapTexture.wrapS=this.heapTexture.wrapT=Di,this.heapTexture.repeat.set(11,15),this.heapGeo=new _n(600,800,120/2,160/2),this.heapGeo.setAttribute("heapAmount",new ee(new Float32Array(this.heapGeo.attributes.position.count),1)),this.heapMat=new he({color:n[0],roughness:.65,metalness:.9,bumpMap:this.heapTexture,bumpScale:.7,envMapIntensity:.8});let u=d=>{d.vertexShader=`attribute float heapAmount; varying float vHeap;
`+d.vertexShader,d.vertexShader=d.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vHeap=heapAmount;`),d.fragmentShader=`varying float vHeap;
`+d.fragmentShader,d.fragmentShader=d.fragmentShader.replace("void main() {",`void main() {
if(vHeap<2.2) discard;`)};this.heapMat.onBeforeCompile=u,this.heap=new Ut(this.heapGeo,this.heapMat),this.heap.frustumCulled=!1,this.heap.receiveShadow=!0,this.heap.castShadow=!0,this.heap.customDepthMaterial=new Ts({depthPacking:vc}),this.heap.customDepthMaterial.onBeforeCompile=u,this.paperGroup.add(this.heap),this.peelGeo=new _n(600,800,24,160),this.peelSheet=new Ut(this.peelGeo,new he({color:"#fff2b2",roughness:.8,transparent:!0,alphaTest:.08,side:Qe})),this.peelSheet.frustumCulled=!1,this.peelSheet.castShadow=!0,this.peelSheet.visible=!1,this.paperGroup.add(this.peelSheet),this.makeBrush(),this.makeTweezers(),this.makeGlints(),this.makeJars(),this.makeCollector(),this.makeHands(),this.hint=this.makeHint(),this.paperGroup.add(this.hint),this.desiredBrush={x:130,y:250,angle:-.72,contact:!1,visible:!1},this.brushPoint={x:130,y:250},this.pourPoint={x:140,y:180},this.autoPour=!1,this.applySettings(s),this.observer=new ResizeObserver(()=>this.resize()),this.observer.observe(t),this.resize()}makeGrains(t){let e=Ig(),n=new Float32Array(t);for(let r=0;r<t;r++)n[r]=r*16807%2147483647/2147483647;e.setAttribute("flakeSeed",new pi(n,1));let s=new Fi(e,this.grainMaterial,t);return s.instanceMatrix.setUsage(Tc),s.instanceColor=new pi(new Float32Array(t*3),3),s.frustumCulled=!1,s.count=0,this.paperGroup.add(s),s}makeBrush(){this.brush=new Ke,this.brush.visible=!1,this.paperGroup.add(this.brush);let t=new he({color:"#1d2028",roughness:.27,metalness:.15}),e=new Ut(new _i(6,10,165,20),t);e.position.set(0,-133,19),e.rotation.x=.075,e.castShadow=!0,this.brush.add(e);let n=new Ut(new Oi(6,12,8),t);n.position.set(0,-215,13),this.brush.add(n);let s=new Ut(new we(45,35,12),new he({color:"#b6b9ba",metalness:1,roughness:.21}));s.position.set(0,-34,14),s.castShadow=!0,this.brush.add(s);let r=new he({color:"#e4e2dc",metalness:.95,roughness:.19});for(let c of[-48,-20]){let h=new Ut(new we(46,2,12.5),r);h.position.set(0,c,14),this.brush.add(h)}let a=new _i(22,29,37,32,1,!1);a.scale(1,1,.24),this.tuftMat=new he({color:"#795235",roughness:.8}),this.tuft=new Ut(a,this.tuftMat),this.tuft.position.set(0,0,9),this.tuft.castShadow=!0,this.brush.add(this.tuft);let o=new Fe,l=[];for(let c=0;c<150;c++){let h=(Math.random()-.5)*48,f=4+Math.random()*10;l.push(h*.8,-15,f+2,h,17-Math.abs(h)*.13,f*.7)}o.setAttribute("position",new ee(l,3)),this.bristles=new cr(o,new bs({color:"#c09965",transparent:!0,opacity:.65})),this.brush.add(this.bristles)}makeJars(){this.jars=[];let t=new Ut(new we(470,65,9),new he({color:"#41464b",metalness:.25,roughness:.35}));t.position.set(0,460,-2),t.castShadow=!0,this.scene.add(t);for(let e=0;e<6;e++){let n=new Ke;n.position.set((e-2.5)*72,460,4),n.rotation.x=Math.PI/2,this.scene.add(n);let s=new Ut(new _i(23,19,58,24,1,!0),new ws({color:"#f5ffff",transparent:!0,opacity:.29,roughness:.1,metalness:0,clearcoat:1,side:Qe,depthWrite:!1}));s.position.y=30,s.castShadow=!0,n.add(s);let r=new Ut(new _i(20,17,37,24),new he({color:this.colors[e],roughness:.28,metalness:.65,bumpMap:this.heapTexture,bumpScale:.8,envMapIntensity:1.2}));r.position.y=27,n.add(r),n.userData.fill=r;let a=new Ut(new pr(23,1.1,8,24),new he({color:"#ffffff",roughness:.12,metalness:.7}));a.rotation.x=Math.PI/2,a.position.y=59,n.add(a),n.userData.home=n.position.clone(),n.userData.homeRotation=n.quaternion.clone(),this.jars.push(n)}}makeTweezers(){this.tweezers=new Ke,this.paperGroup.add(this.tweezers),this.tweezers.visible=!1;let t=new he({color:"#b8c0c1",roughness:.2,metalness:.95});for(let e of[-1,1]){let n=new Ut(new we(4,130,4),t);n.position.set(e*5,-60,25),n.rotation.z=e*.075,n.rotation.x=.16,n.castShadow=!0,this.tweezers.add(n)}}makeCollector(){this.boxGroup=new Ke,this.boxGroup.position.set(0,Je.centerY,0),this.boxGroup.visible=!1,this.scene.add(this.boxGroup),this.boxMotion=0,this.collectorBox={...Je},this.collectedCount=0,this.trayBins=new Uint16Array(616);let t=new he({color:"#c6cdbf",roughness:.42,metalness:.25}),e=new he({color:"#343e35",roughness:.8}),n=new Ut(new we(240,192,8),t);n.castShadow=!0,this.boxGroup.add(n);let s=new Ut(new _n(224,176),e);s.position.z=4.1,this.boxGroup.add(s);for(let o of[-1,1]){let l=new Ut(new we(8,192,63),t);l.position.set(o*116,0,31.5),l.castShadow=!0,this.boxGroup.add(l)}let r=new Ut(new we(224,8,63),t);r.position.set(0,92,31.5),this.boxGroup.add(r);let a=new Ut(new we(224,5,51),new ws({color:"#e5ebdf",transparent:!0,opacity:.38,roughness:.2,metalness:.1,depthWrite:!1}));a.position.set(0,-92,25.5),this.boxGroup.add(a);for(let o of[-96,96])for(let l of[-70,70]){let c=new Ut(new we(18,18,4),e);c.position.set(o,l,-6),this.boxGroup.add(c)}this.collected=this.makeGrains(3e4),this.paperGroup.remove(this.collected),this.boxGroup.add(this.collected)}makeHands(){this.hands=[];let t=new he({color:"#d9ac8e",roughness:.85}),e=new he({color:"#f0cec0",roughness:.42});for(let n of[-1,1]){let s=new Ke;s.visible=!1,this.scene.add(s);let r=new Ut(new Oi(29,16,10),t);r.scale.set(1.1,1.2,.58),r.position.set(n*34,-15,-4),s.add(r);for(let[o,l,c,h]of[[8,12,10,31],[-4,-5,8,37]]){let f=new Ut(new fr(c,h,4,10),t);f.rotation.z=Math.PI/2,f.position.set(n*13,o,l),f.castShadow=!0,s.add(f)}let a=new Ut(new Oi(8,12,8),e);a.scale.set(1.05,.65,.18),a.position.set(n*-3,8,21),s.add(a),this.hands.push(s)}}makeGlints(){let t=el((e,n)=>{let s=e.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);s.addColorStop(0,"#fffef5ff"),s.addColorStop(.08,"#fff3cbaa"),s.addColorStop(.4,"#ffe9b922"),s.addColorStop(1,"#ffffff00"),e.fillStyle=s,e.fillRect(0,0,n,n),e.strokeStyle="#fff9e9cc",e.lineWidth=1;for(let r=0;r<4;r++){let a=r*Math.PI/2;e.beginPath(),e.moveTo(n/2,n/2),e.lineTo(n/2+Math.cos(a)*n*.32,n/2+Math.sin(a)*n*.32),e.stroke()}},64);this.glints=[];for(let e=0;e<28;e++){let n=new vs(new Ui({map:t,transparent:!0,blending:br,depthWrite:!1,toneMapped:!1}));n.visible=!1,this.paperGroup.add(n),this.glints.push(n)}}makeHint(){let t=el((n,s)=>{n.strokeStyle="#ffffee",n.lineWidth=5,n.beginPath(),n.arc(s/2,s/2,48,0,nl),n.stroke(),n.fillStyle="#fffef0",n.beginPath(),n.arc(s/2,s/2,7,0,nl),n.fill()},256),e=new vs(new Ui({map:t,transparent:!0,depthTest:!1}));return e.scale.set(90,90,1),e}applySettings(t){let e=this.settings;this.settings={...t};let n=Math.max(.5,Math.min(2.75,this.baseDpr*t.renderScale));this.renderer.setPixelRatio(n);let s={off:0,low:512,medium:1024,high:1536}[t.shadow];this.renderer.shadowMap.enabled=s>0,this.key.castShadow=s>0,s&&this.key.shadow.mapSize.x!==s&&(this.key.shadow.map?.dispose(),this.key.shadow.map=null,this.key.shadow.mapSize.set(s,s)),this.key.shadow.needsUpdate=!0,this.scene.environmentIntensity=t.reflections?.55:0,this.grainMaterial.envMapIntensity=t.reflections?.5:0,this.grainMaterial.metalness=t.reflections?.95:.85,this.grainMaterial.roughness=t.sparkles?.43:.6,this.heapMat.envMapIntensity=t.reflections?.25:0,this.coatUniforms.uSparkle.value=t.sparkles?1:0;for(let r of this.shaders)r.uniforms.uSparkEnabled.value=t.sparkles?1:0;e?.shadow!==t.shadow&&this.scene.traverse(r=>{if(r.material)for(let a of Array.isArray(r.material)?r.material:[r.material])a.needsUpdate=!0});for(let r of this.glints)t.sparkles||(r.visible=!1);this.resize()}resize(){let t=this.canvas.clientWidth,e=this.canvas.clientHeight;if(!t||!e)return;this.renderer.setSize(t,e,!1),this.camera.aspect=t/e;let n=Math.tan(35*Math.PI/360),s=Math.max(1180/(2*n),650/(2*n*this.camera.aspect));this.camera.position.set(0,-s*.18,s),this.camera.lookAt(0,-35,20),this.camera.updateProjectionMatrix()}metrics(){let t=this.renderer.info;return{width:this.canvas.width,height:this.canvas.height,draws:t.render.calls,triangles:t.render.triangles,visible:this.current.count+this.spill.count+(this.boxGroup.visible?this.collected.count:0)}}posePour(t){let e=this.jars[this.activeColor%6];if(!e)return;if(!t){e.position.copy(e.userData.home),e.quaternion.copy(e.userData.homeRotation),e.userData.fill.scale.y=1,e.userData.fill.position.y=27;return}let n=t.elapsed,s=yn(Math.min(1,n/.34)),r=yn(Math.max(0,(n-1.32)/.33)),a=s*(1-r);this.paperGroup.updateMatrixWorld(!0);let o=this.paperGroup.localToWorld(new U(t.x-300,400-t.y+56,176));e.position.copy(e.userData.home).lerp(o,a);let l=new rn().setFromEuler(new on(Math.PI+.24,0,this.paperGroup.rotation.z));e.quaternion.copy(e.userData.homeRotation).slerp(l,a);let c=1-Math.min(1,Math.max(0,(n-.48)/.82))*.86;e.userData.fill.scale.y=1+(c-1)*a,e.userData.fill.position.y=8.5+18.5*e.userData.fill.scale.y,e.updateMatrixWorld(!0)}pourOrigin(){let t=this.jars[this.activeColor%6],e=t.localToWorld(new U(0,59,17));return this.paperGroup.worldToLocal(e),{x:e.x+300,y:400-e.y,z:e.z-3}}mapPointer(t){let e=this.canvas.getBoundingClientRect();this.mouse.set((t.clientX-e.left)/e.width*2-1,-(t.clientY-e.top)/e.height*2+1),this.ray.setFromCamera(this.mouse,this.camera);let n=new sn(new U(0,0,1),-3);return this.ray.ray.intersectPlane(n,this.hit)?(this.paperGroup.worldToLocal(this.hit),{x:this.hit.x+300,y:400-this.hit.y}):{x:300,y:400}}setStage(t){this.updateBend(0),this.heapGeo.attributes.heapAmount.array.fill(0),this.current.visible=!0,this.activeColor=t,this.current.count=0,this.currentInitialized=0,this.heapMat.color.set(this.colors[t]),this.tuftMat.color.set("#795235"),this.heap.visible=!0,this.hint.visible=!0,this.jars[t%6].userData.fill.material.color.set(this.colors[t])}initInstance(t,e,n,s){let r=new Qt,a=new rn().setFromEuler(new on((n*17%1-.5)*1.3,(n*31%1-.5)*1.3,n*79)),o=1.15+n*197%1*.9;r.compose(new U(0,0,-1e3),a,new U(o,o,o)),t.instanceMatrix.array.set(r.elements,e*16);let l=new Ct(s),c=.6+n*47%1*.7;l.multiplyScalar(c),n*127%1>.965&&l.lerp(new Ct("#c2c8da"),.65),t.instanceColor.array.set([l.r,l.g,l.b],e*3)}updateGrains(t){let e=this.current.instanceMatrix.array,n=this.current.instanceColor.array,s=this.current.geometry.attributes.flakeSeed,r=new Ct(this.colors[this.activeColor]),a=0;for(let o=0;o<t.count;o++){if(t.state[o]===2||t.state[o]===3)continue;let l=a*16,c=t.seed[o],h=c*79,f=Math.cos(h),u=Math.sin(h),d=1.5+c*197%1*1.1,g=Fs(t.x[o]-300,400-t.y[o],3+(t.state[o]===1?Math.min(34,t.z[o]):t.z[o]),this.bend,this.pitch);e[l]=f*d,e[l+1]=u*d,e[l+2]=(c*17%1-.5)*(t.pressed[o]?.3:1.2)*d,e[l+3]=0,e[l+4]=-u*d,e[l+5]=f*d,e[l+6]=(c*31%1-.5)*(t.pressed[o]?.3:1.2)*d,e[l+7]=0,e[l+8]=0,e[l+9]=0,e[l+10]=d,e[l+11]=0,e[l+12]=g.x,e[l+13]=g.y,e[l+14]=g.z,e[l+15]=1;let v=.7+c*47%1*.5;n[a*3]=r.r*v,n[a*3+1]=r.g*v,n[a*3+2]=r.b*v,s.setX(a,c),a++}this.current.count=a,this.current.instanceMatrix.needsUpdate=!0,this.current.instanceColor.needsUpdate=!0,s.needsUpdate=!0}updateHeap(t,e=1/60){let n=this.heapGeo.attributes.position,s=120/2,r=160/2;for(let a=0;a<=r;a++)for(let o=0;o<=s;o++){let l=Math.min(o*2,119),c=Math.min(a*2,159),h=c*120+l,f=Math.min(32,(t.moundHeight[h]+t.moundHeight[c*120+Math.max(l-1,0)]+t.moundHeight[Math.max(c-1,0)*120+l]+t.moundHeight[Math.max(c-1,0)*120+Math.max(l-1,0)])*.25),u=a*(s+1)+o,d=this.heapGeo.attributes.heapAmount.getX(u),g=f>0?d+(f*.8-d)*Math.min(1,e*30):0;this.heapGeo.attributes.heapAmount.setX(u,g);let v=Fs(o/s*600-300,400-a/r*800,3+g,this.bend,this.pitch);n.setXYZ(u,v.x,v.y,v.z)}n.needsUpdate=!0,this.heapGeo.attributes.heapAmount.needsUpdate=!0,this.renderTick++%4===0&&this.heapGeo.computeVertexNormals()}updateBend(t,e=t*.58){if(t<=1e-6&&(t=0),e<=1e-6&&(e=0),!(t===this.bend&&e===(this.pitch||0))){this.bend=t,this.pitch=e;for(let[n,s]of[[this.paper,this.paperBase],[this.edge,this.edgeBase]]){let r=n.geometry.attributes.position;for(let a=0;a<r.count;a++){let o=Fs(s[a*3],s[a*3+1],s[a*3+2],t,e);r.setXYZ(a,o.x,o.y,o.z)}r.needsUpdate=!0,n.geometry.computeVertexNormals()}}}setCoatMask(t){this.coatMask.image=t,this.coatMask.needsUpdate=!0}preserve(t){this.collectSpill(t)}collectSpill(t,e=!1){this.paperGroup.updateMatrixWorld(!0);let n=new Ct(this.colors[this.activeColor]);for(let s=0;s<t.count;s++)if(t.state[s]!==2&&t.state[s]!==3&&this.spills.length<3e4){if(e&&(t.state[s]!==1||t.cell(t.x[s],t.y[s])>=0))continue;let r=Fs(t.x[s]-300,400-(this.draining?Math.min(800,t.y[s]):t.y[s]),3+(t.state[s]===1?Math.min(34,t.z[s]):t.z[s]),this.bend,this.pitch),a=this.paperGroup.localToWorld(new U(r.x,r.y,r.z)),o=this.draining?Md(t.x[s]-300,t.vx[s],Math.max(180,t.vy[s]),this.bend,this.pitch):{x:t.vx[s],y:-t.vy[s],z:Math.min(-15,t.vz[s])},l=new U(o.x,o.y,o.z).applyQuaternion(this.paperGroup.quaternion);this.spills.push({x:a.x,y:a.y,z:a.z,vx:l.x,vy:l.y,vz:l.z,seed:t.seed[s],color:n}),t.state[s]=3,t.lost++}}beginCleanup(){this.draining=!0,this.collectedCount=0,this.collected.count=0,this.trayBins.fill(0)}updateCollector(t,e){this.draining=t==="shake",this.boxMotion=Math.max(0,Math.min(1,this.boxMotion+(this.draining?1:-1)*e*2.8)),this.boxGroup.visible=this.boxMotion>0,this.boxGroup.position.y=Je.centerY-(1-yn(this.boxMotion))*360,this.collectorBox={...Je,centerY:this.boxGroup.position.y};for(let n=0;n<2;n++){let s=this.hands[n];s.visible=this.draining;let r=n?300:-300,a=Fs(r,0,5,this.bend,this.pitch);s.position.set(a.x+(n?8:-8),a.y,a.z),s.rotation.y=(n?-1:1)*this.bend*.7}}catchGrain(t){if(this.collectedCount>=3e4)return;let e=Math.max(0,Math.min(27,Math.floor((t.x+Je.halfWidth)/(Je.halfWidth*2)*28))),n=Math.max(0,Math.min(21,Math.floor((t.y-this.collectorBox.centerY+Je.halfDepth)/(Je.halfDepth*2)*22))),s=n*28+e,r=this.trayBins[s]*.32;for(let f=-3;f<=3;f++)for(let u=-3;u<=3;u++){let d=e+u,g=n+f;if(d<0||d>=28||g<0||g>=22)continue;let v=g*28+d,m=this.trayBins[v]*.32+Math.hypot(u,f)*1.3;m<r&&(s=v,r=m)}let a=this.trayBins[s],o=(s%28+.2+t.seed*31%1*.6)/28*Je.halfWidth*2-Je.halfWidth,l=(Math.floor(s/28)+.2+t.seed*47%1*.6)/22*Je.halfDepth*2-Je.halfDepth,c=this.spillObject;c.position.set(o,l,Je.bottom+Math.min(42,a*.32)),c.rotation.set(.05,.03,t.seed*79),c.scale.set(2.1,2.1,.65),c.updateMatrix();let h=this.collectedCount++;this.collected.setMatrixAt(h,c.matrix),this.collected.setColorAt(h,t.color),this.collected.geometry.attributes.flakeSeed.setX(h,t.seed),this.trayBins[s]++}updateSpill(t){let e=0,n=this.spillObject,s=new U;for(let r of this.spills){if(Ed(r,t,this.boxMotion>.95?this.collectorBox:Rg)){this.catchGrain(r);continue}s.set(r.x,r.y,r.z).project(this.camera),!(s.y<-1.15||Math.abs(s.x)>1.3||s.z>1)&&(n.position.set(r.x,r.y,r.z),n.rotation.set(.2,.1,r.seed*79),n.scale.setScalar(1.8+r.seed),n.updateMatrix(),this.spill.setMatrixAt(e,n.matrix),this.spill.setColorAt(e,r.color),this.spills[e++]=r)}this.spills.length=e,this.spill.count=e,this.spill.instanceMatrix.needsUpdate=!0,this.spill.instanceColor.needsUpdate=!0,this.collected.count=this.collectedCount,this.collected.instanceMatrix.needsUpdate=!0,this.collected.instanceColor.needsUpdate=!0,this.collected.geometry.attributes.flakeSeed.needsUpdate=!0}reset(){this.savedCount=0,this.current.count=0,this.spills.length=0,this.spill.count=0,this.currentInitialized=0,this.collectedCount=0,this.collected.count=0,this.boxMotion=0,this.boxGroup.visible=!1,this.updateBend(0)}setPeelPiece(t,e){this.peelPiece=e,this.peelAnchor=e.grip;let{w:n,h:s}=e.bounds,r=this.settings.profile==="economy"?14:10;this.peelSegments={x:Math.max(4,Math.ceil(n/r)),y:Math.max(4,Math.ceil(s/r))},this.peelGeo.dispose(),this.peelGeo=new _n(n,s,this.peelSegments.x,this.peelSegments.y),this.peelSheet.geometry=this.peelGeo,this.peelSheet.material.map?.dispose(),this.peelSheet.material.map=new gi(t),this.peelSheet.material.map.colorSpace=Ie,this.peelSheet.material.color.set("#ffffff"),this.peelSheet.material.needsUpdate=!0,this.peelProgress(0)}peelProgress(t){if(this.peelValue=t,!this.peelPiece)return;this.peelSheet.visible=t>.12&&t<1;let e=this.peelGeo.attributes.position,{x:n,y:s}=this.peelSegments,r=this.peelPiece.bounds;for(let a=0;a<=s;a++)for(let o=0;o<=n;o++){let l=Vc(this.peelPiece,r.x+o/n*r.w,r.y+a/s*r.h,t);e.setXYZ(a*(n+1)+o,l.x,l.y,l.z)}e.needsUpdate=!0,this.peelGeo.computeVertexNormals()}paperChanged(){this.paperTexture.needsUpdate=!0}render(t,{time:e,dt:n,phase:s,down:r,pointer:a,peeled:o,pour:l,shakeProgress:c=0,finished:h=!1}){this.time=e;let f=Ko(c);this.updateBend(f.bend,f.pitch),this.updateCollector(s,n),this.coatUniforms.uTime.value=e*.001,this.updateGrains(t),this.updateSpill(n);let u=this.settings.relief&&!h&&s!=="shake"&&t.freshCount>0;if(this.heap.visible=u,u&&this.updateHeap(t,n),this.settings.movingLight&&(this.key.position.x+=(-300+(a.x-300)*.4+Math.sin(e*23e-5)*50-this.key.position.x)*.045,this.key.position.y+=(340-(a.y-400)*.25-this.key.position.y)*.045),this.sparkLight.set(this.key.position.x*.0015,this.key.position.y*.0015,1).normalize(),this.paperGroup.rotation.x=0,this.paperGroup.position.z=0,this.paperGroup.updateMatrixWorld(!0),this.brush.visible=s==="brush"&&a.visible&&!h,this.tweezers.visible=s==="rolling",this.hint.visible=s==="peel",s==="peel"&&(this.hint.position.set(this.peelAnchor.x-300,400-this.peelAnchor.y,12),this.hint.material.opacity=.65+.25*Math.sin(e*.004)),s==="rolling"&&this.peelPiece){let p=this.peelValue||0,M=Vc(this.peelPiece,this.peelAnchor.x,this.peelAnchor.y,p),A=1-yn(p/.17),b=Math.atan2(-this.peelPiece.axis.y,this.peelPiece.axis.x)-Math.PI/2;this.tweezers.position.lerp(new U(M.x+Math.sin(b)*4+A*110,M.y-Math.cos(b)*4+A*90,M.z-35+A*110),Math.min(1,n*18)),this.tweezers.rotation.z=b}let d=Math.min(1,n*35);this.brushPoint.x+=(a.x-this.brushPoint.x)*d,this.brushPoint.y+=(a.y-this.brushPoint.y)*d;let g=t.cell(a.x,a.y),v=g<0?0:t.height[g];this.brush.position.set(this.brushPoint.x-300,400-this.brushPoint.y,r?3+Math.min(v*.2,14):35),this.brush.rotation.z=.65,this.tuft.scale.set(1+(r?.08:0),r?.83:1,1),this.bristles.scale.y=r?1.14:1,this.posePour(l);let m=this.settings.sparkles&&!h?Math.min(t.count,28):0;for(let p=0;p<28;p++){let M=this.glints[p],A=t.count?Math.floor((p*7919+3571)%t.count):0;if(p>=m||t.state[A]===3||t.state[A]===0){M.visible=!1;continue}let b=Math.pow(Math.max(0,Math.sin(e*.0015+t.seed[A]*300+this.sparkLight.x*8+this.sparkLight.y*5)),28),E=t.cell(t.x[A],t.y[A]);if(b<.1||t.state[A]===1&&E>=0&&t.z[A]<t.height[E]*.73){M.visible=!1;continue}M.visible=!0,M.position.set(t.x[A]-300,400-t.y[A],t.z[A]+4),M.scale.setScalar(8+b*7),M.material.opacity=b*.8}this.renderer.render(this.scene,this.camera)}capture(){return this.renderer.render(this.scene,this.camera),this.canvas.toDataURL("image/png")}};var Pd="sim-atelier-v4",Id={economy:{renderScale:.65,shadow:"off",sparkles:!1,reflections:!1,relief:!1,movingLight:!1,frameLimit:30},balanced:{renderScale:.85,shadow:"off",sparkles:!0,reflections:!0,relief:!0,movingLight:!0,frameLimit:60},quality:{renderScale:1.2,shadow:"high",sparkles:!0,reflections:!0,relief:!0,movingLight:!0,frameLimit:60}},Lg={layout:"flow",autoAdvance:!0,showStats:!0,profile:"balanced",...Id.balanced,pourAmount:1,pace:"fast"};function sl(i={}){let t={...Lg};for(let e of["autoAdvance","showStats","sparkles","reflections","relief","movingLight"])typeof i[e]=="boolean"&&(t[e]=i[e]);for(let[e,n]of Object.entries({layout:["flow","edge","dock"],shadow:["off","low","medium","high"],frameLimit:[30,45,60],pace:["fast","relaxed"],profile:["economy","balanced","quality","custom"]}))n.includes(i[e])&&(t[e]=i[e]);for(let[e,n,s]of[["renderScale",.5,1.5],["pourAmount",.75,1.75]])typeof i[e]=="number"&&Number.isFinite(i[e])&&(t[e]=Math.max(n,Math.min(s,i[e])));return t}function Wc(i){try{return sl(JSON.parse(i.getItem(Pd)||"{}"))}catch{return sl()}}function Ld(i,t){try{i.setItem(Pd,JSON.stringify(sl(t)))}catch{}}function Dd(i,t){return sl({...i,...Id[t],profile:t})}function Xc(i,t,e){return Math.min(e,Math.ceil(Math.max(360,Math.min(14500,i*1.6+180))*t.pourAmount))}var rl=(i,t,e)=>Math.max(t,Math.min(e,i));function Nd(i,t){let e=t<300,n=e?80:65;return{target:{...i},anchor:{x:rl(i.x,32,568),y:rl(i.y-n,35,700)},fan:e?38:65,sway:e?10:18}}function Ud(i,t=0){return{x:rl(i.anchor.x+Math.sin(t*Math.PI*3)*i.sway,20,580),y:rl(i.anchor.y+Math.sin(t*Math.PI*2)*5,20,740)}}function qc(i,t="fast"){let e=Number.isFinite(i)?Math.max(0,Math.min(1,i)):0,n=e>=(t==="relaxed"?.98:.95);return{ready:n,percent:n?100:Math.min(99,Math.round(e*100))}}function Fd(i,t){let e=new URLSearchParams(i).get("devam");if(!e||!/^\d+$/.test(e))return 0;let n=Number(e);return Number.isSafeInteger(n)&&n>=1&&n<=t?n-1:0}var Me=[{id:"black",name:"Gece siyah\u0131",color:"#10121a",pour:{x:171,y:279},area:86834},{id:"blue",name:"Gotham mavisi",color:"#173bc9",pour:{x:396,y:390},area:11734},{id:"mouth",name:"Bordo g\xFCl\xFC\u015F",color:"#91283b",pour:{x:312,y:420},area:595},{id:"green",name:"Z\xFCmr\xFCt sa\xE7",color:"#0c643b",pour:{x:334,y:314},area:1082},{id:"silver",name:"G\xFCm\xFC\u015F sa\xE7",color:"#dfe1e4",pour:{x:323,y:287},area:2830},{id:"skin",name:"S\u0131cak ten",color:"#f2d0a5",pour:{x:323,y:378},area:24554},{id:"gold",name:"Alt\u0131n yelek",color:"#c89b2b",pour:{x:300,y:479},area:19887},{id:"tie",name:"Gece laciverdi",color:"#434c79",pour:{x:356,y:523},area:5527},{id:"purple",name:"Kadife moru",color:"#78389b",pour:{x:445,y:519},area:49199},{id:"pink",name:"Pembe \xE7i\xE7ek",color:"#e36b9c",pour:{x:238,y:522},area:2282},{id:"background",name:"K\u0131rm\u0131z\u0131 final",color:"#ed252d",pour:{x:480,y:119},area:275476}];function Od(i,t,e=600,n=800){i.fillStyle=t,i.fillRect(0,0,e,n);for(let s=0;s<12e4;s++){let r=Math.random()*e,a=Math.random()*n,o=Math.random();i.fillStyle=o>.975?"#fff8dfb0":o>.4?"#ffffff1c":"#00000024",i.fillRect(r,a,.7+Math.random()*.7,.7+Math.random()*.7)}}var Bd={black:[{id:"black-0",area:780,bounds:{x:268,y:298,w:50,h:32},grip:{x:303.5,y:298.5},axis:{x:-.575176751990256,y:.8180291583861418},length:46,duration:2.14,runs:[[0,19,17],[1,19,18],[2,18,19],[3,17,19],[4,17,19],[5,18,22],[6,19,24],[7,19,25],[8,21,25],[9,22,26],[10,22,27],[11,21,28],[12,20,30],[13,19,31],[14,17,33],[15,16,33],[16,15,33],[17,14,33],[18,12,32],[19,11,31],[20,9,30],[21,8,28],[22,6,28],[23,3,29],[24,3,26],[25,2,25],[26,1,23],[27,1,20],[28,0,18],[29,0,16],[30,1,11],[31,3,1]]},{id:"black-1",area:502,bounds:{x:297,y:320,w:34,h:23},grip:{x:326.5,y:320.5},axis:{x:-.5538645252024298,y:.8326068025918879},length:27,duration:2.12,runs:[[0,20,10],[1,16,15],[2,12,19],[3,8,23],[4,3,28],[5,3,28],[6,2,29],[7,1,30],[8,0,30],[9,1,28],[10,2,27],[11,3,26],[12,3,29],[13,6,28],[14,8,25],[15,10,23],[16,11,21],[17,12,19],[18,13,18],[19,14,16],[20,15,13],[21,15,10],[22,16,7]]},{id:"black-2",area:84886,bounds:{x:64,y:54,w:399,h:637},grip:{x:353.5,y:69.5},axis:{x:-.2712968701237396,y:.962495718567653},length:677,duration:2.99,runs:[[0,231,1],[1,230,4],[2,228,7],[3,227,8],[4,226,10],[5,226,10],[6,225,11],[7,225,11],[8,224,13],[9,224,13],[10,224,13],[11,223,14],[12,223,15],[13,222,16],[14,222,16],[15,221,17],[15,289,1],[16,221,17],[16,288,3],[17,220,18],[17,286,6],[18,220,19],[18,286,7],[19,220,19],[19,286,7],[20,219,21],[20,286,7],[21,219,21],[21,285,8],[22,218,22],[22,285,8],[23,218,22],[23,285,8],[24,217,24],[24,284,9],[25,217,23],[25,284,9],[26,216,23],[26,284,9],[27,216,22],[27,283,10],[28,216,21],[28,283,11],[29,215,21],[29,283,11],[30,215,21],[30,282,12],[31,214,22],[31,281,13],[32,214,22],[32,277,17],[33,213,22],[33,276,18],[34,213,22],[34,276,18],[35,212,23],[35,259,2],[35,277,17],[36,212,23],[36,259,3],[36,277,17],[37,212,23],[37,249,13],[37,278,16],[38,211,24],[38,245,25],[38,278,17],[39,211,24],[39,242,34],[39,279,16],[40,210,25],[40,238,57],[41,210,25],[41,237,58],[42,209,86],[43,209,86],[44,208,87],[45,208,87],[46,208,87],[47,207,88],[48,207,89],[49,206,90],[50,206,90],[51,205,91],[52,205,91],[53,204,92],[54,204,92],[55,204,92],[56,203,93],[57,203,93],[58,202,95],[59,202,95],[60,201,96],[61,201,96],[62,200,97],[63,200,97],[64,200,97],[65,199,98],[66,199,98],[67,198,99],[68,198,100],[69,197,101],[70,197,101],[71,196,102],[72,196,36],[72,234,64],[73,196,36],[73,236,62],[74,195,38],[74,237,61],[75,195,38],[75,238,60],[76,194,39],[76,239,59],[77,194,40],[77,241,57],[78,193,41],[78,242,57],[79,193,42],[79,244,55],[80,192,44],[80,245,54],[81,192,44],[81,246,53],[82,192,45],[82,247,52],[83,191,46],[83,248,51],[84,191,47],[84,250,49],[85,190,48],[85,252,47],[86,190,49],[86,253,46],[87,189,29],[87,222,18],[87,253,45],[88,189,28],[88,224,16],[88,252,46],[89,188,29],[89,225,17],[89,249,49],[90,188,29],[90,227,59],[90,290,8],[91,188,28],[91,229,53],[91,291,6],[92,187,29],[92,231,48],[92,292,4],[93,187,29],[93,232,41],[93,288,7],[94,186,29],[94,236,37],[94,286,8],[95,186,29],[95,237,36],[95,283,11],[96,185,29],[96,238,36],[96,281,13],[97,185,29],[97,238,37],[97,279,15],[98,184,30],[98,239,55],[99,184,29],[99,241,53],[100,183,30],[100,242,52],[101,181,31],[101,243,51],[102,180,32],[102,244,49],[103,179,33],[103,246,47],[104,177,34],[104,247,46],[105,176,35],[105,248,45],[106,175,35],[106,249,43],[107,173,37],[107,250,31],[107,286,6],[108,172,37],[108,252,26],[108,287,4],[109,171,38],[109,253,21],[109,288,3],[110,170,39],[110,254,18],[110,289,1],[111,169,39],[111,255,14],[112,168,40],[112,256,10],[113,167,41],[113,257,7],[114,166,41],[115,165,42],[116,164,42],[117,162,44],[118,161,45],[119,160,45],[120,159,45],[121,157,47],[122,155,49],[123,154,50],[124,153,51],[125,152,52],[126,151,53],[127,149,55],[128,147,57],[129,145,60],[130,143,63],[131,142,64],[132,141,66],[133,139,69],[134,137,72],[135,135,75],[136,132,79],[137,130,83],[137,278,3],[138,128,88],[138,277,5],[139,125,92],[139,276,6],[140,123,95],[140,274,10],[141,121,98],[141,273,12],[142,119,101],[142,272,15],[143,116,105],[143,271,19],[144,114,109],[144,271,21],[145,112,113],[145,271,24],[146,110,118],[146,271,27],[147,108,125],[147,270,30],[148,105,132],[148,270,32],[149,103,139],[149,270,35],[150,101,147],[150,269,39],[151,99,158],[151,269,41],[152,97,216],[153,94,221],[154,92,226],[155,90,230],[156,88,235],[157,85,240],[158,83,245],[159,81,249],[160,79,254],[161,77,258],[162,74,263],[163,72,268],[164,70,272],[165,68,277],[166,65,281],[167,63,286],[168,61,290],[169,59,293],[170,57,296],[171,55,299],[172,54,301],[173,54,302],[174,53,303],[175,52,305],[176,51,307],[177,51,308],[178,50,309],[179,49,185],[179,236,124],[180,48,185],[180,238,122],[181,48,185],[181,239,122],[182,47,185],[182,239,123],[183,46,186],[183,239,124],[184,45,186],[184,240,124],[185,45,185],[185,243,121],[186,44,184],[186,244,121],[187,43,185],[187,244,121],[188,42,185],[188,246,120],[189,42,184],[189,246,120],[190,41,185],[190,247,120],[191,40,185],[191,248,119],[192,39,185],[192,233,2],[192,240,3],[192,249,119],[193,39,184],[193,232,11],[193,250,118],[194,39,184],[194,232,12],[194,251,117],[195,38,184],[195,232,12],[195,252,116],[196,37,185],[196,231,13],[196,253,116],[197,37,185],[197,231,13],[197,253,116],[198,37,185],[198,231,14],[198,253,116],[199,36,187],[199,231,14],[199,252,117],[200,36,191],[200,230,15],[200,250,119],[201,35,334],[202,35,334],[203,34,336],[204,34,336],[205,33,337],[206,33,337],[207,33,337],[208,32,339],[209,32,169],[209,203,168],[210,31,169],[210,202,75],[210,278,93],[211,31,168],[211,202,75],[211,279,92],[212,31,168],[212,201,77],[212,280,91],[213,31,167],[213,201,77],[213,281,90],[214,31,166],[214,200,79],[214,282,89],[215,31,166],[215,200,80],[215,283,88],[216,31,165],[216,199,18],[216,221,39],[216,265,16],[216,284,88],[217,30,165],[217,199,16],[217,222,37],[217,266,15],[217,285,87],[218,30,164],[218,198,16],[218,223,36],[218,267,15],[218,285,87],[219,30,164],[219,198,16],[219,224,34],[219,267,15],[219,286,86],[220,30,163],[220,198,16],[220,226,2],[220,234,14],[220,255,2],[220,268,15],[220,287,85],[221,30,163],[221,197,17],[221,236,11],[221,268,16],[221,288,84],[222,30,162],[222,197,17],[222,237,9],[222,268,16],[222,289,83],[223,30,161],[223,196,12],[223,238,7],[223,268,17],[223,290,82],[224,30,161],[224,196,12],[224,240,4],[224,272,13],[224,291,82],[225,30,160],[225,195,12],[225,272,14],[225,292,81],[226,30,159],[226,195,12],[226,272,15],[226,292,81],[227,30,159],[227,195,11],[227,272,15],[227,293,80],[228,30,158],[228,195,11],[228,274,14],[228,294,79],[229,29,159],[229,194,12],[229,275,14],[229,295,78],[230,29,158],[230,194,12],[230,275,14],[230,295,78],[231,29,157],[231,193,12],[231,275,15],[231,296,77],[232,29,156],[232,193,12],[232,276,14],[232,297,77],[233,29,156],[233,193,12],[233,276,15],[233,298,76],[234,29,155],[234,192,12],[234,277,14],[234,299,75],[235,28,156],[235,192,12],[235,277,15],[235,300,74],[236,28,155],[236,192,12],[236,278,14],[236,300,74],[237,28,154],[237,191,12],[237,278,15],[237,301,73],[238,28,154],[238,191,12],[238,279,14],[238,302,72],[239,28,153],[239,190,12],[239,279,15],[239,302,73],[240,28,152],[240,190,12],[240,280,15],[240,303,72],[241,28,151],[241,190,12],[241,280,16],[241,304,71],[242,28,151],[242,189,12],[242,281,15],[242,305,70],[243,28,151],[243,189,12],[243,281,15],[243,305,70],[244,28,150],[244,189,12],[244,282,14],[244,306,69],[245,27,150],[245,188,13],[245,282,15],[245,307,68],[246,27,150],[246,188,12],[246,282,15],[246,308,68],[247,27,149],[247,188,12],[247,283,15],[247,308,68],[248,27,149],[248,187,13],[248,283,15],[248,309,67],[249,27,148],[249,187,12],[249,284,15],[249,310,66],[250,27,148],[250,187,12],[250,284,15],[250,311,65],[251,27,147],[251,187,12],[251,284,15],[251,311,65],[252,27,146],[252,186,12],[252,285,15],[252,312,64],[253,27,146],[253,186,12],[253,285,16],[253,312,64],[254,27,145],[254,186,12],[254,286,15],[254,313,63],[255,27,145],[255,185,13],[255,286,15],[255,314,62],[256,27,144],[256,185,12],[256,286,16],[256,314,62],[257,27,144],[257,185,12],[257,287,15],[257,315,62],[258,27,143],[258,185,12],[258,287,15],[258,316,61],[259,27,142],[259,184,12],[259,287,16],[259,316,61],[260,26,143],[260,184,12],[260,288,15],[260,317,60],[261,26,143],[261,184,11],[261,288,16],[261,317,60],[262,26,142],[262,183,12],[262,288,16],[262,318,59],[263,26,142],[263,183,12],[263,289,15],[263,318,59],[264,26,141],[264,183,12],[264,289,16],[264,319,58],[265,26,141],[265,183,12],[265,289,16],[265,320,57],[266,26,140],[266,182,12],[266,288,17],[266,320,57],[267,25,141],[267,182,12],[267,287,18],[267,321,56],[268,25,140],[268,182,11],[268,286,20],[268,321,57],[269,25,140],[269,181,12],[269,284,22],[269,321,57],[270,25,140],[270,181,12],[270,283,24],[270,322,56],[271,25,139],[271,181,11],[271,283,33],[271,323,55],[272,25,139],[272,181,11],[272,284,31],[272,323,55],[273,25,138],[273,180,14],[273,285,30],[273,323,55],[274,25,138],[274,180,15],[274,286,29],[274,324,54],[275,25,137],[275,180,16],[275,288,27],[275,324,55],[276,25,137],[276,180,16],[276,290,27],[276,325,54],[277,25,137],[277,179,16],[277,290,27],[277,325,54],[278,25,136],[278,177,18],[278,290,27],[278,326,53],[279,25,135],[279,174,21],[279,289,28],[279,326,53],[280,24,136],[280,173,24],[280,289,27],[280,327,52],[281,24,135],[281,173,25],[281,289,27],[281,327,52],[282,24,135],[282,173,26],[282,289,26],[282,328,52],[283,24,135],[283,174,25],[283,290,24],[283,328,52],[284,24,134],[284,174,25],[284,209,3],[284,290,22],[284,328,52],[285,24,134],[285,174,24],[285,206,6],[285,290,20],[285,329,51],[286,24,133],[286,173,25],[286,203,9],[286,291,19],[286,329,51],[287,24,133],[287,173,24],[287,201,11],[287,291,20],[287,330,50],[288,24,133],[288,173,23],[288,200,12],[288,291,20],[288,330,50],[289,24,132],[289,173,22],[289,198,13],[289,291,21],[289,330,50],[290,23,133],[290,174,21],[290,198,13],[290,291,21],[290,331,49],[291,23,132],[291,175,19],[291,196,15],[291,292,20],[291,331,49],[292,23,132],[292,176,17],[292,195,16],[292,292,21],[292,332,48],[293,23,131],[293,175,18],[293,194,17],[293,292,21],[293,332,48],[294,23,131],[294,175,36],[294,292,21],[294,332,48],[295,23,131],[295,175,35],[295,292,21],[295,333,48],[296,23,130],[296,174,36],[296,292,22],[296,333,48],[297,23,130],[297,174,36],[297,291,23],[297,334,47],[298,23,130],[298,174,36],[298,291,23],[298,334,47],[299,23,129],[299,174,12],[299,190,20],[299,291,23],[299,334,47],[300,23,129],[300,173,13],[300,191,19],[300,292,23],[300,335,46],[301,23,128],[301,173,13],[301,191,19],[301,292,23],[301,335,46],[302,23,128],[302,173,13],[302,192,18],[302,292,23],[302,336,46],[303,23,128],[303,173,13],[303,192,18],[303,292,23],[303,336,46],[304,22,128],[304,173,12],[304,193,17],[304,292,23],[304,336,46],[305,22,128],[305,172,13],[305,193,17],[305,293,22],[305,337,45],[306,22,127],[306,172,12],[306,195,17],[306,293,23],[306,337,45],[307,22,127],[307,172,12],[307,196,17],[307,293,23],[307,337,45],[308,22,127],[308,172,12],[308,197,16],[308,293,23],[308,338,44],[309,22,126],[309,171,13],[309,197,16],[309,295,4],[309,303,13],[309,338,44],[310,22,126],[310,171,13],[310,198,15],[310,296,1],[310,303,13],[310,338,45],[311,22,113],[311,136,12],[311,171,13],[311,199,14],[311,304,13],[311,339,44],[312,22,113],[312,136,11],[312,171,13],[312,199,14],[312,304,13],[312,339,44],[313,22,112],[313,136,11],[313,170,13],[313,200,13],[313,304,13],[313,339,44],[314,22,112],[314,136,11],[314,170,13],[314,201,12],[314,303,14],[314,340,43],[315,22,111],[315,136,10],[315,170,13],[315,201,12],[315,303,14],[315,340,13],[315,354,29],[316,21,112],[316,135,11],[316,170,13],[316,201,12],[316,304,13],[316,340,13],[316,354,29],[317,21,111],[317,135,10],[317,169,13],[317,201,12],[317,304,13],[317,341,12],[317,354,29],[318,21,111],[318,135,10],[318,169,13],[318,201,12],[318,304,13],[318,341,12],[318,355,29],[319,21,111],[319,135,10],[319,169,13],[319,202,11],[319,304,13],[319,341,12],[319,355,29],[320,21,110],[320,134,10],[320,169,13],[320,204,9],[320,304,13],[320,342,11],[320,356,28],[321,21,110],[321,134,10],[321,168,14],[321,205,7],[321,304,14],[321,342,11],[321,356,28],[322,21,109],[322,134,10],[322,168,14],[322,208,4],[322,304,14],[322,342,12],[322,356,28],[323,21,109],[323,134,9],[323,168,13],[323,304,14],[323,343,11],[323,357,27],[324,21,108],[324,133,10],[324,168,13],[324,304,14],[324,343,11],[324,357,27],[325,21,108],[325,133,10],[325,168,13],[325,304,14],[325,343,11],[325,357,28],[326,21,107],[326,133,9],[326,167,14],[326,304,14],[326,344,10],[326,357,28],[327,21,107],[327,133,9],[327,167,14],[327,304,14],[327,344,10],[327,358,27],[328,21,107],[328,132,10],[328,167,13],[328,304,14],[328,344,10],[328,358,27],[329,20,107],[329,132,9],[329,167,13],[329,303,16],[329,344,10],[329,358,27],[330,20,107],[330,132,9],[330,166,14],[330,303,16],[330,345,10],[330,359,26],[331,20,106],[331,132,8],[331,166,14],[331,303,16],[331,345,10],[331,359,26],[332,20,106],[332,132,8],[332,166,14],[332,303,16],[332,345,10],[332,359,27],[333,20,106],[333,132,8],[333,166,14],[333,303,16],[333,346,9],[333,360,26],[334,20,105],[334,132,8],[334,166,14],[334,303,16],[334,346,9],[334,360,26],[335,20,105],[335,132,7],[335,166,14],[335,299,2],[335,302,17],[335,346,9],[335,360,26],[336,20,105],[336,132,6],[336,165,14],[336,299,20],[336,346,9],[336,360,26],[337,20,104],[337,133,3],[337,165,14],[337,300,19],[337,347,8],[337,361,25],[338,20,104],[338,134,1],[338,165,14],[338,300,19],[338,347,8],[338,361,25],[339,20,104],[339,165,14],[339,300,20],[339,347,8],[339,361,26],[340,20,103],[340,165,14],[340,300,20],[340,347,8],[340,361,26],[341,19,104],[341,165,14],[341,300,20],[341,349,5],[341,362,25],[342,19,103],[342,165,13],[342,300,20],[342,350,4],[342,362,25],[343,19,103],[343,164,14],[343,300,20],[343,351,2],[343,362,25],[344,19,103],[344,164,14],[344,300,20],[344,362,25],[345,19,102],[345,164,14],[345,300,20],[345,363,24],[346,19,102],[346,164,14],[346,300,20],[346,363,25],[347,19,102],[347,164,14],[347,300,20],[347,363,25],[348,19,101],[348,164,14],[348,301,19],[348,364,24],[349,19,101],[349,163,15],[349,301,19],[349,364,24],[350,19,101],[350,163,15],[350,301,19],[350,364,24],[351,19,100],[351,163,15],[351,301,19],[351,364,24],[352,19,100],[352,163,15],[352,301,19],[352,365,23],[353,19,100],[353,163,14],[353,301,19],[353,365,24],[354,19,99],[354,163,14],[354,301,19],[354,365,24],[355,19,99],[355,163,14],[355,301,19],[355,365,24],[356,18,100],[356,163,14],[356,301,20],[356,366,23],[357,18,100],[357,163,14],[357,300,21],[357,366,23],[358,18,99],[358,162,15],[358,300,21],[358,366,23],[359,18,99],[359,162,15],[359,299,22],[359,366,24],[360,18,98],[360,162,15],[360,299,22],[360,367,23],[361,18,98],[361,162,15],[361,298,23],[361,367,23],[362,18,98],[362,162,15],[362,298,23],[362,367,23],[363,18,98],[363,162,14],[363,297,24],[363,367,23],[364,18,97],[364,162,14],[364,297,23],[364,367,23],[365,18,97],[365,162,14],[365,296,24],[365,368,23],[366,18,97],[366,161,15],[366,296,24],[366,368,23],[367,18,97],[367,161,15],[367,296,24],[367,368,23],[368,18,96],[368,161,15],[368,295,25],[368,368,23],[369,18,96],[369,161,15],[369,295,25],[369,368,23],[370,17,97],[370,161,15],[370,295,25],[370,369,22],[371,17,97],[371,161,15],[371,295,25],[371,369,23],[372,17,96],[372,161,15],[372,294,26],[372,369,23],[373,17,96],[373,161,15],[373,294,26],[373,369,23],[374,17,96],[374,161,15],[374,294,26],[374,370,22],[375,17,96],[375,161,15],[375,294,26],[375,370,23],[376,17,96],[376,161,15],[376,294,26],[376,370,23],[377,17,95],[377,160,16],[377,294,26],[377,370,23],[378,17,95],[378,160,16],[378,294,26],[378,370,23],[379,17,95],[379,160,16],[379,294,25],[379,370,23],[380,17,95],[380,160,16],[380,294,25],[380,371,22],[381,17,94],[381,160,16],[381,294,25],[381,371,22],[382,17,94],[382,160,15],[382,294,25],[382,371,23],[383,17,94],[383,160,15],[383,294,25],[383,371,23],[384,17,94],[384,160,15],[384,294,7],[384,304,15],[384,372,22],[385,17,94],[385,160,15],[385,294,6],[385,305,14],[385,372,22],[386,17,93],[386,160,15],[386,294,5],[386,307,12],[386,372,22],[387,17,93],[387,160,15],[387,294,4],[387,309,10],[387,372,22],[388,17,93],[388,160,15],[388,311,8],[388,373,22],[389,17,93],[389,159,16],[389,317,2],[389,373,22],[390,17,93],[390,159,16],[390,373,22],[391,17,92],[391,159,16],[391,373,22],[392,17,92],[392,159,16],[392,373,22],[393,16,93],[393,159,16],[393,373,23],[394,16,93],[394,159,16],[394,374,22],[395,16,93],[395,159,16],[395,374,22],[396,16,93],[396,159,15],[396,374,22],[397,16,92],[397,159,15],[397,374,22],[398,16,92],[398,159,15],[398,374,23],[399,16,92],[399,159,15],[399,375,22],[400,16,92],[400,159,15],[400,375,22],[401,16,92],[401,159,15],[401,375,22],[402,16,92],[402,159,15],[402,375,23],[403,16,91],[403,159,15],[403,376,22],[404,16,91],[404,159,15],[404,376,22],[405,16,91],[405,158,16],[405,376,22],[406,16,91],[406,158,16],[406,376,22],[407,16,91],[407,158,16],[407,375,23],[408,16,90],[408,158,17],[408,374,24],[409,16,90],[409,158,15],[409,375,24],[410,16,90],[410,158,14],[410,376,23],[411,16,90],[411,158,12],[411,377,22],[412,16,90],[412,158,10],[412,381,18],[413,16,89],[413,158,7],[413,385,14],[414,16,89],[414,158,2],[414,388,11],[415,16,89],[416,16,89],[417,16,89],[418,16,89],[419,16,89],[420,16,88],[421,16,88],[422,16,88],[423,15,89],[424,15,89],[425,15,89],[426,15,89],[427,15,89],[428,15,88],[429,15,88],[430,15,88],[431,15,88],[432,15,88],[433,15,88],[434,15,88],[435,15,88],[436,15,88],[437,15,89],[438,15,89],[439,15,87],[440,15,86],[441,15,84],[442,15,82],[443,15,79],[444,15,77],[445,15,74],[446,15,71],[447,15,69],[448,15,69],[449,15,69],[450,15,68],[451,15,65],[452,15,65],[453,14,65],[454,14,65],[455,14,65],[456,14,64],[457,14,64],[458,14,64],[459,14,64],[460,14,63],[461,14,63],[462,14,63],[463,14,62],[464,15,61],[465,15,61],[466,15,61],[467,15,61],[468,14,61],[469,14,61],[470,14,61],[471,14,61],[472,14,61],[473,14,61],[474,14,60],[475,14,60],[476,14,60],[477,14,60],[478,14,60],[479,14,60],[480,14,59],[481,14,59],[482,14,59],[483,14,59],[484,14,59],[485,14,59],[486,14,58],[487,14,58],[488,14,58],[489,14,58],[490,14,58],[491,14,58],[492,14,58],[493,14,58],[494,14,58],[495,14,57],[496,14,57],[497,13,58],[498,13,58],[499,13,58],[500,13,58],[501,13,58],[502,13,58],[503,13,58],[504,13,58],[505,13,58],[506,13,58],[507,13,58],[508,13,58],[509,13,57],[510,13,57],[511,13,57],[512,13,57],[513,13,57],[514,13,57],[515,13,57],[516,13,57],[517,12,58],[518,12,58],[519,12,58],[520,12,58],[521,12,58],[522,12,58],[523,12,58],[524,12,58],[525,12,58],[526,12,58],[527,12,58],[528,12,58],[529,12,59],[530,12,59],[531,12,59],[532,12,59],[533,12,59],[534,12,59],[535,12,59],[536,12,59],[537,12,59],[538,12,59],[539,11,60],[540,11,60],[541,11,60],[542,11,60],[543,11,60],[544,11,60],[545,11,60],[546,11,60],[547,11,60],[548,11,60],[549,11,60],[550,10,61],[551,10,61],[552,10,62],[553,10,62],[554,10,62],[555,10,62],[556,10,62],[557,10,62],[558,10,62],[559,9,63],[560,9,63],[561,9,63],[562,9,63],[563,9,63],[564,9,64],[565,9,64],[566,9,64],[567,9,64],[568,9,64],[569,9,64],[570,9,64],[571,9,64],[572,8,65],[573,8,65],[574,8,65],[575,8,66],[576,8,66],[577,8,66],[578,8,66],[579,7,67],[580,7,67],[581,7,67],[582,7,67],[583,7,67],[584,7,67],[585,7,67],[586,7,67],[587,6,68],[588,6,69],[589,6,69],[590,6,69],[591,6,69],[592,6,69],[593,5,71],[594,5,71],[595,5,71],[596,5,71],[597,5,71],[598,5,71],[599,5,71],[600,5,72],[601,4,73],[602,4,73],[603,4,73],[604,4,73],[605,3,75],[606,3,75],[607,3,75],[608,3,75],[609,3,75],[610,3,76],[611,3,76],[612,3,76],[613,2,77],[614,2,77],[615,2,78],[616,2,78],[617,2,78],[618,1,79],[619,1,80],[620,1,80],[621,1,80],[622,1,80],[623,1,81],[624,1,81],[625,0,82],[626,0,83],[627,0,83],[628,0,83],[629,0,83],[630,0,84],[631,0,84],[632,0,85],[633,0,86],[634,0,87],[635,0,85],[636,1,33],[636,52,7]]},{id:"black-3",area:425,bounds:{x:434,y:658,w:28,h:28},grip:{x:449.5,y:658.5},axis:{x:-.41036467732879783,y:.9119215051751063},length:31,duration:2.12,runs:[[0,15,1],[1,14,3],[2,12,6],[3,11,7],[4,10,9],[5,10,9],[6,10,9],[7,9,10],[8,9,11],[9,9,11],[10,8,13],[11,8,13],[12,8,13],[13,8,14],[14,7,15],[15,7,15],[16,6,17],[17,6,17],[18,5,19],[19,4,21],[20,3,22],[21,3,23],[22,2,24],[23,2,25],[24,1,26],[25,1,27],[26,0,26],[27,3,19]]},{id:"black-4",area:241,bounds:{x:555,y:665,w:17,h:24},grip:{x:565.5,y:665.5},axis:{x:-.30369519581060417,y:.9527692417587581},length:26,duration:2.1,runs:[[0,9,2],[1,8,4],[2,6,8],[3,6,8],[4,6,9],[5,2,2],[5,5,11],[6,1,15],[7,1,16],[8,1,16],[9,1,16],[10,1,15],[11,1,14],[12,1,13],[13,1,13],[14,1,12],[15,1,11],[16,1,10],[17,1,9],[18,1,8],[19,0,8],[20,0,7],[21,0,6],[22,0,5],[23,0,3]]}],blue:[{id:"blue-0",area:396,bounds:{x:299,y:79,w:44,h:17},grip:{x:340.5,y:89.5},axis:{x:-.7587153665245263,y:.6514222843897448},length:37,duration:2.11,runs:[[0,5,2],[1,4,8],[2,3,16],[3,2,22],[4,1,26],[5,1,28],[6,1,33],[7,1,38],[8,0,40],[9,0,41],[10,0,24],[10,26,16],[11,0,24],[11,27,15],[12,0,14],[12,27,16],[13,0,10],[13,35,8],[14,0,7],[14,41,3],[15,0,3],[16,0,2]]},{id:"blue-1",area:4942,bounds:{x:341,y:264,w:99,h:198},grip:{x:341.5,y:264.5},axis:{x:-.21951219512195125,y:.9756097560975611},length:173,duration:2.28,runs:[[0,0,1],[1,0,2],[2,1,2],[3,1,3],[4,2,3],[5,3,3],[6,4,3],[7,4,4],[8,5,3],[9,5,4],[10,6,4],[11,7,4],[12,7,5],[13,8,5],[14,8,6],[15,9,6],[16,10,5],[17,10,6],[18,11,6],[19,12,6],[20,12,6],[21,13,6],[22,13,7],[23,14,7],[24,14,8],[25,15,8],[26,15,8],[27,16,8],[28,16,9],[29,17,8],[30,18,8],[31,19,8],[32,19,9],[33,19,9],[34,19,10],[35,20,10],[36,20,11],[37,21,10],[38,21,11],[39,22,11],[40,22,12],[41,22,12],[42,23,12],[43,24,11],[44,24,12],[45,24,13],[46,25,12],[47,25,13],[48,25,14],[49,26,13],[50,26,14],[51,27,13],[52,27,14],[53,27,14],[54,28,14],[55,28,15],[56,28,15],[57,28,16],[58,29,15],[59,29,15],[60,30,15],[61,39,7],[62,38,8],[63,38,8],[64,38,9],[65,38,9],[66,40,8],[67,40,8],[68,40,9],[69,40,9],[70,39,11],[71,39,11],[72,38,13],[73,37,14],[74,35,16],[75,33,19],[76,33,19],[77,34,19],[78,34,19],[79,35,18],[80,35,19],[81,35,19],[82,36,19],[83,36,19],[84,36,19],[85,36,20],[86,37,19],[87,37,20],[88,37,20],[89,37,20],[90,38,20],[91,38,20],[92,38,21],[93,38,21],[94,38,21],[95,38,22],[96,39,21],[97,39,21],[98,39,22],[99,39,22],[100,39,22],[101,40,22],[102,40,22],[103,40,22],[104,40,23],[105,40,23],[105,76,1],[106,40,23],[106,76,1],[107,40,24],[107,76,1],[108,40,24],[108,76,2],[109,40,24],[109,76,2],[110,40,25],[110,76,3],[111,41,24],[111,76,3],[112,41,24],[112,77,2],[113,41,25],[113,77,3],[114,41,25],[114,77,3],[115,41,25],[115,77,3],[116,41,26],[116,77,3],[117,41,26],[117,77,4],[118,41,26],[118,77,4],[119,42,25],[119,77,4],[120,42,26],[120,78,4],[121,42,26],[121,78,4],[122,42,26],[122,78,4],[123,42,27],[123,78,5],[124,42,27],[124,78,5],[125,42,27],[125,78,5],[126,42,27],[126,78,5],[127,42,28],[127,78,6],[128,42,28],[128,78,6],[129,43,27],[129,78,6],[130,43,27],[130,78,6],[131,43,29],[131,77,8],[132,43,30],[132,77,8],[133,43,31],[133,76,9],[134,43,42],[135,43,43],[136,43,43],[137,43,43],[138,43,44],[139,43,44],[140,43,44],[141,43,44],[142,43,45],[143,43,45],[144,43,45],[145,43,45],[146,44,45],[147,44,45],[148,44,45],[149,44,45],[150,44,46],[151,44,46],[152,44,46],[153,44,46],[154,43,47],[155,43,48],[156,43,48],[157,43,48],[158,43,48],[159,43,48],[160,43,49],[161,43,49],[162,43,49],[163,43,49],[164,43,50],[165,43,50],[166,43,50],[167,43,50],[168,43,50],[169,42,51],[170,42,52],[171,42,52],[172,42,52],[173,42,52],[174,42,53],[175,42,53],[176,42,53],[177,42,53],[178,42,54],[179,42,54],[180,44,52],[181,46,50],[182,47,49],[183,48,48],[184,49,48],[185,51,46],[186,52,45],[187,60,37],[188,63,34],[189,67,31],[190,69,29],[191,73,25],[192,76,22],[193,80,19],[194,83,16],[195,86,13],[196,90,9],[197,94,4]]},{id:"blue-2",area:6396,bounds:{x:167,y:263,w:100,h:228},grip:{x:266.5,y:263.5},axis:{x:-.19363303189666037,y:.9810740282764125},length:243,duration:2.31,runs:[[0,98,2],[1,97,2],[2,96,3],[3,96,2],[4,95,3],[5,94,3],[6,94,3],[7,93,3],[8,92,4],[9,91,4],[10,91,4],[11,90,5],[12,90,4],[13,89,5],[14,88,5],[15,88,5],[16,87,5],[17,86,6],[18,86,6],[19,85,7],[20,85,6],[21,84,7],[22,83,7],[23,82,8],[24,82,8],[25,81,8],[26,81,8],[27,80,9],[28,79,9],[29,79,9],[30,78,9],[31,77,10],[32,76,11],[33,76,10],[34,76,10],[35,75,11],[36,74,11],[37,74,11],[38,73,12],[39,73,11],[40,72,12],[41,72,12],[42,71,13],[43,70,13],[44,70,13],[45,69,14],[46,69,13],[47,68,14],[48,68,14],[49,67,15],[50,66,15],[51,66,15],[52,66,15],[53,65,15],[54,65,15],[55,64,16],[56,64,16],[57,63,16],[58,63,16],[59,62,17],[60,62,16],[61,62,16],[62,61,17],[63,61,17],[64,60,17],[65,60,17],[66,59,18],[67,59,18],[68,59,17],[69,58,16],[70,57,14],[71,57,13],[72,56,14],[73,56,14],[74,56,15],[75,55,16],[76,55,16],[77,54,16],[78,54,16],[79,54,16],[80,53,17],[81,53,18],[82,52,20],[83,52,21],[84,51,21],[85,51,21],[86,51,21],[87,50,21],[88,50,21],[89,50,21],[90,49,22],[91,49,21],[92,48,22],[93,48,22],[94,48,22],[95,47,23],[96,47,22],[97,46,23],[98,46,23],[99,46,23],[100,45,23],[101,45,23],[102,32,1],[102,45,23],[103,32,1],[103,44,24],[104,31,2],[104,44,23],[105,31,2],[105,44,23],[106,30,3],[106,43,24],[107,30,2],[107,43,24],[108,29,3],[108,42,24],[109,29,3],[109,42,24],[110,29,3],[110,42,24],[111,28,3],[111,41,25],[112,28,3],[112,41,24],[113,27,4],[113,41,24],[114,27,4],[114,40,25],[115,26,4],[115,40,25],[116,26,4],[116,40,25],[117,25,5],[117,39,25],[118,25,5],[118,39,25],[119,25,4],[119,39,25],[120,24,5],[120,38,26],[121,24,5],[121,38,25],[122,23,6],[122,37,26],[123,23,6],[123,37,26],[124,23,6],[124,37,26],[125,22,7],[125,37,26],[126,22,7],[126,36,27],[127,22,7],[127,35,27],[128,21,9],[128,33,29],[129,21,10],[129,32,30],[130,21,41],[131,20,42],[132,20,42],[133,19,43],[134,19,42],[135,19,42],[136,18,43],[137,18,43],[138,18,43],[139,17,44],[140,17,43],[141,17,43],[142,16,44],[143,16,44],[144,16,44],[145,15,45],[146,15,45],[147,15,45],[148,15,45],[149,14,45],[150,14,45],[151,13,46],[152,13,46],[153,13,46],[154,13,46],[155,12,47],[156,12,47],[157,12,46],[158,12,46],[159,11,47],[160,11,47],[161,11,47],[162,11,47],[163,10,48],[164,10,48],[165,10,48],[166,10,48],[167,10,48],[168,9,48],[169,9,48],[170,9,48],[171,9,48],[172,8,49],[173,8,49],[174,8,49],[175,8,49],[176,8,49],[177,7,50],[178,7,50],[179,7,50],[180,7,49],[181,7,49],[182,6,50],[183,6,50],[184,6,50],[185,6,50],[186,6,50],[187,6,50],[188,5,51],[189,5,51],[190,5,51],[191,5,51],[192,5,51],[193,5,51],[194,4,52],[195,4,52],[196,4,51],[197,4,51],[198,4,51],[199,3,52],[200,3,52],[201,3,52],[202,3,52],[203,3,52],[204,2,53],[205,2,53],[206,2,51],[207,2,48],[208,2,46],[209,2,44],[210,2,41],[211,1,40],[212,1,37],[213,1,35],[214,1,33],[215,1,30],[216,1,28],[217,1,26],[218,1,24],[219,0,22],[220,0,20],[221,0,17],[222,0,15],[223,0,13],[224,0,11],[225,0,8],[226,0,6],[227,0,3]]}],mouth:[{id:"mouth-0",area:595,bounds:{x:292,y:413,w:59,h:22},grip:{x:350.5,y:427.5},axis:{x:-.7700012058203037,y:.6380424304349033},length:49,duration:2.13,runs:[[0,19,4],[1,14,12],[2,11,17],[3,10,21],[3,37,5],[4,9,35],[5,8,38],[6,7,41],[7,6,47],[8,6,48],[9,5,49],[10,5,50],[11,5,50],[12,4,29],[12,37,19],[13,4,23],[13,41,16],[14,4,18],[14,45,14],[15,3,15],[15,50,8],[16,3,11],[16,56,3],[17,3,8],[18,2,6],[19,0,4],[20,1,3],[21,2,1]]}],green:[{id:"green-0",area:1082,bounds:{x:257,y:300,w:88,h:48},grip:{x:342.5,y:308.5},axis:{x:-.6363829547955637,y:.7713732785400772},length:86,duration:2.16,runs:[[0,48,18],[1,47,24],[2,47,27],[3,51,26],[4,54,26],[5,55,27],[6,57,26],[7,59,25],[8,60,26],[9,60,26],[10,61,26],[11,61,26],[12,61,27],[13,60,28],[14,59,28],[15,58,29],[16,55,32],[17,53,34],[18,50,37],[19,47,40],[20,45,15],[20,70,17],[21,43,13],[21,71,16],[22,40,12],[22,71,16],[23,38,10],[23,71,15],[24,35,8],[24,71,13],[25,32,11],[25,71,12],[26,29,13],[26,71,11],[27,10,1],[27,27,14],[27,71,10],[28,6,6],[28,23,17],[28,70,10],[29,3,11],[29,15,22],[29,69,10],[30,3,30],[30,69,9],[31,2,29],[31,69,7],[32,2,26],[32,72,3],[33,2,24],[34,4,21],[35,5,18],[36,6,16],[37,6,15],[38,6,10],[38,19,1],[39,5,8],[40,5,5],[41,4,4],[42,3,4],[43,2,3],[44,2,3],[45,1,2],[46,0,2],[47,0,1]]}],silver:[{id:"silver-0",area:232,bounds:{x:296,y:126,w:60,h:26},grip:{x:355.5,y:146.5},axis:{x:-.7203202134914811,y:.6936416870658707},length:35,duration:2.1,runs:[[0,0,2],[1,0,4],[2,1,4],[3,1,5],[4,1,6],[5,2,7],[6,2,8],[7,3,9],[8,4,9],[9,4,10],[10,5,10],[11,5,11],[12,6,12],[13,6,14],[14,7,14],[15,8,13],[16,8,12],[17,10,7],[18,54,4],[19,50,9],[20,47,13],[21,41,15],[22,41,13],[23,41,10],[24,42,7],[25,43,4]]},{id:"silver-1",area:2598,bounds:{x:256,y:270,w:97,h:59},grip:{x:328.5,y:270.5},axis:{x:-.594754958787551,y:.8039070462420506},length:89,duration:2.21,runs:[[0,25,4],[0,68,5],[1,23,7],[1,67,7],[2,22,9],[2,67,8],[3,22,10],[3,66,9],[4,22,12],[4,36,6],[4,56,7],[4,65,11],[5,22,22],[5,55,21],[6,22,23],[6,54,22],[7,16,30],[7,53,23],[8,16,32],[8,52,28],[9,15,65],[10,15,65],[11,14,66],[12,14,68],[13,14,69],[14,14,69],[15,13,70],[16,13,71],[17,13,71],[18,12,73],[19,12,73],[20,12,74],[21,11,75],[22,11,76],[23,10,77],[24,10,78],[25,10,78],[26,9,80],[27,9,80],[28,9,22],[28,48,42],[29,9,22],[29,49,41],[30,8,22],[30,67,23],[31,8,21],[31,72,19],[32,8,21],[32,75,16],[33,7,23],[33,78,14],[34,7,24],[34,81,11],[35,7,24],[35,83,9],[36,6,27],[36,84,9],[37,6,28],[37,85,8],[38,6,28],[38,87,7],[39,6,27],[39,87,7],[40,5,27],[40,88,6],[41,5,26],[41,88,7],[42,5,24],[42,89,6],[43,4,24],[43,89,6],[44,4,23],[44,88,8],[45,3,23],[45,88,8],[46,3,21],[46,88,8],[47,3,20],[47,88,9],[48,3,18],[48,88,9],[49,3,17],[49,88,9],[50,2,16],[50,88,8],[51,2,13],[51,88,7],[52,1,14],[52,88,6],[53,1,13],[53,89,3],[54,1,12],[55,0,13],[56,0,12],[57,2,9],[58,3,4]]}],skin:[{id:"skin-0",area:3339,bounds:{x:268,y:141,w:85,h:65},grip:{x:349.5,y:161.5},axis:{x:-.5071649822938563,y:.8618489895189716},length:65,duration:2.24,runs:[[0,14,4],[1,13,7],[2,13,8],[3,13,10],[4,12,13],[5,12,15],[6,12,16],[7,11,21],[8,11,22],[9,10,24],[10,10,24],[11,10,25],[12,9,28],[13,9,29],[14,8,31],[15,8,32],[16,8,34],[17,7,36],[18,7,37],[19,6,39],[20,6,40],[20,77,5],[21,5,43],[21,74,9],[22,5,44],[22,70,14],[23,5,45],[23,68,17],[24,4,47],[24,65,20],[25,4,48],[25,62,23],[26,4,49],[26,60,24],[27,3,81],[28,3,80],[29,2,81],[30,2,81],[31,2,80],[32,1,81],[33,0,82],[34,0,81],[35,0,81],[36,0,80],[37,0,80],[38,0,80],[39,0,79],[40,0,79],[41,0,78],[42,1,77],[43,2,76],[44,2,76],[45,3,74],[46,4,73],[47,5,72],[48,6,70],[49,7,69],[50,9,65],[51,12,61],[52,13,59],[53,14,56],[54,15,54],[55,16,52],[56,17,50],[57,19,48],[58,21,46],[59,24,43],[60,29,37],[61,33,33],[62,38,28],[63,44,21],[64,53,12]]},{id:"skin-1",area:12279,bounds:{x:240,y:323,w:128,h:147},grip:{x:344.5,y:323.5},axis:{x:-.3648291802047958,y:.9310744703143226},length:145,duration:2.41,runs:[[0,103,2],[1,101,6],[2,100,7],[3,99,9],[4,98,11],[5,97,13],[6,54,4],[6,96,16],[7,50,9],[7,95,19],[8,48,12],[8,93,21],[9,45,15],[9,92,22],[10,43,20],[10,91,22],[11,42,23],[11,90,23],[12,40,27],[12,90,23],[13,39,29],[13,89,24],[14,38,31],[14,88,26],[15,37,33],[15,88,26],[16,36,35],[16,87,27],[17,36,36],[17,85,30],[18,36,36],[18,82,33],[19,36,37],[19,80,35],[20,35,80],[21,35,80],[22,35,81],[23,35,81],[24,35,81],[25,35,81],[26,34,82],[27,34,82],[28,34,81],[29,34,81],[30,10,4],[30,34,81],[31,10,5],[31,34,82],[32,10,5],[32,34,82],[33,10,6],[33,34,82],[34,10,6],[34,34,82],[35,9,8],[35,34,82],[36,9,8],[36,34,83],[37,8,11],[37,36,81],[38,8,12],[38,37,80],[39,8,13],[39,37,80],[40,8,13],[40,37,82],[40,123,4],[41,8,14],[41,37,83],[41,121,6],[42,8,15],[42,37,91],[43,8,15],[43,37,91],[44,7,17],[44,37,91],[45,7,18],[45,37,90],[46,7,18],[46,37,90],[47,7,18],[47,37,91],[48,6,19],[48,37,91],[49,6,19],[49,37,91],[50,6,20],[50,37,91],[51,6,22],[51,37,91],[52,6,23],[52,36,92],[53,6,26],[53,36,92],[54,5,123],[55,5,123],[56,5,123],[57,5,123],[58,5,123],[59,4,124],[60,4,123],[61,4,123],[62,4,123],[63,4,123],[64,4,123],[65,4,123],[66,4,119],[66,125,1],[67,3,120],[68,3,121],[69,3,121],[70,3,121],[71,3,121],[72,3,121],[73,2,122],[74,2,122],[75,2,122],[76,2,122],[77,2,122],[78,2,122],[79,2,123],[80,2,123],[81,2,123],[82,2,123],[83,2,123],[84,1,124],[85,1,124],[86,1,124],[87,1,124],[88,1,123],[89,1,123],[90,1,70],[90,75,48],[91,1,65],[91,78,45],[92,1,62],[92,80,42],[93,1,61],[93,83,6],[93,94,28],[94,0,61],[94,96,25],[95,0,60],[95,98,23],[96,0,59],[96,100,20],[97,0,58],[97,105,15],[98,0,58],[98,106,14],[99,0,57],[99,106,13],[100,0,57],[100,107,12],[101,0,57],[101,107,12],[102,0,56],[102,85,4],[102,108,11],[103,0,56],[103,79,14],[103,109,9],[104,0,56],[104,74,23],[104,111,7],[105,0,55],[105,70,32],[105,110,8],[106,0,55],[106,66,42],[106,111,7],[107,0,55],[107,63,55],[108,0,54],[108,60,58],[109,4,29],[109,36,16],[109,56,62],[110,9,5],[110,17,9],[110,37,16],[110,56,62],[111,38,16],[111,55,63],[112,38,80],[113,38,80],[114,38,80],[115,38,80],[116,38,3],[116,45,73],[117,45,73],[118,45,73],[119,45,73],[120,45,72],[121,45,72],[122,45,72],[123,45,71],[124,47,69],[125,48,68],[126,49,66],[127,50,64],[128,51,63],[129,52,61],[130,54,59],[131,55,57],[132,56,55],[133,58,53],[134,59,51],[135,61,49],[136,64,45],[137,65,44],[138,70,38],[139,71,36],[140,72,34],[141,73,32],[142,74,30],[143,76,25],[144,78,20],[145,80,14],[146,89,1]]},{id:"skin-2",area:2852,bounds:{x:491,y:640,w:74,h:52},grip:{x:547.5,y:643.5},axis:{x:-.53928345358198,y:.8421243118997885},length:66,duration:2.22,runs:[[0,32,6],[1,29,11],[2,28,13],[3,26,18],[3,54,3],[4,24,21],[4,53,5],[5,22,26],[5,50,9],[6,21,38],[7,19,41],[8,17,44],[9,16,46],[10,14,49],[11,12,51],[12,10,55],[13,9,58],[14,8,60],[15,7,61],[16,6,63],[17,5,65],[18,5,66],[19,4,67],[20,4,67],[21,3,69],[22,3,69],[23,2,71],[24,2,72],[25,2,71],[26,2,70],[27,1,69],[28,1,69],[29,1,69],[30,1,65],[30,68,1],[31,1,64],[32,1,64],[33,1,64],[34,1,64],[35,1,64],[36,0,65],[37,0,65],[38,0,65],[39,0,65],[40,0,65],[41,0,65],[42,0,65],[43,2,63],[44,3,61],[45,4,60],[46,5,26],[46,33,31],[47,6,23],[47,34,30],[48,7,20],[48,36,28],[49,8,17],[49,37,27],[50,9,12],[50,40,24],[51,14,3],[51,44,10],[51,57,4]]},{id:"skin-3",area:6084,bounds:{x:207,y:639,w:145,h:71},grip:{x:337.5,y:672.5},axis:{x:-.6766632787177169,y:.7362926097924584},length:100,duration:2.3,runs:[[0,50,5],[1,41,16],[2,40,19],[3,38,23],[4,27,3],[4,34,28],[5,24,7],[5,32,32],[6,22,43],[7,19,48],[8,18,49],[9,16,52],[10,15,54],[11,14,58],[12,13,62],[12,88,3],[12,95,2],[13,12,88],[14,11,91],[15,10,93],[16,9,95],[17,8,97],[18,7,100],[19,6,103],[20,6,105],[21,5,108],[22,5,110],[23,4,112],[24,4,113],[25,3,115],[26,3,117],[27,2,119],[28,2,120],[29,2,121],[30,1,124],[31,1,126],[32,1,128],[33,1,130],[34,0,132],[35,0,132],[36,0,133],[37,0,133],[38,0,134],[39,0,135],[40,0,136],[41,0,136],[42,0,138],[43,0,139],[44,0,141],[45,0,142],[46,0,144],[47,0,11],[47,14,131],[48,27,118],[49,31,113],[50,38,6],[50,46,98],[51,48,95],[52,50,92],[53,52,88],[54,55,84],[55,58,80],[56,61,75],[57,71,3],[57,76,59],[58,77,56],[59,79,51],[60,80,47],[61,81,41],[62,82,40],[63,84,38],[64,85,36],[65,86,35],[66,89,31],[67,100,20],[68,102,17],[69,104,14],[70,106,11]]}],gold:[{id:"gold-0",area:310,bounds:{x:286,y:233,w:31,h:22},grip:{x:301.5,y:234.5},axis:{x:-.5355086372360844,y:.8445297504798465},length:25,duration:2.11,runs:[[0,12,2],[1,11,5],[2,11,6],[3,10,7],[4,10,7],[5,9,9],[6,8,13],[7,6,16],[8,6,16],[9,5,19],[10,4,20],[11,4,21],[12,3,23],[13,2,9],[13,13,5],[13,21,6],[14,1,9],[14,21,7],[15,1,9],[15,22,7],[16,0,10],[16,22,8],[17,0,9],[17,22,9],[18,0,9],[18,22,9],[19,0,9],[19,23,8],[20,1,8],[20,23,7],[21,5,3],[21,23,5]]},{id:"gold-1",area:772,bounds:{x:238,y:432,w:40,h:30},grip:{x:275.5,y:432.5},axis:{x:-.5144957554275266,y:.8574929257125442},length:45,duration:2.14,runs:[[0,2,4],[0,35,3],[1,2,9],[1,16,3],[1,28,11],[2,2,38],[3,2,38],[4,1,39],[5,1,39],[6,1,39],[7,1,39],[8,1,39],[9,1,39],[10,1,37],[11,1,36],[12,1,34],[13,1,32],[14,1,31],[15,1,29],[16,1,27],[17,1,26],[18,0,26],[19,0,25],[20,0,24],[21,0,23],[22,0,22],[23,0,16],[24,0,13],[25,0,11],[26,0,8],[27,0,6],[28,0,4],[29,0,2]]},{id:"gold-2",area:18805,bounds:{x:276,y:442,w:126,h:245},grip:{x:364.5,y:442.5},axis:{x:-.22546934644440483,y:.9742502624140948},length:242,duration:2.49,runs:[[0,82,7],[1,81,9],[2,81,10],[3,81,11],[4,80,12],[5,9,2],[5,80,13],[6,8,4],[6,80,13],[7,8,5],[7,79,14],[8,8,6],[8,78,16],[9,8,7],[9,78,16],[10,7,9],[10,77,18],[11,7,11],[11,77,18],[12,7,12],[12,76,20],[13,7,13],[13,75,21],[14,7,15],[14,75,22],[15,7,16],[15,74,23],[16,7,18],[16,74,24],[17,6,22],[17,73,25],[18,6,23],[18,73,26],[19,6,28],[19,72,27],[20,6,29],[20,71,29],[21,6,30],[21,70,30],[22,6,31],[22,69,31],[23,6,32],[23,68,33],[24,6,34],[24,65,36],[25,6,36],[25,62,40],[26,6,38],[26,58,44],[27,6,47],[27,54,48],[28,6,96],[29,6,47],[29,55,48],[30,5,48],[30,59,44],[31,5,47],[31,61,42],[32,5,46],[32,62,42],[33,5,45],[33,63,42],[34,5,44],[34,64,41],[35,6,42],[35,65,41],[36,5,43],[36,66,40],[37,4,43],[37,67,39],[38,4,43],[38,68,38],[39,4,42],[39,69,38],[40,4,41],[40,69,38],[41,4,41],[41,70,38],[42,4,40],[42,71,37],[43,4,39],[43,72,36],[44,3,40],[44,73,36],[45,3,39],[45,74,35],[46,3,39],[46,75,34],[47,3,38],[47,76,34],[48,3,37],[48,76,34],[49,3,37],[49,77,34],[50,3,37],[50,78,33],[51,3,37],[51,79,32],[52,3,37],[52,80,31],[53,3,37],[53,80,32],[54,3,36],[54,81,31],[55,2,37],[55,82,30],[56,2,37],[56,82,31],[57,2,36],[57,83,30],[58,2,36],[58,84,29],[59,2,35],[59,85,29],[60,2,35],[60,85,29],[61,2,35],[61,86,28],[62,2,34],[62,87,27],[63,2,34],[63,89,26],[64,2,33],[64,89,26],[65,2,33],[65,89,26],[66,1,34],[66,90,26],[67,1,33],[67,56,2],[67,90,26],[68,1,33],[68,56,4],[68,91,25],[69,1,32],[69,55,6],[69,91,25],[70,1,32],[70,55,7],[70,92,25],[71,1,32],[71,55,7],[71,93,24],[72,1,31],[72,55,7],[72,93,24],[73,1,31],[73,55,8],[73,94,23],[74,1,31],[74,55,8],[74,95,23],[75,1,30],[75,55,8],[75,95,23],[76,1,30],[76,55,8],[76,96,22],[77,1,30],[77,55,9],[77,96,22],[78,1,29],[78,55,9],[78,97,21],[79,1,29],[79,55,9],[79,97,22],[80,1,29],[80,55,9],[80,98,21],[81,1,28],[81,55,10],[81,98,21],[82,1,28],[82,55,10],[82,99,20],[83,0,29],[83,55,10],[83,100,20],[84,0,28],[84,55,10],[84,100,20],[85,0,28],[85,55,11],[85,101,19],[86,0,28],[86,55,11],[86,102,18],[87,0,27],[87,56,10],[87,102,19],[88,0,27],[88,56,10],[88,102,19],[89,0,27],[89,57,9],[89,102,19],[90,0,27],[90,58,8],[90,101,20],[91,0,27],[91,58,9],[91,101,20],[92,0,28],[92,58,9],[92,100,21],[93,0,28],[93,58,9],[93,100,21],[94,0,28],[94,58,9],[94,99,23],[95,0,29],[95,59,9],[95,99,23],[96,0,30],[96,59,9],[96,98,24],[97,0,31],[97,59,9],[97,98,24],[98,0,31],[98,59,9],[98,97,25],[99,0,32],[99,59,9],[99,97,25],[100,0,33],[100,59,9],[100,96,26],[101,0,34],[101,59,10],[101,96,27],[102,0,34],[102,59,10],[102,95,28],[103,0,35],[103,59,10],[103,95,28],[104,0,36],[104,59,10],[104,94,29],[105,0,37],[105,60,9],[105,94,29],[106,1,37],[106,60,10],[106,94,29],[107,1,37],[107,60,10],[107,94,29],[108,1,38],[108,60,10],[108,95,28],[109,1,38],[109,60,10],[109,95,29],[110,1,39],[110,60,10],[110,96,28],[111,1,38],[111,60,11],[111,97,27],[112,1,38],[112,60,11],[112,97,27],[113,1,38],[113,60,11],[113,97,27],[114,1,38],[114,60,11],[114,97,27],[115,1,38],[115,60,11],[115,98,26],[116,1,37],[116,60,12],[116,98,26],[117,1,37],[117,60,12],[117,98,26],[118,1,37],[118,61,11],[118,99,25],[119,1,37],[119,61,11],[119,99,26],[120,1,37],[120,61,11],[120,99,26],[121,2,36],[121,61,12],[121,99,26],[122,2,36],[122,61,12],[122,100,25],[123,2,36],[123,61,12],[123,100,25],[124,2,36],[124,61,12],[124,100,25],[125,2,35],[125,61,12],[125,100,25],[126,2,35],[126,61,13],[126,100,25],[127,2,35],[127,62,12],[127,100,25],[128,2,35],[128,62,12],[128,100,25],[129,2,35],[129,62,12],[129,100,25],[130,2,35],[130,62,12],[130,99,26],[131,3,34],[131,62,13],[131,99,26],[132,3,34],[132,62,13],[132,98,27],[133,3,34],[133,62,13],[133,97,29],[134,3,34],[134,62,13],[134,97,29],[135,3,33],[135,63,12],[135,96,30],[136,3,33],[136,63,12],[136,95,31],[137,3,33],[137,63,13],[137,95,31],[138,4,32],[138,63,13],[138,94,32],[139,4,34],[139,63,13],[139,94,32],[140,4,35],[140,63,13],[140,93,33],[141,4,36],[141,63,13],[141,92,34],[142,4,38],[142,63,14],[142,91,35],[143,4,39],[143,64,13],[143,91,35],[144,5,39],[144,64,13],[144,90,36],[145,5,41],[145,64,13],[145,89,37],[146,5,42],[146,64,13],[146,88,38],[147,5,44],[147,64,13],[147,88,38],[148,5,45],[148,64,13],[148,87,39],[149,5,47],[149,64,13],[149,86,40],[150,6,47],[150,64,13],[150,85,41],[151,6,49],[151,64,13],[151,84,42],[152,6,51],[152,65,12],[152,84,42],[153,6,52],[153,65,12],[153,83,43],[154,6,53],[154,64,14],[154,82,44],[155,7,54],[155,64,14],[155,82,44],[156,7,71],[156,81,45],[157,7,119],[158,7,119],[159,7,119],[160,8,118],[161,8,118],[162,8,118],[163,8,118],[164,8,118],[165,9,117],[166,9,117],[167,9,117],[168,9,117],[169,10,116],[170,10,116],[171,10,116],[172,10,116],[173,11,115],[174,11,115],[175,11,115],[176,12,114],[177,12,113],[178,12,113],[179,12,113],[180,12,113],[181,13,112],[182,13,112],[183,13,112],[184,14,111],[185,14,111],[186,14,111],[187,14,111],[188,15,110],[189,15,110],[190,15,110],[191,16,108],[192,16,108],[193,16,108],[194,16,108],[195,16,108],[196,16,108],[197,16,108],[198,16,109],[199,17,109],[200,17,109],[201,18,107],[202,18,107],[203,18,107],[204,19,106],[205,19,105],[206,20,104],[207,20,104],[208,20,104],[209,22,4],[209,28,96],[210,31,92],[211,33,90],[212,34,89],[213,35,87],[214,36,86],[215,38,84],[216,40,82],[217,42,80],[218,44,77],[219,46,75],[220,47,74],[221,48,73],[222,49,72],[223,51,70],[224,52,68],[225,53,67],[226,54,66],[227,56,63],[228,58,61],[229,60,59],[230,62,57],[231,63,56],[232,63,56],[233,64,55],[234,64,55],[235,65,54],[236,66,53],[237,67,52],[238,67,52],[239,69,50],[240,70,49],[241,72,47],[242,73,46],[243,75,44],[244,76,27],[244,105,4]]}],tie:[{id:"tie-0",area:5527,bounds:{x:303,y:471,w:75,h:128},grip:{x:334.5,y:472.5},axis:{x:-.2549580754340903,y:.9669521083129944},length:122,duration:2.29,runs:[[0,26,2],[1,26,6],[2,25,9],[3,24,11],[4,23,13],[5,22,15],[6,21,17],[7,21,18],[8,20,20],[9,20,21],[10,19,23],[11,18,24],[12,18,25],[13,17,27],[14,16,29],[15,16,30],[16,15,32],[17,15,33],[18,14,35],[19,13,36],[20,13,37],[21,13,38],[22,13,39],[23,13,40],[24,13,40],[25,12,42],[26,12,43],[27,12,43],[28,11,45],[29,11,46],[30,10,48],[31,10,48],[32,10,49],[33,9,51],[34,9,53],[35,8,54],[36,8,54],[37,8,55],[38,7,22],[38,31,32],[39,7,22],[39,33,31],[40,6,22],[40,34,30],[41,6,22],[41,35,30],[42,6,22],[42,35,31],[43,5,23],[43,35,31],[44,5,23],[44,36,31],[45,5,23],[45,36,32],[46,4,24],[46,36,32],[47,4,24],[47,36,33],[48,4,24],[48,37,32],[49,3,25],[49,37,33],[50,3,25],[50,37,33],[51,3,25],[51,37,34],[52,2,26],[52,38,33],[53,2,26],[53,38,34],[54,2,26],[54,38,35],[55,1,27],[55,38,35],[56,1,27],[56,39,35],[57,1,27],[57,39,36],[58,0,29],[58,39,36],[59,0,29],[59,39,36],[60,0,30],[60,39,36],[61,0,31],[61,39,35],[62,0,31],[62,40,34],[63,1,30],[63,40,33],[64,1,30],[64,40,33],[65,1,30],[65,40,32],[66,2,30],[66,41,31],[67,3,29],[67,41,30],[68,4,28],[68,41,30],[69,4,28],[69,41,29],[70,5,27],[70,41,29],[71,6,26],[71,41,28],[72,7,25],[72,42,27],[73,7,25],[73,42,26],[74,8,24],[74,42,26],[75,9,23],[75,42,25],[76,10,23],[76,42,25],[77,11,22],[77,43,24],[78,11,22],[78,43,24],[79,12,21],[79,43,25],[80,12,21],[80,43,25],[81,13,20],[81,43,26],[82,12,21],[82,44,26],[83,12,21],[83,44,26],[84,12,21],[84,44,26],[85,12,21],[85,44,26],[86,12,21],[86,44,27],[87,11,22],[87,45,26],[88,11,22],[88,45,26],[89,11,23],[89,45,27],[90,11,23],[90,45,27],[91,11,23],[91,45,27],[92,11,23],[92,46,26],[93,11,23],[93,46,27],[94,11,23],[94,46,27],[95,11,23],[95,46,27],[96,10,24],[96,46,27],[97,10,24],[97,47,26],[98,10,25],[98,47,26],[99,10,25],[99,47,26],[100,10,25],[100,47,26],[101,10,25],[101,47,25],[102,10,25],[102,48,24],[103,10,25],[103,48,23],[104,10,25],[104,48,22],[105,10,25],[105,48,22],[106,9,27],[106,48,21],[107,9,27],[107,48,20],[108,9,27],[108,49,19],[109,9,27],[109,49,18],[110,11,25],[110,49,18],[111,12,24],[111,49,17],[112,13,23],[112,49,16],[113,15,21],[113,50,14],[114,16,21],[114,50,14],[115,17,20],[115,50,13],[116,19,18],[116,50,12],[117,20,17],[117,50,11],[118,22,15],[118,50,11],[119,23,14],[119,50,10],[120,25,12],[120,50,9],[121,26,11],[121,50,8],[122,28,9],[122,50,7],[123,30,8],[123,50,7],[124,31,7],[124,50,6],[125,32,5],[125,51,4],[126,34,3],[126,51,4],[127,51,3]]}],purple:[{id:"purple-0",area:23864,bounds:{x:362,y:438,w:185,h:248},grip:{x:481.5,y:474.5},axis:{x:-.31823393914138676,y:.9480122150998668},length:229,duration:2.55,runs:[[0,3,3],[1,2,5],[2,1,8],[3,0,11],[4,3,10],[5,4,15],[6,5,18],[7,6,19],[8,6,20],[9,7,20],[10,7,21],[11,7,23],[12,8,23],[13,8,31],[14,9,33],[15,9,37],[16,10,38],[17,10,42],[18,11,44],[19,11,48],[20,12,50],[21,12,53],[22,13,56],[23,13,60],[24,14,62],[25,14,63],[26,14,64],[27,15,64],[28,15,68],[29,16,71],[30,16,74],[30,101,1],[31,16,89],[32,16,92],[33,17,94],[34,17,97],[35,17,100],[36,18,102],[37,19,103],[38,19,104],[39,20,104],[40,20,104],[41,20,104],[42,20,104],[43,21,104],[44,21,104],[45,22,103],[46,22,104],[47,22,105],[48,23,104],[49,23,104],[50,23,105],[51,24,104],[52,24,105],[53,25,104],[54,25,104],[55,25,104],[56,25,104],[57,26,104],[58,26,104],[59,26,104],[60,27,103],[61,27,103],[62,27,104],[63,28,103],[64,28,103],[65,28,103],[66,28,103],[67,29,103],[68,29,103],[69,29,103],[70,30,102],[71,30,102],[72,30,103],[73,30,103],[74,31,102],[75,31,102],[76,31,102],[77,31,103],[78,32,102],[79,32,102],[80,32,102],[81,32,102],[82,32,102],[83,33,101],[84,33,101],[85,33,102],[86,33,102],[87,34,101],[88,34,101],[89,34,101],[90,34,101],[91,35,100],[92,35,101],[93,35,101],[94,35,101],[95,35,101],[96,35,101],[97,35,101],[98,36,100],[99,36,100],[100,36,100],[101,36,100],[102,36,101],[103,36,101],[104,36,101],[105,37,100],[106,37,100],[107,37,100],[108,37,101],[109,37,101],[110,37,101],[111,37,101],[112,37,101],[113,38,100],[114,38,100],[115,38,100],[116,38,100],[117,38,100],[118,38,101],[119,38,101],[120,38,101],[121,38,101],[122,38,101],[123,39,100],[124,39,100],[125,39,100],[126,39,101],[127,39,101],[128,39,101],[129,39,101],[130,39,101],[131,39,101],[132,39,101],[133,39,102],[134,39,102],[135,39,102],[136,39,102],[137,40,101],[138,40,101],[139,40,101],[140,40,102],[141,40,102],[142,40,102],[143,40,102],[144,40,102],[145,40,103],[146,40,103],[147,40,103],[148,40,103],[149,40,104],[150,40,104],[151,40,104],[152,40,105],[153,40,105],[154,40,105],[155,40,105],[156,40,106],[157,40,106],[158,40,107],[159,40,107],[160,40,107],[161,40,108],[162,40,109],[163,40,109],[164,40,110],[165,40,111],[166,40,111],[167,40,112],[168,40,113],[169,40,114],[170,40,115],[171,40,117],[172,40,119],[173,40,121],[174,40,123],[175,40,124],[176,40,125],[177,40,126],[178,40,127],[179,40,128],[180,40,129],[181,39,131],[182,39,132],[183,39,133],[184,39,133],[185,39,134],[186,39,135],[187,39,136],[188,39,136],[189,39,137],[190,39,138],[191,39,138],[192,39,139],[193,39,140],[194,39,140],[195,38,142],[196,38,143],[197,38,143],[198,38,144],[199,38,144],[200,38,145],[201,38,145],[202,39,122],[202,167,17],[203,40,118],[203,169,15],[204,40,117],[204,170,15],[205,39,116],[205,173,10],[206,39,114],[206,174,8],[207,39,112],[207,177,2],[208,39,111],[209,38,110],[210,38,108],[211,38,107],[212,38,105],[213,38,103],[214,37,102],[215,37,101],[216,37,100],[217,36,100],[218,36,99],[219,36,98],[220,36,51],[220,88,46],[221,36,50],[221,89,44],[222,35,49],[222,90,43],[223,35,48],[223,90,42],[224,35,47],[224,91,41],[225,35,47],[225,91,40],[226,35,47],[226,91,40],[227,35,46],[227,91,40],[228,34,47],[228,92,39],[229,34,47],[229,92,38],[230,34,46],[230,93,37],[231,33,47],[231,93,37],[232,33,47],[232,93,37],[233,33,47],[233,94,36],[234,33,46],[234,94,36],[235,33,46],[235,94,36],[236,33,45],[236,95,35],[237,33,45],[237,95,35],[238,33,44],[238,96,33],[239,33,43],[239,97,32],[240,33,42],[240,97,32],[241,33,42],[241,98,31],[242,33,41],[242,98,31],[243,33,41],[243,99,30],[244,33,40],[244,99,28],[245,33,40],[245,100,20],[246,33,39],[247,33,20]]},{id:"purple-1",area:25335,bounds:{x:134,y:439,w:162,h:250},grip:{x:284.5,y:439.5},axis:{x:-.2799410160146266,y:.9600172016962503},length:278,duration:2.56,runs:[[0,147,4],[1,144,7],[2,144,7],[3,142,9],[4,141,10],[5,139,12],[6,137,14],[7,136,15],[8,134,17],[9,132,18],[10,131,19],[11,130,20],[12,129,21],[13,128,21],[14,127,22],[15,126,23],[16,120,29],[17,117,32],[18,115,34],[19,112,37],[20,110,38],[21,108,40],[22,106,42],[23,105,43],[24,103,45],[25,102,46],[26,100,48],[27,98,50],[28,95,53],[29,90,58],[30,86,62],[31,83,65],[32,81,67],[33,79,68],[34,76,71],[35,74,73],[36,71,76],[37,69,78],[38,67,81],[39,64,83],[40,62,84],[41,60,86],[42,58,88],[43,55,91],[44,53,93],[45,50,96],[46,48,98],[47,46,99],[48,44,101],[49,41,104],[50,39,106],[51,36,109],[52,34,111],[53,34,111],[54,32,113],[55,31,114],[56,29,116],[57,27,118],[58,24,120],[59,22,122],[60,19,83],[60,105,39],[61,16,83],[61,107,37],[62,14,83],[62,107,37],[63,14,82],[63,108,36],[64,14,81],[64,108,7],[64,118,26],[65,13,72],[65,87,6],[65,108,3],[65,118,26],[66,10,75],[66,88,4],[66,118,26],[67,10,74],[67,89,4],[67,118,26],[68,9,74],[68,91,2],[68,118,26],[69,9,74],[69,118,25],[70,9,73],[70,118,25],[71,8,74],[71,119,4],[71,127,16],[72,8,74],[72,127,16],[73,8,71],[73,127,16],[74,8,66],[74,128,15],[75,7,67],[75,128,15],[76,7,67],[76,127,16],[77,7,67],[77,127,16],[78,6,68],[78,126,17],[79,6,69],[79,127,16],[80,6,69],[80,130,13],[81,6,69],[81,76,1],[81,132,11],[82,6,68],[82,134,9],[83,5,69],[83,133,10],[84,5,68],[84,132,11],[85,5,66],[85,131,12],[86,5,65],[86,131,11],[87,5,66],[87,131,11],[88,5,68],[88,128,14],[89,4,70],[89,128,14],[90,4,70],[90,131,11],[91,4,70],[91,130,12],[92,4,72],[92,130,12],[93,4,72],[93,130,12],[94,4,72],[94,131,11],[95,3,71],[95,130,12],[96,3,72],[96,129,13],[97,3,72],[97,128,14],[98,3,71],[98,124,3],[98,128,14],[99,3,71],[99,124,18],[100,3,74],[100,124,18],[101,2,76],[101,124,18],[102,2,77],[102,123,19],[103,2,80],[103,122,20],[104,2,80],[104,122,20],[105,2,81],[105,122,20],[106,2,81],[106,122,20],[107,2,81],[107,113,1],[107,117,1],[107,122,20],[108,2,80],[108,113,2],[108,116,2],[108,121,21],[109,2,81],[109,112,6],[109,119,24],[110,1,88],[110,101,2],[110,112,31],[111,1,90],[111,100,3],[111,113,30],[112,1,91],[112,100,3],[112,106,1],[112,112,31],[113,1,92],[113,100,7],[113,112,31],[114,1,94],[114,101,7],[114,110,33],[115,1,95],[115,98,45],[116,1,142],[117,1,142],[118,1,142],[119,1,142],[120,1,142],[121,1,142],[122,1,142],[123,1,142],[124,0,144],[125,0,144],[126,0,144],[127,0,144],[128,0,144],[129,0,144],[130,0,144],[131,0,144],[132,0,144],[133,0,144],[134,0,145],[135,0,145],[136,0,145],[137,0,145],[138,0,145],[139,0,145],[140,0,145],[141,0,146],[142,0,146],[143,0,146],[144,1,145],[145,1,145],[146,1,145],[147,1,146],[148,1,146],[149,1,146],[150,1,146],[151,1,146],[152,1,146],[153,1,147],[154,1,147],[155,1,147],[156,1,147],[157,1,147],[158,1,148],[159,1,148],[160,1,148],[161,1,148],[162,1,148],[163,1,149],[164,1,149],[165,1,149],[166,1,149],[167,2,148],[168,2,149],[169,2,149],[170,2,149],[171,2,149],[172,2,150],[173,2,150],[174,2,150],[175,2,150],[176,2,151],[177,2,151],[178,2,151],[179,3,151],[180,3,151],[181,3,151],[182,3,151],[183,3,151],[184,3,152],[185,3,152],[186,3,152],[187,3,153],[188,3,153],[189,3,153],[190,4,152],[191,4,153],[192,4,153],[193,4,153],[194,4,154],[195,4,154],[196,4,154],[197,4,154],[198,4,154],[199,4,154],[200,4,119],[200,128,30],[201,4,110],[201,130,28],[202,4,109],[202,132,27],[203,5,106],[203,134,25],[204,5,95],[204,103,4],[204,135,25],[205,5,92],[205,104,1],[205,137,23],[206,5,90],[206,138,22],[207,5,87],[207,140,21],[208,6,85],[208,140,21],[209,6,83],[209,141,21],[210,6,82],[210,142,20],[211,6,81],[211,145,17],[212,6,80],[212,148,13],[213,6,79],[214,6,78],[215,7,76],[216,7,75],[217,7,74],[218,7,73],[219,7,72],[220,8,71],[221,8,70],[222,8,70],[223,8,69],[224,8,69],[225,9,67],[226,9,67],[227,9,66],[228,9,66],[229,9,66],[230,10,64],[231,10,64],[232,10,64],[233,10,64],[234,11,62],[235,11,62],[236,11,62],[237,11,62],[238,12,61],[239,12,61],[240,12,61],[241,13,60],[242,13,60],[243,13,60],[244,13,60],[245,14,59],[246,14,59],[247,15,58],[248,16,49],[249,17,11]]}],pink:[{id:"pink-0",area:2282,bounds:{x:204,y:499,w:64,h:56},grip:{x:251.5,y:503.5},axis:{x:-.45734801262076136,y:.8892878023181471},length:57,duration:2.2,runs:[[0,32,3],[1,29,8],[2,27,10],[3,26,12],[4,25,13],[4,45,3],[5,15,2],[5,23,15],[5,41,7],[6,15,3],[6,22,26],[7,14,5],[7,23,25],[8,13,8],[8,23,25],[9,13,35],[10,12,36],[11,12,37],[11,53,4],[12,12,45],[13,9,48],[14,4,54],[15,4,54],[16,4,53],[17,4,53],[18,4,52],[19,5,52],[20,5,55],[21,5,1],[21,7,55],[22,4,60],[23,4,59],[24,3,59],[25,1,60],[26,0,61],[27,1,60],[28,3,55],[29,4,54],[30,4,57],[31,4,56],[32,6,54],[33,6,54],[34,6,55],[35,4,56],[36,5,54],[37,5,53],[38,4,50],[38,57,1],[39,4,50],[40,7,47],[41,8,46],[42,9,44],[43,12,40],[44,12,40],[45,13,39],[46,13,39],[47,13,30],[47,44,3],[47,48,4],[48,12,31],[48,45,1],[48,48,3],[49,13,29],[49,48,1],[50,19,12],[50,33,9],[51,21,9],[51,33,10],[52,22,8],[52,33,3],[52,37,5],[53,23,7],[53,37,5],[54,25,6],[54,38,2],[55,26,2]]}],background:[{id:"background-0",area:275476,bounds:{x:0,y:0,w:600,h:800},grip:{x:599.5,y:.5},axis:{x:-.31977864415817975,y:.9474922789871992},length:950,duration:3,runs:[[0,0,600],[1,0,600],[2,0,600],[3,0,600],[4,0,600],[5,0,600],[6,0,600],[7,0,600],[8,0,600],[9,0,600],[10,0,600],[11,0,600],[12,0,600],[13,0,600],[14,0,600],[15,0,600],[16,0,600],[17,0,600],[18,0,600],[19,0,600],[20,0,600],[21,0,600],[22,0,600],[23,0,600],[24,0,600],[25,0,600],[26,0,600],[27,0,600],[28,0,600],[29,0,600],[30,0,600],[31,0,600],[32,0,600],[33,0,600],[34,0,600],[35,0,600],[36,0,600],[37,0,600],[38,0,600],[39,0,600],[40,0,600],[41,0,600],[42,0,600],[43,0,600],[44,0,600],[45,0,600],[46,0,600],[47,0,600],[48,0,600],[49,0,600],[50,0,600],[51,0,600],[52,0,600],[53,0,600],[54,0,295],[54,296,304],[55,0,294],[55,298,302],[56,0,292],[56,299,301],[57,0,291],[57,299,301],[58,0,290],[58,300,300],[59,0,290],[59,300,300],[60,0,289],[60,300,300],[61,0,289],[61,300,300],[62,0,288],[62,301,299],[63,0,288],[63,301,299],[64,0,288],[64,301,299],[65,0,287],[65,301,299],[66,0,287],[66,302,298],[67,0,286],[67,302,298],[68,0,286],[68,302,298],[69,0,285],[69,302,51],[69,354,246],[70,0,285],[70,302,50],[70,355,245],[71,0,284],[71,302,48],[71,356,244],[72,0,284],[72,303,47],[72,357,243],[73,0,284],[73,303,47],[73,357,243],[74,0,283],[74,304,46],[74,357,243],[75,0,283],[75,304,45],[75,357,243],[76,0,282],[76,304,45],[76,357,243],[77,0,282],[77,304,45],[77,357,243],[78,0,281],[78,305,43],[78,357,243],[79,0,281],[79,306,42],[79,357,243],[80,0,280],[80,311,37],[80,357,243],[81,0,280],[81,318,29],[81,357,243],[82,0,280],[82,323,24],[82,358,242],[83,0,279],[83,326,21],[83,358,242],[84,0,279],[84,328,18],[84,358,242],[85,0,278],[85,333,12],[85,358,242],[86,0,278],[86,338,3],[86,358,242],[87,0,277],[87,339,1],[87,358,242],[88,0,277],[88,358,242],[89,0,276],[89,358,242],[90,0,276],[90,358,242],[91,0,276],[91,358,242],[92,0,275],[92,359,241],[93,0,275],[93,359,241],[94,0,274],[94,359,241],[95,0,274],[95,359,241],[96,0,273],[96,359,241],[97,0,273],[97,359,241],[98,0,272],[98,359,241],[99,0,272],[99,359,241],[100,0,272],[100,359,241],[101,0,271],[101,359,241],[102,0,271],[102,360,240],[103,0,270],[103,360,240],[104,0,270],[104,360,240],[105,0,269],[105,360,240],[106,0,269],[106,360,240],[107,0,268],[107,360,240],[108,0,268],[108,360,240],[109,0,268],[109,360,240],[110,0,267],[110,360,240],[111,0,267],[111,360,240],[112,0,266],[112,361,239],[113,0,266],[113,361,239],[114,0,265],[114,361,239],[115,0,265],[115,361,239],[116,0,264],[116,361,239],[117,0,264],[117,361,239],[118,0,264],[118,361,239],[119,0,263],[119,361,239],[120,0,263],[120,361,239],[121,0,262],[121,361,239],[122,0,262],[122,362,238],[123,0,261],[123,362,238],[124,0,261],[124,362,238],[125,0,260],[125,362,238],[126,0,260],[126,362,238],[127,0,260],[127,362,238],[128,0,259],[128,362,238],[129,0,259],[129,362,238],[130,0,258],[130,362,238],[131,0,258],[131,362,238],[132,0,257],[132,363,237],[133,0,257],[133,363,237],[134,0,256],[134,363,237],[135,0,256],[135,363,237],[136,0,256],[136,363,237],[137,0,255],[137,363,237],[138,0,255],[138,363,237],[139,0,254],[139,363,237],[140,0,254],[140,363,237],[141,0,253],[141,362,238],[142,0,253],[142,362,238],[143,0,252],[143,362,238],[144,0,252],[144,362,238],[145,0,252],[145,361,239],[146,0,251],[146,360,240],[147,0,251],[147,359,241],[148,0,250],[148,358,242],[149,0,250],[149,358,242],[150,0,249],[150,358,242],[151,0,249],[151,358,242],[152,0,248],[152,358,242],[153,0,248],[153,358,242],[154,0,247],[154,358,242],[155,0,245],[155,358,242],[156,0,244],[156,357,243],[157,0,243],[157,357,243],[158,0,241],[158,357,243],[159,0,240],[159,357,243],[160,0,239],[160,356,244],[161,0,237],[161,356,244],[162,0,236],[162,355,245],[163,0,235],[163,355,245],[164,0,234],[164,354,246],[165,0,233],[165,353,247],[166,0,232],[166,353,247],[167,0,231],[167,352,248],[168,0,230],[168,352,248],[169,0,229],[169,351,249],[170,0,228],[170,351,249],[171,0,226],[171,351,249],[172,0,225],[172,350,250],[173,0,224],[173,350,250],[174,0,223],[174,350,250],[175,0,221],[175,349,251],[176,0,219],[176,349,251],[177,0,218],[177,348,252],[178,0,217],[178,348,252],[179,0,216],[179,348,252],[180,0,215],[180,347,253],[181,0,213],[181,347,253],[182,0,211],[182,346,254],[183,0,209],[183,346,254],[184,0,207],[184,346,254],[185,0,206],[185,346,254],[186,0,205],[186,345,255],[187,0,203],[187,345,255],[188,0,201],[188,345,255],[189,0,199],[189,344,256],[190,0,196],[190,344,256],[191,0,194],[191,345,255],[192,0,192],[192,346,254],[193,0,189],[193,346,254],[194,0,187],[194,348,252],[195,0,185],[195,349,251],[196,0,183],[196,351,249],[197,0,180],[197,354,246],[198,0,178],[198,356,244],[199,0,176],[199,359,241],[200,0,174],[200,362,238],[201,0,172],[201,364,236],[202,0,169],[202,366,234],[203,0,167],[203,369,231],[204,0,165],[204,372,228],[205,0,163],[205,374,226],[206,0,161],[206,377,223],[207,0,158],[207,379,221],[208,0,156],[208,382,218],[209,0,154],[209,384,216],[210,0,152],[210,387,213],[211,0,149],[211,389,211],[212,0,147],[212,392,208],[213,0,145],[213,394,206],[214,0,143],[214,397,203],[215,0,141],[215,399,201],[216,0,138],[216,401,199],[217,0,136],[217,404,196],[218,0,134],[218,406,194],[219,0,132],[219,409,191],[220,0,129],[220,410,190],[221,0,127],[221,413,187],[222,0,125],[222,415,185],[223,0,123],[223,416,184],[224,0,121],[224,417,183],[225,0,119],[225,418,182],[226,0,118],[226,419,181],[227,0,118],[227,420,180],[228,0,117],[228,420,180],[229,0,116],[229,421,179],[230,0,115],[230,422,178],[231,0,115],[231,423,177],[232,0,114],[232,423,177],[233,0,113],[233,424,176],[234,0,112],[234,424,176],[235,0,112],[235,425,175],[236,0,111],[236,426,174],[237,0,110],[237,427,173],[238,0,109],[238,428,172],[239,0,109],[239,428,172],[240,0,108],[240,429,171],[241,0,107],[241,429,171],[242,0,106],[242,430,170],[243,0,106],[243,430,170],[244,0,105],[244,431,169],[245,0,104],[245,431,169],[246,0,103],[246,432,168],[247,0,103],[247,432,168],[248,0,103],[248,432,168],[249,0,102],[249,432,168],[250,0,101],[250,433,167],[251,0,101],[251,433,167],[252,0,101],[252,433,167],[253,0,100],[253,433,167],[254,0,100],[254,433,167],[255,0,99],[255,433,167],[256,0,99],[256,433,167],[257,0,98],[257,434,166],[258,0,98],[258,434,166],[259,0,97],[259,434,166],[260,0,97],[260,434,166],[261,0,97],[261,434,166],[262,0,96],[262,435,165],[263,0,96],[263,435,165],[264,0,95],[264,435,165],[265,0,95],[265,435,165],[266,0,95],[266,435,165],[267,0,95],[267,435,165],[268,0,95],[268,435,165],[269,0,95],[269,435,165],[270,0,95],[270,436,164],[271,0,94],[271,436,164],[272,0,94],[272,436,164],[273,0,94],[273,436,164],[274,0,94],[274,436,164],[275,0,94],[275,436,164],[276,0,94],[276,436,164],[277,0,94],[277,436,164],[278,0,94],[278,437,163],[279,0,94],[279,437,163],[280,0,94],[280,437,163],[281,0,94],[281,437,163],[282,0,94],[282,437,163],[283,0,93],[283,437,163],[284,0,93],[284,437,163],[285,0,93],[285,437,163],[286,0,93],[286,438,162],[287,0,93],[287,438,162],[288,0,93],[288,438,162],[289,0,92],[289,438,162],[290,0,92],[290,438,162],[291,0,92],[291,438,162],[292,0,92],[292,438,162],[293,0,92],[293,439,161],[294,0,92],[294,439,161],[295,0,92],[295,439,161],[296,0,92],[296,439,161],[297,0,92],[297,439,161],[298,0,92],[298,439,161],[299,0,91],[299,439,161],[300,0,91],[300,440,160],[301,0,91],[301,440,160],[302,0,91],[302,440,160],[303,0,91],[303,440,160],[304,0,91],[304,440,160],[305,0,91],[305,440,160],[306,0,91],[306,440,160],[307,0,91],[307,440,160],[308,0,91],[308,440,160],[309,0,91],[309,440,160],[310,0,91],[310,440,160],[311,0,91],[311,441,159],[312,0,91],[312,441,159],[313,0,91],[313,441,159],[314,0,90],[314,441,159],[315,0,90],[315,441,159],[316,0,90],[316,441,159],[317,0,90],[317,441,159],[318,0,90],[318,441,159],[319,0,90],[319,441,159],[320,0,90],[320,441,159],[321,0,89],[321,441,159],[322,0,89],[322,442,158],[323,0,89],[323,442,158],[324,0,89],[324,442,158],[325,0,89],[325,442,158],[326,0,89],[326,442,158],[327,0,89],[327,442,158],[328,0,89],[328,442,158],[329,0,89],[329,443,157],[330,0,89],[330,443,157],[331,0,89],[331,443,157],[332,0,89],[332,443,157],[333,0,89],[333,443,157],[334,0,88],[334,443,157],[335,0,88],[335,443,157],[336,0,88],[336,444,156],[337,0,88],[337,444,156],[338,0,88],[338,444,156],[339,0,88],[339,444,156],[340,0,88],[340,444,156],[341,0,88],[341,444,156],[342,0,88],[342,444,156],[343,0,88],[343,444,156],[344,0,87],[344,444,156],[345,0,87],[345,444,156],[346,0,87],[346,444,156],[347,0,87],[347,444,156],[348,0,87],[348,444,156],[349,0,87],[349,445,155],[350,0,87],[350,445,155],[351,0,87],[351,445,155],[352,0,87],[352,445,155],[353,0,87],[353,445,155],[354,0,87],[354,445,155],[355,0,87],[355,445,155],[356,0,87],[356,446,154],[357,0,87],[357,446,154],[358,0,86],[358,446,154],[359,0,86],[359,446,154],[360,0,86],[360,446,154],[361,0,86],[361,446,154],[362,0,86],[362,446,154],[363,0,86],[363,446,154],[364,0,86],[364,447,153],[365,0,86],[365,447,153],[366,0,86],[366,447,153],[367,0,86],[367,447,153],[368,0,86],[368,447,153],[369,0,86],[369,447,153],[370,0,85],[370,447,153],[371,0,85],[371,447,153],[372,0,85],[372,448,152],[373,0,85],[373,448,152],[374,0,85],[374,448,152],[375,0,85],[375,448,152],[376,0,85],[376,448,152],[377,0,85],[377,448,152],[378,0,85],[378,448,152],[379,0,85],[379,449,151],[380,0,85],[380,449,151],[381,0,85],[381,449,151],[382,0,85],[382,449,151],[383,0,84],[383,449,151],[384,0,84],[384,449,151],[385,0,84],[385,449,151],[386,0,84],[386,450,150],[387,0,84],[387,450,150],[388,0,84],[388,450,150],[389,0,84],[389,450,150],[390,0,84],[390,450,150],[391,0,84],[391,450,150],[392,0,84],[392,450,150],[393,0,84],[393,451,149],[394,0,84],[394,451,149],[395,0,83],[395,451,149],[396,0,83],[396,451,149],[397,0,83],[397,451,149],[398,0,83],[398,451,149],[399,0,83],[399,451,149],[400,0,83],[400,452,148],[401,0,83],[401,452,148],[402,0,83],[402,452,148],[403,0,83],[403,452,148],[404,0,83],[404,452,148],[405,0,83],[405,452,148],[406,0,83],[406,452,148],[407,0,83],[407,453,147],[408,0,83],[408,453,147],[409,0,83],[409,453,147],[410,0,82],[410,453,147],[411,0,82],[411,453,147],[412,0,82],[412,453,147],[413,0,82],[413,454,146],[414,0,82],[414,454,146],[415,0,82],[415,454,146],[416,0,82],[416,454,146],[417,0,82],[417,454,146],[418,0,82],[418,454,146],[419,0,82],[419,455,145],[420,0,82],[420,455,145],[421,0,82],[421,455,145],[422,0,82],[422,455,145],[423,0,82],[423,455,145],[424,0,81],[424,455,145],[425,0,81],[425,456,144],[426,0,81],[426,456,144],[427,0,81],[427,456,144],[428,0,81],[428,456,144],[429,0,81],[429,457,143],[430,0,81],[430,457,143],[431,0,81],[431,457,143],[432,0,81],[432,457,143],[433,0,81],[433,457,143],[434,0,81],[434,457,143],[435,0,81],[435,457,143],[436,0,81],[436,458,142],[437,0,81],[437,458,142],[438,0,81],[438,458,142],[439,0,81],[439,458,142],[440,0,81],[440,458,142],[441,0,81],[441,458,142],[442,0,81],[442,459,141],[443,0,81],[443,459,141],[444,0,81],[444,459,141],[445,0,81],[445,459,141],[446,0,81],[446,459,141],[447,0,80],[447,460,140],[448,0,80],[448,460,140],[449,0,80],[449,460,140],[450,0,80],[450,460,140],[451,0,80],[451,460,140],[452,0,80],[452,461,139],[453,0,80],[453,461,139],[454,0,80],[454,461,139],[455,0,80],[455,461,139],[456,0,80],[456,462,138],[457,0,80],[457,462,138],[458,0,80],[458,462,138],[459,0,80],[459,462,138],[460,0,80],[460,462,138],[461,0,80],[461,462,138],[462,0,80],[462,462,138],[463,0,80],[463,463,137],[464,0,80],[464,463,137],[465,0,80],[465,463,137],[466,0,80],[466,463,137],[467,0,80],[467,463,137],[468,0,80],[468,464,136],[469,0,80],[469,467,133],[470,0,80],[470,470,130],[471,0,80],[471,473,127],[472,0,80],[472,476,124],[473,0,80],[473,479,121],[474,0,80],[474,482,118],[475,0,80],[475,484,116],[476,0,80],[476,485,115],[477,0,79],[477,486,114],[478,0,79],[478,486,114],[479,0,79],[479,486,114],[480,0,79],[480,486,114],[481,0,79],[481,487,113],[482,0,79],[482,487,113],[483,0,79],[483,487,113],[484,0,79],[484,488,112],[485,0,79],[485,489,111],[486,0,79],[486,489,111],[487,0,79],[487,489,111],[488,0,79],[488,490,110],[489,0,79],[489,490,110],[490,0,79],[490,491,109],[491,0,79],[491,491,109],[492,0,79],[492,491,109],[493,0,79],[493,491,109],[494,0,79],[494,491,109],[495,0,79],[495,492,108],[496,0,79],[496,492,108],[497,0,79],[497,492,108],[498,0,79],[498,492,108],[499,0,79],[499,492,108],[500,0,79],[500,493,107],[501,0,79],[501,493,107],[502,0,79],[502,493,107],[503,0,79],[503,493,107],[504,0,79],[504,493,107],[505,0,79],[505,494,106],[506,0,79],[506,494,106],[507,0,78],[507,494,106],[508,0,78],[508,494,106],[509,0,78],[509,494,106],[510,0,78],[510,495,105],[511,0,78],[511,495,105],[512,0,78],[512,495,105],[513,0,78],[513,495,105],[514,0,78],[514,495,105],[515,0,78],[515,496,104],[516,0,78],[516,496,104],[517,0,78],[517,496,104],[518,0,79],[518,496,104],[519,0,79],[519,496,104],[520,0,79],[520,496,104],[521,0,79],[521,496,104],[522,0,78],[522,496,104],[523,0,78],[523,497,103],[524,0,78],[524,497,103],[525,0,78],[525,497,103],[526,0,78],[526,497,103],[527,0,78],[527,497,103],[528,0,78],[528,497,103],[529,0,78],[529,497,103],[530,0,78],[530,498,102],[531,0,78],[531,498,102],[532,0,78],[532,498,102],[533,0,78],[533,498,102],[534,0,78],[534,498,102],[535,0,78],[535,498,102],[536,0,78],[536,498,102],[537,0,78],[537,498,102],[538,0,78],[538,498,102],[539,0,78],[539,498,102],[540,0,78],[540,499,101],[541,0,78],[541,499,101],[542,0,78],[542,499,101],[543,0,78],[543,499,101],[544,0,78],[544,499,101],[545,0,78],[545,499,101],[546,0,78],[546,500,100],[547,0,78],[547,500,100],[548,0,78],[548,500,100],[549,0,78],[549,500,100],[550,0,78],[550,500,100],[551,0,77],[551,500,100],[552,0,77],[552,500,100],[553,0,77],[553,500,100],[554,0,77],[554,500,100],[555,0,77],[555,500,100],[556,0,77],[556,501,99],[557,0,77],[557,501,99],[558,0,77],[558,501,99],[559,0,77],[559,501,99],[560,0,77],[560,501,99],[561,0,77],[561,501,99],[562,0,77],[562,501,99],[563,0,77],[563,501,99],[564,0,77],[564,502,98],[565,0,77],[565,502,98],[566,0,77],[566,502,98],[567,0,77],[567,502,98],[568,0,77],[568,502,98],[569,0,77],[569,502,98],[570,0,77],[570,502,98],[571,0,76],[571,503,97],[572,0,76],[572,503,97],[573,0,76],[573,503,97],[574,0,76],[574,503,97],[575,0,76],[575,503,97],[576,0,76],[576,503,97],[577,0,76],[577,503,97],[578,0,76],[578,504,96],[579,0,76],[579,504,96],[580,0,76],[580,504,96],[581,0,76],[581,504,96],[582,0,76],[582,504,96],[583,0,76],[583,505,95],[584,0,76],[584,505,95],[585,0,76],[585,505,95],[586,0,76],[586,505,95],[587,0,76],[587,506,94],[588,0,76],[588,506,94],[589,0,76],[589,506,94],[590,0,76],[590,507,93],[591,0,76],[591,507,93],[592,0,76],[592,507,93],[593,0,75],[593,507,93],[594,0,75],[594,508,92],[595,0,75],[595,508,92],[596,0,75],[596,509,91],[597,0,75],[597,509,91],[598,0,75],[598,509,91],[599,0,75],[599,510,90],[600,0,75],[600,511,89],[601,0,75],[601,511,89],[602,0,75],[602,512,88],[603,0,75],[603,513,87],[604,0,74],[604,513,87],[605,0,74],[605,514,86],[606,0,74],[606,515,85],[607,0,74],[607,516,84],[608,0,74],[608,517,83],[609,0,74],[609,519,81],[610,0,74],[610,521,79],[611,0,74],[611,523,77],[612,0,74],[612,525,75],[613,0,73],[613,526,74],[614,0,73],[614,527,73],[615,0,73],[615,528,72],[616,0,73],[616,529,71],[617,0,73],[617,530,70],[618,0,73],[618,531,69],[619,0,73],[619,532,68],[620,0,73],[620,533,67],[621,0,73],[621,534,66],[622,0,73],[622,534,66],[623,0,73],[623,535,65],[624,0,73],[624,536,64],[625,0,73],[625,537,63],[626,0,72],[626,537,63],[627,0,72],[627,538,62],[628,0,72],[628,539,61],[629,0,72],[629,539,61],[630,0,72],[630,540,60],[631,0,72],[631,541,59],[632,0,72],[632,541,59],[633,0,71],[633,542,58],[634,0,71],[634,543,57],[635,0,71],[635,543,57],[636,0,71],[636,544,56],[637,0,71],[637,544,56],[638,0,71],[638,545,55],[639,0,71],[639,545,55],[640,0,71],[640,546,54],[641,0,70],[641,546,54],[642,0,70],[642,547,53],[643,0,70],[643,548,52],[644,0,70],[644,549,51],[645,0,70],[645,550,50],[646,0,70],[646,550,50],[647,0,69],[647,551,49],[648,0,69],[648,552,48],[649,0,69],[649,553,47],[650,0,69],[650,554,46],[651,0,69],[651,554,46],[652,0,69],[652,556,44],[653,0,69],[653,558,42],[654,0,69],[654,559,41],[655,0,68],[655,559,41],[656,0,68],[656,560,40],[657,0,68],[657,561,39],[658,0,68],[658,562,38],[659,0,67],[659,562,38],[660,0,67],[660,562,38],[661,0,67],[661,563,37],[662,0,67],[662,563,37],[663,0,67],[663,564,36],[664,0,67],[664,565,35],[665,0,67],[665,566,34],[666,0,67],[666,567,33],[667,0,66],[667,569,31],[668,0,66],[668,569,31],[669,0,66],[669,570,30],[670,0,66],[670,571,29],[671,0,66],[671,571,29],[672,0,65],[672,572,28],[673,0,65],[673,572,28],[674,0,65],[674,572,28],[675,0,65],[675,571,29],[676,0,65],[676,570,30],[677,0,65],[677,569,31],[678,0,65],[678,569,31],[679,0,64],[679,568,32],[680,0,64],[680,567,33],[681,0,64],[681,566,34],[682,0,64],[682,489,2],[682,565,35],[683,0,64],[683,482,11],[683,564,36],[684,0,64],[684,460,34],[684,563,37],[685,0,64],[685,415,22],[685,456,39],[685,562,38],[686,0,64],[686,218,3],[686,379,2],[686,385,111],[686,522,2],[686,561,39],[687,0,64],[687,199,35],[687,352,145],[687,520,5],[687,560,40],[688,0,64],[688,162,76],[688,351,147],[688,518,9],[688,558,42],[689,0,64],[689,149,96],[689,251,2],[689,351,148],[689,516,12],[689,555,45],[690,0,65],[690,98,18],[690,123,132],[690,350,150],[690,512,19],[690,555,45],[691,0,257],[691,349,156],[691,508,27],[691,545,3],[691,552,48],[692,0,259],[692,347,253],[693,0,262],[693,346,254],[694,0,265],[694,345,255],[695,0,268],[695,343,257],[696,0,278],[696,281,2],[696,342,258],[697,0,284],[697,340,260],[698,0,286],[698,337,263],[699,0,287],[699,334,266],[700,0,288],[700,329,271],[701,0,289],[701,329,271],[702,0,291],[702,329,271],[703,0,292],[703,328,272],[704,0,293],[704,328,272],[705,0,296],[705,327,273],[706,0,307],[706,327,273],[707,0,309],[707,326,274],[708,0,311],[708,325,275],[709,0,313],[709,324,276],[710,0,600],[711,0,600],[712,0,600],[713,0,600],[714,0,600],[715,0,600],[716,0,600],[717,0,600],[718,0,600],[719,0,600],[720,0,600],[721,0,600],[722,0,600],[723,0,600],[724,0,600],[725,0,600],[726,0,600],[727,0,600],[728,0,600],[729,0,600],[730,0,600],[731,0,600],[732,0,600],[733,0,600],[734,0,600],[735,0,600],[736,0,600],[737,0,600],[738,0,600],[739,0,600],[740,0,600],[741,0,600],[742,0,600],[743,0,600],[744,0,600],[745,0,600],[746,0,600],[747,0,600],[748,0,600],[749,0,600],[750,0,600],[751,0,600],[752,0,600],[753,0,600],[754,0,600],[755,0,600],[756,0,600],[757,0,600],[758,0,600],[759,0,600],[760,0,600],[761,0,600],[762,0,600],[763,0,600],[764,0,600],[765,0,600],[766,0,600],[767,0,600],[768,0,600],[769,0,600],[770,0,600],[771,0,600],[772,0,600],[773,0,600],[774,0,600],[775,0,600],[776,0,600],[777,0,600],[778,0,600],[779,0,600],[780,0,600],[781,0,600],[782,0,600],[783,0,600],[784,0,600],[785,0,600],[786,0,600],[787,0,600],[788,0,600],[789,0,600],[790,0,600],[791,0,600],[792,0,600],[793,0,600],[794,0,600],[795,0,600],[796,0,600],[797,0,600],[798,0,600],[799,0,600]]}]};var It=i=>document.querySelector(i),kn=It("#art"),kr=It("#settings"),Kt;try{Kt=Wc(localStorage)}catch{Kt=Wc({getItem:()=>null})}var Vt=new Jo,Gn=new Zo,Gd=new $o(Kt.frameLimit),wi={},Vd={},qi=[],Hd=0,Wd=0,cn=[],ii=0,Jc=0,Wt,Ht,De=0,Mn=!1,tn=null,hl=!1,ai=0,ri=0,zs=0,Vn={x:300,y:282,visible:!1},Br={x:300,y:282},Yi=!1,al=0,zd=0,ol=0,Yc=0,cl=0,ul=16.7,$c=0,Kc=0,ll=0,kd=innerWidth;function th(i=!1){(i||Math.abs(innerWidth-kd)>60)&&(kd=innerWidth,document.documentElement.style.setProperty("--app-height",innerHeight+"px"))}th(!0);window.addEventListener("resize",()=>th());window.addEventListener("orientationchange",()=>setTimeout(()=>th(!0),150));for(let i of["gesturestart","gesturechange","gestureend"])document.addEventListener(i,t=>t.preventDefault(),{passive:!1});kn.addEventListener("dblclick",i=>i.preventDefault());document.addEventListener("wheel",i=>{(i.ctrlKey||i.target===kn)&&i.preventDefault()},{passive:!1});document.addEventListener("touchmove",i=>{i.touches.length>1&&i.preventDefault()},{passive:!1});var dl=new Map;for(let i of["pointerdown","pointerup"])document.addEventListener(i,t=>{t.isPrimary===!1||Gn.active!==null&&t.pointerId!==Gn.active?(dl.set(t.pointerId,performance.now()),t.preventDefault(),t.stopImmediatePropagation()):i==="pointerdown"&&dl.delete(t.pointerId)},{capture:!0,passive:!1});document.addEventListener("click",i=>{let t=dl.get(i.pointerId);t!==void 0&&performance.now()-t<1200&&(i.preventDefault(),i.stopImmediatePropagation(),dl.delete(i.pointerId))},{capture:!0});var pl=document.createElement("canvas");pl.width=600;pl.height=800;var _e=pl.getContext("2d"),Gr=document.createElement("canvas");Gr.width=600;Gr.height=800;var fl=Gr.getContext("2d");fl.fillStyle="#f5e7a5";fl.fillRect(0,0,600,800);for(let i=0;i<45e3;i++)fl.fillStyle=Math.random()>.5?"#fff9d118":"#ad945212",fl.fillRect(Math.random()*600,Math.random()*800,1,1);var Vr=document.createElement("canvas");Vr.width=600;Vr.height=800;var eh=Vr.getContext("2d"),Zi=document.createElement("canvas");Zi.width=600;Zi.height=800;var Be=Zi.getContext("2d"),ml=document.createElement("canvas");ml.width=600;ml.height=800;var Zc=ml.getContext("2d"),Hr=document.createElement("canvas");Hr.width=600;Hr.height=800;var Dg=Hr.getContext("2d"),Qc=-1;function Xd(i){Od(Dg,i,600,800)}function gl(i=!1,t=!1){if(!(!Ht||!i&&Qc===Ht.coveredWeight)){if(Qc=Ht.coveredWeight,Be.clearRect(0,0,600,800),Be.fillStyle="#fff",t&&yl())Be.fillRect(0,0,600,800);else for(let e=0;e<Ht.bound.length;e++)Ht.bound[e]&&Be.fillRect(e%120*5,Math.floor(e/120)*5,5,5);Be.globalCompositeOperation="destination-in",Be.drawImage(wi[Me[De].id],0,0),Be.globalCompositeOperation="source-in",Be.drawImage(Hr,0,0),Be.globalCompositeOperation="source-over",Zc.clearRect(0,0,600,800),Zc.drawImage(Vr,0,0),Zc.drawImage(Zi,0,0),Wt?.setCoatMask(ml),Wr()}}var _l=document.createElement("canvas");_l.width=600;_l.height=800;var ks=_l.getContext("2d");function Wr(){_e.clearRect(0,0,600,800),_e.drawImage(Gr,0,0),_e.globalAlpha=.035;for(let i=De;i<Me.length;i++)_e.drawImage(wi[Me[i].id],0,0);if(!hl&&ai===0&&(_e.globalAlpha=.1,_e.drawImage(wi[Me[De].id],0,0)),_e.globalAlpha=1,_e.drawImage(_l,0,0),Vt.phase==="rolling"&&cn[ii]){let i=cn[ii],t=Ad(i.piece,ai);t.length&&(_e.save(),_e.beginPath(),t.forEach((e,n)=>n?_e.lineTo(e.x,e.y):_e.moveTo(e.x,e.y)),_e.closePath(),_e.clip(),_e.drawImage(i.brown,i.piece.bounds.x,i.piece.bounds.y),_e.restore())}_e.drawImage(Vr,0,0),_e.drawImage(Zi,0,0),_e.globalAlpha=.96,_e.drawImage(wi.lines,0,0),_e.globalAlpha=1,Wt?.paperChanged()}var Pn,si=!0,Or,Bs,bi,jc=-1,zr={};async function nh(){Pn||(Pn=new(window.AudioContext||window.webkitAudioContext),Bs=Pn.createGain(),Bs.gain.value=0,Bs.connect(Pn.destination),await Promise.all(["brush","pour"].map(async i=>{try{let t=await(await fetch(`audio/${i}.m4a?v=4`)).arrayBuffer();zr[i]=await Pn.decodeAudioData(t)}catch(t){console.warn("Ses y\xFCklenemedi",i,t)}})),zr.brush&&(Or=Pn.createBufferSource(),Or.buffer=zr.brush,Or.loop=!0,Or.connect(Bs),Or.start())),await Pn.resume()}function xl(i=0){if(!(!Pn||!Bs)&&(Bs.gain.setTargetAtTime(si&&Vt.phase==="brush"?Math.min(1,i*5):0,Pn.currentTime,.035),si&&Vt.phase==="pour"&&Vt.elapsed>=.48&&Vt.elapsed<1.3&&jc!==Vt.serial&&zr.pour&&(jc=Vt.serial,bi?.stop(),bi=Pn.createBufferSource(),bi.buffer=zr.pour,bi.connect(Pn.destination),bi.start()),!si&&bi)){try{bi.stop()}catch{}bi=null}}It("#sound").textContent="Ses: a\xE7\u0131k";It("#sound").setAttribute("aria-label","Sesi kapat");It("#sound").onclick=async()=>{si=!si,await nh(),xl(0),It("#sound").textContent=si?"Ses: a\xE7\u0131k":"Ses: kapal\u0131",It("#sound").setAttribute("aria-label",si?"Sesi kapat":"Sesi a\xE7")};function Gs(){Yi=!1,Gn.cancel(),qi.length=0,xl(0)}function ih(){kr.close(),Vn.visible=!1,ri=0}It("#settings-open").onclick=()=>{Gs(),Vn.visible=!1,qd(),kr.showModal()};It("#settings-close").onclick=ih;It("#settings-done").onclick=ih;kr.addEventListener("cancel",()=>{Gs(),ri=0});function Xr(i){Kt=i,document.body.dataset.layout=Kt.layout,It("#perf-hud").hidden=!Kt.showStats;try{Ld(localStorage,Kt)}catch{}Wt?.applySettings(Kt),Gd.setLimit(Kt.frameLimit),Kt.autoAdvance||(zs=0),qd(),ri=0,vn()}function qd(){document.querySelectorAll('input[name="layout"]').forEach(i=>i.checked=i.value===Kt.layout);for(let[i,t]of Object.entries({"auto-advance":"autoAdvance","show-stats":"showStats",sparkles:"sparkles",reflections:"reflections",relief:"relief","moving-light":"movingLight"}))It("#"+i).checked=Kt[t];for(let[i,t]of Object.entries({"quality-profile":"profile","render-scale":"renderScale","shadow-quality":"shadow","frame-limit":"frameLimit","pour-amount":"pourAmount",pace:"pace"}))It("#"+i).value=Kt[t];It("#resolution-readout").textContent="%"+Math.round(Kt.renderScale*100),It("#pour-readout").textContent="%"+Math.round(Kt.pourAmount*100)}document.querySelectorAll('input[name="layout"]').forEach(i=>i.onchange=()=>Xr({...Kt,layout:i.value,autoAdvance:i.value==="flow"}));It("#quality-profile").onchange=i=>{i.target.value!=="custom"&&Xr(Dd(Kt,i.target.value))};var Ng={"auto-advance":"autoAdvance","show-stats":"showStats",sparkles:"sparkles",reflections:"reflections",relief:"relief","moving-light":"movingLight"};for(let[i,t]of Object.entries(Ng))It("#"+i).onchange=e=>Xr({...Kt,[t]:e.target.checked,profile:["autoAdvance","showStats"].includes(t)?Kt.profile:"custom"});for(let[i,t,e]of[["render-scale","renderScale",!0],["pour-amount","pourAmount",!0],["shadow-quality","shadow",!1],["frame-limit","frameLimit",!0],["pace","pace",!1]])It("#"+i).addEventListener(i.includes("scale")||i.includes("amount")?"input":"change",n=>Xr({...Kt,[t]:e?Number(n.target.value):n.target.value,profile:["renderScale","shadow","frameLimit"].includes(t)?"custom":Kt.profile}));function yl(){return Ht&&qc(Ht.coverage,Kt.pace).ready}function vn(){if(!Ht)return;let i=Vt.phase,t=qc(Ht.coverage,Kt.pace).percent;It("#stage-label").textContent=`${String(De+1).padStart(2,"0")} / ${Me.length}`,It("#stage-label").title=Me[De].name,It("#color-dot").style.background=Me[De].color,It("#coverage").textContent=t+"%",It("#progress-fill").style.width=t+"%";let e={peel:["\u2197","Bir kez dokun.","S\u0131radaki k\xE2\u011F\u0131t rulolanarak a\xE7\u0131ls\u0131n.","SOY"],rolling:["\u2197","K\xE2\u011F\u0131t a\xE7\u0131l\u0131yor\u2026","A\xE7\u0131lan kahverengi alan simi tutacak.","SOY"],pour:["\u283F","Bir y\u0131\u011F\u0131n par\u0131lt\u0131.","Kap bo\u015Fals\u0131n; sonra simi parma\u011F\u0131nla yay.","D\xD6K"],brush:["\u25B0","Y\u0131\u011F\u0131ndan ba\u015Fla, kenarlara yay.","Sim yetmezse + Sim ile bir y\u0131\u011F\u0131n daha ekle.","YAY"],shake:["\u222A","\u0130ki yandan b\xFCk, ortaya topla.","Fazla sim ortadaki oluktan kutuya ak\u0131yor.","BO\u015EALT"],complete:["\u2727","Ellerine sa\u011Fl\u0131k.","Biraz sab\u0131r, binlerce k\xFC\xE7\xFCk par\u0131lt\u0131.","B\u0130TT\u0130"]};i==="rolling"&&(e.rolling=["\u2197",`Par\xE7a ${ii+1} / ${cn.length} \xB7 yava\u015F\xE7a soyuluyor`,ai<.2?"C\u0131mb\u0131z kenardan tutuyor.":"Sar\u0131 k\xE2\u011F\u0131t ayr\u0131l\u0131yor, yap\u0131\u015Fkan a\xE7\u0131l\u0131yor.","SOY"]);let n=e[i]||e.brush;It("#phase-icon").textContent=n[0],It("#instruction-title").textContent=n[1],It("#instruction-text").textContent=i==="brush"&&Kt.layout!=="flow"?"Sim ekle ile a\xE7\u0131k alan\u0131n \xFCst\xFCne yeni bir y\u0131\u011F\u0131n d\xF6kebilirsin.":n[2],It("#phase-label").textContent=n[3];let s=i==="brush"&&yl()&&!Mn;It("#next").hidden=!s,It("#next").disabled=!s,It("#next").innerHTML=De===Me.length-1?"Eserini tamamla <span>\u2727</span>":"Sonraki renk <span>\u2192</span>",It("#auto-status").hidden=!0,s&&(It("#instruction-title").textContent="Renk tamamland\u0131.",It("#instruction-text").textContent=Kt.autoAdvance?"Parma\u011F\u0131n\u0131 kald\u0131r; s\u0131radaki renge ge\xE7elim.":"Sonraki renk ile devam et."),It("#quick-actions").hidden=i!=="brush"||Mn||s;for(let r of document.querySelectorAll("[data-tool]")){let a=r.dataset.tool,o=a===(i==="shake"?"clean":i==="rolling"?"peel":i);r.classList.toggle("selected",o),r.disabled=Mn||Vt.busy||(a==="peel"?i!=="peel":i==="peel")}}function Ug(){return Bd[Me[De].id].map(i=>{let t=i.bounds,e=document.createElement("canvas");e.width=t.w,e.height=t.h;let n=e.getContext("2d");n.fillStyle="#fff";for(let[l,c,h]of i.runs)n.fillRect(c,l,h,1);let s=document.createElement("canvas");s.width=t.w,s.height=t.h;let r=s.getContext("2d");r.drawImage(Gr,t.x,t.y,t.w,t.h,0,0,t.w,t.h),r.globalAlpha=.96,r.drawImage(wi.lines,t.x,t.y,t.w,t.h,0,0,t.w,t.h),r.globalAlpha=1,r.globalCompositeOperation="destination-in",r.drawImage(e,0,0);let a=document.createElement("canvas");a.width=t.w,a.height=t.h;let o=a.getContext("2d");return o.fillStyle="#b98e65",o.fillRect(0,0,t.w,t.h),o.globalCompositeOperation="destination-in",o.drawImage(e,0,0),{piece:i,paper:s,brown:a}})}function Yd(i){for(;Jc<i;){let t=cn[Jc++];ks.drawImage(t.brown,t.piece.bounds.x,t.piece.bounds.y)}}function Fg(){let i=wd(cn.map(t=>t.piece),Vt.elapsed);Yd(i.index),ii!==i.index&&(ii=i.index,Wt.setPeelPiece(cn[ii].paper,cn[ii].piece)),ai=i.progress,Wt.peelProgress(ai),Wr()}function sh(){Ht=new Zr,Ht.setMask(Vd[Me[De].id]),Vt.reset(),hl=!1,ai=0,tn=null,ri=0,qi.length=0,ii=0,Jc=0,ks.globalCompositeOperation="source-over",ks.clearRect(0,0,600,800),cn=Ug(),Vt.setRollDuration(bd(cn.map(i=>i.piece))),Xd(Me[De].color),Qc=-1,Be.clearRect(0,0,600,800),Wt.setStage(De),gl(!0),Wr(),Wt.setPeelPiece(cn[0].paper,cn[0].piece),vn()}function rh(){si&&nh(),!(Mn||!Vt.roll())&&(Yi=!1,qi.length=0,ai=0,vn())}function Zd(){let i=Xc(Ht.targetCount,Kt,Ht.capacity);Ht.capacity-Ht.count<i&&(Ht.compact(),Wt.currentInitialized=0);let t=Xc(Ht.targetCount,Kt,Ht.capacity-Ht.count);if(t<50){Vt.phase="brush",It("#instruction-text").textContent="K\xE2\u011F\u0131tta bol sim var. \xD6nce yay veya fazlas\u0131n\u0131 kutuya bo\u015Falt.";return}let e=Me[De].pour;if(Ht.coverage>.15){let s=-1/0,r=e.y;for(let a=0;a<Ht.target.length;a++)if(Ht.target[a]>12&&!Ht.bound[a]){let o=a%120*5+2,l=Math.floor(a/120)*5+2;if(!Ht.onGlue(o,l))continue;let c=0;for(let f=-3;f<=3;f++)for(let u=-3;u<=3;u++){let d=a+f*120+u;d>=0&&d<Ht.target.length&&!Ht.bound[d]&&(c+=Ht.target[d])}let h=c-Math.abs(l-r)*1.2;h>s&&(s=h,e={x:o,y:l})}}let n=Nd(e,Ht.targetCount);jc=-1,tn={...n.anchor,...n,dose:t,emitted:0,elapsed:0}}function Jd(){Mn||!Vt.pour()||(Yi=!1,qi.length=0,Zd(),ri=0,vn())}function vl(i=!1){Mn||!Vt.shake(i)||(Hd++,Gs(),Wt.beginCleanup(),i&&gl(!0,!0),tn=null,Wt.posePour(null),ri=0,vn())}function Og(){Wd++,gl(!0,!0),eh.drawImage(Zi,0,0),Wt.updateGrains(Ht),De<Me.length-1?(De++,sh(),zs=Kt.autoAdvance?.22:0):(Mn=!0,Vt.phase="complete",Vn.visible=!1,Wt.current.visible=!1,Wt.heap.visible=!1,It("#complete").hidden=!1,vn())}for(let i of document.querySelectorAll("[data-tool]"))i.onclick=()=>{let t=i.dataset.tool;t==="peel"?rh():t==="pour"?Jd():t==="clean"?vl(!1):vn()};It("#add-sand").onclick=Jd;It("#shake").onclick=()=>vl(!1);It("#next").onclick=()=>{yl()&&vl(!0)};function $d(){Wt&&(Gs(),Mn=!1,De=0,zs=0,eh.clearRect(0,0,600,800),Be.clearRect(0,0,600,800),Wt.reset(),It("#complete").hidden=!0,sh())}It("#reset").onclick=()=>{$d(),ih()};It("#again").onclick=$d;It("#save").onclick=()=>{let i=document.createElement("a");i.href=Wt.capture(),i.download="sim-atolyesi-gotham.png",i.click()};kn.addEventListener("pointerdown",i=>{if(i.preventDefault(),!(!Wt||Mn||Vt.busy||!Gn.begin(i.pointerId,i.isPrimary!==!1))){if(kn.setPointerCapture(i.pointerId),Vn={...Wt.mapPointer(i),visible:!0},Br={...Vn},si&&nh(),Vt.phase==="peel"){rh();return}Yi=!0}});kn.addEventListener("pointermove",i=>{if(!Wt||Mn||i.isPrimary===!1)return;if(Gn.active===null&&i.pointerType==="mouse"&&!i.buttons){Vn={...Wt.mapPointer(i),visible:!0};return}if(!Gn.owns(i.pointerId)||!Yi||Vt.phase!=="brush")return;let t=Wt.mapPointer(i);Vn={...t,visible:!0},Math.hypot(t.x-Br.x,t.y-Br.y)>.1&&Sd(qi,{from:{...Br},to:{...t}}),Br=t});function Bg(i){Gn.end(i.pointerId)&&(Yi=!1,i.pointerType!=="mouse"&&(Vn.visible=!1),xl(0),vn())}for(let i of["pointerup","pointercancel","lostpointercapture"])kn.addEventListener(i,Bg);kn.addEventListener("pointerleave",i=>{Gn.active===null&&(Vn.visible=!1)});window.addEventListener("blur",Gs);document.addEventListener("visibilitychange",Gs);function zg(){let i=Ht.stats(),t=Wt.metrics();Object.assign(kn.dataset,{version:"5.1",phase:Vt.phase,layout:Kt.layout,activePointer:Gn.active??"",emitted:i.emitted,air:i.air,free:i.free,pressed:i.pressedFree,fresh:i.freshFree,moundHeight:i.maxMoundHeight.toFixed(2),bound:i.bound,lost:i.lost,coverage:i.coverage.toFixed(5),height:i.maxHeight.toFixed(2),stage:De,peelPart:ii+1,peelParts:cn.length,peelProgress:ai.toFixed(3),collected:Wt.collectedCount,detached:Wt.spill.count,triangles:t.triangles,draws:t.draws,shakes:Hd,advances:Wd,cameraZ:Wt.camera.position.z.toFixed(2),fps:Math.round(cl),flowSerial:Vt.serial,shaking:Vt.phase==="shake"?1:0}),It("#hud-fps").textContent=Math.round(cl)+" FPS",It("#hud-detail").textContent=ul.toFixed(1)+" ms";for(let[e,n]of Object.entries({"stat-fps":Math.round(cl),"stat-frame":ul.toFixed(1),"stat-sim":$c.toFixed(1),"stat-render":Kc.toFixed(1),"stat-particles":(i.air+i.free+Wt.spill.count+(Wt.boxGroup.visible?Wt.collected.count:0)).toLocaleString("tr"),"stat-draws":t.draws,"stat-triangles":t.triangles.toLocaleString("tr"),"stat-memory":performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1):"\u2014"}))It("#"+e).textContent=n;It("#buffer-size").textContent=`${t.width} \xD7 ${t.height} piksel \xB7 oyun s\u0131f\u0131rlanmaz`}function Kd(i){if(requestAnimationFrame(Kd),document.hidden)return;let t=i-al;if(!Gd.shouldRender(i))return;let e=Math.min(al?t/1e3:1/60,.06);al||(ol=i),al=i,Yc++,i-ol>=700&&(cl=Yc*1e3/(i-ol),ol=i,Yc=0),ul=ul*.9+e*1e3*.1;let n=performance.now();if(ll=0,zs>0&&!kr.open&&(zs-=e,zs<=0&&rh()),Vt.phase==="rolling"&&Fg(),Vt.phase==="pour"&&tn){tn.elapsed=Vt.elapsed,Object.assign(tn,Ud(tn,Math.max(0,(Vt.elapsed-.48)/.82))),Wt.posePour(tn);let o=Math.min(1,Math.max(0,(Vt.elapsed-.48)/.82)),l=Math.floor(tn.dose*o),c=l-tn.emitted;if(c>0){let h=Wt.pourOrigin();tn.emitted+=Ht.emit(h.x,h.y,c,{spread:4,fan:tn.fan,height:Math.max(12,h.z)}),Object.assign(kn.dataset,{emitterX:h.x.toFixed(2),emitterY:h.y.toFixed(2),emitterZ:h.z.toFixed(2)})}}for(let o of qi)ll+=Ht.brush(o.from,o.to,Kt.pace==="fast"?48:39);qi.length=0;let s=Vt.phase==="shake"?Ko(Vt.progress):{bend:0,pitch:0};Wt.updateBend(s.bend,s.pitch),Ht.step(Math.min(e,.04),{shaking:Vt.phase==="shake",bend:s.bend,tilt:s.pitch}),Wt.collectSpill(Ht,!0);let r=Vt.tick(e,{drainComplete:Vt.phase!=="shake"||!Ht.hasLoose()&&Wt.spills.length===0});r==="rolled"&&(Yd(cn.length),hl=!0,ai=1,Wr(),Wt.peelProgress(1),Zd(),vn()),r==="poured"&&(tn=null,Wt.posePour(null),vn()),(r==="shaken"||r==="advance")&&(Wt.collectSpill(Ht),Ht.removeLoose(),Ht.compact(),Wt.currentInitialized=0,r==="advance"?Og():vn()),Kt.autoAdvance&&Vt.phase==="brush"&&yl()&&Gn.active===null&&!kr.open&&!Mn?(ri+=e,ri>.55&&vl(!0)):ri=0,gl(),$c=$c*.85+(performance.now()-n)*.15,xl(Vt.phase==="pour"?.14:Vt.phase==="shake"?.15:Vt.phase==="rolling"?.06:ll?Math.min(.16,.015+ll*3e-5):0);let a=performance.now();Wt.render(Ht,{time:i,dt:e,phase:Vt.phase,down:Yi,pointer:Vn,peeled:hl,pour:tn,shakeProgress:Vt.phase==="shake"?Vt.progress:0,finished:Mn}),Kc=Kc*.85+(performance.now()-a)*.15,(zd+=e)>.2&&(zd=0,vn(),zg())}Xr(Kt);try{await Promise.all(["lines",...Me.map(i=>i.id)].map(i=>new Promise((t,e)=>{let n=new Image;n.onload=()=>{wi[i]=n,t()},n.onerror=()=>e(Error("\u015Eablon y\xFCklenemedi: "+i)),n.src=`assets/${i}.png?v=4`})));for(let i of Me){ks.clearRect(0,0,600,800),ks.drawImage(wi[i.id],0,0);let t=ks.getImageData(0,0,600,800).data,e=new Uint8Array(600*800);for(let n=0;n<e.length;n++)e[n]=t[n*4+3]>80?1:0;Vd[i.id]=e}De=Fd(location.search,Me.length);for(let i=0;i<De;i++)Xd(Me[i].color),Be.clearRect(0,0,600,800),Be.drawImage(Hr,0,0),Be.globalCompositeOperation="destination-in",Be.drawImage(wi[Me[i].id],0,0),Be.globalCompositeOperation="source-over",eh.drawImage(Zi,0,0);Be.clearRect(0,0,600,800),Wr(),Wt=new il(kn,pl,Me.map(i=>i.color),Kt),sh(),requestAnimationFrame(Kd)}catch(i){It("#instruction-title").textContent="At\xF6lye a\xE7\u0131lamad\u0131.",It("#instruction-text").textContent="Sayfay\u0131 g\xFCncel bir taray\u0131c\u0131da yenileyerek tekrar dene.",console.error(i)}
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
