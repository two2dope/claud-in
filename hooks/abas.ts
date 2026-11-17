// Largura da barra de abas da caixa de ferramentas. Cada rótulo é desenhado com um caractere de prefixo
// (espaço, ou ▸ na aba aberta) e as abas se separam por `gap` colunas.
export const tabBarWidth = (labels: readonly string[], gap: number): number =>
  labels.reduce((sum, l) => sum + l.length + 1, 0) + gap * Math.max(0, labels.length - 1)

// O espaço entre abas: 1 enquanto a barra cabe em `max` colunas; 0 quando só assim ela cabe (a aba Frota
// é a sétima), porque uma barra que quebra linha empurra o paginador para fora da caixa.
export const tabGap = (labels: readonly string[], max: number): 0 | 1 => (tabBarWidth(labels, 1) <= max ? 1 : 0)
