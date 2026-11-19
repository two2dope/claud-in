import { describe, expect, test } from 'claude-code/testing'

import { CLAUDIN_GROUP, COLA_FILE, SCRIPTS_ID, colaCommand, colaSay, filterCola, flattenCola, parseCatalogo, withClaudin } from './cola'

const CAT = JSON.stringify({
  _leia: 'fonte da verdade',
  plugins: {
    pedagogico: {
      versao: '3.1.0',
      titulo: 'Pedagógico',
      lead: 'Material de aula.',
      descricao: 'Ciclo pedagógico: planos de aula e rubricas.',
      comandos: [{ nome: '/achado', descricao: 'Anota um defeito no achados.md.', exemplo: '/achado lesson-plan esqueceu a diferenciação' }, { nome: 'trava de publicação', descricao: 'Hook que pede confirmação.' }],
    },
    produtividade: { versao: '1.1.0', descricao: 'Método e qualidade: AR Board e gauntlet.' },
  },
  skills: {
    'lesson-plan': { plugin: 'pedagogico', plataformas: ['claude-code', 'claude-ai'], status: 'estavel', descricao: 'Plano de aula pronto.', exemplo: 'plano de aula de frações' },
    rubric: { plugin: 'pedagogico', plataformas: ['claude-code'], status: 'beta', descricao: 'Rubrica de avaliação.' },
    'so-no-agy': { plugin: 'pedagogico', plataformas: ['antigravity'], status: 'estavel' },
    'ar-board': { plugin: 'produtividade', plataformas: ['claude-code'], status: 'estavel' },
  },
  scripts: [
    { nome: 'python scripts/oficina.py lint', descricao: 'Purga, frontmatter, caminhos citados.' },
    { nome: 'python scripts/oficina.py cola', descricao: 'Refaz a cola.' },
  ],
  fora_do_repo: { kubric_studio: { local: 'x', status: 'beta' } },
})

const parsed = () => parseCatalogo(CAT)!

describe('cola: catálogo da oficina em leitura', () => {
  test('o arquivo de configuração tem nome fixo', () => {
    expect(COLA_FILE).toBe('cola.json')
  })

  test('agrupa as skills por plugin, na ordem do catálogo, e deixa de fora as que não rodam no Claude Code', () => {
    const cola = parsed()
    expect(cola.groups.map(g => g.plugin)).toEqual(['pedagogico', 'produtividade'])
    expect(cola.groups[0]?.skills.map(s => s.name)).toEqual(['lesson-plan', 'rubric'])
    expect(cola.groups[0]).toMatchObject({ versao: '3.1.0', titulo: 'Pedagógico', lead: 'Material de aula.' })
  })

  test('cada skill traz status, descrição e exemplo; o que falta vira texto vazio', () => {
    const [plan, rubric] = parsed().groups[0]!.skills
    expect(plan).toEqual({ name: 'lesson-plan', status: 'estavel', descricao: 'Plano de aula pronto.', exemplo: 'plano de aula de frações' })
    expect(rubric).toEqual({ name: 'rubric', status: 'beta', descricao: 'Rubrica de avaliação.', exemplo: '' })
  })

  test('o plugin sem título usa o nome; os comandos do plugin e os scripts da oficina vêm junto', () => {
    const cola = parsed()
    expect(cola.groups[1]?.titulo).toBe('produtividade')
    expect(cola.groups[0]?.comandos.map(c => c.nome)).toEqual(['/achado', 'trava de publicação'])
    expect(cola.scripts.map(s => s.nome)).toEqual(['python scripts/oficina.py lint', 'python scripts/oficina.py cola'])
    expect(cola.groups[1]?.comandos).toEqual([])
  })

  test('skill sem lista de plataformas vale; skill de plugin desconhecido ganha grupo próprio no fim', () => {
    const cola = parseCatalogo(JSON.stringify({ plugins: { a: { versao: '1', descricao: 'A' } }, skills: { x: { plugin: 'a' }, y: { plugin: 'solto', plataformas: ['claude-code'] } } }))
    expect(cola?.groups.map(g => [g.plugin, g.skills.map(s => s.name)])).toEqual([['a', ['x']], ['solto', ['y']]])
  })

  test('tolera BOM e devolve null para lixo, objeto sem skills ou JSON quebrado', () => {
    expect(parseCatalogo('﻿' + CAT)?.groups.length).toBe(2)
    expect(parseCatalogo('não é json')).toBeNull()
    expect(parseCatalogo('[]')).toBeNull()
    expect(parseCatalogo('{"plugins":{}}')).toBeNull()
    expect(parseCatalogo('{"skills":{}}')).toBeNull()
  })

  test('nome fora do padrão (espaço, barra, dois pontos) é ignorado: só comando seguro vai ao prompt', () => {
    const cola = parseCatalogo(JSON.stringify({ plugins: { p: { versao: '1', descricao: '' } }, skills: { 'ok-1': { plugin: 'p' }, 'com espaço': { plugin: 'p' }, 'a:b': { plugin: 'p' }, '../x': { plugin: 'p' }, '': { plugin: 'p' } } }))
    expect(cola?.groups[0]?.skills.map(s => s.name)).toEqual(['ok-1'])
  })

  test('textos longos são cortados e o que não é string vira vazio', () => {
    const cola = parseCatalogo(JSON.stringify({ plugins: { p: { versao: 3, descricao: 'x'.repeat(900), titulo: 'T'.repeat(200) } }, skills: { s: { plugin: 'p', descricao: 'd'.repeat(900), exemplo: 7 } } }))
    expect(cola?.groups[0]?.versao).toBe('')
    expect(cola?.groups[0]?.descricao.length).toBeLessThanOrEqual(300)
    expect(cola?.groups[0]?.titulo.length).toBeLessThanOrEqual(40)
    expect(cola?.groups[0]?.skills[0]?.descricao.length).toBeLessThanOrEqual(300)
    expect(cola?.groups[0]?.skills[0]?.exemplo).toBe('')
  })

  test('comando ou script mal formado (sem nome, nome com quebra de linha, lista que não é lista) é ignorado', () => {
    const cola = parseCatalogo(
      JSON.stringify({
        plugins: { p: { versao: '1', comandos: [{ nome: '' }, { descricao: 'sem nome' }, { nome: 'duas\nlinhas' }, 'texto', { nome: '/ok' }] } },
        skills: { s: { plugin: 'p' } },
        scripts: 'não é lista',
      }),
    )
    expect(cola?.groups[0]?.comandos.map(c => c.nome)).toEqual(['/ok'])
    expect(cola?.scripts).toEqual([])
  })

  test('o comando preenche o prompt como plugin:skill, com espaço no fim para continuar a digitar', () => {
    expect(colaCommand('pedagogico', 'lesson-plan')).toBe('/pedagogico:lesson-plan ')
  })

  test('colaSay junta descrição e exemplo para o balão do Claudin', () => {
    expect(colaSay('Plano de aula pronto.', 'plano de frações')).toBe('Plano de aula pronto. Ex.: plano de frações')
    expect(colaSay('Só descrição.', '')).toBe('Só descrição.')
    expect(colaSay('', '')).toBe('')
  })
})

describe('cola: comandos do próprio Claudin', () => {
  test('o grupo do Claudin traz /claudin e os três argumentos', () => {
    expect(CLAUDIN_GROUP.plugin).toBe('claudin')
    expect(CLAUDIN_GROUP.comandos.map(c => c.nome)).toEqual(['/claudin', '/claudin lateral', '/claudin prompt', '/claudin ocultar'])
    for (const c of CLAUDIN_GROUP.comandos) expect(c.descricao.length).toBeGreaterThan(5)
  })

  test('withClaudin põe o grupo depois dos plugins do catálogo e não duplica', () => {
    const cola = withClaudin(parsed())
    expect(cola.groups.map(g => g.plugin)).toEqual(['pedagogico', 'produtividade', 'claudin'])
    expect(withClaudin(cola).groups.length).toBe(3)
    expect(cola.scripts.length).toBe(2)
  })

  test('comando com argumento simples preenche o prompt inteiro; o contador do grupo conta os comandos', () => {
    const rows = flattenCola(withClaudin(parsed()), 'claudin', '')
    expect(rows[0]).toMatchObject({ kind: 'group', label: '▾ Claudin · 4' })
    expect(rows[1]).toMatchObject({ kind: 'item', key: 'cl-c-claudin:0', label: '/claudin', command: '/claudin ' })
    expect(rows[2]).toMatchObject({ kind: 'item', label: '/claudin lateral', command: '/claudin lateral ' })
  })

  test('argumento com caractere estranho continua só texto', () => {
    const cola = parseCatalogo(JSON.stringify({ plugins: { p: { versao: '1', comandos: [{ nome: '/x $(rm)' }, { nome: '/y; z' }] } }, skills: { s: { plugin: 'p' } } }))!
    expect(flattenCola(cola, 'p', '').filter(r => r.kind === 'note').length).toBe(2)
  })

  test('a busca por "claudin" acha os comandos do mascote', () => {
    const f = filterCola(withClaudin(parsed()), 'lateral')
    expect(f.groups.map(g => [g.plugin, g.comandos.map(c => c.nome)])).toEqual([['claudin', ['/claudin lateral']]])
  })
})

describe('cola: busca', () => {
  test('busca em nome, descrição e exemplo da skill, sem diferenciar maiúscula', () => {
    const cola = parsed()
    expect(filterCola(cola, '').groups.length).toBe(2)
    expect(filterCola(cola, 'RUBRIC').groups.map(g => [g.plugin, g.skills.map(s => s.name)])).toEqual([['pedagogico', ['rubric']]])
    expect(filterCola(cola, 'frações').groups[0]?.skills.map(s => s.name)).toEqual(['lesson-plan'])
    expect(filterCola(cola, 'zzz').groups).toEqual([])
    expect(filterCola(cola, 'zzz').scripts).toEqual([])
  })

  test('sem skill que case, o plugin que casa pelo nome, título ou descrição traz todas as suas skills', () => {
    const cola = parsed()
    expect(filterCola(cola, 'ar board').groups.map(g => g.plugin)).toEqual(['produtividade'])
    expect(filterCola(cola, 'pedagógico').groups[0]?.skills.length).toBe(2)
  })

  test('comando do plugin e script da oficina também entram na busca', () => {
    const cola = parsed()
    expect(filterCola(cola, 'achado').groups[0]?.comandos.map(c => c.nome)).toEqual(['/achado'])
    expect(filterCola(cola, 'lint').scripts.map(s => s.nome)).toEqual(['python scripts/oficina.py lint'])
    expect(filterCola(cola, 'lint').groups).toEqual([])
  })
})

describe('cola: linhas da aba', () => {
  test('recolhida: um botão por plugin, com contagem, mais o grupo dos scripts', () => {
    const rows = flattenCola(parsed(), '', '')
    expect(rows.map(r => [r.kind, r.key])).toEqual([['group', 'cl-g-pedagogico'], ['group', 'cl-g-produtividade'], ['group', `cl-g-${SCRIPTS_ID}`]])
    expect(rows[0]).toMatchObject({ group: 'pedagogico', label: '▸ Pedagógico · v3.1.0 · 2' })
    expect(rows[1]).toMatchObject({ label: '▸ produtividade · v1.1.0 · 1' })
    expect(rows[2]).toMatchObject({ group: SCRIPTS_ID, label: '▸ oficina.py · 2' })
  })

  test('aberta: comandos do plugin e skills aparecem sob o título, e a skill leva comando e fala', () => {
    const rows = flattenCola(parsed(), 'pedagogico', '')
    expect(rows[0]).toMatchObject({ kind: 'group', label: '▾ Pedagógico · v3.1.0 · 2' })
    expect(rows[1]).toMatchObject({ kind: 'item', key: 'cl-c-pedagogico:0', label: '/achado', command: '/achado ', say: 'Anota um defeito no achados.md. Ex.: /achado lesson-plan esqueceu a diferenciação' })
    expect(rows[2]).toMatchObject({ kind: 'note', label: 'trava de publicação' }) // não é comando de barra: só texto
    expect(rows[3]).toMatchObject({ kind: 'item', key: 'cl-pedagogico:lesson-plan', label: '/pedagogico:lesson-plan', command: '/pedagogico:lesson-plan ', say: 'Plano de aula pronto. Ex.: plano de aula de frações' })
    expect(rows[4]).toMatchObject({ label: '/pedagogico:rubric · beta', command: '/pedagogico:rubric ' })
    expect(rows.length).toBe(5) // com um plugin aberto, os outros saem da lista até ele ser recolhido
  })

  test('aberto o grupo dos scripts, cada script preenche o prompt com o próprio comando', () => {
    const rows = flattenCola(parsed(), SCRIPTS_ID, '')
    const itens = rows.filter(r => r.kind === 'item')
    expect(itens.map(r => r.command)).toEqual(['python scripts/oficina.py lint ', 'python scripts/oficina.py cola '])
    expect(itens[0]).toMatchObject({ key: 'cl-s-0', say: 'Purga, frontmatter, caminhos citados.' })
  })

  test('sem scripts no catálogo não há grupo de scripts', () => {
    const cola = parseCatalogo(JSON.stringify({ plugins: { p: { versao: '1' } }, skills: { s: { plugin: 'p' } } }))!
    expect(flattenCola(cola, '', '').map(r => r.key)).toEqual(['cl-g-p'])
  })

  test('com busca, tudo o que casa aparece aberto, sem depender do grupo aberto', () => {
    const rows = flattenCola(parsed(), '', 'lint')
    expect(rows.map(r => [r.kind, r.label])).toEqual([['head', 'oficina.py'], ['item', 'python scripts/oficina.py lint']])
    const skills = flattenCola(parsed(), '', 'rubric')
    expect(skills.map(r => [r.kind, r.label])).toEqual([['head', 'Pedagógico · v3.1.0'], ['item', '/pedagogico:rubric · beta']])
  })
})
