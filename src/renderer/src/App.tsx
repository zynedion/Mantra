import { useEffect, useState, useCallback } from 'react'
import { ISettings, IBubble } from '../types'
import { useBubbleStore } from './store/bubbles'
import { BubbleManager } from './components/BubbleManager'
import { SettingsPanel } from './components/SettingsPanel'

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

    // Listen for settings changes broadcasted by the settings window
    const unsubscribe = window.electronAPI.onSettingsUpdated((newSettings) => {
      setSettings(newSettings)
    })
    return () => {
      unsubscribe()
    }
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
          const startTime = Date.now()
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
            createdAt: startTime,
            isLoading: true
          }

          addBubble(newBubble)

          try {
            const response = await window.electronAPI.translateText({
              id,
              text: textVal,
              targetLang: settings.targetLanguage || 'id'
            })

            if (response.error) {
              updateBubble(id, {
                isLoading: false,
                error: response.error.message || 'Translation failed.'
              })
            } else if (response.data) {
              const rawDuration = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
              const shouldAutoImprove = settings.autoImprove && settings.aiProvider !== 'none'

              if (shouldAutoImprove) {
                updateBubble(id, {
                  isLoading: false,
                  translatedText: response.data.translatedText,
                  sourceLang: response.data.sourceLang,
                  targetLang: response.data.targetLang,
                  isImproving: true,
                  duration: rawDuration
                })

                try {
                  const improveResponse = await window.electronAPI.improveTranslation({
                    id,
                    originalText: textVal,
                    translatedText: response.data.translatedText,
                    targetLang: settings.targetLanguage || 'id',
                    provider: settings.aiProvider as 'ollama' | 'groq'
                  })

                  if (improveResponse.error) {
                    updateBubble(id, {
                      isImproving: false,
                      aiError: improveResponse.error.message || 'AI improvement failed.'
                    })
                  } else if (improveResponse.data) {
                    const finalDuration = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
                    updateBubble(id, {
                      isImproving: false,
                      improvedText: improveResponse.data.improvedText,
                      showImproved: true,
                      duration: finalDuration
                    })
                  }
                } catch (improveErr: unknown) {
                  const msg = improveErr instanceof Error ? improveErr.message : String(improveErr)
                  updateBubble(id, {
                    isImproving: false,
                    aiError: msg || 'AI improvement failed.'
                  })
                }
              } else {
                updateBubble(id, {
                  isLoading: false,
                  translatedText: response.data.translatedText,
                  sourceLang: response.data.sourceLang,
                  targetLang: response.data.targetLang,
                  duration: rawDuration
                })
              }
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
      updateBubble(id, {
        isLoading: true,
        error: undefined,
        aiError: undefined,
        improvedText: undefined
      })
      const startTime = Date.now()
      try {
        const response = await window.electronAPI.translateText({
          id,
          text,
          targetLang: settings?.targetLanguage || 'id'
        })

        if (response.error) {
          updateBubble(id, {
            isLoading: false,
            error: response.error.message || 'Translation failed.'
          })
        } else if (response.data) {
          const rawDuration = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
          const shouldAutoImprove = settings?.autoImprove && settings?.aiProvider !== 'none'

          if (shouldAutoImprove) {
            updateBubble(id, {
              isLoading: false,
              translatedText: response.data.translatedText,
              sourceLang: response.data.sourceLang,
              targetLang: response.data.targetLang,
              isImproving: true,
              duration: rawDuration
            })

            try {
              const improveResponse = await window.electronAPI.improveTranslation({
                id,
                originalText: text,
                translatedText: response.data.translatedText,
                targetLang: settings?.targetLanguage || 'id',
                provider: settings.aiProvider as 'ollama' | 'groq'
              })

              if (improveResponse.error) {
                updateBubble(id, {
                  isImproving: false,
                  aiError: improveResponse.error.message || 'AI improvement failed.'
                })
              } else if (improveResponse.data) {
                const finalDuration = ((Date.now() - startTime) / 1000).toFixed(1) + 's'
                updateBubble(id, {
                  isImproving: false,
                  improvedText: improveResponse.data.improvedText,
                  showImproved: true,
                  duration: finalDuration
                })
              }
            } catch (improveErr: unknown) {
              const msg = improveErr instanceof Error ? improveErr.message : String(improveErr)
              updateBubble(id, {
                isImproving: false,
                aiError: msg || 'AI improvement failed.'
              })
            }
          } else {
            updateBubble(id, {
              isLoading: false,
              translatedText: response.data.translatedText,
              sourceLang: response.data.sourceLang,
              targetLang: response.data.targetLang,
              duration: rawDuration
            })
          }
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

  // Manual AI improvement logic triggered by individual bubble
  const handleImprove = useCallback(
    async (id: string, originalText: string, translatedText: string): Promise<void> => {
      if (!settings || settings.aiProvider === 'none') return

      updateBubble(id, { isImproving: true, aiError: undefined })

      try {
        const response = await window.electronAPI.improveTranslation({
          id,
          originalText,
          translatedText,
          targetLang: settings.targetLanguage || 'id',
          provider: settings.aiProvider as 'ollama' | 'groq'
        })

        if (response.error) {
          updateBubble(id, {
            isImproving: false,
            aiError: response.error.message || 'AI improvement failed.'
          })
        } else if (response.data) {
          const state = useBubbleStore.getState()
          const currentBubble = state.bubbles.find((b) => b.id === id)
          let totalDuration = currentBubble?.duration || ''

          if (currentBubble?.createdAt) {
            totalDuration = ((Date.now() - currentBubble.createdAt) / 1000).toFixed(1) + 's'
          }

          updateBubble(id, {
            isImproving: false,
            improvedText: response.data.improvedText,
            showImproved: true,
            duration: totalDuration
          })
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        updateBubble(id, {
          isImproving: false,
          aiError: msg || 'AI improvement failed.'
        })
      }
    },
    [settings, updateBubble]
  )

  if (windowName === 'bubble') {
    return <BubbleManager onRetry={handleRetry} onImprove={handleImprove} settings={settings} />
  }

  if (windowName === 'settings') {
    return (
      <div className="w-screen h-screen bg-bg-settings text-text-primary flex flex-col select-none border border-border rounded-lg overflow-hidden shadow-settings">
        {/* Custom Title Bar */}
        <div className="h-8 bg-bg-settings flex items-center justify-between px-3 border-b border-border drag-region">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold">
            <span className="text-accent font-black bg-accent-dim/60 px-1.5 py-0.5 rounded text-[10px] select-none">
              M
            </span>
            <span>Settings</span>
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
        <SettingsPanel />
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
