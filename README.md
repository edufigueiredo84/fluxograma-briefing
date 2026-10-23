# Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto

Ferramenta web fullstack (**Next.js 15 + React Flow + Tailwind CSS + Supabase**) criada para **reuniões de briefing e levantamento de escopo ao vivo com clientes**. Permite mapear jornadas do usuário dentro de sistemas, CRMs e dashboards combinando a fluidez de um quadro estilo FigJam com blocos semânticos de engenharia de produto que se compilam automaticamente em **Dossiês de Escopo (PRD)** e **Prompts `.MD` por Fase para IA**.

---

## Documentação Completa do Projeto

| Documento | Descrição |
|---|---|
| [**DOCS.md**](./DOCS.md) | Documentação funcional e técnica completa: guia de uso em reuniões, onde os projetos ficam salvos, exportação `.md` por fase, API REST e SQL do Supabase. |
| [**ROADMAP.md**](./ROADMAP.md) | Roadmap do produto (Fase 1 entregue + próximas fases: IA de voz para fluxo, Realtime Multiplayer, gerador de schema SQL/Prisma e tarefas Jira/Linear). |
| [**AGENTS.md**](./AGENTS.md) | Guia para agentes de IA (Antigravity, Cursor, Claude Code) sobre a arquitetura do código, regras visuais e como consumir os `.md` de fase exportados. |
| [**DESIGN.md**](./DESIGN.md) | Design System completo (*Blueprint & Cartografia de Produto*), paleta semântica, tipografia (`Archivo` + `Azeret Mono`), tokens e regras de componentes. |
| [**PRODUCT.md**](./PRODUCT.md) | Contexto estratégico do produto, personas, posicionamento e princípios operacionais. |

---

## Principais Funcionalidades

1. **Blocos Semânticos de Produto + Camada FigJam**:
   - **Tela / Interface (`SCR`)**: Exibe rota (`/crm/pipeline`), persona/ator, status de validação (`OK`, `Dúvida`, `Rascunho`), prioridade (`MVP`, `Fase 2`) e **mini-wireframe interno** com os campos, filtros, tabelas, gráficos e botões da tela.
   - **Decisão / Condição (`DEC`)**: Portas duplas explícitas (**SIM** em verde esmeralda e **NÃO** em vermelhão) para desenhar desvios de regras de negócio rapidamente.
   - **Ação / Gatilho (`ACT`)**, **Integração / API (`API`)** e **Banco de Dados (`DB`)**.
   - **Post-its de Briefing (`NOTE`)**, **Formas Livres (`SHP`)** e **Raias de Macro-Fase (`FASE`)**.
2. **Exportação de Fase em `.MD` para IA**:
   - Em cada quadro de **Fase (`FASE-01`, `FASE-02`...)** no canvas (ou no painel lateral), clique em **`Prompt IA da Fase`** ou **`.MD da Fase`** para exportar apenas as telas, regras, APIs, tabelas e fluxos contidos dentro daquela Fase — ideal para pedir à IA que desenvolva um módulo do sistema por vez.
3. **Barra de Captura Rápida em Reunião**:
   - Digite no topo: `Tela: Login -> Decisão: Aprovado? -> API: Asaas -> Banco: deals` e pressione **Enter** para gerar e conectar todos os blocos automaticamente no canvas.
4. **Limpeza de Tela com Confirmação Segura & Galeria de Projetos**:
   - O botão **Limpar Tela** abre um modal perguntando se você deseja **Salvar o Projeto Atual na Galeria antes de limpar**, além de contar com botão **Desfazer Limpeza**.
   - Todos os projetos ficam acessíveis na aba **Projetos** (salvos em `localStorage`, em `.data/boards.json` no servidor local e sincronizados com o Supabase `sovsuyjpazocwtsqtmkg`).

---

## Como Rodar Localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` (ou a porta indicada no terminal, como `http://localhost:3002`).
