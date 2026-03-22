-- ============================================
-- APPRADAR — Setup do Agente 1: Radar
-- Execute no Supabase SQL Editor (Dashboard)
-- ============================================

-- 1. Tabela de relatórios do Radar (histórico de scans)
CREATE TABLE IF NOT EXISTS radar_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_scanned INTEGER NOT NULL DEFAULT 0,
  total_qualified INTEGER NOT NULL DEFAULT 0,
  categories_scanned TEXT[] DEFAULT '{}',
  trending_categories TEXT[] DEFAULT '{}',
  data_sources TEXT[] DEFAULT '{}',
  android_coverage NUMERIC DEFAULT 0,
  scan_duration_ms INTEGER DEFAULT 0,
  top_apps JSONB NOT NULL DEFAULT '[]',
  filters_applied JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de seleções para produção (Top 2 → Agente 2)
CREATE TABLE IF NOT EXISTS radar_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES radar_reports(id) ON DELETE SET NULL,
  app_id TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_icon TEXT,
  category TEXT,
  store_url TEXT,
  radar_score INTEGER NOT NULL,
  mrr_estimated NUMERIC,
  combined_mrr NUMERIC,
  clone_difficulty TEXT,
  monetization TEXT,
  why_opportunity TEXT[] DEFAULT '{}',
  suggested_improvements TEXT[] DEFAULT '{}',
  target_markets TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'selected'
    CHECK (status IN ('selected', 'analyzing', 'building', 'launched', 'discarded')),
  selected_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  launched_at TIMESTAMPTZ,
  notes TEXT
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_radar_reports_scanned_at ON radar_reports(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_radar_selections_status ON radar_selections(status);
CREATE INDEX IF NOT EXISTS idx_radar_selections_bundle ON radar_selections(bundle_id);

-- 4. RLS — habilitar mas permitir tudo (projeto pessoal, sem multi-tenant)
ALTER TABLE radar_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on radar_reports" ON radar_reports
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on radar_selections" ON radar_selections
  FOR ALL USING (true) WITH CHECK (true);
