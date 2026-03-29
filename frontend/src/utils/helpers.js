export const formatCurrency = (val, decimals = 2) => {
  if (val == null || isNaN(val)) return '—'
  const abs = Math.abs(val)
  const formatted = abs >= 1000
    ? abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : abs.toFixed(decimals)
  return `${val >= 0 ? '+' : '-'}$${formatted}`
}

export const formatPct = (val, decimals = 1) => {
  if (val == null || isNaN(val)) return '—'
  return `${val >= 0 ? '+' : ''}${val.toFixed(decimals)}%`
}

export const pnlClass = (val) => {
  if (val == null) return 'neutral-text'
  return val > 0 ? 'profit-text' : val < 0 ? 'loss-text' : 'neutral-text'
}

export const pnlColor = (val) => {
  if (val == null) return '#64748b'
  return val > 0 ? '#00d4aa' : val < 0 ? '#ff4d6d' : '#64748b'
}

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export const formatTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return `${formatDate(date)} ${formatTime(date)}`
}

export const gradeColor = (grade) => {
  const colors = { A: '#00d4aa', B: '#4dabf7', C: '#ffb347', D: '#ff8c42', F: '#ff4d6d' }
  return colors[grade] || '#64748b'
}

export const severityColor = (severity) => {
  const colors = { high: '#ff4d6d', medium: '#ffb347', low: '#4dabf7' }
  return colors[severity] || '#64748b'
}

export const FLAG_LABELS = {
  revenge_trade: 'Revenge Trade',
  oversize: 'Oversizing',
  fomo: 'FOMO Entry',
  no_stop_loss: 'No Stop Loss',
  emotional: 'Emotional Trade',
  plan_deviation: 'Off-Plan',
  overtrading: 'Overtrading'
}

export const EMOTION_EMOJIS = {
  calm: '😌', confident: '💪', anxious: '😰', excited: '🤩',
  fearful: '😨', greedy: '🤑', neutral: '😐',
  satisfied: '😊', regretful: '😔', angry: '😤', relieved: '😮‍💨'
}

export const SETUP_LABELS = {
  breakout: 'Breakout', pullback: 'Pullback', reversal: 'Reversal',
  trend_follow: 'Trend Follow', range: 'Range', news: 'News', other: 'Other'
}
