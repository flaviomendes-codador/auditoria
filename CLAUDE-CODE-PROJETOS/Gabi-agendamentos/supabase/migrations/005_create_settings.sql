-- Tabela singleton: id = auth.users(id) do profissional
-- White-label: campos de branding permitem personalizar por cliente sem alterar codigo
create table settings (
  id uuid primary key references auth.users(id),
  -- Automacao
  confirmation_time time default '18:00' not null,
  followup_delay_hours int default 3 not null,
  reminder_time time default '07:00' not null,
  default_duration_min int default 60 not null,
  break_between_min int default 15 not null,
  working_hours jsonb default '{
    "1": {"start": "08:00", "end": "18:00"},
    "2": {"start": "08:00", "end": "18:00"},
    "3": {"start": "08:00", "end": "18:00"},
    "4": {"start": "08:00", "end": "18:00"},
    "5": {"start": "08:00", "end": "18:00"},
    "0": null,
    "6": null
  }'::jsonb not null,
  -- WhatsApp
  whatsapp_phone_id text,
  whatsapp_token text,
  -- Branding (white-label) — personalizar por cliente sem alterar codigo
  owner_name text default 'Gabi' not null,
  business_name text default 'Agendamentos' not null,
  brand_emoji text default '🍃 ✨' not null,
  appointment_label text default 'sessão' not null
);

alter table settings enable row level security;

create policy "Usuario ve apenas suas configuracoes"
  on settings for all
  using (auth.uid() = id);
