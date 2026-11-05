import {referenceLevels} from './reference-levels.js';
import {stages} from './palette.js';
import {sweetStages} from './sweet-levels.js';
import {gardenStages} from './garden.js';
export const levelCatalog=[
 {id:'gotham',name:'Gotham',subtitle:'Batman & Joker · 11 renk',lines:'lines',preview:'gotham-preview',stages},
 {id:'ay-bahcesi',name:'Ay Bahçesi',subtitle:'Ay ışığında bir tilki · 8 renk',lines:'garden-lines',preview:'garden-preview',stages:gardenStages},
 {id:'cilekli-kedi',name:'Çilekli Kedi',subtitle:'Çilek şapkası ve dev donut · 8 renk',lines:'berry-lines',preview:'berry-preview',stages:sweetStages.berry},
 {id:'boba-molasi',name:'Boba Molası',subtitle:'Mandalinalı kapibara · 8 renk',lines:'boba-lines',preview:'boba-preview',stages:sweetStages.boba},
 {id:'kurbaga-pastanesi',name:'Kurbağa Pastanesi',subtitle:'Bir kurbağa, bol krema · 8 renk',lines:'frog-lines',preview:'frog-preview',stages:sweetStages.frog},
 ...referenceLevels
];
const enabledIds=new Set(['gotham','barcelona','naruto','mor-portre']);
export const levels=levelCatalog.filter(level=>enabledIds.has(level.id));
export function selectLevel(search){const id=new URLSearchParams(search).get('bolum');return levels.find(l=>l.id===id)||levels[0]}
