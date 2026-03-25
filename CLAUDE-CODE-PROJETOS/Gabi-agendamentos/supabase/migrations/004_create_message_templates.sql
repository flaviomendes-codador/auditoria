create type template_type as enum ('confirmation', 'followup', 'reminder', 'cancellation');

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  type template_type not null,
  content text not null,
  active boolean default true not null,
  updated_at timestamptz default now() not null
);

alter table message_templates enable row level security;

create policy "Usuarios veem apenas seus templates"
  on message_templates for all
  using (auth.uid() = user_id);
