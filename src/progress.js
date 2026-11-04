// A few sub-pixel stencil edges must not strand a visually completed colour.
// The label, next button and automatic transition use this same decision.
export function completionStatus(coverage){
 const value=Number.isFinite(coverage)?Math.max(0,Math.min(1,coverage)):0;
 const ready=value>=.995;
 return {ready,percent:ready?100:Math.min(99,Math.round(value*100))};
}

export function resumeIndex(search,stageCount){
 const value=new URLSearchParams(search).get('devam');
 if(!value||!/^\d+$/.test(value))return 0;
 const stage=Number(value);
 return Number.isSafeInteger(stage)&&stage>=1&&stage<=stageCount?stage-1:0;
}
