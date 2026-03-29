import { useState, useEffect } from 'react'
import { Brain, RefreshCw, TrendingUp, AlertTriangle, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { analysisAPI } from '../utils/api'
import { gradeColor, severityColor } from '../utils/helpers'
import toast from 'react-hot-toast'

function GradeCircle({ grade }) {
  const color = gradeColor(grade)
  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1c2333" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${['A','B','C','D','F'].indexOf(grade) >= 0 ? [100,80,60,40,20][['A','B','C','D','F'].indexOf(grade)] : 0} 251.2`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-3xl font-700" style={{ color }}>{grade || '?'}</span>
      </div>
    </div>
  )
}

function PatternCard({ pattern }) {
  const color = severityColor(pattern.severity)
  return (
    <div className={`card border-l-4 ${pattern.detected ? '' : 'opacity-50'}`}
      style={{ borderLeftColor: pattern.detected ? color : '#2e3a50' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {pattern.detected
            ? <AlertTriangle size={15} style={{ color }} />
            : <div className="w-4 h-4 rounded-full border border-surface-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-surface-400" />
              </div>
          }
          <h5 className="font-semibold text-sm text-slate-200">{pattern.pattern}</h5>
        </div>
        <span className="badge text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
          {pattern.severity}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-2 leading-relaxed">{pattern.description}</p>
      {pattern.detected && pattern.impact && (
        <p className="text-xs font-mono text-warning">Impact: {pattern.impact}</p>
      )}
    </div>
  )
}

function ImprovementCard({ item }) {
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0 font-mono text-accent text-xs font-semibold">
          {item.priority}
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-sm text-slate-200 mb-1">{item.title}</h5>
          <p className="text-xs text-slate-400 mb-2 leading-relaxed">{item.description}</p>
          <div className="bg-surface-700 rounded-lg px-3 py-2">
            <p className="text-xs text-accent font-medium mb-0.5">→ Action Step</p>
            <p className="text-xs text-slate-300">{item.actionStep}</p>
          </div>
          {item.expectedImpact && (
            <p className="text-xs text-profit mt-2 font-mono">{item.expectedImpact}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Analysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [flagging, setFlagging] = useState(false)

  const fetchAnalysis = async (offset = 0) => {
    setLoading(true)
    try {
      const res = await analysisAPI.getWeekly({ weekOffset: offset })
      setData(res.data)
    } catch (err) {
      if (err.response?.status === 429) {
        toast.error('AI rate limit reached. Try again in an hour.')
      } else {
        toast.error('Failed to get analysis')
      }
    } finally {
      setLoading(false)
    }
  }

  const flagAllTrades = async () => {
    setFlagging(true)
    try {
      const res = await analysisAPI.flagTrades({})
      toast.success(`Analyzed ${res.data.analyzed} trades, found ${res.data.flagged} with flags`)
    } catch {
      toast.error('Failed to flag trades')
    } finally {
      setFlagging(false)
    }
  }

  useEffect(() => { fetchAnalysis(weekOffset) }, [weekOffset])

  const { analysis, weeklyStats, weekRange } = data || {}
  const weekLabel = weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Last Week' : `${weekOffset} Weeks Ago`

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekOffset(p => p + 1)} className="btn-ghost p-2">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center min-w-32">
            <p className="font-semibold text-slate-200">{weekLabel}</p>
            {weekRange && (
              <p className="text-xs text-slate-500 font-mono">
                {new Date(weekRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                {new Date(weekRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          <button onClick={() => setWeekOffset(p => Math.max(0, p - 1))} disabled={weekOffset === 0} className="btn-ghost p-2 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={flagAllTrades}
            disabled={flagging}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {flagging
              ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              : <AlertTriangle size={14} />
            }
            Flag Trades
          </button>
          <button
            onClick={() => fetchAnalysis(weekOffset)}
            disabled={loading}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
              : <Brain size={14} />
            }
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* No data state */}
      {!loading && !analysis && data?.message && (
        <div className="card text-center py-16">
          <Brain size={48} className="text-slate-600 mx-auto mb-4" />
          <h4 className="font-display text-xl font-700 text-slate-400 mb-2">No Trades This Week</h4>
          <p className="text-slate-500 text-sm mb-6">Log some trades to see your AI-powered analysis</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
        </div>
      )}

      {/* Analysis content */}
      {analysis && !loading && (
        <>
          {/* Overview */}
          <div className="card">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <GradeCircle grade={analysis.overallGrade} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                  <Brain size={16} className="text-accent" />
                  <h4 className="font-display text-lg font-700 text-white">Weekly Performance Grade</h4>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{analysis.summary}</p>
                <p className="text-xs text-slate-500 italic font-mono">{analysis.gradeRationale}</p>
                {analysis.aiConfidence && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 bg-surface-600 rounded-full">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${analysis.aiConfidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {Math.round(analysis.aiConfidence * 100)}% confidence
                    </span>
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:min-w-36">
                <div className="text-center bg-surface-700 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-mono mb-0.5">Win Rate</p>
                  <p className="font-mono font-semibold text-slate-200">{weeklyStats?.winRate?.toFixed(1)}%</p>
                </div>
                <div className="text-center bg-surface-700 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-mono mb-0.5">Total P&L</p>
                  <p className={`font-mono font-semibold ${weeklyStats?.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {weeklyStats?.totalPnl >= 0 ? '+' : ''}${weeklyStats?.totalPnl?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Behavioral patterns */}
          {analysis.behavioralPatterns?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" />
                Behavioral Patterns
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {analysis.behavioralPatterns.map((p, i) => (
                  <PatternCard key={i} pattern={p} />
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements?.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-accent" />
                Priority Improvements
              </h4>
              <div className="space-y-4">
                {analysis.improvements.map((item, i) => (
                  <ImprovementCard key={i} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Two column: strengths + next week */}
          <div className="grid sm:grid-cols-2 gap-6">
            {analysis.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Star size={16} className="text-profit" />
                  What You Did Well
                </h4>
                <div className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="card border-l-4 border-profit">
                      <h5 className="font-semibold text-sm text-slate-200 mb-1">{s.title}</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Best trading window */}
              {analysis.bestTradingWindow && (
                <div className="card">
                  <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-info" />
                    Your Best Window
                  </h4>
                  <div className="bg-surface-700 rounded-xl p-4 text-center mb-3">
                    <p className="font-mono text-2xl font-semibold text-info">{analysis.bestTradingWindow.timeRange}</p>
                    <p className="text-xs text-slate-500 mt-1">{analysis.bestTradingWindow.winRate} win rate</p>
                  </div>
                  <p className="text-xs text-slate-400">{analysis.bestTradingWindow.recommendation}</p>
                </div>
              )}

              {/* Next week focus */}
              {analysis.nextWeekFocus?.length > 0 && (
                <div className="card">
                  <h4 className="font-semibold text-slate-200 mb-3">Next Week Focus</h4>
                  <div className="space-y-2">
                    {analysis.nextWeekFocus.map((focus, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded bg-accent/15 border border-accent/30 flex items-center justify-center mt-0.5 shrink-0 text-accent text-xs font-mono">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-300">{focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Psychological insight */}
              {analysis.psychologicalInsight && (
                <div className="card bg-accent/5 border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-accent" />
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider">AI Insight</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{analysis.psychologicalInsight}"</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
