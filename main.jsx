import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================================
// EMCE LOGO
// ============================================================================
function EmceLogo({ size = 'large' }) {
  const cls = size === 'large' ? 'emce-logo' : 'nav-logo'
  return (
    <div className={cls}>
      <div className="half-left">EMCE</div>
      <div className="half-right">MAINTENANCE AND CONSTRUCTION W.L.L.</div>
    </div>
  )
}

// ============================================================================
// LOGIN PAGE
// ============================================================================
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [division, setDivision] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          // Create profile
          await supabase.from('profiles').insert([{
            user_id: data.user.id,
            full_name: fullName,
            division: division,
            role: 'engineer'
          }])
          setSuccess('Account created. Please check your email if confirmation is required, then sign in.')
          setIsSignUp(false)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onLogin(data.user)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <EmceLogo size="large" />
        <p className="login-subtitle">Asset Check Management System</p>

        <div className="login-card">
          <h2 className="login-title">
            {isSignUp ? 'Create Your Account' : 'Sign In to Continue'}
          </h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isSignUp && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    required
                  >
                    <option value="">Select Division</option>
                    <option value="Heavy Equipment">Heavy Equipment</option>
                    <option value="Light Vehicles">Light Vehicles</option>
                    <option value="Tools & Materials">Tools & Materials</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Password
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="login-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              className="toggle-btn"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>

        <p className="login-footer">Kingdom of Bahrain · EMCE Construction</p>
      </div>
    </div>
  )
}

// ============================================================================
// DASHBOARD VIEW
// ============================================================================
function DashboardView({ user }) {
  const [stats, setStats] = useState({ vehicles: 0, machinery: 0, checks: 0, openIssues: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [v, m, c] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('machinery').select('id', { count: 'exact', head: true }),
        supabase.from('vehicle_checks').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        vehicles: v.count || 0,
        machinery: m.count || 0,
        checks: c.count || 0,
        openIssues: 0
      })
    } catch (e) {
      console.error('Stats error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your fleet and inspections</p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Vehicles</div>
          <div className="kpi-value">{stats.vehicles}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Machinery</div>
          <div className="kpi-value">{stats.machinery}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Checks</div>
          <div className="kpi-value">{stats.checks}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open Issues</div>
          <div className="kpi-value">{stats.openIssues}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Welcome, {user.email}</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
          Your EMCE Asset Check system is live. Use the <b>Daily Check</b> tab to complete inspections.
          Add vehicles and machinery through Supabase Table Editor, then your team can record daily checks here.
        </p>
      </div>
    </>
  )
}

// ============================================================================
// DAILY CHECK VIEW
// ============================================================================
function DailyCheckView({ user }) {
  const [items, setItems] = useState({
    oil: false, coolant: false, brakes: false, tires: false, lights: false,
    battery: false, mirrors: false, horn: false, wipers: false, fuel: false, body: false
  })
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const checkItems = [
    { key: 'oil', label: 'Oil Level' },
    { key: 'coolant', label: 'Coolant Level' },
    { key: 'brakes', label: 'Brakes Operational' },
    { key: 'tires', label: 'Tire Pressure & Condition' },
    { key: 'lights', label: 'Lights (Headlights, Indicators)' },
    { key: 'battery', label: 'Battery Terminals' },
    { key: 'mirrors', label: 'Mirrors Adjusted' },
    { key: 'horn', label: 'Horn Working' },
    { key: 'wipers', label: 'Wipers & Washer Fluid' },
    { key: 'fuel', label: 'Fuel Level' },
    { key: 'body', label: 'Body Condition (No Damage)' }
  ]

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase.from('vehicle_checks').insert([{
        engineer_id: user.id,
        check_items: items,
        notes,
        has_issues: Object.values(items).some(v => !v)
      }])
      if (error) throw error
      setSaved(true)
      setItems(Object.fromEntries(Object.keys(items).map(k => [k, false])))
      setNotes('')
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const completedCount = Object.values(items).filter(Boolean).length

  return (
    <>
      <h1 className="page-title">Daily Vehicle Check</h1>
      <p className="page-subtitle">
        {completedCount} of {checkItems.length} items completed
      </p>

      <div className="card">
        <div className="card-title">Inspection Checklist</div>
        {checkItems.map(item => (
          <div key={item.key} className="checklist-item">
            <input
              type="checkbox"
              id={item.key}
              checked={items[item.key]}
              onChange={(e) => setItems({ ...items, [item.key]: e.target.checked })}
            />
            <label htmlFor={item.key}>{item.label}</label>
            {items[item.key] && <span className="badge badge-success">OK</span>}
          </div>
        ))}

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Notes / Issues</label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any issues, comments, or things to follow up on..."
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {saved && <div className="alert alert-success">✓ Check saved successfully!</div>}

        <button
          className="btn btn-sm"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: '16px' }}
        >
          {saving ? 'Saving...' : 'Save Check'}
        </button>
      </div>
    </>
  )
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Login onLogin={setUser} />

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          <EmceLogo size="small" />
          <span className="nav-title">Asset Check System</span>
        </div>
        <div className="nav-actions">
          <span className="nav-user">{user.email}</span>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${tab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab ${tab === 'check' ? 'active' : ''}`}
            onClick={() => setTab('check')}
          >
            Daily Check
          </button>
        </div>

        {tab === 'dashboard' && <DashboardView user={user} />}
        {tab === 'check' && <DailyCheckView user={user} />}
      </div>
    </div>
  )
}
