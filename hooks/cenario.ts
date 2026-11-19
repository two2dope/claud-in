// QG do Claudin no Mangue: a faixa de pixel art atrás do mascote. Tudo aqui é puro (sem `$`): a luz por hora do
// relógio, o relógio de parede que só mostra o pomodoro e os pontos que abrem as abas da caixa de ferramentas.
// A imagem e o que se acrescenta a ela vão num ÚNICO SVG: o desktop mede o layout em células, e dois elementos
// empilhados deixam uma emenda.

export const QG_LIMIT = 131072 // caracteres que o Svg do mod aceita

// Zona clicável: o retângulo do objeto na imagem (fração da largura e da altura), a aba que abre e o nome curto
// que aparece no destaque quando o ponteiro passa por cima.
export type Spot = { id: 'cola' | 'luz' | 'frota' | 'cofre' | 'agenda' | 'tempo' | 'servidor'; tab: string; label: string; name: string; x0: number; y0: number; x1: number; y1: number }

export const SPOTS: Spot[] = [
  { id: 'cola', tab: 'comandos', label: 'Livros e pastas de skills: a Cola da oficina', name: 'Cola', x0: 0.16, y0: 0.113, x1: 0.27, y1: 0.279 },
  { id: 'luz', tab: '', label: 'Lanterna: acende e apaga a luz da sala', name: 'Luz', x0: 0.285, y0: 0.02, x1: 0.318, y1: 0.3 },
  { id: 'frota', tab: 'frota', label: 'Monitores: a frota de agentes', name: 'Frota', x0: 0.33, y0: 0.14, x1: 0.534, y1: 0.72 },
  { id: 'cofre', tab: 'cofre', label: 'Cofre: o cofre de contexto', name: 'Cofre', x0: 0.554, y0: 0.321, x1: 0.613, y1: 0.596 },
  { id: 'agenda', tab: 'prazos', label: 'Calendário: a Agenda', name: 'Agenda', x0: 0.629, y0: 0.324, x1: 0.706, y1: 0.572 },
  { id: 'servidor', tab: 'acoes', label: 'Servidor: ações e janela de contexto', name: 'Ações', x0: 0.727, y0: 0.24, x1: 0.792, y1: 0.92 },
  { id: 'tempo', tab: 'tempo', label: 'Relógio: o pomodoro', name: 'Tempo', x0: 0.82, y0: 0.097, x1: 0.863, y1: 0.303 },
]

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
  [0.38, 0.152, 0.429, 0.32],
  [0.433, 0.152, 0.482, 0.32],
  [0.332, 0.354, 0.375, 0.53],
  [0.382, 0.354, 0.427, 0.53],
  [0.436, 0.354, 0.482, 0.53],
  [0.489, 0.354, 0.532, 0.53],
  [0.332, 0.555, 0.375, 0.715],
  [0.382, 0.555, 0.427, 0.715],
  [0.436, 0.555, 0.482, 0.715],
  [0.489, 0.555, 0.532, 0.715],
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

// Uma tela: rótulo pequeno em cima, valor embaixo; e, se houver, uma barra de 0 a 1 no rodapé.
function screen(i: number, w: number, h: number, label: string, value: string, bar?: number, hot = false): string {
  const r = MONITORS[i]
  if (!r) return ''
  const [x0, y0, x1, y1] = r
  const x = ((x0 + x1) / 2) * w
  const top = y0 * h
  const sh = (y1 - y0) * h
  const sw = (x1 - x0) * w
  const ink = hot ? '#ffcf7a' : '#b8ffc4'
  let out = `<rect x="${(x0 * w).toFixed(1)}" y="${top.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" fill="#06210f" opacity=".72"/>`
  out += `<text x="${x.toFixed(1)}" y="${(top + sh * 0.36).toFixed(1)}" font-size="${(sh * 0.26).toFixed(2)}" fill="#5fd08a" text-anchor="middle" font-family="monospace" font-weight="700">${label}</text>`
  out += `<text x="${x.toFixed(1)}" y="${(top + sh * 0.76).toFixed(1)}" font-size="${(sh * 0.34).toFixed(2)}" fill="${ink}" text-anchor="middle" font-family="monospace" font-weight="700">${value}</text>`
  if (typeof bar === 'number' && Number.isFinite(bar)) {
    const b = Math.max(0, Math.min(1, bar))
    const bx = x0 * w + sw * 0.12
    out += `<rect x="${bx.toFixed(1)}" y="${(top + sh * 0.86).toFixed(1)}" width="${(sw * 0.76 * b).toFixed(2)}" height="${(sh * 0.07).toFixed(2)}" fill="${ink}"/>`
  }
  return out
}

// O painel dos monitores: modelo, contexto, tokens, custo, limites, agentes e ferramentas do turno.
// Trabalhando, um cursor pisca na tela do contexto.
export function panelSvg(p: Panel, working = false, w = 360, h = 76): string {
  const esc = (t: string) => t.replace(/[<>&]/g, '')
  let out = '<g class="panel" shape-rendering="auto">'
  const model = modelShort(p.model)
  if (model) {
    const [name, ver] = model.split(' ')
    out += screen(0, w, h, esc(name ?? ''), esc(ver ?? ''))
  }
  if (typeof p.ctx === 'number') out += screen(1, w, h, 'CTX', `${p.ctx}%`, p.ctx / 100, p.ctx >= 70)
  if (typeof p.tokens === 'number') out += screen(2, w, h, 'TOK', kTokens(p.tokens), p.window ? p.tokens / p.window : undefined)
  if (typeof p.usd === 'number') out += screen(3, w, h, 'US$', p.usd.toFixed(2), undefined, true)
  if (typeof p.limit5h === 'number') out += screen(4, w, h, '5H', `${Math.round(p.limit5h)}%`, p.limit5h / 100, p.limit5h >= 80)
  if (typeof p.limit7d === 'number') out += screen(5, w, h, '7D', `${Math.round(p.limit7d)}%`, p.limit7d / 100, p.limit7d >= 80)
  if (typeof p.agents === 'number') out += screen(6, w, h, 'AGT', String(p.agents))
  if (typeof p.tools === 'number') out += screen(7, w, h, 'CMD', String(p.tools))
  if (working) {
    const r = MONITORS[1]!
    out += `<rect x="${(r[2] * w - 2.2).toFixed(1)}" y="${(r[1] * h + 1.2).toFixed(1)}" width="1.2" height="1.2" fill="#b8ffc4"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></rect>`
  }
  return out + '</g>'
}

// Um véu escuro bem leve na imagem toda, para o Claudin e as miniaturas se destacarem do fundo.
export const VEIL = 0.1

// ── a imagem com luz e relógio ──
export type QgState = { w: number; h: number; minutes: number; pomo: Pomo | null; lightsOff?: boolean; panel?: Panel | null; working?: boolean }

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
  const body = veil + lightBody(s.w, s.h, skyAt(s.minutes), s.lightsOff) + (s.panel ? panelSvg(s.panel, s.working, s.w, s.h) : '') + (s.pomo ? wedge(s.w, s.h, s.pomo.fraction) : hands(s.w, s.h, s.minutes))
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
