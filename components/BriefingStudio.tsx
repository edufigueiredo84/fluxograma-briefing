"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import {
  Monitor,
  Zap,
  GitBranch,
  Webhook,
  Database,
  StickyNote,
  Square,
  Frame,
  Sparkles,
  Share2,
  FileText,
  Camera,
  Check,
  Eye,
  PenTool,
  FolderKanban,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
  Eraser,
  RotateCcw,
} from "lucide-react";
import { BRIEFING_NODE_TYPES } from "@/components/nodes/BriefingNodes";
import {
  RightDossierDrawer,
  type DrawerTab,
} from "@/components/RightDossierDrawer";
import { BOARD_TEMPLATES } from "@/lib/templates";
import type {
  BoardProject,
  BriefingEdge,
  BriefingNode,
  FlowNodeData,
  NodeCategory,
} from "@/lib/types";

const DEFAULT_EDGE_STYLE = {
  stroke: "#16181D",
  strokeWidth: 1.75,
};

function styleEdges(edges: BriefingEdge[]): BriefingEdge[] {
  return edges.map((e) => {
    const isYes =
      e.sourceHandle === "yes" ||
      String(e.label || "")
        .toUpperCase()
        .startsWith("SIM");
    const isNo =
      e.sourceHandle === "no" ||
      String(e.label || "")
        .toUpperCase()
        .startsWith("NÃO");

    const strokeColor = isYes ? "#0F766E" : isNo ? "#D9381E" : "#1B4DFF";

    return {
      ...e,
      type: "smoothstep",
      style: {
        stroke: strokeColor,
        strokeWidth: 2,
      },
      labelStyle: {
        fill: "#16181D",
        fontWeight: 600,
        fontSize: 11,
        fontFamily: "var(--font-mono), monospace",
      },
      labelBgStyle: {
        fill: "#FAF8F4",
        stroke: strokeColor,
        strokeWidth: 1,
      },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 16,
        height: 16,
      },
    };
  });
}

export function BriefingStudio() {
  const initialTemplate = BOARD_TEMPLATES["crm-funil"];
  const [boardMeta, setBoardMeta] = useState<
    Omit<BoardProject, "nodes" | "edges">
  >({
    id: initialTemplate.id,
    title: initialTemplate.title,
    clientName: initialTemplate.clientName,
    systemType: initialTemplate.systemType,
    version: initialTemplate.version,
    objective: initialTemplate.objective,
    updatedAt: initialTemplate.updatedAt,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<BriefingNode>(
    initialTemplate.nodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<BriefingEdge>(
    styleEdges(initialTemplate.edges)
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    "scr-kanban"
  );
  const [activeTab, setActiveTab] = useState<DrawerTab>("inspector");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isClientMode, setIsClientMode] = useState(false);
  const [quickChainInput, setQuickChainInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "local" | "supabase" | "saving" | "error"
  >("local");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [anonKey, setAnonKey] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<{
    nodes: BriefingNode[];
    edges: BriefingEdge[];
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  }, []);

  // Load saved anonKey and URL query parameters (?board=...&mode=client)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKey =
      window.localStorage.getItem("briefing_supabase_anon_key") || "";
    if (storedKey) setAnonKey(storedKey);

    const params = new URLSearchParams(window.location.search);
    const boardParam = params.get("board");
    const modeParam = params.get("mode");

    if (modeParam === "client") {
      setIsClientMode(true);
      setActiveTab("comments");
    }

    if (boardParam) {
      fetch(`/api/boards/${encodeURIComponent(boardParam)}`, {
        headers: storedKey ? { "x-supabase-key": storedKey } : {},
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => {
          if (res && res.board) {
            const b: BoardProject = res.board;
            setBoardMeta({
              id: b.id,
              title: b.title,
              clientName: b.clientName,
              systemType: b.systemType,
              version: b.version,
              objective: b.objective,
              updatedAt: b.updatedAt,
            });
            setNodes(b.nodes || []);
            setEdges(styleEdges(b.edges || []));
            if (res.source === "supabase") setSyncStatus("supabase");
          }
        })
        .catch(() => {
          // ignore fetch error
        });
    } else {
      const localDraft = window.localStorage.getItem("briefing_current_board");
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft) as BoardProject;
          if (parsed && parsed.nodes && parsed.nodes.length > 0) {
            setBoardMeta({
              id: parsed.id,
              title: parsed.title,
              clientName: parsed.clientName,
              systemType: parsed.systemType,
              version: parsed.version,
              objective: parsed.objective,
              updatedAt: parsed.updatedAt,
            });
            setNodes(parsed.nodes);
            setEdges(styleEdges(parsed.edges || []));
          }
        } catch {
          // ignore
        }
      }
    }
  }, [setNodes, setEdges]);

  // Save draft to localStorage automatically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fullBoard: BoardProject = {
      ...boardMeta,
      nodes,
      edges,
    };
    window.localStorage.setItem(
      "briefing_current_board",
      JSON.stringify(fullBoard)
    );
  }, [boardMeta, nodes, edges]);

  const handleSetAnonKey = (val: string) => {
    setAnonKey(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("briefing_supabase_anon_key", val);
    }
  };

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) || null;

  const onConnect = useCallback(
    (connection: Connection) => {
      if (isClientMode) return;
      const defaultLabel =
        connection.sourceHandle === "yes"
          ? "SIM"
          : connection.sourceHandle === "no"
          ? "NÃO"
          : "Segue";
      setEdges((eds) =>
        styleEdges(
          addEdge(
            {
              ...connection,
              id: `e-${Date.now()}`,
              label: defaultLabel,
              animated: connection.sourceHandle === "yes",
            },
            eds
          ) as BriefingEdge[]
        )
      );
    },
    [isClientMode, setEdges]
  );

  // Add a new block to the canvas and auto-connect if a non-section node is selected
  const handleAddBlock = useCallback(
    (category: NodeCategory) => {
      if (isClientMode) return;

      const countOfType =
        nodes.filter((n) => n.data.category === category).length + 1;
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
      const code = `${prefixMap[category]}-${String(countOfType).padStart(
        2,
        "0"
      )}`;

      const anchor =
        selectedNode && selectedNode.data.category !== "section"
          ? selectedNode
          : null;

      const posX = anchor
        ? anchor.position.x + 330
        : 180 + ((nodes.length * 45) % 450);
      const posY = anchor
        ? anchor.position.y + ((nodes.length % 3) - 1) * 40
        : 160 + ((nodes.length * 35) % 280);

      const defaultTitles: Record<NodeCategory, string> = {
        screen: "Nova Tela do Sistema",
        action: "Ação do Usuário",
        decision: "Condição / Regra?",
        integration: "Webhook / API Externa",
        database: "Tabela de Dados",
        sticky: "Nota Rápida da Reunião",
        shape: "Bloco Livre",
        section: `FASE 0${countOfType} · NOVA ETAPA DA JORNADA`,
        comment: "Comentário",
      };

      const newNodeId = `${category}-${Date.now()}`;

      const newNode: BriefingNode = {
        id: newNodeId,
        type: category === "comment" ? "sticky" : category,
        position: { x: posX, y: posY },
        zIndex: category === "section" ? -1 : 1,
        style:
          category === "section" ? { width: 580, height: 520 } : undefined,
        data: {
          code,
          category,
          title: defaultTitles[category],
          subtitle:
            category === "screen"
              ? "Descreva o objetivo desta tela na jornada"
              : category === "decision"
              ? "Defina o critério para SIM ou NÃO"
              : "Detalhe este passo no painel lateral",
          actor: category === "integration" ? "Sistema" : "Usuário",
          priority: "mvp",
          status: "rascunho",
          route:
            category === "screen" ? `/modulo/tela-${countOfType}` : undefined,
          method: category === "integration" ? "POST" : undefined,
          endpoint:
            category === "integration" ? "POST /api/v1/recurso" : undefined,
          tableName:
            category === "database" ? `public.tabela_${countOfType}` : undefined,
          stickyColor: category === "sticky" ? "amber" : undefined,
          stickyTag: category === "sticky" ? "Nota de Briefing" : undefined,
          sectionWidth: category === "section" ? 580 : undefined,
          sectionHeight: category === "section" ? 520 : undefined,
          fields:
            category === "screen"
              ? [
                  {
                    id: `f-${Date.now()}-1`,
                    label: "Campo Principal",
                    kind: "input",
                    required: true,
                  },
                  {
                    id: `f-${Date.now()}-2`,
                    label: "Confirmar / Avançar",
                    kind: "button",
                    required: true,
                  },
                ]
              : category === "database"
              ? [
                  {
                    id: `c-${Date.now()}-1`,
                    label: "id (uuid PK)",
                    kind: "input",
                    required: true,
                  },
                  {
                    id: `c-${Date.now()}-2`,
                    label: "status (text)",
                    kind: "select",
                    required: true,
                  },
                ]
              : undefined,
          businessRules:
            category === "decision"
              ? ["SIM: Segue fluxo principal", "NÃO: Notificar exceção"]
              : [],
        },
      };

      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        { ...newNode, selected: true },
      ]);
      setSelectedNodeId(newNodeId);
      setActiveTab("inspector");
      setDrawerOpen(true);

      if (anchor && category !== "section" && category !== "sticky") {
        const newEdge: BriefingEdge = {
          id: `e-${anchor.id}-${newNodeId}`,
          source: anchor.id,
          sourceHandle:
            anchor.data.category === "decision" ? "yes" : undefined,
          target: newNodeId,
          label: anchor.data.category === "decision" ? "SIM" : "Avança",
          animated: true,
        };
        setEdges((eds) => styleEdges([...eds, newEdge]));
      }
    },
    [isClientMode, nodes, selectedNode, setNodes, setEdges]
  );

  // Quick-Chain Text Generator: e.g. "Tela: Login -> Decisão: Tem Conta? -> Tela: Dashboard"
  const handleQuickChainGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickChainInput.trim() || isClientMode) return;

    const steps = quickChainInput
      .split(/->|➔|=>|>|;/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (steps.length === 0) return;

    const baseX = 140;
    const baseY =
      Math.max(...nodes.map((n) => n.position.y), 120) + 250;

    const createdNodes: BriefingNode[] = [];
    const createdEdges: BriefingEdge[] = [];

    steps.forEach((rawStep, idx) => {
      const lower = rawStep.toLowerCase();
      let category: NodeCategory = "screen";
      let cleanTitle = rawStep;

      if (
        lower.startsWith("decisão:") ||
        lower.startsWith("decisao:") ||
        lower.startsWith("se:") ||
        rawStep.endsWith("?")
      ) {
        category = "decision";
        cleanTitle = rawStep.replace(/^(decis[aã]o|se):\s*/i, "");
      } else if (
        lower.startsWith("api:") ||
        lower.startsWith("webhook:") ||
        lower.startsWith("integração:")
      ) {
        category = "integration";
        cleanTitle = rawStep.replace(/^(api|webhook|integra[cç][aã]o):\s*/i, "");
      } else if (
        lower.startsWith("banco:") ||
        lower.startsWith("db:") ||
        lower.startsWith("tabela:")
      ) {
        category = "database";
        cleanTitle = rawStep.replace(/^(banco|db|tabela):\s*/i, "");
      } else if (
        lower.startsWith("ação:") ||
        lower.startsWith("acao:")
      ) {
        category = "action";
        cleanTitle = rawStep.replace(/^a[cç][aã]o:\s*/i, "");
      } else if (lower.startsWith("nota:") || lower.startsWith("postit:")) {
        category = "sticky";
        cleanTitle = rawStep.replace(/^(nota|postit):\s*/i, "");
      } else {
        cleanTitle = rawStep.replace(/^tela:\s*/i, "");
      }

      const id = `chain-${Date.now()}-${idx}`;
      const prefix =
        category === "screen"
          ? "SCR"
          : category === "decision"
          ? "DEC"
          : category === "integration"
          ? "API"
          : category === "database"
          ? "DB"
          : "ACT";

      createdNodes.push({
        id,
        type: category,
        position: { x: baseX + idx * 320, y: baseY },
        data: {
          code: `${prefix}-${nodes.length + idx + 1}`,
          category,
          title: cleanTitle,
          subtitle: "Gerado na captura rápida da reunião",
          actor: "Usuário",
          priority: "mvp",
          status: "rascunho",
          route:
            category === "screen"
              ? `/${cleanTitle
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`
              : undefined,
          fields:
            category === "screen"
              ? [
                  {
                    id: `cf-${idx}-1`,
                    label: "Dados da Etapa",
                    kind: "input",
                    required: true,
                  },
                  {
                    id: `cf-${idx}-2`,
                    label: "Continuar",
                    kind: "button",
                    required: true,
                  },
                ]
              : undefined,
        },
      });

      if (idx > 0) {
        const prev = createdNodes[idx - 1];
        createdEdges.push({
          id: `ce-${Date.now()}-${idx}`,
          source: prev.id,
          sourceHandle:
            prev.data.category === "decision" ? "yes" : undefined,
          target: id,
          label: prev.data.category === "decision" ? "SIM" : "Avança",
          animated: true,
        });
      }
    });

    setNodes((nds) => [...nds, ...createdNodes]);
    setEdges((eds) => styleEdges([...eds, ...createdEdges]));
    setQuickChainInput("");
    showToast(`${createdNodes.length} blocos encadeados adicionados ao fluxo!`);
  };

  const handleUpdateNodeData = useCallback(
    (nodeId: string, patch: Partial<FlowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const nextData = { ...n.data, ...patch };
          const nextStyle =
            n.data.category === "section" &&
            (patch.sectionWidth || patch.sectionHeight)
              ? {
                  ...n.style,
                  width: nextData.sectionWidth || 580,
                  height: nextData.sectionHeight || 520,
                }
              : n.style;
          return {
            ...n,
            style: nextStyle,
            data: nextData,
          };
        })
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [selectedNodeId, setNodes, setEdges]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const target = nodes.find((n) => n.id === nodeId);
      if (!target) return;
      const copyId = `${target.type}-${Date.now()}`;
      const copyNode: BriefingNode = {
        ...target,
        id: copyId,
        selected: true,
        position: {
          x: target.position.x + 40,
          y: target.position.y + 40,
        },
        data: {
          ...target.data,
          code: `${target.data.code}-B`,
          title: `${target.data.title} (Cópia)`,
        },
      };
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        copyNode,
      ]);
      setSelectedNodeId(copyId);
    },
    [nodes, setNodes]
  );

  const handleSelectTemplate = (templateKey: string) => {
    const tpl = BOARD_TEMPLATES[templateKey];
    if (!tpl) return;
    if (nodes.length > 0) {
      setUndoSnapshot({ nodes, edges });
    }
    setBoardMeta({
      id: tpl.id,
      title: tpl.title,
      clientName: tpl.clientName,
      systemType: tpl.systemType,
      version: tpl.version,
      objective: tpl.objective,
      updatedAt: new Date().toISOString(),
    });
    setNodes(tpl.nodes);
    setEdges(styleEdges(tpl.edges));
    setSelectedNodeId(tpl.nodes.find((n) => n.type === "screen")?.id || null);
    showToast(`Template "${tpl.title}" carregado!`);
  };

  const handleClearCanvas = useCallback(() => {
    if (isClientMode || nodes.length === 0) return;
    setUndoSnapshot({ nodes, edges });
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    showToast("Tela limpa! Pronta para iniciar um novo fluxo do zero.");
  }, [isClientMode, nodes, edges, setNodes, setEdges, showToast]);

  const handleUndoClear = useCallback(() => {
    if (!undoSnapshot) return;
    setNodes(undoSnapshot.nodes);
    setEdges(styleEdges(undoSnapshot.edges));
    setSelectedNodeId(undoSnapshot.nodes[0]?.id || null);
    setUndoSnapshot(null);
    showToast("Fluxo anterior restaurado!");
  }, [undoSnapshot, setNodes, setEdges, showToast]);

  const handleSaveCloud = async () => {
    setIsSaving(true);
    setSyncStatus("saving");
    setSupabaseError(null);
    try {
      const fullBoard: BoardProject = {
        ...boardMeta,
        updatedAt: new Date().toISOString(),
        nodes,
        edges,
      };
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board: fullBoard,
          supabaseAnonKey: anonKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.syncedToSupabase) {
        setSyncStatus("supabase");
        showToast("Salvo no Supabase (sovsuyjpazocwtsqtmkg) e localmente!");
      } else {
        setSyncStatus("local");
        if (data.supabaseError) setSupabaseError(data.supabaseError);
        showToast("Salvo! Link compartilhável pronto para envio.");
      }
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("board", fullBoard.id);
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      setSyncStatus("error");
      showToast("Salvo no cache local do navegador.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPng = async () => {
    const viewportEl = canvasRef.current?.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;
    if (!viewportEl) return;
    try {
      const dataUrl = await toPng(viewportEl, {
        backgroundColor: "#F6F3EC",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${boardMeta.id}-planta-jornada.png`;
      a.click();
      showToast("Imagem PNG de alta resolução exportada!");
    } catch {
      showToast("Não foi possível exportar PNG neste navegador.");
    }
  };

  const currentBoard: BoardProject = {
    ...boardMeta,
    nodes,
    edges,
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F6F3EC] text-[#16181D]">
      {/* TOP ARCHITECTURAL TITLE BLOCK HEADER */}
      <header className="h-[58px] shrink-0 bg-[#EFECE4] border-b border-[#16181D] px-3 sm:px-4 flex items-center justify-between gap-2 z-20">
        {/* Left: Brand + Project Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#16181D] text-[#FAF8F4] rounded-[6px] shrink-0">
            <PenTool className="w-3.5 h-3.5 text-[#F5C542]" />
            <span className="font-mono text-[11px] font-bold tracking-tight">
              PLANTA · BRIEFING
            </span>
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <input
              type="text"
              disabled={isClientMode}
              aria-label="Título do projeto"
              value={boardMeta.title}
              onChange={(e) =>
                setBoardMeta((prev) => ({ ...prev, title: e.target.value }))
              }
              className="font-bold text-[14px] text-[#16181D] bg-transparent border border-transparent hover:border-[#D8D3C8] focus:border-[#1B4DFF] focus:bg-[#FAF8F4] px-2 py-0.5 rounded-[5px] truncate max-w-[220px] sm:max-w-[300px] focus:outline-none"
            />
            <span className="hidden md:inline-flex items-center font-mono text-[11px] px-2 py-0.5 bg-[#FAF8F4] border border-[#D8D3C8] rounded-[4px] text-[#4A4D55] shrink-0">
              Cliente: {boardMeta.clientName}
            </span>
          </div>

          {/* Template Selector */}
          {!isClientMode && (
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[#D8D3C8]">
              <FolderKanban className="w-3.5 h-3.5 text-[#4A4D55]" />
              <select
                aria-label="Selecionar template de jornada"
                onChange={(e) => handleSelectTemplate(e.target.value)}
                defaultValue="crm-funil"
                className="font-mono text-[11px] bg-[#FAF8F4] border border-[#D8D3C8] rounded-[6px] px-2 py-1 text-[#16181D] focus:outline-none focus:border-[#1B4DFF]"
              >
                <option value="crm-funil">
                  Template: Funil CRM & Vendas B2B
                </option>
                <option value="saas-onboarding">
                  Template: SaaS Login, Setup & Trial
                </option>
                <option value="dashboard-aprovacao">
                  Template: Alçada de Compras & ERP
                </option>
                <option value="canvas-limpo">
                  + Iniciar Canvas em Branco (Do Zero)
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Center: Live Meeting Quick-Chain Composer */}
        {!isClientMode && (
          <form
            onSubmit={handleQuickChainGenerate}
            className="hidden xl:flex items-center flex-1 max-w-[460px] mx-2"
          >
            <div className="flex items-center w-full bg-[#FAF8F4] border border-[#16181D] rounded-[8px] overflow-hidden focus-within:ring-2 focus-within:ring-[#1B4DFF]/25">
              <span className="pl-2.5 pr-1.5 text-[#1B4DFF] shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={quickChainInput}
                onChange={(e) => setQuickChainInput(e.target.value)}
                placeholder="Captura rápida: Tela: Login -> Decisão: Aprovado? -> API: Asaas"
                className="w-full py-1.5 px-1 text-[12px] bg-transparent text-[#16181D] placeholder:text-[#4A4D55] focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-[#16181D] hover:bg-[#1B4DFF] text-[#FAF8F4] font-mono text-[10.5px] font-semibold shrink-0 flex items-center gap-1 transition-colors"
              >
                <span>Gerar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        )}

        {/* Right: Clear CTA + Mode Toggle + Export PRD + Share */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isClientMode && (
            <>
              {nodes.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  title="Limpar todos os blocos da tela para começar do zero"
                  className="px-2.5 py-1.5 rounded-[7px] font-mono text-[11px] font-semibold bg-[#FEF0EE] hover:bg-[#D9381E] text-[#D9381E] hover:text-[#FAF8F4] border border-[#D9381E] flex items-center gap-1.5 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Limpar Tela</span>
                </button>
              ) : (
                undoSnapshot && (
                  <button
                    type="button"
                    onClick={handleUndoClear}
                    title="Restaurar o fluxo anterior"
                    className="px-2.5 py-1.5 rounded-[7px] font-mono text-[11px] font-semibold bg-[#FAF8F4] hover:bg-[#E5E0D5] text-[#16181D] border border-[#16181D] flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#1B4DFF]" />
                    <span>Desfazer Limpeza</span>
                  </button>
                )
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setIsClientMode((v) => !v)}
            className={`px-2.5 py-1.5 rounded-[7px] font-mono text-[11px] font-medium border flex items-center gap-1.5 transition-colors ${
              isClientMode
                ? "bg-[#FEF0EE] text-[#D9381E] border-[#D9381E]"
                : "bg-[#FAF8F4] text-[#16181D] border-[#D8D3C8] hover:bg-[#E5E0D5]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isClientMode ? "Visão Cliente" : "Modo Consultor"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            title="Exportar imagem PNG da planta"
            className="p-1.5 bg-[#FAF8F4] hover:bg-[#E5E0D5] text-[#16181D] border border-[#D8D3C8] rounded-[7px]"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setDrawerOpen(true);
              setActiveTab("cloud");
              handleSaveCloud();
            }}
            className="px-2.5 py-1.5 bg-[#FAF8F4] hover:bg-[#E5E0D5] text-[#16181D] border border-[#16181D] rounded-[7px] text-[12px] font-semibold flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0F766E]" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDrawerOpen(true);
              setActiveTab("prd");
            }}
            className="px-3 py-1.5 bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] rounded-[7px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Compilar PRD</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            title={drawerOpen ? "Recolher painel lateral" : "Abrir painel lateral"}
            className="p-1.5 bg-[#FAF8F4] hover:bg-[#E5E0D5] text-[#16181D] border border-[#D8D3C8] rounded-[7px]"
          >
            {drawerOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* WORKSPACE BODY: INFINITE CANVAS + RIGHT DOSSIER DRAWER */}
      <div className="flex-1 flex min-h-0 relative">
        {/* React Flow Canvas Container */}
        <div ref={canvasRef} className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isClientMode ? undefined : onNodesChange}
            onEdgesChange={isClientMode ? undefined : onEdgesChange}
            onConnect={onConnect}
            nodeTypes={BRIEFING_NODE_TYPES}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setDrawerOpen(true);
            }}
            onPaneClick={() => setSelectedNodeId(null)}
            defaultEdgeOptions={{ style: DEFAULT_EDGE_STYLE }}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            minZoom={0.25}
            maxZoom={1.75}
            snapToGrid
            snapGrid={[16, 16]}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.35}
              color="#B8B1A2"
            />

            <Controls
              position="bottom-left"
              showInteractive={false}
              className="!bg-[#FAF8F4] !border !border-[#16181D] !rounded-[8px] !shadow-none overflow-hidden"
            />

            <MiniMap
              position="top-left"
              pannable
              zoomable
              className="!bg-[#EFECE4] !border !border-[#16181D] !rounded-[10px] !shadow-none"
              nodeColor={(n) => {
                switch (n.data?.category) {
                  case "screen":
                    return "#1B4DFF";
                  case "decision":
                    return "#D9381E";
                  case "action":
                    return "#B45309";
                  case "integration":
                    return "#6D28D9";
                  case "database":
                    return "#0F766E";
                  case "sticky":
                    return "#F5C542";
                  case "section":
                    return "#D8D3C8";
                  default:
                    return "#16181D";
                }
              }}
            />

            {/* Top-Right Telemetry & Legend Stamp on Canvas */}
            <Panel position="top-right" className="!m-3 hidden md:block">
              <div className="px-3 py-2 bg-[#FAF8F4]/95 border border-[#16181D] rounded-[10px] flex items-center gap-3 font-mono text-[11px]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1B4DFF]" />
                  Telas:{" "}
                  <strong className="tabular-nums">
                    {nodes.filter((n) => n.data.category === "screen").length}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#D9381E]" />
                  Decisões:{" "}
                  <strong className="tabular-nums">
                    {nodes.filter((n) => n.data.category === "decision").length}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#6D28D9]" />
                  APIs:{" "}
                  <strong className="tabular-nums">
                    {
                      nodes.filter((n) => n.data.category === "integration")
                        .length
                    }
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F5C542] border border-black/30" />
                  Notas:{" "}
                  <strong className="tabular-nums">
                    {nodes.filter((n) => n.data.category === "sticky").length}
                  </strong>
                </span>
              </div>
            </Panel>

            {/* Bottom Floating FigJam + Product Architecture Dock */}
            {!isClientMode && (
              <Panel position="bottom-center" className="!mb-4">
                <div className="px-2.5 py-2 bg-[#FAF8F4] border border-[#16181D] rounded-[14px] flex items-center gap-1.5 flex-wrap justify-center">
                  {/* Product Semantics Group */}
                  <button
                    type="button"
                    onClick={() => handleAddBlock("screen")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>+ Tela</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("action")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#D8D3C8] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>+ Ação</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("decision")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#D8D3C8] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-[#D9381E]" />
                    <span>+ Decisão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("integration")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#D8D3C8] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Webhook className="w-3.5 h-3.5 text-[#6D28D9]" />
                    <span>+ API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("database")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#D8D3C8] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>+ Tabela DB</span>
                  </button>

                  <span className="h-5 w-[1px] bg-[#D8D3C8] mx-0.5 hidden sm:inline-block" />

                  {/* FigJam Freeform Layer */}
                  <button
                    type="button"
                    onClick={() => handleAddBlock("sticky")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#FFF3C4] hover:bg-[#F5C542] text-[#1F1A0C] border border-[#B8860B] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>+ Post-it</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("shape")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#D8D3C8] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>+ Forma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock("section")}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#D8D3C8] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Frame className="w-3.5 h-3.5" />
                    <span>+ Fase</span>
                  </button>

                  {nodes.length > 0 && (
                    <>
                      <span className="h-5 w-[1px] bg-[#D8D3C8] mx-0.5 hidden sm:inline-block" />
                      <button
                        type="button"
                        onClick={handleClearCanvas}
                        title="Limpar toda a tela"
                        className="px-2.5 py-1.5 rounded-[8px] bg-[#FEF0EE] hover:bg-[#D9381E] text-[#D9381E] hover:text-[#FAF8F4] border border-[#D9381E] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Limpar</span>
                      </button>
                    </>
                  )}
                </div>
              </Panel>
            )}

            {/* Empty State Card when canvas is cleared */}
            {nodes.length === 0 && !isClientMode && (
              <Panel position="top-center" className="!mt-24">
                <div className="p-5 bg-[#FAF8F4] border border-[#16181D] rounded-[14px] max-w-[420px] text-center space-y-3">
                  <p className="text-[14px] font-bold text-[#16181D]">
                    Canvas Limpo · Pronto para o Briefing
                  </p>
                  <p className="text-[12.5px] text-[#4A4D55] leading-relaxed">
                    Comece adicionando a primeira tela da jornada do cliente ou digite o fluxo completo na barra de captura rápida no topo.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleAddBlock("screen")}
                      className="px-3.5 py-2 rounded-[8px] bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>+ Criar 1ª Tela</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock("sticky")}
                      className="px-3.5 py-2 rounded-[8px] bg-[#FFF3C4] hover:bg-[#F5C542] text-[#1F1A0C] border border-[#B8860B] text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>+ Adicionar Post-it</span>
                    </button>
                    {undoSnapshot && (
                      <button
                        type="button"
                        onClick={handleUndoClear}
                        className="px-3 py-2 rounded-[8px] bg-[#EFECE4] hover:bg-[#E2DDD2] text-[#16181D] border border-[#16181D] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Desfazer</span>
                      </button>
                    )}
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>

          {/* Toast Feedback Banner */}
          {toastMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#16181D] text-[#FAF8F4] rounded-[8px] border border-[#1B4DFF] font-mono text-[12px] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4ADE80]" />
              <span>{toastMsg}</span>
            </div>
          )}
        </div>

        {/* RIGHT DOSSIER & INSPECTOR DRAWER */}
        {drawerOpen && (
          <RightDossierDrawer
            board={currentBoard}
            selectedNode={selectedNode}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onUpdateNodeData={handleUpdateNodeData}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onUpdateBoardMeta={(patch) =>
              setBoardMeta((prev) => ({ ...prev, ...patch }))
            }
            onSelectNodeById={(id) => {
              setSelectedNodeId(id);
              setNodes((nds) =>
                nds.map((n) => ({ ...n, selected: n.id === id }))
              );
            }}
            onSaveCloud={handleSaveCloud}
            isSaving={isSaving}
            syncStatus={syncStatus}
            supabaseError={supabaseError}
            anonKey={anonKey}
            setAnonKey={handleSetAnonKey}
            isClientMode={isClientMode}
          />
        )}
      </div>
    </div>
  );
}
