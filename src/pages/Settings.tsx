import { useRef } from 'react'
import { Download, Upload, Trash2, Database } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToastContext } from '../hooks/ToastContext'
import { formatCurrency } from '../utils/format'

const STORAGE_KEYS = ['fd_transactions', 'fd_investments', 'fd_watchlist', 'fd_goals',
  'fd_emergency', 'fd_budgets', 'fd_recurring', 'fd_theme', 'fd_notes', 'fd_debts', 'fd_patrimony']

export default function Settings() {
  const { investments, emergency, transactions } = useStore()
  const { toast } = useToastContext()
  const fileRef = useRef<HTMLInputElement>(null)

  const exportBackup = () => {
    const data: Record<string, unknown> = {}
    STORAGE_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v) })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `findash-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
    toast('Backup exportado com sucesso')
  }

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        STORAGE_KEYS.forEach(k => { if (data[k] !== undefined) localStorage.setItem(k, JSON.stringify(data[k])) })
        toast('Backup restaurado! Recarregando...')
        setTimeout(() => window.location.reload(), 1500)
      } catch { toast('Arquivo inválido', 'error') }
    }
    reader.readAsText(file); e.target.value = ''
  }

  const clearAll = () => {
    if (!window.confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) return
    STORAGE_KEYS.forEach(k => localStorage.removeItem(k))
    toast('Dados apagados. Recarregando...', 'info')
    setTimeout(() => window.location.reload(), 1500)
  }

  const portfolioTotal = investments.reduce((s, i) => s + i.currentPrice * i.quantity, 0)
  const totalBalance = transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)
  const netWorth = portfolioTotal + emergency.current + Math.max(totalBalance, 0)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configurações</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Backup, dados e preferências</p>
      </div>

      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-5">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Patrimônio Líquido Total</p>
        <p className="text-3xl font-bold text-green-400">{formatCurrency(netWorth)}</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Investimentos</p><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(portfolioTotal)}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Reserva</p><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(emergency.current)}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Saldo em conta</p><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(Math.max(totalBalance, 0))}</p></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Backup de Dados</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Exporte todos os seus dados em JSON para guardar como backup ou transferir para outro dispositivo.
        </p>
        <div className="flex gap-3">
          <button onClick={exportBackup} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <Download size={14} /> Exportar Backup
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm transition-colors">
            <Upload size={14} /> Restaurar Backup
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importBackup} />
        </div>
      </div>

      <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-5">
        <h3 className="font-semibold text-red-400 mb-2">Zona de Perigo</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Esta ação é irreversível. Todos os dados serão apagados permanentemente.</p>
        <button onClick={clearAll} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Trash2 size={14} /> Apagar Todos os Dados
        </button>
      </div>
    </div>
  )
}
