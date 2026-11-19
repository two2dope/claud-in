import { describe, expect, test } from 'claude-code/testing'

import { MINI_KINDS, miniKind, parseFleetMap, pickMinis } from './minis'
import type { FleetRow } from '../types'

const row = (id: string, type: string, over: Partial<FleetRow> = {}): FleetRow => ({
  id, type, description: 'x', model: null, state: 'running', startedAt: 1000, seenAt: 1000, tools: 0, lastTool: null, ...over,
})

describe('miniKind', () => {
  test('o mapa aprovado: explorar, planejar, executar, revisar e o resto', () => {
    expect(miniKind('Explore')).toBe('siri')
    expect(miniKind('Plan')).toBe('garca')
    expect(miniKind('general-purpose')).toBe('guaiamum')
    expect(miniKind('agent-skills:code-reviewer')).toBe('aratu')
    expect(miniKind('web-fetch')).toBe('caranguejinho')
  })

  test('prefixo do plugin e caixa não atrapalham', () => {
    expect(miniKind('navigator:task-planner')).toBe('garca')
    expect(miniKind('caveman:cavecrew-investigator')).toBe('siri')
    expect(miniKind('navigator:navigator-research')).toBe('siri')
    expect(miniKind('caveman:cavecrew-builder')).toBe('guaiamum')
    expect(miniKind('agent-skills:security-auditor')).toBe('aratu')
    expect(miniKind('agent-skills:test-engineer')).toBe('aratu')
    expect(miniKind('EXPLORE')).toBe('siri')
  })

  test('tipo vazio ou desconhecido vira caranguejinho', () => {
    expect(miniKind('')).toBe('caranguejinho')
    expect(miniKind('statusline-setup')).toBe('caranguejinho')
  })

  test('o mapa do usuário vence, pelo tipo inteiro ou pelo curto', () => {
    expect(miniKind('Explore', { explore: 'garca' })).toBe('garca')
    expect(miniKind('agent-skills:code-reviewer', { 'code-reviewer': 'siri' })).toBe('siri')
    expect(miniKind('web-fetch', { 'web-fetch': 'aratu' })).toBe('aratu')
  })

  test('as cinco criaturas existem', () => {
    expect(MINI_KINDS).toEqual(['siri', 'garca', 'guaiamum', 'aratu', 'caranguejinho'])
  })
})

describe('parseFleetMap', () => {
  test('lê { tipo: criatura } e ignora o que não vale', () => {
    expect(parseFleetMap('{ "Explore": "garca", "x": "dragao", "y": 3 }')).toEqual({ explore: 'garca' })
  })

  test('JSON ruim ou fora de forma devolve vazio', () => {
    expect(parseFleetMap('{ quebrado')).toEqual({})
    expect(parseFleetMap('[]')).toEqual({})
    expect(parseFleetMap('"x"')).toEqual({})
  })
})

describe('pickMinis', () => {
  test('sem agentes vivos, nada', () => {
    expect(pickMinis([])).toEqual({ shown: [], extra: 0 })
    expect(pickMinis([row('a', 'Explore', { state: 'done' }), row('b', 'Plan', { state: 'failed' })])).toEqual({ shown: [], extra: 0 })
  })

  test('uma miniatura por tipo, com a contagem', () => {
    const r = pickMinis([row('a', 'Explore'), row('b', 'Explore'), row('c', 'Explore')])
    expect(r).toEqual({ shown: [{ kind: 'siri', count: 3 }], extra: 0 })
  })

  test('mostra os 2 tipos com mais agentes e o resto vira +N', () => {
    const r = pickMinis([row('a', 'Explore'), row('b', 'Explore'), row('c', 'Plan'), row('d', 'Plan'), row('e', 'general-purpose'), row('f', 'web-fetch')])
    expect(r.shown).toEqual([{ kind: 'siri', count: 2 }, { kind: 'garca', count: 2 }])
    expect(r.extra).toBe(2)
  })

  test('empate de contagem: o tipo mais antigo aparece primeiro', () => {
    const r = pickMinis([row('a', 'Plan', { startedAt: 5000 }), row('b', 'Explore', { startedAt: 2000 }), row('c', 'general-purpose', { startedAt: 3000 })])
    expect(r.shown.map(s => s.kind)).toEqual(['siri', 'guaiamum'])
    expect(r.extra).toBe(1)
  })

  test('agente esperando também é vivo; terminado não conta', () => {
    const r = pickMinis([row('a', 'Explore', { state: 'waiting' }), row('b', 'Plan', { state: 'done' })])
    expect(r).toEqual({ shown: [{ kind: 'siri', count: 1 }], extra: 0 })
  })

  test('o mapa do usuário muda o agrupamento', () => {
    const r = pickMinis([row('a', 'Explore')], 2, { explore: 'aratu' })
    expect(r.shown).toEqual([{ kind: 'aratu', count: 1 }])
  })
})
