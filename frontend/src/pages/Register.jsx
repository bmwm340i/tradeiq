import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TRADING_STYLES = [
  { value: 'scalping', label: 'Scalping' },
  { value: 'day_trading', label: 'Day Trading' },
  { value: 'swing_trading', label: 'Swing Trading' },
  { value: 'position_trading', label: 'Position Trading' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    tradingStyle: 'day_trading', accountSize: 10000
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to TradeIQ 🚀')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-accent">
            <TrendingUp size={18} className="text-surface-900" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-700 text-white">TradeIQ</span>
        </div>

        <h3 className="font-display text-2xl font-700 text-white mb-2">Create your account</h3>
        <p className="text-slate-400 text-sm mb-8">
          Already have one?{' '}
          <Link to="/login" className="text-accent hover:text-accent-light transition-colors">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Alex Trader" value={form.name}
              onChange={e => set('name', e.target.value)} required />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)} required />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-11"
                placeholder="Min 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Trading Style</label>
              <select className="select" value={form.tradingStyle}
                onChange={e => set('tradingStyle', e.target.value)}>
                {TRADING_STYLES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Account Size ($)</label>
              <input type="number" className="input" min="100" value={form.accountSize}
                onChange={e => set('accountSize', Number(e.target.value))} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
            {loading
              ? <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
              : <>Create Account <ArrowRight size={16} /></>
            }
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-6">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
