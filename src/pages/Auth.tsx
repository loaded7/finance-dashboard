import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Check if coming from reset email link
  useState(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) setMode('reset')
  })

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
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#type=recovery`,
        })
        if (error) throw error
        setSuccess('Email enviado! Verifique sua caixa de entrada.')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) throw error
        setSuccess('Senha alterada com sucesso!')
        setTimeout(() => setMode('login'), 2000)
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

  const titles = { login: 'Entrar na sua conta', signup: 'Criar conta', forgot: 'Recuperar senha', reset: 'Nova senha' }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
            <Wallet size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FinDash</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle Financeiro Pessoal</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{titles[mode]}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'reset' && (
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required placeholder="Email" value={email}
                  onChange={e => setEmail(e.target.value)} className={`${inputCls} pl-9`} />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} required placeholder="Senha" value={password}
                  onChange={e => setPassword(e.target.value)} className={`${inputCls} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} required placeholder="Nova senha (mín. 6 caracteres)"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className={`${inputCls} pl-9 pr-10`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : mode === 'forgot' ? 'Enviar email' : 'Salvar nova senha'}
            </button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                  className="block w-full text-sm text-gray-400 hover:text-green-500 transition-colors">
                  Esqueci minha senha
                </button>
                <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Não tem conta? Cadastre-se
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'forgot') && (
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
