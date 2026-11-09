export const HOLD_MATERIALS={
 classic:{name:'Mevcut akış',description:'Taneler dokunduğun noktaya akıp çevresine dağılır.'},
 shear:{name:'Katmanlı Kayış',description:'Üstteki taneler öne kaçar. Alttaki yoğun katman biraz geriden sökülür.'},
 avalanche:{name:'Minik Çığlar',description:'Sim şeridinden art arda küçük yığınlar kopar ve yayılır.'}
};

const SHEAR=[
 {speed:.71,delay:.14,bed:3,rise:9,runout:.72,spread:.82},
 {speed:.98,delay:.06,bed:6,rise:21,runout:1.12,spread:1.25},
 {speed:1.36,delay:0,bed:7,rise:30,runout:1.35,spread:1.08}
];

export function configureHoldGrain(route,material,seed){
 const grade=seed*157%1;
 const layer=material==='shear'?SHEAR[grade<.43?0:grade<.81?1:2]:null;
 if(layer){
  route.speed*=layer.speed;
  route.delay=route.delay*.65+layer.delay;
  route.bed=layer.bed;
  route.rise=layer.rise;
  route.runoffDistance*=layer.runout;
  route.runoffSpread*=layer.spread;
  return;
 }
 if(material==='avalanche'){
  // Neighbouring flakes share a release wave, with a little individual lag.
  const strip=Math.floor(route.x/46),wave=(strip*3+Math.floor(grade*3))%5;
  route.packet=wave;
  route.delay=.02+wave*.16+(seed*97%1)*.19;
  route.speed*=.98+(seed*79%1)*.20;
  route.bed=5;
  route.rise=33+(seed*71%1)*20;
  route.runoffDistance*=.83;
  route.runoffSpread*=1.38;
 }
}

// Shared per-wave acceleration. A rolling group speeds up, breaks and coasts.
export function avalanchePulse(seconds,packet){
 const phase=(seconds*2.55-packet*.22+2)%1;
 return .48+1.22*Math.max(0,1-Math.abs(phase-.35)*2.75);
}
