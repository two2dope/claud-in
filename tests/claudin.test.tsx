import { expect, mock, test } from 'claude-code/testing'

import { CORAL, palOf } from '../hooks/desenho'

const BAND = {
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 20,
    bodyColumns: 100,
    scroll: { bodyRows: 20 },
    view: {},
    title: '',
    isFocused: false,
  },
} as any

test('o Claudin desenha o balão e a caixa de ferramentas', async ($: any) => {
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'claudin', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
    expect(await ui.find({ key: 'tb' })).toBeDefined()
    await ui.unmount()
  }
})

test('a caixa abre e mostra as categorias', async ($: any) => {
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-ajustes' })).toBeDefined()
  await ui.press({ key: 'cat-ajustes' })
  expect(await ui.find({ key: 'mode' })).toBeDefined()
  await ui.unmount()
})

test('o botão de modo alterna normal para café', async ($: any, on: any) => {
  on('clock.now', () => ({ value: 1000 }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-ajustes' })
  await ui.press({ key: 'mode' })
  expect(await ui.find({ type: 'Text', text: /Café na mão/ })).toBeDefined()
  await ui.unmount()
})

test('a lista de Ajustes é paginada', async ($: any) => {
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-ajustes' })
  expect(await ui.find({ key: 'mode' })).toBeDefined()
  expect(await ui.find({ key: 'pet' })).toBeUndefined()
  await ui.press({ key: 'next' })
  await ui.press({ key: 'next' })
  expect(await ui.find({ key: 'pet' })).toBeDefined()
  expect(await ui.find({ key: 'mode' })).toBeUndefined()
  await ui.unmount()
})

test('o canivete lista os comandos "/" e a busca filtra', async ($: any, on: any) => {
  on('command.list', () => ({
    value: [
      { name: 'help', description: 'ajuda', source: 'builtin' },
      { name: 'compact', description: 'compacta a sessão', source: 'builtin' },
    ],
  }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-comandos' })
  expect(await ui.find({ key: 'cmd-help' })).toBeDefined()
  expect(await ui.find({ key: 'cmd-compact' })).toBeDefined()
  await ui.input({ key: 'q', text: 'comp', kind: 'change' })
  expect(await ui.find({ key: 'cmd-help' })).toBeUndefined()
  expect(await ui.find({ key: 'cmd-compact' })).toBeDefined()
  await ui.unmount()
})

test('skills duplicadas como /nome e /pacote:nome aparecem uma vez', async ($: any, on: any) => {
  on('command.list', () => ({
    value: [
      { name: 'tutor', description: 'explica', source: 'skill' },
      { name: 'anthropic-skills:tutor', description: 'explica', source: 'plugin' },
      { name: 'pacote:outro', description: 'diferente A', source: 'plugin' },
      { name: 'outro', description: 'diferente B', source: 'skill' },
    ],
  }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-comandos' })
  expect(await ui.find({ key: 'cmd-tutor' })).toBeDefined()
  expect(await ui.find({ key: 'cmd-anthropic-skills:tutor' })).toBeUndefined()
  expect(await ui.find({ key: 'cmd-pacote:outro' })).toBeDefined()
  await ui.unmount()
})

test('o modo thug life existe no ciclo de modos', async ($: any, on: any) => {
  on('clock.now', () => ({ value: 1000 }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-ajustes' })
  for (let i = 0; i < 4; i++) await ui.press({ key: 'mode' })
  expect(await ui.find({ type: 'Text', text: /Thug life/ })).toBeDefined()
  await ui.unmount()
})

test('um timer iniciado aparece com o tempo restante', async ($: any, on: any) => {
  mock.store(on)
  on('clock.now', () => ({ value: 1000 }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-tempo' })
  await ui.press({ key: 't5' })
  expect(await ui.find({ type: 'Text', text: /timer 5 min · 5:00/ })).toBeDefined()
  await ui.unmount()
})

test('um timer pode ser reiniciado e cancelado', async ($: any, on: any) => {
  mock.store(on)
  let now = 1000
  on('clock.now', () => ({ value: now }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-tempo' })
  await ui.press({ key: 't5' })
  now = 61000
  await ui.press({ key: 'tm0-r' })
  expect(await ui.find({ type: 'Text', text: /timer 5 min reiniciado/ })).toBeDefined()
  await ui.press({ key: 'tm0-x' })
  expect(await ui.find({ key: 'tm0-x' })).toBeUndefined()
  await ui.unmount()
})

test('um timer pode ser pausado e retomado', async ($: any, on: any) => {
  mock.store(on)
  let now = 1000
  on('clock.now', () => ({ value: now }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-tempo' })
  await ui.press({ key: 't5' })
  now = 61000
  await ui.press({ key: 'tm0-p' })
  expect(await ui.find({ type: 'Text', text: /4:00 \(pausado\)/ })).toBeDefined()
  now = 301000
  await ui.press({ key: 'tm0-p' })
  expect(await ui.find({ type: 'Text', text: /timer 5 min retomado/ })).toBeDefined()
  await ui.unmount()
})

test('um prazo é salvo e mostra a contagem em dias', async ($: any, on: any) => {
  mock.store(on)
  const hoje = new Date(2026, 9, 19, 12).getTime()
  on('clock.now', () => ({ value: hoje }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  await ui.input({ key: 'dq', text: '05/11 Entrega PNAB' })
  expect(await ui.find({ type: 'Text', text: /D-17 · Entrega PNAB/ })).toBeDefined()
  await ui.input({ key: 'dq', text: 'amanhã Reunião' })
  expect(await ui.find({ type: 'Text', text: /amanhã · Reunião/ })).toBeDefined()
  await ui.input({ key: 'dq', text: 'data torta' })
  expect(await ui.find({ type: 'Text', text: /Não entendi a data/ })).toBeDefined()
  await ui.unmount()
})

test('um lembrete recorrente é salvo e listado', async ($: any, on: any) => {
  mock.store(on)
  on('clock.now', () => ({ value: new Date(2026, 9, 19, 8).getTime() }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  await ui.input({ key: 'dq', text: '09:00 Revisar tarefas' })
  expect(await ui.find({ type: 'Text', text: /09:00 todo dia · Revisar tarefas/ })).toBeDefined()
  await ui.input({ key: 'dq', text: 'seg-sex 18h30 Fechar o dia' })
  expect(await ui.find({ type: 'Text', text: /18:30 seg-sex · Fechar o dia/ })).toBeDefined()
  await ui.unmount()
})

test('a saudação do dia resume os prazos de hoje', async ($: any, on: any) => {
  mock.store(on)
  on('clock.now', () => ({ value: new Date(2026, 9, 19, 12).getTime() }))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  await ui.input({ key: 'dq', text: 'hoje Entregar relatório' })
  await ui.press({ key: 'cat-ajustes' })
  await ui.press({ key: 'next' })
  await ui.press({ key: 'greet' })
  expect(await ui.find({ type: 'Text', text: /Boa tarde\. hoje: Entregar relatório/ })).toBeDefined()
  await ui.unmount()
})

test('/claudin lateral abre o painel lateral', async ($: any, on: any) => {
  on('ui.close', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  const r = await $.command.run({ command: 'claudin', args: 'lateral' })
  expect(r.text).toMatch(/painel lateral/)
})

test('/claudin lateral sem espaço cai para a faixa', async ($: any, on: any) => {
  on('ui.close', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: false, reason: 'estreito' } }))
  const r = await $.command.run({ command: 'claudin', args: 'lateral' })
  expect(r.text).toMatch(/acima do prompt/)
})

test('com o painel lateral fora do ar, a faixa reaparece sozinha', async ($: any, on: any) => {
  on('ui.close', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.panes', () => ({ value: [] }))
  await $.command.run({ command: 'claudin', args: 'lateral' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  await ui.unmount()
})

test('/claudin ocultar esconde a faixa e /claudin traz de volta', async ($: any, on: any) => {
  on('ui.close', () => ({ value: undefined }))
  on('ui.render', ($: any, e: any) => {
    const { Text } = $.ui.resolve(e)
    return <Text>padrão do app</Text>
  })
  const hid = await $.command.run({ command: 'claudin', args: 'ocultar' })
  expect(hid.text).toMatch(/oculto/)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /padrão do app/ })).toBeDefined()
  await ui.unmount()
  const back = await $.command.run({ command: 'claudin', args: '' })
  expect(back.text).toMatch(/de volta/)
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  await ui.unmount()
})
// ── frota de subagentes ────────────────────────────────────────────────────────
// Cada teste usa um relógio próprio e crescente: o limite de fala de subida vive no módulo.
const SPAWN = (description: string, subagentType = 'Explore') => ({ tool_use_id: 't', prompt: 'p', description, subagentType })
const DONE = (agentId: string, reason: string) => ({ answer: '', reason, agentId, durationMs: 1, isAborted: reason === 'aborted', turnId: 'tt' })
const ids = (on: any) => {
  on('agent.spawn', (_: any, e: any) => ({ agentId: e.description === 'b' ? 'a2' : 'a1', model: 'haiku' }))
  on('turn.complete', () => ({ text: '' }))
}

test('um subagente que sobe vira um balão curto', async ($: any, on: any) => {
  mock.clock(on, { now: 100_000 })
  ids(on)
  await $.agent.spawn(SPAWN('mapear hooks'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Subagente Explore em campo: mapear hooks/ })).toBeDefined()
  await ui.unmount()
})

test('subidas em rajada falam uma vez só por intervalo', async ($: any, on: any) => {
  const clock = mock.clock(on, { now: 200_000 })
  ids(on)
  await $.agent.spawn(SPAWN('a'))
  await $.agent.spawn(SPAWN('b'))
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /agentes em campo/ })).toBeUndefined()
  await ui.unmount()
  await clock.advance(2_000)
  await $.agent.spawn(SPAWN('b'))
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /2 agentes em campo/ })).toBeDefined()
  await ui.unmount()
})

test('ferramenta de subagente não vira balão, a do agente principal vira', async ($: any, on: any) => {
  mock.clock(on, { now: 300_000 })
  on('tool.call', () => ({ result: {} }))
  await $.tool.call({ tool: 'Read', file_path: 'x.ts', agentId: 'a1' })
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Lendo x\.ts/ })).toBeUndefined()
  await ui.unmount()
  await $.tool.call({ tool: 'Read', file_path: 'x.ts' })
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Lendo x\.ts/ })).toBeDefined()
  await ui.unmount()
})

test('subagente que termina com erro vira falha com o botão investigar', async ($: any, on: any) => {
  mock.clock(on, { now: 400_000 })
  ids(on)
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete(DONE('a1', 'error'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Agente Explore falhou: mapear hooks/ })).toBeDefined()
  expect(await ui.find({ key: 'act' })).toBeDefined()
  await ui.unmount()
})

test('subagente que termina bem não gera o resumo do turno principal', async ($: any, on: any) => {
  mock.clock(on, { now: 500_000 })
  ids(on)
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete(DONE('a1', 'answer'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pronto/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /falhou/ })).toBeUndefined()
  await ui.unmount()
})

test('subagente interrompido pela pessoa não é anunciado como falha', async ($: any, on: any) => {
  mock.clock(on, { now: 600_000 })
  ids(on)
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete(DONE('a1', 'aborted'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /falhou/ })).toBeUndefined()
  await ui.unmount()
})

test('em modo meditar a subida fica calada e a falha aparece', async ($: any, on: any) => {
  mock.clock(on, { now: 700_000 })
  mock.store(on)
  ids(on)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-ajustes' })
  await ui.press({ key: 'mode' })
  await ui.press({ key: 'mode' })
  await ui.press({ key: 'mode' })
  await ui.unmount()
  await $.agent.spawn(SPAWN('mapear hooks'))
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /em campo/ })).toBeUndefined()
  await ui.unmount()
  await $.turn.complete(DONE('a1', 'error'))
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Agente Explore falhou/ })).toBeDefined()
  await ui.unmount()
})

test('a lista do engine corrige a frota a cada tique: failed vira falha uma única vez', async ($: any, on: any) => {
  const clock = mock.clock(on, { now: 800_000 })
  mock.store(on)
  ids(on)
  let status = 'running'
  on('agent.list', () => ({ value: [{ id: 'a1', type: 'Explore', description: 'mapear hooks', status }] }))
  on('fs.exists', () => ({ value: false }))
  on('command.list', () => ({ value: [] }))
  on('command.register', () => ({ value: { command: 'claudin' } }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '.', surface: null })
  await $.agent.spawn(SPAWN('mapear hooks'))
  status = 'failed'
  await clock.advance(1_600)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Agente Explore falhou: mapear hooks/ })).toBeDefined()
  await ui.unmount()
})

const GIDS = (on: any) => {
  on('agent.spawn', (_: any, e: any) => ({ agentId: `g${e.description}`, model: 'haiku' }))
  on('turn.complete', () => ({ text: '' }))
}

test('a linha de resumo da frota aparece com agentes vivos e some sem eles', async ($: any, on: any) => {
  mock.clock(on, { now: 900_000 })
  ids(on)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /◆/ })).toBeUndefined()
  await ui.unmount()
  await $.agent.spawn(SPAWN('mapear hooks'))
  for (const surface of ['terminal', 'desktop'] as const) {
    ui = await $.ui.mount({ plugin: 'claudin', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /◆ 1 agente: Explore/ })).toBeDefined()
    await ui.unmount()
  }
})

test('a aba Frota só existe com agentes e lista cada um por id', async ($: any, on: any) => {
  mock.clock(on, { now: 1_000_000 })
  ids(on)
  on('tool.call', () => ({ result: {} }))
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-frota' })).toBeUndefined()
  await ui.unmount()
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.tool.call({ tool: 'Read', file_path: 'x.ts', agentId: 'a1' })
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND }) // a caixa continua aberta
  await ui.press({ key: 'cat-frota' })
  expect(await ui.find({ type: 'Text', text: /● Explore · mapear hooks · 0s · 1 tool/ })).toBeDefined()
  await ui.unmount()
})

test('com oito agentes a aba lista seis e resume o resto', async ($: any, on: any) => {
  mock.clock(on, { now: 1_100_000 })
  GIDS(on)
  for (const n of ['1', '2', '3', '4', '5', '6', '7', '8']) await $.agent.spawn(SPAWN(n))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-frota' })
  expect(await ui.find({ type: 'Text', text: /Explore · 4 · 0s/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Explore · 5 · 0s/ })).toBeUndefined()
  await ui.press({ key: 'next' })
  expect(await ui.find({ type: 'Text', text: /Explore · 6 · 0s/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Explore · 7 · 0s/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /\+2 agentes/ })).toBeDefined()
  await ui.unmount()
})

test('o resumo do fim de turno conta os agentes que subiram no turno', async ($: any, on: any) => {
  mock.clock(on, { now: 1_200_000 })
  GIDS(on)
  on('prompt.submit', () => ({ text: 'oi' }))
  await $.prompt.submit({ text: 'oi' })
  await $.agent.spawn(SPAWN('1'))
  await $.agent.spawn(SPAWN('2'))
  await $.turn.complete({ answer: '', reason: 'answer', durationMs: 1, isAborted: false, turnId: 'main' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pronto: 2 agentes\./ })).toBeDefined()
  await ui.unmount()
})

test('o Claudin não volta a "Aguardando." enquanto há agente vivo, e volta quando a frota esvazia', async ($: any, on: any) => {
  const clock = mock.clock(on, { now: 1_300_000 })
  ids(on)
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete({ answer: '', reason: 'answer', durationMs: 1, isAborted: false, turnId: 'main' })
  await clock.advance(21_000)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Aguardando\./ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /Pronto: 1 agente\./ })).toBeDefined()
  await ui.unmount()
  await $.turn.complete(DONE('a1', 'answer'))
  await clock.advance(21_000)
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Aguardando\./ })).toBeDefined()
  await ui.unmount()
})

test('em modo cigarro a subida fica calada e a falha aparece', async ($: any, on: any) => {
  mock.clock(on, { now: 1_400_000 })
  mock.store(on)
  ids(on)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-ajustes' })
  await ui.press({ key: 'mode' })
  await ui.press({ key: 'mode' })
  await ui.unmount()
  await $.agent.spawn(SPAWN('mapear hooks'))
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pausa de 10 min/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /em campo/ })).toBeUndefined()
  await ui.unmount()
  await $.turn.complete(DONE('a1', 'error'))
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Agente Explore falhou/ })).toBeDefined()
  await ui.unmount()
})

// ── correções da revisão final ─────────────────────────────────────────────────
const boot = async ($: any, on: any, list: () => unknown) => {
  mock.store(on)
  on('agent.list', list)
  on('fs.exists', () => ({ value: false }))
  on('command.list', () => ({ value: [] }))
  on('command.register', () => ({ value: { command: 'claudin' } }))
  on('ui.status', () => ({ value: undefined }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '.', surface: null })
}

test('agente que a lista nunca nomeia segue vivo até o turn.complete', async ($: any, on: any) => {
  const clock = mock.clock(on, { now: 1_500_000 })
  ids(on)
  await boot($, on, () => ({ value: [] }))
  await $.agent.spawn(SPAWN('mapear hooks'))
  await clock.advance(6_000)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /◆ 1 agente/ })).toBeDefined()
  await ui.unmount()
  await $.turn.complete(DONE('a1', 'answer'))
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /◆/ })).toBeUndefined()
  await ui.unmount()
})

test('agente que reaparece (retomado) volta a rodando', async ($: any, on: any) => {
  mock.clock(on, { now: 1_600_000 })
  ids(on)
  on('tool.call', () => ({ result: {} }))
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete(DONE('a1', 'answer'))
  await $.tool.call({ tool: 'Read', file_path: 'x.ts', agentId: 'a1' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /◆ 1 agente: Explore/ })).toBeDefined()
  await ui.unmount()
})

test('com a lista falhando, a linha terminada ainda sai pela idade', async ($: any, on: any) => {
  const clock = mock.clock(on, { now: 1_700_000 })
  ids(on)
  await boot($, on, () => {
    throw new Error('no session is bound')
  })
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete(DONE('a1', 'answer'))
  await clock.advance(10_000)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-frota' })).toBeUndefined()
  await ui.unmount()
})

test('texto longo do spawn é cortado, na frase e no prompt do investigar', async ($: any, on: any) => {
  mock.clock(on, { now: 1_800_000 })
  ids(on)
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  await $.agent.spawn(SPAWN('x'.repeat(300), 'agent-skills:web-performance-auditor'))
  await $.turn.complete(DONE('a1', 'error'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Agente web-performance… falhou: x{37}…\./ })).toBeDefined()
  await ui.press({ key: 'act' })
  expect(filled).toContain('x'.repeat(119) + '…')
  expect(filled).not.toContain('x'.repeat(121))
  await ui.unmount()
})

// ── dados do usuário fora da pasta do plugin (instalação por marketplace) ───────
// Uma atualização do plugin substitui a pasta dele; sprites, atalhos e semente de favoritos do usuário
// moram em <config>/claudin (CLAUDE_CONFIG_DIR, ou ~/.claude) e vencem os arquivos que o plugin traz.
// failRead: caminhos que casam com ele dão erro ao ler, como um disco com problema.
const bootFs = async ($: any, on: any, files: Record<string, string>, env: Record<string, string>, stored: Record<string, unknown> = {}, failRead?: RegExp) => {
  mock.store(on, stored)
  mock.env(on, env)
  // Chave absoluta (C:/...) casa o caminho exato; chave relativa casa o arquivo do plugin, nunca os da pasta do usuário.
  const hit = (p: string) => {
    const path = p.split(String.fromCharCode(92)).join('/')
    return Object.keys(files).find(k => (/^[A-Za-z]:\//.test(k) ? path === k : !/^(C:\/u|D:\/cfg)/.test(path) && path.endsWith(`/${k}`)))
  }
  on('fs.exists', (_: any, e: any) => ({ value: hit(e.path) !== undefined }))
  on('fs.read', (_: any, e: any) => {
    if (failRead?.test(String(e.path))) throw new Error('disco com problema')
    return { value: files[hit(e.path) ?? ''] ?? '' }
  })
  on('command.list', () => ({ value: [] }))
  on('command.register', () => ({ value: { command: 'claudin' } }))
  on('ui.status', () => ({ value: undefined }))
  on('agent.list', () => ({ value: [] }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '.', surface: null })
}
const SC = (label: string) => JSON.stringify([{ label, text: `texto de ${label}` }])
const openPrompts = async (ui: any) => {
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'next' })
}

test('atalhos do usuário em <config>/claudin vencem o shortcuts.json do plugin', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, { 'C:/u/.claude/claudin/shortcuts.json': SC('do usuário'), 'shortcuts.json': SC('do plugin') }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openPrompts(ui)
  expect((await ui.find({ key: 'sc4' }))?.props?.label).toMatch(/do usuário/)
  await ui.unmount()
})

test('sem arquivo do usuário, vale o shortcuts.json do plugin', async ($: any, on: any) => {
  mock.clock(on, { now: 2_100_000 })
  await bootFs($, on, { 'shortcuts.json': SC('do plugin') }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openPrompts(ui)
  expect((await ui.find({ key: 'sc4' }))?.props?.label).toMatch(/do plugin/)
  await ui.unmount()
})

test('CLAUDE_CONFIG_DIR vence o diretório pessoal', async ($: any, on: any) => {
  mock.clock(on, { now: 2_200_000 })
  await bootFs(
    $, on,
    { 'D:/cfg/claudin/shortcuts.json': SC('da config'), 'C:/u/.claude/claudin/shortcuts.json': SC('da home') },
    { CLAUDE_CONFIG_DIR: 'D:/cfg', USERPROFILE: 'C:/u' },
  )
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openPrompts(ui)
  expect((await ui.find({ key: 'sc4' }))?.props?.label).toMatch(/da config/)
  await ui.unmount()
})

test('sem nenhuma variável de ambiente o mod segue só com o plugin', async ($: any, on: any) => {
  mock.clock(on, { now: 2_300_000 })
  await bootFs($, on, { 'shortcuts.json': SC('do plugin') }, {})
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openPrompts(ui)
  expect((await ui.find({ key: 'sc4' }))?.props?.label).toMatch(/do plugin/)
  await ui.unmount()
})

test('sprite do usuário vence o sprite do plugin', async ($: any, on: any) => {
  mock.clock(on, { now: 2_400_000 })
  await bootFs(
    $, on,
    { 'C:/u/.claude/claudin/sprites/idle.svg': '<svg id="do-usuario"/>', 'sprites/idle.svg': '<svg id="do-plugin"/>' },
    { USERPROFILE: 'C:/u' },
  )
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(JSON.stringify(await ui.find({ type: 'Svg' }))).toContain('do-usuario')
  await ui.unmount()
})

test('caminho do Windows com barra invertida e barra final é normalizado', async ($: any, on: any) => {
  mock.clock(on, { now: 2_500_000 })
  await bootFs($, on, { 'C:/u/.claude/claudin/shortcuts.json': SC('do usuário') }, { USERPROFILE: String.fromCharCode(67, 58, 92, 117, 92) })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openPrompts(ui)
  expect((await ui.find({ key: 'sc4' }))?.props?.label).toMatch(/do usuário/)
  await ui.unmount()
})

// ── cofre, só leitura: a saudação do dia traz o próximo passo do Wiki/_hot.md ────
const HOT_MD = ['# Hoje — 2026-11-19', '**Próximo passo:** rodar a compilação semanal', '## Prazos (14 dias)', '- 25/11 · Entrega do edital · email', '## Urgente', '- responder o parceiro', ''].join('\n')
const COFRE_CFG = JSON.stringify({ path: 'C:/cofre' })
const cofreFiles = (extra: Record<string, string> = {}) => ({ 'C:/u/.claude/claudin/cofre.json': COFRE_CFG, 'C:/cofre': '', 'C:/cofre/Wiki/_hot.md': HOT_MD, ...extra })

test('com o cofre configurado, a saudação traz o próximo passo e os urgentes', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, cofreFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /cofre: rodar a compilação semanal · 1 urgente/ })).toBeDefined()
  await ui.unmount()
})

test('sem cofre.json a saudação não fala do cofre', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, { 'C:/cofre': '', 'C:/cofre/Wiki/_hot.md': HOT_MD }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  await ui.unmount()
})

test('cofre apontando para pasta inexistente fica desligado, sem mensagem', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, { 'C:/u/.claude/claudin/cofre.json': COFRE_CFG, 'C:/cofre/Wiki/_hot.md': HOT_MD }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  await ui.unmount()
})

test('cofre sem _hot.md ou com _hot sem o que dizer fica calado', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, { 'C:/u/.claude/claudin/cofre.json': COFRE_CFG, 'C:/cofre': '', 'C:/cofre/Wiki/_hot.md': '# Hoje — 2026-11-19\n' }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  await ui.unmount()
})

// ── cofre, só leitura: avisos de saúde (hot velho, fila grande) vão na mesma saudação ────
const NOV19 = new Date(2026, 10, 19, 12).getTime()
const pendingMd = (n: number) => ['# Fila', ...Array.from({ length: n }, (_, i) => `- [ ] 2026-11-18 · Raw/Notas/n${i}.md · assunto`), ''].join('\n')

test('hot de ontem e fila grande aparecem como avisos na saudação', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_MD.replace('2026-11-19', '2026-11-18'), 'C:/cofre/Raw/_pending.md': pendingMd(43) }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /cofre: rodar a compilação semanal · 1 urgente · o hot é de ontem · fila com 43 itens/ })).toBeDefined()
  await ui.unmount()
})

test('hot de hoje e fila pequena não geram aviso', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Raw/_pending.md': pendingMd(5) }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /cofre: rodar a compilação semanal · 1 urgente\.$/ })).toBeDefined()
  await ui.unmount()
})

test('a fila grande avisa mesmo com o hot sem próximo passo', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': '# Hoje — 2026-11-19\n', 'C:/cofre/Raw/_pending.md': pendingMd(41) }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /cofre: fila com 41 itens/ })).toBeDefined()
  await ui.unmount()
})

// ── balão: o botão de ação não fica colado na fala ───────────────────────────────
test('o botão de ação do balão fica separado da fala por uma linha', async ($: any, on: any) => {
  mock.clock(on, { now: 2_100_000 })
  ids(on)
  await $.agent.spawn(SPAWN('mapear hooks'))
  await $.turn.complete(DONE('a1', 'error'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect((await ui.find({ key: 'act-row' }))?.props?.marginTop).toBe(1)
  await ui.unmount()
})

// ── cofre, só leitura: botão que só preenche o prompt (quem envia é a pessoa) ────
test('com o cofre ligado, a aba Ações tem o botão que preenche o prompt com o próximo passo', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  await bootFs($, on, cofreFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-acoes' })
  await ui.press({ key: 'a-cofre' })
  expect(filled).toBe('Leia C:/cofre/Wiki/_hot.md e me ajude com o próximo passo.')
  await ui.unmount()
})

test('sem o cofre ligado, o botão do cofre não aparece', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, { 'C:/cofre': '' }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-acoes' })
  expect(await ui.find({ key: 'a-cmd' })).toBeDefined()
  expect(await ui.find({ key: 'a-cofre' })).toBeUndefined()
  await ui.unmount()
})

// ── cofre, só leitura: os prazos do _hot aparecem na Agenda, marcados "do cofre" ────
const HOT_PRAZOS = ['# Hoje — 2026-11-19', '**Próximo passo:** rodar a compilação semanal', '## Prazos (14 dias)', '- 19/11 · Entregar relatório · drive', '- 25/11 · Entrega do edital · email', '## Urgente', ''].join('\n')

test('os prazos do cofre entram na Agenda como "do cofre", sem botão de apagar', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_PRAZOS }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  expect(await ui.find({ type: 'Text', text: /D-6 · Entrega do edital · do cofre/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /hoje · Entregar relatório · do cofre/ })).toBeDefined()
  expect(await ui.find({ key: 'dl-cofre:2026-11-25:1-x' })).toBeUndefined()
  await ui.unmount()
})

test('prazo digitado no Claudin segue local e convive com os do cofre', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_PRAZOS }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  await ui.input({ key: 'dq', text: '30/11 Reunião local' })
  expect(await ui.find({ type: 'Text', text: /D-11 · Reunião local/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Reunião local · do cofre/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /D-6 · Entrega do edital · do cofre/ })).toBeDefined()
  await ui.unmount()
})

test('sem cofre a Agenda não ganha prazos de fora', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, { 'C:/cofre': '', 'C:/cofre/Wiki/_hot.md': HOT_PRAZOS }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  expect(await ui.find({ type: 'Text', text: /do cofre/ })).toBeUndefined()
  await ui.unmount()
})

test('a saudação do dia conta os prazos do cofre', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_PRAZOS }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /hoje: Entregar relatório/ })).toBeDefined()
  await ui.unmount()
})

// ── barra de abas só com ícone; a aba aberta mostra o nome; a aba Cofre só com o cofre ligado ────
test('as abas fechadas mostram só o ícone e a aberta mostra ▸ ícone e nome', async ($: any) => {
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect((await ui.find({ key: 'cat-prompts' }))?.props?.label).toBe('▸💬 Prompts')
  expect((await ui.find({ key: 'cat-acoes' }))?.props?.label).toBe(' ⚡')
  await ui.press({ key: 'cat-prazos' })
  expect((await ui.find({ key: 'cat-prazos' }))?.props?.label).toBe('▸📅 Agenda')
  expect((await ui.find({ key: 'cat-prompts' }))?.props?.label).toBe(' 💬')
  await ui.unmount()
})

test('a aba Cofre só existe com o cofre ligado', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, cofreFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect((await ui.find({ key: 'cat-cofre' }))?.props?.label).toBe(' 🔐')
  await ui.unmount()
})

test('sem o cofre ligado a barra não tem a aba Cofre', async ($: any, on: any) => {
  mock.clock(on, { now: 2_000_000 })
  await bootFs($, on, { 'C:/cofre': '' }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-cofre' })).toBeUndefined()
  await ui.unmount()
})

// ── aba Cofre: o _hot em leitura, com o botão que só preenche o prompt ───────────
const HOT_FULL = ['# Hoje — 2026-11-18', '**Próximo passo:** rodar a compilação semanal', '## Prazos (14 dias)', '- 25/11 · Entrega do edital · email', '## Fios ativos', '- claudin: skins, falta o código', '- oficina: ok', '## Urgente', '- responder o parceiro', '- revisar o dream', ''].join('\n')
const openCofre = async (ui: any) => {
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-cofre' })
}

test('a aba Cofre mostra próximo passo e urgentes; o botão só preenche o prompt', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_FULL }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  expect(await ui.find({ type: 'Text', text: /próximo: rodar a compilação semanal/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /! responder o parceiro \(\+1\)/ })).toBeDefined()
  await ui.press({ key: 'cf-fill' })
  expect(filled).toBe('Leia C:/cofre/Wiki/_hot.md e me ajude com o próximo passo.')
  await ui.unmount()
})

test('na segunda página da aba Cofre ficam os fios e os avisos de saúde', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_FULL }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  await ui.press({ key: 'next' })
  expect(await ui.find({ type: 'Text', text: /· claudin: skins, falta o código \(\+1\)/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /⚠ o hot é de ontem/ })).toBeDefined()
  await ui.unmount()
})

test('cofre ligado mas sem _hot.md: a aba avisa em uma linha', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, { 'C:/u/.claude/claudin/cofre.json': COFRE_CFG, 'C:/cofre': '' }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  expect(await ui.find({ type: 'Text', text: /Sem Wiki\/_hot\.md ainda/ })).toBeDefined()
  await ui.unmount()
})

// ── captura rápida: a única escrita no cofre é um arquivo NOVO em Raw/Notas ──────
const captureLog: string[] = []
const bootCapture = async ($: any, on: any) => {
  const files: Record<string, string> = cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_FULL, 'C:/cofre/Raw/_pending.md': pendingMd(2) })
  const written: Record<string, string> = {}
  on('fs.write', (_: any, e: any) => {
    const path = String(e.path).split(String.fromCharCode(92)).join('/')
    captureLog.push(path)
    written[path] = e.text
    files[path] = e.text
    return { value: undefined }
  })
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, files, { USERPROFILE: 'C:/u' })
  return written
}

test('capturar nota cria um arquivo novo em Raw/Notas e não toca em mais nada', async ($: any, on: any) => {
  const written = await bootCapture($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  await ui.input({ key: 'cf-note', text: 'Ideia sobre skins\nresto da nota' })
  expect(Object.keys(written)).toEqual(['C:/cofre/Raw/Notas/2026-11-19 - Ideia sobre skins (claudin).md'])
  expect(written['C:/cofre/Raw/Notas/2026-11-19 - Ideia sobre skins (claudin).md']).toBe('Ideia sobre skins\nresto da nota\n')
  expect(await ui.find({ type: 'Text', text: /Nota guardada no cofre/ })).toBeDefined()
  await ui.unmount()
})

test('uma segunda nota com o mesmo título vira (2) e nunca sobrescreve', async ($: any, on: any) => {
  const written = await bootCapture($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  await ui.input({ key: 'cf-note', text: 'Mesma ideia' })
  await ui.input({ key: 'cf-note', text: 'Mesma ideia\noutro texto' })
  expect(Object.keys(written)).toEqual([
    'C:/cofre/Raw/Notas/2026-11-19 - Mesma ideia (claudin).md',
    'C:/cofre/Raw/Notas/2026-11-19 - Mesma ideia (claudin) (2).md',
  ])
  expect(written['C:/cofre/Raw/Notas/2026-11-19 - Mesma ideia (claudin).md']).toBe('Mesma ideia\n')
  await ui.unmount()
})

test('nota vazia não escreve nada', async ($: any, on: any) => {
  const written = await bootCapture($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  await ui.input({ key: 'cf-note', text: '   ' })
  expect(Object.keys(written)).toEqual([])
  await ui.unmount()
})

// ── skins: o mesmo Claudin com outra paleta e luz; pastas do usuário trazem arte própria ────
const dirs = (...names: string[]) => names.map(name => ({ name, kind: 'dir', size: 0, mtimeMs: 0, isLink: false }))
const bootSkins = async ($: any, on: any, extra: Record<string, string> = {}, userDirs: string[] = [], stored: Record<string, unknown> = {}) => {
  mock.clock(on, { now: 2_600_000 })
  on('fs.list', (_: any, e: any) => {
    const path = String(e.path).split(String.fromCharCode(92)).join('/')
    // a pasta do plugin ainda lista nomes antigos e a frota: nada disso pode virar skin repetida
    return { value: path.includes('/.claude/claudin/') ? dirs(...userDirs) : dirs('malungo', 'frota', 'mare', 'mangue') }
  })
  await bootFs($, on, extra, { USERPROFILE: 'C:/u' }, stored)
}
const openAjustes = async (ui: any) => {
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-ajustes' })
}
const sprite = async (ui: any) => JSON.stringify(await ui.find({ type: 'Svg' }))
const COR = palOf(CORAL)
const MARE = { base: '#2f9e9a', ant: '#7fd6d0' }
const MALUNGO = { base: '#8f9bad', ant: '#cfd6e0', hat: '#d9b45b' }
const LAMA = { base: '#7d6b43', ant: '#a89968', leaf: '#4fae4a' }

test('sem skin escolhida o Claudin é a Mangue, com luz', async ($: any, on: any) => {
  await bootSkins($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  const svg = await sprite(ui)
  expect(svg).toContain(CORAL)
  expect(svg).toContain(COR.hi)
  expect(svg).toContain(COR.shade)
  await openAjustes(ui)
  expect((await ui.find({ key: 'skin' }))?.props?.label).toMatch(/skin: mangue/)
  await ui.unmount()
})

test('o padrão antigo guardado (vazio) vira a Mangue', async ($: any, on: any) => {
  await bootSkins($, on, {}, [], { skin: '' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await sprite(ui)).toContain(COR.hi)
  await ui.unmount()
})

test('quem já tem sprites soltos próprios e nunca escolheu skin continua vendo os seus', async ($: any, on: any) => {
  await bootSkins($, on, { 'C:/u/.claude/claudin/sprites/idle.svg': '<svg id="meu-solto"/>' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await sprite(ui)).toContain('meu-solto')
  await openAjustes(ui)
  expect((await ui.find({ key: 'skin' }))?.props?.label).toMatch(/skin: clássico/)
  await ui.unmount()
})

test('o botão de skin percorre mangue, maré, malungo, lama, clássico e volta, sem repetir nem listar a frota', async ($: any, on: any) => {
  await bootSkins($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  const veja = async (label: RegExp, ...partes: string[]) => {
    await ui.press({ key: 'skin' })
    expect((await ui.find({ key: 'skin' }))?.props?.label).toMatch(label)
    const svg = await sprite(ui)
    for (const parte of partes) expect(svg).toContain(parte)
  }
  await veja(/skin: maré/, MARE.base, MARE.ant)
  await veja(/skin: malungo/, MALUNGO.base, MALUNGO.ant, MALUNGO.hat)
  await veja(/skin: lama/, LAMA.base, LAMA.ant, LAMA.leaf)
  await veja(/skin: clássico/)
  const classico = await sprite(ui)
  expect(classico).toContain(CORAL)
  expect(classico).not.toContain(COR.hi)
  expect(classico).not.toContain(LAMA.leaf)
  await veja(/skin: mangue/, COR.hi, COR.shade, COR.deep)
  await ui.unmount()
})

test('a skin guardada volta na sessão seguinte', async ($: any, on: any) => {
  await bootSkins($, on, {}, [], { skin: 'mare' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await sprite(ui)).toContain(MARE.base)
  await openAjustes(ui)
  expect((await ui.find({ key: 'skin' }))?.props?.label).toMatch(/skin: maré/)
  await ui.unmount()
})

test('skin guardada que não existe mais cai para a Mangue', async ($: any, on: any) => {
  await bootSkins($, on, {}, [], { skin: 'apagada' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  expect((await ui.find({ key: 'skin' }))?.props?.label).toMatch(/skin: mangue/)
  await ui.unmount()
})

test('a skin é só paleta: olhos, piscar e modos continuam os do Claudin', async ($: any, on: any) => {
  await bootSkins($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  await ui.press({ key: 'skin' })
  const parado = await sprite(ui)
  expect(parado).toContain(MARE.base)
  expect(parado).toContain('<animate') // o piscar continua
  await ui.press({ key: 'mode' }) // café: a xícara aparece sobre a skin
  const cafe = await sprite(ui)
  expect(cafe).toContain(MARE.base)
  expect(cafe).toContain('#6b4423')
  await ui.unmount()
})

test('o Malungo põe o chapéu entre as antenas e muda a exclamação de lugar', async ($: any, on: any) => {
  await bootSkins($, on, {}, [], { skin: 'malungo' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await sprite(ui)).toContain(MALUNGO.hat)
  await ui.unmount()
})

test('a Lama leva o brotinho de cannabis também nos modos, e a guardada volta', async ($: any, on: any) => {
  await bootSkins($, on, {}, [], { skin: 'lama' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await sprite(ui)).toContain(LAMA.leaf)
  await openAjustes(ui)
  await ui.press({ key: 'mode' }) // café
  const cafe = await sprite(ui)
  expect(cafe).toContain(LAMA.leaf)
  expect(cafe).toContain('#6b4423')
  await ui.unmount()
})

test('skin do usuário em <config>/claudin/sprites/<nome> entra na lista, depois das do plugin', async ($: any, on: any) => {
  await bootSkins($, on, { 'C:/u/.claude/claudin/sprites/meu/idle.svg': '<svg id="meu-idle"/>' }, ['meu'])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  for (let i = 0; i < 4; i++) await ui.press({ key: 'skin' })
  expect((await ui.find({ key: 'skin' }))?.props?.label).toMatch(/skin: meu/)
  expect(await sprite(ui)).toContain('meu-idle')
  await ui.unmount()
})

test('pose que a skin do usuário não tem cai para o desenho padrão', async ($: any, on: any) => {
  await bootSkins($, on, { 'C:/u/.claude/claudin/sprites/meu/idle.svg': '<svg id="meu-idle"/>' }, ['meu'])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  for (let i = 0; i < 4; i++) await ui.press({ key: 'skin' })
  await ui.press({ key: 'next' })
  await ui.press({ key: 'next' })
  await ui.press({ key: 'pet' }) // humor "ok": a skin do usuário não tem essa pose
  const svg = await sprite(ui)
  expect(svg).not.toContain('meu-idle')
  expect(svg).toContain(CORAL)
  await ui.unmount()
})

test('skin do usuário só com PNG não é carregada (o desktop não desenha PNG embutido)', async ($: any, on: any) => {
  await bootSkins($, on, { 'C:/u/.claude/claudin/sprites/meu/idle.png': 'binario' }, ['meu'])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  for (let i = 0; i < 4; i++) await ui.press({ key: 'skin' })
  expect(await sprite(ui)).not.toContain('<image')
  await ui.unmount()
})

// ── frota: uma miniatura por tipo de agente (criaturas do mangue), até 2, com ×n e +N ────
const bootFrota = async ($: any, on: any, extra: Record<string, string> = {}, stored: Record<string, unknown> = {}) => {
  mock.clock(on, { now: 2_700_000 })
  on('agent.spawn', (_: any, e: any) => ({ agentId: e.description, model: 'haiku' }))
  on('turn.complete', () => ({ text: '' }))
  await bootFs($, on, extra, { USERPROFILE: 'C:/u' }, stored)
}
const spawnAll = async ($: any, list: [string, string][]) => {
  for (const [desc, type] of list) await $.agent.spawn(SPAWN(desc, type))
}

test('com um agente vivo aparece a miniatura do tipo, sem contagem', async ($: any, on: any) => {
  await bootFrota($, on)
  await spawnAll($, [['e1', 'Explore']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(JSON.stringify(await ui.find({ key: 'mini-siri' }))).toContain('0 0 12 12') // desenhada em código
  expect(await ui.find({ key: 'mini-garca' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^×/ })).toBeUndefined()
  await ui.unmount()
})

test('mostra os 2 tipos com mais agentes, ×n e +N no resto', async ($: any, on: any) => {
  await bootFrota($, on)
  await spawnAll($, [['p1', 'Plan'], ['e1', 'Explore'], ['e2', 'Explore'], ['g1', 'general-purpose']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ key: 'mini-siri' })).toBeDefined()
  expect(await ui.find({ key: 'mini-garca' })).toBeDefined()
  expect(await ui.find({ key: 'mini-guaiamum' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^×2$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^\+1$/ })).toBeDefined()
  await ui.unmount()
})

test('sem agentes vivos não há miniaturas', async ($: any, on: any) => {
  await bootFrota($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  for (const k of ['siri', 'garca', 'guaiamum', 'aratu', 'caranguejinho']) expect(await ui.find({ key: `mini-${k}` })).toBeUndefined()
  await ui.unmount()
})

test('agente que termina tira a miniatura', async ($: any, on: any) => {
  await bootFrota($, on)
  await spawnAll($, [['e1', 'Explore']])
  await $.turn.complete(DONE('e1', 'answer'))
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ key: 'mini-siri' })).toBeUndefined()
  await ui.unmount()
})

test('em meditar e cigarro as miniaturas não aparecem', async ($: any, on: any) => {
  await bootFrota($, on)
  await spawnAll($, [['e1', 'Explore']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  await ui.press({ key: 'mode' })
  expect(await ui.find({ key: 'mini-siri' })).toBeDefined()
  await ui.press({ key: 'mode' })
  expect(await ui.find({ key: 'mini-siri' })).toBeUndefined()
  await ui.press({ key: 'mode' })
  expect(await ui.find({ key: 'mini-siri' })).toBeUndefined()
  await ui.unmount()
})

test('fleet-map.json do usuário troca a criatura de um tipo', async ($: any, on: any) => {
  await bootFrota($, on, { 'C:/u/.claude/claudin/fleet-map.json': JSON.stringify({ Explore: 'aratu' }) })
  await spawnAll($, [['e1', 'Explore']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ key: 'mini-aratu' })).toBeDefined()
  expect(await ui.find({ key: 'mini-siri' })).toBeUndefined()
  await ui.unmount()
})

// ── correções da auditoria ────────────────────────────────────────────────────────
const BSL = String.fromCharCode(92)

test('título com barra invertida não leva a nota para fora de Raw/Notas', async ($: any, on: any) => {
  const written = await bootCapture($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  await ui.input({ key: 'cf-note', text: ['x', '..', '..', 'Wiki', 'y'].join(BSL) })
  const paths = Object.keys(written)
  expect(paths).toHaveLength(1)
  expect(paths[0]).toMatch(/^C:\/cofre\/Raw\/Notas\/[^/]+\.md$/)
  expect(paths[0]).not.toContain('/Wiki/')
  await ui.unmount()
})

test('em meditar, prazo vindo do cofre não fura o silêncio da saudação', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/cofre/Wiki/_hot.md': HOT_PRAZOS }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  await ui.press({ key: 'mode' })
  await ui.press({ key: 'mode' })
  await ui.press({ key: 'mode' })
  await ui.press({ key: 'next' })
  await ui.press({ key: 'greet' })
  expect(await ui.find({ type: 'Text', text: /hoje: Entregar relatório/ })).toBeUndefined()
  await ui.unmount()
})

test('aba que não existe mais não prende a caixa', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  const files: Record<string, string> = cofreFiles()
  await bootFs($, on, files, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCofre(ui)
  expect(await ui.find({ key: 'cf-note' })).toBeDefined()
  delete files['C:/u/.claude/claudin/cofre.json'] // o cofre some e a sessão recarrega
  await $.session.start({ cwd: '.', surface: null })
  expect(await ui.find({ key: 'cf-note' })).toBeUndefined()
  expect((await ui.find({ key: 'cat-prompts' }))?.props?.label).toBe('▸💬 Prompts')
  await ui.unmount()
})

test('arquivo do usuário em <config>/claudin/sprites/frota vence a criatura do código', async ($: any, on: any) => {
  await bootFrota($, on, { 'C:/u/.claude/claudin/sprites/frota/siri.svg': '<svg id="meu-siri"/>' })
  await spawnAll($, [['e1', 'Explore'], ['p1', 'Plan']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(JSON.stringify(await ui.find({ key: 'mini-siri' }))).toContain('meu-siri')
  expect(JSON.stringify(await ui.find({ key: 'mini-garca' }))).toContain('0 0 12 12')
  await ui.unmount()
})

test('a miniatura diz o tipo e a quantidade no alt', async ($: any, on: any) => {
  await bootFrota($, on)
  await spawnAll($, [['p1', 'Plan'], ['p2', 'Plan']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(JSON.stringify(await ui.find({ key: 'mini-garca' }))).toContain('2 agentes: planejar')
  await ui.unmount()
})

// ── Cola da Oficina: o botão 📋 dentro de Comandos abre o catalogo.json em leitura, com busca e clique que só preenche o prompt ───────
const COLA_CAT = JSON.stringify({
  plugins: { pedagogico: { versao: '3.1.0', descricao: 'Ciclo pedagógico.' }, produtividade: { versao: '1.1.0', descricao: 'Método e qualidade.' } },
  skills: {
    'lesson-plan': { plugin: 'pedagogico', plataformas: ['claude-code'], status: 'estavel', descricao: 'Plano de aula pronto.', exemplo: 'plano de frações' },
    rubric: { plugin: 'pedagogico', plataformas: ['claude-code'], status: 'beta' },
    'ar-board': { plugin: 'produtividade', plataformas: ['claude-code'], status: 'estavel' },
  },
  scripts: [{ nome: 'python scripts/oficina.py lint', descricao: 'Confere o repositório.' }],
})
const colaFiles = (extra: Record<string, string> = {}) => ({ 'C:/u/.claude/claudin/cola.json': JSON.stringify({ path: 'C:/oficina/catalogo.json' }), 'C:/oficina/catalogo.json': COLA_CAT, ...extra })
const openCola = async (ui: any) => {
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-comandos' })
  await ui.press({ key: 'cl-open' })
}

test('o botão 📋 aparece em Comandos só com o catálogo configurado, e não há aba Cola', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, colaFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-cola' })).toBeUndefined()
  await ui.press({ key: 'cat-comandos' })
  expect((await ui.find({ key: 'cl-open' }))?.props?.label).toBe('📋')
  await ui.unmount()
})

test('sem cola.json, ou com catálogo inexistente, Comandos não tem o botão 📋', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, { 'C:/u/.claude/claudin/cola.json': JSON.stringify({ path: 'C:/oficina/catalogo.json' }) }, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-comandos' })
  expect(await ui.find({ key: 'cl-open' })).toBeUndefined()
  await ui.unmount()
})

test('a Cola agrupa por plugin; clicar numa skill só preenche o prompt', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  await bootFs($, on, colaFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  expect((await ui.find({ key: 'cl-g-pedagogico' }))?.props?.label).toMatch(/▸ pedagogico · v3\.1\.0 · 2/)
  expect(await ui.find({ key: 'cl-pedagogico:rubric' })).toBeUndefined() // recolhido: só os plugins aparecem
  await ui.press({ key: 'cl-g-pedagogico' })
  expect((await ui.find({ key: 'cl-g-pedagogico' }))?.props?.label).toMatch(/▾ pedagogico/)
  expect((await ui.find({ key: 'cl-pedagogico:rubric' }))?.props?.label).toMatch(/\/pedagogico:rubric · beta/)
  await ui.press({ key: 'cl-pedagogico:lesson-plan' })
  expect(filled).toBe('/pedagogico:lesson-plan ')
  expect(await ui.find({ type: 'Text', text: /Plano de aula pronto\. Ex\.: plano de frações/ })).toBeDefined() // o Claudin diz o que a skill faz
  await ui.unmount()
})

test('o mesmo botão do plugin abre e recolhe a lista', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, colaFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  await ui.press({ key: 'cl-g-pedagogico' })
  expect(await ui.find({ key: 'cl-pedagogico:rubric' })).toBeDefined()
  await ui.press({ key: 'cl-g-pedagogico' })
  expect(await ui.find({ key: 'cl-pedagogico:rubric' })).toBeUndefined()
  await ui.unmount()
})

test('os scripts da oficina (oficina.py) são um grupo; clicar preenche o prompt com o comando', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  await bootFs($, on, colaFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  await ui.press({ key: 'next' }) // com o grupo do Claudin são quatro grupos, e três por página
  await ui.press({ key: 'cl-g-@scripts' })
  await ui.press({ key: 'cl-s-0' })
  expect(filled).toBe('python scripts/oficina.py lint ')
  expect(await ui.find({ type: 'Text', text: /Confere o repositório\./ })).toBeDefined()
  await ui.unmount()
})

test('a busca da Cola filtra as skills', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, colaFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  await ui.input({ key: 'cl-q', text: 'rubric', kind: 'change' })
  expect(await ui.find({ key: 'cl-pedagogico:lesson-plan' })).toBeUndefined()
  expect(await ui.find({ key: 'cl-pedagogico:rubric' })).toBeDefined()
  await ui.unmount()
})

test('a Cola relê o catálogo ao abrir a aba: skill nova da oficina aparece sem reiniciar', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  const files: Record<string, string> = colaFiles()
  await bootFs($, on, files, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  expect(await ui.find({ key: 'cl-produtividade:nova' })).toBeUndefined()
  files['C:/oficina/catalogo.json'] = COLA_CAT.replace('"ar-board"', '"nova":{"plugin":"produtividade","plataformas":["claude-code"]},"ar-board"')
  await ui.press({ key: 'cat-prompts' })
  await ui.press({ key: 'cat-comandos' })
  await ui.press({ key: 'cl-open' })
  await ui.input({ key: 'cl-q', text: 'nova', kind: 'change' })
  expect(await ui.find({ key: 'cl-produtividade:nova' })).toBeDefined()
  await ui.unmount()
})

test('catálogo ilegível mostra aviso em vez de lista vazia', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, colaFiles({ 'C:/oficina/catalogo.json': 'quebrado' }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  expect(await ui.find({ type: 'Text', text: /catálogo ilegível/ })).toBeDefined()
  await ui.unmount()
})

// ── Cola: os comandos do próprio Claudin entram como um grupo, além dos do catálogo ───────
test('a Cola traz o grupo Claudin com /claudin e os argumentos, que só preenchem o prompt', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  await bootFs($, on, colaFiles(), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openCola(ui)
  expect((await ui.find({ key: 'cl-g-claudin' }))?.props?.label).toMatch(/▸ Claudin · 4/)
  await ui.press({ key: 'cl-g-claudin' })
  await ui.press({ key: 'cl-c-claudin:1' })
  expect(filled).toBe('/claudin lateral ')
  expect(await ui.find({ type: 'Text', text: /Põe o Claudin no painel lateral/ })).toBeDefined()
  await ui.unmount()
})

// ── contexto: o Claudin avisa quando a janela enche e sugere /compact ou /clear ───────
const usageAt = (on: any, percent: number | (() => number)) => {
  on('turn.complete', () => ({ text: '' }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000, tokens: 1, percent: typeof percent === 'function' ? percent() : percent }, rateLimits: [] } }))
}
const doneTurn = ($: any) => $.turn.complete({ answer: '', reason: 'answer', durationMs: 1, isAborted: false, turnId: 'main' })

test('com a janela em 55% o fim do turno avisa e oferece o botão compactar', async ($: any, on: any) => {
  mock.clock(on, { now: 3_000_000 })
  let filled = ''
  on('prompt.fill', (_: any, e: any) => {
    filled = e.text
    return { isFilled: true }
  })
  usageAt(on, 55)
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pronto\. Nada a reportar\. Contexto em 55%\. Se a conversa vai longe, vale um \/compact\./ })).toBeDefined()
  expect((await ui.find({ key: 'act' }))?.props?.label).toBe('compactar')
  await ui.press({ key: 'act' })
  expect(filled).toBe('/compact ')
  await ui.unmount()
})

test('abaixo de 50% o balão não fala de contexto', async ($: any, on: any) => {
  mock.clock(on, { now: 3_100_000 })
  usageAt(on, 49)
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pronto\. Nada a reportar\./ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Contexto em/ })).toBeUndefined()
  await ui.unmount()
})

test('o aviso vem uma vez por nível: o segundo turno no mesmo nível fica calado, e o próximo nível avisa de novo', async ($: any, on: any) => {
  mock.clock(on, { now: 3_200_000 })
  let pct = 55
  usageAt(on, () => pct)
  await doneTurn($)
  pct = 62
  await doneTurn($)
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Contexto em/ })).toBeUndefined()
  await ui.unmount()
  pct = 75
  await doneTurn($)
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Contexto em 75%\. Compacte agora/ })).toBeDefined()
  await ui.unmount()
})

test('depois de compactar o aviso se rearma e volta quando a janela enche de novo', async ($: any, on: any) => {
  mock.clock(on, { now: 3_300_000 })
  let pct = 90
  usageAt(on, () => pct)
  await doneTurn($)
  pct = 25
  await doneTurn($)
  pct = 90
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Contexto em 90%/ })).toBeDefined()
  await ui.unmount()
})

test('no último nível o aviso lembra do /clear', async ($: any, on: any) => {
  mock.clock(on, { now: 3_400_000 })
  usageAt(on, 97)
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Hora de \/compact, ou \/clear/ })).toBeDefined()
  await ui.unmount()
})

test('falha ao ler a janela não derruba o fim do turno', async ($: any, on: any) => {
  mock.clock(on, { now: 3_500_000 })
  on('turn.complete', () => ({ text: '' }))
  on('session.usage', () => {
    throw new Error('sem leitura')
  })
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pronto\. Nada a reportar\./ })).toBeDefined()
  await ui.unmount()
})

test('a aba Ações mostra o contexto e tem os botões compactar e limpar, que só preenchem o prompt', async ($: any, on: any) => {
  mock.clock(on, { now: 3_600_000 })
  const filled: string[] = []
  on('prompt.fill', (_: any, e: any) => {
    filled.push(e.text)
    return { isFilled: true }
  })
  usageAt(on, 74)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-acoes' })
  expect(await ui.find({ type: 'Text', text: /contexto: 74% da janela · vale compactar/ })).toBeDefined()
  await ui.press({ key: 'next' })
  await ui.press({ key: 'a-compact' })
  await ui.press({ key: 'a-clear' })
  expect(filled).toEqual(['/compact ', '/clear '])
  await ui.unmount()
})

// ── auditoria: BOM, fs que falha e prazo repetido ───────
test('cofre.json salvo com BOM (o Bloco de Notas do Windows) liga o cofre mesmo assim', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles({ 'C:/u/.claude/claudin/cofre.json': '\uFEFF' + COFRE_CFG }), { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-cofre' })).toBeDefined()
  await ui.unmount()
})

test('leitura do _hot que falha deixa o cofre calado, sem derrubar o Claudin', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, cofreFiles(), { USERPROFILE: 'C:/u' }, {}, /_hot\.md|_pending\.md/)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /cofre:/ })).toBeUndefined()
  await ui.unmount()
})

test('o mesmo prazo digitado duas vezes na Agenda fica uma só vez', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-prazos' })
  await ui.input({ key: 'dq', text: '25/11 Entrega do edital' })
  await ui.input({ key: 'dq', text: '25/11 entrega do edital' })
  expect(await ui.find({ type: 'Text', text: /Esse prazo já está na Agenda/ })).toBeDefined()
  await ui.unmount()
})

// ── contexto: a faixa dos avisos se ajusta em Ajustes e fica guardada ───────
test('o botão de contexto em Ajustes percorre as faixas e o desligado, e volta', async ($: any, on: any) => {
  await bootSkins($, on)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  await ui.press({ key: 'next' })
  await ui.press({ key: 'next' }) // o botão de contexto fica na terceira página de Ajustes
  const veja = async (label: RegExp) => {
    await ui.press({ key: 'ctx' })
    expect((await ui.find({ key: 'ctx' }))?.props?.label).toMatch(label)
  }
  expect((await ui.find({ key: 'ctx' }))?.props?.label).toMatch(/contexto: 50\/70\/85%/)
  await veja(/60\/80\/90%/)
  await veja(/70\/85\/95%/)
  await veja(/desligado/)
  await veja(/50\/70\/85%/)
  await ui.unmount()
})

test('na faixa 70/85/95 a janela em 60% não avisa, e a escolha guardada volta na sessão seguinte', async ($: any, on: any) => {
  usageAt(on, 60)
  await bootSkins($, on, {}, [], { ctxPreset: 'tarde' })
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Pronto\. Nada a reportar\./ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Contexto em/ })).toBeUndefined()
  await openAjustes(ui)
  await ui.press({ key: 'next' })
  await ui.press({ key: 'next' }) // o botão de contexto fica na terceira página de Ajustes
  expect((await ui.find({ key: 'ctx' }))?.props?.label).toMatch(/70\/85\/95%/)
  await ui.unmount()
})

test('desligado, a janela em 99% não avisa, mas a aba Ações ainda mostra o número', async ($: any, on: any) => {
  usageAt(on, 99)
  await bootSkins($, on, {}, [], { ctxPreset: 'off' })
  await doneTurn($)
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ type: 'Text', text: /Contexto em/ })).toBeUndefined()
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-acoes' })
  expect(await ui.find({ type: 'Text', text: /contexto: 99% da janela$/ })).toBeDefined()
  await ui.unmount()
})

test('faixa guardada que não existe mais cai na padrão', async ($: any, on: any) => {
  await bootSkins($, on, {}, [], { ctxPreset: 'apagada' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await openAjustes(ui)
  await ui.press({ key: 'next' })
  await ui.press({ key: 'next' }) // o botão de contexto fica na terceira página de Ajustes
  expect((await ui.find({ key: 'ctx' }))?.props?.label).toMatch(/50\/70\/85%/)
  await ui.unmount()
})

// ── QG do Claudin no Mangue: a faixa de pixel art atrás do mascote ───────
const NIGHT = new Date(2026, 10, 19, 22).getTime()
const qg = async (ui: any) => JSON.stringify(await ui.find({ key: 'qg' }))
// O QG mora no painel lateral; na linha do prompt ele não aparece.
const PANE = { component: 'Pane', requestId: 'claudin', props: { ...BAND.props } } as any

test('o botão 📡 liga e desliga a faixa do QG', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'qg' })).toBeUndefined()
  await ui.press({ key: 'sc' })
  expect(await ui.find({ key: 'qg' })).toBeDefined()
  await ui.press({ key: 'sc' })
  expect(await ui.find({ key: 'qg' })).toBeUndefined()
  await ui.unmount()
})

test('a escolha de ligar a faixa fica guardada para a sessão seguinte', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'qg' })).toBeDefined()
  await ui.unmount()
})

test('com a faixa ligada o botão da caixa de ferramentas continua lá e a caixa abre', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  await ui.press({ key: 'tb' })
  expect(await ui.find({ key: 'cat-ajustes' })).toBeDefined()
  await ui.unmount()
})

test('cada objeto do QG tem uma zona clicável que abre a aba do que ele representa', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, { ...cofreFiles(), ...colaFiles() }, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  for (const id of ['cola', 'frota', 'cofre', 'agenda', 'servidor', 'tempo']) expect(await ui.find({ key: `spot-${id}` })).toBeDefined()
  await ui.press({ key: 'spot-agenda' })
  expect((await ui.find({ key: 'chip-prazos' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.press({ key: 'spot-cofre' })
  expect((await ui.find({ key: 'chip-cofre' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.press({ key: 'spot-cola' })
  expect((await ui.find({ key: 'chip-comandos' }))?.props?.backgroundColor).toBe('#D97757')
  expect(await ui.find({ key: 'cl-q' })).toBeDefined() // a lista da oficina, não a de comandos
  await ui.press({ key: 'spot-tempo' })
  expect((await ui.find({ key: 'chip-tempo' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.unmount()
})

test('zona sem o que abrir só avisa: frota vazia e cofre desligado', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  await ui.press({ key: 'spot-frota' })
  expect(await ui.find({ type: 'Text', text: /Nenhum agente por aqui/ })).toBeDefined()
  await ui.press({ key: 'spot-cofre' })
  expect(await ui.find({ type: 'Text', text: /cofre não está ligado/ })).toBeDefined()
  expect(await ui.find({ key: 'cat-prazos' })).toBeUndefined() // a caixa não abriu
  await ui.unmount()
})

test('a zona da Cola sem catálogo abre a lista normal de comandos', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  await ui.press({ key: 'spot-cola' })
  expect((await ui.find({ key: 'chip-comandos' }))?.props?.backgroundColor).toBe('#D97757')
  expect(await ui.find({ key: 'q' })).toBeDefined()
  await ui.unmount()
})

test('à noite a faixa ganha a escuridão com luz nas lanternas; de dia não', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const dia = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(dia)).not.toContain('mask id=\\"lit')
  await dia.unmount()
})

test('à noite a faixa tem a máscara de luz', async ($: any, on: any) => {
  mock.clock(on, { now: NIGHT })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(ui)).toContain('mask id=\\"lit')
  await ui.unmount()
})

test('o pomodoro aparece como a fatia vermelha no relógio de parede', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(ui)).not.toMatch(/class=\\"pomo/)
  await ui.press({ key: 'tb' })
  await ui.press({ key: 'cat-tempo' })
  await ui.press({ key: 't25' })
  expect(await qg(ui)).toMatch(/class=\\"pomo/)
  await ui.unmount()
})

test('as miniaturas da frota ficam nas bancadas da faixa, e não ao lado do mascote', async ($: any, on: any) => {
  await bootFrota($, on, {}, { cenario: true })
  await spawnAll($, [['e1', 'Explore'], ['p1', 'Plan']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'qg-mini-siri' })).toBeDefined()
  expect(await ui.find({ key: 'qg-mini-garca' })).toBeDefined()
  expect(await ui.find({ key: 'mini-siri' })).toBeUndefined()
  await ui.unmount()
})

test('sem a faixa as miniaturas continuam ao lado do mascote', async ($: any, on: any) => {
  await bootFrota($, on)
  await spawnAll($, [['e1', 'Explore']])
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'mini-siri' })).toBeDefined()
  expect(await ui.find({ key: 'qg-mini-siri' })).toBeUndefined()
  await ui.unmount()
})

// ── QG: o Claudin anda DENTRO da faixa; o balão fica logo abaixo, com a seta para cima ───────
test('com a faixa ligada o mascote fica dentro dela, e sem a faixa continua na linha de sempre', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'qg-claudin' })).toBeDefined()
  expect(JSON.stringify(await ui.find({ key: 'qg-claudin' }))).toContain('Claudin, o mascote')
  await ui.unmount()
})

test('sem a faixa não existe o mascote do cenário', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'qg-claudin' })).toBeUndefined()
  expect(JSON.stringify(await ui.find({ key: 'claudin' }))).toContain('Claudin, o mascote')
  await ui.unmount()
})

test('na faixa o mascote não se repete embaixo, o balão aponta para cima e continua falando', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(JSON.stringify(await ui.find({ key: 'claudin' }))).not.toContain('Claudin, o mascote')
  expect(await ui.find({ type: 'Text', text: /▴/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /╰▾/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /Online/ })).toBeDefined()
  await ui.unmount()
})

test('o mascote da faixa leva a skin e os modos do Claudin', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true, skin: 'lama' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(JSON.stringify(await ui.find({ key: 'qg-claudin' }))).toContain('#4fae4a') // o brotinho da Lama
  await ui.unmount()
})

// ── QG 0.7.2: só no painel, zonas no lugar dos pinos, relógio com ponteiros, contorno nos personagens ───────
test('na linha do prompt o QG não aparece, e o 📡 leva o Claudin para o painel lateral com o QG ligado', async ($: any, on: any) => {
  on('ui.close', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(await ui.find({ key: 'qg' })).toBeUndefined()
  await ui.press({ key: 'sc' })
  await ui.unmount()
  const pane = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await pane.find({ key: 'qg' })).toBeDefined()
  await pane.unmount()
})

test('sem painel lateral disponível o 📡 avisa em vez de crescer a linha do prompt', async ($: any, on: any) => {
  on('ui.close', () => ({ value: undefined }))
  on('ui.open', () => ({ value: { isPlaced: false, reason: 'estreito' } }))
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await ui.press({ key: 'sc' })
  expect(await ui.find({ key: 'qg' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /painel lateral/ })).toBeDefined()
  await ui.unmount()
})

test('o servidor abre Ações; sem pomodoro o relógio tem ponteiros; os personagens ganham contorno', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(ui)).toMatch(/class=\\"hands/)
  expect(JSON.stringify(await ui.find({ key: 'qg-claudin' }))).toContain('url(#ol)')
  await ui.press({ key: 'spot-servidor' })
  expect((await ui.find({ key: 'chip-acoes' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.unmount()
})

// ── QG 0.7.3: zonas numa camada só, interruptor da luz, painel nos monitores, caixa em fichas ───────
test('as zonas ficam numa camada só, sem rótulo visível, e o clique em cada uma abre a aba', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, { ...cofreFiles() }, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  const layer = JSON.stringify(await ui.find({ key: 'qg-zones' }))
  expect(layer).toContain('spot-cofre')
  expect(layer).not.toContain('Monitores:')
  expect(await ui.find({ key: 'qg-layer-frota' })).toBeUndefined()
  await ui.press({ key: 'spot-cofre' })
  expect((await ui.find({ key: 'chip-cofre' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.unmount()
})

test('a lanterna é o interruptor: apaga e acende a luz da sala, e a escolha fica guardada', async ($: any, on: any) => {
  mock.clock(on, { now: NIGHT })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(ui)).toContain('url(#warm)')
  await ui.press({ key: 'spot-luz' })
  expect(await qg(ui)).not.toContain('url(#warm)')
  await ui.press({ key: 'spot-luz' })
  expect(await qg(ui)).toContain('url(#warm)')
  await ui.unmount()
})

test('os monitores mostram o painel da sessão', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(ui)).toContain('panel')
  expect(await qg(ui)).toContain('AGT')
  await ui.unmount()
})

test('na linha do prompt a caixa continua com emojis; no painel, fichas com ícone em vetor e o nome da aberta', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' })
  const band = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  await band.press({ key: 'tb' })
  expect((await band.find({ key: 'cat-prompts' }))?.props?.label).toBe('▸💬 Prompts')
  await band.unmount()
  const pane = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  if (!(await pane.find({ key: 'cat-prompts' }))) await pane.press({ key: 'tb' })
  // No painel o emoji vira ícone em vetor (SVG) com botão em branco por cima; só a ficha aberta mostra o nome.
  const aberta = JSON.stringify(await pane.find({ key: 'chip-prompts' }))
  expect(aberta).toContain('Prompts')
  expect(aberta).toContain('<svg')
  expect(aberta).not.toContain('💬')
  expect((await pane.find({ key: 'cat-acoes' }))?.props?.label).toBe('⠀⠀⠀') // ícone de 22px: três células de botão
  expect((await pane.find({ key: 'chip-acoes' }))?.text).toBe('⠀⠀⠀') // fechada: sem nome visível (o nome fica no alt)
  expect((await pane.find({ key: 'chip-prompts' }))?.props?.backgroundColor).toBe('#D97757')
  await pane.press({ key: 'cat-acoes' })
  expect((await pane.find({ key: 'chip-acoes' }))?.props?.backgroundColor).toBe('#D97757')
  expect(JSON.stringify(await pane.find({ key: 'sc-w' }))).toContain('<svg')
  await pane.unmount()
})

// ── QG 0.7.4: zona inteira clicável, gadget Sobre, tamanhos maiores, preferências por sessão ───────
test('o botão de cada ponto é o próprio ícone, sem rótulo de texto', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect((await ui.find({ key: 'spot-cofre' }))?.props?.label).toBe('⠀⠀')
  expect(await qg(ui)).toContain('class=\\"icones')
  const zona = JSON.stringify(await ui.find({ key: 'qg-col-tempo' }))
  expect(zona).not.toContain('Relógio')
  await ui.press({ key: 'spot-tempo' })
  expect((await ui.find({ key: 'chip-tempo' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.unmount()
})

test('a placa de madeira abre o Sobre, com a versão e os links do projeto', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  await ui.press({ key: 'spot-sobre' })
  expect(await ui.find({ type: 'Text', text: /Claudin \d+\.\d+\.\d+/ })).toBeDefined()
  expect(JSON.stringify(await ui.find({ key: 'sb-git' }))).toContain('https://github.com/two2dope/claud-in')
  await ui.unmount()
})

test('o tamanho cresceu: médio é o antigo grande e o grande passou dele', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...BAND })
  expect(JSON.stringify(await ui.find({ key: 'claudin' }))).toContain('"width":64')
  await ui.unmount()
})

test('a luz troca o ícone dentro da faixa; cada botão tem caixa fixa e nada interativo por cima', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  const antes = await qg(ui)
  await ui.press({ key: 'spot-luz' })
  expect(await qg(ui)).not.toBe(antes) // a lâmpada vira lua dentro da faixa
  const col = JSON.stringify(await ui.find({ key: 'zone-cofre' }))
  expect(col).toContain('"width":3')
  expect(JSON.stringify(await ui.find({ key: 'qg-claudin' }))).not.toContain('isInteractive')
  await ui.unmount()
})

// ── QG 0.7.7: interruptor do neon, relógio limpo, painel em três monitores ───────
test('o segundo interruptor liga e desliga o modo neon', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await qg(ui)).not.toContain('class=\\"neon')
  await ui.press({ key: 'spot-neon' })
  expect(await qg(ui)).toContain('class=\\"neon')
  expect(await ui.find({ type: 'Text', text: /Modo neon ligado/ })).toBeDefined()
  await ui.press({ key: 'spot-neon' })
  expect(await qg(ui)).not.toContain('class=\\"neon')
  await ui.unmount()
})

test('o relógio não tem ícone por cima: o botão é em branco e abre o Tempo', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect((await ui.find({ key: 'spot-tempo' }))?.props?.label).toBe('\u2800\u2800')
  await ui.press({ key: 'spot-tempo' })
  expect((await ui.find({ key: 'chip-tempo' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.unmount()
})

// ── QG 0.7.8: ícones ancorados por porcentagem, Ajustes e Prompts, espaço sob a busca ───────
test('os novos pontos abrem Ajustes e Prompts', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  await ui.press({ key: 'spot-ajustes' })
  expect((await ui.find({ key: 'chip-ajustes' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.press({ key: 'spot-prompts' })
  expect((await ui.find({ key: 'chip-prompts' }))?.props?.backgroundColor).toBe('#D97757')
  await ui.unmount()
})

test('a posição do ícone não depende de célula inteira: muda só a coluna em porcentagem', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const a = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  const colA = JSON.stringify(await a.find({ key: 'qg-col-luz' })) // o quadro da lua e o cofre dividem a coluna
  await a.unmount()
  const b = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', component: 'Pane', requestId: 'claudin', props: { ...BAND.props, bodyColumns: 140 } } as any)
  const colB = JSON.stringify(await b.find({ key: 'qg-col-luz' }))
  await b.unmount()
  expect(colA).toMatch(/"width":"\d+%"/)
  expect(colA.match(/"width":"\d+%"/)?.[0]).toBe(colB.match(/"width":"\d+%"/)?.[0])
})

// ── QG 0.8.1: Claudin anda pela sala, ícones da rodada 2D, porta da frota ───────────────────────────
const claudinLeft = async (ui: any) => (await ui.find({ key: 'qg-claudin' }))?.props?.left as number

test('clicar num objeto do QG leva o Claudin andando até ele, passo a passo', async ($: any, on: any) => {
  const clock = mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  let ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  const start = await claudinLeft(ui)
  await ui.press({ key: 'spot-tempo' })
  await ui.unmount()
  await clock.advance(1_600)
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  const step = await claudinLeft(ui)
  await ui.unmount()
  await clock.advance(30_000)
  ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  const end = await claudinLeft(ui)
  await ui.unmount()
  expect(step).toBeGreaterThan(start)
  expect(end).toBeGreaterThan(step)
  expect(end).toBeGreaterThan(60) // o relógio fica perto da borda direita (100 colunas)
})

test('a porta da direita abre a frota e o raio do servidor brilha sem LEDs na gaveta de baixo', async ($: any, on: any) => {
  mock.clock(on, { now: NOV19 })
  await bootFs($, on, {}, { USERPROFILE: 'C:/u' }, { cenario: true })
  const ui = await $.ui.mount({ plugin: 'claudin', surface: 'desktop', ...PANE })
  expect(await ui.find({ key: 'spot-frota' })).toBeDefined()
  expect(await ui.find({ key: 'qg-col-tempo' })).toBeDefined() // relógio e porta dividem a coluna
  expect(JSON.stringify(await ui.find({ key: 'qg-col-tempo' }))).toContain('spot-frota')
  expect(await qg(ui)).toContain('href=\\"#i-servidor\\"')
  await ui.unmount()
})
