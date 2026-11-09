export function completionStatus(coverage,pace='fast',targetPixels=480000,mode='brush'){
 const value=Number.isFinite(coverage)?Math.max(0,Math.min(1,coverage)):0;
 if(mode==='tilt'){
  const ready=value+1e-9>=.95;
  return {ready,percent:ready?100:Math.floor(value*100)};
 }
 // Other modes use only the tolerance for invisible raster remnants.
 const missing=(1-value)*targetPixels,allowance=Math.min(pace==='relaxed'?2:8,targetPixels*.0002);
 const ready=missing<=allowance+1e-7;
 return {ready,percent:ready?100:Math.min(99,Math.round(value*100))};
}

export function resumeIndex(search,stageCount){
 const value=new URLSearchParams(search).get('devam');
 if(!value||!/^\d+$/.test(value))return 0;
 const stage=Number(value);
 return Number.isSafeInteger(stage)&&stage>=1&&stage<=stageCount?stage-1:0;
}

export function shouldFinishHeld(coverage,mode){return mode==='hold'&&Number.isFinite(coverage)&&coverage>=1;}
