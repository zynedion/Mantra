import {
  ISettings,
  ITranslationRequest,
  ITranslationResponse,
  IAIImproveRequest,
  IAIImproveResponse,
  IBubble
} from '../renderer/types'

declare global {
  interface Window {
    electronAPI: {
      translateText: (request: ITranslationRequest) => Promise<ITranslationResponse>
      improveTranslation: (request: IAIImproveRequest) => Promise<IAIImproveResponse>
      getSettings: () => Promise<ISettings>
      saveSettings: (settings: Partial<ISettings>) => Promise<{ success: boolean }>
      testOllama: (
        baseUrl: string,
        model: string
      ) => Promise<{ connected: boolean; modelFound: boolean }>
      testGroq: (apiKey: string) => Promise<{ valid: boolean; status?: number }>
      onSettingsUpdated: (callback: (settings: ISettings) => void) => () => void
      getHistory: (params: { limit: number }) => Promise<IBubble[]>
      clearHistory: () => Promise<{ success: boolean }>
      setMouseEvents: (ignore: boolean) => Promise<{ success: boolean }>
      onContextMenuTriggered: (
        callback: (data: string | { text: string; isTruncated: boolean }) => void
      ) => () => void
    }
  }
}
