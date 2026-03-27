import { useState } from 'react'
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import { formatCurrency, generateId, categoryLabels } from '../utils/format'
import { cx } from '../utils/cx'
import type { TransactionCategory } from '../types'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const expenseCategories: TransactionCategory[] = ['alimentacao', 'moradia', 'transporte', 'saude', 'educacao', 'lazer', 'outros']

export default function BudgetPage() {
  const { budgets, addBudget, removeBudget, transactions } = useStore()
  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<{ category: TransactionCategory; limit: string }>({ category: 'alimentacao', limit: '' })

  const monthBudgets = budgets.filter(b => b.month === selectedMonth)

  const getSpent = (category: TransactionCategory) => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const start = startOfMonth(new Date(year, month - 1))
    const end = endOfMonth(new Date(year, month - 1))
    return transactions.filter(t => t.type === 'expense' && t.category === category && isWithinInterval(new Date(t.date), { start, end })).reduce((s, t) => s + t.amount, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addBudget({ id: generateId(), category: form.category, limit: parseFloat(form.limit) || 0, month: selectedMonth })
    setShowModal(false)
    setForm({ category: 'alimentacao', limit: '' })
  }

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy', { locale: ptBR }) }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${cx.text}`}>Orçamento Mensal</h2>
          <p className={`text-sm ${cx.subtext}`}>Defina limites por categoria</p>
        </div>
        <div className="flex gap-3">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus size={16} /> Novo Orçamento
          </button>
        </div>
      </div>

      {monthBudgets.length === 0 ? (
        <div className={`${cx.card} rounded-xl p-12 text-center`}><p className={cx.subtext}>Nenhum orçamento definido para este mês</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monthBudgets.map(b => {
            const spent = getSpent(b.category)
            const pct = Math.min((spent / b.limit) * 100, 100)
            const isOver = spent > b.limit
            const isWarning = pct >= 80 && !isOver
            return (
              <div key={b.id} className={`${cx.card} rounded-xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isOver ? <AlertTriangle size={16} className="text-red-400" /> : isWarning ? <AlertTriangle size={16} className="text-yellow-500" /> : <CheckCircle size={16} className="text-green-500" />}
                    <span className={`font-medium ${cx.text}`}>{categoryLabels[b.category]}</span>
                  </div>
                  <button onClick={() => removeBudget(b.id)} className={`${cx.subtext} hover:text-red-400 transition-colors`}><Trash2 size={14} /></button>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isOver ? 'text-red-400' : cx.subtext}>{formatCurrency(spent)} gastos</span>
                  <span className={cx.subtext}>limite: {formatCurrency(b.limit)}</span>
                </div>
                {isOver && <p className="text-xs text-red-400 mt-1">Excedeu em {formatCurrency(spent - b.limit)}</p>}
                {isWarning && <p className="text-xs text-yellow-500 mt-1">{(100 - pct).toFixed(0)}% do limite restante</p>}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Novo Orçamento" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}
              className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`}>
              {expenseCategories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
            <input required type="number" min="1" step="any" placeholder="Limite (R$)" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
              className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Salvar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
