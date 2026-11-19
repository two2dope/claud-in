# Changelog

## Não lançado

- **Cofre, só leitura.** O caminho do cofre vem de `<config>/claudin/cofre.json` (`{ "path": "..." }`, aceita `~/`). Sem o arquivo, com caminho inválido ou com a pasta inexistente, o recurso fica desligado, sem erro e sem mensagem. Com o cofre ligado, a saudação do dia (uma por dia, junto com prazos e lembretes) acrescenta `cofre: <próximo passo> · N urgentes`, lidos de `Wiki/_hot.md`, mais avisos de saúde na mesma frase: `o hot é de ontem` (ou `o hot tem N dias`) e `fila com N itens` quando `Raw/_pending.md` passa de 40 abertos; em `cigarro` e `meditar` ela segue calada. O Claudin nunca escreve no cofre. Na aba Ações, com o cofre ligado, o botão `próximo passo do cofre` preenche o prompt com `Leia <cofre>/Wiki/_hot.md e me ajude com o próximo passo.`; quem envia é você, e sem cofre o botão não aparece.
- **Prazos do cofre na Agenda.** Os prazos da seção `Prazos` do `Wiki/_hot.md` (`- DD/MM · o quê · fonte`) aparecem na Agenda marcados `do cofre`, só leitura e sem botão de apagar, e entram na saudação do dia. O mesmo prazo digitado no Claudin aparece uma vez, do lado do cofre. Prazos e lembretes digitados no Claudin continuam locais; linha estranha no `_hot` é ignorada sem quebrar. A lista é relida ao abrir a aba Agenda.
- **Balão:** o botão de ação (como `investigar`) ganhou uma linha de respiro e não fica mais colado na fala.

## 0.2.0 — 2026-11-17

- **Frota de agentes.** O Claudin acompanha os subagentes: balão de subida, linha de resumo, aba Frota, balão de erro com `investigar` quando um agente falha, e agentes no resumo do fim de turno. Em `cigarro` e `meditar` só a falha aparece. Um agente que a lista do engine nunca nomeia (workflow) segue vivo até o `turn.complete`. Ideia do [legends-claude](https://github.com/leolegends/legends-claude) (MIT), sem o palco animado.
- **Instalação por marketplace.** O repositório tem `.claude-plugin/marketplace.json`; `claude plugin marketplace add two2dope/claud-in` e `claude plugin install claudin@claud-in`.
- **Dados do usuário fora do plugin.** Sprites, `shortcuts.json` e `favorites-seed.json` passam a ser lidos de `<config>/claudin/` (`CLAUDE_CONFIG_DIR` ou `~/.claude`) antes da pasta do plugin, para a atualização não apagá-los. Quem usa `--plugin-dir` continua funcionando como antes.
- O README ganhou os créditos ao legends-claude e a seção de instalação por marketplace.
- **Conhecido:** a frota foi medida e testada em sessão `claude -p`; a validação visual no app desktop (dois agentes em paralelo, falha de agente, modo meditar, `/reload-plugins` com agente rodando, workflow com 5 ou mais agentes) ainda está pendente. A instalação por marketplace foi conferida com caminho local, não a partir do GitHub.

## 0.1.0

Primeira versão: mascote acima do prompt, balões por pose, modos, caixa de ferramentas, timers, prazos e lembretes.
