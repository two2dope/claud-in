// QG do Claudin no Mangue: a faixa de pixel art atrás do mascote. Tudo aqui é puro (sem `$`): a luz por hora do
// relógio, o relógio de parede que só mostra o pomodoro e os pontos que abrem as abas da caixa de ferramentas.
// A imagem e o que se acrescenta a ela vão num ÚNICO SVG: o desktop mede o layout em células, e dois elementos
// empilhados deixam uma emenda.

export const QG_LIMIT = 131072 // caracteres que o Svg do mod aceita

// Ponto clicável: onde fica na imagem (fração da largura e da altura), a aba que abre e o emoji do botão.
export type Spot = { id: 'cola' | 'frota' | 'cofre' | 'agenda' | 'tempo'; tab: string; label: string; pin: string; x0: number; y0: number; x1: number; y1: number }

export const SPOTS: Spot[] = [
  { id: 'cola', tab: 'comandos', label: 'Pastas de skills: a Cola da oficina', pin: '📚', x0: 0.16, y0: 0.113, x1: 0.27, y1: 0.279 },
  { id: 'frota', tab: 'frota', label: 'Monitores: a frota de agentes', pin: '🦀', x0: 0.322, y0: 0.113, x1: 0.521, y1: 0.7 },
  { id: 'cofre', tab: 'cofre', label: 'Cofre: o cofre de contexto', pin: '🔐', x0: 0.554, y0: 0.321, x1: 0.613, y1: 0.596 },
  { id: 'agenda', tab: 'prazos', label: 'Calendário: a Agenda', pin: '📅', x0: 0.629, y0: 0.324, x1: 0.706, y1: 0.572 },
  { id: 'tempo', tab: 'tempo', label: 'Relógio: o pomodoro', pin: '⏱', x0: 0.82, y0: 0.097, x1: 0.863, y1: 0.303 },
]

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
// Telas dos monitores (fração: x, y, largura, altura), que brilham à noite.
const SCREENS: [number, number, number, number][] = [
  [0.33, 0.14, 0.18, 0.2],
  [0.33, 0.38, 0.18, 0.2],
]

// Coluna (0 a cols) do botão de um ponto: a do meio dele.
export const pinCol = (s: Spot, cols: number): number => Math.max(0, Math.round(((s.x0 + s.x1) / 2) * cols) - 1)
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

// ── a imagem com luz e relógio ──
export type QgState = { w: number; h: number; minutes: number; pomo: Pomo | null }

function lightBody(w: number, h: number, sky: Sky): string {
  if (sky.dark <= 0) return ''
  const X = (f: number) => (f * w).toFixed(1)
  const Y = (f: number) => (f * h).toFixed(1)
  const tint = sky.warm ? '#ff8a3d' : '#0b1440'
  const holes = sky.lamps ? LAMPS.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${(w * 0.11).toFixed(1)}" fill="url(#hole)"/>`).join('') : ''
  const glows = sky.lamps ? LAMPS.map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${(w * 0.09).toFixed(1)}" fill="url(#warm)" shape-rendering="auto"/>`).join('') : ''
  const screens = sky.lamps ? SCREENS.map(([x, y, rw, rh]) => `<rect x="${X(x)}" y="${Y(y)}" width="${X(rw)}" height="${Y(rh)}" fill="#7cc8ff" opacity=".22" filter="url(#blur)" shape-rendering="auto"/>`).join('') : ''
  const defs =
    `<radialGradient id="warm"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="hole"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>` +
    `<filter id="blur"><feGaussianBlur stdDeviation="${(w / 120).toFixed(1)}"/></filter>` +
    `<mask id="lit"><rect width="${w}" height="${h}" fill="#fff"/>${holes}</mask>`
  return `<defs>${defs}</defs><rect width="${w}" height="${h}" fill="${tint}" opacity="${sky.dark}" shape-rendering="auto" mask="url(#lit)"/>${glows}${screens}`
}

// A imagem com a luz da hora e a fatia do pomodoro acrescentadas dentro do mesmo SVG ('base' se nada muda).
export function composeQg(base: string, s: QgState): string {
  const body = lightBody(s.w, s.h, skyAt(s.minutes)) + (s.pomo ? wedge(s.w, s.h, s.pomo.fraction) : '')
  if (!body) return base
  const end = base.lastIndexOf('</svg>')
  return base.slice(0, end) + body + base.slice(end)
}
