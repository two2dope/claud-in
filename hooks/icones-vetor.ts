// Ícones do Claudin em vetor, no traço do globo de plasma: contorno escuro fino, degradê, um brilho no alto à
// esquerda e, onde cabe, uma animação discreta (os pontinhos do balão, o ponteiro do cronômetro, o sinal da antena).
// Cada valor é o miolo de um SVG 16x16, sem a tag <svg>. A faixa do QG (hooks/cenario.ts) desenha os ícones dentro
// da própria imagem; a caixa de ferramentas embrulha cada um num <svg> para as fichas. Os ids de degradê têm prefixo
// próprio porque, na faixa, todos convivem no mesmo documento.

export const VECTOR_SIDE = 16

const INK = '#22140c' // contorno
const ol = (w = 0.6) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"`
const lin = (id: string, stops: string[]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient>`
const rad = (id: string, stops: string[]) =>
  `<radialGradient id="${id}" cx=".38" cy=".34" r=".75">${stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</radialGradient>`
const shine = (d: string, w = 0.5) => `<path d="${d}" stroke="#fff" stroke-opacity=".75" stroke-width="${w}" fill="none" stroke-linecap="round"/>`
const blink = (values: string, dur: string, begin = '0s') => `<animate attributeName="opacity" values="${values}" dur="${dur}" begin="${begin}" repeatCount="indefinite"/>`

// Engrenagem: dentes trapezoidais em volta de um furo (evenodd, o furo mostra o fundo).
function gearPath(teeth: number, ro: number, ri: number, hole: number, cx = 8, cy = 8): string {
  const p = (r: number, a: number) => `${(cx + r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)}`
  const step = (Math.PI * 2) / teeth
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    d += `${i === 0 ? 'M' : 'L'}${p(ri, a - step * 0.5)}L${p(ri, a - step * 0.3)}L${p(ro, a - step * 0.18)}L${p(ro, a + step * 0.18)}L${p(ri, a + step * 0.3)}`
  }
  return `${d}Z M${(cx + hole).toFixed(2)} ${cy}a${hole} ${hole} 0 1 0 ${(-2 * hole).toFixed(2)} 0a${hole} ${hole} 0 1 0 ${(2 * hole).toFixed(2)} 0z`
}

export const VECTOR_ICON: Record<string, string> = {
  // Balão de conversa com três pontinhos digitando.
  prompts:
    `<defs>${lin('vpr', ['#fff8e8', '#ecd3a6'])}</defs>` +
    `<path d="M4.2 2.6h7.6a2.8 2.8 0 0 1 2.8 2.8v3.6a2.8 2.8 0 0 1-2.8 2.8H7.4l-3.6 2.6.9-2.6h-.5a2.8 2.8 0 0 1-2.8-2.8V5.4a2.8 2.8 0 0 1 2.8-2.8z" fill="url(#vpr)" ${ol()}/>` +
    shine('M3.2 5.4a1.9 1.9 0 0 1 1.7-1.7') +
    [5.2, 8, 10.8].map((x, i) => `<circle cx="${x}" cy="7.2" r="1" fill="#e8704f">${blink('1;.3;1', '1.2s', `${(i * 0.2).toFixed(1)}s`)}</circle>`).join(''),
  // Raio.
  acoes:
    `<defs>${lin('vac', ['#fff27a', '#ffb02e', '#f0761a'])}</defs>` +
    `<path d="M9.8 1 3.2 9.2h4.3L6 15l6.8-8.6H8.5z" fill="url(#vac)" ${ol()}/>` +
    shine('M9 2.8 5 7.9'),
  // Livro aberto com fita: a Cola.
  cola:
    `<defs>${lin('vco', ['#fffaf0', '#e8d3ac'])}</defs>` +
    `<path d="M.9 4.8 8 6l7.1-1.2v8.4L8 14.4.9 13.2z" fill="#2f8f86" ${ol()}/>` +
    `<path d="M1.8 3.4Q5 2.8 8 4.4v8.8Q5 11.7 1.8 12.2z" fill="url(#vco)" ${ol(0.5)}/>` +
    `<path d="M14.2 3.4Q11 2.8 8 4.4v8.8q3-1.5 6.2-1z" fill="url(#vco)" ${ol(0.5)}/>` +
    `<path d="M3.2 5.7q1.8-.3 3.6.4M3.2 7.5q1.8-.3 3.6.4M3.2 9.3q1.8-.3 3.6.4M9.2 6.1q1.8-.7 3.6-.4M9.2 7.9q1.8-.7 3.6-.4M9.2 9.7q1.8-.7 3.6-.4" stroke="#8a5a3a" stroke-width=".45" stroke-linecap="round" fill="none"/>` +
    `<path d="M7.4 12.6h1.2v3l-.6-.6-.6.6z" fill="#e8704f" ${ol(0.35)}/>`,
  // Engrenagem de latão.
  ajustes:
    `<defs>${rad('vge', ['#ffe9a0', '#e0ac34', '#a8701a'])}</defs>` +
    `<path d="${gearPath(8, 7.4, 5.5, 2.1)}" fill="url(#vge)" fill-rule="evenodd" ${ol()}/>` +
    shine('M4.6 5.2a4.4 4.4 0 0 1 2.2-1.6'),
  // Cronômetro com o ponteiro andando.
  tempo:
    `<defs>${rad('vte', ['#fffdf4', '#f0dfbc'])}</defs>` +
    `<rect x="6.8" y=".5" width="2.4" height="1.6" rx=".4" fill="#e0ac34" ${ol(0.45)}/><rect x="7.4" y="2" width="1.2" height="1.3" fill="#8a5a3a"/>` +
    `<rect x="12" y="2.4" width="1.7" height="1.2" rx=".3" transform="rotate(40 12.8 3)" fill="#e0ac34" ${ol(0.4)}/>` +
    `<circle cx="8" cy="9.3" r="6.1" fill="#e8704f" ${ol()}/><circle cx="8" cy="9.3" r="4.6" fill="url(#vte)" ${ol(0.4)}/>` +
    `<path d="M8 5.3v.9M8 12.4v.9M4 9.3h.9M11.1 9.3h.9" stroke="#8a5a3a" stroke-width=".5" stroke-linecap="round"/>` +
    `<path d="M8 9.3 10.3 6.8" stroke="${INK}" stroke-width=".65" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 8 9.3" to="360 8 9.3" dur="10s" repeatCount="indefinite"/></path>` +
    `<circle cx="8" cy="9.3" r=".6" fill="#e8704f"/>` +
    shine('M3.4 7.4a4.8 4.8 0 0 1 2.4-2.6'),
  // Calendário de parede: cabeçalho coral, argolas e o dia marcado piscando.
  prazos:
    `<defs>${lin('vca', ['#fffaf0', '#ecdcbc'])}</defs>` +
    `<rect x="1.6" y="2.6" width="12.8" height="12" rx="1.6" fill="url(#vca)" ${ol()}/>` +
    `<path d="M3.2 2.6h9.6a1.6 1.6 0 0 1 1.6 1.6V6H1.6V4.2a1.6 1.6 0 0 1 1.6-1.6z" fill="#e8704f" ${ol()}/>` +
    `<rect x="4.4" y=".9" width="1.3" height="2.9" rx=".6" fill="#3a2a2a"/><rect x="10.3" y=".9" width="1.3" height="2.9" rx=".6" fill="#3a2a2a"/>` +
    [3.3, 6.9, 10.5].flatMap(x => [7.5, 10.9].map(y => [x, y] as const))
      .map(([x, y]) => (x === 10.5 && y === 7.5 ? `<rect x="${x}" y="${y}" width="2.2" height="2.2" rx=".4" fill="#2f8f86">${blink('1;.45;1', '2s')}</rect>` : `<rect x="${x}" y="${y}" width="2.2" height="2.2" rx=".4" fill="#dcc79e"/>`))
      .join('') +
    shine('M3 4.2h3.4'),
  // Caranguejinho de frente, balançando de lado.
  frota:
    `<defs>${rad('vfr', ['#ffab86', '#e8704f', '#b8482c'])}</defs><g>` +
    `<path d="M4.8 10.6 2 12.4M4.6 11.8 2.4 14M11.2 10.6 14 12.4M11.4 11.8 13.6 14" stroke="#b8482c" stroke-width=".75" stroke-linecap="round"/>` +
    `<path d="M4.8 8.6 3.2 6.4M11.2 8.6 12.8 6.4" stroke="#e8704f" stroke-width="1" stroke-linecap="round"/>` +
    `<path d="M1.2 4.8a1.9 1.9 0 1 1 3.6.6l-1.7-.3z" fill="#e8704f" ${ol(0.5)}/><path d="M14.8 4.8a1.9 1.9 0 1 0-3.6.6l1.7-.3z" fill="#e8704f" ${ol(0.5)}/>` +
    `<ellipse cx="8" cy="10.2" rx="4.7" ry="3.2" fill="url(#vfr)" ${ol()}/>` +
    `<path d="M6.6 7.4V5.6M9.4 7.4V5.6" stroke="#b8482c" stroke-width=".6"/>` +
    `<circle cx="6.6" cy="5.1" r="1" fill="#fff" ${ol(0.4)}/><circle cx="9.4" cy="5.1" r="1" fill="#fff" ${ol(0.4)}/>` +
    `<circle cx="6.8" cy="5.2" r=".45" fill="${INK}"/><circle cx="9.6" cy="5.2" r=".45" fill="${INK}"/>` +
    shine('M5.2 9a3.4 3.4 0 0 1 2.2-1.2') +
    `<animateTransform attributeName="transform" type="translate" values="0 0;.35 0;0 0;-.35 0;0 0" dur="2.4s" repeatCount="indefinite"/></g>`,
  // Cadeado: o Cofre.
  cofre:
    `<defs>${lin('vlo', ['#6fd0bf', '#2f8f86', '#1d625b'])}</defs>` +
    `<path d="M5 7.4V5.3a3 3 0 0 1 6 0v2.1" fill="none" stroke="${INK}" stroke-width="2.3"/><path d="M5 7.4V5.3a3 3 0 0 1 6 0v2.1" fill="none" stroke="#e0ac34" stroke-width="1.2"/>` +
    `<rect x="2.6" y="7" width="10.8" height="8" rx="1.6" fill="url(#vlo)" ${ol()}/>` +
    `<path d="M8 9.3a1.15 1.15 0 0 1 .65 2.1l.45 2.2H6.9l.45-2.2A1.15 1.15 0 0 1 8 9.3z" fill="#16201e"/>` +
    shine('M4 8.6v4.6', 0.6),
  // Placa redonda de madeira com o "i": Sobre.
  sobre:
    `<defs>${rad('vso', ['#d9995e', '#a8703f', '#7a4a26'])}</defs>` +
    `<circle cx="8" cy="8" r="7.1" fill="#2f8f86" ${ol()}/><circle cx="8" cy="8" r="5.6" fill="url(#vso)" ${ol(0.4)}/>` +
    `<path d="M3.6 6.2q4.4-.9 8.8 0M3.4 10q4.6.9 9.2 0" stroke="#6a3e1e" stroke-width=".35" fill="none" opacity=".6"/>` +
    `<circle cx="8" cy="4.8" r="1.05" fill="#fff4dc" ${ol(0.35)}/><rect x="7.1" y="6.6" width="1.8" height="5.2" rx=".5" fill="#fff4dc" ${ol(0.35)}/>` +
    shine('M2.6 6a5.8 5.8 0 0 1 2.6-3.4'),
  // Lua crescente com uma estrelinha piscando: o interruptor da luz.
  lua:
    `<defs>${lin('vlu', ['#fffbe8', '#ecd496'])}<mask id="vlm"><rect width="16" height="16" fill="#fff"/><circle cx="10.8" cy="5.8" r="5" fill="#000"/></mask><clipPath id="vlc"><circle cx="7.2" cy="8.7" r="6.2"/></clipPath></defs>` +
    `<g mask="url(#vlm)"><circle cx="7.2" cy="8.7" r="6.2" fill="url(#vlu)" ${ol()}/></g>` +
    `<circle cx="10.8" cy="5.8" r="5" fill="none" ${ol()} clip-path="url(#vlc)"/>` +
    `<circle cx="4.4" cy="10" r=".8" fill="#e0c37a"/><circle cx="6.6" cy="12.6" r=".55" fill="#e0c37a"/>` +
    `<path d="M13.6 11.4l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="#fff4c0">${blink('1;.25;1', '1.8s')}</path>`,
  // Antena parabólica de perfil, com o sinal saindo: liga o QG.
  antena:
    `<defs>${lin('van', ['#fffaf0', '#d9c8a6'])}</defs>` +
    `<path d="M3.8 15.3h6.4l-.9-1.9H4.7z" fill="#8a5a32" ${ol(0.5)}/><rect x="6.4" y="8.8" width="1.2" height="4.8" fill="#a8714a" ${ol(0.4)}/>` +
    `<path d="M2.4 4.4Q2.6 12 10.8 10.6z" fill="url(#van)" ${ol()}/>` +
    `<path d="M6.6 7.5 10.1 4" stroke="#5a4a3a" stroke-width=".5"/><circle cx="10.4" cy="3.7" r=".9" fill="#e8704f" ${ol(0.4)}/>` +
    `<g stroke="#2fd0c0" stroke-width=".65" fill="none" stroke-linecap="round"><path d="M12.1 2.5a2.2 2.2 0 0 1 1.3 2">${blink('0;1;0', '1.4s')}</path><path d="M12.7 .9a3.9 3.9 0 0 1 2.3 3.5">${blink('0;1;0', '1.4s', '.35s')}</path></g>` +
    shine('M3.4 6.2q.4 2.6 2.4 3.6'),
  // Caixa de ferramentas com a chave aparecendo.
  caixa:
    `<defs>${lin('vcx', ['#ff9572', '#e8704f', '#c2502f'])}</defs>` +
    `<path d="M3.4 5.6 5.2 2.4" stroke="#9aa3a8" stroke-width="1.1" stroke-linecap="round"/><circle cx="5.5" cy="1.9" r=".95" fill="none" stroke="#9aa3a8" stroke-width=".8"/>` +
    `<path d="M5.6 5.4V3.7a.8.8 0 0 1 .8-.8h3.2a.8.8 0 0 1 .8.8v1.7" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M5.6 5.4V3.7a.8.8 0 0 1 .8-.8h3.2a.8.8 0 0 1 .8.8v1.7" fill="none" stroke="#6a4a32" stroke-width=".7"/>` +
    `<rect x="1.2" y="5.2" width="13.6" height="9.3" rx="1.4" fill="url(#vcx)" ${ol()}/>` +
    `<path d="M1.2 8.5h13.6" stroke="#9e3f26" stroke-width=".6"/><rect x="6.8" y="7.4" width="2.4" height="2.1" rx=".4" fill="#ffd36a" ${ol(0.4)}/>` +
    shine('M2.6 6.5h5'),
  // Globo de plasma: o modo neon. Base escura, vidro com degradê roxo, núcleo claro e raios ciano piscando.
  neon:
    `<defs><radialGradient id="pg"><stop offset="0" stop-color="#f6b8ff"/><stop offset=".45" stop-color="#b14be0"/><stop offset="1" stop-color="#3d1466"/></radialGradient></defs>` +
    `<path d="M4.6 15.6h6.8l-1-2.6H5.6z" fill="#2a1f2e" stroke="#120a14" stroke-width=".5"/><rect x="6.4" y="12.2" width="3.2" height="1.2" fill="#4a3a52"/>` +
    `<circle cx="8" cy="6.9" r="5.6" fill="url(#pg)" stroke="#1a0f22" stroke-width=".6"/>` +
    `<g stroke="#8ff8ff" stroke-width=".45" fill="none" stroke-linecap="round">` +
    `<path d="M8 6.9l-2.2-1.6-1.3-2.3">${blink('1;.2;1', '.9s')}</path>` +
    `<path d="M8 6.9l2.4-1 1.8 1.7">${blink('.3;1;.3', '1.3s')}</path>` +
    `<path d="M8 6.9l-.6 2.6-2.4 1.4">${blink('1;.4;1', '1.1s')}</path>` +
    `<path d="M8 6.9l1.6 2.4 2.5.4">${blink('.5;1;.5', '.7s')}</path></g>` +
    `<circle cx="8" cy="6.9" r="1.2" fill="#fff4ff"/>` +
    shine('M5 4.2a4 4 0 0 1 2.4-1.6'),
}
