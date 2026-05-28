-- Migration: Inventário de Riscos
-- Rodar no Supabase SQL Editor

create table if not exists riscos (
  id                uuid primary key default gen_random_uuid(),
  organizacao_id    uuid not null references organizacoes(id) on delete cascade,
  tipo              text not null check (tipo in ('fisico', 'quimico', 'biologico', 'ergonomico', 'mecanico', 'psicossocial')),
  descricao         text not null,
  fonte_geradora    text,
  probabilidade     integer not null default 3 check (probabilidade between 1 and 5),
  severidade        integer not null default 3 check (severidade between 1 and 5),
  ativo             boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references auth.users(id),
  updated_by        uuid references auth.users(id)
);

create table if not exists risco_cargo (
  risco_id  uuid not null references riscos(id) on delete cascade,
  cargo_id  uuid not null references cargos(id) on delete cascade,
  primary key (risco_id, cargo_id)
);

-- RLS
alter table riscos enable row level security;
alter table risco_cargo enable row level security;

create policy "usuarios da org podem ver riscos"
  on riscos for select
  using (
    organizacao_id in (
      select organizacao_id from usuarios where id = auth.uid()
    )
  );

create policy "usuarios da org podem ver risco_cargo"
  on risco_cargo for select
  using (
    risco_id in (
      select id from riscos where organizacao_id in (
        select organizacao_id from usuarios where id = auth.uid()
      )
    )
  );

-- Índices
create index if not exists riscos_org_idx on riscos(organizacao_id);
create index if not exists riscos_tipo_idx on riscos(tipo);
create index if not exists risco_cargo_risco_idx on risco_cargo(risco_id);
create index if not exists risco_cargo_cargo_idx on risco_cargo(cargo_id);

-- Trigger para updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger riscos_updated_at
  before update on riscos
  for each row execute function update_updated_at();
