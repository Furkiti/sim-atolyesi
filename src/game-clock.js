export const GAME_SPEEDS=[1,1.25,1.5,1.75,2,3,4];
// Scale game time, then subdivide it: high speeds must not skip physics contacts.
export function gameSteps(realDelta,speed=1,maxSteps=Infinity){
 const requested=Math.max(0,Math.min(.06,Number.isFinite(realDelta)?realDelta:0))*(GAME_SPEEDS.includes(speed)?speed:1);
 const total=Math.min(requested,maxSteps*.04),count=Math.ceil(total/.04);
 return{total,count,dt:count?total/count:0};
}
