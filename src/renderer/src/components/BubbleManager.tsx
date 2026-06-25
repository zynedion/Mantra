import { ISettings } from '../../types'
import { useBubbleStore } from '../store/bubbles'
import { TranslationBubble } from './TranslationBubble'

interface BubbleManagerProps {
  onRetry: (id: string, text: string) => void
  onImprove: (id: string, originalText: string, translatedText: string) => void
  settings: ISettings | null
}

export function BubbleManager({
  onRetry,
  onImprove,
  settings
}: BubbleManagerProps): React.JSX.Element {
  const { bubbles, clearAll } = useBubbleStore()

  if (bubbles.length === 0) {
    return <></>
  }

  return (
    <div className="w-screen h-screen bg-transparent pointer-events-none select-none relative overflow-hidden">
      {/* Active Bubbles */}
      {bubbles.map((bubble) => (
        <TranslationBubble
          key={bubble.id}
          bubble={bubble}
          onRetry={(text) => onRetry(bubble.id, text)}
          onImprove={() => onImprove(bubble.id, bubble.originalText, bubble.translatedText)}
          settings={settings}
        />
      ))}

      {/* Bubble Counter UI */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto select-none flex items-center gap-2 bg-bg-bubble border border-border px-3 py-2 rounded-lg shadow-bubble text-text-primary">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
            Active
          </span>
        </div>
        <span className="text-xs font-bold bg-bg-hover text-accent px-1.5 py-0.5 rounded-md min-w-[20px] text-center border border-border/40">
          {bubbles.length}
        </span>
        <button
          onClick={clearAll}
          className="text-[10px] bg-red-950/20 hover:bg-red-950/40 border border-error/20 hover:border-error/40 text-error px-2 py-1 rounded cursor-pointer transition uppercase font-bold"
        >
          Close All
        </button>
      </div>
    </div>
  )
}
