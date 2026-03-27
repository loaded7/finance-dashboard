import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Eye, Target, Shield, BarChart2,
  RefreshCw, Wallet, Sun, Moon, Calculator, StickyNote, CreditCard, TrendingDown,
  Settings, Menu, X
} from 'lucide-react'
import { useStore } from '../store/useStore'
import FloatingChat from './FloatingChat'
import Onboarding from './Onboarding'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/investments', label: 'Carteira', icon: TrendingUp },
  { to: '/watchlist', label: 'Watchlist', icon: Eye },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/budget', label: 'Orçamento', icon: Wallet },
  { to: '/recurring', label: 'Recorrências', icon: RefreshCw },
  { to: '/emergency', label: 'Reserva', icon: Shield },
  { to: '/reports', label: 'Relatórios', icon: BarChart2 },
  { to: '/calculators', label: 'Calculadoras', icon: Calculator },
  { to: '/notes', label: 'Notas', icon: StickyNote },
  { to: '/debts', label: 'Dívidas', icon: CreditCard },
  { to: '/cashflow', label: 'Fluxo de Caixa', icon: TrendingDown },
  { to: '/patrimony', label: 'Patrimônio', icon: TrendingUp },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { theme, setTheme } = useStore()
  const isDark = theme === 'dark'

  return (
    <div className="flex flex-col h-full py-6 px-3 gap-1">
      <div className="px-3 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-green-500">💰 FinDash</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Controle Financeiro</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                ? 'bg-green-500/20 text-green-500 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
      <div className="px-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('fd_onboarded'))

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col fixed h-full overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-50">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-gray-500 dark:text-gray-400">
          <Menu size={20} />
        </button>
        <span className="font-bold text-green-500">💰 FinDash</span>
      </div>

      {/* Main content */}
      <main className="lg:ml-56 flex-1 p-4 lg:p-6 pt-16 lg:pt-6">
        <Outlet />
      </main>

      <FloatingChat />

      {showOnboarding && (
        <Onboarding onDone={() => { localStorage.setItem('fd_onboarded', '1'); setShowOnboarding(false) }} />
      )}
    </div>
  )
}
