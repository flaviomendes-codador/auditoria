const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendWhatsAppMessage(
  to: string,
  text: string,
  credentials?: { phoneId?: string; token?: string }
): Promise<SendMessageResult> {
  const phoneId = credentials?.phoneId ?? process.env.WHATSAPP_PHONE_ID
  const token = credentials?.token ?? process.env.WHATSAPP_TOKEN

  if (!phoneId || !token) {
    return { success: false, error: 'WhatsApp nao configurado' }
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: text },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message ?? 'Erro desconhecido' }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de rede',
    }
  }
}
