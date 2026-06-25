# Design Guide — Mantra

> AI Agent: Use this file when building any UI component. All colors, spacing, and
> component specs are defined here. Do not introduce new color values or spacing scales
> not listed in this document.

## Visual Direction

Mantra's UI is minimal and non-intrusive. The app lives mostly as a tray icon and floating bubbles — it must never feel like a heavy productivity tool. The aesthetic is **clean dark glass**: dark translucent backgrounds, sharp white text, soft blue accents. Think: a lightweight utility overlay, not a dashboard.

The Settings panel is the only "full" screen — it should feel like a focused control panel, not a cluttered options page.

## Color System (CSS Variables)

```css
:root {
  /* Backgrounds */
  --color-bg-bubble: rgba(18, 18, 24, 0.95); /* Bubble window background */
  --color-bg-settings: #0f0f14; /* Settings panel background */
  --color-bg-input: #1a1a24; /* Input fields */
  --color-bg-card: #1e1e2a; /* Card / section container */
  --color-bg-hover: #252533; /* Hover state on interactive items */

  /* Text */
  --color-text-primary: #f0f0f5; /* Main readable text */
  --color-text-secondary: #9090a8; /* Labels, metadata, placeholder */
  --color-text-muted: #55556a; /* Disabled text, hints */
  --color-text-original: #c8c8e0; /* Original-language text in bubble */

  /* Accent */
  --color-accent: #5b8cf5; /* Primary interactive: buttons, links */
  --color-accent-hover: #7aa3ff; /* Hover on accent elements */
  --color-accent-dim: rgba(91, 140, 245, 0.15); /* Accent tint for backgrounds */

  /* AI / Improve */
  --color-ai: #a855f7; /* Purple: AI improvement elements */
  --color-ai-hover: #c084fc;
  --color-ai-dim: rgba(168, 85, 247, 0.15);

  /* Status */
  --color-success: #34d399; /* Copied, connected, done */
  --color-warning: #fbbf24; /* Rate limit, slow response */
  --color-error: #f87171; /* API failure, key invalid */

  /* Borders */
  --color-border: rgba(255, 255, 255, 0.08); /* Subtle dividers */
  --color-border-focus: var(--color-accent);

  /* Bubble header gradient */
  --color-bubble-header: linear-gradient(135deg, #1e2a4a 0%, #1a1a2e 100%);
}
```

## Typography

```css
/* Font stack — use system fonts to avoid install requirements */
font-family:
  'Segoe UI Variable',
  'Segoe UI',
  system-ui,
  -apple-system,
  sans-serif;

/* Scale */
--font-size-xs: 11px; /* Labels, metadata */
--font-size-sm: 12px; /* Secondary content */
--font-size-base: 13px; /* Body text, bubble content */
--font-size-md: 14px; /* Settings form labels */
--font-size-lg: 16px; /* Section headers */
--font-size-xl: 20px; /* Settings page title */

/* Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line heights */
--line-height-tight: 1.3; /* Bubble text with limited space */
--line-height-normal: 1.5; /* Settings, readable body */
```

## Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
```

## Border Radius

```css
--radius-sm: 4px; /* Inputs, tags */
--radius-md: 8px; /* Buttons, cards */
--radius-lg: 12px; /* Bubbles, panels */
--radius-xl: 16px; /* Large modals */
--radius-full: 9999px; /* Pills, toggles */
```

## Shadows

```css
--shadow-bubble: 0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow-settings: 0 0 0 1px var(--color-border), 0 4px 24px rgba(0, 0, 0, 0.5);
--shadow-button: 0 1px 3px rgba(0, 0, 0, 0.3);
```

## Component Specs

### Button

```
Variants: primary | secondary | ghost | danger

Primary:
  background: var(--color-accent)
  color: white
  font-size: var(--font-size-sm)
  font-weight: var(--font-weight-semibold)
  padding: 6px 14px
  border-radius: var(--radius-md)
  hover: background var(--color-accent-hover)
  disabled: opacity 0.4, cursor not-allowed

Secondary:
  background: var(--color-bg-card)
  color: var(--color-text-primary)
  border: 1px solid var(--color-border)
  hover: background var(--color-bg-hover)

Ghost:
  background: transparent
  color: var(--color-text-secondary)
  hover: color var(--color-text-primary), background var(--color-bg-hover)

Danger:
  background: transparent
  color: var(--color-error)
  border: 1px solid var(--color-error)
  hover: background rgba(248, 113, 113, 0.1)

AI Improve Button (special):
  background: var(--color-ai-dim)
  color: var(--color-ai)
  border: 1px solid rgba(168, 85, 247, 0.3)
  hover: background rgba(168, 85, 247, 0.25)
  icon: ✨ prefix
```

### Input

```
background: var(--color-bg-input)
color: var(--color-text-primary)
border: 1px solid var(--color-border)
border-radius: var(--radius-sm)
padding: 8px 12px
font-size: var(--font-size-md)
placeholder color: var(--color-text-muted)

focus:
  border-color: var(--color-border-focus)
  outline: none
  box-shadow: 0 0 0 2px var(--color-accent-dim)

password input (Groq API key):
  type="password"
  right addon: show/hide toggle icon button
```

### Toggle (boolean settings)

```
width: 40px
height: 22px
border-radius: var(--radius-full)
track off: var(--color-bg-card) with border var(--color-border)
track on: var(--color-accent)
thumb: white circle, 16px diameter
transition: 150ms ease
```

### Select / Dropdown

```
background: var(--color-bg-input)
border: 1px solid var(--color-border)
border-radius: var(--radius-sm)
padding: 8px 12px
color: var(--color-text-primary)
chevron icon: right-aligned, var(--color-text-secondary)
```

### Translation Bubble

```
Window:
  width: 280px (default); resizable 200px–500px
  background: var(--color-bg-bubble)
  border-radius: var(--radius-lg)
  border: 1px solid var(--color-border)
  box-shadow: var(--shadow-bubble)
  backdrop-filter: blur(12px)
  always-on-top: true

Header bar:
  background: var(--color-bubble-header)
  height: 36px
  padding: 0 12px
  cursor: grab (active: grabbing)
  left: "M" logo mark (12px, var(--color-accent))
  right: minimize icon, close icon

Original text section:
  label: "ORIGINAL" — 10px, var(--color-text-muted), letter-spacing 0.08em
  text: var(--color-text-original), var(--font-size-base), var(--line-height-tight)
  background: transparent
  border-left: 2px solid var(--color-border)
  padding-left: var(--space-2)

Translated text section:
  label: "TERJEMAHAN" — 10px, var(--color-text-muted)
  text: var(--color-text-primary), var(--font-size-base), var(--font-weight-medium)
  background: var(--color-accent-dim)
  border-radius: var(--radius-sm)
  padding: var(--space-2) var(--space-3)

Improved text section (visible after AI improve):
  same as translated text section but:
  background: var(--color-ai-dim)
  label: "AI IMPROVED" with ✨ icon

Action row:
  height: 32px
  items: [Copy button] [Improve button if AI enabled] [toggle original/improved if improved exists]
  gap: var(--space-2)

Footer:
  source language badge: pill, var(--color-bg-card), 10px text
  timestamp: var(--color-text-muted), 10px
```

### Settings Panel

```
Window:
  width: 560px; height: 600px; non-resizable
  background: var(--color-bg-settings)
  title bar: Electron default hidden; custom title bar in React

Sidebar (left, 160px wide):
  background: var(--color-bg-card)
  nav items: Translation, AI Improvement, Appearance, About
  active item: var(--color-accent-dim) background, var(--color-accent) text
  inactive: var(--color-text-secondary), hover var(--color-bg-hover)

Content area (right, remaining width):
  padding: var(--space-6)
  section title: var(--font-size-lg), var(--font-weight-semibold)
  section divider: 1px solid var(--color-border)

  Setting row:
    label (left): var(--font-size-md), var(--color-text-primary)
    sublabel (below label): var(--font-size-sm), var(--color-text-secondary)
    control (right): Toggle, Select, or Input
    row padding: var(--space-4) 0
```

## Screen Inventory

| Screen                       | Type                             | Trigger                              |
| ---------------------------- | -------------------------------- | ------------------------------------ |
| Translation Bubble           | Floating overlay (always on top) | Context menu "Translate with Mantra" |
| Settings — Translation       | Full panel page                  | Tray → Settings → Translation tab    |
| Settings — AI Improvement    | Full panel page                  | Tray → Settings → AI tab             |
| Settings — Appearance        | Full panel page                  | Tray → Settings → Appearance tab     |
| Settings — About             | Full panel page                  | Tray → Settings → About tab          |
| Onboarding Toast (first run) | Small toast notification         | First app launch                     |
| Error State (bubble)         | Bubble error variant             | Translation API failure              |

## Responsive / Window Behavior

- App is Windows desktop only; no responsive breakpoints needed
- Bubbles are freely positioned anywhere on screen; no constraint to app window
- Settings panel is fixed 560×600px, centered on screen
- Bubble minimum width: 200px; maximum width: 500px
- Multiple bubbles stack offset by 20px from previous: `{ x: prev.x + 20, y: prev.y + 20 }`

## Accessibility

- All interactive elements must have visible focus rings (2px var(--color-accent) outline)
- Bubble close button: accessible via keyboard (Tab + Enter/Space)
- Pressing Escape closes the topmost focused bubble
- Settings form labels must be associated with their controls via `htmlFor` / `id`
- All icon-only buttons must have `aria-label`
