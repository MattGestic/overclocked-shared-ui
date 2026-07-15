import { buildTenantThemeVars } from './tenantTheme'

// Wraps one sponsored challenge/programme's UI. `theme` is a plain object
// keyed by TENANT_TOKEN_MAP's prop names (see tenantTheme.js) — anything
// else is ignored. Overrides are inline custom properties, so they always
// win over overclocked.base/overclocked.app for descendants, and never
// leak outside this subtree (unlike the app-wide theme layer).
export default function ChallengeThemeScope({ theme, as: Tag = 'div', style, children, ...rest }) {
  const vars = buildTenantThemeVars(theme)
  const isThemed = Object.keys(vars).length > 0

  return (
    <Tag data-tenant-theme={isThemed ? '' : undefined} style={{ ...vars, ...style }} {...rest}>
      {children}
    </Tag>
  )
}
