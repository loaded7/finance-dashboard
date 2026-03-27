import { useState } from 'react'
import { ArrowRight, TrendingUp, Wallet, Target, Shield, X } from 'lucide-react'

const steps = [
  {
    icon: Wallet,
    title: 'Bem-vindo ao FinDash!',
    description: 'Seu dashboard financeiro pessoal completo. Vamos te mostrar o que você pode fazer aqui.',
    color: 'text-green-500',
  },
  {
    icon: TrendingUp,
    title: 'Registre suas transações',
    description: 'Adicione receitas e despesas, use categorias e tags para organizar tudo. Exporte e importe via CSV.',
    color: 'text-blue-400',
  },
  {
    icon: Target,
    title: 'Defina metas financeiras',
    description: 'Crie objetivos com prazo e acompanhe o progresso. O app te avisa quando estiver perto do prazo.',
    color: 'text-purple-400',
  },
  {
    icon: Shield,
    title: 'Construa sua reserva',
    description: 'Configure sua reserva de emergência e acompanhe o progresso. A IA analisa suas finanças e dá insights personalizados.',
    color: 'text-yellow-500',
  },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl p-8">
        <div className="flex justify-end mb-2">
          <button onClick={onDone} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4`}>
            <Icon size={32} className={current.color} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{current.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{current.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-green-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>

        <button
          onClick={() => isLast ? onDone() : setStep(s => s + 1)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-medium transition-colors"
        >
          {isLast ? 'Começar' : 'Próximo'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
