import tokensRaw from '../src/theme/tokens.css?raw'
import { TENANT_TOKEN_MAP } from '../src/theme/tenantTheme.js'

// Everything here is derived from the real tokens.css at build time, so the
// demo page can never drift out of sync with the actual base theme.

function extractBlock(css, selector) {
  const start = css.indexOf(selector)
  if (start === -1) return ''
  const braceStart = css.indexOf('{', start)
  let depth = 1
  let i = braceStart + 1
  while (depth > 0 && i < css.length) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    i++
  }
  return css.slice(braceStart + 1, i - 1)
}

function parseTokens(block) {
  const map = new Map()
  const re = /--([\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(block))) {
    map.set(m[1], m[2].trim())
  }
  return map
}

const lightBlock = extractBlock(tokensRaw, '[data-theme="light"]')
const darkBlock = extractBlock(tokensRaw, '[data-theme="dark"]')
const lightTokens = parseTokens(lightBlock)
const darkTokens = parseTokens(darkBlock)

// Dark theme only *overrides* a subset — anything it doesn't redefine still
// resolves through cascade layers from the light/root block.
const allNames = Array.from(lightTokens.keys())

const CATEGORIES = [
  { key: 'color-brand', label: 'Brand', kind: 'color' },
  { key: 'color-bg', label: 'Surfaces', kind: 'color' },
  { key: 'color-text', label: 'Text', kind: 'color' },
  { key: 'color-border', label: 'Borders', kind: 'color' },
  { key: 'color-action', label: 'Actions', kind: 'color' },
  { key: 'color-success', label: 'Status — success', kind: 'color' },
  { key: 'color-warning', label: 'Status — warning', kind: 'color' },
  { key: 'color-error', label: 'Status — error', kind: 'color' },
  { key: 'color-info', label: 'Status — info', kind: 'color' },
  { key: 'color-progress', label: 'Activity — progress', kind: 'color' },
  { key: 'color-streak', label: 'Activity — streak', kind: 'color' },
  { key: 'color-personal-best', label: 'Activity — personal best', kind: 'color' },
  { key: 'color-challenge', label: 'Activity — challenge', kind: 'color' },
  { key: 'color-tenant', label: 'Tenant / sponsor theming', kind: 'color' },
  { key: 'color-timer', label: 'Activity — timer phases', kind: 'color' },
  { key: 'color-chart', label: 'Charts', kind: 'color' },
  { key: 'color-nav', label: 'Navigation', kind: 'color' },
  { key: 'color-input', label: 'Forms', kind: 'color' },
  { key: 'font', label: 'Typography — font family', kind: 'font' },
  { key: 'text', label: 'Typography — size scale', kind: 'size' },
  { key: 'weight', label: 'Typography — weight', kind: 'raw' },
  { key: 'leading', label: 'Typography — line height', kind: 'raw' },
  { key: 'tracking', label: 'Typography — letter spacing', kind: 'raw' },
  { key: 'space', label: 'Spacing scale', kind: 'size' },
  { key: 'radius', label: 'Radius scale', kind: 'radius' },
  { key: 'shadow', label: 'Shadows', kind: 'shadow' },
  { key: 'size', label: 'Sizing', kind: 'size' },
  { key: 'btn', label: 'Button sizing', kind: 'size' },
  { key: 'input', label: 'Input sizing', kind: 'size' },
  { key: 'icon', label: 'Icon sizing', kind: 'size' },
  { key: 'avatar', label: 'Avatar sizing', kind: 'size' },
  { key: 'shell', label: 'App shell', kind: 'raw' },
  { key: 'header', label: 'App shell', kind: 'size' },
  { key: 'bottom-nav', label: 'App shell', kind: 'size' },
  { key: 'safe', label: 'App shell', kind: 'raw' },
  { key: 'z', label: 'Z-index', kind: 'raw' },
  { key: 'dur', label: 'Motion — duration', kind: 'raw' },
  { key: 'ease', label: 'Motion — easing', kind: 'raw' },
  { key: 'transition', label: 'Motion — transition', kind: 'raw' },
  { key: 'opacity', label: 'Opacity', kind: 'raw' },
  { key: 'focus', label: 'Focus ring', kind: 'raw' },
  { key: 'card', label: 'Component recipe — card', kind: 'raw' },
  { key: 'dialog', label: 'Component recipe — dialog', kind: 'raw' },
  { key: 'toast', label: 'Component recipe — toast', kind: 'raw' },
]

function categorize(name) {
  // Longest-prefix match so e.g. "color-input-bg" hits color-input before
  // a hypothetical generic "color" bucket.
  const candidates = CATEGORIES.filter(c => name === c.key || name.startsWith(c.key + '-'))
  candidates.sort((a, b) => b.key.length - a.key.length)
  return candidates[0] ?? { key: 'other', label: 'Other', kind: 'raw' }
}

// The app-customizable override contract, mirrored from docs/theming.md.
const CUSTOMIZABLE_PREFIXES = [
  'color-brand-',
  'font-display',
  'font-body',
  'color-chart-',
  'color-timer-',
  'color-streak',
  'color-personal-best',
  'color-challenge-',
  'color-nav-item-active',
  'focus-ring-color',
]

export function isCustomizable(name) {
  return CUSTOMIZABLE_PREFIXES.some(p => name === p || name.startsWith(p))
}

// The tenant tier's allow-list lives in one place — TENANT_TOKEN_MAP, the
// same map ChallengeThemeScope enforces at runtime — so this can't drift
// from what's actually overridable.
const TENANT_TOKEN_NAMES = new Set(Object.values(TENANT_TOKEN_MAP).map(v => v.replace(/^--/, '')))

export function isTenantCustomizable(name) {
  return TENANT_TOKEN_NAMES.has(name)
}

export function buildTokenGroups() {
  const groups = new Map()
  for (const name of allNames) {
    const cat = categorize(name)
    if (!groups.has(cat.label)) groups.set(cat.label, { label: cat.label, kind: cat.kind, tokens: [] })
    groups.get(cat.label).tokens.push({
      name,
      light: lightTokens.get(name),
      dark: darkTokens.get(name) ?? lightTokens.get(name),
      customizable: isCustomizable(name),
      tenantCustomizable: isTenantCustomizable(name),
    })
  }
  return Array.from(groups.values())
}

export const tokenCount = allNames.length
export const customizableCount = allNames.filter(isCustomizable).length
export const tenantCustomizableCount = allNames.filter(isTenantCustomizable).length
