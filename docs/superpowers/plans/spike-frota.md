# Spike: eventos de subagente (Task 1)

Feito em 2026-11-17 com um mod descartável (fora do repo) numa sessão headless
`claude -p ... --plugin-dir <spike> --model haiku`, com dois subagentes `Explore` em paralelo.
Versão do CLI: 2.1.312. Não cobre o app desktop nem um agente que falha.

| Pergunta | Resposta observada |
|---|---|
| (a) `tool.call` de dentro do subagente chega ao hook com `agentId`? | **Sim.** Bash/Glob do subagente chegam com `agentId`; o `Agent` do loop principal chega sem. |
| (b) `agent.spawn` devolve `agentId` e `model` em `next(e)`? | **Sim.** `{ model: 'claude-haiku-5-5', agentId: '...' }`. Ordem: `turn.start(agentId)` e `agent.spawn` no mesmo instante. |
| (c) `$.agent.list()` mostra `completed`/`failed`? | **Não observado.** O agente sai da lista menos de 1 s depois do `turn.complete`; em polls de 1 s nunca apareceu `completed`. Em sessão headless, depois do fim da sessão `$.agent.list()` rejeita ("no session is bound"): tratar com try/catch. |
| (d) `turn.complete` dispara por subagente, com `agentId`? | **Sim**, com `reason: 'answer'` e `agentId`. Também há `turn.start` com `agentId`. |

## Consequências para o plano

- O desfecho de um agente (feito ou falhou) vem de `turn.complete` com `agentId` (`reason === 'answer'` é feito; qualquer outro, falhou), não do `status` da lista.
- Linha viva que **já foi vista** na lista e **some** dela sem `turn.complete` vira `done` após `MISSING_GRACE_MS`. Linha que a lista **nunca nomeou** (agente de workflow) só termina por `turn.complete` ou por `STALE_MS` (revisão final).
- `status: 'failed' | 'killed'` da lista continua mapeado para `failed`, caso apareça.
- Agente com falha real não foi reproduzido neste spike; a validação no app (Task 7) cobre isso.
