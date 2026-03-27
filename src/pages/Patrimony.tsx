import { useState, useEffect } from 'react'
import { Save, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../hooks/useTheme'
import { formatCurrency } from '../utils/format'
import { cx } from '../utils/cx'
import { useToastContext } from '../hooks/ToastContext'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PatrimonySnapshot } from '../types'

export default function Patrimony() {
  const { investments, emergency, transactions, patrimony, savePatrimonySnapshot, theme } = useStore()
  const { toast } = useToastContext()
  const { isDark } = useTheme()

  // Calculate current values
  const currentInvestments = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0)
  const currentBalance = Math.max(transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0), 0)
  const currentTotal = currentInvestments + emergency.current + currentBalance

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM'),
    investments: currentInvestments.toFixed(2),
    emergency: emergency.current.toFixed(2),
    balance: currentBalance.toFixed(2),
  })

  // Auto-fill when values change
  useEffect(() => {
    setForm(f => ({
      ...f,
      investments: currentInvestments.toFixed(2),
      emergency: emergency.current.toFixed(2),
      balance: currentBalance.toFixed(2),
    }))
  }, [currentInvestments, emergency.current, currentBalance])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const inv = parseFloat(form.investments) || 0
    const emg = parseFloat(form.emergency) || 0
    const bal = parseFloat(form.balance) || 0
    const snap: PatrimonySnapshot = {
      date: form.date,
      investments: inv,
      emergency: emg,
      balance: bal,
      total: inv + emg + bal,
    }
    savePatrimonySnapshot(snap)
    toast('Snapshot salvo!')
  }

  const chartData = patrimony.map(s => ({
    month: format(new Date(s.date + '-01'), 'MMM/yy', { locale: ptBR }),
    Investimentos: s.investments,
    Reserva: s.emergency,
    'Saldo em Conta': s.balance,
    Total: s.total,
  }))

  const latest = patrimony[patrimony.length - 1]
  const previous = patrimony[patrimony.length - 2]
  const growth = latest && previous && previous.total > 0
    ? ((latest.total - previous.total) / previous.total) * 100
    : null

  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#fff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: 8,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${cx.text}`}>Evolução Patrimonial</h2>
        <p className={`text-sm ${cx.subtext}`}>Acompanhe o crescimento do seu patrimônio ao longo do tempo</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Patrimônio Atual</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(currentTotal)}</p>
          {growth !== null && (
            <p className={`text-xs mt-1 ${growth >= 0 ? 'text-green-500' : 'text-red-400'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Investimentos</p>
          <p className="text-xl font-bold text-green-500 mt-1">{formatCurrency(currentInvestments)}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Reserva</p>
          <p className="text-xl font-bold text-yellow-500 mt-1">{formatCurrency(emergency.current)}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Snapshots</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{patrimony.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className={`${cx.card} rounded-xl p-4`}>
        <h3 className={`text-sm font-medium ${cx.subtext} mb-4`}>Evolução do Patrimônio</h3>
        {chartData.length < 2 ? (
          <div className={`flex flex-col items-center justify-center h-48 gap-2 ${cx.subtext}`}>
            <TrendingUp size={32} className="text-gray-300 dark:text-gray-700" />
            <p className="text-sm">Salve pelo menos 2 snapshots para ver o gráfico</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#f3f4f6'} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Total" stroke="#3b82f6" fill="url(#gTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="Investimentos" stroke="#22c55e" fill="url(#gInv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Save snapshot */}
      <div className={`${cx.card} rounded-xl p-5`}>
        <h3 className={`font-semibold ${cx.text} mb-1`}>Registrar Snapshot</h3>
        <p className={`text-sm ${cx.subtext} mb-4`}>Os valores são preenchidos automaticamente. Ajuste se necessário e salve.</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={`text-xs ${cx.subtext} mb-1 block`}>Mês de referência</label>
              <input type="month" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <div>
              <label className={`text-xs ${cx.subtext} mb-1 block`}>Investimentos (R$)</label>
              <input type="number" min="0" step="any" value={form.investments} onChange={e => setForm(f => ({ ...f, investments: e.target.value }))}
                className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <div>
              <label className={`text.xs ${cx.subtext} mb-1 block`}>Reserva (R$)</label>
              <input type="number" min="0" step="any" value={form.emergency} onChange={e => setForm(f => ({ ...f, emergency: e.target.value }))}
                className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <div>
              <label className={`text-xs ${cx.subtext} mb-1 block`}>Saldo em conta (R$)</label>
              <input type="number" min="0" step="any" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
                className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Save size={14} /> Salvar Snapshot
            </button>
            <p className={`text-sm ${cx.subtext}`}>
              Total: <span className="font-semibold text-blue-400">{formatCurrency((parseFloat(form.investments) || 0) + (parseFloat(form.emergency) || 0) + (parseFloat(form.balance) || 0))}</span>
            </p>
          </div>
        </form>
      </div>

      {/* History table */}
      {patrimony.length > 0 && (
        <div className={`${cx.card} rounded-xl overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className={`border-b ${cx.divider}`}>
                <th className={`text-left p-3 ${cx.th}`}>Mês</th>
                <th className={`text-right p-3 ${cx.th}`}>Investimentos</th>
                <th className={`text-right p-3 ${cx.th}`}>Reserva</th>
                <th className={`text-right p-3 ${cx.th}`}>Saldo</th>
                <th className={`text-right p-3 ${cx.th}`}>Total</th>
                <th className={`text-right p-3 ${cx.th}`}>Variação</th>
              </tr>
            </thead>
            <tbody>
              {[...patrimony].reverse().map((s, i, arr) => {
                const prev = arr[i + 1]
                const diff = prev ? ((s.total - prev.total) / prev.total) * 100 : null
                return (
                  <tr key={s.date} className={cx.tableRow}>
                    <td className={`p-3 text-sm font-medium ${cx.text}`}>
                      {format(new Date(s.date + '-01'), 'MMMM yyyy', { locale: ptBR })}
                    </td>
                    <td className={`p-3 text-sm text-right ${cx.subtext}`}>{formatCurrency(s.investments)}</td>
                    <td className={`p-3 text-sm text-right ${cx.subtext}`}>{formatCurrency(s.emergency)}</td>
                    <td className={`p-3 text-sm text-right ${cx.subtext}`}>{formatCurrency(s.balance)}</td>
                    <td className={`p-3 text-sm text-right font-semibold text-blue-400`}>{formatCurrency(s.total)}</td>
                    <td className="p-3 text-sm text-right">
                      {diff !== null ? (
                        <span className={diff >= 0 ? 'text-green-500' : 'text-red-400'}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      ) : <span className={cx.subtext}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
