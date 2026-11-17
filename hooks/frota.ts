import type { AgentInfo } from 'claude-code'

import type { FleetRow, FleetState } from '../types'

// Estado puro da frota de subagentes: as linhas que o Claudin guarda e como elas acompanham o engine.
// A conciliação com a lista do engine é adaptada do agents.ts do legends-claude (MIT),
// https://github.com/leolegends/legends-claude, com uma diferença medida no spike (ver
// docs/superpowers/plans/spike-frota.md): o engine larga o agente da lista menos de 1 s depois de
// ele terminar e nunca mostrou `completed`, então quem some da lista vira `done`.

export const LINGER_MS = 8_000 // um agente terminado fica esse tempo na faixa
export const MISSING_GRACE_MS = 3_000 // uma linha viva que já foi vista na lista e sumiu dela, e muda por esse tempo, é dada como terminada
export const STALE_MS = 600_000 // rede de segurança: linha viva que a lista nunca nomeou (workflow) e muda por esse tempo é dada como terminada

const isLive = (r: FleetRow) => r.state === 'running' || r.state === 'waiting'

const STATE_OF: Record<AgentInfo['status'], FleetState> = {
  pending: 'running', running: 'running', waiting: 'waiting', idle: 'waiting', completed: 'done', failed: 'failed', killed: 'failed',
}

export const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

const newRow = (id: string, now: number): FleetRow => ({
  id, type: '', description: '', model: null, state: 'running', startedAt: now, seenAt: now, tools: 0, lastTool: null,
})

// Tipo curto para falar e listar: sem o prefixo do plugin ("agent-skills:code-reviewer" vira "code-reviewer"), até 16 caracteres.
export const shortType = (t: string): string => clip(t.split(':').pop() ?? t, 16)

// Volta uma linha a rodando: prova de vida (um agente retomado, uma ferramenta chamada depois do fim).
export const revive = (r: FleetRow, now: number): FleetRow => {
  const { endedAt: _ended, ...rest } = r
  return { ...rest, state: 'running', seenAt: now }
}

// Aplica `fn` à linha `id`, criando a linha quando ainda não existe.
export const upsert = (rows: readonly FleetRow[], id: string, now: number, fn: (r: FleetRow) => FleetRow): FleetRow[] =>
  rows.some(r => r.id === id) ? rows.map(r => (r.id === id ? fn(r) : r)) : [...rows, fn(newRow(id, now))]

// Marca o desfecho de uma linha viva. Linha já terminada ou id desconhecido ficam como estão.
export const finish = (rows: readonly FleetRow[], id: string, state: 'done' | 'failed', now: number): FleetRow[] =>
  rows.map(r => (r.id === id && isLive(r) ? { ...r, state, endedAt: now } : r))

// As linhas conferidas com a lista do engine (`null` quando a lista falhou: só a idade manda). Quem terminou
// há tempo sai; quem a lista dá como terminado termina; quem roda sem linha ganha uma; quem já foi visto na
// lista e sumiu dela vira terminado após a tolerância curta; quem a lista nunca nomeou (workflow) só
// termina pelo turn.complete ou pela rede de segurança STALE_MS.
export const reconcile = (rows: readonly FleetRow[], listed: readonly AgentInfo[] | null, now: number): FleetRow[] => {
  const byId = new Map((listed ?? []).map(i => [i.id, i]))
  const kept = rows
    .filter(r => r.endedAt === undefined || now - r.endedAt <= LINGER_MS)
    .map(r => {
      if (!isLive(r)) return r
      const info = byId.get(r.id)
      if (!info) {
        const lost = listed !== null && r.listed ? now - r.seenAt > MISSING_GRACE_MS : now - r.seenAt > STALE_MS
        return lost ? { ...r, state: 'done' as const, endedAt: now } : r
      }
      const state = STATE_OF[info.status] ?? 'running'
      return {
        ...r,
        state,
        seenAt: now,
        listed: true,
        type: r.type || clip(info.type, 40),
        description: r.description || clip(info.description, 120),
        ...(state === 'done' || state === 'failed' ? { endedAt: now } : {}),
      }
    })
  const adopted =
    listed === null
      ? []
      : listed
          .filter(i => (i.status === 'running' || i.status === 'pending') && !rows.some(r => r.id === i.id))
          .map(i => ({ ...newRow(i.id, now), listed: true, type: clip(i.type, 40), description: clip(i.description, 120) }))
  return [...kept, ...adopted]
}

export const liveCount = (rows: readonly FleetRow[]): number => rows.filter(isLive).length

export const SPAWN_SAY_MS = 2_000 // no máximo uma fala de subida a cada tanto, mesmo com vinte agentes de uma vez

const short = (s: string, n = 38) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

const span = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`
}

// A linha de resumo da frota: vazia sem agente vivo; um agente é nomeado; dois ou mais viram contagem.
export const summaryLine = (rows: readonly FleetRow[], now: number): string => {
  const live = rows.filter(isLive)
  if (!live.length) return ''
  const failed = rows.filter(r => r.state === 'failed' && r.endedAt !== undefined && now - r.endedAt <= LINGER_MS).length
  const main = live.length === 1 ? `1 agente: ${shortType(live[0].type) || 'subagente'} ${span(now - live[0].startedAt)}` : `${live.length} agentes rodando`
  return failed ? `${main} · ${failed} falhou` : main
}

export const spawnSay = (row: FleetRow, live: number): string => {
  if (live >= 2) return `${live} agentes em campo.`
  const who = row.type ? `Subagente ${shortType(row.type)}` : 'Subagente'
  return row.description ? `${who} em campo: ${short(row.description)}.` : `${who} em campo.`
}

export const failSay = (row: FleetRow): { text: string; action: { label: string; text: string } } => {
  const who = row.type ? `Agente ${shortType(row.type)}` : 'Agente'
  const task = row.description ? ` na tarefa "${row.description}"` : ''
  return {
    text: row.description ? `${who} falhou: ${short(row.description)}.` : `${who} falhou.`,
    action: {
      label: 'investigar',
      text: `O subagente${row.type ? ` ${row.type}` : ''} falhou${task}. Explique a causa provável e proponha o próximo passo.`,
    },
  }
}

export const shouldSaySpawn = (lastSayAt: number, now: number): boolean => now - lastSayAt >= SPAWN_SAY_MS

export const FLEET_MAX_ROWS = 6 // a aba lista até tantos agentes; o resto vira "+N agentes"

const ICON: Record<FleetState, string> = { running: '●', waiting: '◌', done: '✓', failed: '✗' }

// Uma linha da aba Frota: estado, tipo, tarefa, tempo (corrido se vivo, duração se terminou) e ferramentas.
export const rowLine = (r: FleetRow, now: number): string => {
  const elapsed = isLive(r) ? now - r.startedAt : (r.endedAt ?? now) - r.startedAt
  const parts = [shortType(r.type) || 'agente', ...(r.description ? [short(r.description, 24)] : []), span(elapsed), ...(r.tools ? [`${r.tools} ${r.tools === 1 ? 'tool' : 'tools'}`] : [])]
  return `${ICON[r.state]} ${parts.join(' · ')}`
}

// Vivos primeiro (do mais antigo ao mais novo), depois os terminados, do mais recente ao mais antigo.
export const orderRows = (rows: readonly FleetRow[]): FleetRow[] => [
  ...rows.filter(isLive).sort((a, b) => a.startedAt - b.startedAt),
  ...rows.filter(r => !isLive(r)).sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0)),
]
