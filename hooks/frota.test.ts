import { describe, expect, test } from 'claude-code/testing'
import type { AgentInfo } from 'claude-code'

import { LINGER_MS, MISSING_GRACE_MS, finish, liveCount, reconcile, upsert } from './frota'
import type { FleetRow } from '../types'

const NOW = 1_000_000

const row = (over: Partial<FleetRow> = {}): FleetRow => ({
  id: 'a1', type: 'Explore', description: 'mapear hooks', model: null, state: 'running',
  startedAt: NOW - 5_000, seenAt: NOW - 1_000, tools: 0, lastTool: null, ...over,
})

const info = (over: Partial<AgentInfo> = {}): AgentInfo => ({
  id: 'a1', type: 'Explore', description: 'mapear hooks', status: 'running', ...over,
})

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
    expect(r.seenAt).toBe(NOW)
    expect(r.state).toBe('running')
  })

  test('linha viva que sumiu da lista vira done só depois da tolerância', () => {
    const cedo = reconcile([row({ seenAt: NOW - MISSING_GRACE_MS })], [], NOW)
    expect(cedo[0].state).toBe('running')
    const tarde = reconcile([row({ seenAt: NOW - MISSING_GRACE_MS - 1 })], [], NOW)
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
    expect(finish([done], 'a1', 'failed', NOW)[0]).toMatchObject({ state: 'done', endedAt: 5 })
    expect(finish([done], 'nope', 'done', NOW)).toHaveLength(1)
  })
})

describe('liveCount', () => {
  test('conta só running e waiting', () => {
    const rows = [row({ id: '1' }), row({ id: '2', state: 'waiting' }), row({ id: '3', state: 'done' }), row({ id: '4', state: 'failed' })]
    expect(liveCount(rows)).toBe(2)
  })
})
