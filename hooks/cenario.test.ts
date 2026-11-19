import { describe, expect, test } from 'claude-code/testing'

import { QG_ART } from './cenario-arte'
import { QG_LIMIT, MONITORS, ambientSvg, fleetPulse, SPOTS, kTokens, modelShort, panelSvg, STATIONS, composeQg, pct, pomodoroOf, skyAt, stationCol, withOutline } from './cenario'

const HORA = (h: number, m = 0) => h * 60 + m

describe('QG: a arte', () => {
  test('é uma faixa 360x76 num único SVG, com a folga que a luz precisa', () => {
    expect(QG_ART.w).toBe(360)
    expect(QG_ART.h).toBe(76)
    expect(QG_ART.svg.length).toBeLessThanOrEqual(QG_LIMIT - 12_000)
    expect(QG_ART.svg.startsWith('<svg ')).toBe(true)
    expect(QG_ART.svg.endsWith('</svg>')).toBe(true)
    expect(QG_ART.svg.match(/<svg /g)?.length).toBe(1)
  })

  test('só tem elementos que o app desenha: caminhos, sem <image>, script ou estilo', () => {
    expect(QG_ART.svg).not.toMatch(/<image|<script|<style|<foreignObject/)
    expect(QG_ART.svg).toContain('<path ')
  })
})

describe('QG: pontos clicáveis e bancadas', () => {
  test('oito zonas, cada uma com a aba que abre, dentro da imagem', () => {
    expect(SPOTS.map(s => [s.id, s.tab])).toEqual([['sobre', 'sobre'], ['cola', 'comandos'], ['luz', ''], ['frota', 'frota'], ['cofre', 'cofre'], ['agenda', 'prazos'], ['servidor', 'acoes'], ['tempo', 'tempo']])
    for (const s of SPOTS) {
      expect(s.x0).toBeGreaterThanOrEqual(0)
      expect(s.x1).toBeLessThanOrEqual(1)
      expect(s.y0).toBeGreaterThanOrEqual(0)
      expect(s.y1).toBeLessThanOrEqual(1)
      expect(s.x0).toBeLessThan(s.x1)
      expect(s.y0).toBeLessThan(s.y1)
    }
  })

  test('as quatro bancadas ficam em ordem e dentro da imagem; a zona vira porcentagem CSS', () => {
    expect(STATIONS.length).toBe(4)
    expect([...STATIONS].sort((a, b) => a - b)).toEqual([...STATIONS])
    for (const x of STATIONS) expect(x > 0 && x < 1).toBe(true)
    expect(pct(0.16)).toBe('16%')
    expect(pct(0.1234)).toBe('12%')
    expect(pct(-1)).toBe('0%')
    expect(pct(2)).toBe('100%')
    expect(stationCol(0, 100)).toBe(Math.round(STATIONS[0]! * 100) - 1)
  })
})

describe('QG: a luz muda com a hora do relógio', () => {
  test('meio-dia é dia: sem escuridão e lâmpadas apagadas', () => {
    expect(skyAt(HORA(12))).toMatchObject({ dark: 0, lamps: false })
  })

  test('meia-noite é noite: escuro, lâmpadas acesas, tom azul', () => {
    const noite = skyAt(HORA(0))
    expect(noite.dark).toBeGreaterThanOrEqual(0.55)
    expect(noite.lamps).toBe(true)
    expect(noite.warm).toBe(false)
  })

  test('o fim da tarde escurece aos poucos, com tom quente no começo e as lâmpadas acendendo no meio', () => {
    const horas = [16, 17, 18, 19, 20].map(h => skyAt(HORA(h)).dark)
    for (let i = 1; i < horas.length; i++) expect(horas[i]!).toBeGreaterThan(horas[i - 1]!)
    expect(skyAt(HORA(17, 30)).warm).toBe(true)
    expect(skyAt(HORA(17, 30)).lamps).toBe(false)
    expect(skyAt(HORA(19, 30)).lamps).toBe(true)
  })

  test('a manhã clareia aos poucos e o amanhecer é quente', () => {
    const horas = [5, 6, 7, 8].map(h => skyAt(HORA(h)).dark)
    for (let i = 1; i < horas.length; i++) expect(horas[i]!).toBeLessThan(horas[i - 1]!)
    expect(skyAt(HORA(6, 30)).warm).toBe(true)
    expect(skyAt(HORA(9)).dark).toBe(0)
  })

  test('minutos fora de 0 a 1439 dão a volta, e lixo vira dia', () => {
    expect(skyAt(HORA(24)).dark).toBe(skyAt(0).dark)
    expect(skyAt(-60).dark).toBe(skyAt(HORA(23)).dark)
    expect(skyAt(Number.NaN)).toMatchObject({ dark: 0, lamps: false })
  })
})

describe('QG: o relógio de parede só mostra o pomodoro', () => {
  const timer = (label: string, endsAt: number, paused?: number) => ({ label, endsAt, ...(paused !== undefined ? { paused } : {}) })
  const MIN = 60_000

  test('sem pomodoro não há leitura', () => {
    expect(pomodoroOf([], 0)).toBeNull()
    expect(pomodoroOf([timer('timer 5 min', 5 * MIN)], 0)).toBeNull()
  })

  test('a fração que falta, a partir do rótulo (minutos) e do fim', () => {
    expect(pomodoroOf([timer('pomodoro 25 min', 5 * MIN)], 0)).toEqual({ fraction: 0.2 })
    expect(pomodoroOf([timer('pausa 5 min', 5 * MIN), timer('pomodoro 50 min', 25 * MIN)], 0)).toEqual({ fraction: 0.5 })
  })

  test('pausado usa o que sobrou; vencido ou além do total fica entre 0 e 1', () => {
    expect(pomodoroOf([timer('pomodoro 25 min', 0, 10 * MIN)], 99 * MIN)).toEqual({ fraction: 0.4 })
    expect(pomodoroOf([timer('pomodoro 25 min', 0)], 10 * MIN)).toEqual({ fraction: 0 })
    expect(pomodoroOf([timer('pomodoro 25 min', 90 * MIN)], 0)).toEqual({ fraction: 1 })
  })

  test('rótulo sem minutos vale 25', () => {
    expect(pomodoroOf([timer('pomodoro', 5 * MIN)], 0)).toEqual({ fraction: 0.2 })
  })
})

describe('QG: a imagem com luz e relógio, tudo dentro do mesmo SVG', () => {
  const base = QG_ART.svg
  const dia = { w: QG_ART.w, h: QG_ART.h, minutes: HORA(12), pomo: null }

  test('de dia e sem pomodoro entram só o véu leve e os ponteiros da hora', () => {
    const d = composeQg(base, dia)
    expect(d).toContain('class="hands"')
    expect(d).not.toContain('<mask id="lit">')
    expect(d.match(/<svg /g)?.length).toBe(1)
  })

  test('os ponteiros marcam a hora: meio-dia aponta para cima, e com pomodoro eles saem', () => {
    const d = composeQg(base, dia)
    const lines = [...d.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]
    expect(lines.length).toBe(2)
    for (const l of lines) {
      expect(Math.abs(Number(l[3]) - Number(l[1]))).toBeLessThan(0.05) // x igual: vertical
      expect(Number(l[4])).toBeLessThan(Number(l[2])) // para cima
    }
    expect(composeQg(base, { ...dia, pomo: { fraction: 0.5 } })).not.toContain('class="hands"')
  })

  test('à noite entram a escuridão com máscara de luz, o brilho das lâmpadas e o das telas', () => {
    const noite = composeQg(base, { ...dia, minutes: HORA(22) })
    expect(noite).toContain('<mask id="lit">')
    expect(noite).toContain('url(#warm)')
    expect(noite).toContain('#7cc8ff')
    expect(noite.startsWith('<svg ')).toBe(true)
    expect(noite.endsWith('</svg>')).toBe(true)
    expect(noite.match(/<svg /g)?.length).toBe(1)
  })

  test('o pomodoro desenha a fatia vermelha que falta no mostrador, e sem pomodoro ela não existe', () => {
    const com = composeQg(base, { ...dia, pomo: { fraction: 0.25 } })
    expect(com).toContain('class="pomo"')
    expect(com.length).toBeGreaterThan(base.length)
    expect(composeQg(base, dia)).not.toContain('class="pomo"')
    expect(composeQg(base, { ...dia, pomo: { fraction: 0 } })).not.toContain('class="pomo"')
  })

  test('fração cheia vira um disco inteiro, sem arco quebrado', () => {
    const cheio = composeQg(base, { ...dia, pomo: { fraction: 1 } })
    expect(cheio).toMatch(/class="pomo"[^>]*<circle|<circle[^>]*class="pomo"/)
  })

  test('a máscara abre a escuridão no centro da lanterna (preto no meio, branco na borda)', () => {
    const noite = composeQg(base, { ...dia, minutes: HORA(22) })
    expect(noite).toContain('<radialGradient id="hole"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/>')
  })

  test('arte grande demais ou sem fechamento não quebra o limite nem o SVG', () => {
    const grande = base.replace('</svg>', `<!--${'x'.repeat(QG_LIMIT - base.length - 10)}--></svg>`)
    const out = composeQg(grande, { ...dia, minutes: HORA(22), pomo: { fraction: 0.4 } })
    expect(out.length).toBeLessThanOrEqual(QG_LIMIT)
    expect(composeQg('<svg>', dia)).toBe('<svg>')
  })

  test('o pior caso (noite, lâmpadas e pomodoro) cabe no limite do motor', () => {
    for (let m = 0; m < 1440; m += 30) {
      for (const pomo of [null, { fraction: 0.37 }, { fraction: 1 }]) {
        const svg = composeQg(base, { ...dia, minutes: m, pomo })
        expect(svg.length).toBeLessThanOrEqual(QG_LIMIT)
      }
    }
  })
})

describe('QG: o total do pomodoro vem do timer quando ele o grava', () => {
  test('ms do timer vence o número do rótulo', () => {
    expect(pomodoroOf([{ label: 'pomodoro 25 min', endsAt: 10 * 60_000, ms: 50 * 60_000 }], 0)).toEqual({ fraction: 0.2 })
  })
})

describe('QG: contorno dos personagens', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" shape-rendering="crispEdges"><rect width="2" height="2"/></svg>'

  test('o contorno embrulha o desenho num filtro e abre margem no viewBox', () => {
    const o = withOutline(svg)
    expect(o).toContain('<filter id="ol"')
    expect(o).toContain('<g filter="url(#ol)"><rect width="2" height="2"/></g>')
    expect(o).not.toContain('viewBox="0 0 16 12"')
    expect(o.match(/<svg /g)?.length).toBe(1)
    expect(o.endsWith('</svg>')).toBe(true)
  })

  test('sem viewBox, vazio ou já contornado volta igual', () => {
    expect(withOutline('')).toBe('')
    expect(withOutline('<svg></svg>')).toBe('<svg></svg>')
    expect(withOutline(withOutline(svg))).toBe(withOutline(svg))
  })
})

describe('QG: zonas sem sobreposição e painel dos monitores', () => {
  test('em ordem de x, uma zona termina antes da próxima começar', () => {
    const z = [...SPOTS].sort((a, b) => a.x0 - b.x0)
    for (let i = 1; i < z.length; i++) expect(z[i]!.x0).toBeGreaterThanOrEqual(z[i - 1]!.x1)
  })

  test('o nome do modelo fica curto', () => {
    expect(modelShort('claude-opus-5-5')).toBe('OPUS 5.5')
    expect(modelShort('claude-sonnet-4-20250514')).toBe('SONNET 4')
    expect(modelShort('claude-haiku-5-5')).toBe('HAIKU 5.5')
    expect(modelShort(undefined)).toBe('')
  })

  test('tokens em k e M', () => {
    expect(kTokens(950)).toBe('950')
    expect(kTokens(142_300)).toBe('142k')
    expect(kTokens(1_200_000)).toBe('1.2M')
  })

  test('o painel escreve só o que tem, dentro das telas, e pisca trabalhando', () => {
    const vazio = panelSvg({})
    expect(vazio).not.toContain('<text')
    const cheio = panelSvg({ model: 'claude-opus-5-5', ctx: 42, tokens: 84_000, window: 200_000, usd: 1.75, limit5h: 30, limit7d: 12, agents: 2, tools: 7 }, true)
    for (const t of ['OPUS 5.5', 'CTX 42%', 'TOK 84k', '$1.75', '5H 30%', '7D 12%', 'AGT 2', 'CMD 7']) expect(cheio).toContain(t)
    expect(cheio.match(/<text /g)?.length).toBe(5) // três linhas no painel, duas na tela laranja // quatro páginas que se revezam
    expect(cheio).toContain('<animate')
    expect(MONITORS.every(([x0, y0, x1, y1]) => x0 < x1 && y0 < y1 && x1 <= 1 && y1 <= 1)).toBe(true)
  })

  test('luz apagada à noite: sem brilho das lanternas', () => {
    const base = QG_ART.svg
    const noite = { w: QG_ART.w, h: QG_ART.h, minutes: HORA(22), pomo: null }
    expect(composeQg(base, noite)).toContain('url(#warm)')
    expect(composeQg(base, { ...noite, lightsOff: true })).not.toContain('url(#warm)')
  })
})

describe('QG: a vida do cenário', () => {
  test('telas, LEDs, lua e bichinhos animados, e tudo cabe no limite', () => {
    const v = ambientSvg(360, 76, true)
    expect(v).toContain('animateMotion')
    expect(v.match(/<animate /g)!.length).toBeGreaterThan(20)
    const noite = composeQg(QG_ART.svg, { w: QG_ART.w, h: QG_ART.h, minutes: HORA(22), pomo: { fraction: 0.5 }, panel: { model: 'claude-opus-5-5', ctx: 99, tokens: 999_999, window: 1_000_000, usd: 999.99, limit5h: 99, limit7d: 99, agents: 9, tools: 99 }, working: true })
    expect(noite.length).toBeLessThanOrEqual(QG_LIMIT)
    expect(noite).toContain('class="vida"')
  })
})

describe('QG: ícones nos pontos marcados', () => {
  test('o centro marcado de cada ícone fica dentro do objeto', () => {
    for (const sp of SPOTS) expect(sp.cx > sp.x0 && sp.cx < sp.x1 && sp.cy > sp.y0 && sp.cy < sp.y1).toBe(true)
  })

  test('o monitor do caranguejo pulsa só com agentes', () => {
    expect(fleetPulse(0)).toBe('')
    expect(fleetPulse(2)).toContain('<animate')
  })
})
