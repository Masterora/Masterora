import './build-neon-scene.mjs';
import {Scoreboard} from '../scoring.mjs';
// GitHub README cannot execute JS: render a short replay from the same simulator.
import {readFileSync,writeFileSync} from 'node:fs';
import {World,STEP,slings} from '../physics.mjs';
const score=new Scoreboard(),scoreFrames=[],explosions=[];
const w=new World(),duration=24,frames=[[],[],[]],flips=[[],[]],events=Array.from({length:21},()=>[]);
for(let step=0;step<=duration/STEP;step++){
 const percent=(step*STEP/duration*100).toFixed(5);
 if(step%4===0){
  w.balls.forEach((b,i)=>frames[i].push(`${percent}%{transform:translate(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px);opacity:${b.ready>w.time||step===0||step>=duration/STEP-4?0:1}}`));
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
 kick.push(`${pc(-.01)}%{transform:scale(1)}${pc(.08)}%{transform:scale(1.22)}${pc(.32)}%{transform:scale(1)}`);
 burst.push(`${pc(-.01)}%{opacity:0;transform:scale(1)}${pc(0)}%{opacity:1;transform:scale(1)}${pc(.32)}%{opacity:0;transform:scale(2.2)}`);
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
 overlays+=`<g class="replay-score replay-score-${i}" font-family="monospace" fill="#c5dbe6"><text x="708" y="56" font-size="13" letter-spacing="3">MASTERORA</text><text x="840" y="62" font-size="28">${String(f.total).padStart(8,'0')}</text><text x="1035" y="55" font-size="13">COMBO ${f.combo}</text><rect x="1165" y="32" width="57" height="34" rx="6" fill="#a6f64e"/><text x="1177" y="56" font-size="23" fill="#14261d">×${f.multiplier}</text><circle cx="1260" cy="48" r="15" fill="#1f3440"/><path d="M1256 41v14m8-14v14" stroke="#c2dce6" stroke-width="3"/></g>`;
});
explosions.forEach((e,i)=>{
 const start=(e.time/duration*100).toFixed(5),end=((e.time+.65)/duration*100).toFixed(5);
 css+=`.replay-burst-${i}{opacity:0;transform-origin:${e.x}px ${e.y}px;animation:bigBurst${i} 24s linear infinite}@keyframes bigBurst${i}{0%,${(Number(start)-.001).toFixed(5)}%,100%{opacity:0;transform:scale(.4)}${start}%{opacity:1;transform:scale(.4)}${end}%{opacity:0;transform:scale(3.8)}}`;
 const rays=Array.from({length:24},(_,k)=>{const a=k*Math.PI/12;return `<path d="M${e.x+Math.cos(a)*50} ${e.y+Math.sin(a)*50}l${Math.cos(a)*25} ${Math.sin(a)*25}"/>`;}).join('');
 overlays+=`<g class="replay-burst replay-burst-${i}" fill="none" stroke="#e1ffb3" stroke-width="3"><circle cx="${e.x}" cy="${e.y}" r="55"/><circle cx="${e.x}" cy="${e.y}" r="75" stroke-width="1"/>${rays}</g>`;
});
css+='@media(prefers-reduced-motion:reduce){*{animation:none!important}.impact,.sling-effect,.replay-burst{opacity:0}.replay-score-0{opacity:1}.moving-ball{display:none}}';
let svg=readFileSync(new URL('../assets/neon-scene.svg',import.meta.url),'utf8');
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
writeFileSync(new URL('../assets/neon-replay.svg' ,import.meta.url),svg);
console.log(`Baked ${duration}s, ${w.hits} hits, ${Math.round(svg.length/1024)} KiB`);
