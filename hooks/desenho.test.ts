import { describe, expect, test } from 'claude-code/testing'

import { CORAL, SKINS, palOf, sprite } from './desenho'

type R = { x: number; y: number; w: number; h: number; fill: string }
const rects = (svg: string): R[] =>
  [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="(#[0-9a-fA-F]{6})"/g)].map(m => ({
    x: Number(m[1]), y: Number(m[2]), w: Number(m[3]), h: Number(m[4]), fill: m[5]!.toLowerCase(),
  }))
const lum = (hex: string) => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return (0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!) / 255
}
const MOODS = ['idle', 'think', 'read', 'code', 'run', 'search', 'ok', 'err', 'alert'] as const
const COR = palOf(CORAL)

describe('a luz do Claudin é uma borda fina, não uma faixa', () => {
  test('nenhum retângulo largo de sombra ou fio escuro é mais grosso que meio pixel', () => {
    for (const mood of MOODS) {
      const tons = rects(sprite(mood, 'normal', 'center', SKINS.mangue)).filter(r => r.fill === COR.shade.toLowerCase() || r.fill === COR.deep.toLowerCase())
      expect(tons.length).toBeGreaterThan(0)
      for (const r of tons) if (r.w > 1.5) expect(r.h).toBeLessThanOrEqual(0.5)
    }
  })

  test('o rosto (olhos e o que fica entre eles) nunca leva sombra, fio escuro nem realce: sem efeito de barba por fazer', () => {
    const rosto = { x0: 4.5, x1: 12.5, y0: 4, y1: 6.4 } // da borda dos olhos à borda do outro olho, sem as quinas do corpo
    const cruza = (r: R) => r.x < rosto.x1 && r.x + r.w > rosto.x0 && r.y < rosto.y1 && r.y + r.h > rosto.y0
    for (const mood of MOODS) {
      const tons = rects(sprite(mood, 'normal', 'center', SKINS.mangue)).filter(r => [COR.shade, COR.deep, COR.hi].map(s => s.toLowerCase()).includes(r.fill))
      expect(tons.filter(cruza)).toEqual([])
    }
  })

  test('o realce corre pelo alto do corpo e a sombra pelo chão', () => {
    const r = rects(sprite('idle', 'normal', 'center', SKINS.mangue))
    expect(r.some(x => x.fill === COR.hi.toLowerCase() && x.y === 3 && x.h === 0.5 && x.w >= 4)).toBe(true)
    expect(r.some(x => x.fill === COR.shade.toLowerCase() && x.y === 7.5 && x.w >= 4)).toBe(true)
    expect(r.some(x => x.fill === COR.deep.toLowerCase())).toBe(true)
  })

  test('o contraste é forte: realce, base, sombra e fio escuro descem de claro para escuro com folga', () => {
    expect(lum(COR.hi)).toBeGreaterThan(lum(COR.base) + 0.1)
    expect(lum(COR.base)).toBeGreaterThan(lum(COR.shade) + 0.08)
    expect(lum(COR.shade)).toBeGreaterThan(lum(COR.deep) + 0.08)
    expect(lum(COR.hi) - lum(COR.deep)).toBeGreaterThan(0.45)
  })

  test('o padrão (sem skin) continua chapado: só a cor base, sem realce nem sombra', () => {
    const cores = new Set(rects(sprite('idle', 'normal', 'center')).map(r => r.fill))
    expect(cores.has(COR.hi.toLowerCase())).toBe(false)
    expect(cores.has(COR.shade.toLowerCase())).toBe(false)
    expect(cores.has(CORAL.toLowerCase())).toBe(true)
  })

  test('o movimento e o olhar não mudam com a skin: mesmas animações e mesmos olhos', () => {
    const anim = (s: string) => (s.match(/<animate/g) ?? []).length
    for (const mood of MOODS) {
      expect(anim(sprite(mood, 'normal', 'sweep', SKINS.mare))).toBe(anim(sprite(mood, 'normal', 'sweep')))
    }
  })

  test('cada skin usa a sua cor e o Malungo leva o chapéu', () => {
    expect(sprite('idle', 'normal', 'center', SKINS.mare)).toContain('#2f9e9a')
    expect(sprite('idle', 'normal', 'center', SKINS.malungo)).toContain('#d9b45b')
    expect(sprite('idle', 'normal', 'center', SKINS.mangue)).not.toContain('#d9b45b')
  })

  test('todas as poses de todas as skins geram um SVG bem formado, sem NaN', () => {
    for (const skin of [undefined, ...Object.values(SKINS)]) {
      for (const mood of MOODS) {
        const svg = sprite(mood, 'normal', 'center', skin)
        expect(svg.startsWith('<svg xmlns=')).toBe(true)
        expect(svg.endsWith('</svg>')).toBe(true)
        expect(svg).not.toContain('NaN')
        expect(svg).not.toContain('undefined')
        expect(svg.length).toBeLessThan(131072)
      }
    }
  })
})
