import type { Node, Edge } from "@xyflow/react";

export type NodeCategory =
  | "screen"
  | "action"
  | "decision"
  | "integration"
  | "database"
  | "sticky"
  | "shape"
  | "section"
  | "comment";

export type PriorityLevel = "mvp" | "fase2" | "desejavel" | "fora";

export type ShapeVariant = "rectangle" | "pill" | "diamond" | "cylinder";

export type StickyColor = "amber" | "coral" | "mint" | "sky";

export interface ScreenField {
  id: string;
  label: string;
  kind: "input" | "select" | "table" | "kpi" | "button" | "upload" | "chart";
  required?: boolean;
}

export interface NodeComment {
  id: string;
  author: string;
  role: "cliente" | "equipe";
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface FlowNodeData extends Record<string, unknown> {
  code: string; // e.g., SCR-01, DEC-02
  category: NodeCategory;
  title: string;
  subtitle?: string;
  description?: string;
  actor?: string; // e.g., "Vendedor", "Cliente", "Gestor", "Sistema"
  priority?: PriorityLevel;
  route?: string; // for screens e.g. "/crm/pipeline"
  fields?: ScreenField[]; // for screens or database columns
  businessRules?: string[]; // for decisions/screens
  endpoint?: string; // for integrations e.g. "POST /webhooks/meta-leads"
  method?: "GET" | "POST" | "PUT" | "WEBHOOK" | "CRON" | "EVENT";
  tableName?: string; // for database nodes
  stickyColor?: StickyColor;
  stickyTag?: string; // e.g., "Fala do Cliente", "Dúvida", "Regra Crítica"
  shapeVariant?: ShapeVariant;
  sectionWidth?: number;
  sectionHeight?: number;
  comments?: NodeComment[];
  status?: "rascunho" | "validado" | "duvida";
}

export type BriefingNode = Node<FlowNodeData>;
export type BriefingEdge = Edge<{
  label?: string;
  condition?: "yes" | "no" | "default";
}>;

export interface BoardProject {
  id: string;
  title: string;
  clientName: string;
  systemType: string; // e.g., "CRM & Funil Comercial", "SaaS / Portal", "Dashboard Operacional"
  version: string;
  objective: string;
  updatedAt: string;
  nodes: BriefingNode[];
  edges: BriefingEdge[];
}
