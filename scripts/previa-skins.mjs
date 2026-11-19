// Uso: node scripts/previa-skins.mjs <pasta-do-plugin> <saida.html>
// Gera uma página com o Claudin padrão e as três skins em várias poses e modos, para conferir o visual.
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const raiz = process.argv[2]
const saida = process.argv[3]
const { sprite, SKINS } = await import(pathToFileURL(`${raiz}/hooks/desenho.ts`).href)

const poses = ['idle', 'think', 'read', 'code', 'run', 'search', 'ok', 'err', 'alert']
const skins = [['padrão', undefined], ...Object.entries(SKINS)]
const bloco = (svg, w = 160) => `<div class="c"><div class="s" style="width:${w}px">${svg}</div></div>`

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1e1e1e;color:#ddd;font:13px system-ui;margin:16px}
h3{margin:18px 0 6px;font-weight:600}
.l{display:flex;gap:6px;flex-wrap:wrap}
.c{background:#262626;border-radius:6px;padding:6px 8px 2px}
.s svg{display:block;width:100%;height:auto}
small{display:block;text-align:center;color:#888;margin-top:2px}
</style>`
for (const [nome, def] of skins) {
  html += `<h3>${nome} — poses</h3><div class="l">`
  for (const p of poses) html += `<div>${bloco(sprite(p, 'normal', 'right', def), 128)}<small>${p}</small></div>`
  html += `</div><h3>${nome} — modos</h3><div class="l">`
  for (const k of ['cafe', 'cigarro', 'meditar', 'thuglife']) html += `<div>${bloco(sprite('idle', k, 'right', def), 128)}<small>${k}</small></div>`
  html += `</div>`
}
writeFileSync(saida, html)
console.log('ok', saida, skins.length, 'skins')
