// Gera assets/banner.svg: "Caranguejos com cérebro". Wordmark em pixel-art, o Claudin andando de lado com um cérebro
// nas antenas e uma parabólica enfiada na lama transmitindo sinal psicodélico (imagem-símbolo do manifesto Mangue).
// O desenho do Claudin é o mesmo de hooks/register.tsx, via assets/build-assets.mjs.
// Uso: node assets/build-banner.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { sprite, rect, text, CORAL, PAPER, DIM, SOFT, LINE, MONO } from './build-assets.mjs'

const W = 1280
const H = 400
const PSY = ['#ff4fa3', '#8a5cff', '#35e0ff', '#b6ff3c', '#ffb02e']
const cycle = (from = 0) => [...PSY.slice(from), ...PSY.slice(0, from), PSY[from]].join(';')

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
let cur = 72
let letters = ''
for (const ch of 'CLAUDIN') {
  GLYPHS[ch].forEach((row, r) => {
    for (let c = 0; c < 5; c++) if (row[c] === '#') letters += rect(cur + c * PX, 96 + r * PX, PX, PX, PAPER)
  })
  cur += 5 * PX + PX
}
const caret = `<rect x="${cur}" y="${96 + 5 * PX}" width="${PX * 3}" height="${PX * 2}" fill="${CORAL}"><animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite"/></rect>`

const titulo =
  `<text x="72" y="232" font-family="${MONO}" font-size="31" fill="${PAPER}">Caranguejos com cérebro.</text>` +
  `<text x="72" y="270" font-family="${MONO}" font-size="21" fill="${SOFT}">Mil abas abertas não são bagunça. São caminho.</text>`

// ---- Claudin andando de lado, com rastro de imagens para trás ----
const CX = 940
const CY = 196
const S = 14
const crab = (dx, op) =>
  `<g transform="translate(${CX + dx} ${CY}) scale(${S})" shape-rendering="crispEdges" opacity="${op}">${sprite('run', 'normal', 'right')}</g>`
const ghosts = crab(-92, 0.07) + crab(-46, 0.15)
const feet = [830, 858, 886].map((x, i) => rect(x, 354 - (i % 2) * 0, 8, 4, '#4a3f36')).join('')

// ---- Cérebro: duas metades, giros, brilho psicodélico e pulsos de sinapse ----
const hemi = [
  [-48, -22, 40],
  [-70, 2, 34],
  [-52, 26, 34],
  [-24, 4, 44],
]
const circles = side => hemi.map(([x, y, r]) => `<circle cx="${side * x}" cy="${y}" r="${r}"/>`).join('')
const folds = [
  'M-96 -12 C-84 -34 -64 -4 -50 -26 S-24 -42 -12 -50',
  'M-100 10 C-86 -8 -72 24 -58 6 S-32 -6 -16 -18',
  'M-90 32 C-74 14 -60 46 -46 26 S-24 26 -10 8',
  'M-68 46 C-58 34 -42 52 -30 40 S-14 38 -8 26',
  'M-74 -42 C-62 -26 -46 -46 -34 -30 S-20 -20 -12 -30',
  'M-42 6 C-36 -6 -26 10 -18 -2',
  'M-84 -2 C-80 6 -72 -6 -66 2',
  'M-30 30 C-24 22 -18 34 -12 24',
]
const foldPaths = side => folds.map(d => `<path d="${d}" transform="scale(${side} 1)"/>`).join('')
const pulses = [
  [folds[0], '#35e0ff', 2.4, 0],
  [folds[2], '#b6ff3c', 2.9, 0.7],
  [folds[1], '#ffb02e', 2.1, 1.3],
  [folds[3], '#35e0ff', 3.2, 0.4],
].map(([d, c, dur, begin]) => {
  const mirror = (d, s) => (s === 1 ? d : d.replace(/(-?\d+(?:\.\d+)?)( |,)(-?\d+(?:\.\d+)?)/g, (m, x, sep, y) => `${-Number(x)}${sep}${y}`))
  return [1, -1]
    .map(
      side =>
        `<circle r="3.4" fill="${c}"><animateMotion path="${mirror(d, side)}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`,
    )
    .join('')
}).join('')

const BX = CX + 8 * S
const BY = 142
const spark = (x, y, c, dur, begin) =>
  `<g fill="${c}" opacity="0"><rect x="${x - 1.5}" y="${y - 5}" width="3" height="10"/><rect x="${x - 5}" y="${y - 1.5}" width="10" height="3"/><animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></g>`
const brain = `
<g transform="translate(${BX} ${BY})">
  <g filter="url(#glow)" opacity=".85">
    <g fill="url(#brainFill)">${circles(1)}${circles(-1)}</g>
    <animate attributeName="opacity" values=".55;1;.55" dur="3s" repeatCount="indefinite"/>
  </g>
  <g fill="#ffd7f2" stroke="#ffd7f2" stroke-width="7">${circles(1)}${circles(-1)}</g>
  <g fill="url(#brainFill)">${circles(1)}${circles(-1)}</g>
  <clipPath id="brainClip">${circles(1)}${circles(-1)}</clipPath>
  <g clip-path="url(#brainClip)">
    <g fill="none" stroke="#6b1d68" stroke-width="5" stroke-linecap="round">${foldPaths(1)}${foldPaths(-1)}</g>
    <g fill="none" stroke="#ffc2ea" stroke-width="1.6" stroke-linecap="round" transform="translate(-1.5 -2)">${foldPaths(1)}${foldPaths(-1)}</g>
  </g>
  <path d="M0 -64 C-7 -36 7 -18 0 6 S-6 40 0 60" fill="none" stroke="#2a0f33" stroke-width="5" stroke-linecap="round"/>
  <path d="M0 -64 C-7 -36 7 -18 0 6 S-6 40 0 60" fill="none" stroke="#ff9bd6" stroke-width="1.4" stroke-linecap="round" transform="translate(-2 0)" opacity=".7"/>
  ${pulses}
</g>
${spark(BX - 128, BY - 50, '#35e0ff', 2.2, 0)}
${spark(BX + 124, BY - 58, '#b6ff3c', 2.8, 0.9)}
${spark(BX + 108, BY + 40, '#ffb02e', 2.5, 1.6)}
${spark(BX - 112, BY + 34, '#ff4fa3', 3.1, 0.4)}
`

// ---- Antenas: seguram o cérebro ----
const stems = rect(CX + 4 * S, CY - 10, S, 14, CORAL) + rect(CX + 11 * S, CY - 10, S, 14, CORAL)

// ---- Lama, raízes de mangue e a parabólica enfiada ----
const MUD = 358
const mud =
  rect(560, MUD, 680, 18, '#2b241e') +
  [...Array(26)].map((_, i) => rect(560 + i * 27 + (i % 3) * 6, MUD - 4 + (i % 2) * 2, 14, 6, '#2b241e')).join('') +
  [...Array(12)].map((_, i) => rect(582 + i * 54, MUD + 6 + (i % 3) * 4, 8, 3, '#3a3128')).join('')
const roots = [
  `M600 ${MUD} C596 ${MUD - 38} 624 ${MUD - 56} 640 ${MUD - 96}`,
  `M632 ${MUD} C640 ${MUD - 30} 660 ${MUD - 40} 668 ${MUD - 78}`,
  `M1210 ${MUD} C1214 ${MUD - 44} 1190 ${MUD - 62} 1180 ${MUD - 104}`,
]
  .map(d => `<path d="${d}" fill="none" stroke="#3a3128" stroke-width="5" stroke-linecap="round"/>`)
  .join('')

const DX = 744
const dish = `
<rect x="${DX - 66}" y="${MUD - 6}" width="132" height="10" fill="#2b241e"/>
<rect x="${DX - 40}" y="${MUD - 12}" width="80" height="8" fill="#2b241e"/>
<rect x="${DX - 3}" y="${MUD - 90}" width="6" height="86" fill="#8f8d84"/>
<rect x="${DX - 14}" y="${MUD - 6}" width="28" height="6" fill="#6f6d65"/>
<g transform="translate(${DX} ${MUD - 100}) rotate(65)">
  <path d="M-52 0 A52 40 0 0 0 52 0 Z" fill="#a8a69c" stroke="${PAPER}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M-40 4 A40 28 0 0 0 40 4" fill="none" stroke="#6f6d65" stroke-width="3"/>
  <ellipse cx="0" cy="0" rx="52" ry="7" fill="#d8d6cc" stroke="${PAPER}" stroke-width="2"/>
  <path d="M0 2 L0 -46" stroke="#cfcdc3" stroke-width="3"/>
  <rect x="-5" y="-54" width="10" height="10" fill="${CORAL}"/>
</g>`

// Foco da parabólica e ondas psicodélicas que saem dele, crescendo em direção ao cérebro.
const FX = DX + 49
const FY = MUD - 100 - 23
const arcs = [0, 0.75, 1.5, 2.25]
  .map(
    (begin, i) => `
<g transform="translate(${FX.toFixed(1)} ${FY.toFixed(1)}) rotate(-22)">
  <path d="M26 -22 A34 34 0 0 1 26 22" fill="none" stroke="${PSY[i]}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity="0">
    <animateTransform attributeName="transform" type="scale" values=".4;4.8" dur="3s" begin="${begin}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;1;.8;0" keyTimes="0;.12;.6;1" dur="3s" begin="${begin}s" repeatCount="indefinite"/>
    <animate attributeName="stroke" values="${cycle(i)}" dur="4s" begin="${begin}s" repeatCount="indefinite"/>
  </path>
</g>`,
  )
  .join('')

const brackets = [
  [24, 24, 1, 1],
  [W - 24, 24, -1, 1],
  [24, H - 24, 1, -1],
  [W - 24, H - 24, -1, -1],
]
  .map(([x, y, dx, dy]) => `<path d="M${x} ${y + dy * 28} V${y} H${x + dx * 28}" fill="none" stroke="${LINE}" stroke-width="3"/>`)
  .join('')

const footer = `<text x="72" y="${H - 44}" font-family="${MONO}" font-size="16" fill="#6f6d65">© 2026 two2Dope</text>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
<title id="t">Claudin: caranguejos com cérebro</title>
<desc id="d">Banner do Claudin: o nome em pixel-art, o mascote caranguejo andando de lado com um cérebro colorido nas antenas e uma antena parabólica enfiada na lama transmitindo sinal psicodélico.</desc>
<defs>
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><rect x="11" y="11" width="2" height="2" fill="#262626"/></pattern>
  <radialGradient id="brainFill" cx="35%" cy="30%" r="80%">
    <stop offset="0" stop-color="#ffb3e0"><animate attributeName="stop-color" values="#ffb3e0;#c9b3ff;#a8f0ff;#ffb3e0" dur="9s" repeatCount="indefinite"/></stop>
    <stop offset=".55" stop-color="#ff4fa3"><animate attributeName="stop-color" values="#ff4fa3;#8a5cff;#35e0ff;#ff4fa3" dur="9s" repeatCount="indefinite"/></stop>
    <stop offset="1" stop-color="#5b1f8f"><animate attributeName="stop-color" values="#5b1f8f;#2b3fa8;#1f6f8f;#5b1f8f" dur="9s" repeatCount="indefinite"/></stop>
  </radialGradient>
  <linearGradient id="ribbon" x1="-100" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#35e0ff"/><stop offset=".5" stop-color="#b6ff3c"/><stop offset="1" stop-color="#ffb02e"/>
  </linearGradient>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="#161616"/>
<rect width="${W}" height="${H}" fill="url(#dots)"/>
${brackets}
<g shape-rendering="crispEdges">${letters}${caret}</g>
${titulo}
${roots}
${mud}
${dish}
${arcs}
${feet}
${ghosts}
${stems}
<g shape-rendering="crispEdges" transform="translate(${CX} ${CY}) scale(${S})">${sprite('run', 'normal', 'right')}</g>
${brain}
${footer}
</svg>
`

const out = join(dirname(fileURLToPath(import.meta.url)), 'banner.svg')
writeFileSync(out, svg)
console.log('ok', out)
