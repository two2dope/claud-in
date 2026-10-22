// Gera as ilustrações animadas do README: poses, modos, balões e caixa de ferramentas.
// O desenho do Claudin é um port de `sprite()` em hooks/register.tsx (grade 16x12). Se o sprite mudar lá, mude aqui.
// Uso: node assets/build-assets.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const CORAL = '#D97757'
const INK = '#1a1a1a'
const PAPER = '#f5f4ed'
const DIM = '#8f8d84'
const SOFT = '#cfcdc3'
const LINE = '#3a3a3a'
const PANEL = '#1f1f1f'
const MONO = 'ui-monospace, SFMono-Regular, Consolas, Menlo, monospace'

const px = (x, y, w = 1, h = 1, f = CORAL) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`
const rect = (x, y, w, h, f, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`
const text = (x, y, s, size, fill, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`

// Port de sprite(mood, kind, look='center') de hooks/register.tsx.
function sprite(mood, kind = 'normal', look = 'center') {
  const busy = mood === 'code' || mood === 'run' || mood === 'read' || mood === 'search'
  const body = px(3, 3, 10, 5) + px(2, 4, 12, 3)
  const antennae = px(4, 1) + px(4, 2) + px(11, 1) + px(11, 2)
  const legs = [3, 5, 10, 12].map(x => px(x, 8, 1, 2)).join('')
  const legAnim = busy
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 .6;0 0" dur=".35s" repeatCount="indefinite"/>`
    : ''
  const arms =
    mood === 'ok'
      ? px(0, 2, 2, 1) + px(0, 3) + px(14, 2, 2, 1) + px(15, 3)
      : px(0, 5, 2, 1) + px(14, 5, 2, 1)
  const blink = busy ? '' : `<animate attributeName="height" values="2;2;2;.3;2" dur="4s" repeatCount="indefinite"/>`
  const eyes =
    kind === 'meditar'
      ? px(5, 5, 2, 0.4, INK) + px(10, 5, 2, 0.4, INK)
      : kind === 'thuglife' && mood !== 'err'
        ? px(4.5, 4, 3, 2.2, '#111111') + px(9.5, 4, 3, 2.2, '#111111') + px(7.5, 4.4, 2, 0.5, '#111111') +
          px(3, 4.4, 1.5, 0.5, '#111111') + px(12.5, 4.4, 1.5, 0.5, '#111111') +
          px(5, 4.3, 0.9, 0.5, '#6f6f6f') + px(10, 4.3, 0.9, 0.5, '#6f6f6f')
        : kind === 'cafe' && mood !== 'err' && mood !== 'think'
          ? [4.5, 9.5]
              .map(ex => {
                const dx = look === 'left' ? 0 : look === 'right' ? 1 : 0.5
                const dy = look === 'up' ? 0 : look === 'down' ? 1 : 0.5
                return (
                  `<rect x="${ex}" y="3.5" width="3" height="3" fill="${PAPER}"/>` +
                  `<rect x="${ex + dx}" y="${3.5 + dy}" width="2" height="2" fill="${INK}"/>` +
                  `<rect x="${ex + dx + 0.3}" y="${3.5 + dy + 0.3}" width="0.5" height="0.5" fill="${PAPER}"/>`
                )
              })
              .join('')
          : mood === 'err'
            ? px(5, 4, 1, 1, INK) + px(7, 4, 1, 1, INK) + px(6, 5, 1, 1, INK) + px(5, 6, 1, 1, INK) + px(7, 6, 1, 1, INK) +
              px(9, 4, 1, 1, INK) + px(11, 4, 1, 1, INK) + px(10, 5, 1, 1, INK) + px(9, 6, 1, 1, INK) + px(11, 6, 1, 1, INK)
            : mood === 'think'
              ? px(6, 4, 1, 2, INK) + px(10, 4, 1, 2, INK) + px(7, 4, 1, 1, INK)
              : [5, 10]
                  .map(ex => {
                    const dx = look === 'left' ? 0 : look === 'right' ? 1 : 0.5
                    const dy = look === 'up' ? 0 : look === 'down' ? 1 : 0.5
                    const sweep = look === 'sweep' ? `<animate attributeName="x" values="${ex};${ex + 1};${ex}" dur="1.4s" repeatCount="indefinite"/>` : ''
                    const sclera = `<rect x="${ex}" y="4" width="2" height="2" fill="${PAPER}">${blink}</rect>`
                    const pupil = `<rect x="${ex + dx}" y="${4 + dy}" width="1" height="1" fill="${INK}">${sweep}${busy ? '' : `<animate attributeName="height" values="1;1;1;.2;1" dur="4s" repeatCount="indefinite"/>`}</rect>`
                    return sclera + pupil
                  })
                  .join('')
  const keys =
    mood === 'code'
      ? `<g fill="#7dd3fc"><rect x="3" y="10.5" width="1" height="1"><animate attributeName="opacity" values="1;0;1" dur=".3s" repeatCount="indefinite"/></rect><rect x="7" y="10.5" width="1" height="1"><animate attributeName="opacity" values="0;1;0" dur=".3s" repeatCount="indefinite"/></rect><rect x="11" y="10.5" width="1" height="1"><animate attributeName="opacity" values="1;0;1" dur=".45s" repeatCount="indefinite"/></rect></g>`
      : ''
  const fade = (dur, from, to) => `<animate attributeName="opacity" values="${from};${to};${from}" dur="${dur}" repeatCount="indefinite"/>`
  const prop =
    mood === 'alert'
      ? px(7.5, 0, 1, 1.6, '#f5b73d') + px(7.5, 2, 1, 0.6, '#f5b73d')
      : kind === 'cafe'
        ? px(14, 3, 2, 2, PAPER) + px(14, 3, 2, 0.7, '#6b4423') +
          `<rect x="14.7" y="1.6" width="0.6" height="1" fill="#cfcfcf">${fade('1.2s', 0.2, 0.9)}</rect>`
        : kind === 'cigarro'
          ? px(0, 4, 2, 0.6, PAPER) + px(0, 4, 0.6, 0.6, '#ff6a3d') +
            `<rect x="0.2" y="2.6" width="0.6" height="1" fill="#9a9a9a">${fade('1.6s', 0.1, 0.8)}</rect>`
          : kind === 'meditar'
            ? px(12.5, 0.2, 3, 1.2, '#d64545') + px(13.2, 0.4, 0.6, 0.6, PAPER) + px(14.4, 0.6, 0.5, 0.5, PAPER) + px(13.2, 1.4, 1.1, 1.3, PAPER)
            : ''
  return `${antennae}${body}${arms}<g>${legs}${legAnim}</g>${eyes}${keys}${prop}`
}

// Coloca um Claudin numa posição, com escala.
const mascot = (x, y, s, mood, kind, look) =>
  `<g transform="translate(${x} ${y}) scale(${s})" shape-rendering="crispEdges">${sprite(mood, kind, look)}</g>`

const frame = (w, h, body, title, desc) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${title}</title>
<desc id="d">${desc}</desc>
<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><rect x="11" y="11" width="2" height="2" fill="#262626"/></pattern></defs>
<rect width="${w}" height="${h}" fill="#161616"/>
<rect width="${w}" height="${h}" fill="url(#dots)"/>
${body}
</svg>
`

const out = name => join(dirname(fileURLToPath(import.meta.url)), name)

// 1. Poses
{
  const poses = [
    ['idle', 'parado'],
    ['think', 'pensando'],
    ['read', 'lendo'],
    ['code', 'codando'],
    ['run', 'rodando'],
    ['search', 'buscando'],
    ['ok', 'pronto'],
    ['err', 'erro'],
    ['alert', 'alerta'],
  ]
  const looks = { think: 'up', code: 'down', run: 'down', read: 'sweep', search: 'sweep' }
  const W = 1280
  const H = 300
  const cell = 128
  const x0 = (W - cell * poses.length) / 2
  let body = text(64, 64, 'Nove poses, uma para cada situação', 26, PAPER)
  poses.forEach(([mood, label], i) => {
    const cx = x0 + i * cell
    body += rect(cx + 8, 100, cell - 16, 140, PANEL, `stroke="${LINE}" stroke-width="2"`)
    body += mascot(cx + 16, 126, 6, mood, 'normal', looks[mood] ?? 'center')
    body += text(cx + cell / 2, 226, label, 17, SOFT, 'text-anchor="middle"')
  })
  writeFileSync(out('poses.svg'), frame(W, H, body, 'As nove poses do Claudin', 'Parado, pensando, lendo, codando, rodando, buscando, pronto, erro e alerta, cada um com a sua animação.'))
}

// 2. Modos
{
  const modes = [
    ['normal', 'normal', 'fala do que importa'],
    ['cafe', 'café', 'olhos bem abertos'],
    ['cigarro', 'cigarro', 'pausa de 10 minutos'],
    ['meditar', 'meditar', 'só erro e risco'],
    ['thuglife', 'thug life', 'óculos escuros'],
  ]
  const W = 1280
  const H = 340
  const cell = 232
  const x0 = (W - cell * modes.length) / 2
  let body = text(64, 64, 'Cinco modos, trocados em Ajustes', 26, PAPER)
  modes.forEach(([kind, label, desc], i) => {
    const cx = x0 + i * cell
    body += rect(cx + 8, 96, cell - 16, 200, PANEL, `stroke="${LINE}" stroke-width="2"`)
    body += mascot(cx + 36, 118, 10, 'idle', kind, 'center')
    body += text(cx + cell / 2, 262, label, 20, PAPER, 'text-anchor="middle"')
    body += text(cx + cell / 2, 284, desc, 14, DIM, 'text-anchor="middle"')
  })
  writeFileSync(out('modos.svg'), frame(W, H, body, 'Os cinco modos do Claudin', 'Normal, café, cigarro, meditar e thug life, cada um com seu visual.'))
}

// 3. Balões: ciclo de quatro cenas com as falas reais do mod.
{
  const W = 1280
  const H = 340
  const scenes = [
    { mood: 'run', border: PAPER, say: 'Ainda rodando: npm test (30 s+).', button: null, cap: ['Tarefa longa', 'Passou de 30 segundos: ele avisa.'] },
    { mood: 'err', border: '#d64545', say: 'Falhou: npm test. Quer que eu investigue?', button: 'investigar', cap: ['Falha', 'O botão só preenche o prompt. Você decide enviar.'] },
    { mood: 'alert', border: '#f5b73d', say: 'Cuidado: git push --force pode apagar coisas.', button: null, cap: ['Comando de risco', 'Aviso antes de você aprovar.'] },
    { mood: 'ok', border: '#5cb85c', say: 'Pronto: 2 arquivos editados, 1 comando.', button: 'rodar testes', cap: ['Fim do turno', 'Resumo e a próxima ação sugerida.'] },
  ]
  const N = scenes.length
  const dur = N * 4
  let body = ''
  scenes.forEach((sc, i) => {
    const s = (i / N).toFixed(4)
    const e = ((i + 1) / N).toFixed(4)
    const anim = `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${s};${e}" dur="${dur}s" repeatCount="indefinite"/>`
    const look = sc.mood === 'run' ? 'down' : 'center'
    let g = ''
    g += rect(64, 56, 560, 64, PANEL, `stroke="${sc.border}" stroke-width="4"`)
    g += rect(64 + 7 * 12, 56 + 64 - 2, 24, 4, PANEL)
    g += rect(64 + 7 * 12, 56 + 64 + 2, 24, 12, PANEL)
    g += rect(64 + 7 * 12, 56 + 64 + 2, 4, 12, sc.border)
    g += rect(64 + 9 * 12 - 4, 56 + 64 + 2, 4, 12, sc.border)
    g += rect(64 + 7 * 12, 56 + 64 + 14, 24, 4, sc.border)
    g += text(88, 96, sc.say, 22, PAPER)
    if (sc.button) {
      g += rect(290, 200, 20 + sc.button.length * 10, 34, '#2a2a2a', `stroke="${CORAL}" stroke-width="2"`)
      g += text(300, 223, sc.button, 17, CORAL)
    }
    g += mascot(64, 150, 12, sc.mood, 'normal', look)
    g += text(700, 150, sc.cap[0], 30, PAPER)
    g += text(700, 188, sc.cap[1], 18, SOFT)
    body += `<g opacity="0">${anim}${g}</g>`
  })
  writeFileSync(out('baloes.svg'), frame(W, H, body, 'Os balões do Claudin', 'Quatro cenas em ciclo: tarefa longa, falha com botão investigar, comando de risco e resumo do fim do turno.'))
}

// 4. Caixa de ferramentas: ilustração de três abas em ciclo.
{
  const W = 1280
  const H = 420
  const tabs = ['Prompts', 'Ações', 'Comandos', 'Ajustes', 'Tempo', 'Agenda']
  const pages = [
    {
      tab: 0,
      rows: ['resumir', 'explicar erro', 'rodar testes', 'próximo passo'],
      cap: ['Prompts', 'Atalhos que preenchem o prompt. Os seus ficam em shortcuts.json.'],
    },
    {
      tab: 2,
      rows: ['/help', '/compact', '/review  ★', '/init'],
      cap: ['Comandos', 'Todos os comandos / da sessão, com busca e favoritos.'],
    },
    {
      tab: 4,
      rows: ['pomodoro 25:00   ⏸  ↻  ✕', 'timer 5 min   04:12   ⏸  ↻  ✕'],
      cap: ['Tempo', 'Timers e pomodoro: pausar, reiniciar e cancelar.'],
    },
    {
      tab: 5,
      rows: ['05/11  entrega do projeto   em 14 dias', '22:30  todo dia  lembrete'],
      cap: ['Agenda', 'Prazos com contagem em dias e lembretes recorrentes.'],
    },
  ]
  const N = pages.length
  const dur = N * 4
  const bx = 64
  const by = 56
  const bw = 600
  const bh = 300
  let body = rect(bx, by, bw, bh, PANEL, `stroke="${LINE}" stroke-width="3"`)
  body += text(bx + 20, by + 34, 'caixa de ferramentas', 16, DIM)
  body += rect(bx, by + 48, bw, 2, LINE)
  pages.forEach((pg, i) => {
    const s = (i / N).toFixed(4)
    const e = ((i + 1) / N).toFixed(4)
    const anim = `<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;${s};${e}" dur="${dur}s" repeatCount="indefinite"/>`
    let g = ''
    tabs.forEach((t, k) => {
      const tx = bx + 16 + k * 94
      const on = k === pg.tab
      g += rect(tx, by + 62, 88, 30, on ? CORAL : '#2a2a2a')
      g += text(tx + 44, by + 83, t, 15, on ? INK : SOFT, 'text-anchor="middle"')
    })
    pg.rows.forEach((r, k) => {
      g += rect(bx + 16, by + 108 + k * 42, bw - 32, 34, '#262626')
      g += text(bx + 30, by + 131 + k * 42, r, 18, PAPER)
    })
    g += text(720, 170, pg.cap[0], 34, PAPER)
    g += text(720, 210, pg.cap[1], 18, SOFT)
    body += `<g opacity="0">${anim}${g}</g>`
  })
  body += text(bx, H - 28, 'Ilustração redesenhada a partir do mod; o menu real é paginado e tem a altura fixa.', 14, DIM)
  writeFileSync(out('caixa.svg'), frame(W, H, body, 'A caixa de ferramentas do Claudin', 'Quatro abas em ciclo: prompts, comandos, tempo e agenda.'))
}

// 5. A muda: o caranguejo cresce largando o casco; cada fase do projeto é um casco deixado para trás.
{
  const W = 1280
  const H = 360
  const stages = [
    ['faixa e balões', 6],
    ['modos e alertas', 7],
    ['caixa de ferramentas', 8],
    ['tempo e agenda', 9],
    ['/claudin e GitHub', 11],
  ]
  const cell = 232
  const x0 = (W - cell * stages.length) / 2
  const dur = 12
  let body = text(64, 64, 'Todo caranguejo cresce largando o casco', 26, PAPER)
  stages.forEach(([label, s], i) => {
    const cx = x0 + i * cell + cell / 2
    const w = 16 * s
    const h = 12 * s
    const last = i === stages.length - 1
    const op = last ? 1 : 0.22 + i * 0.16
    const tIn = ((i + 1) / (stages.length + 1)).toFixed(3)
    const fade = `<animate attributeName="opacity" values="0;0;${op};${op};0" keyTimes="0;${(Number(tIn) - 0.06).toFixed(3)};${tIn};0.92;1" dur="${dur}s" repeatCount="indefinite"/>`
    const sx = cx - w / 2
    const sy = 258 - h
    body += `<g opacity="0">${fade}<g transform="translate(${sx} ${sy}) scale(${s})" shape-rendering="crispEdges">${sprite(last ? 'ok' : 'idle', 'normal', 'center')}</g>`
    if (!last) body += `<g transform="translate(${sx} ${sy}) scale(${s})" fill="none" stroke="${DIM}" stroke-width="${1.2 / s}" shape-rendering="crispEdges"><rect x="3.5" y="3.5" width="9" height="4"/><rect x="2.5" y="4.5" width="11" height="2"/></g>`
    body += `${text(cx, 292, label, 16, last ? PAPER : SOFT, 'text-anchor="middle"')}</g>`
  })
  body += rect(64, 266, W - 128, 3, LINE)
  writeFileSync(out('muda.svg'), frame(W, H, body, 'A muda do Claudin', 'Cinco fases do projeto como cascos deixados para trás, do mais antigo e apagado ao Claudin atual.'))
}

console.log('ok')

export { sprite, mascot, frame, text, rect, px, CORAL, INK, PAPER, DIM, SOFT, LINE, PANEL, MONO }
