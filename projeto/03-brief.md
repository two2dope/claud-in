# Brief — claudin-mod

Itens marcados **[proposto]** não foram ditos pelo usuário: são sugestões minhas, a confirmar.

## 1. Identificação e contexto estratégico
- Nome: Claudin (mod do Claude Code Desktop).
- Necessidade: um assistente permanente e vivo, que mostre o que o Claude faz em segundo plano sem poluir o chat.
- Problema central: a atividade de ferramentas polui o chat; faltam um ponto de contato amigável e atalhos rápidos para o dia a dia.
- Antecedentes: protótipo v0.1 funcionando (mascote pixel-art, balão, passeio, hover, painel lateral opcional, linhas de ferramenta ocultas, sprites próprios).

## 2. Objetivos e métricas
- Elevator pitch: o Claudin é o copiloto de bolso do Thomáz, um JARVIS sem formalidade que informa, avisa e abre uma caixa de ferramentas com atalhos, comandos, lembretes e prazos.
- Critérios SMART **[proposto]**:
  - 100% das linhas de ferramenta e do "Em execução" no balão, nenhuma no chat (com botão para revelar).
  - Janela do Claudin nunca muda de tamanho sozinha (hover incluído).
  - 5 gatilhos proativos ativos: falha, demora, risco, fim de turno, ocioso.
  - Caixa de ferramentas abre em 1 clique e executa ≥ 10 ações (atalhos, comandos "/", ajustes, timers).
  - Lembretes disparam no horário combinado em teste de 1 semana.
  - Gasto extra de tokens = zero nas fases A a C: só funções gratuitas por ora; falas do modelo e integrações pagas ficam como evolução futura.
  - Modo "meditar" (silencioso) liga e desliga em 1 clique e suspende toda fala proativa.

## 3. Público-alvo
- Primário: Thomáz (uso diário, no desktop, em português).
- Secundário: nenhum por ora. O mod é só do Thomáz; compartilhar fica para depois.
- Necessidades e dores: ver o progresso sem ruído, agir rápido, não perder prazos.

## 4. Mensagem, tom e chamada para ação
- Mensagem-chave: "Estou de olho; aqui está o que importa agora."
- Tom: sóbrio, proativo, direto, sem formalidade ("Senhor"); curto no dia a dia, mais completo em falhas e resumos.
- Reação esperada: o usuário responde com 1 clique (aceitar sugestão, abrir a caixa).
- Restrições: pixel-art mantido; texto só no balão; hover só com botões.

## 5. Escopo, entregáveis e especificações
- Grau de abertura: **misto**. Fixos: tom JARVIS, balão como único canal de texto, hover só com botões, caixa de ferramentas. Abertos: lista final de ações da caixa e visual novo.
- Entregáveis, em fases **[proposto]**:
  - Fase A (aprimorar o que existe): hover estável, fundo "cor do chat" (tentativa), tom novo das falas, 5 gatilhos proativos com frases fixas e modelos de frase (o modelo de linguagem fica para uma fase futura), modo "meditar".
  - Fase B (cartola): menu "caixa de ferramentas" com atalhos de prompt, ações rápidas, ajustes do Claudin, canivete de comandos "/" (via lista de comandos).
  - Fase C (tempo): lembretes e timers próprios, guardados entre sessões, e prazos e datas importantes cadastrados no próprio Claudin. Calendário e tarefas agendadas via pedido ao Claude ficam como evolução futura (gastam tokens).
- Fora do escopo: flutuar livre fora do app; tornar a faixa do app transparente de verdade; outros temas além do atual.
- Restrições inegociáveis: roda como mod local; nunca esconder falhas (erro sempre aparece no balão vermelho).

## 6. Cronograma e marcos
- Sem data, definido pelo usuário. Início 2026-10-19.
- Marco 1: Fase A concluída e testada com prints.
- Marco 2: Fase B concluída.
- Marco 3: Fase C concluída; revisão de riscos.

## 7. Orçamento, recursos e governança
- Orçamento: zero tokens extras por ora (decisão do usuário). Tudo que usa o modelo, incluindo calendário via Claude, fica como integração futura.
- Recursos: o próprio app como único ambiente de teste; prints do usuário como evidência.
- Governança: Thomáz aprova gates; Claude implementa, valida (`claude plugin validate`) e testa.

## 8. Riscos, premissas e anexos
- Risco: o app desktop mudar `AbovePrompt`/`Pane`. Mitigação: revisar após atualizações.
- Risco: esconder ferramentas oculta problemas. Mitigação: erro sempre no balão, botão "ver tools".
- Risco: gastar tokens demais com falas do modelo. Mitigação: só falhas e fim de turno, com teto e cache.
- Risco: calendário depende do conector do Google e de gastar turnos. Mitigação: consultar sob demanda e em horários fixos, guardar o resultado.
- Premissa: PNG dentro de SVG funciona como sprite. Teste pendente.
- Premissa: sem acesso à tela, a verificação depende de prints do usuário.
- Anexos: mod em `~/.claude/dev-mods/<sessão>/claudin`; dossiê em `projetos/claudin-mod/`.

## Briefing de retorno
**O que entendemos.** Evoluir o Claudin de mascote reativo (Tamagotchi) para um assistente proativo (JARVIS sem formalidade) que concentra a atividade de fundo no balão e oferece uma caixa de ferramentas: atalhos, comandos "/", ajustes e lembretes com calendário e prazos.

**Contradições e tensões achadas.**
- "Fundo transparente" contra o app: a faixa cinza é do app. O que entregamos é "cor do chat" dentro da faixa, não transparência real.
- "Vivo na janela" contra a plataforma: ele não circula livremente pelo app, só pela faixa ou pelo painel.
- "Infinitas coisas" contra o orçamento: tudo o que usa o modelo, incluindo o calendário, gasta tokens. Daí o teto e o cache.
- Proatividade contra ruído: 5 gatilhos podem virar incômodo. Precisamos de um nível de verbosidade e de um botão de silêncio **[proposto]**.

**Problema reenquadrado (HMW).** Como nós poderíamos fazer o Claudin informar e antecipar o que o Thomáz precisa, sem poluir o chat e sem ocupar espaço fixo, com acesso rápido às ferramentas do dia a dia?

**Critérios de sucesso.** Os SMART do bloco 2.

**Premissas.** Sprites PNG funcionam; o mod consegue listar comandos "/" e enviar prompts; verificação por prints.

**Respondido pelo usuário em 2026-10-19.**
1. Teto de tokens: não estipulado; manter funções gratuitas por ora, integrações pagas depois.
2. Datas: sem data.
3. Modo silencioso: aceito, chamado "meditar".
4. Uso: só do Thomáz por ora.

**Consequência.** As falas do modelo (falhas e resumo de fim de turno) e o calendário via Claude saem das fases A a C e viram evolução futura. Nas fases A a C, o resumo de fim de turno e o aviso de falha usam frases montadas a partir dos dados do evento, sem o modelo.

**Perguntas abertas.** Nenhuma.
