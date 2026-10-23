# AGENTS.md — Guia de Agentes de IA & Arquitetura do Projeto

Este documento orienta agentes de codificação autônomos (**Antigravity**, **Claude Code**, **Cursor**, **Codex**, etc.) tanto para **evoluir esta ferramenta (`fluxograma-briefing`)** quanto para **consumir os arquivos `.md` de Fase/PRD exportados por ela** na construção de sistemas, CRMs e dashboards de clientes.

---

## 1. Visão Geral do Sistema

**Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto** é uma aplicação web fullstack em **Next.js 15 (App Router) + React 19 + `@xyflow/react` + Tailwind CSS v4 + Supabase** projetada para reuniões de briefing e levantamento de escopo ao vivo.

### Diferencial Arquitetural
Cada nó desenhado no canvas possui **dupla natureza**:
1. **Visual (Camada FigJam / Blueprint):** Representação clara para alinhamento ao vivo com o cliente em chamada de vídeo.
2. **Semântica (Camada de Engenharia):** Metadados estruturados (`route`, `actor`, `priority`, `status`, `fields[]`, `businessRules[]`, `endpoint`, `tableName`, `comments[]`) que são compilados em tempo real em especificações Markdown e prompts de implementação por fase.

---

## 2. Mapa do Código-Fonte

| Arquivo | Responsabilidade |
|---|---|
| `app/layout.tsx` | Configuração das fontes técnicas (`Archivo` + `Azeret Mono`) e metadados globais. |
| `app/globals.css` | Tokens CSS (`--bg-vellum`, `--accent-cobalt`, etc.), barras de rolagem e tematização do React Flow. |
| `app/page.tsx` | Ponto de entrada principal que renderiza `<BriefingStudio />`. |
| `app/api/boards/route.ts` | API REST (`GET`, `POST`) com persistência híbrida em `.data/boards.json` e Supabase (`briefing_boards`). |
| `app/api/boards/[id]/route.ts` | Busca individual de projeto por `id` (Supabase ➔ Disco Local ➔ Templates). |
| `components/BriefingStudio.tsx` | Workspace principal: cabeçalho carimbo, barra de captura rápida encadeada, canvas React Flow, dock inferior, modal de confirmação de limpeza e ouvinte de eventos de exportação de fase. |
| `components/nodes/BriefingNodes.tsx` | Os 8 tipos de nós customizados (`screen`, `action`, `decision`, `integration`, `database`, `sticky`, `shape`, `section`). |
| `components/RightDossierDrawer.tsx` | Gaveta lateral com 4 abas: `Inspetor`, `Dossiê PRD` (com filtro por Fase), `Notas` (comentários do cliente) e `Projetos` (galeria + links + Supabase). |
| `lib/types.ts` | Contratos TypeScript (`BoardProject`, `BriefingNode`, `FlowNodeData`, `ScreenField`, `NodeComment`). |
| `lib/prd-compiler.ts` | Motor de compilação do grafo para PRD completo (`compileBoardToPRD`), Prompt de IA (`compileBoardToAIPrompt`) e recorte espacial por Fase (`compilePhaseToMarkdown` + `getNodesInSection`). |
| `lib/templates.ts` | Templates de partida (CRM Comercial B2B, SaaS Onboarding, Alçadas Financeiras e Canvas Limpo). |
| `lib/supabase.ts` | Cliente Supabase pré-configurado para o projeto `sovsuyjpazocwtsqtmkg` e script SQL de migração. |

---

## 3. Regras de Design & UI para Agentes (`DESIGN.md`)

Qualquer agente que crie ou edite componentes visuais neste repositório **deve** respeitar as diretrizes de [`DESIGN.md`](./DESIGN.md):
- **Estética:** *Blueprint & Cartografia de Produto (Drafting Studio)* — fundo em papel vellum (`#F6F3EC`), painéis marfim (`#EFECE4`), cartões em papel técnico (`#FAF8F4`) e linhas estruturais em nanquim `1px solid #16181D` / `#D8D3C8`.
- **Semântica Cromática Intocável:**
  - `screen` (Tela): Azul Cobalto `#1B4DFF`
  - `decision` (Decisão): Vermelhão `#D9381E` (porta `SIM` em `#0F766E`, porta `NÃO` em `#D9381E`)
  - `action` (Ação): Ocre `#B45309`
  - `integration` (API/Webhook): Violeta `#6D28D9`
  - `database` (Tabela DB): Esmeralda `#0F766E`
  - `sticky` (Post-it): Âmbar `#F5C542` (e variantes Coral, Menta, Azul)
- **Proibições Visuais (`Craft Floor`):**
  1. Nunca adicione *eyebrows/kickers* (rótulos pequenos em caixa-alta empilhados acima de `h1`, `h2`, `h3`).
  2. Nunca use `border-left` ou `border-right` colorida acima de `1px`.
  3. Nunca combine borda `1px` com `box-shadow` difuso (*ghost card*).
  4. Use modais apenas para ações destrutivas que exigem confirmação explícita (como **Limpar Tela Toda**); todo o resto opera na gaveta lateral `RightDossierDrawer`.

---

## 4. Como Agentes Devem Consumir os Arquivos `.MD` de Fase Exportados

Quando o usuário clicar em **`Prompt IA da Fase`** ou **`.MD da Fase`** para construir parte do sistema/CRM/dashboard de um cliente, o agente recebedor daquele Markdown deve seguir este protocolo:
1. **Escopo Restrito à Fase:** Implementar prioritariamente as rotas (`route`), componentes de tela (`fields`), desvios condicionais (`businessRules`), endpoints (`endpoint`) e tabelas (`tableName`) listados naquele arquivo `.md`.
2. **Respeito às Fronteiras de Fase:** As conexões marcadas como `*(Vem de outra fase)*` ou `*(Vai para próxima fase)*` na seção **8. Fluxo de Navegação & Transições da Fase** indicam os pontos de integração (rotas de entrada/saída ou eventos) com os demais módulos do sistema.
3. **Priorização MoSCoW / MVP:** Construir primeiro todos os blocos marcados como `MVP (Essencial Fase 1)` e preparar stubs/interfaces para itens marcados como `Fase 2`.
