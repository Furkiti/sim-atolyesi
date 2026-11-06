export const TABLE_Z=-5.5;
export const tableHold=seed=>.45+seed*.3;
export const tableFade=seed=>.65+seed*.25;
export function tableOpacity(age,seed){const t=Math.max(0,Math.min(1,(age-tableHold(seed))/tableFade(seed)));return 1-t*t*(3-2*t);}
export function startTable(p){p.table=true;p.tableRest=false;p.tableAge=0;p.fadeOnExit=false;p.tableLife=tableHold(p.seed)+tableFade(p.seed);delete p.recovery;}
export function stepTable(p,dt){
 if(p.tableRest){p.tableAge+=dt;return p.tableAge>=p.tableLife;}
 // Z is height above the actual desk. The lower screen area is not a hole.
 p.vz-=980*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
 if(p.z<=TABLE_Z){p.z=TABLE_Z+(p.seed*.17);p.tableRest=true;p.tableAge=0;}
 return false;
}
