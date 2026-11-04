var Nl={velvet:{name:"Kadife",note:"A\u011F\u0131r taneler, dar iz, k\u0131sa kay\u0131\u015F.",mobility:.45,response:.75,brushWidth:.9,brushShape:"round",grainSize:.9,jarShape:"slim",pourStyle:"ribbon"},natural:{name:"Do\u011Fal",note:"F\u0131r\xE7an\u0131n \xF6n\xFCnde birikir, kenarlardan hafif\xE7e a\xE7\u0131l\u0131r.",mobility:1,response:1,brushWidth:1,brushShape:"flat",grainSize:1,jarShape:"glass",pourStyle:"fan"},fluid:{name:"Ak\u0131\u015Fkan",note:"Daha geni\u015F yelpaze, daha uzun kay\u0131\u015F.",mobility:1.6,response:1.2,brushWidth:1.1,brushShape:"fan",grainSize:1.08,jarShape:"bowl",pourStyle:"pulse"}},oa={flat:{radius:34,width:68,depth:26},round:{radius:23,width:46,depth:38},fan:{radius:46,width:92,depth:30}};function Ul(i){return(oa[i.brushShape]||oa.flat).radius*(i.brushWidth||1)}function Fl(i={}){let e=i.mobility??1,t=i.response??1;return{mobility:e,response:t,drag:19-e*6,pressure:.45+e*.55,repose:6-e*1.5,carry:Math.min(.98,.65+t*.25),fan:.08+e*.18,inertia:8+e*24}}function Lc(i,e){return{...i,...Nl[e],feel:e}}function Dc(i,e="fan"){let t=Math.max(0,Math.min(1,i));return e==="pulse"?t-Math.sin(t*Math.PI*6)*.65/(Math.PI*6):e==="ribbon"?t*t*(3-2*t):t}var Fi=0,Bn=1,On=2,En=3,Ge=600,qe=800,Lt=5,Ze=Ge/Lt,Mt=qe/Lt,Oi=32,Ol=Oi+2,Nc=[-1,1,0,0,-.707,.707,-.707,.707],Uc=[0,0,-1,1,-.707,-.707,.707,.707],la=class{constructor({capacity:e=3e4,random:t=Math.random}={}){this.behavior=Fl(),this.lastMoved=0,this.capacity=e,this.random=t,this.time=0,this.count=0,this.emitted=0;for(let n of["x","y","z","vx","vy","vz","seed","contactTime"])this[n]=new Float32Array(e);this.pressed=new Uint8Array(e),this.freshCount=0,this.state=new Uint8Array(e),this.bin=new Int32Array(e),this.density=new Float32Array(Ze*Mt),this.height=new Float32Array(Ze*Mt),this.pressure=new Float32Array(Ze*Mt),this.moundDensity=new Float32Array(Ze*Mt),this.moundHeight=new Float32Array(Ze*Mt),this.neighbors=new Int32Array(Ze*Mt*8);for(let n=0;n<Ze*Mt;n++){let s=n%Ze,r=n/Ze|0;this.neighbors.set([s>0?n-1:n,s<Ze-1?n+1:n,r>0?n-Ze:n,r<Mt-1?n+Ze:n,r>0&&s>0?n-Ze-1:n,r>0&&s<Ze-1?n-Ze+1:n,r<Mt-1&&s>0?n+Ze-1:n,r<Mt-1&&s<Ze-1?n+Ze+1:n],n*8)}this.flowSum=new Float32Array(Ze*Mt),this.flowCDF=new Float32Array(Ze*Mt*8),this.flowForce=new Float32Array(Ze*Mt*8),this.bound=new Uint8Array(Ze*Mt),this.target=new Uint8Array(Ze*Mt),this.mask=new Uint8Array(Ge*qe),this.targetCount=0,this.coveredWeight=0,this.lost=0}setMask(e){this.mask.set(e),this.target.fill(0),this.bound.fill(0),this.targetCount=0,this.coveredWeight=0;for(let t=0;t<qe;t+=Lt)for(let n=0;n<Ge;n+=Lt){let s=0;for(let r=0;r<Lt;r++)for(let a=0;a<Lt;a++)s+=!!e[(t+r)*Ge+n+a];s>=1&&(this.target[t/Lt*Ze+n/Lt]=s,this.targetCount+=s/(Lt*Lt))}}cell(e,t){return e>=0&&e<Ge&&t>=0&&t<qe?Math.floor(t/Lt)*Ze+Math.floor(e/Lt):-1}onGlue(e,t){return e>=0&&e<Ge&&t>=0&&t<qe&&this.mask[(t|0)*Ge+(e|0)]>0}emit(e,t,n,{spread:s=13,height:r=165,fan:a=16}={}){if(!Number.isFinite(e)||!Number.isFinite(t))throw new TypeError("A pile needs finite paper coordinates");let o=0;for(let l=0;l<n&&this.count<this.capacity;l++){let c=this.count++,h=this.random()*Math.PI*2,f=Math.sqrt(this.random())*s;this.pressed[c]=0,this.seed[c]=this.random(),this.x[c]=e+Math.cos(h)*f,this.y[c]=t+Math.sin(h)*f,this.z[c]=r+this.random()*32,this.vz[c]=-45-this.random()*35;let d=Math.sqrt(this.random())*a;this.vx[c]=Math.cos(h)*d,this.vy[c]=Math.sin(h)*d,this.state[c]=Fi,o++}return this.emitted+=o,o}bind(e){if(!this.pressed[e]||this.state[e]===On||this.state[e]===En)return!1;let t=this.cell(this.x[e],this.y[e]);if(t<0)return!1;let n=t;if(!this.target[n]||this.bound[n]||!this.onGlue(this.x[e],this.y[e])){let s=65,r=null,a=t%Ze,o=Math.floor(t/Ze);for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++){let h=a+c,f=o+l;if(h<0||h>=Ze||f<0||f>=Mt)continue;let d=f*Ze+h;if(!(!this.target[d]||this.bound[d]))for(let u=f*Lt;u<(f+1)*Lt;u++)for(let x=h*Lt;x<(h+1)*Lt;x++){let _=(x+.5-this.x[e])**2+(u+.5-this.y[e])**2;_<s&&this.mask[u*Ge+x]&&(s=_,r={x:x+.5,y:u+.5,k:d})}}if(!r)return!1;this.x[e]=r.x,this.y[e]=r.y,n=r.k}return this.state[e]=On,this.z[e]=1.7+this.seed[e]*.8,this.vx[e]=this.vy[e]=this.vz[e]=0,this.coveredWeight+=this.target[n]/(Lt*Lt),this.bound[n]++,!0}setBehavior(e){this.behavior=Fl(e)}brush(e,t,n=34,s=1/60){let r=t.x-e.x,a=t.y-e.y,o=r*r+a*a,l=Math.sqrt(o);if(l<.02)return 0;let c=n*n,h=r/l,f=a/l,d=this.behavior,u=Math.min(1.5,l/Math.max(.001,s)/700),x=0;for(let _=0;_<this.count;_++){if(this.state[_]!==Bn)continue;let m=Math.max(0,Math.min(1,((this.x[_]-e.x)*r+(this.y[_]-e.y)*a)/o)),p=this.x[_]-e.x-m*r,M=this.y[_]-e.y-m*a,E=p*p+M*M;if(E>c)continue;let b=Math.sqrt(Math.max(0,1-E/c)),A=this.cell(this.x[_],this.y[_]),w=A<0?0:this.density[A],g=1/(1+Math.min(70,w)*.004/d.response),S=d.carry*(.72+.28*b)*(.78+.22*this.seed[_])*g,L=l*(1-m)*S,C=(p*-f+M*h)/n,N=(C+(this.seed[_]*137%1-.5)*.4)*d.fan*(.65+.35*u);this.pressed[_]=1,this.contactTime[_]=this.time,A>=0&&(this.z[_]=Math.min(this.z[_],1.7+this.height[A]*.32*(.1+this.seed[_]*.9)));let F=Math.max(1,Math.ceil(L/4));for(let k=0;k<F&&(this.x[_]+=(h-f*N)*L/F,this.y[_]+=(f+h*N)*L/F,!this.bind(_));k++);if(this.state[_]!==On){let k=Math.max(.05,u)*d.inertia;this.vx[_]=h*k-f*C*k*.45,this.vy[_]=f*k+h*C*k*.45}x++}return this.lastMoved=x,x}step(e,{shaking:t=!1,bend:n=t?1:0,tilt:s=n*.58}={}){this.time+=e,this.density.fill(0),this.moundDensity.fill(0),this.moundHeight.fill(0),this.freshCount=0;for(let a=0;a<this.count;a++)if(this.state[a]===Bn){let o=this.cell(this.x[a],this.y[a]);this.bin[a]=o,o>=0&&(this.density[o]+=this.pressed[a]?.45:1,this.pressed[a]||(this.moundDensity[o]+=.95,this.freshCount++))}for(let a=0;a<this.height.length;a++){this.pressure[a]=this.density[a]*.95;let o=this.density[a]*4,l=this.moundDensity[a]*4;for(let c=0;c<8;c++){let h=this.neighbors[a*8+c],f=c<4?2:1;o+=this.density[h]*f,l+=this.moundDensity[h]*f}o*=.95/16,l/=16,this.height[a]=o>0?Oi*(1-Math.exp(-o/Oi)):0,this.moundHeight[a]=l>0?Oi*(1-Math.exp(-l/Oi)):0}for(let a=0;a<this.height.length;a++){let o=this.pressure[a],l=this.behavior.repose;if(this.flowSum[a]=0,o<=l)continue;let c=0;for(let h=0;h<8;h++){let f=Math.max(0,Math.min((o-this.pressure[this.neighbors[a*8+h]])/(h<4?1:1.414)-l,45))*55*this.behavior.pressure;this.flowForce[a*8+h]=f,c+=f,this.flowCDF[a*8+h]=c}this.flowSum[a]=c}let r=Math.exp(-this.behavior.drag*e);for(let a=0;a<this.count;a++){let o=this.state[a];if(o===On||o===En)continue;let l=this.cell(this.x[a],this.y[a]);if(t&&l<0&&(this.vz[a]-=900*e,this.z[a]+=this.vz[a]*e),t&&l>=0){let c=this.x[a]-Ge/2;this.vx[a]-=1150*Math.sin(c/300*1.22*n)*e;let h=Math.max(.05,1-(Math.abs(c)/140)**2);this.vy[a]+=1150*Math.sin(s)*h*e,this.vx[a]*=Math.exp(-4.5*e),this.vy[a]*=Math.exp(-.65*e),this.z[a]+=(2.5+this.seed[a]*1.1-this.z[a])*Math.min(1,e*14)}if(o===Fi){let c=this.z[a];this.vz[a]-=1050*e,this.z[a]+=this.vz[a]*e;let h=l<0?1:this.height[l]+2;this.z[a]<=h&&(this.state[a]=Bn,this.z[a]=Math.max(1.7,Math.min(c,h)),this.vz[a]=0,this.vx[a]+=(this.random()-.5)*24,this.vy[a]+=(this.random()-.5)*24)}else if(l<0&&!t)this.vz[a]-=900*e,this.z[a]=Math.max(-9,this.z[a]+this.vz[a]*e),this.z[a]<=-9&&(this.vz[a]=0);else if(l>=0&&!t){let c=this.height[l],h=0,f=0;if(this.flowSum[l]>0){let x=(this.seed[a]+this.time*.17)%1*this.flowSum[l],_=0;for(;_<7&&x>this.flowCDF[l*8+_];)_++;let m=this.flowForce[l*8+_],p=(this.seed[a]*97%1-.5)*.75;h=(Nc[_]-Uc[_]*p)*m,f=(Uc[_]+Nc[_]*p)*m}this.vx[a]+=h*e,this.vy[a]+=f*e;let d=1.7+c*(.1+this.seed[a]*.9),u=this.pressed[a]?Math.min(this.z[a],d):d;this.z[a]+=(u-this.z[a])*Math.min(1,e*15),this.pressed[a]&&this.time-this.contactTime[a]<.16&&this.z[a]<5.5&&this.bind(a)}if(this.state[a]!==On){if(this.x[a]+=this.vx[a]*e,this.y[a]+=this.vy[a]*e,t&&this.y[a]>qe-3&&Math.abs(this.x[a]-Ge/2)>102&&(this.y[a]=qe-3,this.vy[a]=0),!t){let c=o===Fi?Math.exp(-.7*e):r;this.vx[a]*=c,this.vy[a]*=c}(this.x[a]<-3e3||this.x[a]>Ge+3e3||this.y[a]<-3e3||this.y[a]>qe+3e3)&&(this.state[a]=En,this.lost++)}}}hasLoose(){for(let e=0;e<this.count;e++)if(this.state[e]===Fi||this.state[e]===Bn)return!0;return!1}removeLoose(){for(let e=0;e<this.count;e++)this.state[e]!==On&&this.state[e]!==En&&(this.state[e]=En,this.lost++);this.height.fill(0),this.density.fill(0),this.moundHeight.fill(0),this.freshCount=0}compact(){let e=0;for(let t=0;t<this.count;t++)if(this.state[t]!==En){if(e!==t)for(let n of["x","y","z","vx","vy","vz","seed","contactTime","pressed","state","bin"])this[n][e]=this[n][t];e++}this.count=e}get coverage(){if(!this.targetCount)return 0;let e=this.coveredWeight/this.targetCount;return e>1-1e-9?1:e}stats(){let e=0,t=0,n=0,s=0;for(let r=0;r<this.count;r++)this.state[r]===Fi?e++:this.state[r]===Bn?(t++,this.pressed[r]&&s++):this.state[r]===On&&n++;return{air:e,free:t,bound:n,pressedFree:s,freshFree:t-s,maxMoundHeight:Math.max(...this.moundHeight),lost:this.lost,emitted:this.emitted,coverage:this.coverage,maxHeight:Math.max(...this.height)}}};var gh=0,x1=1,xh=2;var Ji=1,_h=2,Gs=3,Ri=0,kt=1,nn=2,$i=0,Vs=1,Fr=2,_1=3,y1=4,yh=5;var Ki=100,vh=101,Mh=102,Sh=103,bh=104,wh=200,Th=201,Ah=202,Eh=203,v1=204,M1=205,Ch=206,Rh=207,Ph=208,Ih=209,Lh=210,Dh=211,Nh=212,Uh=213,Fh=214,Oa=0,Ba=1,za=2,Es=3,ka=4,Ga=5,Va=6,Ha=7,mo=0,Oh=1,Bh=2,Wn=0,S1=1,b1=2,w1=3,Or=4,T1=5,A1=6,E1=7;var C1=300,ji=301,Hs=302,go=303,xo=304,Hi=1e3,kn=1001,Wa=1002,Ut=1003,zh=1004;var Br=1005;var Kt=1006,_o=1007;var ci=1008;var sn=1009,R1=1010,P1=1011,Ws=1012,yo=1013,Ln=1014,Mn=1015,Dn=1016,vo=1017,Mo=1018,Qi=1020,I1=35902,L1=35899,D1=1021,N1=1022,Nn=1023,ri=1026,hi=1027,So=1028,bo=1029,Pi=1030,wo=1031;var To=1033,zr=33776,kr=33777,Gr=33778,Vr=33779,Ao=35840,Eo=35841,Co=35842,Ro=35843,Po=36196,Io=37492,Lo=37496,Do=37488,No=37489,Hr=37490,Uo=37491,Fo=37808,Oo=37809,Bo=37810,zo=37811,ko=37812,Go=37813,Vo=37814,Ho=37815,Wo=37816,Xo=37817,qo=37818,Yo=37819,Zo=37820,Jo=37821,$o=36492,Ko=36494,jo=36495,Qo=36283,el=36284,Wr=36285,tl=36286;var ur=2300,Xa=2301,Ua=2302,l1=2303,c1=2400,h1=2401,u1=2402;var kh=3200,U1=3201;var Xr=0,Gh=1,ui="",Nt="srgb",dr="srgb-linear",fr="linear",st="srgb";var Fa=7680;var Vh=519,Hh=512,Wh=513,Xh=514,F1=515,qh=516,Yh=517,O1=518,B1=519,z1=35044,k1=35048;var G1="300 es",_n=2e3,Cs=2001;function S0(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function b0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function pr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Zh(){let i=pr("canvas");return i.style.display="block",i}var Fc={},Rs=null;function mr(...i){let e="THREE."+i.shift();Rs?Rs("log",e,...i):console.log(e,...i)}function Jh(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Pe(...i){i=Jh(i);let e="THREE."+i.shift();if(Rs)Rs("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function De(...i){i=Jh(i);let e="THREE."+i.shift();if(Rs)Rs("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Vi(...i){let e=i.join(" ");e in Fc||(Fc[e]=!0,Pe(...i))}function $h(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Kh={[Oa]:Oa,[za]:Va,[ka]:ka,[Es]:Ga,[Ba]:Ba,[Va]:za,[Ha]:Ha,[Ga]:Es},Gn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Bl=Math.PI/180,qa=180/Math.PI;function es(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Wt[i&255]+Wt[i>>8&255]+Wt[i>>16&255]+Wt[i>>24&255]+"-"+Wt[e&255]+Wt[e>>8&255]+"-"+Wt[e>>16&15|64]+Wt[e>>24&255]+"-"+Wt[t&63|128]+Wt[t>>8&255]+"-"+Wt[t>>16&255]+Wt[t>>24&255]+Wt[n&255]+Wt[n>>8&255]+Wt[n>>16&255]+Wt[n>>24&255]).toLowerCase()}function Je(i,e,t){return Math.max(e,Math.min(t,i))}function w0(i,e){return(i%e+e)%e}function zl(i,e,t){return(1-t)*i+t*e}function jh(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function nl(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Qh(i,e){if(e.constructor===Float32Array)return i;let t=nl(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function eu(i,e){if(e.constructor===Float32Array)return i;let t=nl(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}var Ee=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},cn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],f=n[s+3],d=r[a+0],u=r[a+1],x=r[a+2],_=r[a+3];if(f!==_||l!==d||c!==u||h!==x){let m=l*d+c*u+h*x+f*_;m<0&&(d=-d,u=-u,x=-x,_=-_,m=-m);let p=1-o;if(m<.9995){let M=Math.acos(m),E=Math.sin(M);p=Math.sin(p*M)/E,o=Math.sin(o*M)/E,l=l*p+d*o,c=c*p+u*o,h=h*p+x*o,f=f*p+_*o}else{l=l*p+d*o,c=c*p+u*o,h=h*p+x*o,f=f*p+_*o;let M=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=M,c*=M,h*=M,f*=M}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],f=r[a],d=r[a+1],u=r[a+2],x=r[a+3];return e[t]=o*x+h*f+l*u-c*d,e[t+1]=l*x+h*d+c*f-o*u,e[t+2]=c*x+h*u+o*d-l*f,e[t+3]=h*x-o*f-l*d-c*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),f=o(r/2),d=l(n/2),u=l(s/2),x=l(r/2);switch(a){case"XYZ":this._x=d*h*f+c*u*x,this._y=c*u*f-d*h*x,this._z=c*h*x+d*u*f,this._w=c*h*f-d*u*x;break;case"YXZ":this._x=d*h*f+c*u*x,this._y=c*u*f-d*h*x,this._z=c*h*x-d*u*f,this._w=c*h*f+d*u*x;break;case"ZXY":this._x=d*h*f-c*u*x,this._y=c*u*f+d*h*x,this._z=c*h*x+d*u*f,this._w=c*h*f-d*u*x;break;case"ZYX":this._x=d*h*f-c*u*x,this._y=c*u*f+d*h*x,this._z=c*h*x-d*u*f,this._w=c*h*f+d*u*x;break;case"YZX":this._x=d*h*f+c*u*x,this._y=c*u*f+d*h*x,this._z=c*h*x-d*u*f,this._w=c*h*f-d*u*x;break;case"XZY":this._x=d*h*f-c*u*x,this._y=c*u*f-d*h*x,this._z=c*h*x+d*u*f,this._w=c*h*f+d*u*x;break;default:Pe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],f=t[10],d=n+o+f;if(d>0){let u=.5/Math.sqrt(d+1);this._w=.25/u,this._x=(h-l)*u,this._y=(r-c)*u,this._z=(a-s)*u}else if(n>o&&n>f){let u=2*Math.sqrt(1+n-o-f);this._w=(h-l)/u,this._x=.25*u,this._y=(s+a)/u,this._z=(r+c)/u}else if(o>f){let u=2*Math.sqrt(1+o-n-f);this._w=(r-c)/u,this._x=(s+a)/u,this._y=.25*u,this._z=(l+h)/u}else{let u=2*Math.sqrt(1+f-n-o);this._w=(a-s)/u,this._x=(r+c)/u,this._y=(l+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Oc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Oc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),f=2*(r*n-a*t);return this.x=t+l*c+a*f-o*h,this.y=n+l*h+o*c-r*f,this.z=s+l*f+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return kl.copy(this).projectOnVector(e),this.sub(kl)}reflect(e){return this.sub(kl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},kl=new U,Oc=new cn,Ue=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],f=n[7],d=n[2],u=n[5],x=n[8],_=s[0],m=s[3],p=s[6],M=s[1],E=s[4],b=s[7],A=s[2],w=s[5],g=s[8];return r[0]=a*_+o*M+l*A,r[3]=a*m+o*E+l*w,r[6]=a*p+o*b+l*g,r[1]=c*_+h*M+f*A,r[4]=c*m+h*E+f*w,r[7]=c*p+h*b+f*g,r[2]=d*_+u*M+x*A,r[5]=d*m+u*E+x*w,r[8]=d*p+u*b+x*g,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],f=h*a-o*c,d=o*l-h*r,u=c*r-a*l,x=t*f+n*d+s*u;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/x;return e[0]=f*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=u*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Vi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Gl.makeScale(e,t)),this}rotate(e){return Vi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Gl.makeRotation(-e)),this}translate(e,t){return Vi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Gl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Gl=new Ue,Bc=new Ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zc=new Ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function T0(){let i={enabled:!0,workingColorSpace:dr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===st&&(s.r=si(s.r),s.g=si(s.g),s.b=si(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===st&&(s.r=As(s.r),s.g=As(s.g),s.b=As(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ui?fr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[dr]:{primaries:e,whitePoint:n,transfer:fr,toXYZ:Bc,fromXYZ:zc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Nt},outputColorSpaceConfig:{drawingBufferColorSpace:Nt}},[Nt]:{primaries:e,whitePoint:n,transfer:st,toXYZ:Bc,fromXYZ:zc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Nt}}}),i}var Qe=T0();function si(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function As(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ls,Ya=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ls===void 0&&(ls=pr("canvas")),ls.width=e.width,ls.height=e.height;let s=ls.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ls}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=pr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=si(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(si(t[n]/255)*255):t[n]=si(t[n]);return{data:t,width:e.width,height:e.height}}else return Pe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},A0=0,Ps=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:A0++}),this.uuid=es(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Vl(s[a].image)):r.push(Vl(s[a]))}else r=Vl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Vl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ya.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Pe("Texture: Unable to serialize Texture."),{})}var E0=0,Hl=new U,jt=class i extends Gn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=kn,s=kn,r=Kt,a=ci,o=Nn,l=sn,c=i.DEFAULT_ANISOTROPY,h=ui){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:E0++}),this.uuid=es(),this.name="",this.source=new Ps(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ee(0,0),this.repeat=new Ee(1,1),this.center=new Ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ue,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Hl).x}get height(){return this.source.getSize(Hl).y}get depth(){return this.source.getSize(Hl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Pe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Pe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==C1)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Hi:e.x=e.x-Math.floor(e.x);break;case kn:e.x=e.x<0?0:1;break;case Wa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Hi:e.y=e.y-Math.floor(e.y);break;case kn:e.y=e.y<0?0:1;break;case Wa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};jt.DEFAULT_IMAGE=null;jt.DEFAULT_MAPPING=C1;jt.DEFAULT_ANISOTROPY=1;var ft=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],f=l[8],d=l[1],u=l[5],x=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(f-_)<.01&&Math.abs(x-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(f+_)<.1&&Math.abs(x+m)<.1&&Math.abs(c+u+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(c+1)/2,b=(u+1)/2,A=(p+1)/2,w=(h+d)/4,g=(f+_)/4,S=(x+m)/4;return E>b&&E>A?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=w/n,r=g/n):b>A?b<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),n=w/s,r=S/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=g/r,s=S/r),this.set(n,s,r,t),this}let M=Math.sqrt((m-x)*(m-x)+(f-_)*(f-_)+(d-h)*(d-h));return Math.abs(M)<.001&&(M=1),this.x=(m-x)/M,this.y=(f-_)/M,this.z=(d-h)/M,this.w=Math.acos((c+u+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Za=class extends Gn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Kt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t),this.textures=[];let s=n.count;for(let r=0;r<s;r++)this.textures[r]=new jt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Kt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ps(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},hn=class extends Za{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},gr=class extends jt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ja=class extends jt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var nt=class i{static{this.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,l,c,h,f,d,u,x,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,f,d,u,x,_,m)}set(e,t,n,s,r,a,o,l,c,h,f,d,u,x,_,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=f,p[14]=d,p[3]=u,p[7]=x,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/cs.setFromMatrixColumn(e,0).length(),r=1/cs.setFromMatrixColumn(e,1).length(),a=1/cs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let d=a*h,u=a*f,x=o*h,_=o*f;t[0]=l*h,t[4]=-l*f,t[8]=c,t[1]=u+x*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=x+u*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,u=l*f,x=c*h,_=c*f;t[0]=d+_*o,t[4]=x*o-u,t[8]=a*c,t[1]=a*f,t[5]=a*h,t[9]=-o,t[2]=u*o-x,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,u=l*f,x=c*h,_=c*f;t[0]=d-_*o,t[4]=-a*f,t[8]=x+u*o,t[1]=u+x*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,u=a*f,x=o*h,_=o*f;t[0]=l*h,t[4]=x*c-u,t[8]=d*c+_,t[1]=l*f,t[5]=_*c+d,t[9]=u*c-x,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,u=a*c,x=o*l,_=o*c;t[0]=l*h,t[4]=_-d*f,t[8]=x*f+u,t[1]=f,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=u*f+x,t[10]=d-_*f}else if(e.order==="XZY"){let d=a*l,u=a*c,x=o*l,_=o*c;t[0]=l*h,t[4]=-f,t[8]=c*h,t[1]=d*f+_,t[5]=a*h,t[9]=u*f-x,t[2]=x*f-u,t[6]=o*h,t[10]=_*f+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(C0,e,R0)}lookAt(e,t,n){let s=this.elements;return an.subVectors(e,t),an.lengthSq()===0&&(an.z=1),an.normalize(),_i.crossVectors(n,an),_i.lengthSq()===0&&(Math.abs(n.z)===1?an.x+=1e-4:an.z+=1e-4,an.normalize(),_i.crossVectors(n,an)),_i.normalize(),ca.crossVectors(an,_i),s[0]=_i.x,s[4]=ca.x,s[8]=an.x,s[1]=_i.y,s[5]=ca.y,s[9]=an.y,s[2]=_i.z,s[6]=ca.z,s[10]=an.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],f=n[5],d=n[9],u=n[13],x=n[2],_=n[6],m=n[10],p=n[14],M=n[3],E=n[7],b=n[11],A=n[15],w=s[0],g=s[4],S=s[8],L=s[12],C=s[1],N=s[5],F=s[9],k=s[13],P=s[2],H=s[6],q=s[10],V=s[14],te=s[3],X=s[7],j=s[11],Q=s[15];return r[0]=a*w+o*C+l*P+c*te,r[4]=a*g+o*N+l*H+c*X,r[8]=a*S+o*F+l*q+c*j,r[12]=a*L+o*k+l*V+c*Q,r[1]=h*w+f*C+d*P+u*te,r[5]=h*g+f*N+d*H+u*X,r[9]=h*S+f*F+d*q+u*j,r[13]=h*L+f*k+d*V+u*Q,r[2]=x*w+_*C+m*P+p*te,r[6]=x*g+_*N+m*H+p*X,r[10]=x*S+_*F+m*q+p*j,r[14]=x*L+_*k+m*V+p*Q,r[3]=M*w+E*C+b*P+A*te,r[7]=M*g+E*N+b*H+A*X,r[11]=M*S+E*F+b*q+A*j,r[15]=M*L+E*k+b*V+A*Q,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],f=e[6],d=e[10],u=e[14],x=e[3],_=e[7],m=e[11],p=e[15],M=l*u-c*d,E=o*u-c*f,b=o*d-l*f,A=a*u-c*h,w=a*d-l*h,g=a*f-o*h;return t*(_*M-m*E+p*b)-n*(x*M-m*A+p*w)+s*(x*E-_*A+p*g)-r*(x*b-_*w+m*g)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],f=e[9],d=e[10],u=e[11],x=e[12],_=e[13],m=e[14],p=e[15],M=t*o-n*a,E=t*l-s*a,b=t*c-r*a,A=n*l-s*o,w=n*c-r*o,g=s*c-r*l,S=h*_-f*x,L=h*m-d*x,C=h*p-u*x,N=f*m-d*_,F=f*p-u*_,k=d*p-u*m,P=M*k-E*F+b*N+A*C-w*L+g*S;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/P;return e[0]=(o*k-l*F+c*N)*H,e[1]=(s*F-n*k-r*N)*H,e[2]=(_*g-m*w+p*A)*H,e[3]=(d*w-f*g-u*A)*H,e[4]=(l*C-a*k-c*L)*H,e[5]=(t*k-s*C+r*L)*H,e[6]=(m*b-x*g-p*E)*H,e[7]=(h*g-d*b+u*E)*H,e[8]=(a*F-o*C+c*S)*H,e[9]=(n*C-t*F-r*S)*H,e[10]=(x*w-_*b+p*M)*H,e[11]=(f*b-h*w-u*M)*H,e[12]=(o*L-a*N-l*S)*H,e[13]=(t*N-n*L+s*S)*H,e[14]=(_*E-x*A-m*M)*H,e[15]=(h*A-f*E+d*M)*H,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,f=o+o,d=r*c,u=r*h,x=r*f,_=a*h,m=a*f,p=o*f,M=l*c,E=l*h,b=l*f,A=n.x,w=n.y,g=n.z;return s[0]=(1-(_+p))*A,s[1]=(u+b)*A,s[2]=(x-E)*A,s[3]=0,s[4]=(u-b)*w,s[5]=(1-(d+p))*w,s[6]=(m+M)*w,s[7]=0,s[8]=(x+E)*g,s[9]=(m-M)*g,s[10]=(1-(d+_))*g,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=cs.set(s[0],s[1],s[2]).length(),o=cs.set(s[4],s[5],s[6]).length(),l=cs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Cn.copy(this);let c=1/a,h=1/o,f=1/l;return Cn.elements[0]*=c,Cn.elements[1]*=c,Cn.elements[2]*=c,Cn.elements[4]*=h,Cn.elements[5]*=h,Cn.elements[6]*=h,Cn.elements[8]*=f,Cn.elements[9]*=f,Cn.elements[10]*=f,t.setFromRotationMatrix(Cn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=_n,l=!1){let c=this.elements,h=2*r/(t-e),f=2*r/(n-s),d=(t+e)/(t-e),u=(n+s)/(n-s),x,_;if(l)x=r/(a-r),_=a*r/(a-r);else if(o===_n)x=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===Cs)x=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=f,c[9]=u,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=_n,l=!1){let c=this.elements,h=2/(t-e),f=2/(n-s),d=-(t+e)/(t-e),u=-(n+s)/(n-s),x,_;if(l)x=1/(a-r),_=a/(a-r);else if(o===_n)x=-2/(a-r),_=-(a+r)/(a-r);else if(o===Cs)x=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=f,c[9]=0,c[13]=u,c[2]=0,c[6]=0,c[10]=x,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},cs=new U,Cn=new nt,C0=new U(0,0,0),R0=new U(1,1,1),_i=new U,ca=new U,an=new U,kc=new nt,Gc=new cn,un=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],f=s[2],d=s[6],u=s[10];switch(t){case"XYZ":this._y=Math.asin(Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,u),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Je(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,u),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Je(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,u),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,u));break;case"XZY":this._z=Math.asin(-Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,u),this._y=0);break;default:Pe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return kc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(kc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Gc.setFromEuler(this),this.setFromQuaternion(Gc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};un.DEFAULT_ORDER="XYZ";var Is=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},P0=0,Vc=new U,hs=new cn,jn=new nt,ha=new U,tr=new U,I0=new U,L0=new cn,Hc=new U(1,0,0),Wc=new U(0,1,0),Xc=new U(0,0,1),qc={type:"added"},D0={type:"removed"},us={type:"childadded",child:null},Wl={type:"childremoved",child:null},xt=class i extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:P0++}),this.uuid=es(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new U,t=new un,n=new cn,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new nt},normalMatrix:{value:new Ue}}),this.matrix=new nt,this.matrixWorld=new nt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Is,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hs.setFromAxisAngle(e,t),this.quaternion.multiply(hs),this}rotateOnWorldAxis(e,t){return hs.setFromAxisAngle(e,t),this.quaternion.premultiply(hs),this}rotateX(e){return this.rotateOnAxis(Hc,e)}rotateY(e){return this.rotateOnAxis(Wc,e)}rotateZ(e){return this.rotateOnAxis(Xc,e)}translateOnAxis(e,t){return Vc.copy(e).applyQuaternion(this.quaternion),this.position.add(Vc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Hc,e)}translateY(e){return this.translateOnAxis(Wc,e)}translateZ(e){return this.translateOnAxis(Xc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(jn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ha.copy(e):ha.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?jn.lookAt(tr,ha,this.up):jn.lookAt(ha,tr,this.up),this.quaternion.setFromRotationMatrix(jn),s&&(jn.extractRotation(s.matrixWorld),hs.setFromRotationMatrix(jn),this.quaternion.premultiply(hs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(De("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(qc),us.child=e,this.dispatchEvent(us),us.child=null):De("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(D0),Wl.child=e,this.dispatchEvent(Wl),Wl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(jn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(qc),us.child=e,this.dispatchEvent(us),us.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,e,I0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,L0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),f=a(e.shapes),d=a(e.skeletons),u=a(e.animations),x=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),d.length>0&&(n.skeletons=d),u.length>0&&(n.animations=u),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};xt.DEFAULT_UP=new U(0,1,0);xt.DEFAULT_MATRIX_AUTO_UPDATE=!0;xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Yt=class extends xt{constructor(){super(),this.isGroup=!0,this.type="Group"}},N0={type:"move"},Ls=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Yt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Yt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Yt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],d=h.position.distanceTo(f.position),u=.02,x=.005;c.inputState.pinching&&d>u+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=u-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(N0)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Yt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},tu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yi={h:0,s:0,l:0},ua={h:0,s:0,l:0};function Xl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ie=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Nt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Qe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Qe.workingColorSpace){if(e=w0(e,1),t=Je(t,0,1),n=Je(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Xl(a,r,e+1/3),this.g=Xl(a,r,e),this.b=Xl(a,r,e-1/3)}return Qe.colorSpaceToWorking(this,s),this}setStyle(e,t=Nt){function n(r){r!==void 0&&parseFloat(r)<1&&Pe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Pe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Pe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Nt){let n=tu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Pe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=si(e.r),this.g=si(e.g),this.b=si(e.b),this}copyLinearToSRGB(e){return this.r=As(e.r),this.g=As(e.g),this.b=As(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Nt){return Qe.workingToColorSpace(Xt.copy(this),e),Math.round(Je(Xt.r*255,0,255))*65536+Math.round(Je(Xt.g*255,0,255))*256+Math.round(Je(Xt.b*255,0,255))}getHexString(e=Nt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.workingToColorSpace(Xt.copy(this),t);let n=Xt.r,s=Xt.g,r=Xt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=h<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.workingToColorSpace(Xt.copy(this),t),e.r=Xt.r,e.g=Xt.g,e.b=Xt.b,e}getStyle(e=Nt){Qe.workingToColorSpace(Xt.copy(this),e);let t=Xt.r,n=Xt.g,s=Xt.b;return e!==Nt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(yi),this.setHSL(yi.h+e,yi.s+t,yi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(yi),e.getHSL(ua);let n=zl(yi.h,ua.h,t),s=zl(yi.s,ua.s,t),r=zl(yi.l,ua.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Xt=new Ie;Ie.NAMES=tu;var Wi=class extends xt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new un,this.environmentIntensity=1,this.environmentRotation=new un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Rn=new U,Qn=new U,ql=new U,ei=new U,ds=new U,fs=new U,Yc=new U,Yl=new U,Zl=new U,Jl=new U,$l=new ft,Kl=new ft,jl=new ft,ii=class i{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Rn.subVectors(e,t),s.cross(Rn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Rn.subVectors(s,t),Qn.subVectors(n,t),ql.subVectors(e,t);let a=Rn.dot(Rn),o=Rn.dot(Qn),l=Rn.dot(ql),c=Qn.dot(Qn),h=Qn.dot(ql),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let d=1/f,u=(c*l-o*h)*d,x=(a*h-o*l)*d;return r.set(1-u-x,x,u)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ei)===null?!1:ei.x>=0&&ei.y>=0&&ei.x+ei.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ei.x),l.addScaledVector(a,ei.y),l.addScaledVector(o,ei.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return $l.setScalar(0),Kl.setScalar(0),jl.setScalar(0),$l.fromBufferAttribute(e,t),Kl.fromBufferAttribute(e,n),jl.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector($l,r.x),a.addScaledVector(Kl,r.y),a.addScaledVector(jl,r.z),a}static isFrontFacing(e,t,n,s){return Rn.subVectors(n,t),Qn.subVectors(e,t),Rn.cross(Qn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Rn.subVectors(this.c,this.b),Qn.subVectors(this.a,this.b),Rn.cross(Qn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;ds.subVectors(s,n),fs.subVectors(r,n),Yl.subVectors(e,n);let l=ds.dot(Yl),c=fs.dot(Yl);if(l<=0&&c<=0)return t.copy(n);Zl.subVectors(e,s);let h=ds.dot(Zl),f=fs.dot(Zl);if(h>=0&&f<=h)return t.copy(s);let d=l*f-h*c;if(d<=0&&l>=0&&h<=0&&l-h>0)return a=l/(l-h),t.copy(n).addScaledVector(ds,a);Jl.subVectors(e,r);let u=ds.dot(Jl),x=fs.dot(Jl);if(x>=0&&u<=x)return t.copy(r);let _=u*c-l*x;if(_<=0&&c>=0&&x<=0)return o=c/(c-x),t.copy(n).addScaledVector(fs,o);let m=h*x-u*f;if(m<=0&&f-h>=0&&u-x>=0)return Yc.subVectors(r,s),o=(f-h)/(f-h+(u-x)),t.copy(s).addScaledVector(Yc,o);let p=1/(m+_+d);return a=_*p,o=d*p,t.copy(n).addScaledVector(ds,a).addScaledVector(fs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Vn=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Pn):Pn.fromBufferAttribute(r,a),Pn.applyMatrix4(e.matrixWorld),this.expandByPoint(Pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),da.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),da.copy(n.boundingBox)),da.applyMatrix4(e.matrixWorld),this.union(da)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Pn),Pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(nr),fa.subVectors(this.max,nr),ps.subVectors(e.a,nr),ms.subVectors(e.b,nr),gs.subVectors(e.c,nr),vi.subVectors(ms,ps),Mi.subVectors(gs,ms),Bi.subVectors(ps,gs);let t=[0,-vi.z,vi.y,0,-Mi.z,Mi.y,0,-Bi.z,Bi.y,vi.z,0,-vi.x,Mi.z,0,-Mi.x,Bi.z,0,-Bi.x,-vi.y,vi.x,0,-Mi.y,Mi.x,0,-Bi.y,Bi.x,0];return!Ql(t,ps,ms,gs,fa)||(t=[1,0,0,0,1,0,0,0,1],!Ql(t,ps,ms,gs,fa))?!1:(pa.crossVectors(vi,Mi),t=[pa.x,pa.y,pa.z],Ql(t,ps,ms,gs,fa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Pn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ti),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ti=[new U,new U,new U,new U,new U,new U,new U,new U],Pn=new U,da=new Vn,ps=new U,ms=new U,gs=new U,vi=new U,Mi=new U,Bi=new U,nr=new U,fa=new U,pa=new U,zi=new U;function Ql(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){zi.fromArray(i,r);let o=s.x*Math.abs(zi.x)+s.y*Math.abs(zi.y)+s.z*Math.abs(zi.z),l=e.dot(zi),c=t.dot(zi),h=n.dot(zi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var St=new U,ma=new Ee,U0=0,yn=class extends Gn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:U0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=z1,this.updateRanges=[],this.gpuType=Mn,this.version=0,this._normalizationScale=e!==void 0?nl(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ma.fromBufferAttribute(this,t),ma.applyMatrix3(e),this.setXY(t,ma.x,ma.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Qh(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):eu(e,this.array)}};var xr=class extends yn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var _r=class extends yn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var tt=class extends yn{constructor(e,t,n){super(new Float32Array(e),t,n)}},F0=new Vn,ir=new U,e1=new U,ai=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):F0.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ir.subVectors(e,this.center);let t=ir.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(ir,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(e1.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ir.copy(e.center).add(e1)),this.expandByPoint(ir.copy(e.center).sub(e1))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},O0=0,xn=new nt,t1=new xt,xs=new U,on=new Vn,sr=new Vn,Dt=new U,Ft=class i extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:O0++}),this.uuid=es(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(S0(e)?_r:xr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ue().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return xn.makeRotationFromQuaternion(e),this.applyMatrix4(xn),this}rotateX(e){return xn.makeRotationX(e),this.applyMatrix4(xn),this}rotateY(e){return xn.makeRotationY(e),this.applyMatrix4(xn),this}rotateZ(e){return xn.makeRotationZ(e),this.applyMatrix4(xn),this}translate(e,t,n){return xn.makeTranslation(e,t,n),this.applyMatrix4(xn),this}scale(e,t,n){return xn.makeScale(e,t,n),this.applyMatrix4(xn),this}lookAt(e){return t1.lookAt(e),t1.updateMatrix(),this.applyMatrix4(t1.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xs).negate(),this.translate(xs.x,xs.y,xs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new tt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Pe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Vn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){De("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];on.setFromBufferAttribute(r),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,on.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,on.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(on.min),this.boundingBox.expandByPoint(on.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&De('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ai);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){De("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(on.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];sr.setFromBufferAttribute(o),this.morphTargetsRelative?(Dt.addVectors(on.min,sr.min),on.expandByPoint(Dt),Dt.addVectors(on.max,sr.max),on.expandByPoint(Dt)):(on.expandByPoint(sr.min),on.expandByPoint(sr.max))}on.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Dt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Dt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Dt.fromBufferAttribute(o,c),l&&(xs.fromBufferAttribute(e,c),Dt.add(xs)),s=Math.max(s,n.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&De('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){De("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new yn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[],c=new Uint8Array(n.count);for(let L=0;L<n.count;L++)o[L]=new U,l[L]=new U;let h=new U,f=new U,d=new U,u=new Ee,x=new Ee,_=new Ee,m=new U,p=new U;function M(L,C,N){c[L]=c[C]=c[N]=1,h.fromBufferAttribute(n,L),f.fromBufferAttribute(n,C),d.fromBufferAttribute(n,N),u.fromBufferAttribute(r,L),x.fromBufferAttribute(r,C),_.fromBufferAttribute(r,N),f.sub(h),d.sub(h),x.sub(u),_.sub(u);let F=1/(x.x*_.y-_.x*x.y);isFinite(F)&&(m.copy(f).multiplyScalar(_.y).addScaledVector(d,-x.y).multiplyScalar(F),p.copy(d).multiplyScalar(x.x).addScaledVector(f,-_.x).multiplyScalar(F),o[L].add(m),o[C].add(m),o[N].add(m),l[L].add(p),l[C].add(p),l[N].add(p))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let L=0,C=E.length;L<C;++L){let N=E[L],F=N.start,k=N.count;for(let P=F,H=F+k;P<H;P+=3)M(e.getX(P+0),e.getX(P+1),e.getX(P+2))}let b=new U,A=new U,w=new U,g=new U;function S(L){w.fromBufferAttribute(s,L),g.copy(w);let C=o[L];b.copy(C),b.sub(w.multiplyScalar(w.dot(C))).normalize(),A.crossVectors(g,C);let F=A.dot(l[L])<0?-1:1;a.setXYZW(L,b.x,b.y,b.z,F)}for(let L=0,C=n.count;L<C;++L)c[L]&&S(L);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new yn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,u=n.count;d<u;d++)n.setXYZ(d,0,0,0);let s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,h=new U,f=new U;if(e)for(let d=0,u=e.count;d<u;d+=3){let x=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,u=t.count;d<u;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,f=o.normalized,d=new c.constructor(l.length*h),u=0,x=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?u=l[_]*o.data.stride+o.offset:u=l[_]*h;for(let p=0;p<h;p++)d[x++]=c[u++]}return new yn(d,h,f)}if(this.index===null)return Pe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,f=c.length;h<f;h++){let d=c[h],u=e(d,n);l.push(u)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let f=0,d=c.length;f<d;f++){let u=c[f];h.push(u.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],f=r[c];for(let d=0,u=f.length;d<u;d++)h.push(f[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},$a=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=z1,this.updateRanges=[],this.version=0,this.uuid=es()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Zc(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Zc(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Zc(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=es()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}var $t=new U,yr=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s,this._normalizationScale=e!==void 0?nl(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){mr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new yn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){mr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Qh(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):eu(e,this.data.array)}},n1=new U,B0=new U,z0=new Ue,ln=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=n1.subVectors(n,t).cross(B0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(n1),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||z0.getNormalMatrix(e),s=this.coplanarPoint(n1).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},k0=0,In=class extends Gn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:k0++}),this.uuid=es(),this.name="",this.type="Material",this.blending=Vs,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=v1,this.blendDst=M1,this.blendEquation=Ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ie(0,0,0),this.blendAlpha=0,this.depthFunc=Es,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Vh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fa,this.stencilZFail=Fa,this.stencilZPass=Fa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Pe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Pe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ie().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new ln().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ee().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ee().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Xi=class extends In{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},_s,rr=new U,ys=new U,vs=new U,Ms=new Ee,ar=new Ee,nu=new nt,ga=new U,or=new U,xa=new U,Jc=new Ee,i1=new Ee,$c=new Ee,Ds=class extends xt{constructor(e=new Xi){if(super(),this.isSprite=!0,this.type="Sprite",_s===void 0){_s=new Ft;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new $a(t,5);_s.setIndex([0,1,2,0,2,3]),_s.setAttribute("position",new yr(n,3,0,!1)),_s.setAttribute("uv",new yr(n,2,3,!1))}this.geometry=_s,this.material=e,this.center=new Ee(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&De('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ys.setFromMatrixScale(this.matrixWorld),nu.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),vs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ys.multiplyScalar(-vs.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;_a(ga.set(-.5,-.5,0),vs,a,ys,s,r),_a(or.set(.5,-.5,0),vs,a,ys,s,r),_a(xa.set(.5,.5,0),vs,a,ys,s,r),Jc.set(0,0),i1.set(1,0),$c.set(1,1);let o=e.ray.intersectTriangle(ga,or,xa,!1,rr);if(o===null&&(_a(or.set(-.5,.5,0),vs,a,ys,s,r),i1.set(0,1),o=e.ray.intersectTriangle(ga,xa,or,!1,rr),o===null))return;let l=e.ray.origin.distanceTo(rr);l<e.near||l>e.far||t.push({distance:l,point:rr.clone(),uv:ii.getInterpolation(rr,ga,or,xa,Jc,i1,$c,new Ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function _a(i,e,t,n,s,r){Ms.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(ar.x=r*Ms.x-s*Ms.y,ar.y=s*Ms.x+r*Ms.y):ar.copy(Ms),i.copy(e),i.x+=ar.x,i.y+=ar.y,i.applyMatrix4(nu)}var ni=new U,s1=new U,ya=new U,va=new U,Ns=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ni)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ni.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ni.copy(this.origin).addScaledVector(this.direction,t),ni.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){s1.copy(e).add(t).multiplyScalar(.5),ya.copy(t).sub(e).normalize(),va.copy(this.origin).sub(s1);let r=e.distanceTo(t)*.5,a=-this.direction.dot(ya),o=va.dot(this.direction),l=-va.dot(ya),c=va.lengthSq(),h=Math.abs(1-a*a),f,d,u,x;if(h>0)if(f=a*l-o,d=a*o-l,x=r*h,f>=0)if(d>=-x)if(d<=x){let _=1/h;f*=_,d*=_,u=f*(f+a*d+2*o)+d*(a*f+d+2*l)+c}else d=r,f=Math.max(0,-(a*d+o)),u=-f*f+d*(d+2*l)+c;else d=-r,f=Math.max(0,-(a*d+o)),u=-f*f+d*(d+2*l)+c;else d<=-x?(f=Math.max(0,-(-a*r+o)),d=f>0?-r:Math.min(Math.max(-r,-l),r),u=-f*f+d*(d+2*l)+c):d<=x?(f=0,d=Math.min(Math.max(-r,-l),r),u=d*(d+2*l)+c):(f=Math.max(0,-(a*r+o)),d=f>0?r:Math.min(Math.max(-r,-l),r),u=-f*f+d*(d+2*l)+c);else d=a>0?-r:r,f=Math.max(0,-(a*d+o)),u=-f*f+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(s1).addScaledVector(ya,d),u}intersectSphere(e,t){if(e.radius<0)return null;ni.subVectors(e.center,this.origin);let n=ni.dot(this.direction),s=ni.dot(ni)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-d.z)*f,l=(e.max.z-d.z)*f):(o=(e.max.z-d.z)*f,l=(e.min.z-d.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ni)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,f=e.x-a.x,d=e.y-a.y,u=e.z-a.z,x=t.x-a.x,_=t.y-a.y,m=t.z-a.z,p=n.x-a.x,M=n.y-a.y,E=n.z-a.z,b=Math.abs(l),A=Math.abs(c),w=Math.abs(h),g,S,L,C,N,F,k,P,H,q,V,te;if(b>=A&&b>=w?(L=l,F=f,H=x,te=p,l>=0?(g=c,S=h,C=d,N=u,k=_,P=m,q=M,V=E):(g=h,S=c,C=u,N=d,k=m,P=_,q=E,V=M)):A>=w?(L=c,F=d,H=_,te=M,c>=0?(g=h,S=l,C=u,N=f,k=m,P=x,q=E,V=p):(g=l,S=h,C=f,N=u,k=x,P=m,q=p,V=E)):(L=h,F=u,H=m,te=E,h>=0?(g=l,S=c,C=f,N=d,k=x,P=_,q=p,V=M):(g=c,S=l,C=d,N=f,k=_,P=x,q=M,V=p)),L===0)return null;let X=g/L,j=S/L,Q=1/L,Me=C-X*F,Oe=N-j*F,J=k-X*H,pe=P-j*H,_e=q-X*te,Ce=V-j*te,me=_e*pe-Ce*J,ze=Me*Ce-Oe*_e,yt=J*Oe-pe*Me;if(s){if(me<0||ze<0||yt<0)return null}else if((me<0||ze<0||yt<0)&&(me>0||ze>0||yt>0))return null;let Le=me+ze+yt;if(Le===0)return null;let rt=Q*(me*F+ze*H+yt*te);return(Le>0?rt<0:rt>0)?null:this.at(rt/Le,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},qi=class extends In{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=mo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Kc=new nt,ki=new Ns,Ma=new ai,jc=new U,Sa=new U,ba=new U,wa=new U,r1=new U,Ta=new U,Qc=new U,Aa=new U,Ne=class extends xt{constructor(e=new Ft,t=new qi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Ta.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],f=r[l];h!==0&&(r1.fromBufferAttribute(f,e),a?Ta.addScaledVector(r1,h):Ta.addScaledVector(r1.sub(t),h))}t.add(Ta)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ma.copy(n.boundingSphere),Ma.applyMatrix4(r),ki.copy(e.ray).recast(e.near),!(Ma.containsPoint(ki.origin)===!1&&(ki.intersectSphere(Ma,jc)===null||ki.origin.distanceToSquared(jc)>(e.far-e.near)**2))&&(Kc.copy(r).invert(),ki.copy(e.ray).applyMatrix4(Kc),!(n.boundingBox!==null&&ki.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ki)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,d=r.groups,u=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,_=d.length;x<_;x++){let m=d[x],p=a[m.materialIndex],M=Math.max(m.start,u.start),E=Math.min(o.count,Math.min(m.start+m.count,u.start+u.count));for(let b=M,A=E;b<A;b+=3){let w=o.getX(b),g=o.getX(b+1),S=o.getX(b+2);s=Ea(this,p,e,n,c,h,f,w,g,S),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,u.start),_=Math.min(o.count,u.start+u.count);for(let m=x,p=_;m<p;m+=3){let M=o.getX(m),E=o.getX(m+1),b=o.getX(m+2);s=Ea(this,a,e,n,c,h,f,M,E,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let x=0,_=d.length;x<_;x++){let m=d[x],p=a[m.materialIndex],M=Math.max(m.start,u.start),E=Math.min(l.count,Math.min(m.start+m.count,u.start+u.count));for(let b=M,A=E;b<A;b+=3){let w=b,g=b+1,S=b+2;s=Ea(this,p,e,n,c,h,f,w,g,S),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let x=Math.max(0,u.start),_=Math.min(l.count,u.start+u.count);for(let m=x,p=_;m<p;m+=3){let M=m,E=m+1,b=m+2;s=Ea(this,a,e,n,c,h,f,M,E,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function G0(i,e,t,n,s,r,a,o){let l;if(e.side===kt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Ri,o),l===null)return null;Aa.copy(o),Aa.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Aa);return c<t.near||c>t.far?null:{distance:c,point:Aa.clone(),object:i}}function Ea(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Sa),i.getVertexPosition(l,ba),i.getVertexPosition(c,wa);let h=G0(i,e,t,n,Sa,ba,wa,Qc);if(h){let f=new U;ii.getBarycoord(Qc,Sa,ba,wa,f),s&&(h.uv=ii.getInterpolatedAttribute(s,o,l,c,f,new Ee)),r&&(h.uv1=ii.getInterpolatedAttribute(r,o,l,c,f,new Ee)),a&&(h.normal=ii.getInterpolatedAttribute(a,o,l,c,f,new U),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new U,materialIndex:0};ii.getNormal(Sa,ba,wa,d.normal),h.face=d,h.barycoord=f}return h}var vr=class extends jt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ut,h=Ut,f,d){super(null,a,o,l,c,h,s,r,f,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var bi=class extends yn{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ss=new nt,eh=new nt,Ca=[],th=new Vn,V0=new nt,lr=new Ne,cr=new ai,Yi=class extends Ne{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new bi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,V0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Vn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ss),th.copy(e.boundingBox).applyMatrix4(Ss),this.boundingBox.union(th)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ai),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ss),cr.copy(e.boundingSphere).applyMatrix4(Ss),this.boundingSphere.union(cr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(lr.geometry=this.geometry,lr.material=this.material,lr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),cr.copy(this.boundingSphere),cr.applyMatrix4(n),e.ray.intersectsSphere(cr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ss),eh.multiplyMatrices(n,Ss),lr.matrixWorld=eh,lr.raycast(e,Ca);for(let a=0,o=Ca.length;a<o;a++){let l=Ca[a];l.instanceId=r,l.object=this,t.push(l)}Ca.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new bi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new vr(new Float32Array(s*this.count),s,this.count,So,Mn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Gi=new ai,H0=new Ee(.5,.5),Ra=new U,wi=class{constructor(e=new ln,t=new ln,n=new ln,s=new ln,r=new ln,a=new ln){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=_n,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],f=r[5],d=r[6],u=r[7],x=r[8],_=r[9],m=r[10],p=r[11],M=r[12],E=r[13],b=r[14],A=r[15];if(s[0].setComponents(c-a,u-h,p-x,A-M).normalize(),s[1].setComponents(c+a,u+h,p+x,A+M).normalize(),s[2].setComponents(c+o,u+f,p+_,A+E).normalize(),s[3].setComponents(c-o,u-f,p-_,A-E).normalize(),n)s[4].setComponents(l,d,m,b).normalize(),s[5].setComponents(c-l,u-d,p-m,A-b).normalize();else if(s[4].setComponents(c-l,u-d,p-m,A-b).normalize(),t===_n)s[5].setComponents(c+l,u+d,p+m,A+b).normalize();else if(t===Cs)s[5].setComponents(l,d,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Gi)}intersectsSprite(e){Gi.center.set(0,0,0);let t=H0.distanceTo(e.center);return Gi.radius=.7071067811865476+t,Gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Gi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Ra.x=s.normal.x>0?e.max.x:e.min.x,Ra.y=s.normal.y>0?e.max.y:e.min.y,Ra.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ra)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},nh=new nt,Ka=class i{constructor(){this.coordinateSystem=_n,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){let r=t[s];nh.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new wi),n[s].setFromProjectionMatrix(nh,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new wi),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new i().copy(this)}};var Us=class extends In{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ie(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ja=new U,Qa=new U,ih=new nt,hr=new Ns,Pa=new ai,a1=new U,sh=new U,eo=class extends xt{constructor(e=new Ft,t=new Us){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)ja.fromBufferAttribute(t,s-1),Qa.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=ja.distanceTo(Qa);e.setAttribute("lineDistance",new tt(n,1))}else Pe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Pa.copy(n.boundingSphere),Pa.applyMatrix4(s),Pa.radius+=r,e.ray.intersectsSphere(Pa)===!1)return;ih.copy(s).invert(),hr.copy(e.ray).applyMatrix4(ih);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let u=Math.max(0,a.start),x=Math.min(h.count,a.start+a.count);for(let _=u,m=x-1;_<m;_+=c){let p=h.getX(_),M=h.getX(_+1),E=Ia(this,e,hr,l,p,M,_);E&&t.push(E)}if(this.isLineLoop){let _=h.getX(x-1),m=h.getX(u),p=Ia(this,e,hr,l,_,m,x-1);p&&t.push(p)}}else{let u=Math.max(0,a.start),x=Math.min(d.count,a.start+a.count);for(let _=u,m=x-1;_<m;_+=c){let p=Ia(this,e,hr,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){let _=Ia(this,e,hr,l,x-1,u,x-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Ia(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(ja.fromBufferAttribute(o,s),Qa.fromBufferAttribute(o,r),t.distanceSqToSegment(ja,Qa,a1,sh)>n)return;a1.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(a1);if(!(c<e.near||c>e.far))return{distance:c,point:sh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var rh=new U,ah=new U,Mr=class extends eo{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)rh.fromBufferAttribute(t,s),ah.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+rh.distanceTo(ah);e.setAttribute("lineDistance",new tt(n,1))}else Pe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Sr=class extends jt{constructor(e=[],t=ji,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ti=class extends jt{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var oi=class extends jt{constructor(e,t,n=Ln,s,r,a,o=Ut,l=Ut,c,h=ri,f=1){if(h!==ri&&h!==hi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:f};super(d,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ps(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},br=class extends oi{constructor(e,t=Ln,n=ji,s,r,a=Ut,o=Ut,l,c=ri){let h={width:e,height:e,depth:1},f=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},wr=class extends jt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Tt=class i extends Ft{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],f=[],d=0,u=0;x("z","y","x",-1,-1,n,t,e,a,r,0),x("z","y","x",1,-1,n,t,-e,a,r,1),x("x","z","y",1,1,e,n,t,s,a,2),x("x","z","y",1,-1,e,n,-t,s,a,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new tt(c,3)),this.setAttribute("normal",new tt(h,3)),this.setAttribute("uv",new tt(f,2));function x(_,m,p,M,E,b,A,w,g,S,L){let C=b/g,N=A/S,F=b/2,k=A/2,P=w/2,H=g+1,q=S+1,V=0,te=0,X=new U;for(let j=0;j<q;j++){let Q=j*N-k;for(let Me=0;Me<H;Me++){let Oe=Me*C-F;X[_]=Oe*M,X[m]=Q*E,X[p]=P,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[p]=w>0?1:-1,h.push(X.x,X.y,X.z),f.push(Me/g),f.push(1-j/S),V+=1}}for(let j=0;j<S;j++)for(let Q=0;Q<g;Q++){let Me=d+Q+H*j,Oe=d+Q+H*(j+1),J=d+(Q+1)+H*(j+1),pe=d+(Q+1)+H*j;l.push(Me,Oe,pe),l.push(Oe,J,pe),te+=6}o.addGroup(u,te,L),u+=te,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},Tr=class i extends Ft{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=t/2,f=Math.PI/2*e,d=t,u=2*f+d,x=n*2+r,_=s+1,m=new U,p=new U;for(let M=0;M<=x;M++){let E=0,b=0,A=0,w=0;if(M<=n){let L=M/n,C=L*Math.PI/2;b=-h-e*Math.cos(C),A=e*Math.sin(C),w=-e*Math.cos(C),E=L*f}else if(M<=n+r){let L=(M-n)/r;b=-h+L*t,A=e,w=0,E=f+L*d}else{let L=(M-n-r)/n,C=L*Math.PI/2;b=h+e*Math.sin(C),A=e*Math.cos(C),w=e*Math.sin(C),E=f+d+L*f}let g=Math.max(0,Math.min(1,E/u)),S=0;M===0?S=.5/s:M===x&&(S=-.5/s);for(let L=0;L<=s;L++){let C=L/s,N=C*Math.PI*2,F=Math.sin(N),k=Math.cos(N);p.x=-A*k,p.y=b,p.z=A*F,o.push(p.x,p.y,p.z),m.set(-A*k,w,A*F),m.normalize(),l.push(m.x,m.y,m.z),c.push(C+S,g)}if(M>0){let L=(M-1)*_;for(let C=0;C<s;C++){let N=L+C,F=L+C+1,k=M*_+C,P=M*_+C+1;a.push(N,F,k),a.push(F,P,k)}}}this.setIndex(a),this.setAttribute("position",new tt(o,3)),this.setAttribute("normal",new tt(l,3)),this.setAttribute("uv",new tt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}};var li=class i extends Ft{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],f=[],d=[],u=[],x=0,_=[],m=n/2,p=0;M(),a===!1&&(e>0&&E(!0),t>0&&E(!1)),this.setIndex(h),this.setAttribute("position",new tt(f,3)),this.setAttribute("normal",new tt(d,3)),this.setAttribute("uv",new tt(u,2));function M(){let b=new U,A=new U,w=0,g=(t-e)/n;for(let S=0;S<=r;S++){let L=[],C=S/r,N=C*(t-e)+e;for(let F=0;F<=s;F++){let k=F/s,P=k*l+o,H=Math.sin(P),q=Math.cos(P);A.x=N*H,A.y=-C*n+m,A.z=N*q,f.push(A.x,A.y,A.z),b.set(H,g,q).normalize(),d.push(b.x,b.y,b.z),u.push(k,1-C),L.push(x++)}_.push(L)}for(let S=0;S<s;S++)for(let L=0;L<r;L++){let C=_[L][S],N=_[L+1][S],F=_[L+1][S+1],k=_[L][S+1];(e>0||L!==0)&&(h.push(C,N,k),w+=3),(t>0||L!==r-1)&&(h.push(N,F,k),w+=3)}c.addGroup(p,w,0),p+=w}function E(b){let A=x,w=new Ee,g=new U,S=0,L=b===!0?e:t,C=b===!0?1:-1;for(let F=1;F<=s;F++)f.push(0,m*C,0),d.push(0,C,0),u.push(.5,.5),x++;let N=x;for(let F=0;F<=s;F++){let P=F/s*l+o,H=Math.cos(P),q=Math.sin(P);g.x=L*q,g.y=m*C,g.z=L*H,f.push(g.x,g.y,g.z),d.push(0,C,0),w.x=H*.5+.5,w.y=q*.5*C+.5,u.push(w.x,w.y),x++}for(let F=0;F<s;F++){let k=A+F,P=N+F;b===!0?h.push(P,P+1,k):h.push(P+1,P,k),S+=3}c.addGroup(p,S,b===!0?1:2),p+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Ar=class i extends Ft{constructor(e=[new Ee(0,-.5),new Ee(.5,0),new Ee(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=Je(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/t,f=new U,d=new Ee,u=new U,x=new U,_=new U,m=0,p=0;for(let M=0;M<=e.length-1;M++)switch(M){case 0:m=e[M+1].x-e[M].x,p=e[M+1].y-e[M].y,u.x=p*1,u.y=-m,u.z=p*0,_.copy(u),u.normalize(),l.push(u.x,u.y,u.z);break;case e.length-1:_.normalize(),l.push(_.x,_.y,_.z);break;default:m=e[M+1].x-e[M].x,p=e[M+1].y-e[M].y,u.x=p*1,u.y=-m,u.z=p*0,x.copy(u),u.x+=_.x,u.y+=_.y,u.z+=_.z,u.normalize(),l.push(u.x,u.y,u.z),_.copy(x)}for(let M=0;M<=t;M++){let E=n+M*h*s,b=Math.sin(E),A=Math.cos(E);for(let w=0;w<=e.length-1;w++){f.x=e[w].x*b,f.y=e[w].y,f.z=e[w].x*A,a.push(f.x,f.y,f.z),d.x=M/t,d.y=w/(e.length-1),o.push(d.x,d.y);let g=l[3*w+0]*b,S=l[3*w+1],L=l[3*w+0]*A;c.push(g,S,L)}}for(let M=0;M<t;M++)for(let E=0;E<e.length-1;E++){let b=E+M*e.length,A=b,w=b+e.length,g=b+e.length+1,S=b+1;r.push(A,w,S),r.push(g,S,w)}this.setIndex(r),this.setAttribute("position",new tt(a,3)),this.setAttribute("uv",new tt(o,2)),this.setAttribute("normal",new tt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var vn=class i extends Ft{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,f=e/o,d=t/l,u=[],x=[],_=[],m=[];for(let p=0;p<h;p++){let M=p*d-a;for(let E=0;E<c;E++){let b=E*f-r;x.push(b,-M,0),_.push(0,0,1),m.push(E/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){let E=M+c*p,b=M+c*(p+1),A=M+1+c*(p+1),w=M+1+c*p;u.push(E,b,w),u.push(b,A,w)}this.setIndex(u),this.setAttribute("position",new tt(x,3)),this.setAttribute("normal",new tt(_,3)),this.setAttribute("uv",new tt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Zi=class i extends Ft{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],f=new U,d=new U,u=[],x=[],_=[],m=[];for(let p=0;p<=n;p++){let M=[],E=p/n,b=a+E*o,A=e*Math.cos(b),w=Math.sqrt(e*e-A*A),g=0;p===0&&a===0?g=.5/t:p===n&&l===Math.PI&&(g=-.5/t);for(let S=0;S<=t;S++){let L=S/t,C=s+L*r;f.x=-w*Math.cos(C),f.y=A,f.z=w*Math.sin(C),x.push(f.x,f.y,f.z),d.copy(f).normalize(),_.push(d.x,d.y,d.z),m.push(L+g,1-E),M.push(c++)}h.push(M)}for(let p=0;p<n;p++)for(let M=0;M<t;M++){let E=h[p][M+1],b=h[p][M],A=h[p+1][M],w=h[p+1][M+1];(p!==0||a>0)&&u.push(E,b,w),(p!==n-1||l<Math.PI)&&u.push(b,A,w)}this.setIndex(u),this.setAttribute("position",new tt(x,3)),this.setAttribute("normal",new tt(_,3)),this.setAttribute("uv",new tt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Er=class i extends Ft{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],f=[],d=new U,u=new U,x=new U;for(let _=0;_<=n;_++){let m=a+_/n*o;for(let p=0;p<=s;p++){let M=p/s*r;u.x=(e+t*Math.cos(m))*Math.cos(M),u.y=(e+t*Math.cos(m))*Math.sin(M),u.z=t*Math.sin(m),c.push(u.x,u.y,u.z),d.x=e*Math.cos(M),d.y=e*Math.sin(M),x.subVectors(u,d).normalize(),h.push(x.x,x.y,x.z),f.push(p/s),f.push(_/n)}}for(let _=1;_<=n;_++)for(let m=1;m<=s;m++){let p=(s+1)*_+m-1,M=(s+1)*(_-1)+m-1,E=(s+1)*(_-1)+m,b=(s+1)*_+m;l.push(p,M,b),l.push(M,E,b)}this.setIndex(l),this.setAttribute("position",new tt(c,3)),this.setAttribute("normal",new tt(h,3)),this.setAttribute("uv",new tt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};function ts(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(oh(s))s.isRenderTargetTexture?(Pe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(oh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Zt(i){let e={};for(let t=0;t<i.length;t++){let n=ts(i[t]);for(let s in n)e[s]=n[s]}return e}function oh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function W0(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function V1(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}var iu={clone:ts,merge:Zt},X0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,q0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Hn=class extends In{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=X0,this.fragmentShader=q0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ts(e.uniforms),this.uniformsGroups=W0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ie().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ee().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ft().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ue().fromArray(s.value);break;case"m4":this.uniforms[n].value=new nt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},to=class extends Hn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},gt=class extends In{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ie(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xr,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Fs=class extends gt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ee(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Je(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Ie(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ie(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ie(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Vi('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Vi('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Cr=class extends In{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xr,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=mo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Os=class extends In{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=kh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},no=class extends In{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function bs(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function La(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Ai=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},io=class extends Ai{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:c1,endingEnd:c1}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case h1:r=e,o=2*t-n;break;case u1:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case h1:a=e,l=2*n-t;break;case u1:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,f=this._offsetNext,d=this._weightPrev,u=this._weightNext,x=(n-t)/(s-t),_=x*x,m=_*x,p=-d*m+2*d*_-d*x,M=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*x+1,E=(-1-u)*m+(1.5+u)*_+.5*x,b=u*m-u*_;for(let A=0;A!==o;++A)r[A]=p*a[h+A]+M*a[c+A]+E*a[l+A]+b*a[f+A];return r}},so=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(s-t),f=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*f+a[l+d]*h;return r}},ro=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ao=class extends Ai{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,f=this.outTangents;if(!h||!f){let x=(n-t)/(s-t),_=1-x;for(let m=0;m!==o;++m)r[m]=a[c+m]*_+a[l+m]*x;return r}let d=o*2,u=e-1;for(let x=0;x!==o;++x){let _=a[c+x],m=a[l+x],p=u*d+x*2,M=f[p],E=f[p+1],b=e*d+x*2,A=h[b],w=h[b+1],g=Z0(n,t,M,A,s);r[x]=su(g,_,E,w,m)}return r}};function su(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Y0(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Z0(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=su(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Y0(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var dn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=bs(t,this.TimeBufferType),this.values=bs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:bs(e.times,Array),values:bs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),La(e.settings)&&(n.settings={inTangents:bs(e.settings.inTangents,Array),outTangents:bs(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ro(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new so(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new io(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ao(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case ur:t=this.InterpolantFactoryMethodDiscrete;break;case Xa:t=this.InterpolantFactoryMethodLinear;break;case Ua:t=this.InterpolantFactoryMethodSmooth;break;case l1:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ur;case this.InterpolantFactoryMethodLinear:return Xa;case this.InterpolantFactoryMethodSmooth:return Ua;case this.InterpolantFactoryMethodBezier:return l1}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;La(this.settings)&&(lh(this.settings.inTangents,e),lh(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;La(this.settings)&&(ch(this.settings.inTangents,e),ch(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(De("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(De("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){De("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){De("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&b0(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){De("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ua,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let f=o*n,d=f-n,u=f+n;for(let x=0;x!==n;++x){let _=t[f+x];if(_!==t[d+x]||_!==t[u+x]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let f=o*n,d=a*n;for(let u=0;u!==n;++u)t[d+u]=t[f+u]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,La(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function lh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function ch(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}dn.prototype.ValueTypeName="";dn.prototype.TimeBufferType=Float32Array;dn.prototype.ValueBufferType=Float32Array;dn.prototype.DefaultInterpolation=Xa;var Ei=class extends dn{constructor(e,t,n){super(e,t,n)}};Ei.prototype.ValueTypeName="bool";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=ur;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var oo=class extends dn{constructor(e,t,n,s){super(e,t,n,s)}};oo.prototype.ValueTypeName="color";var lo=class extends dn{constructor(e,t,n,s){super(e,t,n,s)}};lo.prototype.ValueTypeName="number";var co=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)cn.slerpFlat(r,0,a,c-o,a,c,l);return r}},Rr=class extends dn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new co(this.times,this.values,this.getValueSize(),e)}};Rr.prototype.ValueTypeName="quaternion";Rr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ci=class extends dn{constructor(e,t,n){super(e,t,n)}};Ci.prototype.ValueTypeName="string";Ci.prototype.ValueBufferType=Array;Ci.prototype.DefaultInterpolation=ur;Ci.prototype.InterpolantFactoryMethodLinear=void 0;Ci.prototype.InterpolantFactoryMethodSmooth=void 0;var ho=class extends dn{constructor(e,t,n,s){super(e,t,n,s)}};ho.prototype.ValueTypeName="vector";var uo=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,d=c.length;f<d;f+=2){let u=c[f],x=c[f+1];if(u.global&&(u.lastIndex=0),u.test(h))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},ru=new uo,fo=class{constructor(e){this.manager=e!==void 0?e:ru,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};fo.DEFAULT_MATERIAL_NAME="__DEFAULT";var Bs=class extends xt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ie(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Pr=class extends Bs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(xt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ie(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},o1=new nt,hh=new U,uh=new U,Ir=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ee(512,512),this.mapType=sn,this.map=null,this.mapPass=null,this.matrix=new nt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new wi,this._frameExtents=new Ee(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;hh.setFromMatrixPosition(e.matrixWorld),t.position.copy(hh),uh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(uh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){o1.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(o1,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Cs||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(o1)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Da=new U,Na=new cn,zn=new U,Lr=class extends xt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new nt,this.projectionMatrix=new nt,this.projectionMatrixInverse=new nt,this.coordinateSystem=_n,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Da,Na,zn),zn.x===1&&zn.y===1&&zn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Da,Na,zn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Da,Na,zn),zn.x===1&&zn.y===1&&zn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Da,Na,zn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Si=new U,dh=new Ee,fh=new Ee,qt=class extends Lr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=qa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Bl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return qa*2*Math.atan(Math.tan(Bl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Si.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Si.x,Si.y).multiplyScalar(-e/Si.z),Si.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Si.x,Si.y).multiplyScalar(-e/Si.z)}getViewSize(e,t){return this.getViewBounds(e,dh,fh),t.subVectors(fh,dh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Bl*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var d1=class extends Ir{constructor(){super(new qt(90,1,.5,500)),this.isPointLightShadow=!0}},Dr=class extends Bs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new d1}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Nr=class extends Lr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},f1=class extends Ir{constructor(){super(new Nr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},zs=class extends Bs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(xt.DEFAULT_UP),this.updateMatrix(),this.target=new xt,this.shadow=new f1}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var ws=-90,Ts=1,ks=class extends xt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new qt(ws,Ts,e,t);s.layers=this.layers,this.add(s);let r=new qt(ws,Ts,e,t);r.layers=this.layers,this.add(r);let a=new qt(ws,Ts,e,t);a.layers=this.layers,this.add(a);let o=new qt(ws,Ts,e,t);o.layers=this.layers,this.add(o);let l=new qt(ws,Ts,e,t);l.layers=this.layers,this.add(l);let c=new qt(ws,Ts,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===_n)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Cs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,f=e.getRenderTarget(),d=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(f,d,u),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},po=class extends qt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var H1="\\[\\]\\.:\\/",J0=new RegExp("["+H1+"]","g"),W1="[^"+H1+"]",$0="[^"+H1.replace("\\.","")+"]",K0=/((?:WC+[\/:])*)/.source.replace("WC",W1),j0=/(WCOD+)?/.source.replace("WCOD",$0),Q0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",W1),ed=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",W1),td=new RegExp("^"+K0+j0+Q0+ed+"$"),nd=["material","materials","bones","map"],p1=class{constructor(e,t,n){let s=n||ht.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ht=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(J0,"")}static parseTrackName(e){let t=td.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);nd.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Pe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){De("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){De("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){De("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){De("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){De("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){De("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){De("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;De("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){De("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){De("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ht.Composite=p1;ht.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ht.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ht.prototype.GetterByBindingType=[ht.prototype._getValue_direct,ht.prototype._getValue_array,ht.prototype._getValue_arrayElement,ht.prototype._getValue_toArray];ht.prototype.SetterByBindingTypeAndVersioning=[[ht.prototype._setValue_direct,ht.prototype._setValue_direct_setNeedsUpdate,ht.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_array,ht.prototype._setValue_array_setNeedsUpdate,ht.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_arrayElement,ht.prototype._setValue_arrayElement_setNeedsUpdate,ht.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ht.prototype._setValue_fromArray,ht.prototype._setValue_fromArray_setNeedsUpdate,ht.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var a4=new Float32Array(1);var ph=new nt,Ur=class{constructor(e,t,n=0,s=1/0){this.ray=new Ns(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Is,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):De("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ph.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ph),this}intersectObject(e,t=!0,n=[]){return m1(e,this,n,t),n.sort(mh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)m1(e[s],this,n,t);return n.sort(mh),n}};function mh(i,e){return i.distance-e.distance}function m1(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)m1(r[a],e,t,!0)}}var g1=class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function X1(i,e,t,n){let s=id(n);switch(t){case D1:return i*e;case So:return i*e/s.components*s.byteLength;case bo:return i*e/s.components*s.byteLength;case Pi:return i*e*2/s.components*s.byteLength;case wo:return i*e*2/s.components*s.byteLength;case N1:return i*e*3/s.components*s.byteLength;case Nn:return i*e*4/s.components*s.byteLength;case To:return i*e*4/s.components*s.byteLength;case zr:case kr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Gr:case Vr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Eo:case Ro:return Math.max(i,16)*Math.max(e,8)/4;case Ao:case Co:return Math.max(i,8)*Math.max(e,8)/2;case Po:case Io:case Do:case No:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Lo:case Hr:case Uo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Oo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Bo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case zo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ko:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Go:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Vo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ho:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Wo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Xo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case qo:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Yo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Zo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Jo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case $o:case Ko:case jo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Qo:case el:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Wr:case tl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function id(i){switch(i){case sn:case R1:return{byteLength:1,components:1};case Ws:case P1:case Dn:return{byteLength:2,components:1};case vo:case Mo:return{byteLength:2,components:4};case Ln:case yo:case Mn:return{byteLength:4,components:1};case I1:case L1:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Pe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function Eu(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function rd(i){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,f=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let u;if(c instanceof Float32Array)u=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)u=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?u=i.HALF_FLOAT:u=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)u=i.SHORT;else if(c instanceof Uint32Array)u=i.UNSIGNED_INT;else if(c instanceof Int32Array)u=i.INT;else if(c instanceof Int8Array)u=i.BYTE;else if(c instanceof Uint8Array)u=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)u=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:u,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){let h=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,h);else{f.sort((u,x)=>u.start-x.start);let d=0;for(let u=1;u<f.length;u++){let x=f[d],_=f[u];_.start<=x.start+x.count+1?x.count=Math.max(x.count,_.start+_.count-x.start):(++d,f[d]=_)}f.length=d+1;for(let u=0,x=f.length;u<x;u++){let _=f[u];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var ad=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,od=`#ifdef USE_ALPHAHASH
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
#endif`,ld=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ud=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,dd=`#ifdef USE_AOMAP
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
#endif`,fd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,pd=`#ifdef USE_BATCHING
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
#endif`,md=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,xd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,_d=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,yd=`#ifdef USE_IRIDESCENCE
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
#endif`,vd=`#ifdef USE_BUMPMAP
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
#endif`,Md=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Sd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,wd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Td=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ad=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Ed=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Cd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Rd=`#define PI 3.141592653589793
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
} // validated`,Pd=`vec3 transformedNormal = objectNormal;
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
#endif`,Id=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ld=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Dd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Nd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ud="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Od=`#ifdef USE_ENVMAP
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
#endif`,Bd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,zd=`#ifdef USE_ENVMAP
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
#endif`,kd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Gd=`#ifdef USE_ENVMAP
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
#endif`,Vd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Hd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Wd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Xd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qd=`#ifdef USE_GRADIENTMAP
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
}`,Yd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$d=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Kd=`#ifdef USE_ENVMAP
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
#endif`,jd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ef=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,tf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,nf=`PhysicalMaterial material;
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
#endif`,sf=`uniform sampler2D dfgLUT;
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
}`,rf=`
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
#endif`,af=`#if defined( RE_IndirectDiffuse )
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
#endif`,of=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lf=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,cf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,hf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,uf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,df=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ff=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,pf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,mf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,gf=`#if defined( USE_POINTS_UV )
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
#endif`,xf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,_f=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,yf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,vf=`#if defined( USE_MORPHCOLORS )
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
#endif`,Mf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sf=`#ifdef USE_MORPHTARGETS
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
#endif`,bf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Tf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Af=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ef=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Rf=`#ifdef USE_NORMALMAP
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
#endif`,Pf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,If=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Lf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Df=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Nf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Uf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Ff=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Of=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,zf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,kf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Gf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Vf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Wf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Xf=`float getShadowMask() {
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
}`,qf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Yf=`#ifdef USE_SKINNING
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
#endif`,Zf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Jf=`#ifdef USE_SKINNING
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
#endif`,$f=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Kf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,jf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Qf=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,e2=`#ifdef USE_TRANSMISSION
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
#endif`,t2=`#ifdef USE_TRANSMISSION
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
#endif`,n2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,i2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,s2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,r2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,a2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,o2=`uniform sampler2D t2D;
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
}`,l2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,c2=`uniform float backgroundBlurriness;
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
}`,h2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,u2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d2=`#include <common>
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
}`,f2=`#if DEPTH_PACKING == 3200
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
}`,p2=`#define DISTANCE
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
}`,m2=`#define DISTANCE
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
}`,g2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,x2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_2=`uniform float scale;
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
}`,y2=`uniform vec3 diffuse;
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
}`,v2=`#include <common>
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
}`,M2=`uniform vec3 diffuse;
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
}`,S2=`#define LAMBERT
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
}`,b2=`#define LAMBERT
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
}`,w2=`#define MATCAP
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
}`,T2=`#define MATCAP
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
}`,A2=`#define NORMAL
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
}`,E2=`#define NORMAL
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
}`,C2=`#define PHONG
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
}`,R2=`#define PHONG
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
}`,P2=`#define STANDARD
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
}`,I2=`#define STANDARD
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
}`,L2=`#define TOON
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
}`,D2=`#define TOON
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
}`,N2=`uniform float size;
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
}`,U2=`uniform vec3 diffuse;
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
}`,F2=`#include <common>
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
}`,O2=`uniform vec3 color;
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
}`,B2=`uniform float rotation;
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
}`,z2=`uniform vec3 diffuse;
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
}`,We={alphahash_fragment:ad,alphahash_pars_fragment:od,alphamap_fragment:ld,alphamap_pars_fragment:cd,alphatest_fragment:hd,alphatest_pars_fragment:ud,aomap_fragment:dd,aomap_pars_fragment:fd,batching_pars_vertex:pd,batching_vertex:md,begin_vertex:gd,beginnormal_vertex:xd,bsdfs:_d,iridescence_fragment:yd,bumpmap_pars_fragment:vd,clipping_planes_fragment:Md,clipping_planes_pars_fragment:Sd,clipping_planes_pars_vertex:bd,clipping_planes_vertex:wd,color_fragment:Td,color_pars_fragment:Ad,color_pars_vertex:Ed,color_vertex:Cd,common:Rd,defaultnormal_vertex:Pd,displacementmap_pars_vertex:Id,displacementmap_vertex:Ld,emissivemap_fragment:Dd,emissivemap_pars_fragment:Nd,colorspace_fragment:Ud,colorspace_pars_fragment:Fd,envmap_fragment:Od,envmap_common_pars_fragment:Bd,envmap_pars_fragment:zd,envmap_pars_vertex:kd,envmap_physical_pars_fragment:Kd,envmap_vertex:Gd,fog_vertex:Vd,fog_pars_vertex:Hd,fog_fragment:Wd,fog_pars_fragment:Xd,gradientmap_pars_fragment:qd,lightmap_pars_fragment:Yd,lights_lambert_fragment:Zd,lights_lambert_pars_fragment:Jd,lights_pars_begin:$d,lights_toon_fragment:jd,lights_toon_pars_fragment:Qd,lights_phong_fragment:ef,lights_phong_pars_fragment:tf,lights_physical_fragment:nf,lights_physical_pars_fragment:sf,lights_fragment_begin:rf,lights_fragment_maps:af,lights_fragment_end:of,lightprobes_pars_fragment:lf,logdepthbuf_fragment:cf,logdepthbuf_pars_fragment:hf,logdepthbuf_pars_vertex:uf,logdepthbuf_vertex:df,map_fragment:ff,map_pars_fragment:pf,map_particle_fragment:mf,map_particle_pars_fragment:gf,metalnessmap_fragment:xf,metalnessmap_pars_fragment:_f,morphinstance_vertex:yf,morphcolor_vertex:vf,morphnormal_vertex:Mf,morphtarget_pars_vertex:Sf,morphtarget_vertex:bf,normal_fragment_begin:wf,normal_fragment_maps:Tf,normal_pars_fragment:Af,normal_pars_vertex:Ef,normal_vertex:Cf,normalmap_pars_fragment:Rf,clearcoat_normal_fragment_begin:Pf,clearcoat_normal_fragment_maps:If,clearcoat_pars_fragment:Lf,iridescence_pars_fragment:Df,opaque_fragment:Nf,packing:Uf,premultiplied_alpha_fragment:Ff,project_vertex:Of,dithering_fragment:Bf,dithering_pars_fragment:zf,roughnessmap_fragment:kf,roughnessmap_pars_fragment:Gf,shadowmap_pars_fragment:Vf,shadowmap_pars_vertex:Hf,shadowmap_vertex:Wf,shadowmask_pars_fragment:Xf,skinbase_vertex:qf,skinning_pars_vertex:Yf,skinning_vertex:Zf,skinnormal_vertex:Jf,specularmap_fragment:$f,specularmap_pars_fragment:Kf,tonemapping_fragment:jf,tonemapping_pars_fragment:Qf,transmission_fragment:e2,transmission_pars_fragment:t2,uv_pars_fragment:n2,uv_pars_vertex:i2,uv_vertex:s2,worldpos_vertex:r2,background_vert:a2,background_frag:o2,backgroundCube_vert:l2,backgroundCube_frag:c2,cube_vert:h2,cube_frag:u2,depth_vert:d2,depth_frag:f2,distance_vert:p2,distance_frag:m2,equirect_vert:g2,equirect_frag:x2,linedashed_vert:_2,linedashed_frag:y2,meshbasic_vert:v2,meshbasic_frag:M2,meshlambert_vert:S2,meshlambert_frag:b2,meshmatcap_vert:w2,meshmatcap_frag:T2,meshnormal_vert:A2,meshnormal_frag:E2,meshphong_vert:C2,meshphong_frag:R2,meshphysical_vert:P2,meshphysical_frag:I2,meshtoon_vert:L2,meshtoon_frag:D2,points_vert:N2,points_frag:U2,shadow_vert:F2,shadow_frag:O2,sprite_vert:B2,sprite_frag:z2},fe={common:{diffuse:{value:new Ie(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ue}},envmap:{envMap:{value:null},envMapRotation:{value:new Ue},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ue},normalScale:{value:new Ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ie(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ie(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0},uvTransform:{value:new Ue}},sprite:{diffuse:{value:new Ie(16777215)},opacity:{value:1},center:{value:new Ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}}},qn={basic:{uniforms:Zt([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.fog]),vertexShader:We.meshbasic_vert,fragmentShader:We.meshbasic_frag},lambert:{uniforms:Zt([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},envMapIntensity:{value:1}}]),vertexShader:We.meshlambert_vert,fragmentShader:We.meshlambert_frag},phong:{uniforms:Zt([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},specular:{value:new Ie(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:We.meshphong_vert,fragmentShader:We.meshphong_frag},standard:{uniforms:Zt([fe.common,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.roughnessmap,fe.metalnessmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag},toon:{uniforms:Zt([fe.common,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.gradientmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:We.meshtoon_vert,fragmentShader:We.meshtoon_frag},matcap:{uniforms:Zt([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,{matcap:{value:null}}]),vertexShader:We.meshmatcap_vert,fragmentShader:We.meshmatcap_frag},points:{uniforms:Zt([fe.points,fe.fog]),vertexShader:We.points_vert,fragmentShader:We.points_frag},dashed:{uniforms:Zt([fe.common,fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:We.linedashed_vert,fragmentShader:We.linedashed_frag},depth:{uniforms:Zt([fe.common,fe.displacementmap]),vertexShader:We.depth_vert,fragmentShader:We.depth_frag},normal:{uniforms:Zt([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,{opacity:{value:1}}]),vertexShader:We.meshnormal_vert,fragmentShader:We.meshnormal_frag},sprite:{uniforms:Zt([fe.sprite,fe.fog]),vertexShader:We.sprite_vert,fragmentShader:We.sprite_frag},background:{uniforms:{uvTransform:{value:new Ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:We.background_vert,fragmentShader:We.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ue}},vertexShader:We.backgroundCube_vert,fragmentShader:We.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:We.cube_vert,fragmentShader:We.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:We.equirect_vert,fragmentShader:We.equirect_frag},distance:{uniforms:Zt([fe.common,fe.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:We.distance_vert,fragmentShader:We.distance_frag},shadow:{uniforms:Zt([fe.lights,fe.fog,{color:{value:new Ie(0)},opacity:{value:1}}]),vertexShader:We.shadow_vert,fragmentShader:We.shadow_frag}};qn.physical={uniforms:Zt([qn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ue},clearcoatNormalScale:{value:new Ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ue},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ue},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ue},sheen:{value:0},sheenColor:{value:new Ie(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ue},transmissionSamplerSize:{value:new Ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ue},attenuationDistance:{value:0},attenuationColor:{value:new Ie(0)},specularColor:{value:new Ie(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ue},anisotropyVector:{value:new Ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ue}}]),vertexShader:We.meshphysical_vert,fragmentShader:We.meshphysical_frag};var il={r:0,b:0,g:0},k2=new nt,Cu=new Ue;Cu.set(-1,0,0,0,1,0,0,0,1);function G2(i,e,t,n,s,r){let a=new Ie(0),o=s===!0?0:1,l,c,h=null,f=0,d=null;function u(M){let E=M.isScene===!0?M.background:null;if(E&&E.isTexture){let b=M.backgroundBlurriness>0;E=e.get(E,b)}return E}function x(M){let E=!1,b=u(M);b===null?m(a,o):b&&b.isColor&&(m(b,1),E=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(M,E){let b=u(E);b&&b.isCubeTexture?(c===void 0&&(c=new Ne(new Tt(1,1,1),new Hn({name:"BackgroundCubeMaterial",uniforms:ts(qn.backgroundCube.uniforms),vertexShader:qn.backgroundCube.vertexShader,fragmentShader:qn.backgroundCube.fragmentShader,side:kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,w,g){this.matrixWorld.copyPosition(g.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(k2.makeRotationFromEuler(E.backgroundRotation)).transpose(),b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Cu),c.material.toneMapped=Qe.getTransfer(b.colorSpace)!==st,(h!==b||f!==b.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=b,f=b.version,d=i.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new Ne(new vn(2,2),new Hn({name:"BackgroundMaterial",uniforms:ts(qn.background.uniforms),vertexShader:qn.background.vertexShader,fragmentShader:qn.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.toneMapped=Qe.getTransfer(b.colorSpace)!==st,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(h!==b||f!==b.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=b,f=b.version,d=i.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function m(M,E){M.getRGB(il,V1(i)),t.buffers.color.setClear(il.r,il.g,il.b,E,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,E=1){a.set(M),o=E,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:x,addToRenderList:_,dispose:p}}function V2(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(N,F,k,P,H){let q=!1,V=f(N,P,k,F);r!==V&&(r=V,c(r.object)),q=u(N,P,k,H),q&&x(N,P,k,H),H!==null&&e.update(H,i.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,b(N,F,k,P),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return i.createVertexArray()}function c(N){return i.bindVertexArray(N)}function h(N){return i.deleteVertexArray(N)}function f(N,F,k,P){let H=P.wireframe===!0,q=n[F.id];q===void 0&&(q={},n[F.id]=q);let V=N.isInstancedMesh===!0?N.id:0,te=q[V];te===void 0&&(te={},q[V]=te);let X=te[k.id];X===void 0&&(X={},te[k.id]=X);let j=X[H];return j===void 0&&(j=d(l()),X[H]=j),j}function d(N){let F=[],k=[],P=[];for(let H=0;H<t;H++)F[H]=0,k[H]=0,P[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:k,attributeDivisors:P,object:N,attributes:{},index:null}}function u(N,F,k,P){let H=r.attributes,q=F.attributes,V=0,te=k.getAttributes();for(let X in te)if(te[X].location>=0){let Q=H[X],Me=q[X];if(Me===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(Me=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(Me=N.instanceColor)),Q===void 0||Q.attribute!==Me||Me&&Q.data!==Me.data)return!0;V++}return r.attributesNum!==V||r.index!==P}function x(N,F,k,P){let H={},q=F.attributes,V=0,te=k.getAttributes();for(let X in te)if(te[X].location>=0){let Q=q[X];Q===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(Q=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(Q=N.instanceColor));let Me={};Me.attribute=Q,Q&&Q.data&&(Me.data=Q.data),H[X]=Me,V++}r.attributes=H,r.attributesNum=V,r.index=P}function _(){let N=r.newAttributes;for(let F=0,k=N.length;F<k;F++)N[F]=0}function m(N){p(N,0)}function p(N,F){let k=r.newAttributes,P=r.enabledAttributes,H=r.attributeDivisors;k[N]=1,P[N]===0&&(i.enableVertexAttribArray(N),P[N]=1),H[N]!==F&&(i.vertexAttribDivisor(N,F),H[N]=F)}function M(){let N=r.newAttributes,F=r.enabledAttributes;for(let k=0,P=F.length;k<P;k++)F[k]!==N[k]&&(i.disableVertexAttribArray(k),F[k]=0)}function E(N,F,k,P,H,q,V){V===!0?i.vertexAttribIPointer(N,F,k,H,q):i.vertexAttribPointer(N,F,k,P,H,q)}function b(N,F,k,P){_();let H=P.attributes,q=k.getAttributes(),V=F.defaultAttributeValues;for(let te in q){let X=q[te];if(X.location>=0){let j=H[te];if(j===void 0&&(te==="instanceMatrix"&&N.instanceMatrix&&(j=N.instanceMatrix),te==="instanceColor"&&N.instanceColor&&(j=N.instanceColor)),j!==void 0){let Q=j.normalized,Me=j.itemSize,Oe=e.get(j);if(Oe===void 0)continue;let J=Oe.buffer,pe=Oe.type,_e=Oe.bytesPerElement,Ce=pe===i.INT||pe===i.UNSIGNED_INT||j.gpuType===yo;if(j.isInterleavedBufferAttribute){let me=j.data,ze=me.isInterleavedBuffer===!0?me.stride:me.itemSize,yt=j.offset;if(me.isInstancedInterleavedBuffer||me.isInstancedBufferAttribute){for(let Le=0;Le<X.locationSize;Le++)p(X.location+Le,me.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=me.meshPerAttribute*me.count)}else for(let Le=0;Le<X.locationSize;Le++)m(X.location+Le);i.bindBuffer(i.ARRAY_BUFFER,J);for(let Le=0;Le<X.locationSize;Le++)E(X.location+Le,Me/X.locationSize,pe,Q,ze*_e,(yt+Me/X.locationSize*Le)*_e,Ce)}else{if(j.isInstancedBufferAttribute){for(let me=0;me<X.locationSize;me++)p(X.location+me,j.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let me=0;me<X.locationSize;me++)m(X.location+me);i.bindBuffer(i.ARRAY_BUFFER,J);for(let me=0;me<X.locationSize;me++)E(X.location+me,Me/X.locationSize,pe,Q,Me*_e,Me/X.locationSize*me*_e,Ce)}}else if(V!==void 0){let Q=V[te];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(X.location,Q);break;case 3:i.vertexAttrib3fv(X.location,Q);break;case 4:i.vertexAttrib4fv(X.location,Q);break;default:i.vertexAttrib1fv(X.location,Q)}}}}M()}function A(){L();for(let N in n){let F=n[N];for(let k in F){let P=F[k];for(let H in P){let q=P[H];for(let V in q)h(q[V].object),delete q[V];delete P[H]}}delete n[N]}}function w(N){if(n[N.id]===void 0)return;let F=n[N.id];for(let k in F){let P=F[k];for(let H in P){let q=P[H];for(let V in q)h(q[V].object),delete q[V];delete P[H]}}delete n[N.id]}function g(N){for(let F in n){let k=n[F];for(let P in k){let H=k[P];if(H[N.id]===void 0)continue;let q=H[N.id];for(let V in q)h(q[V].object),delete q[V];delete H[N.id]}}}function S(N){for(let F in n){let k=n[F],P=N.isInstancedMesh===!0?N.id:0,H=k[P];if(H!==void 0){for(let q in H){let V=H[q];for(let te in V)h(V[te].object),delete V[te];delete H[q]}delete k[P],Object.keys(k).length===0&&delete n[F]}}}function L(){C(),a=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:C,dispose:A,releaseStatesOfGeometry:w,releaseStatesOfObject:S,releaseStatesOfProgram:g,initAttributes:_,enableAttribute:m,disableUnusedAttributes:M}}function H2(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let u=0;u<h;u++)d+=c[u];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function W2(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let g=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(g.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(g){return!(g!==Nn&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(g){let S=g===Dn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(g!==sn&&g!==Mn&&!S&&n.convert(g)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(g){if(g==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";g="mediump"}return g==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Pe("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&Pe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&Pe("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:u,maxVertexTextures:x,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:E,maxFragmentUniforms:b,maxSamples:A,samples:w}}function X2(i){let e=this,t=null,n=0,s=!1,r=!1,a=new ln,o=new Ue,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d){let u=f.length!==0||d||n!==0||s;return s=d,n=f.length,u},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,d){t=h(f,d,0)},this.setState=function(f,d,u){let x=f.clippingPlanes,_=f.clipIntersection,m=f.clipShadows,p=i.get(f);if(!s||x===null||x.length===0||r&&!m)r?h(null):c();else{let M=r?0:n,E=M*4,b=p.clippingState||null;l.value=b,b=h(x,d,E,u);for(let A=0;A!==E;++A)b[A]=t[A];p.clippingState=b,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(f,d,u,x){let _=f!==null?f.length:0,m=null;if(_!==0){if(m=l.value,x!==!0||m===null){let p=u+_*4,M=d.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let E=0,b=u;E!==_;++E,b+=4)a.copy(f[E]).applyMatrix4(M,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}var Zr=class extends hn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Sr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Tt(5,5,5),r=new Hn({name:"CubemapFromEquirect",uniforms:ts(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:kt,blending:$i});r.uniforms.tEquirect.value=t;let a=new Ne(s,r),o=t.minFilter;return t.minFilter===ci&&(t.minFilter=Kt),new ks(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},au=256,q2=3,Y2=20,Ru=256,Pu=16,Z2=3,J2=new U,$2=new Ie,qs=class i{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ks(1,10,null),this._boxMesh=new Ne(new Tt(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=J2}=r,l=this._renderer;this._setSize(a);let c=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);let f=l.autoClear,d=l.autoClearColor,u=l.autoClearDepth,x=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor($2));let m=new ks(n,s,h);return m.position.copy(o),m.update(l,e),l.autoClear=f,l.autoClearColor=d,l.autoClearDepth=u,l.autoClearStencil=x,e.background=_,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=lu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(au,jh(e))}_fromTexture(e,t){e.mapping===ji||e.mapping===Hs?this._setSize(e.image.length===0?au:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=ou(e,!1,!1),n=Math.log2(e)-q2;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=ou(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===ji||e.mapping===Hs?(this._cubemapMaterial===null&&(this._cubemapMaterial=cu()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=lu()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=K2(),this._integrationMaterial=j2());let t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Pu);for(let a=0;a<=n;a++){let o=i.lodToRoughness(a,n);if(a>n-Z2)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{let l=o>0?Math.log2(t)+.5*Math.log2(6/(Ru*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Q2());let n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}};function ou(i,e,t){return new Zr(i,{minFilter:ci,generateMipmaps:e,type:Dn,colorSpace:dr,depthBuffer:t})}function Jr(i,e,t){return new Hn({name:i,uniforms:e,vertexShader:We.cube_vert,fragmentShader:t,side:kt,blending:$i,depthTest:!1,depthWrite:!1})}function K2(){return Jr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ru}u

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
	`)}function j2(){return Jr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Pu}},`

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
	`)}function Q2(){return Jr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Y2}
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
	`)}function lu(){return Jr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function cu(){return Jr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function e3(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,u=!1){return d==null?null:u?a(d):r(d)}function r(d){if(d&&d.isTexture){let u=d.mapping;if(u===go||u===xo)if(e.has(d)){let x=e.get(d).texture;return o(x,d.mapping)}else{let x=d.image;if(x&&x.height>0){let _=new Zr(x.height);return _.fromEquirectangularTexture(i,d),e.set(d,_),d.addEventListener("dispose",c),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let u=d.mapping,x=u===go||u===xo,_=u===ji||u===Hs;if(x||_){let m=t.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new qs(i)),m=x?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{let M=d.image;return x&&M&&M.height>0||_&&M&&l(M)?(n===null&&(n=new qs(i)),m=x?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function o(d,u){return u===go?d.mapping=ji:u===xo&&(d.mapping=Hs),d}function l(d){let u=0,x=6;for(let _=0;_<x;_++)d[_]!==void 0&&u++;return u===x}function c(d){let u=d.target;u.removeEventListener("dispose",c);let x=e.get(u);x!==void 0&&(e.delete(u),x.dispose())}function h(d){let u=d.target;u.removeEventListener("dispose",h);let x=t.get(u);x!==void 0&&(t.delete(u),x.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function t3(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Vi("WebGLRenderer: "+n+" extension not supported."),s}}}function n3(i,e,t,n){let s={},r=new WeakMap,a=new FinalizationRegistry(x=>delete s[x]);function o(x){l(x.target)}function l(x){x.index!==null&&e.remove(x.index);for(let m in x.attributes)e.remove(x.attributes[m]);x.removeEventListener("dispose",o),delete s[x.id],a.unregister(x);let _=r.get(x);_&&(e.remove(_),r.delete(x)),n.releaseStatesOfGeometry(x),x.isInstancedBufferGeometry===!0&&delete x._maxInstanceCount,t.memory.geometries--}function c(x,_){return s[_.id]!==void 0||(_.addEventListener("dispose",o),s[_.id]=new WeakRef(_),a.register(_,_.id,_),t.memory.geometries++),_}function h(x){let _=x.attributes;for(let m in _)e.update(_[m],i.ARRAY_BUFFER)}function f(x){let _=x.index,m=x.attributes.position,p=0;if(m===void 0)return;let M=_!==null?_.array.length:m.array.length/3-1,E=m.count>=65535?_r:xr,b=new E(Math.ceil(M/3)*6,1),A=b.array;if(_!==null){let g=_.array;p=_.version;for(let S=0,L=0;S<M;S+=3){let C=g[S+0],N=g[S+1],F=g[S+2];A[L++]=C,A[L++]=N,A[L++]=N,A[L++]=F,A[L++]=F,A[L++]=C}}else{p=m.version;for(let g=0,S=0;g<M;g+=3){let L=g+0,C=g+1,N=g+2;A[S++]=L,A[S++]=C,A[S++]=C,A[S++]=N,A[S++]=N,A[S++]=L}}b.version=p;let w=r.get(x);w&&e.remove(w),r.set(x,b)}function d(x){let _=r.get(x);if(_){let m=x.index;m!==null&&_.version<m.version&&f(x)}else f(x);return r.get(x)}function u(){for(let x in s){let _=s[x].deref();_!==void 0&&l(_)}}return{get:c,update:h,getWireframeAttribute:d,dispose:u}}function i3(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*a),t.update(d,n,1)}function c(f,d,u){u!==0&&(i.drawElementsInstanced(n,d,r,f*a,u),t.update(d,n,u))}function h(f,d,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,u);let _=0;for(let m=0;m<u;m++)_+=d[m];t.update(_,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function s3(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:De("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function r3(i,e,t){let n=new WeakMap,s=new ft;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==f){let L=function(){g.dispose(),n.delete(o),o.removeEventListener("dispose",L)};d!==void 0&&d.texture.dispose();let u=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],E=0;u===!0&&(E=1),x===!0&&(E=2),_===!0&&(E=3);let b=o.attributes.position.count*E,A=1;b>e.maxTextureSize&&(A=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);let w=new Float32Array(b*A*4*f),g=new gr(w,b,A,f);g.type=Mn,g.needsUpdate=!0;let S=E*4;for(let C=0;C<f;C++){let N=m[C],F=p[C],k=M[C],P=b*A*4*C;for(let H=0;H<N.count;H++){let q=H*S;u===!0&&(s.fromBufferAttribute(N,H),w[P+q+0]=s.x,w[P+q+1]=s.y,w[P+q+2]=s.z,w[P+q+3]=0),x===!0&&(s.fromBufferAttribute(F,H),w[P+q+4]=s.x,w[P+q+5]=s.y,w[P+q+6]=s.z,w[P+q+7]=0),_===!0&&(s.fromBufferAttribute(k,H),w[P+q+8]=s.x,w[P+q+9]=s.y,w[P+q+10]=s.z,w[P+q+11]=k.itemSize===4?s.w:1)}}d={count:f,texture:g,size:new Ee(b,A)},n.set(o,d),o.addEventListener("dispose",L)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let u=0;for(let _=0;_<c.length;_++)u+=c[_];let x=o.morphTargetsRelative?1:1-u;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function a3(i,e,t,n,s){let r=new WeakMap;function a(c){let h=s.render.frame,f=c.geometry,d=e.get(c,f);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let u=c.skeleton;r.get(u)!==h&&(u.update(),r.set(u,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var o3={[S1]:"LINEAR_TONE_MAPPING",[b1]:"REINHARD_TONE_MAPPING",[w1]:"CINEON_TONE_MAPPING",[Or]:"ACES_FILMIC_TONE_MAPPING",[A1]:"AGX_TONE_MAPPING",[E1]:"NEUTRAL_TONE_MAPPING",[T1]:"CUSTOM_TONE_MAPPING"};function l3(i,e,t,n,s,r){let a=new hn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=null,h=new Ft;h.setAttribute("position",new tt([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new tt([0,2,0,0,2,0],2));let f=new to({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new Ne(h,f),u=new Nr(-1,1,1,-1,0,1),x=null,_=null,m=!1,p,M=null,E=[],b=!1;this.setSize=function(A,w){a.setSize(A,w),o!==null&&o.setSize(A,w),l!==null&&l.setSize(A,w);for(let g=0;g<E.length;g++){let S=E[g];S.setSize&&S.setSize(A,w)}},this.setEffects=function(A){E=A,b=E.length>0&&E[0].isRenderPass===!0;let w=a.width,g=a.height;E.length>0&&o===null&&(o=new hn(w,g,{type:Dn,depthBuffer:!1,stencilBuffer:!1}),l=new hn(w,g,{type:Dn,depthBuffer:!1,stencilBuffer:!1}));let S=s===!0&&E.some(L=>L.needsDepthTexture===!0);S!==(a.depthTexture!==null)&&(S===!0&&c===null&&(c=new oi(w,g),r===!0&&(c.format=hi,c.type=Qi)),a.dispose(),a.depthTexture=S?c:null,a.resolveDepthBuffer=S,a.storeMultisampledDepthBuffer=S);for(let L=0;L<E.length;L++){let C=E[L];C.setSize&&C.setSize(w,g),S&&C.needsDepthTexture===!0&&C.setDepthTexture&&C.setDepthTexture(c)}},this.begin=function(A,w){if(m||A.toneMapping===Wn&&E.length===0)return!1;if(M=w,w!==null){let g=w.width,S=w.height;(a.width!==g||a.height!==S)&&this.setSize(g,S)}return b===!1&&A.setRenderTarget(a),p=A.toneMapping,A.toneMapping=Wn,!0},this.hasRenderPass=function(){return b},this.end=function(A,w){A.toneMapping=p,m=!0;let g=a,S=o;for(let L=0;L<E.length;L++){let C=E[L];C.enabled!==!1&&(C.render(A,S,g,w),C.needsSwap!==!1&&(g=S,S=S===o?l:o))}if(x!==A.outputColorSpace||_!==A.toneMapping){x=A.outputColorSpace,_=A.toneMapping,f.defines={},Qe.getTransfer(x)===st&&(f.defines.SRGB_TRANSFER="");let L=o3[_];L&&(f.defines[L]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=g.texture,A.setRenderTarget(M),A.render(d,u),M=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),h.dispose(),f.dispose()}}var Iu=new jt,Lu=new oi(1,1),Du=new br(1),Nu=new gr,Uu=new Ja,Fu=new Sr,hu=[],uu=[],du=new Float32Array(16),fu=new Float32Array(9),pu=new Float32Array(4);function Ys(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=hu[s];if(r===void 0&&(r=new Float32Array(s),hu[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function At(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Et(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function al(i,e){let t=uu[e];t===void 0&&(t=new Int32Array(e),uu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function c3(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function h3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;i.uniform2fv(this.addr,e),Et(t,e)}}function u3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(At(t,e))return;i.uniform3fv(this.addr,e),Et(t,e)}}function d3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;i.uniform4fv(this.addr,e),Et(t,e)}}function f3(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(At(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Et(t,e)}else{if(At(t,n))return;pu.set(n),i.uniformMatrix2fv(this.addr,!1,pu),Et(t,n)}}function p3(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(At(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Et(t,e)}else{if(At(t,n))return;fu.set(n),i.uniformMatrix3fv(this.addr,!1,fu),Et(t,n)}}function m3(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(At(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Et(t,e)}else{if(At(t,n))return;du.set(n),i.uniformMatrix4fv(this.addr,!1,du),Et(t,n)}}function g3(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function x3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;i.uniform2iv(this.addr,e),Et(t,e)}}function _3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;i.uniform3iv(this.addr,e),Et(t,e)}}function y3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;i.uniform4iv(this.addr,e),Et(t,e)}}function v3(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function M3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;i.uniform2uiv(this.addr,e),Et(t,e)}}function S3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;i.uniform3uiv(this.addr,e),Et(t,e)}}function b3(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;i.uniform4uiv(this.addr,e),Et(t,e)}}function ol(i){return i.version===0&&(i.compareFunction=B1,i.needsUpdate=!0),i}function w3(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=ol(Lu):r=Iu,t.setTexture2D(e||r,s)}function T3(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Uu,s)}function A3(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=ol(Du):r=Fu,t.setTextureCube(e||r,s)}function E3(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Nu,s)}function C3(i){switch(i){case 5126:return c3;case 35664:return h3;case 35665:return u3;case 35666:return d3;case 35674:return f3;case 35675:return p3;case 35676:return m3;case 5124:case 35670:return g3;case 35667:case 35671:return x3;case 35668:case 35672:return _3;case 35669:case 35673:return y3;case 5125:return v3;case 36294:return M3;case 36295:return S3;case 36296:return b3;case 35678:case 36198:case 36298:case 36306:case 35682:return w3;case 35679:case 36299:case 36307:return T3;case 35680:case 36300:case 36308:case 36293:return A3;case 36289:case 36303:case 36311:case 36292:return E3}}function R3(i,e){i.uniform1fv(this.addr,e)}function P3(i,e){let t=Ys(e,this.size,2);i.uniform2fv(this.addr,t)}function I3(i,e){let t=Ys(e,this.size,3);i.uniform3fv(this.addr,t)}function L3(i,e){let t=Ys(e,this.size,4);i.uniform4fv(this.addr,t)}function D3(i,e){let t=Ys(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function N3(i,e){let t=Ys(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function U3(i,e){let t=Ys(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function F3(i,e){i.uniform1iv(this.addr,e)}function O3(i,e){i.uniform2iv(this.addr,e)}function B3(i,e){i.uniform3iv(this.addr,e)}function z3(i,e){i.uniform4iv(this.addr,e)}function k3(i,e){i.uniform1uiv(this.addr,e)}function G3(i,e){i.uniform2uiv(this.addr,e)}function V3(i,e){i.uniform3uiv(this.addr,e)}function H3(i,e){i.uniform4uiv(this.addr,e)}function W3(i,e,t){let n=this.cache,s=e.length,r=al(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=ol(Lu):a=Iu;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function X3(i,e,t){let n=this.cache,s=e.length,r=al(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Uu,r[a])}function q3(i,e,t){let n=this.cache,s=e.length,r=al(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=ol(Du):a=Fu;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function Y3(i,e,t){let n=this.cache,s=e.length,r=al(t,s);At(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Nu,r[a])}function Z3(i){switch(i){case 5126:return R3;case 35664:return P3;case 35665:return I3;case 35666:return L3;case 35674:return D3;case 35675:return N3;case 35676:return U3;case 5124:case 35670:return F3;case 35667:case 35671:return O3;case 35668:case 35672:return B3;case 35669:case 35673:return z3;case 5125:return k3;case 36294:return G3;case 36295:return V3;case 36296:return H3;case 35678:case 36198:case 36298:case 36306:case 35682:return W3;case 35679:case 36299:case 36307:return X3;case 35680:case 36300:case 36308:case 36293:return q3;case 36289:case 36303:case 36311:case 36292:return Y3}}var Z1=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=C3(t.type)}},J1=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Z3(t.type)}},$1=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},q1=/(\w+)(\])?(\[|\.)?/g;function mu(i,e){i.seq.push(e),i.map[e.id]=e}function J3(i,e,t){let n=i.name,s=n.length;for(q1.lastIndex=0;;){let r=q1.exec(n),a=q1.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){mu(t,c===void 0?new Z1(o,i,e):new J1(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new $1(o),mu(t,f)),t=f}}}var Xs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);J3(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function gu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var $3=37297,K3=0;function j3(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var xu=new Ue;function Q3(i){Qe._getMatrix(xu,Qe.workingColorSpace,i);let e=`mat3( ${xu.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(i)){case fr:return[e,"LinearTransferOETF"];case st:return[e,"sRGBTransferOETF"];default:return Pe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function _u(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+j3(i.getShaderSource(e),o)}else return r}function ep(i,e){let t=Q3(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var tp={[S1]:"Linear",[b1]:"Reinhard",[w1]:"Cineon",[Or]:"ACESFilmic",[A1]:"AgX",[E1]:"Neutral",[T1]:"Custom"};function np(i,e){let t=tp[e];return t===void 0?(Pe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var sl=new U;function ip(){Qe.getLuminanceCoefficients(sl);let i=sl.x.toFixed(4),e=sl.y.toFixed(4),t=sl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function sp(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Yr).join(`
`)}function rp(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function ap(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Yr(i){return i!==""}function yu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function vu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var op=/^[ \t]*#include +<([\w\d./]+)>/gm;function K1(i){return i.replace(op,lp)}function lp(i,e){let t=We[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return K1(t)}var cp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Mu(i){return i.replace(cp,hp)}function hp(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Su(i){let e=`precision ${i.precision} float;
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
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var up={[Ji]:"SHADOWMAP_TYPE_PCF",[Gs]:"SHADOWMAP_TYPE_VSM"};function dp(i){return up[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var fp={[Hs]:"ENVMAP_MODE_REFRACTION"};function pp(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":fp[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var mp={[mo]:"ENVMAP_BLENDING_MULTIPLY",[Oh]:"ENVMAP_BLENDING_MIX",[Bh]:"ENVMAP_BLENDING_ADD"};function gp(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":mp[i.combine]||"ENVMAP_BLENDING_NONE"}function xp(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=dp(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=pp(t),f=gp(t),d=sp(t),u=rp(r),x=s.createProgram(),_,m,p=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u].filter(Yr).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u].filter(Yr).join(`
`),m.length>0&&(m+=`
`)):(_=[Su(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Yr).join(`
`),m=[Su(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Wn?"#define TONE_MAPPING":"",t.toneMapping!==Wn?We.tonemapping_pars_fragment:"",t.toneMapping!==Wn?np("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",We.colorspace_pars_fragment,ep("linearToOutputTexel",t.outputColorSpace),ip(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Yr).join(`
`)),a=K1(a),a=yu(a,t),a=vu(a,t),o=K1(o),o=yu(o,t),o=vu(o,t),a=Mu(a),o=Mu(o),t.isRawShaderMaterial!==!0&&(p=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",t.glslVersion===G1?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===G1?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let M=p+_+a,E=p+m+o,b=gu(s,s.VERTEX_SHADER,M),A=gu(s,s.FRAGMENT_SHADER,E);s.attachShader(x,b),s.attachShader(x,A),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function w(C){if(i.debug.checkShaderErrors){let N=s.getProgramInfoLog(x)||"",F=s.getShaderInfoLog(b)||"",k=s.getShaderInfoLog(A)||"",P=N.trim(),H=F.trim(),q=k.trim(),V=!0,te=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,b,A);else{let X=_u(s,b,"vertex"),j=_u(s,A,"fragment");De("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+P+`
`+X+`
`+j)}else P!==""?Pe("WebGLProgram: Program Info Log:",P):(H===""||q==="")&&(te=!1);te&&(C.diagnostics={runnable:V,programLog:P,vertexShader:{log:H,prefix:_},fragmentShader:{log:q,prefix:m}})}s.deleteShader(b),s.deleteShader(A),g=new Xs(s,x),S=ap(s,x)}let g;this.getUniforms=function(){return g===void 0&&w(this),g};let S;this.getAttributes=function(){return S===void 0&&w(this),S};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(x,$3)),L},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=K3++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=b,this.fragmentShader=A,this}var _p=0,j1=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Q1(e),t.set(e,n)),n}},Q1=class{constructor(e){this.id=_p++,this.code=e,this.usedTimes=0}};function yp(i){return i===Pi||i===Hr||i===Wr}function vp(i,e,t,n,s,r){let a=new Is,o=new j1,l=new Set,c=[],h=new Map,f=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function u(g){return l.add(g),g===0?"uv":`uv${g}`}function x(g,S,L,C,N,F){let k=C.fog,P=N.geometry,H=g.isMeshStandardMaterial||g.isMeshLambertMaterial||g.isMeshPhongMaterial?C.environment:null,q=g.isMeshStandardMaterial||g.isMeshLambertMaterial&&!g.envMap||g.isMeshPhongMaterial&&!g.envMap,V=e.get(g.envMap||H,q),te=d[g.type],X=n.precision;g.precision!==null&&(X=n.getMaxPrecision(g.precision),X!==g.precision&&Pe("WebGLProgram.getParameters:",g.precision,"not supported, using",X,"instead."));let j=P.morphAttributes.position||P.morphAttributes.normal||P.morphAttributes.color,Q=j!==void 0?j.length:0,Me=0;P.morphAttributes.position!==void 0&&(Me=1),P.morphAttributes.normal!==void 0&&(Me=2),P.morphAttributes.color!==void 0&&(Me=3);let Oe,J,pe,_e;if(te){let de=qn[te];Oe=de.vertexShader,J=de.fragmentShader}else{Oe=g.vertexShader,J=g.fragmentShader;let de=o.getVertexShaderStage(g),at=o.getFragmentShaderStage(g);o.update(g,de,at),pe=de.id,_e=at.id}let Ce=i.getRenderTarget(),me=i.state.buffers.depth.getReversed(),ze=N.isInstancedMesh===!0,yt=N.isBatchedMesh===!0,Le=!!g.map,rt=!!g.matcap,ot=!!V,$e=ot&&V.isPMREMTexture===!0,Bt=!!g.aoMap,bt=!!g.lightMap,tn=!!g.bumpMap&&g.wireframe===!1,pt=!!g.normalMap,Fn=!!g.displacementMap,Rt=!!g.emissiveMap,fn=!!g.metalnessMap,pn=!!g.roughnessMap,mn=g.anisotropy>0,D=g.clearcoat>0,gn=g.diffuseRoughness>0,ut=g.dispersion>0,dt=g.retroreflectivity>0,ue=g.iridescence>0,wt=g.sheen>0,Re=g.transmission>0,Fe=mn&&!!g.anisotropyMap,T=D&&!!g.clearcoatMap,y=D&&!!g.clearcoatNormalMap,B=D&&!!g.clearcoatRoughnessMap,ee=gn&&!!g.diffuseRoughnessMap,K=ue&&!!g.iridescenceMap,se=ue&&!!g.iridescenceThicknessMap,ce=wt&&!!g.sheenColorMap,Y=wt&&!!g.sheenRoughnessMap,Z=!!g.specularMap,ae=!!g.specularColorMap,R=!!g.specularIntensityMap,$=Re&&!!g.transmissionMap,W=Re&&!!g.thicknessMap,oe=!!g.gradientMap,ie=!!g.alphaMap,re=g.alphaTest>0,be=!!g.alphaHash,He=!!g.extensions,ne=Wn;g.toneMapped&&(Ce===null||Ce.isXRRenderTarget===!0)&&(ne=i.toneMapping);let Ae=$e?V.isCompressedCubeTexture?V.image[0].mipmaps:V.mipmaps:null,Ve={shaderID:te,shaderType:g.type,shaderName:g.name,vertexShader:Oe,fragmentShader:J,defines:g.defines,customVertexShaderID:pe,customFragmentShaderID:_e,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:X,batching:yt,batchingColor:yt&&N._colorsTexture!==null,instancing:ze,instancingColor:ze&&N.instanceColor!==null,instancingMorph:ze&&N.morphTexture!==null,outputColorSpace:Ce===null?i.outputColorSpace:Ce.isXRRenderTarget===!0?Ce.texture.colorSpace:Qe.workingColorSpace,alphaToCoverage:!!g.alphaToCoverage,map:Le,matcap:rt,envMap:ot,envMapMode:ot&&V.mapping,envMapPMREM:$e,envMapMaxLod:$e?Ae.length-1:null,envMapSize:$e?Ae[0].width:null,aoMap:Bt,lightMap:bt,bumpMap:tn,normalMap:pt,displacementMap:Fn,emissiveMap:Rt,normalMapObjectSpace:pt&&g.normalMapType===Gh,normalMapTangentSpace:pt&&g.normalMapType===Xr,packedNormalMap:pt&&g.normalMapType===Xr&&yp(g.normalMap.format),metalnessMap:fn,roughnessMap:pn,anisotropy:mn,anisotropyMap:Fe,clearcoat:D,clearcoatMap:T,clearcoatNormalMap:y,clearcoatRoughnessMap:B,diffuseRoughness:gn,diffuseRoughnessMap:ee,dispersion:ut,retroreflection:dt,iridescence:ue,iridescenceMap:K,iridescenceThicknessMap:se,sheen:wt,sheenColorMap:ce,sheenRoughnessMap:Y,specularMap:Z,specularColorMap:ae,specularIntensityMap:R,transmission:Re,transmissionMap:$,thicknessMap:W,gradientMap:oe,opaque:g.transparent===!1&&g.blending===Vs&&g.alphaToCoverage===!1,alphaMap:ie,alphaTest:re,alphaHash:be,combine:g.combine,mapUv:Le&&u(g.map.channel),aoMapUv:Bt&&u(g.aoMap.channel),lightMapUv:bt&&u(g.lightMap.channel),bumpMapUv:tn&&u(g.bumpMap.channel),normalMapUv:pt&&u(g.normalMap.channel),displacementMapUv:Fn&&u(g.displacementMap.channel),emissiveMapUv:Rt&&u(g.emissiveMap.channel),metalnessMapUv:fn&&u(g.metalnessMap.channel),roughnessMapUv:pn&&u(g.roughnessMap.channel),anisotropyMapUv:Fe&&u(g.anisotropyMap.channel),clearcoatMapUv:T&&u(g.clearcoatMap.channel),clearcoatNormalMapUv:y&&u(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:B&&u(g.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ee&&u(g.diffuseRoughnessMap.channel),iridescenceMapUv:K&&u(g.iridescenceMap.channel),iridescenceThicknessMapUv:se&&u(g.iridescenceThicknessMap.channel),sheenColorMapUv:ce&&u(g.sheenColorMap.channel),sheenRoughnessMapUv:Y&&u(g.sheenRoughnessMap.channel),specularMapUv:Z&&u(g.specularMap.channel),specularColorMapUv:ae&&u(g.specularColorMap.channel),specularIntensityMapUv:R&&u(g.specularIntensityMap.channel),transmissionMapUv:$&&u(g.transmissionMap.channel),thicknessMapUv:W&&u(g.thicknessMap.channel),alphaMapUv:ie&&u(g.alphaMap.channel),vertexTangents:!!P.attributes.tangent&&(pt||mn),vertexNormals:!!P.attributes.normal,vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!P.attributes.color&&P.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!P.attributes.uv&&(Le||ie),fog:!!k,useFog:g.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:g.wireframe===!1&&(g.flatShading===!0||P.attributes.normal===void 0&&pt===!1&&(g.isMeshLambertMaterial||g.isMeshPhongMaterial||g.isMeshStandardMaterial||g.isMeshPhysicalMaterial)),sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:me,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:P.attributes.position!==void 0,morphTargets:P.morphAttributes.position!==void 0,morphNormals:P.morphAttributes.normal!==void 0,morphColors:P.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:Me,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:F.filter(de=>de.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:g.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:ne,decodeVideoTexture:Le&&g.map.isVideoTexture===!0&&Qe.getTransfer(g.map.colorSpace)===st,decodeVideoTextureEmissive:Rt&&g.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(g.emissiveMap.colorSpace)===st,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===nn,flipSided:g.side===kt,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:He&&g.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(He&&g.extensions.multiDraw===!0||yt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Ve.vertexUv1s=l.has(1),Ve.vertexUv2s=l.has(2),Ve.vertexUv3s=l.has(3),l.clear(),Ve}function _(g){let S=[];if(g.shaderID?S.push(g.shaderID):(S.push(g.customVertexShaderID),S.push(g.customFragmentShaderID)),g.defines!==void 0)for(let L in g.defines)S.push(L),S.push(g.defines[L]);return g.isRawShaderMaterial===!1&&(m(S,g),p(S,g),S.push(i.outputColorSpace)),S.push(g.customProgramCacheKey),S.join()}function m(g,S){g.push(S.precision),g.push(S.outputColorSpace),g.push(S.envMapMode),g.push(S.envMapPMREM),g.push(S.envMapMaxLod),g.push(S.envMapSize),g.push(S.mapUv),g.push(S.alphaMapUv),g.push(S.lightMapUv),g.push(S.aoMapUv),g.push(S.bumpMapUv),g.push(S.normalMapUv),g.push(S.displacementMapUv),g.push(S.emissiveMapUv),g.push(S.metalnessMapUv),g.push(S.roughnessMapUv),g.push(S.anisotropyMapUv),g.push(S.clearcoatMapUv),g.push(S.clearcoatNormalMapUv),g.push(S.clearcoatRoughnessMapUv),g.push(S.diffuseRoughnessMapUv),g.push(S.iridescenceMapUv),g.push(S.iridescenceThicknessMapUv),g.push(S.sheenColorMapUv),g.push(S.sheenRoughnessMapUv),g.push(S.specularMapUv),g.push(S.specularColorMapUv),g.push(S.specularIntensityMapUv),g.push(S.transmissionMapUv),g.push(S.thicknessMapUv),g.push(S.combine),g.push(S.fogExp2),g.push(S.sizeAttenuation),g.push(S.morphTargetsCount),g.push(S.numSunLights),g.push(S.numDirLights),g.push(S.numPointLights),g.push(S.numSpotLights),g.push(S.numSpotLightMaps),g.push(S.numHemiLights),g.push(S.numRectAreaLights),g.push(S.numSunLightShadows),g.push(S.numDirLightShadows),g.push(S.numPointLightShadows),g.push(S.numSpotLightShadows),g.push(S.numSpotLightShadowsWithMaps),g.push(S.numLightProbes),g.push(S.numLightProbeGrids),g.push(S.shadowMapType),g.push(S.toneMapping),g.push(S.numClippingPlanes),g.push(S.numClipIntersection),g.push(S.depthPacking)}function p(g,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.retroreflection&&a.enable(24),S.diffuseRoughness&&a.enable(25),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),g.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),g.push(a.mask)}function M(g){let S=d[g.type],L;if(S){let C=qn[S];L=iu.clone(C.uniforms)}else L=g.uniforms;return L}function E(g,S){let L=h.get(S);return L!==void 0?++L.usedTimes:(L=new xp(i,S,g,s),c.push(L),h.set(S,L)),L}function b(g){if(--g.usedTimes===0){let S=c.indexOf(g);c[S]=c[c.length-1],c.pop(),h.delete(g.cacheKey),g.destroy()}}function A(g){o.remove(g)}function w(){o.dispose()}return{getParameters:x,getProgramCacheKey:_,getUniforms:M,acquireProgram:E,releaseProgram:b,releaseShaderCache:A,programs:c,dispose:w}}function Mp(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Sp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function bu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function wu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let u=0;return d.isInstancedMesh&&(u+=2),d.isSkinnedMesh&&(u+=1),u}function o(d,u,x,_,m,p){let M=i[e];return M===void 0?(M={id:d.id,object:d,geometry:u,material:x,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:m,group:p},i[e]=M):(M.id=d.id,M.object=d,M.geometry=u,M.material=x,M.materialVariant=a(d),M.groupOrder=_,M.renderOrder=d.renderOrder,M.z=m,M.group=p),e++,M}function l(d,u,x,_,m,p,M){M.reversedDepth===!0&&(m=-m);let E=o(d,u,x,_,m,p);x.transmission>0?n.push(E):x.transparent===!0?s.push(E):t.push(E)}function c(d,u,x,_,m,p){let M=o(d,u,x,_,m,p);x.transmission>0?n.unshift(M):x.transparent===!0?s.unshift(M):t.unshift(M)}function h(d,u){t.length>1&&t.sort(d||Sp),n.length>1&&n.sort(u||bu),s.length>1&&s.sort(u||bu)}function f(){for(let d=e,u=i.length;d<u;d++){let x=i[d];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:h}}function bp(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new wu,i.set(n,[a])):s>=r.length?(a=new wu,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function wp(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new U,color:new Ie};break;case"SpotLight":t={position:new U,direction:new U,color:new Ie,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Ie,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Ie,groundColor:new Ie};break;case"RectAreaLight":t={color:new Ie,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function Tp(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Ap=0;function Ep(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Cp(i){let e=new wp,t=Tp(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new nt,a=new nt;function o(c){let h=0,f=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let u=0,x=0,_=0,m=0,p=0,M=0,E=0,b=0,A=0,w=0,g=0,S=0,L=0,C=0;c.sort(Ep);for(let F=0,k=c.length;F<k;F++){let P=c[F],H=P.color,q=P.intensity,V=P.distance,te=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Pi?te=P.shadow.map.texture:te=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=H.r*q,f+=H.g*q,d+=H.b*q;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],q);C++}else if(P.isSunLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let j=P.shadow,Q=t.get(P);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),n.sunShadow[x]=Q,n.sunShadowMap[x]=te;let Me=j.getViewportCount();for(let Oe=0;Oe<Me;Oe++)n.sunShadowMatrix[_+Oe]=j.getMatrix(Oe),n.sunShadowCascade[_+Oe]=j._cascadeData[Oe];_+=Me,x++}n.sun[u]=X,u++}else if(P.isDirectionalLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let j=P.shadow,Q=t.get(P);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize=j.mapSize,n.directionalShadow[m]=Q,n.directionalShadowMap[m]=te,n.directionalShadowMatrix[m]=P.shadow.matrix,A++}n.directional[m]=X,m++}else if(P.isSpotLight){let X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(H).multiplyScalar(q),X.distance=V,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[M]=X;let j=P.shadow;if(P.map&&(n.spotLightMap[S]=P.map,S++,j.updateMatrices(P),P.castShadow&&L++),n.spotLightMatrix[M]=j.matrix,P.castShadow){let Q=t.get(P);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize=j.mapSize,n.spotShadow[M]=Q,n.spotShadowMap[M]=te,g++}M++}else if(P.isRectAreaLight){let X=e.get(P);X.color.copy(H).multiplyScalar(q),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[E]=X,E++}else if(P.isPointLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){let j=P.shadow,Q=t.get(P);Q.shadowIntensity=j.intensity,Q.shadowBias=j.bias,Q.shadowNormalBias=j.normalBias,Q.shadowRadius=j.radius,Q.shadowMapSize=j.mapSize,Q.shadowCameraNear=j.camera.near,Q.shadowCameraFar=j.camera.far,n.pointShadow[p]=Q,n.pointShadowMap[p]=te,n.pointShadowMatrix[p]=P.shadow.matrix,w++}n.point[p]=X,p++}else if(P.isHemisphereLight){let X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(q),X.groundColor.copy(P.groundColor).multiplyScalar(q),n.hemi[b]=X,b++}}E>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=fe.LTC_FLOAT_1,n.rectAreaLTC2=fe.LTC_FLOAT_2):(n.rectAreaLTC1=fe.LTC_HALF_1,n.rectAreaLTC2=fe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=d;let N=n.hash;(N.sunLength!==u||N.directionalLength!==m||N.pointLength!==p||N.spotLength!==M||N.rectAreaLength!==E||N.hemiLength!==b||N.numSunShadows!==x||N.numDirectionalShadows!==A||N.numPointShadows!==w||N.numSpotShadows!==g||N.numSpotMaps!==S||N.numLightProbes!==C)&&(n.sun.length=u,n.directional.length=m,n.spot.length=M,n.rectArea.length=E,n.point.length=p,n.hemi.length=b,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=A,n.directionalShadowMap.length=A,n.directionalShadowMatrix.length=A,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=g,n.spotShadowMap.length=g,n.spotLightMatrix.length=g+S-L,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=L,n.numLightProbes=C,N.sunLength=u,N.directionalLength=m,N.pointLength=p,N.spotLength=M,N.rectAreaLength=E,N.hemiLength=b,N.numSunShadows=x,N.numDirectionalShadows=A,N.numPointShadows=w,N.numSpotShadows=g,N.numSpotMaps=S,N.numLightProbes=C,n.version=Ap++)}function l(c,h){let f=0,d=0,u=0,x=0,_=0,m=0,p=h.matrixWorldInverse;for(let M=0,E=c.length;M<E;M++){let b=c[M];if(b.isSunLight){let A=n.sun[f];A.direction.setFromMatrixPosition(b.matrixWorld),A.direction.transformDirection(p),f++}else if(b.isDirectionalLight){let A=n.directional[d];A.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(p),d++}else if(b.isSpotLight){let A=n.spot[x];A.position.setFromMatrixPosition(b.matrixWorld),A.position.applyMatrix4(p),A.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),A.direction.sub(s),A.direction.transformDirection(p),x++}else if(b.isRectAreaLight){let A=n.rectArea[_];A.position.setFromMatrixPosition(b.matrixWorld),A.position.applyMatrix4(p),a.identity(),r.copy(b.matrixWorld),r.premultiply(p),a.extractRotation(r),A.halfWidth.set(b.width*.5,0,0),A.halfHeight.set(0,b.height*.5,0),A.halfWidth.applyMatrix4(a),A.halfHeight.applyMatrix4(a),_++}else if(b.isPointLight){let A=n.point[u];A.position.setFromMatrixPosition(b.matrixWorld),A.position.applyMatrix4(p),u++}else if(b.isHemisphereLight){let A=n.hemi[m];A.direction.setFromMatrixPosition(b.matrixWorld),A.direction.transformDirection(p),m++}}}return{setup:o,setupView:l,state:n}}function Tu(i){let e=new Cp(i),t=[],n=[],s=[];function r(f){h.camera=f,t.length=0,n.length=0,s.length=0}function a(f){f.isLightProbeGrid?s.push(f):t.push(f)}function o(f){n.push(f)}function l(){e.setup(t),s.sort((f,d)=>f.priority-d.priority||f.id-d.id)}function c(f){e.setupView(t,f)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function Rp(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Tu(i),e.set(s,[o])):r>=a.length?(o=new Tu(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Pp=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ip=`uniform sampler2D shadow_pass;
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
}`,Lp=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],Dp=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],Au=new nt,qr=new U,Y1=new U;function Np(i,e,t){let n=new wi,s=new Ee,r=new Ee,a=new ft,o=new Os,l=new no,c={},h=t.maxTextureSize,f={[Ri]:kt,[kt]:Ri,[nn]:nn},d=new Hn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ee},radius:{value:4}},vertexShader:Pp,fragmentShader:Ip}),u=d.clone();u.defines.HORIZONTAL_PASS=1;let x=new Ft;x.setAttribute("position",new yn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Ne(x,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ji;let p=this.type;this.render=function(w,g,S){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===_h&&(Pe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ji);let L=i.getRenderTarget(),C=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),F=i.state;F.setBlending($i),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let k=p!==this.type;k&&g.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(H=>H.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,H=w.length;P<H;P++){let q=w[P],V=q.shadow;if(V===void 0){Pe("WebGLShadowMap:",q,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let te=V.getFrameExtents();s.multiply(te),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/te.x),s.x=r.x*te.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/te.y),s.y=r.y*te.y,V.mapSize.y=r.y));let X=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=X,V.map===null||k===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Gs){if(q.isPointLight){Pe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new hn(s.x,s.y,{format:Pi,type:Dn,minFilter:Kt,magFilter:Kt,generateMipmaps:!1}),V.map.texture.name=q.name+".shadowMap",V.map.depthTexture=new oi(s.x,s.y,Mn),V.map.depthTexture.name=q.name+".shadowMapDepth",V.map.depthTexture.format=ri,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ut,V.map.depthTexture.magFilter=Ut}else q.isPointLight?(V.map=new Zr(s.x),V.map.depthTexture=new br(s.x,Ln)):(V.map=new hn(s.x,s.y),V.map.depthTexture=new oi(s.x,s.y,Ln)),V.map.depthTexture.name=q.name+".shadowMap",V.map.depthTexture.format=ri,this.type===Ji?(V.map.depthTexture.compareFunction=X?O1:F1,V.map.depthTexture.minFilter=Kt,V.map.depthTexture.magFilter=Kt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ut,V.map.depthTexture.magFilter=Ut);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let j=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();q.isPointLight!==!0&&V.updateMatrices(q,S);let Q=(V.camera.layers.mask&4294967294)!==0?V.camera.layers:S.layers;for(let Me=0;Me<j;Me++){let Oe=V.getCamera(Me);if(q.isPointLight){let J=V.camera,pe=V.matrix,_e=q.distance||J.far;_e!==J.far&&(J.far=_e,J.updateProjectionMatrix()),qr.setFromMatrixPosition(q.matrixWorld),J.position.copy(qr),Y1.copy(J.position),Y1.add(Lp[Me]),J.up.copy(Dp[Me]),J.lookAt(Y1),J.updateMatrixWorld(),pe.makeTranslation(-qr.x,-qr.y,-qr.z),Au.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Au,J.coordinateSystem,J.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,Me),i.clear();else{Me===0&&(i.setRenderTarget(V.map),i.clear());let J=V.getViewport(Me);a.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),F.viewport(a)}n=V.getFrustum(Me),b(g,S,Oe,q,Q,this.type)}V.isPointLightShadow!==!0&&this.type===Gs&&M(V,S),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(L,C,N)};function M(w,g){let S=e.update(_);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,u.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,u.needsUpdate=!0),w.mapPass===null?w.mapPass=new hn(s.x,s.y,{format:Pi,type:Dn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),d.uniforms.shadow_pass.value=w.map.depthTexture,d.uniforms.resolution.value.set(w.map.width,w.map.height),d.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(g,null,S,d,_,null),u.uniforms.shadow_pass.value=w.mapPass.texture,u.uniforms.resolution.value.set(w.map.width,w.map.height),u.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(g,null,S,u,_,null)}function E(w,g,S,L){let C=null,N=S.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(N!==void 0)C=N;else if(C=S.isPointLight===!0?l:o,i.localClippingEnabled&&g.clipShadows===!0&&Array.isArray(g.clippingPlanes)&&g.clippingPlanes.length!==0||g.displacementMap&&g.displacementScale!==0||g.alphaMap&&g.alphaTest>0||g.map&&g.alphaTest>0||g.alphaToCoverage===!0){let F=C.uuid,k=g.uuid,P=c[F];P===void 0&&(P={},c[F]=P);let H=P[k];H===void 0&&(H=C.clone(),P[k]=H,g.addEventListener("dispose",A)),C=H}if(C.visible=g.visible,C.wireframe=g.wireframe,L===Gs?C.side=g.shadowSide!==null?g.shadowSide:g.side:C.side=g.shadowSide!==null?g.shadowSide:f[g.side],C.alphaMap=g.alphaMap,C.alphaTest=g.alphaToCoverage===!0?.5:g.alphaTest,C.map=g.map,C.clipShadows=g.clipShadows,C.clippingPlanes=g.clippingPlanes,C.clipIntersection=g.clipIntersection,C.displacementMap=g.displacementMap,C.displacementScale=g.displacementScale,C.displacementBias=g.displacementBias,C.wireframeLinewidth=g.wireframeLinewidth,C.linewidth=g.linewidth,S.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let F=i.properties.get(C);F.light=S}return C}function b(w,g,S,L,C,N){if(w.visible===!1)return;if(w.layers.test(C)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&N===Gs)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,w.matrixWorld);let P=e.update(w),H=w.material;if(Array.isArray(H)){let q=P.groups;for(let V=0,te=q.length;V<te;V++){let X=q[V],j=H[X.materialIndex];if(j&&j.visible){let Q=E(w,j,L,N);w.onBeforeShadow(i,w,g,S,P,Q,X),i.renderBufferDirect(S,null,P,Q,w,X),w.onAfterShadow(i,w,g,S,P,Q,X)}}}else if(H.visible){let q=E(w,H,L,N);w.onBeforeShadow(i,w,g,S,P,q,null),i.renderBufferDirect(S,null,P,q,w,null),w.onAfterShadow(i,w,g,S,P,q,null)}}let k=w.children;for(let P=0,H=k.length;P<H;P++)b(k[P],g,S,L,C,N)}function A(w){w.target.removeEventListener("dispose",A);for(let S in c){let L=c[S],C=w.target.uuid;C in L&&(L[C].dispose(),delete L[C])}}}function Up(i,e){function t(){let R=!1,$=new ft,W=null,oe=new ft(0,0,0,0);return{setMask:function(ie){W!==ie&&!R&&(i.colorMask(ie,ie,ie,ie),W=ie)},setLocked:function(ie){R=ie},setClear:function(ie,re,be,He,ne){ne===!0&&(ie*=He,re*=He,be*=He),$.set(ie,re,be,He),oe.equals($)===!1&&(i.clearColor(ie,re,be,He),oe.copy($))},reset:function(){R=!1,W=null,oe.set(-1,0,0,0)}}}function n(){let R=!1,$=!1,W=null,oe=null,ie=null;return{setReversed:function(re){if($!==re){let be=e.get("EXT_clip_control");re?be.clipControlEXT(be.LOWER_LEFT_EXT,be.ZERO_TO_ONE_EXT):be.clipControlEXT(be.LOWER_LEFT_EXT,be.NEGATIVE_ONE_TO_ONE_EXT),$=re;let He=ie;ie=null,this.setClear(He)}},getReversed:function(){return $},setTest:function(re){re?me(i.DEPTH_TEST):ze(i.DEPTH_TEST)},setMask:function(re){W!==re&&!R&&(i.depthMask(re),W=re)},setFunc:function(re){if($&&(re=Kh[re]),oe!==re){switch(re){case Oa:i.depthFunc(i.NEVER);break;case Ba:i.depthFunc(i.ALWAYS);break;case za:i.depthFunc(i.LESS);break;case Es:i.depthFunc(i.LEQUAL);break;case ka:i.depthFunc(i.EQUAL);break;case Ga:i.depthFunc(i.GEQUAL);break;case Va:i.depthFunc(i.GREATER);break;case Ha:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}oe=re}},setLocked:function(re){R=re},setClear:function(re){ie!==re&&(ie=re,$&&(re=1-re),i.clearDepth(re))},reset:function(){R=!1,W=null,oe=null,ie=null,$=!1}}}function s(){let R=!1,$=null,W=null,oe=null,ie=null,re=null,be=null,He=null,ne=null;return{setTest:function(Ae){R||(Ae?me(i.STENCIL_TEST):ze(i.STENCIL_TEST))},setMask:function(Ae){$!==Ae&&!R&&(i.stencilMask(Ae),$=Ae)},setFunc:function(Ae,Ve,de){(W!==Ae||oe!==Ve||ie!==de)&&(i.stencilFunc(Ae,Ve,de),W=Ae,oe=Ve,ie=de)},setOp:function(Ae,Ve,de){(re!==Ae||be!==Ve||He!==de)&&(i.stencilOp(Ae,Ve,de),re=Ae,be=Ve,He=de)},setLocked:function(Ae){R=Ae},setClear:function(Ae){ne!==Ae&&(i.clearStencil(Ae),ne=Ae)},reset:function(){R=!1,$=null,W=null,oe=null,ie=null,re=null,be=null,He=null,ne=null}}}let r=new t,a=new n,o=new s,l={},c=new WeakMap,h={},f={},d={},u=new WeakMap,x=[],_=null,m=!1,p=null,M=null,E=null,b=null,A=null,w=null,g=null,S=new Ie(0,0,0),L=0,C=!1,N=null,F=null,k=null,P=null,H=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,te=0,X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(X)[1]),V=te>=1):X.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),V=te>=2);let j=null,Q={},Me=i.getParameter(i.SCISSOR_BOX),Oe=i.getParameter(i.VIEWPORT),J=new ft().fromArray(Me),pe=new ft().fromArray(Oe);function _e(R,$,W,oe){let ie=new Uint8Array(4),re=i.createTexture();i.bindTexture(R,re),i.texParameteri(R,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(R,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let be=0;be<W;be++)R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY?i.texImage3D($,0,i.RGBA,1,1,oe,0,i.RGBA,i.UNSIGNED_BYTE,ie):i.texImage2D($+be,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ie);return re}let Ce={};Ce[i.TEXTURE_2D]=_e(i.TEXTURE_2D,i.TEXTURE_2D,1),Ce[i.TEXTURE_CUBE_MAP]=_e(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ce[i.TEXTURE_2D_ARRAY]=_e(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ce[i.TEXTURE_3D]=_e(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),me(i.DEPTH_TEST),a.setFunc(Es),tn(!1),pt(x1),me(i.CULL_FACE),Bt($i);function me(R){h[R]!==!0&&(i.enable(R),h[R]=!0)}function ze(R){h[R]!==!1&&(i.disable(R),h[R]=!1)}function yt(R,$){return d[R]!==$?(i.bindFramebuffer(R,$),d[R]=$,R===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=$),R===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=$),!0):!1}function Le(R,$){let W=x,oe=!1;if(R){W=u.get($),W===void 0&&(W=[],u.set($,W));let ie=R.textures;if(W.length!==ie.length||W[0]!==i.COLOR_ATTACHMENT0){for(let re=0,be=ie.length;re<be;re++)W[re]=i.COLOR_ATTACHMENT0+re;W.length=ie.length,oe=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,oe=!0);oe&&i.drawBuffers(W)}function rt(R){return _!==R?(i.useProgram(R),_=R,!0):!1}let ot={[Ki]:i.FUNC_ADD,[vh]:i.FUNC_SUBTRACT,[Mh]:i.FUNC_REVERSE_SUBTRACT};ot[Sh]=i.MIN,ot[bh]=i.MAX;let $e={[wh]:i.ZERO,[Th]:i.ONE,[Ah]:i.SRC_COLOR,[v1]:i.SRC_ALPHA,[Lh]:i.SRC_ALPHA_SATURATE,[Ph]:i.DST_COLOR,[Ch]:i.DST_ALPHA,[Eh]:i.ONE_MINUS_SRC_COLOR,[M1]:i.ONE_MINUS_SRC_ALPHA,[Ih]:i.ONE_MINUS_DST_COLOR,[Rh]:i.ONE_MINUS_DST_ALPHA,[Dh]:i.CONSTANT_COLOR,[Nh]:i.ONE_MINUS_CONSTANT_COLOR,[Uh]:i.CONSTANT_ALPHA,[Fh]:i.ONE_MINUS_CONSTANT_ALPHA};function Bt(R,$,W,oe,ie,re,be,He,ne,Ae){if(R===$i){m===!0&&(ze(i.BLEND),m=!1);return}if(m===!1&&(me(i.BLEND),m=!0),R!==yh){if(R!==p||Ae!==C){if((M!==Ki||A!==Ki)&&(i.blendEquation(i.FUNC_ADD),M=Ki,A=Ki),Ae)switch(R){case Vs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Fr:i.blendFunc(i.ONE,i.ONE);break;case _1:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case y1:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:De("WebGLState: Invalid blending: ",R);break}else switch(R){case Vs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Fr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case _1:De("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case y1:De("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:De("WebGLState: Invalid blending: ",R);break}E=null,b=null,w=null,g=null,S.set(0,0,0),L=0,p=R,C=Ae}return}ie=ie||$,re=re||W,be=be||oe,($!==M||ie!==A)&&(i.blendEquationSeparate(ot[$],ot[ie]),M=$,A=ie),(W!==E||oe!==b||re!==w||be!==g)&&(i.blendFuncSeparate($e[W],$e[oe],$e[re],$e[be]),E=W,b=oe,w=re,g=be),(He.equals(S)===!1||ne!==L)&&(i.blendColor(He.r,He.g,He.b,ne),S.copy(He),L=ne),p=R,C=!1}function bt(R,$){R.side===nn?ze(i.CULL_FACE):me(i.CULL_FACE);let W=R.side===kt;$&&(W=!W),tn(W),R.blending===Vs&&R.transparent===!1?Bt($i):Bt(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),a.setFunc(R.depthFunc),a.setTest(R.depthTest),a.setMask(R.depthWrite),r.setMask(R.colorWrite);let oe=R.stencilWrite;o.setTest(oe),oe&&(o.setMask(R.stencilWriteMask),o.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),o.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),Rt(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?me(i.SAMPLE_ALPHA_TO_COVERAGE):ze(i.SAMPLE_ALPHA_TO_COVERAGE)}function tn(R){N!==R&&(R?i.frontFace(i.CW):i.frontFace(i.CCW),N=R)}function pt(R){R!==gh?(me(i.CULL_FACE),R!==F&&(R===x1?i.cullFace(i.BACK):R===xh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ze(i.CULL_FACE),F=R}function Fn(R){R!==k&&(V&&i.lineWidth(R),k=R)}function Rt(R,$,W){R?(me(i.POLYGON_OFFSET_FILL),(P!==$||H!==W)&&(P=$,H=W,a.getReversed()&&($=-$,W=-W),i.polygonOffset($,W))):ze(i.POLYGON_OFFSET_FILL)}function fn(R){R?me(i.SCISSOR_TEST):ze(i.SCISSOR_TEST)}function pn(R){R===void 0&&(R=i.TEXTURE0+q-1),j!==R&&(i.activeTexture(R),j=R)}function mn(R,$,W){W===void 0&&(j===null?W=i.TEXTURE0+q-1:W=j);let oe=Q[W];oe===void 0&&(oe={type:void 0,texture:void 0},Q[W]=oe),(oe.type!==R||oe.texture!==$)&&(j!==W&&(i.activeTexture(W),j=W),i.bindTexture(R,$||Ce[R]),oe.type=R,oe.texture=$)}function D(){let R=Q[j];R!==void 0&&R.type!==void 0&&(i.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function gn(){try{i.compressedTexImage2D(...arguments)}catch(R){De("WebGLState:",R)}}function ut(){try{i.compressedTexImage3D(...arguments)}catch(R){De("WebGLState:",R)}}function dt(){try{i.texSubImage2D(...arguments)}catch(R){De("WebGLState:",R)}}function ue(){try{i.texSubImage3D(...arguments)}catch(R){De("WebGLState:",R)}}function wt(){try{i.compressedTexSubImage2D(...arguments)}catch(R){De("WebGLState:",R)}}function Re(){try{i.compressedTexSubImage3D(...arguments)}catch(R){De("WebGLState:",R)}}function Fe(){try{i.texStorage2D(...arguments)}catch(R){De("WebGLState:",R)}}function T(){try{i.texStorage3D(...arguments)}catch(R){De("WebGLState:",R)}}function y(){try{i.texImage2D(...arguments)}catch(R){De("WebGLState:",R)}}function B(){try{i.texImage3D(...arguments)}catch(R){De("WebGLState:",R)}}function ee(R){return f[R]!==void 0?f[R]:i.getParameter(R)}function K(R,$){f[R]!==$&&(i.pixelStorei(R,$),f[R]=$)}function se(R){J.equals(R)===!1&&(i.scissor(R.x,R.y,R.z,R.w),J.copy(R))}function ce(R){pe.equals(R)===!1&&(i.viewport(R.x,R.y,R.z,R.w),pe.copy(R))}function Y(R,$){let W=c.get($);W===void 0&&(W=new WeakMap,c.set($,W));let oe=W.get(R);oe===void 0&&(oe=i.getUniformBlockIndex($,R.name),i.uniformBlockBinding($,oe,oe),W.set(R,oe))}function Z(R,$,W){let ie=c.get($).get(R);l[ie]!==W&&(i.bindBufferBase(i.UNIFORM_BUFFER,ie,W),l[ie]=W)}function ae(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},f={},j=null,Q={},d={},l={},u=new WeakMap,x=[],_=null,m=!1,p=null,M=null,E=null,b=null,A=null,w=null,g=null,S=new Ie(0,0,0),L=0,C=!1,N=null,F=null,k=null,P=null,H=null,J.set(0,0,i.canvas.width,i.canvas.height),pe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:me,disable:ze,bindFramebuffer:yt,drawBuffers:Le,useProgram:rt,setBlending:Bt,setMaterial:bt,setFlipSided:tn,setCullFace:pt,setLineWidth:Fn,setPolygonOffset:Rt,setScissorTest:fn,activeTexture:pn,bindTexture:mn,unbindTexture:D,compressedTexImage2D:gn,compressedTexImage3D:ut,texImage2D:y,texImage3D:B,pixelStorei:K,getParameter:ee,updateUBOMapping:Y,uniformBlockBinding:Z,texStorage2D:Fe,texStorage3D:T,texSubImage2D:dt,texSubImage3D:ue,compressedTexSubImage2D:wt,compressedTexSubImage3D:Re,scissor:se,viewport:ce,reset:ae}}function Fp(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ee,h=new WeakMap,f=new Set,d,u=new WeakMap,x=new Set,_=new FinalizationRegistry(T=>x.delete(T)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(T,y){return m?new OffscreenCanvas(T,y):pr("canvas")}function M(T,y,B){let ee=1,K=Fe(T);if((K.width>B||K.height>B)&&(ee=B/Math.max(K.width,K.height)),ee<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let se=Math.floor(ee*K.width),ce=Math.floor(ee*K.height);d===void 0&&(d=p(se,ce));let Y=y?p(se,ce):d;return Y.width=se,Y.height=ce,Y.getContext("2d").drawImage(T,0,0,se,ce),Pe("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+se+"x"+ce+")."),Y}else return"data"in T&&Pe("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),T;return T}function E(T){return T.generateMipmaps}function b(T){i.generateMipmap(T)}function A(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(T,y,B,ee,K,se=!1){if(T!==null){if(i[T]!==void 0)return i[T];Pe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ce;ee&&(ce=e.get("EXT_texture_norm16"),ce||Pe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=y;if(y===i.RED&&(B===i.FLOAT&&(Y=i.R32F),B===i.HALF_FLOAT&&(Y=i.R16F),B===i.UNSIGNED_BYTE&&(Y=i.R8),B===i.UNSIGNED_SHORT&&ce&&(Y=ce.R16_EXT),B===i.SHORT&&ce&&(Y=ce.R16_SNORM_EXT)),y===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.R8UI),B===i.UNSIGNED_SHORT&&(Y=i.R16UI),B===i.UNSIGNED_INT&&(Y=i.R32UI),B===i.BYTE&&(Y=i.R8I),B===i.SHORT&&(Y=i.R16I),B===i.INT&&(Y=i.R32I)),y===i.RG&&(B===i.FLOAT&&(Y=i.RG32F),B===i.HALF_FLOAT&&(Y=i.RG16F),B===i.UNSIGNED_BYTE&&(Y=i.RG8),B===i.UNSIGNED_SHORT&&ce&&(Y=ce.RG16_EXT),B===i.SHORT&&ce&&(Y=ce.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RG8UI),B===i.UNSIGNED_SHORT&&(Y=i.RG16UI),B===i.UNSIGNED_INT&&(Y=i.RG32UI),B===i.BYTE&&(Y=i.RG8I),B===i.SHORT&&(Y=i.RG16I),B===i.INT&&(Y=i.RG32I)),y===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),B===i.UNSIGNED_INT&&(Y=i.RGB32UI),B===i.BYTE&&(Y=i.RGB8I),B===i.SHORT&&(Y=i.RGB16I),B===i.INT&&(Y=i.RGB32I)),y===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),B===i.UNSIGNED_INT&&(Y=i.RGBA32UI),B===i.BYTE&&(Y=i.RGBA8I),B===i.SHORT&&(Y=i.RGBA16I),B===i.INT&&(Y=i.RGBA32I)),y===i.RGB&&(B===i.UNSIGNED_SHORT&&ce&&(Y=ce.RGB16_EXT),B===i.SHORT&&ce&&(Y=ce.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(Y=i.R11F_G11F_B10F)),y===i.RGBA){let Z=se?fr:Qe.getTransfer(K);B===i.FLOAT&&(Y=i.RGBA32F),B===i.HALF_FLOAT&&(Y=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Y=Z===st?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&ce&&(Y=ce.RGBA16_EXT),B===i.SHORT&&ce&&(Y=ce.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function g(T,y){let B;return T?y===null||y===Ln||y===Qi?B=i.DEPTH24_STENCIL8:y===Mn?B=i.DEPTH32F_STENCIL8:y===Ws&&(B=i.DEPTH24_STENCIL8,Pe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Ln||y===Qi?B=i.DEPTH_COMPONENT24:y===Mn?B=i.DEPTH_COMPONENT32F:y===Ws&&(B=i.DEPTH_COMPONENT16),B}function S(T,y){return E(T)===!0||T.isFramebufferTexture&&T.minFilter!==Ut&&T.minFilter!==Kt?Math.log2(Math.max(y.width,y.height))+1:T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?y.mipmaps.length:1}function L(T){let y=new WeakRef(T);n.get(T).__ref=y,x.add(y),_.register(T,y,y)}function C(T){let y=n.get(T).__ref;y!==void 0&&(x.delete(y),_.unregister(y))}function N(T){k(T.target)}function F(T){P(T.target)}function k(T){T.removeEventListener("dispose",N),C(T),q(T),T.isVideoTexture&&h.delete(T),T.isHTMLTexture&&f.delete(T)}function P(T){T.removeEventListener("dispose",F),C(T),te(T)}function H(){for(let T of x){let y=T.deref();y!==void 0&&(y.isRenderTarget===!0?P(y):k(y))}x.clear(),f.clear()}function q(T){let y=n.get(T);if(y.__webglInit===void 0)return;let B=T.source,ee=u.get(B);if(ee){let K=ee[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&V(T),Object.keys(ee).length===0&&u.delete(B)}n.remove(T)}function V(T){let y=n.get(T);i.deleteTexture(y.__webglTexture);let B=T.source,ee=u.get(B);delete ee[y.__cacheKey],a.memory.textures--}function te(T){let y=n.get(T);y.__depthDisposeCallback&&y.__depthDisposeCallback();let B=T.depthTexture;if(B&&B.renderTarget===T&&k(B),T.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(y.__webglFramebuffer[K]))for(let se=0;se<y.__webglFramebuffer[K].length;se++)i.deleteFramebuffer(y.__webglFramebuffer[K][se]);else i.deleteFramebuffer(y.__webglFramebuffer[K]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[K])}else{if(Array.isArray(y.__webglFramebuffer))for(let K=0;K<y.__webglFramebuffer.length;K++)i.deleteFramebuffer(y.__webglFramebuffer[K]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let K=0;K<y.__webglColorRenderbuffer.length;K++)y.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[K]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let ee=T.textures;for(let K=0,se=ee.length;K<se;K++){let ce=n.get(ee[K]);ce.__webglTexture&&(i.deleteTexture(ce.__webglTexture),a.memory.textures--),n.remove(ee[K])}n.remove(T)}let X=0;function j(){X=0}function Q(){return X}function Me(T){X=T}function Oe(){let T=X;return T>=s.maxTextures&&Pe("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+s.maxTextures),X+=1,T}function J(T){let y=[];return y.push(T.wrapS),y.push(T.wrapT),y.push(T.wrapR||0),y.push(T.magFilter),y.push(T.minFilter),y.push(T.anisotropy),y.push(T.internalFormat),y.push(T.format),y.push(T.type),y.push(T.generateMipmaps),y.push(T.mipmapsAutoUpdate),y.push(T.premultiplyAlpha),y.push(T.flipY),y.push(T.unpackAlignment),y.push(T.colorSpace),y.join()}function pe(T,y){let B=n.get(T);if(T.isVideoTexture&&wt(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&B.__version!==T.version){let ee=T.image;if(ee===null)Pe("WebGLRenderer: Texture marked for update but no image data found.");else if(ee.complete===!1)Pe("WebGLRenderer: Texture marked for update but image is incomplete");else{bt(B,T,y);return}}else T.isExternalTexture&&(B.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+y)}function _e(T,y){let B=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&B.__version!==T.version){bt(B,T,y);return}else T.isExternalTexture&&(B.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+y)}function Ce(T,y){let B=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&B.__version!==T.version){bt(B,T,y);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+y)}function me(T,y){let B=n.get(T);if(T.version>0&&B.__version!==T.version){tn(B,T,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+y)}let ze={[Hi]:i.REPEAT,[kn]:i.CLAMP_TO_EDGE,[Wa]:i.MIRRORED_REPEAT},yt={[Ut]:i.NEAREST,[zh]:i.NEAREST_MIPMAP_NEAREST,[Br]:i.NEAREST_MIPMAP_LINEAR,[Kt]:i.LINEAR,[_o]:i.LINEAR_MIPMAP_NEAREST,[ci]:i.LINEAR_MIPMAP_LINEAR},Le={[Hh]:i.NEVER,[B1]:i.ALWAYS,[Wh]:i.LESS,[F1]:i.LEQUAL,[Xh]:i.EQUAL,[O1]:i.GEQUAL,[qh]:i.GREATER,[Yh]:i.NOTEQUAL};function rt(T,y){if(y.type===Mn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Kt||y.magFilter===_o||y.magFilter===Br||y.magFilter===ci||y.minFilter===Kt||y.minFilter===_o||y.minFilter===Br||y.minFilter===ci)&&Pe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ze[y.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ze[y.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ze[y.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,yt[y.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,yt[y.minFilter]),y.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Le[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ut||y.minFilter!==Br&&y.minFilter!==ci||y.type===Mn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function ot(T,y){let B=!1;T.__webglInit===void 0&&(T.__webglInit=!0,y.addEventListener("dispose",N),L(y));let ee=y.source,K=u.get(ee);K===void 0&&(K={},u.set(ee,K));let se=J(y);if(se!==T.__cacheKey){K[se]===void 0&&(K[se]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),K[se].usedTimes++;let ce=K[T.__cacheKey];ce!==void 0&&(K[T.__cacheKey].usedTimes--,ce.usedTimes===0&&V(y)),T.__cacheKey=se,T.__webglTexture=K[se].texture}return B}function $e(T,y,B){return Math.floor(Math.floor(T/B)/y)}function Bt(T,y,B,ee){let se=T.updateRanges;if(se.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,B,ee,y.data);else{se.sort((R,$)=>R.start-$.start);let ce=0;for(let R=1;R<se.length;R++){let $=se[ce],W=se[R],oe=$.start+$.count,ie=$e(W.start,y.width,4),re=$e($.start,y.width,4);W.start<=oe+1&&ie===re&&$e(W.start+W.count-1,y.width,4)===ie?$.count=Math.max($.count,W.start+W.count-$.start):(++ce,se[ce]=W)}se.length=ce+1;let Y=t.getParameter(i.UNPACK_ROW_LENGTH),Z=t.getParameter(i.UNPACK_SKIP_PIXELS),ae=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let R=0,$=se.length;R<$;R++){let W=se[R],oe=Math.floor(W.start/4),ie=Math.ceil(W.count/4),re=oe%y.width,be=Math.floor(oe/y.width),He=ie,ne=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,re),t.pixelStorei(i.UNPACK_SKIP_ROWS,be),t.texSubImage2D(i.TEXTURE_2D,0,re,be,He,ne,B,ee,y.data)}T.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Y),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Z),t.pixelStorei(i.UNPACK_SKIP_ROWS,ae)}}function bt(T,y,B){let ee=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(ee=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(ee=i.TEXTURE_3D);let K=ot(T,y),se=y.source;t.bindTexture(ee,T.__webglTexture,i.TEXTURE0+B);let ce=n.get(se);if(se.version!==ce.__version||K===!0){if(t.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let ne=Qe.getPrimaries(Qe.workingColorSpace),Ae=y.colorSpace===ui?null:Qe.getPrimaries(y.colorSpace),Ve=y.colorSpace===ui||ne===Ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let Z=M(y.image,!1,s.maxTextureSize);Z=Re(y,Z);let ae=r.convert(y.format,y.colorSpace),R=r.convert(y.type),$=w(y.internalFormat,ae,R,y.normalized,y.colorSpace,y.isVideoTexture);rt(ee,y);let W,oe=y.mipmaps,ie=y.isVideoTexture!==!0,re=ce.__version===void 0||K===!0,be=se.dataReady,He=S(y,Z);if(y.isDepthTexture)$=g(y.format===hi,y.type),re&&(ie?t.texStorage2D(i.TEXTURE_2D,1,$,Z.width,Z.height):t.texImage2D(i.TEXTURE_2D,0,$,Z.width,Z.height,0,ae,R,null));else if(y.isDataTexture)if(oe.length>0){ie&&re&&t.texStorage2D(i.TEXTURE_2D,He,$,oe[0].width,oe[0].height);for(let ne=0,Ae=oe.length;ne<Ae;ne++)W=oe[ne],ie?be&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,W.width,W.height,ae,R,W.data):t.texImage2D(i.TEXTURE_2D,ne,$,W.width,W.height,0,ae,R,W.data);y.generateMipmaps=!1}else ie?(re&&t.texStorage2D(i.TEXTURE_2D,He,$,Z.width,Z.height),be&&Bt(y,Z,ae,R)):t.texImage2D(i.TEXTURE_2D,0,$,Z.width,Z.height,0,ae,R,Z.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){ie&&re&&t.texStorage3D(i.TEXTURE_2D_ARRAY,He,$,oe[0].width,oe[0].height,Z.depth);for(let ne=0,Ae=oe.length;ne<Ae;ne++)if(W=oe[ne],y.format!==Nn)if(ae!==null)if(ie){if(be)if(y.layerUpdates.size>0){let Ve=X1(W.width,W.height,y.format,y.type);for(let de of y.layerUpdates){let at=W.data.subarray(de*Ve/W.data.BYTES_PER_ELEMENT,(de+1)*Ve/W.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,de,W.width,W.height,1,ae,at)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,W.width,W.height,Z.depth,ae,W.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ne,$,W.width,W.height,Z.depth,0,W.data,0,0);else Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ie?be&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,W.width,W.height,Z.depth,ae,R,W.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ne,$,W.width,W.height,Z.depth,0,ae,R,W.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{ie&&re&&t.texStorage2D(i.TEXTURE_2D,He,$,oe[0].width,oe[0].height);for(let ne=0,Ae=oe.length;ne<Ae;ne++)W=oe[ne],y.format!==Nn?ae!==null?ie?be&&t.compressedTexSubImage2D(i.TEXTURE_2D,ne,0,0,W.width,W.height,ae,W.data):t.compressedTexImage2D(i.TEXTURE_2D,ne,$,W.width,W.height,0,W.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ie?be&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,W.width,W.height,ae,R,W.data):t.texImage2D(i.TEXTURE_2D,ne,$,W.width,W.height,0,ae,R,W.data)}else if(y.isDataArrayTexture)if(ie){if(re&&t.texStorage3D(i.TEXTURE_2D_ARRAY,He,$,Z.width,Z.height,Z.depth),be)if(y.layerUpdates.size>0){let ne=X1(Z.width,Z.height,y.format,y.type);for(let Ae of y.layerUpdates){let Ve=Z.data.subarray(Ae*ne/Z.data.BYTES_PER_ELEMENT,(Ae+1)*ne/Z.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ae,Z.width,Z.height,1,ae,R,Ve)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,ae,R,Z.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,$,Z.width,Z.height,Z.depth,0,ae,R,Z.data);else if(y.isData3DTexture)ie?(re&&t.texStorage3D(i.TEXTURE_3D,He,$,Z.width,Z.height,Z.depth),be&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,ae,R,Z.data)):t.texImage3D(i.TEXTURE_3D,0,$,Z.width,Z.height,Z.depth,0,ae,R,Z.data);else if(y.isFramebufferTexture){if(re)if(ie)t.texStorage2D(i.TEXTURE_2D,He,$,Z.width,Z.height);else{let ne=Z.width,Ae=Z.height;for(let Ve=0;Ve<He;Ve++)t.texImage2D(i.TEXTURE_2D,Ve,$,ne,Ae,0,ae,R,null),ne>>=1,Ae>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let ne=i.canvas;if(ne.hasAttribute("layoutsubtree")||ne.setAttribute("layoutsubtree","true"),Z.parentNode!==ne){ne.appendChild(Z),f.add(y),ne.onpaint=Ae=>{let Ve=Ae.changedElements;for(let de of f)Ve.includes(de.image)&&(de.needsUpdate=!0)},ne.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Z);else{let Ve=i.RGBA,de=i.RGBA,at=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ve,de,at,Z)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(oe.length>0){if(ie&&re){let ne=Fe(oe[0]);t.texStorage2D(i.TEXTURE_2D,He,$,ne.width,ne.height)}for(let ne=0,Ae=oe.length;ne<Ae;ne++)W=oe[ne],ie?be&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,ae,R,W):t.texImage2D(i.TEXTURE_2D,ne,$,ae,R,W);y.generateMipmaps=!1}else if(ie){if(re){let ne=Fe(Z);t.texStorage2D(i.TEXTURE_2D,He,$,ne.width,ne.height)}be&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ae,R,Z)}else t.texImage2D(i.TEXTURE_2D,0,$,ae,R,Z);E(y)&&y.mipmapsAutoUpdate===!0&&b(ee),ce.__version=se.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function tn(T,y,B){if(y.image.length!==6)return;let ee=ot(T,y),K=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+B);let se=n.get(K);if(K.version!==se.__version||ee===!0){t.activeTexture(i.TEXTURE0+B);let ce=Qe.getPrimaries(Qe.workingColorSpace),Y=y.colorSpace===ui?null:Qe.getPrimaries(y.colorSpace),Z=y.colorSpace===ui||ce===Y?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Z);let ae=y.isCompressedTexture||y.image[0].isCompressedTexture,R=y.image[0]&&y.image[0].isDataTexture,$=[];for(let de=0;de<6;de++)!ae&&!R?$[de]=M(y.image[de],!0,s.maxCubemapSize):$[de]=R?y.image[de].image:y.image[de],$[de]=Re(y,$[de]);let W=$[0],oe=r.convert(y.format,y.colorSpace),ie=r.convert(y.type),re=w(y.internalFormat,oe,ie,y.normalized,y.colorSpace),be=y.isVideoTexture!==!0,He=se.__version===void 0||ee===!0,ne=K.dataReady,Ae=S(y,W);rt(i.TEXTURE_CUBE_MAP,y);let Ve;if(y.isDepthTexture){if(re=g(y.format===hi,y.type),He)if(be)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,re,W.width,W.height);else for(let de=0;de<6;de++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,re,W.width,W.height,0,oe,ie,null)}else if(ae){be&&He&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ae,re,W.width,W.height);for(let de=0;de<6;de++){Ve=$[de].mipmaps;for(let at=0;at<Ve.length;at++){let Pt=Ve[at];y.format!==Nn?oe!==null?be?ne&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at,0,0,Pt.width,Pt.height,oe,Pt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at,re,Pt.width,Pt.height,0,Pt.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):be?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at,0,0,Pt.width,Pt.height,oe,ie,Pt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at,re,Pt.width,Pt.height,0,oe,ie,Pt.data)}}}else{if(Ve=y.mipmaps,be&&He){Ve.length>0&&Ae++;let de=Fe($[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ae,re,de.width,de.height)}for(let de=0;de<6;de++)if(R){be?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,$[de].width,$[de].height,oe,ie,$[de].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,re,$[de].width,$[de].height,0,oe,ie,$[de].data);for(let at=0;at<Ve.length;at++){let gi=Ve[at].image[de].image;be?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at+1,0,0,gi.width,gi.height,oe,ie,gi.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at+1,re,gi.width,gi.height,0,oe,ie,gi.data)}}else{be?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,oe,ie,$[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,re,oe,ie,$[de]);for(let at=0;at<Ve.length;at++){let Pt=Ve[at];be?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at+1,0,0,oe,ie,Pt.image[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,at+1,re,oe,ie,Pt.image[de])}}}E(y)&&y.mipmapsAutoUpdate===!0&&b(i.TEXTURE_CUBE_MAP),se.__version=K.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function pt(T,y,B,ee,K,se){let ce=r.convert(B.format,B.colorSpace),Y=r.convert(B.type),Z=w(B.internalFormat,ce,Y,B.normalized,B.colorSpace),ae=n.get(y),R=n.get(B);if(R.__renderTarget=y,!ae.__hasExternalTextures){let $=Math.max(1,y.width>>se),W=Math.max(1,y.height>>se);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?t.texImage3D(K,se,Z,$,W,y.depth,0,ce,Y,null):t.texImage2D(K,se,Z,$,W,0,ce,Y,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),ue(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,K,R.__webglTexture,0,dt(y)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ee,K,R.__webglTexture,se),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Fn(T,y,B){if(i.bindRenderbuffer(i.RENDERBUFFER,T),y.depthBuffer){let ee=y.depthTexture,K=ee&&ee.isDepthTexture?ee.type:null,se=g(y.stencilBuffer,K),ce=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ue(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,dt(y),se,y.width,y.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,dt(y),se,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,se,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ce,i.RENDERBUFFER,T)}else{let ee=y.textures;for(let K=0;K<ee.length;K++){let se=ee[K],ce=r.convert(se.format,se.colorSpace),Y=r.convert(se.type),Z=w(se.internalFormat,ce,Y,se.normalized,se.colorSpace);ue(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,dt(y),Z,y.width,y.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,dt(y),Z,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,Z,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Rt(T,y,B){let ee=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(y.depthTexture);K.__renderTarget=y;let se=ee?y.depthTexture.image[0]:y.depthTexture.image;(!K.__webglTexture||se.width!==y.width||se.height!==y.height)&&(se.width=y.width,se.height=y.height,y.depthTexture.needsUpdate=!0),ee?me(y.depthTexture,0):pe(y.depthTexture,0);let ce=K.__webglTexture,Y=dt(y),Z=ee?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,ae=y.depthTexture.format===hi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===ri)ue(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ae,Z,ce,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,ae,Z,ce,0);else if(y.depthTexture.format===hi)ue(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ae,Z,ce,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,ae,Z,ce,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function fn(T){let y=n.get(T),B=T.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==T.depthTexture){let ee=T.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),ee){let K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,ee.removeEventListener("dispose",K)};ee.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=ee}if(T.depthTexture&&!y.__autoAllocateDepthBuffer)if(B)for(let ee=0;ee<6;ee++)Rt(y.__webglFramebuffer[ee],T,ee);else T.texture.mipmaps.length>0?Rt(y.__webglFramebuffer[0],T,0):Rt(y.__webglFramebuffer,T,0);else if(B){y.__webglDepthbuffer=[];for(let ee=0;ee<6;ee++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[ee]),y.__webglDepthbuffer[ee]===void 0)y.__webglDepthbuffer[ee]=i.createRenderbuffer(),Fn(y.__webglDepthbuffer[ee],T,!1);else{let K=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,se=y.__webglDepthbuffer[ee];i.bindRenderbuffer(i.RENDERBUFFER,se),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,se)}}else if(T.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),Fn(y.__webglDepthbuffer,T,!1);else{let K=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,se=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,se),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,se)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function pn(T,y,B){let ee=n.get(T);y!==void 0&&pt(ee.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&fn(T)}function mn(T){let y=T.texture,B=n.get(T),ee=n.get(y);T.addEventListener("dispose",F),L(T);let K=T.textures,se=T.isWebGLCubeRenderTarget===!0,ce=K.length>1;if(ce||(ee.__webglTexture===void 0&&(ee.__webglTexture=i.createTexture()),ee.__version=y.version,a.memory.textures++),se){B.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(y.mipmaps.length>0){B.__webglFramebuffer[Y]=[];for(let Z=0;Z<y.mipmaps.length;Z++)B.__webglFramebuffer[Y][Z]=i.createFramebuffer()}else B.__webglFramebuffer[Y]=i.createFramebuffer()}else{if(y.mipmaps.length>0){B.__webglFramebuffer=[];for(let Y=0;Y<y.mipmaps.length;Y++)B.__webglFramebuffer[Y]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(ce)for(let Y=0,Z=K.length;Y<Z;Y++){let ae=n.get(K[Y]);ae.__webglTexture===void 0&&(ae.__webglTexture=i.createTexture(),a.memory.textures++)}if(T.samples>0&&ue(T)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Y=0;Y<K.length;Y++){let Z=K[Y];B.__webglColorRenderbuffer[Y]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[Y]);let ae=r.convert(Z.format,Z.colorSpace),R=r.convert(Z.type),$=w(Z.internalFormat,ae,R,Z.normalized,Z.colorSpace,T.isXRRenderTarget===!0),W=dt(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,W,$,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Y,i.RENDERBUFFER,B.__webglColorRenderbuffer[Y])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),Fn(B.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(se){t.bindTexture(i.TEXTURE_CUBE_MAP,ee.__webglTexture),rt(i.TEXTURE_CUBE_MAP,y);for(let Y=0;Y<6;Y++)if(y.mipmaps.length>0)for(let Z=0;Z<y.mipmaps.length;Z++)pt(B.__webglFramebuffer[Y][Z],T,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Z);else pt(B.__webglFramebuffer[Y],T,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);E(y)?b(i.TEXTURE_CUBE_MAP):y.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}else if(ce){for(let Y=0,Z=K.length;Y<Z;Y++){let ae=K[Y],R=n.get(ae),$=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&($=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture($,R.__webglTexture),rt($,ae),pt(B.__webglFramebuffer,T,ae,i.COLOR_ATTACHMENT0+Y,$,0),E(ae)&&b($)}t.unbindTexture()}else{let Y=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Y=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Y,ee.__webglTexture),rt(Y,y),y.mipmaps.length>0)for(let Z=0;Z<y.mipmaps.length;Z++)pt(B.__webglFramebuffer[Z],T,y,i.COLOR_ATTACHMENT0,Y,Z);else pt(B.__webglFramebuffer,T,y,i.COLOR_ATTACHMENT0,Y,0);E(y)?b(Y):y.mipmaps.length>0&&i.texParameteri(Y,i.TEXTURE_MAX_LEVEL,y.mipmaps.length-1),t.unbindTexture()}T.depthBuffer&&fn(T)}function D(T){let y=T.textures;for(let B=0,ee=y.length;B<ee;B++){let K=y[B];if(E(K)&&K.mipmapsAutoUpdate===!0){let se=A(T),ce=n.get(K).__webglTexture;t.bindTexture(se,ce),b(se),t.unbindTexture()}}}let gn=[];function ut(T){if(T.samples>0){if(ue(T)===!1){let y=T.textures,B=T.width,ee=T.height,K=i.COLOR_BUFFER_BIT,se=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=n.get(T),Y=y.length>1;if(Y)for(let ae=0;ae<y.length;ae++)t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer),T.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let ae=0;ae<y.length;ae++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),Y){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ce.__webglColorRenderbuffer[ae]);let R=n.get(y[ae]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,R,0)}i.blitFramebuffer(0,0,B,ee,0,0,B,ee,K,i.NEAREST),l===!0&&(gn.length=0,gn.push(i.COLOR_ATTACHMENT0+ae),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&gn.push(se),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,gn))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Y)for(let ae=0;ae<y.length;ae++){t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,ce.__webglColorRenderbuffer[ae]);let R=n.get(y[ae]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,R,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&l){let y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function dt(T){return Math.min(s.maxSamples,T.samples)}function ue(T){let y=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function wt(T){let y=a.render.frame;h.get(T)!==y&&(h.set(T,y),T.update())}function Re(T,y){let B=T.colorSpace,ee=T.format,K=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||B!==dr&&B!==ui&&(Qe.getTransfer(B)===st?(ee!==Nn||K!==sn)&&Pe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):De("WebGLTextures: Unsupported texture color space:",B)),y}function Fe(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=Oe,this.resetTextureUnits=j,this.getTextureUnits=Q,this.setTextureUnits=Me,this.setTexture2D=pe,this.setTexture2DArray=_e,this.setTexture3D=Ce,this.setTextureCube=me,this.rebindTextures=pn,this.setupRenderTarget=mn,this.updateRenderTargetMipmap=D,this.updateMultisampleRenderTarget=ut,this.setupDepthRenderbuffer=fn,this.setupFrameBufferTexture=pt,this.useMultisampledRTT=ue,this.dispose=H}function Op(i,e){function t(n,s=ui){let r,a=Qe.getTransfer(s);if(n===sn)return i.UNSIGNED_BYTE;if(n===vo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Mo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===I1)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===L1)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===R1)return i.BYTE;if(n===P1)return i.SHORT;if(n===Ws)return i.UNSIGNED_SHORT;if(n===yo)return i.INT;if(n===Ln)return i.UNSIGNED_INT;if(n===Mn)return i.FLOAT;if(n===Dn)return i.HALF_FLOAT;if(n===D1)return i.ALPHA;if(n===N1)return i.RGB;if(n===Nn)return i.RGBA;if(n===ri)return i.DEPTH_COMPONENT;if(n===hi)return i.DEPTH_STENCIL;if(n===So)return i.RED;if(n===bo)return i.RED_INTEGER;if(n===Pi)return i.RG;if(n===wo)return i.RG_INTEGER;if(n===To)return i.RGBA_INTEGER;if(n===zr||n===kr||n===Gr||n===Vr)if(a===st)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===zr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===zr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Gr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Vr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ao||n===Eo||n===Co||n===Ro)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ao)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Eo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Co)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ro)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Po||n===Io||n===Lo||n===Do||n===No||n===Hr||n===Uo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Po||n===Io)return a===st?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Lo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Do)return r.COMPRESSED_R11_EAC;if(n===No)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Hr)return r.COMPRESSED_RG11_EAC;if(n===Uo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Fo||n===Oo||n===Bo||n===zo||n===ko||n===Go||n===Vo||n===Ho||n===Wo||n===Xo||n===qo||n===Yo||n===Zo||n===Jo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Fo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Oo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Bo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===zo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ko)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Go)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Vo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ho)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===qo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Yo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Zo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Jo)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===$o||n===Ko||n===jo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===$o)return a===st?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ko)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===jo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Qo||n===el||n===Wr||n===tl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Qo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===el)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===tl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Qi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Bp=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,zp=`
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

}`,ec=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new wr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Hn({vertexShader:Bp,fragmentShader:zp,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ne(new vn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},tc=class extends Gn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,f=null,d=null,u=null,x=null,_=typeof XRWebGLBinding<"u",m=new ec,p={},M=t.getContextAttributes(),E=null,b=null,A=[],w=[],g=new Ee,S=null,L=null,C=new qt;C.viewport=new ft;let N=new qt;N.viewport=new ft;let F=[C,N],k=new po,P=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let pe=A[J];return pe===void 0&&(pe=new Ls,A[J]=pe),pe.getTargetRaySpace()},this.getControllerGrip=function(J){let pe=A[J];return pe===void 0&&(pe=new Ls,A[J]=pe),pe.getGripSpace()},this.getHand=function(J){let pe=A[J];return pe===void 0&&(pe=new Ls,A[J]=pe),pe.getHandSpace()};function q(J){let pe=w.indexOf(J.inputSource);if(pe===-1)return;let _e=A[pe];_e!==void 0&&(_e.update(J.inputSource,J.frame,c||a),_e.dispatchEvent({type:J.type,data:J.inputSource}))}function V(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",te);for(let J=0;J<A.length;J++){let pe=w[J];pe!==null&&(w[J]=null,A[J].disconnect(pe))}P=null,H=null,m.reset();for(let J in p)delete p[J];if(e.setRenderTarget(E),u=null,d=null,f=null,s=null,b=null,Oe.stop(),n.isPresenting=!1,e.setPixelRatio(S),e.setSize(g.width,g.height,!1),L!==null){let J=L.camera;J.fov=L.fov,J.zoom=L.zoom,J.updateProjectionMatrix(),L=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&Pe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,n.isPresenting===!0&&Pe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return d!==null?d:u},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",V),s.addEventListener("inputsourceschange",te),M.xrCompatible!==!0&&await t.makeXRCompatible(),S=e.getPixelRatio(),e.getSize(g),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let _e=null,Ce=null,me=null;M.depth&&(me=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,_e=M.stencil?hi:ri,Ce=M.stencil?Qi:Ln);let ze={colorFormat:t.RGBA8,depthFormat:me,scaleFactor:r};f=this.getBinding(),d=f.createProjectionLayer(ze),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new hn(d.textureWidth,d.textureHeight,{format:Nn,type:sn,depthTexture:new oi(d.textureWidth,d.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,_e),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let _e={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,t,_e),s.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),b=new hn(u.framebufferWidth,u.framebufferHeight,{format:Nn,type:sn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Oe.setContext(s),Oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(J){for(let pe=0;pe<J.removed.length;pe++){let _e=J.removed[pe],Ce=w.indexOf(_e);Ce>=0&&(w[Ce]=null,A[Ce].disconnect(_e))}for(let pe=0;pe<J.added.length;pe++){let _e=J.added[pe],Ce=w.indexOf(_e);if(Ce===-1){for(let ze=0;ze<A.length;ze++)if(ze>=w.length){w.push(_e),Ce=ze;break}else if(w[ze]===null){w[ze]=_e,Ce=ze;break}if(Ce===-1)break}let me=A[Ce];me&&me.connect(_e)}}function X(J,pe){pe===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(pe.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let pe=J.near,_e=J.far;m.texture!==null&&(m.depthNear>0&&(pe=m.depthNear),m.depthFar>0&&(_e=m.depthFar)),k.near=N.near=C.near=pe,k.far=N.far=C.far=_e,(P!==k.near||H!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),P=k.near,H=k.far),k.layers.mask=J.layers.mask|6,C.layers.mask=k.layers.mask&-5,N.layers.mask=k.layers.mask&-3;let Ce=J.parent,me=k.cameras;X(k,Ce);for(let ze=0;ze<me.length;ze++)X(me[ze],Ce);k.projectionMatrix.copy(C.projectionMatrix),k.projectionMatrixInverse.copy(C.projectionMatrixInverse),L===null&&J.isPerspectiveCamera&&(L={camera:J,fov:J.fov,zoom:J.zoom}),j(J,k,Ce)};function j(J,pe,_e){_e===null?J.matrix.copy(pe.matrixWorld):(J.matrix.copy(_e.matrixWorld),J.matrix.invert(),J.matrix.multiply(pe.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(pe.projectionMatrix),J.projectionMatrixInverse.copy(pe.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=qa*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&u===null))return l},this.setFoveation=function(J){l=J,d!==null&&(d.fixedFoveation=J),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=J)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(J){return p[J]};let Q=null;function Me(J,pe){if(h=pe.getViewerPose(c||a),x=pe,h!==null){let _e=h.views;u!==null&&(e.setRenderTargetFramebuffer(b,u.framebuffer),e.setRenderTarget(b));let Ce=!1;_e.length!==k.cameras.length&&(k.cameras.length=0,Ce=!0);for(let Le=0;Le<_e.length;Le++){let rt=_e[Le],ot=null;if(u!==null)ot=u.getViewport(rt);else{let Bt=f.getViewSubImage(d,rt);ot=Bt.viewport,Le===0&&(e.setRenderTargetTextures(b,Bt.colorTexture,Bt.depthStencilTexture),e.setRenderTarget(b))}let $e=F[Le];$e===void 0&&($e=new qt,$e.layers.enable(Le),$e.viewport=new ft,F[Le]=$e),$e.matrix.fromArray(rt.transform.matrix),$e.matrix.decompose($e.position,$e.quaternion,$e.scale),$e.projectionMatrix.fromArray(rt.projectionMatrix),$e.projectionMatrixInverse.copy($e.projectionMatrix).invert(),$e.viewport.set(ot.x,ot.y,ot.width,ot.height),Le===0&&(k.matrix.copy($e.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Ce===!0&&k.cameras.push($e)}let me=s.enabledFeatures;if(me&&me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){f=n.getBinding();let Le=f.getDepthInformation(_e[0]);Le&&Le.isValid&&Le.texture&&m.init(Le,s.renderState)}if(me&&me.includes("camera-access")&&_){e.state.unbindTexture(),f=n.getBinding();for(let Le=0;Le<_e.length;Le++){let rt=_e[Le].camera;if(rt){let ot=p[rt];ot||(ot=new wr,p[rt]=ot);let $e=f.getCameraImage(rt);ot.sourceTexture=$e}}}}for(let _e=0;_e<A.length;_e++){let Ce=w[_e],me=A[_e];Ce!==null&&me!==void 0&&me.update(Ce,pe,c||a)}Q&&Q(J,pe),pe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:pe}),x=null}let Oe=new Eu;Oe.setAnimationLoop(Me),this.setAnimationLoop=function(J){Q=J},this.dispose=function(){}}},kp=new nt,Ou=new Ue;Ou.set(-1,0,0,0,1,0,0,0,1);function Gp(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,V1(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,M,E,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),f(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&u(m,p,b)):p.isMeshMatcapMaterial?(r(m,p),x(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,E):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===kt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===kt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let M=e.get(p),E=M.envMap,b=M.envMapRotation;E&&(m.envMap.value=E,m.envMapRotation.value.setFromMatrix4(kp.makeRotationFromEuler(b)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Ou),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,E){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=E*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function f(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function u(m,p,M){m.ior.value=p.ior,p.diffuseRoughness>0&&(m.diffuseRoughness.value=p.diffuseRoughness,p.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=p.diffuseRoughnessMap,t(p.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===kt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=p.iridescenceThicknessMaximum,p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Vp(i,e,t,n){let s={},r={};function a(M,E){let b=E.program;n.uniformBlockBinding(M,b,s[M.id])}function o(M,E){let b=s[M.id];b===void 0&&(x(M),b=l(M),s[M.id]=b,M.addEventListener("dispose",m));let A=E.program;n.updateUBOMapping(M,A);let w=e.render.frame;r[M.id]!==w&&(c(M),r[M.id]=w)}function l(M){let E=i.createBuffer(),b=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,b,A),i.bindBuffer(i.UNIFORM_BUFFER,null),E}function c(M){let E=s[M.id],b=M.uniforms,A=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let w=0,g=b.length;w<g;w++){let S=b[w];if(Array.isArray(S))for(let L=0,C=S.length;L<C;L++)h(S[L],w,L,A);else h(S,w,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(M,E,b,A){if(d(M,E,b,A)===!0){let w=M.__offset,g=M.value;if(Array.isArray(g)){let S=0;for(let L=0;L<g.length;L++){let C=g[L],N=_(C,!0);f(C,M.__data,S),S+=N.storage/Float32Array.BYTES_PER_ELEMENT}}else f(g,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,w,M.__data)}}function f(M,E,b){typeof M=="number"||typeof M=="boolean"?E[b]=M:M.isMatrix3?(E[b]=M.elements[0],E[b+1]=M.elements[1],E[b+2]=M.elements[2],E[b+3]=0,E[b+4]=M.elements[3],E[b+5]=M.elements[4],E[b+6]=M.elements[5],E[b+7]=0,E[b+8]=M.elements[6],E[b+9]=M.elements[7],E[b+10]=M.elements[8],E[b+11]=0):ArrayBuffer.isView(M)?E.set(M.subarray(0,E.length-b),b):M.toArray(E,b)}function d(M,E,b,A){let w=M.value,g=E+"_"+b;if(Array.isArray(w)){A[g]===void 0&&(A[g]=[]);let S=A[g],L=!1;for(let C=0;C<w.length;C++)u(w[C],S,C)===!0&&(L=!0);return L}return u(w,A,g)}function u(M,E,b){if(E[b]===void 0)return typeof M=="number"||typeof M=="boolean"?E[b]=M:ArrayBuffer.isView(M)?E[b]=M.slice():E[b]=M.clone(),!0;{let A=E[b];if(typeof M=="number"||typeof M=="boolean"){if(A!==M)return E[b]=M,!0}else{if(ArrayBuffer.isView(M))return!0;if(A.equals(M)===!1)return A.copy(M),!0}}return!1}function x(M){let E=M.uniforms,b=0,A=16;for(let g=0,S=E.length;g<S;g++){let L=Array.isArray(E[g])?E[g]:[E[g]];for(let C=0,N=L.length;C<N;C++){let F=L[C],k=Array.isArray(F.value)?F.value:[F.value],P=Array.isArray(E[g])||Array.isArray(F.value),H=b;for(let V=0,te=k.length;V<te;V++){let X=k[V],j=_(X,P),Q=b%A,Me=Q%j.boundary,Oe=Q+Me;b+=Me,Oe!==0&&A-Oe<j.storage&&(b+=A-Oe),V===0&&(H=b),b+=j.storage}let q=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new q((b-H)/Float32Array.BYTES_PER_ELEMENT),F.__offset=H}}let w=b%A;return w>0&&(b+=A-w),M.__size=b,M.__cache={},this}function _(M,E){let b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=16,b.storage=48):M.isMatrix4?(b.boundary=16,b.storage=64):M.isTexture?Pe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(b.boundary=16,b.storage=M.byteLength):Pe("WebGLRenderer: Unsupported uniform value type.",M),E===!0&&(b.boundary=16,b.storage=Math.ceil(b.storage/16)*16),b}function m(M){let E=M.target;E.removeEventListener("dispose",m),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function p(){for(let M in s)i.deleteBuffer(s[M]);s={},r={}}return{bind:a,update:o,dispose:p}}var Hp=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Xn=null;function Wp(){return Xn===null&&(Xn=new vr(Hp,16,16,Pi,Dn),Xn.name="DFG_LUT",Xn.minFilter=Kt,Xn.magFilter=Kt,Xn.wrapS=kn,Xn.wrapT=kn,Xn.generateMipmaps=!1,Xn.needsUpdate=!0),Xn}var rl=class{constructor(e={}){let{canvas:t=Zh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:d=!1,outputBufferType:u=sn}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=a;let _=u,m=new Set([To,wo,bo]),p=new Set([sn,Ln,Ws,Qi,vo,Mo]),M=new Uint32Array(4),E=new Int32Array(4),b={textures:[],min:[],max:[],resolution:[]},A=null,w=null,g=[],S=[],L=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Wn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,N=!1,F=null,k=null,P=null,H=null;this._outputColorSpace=Nt;let q=0,V=0,te=null,X=-1,j=null,Q=new ft,Me=new ft,Oe=null,J=new Ie(0),pe=0,_e=t.width,Ce=t.height,me=1,ze=null,yt=null,Le=new ft(0,0,_e,Ce),rt=new ft(0,0,_e,Ce),ot=!1,$e=new wi,Bt=new Ka,bt=!1,tn=!1,pt=new nt,Fn=new U,Rt=new ft,fn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},pn=!1;function mn(){return te===null?me:1}let D=n;function gn(v,I){return t.getContext(v,I)}let ut,dt,ue,wt,Re,Fe,T,y,B,ee,K,se,ce,Y,Z,ae,R,$,W,oe,ie,re,be;try{let v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Ae,!1),t.addEventListener("webglcontextrestored",Ve,!1),t.addEventListener("webglcontextcreationerror",de,!1),D===null){let I="webgl2";if(D=gn(I,v),D===null)throw gn(I)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}He()}catch(v){throw t.removeEventListener("webglcontextlost",Ae,!1),t.removeEventListener("webglcontextrestored",Ve,!1),t.removeEventListener("webglcontextcreationerror",de,!1),De("WebGLRenderer: "+v.message),v}function He(){ut=new t3(D),ut.init(),ie=new Op(D,ut),dt=new W2(D,ut,e,ie),ue=new Up(D,ut),dt.reversedDepthBuffer&&d&&ue.buffers.depth.setReversed(!0),k=D.createFramebuffer(),P=D.createFramebuffer(),H=D.createFramebuffer(),wt=new s3(D),Re=new Mp,Fe=new Fp(D,ut,ue,Re,dt,ie,wt),T=new e3(C),y=new rd(D),re=new V2(D,y),B=new n3(D,y,wt,re),ee=new a3(D,B,y,re,wt),$=new r3(D,dt,Fe),Z=new X2(Re),K=new vp(C,T,ut,dt,re,Z),se=new Gp(C,Re),ce=new bp,Y=new Rp(ut),R=new G2(C,T,ue,ee,x,l),ae=new Np(C,ee,dt),be=new Vp(D,wt,dt,ue),W=new H2(D,ut,wt),oe=new i3(D,ut,wt),wt.programs=K.programs,C.capabilities=dt,C.extensions=ut,C.properties=Re,C.renderLists=ce,C.shadowMap=ae,C.state=ue,C.info=wt}_!==sn&&(L=new l3(_,t.width,t.height,o,s,r));let ne=new tc(C,D);this.xr=ne,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let v=ut.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=ut.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return me},this.setPixelRatio=function(v){v!==void 0&&(me=v,this.setSize(_e,Ce,!1))},this.getSize=function(v){return v.set(_e,Ce)},this.setSize=function(v,I,G=!0){if(ne.isPresenting){Pe("WebGLRenderer: Can't change size while VR device is presenting.");return}_e=v,Ce=I,t.width=Math.floor(v*me),t.height=Math.floor(I*me),G===!0&&(t.style.width=v+"px",t.style.height=I+"px"),L!==null&&L.setSize(t.width,t.height),this.setViewport(0,0,v,I)},this.getDrawingBufferSize=function(v){return v.set(_e*me,Ce*me).floor()},this.setDrawingBufferSize=function(v,I,G){_e=v,Ce=I,me=G,t.width=Math.floor(v*G),t.height=Math.floor(I*G),this.setViewport(0,0,v,I)},this.setEffects=function(v){if(_===sn){De("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let I=0;I<v.length;I++)if(v[I].isOutputPass===!0){Pe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}L.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(Q)},this.getViewport=function(v){return v.copy(Le)},this.setViewport=function(v,I,G,O){v.isVector4?Le.set(v.x,v.y,v.z,v.w):Le.set(v,I,G,O),ue.viewport(Q.copy(Le).multiplyScalar(mn()).round())},this.getScissor=function(v){return v.copy(rt)},this.setScissor=function(v,I,G,O){v.isVector4?rt.set(v.x,v.y,v.z,v.w):rt.set(v,I,G,O),ue.scissor(Me.copy(rt).multiplyScalar(mn()).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(v){ue.setScissorTest(ot=v)},this.setOpaqueSort=function(v){ze=v},this.setTransparentSort=function(v){yt=v},this.getClearColor=function(v){return v.copy(R.getClearColor())},this.setClearColor=function(){R.setClearColor(...arguments)},this.getClearAlpha=function(){return R.getClearAlpha()},this.setClearAlpha=function(){R.setClearAlpha(...arguments)},this.clear=function(v=!0,I=!0,G=!0){let O=0;if(v){let z=!1;if(te!==null){let he=te.texture.format;z=m.has(he)}if(z){let he=te.texture.type,xe=p.has(he),le=R.getClearColor(),ge=R.getClearAlpha(),Se=le.r,Be=le.g,Ke=le.b;xe?(M[0]=Se,M[1]=Be,M[2]=Ke,M[3]=ge,D.clearBufferuiv(D.COLOR,0,M)):(E[0]=Se,E[1]=Be,E[2]=Ke,E[3]=ge,D.clearBufferiv(D.COLOR,0,E))}else O|=D.COLOR_BUFFER_BIT}I&&(O|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),G&&(O|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&D.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),F=v},this.dispose=function(){t.removeEventListener("webglcontextlost",Ae,!1),t.removeEventListener("webglcontextrestored",Ve,!1),t.removeEventListener("webglcontextcreationerror",de,!1),R.dispose(),ce.dispose(),Y.dispose(),Fe.dispose(),Re.dispose(),T.dispose(),ee.dispose(),B.dispose(),re.dispose(),be.dispose(),K.dispose(),ne.dispose(),ne.removeEventListener("sessionstart",Sc),ne.removeEventListener("sessionend",bc),Di.stop()};function Ae(v){v.preventDefault(),mr("WebGLRenderer: Context Lost."),N=!0}function Ve(){mr("WebGLRenderer: Context Restored."),N=!1;let v=wt.autoReset,I=ae.enabled,G=ae.autoUpdate,O=ae.needsUpdate,z=ae.type;He(),wt.autoReset=v,ae.enabled=I,ae.autoUpdate=G,ae.needsUpdate=O,ae.type=z}function de(v){De("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function at(v){let I=v.target;I.removeEventListener("dispose",at),Pt(I)}function Pt(v){gi(v),Re.remove(v)}function gi(v){let I=Re.get(v).programs;I!==void 0&&(I.forEach(function(G){K.releaseProgram(G)}),v.isShaderMaterial&&K.releaseShaderCache(v))}this.renderBufferDirect=function(v,I,G,O,z,he){I===null&&(I=fn);let xe=z.isMesh&&z.matrixWorld.determinantAffine()<0,le=y0(v,I,G,O,z);ue.setMaterial(O,xe);let ge=G.index,Se=1;if(O.wireframe===!0){if(ge=B.getWireframeAttribute(G),ge===void 0)return;Se=2}let Be=G.drawRange,Ke=G.attributes.position,ye=Be.start*Se,je=(Be.start+Be.count)*Se;he!==null&&(ye=Math.max(ye,he.start*Se),je=Math.min(je,(he.start+he.count)*Se)),ge!==null?(ye=Math.max(ye,0),je=Math.min(je,ge.count)):Ke!=null&&(ye=Math.max(ye,0),je=Math.min(je,Ke.count));let vt=je-ye;if(vt<0||vt===1/0)return;re.setup(z,O,le,G,ge);let ct,lt=W;if(ge!==null&&(ct=y.get(ge),lt=oe,lt.setIndex(ct)),z.isMesh)O.wireframe===!0?(ue.setLineWidth(O.wireframeLinewidth*mn()),lt.setMode(D.LINES)):lt.setMode(D.TRIANGLES);else if(z.isLine){let Vt=O.linewidth;Vt===void 0&&(Vt=1),ue.setLineWidth(Vt*mn()),z.isLineSegments?lt.setMode(D.LINES):z.isLineLoop?lt.setMode(D.LINE_LOOP):lt.setMode(D.LINE_STRIP)}else z.isPoints?lt.setMode(D.POINTS):z.isSprite&&lt.setMode(D.TRIANGLES);if(z.isBatchedMesh)if(ut.get("WEBGL_multi_draw"))lt.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let Vt=z._multiDrawStarts,ve=z._multiDrawCounts,Jt=z._multiDrawCount,it=ge?y.get(ge).bytesPerElement:1,Ni=Re.get(O).currentProgram.getUniforms();for(let Ht=0;Ht<Jt;Ht++)Ni.setValue(D,"_gl_DrawID",Ht),lt.render(Vt[Ht]/it,ve[Ht])}else if(z.isInstancedMesh)lt.renderInstances(ye,vt,z.count);else if(G.isInstancedBufferGeometry){let Vt=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,ve=Math.min(G.instanceCount,Vt);lt.renderInstances(ye,vt,ve)}else lt.render(ye,vt)};function Mc(v,I,G,O){F!==null&&v.isNodeMaterial&&F.setObject(O,v),bt===!0&&Z.setState(v,G,!1),v.transparent===!0&&v.side===nn&&v.forceSinglePass===!1?(v.side=kt,v.needsUpdate=!0,er(v,I,O),v.side=Ri,v.needsUpdate=!0,er(v,I,O),v.side=nn):er(v,I,O)}this.compile=function(v,I,G=null){G===null&&(G=v),F!==null&&F.renderStart(v,I,G),w=Y.get(G),w.init(I),S.push(w),G.traverseVisible(function(z){z.isLight&&z.layers.test(I.layers)&&(w.pushLight(z),z.castShadow&&w.pushShadow(z))}),v!==G&&v.traverseVisible(function(z){z.isLight&&z.layers.test(I.layers)&&(w.pushLight(z),z.castShadow&&w.pushShadow(z))}),w.setupLights(),F!==null&&F.updateLights(w.state.lightsArray),tn=this.localClippingEnabled,bt=Z.init(this.clippingPlanes,tn),bt===!0&&Z.setGlobalState(this.clippingPlanes,I),F!==null&&ae.render(w.state.shadowsArray,G,I);let O=new Set;return v.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let he=z.material;if(he)if(Array.isArray(he))for(let xe=0;xe<he.length;xe++){let le=he[xe];Mc(le,G,I,z),O.add(le)}else Mc(he,G,I,z),O.add(he)}),w=S.pop(),F!==null&&F.renderEnd(),O},this.compileAsync=function(v,I,G=null){let O=this.compile(v,I,G);return new Promise(z=>{function he(){if(O.forEach(function(xe){let ge=Re.get(xe).currentProgram;(ge===void 0||ge.isReady())&&O.delete(xe)}),O.size===0){z(v);return}setTimeout(he,10)}ut.get("KHR_parallel_shader_compile")!==null?he():setTimeout(he,10)})};let Ll=null;function x0(v){Ll&&Ll(v)}function Sc(){Di.stop()}function bc(){Di.start()}let Di=new Eu;Di.setAnimationLoop(x0),typeof self<"u"&&Di.setContext(self),this.setAnimationLoop=function(v){Ll=v,ne.setAnimationLoop(v),v===null?Di.stop():Di.start()},ne.addEventListener("sessionstart",Sc),ne.addEventListener("sessionend",bc),this.render=function(v,I){if(I!==void 0&&I.isCamera!==!0){De("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;F!==null&&F.renderStart(v,I);let G=ne.enabled===!0&&ne.isPresenting===!0,O=L!==null&&(te===null||G)&&L.begin(C,te);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),ne.enabled===!0&&ne.isPresenting===!0&&(L===null||L.isCompositing()===!1)&&(ne.cameraAutoUpdate===!0&&ne.updateCamera(I),I=ne.getCamera()),v.isScene===!0&&v.onBeforeRender(C,v,I,te),w=Y.get(v,S.length),w.init(I),w.state.textureUnits=Fe.getTextureUnits(),S.push(w),pt.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),I.isArrayCamera?Bt.setFromArrayCamera(I):$e.setFromProjectionMatrix(pt,_n,I.reversedDepth),tn=this.localClippingEnabled,bt=Z.init(this.clippingPlanes,tn),A=ce.get(v,g.length),A.init(),g.push(A),this.info.render.frame++,ne.enabled===!0&&ne.isPresenting===!0){let xe=C.xr.getDepthSensingMesh();xe!==null&&Dl(xe,I,-1/0,C.sortObjects)}Dl(v,I,0,C.sortObjects),A.finish(),F!==null&&F.updateLights(w.state.lightsArray),C.sortObjects===!0&&A.sort(ze,yt),pn=ne.enabled===!1||ne.isPresenting===!1||ne.hasDepthSensing()===!1,pn&&R.addToRenderList(A,v),this.info.autoReset===!0&&this.info.reset(),bt===!0&&Z.beginShadows();let z=w.state.shadowsArray;if(ae.render(z,v,I),bt===!0&&Z.endShadows(),(O&&L.hasRenderPass())===!1){let xe=A.opaque,le=A.transmissive;if(w.setupLights(),I.isArrayCamera){let ge=I.cameras;if(le.length>0)for(let Se=0,Be=ge.length;Se<Be;Se++){let Ke=ge[Se];Tc(xe,le,v,Ke)}pn&&R.render(v);for(let Se=0,Be=ge.length;Se<Be;Se++){let Ke=ge[Se];wc(A,v,Ke,Ke.viewport)}}else le.length>0&&Tc(xe,le,v,I),pn&&R.render(v),wc(A,v,I)}te!==null&&V===0&&(Fe.updateMultisampleRenderTarget(te),Fe.updateRenderTargetMipmap(te)),O&&L.end(C),v.isScene===!0&&v.onAfterRender(C,v,I),re.resetDefaultState(),X=-1,j=null,S.pop(),S.length>0?(w=S[S.length-1],Fe.setTextureUnits(w.state.textureUnits),bt===!0&&Z.setGlobalState(C.clippingPlanes,w.state.camera)):w=null,g.pop(),g.length>0?A=g[g.length-1]:A=null,F!==null&&F.renderEnd()};function Dl(v,I,G,O){if(v.visible===!1)return;if(v.layers.test(I.layers)){if(v.isGroup)G=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(I);else if(v.isLight)w.pushLight(v),v.castShadow&&w.pushShadow(v);else if(v.isSprite){let xe=I.isArrayCamera?Bt:$e;if(!v.frustumCulled||v.intersectsFrustum(xe)){O&&Rt.setFromMatrixPosition(v.matrixWorld).applyMatrix4(pt);let le=ee.update(v),ge=v.material;ge.visible&&A.push(v,le,ge,G,Rt.z,null,I)}}else if(v.isMesh||v.isLine||v.isPoints){let xe=I.isArrayCamera?Bt:$e;if(!v.frustumCulled||v.intersectsFrustum(xe)){let le=ee.update(v),ge=v.material;if(O&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Rt.copy(v.boundingSphere.center)):(le.boundingSphere===null&&le.computeBoundingSphere(),Rt.copy(le.boundingSphere.center)),Rt.applyMatrix4(v.matrixWorld).applyMatrix4(pt)),Array.isArray(ge)){let Se=le.groups;for(let Be=0,Ke=Se.length;Be<Ke;Be++){let ye=Se[Be],je=ge[ye.materialIndex];je&&je.visible&&A.push(v,le,je,G,Rt.z,ye,I)}}else ge.visible&&A.push(v,le,ge,G,Rt.z,null,I)}}}let he=v.children;for(let xe=0,le=he.length;xe<le;xe++)Dl(he[xe],I,G,O)}function wc(v,I,G,O){let{opaque:z,transmissive:he,transparent:xe}=v;w.setupLightsView(G),bt===!0&&Z.setGlobalState(C.clippingPlanes,G),O&&ue.viewport(Q.copy(O)),z.length>0&&ra(z,I,G),he.length>0&&ra(he,I,G),xe.length>0&&ra(xe,I,G),ue.buffers.depth.setTest(!0),ue.buffers.depth.setMask(!0),ue.buffers.color.setMask(!0),ue.setPolygonOffset(!1)}function Tc(v,I,G,O){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[O.id]===void 0){let ye=ut.has("EXT_color_buffer_half_float")||ut.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[O.id]=new hn(1,1,{generateMipmaps:!0,type:ye?Dn:sn,minFilter:ci,samples:Math.max(4,dt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Qe.workingColorSpace})}let he=w.state.transmissionRenderTarget[O.id],xe=O.viewport||Q;he.setSize(xe.z*C.transmissionResolutionScale,xe.w*C.transmissionResolutionScale);let le=C.getRenderTarget(),ge=C.getActiveCubeFace(),Se=C.getActiveMipmapLevel();C.setRenderTarget(he),C.getClearColor(J),pe=C.getClearAlpha(),pe<1&&C.setClearColor(16777215,.5),C.clear(),pn&&R.render(G);let Be=C.toneMapping;C.toneMapping=Wn;let Ke=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),w.setupLightsView(O),bt===!0&&Z.setGlobalState(C.clippingPlanes,O),ra(v,G,O),Fe.updateMultisampleRenderTarget(he),Fe.updateRenderTargetMipmap(he),ut.has("WEBGL_multisampled_render_to_texture")===!1){let ye=!1;for(let je=0,vt=I.length;je<vt;je++){let ct=I[je],{object:lt,geometry:Vt,material:ve,group:Jt}=ct;if(ve.side===nn&&lt.layers.test(O.layers)){let it=ve.side;ve.side=kt,ve.needsUpdate=!0,Ac(lt,G,O,Vt,ve,Jt),ve.side=it,ve.needsUpdate=!0,ye=!0}}ye===!0&&(Fe.updateMultisampleRenderTarget(he),Fe.updateRenderTargetMipmap(he))}C.setRenderTarget(le,ge,Se),C.setClearColor(J,pe),Ke!==void 0&&(O.viewport=Ke),C.toneMapping=Be}function ra(v,I,G){let O=I.isScene===!0?I.overrideMaterial:null;for(let z=0,he=v.length;z<he;z++){let xe=v[z],{object:le,geometry:ge,group:Se}=xe,Be=xe.material;Be.allowOverride===!0&&O!==null&&(Be=O),le.layers.test(G.layers)&&Ac(le,I,G,ge,Be,Se)}}function Ac(v,I,G,O,z,he){F!==null&&z.isNodeMaterial&&F.setObject(v,z),v.onBeforeRender(C,I,G,O,z,he),v.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),z.onBeforeRender(C,I,G,O,v,he),z.transparent===!0&&z.side===nn&&z.forceSinglePass===!1?(z.side=kt,z.needsUpdate=!0,C.renderBufferDirect(G,I,O,z,v,he),z.side=Ri,z.needsUpdate=!0,C.renderBufferDirect(G,I,O,z,v,he),z.side=nn):C.renderBufferDirect(G,I,O,z,v,he),v.onAfterRender(C,I,G,O,z,he)}function Ec(v){let I=0;for(let G of v)G.texture!==null&&I++;return I}function er(v,I,G){I.isScene!==!0&&(I=fn);let O=Re.get(v),z=w.state.lights,he=w.state.shadowsArray,xe=z.state.version,le=K.getParameters(v,z.state,he,I,G,w.state.lightProbeGridArray),ge=K.getProgramCacheKey(le),Se=O.programs;O.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?I.environment:null,O.fog=I.fog;let Be=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;O.envMap=T.get(v.envMap||O.environment,Be),O.envMapRotation=O.environment!==null&&v.envMap===null?I.environmentRotation:v.envMapRotation,Se===void 0&&(v.addEventListener("dispose",at),Se=new Map,O.programs=Se,O.programVariants=new Map);let Ke=Se.get(ge);if(Ke!==void 0){if(O.currentProgram===Ke&&O.lightsStateVersion===xe)return Rc(v,le),Ke}else le.uniforms=K.getUniforms(v),F!==null&&v.isNodeMaterial&&F.build(v,G,le),v.onBeforeCompile(le,C),Ke=K.acquireProgram(le,ge),Se.set(ge,Ke),O.uniforms=le.uniforms;let ye=O.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(ye.clippingPlanes=Z.uniform),Rc(v,le),O.needsLights=M0(v),O.lightsStateVersion=xe,O.needsLights&&(ye.ambientLightColor.value=z.state.ambient,ye.lightProbe.value=z.state.probe,ye.sunLights.value=z.state.sun,ye.sunLightShadows.value=z.state.sunShadow,ye.directionalLights.value=z.state.directional,ye.directionalLightShadows.value=z.state.directionalShadow,ye.spotLights.value=z.state.spot,ye.spotLightShadows.value=z.state.spotShadow,ye.rectAreaLights.value=z.state.rectArea,ye.ltc_1.value=z.state.rectAreaLTC1,ye.ltc_2.value=z.state.rectAreaLTC2,ye.pointLights.value=z.state.point,ye.pointLightShadows.value=z.state.pointShadow,ye.hemisphereLights.value=z.state.hemi,ye.sunShadowMatrix.value=z.state.sunShadowMatrix,ye.sunShadowCascade.value=z.state.sunShadowCascade,ye.directionalShadowMatrix.value=z.state.directionalShadowMatrix,ye.spotLightMatrix.value=z.state.spotLightMatrix,ye.spotLightMap.value=z.state.spotLightMap,ye.pointShadowMatrix.value=z.state.pointShadowMatrix),O.numLightProbeGrids=Ec(w.state.lightProbeGridArray),O.currentProgram=Ke,O.uniformsList=null,Ke}function _0(v,I,G,O,z){let he=Re.get(v),xe=he.currentProgram.id+","+O+","+z,le=he.programVariants.get(xe);return le===void 0?(le=er(v,I,G),he.programVariants.set(xe,le)):(he.currentProgram=le,he.uniformsList=null,he.outputColorSpace=O,he.toneMapping=z),le}function Cc(v){if(v.uniformsList===null){let I=v.currentProgram.getUniforms();v.uniformsList=Xs.seqWithValue(I.seq,v.uniforms)}return v.uniformsList}function Rc(v,I){let G=Re.get(v);G.outputColorSpace=I.outputColorSpace,G.batching=I.batching,G.batchingColor=I.batchingColor,G.instancing=I.instancing,G.instancingColor=I.instancingColor,G.instancingMorph=I.instancingMorph,G.skinning=I.skinning,G.morphTargets=I.morphTargets,G.morphNormals=I.morphNormals,G.morphColors=I.morphColors,G.morphTargetsCount=I.morphTargetsCount,G.numClippingPlanes=I.numClippingPlanes,G.numIntersection=I.numClipIntersection,G.vertexAlphas=I.vertexAlphas,G.vertexTangents=I.vertexTangents,G.toneMapping=I.toneMapping}function y0(v,I,G,O,z){I.isScene!==!0&&(I=fn),Fe.resetTextureUnits();let he=I.fog,xe=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?I.environment:null,le=te===null?C.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Qe.workingColorSpace,ge=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,Se=T.get(O.envMap||xe,ge),Be=O.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Ke=!!G.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),ye=!!G.morphAttributes.position,je=!!G.morphAttributes.normal,vt=!!G.morphAttributes.color,ct=Wn;O.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(ct=C.toneMapping);let lt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,Vt=lt!==void 0?lt.length:0,ve=Re.get(O),Jt=w.state.lights;if(bt===!0&&(tn===!0||v!==j)){let mt=v===j&&O.id===X;Z.setState(O,v,mt)}let it=!1,Ni=!1;O.version===ve.__version?ve.needsLights&&ve.lightsStateVersion!==Jt.state.version||z.isBatchedMesh&&ve.batching===!1||!z.isBatchedMesh&&ve.batching===!0||z.isBatchedMesh&&ve.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&ve.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&ve.instancing===!1||!z.isInstancedMesh&&ve.instancing===!0||z.isSkinnedMesh&&ve.skinning===!1||!z.isSkinnedMesh&&ve.skinning===!0||z.isInstancedMesh&&ve.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&ve.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&ve.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&ve.instancingMorph===!1&&z.morphTexture!==null||ve.envMap!==Se||O.fog===!0&&ve.fog!==he||ve.numClippingPlanes!==void 0&&(ve.numClippingPlanes!==Z.numPlanes||ve.numIntersection!==Z.numIntersection)||ve.vertexAlphas!==Be||ve.vertexTangents!==Ke||ve.morphTargets!==ye||ve.morphNormals!==je||ve.morphColors!==vt||ve.morphTargetsCount!==Vt||ve.numLightProbeGrids!==Ec(w.state.lightProbeGridArray)?it=!0:(ve.outputColorSpace!==le||ve.toneMapping!==ct)&&(Ni=!0):(it=!0,ve.__version=O.version);let Ht=ve.currentProgram;(it===!0||Ni===!0)&&(Ht=Ni===!0?_0(O,I,z,le,ct):er(O,I,z),F&&O.isNodeMaterial&&F.onUpdateProgram(O,Ht,ve));let aa=!1,xi=!1,Ui=!1,et=Ht.getUniforms(),zt=ve.uniforms;if(ue.useProgram(Ht.program)&&(aa=!0,xi=!0,Ui=!0),O.id!==X&&(X=O.id,xi=!0),aa||j!==v){ue.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),et.setValue(D,"projectionMatrix",v.projectionMatrix),et.setValue(D,"viewMatrix",v.matrixWorldInverse);let It=et.map.cameraPosition;It!==void 0&&It.setValue(D,Fn.setFromMatrixPosition(v.matrixWorld)),dt.logarithmicDepthBuffer&&et.setValue(D,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&et.setValue(D,"isOrthographic",v.isOrthographicCamera===!0),j!==v&&(j=v,xi=!0,Ui=!0)}if(ve.needsLights&&(Jt.state.sunShadowMap.length>0&&et.setValue(D,"sunShadowMap",Jt.state.sunShadowMap,Fe),Jt.state.directionalShadowMap.length>0&&et.setValue(D,"directionalShadowMap",Jt.state.directionalShadowMap,Fe),Jt.state.spotShadowMap.length>0&&et.setValue(D,"spotShadowMap",Jt.state.spotShadowMap,Fe),Jt.state.pointShadowMap.length>0&&et.setValue(D,"pointShadowMap",Jt.state.pointShadowMap,Fe)),z.isSkinnedMesh){et.setOptional(D,z,"bindMatrix"),et.setOptional(D,z,"bindMatrixInverse");let mt=z.skeleton;mt&&(mt.boneTexture===null&&mt.computeBoneTexture(),et.setValue(D,"boneTexture",mt.boneTexture,Fe))}z.isBatchedMesh&&(et.setOptional(D,z,"batchingTexture"),et.setValue(D,"batchingTexture",z._matricesTexture,Fe),et.setOptional(D,z,"batchingIdTexture"),et.setValue(D,"batchingIdTexture",z._indirectTexture,Fe),et.setOptional(D,z,"batchingColorTexture"),z._colorsTexture!==null&&et.setValue(D,"batchingColorTexture",z._colorsTexture,Fe));let An=G.morphAttributes;if((An.position!==void 0||An.normal!==void 0||An.color!==void 0)&&$.update(z,G,Ht),(xi||ve.receiveShadow!==z.receiveShadow)&&(ve.receiveShadow=z.receiveShadow,et.setValue(D,"receiveShadow",z.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&I.environment!==null&&(zt.envMapIntensity.value=I.environmentIntensity),zt.dfgLUT!==void 0&&(zt.dfgLUT.value=Wp()),xi){if(et.setValue(D,"toneMappingExposure",C.toneMappingExposure),ve.needsLights&&v0(zt,Ui),he&&O.fog===!0&&se.refreshFogUniforms(zt,he),se.refreshMaterialUniforms(zt,O,me,Ce,w.state.transmissionRenderTarget[v.id]),ve.needsLights&&ve.numLightProbeGrids>0){let mt=b,It=0;for(let Kn of w.state.lightProbeGridArray)Kn.texture!==null&&(mt.textures[It]=Kn.texture,mt.min[It]=Kn.boundingBox.min,mt.max[It]=Kn.boundingBox.max,mt.resolution[It]=Kn.resolution,It++);for(let Kn in mt)mt[Kn].length=It;zt.probesSH.value=mt.textures,zt.probesMin.value=mt.min,zt.probesMax.value=mt.max,zt.probesResolution.value=mt.resolution}Xs.upload(D,Cc(ve),zt,Fe)}if(O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(Xs.upload(D,Cc(ve),zt,Fe),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&et.setValue(D,"center",z.center),et.setValue(D,"modelViewMatrix",z.modelViewMatrix),et.setValue(D,"normalMatrix",z.normalMatrix),et.setValue(D,"modelMatrix",z.matrixWorld),O.uniformsGroups!==void 0){let mt=O.uniformsGroups;for(let It=0,Kn=mt.length;It<Kn;It++){let Ic=mt[It];be.update(Ic,Ht),be.bind(Ic,Ht)}}return Ht}function v0(v,I){v.ambientLightColor.needsUpdate=I,v.lightProbe.needsUpdate=I,v.sunLights.needsUpdate=I,v.sunLightShadows.needsUpdate=I,v.directionalLights.needsUpdate=I,v.directionalLightShadows.needsUpdate=I,v.pointLights.needsUpdate=I,v.pointLightShadows.needsUpdate=I,v.spotLights.needsUpdate=I,v.spotLightShadows.needsUpdate=I,v.rectAreaLights.needsUpdate=I,v.hemisphereLights.needsUpdate=I}function M0(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return te},this.setRenderTargetTextures=function(v,I,G){let O=Re.get(v);O.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),Re.get(v.texture).__webglTexture=I,Re.get(v.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:G,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,I){let G=Re.get(v);G.__webglFramebuffer=I,G.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(v,I=0,G=0){te=v,q=I,V=G;let O=null,z=!1,he=!1;if(v){let le=Re.get(v);if(le.__useDefaultFramebuffer!==void 0){ue.bindFramebuffer(D.FRAMEBUFFER,le.__webglFramebuffer),Q.copy(v.viewport),Me.copy(v.scissor),Oe=v.scissorTest,ue.viewport(Q),ue.scissor(Me),ue.setScissorTest(Oe),X=-1;return}else if(le.__webglFramebuffer===void 0)Fe.setupRenderTarget(v);else if(le.__hasExternalTextures)Fe.rebindTextures(v,Re.get(v.texture).__webglTexture,Re.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Be=v.depthTexture;if(le.__boundDepthTexture!==Be){if(Be!==null&&Re.has(Be)&&(v.width!==Be.image.width||v.height!==Be.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Fe.setupDepthRenderbuffer(v)}}let ge=v.texture;(ge.isData3DTexture||ge.isDataArrayTexture||ge.isCompressedArrayTexture)&&(he=!0);let Se=Re.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Se[I])?O=Se[I][G]:O=Se[I],z=!0):v.samples>0&&Fe.useMultisampledRTT(v)===!1?O=Re.get(v).__webglMultisampledFramebuffer:Array.isArray(Se)?O=Se[G]:O=Se,Q.copy(v.viewport),Me.copy(v.scissor),Oe=v.scissorTest}else Q.copy(Le).multiplyScalar(me).floor(),Me.copy(rt).multiplyScalar(me).floor(),Oe=ot;if(G!==0&&(O=k),ue.bindFramebuffer(D.FRAMEBUFFER,O)&&ue.drawBuffers(v,O),ue.viewport(Q),ue.scissor(Me),ue.setScissorTest(Oe),z){let le=Re.get(v.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+I,le.__webglTexture,G)}else if(he){let le=I;for(let ge=0;ge<v.textures.length;ge++){let Se=Re.get(v.textures[ge]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+ge,Se.__webglTexture,G,le)}}else if(v!==null&&G!==0){let le=Re.get(v.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,le.__webglTexture,G)}X=-1};function Pc(v){let I=Re.get(v);return(I.__readFormat!==v.format||I.__readType!==v.type)&&(I.__readFormat=v.format,I.__readType=v.type,I.__formatReadable=dt.textureFormatReadable(v.format),I.__typeReadable=dt.textureTypeReadable(v.type)),I}this.readRenderTargetPixels=function(v,I,G,O,z,he,xe,le=0){if(!(v&&v.isWebGLRenderTarget)){De("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ge=Re.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&xe!==void 0&&(ge=ge[xe],Array.isArray(ge)&&(ge=ge[0])),ge){ue.bindFramebuffer(D.FRAMEBUFFER,ge);try{let Se=v.textures[le],Be=Se.format,Ke=Se.type;v.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+le);let ye=Pc(Se);if(ye.__formatReadable===!1){De("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ye.__typeReadable===!1){De("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=v.width-O&&G>=0&&G<=v.height-z&&D.readPixels(I,G,O,z,ie.convert(Be),ie.convert(Ke),he)}finally{let Se=te!==null?Re.get(te).__webglFramebuffer:null;ue.bindFramebuffer(D.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(v,I,G,O,z,he,xe,le=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ge=Re.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&xe!==void 0&&(ge=ge[xe],Array.isArray(ge)&&(ge=ge[0])),ge)if(I>=0&&I<=v.width-O&&G>=0&&G<=v.height-z){ue.bindFramebuffer(D.FRAMEBUFFER,ge);let Se=v.textures[le],Be=Se.format,Ke=Se.type;v.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+le);let ye=Pc(Se);if(ye.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ye.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let je=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,je),D.bufferData(D.PIXEL_PACK_BUFFER,he.byteLength,D.STREAM_READ),D.readPixels(I,G,O,z,ie.convert(Be),ie.convert(Ke),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let vt=te!==null?Re.get(te).__webglFramebuffer:null;ue.bindFramebuffer(D.FRAMEBUFFER,vt);let ct=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await $h(D,ct,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,je),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,he),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(je),D.deleteSync(ct),he}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,I=null,G=0){let O=Math.pow(2,-G),z=Math.floor(v.image.width*O),he=Math.floor(v.image.height*O),xe=I!==null?I.x:0,le=I!==null?I.y:0;Fe.setTexture2D(v,0),D.copyTexSubImage2D(D.TEXTURE_2D,G,0,0,xe,le,z,he),ue.unbindTexture()},this.copyTextureToTexture=function(v,I,G=null,O=null,z=0,he=0){let xe,le,ge,Se,Be,Ke,ye,je,vt,ct=v.isCompressedTexture?v.mipmaps[he]:v.image;if(G!==null)xe=G.max.x-G.min.x,le=G.max.y-G.min.y,ge=G.isBox3?G.max.z-G.min.z:1,Se=G.min.x,Be=G.min.y,Ke=G.isBox3?G.min.z:0;else{let et=Math.pow(2,-z);xe=Math.floor(ct.width*et),le=Math.floor(ct.height*et),v.isDataArrayTexture?ge=ct.depth:v.isData3DTexture?ge=Math.floor(ct.depth*et):ge=1,Se=0,Be=0,Ke=0}O!==null?(ye=O.x,je=O.y,vt=O.z):(ye=0,je=0,vt=0);let lt=ie.convert(I.format),Vt=ie.convert(I.type),ve;I.isData3DTexture?(Fe.setTexture3D(I,0),ve=D.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(Fe.setTexture2DArray(I,0),ve=D.TEXTURE_2D_ARRAY):(Fe.setTexture2D(I,0),ve=D.TEXTURE_2D),ue.activeTexture(D.TEXTURE0),ue.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,I.flipY),ue.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),ue.pixelStorei(D.UNPACK_ALIGNMENT,I.unpackAlignment);let Jt=ue.getParameter(D.UNPACK_ROW_LENGTH),it=ue.getParameter(D.UNPACK_IMAGE_HEIGHT),Ni=ue.getParameter(D.UNPACK_SKIP_PIXELS),Ht=ue.getParameter(D.UNPACK_SKIP_ROWS),aa=ue.getParameter(D.UNPACK_SKIP_IMAGES);ue.pixelStorei(D.UNPACK_ROW_LENGTH,ct.width),ue.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ct.height),ue.pixelStorei(D.UNPACK_SKIP_PIXELS,Se),ue.pixelStorei(D.UNPACK_SKIP_ROWS,Be),ue.pixelStorei(D.UNPACK_SKIP_IMAGES,Ke);let xi=v.isDataArrayTexture||v.isData3DTexture,Ui=I.isDataArrayTexture||I.isData3DTexture;if(v.isDepthTexture){let et=Re.get(v),zt=Re.get(I),An=Re.get(et.__renderTarget),mt=Re.get(zt.__renderTarget);ue.bindFramebuffer(D.READ_FRAMEBUFFER,An.__webglFramebuffer),ue.bindFramebuffer(D.DRAW_FRAMEBUFFER,mt.__webglFramebuffer);for(let It=0;It<ge;It++)xi&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Re.get(v).__webglTexture,z,Ke+It),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Re.get(I).__webglTexture,he,vt+It)),D.blitFramebuffer(Se,Be,Se+xe,Be+le,ye,je,ye+xe,je+le,D.DEPTH_BUFFER_BIT,D.NEAREST);ue.bindFramebuffer(D.READ_FRAMEBUFFER,null),ue.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(z!==0||v.isRenderTargetTexture||Re.has(v)){let et=Re.get(v),zt=Re.get(I);ue.bindFramebuffer(D.READ_FRAMEBUFFER,P),ue.bindFramebuffer(D.DRAW_FRAMEBUFFER,H);for(let An=0;An<ge;An++)xi?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,et.__webglTexture,z,Ke+An):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,et.__webglTexture,z),Ui?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,zt.__webglTexture,he,vt+An):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,zt.__webglTexture,he),z!==0?D.blitFramebuffer(Se,Be,Se+xe,Be+le,ye,je,ye+xe,je+le,D.COLOR_BUFFER_BIT,D.NEAREST):Ui?D.copyTexSubImage3D(ve,he,ye,je,vt+An,Se,Be,xe,le):D.copyTexSubImage2D(ve,he,ye,je,Se,Be,xe,le);ue.bindFramebuffer(D.READ_FRAMEBUFFER,null),ue.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else Ui?v.isDataTexture||v.isData3DTexture?D.texSubImage3D(ve,he,ye,je,vt,xe,le,ge,lt,Vt,ct.data):I.isCompressedArrayTexture?D.compressedTexSubImage3D(ve,he,ye,je,vt,xe,le,ge,lt,ct.data):D.texSubImage3D(ve,he,ye,je,vt,xe,le,ge,lt,Vt,ct):v.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,he,ye,je,xe,le,lt,Vt,ct.data):v.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,he,ye,je,ct.width,ct.height,lt,ct.data):D.texSubImage2D(D.TEXTURE_2D,he,ye,je,xe,le,lt,Vt,ct);ue.pixelStorei(D.UNPACK_ROW_LENGTH,Jt),ue.pixelStorei(D.UNPACK_IMAGE_HEIGHT,it),ue.pixelStorei(D.UNPACK_SKIP_PIXELS,Ni),ue.pixelStorei(D.UNPACK_SKIP_ROWS,Ht),ue.pixelStorei(D.UNPACK_SKIP_IMAGES,aa),he===0&&I.generateMipmaps===!0&&I.mipmapsAutoUpdate===!0&&D.generateMipmap(ve),ue.unbindTexture()},this.initRenderTarget=function(v){Re.get(v).__webglFramebuffer===void 0&&Fe.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Fe.setTextureCube(v,0):v.isData3DTexture?Fe.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Fe.setTexture2DArray(v,0):Fe.setTexture2D(v,0),ue.unbindTexture()},this.resetState=function(){q=0,V=0,te=null,ue.reset(),re.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return _n}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}};var ll=class{constructor(){this.active=null}begin(e,t=!0){return!t||this.active!==null?!1:(this.active=e,!0)}owns(e){return this.active===e}end(e){return this.owns(e)?(this.active=null,!0):!1}cancel(){this.active=null}},Sn=i=>(i=Math.max(0,Math.min(1,i)),i*i*(3-2*i));function ul(i){let e=Math.max(0,Math.min(1,i)),t=1-Sn((e-.82)/.18);return{bend:Sn(e/.22)*t,pitch:.58*Sn((e-.22)/.22)*t}}function Zs(i,e,t,n,s=n*.58){if(e<-400||n<=1e-6&&s<=1e-6)return{x:i,y:e,z:t};let r=1.22*n,a=i/300*r,o=r>1e-6?300/r:0,l=r>1e-6?Math.sin(a)*o:i,c=r>1e-6?2*Math.sin(a/2)**2*o:0,h=e+400;return{x:l,y:-400+h*Math.cos(s)-c*Math.sin(s),z:t+110*n+h*Math.sin(s)+c*Math.cos(s)}}function Bu(i,e,t,n,s=n*.58){let r=i/300*1.22*n;return{x:e*Math.cos(r),y:-t*Math.cos(s)-e*Math.sin(r)*Math.sin(s),z:-t*Math.sin(s)+e*Math.sin(r)*Math.cos(s)}}var cl=class{constructor(){this.reset()}reset(){this.phase="peel",this.elapsed=0,this.advance=!1,this.pendingNext=!1,this.serial=0,this.rollDuration=2.8,this.drainDoneAt=null}setRollDuration(e){Number.isFinite(e)&&e>0&&(this.rollDuration=e)}get busy(){return["rolling","pour","shake"].includes(this.phase)}roll(){return this.phase!=="peel"?!1:(this.phase="rolling",this.elapsed=0,this.serial++,!0)}pour(){return["brush","peel"].includes(this.phase)?(this.phase="pour",this.elapsed=0,this.serial++,!0):!1}shake(e=!1){return this.phase!=="brush"?!1:(this.phase="shake",this.elapsed=0,this.advance=e,this.drainDoneAt=null,this.serial++,!0)}tick(e,{drainComplete:t=!0}={}){if(!this.busy)return null;if(this.elapsed+=e,this.phase==="rolling"&&this.elapsed>=this.rollDuration)return this.phase="pour",this.elapsed=0,"rolled";if(this.phase==="pour"&&this.elapsed>=1.65)return this.phase="brush",this.elapsed=0,"poured";if(this.phase==="shake"&&(this.elapsed>=3.9&&t&&this.drainDoneAt===null&&(this.drainDoneAt=Math.max(3.9,this.elapsed-e)),this.drainDoneAt!==null&&this.elapsed-this.drainDoneAt>=1)){this.phase="brush",this.elapsed=0;let n=this.advance;return this.advance=!1,n?"advance":"shaken"}return null}get progress(){return this.phase==="shake"?this.drainDoneAt===null?Math.min(.8,this.elapsed/4.875):Math.min(1,.8+.2*(this.elapsed-this.drainDoneAt)):Math.max(0,Math.min(1,this.elapsed/(this.phase==="rolling"?this.rollDuration:1.65)))}},hl=class{constructor(e=60){this.limit=e,this.deadline=null}setLimit(e){e!==this.limit&&(this.limit=e,this.deadline=null)}shouldRender(e){let t=1e3/this.limit;return this.deadline===null&&(this.deadline=e),e+.6<this.deadline?!1:(e-this.deadline>t*2&&(this.deadline=e),this.deadline+=t,!0)}};function zu(i,e,t=18){for(i.push(e);i.length>t;){let n=i.shift();i[0].from=n.from,(n.seconds!==void 0||i[0].seconds!==void 0)&&(i[0].seconds=(n.seconds||0)+(i[0].seconds||0))}}var nc=.24;function ku(i){return i.reduce((e,t)=>e+t.duration,0)+Math.max(0,i.length-1)*nc}function Gu(i,e){let t=0;for(let n=0;n<i.length;n++){let s=t+i[n].duration;if(e<=s||n===i.length-1)return{index:n,progress:Math.max(0,Math.min(1,(e-t)/i[n].duration)),count:i.length};if(e<s+nc)return{index:n,progress:1,count:i.length};t=s+nc}return{index:0,progress:0,count:0}}function Vu(i,e){return-2+Sn((e-.2)/.65)*(i.length+78)}function ic(i,e,t,n){let{grip:s,axis:r}=i,a=(e-s.x)*r.x+(t-s.y)*r.y,o=(e-s.x)*-r.y+(t-s.y)*r.x,l=Vu(i,n),c=Math.max(0,l-a);if(c<=0)return{x:e-300,y:400-t,z:4.5};let h=16+Math.min(8,c*.009),f=c/h,d=l-h*Math.sin(f),u=Sn((n-.85)/.15),x=s.x+r.x*d-r.y*o+u*390,_=s.y+r.y*d+r.x*o-u*70;return{x:x-300,y:400-_,z:4.5+h*(1-Math.cos(f))+Math.min(55,c*.32)*Sn((n-.2)/.65)+u*150}}function Hu(i,e){let t=i.bounds,n=Vu(i,e),s=o=>(o.x-i.grip.x)*i.axis.x+(o.y-i.grip.y)*i.axis.y-n,r=[{x:t.x,y:t.y},{x:t.x+t.w,y:t.y},{x:t.x+t.w,y:t.y+t.h},{x:t.x,y:t.y+t.h}],a=[];for(let o=0;o<r.length;o++){let l=r[o],c=r[(o+1)%r.length],h=s(l),f=s(c);if(h<=0&&a.push(l),h<0!=f<0){let d=h/(h-f);a.push({x:l.x+(c.x-l.x)*d,y:l.y+(c.y-l.y)*d})}}return a}var Qt={halfWidth:112,halfDepth:88,centerY:-520,bottom:5,rim:63};function Wu(i,e,t){let n=Math.max(1,Math.ceil(e/.016)),s=e/n;for(let r=0;r<n;r++){let a={x:i.x,y:i.y,z:i.z};i.vz-=980*s,i.x+=i.vx*s,i.y+=i.vy*s,i.z+=i.vz*s;let o=Math.abs(i.x)<=t.halfWidth,l=Math.abs(i.y-t.centerY)<=t.halfDepth;if(o&&l&&i.vz<0&&a.z>=t.bottom&&i.z<=t.bottom)return i.z=t.bottom,!0;i.z<t.rim&&i.z>t.bottom&&(l&&Math.abs(a.x)<t.halfWidth&&Math.abs(i.x)>t.halfWidth&&(i.x=Math.sign(i.x)*(t.halfWidth-1),i.vx*=-.2),o&&Math.abs(a.y-t.centerY)<t.halfDepth&&Math.abs(i.y-t.centerY)>t.halfDepth&&(i.y=t.centerY+Math.sign(i.y-t.centerY)*(t.halfDepth-1),i.vy*=-.2))}return!1}var dl=class extends Wi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Tt;e.deleteAttribute("uv");let t=new gt({side:kt}),n=new gt,s=new Dr(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Ne(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new Yi(e,n,6),o=new xt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new Ne(e,Js(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Ne(e,Js(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Ne(e,Js(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let f=new Ne(e,Js(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);let d=new Ne(e,Js(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let u=new Ne(e,Js(100));u.position.set(0,20,0),u.scale.set(1,.1,1),this.add(u)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Js(i){return new Cr({color:0,emissive:16777215,emissiveIntensity:i})}var fl=Math.PI*2,qp={...Qt,halfWidth:-1};function $r(i,e=256){let t=document.createElement("canvas");t.width=t.height=e,i(t.getContext("2d"),e);let n=new Ti(t);return n.colorSpace=Nt,n}function Yp(){return $r((i,e)=>{i.fillStyle="#b9bcba",i.fillRect(0,0,e,e);for(let t=0;t<55e3;t++){let n=150+Math.random()*85;i.fillStyle=`rgba(${n},${n+1},${n+3},.16)`,i.fillRect(Math.random()*e,Math.random()*e,.5+Math.random()*2,1)}},512)}function Zp(){let i=new Ft,e=[],t=5;for(let n=0;n<t;n++){let s=n/t*fl,r=(n+1)/t*fl;e.push(0,0,.12,Math.cos(s),Math.sin(s),0,Math.cos(r),Math.sin(r),0)}return i.setAttribute("position",new tt(e,3)),i.computeVertexNormals(),i}var pl=class{constructor(e,t,n,s){this.settings=s,this.baseDpr=Math.min(devicePixelRatio||1,matchMedia("(pointer: coarse)").matches?1.4:2),this.canvas=e,this.colors=n,this.activeColor=0,this.time=0,this.renderTick=0,this.mouse=new Ee,this.ray=new Ur,this.hit=new U,this.renderer=new rl({canvas:e,antialias:!matchMedia("(pointer: coarse)").matches,alpha:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(this.baseDpr*s.renderScale),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=Ji,this.renderer.outputColorSpace=Nt,this.renderer.toneMapping=Or,this.renderer.toneMappingExposure=.95,this.scene=new Wi,this.scene.background=new Ie("#c9ccca"),this.camera=new qt(35,1,1,5e3);let r=new qs(this.renderer),a=new dl;this.scene.environment=r.fromScene(a,.04).texture,a.dispose(),r.dispose(),this.scene.environmentIntensity=.55,this.scene.add(new Pr("#fff7dd","#505668",1.5)),this.key=new zs("#fff6e4",2.8),this.key.position.set(-300,340,750),this.key.castShadow=!0,this.key.shadow.mapSize.set(1536,1536),Object.assign(this.key.shadow.camera,{left:-600,right:600,top:700,bottom:-650,near:1,far:1800}),this.key.shadow.bias=-8e-5,this.key.shadow.normalBias=.15,this.key.shadow.radius=3,this.scene.add(this.key),this.fill=new zs("#b9d4ff",.8),this.fill.position.set(500,-200,400),this.scene.add(this.fill);let o=Yp();o.wrapS=o.wrapT=Hi,o.repeat.set(4,4);let l=new Ne(new vn(2400,2400),new gt({map:o,bumpMap:o,bumpScale:.8,roughness:.94,color:"#d9ddda"}));l.position.z=-8,l.receiveShadow=!0,this.scene.add(l),this.paperGroup=new Yt,this.paperGroup.rotation.z=.018,this.scene.add(this.paperGroup);let c=new Ne(new Tt(Ge,qe,3.2,30,40,1),new gt({color:"#d6c68b",roughness:.85}));c.castShadow=!0,c.receiveShadow=!0,this.paperGroup.add(c),this.edge=c,this.edgeBase=c.geometry.attributes.position.array.slice(),this.paperTexture=new Ti(t),this.paperTexture.colorSpace=Nt,this.paperTexture.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());let h=new vn(Ge,qe,30,40),f=h.attributes.position;for(let u=0;u<f.count;u++){let x=f.getX(u),_=f.getY(u),m=Math.max(Math.abs(x)/300,Math.abs(_)/400);f.setZ(u,2.8+Math.pow(m,14)*1.5+Math.sin(x*.013+_*.006)*.12)}h.computeVertexNormals(),this.paper=new Ne(h,new qi({map:this.paperTexture,color:"#ffffff",toneMapped:!1})),this.paper.receiveShadow=!0,this.paperGroup.add(this.paper),this.paperBase=f.array.slice(),this.bend=0,this.pitch=0,this.coatUniforms={uTime:{value:0},uSparkle:{value:s.sparkles?1:0},uCoat:{value:null}},this.paper.material.onBeforeCompile=u=>{Object.assign(u.uniforms,this.coatUniforms),u.fragmentShader=`uniform float uTime; uniform float uSparkle; uniform sampler2D uCoat;
`+u.fragmentShader,u.fragmentShader=u.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
    vec2 cell=floor(vMapUv*vec2(600.0,800.0));
    float rnd=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
    float flicker=pow(max(0.0,sin(uTime*1.4+rnd*197.0)),32.0);
    float coat=texture2D(uCoat,vMapUv).a;
    gl_FragColor.rgb+=coat*uSparkle*step(.986,rnd)*flicker*.65;`)},this.shaders=[],this.sparkLight=new U(-.35,.45,1),this.grainMaterial=new gt({color:"#ffffff",metalness:.95,roughness:.43,envMapIntensity:.5,side:nn}),this.grainMaterial.onBeforeCompile=u=>{u.uniforms.uSparkLight={value:this.sparkLight},u.uniforms.uSparkEnabled={value:this.settings.sparkles?1:0},u.vertexShader=`attribute float flakeSeed; varying float vFlakeSeed;
`+u.vertexShader,u.vertexShader=u.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vFlakeSeed=flakeSeed;`),u.fragmentShader=`uniform float uSparkEnabled; uniform vec3 uSparkLight; varying float vFlakeSeed;
`+u.fragmentShader,u.fragmentShader=u.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
    // Preserve pigment under the strong studio lamps; only highlights bleach.
    vec3 pigment=linearToOutputTexel(vec4(diffuseColor.rgb,1.0)).rgb;
    gl_FragColor.rgb=mix(pigment,gl_FragColor.rgb,.28);
    vec3 halfLight=normalize(uSparkLight+normalize(vViewPosition));
    float glint=pow(max(dot(normal,halfLight),0.0),140.0);
    gl_FragColor.rgb+=uSparkEnabled*step(.975,vFlakeSeed)*glint*1.8*vec3(1.0,0.95,0.82);`),this.shaders.push(u)},this.current=this.makeGrains(3e4),this.savedCount=0,this.currentInitialized=0,this.spill=this.makeGrains(3e4),this.paperGroup.remove(this.spill),this.scene.add(this.spill),this.spill.material=this.grainMaterial.clone(),this.spill.material.depthTest=!1,this.spill.material.depthWrite=!1,this.spill.renderOrder=20,this.spills=[],this.spillObject=new xt,this.coatMask=new Ti(document.createElement("canvas")),this.coatUniforms.uCoat.value=this.coatMask,this.heapTexture=$r((u,x)=>{u.fillStyle="#898989",u.fillRect(0,0,x,x);for(let _=0;_<18e3;_++){let m=Math.random()*255|0;u.fillStyle=`rgb(${m},${m},${m})`,u.fillRect(Math.random()*x,Math.random()*x,1,1)}},128),this.heapTexture.wrapS=this.heapTexture.wrapT=Hi,this.heapTexture.repeat.set(11,15),this.heapGeo=new vn(Ge,qe,Ze/2,Mt/2),this.heapGeo.setAttribute("heapAmount",new tt(new Float32Array(this.heapGeo.attributes.position.count),1)),this.heapMat=new gt({color:n[0],roughness:.65,metalness:.9,bumpMap:this.heapTexture,bumpScale:.7,envMapIntensity:.8});let d=u=>{u.vertexShader=`attribute float heapAmount; varying float vHeap;
`+u.vertexShader,u.vertexShader=u.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vHeap=heapAmount;`),u.fragmentShader=`varying float vHeap;
`+u.fragmentShader,u.fragmentShader=u.fragmentShader.replace("void main() {",`void main() {
if(vHeap<2.2) discard;`),u.fragmentShader=u.fragmentShader.replace("#include <dithering_fragment>",`#include <dithering_fragment>
gl_FragColor.rgb=mix(linearToOutputTexel(vec4(diffuseColor.rgb,1.0)).rgb,gl_FragColor.rgb,.3);`)};this.heapMat.onBeforeCompile=d,this.heap=new Ne(this.heapGeo,this.heapMat),this.heap.frustumCulled=!1,this.heap.receiveShadow=!0,this.heap.castShadow=!0,this.heap.customDepthMaterial=new Os({depthPacking:U1}),this.heap.customDepthMaterial.onBeforeCompile=d,this.paperGroup.add(this.heap),this.peelGeo=new vn(Ge,qe,24,160),this.peelSheet=new Ne(this.peelGeo,new gt({color:"#fff2b2",roughness:.8,transparent:!0,alphaTest:.08,side:nn})),this.peelSheet.frustumCulled=!1,this.peelSheet.castShadow=!0,this.peelSheet.visible=!1,this.paperGroup.add(this.peelSheet),this.makeBrush(),this.makeTweezers(),this.makeGlints(),this.makeJars(),this.makeCollector(),this.makeHands(),this.hint=this.makeHint(),this.paperGroup.add(this.hint),this.desiredBrush={x:130,y:250,angle:-.72,contact:!1,visible:!1},this.brushPoint={x:130,y:250},this.pourPoint={x:140,y:180},this.autoPour=!1,this.applySettings(s),this.observer=new ResizeObserver(()=>this.resize()),this.observer.observe(e),this.resize()}makeGrains(e){let t=Zp(),n=new Float32Array(e);for(let r=0;r<e;r++)n[r]=r*16807%2147483647/2147483647;t.setAttribute("flakeSeed",new bi(n,1));let s=new Yi(t,this.grainMaterial,e);return s.instanceMatrix.setUsage(k1),s.instanceColor=new bi(new Float32Array(e*3),3),s.frustumCulled=!1,s.count=0,this.paperGroup.add(s),s}makeBrush(){this.brush=new Yt,this.brush.visible=!1,this.paperGroup.add(this.brush),this.brushVariants={},this.brushAngle=.65;let e=new gt({color:"#263538",roughness:.33,metalness:.12}),t=new gt({color:"#bfc4be",metalness:.85,roughness:.25});for(let[n,s]of Object.entries(oa)){let r=new Yt;this.brush.add(r);let a=s.width,o=new Ne(new li(5.5,8,155,16),e);o.position.set(0,-127,19),o.rotation.x=.075,o.castShadow=!0,r.add(o);let l=new Ne(new Zi(5.5,10,6),e);l.position.set(0,-204,13),r.add(l);let c=new Ne(new Tt(a*.69,32,11),t);c.position.set(0,-34,14),r.add(c);for(let p of[-47,-21]){let M=new Ne(new Tt(a*.71,1.5,11.5),t);M.position.set(0,p,14),r.add(M)}let h=new li(a*.5,a*.34,s.depth,n==="round"?24:32,1);h.scale(1,1,n==="round"?.62:.24);let f=new gt({color:"#b58b55",roughness:.94}),d=new Ne(h,f);d.position.set(0,-2,8),d.castShadow=!0,r.add(d);let u=[],x=[];for(let p=0;p<100;p++){let M=p*16807%997/997,E=(M-.5)*a,b=3+p*37%101/101*8;u.push(E*.68,-17,b+3,E,s.depth*.5-Math.abs(E)/a*6,b*.55),x.push(M)}let _=new Ft;_.setAttribute("position",new tt(u,3));let m=new Mr(_,new Us({color:"#ead5b3",transparent:!0,opacity:.72}));r.add(m),this.brushVariants[n]={group:r,tuft:d,strands:m,mat:f,base:Float32Array.from(u),dim:s}}this.tuftMat=this.brushVariants.flat.mat}makeJars(){this.jars=[];let e=new Ne(new Tt(470,65,8),new gt({color:"#46524f",metalness:.32,roughness:.4}));e.position.set(0,460,-2),e.castShadow=!0,this.scene.add(e);let t=$r((a,o)=>{a.fillStyle="#f5f5f5",a.fillRect(0,0,o,o);for(let l=0;l<6500;l++)a.fillStyle=l%17===0?"#ffffff":"#9c9c9c",a.fillRect(l*47%997/997*o,l*113%991/991*o,.8,.8)},128),n={glass:{points:[[18,0],[22,5],[24,45],[24,59]],mouth:59,radius:24,fill:38},slim:{points:[[14,0],[17,4],[18,55],[16,67]],mouth:67,radius:16,fill:45},bowl:{points:[[16,0],[27,7],[31,23],[31,43]],mouth:43,radius:31,fill:26}},s=new Fs({color:"#d9efeb",transparent:!0,opacity:.22,roughness:.12,metalness:0,clearcoat:1,side:nn,depthWrite:!1}),r=new gt({color:"#e3e9e1",roughness:.2,metalness:.65});for(let a=0;a<6;a++){let o=new Yt;o.position.set((a-2.5)*72,460,4),o.rotation.x=Math.PI/2,this.scene.add(o),o.userData.variants={};for(let[l,c]of Object.entries(n)){let h=new Yt;o.add(h);let f=new Ne(new Ar(c.points.map(([m,p])=>new Ee(m,p)),24),s);h.add(f);let d=new Ne(new li(c.points[0][0],c.points[0][0],3,24),s);d.position.y=1,h.add(d);let u=new Ne(new li(c.radius-3,c.points[0][0]-2,c.fill,24),new qi({color:this.colors[a%this.colors.length],map:t,toneMapped:!1}));u.position.y=4+c.fill/2,h.add(u);let x=new Ne(new Er(c.radius,1.25,6,24),r);x.rotation.x=Math.PI/2,x.position.y=c.mouth,h.add(x);let _=new Ne(new li(c.radius+.2,c.radius+.2,5,24,1,!0),r);_.position.y=c.mouth-4,h.add(_),o.userData.variants[l]={group:h,fill:u,profile:c}}o.userData.home=o.position.clone(),o.userData.homeRotation=o.quaternion.clone(),this.jars.push(o)}}makeTweezers(){this.tweezers=new Yt,this.paperGroup.add(this.tweezers),this.tweezers.visible=!1;let e=new gt({color:"#b8c0c1",roughness:.2,metalness:.95});for(let t of[-1,1]){let n=new Ne(new Tt(4,130,4),e);n.position.set(t*5,-60,25),n.rotation.z=t*.075,n.rotation.x=.16,n.castShadow=!0,this.tweezers.add(n)}}makeCollector(){this.boxGroup=new Yt,this.boxGroup.position.set(0,Qt.centerY,0),this.boxGroup.visible=!1,this.scene.add(this.boxGroup),this.boxMotion=0,this.collectorBox={...Qt},this.collectedCount=0,this.trayBins=new Uint16Array(616);let e=new gt({color:"#c6cdbf",roughness:.42,metalness:.25}),t=new gt({color:"#343e35",roughness:.8}),n=new Ne(new Tt(240,192,8),e);n.castShadow=!0,this.boxGroup.add(n);let s=new Ne(new vn(224,176),t);s.position.z=4.1,this.boxGroup.add(s);for(let o of[-1,1]){let l=new Ne(new Tt(8,192,63),e);l.position.set(o*116,0,31.5),l.castShadow=!0,this.boxGroup.add(l)}let r=new Ne(new Tt(224,8,63),e);r.position.set(0,92,31.5),this.boxGroup.add(r);let a=new Ne(new Tt(224,5,51),new Fs({color:"#e5ebdf",transparent:!0,opacity:.38,roughness:.2,metalness:.1,depthWrite:!1}));a.position.set(0,-92,25.5),this.boxGroup.add(a);for(let o of[-96,96])for(let l of[-70,70]){let c=new Ne(new Tt(18,18,4),t);c.position.set(o,l,-6),this.boxGroup.add(c)}this.collected=this.makeGrains(3e4),this.paperGroup.remove(this.collected),this.boxGroup.add(this.collected)}makeHands(){this.hands=[];let e=new gt({color:"#d9ac8e",roughness:.85}),t=new gt({color:"#f0cec0",roughness:.42});for(let n of[-1,1]){let s=new Yt;s.visible=!1,this.scene.add(s);let r=new Ne(new Zi(29,16,10),e);r.scale.set(1.1,1.2,.58),r.position.set(n*34,-15,-4),s.add(r);for(let[o,l,c,h]of[[8,12,10,31],[-4,-5,8,37]]){let f=new Ne(new Tr(c,h,4,10),e);f.rotation.z=Math.PI/2,f.position.set(n*13,o,l),f.castShadow=!0,s.add(f)}let a=new Ne(new Zi(8,12,8),t);a.scale.set(1.05,.65,.18),a.position.set(n*-3,8,21),s.add(a),this.hands.push(s)}}makeGlints(){let e=$r((t,n)=>{let s=t.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);s.addColorStop(0,"#fffef5ff"),s.addColorStop(.08,"#fff3cbaa"),s.addColorStop(.4,"#ffe9b922"),s.addColorStop(1,"#ffffff00"),t.fillStyle=s,t.fillRect(0,0,n,n),t.strokeStyle="#fff9e9cc",t.lineWidth=1;for(let r=0;r<4;r++){let a=r*Math.PI/2;t.beginPath(),t.moveTo(n/2,n/2),t.lineTo(n/2+Math.cos(a)*n*.32,n/2+Math.sin(a)*n*.32),t.stroke()}},64);this.glints=[];for(let t=0;t<28;t++){let n=new Ds(new Xi({map:e,transparent:!0,blending:Fr,depthWrite:!1,toneMapped:!1}));n.visible=!1,this.paperGroup.add(n),this.glints.push(n)}}makeHint(){let e=$r((n,s)=>{n.strokeStyle="#ffffee",n.lineWidth=5,n.beginPath(),n.arc(s/2,s/2,48,0,fl),n.stroke(),n.fillStyle="#fffef0",n.beginPath(),n.arc(s/2,s/2,7,0,fl),n.fill()},256),t=new Ds(new Xi({map:e,transparent:!0,depthTest:!1}));return t.scale.set(90,90,1),t}applySettings(e){let t=this.settings;this.settings={...e};let n=Math.max(.5,Math.min(2.75,this.baseDpr*e.renderScale));this.renderer.setPixelRatio(n);let s={off:0,low:512,medium:1024,high:1536}[e.shadow];this.renderer.shadowMap.enabled=s>0,this.key.castShadow=s>0,s&&this.key.shadow.mapSize.x!==s&&(this.key.shadow.map?.dispose(),this.key.shadow.map=null,this.key.shadow.mapSize.set(s,s)),this.key.shadow.needsUpdate=!0,this.scene.environmentIntensity=e.reflections?.55:0,this.grainMaterial.envMapIntensity=e.reflections?.5:0,this.grainMaterial.metalness=e.reflections?.95:.85,this.grainMaterial.roughness=e.sparkles?.43:.6,this.heapMat.envMapIntensity=e.reflections?.25:0,this.coatUniforms.uSparkle.value=e.sparkles?1:0;for(let r of this.shaders)r.uniforms.uSparkEnabled.value=e.sparkles?1:0;t?.shadow!==e.shadow&&this.scene.traverse(r=>{if(r.material)for(let a of Array.isArray(r.material)?r.material:[r.material])a.needsUpdate=!0});for(let r of this.glints)e.sparkles||(r.visible=!1);for(let r of this.jars){for(let[o,l]of Object.entries(r.userData.variants))l.group.visible=o===e.jarShape;let a=r.userData.variants[e.jarShape]||r.userData.variants.glass;r.userData.fill=a.fill,r.userData.profile=a.profile}for(let[r,a]of Object.entries(this.brushVariants))a.group.visible=r===e.brushShape;this.brush.scale.setScalar(e.brushWidth),this.resize()}resize(){let e=this.canvas.clientWidth,t=this.canvas.clientHeight;if(!e||!t)return;this.renderer.setSize(e,t,!1),this.camera.aspect=e/t;let n=Math.tan(35*Math.PI/360),s=Math.max(1180/(2*n),650/(2*n*this.camera.aspect));this.camera.position.set(0,-s*.18,s),this.camera.lookAt(0,-35,20),this.camera.updateProjectionMatrix()}metrics(){let e=this.renderer.info;return{width:this.canvas.width,height:this.canvas.height,draws:e.render.calls,triangles:e.render.triangles,visible:this.current.count+this.spill.count+(this.boxGroup.visible?this.collected.count:0)}}posePour(e){let t=this.jars[this.activeColor%6];if(!t)return;if(!e){t.position.copy(t.userData.home),t.quaternion.copy(t.userData.homeRotation),t.userData.fill.scale.y=1,t.userData.fill.position.y=4+t.userData.profile.fill/2;return}let n=e.elapsed,s=Sn(Math.min(1,n/.34)),r=Sn(Math.max(0,(n-1.32)/.33)),a=s*(1-r);this.paperGroup.updateMatrixWorld(!0);let o=t.userData.profile,l=new cn().setFromEuler(new un(Math.PI+.3,0,this.paperGroup.rotation.z)),c=new U(0,o.mouth,o.radius*.5).applyQuaternion(l),h=this.paperGroup.localToWorld(new U(e.x-300,400-e.y,142)).sub(c);t.position.copy(t.userData.home).lerp(h,a),t.quaternion.copy(t.userData.homeRotation).slerp(l,a);let f=1-Math.min(1,Math.max(0,(n-.48)/.82))*.88;t.userData.fill.scale.y=1+(f-1)*a,t.userData.fill.position.y=4+o.fill/2*t.userData.fill.scale.y,t.updateMatrixWorld(!0)}pourOrigin(){let e=this.jars[this.activeColor%6],t=e.localToWorld(new U(0,e.userData.profile.mouth,e.userData.profile.radius*.5));return this.paperGroup.worldToLocal(t),{x:t.x+300,y:400-t.y,z:t.z-3}}mapPointer(e){let t=this.canvas.getBoundingClientRect();this.mouse.set((e.clientX-t.left)/t.width*2-1,-(e.clientY-t.top)/t.height*2+1),this.ray.setFromCamera(this.mouse,this.camera);let n=new ln(new U(0,0,1),-3);return this.ray.ray.intersectPlane(n,this.hit)?(this.paperGroup.worldToLocal(this.hit),{x:this.hit.x+300,y:400-this.hit.y}):{x:300,y:400}}setStage(e){this.updateBend(0),this.heapGeo.attributes.heapAmount.array.fill(0),this.current.visible=!0,this.activeColor=e,this.current.count=0,this.currentInitialized=0,this.heapMat.color.set(this.colors[e]);for(let t of Object.values(this.brushVariants))t.mat.color.set("#b58b55");this.heap.visible=!0,this.hint.visible=!0;for(let t of Object.values(this.jars[e%6].userData.variants))t.fill.material.color.set(this.colors[e])}initInstance(e,t,n,s){let r=new nt,a=new cn().setFromEuler(new un((n*17%1-.5)*1.3,(n*31%1-.5)*1.3,n*79)),o=1.15+n*197%1*.9;r.compose(new U(0,0,-1e3),a,new U(o,o,o)),e.instanceMatrix.array.set(r.elements,t*16);let l=new Ie(s),c=.6+n*47%1*.7;l.multiplyScalar(c),n*127%1>.965&&l.lerp(new Ie("#c2c8da"),.65),e.instanceColor.array.set([l.r,l.g,l.b],t*3)}updateGrains(e){let t=this.current.instanceMatrix.array,n=this.current.instanceColor.array,s=this.current.geometry.attributes.flakeSeed,r=new Ie(this.colors[this.activeColor]),a=0;for(let o=0;o<e.count;o++){if(e.state[o]===On||e.state[o]===En)continue;let l=a*16,c=e.seed[o],h=c*79,f=Math.cos(h),d=Math.sin(h),u=(1.35+c*197%1*.9)*(this.settings?.grainSize||1),x=e.x[o]-300,_=400-e.y[o],m=3+(e.state[o]===Bn?Math.min(Ol,e.z[o]):e.z[o]);if(this.bend||this.pitch){let M=Zs(x,_,m,this.bend,this.pitch);x=M.x,_=M.y,m=M.z}t[l]=f*u,t[l+1]=d*u,t[l+2]=(c*17%1-.5)*(e.pressed[o]?.3:1.2)*u,t[l+3]=0,t[l+4]=-d*u,t[l+5]=f*u,t[l+6]=(c*31%1-.5)*(e.pressed[o]?.3:1.2)*u,t[l+7]=0,t[l+8]=0,t[l+9]=0,t[l+10]=u,t[l+11]=0,t[l+12]=x,t[l+13]=_,t[l+14]=m,t[l+15]=1;let p=.7+c*47%1*.5;n[a*3]=r.r*p,n[a*3+1]=r.g*p,n[a*3+2]=r.b*p,s.setX(a,c),a++}this.current.count=a,this.current.instanceMatrix.needsUpdate=!0,this.current.instanceColor.needsUpdate=!0,s.needsUpdate=!0}updateHeap(e,t=1/60){let n=this.heapGeo.attributes.position,s=Ze/2,r=Mt/2;for(let a=0;a<=r;a++)for(let o=0;o<=s;o++){let l=Math.min(o*2,Ze-1),c=Math.min(a*2,Mt-1),h=c*Ze+l,f=Math.min(Oi,(e.moundHeight[h]+e.moundHeight[c*Ze+Math.max(l-1,0)]+e.moundHeight[Math.max(c-1,0)*Ze+l]+e.moundHeight[Math.max(c-1,0)*Ze+Math.max(l-1,0)])*.25),d=a*(s+1)+o,u=this.heapGeo.attributes.heapAmount.getX(d),x=f>0?u+(f*.8-u)*Math.min(1,t*30):0;this.heapGeo.attributes.heapAmount.setX(d,x);let _=Zs(o/s*Ge-300,400-a/r*qe,3+x,this.bend,this.pitch);n.setXYZ(d,_.x,_.y,_.z)}n.needsUpdate=!0,this.heapGeo.attributes.heapAmount.needsUpdate=!0,this.renderTick++%4===0&&this.heapGeo.computeVertexNormals()}updateBend(e,t=e*.58){if(e<=1e-6&&(e=0),t<=1e-6&&(t=0),!(e===this.bend&&t===(this.pitch||0))){this.bend=e,this.pitch=t;for(let[n,s]of[[this.paper,this.paperBase],[this.edge,this.edgeBase]]){let r=n.geometry.attributes.position;for(let a=0;a<r.count;a++){let o=Zs(s[a*3],s[a*3+1],s[a*3+2],e,t);r.setXYZ(a,o.x,o.y,o.z)}r.needsUpdate=!0,n.geometry.computeVertexNormals()}}}setCoatMask(e){this.coatMask.image=e,this.coatMask.needsUpdate=!0}preserve(e){this.collectSpill(e)}collectSpill(e,t=!1){this.paperGroup.updateMatrixWorld(!0);let n=new Ie(this.colors[this.activeColor]);for(let s=0;s<e.count;s++)if(e.state[s]!==On&&e.state[s]!==En&&this.spills.length<3e4){if(t&&(e.state[s]!==Bn||e.cell(e.x[s],e.y[s])>=0))continue;let r=Zs(e.x[s]-300,400-(this.draining?Math.min(800,e.y[s]):e.y[s]),3+(e.state[s]===Bn?Math.min(Ol,e.z[s]):e.z[s]),this.bend,this.pitch),a=this.paperGroup.localToWorld(new U(r.x,r.y,r.z)),o=this.draining?Bu(e.x[s]-300,e.vx[s],Math.max(180,e.vy[s]),this.bend,this.pitch):{x:e.vx[s],y:-e.vy[s],z:Math.min(-15,e.vz[s])},l=new U(o.x,o.y,o.z).applyQuaternion(this.paperGroup.quaternion);this.spills.push({x:a.x,y:a.y,z:a.z,vx:l.x,vy:l.y,vz:l.z,seed:e.seed[s],color:n}),e.state[s]=En,e.lost++}}beginCleanup(){this.draining=!0,this.collectedCount=0,this.collected.count=0,this.trayBins.fill(0)}updateCollector(e,t){this.draining=e==="shake",this.boxMotion=Math.max(0,Math.min(1,this.boxMotion+(this.draining?1:-1)*t*2.8)),this.boxGroup.visible=this.boxMotion>0,this.boxGroup.position.y=Qt.centerY-(1-Sn(this.boxMotion))*360,this.collectorBox={...Qt,centerY:this.boxGroup.position.y};for(let n=0;n<2;n++){let s=this.hands[n];s.visible=this.draining;let r=n?300:-300,a=Zs(r,0,5,this.bend,this.pitch);s.position.set(a.x+(n?8:-8),a.y,a.z),s.rotation.y=(n?-1:1)*this.bend*.7}}catchGrain(e){if(this.collectedCount>=3e4)return;let t=Math.max(0,Math.min(27,Math.floor((e.x+Qt.halfWidth)/(Qt.halfWidth*2)*28))),n=Math.max(0,Math.min(21,Math.floor((e.y-this.collectorBox.centerY+Qt.halfDepth)/(Qt.halfDepth*2)*22))),s=n*28+t,r=this.trayBins[s]*.32;for(let f=-3;f<=3;f++)for(let d=-3;d<=3;d++){let u=t+d,x=n+f;if(u<0||u>=28||x<0||x>=22)continue;let _=x*28+u,m=this.trayBins[_]*.32+Math.hypot(d,f)*1.3;m<r&&(s=_,r=m)}let a=this.trayBins[s],o=(s%28+.2+e.seed*31%1*.6)/28*Qt.halfWidth*2-Qt.halfWidth,l=(Math.floor(s/28)+.2+e.seed*47%1*.6)/22*Qt.halfDepth*2-Qt.halfDepth,c=this.spillObject;c.position.set(o,l,Qt.bottom+Math.min(42,a*.32)),c.rotation.set(.05,.03,e.seed*79),c.scale.set(2.1,2.1,.65),c.updateMatrix();let h=this.collectedCount++;this.collected.setMatrixAt(h,c.matrix),this.collected.setColorAt(h,e.color),this.collected.geometry.attributes.flakeSeed.setX(h,e.seed),this.trayBins[s]++}updateSpill(e){let t=0,n=this.spillObject,s=new U;for(let r of this.spills){if(Wu(r,e,this.boxMotion>.95?this.collectorBox:qp)){this.catchGrain(r);continue}s.set(r.x,r.y,r.z).project(this.camera),!(s.y<-1.15||Math.abs(s.x)>1.3||s.z>1)&&(n.position.set(r.x,r.y,r.z),n.rotation.set(.2,.1,r.seed*79),n.scale.setScalar(1.8+r.seed),n.updateMatrix(),this.spill.setMatrixAt(t,n.matrix),this.spill.setColorAt(t,r.color),this.spills[t++]=r)}this.spills.length=t,this.spill.count=t,this.spill.instanceMatrix.needsUpdate=!0,this.spill.instanceColor.needsUpdate=!0,this.collected.count=this.collectedCount,this.collected.instanceMatrix.needsUpdate=!0,this.collected.instanceColor.needsUpdate=!0,this.collected.geometry.attributes.flakeSeed.needsUpdate=!0}reset(){this.savedCount=0,this.current.count=0,this.spills.length=0,this.spill.count=0,this.currentInitialized=0,this.collectedCount=0,this.collected.count=0,this.boxMotion=0,this.boxGroup.visible=!1,this.updateBend(0)}setPeelPiece(e,t){this.peelPiece=t,this.peelAnchor=t.grip;let{w:n,h:s}=t.bounds,r=this.settings.profile==="economy"?14:10;this.peelSegments={x:Math.max(4,Math.ceil(n/r)),y:Math.max(4,Math.ceil(s/r))},this.peelGeo.dispose(),this.peelGeo=new vn(n,s,this.peelSegments.x,this.peelSegments.y),this.peelSheet.geometry=this.peelGeo,this.peelSheet.material.map?.dispose(),this.peelSheet.material.map=new Ti(e),this.peelSheet.material.map.colorSpace=Nt,this.peelSheet.material.color.set("#ffffff"),this.peelSheet.material.needsUpdate=!0,this.peelProgress(0)}peelProgress(e){if(this.peelValue=e,!this.peelPiece)return;this.peelSheet.visible=e>.12&&e<1;let t=this.peelGeo.attributes.position,{x:n,y:s}=this.peelSegments,r=this.peelPiece.bounds;for(let a=0;a<=s;a++)for(let o=0;o<=n;o++){let l=ic(this.peelPiece,r.x+o/n*r.w,r.y+a/s*r.h,e);t.setXYZ(a*(n+1)+o,l.x,l.y,l.z)}t.needsUpdate=!0,this.peelGeo.computeVertexNormals()}paperChanged(){this.paperTexture.needsUpdate=!0}render(e,{time:t,dt:n,phase:s,down:r,pointer:a,peeled:o,pour:l,brushMotion:c={dx:0,dy:0,speed:0,load:0},shakeProgress:h=0,finished:f=!1}){this.time=t;let d=ul(h);this.updateBend(d.bend,d.pitch),this.updateCollector(s,n),this.coatUniforms.uTime.value=t*.001,this.updateGrains(e),this.updateSpill(n);let u=this.settings.relief&&!f&&s!=="shake"&&e.freshCount>0;if(this.heap.visible=u,u&&this.updateHeap(e,n),this.settings.movingLight&&(this.key.position.x+=(-300+(a.x-300)*.4+Math.sin(t*23e-5)*50-this.key.position.x)*.045,this.key.position.y+=(340-(a.y-400)*.25-this.key.position.y)*.045),this.sparkLight.set(this.key.position.x*.0015,this.key.position.y*.0015,1).normalize(),this.paperGroup.rotation.x=0,this.paperGroup.position.z=0,this.paperGroup.updateMatrixWorld(!0),this.brush.visible=s==="brush"&&a.visible&&!f,this.tweezers.visible=s==="rolling",this.hint.visible=s==="peel",s==="peel"&&(this.hint.position.set(this.peelAnchor.x-300,400-this.peelAnchor.y,12),this.hint.material.opacity=.65+.25*Math.sin(t*.004)),s==="rolling"&&this.peelPiece){let w=this.peelValue||0,g=ic(this.peelPiece,this.peelAnchor.x,this.peelAnchor.y,w),S=1-Sn(w/.17),L=Math.atan2(-this.peelPiece.axis.y,this.peelPiece.axis.x)-Math.PI/2;this.tweezers.position.lerp(new U(g.x+Math.sin(L)*4+S*110,g.y-Math.cos(L)*4+S*90,g.z-35+S*110),Math.min(1,n*18)),this.tweezers.rotation.z=L}let x=Math.min(1,n*35);this.brushPoint.x+=(a.x-this.brushPoint.x)*x,this.brushPoint.y+=(a.y-this.brushPoint.y)*x;let _=e.cell(a.x,a.y),m=_<0?0:e.height[_];if(this.brush.position.set(this.brushPoint.x-300,400-this.brushPoint.y,r?4+Math.min(m*.15,9):28),r&&c.speed>12){let w=Math.atan2(-c.dy,c.dx)-Math.PI/2,g=Math.atan2(Math.sin(w-this.brushAngle),Math.cos(w-this.brushAngle));this.brushAngle+=g*Math.min(1,n*13)}this.brush.rotation.z=this.brushAngle;let p=this.brushVariants[this.settings.brushShape]||this.brushVariants.flat,M=r?Math.min(1,.15+c.speed/700+c.load*.3):0;p.tuft.scale.set(1+M*.13,1-M*.16,1-M*.35),p.tuft.rotation.x=-M*.12;let E=p.strands.geometry.attributes.position,b=p.base;for(let w=0;w<E.count;w++){let g=w%2;E.setXYZ(w,b[w*3]*(1+g*M*.2),b[w*3+1]+g*M*5,b[w*3+2]*(1-g*M*.55))}E.needsUpdate=!0,p.mat.color.set("#b58b55").lerp(new Ie(this.colors[this.activeColor]),Math.min(.4,c.load*.5)),this.posePour(l);let A=this.settings.sparkles&&!f?Math.min(e.count,28):0;for(let w=0;w<28;w++){let g=this.glints[w],S=e.count?Math.floor((w*7919+3571)%e.count):0;if(w>=A||e.state[S]===En||e.state[S]===Fi){g.visible=!1;continue}let L=Math.pow(Math.max(0,Math.sin(t*.0015+e.seed[S]*300+this.sparkLight.x*8+this.sparkLight.y*5)),28),C=e.cell(e.x[S],e.y[S]);if(L<.1||e.state[S]===Bn&&C>=0&&e.z[S]<e.height[C]*.73){g.visible=!1;continue}g.visible=!0,g.position.set(e.x[S]-300,400-e.y[S],e.z[S]+4),g.scale.setScalar(8+L*7),g.material.opacity=L*.8}this.renderer.render(this.scene,this.camera)}capture(){return this.renderer.render(this.scene,this.camera),this.canvas.toDataURL("image/png")}};var Xu="sim-atelier-v4",qu={economy:{renderScale:.65,shadow:"off",sparkles:!1,reflections:!1,relief:!1,movingLight:!1,frameLimit:30},balanced:{renderScale:.85,shadow:"off",sparkles:!0,reflections:!0,relief:!0,movingLight:!0,frameLimit:60},quality:{renderScale:1.2,shadow:"high",sparkles:!0,reflections:!0,relief:!0,movingLight:!0,frameLimit:60}},Jp={layout:"flow",autoAdvance:!0,showStats:!0,profile:"balanced",...qu.balanced,pourAmount:1,pace:"fast",feel:"natural",mobility:1,response:1,brushWidth:1,brushShape:"flat",grainSize:1,jarShape:"glass",pourStyle:"fan",surface:"slate"};function ml(i={}){let e={...Jp};for(let t of["autoAdvance","showStats","sparkles","reflections","relief","movingLight"])typeof i[t]=="boolean"&&(e[t]=i[t]);for(let[t,n]of Object.entries({layout:["flow","edge","dock"],shadow:["off","low","medium","high"],frameLimit:[30,45,60],pace:["fast","relaxed"],profile:["economy","balanced","quality","custom"],feel:["velvet","natural","fluid","custom"],brushShape:["flat","round","fan"],jarShape:["glass","slim","bowl"],pourStyle:["fan","ribbon","pulse"],surface:["slate","dark","kraft"]}))n.includes(i[t])&&(e[t]=i[t]);for(let[t,n,s]of[["renderScale",.5,1.5],["pourAmount",.75,1.75],["mobility",.25,1.8],["response",.5,1.4],["brushWidth",.7,1.4],["grainSize",.7,1.4]])typeof i[t]=="number"&&Number.isFinite(i[t])&&(e[t]=Math.max(n,Math.min(s,i[t])));return e}function sc(i){try{return ml(JSON.parse(i.getItem(Xu)||"{}"))}catch{return ml()}}function Yu(i,e){try{i.setItem(Xu,JSON.stringify(ml(e)))}catch{}}function Zu(i,e){return ml({...i,...qu[e],profile:e})}function rc(i,e,t){return Math.min(t,Math.ceil(Math.max(360,Math.min(14500,i*1.6+180))*e.pourAmount))}var gl=(i,e,t)=>Math.max(e,Math.min(t,i));function Ju(i,e,t="fan"){let n=e<300,s=n?80:65;return{target:{...i},anchor:{x:gl(i.x,32,568),y:gl(i.y-s,35,700)},fan:t==="ribbon"?n?20:34:t==="pulse"?n?44:80:n?38:65,sway:t==="ribbon"?24:n?10:18}}function $u(i,e=0){return{x:gl(i.anchor.x+Math.sin(e*Math.PI*3)*i.sway,20,580),y:gl(i.anchor.y+Math.sin(e*Math.PI*2)*5,20,740)}}function ac(i,e="fast",t=48e4){let n=Number.isFinite(i)?Math.max(0,Math.min(1,i)):0,s=(1-n)*t,r=Math.min(e==="relaxed"?2:8,t*2e-4),a=s<=r+1e-7;return{ready:a,percent:a?100:Math.min(99,Math.round(n*100))}}function Ku(i,e){let t=new URLSearchParams(i).get("devam");if(!t||!/^\d+$/.test(t))return 0;let n=Number(t);return Number.isSafeInteger(n)&&n>=1&&n<=e?n-1:0}var ju=[{id:"black",name:"Gece siyah\u0131",color:"#10121a",pour:{x:171,y:279},area:86834},{id:"blue",name:"Gotham mavisi",color:"#173bc9",pour:{x:396,y:390},area:11734},{id:"mouth",name:"Bordo g\xFCl\xFC\u015F",color:"#91283b",pour:{x:312,y:420},area:595},{id:"green",name:"Z\xFCmr\xFCt sa\xE7",color:"#0c643b",pour:{x:334,y:314},area:1082},{id:"silver",name:"G\xFCm\xFC\u015F sa\xE7",color:"#faf6ec",pour:{x:323,y:287},area:2830},{id:"skin",name:"S\u0131cak ten",color:"#edbb8e",pour:{x:323,y:378},area:24554},{id:"gold",name:"Alt\u0131n yelek",color:"#c89b2b",pour:{x:300,y:479},area:19887},{id:"tie",name:"Gece laciverdi",color:"#434c79",pour:{x:356,y:523},area:5527},{id:"purple",name:"Kadife moru",color:"#78389b",pour:{x:445,y:519},area:49199},{id:"pink",name:"Pembe \xE7i\xE7ek",color:"#e36b9c",pour:{x:238,y:522},area:2282},{id:"background",name:"K\u0131rm\u0131z\u0131 final",color:"#ed252d",pour:{x:480,y:119},area:275476}];var Qu=[{id:"garden-fox",name:"Tilki turuncusu",color:"#dc713b",pour:{x:302,y:375},area:54667},{id:"garden-cream",name:"Ay beyaz\u0131",color:"#fff4df",pour:{x:281,y:478},area:29756},{id:"garden-ink",name:"M\xFCrekkep",color:"#182132",pour:{x:231,y:669},area:4647},{id:"garden-jade",name:"Ye\u015Fim dallar",color:"#267b7b",pour:{x:118,y:404},area:21860},{id:"garden-mint",name:"Nane yapraklar\u0131",color:"#82c5b0",pour:{x:511,y:398},area:15674},{id:"garden-rose",name:"G\xFCl yapraklar\u0131",color:"#d97697",pour:{x:246,y:317},area:8744},{id:"garden-gold",name:"Ay alt\u0131n\u0131",color:"#e8bc54",pour:{x:483,y:174},area:10364},{id:"garden-night",name:"Gece laciverdi",color:"#152d48",pour:{x:282,y:159},area:334288}];var xl=[{id:"gotham",name:"Gotham",subtitle:"Batman & Joker \xB7 11 renk",lines:"lines",preview:"gotham-preview",stages:ju},{id:"ay-bahcesi",name:"Ay Bah\xE7esi",subtitle:"Ay \u0131\u015F\u0131\u011F\u0131nda bir tilki \xB7 8 renk",lines:"garden-lines",preview:"garden-preview",stages:Qu}];function e0(i){let e=new URLSearchParams(i).get("bolum");return xl.find(t=>t.id===e)||xl[0]}function t0(i,e,t=600,n=800){i.fillStyle=e,i.fillRect(0,0,t,n);for(let s=0;s<12e4;s++){let r=Math.random()*t,a=Math.random()*n,o=Math.random();i.fillStyle=o>.975?"#fff8dfb0":o>.4?"#ffffff1c":"#00000024",i.fillRect(r,a,.7+Math.random()*.7,.7+Math.random()*.7)}}var n0={black:[{id:"black-0",area:780,bounds:{x:268,y:298,w:50,h:32},grip:{x:303.5,y:298.5},axis:{x:-.575176751990256,y:.8180291583861418},length:46,duration:2.14,runs:[[0,19,17],[1,19,18],[2,18,19],[3,17,19],[4,17,19],[5,18,22],[6,19,24],[7,19,25],[8,21,25],[9,22,26],[10,22,27],[11,21,28],[12,20,30],[13,19,31],[14,17,33],[15,16,33],[16,15,33],[17,14,33],[18,12,32],[19,11,31],[20,9,30],[21,8,28],[22,6,28],[23,3,29],[24,3,26],[25,2,25],[26,1,23],[27,1,20],[28,0,18],[29,0,16],[30,1,11],[31,3,1]]},{id:"black-1",area:502,bounds:{x:297,y:320,w:34,h:23},grip:{x:326.5,y:320.5},axis:{x:-.5538645252024298,y:.8326068025918879},length:27,duration:2.12,runs:[[0,20,10],[1,16,15],[2,12,19],[3,8,23],[4,3,28],[5,3,28],[6,2,29],[7,1,30],[8,0,30],[9,1,28],[10,2,27],[11,3,26],[12,3,29],[13,6,28],[14,8,25],[15,10,23],[16,11,21],[17,12,19],[18,13,18],[19,14,16],[20,15,13],[21,15,10],[22,16,7]]},{id:"black-2",area:84886,bounds:{x:64,y:54,w:399,h:637},grip:{x:353.5,y:69.5},axis:{x:-.2712968701237396,y:.962495718567653},length:677,duration:2.99,runs:[[0,231,1],[1,230,4],[2,228,7],[3,227,8],[4,226,10],[5,226,10],[6,225,11],[7,225,11],[8,224,13],[9,224,13],[10,224,13],[11,223,14],[12,223,15],[13,222,16],[14,222,16],[15,221,17],[15,289,1],[16,221,17],[16,288,3],[17,220,18],[17,286,6],[18,220,19],[18,286,7],[19,220,19],[19,286,7],[20,219,21],[20,286,7],[21,219,21],[21,285,8],[22,218,22],[22,285,8],[23,218,22],[23,285,8],[24,217,24],[24,284,9],[25,217,23],[25,284,9],[26,216,23],[26,284,9],[27,216,22],[27,283,10],[28,216,21],[28,283,11],[29,215,21],[29,283,11],[30,215,21],[30,282,12],[31,214,22],[31,281,13],[32,214,22],[32,277,17],[33,213,22],[33,276,18],[34,213,22],[34,276,18],[35,212,23],[35,259,2],[35,277,17],[36,212,23],[36,259,3],[36,277,17],[37,212,23],[37,249,13],[37,278,16],[38,211,24],[38,245,25],[38,278,17],[39,211,24],[39,242,34],[39,279,16],[40,210,25],[40,238,57],[41,210,25],[41,237,58],[42,209,86],[43,209,86],[44,208,87],[45,208,87],[46,208,87],[47,207,88],[48,207,89],[49,206,90],[50,206,90],[51,205,91],[52,205,91],[53,204,92],[54,204,92],[55,204,92],[56,203,93],[57,203,93],[58,202,95],[59,202,95],[60,201,96],[61,201,96],[62,200,97],[63,200,97],[64,200,97],[65,199,98],[66,199,98],[67,198,99],[68,198,100],[69,197,101],[70,197,101],[71,196,102],[72,196,36],[72,234,64],[73,196,36],[73,236,62],[74,195,38],[74,237,61],[75,195,38],[75,238,60],[76,194,39],[76,239,59],[77,194,40],[77,241,57],[78,193,41],[78,242,57],[79,193,42],[79,244,55],[80,192,44],[80,245,54],[81,192,44],[81,246,53],[82,192,45],[82,247,52],[83,191,46],[83,248,51],[84,191,47],[84,250,49],[85,190,48],[85,252,47],[86,190,49],[86,253,46],[87,189,29],[87,222,18],[87,253,45],[88,189,28],[88,224,16],[88,252,46],[89,188,29],[89,225,17],[89,249,49],[90,188,29],[90,227,59],[90,290,8],[91,188,28],[91,229,53],[91,291,6],[92,187,29],[92,231,48],[92,292,4],[93,187,29],[93,232,41],[93,288,7],[94,186,29],[94,236,37],[94,286,8],[95,186,29],[95,237,36],[95,283,11],[96,185,29],[96,238,36],[96,281,13],[97,185,29],[97,238,37],[97,279,15],[98,184,30],[98,239,55],[99,184,29],[99,241,53],[100,183,30],[100,242,52],[101,181,31],[101,243,51],[102,180,32],[102,244,49],[103,179,33],[103,246,47],[104,177,34],[104,247,46],[105,176,35],[105,248,45],[106,175,35],[106,249,43],[107,173,37],[107,250,31],[107,286,6],[108,172,37],[108,252,26],[108,287,4],[109,171,38],[109,253,21],[109,288,3],[110,170,39],[110,254,18],[110,289,1],[111,169,39],[111,255,14],[112,168,40],[112,256,10],[113,167,41],[113,257,7],[114,166,41],[115,165,42],[116,164,42],[117,162,44],[118,161,45],[119,160,45],[120,159,45],[121,157,47],[122,155,49],[123,154,50],[124,153,51],[125,152,52],[126,151,53],[127,149,55],[128,147,57],[129,145,60],[130,143,63],[131,142,64],[132,141,66],[133,139,69],[134,137,72],[135,135,75],[136,132,79],[137,130,83],[137,278,3],[138,128,88],[138,277,5],[139,125,92],[139,276,6],[140,123,95],[140,274,10],[141,121,98],[141,273,12],[142,119,101],[142,272,15],[143,116,105],[143,271,19],[144,114,109],[144,271,21],[145,112,113],[145,271,24],[146,110,118],[146,271,27],[147,108,125],[147,270,30],[148,105,132],[148,270,32],[149,103,139],[149,270,35],[150,101,147],[150,269,39],[151,99,158],[151,269,41],[152,97,216],[153,94,221],[154,92,226],[155,90,230],[156,88,235],[157,85,240],[158,83,245],[159,81,249],[160,79,254],[161,77,258],[162,74,263],[163,72,268],[164,70,272],[165,68,277],[166,65,281],[167,63,286],[168,61,290],[169,59,293],[170,57,296],[171,55,299],[172,54,301],[173,54,302],[174,53,303],[175,52,305],[176,51,307],[177,51,308],[178,50,309],[179,49,185],[179,236,124],[180,48,185],[180,238,122],[181,48,185],[181,239,122],[182,47,185],[182,239,123],[183,46,186],[183,239,124],[184,45,186],[184,240,124],[185,45,185],[185,243,121],[186,44,184],[186,244,121],[187,43,185],[187,244,121],[188,42,185],[188,246,120],[189,42,184],[189,246,120],[190,41,185],[190,247,120],[191,40,185],[191,248,119],[192,39,185],[192,233,2],[192,240,3],[192,249,119],[193,39,184],[193,232,11],[193,250,118],[194,39,184],[194,232,12],[194,251,117],[195,38,184],[195,232,12],[195,252,116],[196,37,185],[196,231,13],[196,253,116],[197,37,185],[197,231,13],[197,253,116],[198,37,185],[198,231,14],[198,253,116],[199,36,187],[199,231,14],[199,252,117],[200,36,191],[200,230,15],[200,250,119],[201,35,334],[202,35,334],[203,34,336],[204,34,336],[205,33,337],[206,33,337],[207,33,337],[208,32,339],[209,32,169],[209,203,168],[210,31,169],[210,202,75],[210,278,93],[211,31,168],[211,202,75],[211,279,92],[212,31,168],[212,201,77],[212,280,91],[213,31,167],[213,201,77],[213,281,90],[214,31,166],[214,200,79],[214,282,89],[215,31,166],[215,200,80],[215,283,88],[216,31,165],[216,199,18],[216,221,39],[216,265,16],[216,284,88],[217,30,165],[217,199,16],[217,222,37],[217,266,15],[217,285,87],[218,30,164],[218,198,16],[218,223,36],[218,267,15],[218,285,87],[219,30,164],[219,198,16],[219,224,34],[219,267,15],[219,286,86],[220,30,163],[220,198,16],[220,226,2],[220,234,14],[220,255,2],[220,268,15],[220,287,85],[221,30,163],[221,197,17],[221,236,11],[221,268,16],[221,288,84],[222,30,162],[222,197,17],[222,237,9],[222,268,16],[222,289,83],[223,30,161],[223,196,12],[223,238,7],[223,268,17],[223,290,82],[224,30,161],[224,196,12],[224,240,4],[224,272,13],[224,291,82],[225,30,160],[225,195,12],[225,272,14],[225,292,81],[226,30,159],[226,195,12],[226,272,15],[226,292,81],[227,30,159],[227,195,11],[227,272,15],[227,293,80],[228,30,158],[228,195,11],[228,274,14],[228,294,79],[229,29,159],[229,194,12],[229,275,14],[229,295,78],[230,29,158],[230,194,12],[230,275,14],[230,295,78],[231,29,157],[231,193,12],[231,275,15],[231,296,77],[232,29,156],[232,193,12],[232,276,14],[232,297,77],[233,29,156],[233,193,12],[233,276,15],[233,298,76],[234,29,155],[234,192,12],[234,277,14],[234,299,75],[235,28,156],[235,192,12],[235,277,15],[235,300,74],[236,28,155],[236,192,12],[236,278,14],[236,300,74],[237,28,154],[237,191,12],[237,278,15],[237,301,73],[238,28,154],[238,191,12],[238,279,14],[238,302,72],[239,28,153],[239,190,12],[239,279,15],[239,302,73],[240,28,152],[240,190,12],[240,280,15],[240,303,72],[241,28,151],[241,190,12],[241,280,16],[241,304,71],[242,28,151],[242,189,12],[242,281,15],[242,305,70],[243,28,151],[243,189,12],[243,281,15],[243,305,70],[244,28,150],[244,189,12],[244,282,14],[244,306,69],[245,27,150],[245,188,13],[245,282,15],[245,307,68],[246,27,150],[246,188,12],[246,282,15],[246,308,68],[247,27,149],[247,188,12],[247,283,15],[247,308,68],[248,27,149],[248,187,13],[248,283,15],[248,309,67],[249,27,148],[249,187,12],[249,284,15],[249,310,66],[250,27,148],[250,187,12],[250,284,15],[250,311,65],[251,27,147],[251,187,12],[251,284,15],[251,311,65],[252,27,146],[252,186,12],[252,285,15],[252,312,64],[253,27,146],[253,186,12],[253,285,16],[253,312,64],[254,27,145],[254,186,12],[254,286,15],[254,313,63],[255,27,145],[255,185,13],[255,286,15],[255,314,62],[256,27,144],[256,185,12],[256,286,16],[256,314,62],[257,27,144],[257,185,12],[257,287,15],[257,315,62],[258,27,143],[258,185,12],[258,287,15],[258,316,61],[259,27,142],[259,184,12],[259,287,16],[259,316,61],[260,26,143],[260,184,12],[260,288,15],[260,317,60],[261,26,143],[261,184,11],[261,288,16],[261,317,60],[262,26,142],[262,183,12],[262,288,16],[262,318,59],[263,26,142],[263,183,12],[263,289,15],[263,318,59],[264,26,141],[264,183,12],[264,289,16],[264,319,58],[265,26,141],[265,183,12],[265,289,16],[265,320,57],[266,26,140],[266,182,12],[266,288,17],[266,320,57],[267,25,141],[267,182,12],[267,287,18],[267,321,56],[268,25,140],[268,182,11],[268,286,20],[268,321,57],[269,25,140],[269,181,12],[269,284,22],[269,321,57],[270,25,140],[270,181,12],[270,283,24],[270,322,56],[271,25,139],[271,181,11],[271,283,33],[271,323,55],[272,25,139],[272,181,11],[272,284,31],[272,323,55],[273,25,138],[273,180,14],[273,285,30],[273,323,55],[274,25,138],[274,180,15],[274,286,29],[274,324,54],[275,25,137],[275,180,16],[275,288,27],[275,324,55],[276,25,137],[276,180,16],[276,290,27],[276,325,54],[277,25,137],[277,179,16],[277,290,27],[277,325,54],[278,25,136],[278,177,18],[278,290,27],[278,326,53],[279,25,135],[279,174,21],[279,289,28],[279,326,53],[280,24,136],[280,173,24],[280,289,27],[280,327,52],[281,24,135],[281,173,25],[281,289,27],[281,327,52],[282,24,135],[282,173,26],[282,289,26],[282,328,52],[283,24,135],[283,174,25],[283,290,24],[283,328,52],[284,24,134],[284,174,25],[284,209,3],[284,290,22],[284,328,52],[285,24,134],[285,174,24],[285,206,6],[285,290,20],[285,329,51],[286,24,133],[286,173,25],[286,203,9],[286,291,19],[286,329,51],[287,24,133],[287,173,24],[287,201,11],[287,291,20],[287,330,50],[288,24,133],[288,173,23],[288,200,12],[288,291,20],[288,330,50],[289,24,132],[289,173,22],[289,198,13],[289,291,21],[289,330,50],[290,23,133],[290,174,21],[290,198,13],[290,291,21],[290,331,49],[291,23,132],[291,175,19],[291,196,15],[291,292,20],[291,331,49],[292,23,132],[292,176,17],[292,195,16],[292,292,21],[292,332,48],[293,23,131],[293,175,18],[293,194,17],[293,292,21],[293,332,48],[294,23,131],[294,175,36],[294,292,21],[294,332,48],[295,23,131],[295,175,35],[295,292,21],[295,333,48],[296,23,130],[296,174,36],[296,292,22],[296,333,48],[297,23,130],[297,174,36],[297,291,23],[297,334,47],[298,23,130],[298,174,36],[298,291,23],[298,334,47],[299,23,129],[299,174,12],[299,190,20],[299,291,23],[299,334,47],[300,23,129],[300,173,13],[300,191,19],[300,292,23],[300,335,46],[301,23,128],[301,173,13],[301,191,19],[301,292,23],[301,335,46],[302,23,128],[302,173,13],[302,192,18],[302,292,23],[302,336,46],[303,23,128],[303,173,13],[303,192,18],[303,292,23],[303,336,46],[304,22,128],[304,173,12],[304,193,17],[304,292,23],[304,336,46],[305,22,128],[305,172,13],[305,193,17],[305,293,22],[305,337,45],[306,22,127],[306,172,12],[306,195,17],[306,293,23],[306,337,45],[307,22,127],[307,172,12],[307,196,17],[307,293,23],[307,337,45],[308,22,127],[308,172,12],[308,197,16],[308,293,23],[308,338,44],[309,22,126],[309,171,13],[309,197,16],[309,295,4],[309,303,13],[309,338,44],[310,22,126],[310,171,13],[310,198,15],[310,296,1],[310,303,13],[310,338,45],[311,22,113],[311,136,12],[311,171,13],[311,199,14],[311,304,13],[311,339,44],[312,22,113],[312,136,11],[312,171,13],[312,199,14],[312,304,13],[312,339,44],[313,22,112],[313,136,11],[313,170,13],[313,200,13],[313,304,13],[313,339,44],[314,22,112],[314,136,11],[314,170,13],[314,201,12],[314,303,14],[314,340,43],[315,22,111],[315,136,10],[315,170,13],[315,201,12],[315,303,14],[315,340,13],[315,354,29],[316,21,112],[316,135,11],[316,170,13],[316,201,12],[316,304,13],[316,340,13],[316,354,29],[317,21,111],[317,135,10],[317,169,13],[317,201,12],[317,304,13],[317,341,12],[317,354,29],[318,21,111],[318,135,10],[318,169,13],[318,201,12],[318,304,13],[318,341,12],[318,355,29],[319,21,111],[319,135,10],[319,169,13],[319,202,11],[319,304,13],[319,341,12],[319,355,29],[320,21,110],[320,134,10],[320,169,13],[320,204,9],[320,304,13],[320,342,11],[320,356,28],[321,21,110],[321,134,10],[321,168,14],[321,205,7],[321,304,14],[321,342,11],[321,356,28],[322,21,109],[322,134,10],[322,168,14],[322,208,4],[322,304,14],[322,342,12],[322,356,28],[323,21,109],[323,134,9],[323,168,13],[323,304,14],[323,343,11],[323,357,27],[324,21,108],[324,133,10],[324,168,13],[324,304,14],[324,343,11],[324,357,27],[325,21,108],[325,133,10],[325,168,13],[325,304,14],[325,343,11],[325,357,28],[326,21,107],[326,133,9],[326,167,14],[326,304,14],[326,344,10],[326,357,28],[327,21,107],[327,133,9],[327,167,14],[327,304,14],[327,344,10],[327,358,27],[328,21,107],[328,132,10],[328,167,13],[328,304,14],[328,344,10],[328,358,27],[329,20,107],[329,132,9],[329,167,13],[329,303,16],[329,344,10],[329,358,27],[330,20,107],[330,132,9],[330,166,14],[330,303,16],[330,345,10],[330,359,26],[331,20,106],[331,132,8],[331,166,14],[331,303,16],[331,345,10],[331,359,26],[332,20,106],[332,132,8],[332,166,14],[332,303,16],[332,345,10],[332,359,27],[333,20,106],[333,132,8],[333,166,14],[333,303,16],[333,346,9],[333,360,26],[334,20,105],[334,132,8],[334,166,14],[334,303,16],[334,346,9],[334,360,26],[335,20,105],[335,132,7],[335,166,14],[335,299,2],[335,302,17],[335,346,9],[335,360,26],[336,20,105],[336,132,6],[336,165,14],[336,299,20],[336,346,9],[336,360,26],[337,20,104],[337,133,3],[337,165,14],[337,300,19],[337,347,8],[337,361,25],[338,20,104],[338,134,1],[338,165,14],[338,300,19],[338,347,8],[338,361,25],[339,20,104],[339,165,14],[339,300,20],[339,347,8],[339,361,26],[340,20,103],[340,165,14],[340,300,20],[340,347,8],[340,361,26],[341,19,104],[341,165,14],[341,300,20],[341,349,5],[341,362,25],[342,19,103],[342,165,13],[342,300,20],[342,350,4],[342,362,25],[343,19,103],[343,164,14],[343,300,20],[343,351,2],[343,362,25],[344,19,103],[344,164,14],[344,300,20],[344,362,25],[345,19,102],[345,164,14],[345,300,20],[345,363,24],[346,19,102],[346,164,14],[346,300,20],[346,363,25],[347,19,102],[347,164,14],[347,300,20],[347,363,25],[348,19,101],[348,164,14],[348,301,19],[348,364,24],[349,19,101],[349,163,15],[349,301,19],[349,364,24],[350,19,101],[350,163,15],[350,301,19],[350,364,24],[351,19,100],[351,163,15],[351,301,19],[351,364,24],[352,19,100],[352,163,15],[352,301,19],[352,365,23],[353,19,100],[353,163,14],[353,301,19],[353,365,24],[354,19,99],[354,163,14],[354,301,19],[354,365,24],[355,19,99],[355,163,14],[355,301,19],[355,365,24],[356,18,100],[356,163,14],[356,301,20],[356,366,23],[357,18,100],[357,163,14],[357,300,21],[357,366,23],[358,18,99],[358,162,15],[358,300,21],[358,366,23],[359,18,99],[359,162,15],[359,299,22],[359,366,24],[360,18,98],[360,162,15],[360,299,22],[360,367,23],[361,18,98],[361,162,15],[361,298,23],[361,367,23],[362,18,98],[362,162,15],[362,298,23],[362,367,23],[363,18,98],[363,162,14],[363,297,24],[363,367,23],[364,18,97],[364,162,14],[364,297,23],[364,367,23],[365,18,97],[365,162,14],[365,296,24],[365,368,23],[366,18,97],[366,161,15],[366,296,24],[366,368,23],[367,18,97],[367,161,15],[367,296,24],[367,368,23],[368,18,96],[368,161,15],[368,295,25],[368,368,23],[369,18,96],[369,161,15],[369,295,25],[369,368,23],[370,17,97],[370,161,15],[370,295,25],[370,369,22],[371,17,97],[371,161,15],[371,295,25],[371,369,23],[372,17,96],[372,161,15],[372,294,26],[372,369,23],[373,17,96],[373,161,15],[373,294,26],[373,369,23],[374,17,96],[374,161,15],[374,294,26],[374,370,22],[375,17,96],[375,161,15],[375,294,26],[375,370,23],[376,17,96],[376,161,15],[376,294,26],[376,370,23],[377,17,95],[377,160,16],[377,294,26],[377,370,23],[378,17,95],[378,160,16],[378,294,26],[378,370,23],[379,17,95],[379,160,16],[379,294,25],[379,370,23],[380,17,95],[380,160,16],[380,294,25],[380,371,22],[381,17,94],[381,160,16],[381,294,25],[381,371,22],[382,17,94],[382,160,15],[382,294,25],[382,371,23],[383,17,94],[383,160,15],[383,294,25],[383,371,23],[384,17,94],[384,160,15],[384,294,7],[384,304,15],[384,372,22],[385,17,94],[385,160,15],[385,294,6],[385,305,14],[385,372,22],[386,17,93],[386,160,15],[386,294,5],[386,307,12],[386,372,22],[387,17,93],[387,160,15],[387,294,4],[387,309,10],[387,372,22],[388,17,93],[388,160,15],[388,311,8],[388,373,22],[389,17,93],[389,159,16],[389,317,2],[389,373,22],[390,17,93],[390,159,16],[390,373,22],[391,17,92],[391,159,16],[391,373,22],[392,17,92],[392,159,16],[392,373,22],[393,16,93],[393,159,16],[393,373,23],[394,16,93],[394,159,16],[394,374,22],[395,16,93],[395,159,16],[395,374,22],[396,16,93],[396,159,15],[396,374,22],[397,16,92],[397,159,15],[397,374,22],[398,16,92],[398,159,15],[398,374,23],[399,16,92],[399,159,15],[399,375,22],[400,16,92],[400,159,15],[400,375,22],[401,16,92],[401,159,15],[401,375,22],[402,16,92],[402,159,15],[402,375,23],[403,16,91],[403,159,15],[403,376,22],[404,16,91],[404,159,15],[404,376,22],[405,16,91],[405,158,16],[405,376,22],[406,16,91],[406,158,16],[406,376,22],[407,16,91],[407,158,16],[407,375,23],[408,16,90],[408,158,17],[408,374,24],[409,16,90],[409,158,15],[409,375,24],[410,16,90],[410,158,14],[410,376,23],[411,16,90],[411,158,12],[411,377,22],[412,16,90],[412,158,10],[412,381,18],[413,16,89],[413,158,7],[413,385,14],[414,16,89],[414,158,2],[414,388,11],[415,16,89],[416,16,89],[417,16,89],[418,16,89],[419,16,89],[420,16,88],[421,16,88],[422,16,88],[423,15,89],[424,15,89],[425,15,89],[426,15,89],[427,15,89],[428,15,88],[429,15,88],[430,15,88],[431,15,88],[432,15,88],[433,15,88],[434,15,88],[435,15,88],[436,15,88],[437,15,89],[438,15,89],[439,15,87],[440,15,86],[441,15,84],[442,15,82],[443,15,79],[444,15,77],[445,15,74],[446,15,71],[447,15,69],[448,15,69],[449,15,69],[450,15,68],[451,15,65],[452,15,65],[453,14,65],[454,14,65],[455,14,65],[456,14,64],[457,14,64],[458,14,64],[459,14,64],[460,14,63],[461,14,63],[462,14,63],[463,14,62],[464,15,61],[465,15,61],[466,15,61],[467,15,61],[468,14,61],[469,14,61],[470,14,61],[471,14,61],[472,14,61],[473,14,61],[474,14,60],[475,14,60],[476,14,60],[477,14,60],[478,14,60],[479,14,60],[480,14,59],[481,14,59],[482,14,59],[483,14,59],[484,14,59],[485,14,59],[486,14,58],[487,14,58],[488,14,58],[489,14,58],[490,14,58],[491,14,58],[492,14,58],[493,14,58],[494,14,58],[495,14,57],[496,14,57],[497,13,58],[498,13,58],[499,13,58],[500,13,58],[501,13,58],[502,13,58],[503,13,58],[504,13,58],[505,13,58],[506,13,58],[507,13,58],[508,13,58],[509,13,57],[510,13,57],[511,13,57],[512,13,57],[513,13,57],[514,13,57],[515,13,57],[516,13,57],[517,12,58],[518,12,58],[519,12,58],[520,12,58],[521,12,58],[522,12,58],[523,12,58],[524,12,58],[525,12,58],[526,12,58],[527,12,58],[528,12,58],[529,12,59],[530,12,59],[531,12,59],[532,12,59],[533,12,59],[534,12,59],[535,12,59],[536,12,59],[537,12,59],[538,12,59],[539,11,60],[540,11,60],[541,11,60],[542,11,60],[543,11,60],[544,11,60],[545,11,60],[546,11,60],[547,11,60],[548,11,60],[549,11,60],[550,10,61],[551,10,61],[552,10,62],[553,10,62],[554,10,62],[555,10,62],[556,10,62],[557,10,62],[558,10,62],[559,9,63],[560,9,63],[561,9,63],[562,9,63],[563,9,63],[564,9,64],[565,9,64],[566,9,64],[567,9,64],[568,9,64],[569,9,64],[570,9,64],[571,9,64],[572,8,65],[573,8,65],[574,8,65],[575,8,66],[576,8,66],[577,8,66],[578,8,66],[579,7,67],[580,7,67],[581,7,67],[582,7,67],[583,7,67],[584,7,67],[585,7,67],[586,7,67],[587,6,68],[588,6,69],[589,6,69],[590,6,69],[591,6,69],[592,6,69],[593,5,71],[594,5,71],[595,5,71],[596,5,71],[597,5,71],[598,5,71],[599,5,71],[600,5,72],[601,4,73],[602,4,73],[603,4,73],[604,4,73],[605,3,75],[606,3,75],[607,3,75],[608,3,75],[609,3,75],[610,3,76],[611,3,76],[612,3,76],[613,2,77],[614,2,77],[615,2,78],[616,2,78],[617,2,78],[618,1,79],[619,1,80],[620,1,80],[621,1,80],[622,1,80],[623,1,81],[624,1,81],[625,0,82],[626,0,83],[627,0,83],[628,0,83],[629,0,83],[630,0,84],[631,0,84],[632,0,85],[633,0,86],[634,0,87],[635,0,85],[636,1,33],[636,52,7]]},{id:"black-3",area:425,bounds:{x:434,y:658,w:28,h:28},grip:{x:449.5,y:658.5},axis:{x:-.41036467732879783,y:.9119215051751063},length:31,duration:2.12,runs:[[0,15,1],[1,14,3],[2,12,6],[3,11,7],[4,10,9],[5,10,9],[6,10,9],[7,9,10],[8,9,11],[9,9,11],[10,8,13],[11,8,13],[12,8,13],[13,8,14],[14,7,15],[15,7,15],[16,6,17],[17,6,17],[18,5,19],[19,4,21],[20,3,22],[21,3,23],[22,2,24],[23,2,25],[24,1,26],[25,1,27],[26,0,26],[27,3,19]]},{id:"black-4",area:241,bounds:{x:555,y:665,w:17,h:24},grip:{x:565.5,y:665.5},axis:{x:-.30369519581060417,y:.9527692417587581},length:26,duration:2.1,runs:[[0,9,2],[1,8,4],[2,6,8],[3,6,8],[4,6,9],[5,2,2],[5,5,11],[6,1,15],[7,1,16],[8,1,16],[9,1,16],[10,1,15],[11,1,14],[12,1,13],[13,1,13],[14,1,12],[15,1,11],[16,1,10],[17,1,9],[18,1,8],[19,0,8],[20,0,7],[21,0,6],[22,0,5],[23,0,3]]}],blue:[{id:"blue-0",area:396,bounds:{x:299,y:79,w:44,h:17},grip:{x:340.5,y:89.5},axis:{x:-.7587153665245263,y:.6514222843897448},length:37,duration:2.11,runs:[[0,5,2],[1,4,8],[2,3,16],[3,2,22],[4,1,26],[5,1,28],[6,1,33],[7,1,38],[8,0,40],[9,0,41],[10,0,24],[10,26,16],[11,0,24],[11,27,15],[12,0,14],[12,27,16],[13,0,10],[13,35,8],[14,0,7],[14,41,3],[15,0,3],[16,0,2]]},{id:"blue-1",area:4942,bounds:{x:341,y:264,w:99,h:198},grip:{x:341.5,y:264.5},axis:{x:-.21951219512195125,y:.9756097560975611},length:173,duration:2.28,runs:[[0,0,1],[1,0,2],[2,1,2],[3,1,3],[4,2,3],[5,3,3],[6,4,3],[7,4,4],[8,5,3],[9,5,4],[10,6,4],[11,7,4],[12,7,5],[13,8,5],[14,8,6],[15,9,6],[16,10,5],[17,10,6],[18,11,6],[19,12,6],[20,12,6],[21,13,6],[22,13,7],[23,14,7],[24,14,8],[25,15,8],[26,15,8],[27,16,8],[28,16,9],[29,17,8],[30,18,8],[31,19,8],[32,19,9],[33,19,9],[34,19,10],[35,20,10],[36,20,11],[37,21,10],[38,21,11],[39,22,11],[40,22,12],[41,22,12],[42,23,12],[43,24,11],[44,24,12],[45,24,13],[46,25,12],[47,25,13],[48,25,14],[49,26,13],[50,26,14],[51,27,13],[52,27,14],[53,27,14],[54,28,14],[55,28,15],[56,28,15],[57,28,16],[58,29,15],[59,29,15],[60,30,15],[61,39,7],[62,38,8],[63,38,8],[64,38,9],[65,38,9],[66,40,8],[67,40,8],[68,40,9],[69,40,9],[70,39,11],[71,39,11],[72,38,13],[73,37,14],[74,35,16],[75,33,19],[76,33,19],[77,34,19],[78,34,19],[79,35,18],[80,35,19],[81,35,19],[82,36,19],[83,36,19],[84,36,19],[85,36,20],[86,37,19],[87,37,20],[88,37,20],[89,37,20],[90,38,20],[91,38,20],[92,38,21],[93,38,21],[94,38,21],[95,38,22],[96,39,21],[97,39,21],[98,39,22],[99,39,22],[100,39,22],[101,40,22],[102,40,22],[103,40,22],[104,40,23],[105,40,23],[105,76,1],[106,40,23],[106,76,1],[107,40,24],[107,76,1],[108,40,24],[108,76,2],[109,40,24],[109,76,2],[110,40,25],[110,76,3],[111,41,24],[111,76,3],[112,41,24],[112,77,2],[113,41,25],[113,77,3],[114,41,25],[114,77,3],[115,41,25],[115,77,3],[116,41,26],[116,77,3],[117,41,26],[117,77,4],[118,41,26],[118,77,4],[119,42,25],[119,77,4],[120,42,26],[120,78,4],[121,42,26],[121,78,4],[122,42,26],[122,78,4],[123,42,27],[123,78,5],[124,42,27],[124,78,5],[125,42,27],[125,78,5],[126,42,27],[126,78,5],[127,42,28],[127,78,6],[128,42,28],[128,78,6],[129,43,27],[129,78,6],[130,43,27],[130,78,6],[131,43,29],[131,77,8],[132,43,30],[132,77,8],[133,43,31],[133,76,9],[134,43,42],[135,43,43],[136,43,43],[137,43,43],[138,43,44],[139,43,44],[140,43,44],[141,43,44],[142,43,45],[143,43,45],[144,43,45],[145,43,45],[146,44,45],[147,44,45],[148,44,45],[149,44,45],[150,44,46],[151,44,46],[152,44,46],[153,44,46],[154,43,47],[155,43,48],[156,43,48],[157,43,48],[158,43,48],[159,43,48],[160,43,49],[161,43,49],[162,43,49],[163,43,49],[164,43,50],[165,43,50],[166,43,50],[167,43,50],[168,43,50],[169,42,51],[170,42,52],[171,42,52],[172,42,52],[173,42,52],[174,42,53],[175,42,53],[176,42,53],[177,42,53],[178,42,54],[179,42,54],[180,44,52],[181,46,50],[182,47,49],[183,48,48],[184,49,48],[185,51,46],[186,52,45],[187,60,37],[188,63,34],[189,67,31],[190,69,29],[191,73,25],[192,76,22],[193,80,19],[194,83,16],[195,86,13],[196,90,9],[197,94,4]]},{id:"blue-2",area:6396,bounds:{x:167,y:263,w:100,h:228},grip:{x:266.5,y:263.5},axis:{x:-.19363303189666037,y:.9810740282764125},length:243,duration:2.31,runs:[[0,98,2],[1,97,2],[2,96,3],[3,96,2],[4,95,3],[5,94,3],[6,94,3],[7,93,3],[8,92,4],[9,91,4],[10,91,4],[11,90,5],[12,90,4],[13,89,5],[14,88,5],[15,88,5],[16,87,5],[17,86,6],[18,86,6],[19,85,7],[20,85,6],[21,84,7],[22,83,7],[23,82,8],[24,82,8],[25,81,8],[26,81,8],[27,80,9],[28,79,9],[29,79,9],[30,78,9],[31,77,10],[32,76,11],[33,76,10],[34,76,10],[35,75,11],[36,74,11],[37,74,11],[38,73,12],[39,73,11],[40,72,12],[41,72,12],[42,71,13],[43,70,13],[44,70,13],[45,69,14],[46,69,13],[47,68,14],[48,68,14],[49,67,15],[50,66,15],[51,66,15],[52,66,15],[53,65,15],[54,65,15],[55,64,16],[56,64,16],[57,63,16],[58,63,16],[59,62,17],[60,62,16],[61,62,16],[62,61,17],[63,61,17],[64,60,17],[65,60,17],[66,59,18],[67,59,18],[68,59,17],[69,58,16],[70,57,14],[71,57,13],[72,56,14],[73,56,14],[74,56,15],[75,55,16],[76,55,16],[77,54,16],[78,54,16],[79,54,16],[80,53,17],[81,53,18],[82,52,20],[83,52,21],[84,51,21],[85,51,21],[86,51,21],[87,50,21],[88,50,21],[89,50,21],[90,49,22],[91,49,21],[92,48,22],[93,48,22],[94,48,22],[95,47,23],[96,47,22],[97,46,23],[98,46,23],[99,46,23],[100,45,23],[101,45,23],[102,32,1],[102,45,23],[103,32,1],[103,44,24],[104,31,2],[104,44,23],[105,31,2],[105,44,23],[106,30,3],[106,43,24],[107,30,2],[107,43,24],[108,29,3],[108,42,24],[109,29,3],[109,42,24],[110,29,3],[110,42,24],[111,28,3],[111,41,25],[112,28,3],[112,41,24],[113,27,4],[113,41,24],[114,27,4],[114,40,25],[115,26,4],[115,40,25],[116,26,4],[116,40,25],[117,25,5],[117,39,25],[118,25,5],[118,39,25],[119,25,4],[119,39,25],[120,24,5],[120,38,26],[121,24,5],[121,38,25],[122,23,6],[122,37,26],[123,23,6],[123,37,26],[124,23,6],[124,37,26],[125,22,7],[125,37,26],[126,22,7],[126,36,27],[127,22,7],[127,35,27],[128,21,9],[128,33,29],[129,21,10],[129,32,30],[130,21,41],[131,20,42],[132,20,42],[133,19,43],[134,19,42],[135,19,42],[136,18,43],[137,18,43],[138,18,43],[139,17,44],[140,17,43],[141,17,43],[142,16,44],[143,16,44],[144,16,44],[145,15,45],[146,15,45],[147,15,45],[148,15,45],[149,14,45],[150,14,45],[151,13,46],[152,13,46],[153,13,46],[154,13,46],[155,12,47],[156,12,47],[157,12,46],[158,12,46],[159,11,47],[160,11,47],[161,11,47],[162,11,47],[163,10,48],[164,10,48],[165,10,48],[166,10,48],[167,10,48],[168,9,48],[169,9,48],[170,9,48],[171,9,48],[172,8,49],[173,8,49],[174,8,49],[175,8,49],[176,8,49],[177,7,50],[178,7,50],[179,7,50],[180,7,49],[181,7,49],[182,6,50],[183,6,50],[184,6,50],[185,6,50],[186,6,50],[187,6,50],[188,5,51],[189,5,51],[190,5,51],[191,5,51],[192,5,51],[193,5,51],[194,4,52],[195,4,52],[196,4,51],[197,4,51],[198,4,51],[199,3,52],[200,3,52],[201,3,52],[202,3,52],[203,3,52],[204,2,53],[205,2,53],[206,2,51],[207,2,48],[208,2,46],[209,2,44],[210,2,41],[211,1,40],[212,1,37],[213,1,35],[214,1,33],[215,1,30],[216,1,28],[217,1,26],[218,1,24],[219,0,22],[220,0,20],[221,0,17],[222,0,15],[223,0,13],[224,0,11],[225,0,8],[226,0,6],[227,0,3]]}],mouth:[{id:"mouth-0",area:595,bounds:{x:292,y:413,w:59,h:22},grip:{x:350.5,y:427.5},axis:{x:-.7700012058203037,y:.6380424304349033},length:49,duration:2.13,runs:[[0,19,4],[1,14,12],[2,11,17],[3,10,21],[3,37,5],[4,9,35],[5,8,38],[6,7,41],[7,6,47],[8,6,48],[9,5,49],[10,5,50],[11,5,50],[12,4,29],[12,37,19],[13,4,23],[13,41,16],[14,4,18],[14,45,14],[15,3,15],[15,50,8],[16,3,11],[16,56,3],[17,3,8],[18,2,6],[19,0,4],[20,1,3],[21,2,1]]}],green:[{id:"green-0",area:1082,bounds:{x:257,y:300,w:88,h:48},grip:{x:342.5,y:308.5},axis:{x:-.6363829547955637,y:.7713732785400772},length:86,duration:2.16,runs:[[0,48,18],[1,47,24],[2,47,27],[3,51,26],[4,54,26],[5,55,27],[6,57,26],[7,59,25],[8,60,26],[9,60,26],[10,61,26],[11,61,26],[12,61,27],[13,60,28],[14,59,28],[15,58,29],[16,55,32],[17,53,34],[18,50,37],[19,47,40],[20,45,15],[20,70,17],[21,43,13],[21,71,16],[22,40,12],[22,71,16],[23,38,10],[23,71,15],[24,35,8],[24,71,13],[25,32,11],[25,71,12],[26,29,13],[26,71,11],[27,10,1],[27,27,14],[27,71,10],[28,6,6],[28,23,17],[28,70,10],[29,3,11],[29,15,22],[29,69,10],[30,3,30],[30,69,9],[31,2,29],[31,69,7],[32,2,26],[32,72,3],[33,2,24],[34,4,21],[35,5,18],[36,6,16],[37,6,15],[38,6,10],[38,19,1],[39,5,8],[40,5,5],[41,4,4],[42,3,4],[43,2,3],[44,2,3],[45,1,2],[46,0,2],[47,0,1]]}],silver:[{id:"silver-0",area:232,bounds:{x:296,y:126,w:60,h:26},grip:{x:355.5,y:146.5},axis:{x:-.7203202134914811,y:.6936416870658707},length:35,duration:2.1,runs:[[0,0,2],[1,0,4],[2,1,4],[3,1,5],[4,1,6],[5,2,7],[6,2,8],[7,3,9],[8,4,9],[9,4,10],[10,5,10],[11,5,11],[12,6,12],[13,6,14],[14,7,14],[15,8,13],[16,8,12],[17,10,7],[18,54,4],[19,50,9],[20,47,13],[21,41,15],[22,41,13],[23,41,10],[24,42,7],[25,43,4]]},{id:"silver-1",area:2598,bounds:{x:256,y:270,w:97,h:59},grip:{x:328.5,y:270.5},axis:{x:-.594754958787551,y:.8039070462420506},length:89,duration:2.21,runs:[[0,25,4],[0,68,5],[1,23,7],[1,67,7],[2,22,9],[2,67,8],[3,22,10],[3,66,9],[4,22,12],[4,36,6],[4,56,7],[4,65,11],[5,22,22],[5,55,21],[6,22,23],[6,54,22],[7,16,30],[7,53,23],[8,16,32],[8,52,28],[9,15,65],[10,15,65],[11,14,66],[12,14,68],[13,14,69],[14,14,69],[15,13,70],[16,13,71],[17,13,71],[18,12,73],[19,12,73],[20,12,74],[21,11,75],[22,11,76],[23,10,77],[24,10,78],[25,10,78],[26,9,80],[27,9,80],[28,9,22],[28,48,42],[29,9,22],[29,49,41],[30,8,22],[30,67,23],[31,8,21],[31,72,19],[32,8,21],[32,75,16],[33,7,23],[33,78,14],[34,7,24],[34,81,11],[35,7,24],[35,83,9],[36,6,27],[36,84,9],[37,6,28],[37,85,8],[38,6,28],[38,87,7],[39,6,27],[39,87,7],[40,5,27],[40,88,6],[41,5,26],[41,88,7],[42,5,24],[42,89,6],[43,4,24],[43,89,6],[44,4,23],[44,88,8],[45,3,23],[45,88,8],[46,3,21],[46,88,8],[47,3,20],[47,88,9],[48,3,18],[48,88,9],[49,3,17],[49,88,9],[50,2,16],[50,88,8],[51,2,13],[51,88,7],[52,1,14],[52,88,6],[53,1,13],[53,89,3],[54,1,12],[55,0,13],[56,0,12],[57,2,9],[58,3,4]]}],skin:[{id:"skin-0",area:3339,bounds:{x:268,y:141,w:85,h:65},grip:{x:349.5,y:161.5},axis:{x:-.5071649822938563,y:.8618489895189716},length:65,duration:2.24,runs:[[0,14,4],[1,13,7],[2,13,8],[3,13,10],[4,12,13],[5,12,15],[6,12,16],[7,11,21],[8,11,22],[9,10,24],[10,10,24],[11,10,25],[12,9,28],[13,9,29],[14,8,31],[15,8,32],[16,8,34],[17,7,36],[18,7,37],[19,6,39],[20,6,40],[20,77,5],[21,5,43],[21,74,9],[22,5,44],[22,70,14],[23,5,45],[23,68,17],[24,4,47],[24,65,20],[25,4,48],[25,62,23],[26,4,49],[26,60,24],[27,3,81],[28,3,80],[29,2,81],[30,2,81],[31,2,80],[32,1,81],[33,0,82],[34,0,81],[35,0,81],[36,0,80],[37,0,80],[38,0,80],[39,0,79],[40,0,79],[41,0,78],[42,1,77],[43,2,76],[44,2,76],[45,3,74],[46,4,73],[47,5,72],[48,6,70],[49,7,69],[50,9,65],[51,12,61],[52,13,59],[53,14,56],[54,15,54],[55,16,52],[56,17,50],[57,19,48],[58,21,46],[59,24,43],[60,29,37],[61,33,33],[62,38,28],[63,44,21],[64,53,12]]},{id:"skin-1",area:12279,bounds:{x:240,y:323,w:128,h:147},grip:{x:344.5,y:323.5},axis:{x:-.3648291802047958,y:.9310744703143226},length:145,duration:2.41,runs:[[0,103,2],[1,101,6],[2,100,7],[3,99,9],[4,98,11],[5,97,13],[6,54,4],[6,96,16],[7,50,9],[7,95,19],[8,48,12],[8,93,21],[9,45,15],[9,92,22],[10,43,20],[10,91,22],[11,42,23],[11,90,23],[12,40,27],[12,90,23],[13,39,29],[13,89,24],[14,38,31],[14,88,26],[15,37,33],[15,88,26],[16,36,35],[16,87,27],[17,36,36],[17,85,30],[18,36,36],[18,82,33],[19,36,37],[19,80,35],[20,35,80],[21,35,80],[22,35,81],[23,35,81],[24,35,81],[25,35,81],[26,34,82],[27,34,82],[28,34,81],[29,34,81],[30,10,4],[30,34,81],[31,10,5],[31,34,82],[32,10,5],[32,34,82],[33,10,6],[33,34,82],[34,10,6],[34,34,82],[35,9,8],[35,34,82],[36,9,8],[36,34,83],[37,8,11],[37,36,81],[38,8,12],[38,37,80],[39,8,13],[39,37,80],[40,8,13],[40,37,82],[40,123,4],[41,8,14],[41,37,83],[41,121,6],[42,8,15],[42,37,91],[43,8,15],[43,37,91],[44,7,17],[44,37,91],[45,7,18],[45,37,90],[46,7,18],[46,37,90],[47,7,18],[47,37,91],[48,6,19],[48,37,91],[49,6,19],[49,37,91],[50,6,20],[50,37,91],[51,6,22],[51,37,91],[52,6,23],[52,36,92],[53,6,26],[53,36,92],[54,5,123],[55,5,123],[56,5,123],[57,5,123],[58,5,123],[59,4,124],[60,4,123],[61,4,123],[62,4,123],[63,4,123],[64,4,123],[65,4,123],[66,4,119],[66,125,1],[67,3,120],[68,3,121],[69,3,121],[70,3,121],[71,3,121],[72,3,121],[73,2,122],[74,2,122],[75,2,122],[76,2,122],[77,2,122],[78,2,122],[79,2,123],[80,2,123],[81,2,123],[82,2,123],[83,2,123],[84,1,124],[85,1,124],[86,1,124],[87,1,124],[88,1,123],[89,1,123],[90,1,70],[90,75,48],[91,1,65],[91,78,45],[92,1,62],[92,80,42],[93,1,61],[93,83,6],[93,94,28],[94,0,61],[94,96,25],[95,0,60],[95,98,23],[96,0,59],[96,100,20],[97,0,58],[97,105,15],[98,0,58],[98,106,14],[99,0,57],[99,106,13],[100,0,57],[100,107,12],[101,0,57],[101,107,12],[102,0,56],[102,85,4],[102,108,11],[103,0,56],[103,79,14],[103,109,9],[104,0,56],[104,74,23],[104,111,7],[105,0,55],[105,70,32],[105,110,8],[106,0,55],[106,66,42],[106,111,7],[107,0,55],[107,63,55],[108,0,54],[108,60,58],[109,4,29],[109,36,16],[109,56,62],[110,9,5],[110,17,9],[110,37,16],[110,56,62],[111,38,16],[111,55,63],[112,38,80],[113,38,80],[114,38,80],[115,38,80],[116,38,3],[116,45,73],[117,45,73],[118,45,73],[119,45,73],[120,45,72],[121,45,72],[122,45,72],[123,45,71],[124,47,69],[125,48,68],[126,49,66],[127,50,64],[128,51,63],[129,52,61],[130,54,59],[131,55,57],[132,56,55],[133,58,53],[134,59,51],[135,61,49],[136,64,45],[137,65,44],[138,70,38],[139,71,36],[140,72,34],[141,73,32],[142,74,30],[143,76,25],[144,78,20],[145,80,14],[146,89,1]]},{id:"skin-2",area:2852,bounds:{x:491,y:640,w:74,h:52},grip:{x:547.5,y:643.5},axis:{x:-.53928345358198,y:.8421243118997885},length:66,duration:2.22,runs:[[0,32,6],[1,29,11],[2,28,13],[3,26,18],[3,54,3],[4,24,21],[4,53,5],[5,22,26],[5,50,9],[6,21,38],[7,19,41],[8,17,44],[9,16,46],[10,14,49],[11,12,51],[12,10,55],[13,9,58],[14,8,60],[15,7,61],[16,6,63],[17,5,65],[18,5,66],[19,4,67],[20,4,67],[21,3,69],[22,3,69],[23,2,71],[24,2,72],[25,2,71],[26,2,70],[27,1,69],[28,1,69],[29,1,69],[30,1,65],[30,68,1],[31,1,64],[32,1,64],[33,1,64],[34,1,64],[35,1,64],[36,0,65],[37,0,65],[38,0,65],[39,0,65],[40,0,65],[41,0,65],[42,0,65],[43,2,63],[44,3,61],[45,4,60],[46,5,26],[46,33,31],[47,6,23],[47,34,30],[48,7,20],[48,36,28],[49,8,17],[49,37,27],[50,9,12],[50,40,24],[51,14,3],[51,44,10],[51,57,4]]},{id:"skin-3",area:6084,bounds:{x:207,y:639,w:145,h:71},grip:{x:337.5,y:672.5},axis:{x:-.6766632787177169,y:.7362926097924584},length:100,duration:2.3,runs:[[0,50,5],[1,41,16],[2,40,19],[3,38,23],[4,27,3],[4,34,28],[5,24,7],[5,32,32],[6,22,43],[7,19,48],[8,18,49],[9,16,52],[10,15,54],[11,14,58],[12,13,62],[12,88,3],[12,95,2],[13,12,88],[14,11,91],[15,10,93],[16,9,95],[17,8,97],[18,7,100],[19,6,103],[20,6,105],[21,5,108],[22,5,110],[23,4,112],[24,4,113],[25,3,115],[26,3,117],[27,2,119],[28,2,120],[29,2,121],[30,1,124],[31,1,126],[32,1,128],[33,1,130],[34,0,132],[35,0,132],[36,0,133],[37,0,133],[38,0,134],[39,0,135],[40,0,136],[41,0,136],[42,0,138],[43,0,139],[44,0,141],[45,0,142],[46,0,144],[47,0,11],[47,14,131],[48,27,118],[49,31,113],[50,38,6],[50,46,98],[51,48,95],[52,50,92],[53,52,88],[54,55,84],[55,58,80],[56,61,75],[57,71,3],[57,76,59],[58,77,56],[59,79,51],[60,80,47],[61,81,41],[62,82,40],[63,84,38],[64,85,36],[65,86,35],[66,89,31],[67,100,20],[68,102,17],[69,104,14],[70,106,11]]}],gold:[{id:"gold-0",area:310,bounds:{x:286,y:233,w:31,h:22},grip:{x:301.5,y:234.5},axis:{x:-.5355086372360844,y:.8445297504798465},length:25,duration:2.11,runs:[[0,12,2],[1,11,5],[2,11,6],[3,10,7],[4,10,7],[5,9,9],[6,8,13],[7,6,16],[8,6,16],[9,5,19],[10,4,20],[11,4,21],[12,3,23],[13,2,9],[13,13,5],[13,21,6],[14,1,9],[14,21,7],[15,1,9],[15,22,7],[16,0,10],[16,22,8],[17,0,9],[17,22,9],[18,0,9],[18,22,9],[19,0,9],[19,23,8],[20,1,8],[20,23,7],[21,5,3],[21,23,5]]},{id:"gold-1",area:772,bounds:{x:238,y:432,w:40,h:30},grip:{x:275.5,y:432.5},axis:{x:-.5144957554275266,y:.8574929257125442},length:45,duration:2.14,runs:[[0,2,4],[0,35,3],[1,2,9],[1,16,3],[1,28,11],[2,2,38],[3,2,38],[4,1,39],[5,1,39],[6,1,39],[7,1,39],[8,1,39],[9,1,39],[10,1,37],[11,1,36],[12,1,34],[13,1,32],[14,1,31],[15,1,29],[16,1,27],[17,1,26],[18,0,26],[19,0,25],[20,0,24],[21,0,23],[22,0,22],[23,0,16],[24,0,13],[25,0,11],[26,0,8],[27,0,6],[28,0,4],[29,0,2]]},{id:"gold-2",area:18805,bounds:{x:276,y:442,w:126,h:245},grip:{x:364.5,y:442.5},axis:{x:-.22546934644440483,y:.9742502624140948},length:242,duration:2.49,runs:[[0,82,7],[1,81,9],[2,81,10],[3,81,11],[4,80,12],[5,9,2],[5,80,13],[6,8,4],[6,80,13],[7,8,5],[7,79,14],[8,8,6],[8,78,16],[9,8,7],[9,78,16],[10,7,9],[10,77,18],[11,7,11],[11,77,18],[12,7,12],[12,76,20],[13,7,13],[13,75,21],[14,7,15],[14,75,22],[15,7,16],[15,74,23],[16,7,18],[16,74,24],[17,6,22],[17,73,25],[18,6,23],[18,73,26],[19,6,28],[19,72,27],[20,6,29],[20,71,29],[21,6,30],[21,70,30],[22,6,31],[22,69,31],[23,6,32],[23,68,33],[24,6,34],[24,65,36],[25,6,36],[25,62,40],[26,6,38],[26,58,44],[27,6,47],[27,54,48],[28,6,96],[29,6,47],[29,55,48],[30,5,48],[30,59,44],[31,5,47],[31,61,42],[32,5,46],[32,62,42],[33,5,45],[33,63,42],[34,5,44],[34,64,41],[35,6,42],[35,65,41],[36,5,43],[36,66,40],[37,4,43],[37,67,39],[38,4,43],[38,68,38],[39,4,42],[39,69,38],[40,4,41],[40,69,38],[41,4,41],[41,70,38],[42,4,40],[42,71,37],[43,4,39],[43,72,36],[44,3,40],[44,73,36],[45,3,39],[45,74,35],[46,3,39],[46,75,34],[47,3,38],[47,76,34],[48,3,37],[48,76,34],[49,3,37],[49,77,34],[50,3,37],[50,78,33],[51,3,37],[51,79,32],[52,3,37],[52,80,31],[53,3,37],[53,80,32],[54,3,36],[54,81,31],[55,2,37],[55,82,30],[56,2,37],[56,82,31],[57,2,36],[57,83,30],[58,2,36],[58,84,29],[59,2,35],[59,85,29],[60,2,35],[60,85,29],[61,2,35],[61,86,28],[62,2,34],[62,87,27],[63,2,34],[63,89,26],[64,2,33],[64,89,26],[65,2,33],[65,89,26],[66,1,34],[66,90,26],[67,1,33],[67,56,2],[67,90,26],[68,1,33],[68,56,4],[68,91,25],[69,1,32],[69,55,6],[69,91,25],[70,1,32],[70,55,7],[70,92,25],[71,1,32],[71,55,7],[71,93,24],[72,1,31],[72,55,7],[72,93,24],[73,1,31],[73,55,8],[73,94,23],[74,1,31],[74,55,8],[74,95,23],[75,1,30],[75,55,8],[75,95,23],[76,1,30],[76,55,8],[76,96,22],[77,1,30],[77,55,9],[77,96,22],[78,1,29],[78,55,9],[78,97,21],[79,1,29],[79,55,9],[79,97,22],[80,1,29],[80,55,9],[80,98,21],[81,1,28],[81,55,10],[81,98,21],[82,1,28],[82,55,10],[82,99,20],[83,0,29],[83,55,10],[83,100,20],[84,0,28],[84,55,10],[84,100,20],[85,0,28],[85,55,11],[85,101,19],[86,0,28],[86,55,11],[86,102,18],[87,0,27],[87,56,10],[87,102,19],[88,0,27],[88,56,10],[88,102,19],[89,0,27],[89,57,9],[89,102,19],[90,0,27],[90,58,8],[90,101,20],[91,0,27],[91,58,9],[91,101,20],[92,0,28],[92,58,9],[92,100,21],[93,0,28],[93,58,9],[93,100,21],[94,0,28],[94,58,9],[94,99,23],[95,0,29],[95,59,9],[95,99,23],[96,0,30],[96,59,9],[96,98,24],[97,0,31],[97,59,9],[97,98,24],[98,0,31],[98,59,9],[98,97,25],[99,0,32],[99,59,9],[99,97,25],[100,0,33],[100,59,9],[100,96,26],[101,0,34],[101,59,10],[101,96,27],[102,0,34],[102,59,10],[102,95,28],[103,0,35],[103,59,10],[103,95,28],[104,0,36],[104,59,10],[104,94,29],[105,0,37],[105,60,9],[105,94,29],[106,1,37],[106,60,10],[106,94,29],[107,1,37],[107,60,10],[107,94,29],[108,1,38],[108,60,10],[108,95,28],[109,1,38],[109,60,10],[109,95,29],[110,1,39],[110,60,10],[110,96,28],[111,1,38],[111,60,11],[111,97,27],[112,1,38],[112,60,11],[112,97,27],[113,1,38],[113,60,11],[113,97,27],[114,1,38],[114,60,11],[114,97,27],[115,1,38],[115,60,11],[115,98,26],[116,1,37],[116,60,12],[116,98,26],[117,1,37],[117,60,12],[117,98,26],[118,1,37],[118,61,11],[118,99,25],[119,1,37],[119,61,11],[119,99,26],[120,1,37],[120,61,11],[120,99,26],[121,2,36],[121,61,12],[121,99,26],[122,2,36],[122,61,12],[122,100,25],[123,2,36],[123,61,12],[123,100,25],[124,2,36],[124,61,12],[124,100,25],[125,2,35],[125,61,12],[125,100,25],[126,2,35],[126,61,13],[126,100,25],[127,2,35],[127,62,12],[127,100,25],[128,2,35],[128,62,12],[128,100,25],[129,2,35],[129,62,12],[129,100,25],[130,2,35],[130,62,12],[130,99,26],[131,3,34],[131,62,13],[131,99,26],[132,3,34],[132,62,13],[132,98,27],[133,3,34],[133,62,13],[133,97,29],[134,3,34],[134,62,13],[134,97,29],[135,3,33],[135,63,12],[135,96,30],[136,3,33],[136,63,12],[136,95,31],[137,3,33],[137,63,13],[137,95,31],[138,4,32],[138,63,13],[138,94,32],[139,4,34],[139,63,13],[139,94,32],[140,4,35],[140,63,13],[140,93,33],[141,4,36],[141,63,13],[141,92,34],[142,4,38],[142,63,14],[142,91,35],[143,4,39],[143,64,13],[143,91,35],[144,5,39],[144,64,13],[144,90,36],[145,5,41],[145,64,13],[145,89,37],[146,5,42],[146,64,13],[146,88,38],[147,5,44],[147,64,13],[147,88,38],[148,5,45],[148,64,13],[148,87,39],[149,5,47],[149,64,13],[149,86,40],[150,6,47],[150,64,13],[150,85,41],[151,6,49],[151,64,13],[151,84,42],[152,6,51],[152,65,12],[152,84,42],[153,6,52],[153,65,12],[153,83,43],[154,6,53],[154,64,14],[154,82,44],[155,7,54],[155,64,14],[155,82,44],[156,7,71],[156,81,45],[157,7,119],[158,7,119],[159,7,119],[160,8,118],[161,8,118],[162,8,118],[163,8,118],[164,8,118],[165,9,117],[166,9,117],[167,9,117],[168,9,117],[169,10,116],[170,10,116],[171,10,116],[172,10,116],[173,11,115],[174,11,115],[175,11,115],[176,12,114],[177,12,113],[178,12,113],[179,12,113],[180,12,113],[181,13,112],[182,13,112],[183,13,112],[184,14,111],[185,14,111],[186,14,111],[187,14,111],[188,15,110],[189,15,110],[190,15,110],[191,16,108],[192,16,108],[193,16,108],[194,16,108],[195,16,108],[196,16,108],[197,16,108],[198,16,109],[199,17,109],[200,17,109],[201,18,107],[202,18,107],[203,18,107],[204,19,106],[205,19,105],[206,20,104],[207,20,104],[208,20,104],[209,22,4],[209,28,96],[210,31,92],[211,33,90],[212,34,89],[213,35,87],[214,36,86],[215,38,84],[216,40,82],[217,42,80],[218,44,77],[219,46,75],[220,47,74],[221,48,73],[222,49,72],[223,51,70],[224,52,68],[225,53,67],[226,54,66],[227,56,63],[228,58,61],[229,60,59],[230,62,57],[231,63,56],[232,63,56],[233,64,55],[234,64,55],[235,65,54],[236,66,53],[237,67,52],[238,67,52],[239,69,50],[240,70,49],[241,72,47],[242,73,46],[243,75,44],[244,76,27],[244,105,4]]}],tie:[{id:"tie-0",area:5527,bounds:{x:303,y:471,w:75,h:128},grip:{x:334.5,y:472.5},axis:{x:-.2549580754340903,y:.9669521083129944},length:122,duration:2.29,runs:[[0,26,2],[1,26,6],[2,25,9],[3,24,11],[4,23,13],[5,22,15],[6,21,17],[7,21,18],[8,20,20],[9,20,21],[10,19,23],[11,18,24],[12,18,25],[13,17,27],[14,16,29],[15,16,30],[16,15,32],[17,15,33],[18,14,35],[19,13,36],[20,13,37],[21,13,38],[22,13,39],[23,13,40],[24,13,40],[25,12,42],[26,12,43],[27,12,43],[28,11,45],[29,11,46],[30,10,48],[31,10,48],[32,10,49],[33,9,51],[34,9,53],[35,8,54],[36,8,54],[37,8,55],[38,7,22],[38,31,32],[39,7,22],[39,33,31],[40,6,22],[40,34,30],[41,6,22],[41,35,30],[42,6,22],[42,35,31],[43,5,23],[43,35,31],[44,5,23],[44,36,31],[45,5,23],[45,36,32],[46,4,24],[46,36,32],[47,4,24],[47,36,33],[48,4,24],[48,37,32],[49,3,25],[49,37,33],[50,3,25],[50,37,33],[51,3,25],[51,37,34],[52,2,26],[52,38,33],[53,2,26],[53,38,34],[54,2,26],[54,38,35],[55,1,27],[55,38,35],[56,1,27],[56,39,35],[57,1,27],[57,39,36],[58,0,29],[58,39,36],[59,0,29],[59,39,36],[60,0,30],[60,39,36],[61,0,31],[61,39,35],[62,0,31],[62,40,34],[63,1,30],[63,40,33],[64,1,30],[64,40,33],[65,1,30],[65,40,32],[66,2,30],[66,41,31],[67,3,29],[67,41,30],[68,4,28],[68,41,30],[69,4,28],[69,41,29],[70,5,27],[70,41,29],[71,6,26],[71,41,28],[72,7,25],[72,42,27],[73,7,25],[73,42,26],[74,8,24],[74,42,26],[75,9,23],[75,42,25],[76,10,23],[76,42,25],[77,11,22],[77,43,24],[78,11,22],[78,43,24],[79,12,21],[79,43,25],[80,12,21],[80,43,25],[81,13,20],[81,43,26],[82,12,21],[82,44,26],[83,12,21],[83,44,26],[84,12,21],[84,44,26],[85,12,21],[85,44,26],[86,12,21],[86,44,27],[87,11,22],[87,45,26],[88,11,22],[88,45,26],[89,11,23],[89,45,27],[90,11,23],[90,45,27],[91,11,23],[91,45,27],[92,11,23],[92,46,26],[93,11,23],[93,46,27],[94,11,23],[94,46,27],[95,11,23],[95,46,27],[96,10,24],[96,46,27],[97,10,24],[97,47,26],[98,10,25],[98,47,26],[99,10,25],[99,47,26],[100,10,25],[100,47,26],[101,10,25],[101,47,25],[102,10,25],[102,48,24],[103,10,25],[103,48,23],[104,10,25],[104,48,22],[105,10,25],[105,48,22],[106,9,27],[106,48,21],[107,9,27],[107,48,20],[108,9,27],[108,49,19],[109,9,27],[109,49,18],[110,11,25],[110,49,18],[111,12,24],[111,49,17],[112,13,23],[112,49,16],[113,15,21],[113,50,14],[114,16,21],[114,50,14],[115,17,20],[115,50,13],[116,19,18],[116,50,12],[117,20,17],[117,50,11],[118,22,15],[118,50,11],[119,23,14],[119,50,10],[120,25,12],[120,50,9],[121,26,11],[121,50,8],[122,28,9],[122,50,7],[123,30,8],[123,50,7],[124,31,7],[124,50,6],[125,32,5],[125,51,4],[126,34,3],[126,51,4],[127,51,3]]}],purple:[{id:"purple-0",area:23864,bounds:{x:362,y:438,w:185,h:248},grip:{x:481.5,y:474.5},axis:{x:-.31823393914138676,y:.9480122150998668},length:229,duration:2.55,runs:[[0,3,3],[1,2,5],[2,1,8],[3,0,11],[4,3,10],[5,4,15],[6,5,18],[7,6,19],[8,6,20],[9,7,20],[10,7,21],[11,7,23],[12,8,23],[13,8,31],[14,9,33],[15,9,37],[16,10,38],[17,10,42],[18,11,44],[19,11,48],[20,12,50],[21,12,53],[22,13,56],[23,13,60],[24,14,62],[25,14,63],[26,14,64],[27,15,64],[28,15,68],[29,16,71],[30,16,74],[30,101,1],[31,16,89],[32,16,92],[33,17,94],[34,17,97],[35,17,100],[36,18,102],[37,19,103],[38,19,104],[39,20,104],[40,20,104],[41,20,104],[42,20,104],[43,21,104],[44,21,104],[45,22,103],[46,22,104],[47,22,105],[48,23,104],[49,23,104],[50,23,105],[51,24,104],[52,24,105],[53,25,104],[54,25,104],[55,25,104],[56,25,104],[57,26,104],[58,26,104],[59,26,104],[60,27,103],[61,27,103],[62,27,104],[63,28,103],[64,28,103],[65,28,103],[66,28,103],[67,29,103],[68,29,103],[69,29,103],[70,30,102],[71,30,102],[72,30,103],[73,30,103],[74,31,102],[75,31,102],[76,31,102],[77,31,103],[78,32,102],[79,32,102],[80,32,102],[81,32,102],[82,32,102],[83,33,101],[84,33,101],[85,33,102],[86,33,102],[87,34,101],[88,34,101],[89,34,101],[90,34,101],[91,35,100],[92,35,101],[93,35,101],[94,35,101],[95,35,101],[96,35,101],[97,35,101],[98,36,100],[99,36,100],[100,36,100],[101,36,100],[102,36,101],[103,36,101],[104,36,101],[105,37,100],[106,37,100],[107,37,100],[108,37,101],[109,37,101],[110,37,101],[111,37,101],[112,37,101],[113,38,100],[114,38,100],[115,38,100],[116,38,100],[117,38,100],[118,38,101],[119,38,101],[120,38,101],[121,38,101],[122,38,101],[123,39,100],[124,39,100],[125,39,100],[126,39,101],[127,39,101],[128,39,101],[129,39,101],[130,39,101],[131,39,101],[132,39,101],[133,39,102],[134,39,102],[135,39,102],[136,39,102],[137,40,101],[138,40,101],[139,40,101],[140,40,102],[141,40,102],[142,40,102],[143,40,102],[144,40,102],[145,40,103],[146,40,103],[147,40,103],[148,40,103],[149,40,104],[150,40,104],[151,40,104],[152,40,105],[153,40,105],[154,40,105],[155,40,105],[156,40,106],[157,40,106],[158,40,107],[159,40,107],[160,40,107],[161,40,108],[162,40,109],[163,40,109],[164,40,110],[165,40,111],[166,40,111],[167,40,112],[168,40,113],[169,40,114],[170,40,115],[171,40,117],[172,40,119],[173,40,121],[174,40,123],[175,40,124],[176,40,125],[177,40,126],[178,40,127],[179,40,128],[180,40,129],[181,39,131],[182,39,132],[183,39,133],[184,39,133],[185,39,134],[186,39,135],[187,39,136],[188,39,136],[189,39,137],[190,39,138],[191,39,138],[192,39,139],[193,39,140],[194,39,140],[195,38,142],[196,38,143],[197,38,143],[198,38,144],[199,38,144],[200,38,145],[201,38,145],[202,39,122],[202,167,17],[203,40,118],[203,169,15],[204,40,117],[204,170,15],[205,39,116],[205,173,10],[206,39,114],[206,174,8],[207,39,112],[207,177,2],[208,39,111],[209,38,110],[210,38,108],[211,38,107],[212,38,105],[213,38,103],[214,37,102],[215,37,101],[216,37,100],[217,36,100],[218,36,99],[219,36,98],[220,36,51],[220,88,46],[221,36,50],[221,89,44],[222,35,49],[222,90,43],[223,35,48],[223,90,42],[224,35,47],[224,91,41],[225,35,47],[225,91,40],[226,35,47],[226,91,40],[227,35,46],[227,91,40],[228,34,47],[228,92,39],[229,34,47],[229,92,38],[230,34,46],[230,93,37],[231,33,47],[231,93,37],[232,33,47],[232,93,37],[233,33,47],[233,94,36],[234,33,46],[234,94,36],[235,33,46],[235,94,36],[236,33,45],[236,95,35],[237,33,45],[237,95,35],[238,33,44],[238,96,33],[239,33,43],[239,97,32],[240,33,42],[240,97,32],[241,33,42],[241,98,31],[242,33,41],[242,98,31],[243,33,41],[243,99,30],[244,33,40],[244,99,28],[245,33,40],[245,100,20],[246,33,39],[247,33,20]]},{id:"purple-1",area:25335,bounds:{x:134,y:439,w:162,h:250},grip:{x:284.5,y:439.5},axis:{x:-.2799410160146266,y:.9600172016962503},length:278,duration:2.56,runs:[[0,147,4],[1,144,7],[2,144,7],[3,142,9],[4,141,10],[5,139,12],[6,137,14],[7,136,15],[8,134,17],[9,132,18],[10,131,19],[11,130,20],[12,129,21],[13,128,21],[14,127,22],[15,126,23],[16,120,29],[17,117,32],[18,115,34],[19,112,37],[20,110,38],[21,108,40],[22,106,42],[23,105,43],[24,103,45],[25,102,46],[26,100,48],[27,98,50],[28,95,53],[29,90,58],[30,86,62],[31,83,65],[32,81,67],[33,79,68],[34,76,71],[35,74,73],[36,71,76],[37,69,78],[38,67,81],[39,64,83],[40,62,84],[41,60,86],[42,58,88],[43,55,91],[44,53,93],[45,50,96],[46,48,98],[47,46,99],[48,44,101],[49,41,104],[50,39,106],[51,36,109],[52,34,111],[53,34,111],[54,32,113],[55,31,114],[56,29,116],[57,27,118],[58,24,120],[59,22,122],[60,19,83],[60,105,39],[61,16,83],[61,107,37],[62,14,83],[62,107,37],[63,14,82],[63,108,36],[64,14,81],[64,108,7],[64,118,26],[65,13,72],[65,87,6],[65,108,3],[65,118,26],[66,10,75],[66,88,4],[66,118,26],[67,10,74],[67,89,4],[67,118,26],[68,9,74],[68,91,2],[68,118,26],[69,9,74],[69,118,25],[70,9,73],[70,118,25],[71,8,74],[71,119,4],[71,127,16],[72,8,74],[72,127,16],[73,8,71],[73,127,16],[74,8,66],[74,128,15],[75,7,67],[75,128,15],[76,7,67],[76,127,16],[77,7,67],[77,127,16],[78,6,68],[78,126,17],[79,6,69],[79,127,16],[80,6,69],[80,130,13],[81,6,69],[81,76,1],[81,132,11],[82,6,68],[82,134,9],[83,5,69],[83,133,10],[84,5,68],[84,132,11],[85,5,66],[85,131,12],[86,5,65],[86,131,11],[87,5,66],[87,131,11],[88,5,68],[88,128,14],[89,4,70],[89,128,14],[90,4,70],[90,131,11],[91,4,70],[91,130,12],[92,4,72],[92,130,12],[93,4,72],[93,130,12],[94,4,72],[94,131,11],[95,3,71],[95,130,12],[96,3,72],[96,129,13],[97,3,72],[97,128,14],[98,3,71],[98,124,3],[98,128,14],[99,3,71],[99,124,18],[100,3,74],[100,124,18],[101,2,76],[101,124,18],[102,2,77],[102,123,19],[103,2,80],[103,122,20],[104,2,80],[104,122,20],[105,2,81],[105,122,20],[106,2,81],[106,122,20],[107,2,81],[107,113,1],[107,117,1],[107,122,20],[108,2,80],[108,113,2],[108,116,2],[108,121,21],[109,2,81],[109,112,6],[109,119,24],[110,1,88],[110,101,2],[110,112,31],[111,1,90],[111,100,3],[111,113,30],[112,1,91],[112,100,3],[112,106,1],[112,112,31],[113,1,92],[113,100,7],[113,112,31],[114,1,94],[114,101,7],[114,110,33],[115,1,95],[115,98,45],[116,1,142],[117,1,142],[118,1,142],[119,1,142],[120,1,142],[121,1,142],[122,1,142],[123,1,142],[124,0,144],[125,0,144],[126,0,144],[127,0,144],[128,0,144],[129,0,144],[130,0,144],[131,0,144],[132,0,144],[133,0,144],[134,0,145],[135,0,145],[136,0,145],[137,0,145],[138,0,145],[139,0,145],[140,0,145],[141,0,146],[142,0,146],[143,0,146],[144,1,145],[145,1,145],[146,1,145],[147,1,146],[148,1,146],[149,1,146],[150,1,146],[151,1,146],[152,1,146],[153,1,147],[154,1,147],[155,1,147],[156,1,147],[157,1,147],[158,1,148],[159,1,148],[160,1,148],[161,1,148],[162,1,148],[163,1,149],[164,1,149],[165,1,149],[166,1,149],[167,2,148],[168,2,149],[169,2,149],[170,2,149],[171,2,149],[172,2,150],[173,2,150],[174,2,150],[175,2,150],[176,2,151],[177,2,151],[178,2,151],[179,3,151],[180,3,151],[181,3,151],[182,3,151],[183,3,151],[184,3,152],[185,3,152],[186,3,152],[187,3,153],[188,3,153],[189,3,153],[190,4,152],[191,4,153],[192,4,153],[193,4,153],[194,4,154],[195,4,154],[196,4,154],[197,4,154],[198,4,154],[199,4,154],[200,4,119],[200,128,30],[201,4,110],[201,130,28],[202,4,109],[202,132,27],[203,5,106],[203,134,25],[204,5,95],[204,103,4],[204,135,25],[205,5,92],[205,104,1],[205,137,23],[206,5,90],[206,138,22],[207,5,87],[207,140,21],[208,6,85],[208,140,21],[209,6,83],[209,141,21],[210,6,82],[210,142,20],[211,6,81],[211,145,17],[212,6,80],[212,148,13],[213,6,79],[214,6,78],[215,7,76],[216,7,75],[217,7,74],[218,7,73],[219,7,72],[220,8,71],[221,8,70],[222,8,70],[223,8,69],[224,8,69],[225,9,67],[226,9,67],[227,9,66],[228,9,66],[229,9,66],[230,10,64],[231,10,64],[232,10,64],[233,10,64],[234,11,62],[235,11,62],[236,11,62],[237,11,62],[238,12,61],[239,12,61],[240,12,61],[241,13,60],[242,13,60],[243,13,60],[244,13,60],[245,14,59],[246,14,59],[247,15,58],[248,16,49],[249,17,11]]}],pink:[{id:"pink-0",area:2282,bounds:{x:204,y:499,w:64,h:56},grip:{x:251.5,y:503.5},axis:{x:-.45734801262076136,y:.8892878023181471},length:57,duration:2.2,runs:[[0,32,3],[1,29,8],[2,27,10],[3,26,12],[4,25,13],[4,45,3],[5,15,2],[5,23,15],[5,41,7],[6,15,3],[6,22,26],[7,14,5],[7,23,25],[8,13,8],[8,23,25],[9,13,35],[10,12,36],[11,12,37],[11,53,4],[12,12,45],[13,9,48],[14,4,54],[15,4,54],[16,4,53],[17,4,53],[18,4,52],[19,5,52],[20,5,55],[21,5,1],[21,7,55],[22,4,60],[23,4,59],[24,3,59],[25,1,60],[26,0,61],[27,1,60],[28,3,55],[29,4,54],[30,4,57],[31,4,56],[32,6,54],[33,6,54],[34,6,55],[35,4,56],[36,5,54],[37,5,53],[38,4,50],[38,57,1],[39,4,50],[40,7,47],[41,8,46],[42,9,44],[43,12,40],[44,12,40],[45,13,39],[46,13,39],[47,13,30],[47,44,3],[47,48,4],[48,12,31],[48,45,1],[48,48,3],[49,13,29],[49,48,1],[50,19,12],[50,33,9],[51,21,9],[51,33,10],[52,22,8],[52,33,3],[52,37,5],[53,23,7],[53,37,5],[54,25,6],[54,38,2],[55,26,2]]}],background:[{id:"background-0",area:275476,bounds:{x:0,y:0,w:600,h:800},grip:{x:599.5,y:.5},axis:{x:-.31977864415817975,y:.9474922789871992},length:950,duration:3,runs:[[0,0,600],[1,0,600],[2,0,600],[3,0,600],[4,0,600],[5,0,600],[6,0,600],[7,0,600],[8,0,600],[9,0,600],[10,0,600],[11,0,600],[12,0,600],[13,0,600],[14,0,600],[15,0,600],[16,0,600],[17,0,600],[18,0,600],[19,0,600],[20,0,600],[21,0,600],[22,0,600],[23,0,600],[24,0,600],[25,0,600],[26,0,600],[27,0,600],[28,0,600],[29,0,600],[30,0,600],[31,0,600],[32,0,600],[33,0,600],[34,0,600],[35,0,600],[36,0,600],[37,0,600],[38,0,600],[39,0,600],[40,0,600],[41,0,600],[42,0,600],[43,0,600],[44,0,600],[45,0,600],[46,0,600],[47,0,600],[48,0,600],[49,0,600],[50,0,600],[51,0,600],[52,0,600],[53,0,600],[54,0,295],[54,296,304],[55,0,294],[55,298,302],[56,0,292],[56,299,301],[57,0,291],[57,299,301],[58,0,290],[58,300,300],[59,0,290],[59,300,300],[60,0,289],[60,300,300],[61,0,289],[61,300,300],[62,0,288],[62,301,299],[63,0,288],[63,301,299],[64,0,288],[64,301,299],[65,0,287],[65,301,299],[66,0,287],[66,302,298],[67,0,286],[67,302,298],[68,0,286],[68,302,298],[69,0,285],[69,302,51],[69,354,246],[70,0,285],[70,302,50],[70,355,245],[71,0,284],[71,302,48],[71,356,244],[72,0,284],[72,303,47],[72,357,243],[73,0,284],[73,303,47],[73,357,243],[74,0,283],[74,304,46],[74,357,243],[75,0,283],[75,304,45],[75,357,243],[76,0,282],[76,304,45],[76,357,243],[77,0,282],[77,304,45],[77,357,243],[78,0,281],[78,305,43],[78,357,243],[79,0,281],[79,306,42],[79,357,243],[80,0,280],[80,311,37],[80,357,243],[81,0,280],[81,318,29],[81,357,243],[82,0,280],[82,323,24],[82,358,242],[83,0,279],[83,326,21],[83,358,242],[84,0,279],[84,328,18],[84,358,242],[85,0,278],[85,333,12],[85,358,242],[86,0,278],[86,338,3],[86,358,242],[87,0,277],[87,339,1],[87,358,242],[88,0,277],[88,358,242],[89,0,276],[89,358,242],[90,0,276],[90,358,242],[91,0,276],[91,358,242],[92,0,275],[92,359,241],[93,0,275],[93,359,241],[94,0,274],[94,359,241],[95,0,274],[95,359,241],[96,0,273],[96,359,241],[97,0,273],[97,359,241],[98,0,272],[98,359,241],[99,0,272],[99,359,241],[100,0,272],[100,359,241],[101,0,271],[101,359,241],[102,0,271],[102,360,240],[103,0,270],[103,360,240],[104,0,270],[104,360,240],[105,0,269],[105,360,240],[106,0,269],[106,360,240],[107,0,268],[107,360,240],[108,0,268],[108,360,240],[109,0,268],[109,360,240],[110,0,267],[110,360,240],[111,0,267],[111,360,240],[112,0,266],[112,361,239],[113,0,266],[113,361,239],[114,0,265],[114,361,239],[115,0,265],[115,361,239],[116,0,264],[116,361,239],[117,0,264],[117,361,239],[118,0,264],[118,361,239],[119,0,263],[119,361,239],[120,0,263],[120,361,239],[121,0,262],[121,361,239],[122,0,262],[122,362,238],[123,0,261],[123,362,238],[124,0,261],[124,362,238],[125,0,260],[125,362,238],[126,0,260],[126,362,238],[127,0,260],[127,362,238],[128,0,259],[128,362,238],[129,0,259],[129,362,238],[130,0,258],[130,362,238],[131,0,258],[131,362,238],[132,0,257],[132,363,237],[133,0,257],[133,363,237],[134,0,256],[134,363,237],[135,0,256],[135,363,237],[136,0,256],[136,363,237],[137,0,255],[137,363,237],[138,0,255],[138,363,237],[139,0,254],[139,363,237],[140,0,254],[140,363,237],[141,0,253],[141,362,238],[142,0,253],[142,362,238],[143,0,252],[143,362,238],[144,0,252],[144,362,238],[145,0,252],[145,361,239],[146,0,251],[146,360,240],[147,0,251],[147,359,241],[148,0,250],[148,358,242],[149,0,250],[149,358,242],[150,0,249],[150,358,242],[151,0,249],[151,358,242],[152,0,248],[152,358,242],[153,0,248],[153,358,242],[154,0,247],[154,358,242],[155,0,245],[155,358,242],[156,0,244],[156,357,243],[157,0,243],[157,357,243],[158,0,241],[158,357,243],[159,0,240],[159,357,243],[160,0,239],[160,356,244],[161,0,237],[161,356,244],[162,0,236],[162,355,245],[163,0,235],[163,355,245],[164,0,234],[164,354,246],[165,0,233],[165,353,247],[166,0,232],[166,353,247],[167,0,231],[167,352,248],[168,0,230],[168,352,248],[169,0,229],[169,351,249],[170,0,228],[170,351,249],[171,0,226],[171,351,249],[172,0,225],[172,350,250],[173,0,224],[173,350,250],[174,0,223],[174,350,250],[175,0,221],[175,349,251],[176,0,219],[176,349,251],[177,0,218],[177,348,252],[178,0,217],[178,348,252],[179,0,216],[179,348,252],[180,0,215],[180,347,253],[181,0,213],[181,347,253],[182,0,211],[182,346,254],[183,0,209],[183,346,254],[184,0,207],[184,346,254],[185,0,206],[185,346,254],[186,0,205],[186,345,255],[187,0,203],[187,345,255],[188,0,201],[188,345,255],[189,0,199],[189,344,256],[190,0,196],[190,344,256],[191,0,194],[191,345,255],[192,0,192],[192,346,254],[193,0,189],[193,346,254],[194,0,187],[194,348,252],[195,0,185],[195,349,251],[196,0,183],[196,351,249],[197,0,180],[197,354,246],[198,0,178],[198,356,244],[199,0,176],[199,359,241],[200,0,174],[200,362,238],[201,0,172],[201,364,236],[202,0,169],[202,366,234],[203,0,167],[203,369,231],[204,0,165],[204,372,228],[205,0,163],[205,374,226],[206,0,161],[206,377,223],[207,0,158],[207,379,221],[208,0,156],[208,382,218],[209,0,154],[209,384,216],[210,0,152],[210,387,213],[211,0,149],[211,389,211],[212,0,147],[212,392,208],[213,0,145],[213,394,206],[214,0,143],[214,397,203],[215,0,141],[215,399,201],[216,0,138],[216,401,199],[217,0,136],[217,404,196],[218,0,134],[218,406,194],[219,0,132],[219,409,191],[220,0,129],[220,410,190],[221,0,127],[221,413,187],[222,0,125],[222,415,185],[223,0,123],[223,416,184],[224,0,121],[224,417,183],[225,0,119],[225,418,182],[226,0,118],[226,419,181],[227,0,118],[227,420,180],[228,0,117],[228,420,180],[229,0,116],[229,421,179],[230,0,115],[230,422,178],[231,0,115],[231,423,177],[232,0,114],[232,423,177],[233,0,113],[233,424,176],[234,0,112],[234,424,176],[235,0,112],[235,425,175],[236,0,111],[236,426,174],[237,0,110],[237,427,173],[238,0,109],[238,428,172],[239,0,109],[239,428,172],[240,0,108],[240,429,171],[241,0,107],[241,429,171],[242,0,106],[242,430,170],[243,0,106],[243,430,170],[244,0,105],[244,431,169],[245,0,104],[245,431,169],[246,0,103],[246,432,168],[247,0,103],[247,432,168],[248,0,103],[248,432,168],[249,0,102],[249,432,168],[250,0,101],[250,433,167],[251,0,101],[251,433,167],[252,0,101],[252,433,167],[253,0,100],[253,433,167],[254,0,100],[254,433,167],[255,0,99],[255,433,167],[256,0,99],[256,433,167],[257,0,98],[257,434,166],[258,0,98],[258,434,166],[259,0,97],[259,434,166],[260,0,97],[260,434,166],[261,0,97],[261,434,166],[262,0,96],[262,435,165],[263,0,96],[263,435,165],[264,0,95],[264,435,165],[265,0,95],[265,435,165],[266,0,95],[266,435,165],[267,0,95],[267,435,165],[268,0,95],[268,435,165],[269,0,95],[269,435,165],[270,0,95],[270,436,164],[271,0,94],[271,436,164],[272,0,94],[272,436,164],[273,0,94],[273,436,164],[274,0,94],[274,436,164],[275,0,94],[275,436,164],[276,0,94],[276,436,164],[277,0,94],[277,436,164],[278,0,94],[278,437,163],[279,0,94],[279,437,163],[280,0,94],[280,437,163],[281,0,94],[281,437,163],[282,0,94],[282,437,163],[283,0,93],[283,437,163],[284,0,93],[284,437,163],[285,0,93],[285,437,163],[286,0,93],[286,438,162],[287,0,93],[287,438,162],[288,0,93],[288,438,162],[289,0,92],[289,438,162],[290,0,92],[290,438,162],[291,0,92],[291,438,162],[292,0,92],[292,438,162],[293,0,92],[293,439,161],[294,0,92],[294,439,161],[295,0,92],[295,439,161],[296,0,92],[296,439,161],[297,0,92],[297,439,161],[298,0,92],[298,439,161],[299,0,91],[299,439,161],[300,0,91],[300,440,160],[301,0,91],[301,440,160],[302,0,91],[302,440,160],[303,0,91],[303,440,160],[304,0,91],[304,440,160],[305,0,91],[305,440,160],[306,0,91],[306,440,160],[307,0,91],[307,440,160],[308,0,91],[308,440,160],[309,0,91],[309,440,160],[310,0,91],[310,440,160],[311,0,91],[311,441,159],[312,0,91],[312,441,159],[313,0,91],[313,441,159],[314,0,90],[314,441,159],[315,0,90],[315,441,159],[316,0,90],[316,441,159],[317,0,90],[317,441,159],[318,0,90],[318,441,159],[319,0,90],[319,441,159],[320,0,90],[320,441,159],[321,0,89],[321,441,159],[322,0,89],[322,442,158],[323,0,89],[323,442,158],[324,0,89],[324,442,158],[325,0,89],[325,442,158],[326,0,89],[326,442,158],[327,0,89],[327,442,158],[328,0,89],[328,442,158],[329,0,89],[329,443,157],[330,0,89],[330,443,157],[331,0,89],[331,443,157],[332,0,89],[332,443,157],[333,0,89],[333,443,157],[334,0,88],[334,443,157],[335,0,88],[335,443,157],[336,0,88],[336,444,156],[337,0,88],[337,444,156],[338,0,88],[338,444,156],[339,0,88],[339,444,156],[340,0,88],[340,444,156],[341,0,88],[341,444,156],[342,0,88],[342,444,156],[343,0,88],[343,444,156],[344,0,87],[344,444,156],[345,0,87],[345,444,156],[346,0,87],[346,444,156],[347,0,87],[347,444,156],[348,0,87],[348,444,156],[349,0,87],[349,445,155],[350,0,87],[350,445,155],[351,0,87],[351,445,155],[352,0,87],[352,445,155],[353,0,87],[353,445,155],[354,0,87],[354,445,155],[355,0,87],[355,445,155],[356,0,87],[356,446,154],[357,0,87],[357,446,154],[358,0,86],[358,446,154],[359,0,86],[359,446,154],[360,0,86],[360,446,154],[361,0,86],[361,446,154],[362,0,86],[362,446,154],[363,0,86],[363,446,154],[364,0,86],[364,447,153],[365,0,86],[365,447,153],[366,0,86],[366,447,153],[367,0,86],[367,447,153],[368,0,86],[368,447,153],[369,0,86],[369,447,153],[370,0,85],[370,447,153],[371,0,85],[371,447,153],[372,0,85],[372,448,152],[373,0,85],[373,448,152],[374,0,85],[374,448,152],[375,0,85],[375,448,152],[376,0,85],[376,448,152],[377,0,85],[377,448,152],[378,0,85],[378,448,152],[379,0,85],[379,449,151],[380,0,85],[380,449,151],[381,0,85],[381,449,151],[382,0,85],[382,449,151],[383,0,84],[383,449,151],[384,0,84],[384,449,151],[385,0,84],[385,449,151],[386,0,84],[386,450,150],[387,0,84],[387,450,150],[388,0,84],[388,450,150],[389,0,84],[389,450,150],[390,0,84],[390,450,150],[391,0,84],[391,450,150],[392,0,84],[392,450,150],[393,0,84],[393,451,149],[394,0,84],[394,451,149],[395,0,83],[395,451,149],[396,0,83],[396,451,149],[397,0,83],[397,451,149],[398,0,83],[398,451,149],[399,0,83],[399,451,149],[400,0,83],[400,452,148],[401,0,83],[401,452,148],[402,0,83],[402,452,148],[403,0,83],[403,452,148],[404,0,83],[404,452,148],[405,0,83],[405,452,148],[406,0,83],[406,452,148],[407,0,83],[407,453,147],[408,0,83],[408,453,147],[409,0,83],[409,453,147],[410,0,82],[410,453,147],[411,0,82],[411,453,147],[412,0,82],[412,453,147],[413,0,82],[413,454,146],[414,0,82],[414,454,146],[415,0,82],[415,454,146],[416,0,82],[416,454,146],[417,0,82],[417,454,146],[418,0,82],[418,454,146],[419,0,82],[419,455,145],[420,0,82],[420,455,145],[421,0,82],[421,455,145],[422,0,82],[422,455,145],[423,0,82],[423,455,145],[424,0,81],[424,455,145],[425,0,81],[425,456,144],[426,0,81],[426,456,144],[427,0,81],[427,456,144],[428,0,81],[428,456,144],[429,0,81],[429,457,143],[430,0,81],[430,457,143],[431,0,81],[431,457,143],[432,0,81],[432,457,143],[433,0,81],[433,457,143],[434,0,81],[434,457,143],[435,0,81],[435,457,143],[436,0,81],[436,458,142],[437,0,81],[437,458,142],[438,0,81],[438,458,142],[439,0,81],[439,458,142],[440,0,81],[440,458,142],[441,0,81],[441,458,142],[442,0,81],[442,459,141],[443,0,81],[443,459,141],[444,0,81],[444,459,141],[445,0,81],[445,459,141],[446,0,81],[446,459,141],[447,0,80],[447,460,140],[448,0,80],[448,460,140],[449,0,80],[449,460,140],[450,0,80],[450,460,140],[451,0,80],[451,460,140],[452,0,80],[452,461,139],[453,0,80],[453,461,139],[454,0,80],[454,461,139],[455,0,80],[455,461,139],[456,0,80],[456,462,138],[457,0,80],[457,462,138],[458,0,80],[458,462,138],[459,0,80],[459,462,138],[460,0,80],[460,462,138],[461,0,80],[461,462,138],[462,0,80],[462,462,138],[463,0,80],[463,463,137],[464,0,80],[464,463,137],[465,0,80],[465,463,137],[466,0,80],[466,463,137],[467,0,80],[467,463,137],[468,0,80],[468,464,136],[469,0,80],[469,467,133],[470,0,80],[470,470,130],[471,0,80],[471,473,127],[472,0,80],[472,476,124],[473,0,80],[473,479,121],[474,0,80],[474,482,118],[475,0,80],[475,484,116],[476,0,80],[476,485,115],[477,0,79],[477,486,114],[478,0,79],[478,486,114],[479,0,79],[479,486,114],[480,0,79],[480,486,114],[481,0,79],[481,487,113],[482,0,79],[482,487,113],[483,0,79],[483,487,113],[484,0,79],[484,488,112],[485,0,79],[485,489,111],[486,0,79],[486,489,111],[487,0,79],[487,489,111],[488,0,79],[488,490,110],[489,0,79],[489,490,110],[490,0,79],[490,491,109],[491,0,79],[491,491,109],[492,0,79],[492,491,109],[493,0,79],[493,491,109],[494,0,79],[494,491,109],[495,0,79],[495,492,108],[496,0,79],[496,492,108],[497,0,79],[497,492,108],[498,0,79],[498,492,108],[499,0,79],[499,492,108],[500,0,79],[500,493,107],[501,0,79],[501,493,107],[502,0,79],[502,493,107],[503,0,79],[503,493,107],[504,0,79],[504,493,107],[505,0,79],[505,494,106],[506,0,79],[506,494,106],[507,0,78],[507,494,106],[508,0,78],[508,494,106],[509,0,78],[509,494,106],[510,0,78],[510,495,105],[511,0,78],[511,495,105],[512,0,78],[512,495,105],[513,0,78],[513,495,105],[514,0,78],[514,495,105],[515,0,78],[515,496,104],[516,0,78],[516,496,104],[517,0,78],[517,496,104],[518,0,79],[518,496,104],[519,0,79],[519,496,104],[520,0,79],[520,496,104],[521,0,79],[521,496,104],[522,0,78],[522,496,104],[523,0,78],[523,497,103],[524,0,78],[524,497,103],[525,0,78],[525,497,103],[526,0,78],[526,497,103],[527,0,78],[527,497,103],[528,0,78],[528,497,103],[529,0,78],[529,497,103],[530,0,78],[530,498,102],[531,0,78],[531,498,102],[532,0,78],[532,498,102],[533,0,78],[533,498,102],[534,0,78],[534,498,102],[535,0,78],[535,498,102],[536,0,78],[536,498,102],[537,0,78],[537,498,102],[538,0,78],[538,498,102],[539,0,78],[539,498,102],[540,0,78],[540,499,101],[541,0,78],[541,499,101],[542,0,78],[542,499,101],[543,0,78],[543,499,101],[544,0,78],[544,499,101],[545,0,78],[545,499,101],[546,0,78],[546,500,100],[547,0,78],[547,500,100],[548,0,78],[548,500,100],[549,0,78],[549,500,100],[550,0,78],[550,500,100],[551,0,77],[551,500,100],[552,0,77],[552,500,100],[553,0,77],[553,500,100],[554,0,77],[554,500,100],[555,0,77],[555,500,100],[556,0,77],[556,501,99],[557,0,77],[557,501,99],[558,0,77],[558,501,99],[559,0,77],[559,501,99],[560,0,77],[560,501,99],[561,0,77],[561,501,99],[562,0,77],[562,501,99],[563,0,77],[563,501,99],[564,0,77],[564,502,98],[565,0,77],[565,502,98],[566,0,77],[566,502,98],[567,0,77],[567,502,98],[568,0,77],[568,502,98],[569,0,77],[569,502,98],[570,0,77],[570,502,98],[571,0,76],[571,503,97],[572,0,76],[572,503,97],[573,0,76],[573,503,97],[574,0,76],[574,503,97],[575,0,76],[575,503,97],[576,0,76],[576,503,97],[577,0,76],[577,503,97],[578,0,76],[578,504,96],[579,0,76],[579,504,96],[580,0,76],[580,504,96],[581,0,76],[581,504,96],[582,0,76],[582,504,96],[583,0,76],[583,505,95],[584,0,76],[584,505,95],[585,0,76],[585,505,95],[586,0,76],[586,505,95],[587,0,76],[587,506,94],[588,0,76],[588,506,94],[589,0,76],[589,506,94],[590,0,76],[590,507,93],[591,0,76],[591,507,93],[592,0,76],[592,507,93],[593,0,75],[593,507,93],[594,0,75],[594,508,92],[595,0,75],[595,508,92],[596,0,75],[596,509,91],[597,0,75],[597,509,91],[598,0,75],[598,509,91],[599,0,75],[599,510,90],[600,0,75],[600,511,89],[601,0,75],[601,511,89],[602,0,75],[602,512,88],[603,0,75],[603,513,87],[604,0,74],[604,513,87],[605,0,74],[605,514,86],[606,0,74],[606,515,85],[607,0,74],[607,516,84],[608,0,74],[608,517,83],[609,0,74],[609,519,81],[610,0,74],[610,521,79],[611,0,74],[611,523,77],[612,0,74],[612,525,75],[613,0,73],[613,526,74],[614,0,73],[614,527,73],[615,0,73],[615,528,72],[616,0,73],[616,529,71],[617,0,73],[617,530,70],[618,0,73],[618,531,69],[619,0,73],[619,532,68],[620,0,73],[620,533,67],[621,0,73],[621,534,66],[622,0,73],[622,534,66],[623,0,73],[623,535,65],[624,0,73],[624,536,64],[625,0,73],[625,537,63],[626,0,72],[626,537,63],[627,0,72],[627,538,62],[628,0,72],[628,539,61],[629,0,72],[629,539,61],[630,0,72],[630,540,60],[631,0,72],[631,541,59],[632,0,72],[632,541,59],[633,0,71],[633,542,58],[634,0,71],[634,543,57],[635,0,71],[635,543,57],[636,0,71],[636,544,56],[637,0,71],[637,544,56],[638,0,71],[638,545,55],[639,0,71],[639,545,55],[640,0,71],[640,546,54],[641,0,70],[641,546,54],[642,0,70],[642,547,53],[643,0,70],[643,548,52],[644,0,70],[644,549,51],[645,0,70],[645,550,50],[646,0,70],[646,550,50],[647,0,69],[647,551,49],[648,0,69],[648,552,48],[649,0,69],[649,553,47],[650,0,69],[650,554,46],[651,0,69],[651,554,46],[652,0,69],[652,556,44],[653,0,69],[653,558,42],[654,0,69],[654,559,41],[655,0,68],[655,559,41],[656,0,68],[656,560,40],[657,0,68],[657,561,39],[658,0,68],[658,562,38],[659,0,67],[659,562,38],[660,0,67],[660,562,38],[661,0,67],[661,563,37],[662,0,67],[662,563,37],[663,0,67],[663,564,36],[664,0,67],[664,565,35],[665,0,67],[665,566,34],[666,0,67],[666,567,33],[667,0,66],[667,569,31],[668,0,66],[668,569,31],[669,0,66],[669,570,30],[670,0,66],[670,571,29],[671,0,66],[671,571,29],[672,0,65],[672,572,28],[673,0,65],[673,572,28],[674,0,65],[674,572,28],[675,0,65],[675,571,29],[676,0,65],[676,570,30],[677,0,65],[677,569,31],[678,0,65],[678,569,31],[679,0,64],[679,568,32],[680,0,64],[680,567,33],[681,0,64],[681,566,34],[682,0,64],[682,489,2],[682,565,35],[683,0,64],[683,482,11],[683,564,36],[684,0,64],[684,460,34],[684,563,37],[685,0,64],[685,415,22],[685,456,39],[685,562,38],[686,0,64],[686,218,3],[686,379,2],[686,385,111],[686,522,2],[686,561,39],[687,0,64],[687,199,35],[687,352,145],[687,520,5],[687,560,40],[688,0,64],[688,162,76],[688,351,147],[688,518,9],[688,558,42],[689,0,64],[689,149,96],[689,251,2],[689,351,148],[689,516,12],[689,555,45],[690,0,65],[690,98,18],[690,123,132],[690,350,150],[690,512,19],[690,555,45],[691,0,257],[691,349,156],[691,508,27],[691,545,3],[691,552,48],[692,0,259],[692,347,253],[693,0,262],[693,346,254],[694,0,265],[694,345,255],[695,0,268],[695,343,257],[696,0,278],[696,281,2],[696,342,258],[697,0,284],[697,340,260],[698,0,286],[698,337,263],[699,0,287],[699,334,266],[700,0,288],[700,329,271],[701,0,289],[701,329,271],[702,0,291],[702,329,271],[703,0,292],[703,328,272],[704,0,293],[704,328,272],[705,0,296],[705,327,273],[706,0,307],[706,327,273],[707,0,309],[707,326,274],[708,0,311],[708,325,275],[709,0,313],[709,324,276],[710,0,600],[711,0,600],[712,0,600],[713,0,600],[714,0,600],[715,0,600],[716,0,600],[717,0,600],[718,0,600],[719,0,600],[720,0,600],[721,0,600],[722,0,600],[723,0,600],[724,0,600],[725,0,600],[726,0,600],[727,0,600],[728,0,600],[729,0,600],[730,0,600],[731,0,600],[732,0,600],[733,0,600],[734,0,600],[735,0,600],[736,0,600],[737,0,600],[738,0,600],[739,0,600],[740,0,600],[741,0,600],[742,0,600],[743,0,600],[744,0,600],[745,0,600],[746,0,600],[747,0,600],[748,0,600],[749,0,600],[750,0,600],[751,0,600],[752,0,600],[753,0,600],[754,0,600],[755,0,600],[756,0,600],[757,0,600],[758,0,600],[759,0,600],[760,0,600],[761,0,600],[762,0,600],[763,0,600],[764,0,600],[765,0,600],[766,0,600],[767,0,600],[768,0,600],[769,0,600],[770,0,600],[771,0,600],[772,0,600],[773,0,600],[774,0,600],[775,0,600],[776,0,600],[777,0,600],[778,0,600],[779,0,600],[780,0,600],[781,0,600],[782,0,600],[783,0,600],[784,0,600],[785,0,600],[786,0,600],[787,0,600],[788,0,600],[789,0,600],[790,0,600],[791,0,600],[792,0,600],[793,0,600],[794,0,600],[795,0,600],[796,0,600],[797,0,600],[798,0,600],[799,0,600]]}],"garden-fox":[{id:"garden-fox-0",area:54667,bounds:{x:180,y:241,w:349,h:472},grip:{x:405.5,y:242.5},axis:{x:-.3157150974385202,y:.9488540336897902},length:491,duration:2.8,runs:[[0,4,1],[1,4,3],[1,225,1],[2,4,5],[2,223,3],[3,4,7],[3,221,5],[4,5,9],[4,219,7],[5,5,11],[5,217,8],[6,5,13],[6,215,10],[7,5,15],[7,213,12],[8,5,17],[8,211,14],[9,5,20],[9,210,15],[10,6,20],[10,209,16],[11,6,21],[11,208,16],[12,6,23],[12,206,18],[13,6,25],[13,204,20],[14,6,27],[14,203,21],[15,6,29],[15,202,22],[16,7,29],[16,200,24],[17,7,30],[17,198,25],[18,7,33],[18,197,26],[19,7,35],[19,196,27],[20,7,36],[20,194,29],[21,7,37],[21,193,30],[22,8,38],[22,192,31],[23,8,39],[23,191,32],[24,8,40],[24,189,33],[25,8,42],[25,188,34],[26,8,14],[26,23,29],[26,187,20],[26,209,13],[27,8,14],[27,24,29],[27,185,21],[27,209,13],[28,9,13],[28,26,28],[28,183,22],[28,209,13],[29,9,13],[29,27,29],[29,182,22],[29,208,14],[30,9,13],[30,29,28],[30,181,22],[30,208,13],[31,9,13],[31,31,27],[31,180,22],[31,208,13],[32,9,14],[32,32,28],[32,179,22],[32,208,13],[33,9,14],[33,34,27],[33,178,22],[33,208,13],[34,10,13],[34,35,27],[34,177,22],[34,208,13],[35,10,13],[35,37,27],[35,176,22],[35,207,14],[36,10,13],[36,38,26],[36,174,23],[36,207,13],[37,10,13],[37,40,25],[37,173,23],[37,207,13],[38,10,13],[38,41,25],[38,172,23],[38,207,13],[39,10,13],[39,42,25],[39,170,23],[39,207,13],[40,11,12],[40,43,26],[40,170,23],[40,207,13],[41,11,12],[41,44,26],[41,169,23],[41,206,14],[42,11,13],[42,45,26],[42,168,23],[42,206,14],[43,11,13],[43,47,26],[43,167,23],[43,206,13],[44,11,13],[44,48,26],[44,165,24],[44,206,13],[45,11,13],[45,49,26],[45,164,24],[45,206,13],[46,11,13],[46,50,26],[46,163,24],[46,206,13],[47,12,12],[47,52,25],[47,162,24],[47,205,14],[48,12,12],[48,53,25],[48,161,25],[48,205,14],[49,12,12],[49,53,26],[49,109,14],[49,161,24],[49,205,13],[50,12,12],[50,54,26],[50,102,27],[50,160,24],[50,205,13],[51,12,12],[51,55,26],[51,98,36],[51,158,25],[51,205,13],[52,12,12],[52,56,26],[52,93,44],[52,157,24],[52,204,14],[53,13,12],[53,57,26],[53,91,50],[53,156,25],[53,204,14],[54,13,12],[54,58,26],[54,88,54],[54,155,25],[54,204,14],[55,13,12],[55,59,26],[55,86,59],[55,154,25],[55,204,14],[56,13,12],[56,60,87],[56,153,25],[56,204,13],[57,13,12],[57,60,88],[57,152,25],[57,204,13],[58,13,12],[58,61,89],[58,152,25],[58,203,14],[59,14,11],[59,62,114],[59,203,14],[60,14,11],[60,63,111],[60,203,14],[61,14,11],[61,64,109],[61,203,14],[62,14,11],[62,65,108],[62,203,13],[63,14,12],[63,66,106],[63,203,13],[64,14,12],[64,66,105],[64,202,14],[65,15,11],[65,67,103],[65,202,14],[66,15,11],[66,68,101],[66,202,14],[67,15,11],[67,68,100],[67,202,14],[68,15,11],[68,69,98],[68,202,13],[69,15,11],[69,70,97],[69,202,13],[70,15,11],[70,70,96],[70,201,14],[71,16,10],[71,71,94],[71,201,14],[72,16,10],[72,69,96],[72,201,14],[73,16,10],[73,66,98],[73,201,14],[74,16,11],[74,64,101],[74,201,14],[75,16,11],[75,62,105],[75,200,14],[76,16,11],[76,59,109],[76,200,14],[77,17,10],[77,57,113],[77,200,14],[78,17,10],[78,55,116],[78,200,14],[79,17,10],[79,52,121],[79,200,14],[80,17,10],[80,50,124],[80,200,14],[81,17,10],[81,48,128],[81,199,14],[82,17,10],[82,45,132],[82,199,14],[83,18,9],[83,43,136],[83,199,14],[84,18,10],[84,41,139],[84,199,14],[85,18,10],[85,38,143],[85,199,14],[86,18,10],[86,36,147],[86,199,14],[87,18,10],[87,34,150],[87,198,14],[88,18,10],[88,31,155],[88,198,14],[89,18,10],[89,29,158],[89,198,14],[90,19,170],[90,198,14],[91,19,171],[91,198,14],[92,19,173],[92,198,14],[93,19,174],[93,197,15],[94,19,176],[94,197,14],[95,19,177],[95,197,14],[96,20,191],[97,20,191],[98,20,191],[99,20,191],[100,20,190],[101,20,190],[102,21,189],[103,21,189],[104,21,189],[105,21,189],[106,21,188],[107,21,188],[108,22,187],[109,22,187],[110,22,187],[111,22,187],[112,22,187],[113,22,186],[114,23,57],[114,88,120],[115,23,52],[115,92,62],[115,166,42],[116,23,49],[116,95,55],[116,169,39],[117,23,10],[117,34,36],[117,96,52],[117,170,38],[118,23,9],[118,45,24],[118,99,47],[118,172,36],[119,23,9],[119,48,22],[119,99,45],[119,173,34],[120,24,9],[120,52,19],[120,101,41],[120,171,36],[121,24,9],[121,55,18],[121,102,39],[121,170,25],[121,201,6],[122,24,9],[122,59,15],[122,103,36],[122,169,22],[122,200,7],[123,24,9],[123,60,16],[123,104,34],[123,168,20],[123,200,7],[124,24,9],[124,62,16],[124,105,32],[124,166,20],[124,199,8],[125,24,10],[125,64,16],[125,102,34],[125,165,18],[125,199,8],[126,25,9],[126,65,17],[126,101,38],[126,163,18],[126,198,8],[127,25,9],[127,69,16],[127,97,44],[127,161,19],[127,198,8],[128,25,10],[128,69,76],[128,158,20],[128,198,8],[129,25,10],[129,70,106],[129,197,9],[130,25,11],[130,72,103],[130,197,9],[131,26,10],[131,74,98],[131,196,10],[132,26,10],[132,75,96],[132,196,9],[133,26,11],[133,77,93],[133,196,9],[134,26,11],[134,78,90],[134,195,10],[135,27,10],[135,79,88],[135,195,10],[136,27,10],[136,80,86],[136,194,11],[137,28,10],[137,82,83],[137,194,11],[138,28,10],[138,82,82],[138,193,11],[139,28,11],[139,83,80],[139,193,11],[140,29,10],[140,85,77],[140,192,12],[141,29,10],[141,85,76],[141,192,12],[142,30,10],[142,86,74],[142,191,12],[143,30,10],[143,88,69],[143,191,12],[144,31,9],[144,88,68],[144,191,11],[145,31,10],[145,89,66],[145,190,11],[146,32,9],[146,91,63],[146,190,11],[147,32,10],[147,91,62],[147,189,11],[148,32,10],[148,92,60],[148,189,11],[149,33,9],[149,93,58],[149,188,11],[150,33,10],[150,94,56],[150,188,11],[151,34,9],[151,94,55],[151,188,10],[152,34,9],[152,95,53],[152,187,11],[153,35,9],[153,96,51],[153,187,10],[154,35,9],[154,97,48],[154,186,11],[155,36,9],[155,98,46],[155,186,10],[156,36,9],[156,99,45],[156,185,11],[157,37,9],[157,100,43],[157,184,11],[158,37,9],[158,101,41],[158,184,11],[159,38,9],[159,101,40],[159,183,11],[160,38,9],[160,102,38],[160,183,10],[161,38,9],[161,103,37],[161,182,11],[162,39,9],[162,103,36],[162,182,10],[163,39,9],[163,104,34],[163,181,11],[164,40,9],[164,105,32],[164,180,11],[165,40,9],[165,105,32],[165,180,11],[166,41,9],[166,106,30],[166,179,11],[167,41,9],[167,106,29],[167,179,10],[168,42,9],[168,107,28],[168,178,11],[169,42,9],[169,107,27],[169,178,10],[170,43,9],[170,108,25],[170,178,10],[171,43,9],[171,108,24],[171,177,10],[172,44,9],[172,109,23],[172,177,10],[173,44,9],[173,110,21],[173,176,10],[174,45,9],[174,110,20],[174,175,10],[175,45,10],[175,110,20],[175,175,10],[176,46,9],[176,111,18],[176,174,10],[177,47,9],[177,111,17],[177,173,10],[178,47,9],[178,112,16],[178,173,10],[179,48,9],[179,112,15],[179,172,10],[180,48,9],[180,112,15],[180,171,10],[181,49,9],[181,113,13],[181,171,10],[182,49,10],[182,113,12],[182,170,10],[183,50,9],[183,114,11],[183,169,11],[184,50,10],[184,114,10],[184,169,10],[185,51,9],[185,114,9],[185,168,11],[186,52,9],[186,115,8],[186,167,11],[187,53,8],[187,115,8],[187,167,10],[188,54,8],[188,116,7],[188,166,11],[189,54,9],[189,116,6],[189,165,11],[190,55,8],[190,116,5],[190,165,10],[191,55,9],[191,164,10],[192,56,9],[192,163,10],[193,56,9],[193,163,10],[194,57,9],[194,162,10],[195,58,9],[195,161,10],[196,58,9],[196,160,10],[197,59,9],[197,159,10],[198,60,9],[198,158,10],[199,60,9],[199,158,10],[200,61,9],[200,157,10],[201,62,9],[201,156,10],[202,63,8],[202,156,9],[203,64,8],[203,155,9],[204,65,8],[204,154,10],[205,65,9],[205,153,10],[206,66,9],[206,152,10],[207,67,9],[207,151,10],[208,68,9],[208,150,10],[209,69,9],[209,149,11],[210,70,8],[210,149,10],[211,71,8],[211,148,9],[212,72,9],[212,147,9],[213,72,10],[213,146,9],[214,73,10],[214,145,9],[215,74,9],[215,144,9],[216,31,1],[216,75,9],[216,143,9],[217,31,16],[217,77,9],[217,142,9],[218,30,31],[218,78,9],[218,141,9],[219,30,46],[219,79,9],[219,140,9],[220,29,59],[220,139,9],[221,29,60],[221,138,8],[222,28,63],[222,137,8],[223,28,64],[223,136,8],[224,27,66],[224,135,13],[225,27,67],[225,134,29],[226,27,69],[226,133,30],[227,26,71],[227,132,31],[228,26,73],[228,131,33],[229,25,75],[229,130,34],[230,25,76],[230,129,35],[231,25,77],[231,128,37],[232,24,62],[232,87,17],[232,127,38],[233,24,61],[233,90,15],[233,126,40],[234,23,61],[234,93,14],[234,124,42],[235,23,60],[235,96,12],[235,123,43],[236,23,59],[236,98,13],[236,121,46],[237,22,59],[237,101,12],[237,120,47],[238,22,59],[238,104,10],[238,119,49],[239,21,59],[239,107,9],[239,119,49],[240,21,59],[240,110,7],[240,118,51],[241,21,58],[241,113,56],[241,311,1],[242,21,57],[242,116,54],[243,20,58],[243,119,51],[243,314,1],[244,20,57],[244,121,49],[244,315,2],[245,20,57],[245,124,46],[245,316,2],[246,20,56],[246,127,44],[246,317,3],[247,19,56],[247,130,41],[247,319,2],[248,19,56],[248,130,41],[248,320,2],[249,19,55],[249,130,41],[249,321,3],[250,18,56],[250,129,43],[250,322,3],[251,18,55],[251,129,43],[251,323,3],[252,18,54],[252,129,44],[252,324,3],[253,17,55],[253,129,44],[253,325,2],[254,17,54],[254,129,44],[254,326,2],[255,16,55],[255,129,45],[255,327,2],[256,16,54],[256,129,45],[256,327,3],[257,16,54],[257,129,46],[257,328,3],[258,16,53],[258,129,46],[258,329,2],[259,16,53],[259,129,46],[259,330,2],[260,15,53],[260,129,47],[260,331,2],[261,15,53],[261,129,47],[261,332,2],[262,15,53],[262,129,48],[262,332,2],[263,15,52],[263,129,48],[263,333,2],[264,14,53],[264,129,48],[264,334,1],[265,14,52],[265,129,48],[265,334,2],[266,14,52],[266,129,48],[266,335,1],[267,13,52],[267,129,49],[267,336,1],[268,13,52],[268,129,49],[268,336,1],[269,13,51],[269,129,49],[269,337,1],[270,13,51],[270,129,49],[271,12,51],[271,129,50],[271,338,1],[272,12,51],[272,130,49],[273,12,51],[273,130,50],[274,12,50],[274,130,50],[275,11,51],[275,130,50],[276,11,50],[276,130,50],[277,11,50],[277,130,51],[277,341,1],[278,10,51],[278,130,51],[279,10,50],[279,130,51],[279,342,1],[280,10,50],[280,130,51],[281,10,50],[281,130,52],[282,10,49],[282,131,51],[283,9,50],[283,131,52],[283,314,1],[284,9,50],[284,131,52],[284,314,1],[285,9,50],[285,131,52],[285,314,1],[286,9,49],[286,131,53],[286,314,1],[287,9,49],[287,131,53],[287,314,1],[288,9,49],[288,131,53],[288,313,2],[289,8,50],[289,131,54],[289,313,2],[290,8,49],[290,131,54],[290,313,2],[291,8,49],[291,131,54],[291,313,2],[292,8,49],[292,132,53],[292,313,2],[293,8,48],[293,132,54],[293,312,3],[294,8,48],[294,132,54],[294,312,2],[295,7,49],[295,132,54],[295,312,2],[296,7,49],[296,132,54],[296,312,2],[297,7,49],[297,133,53],[297,311,3],[298,7,48],[298,133,53],[298,311,3],[299,7,48],[299,133,54],[299,310,4],[300,7,48],[300,133,54],[300,310,3],[301,6,49],[301,133,54],[301,309,4],[302,6,49],[302,134,53],[302,309,4],[303,6,48],[303,134,54],[303,308,4],[304,6,48],[304,134,54],[304,307,5],[305,6,48],[305,134,55],[305,306,6],[306,6,48],[306,134,55],[306,305,7],[307,6,48],[307,135,54],[307,304,8],[308,5,49],[308,135,54],[308,304,8],[309,5,48],[309,135,54],[309,303,8],[310,5,48],[310,135,55],[310,302,9],[311,5,48],[311,135,55],[311,301,10],[312,5,48],[312,136,54],[312,300,10],[313,5,48],[313,136,54],[313,299,10],[314,4,49],[314,136,54],[314,298,11],[315,4,48],[315,136,55],[315,296,12],[316,4,48],[316,136,55],[316,295,13],[317,4,48],[317,137,54],[317,294,13],[318,4,48],[318,137,54],[318,292,15],[319,4,48],[319,137,54],[319,291,15],[320,3,49],[320,137,54],[320,289,17],[321,3,49],[321,138,54],[321,286,19],[322,3,49],[322,138,54],[322,285,19],[323,3,49],[323,139,53],[323,283,20],[324,3,49],[324,139,53],[324,282,20],[325,3,49],[325,139,54],[325,279,23],[326,2,50],[326,140,53],[326,276,25],[327,2,50],[327,140,53],[327,274,26],[328,2,50],[328,140,54],[328,273,26],[328,348,1],[329,2,50],[329,140,54],[329,271,27],[329,348,1],[330,2,50],[330,140,54],[330,268,29],[331,2,50],[331,141,53],[331,265,31],[332,2,49],[332,141,54],[332,263,32],[333,1,50],[333,141,54],[333,262,32],[334,1,50],[334,141,54],[334,260,33],[335,1,50],[335,142,53],[335,257,33],[335,347,1],[336,1,50],[336,142,53],[336,253,36],[336,347,1],[337,1,51],[337,142,53],[337,250,38],[338,1,51],[338,142,53],[338,247,39],[339,1,51],[339,143,52],[339,245,38],[339,346,1],[340,1,51],[340,143,52],[340,242,40],[340,346,1],[341,1,51],[341,144,51],[341,240,40],[341,346,1],[342,1,51],[342,144,51],[342,238,39],[342,345,2],[343,1,51],[343,144,52],[343,236,39],[343,345,2],[344,1,51],[344,145,51],[344,234,38],[344,345,2],[345,0,52],[345,145,51],[345,231,38],[345,344,2],[346,0,52],[346,145,51],[346,227,43],[346,344,2],[347,0,52],[347,145,51],[347,224,48],[347,344,2],[348,0,52],[348,145,51],[348,222,52],[348,344,2],[349,0,52],[349,146,51],[349,219,57],[349,343,3],[350,0,52],[350,146,51],[350,217,60],[350,343,2],[351,0,52],[351,146,51],[351,216,63],[351,342,3],[352,0,52],[352,147,50],[352,214,66],[352,342,3],[353,0,52],[353,147,50],[353,212,69],[353,341,4],[354,0,53],[354,148,49],[354,210,72],[354,341,3],[355,0,53],[355,148,50],[355,207,77],[355,341,3],[356,0,53],[356,148,50],[356,205,82],[356,340,4],[357,0,53],[357,148,50],[357,203,86],[357,340,4],[358,0,53],[358,149,49],[358,201,89],[358,340,3],[359,0,53],[359,149,49],[359,199,93],[359,339,4],[360,0,54],[360,149,144],[360,339,4],[361,0,54],[361,149,148],[361,338,5],[362,0,54],[362,150,148],[362,338,4],[363,0,54],[363,150,151],[363,337,5],[364,0,54],[364,150,153],[364,337,5],[365,0,54],[365,151,155],[365,336,6],[366,0,55],[366,151,158],[366,336,5],[367,0,55],[367,152,160],[367,335,6],[368,0,55],[368,152,163],[368,335,5],[369,0,55],[369,152,168],[369,334,6],[370,0,55],[370,152,172],[370,334,5],[371,0,56],[371,153,180],[371,334,5],[372,0,56],[372,153,186],[373,0,56],[373,153,185],[374,0,56],[374,153,185],[375,0,56],[375,154,183],[376,0,56],[376,154,183],[377,0,57],[377,154,183],[378,0,57],[378,154,182],[379,0,57],[379,155,181],[380,0,57],[380,155,181],[381,0,58],[381,155,180],[382,0,58],[382,155,180],[383,0,58],[383,155,179],[384,0,59],[384,156,178],[385,0,59],[385,156,177],[386,0,59],[386,156,177],[387,0,59],[387,156,176],[388,0,60],[388,157,117],[388,280,52],[389,0,60],[389,157,114],[389,283,48],[390,0,60],[390,157,113],[390,284,47],[391,0,60],[391,157,111],[391,286,44],[392,0,61],[392,157,110],[392,287,43],[393,1,60],[393,157,110],[393,287,42],[394,1,61],[394,157,109],[394,288,40],[395,1,61],[395,157,108],[395,289,39],[396,1,62],[396,157,108],[396,289,38],[397,1,62],[397,158,104],[397,292,35],[398,1,63],[398,158,102],[398,294,32],[399,2,62],[399,158,100],[399,296,30],[400,2,63],[400,158,99],[400,297,28],[401,2,63],[401,159,97],[401,298,26],[402,2,63],[402,159,96],[402,299,25],[403,2,64],[403,159,96],[403,299,24],[404,2,64],[404,159,95],[404,300,23],[405,2,65],[405,159,95],[405,300,22],[406,2,65],[406,159,94],[406,301,21],[407,2,65],[407,159,94],[407,301,20],[408,2,66],[408,159,94],[408,301,19],[409,2,66],[409,159,94],[409,301,19],[410,2,67],[410,159,94],[410,301,18],[411,3,66],[411,159,94],[411,301,17],[412,3,67],[412,159,94],[412,301,16],[413,3,67],[413,159,95],[413,300,17],[414,3,68],[414,159,95],[414,300,16],[415,3,68],[415,159,96],[415,299,16],[416,4,68],[416,159,96],[416,299,15],[417,4,69],[417,159,97],[417,298,15],[418,4,69],[418,159,98],[418,297,16],[419,4,70],[419,159,98],[419,297,15],[420,4,70],[420,159,98],[420,297,14],[421,5,70],[421,159,98],[421,297,13],[422,5,71],[422,159,98],[422,297,12],[423,6,70],[423,159,98],[423,297,11],[424,6,24],[424,43,34],[424,159,98],[424,297,10],[425,6,19],[425,47,30],[425,159,98],[425,297,9],[426,6,16],[426,50,28],[426,159,99],[426,296,9],[427,7,11],[427,53,26],[427,159,4],[427,181,77],[427,296,8],[428,7,10],[428,55,25],[428,184,75],[428,295,8],[429,7,8],[429,56,24],[429,187,72],[429,295,7],[430,7,7],[430,59,22],[430,190,70],[430,294,7],[431,8,6],[431,61,21],[431,192,69],[431,293,7],[432,8,6],[432,62,21],[432,194,68],[432,292,7],[433,8,6],[433,63,20],[433,196,68],[433,276,2],[433,290,8],[434,9,5],[434,65,19],[434,196,70],[434,274,6],[434,288,9],[435,9,4],[435,65,20],[435,196,100],[436,9,4],[436,66,20],[436,196,99],[437,10,3],[437,68,19],[437,196,98],[438,10,3],[438,69,19],[438,196,97],[439,11,2],[439,70,19],[439,196,96],[440,11,2],[440,71,19],[440,196,94],[441,11,2],[441,72,19],[441,196,93],[442,12,1],[442,73,18],[442,196,91],[443,74,18],[443,196,90],[444,75,18],[444,196,89],[445,75,21],[445,196,87],[446,75,23],[446,196,86],[447,75,27],[447,196,84],[448,75,31],[448,134,2],[448,196,83],[449,75,34],[449,129,7],[449,196,81],[450,75,61],[450,196,79],[451,75,61],[451,196,77],[452,74,62],[452,196,75],[453,74,62],[453,192,77],[454,74,62],[454,191,76],[455,74,62],[455,189,76],[456,74,62],[456,186,77],[457,74,62],[457,184,76],[458,74,62],[458,181,77],[459,74,62],[459,179,76],[460,54,8],[460,74,62],[460,176,76],[461,57,79],[461,172,78],[462,59,77],[462,169,78],[463,64,77],[463,164,80],[464,68,56],[464,136,13],[464,154,87],[465,77,42],[465,140,98],[466,87,23],[466,144,84],[467,147,76],[468,151,68],[469,159,51],[470,167,34],[471,179,10]]}],"garden-cream":[{id:"garden-cream-0",area:8290,bounds:{x:212,y:358,w:169,h:124},grip:{x:380.5,y:362.5},axis:{x:-.5228119020756417,y:.852448071760415},length:147,duration:2.34,runs:[[0,1,1],[1,0,13],[2,0,16],[3,1,19],[4,1,22],[4,163,6],[5,1,26],[5,159,9],[6,1,27],[6,156,12],[7,1,29],[7,154,13],[8,2,30],[8,151,16],[9,2,31],[9,149,17],[10,2,35],[10,148,18],[11,3,34],[11,146,20],[12,3,35],[12,144,21],[13,4,36],[13,143,22],[14,4,38],[14,140,24],[15,4,39],[15,139,25],[16,5,40],[16,138,26],[17,5,41],[17,136,27],[18,5,42],[18,135,28],[19,5,43],[19,134,28],[20,6,44],[20,133,29],[21,6,44],[21,132,29],[22,7,44],[22,131,30],[23,7,46],[23,130,30],[24,7,46],[24,129,31],[25,8,46],[25,128,31],[26,8,48],[26,125,34],[27,8,48],[27,124,35],[28,9,48],[28,123,35],[29,9,50],[29,122,36],[30,10,49],[30,121,36],[31,10,50],[31,120,37],[32,10,51],[32,119,37],[33,11,51],[33,118,38],[34,11,51],[34,117,39],[35,11,52],[35,116,39],[36,12,52],[36,115,40],[37,12,53],[37,113,41],[38,13,53],[38,112,42],[39,13,54],[39,112,41],[40,14,54],[40,111,41],[41,14,55],[41,110,42],[42,15,54],[42,109,42],[43,15,55],[43,108,43],[44,15,56],[44,108,42],[45,16,55],[45,107,43],[46,16,56],[46,106,43],[47,17,56],[47,105,43],[48,17,56],[48,105,43],[49,18,56],[49,104,43],[50,18,56],[50,103,44],[51,19,56],[51,103,43],[52,19,56],[52,102,44],[53,20,56],[53,101,45],[54,20,56],[54,100,45],[55,21,56],[55,100,45],[56,21,57],[56,99,45],[57,22,56],[57,98,45],[58,23,55],[58,98,45],[59,23,56],[59,97,45],[60,24,55],[60,96,45],[61,24,56],[61,96,45],[62,25,55],[62,95,45],[63,25,55],[63,95,44],[64,26,55],[64,94,45],[65,27,54],[65,93,45],[66,27,55],[66,93,44],[67,28,54],[67,92,45],[68,28,54],[68,91,45],[69,29,54],[69,91,44],[70,29,54],[70,91,44],[71,30,54],[71,91,43],[72,31,53],[72,90,43],[73,31,53],[73,89,44],[74,32,48],[74,92,40],[75,33,44],[75,96,35],[76,33,41],[76,98,33],[77,34,38],[77,100,30],[78,35,34],[78,103,26],[79,35,33],[79,104,24],[80,36,32],[80,105,22],[81,37,32],[81,104,22],[82,37,34],[82,103,23],[83,38,34],[83,102,23],[84,39,34],[84,100,24],[85,39,35],[85,99,25],[86,40,36],[86,98,25],[87,41,36],[87,97,25],[88,42,36],[88,96,25],[89,43,36],[89,95,25],[90,44,37],[90,94,25],[91,45,37],[91,93,25],[92,46,37],[92,91,26],[93,46,38],[93,90,27],[94,47,39],[94,89,27],[95,49,37],[95,89,26],[96,50,36],[96,89,25],[97,51,35],[97,89,24],[98,51,35],[98,89,23],[99,52,34],[99,89,22],[100,54,31],[100,88,22],[101,55,30],[101,88,21],[102,56,29],[102,88,20],[103,56,29],[103,88,19],[104,57,28],[104,88,18],[105,59,26],[105,88,17],[106,60,25],[106,88,16],[107,61,24],[107,88,15],[108,62,40],[109,64,37],[110,65,35],[111,67,32],[112,68,30],[113,69,28],[114,70,26],[115,72,23],[116,73,21],[117,75,17],[118,76,15],[119,79,10],[120,81,7],[121,82,5],[122,84,3],[123,85,1]]},{id:"garden-cream-1",area:4665,bounds:{x:449,y:481,w:81,h:132},grip:{x:489.5,y:481.5},axis:{x:-.2661746910649029,y:.9639248071486194},length:123,duration:2.27,runs:[[0,40,1],[1,40,2],[2,41,3],[3,41,4],[4,41,5],[5,41,6],[6,42,6],[7,42,8],[8,42,9],[9,42,10],[10,43,10],[11,43,11],[12,43,12],[13,43,13],[14,44,13],[15,44,14],[16,44,14],[17,44,15],[18,44,16],[19,44,17],[20,44,18],[21,44,19],[22,45,18],[23,45,19],[24,45,20],[25,45,20],[26,46,20],[27,46,21],[28,46,21],[29,46,22],[30,46,23],[31,46,23],[32,46,24],[33,46,25],[34,46,25],[35,46,26],[36,46,26],[37,46,26],[38,46,27],[39,46,27],[40,46,28],[41,46,28],[42,46,29],[43,46,29],[44,46,30],[45,46,30],[46,46,30],[47,46,31],[48,46,31],[49,46,31],[50,46,31],[51,46,32],[52,46,32],[53,46,32],[54,45,34],[55,45,34],[56,45,34],[57,45,34],[58,45,34],[59,45,34],[60,44,35],[61,44,36],[62,44,36],[63,43,37],[64,43,37],[65,43,37],[66,43,37],[67,43,37],[68,43,37],[69,42,38],[70,42,38],[71,42,39],[72,41,40],[73,40,41],[74,40,41],[75,39,42],[76,39,42],[77,38,43],[78,38,42],[79,37,43],[80,37,43],[81,36,44],[82,35,45],[83,34,46],[84,33,47],[85,33,47],[86,32,48],[87,31,49],[88,30,49],[89,29,50],[90,28,51],[91,27,52],[92,26,53],[93,25,54],[94,24,55],[95,21,57],[96,20,58],[97,19,59],[98,17,61],[99,14,63],[100,13,64],[101,11,66],[102,8,68],[103,6,70],[104,3,73],[105,0,75],[106,1,74],[107,3,72],[108,5,70],[109,7,67],[110,8,66],[111,10,63],[112,11,62],[113,12,60],[114,13,59],[115,15,57],[116,18,53],[117,20,51],[118,21,50],[119,23,47],[120,24,46],[121,28,41],[122,29,40],[123,32,36],[124,34,34],[125,37,30],[126,40,27],[127,43,23],[128,46,20],[129,51,14],[130,55,10],[131,64,1]]},{id:"garden-cream-2",area:16801,bounds:{x:222,y:473,w:135,h:225},grip:{x:266.5,y:473.5},axis:{x:-.26066585229076455,y:.9654290825583871},length:229,duration:2.47,runs:[[0,44,1],[1,43,5],[2,42,9],[3,41,13],[4,40,16],[5,39,20],[6,39,23],[7,38,27],[8,38,30],[9,37,34],[10,36,38],[11,36,41],[12,35,44],[13,35,47],[14,34,51],[15,33,55],[16,33,55],[17,32,56],[18,32,55],[19,31,56],[20,30,57],[21,30,57],[22,29,58],[23,29,58],[24,28,59],[25,28,59],[26,27,60],[27,27,60],[28,26,61],[29,26,61],[30,26,61],[31,25,62],[32,25,62],[33,24,63],[34,24,63],[35,23,64],[36,23,64],[37,22,65],[38,22,65],[39,21,66],[40,21,67],[41,21,67],[42,20,68],[43,20,68],[44,19,69],[45,19,69],[46,19,69],[47,18,70],[48,18,70],[49,18,70],[50,17,72],[51,17,72],[52,17,72],[53,17,72],[54,16,73],[55,16,73],[56,16,73],[57,16,73],[58,15,74],[59,15,74],[60,15,75],[61,14,76],[62,14,76],[63,14,76],[64,14,76],[65,14,77],[66,13,78],[67,13,78],[68,13,78],[69,13,78],[70,13,79],[71,12,80],[72,12,80],[73,12,80],[74,12,80],[75,12,81],[76,12,81],[77,11,82],[78,11,82],[79,11,82],[80,11,83],[81,11,83],[82,11,83],[83,10,84],[84,10,84],[85,10,85],[86,10,85],[87,10,85],[88,10,85],[89,10,86],[90,10,86],[91,10,87],[92,10,87],[93,10,87],[94,10,88],[95,10,88],[96,10,88],[97,10,88],[98,10,88],[99,10,89],[100,9,90],[101,9,90],[102,9,90],[103,9,91],[104,9,91],[105,10,90],[106,10,90],[107,10,91],[108,10,91],[109,10,92],[110,10,92],[111,10,92],[112,10,93],[113,10,93],[114,10,93],[115,10,93],[116,10,93],[117,10,94],[118,10,94],[119,10,94],[120,10,95],[121,10,95],[122,11,95],[123,11,95],[124,11,95],[125,11,95],[126,11,96],[127,11,96],[128,12,95],[129,12,95],[130,12,96],[131,12,96],[132,12,96],[133,12,97],[134,13,96],[135,13,97],[136,13,97],[137,13,97],[138,13,97],[139,14,97],[140,14,97],[141,14,97],[142,14,97],[143,14,98],[144,14,98],[145,15,97],[146,15,97],[147,15,98],[148,15,98],[149,16,97],[150,16,97],[151,16,97],[152,17,97],[153,17,97],[154,17,97],[155,17,97],[156,18,97],[157,18,97],[158,18,97],[159,18,97],[160,19,96],[161,19,96],[162,20,95],[163,20,95],[164,21,94],[165,21,95],[166,22,94],[167,22,94],[168,23,93],[169,23,94],[170,23,94],[171,24,93],[172,24,93],[173,25,92],[174,25,92],[175,25,92],[176,26,91],[177,26,91],[178,27,90],[179,27,90],[180,28,89],[181,28,89],[182,29,88],[183,29,88],[184,30,87],[185,31,86],[186,31,86],[187,32,85],[188,32,85],[189,33,84],[190,34,83],[191,34,83],[192,35,82],[193,35,82],[194,36,81],[195,37,80],[196,38,78],[197,38,76],[198,39,72],[199,40,69],[200,41,67],[201,41,66],[202,42,62],[203,43,60],[204,44,57],[205,45,55],[206,46,54],[207,47,52],[208,48,49],[209,49,47],[210,49,46],[211,1,2],[211,13,2],[211,50,45],[211,121,2],[211,133,2],[212,1,2],[212,13,2],[212,51,43],[212,121,2],[212,133,2],[213,1,2],[213,13,2],[213,54,40],[213,121,2],[213,133,2],[214,1,2],[214,13,2],[214,56,38],[214,121,2],[214,133,2],[215,1,2],[215,13,2],[215,60,34],[215,121,2],[215,133,2],[216,1,2],[216,13,2],[216,64,28],[216,121,2],[216,133,2],[217,1,2],[217,13,2],[217,67,20],[217,121,2],[217,133,2],[218,0,2],[218,12,2],[218,120,2],[218,132,2],[219,0,2],[219,12,2],[219,120,2],[219,132,2],[220,0,2],[220,12,2],[220,120,2],[220,132,2],[221,0,2],[221,12,2],[221,120,2],[221,132,2],[222,0,2],[222,12,2],[222,120,2],[222,132,2],[223,0,2],[223,12,2],[223,120,2],[223,132,2],[224,0,2],[224,12,2],[224,120,2],[224,132,2]]}],"garden-ink":[{id:"garden-ink-0",area:329,bounds:{x:249,y:355,w:36,h:14},grip:{x:284.5,y:365.5},axis:{x:-.7566129366142373,y:.6538630316419336},length:24,duration:2.11,runs:[[0,11,8],[1,6,17],[2,3,23],[3,1,26],[4,0,30],[5,1,29],[6,2,30],[7,4,29],[8,5,29],[9,7,28],[10,9,27],[11,11,22],[12,13,19],[13,16,12]]},{id:"garden-ink-1",area:341,bounds:{x:316,y:356,w:37,h:14},grip:{x:352.5,y:360.5},axis:{x:-.7653878169400127,y:.6435693355651758},length:33,duration:2.11,runs:[[0,18,12],[1,14,19],[2,12,22],[3,10,26],[4,8,29],[5,6,29],[6,5,29],[7,3,30],[8,2,30],[9,1,29],[10,0,29],[11,3,24],[12,5,20],[13,9,13]]},{id:"garden-ink-2",area:495,bounds:{x:280,y:432,w:37,h:34},grip:{x:314.5,y:436.5},axis:{x:-.4398022320200175,y:.8980946479688043},length:35,duration:2.12,runs:[[0,12,12],[1,9,19],[2,6,24],[3,4,28],[4,1,34],[5,0,36],[6,0,37],[7,1,35],[8,3,32],[9,4,30],[10,5,27],[11,6,25],[12,8,22],[13,9,20],[14,10,18],[15,11,16],[16,13,13],[17,14,11],[18,15,8],[19,16,6],[20,18,3],[21,18,3],[22,18,3],[23,18,3],[24,18,3],[25,18,3],[26,17,3],[27,17,3],[28,17,3],[29,17,3],[30,17,3],[31,17,3],[32,17,3],[33,17,3]]},{id:"garden-ink-3",area:1717,bounds:{x:192,y:665,w:63,h:37},grip:{x:244.5,y:675.5},axis:{x:-.6082063251180126,y:.7937789781081647},length:44,duration:2.18,runs:[[0,18,13],[1,13,22],[2,10,28],[3,6,35],[4,5,38],[5,3,41],[6,2,45],[7,2,47],[8,2,48],[9,2,49],[10,2,51],[11,1,52],[12,1,53],[13,1,55],[14,1,56],[15,1,57],[16,1,58],[17,1,59],[18,1,60],[19,0,31],[19,33,10],[19,45,17],[20,0,31],[20,33,10],[20,45,18],[21,0,31],[21,33,10],[21,45,18],[22,0,31],[22,33,10],[22,45,18],[23,0,31],[23,33,10],[23,45,18],[24,1,30],[24,33,10],[24,45,18],[25,2,29],[25,33,10],[25,45,18],[26,4,26],[26,32,10],[26,44,19],[27,7,23],[27,32,10],[27,44,19],[28,8,22],[28,32,10],[28,44,18],[29,10,20],[29,32,10],[29,44,18],[30,13,17],[30,32,10],[30,44,18],[31,17,13],[31,32,10],[31,44,18],[32,19,11],[32,32,10],[32,44,18],[33,24,38],[34,28,34],[35,35,27],[36,50,12]]},{id:"garden-ink-4",area:1765,bounds:{x:316,y:668,w:60,h:38},grip:{x:375.5,y:674.5},axis:{x:-.5792071321891945,y:.8151804082662738},length:59,duration:2.19,runs:[[0,27,18],[1,22,26],[2,20,31],[3,17,37],[4,15,41],[5,14,44],[6,13,47],[7,10,50],[8,9,51],[9,7,53],[10,6,54],[11,6,54],[12,5,55],[13,3,57],[14,2,58],[15,1,59],[16,1,26],[16,29,10],[16,41,19],[17,0,27],[17,29,10],[17,41,19],[18,0,27],[18,29,10],[18,41,19],[19,0,27],[19,29,10],[19,41,19],[20,0,27],[20,29,10],[20,41,19],[21,0,27],[21,29,10],[21,41,19],[22,0,27],[22,29,10],[22,41,19],[23,0,26],[23,28,10],[23,40,20],[24,0,26],[24,28,10],[24,40,20],[25,0,26],[25,28,10],[25,40,20],[26,0,26],[26,28,10],[26,40,16],[27,0,26],[27,28,10],[27,40,15],[28,0,26],[28,28,10],[28,40,13],[29,0,26],[29,28,10],[29,40,10],[30,0,48],[31,0,45],[32,0,43],[33,0,40],[34,0,36],[35,0,33],[36,5,23],[37,13,5]]}],"garden-jade":[{id:"garden-jade-0",area:210,bounds:{x:457,y:382,w:22,h:18},grip:{x:477.5,y:383.5},axis:{x:-.4819187497721559,y:.876215908676647},length:24,duration:2.1,runs:[[0,2,14],[1,0,21],[2,0,22],[3,0,19],[4,0,18],[5,0,17],[6,0,16],[7,0,15],[8,0,14],[9,1,13],[10,1,10],[11,1,8],[12,1,7],[13,1,5],[14,2,4],[15,2,3],[16,2,2],[17,2,2]]},{id:"garden-jade-1",area:4647,bounds:{x:440,y:278,w:81,h:229},grip:{x:473.5,y:278.5},axis:{x:-.15719152225223032,y:.9875681370579079},length:224,duration:2.27,runs:[[0,33,1],[1,29,5],[2,25,10],[3,25,10],[4,26,9],[5,26,10],[6,26,10],[7,27,9],[8,27,10],[9,27,10],[10,28,9],[11,28,10],[12,28,10],[13,29,9],[14,29,10],[15,29,10],[16,30,9],[17,30,10],[18,30,10],[19,31,9],[20,31,10],[21,31,10],[22,32,9],[23,32,10],[24,32,10],[25,33,9],[26,33,9],[27,33,10],[28,34,9],[29,34,9],[30,34,10],[31,2,14],[31,34,10],[32,0,21],[32,35,9],[33,0,25],[33,35,10],[34,0,26],[34,35,10],[35,0,30],[35,36,9],[36,0,31],[36,36,10],[37,0,33],[37,36,10],[38,0,34],[38,37,9],[39,0,35],[39,37,10],[40,1,46],[41,1,46],[42,1,47],[43,1,47],[44,1,47],[45,2,47],[46,2,47],[47,2,47],[48,2,48],[49,3,47],[50,3,47],[51,4,47],[52,4,47],[53,5,46],[54,5,46],[55,5,47],[56,5,47],[57,6,46],[58,6,46],[59,7,45],[60,7,45],[61,8,44],[62,9,43],[63,9,42],[64,10,41],[65,11,40],[66,11,40],[67,12,39],[68,13,38],[69,15,35],[70,16,34],[71,17,33],[72,18,32],[73,20,30],[74,21,29],[75,23,27],[76,26,24],[77,30,20],[78,37,3],[78,47,9],[79,47,10],[80,47,10],[81,48,9],[82,48,9],[83,48,9],[84,48,10],[85,48,10],[86,49,9],[87,49,9],[88,49,9],[89,49,10],[90,49,10],[91,50,9],[92,50,9],[93,50,9],[94,50,10],[95,50,10],[96,51,9],[97,51,9],[98,51,10],[99,51,10],[100,52,9],[101,52,9],[102,52,9],[103,52,10],[104,52,10],[105,53,9],[106,53,9],[107,53,9],[108,53,10],[109,53,10],[110,54,9],[111,54,9],[112,54,9],[113,53,11],[114,56,8],[115,58,6],[116,59,5],[117,61,3],[118,61,4],[119,62,3],[120,63,2],[121,63,2],[122,64,1],[123,64,2],[124,64,2],[125,64,2],[126,64,2],[127,64,3],[128,64,3],[129,63,4],[130,63,4],[131,62,5],[132,61,7],[133,61,7],[134,59,9],[135,60,8],[136,60,8],[137,60,8],[138,60,8],[139,60,8],[140,60,8],[141,59,9],[142,59,8],[143,59,8],[144,58,9],[145,57,10],[146,56,11],[147,55,12],[148,41,2],[148,54,13],[149,43,2],[149,52,15],[150,47,20],[151,54,3],[151,62,9],[152,62,10],[153,62,10],[154,63,9],[155,63,9],[156,63,10],[157,63,10],[158,64,9],[159,64,9],[160,64,9],[161,64,10],[162,64,10],[163,65,9],[164,65,9],[165,65,9],[166,65,10],[167,65,10],[168,66,9],[169,66,9],[170,66,9],[171,66,10],[172,66,10],[173,67,9],[174,67,9],[175,67,9],[176,67,10],[177,67,10],[178,68,9],[179,68,9],[180,68,9],[181,68,10],[182,68,10],[183,28,14],[183,69,9],[184,26,21],[184,69,9],[185,26,25],[185,69,10],[186,26,26],[186,69,10],[187,26,30],[187,70,9],[188,26,31],[188,70,9],[189,26,33],[189,70,9],[190,26,34],[190,70,10],[191,26,35],[191,70,10],[192,27,36],[192,71,9],[193,27,37],[193,71,9],[194,27,37],[194,71,9],[195,27,38],[195,71,10],[196,27,39],[196,71,10],[197,28,39],[197,72,9],[198,28,39],[198,72,9],[199,28,40],[199,72,9],[200,28,41],[200,72,9],[201,29,40],[201,72,9],[202,29,41],[202,72,9],[203,30,19],[203,50,21],[203,72,9],[204,30,19],[204,52,28],[205,31,19],[205,53,27],[206,31,19],[206,55,25],[207,31,19],[207,57,23],[208,31,19],[208,58,22],[209,32,19],[209,60,19],[210,32,19],[210,61,18],[211,33,18],[211,62,16],[212,33,18],[212,64,14],[213,34,18],[213,65,13],[214,35,17],[214,66,12],[215,35,17],[215,67,10],[216,36,16],[216,67,10],[217,37,16],[217,68,9],[218,37,16],[218,69,8],[219,38,15],[219,70,7],[220,39,14],[220,71,6],[221,41,12],[221,71,5],[222,42,11],[222,72,4],[223,43,10],[223,73,3],[224,44,9],[224,74,2],[225,46,8],[225,74,2],[226,47,7],[226,75,1],[227,49,5],[227,75,1],[228,52,2]]},{id:"garden-jade-2",area:443,bounds:{x:461,y:508,w:57,h:54},grip:{x:517.5,y:508.5},axis:{x:-.42905681456828776,y:.9032775043542899},length:71,duration:2.12,runs:[[0,56,1],[1,56,1],[30,2,14],[31,0,21],[32,0,25],[33,0,26],[34,0,28],[35,0,28],[36,0,27],[37,0,26],[38,0,25],[39,1,23],[40,1,22],[41,1,22],[42,1,21],[43,1,20],[44,2,18],[45,2,17],[46,2,16],[47,2,15],[48,3,12],[49,3,11],[50,4,9],[51,4,7],[52,5,5],[53,5,3]]},{id:"garden-jade-3",area:16560,bounds:{x:78,y:278,w:445,h:467},grip:{x:135.5,y:280.5},axis:{x:-.39409743156705107,y:.9190686668754698},length:423,duration:2.47,runs:[[0,49,1],[1,49,5],[2,48,10],[3,48,10],[4,48,9],[5,47,10],[6,47,10],[7,47,9],[8,46,10],[9,46,10],[10,46,9],[11,45,10],[12,45,10],[13,45,9],[14,44,10],[15,44,10],[16,44,9],[17,43,10],[18,43,10],[19,43,9],[20,42,10],[21,42,10],[22,42,9],[23,41,10],[24,41,10],[25,41,9],[26,41,9],[27,40,10],[28,40,9],[29,40,9],[30,39,10],[31,39,10],[31,66,14],[32,39,9],[32,61,22],[33,38,10],[33,57,25],[34,38,10],[34,56,26],[35,38,9],[35,52,30],[36,37,10],[36,51,31],[37,37,10],[37,49,33],[38,37,9],[38,48,34],[39,36,10],[39,47,35],[40,36,45],[41,36,45],[42,35,46],[43,35,46],[44,35,46],[45,34,46],[46,34,46],[47,34,46],[48,33,47],[49,33,46],[50,33,46],[51,32,46],[52,32,46],[53,32,46],[54,32,46],[55,31,46],[56,31,46],[57,31,45],[58,31,45],[59,31,44],[60,30,45],[61,30,44],[62,30,43],[63,31,42],[64,31,41],[65,31,40],[66,31,40],[67,31,39],[68,31,38],[69,32,36],[70,32,34],[71,32,33],[72,32,32],[73,32,30],[74,32,29],[75,32,27],[76,33,23],[77,33,20],[78,27,9],[78,42,3],[79,26,10],[80,26,10],[81,26,9],[82,26,9],[83,26,9],[84,25,10],[85,25,10],[86,25,9],[87,25,9],[88,25,9],[89,24,10],[90,24,10],[91,24,9],[92,24,9],[93,24,9],[94,23,10],[95,23,10],[96,23,9],[97,23,9],[98,22,10],[99,22,10],[100,22,9],[101,22,9],[102,22,9],[103,21,10],[104,21,10],[104,49,14],[105,21,9],[105,44,22],[106,21,9],[106,40,25],[107,21,9],[107,39,26],[108,20,10],[108,35,30],[109,20,10],[109,34,31],[110,20,9],[110,32,33],[111,20,9],[111,31,34],[112,20,9],[112,30,35],[113,19,45],[114,19,45],[115,19,45],[116,19,45],[117,19,45],[118,18,45],[119,18,45],[120,18,45],[121,18,45],[122,18,44],[123,17,45],[124,17,44],[125,17,44],[126,17,44],[127,16,45],[128,16,44],[129,16,44],[130,16,43],[131,16,43],[132,15,43],[133,15,43],[134,15,42],[135,15,41],[136,15,41],[137,14,41],[138,14,40],[139,14,40],[140,14,39],[141,14,38],[142,15,36],[143,15,34],[144,15,33],[145,15,32],[146,15,30],[147,15,29],[148,15,27],[149,16,23],[150,16,20],[151,12,9],[151,25,3],[152,11,10],[153,11,10],[154,11,9],[155,11,9],[156,10,10],[157,10,10],[158,10,9],[159,10,9],[160,10,9],[161,9,10],[162,9,10],[163,9,9],[164,9,9],[165,9,9],[166,8,10],[167,8,10],[168,8,9],[169,8,9],[170,8,9],[171,7,10],[172,7,10],[173,7,9],[174,7,9],[175,7,9],[176,6,10],[177,6,10],[178,6,9],[179,6,9],[180,6,9],[181,5,10],[182,5,10],[183,5,9],[183,48,6],[184,5,9],[184,48,9],[185,4,10],[185,49,7],[186,4,10],[186,50,6],[187,4,9],[187,50,6],[188,4,9],[188,53,3],[189,4,9],[190,3,10],[191,3,10],[192,3,9],[193,3,9],[194,3,9],[195,2,10],[196,2,10],[197,2,9],[198,2,9],[199,2,9],[200,2,9],[201,2,9],[202,2,9],[202,12,1],[203,2,11],[204,3,11],[205,3,11],[206,3,11],[207,3,12],[208,3,13],[209,3,13],[210,3,14],[211,4,14],[212,4,13],[213,4,13],[214,4,13],[215,5,12],[216,5,12],[217,5,12],[218,5,13],[219,5,13],[220,5,13],[221,6,13],[222,6,14],[223,6,14],[224,6,15],[225,6,17],[226,6,18],[227,6,21],[228,7,23],[229,7,20],[230,5,9],[230,16,3],[231,5,9],[232,5,9],[233,5,9],[234,5,9],[235,5,9],[236,5,9],[237,5,9],[238,5,9],[239,5,9],[240,6,9],[241,6,9],[242,6,9],[243,6,9],[244,6,9],[245,6,9],[246,6,9],[247,6,9],[248,6,9],[249,6,9],[250,6,9],[251,7,9],[252,7,9],[253,7,9],[254,7,9],[255,7,9],[256,7,9],[257,7,9],[258,7,9],[259,7,9],[260,7,9],[260,45,14],[261,7,9],[261,40,22],[262,7,9],[262,36,25],[263,8,9],[263,35,26],[264,8,9],[264,31,30],[265,8,9],[265,30,31],[266,8,9],[266,28,33],[267,8,9],[267,27,34],[268,8,9],[268,26,35],[269,8,9],[269,25,35],[270,8,9],[270,23,37],[271,8,9],[271,23,37],[272,8,9],[272,22,38],[273,8,9],[273,21,39],[274,8,9],[274,20,39],[275,9,9],[275,20,39],[276,9,9],[276,19,40],[277,9,50],[278,9,49],[279,9,49],[280,9,48],[281,9,48],[282,9,48],[283,9,48],[284,9,47],[285,9,47],[286,10,45],[287,10,45],[288,10,44],[289,10,44],[290,10,43],[291,10,42],[292,10,42],[293,10,41],[294,10,40],[295,10,40],[296,10,39],[297,10,38],[298,11,36],[299,11,34],[300,11,33],[301,11,32],[302,11,30],[303,11,29],[304,11,27],[305,12,23],[306,12,20],[307,11,9],[307,21,3],[308,11,9],[309,11,9],[310,12,9],[311,12,9],[312,12,9],[313,12,9],[314,12,9],[315,12,9],[316,12,9],[317,12,9],[318,12,9],[319,12,9],[320,12,9],[321,12,9],[322,13,9],[323,13,9],[324,13,9],[325,13,9],[326,13,9],[327,13,9],[328,13,10],[329,13,10],[330,14,9],[331,14,10],[332,14,10],[333,15,9],[333,64,14],[334,15,9],[334,63,18],[335,15,10],[335,64,16],[336,15,10],[336,65,15],[337,16,9],[337,66,14],[338,16,10],[338,67,13],[339,16,10],[339,67,13],[340,17,9],[340,67,13],[341,17,10],[341,68,12],[342,17,10],[342,68,11],[343,18,9],[343,68,11],[344,18,10],[344,68,11],[345,19,9],[345,68,11],[346,20,8],[346,68,11],[347,21,7],[347,67,11],[348,21,8],[348,67,11],[349,22,7],[349,67,11],[350,23,6],[350,66,12],[351,23,7],[351,65,12],[352,24,6],[352,65,12],[353,25,5],[353,65,11],[354,25,6],[354,65,11],[355,26,5],[355,65,11],[356,26,5],[356,65,11],[357,26,5],[357,65,10],[358,26,6],[358,64,11],[359,27,5],[359,64,10],[360,27,5],[360,63,11],[361,28,5],[361,63,10],[362,28,6],[362,62,11],[363,28,7],[363,61,11],[364,28,9],[364,47,2],[364,59,12],[365,29,10],[365,45,6],[365,57,14],[366,29,41],[367,29,40],[368,29,40],[369,29,39],[370,29,38],[371,30,36],[372,30,34],[373,30,33],[374,30,32],[375,30,30],[376,30,29],[377,30,27],[378,31,23],[379,31,20],[380,29,10],[380,40,3],[380,415,1],[381,29,10],[381,415,1],[382,30,9],[382,414,1],[383,30,9],[383,413,2],[384,30,10],[384,412,3],[385,30,10],[385,411,4],[386,31,9],[386,410,4],[387,31,10],[387,409,5],[388,31,10],[388,408,6],[389,32,9],[389,407,6],[390,32,10],[390,406,7],[391,32,10],[391,405,8],[392,33,9],[392,404,8],[393,33,10],[393,403,9],[394,33,10],[394,402,10],[395,34,9],[395,402,9],[396,34,9],[396,402,9],[397,34,10],[397,401,10],[398,34,10],[398,401,10],[399,35,9],[399,401,9],[400,35,10],[400,107,5],[400,400,10],[401,35,10],[401,103,9],[401,400,10],[402,36,9],[402,99,14],[402,400,9],[403,36,10],[403,94,19],[403,399,10],[404,36,10],[404,88,25],[404,399,10],[405,37,9],[405,84,30],[405,399,9],[406,37,10],[406,81,33],[406,398,10],[407,37,10],[407,77,37],[407,398,10],[408,38,9],[408,74,40],[408,398,9],[409,38,9],[409,72,42],[409,398,9],[410,38,10],[410,69,45],[410,397,10],[411,38,10],[411,66,49],[411,397,10],[412,39,9],[412,62,54],[412,379,3],[412,397,9],[413,39,10],[413,59,59],[413,377,8],[413,396,10],[414,39,10],[414,55,66],[414,375,14],[414,396,10],[415,40,9],[415,52,70],[415,373,19],[415,396,9],[416,40,84],[416,371,23],[416,395,10],[417,40,87],[417,369,36],[418,41,90],[418,367,37],[419,41,92],[419,365,39],[420,39,99],[420,362,43],[421,36,106],[421,360,48],[422,33,107],[422,357,54],[423,30,101],[423,354,60],[424,28,93],[424,352,64],[425,25,87],[425,349,70],[426,22,86],[426,346,76],[427,20,83],[427,343,81],[428,18,81],[428,345,81],[429,15,79],[429,350,79],[430,13,72],[430,359,72],[431,11,70],[431,363,70],[432,9,67],[432,368,67],[433,7,65],[433,372,66],[434,4,63],[434,377,63],[435,2,61],[435,381,62],[436,0,58],[436,386,59],[437,6,48],[437,390,49],[438,11,38],[438,395,38],[439,15,31],[439,398,31],[440,18,25],[440,402,24],[441,22,18],[441,405,17],[442,26,23],[442,395,23],[443,29,29],[443,386,29],[444,33,30],[444,381,30],[445,39,28],[445,377,28],[446,44,32],[446,368,32],[447,48,37],[447,359,37],[448,51,43],[448,350,43],[449,55,48],[449,341,48],[450,61,51],[450,332,51],[451,66,55],[451,323,55],[452,72,68],[452,304,68],[453,77,72],[453,295,72],[454,83,84],[454,277,84],[455,88,106],[455,250,106],[456,94,256],[457,99,246],[458,111,223],[459,117,211],[460,122,200],[461,133,178],[462,144,156],[463,155,134],[464,166,112],[465,177,90],[466,199,46]]}],"garden-mint":[{id:"garden-mint-0",area:1664,bounds:{x:490,y:309,w:51,h:48},grip:{x:540.5,y:310.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:64,duration:2.18,runs:[[0,34,14],[1,29,22],[2,25,25],[3,24,26],[4,20,30],[5,19,31],[6,17,33],[7,16,34],[8,15,35],[9,14,35],[10,12,37],[11,12,37],[12,11,38],[13,10,39],[14,9,39],[15,9,39],[16,8,40],[17,7,41],[18,7,40],[19,6,41],[20,5,41],[21,5,41],[22,4,42],[23,4,42],[24,4,41],[25,4,41],[26,3,41],[27,3,41],[28,2,41],[29,2,41],[30,2,40],[31,2,39],[32,1,40],[33,1,39],[34,1,38],[35,1,38],[36,1,37],[37,1,36],[38,0,36],[39,0,34],[40,0,33],[41,0,32],[42,0,30],[43,0,29],[44,0,27],[45,0,24],[46,0,21],[47,10,3]]},{id:"garden-mint-1",area:1662,bounds:{x:60,y:309,w:51,h:48},grip:{x:89.5,y:313.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:40,duration:2.18,runs:[[0,2,14],[1,0,21],[2,0,25],[3,0,26],[4,0,30],[5,0,31],[6,0,33],[7,0,34],[8,0,35],[9,1,36],[10,1,37],[11,1,37],[12,1,38],[13,1,39],[14,2,39],[15,2,39],[16,2,40],[17,2,41],[18,3,40],[19,3,41],[20,4,41],[21,4,41],[22,5,41],[23,5,41],[24,5,41],[25,5,41],[26,6,41],[27,6,41],[28,7,41],[29,7,41],[30,8,40],[31,9,39],[32,9,40],[33,10,39],[34,11,38],[35,11,38],[36,12,37],[37,13,36],[38,15,35],[39,16,34],[40,17,33],[41,18,32],[42,20,30],[43,21,29],[44,23,27],[45,26,25],[46,30,21],[47,37,3]]},{id:"garden-mint-2",area:1664,bounds:{x:507,y:382,w:51,h:48},grip:{x:557.5,y:383.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:64,duration:2.18,runs:[[0,34,14],[1,29,22],[2,25,25],[3,24,26],[4,20,30],[5,19,31],[6,17,33],[7,16,34],[8,15,35],[9,14,35],[10,12,37],[11,12,37],[12,11,38],[13,10,39],[14,9,39],[15,9,39],[16,8,40],[17,7,41],[18,7,40],[19,6,41],[20,5,41],[21,5,41],[22,4,42],[23,4,42],[24,4,41],[25,4,41],[26,3,41],[27,3,41],[28,2,41],[29,2,41],[30,2,40],[31,2,39],[32,1,40],[33,1,39],[34,1,38],[35,1,38],[36,1,37],[37,1,36],[38,0,36],[39,0,34],[40,0,33],[41,0,32],[42,0,30],[43,0,29],[44,0,27],[45,0,24],[46,0,21],[47,10,3]]},{id:"garden-mint-3",area:1662,bounds:{x:43,y:382,w:51,h:48},grip:{x:72.5,y:386.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:40,duration:2.18,runs:[[0,2,14],[1,0,21],[2,0,25],[3,0,26],[4,0,30],[5,0,31],[6,0,33],[7,0,34],[8,0,35],[9,1,36],[10,1,37],[11,1,37],[12,1,38],[13,1,39],[14,2,39],[15,2,39],[16,2,40],[17,2,41],[18,3,40],[19,3,41],[20,4,41],[21,4,41],[22,5,41],[23,5,41],[24,5,41],[25,5,41],[26,6,41],[27,6,41],[28,7,41],[29,7,41],[30,8,40],[31,9,39],[32,9,40],[33,10,39],[34,11,38],[35,11,38],[36,12,37],[37,13,36],[38,15,35],[39,16,34],[40,17,33],[41,18,32],[42,20,30],[43,21,29],[44,23,27],[45,26,25],[46,30,21],[47,37,3]]},{id:"garden-mint-4",area:1664,bounds:{x:516,y:461,w:51,h:48},grip:{x:566.5,y:462.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:64,duration:2.18,runs:[[0,34,14],[1,29,22],[2,25,25],[3,24,26],[4,20,30],[5,19,31],[6,17,33],[7,16,34],[8,15,35],[9,14,35],[10,12,37],[11,12,37],[12,11,38],[13,10,39],[14,9,39],[15,9,39],[16,8,40],[17,7,41],[18,7,40],[19,6,41],[20,5,41],[21,5,41],[22,4,42],[23,4,42],[24,4,41],[25,4,41],[26,3,41],[27,3,41],[28,2,41],[29,2,41],[30,2,40],[31,2,39],[32,1,40],[33,1,39],[34,1,38],[35,1,38],[36,1,37],[37,1,36],[38,0,36],[39,0,34],[40,0,33],[41,0,32],[42,0,30],[43,0,29],[44,0,27],[45,0,24],[46,0,21],[47,10,3]]},{id:"garden-mint-5",area:1662,bounds:{x:34,y:461,w:51,h:48},grip:{x:63.5,y:465.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:40,duration:2.18,runs:[[0,2,14],[1,0,21],[2,0,25],[3,0,26],[4,0,30],[5,0,31],[6,0,33],[7,0,34],[8,0,35],[9,1,36],[10,1,37],[11,1,37],[12,1,38],[13,1,39],[14,2,39],[15,2,39],[16,2,40],[17,2,41],[18,3,40],[19,3,41],[20,4,41],[21,4,41],[22,5,41],[23,5,41],[24,5,41],[25,5,41],[26,6,41],[27,6,41],[28,7,41],[29,7,41],[30,8,40],[31,9,39],[32,9,40],[33,10,39],[34,11,38],[35,11,38],[36,12,37],[37,13,36],[38,15,35],[39,16,34],[40,17,33],[41,18,32],[42,20,30],[43,21,29],[44,23,27],[45,26,25],[46,30,21],[47,37,3]]},{id:"garden-mint-6",area:1136,bounds:{x:527,y:538,w:35,h:47},grip:{x:561.5,y:539.5},axis:{x:-.3177404134118965,y:.9481777416101039},length:55,duration:2.16,runs:[[0,18,14],[1,13,22],[2,9,25],[3,8,26],[4,4,30],[5,3,31],[6,2,32],[7,2,32],[8,2,32],[9,2,31],[10,2,31],[11,2,31],[12,2,31],[13,2,31],[14,3,29],[15,3,29],[16,3,29],[17,3,29],[18,3,28],[19,3,28],[20,3,27],[21,2,28],[22,2,28],[23,2,28],[24,2,27],[25,2,27],[26,2,26],[27,2,26],[28,2,25],[29,2,25],[30,2,24],[31,2,23],[32,2,23],[33,1,23],[34,1,22],[35,1,22],[36,1,21],[37,1,20],[38,1,19],[39,1,17],[40,0,17],[41,0,16],[42,0,14],[43,0,13],[44,0,11],[45,0,8],[46,0,5]]},{id:"garden-mint-7",area:1662,bounds:{x:39,y:538,w:51,h:48},grip:{x:68.5,y:542.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:40,duration:2.18,runs:[[0,2,14],[1,0,21],[2,0,25],[3,0,26],[4,0,30],[5,0,31],[6,0,33],[7,0,34],[8,0,35],[9,1,36],[10,1,37],[11,1,37],[12,1,38],[13,1,39],[14,2,39],[15,2,39],[16,2,40],[17,2,41],[18,3,40],[19,3,41],[20,4,41],[21,4,41],[22,5,41],[23,5,41],[24,5,41],[25,5,41],[26,6,41],[27,6,41],[28,7,41],[29,7,41],[30,8,40],[31,9,39],[32,9,40],[33,10,39],[34,11,38],[35,11,38],[36,12,37],[37,13,36],[38,15,35],[39,16,34],[40,17,33],[41,18,32],[42,20,30],[43,21,29],[44,23,27],[45,26,25],[46,30,21],[47,37,3]]},{id:"garden-mint-8",area:1662,bounds:{x:58,y:611,w:51,h:48},grip:{x:87.5,y:615.5},axis:{x:-.43135573416435086,y:.9021819276640017},length:40,duration:2.18,runs:[[0,2,14],[1,0,21],[2,0,25],[3,0,26],[4,0,30],[5,0,31],[6,0,33],[7,0,34],[8,0,35],[9,1,36],[10,1,37],[11,1,37],[12,1,38],[13,1,39],[14,2,39],[15,2,39],[16,2,40],[17,2,41],[18,3,40],[19,3,41],[20,4,41],[21,4,41],[22,5,41],[23,5,41],[24,5,41],[25,5,41],[26,6,41],[27,6,41],[28,7,41],[29,7,41],[30,8,40],[31,9,39],[32,9,40],[33,10,39],[34,11,38],[35,11,38],[36,12,37],[37,13,36],[38,15,35],[39,16,34],[40,17,33],[41,18,32],[42,20,30],[43,21,29],[44,23,27],[45,26,25],[46,30,21],[47,37,3]]},{id:"garden-mint-9",area:1236,bounds:{x:494,y:611,w:49,h:48},grip:{x:542.5,y:612.5},axis:{x:-.41743679953035023,y:.9087059581613066},length:62,duration:2.16,runs:[[0,32,14],[1,27,22],[2,25,23],[3,24,24],[4,24,24],[5,23,25],[6,23,25],[7,23,25],[8,22,26],[9,22,25],[10,22,25],[11,21,26],[12,21,26],[13,20,27],[14,20,26],[15,19,27],[16,19,27],[17,18,28],[18,18,27],[19,17,28],[20,17,27],[21,16,28],[22,16,28],[23,15,29],[24,14,29],[25,14,29],[26,13,29],[27,13,29],[28,12,29],[29,12,29],[30,11,29],[31,10,29],[32,10,29],[33,9,29],[34,9,28],[35,8,29],[36,8,28],[37,7,28],[38,6,28],[39,6,26],[40,5,26],[41,4,26],[42,3,25],[43,3,24],[44,2,23],[45,1,21],[46,0,19],[47,8,3]]}],"garden-rose":[{id:"garden-rose-0",area:1611,bounds:{x:202,y:267,w:49,h:64},grip:{x:202.5,y:267.5},axis:{x:-.3257402721147517,y:.9454592932128847},length:59,duration:2.18,runs:[[0,0,1],[1,0,2],[2,0,4],[3,0,5],[4,0,7],[5,0,9],[6,1,9],[7,1,11],[8,1,12],[9,1,14],[10,1,15],[11,1,17],[12,1,18],[13,1,19],[14,1,20],[15,1,21],[16,2,21],[17,2,23],[18,2,24],[19,2,25],[20,2,26],[21,2,28],[22,2,29],[23,2,29],[24,2,30],[25,2,31],[26,2,32],[27,3,32],[28,3,33],[29,3,34],[30,3,35],[31,3,35],[32,3,36],[33,3,37],[34,3,38],[35,3,39],[36,3,40],[37,4,40],[38,4,40],[39,4,41],[40,4,42],[41,4,42],[42,4,43],[43,4,44],[44,4,44],[45,4,45],[46,4,43],[47,4,40],[48,5,37],[49,5,35],[50,5,32],[51,5,30],[52,5,28],[53,5,25],[54,5,23],[55,5,21],[56,5,18],[57,5,16],[58,6,13],[59,6,10],[60,6,8],[61,6,6],[62,6,3],[63,6,1]]},{id:"garden-rose-1",area:1381,bounds:{x:344,y:267,w:45,h:70},grip:{x:388.5,y:267.5},axis:{x:-.27789146681702187,y:.9606124778860016},length:71,duration:2.17,runs:[[0,43,2],[1,42,3],[2,41,4],[3,40,4],[4,39,5],[5,38,6],[6,37,7],[7,36,8],[8,35,9],[9,34,9],[10,33,10],[11,32,11],[12,31,12],[13,29,14],[14,29,14],[15,28,14],[16,27,15],[17,26,16],[18,25,17],[19,24,18],[20,23,19],[21,22,19],[22,22,19],[23,21,20],[24,20,21],[25,19,22],[26,17,23],[27,17,23],[28,16,24],[29,15,25],[30,14,26],[31,13,27],[32,13,26],[33,12,27],[34,10,29],[35,9,30],[36,9,30],[37,8,31],[38,7,31],[39,6,32],[40,5,33],[41,4,34],[42,3,35],[43,3,35],[44,2,35],[45,1,36],[46,1,36],[47,0,37],[48,1,36],[49,3,33],[50,4,32],[51,6,30],[52,7,29],[53,9,27],[54,10,26],[55,12,23],[56,13,22],[57,15,20],[58,16,19],[59,17,18],[60,19,16],[61,20,14],[62,22,12],[63,23,11],[64,25,9],[65,26,8],[66,28,6],[67,29,4],[68,31,2],[69,32,1]]},{id:"garden-rose-2",area:1324,bounds:{x:460,y:384,w:44,h:44},grip:{x:487.5,y:385.5},axis:{x:-.41036467732879783,y:.9119215051751063},length:46,duration:2.17,runs:[[0,19,6],[1,16,12],[2,15,14],[3,14,16],[4,13,18],[5,12,20],[6,11,22],[7,11,22],[8,8,28],[9,6,32],[10,5,34],[11,3,38],[12,3,38],[13,2,40],[14,1,42],[15,1,42],[16,0,44],[17,0,20],[17,24,20],[18,0,18],[18,26,18],[19,0,17],[19,27,17],[20,0,17],[20,27,17],[21,0,16],[21,28,16],[22,0,16],[22,28,16],[23,1,15],[23,28,15],[24,1,15],[24,28,15],[25,2,15],[25,27,15],[26,3,14],[26,27,14],[27,3,15],[27,26,15],[28,5,15],[28,24,15],[29,4,36],[30,4,36],[31,4,36],[32,4,36],[33,4,36],[34,4,36],[35,5,34],[36,5,34],[37,5,34],[38,6,32],[39,7,30],[40,8,28],[41,9,26],[42,10,11],[42,23,11],[43,12,7],[43,25,7]]},{id:"garden-rose-3",area:1718,bounds:{x:91,y:457,w:50,h:49},grip:{x:121.5,y:458.5},axis:{x:-.41729321997684643,y:.90877190128291},length:51,duration:2.18,runs:[[0,22,6],[1,19,12],[2,18,14],[3,16,18],[4,15,20],[5,15,20],[6,14,22],[7,13,24],[8,13,24],[9,10,30],[10,7,36],[11,6,38],[12,4,42],[13,3,44],[14,3,44],[15,2,46],[16,1,48],[17,1,48],[18,1,48],[19,0,50],[20,0,23],[20,27,23],[21,0,21],[21,29,21],[22,0,20],[22,30,20],[23,0,20],[23,30,20],[24,0,19],[24,31,19],[25,1,18],[25,31,18],[26,1,18],[26,31,18],[27,1,18],[27,31,18],[28,2,18],[28,30,18],[29,3,17],[29,30,17],[30,3,18],[30,29,18],[31,4,19],[31,27,19],[32,5,40],[33,4,42],[34,4,42],[35,4,42],[36,4,42],[37,4,42],[38,4,42],[39,5,40],[40,5,40],[41,5,40],[42,6,38],[43,7,36],[44,7,36],[45,8,34],[46,10,30],[47,11,13],[47,26,13],[48,14,7],[48,29,7]]},{id:"garden-rose-4",area:1136,bounds:{x:106,y:604,w:40,h:40},grip:{x:128.5,y:604.5},axis:{x:-.4103646773287979,y:.9119215051751064},length:42,duration:2.16,runs:[[0,17,6],[1,15,10],[2,13,14],[3,12,16],[4,11,18],[5,11,18],[6,10,20],[7,7,26],[8,5,30],[9,4,32],[10,3,34],[11,2,36],[12,1,38],[13,1,38],[14,1,38],[15,0,40],[16,0,18],[16,22,18],[17,0,17],[17,23,17],[18,0,16],[18,24,16],[19,0,15],[19,25,15],[20,0,15],[20,25,15],[21,1,14],[21,25,14],[22,1,14],[22,25,14],[23,1,15],[23,24,15],[24,2,15],[24,23,15],[25,3,15],[25,22,15],[26,3,34],[27,3,34],[28,3,34],[29,3,34],[30,3,34],[31,3,34],[32,4,32],[33,4,32],[34,5,30],[35,5,30],[36,6,28],[37,7,26],[38,9,10],[38,21,10],[39,11,6],[39,23,6]]},{id:"garden-rose-5",area:1574,bounds:{x:433,y:629,w:48,h:47},grip:{x:462.5,y:630.5},axis:{x:-.417586455570978,y:.9086371949924058},length:49,duration:2.18,runs:[[0,21,6],[1,18,12],[2,17,14],[3,15,18],[4,14,20],[5,14,20],[6,13,22],[7,12,24],[8,12,24],[9,9,30],[10,7,34],[11,5,38],[12,4,40],[13,3,42],[14,2,44],[15,2,44],[16,1,46],[17,1,46],[18,0,48],[19,0,22],[19,26,22],[20,0,20],[20,28,20],[21,0,19],[21,29,19],[22,0,19],[22,29,19],[23,0,18],[23,30,18],[24,0,18],[24,30,18],[25,1,17],[25,30,17],[26,1,17],[26,30,17],[27,2,17],[27,29,17],[28,2,17],[28,29,17],[29,3,17],[29,28,17],[30,4,18],[30,26,18],[31,4,40],[32,4,40],[33,4,40],[34,4,40],[35,4,40],[36,4,40],[37,4,40],[38,5,38],[39,5,38],[40,6,36],[41,6,36],[42,7,34],[43,8,32],[44,9,30],[45,11,12],[45,25,12],[46,13,8],[46,27,8]]}],"garden-gold":[{id:"garden-gold-0",area:230,bounds:{x:257,y:89,w:29,h:132},grip:{x:269.5,y:89.5},axis:{x:-.09838400197030012,y:.9951485256765987},length:131,duration:2.1,runs:[[0,12,1],[1,12,1],[2,11,3],[3,11,3],[4,10,5],[5,10,5],[6,9,7],[7,9,7],[8,8,9],[9,6,13],[10,4,17],[11,2,21],[12,0,25],[13,2,21],[14,4,17],[15,6,13],[16,8,9],[17,9,7],[18,9,7],[19,10,5],[20,10,5],[21,11,3],[22,11,3],[23,12,1],[24,12,1],[127,25,3],[128,24,5],[129,24,5],[130,24,5],[131,25,3]]},{id:"garden-gold-1",area:383,bounds:{x:82,y:123,w:124,h:127},grip:{x:131.5,y:123.5},axis:{x:-.40225538939164096,y:.9155274991530179},length:136,duration:2.11,runs:[[0,49,1],[1,49,1],[2,48,3],[3,48,3],[4,48,3],[5,48,3],[6,47,5],[7,47,5],[8,47,5],[9,47,5],[10,46,7],[11,46,7],[12,46,7],[13,46,7],[14,45,9],[15,45,9],[16,41,17],[17,38,23],[18,34,31],[19,30,39],[20,34,31],[21,38,23],[22,41,17],[23,45,9],[24,45,9],[25,46,7],[26,46,7],[27,46,7],[28,46,7],[29,47,5],[30,47,5],[31,47,5],[32,47,5],[33,48,3],[34,48,3],[35,48,3],[35,120,3],[36,48,3],[36,119,5],[37,49,1],[37,119,5],[38,49,1],[38,119,5],[39,120,3],[122,1,3],[123,0,5],[124,0,5],[125,0,5],[126,1,3]]},{id:"garden-gold-2",area:9392,bounds:{x:332,y:78,w:197,h:582},grip:{x:464.5,y:78.5},axis:{x:-.15058274955091175,y:.9885974082191836},length:577,duration:2.36,runs:[[0,130,3],[1,129,5],[2,129,5],[3,129,5],[4,130,3],[12,116,2],[13,117,4],[14,118,5],[15,119,6],[16,119,7],[17,120,8],[18,121,9],[19,121,10],[20,122,11],[21,123,11],[22,123,13],[23,124,13],[24,124,14],[25,125,15],[26,125,16],[27,126,16],[28,126,17],[29,127,17],[30,127,18],[31,128,18],[32,128,19],[33,129,19],[34,129,20],[35,129,21],[36,130,21],[37,130,22],[38,130,23],[39,131,23],[40,131,23],[41,131,24],[42,132,24],[43,132,25],[44,132,25],[45,132,26],[46,133,26],[47,133,26],[48,133,27],[49,133,28],[50,134,27],[51,134,28],[52,134,28],[53,134,29],[54,134,30],[55,134,30],[56,134,31],[57,135,30],[58,135,31],[59,135,31],[60,135,31],[61,135,32],[62,135,32],[63,135,33],[64,135,33],[65,135,33],[66,135,34],[67,135,34],[68,135,34],[69,135,35],[70,135,35],[71,135,35],[72,135,36],[73,135,36],[74,135,36],[75,135,36],[76,134,38],[77,134,38],[78,134,38],[79,134,38],[80,134,38],[81,134,39],[82,134,39],[83,133,40],[84,133,40],[85,133,40],[86,133,40],[87,132,42],[88,132,42],[89,132,42],[90,132,42],[91,131,43],[92,131,43],[93,131,43],[94,130,44],[95,130,44],[96,130,44],[97,129,45],[98,129,45],[99,129,45],[100,128,46],[101,128,46],[102,127,47],[103,127,47],[104,126,48],[105,126,48],[106,125,49],[107,125,48],[108,124,49],[109,124,49],[110,123,50],[111,123,50],[112,122,51],[113,121,51],[114,121,51],[115,120,52],[116,119,53],[117,119,53],[118,118,53],[119,117,54],[120,116,55],[121,116,55],[122,115,55],[123,114,56],[124,113,57],[125,112,57],[126,111,58],[127,110,59],[128,109,59],[129,108,60],[130,107,61],[131,106,61],[132,105,62],[133,104,62],[134,103,63],[135,102,64],[136,100,65],[137,99,66],[138,97,67],[139,0,1],[139,96,68],[140,1,1],[140,95,68],[141,2,2],[141,93,69],[142,2,4],[142,91,71],[143,3,5],[143,89,72],[144,3,6],[144,88,73],[145,4,7],[145,86,74],[146,5,9],[146,83,76],[147,5,11],[147,81,78],[148,6,12],[148,79,79],[149,7,14],[149,76,81],[150,7,17],[150,73,84],[151,8,20],[151,69,87],[152,9,24],[152,64,91],[153,10,29],[153,58,96],[154,10,144],[155,11,142],[156,12,140],[157,13,138],[158,14,136],[159,15,134],[160,16,132],[161,17,130],[162,18,128],[163,19,126],[164,20,53],[164,74,70],[165,21,50],[165,74,69],[166,22,47],[166,74,68],[167,23,44],[167,74,67],[168,24,41],[168,73,67],[169,26,37],[169,73,65],[170,27,34],[170,73,64],[171,28,31],[171,73,63],[172,30,28],[172,73,61],[173,31,26],[173,73,60],[174,33,23],[174,72,59],[175,34,20],[175,72,58],[176,36,16],[176,72,56],[177,38,13],[177,72,54],[178,39,11],[178,72,53],[179,41,7],[179,72,51],[180,43,3],[180,71,50],[181,71,47],[182,71,45],[183,71,42],[184,71,39],[185,71,36],[186,71,32],[187,70,28],[188,72,20],[197,174,3],[198,173,5],[199,173,5],[200,173,5],[201,174,3],[323,148,4],[324,146,8],[325,145,10],[326,145,10],[327,144,12],[328,144,12],[329,144,12],[330,144,12],[331,145,10],[332,145,10],[333,146,8],[334,148,4],[351,192,5],[352,192,5],[353,192,5],[354,193,3],[570,123,4],[571,121,8],[572,120,10],[573,120,10],[574,119,12],[575,119,12],[576,119,12],[577,119,12],[578,120,10],[579,120,10],[580,121,8],[581,123,4]]},{id:"garden-gold-3",area:359,bounds:{x:87,y:304,w:65,h:326},grip:{x:150.5,y:304.5},axis:{x:-.0893649364526397,y:.9959989498653176},length:328,duration:2.11,runs:[[0,61,3],[1,60,5],[2,60,5],[3,60,5],[4,61,3],[56,11,1],[57,10,3],[58,10,3],[59,9,5],[60,9,5],[61,8,7],[62,8,7],[63,7,8],[64,5,10],[65,4,11],[66,2,13],[67,0,15],[68,2,12],[69,4,10],[70,5,9],[71,7,7],[72,8,5],[73,8,5],[74,9,4],[75,9,4],[76,10,3],[77,10,2],[78,11,1],[173,27,4],[174,25,8],[175,24,10],[176,24,10],[177,23,12],[178,23,12],[179,23,12],[180,23,12],[181,24,10],[182,24,10],[183,25,8],[184,27,4],[316,37,4],[317,36,6],[318,35,8],[319,34,10],[320,34,10],[321,34,10],[322,34,10],[323,35,8],[324,36,6],[325,37,4]]}],"garden-night":[{id:"garden-night-0",area:326716,bounds:{x:0,y:0,w:600,h:800},grip:{x:599.5,y:.5},axis:{x:-.31977864415817975,y:.9474922789871992},length:950,duration:3,runs:[[0,0,600],[1,0,600],[2,0,600],[3,0,600],[4,0,600],[5,0,600],[6,0,600],[7,0,600],[8,0,600],[9,0,600],[10,0,600],[11,0,600],[12,0,600],[13,0,600],[14,0,600],[15,0,600],[16,0,600],[17,0,600],[18,0,600],[19,0,600],[20,0,600],[21,0,600],[22,0,600],[23,0,600],[24,0,600],[25,0,600],[26,0,600],[27,0,600],[28,0,600],[29,0,600],[30,0,600],[31,0,600],[32,0,600],[33,0,600],[34,0,600],[35,0,600],[36,0,600],[37,0,600],[38,0,600],[39,0,600],[40,0,600],[41,0,600],[42,0,600],[43,0,600],[44,0,600],[45,0,600],[46,0,600],[47,0,600],[48,0,600],[49,0,600],[50,0,600],[51,0,600],[52,0,600],[53,0,600],[54,0,600],[55,0,600],[56,0,600],[57,0,600],[58,0,600],[59,0,600],[60,0,600],[61,0,600],[62,0,600],[63,0,600],[64,0,600],[65,0,600],[66,0,600],[67,0,600],[68,0,600],[69,0,600],[70,0,600],[71,0,600],[72,0,600],[73,0,600],[74,0,600],[75,0,600],[76,0,600],[77,0,600],[78,0,462],[78,465,135],[79,0,461],[79,466,134],[80,0,461],[80,466,134],[81,0,461],[81,466,134],[82,0,462],[82,465,135],[83,0,600],[84,0,600],[85,0,600],[86,0,600],[87,0,600],[88,0,600],[89,0,269],[89,270,330],[90,0,269],[90,270,178],[90,450,150],[91,0,268],[91,271,178],[91,453,147],[92,0,268],[92,271,179],[92,455,145],[93,0,267],[93,272,179],[93,457,143],[94,0,267],[94,272,179],[94,458,142],[95,0,266],[95,273,179],[95,460,140],[96,0,266],[96,273,180],[96,462,138],[97,0,265],[97,274,179],[97,463,137],[98,0,263],[98,276,178],[98,465,135],[99,0,261],[99,278,177],[99,466,134],[100,0,259],[100,280,175],[100,468,132],[101,0,257],[101,282,174],[101,469,131],[102,0,259],[102,280,176],[102,470,130],[103,0,261],[103,278,179],[103,472,128],[104,0,263],[104,276,181],[104,473,127],[105,0,265],[105,274,184],[105,474,126],[106,0,266],[106,273,185],[106,475,125],[107,0,266],[107,273,186],[107,476,124],[108,0,267],[108,272,187],[108,477,123],[109,0,267],[109,272,188],[109,478,122],[110,0,268],[110,271,189],[110,479,121],[111,0,268],[111,271,190],[111,480,120],[112,0,269],[112,270,191],[112,481,119],[113,0,269],[113,270,191],[113,482,118],[114,0,462],[114,483,117],[115,0,462],[115,484,116],[116,0,462],[116,485,115],[117,0,463],[117,486,114],[118,0,463],[118,486,114],[119,0,463],[119,487,113],[120,0,464],[120,488,112],[121,0,464],[121,489,111],[122,0,464],[122,489,111],[123,0,131],[123,132,332],[123,490,110],[124,0,131],[124,132,333],[124,491,109],[125,0,130],[125,133,332],[125,491,109],[126,0,130],[126,133,332],[126,492,108],[127,0,130],[127,133,332],[127,493,107],[128,0,130],[128,133,333],[128,493,107],[129,0,129],[129,134,332],[129,494,106],[130,0,129],[130,134,332],[130,494,106],[131,0,129],[131,134,332],[131,495,105],[132,0,129],[132,134,332],[132,496,104],[133,0,128],[133,135,331],[133,496,104],[134,0,128],[134,135,331],[134,497,103],[135,0,128],[135,135,332],[135,497,103],[136,0,128],[136,135,332],[136,498,102],[137,0,127],[137,136,331],[137,498,102],[138,0,127],[138,136,331],[138,498,102],[139,0,123],[139,140,327],[139,499,101],[140,0,120],[140,143,324],[140,499,101],[141,0,116],[141,147,320],[141,500,100],[142,0,112],[142,151,316],[142,500,100],[143,0,116],[143,147,320],[143,500,100],[144,0,120],[144,143,324],[144,501,99],[145,0,123],[145,140,327],[145,501,99],[146,0,127],[146,136,331],[146,501,99],[147,0,127],[147,136,331],[147,502,98],[148,0,128],[148,135,332],[148,502,98],[149,0,128],[149,135,332],[149,502,98],[150,0,128],[150,135,332],[150,503,97],[151,0,128],[151,135,332],[151,503,97],[152,0,129],[152,134,333],[152,503,97],[153,0,129],[153,134,333],[153,503,97],[154,0,129],[154,134,332],[154,504,96],[155,0,129],[155,134,332],[155,504,96],[156,0,130],[156,133,333],[156,504,96],[157,0,130],[157,133,333],[157,504,96],[158,0,130],[158,133,69],[158,205,261],[158,504,96],[159,0,130],[159,133,68],[159,206,260],[159,505,95],[160,0,131],[160,132,69],[160,206,260],[160,505,95],[161,0,131],[161,132,69],[161,206,259],[161,505,95],[162,0,202],[162,205,260],[162,505,95],[163,0,465],[163,505,95],[164,0,465],[164,505,95],[165,0,464],[165,506,94],[166,0,464],[166,506,94],[167,0,464],[167,506,94],[168,0,464],[168,506,94],[169,0,463],[169,506,94],[170,0,463],[170,506,94],[171,0,463],[171,506,94],[172,0,462],[172,506,94],[173,0,462],[173,506,94],[174,0,462],[174,506,94],[175,0,461],[175,506,94],[176,0,461],[176,506,94],[177,0,461],[177,506,94],[178,0,460],[178,506,94],[179,0,460],[179,506,94],[180,0,459],[180,506,94],[181,0,459],[181,506,94],[182,0,458],[182,506,94],[183,0,458],[183,506,94],[184,0,457],[184,506,94],[185,0,457],[185,505,95],[186,0,456],[186,505,95],[187,0,456],[187,505,95],[188,0,455],[188,505,95],[189,0,455],[189,505,95],[190,0,454],[190,505,95],[191,0,453],[191,504,96],[192,0,453],[192,504,96],[193,0,452],[193,504,96],[194,0,451],[194,504,96],[195,0,451],[195,504,96],[196,0,450],[196,503,97],[197,0,449],[197,503,97],[198,0,448],[198,503,97],[199,0,448],[199,503,97],[200,0,447],[200,502,98],[201,0,446],[201,502,98],[202,0,445],[202,502,98],[203,0,444],[203,501,99],[204,0,443],[204,501,99],[205,0,442],[205,501,99],[206,0,441],[206,500,100],[207,0,440],[207,500,100],[208,0,439],[208,500,100],[209,0,438],[209,499,101],[210,0,437],[210,499,101],[211,0,436],[211,498,102],[212,0,435],[212,498,102],[213,0,434],[213,498,102],[214,0,432],[214,497,103],[215,0,431],[215,497,103],[216,0,282],[216,285,144],[216,496,104],[217,0,281],[217,286,46],[217,333,95],[217,496,104],[218,0,281],[218,286,47],[218,334,93],[218,495,105],[219,0,281],[219,286,48],[219,336,89],[219,494,106],[220,0,282],[220,285,49],[220,338,85],[220,494,106],[221,0,335],[221,340,81],[221,493,107],[222,0,335],[222,341,79],[222,493,107],[223,0,336],[223,343,75],[223,492,108],[224,0,337],[224,346,69],[224,491,109],[225,0,337],[225,348,65],[225,491,109],[226,0,338],[226,350,61],[226,490,110],[227,0,339],[227,353,55],[227,489,111],[228,0,339],[228,356,49],[228,489,111],[229,0,340],[229,360,41],[229,488,112],[230,0,341],[230,365,31],[230,487,113],[231,0,342],[231,371,19],[231,486,114],[232,0,342],[232,486,114],[233,0,343],[233,485,115],[234,0,344],[234,484,116],[235,0,345],[235,483,117],[236,0,346],[236,482,118],[237,0,347],[237,481,119],[238,0,348],[238,480,120],[239,0,349],[239,479,121],[240,0,350],[240,478,122],[241,0,184],[241,185,166],[241,477,123],[242,0,184],[242,187,165],[242,476,124],[243,0,184],[243,189,164],[243,475,125],[244,0,184],[244,191,163],[244,474,126],[245,0,83],[245,86,99],[245,194,161],[245,473,127],[246,0,82],[246,87,98],[246,196,160],[246,472,128],[247,0,82],[247,87,98],[247,198,160],[247,470,130],[248,0,82],[248,87,98],[248,200,159],[248,469,131],[249,0,83],[249,86,99],[249,202,158],[249,468,132],[250,0,185],[250,205,157],[250,466,134],[251,0,186],[251,206,157],[251,465,135],[252,0,186],[252,207,158],[252,463,137],[253,0,186],[253,209,157],[253,462,138],[254,0,186],[254,211,157],[254,460,140],[255,0,186],[255,213,157],[255,458,142],[256,0,186],[256,215,156],[256,457,143],[257,0,187],[257,216,157],[257,455,145],[258,0,187],[258,217,158],[258,453,147],[259,0,187],[259,220,157],[259,450,150],[260,0,187],[260,222,154],[260,448,152],[261,0,187],[261,223,151],[261,445,155],[262,0,187],[262,224,149],[262,442,158],[263,0,188],[263,226,146],[263,439,161],[264,0,188],[264,227,144],[264,435,165],[265,0,188],[265,228,141],[265,430,170],[266,0,188],[266,230,138],[266,402,2],[266,424,176],[267,0,188],[267,232,135],[267,402,198],[268,0,188],[268,233,132],[268,402,198],[269,0,189],[269,234,129],[269,402,198],[270,0,189],[270,236,126],[270,402,198],[271,0,189],[271,237,124],[271,401,199],[272,0,189],[272,238,122],[272,401,199],[273,0,189],[273,240,119],[273,401,199],[274,0,189],[274,241,117],[274,401,199],[275,0,190],[275,242,115],[275,401,105],[275,509,91],[276,0,190],[276,244,112],[276,401,104],[276,510,90],[277,0,190],[277,244,110],[277,400,105],[277,510,90],[278,0,127],[278,128,62],[278,245,108],[278,400,73],[278,474,31],[278,510,90],[279,0,127],[279,132,58],[279,246,106],[279,400,69],[279,474,32],[279,509,91],[280,0,126],[280,136,54],[280,247,103],[280,400,65],[280,475,125],[281,0,126],[281,136,55],[281,249,101],[281,400,65],[281,475,125],[282,0,126],[282,135,56],[282,250,99],[282,400,66],[282,475,125],[283,0,125],[283,135,56],[283,251,97],[283,400,66],[283,476,124],[284,0,125],[284,135,56],[284,253,94],[284,399,67],[284,476,124],[285,0,125],[285,134,57],[285,254,91],[285,399,68],[285,476,124],[286,0,124],[286,134,57],[286,255,89],[286,399,68],[286,477,123],[287,0,124],[287,134,57],[287,256,87],[287,399,68],[287,477,123],[288,0,124],[288,133,59],[288,257,85],[288,399,69],[288,477,123],[289,0,123],[289,133,59],[289,258,83],[289,399,69],[289,478,122],[290,0,123],[290,133,59],[290,259,30],[290,303,38],[290,398,70],[290,478,122],[291,0,123],[291,132,60],[291,260,22],[291,309,31],[291,398,71],[291,478,122],[292,0,122],[292,132,60],[292,261,17],[292,314,24],[292,398,71],[292,479,121],[293,0,122],[293,132,60],[293,262,11],[293,317,20],[293,398,71],[293,479,121],[294,0,122],[294,131,62],[294,263,8],[294,321,15],[294,398,72],[294,479,121],[295,0,121],[295,131,62],[295,264,4],[295,322,13],[295,398,72],[295,480,120],[296,0,121],[296,131,62],[296,265,1],[296,325,9],[296,398,72],[296,480,120],[297,0,121],[297,130,63],[297,327,6],[297,397,74],[297,480,120],[298,0,120],[298,130,63],[298,328,4],[298,397,74],[298,481,119],[299,0,120],[299,130,63],[299,330,2],[299,397,74],[299,481,119],[300,0,120],[300,129,65],[300,397,75],[300,481,119],[301,0,119],[301,129,65],[301,397,75],[301,482,118],[302,0,119],[302,129,65],[302,397,75],[302,482,118],[303,0,119],[303,128,66],[303,396,77],[303,482,118],[304,0,119],[304,128,20],[304,151,43],[304,396,77],[304,482,118],[305,0,118],[305,128,19],[305,152,42],[305,396,77],[305,483,117],[306,0,118],[306,127,20],[306,152,43],[306,396,78],[306,483,117],[307,0,118],[307,127,20],[307,152,43],[307,396,78],[307,483,117],[308,0,117],[308,127,21],[308,151,44],[308,396,78],[308,484,116],[309,0,62],[309,76,41],[309,127,17],[309,158,37],[309,395,47],[309,456,18],[309,484,40],[309,538,62],[310,0,60],[310,81,36],[310,126,13],[310,161,34],[310,395,45],[310,461,14],[310,484,35],[310,541,59],[311,0,60],[311,85,31],[311,126,9],[311,160,35],[311,395,45],[311,465,10],[311,485,30],[311,540,60],[312,0,60],[312,86,30],[312,126,8],[312,160,36],[312,395,45],[312,466,9],[312,485,29],[312,540,60],[313,0,60],[313,90,26],[313,125,5],[313,160,36],[313,395,45],[313,470,6],[313,485,25],[313,540,60],[314,0,60],[314,91,24],[314,125,4],[314,160,36],[314,395,45],[314,471,5],[314,486,23],[314,540,60],[315,0,60],[315,93,22],[315,125,2],[315,160,36],[315,395,45],[315,473,3],[315,486,21],[315,540,60],[316,0,60],[316,94,21],[316,124,2],[316,160,36],[316,394,46],[316,474,3],[316,486,20],[316,540,60],[317,0,60],[317,95,19],[317,124,1],[317,160,36],[317,394,46],[317,475,2],[317,487,18],[317,540,60],[318,0,61],[318,97,17],[318,159,38],[318,394,47],[318,487,17],[318,539,61],[319,0,61],[319,98,16],[319,159,38],[319,394,47],[319,487,15],[319,539,61],[320,0,61],[320,98,15],[320,159,38],[320,394,47],[320,488,14],[320,539,61],[321,0,61],[321,99,14],[321,159,38],[321,394,47],[321,488,13],[321,539,61],[322,0,61],[322,100,13],[322,159,38],[322,393,48],[322,488,12],[322,539,61],[323,0,62],[323,101,11],[323,158,39],[323,393,49],[323,489,10],[323,538,62],[324,0,62],[324,101,11],[324,158,40],[324,393,49],[324,489,10],[324,538,62],[325,0,62],[325,102,10],[325,158,40],[325,393,49],[325,489,9],[325,538,62],[326,0,62],[326,103,8],[326,158,40],[326,393,49],[326,490,7],[326,538,62],[327,0,63],[327,103,8],[327,157,41],[327,393,50],[327,490,7],[327,537,63],[328,0,63],[328,104,7],[328,157,41],[328,392,51],[328,490,6],[328,537,63],[329,0,64],[329,105,5],[329,156,42],[329,392,52],[329,491,4],[329,536,64],[330,0,64],[330,105,5],[330,156,42],[330,392,52],[330,491,4],[330,536,64],[331,0,65],[331,106,4],[331,156,43],[331,392,53],[331,491,3],[331,536,64],[332,0,65],[332,106,4],[332,156,43],[332,392,53],[332,491,3],[332,536,64],[333,0,65],[333,106,3],[333,155,44],[333,392,53],[333,492,2],[333,535,65],[334,0,65],[334,106,3],[334,155,44],[334,392,53],[334,492,2],[334,535,65],[335,0,66],[335,107,2],[335,154,45],[335,391,55],[335,492,1],[335,534,66],[336,0,66],[336,107,2],[336,154,45],[336,391,55],[336,492,1],[336,534,66],[337,0,67],[337,108,1],[337,153,47],[337,391,56],[337,533,67],[338,0,67],[338,153,47],[338,391,56],[338,533,67],[339,0,68],[339,152,48],[339,391,57],[339,532,68],[340,0,69],[340,151,49],[340,391,58],[340,531,69],[341,0,69],[341,151,49],[341,390,59],[341,531,69],[342,0,70],[342,150,50],[342,390,60],[342,530,70],[343,0,71],[343,149,52],[343,390,61],[343,529,71],[344,0,71],[344,149,52],[344,390,61],[344,529,71],[345,0,72],[345,148,53],[345,390,62],[345,528,72],[346,0,73],[346,147,54],[346,390,63],[346,527,73],[347,0,75],[347,146,55],[347,389,66],[347,526,74],[348,0,76],[348,144,57],[348,389,67],[348,524,76],[349,0,77],[349,143,59],[349,389,68],[349,523,77],[350,0,78],[350,142,60],[350,389,69],[350,522,78],[351,0,80],[351,140,62],[351,389,71],[351,520,80],[352,0,81],[352,139,63],[352,389,72],[352,519,81],[353,0,83],[353,137,65],[353,389,74],[353,517,83],[354,0,86],[354,134,68],[354,388,78],[354,514,86],[355,0,90],[355,131,72],[355,388,82],[355,511,89],[356,0,97],[356,100,5],[356,114,6],[356,123,80],[356,388,89],[356,480,7],[356,496,4],[356,503,97],[357,0,104],[357,114,89],[357,388,99],[357,497,103],[358,0,104],[358,114,89],[358,388,99],[358,497,103],[359,0,104],[359,113,90],[359,388,100],[359,497,103],[360,0,98],[360,99,5],[360,113,90],[360,387,101],[360,497,103],[361,0,97],[361,100,4],[361,113,91],[361,387,101],[361,497,103],[362,0,97],[362,100,3],[362,113,91],[362,387,101],[362,498,102],[363,0,96],[363,101,2],[363,113,91],[363,387,101],[363,498,102],[364,0,96],[364,101,2],[364,112,92],[364,387,102],[364,498,102],[365,0,95],[365,102,1],[365,112,92],[365,387,102],[365,498,102],[366,0,95],[366,102,1],[366,112,92],[366,387,102],[366,498,102],[367,0,94],[367,112,93],[367,386,103],[367,499,101],[368,0,92],[368,112,93],[368,386,103],[368,499,101],[369,0,91],[369,111,94],[369,386,104],[369,499,101],[370,0,89],[370,111,94],[370,386,104],[370,499,101],[371,0,87],[371,111,94],[371,386,104],[371,499,101],[372,0,89],[372,111,95],[372,386,104],[372,500,100],[373,0,91],[373,111,95],[373,385,105],[373,500,100],[374,0,92],[374,110,96],[374,385,106],[374,500,100],[375,0,94],[375,110,96],[375,385,106],[375,500,100],[376,0,95],[376,110,97],[376,385,106],[376,501,99],[377,0,95],[377,110,97],[377,385,106],[377,501,99],[378,0,96],[378,109,99],[378,385,107],[378,501,99],[379,0,96],[379,109,99],[379,384,108],[379,501,99],[380,0,97],[380,109,99],[380,384,108],[380,501,99],[381,0,97],[381,109,100],[381,384,108],[381,502,98],[382,0,45],[382,59,39],[382,109,18],[382,141,68],[382,384,75],[382,473,19],[382,502,39],[382,555,45],[383,0,43],[383,64,35],[383,108,14],[383,144,66],[383,383,74],[383,478,15],[383,502,34],[383,558,42],[384,0,43],[384,68,31],[384,108,10],[384,143,67],[384,383,74],[384,485,8],[384,502,30],[384,557,43],[385,0,43],[385,69,30],[385,108,9],[385,143,68],[385,382,75],[385,488,5],[385,502,29],[385,557,43],[386,0,43],[386,73,25],[386,108,5],[386,143,68],[386,381,76],[386,489,4],[386,503,24],[386,557,43],[387,0,43],[387,74,24],[387,108,4],[387,143,69],[387,381,76],[387,490,3],[387,503,23],[387,557,43],[388,0,43],[388,76,22],[388,107,3],[388,143,69],[388,380,77],[388,491,3],[388,503,21],[388,557,43],[389,0,43],[389,77,21],[389,107,2],[389,143,69],[389,380,77],[389,492,2],[389,503,20],[389,557,43],[390,0,43],[390,78,20],[390,107,1],[390,143,70],[390,379,78],[390,493,1],[390,503,19],[390,557,43],[391,0,44],[391,80,17],[391,142,71],[391,379,79],[391,504,17],[391,556,44],[392,0,44],[392,81,16],[392,142,72],[392,378,80],[392,504,15],[392,556,44],[393,0,44],[393,81,16],[393,142,72],[393,378,80],[393,504,15],[393,556,44],[394,0,44],[394,82,15],[394,142,73],[394,377,81],[394,504,14],[394,556,44],[395,0,44],[395,83,14],[395,142,73],[395,377,81],[395,504,13],[395,556,44],[396,0,45],[396,84,12],[396,141,75],[396,376,83],[396,505,11],[396,555,45],[397,0,45],[397,84,12],[397,141,75],[397,376,83],[397,505,11],[397,555,45],[398,0,45],[398,85,11],[398,141,76],[398,375,84],[398,505,10],[398,555,45],[399,0,45],[399,86,10],[399,141,76],[399,375,84],[399,505,9],[399,555,45],[400,0,46],[400,86,10],[400,140,78],[400,374,86],[400,505,9],[400,554,46],[401,0,46],[401,87,8],[401,140,78],[401,373,87],[401,506,7],[401,554,46],[402,0,47],[402,88,7],[402,139,79],[402,373,87],[402,506,6],[402,553,47],[403,0,47],[403,88,7],[403,139,80],[403,372,88],[403,506,6],[403,553,47],[404,0,48],[404,89,6],[404,139,80],[404,372,88],[404,506,5],[404,553,47],[405,0,48],[405,89,5],[405,139,81],[405,371,89],[405,507,4],[405,553,47],[406,0,48],[406,89,5],[406,138,82],[406,371,89],[406,507,4],[406,552,48],[407,0,48],[407,89,5],[407,138,83],[407,370,91],[407,507,4],[407,552,48],[408,0,49],[408,90,4],[408,137,84],[408,369,92],[408,507,3],[408,551,49],[409,0,49],[409,90,4],[409,137,85],[409,369,93],[409,507,3],[409,551,49],[410,0,50],[410,91,2],[410,136,86],[410,368,95],[410,508,1],[410,550,50],[411,0,50],[411,91,2],[411,136,87],[411,368,95],[411,508,1],[411,550,50],[412,0,51],[412,91,2],[412,135,88],[412,367,98],[412,508,1],[412,549,51],[413,0,52],[413,91,2],[413,134,90],[413,367,97],[413,508,1],[413,548,52],[414,0,52],[414,92,1],[414,134,90],[414,366,98],[414,548,52],[415,0,53],[415,133,92],[415,365,99],[415,547,53],[416,0,54],[416,132,93],[416,365,99],[416,546,54],[417,0,54],[417,132,94],[417,364,100],[417,546,54],[418,0,55],[418,131,96],[418,363,101],[418,545,55],[419,0,56],[419,130,97],[419,363,102],[419,544,56],[420,0,58],[420,129,99],[420,362,103],[420,543,57],[421,0,59],[421,127,101],[421,361,104],[421,541,59],[422,0,60],[422,126,103],[422,361,105],[422,540,60],[423,0,61],[423,125,104],[423,360,107],[423,539,61],[424,0,63],[424,123,107],[424,360,108],[424,537,63],[425,0,64],[425,122,108],[425,359,110],[425,536,64],[426,0,66],[426,120,111],[426,359,111],[426,534,66],[427,0,69],[427,117,115],[427,358,114],[427,479,4],[427,531,69],[428,0,73],[428,114,119],[428,357,130],[428,528,72],[429,0,80],[429,83,7],[429,99,4],[429,106,128],[429,357,137],[429,497,5],[429,511,6],[429,520,4],[429,529,71],[430,0,89],[430,99,135],[430,356,146],[430,512,12],[430,529,71],[431,0,89],[431,99,136],[431,355,147],[431,512,12],[431,529,71],[432,0,89],[432,98,137],[432,354,149],[432,512,13],[432,528,72],[433,0,89],[433,98,138],[433,353,150],[433,512,88],[434,0,88],[434,98,138],[434,353,150],[434,513,87],[435,0,88],[435,98,139],[435,352,151],[435,513,87],[436,0,88],[436,97,141],[436,351,153],[436,513,87],[437,0,88],[437,97,141],[437,350,154],[437,513,87],[438,0,88],[438,97,142],[438,349,155],[438,513,87],[439,0,87],[439,97,143],[439,348,156],[439,514,86],[440,0,87],[440,97,143],[440,348,156],[440,514,86],[441,0,87],[441,96,145],[441,347,158],[441,514,86],[442,0,87],[442,96,146],[442,346,159],[442,514,86],[443,0,87],[443,96,147],[443,345,160],[443,514,86],[444,0,86],[444,96,148],[444,344,161],[444,515,85],[445,0,86],[445,96,149],[445,344,161],[445,515,85],[446,0,86],[446,95,150],[446,343,163],[446,515,85],[447,0,86],[447,95,151],[447,342,164],[447,515,85],[448,0,86],[448,95,152],[448,341,165],[448,515,85],[449,0,85],[449,95,153],[449,340,166],[449,516,84],[450,0,85],[450,95,154],[450,340,166],[450,516,84],[451,0,85],[451,94,156],[451,339,168],[451,516,84],[452,0,85],[452,94,157],[452,337,170],[452,516,84],[453,0,85],[453,94,158],[453,336,171],[453,516,84],[454,0,84],[454,94,158],[454,335,172],[454,517,83],[455,0,84],[455,94,159],[455,334,173],[455,517,83],[456,0,84],[456,93,161],[456,333,175],[456,517,83],[457,0,84],[457,93,20],[457,119,92],[457,212,43],[457,332,176],[457,517,83],[458,0,84],[458,93,17],[458,122,89],[458,227,30],[458,331,177],[458,517,83],[459,0,83],[459,93,16],[459,123,87],[459,241,17],[459,330,178],[459,518,82],[460,0,83],[460,93,14],[460,125,85],[460,256,3],[460,329,179],[460,518,82],[461,0,36],[461,50,33],[461,92,14],[461,132,77],[461,328,140],[461,482,27],[461,518,32],[461,564,36],[462,0,34],[462,55,28],[462,92,14],[462,135,74],[462,326,140],[462,487,22],[462,518,27],[462,567,33],[463,0,34],[463,59,23],[463,92,13],[463,134,74],[463,325,141],[463,491,18],[463,519,22],[463,566,34],[464,0,34],[464,60,22],[464,92,12],[464,134,74],[464,324,142],[464,492,17],[464,519,21],[464,566,34],[465,0,34],[465,64,18],[465,91,13],[465,134,73],[465,328,138],[465,496,14],[465,519,17],[465,566,34],[466,0,34],[466,65,17],[466,91,10],[466,134,73],[466,343,123],[466,497,13],[466,519,16],[466,566,34],[467,0,34],[467,67,15],[467,91,7],[467,134,73],[467,343,123],[467,499,11],[467,519,14],[467,566,34],[468,0,34],[468,68,13],[468,91,6],[468,135,71],[468,343,123],[468,500,10],[468,520,12],[468,566,34],[469,0,34],[469,69,12],[469,91,4],[469,137,69],[469,344,122],[469,501,9],[469,520,11],[469,566,34],[470,0,35],[470,71,10],[470,90,4],[470,138,67],[470,344,123],[470,503,8],[470,520,10],[470,565,35],[471,0,35],[471,72,9],[471,90,4],[471,138,67],[471,344,123],[471,504,7],[471,520,8],[471,565,35],[472,0,35],[472,72,9],[472,90,3],[472,139,66],[472,345,122],[472,504,7],[472,520,8],[472,565,35],[473,0,35],[473,73,7],[473,90,2],[473,140,64],[473,345,122],[473,505,6],[473,521,6],[473,565,35],[474,0,35],[474,74,6],[474,90,2],[474,140,64],[474,346,121],[474,506,5],[474,521,5],[474,565,35],[475,0,36],[475,75,5],[475,89,3],[475,140,63],[475,346,122],[475,507,5],[475,521,4],[475,564,36],[476,0,36],[476,75,5],[476,89,2],[476,141,62],[476,346,122],[476,507,5],[476,521,4],[476,564,36],[477,0,36],[477,76,4],[477,89,2],[477,141,62],[477,347,121],[477,508,4],[477,521,3],[477,564,36],[478,0,36],[478,77,3],[478,89,2],[478,141,61],[478,347,121],[478,509,3],[478,521,2],[478,564,36],[479,0,37],[479,77,3],[479,89,2],[479,141,61],[479,348,121],[479,509,3],[479,521,2],[479,563,37],[480,0,37],[480,78,2],[480,89,1],[480,141,60],[480,348,121],[480,510,2],[480,521,1],[480,563,37],[481,0,38],[481,79,1],[481,141,60],[481,349,121],[481,511,1],[481,562,38],[482,0,38],[482,79,2],[482,140,61],[482,349,121],[482,562,38],[483,0,39],[483,80,1],[483,140,61],[483,350,121],[483,562,38],[484,0,39],[484,80,1],[484,140,60],[484,350,121],[484,562,38],[485,0,39],[485,80,1],[485,139,61],[485,350,121],[485,561,39],[486,0,39],[486,80,1],[486,138,62],[486,350,121],[486,561,39],[487,0,40],[487,138,62],[487,351,121],[487,560,40],[488,0,40],[488,137,62],[488,351,121],[488,560,40],[489,0,41],[489,136,63],[489,351,122],[489,559,41],[490,0,41],[490,137,62],[490,351,122],[490,559,41],[491,0,42],[491,137,61],[491,352,122],[491,558,42],[492,0,43],[492,137,61],[492,352,123],[492,557,43],[493,0,43],[493,137,61],[493,353,122],[493,557,43],[494,0,44],[494,137,60],[494,353,123],[494,556,44],[495,0,45],[495,137,60],[495,353,124],[495,555,45],[496,0,45],[496,136,60],[496,354,123],[496,555,45],[497,0,46],[497,136,60],[497,354,124],[497,554,46],[498,0,47],[498,136,60],[498,355,124],[498,553,47],[499,0,49],[499,135,61],[499,355,126],[499,552,48],[500,0,50],[500,134,62],[500,355,127],[500,550,50],[501,0,51],[501,134,61],[501,356,127],[501,549,51],[502,0,52],[502,133,62],[502,356,128],[502,548,52],[503,0,54],[503,131,64],[503,357,129],[503,546,54],[504,0,55],[504,115,2],[504,130,65],[504,357,130],[504,545,55],[505,0,57],[505,112,8],[505,127,67],[505,357,132],[505,543,57],[506,0,60],[506,108,86],[506,357,135],[506,540,60],[507,0,64],[507,105,89],[507,357,138],[507,537,63],[508,0,71],[508,74,9],[508,92,2],[508,97,96],[508,358,137],[508,518,8],[508,529,71],[509,0,83],[509,92,101],[509,358,137],[509,518,82],[510,0,83],[510,92,101],[510,358,137],[510,518,82],[511,0,83],[511,92,101],[511,358,137],[511,518,82],[512,0,83],[512,92,100],[512,359,136],[512,519,81],[513,0,83],[513,92,100],[513,359,136],[513,519,81],[514,0,83],[514,92,100],[514,360,135],[514,520,80],[515,0,83],[515,92,100],[515,360,135],[515,520,80],[516,0,83],[516,92,99],[516,360,135],[516,521,79],[517,0,83],[517,92,99],[517,360,135],[517,521,79],[518,0,84],[518,93,98],[518,361,134],[518,522,78],[519,0,84],[519,93,97],[519,361,134],[519,522,78],[520,0,84],[520,93,97],[520,361,134],[520,523,77],[521,0,84],[521,93,97],[521,361,134],[521,523,77],[522,0,84],[522,93,97],[522,362,133],[522,523,77],[523,0,84],[523,93,97],[523,362,133],[523,524,76],[524,0,84],[524,93,96],[524,363,131],[524,524,76],[525,0,84],[525,93,96],[525,363,131],[525,525,75],[526,0,84],[526,93,96],[526,363,131],[526,525,75],[527,0,84],[527,93,96],[527,364,130],[527,525,75],[528,0,84],[528,93,96],[528,364,130],[528,526,74],[529,0,85],[529,94,95],[529,364,129],[529,526,74],[530,0,85],[530,94,94],[530,365,128],[530,526,74],[531,0,85],[531,94,94],[531,365,128],[531,526,74],[532,0,85],[532,94,94],[532,365,128],[532,527,73],[533,0,85],[533,94,94],[533,365,128],[533,527,73],[534,0,85],[534,94,94],[534,366,126],[534,527,73],[535,0,85],[535,94,94],[535,366,126],[535,528,72],[536,0,85],[536,94,93],[536,366,126],[536,528,72],[537,0,85],[537,94,93],[537,366,126],[537,528,72],[538,0,41],[538,55,30],[538,94,29],[538,137,50],[538,366,97],[538,477,14],[538,528,17],[538,559,41],[539,0,39],[539,60,25],[539,94,24],[539,140,47],[539,366,95],[539,482,9],[539,528,12],[539,562,38],[540,0,39],[540,64,21],[540,94,20],[540,139,48],[540,367,94],[540,486,4],[540,528,8],[540,561,39],[541,0,39],[541,65,21],[541,95,18],[541,139,48],[541,367,94],[541,487,3],[541,528,7],[541,561,39],[542,0,39],[542,69,17],[542,95,14],[542,139,47],[542,367,94],[542,529,2],[542,561,39],[543,0,39],[543,70,16],[543,95,13],[543,139,47],[543,367,94],[543,529,1],[543,561,39],[544,0,39],[544,72,14],[544,95,11],[544,139,47],[544,368,93],[544,561,39],[545,0,39],[545,73,13],[545,95,10],[545,139,47],[545,368,93],[545,561,39],[546,0,39],[546,74,12],[546,95,9],[546,139,47],[546,369,92],[546,561,39],[547,0,40],[547,76,10],[547,95,8],[547,138,48],[547,369,93],[547,560,40],[548,0,40],[548,77,9],[548,95,6],[548,138,48],[548,369,93],[548,560,40],[549,0,40],[549,77,9],[549,95,6],[549,138,47],[549,369,93],[549,560,40],[550,0,40],[550,78,8],[550,95,5],[550,138,47],[550,369,93],[550,560,40],[551,0,40],[551,79,7],[551,95,4],[551,138,47],[551,370,92],[551,560,40],[552,0,41],[552,80,6],[552,95,3],[552,137,48],[552,370,93],[552,559,41],[553,0,41],[553,80,7],[553,96,2],[553,137,48],[553,370,93],[553,559,41],[554,0,41],[554,81,6],[554,96,1],[554,137,48],[554,370,93],[554,559,41],[555,0,41],[555,82,5],[555,137,47],[555,370,93],[555,559,41],[556,0,42],[556,82,5],[556,136,48],[556,371,93],[556,558,42],[557,0,42],[557,83,4],[557,136,48],[557,371,93],[557,558,42],[558,0,43],[558,84,3],[558,135,49],[558,371,94],[558,557,43],[559,0,43],[559,84,3],[559,135,49],[559,371,94],[559,557,43],[560,0,44],[560,85,2],[560,135,49],[560,371,95],[560,557,43],[561,0,44],[561,85,2],[561,135,48],[561,371,95],[561,557,43],[562,0,44],[562,85,2],[562,134,49],[562,372,94],[562,556,44],[563,0,44],[563,85,2],[563,134,49],[563,372,93],[563,556,44],[564,0,45],[564,86,2],[564,133,50],[564,372,91],[564,555,45],[565,0,45],[565,86,2],[565,133,50],[565,372,90],[565,555,45],[566,0,46],[566,87,1],[566,132,51],[566,373,86],[566,554,46],[567,0,46],[567,87,1],[567,132,50],[567,373,83],[567,554,46],[568,0,47],[568,87,1],[568,131,51],[568,373,81],[568,553,47],[569,0,48],[569,87,1],[569,130,52],[569,374,79],[569,552,48],[570,0,48],[570,130,52],[570,374,77],[570,552,48],[571,0,49],[571,129,53],[571,374,74],[571,551,49],[572,0,50],[572,128,54],[572,374,71],[572,550,50],[573,0,50],[573,128,54],[573,375,68],[573,550,50],[574,0,51],[574,127,54],[574,375,67],[574,549,51],[575,0,52],[575,126,55],[575,375,65],[575,548,52],[576,0,54],[576,125,56],[576,375,62],[576,547,53],[577,0,55],[577,123,58],[577,375,58],[577,545,55],[578,0,56],[578,122,59],[578,375,55],[578,544,56],[579,0,57],[579,121,60],[579,375,52],[579,543,57],[580,0,59],[580,119,62],[580,375,50],[580,541,59],[581,0,60],[581,118,63],[581,375,47],[581,540,60],[582,0,62],[582,116,65],[582,375,45],[582,538,62],[583,0,65],[583,113,68],[583,375,43],[583,535,65],[584,0,69],[584,110,71],[584,376,40],[584,532,68],[585,0,76],[585,79,10],[585,98,1],[585,102,79],[585,376,38],[585,527,73],[586,0,89],[586,98,82],[586,376,35],[586,526,74],[587,0,89],[587,98,82],[587,376,31],[587,526,74],[588,0,90],[588,99,81],[588,376,28],[588,526,74],[589,0,90],[589,99,81],[589,376,26],[589,526,74],[590,0,90],[590,99,81],[590,377,22],[590,526,74],[591,0,90],[591,99,81],[591,377,20],[591,525,75],[592,0,90],[592,99,81],[592,377,19],[592,525,75],[593,0,90],[593,99,81],[593,377,17],[593,525,75],[594,0,90],[594,99,81],[594,377,15],[594,525,75],[595,0,90],[595,99,81],[595,377,13],[595,524,76],[596,0,90],[596,99,81],[596,378,9],[596,524,76],[597,0,90],[597,99,81],[597,378,7],[597,524,76],[598,0,90],[598,99,81],[598,378,5],[598,524,76],[599,0,90],[599,99,81],[599,378,3],[599,523,77],[600,0,91],[600,100,80],[600,378,1],[600,523,77],[601,0,91],[601,100,80],[601,523,77],[602,0,91],[602,100,80],[602,523,77],[603,0,91],[603,100,80],[603,522,78],[604,0,91],[604,100,23],[604,129,51],[604,522,78],[605,0,91],[605,100,21],[605,131,49],[605,522,78],[606,0,91],[606,101,18],[606,133,47],[606,522,78],[607,0,91],[607,101,17],[607,134,46],[607,521,79],[608,0,92],[608,101,16],[608,135,45],[608,521,79],[609,0,92],[609,102,15],[609,135,45],[609,520,80],[610,0,92],[610,102,14],[610,136,44],[610,520,80],[611,0,60],[611,74,19],[611,102,11],[611,139,3],[611,156,24],[611,519,7],[611,540,60],[612,0,58],[612,79,14],[612,102,9],[612,159,21],[612,519,2],[612,543,57],[613,0,58],[613,83,10],[613,103,7],[613,158,22],[613,542,58],[614,0,58],[614,84,9],[614,103,6],[614,158,22],[614,542,58],[615,0,58],[615,88,6],[615,103,5],[615,158,22],[615,542,58],[616,0,58],[616,89,5],[616,104,3],[616,158,22],[616,542,58],[617,0,58],[617,91,3],[617,104,3],[617,158,22],[617,542,58],[618,0,58],[618,92,3],[618,104,3],[618,158,22],[618,542,58],[619,0,58],[619,93,2],[619,105,1],[619,158,22],[619,542,58],[620,0,59],[620,105,1],[620,157,23],[620,541,59],[621,0,59],[621,105,1],[621,157,23],[621,541,59],[622,0,59],[622,157,23],[622,541,59],[623,0,59],[623,157,23],[623,541,59],[624,0,59],[624,157,23],[624,541,59],[625,0,60],[625,156,24],[625,540,60],[626,0,60],[626,156,24],[626,540,60],[627,0,60],[627,156,24],[627,540,60],[628,0,60],[628,156,24],[628,540,60],[629,0,61],[629,155,25],[629,539,61],[630,0,61],[630,155,25],[630,539,61],[631,0,62],[631,154,26],[631,538,62],[632,0,62],[632,154,26],[632,538,62],[633,0,63],[633,154,26],[633,538,62],[634,0,63],[634,154,27],[634,538,62],[635,0,63],[635,153,28],[635,537,63],[636,0,63],[636,153,28],[636,537,63],[637,0,64],[637,152,29],[637,536,64],[638,0,64],[638,152,29],[638,536,64],[639,0,65],[639,151,30],[639,535,65],[640,0,65],[640,151,31],[640,535,65],[641,0,66],[641,150,32],[641,534,66],[642,0,67],[642,149,33],[642,533,67],[643,0,67],[643,149,33],[643,533,67],[644,0,68],[644,148,34],[644,532,68],[645,0,69],[645,147,35],[645,531,69],[646,0,69],[646,147,35],[646,531,69],[647,0,70],[647,146,36],[647,530,70],[648,0,71],[648,145,37],[648,529,71],[649,0,73],[649,144,38],[649,528,72],[650,0,74],[650,142,40],[650,526,74],[651,0,75],[651,141,41],[651,525,75],[652,0,76],[652,140,43],[652,524,76],[653,0,78],[653,138,45],[653,522,78],[654,0,79],[654,137,46],[654,521,79],[655,0,81],[655,135,48],[655,519,81],[656,0,84],[656,132,51],[656,516,84],[657,0,88],[657,129,55],[657,513,87],[658,0,95],[658,98,9],[658,117,1],[658,121,63],[658,494,8],[658,505,95],[659,0,107],[659,117,67],[659,494,106],[660,0,108],[660,117,67],[660,493,107],[661,0,108],[661,117,67],[661,493,107],[662,0,108],[662,118,67],[662,493,107],[663,0,108],[663,118,67],[663,493,107],[664,0,109],[664,118,68],[664,492,108],[665,0,109],[665,119,67],[665,492,108],[666,0,109],[666,119,67],[666,492,108],[667,0,110],[667,119,67],[667,491,109],[668,0,110],[668,120,67],[668,491,109],[669,0,110],[669,120,67],[669,491,109],[670,0,111],[670,120,67],[670,490,110],[671,0,111],[671,121,66],[671,490,110],[672,0,111],[672,121,67],[672,490,110],[673,0,112],[673,121,67],[673,489,111],[674,0,112],[674,121,67],[674,489,111],[675,0,112],[675,122,67],[675,489,111],[676,0,112],[676,122,67],[676,489,111],[677,0,113],[677,122,67],[677,488,112],[678,0,113],[678,123,62],[678,488,112],[679,0,113],[679,123,58],[679,488,112],[680,0,114],[680,123,54],[680,487,113],[681,0,114],[681,124,48],[681,487,113],[682,0,114],[682,124,42],[682,487,113],[683,0,115],[683,124,38],[683,486,114],[684,0,115],[684,125,34],[684,486,114],[685,0,115],[685,125,30],[685,486,114],[686,0,116],[686,125,27],[686,485,115],[687,0,116],[687,125,25],[687,485,115],[688,0,116],[688,126,21],[688,485,115],[689,0,116],[689,126,18],[689,485,115],[690,0,117],[690,126,14],[690,484,116],[691,0,117],[691,127,10],[691,484,116],[692,0,117],[692,127,6],[692,484,116],[693,0,118],[693,127,3],[693,483,117],[694,0,118],[694,483,117],[695,0,118],[695,483,117],[696,0,119],[696,482,118],[697,0,119],[697,482,118],[698,0,117],[698,483,117],[699,0,114],[699,486,114],[700,0,111],[700,489,111],[701,0,108],[701,492,108],[702,0,106],[702,494,106],[703,0,103],[703,497,103],[704,0,100],[704,500,100],[705,0,98],[705,502,98],[706,0,96],[706,504,96],[707,0,93],[707,507,93],[708,0,91],[708,509,91],[709,0,89],[709,511,89],[710,0,87],[710,513,87],[711,0,85],[711,516,84],[712,0,82],[712,518,82],[713,0,80],[713,521,79],[714,0,78],[714,523,77],[715,0,84],[715,517,83],[716,0,89],[716,511,89],[717,0,93],[717,507,93],[718,0,96],[718,504,96],[719,0,100],[719,500,100],[720,0,104],[720,496,104],[721,0,107],[721,493,107],[722,0,111],[722,489,111],[723,0,117],[723,483,117],[724,0,122],[724,478,122],[725,0,126],[725,474,126],[726,0,129],[726,471,129],[727,0,133],[727,467,133],[728,0,139],[728,461,139],[729,0,144],[729,456,144],[730,0,150],[730,450,150],[731,0,155],[731,445,155],[732,0,161],[732,439,161],[733,0,166],[733,434,166],[734,0,172],[734,428,172],[735,0,177],[735,423,177],[736,0,189],[736,412,188],[737,0,195],[737,406,194],[738,0,200],[738,400,200],[739,0,211],[739,389,211],[740,0,222],[740,378,222],[741,0,233],[741,367,233],[742,0,244],[742,356,244],[743,0,255],[743,345,255],[744,0,277],[744,323,277],[745,0,600],[746,0,600],[747,0,600],[748,0,600],[749,0,600],[750,0,600],[751,0,600],[752,0,600],[753,0,600],[754,0,600],[755,0,600],[756,0,600],[757,0,600],[758,0,600],[759,0,600],[760,0,600],[761,0,600],[762,0,600],[763,0,600],[764,0,600],[765,0,600],[766,0,600],[767,0,600],[768,0,600],[769,0,600],[770,0,600],[771,0,600],[772,0,600],[773,0,600],[774,0,600],[775,0,600],[776,0,600],[777,0,600],[778,0,600],[779,0,600],[780,0,600],[781,0,600],[782,0,600],[783,0,600],[784,0,600],[785,0,600],[786,0,600],[787,0,600],[788,0,600],[789,0,600],[790,0,600],[791,0,600],[792,0,600],[793,0,600],[794,0,600],[795,0,600],[796,0,600],[797,0,600],[798,0,600],[799,0,600]]},{id:"garden-night-1",area:170,bounds:{x:459,y:482,w:62,h:213},grip:{x:520.5,y:482.5},axis:{x:-.12987648836092636,y:.9915301799597602},length:218,duration:2.09,runs:[[0,61,1],[191,20,1],[192,19,2],[193,18,2],[194,17,3],[195,16,4],[196,15,4],[197,14,5],[198,13,6],[199,11,7],[200,10,8],[201,8,10],[202,7,10],[203,6,11],[204,4,13],[205,3,14],[206,1,15],[207,0,16],[208,1,15],[209,4,11],[210,8,7],[211,11,4],[212,13,1]]},{id:"garden-night-2",area:7402,bounds:{x:106,y:625,w:377,h:109},grip:{x:482.5,y:719.5},axis:{x:-.8413154061573942,y:.5405445285656113},length:308,duration:2.33,runs:[[0,0,1],[3,1,1],[4,2,1],[5,2,1],[6,2,1],[13,4,1],[75,112,9],[76,103,25],[77,93,38],[78,84,49],[79,80,58],[80,75,67],[80,198,12],[81,71,80],[81,193,21],[81,312,5],[82,66,95],[82,184,34],[82,302,20],[83,57,164],[83,297,34],[84,53,172],[84,293,42],[85,48,185],[85,284,56],[86,44,197],[86,275,69],[87,39,214],[87,263,86],[88,35,318],[89,30,328],[90,26,336],[91,21,346],[92,18,352],[93,15,359],[94,12,365],[95,21,346],[96,30,328],[97,35,318],[98,39,310],[99,48,292],[100,57,274],[101,66,256],[102,75,238],[103,84,220],[104,93,202],[105,112,164],[106,121,146],[107,139,110],[108,166,56]]}]};var we=i=>document.querySelector(i),Zn=we("#art"),ea=we("#settings"),Un=e0(location.search),Ct=Un.stages,Te;try{Te=sc(localStorage)}catch{Te=sc({getItem:()=>null})}var Xe=new cl,Jn=new ll,r0=new hl(Te.frameLimit),Yn={},a0={},ss=[],o0=0,l0=0,en=[],di=0,ta=0,Ye,ke,Ot=0,Tn=!1,rn=null,Ml=!1,mi=0,pi=0,Ks=0,$n={x:300,y:282,visible:!1},jr={x:300,y:282},rs=!1,_l=0,i0=0,yl=0,oc=0,vl=0,Sl=16.7,cc=0,hc=0,Kr=0,uc=0,Li={dx:0,dy:0,speed:0,load:0},s0=innerWidth;function pc(i=!1){(i||Math.abs(innerWidth-s0)>60)&&(s0=innerWidth,document.documentElement.style.setProperty("--app-height",innerHeight+"px"))}pc(!0);window.addEventListener("resize",()=>pc());window.addEventListener("orientationchange",()=>setTimeout(()=>pc(!0),150));for(let i of["gesturestart","gesturechange","gestureend"])document.addEventListener(i,e=>e.preventDefault(),{passive:!1});Zn.addEventListener("dblclick",i=>i.preventDefault());document.addEventListener("wheel",i=>{(i.ctrlKey||i.target===Zn)&&i.preventDefault()},{passive:!1});document.addEventListener("touchmove",i=>{i.touches.length>1&&i.preventDefault()},{passive:!1});var bl=new Map;for(let i of["pointerdown","pointerup"])document.addEventListener(i,e=>{e.isPrimary===!1||Jn.active!==null&&e.pointerId!==Jn.active?(bl.set(e.pointerId,performance.now()),e.preventDefault(),e.stopImmediatePropagation()):i==="pointerdown"&&bl.delete(e.pointerId)},{capture:!0,passive:!1});document.addEventListener("click",i=>{let e=bl.get(i.pointerId);e!==void 0&&performance.now()-e<1200&&(i.preventDefault(),i.stopImmediatePropagation(),bl.delete(i.pointerId))},{capture:!0});var Tl=document.createElement("canvas");Tl.width=Ge;Tl.height=qe;var _t=Tl.getContext("2d"),na=document.createElement("canvas");na.width=Ge;na.height=qe;var wl=na.getContext("2d");wl.fillStyle="#f5e7a5";wl.fillRect(0,0,Ge,qe);for(let i=0;i<45e3;i++)wl.fillStyle=Math.random()>.5?"#fff9d118":"#ad945212",wl.fillRect(Math.random()*Ge,Math.random()*qe,1,1);var ia=document.createElement("canvas");ia.width=Ge;ia.height=qe;var mc=ia.getContext("2d"),as=document.createElement("canvas");as.width=Ge;as.height=qe;var Gt=as.getContext("2d"),Al=document.createElement("canvas");Al.width=Ge;Al.height=qe;var lc=Al.getContext("2d"),sa=document.createElement("canvas");sa.width=Ge;sa.height=qe;var $p=sa.getContext("2d"),dc=-1;function c0(i){t0($p,i,Ge,qe)}function El(i=!1,e=!1){if(!(!ke||!i&&dc===ke.coveredWeight)){if(dc=ke.coveredWeight,Gt.clearRect(0,0,Ge,qe),Gt.fillStyle="#fff",e&&Pl())Gt.fillRect(0,0,Ge,qe);else for(let t=0;t<ke.bound.length;t++)ke.bound[t]&&Gt.fillRect(t%120*5,Math.floor(t/120)*5,5,5);Gt.globalCompositeOperation="destination-in",Gt.drawImage(Yn[Ct[Ot].id],0,0),Gt.globalCompositeOperation="source-in",Gt.drawImage(sa,0,0),Gt.globalCompositeOperation="source-over",lc.clearRect(0,0,Ge,qe),lc.drawImage(ia,0,0),lc.drawImage(as,0,0),Ye?.setCoatMask(Al),js()}}var Cl=document.createElement("canvas");Cl.width=Ge;Cl.height=qe;var is=Cl.getContext("2d");function js(){_t.clearRect(0,0,Ge,qe),_t.drawImage(na,0,0),_t.globalAlpha=.035;for(let i=Ot;i<Ct.length;i++)_t.drawImage(Yn[Ct[i].id],0,0);if(!Ml&&mi===0&&(_t.globalAlpha=.1,_t.drawImage(Yn[Ct[Ot].id],0,0)),_t.globalAlpha=1,_t.drawImage(Cl,0,0),Xe.phase==="rolling"&&en[di]){let i=en[di],e=Hu(i.piece,mi);e.length&&(_t.save(),_t.beginPath(),e.forEach((t,n)=>n?_t.lineTo(t.x,t.y):_t.moveTo(t.x,t.y)),_t.closePath(),_t.clip(),_t.drawImage(i.brown,i.piece.bounds.x,i.piece.bounds.y),_t.restore())}_t.drawImage(ia,0,0),_t.drawImage(as,0,0),_t.globalAlpha=.96,_t.drawImage(Yn.lines,0,0),_t.globalAlpha=1,Ye?.paperChanged()}var bn,fi=!0,ns,$s,Ii,fc=-1,Qr={};async function gc(){bn||(bn=new(window.AudioContext||window.webkitAudioContext),$s=bn.createGain(),$s.gain.value=0,$s.connect(bn.destination),await Promise.all(["brush","pour"].map(async i=>{try{let e=await(await fetch(`audio/${i}.m4a?v=4`)).arrayBuffer();Qr[i]=await bn.decodeAudioData(e)}catch(e){console.warn("Ses y\xFCklenemedi",i,e)}})),Qr.brush&&(ns=bn.createBufferSource(),ns.buffer=Qr.brush,ns.loop=!0,ns.connect($s),ns.start())),await bn.resume()}function Rl(i=0){if(!(!bn||!$s)&&($s.gain.setTargetAtTime(fi&&Xe.phase==="brush"?Math.min(1,i*5*(.8+Li.load*.35)):0,bn.currentTime,.035),ns&&ns.playbackRate.setTargetAtTime(.85+Math.min(.35,Li.speed/1800),bn.currentTime,.06),fi&&Xe.phase==="pour"&&Xe.elapsed>=.48&&Xe.elapsed<1.3&&fc!==Xe.serial&&Qr.pour&&(fc=Xe.serial,Ii?.stop(),Ii=bn.createBufferSource(),Ii.buffer=Qr.pour,Ii.connect(bn.destination),Ii.start()),!fi&&Ii)){try{Ii.stop()}catch{}Ii=null}}we("#sound").textContent="Ses: a\xE7\u0131k";we("#sound").setAttribute("aria-label","Sesi kapat");we("#sound").onclick=async()=>{fi=!fi,await gc(),Rl(0),we("#sound").textContent=fi?"Ses: a\xE7\u0131k":"Ses: kapal\u0131",we("#sound").setAttribute("aria-label",fi?"Sesi kapat":"Sesi a\xE7")};function Qs(){rs=!1,Jn.cancel(),ss.length=0,Rl(0)}function xc(){ea.close(),$n.visible=!1,pi=0}we("#settings-open").onclick=()=>{Qs(),$n.visible=!1,h0(),ea.showModal()};we("#settings-close").onclick=xc;we("#settings-done").onclick=xc;ea.addEventListener("cancel",()=>{Qs(),pi=0});function os(i){let e=Te?.surface;Te=i,document.body.dataset.layout=Te.layout,we("#perf-hud").hidden=!Te.showStats;try{Yu(localStorage,Te)}catch{}if(ke?.setBehavior(Te),Ye?.applySettings(Te),en.length&&e!==Te.surface){for(let n of en)d0(n);is.clearRect(0,0,Ge,qe);let t=ta;ta=0,_c(t),js()}r0.setLimit(Te.frameLimit),Te.autoAdvance||(Ks=0),h0(),pi=0,wn()}function h0(){document.querySelectorAll('input[name="layout"]').forEach(i=>i.checked=i.value===Te.layout);for(let[i,e]of Object.entries({"auto-advance":"autoAdvance","show-stats":"showStats",sparkles:"sparkles",reflections:"reflections",relief:"relief","moving-light":"movingLight"}))we("#"+i).checked=Te[e];for(let[i,e]of Object.entries({"quality-profile":"profile","render-scale":"renderScale","shadow-quality":"shadow","frame-limit":"frameLimit","pour-amount":"pourAmount",pace:"pace","brush-shape":"brushShape","jar-shape":"jarShape","pour-style":"pourStyle","surface-style":"surface","brush-width":"brushWidth","grain-size":"grainSize",mobility:"mobility",response:"response"}))we("#"+i).value=Te[e];document.querySelectorAll("input[name=feel]").forEach(i=>i.checked=i.value===Te.feel);for(let[i,e]of[["mobility","mobility"],["response","response"],["brush-width","brushWidth"],["grain-size","grainSize"]])we("#"+i+"-readout").textContent="%"+Math.round(Te[e]*100);we("#feel-name").textContent=Nl[Te.feel]?.name||"\xD6zel kar\u0131\u015F\u0131m",we("#resolution-readout").textContent="%"+Math.round(Te.renderScale*100),we("#pour-readout").textContent="%"+Math.round(Te.pourAmount*100)}document.querySelectorAll('input[name="layout"]').forEach(i=>i.onchange=()=>os({...Te,layout:i.value,autoAdvance:i.value==="flow"}));we("#quality-profile").onchange=i=>{i.target.value!=="custom"&&os(Zu(Te,i.target.value))};var Kp={"auto-advance":"autoAdvance","show-stats":"showStats",sparkles:"sparkles",reflections:"reflections",relief:"relief","moving-light":"movingLight"};for(let[i,e]of Object.entries(Kp))we("#"+i).onchange=t=>os({...Te,[e]:t.target.checked,profile:["autoAdvance","showStats"].includes(e)?Te.profile:"custom"});for(let[i,e,t]of[["render-scale","renderScale",!0],["pour-amount","pourAmount",!0],["shadow-quality","shadow",!1],["frame-limit","frameLimit",!0],["pace","pace",!1]])we("#"+i).addEventListener(i.includes("scale")||i.includes("amount")?"input":"change",n=>os({...Te,[e]:t?Number(n.target.value):n.target.value,profile:["renderScale","shadow","frameLimit"].includes(e)?"custom":Te.profile}));document.querySelectorAll("input[name=feel]").forEach(i=>i.onchange=()=>os(Lc(Te,i.value)));for(let[i,e,t]of[["brush-shape","brushShape",!1],["jar-shape","jarShape",!1],["pour-style","pourStyle",!1],["surface-style","surface",!1],["brush-width","brushWidth",!0],["grain-size","grainSize",!0],["mobility","mobility",!0],["response","response",!0]])we("#"+i).addEventListener(t?"input":"change",n=>os({...Te,[e]:t?Number(n.target.value):n.target.value,feel:["jarShape","pourStyle","surface"].includes(e)?Te.feel:"custom"}));function u0(i){let e=new URL(location.href);e.search="",e.searchParams.set("v","6"),e.searchParams.set("bolum",i),location.assign(e)}for(let i of xl){let e=document.createElement("button");e.className="level-card"+(i.id===Un.id?" current":""),e.innerHTML=`<img src="assets/${i.preview}.png" alt=""><span><strong>${i.name}</strong><small>${i.subtitle}</small></span><b>${i.id===Un.id?"Oynuyorsun":"Ba\u015Fla \u2192"}</b>`,e.onclick=()=>{i.id!==Un.id&&u0(i.id)},we("#levels").append(e)}we("#next-level").textContent=(Un.id==="gotham"?"Ay Bah\xE7esi\u2019ne ge\xE7":"Gotham\u2019a d\xF6n")+" \u2192";we("#next-level").onclick=()=>u0(Un.id==="gotham"?"ay-bahcesi":"gotham");we("#level-name").textContent=Un.name;function Pl(){return ke&&ac(ke.coverage,Te.pace,ke.targetCount*25).ready}function wn(){if(!ke)return;let i=Xe.phase,e=ac(ke.coverage,Te.pace,ke.targetCount*25).percent;we("#stage-label").textContent=`${String(Ot+1).padStart(2,"0")} / ${Ct.length}`,we("#stage-label").title=Ct[Ot].name,we("#color-dot").style.background=Ct[Ot].color,we("#coverage").textContent=e+"%",we("#progress-fill").style.width=e+"%";let t={peel:["\u2197","Bir kez dokun.","S\u0131radaki k\xE2\u011F\u0131t rulolanarak a\xE7\u0131ls\u0131n.","SOY"],rolling:["\u2197","K\xE2\u011F\u0131t a\xE7\u0131l\u0131yor\u2026","A\xE7\u0131lan taral\u0131 alan simi tutacak.","SOY"],pour:["\u283F","Bir y\u0131\u011F\u0131n par\u0131lt\u0131.","Kap bo\u015Fals\u0131n; sonra simi parma\u011F\u0131nla yay.","D\xD6K"],brush:["\u25B0","Y\u0131\u011F\u0131ndan ba\u015Fla, kenarlara yay.","Sim yetmezse + Sim ile bir y\u0131\u011F\u0131n daha ekle.","YAY"],shake:["\u222A","\u0130ki yandan b\xFCk, ortaya topla.","Fazla sim ortadaki oluktan kutuya ak\u0131yor.","BO\u015EALT"],complete:["\u2727","Ellerine sa\u011Fl\u0131k.","Biraz sab\u0131r, binlerce k\xFC\xE7\xFCk par\u0131lt\u0131.","B\u0130TT\u0130"]};i==="rolling"&&(t.rolling=["\u2197",`Par\xE7a ${di+1} / ${en.length} \xB7 yava\u015F\xE7a soyuluyor`,mi<.2?"C\u0131mb\u0131z kenardan tutuyor.":"Sar\u0131 k\xE2\u011F\u0131t ayr\u0131l\u0131yor, yap\u0131\u015Fkan a\xE7\u0131l\u0131yor.","SOY"]);let n=t[i]||t.brush;we("#phase-icon").textContent=n[0],we("#instruction-title").textContent=n[1],we("#instruction-text").textContent=i==="brush"&&Te.layout!=="flow"?"Sim ekle ile a\xE7\u0131k alan\u0131n \xFCst\xFCne yeni bir y\u0131\u011F\u0131n d\xF6kebilirsin.":n[2],we("#phase-label").textContent=n[3];let s=i==="brush"&&Pl()&&!Tn;we("#next").hidden=!s,we("#next").disabled=!s,we("#next").innerHTML=Ot===Ct.length-1?"Eserini tamamla <span>\u2727</span>":"Sonraki renk <span>\u2192</span>",we("#auto-status").hidden=!0,s&&(we("#instruction-title").textContent="Renk tamamland\u0131.",we("#instruction-text").textContent=Te.autoAdvance?"Parma\u011F\u0131n\u0131 kald\u0131r; s\u0131radaki renge ge\xE7elim.":"Sonraki renk ile devam et."),we("#quick-actions").hidden=i!=="brush"||Tn||s;for(let r of document.querySelectorAll("[data-tool]")){let a=r.dataset.tool,o=a===(i==="shake"?"clean":i==="rolling"?"peel":i);r.classList.toggle("selected",o),r.disabled=Tn||Xe.busy||(a==="peel"?i!=="peel":i==="peel")}}function jp(){return n0[Ct[Ot].id].map(i=>{let e=i.bounds,t=document.createElement("canvas");t.width=e.w,t.height=e.h;let n=t.getContext("2d");n.fillStyle="#fff";for(let[l,c,h]of i.runs)n.fillRect(c,l,h,1);let s=document.createElement("canvas");s.width=e.w,s.height=e.h;let r=s.getContext("2d");r.drawImage(na,e.x,e.y,e.w,e.h,0,0,e.w,e.h),r.globalAlpha=.96,r.drawImage(Yn.lines,e.x,e.y,e.w,e.h,0,0,e.w,e.h),r.globalAlpha=1,r.globalCompositeOperation="destination-in",r.drawImage(t,0,0);let a=document.createElement("canvas");a.width=e.w,a.height=e.h;let o={piece:i,paper:s,brown:a,mask:t};return d0(o),o})}function d0(i){let{brown:e,mask:t}=i,n=e.getContext("2d"),s=i.piece.bounds;n.globalCompositeOperation="source-over",n.clearRect(0,0,s.w,s.h),n.fillStyle={slate:"#738493",dark:"#405c60",kraft:"#b98e65"}[Te.surface]||"#738493",n.fillRect(0,0,s.w,s.h),n.strokeStyle=Te.surface==="kraft"?"#e3c39a40":"#d0dce339",n.lineWidth=.65,n.beginPath();for(let r=-s.h;r<s.w;r+=8)n.moveTo(r,0),n.lineTo(r+s.h,s.h);n.stroke(),n.globalCompositeOperation="destination-in",n.drawImage(t,0,0),n.globalCompositeOperation="source-over"}function _c(i){for(;ta<i;){let e=en[ta++];is.drawImage(e.brown,e.piece.bounds.x,e.piece.bounds.y)}}function Qp(){let i=Gu(en.map(e=>e.piece),Xe.elapsed);_c(i.index),di!==i.index&&(di=i.index,Ye.setPeelPiece(en[di].paper,en[di].piece)),mi=i.progress,Ye.peelProgress(mi),js()}function yc(){ke=new la,ke.setBehavior(Te),ke.setMask(a0[Ct[Ot].id]),Xe.reset(),Ml=!1,mi=0,rn=null,pi=0,ss.length=0,di=0,ta=0,is.globalCompositeOperation="source-over",is.clearRect(0,0,Ge,qe),en=jp(),Xe.setRollDuration(ku(en.map(i=>i.piece))),c0(Ct[Ot].color),dc=-1,Gt.clearRect(0,0,Ge,qe),Ye.setStage(Ot),El(!0),js(),Ye.setPeelPiece(en[0].paper,en[0].piece),wn()}function vc(){fi&&gc(),!(Tn||!Xe.roll())&&(rs=!1,ss.length=0,mi=0,wn())}function f0(){let i=rc(ke.targetCount,Te,ke.capacity);ke.capacity-ke.count<i&&(ke.compact(),Ye.currentInitialized=0);let e=rc(ke.targetCount,Te,ke.capacity-ke.count);if(e<50){Xe.phase="brush",we("#instruction-text").textContent="K\xE2\u011F\u0131tta bol sim var. \xD6nce yay veya fazlas\u0131n\u0131 kutuya bo\u015Falt.";return}let t=Ct[Ot].pour;if(ke.coverage>.15){let s=-1/0,r=t.y;for(let a=0;a<ke.target.length;a++)if(ke.target[a]>12&&!ke.bound[a]){let o=a%120*5+2,l=Math.floor(a/120)*5+2;if(!ke.onGlue(o,l))continue;let c=0;for(let f=-3;f<=3;f++)for(let d=-3;d<=3;d++){let u=a+f*120+d;u>=0&&u<ke.target.length&&!ke.bound[u]&&(c+=ke.target[u])}let h=c-Math.abs(l-r)*1.2;h>s&&(s=h,t={x:o,y:l})}}let n=Ju(t,ke.targetCount,Te.pourStyle);fc=-1,rn={...n.anchor,...n,dose:e,emitted:0,elapsed:0}}function p0(){Tn||!Xe.pour()||(rs=!1,ss.length=0,f0(),pi=0,wn())}function Il(i=!1){Tn||!Xe.shake(i)||(o0++,Qs(),Ye.beginCleanup(),i&&El(!0,!0),rn=null,Ye.posePour(null),pi=0,wn())}function e4(){l0++,El(!0,!0),mc.drawImage(as,0,0),Ye.updateGrains(ke),Ot<Ct.length-1?(Ot++,yc(),Ks=Te.autoAdvance?.22:0):(Tn=!0,Xe.phase="complete",$n.visible=!1,Ye.current.visible=!1,Ye.heap.visible=!1,we("#complete").hidden=!1,wn())}for(let i of document.querySelectorAll("[data-tool]"))i.onclick=()=>{let e=i.dataset.tool;e==="peel"?vc():e==="pour"?p0():e==="clean"?Il(!1):wn()};we("#add-sand").onclick=p0;we("#shake").onclick=()=>Il(!1);we("#next").onclick=()=>{Pl()&&Il(!0)};function m0(){Ye&&(Qs(),Tn=!1,Ot=0,Ks=0,mc.clearRect(0,0,Ge,qe),Gt.clearRect(0,0,Ge,qe),Ye.reset(),we("#complete").hidden=!0,yc())}we("#reset").onclick=()=>{m0(),xc()};we("#again").onclick=m0;we("#save").onclick=()=>{let i=document.createElement("a");i.href=Ye.capture(),i.download="sim-atolyesi-"+Un.id+".png",i.click()};Zn.addEventListener("pointerdown",i=>{if(i.preventDefault(),!(!Ye||Tn||Xe.busy||!Jn.begin(i.pointerId,i.isPrimary!==!1))){if(Zn.setPointerCapture(i.pointerId),$n={...Ye.mapPointer(i),visible:!0},jr={...$n},uc=i.timeStamp,fi&&gc(),Xe.phase==="peel"){vc();return}rs=!0}});Zn.addEventListener("pointermove",i=>{if(!Ye||Tn||i.isPrimary===!1)return;if(Jn.active===null&&i.pointerType==="mouse"&&!i.buttons){$n={...Ye.mapPointer(i),visible:!0};return}if(!Jn.owns(i.pointerId)||!rs||Xe.phase!=="brush")return;let e=Ye.mapPointer(i);$n={...e,visible:!0},Math.hypot(e.x-jr.x,e.y-jr.y)>.1&&zu(ss,{from:{...jr},to:{...e},seconds:Math.max(.001,Math.min(.1,(i.timeStamp-uc)/1e3))}),jr=e,uc=i.timeStamp});function t4(i){Jn.end(i.pointerId)&&(rs=!1,i.pointerType!=="mouse"&&($n.visible=!1),Rl(0),wn())}for(let i of["pointerup","pointercancel","lostpointercapture"])Zn.addEventListener(i,t4);Zn.addEventListener("pointerleave",i=>{Jn.active===null&&($n.visible=!1)});window.addEventListener("blur",Qs);document.addEventListener("visibilitychange",Qs);function n4(){let i=ke.stats(),e=Ye.metrics();Object.assign(Zn.dataset,{version:"6",level:Un.id,feel:Te.feel,brushShape:Te.brushShape,brushRadius:Ul(Te).toFixed(1),mobility:Te.mobility,response:Te.response,jarShape:Te.jarShape,pourStyle:Te.pourStyle,surface:Te.surface,phase:Xe.phase,layout:Te.layout,activePointer:Jn.active??"",emitted:i.emitted,air:i.air,free:i.free,pressed:i.pressedFree,fresh:i.freshFree,moundHeight:i.maxMoundHeight.toFixed(2),bound:i.bound,lost:i.lost,coverage:i.coverage.toFixed(5),height:i.maxHeight.toFixed(2),stage:Ot,peelPart:di+1,peelParts:en.length,peelProgress:mi.toFixed(3),collected:Ye.collectedCount,detached:Ye.spill.count,triangles:e.triangles,draws:e.draws,shakes:o0,advances:l0,cameraZ:Ye.camera.position.z.toFixed(2),fps:Math.round(vl),flowSerial:Xe.serial,shaking:Xe.phase==="shake"?1:0}),we("#hud-fps").textContent=Math.round(vl)+" FPS",we("#hud-detail").textContent=Sl.toFixed(1)+" ms";for(let[t,n]of Object.entries({"stat-fps":Math.round(vl),"stat-frame":Sl.toFixed(1),"stat-sim":cc.toFixed(1),"stat-render":hc.toFixed(1),"stat-particles":(i.air+i.free+Ye.spill.count+(Ye.boxGroup.visible?Ye.collected.count:0)).toLocaleString("tr"),"stat-draws":e.draws,"stat-triangles":e.triangles.toLocaleString("tr"),"stat-memory":performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1):"\u2014"}))we("#"+t).textContent=n;we("#buffer-size").textContent=`${e.width} \xD7 ${e.height} piksel \xB7 oyun s\u0131f\u0131rlanmaz`}function g0(i){if(requestAnimationFrame(g0),document.hidden)return;let e=i-_l;if(!r0.shouldRender(i))return;let t=Math.min(_l?e/1e3:1/60,.06);_l||(yl=i),_l=i,oc++,i-yl>=700&&(vl=oc*1e3/(i-yl),yl=i,oc=0),Sl=Sl*.9+t*1e3*.1;let n=performance.now();if(Kr=0,Ks>0&&!ea.open&&(Ks-=t,Ks<=0&&vc()),Xe.phase==="rolling"&&Qp(),Xe.phase==="pour"&&rn){rn.elapsed=Xe.elapsed,Object.assign(rn,$u(rn,Math.max(0,(Xe.elapsed-.48)/.82))),Ye.posePour(rn);let f=Dc((Xe.elapsed-.48)/.82,Te.pourStyle),d=Math.floor(rn.dose*f),u=d-rn.emitted;if(u>0){let x=Ye.pourOrigin();rn.emitted+=ke.emit(x.x,x.y,u,{spread:4,fan:rn.fan,height:Math.max(12,x.z)}),Object.assign(Zn.dataset,{emitterX:x.x.toFixed(2),emitterY:x.y.toFixed(2),emitterZ:x.z.toFixed(2)})}}let s=0,r=0;for(let f of ss)s+=f.to.x-f.from.x,r+=f.to.y-f.from.y,Kr+=ke.brush(f.from,f.to,Ul(Te),f.seconds);ss.length=0;let a=Math.hypot(s,r)/Math.max(t,.001),o=Math.exp(-t*18);Li={dx:s||Li.dx,dy:r||Li.dy,speed:Li.speed*o+Math.min(1200,a)*(1-o),load:Li.load*o+Math.min(1,Kr/350)*(1-o)};let l=Xe.phase==="shake"?ul(Xe.progress):{bend:0,pitch:0};Ye.updateBend(l.bend,l.pitch),ke.step(Math.min(t,.04),{shaking:Xe.phase==="shake",bend:l.bend,tilt:l.pitch}),Ye.collectSpill(ke,!0);let c=Xe.tick(t,{drainComplete:Xe.phase!=="shake"||!ke.hasLoose()&&Ye.spills.length===0});c==="rolled"&&(_c(en.length),Ml=!0,mi=1,js(),Ye.peelProgress(1),f0(),wn()),c==="poured"&&(rn=null,Ye.posePour(null),wn()),(c==="shaken"||c==="advance")&&(Ye.collectSpill(ke),ke.removeLoose(),ke.compact(),Ye.currentInitialized=0,c==="advance"?e4():wn()),Te.autoAdvance&&Xe.phase==="brush"&&Pl()&&Jn.active===null&&!ea.open&&!Tn?(pi+=t,pi>.55&&Il(!0)):pi=0,El(),cc=cc*.85+(performance.now()-n)*.15,Rl(Xe.phase==="pour"?.14:Xe.phase==="shake"?.15:Xe.phase==="rolling"?.06:Kr?Math.min(.16,.015+Kr*3e-5):0);let h=performance.now();Ye.render(ke,{time:i,dt:t,phase:Xe.phase,down:rs,pointer:$n,brushMotion:Li,peeled:Ml,pour:rn,shakeProgress:Xe.phase==="shake"?Xe.progress:0,finished:Tn}),hc=hc*.85+(performance.now()-h)*.15,(i0+=t)>.2&&(i0=0,wn(),n4())}os(Te);try{await Promise.all([Un.lines,...Ct.map(i=>i.id)].map(i=>new Promise((e,t)=>{let n=new Image;n.onload=()=>{Yn[i]=n,e()},n.onerror=()=>t(Error("\u015Eablon y\xFCklenemedi: "+i)),n.src=`assets/${i}.png?v=6`}))),Yn.lines=Yn[Un.lines];for(let i of Ct){is.clearRect(0,0,Ge,qe),is.drawImage(Yn[i.id],0,0);let e=is.getImageData(0,0,Ge,qe).data,t=new Uint8Array(Ge*qe);for(let n=0;n<t.length;n++)t[n]=e[n*4+3]>80?1:0;a0[i.id]=t}Ot=Ku(location.search,Ct.length);for(let i=0;i<Ot;i++)c0(Ct[i].color),Gt.clearRect(0,0,Ge,qe),Gt.drawImage(sa,0,0),Gt.globalCompositeOperation="destination-in",Gt.drawImage(Yn[Ct[i].id],0,0),Gt.globalCompositeOperation="source-over",mc.drawImage(as,0,0);Gt.clearRect(0,0,Ge,qe),js(),Ye=new pl(Zn,Tl,Ct.map(i=>i.color),Te),yc(),requestAnimationFrame(g0)}catch(i){we("#instruction-title").textContent="At\xF6lye a\xE7\u0131lamad\u0131.",we("#instruction-text").textContent="Sayfay\u0131 g\xFCncel bir taray\u0131c\u0131da yenileyerek tekrar dene.",console.error(i)}
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
