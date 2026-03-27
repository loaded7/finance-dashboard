import { useState } from 'react'
import { Plus, Trash2, Pencil, Target } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatCurrency, formatDate, generateId } from '../utils/format'
import { cx } from '../utils/cx'
import type { Goal } from '../types'

const emptyForm: Omit<Goal, 'id'> = { name: '', targetAmount: 0, currentAmount: 0, deadline: '', description: '' }

export default function Goals() {
  const { goals, addGoal, removeGoal, updateGoal } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState<Omit<Goal, 'id'>>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (g: Goal) => { setEditing(g); setForm({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline, description: g.description || '' }); setShowModal(true) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) updateGoal({ ...form, id: editing.id })
    else addGoal({ ...form, id: generateId() })
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${cx.text}`}>Metas Financeiras</h2>
          <p className={`text-sm ${cx.subtext}`}>Acompanhe seus objetivos</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className={`${cx.card} rounded-xl p-12 text-center`}>
          <Target size={32} className="text-gray-400 mx-auto mb-3" />
          <p className={cx.subtext}>Nenhuma meta cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
            const remaining = g.targetAmount - g.currentAmount
            const isComplete = pct >= 100
            return (
              <div key={g.id} className={`${cx.card} rounded-xl p-5 ${isComplete ? 'border-green-500/40' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${cx.text}`}>{g.name}</h3>
                      {isComplete && <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Concluída</span>}
                    </div>
                    {g.description && <p className={`text-sm ${cx.subtext} mt-0.5`}>{g.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(g)} className={`${cx.subtext} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(g.id)} className={`${cx.subtext} hover:text-red-400 transition-colors`}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className={cx.subtext}>{formatCurrency(g.currentAmount)}</span>
                    <span className={cx.subtext}>{formatCurrency(g.targetAmount)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-400' : 'bg-green-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className={isComplete ? 'text-green-500' : cx.subtext}>{pct.toFixed(1)}% concluído</span>
                    {!isComplete && <span className={cx.subtext}>Faltam {formatCurrency(remaining)}</span>}
                  </div>
                </div>
                {g.deadline && <p className={`text-xs ${cx.subtext}`}>Prazo: {formatDate(g.deadline)}</p>}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Meta' : 'Nova Meta'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input required placeholder="Nome da meta" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            <textarea placeholder="Descrição (opcional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none h-16`} />
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0" step="any" placeholder="Valor alvo (R$)" value={form.targetAmount || ''} onChange={e => setForm(f => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 }))} className={`${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              <input required type="number" min="0" step="any" placeholder="Valor atual (R$)" value={form.currentAmount || ''} onChange={e => setForm(f => ({ ...f, currentAmount: parseFloat(e.target.value) || 0 }))} className={`${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">{editing ? 'Salvar' : 'Criar Meta'}</button>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog message="Tem certeza que quer deletar esta meta?" onConfirm={() => { removeGoal(deleteId); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
