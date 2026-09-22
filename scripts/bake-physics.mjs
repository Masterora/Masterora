// GitHub README cannot execute JS: render a short replay from the same simulator.
import {readFileSync,writeFileSync} from 'node:fs';
import {World,STEP} from '../physics.mjs';
const w=new World(),duration=24,frames=[[],[],[]],flips=[[],[]],events=Array.from({length:19},()=>[]);
for(let step=0;step<=duration/STEP;step++){
 const percent=(step*STEP/duration*100).toFixed(5);
 if(step%8===0){
  w.balls.forEach((b,i)=>frames[i].push(`${percent}%{transform:translate(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px);opacity:${b.ready>w.time||step===0||step>=duration/STEP-8?0:1}}`));
  w.flippers.forEach((f,i)=>flips[i].push(`${percent}%{transform:rotate(${((f.angle-f.rest)*180/Math.PI).toFixed(2)}deg)}`));
 }
 w.step();for(const e of w.events){const list=events[e.index];if(!list.length||w.time-list.at(-1)>.4)list.push(w.time);}
}
let css=frames.map((f,i)=>`@keyframes ball${i}{${f.join('')}}`).join('');
css+=flips.map((f,i)=>`.flipper-${i?'right':'left'}{animation:physicalFlip${i} 24s linear infinite}@keyframes physicalFlip${i}{${f.join('')}}`).join('');
events.forEach((times,i)=>{
 const kick=['0%,100%{transform:scale(1)}'],burst=['0%,100%{opacity:0;transform:scale(1)}'];
 for(const t of times){if(t+.33>=duration)continue;const pc=offset=>((t+offset)/duration*100).toFixed(5);
 kick.push(`${pc(-.01)}%{transform:scale(1)}${pc(.08)}%{transform:scale(1.07)}${pc(.32)}%{transform:scale(1)}`);
 burst.push(`${pc(-.01)}%{opacity:0;transform:scale(1)}${pc(0)}%{opacity:1;transform:scale(1)}${pc(.32)}%{opacity:0;transform:scale(1.64)}`);
 }
 css+=`.bumper-${i}{animation:physicalKick${i} 24s linear infinite}.impact-${i}{animation:physicalBurst${i} 24s linear infinite}@keyframes physicalKick${i}{${kick.join('')}}@keyframes physicalBurst${i}{${burst.join('')}}`;
});
css+='@media(prefers-reduced-motion:reduce){*{animation:none!important}.impact{opacity:0}.moving-ball{display:none}}';
let svg=readFileSync(new URL('../assets/tech-pinball-v1.svg',import.meta.url),'utf8');
svg=svg.replace('</style>',css+'</style>').replace(/animation:ball(\d) (\d+)s (-?[\d.]+)s/g,(_,i,d,delay)=>`animation:ball${i} 24s ${(-24+Number(delay)+Number(d)).toFixed(3)}s`);
svg=svg.replace('M1310 700H1700V595','M1275 700H1615L1800 585').replace('M1310 720H1725V595','M1275 720H1625L1820 597');
svg=svg.replace('Three green pinballs ricochet between nineteen technology bumpers, triggering synchronized kicks, rings and pixel sparks.','A physics-simulated replay with gravity, bumper impacts and moving flippers. Open the interactive page to play.');
writeFileSync(new URL('../assets/tech-pinball-v2.svg',import.meta.url),svg);
console.log(`Baked ${duration}s, ${w.hits} hits, ${Math.round(svg.length/1024)} KiB`);
