import type { ModeKind, Mood } from '../types'

// O desenho do Claudin: SVG de pixel art em grade 16x12, gerado em código. Cada pose muda olhos, braços e pernas,
// e uma skin troca só a paleta (e o adereço), sem mudar o movimento, o olhar nem os modos.
export const CORAL = '#D97757'
export const INK = '#1a1a1a'

export const px = (x: number, y: number, w = 1, h = 1, f = CORAL) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`

type Look = 'left' | 'right' | 'up' | 'down' | 'center' | 'sweep'
export type { Look }

// Para onde o Claudin olha: para a cartola quando ela está aberta, para onde anda quando está parado,
// para cima ao pensar, para baixo ao codar e varrendo de lado ao ler ou buscar.
export const lookFor = (mood: Mood, dir: number, boxOpen_: boolean): Look =>
  boxOpen_ ? 'right'
  : mood === 'think' ? 'up'
  : mood === 'code' || mood === 'run' ? 'down'
  : mood === 'read' || mood === 'search' ? 'sweep'
  : mood === 'alert' || mood === 'err' ? 'center'
  : dir < 0 ? 'left' : 'right'

// ── Skins: o mesmo Claudin, com luz. A cor base ganha um realce no alto, uma sombra embaixo e um fio escuro. ──
export type Pal = { base: string; hi: string; shade: string; deep: string; ant: string }
export type SkinDef = { pal: Pal; hat?: boolean; sprout?: boolean }

const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
// Mistura `c` com `to` (#rrggbb) na proporção t (0 a 1).
export const mix = (c: string, to: string, t: number) => {
  const a = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
  const b = [1, 3, 5].map(i => parseInt(to.slice(i, i + 2), 16))
  return `#${a.map((v, i) => hex(v + (b[i]! - v) * t)).join('')}`
}

export const palOf = (base: string, ant: string = base): Pal => ({
  base,
  hi: mix(base, '#ffffff', 0.45),
  shade: mix(base, '#000000', 0.3),
  deep: mix(base, '#000000', 0.55),
  ant,
})

// ── Luz de borda: o Claudin vira uma grade de células cheias e só a BORDA recebe luz, de cima e da esquerda ──
// (realce) e de baixo e da direita (sombra, com o fio escuro no canto). O rosto fica da cor base, sem faixa
// de sombra embaixo dos olhos, que pareceria barba por fazer.
export type Grid = boolean[][]
export const newGrid = (): Grid => Array.from({ length: 12 }, () => Array<boolean>(16).fill(false))
export const fillCells = (g: Grid, x: number, y: number, w = 1, h = 1) => {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (g[yy] && xx >= 0 && xx < 16) g[yy]![xx] = true
}

// Junta células vizinhas em corridas, para a luz virar poucos retângulos.
const runs = (flags: boolean[]): [number, number][] => {
  const out: [number, number][] = []
  let start = -1
  flags.forEach((on, i) => {
    if (on && start < 0) start = i
    if (!on && start >= 0) {
      out.push([start, i - start])
      start = -1
    }
  })
  if (start >= 0) out.push([start, flags.length - start])
  return out
}

export const rim = (g: Grid, pal: Pal, t = 0.5): string => {
  const at = (x: number, y: number) => !!g[y]?.[x]
  const rows = g.length
  const cols = g[0]!.length
  let out = ''
  for (let y = 0; y < rows; y++) {
    for (const [x, n] of runs(Array.from({ length: cols }, (_, x) => at(x, y) && !at(x, y - 1)))) out += px(x, y, n, t, pal.hi)
    for (const [x, n] of runs(Array.from({ length: cols }, (_, x) => at(x, y) && !at(x, y + 1)))) out += px(x, y + 1 - t, n, t, pal.shade)
  }
  for (let x = 0; x < cols; x++) {
    for (const [y, n] of runs(Array.from({ length: rows }, (_, y) => at(x, y) && !at(x - 1, y)))) out += px(x, y, t, n, pal.hi)
    for (const [y, n] of runs(Array.from({ length: rows }, (_, y) => at(x, y) && !at(x + 1, y)))) out += px(x + 1 - t, y, t, n, pal.shade)
  }
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (at(x, y) && !at(x, y + 1) && !at(x + 1, y)) out += px(x + 1 - t, y + 1 - t, t, t, pal.deep)
  return out
}

const STRAW = { base: '#d9b45b', hi: '#eccf85', shade: '#b08f3f', band: '#6b4a2a' }
// Brotinho da Lama: uma folha de cannabis de cinco pontas nascendo do alto da cabeça, entre as antenas.
const LEAF = { base: '#4fae4a', hi: '#8ad77a', stem: '#2f7d32' }

// As skins do plugin; o resto vem de pastas sprites/<nome>/ do usuário. Sem skin (o "clássico") o Claudin é o chapado de sempre.
export const SKINS: Record<string, SkinDef> = {
  mangue: { pal: palOf(CORAL) },
  mare: { pal: palOf('#2f9e9a', '#7fd6d0') },
  malungo: { pal: palOf('#8f9bad', '#cfd6e0'), hat: true },
  lama: { pal: palOf('#7d6b43', '#a89968'), sprout: true },
}

export const sprite = (mood: Mood, kind: ModeKind = 'normal', look: Look = 'center', skin?: SkinDef) => {
  const pal = skin?.pal
  const c = pal?.base ?? CORAL
  const busy = mood === 'code' || mood === 'run' || mood === 'read' || mood === 'search'
  const body = px(3, 3, 10, 5, c) + px(2, 4, 12, 3, c)
  const antennae = [px(4, 1, 1, 1, pal?.ant ?? c), px(4, 2, 1, 1, pal?.ant ?? c), px(11, 1, 1, 1, pal?.ant ?? c), px(11, 2, 1, 1, pal?.ant ?? c)].join('')
  const legs = [3, 5, 10, 12].map(x => px(x, 8, 1, 2, c)).join('')
  const legAnim = busy
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 .6;0 0" dur=".35s" repeatCount="indefinite"/>`
    : ''
  const arms =
    mood === 'ok'
      ? px(0, 2, 2, 1, c) + px(0, 3, 1, 1, c) + px(14, 2, 2, 1, c) + px(15, 3, 1, 1, c)
      : px(0, 5, 2, 1, c) + px(14, 5, 2, 1, c)
  // Luz de borda sobre a silhueta (com paleta); o padrão chapado não leva nada.
  const grid = newGrid()
  fillCells(grid, 3, 3, 10, 5)
  fillCells(grid, 2, 4, 12, 3)
  for (const [ax, ay] of [[4, 1], [4, 2], [11, 1], [11, 2]] as const) fillCells(grid, ax, ay)
  for (const lx of [3, 5, 10, 12]) fillCells(grid, lx, 8, 1, 2)
  if (mood === 'ok') {
    fillCells(grid, 0, 2, 2, 1)
    fillCells(grid, 0, 3)
    fillCells(grid, 14, 2, 2, 1)
    fillCells(grid, 15, 3)
  } else {
    fillCells(grid, 0, 5, 2, 1)
    fillCells(grid, 14, 5, 2, 1)
  }
  const light = pal ? rim(grid, pal) : ''
  // Sombra no chão, só com paleta: um traço escuro e translúcido sob as pernas.
  const ground = pal ? `<rect x="3" y="10.1" width="10" height="0.4" fill="#000000" opacity=".28"/>` : ''
  const blink = busy ? '' : `<animate attributeName="height" values="2;2;2;.3;2" dur="4s" repeatCount="indefinite"/>`
  const eyes =
    kind === 'meditar'
      ? px(5, 5, 2, 0.4, INK) + px(10, 5, 2, 0.4, INK)
      : kind === 'thuglife' && mood !== 'err'
        ? px(4.5, 4, 3, 2.2, '#111111') + px(9.5, 4, 3, 2.2, '#111111') + px(7.5, 4.4, 2, 0.5, '#111111') +
          px(3, 4.4, 1.5, 0.5, '#111111') + px(12.5, 4.4, 1.5, 0.5, '#111111') +
          px(5, 4.3, 0.9, 0.5, '#6f6f6f') + px(10, 4.3, 0.9, 0.5, '#6f6f6f')
        : kind === 'cafe' && mood !== 'err' && mood !== 'think'
          ? [4.5, 9.5].map(ex => {
              const dx = look === 'left' ? 0 : look === 'right' ? 1 : 0.5
              const dy = look === 'up' ? 0 : look === 'down' ? 1 : 0.5
              return (
                `<rect x="${ex}" y="3.5" width="3" height="3" fill="#f5f4ed"/>` +
                `<rect x="${ex + dx}" y="${3.5 + dy}" width="2" height="2" fill="${INK}"/>` +
                `<rect x="${ex + dx + 0.3}" y="${3.5 + dy + 0.3}" width="0.5" height="0.5" fill="#f5f4ed"/>`
              )
            }).join('')
      : mood === 'err'
        ? px(5, 4, 1, 1, INK) + px(7, 4, 1, 1, INK) + px(6, 5, 1, 1, INK) + px(5, 6, 1, 1, INK) + px(7, 6, 1, 1, INK) +
          px(9, 4, 1, 1, INK) + px(11, 4, 1, 1, INK) + px(10, 5, 1, 1, INK) + px(9, 6, 1, 1, INK) + px(11, 6, 1, 1, INK)
        : mood === 'think'
          ? px(6, 4, 1, 2, INK) + px(10, 4, 1, 2, INK) + px(7, 4, 1, 1, INK)
          : [5, 10].map(ex => {
              const dx = look === 'left' ? 0 : look === 'right' ? 1 : 0.5
              const dy = look === 'up' ? 0 : look === 'down' ? 1 : 0.5
              const sweep = look === 'sweep' ? `<animate attributeName="x" values="${ex};${ex + 1};${ex}" dur="1.4s" repeatCount="indefinite"/>` : ''
              const sclera = `<rect x="${ex}" y="4" width="2" height="2" fill="#f5f4ed">${blink}</rect>`
              const pupil = `<rect x="${ex + dx}" y="${4 + dy}" width="1" height="1" fill="${INK}">${sweep}${busy ? '' : `<animate attributeName="height" values="1;1;1;.2;1" dur="4s" repeatCount="indefinite"/>`}</rect>`
              return sclera + pupil
            }).join('')
  const keys =
    mood === 'code'
      ? `<g fill="#7dd3fc"><rect x="3" y="10.5" width="1" height="1"><animate attributeName="opacity" values="1;0;1" dur=".3s" repeatCount="indefinite"/></rect><rect x="7" y="10.5" width="1" height="1"><animate attributeName="opacity" values="0;1;0" dur=".3s" repeatCount="indefinite"/></rect><rect x="11" y="10.5" width="1" height="1"><animate attributeName="opacity" values="1;0;1" dur=".45s" repeatCount="indefinite"/></rect></g>`
      : ''
  const fade = (dur: string, from: number, to: number) =>
    `<animate attributeName="opacity" values="${from};${to};${from}" dur="${dur}" repeatCount="indefinite"/>`
  // Chapéu de palha do Malungo: entre as antenas, sobre a testa. O ponto de exclamação passa para a direita.
  const hat = skin?.hat
    ? px(5, 0.4, 6, 2.2, STRAW.base) + px(5, 0.4, 6, 0.5, STRAW.hi) + px(5, 1.7, 6, 0.6, STRAW.band) +
      px(2.2, 2.4, 11.6, 0.7, STRAW.base) + px(2.2, 2.4, 11.6, 0.3, STRAW.hi) + px(2.2, 2.9, 11.6, 0.3, STRAW.shade)
    : ''
  // Brotinho: haste no alto da cabeça e folha de cinco pontas, com um balanço leve.
  const sprout = skin?.sprout
    ? `<g>` +
      px(7.5, 2, 1, 1, LEAF.stem) + px(7.5, 0, 1, 1, LEAF.base) + px(7.5, 1, 1, 1, LEAF.hi) +
      px(5.5, 1, 1, 1, LEAF.base) + px(9.5, 1, 1, 1, LEAF.base) + px(6.5, 2, 1, 1, LEAF.base) + px(8.5, 2, 1, 1, LEAF.base) +
      `<animateTransform attributeName="transform" type="rotate" values="-4 8 3;4 8 3;-4 8 3" dur="3.2s" repeatCount="indefinite"/></g>`
    : ''
  const prop =
    mood === 'alert'
      ? skin?.hat || skin?.sprout
        ? px(14.5, 0, 1, 1.6, '#f5b73d') + px(14.5, 2, 1, 0.6, '#f5b73d')
        : px(7.5, 0, 1, 1.6, '#f5b73d') + px(7.5, 2, 1, 0.6, '#f5b73d')
      : kind === 'cafe'
        ? px(14, 3, 2, 2, '#f5f4ed') + px(14, 3, 2, 0.7, '#6b4423') +
          `<rect x="14.7" y="1.6" width="0.6" height="1" fill="#cfcfcf">${fade('1.2s', 0.2, 0.9)}</rect>`
        : kind === 'cigarro'
          ? px(0, 4, 2, 0.6, '#f5f4ed') + px(0, 4, 0.6, 0.6, '#ff6a3d') +
            `<rect x="0.2" y="2.6" width="0.6" height="1" fill="#9a9a9a">${fade('1.6s', 0.1, 0.8)}</rect>`
          : kind === 'meditar'
            ? px(12.5, 0.2, 3, 1.2, '#d64545') + px(13.2, 0.4, 0.6, 0.6, '#f5f4ed') + px(14.4, 0.6, 0.5, 0.5, '#f5f4ed') + px(13.2, 1.4, 1.1, 1.3, '#f5f4ed')
            : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" shape-rendering="crispEdges">${ground}${antennae}${body}${arms}<g>${legs}${legAnim}</g>${light}${eyes}${keys}${hat}${sprout}${prop}</svg>`
}
