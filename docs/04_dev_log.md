# Development Log

> Update this file at the end of each coding session.
> Format: newest entries at the top.
> AI Agent: read this file when starting a new feature — it contains constraints
> and decisions that override or clarify the feature files.

---

## 2026-06-25 — Feature 01 Implemented

### What was built
- Bootstrapped Electron project using `create-electron` and configured ESM/CJS interop for electron-store.
- Created `src/renderer/types/index.ts` with shared TypeScript definitions.
- Configured Tailwind CSS v4 using `@tailwindcss/postcss` for custom styling.
- Implemented `src/main/ipc-handlers.ts` to manage electron-store, safeStorage API key encryption/decryption, window click-through toggles, and start-on-boot configuration.
- Modified `src/main/index.ts` with single instance lock, system tray lifecycle (Quit, Open Settings, Left Click action), full-screen transparent click-through `bubbleWindow`, centered frameless `settingsWindow`, and automatic layout recalculation on display changes.
- Modified Preload scripts (`preload/index.ts` and `preload/index.d.ts`) to expose context-isolated API bindings under `window.electronAPI`.
- Verified typechecking and builds compile successfully. Confirmed `config.json` initialization in AppData.
- Initialized local Git repository, created initial commit, and created a new public GitHub repository [zynedion/Mantra](https://github.com/zynedion/Mantra) using the GitHub CLI (`gh`), pushing the initial codebase.

### Decisions made
- **Vite Router-less Windowing**: Load same entry point `index.html` with query params (`?window=bubble` and `?window=settings`) to easily render specific window layouts.
- **Tailwind v4 PostCSS Integration**: Used `@tailwindcss/postcss` devDependency to integrate Tailwind with postcss-loader in the Vite renderer pipeline.
- **Electron-store CJS Workaround**: Resolved pure ESM `electron-store` package export dynamically using `.default` fallback in CommonJS main process.

### Deviations from spec
- Installed `@tailwindcss/postcss` as Tailwind CSS v4 requires it for PostCSS compilation instead of importing `tailwindcss` directly as a PostCSS plugin.

### Next session should start with
- Feature 02 (Context Menu Integration) to link OS right-click actions (from Click to Do or manual select) with the Mantra app overlay.

---

## 2026-06-25 — PRD Created

### What was built
Initial Product Requirements Document generated. No code written yet. All six feature files created and ready for implementation.

### Decisions made
- **Windows-only v1:** Mantra targets Windows 11 exclusively. Click to Do OCR (Copilot+ PC, Build 26100+) is the core input mechanism. macOS/Linux deferred indefinitely.
- **No custom OCR:** Rather than implementing Tesseract.js or a separate OCR library, Mantra leverages Windows' built-in OCR via Click to Do. Mantra receives already-extracted text via the context menu / clipboard bridge. This eliminates the biggest technical risk in the project.
- **MyMemory as sole translation provider in v1:** Free, no API key, sufficient for persona use case (~10k chars/session vs 100k daily limit). DeepL/Google Cloud deferred.
- **franc for language detection:** Lightweight JS library, no API call needed. Falls back to `ja` for short strings (<10 chars) which are common in manga panel text.
- **electron-store over SQLite:** No relational queries needed; history is a simple append-only array. electron-store is zero-setup and sufficient for 500-entry cap.
- **react-rnd over react-draggable:** Chosen because it bundles both drag and resize in one library. No need to compose two separate libraries.
- **Groq API key stored via Electron safeStorage:** Uses OS-level encryption (DPAPI on Windows). Never stored as plain text.
- **AI provider: Ollama + Groq only:** Ollama for privacy-conscious/offline users; Groq for users who want instant cloud AI without setup. Anthropic Claude API deferred (cost concern for free-tier users).
- **App name: Mantra** — stands for "Manga Translator". Distinct, memorable, brand-able.

### Deviations from spec
None — this is the initial spec.

### Constraints discovered
- Windows Click to Do context menu behavior: text selected via Click to Do OCR is copied to clipboard when a context menu action fires. This is the integration point. Verified on ASUS Vivobook M1407KA (Build 26200).
- Direct `Windows.Media.Ocr` PowerShell/Node.js access is not available via standard reflection (`LoadWithPartialName` returns null). This is why the clipboard-bridge approach was chosen instead.
- MyMemory max input: 500 characters per request. Texts longer than 500 chars (rare for manga panels) must be split and responses concatenated. Implement in Feature 03.

### Known issues / tech debt
- [ ] Context menu appears for all files/text system-wide (Shell extension is broad). If this causes UX clutter, scope to browser-only via a Chrome Extension in v2. (low)
- [ ] Ollama first-inference latency can be 5–15 seconds on cold start. Consider a "warming" ping on app start if autoImprove is enabled. (medium)
- [ ] franc accuracy on very short Japanese strings (<5 chars) is low. Current mitigation: default to `ja`. Long-term: consider character-range detection (CJK unicode range check). (low)

### Next session should start with
Read `docs/00_master_plan.md` and `docs/01_technical_specs.md`. Begin with Feature 01 (App Shell). Initialize the Electron project using `electron-vite` scaffolding: `npm create @quick-start/electron@latest mantra -- --template react-ts`. Then implement the BrowserWindow setup, tray icon, and electron-store initialization as specified in `docs/03_features/01_app-shell.md`. Do not implement any UI content or translation logic in this session.

---

[Older entries below]
