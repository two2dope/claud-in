// Janela de contexto: o Claudin lê a ocupação em $.session.usage().context.percent e avisa, uma vez por nível, que
// vale compactar. Só sugere: o botão do balão preenche o prompt com /compact e quem envia é a pessoa. Nunca compacta
// nem limpa sozinho. Os limites vêm de uma faixa escolhida em Ajustes (guardada entre sessões).
import type { Action } from '../types'

export type ContextPreset = { id: string; label: string; levels: number[] }

// Três limites crescentes: primeiro lembrete calmo, depois alerta, depois o nível alto. "desligado" não tem nenhum.
export const CONTEXT_PRESETS: ContextPreset[] = [
  { id: 'cedo', label: '50/70/85%', levels: [50, 70, 85] },
  { id: 'medio', label: '60/80/90%', levels: [60, 80, 90] },
  { id: 'tarde', label: '70/85/95%', levels: [70, 85, 95] },
  { id: 'off', label: 'desligado', levels: [] },
]
export const DEFAULT_PRESET = 'cedo'

// A faixa pelo id guardado; id desconhecido, vazio ou que não é texto cai na padrão.
export const presetById = (id: unknown): ContextPreset =>
  CONTEXT_PRESETS.find(p => p.id === id) ?? (CONTEXT_PRESETS.find(p => p.id === DEFAULT_PRESET) as ContextPreset)

const DEFAULT_LEVELS = presetById(DEFAULT_PRESET).levels

export const contextLevel = (percent?: number | null, levels: number[] = DEFAULT_LEVELS): number => {
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return 0
  return levels.filter(limit => percent >= limit).length
}

export type ContextWarn = { level: number; text: string; mood: 'idle' | 'alert'; action: Action }

const COMPACT: Action = { label: 'compactar', text: '/compact ' }

// Avisa só ao SUBIR de nível. Descer (depois de um /compact ou /clear) não avisa e rearma o aviso.
export function contextWarn(prev: number, percent: number, levels: number[] = DEFAULT_LEVELS): ContextWarn | null {
  const level = contextLevel(percent, levels)
  if (level <= prev) return null
  const p = Math.round(percent)
  const text =
    level === 1
      ? `Contexto em ${p}%. Se a conversa vai longe, vale um /compact.`
      : level === 2
        ? `Contexto em ${p}%. Compacte agora para não perder o fio.`
        : `Contexto em ${p}%. Hora de /compact, ou /clear se for mudar de assunto.`
  return { level, text, mood: level === 1 ? 'idle' : 'alert', action: COMPACT }
}

export const contextLine = (percent: number | null, levels: number[] = DEFAULT_LEVELS): string =>
  percent === null ? 'contexto: sem leitura ainda' : `contexto: ${percent}% da janela${contextLevel(percent, levels) > 0 ? ' · vale compactar' : ''}`

// O que $.session.usage() devolveu vira uma porcentagem inteira de 0 a 100, ou null sem leitura.
export function readPercent(usage: unknown): number | null {
  const percent = (usage as { context?: { percent?: unknown } } | null | undefined)?.context?.percent
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return null
  return Math.max(0, Math.min(100, Math.round(percent)))
}
