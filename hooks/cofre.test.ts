import { describe, expect, test } from 'claude-code/testing'

import { COFRE_FILE, HOT_FILE, HOT_STALE_DAYS, PENDING_FILE, PENDING_MAX, countPending, daysBetween, healthNotes, hotLine, mergeDeadlines, parseCofreConfig, parseHot, parseHotDeadlines, resolveCofre } from './cofre'

const BS = String.fromCharCode(92)
const cfg = (path: unknown) => JSON.stringify({ path })

describe('parseCofreConfig', () => {
  test('lê o caminho e troca barra invertida por barra', () => {
    expect(parseCofreConfig(cfg(`C:${BS}Projetos${BS}00_cofre`))).toBe('C:/Projetos/00_cofre')
  })

  test('tira a barra final', () => {
    expect(parseCofreConfig(cfg('C:/cofre/'))).toBe('C:/cofre')
    expect(parseCofreConfig(cfg(`C:${BS}cofre${BS}${BS}`))).toBe('C:/cofre')
  })

  test('expande ~ com a pasta pessoal', () => {
    expect(parseCofreConfig(cfg('~/Projetos/00_cofre'), 'C:/u')).toBe('C:/u/Projetos/00_cofre')
    expect(parseCofreConfig(cfg('~/cofre'), `C:${BS}u${BS}`)).toBe('C:/u/cofre')
  })

  test('~ sem pasta pessoal conhecida desliga', () => {
    expect(parseCofreConfig(cfg('~/cofre'))).toBeNull()
  })

  test('JSON inválido, sem path ou path que não é texto desliga', () => {
    expect(parseCofreConfig('{ quebrado')).toBeNull()
    expect(parseCofreConfig('{}')).toBeNull()
    expect(parseCofreConfig('[]')).toBeNull()
    expect(parseCofreConfig('"C:/cofre"')).toBeNull()
    expect(parseCofreConfig(cfg(42))).toBeNull()
    expect(parseCofreConfig(cfg('   '))).toBeNull()
    expect(parseCofreConfig(cfg(''))).toBeNull()
  })
})

describe('resolveCofre', () => {
  const read = (text: string | null) => async () => text
  const exists = (...ok: string[]) => async (p: string) => ok.includes(p)

  test('sem arquivo de configuração, fica desligado', async () => {
    expect(await resolveCofre(read(null), exists('C:/cofre'))).toBeNull()
  })

  test('com pasta inexistente, fica desligado', async () => {
    expect(await resolveCofre(read(cfg('C:/cofre')), exists())).toBeNull()
  })

  test('com pasta existente, devolve o caminho', async () => {
    expect(await resolveCofre(read(cfg(`C:${BS}cofre`)), exists('C:/cofre'))).toBe('C:/cofre')
  })

  test('~ vira a pasta pessoal antes de checar se existe', async () => {
    expect(await resolveCofre(read(cfg('~/cofre')), exists('C:/u/cofre'), 'C:/u')).toBe('C:/u/cofre')
  })

  test('erro ao ler ou ao checar desliga sem lançar', async () => {
    const boom = async () => {
      throw new Error('sem acesso')
    }
    expect(await resolveCofre(boom, exists('C:/cofre'))).toBeNull()
    expect(await resolveCofre(read(cfg('C:/cofre')), boom)).toBeNull()
  })

  test('o arquivo de configuração se chama cofre.json', () => {
    expect(COFRE_FILE).toBe('cofre.json')
  })
})

const HOT = [
  '# Hoje — 2026-11-19',
  '**Próximo passo:** rodar a compilação semanal',
  '## Prazos (14 dias)',
  '- 25/11 · Entrega do edital · email',
  '- 30/11 · Relatório · drive',
  '## Fios ativos',
  '- claudin: skins',
  '## Urgente',
  '- responder o parceiro',
  '',
].join('\n')

describe('parseHot', () => {
  test('lê data, próximo passo e conta prazos e urgentes', () => {
    expect(parseHot(HOT)).toEqual({ date: '2026-11-19', next: 'rodar a compilação semanal', deadlines: 2, urgent: 1 })
  })

  test('aceita o _hot recém-montado (próximo passo em lista, ponto final)', () => {
    const t = ['# Hoje', '', 'Atualizado: 2026-11-19 (cofre recém-montado)', '', '- **Próximo passo:** rodar o primeiro ciclo diário.', ''].join('\n')
    expect(parseHot(t)).toEqual({ date: null, next: 'rodar o primeiro ciclo diário', deadlines: 0, urgent: 0 })
  })

  test('texto sem a estrutura devolve vazio', () => {
    expect(parseHot('')).toEqual({ date: null, next: null, deadlines: 0, urgent: 0 })
    expect(parseHot('qualquer coisa')).toEqual({ date: null, next: null, deadlines: 0, urgent: 0 })
  })

  test('só linhas de lista contam em cada seção', () => {
    const t = ['## Urgente', 'texto solto', '- a', '', '- b', '## Prazos', '- x', ''].join('\n')
    expect(parseHot(t)).toMatchObject({ urgent: 2, deadlines: 1 })
  })
})

describe('hotLine', () => {
  const hot = (over = {}) => ({ date: '2026-11-19', next: 'rodar a compilação semanal', deadlines: 2, urgent: 0, ...over })

  test('só o próximo passo quando nada é urgente', () => {
    expect(hotLine(hot())).toBe('cofre: rodar a compilação semanal')
  })

  test('acrescenta os urgentes, no singular e no plural', () => {
    expect(hotLine(hot({ urgent: 1 }))).toBe('cofre: rodar a compilação semanal · 1 urgente')
    expect(hotLine(hot({ urgent: 3 }))).toBe('cofre: rodar a compilação semanal · 3 urgentes')
  })

  test('corta um próximo passo longo', () => {
    expect(hotLine(hot({ next: 'x'.repeat(100) }))).toBe(`cofre: ${'x'.repeat(59)}…`)
  })

  test('sem próximo passo fala só dos urgentes; sem nada, não fala', () => {
    expect(hotLine(hot({ next: null, urgent: 2 }))).toBe('cofre: 2 urgentes')
    expect(hotLine(hot({ next: null }))).toBeNull()
  })

  test('o arquivo lido é Wiki/_hot.md', () => {
    expect(HOT_FILE).toBe('Wiki/_hot.md')
  })
})


describe('countPending', () => {
  test('conta só os itens abertos da fila', () => {
    const t = ['# Fila', '- [ ] 2026-11-18 · Raw/Notas/a.md · assunto', '- [x] 2026-11-17 · Raw/Notas/b.md · feito', '  - [ ] 2026-11-19 · Raw/Notas/c.md · recuado', 'texto', ''].join('\n')
    expect(countPending(t)).toBe(2)
  })

  test('texto vazio ou sem itens conta zero', () => {
    expect(countPending('')).toBe(0)
    expect(countPending('# Fila\n')).toBe(0)
  })

  test('o arquivo lido é Raw/_pending.md', () => {
    expect(PENDING_FILE).toBe('Raw/_pending.md')
  })
})

describe('daysBetween', () => {
  test('diferença em dias entre duas datas AAAA-MM-DD', () => {
    expect(daysBetween('2026-11-18', '2026-11-19')).toBe(1)
    expect(daysBetween('2026-11-19', '2026-11-19')).toBe(0)
    expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2)
    expect(daysBetween('2026-11-20', '2026-11-19')).toBe(-1)
  })
})

describe('healthNotes', () => {
  const hot = (date: string | null) => ({ date, next: null, deadlines: 0, urgent: 0 })

  test('hot de hoje e fila pequena: nada a avisar', () => {
    expect(healthNotes(hot('2026-11-19'), '2026-11-19', 5)).toEqual([])
  })

  test('hot de ontem e hot mais velho', () => {
    expect(healthNotes(hot('2026-11-18'), '2026-11-19', null)).toEqual(['o hot é de ontem'])
    expect(healthNotes(hot('2026-11-16'), '2026-11-19', null)).toEqual(['o hot tem 3 dias'])
  })

  test('sem data no hot, ou data no futuro, não avisa', () => {
    expect(healthNotes(hot(null), '2026-11-19', null)).toEqual([])
    expect(healthNotes(hot('2026-11-25'), '2026-11-19', null)).toEqual([])
  })

  test('fila só avisa acima do limite', () => {
    expect(healthNotes(hot('2026-11-19'), '2026-11-19', PENDING_MAX)).toEqual([])
    expect(healthNotes(hot('2026-11-19'), '2026-11-19', PENDING_MAX + 3)).toEqual([`fila com ${PENDING_MAX + 3} itens`])
  })

  test('hot velho e fila grande juntos', () => {
    expect(healthNotes(hot('2026-11-18'), '2026-11-19', 43)).toEqual(['o hot é de ontem', 'fila com 43 itens'])
  })

  test('os limites são 1 dia e 40 itens', () => {
    expect(HOT_STALE_DAYS).toBe(1)
    expect(PENDING_MAX).toBe(40)
  })
})

describe('hotLine com avisos', () => {
  const base = { date: '2026-11-18', next: 'rodar a compilação semanal', deadlines: 0, urgent: 0 }

  test('os avisos vêm depois do próximo passo e dos urgentes', () => {
    expect(hotLine({ ...base, urgent: 1 }, ['o hot é de ontem', 'fila com 43 itens'])).toBe('cofre: rodar a compilação semanal · 1 urgente · o hot é de ontem · fila com 43 itens')
  })

  test('só avisos, sem próximo passo', () => {
    expect(hotLine({ ...base, next: null }, ['fila com 43 itens'])).toBe('cofre: fila com 43 itens')
  })
})

describe('parseHotDeadlines', () => {
  const TODAY = '2026-11-19'
  const hot = (...lines: string[]) => ['# Hoje — 2026-11-19', '## Prazos (14 dias)', ...lines, '## Urgente', '- 30/11 · isto não é prazo', ''].join('\n')

  test('lê DD/MM · o quê · fonte e escolhe o ano pela data de hoje', () => {
    expect(parseHotDeadlines(hot('- 25/11 · Entrega do edital · email', '- 03/12 · Relatório · drive'), TODAY)).toEqual([
      { date: '2026-11-25', title: 'Entrega do edital', source: 'email' },
      { date: '2026-12-03', title: 'Relatório', source: 'drive' },
    ])
  })

  test('vira o ano quando a data já ficou para trás', () => {
    expect(parseHotDeadlines(hot('- 05/01 · Renovação · agenda'), '2026-12-28')[0]?.date).toBe('2027-01-05')
  })

  test('aceita DD/MM/AAAA, AAAA-MM-DD e a fonte ausente', () => {
    expect(parseHotDeadlines(hot('- 25/11/2026 · A', '- 2026-12-01 · B', '- 02/12 · C'), TODAY).map(d => [d.date, d.title, d.source])).toEqual([
      ['2026-11-25', 'A', undefined],
      ['2026-12-01', 'B', undefined],
      ['2026-12-02', 'C', undefined],
    ])
  })

  test('só lê a seção de prazos e ignora linha estranha sem quebrar', () => {
    const t = hot('texto solto', '- sem data · x', '- 31/02 · data impossível', '- 25/11', '- 26/11 ·  · ', '- 27/11 · Válido · fonte')
    expect(parseHotDeadlines(t, TODAY)).toEqual([{ date: '2026-11-27', title: 'Válido', source: 'fonte' }])
  })

  test('sem seção de prazos ou texto vazio devolve lista vazia', () => {
    expect(parseHotDeadlines('', TODAY)).toEqual([])
    expect(parseHotDeadlines('# Hoje\n- 25/11 · x · y\n', TODAY)).toEqual([])
  })
})

describe('mergeDeadlines', () => {
  const L = (id: string, date: string, title: string) => ({ id, date, title })

  test('junta os dois lados e o do cofre vence o duplicado', () => {
    const local = [L('1', '2026-11-25', 'Entrega do edital'), L('2', '2026-11-30', 'Só local')]
    const cofre = [L('cofre:0', '2026-11-25', 'entrega do edital'), L('cofre:1', '2026-12-03', 'Só cofre')]
    expect(mergeDeadlines(local, cofre).map(d => d.id)).toEqual(['2', 'cofre:0', 'cofre:1'])
  })

  test('sem prazos do cofre devolve os locais como estão', () => {
    const local = [L('1', '2026-11-25', 'x')]
    expect(mergeDeadlines(local, [])).toEqual(local)
  })
})
