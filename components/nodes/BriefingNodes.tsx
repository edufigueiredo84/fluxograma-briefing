"use client";

import React from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import {
  Monitor,
  Zap,
  GitBranch,
  Webhook,
  Database,
  StickyNote,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  Table2,
  BarChart3,
  Upload,
  MousePointerClick,
  FormInput,
  ListFilter,
  Download,
  Sparkles,
  Maximize2,
  Cloud,
  FileText,
  Hexagon,
} from "lucide-react";
import type {
  BriefingNode,
  FlowNodeData,
  ScreenField,
  ShapePaletteColor,
} from "@/lib/types";

const PRIORITY_BADGE: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  mvp: {
    label: "MVP",
    bg: "#E8EEFF",
    text: "#1438B8",
    border: "#B8CAFF",
  },
  fase2: {
    label: "FASE 2",
    bg: "#262B36",
    text: "#F3F1EA",
    border: "#3E465A",
  },
  desejavel: {
    label: "DESEJÁVEL",
    bg: "#E6F4F1",
    text: "#0F766E",
    border: "#A7DCD2",
  },
  fora: {
    label: "FORA",
    bg: "#FDECEC",
    text: "#B42318",
    border: "#F5B8B4",
  },
};

function FieldIcon({ kind }: { kind: ScreenField["kind"] }) {
  switch (kind) {
    case "input":
      return <FormInput className="w-3 h-3 shrink-0 text-[var(--ink-secondary)]" />;
    case "select":
      return <ListFilter className="w-3 h-3 shrink-0 text-[var(--ink-secondary)]" />;
    case "table":
      return <Table2 className="w-3 h-3 shrink-0 text-[#3B66FF]" />;
    case "kpi":
    case "chart":
      return <BarChart3 className="w-3 h-3 shrink-0 text-[#149E93]" />;
    case "upload":
      return <Upload className="w-3 h-3 shrink-0 text-[#8B5CF6]" />;
    case "button":
      return <MousePointerClick className="w-3 h-3 shrink-0 text-[#3B66FF]" />;
    default:
      return <FormInput className="w-3 h-3 shrink-0 text-[var(--ink-secondary)]" />;
  }
}

function StatusChip({ status }: { status?: FlowNodeData["status"] }) {
  if (status === "validado") {
    return (
      <span
        title="Validado com o cliente"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[#0F766E]/20 text-[#2DD4BF] border border-[#0F766E] rounded-[4px]"
      >
        <CheckCircle2 className="w-2.5 h-2.5" />
        OK
      </span>
    );
  }
  if (status === "duvida") {
    return (
      <span
        title="Dúvida pendente no briefing"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[#D9381E]/20 text-[#F87171] border border-[#D9381E] rounded-[4px]"
      >
        <AlertCircle className="w-2.5 h-2.5" />
        DÚVIDA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[var(--ink-secondary)] bg-[var(--bg-panel)] border border-[var(--rule-hairline)] rounded-[4px]">
      <Clock className="w-2.5 h-2.5" />
      RASCUNHO
    </span>
  );
}

function CommentBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#D9381E] text-[#FAF8F4] rounded-[4px]">
      <MessageSquare className="w-2.5 h-2.5" />
      {count}
    </span>
  );
}

/**
 * 1. SCREEN NODE (Tela / Interface de Sistema)
 */
export function ScreenNode({ data, selected }: NodeProps<BriefingNode>) {
  const prio = PRIORITY_BADGE[data.priority || "mvp"] || PRIORITY_BADGE.mvp;
  const openComments = (data.comments || []).filter((c) => !c.resolved).length;
  const fields = data.fields || [];

  return (
    <div
      className={`w-[288px] bg-[var(--bg-card)] text-[var(--ink-primary)] rounded-[12px] border transition-colors ${
        selected
          ? "border-[#3B66FF] ring-2 ring-[#3B66FF]/30"
          : "border-[var(--rule-strong)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[#3B66FF]"
      />

      {/* Top Blueprint Header Strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1B4DFF] text-[#FAF8F4] rounded-t-[11px] border-b border-[var(--rule-strong)]">
        <div className="flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tracking-tight tabular-nums">
            {data.code || "SCR"}
          </span>
          {data.route && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#1235B5] text-[#DCE6FF] rounded-[3px] truncate max-w-[125px]">
              {data.route}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CommentBadge count={openComments} />
          <span
            style={{
              backgroundColor: prio.bg,
              color: prio.text,
              borderColor: prio.border,
            }}
            className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] border"
          >
            {prio.label}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("briefing-screen-preview", {
                    detail: { code: data.code },
                  })
                );
              }
            }}
            title="Expandir protótipo wireframe desta tela"
            aria-label="Expandir protótipo wireframe desta tela"
            className="nodrag p-1 rounded-[4px] bg-[#1235B5] hover:bg-[#0D278A] text-[#FAF8F4] transition-colors"
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
            {data.title}
          </p>
        </div>

        {data.subtitle && (
          <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
            {data.subtitle}
          </p>
        )}

        {/* Mini-Wireframe Schematic of Screen Fields */}
        {fields.length > 0 && (
          <div className="bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[8px] p-2 space-y-1.5">
            <div className="flex items-center justify-between border-b border-[var(--rule-hairline)] pb-1">
              <span className="font-mono text-[10px] text-[var(--ink-secondary)]">
                WIREFRAME · {fields.length} COMPONENTE{fields.length > 1 ? "S" : ""}
              </span>
              <StatusChip status={data.status} />
            </div>
            <div className="space-y-1">
              {fields.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-[4px] text-[11px] border ${
                    f.kind === "button"
                      ? "bg-[#1B4DFF] text-[#FAF8F4] border-[#1438B8] font-medium"
                      : "bg-[var(--bg-card)] text-[var(--ink-primary)] border-[var(--rule-hairline)]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {f.kind !== "button" && <FieldIcon kind={f.kind} />}
                    <span className="truncate">{f.label}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase shrink-0 ${
                      f.kind === "button"
                        ? "text-[#DCE6FF]"
                        : "text-[var(--ink-secondary)]"
                    }`}
                  >
                    {f.kind}
                  </span>
                </div>
              ))}
              {fields.length > 4 && (
                <div className="text-center font-mono text-[10px] text-[var(--ink-secondary)] pt-0.5">
                  + {fields.length - 4} campo(s) no escopo
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer metadata */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--rule-hairline)] text-[11px] text-[var(--ink-secondary)]">
          <span className="inline-flex items-center gap-1 font-medium text-[var(--ink-primary)]">
            <User className="w-3 h-3 text-[#3B66FF]" />
            {data.actor || "Usuário"}
          </span>
          {data.businessRules && data.businessRules.length > 0 && (
            <span className="font-mono text-[10px] text-[var(--ink-secondary)] tabular-nums">
              {data.businessRules.length} regra(s)
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#3B66FF] !border-2 !border-[var(--bg-card)]"
      />
    </div>
  );
}

/**
 * 2. ACTION NODE (Ação do Usuário / Gatilho Operacional)
 */
export function ActionNode({ data, selected }: NodeProps<BriefingNode>) {
  const openComments = (data.comments || []).filter((c) => !c.resolved).length;
  return (
    <div
      className={`w-[244px] bg-[var(--bg-card)] text-[var(--ink-primary)] rounded-[12px] border transition-colors ${
        selected
          ? "border-[#3B66FF] ring-2 ring-[#3B66FF]/30"
          : "border-[var(--rule-strong)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[#D97706]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#B45309] text-[#FAF8F4] rounded-t-[11px] border-b border-[var(--rule-strong)]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tabular-nums">
            {data.code || "ACT"} · AÇÃO
          </span>
        </div>
        <CommentBadge count={openComments} />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
          {data.title}
        </p>
        {data.subtitle && (
          <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
            {data.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between pt-1.5 border-t border-[var(--rule-hairline)] text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium text-[var(--ink-primary)]">
            <User className="w-3 h-3 text-[#F59E0B]" />
            {data.actor || "Operador"}
          </span>
          <StatusChip status={data.status} />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#D97706] !border-2 !border-[var(--bg-card)]"
      />
    </div>
  );
}

/**
 * 3. DECISION NODE (Decisão / Condição / Regra de Negócio com saídas SIM e NÃO)
 */
export function DecisionNode({ data, selected }: NodeProps<BriefingNode>) {
  const openComments = (data.comments || []).filter((c) => !c.resolved).length;
  return (
    <div
      className={`w-[258px] bg-[var(--bg-card)] text-[var(--ink-primary)] rounded-[12px] border transition-colors ${
        selected
          ? "border-[#3B66FF] ring-2 ring-[#3B66FF]/30"
          : "border-[var(--rule-strong)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[#D9381E]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#D9381E] text-[#FAF8F4] rounded-t-[11px] border-b border-[var(--rule-strong)]">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tabular-nums">
            {data.code || "DEC"} · DECISÃO
          </span>
        </div>
        <CommentBadge count={openComments} />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
          {data.title}
        </p>
        {data.subtitle && (
          <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
            {data.subtitle}
          </p>
        )}

        {data.businessRules && data.businessRules.length > 0 && (
          <div className="bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[6px] p-2 space-y-1">
            {data.businessRules.slice(0, 2).map((rule, idx) => (
              <p
                key={idx}
                className="text-[11px] text-[var(--ink-primary)] leading-snug flex items-start gap-1"
              >
                <ArrowRight className="w-3 h-3 shrink-0 mt-0.5 text-[#E54D2E]" />
                <span>{rule}</span>
              </p>
            ))}
          </div>
        )}

        {/* Dual port legend */}
        <div className="flex items-center justify-between pt-1.5 border-t border-[var(--rule-hairline)] font-mono text-[10px]">
          <span className="text-[#149E93] font-semibold">● Porta Sup: SIM</span>
          <span className="text-[#F87171] font-semibold">● Porta Inf: NÃO</span>
        </div>
      </div>

      {/* Output Handle: YES */}
      <Handle
        id="yes"
        type="source"
        position={Position.Right}
        style={{ top: "38%" }}
        title="Caminho SIM / Verdadeiro"
        className="!w-3.5 !h-3.5 !bg-[#149E93] !border-2 !border-[var(--bg-card)]"
      />
      {/* Output Handle: NO */}
      <Handle
        id="no"
        type="source"
        position={Position.Right}
        style={{ top: "74%" }}
        title="Caminho NÃO / Exceção"
        className="!w-3.5 !h-3.5 !bg-[#E54D2E] !border-2 !border-[var(--bg-card)]"
      />
    </div>
  );
}

/**
 * 4. INTEGRATION NODE (API / Webhook / Serviço Externo)
 */
export function IntegrationNode({ data, selected }: NodeProps<BriefingNode>) {
  return (
    <div
      className={`w-[258px] bg-[var(--bg-card)] text-[var(--ink-primary)] rounded-[12px] border transition-colors ${
        selected
          ? "border-[#3B66FF] ring-2 ring-[#3B66FF]/30"
          : "border-[var(--rule-strong)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[#7C3AED]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#6D28D9] text-[#FAF8F4] rounded-t-[11px] border-b border-[var(--rule-strong)]">
        <div className="flex items-center gap-1.5">
          <Webhook className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tabular-nums">
            {data.code || "API"} · INTEGRAÇÃO
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 bg-[#4C1D95] text-[#EDE9FE] rounded-[4px]">
          {data.method || "WEBHOOK"}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
          {data.title}
        </p>
        {data.endpoint && (
          <div className="px-2 py-1 bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[4px] font-mono text-[11px] text-[var(--ink-primary)] truncate">
            {data.endpoint}
          </div>
        )}
        {data.subtitle && (
          <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
            {data.subtitle}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#7C3AED] !border-2 !border-[var(--bg-card)]"
      />
    </div>
  );
}

/**
 * 5. DATABASE NODE (Tabela / Entidade CRM / Persistência)
 */
export function DatabaseNode({ data, selected }: NodeProps<BriefingNode>) {
  const cols = data.fields || [];
  return (
    <div
      className={`w-[254px] bg-[var(--bg-card)] text-[var(--ink-primary)] rounded-[12px] border transition-colors ${
        selected
          ? "border-[#3B66FF] ring-2 ring-[#3B66FF]/30"
          : "border-[var(--rule-strong)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[#149E93]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0F766E] text-[#FAF8F4] rounded-t-[11px] border-b border-[var(--rule-strong)]">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tabular-nums">
            {data.code || "DB"} · DADOS
          </span>
        </div>
        {data.tableName && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#115E59] text-[#CCFBF1] rounded-[4px] truncate max-w-[115px]">
            {data.tableName}
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
          {data.title}
        </p>
        {cols.length > 0 && (
          <div className="bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[6px] divide-y divide-[var(--rule-hairline)]">
            {cols.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="px-2 py-1 flex items-center justify-between font-mono text-[11px] text-[var(--ink-primary)]"
              >
                <span className="truncate">{c.label}</span>
                {c.required && (
                  <span className="text-[10px] text-[#149E93] font-semibold">
                    REQ
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#149E93] !border-2 !border-[var(--bg-card)]"
      />
    </div>
  );
}

/**
 * 6. STICKY NOTE NODE (Post-it de Briefing estilo FigJam)
 */
const STICKY_PALETTES: Record<
  string,
  { bg: string; headerBg: string; border: string; ink: string }
> = {
  amber: {
    bg: "#FFF3C4",
    headerBg: "#F5C542",
    border: "#D8D3C8",
    ink: "#16181D",
  },
  coral: {
    bg: "#FEF0EE",
    headerBg: "#F87171",
    border: "#F5B8B4",
    ink: "#16181D",
  },
  mint: {
    bg: "#E6F4F1",
    headerBg: "#4ADE80",
    border: "#A7DCD2",
    ink: "#16181D",
  },
  sky: {
    bg: "#E8EEFF",
    headerBg: "#60A5FA",
    border: "#B8CAFF",
    ink: "#16181D",
  },
};

export function StickyNode({ data, selected }: NodeProps<BriefingNode>) {
  const pal = STICKY_PALETTES[data.stickyColor || "amber"] || STICKY_PALETTES.amber;
  return (
    <div
      style={{
        backgroundColor: pal.bg,
        borderColor: selected ? "#3B66FF" : pal.border,
        color: pal.ink,
      }}
      className={`w-[236px] rounded-[12px] border transition-colors ${
        selected ? "ring-2 ring-[#3B66FF]/35" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-[#FAF8F4] !border-2 !border-[#16181D]"
      />

      <div
        style={{ backgroundColor: pal.headerBg, borderColor: pal.border }}
        className="flex items-center justify-between px-3 py-1.5 rounded-t-[11px] border-b text-[#16181D]"
      >
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] font-semibold">
            {data.stickyTag || "NOTA DE BRIEFING"}
          </span>
        </div>
        <span className="font-mono text-[10px] opacity-80">{data.code}</span>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13.5px] font-semibold leading-snug">{data.title}</p>
        {(data.description || data.subtitle) && (
          <p className="text-[12px] leading-relaxed opacity-90">
            {data.description || data.subtitle}
          </p>
        )}
        {data.actor && (
          <div className="pt-1 border-t border-black/10 flex items-center justify-between text-[11px] font-mono opacity-80">
            <span>Fonte: {data.actor}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-[#16181D] !border-2 !border-[#FAF8F4]"
      />
    </div>
  );
}

/**
 * 7. SHAPE NODE (Formas Técnicas & Vetorizadas Estilo Draw.io / Diagrams.net)
 * Suporta redimensionamento livre (NodeResizer), 4 portas direcionais (Top, Right, Bottom, Left),
 * geometrias SVG técnicas (Losango, Cilindro DB, Paralelogramo I/O, Hexágono, Nuvem, Documento,
 * Ator UML, Círculo, Retângulo, Pílula, Callout e Texto Livre) e paleta de cores semânticas.
 */
const SHAPE_COLOR_PALETTE: Record<
  ShapePaletteColor,
  { fill: string; stroke: string; badgeBg: string; badgeText: string }
> = {
  default: {
    fill: "var(--bg-card)",
    stroke: "var(--rule-strong)",
    badgeBg: "var(--bg-panel)",
    badgeText: "var(--ink-secondary)",
  },
  cobalt: {
    fill: "rgba(27, 77, 255, 0.14)",
    stroke: "#1B4DFF",
    badgeBg: "#1B4DFF",
    badgeText: "#FAF8F4",
  },
  emerald: {
    fill: "rgba(15, 118, 110, 0.16)",
    stroke: "#0F766E",
    badgeBg: "#0F766E",
    badgeText: "#FAF8F4",
  },
  vermilion: {
    fill: "rgba(217, 56, 30, 0.15)",
    stroke: "#D9381E",
    badgeBg: "#D9381E",
    badgeText: "#FAF8F4",
  },
  violet: {
    fill: "rgba(109, 40, 217, 0.16)",
    stroke: "#6D28D9",
    badgeBg: "#6D28D9",
    badgeText: "#FAF8F4",
  },
  amber: {
    fill: "rgba(245, 197, 66, 0.18)",
    stroke: "#B45309",
    badgeBg: "#B45309",
    badgeText: "#FAF8F4",
  },
  slate: {
    fill: "var(--bg-panel)",
    stroke: "var(--ink-secondary)",
    badgeBg: "var(--bg-subcard)",
    badgeText: "var(--ink-primary)",
  },
};

export function ShapeNode({ data, selected }: NodeProps<BriefingNode>) {
  const variant = data.shapeVariant || "rectangle";
  const colorKey: ShapePaletteColor = data.shapeColor || "default";
  const pal = SHAPE_COLOR_PALETTE[colorKey] || SHAPE_COLOR_PALETTE.default;
  const strokeStyle = data.shapeStroke || "solid";
  const strokeDasharray =
    strokeStyle === "dashed"
      ? "6 4"
      : strokeStyle === "dotted"
      ? "2 3"
      : undefined;

  const defaultDims: Record<string, { w: number; h: number }> = {
    rectangle: { w: 200, h: 100 },
    pill: { w: 190, h: 84 },
    diamond: { w: 190, h: 136 },
    cylinder: { w: 176, h: 128 },
    parallelogram: { w: 210, h: 100 },
    hexagon: { w: 200, h: 110 },
    cloud: { w: 210, h: 120 },
    document: { w: 190, h: 118 },
    actor: { w: 136, h: 150 },
    circle: { w: 124, h: 124 },
    callout: { w: 210, h: 110 },
    text: { w: 180, h: 64 },
  };

  const dims = defaultDims[variant] || { w: 200, h: 100 };
  const width = data.shapeWidth || dims.w;
  const height = data.shapeHeight || dims.h;

  const activeStroke = selected ? "#3B66FF" : pal.stroke;
  const strokeWidth = selected ? 2.25 : 1.75;

  return (
    <div
      style={{ minWidth: width, minHeight: height }}
      className="relative w-full h-full flex items-center justify-center group select-none"
    >
      <NodeResizer
        isVisible={selected}
        minWidth={96}
        minHeight={54}
        lineClassName="!border-[#3B66FF]"
        handleClassName="!w-2.5 !h-2.5 !bg-[#3B66FF] !border !border-[#FAF8F4] !rounded-[2px]"
      />

      {/* 4 Omni-Directional Draw.io Style Connection Ports (Target + Source) */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[var(--bg-card)] !border-2 !border-[#3B66FF] opacity-80 group-hover:opacity-100"
      />
      <Handle
        id="top-src"
        type="source"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#3B66FF] !border-2 !border-[var(--bg-card)] opacity-0 group-hover:opacity-100"
      />

      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[#3B66FF]"
      />

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#3B66FF] !border-2 !border-[var(--bg-card)]"
      />

      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#3B66FF] !border-2 !border-[var(--bg-card)] opacity-80 group-hover:opacity-100"
      />
      <Handle
        id="bottom-tgt"
        type="target"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[var(--bg-card)] !border-2 !border-[#3B66FF] opacity-0 group-hover:opacity-100"
      />

      {/* Vector Geometry Layer for Draw.io Shapes */}
      {variant === "diamond" && (
        <svg
          viewBox="0 0 200 140"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <polygon
            points="100,4 196,70 100,136 4,70"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {variant === "parallelogram" && (
        <svg
          viewBox="0 0 210 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <polygon
            points="26,4 206,4 184,96 4,96"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {variant === "hexagon" && (
        <svg
          viewBox="0 0 200 110"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <polygon
            points="30,4 170,4 196,55 170,106 30,106 4,55"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {variant === "cylinder" && (
        <svg
          viewBox="0 0 180 130"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d="M 6,22 C 6,8 174,8 174,22 L 174,108 C 174,122 6,122 6,108 Z"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
          <ellipse
            cx="90"
            cy="22"
            rx="84"
            ry="14"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        </svg>
      )}

      {variant === "cloud" && (
        <svg
          viewBox="0 0 220 130"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d="M 52,106 C 24,106 10,88 18,66 C 12,44 34,26 58,32 C 74,10 116,10 134,30 C 160,20 192,36 194,62 C 212,72 208,106 180,106 Z"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {variant === "document" && (
        <svg
          viewBox="0 0 190 120"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d="M 6,6 L 184,6 L 184,98 Q 140,118 95,98 Q 50,78 6,102 Z"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {variant === "callout" && (
        <svg
          viewBox="0 0 210 115"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <path
            d="M 8,6 L 202,6 C 204,6 206,8 206,10 L 206,84 C 206,86 204,88 202,88 L 62,88 L 32,110 L 38,88 L 8,88 C 6,88 4,86 4,84 L 4,10 C 4,8 6,6 8,6 Z"
            fill={pal.fill}
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* CSS Box Shapes (Rectangle, Pill, Circle, Text, Actor) */}
      {(variant === "rectangle" ||
        variant === "pill" ||
        variant === "circle" ||
        variant === "text" ||
        variant === "actor") && (
        <div
          style={{
            backgroundColor:
              variant === "text" || variant === "actor"
                ? "transparent"
                : pal.fill,
            borderColor:
              variant === "text" && !selected ? "transparent" : activeStroke,
            borderStyle: strokeStyle,
            borderWidth: variant === "text" && !selected ? 0 : strokeWidth,
          }}
          className={`absolute inset-0 pointer-events-none transition-colors ${
            variant === "pill" || variant === "circle"
              ? "rounded-full"
              : "rounded-[10px]"
          } ${selected ? "ring-2 ring-[#3B66FF]/30" : ""}`}
        />
      )}

      {/* Inner Content Layer */}
      <div
        className={`relative z-10 w-full h-full flex flex-col items-center justify-center text-center ${
          variant === "diamond"
            ? "px-8 py-5"
            : variant === "cylinder"
            ? "pt-7 pb-3 px-4"
            : variant === "callout"
            ? "pb-6 pt-3 px-4"
            : "px-4 py-3"
        }`}
      >
        {variant === "actor" && (
          <svg
            viewBox="0 0 64 76"
            className="w-12 h-14 mb-1 shrink-0"
            fill="none"
            stroke={activeStroke}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="32" cy="14" r="10" fill={pal.fill} />
            <line x1="32" y1="24" x2="32" y2="50" />
            <line x1="12" y1="34" x2="52" y2="34" />
            <line x1="32" y1="50" x2="16" y2="72" />
            <line x1="32" y1="50" x2="48" y2="72" />
          </svg>
        )}

        {variant !== "text" && data.code && (
          <span
            style={{
              backgroundColor: pal.badgeBg,
              color: pal.badgeText,
            }}
            className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded-[3px] mb-1 tabular-nums tracking-tight"
          >
            {data.code}
          </span>
        )}

        <p
          className={`font-semibold text-[var(--ink-primary)] leading-snug break-words max-w-full ${
            variant === "text" ? "text-[14px] font-bold" : "text-[13px]"
          }`}
        >
          {data.title}
        </p>

        {data.subtitle && (
          <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5 leading-snug line-clamp-2 max-w-full">
            {data.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 8. SECTION NODE (Fase Arquitetural da Jornada / Agrupador Macro)
 */
export function SectionNode({ id, data, selected }: NodeProps<BriefingNode>) {
  const width = data.sectionWidth || 580;
  const height = data.sectionHeight || 560;

  const triggerPhaseAction = (
    e: React.MouseEvent,
    action: "download" | "copy-ai" | "approve-phase"
  ) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("briefing-phase-export", {
          detail: { sectionId: id, action },
        })
      );
    }
  };

  return (
    <div
      style={{ minWidth: width, minHeight: height }}
      className={`w-full h-full rounded-[14px] border border-dashed transition-colors pointer-events-all relative ${
        selected
          ? "border-[#3B66FF] bg-[#3B66FF]/[0.06]"
          : "border-[var(--rule-strong)] bg-[var(--bg-panel)]/55"
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={320}
        minHeight={220}
        lineClassName="!border-[#3B66FF]"
        handleClassName="!w-2.5 !h-2.5 !bg-[#3B66FF] !border !border-[#FAF8F4] !rounded-[2px]"
      />
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-dashed border-[var(--rule-strong)] bg-[var(--bg-panel)]/95 rounded-t-[13px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-[#1B4DFF] text-[#FAF8F4] rounded-[4px] tabular-nums shrink-0">
            {data.code || "FASE"}
          </span>
          <span className="text-[13.5px] font-bold tracking-tight text-[var(--ink-primary)] truncate">
            {data.title}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => triggerPhaseAction(e, "approve-phase")}
            title="Aprovar e validar todos os blocos desta Fase"
            aria-label="Aprovar e validar todos os blocos desta Fase"
            className="nodrag inline-flex items-center justify-center p-1.5 rounded-[5px] bg-[var(--bg-card)] hover:bg-[#0F766E] text-[#149E93] hover:text-[#FAF8F4] border border-[var(--rule-hairline)] transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => triggerPhaseAction(e, "copy-ai")}
            title="Copiar Prompt de IA apenas com as telas, fluxos e regras desta Fase"
            className="nodrag inline-flex items-center gap-1 px-2 py-1 rounded-[5px] bg-[var(--bg-card)] hover:bg-[#1B4DFF] text-[var(--ink-primary)] hover:text-[#FAF8F4] border border-[var(--rule-hairline)] font-mono text-[10px] font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#3B66FF] group-hover:text-white" />
            <span>Prompt IA</span>
          </button>
          <button
            type="button"
            onClick={(e) => triggerPhaseAction(e, "download")}
            title="Baixar arquivo .md apenas com os itens desta Fase"
            aria-label="Baixar arquivo .md desta Fase"
            className="nodrag inline-flex items-center gap-1 px-2 py-1 rounded-[5px] bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] font-mono text-[10px] font-semibold transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>.MD</span>
          </button>
        </div>
      </div>
      {data.subtitle && (
        <div className="px-4 py-1.5 text-[12px] text-[var(--ink-secondary)] border-b border-dashed border-[var(--rule-hairline)] bg-[var(--bg-card)]/40">
          {data.subtitle}
        </div>
      )}
    </div>
  );
}

export const BRIEFING_NODE_TYPES = {
  screen: ScreenNode,
  action: ActionNode,
  decision: DecisionNode,
  integration: IntegrationNode,
  database: DatabaseNode,
  sticky: StickyNode,
  shape: ShapeNode,
  section: SectionNode,
};
