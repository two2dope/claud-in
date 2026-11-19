import { INK, fillCells, newGrid, palOf, px, rim } from './desenho'
import type { MiniKind } from './minis'

// As criaturas da frota, desenhadas em código no mesmo estilo do Claudin: silhueta em grade 12x12, luz de borda
// automática (realce em cima e à esquerda, sombra embaixo e à direita), olhos que piscam e um balanço de meio pixel.
// Legenda: b corpo, a detalhe (bico), w olho, k pupila, . vazio.
export const MINI_BASE: Record<MiniKind, string> = {
  siri: '#5b8def',
  garca: '#9b7fe0',
  guaiamum: '#e0a63a',
  aratu: '#4caf7d',
  caranguejinho: '#8f9bad',
}

const BICO = '#f2c14e'
const EYE = '#f5f4ed'

const MAPS: Record<MiniKind, string[]> = {
  // Siri: casco largo, pinças para o alto e pernas de remo atrás.
  siri: [
    '.bb......bb.',
    '.bbb....bbb.',
    '.bbb....bbb.',
    '..bbbbbbbb..',
    '.bbbbbbbbbb.',
    'bbbwkbbwkbbb',
    '.bbbbbbbbbb.',
    '..bbbbbbbb..',
    '.b.b.bb.b.b.',
    'bb.b....b.bb',
  ],
  // Garça: de pé numa perna só, pescoço longo e bico para a direita.
  garca: [
    '....bbbb....',
    '...bbwkbaaaa',
    '...bbbb.....',
    '....bb......',
    '....bb......',
    '....bb......',
    '...bbbbb....',
    '..bbbbbbb...',
    '...bbbbbb...',
    '....b.......',
    '....b.......',
    '...bbb......',
  ],
  // Guaiamum: uma garra enorme à direita, a outra pequena.
  guaiamum: [
    '.......bbbb.',
    '......bbbbbb',
    '......bb..bb',
    '......bbbbb.',
    '.......bb...',
    '..bbbbbbbb..',
    '.bbwkbbwkbb.',
    '.bbbbbbbbbb.',
    '..bbbbbbbb..',
    '.b.b.bb.b.b.',
  ],
  // Aratu: caixa de pernas compridas e olhos em hastes.
  aratu: [
    '............',
    '..bb....bb..',
    '..wk....wk..',
    '..b......b..',
    '.bbbbbbbbbb.',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    '.bbbbbbbbbb.',
    'b.b.b..b.b.b',
    'b.b.b..b.b.b',
    'b..........b',
  ],
  // Caranguejinho: pequeno e cinza, o "outros".
  caranguejinho: [
    '............',
    '............',
    '.b........b.',
    '.bb......bb.',
    '..bbbbbbbb..',
    '.bbwkbbwkbb.',
    '.bbbbbbbbbb.',
    '..b.b..b.b..',
  ],
}

// Balanço de cada criatura, em segundos; diferentes para não bater o passo juntas.
const BALANCO: Record<MiniKind, number> = { siri: 3.1, garca: 4.3, guaiamum: 3.7, aratu: 3.4, caranguejinho: 2.9 }

export function miniSvg(kind: MiniKind): string {
  const map = MAPS[kind]
  const pal = palOf(MINI_BASE[kind])
  const grid = newGrid()
  let corpo = ''
  let detalhe = ''
  let olhos = ''
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]!
      if (ch === '.') continue
      fillCells(grid, x, y)
      if (ch === 'a') detalhe += px(x, y, 1, 1, BICO)
      else if (ch === 'w') olhos += px(x, y, 1, 1, EYE)
      else if (ch === 'k') olhos += `<rect x="${x}" y="${y}" width="1" height="1" fill="${INK}"><animate attributeName="height" values="1;1;1;.2;1" dur="4s" repeatCount="indefinite"/></rect>`
      else corpo += px(x, y, 1, 1, pal.base)
    }
  })
  // Os olhos ficam sobre a cor do corpo: pinta o corpo também sob eles, para a luz de borda não furar o rosto.
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === 'w' || row[x] === 'k') corpo += px(x, y, 1, 1, pal.base)
  })
  const bob = `<animateTransform attributeName="transform" type="translate" values="0 0;0 -.4;0 0" dur="${BALANCO[kind]}s" repeatCount="indefinite"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" shape-rendering="crispEdges"><g>${corpo}${rim(grid, pal)}${detalhe}${olhos}${bob}</g></svg>`
}
