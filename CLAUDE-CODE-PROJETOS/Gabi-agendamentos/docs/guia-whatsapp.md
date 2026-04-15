---
title: Guia — Conectar WhatsApp Cloud API
tags:
  - setup
  - whatsapp
  - meta
---

# Guia — Conectar WhatsApp Cloud API

> [!warning] Pré-requisito
> O app precisa estar deployado e com URL pública antes de configurar o webhook. Faça o deploy no Vercel primeiro.

---

## O que você vai precisar

- Conta Facebook (pessoal ou da empresa)
- Número de WhatsApp **exclusivo** para o negócio (não pode ser o número pessoal da Gabi)
- URL do app no Vercel (ex: `https://gabi-agendamentos.vercel.app`)

---

## Passo 1 — Criar conta Meta for Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique em **My Apps** → **Create App**
3. Escolha **Business** como tipo de app
4. Preencha nome (ex: `Gabi Agendamentos`) e clique em **Create**

---

## Passo 2 — Adicionar WhatsApp ao app

1. No painel do app, clique em **Add Products**
2. Encontre **WhatsApp** → clique em **Set Up**
3. Siga o wizard para associar uma **WhatsApp Business Account (WABA)**
   - Se não tiver: crie uma nova durante o processo
   - Preencha nome do negócio, categoria e fuso horário

---

## Passo 3 — Adicionar número de telefone

1. Vá em **WhatsApp > Phone Numbers**
2. Clique em **Add phone number**
3. Insira o número da Gabi (formato internacional, sem `+`: ex: `5511999998888`)
4. Verifique via SMS ou chamada

> [!tip]
> O número pode ser qualquer chip — um número novo de operadora é suficiente. Não precisa ser iPhone nem nada especial.

---

## Passo 4 — Pegar credenciais

### Phone ID
1. Vá em **WhatsApp > API Setup**
2. Copie o **Phone number ID** (não é o número em si — é um ID numérico)
3. Cole em `WHATSAPP_PHONE_ID` no `.env.local` e no Vercel

### Access Token (temporário para testes)
1. Na mesma página, copie o **Temporary access token**
2. Cole em `WHATSAPP_TOKEN`

> [!warning] Token temporário expira em 24h
> Para produção, você precisa gerar um token permanente. Veja [[#Token permanente]] abaixo.

---

## Passo 5 — Configurar webhook

1. Vá em **WhatsApp > Configuration**
2. Clique em **Edit** no campo **Webhook**
3. Preencha:
   - **Callback URL:** `https://SEU-APP.vercel.app/api/webhooks/whatsapp`
   - **Verify Token:** qualquer string secreta que você definiu em `WHATSAPP_VERIFY_TOKEN` (ex: `gabi2026`)
4. Clique em **Verify and Save**

> [!success] Se der certo
> A Meta vai fazer uma requisição GET para a URL com o verify token. O app responde com o challenge e a verificação passa.

5. Após verificar, clique em **Manage** e ative o campo **messages**

---

## Passo 6 — Testar

1. No painel da Meta, vá em **WhatsApp > API Setup**
2. No campo **To**, coloque o número da Gabi
3. Clique em **Send Message** — ela receberá uma mensagem de teste
4. Responda a mensagem pelo WhatsApp
5. Verifique no painel do app (em `/mensagens`) se a resposta chegou

---

## Token permanente (produção)

Para não ter o token expirando a cada 24h:

1. Vá em **Business Settings** (business.facebook.com)
2. **Users > System Users** → **Add** → tipo **Admin**
3. Nome: `gabi-agendamentos-bot`
4. Clique em **Generate New Token**
   - Selecione o app
   - Permissões: `whatsapp_business_messaging`, `whatsapp_business_management`
5. Copie o token gerado
6. Cole em `WHATSAPP_TOKEN` no Vercel (substitua o temporário)

---

## Checklist final

- [ ] App deployado no Vercel com URL pública
- [ ] `WHATSAPP_PHONE_ID` configurado no Vercel
- [ ] `WHATSAPP_TOKEN` configurado no Vercel (token permanente)
- [ ] `WHATSAPP_VERIFY_TOKEN` configurado no Vercel
- [ ] Webhook configurado e verificado na Meta
- [ ] Campo **messages** ativado no webhook
- [ ] Teste de envio e recebimento feito

---

## Solução de problemas

| Problema | Causa provável | Solução |
|---------|---------------|---------|
| Webhook não verifica | URL errada ou verify token diferente | Confirmar URL e `WHATSAPP_VERIFY_TOKEN` |
| Mensagens não chegam | Campo `messages` não ativado | Ativar em Webhook > Manage |
| Erro 401 | Token expirado | Gerar token permanente |
| Paciente não encontrado | Número salvo em formato diferente | Salvar paciente com DDI (ex: `5511999998888`) |
| App retorna 500 | Variáveis de ambiente faltando | Conferir todas as env vars no Vercel |

---

> [!note] Formato de número de telefone
> O WhatsApp envia o número no formato internacional sem `+` (ex: `5511999998888`). Cadastre os pacientes no mesmo formato para o webhook funcionar.
