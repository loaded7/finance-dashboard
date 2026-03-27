import { createContext, useContext, ReactNode } from 'react'
import Toast from '../components/Toast'
import { useToast } from './useToast'
import type { ToastType } from '../components/Toast'

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, addToast, removeToast } = useToast()
  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <Toast toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToastContext = () => useContext(ToastContext)
