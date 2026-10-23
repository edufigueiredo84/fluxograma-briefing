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

## Fase 2 — Inteligência Artificial & Colaboração em Tempo Real (Próximos Passos)

- [ ] **Transcrição de Call / Áudio para Fluxograma Ao Vivo**:
  - [ ] Conectar API de voz/LLM (Gemini API) para colar um trecho da transcrição da reunião com o cliente e transformar automaticamente em Fases, Telas, Decisões e Post-its no canvas.
- [ ] **Colaboração Multiplayer em Tempo Real (Supabase Realtime)**:
  - [ ] Cursores ao vivo de múltiplos participantes e sincronização instantânea de comentários do cliente via `supabase.channel('board-room')`.
- [ ] **Atalhos de Teclado Avançados & Comando Rápido (`Ctrl+K`)**:
  - [ ] Paleta de comandos para buscar qualquer tela pelo código (`SCR-02`), filtrar apenas blocos com `Dúvida` ou filtrar apenas itens `MVP`.

---

## Fase 3 — Geração de Protótipos & Integração com Gestão de Tarefas

- [ ] **Preview de Wireframe Expandido por Tela**:
  - [ ] Ao clicar duas vezes em um bloco de `Tela (SCR)`, abrir uma visualização de protótipo de baixa/média fidelidade gerada a partir dos `fields` configurados (formulários, tabelas Kanban, gráficos e KPIs).
- [ ] **Exportação de Tasks para Linear, Jira, Trello e GitHub Issues**:
  - [ ] Converter automaticamente cada Fase (`FASE-01`, `FASE-02`) em um Épico/Milestone e cada `Tela`/`API`/`DB` em uma Issue com seus critérios de aceite e regras de negócio.
- [ ] **Gerador de Migration SQL & Prisma Schema**:
  - [ ] Compilar todos os nós do tipo `database` (`DB-01`, `DB-02`) diretamente em um arquivo `.sql` ou `schema.prisma` pronto para execução.

---

## Fase 4 — Portal de Aprovação do Cliente & Versionamento

- [ ] **Histórico de Revisões (`REV 01`, `REV 02`, `REV 03`) com Diff Visual**:
  - [ ] Comparar duas versões do fluxograma para mostrar ao cliente o que entrou ou saiu do escopo entre reuniões.
- [ ] **Assinatura de Aprovação de Escopo por Fase**:
  - [ ] Permitir que o cliente clique em "Aprovar Escopo da Fase 01" no link compartilhado, gravando carimbo de data/hora, autor e hash do PRD aprovado no Supabase.
