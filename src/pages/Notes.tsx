import { useState } from 'react'
import { Plus, Trash2, StickyNote, Pencil, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../hooks/useTheme'
import ConfirmDialog from '../components/ConfirmDialog'
import { generateId } from '../utils/format'
import { cx } from '../utils/cx'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  color: string
}

const PALETTE = [
  { bg: 'rgba(133,77,14,0.12)', border: '#a16207', label: 'Amarelo' },
  { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', label: 'Azul' },
  { bg: 'rgba(34,197,94,0.12)', border: '#22c55e', label: 'Verde' },
  { bg: 'rgba(168,85,247,0.12)', border: '#a855f7', label: 'Roxo' },
  { bg: 'rgba(236,72,153,0.12)', border: '#ec4899', label: 'Rosa' },
  { bg: 'rgba(120,113,108,0.12)', border: '#78716c', label: 'Cinza' },
]

function loadNotes(): Note[] {
  try {
    const raw = JSON.parse(localStorage.getItem('fd_notes') || '[]')
    // migrate old format (tailwind string) to new format (JSON object)
    return raw.map((n: Note) => {
      try {
        JSON.parse(n.color)
        return n
      } catch {
        return { ...n, color: JSON.stringify(PALETTE[0]) }
      }
    })
  } catch { return [] }
}
function saveNotes(notes: Note[]) {
  localStorage.setItem('fd_notes', JSON.stringify(notes))
}

const emptyForm = { title: '', content: '', colorIndex: 0 }

export default function Notes() {
  const { theme } = useStore()
  const { isDark } = useTheme()
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const persist = (updated: Note[]) => { setNotes(updated); saveNotes(updated) }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const color = JSON.stringify(PALETTE[form.colorIndex])
    if (editingId) {
      persist(notes.map(n => n.id === editingId ? { ...n, title: form.title, content: form.content, color } : n))
      setEditingId(null)
    } else {
      persist([{ id: generateId(), title: form.title, content: form.content, color, createdAt: new Date().toISOString() }, ...notes])
    }
    setShowForm(false)
    setForm(emptyForm)
  }

  const openEdit = (n: Note) => {
    const parsed = JSON.parse(n.color)
    const idx = PALETTE.findIndex(p => p.border === parsed.border)
    setForm({ title: n.title, content: n.content, colorIndex: idx >= 0 ? idx : 0 })
    setEditingId(n.id)
    setShowForm(true)
  }

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true) }

  const text = isDark ? 'text-gray-100' : 'text-gray-900'
  const subtext = isDark ? 'text-gray-400' : 'text-gray-500'
  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${text}`}>Notas</h2>
          <p className={`text-sm ${subtext}`}>Anotações e ideias financeiras</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> Nova Nota
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}
          className={`border rounded-xl p-4 space-y-3 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <input required placeholder="Título" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 ${inputCls}`} />
          <textarea required placeholder="Conteúdo..." value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none h-28 ${inputCls}`} />
          <div className="flex items-center gap-3">
            <span className={`text-xs ${subtext}`}>Cor:</span>
            {PALETTE.map((c, i) => (
              <button key={i} type="button" onClick={() => setForm(f => ({ ...f, colorIndex: i }))}
                title={c.label}
                style={{ backgroundColor: c.bg, borderColor: c.border }}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110">
                {form.colorIndex === i && <Check size={12} style={{ color: c.border }} />}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }}
                className={`px-3 py-1.5 rounded-lg text-sm ${subtext} hover:bg-gray-800 transition-colors`}>
                Cancelar
              </button>
              <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm transition-colors">
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      )}

      {notes.length === 0 && !showForm ? (
        <div className={`border rounded-xl p-12 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <StickyNote size={32} className={`${subtext} mx-auto mb-3`} />
          <p className={subtext}>Nenhuma nota ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => {
            const c = JSON.parse(n.color) as typeof PALETTE[0]
            return (
              <div key={n.id} className="rounded-xl p-4 border"
                style={{ backgroundColor: c.bg, borderColor: c.border }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-medium text-sm ${text}`}>{n.title}</h3>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button onClick={() => openEdit(n)} className={`${subtext} hover:text-gray-300 transition-colors`}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteId(n.id)} className={`${subtext} hover:text-red-400 transition-colors`}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className={`text-sm ${subtext} whitespace-pre-wrap`}>{n.content}</p>
                <p className={`text-xs mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          message="Tem certeza que quer deletar esta nota?"
          onConfirm={() => { persist(notes.filter(n => n.id !== deleteId)); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
