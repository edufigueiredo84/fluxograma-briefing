---
name: Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto
description: Sistema visual de cartografia técnica e planta arquitetônica para mapeamento de jornadas de usuário e compilação de escopos (PRD).
colors:
  blueprint-cobalt: "#1B4DFF"
  blueprint-cobalt-deep: "#1438B8"
  revision-vermilion: "#D9381E"
  archival-emerald: "#0F766E"
  integration-violet: "#6D28D9"
  action-ochre: "#B45309"
  sticky-amber: "#F5C542"
  vellum-ground: "#F6F3EC"
  panel-ivory: "#EFECE4"
  card-paper: "#FAF8F4"
  india-ink: "#16181D"
  slate-secondary: "#4A4D55"
  hairline-rule: "#D8D3C8"
typography:
  headline:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.84375rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Archivo, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Azeret Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.blueprint-cobalt}"
    textColor: "{colors.card-paper}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.blueprint-cobalt-deep}"
  button-secondary:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.india-ink}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  node-card:
    backgroundColor: "{colors.card-paper}"
    textColor: "{colors.india-ink}"
    rounded: "{rounded.lg}"
    padding: "12px"
---

# Design System: Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto

## Overview

**Creative North Star: "Blueprint & Cartografia de Produto (Drafting Studio)"**

O sistema visual trata o mapeamento de fluxos e reuniões de briefing como uma mesa de desenho arquitetônico combinada a um caderno de especificações vivas. Em vez de um quadro branco vazio e genérico, o fundo em papel vellum técnico (`#F6F3EC`) com grade de precisão sustenta blocos semânticos com bordas de tinta nanquim (`#16181D`) e cabeçalhos codificados por função de engenharia.

Cada nó no canvas funciona simultaneamente como uma peça visual para alinhamento com o cliente durante a videochamada e como um registro técnico estruturado (contendo rota, wireframe interno de campos, regras de negócio e critérios de aceite) que alimenta o compilador automático de PRD na lateral direita.

**Key Characteristics:**
- Superfícies táteis inspiradas em papel vellum técnico (`#F6F3EC`), marfim de prancheta (`#EFECE4`) e cartão arquitetônico (`#FAF8F4`).
- Semântica cromática imediata por categoria de bloco: Azul Cobalto para Telas, Vermelhão para Decisões, Âmbar/Ocre para Ações e Post-its, Violeta para APIs e Esmeralda para Banco de Dados.
- Mini-wireframes esquemáticos renderizados dentro dos próprios blocos de tela no canvas.
- Elevação estrutural declarada exclusivamente por linhas técnicas de `1px solid`, sem sombras difusas fantasmas.

## Colors

Uma paleta de cartografia técnica que equilibra fundos de papel aquecido para conforto visual em reuniões longas com tintas saturadas de engenharia para leitura instantânea de categorias.

### Primary
- **Blueprint Cobalt** (`#1B4DFF`): Cor primária de engenharia usada nos cabeçalhos dos blocos de Tela (`SCR`), botões de compilação de PRD, anéis de seleção ativa e conexões padrão da jornada.
- **Blueprint Cobalt Deep** (`#1438B8`): Estado de hover e destaque intenso sobre elementos primários.

### Secondary
- **Revision Vermilion** (`#D9381E`): Tinta de revisão técnica reservada para blocos de Decisão/Condição (`DEC`), saídas lógicas `NÃO` e badges de dúvidas/comentários pendentes do cliente.
- **Archival Emerald** (`#0F766E`): Representa persistência em Banco de Dados (`DB`), saídas lógicas `SIM`, status validado em reunião e sincronização ativa com nuvem Supabase.

### Tertiary
- **Integration Violet** (`#6D28D9`): Identifica chamadas de API, Webhooks e serviços externos (`API`).
- **Action Ochre** (`#B45309`): Identifica gatilhos operacionais e ações diretas de usuário (`ACT`).
- **Sticky Amber** (`#F5C542`): Cor principal dos post-its de briefing e falas de cliente capturadas ao vivo.

### Neutral
- **Vellum Ground** (`#F6F3EC`): Superfície principal do canvas infinito.
- **Panel Ivory** (`#EFECE4`): Fundo estrutural do cabeçalho carimbo e da gaveta lateral do Dossiê PRD.
- **Card Paper** (`#FAF8F4`): Corpo interno dos cartões de nós e áreas de formulário.
- **India Ink** (`#16181D`): Tinta principal para textos, bordas estruturais de nós e controles ativos.
- **Slate Secondary** (`#4A4D55`): Texto secundário aquecido e descritores de apoio.
- **Hairline Rule** (`#D8D3C8`): Fios divisórios internos de `1px` para tabelas de campos e wireframes.

### Named Rules
**The Semantic Header Rule.** Cada categoria de nó no fluxograma possui exatamente uma cor de cabeçalho semântico; nunca troque a cor de uma Tela (`#1B4DFF`) pela de uma Decisão (`#D9381E`).

## Typography

**Display Font:** Archivo (with system-ui fallback)
**Body Font:** Archivo (with system-ui fallback)
**Label/Mono Font:** Azeret Mono (monospace)

**Character:** A combinação de uma grotesca técnica de sinalização (`Archivo`) com uma monoespaçada de precisão cartográfica (`Azeret Mono`) garante leitura cristalina tanto em 50% quanto em 150% de zoom no canvas.

### Hierarchy
- **Headline** (700, 0.875rem / 14px, line-height 1.3): Títulos do carimbo de projeto, seções do inspetor e cabeçalhos de fases (`FASE 01`).
- **Title** (600, 0.84375rem / 13.5px, line-height 1.35): Títulos principais dentro de cada bloco do fluxograma.
- **Body** (400, 0.75rem / 12px, line-height 1.5): Subtítulos explicativos, regras de negócio e comentários de clientes.
- **Label** (600, 0.6875rem / 11px, letter-spacing -0.01em): Códigos tabulares de blocos (`SCR-01`, `DEC-02`), rotas (`/crm/pipeline`), badges de prioridade (`MVP`) e contadores.

### Named Rules
**The Tabular Code Rule.** Todo identificador de nó, contador e coordenada deve usar `Azeret Mono` com `font-variant-numeric: tabular-nums`.

## Layout

A interface opera em um modelo espacial de tela cheia (`100vw × 100vh`, `overflow: hidden`) dividido em três zonas coordenadas:
1. **Cabeçalho Carimbo de Planta (`58px` fixo no topo):** Identificação do projeto e cliente à esquerda, barra de captura rápida encadeada ao centro e controles de modo/exportação à direita.
2. **Canvas Infinito (`flex-1`):** Grade pontilhada de `20px` com snap-to-grid de `16px`, minimapa no canto superior esquerdo, placar de telemetria no canto superior direito e dock flutuante de criação rápida centralizado na base.
3. **Gaveta Lateral de Dossiê & Inspetor (`376px` retrátil à direita):** Quatro abas integradas (`Inspetor`, `Dossiê PRD`, `Notas`, `Link & DB`) que evitam modais bloqueantes sobre o diagrama.

## Elevation & Depth

O sistema adota **camadas tonais planas e bordas técnicas de 1px** em vez de sombras difusas decorativas. A hierarquia entre o fundo do canvas (`#F6F3EC`), as raias de fase (`#EFECE4`), os blocos (`#FAF8F4`) e a seleção ativa (`ring-2` em `#1B4DFF`) é comunicada exclusivamente por contraste de superfície e espessura/cor de linha.

### Named Rules
**The Single-Elevation Rule.** Declare elevação apenas uma vez por elemento usando borda técnica de `1px solid #16181D` (ou `#D8D3C8` em subdivisões internas); nunca combine bordas com `box-shadow` difuso.

## Shapes

- **Blocos do Fluxograma:** Cantos arredondados técnicos de `12px` (`rounded-[12px]`) com cabeçalho superior encaixado (`rounded-t-[11px]`) separado por fio horizontal de `1px`.
- **Raias de Fase (Sections):** Molduras tracejadas (`1px dashed #9E988B`) de `14px` de raio ao fundo dos nós.
- **Controles e Inputs:** Cantos de `6px` a `8px` e badges compactos de `4px`.

## Components

### Buttons
- **Shape:** Cantos técnicos de `7px` a `8px`.
- **Primary:** Fundo Blueprint Cobalt (`#1B4DFF`), texto `#FAF8F4`, padding `6px 12px`, peso `600`.
- **Hover / Focus:** Transição suave para `#1438B8` e anel de foco `2px solid #1B4DFF`.
- **Secondary:** Fundo `#FAF8F4`, texto `#16181D`, borda `1px solid #16181D`, hover em `#E5E0D5`.

### Chips
- **Style:** Pílulas retangulares de `4px` de raio em `Azeret Mono` `10px`.
- **State:** Codificados para prioridade (`MVP` em azul claro `#E8EEFF`, `FASE 2` em marfim `#F3EFE6`) e validação (`OK` em esmeralda `#E6F4F1`, `DÚVIDA` em vermelhão claro `#FEF0EE`).

### Cards / Containers
- **Corner Style:** `12px` (`rounded-[12px]`).
- **Background:** `#FAF8F4` com sub-caixas internas de wireframe em `#F6F3EC`.
- **Shadow Strategy:** Sem sombra; contorno nítido `1px solid #16181D`.
- **Border:** `1px solid #16181D` nos nós do canvas; `1px solid #D8D3C8` em grupos secundários.
- **Internal Padding:** `12px` (`p-3`).

### Inputs / Fields
- **Style:** Borda `1px solid #D8D3C8`, fundo `#F6F3EC`, raio `6px`, padding `6px 10px`.
- **Focus:** Borda muda para `#1B4DFF` com outline de `2px`.

### Navigation
- **Dock Inferior de Criação:** Barra flutuante centralizada com separador vertical entre blocos semânticos de engenharia (`+ Tela`, `+ Ação`, `+ Decisão`, `+ API`, `+ Tabela DB`) e ferramentas livres estilo FigJam (`+ Post-it`, `+ Forma`, `+ Fase`).

## Do's and Don'ts

### Do:
- **Do** exibir os componentes internos de cada tela (inputs, tabelas, KPIs, botões) diretamente no mini-wireframe do nó no canvas.
- **Do** usar portas de saída separadas e rotuladas (`SIM` em `#0F766E` e `NÃO` em `#D9381E`) em todos os blocos de Decisão.
- **Do** manter códigos tabulares automáticos (`SCR-01`, `DEC-01`, `API-01`) visíveis no topo de cada bloco para referência rápida em reuniões.

### Don't:
- **Don't** usar subtítulos em caixa-alta (eyebrows/kickers) empilhados acima de títulos `h1`, `h2` ou `h3`.
- **Don't** aplicar `border-left` ou `border-right` colorida acima de `1px` em cartões, alertas ou itens de lista.
- **Don't** abrir janelas modais sobre o canvas para editar propriedades ou exportar o PRD; utilize sempre a gaveta lateral de Dossiê.
