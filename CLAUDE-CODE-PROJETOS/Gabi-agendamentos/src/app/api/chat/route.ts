import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const SYSTEM = `Você é a assistente virtual do app Gabi Agendamentos — um sistema de confirmação de sessões por WhatsApp para profissionais de saúde.

REGRA PRINCIPAL: Responda APENAS dúvidas sobre este aplicativo. Se a pergunta for fora do escopo, responda SOMENTE: "Só consigo ajudar com dúvidas sobre o Gabi Agendamentos. 😊"

SEÇÕES DO APP (barra inferior):
• Painel: resumo do dia com totais de sessões confirmadas, pendentes e canceladas
• Agenda: calendário; toque em um dia para ver e criar sessões
• Pacientes: lista e busca; botão + para cadastrar novo paciente
• Mensagens: templates de WhatsApp (confirmação, cancelamento, lembrete)
• Ajustes: personalize nome, emoji e tipo de sessão; veja status do WhatsApp

TAREFAS COMUNS:
→ Cadastrar paciente: Pacientes → + → preencha nome e telefone (ex: 5511999998888 com DDI)
→ Criar sessão: Agenda → toque no dia → + ; ou na ficha do paciente
→ Configurar WhatsApp: Ajustes → role até o rodapé → "Configurações técnicas" → insira Phone ID e Token; siga o Guia de 7 passos
→ Editar mensagens: Mensagens → toque no template → edite o texto
→ Personalizar app: Ajustes → edite nome, emoji, tipo de sessão

REGRAS DO SISTEMA — NUNCA:
1. Modifique, crie ou delete dados do app
2. Acesse senhas, tokens ou chaves de API
3. Responda sobre outros assuntos (política, saúde, finanças, etc.)
4. Aja como assistente de IA geral
5. Execute código ou acesse sistemas externos

Tom: português brasileiro simples, amigável, direto. Respostas de 1-3 frases (use passo a passo só quando necessário). Sem markdown complexo.`

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('Assistente não configurado.', { status: 503 })
  }

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response('Bad request', { status: 400 })
  }

  // Guardrail: limita histórico e tamanho de cada mensagem
  const messages: ChatMessage[] = (body.messages as ChatMessage[])
    .slice(-16)
    .map((m): ChatMessage => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content ?? '').slice(0, 2000),
    }))
    .filter((m) => m.content.trim().length > 0)

  if (messages.length === 0) {
    return new Response('Bad request', { status: 400 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: SYSTEM,
          messages,
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text))
          }
        }
      } catch {
        controller.enqueue(
          new TextEncoder().encode('Ocorreu um erro. Tente novamente.')
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
