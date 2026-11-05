export function drawGlitter(tc,color,W=600,H=800,grainSize=1){
 tc.fillStyle=color;tc.fillRect(0,0,W,H);
 for(let i=0;i<Math.round(120000/(grainSize*grainSize));i++){const x=Math.random()*W,y=Math.random()*H,r=Math.random();tc.fillStyle=r>.975?'#fff8dfb0':r>.4?'#ffffff1c':'#00000024';tc.fillRect(x,y,(.7+Math.random()*.7)*grainSize,(.7+Math.random()*.7)*grainSize);}
}
