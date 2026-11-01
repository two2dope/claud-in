# Ideação — Pet-a-Pixel

## Pergunta HMW Alvo
"Como nós poderíamos transformar fotos e comportamentos autênticos de qualquer pet em animações fluidas, folhas de sprites padronizadas e cards colecionáveis diretamente dentro do Google Flow, sem necessidade de softwares ou scripts externos de edição?"

## Técnica(s) Usada(s) e Por Quê
- **SCAMPER + Analogias Estruturais:** Aplicado para decompor os recursos nativos do Google Flow (inputs de ferramentas, nós de mídia, nós de vídeo Veo e saídas visuais), combinando-os com princípios de design de jogos e etologia comportamental.

---

## Ideias Brutas (Sem Filtro)

### Cluster A: Arquitetura e Engenharia da Custom Tool 1 (Sprites & Cenas)
1. **Geração Dupla Simultânea:** A Tool 1 emite em um único canvas a folha 4×6 no centro e 4 quadros laterais destacados (keyframes com margem de segurança) para servir de input direto aos nós de vídeo.
2. **Âncora de Contraste Automático:** Injeção mandatória de borda sólida `#26303D` com tolerância zero de sombras no chão para manter o isolamento de célula limpo.
3. **Seletor de Família Taxonômica:** Variável Dropdown `{species_group}` que altera dinamicamente as diretrizes de pose no prompt mestre (Cão, Gato, Ave, Réptil).
4. **Campo de Traços Físicos Críticos:** Entrada de texto `{distinctive_marks}` para o tutor ditar manchas, cicatrizes, cor dos olhos ou cauda cortada.
5. **Modo Humor / Temperamento:** Variável Dropdown `{temperament}` (Dorminhoco, Hiperativo/Zoomies, Rabugento, Afetuoso) que calibra a intensidade das expressões da Linha 2 e 3.
6. **Enquadramento Isométrico Opcional:** Parâmetro para gerar o sprite em vista lateral 2D clássica ou vista 3/4 isométrica para RPGs.
7. **Normalização de Escala:** Prompt mestre com regra de manter o animal centralizado preenchendo 80% da altura da célula para evitar encolhimento entre quadros.

### Cluster B: Encadeamento Nativo de Vídeo no Google Flow (Veo / VideoFX)
8. **Nó de Imagem para Vídeo com Prompt de Motion Restritivo:** Conectar a saída de cada cena-chave ao nó nativo de vídeo do Flow com o prompt: *"Pixel art animation loop, strictly static camera, subtle continuous motion, sharp 16-bit contours, zero motion blur"*.
9. **Looping Ping-Pong para Respiração:** Configuração de movimento pendular para o estado de Repouso (Linha 0), garantindo um ciclo de respiração contínuo sem corte brusco.
10. **Efeito de Aceleração em Ação:** Instrução de vídeo para a Linha 1 gerar um ciclo de corrida com sensação de deslocamento sem mover a posição do personagem na tela.
11. **Geração Direta em WebM com Fundo Transparente [Não verificado]:** Testar se os modelos de vídeo atuais do Flow suportam canal alpha direto, ou se mantêm o fundo `#26303D` para recorte posterior.
12. **Vídeo de Apresentação Heroica:** Um nó de vídeo extra que anima o Card Colecionável com brilho holográfico e partículas cintilantes.

### Cluster C: Arquitetura e Engenharia da Custom Tool 2 (Card TCG / Super Trunfo)
13. **Grid de Atributos com Valores Balanceados:** Prompt mestre da Tool 2 que distribui automaticamente 350 pontos entre 5 atributos: Agilidade, Força, Charme, Astúcia e Lealdade.
14. **Geração de Caixa de Habilidade Especial com Nome Temático:** Gerar habilidades inspiradas em comportamentos reais de pets (ex: *"Zoomies da Madrugada"*, *"Ronrom Terapêutico"*, *"Olhar Carente"*).
15. **Moldura Temática por Elemento:** Variável `{element_affinity}` que muda a borda do card para Fogo (vermelho escarlate), Natureza (verde musgo), Vento (ciano), Sombra (roxo) ou Divino (dourado).
16. **Nível de Raridade Visual:** Parâmetro `{card_rarity}` (Comum, Raro, Épico, Lendário Holográfico) que dita os adornos visuais e reflexos de luz na moldura.
17. **Retrato Heroico com Efeito de "Quebra de Moldura":** O pet ultrapassa ligeiramente a borda superior da janela de ilustração para dar dinamismo tridimensional à carta.
18. **Flavor Text Gerado por Comportamento:** Inclusão de citação divertida no rodapé baseada no temperamento inserido pelo tutor.

### Cluster D: Ticket de Metadados e Rastreabilidade
19. **Faixa Técnica Lateral (Receipt Layout):** Inclusão de uma coluna vertical à esquerda da folha 4×6 imitando um ticket de arcade com nome da ferramenta, versão, data e espécie.
20. **Mini-QR Code Decorativo ou Seed Code:** Carimbo visual de hash que simula o código de autenticidade do mascote.
21. **Tabela de Dados dos Nós:** Exibição resumida dos parâmetros utilizados na geração para permitir reprodução idêntica pelo usuário.

### Cluster E: Dicionário Etológico RSPCA / Dogster
22. **Vocabulário de Alívio Canino:** Inclusão do "Curved Body Shake" como frame 6 da linha de Celebração ou Repouso.
23. **Vocabulário de Alerta Ofídico / Répteis:** Substituição de expressões faciais por expansão de papo, postura em S e elevação do terço anterior.
24. **Vocabulário de Conforto Aviário:** Uso explícito de *fluffing* (penas infladas) e cabeça apoiada na escápula para aves em repouso.
25. **Vocabulário de Foco Felino:** Corpo abaixado rente ao solo com patas traseiras prontas para propulsão na Linha 1 (Ação).

---

## Clusters Temáticos
- **Cluster 1: Núcleo Gerativo da Tool 1 (Ideias 1 a 7)** — Garante a geometria e os inputs essenciais para sprites e cenas.
- **Cluster 2: Pipeline de Vídeo Veo no Flow (Ideias 8 a 12)** — Viabiliza as animações sem softwares externos.
- **Cluster 3: Identidade do Card TCG / Super Trunfo (Ideias 13 a 18)** — Entrega a experiência colecionável e gamificada.
- **Cluster 4: Governança, Metadados e Fidelidade Etológica (Ideias 19 a 25)** — Assegura rastreabilidade e precisão comportamental.

