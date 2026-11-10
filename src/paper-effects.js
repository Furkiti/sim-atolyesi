export const ADHESION_STYLES=['crystal','ring','soft'];
export const POSTER_SHINES=['classic','radiant','facets'];
export const COVERAGE_GUIDES=['off','pulse','outline'];

export const PAPER_EFFECT_UNIFORMS=`
 uniform sampler2D uSprayOwner, uSprayTiles;
 uniform vec3 uSprayPalette[16];
 uniform float uSprayEnabled, uSprayFront, uSprayClock, uSprayLead, uSprayWave, uSprayBandAge, uGuide, uAdhesion, uReduced;
`;

export const FACET_GLSL=`
 uniform vec3 uPaperLight;
 float facetGlint(vec2 uv,vec2 field){
  // The same flake keeps its normal as the lamp passes over the paper.
  vec2 grain=floor(uv*vec2(600.0,800.0));
  vec2 orientation=fract(vec2(field.r*53.79,field.r*98.03)+grain*vec2(.129,.341));
  vec2 miss=(orientation-.5)*.63+vec2(-.21,.24)-uPaperLight.xy*.5;
  float ray=max(0.0,1.0-dot(miss,miss)*390.0);
  return ray*ray*field.g;
 }
 float radiantGlint(vec2 uv,vec2 field,float time){
  float flash=pow(max(0.0,sin(time*.83+field.r*173.0)),38.0);
  float pass=pow(max(0.0,cos((uv.x*.6+uv.y*.85-time*.11)*6.28318)),32.0);
  float breath=pow(max(0.0,sin(time*.69)),6.0);
  return field.g*flash*.9+pass*breath*(.035+field.g*.6);
 }
 float classicFlicker(float seed,float time){return pow(max(0.0,sin(time*1.4+seed*197.0)),32.0);}
`;

export const PAPER_EFFECT_FRAGMENT=`
    float radial=length(fract(vec2(vMapUv.x,1.0-vMapUv.y)*vec2(120.0,160.0))-.5);
    float ring=1.0-smoothstep(.04,.18,abs(radial-age*.045));
    float shine= uAdhesion>1.5 ? .09+rnd*.04 : uAdhesion>.5 ? .07+ring*.26 : .085+.28*step(.76,rnd);
    gl_FragColor.rgb+=liveCoat*(1.0-smoothstep(0.0,15.0,age))*shine*vec3(1.0,.93,.71)*uSparkle;
    vec2 paperUv=vec2(vMapUv.x,1.0-vMapUv.y);
    if(uGuide>.0&&uSprayEnabled<.5&&activeMask>.035&&contactInk.r<.5){
     float wave=mix(.48,.46+.46*sin(uTime*2.8+vMapUv.y*8.0),1.0-uReduced);
     float edge=.0;
     if(uGuide>1.5){
      vec2 dx=vec2(.002,0.0),dy=vec2(0.0,.0015);
      float border=min(min(texture2D(uActiveMask,vMapUv-dx).a,texture2D(uActiveMask,vMapUv+dx).a),
                       min(texture2D(uActiveMask,vMapUv-dy).a,texture2D(uActiveMask,vMapUv+dy).a));
      float neighbor=max(max(texture2D(uContact,paperUv-dx).r,texture2D(uContact,paperUv+dx).r),
                         max(texture2D(uContact,paperUv-dy).r,texture2D(uContact,paperUv+dy).r));
      edge=max(1.0-border,neighbor);
     }
     vec3 guide=mix(vec3(.85,.67,.29),vec3(1.0,.89,.58),edge);
     gl_FragColor.rgb=mix(gl_FragColor.rgb,guide,activeMask*uActiveAlpha*(.15+wave*.24+edge*.39));
    }
    if(uSprayEnabled>.5){
     int owner=int(floor(texture2D(uSprayOwner,paperUv).r*255.0+.5));
     if(owner>0){
      int index=owner-1;
      vec4 tile=texture2D(uSprayTiles,paperUv);
      float byteValue=index<8?tile.r:tile.g;
      float painted=mod(floor(floor(byteValue*255.0+.5)/exp2(mod(float(index),8.0))),2.0);
      float open=smoothstep(uSprayFront-.024,uSprayFront+.024,paperUv.y);
      vec3 pigment=linearToOutputTexel(vec4(uSprayPalette[index],1.0)).rgb;
      vec3 ghost=mix(vec3(.92,.87,.74),pigment,.13+open*.32);
      float hatch=step(.82,fract((cell.x+cell.y)*.145))*.055;
      ghost-=vec3(hatch*(.4+open*.6));
      if(uSprayLead==float(index)&&open>.5){
       float breath=mix(.6,.55+.45*sin(uSprayClock*4.0),1.0-uReduced);
       ghost=mix(ghost,mix(pigment,vec3(1.0,.84,.54),.26),.32+breath*.24);
       ghost+=vec3(.13,.095,.05)*hatch*8.0;
      }
      vec3 grains=pigment*(.66+.54*rnd)+vec3(.21)*step(.975,rnd);
      if(uRadiant<1.5)grains+=vec3(1.0,.94,.75)*uSparkle*field.g*(.06+.46*classicFlicker(rnd,uTime));
      float stamp=floor(tile.b*255.0+.5)+floor(tile.a*255.0+.5)*256.0;
      float contactAge=mod(uSprayClock*60.0-stamp+65537.0,65536.0);
      float impact=step(.5,stamp)*(1.0-smoothstep(.0,18.0,contactAge));
      float halo=1.0-smoothstep(.035,.19,abs(radial-contactAge*.037));
      float vfx=uAdhesion>1.5?.10+.07*rnd:uAdhesion>.5?.07+halo*.39:.12+.50*step(.73,rnd);
      grains+=vec3(1.0,.91,.66)*impact*vfx*uSparkle;
      if(uRadiant>1.5)grains+=vec3(1.0,.95,.80)*uSparkle*facetGlint(vMapUv,field)*1.3;
      if(uSprayBandAge<.5){
       float crest=1.0-smoothstep(.0,.09,abs(paperUv.y-(uSprayWave+uSprayBandAge*.13)));
       grains+=vec3(1.0,.90,.60)*crest*(1.0-uSprayBandAge*2.0)*(.05+field.g*.8)*uSparkle*(1.0-uReduced*.65);
      }
      vec3 sprayed=mix(ghost,grains,painted);
      sprayed=mix(sprayed,linearToOutputTexel(artLine).rgb,artLine.a*.91);
      gl_FragColor.rgb=mix(gl_FragColor.rgb,sprayed,uActiveAlpha);
     }
    }
`;
