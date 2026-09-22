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
defs, holes, tiles, styles = [], [], [], []
for i, (cx, cy, width, height) in enumerate(regions):
    rect = f'<rect x="{cx-width/2}" y="{cy-height/2}" width="{width}" height="{height}"/>'
    defs.append(f'<clipPath id="tile-{i}">{rect}</clipPath>')
    holes.append(rect)
    # Three rows counterflow, then relay a wave left-to-right before docking.
    lane = 0 if i < 7 else 1 if i < 15 else 2
    direction = -1 if lane == 1 else 1
    shift = direction * (38 + i % 3 * 12)
    lift = 14 + i % 4 * 4
    delay = -round(cx / 1983 * 1.15 + lane * .22, 2)
    styles.append(f"""
    .piece-{i}{{transform-origin:{cx}px {cy}px;animation:sequence-{i} 16s {delay}s cubic-bezier(.4,0,.2,1) infinite}}
    @keyframes sequence-{i}{{
      0%,8%,100%{{transform:translate(0,0);opacity:1}}
      18%{{transform:translate({shift}px,0);opacity:1}}
      25%{{transform:translate({shift}px,{-lift}px);opacity:1}}
      33%,39%{{transform:translate(0,0);opacity:1}}
      47%{{transform:translate(0,{-lift*1.7}px) scale(1.08);opacity:1}}
      54%,60%{{transform:translate(0,0) scale(1);opacity:1}}
      64%{{transform:translate({-direction*18}px,0);opacity:.65}}
      68%,73%{{transform:translate(0,0);opacity:1}}
      82%{{transform:translate({-shift*.5}px,{lift*.5}px) rotate({direction*5}deg);opacity:.85}}
      91%{{transform:translate(0,0) rotate(0deg);opacity:1}}
    }}""")
    tiles.append(f'<g class="reactive" data-index="{i}" data-x="{cx}" data-y="{cy}"><g class="piece piece-{i}"><g clip-path="url(#tile-{i})"><use href="#artwork"/></g></g></g>')
svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1983" height="793" viewBox="0 0 1983 793" role="img" aria-labelledby="title desc">
<title id="title">Technology in motion</title><desc id="desc">Technology symbols counterflow in lanes, relay a wave, shift and dock in a sixteen-second sequence.</desc>
<defs><image id="artwork" width="1983" height="793" href="data:image/png;base64,{image}"/>
{''.join(defs)}
<mask id="background"><rect width="1983" height="793" fill="white"/><g fill="black">{''.join(holes)}</g></mask>
<linearGradient id="trail"><stop stop-color="#8aff00" stop-opacity="0"/><stop offset=".5" stop-color="#8aff00"/><stop offset="1" stop-color="#8aff00" stop-opacity="0"/></linearGradient></defs>
<style>{''.join(styles)}
.rail{{stroke-dasharray:3 14 3 14 90 850;animation:travel 7s linear infinite}}
.reverse{{animation-direction:reverse;animation-duration:9s}}
.packet{{stroke-dasharray:4 10 18 1700;animation:travel 6s linear infinite}}
.echo{{fill:none;stroke:#a3ff51;stroke-width:1;animation:echo 16s ease-out infinite;opacity:0}}
@keyframes echo{{0%,40%,58%,100%{{transform:scale(.85);opacity:0}}44%{{transform:scale(.9);opacity:.65}}54%{{transform:scale(1.35);opacity:0}}}}
.reactive{{transition:transform .55s cubic-bezier(.2,.8,.2,1)}}
.paused *{{animation-play-state:paused!important}}
@keyframes travel{{to{{stroke-dashoffset:-1960}}}}
@media(prefers-reduced-motion:reduce){{.piece{{animation:none;opacity:1}}.rail,.packet,.echo{{animation:none}}.reactive{{transition:none}}}}
</style>
<rect width="1983" height="793" fill="#000"/>
<use href="#artwork" mask="url(#background)" opacity=".7"/>
<g fill="none" stroke="url(#trail)" stroke-width="2" opacity=".65">
<path class="rail" d="M100 218H580V358H1120V218H1860"/>
<path class="rail reverse" d="M140 518H620V650H1280V518H1850"/>
<path class="rail" d="M280 402H920V370H1750"/>
</g>
<g fill="none" stroke="#a3ff51" stroke-width="3" opacity=".8">
<path class="packet" d="M120 265H520L580 325H980L1060 245H1770"/>
<path class="packet reverse" d="M230 580H620L700 660H1430L1500 590H1820"/>
</g>
{''.join(tiles)}
{''.join(f'<rect class="echo" x="{x-52}" y="{y-52}" width="104" height="104" rx="2" style="transform-origin:{x}px {y}px;animation-delay:{-round(x/1983*1.15+(0 if i<7 else 1 if i<15 else 2)*.22,2)}s"/>' for i,(x,y,w,h) in enumerate(regions) if i%3==1)}
</svg>"""
(ROOT / "assets/tech-motion-v4.svg").write_text(svg)
