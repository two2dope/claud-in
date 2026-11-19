export type Mood = 'idle' | 'think' | 'read' | 'code' | 'run' | 'search' | 'ok' | 'err' | 'alert'
export type Action = { label: string; text: string }
export type TurnStats = { files: string[]; cmds: number; errors: number; agents: number }
export type ModeKind = 'normal' | 'cafe' | 'cigarro' | 'meditar' | 'thuglife'
export type Mode = { kind: ModeKind; until: number }
export type Walk = { x: number; dir: number }
export type Say = { mood: Mood; text: string; seq: number }
export type ColaCmd = { nome: string; descricao: string; exemplo: string }
export type ColaView = { readable: boolean; groups: { plugin: string; titulo: string; versao: string; lead: string; descricao: string; comandos: ColaCmd[]; skills: { name: string; status: string; descricao: string; exemplo: string }[] }[]; scripts: ColaCmd[] }
export type CofreView = { hasHot: boolean; next: string | null; urgent: string[]; fios: string[]; notes: string[] }
export type FleetState = 'running' | 'waiting' | 'done' | 'failed'
export type FleetRow = { id: string; type: string; description: string; model: string | null; state: FleetState; startedAt: number; seenAt: number; endedAt?: number; listed?: boolean; tools: number; lastTool: string | null }

declare module 'claude-code' {
  interface PluginState {
    claudin: { say: Say; isHidden: boolean; isQuiet: boolean; isSide: boolean; isLogOpen: boolean; mode: Mode; boxOpen: boolean; extraShortcuts: Action[]; lastCmd: string; lastFile: string; boxCat: string; reminders: { id: string; hh: number; mm: number; days: number[]; title: string; last?: string }[]; deadlines: { id: string; date: string; title: string }[]; ddText: string; timers: { label: string; endsAt: number; ms?: number; id?: string; paused?: number }[]; tick: number; cmds: { name: string; description: string }[]; query: string; favs: string[]; boxPage: number; sizeIdx: number; action: Action | null; turn: TurnStats; log: string[]; walk: Walk; sprites: Record<string, string>; fleet: FleetRow[]; cofre: string | null; cofreDeadlines: { id: string; date: string; title: string }[]; cofreView: CofreView | null; cola: string | null; colaView: ColaView | null; colaQuery: string; colaOpen: boolean; colaGroup: string; noteText: string; skin: string; skinArt: Record<string, string>; skinNames: string[]; miniArt: Record<string, string>; fleetMap: Record<string, string> }
  }
}
