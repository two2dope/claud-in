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

## Lote de skins 1 (2026-11-18): 9 aprovados, 1 rejeitado, 2 em standby
Painel em `projeto/skins-ar-board/`. Previews em SVG provisório; a arte final vai pelo Flow (D3).

### Aprovar quando
- **Pacotes de skin (D4, com ajuste):** Mangue (padrão, a atual), Maré (azul-esverdeado) e **Malungo**, que substitui a Parabólica. No Malungo, o prato da parabólica sai e entra o chapéu icônico de Chico Science (M4).
- **Frota (F2 + F3, combinados):** miniaturas **distintas por tipo de agente**, até 2 visíveis e `+N` no resto. Thomáz quer que as miniaturas possam ser **outros seres do mangue**, não só caranguejos.
- **Skin por modo (D2):** uma skin escolhida, e os modos só trocam adereço (opção A recomendada, aprovada sem comentário).
- **Modos calmos (D1):** meditar e cigarro desenham a skin na versão mais quieta. Thomáz avisa se mudar de ideia.
- **Arte final pelo Flow (D3):** PNG até cerca de 90 KB por pose, 64x48, com a `flow-assets` (versão do Antigravity, já instalada em `~/.claude/skills`).

### Rejeitar quando
- Ponto de estado nas miniaturas (F4). Porquê: a cor por tipo (F2) já foi decidida.

### Standby (volta só com contexto novo)
- **Lama (M3):** "não me agrada".
- **Miniaturas de mesma cor (F1):** "quero distinção". Na prática superada por F2.

### Em aberto (nascem do veredito)
1. **Mapa tipo → ser do mangue e cor.** Quais tipos de agente ganham figura própria (Explore, Plan, general-purpose, outros) e qual criatura cada um (por exemplo guaiamum, siri, aratu, camarão, garça). A forma diferente também garante que a cor nunca seja o único sinal.
2. **Com mais de 2 tipos vivos, quais 2 aparecem?** Proposta: os 2 mais antigos, ou os 2 tipos mais frequentes. Decidir antes do código.
3. **Chico Science (M4/Malungo):** só o chapéu de palha, sem rosto nem traços da pessoa, para ser homenagem e não retrato.
4. **Cota do Flow:** o limite de 12 gerações do Antigravity pede um lote enxuto: uma imagem âncora de estilo e as poses por skin em etapas.

### Decisões de 2026-11-18 (mapa e Flow)
- **Mapa aprovado:** Explorar = siri azul; Planejar = garça lilás; Executar = guaiamum âmbar; Revisar = aratu verde; outros = caranguejinho cinza. Uma miniatura por tipo, os 2 tipos com mais agentes vivos (empate: o mais antigo), `×n` quando há vários e `+N` nos agentes sem miniatura. Opcional: `fleet-map.json` em `<config>/claudin/`.
- **Arte:** só as âncoras no Nano Banana, em separado; o lote inteiro (32 imagens) de uma vez no Flow, com as âncoras como referência. Prompts em `projeto/skins-ar-board/flow-skins-prompts.md`. Correção: são 9 poses por skin (`MOODS` inclui `alert`), não 8.


## Arte das skins (2026-11-18): 6 aprovados, 1 rejeitado
Painel `projeto/skins-ar-board/ar-board-skins-arte.html`. PNGs finais em `assets/skins/` (poses 64x48, minis 24x24, até 1 KB cada, alfa de 1 bit, paleta travada por skin).
- **Mangue (S1):** "perfeita". Fica como o desenho padrão.
- **Maré (S2) rejeitada como gerada:** agora é troca de paleta a partir do Mangue (mesma silhueta, antenas claras). Os 9 cards da Maré saem do lote do Flow.
- **Malungo (S3) aprovado, mas "singela":** rodada 2 feita no Flow em 2026-11-19 e reingerida (9 poses). O chapéu de palha trançado tem 489x153 px em todas as poses (a `search` inclina, como o Mangue). Na `alert` e na `run` as antenas finas saem do chapéu; nas outras ficam escondidas.
- **Minis (M1), pernas (D2) e pipeline (D3) aprovados.** Mantém 2 pernas. Os PNGs reduzidos são a fonte da arte.
- **Correção de ingestão (D1 e M1):** o `err` ficava fraco e o siri sem olhos porque as pupilas `#1A1A1A` caíam como fundo `#1E1E1E`. Resolvido tratando como primeiro plano tudo que não liga à borda; o X e as pupilas voltaram, sem regerar nada.
- **Aratu refeito sem o ramo (2026-11-19):** nova imagem do Flow, reingerida em 24x24. Em aberto: o pacote de skins no código continua depois do cofre.

## Virada de 2026-11-19: skins como variações do Claudin
- Thomáz viu as skins do Flow no app (poses paradas, PNG vira SVG de retângulos) e decidiu **voltar atrás do Flow para o mascote**: "o Claudin original tem mais personalidade e movimento". Ele imaginava elevar um pouco o visual chapado, algo como o `Gemini_Generated_Image_8dsz…` (realce no alto, sombra e fio escuro embaixo).
- **Decisão:** Mangue, Maré e Malungo viram o próprio Claudin com paleta e luz (`hooks/desenho.ts`), herdando piscar, olhar, andar e modos; o Malungo leva o chapéu de palha. A arte parada do Flow das poses saiu do pacote (continua no histórico, v0.3.0 e v0.3.1).
- **Luz mais forte, sem "barba por fazer":** a luz é só de borda (fina); uma faixa de sombra sob os olhos parecia barba, e um teste a proíbe. As miniaturas da frota foram redesenhadas em código no mesmo estilo (a arte do Flow saiu).
