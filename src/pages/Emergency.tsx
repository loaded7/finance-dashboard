import { useState } from 'react'
import { Shield, Save } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCurrency } from '../utils/format'
import { cx } from '../utils/cx'

export default function Emergency() {
  const { emergency, updateEmergency } = useStore()
  const [target, setTarget] = useState(emergency.target.toString())
  const [current, setCurrent] = useState(emergency.current.toString())
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateEmergency({ target: parseFloat(target) || 0, current: parseFloat(current) || 0 })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const pct = emergency.target > 0 ? Math.min((emergency.current / emergency.target) * 100, 100) : 0
  const remaining = Math.max(emergency.target - emergency.current, 0)
  const months = emergency.target > 0 ? (emergency.current / emergency.target) * 6 : 0

  const getColor = () => {
    if (pct >= 100) return { bar: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/10' }
    if (pct >= 50) return { bar: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' }
    return { bar: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10' }
  }
  const color = getColor()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className={`text-xl font-bold ${cx.text}`}>Reserva de Emergência</h2>
        <p className={`text-sm ${cx.subtext}`}>Recomendado: 6 meses de despesas</p>
      </div>

      <div className={`${color.bg} border ${color.border} rounded-xl p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Shield size={24} className={color.text} />
          <div>
            <p className={`text-2xl font-bold ${color.text}`}>{pct.toFixed(1)}%</p>
            <p className={`text-sm ${cx.subtext}`}>da reserva completa</p>
          </div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
          <div className={`h-full ${color.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div><p className={`text-xs ${cx.subtext}`}>Acumulado</p><p className={`text-lg font-bold ${color.text}`}>{formatCurrency(emergency.current)}</p></div>
          <div><p className={`text-xs ${cx.subtext}`}>Meta</p><p className={`text-lg font-bold ${cx.text}`}>{formatCurrency(emergency.target)}</p></div>
          <div><p className={`text-xs ${cx.subtext}`}>Faltam</p><p className={`text-lg font-bold ${cx.text}`}>{formatCurrency(remaining)}</p></div>
        </div>
        {emergency.target > 0 && (
          <p className={`text-sm ${cx.subtext} mt-4`}>
            Você tem aproximadamente <span className={`font-medium ${color.text}`}>{months.toFixed(1)} meses</span> de reserva
            {pct >= 100 ? ' — parabéns, reserva completa!' : ' — continue guardando!'}
          </p>
        )}
      </div>

      <div className={`${cx.card} rounded-xl p-5`}>
        <h3 className={`text-sm font-medium ${cx.text} mb-4`}>Atualizar Reserva</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={`text-xs ${cx.subtext} mb-1 block`}>Meta (6x suas despesas mensais)</label>
            <input type="number" min="0" step="any" value={target} onChange={e => setTarget(e.target.value)} placeholder="Ex: 30000" className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
          </div>
          <div>
            <label className={`text-xs ${cx.subtext} mb-1 block`}>Valor atual acumulado</label>
            <input type="number" min="0" step="any" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Ex: 15000" className={`w-full ${cx.input} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500`} />
          </div>
          <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save size={14} />{saved ? 'Salvo!' : 'Salvar'}
          </button>
        </form>
      </div>

      <div className={`${cx.card} rounded-xl p-5`}>
        <h3 className={`text-sm font-medium ${cx.text} mb-3`}>Dicas</h3>
        <ul className={`space-y-2 text-sm ${cx.subtext}`}>
          <li>• Mantenha a reserva em investimentos de alta liquidez (CDB, Tesouro Selic, conta remunerada)</li>
          <li>• O ideal é ter entre 3 a 12 meses de despesas, dependendo da sua estabilidade de renda</li>
          <li>• Não use a reserva para oportunidades de investimento — ela é para emergências</li>
          <li>• Revise o valor da meta anualmente conforme suas despesas mudam</li>
        </ul>
      </div>
    </div>
  )
}
