# QG do Claudin no Mangue: roteiro de arte

Faixa panorâmica em pixel art, a **base de operações dos caranguejos com cérebro**, instalada no mangue. Ela fica atrás do Claudin, na linha acima do prompt ou no painel lateral, e se ajusta à largura da janela. O que o teste de 2026-11-19 provou no desktop:

- um **único SVG** de até 131.072 caracteres (sem emendas); gradiente, máscara, desfoque, mistura e animação funcionam dentro dele;
- a imagem escala com a janela mantendo a proporção; o Claudin, as miniaturas e os botões vão **por cima**, desenhados em código;
- hora do dia, lâmpadas e brilho de tela vêm de camadas de luz em código, então a arte é **uma só**, de dia.

## Formato (o que o conversor aguenta)

| Item | Valor |
| --- | --- |
| Proporção | em torno de **4,7:1** (largura:altura). O Flow só entrega 16:9, e eu recorto a faixa do meio |
| Resolução de trabalho | 360 × 76 "pixels de arte" (cada pixel de arte = um bloco quadrado nítido) |
| Exportação | a imagem 16:9 padrão do Flow (1376 × 768) serve: o conversor recorta e reduz |
| Cores | no máximo **24**, chapadas, sem degradê, sem ruído, sem dithering |
| Luz | realce claro em cima e à esquerda, sombra embaixo e à direita, como o Claudin |
| Texto | **nenhum** na imagem (letras, números, marcas d'água): a interface escreve por cima |

O custo é por região de cor: poucas cores grandes e limpas cabem folgadas; ruído e dithering estouram o limite.

## O que a arte precisa ter (da esquerda para a direita)

O Claudin anda no **piso**, então deixe uma faixa livre embaixo (cerca de 25% da altura), sem objeto na frente.

1. **Doca no mangue:** raízes aéreas de mangue, lama, água rasa com reflexo, um píer de madeira. É a entrada.
2. **Estante de pastas e mesa de trabalho** (vira a **Cola**): pastas coloridas em fileira, uma bancada com ferramentas.
3. **Central de monitores** (vira a **frota e os testes**): parede de telas, algumas verdes e uma vermelha, e **quatro bancadas vazias** na frente, onde as miniaturas da frota ficam em pé (siri, garça, guaiamum, aratu).
4. **Quadro do cofre e calendário** (vira o **Cofre** e a **Agenda**): um cofre/baú com um ícone de lua e livros em fila, desenhado como símbolo, mais um calendário de parede **sem números** (só a grade).
5. **Servidor e estufa** com luzes de status, mais um **relógio de parede com o mostrador vazio**: sem ponteiros, sem números, só o aro. O pomodoro é desenhado por código.

Fundo: cabana de palafita entre raízes de mangue, lanternas, cabos, plantas, telhado de palha com antena. Clima de oficina geek e acolhedora, não de terminal frio. Paleta: coral do Claudin (`#D97757`) nos detalhes, verdes e azul-petróleo do mangue, madeira quente, creme nas paredes.

**Luzes que acendem à noite** (marque bem, são lâmpadas de verdade): a lanterna da doca, a luminária da mesa, as telas e as luzes do servidor.

## Prompt mestre para o Flow (inglês, copie inteiro)

```
Wide panoramic pixel art banner, side view cutaway, 5:1 aspect ratio, flat limited palette of at most 24 colors, crisp square pixels, no anti-aliasing, no dithering, no gradients, no text, no letters, no numbers, no watermark. Scene: a cozy geeky technology headquarters built on wooden stilts among mangrove roots at the water's edge, the secret base of brainy crabs. From left to right: a wooden dock with mangrove roots and shallow water, a shelf of colorful binders above a workbench, a wall of computer monitors (mostly green, one red) with four empty work stations in front, a wall safe with a moon icon next to a row of books and a blank calendar grid with no numbers, a server rack with small status lights and a round wall clock with an EMPTY face (no hands, no numerals). Hanging lanterns, cables, plants, a thatched roof with an antenna. Warm wood, teal water, cream walls, coral (#D97757) accents. Light from the top-left: bright rim on top and left edges, soft shade on bottom and right edges. Leave the bottom 25 percent of the image as a clear flat wooden floor with nothing standing on it. No characters, no creatures, no people, no crabs. Daytime lighting.
```

## Variações (rodar 4 a 6 vezes e mandar tudo para a curadoria)

- **A:** o prompt mestre como está.
- **B:** acrescente `more mangrove roots and vines framing both ends, softer sunlight through leaves`.
- **C:** acrescente `more cyberpunk touches: neon cables and a glowing server, still daytime`.
- **D:** acrescente `Mangue Beat folk touches: painted wooden sign shapes without letters, hanging fishing nets`.
- Se o modelo desenhar texto ou caranguejos, repita pedindo `absolutely no text, no creatures`.

## Curadoria (AR Board)

Marque como **aprovado** a imagem que:
- tem só cores chapadas, sem ruído, e **cabe nas 24 cores**;
- deixa o **piso livre** embaixo;
- tem as cinco zonas na ordem pedida e o relógio de mostrador **vazio**;
- tem as lâmpadas bem separadas (para a luz noturna recortar a escuridão).

Rejeite: texto desenhado, personagens, degradê, ruído, piso ocupado por móveis.

## Resultado (2026-11-19)

Foram 25 imagens em três rodadas, todas 16:9. A aprovada é `Crab_technology_headquarters_pix…_3a2e210d.jpg`: cabana de palafita com raízes e cipós, placa, parede de monitores, quatro cadeiras alinhadas, cofre, calendário, servidor e relógio de parede. Recorte da linha 222 com 290 de altura, reduzido para 360 × 76, saturação 1,35 e 24 cores: 108 mil caracteres de SVG. `python scripts/qg-para-svg.py <imagem>` repete a conversão. Baixar em 2K não ajuda: o limite é o tamanho do SVG.

## O que eu faço com a imagem aprovada

Salve em `claudin-mod/assets/qg/`. Eu converto para SVG (24 cores, um caminho por cor), mapeio na própria imagem a posição de cada ponto clicável (calendário, quadro, pastas, monitores, relógio) e das bancadas das miniaturas, e ligo tudo ao Claudin: hora do dia, lâmpadas, brilho das telas, pomodoro no relógio e os botões que abrem Agenda, Cofre, Cola e frota.
