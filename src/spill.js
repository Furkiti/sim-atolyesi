// Intersect the swept path with the paper edge before mapping it to world space.
// Coordinates follow the stencil: +x right, +y towards the near/bottom edge.
export function paperExit(previousX,previousY,x,y,width=600,height=800){
  const dx=x-previousX,dy=y-previousY,candidates=[];
  const add=(t,edge,nx,ny)=>{const px=previousX+dx*t,py=previousY+dy*t;if(t>=0&&t<=1&&px>=-.001&&px<=width+.001&&py>=-.001&&py<=height+.001)candidates.push({t,x:px,y:py,edge,nx,ny});};
  if(x<0&&dx<0)add(-previousX/dx,'left',-1,0);
  if(x>=width&&dx>0)add((width-previousX)/dx,'right',1,0);
  if(y<0&&dy<0)add(-previousY/dy,'top',0,-1);
  if(y>=height&&dy>0)add((height-previousY)/dy,'bottom',0,1);
  if(candidates.length)return candidates.reduce((a,b)=>a.t<b.t?a:b);
  // Brush input can cross an edge between physics ticks; preserve that edge too.
  const edges=[{edge:'left',d:x,nx:-1,ny:0},{edge:'right',d:width-x,nx:1,ny:0},{edge:'top',d:y,nx:0,ny:-1},{edge:'bottom',d:height-y,nx:0,ny:1}];
  const edge=edges.reduce((a,b)=>a.d<b.d?a:b);return {...edge,x:Math.max(0,Math.min(width,x)),y:Math.max(0,Math.min(height,y))};
}
export function exitVelocity(exit,vx,vy,draining=false){
  const outward=vx*exit.nx+vy*exit.ny,min=draining&&exit.edge==='bottom'?180:45,extra=Math.max(0,min-outward);
  return {vx:vx+exit.nx*extra,vy:vy+exit.ny*extra};
}
