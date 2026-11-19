// Uso: node scripts/previa-skins.mjs <pasta-do-plugin> <saida.html>
// Gera uma página com o Claudin clássico e as quatro skins em várias poses e modos, e as cinco miniaturas da frota,
// para conferir o visual. O mascote aparece grande e também no tamanho real (44 px) ao lado das miniaturas (26 px).
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = process.argv[2]
const saida = process.argv[3]

// O código do plugin importa "./desenho" sem extensão (como o motor aceita); o Node exige ".ts". Copia os três
// módulos puros para uma pasta temporária com a extensão nos imports e carrega de lá.
const tmp = mkdtempSync(join(tmpdir(), 'claudin-previa-'))
for (const nome of ['desenho', 'minis', 'minis-arte']) {
  const fonte = readFileSync(join(raiz, 'hooks', `${nome}.ts`), 'utf8').replace(/from '(\.\/[a-z-]+)'/g, "from '$1.ts'")
  writeFileSync(join(tmp, `${nome}.ts`), fonte)
}
const { sprite, SKINS } = await import(pathToFileURL(join(tmp, 'desenho.ts')).href)
const { miniSvg } = await import(pathToFileURL(join(tmp, 'minis-arte.ts')).href)

const poses = ['idle', 'think', 'read', 'code', 'run', 'search', 'ok', 'err', 'alert']
const skins = [['clássico', undefined], ...Object.entries(SKINS)]
const kinds = ['siri', 'garca', 'guaiamum', 'aratu', 'caranguejinho']
const bloco = (svg, w) => `<div class="c"><div class="s" style="width:${w}px">${svg}</div></div>`

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1e1e1e;color:#ddd;font:13px system-ui;margin:16px}
h3{margin:18px 0 6px;font-weight:600}
.l{display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end}
.c{background:#262626;border-radius:6px;padding:6px 8px 2px}
.s svg{display:block;width:100%;height:auto;image-rendering:pixelated}
small{display:block;text-align:center;color:#888;margin-top:2px}
</style>`
for (const [nome, def] of skins) {
  html += `<h3>${nome} — poses</h3><div class="l">`
  for (const p of poses) html += `<div>${bloco(sprite(p, 'normal', 'right', def), 128)}<small>${p}</small></div>`
  html += `</div><h3>${nome} — modos e tamanho real</h3><div class="l">`
  for (const k of ['cafe', 'cigarro', 'meditar', 'thuglife']) html += `<div>${bloco(sprite('idle', k, 'right', def), 128)}<small>${k}</small></div>`
  html += `<div>${bloco(sprite('idle', 'normal', 'right', def), 44)}<small>real</small></div></div>`
}
html += `<h3>frota — miniaturas</h3><div class="l">`
for (const k of kinds) html += `<div>${bloco(miniSvg(k), 110)}<small>${k}</small></div>`
html += `</div><h3>frota — com o mascote, no tamanho real</h3><div class="l">`
for (const [nome, def] of skins) {
  html += `<div class="c" style="display:flex;gap:4px;align-items:flex-end"><div class="s" style="width:44px">${sprite('idle', 'normal', 'right', def)}</div>`
  for (const k of ['siri', 'garca']) html += `<div class="s" style="width:26px">${miniSvg(k)}</div>`
  html += `<small style="margin:0 0 0 6px">${nome}</small></div>`
}
html += `</div>`
writeFileSync(saida, html)
console.log('ok', saida, skins.length, 'skins')
