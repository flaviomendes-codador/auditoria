-- Seed executado manualmente apos criar o usuario no Supabase Auth
-- Substituir USER_ID_AQUI pelo UUID do usuario

-- Templates padrao (white-label: brand_emoji vem de settings, nao hardcodado)
-- Estes templates usam {brand_emoji} como variavel — N8N substitui pelo valor em settings.brand_emoji
-- Gabi (gabiayer@gmail.com)
insert into message_templates (user_id, type, content) values
  ('e44d7c7d-195b-48e6-9a77-46b1e22f3d27', 'confirmation', 'Olá, {nome}! Gostaria de confirmar sua {appointment_label} amanhã, {dia_semana}, às {hora}. Posso confirmar? {brand_emoji}'),
  ('e44d7c7d-195b-48e6-9a77-46b1e22f3d27', 'followup', 'Oi, {nome}! Vi que ainda não confirmou a {appointment_label} de amanhã às {hora}. Consegue me confirmar? {brand_emoji}'),
  ('e44d7c7d-195b-48e6-9a77-46b1e22f3d27', 'reminder', 'Bom dia, {nome}! Lembrete: sua {appointment_label} é hoje às {hora}. Te espero! {brand_emoji}'),
  ('e44d7c7d-195b-48e6-9a77-46b1e22f3d27', 'cancellation', 'Oi, {nome}! Sua {appointment_label} de {dia_semana} às {hora} foi cancelada. Quando quiser reagendar, é só me chamar! {brand_emoji}');

insert into settings (id, owner_name, business_name, brand_emoji, appointment_label)
  values ('e44d7c7d-195b-48e6-9a77-46b1e22f3d27', 'Gabi', 'Gabi Agendamentos', '🍃 ✨', 'sessão');

-- Flávio (flavio2020mendes@gmail.com) — conta de testes
insert into message_templates (user_id, type, content) values
  ('a3829a73-d50c-4fe1-adbd-35f6a78ec66c', 'confirmation', 'Olá, {nome}! Gostaria de confirmar sua {appointment_label} amanhã, {dia_semana}, às {hora}. Posso confirmar? {brand_emoji}'),
  ('a3829a73-d50c-4fe1-adbd-35f6a78ec66c', 'followup', 'Oi, {nome}! Vi que ainda não confirmou a {appointment_label} de amanhã às {hora}. Consegue me confirmar? {brand_emoji}'),
  ('a3829a73-d50c-4fe1-adbd-35f6a78ec66c', 'reminder', 'Bom dia, {nome}! Lembrete: sua {appointment_label} é hoje às {hora}. Te espero! {brand_emoji}'),
  ('a3829a73-d50c-4fe1-adbd-35f6a78ec66c', 'cancellation', 'Oi, {nome}! Sua {appointment_label} de {dia_semana} às {hora} foi cancelada. Quando quiser reagendar, é só me chamar! {brand_emoji}');

insert into settings (id, owner_name, business_name, brand_emoji, appointment_label)
  values ('a3829a73-d50c-4fe1-adbd-35f6a78ec66c', 'Flávio', 'Teste Agendamentos', '🧪', 'consulta');
