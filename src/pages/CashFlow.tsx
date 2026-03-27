import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/format'
import { cx } from '../utils/cx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import { addMonths, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function loadDebts() { try { return JSON.parse(localStorage.getItem('fd_debts') || '[]') } catch { return [] } }

export default function CashFlow() {
  const { recurring, transactions, theme } = useStore()
  const isDark = theme === 'dark'
  const debts = loadDebts()
  const now = new Date()

  const currentBalance = transactions
    .filter(t => new Date(t.date) >= startOfMonth(now))
    .reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)

  const projection = useMemo(() => {
    const active = recurring.filter(r => r.active)
    const monthlyDebt = debts.reduce((s: number, d: { monthlyPayment: number }) => s + d.monthlyPayment, 0)
    return Array.from({ length: 12 }, (_, i) => {
      const month = addMonths(now, i)
      const income = active.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
      const expense = active.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0) + monthlyDebt
      return { month: format(month, 'MMM/yy', { locale: ptBR }), Receitas: income, Despesas: expense, Saldo: income - expense }
    })
  }, [recurring, debts])

  const totalIncome = projection[0]?.Receitas || 0
  const totalExpense = projection[0]?.Despesas || 0
  const monthlyBalance = totalIncome - totalExpense
  const tooltipStyle = { backgroundColor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${cx.text}`}>Projeção de Fluxo de Caixa</h2>
        <p className={`text-sm ${cx.subtext}`}>Baseado nas suas recorrências e dívidas</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Receita Mensal Fixa</p><p className="text-xl font-bold text-green-500 mt-1">{formatCurrency(totalIncome)}</p></div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Despesa Mensal Fixa</p><p className="text-xl font-bold text-red-400 mt-1">{formatCurrency(totalExpense)}</p></div>
        <div className={`${monthlyBalance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-xl p-4`}><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Saldo Mensal Projetado</p><p className={`text-xl font-bold mt-1 ${monthlyBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(monthlyBalance)}</p></div>
      </div>

      <div className={`${cx.card} rounded-xl p-4`}>
        <h3 className={`text-sm font-medium ${cx.subtext} mb-4`}>Projeção — próximos 12 meses</h3>
        {recurring.filter(r => r.active).length === 0 ? (
          <div className={`flex items-center justify-center h-48 ${cx.subtext} text-sm`}>Cadastre recorrências para ver a projeção</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projection} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0} stroke="#374151" />
              <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className={`${cx.card} rounded-xl p-4`}>
        <h3 className={`text-sm font-medium ${cx.subtext} mb-4`}>Saldo acumulado projetado</h3>
        <div className="space-y-2">
          {projection.map((p, i) => {
            const accumulated = projection.slice(0, i + 1).reduce((s, m) => s + m.Saldo, currentBalance)
            return (
              <div key={i} className={`flex items-center justify-between py-2 border-b ${cx.divider} last:border-0`}>
                <span className={`text-sm ${cx.subtext}`}>{p.month}</span>
                <div className="flex items-center gap-4">
                  <span className={`text-xs ${cx.subtext}`}>Saldo: {formatCurrency(p.Saldo)}</span>
                  <span className={`text-sm font-medium ${accumulated >= 0 ? 'text-green-500' : 'text-red-400'}`}>{formatCurrency(accumulated)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
