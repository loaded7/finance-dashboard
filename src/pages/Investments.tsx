import { useState } from 'react'
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown, DollarSign, History, RefreshCw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../hooks/useTheme'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, generateId, investmentTypeLabels } from '../utils/format'
import type { Investment, InvestmentType, InvestmentHistory } from '../types'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchQuotes } from '../services/quotes'
import { useToastContext } from '../hooks/ToastContext'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
const types: InvestmentType[] = ['acoes', 'fiis', 'cripto', 'renda-fixa', 'outros']
const emptyForm: Omit<Investment, 'id'> = { name: '', ticker: '', type: 'acoes', quantity: 0, avgPrice: 0, currentPrice: 0, notes: '', dividends: [], history: [] }
const inputCls = 'w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500'

export default function Investments() {
  const { investments, addInvestment, removeInvestment, updateInvestment } = useStore()
  const { toast } = useToastContext()
  const { isDark } = useTheme()
  const tooltipStyle = { backgroundColor: isDark ? '#111827' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, borderRadius: 8, color: isDark ? '#f9fafb' : '#111827' }
  const [loadingQuotes, setLoadingQuotes] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)
  const [form, setForm] = useState<Omit<Investment, 'id'>>(emptyForm)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [showDividend, setShowDividend] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [divForm, setDivForm] = useState({ amount: '', date: new Date().toISOString().slice(0, 10) })
  const [histForm, setHistForm] = useState({ quantity: '', price: '', date: new Date().toISOString().slice(0, 10), type: 'buy' as 'buy' | 'sell' })

  const updateQuotes = async () => {
    const tickers = investments.map(i => i.ticker)
    if (!tickers.length) return
    setLoadingQuotes(true)
    try {
      const quotes = await fetchQuotes(tickers)
      quotes.forEach(q => { const inv = investments.find(i => i.ticker === q.ticker); if (inv) updateInvestment({ ...inv, currentPrice: q.price }) })
      toast(`${quotes.length} cotações atualizadas`)
    } catch { toast('Erro ao buscar cotações', 'error') }
    finally { setLoadingQuotes(false) }
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (i: Investment) => { setEditing(i); setForm({ name: i.name, ticker: i.ticker, type: i.type, quantity: i.quantity, avgPrice: i.avgPrice, currentPrice: i.currentPrice, notes: i.notes || '', dividends: i.dividends || [], history: i.history || [] }); setShowModal(true) }
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editing) updateInvestment({ ...form, id: editing.id }); else addInvestment({ ...form, id: generateId() }); setShowModal(false) }

  const detailInvestment = investments.find(i => i.id === detailId)

  const addDividend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!detailInvestment) return
    updateInvestment({ ...detailInvestment, dividends: [...(detailInvestment.dividends || []), { id: generateId(), amount: parseFloat(divForm.amount) || 0, date: divForm.date }] })
    setShowDividend(false); setDivForm({ amount: '', date: new Date().toISOString().slice(0, 10) })
  }

  const addHistoryEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!detailInvestment) return
    const entry: InvestmentHistory = { id: generateId(), quantity: parseFloat(histForm.quantity) || 0, price: parseFloat(histForm.price) || 0, date: histForm.date, type: histForm.type }
    updateInvestment({ ...detailInvestment, history: [...(detailInvestment.history || []), entry] })
    setShowHistory(false); setHistForm({ quantity: '', price: '', date: new Date().toISOString().slice(0, 10), type: 'buy' })
  }

  const totalValue = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0)
  const totalCost = investments.reduce((s, i) => s + i.avgPrice * i.quantity, 0)
  const totalGain = totalValue - totalCost
  const gainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  const totalDividends = investments.reduce((s, i) => s + (i.dividends || []).reduce((d, div) => d + div.amount, 0), 0)
  const byType = types.map(t => ({ name: investmentTypeLabels[t], value: investments.filter(i => i.type === t).reduce((s, i) => s + i.currentPrice * i.quantity, 0) })).filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Carteira de Investimentos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe seus ativos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={updateQuotes} disabled={loadingQuotes}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loadingQuotes ? 'animate-spin' : ''} />
            {loadingQuotes ? 'Atualizando...' : 'Atualizar Cotações'}
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus size={16} /> Novo Ativo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Patrimônio</p><p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(totalValue)}</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Custo Total</p><p className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-100">{formatCurrency(totalCost)}</p></div>
        <div className={`${totalGain >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-xl p-4`}><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resultado</p><p className={`text-xl font-bold mt-1 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} <span className="text-sm">({gainPct.toFixed(2)}%)</span></p></div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dividendos</p><p className="text-xl font-bold text-yellow-400 mt-1">{formatCurrency(totalDividends)}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          {investments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhum ativo cadastrado</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Ativo','Tipo','Qtd','P. Médio','P. Atual','Total','Result.',''].map((h, i) => (
                    <th key={i} className={`p-3 text-xs text-gray-400 dark:text-gray-500 uppercase ${i >= 2 && i <= 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investments.map(i => {
                  const total = i.currentPrice * i.quantity
                  const cost = i.avgPrice * i.quantity
                  const gain = total - cost
                  const pct = cost > 0 ? (gain / cost) * 100 : 0
                  return (
                    <tr key={i.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-3"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{i.ticker}</p><p className="text-xs text-gray-400">{i.name}</p></td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{investmentTypeLabels[i.type]}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-gray-100 text-right">{i.quantity % 1 === 0 ? i.quantity : i.quantity.toFixed(8).replace(/\.?0+$/, '')}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-gray-100 text-right">{formatCurrency(i.avgPrice)}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-gray-100 text-right">{formatCurrency(i.currentPrice)}</td>
                      <td className="p-3 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{formatCurrency(total)}</td>
                      <td className="p-3 text-right"><div className={`flex items-center justify-end gap-1 text-sm ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>{gain >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{pct.toFixed(2)}%</div></td>
                      <td className="p-3"><div className="flex gap-1 justify-end">
                        <button onClick={() => setDetailId(i.id)} className="text-gray-400 hover:text-yellow-400 transition-colors"><DollarSign size={14} /></button>
                        <button onClick={() => openEdit(i)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => removeInvestment(i.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Alocação por Tipo</h3>
          {byType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {byType.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Sem dados</div>}
        </div>
      </div>

      {detailInvestment && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{detailInvestment.ticker} — Detalhes</h3>
            <button onClick={() => setDetailId(null)} className="text-sm text-gray-400 hover:text-red-400">Fechar</button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dividendos Recebidos</h4>
                <button onClick={() => setShowDividend(true)} className="text-xs text-green-500 hover:text-green-400 flex items-center gap-1"><Plus size={12} /> Adicionar</button>
              </div>
              {!(detailInvestment.dividends || []).length ? <p className="text-sm text-gray-400">Nenhum dividendo</p> : (
                <div className="space-y-1">
                  {(detailInvestment.dividends || []).map(d => <div key={d.id} className="flex justify-between text-sm"><span className="text-gray-400">{formatDate(d.date)}</span><span className="text-yellow-400">{formatCurrency(d.amount)}</span></div>)}
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-100 dark:border-gray-700"><span className="text-gray-400">Total</span><span className="text-yellow-400">{formatCurrency((detailInvestment.dividends || []).reduce((s, d) => s + d.amount, 0))}</span></div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Histórico de Aportes</h4>
                <button onClick={() => setShowHistory(true)} className="text-xs text-green-500 hover:text-green-400 flex items-center gap-1"><History size={12} /> Adicionar</button>
              </div>
              {!(detailInvestment.history || []).length ? <p className="text-sm text-gray-400">Nenhum aporte</p> : (
                <div className="space-y-1">
                  {(detailInvestment.history || []).map(h => <div key={h.id} className="flex justify-between text-sm"><span className="text-gray-400">{formatDate(h.date)} — {h.type === 'buy' ? 'Compra' : 'Venda'} {h.quantity}x</span><span className={h.type === 'buy' ? 'text-green-400' : 'text-red-400'}>{formatCurrency(h.price)}</span></div>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDividend && (
        <Modal title="Registrar Dividendo" onClose={() => setShowDividend(false)}>
          <form onSubmit={addDividend} className="space-y-3">
            <input required type="number" min="0.01" step="any" placeholder="Valor (R$)" value={divForm.amount} onChange={e => setDivForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} />
            <input required type="date" value={divForm.date} onChange={e => setDivForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Salvar</button>
          </form>
        </Modal>
      )}

      {showHistory && (
        <Modal title="Registrar Aporte" onClose={() => setShowHistory(false)}>
          <form onSubmit={addHistoryEntry} className="space-y-3">
            <div className="flex gap-2">
              {(['buy', 'sell'] as const).map(t => (
                <button key={t} type="button" onClick={() => setHistForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${histForm.type === t ? (t === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {t === 'buy' ? 'Compra' : 'Venda'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0" step="any" placeholder="Quantidade" value={histForm.quantity} onChange={e => setHistForm(f => ({ ...f, quantity: e.target.value }))} className={inputCls} />
              <input required type="number" min="0" step="any" placeholder="Preço unitário" value={histForm.price} onChange={e => setHistForm(f => ({ ...f, price: e.target.value }))} className={inputCls} />
            </div>
            <input required type="date" value={histForm.date} onChange={e => setHistForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Salvar</button>
          </form>
        </Modal>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Ativo' : 'Novo Ativo'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              <input required placeholder="Ticker" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))} className={inputCls} />
            </div>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as InvestmentType }))} className={inputCls}>
              {types.map(t => <option key={t} value={t}>{investmentTypeLabels[t]}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-3">
              <input required type="number" min="0" step="any" placeholder="Quantidade" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} className={inputCls} />
              <input required type="number" min="0" step="any" placeholder="Preço Médio" value={form.avgPrice || ''} onChange={e => setForm(f => ({ ...f, avgPrice: parseFloat(e.target.value) || 0 }))} className={inputCls} />
              <input required type="number" min="0" step="any" placeholder="Preço Atual" value={form.currentPrice || ''} onChange={e => setForm(f => ({ ...f, currentPrice: parseFloat(e.target.value) || 0 }))} className={inputCls} />
            </div>
            <textarea placeholder="Notas (opcional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`${inputCls} resize-none h-20`} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">{editing ? 'Salvar' : 'Adicionar'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
