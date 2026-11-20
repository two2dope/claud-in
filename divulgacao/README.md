# Divulgação do Claudin

Material de divulgação do mod: vídeos verticais para Instagram (Reels), as trilhas e os prompts que os geraram.

## Série "Claudin" (Reels, 1080 x 1920)

| Ep. | Título | Duração | Trilha | Ideia |
| --- | --- | --- | --- | --- |
| 1 | Um dia no QG | 34 s | Mangrove Crab Odyssey (92 BPM, entra em 20,7 s) | o Claudin atravessa o QG e cada objeto vira um recurso, do deck de manhã ao neon |
| 2 | Crew no beat | 34,4 s | Mangue Crew Assemble (104,6 BPM, entra em 105,2 s) | palavras gigantes no compasso apresentando skins, frota e modos |
| 3 | Dentro do balão | 34,7 s | Thought Bubble Recursive Dive (90 BPM, entra em 110,2 s) | zoom sem fim: prompt, balão, QG, painel, caixa de ferramentas, neon, e volta ao prompt |

Ordem sugerida no perfil: 1 (o que é), 2 (quem é a crew), 3 (o mundo inteiro dentro do balão).

## Pastas

- `serie-claudin/epNN-.../`: cada episódio é um projeto HyperFrames (HTML + GSAP). `SPEC.md` é o roteiro em números,
  `TRILHA.md` o prompt da música no Gemini, `STORYLINES.md` os três roteiros da série, `compositions/` as cenas.
  As artes saem do próprio código do mod (`scripts/gera-assets.mjs`), nada é redesenhado.
- `reels/`: os MP4 finais, prontos para postar.
- `trilhas/`: as músicas geradas no Gemini.

Os MP4 e os MP3 ficam só na máquina (estão no `.gitignore`); o repositório guarda os projetos, que renderizam de novo.

## Como mexer

```powershell
cd divulgacao/serie-claudin/ep01-um-dia-no-qg
npx hyperframes preview          # prévia no navegador
npx hyperframes open .           # abre no app desktop do HyperFrames
npx hyperframes render -q delivery -o renders/ep01.mp4
```

Antes de renderizar com som, ponha a trilha do episódio em `assets/audio/trilha.mp3` (cópia em `divulgacao/trilhas/`).

## Legenda sugerida

> Meu Claude Code ganhou um vizinho 🦀 O Claudin é um mascote em pixel art que vive acima do prompt, reage a cada
> passo do Claude, tem QG no mangue, crew de subagentes e caixa de ferramentas. Código aberto, licença MIT:
> github.com/two2dope/claud-in
