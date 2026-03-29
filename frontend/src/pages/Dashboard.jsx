import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { tradeAPI } from '../utils/api'
import { formatCurrency, formatPct, pnlClass, pnlColor } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: '#161b27', border: '1px solid #252d3d',
    borderRadius: '8px', fontFamily: 'IBM Plex Mono', fontSize: '12px'
  },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#00d4aa' }
}

function StatCard({ label, value, sub, icon: Icon, color = 'accent', trend }) {
  const colorMap = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    profit: 'text-profit bg-profit/10 border-profit/20',
    loss: 'text-loss bg-loss/10 border-loss/20',
    info: 'text-info bg-info/10 border-info/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  }
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-mono font-medium ${colorMap[color].split(' ')[0]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentTrades, setRecentTrades] = useState([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, tradesRes] = await Promise.all([
        tradeAPI.getStats(),
        tradeAPI.getAll({ limit: 5, sortBy: 'entryTime', sortOrder: 'desc' })
      ])
      setStats(statsRes.data)
      setRecentTrades(tradesRes.data.trades)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const dailyData = stats?.dailyPnl?.map(d => ({
    date: d._id.slice(5),
    pnl: parseFloat(d.dailyPnl.toFixed(2)),
    trades: d.count
  })) || []

  const cumulativePnl = dailyData.reduce((acc, d, i) => {
    const prev = i > 0 ? acc[i - 1].cumulative : 0
    acc.push({ ...d, cumulative: parseFloat((prev + d.pnl).toFixed(2)) })
    return acc
  }, [])

  const hourData = stats?.byHour?.map(h => ({
    hour: `${h._id}:00`,
    winRate: parseFloat(h.winRate.toFixed(1)),
    pnl: parseFloat(h.totalPnl.toFixed(2)),
    trades: h.count
  })) || []

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-72" />
    </div>
  )

  const { overview } = stats || {}

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome banner */}
      <div className="card bg-gradient-to-r from-surface-700 to-surface-800 border-surface-500 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-700 text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {overview?.totalTrades
              ? `${overview.totalTrades} trades logged. Win rate: ${overview.winRate?.toFixed(1)}%`
              : 'Start logging trades to see your analysis'}
          </p>
        </div>
        <Link to="/log" className="btn-primary hidden sm:flex items-center gap-2 shrink-0">
          Log Trade <TrendingUp size={15} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total P&L"
          value={formatCurrency(overview?.totalPnl, 0)}
          sub={`${overview?.totalTrades || 0} trades`}
          icon={overview?.totalPnl >= 0 ? TrendingUp : TrendingDown}
          color={overview?.totalPnl >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="Win Rate"
          value={`${overview?.winRate?.toFixed(1) || 0}%`}
          sub={`${overview?.wins || 0}W / ${overview?.losses || 0}L`}
          icon={Target}
          color="accent"
        />
        <StatCard
          label="Avg Trade"
          value={formatCurrency(overview?.avgPnl)}
          sub={`Best: ${formatCurrency(overview?.bestTrade)}`}
          icon={Zap}
          color={overview?.avgPnl >= 0 ? 'profit' : 'loss'}
        />
        <StatCard
          label="Profit Factor"
          value={overview?.profitFactor ? overview.profitFactor.toFixed(2) : '—'}
          sub={`Worst: ${formatCurrency(overview?.worstTrade)}`}
          icon={AlertTriangle}
          color={overview?.profitFactor >= 1.5 ? 'profit' : overview?.profitFactor >= 1 ? 'warning' : 'loss'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative PnL */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-semibold text-slate-200">Equity Curve</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Last 30 days cumulative P&L</p>
            </div>
            <span className={`text-sm font-mono font-medium ${pnlClass(overview?.totalPnl)}`}>
              {formatCurrency(overview?.totalPnl, 0)}
            </span>
          </div>
          {cumulativePnl.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cumulativePnl}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={v => [formatCurrency(v), 'Cumulative']} />
                <ReferenceLine y={0} stroke="#2e3a50" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="cumulative" stroke="#00d4aa" strokeWidth={2} fill="url(#pnlGrad)" dot={false} activeDot={{ r: 4, fill: '#00d4aa' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
              No trades logged yet
            </div>
          )}
        </div>

        {/* Best hours */}
        <div className="card">
          <div className="mb-6">
            <h4 className="font-semibold text-slate-200">Best Trading Hours</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Win rate by time of day</p>
          </div>
          {hourData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourData} layout="vertical" barSize={8}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="hour" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} width={40} />
                <Tooltip {...CHART_TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Win Rate']} />
                <Bar dataKey="winRate" fill="#00d4aa" radius={[0, 4, 4, 0]} background={{ fill: '#1c2333', radius: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Recent trades */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h4 className="font-semibold text-slate-200">Recent Trades</h4>
          <Link to="/journal" className="text-accent text-sm hover:text-accent-light flex items-center gap-1 transition-colors">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        {recentTrades.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm mb-3">No trades logged yet</p>
            <Link to="/log" className="btn-primary inline-flex items-center gap-2">
              Log your first trade
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrades.map(trade => (
              <div key={trade._id}
                className="flex items-center gap-4 px-4 py-3 bg-surface-700 rounded-xl hover:bg-surface-600 transition-colors">
                <div className={`w-2 h-2 rounded-full ${trade.isWin ? 'bg-profit' : 'bg-loss'}`} />
                <span className="font-mono font-medium text-slate-200 w-16">{trade.symbol}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  trade.direction === 'long' ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'
                }`}>{trade.direction.toUpperCase()}</span>
                <span className="text-xs text-slate-500 font-mono flex-1">
                  {new Date(trade.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {trade.aiFlags?.length > 0 && (
                  <AlertTriangle size={13} className="text-warning" title="AI flags detected" />
                )}
                <span className={`font-mono text-sm font-medium ${pnlClass(trade.pnl)}`}>
                  {formatCurrency(trade.pnl)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
