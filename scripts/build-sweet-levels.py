"""Three original, editable candy-colour stencil illustrations. Pillow/numpy/OpenCV."""
from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import numpy as np,cv2,math,re,json
ROOT=Path(__file__).resolve().parents[1];W,H=600,800
class Art:
 def __init__(self):self.im=Image.new('L',(W,H),8);self.d=ImageDraw.Draw(self.im);self.decor=[]
 def ellipse(self,box,c):self.d.ellipse(box,fill=c)
 def rect(self,box,c,r=0):self.d.rounded_rectangle(box,radius=r,fill=c)
 def polygon(self,pts,c):self.d.polygon(pts,fill=c)
 def line(self,pts,c,width=3):self.d.line(pts,fill=c,width=width,joint='curve')
 def path(self,text,c):
  tok=re.findall(r'[MLCQZ]|-?\d+(?:\.\d+)?',text);i=0;pts=[];cur=(0,0)
  while i<len(tok):
   cmd=tok[i];i+=1
   if cmd=='Z':break
   n={'M':2,'L':2,'C':6,'Q':4}[cmd];v=list(map(float,tok[i:i+n]));i+=n
   if cmd in ('M','L'):cur=tuple(v);pts.append(cur)
   else:
    a=cur
    for j in range(1,61):
     t=j/60;u=1-t
     if cmd=='C':cur=(u**3*a[0]+3*u*u*t*v[0]+3*u*t*t*v[2]+t**3*v[4],u**3*a[1]+3*u*u*t*v[1]+3*u*t*t*v[3]+t**3*v[5])
     else:cur=(u*u*a[0]+2*u*t*v[0]+t*t*v[2],u*u*a[1]+2*u*t*v[1]+t*t*v[3])
     pts.append(cur)
  self.d.polygon(pts,fill=c)
 def star(self,x,y,r,c):
  self.polygon([(x+math.cos(j*math.pi/5-math.pi/2)*(r if j%2==0 else r*.43),y+math.sin(j*math.pi/5-math.pi/2)*(r if j%2==0 else r*.43)) for j in range(10)],c)
 def heart(self,x,y,s,c):self.path(f'M {x} {y+s} C {x-s*2} {y-s*.2} {x-s*.8} {y-s*1.4} {x} {y-s*.5} C {x+s*.8} {y-s*1.4} {x+s*2} {y-s*.2} {x} {y+s} Z',c)
 def save(self,id,palette,order):
  a=np.array(self.im);meta=[];preview=np.zeros((H,W,3),np.uint8)
  for n,(suffix,name,color) in enumerate(palette,1):
   m=np.uint8(a==n)*255;out=np.zeros((H,W,4),np.uint8);out[:,:,:3]=[20,20,25];out[:,:,3]=m;Image.fromarray(out).save(ROOT/'assets'/f'{id}-{suffix}.png');preview[m>0]=tuple(bytes.fromhex(color[1:]));ys,xs=np.where(m>0)
   dist=cv2.distanceTransform(m,cv2.DIST_L2,5);lo,hi=np.quantile(ys,[.12,.35]);dist[(np.indices(m.shape)[0]<lo)|(np.indices(m.shape)[0]>hi)]=0;y,x=np.unravel_index(dist.argmax(),dist.shape)
   meta.append(dict(id=f'{id}-{suffix}',name=name,color=color,pour=dict(x=int(x),y=int(y)),area=int(len(xs))))
  edge=np.array(self.im.filter(ImageFilter.MaxFilter(3)))!=np.array(self.im.filter(ImageFilter.MinFilter(3)));ink=np.zeros((H,W,4),np.uint8);ink[:,:,:3]=[59,43,63];ink[:,:,3]=edge*160
  lines=Image.fromarray(ink);dl=ImageDraw.Draw(lines)
  for pts,width in self.decor:dl.line(pts,fill=(59,43,63,190),width=width,joint='curve')
  lines.save(ROOT/'assets'/f'{id}-lines.png');p=Image.fromarray(preview);p.alpha_composite(lines) if p.mode=='RGBA' else None
  p=Image.alpha_composite(Image.fromarray(preview).convert('RGBA'),lines);p.save(ROOT/'assets'/f'{id}-preview.png')
  return [meta[n-1] for n in order]
# Strawberry cat hugs an oversized frosted doughnut.
a=Art();a.heart(300,263,165,4)
for x,y,r in [(83,145,20),(512,204,16),(77,409,13),(516,478,22)]:a.star(x,y,r,6)
a.path('M 170 417 Q 137 500 174 592 Q 299 640 423 582 Q 458 491 415 419 Z',2)
a.path('M 151 337 L 123 190 Q 201 190 230 233 Q 299 203 364 234 Q 408 187 476 194 L 449 345 Q 434 464 301 487 Q 171 466 151 337 Z',1)
a.path('M 177 331 L 164 236 Q 210 244 235 280 Q 301 255 365 281 Q 399 245 439 237 L 421 342 Q 414 435 301 453 Q 191 436 177 331 Z',2)
a.path('M 174 295 L 174 251 L 221 284 Z',4);a.path('M 378 285 L 431 249 L 425 300 Z',4)
# Little strawberry seed freckles on the hood.
for x,y in [(152,279),(160,361),(181,419),(440,352),(419,417),(210,235),(394,233)]:a.ellipse((x-3,y-6,x+3,y+6),6)
a.path('M 246 236 Q 256 163 297 141 Q 295 198 316 230 Q 354 168 392 172 Q 359 224 336 250 Q 387 230 411 264 Q 354 270 313 251 Q 263 277 212 260 Z',5)
a.ellipse((210,335,250,376),7);a.ellipse((353,335,393,376),7)
a.ellipse((220,339,231,350),2);a.ellipse((363,339,374,350),2)
a.ellipse((194,380,238,400),4);a.ellipse((365,380,409,400),4)
a.path('M 284 386 Q 301 377 317 386 L 301 399 Z',7)
a.decor.extend([([(300,399),(300,412),(288,420),(278,414)],3), ([(300,412),(312,420),(324,414)],3), ([(187,385),(150,375)],2), ([(187,400),(150,404)],2), ([(415,385),(451,375)],2), ([(415,400),(451,404)],2)])
a.ellipse((101,492,502,748),3);a.ellipse((231,558,374,675),8)
a.path('M 113 561 C 129 496 206 483 299 493 C 383 481 470 512 490 561 Q 477 596 451 573 Q 437 625 405 581 Q 368 620 350 578 Q 322 562 296 567 Q 261 595 240 575 Q 221 623 196 586 Q 158 623 148 576 Q 126 603 113 561 Z',4)
for x,y,ang in [(158,547,0),(204,527,1),(276,523,0),(355,527,1),(421,550,0),(381,566,1)]:a.line([(x-6,y-3),(x+6,y+3)],6 if ang else 2,5)
a.ellipse((151,463,218,520),2);a.ellipse((388,463,455,520),2)
a.decor.extend([([(173,483),(172,502)],2), ([(192,482),(192,502)],2), ([(410,482),(410,502)],2), ([(429,483),(429,502)],2)])
cat=a.save('berry',[('berry','Çilek kırmızısı','#e95172'),('cream','Vanilya','#fff4df'),('biscuit','Bisküvi','#d99a5a'),('pink','Pembe krema','#f8acc6'),('leaf','Fıstık yeşili','#438e78'),('gold','Şeker sarısı','#f3cc63'),('ink','Kakao gözler','#49344c'),('mint','Nane fon','#b5e3d7')],[1,2,3,4,5,6,7,8])
# Capybara relaxing inside a giant boba drink.
a=Art()
for x,y,s in [(86,170,19),(510,326,20),(80,560,16)]:a.heart(x,y,s,4)
a.ellipse((117,253,478,685),1);a.ellipse((119,225,213,317),1);a.ellipse((387,225,481,317),1)
a.ellipse((143,243,192,288),4);a.ellipse((411,243,457,288),4)
a.rect((288,103,323,485),5,14);a.line([(306,112),(305,459)],2,9)
a.ellipse((130,273,471,502),1);a.ellipse((188,356,416,492),2)
a.ellipse((201,330,226,355),7);a.ellipse((377,330,402,355),7)
a.ellipse((255,390,272,412),7);a.ellipse((331,390,348,412),7)
a.decor.append(([(282,428),(299,438),(318,428)],4));a.ellipse((163,370,203,389),4);a.ellipse((402,370,442,389),4)
# Mandarin on the head, leaf and mellow sparkles.
a.ellipse((220,221,334,296),6);a.path('M 277 227 Q 292 177 333 198 Q 323 229 277 227 Z',3)
for x,y,r in [(485,160,23),(130,108,16),(499,620,16)]:a.star(x,y,r,6)
a.path('M 124 466 L 475 466 L 444 702 Q 300 776 155 702 Z',3)
a.path('M 144 480 L 456 480 L 427 686 Q 300 745 174 686 Z',2)
a.path('M 157 515 Q 214 492 269 518 Q 321 544 443 514 L 425 682 Q 301 738 177 682 Z',1)
a.ellipse((130,445,469,503),2)
a.line([(146,473),(450,473)],6,5)
for x,y,r in [(216,636,23),(276,659,23),(339,659,23),(393,632,23)]:a.ellipse((x-r,y-r,x+r,y+r),7)
a.line([(216,656),(276,678),(339,678),(393,652)],7,5)
a.path('M 189 531 Q 194 587 195 620 Q 197 631 209 626 L 210 534 Z',2)
a.ellipse((103,453,167,541),1);a.ellipse((435,453,499,541),1)
a.decor.extend([([(120,483),(149,487)],3), ([(451,487),(481,483)],3)])
boba=a.save('boba',[('tea','Sütlü karamel','#bc885e'),('cream','Süt köpüğü','#fff1d5'),('jade','Cam yeşili','#79c2bd'),('pink','Gül lokumu','#eea3b9'),('straw','Frambuaz pipet','#ce608a'),('orange','Mandalina','#f0b052'),('pearl','Boba incileri','#50374a'),('lilac','Lavanta fon','#d6c8ec')],[1,2,3,4,5,6,7,8])
# Frog baker and strawberry cupcake.
a=Art()
for x,y,r in [(88,139,19),(512,172,21),(85,561,15),(506,588,13)]:a.star(x,y,r,5)
a.heart(490,364,19,4)
a.ellipse((147,416,454,711),1);a.ellipse((96,641,251,725),1);a.ellipse((358,641,510,725),1)
a.path('M 229 278 L 304 92 L 385 280 Z',5);a.ellipse((288,75,320,109),2)
a.line([(255,220),(353,220)],6,16)
a.ellipse((96,240,258,409),1);a.ellipse((343,240,505,409),1);a.ellipse((80,295,520,529),1)
a.ellipse((125,266,230,383),2);a.ellipse((371,266,476,383),2)
a.ellipse((154,289,206,350),7);a.ellipse((395,289,447,350),7);a.ellipse((164,294,181,311),2);a.ellipse((405,294,422,311),2)
a.ellipse((112,399,178,431),4);a.ellipse((422,399,488,431),4)
a.decor.append(([(225,418),(249,444),(276,453),(300,456),(328,452),(352,440),(375,416)],5))
a.ellipse((264,387,273,396),7);a.ellipse((328,387,337,396),7)
a.path('M 161 555 L 441 555 L 413 713 Q 302 746 189 712 Z',6)
for x in [210,254,300,346,390]:a.line([(x,591),(x+(300-x)*.12,714)],3,9)
a.ellipse((151,512,452,611),3)
a.path('M 147 553 C 135 519 172 497 195 494 C 186 455 217 429 254 438 C 260 404 317 398 333 439 C 372 419 408 452 396 484 C 435 484 468 514 452 550 Q 438 599 409 560 Q 387 605 359 565 Q 330 614 303 567 Q 268 610 245 563 Q 216 601 194 563 Q 168 599 147 553 Z',2)
a.path('M 259 456 C 227 418 242 389 275 396 Q 299 382 321 397 C 356 389 374 420 338 454 Q 300 494 259 456 Z',4)
a.path('M 253 398 Q 258 377 280 389 Q 288 357 302 379 Q 321 363 326 390 Q 348 379 352 402 Q 321 416 302 396 Q 282 416 253 398 Z',1)
for x,y in [(269,421),(294,441),(322,421)]:a.ellipse((x-2,y-4,x+2,y+4),6)
a.ellipse((105,530,180,600),1);a.ellipse((424,530,499,600),1)
a.decor.extend([([(128,549),(130,581)],3), ([(149,545),(150,580)],3), ([(450,545),(450,580)],3), ([(472,549),(472,581)],3)])
frog=a.save('frog',[('green','Fıstık kurbağa','#8dbb76'),('cream','Vanilya kreması','#fff5df'),('cake','Kek kırıntısı','#b68565'),('berry','Çilek şekeri','#e987a9'),('lilac','Parti moru','#a995d4'),('gold','Pastacı sarısı','#e9bf69'),('ink','Gülen gözler','#3e4854'),('yellow','Limon fon','#f5dfa2')],[1,2,3,4,5,6,7,8])
(ROOT/'src/sweet-levels.js').write_text('export const sweetStages='+json.dumps(dict(berry=cat,boba=boba,frog=frog),ensure_ascii=False,indent=1)+';\n')
print('Generated strawberry cat, boba capybara and frog bakery.')
