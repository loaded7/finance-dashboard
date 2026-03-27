import { GROQ_API_KEY, GROQ_MODEL } from '../config'

export async function getFinancialInsights(context: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          content: `Você é um assistente financeiro pessoal brasileiro. Analise os dados financeiros fornecidos e gere insights práticos, diretos e úteis em português. Seja objetivo, use no máximo 5 insights curtos. Foque em padrões, alertas e oportunidades de melhoria. Não use markdown, apenas texto simples com cada insight em uma linha separada começando com um emoji relevante.`,
        },
        {
          role: 'user',
          content: context,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Groq error:', err)
    throw new Error('Erro ao consultar IA')
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'Sem insights disponíveis.'
}
