// Cofre de contexto: o Claudin só LÊ (nunca escreve em _hot, _log, _pending, Wiki nem no Raw).
// O caminho é pessoal: fica em <config>/claudin/cofre.json, nunca no repositório. Sem arquivo, com caminho
// inválido ou com a pasta inexistente, o recurso fica desligado, sem erro e sem mensagem.

export const COFRE_FILE = 'cofre.json'

const BS = String.fromCharCode(92)
const slashes = (p: string) => p.split(BS).join('/').replace(/\/+$/, '')

// Texto do cofre.json ({ "path": "..." }) vira o caminho com barras normais, ou null se não servir.
// "~/" vale a pasta pessoal; sem ela conhecida, desliga.
export function parseCofreConfig(text: string, home?: string): string | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  const raw = data && typeof data === 'object' && !Array.isArray(data) ? (data as { path?: unknown }).path : undefined
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const path = slashes(raw.trim())
  if (path === '~' || path.startsWith('~/')) {
    if (!home) return null
    return `${slashes(home)}${path.slice(1)}`
  }
  return path
}

// Devolve o caminho do cofre só se a configuração for válida e a pasta existir. Nunca lança.
export async function resolveCofre(readConfig: () => Promise<string | null>, exists: (path: string) => Promise<boolean>, home?: string): Promise<string | null> {
  try {
    const text = await readConfig()
    if (text === null) return null
    const path = parseCofreConfig(text, home)
    if (!path) return null
    return (await exists(path)) ? path : null
  } catch {
    return null
  }
}

// ── Wiki/_hot.md: o painel do dia que o ciclo diário reescreve (menos de 500 tokens). Só leitura. ──
export const HOT_FILE = 'Wiki/_hot.md'

export type Hot = { date: string | null; next: string | null; deadlines: number; urgent: number }

const BULLET = /^\s*[-*]\s+\S/

// Extrai do _hot só o que o Claudin mostra: data, próximo passo e quantos prazos e urgentes há. Tolera qualquer outra forma.
export function parseHot(text: string): Hot {
  const date = /^#\s*Hoje\s*[—–-]\s*(\d{4}-\d{2}-\d{2})/m.exec(text)?.[1] ?? null
  const rawNext = /\*\*Próximo passo:\*\*\s*(.+)/.exec(text)?.[1]?.trim().replace(/\.$/, '')
  let section: 'deadlines' | 'urgent' | null = null
  let deadlines = 0
  let urgent = 0
  for (const line of text.split(/\r?\n/)) {
    const h = /^##\s+(.*)$/.exec(line)
    if (h) {
      const name = (h[1] ?? '').trim().toLowerCase()
      section = name.startsWith('prazos') ? 'deadlines' : name.startsWith('urgente') ? 'urgent' : null
      continue
    }
    if (!section || !BULLET.test(line)) continue
    if (section === 'deadlines') deadlines++
    else urgent++
  }
  return { date, next: rawNext || null, deadlines, urgent }
}

const NEXT_MAX = 60

// Uma frase sóbria para a saudação do dia: próximo passo, urgentes e avisos de saúde; null quando não há o que dizer.
export function hotLine(hot: Hot, notes: string[] = []): string | null {
  const urgent = hot.urgent > 0 ? `${hot.urgent} urgente${hot.urgent > 1 ? 's' : ''}` : ''
  const next = hot.next ? (hot.next.length > NEXT_MAX ? `${hot.next.slice(0, NEXT_MAX - 1)}…` : hot.next) : ''
  const parts = [next, urgent, ...notes].filter(Boolean)
  return parts.length ? `cofre: ${parts.join(' · ')}` : null
}

// ── Saúde do cofre (só leitura; não substitui o cofre.py checar) ──
export const PENDING_FILE = 'Raw/_pending.md'
export const HOT_STALE_DAYS = 1 // o hot de ontem já avisa; o ciclo diário devia ter rodado hoje
export const PENDING_MAX = 40 // acima disso o ciclo diário manda rodar a compilação semanal

// Itens abertos da fila: linhas de lista com "[ ]".
export function countPending(text: string): number {
  return text.split(/\r?\n/).filter(l => /^\s*[-*]\s+\[ \]/.test(l)).length
}

// Dias entre duas datas AAAA-MM-DD (negativo quando a segunda vem antes).
export function daysBetween(from: string, to: string): number {
  const ms = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)))
  return Math.round((ms(to) - ms(from)) / 86_400_000)
}

// Avisos sóbrios: hot velho e fila grande. today é AAAA-MM-DD; pending é null quando a fila não pôde ser lida.
export function healthNotes(hot: Hot, today: string, pending: number | null): string[] {
  const notes: string[] = []
  if (hot.date) {
    const age = daysBetween(hot.date, today)
    if (age >= HOT_STALE_DAYS) notes.push(age === 1 ? 'o hot é de ontem' : `o hot tem ${age} dias`)
  }
  if (pending !== null && pending > PENDING_MAX) notes.push(`fila com ${pending} itens`)
  return notes
}

// ── Prazos do _hot espelhados na Agenda (o cofre é a fonte; o Claudin não escreve de volta) ──
export type HotDeadline = { date: string; title: string; source?: string }

const DEADLINE_LINE = /^\s*[-*]\s+(?:(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?)\s*(?:[·:–—-]\s*)?(.*)$/
const DEADLINES_MAX = 30
const p2 = (n: number) => String(n).padStart(2, '0')

function validDate(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return `${y}-${p2(m)}-${p2(d)}`
}

// Lê a seção "Prazos" do _hot: "- DD/MM · o quê · fonte". DD/MM escolhe o ano pela data de hoje (AAAA-MM-DD).
// O _hot é texto livre: linha sem data válida ou sem título é ignorada, nunca quebra.
export function parseHotDeadlines(text: string, today: string): HotDeadline[] {
  const out: HotDeadline[] = []
  let inSection = false
  for (const line of text.split(/\r?\n/)) {
    const h = /^##\s+(.*)$/.exec(line)
    if (h) {
      inSection = (h[1] ?? '').trim().toLowerCase().startsWith('prazos')
      continue
    }
    if (!inSection) continue
    const m = DEADLINE_LINE.exec(line)
    if (!m) continue
    let date: string | null
    if (m[1]) {
      date = validDate(Number(m[1]), Number(m[2]), Number(m[3]))
    } else {
      const month = Number(m[5])
      const day = Number(m[4])
      if (m[6]) {
        const y = Number(m[6])
        date = validDate(y < 100 ? 2000 + y : y, month, day)
      } else {
        const year = Number(today.slice(0, 4))
        date = validDate(year, month, day)
        if (date && daysBetween(today, date) < -60) date = validDate(year + 1, month, day)
      }
    }
    if (!date) continue
    const [title, source] = (m[7] ?? '').split('·').map(x => x.trim()).filter(Boolean)
    if (!title) continue
    out.push(source ? { date, title, source } : { date, title })
    if (out.length >= DEADLINES_MAX) break
  }
  return out
}

type DeadlineLike = { id: string; date: string; title: string }

// Junta os prazos locais com os do cofre; o mesmo prazo (data e título) aparece uma vez, do lado do cofre.
export function mergeDeadlines<T extends DeadlineLike>(local: T[], fromCofre: T[]): T[] {
  const key = (d: DeadlineLike) => `${d.date}|${d.title.trim().toLowerCase()}`
  const taken = new Set(fromCofre.map(key))
  return [...local.filter(d => !taken.has(key(d))), ...fromCofre]
}

// ── Aba Cofre: o _hot em leitura (fios ativos e urgentes, como texto) ──
export type HotLists = { fios: string[]; urgent: string[] }
const LIST_MAX = 8

export function parseHotLists(text: string): HotLists {
  const out: HotLists = { fios: [], urgent: [] }
  let section: keyof HotLists | null = null
  for (const line of text.split(/\r?\n/)) {
    const h = /^##\s+(.*)$/.exec(line)
    if (h) {
      const name = (h[1] ?? '').trim().toLowerCase()
      section = name.startsWith('fios') ? 'fios' : name.startsWith('urgente') ? 'urgent' : null
      continue
    }
    if (!section || !BULLET.test(line)) continue
    const item = line.replace(/^\s*[-*]\s+/, '').trim()
    if (item && out[section].length < LIST_MAX) out[section].push(item)
  }
  return out
}

// ── Captura rápida: a ÚNICA escrita do Claudin no cofre é criar um arquivo NOVO em Raw/Notas ──
// Nunca edita nem apaga, nunca mexe no _pending nem roda selar: o ciclo diário enfileira e sela (cofre.py novos).
export const NOTES_DIR = 'Raw/Notas'
const TITLE_MAX = 60
const NAME_TRIES = 50

// "AAAA-MM-DD - <título> (claudin)": título da primeira linha, sem caractere proibido no Windows, com até 60 caracteres.
export function noteFileStem(text: string, today: string): string {
  const first = text.split(/\r?\n/).find(l => l.trim()) ?? ''
  const clean = first.replace(/[<>:"/\|?*\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim()
  const title = clean.slice(0, TITLE_MAX).replace(/[. ]+$/, '') || 'nota'
  return `${today} - ${title} (claudin)`
}

// Primeiro nome livre: "<stem>.md", depois "<stem> (2).md"... Nunca devolve um que já existe; null se desistir.
export async function freeNoteName(stem: string, exists: (name: string) => Promise<boolean>): Promise<string | null> {
  for (let n = 1; n <= NAME_TRIES; n++) {
    const name = n === 1 ? `${stem}.md` : `${stem} (${n}).md`
    if (!(await exists(name))) return name
  }
  return null
}
