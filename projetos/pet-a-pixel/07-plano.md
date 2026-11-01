# Plano de Projeto — Pet-a-Pixel

## Termo de Abertura Resumido
- **Escopo:** Especificação técnica e implementação de 2 Custom Tools no Google Flow (`Pet-a-Pixel: Spritesheet & Keyframes` e `Pet-a-Pixel: Collectible TCG Card`) conectadas aos nós de vídeo nativos Veo do Flow, com dicionário de variáveis parametrizadas, matriz etológica (Dogster/RSPCA) e guia de execução no Canvas.
- **Objetivo Central:** Permitir que operadores e tutores gerem, a partir de fotos reais de animais domésticos, spritesheets de alta consistência 4×6 (16:9 em fundo `#26303D`), 4 animações contínuas em loop (MP4/WebM nativas) e cards colecionáveis estilo Super Trunfo/Pokémon, sem necessidade de softwares externos de corte ou compilação.
- **Responsabilidades:** Thomáz (Aprovador e Dono do Projeto); Antigravity (Arquiteto de Prompts, Estruturas e Documentação Técnica).

---

## Os 7 Passos do Plano

### 1. Metas e Objetivos
- **Meta Primária:** Estabelecer a suíte "Pet-a-Pixel" como a ferramenta canônica de geração e estilização de animais virtuais animados e cards colecionáveis no Google Flow.
- **Objetivos de Entrega:**
  1. Especificação executável da Custom Tool 1 com formulário de variáveis e prompt mestre estruturado.
  2. Especificação executável da Custom Tool 2 com molduras e caixas de dados Super Trunfo balanceados.
  3. Matriz etológica operacional com vocabulário de pose por família (Cão, Gato, Ave, Réptil).
  4. Guia passo a passo de encadeamento dos nós no Canvas do Google Flow (Image-to-Video).

### 2. Métricas de Sucesso (SMART)
- **Alinhamento de Grade:** 100% de conformidade com a matriz 4×6 em 16:9 sem colisão de células vizinhas.
- **Isolamento Cromático:** Fundo chumbo uniforme `#26303D` com tolerância zero para sombras de contato no piso.
- **Estabilidade de Movimento:** Animações geradas no Veo com câmera travada (zero pan/zoom) e contornos em estilo pixel art preservados.
- **Balanceamento Numérico:** Cards gerados com 5 atributos de 1 a 100 somando exatamente 350 pontos totais.

### 3. Participantes, Funções e Riscos
- **Matriz RACI:**
  - **Responsável (R):** Antigravity (Desenvolvimento dos prompts mestres, schemas e documentação).
  - **Aprovador (A):** Thomáz (Homologação de escopo, design e gates).
  - **Consultado (C):** Manuais etológicos RSPCA / Dogster.
  - **Informado (I):** Comunidade técnica / Ecossistema Codex Pet.

- **Registro de Riscos:**
  1. **Risco 1: Interpolação excessiva do modelo de vídeo (Motion Blur)**  
     - *Gatilho:* Modelo Veo tentar suavizar quadros gerando borrões orgânicos em vez de saltos secos de pixel art.  
     - *Dono:* Antigravity.  
     - *Mitigação:* Diretiva rígida de motion no prompt do Flow (`pixel-perfect stepped animation, 0% motion blur, sharp edge preservation`).  
     - *Contingência:* Reduzir a taxa de quadros e forçar o loop pendular no nó de vídeo.  
     - *Última Revisão:* 2026-10-31.
  2. **Risco 2: Distorção de membros em espécies não-caninas**  
     - *Gatilho:* Aves e répteis gerados com traços anatômicos de mamíferos.  
     - *Dono:* Antigravity.  
     - *Mitigação:* Variável `{species_group}` ativando blocos de anatomia e etologia exclusivos por família animal.  
     - *Contingência:* Inserir restrições negativas específicas por grupo taxonômico no prompt mestre.  
     - *Última Revisão:* 2026-10-31.
  3. **Risco 3: Ilegibilidade de tipografia no Card Colecionável**  
     - *Gatilho:* Modelo de difusão renderizar textos ilegíveis ou números truncados nas caixas de stats.  
     - *Dono:* Thomáz.  
     - *Mitigação:* Instruções de layout com tipografia bold de alta escala em caixas de alto contraste ou template vazado.  
     - *Contingência:* Exportar a arte da carta como ilustração heroica com moldura e preencher dados via camada vetorial/canvas se houver distorção crítica.  
     - *Última Revisão:* 2026-10-31.

### 4. Orçamento e Recursos
- **Recursos Técnicos:** Conta ativa no Google Flow com permissão para criação de Custom Tools e acesso a nós de mídia e vídeo (Veo/VideoFX).
- **Tempo e Custo:** Execução viabilizada via tokens da sessão ativa, sem necessidade de servidores externos ou banco de dados.

### 5. Marcos e Entregáveis
- **Marco 1: Especificação Formal da Custom Tool 1 (Sprites & Cenas)**
  - *Critério binário:* Feito / Não feito (Documento de Tool com variáveis e prompt mestre pronto para colar no Flow).
- **Marco 2: Especificação Formal da Custom Tool 2 (Card TCG)**
  - *Critério binário:* Feito / Não feito (Documento de Tool com variáveis de atributos e layout de carta colecionável).
- **Marco 3: Matriz Etológica Canônica (Dogster / RSPCA)**
  - *Critério binário:* Feito / Não feito (Tabela estruturada de comandos de pose para 4 espécies e 4 estados de animação).
- **Marco 4: Arquitetura de Conexão no Canvas (Pipeline Guide)**
  - *Critério binário:* Feito / Não feito (Instruções detalhadas de encadeamento dos nós no Google Flow).

### 6. Cronograma e Roadmap (Estimativa PERT)
- **Tarefa 1.1:** Dicionário de Variáveis e Prompt da Tool 1 (O: 20 min, P: 30 min, E: 50 min) ➔ **Te: 32 min**
- **Tarefa 1.2:** Dicionário de Variáveis e Prompt da Tool 2 (O: 20 min, P: 30 min, E: 50 min) ➔ **Te: 32 min**
- **Tarefa 1.3:** Matriz Etológica de Comportamento Animal (O: 15 min, P: 25 min, E: 45 min) ➔ **Te: 26 min**
- **Tarefa 1.4:** Manual do Pipeline de Canvas do Flow (O: 15 min, P: 20 min, E: 40 min) ➔ **Te: 22 min**
- **Folha de contingência (+20%):** 22 min.
- **Esforço Total Estimado:** ~2 horas de engenharia estruturada e implementação direta.

### 7. Plano de Comunicação e Governança
- **Canal de Registro:** Atualização sequencial no dossiê `projetos/pet-a-pixel/dossie.md` e artefatos formais.
- **Cadência de Revisão de Riscos:** A cada nova iteração ou sessão ativa (revisão mínima semanal).
- **Critério de Aceite Final:** Aprovação expressa dos templates das Custom Tools e do guia de encadeamento de nós pelo usuário.

