# Surface Brief — Workspace Principal & Estúdio de Briefing (`app/page.tsx`)

## Scope and Visitor Mode
- **Surface:** `app/page.tsx` (Workspace principal de mapeamento de jornadas, canvas interativo, inspetor de requisitos, gerador de PRD e visualização compartilhável com cliente)
- **Mode:** Operate (com modo leitura/comentário para o link compartilhado do cliente)

## Audience, Job, Action & Constraints
- **Audience:** Consultor/arquiteto de produto e desenvolvedor em reunião ao vivo com o cliente (e o próprio cliente acessando o link compartilhado).
- **Primary Task:** Desenhar fluxos e jornadas de usuário dentro de sistemas/CRMs/dashboards em tempo real durante a call de briefing, detalhar campos e regras de cada tela/decisão e exportar um documento de escopo (PRD / Markdown / JSON) ou link compartilhável no Supabase (`sovsuyjpazocwtsqtmkg`).
- **Constraints:** Precisa funcionar instantaneamente sem fricção (fallback local + sincronização com Supabase), ter atalhos rápidos para não travar a conversa e diferenciar claramente blocos de arquitetura (Telas, Ações, Decisões, APIs, Banco de Dados) de elementos livres tipo FigJam (Post-its, Formas, Seções/Fases, Comentários).

## Direction contract
- **THESIS:** Um estúdio de cartografia de produto e planta arquitetônica (Drafting Studio) onde cada bloco desenhado no canvas de papel vellum já é simultaneamente uma especificação viva de engenharia, recusando o visual genérico de quadros brancos SaaS vazios que entregam apenas formas soltas sem semântica de escopo.
- **OWN-WORLD:** Papel vellum técnico aquecido (`#F6F3EC`), superfície de painel marfim (`#EFECE4`), linhas de chamada e bordas estruturais em tinta nanquim (`#16181D` / `#D8D3C8` 1px), azul cobalto de engenharia (`#1B4DFF`) para telas e seleção ativa, vermelhão de revisão (`#D9381E`) para decisões/alertas, esmeralda técnico (`#0F766E`) para banco/dados, violeta de integração (`#6D28D9`) para APIs/webhooks e amarelo ocre (`#F5C542`) para post-its táteis de briefing; tipografia geométrica técnica pareada com monoespaçada tabular para IDs de nós (`SCR-01`, `DEC-02`, `API-03`) e coordenadas.
- **STORY:** Durante a call, o usuário adiciona telas, decisões e post-its em segundos pelo dock inferior ou atalhos numéricos, conecta caminhos de "Sim/Não" ou ações, preenche os campos/regras no inspetor técnico e, ao final da reunião, clica em "Compilar Escopo / PRD" ou "Compartilhar com Cliente" para entregar uma especificação impecável.
- **FIRST VIEWPORT:** Cabeçalho estilo carimbo de planta arquitetônica (nome do projeto, cliente, seletor de templates de jornada CRM/SaaS, status de sincronização Supabase, botões de Compartilhar Link e Compilar PRD) no topo (`56px`); paleta rápida de blocos semânticos e ferramentas FigJam flutuante à esquerda/base; canvas infinito com grade técnica pontilhada no centro exibindo uma jornada completa interativa; e painel lateral retrátil à direita alternando entre Inspetor do Nó selecionado, Dossiê PRD Ao Vivo e Comentários do Cliente.
- **FORM:** Blueprint & Cartografia de Produto (Drafting Studio), posição #1 na lista fundamentada (`model-pick`), seed key `3d987794`.
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
