# Full Spectrum Audit: Suíte Pet-a-Pixel (Google Flow)

**Data:** 2026-10-31  
**Modo:** Plan & Technical Architecture Audit  
**Origem:** Pasta `projetos/pet-a-pixel/` e especificações técnicas de `entregaveis/`  
**Lentes Executadas:** 8/10 (Design, UX, Backend/Systems, Estrutural, Repo Maintainer, Production Readiness, DX, Performance)  
**Lentes Ignoradas:** 2/10 (Frontend Engineer e Accessibility Engineer — sem código web client-side interativo no escopo ativo)  

---

## Veredito Geral: APPROVE WITH CHANGES

A suíte técnica Pet-a-Pixel apresenta arquitetura sólida, alto rigor etológico e separação funcional coerente entre geração de grade técnica, cenas cinematográficas e cards colecionáveis. No entanto, foram identificados 3 gargalos críticos de difusão de imagem que exigem correção imediata para viabilizar a execução prática no Google Flow:
1. **Sobrecarga de Densidade Espacial na Tool 1:** Tentar comprimir uma grade 4×6 (24 células), 4 keyframes verticais ampliados e um ticket de metadados em uma única imagem 16:9 reduz a resolução útil de cada sprite a menos de 70×70 px, degradando a nitidez do pixel art.
2. **Dependência de Recorte Manual no Canvas:** O guia do Flow assume que o operador recorta os keyframes da margem direita antes de enviá-los ao Veo, sem explicitar o uso do nó de crop do Flow.
3. **Risco Residual de Alucinação Tipográfica na Tool 2:** O prompt mestre do Card exige que o modelo de imagem renderize simultaneamente 5 números de atributos, nome, habilidade e flavor text, o que historicamente gera caracteres ilegíveis em modelos de difusão.

---

## Veredito por Lente

| # | Lente Especializada | Veredito | Falhas Críticas | Recomendações |
|---|---|---|---|---|
| 1 | Design Engineer | APPROVE WITH CHANGES | 1 | 2 |
| 2 | UX Engineer | APPROVE WITH CHANGES | 1 | 2 |
| 3 | Backend / Systems Engineer | APPROVE WITH CHANGES | 1 | 2 |
| 4 | Structural Architect | APPROVE | 0 | 2 |
| 5 | Repo Maintainer | APPROVE | 0 | 1 |
| 6 | Production Readiness | APPROVE WITH CHANGES | 2 | 2 |
| 7 | DX Engineer | APPROVE | 0 | 2 |
| 8 | Performance Engineer | APPROVE WITH CHANGES | 1 | 1 |

---

## Problemas Críticos Consolidados (Must Fix)

| # | Problema Identificado | Lente(s) | Arquivo(s) Afetado(s) | Impacto Técnico | Correção Mandatória |
|---|---|---|---|---|---|
| **C1** | Superlotação do canvas 16:9 (Grade 4×6 + 4 Keyframes + Ticket) | Design, Performance, Prod Readiness | `01_custom-tool-spritesheet.md` | Perda drástica de resolução e quebra de contornos de pixel art | Separar a Tool 1 em dois modos de saída ou instruir resolução nativa mínima 4K (3840×2160) com proporção equilibrada. |
| **C2** | Omissão da etapa de corte na injeção para o nó Veo | UX, Systems, Prod Readiness | `04_guia-pipeline-flow.md` | Operador não consegue injetar os keyframes diretamente no Veo sem nó intermediário de Crop | Inserir formalmente o nó nativo `Crop / Region Select` entre a saída da Tool 1 e a entrada dos nós de vídeo Veo. |
| **C3** | Alucinação de texto em blocos de atributos numéricos | Design, Prod Readiness | `02_custom-tool-card-tcg.md` | Números do Super Trunfo e textos longos saem distorcidos ou ilegíveis | Forçar prompt mestre a usar tipografia geométrica em blocos de alto contraste e disponibilizar template vetorial/SVG como fallback. |

---

## Problemas Transversais (Cross-Cutting Concerns)

| Preocupação Transversal | Lentes Envolvidas | Causa Raiz | Correção Unificada |
|---|---|---|---|
| **Densidade de Renderização vs. Limites de Difusão** | Design, Performance, Prod Readiness | Exigir muitos elementos heterogêneos (sprites pequenos + texto legível + keyframes grandes) em um único passo de geração. | Desacoplar a folha técnica de arquivo (grade 4×6 com ticket) dos quadros heroicos de cena. |
| **Ergonomia Operacional no Canvas do Flow** | UX, Systems, DX | O encadeamento no canvas pressupõe operações que o usuário precisa adivinhar (extração de quadro). | Documentar o fluxo com nós de utilitário (Crop) explícitos na topologia Mermaid. |

---

## Todas as Recomendações de Melhoria

| # | Recomendação Técnica | Lente | Arquivo(s) | Solução Proposta |
|---|---|---|---|---|
| R1 | Adicionar pequenos mamíferos (roedores/coelhos) à taxonomia | Estrutural | `03_matriz-etologica.md` | Criar a Família 5: Pequenos Mamíferos (Hamsters, Coelhos, Porquinhos-da-índia). |
| R2 | Diferenciar locomoção de lagartos vs serpentes | Estrutural | `03_matriz-etologica.md` | Dividir a família Réptil em subgrupos com membros e sem membros (ofídios). |
| R3 | Padronizar nomenclatura Diátaxis nas pastas | Repo Maintainer | `entregaveis/` | Organizar em `reference/` (matriz e tools) e `how-to/` (guia do pipeline). |
| R4 | Incluir valores de fallback nos campos de texto | DX | `01_custom-tool-spritesheet.md`, `02_custom-tool-card-tcg.md` | Inserir sugestões padrão nas descrições das variáveis para agilizar testes. |
| R5 | Otimizar prompts de motion para economia de créditos no Veo | Performance | `04_guia-pipeline-flow.md` | Especificar duração curta de 2 a 3 segundos por loop de vídeo para reduzir custo de render. |

---

# Relatórios Detalhados por Lente

---

## 1. Design Engineer

**Veredito:** APPROVE WITH CHANGES

### Análise Crítica de Design e Craft Visual
- **Fidelidade Cromática:** O uso estrito do fundo `#26303D` é impecável para o contraste de spritesheets, prevenindo contaminação de tons claros e simplificando o isolamento de células.
- **Geometria de Grade:** A proporção 16:9 contendo 4 linhas por 6 colunas atende às diretrizes de motores 2D, mas sofre quando compartilhada com os keyframes no mesmo arquivo.
- **Arquitetura do Card:** A proporção 2.5:3.5 e a hierarquia visual (Placa de topo ➔ Retrato ➔ Atributos ➔ Habilidade ➔ Rodapé) respeitam com precisão as convenções consagradas de Trading Card Games (Pokémon TCG e Magic: The Gathering).

### Matriz de Cobertura de Estados Visuais
| Estado de Animação | Enquadramento | Contraste de Fundo | Risco de Sobreposição |
|---|---|---|---|
| Linha 0 (Repouso) | 80% altura da célula | `#26303D` sólido | Baixo |
| Linha 1 (Ação) | 80% altura da célula | `#26303D` sólido | Médio (alongamento de patas) |
| Linha 2 (Celebração) | 80% altura da célula | `#26303D` sólido | Médio (saltos verticais) |
| Linha 3 (Alerta) | 80% altura da célula | `#26303D` sólido | Baixo (postura retraída) |

### Correção Mandatória de Design
```diff
--- a/entregaveis/01_custom-tool-spritesheet.md
+++ b/entregaveis/01_custom-tool-spritesheet.md
@@ -28,3 +28,4 @@
-Sua tarefa é analisar rigorosamente as imagens de referência (...) e gerar uma composição gráfica dupla em formato 16:9 contendo:
-1. Uma grade técnica uniforme de Spritesheet em 4 linhas por 6 colunas (24 células de animação).
-2. Quatro quadros de cena-chave (Keyframes) isolados e ampliados na margem direita (...)
+Sua tarefa é analisar rigorosamente as imagens de referência (...) e gerar a Spritesheet em resolução ultra-alta (3840x2160 px, 16:9) dividida em:
+1. Margem Esquerda: Faixa técnica de Ticket (15% da largura).
+2. Área Central: Grade canônica 4x6 com espaçadores de 16px (60% da largura).
+3. Margem Direita: 4 Keyframes empilhados verticalmente com margem de segurança (25% da largura).
```

---

## 2. UX Engineer

**Veredito:** APPROVE WITH CHANGES

### Análise da Experiência do Operador no Flow
- **Carga Cognitiva:** Os campos de entrada do formulário são sucintos e fáceis de preencher. O uso de dropdowns para variáveis taxonômicas e de raridade acelera o ciclo de parametrização.
- **Fricção de Navegação no Canvas:** A transição da Tool 1 para os nós de vídeo Veo possui um ponto cego operacional: como o Google Flow não recorta automaticamente a área dos keyframes a partir de uma imagem composta, o operador é forçado a descobrir sozinho como isolar os 4 quadros da margem direita.

### Correção de Fluxo de Usuário
```diff
--- a/entregaveis/04_guia-pipeline-flow.md
+++ b/entregaveis/04_guia-pipeline-flow.md
@@ -40,2 +40,5 @@
-1. Para cada uma das 4 cenas-chave geradas na margem direita:
-   - Adicione um nó nativo de Video Generation (Veo / VideoFX) ao canvas.
-   - Conecte o recorte da cena-chave como First Frame / Image Prompt do nó de vídeo.
+1. No Canvas do Flow, adicione 4 nós do utilitário 'Crop / Image Region':
+   - Conecte a saída da Tool 1 a cada nó de Crop.
+   - Posicione as caixas de recorte sobre cada uma das 4 cenas-chave da margem direita.
+2. Conecte cada nó de Crop à entrada de 'Image Prompt' do respectivo nó Veo de Vídeo.
```

---

## 3. Backend / Systems Engineer

**Veredito:** APPROVE WITH CHANGES

### Análise de Fluxo e Contratos de Dados
- **Tipagem de Inputs:** Variáveis mapeadas com consistência no schema do Google Flow.
- **Contratos de Saída:** As regras de restrição de saída (`PROIBIDO texto livre conversacional ou explicações após a execução; retorne exclusivamente a imagem gerada`) garantem que o nó emita um artefato binário utilizável pelos nós downstream.
- **Gargalo Sistêmico:** A falta de tratamento para formatos de imagem de entrada não suportados (ex.: HEIC de iPhones ou fotos verticais de altíssima resolução que estouram o limite de contexto do nó).

### Correção de Contrato de Ingestão
Adicionar na Tool 1 e Tool 2 a normalização de ingestão:
```text
REQUISITO DE INGESTÃO MULTIMODAL:
- Converta ou redimensione imagens de entrada para formato RGB padrão (PNG/JPEG) com dimensão máxima de 2048px no eixo maior antes da inferência.
```

---

## 4. Structural Architect

**Veredito:** APPROVE

### Análise Arquitetural e Fronteiras
- **Acoplamento:** As duas Custom Tools são perfeitamente desacopladas. A Tool 1 não depende da Tool 2 e vice-versa; ambas consomem a mesma fonte primária (`Fotos_Referencia`).
- **Coesão:** A matriz etológica (`03_matriz-etologica.md`) atua como camada de domínio canônica compartilhada, ancorando as instruções de pose da Tool 1 sem espalhar regras ad-hoc.
- **Recomendação Estrutural:** Criar um sub-arquivo ou anexo para diferenciar claramente a etologia de répteis com patas (lagartos) de répteis ápodes (serpentes), pois o padrão de locomoção em 4 patas é mutuamente exclusivo com o rastejamento sinuoso.

---

## 5. Repo Maintainer

**Veredito:** APPROVE

### Higiene do Repositório e Conformidade Diátaxis
- **Nomenclatura:** Padrão kebab-case estrito, sem acentos, sem espaços em branco e prefixos ordinais claros (`01-intake.md` a `08-log.md`).
- **Rastreabilidade:** Dossiê vivo atualizado em `dossie.md` com gates e datas ISO 8601.
- **Recomendação de Organização:**
  Mover os entregáveis finais para pastas funcionais:
  - `docs/reference/tools/` ➔ Especificações de Tools.
  - `docs/how-to/` ➔ Guia do Pipeline no Flow.

---

## 6. Production Readiness

**Veredito:** APPROVE WITH CHANGES

### Modos de Falha em Ambiente Real
1. **Falha por Qualidade da Foto de Entrada:** Se o tutor fizer upload de uma foto com o pet cortado, no escuro ou com fundo poluído, o modelo de difusão tende a projetar os elementos do fundo na grade de sprites.
2. **Falha por Alucinação de Membros no Vídeo:** O nó de vídeo Veo pode gerar uma terceira pata ou deformar olhos durante o ciclo de animação se a transição entre frames exigir movimentos articulares complexos.

### Mitigações Mandatórias de Produção
- Inserir na Tool 1 a instrução: *"Se as fotos anexadas contiverem fundo complexo, ignore completamente o ambiente original e reconstrua a anatomia pura do animal em isolamento absoluto"*.
- No prompt de motion do Veo, adicionar: *"Strict anatomical consistency, maintain exact 4 limbs, zero shape-shifting, rigid limb geometry"*.

---

## 7. Developer Experience (DX) Engineer

**Veredito:** APPROVE

### Ergonomia para o Operador do Google Flow
- **Prontidão de Cópia e Cola:** Os blocos de prompt mestre e as tabelas de inputs estão no formato exato que a interface do Google Flow requer. O operador pode configurar uma ferramenta completa em menos de 3 minutos.
- **Auto-Contenção:** O guia operacional contém o checklist de validação que previne execuções incompletas.

---

## 8. Performance Engineer

**Veredito:** APPROVE WITH CHANGES

### Orçamento de Tokens e Latência de Pipeline
- **Tamanho dos Prompts:** O prompt mestre da Tool 1 possui ~650 tokens e a Tool 2 possui ~550 tokens. Ambos estão bem abaixo do limite de contexto de instrução do Flow (~4k tokens), garantindo atenção máxima do modelo para as restrições negativas.
- **Latência de Renderização no Veo:** Executar 4 nós de vídeo simultaneamente no Flow pode demorar entre 60 a 180 segundos.
- **Recomendação de Desempenho:** Orientar o operador a executar os 4 nós de vídeo em paralelo no canvas para que o processamento em lote ocorra no mesmo intervalo de tempo.

---

# Conclusão e Próximos Passos

A suíte **Pet-a-Pixel** está aprovada com mudanças menores focadas no refinamento dos prompts e inclusão formal do nó de crop no guia do canvas. O documento mestre de auditoria está consolidado em `reviews/audit-plan-full.md`.

