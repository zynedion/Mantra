-- =============================================================================
-- Mantra — Local Data Schema
-- =============================================================================
-- NOTE: Mantra does NOT use a SQL database. All persistence is handled via
-- electron-store (JSON file on disk). This file documents the data structures
-- as if they were relational tables for AI agent clarity.
-- Actual storage location: %APPDATA%/mantra/config.json (Windows)
-- =============================================================================

-- =============================================================================
-- TABLE: settings
-- Purpose: Single-row user preferences. Persisted via electron-store.
-- electron-store key: "settings"
-- =============================================================================
CREATE TABLE settings (
  id                    INTEGER PRIMARY KEY DEFAULT 1,    -- Always 1; single row
  target_language       TEXT    NOT NULL DEFAULT 'id',    -- ISO 639-1 code; default Indonesian
  translation_provider  TEXT    NOT NULL DEFAULT 'mymemory' CHECK (translation_provider IN ('mymemory')), -- v1: mymemory only
  ai_provider           TEXT    NOT NULL DEFAULT 'none'   CHECK (ai_provider IN ('none', 'ollama', 'groq')),
  ollama_model          TEXT    NOT NULL DEFAULT 'mistral', -- e.g. 'mistral', 'llama2', 'phi3'
  ollama_base_url       TEXT    NOT NULL DEFAULT 'http://localhost:11434', -- Ollama server URL
  groq_api_key_encrypted TEXT   DEFAULT NULL,             -- Encrypted via Electron safeStorage; NULL if not set
  auto_improve          BOOLEAN NOT NULL DEFAULT FALSE,   -- Auto-trigger AI improvement after translation
  bubble_opacity        REAL    NOT NULL DEFAULT 0.95     CHECK (bubble_opacity BETWEEN 0.7 AND 1.0),
  start_on_boot         BOOLEAN NOT NULL DEFAULT FALSE,   -- Register Windows startup entry
  minimize_to_tray      BOOLEAN NOT NULL DEFAULT TRUE,    -- Hide to tray on close
  created_at            INTEGER NOT NULL,                 -- Unix timestamp (ms)
  updated_at            INTEGER NOT NULL                  -- Unix timestamp (ms); update on every save
);

-- =============================================================================
-- TABLE: translation_history
-- Purpose: Local log of all translations performed in this session and past sessions.
-- electron-store key: "history" (array, max 500 entries, LIFO eviction)
-- =============================================================================
CREATE TABLE translation_history (
  id                TEXT    PRIMARY KEY,                  -- nanoid(); e.g. "V1StGXR8_Z5jdHi6B-myT"
  original_text     TEXT    NOT NULL,                     -- Source text received from Click to Do / clipboard
  translated_text   TEXT    NOT NULL,                     -- Raw output from MyMemory API
  improved_text     TEXT    DEFAULT NULL,                 -- AI-improved version; NULL if not requested or failed
  source_lang       TEXT    NOT NULL,                     -- ISO 639-3 from franc (e.g. 'jpn', 'zho')
  target_lang       TEXT    NOT NULL,                     -- ISO 639-1 user setting at time of translation
  ai_provider_used  TEXT    DEFAULT NULL CHECK (ai_provider_used IN (NULL, 'ollama', 'groq')), -- which AI was used for improvement
  user_rating       INTEGER DEFAULT NULL CHECK (user_rating IN (NULL, 1, -1)), -- 1 = thumbs up, -1 = thumbs down
  created_at        INTEGER NOT NULL                      -- Unix timestamp (ms)
);

-- Index: fetch most recent history quickly
CREATE INDEX idx_history_created_at ON translation_history(created_at DESC);

-- =============================================================================
-- TABLE: bubble_positions (ephemeral — NOT persisted across sessions)
-- Purpose: Tracks current position/size of active bubbles in the renderer.
-- Lives in Zustand memory only; never written to disk.
-- Documented here for AI agent awareness of the shape.
-- =============================================================================
CREATE TABLE bubble_positions (
  bubble_id         TEXT    NOT NULL REFERENCES translation_history(id),
  pos_x             INTEGER NOT NULL DEFAULT 100,         -- pixels from left of screen
  pos_y             INTEGER NOT NULL DEFAULT 100,         -- pixels from top of screen
  width             INTEGER NOT NULL DEFAULT 280,         -- bubble width in px
  height            INTEGER NOT NULL DEFAULT 180,         -- bubble height in px (auto on content)
  is_minimized      BOOLEAN NOT NULL DEFAULT FALSE,       -- collapsed to header only
  show_improved     BOOLEAN NOT NULL DEFAULT FALSE        -- toggled to improved text view
);

-- =============================================================================
-- EVICTION POLICY (enforced in ipc-handlers.ts, not SQL)
-- =============================================================================
-- translation_history max rows: 500
-- When a new entry is inserted and count > 500:
--   DELETE FROM translation_history ORDER BY created_at ASC LIMIT 1
-- (Implemented in JavaScript against the electron-store JSON array)

-- =============================================================================
-- DATA MIGRATION STRATEGY
-- =============================================================================
-- electron-store has no built-in migration. Mantra uses a "schema_version" key.
-- On app start, ipc-handlers.ts reads schema_version and runs incremental migrations.
-- Current version: 1
--
-- Example migration runner (pseudocode):
--   if (store.get('schema_version') === undefined) {
--     store.set('settings', DEFAULT_SETTINGS);
--     store.set('history', []);
--     store.set('schema_version', 1);
--   }
