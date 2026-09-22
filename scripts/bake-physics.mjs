import {Scoreboard} from '../scoring.mjs';
// GitHub README cannot execute JS: render a short replay from the same simulator.
import {readFileSync,writeFileSync} from 'node:fs';
import {World,STEP,slings} from '../physics.mjs';
const score=new Scoreboard(),scoreFrames=[],explosions=[];
const w=new World(),duration=24,frames=[[],[],[]],flips=[[],[]],events=Array.from({length:21},()=>[]);
for(let step=0;step<=duration/STEP;step++){
 const percent=(step*STEP/duration*100).toFixed(5);
 if(step%8===0){
  w.balls.forEach((b,i)=>frames[i].push(`${percent}%{transform:translate(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px);opacity:${b.ready>w.time||step===0||step>=duration/STEP-8?0:1}}`));
  w.flippers.forEach((f,i)=>flips[i].push(`${percent}%{transform:rotate(${((f.angle-f.rest)*180/Math.PI).toFixed(2)}deg)}`));
 }
 if(step%60===0&&step<duration/STEP){score.expire(w.time);scoreFrames.push({time:w.time,total:score.total,combo:score.combo,multiplier:score.multiplier});}
 w.step();for(const e of w.events){const award=score.hit(e,w.time);if(award.burst&&w.time<duration-.7)explosions.push({...e,time:w.time});const list=events[e.index];if(!list.length||w.time-list.at(-1)>.4)list.push(w.time);}
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
slings.forEach((polygon,i)=>{
 const index=19+i;
 css+=`.sling-effect-${i}{animation:physicalBurst${index} 24s linear infinite;transform-origin:${i?1710:245}px 610px;opacity:0}`;
});
let overlays='';
scoreFrames.forEach((f,i)=>{
 const start=(f.time/duration*100).toFixed(5),end=((f.time+.25)/duration*100).toFixed(5);
 css+=`.replay-score-${i}{opacity:0;animation:scoreFrame${i} 24s steps(1,end) infinite}@keyframes scoreFrame${i}{0%,100%{opacity:0}${start}%{opacity:1}${end}%{opacity:0}}`;
 overlays+=`<g class="replay-score replay-score-${i}" fill="#c4ff7b" font-family="monospace" font-size="22"><text x="135" y="33">SCORE  ${String(f.total).padStart(8,'0')}</text><text x="835" y="33">COMBO  ${f.combo}</text><text x="1510" y="33">MULTI  ×${f.multiplier}</text></g>`;
});
explosions.forEach((e,i)=>{
 const start=(e.time/duration*100).toFixed(5),end=((e.time+.65)/duration*100).toFixed(5);
 css+=`.replay-burst-${i}{opacity:0;transform-origin:${e.x}px ${e.y}px;animation:bigBurst${i} 24s linear infinite}@keyframes bigBurst${i}{0%,${(Number(start)-.001).toFixed(5)}%,100%{opacity:0;transform:scale(.4)}${start}%{opacity:1;transform:scale(.4)}${end}%{opacity:0;transform:scale(2.5)}}`;
 const rays=Array.from({length:24},(_,k)=>{const a=k*Math.PI/12;return `<path d="M${e.x+Math.cos(a)*50} ${e.y+Math.sin(a)*50}l${Math.cos(a)*25} ${Math.sin(a)*25}"/>`;}).join('');
 overlays+=`<g class="replay-burst replay-burst-${i}" fill="none" stroke="#e1ffb3" stroke-width="3"><circle cx="${e.x}" cy="${e.y}" r="55"/><circle cx="${e.x}" cy="${e.y}" r="75" stroke-width="1"/>${rays}</g>`;
});
css+='@media(prefers-reduced-motion:reduce){*{animation:none!important}.impact,.sling-effect,.replay-burst{opacity:0}.replay-score-0{opacity:1}.moving-ball{display:none}}';
let svg=readFileSync(new URL('../assets/tech-pinball-v1.svg',import.meta.url),'utf8');
svg=svg.replace('</style>',css+'</style>').replace(/animation:ball(\d) (\d+)s (-?[\d.]+)s/g,(_,i,d,delay)=>`animation:ball${i} 24s ${(-24+Number(delay)+Number(d)).toFixed(3)}s`);
svg=svg.replace('M1310 700H1700V595','M1275 700H1615L1800 585').replace('M1310 720H1725V595','M1275 720H1625L1820 597');
svg=svg.replace('Three green pinballs ricochet between nineteen technology bumpers, triggering synchronized kicks, rings and pixel sparks.','A physics-simulated replay with gravity, bumper impacts and moving flippers. Open the interactive page to play.');
const slingEffects=slings.map((polygon,i)=>{
 const cx=i?1710:245,cy=610;
 const path=polygon.map((p,j)=>(j?'L':'M')+p.join(' ')).join(' ')+'Z';
 const rays=Array.from({length:10},(_,k)=>{const a=k*Math.PI/5;return `<path d="M${cx+Math.cos(a)*65} ${cy+Math.sin(a)*65}l${Math.cos(a)*24} ${Math.sin(a)*24}"/>`;}).join('');
 return `<g class="sling-effect sling-effect-${i}" fill="none" stroke="#d4ff91" stroke-width="4"><path d="${path}" fill="#9aff36" fill-opacity=".4"/><circle cx="${cx}" cy="${cy}" r="60" stroke-width="2"/>${rays}</g>`;
}).join('');
svg=svg.replace('</svg>',slingEffects+overlays+'</svg>');
writeFileSync(new URL('../assets/tech-pinball-v4.svg' ,import.meta.url),svg);
console.log(`Baked ${duration}s, ${w.hits} hits, ${Math.round(svg.length/1024)} KiB`);
