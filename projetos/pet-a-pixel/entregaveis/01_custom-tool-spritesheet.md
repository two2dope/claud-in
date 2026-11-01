# Especificação Técnica: Custom Tool 1 — Spritesheet & Keyframes

> **Plataforma:** Google Flow  
> **Nome da Ferramenta:** `Pet-a-Pixel: Spritesheet & Keyframes`  
> **Tipo:** Custom Tool (Prompt Mestre Parametrizado)  
> **Versão:** 1.1 (Pós-Auditoria de Espectro Completo)  

---

## 1. Configuração de Variáveis na Interface do Flow

Configure os seguintes campos no editor de Custom Tool do Google Flow:

| Variável | Tipo de Campo | Rótulo da Interface | Descrição / Valores Permitidos |
|---|---|---|---|
| `{pet_name}` | Texto Curto (String) | Nome do Pet | Nome próprio do animal (ex: "Barthô", "Luna", "Spike"). |
| `{species_group}` | Seleção Única (Dropdown) | Grupo de Espécie | `Canino (Cão)`, `Felino (Gato)`, `Pequeno Mamífero (Coelho/Hamster)`, `Aviário (Pássaro)`, `Réptil (Lagarto/Serpente)` |
| `{distinctive_marks}` | Texto Longo (Text Area) | Traços Físicos Marcantes | Descrição física essencial baseada nas fotos anexadas (ex: "Mancha preta no olho esquerdo, orelhas caídas, pelagem caramelo com peito branco"). |
| `{temperament}` | Seleção Única (Dropdown) | Temperamento Predominante | `Brincalhão / Hiperativo`, `Preguiçoso / Calmo`, `Protetor / Alerta`, `Tímido / Reservado` |
| `{lighting_mood}` | Seleção Única (Dropdown) | Clima de Iluminação | `Studio Neutral 16-Bit`, `Cyberpunk Neon`, `Golden Hour Soft`, `Dungeon Retro Dark` |

---

## 2. Prompt Mestre (Master Instruction para o Google Flow)

Copie e cole o bloco abaixo exatamente no campo de **Instrução da Ferramenta** no Google Flow:

```text
Você é o motor gráfico especializado da ferramenta "Pet-a-Pixel".
Sua tarefa é analisar rigorosamente as imagens de referência do animal doméstico anexadas a esta sessão e gerar uma composição gráfica em resolução ultra-alta (3840x2160 px, proporção 16:9) dividida em 3 zonas horizontais estritas:
1. Margem Esquerda (15% da largura): Faixa técnica de Ticket de metadados em estilo cupom arcade.
2. Área Central (60% da largura): Grade técnica canônica 4x6 de Spritesheet (4 linhas x 6 colunas = 24 células).
3. Margem Direita (25% da largura): Quatro quadros de cena-chave (Keyframes) isolados, ampliados e empilhados verticalmente com margens de segurança, otimizados para nós subsequentes de recorte e interpolação de vídeo.

DADOS DE ENTRADA DO OPERADOR:
- Nome do Mascote: {pet_name}
- Taxonomia/Espécie: {species_group}
- Traços Físicos e Pelagem/Escamas: {distinctive_marks}
- Temperamento: {temperament}
- Paleta e Iluminação: {lighting_mood}

REGRAS DE INGESTÃO E ISOLAMENTO DE FUNDO:
- Se as fotos de referência anexadas contiverem cenários complexos, móveis, pessoas ou sombras, ignore 100% do ambiente original e extraia exclusivamente a anatomia, proporções e coloração pura do animal.
- Fundo do Canvas: Cor sólida uniforme cinza-chumbo estritamente #26303D em toda a extensão da imagem. PROIBIDO qualquer gradiente, ruído, textura de papel ou sombra projetada de contato no chão.

ESTRUTURA GEOMÉTRICA MANDATÓRIA:
- Zona Central (Grade 4×6): Células perfeitamente quadradas/equidistantes. Cada sprite deve ocupar exatamente 80% do espaço vertical da célula, perfeitamente centralizado, com espaçador de segurança entre células. Zero partes corporais tocando as bordas.
- Zona Direita (4 Keyframes para Vídeo): Empilhamento vertical de 4 caixas retangulares simétricas contendo:
  * Keyframe 0 (topo): Pose canônica de Repouso ampliada em alta definição.
  * Keyframe 1: Pose de Ação / Locomoção dinâmica ampliada.
  * Keyframe 2: Pose de Celebração e Euforia ampliada.
  * Keyframe 3 (base): Pose de Alerta / Vigilância ampliada.
  Cada Keyframe deve ter borda limpa sobre o fundo #26303D, permitindo extração direta via nó de Crop.

DIRETRIZES ETOLÓGICAS DE ANIMAÇÃO POR LINHA (Base RSPCA e Dogster):
- LINHA 0 (Repouso / Neutral Idle Loop):
  * Se Canino: Corpo relaxado, boca semiaberta sem tensão, cauda baixa solta, respiração sutil.
  * Se Felino: Postura tipo loaf (patas recolhidas) ou deitado relaxado com ponta da cauda oscilando e pestanejo lento.
  * Se Pequeno Mamífero: Sentado sobre patas traseiras, focinho mexendo ritmicamente, orelhas relaxadas.
  * Se Aviário: Penas fofas (fluffing suave), respiração calma no poleiro, cabeça levemente inclinada.
  * Se Réptil: Postura espalmada de relaxamento (basking), respiração gular suave sem tensão.
- LINHA 1 (Ação / Locomoção / Foco Dinâmico):
  * Se Canino: Postura de Play Bow (ombros baixos, quadril erguido) evoluindo para corrida focada à frente.
  * Se Felino: Corpo rebaixado rente ao chão (stalking), pupilas dilatadas, passada furtiva.
  * Se Pequeno Mamífero: Corrida rápida em passadas curtas e aceleradas.
  * Se Aviário: Salto dinâmico com asas entreabertas em ciclo de vôo batido ou caminhada apressada.
  * Se Réptil com patas: Passada ágil com ondulação lateral; se serpente: rastejamento sinuoso em S.
- LINHA 2 (Celebração / Euforia / Sucesso):
  * Se Canino: Salto com patas dianteiras levantadas, boca aberta em expressão alegre, cauda abanando vigorosamente.
  * Se Felino: Cauda ereta em ponto de interrogação, salto elástico com brinquedo imaginário, esfregar de cabeça.
  * Se Pequeno Mamífero: Salto com giro no ar (binkying em coelhos) e patas dianteiras no peito.
  * Se Aviário: Asas abertas em leque, crista levantada, balanço ritmado de cabeça.
  * Se Réptil: Elevação corporal máxima, cabeça empinada, língua capturando estímulos.
- LINHA 3 (Alerta / Defesa / Reação a Ruído):
  * Se Canino: Orelhas voltadas para trás, cabeça rebaixada cautelosa ou postura ereta com pelo eriçado.
  * Se Felino: Orelhas de avião (coladas à cabeça), dorso arqueado, olhar fixo.
  * Se Pequeno Mamífero: Corpo congelado ereto em duas patas (modo sentinela) ou recuo rápido.
  * Se Aviário: Corpo esguio comprimido (cigar posture), penas coladas, bico em guarda.
  * Se Réptil: Inflamento de papo/pescoço, compressão lateral do corpo, postura defensiva.

FAIXA LATERAL DE TICKET (Margem Esquerda - 15%):
- Tipografia técnica monoespaçada pixelada contendo:
  [PET-A-PIXEL v1.1]
  NAME: {pet_name}
  CLASS: {species_group}
  MOOD: {temperament}
  PALETTE: {lighting_mood}
  CANVAS: 3840x2160
  BG_HEX: #26303D

RESTRIÇÕES NEGATIVAS E PROIBIÇÕES RÍGIDAS:
- PROIBIDO renderizar em estilo 3D realista, pintura a óleo ou vetor suave.
- PROIBIDO anti-aliasing borrado nas bordas; utilize contornos precisos de pixel art 16-bit.
- PROIBIDO qualquer tipo de sombra no chão, marcação de piso ou perspectiva isométrica.
- PROIBIDO misturar traços anatômicos de diferentes espécies.
- PROIBIDO texto conversacional após a execução; retorne exclusivamente a imagem gerada.
```
