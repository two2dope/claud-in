# Log — claudin-mod

## 2026-10-19
Status: plano aprovado por Thomáz; dossiê na etapa 8. Passo A1 do roadmap implementado e validado (`claude plugin validate`): seletor de modo no hover ("modo: normal → café → cigarro → meditar"). Café mostra xícara com vapor. Cigarro mostra cigarro e fumaça, pausa de 10 min e volta sozinho. Meditar mostra olhos fechados e "z". Em cigarro e meditar o Claudin só fala de erro; o resto vai ao histórico. Não testado na tela. Falta o print do usuário. Próximo: A2 (gatilhos de falha, demora, fim de turno e risco).
Riscos: criados hoje; revisão inicial feita em 2026-10-19. Nada mudou.
Decisões: modos meditar, café e cigarro confirmados; olhos expressivos mantidos e ligados à cartola.
Variação: sem datas no plano, sem desvio a medir.
Carga: 1 passo concluído de 14; sem sobrecarga.

## 2026-10-19 (A1 aprovado, A2 implementado)
Status: A1 aprovado por print do usuário ("perfeito, amei"). A2 implementado e validado, sem teste na tela: falha com botão "investigar" (preenche o prompt, não envia), aviso de demora após 30 s, resumo de fim de turno ("Pronto: 2 arquivos editados, 3 comandos.") com botão "rodar testes" ou "investigar falhas", alerta de ação arriscada (pose com "!", balão amarelo, atravessa o silêncio dos modos). Próximo: A3 (borda por severidade, tom, fundo).
Riscos: alerta de risco usa regex curta e só avisa, não bloqueia; o risco "falso positivo" segue ativo.
Decisões: ação sugerida só preenche o prompt; o usuário decide enviar (zero tokens sem consentimento).
Variação: sem datas.
Carga: 2 passos de 14.

## 2026-10-19 (A2 testado, A3 implementado)
Status: A2 confirmado por prints: resumo de fim de turno ("Pronto: 1 comando, 1 falha." com botão "investigar falhas") e alerta de risco (balão amarelo e "!") funcionaram. Aviso de demora (30 s) ainda sem teste. Observação: o alerta cortou o comando no meio ("rm -rf … && echo…"); vale mostrar só o trecho de risco. A3 implementado e validado, sem print: borda do balão por severidade (erro, aviso, sucesso, discreta), tom das falas revisado (curto, sem exclamação infantil), botão "fundo" no hover que alterna 4 tons para achar o que casa com o chat. Próximo: A4 (olhos expressivos), depois M1.
Riscos: o fundo na cor do chat depende do tema e só cobre a área do Claudin, não a borda da faixa.
Decisões: calibrar o fundo por escolha visual do usuário, sem adivinhar a cor.
Variação: sem datas.
Carga: 3 passos de 14.

## 2026-10-19 (B1 antecipado)
Status: pelos prints, fundo "padrão" é melhor (a faixa tem borda): botão e código de fundo removidos. Painel lateral falhava por `hover` em Box já visível: corrigido. Mascote reduzido para 44×33 com botão de tamanho. Hover com muitos botões que andavam junto com o Claudin foi substituído pela **caixa de ferramentas** (🧰), fixa à direita da faixa: clique abre menu com categorias Prompts (3 atalhos), Comandos "/" (B3), Ajustes (modo, tamanho, tools, histórico, afagar, lateral) e Tempo (Fase C). Altura fixa. Botão × removido (meditar é o modo silencioso). Sem teste na tela.
Riscos: a linha de resumo do app ("Pesquisou código, executou…") não vem de um componente que o mod controle; não deu para esconder. Registrar como limite.
Decisões: fundo padrão; B1 antecipado por pedido do usuário; menu com altura fixa para a janela não crescer.
Variação: B1 saiu antes de A4 (olhos). Ordem ajustada por pedido do usuário.
Carga: 4 passos de 14.

## 2026-10-19 (testes e caixa fixa)
Status: o mod não tinha testes; escrevi `tests/claudin.test.tsx` (3 testes: balão e caixa em terminal e desktop, abertura das categorias, botão de modo) e `claude plugin test` deu 3 de 3. Caixa 🧰 agora absoluta no canto superior direito da faixa, largura fixa de 44, altura fixa de 8, sem rolagem (a API não tem rolagem interna; conteúdo curto por categoria). Sem print.
Riscos: cobertura de teste baixa (não cobre gatilhos, alerta de risco nem timers); o canto é o da faixa, não o da janela do app.
Carga: 4 passos de 14.

## 2026-10-19 (B2 implementado)
Status: print confirmou caixa e painel lateral bons; bug: na lateral a 🧰 aparecia à esquerda (corrigido: alinhada à direita). Ícone 🧰 sem texto e ✕ ao abrir, margem entre ícone e menu, menu com altura 10. B2 implementado e validado, 3 testes passam, sem print: categoria **Ações** (copiar último comando, copiar caminho do último arquivo, abrir pasta do projeto) e **Prompts** com 4 atalhos padrão + atalhos do usuário em `shortcuts.json` na pasta do mod (até 12). Próximo: B3 (canivete de comandos "/").
Riscos: "abrir pasta" usa `explorer.exe` (Windows) e abre a pasta da sessão, que aqui é a pasta temporária do app; `shortcuts.json` inválido é ignorado em silêncio.
Carga: 5 passos de 14.

## 2026-10-19 (padronização do menu)
Status: print aprovou a grade de Prompts; pedido: abas misturadas com o conteúdo e diagramação diferente por categoria. Implementado e validado, 3 testes passam, sem print: abas em grade de 3 colunas (aba ativa em destaque primário), divisória, e conteúdo de todas as categorias na mesma grade de 2 colunas; rótulos de Ações encurtados ("copiar comando", "copiar caminho", "abrir pasta").
Incidente: uma edição minha por script apagou um trecho do `register.tsx` (achou um `const body =` antigo no sprite). Validação e testes falharam; restaurei o trecho a partir do que já estava escrito e validação e testes voltaram a passar. Lição: não editar por índice de texto genérico; sem git, fazer cópia antes de edições grandes.
Riscos: sem controle de versão no mod; a restauração foi por reescrita e pode ter diferenças mínimas (ex.: o piscar dos olhos foi refatorado em uma variável, mesmo comportamento).
Carga: 5 passos de 14 + ajustes.

## 2026-10-19 (cópia de trabalho, link e menu estilo mIRC)
Status: cópia de trabalho criada em `AI Develop/claudin-mod` (inclui `projeto/` com dossiê e artefatos). Integração por **link**: a pasta em `.claude/dev-mods/.../claudin` agora é uma junction apontando para a cópia; o original foi movido para `.claude/dev-mods-backup/claudin-2026-10-19`. Edições na cópia recarregam sozinhas. Menu da caixa refeito em estilo mIRC: título, barra de menus em texto (▸ na ativa), divisória e lista vertical de uma coluna com separadores; até 9 linhas; altura 15. Validação ok e 3 testes passam; sem print.
Riscos: se a junction for apagada ou a pasta movida, o mod some da tela; o backup guarda a última versão anterior ao link. A partir daqui, o dossiê vive em `AI Develop/claudin-mod/projeto/`; a cópia em `scratch` não é mais atualizada.
Decisões: link como forma de integração; backup do `register.tsx` anterior em `projeto/backups/`.

## 2026-10-19 (paginação)
Status: print mostrou a barra de menus cortada ("Tempo" virou "Tem"), lista longa em rolagem e divisória quebrando em duas linhas. Corrigido e validado, 4 testes passam, sem print: caixa mais larga (50), divisória menor, lista paginada em 5 itens com ‹ anterior, n/total e próxima ›, página volta a 1 ao trocar de categoria, altura 12. Backup anterior em `projeto/backups/register-antes-paginacao.tsx`.

## 2026-10-19 (sem rolagem na faixa)
Status: print mostrou menu com borda inferior cortada e rolagem na faixa: o menu (altura 12 + espaço do ícone) e a altura mínima da faixa (17) passavam do que a faixa comporta (~13). Ajuste: altura mínima 13, menu com altura 10 e sem espaço vertical interno, 4 itens por página. Validado, 4 testes passam, sem print. Backup: `projeto/backups/register-antes-sem-rolagem.tsx`.
Riscos: as alturas foram estimadas pelos prints (uma linha ≈ 19 px); em outra janela ou fonte a faixa pode comportar menos.

## 2026-10-19 (B3 implementado)
Status: canivete de comandos "/" na aba Comandos: lista de `$.command.list()` (internos, de plugins e de MCP, até 400), caixa de busca (filtra por nome e descrição), 3 por página, favoritos (★/☆) guardados entre sessões em `$.store` e mostrados primeiro. Clicar num comando, ou Enter na busca, preenche o prompt com `/comando ` sem enviar. Validado, 5 testes passam, sem print. Backup: `projeto/backups/register-antes-b3.tsx`.
Riscos: o campo de busca depende de o desenho do app aceitar Input na faixa; a altura do menu com busca (1 linha a mais) pode voltar a cortar; a lista é lida ao abrir a aba, comandos novos exigem reabri-la.
Carga: B3 concluído (8 de 14 passos).

## 2026-10-19 (favoritos iniciais)
Status: favoritos iniciais definidos pelo uso real: contei (só totais, sem ler conteúdo) os comandos "/" digitados e as chamadas da ferramenta Skill nas transcrições locais. Mais usados: frontend-design (7), brainstorming (6), doc-coauthoring (5), estudio-trilha (4), writing-plans (4), nano-banana (4), smart-start (3), slideshow-maker (3). Gravados em `favorites-seed.json`; aplicados uma única vez na primeira carga (flag `favsSeeded` no store) e depois só você muda pela ★. Validado, 5 testes passam, sem print.
Riscos: os nomes precisam bater com os da lista de comandos; um nome diferente não aparece como favorito. O histórico é curto (poucas dezenas de usos), então a ordem é aproximada.

## 2026-10-19 (duplicatas e favoritos)
Status: print aprovou o canivete. Skills do usuário apareciam duplicadas (/nome e /pacote:nome). Agora o canivete agrupa por nome-base e descrição e mostra só a forma mais curta; comandos com mesmo nome-base mas descrição diferente continuam separados. Favoritos casam por nome-base (★ vale para as duas formas) e a lista mostra os favoritos primeiro, na ordem em que foram marcados (a ordem de uso da semente). Novo teste de duplicatas; 6 testes. Backup: `projeto/backups/register-antes-dedup.tsx`.
Riscos: se duas skills diferentes tiverem o mesmo nome-base e a mesma descrição, uma some da lista.

## 2026-10-19 (M2 fechado)
Status: **M2 concluído** (Fase B). Entregue e confirmado por print: caixa 🧰 fixa à direita da faixa; menu estilo mIRC com abas, divisória e lista paginada (4 itens, 3 nos comandos), sem rolagem; Prompts com 4 atalhos padrão e os do `shortcuts.json`; Ações (copiar comando, copiar caminho, abrir pasta); canivete de comandos "/" com busca, favoritos (★) guardados entre sessões, 8 favoritos iniciais pelo uso real, e lista sem duplicatas. 6 testes passam. Pendentes: olhos expressivos (A4) e Fase C.
Riscos: revisados em 2026-10-19, nenhum gatilho disparou além do já tratado (faixa cortando o menu, resolvida). Novo: skills em duas origens (local e sincronizada) geram nomes diferentes; duas duplicadas de verdade (gauntlet-loop e gauntlet-model-router, conteúdo igual, só muda a quebra de linha).
Decisões: duplicatas tratadas na lista do canivete; remoção das cópias locais aguarda o usuário.
Variação: B1 e B2 antecipados antes de A4, a pedido do usuário; roadmap sem datas.
Carga: 8 de 14 passos do roadmap, mais ajustes.

## 2026-10-19 (cópias de skills e A4)
Status: movi `gauntlet-loop` e `gauntlet-model-router` de `~/.claude/skills/` para `~/.claude/skills-backup/2026-10-19/` (as versões sincronizadas continuam). A4 implementado e validado, 6 testes passam, sem print: olhos com esclera clara e pupila que muda de lugar: para onde anda quando parado; para a direita (a cartola) com a caixa aberta; para cima ao pensar; para baixo ao codar e rodar comando; varrendo de lado ao ler e buscar; centrados em erro e alerta; piscam quando parados. Backup: `backups/register-antes-olhos.tsx`.
Riscos: o visual dos olhos mudou (de quadrados escuros para esclera com pupila); sprites próprios do usuário não são afetados. Falta o olhar de "entediado" (olhar de lado após muito tempo parado), deixado de fora por depender de contador de ociosidade.
Carga: A4 concluído (9 de 14 passos).

## 2026-10-19 (ajustes de modos)
Status: print aprovou a A4 (olhos). Pedidos: café com olhos maiores e pupilas dilatadas; meditar com cogumelo no lugar do "z"; novo modo thug life com óculos escuros. Implementado e validado, 7 testes passam, sem print. Café: olhos 3x3 com pupila 2x2 e brilho; meditar: cogumelo pixel vermelho com pintas acima da cabeça; thug life: óculos pretos com ponte, hastes e brilho, fala "Thug life. Sem pressa, sem drama."; o modo entra como 5º do ciclo (normal, café, cigarro, meditar, thug life) e se comporta como o normal. Backup: `projeto/backups/register-antes-modos2.tsx`.
Riscos: óculos escuros escondem a direção do olhar (A4) nesse modo.

## 2026-10-19 (M1 fechado, C1 implementado)
Status: **M1 concluído** (Fase A): modos meditar, café, cigarro e thug life aprovados por print; gatilhos de falha, fim de turno e risco confirmados; borda por severidade, tom revisado, olhos expressivos. Fundo "cor do chat" descartado por decisão do usuário (fundo padrão). Pendente de teste em tela: aviso de demora (30 s). **C1 implementado** (validado, 8 testes passam, sem print): aba Tempo com timer 5 min, timer 10 min, pomodoro 25 min, pausa 5 min e parar todos. Timers guardados em `$.store` com o instante de término (sobrevivem a recarregamento do mod), tempo restante (mm:ss) na aba, aviso ao vencer com pose de alerta (atravessa os modos silenciosos, é pedido do usuário); pomodoro inicia sozinho a pausa de 5 min. Backup: `backups/register-antes-timers.tsx`.
Riscos: revisados em 2026-10-19; o relógio avança a cada 1,5 s, então o aviso pode atrasar até ~2 s; timers só disparam com o app aberto (já anotado); o aviso é só visual no balão, sem som nem notificação do sistema.
Decisões: timers por clique (sem digitar tempo); prazos e lembretes recorrentes ficam em C2 e C3.
Carga: 10 de 14 passos do roadmap.

## 2026-10-19 (C1 refinado: som, contagem no balão, tomate)
Status: print aprovou os timers (início, contagem na aba, aviso ao vencer). Pedidos feitos, validados, 8 testes passam, sem print: (1) aviso sonoro: `sounds/timer.wav` (acorde de 3 notas, 0,7 s, gerado por script) tocado com o SoundPlayer do PowerShell, porque a API `$.audio.play` não toca no Windows; testei o comando no terminal e ele tocou sem erro; (2) contagem regressiva também no balão do Claudin, sob a fala, enquanto houver timer ativo; (3) pomodoro com tomatinho SVG animado em loop (corpo achata e alarga, folhas descem, garras de espremer, suco pinga) no lugar do relógio: na contagem do balão, no aviso de fim e na aba Tempo. Texto "Timer de timer 5 min" corrigido para "Timer 5 min iniciado.". Backup: `backups/register-antes-tomate-som.tsx`.
Riscos: o som depende de o app deixar o mod rodar `powershell.exe` e de o Windows ter saída de áudio; se falhar, cai em silêncio (erro engolido). Uma edição minha gerou por engano uma barra invertida inválida no código; a validação passou por acaso, achei ao revisar e corrigi (lição: revisar o texto gerado, não só a validação).
Carga: C1 completo (10 de 14 passos).

## 2026-10-19 (cancelar e reiniciar timer)
Status: faltavam controles por timer (só havia "parar todos", escondido na 2ª página). Agora cada timer ativo, no balão e na aba Tempo, tem **↻ reiniciar** (volta à duração original) e **✕ cancelar**. Timers guardam a duração (`ms`); os criados antes desta versão leem os minutos do rótulo. Teste novo cobre reiniciar e cancelar; 9 testes passam, sem print. Backup: `backups/register-antes-cancelar-timer.tsx`.
Riscos: cancelar um pomodoro não inicia a pausa; reiniciar não toca nem avisa nada além do balão.

## 2026-10-19 (pausar timer, tomate sem garras)
Status: print aprovou tomate, reiniciar e cancelar. Pedidos feitos, validados, 10 testes passam, sem print: (1) tomate sem as garras brancas, ficam corpo achatando, folhas e suco; (2) **⏸ pausar / ▶ retomar** por timer, no balão e na aba Tempo; o timer pausado guarda o tempo que falta, mostra "(pausado)" em cinza e não dispara; ao retomar, o término é recalculado a partir de agora. Timers ganharam `id` estável (os antigos usam o término como id). Backup: `backups/register-antes-pausa.tsx`.
Riscos: timer pausado e esquecido fica guardado entre sessões sem avisar; um timer pausado não aparece primeiro no balão (o ativo tem prioridade).
Carga: C1 completo; próximo C2 (prazos e datas).

## 2026-10-19 (C2: prazos e datas)
Status: print aprovou pausar e retomar. C2 implementado, validado, 11 testes passam, sem print: nova aba **Prazos** no menu (a aba "Comandos /" virou "Comandos" e a caixa ficou com largura 56 para caberem 6 abas). Campo de texto aceita `05/11 título` (próxima ocorrência), `05/11/2026 título`, `2026-11-05 título`, `hoje título` e `amanhã título`; data inválida avisa no balão. Lista ordenada por data com contagem (`D-17`, `amanhã`, `hoje`, `atrasado 2d`), marcador 🟢 (mais de 3 dias), 🟡 (até 3 dias) e 🔴 (atrasado), 3 por página, ✕ para remover. Guardados em `$.store` entre sessões. Backup: `backups/register-antes-prazos.tsx`.
Riscos: a contagem usa o fuso do ambiente do mod, que pode diferir do seu (um dia de erro perto da meia-noite); só 6 abas cabem na barra na largura atual; a remoção não pede confirmação; o balão ainda não destaca prazos próximos (fica para C3, com a saudação).
Carga: 11 de 14 passos do roadmap.

## 2026-10-19 (C3: lembretes recorrentes e saudação)
Status: print aprovou a aba de prazos (amanhã 🟡 e D-17 🟢 no painel lateral, com mensagem "Prazo salvo"). C3 implementado, validado, 13 testes passam, sem print: a aba **Prazos** virou **Agenda** e o mesmo campo cria prazos ou **lembretes recorrentes**: `09:00 título` (todo dia), `seg-sex 18:00 título`, um dia da semana (`qua 9h título`) e `18h30`. Lembretes aparecem na lista como `🔁 09:00 todo dia · título`, com ✕ para remover. Disparo: uma vez por dia a partir da hora, com acorde e balão de alerta; se o app abrir depois da hora, ainda dispara no mesmo dia, com "(era 09:00)". **Saudação do dia** ao abrir o mod (uma vez por dia): atrasados, hoje, amanhã, lembretes de hoje e timers pausados, em tom "Bom dia/Boa tarde/Boa noite"; botão "saudação do dia" em Ajustes para repetir. Backup: `backups/register-antes-c3.tsx`.
Riscos: o disparo depende de o relógio do mod avançar (a cada 1,5 s) e do app aberto; o fuso do ambiente pode diferir do seu; a saudação não se repete no mesmo dia, então um dia reaberto não a mostra de novo; Ajustes agora tem 3 páginas; não há edição de lembrete, só remover e criar de novo.
Carga: 12 de 14 passos do roadmap; resta o marco M3 (teste de 1 semana) e M4 (revisão de riscos e fechamento).

## 2026-10-19 (C3 confirmado)
Status: prints confirmaram o C3: lembrete "22:37 todo dia · Banho" salvo e listado com 🔁, e a saudação "Boa noite. amanhã: pctd · 1 lembrete hoje." (botão em Ajustes, página 2 de 3). Ajuste: o texto de exemplo do campo era longo e cortava ("seg-sex …"); agora "05/11 prazo · 09:00 lembrete". Ainda sem confirmação do disparo do lembrete no horário (som e balão de alerta).
Riscos: o disparo no horário só será confirmado em uso real; os exemplos de formato (seg-sex, dia da semana) ficam fora do campo, só neste log.
Carga: C3 feito (12 de 14); faltam M3 (uma semana de uso) e M4 (revisão final de riscos).

## 2026-10-19 (M3 iniciado)
Status: usuário escolheu usar por uma semana e voltar com o que notar. **M3 em andamento**, de 2026-10-19 a 2026-10-26. Fase C completa e Fase A/B aprovadas por print. A confirmar em uso real: (1) lembrete disparando no horário (acorde e balão de alerta); (2) aviso de demora de 30 s numa tarefa longa; (3) alerta de ação arriscada fora do teste; (4) timers e prazos sobrevivendo a fechar e reabrir o app; (5) favoritos e lista de comandos; (6) menu sem corte nem rolagem em janelas pequenas; (7) o Claudin em modo silencioso (meditar e cigarro) só falando de erro e risco.
Riscos: revisão marcada para 2026-10-26 (cadência: a cada marco e depois de atualização do app). Gatilhos a observar: atualização do app que mude a faixa ou o painel; proatividade virando ruído; falso positivo do alerta de risco; lembrete que não dispara.
Decisões: sem novas funções durante o M3; só correções do que o uso revelar. Instalação definitiva pelo GitHub fica para depois do M4, se o usuário pedir.

## 2026-10-19 (carga padrão em novas sessões)
Status: a pedido do usuário, o mod passa a carregar por padrão em sessões novas. Acrescentei ao `~/.claude/settings.json` um bloco `env` com `CLAUDE_CODE_PLUGIN_DIRS` apontando para a pasta do mod; o resto do arquivo ficou idêntico (conferido contra o backup `~/.claude/settings.json.backup-claudin-2026-10-19`). Sem `CLAUDE_CODE_PLUGIN_DIR_WATCH`: o hot reload só entra quando o usuário pedir, por sessão. Vale para sessões novas; as já abertas não mudam.
Riscos: se a pasta `AI Develop\claudin-mod` for movida ou apagada, toda sessão nova perde o Claudin (e pode registrar erro de carga); uma sessão com hot reload ligado na pasta de dev-mods e o mesmo mod pela variável pode carregar duas vezes; para desfazer, remover o bloco `env` ou restaurar o backup.
Decisões: sem hot reload por padrão (uso de 7 dias, M3 até 2026-10-26).

## 2026-10-22 (tipos, /claudin e GitHub)
Status: corrigidos os 9 erros de tipo do `tsc` em `hooks/register.tsx`. Novo comando `/claudin` (sem argumento, `lateral`, `prompt`, `ocultar`) e brechas do painel fechadas: a faixa reaparece sozinha se o painel lateral não está de pé, fechar o painel pelo X devolve o Claudin à faixa, e um painel que não cabe cai para a faixa em vez de deixar o mascote invisível. `plugin.json` ganhou autoria "© 2026 two2Dope". Quatro testes novos; `claude plugin validate` sem avisos, `tsc` limpo e 17 testes passando. Projeto versionado em git e publicado em github.com/two2dope/claud-in, com README e banner (`assets/`).
Riscos: o `/claudin` foi testado só no harness de testes, não na janela do app; o mod recarrega ao fim do turno. Sem licença de código definida no repositório.
Decisões: `/claudin` entra como correção de brecha dentro do M3. Ficam fora do git: `projeto/backups/` (o histórico do git os substitui), os tipos gerados em `.claude-plugin/types/` e prints locais.

## 2026-10-22 (README ilustrado e proteção do repositório)
Status: README ganhou quatro ilustrações animadas em `assets/` (poses, modos, balões com as falas reais do mod e caixa de ferramentas), geradas por `assets/build-assets.mjs` a partir do sprite do mod. Não são capturas de tela. Repositório público fechado a alterações externas: limite de interação "só colaboradores" (vale até 2027-04-22), regra na `main` contra apagar a branch e contra force push, wiki e projetos desligados.
Riscos: o sprite do script é um port de `sprite()` em `hooks/register.tsx`; se o desenho mudar lá, precisa mudar no script. O limite de interação expira em seis meses e precisa ser renovado. Forks continuam permitidos pelo GitHub em repositório público, mas não podem abrir PR nem issue enquanto o limite valer.
Decisões: subtítulo do banner aguarda escolha do usuário.

## 2026-10-22 (propósito e identidade)
Status: README ganhou a seção "Por que ele existe" (assistente cognitivo para uma cabeça com TDAH, dificuldade por dificuldade, e os três princípios). Identidade do banner em exploração: três direções (caranguejo com cérebro, anda de lado, a muda) em rascunho fora do repositório, aguardando escolha. Subtítulo do banner segue o antigo.
Riscos: o README público passa a citar o TDAH do autor; decisão do usuário, reversível.
Decisões: o texto fala do TDAH como característica do jeito de pensar, não como defeito, e deixa claro que não é tratamento.

## 2026-10-22 (banner "Caranguejos com cérebro")
Status: direção de identidade escolhida por Thomáz: A + B, com a linha menor "Mil abas abertas não são bagunça. São caminho.", e C como seção do README. Banner refeito (`assets/build-banner.mjs`): título "Caranguejos com cérebro.", caranguejo andando de lado com rastro, cérebro vetorial animado nas antenas (duas metades, giros, brilho que muda de cor, pulsos de sinapse) e uma parabólica enfiada na lama transmitindo ondas psicodélicas, inspirada no manifesto Mangue Beat (Fred Zero Quatro, 1992). README ganhou "Caranguejos com cérebro" (homenagem, sem reproduzir o texto, com link e licença da Wikisource) e "Como ele cresceu", com `assets/muda.svg`.
Riscos: o banner usa SMIL e filtros SVG; renderizam em navegadores e no GitHub, mas não em todo leitor de imagem. A parte "cérebro e parabólica" é vetorial, fora da grade de pixels do mascote, de propósito.
Decisões: cores psicodélicas só no cérebro e no sinal; o resto do banner segue grafite e coral.
