import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { tradeAPI } from '../utils/api'
import { formatCurrency, formatDate, formatTime, pnlClass, FLAG_LABELS, SETUP_LABELS } from '../utils/helpers'
import toast from 'react-hot-toast'

const EMOTION_EMOJI = { calm:'😌',confident:'💪',anxious:'😰',excited:'🤩',fearful:'😨',greedy:'🤑',neutral:'😐' }

function TradeRow({ trade, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this trade?')) return
    setDeleting(true)
    try {
      await tradeAPI.delete(trade._id)
      onDelete(trade._id)
      toast.success('Trade deleted')
    } catch {
      toast.error('Failed to delete trade')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card p-0 overflow-hidden hover:border-surface-500 transition-colors">
      <div className="flex items-center gap-4 p-4">
        {/* Win/Loss indicator */}
        <div className={`w-1 self-stretch rounded-full ${trade.isWin ? 'bg-profit' : 'bg-loss'}`} />

        {/* Symbol + direction */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-semibold text-white">{trade.symbol}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
              trade.direction === 'long'
                ? 'bg-profit/10 border-profit/30 text-profit'
                : 'bg-loss/10 border-loss/30 text-loss'
            }`}>
              {trade.direction === 'long' ? '↑ Long' : '↓ Short'}
            </span>
            {trade.aiFlags?.length > 0 && (
              <div className="flex items-center gap-1">
                {trade.aiFlags.slice(0, 2).map(flag => (
                  <span key={flag} className="badge-warning text-xs">
                    {FLAG_LABELS[flag]}
                  </span>
                ))}
                {trade.aiFlags.length > 2 && (
                  <span className="text-xs text-warning">+{trade.aiFlags.length - 2}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>{formatDate(trade.entryTime)}</span>
            <span>{formatTime(trade.entryTime)}</span>
            <span className="text-slate-600">→</span>
            <span>{formatTime(trade.exitTime)}</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Setup */}
        <div className="hidden sm:block">
          <span className="badge badge-info text-xs">{SETUP_LABELS[trade.setup] || trade.setup}</span>
        </div>

        {/* Emotion */}
        <div className="hidden md:block text-lg" title={`Emotion: ${trade.emotion?.before}`}>
          {EMOTION_EMOJI[trade.emotion?.before] || '😐'}
        </div>

        {/* Followed plan */}
        {!trade.followedPlan && (
          <AlertTriangle size={14} className="text-warning hidden sm:block" title="Did not follow plan" />
        )}

        {/* Entry/Exit prices */}
        <div className="hidden lg:flex flex-col items-end text-xs font-mono text-slate-500">
          <span>${trade.entryPrice?.toFixed(2)} → ${trade.exitPrice?.toFixed(2)}</span>
          <span className="text-slate-600">{trade.contracts} {trade.market === 'futures' ? 'contracts' : 'shares'}</span>
        </div>

        {/* P&L */}
        <div className="text-right min-w-[80px]">
          <p className={`font-mono font-semibold ${pnlClass(trade.pnl)}`}>
            {formatCurrency(trade.pnl)}
          </p>
          {trade.rMultiple != null && (
            <p className="text-xs text-slate-500 font-mono">
              {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple.toFixed(2)}R
            </p>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-slate-600 hover:text-loss transition-colors p-1 shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Notes preview */}
      {trade.notes && (
        <div className="px-5 pb-3 pt-0">
          <p className="text-xs text-slate-500 truncate italic">"{trade.notes}"</p>
        </div>
      )}
    </div>
  )
}

export default function Journal() {
  const [trades, setTrades] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    symbol: '', direction: '', setup: '', isWin: '', startDate: '', endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  const setFilter = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1) }

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, sortBy: 'entryTime', sortOrder: 'desc', ...filters }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const res = await tradeAPI.getAll(params)
      setTrades(res.data.trades)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to load trades')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchTrades() }, [fetchTrades])

  const handleDelete = (id) => setTrades(p => p.filter(t => t._id !== id))

  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0)
  const wins = trades.filter(t => t.isWin).length

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Search by symbol…"
            value={filters.symbol}
            onChange={e => setFilter('symbol', e.target.value.toUpperCase())}
          />
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-accent text-accent' : ''}`}
        >
          <Filter size={14} />
          Filters
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span className="w-4 h-4 bg-accent text-surface-900 rounded-full text-xs flex items-center justify-center font-bold">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
          <div>
            <label className="label">Direction</label>
            <select className="select" value={filters.direction} onChange={e => setFilter('direction', e.target.value)}>
              <option value="">All</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div>
            <label className="label">Result</label>
            <select className="select" value={filters.isWin} onChange={e => setFilter('isWin', e.target.value)}>
              <option value="">All</option>
              <option value="true">Winners</option>
              <option value="false">Losers</option>
            </select>
          </div>
          <div>
            <label className="label">Setup</label>
            <select className="select" value={filters.setup} onChange={e => setFilter('setup', e.target.value)}>
              <option value="">All</option>
              {['breakout','pullback','reversal','trend_follow','range','news','other'].map(s => (
                <option key={s} value={s}>{SETUP_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn-ghost text-sm w-full" onClick={() => { setFilters({ symbol:'',direction:'',setup:'',isWin:'',startDate:'',endDate:'' }); setPage(1) }}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Summary bar */}
      {trades.length > 0 && (
        <div className="flex flex-wrap gap-4 px-1 text-sm">
          <span className="text-slate-500 font-mono">{pagination.total} trades</span>
          <span className="text-slate-600">·</span>
          <span className={`font-mono font-medium ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} shown
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 font-mono">
            {trades.length > 0 ? `${Math.round(wins / trades.length * 100)}% win rate` : ''}
          </span>
        </div>
      )}

      {/* Trade list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-20 rounded-xl" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-500 text-sm mb-2">No trades found</p>
          <p className="text-slate-600 text-xs">Try adjusting your filters or log some trades</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map(trade => (
            <TradeRow key={trade._id} trade={trade} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400 font-mono">
            {page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
