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