# SPEC · Claudin, episódio 1: Um dia no QG

GOAL:    quem rola o feed entende em 34 s que o Claudin é um mascote vivo para o Claude Code, com QG, crew e caixa de
         ferramentas, sente vontade de instalar e lembra o endereço do GitHub.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps, Reels.
TIME:    34 s x 30 = 1020 frames. Sem música nesta versão (sem fonte de música ligada); o texto e a imagem carregam tudo.
LOOK:    o material é a própria pixel art do mod (QG 360x76 e sprites 16x12, gerados por scripts/gera-assets.mjs), nunca
         redesenhada. Fundo das cenas do QG: madeira escura #2b1a10 em cima e água do mangue #1d3b36 embaixo; na cena do
         prompt, o cinza do app #1e1e1e (a interface real); skins em creme #f2e4c7; tela final no coral #D97757.
         Tinta: creme #fff1d6 sobre escuro, #2b1a10 sobre claro. Acento: coral #D97757, uma palavra por título.
         Títulos: Archivo Black 84 px, tracking -1%, no máximo 6 palavras por linha, entre y 200 e 420.
         Texto de interface (balões, prompt): Space Mono 700, 40 px.
         Sombra dos sprites: a do próprio mod (withOutline). Sem grão, sem vinheta.
OBJECTS: Claudin (coral, antenas, olhos que piscam), balão de borda arredondada do mod, a linha do prompt com ">",
         o QG (deck, bancada, monitores, prateleiras, cofre, calendário, servidor, relógio, porta), as miniaturas da
         frota (siri, garça, guaiamum, aratu), os ícones em vetor da caixa de ferramentas, as quatro skins.
MOTION:  entrada de personagem e ícone: back.out(1.7) em 12 quadros (mola ~0.5); câmera: power3.inOut em 24-36 quadros;
         troca de pose: squash 0.9/1.1 em 4 quadros e volta em 6; títulos entram cortados por máscara em 9 quadros
         (power4.out) e ficam parados enquanto são lidos.
SHOTS:   1  0-3.5 s    deck de manhã; Claudin pula feliz, balão "Bom dia! Bora codar?"; título "Seu Claude Code ganhou
                       um vizinho". Corta pelo balão.
         2  3.5-8.5 s  o app: Claudin acima do prompt "> conserta o bug do login"; o balão troca com a pose: Lendo
                       login.ts / Editando login.ts / Rodando: npm test / Pronto!; título "Ele reage a cada passo".
         3  8.5-12.5 s volta ao QG, câmera empurra até os monitores do painel; título "A sessão na parede".
         4  12.5-17 s  câmera nas bancadas; siri, garça, guaiamum e aratu pulam nos postos com o papel em cima;
                       título "Subagentes viram a sua crew".
         5  17-22 s    Claudin no centro, os ícones da caixa saltam em volta com nome; título "Tudo à mão".
         6  22-26.5 s  QG no quadro da lua: a luz apaga e a lua brilha, depois o neon liga; títulos "Apaga a luz" e
                       "Liga o neon".
         7  26.5-30 s  as quatro skins lado a lado com nome; título "Escolha a sua skin".
         8  30-34 s    coral; Claudin pula, "Claudin" grande, "github.com/two2dope/claud-in", "Código aberto · MIT".
BANNED:  vazio escuro com coisas pequenas flutuando; brilho e partículas de enfeite (o neon e a lua do QG são o
         produto); degradê roxo; três cartões em fila; tudo centralizado e subindo com fade; título que se mexe
         enquanto é lido; logo encostado no canto; redesenhar o Claudin ou o QG fora do código do mod.
QA:      0 s (miniatura: título, Claudin e QG legíveis), 5 s (balão e pose combinando), 10 s (painel legível),
         15 s (quatro criaturas nos postos), 20 s (ícones com nome), 24 s (lua acesa), 26 s (neon), 28 s (skins),
         33 s (endereço legível na faixa segura).
