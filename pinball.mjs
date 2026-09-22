import {World,STEP,bumpers} from './physics.mjs';
const field=document.querySelector('#field'),pause=document.querySelector('#motion'),status=document.querySelector('#status'),hits=document.querySelector('#hits');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches,world=new World(),accumulator=0,last=0,manualUntil=0;
const input={left:false,right:false,auto:true},NS='http://www.w3.org/2000/svg';
function element(tag,attrs,parent){const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n;}
try{
 const response=await fetch('./assets/tech-pinball-v2.svg');if(!response.ok)throw Error('asset');
 field.innerHTML=await response.text();field.classList.add('live');
 const svg=field.querySelector('svg');svg.querySelector('desc').textContent='实时重力、弹性碰撞与可控制挡板的技术弹珠台。';
 const layer=element('g',{},svg),effects=element('g',{},layer);
 const sprites=world.balls.map(b=>({trail:element('path',{fill:'none',stroke:'#a9ff48','stroke-width':6,'stroke-linecap':'round',opacity:.22},layer),ball:element('circle',{cx:b.x,cy:b.y,r:11,fill:'url(#steel)',stroke:'#c7ff8b','stroke-width':1},layer),history:[],generation:-1}));
 const paddles=world.flippers.map(()=>element('path',{fill:'#b0fa52',stroke:'#dcffba','stroke-width':2,'stroke-linejoin':'round'},layer));
 const flashes=bumpers.map(()=>0),particles=[];
 const bumperNodes=bumpers.map((_,i)=>svg.querySelector('.bumper-'+i)),impactNodes=bumpers.map((_,i)=>svg.querySelector('.impact-'+i));
 function sync(){field.classList.toggle('paused',paused);pause.textContent=paused?'继续':'暂停';pause.setAttribute('aria-pressed',String(paused));accumulator=0;}
 function clearInput(){input.left=false;input.right=false;}
 function activate(side,value){input[side]=value;if(value)manualUntil=world.time+8;}
 for(const side of ['left','right']){
   const button=document.querySelector('#'+side);
   button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(side,true);}});
   button.addEventListener('keyup',()=>activate(side,false));
   button.addEventListener('blur',()=>activate(side,false));
   button.addEventListener('pointerdown',e=>{button.setPointerCapture(e.pointerId);activate(side,true);});
   for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>activate(side,false));
 }
 field.addEventListener('pointerdown',e=>{field.focus();field.setPointerCapture(e.pointerId);const r=field.getBoundingClientRect();activate(e.clientX-r.left<r.width/2?'left':'right',true);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])field.addEventListener(event,clearInput);
 function launch(){if(paused)return;world.launch(world.balls.reduce((a,b)=>a.y>b.y?a:b));}
 document.querySelector('#launch').addEventListener('click',launch);
 window.addEventListener('keydown',e=>{
   if(e.target.closest('button,a'))return;
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();activate(e.key==='ArrowLeft'?'left':'right',true);}
   if(e.code==='Space'){e.preventDefault();if(!e.repeat)launch();}
 });
 window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft')activate('left',false);if(e.key==='ArrowRight')activate('right',false);});
 window.addEventListener('blur',()=>{clearInput();last=0;accumulator=0;});
 document.addEventListener('visibilitychange',()=>{clearInput();last=0;accumulator=0;});
 pause.addEventListener('click',()=>{paused=!paused;clearInput();sync();});
 preference.addEventListener('change',e=>{paused=e.matches;sync();});
 document.querySelectorAll('button').forEach(b=>b.disabled=false);sync();
 function frame(now){
   const delta=last?Math.min((now-last)/1000,.05):0;last=now;
   if(!paused&&!document.hidden){
     accumulator+=delta;input.auto=world.time>manualUntil;
     while(accumulator>=STEP){
       world.step(STEP,input);accumulator-=STEP;
       for(const event of world.events){
         flashes[event.index]=world.time;
         for(let k=0;k<6;k++){
           const angle=k*Math.PI/3+world.time;
           particles.push({node:element('rect',{width:4,height:4,fill:'#c3ff7e'},effects),x:event.x,y:event.y,vx:Math.cos(angle)*200,vy:Math.sin(angle)*200,born:world.time});
         }
       }
     }
     for(let i=particles.length-1;i>=0;i--){const p=particles[i],age=world.time-p.born;if(age>.38){p.node.remove();particles.splice(i,1);continue;}p.node.setAttribute('x',p.x+p.vx*age);p.node.setAttribute('y',p.y+p.vy*age);p.node.setAttribute('opacity',1-age/.38);}
     world.balls.forEach((b,i)=>{
       const s=sprites[i];if(s.generation!==b.generation){s.history=[];s.generation=b.generation;}
       const visible=b.ready<=world.time;s.ball.style.display=visible?'':'none';s.trail.style.display=visible?'':'none';
       s.ball.setAttribute('cx',b.x);s.ball.setAttribute('cy',b.y);
       s.history.push({x:b.x,y:b.y,time:world.time});s.history=s.history.filter(p=>world.time-p.time<.09);
       s.trail.setAttribute('d',s.history.map((p,j)=>(j?'L':'M')+p.x+' '+p.y).join(' '));
     });
     bumpers.forEach((b,i)=>{
       const age=world.time-flashes[i],active=flashes[i]>0&&age<.32;
       const bumper=bumperNodes[i],impact=impactNodes[i];
       bumper.style.transform=active?'scale('+(1+.07*Math.sin(age/.32*Math.PI))+')':'';
       impact.style.opacity=active?String(1-age/.32):'0';impact.style.transform=active?'scale('+(1+age*2)+')':'';
     });
     hits.textContent=String(world.hits).padStart(5,'0');status.textContent=input.auto?'自动演示 · ← → 挡板 / 空格发球':'手动控制 · ← → 挡板 / 空格发球';
   }
   world.flippers.forEach((f,i)=>{const x=f.x+195*Math.cos(f.angle),y=f.y+195*Math.sin(f.angle);paddles[i].setAttribute('d',`M${f.x} ${f.y}L${x} ${y}`);paddles[i].setAttribute('stroke-width',28);paddles[i].setAttribute('stroke-linecap','round');});
   requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}catch(error){status.textContent='交互加载失败，请刷新重试';status.classList.add('error');}
