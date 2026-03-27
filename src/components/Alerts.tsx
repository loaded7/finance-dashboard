import { AlertTriangle, Bell, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { formatCurrency, formatDate } from '../utils/format'
import { differenceInDays, parseISO } from 'date-fns'

interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
}

export default function Alerts() {
  const { goals, budgets, transactions, emergency } = useStore()
  const [dismissed, setDismissed] = useState<string[]>([])
  const now = new Date()

  const alerts: Alert[] = []

  // Goals near deadline
  goals.forEach(g => {
    if (!g.deadline) return
    const days = differenceInDays(parseISO(g.deadline), now)
    const pct = g.currentAmount / g.targetAmount
    if (days <= 30 && days >= 0 && pct < 1) {
      alerts.push({
        id: `goal-${g.id}`,
        type: days <= 7 ? 'danger' : 'warning',
        title: `Meta "${g.name}" vence em ${days} dias`,
        message: `Faltam ${formatCurrency(g.targetAmount - g.currentAmount)} para atingir a meta. Prazo: ${formatDate(g.deadline)}`
      })
    }
  })

  // Budgets over 80%
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  budgets.filter(b => b.month === currentMonth).forEach(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0)
    const pct = spent / b.limit
    if (pct >= 1) {
      alerts.push({ id: `budget-over-${b.id}`, type: 'danger', title: `Orçamento estourado`, message: `Categoria excedeu o limite em ${formatCurrency(spent - b.limit)}` })
    } else if (pct >= 0.8) {
      alerts.push({ id: `budget-warn-${b.id}`, type: 'warning', title: `Orçamento quase no limite`, message: `Você usou ${(pct * 100).toFixed(0)}% do orçamento desta categoria` })
    }
  })

  // Emergency fund low
  if (emergency.target > 0 && emergency.current / emergency.target < 0.3) {
    alerts.push({ id: 'emergency-low', type: 'warning', title: 'Reserva de emergência baixa', message: `Você tem apenas ${((emergency.current / emergency.target) * 100).toFixed(0)}% da reserva ideal` })
  }

  const visible = alerts.filter(a => !dismissed.includes(a.id))
  if (visible.length === 0) return null

  const colors = {
    danger: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Bell size={14} />
        <span>{visible.length} alerta{visible.length > 1 ? 's' : ''}</span>
      </div>
      {visible.map(a => (
        <div key={a.id} className={`flex items-start justify-between gap-3 border rounded-xl px-4 py-3 ${colors[a.type]}`}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{a.message}</p>
            </div>
          </div>
          <button onClick={() => setDismissed(p => [...p, a.id])} className="opacity-60 hover:opacity-100 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
