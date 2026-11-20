# Prompts do Google Flow: ícones do QG do Claudin

Projeto: `claudin-qg-icones` · Data: 2026-11-19 · Total: 13 assets, todos `1:1`

## Por que esta rodada

Os ícones do QG hoje são emojis em botões do app, e o app posiciona botões por células de texto: eles cortam e escorregam quando a janela muda de largura. Com ícones próprios, cada ícone passa a ser desenhado **dentro da própria imagem da faixa** (posição exata, igual em qualquer largura). O clique fica com um botão invisível por cima, como o do relógio na 0.7.8.

Risco a conferir antes de converter tudo: se o botão invisível do relógio (0.7.8) abre o Tempo no desktop, o caminho está provado. Se não abrir, os ícones novos servem do mesmo jeito como arte, mas o clique continua num botão-emoji.

## Âncora de estilo

- **Âncora:** a própria arte do QG (`assets/qg/Crab_technology_headquarters_pix…_3a2e210d.jpg`, a faixa escolhida). Suba como imagem de referência em **todos** os ícones, para herdar a paleta, o contorno escuro e a luz quente.
- **Isolamento:** nenhum ícone tem rosto. O 🦀 da frota é a única criatura, e deve ser o caranguejinho do cenário, sem olhos humanos.

## Comando mestre (cole antes de cada sub-diretriz)

```
Single 16-bit pixel art game icon, 1:1 square, centered, filling about 70% of the frame.
Match the palette and lighting of the reference image: warm mangrove wood browns, teal and
moss greens, cream highlights, deep brown-black 1px outline, soft warm top-left light.
Chunky readable silhouette that still reads at 16x16 pixels. Hard pixel edges, no
anti-aliasing blur, no gradients, no dithering noise, at most 8 colors.
Flat solid pure magenta background (#FF00FF) filling the whole frame, no shadow on the
background, no frame, no border, no text, no letters, no numbers, no watermark.
```

## Sub-diretriz da categoria

| Categoria | Ícone | Ratio | Âncora? | Sub-diretriz |
| :--- | :---: | :---: | :---: | :--- |
| Ícones do QG | 🦀 | `1:1` | SIM (arte do QG) | `Object icon for a cozy pixel-art crab tech headquarters in a mangrove stilt house. One object only, front three-quarter view, slight top-left rim light, readable at 16x16.` |

## Assets

| # | ID | Nome | Abre | Ratio | Prompt (depois do comando mestre e da sub-diretriz) | Status |
| :-: | :--- | :--- | :--- | :-: | :--- | :-: |
| 1 | `icone-sobre` | Plaquinha de informação | Sobre | 1:1 | `A small round wooden plaque nailed to a plank, carved with a simple lowercase "i" shape made of two pale cream blocks (dot and bar), teal paint rim.` | ⏳ |
| 2 | `icone-cola` | Pilha de livros com marcador | Cola | 1:1 | `A short stack of three chunky hardcover books in coral, teal and moss green, a cream bookmark ribbon hanging out, tilted slightly.` | ⏳ |
| 3 | `icone-ajustes` | Engrenagem | Ajustes | 1:1 | `A single chunky brass gear cog with six teeth and a dark round hole in the center, warm metallic highlights.` | ⏳ |
| 4 | `icone-prompts` | Balão de conversa | Prompts | 1:1 | `A rounded cream speech bubble with a small tail at the bottom left, three small coral dots inside it in a row.` | ⏳ |
| 5 | `icone-luz-acesa` | Lâmpada acesa | Luz (ligada) | 1:1 | `A glowing incandescent light bulb with a warm yellow-orange filament glow and a small brass screw base, four tiny pixel light rays around it.` | ⏳ |
| 6 | `icone-luz-apagada` | Lua crescente | Luz (desligada) | 1:1 | `A pale cream crescent moon with two tiny pixel stars beside it, cool soft night tone.` | ⏳ |
| 7 | `icone-neon` | Globo místico | Modo neon | 1:1 | `A small crystal ball on a dark wooden base, swirling neon magenta and cyan light inside the glass, faint glow pixels around it.` | ⏳ |
| 8 | `icone-frota` | Caranguejinho da frota | Frota | 1:1 | `A tiny cute coral-orange crab seen from the front, two raised claws, two dot eyes on short stalks, no mouth, no human features.` | ⏳ |
| 9 | `icone-cofre` | Cadeado | Cofre | 1:1 | `A chunky brass padlock with a teal-green body, rounded shackle on top and a dark keyhole, small highlight on the shackle.` | ⏳ |
| 10 | `icone-agenda` | Calendário de mesa | Agenda | 1:1 | `A small wall calendar page with a coral header strip and two binder rings on top, a cream grid body with one square marked in teal.` | ⏳ |
| 11 | `icone-acoes` | Raio | Ações | 1:1 | `A bold zig-zag lightning bolt in warm yellow with an orange lower half and a dark outline, slight electric sparkle pixels.` | ⏳ |
| 12 | `icone-tempo` | Aro do relógio | Tempo (hover) | 1:1 | `A thin round glowing ring the shape of a wall clock rim, warm cream-gold glow, empty transparent-looking center filled with the magenta background, small tick marks at 12, 3, 6 and 9 o'clock. No hands, no numbers.` | ⏳ |
| 13 | `icone-brilho` | Brilho de hover | Destaque comum | 1:1 | `A soft round pixel halo of warm cream-gold light, brightest near the edge and fading toward the center, the center is the magenta background. No object inside.` | ⏳ |

Observações por ícone:
- **12, aro do relógio:** substitui o ⏱ fantasma. Aparece sobre o próprio mostrador da parede ao passar o ponteiro, no formato do relógio.
- **13, brilho:** o halo comum que acende atrás de qualquer ícone no hover, para destacar a área sem texto nem dica.
- **5 e 6:** são o mesmo botão em dois estados (luz acesa e apagada).

## Como gerar no Flow

1. Gere 2 a 4 variações por ícone, com a arte do QG como referência ligada.
2. Escolha uma por ícone e baixe em PNG, se o Flow oferecer, ou em JPG na maior resolução.
3. Salve em `claudin-mod/assets/qg-icones/` com o nome do ID: `icone-sobre.png`, `icone-cola.png` e assim por diante.

## Ingestão (fica comigo)

1. **Fundo:** remover o magenta por chave de cor.
2. **Tamanho:** reduzir para 16x16 com no máximo 8 cores por ícone.
3. **SVG:** converter em SVG de retângulos com `scripts/png-para-svg.py`, como foi feito com as skins.
4. **Faixa:** desenhar cada ícone dentro da faixa do QG, no ponto marcado. Os ícones apagados ficam com opacidade baixa e o brilho (13) acende no hover.
5. **Clique:** botão invisível por cima de cada um. O tamanho do SVG final deve continuar abaixo de 131072 caracteres, e um teste confere isso.

## Pendências desta rodada que entram junto

- **Engrenagem:** vai para o canto inferior esquerdo do painel da bancada, logo abaixo do martelo.
- **Neon:** glow mais forte e um pouco mais de luz geral na sala com o neon ligado, para não parecer a sala apagada.
- **Ícones cortados e fora do lugar na janela redimensionada:** resolvidos pela troca dos emojis pelos ícones desenhados na própria faixa.
