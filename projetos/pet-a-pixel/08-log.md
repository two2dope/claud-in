# Log de Gestão — Pet-a-Pixel

## 2026-10-31
Status: Plano de projeto homologado pelo stakeholder. Transição oficial para a Etapa 8 (Gestão / Execução Viva). Início imediato da construção dos entregáveis técnicos dos Marcos 1 a 4.
Riscos: 3 riscos ativos registrados com gatilhos, donos e mitigações (Motion blur no Veo, distorção anatômica interespécies e legibilidade tipográfica no Card). Todos monitorados; nenhum gatilho disparado até o momento.
Decisões: Aprovado o escopo com 2 Custom Tools nativas no Google Flow, matriz etológica canônica e guia de encadeamento de nós no Canvas.
Variação: Planejamento concluído dentro do cronograma da sessão sem desvios de escopo.
Carga: Capacidade operacional nominal dedicada à redação das especificações executáveis e prompts mestres.

## 2026-10-31 (Execução dos Marcos 1 a 4)
Status: Todos os 4 marcos do plano foram executados e entregues na pasta `projetos/pet-a-pixel/entregaveis/`.
- Marco 1 concluído: `01_custom-tool-spritesheet.md` (especificação da Tool de Sprites e Cenas com ticket de metadados).
- Marco 2 concluído: `02_custom-tool-card-tcg.md` (especificação da Tool de Card Colecionável Super Trunfo).
- Marco 3 concluído: `03_matriz-etologica.md` (matriz comportamental multi-espécies baseada em Dogster e RSPCA).
- Marco 4 concluído: `04_guia-pipeline-flow.md` (topologia do Canvas, prompts de motion Veo e checklist operacional).
Riscos: Revisados. As mitigações de motion blur no Veo e de isolamento de células foram devidamente embutidas nos prompts mestres entregues.
Decisões: Entrega consolidada e documentada para uso direto no Google Flow.
Variação: Zero desvio em relação ao plano aprovado.
Carga: Concluída a sprint de engenharia estrutural.

## 2026-10-31 (Aplicação das Correções da Auditoria Full-Audit)
Status: Correções críticas C1, C2 e C3 e recomendações R1 e R2 aplicadas com sucesso nos 4 arquivos de entregáveis.
- `01_custom-tool-spritesheet.md` atualizado para v1.1: Canvas definido em 3840×2160 (16:9) com cotas de proporção (15% Ticket, 60% Grade 4×6, 25% Keyframes) e regra de ignorar fundo complexo.
- `02_custom-tool-card-tcg.md` atualizado para v1.1: Blindagem de caixas numéricas (#151A21 / #E0E6ED), tipografia display stencil/block e regra de isolamento da foto.
- `03_matriz-etologica.md`: Inclusão da Família 3 (Pequenos Mamíferos: Roedores/Coelhos) e separação de Répteis em Lagartos (quadrúpedes) e Serpentes (ápodes).
- `04_guia-pipeline-flow.md`: Inclusão formal dos 4 nós de utilitário Crop no diagrama Mermaid e passo a passo, além de diretivas rígidas anti-deformação anatômica nos prompts Veo com loops de 2-3 segundos.
Riscos: Mitigados e reavaliados. O risco de motion blur e superlotação de canvas foram eliminados pelas novas diretivas geométricas e prompts estruturados.

## 2026-11-01 (Validação Empírica no Google Flow e Fechamento de Ciclo)
Status: Testes empíricos executados com sucesso no motor generativo do Google Flow, com validação de dois animais reais (Cão mestiço preto e castanho / Black and Tan e Cacatua/Pássaro branco).
- O que andou:
  1. A geração visual de spritesheets em grade canônica 4×6 (24 células sobre fundo #26303D) atingiu maturidade e consistência anatômica comprovada tanto para Caninos quanto para Aviários (sem antropomorfismo, proporções corretas e respeito à pelagem/penas reais).
  2. A Tool 2 (Pet-a-Pixel TCG Forge) validou a renderização do card heroico colecionável.
  3. A matriz etológica funcionou na prática para direcionar as poses canônicas (Repouso, Ação, Celebração, Alerta).
- O que travou:
  1. A camada de interface e código interativo no editor do Google Flow apresentou instabilidade recorrente de sincronização (conflitos entre a resolução 100% da folha e o overlay de guias, limitações no sandbox para exportações complexas e fatiamento dinâmico no browser).
- O que vem:
  Pausa tática do ciclo para análise retrospectiva. O usuário fará uma revisão aprofundada dos resultados obtidos para formular uma nova proposta arquitetural.
Riscos:
- O risco de alucinação anatômica do modelo foi mitigado com sucesso via engenharia de prompt restritiva.
- Risco ativo transferido: fragilidade do ambiente de sandbox do Flow para empacotamento multimídia complexo (sugerindo futura desacoplamento para client local ou script headless).
Decisões:
- Settled: A geração pura da folha 4×6 em 16:9 sobre #26303D é o contrato definitivo mais estável para modelos de difusão de imagem.
- Settled: Remoção da aba Card TCG da Tool 1 (Tool 1 focada 100% em Sprites e Animação).
Variação: Conclusão bem-sucedida da prova de conceito generativa com identificação dos gargalos de UI do Flow.
Carga: Ciclo de desenvolvimento finalizado para esta sessão. Projeto salvo em estado estável.
