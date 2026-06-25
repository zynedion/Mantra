import { contextBridge, ipcRenderer } from 'electron'
import { ISettings, ITranslationRequest, IAIImproveRequest } from '../renderer/types'

// Safe APIs exposed to the renderer under window.electronAPI
const electronAPI = {
  translateText: (request: ITranslationRequest) =>
    ipcRenderer.invoke('translate-text', request),

  improveTranslation: (request: IAIImproveRequest) =>
    ipcRenderer.invoke('improve-translation', request),

  getSettings: () =>
    ipcRenderer.invoke('get-settings'),

  saveSettings: (settings: Partial<ISettings>) =>
    ipcRenderer.invoke('save-settings', settings),

  getHistory: (params: { limit: number }) =>
    ipcRenderer.invoke('get-history', params),

  clearHistory: () =>
    ipcRenderer.invoke('clear-history'),

  setMouseEvents: (ignore: boolean) =>
    ipcRenderer.invoke('set-mouse-events', { ignore }),

  onContextMenuTriggered: (callback: (text: string) => void) => {
    const subscription = (_event: any, text: string): void => callback(text)
    ipcRenderer.on('context-menu-triggered', subscription)
    return () => {
      ipcRenderer.off('context-menu-triggered', subscription)
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
