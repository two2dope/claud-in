# Ideação — claudin-mod

## Pergunta HMW alvo
Como nós poderíamos fazer o Claudin informar e antecipar o que o Thomáz precisa, sem poluir o chat e sem ocupar espaço fixo, com acesso rápido às ferramentas do dia a dia?

## Técnica(s) usada(s) e por quê
- **SCAMPER** sobre o Claudin v0.1: já existe um produto para transformar.
- **Crazy 8s em texto** para a caixa de ferramentas (interface): 8 formas de a cartola abrir, sem esboço em papel.
- Os painéis de pulls da etapa 4 foram o ponto de partida.
- Sem grupo: as ideias abaixo são minhas, em volume e sem filtro. Você acrescenta as suas. Nenhuma ideia foi julgada; isso é a etapa 6.

## Ideias brutas (numeradas, sem filtro)

### SCAMPER
1. Substituir o balão de texto por um balão que vira "digitando…" enquanto pensa.
2. Substituir o passeio aleatório por passeio guiado pelo evento: ele anda até o lado da faixa onde a ação "acontece".
3. Combinar o botão "ver tools" com o histórico: um só menu "atividade".
4. Combinar timers com o status do turno: "faltam 40 s para o lembrete; tarefa em curso".
5. Adaptar o semáforo de cockpit: o balão muda de borda (cinza, âmbar, vermelha) por severidade.
6. Adaptar a ideia de "Não perturbe": meditar tem a pose de olhos fechados e um "zzz".
7. Modificar o tamanho: o Claudin encolhe quando ocioso e cresce ao falar.
8. Modificar a frequência: quanto mais você ignora as sugestões, menos ele sugere.
9. Propor outro uso: ele vira o "cronômetro de turno" (quanto tempo o Claude está trabalhando).
10. Propor outro uso: ele mostra o diff resumido do último arquivo editado ("+12 −3 em foo.ts").
11. Eliminar o botão ×; esconder vira "meditar".
12. Eliminar o texto do balão em ações repetidas: só um ícone (lupa, lápis).
13. Reorganizar: o balão fica acima da cabeça na faixa e ao lado no painel.
14. Inverter: em vez de ele reagir, ele pergunta "quer que eu rode os testes?" quando você edita código.

### Proatividade
15. Falha: "Falhou por permissão em foo.ts. [Tentar de novo] [Ver erro]".
16. Demora: após 30 s, "Ainda rodando python (40 s). [Esperar] [Parar]".
17. Risco: antes de `rm`, `git push --force` ou `drop`, balão âmbar com "Isso apaga arquivos. Confirma?".
18. Fim de turno: "Editei 3 arquivos, 1 teste falhou. [Ver] [Rodar de novo]".
19. Ocioso: após 10 min, "Quer retomar o que ficou pendente? [Ver pendências]".
20. Ocioso: dicas aleatórias do app ("Sabia que dá para usar /compact?").
21. Detectar o mesmo erro 3 vezes e avisar "Estamos em loop. Quer tentar outro caminho?".
22. Avisar quando o contexto está quase cheio: "Contexto a 85%. [Compactar]".
23. Saudação de manhã com os prazos do dia (quando houver cadastrados).
24. Comemorar commits e testes que passam com a pose `ok`.

### Caixa de ferramentas (Crazy 8s)
25. Cartola de verdade: um desenho pixel-art de cartola ao lado dele; clique abre o menu com objetos saindo, um por vez.
26. Menu radial em círculo ao redor do Claudin.
27. Gaveta: as ações descem como uma gaveta debaixo da faixa.
28. Bolsa do Doraemon: o menu tem abas por tema (Prompts, Comandos, Ajustes, Tempo).
29. Canivete suíço: ferramentas abrem como lâminas em leque; cada lâmina é uma categoria.
30. Busca: digite e a cartola filtra tudo (comandos "/", atalhos, lembretes) como um launcher.
31. Cartola com histórico: "últimas 5 ações usadas" no topo.
32. Cartola que aprende: sobe as ações mais usadas.

### Atalhos de prompt e ações rápidas
33. "Resuma o que fez" envia o prompt pronto.
34. "Explique este erro" coloca o último erro no prompt.
35. "Rode os testes" com o comando detectado do projeto.
36. Copiar o último comando Bash executado.
37. Abrir a pasta do projeto no Explorer.
38. Copiar o caminho do último arquivo editado.
39. Lista editável de atalhos de prompt pelo próprio usuário.
40. Canivete de comandos "/": lista de `$.command.list` com busca e favoritos.

### Lembretes, timers e datas
41. Timer rápido: "10 min", "25 min (pomodoro)" com o Claudin segurando um relógio de pixel.
42. Cadastro de prazos: "Entrega do PNAB em 2026-11-05" com contagem regressiva.
43. Datas importantes com ícone (aniversário, entrega, prova).
44. Lembrete recorrente (todo dia 9h: "Revisar tarefas").
45. Prazo se aproximando muda a pose do Claudin (olhando o relógio).
46. Lembretes guardados entre sessões e mostrados na saudação.
47. Importar eventos do calendário pedindo ao Claude (evolução futura, gasta tokens).
48. Lembretes de tarefas agendadas do Claude (evolução futura).

### Visual e tom
49. Fala curta: fato + ação, sem "por favor" nem "Senhor".
50. Pose nova para cada gatilho: `waiting` (relógio), `alert` (antenas eretas), `sleep` (meditar).
51. Olhos que seguem o mouse (se a API permitir; investigar).
52. Rastro de pixels ao andar.
53. Sons curtos e discretos por evento (opcional, `$.audio`).
54. Tema claro/escuro com a mesma paleta coral.
55. Balão com fonte bitmap e borda pixelada.
56. Fundo da faixa na cor do chat (tentativa de efeito "transparente").

## Clusters temáticos
- **A. Presença e vida** (1, 2, 6, 7, 13, 50, 51, 52, 54, 55, 56)
- **B. Atividade de fundo no balão** (3, 5, 9, 10, 12, 16, 22, 21)
- **C. Proatividade** (8, 14, 15, 17, 18, 19, 20, 21, 23, 24, 49)
- **D. Caixa de ferramentas: forma** (25 a 32)
- **E. Atalhos e comandos** (33 a 40)
- **F. Tempo: timers, prazos, lembretes** (4, 41 a 48)
- **G. Silêncio e controle** (6, 8, 11)
- **H. Evolução futura (custa tokens ou integração)** (47, 48)
