import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Trash2, Pencil, Download, Upload, Search, Tag, X } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import { useStore } from '../store/useStore'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, generateId, categoryLabels } from '../utils/format'
import { useToastContext } from '../hooks/ToastContext'
import type { Transaction, TransactionCategory, TransactionType } from '../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const incomeCategories: TransactionCategory[] = ['salario', 'freelance', 'investimento', 'outros']
const expenseCategories: TransactionCategory[] = ['alimentacao', 'moradia', 'transporte', 'saude', 'educacao', 'lazer', 'outros']
const empty: Omit<Transaction, 'id'> = { type: 'expense', category: 'alimentacao', description: '', amount: 0, date: new Date().toISOString().slice(0, 10), tags: [] }
const inputCls = 'w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500'

export default function Transactions() {
  const { transactions, addTransaction, removeTransaction, updateTransaction, customCategories, addCustomCategory, removeCustomCategory } = useStore()
  const { toast } = useToastContext()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState<Omit<Transaction, 'id'>>(empty)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [showCatModal, setShowCatModal] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', type: 'expense' as TransactionType })
  const fileRef = useRef<HTMLInputElement>(null)

  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy', { locale: ptBR }) }
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !showModal && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) openAdd()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showModal])

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (t: Transaction) => { setEditing(t); setForm({ type: t.type, category: t.category, description: t.description, amount: t.amount, date: t.date }); setShowModal(true) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) { updateTransaction({ ...form, id: editing.id }); toast('Transação atualizada') }
    else { addTransaction({ ...form, id: generateId() }); toast('Transação adicionada') }
    setShowModal(false)
  }

  const filtered = useMemo(() => transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false
    if (monthFilter && !t.date.startsWith(monthFilter)) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !categoryLabels[t.category].toLowerCase().includes(search.toLowerCase())) return false
    if (tagFilter && !(t.tags || []).includes(tagFilter)) return false
    return true
  }), [transactions, filter, monthFilter, search, tagFilter])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    transactions.forEach(t => (t.tags || []).forEach(tag => tags.add(tag)))
    return Array.from(tags)
  }, [transactions])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const exportCSV = () => {
    const header = 'Data,Tipo,Categoria,Descrição,Valor'
    const rows = filtered.map(t => `${t.date},${t.type === 'income' ? 'Receita' : 'Despesa'},${categoryLabels[t.category]},"${t.description}",${t.amount}`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `transacoes_${format(now, 'yyyy-MM-dd')}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = (ev.target?.result as string).split('\n').slice(1)
      lines.forEach(line => {
        if (!line.trim()) return
        const parts = line.split(',')
        const catEntry = Object.entries(categoryLabels).find(([, v]) => v === parts[2])
        addTransaction({ id: generateId(), type: parts[1]?.trim() === 'Receita' ? 'income' : 'expense', category: (catEntry?.[0] || 'outros') as TransactionCategory, description: parts[3]?.replace(/"/g, '').trim() || '', amount: parseFloat(parts[4]) || 0, date: parts[0]?.trim() || new Date().toISOString().slice(0, 10) })
      })
      toast('Importação concluída')
    }
    reader.readAsText(file); e.target.value = ''
  }

  const categories = form.type === 'income' ? incomeCategories : expenseCategories

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Transações</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors">
            <Download size={14} /> Exportar
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors">
            <Upload size={14} /> Importar
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />
          <button onClick={() => setShowCatModal(true)} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm transition-colors">
            <Tag size={14} /> Categorias
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus size={16} /> Nova
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Receitas</p><p className="text-xl font-bold text-green-500 mt-1">{formatCurrency(totalIncome)}</p></div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Despesas</p><p className="text-xl font-bold text-red-400 mt-1">{formatCurrency(totalExpense)}</p></div>
        <div className={`${totalIncome - totalExpense >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded-xl p-4`}><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Saldo</p><p className={`text-xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(totalIncome - totalExpense)}</p></div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm focus:outline-none text-gray-900 dark:text-gray-100 w-40" />
        </div>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
          <option value="">Todos os meses</option>
          {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        {(['all', 'income', 'expense'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${filter === f ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            {f === 'all' ? 'Todas' : f === 'income' ? 'Receitas' : 'Despesas'}
          </button>
        ))}
        <span className="text-sm text-gray-400 self-center">{filtered.length} registros</span>
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 self-center">Tags:</span>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${tagFilter === tag ? 'bg-green-500/20 border-green-500 text-green-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma transação encontrada</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left p-3 text-xs text-gray-400 dark:text-gray-500 uppercase">Descrição</th>
                <th className="text-left p-3 text-xs text-gray-400 dark:text-gray-500 uppercase">Categoria</th>
                <th className="text-left p-3 text-xs text-gray-400 dark:text-gray-500 uppercase">Data</th>
                <th className="text-right p-3 text-xs text-gray-400 dark:text-gray-500 uppercase">Valor</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-3 text-sm text-gray-900 dark:text-gray-100">
                    <p>{t.description}</p>
                    {(t.tags || []).length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(t.tags || []).map(tag => <span key={tag} className="text-xs bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded">#{tag}</span>)}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{categoryLabels[t.category]}</td>
                  <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(t.date)}</td>
                  <td className={`p-3 text-sm font-medium text-right ${t.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(t.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog message="Tem certeza que quer deletar esta transação?"
          onConfirm={() => { removeTransaction(deleteId); setDeleteId(null); toast('Transação removida', 'info') }}
          onCancel={() => setDeleteId(null)} />
      )}

      {showModal && (
        <Modal title={editing ? 'Editar Transação' : 'Nova Transação'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(['income', 'expense'] as TransactionType[]).map(type => (
                <button key={type} type="button"
                  onClick={() => setForm(f => ({ ...f, type, category: type === 'income' ? 'salario' : 'alimentacao' }))}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${form.type === type ? (type === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {type === 'income' ? 'Receita' : 'Despesa'}
                </button>
              ))}
            </div>
            <input required placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
            <input required type="number" min="0.01" step="0.01" placeholder="Valor (R$)" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className={inputCls} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))} className={inputCls}>
              {categories.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
            <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tags (Enter para adicionar)</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {(form.tags || []).map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                    #{tag}<button type="button" onClick={() => setForm(f => ({ ...f, tags: (f.tags || []).filter(t => t !== tag) }))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <input placeholder="Adicionar tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const t = tagInput.trim(); if (t && !(form.tags || []).includes(t)) { setForm(f => ({ ...f, tags: [...(f.tags || []), t] })); setTagInput('') } } }}
                className={inputCls} />
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              {editing ? 'Salvar' : 'Adicionar'}
            </button>
          </form>
        </Modal>
      )}
      {showCatModal && (
        <Modal title="Categorias Personalizadas" onClose={() => setShowCatModal(false)}>
          <div className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customCategories.length === 0 && <p className="text-sm text-gray-400">Nenhuma categoria personalizada</p>}
              {customCategories.map(c => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-900 dark:text-gray-100">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{c.type === 'income' ? 'Receita' : 'Despesa'}</span>
                    <button onClick={() => removeCustomCategory(c.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Nome da categoria" value={newCat.name} onChange={e => setNewCat(f => ({ ...f, name: e.target.value }))}
                className={`flex-1 ${inputCls}`} />
              <select value={newCat.type} onChange={e => setNewCat(f => ({ ...f, type: e.target.value as TransactionType }))}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-2 text-sm focus:outline-none">
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <button onClick={() => { if (newCat.name.trim()) { addCustomCategory({ id: generateId(), name: newCat.name.trim(), type: newCat.type }); setNewCat({ name: '', type: 'expense' }) } }}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
