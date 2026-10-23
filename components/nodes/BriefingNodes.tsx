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
    bg: "#F3EFE6",
    text: "#4A4D55",
    border: "#D8D3C8",
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
      return <FormInput className="w-3 h-3 shrink-0 text-[#4A4D55]" />;
    case "select":
      return <ListFilter className="w-3 h-3 shrink-0 text-[#4A4D55]" />;
    case "table":
      return <Table2 className="w-3 h-3 shrink-0 text-[#1B4DFF]" />;
    case "kpi":
    case "chart":
      return <BarChart3 className="w-3 h-3 shrink-0 text-[#0F766E]" />;
    case "upload":
      return <Upload className="w-3 h-3 shrink-0 text-[#6D28D9]" />;
    case "button":
      return <MousePointerClick className="w-3 h-3 shrink-0 text-[#1B4DFF]" />;
    default:
      return <FormInput className="w-3 h-3 shrink-0 text-[#4A4D55]" />;
  }
}

function StatusChip({ status }: { status?: FlowNodeData["status"] }) {
  if (status === "validado") {
    return (
      <span
        title="Validado com o cliente"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[#E6F4F1] text-[#0F766E] border border-[#A7DCD2] rounded-[4px]"
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
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[#FEF0EE] text-[#D9381E] border border-[#F5B8B4] rounded-[4px]"
      >
        <AlertCircle className="w-2.5 h-2.5" />
        DÚVIDA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[#4A4D55] bg-[#EFECE4] border border-[#D8D3C8] rounded-[4px]">
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
      className={`w-[288px] bg-[#FAF8F4] rounded-[12px] border transition-colors ${
        selected ? "border-[#1B4DFF] ring-2 ring-[#1B4DFF]/20" : "border-[#16181D]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#FAF8F4] !border-2 !border-[#1B4DFF]"
      />

      {/* Top Blueprint Header Strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1B4DFF] text-[#FAF8F4] rounded-t-[11px] border-b border-[#16181D]">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-semibold text-[#16181D] leading-snug">
            {data.title}
          </p>
        </div>

        {data.subtitle && (
          <p className="text-[12px] text-[#4A4D55] leading-relaxed">
            {data.subtitle}
          </p>
        )}

        {/* Mini-Wireframe Schematic of Screen Fields */}
        {fields.length > 0 && (
          <div className="bg-[#F6F3EC] border border-[#D8D3C8] rounded-[8px] p-2 space-y-1.5">
            <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-1">
              <span className="font-mono text-[10px] text-[#4A4D55]">
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
                      : "bg-[#FAF8F4] text-[#16181D] border-[#D8D3C8]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {f.kind !== "button" && <FieldIcon kind={f.kind} />}
                    <span className="truncate">{f.label}</span>
                  </div>
                  <span
                    className={`font-mono text-[9px] uppercase shrink-0 ${
                      f.kind === "button" ? "text-[#DCE6FF]" : "text-[#4A4D55]"
                    }`}
                  >
                    {f.kind}
                  </span>
                </div>
              ))}
              {fields.length > 4 && (
                <div className="text-center font-mono text-[10px] text-[#4A4D55] pt-0.5">
                  + {fields.length - 4} campo(s) no escopo
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer metadata */}
        <div className="flex items-center justify-between pt-1 border-t border-[#D8D3C8] text-[11px] text-[#4A4D55]">
          <span className="inline-flex items-center gap-1 font-medium text-[#16181D]">
            <User className="w-3 h-3 text-[#1B4DFF]" />
            {data.actor || "Usuário"}
          </span>
          {data.businessRules && data.businessRules.length > 0 && (
            <span className="font-mono text-[10px] text-[#4A4D55] tabular-nums">
              {data.businessRules.length} regra(s)
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#1B4DFF] !border-2 !border-[#FAF8F4]"
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
      className={`w-[244px] bg-[#FAF8F4] rounded-[12px] border transition-colors ${
        selected ? "border-[#1B4DFF] ring-2 ring-[#1B4DFF]/20" : "border-[#16181D]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#FAF8F4] !border-2 !border-[#B45309]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#B45309] text-[#FAF8F4] rounded-t-[11px] border-b border-[#16181D]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tabular-nums">
            {data.code || "ACT"} · AÇÃO
          </span>
        </div>
        <CommentBadge count={openComments} />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13px] font-semibold text-[#16181D] leading-snug">
          {data.title}
        </p>
        {data.subtitle && (
          <p className="text-[11.5px] text-[#4A4D55] leading-relaxed">
            {data.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between pt-1.5 border-t border-[#D8D3C8] text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium text-[#16181D]">
            <User className="w-3 h-3 text-[#B45309]" />
            {data.actor || "Operador"}
          </span>
          <StatusChip status={data.status} />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#B45309] !border-2 !border-[#FAF8F4]"
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
      className={`w-[258px] bg-[#FAF8F4] rounded-[12px] border transition-colors ${
        selected ? "border-[#1B4DFF] ring-2 ring-[#1B4DFF]/20" : "border-[#16181D]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#FAF8F4] !border-2 !border-[#D9381E]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#D9381E] text-[#FAF8F4] rounded-t-[11px] border-b border-[#16181D]">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono text-[11px] font-semibold tabular-nums">
            {data.code || "DEC"} · DECISÃO
          </span>
        </div>
        <CommentBadge count={openComments} />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13.5px] font-semibold text-[#16181D] leading-snug">
          {data.title}
        </p>
        {data.subtitle && (
          <p className="text-[11.5px] text-[#4A4D55] leading-relaxed">
            {data.subtitle}
          </p>
        )}

        {data.businessRules && data.businessRules.length > 0 && (
          <div className="bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] p-2 space-y-1">
            {data.businessRules.slice(0, 2).map((rule, idx) => (
              <p
                key={idx}
                className="text-[11px] text-[#16181D] leading-snug flex items-start gap-1"
              >
                <ArrowRight className="w-3 h-3 shrink-0 mt-0.5 text-[#D9381E]" />
                <span>{rule}</span>
              </p>
            ))}
          </div>
        )}

        {/* Dual port legend */}
        <div className="flex items-center justify-between pt-1.5 border-t border-[#D8D3C8] font-mono text-[10px]">
          <span className="text-[#0F766E] font-semibold">● Porta Superior: SIM</span>
          <span className="text-[#D9381E] font-semibold">● Porta Inferior: NÃO</span>
        </div>
      </div>

      {/* Output Handle: YES */}
      <Handle
        id="yes"
        type="source"
        position={Position.Right}
        style={{ top: "38%" }}
        title="Caminho SIM / Verdadeiro"
        className="!w-3.5 !h-3.5 !bg-[#0F766E] !border-2 !border-[#FAF8F4]"
      />
      {/* Output Handle: NO */}
      <Handle
        id="no"
        type="source"
        position={Position.Right}
        style={{ top: "74%" }}
        title="Caminho NÃO / Exceção"
        className="!w-3.5 !h-3.5 !bg-[#D9381E] !border-2 !border-[#FAF8F4]"
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
      className={`w-[258px] bg-[#FAF8F4] rounded-[12px] border transition-colors ${
        selected ? "border-[#1B4DFF] ring-2 ring-[#1B4DFF]/20" : "border-[#16181D]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#FAF8F4] !border-2 !border-[#6D28D9]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#6D28D9] text-[#FAF8F4] rounded-t-[11px] border-b border-[#16181D]">
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
        <p className="text-[13px] font-semibold text-[#16181D] leading-snug">
          {data.title}
        </p>
        {data.endpoint && (
          <div className="px-2 py-1 bg-[#F6F3EC] border border-[#D8D3C8] rounded-[4px] font-mono text-[10.5px] text-[#16181D] truncate">
            {data.endpoint}
          </div>
        )}
        {data.subtitle && (
          <p className="text-[11.5px] text-[#4A4D55] leading-relaxed">
            {data.subtitle}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#6D28D9] !border-2 !border-[#FAF8F4]"
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
      className={`w-[254px] bg-[#FAF8F4] rounded-[12px] border transition-colors ${
        selected ? "border-[#1B4DFF] ring-2 ring-[#1B4DFF]/20" : "border-[#16181D]"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#FAF8F4] !border-2 !border-[#0F766E]"
      />

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0F766E] text-[#FAF8F4] rounded-t-[11px] border-b border-[#16181D]">
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
        <p className="text-[13px] font-semibold text-[#16181D] leading-snug">
          {data.title}
        </p>
        {cols.length > 0 && (
          <div className="bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] divide-y divide-[#D8D3C8]">
            {cols.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="px-2 py-1 flex items-center justify-between font-mono text-[10.5px] text-[#16181D]"
              >
                <span className="truncate">{c.label}</span>
                {c.required && (
                  <span className="text-[9px] text-[#0F766E] font-semibold">
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
        className="!w-3 !h-3 !bg-[#0F766E] !border-2 !border-[#FAF8F4]"
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
    border: "#B8860B",
    ink: "#1F1A0C",
  },
  coral: {
    bg: "#FFE4E1",
    headerBg: "#F87171",
    border: "#B91C1C",
    ink: "#261111",
  },
  mint: {
    bg: "#DCFCE7",
    headerBg: "#4ADE80",
    border: "#15803D",
    ink: "#0F291A",
  },
  sky: {
    bg: "#DBEAFE",
    headerBg: "#60A5FA",
    border: "#1D4ED8",
    ink: "#101E36",
  },
};

export function StickyNode({ data, selected }: NodeProps<BriefingNode>) {
  const pal = STICKY_PALETTES[data.stickyColor || "amber"] || STICKY_PALETTES.amber;
  return (
    <div
      style={{
        backgroundColor: pal.bg,
        borderColor: selected ? "#1B4DFF" : pal.border,
        color: pal.ink,
      }}
      className={`w-[236px] rounded-[12px] border transition-colors ${
        selected ? "ring-2 ring-[#1B4DFF]/25" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-[#FAF8F4] !border-2 !border-[#16181D]"
      />

      <div
        style={{ backgroundColor: pal.headerBg, borderColor: pal.border }}
        className="flex items-center justify-between px-3 py-1.5 rounded-t-[11px] border-b"
      >
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" />
          <span className="font-mono text-[10.5px] font-semibold">
            {data.stickyTag || "NOTA DE BRIEFING"}
          </span>
        </div>
        <span className="font-mono text-[10px] opacity-80">{data.code}</span>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[13px] font-semibold leading-snug">{data.title}</p>
        {(data.description || data.subtitle) && (
          <p className="text-[12px] leading-relaxed opacity-90">
            {data.description || data.subtitle}
          </p>
        )}
        {data.actor && (
          <div className="pt-1 border-t border-black/10 flex items-center justify-between text-[10.5px] font-mono opacity-80">
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
      className={`min-w-[180px] max-w-[240px] px-4 py-3 bg-[#FAF8F4] border-2 text-center transition-colors ${
        variant === "pill" ? "rounded-full" : "rounded-[12px]"
      } ${selected ? "border-[#1B4DFF] ring-2 ring-[#1B4DFF]/20" : "border-[#16181D]"}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#FAF8F4] !border-2 !border-[#16181D]"
      />
      <span className="font-mono text-[10px] text-[#4A4D55] block mb-0.5">
        {data.code}
      </span>
      <p className="text-[13px] font-semibold text-[#16181D] leading-snug">
        {data.title}
      </p>
      {data.subtitle && (
        <p className="text-[11px] text-[#4A4D55] mt-1">{data.subtitle}</p>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#16181D] !border-2 !border-[#FAF8F4]"
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
    action: "download" | "copy-ai"
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
          ? "border-[#1B4DFF] bg-[#1B4DFF]/[0.04]"
          : "border-[#9E988B] bg-[#EFECE4]/55"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-dashed border-[#9E988B] bg-[#EFECE4]/90 rounded-t-[13px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 bg-[#16181D] text-[#FAF8F4] rounded-[4px] tabular-nums shrink-0">
            {data.code || "FASE"}
          </span>
          <span className="text-[13.5px] font-bold tracking-tight text-[#16181D] truncate">
            {data.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => triggerPhaseAction(e, "copy-ai")}
            title="Copiar Prompt de IA apenas com as telas, fluxos e regras desta Fase"
            className="nodrag inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#FAF8F4] hover:bg-[#1B4DFF] text-[#16181D] hover:text-[#FAF8F4] border border-[#16181D] font-mono text-[10px] font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Prompt IA da Fase</span>
          </button>
          <button
            type="button"
            onClick={(e) => triggerPhaseAction(e, "download")}
            title="Baixar arquivo .md apenas com os itens desta Fase"
            className="nodrag inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[#16181D] hover:bg-[#1B4DFF] text-[#FAF8F4] font-mono text-[10px] font-semibold transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>.MD da Fase</span>
          </button>
        </div>
      </div>
      {data.subtitle && (
        <div className="px-4 py-1.5 text-[12px] text-[#4A4D55] border-b border-dashed border-[#D8D3C8]/70 bg-[#FAF8F4]/50">
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
