import { describe, expect, test } from 'claude-code/testing'

import { CONTEXT_LEVELS, contextLevel, contextLine, contextWarn, readPercent } from './contexto'

describe('contexto: aviso da janela cheia', () => {
  test('os níveis começam em 70, 85 e 95 por cento', () => {
    expect(CONTEXT_LEVELS).toEqual([70, 85, 95])
  })

  test('contextLevel vale 0 abaixo de 70 e sobe a cada limite, inclusive nele', () => {
    expect([0, 50, 69, 70, 84, 85, 94, 95, 100].map(contextLevel)).toEqual([0, 0, 0, 1, 1, 2, 2, 3, 3])
  })

  test('sem número (janela sem leitura) não há nível', () => {
    expect(contextLevel(undefined)).toBe(0)
    expect(contextLevel(null)).toBe(0)
    expect(contextLevel(Number.NaN)).toBe(0)
  })

  test('avisa uma vez ao subir de nível e fica calado enquanto o nível é o mesmo', () => {
    expect(contextWarn(0, 72)?.level).toBe(1)
    expect(contextWarn(1, 74)).toBeNull()
    expect(contextWarn(1, 86)?.level).toBe(2)
    expect(contextWarn(2, 88)).toBeNull()
    expect(contextWarn(2, 96)?.level).toBe(3)
  })

  test('pular direto de nível avisa pelo nível atual', () => {
    expect(contextWarn(0, 97)?.level).toBe(3)
  })

  test('descer de nível (depois do /compact ou /clear) não avisa e rearma o aviso', () => {
    expect(contextWarn(3, 20)).toBeNull()
    expect(contextLevel(20)).toBe(0)
    expect(contextWarn(0, 71)?.level).toBe(1) // a janela encheu de novo
  })

  test('o aviso diz a porcentagem e sugere /compact, e só o último nível lembra do /clear', () => {
    const um = contextWarn(0, 72)!
    expect(um.text).toContain('72%')
    expect(um.text).toContain('/compact')
    expect(um.text).not.toContain('/clear')
    expect(um.action).toEqual({ label: 'compactar', text: '/compact ' })
    const tres = contextWarn(2, 96)!
    expect(tres.text).toContain('/compact')
    expect(tres.text).toContain('/clear')
    expect(tres.action).toEqual({ label: 'compactar', text: '/compact ' })
  })

  test('os níveis altos soam como alerta e o primeiro como lembrete calmo', () => {
    expect(contextWarn(0, 72)?.mood).toBe('idle')
    expect(contextWarn(1, 86)?.mood).toBe('alert')
    expect(contextWarn(2, 97)?.mood).toBe('alert')
  })

  test('contextLine mostra a porcentagem e, a partir do primeiro nível, o que fazer', () => {
    expect(contextLine(40)).toBe('contexto: 40% da janela')
    expect(contextLine(72)).toBe('contexto: 72% da janela · vale compactar')
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
