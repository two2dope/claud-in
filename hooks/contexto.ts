// Janela de contexto: o Claudin lê a ocupação em $.session.usage().context.percent e avisa, uma vez por nível, que
// vale compactar. Só sugere: o botão do balão preenche o prompt com /compact e quem envia é a pessoa. Nunca compacta
// nem limpa sozinho.
import type { Action } from '../types'

// Primeiro aviso calmo, depois alerta, depois o limite de verdade.
export const CONTEXT_LEVELS = [70, 85, 95]

export const contextLevel = (percent?: number | null): number => {
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return 0
  return CONTEXT_LEVELS.filter(limit => percent >= limit).length
}

export type ContextWarn = { level: number; text: string; mood: 'idle' | 'alert'; action: Action }

const COMPACT: Action = { label: 'compactar', text: '/compact ' }

// Avisa só ao SUBIR de nível. Descer (depois de um /compact ou /clear) não avisa e rearma o aviso.
export function contextWarn(prev: number, percent: number): ContextWarn | null {
  const level = contextLevel(percent)
  if (level <= prev) return null
  const p = Math.round(percent)
  const text =
    level === 1
      ? `Contexto em ${p}%. Se a conversa vai longe, vale um /compact.`
      : level === 2
        ? `Contexto em ${p}%. Compacte agora para não perder o fio.`
        : `Contexto em ${p}%, quase cheio. /compact agora, ou /clear se for mudar de assunto.`
  return { level, text, mood: level === 1 ? 'idle' : 'alert', action: COMPACT }
}

export const contextLine = (percent: number | null): string =>
  percent === null ? 'contexto: sem leitura ainda' : `contexto: ${percent}% da janela${contextLevel(percent) > 0 ? ' · vale compactar' : ''}`

// O que $.session.usage() devolveu vira uma porcentagem inteira de 0 a 100, ou null sem leitura.
export function readPercent(usage: unknown): number | null {
  const percent = (usage as { context?: { percent?: unknown } } | null | undefined)?.context?.percent
  if (typeof percent !== 'number' || !Number.isFinite(percent)) return null
  return Math.max(0, Math.min(100, Math.round(percent)))
}
