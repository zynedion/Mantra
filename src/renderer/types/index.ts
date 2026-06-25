export interface IBubble {
  id: string // nanoid() generated
  originalText: string // Source text from Click to Do / clipboard
  translatedText: string // Raw translation from MyMemory
  improvedText?: string // AI-improved version (optional)
  sourceLang: string // ISO 639-3 code from franc (e.g. "jpn")
  targetLang: string // User setting (default: "id")
  position: { x: number; y: number } // Current bubble position (px)
  size: { width: number; height: number }
  isImproving: boolean // AI improvement in progress
  createdAt: number // Unix timestamp
}

export interface ISettings {
  targetLanguage: string // Default: "id" (Indonesian)
  translationProvider: 'mymemory' // v1: only MyMemory
  aiProvider: 'none' | 'ollama' | 'groq'
  ollamaModel: string // Default: "mistral"
  ollamaBaseUrl: string // Default: "http://localhost:11434"
  groqApiKey: string // Stored encrypted via safeStorage
  autoImprove: boolean // If true, auto-trigger AI improvement
  bubbleOpacity: number // 0.7 – 1.0, default 0.95
  startOnBoot: boolean // Register as Windows startup entry
  minimizeToTray: boolean // Default: true
}

export interface ITranslationRequest {
  text: string
  sourceLang?: string // If omitted, auto-detect via franc
  targetLang: string
}

export interface ITranslationResult {
  translatedText: string
  sourceLang: string
  targetLang: string
  provider: string
}

export interface ITranslationResponse {
  data?: ITranslationResult & { id?: string }
  error?: {
    code: string
    message: string
  }
}

export interface IAIImproveRequest {
  originalText: string
  translatedText: string
  targetLang: string
  provider: 'ollama' | 'groq'
}
