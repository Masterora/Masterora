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
    dx = round((cx-990)*.18)
    dy = (-1 if i%2 else 1)*(65+i%4*20)
    delay = -(i%7)*.15
    styles.append(f"""
    .piece-{i}{{animation:assemble-{i} 9s {delay}s cubic-bezier(.22,.68,.2,1) infinite}}
    @keyframes assemble-{i}{{
      0%,100%{{transform:translate({dx}px,{dy}px);opacity:0}}
      16%,30%{{transform:translate(0,0);opacity:1}}
      43%{{transform:translate({-10 if i%2 else 10}px,{-12 if i%3 else 12}px);opacity:1}}
      57%,65%{{transform:translate(0,0);opacity:1}}
      71%{{transform:translate({28 if i%2 else -28}px,0);opacity:.8}}
      75%{{transform:translate(0,0);opacity:1}}
      88%{{transform:translate({-dx}px,{-dy}px);opacity:.2}}
    }}""")
    tiles.append(f'<g class="reactive" data-index="{i}"><g class="piece piece-{i}"><g clip-path="url(#tile-{i})"><use href="#artwork"/></g></g></g>')
svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1983" height="793" viewBox="0 0 1983 793" role="img" aria-labelledby="title desc">
<title id="title">Technology in motion</title><desc id="desc">Technology symbols assemble, drift, scatter and reform in a nine-second cycle.</desc>
<defs><image id="artwork" width="1983" height="793" href="data:image/png;base64,{image}"/>
{''.join(defs)}
<mask id="background"><rect width="1983" height="793" fill="white"/><g fill="black">{''.join(holes)}</g></mask>
<linearGradient id="trail"><stop stop-color="#8aff00" stop-opacity="0"/><stop offset=".5" stop-color="#8aff00"/><stop offset="1" stop-color="#8aff00" stop-opacity="0"/></linearGradient></defs>
<style>{''.join(styles)}
.rail{{stroke-dasharray:80 900;animation:travel 4s linear infinite}}
.reverse{{animation-direction:reverse;animation-duration:5.5s}}
.reactive{{transition:transform .55s cubic-bezier(.2,.8,.2,1)}}
.paused *{{animation-play-state:paused!important}}
@keyframes travel{{to{{stroke-dashoffset:-1960}}}}
@media(prefers-reduced-motion:reduce){{.piece{{animation:none;opacity:1}}.rail{{animation:none}}.reactive{{transition:none}}}}
</style>
<rect width="1983" height="793" fill="#000"/>
<use href="#artwork" mask="url(#background)" opacity=".7"/>
<g fill="none" stroke="url(#trail)" stroke-width="2" opacity=".65">
<path class="rail" d="M100 218H580V358H1120V218H1860"/>
<path class="rail reverse" d="M140 518H620V650H1280V518H1850"/>
<path class="rail" d="M280 402H920V370H1750"/>
</g>
{''.join(tiles)}
</svg>"""
(ROOT / "assets/tech-motion-v3.svg").write_text(svg)
