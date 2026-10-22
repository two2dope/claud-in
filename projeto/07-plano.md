# Plano — claudin-mod

## Termo de abertura (resumo)
- **Escopo:** evoluir o mod Claudin (Claude Code Desktop) em 3 fases: A aprimorar, B cartola e canivete, C tempo. Fora do escopo: flutuar fora do app, transparência real da faixa, gasto de tokens, calendário via Claude, menu radial e gaveta.
- **Objetivo:** um assistente proativo no tom do JARVIS sem formalidade, com a atividade de fundo no balão e uma caixa de ferramentas.
- **Responsabilidades:** Thomáz decide e aprova e testa no app; Claude implementa, valida e corrige.

## 1. Metas e objetivos
- **Meta:** o Claudin vira o ponto único de contato do dia a dia, sem poluir o chat.
- **Objetivos (produtos finais):**
  1. Fase A: modos meditar, café e cigarro; gatilhos de falha, demora, risco e fim de turno; borda por severidade; tom curto; fundo na cor do chat; olhos expressivos.
  2. Fase B: cartola com abas e busca; atalhos de prompt e ações rápidas; canivete de comandos "/"; mais usadas no topo; olhos que olham para a cartola ao abri-la.
  3. Fase C: timers e pomodoro; prazos e datas guardados entre sessões; lembretes recorrentes; saudação com prazos do dia.

## 2. Métricas de sucesso
- 100% das linhas de ferramenta e de "Em execução" no balão, e nenhuma no chat (com o botão para revelar).
- A janela do Claudin nunca muda de tamanho sozinha, nem no hover nem na cartola, na faixa e no painel.
- 4 gatilhos proativos ativos (falha, demora, risco, fim de turno) e os 3 modos funcionando.
- Cartola abre em 1 clique e executa pelo menos 10 ações; comandos "/" listados com busca.
- Lembretes disparam no horário combinado, com o app aberto, em teste de 1 semana.
- Gasto extra de tokens = 0.
- Cada fase testada por print do usuário.

## 3. Participantes, funções e riscos (RACI)
| Atividade | Responsável | Aprova | Consultado | Informado |
|---|---|---|---|---|
| Implementar, validar e corrigir o mod | Claude | Thomáz | Thomáz | Thomáz |
| Testar no app e enviar prints | Thomáz | Thomáz | Claude | Claude |
| Desenhar sprites e poses | Thomáz | Thomáz | Claude | Claude |
| Decidir prioridades e gates | Thomáz | Thomáz | Claude | Claude |

### Registro de riscos
| Risco | Gatilho | Dono | Mitigação | Contingência |
|---|---|---|---|---|
| Atualização do app quebra a faixa ou o painel | app atualiza e o Claudin some | Thomáz | revisar o mod após cada atualização | voltar ao painel lateral ou aos toasts |
| Janela cresce ou corta ao abrir a cartola | print mostra layout quebrado | Claude | altura fixa e rolagem interna | simplificar o menu para uma lista |
| Proatividade vira ruído | Thomáz ignora ou silencia | Thomáz | os 3 modos e limiares ajustáveis | reduzir os gatilhos |
| Alerta de risco com falsos positivos ou lacunas | aviso indevido ou perigo não avisado | Claude | lista curta e editável de comandos | confiar nas permissões do app |
| Lembretes não disparam com o app fechado | prazo passa sem aviso | Thomáz | avisar na saudação o que venceu | lembrete externo (futuro) |
| Esconder ferramentas oculta uma falha | erro passa despercebido | Claude | erro sempre no balão vermelho e botão "ver tools" | desligar a ocultação |
| Sem acesso à tela, teste depende de prints | tentativa e erro lentos | Claude | mudanças pequenas e prints a cada passo | testes automáticos (`claude plugin test`) |
| Sprite PNG não renderiza no SVG | sprite não aparece | Claude | testar cedo com 1 PNG | usar sprites em SVG |

## 4. Orçamento e recursos
- Custo financeiro: zero. Sem tokens extras (decisão do brief).
- Recursos: o app desktop como ambiente de teste; `claude plugin validate`; sprites feitos por você; prints seus como verificação.
- Lacunas: nenhuma tela direta do app para o Claude; depende dos prints.

## 5. Marcos e entregáveis
| Marco | Entregável |
|---|---|
| M1 Fase A pronta | mod com modos, gatilhos, borda, tom, fundo e olhos expressivos; print de aprovação |
| M2 Fase B pronta | cartola com abas e busca, atalhos e canivete "/"; print de aprovação |
| M3 Fase C pronta | timers, prazos e lembretes persistentes; teste de 1 semana |
| M4 Fechamento | revisão de riscos e dossiê atualizado |

## 6. Roadmap (sem datas, a pedido do usuário)
Sequência e dependências:
1. **A1** Modos meditar, café e cigarro (base de toda proatividade).
2. **A2** Gatilhos: falha, demora, fim de turno; depois o alerta de risco.
3. **A3** Borda por severidade, tom curto, fundo na cor do chat.
4. **A4** Olhos expressivos (depende dos sprites; pode ser em SVG próprio).
5. **M1** print de aprovação.
6. **B1** Estrutura da cartola, com altura fixa e abas.
7. **B2** Atalhos de prompt e ações rápidas.
8. **B3** Canivete "/" com busca (`$.command.list` e `$.prompt.fill`).
9. **B4** Mais usadas no topo e olhos para a cartola.
10. **M2** print de aprovação.
11. **C1** Timers e pomodoro.
12. **C2** Prazos e datas, guardados entre sessões (`$.store`).
13. **C3** Lembretes recorrentes e saudação com os prazos.
14. **M3 e M4** teste de 1 semana e revisão de riscos.

Estimativas em horas ficam fora: sem datas e sem capacidade medida, qualquer número seria palpite.

## 7. Plano de comunicação
- **Status:** a cada passo do roadmap, uma mensagem curta no chat com o que mudou e o que testar.
- **Prova:** você manda um print a cada marco (M1, M2, M3).
- **Canal:** esta conversa. O dossiê `projetos/claudin-mod/` guarda o estado.
- **Cadência de revisão de riscos:** a cada marco (M1, M2, M3, M4) e depois de cada atualização do app.
