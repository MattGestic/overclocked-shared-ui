import { useState } from 'react'
import {
  Avatar,
  ImageUpload,
  ToastProvider,
  useToast,
  TabBar,
  DayDots,
  ThemeProvider,
  useTheme,
  ChallengeThemeScope,
} from '../src/index.js'
import { buildTokenGroups, tokenCount, customizableCount, tenantCustomizableCount } from './tokens.js'

const TOKEN_GROUPS = buildTokenGroups()

function HomeIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function StatsIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 20V10M12 20V4M20 20v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ProfileIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  )
}

const TABS = [
  { id: 'home', label: 'HOME', icon: HomeIcon },
  { id: 'stats', label: 'STATS', icon: StatsIcon },
  { id: 'profile', label: 'PROFILE', icon: ProfileIcon },
]

function tokenClass(token) {
  const classes = ['token-card']
  if (token.customizable) classes.push('app-token')
  if (token.tenantCustomizable) classes.push('tenant-token')
  return classes.join(' ')
}

function TokenCard({ token }) {
  if (token.kind === 'radius') {
    return (
      <div className={tokenClass(token)}>
        <div className="raw-row">
          <div className="radius-preview" style={{ borderRadius: `var(--${token.name})` }} />
          <div className="token-meta">
            <span className="token-name">--{token.name}</span>
            <span className="token-value">{token.light}</span>
          </div>
        </div>
      </div>
    )
  }
  if (token.kind === 'shadow') {
    return (
      <div className={tokenClass(token)}>
        <div className="raw-row">
          <div className="shadow-preview" style={{ boxShadow: `var(--${token.name})` }} />
          <div className="token-meta">
            <span className="token-name">--{token.name}</span>
          </div>
        </div>
      </div>
    )
  }
  if (token.kind === 'size') {
    return (
      <div className={tokenClass(token)}>
        <div className="raw-row">
          <div className="size-preview" style={{ width: `var(--${token.name})`, height: 10, borderRadius: 4 }} />
          <div className="token-meta">
            <span className="token-name">--{token.name}</span>
            <span className="token-value">{token.light}</span>
          </div>
        </div>
      </div>
    )
  }
  if (token.kind === 'text-size') {
    return (
      <div className={tokenClass(token)}>
        <div className="raw-row">
          <span style={{ fontSize: `var(--${token.name})`, fontFamily: 'var(--font-body)' }}>Aa</span>
          <div className="token-meta">
            <span className="token-name">--{token.name}</span>
            <span className="token-value">{token.light}</span>
          </div>
        </div>
      </div>
    )
  }
  if (token.kind === 'font') {
    return (
      <div className={tokenClass(token)}>
        <div className="token-meta" style={{ padding: 'var(--space-3)' }}>
          <span className="token-name">--{token.name}</span>
          <span style={{ fontFamily: `var(--${token.name})`, fontSize: 'var(--text-lg)' }}>The quick fox</span>
          <span className="token-value">{token.light}</span>
        </div>
      </div>
    )
  }
  if (token.kind === 'color') {
    return (
      <div className={tokenClass(token)}>
        <div className="token-swatch" style={{ background: `var(--${token.name})` }} />
        <div className="token-meta">
          <span className="token-name">--{token.name}</span>
          <span className="token-value">L {token.light} · D {token.dark}</span>
        </div>
      </div>
    )
  }
  // raw: weights, tracking, durations, easing, z-index, aliases…
  return (
    <div className={`token-card${token.customizable ? ' app-token' : ''}`}>
      <div className="token-meta" style={{ padding: 'var(--space-3)' }}>
        <span className="token-name">--{token.name}</span>
        <span className="token-value">{token.light}</span>
      </div>
    </div>
  )
}

function TokenGroup({ group }) {
  const anyCustomizable = group.tokens.some(t => t.customizable)
  const anyTenant = group.tokens.some(t => t.tenantCustomizable)
  return (
    <div className="token-group">
      <h3>
        {group.label}
        {anyCustomizable && <span className="badge badge-app">has app-customizable tokens</span>}
        {anyTenant && <span className="badge badge-tenant">has tenant-customizable tokens</span>}
      </h3>
      <div className="token-grid">
        {group.tokens.map(t => (
          <TokenCard key={t.name} token={{ ...t, kind: group.kind }} />
        ))}
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { dark, toggleTheme } = useTheme()
  return (
    <button className="demo-toggle-btn" onClick={toggleTheme}>
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}

function ToastDemoButton() {
  const showToast = useToast()
  return (
    <button className="ui-btn ui-btn-primary" onClick={() => showToast('Workout logged!', 'success')}>
      Fire a toast
    </button>
  )
}

function OverrideDemo() {
  const [app, setApp] = useState('base')
  return (
    <section className="demo-section">
      <h2>Live layering demo</h2>
      <p className="section-desc">
        The three panels below render identical markup. Only the{' '}
        <code>data-app</code> attribute changes, which activates a different{' '}
        <code>@layer overclocked.app</code> rule (see <code>demo/demo.css</code>) —
        the same mechanism a real app's own stylesheet uses to override a handful
        of brand tokens on top of the shared base. Nothing else about the
        component changes.
      </p>
      <div className="demo-toggle-group" style={{ marginBottom: 'var(--space-4)' }}>
        {['base', 'repstack', 'overclock'].map(id => (
          <button
            key={id}
            className="demo-toggle-btn"
            data-active={app === id}
            onClick={() => setApp(id)}
          >
            {id === 'base' ? 'Base theme (no override)' : id === 'repstack' ? 'REP•STACK skin' : 'OVERCLOCK skin'}
          </button>
        ))}
      </div>
      <div className="override-demo" data-app={app === 'base' ? undefined : app}>
        <button className="ui-btn ui-btn-primary">Primary action</button>
        <span className="ui-chip ui-chip-lime">Streak x7</span>
        <DayDots startDate={new Date().toISOString()} durationDays={10} label={null} />
      </div>
    </section>
  )
}

const SPONSOR_THEMES = {
  none: null,
  acme: {
    primaryColor: '#ff6a00',
    progressMid: '#ffb84d',
    progressHigh: '#ff8c1a',
    progressPeak: '#c2410c',
    heroBg: 'linear-gradient(135deg, #1a1a1a, #ff6a00)',
    heroText: '#ffffff',
    accentGlow: 'rgba(255, 106, 0, 0.55)',
  },
  globex: {
    primaryColor: '#0ea5e9',
    progressMid: '#7dd3fc',
    progressHigh: '#38bdf8',
    progressPeak: '#0369a1',
    heroBg: 'linear-gradient(135deg, #0c1a2e, #0ea5e9)',
    heroText: '#ffffff',
    accentGlow: 'rgba(14, 165, 233, 0.55)',
  },
}

function TenantThemeDemo() {
  const [sponsor, setSponsor] = useState('acme')
  const theme = SPONSOR_THEMES[sponsor]

  return (
    <section className="demo-section">
      <h2>Tenant / sponsor theming (paid feature preview)</h2>
      <p className="section-desc">
        Scoped to a single challenge/programme, not the whole app — and set
        at runtime via inline custom properties (<code>ChallengeThemeScope</code>),
        not a stylesheet. Only the tokens in the tenant allow-list
        (<code>src/theme/tenantTheme.js</code>) can change; everything else on
        this page, including the app-skin demo above, is unaffected. See{' '}
        <code>docs/theming.md</code> § Tenant theming.
      </p>
      <div className="demo-toggle-group" style={{ marginBottom: 'var(--space-4)' }}>
        {Object.keys(SPONSOR_THEMES).map(id => (
          <button
            key={id}
            className="demo-toggle-btn"
            data-active={sponsor === id}
            onClick={() => setSponsor(id)}
          >
            {id === 'none' ? 'No sponsor (base)' : id === 'acme' ? 'Acme Corp' : 'Globex'}
          </button>
        ))}
      </div>

      <ChallengeThemeScope theme={theme} className="tenant-card">
        <div className="tenant-hero">
          <span className="tenant-hero-eyebrow">Sponsored challenge</span>
          <h3 className="tenant-hero-title">30-Day Push-Up Challenge</h3>
        </div>
        <div className="component-demo-row" style={{ padding: 'var(--space-5)' }}>
          <button className="ui-btn ui-btn-primary">Join challenge</button>
          <div className="tenant-ramp">
            <span className="tenant-ramp-step" style={{ background: 'var(--color-progress-low)' }} title="low" />
            <span className="tenant-ramp-step" style={{ background: 'var(--color-progress-mid)' }} title="mid" />
            <span className="tenant-ramp-step" style={{ background: 'var(--color-progress-high)' }} title="high" />
            <span className="tenant-ramp-step" style={{ background: 'var(--color-progress-peak)' }} title="peak" />
          </div>
        </div>
      </ChallengeThemeScope>
    </section>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultDark>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </ThemeProvider>
  )
}

function Shell() {
  return (
    <div className="demo-page">
      <header className="demo-header">
        <div>
          <h1>Overclocked Shared UI</h1>
          <p className="subtitle">
            {tokenCount} base tokens · {customizableCount} app-customizable · {tenantCustomizableCount} tenant-customizable
          </p>
        </div>
        <div className="demo-toggle-group">
          <ThemeToggle />
        </div>
      </header>

      <main className="demo-main">
        <section className="demo-section">
          <h2>Base theme tokens</h2>
          <p className="section-desc">
            Every custom property defined in <code>src/theme/tokens.css</code>,
            grouped by category, read directly from the file so this page can
            never go stale. Toggle light/dark above to see color swatches
            update live.
          </p>
          <div className="legend">
            <span className="badge badge-app">🔶 outline = app-customizable</span>
            <span className="badge badge-tenant">🟣 outline = tenant-customizable (scoped)</span>
            <span className="badge badge-base">no outline = locked, identical everywhere</span>
          </div>
          {TOKEN_GROUPS.map(group => (
            <TokenGroup key={group.label} group={group} />
          ))}
        </section>

        <OverrideDemo />

        <TenantThemeDemo />

        <section className="demo-section">
          <h2>Components</h2>
          <p className="section-desc">
            Every component currently exported from <code>src/components</code>.
          </p>

          <div className="component-showcase">
            <h3>Avatar</h3>
            <p className="component-desc">src/components/Avatar.jsx — image with initials fallback, deterministic color per id.</p>
            <div className="component-demo-row">
              <Avatar id="alice" name="Alice Nguyen" />
              <Avatar id="bob" name="Bob Smith" size={56} />
              <Avatar id="carol" name="Carol" highlight activeColor="var(--color-action-primary)" />
              <Avatar id="dana" name="Dana" avatarUrl="https://does-not-exist.example/broken.jpg" />
            </div>
          </div>

          <div className="component-showcase">
            <h3>ImageUpload</h3>
            <p className="component-desc">src/components/ImageUpload.jsx — crop-to-square upload control with pending/confirm state.</p>
            <div className="component-demo-row">
              <ImageUpload onUpload={async () => {}} />
              <ImageUpload onUpload={async () => {}} shape="square" label="UPLOAD COVER" />
            </div>
          </div>

          <div className="component-showcase">
            <h3>DayDots</h3>
            <p className="component-desc">src/components/DayDots.jsx — per-day activity dots for a streak/challenge window.</p>
            <DayDots
              startDate={new Date(Date.now() - 4 * 86400000).toISOString()}
              durationDays={14}
              dailyReps={{ [new Date().toDateString()]: 12 }}
              label="14 DAYS"
            />
          </div>

          <div className="component-showcase">
            <h3>Toast</h3>
            <p className="component-desc">src/components/Toast.jsx — ToastProvider + useToast(), rendered via context.</p>
            <div className="component-demo-row">
              <ToastDemoButton />
            </div>
          </div>

          <div className="component-showcase">
            <h3>TabBar</h3>
            <p className="component-desc">src/components/TabBar.jsx — fixed bottom navigation. Pinned to the bottom of this page.</p>
            <TabBarDemo />
          </div>
        </section>
      </main>
    </div>
  )
}

function TabBarDemo() {
  const [active, setActive] = useState('home')
  return <TabBar tabs={TABS} active={active} onNavigate={setActive} />
}
