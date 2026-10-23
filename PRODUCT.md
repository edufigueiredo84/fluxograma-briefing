# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js (App Router, TypeScript, Tailwind CSS, React Flow / `@xyflow/react`, Supabase integration with project `sovsuyjpazocwtsqtmkg` + local persistence fallback).

## Users
Consultores de produto, desenvolvedores, arquitetos de software e gestores de projeto conduzindo reuniões de briefing e levantamento de escopo ao vivo com clientes (compartilhando tela ou enviando link para validação).

## Product Purpose
Mapear, desenhar e estruturar jornadas de usuário e fluxos de sistemas (CRMs, dashboards, plataformas SaaS) em tempo real durante reuniões de briefing com clientes, transformando o diagrama visual diretamente em documentação de escopo estruturada (PRD / Markdown / JSON) e links compartilháveis para revisão e comentários do cliente.

## Positioning
Diferente de quadros brancos genéricos (como Miro ou FigJam) que entregam apenas formas soltas sem semântica de engenharia, esta ferramenta combina a fluidez de um canvas livre (post-its, formas, conectores e notas rápidas) com blocos semânticos de arquitetura de produto (Telas/Views, Ações do Usuário, Decisões/Regras de Negócio, Integrações/API e Banco de Dados), compilando o grafo desenhado na reunião em um escopo técnico estruturado pronto para desenvolvimento.

## Operating Context
Usado ao vivo durante chamadas de vídeo e reuniões de alinhamento de escopo com clientes (velocidade de criação pelo teclado/barra rápida é crítica para não travar a conversa) e posteriormente compartilhado via link com o cliente para visualização e comentários pontuais em cada etapa da jornada.

## Capabilities and Constraints
- Canvas infinito interativo com zoom, pan, minimapa, snap-to-grid e múltiplos modos de conexão.
- Paleta híbrida:
  1. Blocos semânticos de produto: Tela/Interface (com campos/componentes internos), Ação do Usuário, Decisão/Condição (Sim/Não/Regras), Integração/Webhook/API, Banco de Dados/Entidade, Atores/Personas.
  2. Ferramentas estilo FigJam: Post-its coloridos de briefing, Formas livres (retângulo, círculo, losango, cilindro), Seções/Fases da Jornada (agrupadores visuais), Texto livre e Anotações/Comentários de cliente.
- Inspetor lateral contextual para detalhar requisitos de cada nó (regras de negócio, campos da tela, prioridade MoSCoW, estimativa/complexidade, notas de reunião).
- Gerador automático de Escopo / PRD / Prompt de IA a partir do fluxograma (exportação em Markdown, JSON e impressão/PDF formatado).
- Persistência em nuvem via Supabase (`sovsuyjpazocwtsqtmkg`) com suporte a compartilhamento por link público/cliente (`?board=<id>` ou `/share/<id>`), modo de comentário para o cliente e fallback automático em `localStorage` caso a tabela ainda não tenha sido migrada ou esteja offline.
- Templates rápidos de partida (Funil CRM, Fluxo de Onboarding/Auth, Dashboard Operacional, Branco).

## Evidence on Hand
- Projeto greenfield em `C:\Users\Yellowkite\fluxograma-briefing`.
- Projeto Supabase configurado pelo usuário: `https://supabase.com/dashboard/project/sovsuyjpazocwtsqtmkg` (`https://sovsuyjpazocwtsqtmkg.supabase.co`).

## Product Principles
- **Velocidade de Reunião Ao Vivo**: Adicionar um passo na jornada ou puxar uma conexão entre telas deve levar menos de 2 segundos durante a fala do cliente.
- **Do Visual ao Escopo Técnico**: Cada nó visual carrega metadados reais de produto (campos, regras de negócio, critérios de aceite) que alimentam automaticamente o documento de escopo.
- **Clareza para o Cliente, Precisão para o Dev**: O diagrama precisa ser imediatamente compreensível para um cliente não-técnico na reunião e suficientemente detalhado para guiar a implementação.
