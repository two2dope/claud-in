// Barra de abas da caixa de ferramentas: só o ícone em cada aba; a aberta mostra ▸, o ícone e o nome.
// Uma aba fechada ocupa 3 colunas (espaço, ícone de 2 colunas), a aberta no máximo 12. Assim as oito abas
// (a Frota e o Cofre só aparecem quando existem) cabem sem quebrar linha, no terminal e no app desktop.
export const TAB_ICON: Record<string, string> = {
  prompts: '💬',
  acoes: '⚡',
  comandos: '⌘',
  ajustes: '⚙',
  tempo: '⏱',
  prazos: '📅',
  frota: '🦀',
  cofre: '🔐',
}

export const tabLabel = (cat: string, name: string, isOpen: boolean): string => {
  const icon = TAB_ICON[cat]
  if (isOpen) return icon ? `▸${icon} ${name}` : `▸${name}`
  return icon ? ` ${icon}` : ` ${name}`
}

// Colunas da barra com `open` aberta; o ícone conta 2 colunas, o pior caso entre terminal e desktop.
export const tabBarCols = (cats: readonly string[], open: string, names: Record<string, string>, iconCols = 2): number =>
  cats.reduce((sum, c) => sum + 1 + iconCols + (c === open ? 1 + (names[c] ?? c).length : 0), 0)
