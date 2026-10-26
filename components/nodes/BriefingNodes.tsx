"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
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
} from "lucide-react";
import type { BriefingNode, FlowNodeData, ScreenField } from "@/lib/types";

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
 * 7. SHAPE NODE (Formas Livres estilo FigJam: Retângulo, Pílula, Losango, Cilindro)
 */
export function ShapeNode({ data, selected }: NodeProps<BriefingNode>) {
  const variant = data.shapeVariant || "rectangle";
  return (
    <div
      className={`min-w-[180px] max-w-[240px] px-4 py-3 bg-[var(--bg-card)] text-[var(--ink-primary)] border-2 text-center transition-colors ${
        variant === "pill" ? "rounded-full" : "rounded-[12px]"
      } ${
        selected
          ? "border-[#3B66FF] ring-2 ring-[#3B66FF]/30"
          : "border-[var(--rule-strong)]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[var(--bg-card)] !border-2 !border-[var(--rule-strong)]"
      />
      <span className="font-mono text-[10px] text-[var(--ink-secondary)] block mb-0.5">
        {data.code}
      </span>
      <p className="text-[13.5px] font-semibold text-[var(--ink-primary)] leading-snug">
        {data.title}
      </p>
      {data.subtitle && (
        <p className="text-[12px] text-[var(--ink-secondary)] mt-1">
          {data.subtitle}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[var(--rule-strong)] !border-2 !border-[var(--bg-card)]"
      />
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
      style={{ width, height }}
      className={`rounded-[14px] border border-dashed transition-colors pointer-events-all ${
        selected
          ? "border-[#3B66FF] bg-[#3B66FF]/[0.06]"
          : "border-[var(--rule-strong)] bg-[var(--bg-panel)]/55"
      }`}
    >
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
