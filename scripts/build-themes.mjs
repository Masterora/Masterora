// Keep one animated scene; apply a light palette to its complete rendered surface.
import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync(new URL('../assets/tech-pinball-v5.svg',import.meta.url),'utf8');
const filter='<filter id="light-palette" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="table" tableValues="1 0"/><feFuncG type="table" tableValues="1 0"/><feFuncB type="table" tableValues="1 0"/></feComponentTransfer><feColorMatrix type="hueRotate" values="180"/></filter>';
const colored=source.replaceAll('class="tech-icon"','class="tech-icon" filter="url(#light-palette)"');
const light=colored.replace('</defs>',filter+'</defs>').replace('</style>','</style><g filter="url(#light-palette)">').replace('</svg>','</g></svg>').replace('fill="#030503"','fill="#000000"');
writeFileSync(new URL('../assets/tech-pinball-light-v2.svg',import.meta.url),light);
