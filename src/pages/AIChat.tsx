import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../hooks/useTheme'
import { GROQ_API_KEY, GROQ_MODEL } from '../config'
import { formatCurrency, categoryLabels } from '../utils/format'
import { cx } from '../utils/cx'
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildContext(store: ReturnType<typeof useStore>): string {
  const { transactions, investments, goals, emergency, budgets, recurring, patrimony } = store
  const now = new Date()

  const last3Months = Array.from({ length: 3 }, (_, i) => {
    const month = subMonths(now, i)
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const t = transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }))
    const income = t.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = t.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return `${format(month, 'MMMM/yyyy', { locale: ptBR })}: receitas ${formatCurrency(income)}, despesas ${formatCurrency(expense)}, saldo ${formatCurrency(income - expense)}`
  })

  const expByCategory: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expByCategory[t.category] = (expByCategory[t.category] || 0) + t.amount
  })

  return `
CONTEXTO FINANCEIRO DO USUÁRIO:

Últimos 3 meses:
${last3Months.join('\n')}

Gastos totais por categoria:
${Object.entries(expByCategory).map(([k, v]) => `- ${categoryLabels[k]}: ${formatCurrency(v)}`).join('\n')}

Carteira de investimentos (${investments.length} ativos):
${investments.map(i => `- ${i.ticker} (${i.name}): ${i.quantity} unidades, preço médio ${formatCurrency(i.avgPrice)}, preço atual ${formatCurrency(i.currentPrice)}, resultado ${formatCurrency((i.currentPrice - i.avgPrice) * i.quantity)}`).join('\n') || '- Nenhum ativo'}

Reserva de emergência: ${formatCurrency(emergency.current)} de ${formatCurrency(emergency.target)} (${emergency.target > 0 ? ((emergency.current / emergency.target) * 100).toFixed(0) : 0}%)

Metas financeiras:
${goals.map(g => `- ${g.name}: ${formatCurrency(g.currentAmount)} de ${formatCurrency(g.targetAmount)} (${(g.currentAmount / g.targetAmount * 100).toFixed(0)}%)`).join('\n') || '- Nenhuma meta'}

Recorrências ativas:
${recurring.filter(r => r.active).map(r => `- ${r.description}: ${r.type === 'income' ? '+' : '-'}${formatCurrency(r.amount)}/mês`).join('\n') || '- Nenhuma'}

Orçamentos:
${budgets.map(b => `- ${categoryLabels[b.category]}: limite ${formatCurrency(b.limit)} (${b.month})`).join('\n') || '- Nenhum'}

Histórico patrimonial:
${patrimony.slice(-6).map(p => `- ${p.date}: total ${formatCurrency(p.total)}`).join('\n') || '- Sem histórico'}
`.trim()
}

export default function AIChat() {
  const store = useStore()
  const { theme } = store
  const { isDark } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Olá! Sou seu assistente financeiro. Posso responder perguntas sobre suas finanças, analisar seus gastos, sugerir melhorias e muito mais. Como posso ajudar?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const context = buildContext(store)
      const history = messages.slice(-10)

      const res = await fetch('/groq-api/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: `Você é um assistente financeiro pessoal brasileiro especializado. Responda sempre em português, de forma clara, direta e útil. Use os dados financeiros do usuário para dar respostas personalizadas e precisas. Quando calcular valores, mostre o raciocínio. Seja amigável mas profissional.\n\n${context}`,
            },
            ...history,
            userMsg,
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      })

      if (!res.ok) throw new Error()
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || 'Não consegui processar sua pergunta.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro ao conectar com a IA. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Quanto gastei em alimentação nos últimos 3 meses?',
    'Como está minha taxa de poupança?',
    'Qual ativo da minha carteira tem melhor resultado?',
    'Estou no caminho certo para minha reserva de emergência?',
    'Me dê dicas para reduzir meus gastos',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-xl font-bold ${cx.text}`}>Chat Financeiro</h2>
          <p className={`text-sm ${cx.subtext}`}>Converse com sua IA financeira pessoal</p>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: '👋 Olá! Como posso ajudar?' }])}
          className={`flex items-center gap-2 text-sm ${cx.subtext} hover:text-red-400 transition-colors`}>
          <Trash2 size={14} /> Limpar
        </button>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto rounded-xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-4 space-y-4 mb-4`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-green-600 text-white'
                : isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
            }`}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} className="text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">FinDash IA</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-xl px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">FinDash IA</span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`flex gap-3 items-end border rounded-xl p-3 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Pergunte sobre suas finanças... (Enter para enviar)"
          rows={1}
          className={`flex-1 bg-transparent text-sm resize-none focus:outline-none ${cx.text} placeholder:${cx.subtext}`}
          style={{ maxHeight: 120 }}
        />
        <button onClick={send} disabled={!input.trim() || loading}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white p-2 rounded-lg transition-colors flex-shrink-0">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
