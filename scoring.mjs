// Simulation time drives expiry, so pauses never consume the combo window.
export class Scoreboard {
 constructor(){this.total=0;this.combo=0;this.multiplier=1;this.lastHit=-Infinity;this.lastBurst=-Infinity;}
 expire(time){if(time-this.lastHit>1.5){this.combo=0;this.multiplier=1;}}
 hit(event,time){
  this.expire(time);this.combo++;this.multiplier=Math.min(8,1+Math.floor((this.combo-1)/4));
  const points=(event.type==='sling'?250:100)*this.multiplier;
  this.total+=points;this.lastHit=time;
  const burst=this.combo%8===0&&time-this.lastBurst>=.9;
  if(burst)this.lastBurst=time;
  return {points,burst,multiplier:this.multiplier,combo:this.combo};
 }
}
