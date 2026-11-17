# Claudin: frota de agentes em tempo real, Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** o Claudin passa a acompanhar, em tempo real, cada subagente que o Claude Code dispara (quem é, o que faz, se terminou ou falhou) e a reagir a isso no balão, nas poses e na caixa de ferramentas, sem ficar mais barulhento.

**Architecture:** um módulo puro novo (`hooks/frota.ts`) guarda o estado da frota e decide o que dizer; o `register.tsx` só liga os eventos (`agent.spawn`, `tool.call` com `agentId`, `turn.complete`, relógio) a esse módulo e desenha uma linha de resumo e uma aba "Frota". A inspiração é o `agents.ts` do legends-claude (MIT, https://github.com/leolegends/legends-claude); o palco, a aura e os mascotes dele ficam de fora porque o Claudin existe para tirar atenção da tela.

**Tech Stack:** TypeScript/TSX, API de mods do Claude Code (function hooks, `claude-code`, `claude-code/testing`), `claude plugin test .`, `claude plugin validate .`.

**Spec:** não há spec separado. O desenho está na conversa que gerou este plano e resumido em "Decisões de desenho" abaixo. Fonte de referência: `hooks/agents.ts` e `hooks/register.tsx` (linhas 439-545) do legends-claude.

## Decisões de desenho

- **Fonte de verdade:** `$.agent.list()` (engine) reconciliada com os eventos. Os eventos dão rapidez; a lista corrige o que escapou.
- **Fala só quando importa:** subida de agente vira um balão curto; chamada de ferramenta de subagente **não** gera balão (só atualiza contador e "última ferramenta"); falha de agente é erro vermelho com botão `investigar`; término com sucesso é silencioso (entra no resumo de fim de turno).
- **Modos respeitados:** a função `speak` existente já cala tudo que não for `err`/`alert` em `cigarro` e `meditar`. Todo texto novo passa por ela.
- **Sem custo de token:** o Claudin só lê; o botão `investigar` só preenche o prompt (princípio já documentado no README).
- **Fora do escopo:** palco animado, avatares, aura, barra de custo e limites, `turn.step` (fica como Fase 2 opcional, Task 7).

## Global Constraints

- Idioma do código, comentários, testes e textos: português, tom curto e sóbrio ("Subagente Explore em campo: ...").
- Nenhum envio automático de prompt: ação sugerida só chama `$.prompt.fill({ text, mode: 'replace' })`.
- Cada texto novo do balão passa por `speak($, mood, text, act?)`.
- Todo valor em `$.state`/`atom` declarado em `types/index.d.ts` sob `claudin` (o `claude plugin validate` cobra).
- O mod não acessa rede nem arquivos além de `$.store` (já é assim).
- A API de mods é de acesso antecipado: nenhuma tarefa pode depender de comportamento não confirmado na Task 1.
- Crédito ao legends-claude (MIT) no README e em comentário do `frota.ts` para o que for adaptado.
- Limites de tamanho: linha de resumo cabe em `TOOLBOX_W = 56` colunas; no máximo `FLEET_MAX_ROWS = 6` agentes listados na aba, o resto vira `+N`.

## Review Focus

- Subagente que nunca termina (some da lista do engine sem `completed`): a linha vira `done` após `MISSING_GRACE_MS = 3_000` sem aparecer na lista (o spike mostrou que o engine larga o agente da lista em menos de 1 s), não fica para sempre em "rodando".
- Dois agentes com o mesmo `type` e `description`: as linhas são distinguidas por `id`, nunca fundidas.
- 20 ou mais subagentes de uma vez (workflow): resumo continua numa linha ("20 agentes rodando"), balão de subida não dispara 20 vezes (no máximo um a cada `SPAWN_SAY_MS = 2_000`).
- Agente que falha enquanto o modo é `meditar`/`cigarro`: o erro ainda aparece; término normal não.
- `e.agentId` ausente (loop principal) e presente (subagente) na mesma sessão: fala por ferramenta continua só para o principal, e o contador `turn.cmds` do resumo de fim de turno não conta ferramentas de subagente como do principal sem decisão explícita (ver Task 4).
- Recarga do mod (`/reload-plugins`) com agentes rodando: a lista do engine readota as linhas.

---

### Task 1: Spike, confirmar o que chega de verdade no app

Nada é codificado antes de confirmar o que a API entrega. É a única tarefa manual.

**Files:**
- Create: `docs/superpowers/plans/spike-frota.md` (resultado do spike, 10-20 linhas)
- Modify (temporário, não commitar): `hooks/register.tsx`, acrescentando um `on('agent.spawn' ...)` e um log em `tool.call` que escrevam `JSON.stringify({ evento, agentId: e.agentId, tipo: e.subagentType })` no atom `log`

**Interfaces:**
- Produces: respostas por escrito às 4 perguntas abaixo; as Tasks 3 a 6 dependem delas.

- [ ] **Step 1: Instrumentar temporariamente** `agent.spawn` e `tool.call` para registrar `agentId` no atom `log` (aparece no histórico do Claudin).
- [ ] **Step 2: Rodar `claude --plugin-dir .` e disparar** uma tarefa que use 2 subagentes em paralelo (por exemplo dois `Explore`) e um que falhe (`Agent` com prompt que peça abrir arquivo inexistente).
- [ ] **Step 3: Anotar em `spike-frota.md` as respostas:** (a) `tool.call` de dentro do subagente chega ao hook do mod, com `e.agentId` preenchido? (b) `agent.spawn` devolve `agentId` e `model` em `next(e)`? (c) `$.agent.list()` mostra `status: 'completed'` e `'failed'` a tempo, e por quantos segundos o agente continua na lista? (Resultado: não mostra; ver `spike-frota.md`.) (d) `turn.complete` dispara por subagente, com `e.agentId`?
- [ ] **Step 4: Reverter a instrumentação** (`git checkout hooks/register.tsx`) e commitar só o `spike-frota.md`.

```bash
git add docs/superpowers/plans/spike-frota.md
git commit -m "docs: resultado do spike de eventos de subagente"
```

**Se (a) for "não":** o contador por agente passa a vir só de `$.agent.list()` (sem "última ferramenta"); ajustar a Task 4 e registrar no `spike-frota.md`.

---

### Task 2: Módulo puro `frota.ts` (estado e reconciliação)

**Files:**
- Create: `hooks/frota.ts`
- Test: `hooks/frota.test.ts`
- Modify: `types/index.d.ts`

**Interfaces:**
- Produces, em `hooks/frota.ts`:
  - `type FleetState = 'running' | 'waiting' | 'done' | 'failed'`
  - `type FleetRow = { id: string; type: string; description: string; model: string | null; state: FleetState; startedAt: number; seenAt: number; endedAt?: number; tools: number; lastTool: string | null }`
  - `const LINGER_MS = 8_000`, `const MISSING_GRACE_MS = 3_000`
  - `finish(rows: readonly FleetRow[], id: string, state: 'done' | 'failed', now: number): FleetRow[]` (desfecho vindo de `turn.complete` com `agentId`)
  - `upsert(rows: readonly FleetRow[], id: string, now: number, fn: (r: FleetRow) => FleetRow): FleetRow[]`
  - `reconcile(rows: readonly FleetRow[], listed: readonly AgentInfo[], now: number): FleetRow[]` (importa `AgentInfo` de `'claude-code'`)
  - `liveCount(rows: readonly FleetRow[]): number`
- Types em `types/index.d.ts`: `export type FleetState`, `export type FleetRow` (mesmos campos), e `fleet: FleetRow[]` em `PluginState.claudin`.

- [ ] **Step 1: Escrever os testes em `hooks/frota.test.ts`** (import `describe, expect, test` de `'claude-code/testing'`):
  - `upsert cria a linha quando o id é novo` → `upsert([], 'a1', 1000, r => ({ ...r, tools: 1 }))` devolve 1 linha com `id: 'a1'`, `state: 'running'`, `startedAt: 1000`, `tools: 1`.
  - `upsert não funde dois agentes de mesmo tipo e descrição` → após `upsert` de `'a1'` e `'a2'` com `type: 'Explore'`, há 2 linhas.
  - `reconcile marca done e endedAt quando a lista diz completed` → linha `running` + `{ id: 'a1', status: 'completed', type: 'Explore', description: 'x' }` ⇒ `state: 'done'`, `endedAt: now`.
  - `reconcile marca failed para failed e killed`.
  - `reconcile adota agente running que a lista conhece e não tem linha`.
  - `reconcile descarta linha terminada há mais de LINGER_MS`.
  - `reconcile marca done a linha viva fora da lista só depois de MISSING_GRACE_MS`; `finish` marca o desfecho de linha viva e não reescreve linha terminada.
  - `liveCount conta só running e waiting`.
- [ ] **Step 2: Rodar e ver falhar:** `claude plugin test .` ⇒ FAIL (módulo `./frota` não existe).
- [ ] **Step 3: Implementar `hooks/frota.ts`** com as assinaturas acima. Mapa de status do engine: `pending, running → running`; `waiting, idle → waiting`; `completed → done`; `failed, killed → failed`. Adaptar a lógica de `reconcileRows` do legends-claude (crédito em comentário). Texto livre de `type`/`description` cortado em 40/120 caracteres.
- [ ] **Step 4: Declarar `FleetRow`/`FleetState` e `fleet` em `types/index.d.ts`.**
- [ ] **Step 5: Rodar `claude plugin test .` e `claude plugin validate .`** ⇒ PASS.
- [ ] **Step 6: Commit**

```bash
git add hooks/frota.ts hooks/frota.test.ts types/index.d.ts
git commit -m "feat(frota): estado puro da frota de agentes e reconciliação com o engine"
```

---

### Task 3: O que o Claudin diz sobre a frota (texto e regras de fala)

**Files:**
- Modify: `hooks/frota.ts`
- Test: `hooks/frota.test.ts`

**Interfaces:**
- Consumes: `FleetRow`, `liveCount` (Task 2).
- Produces:
  - `const SPAWN_SAY_MS = 2_000`
  - `summaryLine(rows: readonly FleetRow[], now: number): string`: `''` sem agentes vivos; `'1 agente: Explore 12s'` com um; `'3 agentes rodando'` com 2 ou mais; sufixo ` · 1 falhou` quando há `failed` ainda na janela de `LINGER_MS`.
  - `spawnSay(row: FleetRow, live: number): string`: `'Subagente Explore em campo: <descrição curta>.'` com um vivo; `'<live> agentes em campo.'` com 2+.
  - `failSay(row: FleetRow): { text: string; action: { label: string; text: string } }`: texto `'Agente <type> falhou: <descrição curta>.'`, ação `{ label: 'investigar', text: 'O subagente <type> falhou na tarefa "<descrição>". Explique a causa provável e proponha o próximo passo.' }`.
  - `shouldSaySpawn(lastSayAt: number, now: number): boolean`: `true` se `now - lastSayAt >= SPAWN_SAY_MS`.

- [ ] **Step 1: Testes** com os valores exatos acima: `summaryLine([], 0) === ''`; um agente `Explore` iniciado há 12 s ⇒ `'1 agente: Explore 12s'`; três rodando ⇒ `'3 agentes rodando'`; 20 rodando ⇒ `'20 agentes rodando'`; 2 rodando + 1 `failed` recente ⇒ `'2 agentes rodando · 1 falhou'`; `failSay(...).action.label === 'investigar'`; `shouldSaySpawn(1000, 2999) === false` e `shouldSaySpawn(1000, 3000) === true`.
- [ ] **Step 2: Rodar `claude plugin test .`** ⇒ FAIL.
- [ ] **Step 3: Implementar** as quatro funções em `hooks/frota.ts`. Descrição cortada em 38 caracteres (mesmo `short` do `register.tsx`; mover `short` para um `hooks/texto.ts` só se for importado dos dois lados, senão duplicar a linha de uma função).
- [ ] **Step 4: Rodar `claude plugin test .`** ⇒ PASS.
- [ ] **Step 5: Commit**

```bash
git add hooks/frota.ts hooks/frota.test.ts
git commit -m "feat(frota): frases do balão e do resumo, com limite de fala por subida"
```

---

### Task 4: Ligar os eventos no `register.tsx`

**Files:**
- Modify: `hooks/register.tsx` (novo atom `fleet`; hooks `agent.spawn`, `tool.call`, `turn.complete`; tick no `stroll`)

**Interfaces:**
- Consumes: `upsert`, `reconcile`, `liveCount`, `spawnSay`, `failSay`, `shouldSaySpawn` (Tasks 2 e 3).
- Produces: atom `fleet = atom({ plugin: 'claudin', key: 'fleet' } as const, [] as FleetRow[])`; função interna `syncFleet($): Promise<void>` que lê `$.agent.list()`, reconcilia, grava no atom e fala quando uma linha vira `failed`.

- [ ] **Step 1: Teste de integração** em `tests/claudin.test.tsx`: stubar `on('agent.list', () => ({ value: [{ id: 'a1', type: 'Explore', description: 'mapear hooks', status: 'running' }] }))` e `on('clock.now', () => ({ value: 1000 }))`; chamar `$.tool.call({ tool: 'Read', file_path: 'x.ts', agentId: 'a1' })`; montar `AbovePrompt` e esperar `find({ type: 'Text', text: /1 agente: Explore/ })`. Segundo teste: o mesmo `tool.call` **não** produz o balão `Lendo x.ts.` (afirmar `find(... /Lendo x\.ts/)` indefinido). Terceiro: lista com `status: 'failed'` ⇒ balão `/Agente Explore falhou/` e botão com key `act`.
- [ ] **Step 2: Rodar** ⇒ FAIL.
- [ ] **Step 3: Implementar.**
  - `agent.spawn`: `const r = await next(e)`; se `r.agentId`, `upsert` com `type: e.subagentType`, `description: e.description`, `model: r.model`; falar `spawnSay` via `speak($, 'think', ...)` se `shouldSaySpawn` (guardar `lastSpawnSayAt` em variável do módulo).
  - `tool.call`: se `e.agentId` presente, só `upsert` (`tools + 1`, `lastTool: e.tool`) e `return next(e)`; não chama `speak` nem altera `lastCmd`/`lastFile`/`turn`. Sem `agentId`, comportamento atual intacto. (Decisão: ferramentas de subagente não entram no resumo de fim de turno do agente principal; o resumo ganha só a linha da frota na Task 5.)
  - `stroll` (a cada 1500 ms) chama `syncFleet($)`; transição para `failed` ⇒ `speak($, 'err', failSay(...).text, failSay(...).action)` uma única vez por `id` (marcar na linha).
  - `session.start` chama `syncFleet($)` (readota após `/reload-plugins`).
- [ ] **Step 4: Rodar `claude plugin test .` e `claude plugin validate .`** ⇒ PASS, e os 230 testes existentes continuam verdes.
- [ ] **Step 5: Commit**

```bash
git add hooks/register.tsx tests/claudin.test.tsx
git commit -m "feat(frota): Claudin acompanha subagentes por agent.spawn, tool.call e agent.list"
```

---

### Task 5: Mostrar a frota (linha de resumo, fim de turno e aba Frota)

**Files:**
- Modify: `hooks/register.tsx` (função `draw`, constante `CATS`/`CAT_LABEL`, bloco de `turn.complete`)

**Interfaces:**
- Consumes: `summaryLine`, `FleetRow`, atom `fleet` (Task 4).
- Produces: `CATS` ganha `'frota'`, `CAT_LABEL.frota = 'Frota'`; linha de resumo dentro do balão com `key: 'fleet-line'`; linhas da aba com `key: 'ag-<id>'`.

- [ ] **Step 1: Testes de UI** (loop `['terminal', 'desktop']`, padrão do arquivo): com `fleet` populado por `agent.list`, `find({ key: 'fleet-line' })` definido e texto batendo `summaryLine`; sem agentes, `find({ key: 'fleet-line' })` indefinido (nada de linha vazia); abrir a caixa, `press({ key: 'cat-frota' })`, `find({ key: 'ag-a1' })` definido; com 8 agentes, 6 linhas e um texto `+2`; no fim de turno com frota, o resumo inclui `, 2 agentes` (ex.: `Pronto: 1 arquivo editado, 2 agentes.`).
- [ ] **Step 2: Rodar** ⇒ FAIL.
- [ ] **Step 3: Implementar.** Linha de resumo em `dimColor` sob o texto do balão, só quando `summaryLine` não é vazio; aba Frota com uma linha por agente (`<ícone de estado> <type> · <descrição curta> · <tempo> · <n> tools`), limite `FLEET_MAX_ROWS = 6`; `turn.complete` acrescenta `N agente(s)` às `parts` quando houve subida no turno (contador `spawnedInTurn`, zerado em `prompt.submit`).
- [ ] **Step 4: Rodar `claude plugin test .`** ⇒ PASS.
- [ ] **Step 5: Commit**

```bash
git add hooks/register.tsx tests/claudin.test.tsx
git commit -m "feat(frota): linha de resumo, aba Frota e agentes no fim de turno"
```

---

### Task 6: Poses e modos coerentes com a frota

**Files:**
- Modify: `hooks/register.tsx`
- Test: `tests/claudin.test.tsx`

**Interfaces:**
- Consumes: `liveCount` (Task 2), `speak` (existente).

- [ ] **Step 1: Testes:** (a) com agente vivo e nenhuma ferramenta do principal rodando, a pose é `think` (olhos para cima) e não `idle`; o `stroll` não faz o mascote passear enquanto `liveCount > 0` (afirmar `walk.x` inalterado após o tick); (b) no modo `meditar`, `spawnSay` não aparece e `failSay` aparece; (c) no modo `cigarro`, idem.
- [ ] **Step 2: Rodar** ⇒ FAIL.
- [ ] **Step 3: Implementar:** `settle` não devolve para `idle` enquanto `liveCount > 0`; quando a frota zera, voltar a `idle` com `'Aguardando.'`; `stroll` retorna cedo com frota viva.
- [ ] **Step 4: Rodar `claude plugin test .`** ⇒ PASS.
- [ ] **Step 5: Commit**

```bash
git add hooks/register.tsx tests/claudin.test.tsx
git commit -m "feat(frota): pose de pensando enquanto há agentes e respeito aos modos"
```

---

### Task 7: Documentação e validação no app

**Files:**
- Modify: `README.md` (seção "O que ele faz": parágrafo "Acompanha a frota"; tabela de abas ganha "Frota"; seção de créditos citando o legends-claude, MIT)
- Modify: `projeto/08-log.md` (registro da validação)
- Test: manual no app

- [ ] **Step 1: Atualizar o README** (frota, aba, crédito e link ao legends-claude; manter o tom sóbrio).
- [ ] **Step 2: Validar no app com prints** (feito pelo Thomáz, conforme o RACI do `projeto/07-plano.md`): (a) uma tarefa com 2 subagentes: balão de subida, linha de resumo, aba Frota; (b) um subagente que falha: balão vermelho com `investigar`; (c) modo `meditar`: só o erro aparece; (d) `/reload-plugins` no meio de um agente: a linha reaparece em até 2 s.
- [ ] **Step 3: Registrar em `projeto/08-log.md`** o resultado e os prints, e commitar.

```bash
git add README.md projeto/08-log.md
git commit -m "docs(frota): README, créditos ao legends-claude e log de validação"
```

---

### Task 8 (opcional, Fase 2): reagir ao fluxo do modelo com `turn.step`

Só entra depois que a Fase 1 estiver validada, porque `turn.step` é um evento de streaming (hook como `async function*`) que roda a cada pedaço da resposta e pode custar desempenho.

**Files:**
- Modify: `hooks/register.tsx`
- Test: `tests/claudin.test.tsx`

**Interfaces:**
- Consumes: tipo `TurnStepChunk` em `claude-code` (confirmar campos no `.d.ts` antes: o plano não os assume).

- [ ] **Step 1: Ler `TurnStepChunk` e `TurnStepInput`** em `.claude-plugin/types/claude-code/index.d.ts` e escrever em `spike-frota.md` quais pedaços distinguem "pensando" de "escrevendo resposta".
- [ ] **Step 2: Teste:** durante um `turn.step` de pensamento, a pose é `think`; ao chegar texto, volta para `idle` sem trocar o balão mais de 1 vez por segundo (limitar com `$.clock.now()`).
- [ ] **Step 3: Implementar** `on('turn.step', async function* ($, e, next) { yield* next(e) ... })` encaminhando todos os pedaços sem alterá-los; efeitos colaterais em `void` (sem esperar), para o stream nunca ficar atrás do Claudin.
- [ ] **Step 4: Medir** (manual) que o stream não atrasa; se atrasar, descartar a tarefa.
- [ ] **Step 5: Commit** `feat(frota): pose segue o fluxo do modelo via turn.step`.

---

## Self-review

- **Cobertura:** acompanhar agentes (T2, T4), falar com critério (T3), mostrar (T5), coerência com poses/modos (T6), docs e validação (T7), fluxo do modelo (T8). Palco/aura/custo ficam de fora de propósito (Decisões de desenho).
- **Consistência de nomes:** `FleetRow`, `FleetState`, `upsert`, `reconcile`, `liveCount`, `summaryLine`, `spawnSay`, `failSay`, `shouldSaySpawn`, `syncFleet`, `SPAWN_SAY_MS`, `LINGER_MS`, `STALE_MS`, `FLEET_MAX_ROWS` usados do mesmo jeito em todas as tarefas.
- **Incertezas assumidas e como são tratadas:** `tool.call` de subagente com `agentId`, `status` da lista e `turn.complete` por agente são confirmados na Task 1 antes de qualquer código; o nome do evento para stub de `$.agent.list()` em teste (`'agent.list'`) segue o padrão de `command.list` já usado nos testes e se confirma ao escrever o primeiro teste da Task 4.
