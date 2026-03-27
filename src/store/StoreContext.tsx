import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Transaction, Investment, WatchlistItem, Goal, EmergencyFund, Budget, RecurringTransaction, Theme, PatrimonySnapshot, CustomCategory } from '../types'

const KEYS = {
  transactions: 'fd_transactions', investments: 'fd_investments', watchlist: 'fd_watchlist',
  goals: 'fd_goals', emergency: 'fd_emergency', budgets: 'fd_budgets', recurring: 'fd_recurring',
  theme: 'fd_theme', patrimony: 'fd_patrimony',
}

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}
function save<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)) }

interface StoreState {
  transactions: Transaction[]
  investments: Investment[]
  watchlist: WatchlistItem[]
  goals: Goal[]
  emergency: EmergencyFund
  budgets: Budget[]
  recurring: RecurringTransaction[]
  theme: Theme
  patrimony: PatrimonySnapshot[]
  customCategories: CustomCategory[]
  addTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void
  updateTransaction: (t: Transaction) => void
  addInvestment: (i: Investment) => void
  removeInvestment: (id: string) => void
  updateInvestment: (i: Investment) => void
  addWatchlistItem: (i: WatchlistItem) => void
  removeWatchlistItem: (id: string) => void
  addGoal: (g: Goal) => void
  removeGoal: (id: string) => void
  updateGoal: (g: Goal) => void
  updateEmergency: (e: EmergencyFund) => void
  addBudget: (b: Budget) => void
  removeBudget: (id: string) => void
  addRecurring: (r: RecurringTransaction) => void
  removeRecurring: (id: string) => void
  updateRecurring: (r: RecurringTransaction) => void
  setTheme: (t: Theme) => void
  savePatrimonySnapshot: (s: PatrimonySnapshot) => void
  addCustomCategory: (c: CustomCategory) => void
  removeCustomCategory: (id: string) => void
}

const StoreContext = createContext<StoreState | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => load(KEYS.transactions, []))
  const [investments, setInvestments] = useState<Investment[]>(() => load(KEYS.investments, []))
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => load(KEYS.watchlist, []))
  const [goals, setGoals] = useState<Goal[]>(() => load(KEYS.goals, []))
  const [emergency, setEmergency] = useState<EmergencyFund>(() => load(KEYS.emergency, { target: 0, current: 0 }))
  const [budgets, setBudgets] = useState<Budget[]>(() => load(KEYS.budgets, []))
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => load(KEYS.recurring, []))
  const [theme, setThemeState] = useState<Theme>(() => load(KEYS.theme, 'dark'))
  const [patrimony, setPatrimony] = useState<PatrimonySnapshot[]>(() => load(KEYS.patrimony, []))
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => load('fd_custom_categories', []))

  useEffect(() => { save(KEYS.transactions, transactions) }, [transactions])
  useEffect(() => { save(KEYS.investments, investments) }, [investments])
  useEffect(() => { save(KEYS.watchlist, watchlist) }, [watchlist])
  useEffect(() => { save(KEYS.goals, goals) }, [goals])
  useEffect(() => { save(KEYS.emergency, emergency) }, [emergency])
  useEffect(() => { save(KEYS.budgets, budgets) }, [budgets])
  useEffect(() => { save(KEYS.recurring, recurring) }, [recurring])
  useEffect(() => { save(KEYS.patrimony, patrimony) }, [patrimony])
  useEffect(() => { save('fd_custom_categories', customCategories) }, [customCategories])
  useEffect(() => {
    save(KEYS.theme, theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  const value: StoreState = {
    transactions, investments, watchlist, goals, emergency, budgets, recurring, theme, patrimony, customCategories,
    addTransaction: t => setTransactions(p => [t, ...p]),
    removeTransaction: id => setTransactions(p => p.filter(t => t.id !== id)),
    updateTransaction: t => setTransactions(p => p.map(x => x.id === t.id ? t : x)),
    addInvestment: i => setInvestments(p => [i, ...p]),
    removeInvestment: id => setInvestments(p => p.filter(i => i.id !== id)),
    updateInvestment: i => setInvestments(p => p.map(x => x.id === i.id ? i : x)),
    addWatchlistItem: i => setWatchlist(p => [i, ...p]),
    removeWatchlistItem: id => setWatchlist(p => p.filter(i => i.id !== id)),
    addGoal: g => setGoals(p => [g, ...p]),
    removeGoal: id => setGoals(p => p.filter(g => g.id !== id)),
    updateGoal: g => setGoals(p => p.map(x => x.id === g.id ? g : x)),
    updateEmergency: e => setEmergency(e),
    addBudget: b => setBudgets(p => { const e = p.find(x => x.category === b.category && x.month === b.month); return e ? p.map(x => x.id === e.id ? b : x) : [...p, b] }),
    removeBudget: id => setBudgets(p => p.filter(b => b.id !== id)),
    addRecurring: r => setRecurring(p => [...p, r]),
    removeRecurring: id => setRecurring(p => p.filter(r => r.id !== id)),
    updateRecurring: r => setRecurring(p => p.map(x => x.id === r.id ? r : x)),
    setTheme,
    savePatrimonySnapshot: s => setPatrimony(p => [...p.filter(x => x.date !== s.date), s].sort((a, b) => a.date.localeCompare(b.date))),
    addCustomCategory: c => setCustomCategories(p => [...p, c]),
    removeCustomCategory: id => setCustomCategories(p => p.filter(c => c.id !== id)),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
