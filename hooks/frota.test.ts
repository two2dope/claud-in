import { describe, expect, test } from 'claude-code/testing'
import type { AgentInfo } from 'claude-code'

import { FLEET_MAX_ROWS, LINGER_MS, MISSING_GRACE_MS, SPAWN_SAY_MS, STALE_MS, failSay, finish, liveCount, orderRows, reconcile, revive, rowLine, shortType, shouldSaySpawn, spawnSay, summaryLine, upsert } from './frota'
import type { FleetRow } from '../types'

const NOW = 1_000_000

const row = (over: Partial<FleetRow> = {}): FleetRow => ({
  id: 'a1', type: 'Explore', description: 'mapear hooks', model: null, state: 'running',
  startedAt: NOW - 5_000, seenAt: NOW - 1_000, tools: 0, lastTool: null, ...over,
})

// O motor preenche mais campos do que a frota lê; o teste só dá os que ela usa.
const info = (over: Partial<AgentInfo> = {}): AgentInfo =>
  ({ id: 'a1', type: 'Explore', description: 'mapear hooks', status: 'running', ...over }) as AgentInfo

describe('upsert', () => {
  test('cria a linha quando o id é novo', () => {
    const rows = upsert([], 'a1', 1000, r => ({ ...r, tools: 1 }))
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 'a1', state: 'running', startedAt: 1000, tools: 1 })
  })

  test('não funde dois agentes de mesmo tipo e descrição', () => {
    const a = upsert([], 'a1', 1000, r => ({ ...r, type: 'Explore', description: 'x' }))
    const b = upsert(a, 'a2', 1000, r => ({ ...r, type: 'Explore', description: 'x' }))
    expect(b.map(r => r.id)).toEqual(['a1', 'a2'])
  })
})

describe('reconcile', () => {
  test('completed na lista vira done com endedAt', () => {
    const [r] = reconcile([row()], [info({ status: 'completed' })], NOW)
    expect(r).toMatchObject({ state: 'done', endedAt: NOW })
  })

  test('failed e killed na lista viram failed', () => {
    const rows = reconcile([row({ id: 'a1' }), row({ id: 'a2' })], [info({ id: 'a1', status: 'failed' }), info({ id: 'a2', status: 'killed' })], NOW)
    expect(rows.map(r => r.state)).toEqual(['failed', 'failed'])
  })

  test('adota agente running da lista que não tem linha', () => {
    const rows = reconcile([], [info({ id: 'z9', type: 'Plan', description: 'planejar' })], NOW)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 'z9', type: 'Plan', description: 'planejar', state: 'running', startedAt: NOW })
  })

  test('renova seenAt de quem está na lista', () => {
    const [r] = reconcile([row({ seenAt: NOW - 50_000 })], [info()], NOW)
    expect(r!.seenAt).toBe(NOW)
    expect(r!.state).toBe('running')
  })

  test('linha viva já vista na lista que sumiu dela vira done só depois da tolerância', () => {
    const cedo = reconcile([row({ listed: true, seenAt: NOW - MISSING_GRACE_MS })], [], NOW)
    expect(cedo[0]!.state).toBe('running')
    const tarde = reconcile([row({ listed: true, seenAt: NOW - MISSING_GRACE_MS - 1 })], [], NOW)
    expect(tarde[0]).toMatchObject({ state: 'done', endedAt: NOW })
  })

  test('descarta linha terminada há mais de LINGER_MS e mantém a recente', () => {
    const old = row({ id: 'old', state: 'done', endedAt: NOW - LINGER_MS - 1 })
    const fresh = row({ id: 'fresh', state: 'done', endedAt: NOW - LINGER_MS })
    expect(reconcile([old, fresh], [], NOW).map(r => r.id)).toEqual(['fresh'])
  })
})

describe('finish', () => {
  test('marca o desfecho e endedAt numa linha viva', () => {
    const rows = finish([row()], 'a1', 'failed', NOW)
    expect(rows[0]).toMatchObject({ state: 'failed', endedAt: NOW })
  })

  test('não reescreve linha já terminada nem cria linha para id desconhecido', () => {
    const done = row({ state: 'done', endedAt: 5 })
    expect(finish([done], 'a1', 'failed', NOW)[0]!).toMatchObject({ state: 'done', endedAt: 5 })
    expect(finish([done], 'nope', 'done', NOW)).toHaveLength(1)
  })
})

describe('liveCount', () => {
  test('conta só running e waiting', () => {
    const rows = [row({ id: '1' }), row({ id: '2', state: 'waiting' }), row({ id: '3', state: 'done' }), row({ id: '4', state: 'failed' })]
    expect(liveCount(rows)).toBe(2)
  })
})

describe('summaryLine', () => {
  test('sem agentes vivos é vazio', () => {
    expect(summaryLine([], NOW)).toBe('')
    expect(summaryLine([row({ state: 'done', endedAt: NOW })], NOW)).toBe('')
  })

  test('um agente mostra o tipo e o tempo', () => {
    expect(summaryLine([row({ startedAt: NOW - 12_000 })], NOW)).toBe('1 agente: Explore 12s')
    expect(summaryLine([row({ startedAt: NOW - 75_000 })], NOW)).toBe('1 agente: Explore 1m15s')
  })

  test('dois ou mais agentes viram uma contagem, mesmo com vinte', () => {
    const three = ['1', '2', '3'].map(id => row({ id }))
    expect(summaryLine(three, NOW)).toBe('3 agentes rodando')
    const twenty = Array.from({ length: 20 }, (_, i) => row({ id: String(i) }))
    expect(summaryLine(twenty, NOW)).toBe('20 agentes rodando')
  })

  test('uma falha recente entra no sufixo e uma antiga não', () => {
    const live = [row({ id: '1' }), row({ id: '2' })]
    const recent = row({ id: '3', state: 'failed', endedAt: NOW - LINGER_MS })
    const old = row({ id: '4', state: 'failed', endedAt: NOW - LINGER_MS - 1 })
    expect(summaryLine([...live, recent], NOW)).toBe('2 agentes rodando · 1 falhou')
    expect(summaryLine([...live, old], NOW)).toBe('2 agentes rodando')
  })
})

describe('spawnSay', () => {
  test('um agente vivo nomeia o tipo e a tarefa', () => {
    expect(spawnSay(row(), 1)).toBe('Subagente Explore em campo: mapear hooks.')
  })

  test('dois ou mais vivos viram contagem', () => {
    expect(spawnSay(row(), 3)).toBe('3 agentes em campo.')
  })

  test('tipo ou descrição vazios não deixam pontuação solta', () => {
    expect(spawnSay(row({ description: '' }), 1)).toBe('Subagente Explore em campo.')
    expect(spawnSay(row({ type: '' }), 1)).toBe('Subagente em campo: mapear hooks.')
  })

  test('descrição longa é cortada em 38 caracteres', () => {
    const say = spawnSay(row({ description: 'x'.repeat(80) }), 1)
    expect(say).toBe(`Subagente Explore em campo: ${'x'.repeat(37)}….`)
  })
})

describe('failSay', () => {
  test('o texto nomeia o agente e a ação investiga', () => {
    const f = failSay(row())
    expect(f.text).toBe('Agente Explore falhou: mapear hooks.')
    expect(f.action.label).toBe('investigar')
    expect(f.action.text).toBe('O subagente Explore falhou na tarefa "mapear hooks". Explique a causa provável e proponha o próximo passo.')
  })
})

describe('shouldSaySpawn', () => {
  test('respeita o intervalo mínimo entre falas de subida', () => {
    expect(SPAWN_SAY_MS).toBe(2_000)
    expect(shouldSaySpawn(1000, 2999)).toBe(false)
    expect(shouldSaySpawn(1000, 3000)).toBe(true)
  })
})

describe('rowLine', () => {
  test('agente vivo mostra estado, tipo, tarefa, tempo corrido e ferramentas', () => {
    expect(rowLine(row({ startedAt: NOW - 12_000, tools: 3 }), NOW)).toBe('● Explore · mapear hooks · 12s · 3 tools')
    expect(rowLine(row({ startedAt: NOW - 12_000, tools: 1 }), NOW)).toBe('● Explore · mapear hooks · 12s · 1 tool')
    expect(rowLine(row({ startedAt: NOW - 12_000, tools: 0 }), NOW)).toBe('● Explore · mapear hooks · 12s')
  })

  test('agente terminado mostra a duração, não o tempo corrido', () => {
    expect(rowLine(row({ state: 'done', startedAt: NOW - 20_000, endedAt: NOW - 15_000 }), NOW)).toBe('✓ Explore · mapear hooks · 5s')
    expect(rowLine(row({ state: 'failed', startedAt: NOW - 20_000, endedAt: NOW - 15_000 }), NOW)).toBe('✗ Explore · mapear hooks · 5s')
  })

  test('esperando tem o próprio ícone, e tipo ou tarefa vazios são omitidos', () => {
    expect(rowLine(row({ state: 'waiting', startedAt: NOW - 1_000 }), NOW)).toBe('◌ Explore · mapear hooks · 1s')
    expect(rowLine(row({ type: '', description: '', startedAt: NOW - 1_000 }), NOW)).toBe('● agente · 1s')
  })
})

describe('orderRows', () => {
  test('vivos primeiro, depois os terminados do mais recente ao mais antigo', () => {
    const rows = [
      row({ id: 'old', state: 'done', endedAt: NOW - 5_000 }),
      row({ id: 'live', startedAt: NOW - 1_000 }),
      row({ id: 'new', state: 'failed', endedAt: NOW - 1_000 }),
    ]
    expect(orderRows(rows).map(r => r.id)).toEqual(['live', 'new', 'old'])
  })

  test('FLEET_MAX_ROWS é 6', () => {
    expect(FLEET_MAX_ROWS).toBe(6)
  })
})

describe('agentes que a lista nunca nomeia (workflow)', () => {
  test('linha nunca vista na lista não vira done pela tolerância curta', () => {
    const [r] = reconcile([row({ seenAt: NOW - MISSING_GRACE_MS - 1 })], [], NOW)
    expect(r!.state).toBe('running')
  })

  test('linha nunca vista na lista termina só depois de STALE_MS', () => {
    expect(reconcile([row({ seenAt: NOW - STALE_MS })], [], NOW)[0]!.state).toBe('running')
    expect(reconcile([row({ seenAt: NOW - STALE_MS - 1 })], [], NOW)[0]!).toMatchObject({ state: 'done', endedAt: NOW })
  })

  test('quem aparece na lista fica marcado como visto e passa à tolerância curta', () => {
    const [seen] = reconcile([row()], [info()], NOW)
    expect(seen!.listed).toBe(true)
    const [gone] = reconcile([seen!], [], NOW + MISSING_GRACE_MS + 1)
    expect(gone!.state).toBe('done')
  })

  test('revive volta a linha a rodando e limpa endedAt', () => {
    const r = revive(row({ state: 'done', endedAt: NOW - 100 }), NOW)
    expect(r!.state).toBe('running')
    expect(r!.seenAt).toBe(NOW)
    expect('endedAt' in r).toBe(false)
  })
})

describe('lista com defeito', () => {
  test('sem lista (null) só a idade manda: terminada sai, viva muda por STALE_MS termina', () => {
    const old = row({ id: 'old', state: 'done', endedAt: NOW - LINGER_MS - 1 })
    const stale = row({ id: 'stale', seenAt: NOW - STALE_MS - 1 })
    const fresh = row({ id: 'fresh', seenAt: NOW - 1_000 })
    const out = reconcile([old, stale, fresh], null, NOW)
    expect(out.map(r => [r.id, r.state])).toEqual([['stale', 'done'], ['fresh', 'running']])
  })

  test('sem lista não adota agente nenhum', () => {
    expect(reconcile([], null, NOW)).toEqual([])
  })

  test('status desconhecido da lista conta como rodando', () => {
    const [r] = reconcile([row()], [info({ status: 'inesperado' as any })], NOW)
    expect(r!.state).toBe('running')
  })
})

describe('shortType', () => {
  test('tira o prefixo do plugin e limita a 16 caracteres', () => {
    expect(shortType('Explore')).toBe('Explore')
    expect(shortType('')).toBe('')
    expect(shortType('agent-skills:web-performance-auditor')).toBe('web-performance…')
  })

  test('as frases usam o tipo curto, e a ação investigar leva o tipo inteiro', () => {
    const long = row({ type: 'agent-skills:web-performance-auditor' })
    expect(spawnSay(long, 1)).toBe('Subagente web-performance… em campo: mapear hooks.')
    expect(failSay(long).text).toBe('Agente web-performance… falhou: mapear hooks.')
    expect(failSay(long).action.text).toContain('agent-skills:web-performance-auditor')
    expect(summaryLine([long], NOW)).toContain('web-performance…')
    expect(rowLine(long, NOW)).toContain('web-performance…')
  })
})
