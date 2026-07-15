# Theming architecture

`@overclocked/shared-ui` ships one base design theme that every app builds
on (`REP•STACK`, `OVERCLOCK`, and any future app). Apps are expected to look
and feel consistent, but each needs its own identity — a different brand
accent, a different display font, a different chart color. This document
describes how that's structured so both goals hold at once.

## The two axes

The theme has two independent axes:

1. **Light / dark** — `[data-theme="light"]` and `[data-theme="dark"]` on
   `<html>`, toggled at runtime via `ThemeProvider`/`useTheme` (see
   [`src/hooks/useTheme.jsx`](../src/hooks/useTheme.jsx)). Every token is
   defined for both.
2. **Base / app** — a **CSS cascade layer** stack, described below. This is
   the axis that lets an app customize the theme without forking it.

## Layers: base wins by default, app always wins when it overrides

`src/theme/tokens.css` declares the layer order once, at the top of the file:

```css
@layer overclocked.base, overclocked.app;
```

All of the shared tokens, resets, and component recipes shipped by this
package live inside `@layer overclocked.base { ... }`. That single line is
the whole mechanism:

- **Top layer wins, unconditionally.** In [CSS cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer),
  a later-declared layer beats an earlier one for the *same* custom
  property, no matter how specific either selector is. An app rule as
  simple as `[data-theme="dark"] { --color-brand-lime: ... }` inside
  `overclocked.app` will always beat the base package's rule, even though
  the base rule looks equally (or more) specific.
- **Traceable.** Because the override lives in a named layer that the app
  owns (not a copy-pasted, unlayered CSS blob), browser DevTools shows
  exactly which layer supplied a given value, and a reviewer can see at a
  glance whether a style is "ours" (`overclocked.base`) or "app-specific"
  (`overclocked.app`).
- **Update-safe.** Because the layer order is fixed independently of file
  load order, bumping `@overclocked/shared-ui` to a new version and
  re-importing `tokens.css` never requires touching the app's override
  file — new or changed base tokens simply appear underneath the app's
  existing overrides. The app's customizations are never clobbered, and the
  app never has to "diff and reapply" its overrides after an upgrade.

## Adding an app-level override

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
    --font-display: "Rajdhani", "Arial Narrow", sans-serif; /* app-specific display font */
  }
}
```

```js
// apps/rep-stack/src/main.jsx
import '@overclocked/shared-ui/theme/tokens.css'
import './theme/app-overrides.css' // load order doesn't matter, the layer does
```

If an app never declares `@layer overclocked.app`, nothing breaks — the
base theme simply applies as-is. The layer only needs to exist in apps that
want to diverge from a default.

## What's safe to override vs. what should stay shared

Not every token is meant to vary per app — some exist specifically to keep
the *product family* feeling consistent (spacing, radii, shadows, timing).
Others exist specifically so each app can express its own brand. The demo
page (`npm run dev`, see [README](../README.md#design-system-demo)) marks
every token with one of these two labels; the rule of thumb is:

| Customize per app (✅ override in `overclocked.app`) | Keep shared (🔒 base only) |
| --- | --- |
| `--color-brand-*` (brand identity colors) | `--space-*`, `--radius-*`, `--shadow-*` scales |
| `--font-display`, `--font-body` | `--text-*`, `--weight-*`, `--leading-*`, `--tracking-*` scales |
| `--color-chart-*` (per-app chart palette) | `--color-bg-*`, `--color-text-*`, `--color-border-*` (surface/text semantics) |
| `--color-timer-*`, `--color-streak`, `--color-personal-best`, `--color-challenge-*` (activity accents) | `--color-success/warning/error/info-*` (status semantics) |
| `--color-nav-item-active`, `--focus-ring-color` | `--z-*`, `--dur-*`, `--ease-*`, component-size tokens (`--btn-h-*`, `--input-h-*`, `--avatar-*`, `--icon-*`) |

Overriding a "keep shared" token isn't technically prevented — cascade
layers don't enforce this contract, code review and this table do — but
doing so defeats the point of a shared component library: components will
render at inconsistent sizes/spacing/timing across apps even though they're
literally the same component.

## Components always consume tokens, never raw values

Every component in `src/components/` reads `var(--token-name)`, never a
hex code or a hardcoded `px` value for anything themeable. That's what
makes the layering above effective — a component doesn't know or care
whether a token's current value came from `overclocked.base` or
`overclocked.app`, so overriding a token re-themes every component that
uses it automatically, with no component code changes required.

## See also

- [`src/theme/tokens.css`](../src/theme/tokens.css) — the base layer itself
- [README](../README.md) — install/usage
- `npm run dev` — the design system demo page, which renders every base
  token, flags the app-customizable subset, and live-previews the effect
  of an app-layer override
