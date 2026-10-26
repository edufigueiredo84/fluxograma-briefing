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
  PenTool,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
  Eraser,
  RotateCcw,
  AlertTriangle,
  X,
  Sun,
  Moon,
  Search,
  Wand2,
  LayoutGrid,
} from "lucide-react";
import { BRIEFING_NODE_TYPES } from "@/components/nodes/BriefingNodes";
import {
  RightDossierDrawer,
  type DrawerTab,
} from "@/components/RightDossierDrawer";
import { BOARD_TEMPLATES } from "@/lib/templates";
import {
  compilePhaseToMarkdown,
  getNodesInSection,
  parseTranscriptToFlowNodes,
} from "@/lib/prd-compiler";
import type {
  BoardProject,
  BriefingEdge,
  BriefingNode,
  FlowNodeData,
  NodeCategory,
} from "@/lib/types";

const DEFAULT_EDGE_STYLE = {
  stroke: "#1B4DFF",
  strokeWidth: 1.75,
};

function styleEdges(
  edges: BriefingEdge[],
  isDark = true
): BriefingEdge[] {
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

    const strokeColor = isYes
      ? isDark
        ? "#2DD4BF"
        : "#0F766E"
      : isNo
      ? isDark
        ? "#F87171"
        : "#D9381E"
      : isDark
      ? "#4D7CFE"
      : "#1B4DFF";

    return {
      ...e,
      type: "smoothstep",
      style: {
        stroke: strokeColor,
        strokeWidth: 2,
      },
      labelStyle: {
        fill: isDark ? "#F3F1EA" : "#16181D",
        fontWeight: 600,
        fontSize: 11,
        fontFamily: "var(--font-mono), monospace",
      },
      labelBgStyle: {
        fill: isDark ? "#1E222B" : "#FAF8F4",
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

const LEGACY_TEMPLATE_IDS = new Set([
  "crm-funil-b2b",
  "crm-b2b-v1",
  "saas-onboarding-v1",
  "aprovacao-financeira-v1",
  "canvas-limpo-v1",
  "novo-briefing",
]);

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
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("all");
  const [savedBoards, setSavedBoards] = useState<BoardProject[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandMode, setCommandMode] = useState<"search" | "transcript">(
    "search"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "duvida" | "mvp" | "validado"
  >("all");
  const [transcriptText, setTranscriptText] = useState("");

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const sectionDragRef = useRef<{
    sectionId: string;
    lastX: number;
    lastY: number;
    childIds: Set<string>;
  } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const refreshSavedBoards = useCallback(async (customKey?: string) => {
    try {
      const res = await fetch("/api/boards", {
        headers: customKey ? { "x-supabase-key": customKey } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.boards) && data.boards.length > 0) {
          setSavedBoards(data.boards);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Re-style edge labels whenever theme toggles
  useEffect(() => {
    setEdges((eds) => styleEdges(eds, theme === "dark"));
  }, [theme, setEdges]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("briefing_theme", next);
      }
      return next;
    });
  }, []);

  // Load saved anonKey and URL query parameters (?board=...&mode=client)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = window.localStorage.getItem("briefing_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    const storedKey =
      window.localStorage.getItem("briefing_supabase_anon_key") || "";
    if (storedKey) setAnonKey(storedKey);
    refreshSavedBoards(storedKey);

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
          if (parsed && LEGACY_TEMPLATE_IDS.has(parsed.id)) {
            window.localStorage.removeItem("briefing_current_board");
          } else if (parsed && parsed.nodes && parsed.nodes.length > 0) {
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

  const handleClearCanvas = useCallback(() => {
    if (isClientMode || nodes.length === 0) return;
    setConfirmClearOpen(true);
  }, [isClientMode, nodes.length]);

  // Auto-organize all blocks cleanly inside their respective Phases (Sections)
  const handleAutoOrganizeByPhase = useCallback(() => {
    if (isClientMode || nodes.length === 0) return;

    setNodes((currentNodes) => {
      const sections = currentNodes
        .filter((n) => n.data.category === "section")
        .sort((a, b) => a.position.x - b.position.x);
      const nonSections = currentNodes.filter(
        (n) => n.data.category !== "section"
      );

      if (sections.length === 0) {
        return nonSections.map((n, idx) => ({
          ...n,
          position: {
            x: 80 + (idx % 3) * 380,
            y: 100 + Math.floor(idx / 3) * 390,
          },
        }));
      }

      // Assign each non-section node to its containing section or nearest section horizontally
      const bucketMap = new Map<string, BriefingNode[]>();
      sections.forEach((s) => bucketMap.set(s.id, []));

      for (const item of nonSections) {
        const directSec = sections.find((sec) =>
          getNodesInSection(currentNodes, sec).some((c) => c.id === item.id)
        );
        if (directSec) {
          bucketMap.get(directSec.id)?.push(item);
        } else {
          // Nearest section by X center
          let nearest = sections[0];
          let bestDist = Infinity;
          for (const sec of sections) {
            const secCenter =
              sec.position.x + (sec.data.sectionWidth || 720) / 2;
            const d = Math.abs(item.position.x - secCenter);
            if (d < bestDist) {
              bestDist = d;
              nearest = sec;
            }
          }
          bucketMap.get(nearest.id)?.push(item);
        }
      }

      const updatedNodes: BriefingNode[] = [];
      let cursorX = 40;
      const baseY = 40;

      for (const sec of sections) {
        const children = (bucketMap.get(sec.id) || []).sort((a, b) =>
          Math.abs(a.position.x - b.position.x) > 80
            ? a.position.x - b.position.x
            : a.position.y - b.position.y
        );

        const cols = children.length <= 1 ? 1 : 2;
        const rows = Math.max(1, Math.ceil(children.length / cols));
        const colStride = 420;
        const rowStride = 395;
        const padX = 48;
        const padTop = 104;
        const padBottom = 56;

        const secWidth = Math.max(
          740,
          padX * 2 + (cols - 1) * colStride + 296
        );
        const secHeight = Math.max(
          740,
          padTop + (rows - 1) * rowStride + 350 + padBottom
        );

        updatedNodes.push({
          ...sec,
          position: { x: cursorX, y: baseY },
          style: { ...sec.style, width: secWidth, height: secHeight },
          data: {
            ...sec.data,
            sectionWidth: secWidth,
            sectionHeight: secHeight,
          },
        });

        children.forEach((child, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          updatedNodes.push({
            ...child,
            position: {
              x: cursorX + padX + col * colStride,
              y: baseY + padTop + row * rowStride,
            },
          });
        });

        cursorX += secWidth + 100;
      }

      return updatedNodes;
    });

    showToast("Fluxo organizado e espaçado dentro de cada Fase!");
  }, [isClientMode, nodes.length, setNodes, showToast]);

  const executeClearCanvas = useCallback(
    async (saveBeforeClear: boolean) => {
      if (saveBeforeClear) {
        try {
          const snapshotToSave: BoardProject = {
            ...boardMeta,
            updatedAt: new Date().toISOString(),
            nodes,
            edges,
          };
          await fetch("/api/boards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              board: snapshotToSave,
              supabaseAnonKey: anonKey || undefined,
            }),
          });
          await refreshSavedBoards(anonKey);
        } catch {
          // ignore
        }
      }

      setUndoSnapshot({ nodes, edges });
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setConfirmClearOpen(false);
      showToast(
        saveBeforeClear
          ? "Projeto salvo na galeria e tela limpa para novo briefing!"
          : "Tela limpa! Você pode desfazer no topo se precisar."
      );
    },
    [
      anonKey,
      boardMeta,
      edges,
      nodes,
      refreshSavedBoards,
      setEdges,
      setNodes,
      showToast,
    ]
  );

  const handleUndoClear = useCallback(() => {
    if (!undoSnapshot) return;
    setNodes(undoSnapshot.nodes);
    setEdges(styleEdges(undoSnapshot.edges));
    setSelectedNodeId(undoSnapshot.nodes[0]?.id || null);
    setUndoSnapshot(null);
    showToast("Fluxo anterior restaurado!");
  }, [undoSnapshot, setNodes, setEdges, showToast]);

  const handleSaveAsNewProject = async () => {
    const newId = `briefing-${Date.now().toString().slice(-6)}`;
    const newBoard: BoardProject = {
      ...boardMeta,
      id: newId,
      title: `${boardMeta.title} (Cópia)`,
      updatedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    setBoardMeta({
      id: newBoard.id,
      title: newBoard.title,
      clientName: newBoard.clientName,
      systemType: newBoard.systemType,
      version: newBoard.version,
      objective: newBoard.objective,
      updatedAt: newBoard.updatedAt,
    });
    await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        board: newBoard,
        supabaseAnonKey: anonKey || undefined,
      }),
    });
    await refreshSavedBoards(anonKey);
    showToast(`Salvo como novo projeto (${newId}) na Galeria!`);
  };

  const handleLoadProject = useCallback(
    (proj: BoardProject) => {
      setBoardMeta({
        id: proj.id,
        title: proj.title,
        clientName: proj.clientName,
        systemType: proj.systemType,
        version: proj.version,
        objective: proj.objective,
        updatedAt: proj.updatedAt,
      });
      setNodes(proj.nodes || []);
      setEdges(styleEdges(proj.edges || []));
      setSelectedNodeId(proj.nodes?.[0]?.id || null);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("board", proj.id);
        window.history.replaceState({}, "", url.toString());
      }
      showToast(`Projeto "${proj.title}" aberto!`);
    },
    [setNodes, setEdges, showToast]
  );

  // Listen to Phase Export & Approval buttons clicked directly on Section headers on the canvas
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{
        sectionId: string;
        action: "download" | "copy-ai" | "approve-phase";
      }>;
      if (!custom.detail?.sectionId) return;
      const { sectionId, action } = custom.detail;
      const secNode = nodes.find((n) => n.id === sectionId);

      if (action === "approve-phase" && secNode) {
        const children = getNodesInSection(nodes, secNode);
        const childIds = new Set(children.map((c) => c.id));
        setNodes((nds) =>
          nds.map((n) =>
            childIds.has(n.id)
              ? { ...n, data: { ...n.data, status: "validado" } }
              : n
          )
        );
        showToast(
          `Escopo da ${secNode.data.code} aprovado! (${children.length} bloco(s) validados)`
        );
        return;
      }

      const fullBoard: BoardProject = {
        ...boardMeta,
        nodes,
        edges,
      };
      const md = compilePhaseToMarkdown(fullBoard, sectionId);
      const phaseCode = (secNode?.data.code || "fase").toLowerCase();

      setSelectedPhaseId(sectionId);
      setActiveTab("prd");
      setDrawerOpen(true);

      if (action === "copy-ai") {
        navigator.clipboard.writeText(md);
        showToast(
          `Prompt de IA da ${secNode?.data.code || "Fase"} copiado para a área de transferência!`
        );
      } else {
        const blob = new Blob([md], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${boardMeta.id}-${phaseCode}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Arquivo .MD da ${secNode?.data.code || "Fase"} baixado!`);
      }
    };

    window.addEventListener("briefing-phase-export", handler);
    return () => window.removeEventListener("briefing-phase-export", handler);
  }, [boardMeta, nodes, edges, setNodes, showToast]);

  // Listen to Screen Prototype Preview button clicked on ScreenNode
  useEffect(() => {
    const onScreenPreview = (event: Event) => {
      const custom = event as CustomEvent<{ code?: string }>;
      const target = nodes.find((n) => n.data.code === custom.detail?.code);
      if (target) {
        setSelectedNodeId(target.id);
      }
      setActiveTab("inspector");
      setDrawerOpen(true);
    };
    window.addEventListener("briefing-screen-preview", onScreenPreview);
    return () =>
      window.removeEventListener("briefing-screen-preview", onScreenPreview);
  }, [nodes]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K for Command & Transcript Palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleGenerateFromTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptText.trim() || isClientMode) return;
    const { nodes: genNodes, edges: genEdges } = parseTranscriptToFlowNodes(
      transcriptText,
      nodes
    );
    if (genNodes.length === 0) return;
    setNodes((nds) => [...nds, ...genNodes]);
    setEdges((eds) =>
      styleEdges([...eds, ...genEdges], theme === "dark")
    );
    const firstScreen = genNodes.find((n) => n.data.category === "screen");
    if (firstScreen) setSelectedNodeId(firstScreen.id);
    setTranscriptText("");
    setCommandOpen(false);
    showToast(
      `Transcrição convertida em ${genNodes.length} blocos conectados no canvas!`
    );
  };

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
        showToast("Salvo na Galeria de Projetos! Link pronto para uso.");
      }
      await refreshSavedBoards(anonKey);
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
        backgroundColor: theme === "dark" ? "#111318" : "#F6F3EC",
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
    <div
      data-theme={theme}
      className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--bg-vellum)] text-[var(--ink-primary)] transition-colors duration-200"
    >
      {/* TOP ARCHITECTURAL TITLE BLOCK HEADER (DECLUTTERED & ICON-DRIVEN) */}
      <header className="h-[54px] shrink-0 bg-[var(--bg-panel)] border-b border-[var(--rule-strong)] px-3 sm:px-4 flex items-center justify-between gap-3 z-20">
        {/* Left: Compact Brand Stamp + Project & Client Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#16181D] text-[#FAF8F4] border border-[var(--rule-hairline)] rounded-[6px] shrink-0">
            <PenTool className="w-3.5 h-3.5 text-[#F5C542]" />
            <span className="font-mono text-[11px] font-bold tracking-tight">
              PLANTA
            </span>
          </div>

          <div className="min-w-0 flex items-center gap-1.5">
            <input
              type="text"
              disabled={isClientMode}
              aria-label="Título do projeto"
              value={boardMeta.title}
              onChange={(e) =>
                setBoardMeta((prev) => ({ ...prev, title: e.target.value }))
              }
              className="font-bold text-[13.5px] text-[var(--ink-primary)] bg-transparent border border-transparent hover:border-[var(--rule-hairline)] focus:border-[#1B4DFF] focus:bg-[var(--bg-card)] px-2 py-0.5 rounded-[5px] truncate max-w-[180px] sm:max-w-[260px] focus:outline-none"
            />
            <span className="hidden lg:inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--rule-hairline)] rounded-[4px] text-[var(--ink-secondary)] shrink-0">
              <span>{boardMeta.clientName}</span>
              <span className="opacity-40">·</span>
              <span className="text-[var(--ink-primary)] font-semibold">
                {boardMeta.version}
              </span>
            </span>
          </div>
        </div>

        {/* Center: Unified Quick-Chain Composer + Ctrl+K Trigger */}
        {!isClientMode && (
          <form
            onSubmit={handleQuickChainGenerate}
            className="hidden md:flex items-center flex-1 max-w-[480px] mx-2"
          >
            <div className="flex items-center w-full h-[34px] bg-[var(--bg-card)] border border-[var(--rule-hairline)] hover:border-[var(--rule-strong)] rounded-[8px] overflow-hidden focus-within:border-[#1B4DFF] transition-colors">
              <span className="pl-2.5 pr-1.5 text-[#3B66FF] shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={quickChainInput}
                onChange={(e) => setQuickChainInput(e.target.value)}
                placeholder="Fluxo rápido: Tela: Login -> Decisão: Aprovado? -> API: Asaas"
                className="w-full h-full px-1 text-[12px] bg-transparent text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none"
              />
              {quickChainInput.trim() ? (
                <button
                  type="submit"
                  title="Gerar blocos encadeados no canvas (Enter)"
                  aria-label="Gerar blocos encadeados no canvas"
                  className="h-full px-2.5 bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] font-mono text-[10px] font-semibold shrink-0 flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCommandMode("search");
                    setCommandOpen(true);
                  }}
                  title="Abrir Paleta de Comandos, Templates e Busca (Ctrl+K)"
                  className="mr-1.5 px-1.5 py-0.5 bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[var(--ink-secondary)] border border-[var(--rule-hairline)] rounded-[4px] font-mono text-[10px] shrink-0 transition-colors"
                >
                  Ctrl+K
                </button>
              )}
            </div>
          </form>
        )}

        {/* Right: Grouped Icon Toolbar + Single Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Precision Icon Utility Dock */}
          <div className="flex items-center bg-[var(--bg-card)] border border-[var(--rule-hairline)] rounded-[8px] p-0.5 gap-0.5">
            {/* 1. Search / Command Palette (Ctrl+K) */}
            <button
              type="button"
              onClick={() => {
                setCommandMode("search");
                setCommandOpen(true);
              }}
              title="Buscar blocos e filtrar status (Ctrl+K)"
              aria-label="Buscar blocos e filtrar status"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* 2. AI Transcript to Flowchart */}
            {!isClientMode && (
              <button
                type="button"
                onClick={() => {
                  setCommandMode("transcript");
                  setCommandOpen(true);
                }}
                title="Converter Transcrição da Reunião em Fluxograma"
                aria-label="Converter Transcrição da Reunião em Fluxograma"
                className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#3B66FF] hover:bg-[#1B4DFF]/15 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
            )}

            <span className="w-[1px] h-4 bg-[var(--rule-hairline)] mx-0.5" />

            {/* 3. Export High-Res PNG */}
            <button
              type="button"
              onClick={handleExportPng}
              title="Exportar imagem PNG da planta"
              aria-label="Exportar imagem PNG da planta"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* 4. Save & Share Cloud Link */}
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(true);
                setActiveTab("cloud");
                handleSaveCloud();
              }}
              title="Salvar na nuvem e copiar link de compartilhamento"
              aria-label="Salvar na nuvem e compartilhar"
              className="relative w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[#149E93] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span
                className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                  syncStatus === "supabase" ? "bg-[#2DD4BF]" : "bg-[#F5C542]"
                }`}
              />
            </button>

            <span className="w-[1px] h-4 bg-[var(--rule-hairline)] mx-0.5" />

            {/* 5. Theme Toggle (Icon-only) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Mudar para Modo Claro (Papel Vellum)"
                  : "Mudar para Modo Escuro (Planta Noturna)"
              }
              aria-label="Alternar tema claro ou escuro"
              className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-[#F5C542]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#1B4DFF]" />
              )}
            </button>
          </div>

          {/* Primary Action CTA: Compilar PRD */}
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(true);
              setActiveTab("prd");
            }}
            className="h-[32px] px-3 bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] rounded-[7px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Compilar PRD</span>
          </button>

          {/* Drawer Collapse/Expand Icon Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen((o) => !o)}
            title={drawerOpen ? "Recolher painel lateral" : "Abrir painel lateral"}
            aria-label={
              drawerOpen ? "Recolher painel lateral" : "Abrir painel lateral"
            }
            className="w-8 h-8 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] rounded-[7px] flex items-center justify-center transition-colors"
          >
            {drawerOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* WORKSPACE BODY: LEFT BLOCK SIDEBAR + INFINITE CANVAS + RIGHT DOSSIER DRAWER */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT VERTICAL CREATION SIDEBAR */}
        {!isClientMode && (
          <aside className="w-[148px] shrink-0 h-full bg-[var(--bg-panel)] border-r border-[var(--rule-strong)] p-2.5 flex flex-col justify-between select-none z-10 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              {/* Product Semantics Column */}
              <button
                type="button"
                onClick={() => handleAddBlock("screen")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] text-[12px] font-semibold flex items-center gap-2 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span>+ Tela</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock("action")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
                <span>+ Ação</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock("decision")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#D9381E] shrink-0" />
                <span>+ Decisão</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock("integration")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors"
              >
                <Webhook className="w-3.5 h-3.5 text-[#6D28D9] shrink-0" />
                <span>+ API</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock("database")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                <span>+ Tabela DB</span>
              </button>

              <div className="h-[1px] w-full bg-[var(--rule-hairline)] my-1" />

              {/* FigJam Freeform Column */}
              <button
                type="button"
                onClick={() => handleAddBlock("sticky")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[#FFF3C4] hover:bg-[#F5C542] text-[#1F1A0C] border border-[#B8860B] text-[12px] font-semibold flex items-center gap-2 transition-colors"
              >
                <StickyNote className="w-3.5 h-3.5 shrink-0" />
                <span>+ Post-it</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock("shape")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors"
              >
                <Square className="w-3.5 h-3.5 shrink-0" />
                <span>+ Forma</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock("section")}
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors"
              >
                <Frame className="w-3.5 h-3.5 shrink-0" />
                <span>+ Fase</span>
              </button>

              <div className="h-[1px] w-full bg-[var(--rule-hairline)] my-1" />

              {/* Auto-Organize Phases Action */}
              <button
                type="button"
                onClick={handleAutoOrganizeByPhase}
                disabled={nodes.length === 0}
                title="Alinhar e espaçar automaticamente os blocos dentro de cada Fase"
                className="w-full px-2.5 py-2 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] text-[12px] font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#3B66FF] shrink-0" />
                <span>Organizar Fases</span>
              </button>

              {/* Primary Clear Canvas Action in Left Sidebar */}
              <button
                type="button"
                onClick={handleClearCanvas}
                disabled={nodes.length === 0}
                title="Limpar todos os blocos da tela"
                className={`w-full px-2.5 py-2 rounded-[8px] text-[12px] font-semibold flex items-center gap-2 transition-colors ${
                  nodes.length > 0
                    ? "bg-[#D9381E] hover:bg-[#B42318] text-[#FAF8F4]"
                    : "bg-[#D9381E]/35 text-[#FAF8F4]/60 cursor-not-allowed"
                }`}
              >
                <Eraser className="w-3.5 h-3.5 shrink-0" />
                <span>Limpar Tela</span>
              </button>

              {undoSnapshot && nodes.length === 0 && (
                <button
                  type="button"
                  onClick={handleUndoClear}
                  title="Restaurar o fluxo anterior"
                  className="w-full px-2.5 py-2 rounded-[8px] bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] text-[12px] font-semibold flex items-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span>Desfazer</span>
                </button>
              )}
            </div>
          </aside>
        )}

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
            onNodeDragStart={(_, node) => {
              if (node.data.category === "section") {
                const children = getNodesInSection(nodes, node);
                sectionDragRef.current = {
                  sectionId: node.id,
                  lastX: node.position.x,
                  lastY: node.position.y,
                  childIds: new Set(children.map((c) => c.id)),
                };
              } else {
                sectionDragRef.current = null;
              }
            }}
            onNodeDrag={(_, node) => {
              const dragInfo = sectionDragRef.current;
              if (dragInfo && dragInfo.sectionId === node.id) {
                const dx = node.position.x - dragInfo.lastX;
                const dy = node.position.y - dragInfo.lastY;
                if (dx !== 0 || dy !== 0) {
                  dragInfo.lastX = node.position.x;
                  dragInfo.lastY = node.position.y;
                  setNodes((nds) =>
                    nds.map((n) =>
                      dragInfo.childIds.has(n.id)
                        ? {
                            ...n,
                            position: {
                              x: n.position.x + dx,
                              y: n.position.y + dy,
                            },
                          }
                        : n
                    )
                  );
                }
              }
            }}
            onNodeDragStop={() => {
              sectionDragRef.current = null;
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
              color={theme === "dark" ? "#2E3443" : "#B8B1A2"}
            />

            <Controls
              position="bottom-left"
              showInteractive={false}
              className="!bg-[var(--bg-card)] !border !border-[var(--rule-strong)] !rounded-[8px] !shadow-none overflow-hidden"
            />

            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              maskColor={
                theme === "dark"
                  ? "rgba(17, 19, 24, 0.72)"
                  : "rgba(246, 243, 236, 0.72)"
              }
              className="!bg-[var(--bg-panel)] !border !border-[var(--rule-strong)] !rounded-[10px] !shadow-none"
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
                    return theme === "dark" ? "#2E3443" : "#D8D3C8";
                  default:
                    return theme === "dark" ? "#F3F1EA" : "#16181D";
                }
              }}
            />

            {/* Top-Right Telemetry & Legend Stamp on Canvas */}
            <Panel position="top-right" className="!m-3 hidden md:block">
              <div className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--rule-strong)] rounded-[10px] flex items-center gap-3 font-mono text-[11px] text-[var(--ink-primary)]">
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

            {/* Empty State Card when canvas is cleared */}
            {nodes.length === 0 && !isClientMode && (
              <Panel position="top-center" className="!mt-24">
                <div className="p-5 bg-[var(--bg-card)] border border-[var(--rule-strong)] rounded-[14px] max-w-[420px] text-center space-y-3">
                  <p className="text-[14px] font-bold text-[var(--ink-primary)]">
                    Canvas Limpo · Pronto para o Briefing
                  </p>
                  <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
                    Comece adicionando a primeira tela da jornada do cliente ou digite o fluxo completo na barra de captura rápida no topo.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleAddBlock("screen")}
                      className="px-3.5 py-2 rounded-[8px] bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>+ Criar 1ª Tela</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock("sticky")}
                      className="px-3.5 py-2 rounded-[8px] bg-[#FFF3C4] hover:bg-[#F5C542] text-[#1F1A0C] border border-[#B8860B] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>+ Adicionar Post-it</span>
                    </button>
                    {undoSnapshot && (
                      <button
                        type="button"
                        onClick={handleUndoClear}
                        className="px-3 py-2 rounded-[8px] bg-[var(--bg-panel)] hover:bg-[var(--bg-subcard)] text-[var(--ink-primary)] border border-[var(--rule-strong)] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors"
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

          {/* Floating Command Palette & Transcript-to-Flow Popover (Ctrl+K) */}
          {commandOpen && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[560px] bg-[var(--bg-card)] border border-[var(--rule-strong)] rounded-[12px] overflow-hidden">
              {/* Top Mode Switcher Bar */}
              <div className="px-3 py-2 bg-[var(--bg-panel)] border-b border-[var(--rule-hairline)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCommandMode("search")}
                    className={`px-2.5 py-1 rounded-[6px] font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                      commandMode === "search"
                        ? "bg-[#1B4DFF] text-[#FAF8F4]"
                        : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    <span>Buscar Blocos</span>
                  </button>
                  {!isClientMode && (
                    <button
                      type="button"
                      onClick={() => setCommandMode("transcript")}
                      className={`px-2.5 py-1 rounded-[6px] font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                        commandMode === "transcript"
                          ? "bg-[#1B4DFF] text-[#FAF8F4]"
                          : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                      }`}
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Transcrição ➔ Fluxo</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCommandOpen(false)}
                  title="Fechar (Esc)"
                  aria-label="Fechar paleta de comandos"
                  className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] rounded-[5px]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {commandMode === "search" ? (
                <div className="p-3 space-y-3">
                  {/* Search Input & Filter Chips */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[7px] px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-[var(--ink-secondary)] mr-2 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por código (SCR-01), título, rota ou ator..."
                        className="w-full text-[12px] bg-transparent text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: "all", label: "Todos" },
                          { id: "duvida", label: "! Com Dúvida" },
                          { id: "mvp", label: "Apenas MVP" },
                          { id: "validado", label: "✓ Validados" },
                        ] as const
                      ).map((flt) => (
                        <button
                          key={flt.id}
                          type="button"
                          onClick={() => setStatusFilter(flt.id)}
                          className={`px-2 py-0.5 rounded-[4px] font-mono text-[10px] border transition-colors ${
                            statusFilter === flt.id
                              ? "bg-[#1B4DFF] text-[#FAF8F4] border-[#1B4DFF] font-semibold"
                              : "bg-[var(--bg-subcard)] text-[var(--ink-secondary)] border-[var(--rule-hairline)] hover:text-[var(--ink-primary)]"
                          }`}
                        >
                          {flt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered Nodes Result List */}
                  <div className="max-h-[210px] overflow-y-auto divide-y divide-[var(--rule-hairline)] border border-[var(--rule-hairline)] rounded-[8px] bg-[var(--bg-subcard)]">
                    {nodes
                      .filter((n) => {
                        if (n.data.category === "section") return false;
                        if (
                          statusFilter === "duvida" &&
                          n.data.status !== "duvida"
                        )
                          return false;
                        if (
                          statusFilter === "validado" &&
                          n.data.status !== "validado"
                        )
                          return false;
                        if (
                          statusFilter === "mvp" &&
                          (n.data.priority || "mvp") !== "mvp"
                        )
                          return false;
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          (n.data.code || "").toLowerCase().includes(q) ||
                          (n.data.title || "").toLowerCase().includes(q) ||
                          (n.data.route || "").toLowerCase().includes(q) ||
                          (n.data.actor || "").toLowerCase().includes(q)
                        );
                      })
                      .map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            setNodes((nds) =>
                              nds.map((n) => ({
                                ...n,
                                selected: n.id === node.id,
                              }))
                            );
                            setActiveTab("inspector");
                            setDrawerOpen(true);
                            setCommandOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 bg-[#1B4DFF] text-[#FAF8F4] rounded-[3px] shrink-0 tabular-nums">
                              {node.data.code}
                            </span>
                            <span className="text-[12px] font-medium text-[var(--ink-primary)] truncate">
                              {node.data.title}
                            </span>
                            {node.data.route && (
                              <span className="font-mono text-[10px] text-[var(--ink-secondary)] truncate hidden sm:inline">
                                {node.data.route}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {node.data.status === "duvida" && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#D9381E]/20 text-[#F87171] border border-[#D9381E] rounded-[3px]">
                                DÚVIDA
                              </span>
                            )}
                            {node.data.status === "validado" && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#0F766E]/20 text-[#2DD4BF] border border-[#0F766E] rounded-[3px]">
                                OK
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                              {node.data.category}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleGenerateFromTranscript}
                  className="p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[var(--ink-secondary)]">
                      Cole um trecho da transcrição da call ou tópicos do cliente para gerar a Fase e os blocos automaticamente:
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setTranscriptText(
                          "Tela: Portal de Login SSO -> Tela: Dashboard de Pedidos & KPIs -> Ação: Solicitar Desconto Especial -> Decisão: Desconto maior que 15%? -> API: Webhook Alçada Diretoria WhatsApp -> Banco: public.discount_approvals -> Nota: Cliente pediu que o diretor possa aprovar direto pelo link do WhatsApp"
                        )
                      }
                      className="font-mono text-[10px] px-2 py-0.5 bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[#3B66FF] border border-[var(--rule-hairline)] rounded-[4px] shrink-0"
                    >
                      Usar Exemplo
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    autoFocus
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Ex: Tela: Login do Representante -> Tela: Catálogo & Carrinho B2B -> Decisão: Limite de Crédito Aprovado? -> API: ERP Omie / Pedido -> Banco: public.b2b_orders"
                    className="w-full p-2.5 text-[12px] bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[8px] text-[var(--ink-primary)] placeholder:text-[var(--ink-secondary)] focus:outline-none focus:border-[#1B4DFF]"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCommandOpen(false)}
                      className="px-3 py-1.5 bg-[var(--bg-panel)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] border border-[var(--rule-hairline)] rounded-[6px] text-[12px]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] rounded-[6px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Gerar Fluxograma no Canvas</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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
            savedBoards={savedBoards}
            selectedNode={selectedNode}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedPhaseId={selectedPhaseId}
            setSelectedPhaseId={setSelectedPhaseId}
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
            onSaveAsNewProject={handleSaveAsNewProject}
            onLoadProject={handleLoadProject}
            isSaving={isSaving}
            syncStatus={syncStatus}
            supabaseError={supabaseError}
            anonKey={anonKey}
            setAnonKey={handleSetAnonKey}
            isClientMode={isClientMode}
          />
        )}

        {/* CONFIRM CLEAR CANVAS MODAL */}
        {confirmClearOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
            className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-[440px] bg-[var(--bg-card)] border border-[var(--rule-strong)] rounded-[14px] overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-panel)] border-b border-[var(--rule-strong)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D9381E]" />
                  <h2
                    id="clear-modal-title"
                    className="text-[14px] font-bold text-[var(--ink-primary)]"
                  >
                    Confirmar Limpeza da Tela Toda
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="p-1 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] rounded-[4px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-[12px] text-[var(--ink-primary)] leading-relaxed">
                  Você está prestes a remover todos os{" "}
                  <strong>{nodes.length} blocos</strong> e{" "}
                  <strong>{edges.length} conexões</strong> atualmente desenhados no canvas do projeto{" "}
                  <strong>&ldquo;{boardMeta.title}&rdquo;</strong>.
                </p>

                <div className="p-3 bg-[var(--bg-subcard)] border border-[var(--rule-hairline)] rounded-[8px] text-[12px] text-[var(--ink-secondary)] space-y-1">
                  <p className="font-semibold text-[var(--ink-primary)]">
                    Onde meu projeto atual fica guardado?
                  </p>
                  <p>
                    Se você clicar em <strong>Salvar e Limpar</strong>, este fluxo ficará salvo na aba{" "}
                    <strong>Projetos</strong> (à direita) no servidor local (<code>.data/boards.json</code>) e no Supabase, podendo ser reaberto a qualquer momento.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => executeClearCanvas(true)}
                    className="w-full py-2.5 px-3 bg-[#1B4DFF] hover:bg-[#1438B8] text-[#FAF8F4] rounded-[8px] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Projeto Atual na Galeria e Limpar Tela</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeClearCanvas(false)}
                    className="w-full py-2 px-3 bg-[#D9381E]/15 hover:bg-[#D9381E] text-[#D9381E] hover:text-[#FAF8F4] border border-[#D9381E] rounded-[8px] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eraser className="w-4 h-4" />
                    <span>Limpar Tela Toda Sem Salvar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmClearOpen(false)}
                    className="w-full py-2 px-3 bg-[var(--bg-panel)] hover:bg-[var(--bg-subcard)] text-[var(--ink-primary)] border border-[var(--rule-hairline)] rounded-[8px] text-[12px] font-medium transition-colors"
                  >
                    Cancelar e Voltar ao Fluxo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
