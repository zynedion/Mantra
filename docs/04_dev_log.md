# Development Log

> Update this file at the end of each coding session.
> Format: newest entries at the top.
> AI Agent: read this file when starting a new feature — it contains constraints
> and decisions that override or clarify the feature files.

---

## 2026-06-25 — Feature 06 Implemented

### What was built

- Expose testing APIs (`testOllama`, `testGroq`) and a `settings-updated` sync channel in preload scripts.
- Implemented `test-ollama` and `test-groq` IPC handlers in `src/main/ipc-handlers.ts` to query local LLM availability and Groq model configurations with 5-second connection pings.
- Implemented Windows Run registry key (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`) insertion and deletion in `save-settings` IPC handler for automatic boot configurations.
- Created `src/renderer/src/store/settings.ts` Zustand settings store, coordinating immediately-persisted values.
- Built a four-tab settings GUI control panel component `src/renderer/src/components/SettingsPanel.tsx` supporting:
  - Language selection dropdowns.
  - LLM model inputs, host inputs, connection tests, and success/error status badges.
  - Groq API keys password inputs, eye show/hide controls, and connection validation checks.
  - Opacity slide metrics.
  - Windows Run startup and minimize-to-tray configurations.
  - General version and repository metadata about the application.
- Configured window close hooks and recreate handlers inside `src/main/index.ts` to correctly handle `minimizeToTray = false` (destroying settings window on close, and recreating it on open settings call).
- Linked dynamic opacity inline styles (`style={{ opacity }}`) in `TranslationBubble.tsx` to settings state updates, and subscribed to `onSettingsUpdated` inside `App.tsx` bubble overlay window to propagate settings changes live.
- Ran compile, lint, and build verification checks, confirming zero static analysis issues.

### Decisions made

- **Decoupled Settings Sync**: Broadcasted settings changes from the settings window to the transparent bubble window via the main process webContents channel (`settings-updated`) to synchronize visual overlays in real time.
- **Asynchronous local inputs sync**: Used a setTimeout timer when setting local states within the settings load effect to conform with standard non-cascading React render lifecycles.
- **Recreatable settings window**: Allowed the settings window reference to be destroyed and set to null if `minimizeToTray` is disabled, and safely re-scaffolded it inside `showSettingsWindow()` when requested.

### Deviations from spec

- None. Fully compliant with specs.

### Next session should start with

- End of v1 initial implementation branch tasks, packaging verification, and finalizing release checklist.

---

## 2026-06-25 — Feature 05 Implemented

### What was built

- Extended `IBubble` typescript interface in `src/renderer/types/index.ts` with optional layout and state flags (`showImproved`, `aiError`).
- Refactored `ITranslationRequest` and history tracking to support client-generated bubble IDs.
- Created `src/main/ai-improver.ts` service implementing:
  - Manga-specific dialogue naturalization prompt generator.
  - Local Ollama connection (`/api/generate`) with a 30-second timeout, mapping connection errors (`OLLAMA_OFFLINE`) and missing models (`OLLAMA_MODEL_NOT_FOUND`).
  - Cloud Groq completions connection with a 15-second timeout, mapping keys (`GROQ_INVALID_KEY`) and rate limits (`GROQ_RATE_LIMIT`).
- Integrated the real AI service handlers in `src/main/ipc-handlers.ts`, decrypting keys using `safeStorage.decryptString`, and updating matching target history IDs.
- Modified React components:
  - `TranslationBubble.tsx`: Accept `settings` and `onImprove` callbacks. Add togglable `showImproved` text display (switching between raw translation and AI naturalized dialogue). Incorporate a sub-label box showing `aiError` when naturalization fails without affecting raw readability. Include `✨ Improve` footer button disabled and labeled `Improving...` during requests. Add `duration` metric next to bubble footer timestamp.
  - `BubbleManager.tsx`: Accept `settings` and `onImprove` props and map them to bubbles.
  - `App.tsx`: Track total elapsed time (`startTime`). Coordinate sequential `Translating...` and `Improving...` skeleton loader transition on `autoImprove` complete. Handle manual improvement retry logic.
- Resolved typecheck, ESLint rules (fixing explicit `any` using specific axios exception type definitions), and formatted codebase completely.

### Decisions made

- **Context-Aligned IDs**: Allowed the client to generate unique IDs and passed them to the translation and AI handlers to easily match and persist `improvedText` inside the correct history slots.
- **Axios Catch Errors Typing**: Cast unknown catch exceptions to structured Axios responses (`code`, `status`, `data.error`) to eliminate explicit `any` type definitions and adhere to strict linter checks.
- **Graceful Failure Note**: Rendered the AI error as a warning box at the bottom of the dialogue text box rather than triggering a crash or resetting the raw translation.

### Deviations from spec

- None. Fully compliant with specs.

### Next session should start with

- Feature 06 (Settings GUI Panel UI design and layout bindings).

---

## 2026-06-25 — Feature 04 Implemented

### What was built

- Extended `IBubble` typescript interface in `src/renderer/types/index.ts` with optional layout and state flags (`isLoading`, `error`, `isMinimized`, `isExpanded`).
- Created Zustand store `src/renderer/src/store/bubbles.ts` to manage multi-bubble states. Configured it to auto-stack new bubbles offset by +20px x and y from the previous, trace `focusedBubbleId`, manage target focus transfers on bubble closure, and manage bulk dismissals.
- Created `src/renderer/src/components/TranslationBubble.tsx` using `react-rnd`'s `<Rnd>` component to support smooth dragging, corner-resizing, and header bounds. Integrated minimizable header bars, a custom skeleton loader, warning borders for error states, an auto-grow "Show more" toggle, absolute clock timestamp formatting, and a clipboard copy action.
- Created `src/renderer/src/components/BubbleManager.tsx` container to overlay active bubbles and display a persistent counter tray at `bottom-right` with a "Close All" trigger.
- Integrated the store and `BubbleManager` in `src/renderer/src/App.tsx`. Registered keydown listeners to close the most recently focused bubble on `Escape`, and added hooks to dynamically toggle overlay click-through mouse events when bubble counts shift.
- Verified build and TypeScript compilation checks are completely clean (`npm run typecheck`, `npm run lint`, `npm run build`), and verified draggable, resizable overlays on simulated inputs.

### Decisions made

- **React-Rnd Size Bounds**: Configured Rnd component dimensions with `minWidth={200}` and `maxWidth={500}`, disabling dragging outside the header and disabling resizing completely when the bubble is minimized.
- **Escape Key State Fetching**: Used `useBubbleStore.getState()` directly inside the event listener callback to fetch the most up-to-date focused ID without triggering dependency rebuild loops or stale closures.
- **Pure Local Time Representation**: Refactored relative time difference checks to absolute localized clock time format (`toLocaleTimeString`) to satisfy strict React component render purity rules.

### Deviations from spec

- None. Fully compliant with specs.

### Next session should start with

- Feature 05 (AI Improvement Layer) to add the ✨ Improve button in the bubble footer, integrate local Ollama and Groq cloud APIs, and cache improved translations in the history store.

---

## 2026-06-25 — Feature 03 Implemented

### What was built

- Implemented `src/renderer/services/language-detect.ts` using `franc` to automatically detect the source language. Configured it to map ISO 639-3 codes (e.g. `jpn`, `zho`, `cmn`, `kor`, `eng`, `ind`) to ISO 639-1 equivalents for MyMemory, defaulting to `ja` for undetermined (`und`) inputs.
- Implemented `src/renderer/services/translation.ts` to coordinate MyMemory API requests. It chunks input strings exceeding the 500-character limitation at sentence boundaries (spaces, newlines, or Japanese punctuation `。` and `、`), executes translations in parallel using `Promise.all`, and merges the translated fragments.
- Modified `src/main/ipc-handlers.ts` to hook up the `translate-text` handler, calling the translation pipeline. On success, it generates a unique entry ID via `crypto.randomUUID()`, prepends the entry to `electron-store` history, and trims the list to 500 entries.
- Modified React `App.tsx` and preload scripts to fully support loading indicators, language badges, error messages, and a functional "Retry" trigger.
- Resolved all TypeScript and ESLint type warnings/errors: eliminated `any` usage, calculated `windowName` directly inside state initializer to prevent React render loop warnings, safely typed history entries and catch blocks, and ignored `.agents` in ESLint configuration.
- Verified build compiles cleanly (`npm run build`), linter passes without errors/warnings (`npm run lint`), and verified translation outputs on multi-language clipboard selections (Japanese, Korean, Chinese, and long chunked texts).

### Decisions made

- **Sentence Boundary Chunking**: Split long text by searching backwards from the 500th character for common delimiters (` `, `\n`, `。`, `、`) to preserve translation context.
- **Mandarin Chinese Detection**: Added `cmn` (Mandarin) mapping to `zh` since `franc` identifies standard Chinese as `cmn` rather than the broader macrolanguage code `zho`.
- **Preload API Contract Typing**: Exposed a strict `ITranslationResponse` structure containing `data` or `error` in preload types to eliminate unsafe `any` casting in React UI code.

### Deviations from spec

- None. Fully compliant with specs.

### Next session should start with

- Feature 04 (Translation Bubbles) to replace the basic React bubble with a draggable, resizable float overlay (`react-rnd`) with customizable styling, window click-through, and close triggers.

---

## 2026-06-25 — Feature 02 Implemented

### What was built

- Implemented `src/main/context-menu.ts` to register/unregister context menu commands via Windows Registry shell entries under `HKCU\Software\Classes\*`. It auto-resolves between production (`Mantra.exe`) and dev mode (`electron.cmd` with project path).
- Modified `src/main/index.ts` to listen to `--translate-selection` command-line arguments on both first startup and second instance locks.
- Configured 100ms clipboard synchronization delay after triggering to allow browsers/Click-to-Do to copy text to the clipboard.
- Implemented deduplication logic preventing identical translation requests within a 500ms window.
- Configured text truncation, limiting inputs to 2000 characters and passing an `isTruncated` status to the renderer.
- Implemented Tray balloon notifications for empty selection warnings.
- Modified React `App.tsx` to handle `context-menu-triggered` IPC event, toggling ignore mouse events on the transparent `bubbleWindow` so it becomes interactive only when the mock bubble is populated.
- Verified Windows Registry structure via `reg query` and successfully compiled all bundles.

### Decisions made

- **Direct CLI Registry Writes**: Used `reg add` commands directly in `child_process.exec` rather than writing a temporary `.reg` file, reducing disk I/O.
- **Context-Isolated Bridge Events**: Handled subscription listeners cleanly in Preload to allow the React renderer to listen for context menu triggers without exposing the raw Electron ipcRenderer.

### Deviations from spec

- None. Fully compliant with specs.

### Next session should start with

- Feature 03 (Translation Pipeline) to replace the mock response handler with the real MyMemory translation API.

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
