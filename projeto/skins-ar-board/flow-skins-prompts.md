# Claudin: skins pelo Flow (âncoras + lote único)

Plano da `flow-assets` para o lote de skins aprovado no AR Board de 2026-11-18. Rota A do gate: as **âncoras** saem do Nano Banana, separadas; o **lote inteiro** sai de uma vez no Google Flow, usando as âncoras como referência, sem depender do limite de 12 gerações do Antigravity.

## Bloco de estilo (vale para todos os prompts)

```
Chunky 16-bit pixel art sprite, strict flat palette of at most 8 colors, hard pixel edges, no anti-aliasing, no gradients, no dithering, no outline glow, no drop shadow, no text, no border. Centered subject, front view, on a flat solid #1E1E1E background. 1:1 square.
```

## Âncoras (Nano Banana, 1 a 2 imagens cada, escolher a melhor)

### A1: mascote Mangue (âncora de personagem)
```
Chunky 16-bit pixel art sprite of a small crab mascot seen from the front: wide flat rectangular coral body (#D97757), two short antennae on top, four short legs, two small claws held low at the sides, two round cream eyes (#F5F4ED) with tiny dark pupils (#1A1A1A) looking straight ahead. Friendly, calm, minimal detail. Strict flat palette of at most 6 colors, hard pixel edges, no anti-aliasing, no gradients, no shadow, no text, no border. Centered, on a flat solid #1E1E1E background. 1:1 square.
```

### A2: folha de criaturas do mangue (âncora das miniaturas)
```
Pixel art sprite sheet, 5 tiny mangrove creatures in a row, each about 24x24 pixels, same chunky 16-bit style and the same hard-edged flat palette: (1) a blue swimming crab (siri) with paddle-shaped back legs, #5B8DEF; (2) a lilac egret standing on one long leg (garça), #9B7FE0; (3) an amber land crab with one oversized claw (guaiamum), #E0A63A; (4) a small green tree crab clinging to a root (aratu), #4CAF7D; (5) a tiny gray crab (caranguejinho), #8F9BAD. Each creature has two simple cream eyes (#F5F4ED). Clearly different silhouettes. No anti-aliasing, no gradients, no shadow, no text. Flat solid #1E1E1E background. 1:1 square.
```

## Lote único no Flow (32 imagens, 1:1)

Referência ligada: **A1** nas skins (anchored=true); **A2** nas miniaturas (anchored=true). Nada de referência de personagem em itens que não sejam criaturas. Nomes em kebab-case.

Prompt de cada pose = bloco de estilo + descrição da pose + paleta da skin.

### Poses (9 por skin; mesmas poses do `sprites/<pose>.svg` atual)
| pose | descrição para o prompt |
|---|---|
| idle | eyes open looking forward, claws low, relaxed |
| think | eyes narrowed and looking up, small pause expression |
| read | eyes looking to one side as if scanning, claws low |
| code | eyes looking down, tiny cyan key sparks under the feet |
| run | busy stance, eyes looking down, legs mid-step, claws slightly raised |
| search | eyes scanning to the side, head slightly tilted |
| ok | both claws raised high in celebration, happy eyes |
| err | eyes drawn as two small X marks, claws low |
| alert | a small amber exclamation mark floating above the head, eyes wide |

### Paletas
| skin | corpo | antenas | extra |
|---|---|---|---|
| mangue (padrão) | `#D97757` | `#D97757` | nenhum |
| mare | `#2F9E9A` | `#7FD6D0` | nenhum |
| malungo | `#8F9BAD` | `#CFD6E0` | plain straw hat (chapéu de palha) with a dark band, in `#D9B45B`; **no person's face, no sunglasses, no likeness of anyone** |

### Ids e arquivos (assets/skins/)
- `mangue-<pose>.png` ×9, `mare-<pose>.png` ×9, `malungo-<pose>.png` ×9.
- Maré e Malungo: gerar **a partir da pose do Mangue correspondente** como referência de edição ("same pose, recolor to palette X" / "same pose, add straw hat"), para a silhueta ficar idêntica.
- Opção que não gasta geração: Maré por troca de paleta em script. Decidir depois de ver a arte do Mangue.

### Miniaturas (5, referência A2, uma criatura por imagem, 24x24 de conteúdo)
`mini-siri.png`, `mini-garca.png`, `mini-guaiamum.png`, `mini-aratu.png`, `mini-caranguejinho.png`. Cores e criaturas do mapa aprovado (Explorar = siri azul, Planejar = garça lilás, Executar = guaiamum âmbar, Revisar = aratu verde, outros = caranguejinho cinza).

## Depois do Flow (ingestão)
1. Renomear em kebab-case e pôr em `assets/skins/` (fora do pacote até o pacote existir).
2. Tirar o fundo `#1E1E1E`, reduzir para 64x48 (poses) e 24x24 (miniaturas) com vizinho mais próximo e pôr cada PNG abaixo de cerca de 90 KB.
3. Curadoria em novo AR Board (poses lado a lado por skin).
4. Só então o pacote de skins no código, depois do cofre em leitura.

## Riscos
- Modelo de difusão não alinha pixels em grade: ao reduzir para 64x48 a arte pode ficar com ruído. Por isso A1 e uma miniatura são o teste antes do lote.
- Remover o fundo exige uma ferramenta de remoção; cor de fundo `#1E1E1E` foi escolhida por não colidir com nenhuma paleta.
- O código carrega 9 poses (`MOODS` inclui `alert`); o README lista só 8. Corrigir o README no pacote de skins.
