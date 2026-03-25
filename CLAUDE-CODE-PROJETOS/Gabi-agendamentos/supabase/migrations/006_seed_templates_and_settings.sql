-- Seed executado manualmente apos criar o usuario no Supabase Auth
-- Substituir USER_ID_AQUI pelo UUID do usuario

-- Templates padrao (white-label: brand_emoji vem de settings, nao hardcodado)
-- Estes templates usam {brand_emoji} como variavel — N8N substitui pelo valor em settings.brand_emoji
insert into message_templates (user_id, type, content) values
  ('USER_ID_AQUI', 'confirmation', 'Ola, {nome}! Gostaria de confirmar sua {appointment_label} amanha, {dia_semana}, as {hora}. Posso confirmar? {brand_emoji}'),
  ('USER_ID_AQUI', 'followup', 'Oi, {nome}! Vi que ainda nao confirmou a {appointment_label} de amanha as {hora}. Consegue me confirmar? {brand_emoji}'),
  ('USER_ID_AQUI', 'reminder', 'Bom dia, {nome}! Lembrete: sua {appointment_label} e hoje as {hora}. Te espero! {brand_emoji}'),
  ('USER_ID_AQUI', 'cancellation', 'Oi, {nome}! Sua {appointment_label} de {dia_semana} as {hora} foi cancelada. Quando quiser reagendar, e so me chamar! {brand_emoji}');

-- Settings com branding da Gabi
-- Para um novo cliente: alterar owner_name, business_name, brand_emoji, appointment_label
insert into settings (id, owner_name, business_name, brand_emoji, appointment_label)
  values ('USER_ID_AQUI', 'Gabi', 'Agendamentos', '🍃 ✨', 'sessão');
