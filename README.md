<p align="center">
  <img src="assets/banner.svg" alt="Claudin: o nome em pixel-art ao lado de um mascote coral que diz Online. Monitorando." width="100%">
</p>

# Claudin

Claudin é um mod do Claude Code Desktop: um mascote em pixel-art que vive acima do prompt, mostra o que o Claude está fazendo em balões curtos e tira as linhas de ferramenta de dentro do chat. Também guarda timers, prazos e lembretes, e carrega uma caixa de ferramentas com os atalhos que você mais usa.

O tom é o de um assistente sóbrio que avisa, não o de um bichinho que pede atenção.

## Por que ele existe

O Claudin nasceu como assistente cognitivo de uso real, feito por uma cabeça com TDAH e para ela. Quem pensa rápido e em muitas direções costuma perder o fio de três coisas: o tempo que passou, o que ficou aberto e o que vem depois. Ele fica ao lado do trabalho para segurar essas três.

Cada recurso responde a uma dificuldade concreta:

| Dificuldade | Como o Claudin ajuda |
|---|---|
| Perder a noção do tempo | Timers, pomodoro e um aviso quando uma tarefa passa de 30 segundos |
| Muita coisa aberta ao mesmo tempo | A atividade de fundo sai do chat e vira um balão curto, num lugar só |
| Esquecer prazos e compromissos | Prazos com contagem em dias, lembretes recorrentes e a saudação do dia |
| Não saber o que fazer a seguir | Resumo no fim do turno e a próxima ação sugerida |
| Ruído e interrupção | Os modos cigarro e meditar só falam de erro e risco |
| Agir no impulso | Aviso antes de um comando que pode apagar ou sobrescrever coisas |

Três princípios guiam o desenho:
- **Quem decide é você.** Uma ação sugerida só preenche o prompt. O Claudin não envia nada sozinho nem gasta tokens por conta própria.
- **Aviso, não cobrança.** O tom é curto e sóbrio, sem culpa e sem insistência.
- **Atenção a menos, não a mais.** Ele tira coisas da frente em vez de pôr mais uma notificação na tela.

O Claudin é uma ferramenta de apoio pessoal. Não é tratamento e não substitui acompanhamento profissional.

## Caranguejos com cérebro

O banner é uma homenagem ao manifesto de mesmo nome, assinado por Fred Zero Quatro em Recife, em 1992, um dos textos fundadores do Mangue Beat, o movimento de Chico Science & Nação Zumbi. O manifesto vê o mangue como uma base fértil e põe uma antena parabólica enfiada na lama como imagem da ligação entre o que é local e o que circula pelo mundo.

O Claudin toma emprestadas as duas imagens: um caranguejo que pensa, andando de lado entre muitas abas, e uma parabólica na lama que traz o sinal. O texto do manifesto não é reproduzido aqui. Ele está na [Wikisource](https://pt.wikisource.org/wiki/Caranguejos_com_c%C3%A9rebro), sob licença CC BY-SA 4.0.

## O que ele faz

As imagens abaixo são animadas e foram desenhadas a partir do próprio código do mod (`assets/build-assets.mjs`). Não são capturas de tela.

**Reage ao trabalho do Claude.** O Claudin muda de pose conforme o que acontece: parado, pensando, lendo, codando, rodando um comando, buscando, concluído, erro e alerta. O texto vive no balão, e a borda muda de cor com a gravidade (sucesso, atenção, erro).

<p align="center">
  <img src="assets/poses.svg" alt="As nove poses do Claudin: parado, pensando, lendo, codando, rodando, buscando, pronto, erro e alerta" width="100%">
</p>

**Tira o ruído do chat.** As linhas de ferramenta e o "Em execução" saem da conversa e ficam no balão e no histórico do Claudin. O botão `ver tools` traz tudo de volta quando você quiser conferir.

**Avisa na hora certa.**
- Falha de ferramenta, com um botão que já preenche o prompt para investigar.
- Tarefa que passa de 30 segundos.
- Comando de risco, como `rm -rf`, `git push --force`, `git reset --hard` e `drop table`. A lista é curta e não substitui as permissões do app.
- Resumo no fim do turno, com a próxima ação sugerida.

Uma ação sugerida só preenche o prompt. Quem decide enviar é você, então o Claudin não gasta nenhum token por conta própria.

<p align="center">
  <img src="assets/baloes.svg" alt="Ciclo de quatro balões: tarefa longa, falha com o botão investigar, comando de risco e resumo do fim do turno" width="100%">
</p>

**Caixa de ferramentas.** Um clique abre um menu paginado, com busca:

<p align="center">
  <img src="assets/caixa.svg" alt="Ilustração da caixa de ferramentas com as abas Prompts, Comandos, Tempo e Agenda em ciclo" width="100%">
</p>

| Aba | O que tem |
|---|---|
| Prompts | Atalhos como resumir, explicar erro, rodar testes e próximo passo, mais os seus em `shortcuts.json` |
| Ações | Copiar o último comando, copiar o último caminho, abrir a pasta do projeto |
| Comandos | Todos os comandos `/` da sessão, com busca e favoritos |
| Ajustes | Modo, tamanho, ver ou ocultar tools, histórico, saudação do dia, afagar, painel lateral |
| Tempo | Timers e pomodoro, com pausar, reiniciar e cancelar |
| Agenda | Prazos com contagem em dias e lembretes recorrentes |

**Tempo e agenda.** Timers, prazos e lembretes são gravados entre sessões. A saudação do dia resume o que vence hoje e o que venceu.

**Modos.** O ciclo fica em Ajustes.

<p align="center">
  <img src="assets/modos.svg" alt="Os cinco modos: normal, café, cigarro, meditar e thug life" width="100%">
</p>

| Modo | Comportamento |
|---|---|
| normal | Fala de tudo que importa |
| café | Olhos bem abertos, de olho em cada passo |
| cigarro | Pausa com hora para voltar; só fala de erro e risco |
| meditar | Silêncio; só fala de erro e risco |
| thug life | Óculos escuros |

## Como trazer o Claudin de volta

O comando `/claudin` reposiciona o mascote onde ele estiver.

| Comando | Efeito |
|---|---|
| `/claudin` | Traz o Claudin de volta, onde ele estava |
| `/claudin lateral` | Abre o painel lateral; se não couber, fica na faixa e avisa |
| `/claudin prompt` | Põe o Claudin acima do prompt |
| `/claudin ocultar` | Esconde o Claudin até o próximo `/claudin` |

Se você fechar o painel lateral pelo X da janela, a faixa acima do prompt volta sozinha.

## Instalação

Pré-requisito: Claude Code Desktop com suporte a mods de plugin.

```bash
git clone https://github.com/two2dope/claud-in.git
claude --plugin-dir ./claud-in
```

Para carregar em toda sessão nova, aponte a variável `CLAUDE_CODE_PLUGIN_DIRS` para a pasta clonada, no bloco `env` do seu `~/.claude/settings.json`.

## Personalização

- **Sprites próprios:** coloque um arquivo por pose em `sprites/` (`.svg` ou `.png`, PNG até cerca de 90 KB). As poses são `idle`, `think`, `read`, `code`, `run`, `search`, `ok`, `err`. Pose sem arquivo usa o desenho padrão. Salvou, o mod recarrega.
- **Atalhos de prompt:** edite `shortcuts.json`, uma lista de `{ "label", "text" }`.
- **Favoritos iniciais:** `favorites-seed.json` entra na primeira vez; depois os favoritos ficam no armazenamento do próprio mod.

## Desenvolvimento

```bash
claude plugin validate .
claude plugin test .
npx --yes -p typescript tsc -p . --noEmit
```

O `tsc` usa tipos que o próprio Claude Code gera em `.claude-plugin/types/` na primeira vez que carrega o mod. Sem essa pasta, carregue o mod uma vez antes de checar os tipos.

Para refazer o banner: `node assets/build-banner.mjs`. Para refazer as ilustrações: `node assets/build-assets.mjs`.

| Caminho | Conteúdo |
|---|---|
| `hooks/register.tsx` | O mod inteiro: faixa, painel, caixa de ferramentas, timers, comando `/claudin` |
| `types/index.d.ts` | O contrato do estado do mod |
| `tests/claudin.test.tsx` | Testes do `claude plugin test` |
| `projeto/` | Dossiê do projeto: brief, direção visual, plano e o log de cada etapa |
| `assets/` | Banner, ilustrações animadas e os scripts que os geram |

## Como ele cresceu

Todo caranguejo cresce largando o casco, e o Claudin cresceu do mesmo jeito: por mudas.

<p align="center">
  <img src="assets/muda.svg" alt="Cinco cascos do Claudin, do mais apagado ao atual, rotulados com as fases do projeto" width="100%">
</p>

| Casco | Quando | O que mudou |
|---|---|---|
| Faixa e balões | 2026-10-19 | O mascote nasce acima do prompt e as linhas de ferramenta saem do chat |
| Modos e alertas | 2026-10-19 | Café, cigarro e meditar, mais os avisos de falha, demora, risco e fim de turno |
| Caixa de ferramentas | 2026-10-19 | Menu paginado, atalhos de prompt, ações rápidas e o canivete de comandos `/` |
| Tempo e agenda | 2026-10-19 | Timers, pomodoro, prazos, lembretes recorrentes e a saudação do dia |
| `/claudin` e GitHub | 2026-10-22 | O comando que traz o mascote de volta, os tipos corrigidos e o repositório |

Antes de existir git, cada mudança grande deixou uma cópia de segurança: 14 cascos ao todo. Daqui em diante o histórico mora nos commits.

## Limitações conhecidas

- A faixa e o painel dependem de superfícies do app desktop (`AbovePrompt` e `Pane`). Uma atualização do app pode quebrar o mod, então vale revisar depois de atualizar.
- O Claudin não flutua pela tela; ele vive na faixa ou no painel.
- Os lembretes só disparam com o app aberto. A saudação do dia lista o que venceu enquanto ele estava fechado.
- A ação `abrir pasta` usa o `explorer.exe`, então funciona só no Windows.
- Sprites em PNG ainda não foram testados no desktop; SVG é a aposta segura.

## Status

Em uso real desde 2026-10-19, com revisão de riscos marcada para 2026-10-26. O histórico de decisões, riscos e testes está em [`projeto/08-log.md`](projeto/08-log.md).

---

© 2026 two2Dope
