export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const categoryLabels: Record<string, string> = {
  salario: 'Salário',
  freelance: 'Freelance',
  investimento: 'Investimento',
  alimentacao: 'Alimentação',
  moradia: 'Moradia',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  outros: 'Outros',
}

export const investmentTypeLabels: Record<string, string> = {
  acoes: 'Ações',
  fiis: 'FIIs',
  cripto: 'Cripto',
  'renda-fixa': 'Renda Fixa',
  outros: 'Outros',
}
