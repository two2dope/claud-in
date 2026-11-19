import { describe, expect, test } from 'claude-code/testing'

import { TAB_ICON, tabBarCols, tabLabel } from './abas'

const NAMES: Record<string, string> = { prompts: 'Prompts', acoes: 'Ações', comandos: 'Comandos', ajustes: 'Ajustes', tempo: 'Tempo', prazos: 'Agenda', frota: 'Frota', cofre: 'Cofre' }
const ALL = ['prompts', 'acoes', 'comandos', 'ajustes', 'tempo', 'prazos', 'frota', 'cofre']
const MAX = 52 // TOOLBOX_W (56) menos a borda e o padding

describe('barra de abas só com ícone', () => {
  test('cada aba tem o seu ícone', () => {
    expect(ALL.map(c => TAB_ICON[c])).toEqual(['💬', '⚡', '⌘', '⚙', '⏱', '📅', '🦀', '🔐'])
  })

  test('aba fechada mostra só o ícone, com um espaço antes', () => {
    expect(tabLabel('prompts', NAMES.prompts!, false)).toBe(' 💬')
    expect(tabLabel('cofre', NAMES.cofre!, false)).toBe(' 🔐')
  })

  test('aba aberta mostra ▸, o ícone e o nome', () => {
    expect(tabLabel('prompts', NAMES.prompts!, true)).toBe('▸💬 Prompts')
    expect(tabLabel('prazos', NAMES.prazos!, true)).toBe('▸📅 Agenda')
  })

  test('categoria sem ícone cai para o nome, sem quebrar', () => {
    expect(tabLabel('outra', 'Outra', false)).toBe(' Outra')
    expect(tabLabel('outra', 'Outra', true)).toBe('▸Outra')
  })

  test('colunas: fechada ocupa 3 e a aberta no máximo 12 (ícone com 2 colunas)', () => {
    expect(tabBarCols(['prompts'], 'x', NAMES)).toBe(3)
    expect(tabBarCols(['prompts'], 'prompts', NAMES)).toBe(1 + 2 + 1 + 'Prompts'.length)
    expect(tabBarCols(['comandos'], 'comandos', NAMES)).toBe(12)
  })

  test('as oito abas cabem na caixa, com a mais larga aberta', () => {
    for (const open of ALL) expect(tabBarCols(ALL, open, NAMES)).toBeLessThanOrEqual(MAX)
    expect(tabBarCols(ALL, 'comandos', NAMES)).toBe(7 * 3 + 12)
  })
})
