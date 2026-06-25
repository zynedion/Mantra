import { ipcMain, BrowserWindow, safeStorage } from 'electron'
import StoreClass from 'electron-store'
import { randomUUID } from 'crypto'
import { ISettings } from '../renderer/types'
import { translateText } from '../renderer/services/translation'
import { improveWithOllama, improveWithGroq, IMPROVE_PROMPT } from './ai-improver'

interface IHistoryEntry {
  id: string
  originalText: string
  translatedText: string
  improvedText?: string
  sourceLang: string
  targetLang: string
  createdAt: number
}

const Store = (StoreClass as unknown as Record<string, typeof StoreClass>).default || StoreClass

const DEFAULT_SETTINGS: ISettings = {
  targetLanguage: 'id',
  translationProvider: 'mymemory',
  aiProvider: 'none',
  ollamaModel: 'mistral',
  ollamaBaseUrl: 'http://localhost:11434',
  groqApiKey: '',
  autoImprove: false,
  bubbleOpacity: 0.95,
  startOnBoot: false,
  minimizeToTray: true
}

const store = new Store({
  defaults: {
    schema_version: 1,
    settings: DEFAULT_SETTINGS,
    history: []
  }
})

// Helper functions for API key encryption/decryption
function encryptKey(key: string): string {
  if (!key) return ''
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.encryptString(key).toString('base64')
    } catch (e) {
      console.error('Failed to encrypt Groq API key:', e)
    }
  }
  return key
}

function decryptKey(encryptedKey: string): string {
  if (!encryptedKey) return ''
  if (safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(encryptedKey, 'base64'))
    } catch (e) {
      console.error('Failed to decrypt Groq API key:', e)
    }
  }
  return encryptedKey
}

export function registerIpcHandlers(bubbleWindow: BrowserWindow | null): void {
  // get-settings
  ipcMain.handle('get-settings', () => {
    try {
      const settings = store.get('settings') as ISettings
      return {
        ...settings,
        groqApiKey: settings.groqApiKey ? decryptKey(settings.groqApiKey) : ''
      }
    } catch (e) {
      console.error('Failed to get settings:', e)
      return DEFAULT_SETTINGS
    }
  })

  // save-settings
  ipcMain.handle('save-settings', (_, partialSettings: Partial<ISettings>) => {
    try {
      const currentSettings = store.get('settings') as ISettings
      const updatedSettings = { ...currentSettings, ...partialSettings }

      // Encrypt groqApiKey if it was updated
      if (partialSettings.groqApiKey !== undefined) {
        updatedSettings.groqApiKey = partialSettings.groqApiKey
          ? encryptKey(partialSettings.groqApiKey)
          : ''
      }

      store.set('settings', updatedSettings)
      return { success: true }
    } catch (e) {
      console.error('Failed to save settings:', e)
      return {
        success: false,
        error: { code: 'SETTINGS_SAVE_FAILED', message: (e as Error).message }
      }
    }
  })

  // get-history
  ipcMain.handle('get-history', (_, { limit }: { limit: number }) => {
    try {
      const history = store.get('history') || []
      return history.slice(0, limit)
    } catch (e) {
      console.error('Failed to get history:', e)
      return []
    }
  })

  // clear-history
  ipcMain.handle('clear-history', () => {
    try {
      store.set('history', [])
      return { success: true }
    } catch (e) {
      console.error('Failed to clear history:', e)
      return { success: false }
    }
  })

  // set-mouse-events
  ipcMain.handle('set-mouse-events', (_, { ignore }: { ignore: boolean }) => {
    try {
      if (bubbleWindow) {
        if (ignore) {
          bubbleWindow.setIgnoreMouseEvents(true, { forward: true })
        } else {
          bubbleWindow.setIgnoreMouseEvents(false)
        }
      }
      return { success: true }
    } catch (e) {
      console.error('Failed to set mouse events:', e)
      return { success: false }
    }
  })

  // translate-text
  ipcMain.handle('translate-text', async (_, request) => {
    try {
      const result = await translateText(request)

      // Save to history
      const entry = {
        id: request.id || randomUUID(),
        originalText: request.text,
        translatedText: result.translatedText,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
        createdAt: Date.now()
      }

      const history: IHistoryEntry[] = (store.get('history') as IHistoryEntry[]) || []
      history.unshift(entry)
      if (history.length > 500) {
        history.pop()
      }
      store.set('history', history)

      return { data: { ...result, id: entry.id } }
    } catch (error: unknown) {
      const err = error as Record<string, unknown>
      return {
        error: {
          code: (err.code as string) || 'TRANSLATION_FAILED',
          message: (err.message as string) || 'Translation failed.'
        }
      }
    }
  })

  // improve-translation
  ipcMain.handle('improve-translation', async (_, request) => {
    try {
      const settings = store.get('settings') as ISettings
      const prompt = IMPROVE_PROMPT(
        request.originalText,
        request.translatedText,
        request.targetLang
      )

      let improvedText: string
      if (request.provider === 'ollama') {
        improvedText = await improveWithOllama(prompt, settings.ollamaModel, settings.ollamaBaseUrl)
      } else {
        const apiKey = settings.groqApiKey ? decryptKey(settings.groqApiKey) : ''
        improvedText = await improveWithGroq(prompt, apiKey)
      }

      const history: IHistoryEntry[] = (store.get('history') as IHistoryEntry[]) || []
      const index = history.findIndex((h) => h.id === request.id)
      if (index !== -1) {
        history[index].improvedText = improvedText
        store.set('history', history)
      }

      return { data: { improvedText } }
    } catch (error: unknown) {
      const err = error as Record<string, unknown>
      return {
        error: {
          code: (err.code as string) || 'AI_IMPROVE_FAILED',
          message: (err.message as string) || 'AI improvement failed.'
        }
      }
    }
  })
}
