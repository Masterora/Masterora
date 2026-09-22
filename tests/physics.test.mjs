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

test('both trapezoids repel balls at every face and recover embedded balls',async()=>{
 const {slings,polygonContact}=await import('../physics.mjs');
 for(const polygon of slings){
  for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=dy/length,ny=-dx/length;
   const ball={x:(a[0]+b[0])/2+nx*7,y:(a[1]+b[1])/2+ny*7,vx:-nx*1250,vy:-ny*1250,r:11};
   assert.ok(polygonContact(ball,polygon));assert.ok(ball.vx*nx+ball.vy*ny>0);
   assert.equal(polygonContact(ball,polygon),false,'resolved ball is outside the solid');
  }
  const ball={x:polygon.reduce((n,p)=>n+p[0],0)/4,y:polygon.reduce((n,p)=>n+p[1],0)/4,r:11,vx:0,vy:100};
  polygonContact(ball,polygon);const position=[ball.x,ball.y];polygonContact(ball,polygon);assert.deepEqual([ball.x,ball.y],position);
 }
});
test('maximum-speed slingshot hits generate effects and do not tunnel',async()=>{
 const {slings,polygonContact}=await import('../physics.mjs');
 for(const polygon of slings){
  const [a,b]=polygon,dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=dy/length,ny=-dx/length;
  const w=new World();w.balls=w.balls.slice(0,1);Object.assign(w.balls[0],{x:(a[0]+b[0])/2+nx*40,y:(a[1]+b[1])/2+ny*40,vx:-nx*1250,vy:-ny*1250,ready:0});
  let hit=false;
  for(let step=0;step<20;step++){
   w.step(STEP,{auto:false});hit ||= w.events.some(e=>e.type==='sling');
   const ball=w.balls[0],copy={...ball};polygonContact(copy,polygon);assert.ok(Math.hypot(copy.x-ball.x,copy.y-ball.y)<.001);
  }
  assert.ok(hit,'collision must emit a slingshot effect event');
 }
});
