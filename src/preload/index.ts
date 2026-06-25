import { contextBridge, ipcRenderer } from 'electron'
import { ISettings, ITranslationRequest, IAIImproveRequest } from '../renderer/types'

// Safe APIs exposed to the renderer under window.electronAPI
const electronAPI = {
  translateText: (request: ITranslationRequest) => ipcRenderer.invoke('translate-text', request),

  improveTranslation: (request: IAIImproveRequest) =>
    ipcRenderer.invoke('improve-translation', request),

  getSettings: () => ipcRenderer.invoke('get-settings'),

  saveSettings: (settings: Partial<ISettings>) => ipcRenderer.invoke('save-settings', settings),

  testOllama: (baseUrl: string, model: string) =>
    ipcRenderer.invoke('test-ollama', { baseUrl, model }),

  testGroq: (apiKey: string) => ipcRenderer.invoke('test-groq', { apiKey }),

  onSettingsUpdated: (callback: (settings: ISettings) => void) => {
    const subscription = (_event: unknown, settings: ISettings): void => callback(settings)
    ipcRenderer.on('settings-updated', subscription)
    return () => {
      ipcRenderer.off('settings-updated', subscription)
    }
  },

  getHistory: (params: { limit: number }) => ipcRenderer.invoke('get-history', params),

  clearHistory: () => ipcRenderer.invoke('clear-history'),

  setMouseEvents: (ignore: boolean) => ipcRenderer.invoke('set-mouse-events', { ignore }),

  onContextMenuTriggered: (
    callback: (data: string | { text: string; isTruncated: boolean }) => void
  ) => {
    const subscription = (
      _event: unknown,
      data: string | { text: string; isTruncated: boolean }
    ): void => callback(data)
    ipcRenderer.on('context-menu-triggered', subscription)
    return () => {
      ipcRenderer.off('context-menu-triggered', subscription)
    }
  },

  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),

  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),

  onWindowMaximizedState: (callback: (isMaximized: boolean) => void) => {
    const subscription = (_event: unknown, isMaximized: boolean): void => callback(isMaximized)
    ipcRenderer.on('window-maximized-state', subscription)
    return () => {
      ipcRenderer.off('window-maximized-state', subscription)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error('Failed to expose APIs in main world:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI
}
