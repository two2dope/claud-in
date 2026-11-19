# Changelog

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
