# Priorização — claudin-mod

Critérios: **impacto** = valor para o Thomáz e alinhamento ao brief aprovado. **Esforço** = tempo, complexidade e incerteza técnica, incluindo o esforço oculto de testar sem ver a tela (só por print). Regra do brief: zero tokens extras, então o que usa o modelo sai do escopo atual.

## Ideias novas desta rodada
- 57. **Modo "café"** [interpretação minha, confirmar]: proatividade alta, o Claudin acordado, com a xícara de pixels, sugerindo mais e puxando assunto ocioso.
- 58. **Modo "cigarro"** [interpretação minha, confirmar]: pausa curta e temporizada ("volto em 10 min"), com o cigarro de pixels e o Claudin de costas, silêncio até o fim. É diferente do "meditar", que fica em silêncio indefinido.
- Com o 6 (meditar), forma o **seletor de proatividade com 3 modos**: meditar, normal, café.

## Matriz (ideia, impacto, esforço, quadrante)
| Ideia | Impacto | Esforço | Quadrante |
|---|---|---|---|
| 15 Falha com próximo passo | alto | baixo | Quick Win |
| 16 Aviso de demora | alto | baixo | Quick Win |
| 18 Resumo de fim de turno (sem modelo) | alto | baixo | Quick Win |
| 17 Alerta de ação arriscada | alto | médio | Quick Win |
| 6, 57, 58 Modos meditar, café, cigarro | alto | baixo | Quick Win |
| 5 Borda do balão por severidade | médio | baixo | Quick Win |
| 12 Ícone em vez de texto em ações repetidas | médio | baixo | Quick Win |
| 49 Tom curto, fato e ação | alto | baixo | Quick Win |
| 56 Fundo na cor do chat | médio | baixo | Quick Win (com ressalva: só dentro da faixa) |
| 33–39 Atalhos de prompt e ações rápidas | alto | baixo | Quick Win |
| 41 Timers rápidos e pomodoro | alto | baixo | Quick Win |
| 24 Pose `ok` ao passar teste ou commit | médio | baixo | Quick Win |
| 40 Canivete de comandos "/" | alto | médio | Major Project |
| 28/29/30 Cartola: abas, leque e busca | alto | alto | Major Project |
| 31/32 Cartola com histórico e "mais usadas" | médio | médio | Major Project |
| 42–46 Prazos e datas guardados entre sessões | alto | médio | Major Project |
| 14 Pergunta proativa ao editar código | médio | alto | Major Project |
| 21 Detectar erro repetido | médio | médio | Major Project |
| 22 Aviso de contexto cheio | médio | alto (depende da API) | Major Project |
| 19 Ocioso retoma pendências | médio | médio | Major Project |
| 50 Poses novas (`waiting`, `alert`, `sleep`) | médio | médio (sprites do usuário) | Major Project |
| 2 Passeio guiado pelo evento | baixo | médio | Fill-in |
| 7 Encolhe ocioso | baixo | médio | Fill-in |
| 9 Cronômetro de turno | médio | baixo | Fill-in |
| 10 Diff resumido do último arquivo | médio | médio | Fill-in |
| 13, 52, 53, 54, 55, 1, 4, 20, 23, 25 | baixo a médio | baixo a médio | Fill-ins |
| 51 Olhos expressivos (sem seguir o mouse) | médio | médio | Mantida por decisão do usuário |
| 26 Menu radial, 27 gaveta | baixo | alto (sem primitiva de UI) | Time Waster |
| 47, 48 Calendário e tarefas do Claude | alto | alto + tokens | Fora do escopo, evolução futura |

## Escolhidas (com PPCo)

### Fase A: aprimorar o que existe (Quick Wins)
Modos meditar/café/cigarro, falhas com próximo passo, aviso de demora, resumo de fim de turno, alerta de risco, borda por severidade, tom curto, fundo na cor do chat.
- **Pluses:** entrega rápida, sem gasto de tokens, resolve o "Tamagotchi" e o ruído.
- **Potentials:** vira a base de proatividade das próximas fases.
- **Concerns:** "Como evitar que ele fale demais?"; "Como fazer o alerta de risco sem falsos positivos?"
- **Overcome:** os 3 modos e o botão de silêncio; lista curta e editável de comandos de risco.

### Fase B: cartola e canivete (Major Projects + Quick Wins)
Cartola com abas (Prompts, Comandos "/", Ajustes, Tempo) e busca; atalhos de prompt e ações rápidas; canivete de comandos "/" via `$.command.list`; "mais usadas" no topo.
- **Pluses:** é a visão do Gato Félix; um ponto único de acesso.
- **Potentials:** cresce com novas ações sem mudar o desenho.
- **Concerns:** "Como abrir o menu sem a janela crescer?"; "Como executar um comando '/' a partir do mod?"
- **Overcome:** menu com altura fixa e rolagem; usar `$.prompt.fill` com o texto do comando e deixar você enviar.

### Fase C: tempo (Quick Win + Major Project)
Timers e pomodoro; prazos e datas guardados entre sessões com contagem regressiva; lembretes recorrentes; saudação com os prazos do dia.
- **Pluses:** utilidade diária, sem tokens.
- **Potentials:** base para ligar o calendário no futuro.
- **Concerns:** "Como disparar lembrete se o app estiver fechado?"; "Como cadastrar sem formulário?"
- **Overcome:** avisar que lembretes só disparam com o app aberto; cadastro por campo de texto simples ("prazo 2026-11-05 entrega PNAB").

## Descartadas e motivo
- Menu radial e gaveta (26, 27): o app não tem a primitiva de UI; as abas da cartola (28) cumprem o mesmo papel com altura fixa.

## Mantida a pedido do usuário (2026-10-19)
- **51 Olhos expressivos** (era "olhos que seguem o mouse"): o mod não recebe a posição do mouse (não há evento de movimento na API). Mantemos a ideia como **olhos que olham para onde a ação acontece**: para o lado em que ele anda, para cima ao falar no balão, para a cartola ao abri-la, piscadas, e olhos de lado ao ficar entediado. Impacto médio, esforço médio (variações de sprite). Entra na Fase A como item de acabamento, depois dos Quick Wins.
- Calendário e tarefas agendadas do Claude (47, 48): gastam tokens; evolução futura aprovada no brief.
- Fill-ins ficam para depois, sem prazo.

## Crítica Black Hat
- **Proatividade:** pode virar ruído e treinar você a ignorar o balão. Sem teste de uso real, os limiares (30 s de demora, 10 min ocioso) são palpite.
- **Alerta de risco:** uma lista de comandos perigosos nunca é completa; dá falsa sensação de segurança. Não substitui as permissões do app.
- **Cartola:** o maior risco é a janela crescer ou ficar cortada no painel estreito, como já aconteceu duas vezes. Cada fase precisa de teste por print.
- **Fundo na cor do chat:** a borda da faixa continua cinza e a cor depende do tema.
- **Lembretes:** só funcionam com o app aberto; o usuário pode achar que o aviso virá de qualquer forma.
- **Verificação:** sem acesso à tela, tudo depende de prints seus. O ritmo será mais lento que o esforço sugere.
- **Modos café e cigarro:** dependem da minha interpretação; podem não ser o que você quis.
