import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { BoardProject } from "@/lib/types";
import { BOARD_TEMPLATES } from "@/lib/templates";
import { getSupabaseClient } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const BOARDS_FILE = path.join(DATA_DIR, "boards.json");

async function readLocalStore(): Promise<Record<string, BoardProject>> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(BOARDS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const initial: Record<string, BoardProject> = {
      [BOARD_TEMPLATES["crm-funil"].id]: BOARD_TEMPLATES["crm-funil"],
      [BOARD_TEMPLATES["saas-onboarding"].id]: BOARD_TEMPLATES["saas-onboarding"],
      [BOARD_TEMPLATES["dashboard-aprovacao"].id]: BOARD_TEMPLATES["dashboard-aprovacao"],
    };
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(BOARDS_FILE, JSON.stringify(initial, null, 2), "utf-8");
    } catch {
      // ignore read-only fs errors
    }
    return initial;
  }
}

async function writeLocalStore(store: Record<string, BoardProject>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BOARDS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const anonKey = req.headers.get("x-supabase-key") || undefined;
  const supabase = getSupabaseClient(anonKey);
  const store = await readLocalStore();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("briefing_boards")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        const cloudBoards: BoardProject[] = data.map((row) => ({
          id: row.id,
          title: row.title,
          clientName: row.client_name,
          systemType: row.system_type,
          version: row.version,
          objective: row.objective,
          nodes: row.nodes || [],
          edges: row.edges || [],
          updatedAt: row.updated_at,
        }));
        return NextResponse.json({
          source: "supabase",
          boards: cloudBoards.length > 0 ? cloudBoards : Object.values(store),
        });
      }
    } catch {
      // fallback to local
    }
  }

  return NextResponse.json({
    source: "local",
    boards: Object.values(store),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      board: BoardProject;
      supabaseAnonKey?: string;
    };
    const board = body.board;
    if (!board || !board.id) {
      return NextResponse.json({ error: "Board inválido" }, { status: 400 });
    }

    board.updatedAt = new Date().toISOString();

    // Always persist locally so share links on this instance never fail
    const store = await readLocalStore();
    store[board.id] = board;
    await writeLocalStore(store);

    // Sync to Supabase sovsuyjpazocwtsqtmkg when key is available
    const supabase = getSupabaseClient(
      body.supabaseAnonKey || req.headers.get("x-supabase-key") || undefined
    );
    let syncedToSupabase = false;
    let supabaseError: string | null = null;

    if (supabase) {
      const { error } = await supabase.from("briefing_boards").upsert(
        {
          id: board.id,
          title: board.title,
          client_name: board.clientName,
          system_type: board.systemType,
          version: board.version,
          objective: board.objective,
          nodes: board.nodes,
          edges: board.edges,
          updated_at: board.updatedAt,
        },
        { onConflict: "id" }
      );
      if (!error) {
        syncedToSupabase = true;
      } else {
        supabaseError = error.message;
      }
    }

    return NextResponse.json({
      ok: true,
      board,
      syncedToSupabase,
      supabaseError,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar board" },
      { status: 500 }
    );
  }
}
