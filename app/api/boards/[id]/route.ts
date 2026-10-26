import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { BoardProject } from "@/lib/types";
import { getSupabaseClient } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const BOARDS_FILE = path.join(DATA_DIR, "boards.json");

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const anonKey = req.headers.get("x-supabase-key") || undefined;
  const supabase = getSupabaseClient(anonKey);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("briefing_boards")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const board: BoardProject = {
          id: data.id,
          title: data.title,
          clientName: data.client_name,
          systemType: data.system_type,
          version: data.version,
          objective: data.objective,
          nodes: data.nodes || [],
          edges: data.edges || [],
          updatedAt: data.updated_at,
        };
        return NextResponse.json({ source: "supabase", board });
      }
    } catch {
      // fallback to local store
    }
  }

  try {
    const raw = await fs.readFile(BOARDS_FILE, "utf-8");
    const store = JSON.parse(raw) as Record<string, BoardProject>;
    if (store[id]) {
      return NextResponse.json({ source: "local", board: store[id] });
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
}
