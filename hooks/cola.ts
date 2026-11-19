// Cola da Oficina: o Claudin só LÊ o catalogo.json do repositório de skills do usuário e mostra as skills agrupadas
// por plugin; clicar preenche o prompt com /plugin:skill e o Claudin diz o que a skill faz. O caminho é pessoal
// (<config>/claudin/cola.json, mesmo formato do cofre.json: { "path": "..." }) e nada do catálogo vive neste
// repositório. Sem arquivo, com caminho inválido ou inexistente, o botão da Cola não aparece.

export const COLA_FILE = 'cola.json'
// Id do grupo dos scripts da oficina (oficina.py) entre os grupos de plugin.
export const SCRIPTS_ID = '@scripts'

export type ColaCmd = { nome: string; descricao: string; exemplo: string }
export type ColaSkill = { name: string; status: string; descricao: string; exemplo: string }
export type ColaGroup = { plugin: string; titulo: string; versao: string; lead: string; descricao: string; comandos: ColaCmd[]; skills: ColaSkill[] }
export type Cola = { groups: ColaGroup[]; scripts: ColaCmd[] }
// group = abre ou fecha um plugin; head = título só de leitura (busca); item = botão que preenche o prompt e fala;
// note = linha só de leitura (comando que não é de barra).
export type ColaRow = { kind: 'group' | 'head' | 'item' | 'note'; key: string; label: string; group?: string; command?: string; say?: string }

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9_-]*$/
const SAFE_SLASH = /^\/[A-Za-z0-9][A-Za-z0-9:_-]*(?: [A-Za-z0-9_-]+)*$/ // /comando, com argumentos simples
const CONTROL = /[\u0000-\u001f]/
const PLATFORM = 'claude-code'
const TEXT_MAX = 300
const TITLE_MAX = 40
const LEAD_MAX = 160
const EXAMPLE_MAX = 160
const NAME_MAX = 100

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown, max = TEXT_MAX) => (typeof v === 'string' ? v.slice(0, max) : '')

function cmds(v: unknown): ColaCmd[] {
  if (!Array.isArray(v)) return []
  const out: ColaCmd[] = []
  for (const raw of v) {
    if (!isObj(raw)) continue
    const nome = str(raw.nome, NAME_MAX).trim()
    if (!nome || CONTROL.test(nome)) continue
    out.push({ nome, descricao: str(raw.descricao), exemplo: str(raw.exemplo, EXAMPLE_MAX) })
  }
  return out
}

// Texto do catalogo.json vira os grupos de skills, ou null se não for um catálogo. Pula as skills que não rodam no
// Claude Code e os nomes que não dariam um comando seguro.
export function parseCatalogo(text: string): Cola | null {
  let data: unknown
  try {
    data = JSON.parse(text.replace(/^﻿/, ''))
  } catch {
    return null
  }
  if (!isObj(data) || !isObj(data.skills)) return null
  const plugins = isObj(data.plugins) ? data.plugins : {}

  const groups = new Map<string, ColaGroup>()
  const group = (plugin: string): ColaGroup => {
    let g = groups.get(plugin)
    if (!g) {
      const info = isObj(plugins[plugin]) ? (plugins[plugin] as Record<string, unknown>) : {}
      g = {
        plugin,
        titulo: str(info.titulo, TITLE_MAX).trim() || plugin,
        versao: str(info.versao, 20),
        lead: str(info.lead, LEAD_MAX),
        descricao: str(info.descricao),
        comandos: cmds(info.comandos),
        skills: [],
      }
      groups.set(plugin, g)
    }
    return g
  }
  // A ordem dos plugins no catálogo é a da cola; grupo sem skill some no fim.
  for (const p of Object.keys(plugins)) if (SAFE_NAME.test(p)) group(p)

  for (const [name, raw] of Object.entries(data.skills)) {
    if (!SAFE_NAME.test(name) || !isObj(raw)) continue
    const plugin = str(raw.plugin, NAME_MAX)
    if (!SAFE_NAME.test(plugin)) continue
    const where = raw.plataformas
    if (Array.isArray(where) && !where.includes(PLATFORM)) continue
    group(plugin).skills.push({ name, status: str(raw.status, 20), descricao: str(raw.descricao), exemplo: str(raw.exemplo, EXAMPLE_MAX) })
  }
  const filled = [...groups.values()].filter(g => g.skills.length > 0)
  return filled.length > 0 ? { groups: filled, scripts: cmds(data.scripts) } : null // catálogo sem nenhuma skill utilizável não serve
}

// Os comandos do próprio Claudin, sempre na Cola (depois dos plugins do catálogo), porque não moram no catálogo da oficina.
export const CLAUDIN_GROUP: ColaGroup = {
  plugin: 'claudin',
  titulo: 'Claudin',
  versao: '',
  lead: '',
  descricao: 'Comandos do mascote: onde ele fica na tela.',
  comandos: [
    { nome: '/claudin', descricao: 'Traz o Claudin de volta onde estava.', exemplo: '' },
    { nome: '/claudin lateral', descricao: 'Põe o Claudin no painel lateral.', exemplo: '' },
    { nome: '/claudin prompt', descricao: 'Põe o Claudin acima do prompt.', exemplo: '' },
    { nome: '/claudin ocultar', descricao: 'Esconde o Claudin; /claudin traz de volta.', exemplo: '' },
  ],
  skills: [],
}

export const withClaudin = (cola: Cola): Cola => (cola.groups.some(g => g.plugin === CLAUDIN_GROUP.plugin) ? cola : { ...cola, groups: [...cola.groups, CLAUDIN_GROUP] })

// O comando que vai ao prompt, com espaço no fim para a pessoa continuar a digitar.
export const colaCommand = (plugin: string, skill: string): string => `/${plugin}:${skill} `

// O que o Claudin diz ao escolher: a descrição e, se houver, um exemplo de uso.
export const colaSay = (descricao: string, exemplo: string): string => (descricao ? (exemplo ? `${descricao} Ex.: ${exemplo}` : descricao) : exemplo ? `Ex.: ${exemplo}` : '')

const has = (s: string, needle: string) => s.toLowerCase().includes(needle)

// Busca sem diferenciar maiúscula. Skill ou comando que casa (nome, descrição, exemplo) aparece sozinho; sem nenhum,
// o plugin que casa pelo nome, título, descrição ou lead traz todas as suas skills. Os scripts casam por nome e descrição.
export function filterCola(cola: Cola, q: string): Cola {
  const needle = q.trim().toLowerCase()
  if (!needle) return cola
  const groups: ColaGroup[] = []
  for (const g of cola.groups) {
    const skills = g.skills.filter(s => has(`${g.plugin}:${s.name} ${s.descricao} ${s.exemplo}`, needle))
    const comandos = g.comandos.filter(c => has(`${c.nome} ${c.descricao} ${c.exemplo}`, needle))
    if (skills.length > 0 || comandos.length > 0) groups.push({ ...g, skills, comandos })
    else if (has(`${g.plugin} ${g.titulo} ${g.descricao} ${g.lead}`, needle)) groups.push(g)
  }
  return { groups, scripts: cola.scripts.filter(c => has(`${c.nome} ${c.descricao}`, needle)) }
}

const headLabel = (g: ColaGroup) => (g.versao ? `${g.titulo} · v${g.versao}` : g.titulo)

function cmdRows(prefix: string, list: ColaCmd[], slash: boolean): ColaRow[] {
  return list.map((c, i) => {
    const key = `${prefix}${i}`
    const command = slash ? (SAFE_SLASH.test(c.nome) ? `${c.nome} ` : undefined) : `${c.nome} `
    return command ? { kind: 'item', key, label: c.nome, command, say: colaSay(c.descricao, c.exemplo) } : { kind: 'note', key, label: c.nome }
  })
}

const skillRows = (g: ColaGroup): ColaRow[] =>
  g.skills.map(s => ({
    kind: 'item',
    key: `cl-${g.plugin}:${s.name}`,
    label: `/${g.plugin}:${s.name}${s.status && s.status !== 'estavel' ? ` · ${s.status}` : ''}`,
    command: colaCommand(g.plugin, s.name),
    say: colaSay(s.descricao, s.exemplo),
  }))

// Linhas da aba. Sem busca: um botão por plugin (e um para os scripts); o aberto mostra o conteúdo e esconde os outros, então a
// lista cabe em poucas páginas. Com busca: tudo o que casa aparece aberto, com títulos só de leitura.
export function flattenCola(cola: Cola, open: string, q: string): ColaRow[] {
  const rows: ColaRow[] = []
  if (q.trim()) {
    const f = filterCola(cola, q)
    for (const g of f.groups) rows.push({ kind: 'head', key: `cl-h-${g.plugin}`, label: headLabel(g) }, ...cmdRows(`cl-c-${g.plugin}:`, g.comandos, true), ...skillRows(g))
    if (f.scripts.length > 0) rows.push({ kind: 'head', key: 'cl-h-scripts', label: 'oficina.py' }, ...cmdRows('cl-s-', f.scripts, false))
    return rows
  }
  // Com um plugin aberto, só ele fica na lista (com o título no topo): o conteúdo cabe na primeira página e o
  // mesmo botão recolhe e traz os outros de volta.
  const active = open === SCRIPTS_ID ? (cola.scripts.length > 0 ? SCRIPTS_ID : '') : cola.groups.some(g => g.plugin === open) ? open : ''
  for (const g of cola.groups) {
    if (active && active !== g.plugin) continue
    const isOpen = open === g.plugin
    rows.push({ kind: 'group', key: `cl-g-${g.plugin}`, group: g.plugin, label: `${isOpen ? '▾' : '▸'} ${headLabel(g)} · ${g.skills.length || g.comandos.length}` })
    if (isOpen) rows.push(...cmdRows(`cl-c-${g.plugin}:`, g.comandos, true), ...skillRows(g))
  }
  if (cola.scripts.length > 0 && (!active || active === SCRIPTS_ID)) {
    const isOpen = open === SCRIPTS_ID
    rows.push({ kind: 'group', key: `cl-g-${SCRIPTS_ID}`, group: SCRIPTS_ID, label: `${isOpen ? '▾' : '▸'} oficina.py · ${cola.scripts.length}` })
    if (isOpen) rows.push(...cmdRows('cl-s-', cola.scripts, false))
  }
  return rows
}
