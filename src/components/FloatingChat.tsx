import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Trash2, X, MessageCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { GROQ_API_KEY, GROQ_MODEL } from '../config'
import { formatCurrency, categoryLabels } from '../utils/format'
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildContext(store: ReturnType<typeof useStore>): string {
  const { transactions, investments, goals, emergency, recurring } = store
  const now = new Date()
  const last3 = Array.from({ length: 3 }, (_, i) => {
    const month = subMonths(now, i)
    const t = transactions.filter(t => isWithinInterval(new Date(t.date), { start: startOfMonth(month), end: endOfMonth(month) }))
    const inc = t.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exp = t.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return `${format(month, 'MMM/yy', { locale: ptBR })}: receitas ${formatCurrency(inc)}, despesas ${formatCurrency(exp)}`
  })
  const expByCat: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + t.amount })

  return `Dados do usuário:
Últimos 3 meses: ${last3.join(' | ')}
Gastos por categoria: ${Object.entries(expByCat).map(([k, v]) => `${categoryLabels[k]}: ${formatCurrency(v)}`).join(', ')}
Carteira: ${investments.map(i => `${i.ticker} ${i.quantity}x R$${i.currentPrice}`).join(', ') || 'vazia'}
Reserva: ${formatCurrency(emergency.current)}/${formatCurrency(emergency.target)}
Metas: ${goals.map(g => `${g.name} ${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}%`).join(', ') || 'nenhuma'}
Recorrências: ${recurring.filter(r => r.active).map(r => `${r.description} ${r.type === 'income' ? '+' : '-'}${formatCurrency(r.amount)}`).join(', ') || 'nenhuma'}`
}

const SUGGESTIONS = [
  'Como estão meus gastos este mês?',
  'Qual meu ativo com melhor resultado?',
  'Dicas para economizar mais',
  'Como está minha reserva de emergência?',
]

export default function FloatingChat() {
  const store = useStore()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Olá! Sou sua IA financeira. Pergunte qualquer coisa sobre suas finanças!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: `Você é um assistente financeiro pessoal brasileiro. Responda em português, de forma clara e direta. Use os dados do usuário para respostas personalizadas.\n\n${buildContext(store)}` },
            ...messages.slice(-8),
            userMsg,
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices?.[0]?.message?.content || 'Erro na resposta.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro ao conectar. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Chat IA"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-96 h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" />
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">FinDash IA</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <button onClick={() => setMessages([{ role: 'assistant', content: '👋 Olá! Como posso ajudar?' }])}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition-colors">
              <Trash2 size={12} /> Limpar
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)}
                    className="text-xs px-2.5 py-1 rounded-full border transition-colors border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 items-end p-3 border-t border-gray-100 dark:border-gray-800">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Pergunte algo..."
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ maxHeight: 80 }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white p-1.5 rounded-lg transition-colors flex-shrink-0">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
