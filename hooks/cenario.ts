// QG do Claudin no Mangue: a faixa de pixel art atrás do mascote. Tudo aqui é puro (sem `$`): a luz por hora do
// relógio, o relógio de parede que só mostra o pomodoro e os pontos que abrem as abas da caixa de ferramentas.
// A imagem e o que se acrescenta a ela vão num ÚNICO SVG: o desktop mede o layout em células, e dois elementos
// empilhados deixam uma emenda.

export const QG_LIMIT = 131072 // caracteres que o Svg do mod aceita

// Ponto do QG: o retângulo do objeto na imagem (fração da largura e da altura), a aba que abre, o ícone que é o botão
// e o centro onde ele fica (cx, cy). `always` deixa o ícone aceso; os outros ficam apagados até o ponteiro passar.
export type Spot = { id: 'sobre' | 'cola' | 'luz' | 'neon' | 'frota' | 'cofre' | 'agenda' | 'tempo' | 'servidor'; tab: string; label: string; name: string; pin: string; cx: number; cy: number; always?: boolean; x0: number; y0: number; x1: number; y1: number }

export const SPOTS: Spot[] = [
  { id: 'sobre', tab: 'sobre', label: 'Placa de madeira: sobre o Claudin', name: 'Sobre', pin: 'ℹ️', cx: 0.117, cy: 0.177, x0: 0.1, y0: 0.12, x1: 0.158, y1: 0.62 },
  { id: 'cola', tab: 'comandos', label: 'Livros e pastas de skills: a Cola da oficina', name: 'Cola', pin: '📚', cx: 0.254, cy: 0.127, x0: 0.16, y0: 0.113, x1: 0.27, y1: 0.279 },
  { id: 'luz', tab: '', label: 'Lanterna: acende e apaga a luz da sala', name: 'Luz', pin: '💡', cx: 0.294, cy: 0.57, always: true, x0: 0.278, y0: 0.02, x1: 0.32, y1: 0.75 },
  { id: 'frota', tab: 'frota', label: 'Monitores: a frota de agentes', name: 'Frota', pin: '🦀', cx: 0.35, cy: 0.234, always: true, x0: 0.326, y0: 0.108, x1: 0.521, y1: 0.69 },
  { id: 'neon', tab: '', label: 'Segundo interruptor: o modo neon', name: 'Neon', pin: '🔮', cx: 0.537, cy: 0.57, always: true, x0: 0.523, y0: 0.02, x1: 0.551, y1: 0.75 },
  { id: 'cofre', tab: 'cofre', label: 'Cofre: o cofre de contexto', name: 'Cofre', pin: '🔐', cx: 0.573, cy: 0.443, x0: 0.553, y0: 0.318, x1: 0.614, y1: 0.589 },
  { id: 'agenda', tab: 'prazos', label: 'Calendário: a Agenda', name: 'Agenda', pin: '📅', cx: 0.685, cy: 0.36, x0: 0.6285, y0: 0.318, x1: 0.705, y1: 0.576 },
  { id: 'servidor', tab: 'acoes', label: 'Servidor: ações e janela de contexto', name: 'Ações', pin: '⚡', cx: 0.752, cy: 0.563, x0: 0.725, y0: 0.252, x1: 0.797, y1: 0.935 },
  { id: 'tempo', tab: 'tempo', label: 'Relógio: o pomodoro', name: 'Tempo', pin: '⏱', cx: 0.842, cy: 0.2, x0: 0.818, y0: 0.103, x1: 0.866, y1: 0.31 },
]

// Onde fica o canto do ícone dentro da zona (fração da zona): o centro marcado menos meia célula de largura (~1% da
// faixa) e meia linha de altura (~5,5% da faixa), sem sair da zona.
export const ICON_HALF_W = 0.01
export const ICON_HALF_H = 0.055
export function iconAt(sp: Spot): { ix: number; iy: number } {
  const clamp = (v: number) => Math.max(0, Math.min(0.95, v))
  return { ix: clamp((sp.cx - ICON_HALF_W - sp.x0) / (sp.x1 - sp.x0)), iy: clamp((sp.cy - ICON_HALF_H - sp.y0) / (sp.y1 - sp.y0)) }
}

// Porcentagens CSS de uma zona, para o desktop pôr o retângulo clicável sobre o objeto.
// Inteiro: o motor só aceita porcentagem inteira ("12%"), e 1% da faixa é menos de um objeto.
export const pct = (f: number): string => `${Math.round(Math.max(0, Math.min(1, f)) * 100)}%`

// As quatro bancadas, onde as miniaturas da frota ficam em pé (fração da largura).
export const STATIONS = [0.378, 0.467, 0.563, 0.658]
// Linha do chão onde as miniaturas pisam (fração da altura).
export const FLOOR_Y = 0.92

// O relógio de parede, em frações da imagem: centro e raio horizontal (a imagem é 360x76).
const CLOCK = { cx: 303.0 / 360, cy: 15.2 / 76, r: 7.8 }
// Lanternas (fração da largura e da altura): é por onde a luz sai à noite.
const LAMPS: [number, number][] = [
  [0.292, 0.138],
  [0.339, 0.055],
  [0.482, 0.055],
  [0.536, 0.138],
  [0.717, 0.055],
]
// Raio da luz das lanternas (fração da largura): o buraco na escuridão e o brilho quente.
export const LAMP_HOLE = 0.07
export const LAMP_GLOW = 0.055
// Telas dos monitores (fração: x, y, largura, altura), que brilham à noite.
const SCREENS: [number, number, number, number][] = [
  [0.33, 0.14, 0.18, 0.2],
  [0.33, 0.38, 0.18, 0.2],
]

export const stationCol = (i: number, cols: number): number => Math.max(0, Math.round((STATIONS[i] ?? 0) * cols) - 1)

// ── a luz do dia ──
export type Sky = { dark: number; warm: boolean; lamps: boolean }

// Escuridão ao longo do dia, em minutos desde a meia-noite: [minuto, escuridão de 0 a 1].
const DARK: [number, number][] = [
  [0, 0.62],
  [300, 0.6],
  [360, 0.38],
  [420, 0.1],
  [480, 0],
  [960, 0],
  [1020, 0.1],
  [1080, 0.28],
  [1140, 0.46],
  [1200, 0.58],
  [1440, 0.62],
]

export function skyAt(minutes: number): Sky {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return { dark: 0, warm: false, lamps: false }
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440
  let dark = 0
  for (let i = 1; i < DARK.length; i++) {
    const [m0, d0] = DARK[i - 1]!
    const [m1, d1] = DARK[i]!
    if (m <= m1) {
      dark = d0 + ((d1 - d0) * (m - m0)) / (m1 - m0)
      break
    }
  }
  const warm = (m >= 330 && m <= 450) || (m >= 960 && m <= 1110) // amanhecer e fim da tarde
  return { dark: Math.round(dark * 1000) / 1000, warm, lamps: dark >= 0.3 }
}

// ── o relógio de parede: só o pomodoro ──
export type Pomo = { fraction: number }
type TimerLike = { label: string; endsAt: number; ms?: number; paused?: number }

// Quanto falta do primeiro pomodoro ativo (0 a 1 do total), ou null sem pomodoro. O total vem do rótulo ("pomodoro 25 min").
export function pomodoroOf(timers: TimerLike[], now: number): Pomo | null {
  const t = timers.find(x => /^pomodoro/i.test(x.label))
  if (!t) return null
  const minutes = Number(/(\d+)\s*min/i.exec(t.label)?.[1] ?? 25) || 25
  const total = t.ms && t.ms > 0 ? t.ms : minutes * 60_000 // o timer grava o total; sem ele vale o rótulo
  const left = t.paused !== undefined ? t.paused : t.endsAt - now
  return { fraction: Math.round(Math.max(0, Math.min(1, left / total)) * 1000) / 1000 }
}

// A fatia vermelha que falta, a partir das 12 horas no sentido horário. Cheia vira um disco; vazia, nada.
function wedge(w: number, h: number, fraction: number): string {
  if (!(fraction > 0)) return ''
  const cx = CLOCK.cx * w
  const cy = CLOCK.cy * h
  const rr = CLOCK.r - 2.4
  if (fraction >= 0.999) return `<circle class="pomo" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${rr}" fill="#e0483a" shape-rendering="auto"/>`
  const a = fraction * Math.PI * 2
  const x = cx + rr * Math.sin(a)
  const y = cy - rr * Math.cos(a)
  const large = fraction > 0.5 ? 1 : 0
  return `<path class="pomo" d="M${cx.toFixed(2)} ${cy.toFixed(2)}L${cx.toFixed(2)} ${(cy - rr).toFixed(2)}A${rr} ${rr} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z" fill="#e0483a" shape-rendering="auto"/>`
}

// Sem pomodoro, o relógio marca a hora do computador: ponteiro das horas curto e grosso, dos minutos longo.
function hands(w: number, h: number, minutes: number): string {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return ''
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440
  const cx = CLOCK.cx * w
  const cy = CLOCK.cy * h
  const r = CLOCK.r - 2.4
  const hand = (turn: number, len: number, width: number) => {
    const a = turn * Math.PI * 2
    return `<line x1="${cx.toFixed(2)}" y1="${cy.toFixed(2)}" x2="${(cx + len * Math.sin(a)).toFixed(2)}" y2="${(cy - len * Math.cos(a)).toFixed(2)}" stroke="#2b1a10" stroke-width="${width}" stroke-linecap="round"/>`
  }
  return `<g class="hands" shape-rendering="auto">${hand(((m / 60) % 12) / 12, r * 0.55, 1.1)}${hand((m % 60) / 60, r * 0.9, 0.7)}<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="0.7" fill="#e0483a"/></g>`
}

// ── os monitores: um painel com o que vale a pena ver da sessão ──
// Telas da parede (fração x0, y0, x1, y1), da esquerda para a direita e de cima para baixo.
export const MONITORS: [number, number, number, number][] = [
  [0.338, 0.187, 0.363, 0.28],
  [0.33, 0.333, 0.363, 0.495],
  [0.372, 0.333, 0.418, 0.495],
  [0.428, 0.333, 0.466, 0.495],
  [0.477, 0.333, 0.513, 0.495],
  [0.33, 0.533, 0.363, 0.682],
  [0.372, 0.533, 0.418, 0.682],
  [0.428, 0.533, 0.466, 0.682],
  [0.477, 0.533, 0.513, 0.682],
]

export type Panel = { model?: string; ctx?: number | null; tokens?: number; window?: number; usd?: number; limit5h?: number; limit7d?: number; agents?: number; tools?: number }

// "claude-opus-5-5" vira "OPUS 5.5"; desconhecido, as primeiras letras.
export function modelShort(id: string | undefined): string {
  if (!id) return ''
  const m = /(opus|sonnet|haiku|fable)[-_ ]?(\d+)?(?:[-_.](\d{1,2})(?!\d))?/i.exec(id)
  if (!m) return id.replace(/^claude-/i, '').slice(0, 6).toUpperCase()
  return [m[1]!.toUpperCase(), m[2] ? (m[3] ? `${m[2]}.${m[3]}` : m[2]) : ''].filter(Boolean).join(' ')
}

export const kTokens = (n: number): string => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n)))

// O painel em três monitores desenhados com moldura própria (não dependem do encaixe na arte), cada um com pouca
// coisa e letra grande: em cima modelo e contexto; no meio tokens, custo e limites; embaixo agentes e comandos.
export const DISPLAY: [number, number, number, number] = [0.37, 0.108, 0.512, 0.302]
export const DISPLAY_MID: [number, number, number, number] = [0.369, 0.326, 0.516, 0.5]
export const DISPLAY_LOW: [number, number, number, number] = [0.369, 0.528, 0.516, 0.69]

const pad = (a: string, b: string, width: number) => {
  const gap = Math.max(1, width - a.length - b.length)
  return a + ' '.repeat(gap) + b
}

// As linhas de cada monitor, só com o que existe.
export function panelLines(p: Panel): { top: string[]; mid: string[]; low: string[] } {
  const W = 16
  const model = modelShort(p.model)
  const ctx = typeof p.ctx === 'number' ? `CTX ${p.ctx}%` : ''
  const tok = typeof p.tokens === 'number' ? `TOK ${kTokens(p.tokens)}` : ''
  const usd = typeof p.usd === 'number' ? `$${p.usd.toFixed(2)}` : ''
  const l5 = typeof p.limit5h === 'number' ? `5H ${Math.round(p.limit5h)}%` : ''
  const l7 = typeof p.limit7d === 'number' ? `7D ${Math.round(p.limit7d)}%` : ''
  const top = [model, ctx].filter(Boolean)
  const mid = [tok || usd ? pad(tok, usd, W) : '', l5 || l7 ? pad(l5, l7, W) : ''].filter(Boolean)
  const low = typeof p.agents === 'number' || typeof p.tools === 'number' ? [pad(`AGT ${p.agents ?? 0}`, `CMD ${p.tools ?? 0}`, W)] : []
  return { top, mid, low }
}

// Um monitor desenhado: moldura, tela e as linhas centradas, com letra do maior tamanho que cabe.
function monitor(r: [number, number, number, number], lines: string[], w: number, h: number, hot: boolean[] = []): string {
  if (lines.length === 0) return ''
  const esc = (t: string) => t.replace(/[<>&]/g, '')
  const [x0, y0, x1, y1] = r
  const X = x0 * w
  const Y = y0 * h
  const W = (x1 - x0) * w
  const H = (y1 - y0) * h
  const b = 1.2
  const longest = Math.max(...lines.map(l => l.length), 1)
  const fs = Math.min((W - 2 * b - 1.5) / (longest * 0.6), (H - 2 * b - 0.6) / (lines.length * 1.1))
  const cx = X + W / 2
  const block = lines.length * fs * 1.1
  const top = Y + b + (H - 2 * b - block) / 2 + fs * 0.88
  let out = `<rect x="${X.toFixed(1)}" y="${Y.toFixed(1)}" width="${W.toFixed(1)}" height="${H.toFixed(1)}" rx="0.8" fill="#2a2d2b"/>`
  out += `<rect x="${(X + b).toFixed(1)}" y="${(Y + b).toFixed(1)}" width="${(W - 2 * b).toFixed(1)}" height="${(H - 2 * b).toFixed(1)}" fill="#03170a"/>`
  lines.forEach((t, k) => {
    out += `<text x="${cx.toFixed(1)}" y="${(top + k * fs * 1.1).toFixed(1)}" font-size="${fs.toFixed(2)}" fill="${hot[k] ? '#ffcf7a' : '#b9ffc8'}" text-anchor="middle" font-family="monospace" font-weight="700" xml:space="preserve">${esc(t)}</text>`
  })
  return out
}

export function panelSvg(p: Panel, working = false, w = 360, h = 76): string {
  const { top, mid, low } = panelLines(p)
  let out = `<g class="panel" shape-rendering="auto">`
  out += monitor(DISPLAY, top, w, h, [false, (p.ctx ?? 0) >= 70])
  out += monitor(DISPLAY_MID, mid, w, h, [false, (p.limit5h ?? 0) >= 80])
  out += monitor(DISPLAY_LOW, low, w, h)
  if (typeof p.ctx === 'number') {
    const [x0, , x1, y1] = DISPLAY
    const f = Math.max(0, Math.min(1, p.ctx / 100))
    out += `<rect x="${(x0 * w + 2.2).toFixed(1)}" y="${(y1 * h - 2.1).toFixed(1)}" width="${(((x1 - x0) * w - 4.4) * f).toFixed(2)}" height="0.5" fill="${p.ctx >= 70 ? '#ffcf7a' : '#5fd08a'}"/>`
  }
  if (working) {
    const [, y0, x1] = DISPLAY
    out += `<rect x="${(x1 * w - 3.2).toFixed(1)}" y="${(y0 * h + 2).toFixed(1)}" width="1.1" height="1.1" fill="#b9ffc8"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>`
  }
  return out + '</g>'
}

// ── a vida do cenário: tudo animado dentro do SVG, sem custo de redesenho ──
// Desenhada por cima da escuridão: linhas de "código" nas telas da esquerda, LEDs do servidor, a lua da prateleira
// (só no escuro, quando dá para vê-la) e vaga-lumes verdes piscando pelas raízes do mangue.
const SMALL_SCREENS = [MONITORS[1]!, MONITORS[5]!]
const SERVER = [0.737, 0.3, 0.785, 0.88] // área dos LEDs no rack
const MOON = [0.5715, 0.15] // centro da lua na prateleira

export function ambientSvg(w = 360, h = 76, night = false): string {
  const f = (n: number) => n.toFixed(1)
  let out = '<g class="vida" shape-rendering="auto"><defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="0.9"/></filter></defs>'
  SMALL_SCREENS.forEach(([x0, y0, x1, y1], i) => {
    const X = x0 * w + 1.5
    const W = (x1 - x0) * w - 3
    const H = (y1 - y0) * h
    for (let l = 0; l < 3; l++) {
      const y = y0 * h + H * (0.28 + l * 0.22)
      const dur = 2.2 + ((i * 3 + l * 5) % 7) * 0.45
      const full = f(W * (0.45 + ((i + l) % 3) * 0.2))
      out += `<rect x="${f(X)}" y="${f(y)}" height="0.9" width="0" fill="#9dffb5" opacity=".75"><animate attributeName="width" values="0;${full};${full};0" keyTimes="0;.6;.9;1" dur="${dur.toFixed(2)}s" repeatCount="indefinite"/></rect>`
    }
  })
  const [sx0, sy0, sx1, sy1] = SERVER as [number, number, number, number]
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 3; c++) {
      const x = (sx0 + ((sx1 - sx0) * (c + 0.5)) / 3) * w
      const y = (sy0 + ((sy1 - sy0) * (r + 0.5)) / 7) * h
      const color = (r + c) % 4 === 0 ? '#ffb347' : '#5dff8a'
      const dur = 0.6 + ((r * 7 + c * 3) % 9) * 0.23
      out += `<rect x="${f(x)}" y="${f(y)}" width="0.9" height="0.9" fill="${color}"><animate attributeName="opacity" values="1;.15;1" dur="${dur.toFixed(2)}s" repeatCount="indefinite"/></rect>`
    }
  }
  if (night) {
    out += `<circle class="lua" cx="${f(MOON[0]! * w)}" cy="${f(MOON[1]! * h)}" r="4.6" fill="#fff1b0" opacity=".6" filter="url(#glow)"><animate attributeName="opacity" values=".35;.95;.35" dur="4s" repeatCount="indefinite"/></circle>`
    out += `<circle cx="${f(MOON[0]! * w)}" cy="${f(MOON[1]! * h)}" r="1.8" fill="#fffbe6" opacity=".85"><animate attributeName="opacity" values=".55;1;.55" dur="4s" repeatCount="indefinite"/></circle>`
  }
  // Vaga-lumes verdes: um halo borrado e um ponto, piscando fora de compasso; de dia, mais discretos.
  const paths = [
    'M10 20 q8 -6 14 4 t10 8 t-12 10 t-10 -12z',
    'M20 50 q10 -8 16 2 t-4 12 t-14 -6z',
    'M6 36 q6 -10 12 -2 t4 10 t-12 -2z',
    'M28 10 q6 4 2 10 t-10 2 t8 -12z',
    'M14 64 q8 -6 14 0 t-4 8 t-10 -8z',
    'M335 18 q-8 8 -14 0 t-8 10 t12 8 t10 -18z',
    'M345 46 q-10 6 -16 -2 t2 -10 t14 12z',
    'M352 30 q-6 -8 -12 -2 t-2 10 t14 -8z',
    'M326 58 q8 -4 12 2 t-4 8 t-8 -10z',
    'M340 66 q-8 -6 -14 0 t4 8 t10 -8z',
  ]
  const peak = night ? 1 : 0.7
  paths.forEach((d, i) => {
    const dur = 9 + i * 2.1
    const blink = `<animate attributeName="opacity" values="0;${peak};${peak};0;0" keyTimes="0;.15;.45;.6;1" dur="${(2 + (i % 4) * 0.7).toFixed(1)}s" begin="${(i * 0.37).toFixed(2)}s" repeatCount="indefinite"/>`
    out += `<g opacity="0"><animateMotion path="${d}" dur="${dur.toFixed(1)}s" repeatCount="indefinite"/>${blink}<circle r="2" fill="#7dff4a" opacity=".55" filter="url(#glow)"/><circle r="0.75" fill="#e2ffb0"/></g>`
  })
  return out + '</g>'
}

// ── modo neon: o segundo interruptor deixa a sala com cara de laboratório ──
// Um tom roxo por cima e tiras de neon (ciano e magenta) na prateleira, nas bancadas, no rack e no chão, pulsando.
export function neonSvg(w = 360, h = 76): string {
  const f = (n: number) => n.toFixed(1)
  const strip = (x0: number, y: number, x1: number, color: string, dur: number) =>
    `<line x1="${f(x0 * w)}" y1="${f(y * h)}" x2="${f(x1 * w)}" y2="${f(y * h)}" stroke="${color}" stroke-width="0.9" stroke-linecap="round"><animate attributeName="opacity" values=".6;1;.6" dur="${dur}s" repeatCount="indefinite"/></line>` +
    `<line x1="${f(x0 * w)}" y1="${f(y * h)}" x2="${f(x1 * w)}" y2="${f(y * h)}" stroke="${color}" stroke-width="3" opacity=".45" filter="url(#neonglow)"/>`
  let out = `<g class="neon" shape-rendering="auto"><defs><filter id="neonglow" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>`
  out += `<rect width="${w}" height="${h}" fill="#3b0a6e" opacity=".22"/>`
  out += strip(0.548, 0.255, 0.7, '#00f0ff', 2.4)
  out += strip(0.165, 0.29, 0.27, '#ff2bd6', 2.9)
  out += strip(0.33, 0.715, 0.52, '#ff2bd6', 2.1)
  out += strip(0.55, 0.715, 0.72, '#00f0ff', 2.7)
  out += strip(0.03, 0.965, 0.97, '#a84bff', 3.3)
  const [sx0, sy0, sx1, sy1] = [0.727, 0.255, 0.795, 0.93]
  out += `<rect x="${f(sx0 * w)}" y="${f(sy0 * h)}" width="${f((sx1 - sx0) * w)}" height="${f((sy1 - sy0) * h)}" fill="none" stroke="#00f0ff" stroke-width="0.7"><animate attributeName="opacity" values=".5;1;.5" dur="1.8s" repeatCount="indefinite"/></rect>`
  return out + '</g>'
}

// Um véu escuro bem leve na imagem toda, para o Claudin e as miniaturas se destacarem do fundo.
export const VEIL = 0.1

// ── a imagem com luz e relógio ──
export type QgState = { w: number; h: number; minutes: number; pomo: Pomo | null; lightsOff?: boolean; neon?: boolean; panel?: Panel | null; working?: boolean }

// O monitor pequeno de cima à esquerda pulsa em coral enquanto há agentes.
export function fleetPulse(agents: number, w = 360, h = 76): string {
  if (!(agents > 0)) return ''
  const [x0, y0, x1, y1] = MONITORS[0]!
  return `<rect class="pulse" x="${(x0 * w).toFixed(1)}" y="${(y0 * h).toFixed(1)}" width="${((x1 - x0) * w).toFixed(1)}" height="${((y1 - y0) * h).toFixed(1)}" fill="#ff8a5c" opacity=".2" shape-rendering="auto"><animate attributeName="opacity" values=".1;.55;.1" dur="1.2s" repeatCount="indefinite"/></rect>`
}

function lightBody(w: number, h: number, sky0: Sky, lightsOff = false): string {
  // Luz apagada: de dia a sala escurece um pouco; à noite as lanternas não abrem a escuridão.
  const sky: Sky = lightsOff ? { ...sky0, dark: Math.min(0.75, sky0.dark + 0.18), lamps: false } : sky0
  if (sky.dark <= 0) return ''
  const X = (f: number) => (f * w).toFixed(1)
  const Y = (f: number) => (f * h).toFixed(1)
  const tint = sky.warm ? '#ff8a3d' : '#0b1440'
  const holes = sky.lamps ? LAMPS.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${(w * LAMP_HOLE).toFixed(1)}" fill="url(#hole)"/>`).join('') : ''
  const glows = sky.lamps ? LAMPS.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${(w * LAMP_GLOW).toFixed(1)}" fill="url(#warm)" shape-rendering="auto"/>`).join('') : ''
  const screens = sky.dark >= 0.3 ? SCREENS.map(([x, y, rw, rh]) => `<rect x="${X(x)}" y="${Y(y)}" width="${X(rw)}" height="${Y(rh)}" fill="#7cc8ff" opacity=".22" filter="url(#blur)" shape-rendering="auto"/>`).join('') : ''
  const defs =
    `<radialGradient id="warm"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="hole"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>` +
    `<filter id="blur"><feGaussianBlur stdDeviation="${(w / 120).toFixed(1)}"/></filter>` +
    `<mask id="lit"><rect width="${w}" height="${h}" fill="#fff"/>${holes}</mask>`
  return `<defs>${defs}</defs><rect width="${w}" height="${h}" fill="${tint}" opacity="${sky.dark}" shape-rendering="auto" mask="url(#lit)"/>${glows}${screens}`
}

// A imagem com o véu, a luz da hora e o relógio (fatia do pomodoro ou ponteiros) dentro do mesmo SVG.
export function composeQg(base: string, s: QgState): string {
  const veil = `<rect width="${s.w}" height="${s.h}" fill="#140b05" opacity="${VEIL}"/>`
  const night = skyAt(s.minutes).dark >= 0.3 || !!s.lightsOff
  const body = veil + lightBody(s.w, s.h, skyAt(s.minutes), s.lightsOff) + (s.neon ? neonSvg(s.w, s.h) : '') + ambientSvg(s.w, s.h, night) + (s.panel ? panelSvg(s.panel, s.working, s.w, s.h) + fleetPulse(s.panel.agents ?? 0, s.w, s.h) : '') + (s.pomo ? wedge(s.w, s.h, s.pomo.fraction) : hands(s.w, s.h, s.minutes))
  const end = base.lastIndexOf('</svg>')
  if (end < 0) return base
  const out = base.slice(0, end) + body + base.slice(end)
  if (out.length <= QG_LIMIT) return out
  // Arte grande demais para a luz: fica só o relógio, e se nem assim couber, a imagem como está.
  const clock = (s.panel ? panelSvg(s.panel, s.working, s.w, s.h) : '') + (s.pomo ? wedge(s.w, s.h, s.pomo.fraction) : hands(s.w, s.h, s.minutes))
  const light = base.slice(0, end) + clock + base.slice(end)
  return light.length <= QG_LIMIT ? light : base
}

// Contorno escuro e sombra num personagem (o Claudin, uma miniatura) para ele saltar do cenário. O viewBox ganha
// uma margem para o contorno não ser cortado na borda; o desenho encolhe um pouco por isso.
export function withOutline(svg: string): string {
  const vb = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg)
  if (!vb || svg.includes('id="ol"')) return svg
  const [x, y, w, h] = vb.slice(1).map(Number) as [number, number, number, number]
  const pad = Math.max(w, h) * 0.06
  const box = `viewBox="${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}"`
  const open = svg.indexOf('>', svg.indexOf('<svg')) + 1
  const end = svg.lastIndexOf('</svg>')
  if (open <= 0 || end < open) return svg
  const r = (pad * 0.5).toFixed(2)
  const filter =
    `<defs><filter id="ol" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d"/>` +
    `<feFlood flood-color="#120a04" flood-opacity=".8"/><feComposite in2="d" operator="in" result="o"/>` +
    `<feGaussianBlur in="d" stdDeviation="${r}" result="b"/><feOffset in="b" dy="${r}" result="s"/>` +
    `<feFlood flood-color="#000" flood-opacity=".45"/><feComposite in2="s" operator="in" result="sh"/>` +
    `<feMerge><feMergeNode in="sh"/><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
  return svg.slice(0, open).replace(vb[0], box) + filter + `<g filter="url(#ol)">` + svg.slice(open, end) + '</g></svg>'
}
