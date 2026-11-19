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

- Distribuição por marketplace (`claudin@claud-in`): releases 0.2.0 a 0.7.1 por PR (#2 a #11), todos conferidos por instalação limpa do GitHub; o app do Thomáz está na 0.7.1 (2026-11-19)
- Cofre só em leitura (decisões do AR Board em `09-criterios-ar-board.md`): saudação, aba Cofre, prazos do `_hot` na Agenda, captura de nota em `Raw/Notas` como única escrita; caminho em `<config>/claudin/cofre.json`, nada do cofre no repositório (0.2.1 a 0.3.2)
- Skins são o próprio Claudin em código (`hooks/desenho.ts`): Mangue (padrão), Maré, Malungo, Lama (com brotinho) e `clássico` (o chapado); a arte parada do Flow para o mascote foi abandonada pelo usuário (0.3.x a 0.5.0)
- Miniaturas da frota em código (`hooks/minis-arte.ts`): siri, garça, guaiamum, aratu e caranguejinho, até 2 por vez (0.3.2)
- Cola da Oficina (0.4.0 a 0.5.0): botão 📋 em Comandos lê o `catalogo.json` da oficina de skills por `<config>/claudin/cola.json`; plugins recolhíveis, descrição e exemplo falados pelo Claudin, comandos por plugin, grupo `oficina.py` (chave `scripts` do catálogo) e grupo `Claudin`; só preenche o prompt
- Aviso de contexto (0.6.0): lê `$.session.usage()` ao fim do turno e sugere `/compact` e `/clear` uma vez por nível; faixa padrão 50/70/85%, ajustável em Ajustes (60/80/90, 70/85/95, desligado); nunca age sozinho
- QG do Claudin no Mangue (0.7.0 e 0.7.1): faixa de pixel art 360x76 num único SVG (arte `3a2e210d`, 25 imagens em três rodadas do Flow), botão 🏝, cinco pinos (pastas=Cola, monitores=frota, cofre=Cofre, calendário=Agenda, relógio=Tempo), luz pela hora do computador, relógio de parede só com o pomodoro, miniaturas nas quatro bancadas e o Claudin andando dentro da faixa
- Limites técnicos do desktop que valem para qualquer arte futura: PNG embutido em SVG não é desenhado (só retângulos e caminhos); um elemento Svg aceita no máximo 131072 caracteres; dois elementos empilhados deixam emenda (layout em células), então imagem, luz e relógio vão no mesmo SVG; gradiente, máscara, desfoque, mistura e animação SMIL funcionam dentro do SVG; um clique tem 10 s de orçamento; a pasta de mods de uma sessão recarrega no reinício (a cópia de teste precisa sair de lá)

## Unsettled
- Sprites próprios em PNG: resolvido, não funciona no desktop; skins e miniaturas do usuário só em SVG.
- LICENSE: o diretório de plugins exige uma; recomendação registrada: MIT; escolha do usuário.
- Visual da 0.7.1 no desktop: o Claudin dentro da faixa e o balão logo abaixo ainda não foram conferidos (a 0.7.0 foi conferida numa cópia de teste).
- Luz da noite do QG: as lanternas formam um domo grande no centro; diminuir o raio fica para a próxima rodada.
- Nome acessível das abas só com ícone: sem solução na API (o motor só aceita o `label` do botão).
- Ideias sem decisão: clima no cenário (via `$.http.fetch`, descartado por ora), animações extras, segunda arte (noite pintada à mão), Fase 2 S4/S5 (modelo e esforço) em standby.
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
- Sem acesso à tela, teste depende de prints | gatilho: tentativa e erro lentos | dono: Claude | mitigação: mudanças pequenas, `claude plugin test` e uma cópia de teste com outro nome (`claudin-qg`) na pasta de mods da sessão | última revisão: 2026-11-19
- A Cola depende do formato do `catalogo.json` da oficina de skills (outra sessão e outro repositório) | gatilho: chave renomeada ou removida | dono: Thomáz | mitigação: o leitor ignora o que não entende e a aba mostra "catálogo ilegível" | última revisão: 2026-11-19
- O QG redesenha uma imagem de ~108 mil caracteres a cada 1,5 s (passeio do Claudin) | gatilho: lentidão ou piscada no desktop | dono: Claude | mitigação: medido em 2 a 3 ms no motor e 15 ms por desenho no teste; reduzir a frequência se aparecer | última revisão: 2026-11-19
- Sprite PNG pode não renderizar no SVG | gatilho: sprite não aparece | dono: Claude | mitigação: testar cedo; usar SVG como alternativa | última revisão: 2026-10-19

## Artefatos
- 02-descoberta.md: ok
- 03-brief.md: ok
- 04-direcao-visual.md: ok
- 05-ideacao.md: ok
- 06-priorizacao.md: ok
- 07-plano.md: ok
- 08-log.md: ok
- 09-criterios-ar-board.md: ok (decisões do AR Board do cofre e das skins)
- 10-qg-mangue-roteiro-de-arte.md: ok (roteiro e curadoria da arte do QG)
- skins-ar-board/: ok (painéis da curadoria das skins; a arte do Flow saiu do pacote na 0.3.2)
