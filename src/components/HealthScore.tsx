import { useStore } from '../store/useStore'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-gray-400">{value.toFixed(0)}/{max} pts</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function HealthScore() {
  const { transactions, investments, emergency, goals } = useStore()
  const now = new Date()
  const monthT = transactions.filter(t => isWithinInterval(new Date(t.date), { start: startOfMonth(now), end: endOfMonth(now) }))
  const income = monthT.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthT.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

  const savingsScore = Math.min(savingsRate / 20 * 25, 25)
  const emergencyScore = emergency.target > 0 ? Math.min((emergency.current / emergency.target) * 25, 25) : 0
  const investmentScore = Math.min(investments.length * 5, 25)
  const goalsScore = goals.length > 0 ? Math.min(goals.filter(g => g.currentAmount / g.targetAmount >= 0.5).length / goals.length * 25, 25) : 0
  const total = Math.round(savingsScore + emergencyScore + investmentScore + goalsScore)

  const getLabel = () => {
    if (total >= 80) return { text: 'Excelente', color: 'text-green-500' }
    if (total >= 60) return { text: 'Bom', color: 'text-blue-500' }
    if (total >= 40) return { text: 'Regular', color: 'text-yellow-500' }
    return { text: 'Atenção', color: 'text-red-400' }
  }
  const label = getLabel()

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saúde Financeira</h3>
        <div className="text-right">
          <span className={`text-2xl font-bold ${label.color}`}>{total}</span>
          <span className="text-gray-400 text-sm">/100</span>
          <p className={`text-xs ${label.color}`}>{label.text}</p>
        </div>
      </div>
      <div className="space-y-3">
        <ScoreBar label="Taxa de poupança" value={savingsScore} max={25} color="bg-green-500" />
        <ScoreBar label="Reserva de emergência" value={emergencyScore} max={25} color="bg-blue-500" />
        <ScoreBar label="Diversificação" value={investmentScore} max={25} color="bg-purple-500" />
        <ScoreBar label="Metas em andamento" value={goalsScore} max={25} color="bg-yellow-500" />
      </div>
    </div>
  )
}
