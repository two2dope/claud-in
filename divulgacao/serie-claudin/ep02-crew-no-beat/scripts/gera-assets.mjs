// Uso: node scripts/gera-assets.mjs
// Artes do episódio 2 tiradas do próprio código do mod: as quatro skins, os modos do Claudin, a frota e o QG no neon.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projeto = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(projeto, '..', '..')
const out = join(projeto, 'assets')
mkdirSync(out, { recursive: true })

const tmp = mkdtempSync(join(tmpdir(), 'claudin-ep2-'))
for (const nome of ['desenho', 'minis', 'minis-arte', 'cenario', 'cenario-arte', 'icones-vetor']) {
  writeFileSync(join(tmp, `${nome}.ts`), readFileSync(join(repo, 'hooks', `${nome}.ts`), 'utf8').replace(/from '(\.\/[a-z-]+)'/g, "from '$1.ts'"))
}
const load = nome => import(pathToFileURL(join(tmp, `${nome}.ts`)).href)
const { sprite, SKINS } = await load('desenho')
const { miniSvg } = await load('minis-arte')
const { composeQg, withOutline } = await load('cenario')
const { QG_ART } = await load('cenario-arte')

const save = (nome, svg) => writeFileSync(join(out, nome), svg)
const solto = svg => svg.replace(/<svg /, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')
const claudin = (mood, kind = 'normal', skin = SKINS.mangue, look = 'center') => solto(withOutline(sprite(mood, kind, look, skin)))

for (const s of ['mangue', 'mare', 'malungo', 'lama']) {
  save(`skin-${s}.svg`, claudin('ok', 'normal', SKINS[s]))
  save(`skin-${s}-idle.svg`, claudin('idle', 'normal', SKINS[s]))
}
save('claudin-idle.svg', claudin('idle'))
save('claudin-ok.svg', claudin('ok'))
save('claudin-alert.svg', claudin('alert'))
save('modo-cafe.svg', claudin('idle', 'cafe'))
save('modo-cigarro.svg', claudin('idle', 'cigarro'))
save('modo-meditar.svg', claudin('idle', 'meditar'))
save('modo-thug.svg', claudin('ok', 'thuglife'))
for (const k of ['siri', 'garca', 'guaiamum', 'aratu', 'caranguejinho']) save(`mini-${k}.svg`, solto(withOutline(miniSvg(k))))
const { w, h } = QG_ART
save('qg-neon.svg', composeQg(QG_ART.svg, { w, h, minutes: 22 * 60, pomo: null, lightsOff: true, neon: true, panel: null }).replace(/ width="\d+" height="\d+"/, ' width="100%" height="100%"'))
console.log('artes do ep. 2 geradas em', out)
