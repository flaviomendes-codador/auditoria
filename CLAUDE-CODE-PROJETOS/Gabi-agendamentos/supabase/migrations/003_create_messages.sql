create type message_direction as enum ('outbound', 'inbound');
create type message_type as enum ('confirmation', 'followup', 'reminder', 'reply', 'cancellation', 'manual');
create type wapi_status as enum ('sent', 'delivered', 'read', 'failed');

create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  appointment_id uuid references appointments(id) on delete set null,
  patient_id uuid references patients(id) on delete cascade not null,
  direction message_direction not null,
  type message_type not null,
  content text not null,
  wapi_status wapi_status default 'sent' not null,
  wapi_message_id text,
  sent_at timestamptz default now() not null
);

alter table messages enable row level security;

create policy "Usuarios veem apenas suas mensagens"
  on messages for all
  using (auth.uid() = user_id);

create index idx_messages_patient on messages(patient_id);
create index idx_messages_appointment on messages(appointment_id);
