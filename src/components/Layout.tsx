import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Eye, Target, Shield, BarChart2,
  RefreshCw, Wallet, Sun, Moon, Calculator, StickyNote, CreditCard, TrendingDown, Settings
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

export default function Layout() {
  const { theme, setTheme } = useStore()
  const isDark = theme === 'dark'
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('fd_onboarded'))

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 px-3 gap-1 fixed h-full overflow-y-auto">
        <div className="px-3 mb-4">
          <h1 className="text-lg font-bold text-green-500">💰 FinDash</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Controle Financeiro</p>
        </div>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-500/20 text-green-500 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
        <div className="mt-auto px-3 pt-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-6">
        <Outlet />
      </main>
      <FloatingChat />
      {showOnboarding && (
        <Onboarding onDone={() => { localStorage.setItem('fd_onboarded', '1'); setShowOnboarding(false) }} />
      )}
    </div>
  )
}
