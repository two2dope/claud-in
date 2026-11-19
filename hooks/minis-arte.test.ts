import { describe, expect, test } from 'claude-code/testing'

import { palOf } from './desenho'
import { MINI_BASE, miniSvg } from './minis-arte'
import { MINI_KINDS } from './minis'

describe('miniaturas da frota desenhadas em código', () => {
  test('cada criatura gera um SVG bem formado, só com elementos que o app desenha', () => {
    for (const kind of MINI_KINDS) {
      const svg = miniSvg(kind)
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"')).toBe(true)
      expect(svg.endsWith('</svg>')).toBe(true)
      expect(svg).not.toContain('<image')
      expect(svg).not.toContain('NaN')
      expect(svg.length).toBeLessThan(131072)
      const tags = new Set([...svg.matchAll(/<([a-zA-Z]+)/g)].map(m => m[1]))
      for (const t of tags) expect(['svg', 'g', 'rect', 'animate', 'animateTransform']).toContain(t)
    }
  })

  test('as cinco silhuetas são diferentes entre si, e a forma carrega o sentido, não só a cor', () => {
    const formas = MINI_KINDS.map(k => miniSvg(k).replace(/#[0-9a-fA-F]{6}/g, '#'))
    expect(new Set(formas).size).toBe(5)
    for (const k of MINI_KINDS) expect((miniSvg(k).match(/<rect/g) ?? []).length).toBeGreaterThan(20)
  })

  test('cada criatura tem a sua cor e a mesma luz do Claudin: realce no alto, sombra e fio escuro embaixo', () => {
    for (const kind of MINI_KINDS) {
      const pal = palOf(MINI_BASE[kind])
      const svg = miniSvg(kind).toLowerCase()
      for (const cor of [pal.base, pal.hi, pal.shade, pal.deep]) expect(svg).toContain(cor.toLowerCase())
    }
  })

  test('tem olhos (branco e tinta) que piscam, e nenhum movimento além de um balanço leve', () => {
    for (const kind of MINI_KINDS) {
      const svg = miniSvg(kind)
      expect(svg).toContain('#f5f4ed')
      expect(svg).toContain('#1a1a1a')
      expect(svg).toContain('<animate')
      const trans = [...svg.matchAll(/<animateTransform[^>]*values="([^"]+)"/g)]
      for (const m of trans) for (const v of m[1]!.split(';')) for (const n of v.trim().split(/\s+/)) expect(Math.abs(Number(n))).toBeLessThanOrEqual(0.5)
    }
  })
})
