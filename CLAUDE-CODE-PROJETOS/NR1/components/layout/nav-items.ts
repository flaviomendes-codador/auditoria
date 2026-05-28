import {
  LayoutDashboard,
  ShieldAlert,
  ClipboardList,
  Brain,
  FolderOpen,
  GitBranch,
  FileText,
  ScrollText,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Perfil = 'rh_operacional' | 'gestor' | 'responsavel_tecnico' | 'admin'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  profiles?: Perfil[]  // undefined = visível para todos
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Visão Geral',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Conformidade',
    items: [
      { label: 'Inventário de Riscos', href: '/riscos', icon: ShieldAlert },
      { label: 'Plano de Ação', href: '/acoes', icon: ClipboardList },
      {
        label: 'Riscos Psicossociais',
        href: '/psicossociais',
        icon: Brain,
        profiles: ['rh_operacional', 'responsavel_tecnico', 'admin'],
      },
    ],
  },
  {
    label: 'Documentos',
    items: [
      { label: 'Repositório', href: '/documentos', icon: FolderOpen },
    ],
  },
  {
    label: 'Gestão',
    items: [
      {
        label: 'Workflow',
        href: '/workflow',
        icon: GitBranch,
        profiles: ['responsavel_tecnico', 'admin'],
      },
      { label: 'Gerar PGR', href: '/pgr', icon: FileText },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Trilha de Auditoria',
        href: '/auditoria',
        icon: ScrollText,
        profiles: ['responsavel_tecnico', 'admin'],
      },
      {
        label: 'Agentes IA',
        href: '/ia',
        icon: Sparkles,
        profiles: ['rh_operacional', 'responsavel_tecnico', 'admin'],
      },
    ],
  },
]

export function filterNavGroups(perfil: Perfil): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.profiles || item.profiles.includes(perfil)
    ),
  })).filter((group) => group.items.length > 0)
}
