# Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto

Ferramenta web fullstack (Next.js + React Flow + Tailwind CSS + Supabase) criada para **reuniões de briefing e levantamento de escopo ao vivo com clientes**. Permite mapear jornadas do usuário dentro de sistemas, CRMs e dashboards combinando a fluidez de um quadro estilo FigJam com blocos semânticos de engenharia de produto que se compilam automaticamente em um **Dossiê de Escopo / PRD / Prompt de IA**.

---

## Principais Funcionalidades

1. **Blocos Semânticos de Produto + Camada FigJam**:
   - **Tela / Interface (`SCR`)**: Exibe rota (`/crm/pipeline`), persona/ator, status de validação (`OK`, `Dúvida`, `Rascunho`), prioridade (`MVP`, `Fase 2`) e **mini-wireframe interno** com os campos, filtros, tabelas, gráficos e botões da tela.
   - **Decisão / Condição (`DEC`)**: Portas duplas explícitas (**SIM** em verde esmeralda e **NÃO** em vermelhão) para desenhar desvios de regras de negócio rapidamente.
   - **Ação / Gatilho (`ACT`)**: Ações operacionais de usuários ou automações.
   - **Integração / API / Webhook (`API`)**: Endpoints REST, Webhooks e serviços externos (Meta Ads, WhatsApp, Asaas, Clicksign, etc.).
   - **Banco de Dados (`DB`)**: Tabelas e colunas mapeadas durante a conversa.
   - **Post-its de Briefing (`NOTE`)**, **Formas Livres (`SHP`)** e **Raias de Macro-Fase (`FASE`)**.
2. **Barra de Captura Rápida em Reunião**:
   - Digite no topo: `Tela: Login -> Decisão: Aprovado? -> API: Asaas -> Banco: deals` e pressione **Enter** para gerar e conectar todos os blocos automaticamente no canvas.
3. **Compilador Automático de Escopo (PRD / Prompt Dev / JSON)**:
   - Na gaveta lateral direita (**Dossiê PRD**), o diagrama é transformado em tempo real em um documento Markdown estruturado ou em um **Prompt Técnico pronto para IA** (Cursor, Antigravity, Claude) construir o sistema.
4. **Compartilhamento com Cliente & Sincronização Supabase (`sovsuyjpazocwtsqtmkg`)**:
   - Gere links no **Modo Cliente** (`?board=<id>&mode=client`) para que o cliente visualize o fluxo e registre comentários/dúvidas diretamente em cada tela sem risco de alterar os blocos.
   - Persistência híbrida: salva automaticamente em disco local (`.data/boards.json` + `localStorage`) e sincroniza com o projeto Supabase configurado (`https://sovsuyjpazocwtsqtmkg.supabase.co`).

---

## Como Rodar Localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### Configurando a Tabela no Supabase (`sovsuyjpazocwtsqtmkg`)

1. Na própria interface (aba **Link & DB** na lateral direita), clique em **Copiar SQL da Tabela** e cole no [SQL Editor do Supabase](https://supabase.com/dashboard/project/sovsuyjpazocwtsqtmkg/sql/new).
2. Cole sua `NEXT_PUBLIC_SUPABASE_ANON_KEY` no arquivo `.env.local` (ou diretamente no campo da aba **Link & DB**).
