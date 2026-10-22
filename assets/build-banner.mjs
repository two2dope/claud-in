// Gera assets/banner.svg: wordmark em pixel-art e o Claudin na pose idle, com a mesma grade 16x12 de hooks/register.tsx.
// Uso: node assets/build-banner.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const CORAL = '#D97757'
const INK = '#1a1a1a'
const PAPER = '#f5f4ed'
const W = 1280
const H = 400

const rect = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`

const GLYPHS = {
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  N: ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#..##', '#...#'],
}

const PX = 12
const GAP = PX
const WORD = 'CLAUDIN'
const wordX = 72
const wordY = 118
let cursor = wordX
let letters = ''
for (const ch of WORD) {
  GLYPHS[ch].forEach((row, r) => {
    for (let c = 0; c < 5; c++) if (row[c] === '#') letters += rect(cursor + c * PX, wordY + r * PX, PX, PX, PAPER)
  })
  cursor += 5 * PX + GAP
}
// Cursor de terminal logo depois da última letra.
const caret = `<rect x="${cursor}" y="${wordY + 5 * PX}" width="${PX * 3}" height="${PX * 2}" fill="${CORAL}"><animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite"/></rect>`

// Claudin idle: corpo, antenas, braços, pernas e olhos olhando para a frente.
const S = 16
const mx = 872
const my = 128
const g = (x, y, w, h, f = CORAL) => rect(x, y, w, h, f)
const body = g(3, 3, 10, 5) + g(2, 4, 12, 3)
const antennae = g(4, 1, 1, 1) + g(4, 2, 1, 1) + g(11, 1, 1, 1) + g(11, 2, 1, 1)
const legs = [3, 5, 10, 12].map(x => g(x, 8, 1, 2)).join('')
const arms = g(0, 5, 2, 1) + g(14, 5, 2, 1)
const eyes = [5, 10]
  .map(
    ex =>
      `<rect x="${ex}" y="4" width="2" height="2" fill="${PAPER}"><animate attributeName="height" values="2;2;2;.3;2" dur="4s" repeatCount="indefinite"/></rect>` +
      `<rect x="${ex + 0.5}" y="4.5" width="1" height="1" fill="${INK}"><animate attributeName="height" values="1;1;1;.2;1" dur="4s" repeatCount="indefinite"/></rect>`,
  )
  .join('')
const mascot = `<g transform="translate(${mx} ${my}) scale(${S})" shape-rendering="crispEdges">${antennae}${body}${arms}${legs}${eyes}</g>`

// Balão de fala com a fala de abertura do próprio Claudin.
const bx = 840
const by = 40
const bw = 328
const bh = 56
const bubble =
  `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#1f1f1f" stroke="${PAPER}" stroke-width="4"/>` +
  rect(mx + 7 * S, by + bh - 2, 2 * S, 4, '#1f1f1f') +
  rect(mx + 7 * S, by + bh + 2, 2 * S, S, '#1f1f1f') +
  rect(mx + 7 * S, by + bh + 2, 4, S, PAPER) +
  rect(mx + 9 * S - 4, by + bh + 2, 4, S, PAPER) +
  rect(mx + 7 * S, by + bh + S + 2, 2 * S, 4, PAPER) +
  `<text x="${bx + 24}" y="${by + 36}" font-family="ui-monospace, SFMono-Regular, Consolas, Menlo, monospace" font-size="22" fill="${PAPER}">Online. Monitorando.</text>`

const ground = rect(780, 288, 460, 4, '#3a3a3a')

const mono = 'ui-monospace, SFMono-Regular, Consolas, Menlo, monospace'
const tagline =
  `<text x="${wordX}" y="270" font-family="${mono}" font-size="26" fill="#cfcdc3">O mascote que mora acima do prompt do Claude Code.</text>` +
  `<text x="${wordX}" y="306" font-family="${mono}" font-size="20" fill="#8f8d84">Reage a cada ferramenta, avisa quando algo falha e guarda seus prazos.</text>`

const brackets = [
  [24, 24, 1, 1],
  [W - 24, 24, -1, 1],
  [24, H - 24, 1, -1],
  [W - 24, H - 24, -1, -1],
]
  .map(([x, y, dx, dy]) => `<path d="M${x} ${y + dy * 28} V${y} H${x + dx * 28}" fill="none" stroke="#3a3a3a" stroke-width="3"/>`)
  .join('')

const footer = `<text x="${W - 56}" y="${H - 40}" text-anchor="end" font-family="${mono}" font-size="16" fill="#6f6d65">© 2026 two2Dope</text>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
<title id="t">Claudin</title>
<desc id="d">Banner do Claudin: o nome em pixel-art ao lado de um mascote coral que diz "Online. Monitorando."</desc>
<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><rect x="11" y="11" width="2" height="2" fill="#262626"/></pattern></defs>
<rect width="${W}" height="${H}" fill="#161616"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>
${brackets}
<g shape-rendering="crispEdges">${letters}${caret}</g>
${tagline}
${ground}
${bubble}
${mascot}
${footer}
</svg>
`

const out = join(dirname(fileURLToPath(import.meta.url)), 'banner.svg')
writeFileSync(out, svg)
console.log('ok', out)
