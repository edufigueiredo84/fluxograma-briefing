# DOCS.md — Documentação Completa (Funcional & Técnica)

Bem-vindo à documentação oficial do **Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto**.

---

## Sumário
1. [Fluxo de Uso em Reuniões de Briefing](#1-fluxo-de-uso-em-reuniões-de-briefing)
2. [Categorias de Blocos & Semântica](#2-categorias-de-blocos--semântica)
3. [Exportação Modular por Fase para IA (`.MD`)](#3-exportação-modular-por-fase-para-ia-md)
4. [Onde os Projetos Ficam Salvos & Como Acessar](#4-onde-os-projetos-ficam-salvos--como-acessar)
5. [Configuração do Banco de Dados Supabase (`sovsuyjpazocwtsqtmkg`)](#5-configuração-do-banco-de-dados-supabase-sovsuyjpazocwtsqtmkg)
6. [Estrutura de Dados & API REST](#6-estrutura-de-dados--api-rest)

---

## 1. Fluxo de Uso em Reuniões de Briefing

### Passo 1: Preparar ou Limpar a Tela
- Ao abrir o sistema, você pode escolher um dos **4 Templates Prontos** no seletor superior (`Funil CRM & Vendas B2B`, `SaaS Login, Setup & Trial`, `Alçada de Compras & ERP` ou `Iniciar Canvas em Branco`).
- Ou clicar no botão vermelho **Limpar Tela** (no cabeçalho superior ou na barra flutuante inferior).
  - Um **Modal de Confirmação** será exibido perguntando se você deseja **Salvar o Projeto Atual na Galeria e Limpar a Tela** ou **Limpar Sem Salvar**.
  - Mesmo após limpar, o botão **Desfazer Limpeza** fica disponível no topo para restaurar o estado anterior em 1 clique.

### Passo 2: Mapear a Jornada Ao Vivo com o Cliente
Você tem duas formas de desenhar com velocidade máxima durante a conversa:
1. **Barra de Captura Rápida (no topo)**:
   - Digite o fluxo separado por `->` ou `>`:
     ```text
     Tela: Login do Cliente -> Decisão: Possui Assinatura Ativa? -> Tela: Dashboard Principal -> API: Webhook Stripe -> Banco: subscriptions
     ```
   - Pressione **Enter** e todos os blocos já nascem criados, tipados e conectados no canvas.
2. **Dock Flutuante Inferior**:
   - Clique em `+ Tela`, `+ Ação`, `+ Decisão`, `+ API`, `+ Tabela DB`, `+ Post-it`, `+ Forma` ou `+ Fase`.
   - **Auto-conexão:** Se um bloco já estiver selecionado no canvas, o próximo bloco clicado nasce posicionado à direita dele e conectado automaticamente por uma seta.

### Passo 3: Detalhar Campos, Wireframes e Regras
- Clique em qualquer bloco para abrir a aba **Inspetor** na gaveta lateral direita:
  - **Em Telas (`SCR`)**: Adicione componentes de interface (`Input`, `Filtro/Select`, `Tabela/Kanban`, `KPI/Card`, `Gráfico`, `Upload`, `Botão Ação`). Eles aparecem desenhados dentro do mini-wireframe do bloco no canvas.
  - **Em Decisões (`DEC`)**: Conecte a **Porta Superior (Verde)** para o caminho `SIM` e a **Porta Inferior (Vermelha)** para o caminho `NÃO`.
  - **Prioridade e Status**: Classifique cada item como `MVP`, `Fase 2`, `Desejável` ou `Fora de Escopo`, e marque como `Rascunho`, `✓ Validado` ou `! Dúvida`.

---

## 2. Categorias de Blocos & Semântica

| Código | Bloco | Cor Semântica | Metadados Exclusivos |
|---|---|---|---|
| `SCR-XX` | **Tela / Interface** | Azul Cobalto (`#1B4DFF`) | `route` (`/crm/leads`), `fields[]` (mini-wireframe), `businessRules[]`, `actor` |
| `DEC-XX` | **Decisão / Regra** | Vermelhão (`#D9381E`) | Portas de saída `yes` (`SIM`) e `no` (`NÃO`), `businessRules[]` |
| `ACT-XX` | **Ação / Gatilho** | Ocre (`#B45309`) | `actor`, `businessRules[]`, `status` |
| `API-XX` | **Integração / API** | Violeta (`#6D28D9`) | `method` (`POST`, `GET`, `WEBHOOK`, `CRON`), `endpoint` |
| `DB-XX` | **Tabela de Banco** | Esmeralda (`#0F766E`) | `tableName` (`public.deals`), `fields[]` (colunas e obrigatoriedade) |
| `NOTE-XX` | **Post-it Briefing** | Âmbar (`#F5C542`) + 3 cores | `stickyColor` (`amber`, `coral`, `mint`, `sky`), `stickyTag`, `description` |
| `SHP-XX` | **Forma Livre** | Nanquim (`#16181D`) | Bloco livre para anotações ou diagramação auxiliar |
| `FASE-XX` | **Fase da Jornada** | Moldura Tracejada | `sectionWidth`, `sectionHeight`, agrupa espacialmente os blocos daquela etapa |

---

## 3. Exportação Modular por Fase para IA (`.MD`)

Para construir o sistema do cliente em etapas (ex: pedir para a IA criar primeiro a *Fase 01 de Captação*, depois a *Fase 02 do Kanban*, depois a *Fase 03 de Faturamento*):

1. Posicione os blocos de Tela, Decisão, Ação, API e Banco de Dados dentro do quadro tracejado da respectiva **Fase (`FASE-01`, `FASE-02`...)**.
2. O algoritmo `getNodesInSection` (em `lib/prd-compiler.ts`) detecta automaticamente todos os blocos cujas coordenadas estão dentro daquela Fase.
3. No cabeçalho da própria **Fase no Canvas**, clique em:
   - **`Prompt IA da Fase`**: copia o prompt estruturado apenas daquela Fase.
   - **`.MD da Fase`**: faz o download do arquivo `.md` contendo:
     - Objetivo da Fase e do Projeto
     - Especificação de todas as Telas e seus componentes/campos daquela Fase
     - Regras condicionais e ramificações (`SIM`/`NÃO`) daquela Fase
     - Endpoints de API e Tabelas de Banco de Dados daquela Fase
     - Post-its e observações da reunião daquela Fase
     - Fluxo de navegação interno e transições de entrada/saída com outras Fases.

---

## 4. Onde os Projetos Ficam Salvos & Como Acessar

O sistema utiliza **Persistência Tripla Híbrida**:

1. **Salvamento Instantâneo no Navegador (`localStorage`)**:
   - Chave: `briefing_current_board`.
   - Toda edição de texto, posição ou conexão é salva imediatamente no navegador.
2. **Salvamento em Arquivo Local no Servidor (`.data/boards.json`)**:
   - Sempre que você clica em **Salvar Atual**, **Salvar Novo**, **Compartilhar** ou escolhe **Salvar e Limpar** no modal de limpeza, o projeto é gravado no arquivo `.data/boards.json`.
3. **Sincronização em Nuvem no Supabase (`sovsuyjpazocwtsqtmkg`)**:
   - Grava na tabela `public.briefing_boards` do seu projeto Supabase.

### Como Reabrir um Projeto Salvo:
- Abra a aba **Projetos** (ícone de nuvem na gaveta lateral direita).
- Na lista **Meus Projetos Salvos**, clique no botão **Abrir** ao lado de qualquer projeto ou acesse diretamente via URL: `http://localhost:3000/?board=<id-do-projeto>`.

---

## 5. Configuração do Banco de Dados Supabase (`sovsuyjpazocwtsqtmkg`)

O projeto já está conectado ao seu ambiente Supabase (`https://sovsuyjpazocwtsqtmkg.supabase.co`). Para ativar a gravação na nuvem:

1. Acesse o [SQL Editor do Projeto no Supabase](https://supabase.com/dashboard/project/sovsuyjpazocwtsqtmkg/sql/new) e execute o script abaixo (também disponível no botão **Copiar SQL da Tabela** dentro da aba **Projetos**):

```sql
create table if not exists public.briefing_boards (
  id text primary key,
  title text not null,
  client_name text not null default '',
  system_type text not null default '',
  version text not null default 'REV 01',
  objective text not null default '',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.briefing_boards enable row level security;

create policy "Permitir leitura e escrita publica para links de briefing"
  on public.briefing_boards
  for all
  using (true)
  with check (true);
```

2. Copie a sua chave `anon` `public` em [Project Settings > API](https://supabase.com/dashboard/project/sovsuyjpazocwtsqtmkg/settings/api) e cole no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sovsuyjpazocwtsqtmkg.supabase.co
NEXT_PUBLIC_SUPABASE_PROJECT_REF=sovsuyjpazocwtsqtmkg
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```
*(Ou cole diretamente no campo **Supabase Anon Public Key** na aba **Projetos** da interface).*

---

## 6. Estrutura de Dados & API REST

### Endpoints Internos Next.js
- `GET /api/boards`: Lista todos os projetos salvos (consulta o Supabase primeiro; caso não configurado, retorna `.data/boards.json`).
- `POST /api/boards`: Salva/atualiza um `BoardProject` em `.data/boards.json` e faz `upsert` na tabela `briefing_boards` do Supabase.
- `GET /api/boards/[id]`: Retorna um projeto específico pelo `id` para links compartilhados (`/?board=[id]&mode=client`).
