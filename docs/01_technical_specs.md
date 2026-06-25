# Technical Specifications
> AI Agent: attach this file to every coding session alongside the relevant feature file.
> Do not deviate from naming conventions or folder structure defined here.

## Tech Stack
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| App Framework | Electron | ^30.x | Main process handles IPC, tray, context menu |
| Frontend | React | ^18.x | Renderer process; Vite as bundler |
| Styling | Tailwind CSS | ^3.x | Utility-first; no CSS modules |
| Drag/Resize | react-rnd | ^10.x | Bubble windows: draggable + resizable |
| State Management | Zustand | ^4.x | Renderer state only; no Redux |
| Language Detection | franc | ^6.x | Detects source language from selected text |
| HTTP Client | axios | ^1.x | All external API calls |
| Local Storage | electron-store | ^8.x | Persists user settings and translation history |
| Build/Package | electron-builder | ^24.x | Produces Windows .exe installer |
| Dev Tooling | electron-vite | ^2.x | Unified Vite config for main + renderer |

## Folder Structure
```
mantra/
├── src/
│   ├── main/                         # Electron main process
│   │   ├── index.ts                  # App entry; creates BrowserWindow, tray
│   │   ├── context-menu.ts           # Windows context menu registration
│   │   ├── ipc-handlers.ts           # All ipcMain.handle() definitions
│   │   └── preload.ts                # Preload script; exposes safe APIs to renderer
│   ├── renderer/                     # React app (renderer process)
│   │   ├── components/
│   │   │   ├── ui/                   # Primitive components: Button, Input, Toggle, Select
│   │   │   ├── TranslationBubble/    # Bubble component + drag logic
│   │   │   ├── BubbleManager/        # Multi-bubble orchestrator
│   │   │   └── SettingsPanel/        # Settings screens and form controls
│   │   ├── services/
│   │   │   ├── translation.ts        # MyMemory API integration
│   │   │   ├── ai-improver.ts        # Ollama + Groq integration
│   │   │   └── language-detect.ts    # franc wrapper
│   │   ├── store/
│   │   │   ├── bubbles.ts            # Zustand: active bubbles state
│   │   │   └── settings.ts           # Zustand: user preferences (synced with electron-store)
│   │   ├── hooks/
│   │   │   └── useTranslation.ts     # Composable: text → translated bubble
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript types
│   │   ├── App.tsx                   # Root component; renders BubbleManager
│   │   └── main.tsx                  # React entry point
├── resources/
│   ├── icon.png                      # App icon (512×512)
│   └── icon.ico                      # Windows taskbar icon
├── docs/                             # PRD files (this folder)
├── electron-builder.yml              # Build config: NSIS installer, Windows target
├── electron.vite.config.ts           # Vite config for Electron
├── tsconfig.json                     # TypeScript config
├── package.json
└── README.md
```

## Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| React components | PascalCase, folder with index.tsx | `TranslationBubble/index.tsx` |
| Utility functions | camelCase | `detectLanguage()` |
| Zustand stores | camelCase, suffix `Store` | `useBubbleStore` |
| IPC channel names | kebab-case strings | `"translate-request"`, `"improve-translation"` |
| electron-store keys | camelCase | `translationProvider`, `aiProvider` |
| TypeScript types/interfaces | PascalCase, prefix `I` for interfaces | `ITranslationResult`, `IBubble` |
| CSS classes | Tailwind utilities only; no custom class names unless necessary | |
| Environment variables | SCREAMING_SNAKE_CASE | `GROQ_API_KEY` |
| Files | kebab-case | `context-menu.ts`, `ai-improver.ts` |

## TypeScript Types (Shared)
```typescript
// src/renderer/types/index.ts

export interface IBubble {
  id: string;                         // nanoid() generated
  originalText: string;               // Source text from Click to Do / clipboard
  translatedText: string;             // Raw translation from MyMemory
  improvedText?: string;              // AI-improved version (optional)
  sourceLang: string;                 // ISO 639-3 code from franc (e.g. "jpn")
  targetLang: string;                 // User setting (default: "id")
  position: { x: number; y: number }; // Current bubble position (px)
  size: { width: number; height: number };
  isImproving: boolean;               // AI improvement in progress
  createdAt: number;                  // Unix timestamp
}

export interface ISettings {
  targetLanguage: string;             // Default: "id" (Indonesian)
  translationProvider: "mymemory";    // v1: only MyMemory
  aiProvider: "none" | "ollama" | "groq";
  ollamaModel: string;                // Default: "mistral"
  ollamaBaseUrl: string;              // Default: "http://localhost:11434"
  groqApiKey: string;                 // Stored encrypted via safeStorage
  autoImprove: boolean;               // If true, auto-trigger AI improvement
  bubbleOpacity: number;              // 0.7 – 1.0, default 0.95
  startOnBoot: boolean;               // Register as Windows startup entry
  minimizeToTray: boolean;            // Default: true
}

export interface ITranslationRequest {
  text: string;
  sourceLang?: string;                // If omitted, auto-detect via franc
  targetLang: string;
}

export interface ITranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
}

export interface IAIImproveRequest {
  originalText: string;
  translatedText: string;
  targetLang: string;
  provider: "ollama" | "groq";
}
```

## IPC Channel Contracts
All IPC communication goes through typed channels. Main process uses `ipcMain.handle()`; renderer uses `window.electronAPI.*` exposed via preload.

| Channel | Direction | Payload | Response |
|---------|-----------|---------|----------|
| `translate-text` | renderer → main | `ITranslationRequest` | `ITranslationResult` |
| `improve-translation` | renderer → main | `IAIImproveRequest` | `{ improvedText: string }` |
| `get-settings` | renderer → main | — | `ISettings` |
| `save-settings` | renderer → main | `Partial<ISettings>` | `{ success: boolean }` |
| `get-history` | renderer → main | `{ limit: number }` | `IBubble[]` |
| `clear-history` | renderer → main | — | `{ success: boolean }` |
| `context-menu-triggered` | main → renderer | `{ text: string }` | — (event, no response) |

## Environment Variables
```bash
# .env (development only — not bundled in production)
GROQ_API_KEY=                         # Set by user in Settings; stored via Electron safeStorage in prod
OLLAMA_BASE_URL=http://localhost:11434 # Default Ollama endpoint; overridable in Settings
```

> ⚠️ ASSUMPTION: In production, the Groq API key is stored using Electron's `safeStorage.encryptString()` and saved to `electron-store`. It is never written to a .env file in the installed app.

## Error Handling Rules
1. All `ipcMain.handle()` functions must be wrapped in `try/catch` and return `{ error: string }` on failure — never throw to renderer.
2. All external HTTP calls (MyMemory, Groq, Ollama) must have a 10-second timeout via `axios` `timeout` config.
3. If MyMemory API returns an error or non-200, fall back to displaying the original text with a visible error state on the bubble.
4. If Ollama is unreachable (connection refused), return a specific error code `OLLAMA_OFFLINE` so the UI can prompt the user to start Ollama.
5. If Groq returns 429 (rate limit), show a specific user-facing message: "Groq rate limit reached. Try again in a moment, or switch to Ollama in Settings."
6. Never log the Groq API key or any user text to the console in production builds.

## API Response Format (IPC errors)
```typescript
// Success
{ data: T }

// Error
{ error: { code: string; message: string } }

// Error codes
// TRANSLATION_FAILED      — MyMemory returned error or empty
// OLLAMA_OFFLINE          — Cannot reach localhost:11434
// OLLAMA_MODEL_NOT_FOUND  — Model not pulled
// GROQ_RATE_LIMIT         — HTTP 429 from Groq
// GROQ_INVALID_KEY        — HTTP 401 from Groq
// AI_IMPROVE_FAILED       — Generic AI improvement failure
// SETTINGS_SAVE_FAILED    — electron-store write error
```

## Build & Packaging
```yaml
# electron-builder.yml
appId: com.mantra.translator
productName: Mantra
directories:
  output: dist
win:
  target: nsis
  icon: resources/icon.ico
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```
