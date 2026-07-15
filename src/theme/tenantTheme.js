// The tenant-tier "expose" allow-list. Keys are the props ChallengeThemeScope
// accepts; values are the base tokens they're permitted to set. Anything not
// listed here — including every LOCKED token in docs/theming.md — cannot be
// set through this path, by construction.
export const TENANT_TOKEN_MAP = {
  primaryColor: '--color-action-primary',
  progressMid: '--color-progress-mid',
  progressHigh: '--color-progress-high',
  progressPeak: '--color-progress-peak',
  displayFont: '--font-tenant-display',
  heroBg: '--color-tenant-hero-bg',
  heroText: '--color-tenant-hero-text',
  accentGlow: '--color-tenant-accent-glow',
}

const MAX_VALUE_LENGTH = 256
const UNSAFE_VALUE = /[;{}<>]/

function isSafeValue(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_VALUE_LENGTH &&
    !UNSAFE_VALUE.test(value)
  )
}

// Maps a tenant config object to a React `style` object of CSS custom
// properties. Unknown keys and unsafe/empty values are silently dropped —
// this function IS the enforcement of the tenant "expose" contract, not
// just documentation of it.
export function buildTenantThemeVars(theme) {
  const vars = {}
  if (!theme) return vars
  for (const [key, cssVar] of Object.entries(TENANT_TOKEN_MAP)) {
    const value = theme[key]
    if (isSafeValue(value)) vars[cssVar] = value
  }
  return vars
}
