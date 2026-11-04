import {stages} from './palette.js';
import {gardenStages} from './garden.js';
export const levels=[
 {id:'gotham',name:'Gotham',subtitle:'Batman & Joker · 11 renk',lines:'lines',preview:'gotham-preview',stages},
 {id:'ay-bahcesi',name:'Ay Bahçesi',subtitle:'Ay ışığında bir tilki · 8 renk',lines:'garden-lines',preview:'garden-preview',stages:gardenStages}
];
export function selectLevel(search){const id=new URLSearchParams(search).get('bolum');return levels.find(l=>l.id===id)||levels[0]}
