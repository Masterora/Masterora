import test from 'node:test';
import assert from 'node:assert/strict';
import {World,contact,STEP} from '../physics.mjs';
test('stationary wall separates overlap and dissipates energy',()=>{
 const b={x:135,y:300,r:11,vx:-500,vy:60};
 contact(b,130,105,130,585);
 assert.ok(b.x>=141);assert.ok(b.vx>0&&b.vx<500);assert.equal(b.vy,60);
});
test('a moving paddle transfers velocity',()=>{
 const b={x:800,y:696,r:11,vx:0,vy:300};
 contact(b,700,705,895,705,16,.78,{x:0,y:-600});assert.ok(b.vy < -600);
});
test('separating contacts do not add energy',()=>{
 const b={x:135,y:300,r:11,vx:500,vy:60};contact(b,130,105,130,585);assert.equal(b.vx,500);
});
test('ten simulated minutes remain finite and active',()=>{
 const w=new World();let maxSpeed=0;
 for(let i=0;i<600/STEP;i++){
  w.step();for(const b of w.balls){assert.ok([b.x,b.y,b.vx,b.vy].every(Number.isFinite));maxSpeed=Math.max(maxSpeed,Math.hypot(b.vx,b.vy));assert.ok(b.x>70&&b.x<1910);}
 }
 assert.ok(w.hits>100);assert.ok(maxSpeed<=1250.00001);assert.ok(w.sequence>0);
 console.log({hits:w.hits,relaunches:w.sequence,maxSpeed:Math.round(maxSpeed)});
});
test('same elapsed fixed steps produce deterministic state',()=>{
 const a=new World(),b=new World();for(let frame=0;frame<120;frame++)for(let i=0;i<2;i++)a.step();for(let frame=0;frame<30;frame++)for(let i=0;i<8;i++)b.step();assert.deepEqual(a.balls,b.balls);
});
test('manual paddles release and recover resting angles',()=>{
 const w=new World();for(let i=0;i<30;i++)w.step(STEP,{left:true,right:false,auto:false});assert.equal(w.flippers[0].angle,w.flippers[0].up);assert.equal(w.flippers[1].angle,w.flippers[1].rest);
 for(let i=0;i<30;i++)w.step(STEP,{left:false,right:false,auto:false});assert.equal(w.flippers[0].angle,w.flippers[0].rest);
});
