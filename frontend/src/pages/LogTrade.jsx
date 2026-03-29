import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { tradeAPI } from '../utils/api'
import toast from 'react-hot-toast'

const SYMBOLS = ['ES', 'NQ', 'MES', 'MNQ', 'SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'META', 'GOOGL', 'AMD', 'COIN', 'BTC', 'ETH', 'SOL']
const SETUPS = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'pullback', label: 'Pullback / Retracement' },
  { value: 'reversal', label: 'Reversal' },
  { value: 'trend_follow', label: 'Trend Follow' },
  { value: 'range', label: 'Range / Mean Reversion' },
  { value: 'news', label: 'News Catalyst' },
  { value: 'other', label: 'Other' },
]
const MARKETS = ['stocks', 'options', 'futures', 'forex', 'crypto']
const EMOTIONS = ['calm', 'confident', 'anxious', 'excited', 'fearful', 'greedy', 'neutral']
const AFTER_EMOTIONS = ['calm', 'satisfied', 'regretful', 'angry', 'relieved', 'neutral']
const EMOTION_EMOJI = {
  calm: '😌', confident: '💪', anxious: '😰', excited: '🤩',
  fearful: '😨', greedy: '🤑', neutral: '😐',
  satisfied: '😊', regretful: '😔', angry: '😤', relieved: '😮‍💨'
}

const today = () => {
  const d = new Date()
  return d.toISOString().slice(0, 16)
}

const initialForm = {
  symbol: '', direction: 'long', entryPrice: '', exitPrice: '',
  contracts: '', entryTime: today(), exitTime: today(),
  setup: 'breakout', market: 'stocks',
  stopLoss: '', takeProfit: '',
  emotion: { before: 'neutral', during: 'neutral', after: 'neutral' },
  followedPlan: true, notes: '', tags: ''
}

export default function LogTrade() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const setEmotion = (k, v) => setForm(p => ({ ...p, emotion: { ...p.emotion, [k]: v } }))

  // Computed preview
  const entryNum = parseFloat(form.entryPrice)
  const exitNum = parseFloat(form.exitPrice)
  const contractsNum = parseFloat(form.contracts)
  const hasPnl = !isNaN(entryNum) && !isNaN(exitNum) && !isNaN(contractsNum) && contractsNum > 0
  const multiplier = form.direction === 'long' ? 1 : -1
  const pnl = hasPnl ? multiplier * (exitNum - entryNum) * contractsNum : null
  const pnlPct = hasPnl ? multiplier * ((exitNum - entryNum) / entryNum) * 100 : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
        takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
        entryPrice: parseFloat(form.entryPrice),
        exitPrice: parseFloat(form.exitPrice),
        contracts: parseFloat(form.contracts),
      }
      await tradeAPI.create(payload)
      setSuccess(true)
      toast.success('Trade logged successfully!')
      setTimeout(() => {
        setForm(initialForm)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log trade')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="flex items-center justify-center min-h-96 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-profit/15 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-profit" />
        </div>
        <h3 className="font-display text-2xl font-700 text-white">Trade Logged!</h3>
        <p className="text-slate-400">
          P&L:{' '}
          <span className={`font-mono font-semibold ${pnl != null ? (pnl >= 0 ? 'text-profit' : 'text-loss') : 'text-slate-400'}`}>
            {pnl != null ? `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}` : '—'}
          </span>
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => { setForm(initialForm); setSuccess(false) }} className="btn-primary">
            Log Another
          </button>
          <button onClick={() => navigate('/journal')} className="btn-secondary">
            View Journal
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Basic info */}
      <div className="card space-y-5">
        <h4 className="font-semibold text-slate-200 border-b border-surface-600 pb-3">Trade Details</h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Symbol</label>
            <div className="relative">
              <input
                list="symbols-list"
                className="input uppercase"
                placeholder="ES, SPY…"
                value={form.symbol}
                onChange={e => set('symbol', e.target.value.toUpperCase())}
                required
              />
              <datalist id="symbols-list">
                {SYMBOLS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="label">Direction</label>
            <div className="flex gap-2">
              {['long', 'short'].map(d => (
                <button
                  key={d} type="button"
                  onClick={() => set('direction', d)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    form.direction === d
                      ? d === 'long'
                        ? 'bg-profit/15 border-profit/40 text-profit'
                        : 'bg-loss/15 border-loss/40 text-loss'
                      : 'bg-surface-700 border-surface-500 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {d === 'long' ? '↑ Long' : '↓ Short'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Market</label>
            <select className="select" value={form.market} onChange={e => set('market', e.target.value)}>
              {MARKETS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Setup</label>
            <select className="select" value={form.setup} onChange={e => set('setup', e.target.value)}>
              {SETUPS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">Entry Price</label>
            <input type="number" step="0.01" className="input" placeholder="0.00"
              value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} required />
          </div>
          <div>
            <label className="label">Exit Price</label>
            <input type="number" step="0.01" className="input" placeholder="0.00"
              value={form.exitPrice} onChange={e => set('exitPrice', e.target.value)} required />
          </div>
          <div>
            <label className="label">Contracts / Shares</label>
            <input type="number" step="0.01" className="input" placeholder="1"
              value={form.contracts} onChange={e => set('contracts', e.target.value)} required />
          </div>

          {/* PnL Preview */}
          <div className="flex flex-col justify-end">
            <div className={`rounded-lg border p-3 text-center ${
              pnl == null ? 'border-surface-500 bg-surface-700'
              : pnl >= 0 ? 'border-profit/30 bg-profit/10'
              : 'border-loss/30 bg-loss/10'
            }`}>
              <p className="text-xs text-slate-500 mb-0.5">Est. P&L</p>
              <p className={`font-mono font-semibold text-lg ${
                pnl == null ? 'text-slate-600'
                : pnl >= 0 ? 'text-profit'
                : 'text-loss'
              }`}>
                {pnl != null ? `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}` : '—'}
              </p>
              {pnlPct != null && (
                <p className="text-xs text-slate-500 font-mono">
                  {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Entry Time</label>
            <input type="datetime-local" className="input"
              value={form.entryTime} onChange={e => set('entryTime', e.target.value)} required />
          </div>
          <div>
            <label className="label">Exit Time</label>
            <input type="datetime-local" className="input"
              value={form.exitTime} onChange={e => set('exitTime', e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stop Loss (optional)</label>
            <input type="number" step="0.01" className="input" placeholder="0.00"
              value={form.stopLoss} onChange={e => set('stopLoss', e.target.value)} />
          </div>
          <div>
            <label className="label">Take Profit (optional)</label>
            <input type="number" step="0.01" className="input" placeholder="0.00"
              value={form.takeProfit} onChange={e => set('takeProfit', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Emotions */}
      <div className="card space-y-5">
        <h4 className="font-semibold text-slate-200 border-b border-surface-600 pb-3">Trading Psychology</h4>

        {[
          { key: 'before', label: 'Before Entry', options: EMOTIONS },
          { key: 'during', label: 'During Trade', options: EMOTIONS },
          { key: 'after', label: 'After Exit', options: AFTER_EMOTIONS },
        ].map(({ key, label, options }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <div className="flex flex-wrap gap-2">
              {options.map(em => (
                <button
                  key={em} type="button"
                  onClick={() => setEmotion(key, em)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    form.emotion[key] === em
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-surface-700 border-surface-500 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {EMOTION_EMOJI[em]} {em}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('followedPlan', !form.followedPlan)}
            className={`w-11 h-6 rounded-full transition-all relative ${
              form.followedPlan ? 'bg-accent' : 'bg-surface-500'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
              form.followedPlan ? 'left-6' : 'left-1'
            }`} />
          </button>
          <label className="text-sm text-slate-300 cursor-pointer" onClick={() => set('followedPlan', !form.followedPlan)}>
            I followed my trading plan
          </label>
          {!form.followedPlan && (
            <span className="flex items-center gap-1 text-xs text-warning">
              <AlertCircle size={12} /> AI will flag this
            </span>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="card space-y-4">
        <h4 className="font-semibold text-slate-200 border-b border-surface-600 pb-3">Notes & Tags</h4>
        <div>
          <label className="label">Trade Notes</label>
          <textarea
            className="input resize-none h-28"
            placeholder="What happened? Why did you enter? What would you do differently?"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
          <p className="text-xs text-slate-600 mt-1 font-mono">{form.notes.length}/2000</p>
        </div>
        <div>
          <label className="label">Tags (comma separated)</label>
          <input className="input" placeholder="gap-fill, morning-session, news-trade"
            value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-base">
          {loading ? (
            <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <><CheckCircle size={18} /> Log Trade</>
          )}
        </button>
        <button type="button" onClick={() => setForm(initialForm)} className="btn-secondary px-6">
          Reset
        </button>
      </div>
    </form>
  )
}
