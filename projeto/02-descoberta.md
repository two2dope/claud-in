# Descoberta — claudin-mod

## Perguntas 5W1H (priorizadas)
1. Por quê: o que "aperfeiçoar" significa? → menos Tamagotchi, mais JARVIS.
2. O quê: em que situações ele toma a iniciativa? → 5 gatilhos.
3. Como: quem escreve as falas? → mistura (fixas + modelo em falhas e fim de turno).
4. Onde: faixa sobre o prompt, painel lateral ou ambos? → ambos, painel só por botão.
5. O quê mais: o que cabe na "cartola"? → atalhos de prompt, ações rápidas, ajustes do Claudin, lembretes/timers, canivete de comandos "/".

## Respostas de stakeholders (Thomáz)
- Tom sóbrio e proativo, sem "Senhor". Visual pixel-art mantido por ora.
- Fundo da janela do Claudin transparente ou na cor do chat.
- Hover só com botões e menus; texto só no balão; a janela não pode crescer sozinha.
- Caixa de ferramentas estilo cartola do Gato Félix, com canivete suíço de comandos "/".
- Lembretes e timers incluindo calendário, tarefas agendadas, prazos e datas importantes.

## Plano de pesquisa (método, por quê, como, quando)
- Teste de uso no app: o usuário usa e relata com print (a única forma de ver a tela do app).
- Leitura da API do mod: `$.command.list`, `$.prompt.submit/fill/suggest`, `$.model.complete`, `$.clock`, `$.store` existem nas tipagens desta versão.

## Achados (coluna L do KWHL)
- A faixa cinza é do app: o mod não a torna transparente, só pinta o interior.
- O mod não flutua livre pela tela: vive na faixa acima do prompt ou em painel.
- Calendário e tarefas agendadas: o mod não os lê direto; pede ao Claude via `$.prompt.submit` (gasta um turno).

## Premissas validadas e invalidadas
- Validada: hooks, toasts, faixa e painel funcionam no desktop.
- Invalidada: "janela transparente" como o app a desenha.
- A testar: PNG dentro de SVG como sprite; hover sem crescimento da janela.
