# Intake — Pet-a-Pixel

## A ideia, nas palavras do usuário
"O app vai se chamar 'Pet-a-Pixel', o input - uma foto ou mais (máximo 3) de um pet (qualquer tipo: gato, cachorro, passarinho, lagarto, cobra, etc...). insere informações e caracteristimas, configura o processo. o ajuste: https://www.dogster.com/lifestyle/dog-facial-expressions/ e https://www.rspca.org.uk/adviceandwelfare/pets/dogs/behaviour/understanding como referências de posturas e comportamentos. O usuário seleciona ou personaliza cada cena de sprite (de acordo com o padrão de ficha que escolher). a revisão, o usuario revisa, refina, refaz ou apaga. a saída: um pack de animações (gif ou video), imagens ilustrativas de cada cena, a folha de sprite padronizada e personalizada com o nome da ferramenta e configurações e ajustes usados (ticket da sessão). um card/figurinha personalizado (tipo carta de Pokemon ou Supertrunfo) com uma imagem aprimorada e o atributos e caracteristicas do pet."

## Frases e ideias promissoras
- "Pet-a-Pixel": conversão afetiva e técnica de fotos reais de animais em assets jogáveis de pixel art e cards colecionáveis.
- Referências etológicas formais (Dogster e RSPCA): fundamentação científica para expressões e linguagem corporal, evitando poses genéricas ou antropomórficas inadequadas.
- Ticket de sessão integrado na folha de sprites: rastreabilidade e estética de comprovante/ficha técnica.
- Card colecionável Super Trunfo / Pokémon: camada gamificada com atributos e ilustração heroica de destaque.

## Settled
- Nome oficial: Pet-a-Pixel.
- Suporte a múltiplas espécies animais (cães, gatos, aves, répteis).
- Entrada: 1 a 3 fotografias de referência + atributos textuais de personalidade e traços físicos.
- Ciclo operacional: Ingestão de fotos/dados ➔ Parametrização/Seleção de cenas ➔ Geração ➔ Curadoria (aprovação, refinamento, deleção) ➔ Empacotamento de entregáveis.
- Entregáveis finais:
  1. Pack de animações (GIF / WebM / MP4).
  2. Imagens isoladas de cada cena de animação.
  3. Spritesheet padronizada e personalizada com ticket de metadados da sessão.
  4. Card colecionável estilizado (estilo Pokémon / Super Trunfo) com status do pet e arte destacada.

## Unsettled
- Arquitetura de execução: divisão de responsabilidades entre a Custom Tool interna do Google Flow (geração de imagem/estilo) e a interface do usuário (Web App/Studio).
- Mecanismo de injeção multimodal de imagens: como as 1-3 fotos entram no fluxo do Google Flow (nó de imagem no workspace do Flow vs. chamada direta via API multimodal).
- Motor de renderização do Card colecionável e compilação de GIFs (se no navegador via HTML5 Canvas/Modern Web ou via script externo).

## KWHL
| K (O que sei) | W (O que quero descobrir) | H (Como descubro) | L (O que aprendi) |
|---|---|---|---|
| Flow suporta Custom Tools parametrizadas por variáveis. | Como o Flow recebe 1-3 imagens em uma Custom Tool sem nó manual. | Inspecionar documentação de inputs do Google Flow e testar nós multimodais. | A ser preenchido na Etapa 2. |
| Referências etológicas caninas da Dogster e RSPCA cobrem posturas e sinais corporais. | Como estender as posturas etológicas para aves e répteis sem distorção. | Mapear categorias canônicas de comportamento por taxonomia animal. | A ser preenchido na Etapa 2. |
| Spritesheets exigem grade uniforme e fundo com alto contraste (#26303D). | Qual motor montará os GIFs e o card colecionável. | Perguntar na rodada de Grill-me e avaliar Modern Web standards. | A ser preenchido na Etapa 2. |

