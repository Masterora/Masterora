import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync(new URL('../assets/arcade-replay.svg',import.meta.url),'utf8');
writeFileSync(new URL('../assets/arcade-replay-light.svg',import.meta.url),source.replace('<svg ', '<svg class="light" '));
