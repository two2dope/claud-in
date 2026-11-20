# SPEC · Claudin, episódio 2: Crew no beat

GOAL:    em 36 s, quem rola o feed conhece a crew inteira do Claudin (quatro skins, quatro criaturas da frota com o
         papel de cada uma, quatro modos) no ritmo de uma percussão de pegada manguebeat, e sai com o endereço do GitHub.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, Reels.
TIME:    36 s x 30 = 1080 quadros. 100 BPM: batida 0,6 s (18 quadros), compasso 2,4 s (72 quadros), 15 compassos.
         A trilha é gerada no Gemini nesse andamento e encaixada pelo primeiro tempo forte.
LOOK:    campos de cor chapada do mangue, um por plano: coral #D97757, maré #2f9e9a, palha #c9a35a, lama #7d6b43,
         verde mangue #3f6b3a, tinta #2b1a10, creme #fff1d6. Sem degradê, sem grão.
         Palavra gigante: Archivo Black, 180 a 230 px, caixa alta, tracking -2%, no máximo duas palavras por linha.
         Linha de apoio: Space Mono 700, 52 px. Sprites do mod em pixel art, gerados do código (scripts/gera-assets.mjs).
OBJECTS: o Claudin nas quatro skins (Mangue, Maré, Malungo com chapéu de palha, Lama com brotinho), siri, garça,
         guaiamum, aratu e caranguejinho, os modos (café com a xícara, cigarro, meditar com a faixa, thug life com os
         óculos) e o QG no neon.
MOTION:  corte seco no compasso (troca de cor e de personagem), batida marcada por um soco de escala 1,1 -> 1 em
         4 quadros (power3.out) e pulinho do personagem; nada flutua entre as batidas.
SHOTS:   hook   0-4,8      "SEU CLAUDE / GANHOU / UMA CREW" em pilha desde o quadro 0; cada linha acende no seu par de
                           batidas; o Claudin pula a cada batida embaixo.
         skins  4,8-14,4   um compasso por skin, cor própria, nome gigante e a frase dela.
         frota  14,4-24    um compasso por criatura: nome e o que faz (explora, planeja, executa, revisa).
         modos  24-28,8    meio compasso por modo: CAFÉ, CIGARRO, MEDITAR, THUG LIFE.
         crew   28,8-31,2  todos juntos na frente do QG no neon: "A CREW TÁ COMPLETA".
         fim    31,2-36    coral; nome, "mascote e QG para o Claude Code", github.com/two2dope/claud-in.
BANNED:  vazio escuro com coisas pequenas; brilho e partículas; degradê roxo; cartões em fila; fade subindo; título
         que se mexe enquanto é lido; logo no canto; redesenhar personagens fora do código do mod.
QA:      0 s (hook legível), 6 s (skin Mangue), 11 s (Malungo e a homenagem), 16 s (siri), 25 s (café),
         30 s (crew no QG), 35 s (endereço legível).
