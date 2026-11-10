import {SPRAY_BASE_SLOTS,SPRAY_SLOTS} from './spray.js';

const KEY='sim-atolyesi-spray-wallet-v1';
const PRICES=[60,100];
export class SprayWallet {
 constructor(storage){
  this.storage=storage;this.coins=100;this.capacity=SPRAY_BASE_SLOTS;this.earned={};
  this.refresh();
 }
 refresh(){
  try{
   const saved=JSON.parse(this.storage?.getItem(KEY)||'null');
   if(!saved)return;
   if(Number.isSafeInteger(saved.coins)&&saved.coins>=0)this.coins=saved.coins;
   if(Number.isInteger(saved.capacity)&&saved.capacity>=SPRAY_BASE_SLOTS&&saved.capacity<=SPRAY_SLOTS)this.capacity=saved.capacity;
   if(saved.earned&&typeof saved.earned==='object')this.earned=saved.earned;
  }catch{}
 }
 get price(){return PRICES[this.capacity-SPRAY_BASE_SLOTS]??0;}
 grantThrough(art,band){
  this.refresh();
  const last=this.earned[art]||0;
  if(!Number.isInteger(band)||band<=last)return 0;
  const reward=(band-last)*10;
  this.earned[art]=band;this.coins+=reward;this.save();
  return reward;
 }
 unlock(method,expectedCapacity=this.capacity){
  this.refresh();
  if(this.capacity!==expectedCapacity||!this.price||!['coins','demo'].includes(method))return false;
  if(method==='coins'){
   if(this.coins<this.price)return false;
   this.coins-=this.price;
  }
  this.capacity++;this.save();
  return true;
 }
 save(){
  try{this.storage?.setItem(KEY,JSON.stringify({coins:this.coins,capacity:this.capacity,earned:this.earned}));}catch{}
 }
}
