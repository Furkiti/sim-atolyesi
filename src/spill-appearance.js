export const FINISH_DUST_SCALE=.38;
export function exitOpacity(age){const t=Math.max(0,Math.min(1,age/.28));return 1-t*t*(3-2*t);}
