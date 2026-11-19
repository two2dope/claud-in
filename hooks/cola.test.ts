import { describe, expect, test } from 'claude-code/testing'

import { COLA_FILE, colaCommand, filterCola, flattenCola, parseCatalogo } from './cola'

const CAT = JSON.stringify({
  _leia: 'fonte da verdade',
  plugins: {
    pedagogico: { versao: '3.1.0', descricao: 'Ciclo pedagógico: planos de aula e rubricas.' },
    produtividade: { versao: '1.1.0', descricao: 'Método e qualidade: AR Board e gauntlet.' },
  },
  skills: {
    'lesson-plan': { plugin: 'pedagogico', plataformas: ['claude-code', 'claude-ai'], status: 'estavel' },
    rubric: { plugin: 'pedagogico', plataformas: ['claude-code'], status: 'beta' },
    'so-no-agy': { plugin: 'pedagogico', plataformas: ['antigravity'], status: 'estavel' },
    'ar-board': { plugin: 'produtividade', plataformas: ['claude-code'], status: 'estavel' },
  },
  fora_do_repo: { kubric_studio: { local: 'x', status: 'beta' } },
})

describe('cola: catálogo da oficina em leitura', () => {
  test('o arquivo de configuração tem nome fixo', () => {
    expect(COLA_FILE).toBe('cola.json')
  })

  test('agrupa as skills por plugin, na ordem do catálogo, e deixa de fora as que não rodam no Claude Code', () => {
    const cola = parseCatalogo(CAT)
    expect(cola?.groups.map(g => g.plugin)).toEqual(['pedagogico', 'produtividade'])
    expect(cola?.groups[0]?.skills.map(s => s.name)).toEqual(['lesson-plan', 'rubric'])
    expect(cola?.groups[0]).toMatchObject({ versao: '3.1.0', descricao: 'Ciclo pedagógico: planos de aula e rubricas.' })
  })

  test('guarda o status para marcar o que ainda é beta', () => {
    const rubric = parseCatalogo(CAT)?.groups[0]?.skills[1]
    expect(rubric).toMatchObject({ name: 'rubric', status: 'beta' })
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

  test('descrição longa é cortada e texto que não é string vira vazio', () => {
    const cola = parseCatalogo(JSON.stringify({ plugins: { p: { versao: 3, descricao: 'x'.repeat(500) } }, skills: { s: { plugin: 'p' } } }))
    expect(cola?.groups[0]?.descricao.length).toBeLessThanOrEqual(120)
    expect(cola?.groups[0]?.versao).toBe('')
  })

  test('o comando preenche o prompt como plugin:skill, com espaço no fim para continuar a digitar', () => {
    expect(colaCommand('pedagogico', 'lesson-plan')).toBe('/pedagogico:lesson-plan ')
  })

  test('filterCola busca em plugin, skill e descrição do plugin, sem diferenciar maiúscula', () => {
    const cola = parseCatalogo(CAT)!
    expect(filterCola(cola, '').groups.length).toBe(2)
    expect(filterCola(cola, 'RUBRIC').groups.map(g => [g.plugin, g.skills.map(s => s.name)])).toEqual([['pedagogico', ['rubric']]])
    expect(filterCola(cola, 'ar board').groups.map(g => g.plugin)).toEqual(['produtividade'])
    expect(filterCola(cola, 'pedagogico').groups[0]?.skills.length).toBe(2)
    expect(filterCola(cola, 'zzz').groups).toEqual([])
  })

  test('flattenCola cria uma linha de título por plugin e uma por skill', () => {
    const rows = flattenCola(parseCatalogo(CAT)!)
    expect(rows.map(r => r.kind)).toEqual(['head', 'skill', 'skill', 'head', 'skill'])
    expect(rows[0]).toMatchObject({ kind: 'head', label: 'pedagogico · v3.1.0' })
    expect(rows[2]).toMatchObject({ kind: 'skill', label: '/pedagogico:rubric · beta', command: '/pedagogico:rubric ' })
    expect(rows[1]).toMatchObject({ label: '/pedagogico:lesson-plan', command: '/pedagogico:lesson-plan ' })
  })
})
