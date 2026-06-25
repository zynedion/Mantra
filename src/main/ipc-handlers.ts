import { ipcMain, BrowserWindow, safeStorage } from 'electron'
import StoreClass from 'electron-store'
import { ISettings } from '../renderer/types'

const Store = (StoreClass as any).default || StoreClass

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

export function registerIpcHandlers(
  bubbleWindow: BrowserWindow | null,
  _getSettingsWindow: () => BrowserWindow | null
): void {
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
      return { success: false, error: { code: 'SETTINGS_SAVE_FAILED', message: (e as Error).message } }
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

  // translate-text (mock for Feature 01)
  ipcMain.handle('translate-text', (_, request) => {
    return {
      translatedText: `[Mock Translation: ${request.text}]`,
      sourceLang: request.sourceLang || 'ja',
      targetLang: request.targetLang,
      provider: 'mymemory'
    }
  })

  // improve-translation (mock for Feature 01)
  ipcMain.handle('improve-translation', (_, request) => {
    return {
      improvedText: `[Mock Improved: ${request.translatedText}]`
    }
  })
}
