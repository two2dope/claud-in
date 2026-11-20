// Uso: node scripts/gera-assets.mjs
// Gera as artes do vídeo a partir do próprio código do mod (hooks/ do repositório), sem redesenhar nada:
// o Claudin em poses e skins, as criaturas da frota, o QG de dia, de noite com a luz apagada e no modo neon,
// e os ícones em vetor. Precisa de Node 22.6+ (carrega .ts direto).
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projeto = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(projeto, '..', '..')
const out = join(projeto, 'assets')
mkdirSync(out, { recursive: true })

const tmp = mkdtempSync(join(tmpdir(), 'claudin-video-'))
for (const nome of ['desenho', 'minis', 'minis-arte', 'cenario', 'cenario-arte', 'icones-vetor']) {
  const fonte = readFileSync(join(repo, 'hooks', `${nome}.ts`), 'utf8').replace(/from '(\.\/[a-z-]+)'/g, "from '$1.ts'")
  writeFileSync(join(tmp, `${nome}.ts`), fonte)
}
const load = nome => import(pathToFileURL(join(tmp, `${nome}.ts`)).href)
const { sprite, SKINS } = await load('desenho')
const { miniSvg } = await load('minis-arte')
const { composeQg, withOutline } = await load('cenario')
const { QG_ART } = await load('cenario-arte')
const { VECTOR_ICON } = await load('icones-vetor')

const save = (nome, svg) => writeFileSync(join(out, nome), svg)
// Sprite do mod sem tamanho fixo: o vídeo dá o tamanho pelo CSS.
const solto = svg => svg.replace(/<svg /, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')

// Claudin (skin Mangue) nas poses que o vídeo usa, e em modos.
for (const mood of ['idle', 'think', 'read', 'code', 'run', 'ok', 'alert']) save(`claudin-${mood}.svg`, solto(withOutline(sprite(mood, 'normal', 'center', SKINS.mangue))))
save('claudin-walk.svg', solto(withOutline(sprite('run', 'normal', 'right', SKINS.mangue))))
save('claudin-cafe.svg', solto(withOutline(sprite('idle', 'cafe', 'center', SKINS.mangue))))
save('claudin-thug.svg', solto(withOutline(sprite('ok', 'thuglife', 'center', SKINS.mangue))))
// As quatro skins.
for (const s of ['mangue', 'mare', 'malungo', 'lama']) save(`skin-${s}.svg`, solto(withOutline(sprite('ok', 'normal', 'center', SKINS[s]))))
// A frota.
for (const k of ['siri', 'garca', 'guaiamum', 'aratu', 'caranguejinho']) save(`mini-${k}.svg`, solto(withOutline(miniSvg(k))))
// Ícones em vetor.
for (const [k, v] of Object.entries(VECTOR_ICON)) save(`icone-${k}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="100%" height="100%">${v}</svg>`)

// O QG em três estados. O painel usa números de exemplo (ilustrativos).
const { w, h } = QG_ART
const painel = { model: 'claude-opus-5-5', ctx: 32, tokens: 154_000, window: 1_000_000, usd: 1.95, limit5h: 12, limit7d: 40, agents: 4, tools: 12 }
const qg = s => composeQg(QG_ART.svg, { w, h, pomo: null, ...s }).replace(/ width="\d+" height="\d+"/, ' width="100%" height="100%"')
save('qg-dia.svg', qg({ minutes: 9 * 60 + 40, panel: painel, working: true }))
save('qg-manha.svg', qg({ minutes: 9 * 60 + 40, panel: null }))
save('qg-noite.svg', qg({ minutes: 22 * 60, lightsOff: true, panel: painel }))
save('qg-neon.svg', qg({ minutes: 22 * 60, lightsOff: true, neon: true, panel: painel }))
console.log('artes geradas em', out)
