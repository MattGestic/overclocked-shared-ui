# Theming architecture

`@overclocked/shared-ui` ships one base design theme that every app builds
on (`REP•STACK`, `OVERCLOCK`, and any future app). Apps are expected to look
and feel consistent, but each needs its own identity — a different brand
accent, a different display font, a different chart color. On top of that,
individual challenges (REP•STACK) or programmes (OVERCLOCK) can be
sponsor-branded by a company — a paid feature, scoped to just that one
challenge/programme, not the whole app. This document describes how the
token structure supports all three levels at once.

## The two axes

1. **Light / dark** — `[data-theme="light"]` and `[data-theme="dark"]` on
   `<html>`, toggled at runtime via `ThemeProvider`/`useTheme` (see
   [`src/hooks/useTheme.jsx`](../src/hooks/useTheme.jsx)). Every token is
   defined for both.
2. **Base → app → tenant** — a three-tier override stack, described below.
   This is the axis that lets an app, and then a single challenge/programme
   within that app, customize the theme without forking it.

## Tier 1 & 2: base and app, via CSS cascade layers

`src/theme/tokens.css` declares the layer order once, at the top of the file:

```css
@layer overclocked.base, overclocked.app, overclocked.tenant;
```

All of the shared tokens, resets, and component recipes shipped by this
package live inside `@layer overclocked.base { ... }`. Declaring the order
up front is the whole mechanism:

- **Top layer wins, unconditionally.** In [CSS cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer),
  a later-declared layer beats an earlier one for the *same* custom
  property, no matter how specific either selector is. An app rule as
  simple as `[data-theme="dark"] { --color-brand-lime: ... }` inside
  `overclocked.app` will always beat the base package's rule, even though
  the base rule looks equally (or more) specific.
- **Traceable.** Because the override lives in a named layer that the app
  owns (not a copy-pasted, unlayered CSS blob), browser DevTools shows
  exactly which layer supplied a given value.
- **Update-safe.** Because the layer order is fixed independently of file
  load order, bumping `@overclocked/shared-ui` to a new version and
  re-importing `tokens.css` never requires touching the app's override
  file — new or changed base tokens simply appear underneath the app's
  existing overrides.

### Adding an app-level override

Each consuming app creates its own small stylesheet and loads it **after**
`@overclocked/shared-ui/theme/tokens.css`. Import order for *unlayered* CSS
wouldn't matter here — that's the point of using named layers instead of
relying on cascade order or `!important`.

```css
/* apps/rep-stack/src/theme/app-overrides.css */
@layer overclocked.app {
  [data-theme="light"] {
    --color-brand-lime: #7dd815; /* REP•STACK's exact brand green */
  }
  [data-theme="dark"] {
    --color-brand-lime: #9be62b;
  }
  :root {
    --font-display: "Rajdhani", "Arial Narrow", sans-serif;
  }
}
```

If an app never declares `@layer overclocked.app`, nothing breaks — the
base theme simply applies as-is.

## Tier 3: tenant theming (sponsored challenges / programmes)

Tenant theming is different in kind from app theming, not just degree:

- It's **scoped**, not global. A list of challenges can show several
  different sponsor themes on screen at once. There's no single `:root`
  override that could express that.
- It's **runtime and dynamic** — set from data (a company's saved brand
  config), not decided at build/deploy time like the app layer is.

Because of that, tenant overrides are **not** implemented as another
`@layer` rule targeting `:root`/`[data-theme]`. They're applied as inline
CSS custom properties on a wrapper element around just the themed
challenge/programme, via `ChallengeThemeScope`:

```jsx
import { ChallengeThemeScope } from '@overclocked/shared-ui'

function ChallengeCard({ challenge, sponsorTheme }) {
  return (
    <ChallengeThemeScope theme={sponsorTheme}>
      {/* Everything in here — buttons, progress ramp, hero banner —
          picks up the sponsor's colors. Nothing outside this subtree does. */}
      <h2>{challenge.title}</h2>
      <button className="ui-btn ui-btn-primary">Join challenge</button>
    </ChallengeThemeScope>
  )
}
```

`sponsorTheme` is a plain object, e.g.:

```js
{
  primaryColor: '#ff6a00',
  progressMid: '#ffb84d',
  progressHigh: '#ff8c1a',
  progressPeak: '#c2410c',
  heroBg: 'linear-gradient(135deg, #1a1a1a, #ff6a00)',
  heroText: '#ffffff',
  accentGlow: 'rgba(255, 106, 0, 0.45)',
  displayFont: '"Poppins", sans-serif',
}
```

Inline styles already beat every stylesheet rule, layered or not, so this
needs no layer-ordering trick to win. It also sidesteps a real footgun in
a naive `[data-x] { --color-action-primary: var(--tenant-primary); }`
stylesheet rule: with no tenant active, that pattern needs a fallback back
to the base value, and a token can't reference itself in its own fallback —
CSS cascade-layer cycle detection rejects that regardless of which layer
declares it. Setting the property directly, only when a value exists,
avoids the problem entirely.

### The allow-list is enforced in code, not just documented

`ChallengeThemeScope` doesn't pass `theme` through as raw CSS — it goes
through [`buildTenantThemeVars`](../src/theme/tenantTheme.js), which maps
against a fixed allow-list (`TENANT_TOKEN_MAP`) of prop name → CSS token.
Any key not on that list is silently dropped. This is what makes the lock
list below an actual guarantee instead of a convention someone can miss in
review — a caller cannot set `--color-bg-app` or `--color-error-text`
through this path even if they tried; there's no token mapping for it.

## The three-tier override contract

| Tier | Mechanism | Scope |
| --- | --- | --- |
| 🔒 Locked | `overclocked.base` only | global, identical in every app and every tenant |
| 🎨 App | `overclocked.app` layer | global, per deployed app (REP•STACK vs. OVERCLOCK) |
| 🏢 Tenant | inline vars via `ChallengeThemeScope` | one challenge/programme instance |

| Locked (🔒 never overridable) | App-customizable (🎨 `overclocked.app`) | Tenant-customizable (🏢 `ChallengeThemeScope`) |
| --- | --- | --- |
| `--space-*`, `--radius-*`, `--shadow-*` scales | `--color-brand-*` | `--color-action-primary` *(within scope only)* |
| `--text-*`, `--weight-*`, `--leading-*`, `--tracking-*` scales | `--font-display`, `--font-body` | `--color-progress-mid/high/peak` |
| `--color-bg-*`, `--color-text-*`, `--color-border-*` (surface/text semantics) | `--color-chart-*` | `--font-tenant-display` |
| `--card-bg` and other derived component aliases | `--color-timer-*`, `--color-streak`, `--color-personal-best`, `--color-challenge-solo/-group` | `--color-tenant-hero-bg`, `--color-tenant-hero-text`, `--color-tenant-accent-glow` |
| `--color-success/warning/error/info-*`, `--color-action-danger*` (safety-signal semantics) | `--color-nav-item-active`, `--focus-ring-color` | |
| `--color-progress-low` (the "no activity" heatmap step) | | |
| `--z-*`, `--dur-*`, `--ease-*`, component-size tokens (`--btn-h-*`, `--input-h-*`, `--avatar-*`, `--icon-*`) | | |

Why these specific tokens stay locked even from tenant branding:

- **Safety signals never rebrand.** A sponsor's palette must never be able
  to make "this failed" read as their brand color — status/danger tokens
  are excluded categorically, not just the base app chrome ones.
  `--color-error-*`, `--color-warning-*`, and `--color-action-danger*` all
  fall outside every allow-list, including the app tier.
- **The empty state stays neutral.** `--color-progress-low` (the "no/low
  activity" step in a heatmap ramp) is intentionally aliased to the
  existing `--color-progress-track` tone rather than given its own hex —
  a mostly-empty challenge grid should look the same regardless of
  sponsor, so it doesn't read as broken under an arbitrary tenant palette.
- **App chrome outside the scope never changes.** `ChallengeThemeScope`
  only affects its own subtree. Don't wrap more than the themed
  challenge/programme content in it — wrapping the whole app shell would
  make `--color-action-primary` (etc.) bleed into navigation and other
  global UI, defeating the "without altering the base application shell"
  requirement.

`--font-tenant-display` is exposed as a token, but *loading* an arbitrary
tenant-supplied font is a separate, unsolved problem (perf, licensing,
FOUT/FOIT). Until that's designed, treat this as accepting a value from a
small curated, pre-bundled font allow-list — not an arbitrary tenant URL.

## Components always consume tokens, never raw values

Every component in `src/components/` reads `var(--token-name)`, never a
hex code or a hardcoded `px` value for anything themeable. That's what
makes every tier above effective — a component doesn't know or care
whether a token's current value came from `overclocked.base`,
`overclocked.app`, or an inline tenant override, so overriding a token
re-themes every component that uses it automatically, with no component
code changes required.

## Scope of what exists today

This document and the tokens/`ChallengeThemeScope` component describe the
*mechanism*. There is no persistence, admin UI, or billing for sponsor
theming yet — a consuming app is expected to fetch a validated tenant
config from wherever it stores one and pass it straight to `theme`.

## See also

- [`src/theme/tokens.css`](../src/theme/tokens.css) — the base layer itself
- [`src/theme/tenantTheme.js`](../src/theme/tenantTheme.js) — the tenant allow-list and builder
- [`src/theme/ChallengeThemeScope.jsx`](../src/theme/ChallengeThemeScope.jsx) — the scoping component
- [README](../README.md) — install/usage
- `npm run dev` — the design system demo page, which renders every base
  token (flagging app- and tenant-customizable subsets) and live-previews
  both an app-layer override and a scoped tenant override
