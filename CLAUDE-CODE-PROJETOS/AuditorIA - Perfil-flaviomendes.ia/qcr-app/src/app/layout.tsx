import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Auditoria QCR™ — Flávio Mendes',
  description: 'Identifique em qual etapa do Sistema QCR™ sua empresa está perdendo vendas.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={bricolage.variable}>
        {children}
      </body>
    </html>
  )
}
