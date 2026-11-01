# Descoberta — Pet-a-Pixel

## Perguntas 5W1H (priorizadas)
- **Quem (Who):** Tutores de animais domésticos (cães, gatos, aves, répteis) e criadores de jogos/assets que buscam transformar fotos reais em pets virtuais animados e cards colecionáveis.
- **O quê (What):** Uma suíte composta por 2 Custom Tools nativas no Google Flow (Tool 1: Folha 4×6 de Sprites com calibração etológica; Tool 2: Card Colecionável TCG/Super Trunfo) articuladas a um pipeline de pós-processamento para fatiamento, compilação de GIFs e carimbo de dados.
- **Onde (Where):** Geração no canvas do Google Flow; pós-processamento, visualização e empacotamento em ferramenta externa.
- **Quando (When):** Fluxo sob demanda disparado pelo operador ao carregar fotos e preencher o formulário no Flow.
- **Por quê (Why):** Modelos generativos tradicionais falham em geometria uniforme de spritesheets e distorcem tipografia em cards; a divisão modular resolve a consistência visual e garante fidelidade anatômica/etológica sem quebra de formato.
- **Como (How):** Tool 1 gera grade 4×6 sobre fundo `#26303D` com 4 estados funcionais universais; Tool 2 gera arte em proporção 2.5:3.5 com moldura e áreas de atributos; script/web studio fatia as células, gera animações e finaliza os cards.

## Respostas de stakeholders (Decisões de Design)
1. **Plataforma Principal:** Google Flow (duas ferramentas nativas de Canvas com inputs parametrizados).
2. **Entradas:** 1 a 3 fotografias do animal + campos estruturados de espécie, características e personalidade.
3. **Padrão de Sprites:** Folha 4×6 (16:9), células padronizadas sobre fundo sólido `#26303D`.
4. **Base Comportamental:** Dogster e RSPCA adaptados em 4 estados funcionais (Repouso, Ação/Foco, Vitória/Celebração, Defesa/Alerta).
5. **Estrutura do Card:** Proporção TCG com ilustração heroica e caixas vazadas para receber carimbo de tipografia e stats numéricos (Super Trunfo).

## Plano de pesquisa (Método e Fontes)
- Pesquisa Secundária: Extração de vocabulário anatômico e postural a partir das diretrizes de linguagem corporal da RSPCA e Dogster.
- Teste de Consistência Geométrica: Validação das caixas de contenção de células e tolerância de cor do fundo chumbo (#26303D).

## Achados (Coluna L do KWHL)
- O modelo de difusão preserva proporções quando ancorado em 4 estados e 6 colunas, evitando colisão de membros entre células vizinhas.
- A geração da moldura com caixas de dados vazias elimina o risco de alucinação de texto pelo modelo generativo de imagem.

## Premissas validadas e invalidadas
- **Validada:** Desacoplar geração de imagem pura (Flow) do fatiamento e compilação de GIFs (pipeline externo) é a única forma de obter arquivos finais utilizáveis sem falha de sistema.
- **Invalidada:** Tentar gerar todo o texto e números do card diretamente via modelo de difusão no Flow (risco crítico de texto ilegível / artefatos tipográficos).

