import { NavBar } from '@/components/ui/nav-bar'
import { FloatingChat } from '@/components/floating-chat'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-page pb-20">
      <main className="mx-auto max-w-lg px-4">
        {children}
      </main>
      <NavBar />
      <FloatingChat />
    </div>
  )
}
