import type { BoardProject, FlowNodeData } from "./types";

const PRIORITY_LABELS: Record<string, string> = {
  mvp: "MVP (Essencial Fase 1)",
  fase2: "Fase 2 (Evolução)",
  desejavel: "Desejável (Nice-to-have)",
  fora: "Fora de Escopo",
};

export function compileBoardToPRD(board: BoardProject): string {
  const nodes = board.nodes || [];
  const edges = board.edges || [];

  const sections = nodes.filter((n) => n.data.category === "section");
  const screens = nodes.filter((n) => n.data.category === "screen");
  const actions = nodes.filter((n) => n.data.category === "action");
  const decisions = nodes.filter((n) => n.data.category === "decision");
  const integrations = nodes.filter((n) => n.data.category === "integration");
  const databases = nodes.filter((n) => n.data.category === "database");
  const stickies = nodes.filter((n) => n.data.category === "sticky");
  const shapes = nodes.filter((n) => n.data.category === "shape");

  const nodeMap = new Map(nodes.map((n) => [n.id, n.data]));

  const lines: string[] = [];

  lines.push(`# DOSSIÊ DE ESCOPO & PRD — ${board.title.toUpperCase()}`);
  lines.push(``);
  lines.push(`- **Cliente:** ${board.clientName}`);
  lines.push(`- **Tipo de Sistema:** ${board.systemType}`);
  lines.push(`- **Revisão:** ${board.version}`);
  lines.push(`- **Atualizado em:** ${new Date(board.updatedAt).toLocaleString("pt-BR")}`);
  lines.push(``);
  lines.push(`## 1. Objetivo Executivo do Produto`);
  lines.push(`${board.objective || "Não especificado."}`);
  lines.push(``);

  // Resumo quantitativo
  lines.push(`## 2. Inventário Arquitetural`);
  lines.push(
    `| Telas (Views) | Decisões / Regras | Ações / Gatilhos | Integrações / API | Tabelas (DB) | Notas de Reunião |`
  );
  lines.push(`| :---: | :---: | :---: | :---: | :---: | :---: |`);
  lines.push(
    `| **${screens.length}** | **${decisions.length}** | **${actions.length}** | **${integrations.length}** | **${databases.length}** | **${stickies.length}** |`
  );
  lines.push(``);

  if (sections.length > 0) {
    lines.push(`## 3. Macro-Fases da Jornada`);
    for (const sec of sections) {
      lines.push(`- **[${sec.data.code}] ${sec.data.title}**: ${sec.data.subtitle || ""}`);
    }
    lines.push(``);
  }

  if (screens.length > 0) {
    lines.push(`## 4. Especificação de Telas & Interfaces (UI)`);
    for (const scr of screens) {
      const d = scr.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title}`);
      if (d.subtitle) lines.push(`> ${d.subtitle}`);
      lines.push(`- **Rota sugerida:** \`${d.route || "/"}\``);
      lines.push(`- **Ator / Persona:** ${d.actor || "Usuário"}`);
      lines.push(`- **Prioridade:** ${PRIORITY_LABELS[d.priority || "mvp"]}`);
      lines.push(`- **Status no Briefing:** ${(d.status || "rascunho").toUpperCase()}`);

      if (d.fields && d.fields.length > 0) {
        lines.push(`- **Componentes & Campos da Tela:**`);
        for (const f of d.fields) {
          lines.push(
            `  - \`[${f.kind.toUpperCase()}]\` **${f.label}** ${
              f.required ? "*(Obrigatório)*" : "*(Opcional)*"
            }`
          );
        }
      }

      if (d.businessRules && d.businessRules.length > 0) {
        lines.push(`- **Regras de Negócio & Critérios de Aceite:**`);
        for (const r of d.businessRules) {
          lines.push(`  - ${r}`);
        }
      }

      if (d.comments && d.comments.length > 0) {
        lines.push(`- **Observações do Cliente na Tela:**`);
        for (const c of d.comments) {
          lines.push(
            `  - *[${c.author} - ${c.createdAt}]*: "${c.text}" ${
              c.resolved ? "(Resolvido)" : "(Em aberto)"
            }`
          );
        }
      }
      lines.push(``);
    }
  }

  if (decisions.length > 0) {
    lines.push(`## 5. Árvore de Decisões & Condições Lógicas`);
    for (const dec of decisions) {
      const d = dec.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title}`);
      if (d.subtitle) lines.push(`- **Contexto:** ${d.subtitle}`);
      if (d.businessRules && d.businessRules.length > 0) {
        for (const r of d.businessRules) {
          lines.push(`- **Regra:** ${r}`);
        }
      }
      const outEdges = edges.filter((e) => e.source === dec.id);
      if (outEdges.length > 0) {
        lines.push(`- **Desvios de Fluxo:**`);
        for (const oe of outEdges) {
          const targetNode = nodeMap.get(oe.target);
          lines.push(
            `  - **${oe.label || oe.sourceHandle || "Fluxo"}** ➔ \`[${
              targetNode?.code || oe.target
            }] ${targetNode?.title || ""}\``
          );
        }
      }
      lines.push(``);
    }
  }

  if (actions.length > 0) {
    lines.push(`## 6. Ações do Usuário & Gatilhos Operacionais`);
    for (const act of actions) {
      const d = act.data as FlowNodeData;
      lines.push(
        `- **[${d.code}] ${d.title}** *(Ator: ${d.actor || "Usuário"} | ${
          PRIORITY_LABELS[d.priority || "mvp"]
        })*: ${d.subtitle || ""}`
      );
      if (d.businessRules && d.businessRules.length > 0) {
        for (const r of d.businessRules) {
          lines.push(`  - Regra: ${r}`);
        }
      }
    }
    lines.push(``);
  }

  if (integrations.length > 0) {
    lines.push(`## 7. Integrações, Webhooks & APIs Externas`);
    for (const api of integrations) {
      const d = api.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title}`);
      lines.push(`- **Método / Tipo:** \`${d.method || "POST"}\``);
      lines.push(`- **Endpoint / Serviço:** \`${d.endpoint || "/api/webhook"}\``);
      lines.push(`- **Prioridade:** ${PRIORITY_LABELS[d.priority || "mvp"]}`);
      if (d.subtitle) lines.push(`- **Descrição:** ${d.subtitle}`);
      if (d.businessRules && d.businessRules.length > 0) {
        for (const r of d.businessRules) {
          lines.push(`- **Comportamento:** ${r}`);
        }
      }
      lines.push(``);
    }
  }

  if (databases.length > 0) {
    lines.push(`## 8. Modelagem de Dados & Entidades (Database Schema)`);
    for (const db of databases) {
      const d = db.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title} (\`${d.tableName || "tabela"}\`)`);
      if (d.subtitle) lines.push(`- **Finalidade:** ${d.subtitle}`);
      if (d.fields && d.fields.length > 0) {
        lines.push(`- **Colunas Mapeadas:**`);
        for (const col of d.fields) {
          lines.push(`  - \`${col.label}\` ${col.required ? "(NOT NULL)" : "(NULLABLE)"}`);
        }
      }
      lines.push(``);
    }
  }

  if (stickies.length > 0 || shapes.length > 0) {
    lines.push(`## 9. Notas de Briefing & Observações Livres (FigJam Layer)`);
    for (const st of stickies) {
      const d = st.data as FlowNodeData;
      lines.push(
        `- **[${d.stickyTag || "Nota"}] ${d.title}** *(${d.actor || "Reunião"})*: ${
          d.description || d.subtitle || ""
        }`
      );
    }
    for (const sh of shapes) {
      const d = sh.data as FlowNodeData;
      lines.push(`- **[Forma: ${d.code}] ${d.title}**: ${d.subtitle || d.description || ""}`);
    }
    lines.push(``);
  }

  if (edges.length > 0) {
    lines.push(`## 10. Trilha Completa da Jornada (Grafo de Conexões)`);
    for (const edge of edges) {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (src && tgt) {
        const edgeLabel = edge.label ? ` --(${edge.label})--> ` : ` ➔ `;
        lines.push(`- \`[${src.code}] ${src.title}\`${edgeLabel}\`[${tgt.code}] ${tgt.title}\``);
      }
    }
    lines.push(``);
  }

  return lines.join("\n");
}

export function compileBoardToAIPrompt(board: BoardProject): string {
  const prd = compileBoardToPRD(board);
  return [
    `Atue como um Engenheiro de Software Sênior e Arquiteto de Produto.`,
    `Abaixo está a especificação funcional e técnica extraída diretamente da nossa reunião de briefing com o cliente "${board.clientName}" para o sistema "${board.title}" (${board.systemType}).`,
    ``,
    `Sua tarefa é implementar as telas, rotas de API, banco de dados e regras de negócio exatamente conforme mapeado na jornada abaixo, priorizando todos os itens marcados como MVP:`,
    ``,
    `---`,
    prd,
  ].join("\n");
}
