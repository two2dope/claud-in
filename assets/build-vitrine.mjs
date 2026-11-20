// Uso: node assets/build-vitrine.mjs
// Gera as imagens da vitrine do README a partir do próprio código do mod:
//   assets/skins.svg  as quatro skins do Claudin (e o clássico) lado a lado, mais as cinco criaturas da frota
//   assets/qg.svg     o QG do Claudin no Mangue de dia, com o Claudin e duas miniaturas nas bancadas
// Precisa de Node 22.6+ (carrega .ts direto). Não são capturas de tela.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = nome => join(raiz, 'assets', nome)

// O código do plugin importa "./desenho" sem extensão; o Node exige ".ts". Copia os módulos puros com a extensão.
const tmp = mkdtempSync(join(tmpdir(), 'claudin-vitrine-'))
for (const nome of ['desenho', 'minis', 'minis-arte', 'cenario', 'cenario-arte', 'icones-arte']) {
  const fonte = readFileSync(join(raiz, 'hooks', `${nome}.ts`), 'utf8').replace(/from '(\.\/[a-z-]+)'/g, "from '$1.ts'")
  writeFileSync(join(tmp, `${nome}.ts`), fonte)
}
const load = nome => import(pathToFileURL(join(tmp, `${nome}.ts`)).href)
const { sprite, SKINS } = await load('desenho')
const { miniSvg } = await load('minis-arte')
const { composeQg, STATIONS, withOutline } = await load('cenario')
const { QG_ART } = await load('cenario-arte')

// Um SVG solto vira um <svg> aninhado na posição pedida (o viewBox de dentro continua valendo).
const place = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `).replace(/ xmlns="[^"]+"/, '')
const label = (x, y, text, size = 13, color = '#c9b8a8') =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="${size}" fill="${color}">${text}</text>`

// ── skins ──
{
  const W = 900
  const skins = [
    ['Mangue', SKINS.mangue, 'o padrão'],
    ['Maré', SKINS.mare, 'azul da maré'],
    ['Malungo', SKINS.malungo, 'chapéu de palha'],
    ['Lama', SKINS.lama, 'brotinho na cabeça'],
    ['clássico', undefined, 'o chapado de antes'],
  ]
  const cw = W / skins.length
  let body = ''
  skins.forEach(([nome, def, nota], i) => {
    const cx = cw * i + cw / 2
    body += place(sprite('idle', 'normal', 'right', def), cx - 64, 24, 128, 96)
    body += label(cx, 142, nome, 15, '#f0e2d0') + label(cx, 160, nota, 11)
  })
  const kinds = [
    ['siri', 'explorar'],
    ['garca', 'planejar'],
    ['guaiamum', 'executar'],
    ['aratu', 'revisar'],
    ['caranguejinho', 'o resto'],
  ]
  const kw = W / kinds.length
  kinds.forEach(([k, papel], i) => {
    const cx = kw * i + kw / 2
    body += place(miniSvg(k), cx - 24, 196, 48, 48)
    body += label(cx, 262, k === 'garca' ? 'garça' : k, 12, '#f0e2d0') + label(cx, 278, papel, 11)
  })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 296" width="100%"><rect width="${W}" height="296" rx="14" fill="#1d1712"/>${body}</svg>`
  writeFileSync(out('skins.svg'), svg)
}

// ── QG ──
{
  const { w, h } = QG_ART
  let svg = composeQg(QG_ART.svg, { w, h, minutes: 10 * 60 + 10, pomo: null })
  // Claudin e duas miniaturas por cima, em unidades da arte (360x76). O sprite é 16x12; no QG ele mede ~22 de largura.
  const claudin = place(withOutline(sprite('code', 'normal', 'right', SKINS.mangue)), 46, h - 21, 22, 17)
  const mini = (k, i) => place(withOutline(miniSvg(k)), STATIONS[i] * w - 6, h - 15, 12, 12)
  svg = svg.replace(/<\/svg>$/, claudin + mini('siri', 0) + mini('aratu', 2) + '</svg>')
  svg = svg.replace(/ width="\d+" height="\d+"/, ' width="100%"')
  writeFileSync(out('qg.svg'), svg)
}

console.log('assets/skins.svg e assets/qg.svg gerados')
