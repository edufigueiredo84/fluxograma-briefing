import type {
  BoardProject,
  BriefingEdge,
  BriefingNode,
  FlowNodeData,
  NodeCategory,
  ScreenField,
} from "./types";

const PRIORITY_LABELS: Record<string, string> = {
  mvp: "MVP (Essencial Fase 1)",
  fase2: "Fase 2 (Evolução)",
  desejavel: "Desejável (Nice-to-have)",
  fora: "Fora de Escopo",
};

/**
 * Finds all non-section nodes positioned inside (or overlapping) a section's bounding box.
 */
export function getNodesInSection(
  allNodes: BriefingNode[],
  sectionNode: BriefingNode
): BriefingNode[] {
  const sx = sectionNode.position.x;
  const sy = sectionNode.position.y;
  const sw = sectionNode.data.sectionWidth || Number(sectionNode.style?.width) || 580;
  const sh = sectionNode.data.sectionHeight || Number(sectionNode.style?.height) || 560;

  // Include a 40px tolerance around the frame so nodes slightly touching edges are included
  const minX = sx - 40;
  const minY = sy - 40;
  const maxX = sx + sw + 40;
  const maxY = sy + sh + 40;

  return allNodes.filter((n) => {
    if (n.id === sectionNode.id || n.data.category === "section") return false;
    const nx = n.position.x + 120; // center point of node
    const ny = n.position.y + 60;
    return nx >= minX && nx <= maxX && ny >= minY && ny <= maxY;
  });
}

export function compilePhaseToMarkdown(
  board: BoardProject,
  sectionId: string
): string {
  const sectionNode = board.nodes.find((n) => n.id === sectionId);
  if (!sectionNode) return compileBoardToPRD(board);

  const phaseNodes = getNodesInSection(board.nodes, sectionNode);
  const phaseNodeIds = new Set(phaseNodes.map((n) => n.id));
  const nodeMap = new Map(board.nodes.map((n) => [n.id, n.data]));

  const phaseEdges = board.edges.filter(
    (e) => phaseNodeIds.has(e.source) || phaseNodeIds.has(e.target)
  );

  const screens = phaseNodes.filter((n) => n.data.category === "screen");
  const decisions = phaseNodes.filter((n) => n.data.category === "decision");
  const actions = phaseNodes.filter((n) => n.data.category === "action");
  const integrations = phaseNodes.filter((n) => n.data.category === "integration");
  const databases = phaseNodes.filter((n) => n.data.category === "database");
  const stickies = phaseNodes.filter((n) => n.data.category === "sticky");

  const lines: string[] = [];

  lines.push(
    `# PROMPT & ESCOPO DE IMPLEMENTAÇÃO DE FASE — [${sectionNode.data.code}] ${sectionNode.data.title}`
  );
  lines.push(``);
  lines.push(
    `Atue como um Engenheiro de Software Fullstack Sênior. Implemente o módulo/fase **${sectionNode.data.title}** dentro do sistema **${board.title}** (${board.systemType}) do cliente **${board.clientName}**.`
  );
  lines.push(``);
  lines.push(`## 1. Contexto Geral & Objetivo da Fase`);
  lines.push(`- **Projeto:** ${board.title} (${board.clientName})`);
  lines.push(`- **Fase Selecionada:** [${sectionNode.data.code}] ${sectionNode.data.title}`);
  if (sectionNode.data.subtitle) {
    lines.push(`- **Foco da Fase:** ${sectionNode.data.subtitle}`);
  }
  lines.push(`- **Objetivo Macro do Sistema:** ${board.objective}`);
  lines.push(
    `- **Itens contidos nesta Fase:** ${screens.length} tela(s), ${decisions.length} decisão(ões), ${actions.length} ação(ões), ${integrations.length} API(s), ${databases.length} tabela(s).`
  );
  lines.push(``);

  if (screens.length > 0) {
    lines.push(`## 2. Telas & Interfaces a Construir nesta Fase`);
    for (const scr of screens) {
      const d = scr.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title}`);
      if (d.subtitle) lines.push(`> ${d.subtitle}`);
      lines.push(`- **Rota / Página:** \`${d.route || "/"}\``);
      lines.push(`- **Ator / Permissão:** ${d.actor || "Usuário"}`);
      lines.push(`- **Prioridade:** ${PRIORITY_LABELS[d.priority || "mvp"]}`);

      if (d.fields && d.fields.length > 0) {
        lines.push(`- **Campos, Componentes & Ações da Interface:**`);
        for (const f of d.fields) {
          lines.push(
            `  - \`[${f.kind.toUpperCase()}]\` **${f.label}** ${
              f.required ? "*(Obrigatório)*" : "*(Opcional)*"
            }`
          );
        }
      }

      if (d.businessRules && d.businessRules.length > 0) {
        lines.push(`- **Regras de Negócio & Validações da Tela:**`);
        for (const r of d.businessRules) {
          lines.push(`  - ${r}`);
        }
      }

      if (d.comments && d.comments.length > 0) {
        lines.push(`- **Notas do Cliente sobre esta Tela:**`);
        for (const c of d.comments) {
          lines.push(`  - *[${c.author}]*: "${c.text}"`);
        }
      }
      lines.push(``);
    }
  }

  if (decisions.length > 0) {
    lines.push(`## 3. Regras Condicionais & Ramificações da Fase`);
    for (const dec of decisions) {
      const d = dec.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title}`);
      if (d.subtitle) lines.push(`- **Descrição:** ${d.subtitle}`);
      if (d.businessRules && d.businessRules.length > 0) {
        for (const r of d.businessRules) {
          lines.push(`- **Condição:** ${r}`);
        }
      }
      const outEdges = board.edges.filter((e) => e.source === dec.id);
      for (const oe of outEdges) {
        const tgt = nodeMap.get(oe.target);
        lines.push(
          `- **Caminho ${oe.label || oe.sourceHandle || "Fluxo"}** ➔ \`[${
            tgt?.code || oe.target
          }] ${tgt?.title || ""}\``
        );
      }
      lines.push(``);
    }
  }

  if (actions.length > 0) {
    lines.push(`## 4. Ações do Usuário & Gatilhos da Fase`);
    for (const act of actions) {
      const d = act.data as FlowNodeData;
      lines.push(
        `- **[${d.code}] ${d.title}** *(Ator: ${d.actor || "Usuário"})*: ${
          d.subtitle || ""
        }`
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
    lines.push(`## 5. Integrações, Endpoints & Webhooks da Fase`);
    for (const api of integrations) {
      const d = api.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title}`);
      lines.push(`- **Método:** \`${d.method || "POST"}\``);
      lines.push(`- **Endpoint:** \`${d.endpoint || "/api/webhook"}\``);
      if (d.subtitle) lines.push(`- **Resumo:** ${d.subtitle}`);
      if (d.businessRules && d.businessRules.length > 0) {
        for (const r of d.businessRules) {
          lines.push(`- **Regra:** ${r}`);
        }
      }
      lines.push(``);
    }
  }

  if (databases.length > 0) {
    lines.push(`## 6. Banco de Dados & Tabelas Envolvidas na Fase`);
    for (const db of databases) {
      const d = db.data as FlowNodeData;
      lines.push(`### [${d.code}] ${d.title} (\`${d.tableName || "tabela"}\`)`);
      if (d.subtitle) lines.push(`- **Descrição:** ${d.subtitle}`);
      if (d.fields && d.fields.length > 0) {
        lines.push(`- **Schema / Colunas:**`);
        for (const col of d.fields) {
          lines.push(`  - \`${col.label}\` ${col.required ? "(NOT NULL)" : "(NULLABLE)"}`);
        }
      }
      lines.push(``);
    }
  }

  if (stickies.length > 0) {
    lines.push(`## 7. Observações de Briefing & Post-its da Fase`);
    for (const st of stickies) {
      const d = st.data as FlowNodeData;
      lines.push(
        `- **[${d.stickyTag || "Nota"}] ${d.title}**: ${
          d.description || d.subtitle || ""
        }`
      );
    }
    lines.push(``);
  }

  if (phaseEdges.length > 0) {
    lines.push(`## 8. Fluxo de Navegação & Transições da Fase`);
    for (const edge of phaseEdges) {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (src && tgt) {
        const inSrc = phaseNodeIds.has(edge.source) ? "" : " *(Vem de outra fase)*";
        const inTgt = phaseNodeIds.has(edge.target) ? "" : " *(Vai para próxima fase)*";
        const label = edge.label ? ` --(${edge.label})--> ` : ` ➔ `;
        lines.push(
          `- \`[${src.code}] ${src.title}\`${inSrc}${label}\`[${tgt.code}] ${tgt.title}\`${inTgt}`
        );
      }
    }
    lines.push(``);
  }

  return lines.join("\n");
}

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
      const children = getNodesInSection(nodes, sec);
      lines.push(
        `- **[${sec.data.code}] ${sec.data.title}** (${children.length} itens na fase): ${
          sec.data.subtitle || ""
        }`
      );
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

/**
 * Fase 3: Compiles Database nodes (and inferred Screen form inputs) into SQL Migration + Prisma Schema.
 */
export function compileBoardToSQLAndPrisma(board: BoardProject): string {
  const nodes = board.nodes || [];
  const databases = nodes.filter((n) => n.data.category === "database");
  const screens = nodes.filter((n) => n.data.category === "screen");

  const lines: string[] = [];
  lines.push(`-- ============================================================================`);
  lines.push(`-- MIGRATION SQL (PostgreSQL / Supabase) — ${board.title.toUpperCase()}`);
  lines.push(`-- Cliente: ${board.clientName} | Versão: ${board.version}`);
  lines.push(`-- ============================================================================`);
  lines.push(``);

  const sanitizeIdentifier = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/^public\./, "")
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "") || "entidade";

  const inferSqlType = (label: string, kind: string) => {
    const l = label.toLowerCase();
    if (l.includes("uuid") || l === "id") return "uuid PRIMARY KEY DEFAULT gen_random_uuid()";
    if (l.includes("_id") || l.includes("fk")) return "uuid";
    if (l.includes("valor") || l.includes("preco") || l.includes("mrr") || l.includes("total") || kind === "kpi")
      return "numeric(14,2)";
    if (l.includes("data") || l.includes("date") || l.includes("_at") || l.includes("prazo"))
      return "timestamptz DEFAULT now()";
    if (l.includes("ativo") || l.includes("aprovado") || l.includes("bool")) return "boolean DEFAULT false";
    if (l.includes("json") || l.includes("meta") || kind === "table") return "jsonb DEFAULT '{}'::jsonb";
    return "text";
  };

  if (databases.length > 0) {
    for (const db of databases) {
      const d = db.data as FlowNodeData;
      const tableName = sanitizeIdentifier(d.tableName || d.title);
      lines.push(`-- [${d.code}] ${d.title}`);
      if (d.subtitle) lines.push(`-- ${d.subtitle}`);
      lines.push(`CREATE TABLE IF NOT EXISTS public.${tableName} (`);

      const cols = d.fields && d.fields.length > 0 ? d.fields : [];
      const hasId = cols.some((c) => c.label.toLowerCase().startsWith("id"));
      const colLines: string[] = [];

      if (!hasId) {
        colLines.push(`  id uuid PRIMARY KEY DEFAULT gen_random_uuid()`);
      }

      for (const col of cols) {
        const cleanCol = sanitizeIdentifier(col.label.split("(")[0].trim());
        const explicitTypeMatch = col.label.match(/\(([^)]+)\)/);
        const sqlType = explicitTypeMatch
          ? explicitTypeMatch[1]
          : inferSqlType(cleanCol, col.kind);
        const notNull =
          col.required && !sqlType.toUpperCase().includes("PRIMARY KEY")
            ? " NOT NULL"
            : "";
        colLines.push(`  ${cleanCol} ${sqlType}${notNull}`);
      }

      colLines.push(`  created_at timestamptz NOT NULL DEFAULT now()`);
      colLines.push(`  updated_at timestamptz NOT NULL DEFAULT now()`);
      lines.push(colLines.join(",\n"));
      lines.push(`);`);
      lines.push(``);
    }
  } else {
    lines.push(`-- Nenhuma tabela explícita (DB) encontrada; tabelas inferidas das Telas (SCR):`);
    for (const scr of screens) {
      const d = scr.data as FlowNodeData;
      const tableName = sanitizeIdentifier(d.route || d.title);
      lines.push(`CREATE TABLE IF NOT EXISTS public.${tableName} (`);
      lines.push(`  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),`);
      for (const f of (d.fields || []).filter((x) => x.kind !== "button")) {
        const colName = sanitizeIdentifier(f.label);
        lines.push(`  ${colName} ${inferSqlType(colName, f.kind)},`);
      }
      lines.push(`  created_at timestamptz NOT NULL DEFAULT now()`);
      lines.push(`);`);
      lines.push(``);
    }
  }

  lines.push(`-- ============================================================================`);
  lines.push(`-- PRISMA SCHEMA EQUIVALENTE (schema.prisma)`);
  lines.push(`-- ============================================================================`);
  lines.push(`/*`);
  for (const db of databases) {
    const d = db.data as FlowNodeData;
    const rawName = sanitizeIdentifier(d.tableName || d.title);
    const modelName = rawName
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    lines.push(`model ${modelName} {`);
    lines.push(`  id        String   @id @default(uuid()) @db.Uuid`);
    for (const col of d.fields || []) {
      const cleanCol = sanitizeIdentifier(col.label.split("(")[0].trim());
      if (cleanCol === "id") continue;
      const prismaType =
        cleanCol.includes("valor") || cleanCol.includes("total")
          ? "Decimal"
          : cleanCol.includes("data") || cleanCol.includes("at")
          ? "DateTime"
          : "String";
      lines.push(`  ${cleanCol.padEnd(10, " ")} ${prismaType}${col.required ? "" : "?"}`);
    }
    lines.push(`  createdAt DateTime @default(now()) @map("created_at")`);
    lines.push(`  updatedAt DateTime @updatedAt @map("updated_at")`);
    lines.push(`  @@map("${rawName}")`);
    lines.push(`}`);
    lines.push(``);
  }
  lines.push(`*/`);

  return lines.join("\n");
}

/**
 * Fase 3: Compiles the board into Epics & Engineering Issues for Linear / Jira / GitHub Issues.
 */
export function compileBoardToTasks(board: BoardProject): string {
  const nodes = board.nodes || [];
  const sections = nodes.filter((n) => n.data.category === "section");
  const workNodes = nodes.filter(
    (n) => n.data.category !== "section" && n.data.category !== "sticky"
  );

  const lines: string[] = [];
  lines.push(`# BACKLOG DE ENGENHARIA & ISSUES (LINEAR / JIRA / GITHUB)`);
  lines.push(`**Projeto:** ${board.title} · **Cliente:** ${board.clientName} · **Versão:** ${board.version}`);
  lines.push(``);

  if (sections.length > 0) {
    lines.push(`## ÉPICOS / MILESTONES POR FASE`);
    for (const sec of sections) {
      const children = getNodesInSection(nodes, sec);
      lines.push(`### 🎯 ÉPICO [${sec.data.code}]: ${sec.data.title}`);
      if (sec.data.subtitle) lines.push(`> ${sec.data.subtitle}`);
      lines.push(`- **Total de entregas na fase:** ${children.length} item(ns)`);
      for (const item of children) {
        const d = item.data as FlowNodeData;
        lines.push(
          `  - [ ] **[${d.code}] ${d.title}** (${d.category.toUpperCase()} · ${
            PRIORITY_LABELS[d.priority || "mvp"]
          })`
        );
      }
      lines.push(``);
    }
  }

  lines.push(`## LISTA DETALHADA DE TASKS COM CRITÉRIOS DE ACEITE`);
  lines.push(``);

  workNodes.forEach((node, idx) => {
    const d = node.data as FlowNodeData;
    const taskCode = `TASK-${String(idx + 1).padStart(2, "0")}`;
    const typeLabel =
      d.category === "screen"
        ? "Frontend / UI"
        : d.category === "integration"
        ? "Backend / API"
        : d.category === "database"
        ? "Database / Migration"
        : d.category === "decision"
        ? "Regra de Negócio"
        : "Fluxo Operacional";

    lines.push(`### [${taskCode}] (${d.code}) ${d.title}`);
    lines.push(
      `- **Camada:** ${typeLabel} | **Prioridade:** ${
        PRIORITY_LABELS[d.priority || "mvp"]
      } | **Ator:** ${d.actor || "Sistema"}`
    );
    if (d.route) lines.push(`- **Rota:** \`${d.route}\``);
    if (d.endpoint) lines.push(`- **Endpoint:** \`${d.method || "POST"} ${d.endpoint}\``);
    if (d.tableName) lines.push(`- **Tabela:** \`${d.tableName}\``);
    if (d.subtitle) lines.push(`- ** Contexto:** ${d.subtitle}`);

    lines.push(`- **Critérios de Aceite (DoD):**`);
    if (d.fields && d.fields.length > 0) {
      for (const f of d.fields) {
        lines.push(
          `  - [ ] Implementar \`[${f.kind.toUpperCase()}]\` **${f.label}** (${
            f.required ? "obrigatório" : "opcional"
          })`
        );
      }
    }
    if (d.businessRules && d.businessRules.length > 0) {
      for (const r of d.businessRules) {
        lines.push(`  - [ ] Validar regra: ${r}`);
      }
    }
    if (
      (!d.fields || d.fields.length === 0) &&
      (!d.businessRules || d.businessRules.length === 0)
    ) {
      lines.push(`  - [ ] Garantir integração no fluxo e homologar com o cliente.`);
    }
    lines.push(``);
  });

  return lines.join("\n");
}

/**
 * Fase 2: Converte um trecho de transcrição de reunião, tópicos de briefing ou cadeia de texto
 * em Fases, Telas (com mini-wireframe inferido), Decisões (SIM/NÃO), APIs, Tabelas DB e Post-its.
 */
export function parseTranscriptToFlowNodes(
  transcript: string,
  existingNodes: BriefingNode[]
): { nodes: BriefingNode[]; edges: BriefingEdge[] } {
  const rawChunks = transcript
    .split(/\n+|->|➔|=>|;|\.(?=\s+[A-ZÀ-Ú0-9])/g)
    .map((s) => s.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((s) => s.length >= 3);

  if (rawChunks.length === 0) return { nodes: [], edges: [] };

  const maxY =
    existingNodes.length > 0
      ? Math.max(...existingNodes.map((n) => n.position.y)) + 320
      : 120;
  const startX = 120;

  const createdNodes: BriefingNode[] = [];
  const createdEdges: BriefingEdge[] = [];

  // Create a wrapping Section/Phase when 3+ steps are generated from a meeting transcript
  const sectionCount =
    existingNodes.filter((n) => n.data.category === "section").length + 1;
  const ts = Date.now();

  if (rawChunks.length >= 2) {
    const sectionWidth = Math.max(660, rawChunks.length * 320 + 80);
    createdNodes.push({
      id: `sec-transcript-${ts}`,
      type: "section",
      position: { x: startX - 40, y: maxY - 65 },
      zIndex: -1,
      style: { width: sectionWidth, height: 390 },
      data: {
        code: `FASE-0${sectionCount}`,
        category: "section",
        title: `FASE 0${sectionCount} · FLUXO GERADO DA REUNIÃO`,
        subtitle: `Capturado automaticamente a partir da transcrição do briefing (${rawChunks.length} etapas)`,
        sectionWidth,
        sectionHeight: 390,
      },
    });
  }

  let flowStepIndex = 0;
  let prevFlowNode: BriefingNode | null = null;

  rawChunks.forEach((chunk, idx) => {
    const lower = chunk.toLowerCase();
    let category: NodeCategory = "screen";
    let cleanTitle = chunk;

    if (
      lower.startsWith("decisão:") ||
      lower.startsWith("decisao:") ||
      lower.startsWith("se ") ||
      lower.startsWith("caso ") ||
      lower.includes("aprovado?") ||
      lower.includes("válido?") ||
      chunk.endsWith("?")
    ) {
      category = "decision";
      cleanTitle = chunk.replace(/^(decis[aã]o|condi[cç][aã]o|regra):\s*/i, "");
    } else if (
      lower.startsWith("api:") ||
      lower.startsWith("webhook:") ||
      lower.startsWith("integração:") ||
      lower.includes("webhook") ||
      lower.includes("api ") ||
      lower.includes("asaas") ||
      lower.includes("stripe") ||
      lower.includes("omie") ||
      lower.includes("whatsapp")
    ) {
      category = "integration";
      cleanTitle = chunk.replace(/^(api|webhook|integra[cç][aã]o):\s*/i, "");
    } else if (
      lower.startsWith("banco:") ||
      lower.startsWith("db:") ||
      lower.startsWith("tabela:") ||
      lower.includes("salvar no banco") ||
      lower.includes("tabela ") ||
      lower.includes("supabase")
    ) {
      category = "database";
      cleanTitle = chunk.replace(/^(banco|db|tabela):\s*/i, "");
    } else if (
      lower.startsWith("ação:") ||
      lower.startsWith("acao:") ||
      lower.startsWith("gatilho:") ||
      lower.startsWith("clica ") ||
      lower.startsWith("usuário clica") ||
      lower.startsWith("vendedor envia")
    ) {
      category = "action";
      cleanTitle = chunk.replace(/^(a[cç][aã]o|gatilho):\s*/i, "");
    } else if (
      lower.startsWith("nota:") ||
      lower.startsWith("obs:") ||
      lower.startsWith("postit:") ||
      lower.startsWith("dúvida:")
    ) {
      category = "sticky";
      cleanTitle = chunk.replace(/^(nota|obs|postit|d[uú]vida):\s*/i, "");
    } else {
      cleanTitle = chunk.replace(/^tela:\s*/i, "");
    }

    const prefixMap: Record<NodeCategory, string> = {
      screen: "SCR",
      action: "ACT",
      decision: "DEC",
      integration: "API",
      database: "DB",
      sticky: "NOTE",
      shape: "SHP",
      section: "FASE",
      comment: "CMT",
    };

    const existingCount =
      existingNodes.filter((n) => n.data.category === category).length +
      createdNodes.filter((n) => n.data.category === category).length +
      1;
    const code = `${prefixMap[category]}-${String(existingCount).padStart(2, "0")}`;

    const inferredFields: ScreenField[] = [];
    if (category === "screen") {
      if (lower.includes("login") || lower.includes("autentica")) {
        inferredFields.push(
          { id: `tf-${ts}-${idx}-1`, label: "E-mail Corporativo", kind: "input", required: true },
          { id: `tf-${ts}-${idx}-2`, label: "Senha / Token SSO", kind: "input", required: true },
          { id: `tf-${ts}-${idx}-3`, label: "Entrar no Sistema", kind: "button", required: true }
        );
      } else if (lower.includes("dashboard") || lower.includes("painel") || lower.includes("kpi")) {
        inferredFields.push(
          { id: `tf-${ts}-${idx}-1`, label: "KPI Receita & Conversão", kind: "kpi", required: true },
          { id: `tf-${ts}-${idx}-2`, label: "Filtro por Período / Equipe", kind: "select", required: false },
          { id: `tf-${ts}-${idx}-3`, label: "Gráfico de Evolução", kind: "chart", required: true }
        );
      } else if (lower.includes("kanban") || lower.includes("lista") || lower.includes("tabela") || lower.includes("pipeline")) {
        inferredFields.push(
          { id: `tf-${ts}-${idx}-1`, label: "Busca & Filtro Rápido", kind: "select", required: false },
          { id: `tf-${ts}-${idx}-2`, label: " listagem / Quadro Kanban", kind: "table", required: true },
          { id: `tf-${ts}-${idx}-3`, label: "Novo Registro", kind: "button", required: true }
        );
      } else {
        inferredFields.push(
          { id: `tf-${ts}-${idx}-1`, label: "Dados Principais da Etapa", kind: "input", required: true },
          { id: `tf-${ts}-${idx}-2`, label: "Salvar e Avançar", kind: "button", required: true }
        );
      }
    } else if (category === "database") {
      inferredFields.push(
        { id: `tf-${ts}-${idx}-1`, label: "id (uuid PK)", kind: "input", required: true },
        { id: `tf-${ts}-${idx}-2`, label: "status (text)", kind: "select", required: true },
        { id: `tf-${ts}-${idx}-3`, label: "payload (jsonb)", kind: "table", required: false }
      );
    }

    const slug = cleanTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28);

    const nodeId = `tr-${ts}-${idx}`;
    const posX = startX + flowStepIndex * 320;
    const posY = category === "sticky" ? maxY + 210 : maxY;
    if (category !== "sticky") flowStepIndex++;

    const newNode: BriefingNode = {
      id: nodeId,
      type: category,
      position: { x: posX, y: posY },
      data: {
        code,
        category,
        title: cleanTitle.length > 54 ? `${cleanTitle.slice(0, 51)}...` : cleanTitle,
        subtitle:
          cleanTitle.length > 54
            ? cleanTitle
            : "Extraído automaticamente da transcrição do briefing",
        actor: category === "integration" ? "Sistema" : "Usuário",
        priority: "mvp",
        status: "rascunho",
        route: category === "screen" ? `/${slug || "tela"}` : undefined,
        method: category === "integration" ? "POST" : undefined,
        endpoint:
          category === "integration" ? `POST /api/v1/${slug || "webhook"}` : undefined,
        tableName:
          category === "database"
            ? `public.${slug.replace(/-/g, "_") || "registros"}`
            : undefined,
        stickyColor: category === "sticky" ? "amber" : undefined,
        stickyTag: category === "sticky" ? "Fala do Cliente" : undefined,
        fields: inferredFields.length > 0 ? inferredFields : undefined,
        businessRules:
          category === "decision"
            ? ["SIM: Segue fluxo principal", "NÃO: Tratar exceção / alçada"]
            : [],
      },
    };

    createdNodes.push(newNode);

    if (category !== "sticky") {
      if (prevFlowNode) {
        createdEdges.push({
          id: `tre-${ts}-${idx}`,
          source: prevFlowNode.id,
          sourceHandle:
            prevFlowNode.data.category === "decision" ? "yes" : undefined,
          target: nodeId,
          label: prevFlowNode.data.category === "decision" ? "SIM" : "Avança",
          animated: true,
        });
      }
      prevFlowNode = newNode;
    }
  });

  return { nodes: createdNodes, edges: createdEdges };
}

