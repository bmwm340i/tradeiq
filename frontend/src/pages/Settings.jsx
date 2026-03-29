import { useState } from 'react'
import { User, Lock, Bell, Save } from 'lucide-react'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TRADING_STYLES = [
  { value: 'scalping', label: 'Scalping (seconds to minutes)' },
  { value: 'day_trading', label: 'Day Trading (intraday)' },
  { value: 'swing_trading', label: 'Swing Trading (days to weeks)' },
  { value: 'position_trading', label: 'Position Trading (weeks to months)' },
]

const MARKETS = ['stocks', 'options', 'futures', 'forex', 'crypto']

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    tradingStyle: user?.tradingStyle || 'day_trading',
    accountSize: user?.accountSize || 10000,
    riskPerTrade: user?.riskPerTrade || 1,
    preferredMarkets: user?.preferredMarkets || [],
    timezone: user?.timezone || 'America/New_York',
  })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const setP = (k, v) => setProfileForm(p => ({ ...p, [k]: v }))

  const toggleMarket = (m) => {
    setProfileForm(p => ({
      ...p,
      preferredMarkets: p.preferredMarkets.includes(m)
        ? p.preferredMarkets.filter(x => x !== m)
        : [...p.preferredMarkets, m]
    }))
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(profileForm)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ]

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-800 p-1 rounded-xl border border-surface-600 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card space-y-6 animate-fade-in">
          <div>
            <h4 className="font-semibold text-slate-200 mb-4 border-b border-surface-600 pb-3">Trading Profile</h4>

            {/* Avatar initial */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center">
                <span className="font-display text-2xl font-700 text-accent">
                  {profileForm.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-white">{profileForm.name}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Display Name</label>
            <input className="input" value={profileForm.name} onChange={e => setP('name', e.target.value)} />
          </div>

          <div>
            <label className="label">Trading Style</label>
            <select className="select" value={profileForm.tradingStyle} onChange={e => setP('tradingStyle', e.target.value)}>
              {TRADING_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Account Size ($)</label>
              <input type="number" className="input" min="100" value={profileForm.accountSize}
                onChange={e => setP('accountSize', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Risk Per Trade (%)</label>
              <input type="number" className="input" min="0.1" max="100" step="0.1"
                value={profileForm.riskPerTrade} onChange={e => setP('riskPerTrade', Number(e.target.value))} />
              <p className="text-xs text-slate-600 mt-1 font-mono">
                = ${((profileForm.accountSize * profileForm.riskPerTrade) / 100).toFixed(0)} per trade
              </p>
            </div>
          </div>

          <div>
            <label className="label">Preferred Markets</label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map(m => (
                <button
                  key={m} type="button"
                  onClick={() => toggleMarket(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    profileForm.preferredMarkets.includes(m)
                      ? 'bg-accent/15 border-accent/40 text-accent'
                      : 'bg-surface-700 border-surface-500 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Timezone</label>
            <select className="select" value={profileForm.timezone} onChange={e => setP('timezone', e.target.value)}>
              {[
                'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                'America/Toronto', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Singapore'
              ].map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
            </select>
          </div>

          <button onClick={saveProfile} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
              : <Save size={15} />
            }
            Save Changes
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card space-y-5 animate-fade-in">
          <h4 className="font-semibold text-slate-200 border-b border-surface-600 pb-3">Change Password</h4>

          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="••••••••"
              value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min 6 characters"
              value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" placeholder="••••••••"
              value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
          </div>

          <button onClick={changePassword} disabled={loading || !pwForm.currentPassword || !pwForm.newPassword}
            className="btn-primary flex items-center gap-2 disabled:opacity-40">
            {loading
              ? <div className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
              : <Lock size={15} />
            }
            Change Password
          </button>

          <div className="border-t border-surface-600 pt-5 mt-2">
            <h5 className="font-medium text-slate-300 mb-2">Account Info</h5>
            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <p>Email: {user?.email}</p>
              <p>User ID: {user?.id || user?._id}</p>
              <p>Created: {new Date(user?.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
