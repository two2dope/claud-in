---
projeto: pet-a-pixel
dominio: software
maturidade: definido
etapa_atual: 8
tem_lado_visual: sim
gates:
  brief:           { status: aprovado, por: Thomáz, em: 2026-10-31 }
  direcao_visual:  { status: aprovado, por: Thomáz, em: 2026-10-31 }
  priorizacao:     { status: aprovado, por: Thomáz, em: 2026-10-31 }
  plano:           { status: aprovado, por: Thomáz, em: 2026-10-31 }
---

## Settled
- Nome oficial: "Pet-a-Pixel" (etapa 1)
- Entrada primária: 1 a 3 fotos de pet real + características descritivas e traços comportamentais (etapa 1)
- Plataforma e motor: 100% nativo no Google Flow, integrando Custom Tools para imagens e nós de vídeo (Veo/VideoFX) para animação em loop (etapa 2)
- Arquitetura de ferramentas:
  1. Tool 1 (v1.1): Spritesheet 4×6 em canvas 16:9 sobre fundo #26303D (24 células simétricas), focada exclusivamente em sprites e animação (etapa 8)
  2. Tool 2 (v1.1): Card Colecionável TCG/Super Trunfo 2.5:3.5 com caixas de dados blindadas (#151A21/#E0E6ED) somando 350 pts (etapa 8)
- Matriz etológica: 5 famílias animais (Caninos, Felinos, Pequenos Mamíferos, Aves e Répteis) ancoradas em 4 estados funcionais (etapa 8)
- Validação Empírica (2026-11-01):
  * Geração de Spritesheet 4×6 validada com sucesso no modelo generativo (casos de teste: cão mestiço preto e castanho e cacatua branca).
  * Fidelidade anatômica atingida: animais estritamente quadrúpedes/canônicos, sem antropomorfismo, sem roupas/armaduras e com respeito rigoroso às cores e marcações reais.
  * Identificação de fricção no sandbox interativo do Flow: limitações de pacotes para exportação zip/gif e descompasso de overlays de guias visuais recomendam desacoplamento do player/exportador em versão futura.

## Unsettled
- Nova proposta de arquitetura a ser trazida pelo usuário após revisão detalhada (ex: desacoplamento entre motor generativo no Flow vs. exportador/player web local independente).

## Riscos ativos
- Fragilidade do sandbox de código do Flow para pós-processamento multimídia | gatilho: tentar manipular codecs de vídeo/GIF e zips pesados dentro do editor web do Flow | dono: Thomáz | mitigação: manter o Flow focado exclusivamente na inferência generativa e transferir montagem para client/CLI local | última revisão: 2026-11-01
- Desalinhamento de overlays de UI sobre imagens dinâmicas | gatilho: componentes React tentarem desenhar guias fixas sobre resoluções variáveis de canvas | dono: Antigravity | mitigação: vincular guias a aspect-ratio CSS percentual estrito ou remover overlays desnecessários | última revisão: 2026-11-01

## Artefatos
- 01-intake.md: ok
- 02-descoberta.md: ok
- 03-brief.md: ok
- 04-direcao-visual.md: ok
- 05-ideacao.md: ok
- 06-priorizacao.md: ok
- 07-plano.md: ok
- 08-log.md: ok
- entregaveis/01_custom-tool-spritesheet.md: ok
- entregaveis/02_custom-tool-card-tcg.md: ok
- entregaveis/03_matriz-etologica.md: ok
- entregaveis/04_guia-pipeline-flow.md: ok
- ../../reviews/audit-plan-full.md: ok
