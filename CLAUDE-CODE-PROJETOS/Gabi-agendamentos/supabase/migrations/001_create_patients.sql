create table patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid() not null,
  name text not null,
  phone text not null,
  default_weekday int check (default_weekday between 0 and 6),
  default_time time,
  notes text,
  active boolean default true not null,
  created_at timestamptz default now() not null
);

alter table patients enable row level security;

create policy "Usuarios veem apenas seus pacientes"
  on patients for all
  using (auth.uid() = user_id);

create index idx_patients_user_id on patients(user_id);
create index idx_patients_phone on patients(phone);
