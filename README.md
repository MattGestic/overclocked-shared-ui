# @overclocked/shared-ui

Shared React component library and design token system for the Overclock
Fitness apps — **REP•STACK** and **OVERCLOCK (HIIT Trainer)**. It provides a
single, versioned source of truth for theming (colors, typography, spacing,
motion, etc.) and a small set of cross-app UI components, so every app looks
and behaves consistently while still being able to express its own brand.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [What's in the package](#whats-in-the-package)
- [Theming](#theming)
- [Design system demo](#design-system-demo)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Publishing](#publishing)
- [Contributing](#contributing)

## Installation

This package is published to GitHub Packages, not the public npm registry.
Add a `.npmrc` in your app (or user) scope pointing the `@overclocked` scope
at GitHub Packages:

```
@overclocked:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @overclocked/shared-ui
```

`react` and `react-dom` (`^19.0.0`) are peer dependencies — install them in
the consuming app if they aren't already present.

## Quick start

```jsx
// main.jsx
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@overclocked/shared-ui'
import '@overclocked/shared-ui/theme/tokens.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultDark>
    <App />
  </ThemeProvider>
)
```

```jsx
// App.jsx
import { Avatar, TabBar, useTheme } from '@overclocked/shared-ui'

function App() {
  const { dark, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>{dark ? 'Dark' : 'Light'} mode</button>
}
```

## What's in the package

| Export | Path | Contents |
| --- | --- | --- |
| `@overclocked/shared-ui` | `dist/index.js` | Everything below, re-exported from one entry point |
| `@overclocked/shared-ui/components` | `dist/components/index.js` | `Avatar`, `ImageUpload`, `ToastProvider`/`useToast`, `TabBar`, `DayDots` |
| `@overclocked/shared-ui/theme` | `dist/theme/index.js` | `TOKENS_CSS_PATH` helper |
| `@overclocked/shared-ui/theme/tokens.css` | `src/theme/tokens.css` | The base design tokens + global resets + component CSS recipes |
| `@overclocked/shared-ui/hooks` | `dist/hooks/index.js` | `ThemeProvider`, `useTheme` (light/dark, persisted to `localStorage`) |
| `@overclocked/shared-ui/utils` | `dist/utils/index.js` | `fmtReps`, `timeAgo`, `ordinal`, `avatarColor`, `initials`, `AVATAR_COLORS` |

Components consume CSS custom properties (design tokens) only — they never
hardcode colors, spacing, or other raw values — which is what makes the
theming/override model below work without touching component code.

## Theming

The design tokens (`src/theme/tokens.css`) are structured as a **layered
cascade** using native [CSS `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer):

- `overclocked.base` — everything this package ships. Updating the package
  updates this layer.
- `overclocked.app` — defined by each consuming app in its own stylesheet,
  to override the subset of tokens that should express that app's brand
  (accent colors, display font, chart palette, etc.).

Because layer order — not source order or CSS specificity — decides which
declaration wins, an app's `overclocked.app` overrides always take priority
over the base theme, and upgrading `@overclocked/shared-ui` never requires
touching or reapplying an app's customizations. It also makes overrides
traceable: DevTools shows exactly which layer supplied any given token
value.

Full details, the override contract (which tokens are meant to be
app-customizable vs. kept identical across apps), and a working example are
in **[docs/theming.md](docs/theming.md)**.

## Design system demo

Run the local showcase page to see every base token (grouped, with live
swatches for both themes), which ones are app-customizable, a live demo of
the `overclocked.app` override layer, and every exported component rendered
with real props:

```bash
npm install
npm run dev
```

This opens a Vite dev server for `demo/` (kept separate from the library
build, so it never affects `npm run build`/`npm publish`). To produce a
static build of the demo instead of running the dev server:

```bash
npm run demo:build   # outputs to demo-dist/
npm run demo:preview
```

## Project structure

```
src/
  components/   # Avatar, ImageUpload, Toast, TabBar, DayDots
  hooks/        # ThemeProvider / useTheme
  theme/        # tokens.css (design tokens, base layer) + theme/index.js
  utils/        # formatting + avatar-color helpers
  index.js      # package entry point, re-exports the above
demo/           # local design-system showcase (tokens + components), not published
docs/
  theming.md    # layered theming architecture and override contract
vite.config.js       # library build (used by `npm run build` / CI / publish)
vite.demo.config.js  # demo app build (used by `npm run dev` / `demo:build`)
```

## Local development

```bash
npm install
npm run dev      # design system demo at http://localhost:5173
npm run build    # builds the publishable library into dist/
```

There's no test suite yet — `npm run build` (via CI, see below) is the
current correctness gate for the library, and the demo page doubles as a
manual visual check for components and theming changes.

## Publishing

- **CI** (`.github/workflows/ci.yml`) runs `npm ci && npm run build` on
  every push and pull request.
- **Publish** (`.github/workflows/publish.yml` and the `publish` job in
  `ci.yml`) publishes to GitHub Packages on a GitHub Release or a `v*` tag
  push, using `npm publish`.

## Contributing

1. Add or change components/tokens in `src/`, following the existing
   convention: components read tokens via `var(--token-name)`, never raw
   values.
2. If you add or rename a token, check `npm run dev` — the demo page reads
   `tokens.css` directly, so new tokens show up automatically; no page or
   list to keep in sync.
3. If a token is meant to be app-customizable, add it to the contract table
   in [docs/theming.md](docs/theming.md) (and the matching list in
   `demo/tokens.js`) so it's flagged correctly in the demo.
4. Run `npm run build` and `npm run demo:build` before opening a PR.
