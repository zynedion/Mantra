import { useEffect, useState } from 'react'

function App(): React.JSX.Element {
  const [windowName, setWindowName] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setWindowName(urlParams.get('window'))
  }, [])

  if (windowName === 'bubble') {
    return (
      <div className="w-screen h-screen bg-transparent pointer-events-none select-none flex items-center justify-center">
        <div className="text-text-muted text-xs bg-bg-bubble border border-border p-2 rounded-md">
          Mantra Bubble Overlay (Active)
        </div>
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
