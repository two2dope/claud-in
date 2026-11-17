import type { AgentInfo } from 'claude-code'

import type { FleetRow, FleetState } from '../types'

// Estado puro da frota de subagentes: as linhas que o Claudin guarda e como elas acompanham o engine.
// A conciliação com a lista do engine é adaptada do agents.ts do legends-claude (MIT),
// https://github.com/leolegends/legends-claude, com uma diferença medida no spike (ver
// docs/superpowers/plans/spike-frota.md): o engine larga o agente da lista menos de 1 s depois de
// ele terminar e nunca mostrou `completed`, então quem some da lista vira `done`.

export const LINGER_MS = 8_000 // um agente terminado fica esse tempo na faixa
export const MISSING_GRACE_MS = 3_000 // uma linha viva fora da lista, e muda por esse tempo, é dada como terminada

const isLive = (r: FleetRow) => r.state === 'running' || r.state === 'waiting'

const STATE_OF: Record<AgentInfo['status'], FleetState> = {
  pending: 'running', running: 'running', waiting: 'waiting', idle: 'waiting', completed: 'done', failed: 'failed', killed: 'failed',
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

const newRow = (id: string, now: number): FleetRow => ({
  id, type: '', description: '', model: null, state: 'running', startedAt: now, seenAt: now, tools: 0, lastTool: null,
})

// Aplica `fn` à linha `id`, criando a linha quando ainda não existe.
export const upsert = (rows: readonly FleetRow[], id: string, now: number, fn: (r: FleetRow) => FleetRow): FleetRow[] =>
  rows.some(r => r.id === id) ? rows.map(r => (r.id === id ? fn(r) : r)) : [...rows, fn(newRow(id, now))]

// Marca o desfecho de uma linha viva. Linha já terminada ou id desconhecido ficam como estão.
export const finish = (rows: readonly FleetRow[], id: string, state: 'done' | 'failed', now: number): FleetRow[] =>
  rows.map(r => (r.id === id && isLive(r) ? { ...r, state, endedAt: now } : r))

// As linhas conferidas com a lista do engine: quem terminou há tempo sai, quem a lista dá como terminado
// termina, quem roda sem linha ganha uma e quem sumiu da lista e está mudo há tempo é dado como terminado.
export const reconcile = (rows: readonly FleetRow[], listed: readonly AgentInfo[], now: number): FleetRow[] => {
  const byId = new Map(listed.map(i => [i.id, i]))
  const kept = rows
    .filter(r => r.endedAt === undefined || now - r.endedAt <= LINGER_MS)
    .map(r => {
      if (!isLive(r)) return r
      const info = byId.get(r.id)
      if (!info) return now - r.seenAt > MISSING_GRACE_MS ? { ...r, state: 'done' as const, endedAt: now } : r
      const state = STATE_OF[info.status]
      return {
        ...r,
        state,
        seenAt: now,
        type: r.type || clip(info.type, 40),
        description: r.description || clip(info.description, 120),
        ...(state === 'done' || state === 'failed' ? { endedAt: now } : {}),
      }
    })
  const adopted = listed
    .filter(i => (i.status === 'running' || i.status === 'pending') && !rows.some(r => r.id === i.id))
    .map(i => ({ ...newRow(i.id, now), type: clip(i.type, 40), description: clip(i.description, 120) }))
  return [...kept, ...adopted]
}

export const liveCount = (rows: readonly FleetRow[]): number => rows.filter(isLive).length
