# Brief — Pet-a-Pixel

## 1. Identificação e Contexto Estratégico
- **Nome do Projeto:** Pet-a-Pixel.
- **Contexto:** Plataforma Google Flow (ferramentas personalizadas / Custom Tools e pipeline de canvas multimodal).
- **Problema Central:** Transformar fotografias reais de animais de estimação (cães, gatos, aves, répteis) em assets digitais animados de alta consistência estética e cards colecionáveis sem perda de fidelidade anatômica, sem alucinação de texto e aproveitando a capacidade nativa de geração de imagem e vídeo do Google Flow.
- **Grau de Abertura:** Restrito (especificações técnicas, entradas, prompts e saídas delimitadas).

## 2. Objetivos e Métricas (SMART)
- **Elevator Pitch:** "Uma suíte de Custom Tools nativas para o Google Flow que converte fotos de pets reais em animações contínuas, folhas padronizadas de sprites e cards colecionáveis gamificados orientados por etologia comportamental."
- **Critérios SMART:**
  - **S (Específico):** Entrega de 2 Custom Tools nativas no Flow (Gerador de Sprites & Cenas-Chave; Gerador de Cards Colecionáveis) integráveis ao nó de vídeo Veo do Flow.
  - **M (Mensurável):** Taxa de alinhamento de 100% na grade 4×6 (16:9 sobre fundo #26303D); conformidade de 4 estados etológicos padronizados.
  - **A (Atingível):** Prompts mestres parametrizados com restrições negativas rígidas já testadas no ecossistema Flow.
  - **R (Relevante):** Elimina a dependência de scripts complexos externos ao delegar a geração de vídeo ao motor nativo Image-to-Video do Flow.
  - **T (Temporal):** Conclusão e homologação dos templates e especificações nesta sprint.

## 3. Público-Alvo
- **Primário:** Tutores de animais de estimação e criadores de conteúdo que desejam eternizar seus pets em formatos gamificados e estilizados.
- **Secundário:** Desenvolvedores de jogos independentes e criadores de mascotes virtuais (ecossistema de desktop pets/Codex).
- **Necessidades e Dores:** Dificuldade em manter consistência de iluminação, proporções e pose entre diferentes animações; quebra de anatomia ao tentar estilizar espécies não-caninas; frustração com textos ilegíveis gerados por IA.

## 4. Mensagem, Tom e Chamada para Ação
- **Mensagem-Chave:** "Seu pet real transformado em lenda de pixel art e card de batalha com fidelidade comportamental autêntica."
- **Tom de Voz:** Técnico, preciso, lúdico e afetuoso.
- **Chamada para Ação (CTA):** "Gere o pack oficial do seu pet no Google Flow."

## 5. Escopo, Entregáveis e Especificações Técnicas
- **Entregáveis no Google Flow:**
  1. **Custom Tool 1 (`Pet-a-Pixel: Spritesheet & Keyframes`):**
     - Inputs: `{pet_name}`, `{species_group}`, `{physical_traits}`, `{personality_temperament}`, `{lighting_mood}`.
     - Saídas: Grade 4×6 sobre fundo `#26303D` com ticket de metadados + 4 Cenas-Chave isoladas com enquadramento cinematográfico para animação direta.
  2. **Custom Tool 2 (`Pet-a-Pixel: Collectible TCG Card`):**
     - Inputs: `{pet_name}`, `{element_class}`, `{primary_ability}`, `{stat_profile}`, `{frame_rarity}`.
     - Saída: Card em proporção 2.5:3.5 com arte do pet em pose de ação, moldura temática e caixas delimitadas para atributos.
  3. **Especificação de Pipeline de Vídeo Nativo (Veo / VideoFX):**
     - Prompting para nó Image-to-Video encadeado às 4 cenas-chave, gerando loops de animação nativos (MP4/WebM) diretamente no canvas do Flow.
  4. **Ticket de Sessão / Metadata:**
     - Bloco de dados contendo nome, configurações, data ISO e semente de execução embutido na saída.
- **Não-Escopo:**
  - Criação de servidores dedicados de backend ou bancos de dados relacionais proprietários.

## 6. Cronograma e Marcos
- **Marco 1:** Aprovação do Brief e Especificação Formal das Custom Tools (Hoje).
- **Marco 2:** Formulação dos Prompts Mestres e Dicionário de Variáveis no Flow.
- **Marco 3:** Matriz Etológica de Comportamentos (Dogster/RSPCA expandido para Cães, Gatos, Aves e Répteis).
- **Marco 4:** Validação de Execução no Canvas do Flow (Image + Video Flow).

## 7. Orçamento, Recursos e Governança
- **Recursos Necessários:** Acesso à interface ativa do Google Flow; documentação técnica de Custom Tools.
- **Matriz RACI:**
  - **Responsável (R):** Antigravity (Engenharia de Prompts e Arquitetura).
  - **Aprovador (A):** Thomáz (Stakeholder e Usuário Final).
  - **Consultado (C):** Diretrizes etológicas RSPCA / Dogster.
  - **Informado (I):** Equipe técnica.

## 8. Riscos, Premissas e Anexos
- **Risco 1:** O nó de vídeo do Flow distorcer a estética de pixel art ao interpolar quadros | Mitigação: Inserir diretrizes restritivas no prompt de vídeo (`strict pixel art style, zero motion blur, preserve 16-bit contours`).
- **Premissa 1:** O operador anexa de 1 a 3 imagens do pet no workspace do Flow e referencia a mídia na chamada da ferramenta.
- **Anexos:**
  - Dogster Facial Expressions: `https://www.dogster.com/lifestyle/dog-facial-expressions/`
  - RSPCA Dog Behaviour: `https://www.rspca.org.uk/adviceandwelfare/pets/dogs/behaviour/understanding`
  - Guia de Custom Tools do Google Flow (`doc5_google_flow.md`).

---

## Briefing de Retorno
- **O que entendemos:** O projeto Pet-a-Pixel será implementado com foco no aproveitamento máximo da infraestrutura do Google Flow. Em vez de obrigar o usuário a instalar scripts locais para recortar matrizes de sprites e compilar GIFs manualmente, o próprio Flow gerará os vídeos/animações através de seus nós de geração de vídeo a partir de cenas-chave do pet, enquanto a folha 4×6 serve como ficha técnica e asset exportável.
- **Tensão Técnica Resolvida:** Modelos de vídeo generativo (como Veo) falham catastroficamente se tentarem animar uma folha 4×6 inteira com 24 miniaturas de uma vez só. A solução técnica arquitetada consiste em fazer a Custom Tool 1 gerar simultaneamente a folha-mestre 4×6 e as 4 cenas-chave independentes em alta resolução para que os nós de vídeo do Flow criem as 4 animações contínuas perfeitas.
- **HMW (Problema Reenquadrado):** "Como nós poderíamos transformar fotos e comportamentos autênticos de qualquer pet em animações fluidas, fichas técnicas de sprites e cards colecionáveis diretamente dentro do Google Flow, sem necessidade de softwares ou scripts externos de edição?"
- **Critérios de Sucesso:**
  1. Especificação completa e pronta para cópia/colagem das 2 Custom Tools no Google Flow.
  2. Dicionário padronizado de variáveis de entrada com tipos e valores válidos.
  3. Matriz etológica com vocabulário de pose para cães, gatos, aves e répteis.
  4. Fluxo documentado de encadeamento no Canvas do Flow (Fotos ➔ Tool 1 ➔ Nós de Vídeo ➔ Tool 2).

