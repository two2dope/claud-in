# Critérios do AR Board: cofre e skins do Claudin

Lote `claudin-cofre-skins-2026-11-17`. Veredito de Thomáz: 14 aprovados, 3 rejeitados, 2 em standby, 0 pendentes. Este arquivo é o memory card do lote: o obsoleto sai a cada rodada, e fica abaixo de 120 linhas.

## Aprovar quando (cofre)
- O Claudin só **lê** o cofre. Leitura em tempo de execução, sem copiar conteúdo para o repositório público.
- O caminho do cofre é configurável. Sem caminho ou com pasta inexistente, o recurso fica desligado, sem erro e sem mensagem. Nenhum teste ou exemplo usa conteúdo real.
- Cada aviso é sóbrio, no máximo um por dia, e respeita os modos (cigarro e meditar só falam de erro e risco).
- Toda ação sugerida só preenche o prompt. Quem envia é o usuário.
- O cofre é a fonte única dos prazos; a Agenda do Claudin só espelha, sem escrever de volta. Prazos e lembretes digitados no Claudin continuam locais.
- A única escrita permitida é criar **arquivo novo** em `Raw/Notas` (captura rápida, C6), nunca editar nem apagar.

## Rejeitar quando (cofre)
- O Claudin escreve em `_hot.md`, `_log.md`, `_pending.md`, na Wiki ou edita o Raw (C7). Porquê: invariantes do cofre; só os ciclos agendados escrevem ali; o `$.fs.write` do mod sobrescreve o arquivo inteiro e disputaria com o ciclo.
- O Claudin gera log próprio de sessão para o cofre (C8). Porquê: o ciclo diário já lê as sessões e o `git log` dos projetos.

## Aprovar quando (skins)
- A skin é um pacote `sprites/<skin>/<pose>` com escolha em Ajustes e queda para o desenho padrão quando falta a pose (S6).
- Primeira rodada: eixos **modo** (S2) e **frota** (S3). Frota em versão sóbria: de 1 a 3 miniaturas, o resto vira `+N`, sem animação além de piscar, some quando a frota esvazia.
- Regra de atenção (S9), critério de aceite de toda skin: muda só pose, cor e adereço; nenhum movimento novo; `animação: parado` desliga tudo; meditar e cigarro usam a skin mais quieta.
- Só arte original, da identidade do projeto (Mangue Beat). Arte gerada em lote e curada no AR Board antes de qualquer código (S8).

## Rejeitar quando (skins)
- Personagens de franquias (S7: Pikachu, Mario, Kratos). Porquê: marca de terceiros em repositório público.
- Palco com tijolos, confete e aura (da conversa sobre o legends-claude). Porquê: contra "atenção a menos".

## Standby (volta só com contexto novo)
- **S4, skin por modelo via `turn.step`:** volta quando um `turn.step` que só lê (sem reescrever) for medido e não atrasar a resposta.
- **S5, aura por esforço:** volta depois de S4, e só na versão mínima (borda ou cor, sem animação).

## Comentários de Thomáz que mudam o desenho
- **C2:** a aba Cofre leva o ícone 🔐. A barra de abas passa a ser só com ícone, mostrando o nome só da aba aberta (decidido em 2026-11-17, ver ponto 1).
- **S8:** gerar a arte pelo processo recorrente do Flow, com comandos personalizados ou ferramentas feitas para a tarefa, em vez de SVG por script. Efeito: arte raster. O carregador aceita PNG, mas o README limita cada pose a cerca de 90 KB; o app a desenha em 64x48, pixelada.

## Ordem de entrega (S10, aprovada)
1. Validar a frota no app e fechar o PR 1.
2. Cofre, leitura: C9, C1, C4, C5, depois C3 e C2.
3. Pacote de skins e lote de variações no AR Board: S6, S8, S2, S3.
4. Fase 2, só se o `turn.step` for barato: S4 e S5.

## Pontos em aberto (nascem do veredito)
1. **C2, largura da barra de abas: RESOLVIDO (opção B, aprovada em 2026-11-17).** Abas só com ícone; a aberta mostra `▸<ícone> <nome>`. Ícones: 💬 Prompts, ⚡ Ações, ⌘ Comandos, ⚙ Ajustes, ⏱ Tempo, 📅 Agenda, 🦀 Frota, 🔐 Cofre. Aba fechada ocupa 3 colunas; aberta, no máximo 12; 8 abas somam cerca de 40 das 52 úteis, e uma 9ª cabe. Frota só aparece com agentes e Cofre só com o caminho configurado. As chaves `cat-<aba>` não mudam. A altura da caixa não muda. O `tabGap` de `hooks/abas.ts` sai nessa mudança. Entra junto com a aba Cofre, depois da validação da frota e do fechamento do PR 1. Risco aberto: largura dos emoji nas superfícies terminal e desktop, não medida no app.
2. **C6, captura rápida: RESOLVIDO no lado do cofre (2026-11-17).** A skill do cofre (`oficina-skills/plugins/continuidade/skills/cofre`) ganhou `cofre.py novos <cofre>` (lista arquivo do Raw sem selo e sem linha no `_pending`), o passo do ciclo diário que enfileira essas capturas antes do `selar`, e a linha nos invariantes do `SKILL.md`. Editado e verificado com um cofre temporário (7 checagens), sem commit, versão, CHANGELOG nem dist; a cópia instalada só passa a valer depois de atualizar o plugin. Lado do Claudin: campo "capturar nota…" na aba Cofre, arquivo novo `Raw/Notas/AAAA-MM-DD - <título> (claudin).md` (nome limpo para o Windows, cerca de 60 caracteres, `(2)` se já existir, nunca sobrescreve), sem tocar no `_pending` nem rodar `selar`; entra junto com a aba Cofre.
3. **S1, eixos da primeira rodada.** Aprovado sem comentário; assumido modo + frota, como proposto.
4. **S8, formato da arte.** Confirmar o fluxo do Flow e o orçamento de 90 KB por pose antes do primeiro lote.
5. **Validação visual da frota** continua pendente com Thomáz (prints do app).
