import { useState, useRef } from 'react'
import { Rnd } from 'react-rnd'
import { IBubble, ISettings } from '../../types'
import { useBubbleStore } from '../store/bubbles'

interface TranslationBubbleProps {
  bubble: IBubble
  onRetry: (text: string) => void
  onImprove: () => void
  settings: ISettings | null
}

export function TranslationBubble({
  bubble,
  onRetry,
  onImprove,
  settings
}: TranslationBubbleProps): React.JSX.Element {
  const { focusedBubbleId, updateBubble, removeBubble, focusBubble } = useBubbleStore()
  const [copied, setCopied] = useState(false)
  const isFocused = focusedBubbleId === bubble.id
  const rndRef = useRef<Rnd | null>(null)

  const handleCopy = async (): Promise<void> => {
    try {
      const textToCopy =
        bubble.showImproved !== false && bubble.improvedText
          ? bubble.improvedText
          : bubble.translatedText
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error('Failed to copy text:', e)
    }
  }

  // Format absolute time (e.g., "14:35")
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const truncatedOriginalHeader =
    bubble.originalText.length > 30
      ? `${bubble.originalText.substring(0, 30)}...`
      : bubble.originalText

  const textToShow =
    bubble.showImproved !== false && bubble.improvedText
      ? bubble.improvedText
      : bubble.translatedText

  const shouldTruncateTranslation = textToShow.length > 300
  const displayedTranslation =
    shouldTruncateTranslation && !bubble.isExpanded
      ? `${textToShow.substring(0, 300)}...`
      : textToShow

  return (
    <Rnd
      ref={rndRef}
      size={{
        width: bubble.size?.width || 280,
        height: bubble.isMinimized ? 36 : bubble.size?.height || 'auto'
      }}
      position={bubble.position}
      onDragStop={(_e, d) => {
        updateBubble(bubble.id, { position: { x: d.x, y: d.y } })
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateBubble(bubble.id, {
          position,
          size: {
            width: parseInt(ref.style.width, 10),
            height: bubble.isMinimized ? 36 : parseInt(ref.style.height, 10)
          }
        })
      }}
      dragHandleClassName="bubble-header"
      minWidth={200}
      maxWidth={500}
      disableDragging={false}
      enableResizing={!bubble.isMinimized}
      onDragStart={() => focusBubble(bubble.id)}
      onResizeStart={() => focusBubble(bubble.id)}
      className={`fixed flex flex-col rounded-lg border overflow-hidden ${
        isFocused
          ? 'border-accent shadow-[0_8px_32px_rgba(0,0,0,0.7)] z-50'
          : 'border-border shadow-bubble z-10'
      } bg-bg-bubble text-text-primary pointer-events-auto transition-shadow`}
      style={{ display: 'flex' }}
    >
      {/* Header bar */}
      <div
        className={`bubble-header flex items-center justify-between h-9 px-3 shrink-0 cursor-grab active:cursor-grabbing border-b border-border select-none`}
        style={{ background: 'var(--color-bubble-header)' }}
        onMouseDown={() => focusBubble(bubble.id)}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-bold text-accent tracking-wider uppercase">
            {bubble.isLoading
              ? 'Translating'
              : bubble.isImproving
                ? 'Improving'
                : `${bubble.sourceLang} → ${bubble.targetLang}`}
          </span>
          {bubble.isMinimized && (
            <span className="text-[10px] text-text-secondary truncate max-w-[120px]">
              {truncatedOriginalHeader}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 no-drag">
          <button
            onClick={() => updateBubble(bubble.id, { isMinimized: !bubble.isMinimized })}
            className="w-5 h-5 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-bg-hover text-[10px] font-bold cursor-pointer"
            title={bubble.isMinimized ? 'Expand' : 'Minimize'}
          >
            {bubble.isMinimized ? '▲' : '▼'}
          </button>
          <button
            onClick={() => removeBubble(bubble.id)}
            className="w-5 h-5 flex items-center justify-center rounded text-text-secondary hover:text-error hover:bg-bg-hover text-xs font-bold cursor-pointer"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Bubble Content Area */}
      {!bubble.isMinimized && (
        <div
          className="flex-1 min-h-0 flex flex-col p-3 gap-2 overflow-y-auto"
          onMouseDown={() => focusBubble(bubble.id)}
        >
          {/* Original Text Section */}
          <div className="flex flex-col">
            <span className="text-[9px] text-text-secondary font-bold tracking-wider select-none">
              ORIGINAL
            </span>
            <div className="text-xs text-text-original border-l-2 border-border pl-2 py-0.5 break-words max-h-24 overflow-y-auto select-text select-none">
              {bubble.originalText}
            </div>
          </div>

          {/* Translation/Status Section */}
          <div className="flex-1 flex flex-col min-h-0 justify-center">
            {bubble.isLoading ? (
              /* Loading Skeleton for translating */
              <div className="flex flex-col gap-1.5 p-2 bg-accent-dim rounded border border-accent/10 animate-pulse">
                <span className="text-[9px] text-text-secondary font-bold tracking-wider select-none">
                  TERJEMAHAN (TRANSLATING...)
                </span>
                <div className="h-4 bg-text-secondary/20 rounded w-5/6"></div>
                <div className="h-4 bg-text-secondary/20 rounded w-2/3"></div>
              </div>
            ) : bubble.isImproving &&
              !bubble.improvedText &&
              !bubble.aiError &&
              settings?.autoImprove ? (
              /* Loading Skeleton for improving during auto-improve */
              <div className="flex flex-col gap-1.5 p-2 bg-accent-dim rounded border border-accent/10 animate-pulse">
                <span className="text-[9px] text-text-secondary font-bold tracking-wider select-none">
                  TERJEMAHAN (IMPROVING...)
                </span>
                <div className="h-4 bg-text-secondary/20 rounded w-5/6"></div>
                <div className="h-4 bg-text-secondary/20 rounded w-2/3"></div>
              </div>
            ) : bubble.error ? (
              /* Error State */
              <div className="flex flex-col gap-2 p-2 bg-red-950/20 border border-error/20 rounded">
                <span className="text-[9px] text-error font-bold tracking-wider select-none">
                  ERROR
                </span>
                <div className="text-xs text-error break-words select-text">⚠ {bubble.error}</div>
                <button
                  onClick={() => onRetry(bubble.originalText)}
                  className="w-full text-[11px] bg-red-950/40 hover:bg-red-950/60 text-error border border-error/30 py-1 rounded cursor-pointer transition select-none"
                >
                  Retry
                </button>
              </div>
            ) : (
              /* Success State */
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center select-none mb-1">
                  <span className="text-[9px] text-text-secondary font-bold tracking-wider">
                    {bubble.showImproved !== false && bubble.improvedText
                      ? 'TERJEMAHAN (AI IMPROVED)'
                      : 'TERJEMAHAN'}
                  </span>
                  {bubble.improvedText && (
                    <button
                      onClick={() =>
                        updateBubble(bubble.id, { showImproved: bubble.showImproved === false })
                      }
                      className="text-[9px] text-accent hover:text-accent-hover font-semibold cursor-pointer underline"
                    >
                      {bubble.showImproved !== false ? 'Show Raw' : 'Show Improved'}
                    </button>
                  )}
                </div>
                <div className="text-xs text-text-primary bg-accent-dim/40 p-2.5 rounded border border-accent/10 break-words font-medium select-text">
                  {displayedTranslation}
                  {shouldTruncateTranslation && (
                    <button
                      onClick={() => updateBubble(bubble.id, { isExpanded: !bubble.isExpanded })}
                      className="ml-1 text-[10px] text-accent hover:text-accent-hover font-semibold cursor-pointer underline select-none"
                    >
                      {bubble.isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
                {bubble.aiError && (
                  <div className="mt-1 text-[10px] text-error bg-red-950/20 border border-error/20 rounded p-1.5 break-words">
                    ⚠ AI unavailable: {bubble.aiError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action Row */}
          {!bubble.isLoading &&
            !bubble.error &&
            !(
              bubble.isImproving &&
              !bubble.improvedText &&
              !bubble.aiError &&
              settings?.autoImprove
            ) && (
              <div className="flex justify-between items-center mt-1 border-t border-border/40 pt-2 shrink-0 select-none">
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-[10px] bg-bg-hover hover:bg-accent/15 border border-border hover:border-accent/30 text-text-secondary hover:text-accent px-2 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy
                  </button>
                  {copied && (
                    <span className="absolute left-14 bottom-full mb-1 text-[9px] bg-success text-bg-settings font-bold px-1 rounded animate-fade-in select-none">
                      Copied!
                    </span>
                  )}
                  {/* ✨ Improve button */}
                  {settings && settings.aiProvider !== 'none' && !bubble.improvedText && (
                    <button
                      onClick={onImprove}
                      disabled={bubble.isImproving}
                      className="text-[10px] bg-bg-hover hover:bg-accent/15 border border-border hover:border-accent/30 text-text-secondary hover:text-accent px-2.5 py-0.5 rounded cursor-pointer transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bubble.isImproving ? 'Improving...' : '✨ Improve'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {bubble.duration && (
                    <span className="text-[9px] text-accent font-semibold">{bubble.duration}</span>
                  )}
                  <span className="text-[9px] text-text-muted">{formatTime(bubble.createdAt)}</span>
                </div>
              </div>
            )}
        </div>
      )}
    </Rnd>
  )
}
