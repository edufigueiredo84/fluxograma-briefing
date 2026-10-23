"use client";

import React, { useState } from "react";
import {
  Sliders,
  FileText,
  MessageSquare,
  Cloud,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2,
  Database,
  Layers,
} from "lucide-react";
import type {
  BoardProject,
  BriefingNode,
  FlowNodeData,
  PriorityLevel,
  ScreenField,
  StickyColor,
} from "@/lib/types";
import { compileBoardToPRD, compileBoardToAIPrompt } from "@/lib/prd-compiler";
import {
  SUPABASE_API_SETTINGS_URL,
  SUPABASE_MIGRATION_SQL,
  SUPABASE_PROJECT_REF,
  SUPABASE_SQL_EDITOR_URL,
} from "@/lib/supabase";

export type DrawerTab = "inspector" | "prd" | "comments" | "cloud";

interface RightDossierDrawerProps {
  board: BoardProject;
  selectedNode: BriefingNode | null;
  activeTab: DrawerTab;
  setActiveTab: (tab: DrawerTab) => void;
  onUpdateNodeData: (nodeId: string, patch: Partial<FlowNodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onUpdateBoardMeta: (patch: Partial<BoardProject>) => void;
  onSelectNodeById: (nodeId: string) => void;
  onSaveCloud: () => Promise<void>;
  isSaving: boolean;
  syncStatus: "local" | "supabase" | "saving" | "error";
  supabaseError: string | null;
  anonKey: string;
  setAnonKey: (key: string) => void;
  isClientMode: boolean;
}

export function RightDossierDrawer({
  board,
  selectedNode,
  activeTab,
  setActiveTab,
  onUpdateNodeData,
  onDeleteNode,
  onDuplicateNode,
  onUpdateBoardMeta,
  onSelectNodeById,
  onSaveCloud,
  isSaving,
  syncStatus,
  supabaseError,
  anonKey,
  setAnonKey,
  isClientMode,
}: RightDossierDrawerProps) {
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldKind, setNewFieldKind] = useState<ScreenField["kind"]>("input");
  const [newRuleText, setNewRuleText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState(
    isClientMode ? board.clientName || "Cliente" : "Consultor"
  );
  const [commentText, setCommentText] = useState("");
  const [prdFormat, setPrdFormat] = useState<"prd" | "prompt" | "json">("prd");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const allComments = board.nodes.flatMap((n) =>
    (n.data.comments || []).map((c) => ({
      ...c,
      nodeId: n.id,
      nodeCode: n.data.code,
      nodeTitle: n.data.title,
    }))
  );

  const handleAddField = () => {
    if (!selectedNode || !newFieldLabel.trim()) return;
    const current = selectedNode.data.fields || [];
    const next: ScreenField[] = [
      ...current,
      {
        id: `f-${Date.now()}`,
        label: newFieldLabel.trim(),
        kind: newFieldKind,
        required: true,
      },
    ];
    onUpdateNodeData(selectedNode.id, { fields: next });
    setNewFieldLabel("");
  };

  const handleRemoveField = (fieldId: string) => {
    if (!selectedNode) return;
    const current = selectedNode.data.fields || [];
    onUpdateNodeData(selectedNode.id, {
      fields: current.filter((f) => f.id !== fieldId),
    });
  };

  const handleAddRule = () => {
    if (!selectedNode || !newRuleText.trim()) return;
    const current = selectedNode.data.businessRules || [];
    onUpdateNodeData(selectedNode.id, {
      businessRules: [...current, newRuleText.trim()],
    });
    setNewRuleText("");
  };

  const handleRemoveRule = (index: number) => {
    if (!selectedNode) return;
    const current = selectedNode.data.businessRules || [];
    onUpdateNodeData(selectedNode.id, {
      businessRules: current.filter((_, idx) => idx !== index),
    });
  };

  const handleAddComment = () => {
    const targetNode =
      selectedNode ||
      board.nodes.find((n) => n.data.category === "screen") ||
      board.nodes[0];
    if (!targetNode || !commentText.trim()) return;
    const current = targetNode.data.comments || [];
    const next = [
      ...current,
      {
        id: `c-${Date.now()}`,
        author: commentAuthor.trim() || "Participante",
        role: isClientMode ? ("cliente" as const) : ("equipe" as const),
        text: commentText.trim(),
        createdAt: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        resolved: false,
      },
    ];
    onUpdateNodeData(targetNode.id, { comments: next });
    setCommentText("");
  };

  const handleToggleCommentResolved = (nodeId: string, commentId: string) => {
    const node = board.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const updated = (node.data.comments || []).map((c) =>
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    );
    onUpdateNodeData(nodeId, { comments: updated });
  };

  const compiledOutput =
    prdFormat === "prd"
      ? compileBoardToPRD(board)
      : prdFormat === "prompt"
      ? compileBoardToAIPrompt(board)
      : JSON.stringify(board, null, 2);

  const handleDownloadFile = (ext: "md" | "json") => {
    const content =
      ext === "md" ? compiledOutput : JSON.stringify(board, null, 2);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${board.id || "escopo-briefing"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareUrlClient =
    typeof window !== "undefined"
      ? `${window.location.origin}/?board=${encodeURIComponent(board.id)}&mode=client`
      : `/?board=${board.id}&mode=client`;

  const shareUrlFull =
    typeof window !== "undefined"
      ? `${window.location.origin}/?board=${encodeURIComponent(board.id)}`
      : `/?board=${board.id}`;

  return (
    <aside className="w-[376px] shrink-0 h-full bg-[#EFECE4] border-l border-[#16181D] flex flex-col select-none">
      {/* Top Tab Bar */}
      <div className="grid grid-cols-4 border-b border-[#16181D] bg-[#F6F3EC]">
        <button
          type="button"
          onClick={() => setActiveTab("inspector")}
          className={`flex flex-col items-center justify-center py-2.5 px-1 text-[11px] font-medium border-r border-[#D8D3C8] transition-colors ${
            activeTab === "inspector"
              ? "bg-[#16181D] text-[#FAF8F4]"
              : "text-[#16181D] hover:bg-[#E5E0D5]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 mb-1" />
          <span>Inspetor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("prd")}
          className={`flex flex-col items-center justify-center py-2.5 px-1 text-[11px] font-medium border-r border-[#D8D3C8] transition-colors ${
            activeTab === "prd"
              ? "bg-[#1B4DFF] text-[#FAF8F4]"
              : "text-[#16181D] hover:bg-[#E5E0D5]"
          }`}
        >
          <FileText className="w-3.5 h-3.5 mb-1" />
          <span>Dossiê PRD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comments")}
          className={`relative flex flex-col items-center justify-center py-2.5 px-1 text-[11px] font-medium border-r border-[#D8D3C8] transition-colors ${
            activeTab === "comments"
              ? "bg-[#16181D] text-[#FAF8F4]"
              : "text-[#16181D] hover:bg-[#E5E0D5]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 mb-1" />
          <span>
            Notas ({allComments.filter((c) => !c.resolved).length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cloud")}
          className={`flex flex-col items-center justify-center py-2.5 px-1 text-[11px] font-medium transition-colors ${
            activeTab === "cloud"
              ? "bg-[#0F766E] text-[#FAF8F4]"
              : "text-[#16181D] hover:bg-[#E5E0D5]"
          }`}
        >
          <Cloud className="w-3.5 h-3.5 mb-1" />
          <span>Link & DB</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {/* TAB 1: INSPECTOR */}
        {activeTab === "inspector" && (
          <>
            {!selectedNode ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#FAF8F4] border border-[#16181D] rounded-[12px] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-2">
                    <h2 className="text-[14px] font-bold text-[#16181D]">
                      Carimbo da Planta & Briefing
                    </h2>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-[#EFECE4] border border-[#D8D3C8] rounded-[4px] text-[#16181D]">
                      {board.version}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                        NOME DO PROJETO / SISTEMA
                      </label>
                      <input
                        type="text"
                        disabled={isClientMode}
                        value={board.title}
                        onChange={(e) =>
                          onUpdateBoardMeta({ title: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-[13px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                          CLIENTE
                        </label>
                        <input
                          type="text"
                          disabled={isClientMode}
                          value={board.clientName}
                          onChange={(e) =>
                            onUpdateBoardMeta({ clientName: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-[12.5px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                          TIPO DE PRODUTO
                        </label>
                        <input
                          type="text"
                          disabled={isClientMode}
                          value={board.systemType}
                          onChange={(e) =>
                            onUpdateBoardMeta({ systemType: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-[12.5px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                        OBJETIVO CENTRAL DA JORNADA
                      </label>
                      <textarea
                        rows={3}
                        disabled={isClientMode}
                        value={board.objective}
                        onChange={(e) =>
                          onUpdateBoardMeta({ objective: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-[12.5px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Inventory List */}
                <div className="p-3.5 bg-[#FAF8F4] border border-[#D8D3C8] rounded-[12px] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-[#16181D] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#1B4DFF]" />
                      Índice de Blocos no Canvas ({board.nodes.length})
                    </h3>
                  </div>
                  <p className="text-[11.5px] text-[#4A4D55]">
                    Clique em qualquer bloco no canvas ou na lista abaixo para detalhar campos de tela, regras de negócio e critérios de aceite.
                  </p>
                  <div className="max-h-[260px] overflow-y-auto divide-y divide-[#D8D3C8] border border-[#D8D3C8] rounded-[8px] bg-[#F6F3EC]">
                    {board.nodes
                      .filter((n) => n.data.category !== "section")
                      .map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => onSelectNodeById(node.id)}
                          className="w-full px-2.5 py-2 text-left flex items-center justify-between hover:bg-[#EFECE4] transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 bg-[#16181D] text-[#FAF8F4] rounded-[3px] shrink-0 tabular-nums">
                              {node.data.code}
                            </span>
                            <span className="text-[12px] font-medium text-[#16181D] truncate">
                              {node.data.title}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-[#4A4D55] uppercase shrink-0 ml-2">
                            {node.data.category}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Node Header */}
                <div className="p-3.5 bg-[#FAF8F4] border border-[#16181D] rounded-[12px] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-[#1B4DFF] text-[#FAF8F4] rounded-[4px] tabular-nums">
                        {selectedNode.data.code}
                      </span>
                      <h2 className="text-[13.5px] font-bold text-[#16181D] uppercase">
                        Bloco · {selectedNode.data.category}
                      </h2>
                    </div>

                    {!isClientMode && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Duplicar Bloco"
                          onClick={() => onDuplicateNode(selectedNode.id)}
                          className="p-1.5 text-[#16181D] hover:bg-[#EFECE4] rounded-[6px] border border-[#D8D3C8]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Excluir Bloco"
                          onClick={() => onDeleteNode(selectedNode.id)}
                          className="p-1.5 text-[#D9381E] hover:bg-[#FEF0EE] rounded-[6px] border border-[#F5B8B4]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                        TÍTULO DA ETAPA / TELA
                      </label>
                      <input
                        type="text"
                        disabled={isClientMode}
                        value={selectedNode.data.title}
                        onChange={(e) =>
                          onUpdateNodeData(selectedNode.id, {
                            title: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-[13px] font-medium bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                        DESCRIÇÃO / CONTEXTO DO BRIEFING
                      </label>
                      <textarea
                        rows={2}
                        disabled={isClientMode}
                        value={
                          selectedNode.data.category === "sticky"
                            ? selectedNode.data.description || ""
                            : selectedNode.data.subtitle || ""
                        }
                        onChange={(e) =>
                          onUpdateNodeData(
                            selectedNode.id,
                            selectedNode.data.category === "sticky"
                              ? { description: e.target.value }
                              : { subtitle: e.target.value }
                          )
                        }
                        className="w-full px-2.5 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
                      />
                    </div>

                    {/* Actor & Priority */}
                    {selectedNode.data.category !== "section" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                            ATOR / PERSONA
                          </label>
                          <input
                            type="text"
                            disabled={isClientMode}
                            placeholder="Ex: Vendedor, Cliente"
                            value={selectedNode.data.actor || ""}
                            onChange={(e) =>
                              onUpdateNodeData(selectedNode.id, {
                                actor: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D]"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                            PRIORIDADE ESCOPO
                          </label>
                          <select
                            disabled={isClientMode}
                            value={selectedNode.data.priority || "mvp"}
                            onChange={(e) =>
                              onUpdateNodeData(selectedNode.id, {
                                priority: e.target.value as PriorityLevel,
                              })
                            }
                            className="w-full px-2 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D]"
                          >
                            <option value="mvp">MVP (Fase 1)</option>
                            <option value="fase2">Fase 2</option>
                            <option value="desejavel">Desejável</option>
                            <option value="fora">Fora de Escopo</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Status de Validação */}
                    {selectedNode.data.category !== "section" && (
                      <div>
                        <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                          STATUS NA REUNIÃO
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["rascunho", "validado", "duvida"] as const).map(
                            (st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  onUpdateNodeData(selectedNode.id, {
                                    status: st,
                                  })
                                }
                                className={`py-1.5 px-2 rounded-[6px] font-mono text-[10.5px] uppercase border transition-colors ${
                                  selectedNode.data.status === st
                                    ? "bg-[#16181D] text-[#FAF8F4] border-[#16181D] font-semibold"
                                    : "bg-[#F6F3EC] text-[#4A4D55] border-[#D8D3C8] hover:bg-[#EFECE4]"
                                }`}
                              >
                                {st === "validado"
                                  ? "✓ Validado"
                                  : st === "duvida"
                                  ? "! Dúvida"
                                  : "Rascunho"}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Route for screen */}
                    {selectedNode.data.category === "screen" && (
                      <div>
                        <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                          ROTA / URL DA TELA
                        </label>
                        <input
                          type="text"
                          disabled={isClientMode}
                          placeholder="/crm/leads"
                          value={selectedNode.data.route || ""}
                          onChange={(e) =>
                            onUpdateNodeData(selectedNode.id, {
                              route: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 font-mono text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D]"
                        />
                      </div>
                    )}

                    {/* Integration endpoint & method */}
                    {selectedNode.data.category === "integration" && (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                            TIPO
                          </label>
                          <select
                            disabled={isClientMode}
                            value={selectedNode.data.method || "WEBHOOK"}
                            onChange={(e) =>
                              onUpdateNodeData(selectedNode.id, {
                                method: e.target
                                  .value as FlowNodeData["method"],
                              })
                            }
                            className="w-full px-2 py-1.5 font-mono text-[11px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                          >
                            <option value="WEBHOOK">WEBHOOK</option>
                            <option value="POST">POST</option>
                            <option value="GET">GET</option>
                            <option value="CRON">CRON</option>
                            <option value="EVENT">EVENT</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                            ENDPOINT / SERVIÇO
                          </label>
                          <input
                            type="text"
                            disabled={isClientMode}
                            value={selectedNode.data.endpoint || ""}
                            onChange={(e) =>
                              onUpdateNodeData(selectedNode.id, {
                                endpoint: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1.5 font-mono text-[11.5px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Database table name */}
                    {selectedNode.data.category === "database" && (
                      <div>
                        <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                          NOME DA TABELA NO BANCO
                        </label>
                        <input
                          type="text"
                          disabled={isClientMode}
                          value={selectedNode.data.tableName || ""}
                          onChange={(e) =>
                            onUpdateNodeData(selectedNode.id, {
                              tableName: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 font-mono text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                        />
                      </div>
                    )}

                    {/* Sticky Note Color */}
                    {selectedNode.data.category === "sticky" && (
                      <div>
                        <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                          COR DO POST-IT
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {(
                            [
                              { id: "amber", label: "Âmbar", bg: "#F5C542" },
                              { id: "coral", label: "Coral", bg: "#F87171" },
                              { id: "mint", label: "Menta", bg: "#4ADE80" },
                              { id: "sky", label: "Azul", bg: "#60A5FA" },
                            ] as const
                          ).map((col) => (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() =>
                                onUpdateNodeData(selectedNode.id, {
                                  stickyColor: col.id as StickyColor,
                                })
                              }
                              style={{ backgroundColor: col.bg }}
                              className={`py-1.5 px-2 rounded-[6px] text-[11px] font-semibold text-[#16181D] border ${
                                selectedNode.data.stickyColor === col.id
                                  ? "border-[#16181D] ring-2 ring-[#16181D]/30"
                                  : "border-black/20"
                              }`}
                            >
                              {col.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section dimensions */}
                    {selectedNode.data.category === "section" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                            LARGURA (PX)
                          </label>
                          <input
                            type="number"
                            step={20}
                            value={selectedNode.data.sectionWidth || 580}
                            onChange={(e) =>
                              onUpdateNodeData(selectedNode.id, {
                                sectionWidth: Number(e.target.value) || 580,
                              })
                            }
                            className="w-full px-2 py-1.5 font-mono text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10.5px] text-[#4A4D55] mb-1">
                            ALTURA (PX)
                          </label>
                          <input
                            type="number"
                            step={20}
                            value={selectedNode.data.sectionHeight || 560}
                            onChange={(e) =>
                              onUpdateNodeData(selectedNode.id, {
                                sectionHeight: Number(e.target.value) || 560,
                              })
                            }
                            className="w-full px-2 py-1.5 font-mono text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Screen Fields / Database Columns Editor */}
                {(selectedNode.data.category === "screen" ||
                  selectedNode.data.category === "database") && (
                  <div className="p-3.5 bg-[#FAF8F4] border border-[#D8D3C8] rounded-[12px] space-y-2.5">
                    <h3 className="text-[13px] font-bold text-[#16181D]">
                      {selectedNode.data.category === "screen"
                        ? "Componentes & Campos da Tela"
                        : "Colunas da Tabela"}
                    </h3>

                    <div className="space-y-1.5">
                      {(selectedNode.data.fields || []).map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[12px]"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-[9.5px] uppercase px-1.5 py-0.5 bg-[#EFECE4] border border-[#D8D3C8] rounded-[3px] text-[#4A4D55]">
                              {f.kind}
                            </span>
                            <span className="truncate font-medium text-[#16181D]">
                              {f.label}
                            </span>
                          </div>
                          {!isClientMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveField(f.id)}
                              className="text-[#4A4D55] hover:text-[#D9381E]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {!isClientMode && (
                      <div className="flex gap-1.5 pt-1">
                        <select
                          value={newFieldKind}
                          onChange={(e) =>
                            setNewFieldKind(
                              e.target.value as ScreenField["kind"]
                            )
                          }
                          className="px-2 py-1.5 font-mono text-[11px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                        >
                          <option value="input">Input</option>
                          <option value="select">Filtro/Select</option>
                          <option value="table">Tabela/Kanban</option>
                          <option value="kpi">KPI/Card</option>
                          <option value="chart">Gráfico</option>
                          <option value="upload">Upload</option>
                          <option value="button">Botão Ação</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Novo campo ou botão..."
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddField()
                          }
                          className="flex-1 px-2.5 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                        />
                        <button
                          type="button"
                          onClick={handleAddField}
                          className="px-2.5 py-1.5 bg-[#1B4DFF] text-[#FAF8F4] rounded-[6px] hover:bg-[#1438B8]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Business Rules Editor */}
                {selectedNode.data.category !== "section" &&
                  selectedNode.data.category !== "sticky" && (
                    <div className="p-3.5 bg-[#FAF8F4] border border-[#D8D3C8] rounded-[12px] space-y-2.5">
                      <h3 className="text-[13px] font-bold text-[#16181D]">
                        Regras de Negócio & Critérios de Aceite
                      </h3>

                      <div className="space-y-1.5">
                        {(selectedNode.data.businessRules || []).map(
                          (rule, idx) => (
                            <div
                              key={idx}
                              className="flex items-start justify-between gap-2 px-2.5 py-1.5 bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[12px]"
                            >
                              <span className="text-[#16181D] leading-snug">
                                • {rule}
                              </span>
                              {!isClientMode && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRule(idx)}
                                  className="text-[#4A4D55] hover:text-[#D9381E] shrink-0 mt-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      {!isClientMode && (
                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Adicionar regra (ex: Desconto > 5% pede senha)..."
                            value={newRuleText}
                            onChange={(e) => setNewRuleText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddRule()
                            }
                            className="flex-1 px-2.5 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                          />
                          <button
                            type="button"
                            onClick={handleAddRule}
                            className="px-2.5 py-1.5 bg-[#16181D] text-[#FAF8F4] rounded-[6px]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </>
        )}

        {/* TAB 2: PRD & SCOPE COMPILER */}
        {activeTab === "prd" && (
          <div className="space-y-3">
            <div className="p-3.5 bg-[#FAF8F4] border border-[#16181D] rounded-[12px] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#16181D]">
                  Compilador Automático de Escopo
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-[#E8EEFF] text-[#1438B8] border border-[#B8CAFF] rounded-[4px] font-semibold">
                  AO VIVO
                </span>
              </div>
              <p className="text-[12px] text-[#4A4D55] leading-relaxed">
                Cada tela, decisão, API, tabela e conexão desenhada no canvas é compilada em tempo real em documentação técnica ou prompt para desenvolvimento.
              </p>

              {/* Format Switcher */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPrdFormat("prd")}
                  className={`py-1.5 px-2 rounded-[6px] font-mono text-[11px] border ${
                    prdFormat === "prd"
                      ? "bg-[#16181D] text-[#FAF8F4] border-[#16181D] font-semibold"
                      : "bg-[#F6F3EC] text-[#16181D] border-[#D8D3C8]"
                  }`}
                >
                  PRD Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setPrdFormat("prompt")}
                  className={`py-1.5 px-2 rounded-[6px] font-mono text-[11px] border flex items-center justify-center gap-1 ${
                    prdFormat === "prompt"
                      ? "bg-[#1B4DFF] text-[#FAF8F4] border-[#1B4DFF] font-semibold"
                      : "bg-[#F6F3EC] text-[#16181D] border-[#D8D3C8]"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Prompt Dev
                </button>
                <button
                  type="button"
                  onClick={() => setPrdFormat("json")}
                  className={`py-1.5 px-2 rounded-[6px] font-mono text-[11px] border ${
                    prdFormat === "json"
                      ? "bg-[#16181D] text-[#FAF8F4] border-[#16181D] font-semibold"
                      : "bg-[#F6F3EC] text-[#16181D] border-[#D8D3C8]"
                  }`}
                >
                  JSON Grafo
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => triggerCopy("prd", compiledOutput)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] text-[12px] font-semibold rounded-[8px] transition-colors"
                >
                  {copiedKey === "prd" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Texto
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(prdFormat === "json" ? "json" : "md")
                  }
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF8F4] hover:bg-[#EFECE4] text-[#16181D] border border-[#16181D] text-[12px] font-semibold rounded-[8px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar .{prdFormat === "json" ? "json" : "md"}
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-3 bg-[#16181D] text-[#F6F3EC] rounded-[12px] border border-[#16181D]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/15 font-mono text-[10.5px] text-[#A0A4B0]">
                <span>PREVIEW · {prdFormat.toUpperCase()}</span>
                <span>{compiledOutput.split("\n").length} linhas</span>
              </div>
              <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words max-h-[430px] overflow-y-auto text-[#EFECE4]">
                {compiledOutput}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: CLIENT COMMENTS & NOTES */}
        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FAF8F4] border border-[#16181D] rounded-[12px] space-y-2.5">
              <h2 className="text-[14px] font-bold text-[#16181D]">
                Adicionar Comentário ou Dúvida do Cliente
              </h2>
              <p className="text-[12px] text-[#4A4D55]">
                {selectedNode
                  ? `Vinculado ao bloco selecionado: [${selectedNode.data.code}] ${selectedNode.data.title}`
                  : "Selecione um bloco no canvas para vincular ou registre na tela principal."}
              </p>

              <input
                type="text"
                placeholder="Seu nome (ex: Ricardo - Cliente)"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
              />
              <textarea
                rows={3}
                placeholder="Digite o feedback, ajuste de escopo ou dúvida levantada na reunião..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[12px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="w-full py-2 px-3 bg-[#16181D] hover:bg-[#2B2E36] text-[#FAF8F4] text-[12px] font-semibold rounded-[8px] transition-colors"
              >
                Registrar Comentário no Bloco
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-[13px] font-bold text-[#16181D]">
                Histórico de Revisão ({allComments.length})
              </h3>
              {allComments.length === 0 ? (
                <div className="p-4 bg-[#FAF8F4] border border-[#D8D3C8] rounded-[12px] text-center text-[12px] text-[#4A4D55]">
                  Nenhum comentário pendente neste fluxograma.
                </div>
              ) : (
                allComments.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-[10px] border space-y-1.5 ${
                      item.resolved
                        ? "bg-[#F6F3EC] border-[#D8D3C8] opacity-70"
                        : "bg-[#FAF8F4] border-[#16181D]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectNodeById(item.nodeId)}
                        className="font-mono text-[10px] font-semibold px-1.5 py-0.5 bg-[#1B4DFF] text-[#FAF8F4] rounded-[3px] truncate max-w-[200px]"
                      >
                        {item.nodeCode} · {item.nodeTitle}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleCommentResolved(item.nodeId, item.id)
                        }
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] border ${
                          item.resolved
                            ? "bg-[#E6F4F1] text-[#0F766E] border-[#A7DCD2]"
                            : "bg-[#FEF0EE] text-[#D9381E] border-[#F5B8B4]"
                        }`}
                      >
                        {item.resolved ? "✓ Resolvido" : "Marcar Resolvido"}
                      </button>
                    </div>
                    <p className="text-[12.5px] text-[#16181D] leading-relaxed">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#4A4D55]">
                      <span>{item.author}</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CLOUD SUPABASE & SHARE LINKS */}
        {activeTab === "cloud" && (
          <div className="space-y-4">
            {/* Share Links Card */}
            <div className="p-3.5 bg-[#FAF8F4] border border-[#16181D] rounded-[12px] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#16181D] flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-[#1B4DFF]" />
                  Link Compartilhável com o Cliente
                </h2>
              </div>

              <p className="text-[12px] text-[#4A4D55] leading-relaxed">
                Salve o projeto e envie o link abaixo para o cliente visualizar a jornada e comentar diretamente em cada tela sem risco de apagar blocos acidentalmente.
              </p>

              <button
                type="button"
                onClick={onSaveCloud}
                disabled={isSaving}
                className="w-full py-2 px-3 bg-[#0F766E] hover:bg-[#115E59] text-[#FAF8F4] text-[12.5px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSaving
                  ? "Sincronizando..."
                  : "Salvar Snapshot & Atualizar Link"}
              </button>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="block font-mono text-[10px] text-[#4A4D55] mb-1">
                    LINK MODO CLIENTE (LEITURA + COMENTÁRIOS)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareUrlClient}
                      className="flex-1 px-2 py-1.5 font-mono text-[11px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D]"
                    />
                    <button
                      type="button"
                      onClick={() => triggerCopy("clientLink", shareUrlClient)}
                      className="px-2.5 py-1.5 bg-[#16181D] text-[#FAF8F4] font-mono text-[11px] rounded-[6px]"
                    >
                      {copiedKey === "clientLink" ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-[#4A4D55] mb-1">
                    LINK EDIÇÃO COMPLETA (EQUIPE)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareUrlFull}
                      className="flex-1 px-2 py-1.5 font-mono text-[11px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px] text-[#16181D]"
                    />
                    <button
                      type="button"
                      onClick={() => triggerCopy("fullLink", shareUrlFull)}
                      className="px-2.5 py-1.5 bg-[#EFECE4] border border-[#16181D] text-[#16181D] font-mono text-[11px] rounded-[6px]"
                    >
                      {copiedKey === "fullLink" ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Supabase Project Connection Card */}
            <div className="p-3.5 bg-[#FAF8F4] border border-[#D8D3C8] rounded-[12px] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#16181D] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                  Supabase ({SUPABASE_PROJECT_REF})
                </h3>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[4px] border ${
                    syncStatus === "supabase"
                      ? "bg-[#E6F4F1] text-[#0F766E] border-[#A7DCD2]"
                      : "bg-[#EFECE4] text-[#4A4D55] border-[#D8D3C8]"
                  }`}
                >
                  {syncStatus === "supabase"
                    ? "NUVEM ATIVA"
                    : "STORE LOCAL + NUVEM"}
                </span>
              </div>

              <p className="text-[11.5px] text-[#4A4D55] leading-relaxed">
                Conectado ao projeto{" "}
                <code className="font-mono text-[#16181D]">
                  {SUPABASE_PROJECT_REF}.supabase.co
                </code>
                . Enquanto a chave Anon ou a tabela não estiverem preenchidas, seus quadros são salvos automaticamente no servidor local (`.data/boards.json`).
              </p>

              <div>
                <label className="block font-mono text-[10px] text-[#4A4D55] mb-1">
                  SUPABASE ANON PUBLIC KEY (OPCIONAL EM TELA OU .ENV.LOCAL)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono text-[11px] bg-[#F6F3EC] border border-[#D8D3C8] rounded-[6px]"
                />
              </div>

              {supabaseError && (
                <div className="p-2 bg-[#FEF0EE] border border-[#F5B8B4] rounded-[6px] text-[11px] text-[#B42318]">
                  Aviso Supabase: {supabaseError}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                <a
                  href={SUPABASE_API_SETTINGS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#F6F3EC] hover:bg-[#EFECE4] border border-[#D8D3C8] rounded-[6px] text-[11px] font-medium text-[#16181D]"
                >
                  Pegar Anon Key
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={SUPABASE_SQL_EDITOR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#F6F3EC] hover:bg-[#EFECE4] border border-[#D8D3C8] rounded-[6px] text-[11px] font-medium text-[#16181D]"
                >
                  Abrir SQL Editor
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => triggerCopy("sql", SUPABASE_MIGRATION_SQL)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#16181D] text-[#FAF8F4] rounded-[6px] text-[11px] font-medium"
                >
                  {copiedKey === "sql" ? "SQL Copiado!" : "Copiar SQL da Tabela"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
