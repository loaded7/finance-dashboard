import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { StoreProvider } from './store/StoreContext'
import { ToastProvider } from './hooks/ToastContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Investments from './pages/Investments'
import Watchlist from './pages/Watchlist'
import Goals from './pages/Goals'
import Emergency from './pages/Emergency'
import Reports from './pages/Reports'
import Budget from './pages/Budget'
import Recurring from './pages/Recurring'
import Calculators from './pages/Calculators'
import Notes from './pages/Notes'
import Debts from './pages/Debts'
import CashFlow from './pages/CashFlow'
import Patrimony from './pages/Patrimony'
import Settings from './pages/Settings'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="investments" element={<Investments />} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="goals" element={<Goals />} />
              <Route path="budget" element={<Budget />} />
              <Route path="recurring" element={<Recurring />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="reports" element={<Reports />} />
              <Route path="calculators" element={<Calculators />} />
              <Route path="notes" element={<Notes />} />
              <Route path="debts" element={<Debts />} />
              <Route path="cashflow" element={<CashFlow />} />
              <Route path="patrimony" element={<Patrimony />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  </StrictMode>
)
