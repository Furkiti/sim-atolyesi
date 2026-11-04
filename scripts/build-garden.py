"""Original code-drawn stencil: Ay Bahçesi. Rebuild with Pillow + numpy."""
from PIL import Image,ImageDraw,ImageFilter
import numpy as np,math,re,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]; W,H=600,800
labels=Image.new('L',(W,H),1); d=ImageDraw.Draw(labels)
# Curves stay editable as artwork rather than a flattened borrowed illustration.
def path(text,colour):
 tokens=re.findall(r'[MLCQZ]|-?\d+(?:\.\d+)?',text);i=0;pts=[];cur=(0,0)
 while i<len(tokens):
  cmd=tokens[i];i+=1
  if cmd=='Z':break
  n={'M':2,'L':2,'C':6,'Q':4}[cmd];v=list(map(float,tokens[i:i+n]));i+=n
  if cmd in ('M','L'):cur=(v[0],v[1]);pts.append(cur)
  else:
   a=cur
   for step in range(1,41):
    t=step/40;u=1-t
    if cmd=='C':cur=(u**3*a[0]+3*u*u*t*v[0]+3*u*t*t*v[2]+t**3*v[4],u**3*a[1]+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5])
    else:cur=(u*u*a[0]+2*u*t*v[0]+t*t*v[2],u*u*a[1]+2*u*t*v[1]+t*t*v[3])
    pts.append(cur)
 d.polygon(pts,fill=colour)
# Gold halo, crescent and four-point stars.
d.ellipse((322,83,505,266),fill=2);d.ellipse((294,57,466,231),fill=1)
for x,y,r in [(131,142,19),(269,101,12),(488,342,14),(98,371,11),(375,289,8)]:d.polygon([(x,y-r),(x+4,y-4),(x+r,y),(x+4,y+4),(x,y+r),(x-4,y+4),(x-r,y),(x-4,y-4)],fill=2)
for x,y in [(203,160),(507,277),(84,247),(463,80),(283,218),(149,306),(526,430)]:d.ellipse((x-2,y-2,x+2,y+2),fill=2)
# Connected botanical stems and leaves frame the fox.
for side in (-1,1):
 def xx(x):return 300+side*x
 pts=[(xx(174),706),(xx(205),605),(xx(216),476),(xx(186),331),(xx(169),279)]
 d.line(pts,fill=3,width=9,joint='curve')
 for y,x in [(657,192),(584,211),(507,216),(428,207),(355,190)]:
  for sign in (-1,1):
   x0=xx(x);tipx=xx(x+sign*50);tipy=y-45
   p=f'M {x0} {y} Q {xx(x+sign*45)} {y+8} {tipx} {tipy} Q {xx(x+sign*3)} {y-50} {x0} {y} Z';path(p,4 if sign==1 else 3)
# Ground semicircles / still water.
path('M 78 714 Q 300 617 522 714 Q 300 775 78 714 Z',3)
path('M 118 719 Q 300 672 482 719 Q 300 748 118 719 Z',1)
# Fox tail and seated body, clear broad shapes for satisfying spreading.
path('M 304 649 C 416 552 524 592 489 481 C 565 520 530 697 398 709 C 340 720 289 701 247 674 Z',5)
path('M 449 586 C 491 576 506 538 489 481 C 538 517 537 568 513 612 C 491 610 473 603 449 586 Z',6)
path('M 211 457 C 186 517 166 622 193 686 Q 287 733 374 678 C 390 613 366 526 342 466 Z',5)
path('M 266 473 C 219 535 220 629 273 685 Q 312 701 338 674 C 346 615 304 564 309 488 Z',6)
# Ears / face outline.
path('M 205 370 L 184 241 Q 230 261 265 297 Q 300 283 331 300 Q 367 263 405 242 L 383 382 Q 345 461 297 481 Q 242 469 205 370 Z',5)
path('M 208 330 L 202 267 Q 236 288 250 312 Z',7)
path('M 344 314 Q 369 285 388 267 L 376 336 Z',7)
# Cream cheeks with long pointed mask.
path('M 212 359 Q 248 358 278 397 Q 290 411 298 439 Q 314 403 339 384 Q 361 364 380 362 Q 352 438 297 481 Q 238 451 212 359 Z',6)
path('M 249 359 Q 270 350 284 365 Q 269 375 249 359 Z',8)
path('M 316 366 Q 339 350 352 360 Q 337 376 316 366 Z',8)
path('M 280 438 Q 298 427 316 438 L 299 453 Z',8)
d.line([(299,450),(298,465)],fill=8,width=3)
# Feet, fine warm fur marks.
path('M 194 671 Q 227 655 254 685 L 253 701 Q 210 702 192 688 Z',8)
path('M 316 685 Q 341 658 375 674 L 375 693 Q 342 710 316 703 Z',8)
for x in [223,235,343,355]:d.line([(x,684),(x-1,697)],fill=6,width=2)
# Blossom clusters with gold centres, one peel per blossom.
for x,y,r in [(116,483,26),(482,407,23),(126,625,21),(457,654,25)]:
 for j in range(5):
  a=j*math.tau/5-math.pi/2;cx=x+math.cos(a)*r*.48;cy=y+math.sin(a)*r*.48
  d.ellipse((cx-r*.49,cy-r*.49,cx+r*.49,cy+r*.49),fill=7)
 d.ellipse((x-r*.23,y-r*.23,x+r*.23,y+r*.23),fill=2)
a=np.array(labels); palette=[('garden-night','Gece laciverdi','#152d48'),('garden-gold','Ay altını','#e8bc54'),('garden-jade','Yeşim dallar','#267b7b'),('garden-mint','Nane yaprakları','#82c5b0'),('garden-fox','Tilki turuncusu','#dc713b'),('garden-cream','Ay beyazı','#fff4df'),('garden-rose','Gül yaprakları','#d97697'),('garden-ink','Mürekkep','#182132')]
preview=np.zeros((H,W,3),np.uint8);stages=[]
for i,(id,name,color) in enumerate(palette,1):
 mask=a==i;rgba=np.zeros((H,W,4),np.uint8);rgba[:,:,:3]=[20,24,31];rgba[:,:,3]=mask*255;Image.fromarray(rgba).save(root/'assets'/f'{id}.png');preview[mask]=tuple(bytes.fromhex(color[1:]));ys,xs=np.where(mask)
 # Stable top-quarter target anchor; all material still pours above it.
 row=int(np.quantile(ys,.28));near=np.where(mask[max(0,row-6):row+7]);x=int(np.median(near[1]));
 stages.append(dict(id=id,name=name,color=color,pour=dict(x=x,y=max(110,row)),area=int(mask.sum())))
# Fine contour print, generated from the same partition, never a competing mask.
edge=Image.fromarray(a).filter(ImageFilter.MaxFilter(3));edge2=Image.fromarray(a).filter(ImageFilter.MinFilter(3));e=(np.array(edge)!=np.array(edge2));out=np.zeros((H,W,4),np.uint8);out[:,:,:3]=[21,35,49];out[:,:,3]=e*170;Image.fromarray(out).save(root/'assets/garden-lines.png');preview[e]=(preview[e]*.6).astype(np.uint8);Image.fromarray(preview).save(root/'assets/garden-preview.png')
order=[5,6,8,3,4,7,2,1];stages=[stages[i-1] for i in order]
(root/'src/garden.js').write_text('export const gardenStages='+json.dumps(stages,ensure_ascii=False,indent=1)+';\n')
print([(s['id'],s['area']) for s in stages])
