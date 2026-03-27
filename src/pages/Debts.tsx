import { useState } from 'react'
import { Plus, Trash2, Pencil, CreditCard } from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatCurrency, formatDate, generateId } from '../utils/format'
import { cx } from '../utils/cx'
import { useToastContext } from '../hooks/ToastContext'

interface Debt {
  id: string; name: string; totalAmount: number; remainingAmount: number
  monthlyPayment: number; interestRate: number; dueDate: string; creditor: string
}

function loadDebts(): Debt[] { try { return JSON.parse(localStorage.getItem('fd_debts') || '[]') } catch { return [] } }
function saveDebts(d: Debt[]) { localStorage.setItem('fd_debts', JSON.stringify(d)) }

const emptyForm = { name: '', totalAmount: '', remainingAmount: '', monthlyPayment: '', interestRate: '', dueDate: '', creditor: '' }

export default function Debts() {
  const { toast } = useToastContext()
  const [debts, setDebts] = useState<Debt[]>(loadDebts)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const persist = (d: Debt[]) => { setDebts(d); saveDebts(d) }
  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (d: Debt) => { setEditing(d); setForm({ name: d.name, totalAmount: String(d.totalAmount), remainingAmount: String(d.remainingAmount), monthlyPayment: String(d.monthlyPayment), interestRate: String(d.interestRate), dueDate: d.dueDate, creditor: d.creditor }); setShowModal(true) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const debt: Debt = { id: editing?.id || generateId(), name: form.name, totalAmount: parseFloat(form.totalAmount) || 0, remainingAmount: parseFloat(form.remainingAmount) || 0, monthlyPayment: parseFloat(form.monthlyPayment) || 0, interestRate: parseFloat(form.interestRate) || 0, dueDate: form.dueDate, creditor: form.creditor }
    if (editing) { persist(debts.map(d => d.id === editing.id ? debt : d)); toast('Dívida atualizada') }
    else { persist([debt, ...debts]); toast('Dívida adicionada') }
    setShowModal(false)
  }

  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0)
  const totalMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${cx.text}`}>Dívidas</h2>
          <p className={`text-sm ${cx.subtext}`}>Controle de empréstimos e parcelas</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nova Dívida
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Total em Dívidas</p><p className="text-xl font-bold text-red-400 mt-1">{formatCurrency(totalDebt)}</p></div>
        <div className={`${cx.card} rounded-xl p-4`}><p className={`text-xs ${cx.subtext} uppercase tracking-wide`}>Parcelas Mensais</p><p className="text-xl font-bold text-orange-400 mt-1">{formatCurrency(totalMonthly)}</p></div>
      </div>

      {debts.length === 0 ? (
        <div className={`${cx.card} rounded-xl p-12 text-center`}><CreditCard size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" /><p className={cx.subtext}>Nenhuma dívida cadastrada</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map(d => {
            const pct = Math.min(((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100, 100)
            const months = d.monthlyPayment > 0 ? Math.ceil(d.remainingAmount / d.monthlyPayment) : 0
            return (
              <div key={d.id} className={`${cx.card} rounded-xl p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className={`font-semibold ${cx.text}`}>{d.name}</h3><p className={`text-xs ${cx.subtext}`}>{d.creditor}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(d)} className={`${cx.subtext} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(d.id)} className={`${cx.subtext} hover:text-red-400 transition-colors`}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${100 - pct}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className={`text-xs ${cx.subtext}`}>Restante</p><p className="text-red-400 font-medium">{formatCurrency(d.remainingAmount)}</p></div>
                  <div><p className={`text-xs ${cx.subtext}`}>Parcela</p><p className={`font-medium ${cx.text}`}>{formatCurrency(d.monthlyPayment)}/mês</p></div>
                  <div><p className={`text-xs ${cx.subtext}`}>Juros</p><p className={`font-medium ${cx.text}`}>{d.interestRate}% a.m.</p></div>
                  <div><p className={`text-xs ${cx.subtext}`}>Quitação est.</p><p className={`font-medium ${cx.text}`}>{months > 0 ? `${months} meses` : '—'}</p></div>
                </div>
                {d.dueDate && <p className={`text-xs ${cx.subtext} mt-2`}>Vencimento: {formatDate(d.dueDate)}</p>}
                {d.interestRate > 0 && d.monthlyPayment > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className={`text-xs ${cx.subtext} mb-1`}>Simulador de quitação antecipada</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[50, 100, 200].map(extra => {
                        const r = d.interestRate / 100
                        const pmt = d.monthlyPayment + extra
                        const months = pmt > d.remainingAmount * r
                          ? Math.ceil(Math.log(pmt / (pmt - d.remainingAmount * r)) / Math.log(1 + r))
                          : 999
                        const normalMonths = Math.ceil(d.remainingAmount / d.monthlyPayment)
                        const saved = (normalMonths - months) * d.monthlyPayment
                        return (
                          <div key={extra} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                            <p className={cx.subtext}>+{formatCurrency(extra)}/mês</p>
                            <p className="text-green-500 font-medium">{months < 999 ? `${months} meses` : '—'}</p>
                            {saved > 0 && <p className="text-xs text-green-400">Economiza {formatCurrency(saved)}</p>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Dívida' : 'Nova Dívida'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              <input placeholder="Credor" value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0" step="any" placeholder="Valor total (R$)" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              <input required type="number" min="0" step="any" placeholder="Saldo restante (R$)" value={form.remainingAmount} onChange={e => setForm(f => ({ ...f, remainingAmount: e.target.value }))} className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required type="number" min="0" step="any" placeholder="Parcela mensal (R$)" value={form.monthlyPayment} onChange={e => setForm(f => ({ ...f, monthlyPayment: e.target.value }))} className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
              <input type="number" min="0" step="0.01" placeholder="Juros % a.m." value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} className={`${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            </div>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={`w-full ${cx.input} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">{editing ? 'Salvar' : 'Adicionar'}</button>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog message="Tem certeza que quer deletar esta dívida?" onConfirm={() => { persist(debts.filter(d => d.id !== deleteId)); setDeleteId(null); toast('Dívida removida', 'info') }} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
