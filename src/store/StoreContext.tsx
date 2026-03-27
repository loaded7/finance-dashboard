import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import type { Transaction, Investment, WatchlistItem, Goal, EmergencyFund, Budget, RecurringTransaction, Theme, PatrimonySnapshot, CustomCategory } from '../types'
import { db } from '../services/db'
import { supabase } from '../lib/supabase'

// localStorage fallback
const KEYS = { theme: 'fd_theme' }
function loadLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback } catch { return fallback }
}

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
  syncing: boolean
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [emergency, setEmergency] = useState<EmergencyFund>({ target: 0, current: 0 })
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [theme, setThemeState] = useState<Theme>(() => loadLocal(KEYS.theme, 'dark'))
  const [patrimony, setPatrimony] = useState<PatrimonySnapshot[]>([])
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])
  const [syncing, setSyncing] = useState(false)

  // Apply theme
  useEffect(() => {
    localStorage.setItem(KEYS.theme, JSON.stringify(theme))
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  // Load all data from Supabase when user logs in
  const loadAll = useCallback(async () => {
    setSyncing(true)
    try {
      const [t, i, g, w, b, r, s] = await Promise.all([
        db.getTransactions(), db.getInvestments(), db.getGoals(),
        db.getWatchlist(), db.getBudgets(), db.getRecurring(), db.getSettings()
      ])
      setTransactions(t)
      setInvestments(i)
      setGoals(g)
      setWatchlist(w)
      setBudgets(b)
      setRecurring(r)
      if (s) {
        setEmergency({ target: s.emergency_target || 0, current: s.emergency_current || 0 })
        setPatrimony(s.patrimony || [])
        setCustomCategories(s.custom_categories || [])
        if (s.theme) setThemeState(s.theme as Theme)
      }
    } catch (e) { console.error('Load error:', e) }
    finally { setSyncing(false) }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadAll()
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) loadAll()
      if (event === 'SIGNED_OUT') {
        setTransactions([]); setInvestments([]); setGoals([]); setWatchlist([])
        setBudgets([]); setRecurring([]); setEmergency({ target: 0, current: 0 })
        setPatrimony([]); setCustomCategories([])
      }
    })
    return () => subscription.unsubscribe()
  }, [loadAll])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    db.upsertSettings({ theme: t })
  }

  const value: StoreState = {
    transactions, investments, watchlist, goals, emergency, budgets, recurring, theme, patrimony, customCategories, syncing,

    addTransaction: t => { setTransactions(p => [t, ...p]); db.upsertTransaction(t) },
    removeTransaction: id => { setTransactions(p => p.filter(t => t.id !== id)); db.deleteTransaction(id) },
    updateTransaction: t => { setTransactions(p => p.map(x => x.id === t.id ? t : x)); db.upsertTransaction(t) },

    addInvestment: i => { setInvestments(p => [i, ...p]); db.upsertInvestment(i) },
    removeInvestment: id => { setInvestments(p => p.filter(i => i.id !== id)); db.deleteInvestment(id) },
    updateInvestment: i => { setInvestments(p => p.map(x => x.id === i.id ? i : x)); db.upsertInvestment(i) },

    addWatchlistItem: i => { setWatchlist(p => [i, ...p]); db.upsertWatchlistItem(i) },
    removeWatchlistItem: id => { setWatchlist(p => p.filter(i => i.id !== id)); db.deleteWatchlistItem(id) },

    addGoal: g => { setGoals(p => [g, ...p]); db.upsertGoal(g) },
    removeGoal: id => { setGoals(p => p.filter(g => g.id !== id)); db.deleteGoal(id) },
    updateGoal: g => { setGoals(p => p.map(x => x.id === g.id ? g : x)); db.upsertGoal(g) },

    updateEmergency: e => { setEmergency(e); db.upsertSettings({ emergency: e }) },

    addBudget: b => {
      setBudgets(p => { const e = p.find(x => x.category === b.category && x.month === b.month); return e ? p.map(x => x.id === e.id ? b : x) : [...p, b] })
      db.upsertBudget(b)
    },
    removeBudget: id => { setBudgets(p => p.filter(b => b.id !== id)); db.deleteBudget(id) },

    addRecurring: r => { setRecurring(p => [...p, r]); db.upsertRecurring(r) },
    removeRecurring: id => { setRecurring(p => p.filter(r => r.id !== id)); db.deleteRecurring(id) },
    updateRecurring: r => { setRecurring(p => p.map(x => x.id === r.id ? r : x)); db.upsertRecurring(r) },

    setTheme,

    savePatrimonySnapshot: s => {
      setPatrimony(p => {
        const updated = [...p.filter(x => x.date !== s.date), s].sort((a, b) => a.date.localeCompare(b.date))
        db.upsertSettings({ patrimony: updated })
        return updated
      })
    },

    addCustomCategory: c => {
      setCustomCategories(p => { const updated = [...p, c]; db.upsertSettings({ customCategories: updated }); return updated })
    },
    removeCustomCategory: id => {
      setCustomCategories(p => { const updated = p.filter(c => c.id !== id); db.upsertSettings({ customCategories: updated }); return updated })
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
