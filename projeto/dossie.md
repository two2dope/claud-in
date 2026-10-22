---
projeto: claudin-mod
dominio: software
maturidade: definido
etapa_atual: 8
tem_lado_visual: sim
gates:
  brief:           { status: aprovado, por: Thomáz, em: 2026-10-19 }
  direcao_visual:  { status: aprovado, por: Thomáz, em: 2026-10-19 }
  priorizacao:     { status: aprovado, por: Thomáz, em: 2026-10-19 }
  plano:           { status: aprovado, por: Thomáz, em: 2026-10-19 }
---

## Settled
- Claudin é um mod (plugin de hooks) do Claude Code Desktop, em `~/.claude/dev-mods/<sessão>/claudin` (etapa 1)
- Mascote pixel-art permanente na tela, com balões de fala; reage a tool calls, falhas e fim de turno (etapa 1)
- Atividade de fundo (linhas de ferramenta, "Em execução") some do chat e vive nos balões/pensamentos (etapa 1)
- Sem toasts nem painel lateral por padrão; painel lateral só pelo botão "↔ lateral" (etapa 1)
- Usuário cria os próprios sprites por pose (idle, think, read, code, run, search, ok, err) em `sprites/` (etapa 1)
- Limites da plataforma: fundo cinza da faixa acima do prompt é do app; Claudin não flutua livre pela tela (etapa 1)

- Direção do aprimoramento: menos "Tamagotchi", mais "JARVIS" (Homem de Ferro) (etapa 2)
- Desejo: fundo da janela do Claudin transparente ou na cor do chat, para parecer vivo na conversa (etapa 2)

- JARVIS = tom sóbrio e proatividade; sem formalidade ("Senhor"); visual pixel-art mantido por ora (etapa 2)

- Proatividade em 5 gatilhos: falha com próximo passo, aviso de demora, alerta de ação arriscada, resumo e sugestão no fim do turno, puxar assunto quando ocioso (etapa 2)

- Falas em mistura: frases fixas no dia a dia; o modelo escreve só em falhas e no resumo de fim de turno (etapa 2)

- Hover só mostra botões e menus; todo texto vive no balão; a janela não pode crescer sozinha (etapa 2; correção aplicada na versão atual)
- Desejo: "caixa de ferramentas" do Claudin, como a cartola mágica do Gato Félix: ele abre e acessa uma infinidade de coisas (etapa 2)

- Caixa de ferramentas inclui: atalhos de prompt (resumir, explicar erro, rodar testes), ações rápidas (copiar último comando, abrir pasta), ajustes do próprio Claudin (pose, tools, tom), lembretes e timers (etapa 2)
- Canivete suíço: acesso aos comandos "/" (etapa 2)
- Lembretes e timers cobrem compromissos do calendário, tarefas agendadas, prazos e datas importantes (etapa 2)

- Orçamento: zero tokens extras por ora; modelo e calendário via Claude ficam como evolução futura (etapa 3)
- Sem datas de entrega; mod só do Thomáz; modo silencioso chamado "meditar" (etapa 3)

- Ideação aprovada por Thomáz em 2026-10-19; pedido novo: modo de proatividade "café e cigarro" (etapa 5)

- Priorização aprovada (etapa 6): olhos expressivos mantidos, ligados à função cartola (olham para a cartola ao abri-la); modos meditar, café e cigarro confirmados; menu radial e gaveta descartados (etapa 6)

- M2 fechado em 2026-10-19 (Fase B): caixa de ferramentas fixa à direita, menu estilo mIRC paginado, atalhos de prompt, ações rápidas, canivete de comandos "/" com busca e favoritos (etapa 8)
- Modos meditar, café e cigarro funcionam e foram aprovados por print (etapa 8)
- Claudin vive na faixa sobre o prompt e, por botão, no painel lateral; fundo padrão (sem tentativa de transparência) (etapa 8)
- Lista de comandos "/" é lida com `$.command.list()`; calendário e tarefas do Claude ficam como evolução futura (etapa 8)
- Skills duplicadas na lista: o canivete mostra só a forma mais curta; a causa é a mesma skill em duas origens (pasta local e sincronizada pelo app) (etapa 8)

- M3 iniciado em 2026-10-19: uma semana de uso real; revisão de riscos e M4 em 2026-10-26 (etapa 8)
- Sem novas funções durante o M3, só correções (etapa 8)

## Unsettled
- Sprites próprios: PNG dentro de SVG funciona no desktop? Ainda não testado.
- Organizar as skills em uma origem só: remover as cópias locais duplicadas (gauntlet-loop e gauntlet-model-router)? Aguarda decisão do usuário.
- Olhos expressivos (A4): feitos em SVG próprio; falta o olhar de entediado e o teste em tela.
- Fase C: C1, C2 e C3 feitos (timers, prazos, lembretes recorrentes, saudação); falta o teste de 1 semana (M3) e a revisão de riscos (M4).
- Aviso de demora (30 s): ainda sem teste em tela.

## Riscos ativos
- Superfície `AbovePrompt`/`Pane` do desktop pode mudar e quebrar o mod | gatilho: atualização do app | dono: Thomáz | mitigação: revisar o mod após atualizar o app | última revisão: 2026-10-19
- Esconder linhas de ferramenta oculta erros e atividade do chat | gatilho: falha silenciosa não percebida | dono: Claude | mitigação: botão "ver tools" e balão de erro vermelho | última revisão: 2026-10-19
- Janela cresce ou corta ao abrir a cartola | gatilho: print com layout quebrado | dono: Claude | mitigação: altura fixa e rolagem interna | última revisão: 2026-10-19
- Proatividade vira ruído | gatilho: usuário ignora ou silencia | dono: Thomáz | mitigação: modos meditar, café e cigarro e limiares ajustáveis | última revisão: 2026-10-19
- Alerta de risco com falsos positivos ou lacunas | gatilho: aviso indevido ou perigo não avisado | dono: Claude | mitigação: lista curta e editável; não substitui as permissões do app | última revisão: 2026-10-19
- Lembretes não disparam com o app fechado | gatilho: prazo passa sem aviso | dono: Thomáz | mitigação: saudação lista o que venceu | última revisão: 2026-10-19
- Sem acesso à tela, teste depende de prints | gatilho: tentativa e erro lentos | dono: Claude | mitigação: mudanças pequenas e `claude plugin test` | última revisão: 2026-10-19
- Sprite PNG pode não renderizar no SVG | gatilho: sprite não aparece | dono: Claude | mitigação: testar cedo; usar SVG como alternativa | última revisão: 2026-10-19

## Artefatos
- 02-descoberta.md: ok
- 03-brief.md: ok
- 04-direcao-visual.md: ok
- 05-ideacao.md: ok
- 06-priorizacao.md: ok
- 07-plano.md: ok
- 08-log.md: ok
