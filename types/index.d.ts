export type Mood = 'idle' | 'think' | 'read' | 'code' | 'run' | 'search' | 'ok' | 'err' | 'alert'
export type Action = { label: string; text: string }
export type TurnStats = { files: string[]; cmds: number; errors: number }
export type ModeKind = 'normal' | 'cafe' | 'cigarro' | 'meditar' | 'thuglife'
export type Mode = { kind: ModeKind; until: number }
export type Walk = { x: number; dir: number }
export type Say = { mood: Mood; text: string; seq: number }

declare module 'claude-code' {
  interface PluginState {
    claudin: { say: Say; isHidden: boolean; isQuiet: boolean; isSide: boolean; isLogOpen: boolean; mode: Mode; boxOpen: boolean; extraShortcuts: Action[]; lastCmd: string; lastFile: string; boxCat: string; reminders: { id: string; hh: number; mm: number; days: number[]; title: string; last?: string }[]; deadlines: { id: string; date: string; title: string }[]; ddText: string; timers: { label: string; endsAt: number; ms?: number; id?: string; paused?: number }[]; tick: number; cmds: { name: string; description: string }[]; query: string; favs: string[]; boxPage: number; sizeIdx: number; action: Action | null; turn: TurnStats; log: string[]; walk: Walk; sprites: Record<string, string> }
  }
}
