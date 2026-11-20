# Changelog

## 0.8.1 — 2026-11-20

- **Ícones em vetor.** Os ícones do QG e da caixa de ferramentas foram redesenhados em vetor (`hooks/icones-vetor.ts`), no traço do globo de plasma: contorno escuro fino, degradê, brilho no alto e animações discretas (pontinhos do balão, ponteiro do cronômetro, dia marcado do calendário, caranguejo balançando, estrela da lua, sinal da antena, raios do globo). Ficam nítidos em qualquer tamanho e pesam menos que a pixel art; a conversão de pixel art (`hooks/icones-arte.ts`, `scripts/icones-para-svg.py`) saiu.
- **Fichas da caixa com ícone.** No painel lateral os emojis das abas, da antena e da caixa de ferramentas viraram ícones de 22 px com botão em branco por cima; a aba aberta mostra o nome. Na linha do prompt e no terminal continuam os emojis.
- **Ícones nos pontos novos do QG.** Cola em cima das pastas, Ajustes nas gavetas da bancada, a luz no quadro da lua (que brilha com a luz apagada), o neon num globo de plasma ao lado da terceira cadeira, o cadeado no centro do cofre, o calendário sobre os quadradinhos do canto, Ações na gaveta de baixo do servidor (o raio fica aceso, sem LEDs piscando ali) e a frota na porta da direita. Pontos quase na mesma vertical dividem uma coluna de cliques.
- **Claudin anda pela sala.** Com o QG ligado ele passeia pela faixa inteira, anda até o objeto clicado e fica um pouco por lá, e trabalhando vai até o canto da tarefa: monitores ao programar, prateleira ao ler, servidor ao rodar, cofre ao buscar, relógio no alerta.
- **Cigarro na boca.** No modo cigarro ele sai da altura da orelha e fica no canto da boca, com a fumaça na ponta.
- **Monitor de baixo** do painel subiu e não encosta mais no encosto das cadeiras.
- **Neon restrito:** nas prateleiras só entre as mãos-francesas, no rack uma tira a mais em cima (e nenhuma na gaveta do raio), e no piso só no assoalho do deck, sem passar pela rampa nem pelas margens do mangue.

## 0.8.0 — 2026-11-19

- **Ícones próprios do QG.** Os emojis saíram: placa de informação, livros, engrenagem, balão, lâmpada (lua com a luz apagada), globo místico, caranguejinho, cadeado, calendário e raio são pixel art gerada no Google Flow com a arte do QG como referência, convertida por `scripts/icones-para-svg.py` (fundo magenta recortado por preenchimento a partir da borda, 16x16, 7 cores) para `hooks/icones-arte.ts`.
- **Desenhados dentro da própria faixa.** Cada ícone faz parte da imagem do QG, no ponto marcado: não corta, não escorrega e não muda de lugar com a largura da janela. Por cima de cada um fica um botão em branco (como o do relógio, que já se provou clicável), que acende sob o ponteiro.
- **Engrenagem** no canto de baixo à esquerda do painel da bancada, abaixo do martelo. O relógio continua sem ícone: ele mesmo é o botão.
- **Neon mais brilhante:** tiras com halo maior e a sala com uma luz rosada clara por cima, em vez de escurecer.
- **Mais coisa no mesmo limite.** As animações repetidas (LEDs, linhas de código, neon e vaga-lumes) viraram classes CSS, e a faixa entra em camadas: se algo não couber nos 131072 caracteres, sai primeiro a vida do cenário, depois o neon; ícones, painel e relógio sempre entram. O pior caso (noite, luz apagada, neon, painel cheio) cabe com tudo.

## 0.7.8 — 2026-11-19

- **Os ícones não pulam mais com a janela.** Eles eram postos por célula inteira, e o arredondamento mudava conforme a largura. Agora cada ícone fica preso por porcentagem ao ponto marcado do objeto (uma âncora sem tamanho, com o ícone numa caixa de 3 células centrada nela), e a altura de uma linha entra na conta para centrar na vertical.
- **Ícones nas posições marcadas:** Sobre no meio da placa, luz no poste, Agenda no canto do calendário, ⚡ no alto do servidor; o 🔮 do neon em cima da ponta esquerda da mesa da direita, junto da coluna.
- **Dois pontos novos:** ⚙️ na bancada de ferramentas abre Ajustes; 💬 nos livros deitados da prateleira da direita abre os Prompts.
- **Relógio:** o ⏱ aparece acima do relógio quando o ponteiro passa pelo botão em branco sobre ele.
- **Neon refinado:** ciano sob as duas prateleiras, magenta na borda das bancadas com vãos onde ficam as cadeiras, e faixas horizontais ciano no rack (no lugar do contorno).
- **A lua saiu por ora:** o brilho cobria o desenho.
- **Cola:** a busca ganhou uma linha de folga antes da lista no painel lateral.

## 0.7.7 — 2026-11-19

- **Ícones inteiros.** A coluna de cada ícone passou de 3 para 4 células e fica centrada no ponto marcado: o botão do desktop precisa de folga além das 2 células do emoji, e cortava o 💡, o 🌙, o 🦀 e o ⚡.
- **Relógio limpo.** A "marca d'água" era o ⏱ apagado por cima dos ponteiros. Agora o botão do relógio é em branco e o ⏱ só aparece sob o ponteiro.
- **Cola um pouco à esquerda**, por cima do livro tombado.
- **Segundo interruptor: modo neon.** O 🔮 no segundo poste de madeira liga um tom roxo e tiras de neon ciano e magenta na prateleira, nas bancadas, no chão e em volta do rack, pulsando. A escolha fica guardada.
- **Painel em três monitores**, cada um com pouca coisa e a letra do maior tamanho que cabe: em cima o modelo e o contexto; no meio tokens, custo e os limites de 5 horas e 7 dias; embaixo agentes e comandos.
- **Vaga-lumes verdes de verdade.** Estavam por baixo da escuridão da noite; agora são desenhados por cima, com halo verde, piscando fora de compasso (dez caminhos), também de dia.
- **A lua só aparece no escuro** (à noite ou com a luz apagada), onde dá para vê-la, mais forte.

## 0.7.6 — 2026-11-19

- **O ícone é o botão.** As linhas de botão em branco que cobriam as zonas não respondiam no desktop e deixavam marcas (as reticências sobre o relógio, o cofre e o servidor): presas em colunas estreitas, encolhiam em `…`. Saíram todas: agora cada ponto do QG é um botão com o próprio ícone, numa coluna de largura fixa e desenhado por cima de tudo (o Claudin do QG deixou de ser um quadro interativo, que pegava o clique), posto exatamente onde foi marcado no print (Sobre na placa, Cola no canto dos livros, luz no poste, 🦀 no monitor de cima, cofre e servidor no meio, Agenda no canto do calendário, ⏱ no centro do relógio).
- **Luz e frota acesas.** O 💡 (🌙 com a luz apagada) e o 🦀 ficam acesos; os outros ícones ficam apagados e acendem sob o ponteiro (sempre clicáveis, também pelo teclado). Com agentes vivos, o monitor do 🦀 pulsa em coral.
- **Sem sombra de sobreposição.** O brilho de fundo das zonas saiu, junto com a marca deslocada do servidor; o relógio fica só com os ponteiros.
- **Mais vaga-lumes** piscando pelas raízes dos dois lados (oito caminhos).
- **Painel relido também no envio**, e as preferências por sessão não podem mais barrar o início da sessão.
- **A crew cresce junto.** As miniaturas dos agentes nas bancadas seguem o tamanho do Claudin, na mesma proporção de antes.
- **Conhecido:** o clique pelo ícone ainda precisa de conferência no desktop; sem LICENSE.

## 0.7.5 — 2026-11-19

- **Clique nas zonas, de novo.** Na 0.7.4 as linhas de botão levavam só um espaço, e o desktop desenha um rótulo só de espaço sem largura: o clique caía no vazio (só a luz e o relógio, finos, pegavam). Agora cada linha leva caracteres em branco que não são espaço (U+2800), em 70% da largura da zona.
- **Ícone no lugar certo.** O ícone do hover aparece no meio do objeto; a Cola, no canto de cima à direita dos livros; o 🦀 da frota, no monitor pequeno de cima à esquerda.
- **Zonas medidas na arte.** Servidor, relógio, cofre e calendário com as bordas tiradas da própria imagem.
- **Painel com tudo ao mesmo tempo.** Um monitor desenhado com moldura própria cobre as telas de cima e mostra três linhas juntas (modelo e contexto, tokens e custo, limites de 5 horas e 7 dias), com a barra do contexto embaixo. Agentes e comandos ficam na tela laranja do meio. As outras telas seguem com as linhas de código.
- **A lua acende de verdade.** Estava fora do lugar; agora brilha sobre a lua da prateleira, com halo e respiração.
- **Conhecido:** nada disso conferido no desktop; sem LICENSE.

## 0.7.4 — 2026-11-19

- **A zona inteira responde ao clique.** Um botão do desktop desenha uma linha só, e na 0.7.3 a zona tinha um único botão no meio (aparecia como `…`). Agora cada zona é uma pilha de linhas de botão que cobre o objeto todo.
- **Ícone no hover.** Ao passar o ponteiro, a zona acende e mostra o ícone do que ela abre (📚 Cola, 💡 luz, 🦀 frota, 🔐 Cofre, 📅 Agenda, ⚡ Ações, ⏱ Tempo), não o nome.
- **Sem travar.** O painel dos monitores lia o engine a cada redesenho (de 1,5 em 1,5 s); agora lê ao abrir o QG, ao enviar e no fim de cada turno.
- **Um monitor só, com letra maior.** As duas telas grandes de cima viram um painel que reveza páginas a cada 4 s: modelo e contexto, tokens e custo, limites de 5 horas e 7 dias, agentes e comandos.
- **O cenário ganhou vida.** Linhas de código crescendo nas outras telas, LEDs piscando no servidor, a lua da prateleira acesa e respirando, e bichinhos passeando pelas raízes do mangue (vaga-lumes à noite, mosquitinhos de dia). Tudo animado dentro da própria imagem, sem custo de redesenho.
- **Gadget escondido.** A placa de madeira à esquerda abre o Sobre: versão e links para o repositório, a página do projeto, as novidades e o legends-claude.
- **Abas só com ícone** também no painel lateral; a aba aberta mostra o ícone e o nome, na ficha coral.
- **O Claudin cresceu.** Os tamanhos sobem um degrau: o pequeno é o antigo médio, o médio é o antigo grande e o grande é novo (84x63).
- **Cada sessão lembra o seu Claudin.** Skin, tamanho e QG ligado ficam guardados por sessão: ao voltar para uma sessão, ele volta como estava (bom para usar uma cor por sessão). Uma sessão nova começa com a última escolha.
- **Conhecido:** nada disso conferido no desktop; sem LICENSE.

## 0.7.3 — 2026-11-19

- **As zonas do QG agora respondem ao clique.** Na 0.7.2 cada zona era uma camada do tamanho da imagem, e a de cima cobria as outras e engolia o clique. Agora elas ficam lado a lado numa camada só.
- **Sem marcação em repouso.** As zonas não têm borda nem rótulo: só acendem com um brilho quente e mostram o nome do objeto quando o ponteiro passa por cima.
- **Interruptor da luz.** A lanterna à esquerda dos monitores acende e apaga a luz da sala: à noite, apagada, a sala fica no escuro com só as telas brilhando; de dia, escurece um pouco. A escolha fica guardada.
- **Painel nos monitores.** As telas da parede mostram o modelo, a ocupação da janela de contexto, os tokens, o custo da sessão em dólares, os limites de 5 horas e 7 dias (quando a conta informa), os agentes vivos e os comandos do turno. Durante um turno, um cursor pisca na tela do contexto. Nada disso gasta token: vem de `$.session.usage()` e `$.session.model()`.
- **Zona do servidor ajustada** ao rack.
- **Caixa de ferramentas no estilo da ilustração.** No painel lateral, as abas viram fichas com o nome (a aberta em coral) e cada item ganha uma linha com fundo que clareia sob o ponteiro. Na linha do prompt, que é estreita, ela continua com os ícones.
- **Conhecido:** o esforço (effort) do modelo não aparece nos monitores, porque só chega a cada passo do modelo e ler esse fluxo pesaria em todo turno; nada disso foi conferido no desktop; sem LICENSE.

## 0.7.2 — 2026-11-19

- **Zonas clicáveis no lugar dos pinos.** Os objetos do QG viraram áreas de clique sobre a própria imagem: livros e pastas (Cola), monitores (frota), cofre (Cofre), calendário (Agenda), servidor (Ações, com a janela de contexto) e relógio (Tempo). Ao passar o ponteiro, a borda da zona acende e o nome do objeto aparece; o clique abre a aba.
- **O QG mora no painel lateral.** Na linha do prompt, a faixa e a caixa aberta empurravam a conversa para cima. Agora o 📡 na linha do prompt liga o QG e leva o Claudin para o painel lateral; no painel, o 📡 liga e desliga a faixa. Sem espaço para o painel, o Claudin avisa e a linha do prompt fica como está.
- **Botão do QG virou a antena parabólica 📡**, no lugar da ilha.
- **Relógio com ponteiros.** Sem pomodoro, o relógio de parede marca a hora do computador; com pomodoro, mostra a fatia vermelha do que falta.
- **Personagens destacados do fundo.** O Claudin e as miniaturas ganham contorno escuro e uma sombra leve dentro do QG, e a imagem ganha um véu escuro de 10%.
- **Luz das lanternas menor.** O raio da luz à noite caiu de 11% para 7% da largura, sem o domo grande no centro.
- **Correções da revisão de 0.6.0 a 0.7.1.** A máscara da luz noturna estava invertida (o centro da lanterna ficava escuro e a borda formava o domo claro); agora a luz abre a escuridão no meio. O fim do turno não pode mais ser barrado por uma falha no resumo ou no aviso de contexto. Turno interrompido ou leitura de contexto vazia não marcam mais o aviso como visto. O aviso "ainda rodando" é cancelado mesmo quando a ferramenta falha. A imagem do QG nunca passa do limite do motor nem quebra sem a tag de fechamento.
- **Conhecido:** as zonas, o destaque e o contorno ainda não foram conferidos no app desktop; sem LICENSE.

## 0.7.1 — 2026-11-19

- **O Claudin agora anda dentro do cenário.** Com a faixa do QG ligada (botão 🏝), o mascote fica em cima da imagem, no chão da cabana, andando por ela com a skin, o olhar e os modos de sempre. O balão passa para logo abaixo da faixa, com a seta para cima, apontando para ele. Sem a faixa nada muda.
- **Conhecido:** o visual no desktop do mascote dentro da faixa ainda não foi conferido; a luz da noite forma um domo grande no centro; sem LICENSE.

## 0.7.0 — 2026-11-19

- **QG do Claudin no Mangue (opcional).** O botão 🏝, ao lado da 🧰, liga uma faixa de pixel art acima do mascote: a base dos caranguejos com cérebro, numa cabana de palafita entre raízes de mangue. A faixa se ajusta à largura da janela, na linha acima do prompt e no painel lateral, e a escolha fica guardada. No terminal, que não desenha imagem, o botão não aparece.
- **Os objetos abrem as abas.** Cinco pinos sobre a imagem: as pastas abrem a Cola (a lista da oficina, se o `cola.json` estiver ligado), os monitores abrem a frota, o cofre abre a aba Cofre, o calendário abre a Agenda e o relógio de parede abre o Tempo. Sem o que abrir (frota vazia, cofre desligado), o Claudin só avisa.
- **A hora do dia vem do relógio do computador.** A faixa escurece no fim da tarde, fica de noite com as lanternas acesas (a luz recorta a escuridão e as telas brilham) e clareia de manhã, com tom quente no amanhecer e no entardecer.
- **O relógio de parede só mostra o pomodoro:** com um pomodoro rodando, uma fatia vermelha mostra o que falta; sem ele, o mostrador fica vazio.
- **As miniaturas da frota ficam nas bancadas da faixa** (até quatro), em vez de ao lado do mascote.
- **Tudo num único SVG** (a imagem, a luz e o relógio), com 24 cores e cerca de 108 mil caracteres, porque o desktop deixa uma emenda entre elementos empilhados. `scripts/qg-para-svg.py` converte a arte (recorta a faixa, realça a saturação, trava a paleta, apaga os ponteiros do relógio) e gera `hooks/cenario-arte.ts`.
- **Conhecido:** o visual no app desktop da faixa dentro do Claudin (pinos, miniaturas nas bancadas, luz da noite) ainda não foi conferido; o Claudin ainda anda na linha abaixo da faixa, não dentro dela; sem LICENSE.

## 0.6.0 — 2026-11-19

- **Aviso de contexto.** Ao fim de cada turno o Claudin lê a ocupação da janela (`$.session.usage()`) e avisa uma vez ao passar de 50%, 70% e 85%, no mesmo balão do `Pronto:`, sugerindo `/compact` (e `/clear` no último nível). O botão `compactar` do balão só preenche o prompt; o aviso se rearma depois de compactar ou limpar. Os limites se ajustam em Ajustes (botão `contexto:`): `50/70/85%`, `60/80/90%`, `70/85/95%` ou `desligado`, guardado entre sessões. A aba Ações ganha `contexto: N% da janela` e os botões `compactar (/compact)` e `limpar contexto (/clear)`, que também só preenchem. O Claudin nunca compacta nem limpa sozinho.
- **Comandos do Claudin na Cola.** O grupo `Claudin` aparece depois dos plugins do catálogo, com `/claudin`, `/claudin lateral`, `/claudin prompt` e `/claudin ocultar`; os comandos de uma Cola agora aceitam argumentos simples (`/claudin lateral`).
- **Auditoria das pendências, o que deu para corrigir:**
  - `cofre.json` e `cola.json` salvos com BOM (Bloco de Notas) ou com o caminho do Windows sem escapar a barra (`C:\Users\...`) agora valem, em vez de desligar o recurso em silêncio.
  - O aviso de `_hot` velho não dispara mais no sábado, no domingo nem na segunda de manhã quando o hot é o da sexta (o ciclo diário roda de segunda a sexta); hot mais velho que isso ainda avisa.
  - Prazo repetido (mesma data e título) aparece uma vez, no `_hot` e na Agenda local (`Esse prazo já está na Agenda.`).
  - O balão e a contagem do Claudin não podem mais barrar `prompt.submit`, `tool.call` nem `session.compact`: qualquer falha ali é engolida.
  - Ícone do plugin (`.claude-plugin/icon.png`, o Claudin Mangue em 1024 px) e tipagem dos testes: `claude plugin validate` passa sem avisos; resta só a LICENSE, que é escolha sua.
  - Testes novos para leitura do cofre que falha, BOM, barra solta, fim de semana e prazo repetido (278 no total).
- **Conhecido, sem correção:** o nome acessível das abas só com ícone (o motor só aceita o `label` do botão, e o nome completo desfaria o ganho de largura); a releitura do `_hot` na abertura da sessão (três leituras de arquivo pequeno, uma vez por sessão, não vale um cache); a conferência visual no app desktop; sem LICENSE.

## 0.5.0 — 2026-11-19

- **A Mangue é o padrão.** O Claudin agora nasce com a luz de borda; o chapado de antes virou a skin `clássico`, a última do botão `skin:`. Quem tinha sprites soltos próprios em `<config>/claudin/sprites/` e nunca escolheu skin começa no clássico, para não perder os seus, e o `padrão` guardado vira Mangue.
- **Skin Lama.** O Claudin cor de lama (a que ficou de fora da primeira rodada), com um brotinho de cannabis nascendo da cabeça, entre as antenas, que balança de leve. Mantém o piscar, o olhar, o andar e todos os modos; o ponto de exclamação do alerta passa para a direita, como no chapéu do Malungo.
- **Cola da Oficina com descrição.** A lista abre recolhida (um botão por plugin, com a contagem), então cabe em poucas páginas; abrir um plugin mostra só as skills dele e clicar em outra vez recolhe. Clicar numa skill preenche o prompt e o Claudin diz a descrição e o exemplo de uso que estão no `catalogo.json`. Os `comandos` de cada plugin (como o `/achado`) aparecem na lista, e a chave `scripts` do catálogo vira o grupo `oficina.py`, cujos itens preenchem o prompt com o comando. A busca olha nome, descrição e exemplo.
- **Conhecido:** o comando `eval [plugin]` do grupo `oficina.py` preenche o prompt com o `[plugin]` literal, para você trocar pelo nome; conferência visual no app desktop pendente (a Lama e o broto só foram vistos na prévia); sem LICENSE.

## 0.4.0 — 2026-11-19

- **Cola da Oficina (opcional, só leitura).** Com `<config>/claudin/cola.json` apontando para o `catalogo.json` da oficina de skills (`{ "path": "~/oficina-skills/catalogo.json" }`), a aba Comandos ganha o botão 📋 ao lado da busca: ele alterna para a lista da oficina, com as skills agrupadas por plugin (com a versão), busca própria, marca `beta` e, ao clicar, o prompt é preenchido com `/plugin:skill ` (quem envia é você). Trocar de aba volta para a lista normal de comandos. O catálogo é relido toda vez que a aba abre, então skill nova da oficina aparece sem reiniciar. Só entram as skills que rodam no Claude Code, e nome fora do padrão é ignorado. Sem o arquivo, ou com o caminho inexistente, o botão não existe. Nada do catálogo vive neste repositório.
- **Conhecido:** a descrição de cada skill e os comandos do `oficina.py` ainda não estão na aba (o `catalogo.json` não traz a descrição); conferência visual no app desktop pendente; sem LICENSE.

## 0.3.2 — 2026-11-19

- **Skins refeitas como variações do Claudin.** A arte parada do Flow saiu do pacote: Mangue, Maré e Malungo agora são o desenho do Claudin com outra paleta e luz de borda (realce claro em cima e à esquerda, sombra embaixo e à direita, fio escuro no canto, sombra no chão; o rosto fica limpo, sem faixa sob os olhos), e o Malungo ganha chapéu de palha. Mantêm o piscar, o olhar, o andar e todos os modos com adereço. O `padrão` continua o Claudin chapado. O código do desenho foi para `hooks/desenho.ts`; `scripts/previa-skins.mjs` gera uma página de conferência.
- **Correções da auditoria.** Captura de nota: o título com `\` podia levar o arquivo para fora de `Raw/Notas`; a barra agora sai do nome, `..` vira `.`, o nome passa por uma checagem e uma trava impede dois envios ao mesmo tempo. `cofre.json` só aceita caminho absoluto ou `~/`. Um prazo do cofre não fura `meditar` nem `cigarro` pela saudação, e uma saudação engolida por esses modos volta na próxima sessão. DD/MM muito à frente cai no ano anterior. A aba que some não prende a caixa; criatura sem arte entra no `+N`; o `alt` da miniatura diz tipo e quantidade; skins e miniaturas só carregam SVG.
- **Miniaturas da frota redesenhadas em código** (`hooks/minis-arte.ts`): siri, garça, guaiamum, aratu e caranguejinho no mesmo estilo e com a mesma luz do Claudin, com olhos que piscam e um balanço de meio pixel. A arte do Flow saiu do pacote; um SVG em `<config>/claudin/sprites/frota/<criatura>.svg` substitui a criatura do plugin.
- **Conhecido:** a conferência visual no app desktop ainda está pendente; sem LICENSE.

## 0.3.1 — 2026-11-19

- **Corrige:** as skins e as miniaturas não apareciam no app desktop, porque o PNG embutido em SVG (`<image>`) não é desenhado ali. A arte agora é SVG de retângulos (`sprites/<skin>/<pose>.svg`, `sprites/frota/<criatura>.svg`), idêntico ao PNG pixel a pixel; o PNG fica ao lado como fonte. `scripts/png-para-svg.py` faz a conversão (e `--verificar` confere). Quem usa sprite PNG próprio deve converter com o script.

## 0.3.0 — 2026-11-19

- **Skins.** Três pacotes de arte original, **Mangue**, **Maré** e **Malungo** (chapéu de palha), com as nove poses em `sprites/<skin>/<pose>.png`. O botão `skin:` em Ajustes alterna entre o desenho padrão e as skins; a escolha fica guardada entre sessões, e uma pasta sua em `<config>/claudin/sprites/<nome>/` também vira skin. Pose ausente cai para o desenho padrão. Nos modos com adereço o desenho padrão continua valendo.
- **Miniaturas da frota.** Com subagentes vivos, até duas criaturas do mangue aparecem ao lado do mascote, uma por tipo (siri = explorar, garça = planejar, guaiamum = executar, aratu = revisar, caranguejinho = o resto), com `×n` e `+N`. Somem quando a frota esvazia e ficam de fora em `meditar` e `cigarro`. `<config>/claudin/fleet-map.json` troca a criatura de um tipo.
- **Conhecido:** as skins e as miniaturas foram testadas só nos testes do plugin (181 passando) e a arte foi conferida em prévias; a conferência visual no app desktop ainda está pendente, assim como a da barra de abas, da aba Cofre e da frota (veja a 0.2.1 e a 0.2.0). O desenho padrão continua o antigo; nos modos com adereço (café, cigarro, meditar, thug life) vale o desenho padrão, porque a arte ainda não tem adereços. Sem LICENSE por enquanto.

## 0.2.1 — 2026-11-19

- **Cofre, só leitura.** O caminho do cofre vem de `<config>/claudin/cofre.json` (`{ "path": "..." }`, aceita `~/`). Sem o arquivo, com caminho inválido ou com a pasta inexistente, o recurso fica desligado, sem erro e sem mensagem. Com o cofre ligado, a saudação do dia (uma por dia, junto com prazos e lembretes) acrescenta `cofre: <próximo passo> · N urgentes`, lidos de `Wiki/_hot.md`, mais avisos de saúde na mesma frase: `o hot é de ontem` (ou `o hot tem N dias`) e `fila com N itens` quando `Raw/_pending.md` passa de 40 abertos; em `cigarro` e `meditar` ela segue calada. O Claudin nunca escreve no cofre. Na aba Ações, com o cofre ligado, o botão `próximo passo do cofre` preenche o prompt com `Leia <cofre>/Wiki/_hot.md e me ajude com o próximo passo.`; quem envia é você, e sem cofre o botão não aparece.
- **Prazos do cofre na Agenda.** Os prazos da seção `Prazos` do `Wiki/_hot.md` (`- DD/MM · o quê · fonte`) aparecem na Agenda marcados `do cofre`, só leitura e sem botão de apagar, e entram na saudação do dia. O mesmo prazo digitado no Claudin aparece uma vez, do lado do cofre. Prazos e lembretes digitados no Claudin continuam locais; linha estranha no `_hot` é ignorada sem quebrar. A lista é relida ao abrir a aba Agenda.
- **Barra de abas só com ícone.** Cada aba mostra o ícone; a aberta mostra `▸ícone nome`. Cabem as oito abas sem quebrar linha, o que também resolve o corte do menu no app desktop. As chaves das abas não mudam. Divisória e texto de lista vazia da Agenda ficaram mais curtos.
- **Aba Cofre (🔐).** Só aparece com o cofre ligado: próximo passo, urgentes, fios ativos e avisos de saúde do `_hot`, o botão `próximo passo do cofre` e o campo `capturar nota…`, que cria um arquivo novo em `Raw/Notas/AAAA-MM-DD - <título> (claudin).md` (nome limpo para o Windows, até 60 caracteres, ` (2)` se já existir). É a única escrita do Claudin no cofre: nunca edita nem apaga e não toca no `_pending`.
- **Balão:** o botão de ação (como `investigar`) ganhou uma linha de respiro e não fica mais colado na fala.
- **Conhecido:** a largura dos ícones da barra de abas, a altura da aba Cofre e o respiro do botão no balão foram testados só nos testes do plugin; a conferência visual no app desktop ainda está pendente, assim como a da frota (veja a 0.2.0). O cofre foi testado só com dados inventados.


## 0.2.0 — 2026-11-17

- **Frota de agentes.** O Claudin acompanha os subagentes: balão de subida, linha de resumo, aba Frota, balão de erro com `investigar` quando um agente falha, e agentes no resumo do fim de turno. Em `cigarro` e `meditar` só a falha aparece. Um agente que a lista do engine nunca nomeia (workflow) segue vivo até o `turn.complete`. Ideia do [legends-claude](https://github.com/leolegends/legends-claude) (MIT), sem o palco animado.
- **Instalação por marketplace.** O repositório tem `.claude-plugin/marketplace.json`; `claude plugin marketplace add two2dope/claud-in` e `claude plugin install claudin@claud-in`.
- **Dados do usuário fora do plugin.** Sprites, `shortcuts.json` e `favorites-seed.json` passam a ser lidos de `<config>/claudin/` (`CLAUDE_CONFIG_DIR` ou `~/.claude`) antes da pasta do plugin, para a atualização não apagá-los. Quem usa `--plugin-dir` continua funcionando como antes.
- O README ganhou os créditos ao legends-claude e a seção de instalação por marketplace.
- **Conhecido:** a frota foi medida e testada em sessão `claude -p`; a validação visual no app desktop (dois agentes em paralelo, falha de agente, modo meditar, `/reload-plugins` com agente rodando, workflow com 5 ou mais agentes) ainda está pendente. A instalação por marketplace foi conferida com caminho local, não a partir do GitHub.

## 0.1.0

Primeira versão: mascote acima do prompt, balões por pose, modos, caixa de ferramentas, timers, prazos e lembretes.
