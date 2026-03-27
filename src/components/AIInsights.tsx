import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getFinancialInsights } from '../services/ai'
import { formatCurrency, categoryLabels } from '../utils/format'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export default function AIInsights() {
  const { transactions, investments, goals, emergency, budgets } = useStore()
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateInsights = async () => {
    setLoading(true)
    setError('')
    try {
      const now = new Date()
      const monthT = transactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: startOfMonth(now), end: endOfMonth(now) })
      )
      const income = monthT.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = monthT.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : '0'

      const expByCategory: Record<string, number> = {}
      monthT.filter(t => t.type === 'expense').forEach(t => {
        expByCategory[t.category] = (expByCategory[t.category] || 0) + t.amount
      })

      const portfolioTotal = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0)
      const portfolioCost = investments.reduce((s, i) => s + i.avgPrice * i.quantity, 0)
      const portfolioGain = portfolioTotal > 0 ? ((portfolioTotal - portfolioCost) / portfolioCost * 100).toFixed(1) : '0'

      const emergencyPct = emergency.target > 0 ? (emergency.current / emergency.target * 100).toFixed(0) : '0'

      const context = `
Dados financeiros do usuário:

MÊS ATUAL:
- Receitas: ${formatCurrency(income)}
- Despesas: ${formatCurrency(expense)}
- Taxa de poupança: ${savingsRate}%
- Gastos por categoria: ${Object.entries(expByCategory).map(([k, v]) => `${categoryLabels[k]}: ${formatCurrency(v)}`).join(', ')}

CARTEIRA:
- Patrimônio total: ${formatCurrency(portfolioTotal)}
- Rentabilidade: ${portfolioGain}%
- Número de ativos: ${investments.length}

RESERVA DE EMERGÊNCIA:
- Progresso: ${emergencyPct}% da meta (${formatCurrency(emergency.current)} de ${formatCurrency(emergency.target)})

METAS:
- Total: ${goals.length}
- Concluídas: ${goals.filter(g => g.currentAmount >= g.targetAmount).length}
- Em andamento: ${goals.filter(g => g.currentAmount < g.targetAmount).length}

ORÇAMENTOS ESTOURADOS ESTE MÊS:
${budgets.filter(b => {
  const spent = monthT.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0)
  return spent > b.limit
}).map(b => `- ${categoryLabels[b.category]}`).join('\n') || '- Nenhum'}
      `.trim()

      const result = await getFinancialInsights(context)
      setInsights(result.split('\n').filter(l => l.trim()))
    } catch {
      setError('Não foi possível gerar insights. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-500" />
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Insights de IA</h3>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analisando...' : insights.length > 0 ? 'Atualizar' : 'Gerar insights'}
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {insights.length === 0 && !loading && !error && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Clique em "Gerar insights" para receber uma análise personalizada das suas finanças.
        </p>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${70 + i * 10}%` }} />
          ))}
        </div>
      )}

      {insights.length > 0 && !loading && (
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
