import { create } from 'zustand'
import { ISettings } from '../../types'

interface ISettingsStore {
  settings: ISettings | null
  loadSettings: () => Promise<void>
  updateSetting: <K extends keyof ISettings>(key: K, value: ISettings[K]) => Promise<void>
}

export const useSettingsStore = create<ISettingsStore>((set) => ({
  settings: null,

  loadSettings: async () => {
    const settings = await window.electronAPI.getSettings()
    set({ settings })
  },

  updateSetting: async (key, value) => {
    set((s) => ({ settings: s.settings ? { ...s.settings, [key]: value } : null }))
    await window.electronAPI.saveSettings({ [key]: value })
  }
}))
