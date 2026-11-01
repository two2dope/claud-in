---
projeto: flow-custom-tool
dominio: software
maturidade: esboco
etapa_atual: 1
tem_lado_visual: sim
gates:
  brief:           { status: pendente, por: , em: }
  direcao_visual:  { status: pendente, por: , em: }
  priorizacao:     { status: pendente, por: , em: }
  plano:           { status: pendente, por: , em: }
---

## Settled
- Plataforma-alvo: Google Flow (Custom Tool parametrizada) (etapa 1)
- Objetivo central: Geração de Sprite Sheets e Pixel Art com grade uniforme e controle de células para assets/mascotes (etapa 1)
- Padrão geométrico: Folha conceitual 4×6 (4 estados × 6 quadros) em proporção 16:9 sobre fundo sólido chumbo `#26303D` (etapa 1)
- Formato técnico: Tool nativa do Flow com prompt mestre estruturado, restrições negativas estritas e variáveis tipadas (etapa 1)

## Unsettled
- Qual é o nível de parametrização de inputs que o operador deve preencher na UI da ferramenta?
- As 4 linhas devem seguir os 4 estados canônicos fixos (Idle, Locomotion/Active, Celebration/Success, Glitch/Failure/Hurt) ou permitir customização?
- Além do prompt mestre e da especificação técnica da Tool no Flow, o projeto incluirá um visualizador web interativo (preview/player HTML) via modern web standards?

## Riscos ativos
- Vazamento de contexto entre células/linhas | gatilho: excesso de variáveis de texto livre que confundem o enquadramento do modelo de difusão | dono: Thomáz | mitigação: ancorar regras de linha fixas no prompt mestre e restringir entradas a arquétipo e sujeito | última revisão: 2026-10-31

## Artefatos
