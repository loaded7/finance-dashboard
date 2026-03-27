import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Eye, Target, Shield, BarChart2
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/investments', label: 'Carteira', icon: TrendingUp },
  { to: '/watchlist', label: 'Watchlist', icon: Eye },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/emergency', label: 'Reserva', icon: Shield },
  { to: '/reports', label: 'Relatórios', icon: BarChart2 },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-3 gap-1 fixed h-full">
        <div className="px-3 mb-6">
          <h1 className="text-lg font-bold text-green-400">💰 FinDash</h1>
          <p className="text-xs text-gray-500">Controle Financeiro</p>
        </div>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-500/20 text-green-400 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="ml-56 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
