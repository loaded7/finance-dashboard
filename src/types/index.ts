export type TransactionType = 'income' | 'expense'

export type TransactionCategory =
  | 'salario'
  | 'freelance'
  | 'investimento'
  | 'alimentacao'
  | 'moradia'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'outros'

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  date: string
  recurring?: boolean
  recurringId?: string
  tags?: string[]
}

export interface CustomCategory {
  id: string
  name: string
  type: TransactionType
}

export type InvestmentType = 'acoes' | 'fiis' | 'cripto' | 'renda-fixa' | 'outros'

export interface Investment {
  id: string
  name: string
  ticker: string
  type: InvestmentType
  quantity: number
  avgPrice: number
  currentPrice: number
  notes?: string
  dividends?: Dividend[]
  history?: InvestmentHistory[]
}

export interface Dividend {
  id: string
  amount: number
  date: string
}

export interface InvestmentHistory {
  id: string
  quantity: number
  price: number
  date: string
  type: 'buy' | 'sell'
}

export interface WatchlistItem {
  id: string
  name: string
  ticker: string
  type: InvestmentType
  targetPrice?: number
  notes: string
  addedAt: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description?: string
}

export interface EmergencyFund {
  target: number
  current: number
}

export interface PatrimonySnapshot {
  date: string // 'YYYY-MM'
  investments: number
  emergency: number
  balance: number
  total: number
}

export interface Budget {
  id: string
  category: TransactionCategory
  limit: number
  month: string // 'YYYY-MM'
}

export interface RecurringTransaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  dayOfMonth: number
  active: boolean
}

export type Theme = 'dark' | 'light'
