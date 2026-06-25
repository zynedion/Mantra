# Mantra — UI/UX Design Brief

> **For:** Claude Design / Figma / Hi-Fi Prototype
> **Product:** Mantra — Manga Translator (Windows Desktop App, Electron)
> **Version:** 1.0 Design Handoff

---

## What is Mantra?

A Windows desktop utility that floats above the user's browser while they read manga. When a user selects Japanese text (via Windows Click to Do OCR or manual selection) and right-clicks → "Translate with Mantra", a draggable floating bubble appears showing the translation. An optional AI step rewrites the stiff machine translation into natural manga dialogue.

The app lives in the system tray. The two main surfaces are:

1. **Translation Bubble** — floating overlay, always-on-top, appears on demand
2. **Settings Panel** — separate window, opened from tray

---

## Visual Direction

**Aesthetic:** Clean dark glass. Minimal, non-intrusive, utility-first.
**Mood:** Like a well-designed developer tool or a smart Windows widget — not a consumer app, not a dashboard.
**Reference feel:** Windows 11 Mica material + modern dark IDEs (VS Code dark) + subtle blue accent.
**NOT:** Flashy, anime-themed, heavy gradients, gamified, cluttered.

---

## Color Palette

```
Background — Bubble:    rgba(18, 18, 24, 0.95)   — near-black with blue undertone
Background — Settings:  #0f0f14
Background — Input:     #1a1a24
Background — Card:      #1e1e2a
Background — Hover:     #252533

Text — Primary:         #f0f0f5    (almost white)
Text — Secondary:       #9090a8    (muted purple-grey)
Text — Muted:           #55556a
Text — Original lang:   #c8c8e0    (slightly dimmer than primary)

Accent (blue):          #5b8cf5    (interactive elements, focus rings)
Accent hover:           #7aa3ff
Accent dim:             rgba(91, 140, 245, 0.15)  (tinted backgrounds)

AI Purple:              #a855f7    (AI Improve elements exclusively)
AI Purple dim:          rgba(168, 85, 247, 0.15)

Success:                #34d399
Warning:                #fbbf24
Error:                  #f87171

Border:                 rgba(255, 255, 255, 0.08)

Bubble header gradient: linear-gradient(135deg, #1e2a4a → #1a1a2e)
```

---

## Typography

```
Font: Segoe UI Variable (Windows system font — no install needed)
Fallback: system-ui, sans-serif

Size scale:
  10px — labels, metadata, badges
  11px — secondary info
  12px — body secondary
  13px — bubble body text (PRIMARY reading size)
  14px — settings form labels
  16px — section headers
  20px — settings page title

Weight:
  400 — normal body
  500 — medium (translated text in bubble)
  600 — semibold (headers, buttons)
  700 — bold (accent labels)
```

---

## Screen 1: Translation Bubble (PRIMARY SURFACE)

### Dimensions & Behavior

- Default size: **280px wide × content-height** (roughly 180–220px typical)
- Minimum: 200px × 120px
- Maximum: 500px wide
- Position: floating, always-on-top, draggable from header
- Resizable from bottom-right corner handle
- Background: dark glass with `backdrop-filter: blur(12px)`
- Border: 1px solid `rgba(255,255,255,0.08)`
- Border-radius: 12px
- Shadow: `0 8px 32px rgba(0,0,0,0.6)`
- Opacity: user-settable 70–100% (default 95%)

### Anatomy (top to bottom)

**A. Header Bar** (36px tall, full width, drag handle)

```
Background: gradient (see palette above)
Left: "M" monogram mark — 14px, color: #5b8cf5, font-weight 700
Center: nothing (empty)
Right (icon row, gap 4px):
  — Minimize icon (chevron-down) — 16px, color: #9090a8, hover: #f0f0f5
  — Close icon (×) — 16px, same colors
Padding: 0 12px
Cursor: grab / grabbing
Border-bottom: 1px solid rgba(255,255,255,0.06)
```

**B. Content Area** (padding: 12px)

```
Section: ORIGINAL
  Label: "ORIGINAL" — 10px, #55556a, letter-spacing: 0.08em, uppercase
  Text block:
    color: #c8c8e0
    font-size: 13px
    line-height: 1.4
    border-left: 2px solid rgba(255,255,255,0.1)
    padding-left: 8px
    margin-top: 4px

Gap: 10px

Section: TERJEMAHAN (raw translation)
  Label: "TERJEMAHAN" — 10px, #55556a, uppercase
  Text block:
    color: #f0f0f5
    font-size: 13px
    font-weight: 500
    line-height: 1.5
    background: rgba(91, 140, 245, 0.12)
    border-radius: 6px
    padding: 8px 10px
    margin-top: 4px

[IF AI IMPROVED — appears below TERJEMAHAN]
Section: AI IMPROVED
  Label row: "✨ AI IMPROVED" — 10px, #a855f7, uppercase + sparkle emoji
  Text block:
    color: #f0f0f5
    font-size: 13px
    font-weight: 500
    background: rgba(168, 85, 247, 0.12)
    border-radius: 6px
    padding: 8px 10px

  Toggle link (right of label): "Show raw ↕" — 10px, #5b8cf5
```

**C. Action Row** (padding: 0 12px 10px, gap: 8px)

```
[Copy button]
  style: secondary (dark card bg, border)
  size: flex-1 (fill available width)
  label: "Copy"
  on-click: clipboard write current visible text
  on-success: button momentarily shows "✓ Copied!" in green

[✨ Improve button — hidden if AI provider = none]
  style: AI variant (purple dim bg, purple border)
  label: "✨ Improve"
  loading state: "Improving..." with spinner
  hidden after improvement is done (replace with toggle)
```

**D. Footer** (padding: 4px 12px 10px)

```
Left: language badge pill
  text: "JA → ID" (source → target)
  background: rgba(255,255,255,0.06)
  border-radius: 999px
  padding: 2px 8px
  font-size: 10px, color: #9090a8

Right: time elapsed or timestamp
  "0.8s" or "2 min ago"
  font-size: 10px, color: #55556a
```

### Bubble States

**State 1: Loading**

```
Header: normal (shows "M" mark)
Content:
  ORIGINAL section: shows original text (already known)
  TERJEMAHAN section: skeleton animation
    — 2 lines, height 12px each, border-radius 4px
    — color: rgba(255,255,255,0.08) animated shimmer left→right
  No action row yet (just spinner)
```

**State 2: Error**

```
Border: 1px solid rgba(248, 113, 113, 0.5)  — red tint
Header: normal
Content:
  ORIGINAL section: shows original text
  Error section (replaces TERJEMAHAN):
    icon: ⚠ in #f87171
    message: "Translation failed. Check your internet." — #f87171, 12px
Action row:
  [Retry button] — danger variant
```

**State 3: Minimized**

```
Height: 36px (header only)
Header right: chevron points UP (▲)
Header center: truncated original text — max 30 chars, #9090a8, 11px
Everything else: hidden
```

### Multiple Bubbles

```
Counter chip (bottom-right corner, fixed):
  Appears only when 2+ bubbles open
  background: #5b8cf5
  text: "3 open" — white, 11px, font-weight 600
  border-radius: 999px
  padding: 4px 12px
  shadow: 0 2px 8px rgba(91,140,245,0.4)

Below counter: [Close All] button
  style: ghost / danger hybrid
  color: #f87171
  12px, hover: underline
```

---

## Screen 2: Settings Panel

### Dimensions & Behavior

- Fixed size: **560px × 600px**
- Not resizable
- Centered on screen
- Custom title bar (frameless Electron window)
- Background: #0f0f14

### Custom Title Bar (32px tall)

```
Left: "M" monogram 12px + "Mantra Settings" — 13px, #9090a8
Right: standard close button (×) — 16px icon, hover: red bg
Background: #0f0f14
Border-bottom: 1px solid rgba(255,255,255,0.06)
Drag region: full title bar width
```

### Layout: Sidebar + Content (two-column)

**Left Sidebar** (160px wide)

```
Background: #1e1e2a
Border-right: 1px solid rgba(255,255,255,0.06)
Padding: 16px 8px

Nav items (top-to-bottom):
  1. 🌐 Translation
  2. ✨ AI Improvement
  3. 🎨 Appearance
  4. ℹ About

Each nav item:
  height: 40px
  padding: 0 12px
  border-radius: 8px
  font-size: 13px
  gap: 8px (icon + label)

  Active state:
    background: rgba(91, 140, 245, 0.15)
    color: #5b8cf5
    font-weight: 600

  Inactive state:
    color: #9090a8
    hover: background rgba(255,255,255,0.04), color #f0f0f5
```

**Right Content Area** (400px wide)

```
Padding: 24px
Overflow-y: scroll (if content exceeds height)

Section title:
  font-size: 16px
  font-weight: 600
  color: #f0f0f5
  margin-bottom: 20px

Section divider:
  1px solid rgba(255,255,255,0.06)
  margin: 16px 0

Setting Row pattern:
  Layout: flex, space-between, align-center
  Padding: 14px 0
  Border-bottom: 1px solid rgba(255,255,255,0.04) (except last row)

  Left side:
    Label: 14px, #f0f0f5, font-weight 500
    Sub-label (optional): 11px, #9090a8, margin-top 2px

  Right side:
    Control: Toggle | Select | Input | Slider
```

### Tab 1: Translation

```
Title: "Translation"

Row 1: Target Language
  Label: "Target Language"
  Sub-label: "Language for all translations"
  Control: Select dropdown
    Options: 🇮🇩 Indonesian (id), 🇺🇸 English (en), 🇨🇳 Chinese (zh), 🇰🇷 Korean (ko)
    Width: 180px
```

### Tab 2: AI Improvement

```
Title: "AI Improvement"
Sub-title (below title, before first row):
  "Rewrites stiff machine translations into natural manga dialogue."
  font-size: 12px, color: #9090a8

Row 1: AI Provider
  Label: "Provider"
  Control: Select
    Options: None, Ollama (Local), Groq (Cloud)

[IF Ollama selected — show these rows]
Row 2: Model
  Label: "Model"
  Sub-label: "e.g. mistral, llama2, phi3"
  Control: Input text, 200px wide, default "mistral"

Row 3: Server URL
  Label: "Server URL"
  Sub-label: "Default: http://localhost:11434"
  Control: Input text, 200px wide

Row 4: Test Connection
  Label: "Status"
  Control: [Test Connection] button (secondary) + status badge
  Badge states:
    idle: nothing shown
    testing: "Testing..." with spinner, #9090a8
    success: "● Connected" in #34d399
    fail: "● Cannot reach Ollama" in #f87171

[IF Groq selected — show these rows]
Row 2: API Key
  Label: "Groq API Key"
  Sub-label: "Free tier at console.groq.com"
  Control: PasswordInput (280px wide) + show/hide icon + [Test Key] button
  Placeholder: "gsk_..."
  Badge: same states as above

[ALL providers except None]
Row (last): Auto-Improve
  Label: "Auto-Improve"
  Sub-label: "Automatically improve every translation"
  Control: Toggle (on/off)
```

### Tab 3: Appearance

```
Title: "Appearance"

Row 1: Bubble Opacity
  Label: "Bubble Opacity"
  Sub-label: "Transparency of translation bubbles"
  Control:
    Slider (range 70–100, step 5)
    Width: 160px
    Right of slider: value label "95%" in #5b8cf5, 13px, font-weight 600

Row 2: Start on Boot
  Label: "Start on Boot"
  Sub-label: "Launch Mantra when Windows starts"
  Control: Toggle

Row 3: Minimize to Tray
  Label: "Minimize to Tray"
  Sub-label: "Keep running in system tray when closed"
  Control: Toggle (default ON)
```

### Tab 4: About

```
Title: "About"

Content (centered, not rows):
  App icon (64px × 64px)
  "Mantra" — 20px, #f0f0f5, font-weight 700
  "Version 1.0.0" — 12px, #9090a8
  Gap: 24px
  [View Changelog] — link button, #5b8cf5
  [Open Source Licenses] — link button, #5b8cf5
  Gap: 24px
  "Built with Electron, React, MyMemory API"
  12px, #55556a, text-align center
```

---

## Component Library (for design system)

### Button variants to design:

1. Primary — blue fill
2. Secondary — dark card + border
3. Ghost — transparent
4. Danger — red text + border
5. AI — purple dim fill + purple border (exclusive to AI actions)
6. Link — text only, underline on hover

### Form controls:

1. Input (text)
2. PasswordInput (with show/hide toggle)
3. Select / Dropdown
4. Toggle (boolean)
5. Slider (range with label)

### Status badges:

1. Success (green pill)
2. Error (red pill)
3. Loading (spinner + text)
4. Language pair (neutral pill, e.g. "JA → ID")

### Bubble variants:

1. Normal (loaded translation)
2. Loading (skeleton)
3. Error (red border)
4. Minimized (header only)
5. With AI Improved section

---

## User Flows to Prototype

### Flow 1: Core Translation (MVP)

```
[Manga in browser]
→ User selects text via Click to Do
→ Right-click → "Translate with Mantra"
→ Loading bubble appears (skeleton)
→ Bubble populates with translation
→ User reads, drags bubble aside
→ User closes bubble (×)
→ Bubble disappears
```

### Flow 2: AI Improvement

```
[Bubble with raw translation visible]
→ User clicks "✨ Improve"
→ Button shows "Improving..." spinner
→ "AI IMPROVED" section fades in with purple accent
→ Toggle available: "Show raw ↕"
→ User clicks toggle → sees raw translation
→ Clicks again → back to improved
```

### Flow 3: Settings — Configure Groq

```
[System tray]
→ Right-click → Open Settings
→ Settings panel opens, Translation tab active
→ User clicks "AI Improvement" tab
→ Selects "Groq (Cloud)" from dropdown
→ API key field + Test Key button appear
→ User pastes key
→ Clicks "Test Key"
→ "Testing..." badge → "● Key valid" badge (green)
→ User closes Settings (X)
```

### Flow 4: Multiple Bubbles

```
[Two manga panels selected in sequence]
→ First bubble at (24, 24)
→ Second bubble at (44, 44) [offset]
→ Counter chip appears: "2 open"
→ User drags first bubble to left side
→ User closes second bubble
→ Counter shows "1 open" → disappears
```

---

## Prototype Interactions to Include

- [ ] Bubble drag (simulate by showing alternate position state)
- [ ] Bubble minimize → expand
- [ ] Close bubble
- [ ] Close All from counter
- [ ] Settings tab switching (click nav items)
- [ ] AI provider select → conditional field reveal
- [ ] Test Connection: idle → loading → success / error
- [ ] Toggle on/off (visual only)
- [ ] Slider drag (value label update)
- [ ] PasswordInput show/hide
- [ ] Copy button → "✓ Copied!" feedback

---

## Notes for Designer

1. The bubble is the hero. Make it feel polished and light — not like a Chrome extension popup.
2. The "AI IMPROVED" section should feel premium and distinct from raw translation — the purple color system should make it feel like a separate tier.
3. Bubbles stack visually on screen. Design a "multi-bubble" frame showing 2–3 bubbles at different positions.
4. The Settings panel is secondary — clean and functional is enough, no need to over-design.
5. Windows 11 Mica/Acrylic inspiration is fine, but keep blur subtle — readability of translated text is priority #1.
6. All text in bubbles should be selectable (important for users who want to copy manually).
