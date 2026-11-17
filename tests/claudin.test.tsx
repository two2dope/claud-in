import { expect, mock, test } from 'claude-code/testing'

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
const bootFs = async ($: any, on: any, files: Record<string, string>, env: Record<string, string>) => {
  mock.store(on)
  mock.env(on, env)
  // Chave absoluta (C:/...) casa o caminho exato; chave relativa casa o arquivo do plugin, nunca os da pasta do usuário.
  const hit = (p: string) => {
    const path = p.split(String.fromCharCode(92)).join('/')
    return Object.keys(files).find(k => (/^[A-Za-z]:\//.test(k) ? path === k : !/^(C:\/u|D:\/cfg)/.test(path) && path.endsWith(`/${k}`)))
  }
  on('fs.exists', (_: any, e: any) => ({ value: hit(e.path) !== undefined }))
  on('fs.read', (_: any, e: any) => ({ value: files[hit(e.path) ?? ''] ?? '' }))
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
