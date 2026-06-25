import { useEffect, useState, useCallback } from 'react'
import { ISettings } from '../types'

function App(): React.JSX.Element {
  const [windowName] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('window')
  })
  const [settings, setSettings] = useState<ISettings | null>(null)

  // Translation Pipeline States
  const [originalText, setOriginalText] = useState<string>('')
  const [translatedText, setTranslatedText] = useState<string>('')
  const [sourceLang, setSourceLang] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [isTruncated, setIsTruncated] = useState<boolean>(false)

  useEffect(() => {
    // Fetch Settings
    window.electronAPI.getSettings().then(setSettings)
  }, [])

  const handleTranslate = useCallback(
    async (text: string): Promise<void> => {
      setIsLoading(true)
      setErrorMsg('')
      setTranslatedText('')

      try {
        const targetLang = settings?.targetLanguage || 'id'
        const response = await window.electronAPI.translateText({ text, targetLang })

        if (response.error) {
          setErrorMsg(response.error.message || 'Translation failed.')
        } else if (response.data) {
          setTranslatedText(response.data.translatedText)
          setSourceLang(response.data.sourceLang)
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        setErrorMsg(msg || 'Translation failed. Check your internet connection.')
      } finally {
        setIsLoading(false)
      }
    },
    [settings]
  )

  useEffect(() => {
    if (windowName === 'bubble' && settings) {
      const unsubscribe = window.electronAPI.onContextMenuTriggered(
        (data: string | { text: string; isTruncated: boolean }) => {
          const textVal = typeof data === 'string' ? data : data.text
          const truncVal = typeof data === 'object' ? !!data.isTruncated : false

          setOriginalText(textVal)
          setIsTruncated(truncVal)

          // Enable mouse events to interact with the bubble
          window.electronAPI.setMouseEvents(false)

          // Trigger translation
          handleTranslate(textVal)
        }
      )
      return () => {
        unsubscribe()
      }
    }
    return undefined
  }, [windowName, settings, handleTranslate])

  if (windowName === 'bubble') {
    return (
      <div className="w-screen h-screen bg-transparent pointer-events-none select-none flex items-center justify-center">
        {originalText ? (
          <div
            className={`w-[320px] bg-bg-bubble border ${errorMsg ? 'border-error' : 'border-border'} p-4 rounded-lg shadow-bubble text-text-primary flex flex-col pointer-events-auto select-text`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-accent font-bold text-xs">MANTRA</span>
                {sourceLang && (
                  <span className="bg-bg-card text-text-secondary text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                    {sourceLang} → {settings?.targetLanguage || 'id'}
                  </span>
                )}
              </div>
              <button
                className="text-text-secondary hover:text-text-primary text-sm font-bold cursor-pointer"
                onClick={() => {
                  setOriginalText('')
                  setTranslatedText('')
                  setSourceLang('')
                  setErrorMsg('')
                  window.electronAPI.setMouseEvents(true)
                }}
              >
                ×
              </button>
            </div>

            {/* Original Text */}
            <div className="mb-2">
              <span className="text-[10px] text-text-muted font-bold tracking-wider">ORIGINAL</span>
              <div className="text-sm text-text-original border-l-2 border-border pl-2 py-0.5 break-words max-h-24 overflow-y-auto">
                {originalText}
              </div>
            </div>

            {/* Translation Output */}
            <div>
              <span className="text-[10px] text-text-muted font-bold tracking-wider">
                TERJEMAHAN
              </span>
              {isLoading ? (
                <div className="text-xs text-text-secondary bg-accent-dim p-3 rounded mt-1 animate-pulse">
                  Translating...
                </div>
              ) : errorMsg ? (
                <div className="mt-1">
                  <div className="text-xs text-error bg-red-950/20 border border-error/20 p-3 rounded break-words">
                    ⚠ {errorMsg}
                  </div>
                  <button
                    className="mt-2 w-full text-xs bg-red-950/30 hover:bg-red-950/50 text-error border border-error/30 py-1.5 rounded cursor-pointer transition"
                    onClick={() => handleTranslate(originalText)}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="text-sm text-text-primary bg-accent-dim p-3 rounded border border-accent/15 break-words font-medium mt-1">
                  {translatedText}
                </div>
              )}
            </div>

            {isTruncated && (
              <div className="text-[9px] text-warning mt-1.5">
                * Text truncated to 2000 characters
              </div>
            )}
          </div>
        ) : (
          <div className="text-text-muted text-xs bg-bg-bubble border border-border p-2 rounded-md">
            Mantra Bubble Overlay (Active & Click-through)
          </div>
        )}
      </div>
    )
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
