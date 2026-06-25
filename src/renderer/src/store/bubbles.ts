import { create } from 'zustand'
import { IBubble } from '../../types'

interface IBubbleStore {
  bubbles: IBubble[]
  focusedBubbleId: string | null
  addBubble: (bubble: IBubble) => void
  updateBubble: (id: string, partial: Partial<IBubble>) => void
  removeBubble: (id: string) => void
  focusBubble: (id: string) => void
  clearAll: () => void
}

export const useBubbleStore = create<IBubbleStore>((set) => ({
  bubbles: [],
  focusedBubbleId: null,

  addBubble: (bubble) =>
    set((state) => {
      let position = bubble.position
      // If position is not specified or 0, calculate next offset stack
      if (!position || (position.x === 0 && position.y === 0)) {
        const active = state.bubbles
        if (active.length === 0) {
          position = { x: 24, y: 24 }
        } else {
          const last = active[active.length - 1]
          position = { x: last.position.x + 20, y: last.position.y + 20 }
        }
      }
      const newBubble = { ...bubble, position }
      return {
        bubbles: [...state.bubbles, newBubble],
        focusedBubbleId: newBubble.id
      }
    }),

  updateBubble: (id, partial) =>
    set((state) => ({
      bubbles: state.bubbles.map((b) => (b.id === id ? { ...b, ...partial } : b))
    })),

  removeBubble: (id) =>
    set((state) => {
      const remaining = state.bubbles.filter((b) => b.id !== id)
      let nextFocus = state.focusedBubbleId
      // If we closed the focused bubble, focus the most recently focused remaining bubble
      if (state.focusedBubbleId === id) {
        nextFocus = remaining.length > 0 ? remaining[remaining.length - 1].id : null
      }
      return {
        bubbles: remaining,
        focusedBubbleId: nextFocus
      }
    }),

  focusBubble: (id) =>
    set({
      focusedBubbleId: id
    }),

  clearAll: () =>
    set({
      bubbles: [],
      focusedBubbleId: null
    })
}))
