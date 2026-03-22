import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  || ''
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}

// ─── Schema SQL para criar no Supabase ─────────────────────────────────────
//
// Execute no Supabase SQL Editor:
//
// CREATE TABLE apps (
//   id TEXT PRIMARY KEY,
//   name TEXT NOT NULL,
//   icon TEXT,
//   category TEXT,
//   platform TEXT,
//   origin_markets TEXT[],
//   target_markets TEXT[],
//   mrr_usd NUMERIC,
//   mrr_range TEXT,
//   downloads_monthly NUMERIC,
//   rating NUMERIC,
//   reviews_count NUMERIC,
//   subscription_price_usd NUMERIC,
//   has_free_tier BOOLEAN,
//   opportunity_score INTEGER,
//   opportunity_level TEXT,
//   latam_penetration INTEGER,
//   india_penetration INTEGER,
//   yoy_growth INTEGER,
//   description TEXT,
//   tags TEXT[],
//   last_updated TIMESTAMPTZ DEFAULT now()
// );
//
// CREATE TABLE niches (
//   id TEXT PRIMARY KEY,
//   name TEXT NOT NULL,
//   category TEXT,
//   icon TEXT,
//   color TEXT,
//   opportunity_score INTEGER,
//   opportunity_level TEXT,
//   market_size_usd NUMERIC,
//   latam_gap INTEGER,
//   india_gap INTEGER,
//   apps_count INTEGER,
//   avg_mrr NUMERIC,
//   top_mrr NUMERIC,
//   growth_rate INTEGER,
//   competition TEXT,
//   description TEXT,
//   why_opportunity TEXT,
//   key_players TEXT[],
//   entry_barriers TEXT[],
//   suggested_price_latam TEXT,
//   suggested_price_india TEXT,
//   last_updated TIMESTAMPTZ DEFAULT now()
// );
//
// CREATE TABLE refresh_logs (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   triggered_at TIMESTAMPTZ DEFAULT now(),
//   source TEXT,
//   results JSONB
// );
