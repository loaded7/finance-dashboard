import { useState } from 'react'
import { Plus, Trash2, Eye } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatCurrency, generateId, investmentTypeLabels } from '../utils/format'
import { cx } from '../utils/cx'
import type { WatchlistItem, InvestmentType } from '../types'

const types: InvestmentType[] = ['acoes', 'fiis', 'cripto', 'renda-fixa', 'outros']
const emptyForm: Omit<WatchlistItem, 'id' | 'addedAt'> = { name: '', ticker: '', type: 'acoes', targetPrice: undefined, notes: '' }

export default function Watchlist() {
  const { watchlist, addWatchlistItem, removeWatchlistItem } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Omit<WatchlistItem, 'id' | 'addedAt'>>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addWatchlistItem({ ...form, id: generateId(), addedAt: new Date().toISOString() })
    setShowModal(false)
    setForm(emptyForm)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${cx.text}`}>Watchlist</h2>
          <p className={`text-sm ${cx.subtext}`}>Ativos que você está de olho</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Adicionar
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div className={`${cx.card} rounded-xl p-12 text-center`}>
          <Eye size={32} className="text-gray-400 mx-auto mb-3" />
          <p className={cx.subtext}>Nenhum ativo na watchlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map(item => (
            <div key={item.id} className={`${cx.card} rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`font-semibold ${cx.text}`}>{item.ticker}</p>
                  <p className={`text-sm ${cx.subtext}`}>{item.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{investmentTypeLabels[item.type]}</span>
                  <button onClick={() => setDeleteId(item.id)} className={`${cx.subtext} hover:text-red-400 transition-colors`}><Trash2 size={14} /></button>
                </div>
              </div>
              {item.targetPrice && (
                <div className="mb-2">
                  <span className={`text-xs ${cx.subtext}`}>Preço alvo: </span>
                  <span className="text-sm text-yellow-500 font-medium">{formatCurrency(item.targetPrice)}</span>
                </div>
              )}
              {item.notes && <p className={`text-xs ${cx.subtext} bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mt-2`}>{item.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Adicionar à Watchlist" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              <input required placeholder="Ticker" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))} className={`${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as InvestmentType }))} className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`}>
              {types.map(t => <option key={t} value={t}>{investmentTypeLabels[t]}</option>)}
            </select>
            <input type="number" min="0" step="any" placeholder="Preço alvo (opcional)" value={form.targetPrice || ''} onChange={e => setForm(f => ({ ...f, targetPrice: parseFloat(e.target.value) || undefined }))} className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            <textarea placeholder="Notas / motivo do interesse" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none h-24`} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Adicionar</button>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog message="Remover da watchlist?" onConfirm={() => { removeWatchlistItem(deleteId); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
