# ROADMAP.md — Plano de Evolução do Produto

Este roadmap organiza a evolução do **Planta · Estúdio de Fluxograma, Briefing & Jornadas de Produto**, desde a fundação já entregue até recursos avançados de colaboração em tempo real e geração automatizada de sistemas.

---

## Fase 1 — Fundação & Estúdio de Briefing Ao Vivo (Concluído ✓)

- [x] **Canvas Infinito de Arquitetura & FigJam (`@xyflow/react`)**:
  - [x] 8 blocos customizados: Tela (`SCR`), Ação (`ACT`), Decisão com portas duplas `SIM`/`NÃO` (`DEC`), Integração/API (`API`), Banco de Dados (`DB`), Post-it de Briefing (`NOTE`), Forma Livre (`SHP`) e Raia de Fase (`FASE`).
  - [x] Mini-wireframe esquemático renderizado ao vivo dentro de cada bloco de Tela.
  - [x] Auto-conexão inteligente ao criar novos blocos a partir de um nó selecionado.
- [x] **Velocidade de Reunião Ao Vivo**:
  - [x] Barra superior de **Captura Rápida em Texto** (`Tela: X -> Decisão: Y? -> API: Z`) que gera e conecta fluxos inteiros em 1 segundo.
  - [x] CTA **Limpar Tela** com modal de confirmação seguro (opção de salvar na galeria antes de limpar + botão **Desfazer Limpeza**).
- [x] **Compilador de Escopo, PRD & Exportação por Fase (`.MD` / Prompt IA)**:
  - [x] Compilação automática do grafo completo para PRD Markdown, Prompt de Engenharia para IA e JSON.
  - [x] Detecção espacial automática de quais blocos pertencem a cada **Fase (`FASE-01`, `FASE-02`...)** com botões diretos no cabeçalho da Fase no canvas (**`Prompt IA da Fase`** e **`.MD da Fase`**).
- [x] **Persistência Híbrida & Compartilhamento com Cliente**:
  - [x] Salvamento em 3 níveis: `localStorage` instantâneo, arquivo `.data/boards.json` no servidor local e integração com Supabase (`sovsuyjpazocwtsqtmkg`).
  - [x] Galeria **Meus Projetos Salvos** para abrir, salvar ou duplicar briefings de múltiplos clientes.
  - [x] **Modo Cliente** (`?board=<id>&mode=client`) para visualização segura e registro de comentários por tela.

---

## Fase 2 — Inteligência Artificial & Velocidade Operacional (Concluído ✓)

- [x] **Header Minimalista & Barra de Ferramentas em Ícones**:
  - [x] Consolidação das ações secundárias (`Buscar / Ctrl+K`, `Transcrição IA`, `Meus Projetos & Templates`, `Visão Cliente`, `Exportar PNG`, `Compartilhar Nuvem`, `Limpar / Desfazer` e `Tema Claro/Escuro`) em uma dock de ícones técnicos, deixando **`Compilar PRD`** como único CTA textual primário no topo.
- [x] **Transcrição de Call / Texto Livre para Fluxograma Ao Vivo**:
  - [x] Conversor inteligente (`Ctrl+K` ➔ *Transcrição ➔ Fluxo* ou ícone de varinha mágica no header) que transforma trechos de conversa da reunião em Fase (`FASE`), Telas (`SCR`) com campos inferidos, Decisões (`DEC`), APIs (`API`), Tabelas (`DB`) e Post-its (`NOTE`).
- [x] **Atalhos de Teclado Avançados & Paleta de Comando Rápido (`Ctrl+K`)**:
  - [x] Paleta flutuante para buscar qualquer tela pelo código (`SCR-02`), rota ou ator, filtrar apenas blocos com `! Com Dúvida`, `MVP` ou `✓ Validados`, e alternar templates rapidamente.

---

## Fase 3 — Geração de Protótipos, SQL/Prisma & Gestão de Tarefas (Concluído ✓)

- [x] **Preview de Wireframe Expandido & Interativo por Tela**:
  - [x] Botão de expansão em cada bloco de `Tela (SCR)` e no Inspetor (`Protótipo`) que renderiza o navegador simulado com rota, KPIs, Kanban/tabelas, inputs e botões interativos conectados à próxima tela do fluxo.
- [x] **Exportação de Tasks para Linear, Jira, Trello e GitHub Issues**:
  - [x] Compilador `Tasks` na aba `Dossiê PRD` que converte cada Fase (`FASE-01`, `FASE-02`) em Épico/Milestone e cada `Tela`/`API`/`DB` em Issue numerada (`TASK-01`...) com critérios de aceite (DoD).
- [x] **Gerador de Migration SQL & Prisma Schema**:
  - [x] Compilador `SQL/DB` na aba `Dossiê PRD` que gera script PostgreSQL/Supabase (`CREATE TABLE IF NOT EXISTS`) e modelos `schema.prisma` a partir das tabelas e telas mapeadas.

---

## Fase 4 — Portal de Aprovação do Cliente & Colaboração (Em Evolução)

- [x] **Assinatura Rápida de Aprovação de Escopo por Fase**:
  - [x] Botão de validação no cabeçalho de cada Fase (`FASE-01`, `FASE-02`) para aprovar e marcar todos os blocos contidos na fase como `Validado (OK)` de uma só vez.
- [ ] **Colaboração Multiplayer em Tempo Real (Supabase Realtime)**:
  - [ ] Cursores ao vivo de múltiplos participantes via `supabase.channel('board-room')`.
- [ ] **Histórico de Revisões (`REV 01`, `REV 02`, `REV 03`) com Diff Visual**:
  - [ ] Comparar duas versões do fluxograma para mostrar ao cliente o que entrou ou saiu do escopo entre reuniões.
