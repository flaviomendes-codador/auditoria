CREATE TABLE leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  empresa     text NOT NULL,
  whatsapp    text NOT NULL,
  score_total integer,
  score_q     integer,
  score_c     integer,
  score_r     integer,
  nivel       text CHECK (nivel IN ('critico', 'atencao', 'bom', 'excelente')),
  gargalo     text CHECK (gargalo IN ('Q', 'C', 'R')),
  utm_source  text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE respostas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  pergunta    integer NOT NULL CHECK (pergunta BETWEEN 1 AND 12),
  bloco       text NOT NULL CHECK (bloco IN ('Q', 'C', 'R')),
  valor       integer NOT NULL CHECK (valor IN (0, 33, 67, 100)),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow anon insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow anon insert respostas" ON respostas FOR INSERT TO anon WITH CHECK (true);
