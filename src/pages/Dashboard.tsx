import { useMemo, useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useStore } from '../store/useStore'
import { useTheme } from '../hooks/useTheme'
import StatCard from '../components/StatCard'
import HealthScore from '../components/HealthScore'
import AIInsights from '../components/AIInsights'
import Alerts from '../components/Alerts'
import { SkeletonCard, SkeletonChart } from '../components/Skeleton'
import { formatCurrency, categoryLabels } from '../utils/format'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function Dashboard() {
  const { transactions, investments, goals } = useStore()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t) }, [])
  const { isDark } = useTheme()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const prevStart = startOfMonth(subMonths(now, 1))
  const prevEnd = endOfMonth(subMonths(now, 1))

  const monthTransactions = transactions.filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd }))
  const prevTransactions = transactions.filter(t => isWithinInterval(new Date(t.date), { start: prevStart, end: prevEnd }))

  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const prevIncome = prevTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const prevExpense = prevTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthBalance = monthIncome - monthExpense
  const portfolioTotal = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0)
  const portfolioCost = investments.reduce((s, i) => s + i.avgPrice * i.quantity, 0)
  const portfolioGain = portfolioTotal - portfolioCost
  const incomeDiff = prevIncome > 0 ? ((monthIncome - prevIncome) / prevIncome * 100) : 0
  const expenseDiff = prevExpense > 0 ? ((monthExpense - prevExpense) / prevExpense * 100) : 0

  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i)
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const filtered = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }))
    return {
      month: format(month, 'MMM', { locale: ptBR }),
      Receitas: filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      Despesas: filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  }), [transactions])

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    monthTransactions.filter(t => t.type === 'expense').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount })
    return Object.entries(map).map(([cat, value]) => ({ name: categoryLabels[cat] || cat, value }))
  }, [monthTransactions])

  const tooltipStyle = { backgroundColor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, color: isDark ? '#f9fafb' : '#111827' }

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2"><SkeletonChart /></div><SkeletonChart /></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{format(now, "MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receitas do Mês" value={formatCurrency(monthIncome)} subtitle={prevIncome > 0 ? `${incomeDiff >= 0 ? '+' : ''}${incomeDiff.toFixed(1)}% vs mês anterior` : undefined} color="green" icon={<TrendingUp size={16} />} />
        <StatCard title="Despesas do Mês" value={formatCurrency(monthExpense)} subtitle={prevExpense > 0 ? `${expenseDiff >= 0 ? '+' : ''}${expenseDiff.toFixed(1)}% vs mês anterior` : undefined} color="red" icon={<TrendingDown size={16} />} />
        <StatCard title="Saldo do Mês" value={formatCurrency(monthBalance)} color={monthBalance >= 0 ? 'green' : 'red'} icon={<Wallet size={16} />} />
        <StatCard title="Carteira" value={formatCurrency(portfolioTotal)} subtitle={`${portfolioGain >= 0 ? '+' : ''}${formatCurrency(portfolioGain)}`} color="blue" icon={<PiggyBank size={16} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Receitas vs Despesas (6 meses)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="Receitas" stroke="#22c55e" fill="url(#colorIncome)" strokeWidth={2} />
              <Area type="monotone" dataKey="Despesas" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Gastos por Categoria</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sem despesas este mês</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Últimas Transações</h3>
          {transactions.slice(0, 5).length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma transação ainda</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{t.description}</p>
                    <p className="text-xs text-gray-400">{categoryLabels[t.category]}</p>
                  </div>
                  <span className={`text-sm font-medium ${t.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Metas Financeiras</h3>
          {goals.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma meta cadastrada</p>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 4).map(g => {
                const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-800 dark:text-gray-200">{g.name}</span>
                      <span className="text-gray-400">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <HealthScore />
      </div>

      <AIInsights />
      <Alerts />
    </div>
  )
}
