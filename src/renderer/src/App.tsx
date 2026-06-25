import { useEffect, useState, useCallback } from 'react'
import { ISettings, IBubble } from '../types'
import { useBubbleStore } from './store/bubbles'
import { BubbleManager } from './components/BubbleManager'

function App(): React.JSX.Element {
  const [windowName] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('window')
  })
  const [settings, setSettings] = useState<ISettings | null>(null)

  const { bubbles, addBubble, updateBubble } = useBubbleStore()

  useEffect(() => {
    // Fetch Settings
    window.electronAPI.getSettings().then(setSettings)
  }, [])

  // Dynamic Click-Through capturing based on bubble count
  useEffect(() => {
    if (windowName === 'bubble') {
      if (bubbles.length === 0) {
        window.electronAPI.setMouseEvents(true)
      } else {
        window.electronAPI.setMouseEvents(false)
      }
    }
  }, [bubbles.length, windowName])

  // Key handler for Escape key dismissal
  useEffect(() => {
    if (windowName !== 'bubble') return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        const state = useBubbleStore.getState()
        if (state.bubbles.length > 0) {
          if (state.focusedBubbleId) {
            state.removeBubble(state.focusedBubbleId)
          } else {
            state.removeBubble(state.bubbles[state.bubbles.length - 1].id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [windowName])

  // Context Menu trigger subscription
  useEffect(() => {
    if (windowName === 'bubble' && settings) {
      const unsubscribe = window.electronAPI.onContextMenuTriggered(
        async (data: string | { text: string; isTruncated: boolean }) => {
          const textVal = typeof data === 'string' ? data : data.text
          // Generate a client-side random UUID in the renderer
          const id = window.crypto.randomUUID()
          const newBubble: IBubble = {
            id,
            originalText: textVal,
            translatedText: '',
            sourceLang: '',
            targetLang: settings.targetLanguage || 'id',
            position: { x: 0, y: 0 },
            size: { width: 280, height: 180 },
            isImproving: false,
            createdAt: Date.now(),
            isLoading: true
          }

          addBubble(newBubble)

          try {
            const response = await window.electronAPI.translateText({
              text: textVal,
              targetLang: settings.targetLanguage || 'id'
            })

            if (response.error) {
              updateBubble(id, {
                isLoading: false,
                error: response.error.message || 'Translation failed.'
              })
            } else if (response.data) {
              updateBubble(id, {
                isLoading: false,
                translatedText: response.data.translatedText,
                sourceLang: response.data.sourceLang,
                targetLang: response.data.targetLang
              })
            }
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
            updateBubble(id, {
              isLoading: false,
              error: msg || 'Translation failed. Check your internet connection.'
            })
          }
        }
      )
      return () => {
        unsubscribe()
      }
    }
    return undefined
  }, [windowName, settings, addBubble, updateBubble])

  // Retry logic triggered by individual bubble
  const handleRetry = useCallback(
    async (id: string, text: string): Promise<void> => {
      updateBubble(id, { isLoading: true, error: undefined })
      try {
        const response = await window.electronAPI.translateText({
          text,
          targetLang: settings?.targetLanguage || 'id'
        })

        if (response.error) {
          updateBubble(id, {
            isLoading: false,
            error: response.error.message || 'Translation failed.'
          })
        } else if (response.data) {
          updateBubble(id, {
            isLoading: false,
            translatedText: response.data.translatedText,
            sourceLang: response.data.sourceLang,
            targetLang: response.data.targetLang
          })
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        updateBubble(id, {
          isLoading: false,
          error: msg || 'Translation failed. Check your internet connection.'
        })
      }
    },
    [settings, updateBubble]
  )

  if (windowName === 'bubble') {
    return <BubbleManager onRetry={handleRetry} />
  }

  if (windowName === 'settings') {
    return (
      <div className="w-screen h-screen bg-bg-settings text-text-primary flex flex-col select-none border border-border rounded-lg overflow-hidden shadow-settings">
        {/* Custom Title Bar */}
        <div className="h-8 bg-bg-settings flex items-center justify-between px-3 border-b border-border drag-region">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <span className="text-accent font-bold">M</span>
            <span>Mantra Settings</span>
          </div>
          <button
            className="text-text-secondary hover:text-error hover:bg-bg-hover rounded px-2 py-0.5 no-drag"
            onClick={() => window.close()}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center">
          <h1 className="text-xl font-bold text-text-primary mb-2">Mantra</h1>
          <p className="text-text-secondary text-sm">Desktop Manga Translator</p>
          <div className="mt-4 text-xs text-text-muted">App Shell Loaded Successfully.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 text-center text-text-primary bg-bg-settings min-h-screen">
      <h1 className="text-lg font-bold">Mantra Application</h1>
      <p className="text-sm text-text-secondary mt-2">Unknown Window context.</p>
    </div>
  )
}

export default App
