import { useState } from 'react'
import { Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import { formatCurrency, generateId, categoryLabels } from '../utils/format'
import { cx } from '../utils/cx'
import type { TransactionCategory, TransactionType } from '../types'

const incomeCategories: TransactionCategory[] = ['salario', 'freelance', 'investimento', 'outros']
const expenseCategories: TransactionCategory[] = ['alimentacao', 'moradia', 'transporte', 'saude', 'educacao', 'lazer', 'outros']
const emptyForm = { type: 'expense' as TransactionType, category: 'moradia' as TransactionCategory, description: '', amount: '', dayOfMonth: '1' }

export default function Recurring() {
  const { recurring, addRecurring, removeRecurring, updateRecurring } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addRecurring({ id: generateId(), type: form.type, category: form.category, description: form.description, amount: parseFloat(form.amount) || 0, dayOfMonth: parseInt(form.dayOfMonth) || 1, active: true })
    setShowModal(false)
    setForm(emptyForm)
  }

  const categories = form.type === 'income' ? incomeCategories : expenseCategories
  const totalMonthly = recurring.filter(r => r.active).reduce((s, r) => r.type === 'income' ? s + r.amount : s - r.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${cx.text}`}>Recorrências</h2>
          <p className={`text-sm ${cx.subtext}`}>Receitas e despesas fixas mensais</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nova Recorrência
        </button>
      </div>

      <div className={`${cx.card} rounded-xl p-4 flex items-center gap-4`}>
        <RefreshCw size={20} className="text-green-500" />
        <div>
          <p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Impacto Mensal Líquido</p>
          <p className={`text-xl font-bold ${totalMonthly >= 0 ? 'text-green-500' : 'text-red-400'}`}>{totalMonthly >= 0 ? '+' : ''}{formatCurrency(totalMonthly)}</p>
        </div>
      </div>

      {recurring.length === 0 ? (
        <div className={`${cx.card} rounded-xl p-12 text-center`}>
          <RefreshCw size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className={cx.subtext}>Nenhuma recorrência cadastrada</p>
        </div>
      ) : (
        <div className={`${cx.card} rounded-xl overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className={`border-b ${cx.divider}`}>
                <th className={`text-left p-3 ${cx.th}`}>Descrição</th>
                <th className={`text-left p-3 ${cx.th}`}>Categoria</th>
                <th className={`text-left p-3 ${cx.th}`}>Dia</th>
                <th className={`text-right p-3 ${cx.th}`}>Valor</th>
                <th className={`text-center p-3 ${cx.th}`}>Ativo</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {recurring.map(r => (
                <tr key={r.id} className={cx.tableRow}>
                  <td className={`p-3 text-sm ${cx.text}`}>{r.description}</td>
                  <td className={`p-3 text-sm ${cx.subtext}`}>{categoryLabels[r.category]}</td>
                  <td className={`p-3 text-sm ${cx.subtext}`}>Todo dia {r.dayOfMonth}</td>
                  <td className={`p-3 text-sm font-medium text-right ${r.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                    {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => updateRecurring({ ...r, active: !r.active })}>
                      {r.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className={cx.subtext} />}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => removeRecurring(r.id)} className={`${cx.subtext} hover:text-red-400 transition-colors`}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Nova Recorrência" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              {(['income', 'expense'] as TransactionType[]).map(type => (
                <button key={type} type="button" onClick={() => setForm(f => ({ ...f, type, category: type === 'income' ? 'salario' : 'moradia' }))}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${form.type === type ? (type === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {type === 'income' ? 'Receita' : 'Despesa'}
                </button>
              ))}
            </div>
            <input required placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0.01" step="any" placeholder="Valor (R$)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              <input required type="number" min="1" max="31" placeholder="Dia do mês" value={form.dayOfMonth} onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
                className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}
              className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`}>
              {categories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">Adicionar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
