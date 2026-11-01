# Priorização — Pet-a-Pixel

## Matriz de Impacto e Esforço

| Ideia | Impacto | Esforço | Quadrante | Decisão |
|---|---|---|---|---|
| **01. Geração Dupla Simultânea (Folha 4×6 + 4 Cenas-Chave)** | Alto | Baixo | Quick Win | **Finalista** |
| **02. Âncora de Contraste Fundo #26303D sem sombras** | Alto | Baixo | Quick Win | **Finalista** |
| **03. Seletor de Família Taxonômica (Cão, Gato, Ave, Réptil)** | Alto | Baixo | Quick Win | **Finalista** |
| **04. Campo de Traços Físicos Críticos ({distinctive_marks})** | Alto | Baixo | Quick Win | **Finalista** |
| **08. Prompt de Motion Restritivo para Nós de Vídeo do Flow** | Alto | Médio | Major Project | **Finalista** |
| **13. Grid de Atributos Super Trunfo Balanceado (350 pts)** | Alto | Médio | Major Project | **Finalista** |
| **14. Habilidades Especiais Humorísticas por Comportamento** | Alto | Baixo | Quick Win | **Finalista** |
| **15. Moldura Temática por Elemento/Afinidade** | Médio | Baixo | Fill-in | **Finalista** |
| **16. Nível de Raridade com Acabamento Holográfico** | Médio | Médio | Major Project | **Finalista** |
| **19. Faixa de Ticket Lateral com Metadados da Sessão** | Alto | Médio | Major Project | **Finalista** |
| **22 a 25. Dicionário Etológico RSPCA/Dogster por Família** | Alto | Baixo | Quick Win | **Finalista** |
| 06. Enquadramento Isométrico Opcional | Baixo | Alto | Time Waster | Descartada (complexidade desnecessária) |
| 11. Geração Direta em WebM com Fundo Transparente [Não verificado] | Médio | Alto | Time Waster | Descartada (Flow não suporta nativamente alpha em vídeo) |
| 12. Vídeo Animado do Card Colecionável com Brilho | Baixo | Alto | Time Waster | Descartada (fora do escopo essencial da entrega) |
| 20. Mini-QR Code no Sprite | Baixo | Médio | Time Waster | Descartada (ruído visual sem função de jogo) |

---

## Escolhidas (com Análise PPCo)

### Pacote Core Selecionado (Backlog de Implementação)
1. **Tool 1: `Pet-a-Pixel: Spritesheet & Keyframes Generator`** (Ideias 01, 02, 03, 04, 19, 22-25)
2. **Pipeline de Vídeo: `Nós Image-to-Video com Motion Restritivo`** (Ideia 08)
3. **Tool 2: `Pet-a-Pixel: Collectible TCG Card Generator`** (Ideias 13, 14, 15, 16)

### PPCo — Tool 1 (Spritesheet & Cenas-Chave)
- **Pluses (Pontos Fortes):** Garante a folha clássica para desenvolvedores e entrega 4 frames-chave perfeitos para animação direta no Flow sem precisar fatiar manualmente.
- **Potentials (Resultados Futuros):** Torna-se o padrão para criação de mascotes virtuais em comunidades de Pixel Art e ecossistema Codex Pet.
- **Concerns (Preocupações):** Como garantir que o modelo não misture as características físicas entre as 4 cenas?
- **Overcome (Superação):** Ancorar a descrição física no cabeçalho do prompt mestre e injetar as fotos de referência em nó compartilhado no canvas do Flow.

### PPCo — Pipeline de Vídeo Image-to-Video no Flow
- **Pluses (Pontos Fortes):** Utiliza o motor Veo nativo do Flow, eliminando compilação local de GIFs e entregando animações em MP4/WebM prontas para consumo.
- **Potentials (Resultados Futuros):** Produzir clipes animados cinematográficos em loop direto no canvas.
- **Concerns (Preocupações):** Como impedir que a IA interpole os pixels criando borrões de movimento (*motion blur*)?
- **Overcome (Superação):** Forçar parâmetros rígidos de motion: `"pixel-perfect animation, stepped frame rate, zero motion blur, crisp edges"`.

### PPCo — Tool 2 (Card TCG / Super Trunfo)
- **Pluses (Pontos Fortes):** Gera um entregável de alto valor afetivo para tutores, com estética colecionável profissional e atributos lúdicos.
- **Potentials (Resultados Futuros):** Criação de decks inteiros de cartas de animais para jogos de tabuleiro ou cartas impressas.
- **Concerns (Preocupações):** Como assegurar que os números dos atributos não fiquem ilegíveis na imagem gerada?
- **Overcome (Superação):** O prompt mestre define caixas com alto contraste, fontes grandes estilizadas em blocos e números fixados na instrução de geração.

---

## Descartadas e Motivo
- **Enquadramento Isométrico (Ideia 06):** Descartado porque a grade 4×6 foi concebida para visão lateral 2D. Isometria exigiria ângulos de 3/4 que conflitam com as regras canônicas de animação em ciclo.
- **WebM com Canal Alpha no Flow (Ideia 11):** Descartado porque os modelos de vídeo atuais no Flow emitem vídeo RGB convencional; buscar transparência nativa geraria falhas de execução.
- **Animação em Vídeo do Card (Ideia 12):** Descartada por inflação de escopo. O card foi concebido como peça gráfica estática colecionável.

---

## Crítica Black Hat
1. **Ponto Crítico 1 (Variabilidade de Espécies):** Modelos de difusão treinados em cães e gatos possuem repertório vasto, mas aves e répteis podem apresentar alucinações de membros (ex: asas saindo do lugar errado ou escamas com texturas de pelo). Mitigação mandatória: a Custom Tool 1 terá blocos de prompt específicos condicionados à variável `{species_group}`.
2. **Ponto Crítico 2 (Estabilidade do Loop de Vídeo):** Nós de Image-to-Video às vezes deslocam o ponto de ancoragem do personagem no espaço durante o movimento. Mitigação mandatória: exigir no prompt de motion `"character strictly locked in central screen coordinates, zero camera pan, stationary ground anchor"`.

