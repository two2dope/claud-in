import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Action, CofreView, ColaView, FleetRow, Mode, ModeKind, Mood, Say, TurnStats, Walk } from '../types'
import { tabLabel } from './abas'
import { COLA_FILE, flattenCola, parseCatalogo, withClaudin } from './cola'
import { QG_ART } from './cenario-arte'
import { SPOTS, STATIONS, composeQg, pct, pomodoroOf, stationCol, withOutline, type Panel } from './cenario'
import { CONTEXT_PRESETS, DEFAULT_PRESET, contextLevel, contextLine, contextWarn, presetById, readPercent } from './contexto'
import { CORAL, SKINS, lookFor, sprite } from './desenho'
import { MINI_KINDS, parseFleetMap, pickMinis } from './minis'
import { VECTOR_ICON, VECTOR_SIDE } from './icones-vetor'
import { miniSvg } from './minis-arte'
import { COFRE_FILE, HOT_FILE, NOTES_DIR, isSafeNoteName, PENDING_FILE, countPending, freeNoteName, noteFileStem, healthNotes, hotLine, mergeDeadlines, parseHot, parseHotDeadlines, parseHotLists, resolveCofre } from './cofre'
import { FLEET_MAX_ROWS, clip, failSay, finish, liveCount, orderRows, reconcile, revive, rowLine, shouldSaySpawn, spawnSay, summaryLine, upsert } from './frota'

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
  { w: 64, h: 48, label: 'médio' },
  { w: 44, h: 33, label: 'pequeno' },
  { w: 84, h: 63, label: 'grande' },
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
const FLEET_CAT = 'frota' // a aba só aparece enquanto há agentes, para não alargar o menu à toa
const COFRE_CAT = 'cofre' // a aba só aparece com o cofre ligado
const SOBRE_CAT = 'sobre' // aba escondida: só a placa de madeira do QG abre
const REPO_URL = 'https://github.com/two2dope/claud-in'
const VERSION = '0.8.1' // igual ao plugin.json (um teste confere)
const CAT_LABEL: Record<string, string> = { prompts: 'Prompts', acoes: 'Ações', comandos: 'Comandos', ajustes: 'Ajustes', tempo: 'Tempo', prazos: 'Agenda', frota: 'Frota', cofre: 'Cofre' }
const SHORTCUTS: { label: string; text: string }[] = [
  { label: 'resumir', text: 'Resuma em poucas linhas o que você fez até agora.' },
  { label: 'explicar erro', text: 'Explique o último erro que apareceu e proponha o próximo passo.' },
  { label: 'rodar testes', text: 'Rode os testes do projeto e me diga o resultado.' },
  { label: 'próximo passo', text: 'Qual é o próximo passo mais útil agora? Responda em uma frase.' },
]
const TOOLBOX_W = 56
// Cores da caixa no painel lateral, como na ilustração do README.
const CHIP_BG = '#2b2b2b'
// Ícone em vetor (o mesmo desenho dos ícones do QG) das fichas da caixa e dos botões da antena e da caixa.
const CHIP_ART: Record<string, string> = { comandos: 'cola' }
const chipSvg = (id: string): string => {
  const art = VECTOR_ICON[CHIP_ART[id] ?? id]
  return art ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VECTOR_SIDE} ${VECTOR_SIDE}" width="22" height="22">${art}</svg>` : ''
}
const ROW_BG = '#242424'
const ROW_HOVER = '#303030'
// Recheio invisível de uma zona do QG: linhas de espaços duros, maiores que qualquer zona (a zona corta o excesso),
// para o clique pegar em todo o retângulo do objeto e não só numa letra.
// Pontos do QG, da esquerda para a direita. Cada um ganha uma coluna que vai do meio do caminho até o vizinho da
// esquerda ao meio do caminho até o da direita (as colunas não se cruzam). Dentro dela o ícone é ancorado por
// porcentagem no ponto marcado, e não por célula inteira: assim ele não pula de lugar quando a janela muda de largura.
// Pontos quase na mesma vertical (o relógio e a porta, o quadro da lua e o cofre) dividem uma coluna, com uma âncora
// para cada: coluna estreita demais arredonda para 0% e o botão some.
type IconCol = { id: string; spots: typeof SPOTS; cx: number; b: [number, number] }
const ICON_COLS: IconCol[] = (() => {
  const groups: (typeof SPOTS)[] = []
  for (const sp of [...SPOTS].sort((a, b) => a.cx - b.cx)) {
    const last = groups[groups.length - 1]
    if (last && sp.cx - last[last.length - 1]!.cx < 0.02) last.push(sp)
    else groups.push([sp])
  }
  const cx = groups.map(g => g.reduce((t, s) => t + s.cx, 0) / g.length)
  return groups.map((g, i) => ({ id: g[0]!.id, spots: g, cx: cx[i]!, b: [i === 0 ? 0 : (cx[i - 1]! + cx[i]!) / 2, i === groups.length - 1 ? 1 : (cx[i]! + cx[i + 1]!) / 2] }))
})()
// Altura de uma linha do painel em fração da altura da faixa: a faixa tem 76/360 da largura, e uma linha mede ~2,2
// células de largura. Serve para centrar o ícone na vertical no ponto marcado.
const rowFrac = (cols: number) => (2.2 * 360) / (76 * Math.max(20, cols))
const PAGE = 4
const PAGE_CMD = 3
const PANE_RANGE = 14
const extraShortcuts = atom({ plugin: 'claudin', key: 'extraShortcuts' } as const, [] as Action[])
const lastCmd = atom({ plugin: 'claudin', key: 'lastCmd' } as const, '')
const lastFile = atom({ plugin: 'claudin', key: 'lastFile' } as const, '')
const turn = atom({ plugin: 'claudin', key: 'turn' } as const, { files: [], cmds: 0, errors: 0, agents: 0 } as TurnStats)
const fleet = atom({ plugin: 'claudin', key: 'fleet' } as const, [] as FleetRow[])
// Caminho do cofre (só leitura), ou null com o recurso desligado.
const cofre = atom({ plugin: 'claudin', key: 'cofre' } as const, null as string | null)
// Prazos lidos do _hot do cofre: espelho só de leitura, sem gravar de volta (ids começam com "cofre:").
// Vista da aba Cofre: o que o _hot diz hoje, já em texto curto. null até a primeira leitura.
const cofreView = atom({ plugin: 'claudin', key: 'cofreView' } as const, null as CofreView | null)
// Cola da Oficina (só leitura): caminho do catalogo.json em <config>/claudin/cola.json, ou null com a aba desligada.
// Fica dentro de Comandos: o botão 📋 ao lado da busca alterna para a lista da oficina. A vista é relida toda vez que abre, então a oficina pode crescer sem reiniciar.
const cola = atom({ plugin: 'claudin', key: 'cola' } as const, null as string | null)
const colaView = atom({ plugin: 'claudin', key: 'colaView' } as const, null as ColaView | null)
const colaQuery = atom({ plugin: 'claudin', key: 'colaQuery' } as const, '')
const colaOpen = atom({ plugin: 'claudin', key: 'colaOpen' } as const, false)
const colaGroup = atom({ plugin: 'claudin', key: 'colaGroup' } as const, '') // plugin aberto na lista (um de cada vez)
// Janela de contexto: a última leitura (porcentagem) e o nível já avisado, para avisar uma vez por nível.
const ctxPct = atom({ plugin: 'claudin', key: 'ctxPct' } as const, null as number | null)
const ctxLevel = atom({ plugin: 'claudin', key: 'ctxLevel' } as const, 0)
// Faixa dos avisos de contexto (id de CONTEXT_PRESETS), escolhida em Ajustes e guardada em $.store.
const ctxPreset = atom({ plugin: 'claudin', key: 'ctxPreset' } as const, DEFAULT_PRESET)
// QG do Claudin no Mangue: a faixa de pixel art acima do mascote, ligada pelo botão 📡 (guardada em $.store).
const cenario = atom({ plugin: 'claudin', key: 'cenario' } as const, false)
// Interruptor da lanterna do QG: true apaga a luz da sala (guardado em $.store).
const lightsOff = atom({ plugin: 'claudin', key: 'lightsOff' } as const, false)
// Segundo interruptor do QG: o modo neon (guardado em $.store).
const neonOn = atom({ plugin: 'claudin', key: 'neonOn' } as const, false)
// O que os monitores mostram, lido do engine nos eventos (início, envio, fim de turno) e não a cada desenho.
const panelInfo = atom({ plugin: 'claudin', key: 'panelInfo' } as const, null as Panel | null)
// Skins: o padrão é a Mangue. 'classico' é o Claudin chapado de antes (e o único que usa os sprites soltos do usuário).
// Pastas sprites/<skin>/<pose>.svg do usuário viram skins de arte própria. A escolha fica em $.store.
const DEFAULT_SKIN = 'mangue'
const CLASSIC_SKIN = 'classico'
const skin = atom({ plugin: 'claudin', key: 'skin' } as const, DEFAULT_SKIN)
const skinArt = atom({ plugin: 'claudin', key: 'skinArt' } as const, {} as Record<string, string>)
// Miniaturas da frota: arte por criatura (sprites/frota/<criatura>) e o mapa tipo -> criatura do usuário (fleet-map.json).
const miniArt = atom({ plugin: 'claudin', key: 'miniArt' } as const, {} as Record<string, string>)
const fleetMap = atom({ plugin: 'claudin', key: 'fleetMap' } as const, {} as Record<string, string>)
const MINI_ROLE: Record<string, string> = { siri: 'explorar', garca: 'planejar', guaiamum: 'executar', aratu: 'revisar', caranguejinho: 'outros' }
const skinNames = atom({ plugin: 'claudin', key: 'skinNames' } as const, [] as string[])
const noteText = atom({ plugin: 'claudin', key: 'noteText' } as const, '')
const NOTE_MAX = 4000
const cofreDeadlines = atom({ plugin: 'claudin', key: 'cofreDeadlines' } as const, [] as Deadline[])

// Comandos que merecem um aviso antes de rodar. Lista curta; não substitui as permissões do app.
const RISKY = /\brm\s+(-[a-z]*r|-[a-z]*f)|git\s+push\b.*(--force|\s-f\b)|git\s+reset\s+--hard|git\s+clean\s+-[a-z]*f|drop\s+(table|database)|remove-item\b.*-recurse|\bdel\s+\/[sq]|\bformat\s+[a-z]:|mkfs|:\(\)\s*\{/i
const SLOW_MS = 30000

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

const MOODS = ['idle', 'think', 'read', 'code', 'run', 'search', 'ok', 'err', 'alert']
const MAX_X = 36
// No QG o passeio cobre a sala inteira: walk.x (0 a MAX_X) vira a fração SCENE_X0 + SCENE_SPAN * x / MAX_X da faixa.
const SCENE_X0 = 0.08
const SCENE_SPAN = 0.84
// Trabalhando, o Claudin vai até o canto da sala que combina com o que faz (fração da largura da faixa).
const SCENE_AT: Partial<Record<Mood, number>> = { code: 0.44, run: 0.776, read: 0.27, search: 0.6, think: 0.66, alert: 0.84 }

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
// Devolve true quando a fala saiu; nos modos calmos só erro e alerta falam, o resto fica só no histórico.
async function speak($: any, mood: Mood, text: string, act: Action | null = null): Promise<boolean> {
  await update($, log, (l: string[]) => [...l, text].slice(-6))
  const m = await read($, mode)
  if ((m.kind === 'meditar' || m.kind === 'cigarro') && mood !== 'err' && mood !== 'alert') return false
  await update($, action, () => act)
  await update($, say, (s: Say) => ({ mood, text, seq: s.seq + 1 }))
  return true
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

// Frota de subagentes. As linhas vêm dos eventos (rápidos) e são conferidas com $.agent.list() a cada tique.
// Uma falha é dita uma única vez por agente (`told`); um agente interrompido pela pessoa não é falha a dizer.
const told = new Set<string>()
let lastSpawnSayAt = -Infinity

async function commitFleet($: any, fn: (rows: FleetRow[]) => FleetRow[]) {
  await update($, fleet, (rows: FleetRow[]) => fn(rows))
  const rows = await read($, fleet)
  for (const r of rows) {
    if (r.state !== 'failed' || told.has(r.id)) continue
    told.add(r.id)
    const f = failSay(r)
    await speak($, 'err', f.text, f.action)
  }
  for (const id of told) if (!rows.some(r => r.id === id)) told.delete(id)
}

async function syncFleet($: any) {
  try {
    let listed: any[] | null = null
    try {
      listed = await $.agent.list()
    } catch {
      listed = null // sem lista (sem sessão ligada, por exemplo): só a idade das linhas manda
    }
    const now = await $.clock.now()
    await commitFleet($, rows => reconcile(rows, listed, now))
  } catch {
    // um erro da frota nunca pode parar o resto do tique do Claudin
  }
}

// Volta a ficar parado depois de um tempo sem novidade. Com agente vivo, espera mais um intervalo:
// o Claudin só descansa quando a frota esvazia.
function settle($: any, seq: number, ms: number) {
  return $.clock.after(ms, async () => {
    const s = await read($, say)
    if (s.seq !== seq) return
    if (liveCount(await read($, fleet)) > 0) {
      settle($, seq, ms)
      return
    }
    await update($, say, (x: Say): Say => ({ ...x, mood: 'idle', text: 'Aguardando.', seq: x.seq + 1 }))
  })
}

// Passeia pela faixa enquanto está parado.
async function stroll($: any) {
  await checkTimers($)
  await checkReminders($)
  await syncFleet($)
  const m = await read($, mode)
  if (m.kind === 'cigarro' && (await $.clock.now()) >= m.until) {
    await update($, mode, () => ({ kind: 'normal', until: 0 }))
    await update($, say, (s: Say): Say => ({ mood: 'ok', text: 'De volta.', seq: s.seq + 1 }))
    return
  }
  if (m.kind === 'meditar' || m.kind === 'cigarro') return
  const s = await read($, say)
  // No QG o Claudin anda até um objetivo: o canto do que está fazendo ou o objeto clicado. Chegando, fica um pouco.
  if (await read($, cenario)) {
    const at = SCENE_AT[s.mood as Mood]
    const workGoal = at === undefined ? undefined : Math.round(((at - SCENE_X0) / SCENE_SPAN) * MAX_X)
    if (workGoal === undefined && s.mood !== 'idle' && s.mood !== 'ok') return
    await update($, walk, (w: Walk): Walk => stepToward(w, workGoal ?? w.goal))
    return
  }
  if (s.mood !== 'idle' && s.mood !== 'ok') return
  await update($, walk, (w: Walk) => {
    const x = w.x + w.dir * 3
    return x >= MAX_X ? { x: MAX_X, dir: -1 } : x <= 0 ? { x: 0, dir: 1 } : { x, dir: w.dir }
  })
}

// Um passo no QG: rumo ao objetivo (mais ligeiro), parado um tempo ao chegar, ou passeando de borda a borda.
function stepToward(w: Walk, goal: number | undefined): Walk {
  if (goal !== undefined) {
    const d = goal - w.x
    if (Math.abs(d) <= 4) return { x: goal, dir: w.dir, rest: 6 } // chegou: fica uns 9 s de frente para o objeto
    return { x: w.x + Math.sign(d) * 4, dir: Math.sign(d), goal }
  }
  if ((w.rest ?? 0) > 0) return { x: w.x, dir: w.dir, rest: (w.rest ?? 0) - 1 }
  const x = w.x + w.dir * 2
  return x >= MAX_X ? { x: MAX_X, dir: -1 } : x <= 0 ? { x: 0, dir: 1 } : { x, dir: w.dir }
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
  if (cur.some(d => d.date === parsed.date && d.title.trim().toLowerCase() === parsed.title.trim().toLowerCase())) {
    await update($, ddText, () => '')
    return speak($, 'idle', 'Esse prazo já está na Agenda.')
  }
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

// Lê, só leitura, o que o cofre tem hoje: o texto do _hot (ou null) e quantos itens abertos a fila tem (ou null).
async function readCofreFiles($: any): Promise<{ root: string; hot: string | null; pending: number | null } | null> {
  const root = await read($, cofre)
  if (!root) return null
  let hot: string | null = null
  let pending: number | null = null
  try {
    const hf = `${root}/${HOT_FILE}`
    if (await $.fs.exists(hf)) hot = String(await $.fs.read(hf))
  } catch {
    hot = null
  }
  try {
    const pf = `${root}/${PENDING_FILE}`
    if (await $.fs.exists(pf)) pending = countPending(String(await $.fs.read(pf)))
  } catch {
    pending = null
  }
  return { root, hot, pending }
}

async function loadCofreDeadlines($: any) {
  const c = await readCofreFiles($)
  if (!c || c.hot === null) return update($, cofreDeadlines, () => [])
  try {
    const today = dayKey(new Date(await $.clock.now()))
    const list = parseHotDeadlines(c.hot, today)
    await update($, cofreDeadlines, () => list.map((d, i) => ({ id: `cofre:${d.date}:${i}`, date: d.date, title: d.title })))
  } catch {
    await update($, cofreDeadlines, () => [])
  }
}

// Vista da aba Cofre: próximo passo, urgentes, fios e avisos de saúde, lidos do _hot e da fila.
async function loadCofreView($: any) {
  const c = await readCofreFiles($)
  if (!c) return update($, cofreView, () => null)
  if (c.hot === null) return update($, cofreView, () => ({ hasHot: false, next: null, urgent: [], fios: [], notes: [] }))
  try {
    const today = dayKey(new Date(await $.clock.now()))
    const hot = parseHot(c.hot)
    const lists = parseHotLists(c.hot)
    await update($, cofreView, () => ({ hasHot: true, next: hot.next, urgent: lists.urgent, fios: lists.fios, notes: healthNotes(hot, today, c.pending) }))
  } catch {
    await update($, cofreView, () => ({ hasHot: false, next: null, urgent: [], fios: [], notes: [] }))
  }
}

// Captura rápida: cria UM arquivo novo em <cofre>/Raw/Notas. É a única escrita do Claudin no cofre: nunca edita
// nem apaga, e não mexe no _pending nem no selo (o ciclo diário enfileira e sela).
let capturing = false
async function captureNote($: any, raw: string) {
  const root = await read($, cofre)
  const text = raw.trim()
  if (!root || !text || capturing) return
  capturing = true // dois envios seguidos não podem escolher o mesmo nome
  try {
    const today = dayKey(new Date(await $.clock.now()))
    const dir = `${root}/${NOTES_DIR}`
    const name = await freeNoteName(noteFileStem(text, today), (n: string) => $.fs.exists(`${dir}/${n}`))
    if (!name || !isSafeNoteName(name)) {
      await speak($, 'err', 'Não achei um nome seguro para a nota.')
      return
    }
    await update($, noteText, () => '')
    await $.fs.write(`${dir}/${name}`, `${text.slice(0, NOTE_MAX)}\n`)
    await speak($, 'ok', `Nota guardada no cofre: ${short(name, 30)}.`)
  } catch {
    await speak($, 'err', 'Não consegui guardar a nota no cofre.')
  } finally {
    capturing = false
  }
}

// Frase do cofre na saudação: próximo passo e urgentes do _hot, mais avisos de saúde. Sem o que dizer: nada, em silêncio.
async function cofreHotLine($: any, today: string): Promise<string> {
  try {
    const c = await readCofreFiles($)
    if (!c || c.hot === null) return ''
    const hot = parseHot(c.hot)
    return hotLine(hot, healthNotes(hot, today, c.pending)) ?? ''
  } catch {
    return ''
  }
}

// Saudação do dia: prazos atrasados, de hoje e de amanhã, lembretes de hoje e timers pausados. Uma vez por dia.
async function greetToday($: any, force: boolean) {
  const now = await $.clock.now()
  const d = new Date(now)
  const today = dayKey(d)
  if (!force && (await $.store.get('lastGreeting')) === today) return
  const local = await read($, deadlines)
  const dl = mergeDeadlines(local, await read($, cofreDeadlines))
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
    await cofreHotLine($, today),
  ].filter(Boolean)
  if (parts.length === 0) {
    await $.store.set('lastGreeting', today)
    if (force) await speak($, 'idle', 'Nada pendente na agenda.')
    return
  }
  const hour = d.getHours()
  const hi = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  // O alerta vem só dos prazos digitados no Claudin; um prazo do cofre (espelho) não fura meditar nem cigarro.
  const urgent = local.some(x => daysUntil(x.date, now) <= 0)
  const spoken = await speak($, urgent ? 'alert' : 'idle', `${hi}. ${parts.join(' · ')}.`)
  // Saudação engolida por um modo calmo não conta como dada: volta na próxima sessão.
  if (spoken) await $.store.set('lastGreeting', today)
}

const fmtLeft = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

// Lê sprites/<pose>.svg|png da pasta do mod; PNG vira <image> dentro de um SVG.
// Onde moram os dados do usuário: fora da pasta do plugin, que uma atualização substitui. É <config>/claudin,
// com <config> = CLAUDE_CONFIG_DIR ou, sem ele, ~/.claude. Arquivo ali vence o que o plugin traz.
const trimEnd = (p: string) => p.split(String.fromCharCode(92)).join('/').replace(/\/+$/, '')
async function userDir($: any): Promise<string | null> {
  try {
    const cfg = await $.env.get('CLAUDE_CONFIG_DIR')
    if (cfg) return `${trimEnd(cfg)}/claudin`
    const home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME'))
    return home ? `${trimEnd(home)}/.claude/claudin` : null
  } catch {
    return null
  }
}
async function dataRoots($: any): Promise<string[]> {
  const user = await userDir($)
  return user ? [user, $.plugin.root] : [$.plugin.root]
}

// Cofre: caminho em <config>/claudin/cofre.json (arquivo pessoal, nunca do plugin). Sem ele, ou com a pasta
// inexistente, o recurso fica desligado em silêncio.
async function loadCofre($: any) {
  const user = await userDir($)
  let home: string | undefined
  try {
    home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? undefined
  } catch {
    home = undefined
  }
  const file = user ? `${user}/${COFRE_FILE}` : null
  const path = file
    ? await resolveCofre(async () => ((await $.fs.exists(file)) ? await $.fs.read(file) : null), (p: string) => $.fs.exists(p), home)
    : null
  await update($, cofre, () => path)
}

// Lê a ocupação da janela de contexto. Sem leitura (falha, ainda sem resposta) devolve null, sem lançar.
async function loadContext($: any): Promise<number | null> {
  let pct: number | null = null
  try {
    pct = readPercent(await $.session.usage())
  } catch {
    pct = null
  }
  await update($, ctxPct, () => pct)
  return pct
}

async function loadCtxPreset($: any) {
  const saved = await $.store.get('ctxPreset')
  await update($, ctxPreset, () => presetById(saved).id)
}

async function cycleCtxPreset($: any) {
  const current = presetById(await read($, ctxPreset)).id
  const i = CONTEXT_PRESETS.findIndex(p => p.id === current)
  const next = CONTEXT_PRESETS[(i + 1) % CONTEXT_PRESETS.length] ?? presetById(DEFAULT_PRESET)
  await $.store.set('ctxPreset', next.id)
  await update($, ctxPreset, () => next.id)
  // O nível já avisado passa a valer pela faixa nova, para ela não disparar de imediato por um valor que a pessoa já viu.
  const seen = await read($, ctxPct)
  await update($, ctxLevel, () => contextLevel(seen, next.levels))
}

async function loadCenario($: any) {
  const saved = await prefGet($, 'cenario')
  await update($, cenario, () => saved === true)
  const off = await $.store.get('lightsOff')
  await update($, lightsOff, () => off === true)
  const neon = await $.store.get('neonOn')
  await update($, neonOn, () => neon === true)
}

async function toggleNeon($: any) {
  const next = !(await read($, neonOn))
  await $.store.set('neonOn', next)
  await update($, neonOn, () => next)
  await speak($, 'idle', next ? 'Modo neon ligado.' : 'Modo neon desligado.')
}

async function toggleLights($: any) {
  const next = !(await read($, lightsOff))
  await $.store.set('lightsOff', next)
  await update($, lightsOff, () => next)
  await speak($, 'idle', next ? 'Luz apagada.' : 'Luz acesa.')
}

// O que os monitores do QG mostram: modelo, contexto, tokens, custo e limites. Nada aqui pode barrar o desenho.
async function refreshPanel($: any) {
  try {
    const p = await readPanel($)
    await update($, panelInfo, () => p)
  } catch {
    // sem painel
  }
}

async function readPanel($: any): Promise<Panel> {
  const p: Panel = {}
  try {
    p.model = await $.session.model()
  } catch {
    // sem modelo
  }
  try {
    const u = await $.session.usage()
    const c = u?.context
    if (typeof c?.percent === 'number') p.ctx = Math.round(c.percent)
    if (typeof c?.tokens === 'number') p.tokens = c.tokens
    if (typeof c?.window === 'number') p.window = c.window
    if (typeof u?.cost?.usd === 'number') p.usd = u.cost.usd
    for (const r of Array.isArray(u?.rateLimits) ? u.rateLimits : []) {
      if (/five|5h/i.test(String(r?.kind))) p.limit5h = r.percentUsed
      if (/seven|7d/i.test(String(r?.kind))) p.limit7d = r.percentUsed
    }
  } catch {
    // sem leitura
  }
  return p
}

// O QG só aparece no painel lateral: na linha do prompt ele e a caixa aberta empurram a conversa para cima.
// Na linha do prompt, o 📡 liga o QG e leva o Claudin para o painel; no painel, ele liga e desliga.
async function toggleCenario($: any, inPane: boolean) {
  await refreshPanel($)
  if (!inPane) {
    await prefSet($, 'cenario', true)
    await update($, cenario, () => true)
    if ((await placeClaudin($, true)) !== 'lateral') await speak($, 'idle', 'O QG mora no painel lateral, e não consegui abrir o painel agora.')
    return
  }
  const next = !(await read($, cenario))
  await prefSet($, 'cenario', next)
  await update($, cenario, () => next)
}

// Uma zona do QG abre a aba do que o objeto representa; sem o que abrir (frota vazia, cofre desligado) só o Claudin avisa.
async function openSpot($: any, id: string) {
  const spot = SPOTS.find(s => s.id === id)
  if (!spot) return
  // O Claudin anda até o objeto clicado (o passo acontece no passeio) e fica um pouco por lá.
  const goal = Math.round(Math.max(0, Math.min(1, (spot.cx - SCENE_X0) / SCENE_SPAN)) * MAX_X)
  await update($, walk, (w: Walk): Walk => ({ x: w.x, dir: goal >= w.x ? 1 : -1, goal }))
  if (spot.id === 'luz') return toggleLights($)
  if (spot.id === 'neon') return toggleNeon($)
  if (spot.id === 'sobre') {
    await update($, boxPage, () => 0)
    await update($, boxCat, () => SOBRE_CAT)
    await update($, colaOpen, () => false)
    await update($, boxOpen, () => true)
    return
  }
  if (spot.id === 'frota' && (await read($, fleet)).length === 0) return speak($, 'idle', 'Nenhum agente por aqui. Os monitores acendem quando a frota trabalha.')
  if (spot.id === 'cofre' && !(await read($, cofre))) return speak($, 'idle', 'O cofre não está ligado: falta o cofre.json em <config>/claudin.')
  await update($, boxPage, () => 0)
  await update($, boxCat, () => spot.tab)
  await update($, colaOpen, () => false)
  await update($, boxOpen, () => true)
  if (spot.tab === 'comandos') {
    await loadCommands($)
    if (await read($, cola)) {
      await loadColaView($)
      await update($, colaGroup, () => '')
      await update($, colaOpen, () => true)
    }
  }
  if (spot.tab === 'prazos') await loadCofreDeadlines($)
  if (spot.tab === 'cofre') await loadCofreView($)
  if (spot.tab === 'acoes') await loadContext($)
}

// Cola: mesmo formato do cofre.json ({ "path": "..." }), mas aponta para o arquivo catalogo.json.
async function loadCola($: any) {
  const user = await userDir($)
  let home: string | undefined
  try {
    home = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? undefined
  } catch {
    home = undefined
  }
  const file = user ? `${user}/${COLA_FILE}` : null
  const path = file
    ? await resolveCofre(async () => ((await $.fs.exists(file)) ? await $.fs.read(file) : null), (p: string) => $.fs.exists(p), home)
    : null
  await update($, cola, () => path)
}

async function loadColaView($: any) {
  const path = await read($, cola)
  if (!path) return update($, colaView, () => null)
  try {
    const parsed = parseCatalogo(await $.fs.read(path))
    await update($, colaView, () => ({ readable: parsed !== null, groups: parsed?.groups ?? [], scripts: parsed?.scripts ?? [] }))
  } catch {
    await update($, colaView, () => ({ readable: false, groups: [], scripts: [] }))
  }
}

// Lê um sprite: SVG vale como está; PNG vira <image> dentro de um SVG de 64x48, pixelado.
async function readSprite($: any, path: string, ext: string): Promise<string> {
  if (ext === 'svg') return await $.fs.read(path)
  const { base64 } = await $.fs.read(path, { as: 'bytes' })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><image href="data:image/png;base64,${base64}" width="64" height="48" preserveAspectRatio="xMidYMid meet" style="image-rendering:pixelated"/></svg>`
}

async function loadSprites($: any) {
  const found: Record<string, string> = {}
  const roots = await dataRoots($)
  for (const m of MOODS) {
    done: for (const root of roots) {
      for (const ext of ['svg', 'png']) {
        const path = `${root}/sprites/${m}.${ext}`
        if (!(await $.fs.exists(path))) continue
        found[m] = await readSprite($, path, ext)
        break done
      }
    }
  }
  await update($, sprites, () => found)
}

// Skins: as do plugin (Mangue, Maré, Malungo) são o mesmo Claudin com outra paleta e vêm do código, então herdam
// movimento, olhar e modos. Cada pasta de <config>/claudin/sprites/<nome>/ com poses em SVG vira uma skin de arte própria.
// "frota" guarda as miniaturas, não é skin.
const SKIN_RESERVED = ['frota', CLASSIC_SKIN]
const SKIN_LABEL: Record<string, string> = { mare: 'maré', [CLASSIC_SKIN]: 'clássico' }
const skinLabel = (name: string) => SKIN_LABEL[name] ?? (name || DEFAULT_SKIN)

async function listSkins($: any): Promise<string[]> {
  const found = new Set<string>()
  for (const root of await dataRoots($)) {
    try {
      for (const e of await $.fs.list(`${root}/sprites`)) if (e.kind === 'dir' && !SKIN_RESERVED.includes(e.name) && !SKINS[e.name]) found.add(e.name)
    } catch {
      // pasta sem sprites/: nenhuma skin ali
    }
  }
  return [...Object.keys(SKINS), ...[...found].sort(), CLASSIC_SKIN]
}

// Pose que a skin não tem fica de fora e o desenho padrão cobre.
async function loadSkinArt($: any, name: string) {
  const found: Record<string, string> = {}
  if (name && name !== CLASSIC_SKIN && !SKINS[name]) {
    const roots = await dataRoots($)
    for (const m of MOODS) {
      done: for (const root of roots) {
        for (const ext of ['svg']) { // o desktop não desenha PNG embutido: skins só em SVG
          const path = `${root}/sprites/${name}/${m}.${ext}`
          try {
            if (!(await $.fs.exists(path))) continue
            found[m] = await readSprite($, path, ext)
          } catch {
            continue
          }
          break done
        }
      }
    }
  }
  await update($, skinArt, () => found)
}

async function loadMinis($: any) {
  const found: Record<string, string> = {}
  const roots = await dataRoots($)
  for (const kind of MINI_KINDS) {
    done: for (const root of roots) {
      for (const ext of ['svg']) {
        const path = `${root}/sprites/frota/${kind}.${ext}`
        try {
          if (!(await $.fs.exists(path))) continue
          found[kind] = await readSprite($, path, ext)
        } catch {
          continue
        }
        break done
      }
    }
  }
  for (const kind of MINI_KINDS) found[kind] ??= miniSvg(kind) // sem arquivo do usuário, a criatura sai do código
  await update($, miniArt, () => found)
  let map: Record<string, string> = {}
  for (const root of roots) {
    try {
      if (await $.fs.exists(`${root}/fleet-map.json`)) {
        map = parseFleetMap(String(await $.fs.read(`${root}/fleet-map.json`)))
        break
      }
    } catch {
      map = {}
    }
  }
  await update($, fleetMap, () => map)
}

// Preferência guardada por sessão (`chave@id`) e também como padrão para sessões novas. Assim cada sessão volta com o
// seu Claudin (a cor que a pessoa escolheu para se situar) e uma sessão nova começa com a última escolha.
async function sessionKey($: any, key: string): Promise<string | null> {
  try {
    const id = await $.session.id()
    return typeof id === 'string' && id ? `${key}@${id}` : null
  } catch {
    return null
  }
}

async function prefGet($: any, key: string): Promise<unknown> {
  try {
    const sk = await sessionKey($, key)
    const own = sk ? await $.store.get(sk) : undefined
    return own !== undefined && own !== null ? own : await $.store.get(key)
  } catch {
    return undefined
  }
}

async function prefSet($: any, key: string, value: unknown) {
  try {
    const sk = await sessionKey($, key)
    if (sk) await $.store.set(sk, value)
    await $.store.set(key, value)
  } catch {
    // guardar é conforto; falhar não muda o que está na tela
  }
}

async function loadSize($: any) {
  const saved = await prefGet($, 'sizeIdx')
  if (typeof saved === 'number' && saved >= 0 && saved < SIZES.length) await update($, sizeIdx, () => saved)
}

async function cycleSize($: any) {
  const next = ((await read($, sizeIdx)) + 1) % SIZES.length
  await prefSet($, 'sizeIdx', next)
  await update($, sizeIdx, () => next)
}

async function loadSkin($: any) {
  const names = await listSkins($)
  await update($, skinNames, () => names)
  const saved = await prefGet($, 'skin')
  const hasOwnSprites = Object.keys(await read($, sprites)).length > 0
  const chosen = typeof saved === 'string' && names.includes(saved) ? saved : hasOwnSprites ? CLASSIC_SKIN : DEFAULT_SKIN
  await update($, skin, () => chosen)
  await loadSkinArt($, chosen)
}

async function cycleSkin($: any) {
  const all = await read($, skinNames)
  const next = all[(all.indexOf(await read($, skin)) + 1) % all.length] ?? DEFAULT_SKIN
  await prefSet($, 'skin', next)
  await update($, skin, () => next)
  await loadSkinArt($, next)
}

// Atalhos do usuário: shortcuts.json, lista de { label, text }. O da pasta do usuário vence o do plugin.
async function loadShortcuts($: any) {
  let path: string | undefined
  for (const root of await dataRoots($)) {
    if (await $.fs.exists(`${root}/shortcuts.json`)) {
      path = `${root}/shortcuts.json`
      break
    }
  }
  if (!path) return
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
    let path: string | undefined
    for (const root of await dataRoots($)) {
      if (await $.fs.exists(`${root}/favorites-seed.json`)) {
        path = `${root}/favorites-seed.json`
        break
      }
    }
    if (path) {
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
  const catRaw = await read($, boxCat)
  const page = await read($, boxPage)
  const allCmds = await read($, cmds)
  const q = await read($, query)
  const favList = await read($, favs)
  const activeTimers = await read($, timers)
  const dls = mergeDeadlines(await read($, deadlines), await read($, cofreDeadlines))
  const rems = await read($, reminders)
  const ddq = await read($, ddText)
  const nowDl = dls.length > 0 ? await $.clock.now() : 0
  const cofreRoot = await read($, cofre)
  const cv = await read($, cofreView)
  const colaPath = await read($, cola)
  const colaV = await read($, colaView)
  const colaQ = await read($, colaQuery)
  const colaG = await read($, colaGroup)
  const ctxP = await read($, ctxPct)
  const ctxPre = presetById(await read($, ctxPreset))
  const cenarioOn = !!(await read($, cenario))
  const colaShown = !!colaPath && (await read($, colaOpen))
  const skinSel = await read($, skin)
  const skinSprites = await read($, skinArt)
  const skinDef = SKINS[skinSel]
  const miniSprites = await read($, miniArt)
  const userFleetMap = await read($, fleetMap)
  const noteTxt = await read($, noteText)
  const fleetRows = await read($, fleet)
  const nowF = fleetRows.length > 0 ? await $.clock.now() : 0
  const fleetLine = summaryLine(fleetRows, nowF)
  const cats = [...CATS, ...(fleetRows.length > 0 ? [FLEET_CAT] : []), ...(cofreRoot ? [COFRE_CAT] : [])]
  const cat = cats.includes(catRaw) || catRaw === SOBRE_CAT ? catRaw : 'prompts' // aba que sumiu (frota vazia, cofre desligado) não prende a caixa
  const nowT = activeTimers.length > 0 ? (await read($, tick)) || (await $.clock.now()) : 0
  const extras = await read($, extraShortcuts)
  const cmd = await read($, lastCmd)
  const file = await read($, lastFile)
  const { Box, Text, Button, Svg, Input, Link } = $.ui.resolve(e) as any
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
    await update($, colaOpen, () => false)
    if (c === 'comandos') await loadCommands($)
    if (c === 'acoes') await loadContext($)
    if (c === 'prazos') await loadCofreDeadlines($)
    if (c === COFRE_CAT) await loadCofreView($)
  }
  const toggleCola = async () => {
    await update($, boxPage, () => 0)
    if (!colaShown) await loadColaView($)
    await update($, colaGroup, () => '')
    await update($, colaOpen, () => !colaShown)
  }
  const fill = (text: string) => () => $.prompt.fill({ text, mode: 'replace' })

  type Item = { key: string; label: string; onPress: (p: any) => void; sep?: boolean; text?: boolean; href?: string; starred?: boolean; onStar?: () => void; onDelete?: () => void }
  const colaItems: Item[] =
    colaShown && colaV?.readable
      ? flattenCola(withClaudin({ groups: colaV.groups, scripts: colaV.scripts }), colaG, colaQ).map((r): Item => {
          if (r.kind === 'head' || r.kind === 'note') return { key: r.key, label: r.kind === 'note' ? `  ${r.label}` : r.label, text: true, onPress: () => {} }
          if (r.kind === 'group') {
            return {
              key: r.key,
              label: r.label,
              onPress: async () => {
                await update($, boxPage, () => 0)
                await update($, colaGroup, (v: string) => (v === r.group ? '' : r.group ?? ''))
              },
            }
          }
          // Preenche o prompt e o Claudin diz o que a skill faz; quem envia é a pessoa.
          return {
            key: r.key,
            label: `  ${r.label}`,
            onPress: async () => {
              await fill(r.command ?? '')()
              if (r.say) await speak($, 'idle', short(r.say, 220))
            },
          }
        })
      : []
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
            // Só com o cofre ligado; preenche o prompt e quem envia é a pessoa.
            ...(cofreRoot ? [{ key: 'a-cofre', label: 'próximo passo do cofre', onPress: fill(`Leia ${cofreRoot}/${HOT_FILE} e me ajude com o próximo passo.`) }] : []),
            // Janela de contexto: só mostra e sugere; compactar e limpar preenchem o prompt e quem envia é a pessoa.
            { key: 'a-ctx', label: contextLine(ctxP, ctxPre.levels), text: true, onPress: () => {} },
            { key: 'a-compact', label: 'compactar (/compact)', onPress: fill('/compact ') },
            { key: 'a-clear', label: 'limpar contexto (/clear)', onPress: fill('/clear ') },
          ]
        : cat === 'ajustes'
          ? [
              { key: 'mode', label: `modo: ${MODE_LABEL[m.kind as ModeKind]}`, onPress: () => setMode($, MODES[(MODES.indexOf(m.kind as ModeKind) + 1) % MODES.length] ?? 'normal') },
              { key: 'size', label: `tamanho: ${size.label}`, onPress: () => cycleSize($) },
              { key: 'skin', label: `skin: ${skinLabel(skinSel)}`, onPress: () => cycleSkin($) },
              { key: 'sep1', label: '', sep: true, onPress: () => {} },
              { key: 'quiet', label: quiet ? 'ver tools' : 'ocultar tools', onPress: () => update($, isQuiet, (v: boolean) => !v) },
              { key: 'log', label: showLog ? 'fechar histórico' : 'histórico', onPress: () => update($, isLogOpen, (v: boolean) => !v) },
              { key: 'sep2', label: '', sep: true, onPress: () => {} },
              { key: 'greet', label: 'saudação do dia', onPress: async () => { await loadCofreDeadlines($); await greetToday($, true) } },
              { key: 'pet', label: 'afagar', onPress: () => speak($, 'ok', PETS[Math.floor(Math.random() * PETS.length)] ?? 'Presente.') },
              { key: 'ctx', label: `contexto: ${ctxPre.label}`, onPress: () => cycleCtxPreset($) },
              {
                key: 'side',
                label: side ? '↔ prompt' : '↔ lateral',
                onPress: async () => {
                  const where = await placeClaudin($, !side)
                  if (!side && where === 'faixa') await speak($, 'alert', 'Sem espaço para o painel lateral; fiquei acima do prompt.')
                },
              },
            ]
          : cat === 'comandos' && colaShown
            ? colaItems
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
                        const dot = n < 0 ? '🔴' : n <= 3 ? '🟡' : '🟢'
                        // Prazo do cofre é espelho só de leitura: sem botão de apagar.
                        if (d.id.startsWith('cofre:')) return { key: `dl-${d.id}`, label: `${dot} ${dayLabel(n)} · ${d.title} · do cofre`, text: true, onPress: () => {} }
                        return {
                          key: `dl-${d.id}`,
                          label: `${dot} ${dayLabel(n)} · ${d.title}`,
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
                : cat === COFRE_CAT
                  ? (() => {
                      if (!cv || !cv.hasHot) return []
                      const more = (l: string[]) => (l.length > 1 ? ` (+${l.length - 1})` : '')
                      const rows: Item[] = []
                      if (cv.next) rows.push({ key: 'cf-next', label: short(`próximo: ${cv.next}`, 46), text: true, onPress: () => {} })
                      if (cv.urgent.length) rows.push({ key: 'cf-urg', label: short(`! ${cv.urgent[0]}`, 40) + more(cv.urgent), text: true, onPress: () => {} })
                      rows.push({ key: 'cf-fill', label: 'próximo passo do cofre', onPress: fill(`Leia ${cofreRoot}/${HOT_FILE} e me ajude com o próximo passo.`) })
                      if (cv.fios.length) rows.push({ key: 'cf-fio', label: short(`· ${cv.fios[0]}`, 40) + more(cv.fios), text: true, onPress: () => {} })
                      cv.notes.forEach((n, i) => rows.push({ key: `cf-n${i}`, label: `⚠ ${n}`, text: true, onPress: () => {} }))
                      return rows
                    })()
                : cat === FLEET_CAT
                  ? (() => {
                      const ordered = orderRows(fleetRows)
                      const shown: Item[] = ordered.slice(0, FLEET_MAX_ROWS).map(r => ({ key: `ag-${r.id}`, label: rowLine(r, nowF), text: true, onPress: () => {} }))
                      const more = ordered.length - FLEET_MAX_ROWS
                      return more > 0 ? [...shown, { key: 'ag-more', label: `+${more} agentes`, text: true, onPress: () => {} }] : shown
                    })()
                  : cat === SOBRE_CAT
                    ? [
                        { key: 'sb-v', label: `Claudin ${VERSION} · caranguejo com cérebro`, text: true, onPress: () => {} },
                        { key: 'sb-o', label: 'Mascote do Claude Code, feito no mangue de Recife em espírito.', text: true, onPress: () => {} },
                        { key: 'sb-git', label: 'repositório no GitHub', href: REPO_URL, onPress: () => {} },
                        { key: 'sb-hero', label: 'página do projeto (README)', href: `${REPO_URL}#readme`, onPress: () => {} },
                        { key: 'sb-rel', label: 'novidades (releases)', href: `${REPO_URL}/releases`, onPress: () => {} },
                        { key: 'sb-leg', label: 'legends-claude, o projeto irmão', href: 'https://github.com/leolegends/legends-claude', onPress: () => {} },
                      ]
                    : []

  const placeholder =
    cat === 'comandos' && colaShown && items.length === 0 ? (colaV && !colaV.readable ? 'catálogo ilegível' : colaQ ? 'Nenhuma skill encontrada.' : 'Catálogo vazio.') : cat === 'comandos' && items.length === 0 ? 'Nenhum comando encontrado.' : cat === 'prazos' && items.length === 0 ? 'Vazia. Ex.: 05/11 prazo · 09:00 lembrete' : cat === FLEET_CAT && items.length === 0 ? 'Nenhum agente por aqui.' : cat === COFRE_CAT && items.length === 0 ? 'Sem Wiki/_hot.md ainda.' : ''

  // Menu em estilo mIRC: barra de menus em texto, divisória e lista vertical paginada, uma coluna.
  const size_ = cat === 'comandos' || cat === 'prazos' || cat === COFRE_CAT ? PAGE_CMD : PAGE
  const pages = Math.max(1, Math.ceil(items.length / size_))
  const pg = Math.min(page, pages - 1)
  const rows = items.slice(pg * size_, pg * size_ + size_)
  const line = '─'.repeat(TOOLBOX_W - 18)
  // Ícone em vetor com um botão em branco por cima: U+2800 não some como espaço, e a caixa absoluta
  // de largura 100% cobre o ícone e o nome, então a ficha inteira é o botão. `before` vem antes do ícone (o ▾ da
  // antena), `name` depois (o nome da aba aberta).
  const iconButton = (key: string, id: string, alt: string, onPress: () => void, before = '', name = '') => (
    <Box key={`${key}-w`} position="relative" flexDirection="row" columnGap={name ? 1 : 0}>
      {before ? <Text>{before}</Text> : null}
      <Svg source={chipSvg(id)} alt={alt} width={22} height={22} />
      {name ? <Text bold>{name}</Text> : null}
      <Box position="absolute" top={0} left={0} width="100%">
        <Button key={key} plain label={'⠀'.repeat(Math.max(3, before.length + 3 + (name ? name.length + 1 : 0)))} onPress={onPress} />
      </Box>
    </Box>
  )
  const chips = isPane && !!Svg // superfície gráfica com espaço: fichas e linhas com fundo
  const body = (
    <Box flexDirection="column" alignItems="flex-start" width="100%">
      {chips ? <Text dimColor>caixa de ferramentas</Text> : <Text dimColor>🧰 Caixa de ferramentas</Text>}
      {chips ? (
        // No painel lateral: abas como fichas com o nome, a aberta em coral, como na ilustração do README.
        <Box flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1} marginTop={1} marginBottom={1}>
          {cats.map(c => (
            <Box key={`chip-${c}`} backgroundColor={c === cat ? CORAL : CHIP_BG} paddingX={1}>
              {chipSvg(c) ? (
                iconButton(`cat-${c}`, c, CAT_LABEL[c] ?? c, pick(c), '', c === cat ? CAT_LABEL[c] ?? c : '')
              ) : (
                <Button key={`cat-${c}`} plain label={tabLabel(c, CAT_LABEL[c] ?? c, c === cat).replace('▸', '').trim()} onPress={pick(c)} />
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Box flexDirection="row">
          {cats.map(c => (
            <Button key={`cat-${c}`} plain label={tabLabel(c, CAT_LABEL[c] ?? c, c === cat)} onPress={pick(c)} />
          ))}
        </Box>
      )}
      {chips ? null : <Text dimColor>{line}</Text>}
      {cat === 'comandos' && Input ? (
        <Box key="q-row" flexDirection="row" columnGap={1} marginBottom={chips ? 1 : 0}>
          {colaShown ? (
            <Input
              key="cl-q"
              placeholder="buscar skill…"
              value={colaQ}
              onSubmit={() => items.find(x => !x.text)?.onPress?.({})}
              onInput={(v: string) => {
                update($, colaQuery, () => v)
                update($, boxPage, () => 0)
              }}
            />
          ) : (
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
          )}
          {colaPath ? <Button key="cl-open" plain label={colaShown ? '▸📋' : '📋'} onPress={toggleCola} /> : null}
        </Box>
      ) : null}
      {cat === COFRE_CAT && Input ? (
        <Input
          key="cf-note"
          placeholder="capturar nota…"
          value={noteTxt}
          onSubmit={(v: string) => captureNote($, typeof v === 'string' && v ? v : noteTxt)}
          onInput={(v: string) => update($, noteText, () => v)}
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
        ) : x.href && Link ? (
          <Box key={x.key} paddingX={chips ? 1 : 0}>
            <Link href={x.href} label={`↗ ${x.label}`} />
          </Box>
        ) : x.text ? (
          <Text key={x.key}>{`  ${x.label}`}</Text>
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
        ) : chips ? (
          <Box key={`row-${x.key}`} width="100%" backgroundColor={ROW_BG} paddingX={1} marginBottom={1} hover={{ backgroundColor: ROW_HOVER }}>
            <Button key={x.key} plain label={x.label} onPress={x.onPress} />
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
      <Box flexDirection="row" columnGap={1}>
        {Svg ? iconButton('sc', 'antena', 'antena: liga o QG', () => toggleCenario($, isPane), cenarioOn && isPane ? '▾' : '') : null}
        {Svg && !open ? (
          iconButton('tb', 'caixa', 'caixa de ferramentas', () => update($, boxOpen, (v: boolean) => !v))
        ) : (
          <Button key="tb" label={open ? '✕' : '🧰'} onPress={() => update($, boxOpen, (v: boolean) => !v)} />
        )}
      </Box>
      {open ? (
        <Box flexDirection="column" borderStyle={isPane && Svg ? 'single' : 'round'} borderColor="subtle" marginTop={1} paddingX={1} paddingY={isPane && Svg ? 1 : 0} width={isPane ? undefined : TOOLBOX_W} height={isPane ? undefined : 10} overflow="hidden" alignItems="flex-start">
          {body}
        </Box>
      ) : null}
    </Box>
  )

  const mascotSrc = Svg ? ((m.kind === 'normal' ? skinSprites[s.mood] : undefined) ?? (skinDef ? undefined : custom[s.mood]) ?? sprite(s.mood, m.kind, lookFor(s.mood as Mood, w.dir, open), skinDef)) : ''
  const mascot = Svg ? <Svg source={mascotSrc} alt="Claudin, o mascote" width={size.w} height={size.h} isInteractive /> : null
  // No QG o Claudin ganha contorno e sombra para não se perder no fundo.
  const sceneSprite = Svg ? <Svg source={withOutline(mascotSrc)} alt="Claudin, o mascote" width={size.w} height={size.h} /> : null
  // Miniaturas da frota ao lado do mascote: até 2 criaturas (×n quando há vários do tipo) e +N nos agentes sem miniatura.
  // Em meditar e cigarro ficam de fora (modos calmos).
  const calm = m.kind === 'meditar' || m.kind === 'cigarro'
  const picked0 = calm || !Svg ? { shown: [], extra: 0 } : pickMinis(fleetRows, 2, userFleetMap)
  const lost = picked0.shown.filter(x => !miniSprites[x.kind]).reduce((n, x) => n + x.count, 0) // sem arte: entra no +N
  const picked = { shown: picked0.shown.filter(x => miniSprites[x.kind]), extra: picked0.extra + lost }
  const miniPx = Math.max(10, Math.round(size.h * 0.6))
  const miniRow = [
    ...picked.shown.flatMap(x =>
      miniSprites[x.kind]
        ? [
            <Box key={`mini-${x.kind}`} flexDirection="row" alignItems="flex-end">
              <Svg source={miniSprites[x.kind]} alt={`${x.count} agente${x.count > 1 ? 's' : ''}: ${MINI_ROLE[x.kind]}`} width={miniPx} height={miniPx} />
              {x.count > 1 ? <Text dimColor>{`×${x.count}`}</Text> : null}
            </Box>,
          ]
        : [],
    ),
    ...(picked.extra > 0 && picked.shown.length > 0 ? [<Text key="mini-more" dimColor>{`+${picked.extra}`}</Text>] : []),
  ]

  // Com a faixa ligada as miniaturas da frota ficam nas bancadas dela e não ao lado do mascote.
  const sceneOn = cenarioOn && !!Svg && isPane // o QG só no painel lateral
  const miniBeside = sceneOn ? [] : miniRow
  const sceneMascot = sceneOn // o mascote anda dentro da faixa; o balão fica logo abaixo
  const stationMinis = sceneOn
    ? picked.shown.flatMap(x => Array.from({ length: Math.min(x.count, STATIONS.length) }, (_, n) => ({ kind: x.kind, n, role: MINI_ROLE[x.kind] ?? '' }))).slice(0, STATIONS.length)
    : []
  let qgNode: any = null
  // Posição do Claudin na faixa (o passeio leva ele até o canto do que está fazendo). O sprite mede ~size.w/8
  // células; a conta centra ele no ponto e não deixa sair pelas bordas.
  const spriteCells = Math.ceil(size.w / 8)
  const sceneFrac = SCENE_X0 + (SCENE_SPAN * Math.max(0, Math.min(MAX_X, w.x))) / MAX_X
  const sceneX = Math.max(0, Math.min(cols - spriteCells - 1, Math.round(sceneFrac * cols - spriteCells / 2)))
  const lightsOffNow = sceneOn && !!(await read($, lightsOff))
  if (sceneOn) {
    const nowQ = await $.clock.now()
    const clock = new Date(nowQ)
    const panel = { ...((await read($, panelInfo)) ?? {}), agents: fleetRows.length, tools: (await read($, turn)).cmds }
    const art = composeQg(QG_ART.svg, {
      w: QG_ART.w,
      h: QG_ART.h,
      minutes: clock.getHours() * 60 + clock.getMinutes(),
      pomo: pomodoroOf(activeTimers, nowQ),
      lightsOff: !!(await read($, lightsOff)),
      neon: !!(await read($, neonOn)),
      panel,
      working: !!e.props?.isWorking,
    })
    qgNode = (
      <Box key="qg" position="relative" width="100%">
        <Svg key="qg-art" source={art} alt="QG do Claudin: a base dos caranguejos com cérebro, em uma cabana de palafita no mangue" />
        <Box key="qg-claudin" position="absolute" bottom={0} left={sceneX}>
          {sceneSprite}
        </Box>
        {stationMinis.map((mm, i) => (
          <Box key={`qg-mini-${mm.kind}${mm.n ? `-${mm.n}` : ''}`} position="absolute" bottom={0} left={stationCol(i, cols)}>
            <Svg source={withOutline(miniSprites[mm.kind] ?? '')} alt={`Agente: ${mm.role}`} width={miniPx} height={miniPx} />
          </Box>
        ))}
        {/* Pontos do QG: o botão é o próprio ícone, numa camada só desenhada por último. Cada coluna tem âncoras de
            altura e largura zero no ponto marcado; o ícone fica numa caixa absoluta de 3 células presa à âncora
            (uma célula para a esquerda, para centrar o emoji), então não encolhe nem pula com a janela. */}
        <Box key="qg-zones" position="absolute" top={0} left={0} right={0} bottom={0} flexDirection="row">
          {ICON_COLS.map(col => {
            const sp = col
            const [b0, b1] = col.b
            const half = rowFrac(cols) / 2
            const anchors: { y: number; x: number; node: any; key: string }[] = col.spots
              .map(s => ({
                key: s.id,
                x: s.cx,
                y: s.cy,
                node: (
                  <Box key={`zone-${s.id}`} position="absolute" top={0} left={-1} width={3}>
                    {/* O ícone é desenhado dentro da faixa; aqui fica só o botão em branco (U+2800 não some como
                        espaço), que acende ao passar o ponteiro. */}
                    <Button key={`spot-${s.id}`} plain label={'\u2800\u2800'} onPress={() => openSpot($, s.id)} />
                  </Box>
                ),
              }))
              .sort((a, b) => a.y - b.y)
            let used = 0
            return (
              <Box key={`qg-col-${sp.id}`} flexDirection="column" width={pct(b1 - b0)}>
                {anchors.flatMap(a => {
                  const top = Math.max(used, a.y - half)
                  const gap = top - used
                  used = top
                  return [
                    <Box key={`qg-sp-${sp.id}-${a.key}`} height={pct(gap)} />,
                    <Box key={`qg-row-${sp.id}-${a.key}`} flexDirection="row" height={0}>
                      <Box width={pct((a.x - b0) / (b1 - b0))} />
                      <Box position="relative" width={0} height={0}>
                        {a.node}
                      </Box>
                    </Box>,
                  ]
                })}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  const root = (
    <Box flexDirection={isPane ? 'column' : 'row'} alignItems="flex-start" width="100%" minHeight={!isPane && open ? 13 : undefined}>
      <Box key="claudin" flexDirection="column" marginLeft={x} width={colW} alignItems="flex-start">
        {sceneMascot ? <Text dimColor>  ▴</Text> : null}
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
              {fleetLine ? <Text key="fleet-line" dimColor>{`◆ ${fleetLine}`}</Text> : null}
              {first ? timerRow(first, 'bt') : null}
              {act ? (
                <Box key="act-row" marginTop={1}>
                  <Button
                    key="act"
                    label={act.label}
                    onPress={async () => {
                      await $.prompt.fill({ text: act.text, mode: 'replace' })
                      await update($, action, () => null)
                    }}
                  />
                </Box>
              ) : null}
            </Box>
          )}
        </Box>
        {sceneMascot ? null : <Text dimColor>  ╰▾</Text>}
        {sceneMascot ? null : Svg ? (
          miniBeside.length > 0 ? (
            <Box flexDirection="row" alignItems="flex-end" columnGap={1}>
              {mascot}
              {miniBeside}
            </Box>
          ) : (
            mascot
          )
        ) : (
          <Text color={CORAL}>{glyph}</Text>
        )}
      </Box>
      {toolbox}
    </Box>
  )
  return qgNode ? (
    <Box flexDirection="column" width="100%">
      {qgNode}
      {root}
    </Box>
  ) : (
    root
  )
}

async function hideRow($: any, e: any, next: any) {
  if (await read($, isQuiet)) {
    const { Box } = $.ui.resolve(e) as any
    return <Box />
  }
  return next(e)
}

// Resumo do fim do turno principal, com o aviso de contexto quando ele sobe de nível.
async function sayTurnEnd($: any, e: any) {
  const ok = e.reason === 'answer'
  const st = await read($, turn)
  const parts = [
    st.files.length ? `${st.files.length} arquivo${st.files.length > 1 ? 's' : ''} editado${st.files.length > 1 ? 's' : ''}` : '',
    st.cmds ? `${st.cmds} comando${st.cmds > 1 ? 's' : ''}` : '',
    st.errors ? `${st.errors} falha${st.errors > 1 ? 's' : ''}` : '',
    st.agents ? `${st.agents} agente${st.agents > 1 ? 's' : ''}` : '',
  ].filter(Boolean)
  const summary = parts.length ? `Pronto: ${parts.join(', ')}.` : 'Pronto. Nada a reportar.'
  // Janela de contexto: avisa uma vez ao subir de nível; descer (depois de /compact ou /clear) rearma.
  const pct = await loadContext($)
  const levels = presetById(await read($, ctxPreset)).levels
  const warn = pct === null || !ok ? null : contextWarn(await read($, ctxLevel), pct, levels)
  // Sem leitura nada muda; turno interrompido não marca o nível como visto (o aviso sai no próximo).
  if (pct !== null && ok) await update($, ctxLevel, () => contextLevel(pct, levels))
  const next1: Action | null =
    st.errors > 0
      ? { label: 'investigar falhas', text: 'Houve falhas neste turno. Resuma o que falhou e proponha como corrigir.' }
      : st.files.length > 0
        ? { label: 'rodar testes', text: 'Rode os testes do projeto e me diga o resultado.' }
        : null
  await speak(
    $,
    ok ? (st.errors ? 'err' : warn?.mood === 'alert' ? 'alert' : 'ok') : 'err',
    ok ? (warn ? `${summary} ${warn.text}` : summary) : e.reason === 'aborted' ? 'Interrompido.' : 'O turno terminou com erro.',
    ok ? (st.errors > 0 ? next1 : warn?.action ?? next1) : null,
  )
  const s = await read($, say)
  settle($, s.seq, 20000)
}

export const register: Register = on => {
  on('prompt.submit', async ($, e, next) => {
    // O balão e a contagem nunca podem barrar o envio do prompt: o que falhar é engolido.
    try {
      await update($, turn, () => ({ files: [], cmds: 0, errors: 0, agents: 0 }))
      await speak($, 'think', 'Analisando.')
      await refreshPanel($)
    } catch {
      // idem
    }
    return next(e)
  })

  // Um subagente nasce: a linha entra na frota e, no máximo uma vez a cada SPAWN_SAY_MS, o balão avisa.
  on('agent.spawn', async ($, e: any, next) => {
    const result: any = await next(e)
    try {
      if (result?.agentId) {
        const now = await $.clock.now()
        await update($, turn, (s: TurnStats) => ({ ...s, agents: s.agents + 1 }))
        await commitFleet($, rows =>
          upsert(rows, result.agentId, now, r => ({
            ...revive(r, now),
            type: clip(e.subagentType || r.type, 40),
            description: clip(e.description || r.description, 120),
            model: result.model ?? r.model,
          })),
        )
        told.delete(result.agentId) // um agente retomado que falhar de novo é anunciado de novo
        if (shouldSaySpawn(lastSpawnSayAt, now)) {
          lastSpawnSayAt = now
          const rows = await read($, fleet)
          const row = rows.find(r => r.id === result.agentId)
          if (row) await speak($, 'think', spawnSay(row, liveCount(rows)))
        }
      }
    } catch {
      // o Claudin nunca fica entre o Claude e o subagente
    }
    return result
  })

  on('tool.call', async ($, e: any, next) => {
    if (e.agentId) {
      // Ferramenta de subagente só atualiza a linha dele: sem balão, sem lastCmd, sem contagem do turno principal.
      try {
        const now = await $.clock.now()
        told.delete(e.agentId)
        await commitFleet($, rows => upsert(rows, e.agentId, now, r => ({ ...revive(r, now), tools: r.tools + 1, lastTool: String(e.tool) })))
      } catch {
        // idem
      }
      return next(e)
    }
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
    let slow: { cancel: () => void } | null = null
    try {
      if (isRisky) {
        await speak($, 'alert', `Cuidado: ${short(e.command, 40)} pode apagar ou sobrescrever coisas. Confira antes de aprovar.`)
      } else {
        await speak($, line[0], line[1])
      }
      if (t === 'Bash' && typeof e.command === 'string') await update($, lastCmd, () => e.command)
      if ((t === 'Edit' || t === 'Write') && e.file_path) await update($, lastFile, () => e.file_path)
      await update($, turn, (s: TurnStats) => ({
        ...s,
        files: (t === 'Edit' || t === 'Write') && e.file_path && !s.files.includes(e.file_path) ? [...s.files, e.file_path] : s.files,
        cmds: t === 'Bash' ? s.cmds + 1 : s.cmds,
        errors: s.errors,
      }))
      slow = $.clock.after(SLOW_MS, () => {
        speak($, 'run', `Ainda rodando: ${target} (${SLOW_MS / 1000} s+).`)
      })
    } catch {
      // o balão não pode impedir a ferramenta
    }
    let ran: any
    try {
      ran = await next(e)
    } finally {
      slow?.cancel()
    }
    try {
      if (ran && (ran.isError === true || ran.deny !== undefined)) {
        await update($, turn, (s: TurnStats) => ({ ...s, errors: s.errors + 1 }))
        await speak($, 'err', `Falhou: ${t === 'Bash' ? short(e.command, 28) : `${t} ${target}`}. Quer que eu investigue?`, {
          label: 'investigar',
          text: `Investigue por que falhou: ${t === 'Bash' ? e.command : `${t} em ${e.file_path ?? ''}`}. Explique a causa e proponha o próximo passo.`,
        })
      }
    } catch {
      // idem
    }
    return ran
  })

  on('session.compact', async ($, e, next) => {
    // Nada aqui pode impedir o /compact: o que falhar é engolido.
    try {
      await speak($, 'think', 'Compactando a sessão.')
    } catch {
      // idem
    }
    const result = await next(e)
    try {
      // Janela nova: atualiza a leitura e rearma o aviso para quando ela encher de novo.
      const after = await loadContext($)
      const lv = presetById(await read($, ctxPreset)).levels
      await update($, ctxLevel, () => contextLevel(after, lv))
    } catch {
      // idem
    }
    return result
  })

  on('turn.complete', async ($, e: any, next) => {
    if (e.agentId) {
      // Fim do turno de um subagente: desfecho na frota, sem o resumo do turno principal.
      try {
        const now = await $.clock.now()
        if (e.reason === 'aborted') told.add(e.agentId)
        await commitFleet($, rows => finish(rows, e.agentId, e.reason === 'answer' ? 'done' : 'failed', now))
      } catch {
        // idem
      }
      return next(e)
    }
    // O resumo e o aviso de contexto nunca podem barrar o fim do turno: o que falhar é engolido.
    try {
      await sayTurnEnd($, e)
    } catch {
      // idem
    }
    await refreshPanel($)
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
    await loadSkin($)
    await loadSize($)
    await loadCtxPreset($)
    await loadCenario($)
    await refreshPanel($)
    await loadMinis($)
    await loadShortcuts($)
    await loadCofre($)
    await loadCofreDeadlines($)
    await loadCofreView($)
    await loadCola($)
    await loadFavs($)
    await loadTimers($)
    await loadDeadlines($)
    await loadReminders($)
    await greetToday($, false)
    await loadCommands($)
    await syncFleet($)
    $.clock.every(1500, () => stroll($))
    return next(e)
  })
}
