"""Build self-contained README motion from the approved artwork."""
from pathlib import Path
import base64

ROOT = Path(__file__).resolve().parents[1]
image = base64.b64encode((ROOT / "assets/tech-field.png").read_bytes()).decode()
# Independent regions: symbols move, rather than flashing pixels over a still.
regions = [
    (230, 250, 145, 108), (420, 295, 140, 132),
    (650, 312, 132, 132), (865, 307, 140, 135),
    (1280, 302, 150, 124), (1470, 307, 142, 140),
    (1670, 328, 140, 130), (333, 445, 132, 138),
    (552, 463, 142, 130), (750, 456, 120, 140),
    (960, 465, 136, 126), (1170, 460, 120, 145),
    (1380, 455, 152, 120), (1580, 465, 125, 140),
    (1750, 475, 142, 138), (720, 598, 142, 136),
    (950, 595, 140, 125), (1200, 600, 140, 140),
    (1590, 610, 145, 138),
]
# A shared timeline drives balls, bumper kicks and impact debris.
import math
positions = [(270+i*232, 215) for i in range(7)] + [(370+i*216, 385) for i in range(7)] + [(490+i*250, 550) for i in range(5)]
routes = [[0,8,2,10,4,12,6], [7,1,9,3,11,5,13], [14,16,15,18,17]]
styles, balls, tiles, defs, impacts = [], [], [], [], []
hits = {}
for lane, route in enumerate(routes):
    duration = 12 + lane * 2
    points = [(1850,675),(1850,110),(1630,95)]
    for idx in route:
        x,y=positions[idx]
        points.append((x,y+69))
    points += [(1040 if lane%2 else 780,695),(170,640),(110,110),(1850,110),(1850,675)]
    frames = []
    for j,(x,y) in enumerate(points):
        time=j/(len(points)-1)*100
        frames.append(f'{time:.5f}%{{transform:translate({x}px,{y}px)}}')
        if 3 <= j < 3+len(route):
            hits.setdefault(route[j-3],(time,duration))
    styles.append(f'@keyframes ball{lane}{{{"".join(frames)}}}')
    for tail in range(6, -1, -1):
        opacity = 1 if tail==0 else .2*(1-tail/7)
        radius = 11 if tail==0 else 10-tail
        fill = 'url(#steel)' if tail == 0 else '#a5ff35'
        halo = '<circle r="19" fill="none" stroke="#a5ff35" stroke-opacity=".2"/>' if tail == 0 else ''
        balls.append(f'<g class="moving-ball" style="animation:ball{lane} {duration}s {-duration+tail*.028}s linear infinite"><circle r="{radius}" fill="{fill}" opacity="{opacity}"/>{halo}</g>')

for i,((cx,cy,w,h),(x,y)) in enumerate(zip(regions,positions)):
    defs.append(f'<clipPath id="tile-{i}"><rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}"/></clipPath>')
    t,duration=hits[i]
    styles.append(f"""
    .bumper-{i}{{transform-origin:{x}px {y}px;animation:kick{i} {duration}s linear infinite}}
    .impact-{i}{{transform-origin:{x}px {y}px;animation:burst{i} {duration}s ease-out infinite;opacity:0}}
    @keyframes kick{i}{{0%,{t-.1:.5f}%,{t+6:.5f}%,100%{{transform:translate(0,0) scale(1)}}{t+1.1:.5f}%{{transform:translate(0,-15px) scale(1.18)}}{t+3.3:.5f}%{{transform:translate(0,5px) scale(.95)}}}}
    @keyframes burst{i}{{0%,{t-.1:.5f}%,{t+6:.5f}%,100%{{opacity:0;transform:scale(.85)}}{t+.2:.5f}%{{opacity:1;transform:scale(1)}}{t+5.9:.5f}%{{opacity:0;transform:scale(1.85)}}}}
    """)
    tiles.append(f'<g class="bumper bumper-{i}"><circle cx="{x}" cy="{y}" r="58" fill="#080c09" stroke="#344532" stroke-width="2"/><circle cx="{x}" cy="{y}" r="64" fill="none" stroke="#7daa4c" stroke-opacity=".4" stroke-dasharray="16 84"/><g transform="translate({x},{y}) scale(.63) translate({-cx},{-cy})"><g clip-path="url(#tile-{i})"><use href="#artwork"/></g></g></g>')
    sparks=''.join(f'<rect x="{x+math.cos(k*math.pi/4)*77-3:.2f}" y="{y+math.sin(k*math.pi/4)*77-3:.2f}" width="{9 if k%2 else 5}" height="5" fill="#b6ff55"/>' for k in range(8))
    impacts.append(f'<g class="impact impact-{i}"><circle cx="{x}" cy="{y}" r="66" fill="none" stroke="#b6ff55" stroke-width="3"/>{sparks}</g>')
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1983" height="793" viewBox="0 0 1983 793" role="img" aria-labelledby="title desc">
<title id="title">Technology pinball</title><desc id="desc">Three green pinballs ricochet between nineteen technology bumpers, triggering synchronized kicks, rings and pixel sparks.</desc>
<defs><image id="artwork" width="1983" height="793" href="data:image/png;base64,{image}"/>{''.join(defs)}
<radialGradient id="steel" cx=".3" cy=".25"><stop stop-color="#fff"/><stop offset=".25" stop-color="#d7ff9d"/><stop offset=".65" stop-color="#9aff2b"/><stop offset="1" stop-color="#315b0c"/></radialGradient>
<linearGradient id="rail"><stop stop-color="#283c23"/><stop offset=".45" stop-color="#a5ff35"/><stop offset="1" stop-color="#283c23"/></linearGradient>
<pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#20311c"/></pattern></defs>
<style>
{''.join(styles)}
.lane-light{{stroke-dasharray:55 1300;animation:railflow 3s linear infinite}}
@keyframes railflow{{to{{stroke-dashoffset:-1355}}}}
.flipper-left{{transform-origin:700px 705px;animation:flipleft 2.4s ease-in-out infinite}}
.flipper-right{{transform-origin:1240px 705px;animation:flipright 3.2s .4s ease-in-out infinite}}
@keyframes flipleft{{0%,40%,65%,100%{{transform:rotate(0)}}48%,54%{{transform:rotate(-28deg)}}}}
@keyframes flipright{{0%,40%,65%,100%{{transform:rotate(0)}}48%,54%{{transform:rotate(28deg)}}}}
.kicker{{animation:kicker 1.5s ease-in-out infinite;transform-origin:1850px 685px}}
@keyframes kicker{{0%,70%,100%{{transform:scaleY(1)}}85%{{transform:scaleY(.55)}}}}
.launch .flipper-left{{transform:rotate(-28deg);animation:none}}.launch .flipper-right{{transform:rotate(28deg);animation:none}}
.paused *{{animation-play-state:paused!important}}
@media(prefers-reduced-motion:reduce){{*{{animation:none!important}}.impact{{opacity:0}}.moving-ball{{display:none}}}}
</style>
<rect width="1983" height="793" fill="#030503"/>

<rect x="78" y="58" width="1827" height="685" rx="48" fill="url(#grid)" stroke="#273322" stroke-width="2"/>
<g fill="none" stroke="url(#rail)" stroke-width="4" stroke-linejoin="round">
<path d="M1800 690V142Q1800 105 1760 105H190Q130 105 130 165V585L315 700H630M1310 700H1700V595"/>
<path d="M1820 710V130Q1820 83 1770 83H175Q108 83 108 157V597L304 720H630M1310 720H1725V595"/>
<path d="M1840 720V155Q1840 65 1740 65" stroke="#526945"/>
<path d="M1865 720V155Q1865 45 1740 45" stroke="#526945"/>
</g>
<g fill="none" stroke="#b4ff51" stroke-width="5"><path class="lane-light" d="M130 165V585L315 700H630"/><path class="lane-light" d="M1800 690V142Q1800 105 1760 105H190"/></g>
<g fill="#a7ef45" opacity=".7">{''.join(f'<rect x="{220+i*38}" y="130" width="20" height="4"/>' for i in range(38))}</g>
<g fill="#111b0d" stroke="#739b43" stroke-width="2"><path d="M190 530L330 650H250L185 590Z"/><path d="M1640 650L1770 530V590L1700 650Z"/></g>
{''.join(tiles)}
<g fill="#a6ff36" stroke="#dbffb0" stroke-width="2"><path class="flipper-left" d="M700 689Q675 705 700 721L883 737Q910 732 893 712Z"/><path class="flipper-right" d="M1240 689Q1265 705 1240 721L1057 737Q1030 732 1047 712Z"/></g>
<g fill="#182b0b" stroke="#a6ff36" stroke-width="3"><circle cx="700" cy="705" r="12"/><circle cx="1240" cy="705" r="12"/></g>
<path class="kicker" d="M1837 720H1863L1837 710L1863 700L1837 690L1863 680H1837" fill="none" stroke="#a6ff36" stroke-width="3"/>
{''.join(impacts)}{''.join(balls)}
</svg>'''
(ROOT / "assets/tech-pinball-v1.svg").write_text(svg)
