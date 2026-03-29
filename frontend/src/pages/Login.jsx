import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async () => {
    setLoading(true)
    try {
      await login('demo@tradeiq.app', 'demo1234')
      toast.success('Logged in as demo user')
      navigate('/')
    } catch {
      toast.error('Demo account not available — run npm run seed first')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface-800 border-r border-surface-600 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-accent">
            <TrendingUp size={20} className="text-surface-900" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-700 text-white">TradeIQ</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display text-4xl font-700 text-white leading-tight mb-4">
              Stop guessing.<br />
              <span className="text-accent">Start understanding</span><br />
              your trades.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              AI that reads your journal and tells you exactly why you're losing money — before you do it again.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Revenge Trade Detection', desc: 'Flags emotional loss-chasing before it costs you' },
              { label: 'Weekly Behavioral Reports', desc: 'Patterns you can\'t see, AI can' },
              { label: 'Best Time-of-Day Analysis', desc: 'Trade when your edge is highest' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 font-mono">© 2025 TradeIQ. Built for serious traders.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-surface-900" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-700 text-white">TradeIQ</span>
          </div>

          <h3 className="font-display text-2xl font-700 text-white mb-2">Sign in</h3>
          <p className="text-slate-400 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light transition-colors">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? (
                <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-600" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-900 px-4 text-xs text-slate-500">or</span>
            </div>
          </div>

          <button
            onClick={demoLogin}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Try Demo Account
          </button>
        </div>
      </div>
    </div>
  )
}
