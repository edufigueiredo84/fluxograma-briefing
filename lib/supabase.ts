import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_PROJECT_REF = "sovsuyjpazocwtsqtmkg";
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  `https://${SUPABASE_PROJECT_REF}.supabase.co`;

export const SUPABASE_DASHBOARD_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}`;
export const SUPABASE_SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`;
export const SUPABASE_API_SETTINGS_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/settings/api`;

export const SUPABASE_MIGRATION_SQL = `-- Execute este SQL no SQL Editor do projeto Supabase (${SUPABASE_PROJECT_REF})
create table if not exists public.briefing_boards (
  id text primary key,
  title text not null,
  client_name text not null default '',
  system_type text not null default '',
  version text not null default 'REV 01',
  objective text not null default '',
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.briefing_boards enable row level security;

create policy "Permitir leitura e escrita publica para links de briefing"
  on public.briefing_boards
  for all
  using (true)
  with check (true);`;

export function getSupabaseClient(customAnonKey?: string): SupabaseClient | null {
  const key =
    customAnonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("briefing_supabase_anon_key") || ""
      : "");

  if (!key || key.trim().length < 20) {
    return null;
  }

  return createClient(SUPABASE_URL, key.trim());
}
