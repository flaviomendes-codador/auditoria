'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Step {
  id: number
  title: string
  emoji: string
  content: React.ReactNode
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="mt-2 flex w-full items-center justify-between rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-left transition hover:bg-brand-100"
    >
      <span className="break-all text-xs font-mono text-brand-700">{value}</span>
      <span className="ml-3 shrink-0 text-xs font-semibold text-brand-500">
        {copied ? '✓ Copiado' : label}
      </span>
    </button>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
      💡 {children}
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
      ⚠️ {children}
    </div>
  )
}

export default function GuiaPage() {
  const [open, setOpen] = useState<number | null>(1)
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhooks/whatsapp`)
  }, [])

  const steps: Step[] = [
    {
      id: 1,
      emoji: '👤',
      title: 'Criar conta Meta for Developers',
      content: (
        <ol className="space-y-2 text-sm text-text-primary">
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Acesse <strong>developers.facebook.com</strong> pelo computador</li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Entre com sua conta do Facebook (pode ser a pessoal)</li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Clique em <strong>My Apps</strong> → <strong>Create App</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">4.</span>Escolha o tipo <strong>Business</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">5.</span>Coloque um nome (ex: <em>Gabi Agendamentos</em>) e clique em <strong>Create</strong></li>
          <Tip>Se já tiver conta no Meta for Developers, pode pular para o passo 2.</Tip>
        </ol>
      ),
    },
    {
      id: 2,
      emoji: '💬',
      title: 'Adicionar WhatsApp ao app',
      content: (
        <ol className="space-y-2 text-sm text-text-primary">
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>No painel do app que você criou, clique em <strong>Add Products</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Encontre <strong>WhatsApp</strong> e clique em <strong>Set Up</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Siga o wizard para criar uma <strong>WhatsApp Business Account (WABA)</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">4.</span>Preencha nome do negócio, categoria e fuso horário (<strong>America/Sao_Paulo</strong>)</li>
          <Tip>Se aparecer pedido de verificação de negócio, clique em "Continue" — para começar, o modo de teste já funciona.</Tip>
        </ol>
      ),
    },
    {
      id: 3,
      emoji: '📱',
      title: 'Adicionar seu número de telefone',
      content: (
        <ol className="space-y-2 text-sm text-text-primary">
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Vá em <strong>WhatsApp → Phone Numbers</strong> no menu lateral</li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Clique em <strong>Add phone number</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Insira o número no formato internacional sem o <code className="bg-gray-100 px-1 rounded">+</code> (ex: <code className="bg-gray-100 px-1 rounded">5511999998888</code>)</li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">4.</span>Verifique via SMS ou chamada</li>
          <Warning>
            Use um número <strong>exclusivo para o negócio</strong> — não pode ser o seu número pessoal do WhatsApp. Pode ser um chip simples de qualquer operadora.
          </Warning>
          <Tip>Após verificar, o número aparece na lista com status "Ready to use".</Tip>
        </ol>
      ),
    },
    {
      id: 4,
      emoji: '🔑',
      title: 'Pegar o Phone ID e o Token',
      content: (
        <div className="space-y-4 text-sm text-text-primary">
          <div>
            <p className="font-semibold mb-1">Phone ID:</p>
            <ol className="space-y-1">
              <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Vá em <strong>WhatsApp → API Setup</strong></li>
              <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Copie o <strong>Phone number ID</strong> (é um número longo, não é o seu telefone)</li>
              <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Cole no campo <strong>Phone ID</strong> na página de Ajustes</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold mb-1">Token de acesso:</p>
            <ol className="space-y-1">
              <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Na mesma página (API Setup), copie o <strong>Temporary access token</strong></li>
              <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Cole no campo <strong>Token de acesso</strong> nos Ajustes</li>
            </ol>
            <Warning>O token temporário expira em 24h. Após testar e confirmar que funciona, siga o Passo 6 para gerar um token permanente.</Warning>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      emoji: '🔗',
      title: 'Configurar o webhook',
      content: (
        <div className="space-y-3 text-sm text-text-primary">
          <p>O webhook é o endereço que o WhatsApp usa para enviar as respostas dos seus pacientes para o app.</p>
          <ol className="space-y-2">
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Vá em <strong>WhatsApp → Configuration</strong></li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Clique em <strong>Edit</strong> no campo Webhook</li>
            <li className="flex gap-2 flex-col">
              <span className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Cole esta URL no campo <strong>Callback URL:</strong></span>
              {webhookUrl && <CopyButton value={webhookUrl} label="Copiar" />}
            </li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">4.</span>No campo <strong>Verify Token</strong>, coloque qualquer palavra secreta (ex: <code className="bg-gray-100 px-1 rounded">gabi2026</code>) e anote ela</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">5.</span>Clique em <strong>Verify and Save</strong></li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">6.</span>Após verificar, clique em <strong>Manage</strong> e ative o campo <strong>messages</strong></li>
          </ol>
          <Tip>Se der erro na verificação, confirme que a URL está exatamente como aparece acima, sem barra no final.</Tip>
        </div>
      ),
    },
    {
      id: 6,
      emoji: '♾️',
      title: 'Token permanente (para não expirar)',
      content: (
        <ol className="space-y-2 text-sm text-text-primary">
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Acesse <strong>business.facebook.com</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Vá em <strong>Configurações → Usuários do sistema</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Clique em <strong>Adicionar</strong> → tipo <strong>Admin</strong> → nome: <code className="bg-gray-100 px-1 rounded">bot-agendamentos</code></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">4.</span>Clique em <strong>Gerar novo token</strong>, selecione o app que você criou</li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">5.</span>Marque as permissões: <strong>whatsapp_business_messaging</strong> e <strong>whatsapp_business_management</strong></li>
          <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">6.</span>Copie o token e cole no campo <strong>Token de acesso</strong> nos Ajustes (substituindo o temporário)</li>
          <Warning>Guarde esse token em lugar seguro — ele só aparece uma vez.</Warning>
        </ol>
      ),
    },
    {
      id: 7,
      emoji: '✅',
      title: 'Testar tudo',
      content: (
        <div className="space-y-3 text-sm text-text-primary">
          <ol className="space-y-2">
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">1.</span>Cadastre um paciente de teste em <strong>Pacientes → Novo paciente</strong></li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">2.</span>Crie um agendamento para esse paciente</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">3.</span>Vá em <strong>Mensagens</strong> e envie uma mensagem manual para ele</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">4.</span>Se ele receber a mensagem no WhatsApp, está tudo funcionando!</li>
            <li className="flex gap-2"><span className="shrink-0 font-bold text-brand-500">5.</span>Peça para ele responder e verifique se a resposta aparece no app</li>
          </ol>
          <Tip>Se a mensagem não chegar, verifique se o Phone ID e o Token estão salvos em Ajustes.</Tip>
          <div className="mt-4 rounded-lg bg-brand-50 border border-brand-100 p-4">
            <p className="font-semibold text-brand-700 mb-2">Problemas comuns</p>
            <div className="space-y-2 text-xs text-text-secondary">
              <div><span className="font-semibold">Mensagem não chega:</span> Phone ID ou Token incorreto nos Ajustes</div>
              <div><span className="font-semibold">Resposta não aparece:</span> Webhook não verificado ou campo "messages" não ativado</div>
              <div><span className="font-semibold">Erro 401:</span> Token expirado — gere o token permanente (Passo 6)</div>
              <div><span className="font-semibold">Paciente não encontrado:</span> Cadastre o número com DDI, ex: <code className="bg-white px-1 rounded">5511999998888</code></div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="pt-8 pb-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/ajustes/tecnico" className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary transition">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Guia de configuração</h1>
          <p className="text-xs text-text-secondary">Referência técnica — WhatsApp Cloud API</p>
        </div>
      </div>

      <p className="text-sm text-text-secondary rounded-lg bg-amber-50 border border-amber-100 p-4">
        Esta página é para quem faz a configuração técnica do sistema, não para o usuário final.
      </p>

      <div className="space-y-2">
        {steps.map((step) => {
          const isOpen = open === step.id
          return (
            <div key={step.id} className="rounded-xl border border-surface-border bg-white overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : step.id)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-surface-page"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-500">
                  {step.id}
                </span>
                <span className="flex-1 text-sm font-semibold text-text-primary">
                  {step.emoji} {step.title}
                </span>
                <span className="text-text-tertiary text-sm">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-surface-border">
                  {step.content}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-text-tertiary">Dúvidas? Entre em contato com o suporte.</p>
      </div>
    </div>
  )
}
