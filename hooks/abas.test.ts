import { describe, expect, test } from 'claude-code/testing'

import { tabBarWidth, tabGap } from './abas'

const SIX = ['Prompts', 'Ações', 'Comandos', 'Ajustes', 'Tempo', 'Agenda']
const SEVEN = [...SIX, 'Frota']
const MAX = 52 // TOOLBOX_W (56) menos a borda e o padding

describe('barra de abas da caixa', () => {
  test('largura é a soma dos rótulos, do prefixo de cada um e dos espaços', () => {
    expect(tabBarWidth(SIX, 1)).toBe(49)
    expect(tabBarWidth(SEVEN, 1)).toBe(56)
    expect(tabBarWidth(SEVEN, 0)).toBe(50)
  })

  test('com seis abas o espaço fica em 1; com sete a barra encolhe para caber', () => {
    expect(tabGap(SIX, MAX)).toBe(1)
    expect(tabGap(SEVEN, MAX)).toBe(0)
    expect(tabBarWidth(SEVEN, tabGap(SEVEN, MAX))).toBeLessThanOrEqual(MAX)
  })
})
