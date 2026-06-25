import {
  ISettings,
  ITranslationRequest,
  ITranslationResult,
  IAIImproveRequest,
  IBubble
} from '../renderer/types'

declare global {
  interface Window {
    electronAPI: {
      translateText: (request: ITranslationRequest) => Promise<ITranslationResult>
      improveTranslation: (request: IAIImproveRequest) => Promise<{ improvedText: string }>
      getSettings: () => Promise<ISettings>
      saveSettings: (settings: Partial<ISettings>) => Promise<{ success: boolean }>
      getHistory: (params: { limit: number }) => Promise<IBubble[]>
      clearHistory: () => Promise<{ success: boolean }>
      setMouseEvents: (ignore: boolean) => Promise<{ success: boolean }>
      onContextMenuTriggered: (callback: (text: string) => void) => () => void
    }
  }
}
