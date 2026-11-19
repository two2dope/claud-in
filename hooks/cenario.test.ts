import { describe, expect, test } from 'claude-code/testing'

import { QG_ART } from './cenario-arte'
import { QG_LIMIT, SPOTS, STATIONS, composeQg, pinCol, pomodoroOf, skyAt, stationCol } from './cenario'

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
  test('cinco pontos, cada um com a aba que abre, dentro da imagem', () => {
    expect(SPOTS.map(s => [s.id, s.tab])).toEqual([['cola', 'comandos'], ['frota', 'frota'], ['cofre', 'cofre'], ['agenda', 'prazos'], ['tempo', 'tempo']])
    for (const s of SPOTS) {
      expect(s.x0).toBeGreaterThanOrEqual(0)
      expect(s.x1).toBeLessThanOrEqual(1)
      expect(s.y0).toBeGreaterThanOrEqual(0)
      expect(s.y1).toBeLessThanOrEqual(1)
      expect(s.x0).toBeLessThan(s.x1)
      expect(s.y0).toBeLessThan(s.y1)
    }
  })

  test('as quatro bancadas ficam em ordem, dentro da imagem, e o pino cai na coluna do meio do ponto', () => {
    expect(STATIONS.length).toBe(4)
    expect([...STATIONS].sort((a, b) => a - b)).toEqual([...STATIONS])
    for (const x of STATIONS) expect(x > 0 && x < 1).toBe(true)
    const agenda = SPOTS.find(s => s.id === 'agenda')!
    expect(pinCol(agenda, 100)).toBe(Math.round(((agenda.x0 + agenda.x1) / 2) * 100) - 1)
    expect(pinCol(SPOTS[0]!, 1)).toBeGreaterThanOrEqual(0)
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

  test('de dia e sem pomodoro a imagem sai como está', () => {
    expect(composeQg(base, dia)).toBe(base)
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
