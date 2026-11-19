import type { FleetRow } from '../types'

// Miniaturas da frota: uma criatura do mangue por tipo de agente, no lugar de uma cor (a forma diferente
// garante que a cor nunca seja o único sinal). Mapa aprovado: Explorar = siri, Planejar = garça,
// Executar = guaiamum, Revisar = aratu, o resto = caranguejinho.
export type MiniKind = 'siri' | 'garca' | 'guaiamum' | 'aratu' | 'caranguejinho'
export const MINI_KINDS: MiniKind[] = ['siri', 'garca', 'guaiamum', 'aratu', 'caranguejinho']

const isKind = (v: unknown): v is MiniKind => typeof v === 'string' && (MINI_KINDS as string[]).includes(v)

const RULES: [RegExp, MiniKind][] = [
  [/review|audit|critic|verif|test/, 'aratu'],
  [/plan/, 'garca'],
  [/explor|investigat|research|search/, 'siri'],
  [/general|builder|implement|exec/, 'guaiamum'],
]

// Criatura de um tipo de agente. `overrides` é o mapa do usuário (chaves em minúsculas), pelo tipo inteiro ou pelo curto.
export function miniKind(type: string, overrides: Record<string, string> = {}): MiniKind {
  const full = type.toLowerCase()
  const short = full.split(':').pop() ?? full
  const mine = overrides[full] ?? overrides[short]
  if (isKind(mine)) return mine
  for (const [re, kind] of RULES) if (re.test(short)) return kind
  return 'caranguejinho'
}

// fleet-map.json do usuário: { "tipo": "siri" }. Chave vira minúscula; criatura inválida é ignorada.
export function parseFleetMap(text: string): Record<string, MiniKind> {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return {}
  }
  const out: Record<string, MiniKind> = {}
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) if (isKind(v)) out[k.toLowerCase()] = v
  }
  return out
}

export type MiniShown = { kind: MiniKind; count: number }

const isLive = (r: FleetRow) => r.state === 'running' || r.state === 'waiting'

// Até `max` criaturas: os tipos com mais agentes vivos (empate: o que começou primeiro). `extra` são os agentes
// sem miniatura. Só agente vivo conta, então a faixa some quando a frota esvazia.
export function pickMinis(rows: readonly FleetRow[], max = 2, overrides: Record<string, string> = {}): { shown: MiniShown[]; extra: number } {
  const live = rows.filter(isLive)
  const groups = new Map<MiniKind, { count: number; first: number }>()
  for (const r of live) {
    const kind = miniKind(r.type, overrides)
    const g = groups.get(kind)
    groups.set(kind, g ? { count: g.count + 1, first: Math.min(g.first, r.startedAt) } : { count: 1, first: r.startedAt })
  }
  const shown = [...groups.entries()]
    .sort((a, b) => b[1].count - a[1].count || a[1].first - b[1].first)
    .slice(0, max)
    .map(([kind, g]) => ({ kind, count: g.count }))
  return { shown, extra: live.length - shown.reduce((n, s) => n + s.count, 0) }
}
