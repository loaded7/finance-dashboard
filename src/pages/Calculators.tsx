import { useState, useMemo } from 'react'
import { Calculator, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../utils/format'
import { useStore } from '../store/useStore'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cx } from '../utils/cx'

export default function Calculators() {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [ci, setCi] = useState({ initial: '', monthly: '', rate: '', years: '' })
  const [ret, setRet] = useState({ current: '', monthly: '', rate: '', targetAge: '', currentAge: '' })

  const tooltipStyle = { backgroundColor: isDark ? '#111827' : '#fff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8 }

  const ciResult = useMemo(() => {
    const P = parseFloat(ci.initial) || 0
    const PMT = parseFloat(ci.monthly) || 0
    const r = (parseFloat(ci.rate) || 0) / 100 / 12
    const n = (parseFloat(ci.years) || 0) * 12
    if (n === 0) return null
    const data = []
    let balance = P
    for (let i = 1; i <= n; i++) {
      balance = balance * (1 + r) + PMT
      if (i % 12 === 0) data.push({ year: `Ano ${i / 12}`, Patrimônio: Math.round(balance), Investido: Math.round(P + PMT * i) })
    }
    const totalInvested = P + PMT * n
    return { finalBalance: balance, totalInvested, gain: balance - totalInvested, data }
  }, [ci])

  const retResult = useMemo(() => {
    const current = parseFloat(ret.current) || 0
    const monthly = parseFloat(ret.monthly) || 0
    const rate = (parseFloat(ret.rate) || 0) / 100 / 12
    const years = (parseFloat(ret.targetAge) || 0) - (parseFloat(ret.currentAge) || 0)
    const n = years * 12
    if (n <= 0) return null
    const data = []
    let balance = current
    for (let i = 1; i <= n; i++) {
      balance = balance * (1 + rate) + monthly
      if (i % 12 === 0) data.push({ year: `Ano ${i / 12}`, Patrimônio: Math.round(balance) })
    }
    return { finalBalance: balance, years, data }
  }, [ret])

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${cx.text}`}>Calculadoras</h2>
        <p className={`text-sm ${cx.subtext}`}>Simule investimentos e aposentadoria</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cx.card} rounded-xl p-5 space-y-4`}>
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-green-500" />
            <h3 className={`font-semibold ${cx.text}`}>Juros Compostos</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Valor inicial (R$)', 'initial', '10000'], ['Aporte mensal (R$)', 'monthly', '500'], ['Taxa anual (%)', 'rate', '12'], ['Período (anos)', 'years', '10']].map(([label, key, ph]) => (
              <div key={key}>
                <label className={`text-xs ${cx.subtext} mb-1 block`}>{label}</label>
                <input type="number" min="0" step="any" placeholder={ph} value={ci[key as keyof typeof ci]}
                  onChange={e => setCi(f => ({ ...f, [key]: e.target.value }))}
                  className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              </div>
            ))}
          </div>
          {ciResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className={`text-xs ${cx.subtext}`}>Patrimônio final</p><p className="text-sm font-bold text-green-500">{formatCurrency(ciResult.finalBalance)}</p></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className={`text-xs ${cx.subtext}`}>Total investido</p><p className={`text-sm font-bold ${cx.text}`}>{formatCurrency(ciResult.totalInvested)}</p></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className={`text-xs ${cx.subtext}`}>Rendimento</p><p className="text-sm font-bold text-blue-400">{formatCurrency(ciResult.gain)}</p></div>
              </div>
              {ciResult.data.length > 0 && (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={ciResult.data}>
                    <defs>
                      <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    </defs>
                    <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="Patrimônio" stroke="#22c55e" fill="url(#gP)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Investido" stroke="#3b82f6" fill="url(#gI)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        <div className={`${cx.card} rounded-xl p-5 space-y-4`}>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            <h3 className={`font-semibold ${cx.text}`}>Simulador de Aposentadoria</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Patrimônio atual (R$)', 'current', '50000'], ['Aporte mensal (R$)', 'monthly', '1000'], ['Taxa anual (%)', 'rate', '10']].map(([label, key, ph]) => (
              <div key={key}>
                <label className={`text-xs ${cx.subtext} mb-1 block`}>{label}</label>
                <input type="number" min="0" step="any" placeholder={ph} value={ret[key as keyof typeof ret]}
                  onChange={e => setRet(f => ({ ...f, [key]: e.target.value }))}
                  className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              {[['Idade atual', 'currentAge', '30'], ['Aposentar aos', 'targetAge', '60']].map(([label, key, ph]) => (
                <div key={key}>
                  <label className={`text-xs ${cx.subtext} mb-1 block`}>{label}</label>
                  <input type="number" min="1" max="100" placeholder={ph} value={ret[key as keyof typeof ret]}
                    onChange={e => setRet(f => ({ ...f, [key]: e.target.value }))}
                    className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
                </div>
              ))}
            </div>
          </div>
          {retResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className={`text-xs ${cx.subtext}`}>Patrimônio na aposentadoria</p><p className="text-sm font-bold text-blue-400">{formatCurrency(retResult.finalBalance)}</p></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"><p className={`text-xs ${cx.subtext}`}>Renda mensal estimada (4%)</p><p className="text-sm font-bold text-green-500">{formatCurrency(retResult.finalBalance * 0.04 / 12)}</p></div>
              </div>
              {retResult.data.length > 0 && (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={retResult.data}>
                    <defs><linearGradient id="gRet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="Patrimônio" stroke="#3b82f6" fill="url(#gRet)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
