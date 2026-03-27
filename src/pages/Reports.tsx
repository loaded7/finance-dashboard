import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { formatCurrency, categoryLabels } from '../utils/format'
import { cx } from '../utils/cx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Reports() {
  const { transactions, theme } = useStore()
  const isDark = theme === 'dark'
  const now = new Date()
  const tooltipStyle = { backgroundColor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => getYear(new Date(t.date))))
    years.add(getYear(now))
    return Array.from(years).sort((a, b) => b - a)
  }, [transactions])

  const [yearA, setYearA] = useState(getYear(now))
  const [yearB, setYearB] = useState(getYear(now) - 1)

  const monthlyData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(now, 11 - i)
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const filtered = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }))
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { month: format(month, 'MMM/yy', { locale: ptBR }), Receitas: income, Despesas: expense, Saldo: income - expense }
  }), [transactions])

  const annualData = useMemo(() => MONTHS_PT.map((label, i) => {
    const getTotal = (year: number, type: 'income' | 'expense') =>
      transactions.filter(t => getYear(new Date(t.date)) === year && getMonth(new Date(t.date)) === i && t.type === type).reduce((s, t) => s + t.amount, 0)
    return {
      month: label,
      [`${yearA} Receitas`]: getTotal(yearA, 'income'),
      [`${yearA} Despesas`]: getTotal(yearA, 'expense'),
      [`${yearB} Receitas`]: getTotal(yearB, 'income'),
      [`${yearB} Despesas`]: getTotal(yearB, 'expense'),
    }
  }), [transactions, yearA, yearB])

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return Object.entries(map).map(([cat, value]) => ({ name: categoryLabels[cat] || cat, value })).sort((a, b) => b.value - a.value)
  }, [transactions])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${cx.text}`}>Relatórios</h2>
        <p className={`text-sm ${cx.subtext}`}>Visão geral das suas finanças</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={`${cx.card} rounded-xl p-4`}><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Total Receitas</p><p className="text-xl font-bold text-green-500 mt-1">{formatCurrency(totalIncome)}</p></div>
        <div className={`${cx.card} rounded-xl p-4`}><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Total Despesas</p><p className="text-xl font-bold text-red-400 mt-1">{formatCurrency(totalExpense)}</p></div>
        <div className={`${cx.card} rounded-xl p-4`}><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Taxa de Poupança</p><p className={`text-xl font-bold mt-1 ${savingsRate >= 20 ? 'text-green-500' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-400'}`}>{savingsRate.toFixed(1)}%</p></div>
      </div>

      <div className={`${cx.card} rounded-xl p-4`}>
        <h3 className={`text-sm font-medium ${cx.subtext} mb-4`}>Receitas vs Despesas (12 meses)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barGap={4}>
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`${cx.card} rounded-xl p-4`}>
        <h3 className={`text-sm font-medium ${cx.subtext} mb-4`}>Evolução do Saldo (12 meses)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#f3f4f6'} />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annual comparison */}
      <div className={`${cx.card} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-medium ${cx.subtext}`}>Comparativo Anual</h3>
          <div className="flex gap-2">
            <select value={yearA} onChange={e => setYearA(Number(e.target.value))} className={`${cx.input} border rounded-lg px-2 py-1 text-xs focus:outline-none`}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className={`text-xs ${cx.subtext} self-center`}>vs</span>
            <select value={yearB} onChange={e => setYearB(Number(e.target.value))} className={`${cx.input} border rounded-lg px-2 py-1 text-xs focus:outline-none`}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={annualData} barGap={2}>
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={`${yearA} Receitas`} fill="#22c55e" radius={[3, 3, 0, 0]} />
            <Bar dataKey={`${yearA} Despesas`} fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey={`${yearB} Receitas`} fill="#86efac" radius={[3, 3, 0, 0]} />
            <Bar dataKey={`${yearB} Despesas`} fill="#fca5a5" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`${cx.card} rounded-xl p-4`}>
        <h3 className={`text-sm font-medium ${cx.subtext} mb-4`}>Despesas por Categoria (total)</h3>
        {categoryData.length === 0 ? <p className={`${cx.subtext} text-sm`}>Nenhuma despesa registrada</p> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical" barSize={20}>
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
