# Mantra — Master Plan

> **Mantra** = Manga Translator · Electron desktop app for Windows

## Vision

Mantra is a Windows desktop app that lets manga readers instantly translate Japanese text detected on-screen via Windows Click to Do, displaying results as draggable translation bubbles with optional AI-powered natural language improvement.

## Problem

- Manga readers who follow untranslated or fan-translated titles lose reading flow every time they encounter Japanese text — copy-pasting into Google Translate manually breaks immersion and takes 30–60 seconds per panel.
- Windows Copilot+ PC users already have native OCR (Click to Do) that detects and selects text from manga images accurately, but the only action available is "Ask Copilot" — no translation-specific workflow exists.
- Machine translation APIs produce grammatically correct but contextually stiff output that reads unnaturally for manga dialogue, requiring a secondary pass to feel authentic.

## Solution

Mantra integrates into the Windows right-click context menu as a custom action. When a user selects text (via Click to Do OCR or manual selection) and triggers "Translate with Mantra", the app receives the text, translates it via a free API, and displays the result as a floating draggable bubble anchored near the source. An optional AI improvement step (Ollama local or Groq API) rewrites the raw translation into natural-sounding manga dialogue. All provider settings are managed through an in-app Settings panel — no terminal interaction required.

## Target Users

| Persona             | Role                                              | Primary Goal                                   | Key Pain Point                                    |
| ------------------- | ------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| Casual Manga Reader | Non-Japanese speaker following untranslated manga | Read manga panels without leaving the browser  | Manual copy-paste translation breaks immersion    |
| Power Reader        | Heavy reader following 10+ series simultaneously  | Fast, accurate translation with minimal clicks | Raw machine translation feels unnatural and stiff |
| Indonesian Reader   | Indonesian-speaking manga fan (primary locale)    | Read translations in natural Indonesian        | Most translation tools default to English output  |

## Feature Roadmap (build order)

| #   | Feature                          | Status     | File                                   | Depends On   |
| --- | -------------------------------- | ---------- | -------------------------------------- | ------------ |
| 1   | Electron App Shell + Tray        | ✅ Done    | 03_features/01_app-shell.md            | —            |
| 2   | Context Menu Integration         | ✅ Done    | 03_features/02_context-menu.md         | Feature 1    |
| 3   | Translation Pipeline             | ✅ Done    | 03_features/03_translation-pipeline.md | Feature 1    |
| 4   | Draggable Translation Bubbles UI | ✅ Done    | 03_features/04_translation-bubbles.md  | Feature 2, 3 |
| 5   | AI Improvement Layer             | ✅ Done    | 03_features/05_ai-improvement.md       | Feature 3, 4 |
| 6   | Settings Panel                   | ✅ Done    | 03_features/06_settings-panel.md       | Feature 3, 5 |

Status options: 🔄 In Progress · ✅ Done · ⏳ Pending · 🚫 Blocked

## Global Constraints

- **Platform:** Windows 11 only (Build 22000+); Copilot+ PC features (Build 26100+) required for Click to Do OCR
- **Architecture:** Electron + React (desktop app, not browser extension)
- **Performance:** Translation response must appear within 3 seconds on a standard broadband connection; Ollama improvement within 10 seconds
- **Privacy:** No user text is sent to any external server unless the user explicitly configures a cloud provider (Groq) in Settings
- **Offline:** Base app must launch and display previous translation history without internet; only translation calls require network
- **Accessibility:** Keyboard-navigable Settings panel; bubbles closeable via Escape key

## Out of Scope (v1)

- Browser extension (Chrome/Edge) — app-only in v1
- OCR from raw image files (v1 relies on Windows Click to Do for OCR; Mantra receives already-extracted text)
- Mobile or macOS/Linux support
- Syncing translation history across devices
- Custom AI model fine-tuning or model upload
- Paid translation API support (Google Cloud Translate, DeepL Pro) — free APIs only in v1
- In-bubble image annotation or overlay directly on manga panels

## Success Metrics

| Metric                                     | Target                                  | Baseline                  | Measurement                                           |
| ------------------------------------------ | --------------------------------------- | ------------------------- | ----------------------------------------------------- |
| Time from text selection to bubble visible | < 3 seconds                             | ~30–60s (manual workflow) | Manual stopwatch test                                 |
| Translation accuracy (user-rated)          | ≥ 7/10                                  | N/A                       | In-app thumbs up/down per bubble                      |
| AI improvement acceptance rate             | ≥ 60% of sessions where feature is used | 0%                        | Ratio of "improved" vs "original" toggled to improved |
| Settings setup time (first run)            | < 5 minutes                             | N/A                       | Usability test with 3 users                           |
| App crash rate                             | < 1% of sessions                        | N/A                       | Electron uncaughtException log                        |

## Related Files

- Technical specs: `docs/01_technical_specs.md`
- Database schema: `docs/01a_database_schema.sql`
- Design guide: `docs/02_design_guide.md`
- Features: `docs/03_features/`
- Dev log: `docs/04_dev_log.md`
