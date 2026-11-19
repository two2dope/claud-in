// Cola da Oficina: o Claudin só LÊ o catalogo.json do repositório de skills do usuário e mostra as skills agrupadas
// por plugin; clicar preenche o prompt com /plugin:skill. O caminho é pessoal (<config>/claudin/cola.json, mesmo
// formato do cofre.json: { "path": "..." }) e nada do catálogo vive neste repositório. Sem arquivo, com caminho
// inválido ou inexistente, a aba não aparece.

export const COLA_FILE = 'cola.json'

export type ColaSkill = { name: string; status: string }
export type ColaGroup = { plugin: string; versao: string; descricao: string; skills: ColaSkill[] }
export type Cola = { groups: ColaGroup[] }
export type ColaRow = { kind: 'head' | 'skill'; key: string; label: string; command?: string }

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9_-]*$/
const DESC_MAX = 120
const PLATFORM = 'claude-code'

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown) => (typeof v === 'string' ? v : '')

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
      g = { plugin, versao: str(info.versao), descricao: str(info.descricao).slice(0, DESC_MAX), skills: [] }
      groups.set(plugin, g)
    }
    return g
  }
  // A ordem dos plugins no catálogo é a da cola; grupo sem skill some no fim.
  for (const p of Object.keys(plugins)) if (SAFE_NAME.test(p)) group(p)

  for (const [name, raw] of Object.entries(data.skills)) {
    if (!SAFE_NAME.test(name) || !isObj(raw)) continue
    const plugin = str(raw.plugin)
    if (!SAFE_NAME.test(plugin)) continue
    const where = raw.plataformas
    if (Array.isArray(where) && !where.includes(PLATFORM)) continue
    group(plugin).skills.push({ name, status: str(raw.status) })
  }
  const filled = [...groups.values()].filter(g => g.skills.length > 0)
  return filled.length > 0 ? { groups: filled } : null // catálogo sem nenhuma skill utilizável não serve
}

// O comando que vai ao prompt, com espaço no fim para a pessoa continuar a digitar.
export const colaCommand = (plugin: string, skill: string): string => `/${plugin}:${skill} `

// Busca sem diferenciar maiúscula. Skill que casa pelo nome (plugin:skill) aparece sozinha; sem nenhuma, o plugin que
// casa pelo nome ou pela descrição traz todas as suas skills.
export function filterCola(cola: Cola, q: string): Cola {
  const needle = q.trim().toLowerCase()
  if (!needle) return cola
  const groups: ColaGroup[] = []
  for (const g of cola.groups) {
    const skills = g.skills.filter(s => `${g.plugin}:${s.name}`.toLowerCase().includes(needle))
    if (skills.length > 0) groups.push({ ...g, skills })
    else if (`${g.plugin} ${g.descricao}`.toLowerCase().includes(needle)) groups.push(g)
  }
  return { groups }
}

// Linhas da aba: um título por plugin e uma linha por skill. O título é texto; a skill é botão.
export function flattenCola(cola: Cola): ColaRow[] {
  const rows: ColaRow[] = []
  for (const g of cola.groups) {
    rows.push({ kind: 'head', key: `cl-h-${g.plugin}`, label: g.versao ? `${g.plugin} · v${g.versao}` : g.plugin })
    for (const s of g.skills) {
      rows.push({
        kind: 'skill',
        key: `cl-${g.plugin}:${s.name}`,
        label: `/${g.plugin}:${s.name}${s.status && s.status !== 'estavel' ? ` · ${s.status}` : ''}`,
        command: colaCommand(g.plugin, s.name),
      })
    }
  }
  return rows
}
