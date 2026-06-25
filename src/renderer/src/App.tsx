import { useEffect, useState } from 'react'

function App(): React.JSX.Element {
  const [windowName, setWindowName] = useState<string | null>(null)
  const [receivedText, setReceivedText] = useState<string>('')
  const [isTruncated, setIsTruncated] = useState<boolean>(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setWindowName(urlParams.get('window'))
  }, [])

  useEffect(() => {
    if (windowName === 'bubble') {
      const unsubscribe = window.electronAPI.onContextMenuTriggered(
        (data: any) => {
          // Support both string payload and object payload { text, isTruncated }
          const textVal = typeof data === 'string' ? data : data.text
          const truncVal = typeof data === 'object' ? !!data.isTruncated : false
          setReceivedText(textVal)
          setIsTruncated(truncVal)

          // Enable mouse events to interact with the bubble
          window.electronAPI.setMouseEvents(false)
        }
      )
      return () => {
        unsubscribe()
      }
    }
    return undefined
  }, [windowName])

  if (windowName === 'bubble') {
    return (
      <div className="w-screen h-screen bg-transparent pointer-events-none select-none flex items-center justify-center">
        {receivedText ? (
          <div className="w-[280px] bg-bg-bubble border border-border p-4 rounded-lg shadow-bubble text-text-primary flex flex-col pointer-events-auto select-text">
            <div className="flex justify-between items-center mb-2">
              <span className="text-accent font-bold text-xs">MANTRA BUBBLE</span>
              <button
                className="text-text-secondary hover:text-text-primary text-sm font-bold cursor-pointer"
                onClick={() => {
                  setReceivedText('')
                  window.electronAPI.setMouseEvents(true)
                }}
              >
                ×
              </button>
            </div>
            <div className="text-sm bg-bg-input p-2 rounded border border-border break-words font-medium">
              {receivedText}
            </div>
            {isTruncated && (
              <div className="text-[10px] text-warning mt-1">
                * Text was truncated to 2000 characters
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
