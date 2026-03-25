create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'rescheduling', 'no_show');

create table appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  patient_id uuid references patients(id) on delete cascade not null,
  date date not null,
  time time not null,
  duration_min int default 60 not null,
  status appointment_status default 'pending' not null,
  confirmation_sent boolean default false not null,
  confirmation_sent_at timestamptz,
  followup_sent boolean default false not null,
  followup_sent_at timestamptz,
  alert boolean default false not null,
  created_at timestamptz default now() not null
);

alter table appointments enable row level security;

create policy "Usuarios veem apenas seus agendamentos"
  on appointments for all
  using (auth.uid() = user_id);

create index idx_appointments_user_date on appointments(user_id, date);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_status on appointments(status);
