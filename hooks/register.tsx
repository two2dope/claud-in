import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Action, Mode, ModeKind, Mood, Say, TurnStats, Walk } from '../types'

const say = atom({ plugin: 'claudin', key: 'say' } as const, {
  mood: 'idle',
  text: 'Online. Monitorando.',
  seq: 0,
} as Say)
const sprites = atom({ plugin: 'claudin', key: 'sprites' } as const, {} as Record<string, string>)
const isQuiet = atom({ plugin: 'claudin', key: 'isQuiet' } as const, true)
const log = atom({ plugin: 'claudin', key: 'log' } as const, [] as string[])
const walk = atom({ plugin: 'claudin', key: 'walk' } as const, { x: 0, dir: 1 } as Walk)
const isLogOpen = atom({ plugin: 'claudin', key: 'isLogOpen' } as const, false)
const isSide = atom({ plugin: 'claudin', key: 'isSide' } as const, false)
const isHidden = atom({ plugin: 'claudin', key: 'isHidden' } as const, false)
const mode = atom({ plugin: 'claudin', key: 'mode' } as const, { kind: 'normal', until: 0 } as Mode)
const action = atom({ plugin: 'claudin', key: 'action' } as const, null as Action | null)
type Cmd = { name: string; description: string }
const BORDER: Record<string, string> = { err: 'error', alert: 'warning', ok: 'success' }
const sizeIdx = atom({ plugin: 'claudin', key: 'sizeIdx' } as const, 0)
const SIZES: { w: number; h: number; label: string }[] = [
  { w: 44, h: 33, label: 'médio' },
  { w: 30, h: 22, label: 'pequeno' },
  { w: 64, h: 48, label: 'grande' },
]
const boxOpen = atom({ plugin: 'claudin', key: 'boxOpen' } as const, false)
const boxPage = atom({ plugin: 'claudin', key: 'boxPage' } as const, 0)
const cmds = atom({ plugin: 'claudin', key: 'cmds' } as const, [] as Cmd[])
const query = atom({ plugin: 'claudin', key: 'query' } as const, '')
const favs = atom({ plugin: 'claudin', key: 'favs' } as const, [] as string[])
type Reminder = { id: string; hh: number; mm: number; days: number[]; title: string; last?: string }
const reminders = atom({ plugin: 'claudin', key: 'reminders' } as const, [] as Reminder[])
type Deadline = { id: string; date: string; title: string }
const deadlines = atom({ plugin: 'claudin', key: 'deadlines' } as const, [] as Deadline[])
const ddText = atom({ plugin: 'claudin', key: 'ddText' } as const, '')
type Timer = { label: string; endsAt: number; ms?: number; id?: string; paused?: number }
const idOf = (t: Timer) => t.id ?? String(t.endsAt)
const timers = atom({ plugin: 'claudin', key: 'timers' } as const, [] as Timer[])
const tick = atom({ plugin: 'claudin', key: 'tick' } as const, 0)
const boxCat = atom({ plugin: 'claudin', key: 'boxCat' } as const, 'prompts')
const CATS = ['prompts', 'acoes', 'comandos', 'ajustes', 'tempo', 'prazos']
const CAT_LABEL: Record<string, string> = { prompts: 'Prompts', acoes: 'Ações', comandos: 'Comandos', ajustes: 'Ajustes', tempo: 'Tempo', prazos: 'Agenda' }
const SHORTCUTS: { label: string; text: string }[] = [
  { label: 'resumir', text: 'Resuma em poucas linhas o que você fez até agora.' },
  { label: 'explicar erro', text: 'Explique o último erro que apareceu e proponha o próximo passo.' },
  { label: 'rodar testes', text: 'Rode os testes do projeto e me diga o resultado.' },
  { label: 'próximo passo', text: 'Qual é o próximo passo mais útil agora? Responda em uma frase.' },
]
const TOOLBOX_W = 56
const PAGE = 4
const PAGE_CMD = 3
const PANE_RANGE = 14
const extraShortcuts = atom({ plugin: 'claudin', key: 'extraShortcuts' } as const, [] as Action[])
const lastCmd = atom({ plugin: 'claudin', key: 'lastCmd' } as const, '')
const lastFile = atom({ plugin: 'claudin', key: 'lastFile' } as const, '')
const turn = atom({ plugin: 'claudin', key: 'turn' } as const, { files: [], cmds: 0, errors: 0 } as TurnStats)

// Comandos que merecem um aviso antes de rodar. Lista curta; não substitui as permissões do app.
const RISKY = /\brm\s+(-[a-z]*r|-[a-z]*f)|git\s+push\b.*(--force|\s-f\b)|git\s+reset\s+--hard|git\s+clean\s+-[a-z]*f|drop\s+(table|database)|remove-item\b.*-recurse|\bdel\s+\/[sq]|\bformat\s+[a-z]:|mkfs|:\(\)\s*\{/i
const SLOW_MS = 30000

const CORAL = '#D97757'
const INK = '#1a1a1a'

const baseName = (n: string) => n.split(':').pop() ?? n

// Skills criadas pelo usuário aparecem tanto como /nome quanto como /pacote:nome. Agrupa pelo nome-base e pela
// descrição e mantém a forma mais curta; um /pacote:nome com descrição diferente é outro comando e fica.
const dedupe = (list: Cmd[]): Cmd[] => {
  const best = new Map<string, Cmd>()
  for (const c of list) {
    const key = `${baseName(c.name)}|${c.description}`
    const cur = best.get(key)
    if (!cur || c.name.length < cur.name.length) best.set(key, c)
  }
  return list.filter(c => best.get(`${baseName(c.name)}|${c.description}`) === c)
}

const chunk = <T,>(list: T[], n: number): T[][] =>
  Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))

const short = (s: unknown, n = 38) =>
  typeof s === 'string' ? (s.length > n ? s.slice(0, n - 1) + '…' : s) : ''
const base = (p: unknown) => short(typeof p === 'string' ? p.split(/[\\/]/).pop() : '')

const px = (x: number, y: number, w = 1, h = 1, f = CORAL) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`

// Claudin em grade 16x12; cada mood muda olhos, braços e pernas.
type Look = 'left' | 'right' | 'up' | 'down' | 'center' | 'sweep'

// Para onde o Claudin olha: para a cartola quando ela está aberta, para onde anda quando está parado,
// para cima ao pensar, para baixo ao codar e varrendo de lado ao ler ou buscar.
const lookFor = (mood: Mood, dir: number, boxOpen_: boolean): Look =>
  boxOpen_ ? 'right'
  : mood === 'think' ? 'up'
  : mood === 'code' || mood === 'run' ? 'down'
  : mood === 'read' || mood === 'search' ? 'sweep'
  : mood === 'alert' || mood === 'err' ? 'center'
  : dir < 0 ? 'left' : 'right'

const sprite = (mood: Mood, kind: ModeKind = 'normal', look: Look = 'center') => {
  const busy = mood === 'code' || mood === 'run' || mood === 'read' || mood === 'search'
  const body = px(3, 3, 10, 5) + px(2, 4, 12, 3)
  const antennae = px(4, 1) + px(4, 2) + px(11, 1) + px(11, 2)
  const legs = [3, 5, 10, 12].map(x => px(x, 8, 1, 2)).join('')
  const legAnim = busy
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 .6;0 0" dur=".35s" repeatCount="indefinite"/>`
    : ''
  const arms =
    mood === 'ok'
      ? px(0, 2, 2, 1) + px(0, 3) + px(14, 2, 2, 1) + px(15, 3)
      : px(0, 5, 2, 1) + px(14, 5, 2, 1)
  const blink = busy ? '' : `<animate attributeName="height" values="2;2;2;.3;2" dur="4s" repeatCount="indefinite"/>`
  const eyes =
    kind === 'meditar'
      ? px(5, 5, 2, 0.4, INK) + px(10, 5, 2, 0.4, INK)
      : kind === 'thuglife' && mood !== 'err'
        ? px(4.5, 4, 3, 2.2, '#111111') + px(9.5, 4, 3, 2.2, '#111111') + px(7.5, 4.4, 2, 0.5, '#111111') +
          px(3, 4.4, 1.5, 0.5, '#111111') + px(12.5, 4.4, 1.5, 0.5, '#111111') +
          px(5, 4.3, 0.9, 0.5, '#6f6f6f') + px(10, 4.3, 0.9, 0.5, '#6f6f6f')
        : kind === 'cafe' && mood !== 'err' && mood !== 'think'
          ? [4.5, 9.5].map(ex => {
              const dx = look === 'left' ? 0 : look === 'right' ? 1 : 0.5
              const dy = look === 'up' ? 0 : look === 'down' ? 1 : 0.5
              return (
                `<rect x="${ex}" y="3.5" width="3" height="3" fill="#f5f4ed"/>` +
                `<rect x="${ex + dx}" y="${3.5 + dy}" width="2" height="2" fill="${INK}"/>` +
                `<rect x="${ex + dx + 0.3}" y="${3.5 + dy + 0.3}" width="0.5" height="0.5" fill="#f5f4ed"/>`
              )
            }).join('')
      : mood === 'err'
        ? px(5, 4, 1, 1, INK) + px(7, 4, 1, 1, INK) + px(6, 5, 1, 1, INK) + px(5, 6, 1, 1, INK) + px(7, 6, 1, 1, INK) +
          px(9, 4, 1, 1, INK) + px(11, 4, 1, 1, INK) + px(10, 5, 1, 1, INK) + px(9, 6, 1, 1, INK) + px(11, 6, 1, 1, INK)
        : mood === 'think'
          ? px(6, 4, 1, 2, INK) + px(10, 4, 1, 2, INK) + px(7, 4, 1, 1, INK)
          : [5, 10].map(ex => {
              const dx = look === 'left' ? 0 : look === 'right' ? 1 : 0.5
              const dy = look === 'up' ? 0 : look === 'down' ? 1 : 0.5
              const sweep = look === 'sweep' ? `<animate attributeName="x" values="${ex};${ex + 1};${ex}" dur="1.4s" repeatCount="indefinite"/>` : ''
              const sclera = `<rect x="${ex}" y="4" width="2" height="2" fill="#f5f4ed">${blink}</rect>`
              const pupil = `<rect x="${ex + dx}" y="${4 + dy}" width="1" height="1" fill="${INK}">${sweep}${busy ? '' : `<animate attributeName="height" values="1;1;1;.2;1" dur="4s" repeatCount="indefinite"/>`}</rect>`
              return sclera + pupil
            }).join('')
  const keys =
    mood === 'code'
      ? `<g fill="#7dd3fc"><rect x="3" y="10.5" width="1" height="1"><animate attributeName="opacity" values="1;0;1" dur=".3s" repeatCount="indefinite"/></rect><rect x="7" y="10.5" width="1" height="1"><animate attributeName="opacity" values="0;1;0" dur=".3s" repeatCount="indefinite"/></rect><rect x="11" y="10.5" width="1" height="1"><animate attributeName="opacity" values="1;0;1" dur=".45s" repeatCount="indefinite"/></rect></g>`
      : ''
  const fade = (dur: string, from: number, to: number) =>
    `<animate attributeName="opacity" values="${from};${to};${from}" dur="${dur}" repeatCount="indefinite"/>`
  const prop =
    mood === 'alert'
      ? px(7.5, 0, 1, 1.6, '#f5b73d') + px(7.5, 2, 1, 0.6, '#f5b73d')
      : kind === 'cafe'
        ? px(14, 3, 2, 2, '#f5f4ed') + px(14, 3, 2, 0.7, '#6b4423') +
          `<rect x="14.7" y="1.6" width="0.6" height="1" fill="#cfcfcf">${fade('1.2s', 0.2, 0.9)}</rect>`
        : kind === 'cigarro'
          ? px(0, 4, 2, 0.6, '#f5f4ed') + px(0, 4, 0.6, 0.6, '#ff6a3d') +
            `<rect x="0.2" y="2.6" width="0.6" height="1" fill="#9a9a9a">${fade('1.6s', 0.1, 0.8)}</rect>`
          : kind === 'meditar'
            ? px(12.5, 0.2, 3, 1.2, '#d64545') + px(13.2, 0.4, 0.6, 0.6, '#f5f4ed') + px(14.4, 0.6, 0.5, 0.5, '#f5f4ed') + px(13.2, 1.4, 1.1, 1.3, '#f5f4ed')
            : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" shape-rendering="crispEdges">${antennae}${body}${arms}<g>${legs}${legAnim}</g>${eyes}${keys}${prop}</svg>`
}

const MOODS = ['idle', 'think', 'read', 'code', 'run', 'search', 'ok', 'err', 'alert']
const MAX_X = 36

const PETS = ['Anotado. Continuo de olho.', 'Pode seguir, eu cuido do resto.', 'Presente.', 'Precisa de algo?', 'Tudo sob controle.']

const MODES: ModeKind[] = ['normal', 'cafe', 'cigarro', 'meditar', 'thuglife']
const MODE_LABEL: Record<ModeKind, string> = { normal: 'normal', cafe: 'café', cigarro: 'cigarro', meditar: 'meditar', thuglife: 'thug life' }
const MODE_LINE: Record<ModeKind, string> = {
  normal: 'Modo normal.',
  cafe: 'Café na mão. Pode mandar.',
  cigarro: 'Pausa de 10 min. Só aviso de erro ou risco.',
  meditar: 'Meditando. Só aviso de erro ou risco.',
  thuglife: 'Thug life. Sem pressa, sem drama.',
}
const BREAK_MS = 10 * 60 * 1000

// Em meditar e cigarro o Claudin só fala de erro ou risco; o resto vai só para o histórico.
async function speak($: any, mood: Mood, text: string, act: Action | null = null) {
  await update($, log, (l: string[]) => [...l, text].slice(-6))
  const m = await read($, mode)
  if ((m.kind === 'meditar' || m.kind === 'cigarro') && mood !== 'err' && mood !== 'alert') return
  await update($, action, () => act)
  await update($, say, (s: Say) => ({ mood, text, seq: s.seq + 1 }))
}

async function setMode($: any, kind: ModeKind) {
  const now = await $.clock.now()
  await update($, mode, () => ({ kind, until: kind === 'cigarro' ? now + BREAK_MS : 0 }))
  await update($, say, (s: Say): Say => ({ mood: 'idle', text: MODE_LINE[kind], seq: s.seq + 1 }))
}

// O Claudin só some de verdade com o mod descarregado. Em qualquer outro caso há caminho de volta:
// a faixa reaparece sozinha se o painel lateral não está de pé, e /claudin reposiciona os dois.
async function paneIsUp($: any) {
  try {
    return (await $.ui.panes()).some((p: any) => p.id === 'claudin' && p.isPlaced)
  } catch {
    return false
  }
}

// Põe o Claudin na faixa (side=false) ou no painel lateral (side=true). Se o painel não
// puder ser desenhado, cai para a faixa, para ele nunca ficar invisível.
async function placeClaudin($: any, side: boolean): Promise<'faixa' | 'lateral'> {
  await update($, isHidden, () => false)
  if (side) {
    const opened = await $.ui.open({ id: 'claudin', title: 'Claudin' })
    if (opened?.isPlaced) {
      await update($, isSide, () => true)
      return 'lateral'
    }
  }
  await update($, isSide, () => false)
  await $.ui.close({ id: 'claudin' })
  return 'faixa'
}

// Volta a ficar parado depois de um tempo sem novidade.
function settle($: any, seq: number, ms: number) {
  return $.clock.after(ms, async () => {
    const s = await read($, say)
    if (s.seq === seq) await update($, say, (x: Say): Say => ({ ...x, mood: 'idle', text: 'Aguardando.', seq: x.seq + 1 }))
  })
}

// Passeia pela faixa enquanto está parado.
async function stroll($: any) {
  await checkTimers($)
  await checkReminders($)
  const m = await read($, mode)
  if (m.kind === 'cigarro' && (await $.clock.now()) >= m.until) {
    await update($, mode, () => ({ kind: 'normal', until: 0 }))
    await update($, say, (s: Say): Say => ({ mood: 'ok', text: 'De volta.', seq: s.seq + 1 }))
    return
  }
  if (m.kind === 'meditar' || m.kind === 'cigarro') return
  const s = await read($, say)
  if (s.mood !== 'idle' && s.mood !== 'ok') return
  await update($, walk, (w: Walk) => {
    const x = w.x + w.dir * 3
    return x >= MAX_X ? { x: MAX_X, dir: -1 } : x <= 0 ? { x: 0, dir: 1 } : { x, dir: w.dir }
  })
}

// Timers: guardados em $.store com o instante de término, então sobrevivem a um recarregamento do mod.
async function loadTimers($: any) {
  const raw = await $.store.get('timers')
  const list: Timer[] = Array.isArray(raw)
    ? raw.filter((t: any) => t && typeof t.label === 'string' && typeof t.endsAt === 'number')
    : []
  await update($, timers, () => list)
}

async function saveTimers($: any, list: Timer[]) {
  await $.store.set('timers', list)
  await update($, timers, () => list)
}

async function startTimer($: any, label: string, minutes: number) {
  const now = await $.clock.now()
  const cur = await read($, timers)
  const id = `${now}-${Math.floor(Math.random() * 1e6)}`
  await saveTimers($, [...cur, { label, endsAt: now + minutes * 60000, ms: minutes * 60000, id }])
  await speak($, 'ok', `${label.charAt(0).toUpperCase()}${label.slice(1)} iniciado.`)
}

// A cada passo do relógio: dispara os timers vencidos (o aviso atravessa os modos silenciosos, é pedido do usuário)
// e redesenha o tempo restante enquanto houver timer ativo.
// Toca sounds/timer.wav. $.audio.play não toca no Windows, então usa o SoundPlayer do PowerShell, sem esperar o fim.
function playChime($: any) {
  const path = `${$.plugin.root}/sounds/timer.wav`.split("'").join("''")
  $.process
    .run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', `(New-Object Media.SoundPlayer '${path}').PlaySync()`], { timeoutMs: 15000 })
    .catch(() => {})
}

async function checkTimers($: any) {
  const cur = await read($, timers)
  const running = cur.filter(t => t.paused === undefined)
  if (running.length === 0) return
  const now = await $.clock.now()
  const due = running.filter(t => t.endsAt <= now)
  if (due.length === 0) {
    await update($, tick, () => now)
    return
  }
  let rest = cur.filter(t => !due.includes(t))
  for (const t of due) {
    playChime($)
    await speak($, 'alert', t.label.startsWith('pomodoro') ? `${t.label}: acabou.` : `⏰ ${t.label}: acabou.`)
    if (t.label.startsWith('pomodoro')) rest = [...rest, { label: 'pausa 5 min', endsAt: now + 5 * 60000, ms: 5 * 60000, id: `${now}-pausa` }]
  }
  await saveTimers($, rest)
}

// Tomatinho sendo espremido, em loop: o corpo achata e alarga, as folhas descem e o suco pinga.
const TOMATO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
<g>
<animateTransform attributeName="transform" type="translate" values="0 0;0 .9;0 0" dur=".9s" repeatCount="indefinite"/>
<path d="M7 2.2 L5 3.4 L3.6 2.8 L5.2 4.2 L7 3.6 L8.8 4.2 L10.4 2.8 L9 3.4 Z" fill="#3f9b3f"/>
</g>
<ellipse cx="7" cy="8.4" rx="5" ry="4.4" fill="#e0402f">
<animate attributeName="rx" values="5;6.3;5" dur=".9s" repeatCount="indefinite"/>
<animate attributeName="ry" values="4.4;3.3;4.4" dur=".9s" repeatCount="indefinite"/>
<animate attributeName="cy" values="8.4;9.2;8.4" dur=".9s" repeatCount="indefinite"/>
</ellipse>
<rect x="4" y="6.6" width="1.4" height="1" fill="#f08a7e"/>
<circle cx="7" cy="12.6" r=".6" fill="#e0402f"><animate attributeName="cy" values="11.5;13.6;11.5" dur=".9s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur=".9s" repeatCount="indefinite"/></circle>
</svg>`

// Duração original do timer; os guardados antes desta versão não têm `ms`, então lê os minutos do rótulo.
const durationOf = (t: Timer) => t.ms ?? (Number(/(\d+)\s*min/.exec(t.label)?.[1] ?? 0) * 60000)

async function cancelTimer($: any, id: string) {
  const cur = await read($, timers)
  const gone = cur.find(t => idOf(t) === id)
  await saveTimers($, cur.filter(t => idOf(t) !== id))
  if (gone) await speak($, 'idle', `${gone.label} cancelado.`)
}

async function restartTimer($: any, id: string) {
  const cur = await read($, timers)
  const t = cur.find(x => idOf(x) === id)
  const ms = t ? durationOf(t) : 0
  if (!t || ms <= 0) return
  const now = await $.clock.now()
  await saveTimers($, cur.map(x => (idOf(x) === id ? { ...x, id, endsAt: now + ms, ms, paused: undefined } : x)))
  await speak($, 'ok', `${t.label} reiniciado.`)
}

// Pausa guarda o tempo que falta; retomar recalcula o término a partir de agora.
async function pauseTimer($: any, id: string) {
  const cur = await read($, timers)
  const t = cur.find(x => idOf(x) === id)
  if (!t) return
  const now = await $.clock.now()
  const resume = t.paused !== undefined
  await saveTimers(
    $,
    cur.map(x =>
      idOf(x) !== id
        ? x
        : resume
          ? { ...x, id, endsAt: now + (x.paused ?? 0), paused: undefined }
          : { ...x, id, paused: Math.max(0, x.endsAt - now) },
    ),
  )
  await speak($, 'idle', `${t.label} ${resume ? 'retomado' : 'pausado'}.`)
}

// Prazos e datas importantes: guardados em $.store, com contagem regressiva em dias.
const pad2 = (n: number) => String(n).padStart(2, '0')
const dayStart = (ms: number) => {
  const d = new Date(ms)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}
const daysUntil = (date: string, nowMs: number) => {
  const [y, m, d] = date.split('-').map(Number)
  return Math.round((new Date(y!, m! - 1, d!).getTime() - dayStart(nowMs)) / 86400000)
}
const dayLabel = (n: number) => (n === 0 ? 'hoje' : n === 1 ? 'amanhã' : n < 0 ? `atrasado ${-n}d` : `D-${n}`)

// Aceita "2026-11-05 título", "05/11/2026 título", "05/11 título" (próxima ocorrência), "hoje" e "amanhã".
function parseDeadline(text: string, nowMs: number): { date: string; title: string } | null {
  const t = text.trim()
  const today = new Date(dayStart(nowMs))
  const fmt = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(.+)$/.exec(t)
  if (m) return valid(+m[1]!, +m[2]!, +m[3]!, m[4]!)
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(.+)$/.exec(t)
  if (m) return valid(+m[3]!, +m[2]!, +m[1]!, m[4]!)
  m = /^(\d{1,2})\/(\d{1,2})\s+(.+)$/.exec(t)
  if (m) {
    const first = valid(today.getFullYear(), +m[2]!, +m[1]!, m[3]!)
    if (first && daysUntil(first.date, nowMs) >= 0) return first
    return valid(today.getFullYear() + 1, +m[2]!, +m[1]!, m[3]!)
  }
  m = /^(hoje|amanhã|amanha)\s+(.+)$/i.exec(t)
  if (m) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (m[1]!.toLowerCase() === 'hoje' ? 0 : 1))
    return { date: fmt(d), title: m[2]! }
  }
  return null
  function valid(y: number, mo: number, d: number, title: string) {
    const dt = new Date(y, mo - 1, d)
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null
    return { date: fmt(dt), title }
  }
}

async function loadDeadlines($: any) {
  const raw = await $.store.get('deadlines')
  const list: Deadline[] = Array.isArray(raw)
    ? raw.filter((x: any) => x && typeof x.id === 'string' && typeof x.date === 'string' && typeof x.title === 'string')
    : []
  await update($, deadlines, () => list)
}

async function saveDeadlines($: any, list: Deadline[]) {
  await $.store.set('deadlines', list)
  await update($, deadlines, () => list)
}

async function addDeadline($: any, text: string) {
  const now = await $.clock.now()
  const parsed = parseDeadline(text, now)
  if (!parsed) return speak($, 'idle', 'Não entendi a data. Use 05/11 título ou 2026-11-05 título.')
  const cur = await read($, deadlines)
  await saveDeadlines($, [...cur, { id: `${now}-${Math.floor(Math.random() * 1e6)}`, ...parsed }])
  await update($, ddText, () => '')
  await speak($, 'ok', `Prazo salvo: ${parsed.title} (${dayLabel(daysUntil(parsed.date, now))}).`)
}

async function removeDeadline($: any, id: string) {
  const cur = await read($, deadlines)
  await saveDeadlines($, cur.filter(d => d.id !== id))
}

// Lembretes recorrentes: "09:00 título" (todo dia), "seg-sex 18:00 título" ou um dia ("qua 9h título").
const DAY_NAMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
const dayKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

function parseReminder(text: string): Omit<Reminder, 'id'> | null {
  const m = /^(?:(seg-sex|dom|seg|ter|qua|qui|sex|sab|sáb)\s+)?(\d{1,2})(?::(\d{2})|h(\d{2})?)\s+(.+)$/i.exec(text.trim())
  if (!m) return null
  const hh = +m[2]!
  const mm = +(m[3] ?? m[4] ?? 0)
  if (hh > 23 || mm > 59) return null
  const tag = (m[1] ?? '').toLowerCase().replace('sáb', 'sab')
  const days = tag === 'seg-sex' ? [1, 2, 3, 4, 5] : tag ? [DAY_NAMES.indexOf(tag)] : [0, 1, 2, 3, 4, 5, 6]
  return { hh, mm, days, title: m[5]! }
}

const daysLabel = (days: number[]) =>
  days.length === 7 ? 'todo dia' : days.join() === '1,2,3,4,5' ? 'seg-sex' : days.map(d => DAY_NAMES[d]).join(',')

async function loadReminders($: any) {
  const raw = await $.store.get('reminders')
  const list: Reminder[] = Array.isArray(raw)
    ? raw.filter((r: any) => r && typeof r.id === 'string' && typeof r.title === 'string' && Array.isArray(r.days))
    : []
  await update($, reminders, () => list)
}

async function saveReminders($: any, list: Reminder[]) {
  await $.store.set('reminders', list)
  await update($, reminders, () => list)
}

// Dispara o lembrete uma vez por dia, a partir da hora marcada. Se o app abrir depois da hora, ainda dispara no mesmo dia.
async function checkReminders($: any) {
  const cur = await read($, reminders)
  if (cur.length === 0) return
  const now = await $.clock.now()
  const d = new Date(now)
  const today = dayKey(d)
  const minutes = d.getHours() * 60 + d.getMinutes()
  const due = cur.filter(r => r.days.includes(d.getDay()) && minutes >= r.hh * 60 + r.mm && r.last !== today)
  if (due.length === 0) return
  for (const r of due) {
    const late = minutes - (r.hh * 60 + r.mm) > 5
    playChime($)
    await speak($, 'alert', `🔁 ${r.title}${late ? ` (era ${pad2(r.hh)}:${pad2(r.mm)})` : ''}`)
  }
  await saveReminders($, cur.map(r => (due.includes(r) ? { ...r, last: today } : r)))
}

// Uma entrada só: o texto vira lembrete (tem hora) ou prazo (tem data).
async function addEntry($: any, text: string) {
  const r = parseReminder(text)
  if (r) {
    const now = await $.clock.now()
    const cur = await read($, reminders)
    await saveReminders($, [...cur, { id: `${now}-${Math.floor(Math.random() * 1e6)}`, ...r }])
    await update($, ddText, () => '')
    await speak($, 'ok', `Lembrete salvo: ${pad2(r.hh)}:${pad2(r.mm)} ${daysLabel(r.days)} · ${r.title}.`)
    return
  }
  await addDeadline($, text)
}

async function removeReminder($: any, id: string) {
  const cur = await read($, reminders)
  await saveReminders($, cur.filter(r => r.id !== id))
}

// Saudação do dia: prazos atrasados, de hoje e de amanhã, lembretes de hoje e timers pausados. Uma vez por dia.
async function greetToday($: any, force: boolean) {
  const now = await $.clock.now()
  const d = new Date(now)
  const today = dayKey(d)
  if (!force && (await $.store.get('lastGreeting')) === today) return
  await $.store.set('lastGreeting', today)
  const dl = await read($, deadlines)
  const rm = await read($, reminders)
  const tm = await read($, timers)
  const over = dl.filter(x => daysUntil(x.date, now) < 0)
  const hoje = dl.filter(x => daysUntil(x.date, now) === 0)
  const amanha = dl.filter(x => daysUntil(x.date, now) === 1)
  const rToday = rm.filter(r => r.days.includes(d.getDay()))
  const paused = tm.filter(t => t.paused !== undefined)
  const names = (l: Deadline[]) => l.slice(0, 2).map(x => short(x.title, 18)).join(', ')
  const parts = [
    over.length ? `${over.length} atrasado${over.length > 1 ? 's' : ''} (${names(over)})` : '',
    hoje.length ? `hoje: ${names(hoje)}` : '',
    amanha.length ? `amanhã: ${names(amanha)}` : '',
    rToday.length ? `${rToday.length} lembrete${rToday.length > 1 ? 's' : ''} hoje` : '',
    paused.length ? `${paused.length} timer pausado` : '',
  ].filter(Boolean)
  if (parts.length === 0) {
    if (force) await speak($, 'idle', 'Nada pendente na agenda.')
    return
  }
  const hour = d.getHours()
  const hi = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  await speak($, over.length || hoje.length ? 'alert' : 'idle', `${hi}. ${parts.join(' · ')}.`)
}

const fmtLeft = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

// Lê sprites/<pose>.svg|png da pasta do mod; PNG vira <image> dentro de um SVG.
async function loadSprites($: any) {
  const found: Record<string, string> = {}
  for (const m of MOODS) {
    for (const ext of ['svg', 'png']) {
      const path = `${$.plugin.root}/sprites/${m}.${ext}`
      if (!(await $.fs.exists(path))) continue
      if (ext === 'svg') {
        found[m] = await $.fs.read(path)
      } else {
        const { base64 } = await $.fs.read(path, { as: 'bytes' })
        found[m] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><image href="data:image/png;base64,${base64}" width="64" height="48" preserveAspectRatio="xMidYMid meet" style="image-rendering:pixelated"/></svg>`
      }
      break
    }
  }
  await update($, sprites, () => found)
}

// Atalhos do usuário: shortcuts.json na pasta do mod, lista de { label, text }.
async function loadShortcuts($: any) {
  const path = `${$.plugin.root}/shortcuts.json`
  if (!(await $.fs.exists(path))) return
  try {
    const list = JSON.parse(await $.fs.read(path))
    const ok = Array.isArray(list) ? list.filter((x: any) => typeof x?.label === 'string' && typeof x?.text === 'string') : []
    await update($, extraShortcuts, () => ok.slice(0, 12))
  } catch {
    await update($, extraShortcuts, () => [])
  }
}

// Canivete "/": comandos que a pessoa pode rodar agora (internos, de plugins e de MCP) e favoritos guardados entre sessões.
async function loadCommands($: any) {
  const list = await $.command.list()
  await update($, cmds, () => list.slice(0, 400).map((c: any) => ({ name: String(c.name), description: String(c.description ?? '') })))
}

// Favoritos: os do usuário ficam em $.store. Na primeira vez, entram os de favorites-seed.json (uma vez só,
// para um favorito removido depois não voltar).
async function loadFavs($: any) {
  const raw = await $.store.get('favs')
  let list: string[] = Array.isArray(raw) ? raw.filter((x: unknown) => typeof x === 'string') : []
  if (!(await $.store.get('favsSeeded'))) {
    const path = `${$.plugin.root}/favorites-seed.json`
    if (await $.fs.exists(path)) {
      try {
        const seed = JSON.parse(await $.fs.read(path))
        if (Array.isArray(seed)) list = [...list, ...seed.filter((x: unknown) => typeof x === 'string' && !list.includes(x))]
      } catch {
        // seed inválido: segue sem ele
      }
    }
    await $.store.set('favs', list)
    await $.store.set('favsSeeded', true)
  }
  await update($, favs, () => list)
}

async function toggleFav($: any, name: string) {
  const cur = await read($, favs)
  const same = (f: string) => f === name || baseName(f) === baseName(name)
  const next = cur.some(same) ? cur.filter((n: string) => !same(n)) : [...cur, name]
  await $.store.set('favs', next)
  await update($, favs, () => next)
}

async function draw($: any, e: any, next: any) {
  if (e.props?.hasSurvey || (await read($, isHidden))) return next(e)
  const s = await read($, say)
  const custom = await read($, sprites)
  const quiet = await read($, isQuiet)
  const side = await read($, isSide)
  const isPane = e.component === 'Pane'
  if (side && !isPane && (await paneIsUp($))) return next(e)
  const size = SIZES[await read($, sizeIdx)] ?? SIZES[0]!
  const w = await read($, walk)
  const thoughts = await read($, log)
  const showLog = await read($, isLogOpen)
  const m = await read($, mode)
  const act = await read($, action)
  const open = await read($, boxOpen)
  const cat = await read($, boxCat)
  const page = await read($, boxPage)
  const allCmds = await read($, cmds)
  const q = await read($, query)
  const favList = await read($, favs)
  const activeTimers = await read($, timers)
  const dls = await read($, deadlines)
  const rems = await read($, reminders)
  const ddq = await read($, ddText)
  const nowDl = dls.length > 0 ? await $.clock.now() : 0
  const nowT = activeTimers.length > 0 ? (await read($, tick)) || (await $.clock.now()) : 0
  const extras = await read($, extraShortcuts)
  const cmd = await read($, lastCmd)
  const file = await read($, lastFile)
  const { Box, Text, Button, Svg, Input } = $.ui.resolve(e) as any
  const cols = typeof e.props?.bodyColumns === 'number' ? e.props.bodyColumns : 100
  const reserved = open ? TOOLBOX_W + 2 : 14
  const range = isPane ? PANE_RANGE : Math.max(0, cols - reserved - 32)
  const x = Math.round((w.x / MAX_X) * range)
  const colW = isPane ? undefined : Math.max(20, cols - reserved - x)
  const first = [...activeTimers].sort((a: Timer, b: Timer) => Number(a.paused !== undefined) - Number(b.paused !== undefined) || a.endsAt - b.endsAt)[0]
  const isPomo = (label: string) => label.startsWith('pomodoro')
  const tomato = Svg ? <Svg source={TOMATO} alt="tomate sendo espremido" width={20} height={20} isInteractive /> : <Text>🍅</Text>
  const timerRow = (t: Timer, key: string) => (
    <Box key={key} flexDirection="row" columnGap={1} alignItems="center">
      {isPomo(t.label) ? tomato : <Text>⏱</Text>}
      <Text dimColor={t.paused !== undefined}>
        {t.label} · {fmtLeft(t.paused !== undefined ? t.paused : t.endsAt - nowT)}
        {t.paused !== undefined ? ' (pausado)' : ''}
      </Text>
      <Button key={`${key}-p`} plain label={t.paused !== undefined ? '▶' : '⏸'} onPress={() => pauseTimer($, idOf(t))} />
      <Button key={`${key}-r`} plain label="↻" onPress={() => restartTimer($, idOf(t))} />
      <Button key={`${key}-x`} plain label="✕" onPress={() => cancelTimer($, idOf(t))} />
    </Box>
  )
  const glyph = { idle: '(•ᴗ•)', think: '(•_•?)', read: '(•‿•)📖', code: '⌨(•̀ᴗ•́)', run: '(•̀ᴗ•́)⚙', search: '(•ᴗ•)🔍', ok: '\\(^ᴗ^)/', err: '(x_x)', alert: '(•o•)!' }[s.mood as Mood]

  const pick = (c: string) => async () => {
    await update($, boxPage, () => 0)
    await update($, boxCat, () => c)
    if (c === 'comandos') await loadCommands($)
  }
  const fill = (text: string) => () => $.prompt.fill({ text, mode: 'replace' })

  type Item = { key: string; label: string; onPress: (p: any) => void; sep?: boolean; starred?: boolean; onStar?: () => void; onDelete?: () => void }
  const items: Item[] =
    cat === 'prompts'
      ? [...SHORTCUTS, ...extras].map((x, i) => ({ key: `sc${i}`, label: x.label, onPress: fill(x.text) }))
      : cat === 'acoes'
        ? [
            {
              key: 'a-cmd',
              label: 'copiar comando',
              onPress: async (p: any) => {
                if (!cmd) return speak($, 'idle', 'Ainda não rodei nenhum comando.')
                await $.ui.copy({ text: cmd, surface: p.surface })
                await speak($, 'ok', 'Comando copiado.')
              },
            },
            {
              key: 'a-file',
              label: 'copiar caminho',
              onPress: async (p: any) => {
                if (!file) return speak($, 'idle', 'Ainda não editei nenhum arquivo.')
                await $.ui.copy({ text: file, surface: p.surface })
                await speak($, 'ok', 'Caminho copiado.')
              },
            },
            {
              key: 'a-dir',
              label: 'abrir pasta',
              onPress: async () => {
                const dir = await $.session.cwd()
                await $.process.run(['explorer.exe', String(dir)])
                await speak($, 'ok', 'Pasta aberta.')
              },
            },
          ]
        : cat === 'ajustes'
          ? [
              { key: 'mode', label: `modo: ${MODE_LABEL[m.kind as ModeKind]}`, onPress: () => setMode($, MODES[(MODES.indexOf(m.kind as ModeKind) + 1) % MODES.length] ?? 'normal') },
              { key: 'size', label: `tamanho: ${size.label}`, onPress: () => update($, sizeIdx, (v: number) => (v + 1) % SIZES.length) },
              { key: 'sep1', label: '', sep: true, onPress: () => {} },
              { key: 'quiet', label: quiet ? 'ver tools' : 'ocultar tools', onPress: () => update($, isQuiet, (v: boolean) => !v) },
              { key: 'log', label: showLog ? 'fechar histórico' : 'histórico', onPress: () => update($, isLogOpen, (v: boolean) => !v) },
              { key: 'sep2', label: '', sep: true, onPress: () => {} },
              { key: 'greet', label: 'saudação do dia', onPress: () => greetToday($, true) },
              { key: 'pet', label: 'afagar', onPress: () => speak($, 'ok', PETS[Math.floor(Math.random() * PETS.length)] ?? 'Presente.') },
              {
                key: 'side',
                label: side ? '↔ prompt' : '↔ lateral',
                onPress: async () => {
                  const where = await placeClaudin($, !side)
                  if (!side && where === 'faixa') await speak($, 'alert', 'Sem espaço para o painel lateral; fiquei acima do prompt.')
                },
              },
            ]
          : cat === 'comandos'
            ? (() => {
                const favRank = (n: string) => {
                  const i = favList.findIndex(f => f === n || baseName(f) === baseName(n))
                  return i < 0 ? Number.MAX_SAFE_INTEGER : i
                }
                return dedupe(allCmds)
                  .filter(c => !q || `${c.name} ${c.description}`.toLowerCase().includes(q.toLowerCase()))
                  .sort((a, b) => favRank(a.name) - favRank(b.name))
                  .map(c => ({
                    key: `cmd-${c.name}`,
                    label: `/${c.name}`,
                    starred: favRank(c.name) !== Number.MAX_SAFE_INTEGER,
                    onStar: () => toggleFav($, c.name),
                    onPress: fill(`/${c.name} `),
                  }))
              })()
            : cat === 'tempo'
              ? [
                  { key: 't5', label: 'timer 5 min', onPress: () => startTimer($, 'timer 5 min', 5) },
                  { key: 't10', label: 'timer 10 min', onPress: () => startTimer($, 'timer 10 min', 10) },
                  { key: 't25', label: 'pomodoro 25 min', onPress: () => startTimer($, 'pomodoro 25 min', 25) },
                  { key: 't5b', label: 'pausa 5 min', onPress: () => startTimer($, 'pausa 5 min', 5) },
                  { key: 'tstop', label: 'parar todos', onPress: () => saveTimers($, []) },
                ]
              : cat === 'prazos'
                ? [
                    ...[...dls]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(d => {
                        const n = daysUntil(d.date, nowDl)
                        return {
                          key: `dl-${d.id}`,
                          label: `${n < 0 ? '🔴' : n <= 3 ? '🟡' : '🟢'} ${dayLabel(n)} · ${d.title}`,
                          onPress: () => {},
                          onDelete: () => removeDeadline($, d.id),
                        }
                      }),
                    ...[...rems]
                      .sort((a, b) => a.hh * 60 + a.mm - (b.hh * 60 + b.mm))
                      .map(r => ({
                        key: `rm-${r.id}`,
                        label: `🔁 ${pad2(r.hh)}:${pad2(r.mm)} ${daysLabel(r.days)} · ${r.title}`,
                        onPress: () => {},
                        onDelete: () => removeReminder($, r.id),
                      })),
                  ]
                : []

  const placeholder =
    cat === 'comandos' && items.length === 0 ? 'Nenhum comando encontrado.' : cat === 'prazos' && items.length === 0 ? 'Vazia. Prazo: 05/11 título. Lembrete: 09:00 título.' : ''

  // Menu em estilo mIRC: barra de menus em texto, divisória e lista vertical paginada, uma coluna.
  const size_ = cat === 'comandos' || cat === 'prazos' ? PAGE_CMD : PAGE
  const pages = Math.max(1, Math.ceil(items.length / size_))
  const pg = Math.min(page, pages - 1)
  const rows = items.slice(pg * size_, pg * size_ + size_)
  const line = '─'.repeat(TOOLBOX_W - 12)
  const body = (
    <Box flexDirection="column" alignItems="flex-start" width="100%">
      <Text dimColor>🧰 Caixa de ferramentas</Text>
      <Box flexDirection="row" columnGap={1}>
        {CATS.map(c => (
          <Button key={`cat-${c}`} plain label={c === cat ? `▸${CAT_LABEL[c] ?? c}` : ` ${CAT_LABEL[c] ?? c}`} onPress={pick(c)} />
        ))}
      </Box>
      <Text dimColor>{line}</Text>
      {cat === 'comandos' && Input ? (
        <Input
          key="q"
          placeholder="buscar comando…"
          value={q}
          onSubmit={() => items[0]?.onPress?.({})}
          onInput={(v: string) => {
            update($, query, () => v)
            update($, boxPage, () => 0)
          }}
        />
      ) : null}
      {cat === 'prazos' && Input ? (
        <Input
          key="dq"
          placeholder="05/11 prazo · 09:00 lembrete"
          value={ddq}
          onSubmit={(v: string) => addEntry($, typeof v === 'string' && v ? v : ddq)}
          onInput={(v: string) => update($, ddText, () => v)}
        />
      ) : null}
      {placeholder ? <Text dimColor>{placeholder}</Text> : null}
      {cat === 'tempo'
        ? activeTimers.slice(0, 2).map((t: Timer, i: number) => timerRow(t, `tm${i}`))
        : null}
      {rows.map(x =>
        x.sep ? (
          <Text key={x.key} dimColor>{line}</Text>
        ) : x.onStar ? (
          <Box key={x.key} flexDirection="row" columnGap={1}>
            <Button key={`${x.key}-star`} plain label={x.starred ? '★' : '☆'} onPress={x.onStar} />
            <Button key={x.key} plain label={x.label} onPress={x.onPress} />
          </Box>
        ) : x.onDelete ? (
          <Box key={x.key} flexDirection="row" columnGap={1}>
            <Text>{x.label}</Text>
            <Button key={`${x.key}-x`} plain label="✕" onPress={x.onDelete} />
          </Box>
        ) : (
          <Button key={x.key} plain label={`  ${x.label}`} onPress={x.onPress} />
        ),
      )}
      {pages > 1 ? (
        <Box key="pager" flexDirection="row" columnGap={2}>
          {pg > 0 ? <Button key="prev" plain label="‹ anterior" onPress={() => update($, boxPage, () => pg - 1)} /> : <Text dimColor>‹ anterior</Text>}
          <Text dimColor>{pg + 1}/{pages}</Text>
          {pg < pages - 1 ? <Button key="next" plain label="próxima ›" onPress={() => update($, boxPage, () => pg + 1)} /> : <Text dimColor>próxima ›</Text>}
        </Box>
      ) : null}
    </Box>
  )

  const toolbox = (
    <Box key="toolbox" flexDirection="column" alignItems="flex-end" {...(isPane ? { alignSelf: 'flex-end' } : { position: 'absolute', top: 0, right: 0, width: TOOLBOX_W })}>
      <Button key="tb" label={open ? '✕' : '🧰'} onPress={() => update($, boxOpen, (v: boolean) => !v)} />
      {open ? (
        <Box flexDirection="column" borderStyle="round" borderColor="subtle" marginTop={1} paddingX={1} width={isPane ? undefined : TOOLBOX_W} height={isPane ? undefined : 10} overflow="hidden" alignItems="flex-start">
          {body}
        </Box>
      ) : null}
    </Box>
  )

  return (
    <Box flexDirection={isPane ? 'column' : 'row'} alignItems="flex-start" width="100%" minHeight={!isPane && open ? 13 : undefined}>
      <Box key="claudin" flexDirection="column" marginLeft={x} width={colW} alignItems="flex-start">
        <Box borderStyle="round" borderColor={BORDER[s.mood] ?? 'subtle'} paddingX={1}>
          {showLog ? (
            <Box flexDirection="column">
              {thoughts.map((t: string, i: number) => (
                <Text key={`t${i}`} dimColor>· {t}</Text>
              ))}
            </Box>
          ) : (
            <Box flexDirection="column">
              <Box flexDirection="row" columnGap={1} alignItems="center">
                {/pomodoro/i.test(s.text) && s.mood === 'alert' ? tomato : null}
                <Text dimColor={s.mood === 'idle'} color={s.mood === 'err' ? 'error' : s.mood === 'alert' ? 'warning' : undefined}>{s.text}</Text>
              </Box>
              {first ? timerRow(first, 'bt') : null}
              {act ? (
                <Button
                  key="act"
                  label={act.label}
                  onPress={async () => {
                    await $.prompt.fill({ text: act.text, mode: 'replace' })
                    await update($, action, () => null)
                  }}
                />
              ) : null}
            </Box>
          )}
        </Box>
        <Text dimColor>  ╰▾</Text>
        {Svg ? (
          <Svg source={custom[s.mood] ?? sprite(s.mood, m.kind, lookFor(s.mood as Mood, w.dir, open))} alt="Claudin, o mascote" width={size.w} height={size.h} isInteractive />
        ) : (
          <Text color={CORAL}>{glyph}</Text>
        )}
      </Box>
      {toolbox}
    </Box>
  )
}

async function hideRow($: any, e: any, next: any) {
  if (await read($, isQuiet)) {
    const { Box } = $.ui.resolve(e) as any
    return <Box />
  }
  return next(e)
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    await update($, turn, () => ({ files: [], cmds: 0, errors: 0 }))
    await speak($, 'think', 'Analisando.')
    return next(e)
  })

  on('tool.call', async ($, e: any, next) => {
    const t = e.tool as string
    const line: [Mood, string] =
      t === 'Read' ? ['read', `Lendo ${base(e.file_path)}.`]
      : t === 'Edit' || t === 'Write' ? ['code', `Editando ${base(e.file_path)}.`]
      : t === 'Bash' ? ['run', `Rodando: ${short(e.command, 30)}`]
      : t === 'Grep' || t === 'Glob' ? ['search', `Buscando ${short(e.pattern, 24)}.`]
      : t === 'WebSearch' || t === 'WebFetch' ? ['search', 'Pesquisando na web.']
      : t === 'Agent' ? ['think', 'Subagente em campo.']
      : ['run', `Usando ${t}.`]
    const target = t === 'Bash' ? short(e.command, 30) : base(e.file_path) || t
    const isRisky = t === 'Bash' && typeof e.command === 'string' && RISKY.test(e.command)
    if (isRisky) {
      await speak($, 'alert', `Cuidado: ${short(e.command, 40)} pode apagar ou sobrescrever coisas. Confira antes de aprovar.`)
    } else {
      await speak($, line[0], line[1])
    }
    if (t === 'Bash' && typeof e.command === 'string') await update($, lastCmd, () => e.command)
    if ((t === 'Edit' || t === 'Write') && e.file_path) await update($, lastFile, () => e.file_path)
    await update($, turn, (s: TurnStats) => ({
      files: (t === 'Edit' || t === 'Write') && e.file_path && !s.files.includes(e.file_path) ? [...s.files, e.file_path] : s.files,
      cmds: t === 'Bash' ? s.cmds + 1 : s.cmds,
      errors: s.errors,
    }))
    const slow = $.clock.after(SLOW_MS, () => {
      speak($, 'run', `Ainda rodando: ${target} (${SLOW_MS / 1000} s+).`)
    })
    const ran: any = await next(e)
    slow.cancel()
    if (ran && (ran.isError === true || ran.deny !== undefined)) {
      await update($, turn, (s: TurnStats) => ({ ...s, errors: s.errors + 1 }))
      await speak($, 'err', `Falhou: ${t === 'Bash' ? short(e.command, 28) : `${t} ${target}`}. Quer que eu investigue?`, {
        label: 'investigar',
        text: `Investigue por que falhou: ${t === 'Bash' ? e.command : `${t} em ${e.file_path ?? ''}`}. Explique a causa e proponha o próximo passo.`,
      })
    }
    return ran
  })

  on('session.compact', async ($, e, next) => {
    await speak($, 'think', 'Compactando a sessão.')
    return next(e)
  })

  on('turn.complete', async ($, e: any, next) => {
    const ok = e.reason === 'answer'
    const st = await read($, turn)
    const parts = [
      st.files.length ? `${st.files.length} arquivo${st.files.length > 1 ? 's' : ''} editado${st.files.length > 1 ? 's' : ''}` : '',
      st.cmds ? `${st.cmds} comando${st.cmds > 1 ? 's' : ''}` : '',
      st.errors ? `${st.errors} falha${st.errors > 1 ? 's' : ''}` : '',
    ].filter(Boolean)
    const summary = parts.length ? `Pronto: ${parts.join(', ')}.` : 'Pronto. Nada a reportar.'
    const next1: Action | null =
      st.errors > 0
        ? { label: 'investigar falhas', text: 'Houve falhas neste turno. Resuma o que falhou e proponha como corrigir.' }
        : st.files.length > 0
          ? { label: 'rodar testes', text: 'Rode os testes do projeto e me diga o resultado.' }
          : null
    await speak(
      $,
      ok ? (st.errors ? 'err' : 'ok') : 'err',
      ok ? summary : e.reason === 'aborted' ? 'Interrompido.' : 'O turno terminou com erro.',
      ok ? next1 : null,
    )
    const s = await read($, say)
    settle($, s.seq, 20000)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, draw)
  on('ui.render', { component: 'Pane', requestId: 'claudin' }, draw)

  on('ui.render', { component: 'ToolUse' }, hideRow)
  on('ui.render', { component: 'ToolResult' }, hideRow)
  on('ui.render', { component: 'ToolGroup' }, hideRow)
  on('ui.render', { component: 'ToolProgress' }, hideRow)
  on('ui.render', { component: 'Spinner' }, hideRow)

  // Fechar o painel pelo X da janela devolve o Claudin à faixa.
  on('ui.close', { id: 'claudin' }, async ($, e: any, next) => {
    if (e.origin?.kind === 'person') await update($, isSide, () => false)
    return next(e)
  })

  // /claudin: traz o Claudin de volta, onde ele estiver sumido.
  on('command.run', { command: 'claudin' }, async ($, e: any) => {
    const arg = String(e.args ?? '').trim().toLowerCase()
    if (arg === 'ocultar' || arg === 'esconder') {
      await update($, isHidden, () => true)
      await $.ui.close({ id: 'claudin' })
      return { text: 'Claudin oculto. /claudin traz ele de volta.' }
    }
    if (arg === 'lateral') {
      const where = await placeClaudin($, true)
      return { text: where === 'lateral' ? 'Claudin no painel lateral.' : 'Sem espaço para o painel lateral; Claudin ficou acima do prompt.' }
    }
    if (arg === '' || arg === 'prompt' || arg === 'faixa') {
      const where = await placeClaudin($, arg === '' && (await read($, isSide)))
      return { text: where === 'lateral' ? 'Claudin de volta no painel lateral.' : 'Claudin de volta acima do prompt.' }
    }
    return { text: 'Uso: /claudin [lateral | prompt | ocultar]. Sem argumento, traz o Claudin de volta onde estava.' }
  })

  on('session.start', async ($, e, next) => {
    $.ui.status(undefined)
    await $.command.register({ name: 'claudin', description: 'Traz o Claudin de volta (lateral, prompt ou ocultar)', argumentHint: '[lateral|prompt|ocultar]' })
    if (await read($, isSide)) await placeClaudin($, true)
    await loadSprites($)
    await loadShortcuts($)
    await loadFavs($)
    await loadTimers($)
    await loadDeadlines($)
    await loadReminders($)
    await greetToday($, false)
    await loadCommands($)
    $.clock.every(1500, () => stroll($))
    return next(e)
  })
}
