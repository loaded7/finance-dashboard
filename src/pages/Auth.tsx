import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg.includes('Invalid login')) setError('Email ou senha incorretos')
      else if (msg.includes('already registered')) setError('Email já cadastrado')
      else if (msg.includes('Password should')) setError('Senha deve ter pelo menos 6 caracteres')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors'

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
            <Wallet size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FinDash</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle Financeiro Pessoal</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" required placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'} required placeholder="Senha" value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${inputCls} pl-9 pr-10`}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
