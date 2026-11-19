import { describe, expect, test } from 'claude-code/testing'

import { CONTEXT_PRESETS, DEFAULT_PRESET, contextLevel, contextLine, contextWarn, presetById, readPercent } from './contexto'

const CEDO = [50, 70, 85]
const TARDE = [70, 85, 95]

describe('contexto: faixas de aviso', () => {
  test('as faixas prontas, da mais cedo ao desligado, e a padrão é a mais cedo', () => {
    expect(CONTEXT_PRESETS.map(p => [p.id, p.levels])).toEqual([['cedo', CEDO], ['medio', [60, 80, 90]], ['tarde', TARDE], ['off', []]])
    expect(CONTEXT_PRESETS.map(p => p.label)).toEqual(['50/70/85%', '60/80/90%', '70/85/95%', 'desligado'])
    expect(DEFAULT_PRESET).toBe('cedo')
  })

  test('presetById devolve a faixa, e a padrão para id desconhecido ou vazio', () => {
    expect(presetById('tarde').levels).toEqual(TARDE)
    expect(presetById('nao-existe').id).toBe('cedo')
    expect(presetById(undefined).id).toBe('cedo')
    expect(presetById(7).id).toBe('cedo')
  })

  test('contextLevel sobe a cada limite, inclusive nele, e a faixa padrão é a cedo', () => {
    expect([0, 49, 50, 69, 70, 84, 85, 100].map(p => contextLevel(p))).toEqual([0, 0, 1, 1, 2, 2, 3, 3])
    expect([0, 69, 70, 84, 85, 94, 95, 100].map(p => contextLevel(p, TARDE))).toEqual([0, 0, 1, 1, 2, 2, 3, 3])
  })

  test('desligado nunca tem nível', () => {
    expect(contextLevel(99, [])).toBe(0)
    expect(contextWarn(0, 99, [])).toBeNull()
  })

  test('sem número (janela sem leitura) não há nível', () => {
    expect(contextLevel(undefined)).toBe(0)
    expect(contextLevel(null)).toBe(0)
    expect(contextLevel(Number.NaN)).toBe(0)
  })

  test('avisa uma vez ao subir de nível e fica calado enquanto o nível é o mesmo', () => {
    expect(contextWarn(0, 52, CEDO)?.level).toBe(1)
    expect(contextWarn(1, 60, CEDO)).toBeNull()
    expect(contextWarn(1, 72, CEDO)?.level).toBe(2)
    expect(contextWarn(2, 80, CEDO)).toBeNull()
    expect(contextWarn(2, 90, CEDO)?.level).toBe(3)
  })

  test('a faixa muda quando os avisos disparam: 72% é o primeiro nível na tarde e o segundo na cedo', () => {
    expect(contextWarn(0, 72, TARDE)?.level).toBe(1)
    expect(contextWarn(0, 72, CEDO)?.level).toBe(2)
  })

  test('pular direto de nível avisa pelo nível atual', () => {
    expect(contextWarn(0, 97, CEDO)?.level).toBe(3)
  })

  test('descer de nível (depois do /compact ou /clear) não avisa e rearma o aviso', () => {
    expect(contextWarn(3, 20, CEDO)).toBeNull()
    expect(contextLevel(20)).toBe(0)
    expect(contextWarn(0, 51, CEDO)?.level).toBe(1) // a janela encheu de novo
  })

  test('o aviso diz a porcentagem e sugere /compact, e só o último nível lembra do /clear', () => {
    const um = contextWarn(0, 55, CEDO)!
    expect(um.text).toContain('55%')
    expect(um.text).toContain('/compact')
    expect(um.text).not.toContain('/clear')
    expect(um.action).toEqual({ label: 'compactar', text: '/compact ' })
    const tres = contextWarn(2, 90, CEDO)!
    expect(tres.text).toContain('/compact')
    expect(tres.text).toContain('/clear')
    expect(tres.action).toEqual({ label: 'compactar', text: '/compact ' })
  })

  test('os níveis altos soam como alerta e o primeiro como lembrete calmo', () => {
    expect(contextWarn(0, 55, CEDO)?.mood).toBe('idle')
    expect(contextWarn(1, 75, CEDO)?.mood).toBe('alert')
    expect(contextWarn(2, 90, CEDO)?.mood).toBe('alert')
  })

  test('contextLine mostra a porcentagem e, a partir do primeiro nível da faixa, o que fazer', () => {
    expect(contextLine(40)).toBe('contexto: 40% da janela')
    expect(contextLine(55)).toBe('contexto: 55% da janela · vale compactar')
    expect(contextLine(55, TARDE)).toBe('contexto: 55% da janela')
    expect(contextLine(55, [])).toBe('contexto: 55% da janela')
    expect(contextLine(null)).toBe('contexto: sem leitura ainda')
  })

  test('readPercent lê context.percent, arredonda e recusa o que não é número', () => {
    expect(readPercent({ context: { window: 200000, percent: 71.6 } })).toBe(72)
    expect(readPercent({ context: { window: 200000 } })).toBeNull()
    expect(readPercent({ context: { window: 200000, percent: Number.NaN } })).toBeNull()
    expect(readPercent({ context: { window: 200000, percent: -3 } })).toBe(0)
    expect(readPercent({ context: { window: 200000, percent: 130 } })).toBe(100)
    expect(readPercent(null)).toBeNull()
    expect(readPercent(undefined)).toBeNull()
    expect(readPercent('lixo')).toBeNull()
  })
})
