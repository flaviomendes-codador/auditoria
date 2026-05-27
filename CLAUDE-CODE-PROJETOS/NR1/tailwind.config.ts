import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── shadcn/ui semantic tokens (HSL CSS variables → Tailwind classes) ──
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        // Estados de conformidade — RESERVADAS (cor = informação, não decoração)
        'state-success':     '#16a34a',
        'state-success-bg':  '#dcfce7',
        'state-warning':     '#d97706',
        'state-warning-bg':  '#fef3c7',
        'state-critical':    '#dc2626',
        'state-critical-bg': '#fee2e2',
        'state-info':        '#2563eb',
        'state-info-bg':     '#dbeafe',
        // Matriz de risco
        'risk-low':      '#65a30d',
        'risk-medium':   '#ca8a04',
        'risk-high':     '#ea580c',
        'risk-critical': '#b91c1c',
        // Marca
        'brand-primary':   '#0f172a',
        'brand-secondary': '#334155',
        'brand-accent':    '#0891b2',
        // Superfícies
        'surface-0': '#ffffff',
        'surface-1': '#f8fafc',
        'surface-2': '#f1f5f9',
        'surface-3': '#e2e8f0',
        'surface-4': '#cbd5e1',
        // Texto
        'text-primary':   '#0f172a',
        'text-secondary': '#475569',
        'text-tertiary':  '#94a3b8',
        'text-on-dark':   '#f8fafc',
        // Camada de IA
        'ai-accent':    '#7c3aed',
        'ai-accent-bg': '#f3e8ff',
        'ai-border':    '#c4b5fd',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'md-fixed': '6px',
        'lg-fixed': '8px',
        'xl': '12px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
      boxShadow: {
        'sm':    '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md':    '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
        'lg':    '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 3px rgba(8, 145, 178, 0.3)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
      },
      width: {
        'sidebar':           '240px',
        'sidebar-collapsed': '64px',
        'drawer-sm':         '480px',
        'drawer-md':         '720px',
        'drawer-lg':         '960px',
      },
      maxWidth: {
        'modal-sm': '480px',
        'modal-md': '640px',
        'modal-lg': '800px',
      },
      height: {
        'topbar':          '56px',
        'row-compact':     '32px',
        'row-default':     '48px',
        'row-comfortable': '64px',
      },
    },
  },
  plugins: [],
}

export default config
