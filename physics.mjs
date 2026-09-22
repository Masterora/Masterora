// Coordinates match the SVG playfield. Fixed steps keep collisions frame-rate independent.
export const STEP=1/240;
export const bumpers=[...Array.from({length:7},(_,i)=>({x:270+i*232,y:215})),...Array.from({length:7},(_,i)=>({x:370+i*216,y:385})),...Array.from({length:5},(_,i)=>({x:490+i*250,y:550}))];
export const slings=[[[190,530],[330,650],[250,650],[185,590]],[[1640,650],[1770,530],[1770,590],[1700,650]]];
// Resolve against the nearest point on the closed polygon, including embedded balls.
export function polygonContact(ball,vertices){
 let inside=false,nearest=null;
 for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
  const [ax,ay]=vertices[j],[bx,by]=vertices[i];
  if((ay>ball.y)!==(by>ball.y)&&ball.x<(bx-ax)*(ball.y-ay)/(by-ay)+ax)inside=!inside;
  const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((ball.x-ax)*dx+(ball.y-ay)*dy)/(dx*dx+dy*dy)));
  const x=ax+t*dx,y=ay+t*dy,d=Math.hypot(ball.x-x,ball.y-y);
  if(!nearest||d<nearest.d)nearest={x,y,d,dx,dy};
 }
 if(!inside&&nearest.d>=ball.r)return false;
 const sign=inside?-1:1;
 let nx=sign*(ball.x-nearest.x)/(nearest.d||1),ny=sign*(ball.y-nearest.y)/(nearest.d||1);
 if(nearest.d<1e-8){const length=Math.hypot(nearest.dx,nearest.dy);nx=nearest.dy/length;ny=-nearest.dx/length;}
 ball.x=nearest.x+nx*(ball.r+.02);ball.y=nearest.y+ny*(ball.r+.02);
 const speed=ball.vx*nx+ball.vy*ny;
 if(speed>=0)return false;
 ball.vx-=1.9*speed*nx;ball.vy-=1.9*speed*ny;
 return {x:nearest.x,y:nearest.y,nx,ny};
}
const walls=[[130,105,1800,105],[130,105,130,585],[130,585,315,700],[315,700,665,700],[1800,105,1800,585],[1800,585,1615,700],[1615,700,1275,700]];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function contact(ball,ax,ay,bx,by,radius=0,restitution=.85,surface={x:0,y:0}){
  const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
  const t=len?clamp(((ball.x-ax)*dx+(ball.y-ay)*dy)/len,0,1):0;
  const qx=ax+t*dx,qy=ay+t*dy,ox=ball.x-qx,oy=ball.y-qy;
  const distance=Math.hypot(ox,oy),limit=ball.r+radius;
  if(distance>=limit)return false;
  const nx=distance>1e-8?ox/distance:0,ny=distance>1e-8?oy/distance:-1;
  ball.x=qx+nx*(limit+.01);ball.y=qy+ny*(limit+.01);
  const normal=(ball.vx-surface.x)*nx+(ball.vy-surface.y)*ny;
  if(normal>=0)return false;
  ball.vx-=(1+restitution)*normal*nx;ball.vy-=(1+restitution)*normal*ny;
  return {nx,ny,t};
}
export class World{
  constructor(){
    this.time=0;this.hits=0;this.events=[];this.sequence=0;
    this.flippers=[{x:700,y:705,angle:.13,rest:.13,up:-.55,omega:0},{x:1240,y:705,angle:Math.PI-.13,rest:Math.PI-.13,up:Math.PI+.55,omega:0}];
    this.balls=Array.from({length:3},(_,i)=>({id:i,r:11,x:1745-i*30,y:145,vx:-470-i*80,vy:60+i*80,ready:i*.65,cooldowns:Array(21).fill(0),generation:0}));
  }
  launch(ball){
    const n=this.sequence++;
    Object.assign(ball,{x:1765,y:145,vx:-520-(n%4)*75,vy:50+(n%3)*60,ready:this.time+.3,generation:ball.generation+1});
  }
  step(dt=STEP,input={left:false,right:false,auto:true}){
    this.time+=dt;this.events=[];
    this.flippers.forEach((f,i)=>{
      const auto=input.auto&&this.balls.some(b=>b.ready<=this.time&&b.vy>0&&b.y>565&&b.y<735&&Math.abs(b.x-(i?1120:820))<190);
      const active=(i?input.right:input.left)||auto,target=active?f.up:f.rest;
      const before=f.angle;f.angle+=clamp(target-f.angle,-12*dt,12*dt);f.omega=(f.angle-before)/dt;
    });
    for(const ball of this.balls){
      if(ball.ready>this.time)continue;
      ball.vy+=520*dt;ball.vx*=Math.exp(-.035*dt);ball.vy*=Math.exp(-.035*dt);
      const speed=Math.hypot(ball.vx,ball.vy);if(speed>1250){ball.vx*=1250/speed;ball.vy*=1250/speed;}
      ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
      for(const wall of walls)contact(ball,...wall);
      bumpers.forEach((b,i)=>{
        const hit=contact(ball,b.x,b.y,b.x,b.y,58,.95);
        if(hit&&this.time>ball.cooldowns[i]){
          ball.vx+=hit.nx*160;ball.vy+=hit.ny*160;ball.cooldowns[i]=this.time+.12;
          this.hits++;this.events.push({x:b.x,y:b.y,index:i});
        }
      });
      slings.forEach((polygon,i)=>{
        const hit=polygonContact(ball,polygon),index=19+i;
        if(hit&&this.time>ball.cooldowns[index]){
          ball.vx+=hit.nx*220;ball.vy+=hit.ny*220;ball.cooldowns[index]=this.time+.1;
          this.hits++;this.events.push({...hit,index,type:'sling'});
        }
      });
      for(const f of this.flippers){
        const ex=f.x+195*Math.cos(f.angle),ey=f.y+195*Math.sin(f.angle);
        const dx=ex-f.x,dy=ey-f.y,t=clamp(((ball.x-f.x)*dx+(ball.y-f.y)*dy)/(195*195),0,1);
        contact(ball,f.x,f.y,ex,ey,16,.78,{x:-f.omega*dy*t,y:f.omega*dx*t});
      }
      if(ball.y>790||ball.x<80||ball.x>1900)this.launch(ball);
    }
    for(let i=0;i<this.balls.length;i++)for(let j=i+1;j<this.balls.length;j++){
      const a=this.balls[i],b=this.balls[j];if(a.ready>this.time||b.ready>this.time)continue;
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),limit=a.r+b.r;
      if(d>=limit)continue;
      const nx=d?dx/d:1,ny=d?dy/d:0,overlap=(limit-d)/2+.01;
      a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
      const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(speed<0){const impulse=-speed*.94;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
    }
    // Pair separation can push a ball into a nearby solid; project it out again.
    for(const b of this.balls)if(b.ready<=this.time)for(const polygon of slings)polygonContact(b,polygon);
    // Bound post-collision impulses too: a fast rotating tip can inject high energy.
    for(const b of this.balls){const speed=Math.hypot(b.vx,b.vy);if(speed>1250){b.vx*=1250/speed;b.vy*=1250/speed;}}

  }
}
