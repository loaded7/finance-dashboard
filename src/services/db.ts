import { supabase } from '../lib/supabase'
import type { Transaction, Investment, Goal, WatchlistItem, Budget, RecurringTransaction, EmergencyFund, PatrimonySnapshot, CustomCategory } from '../types'

const uid = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user?.id
}

// Transactions
export const db = {
  async getTransactions(): Promise<Transaction[]> {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false })
    return (data || []).map(r => ({ id: r.id, type: r.type, category: r.category, description: r.description, amount: r.amount, date: r.date, tags: r.tags || [] }))
  },
  async upsertTransaction(t: Transaction) {
    const userId = await uid()
    await supabase.from('transactions').upsert({ id: t.id, user_id: userId, type: t.type, category: t.category, description: t.description, amount: t.amount, date: t.date, tags: t.tags || [] })
  },
  async deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
  },

  async getInvestments(): Promise<Investment[]> {
    const { data } = await supabase.from('investments').select('*')
    return (data || []).map(r => ({ id: r.id, name: r.name, ticker: r.ticker, type: r.type, quantity: r.quantity, avgPrice: r.avg_price, currentPrice: r.current_price, notes: r.notes, dividends: r.dividends || [], history: r.history || [] }))
  },
  async upsertInvestment(i: Investment) {
    const userId = await uid()
    await supabase.from('investments').upsert({ id: i.id, user_id: userId, name: i.name, ticker: i.ticker, type: i.type, quantity: i.quantity, avg_price: i.avgPrice, current_price: i.currentPrice, notes: i.notes || '', dividends: i.dividends || [], history: i.history || [] })
  },
  async deleteInvestment(id: string) {
    await supabase.from('investments').delete().eq('id', id)
  },

  async getGoals(): Promise<Goal[]> {
    const { data } = await supabase.from('goals').select('*')
    return (data || []).map(r => ({ id: r.id, name: r.name, targetAmount: r.target_amount, currentAmount: r.current_amount, deadline: r.deadline || '', description: r.description || '' }))
  },
  async upsertGoal(g: Goal) {
    const userId = await uid()
    await supabase.from('goals').upsert({ id: g.id, user_id: userId, name: g.name, target_amount: g.targetAmount, current_amount: g.currentAmount, deadline: g.deadline || '', description: g.description || '' })
  },
  async deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id)
  },

  async getWatchlist(): Promise<WatchlistItem[]> {
    const { data } = await supabase.from('watchlist').select('*')
    return (data || []).map(r => ({ id: r.id, name: r.name, ticker: r.ticker, type: r.type, targetPrice: r.target_price, notes: r.notes || '', addedAt: r.added_at }))
  },
  async upsertWatchlistItem(i: WatchlistItem) {
    const userId = await uid()
    await supabase.from('watchlist').upsert({ id: i.id, user_id: userId, name: i.name, ticker: i.ticker, type: i.type, target_price: i.targetPrice, notes: i.notes || '', added_at: i.addedAt })
  },
  async deleteWatchlistItem(id: string) {
    await supabase.from('watchlist').delete().eq('id', id)
  },

  async getBudgets(): Promise<Budget[]> {
    const { data } = await supabase.from('budgets').select('*')
    return (data || []).map(r => ({ id: r.id, category: r.category, limit: r.limit, month: r.month }))
  },
  async upsertBudget(b: Budget) {
    const userId = await uid()
    await supabase.from('budgets').upsert({ id: b.id, user_id: userId, category: b.category, limit: b.limit, month: b.month })
  },
  async deleteBudget(id: string) {
    await supabase.from('budgets').delete().eq('id', id)
  },

  async getRecurring(): Promise<RecurringTransaction[]> {
    const { data } = await supabase.from('recurring').select('*')
    return (data || []).map(r => ({ id: r.id, type: r.type, category: r.category, description: r.description, amount: r.amount, dayOfMonth: r.day_of_month, active: r.active }))
  },
  async upsertRecurring(r: RecurringTransaction) {
    const userId = await uid()
    await supabase.from('recurring').upsert({ id: r.id, user_id: userId, type: r.type, category: r.category, description: r.description, amount: r.amount, day_of_month: r.dayOfMonth, active: r.active })
  },
  async deleteRecurring(id: string) {
    await supabase.from('recurring').delete().eq('id', id)
  },

  async getSettings() {
    const userId = await uid()
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single()
    return data
  },
  async upsertSettings(settings: { emergency?: EmergencyFund; theme?: string; patrimony?: PatrimonySnapshot[]; customCategories?: CustomCategory[] }) {
    const userId = await uid()
    const update: Record<string, unknown> = { user_id: userId }
    if (settings.emergency) { update.emergency_target = settings.emergency.target; update.emergency_current = settings.emergency.current }
    if (settings.theme) update.theme = settings.theme
    if (settings.patrimony) update.patrimony = settings.patrimony
    if (settings.customCategories) update.custom_categories = settings.customCategories
    await supabase.from('user_settings').upsert(update)
  },
}
