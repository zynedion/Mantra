import { useEffect, useState } from 'react'
import { useSettingsStore } from '../store/settings'

export function SettingsPanel(): React.JSX.Element {
  const { settings, loadSettings, updateSetting } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<'translation' | 'ai' | 'appearance' | 'about'>(
    'translation'
  )

  // Local state for inputs to support save-on-blur
  const [localOllamaModel, setLocalOllamaModel] = useState('')
  const [localOllamaBaseUrl, setLocalOllamaBaseUrl] = useState('')
  const [localGroqApiKey, setLocalGroqApiKey] = useState('')

  // Password show/hide toggle state
  const [showApiKey, setShowApiKey] = useState(false)

  // Connection testing states
  const [testingOllama, setTestingOllama] = useState(false)
  const [ollamaTestResult, setOllamaTestResult] = useState<{
    connected: boolean
    modelFound: boolean
  } | null>(null)
  const [testingGroq, setTestingGroq] = useState(false)
  const [groqTestResult, setGroqTestResult] = useState<{ valid: boolean; status?: number } | null>(
    null
  )

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setLocalOllamaModel(settings.ollamaModel)
        setLocalOllamaBaseUrl(settings.ollamaBaseUrl)
        setLocalGroqApiKey(settings.groqApiKey || '')
      }, 0)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [settings])

  if (!settings) {
    return (
      <div className="flex-1 flex justify-center items-center bg-bg-settings text-text-secondary text-sm">
        Loading settings...
      </div>
    )
  }

  const handleTestOllama = async (): Promise<void> => {
    setTestingOllama(true)
    setOllamaTestResult(null)
    try {
      const res = await window.electronAPI.testOllama(localOllamaBaseUrl, localOllamaModel)
      setOllamaTestResult(res)
    } catch {
      setOllamaTestResult({ connected: false, modelFound: false })
    } finally {
      setTestingOllama(false)
    }
  }

  const handleTestGroq = async (): Promise<void> => {
    setTestingGroq(true)
    setGroqTestResult(null)
    try {
      const res = await window.electronAPI.testGroq(localGroqApiKey)
      setGroqTestResult(res)
    } catch {
      setGroqTestResult({ valid: false })
    } finally {
      setTestingGroq(false)
    }
  }

  return (
    <div className="flex-1 flex min-h-0 bg-bg-settings select-none">
      {/* Sidebar Navigation */}
      <div className="w-[160px] bg-bg-card border-r border-border flex flex-col pt-4 shrink-0">
        <button
          onClick={() => setActiveTab('translation')}
          className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer text-left ${
            activeTab === 'translation'
              ? 'bg-accent-dim text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c-.313 1.565-.92 3.07-1.78 4.485L7 9m4.8-.5C12.44 6.7 12.86 4.9 13 3"
            />
          </svg>
          Translation
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 mt-1 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer text-left ${
            activeTab === 'ai'
              ? 'bg-accent-dim text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          AI Improvement
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 mt-1 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer text-left ${
            activeTab === 'appearance'
              ? 'bg-accent-dim text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2.5 px-4 py-2.5 mx-2 mt-1 rounded-md text-xs font-semibold tracking-wide transition cursor-pointer text-left ${
            activeTab === 'about'
              ? 'bg-accent-dim text-accent'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          About
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 min-w-0 p-6 overflow-y-auto flex flex-col">
        {activeTab === 'translation' && (
          <div className="flex flex-col gap-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Translation Settings
              </h2>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-semibold text-text-primary">Target Language</span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  Choose the default destination language for manga translations.
                </span>
              </div>
              <select
                value={settings.targetLanguage}
                onChange={(e) => updateSetting('targetLanguage', e.target.value)}
                className="bg-bg-input border border-border text-text-primary text-xs px-2.5 py-1.5 rounded focus:border-accent focus:outline-none cursor-pointer w-40"
              >
                <option value="id">Indonesian (id)</option>
                <option value="en">English (en)</option>
                <option value="zh">Chinese (zh)</option>
                <option value="ko">Korean (ko)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex flex-col gap-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                AI Improvement Layer
              </h2>
            </div>

            {/* AI Provider selector */}
            <div className="flex justify-between items-center py-2 border-b border-border/40">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-semibold text-text-primary">AI Provider</span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  Select the provider to naturalize literal translations into casual dialogue.
                </span>
              </div>
              <select
                value={settings.aiProvider}
                onChange={(e) => {
                  updateSetting('aiProvider', e.target.value as 'none' | 'ollama' | 'groq')
                  setOllamaTestResult(null)
                  setGroqTestResult(null)
                }}
                className="bg-bg-input border border-border text-text-primary text-xs px-2.5 py-1.5 rounded focus:border-accent focus:outline-none cursor-pointer w-40"
              >
                <option value="none">None (Disabled)</option>
                <option value="ollama">Ollama (Local LLM)</option>
                <option value="groq">Groq (Cloud API)</option>
              </select>
            </div>

            {/* Ollama options */}
            {settings.aiProvider === 'ollama' && (
              <div className="flex flex-col gap-3.5 bg-bg-card border border-border p-3.5 rounded-lg animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ollama-model" className="text-xs font-semibold text-text-primary">
                    Ollama Model
                  </label>
                  <input
                    id="ollama-model"
                    type="text"
                    value={localOllamaModel}
                    onChange={(e) => setLocalOllamaModel(e.target.value)}
                    onBlur={() => updateSetting('ollamaModel', localOllamaModel)}
                    placeholder="e.g. mistral"
                    className="bg-bg-input border border-border text-text-primary text-xs px-2.5 py-2 rounded focus:border-accent focus:outline-none placeholder:text-text-muted mt-0.5"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="ollama-url" className="text-xs font-semibold text-text-primary">
                    Server URL
                  </label>
                  <input
                    id="ollama-url"
                    type="text"
                    value={localOllamaBaseUrl}
                    onChange={(e) => setLocalOllamaBaseUrl(e.target.value)}
                    onBlur={() => updateSetting('ollamaBaseUrl', localOllamaBaseUrl)}
                    placeholder="http://localhost:11434"
                    className="bg-bg-input border border-border text-text-primary text-xs px-2.5 py-2 rounded focus:border-accent focus:outline-none placeholder:text-text-muted mt-0.5"
                  />
                </div>

                <div className="flex flex-col items-start mt-1">
                  <button
                    onClick={handleTestOllama}
                    disabled={testingOllama}
                    className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition select-none disabled:opacity-50"
                  >
                    {testingOllama ? 'Testing...' : 'Test Connection'}
                  </button>
                  {ollamaTestResult && (
                    <div
                      className={`text-[11px] font-semibold border rounded px-2.5 py-1.5 mt-2.5 flex items-center gap-1.5 w-full ${
                        ollamaTestResult.connected && ollamaTestResult.modelFound
                          ? 'text-success border-success/30 bg-success/10'
                          : 'text-error border-error/30 bg-error/10'
                      }`}
                    >
                      <span>
                        {ollamaTestResult.connected && ollamaTestResult.modelFound ? '✓' : '⚠'}
                      </span>
                      <span>
                        {ollamaTestResult.connected
                          ? ollamaTestResult.modelFound
                            ? `Connected — model '${localOllamaModel}' available`
                            : `Connected — model '${localOllamaModel}' not found. Run: ollama pull ${localOllamaModel}`
                          : 'Cannot reach Ollama. Is it running?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Groq options */}
            {settings.aiProvider === 'groq' && (
              <div className="flex flex-col gap-3.5 bg-bg-card border border-border p-3.5 rounded-lg animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label htmlFor="groq-key" className="text-xs font-semibold text-text-primary">
                    Groq API Key
                  </label>
                  <div className="relative flex items-center mt-0.5">
                    <input
                      id="groq-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={localGroqApiKey}
                      onChange={(e) => setLocalGroqApiKey(e.target.value)}
                      onBlur={() => updateSetting('groqApiKey', localGroqApiKey.trim())}
                      placeholder="gsk_..."
                      className="bg-bg-input border border-border text-text-primary text-xs pl-2.5 pr-8 py-2 rounded focus:border-accent focus:outline-none placeholder:text-text-muted w-full"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 text-text-secondary hover:text-text-primary text-xs font-bold p-1 cursor-pointer focus:outline-none"
                      type="button"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-start mt-1">
                  <button
                    onClick={handleTestGroq}
                    disabled={testingGroq}
                    className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3 py-1.5 rounded cursor-pointer transition select-none disabled:opacity-50"
                  >
                    {testingGroq ? 'Testing...' : 'Test Key'}
                  </button>
                  {groqTestResult && (
                    <div
                      className={`text-[11px] font-semibold border rounded px-2.5 py-1.5 mt-2.5 flex items-center gap-1.5 w-full ${
                        groqTestResult.valid
                          ? 'text-success border-success/30 bg-success/10'
                          : 'text-error border-error/30 bg-error/10'
                      }`}
                    >
                      <span>{groqTestResult.valid ? '✓' : '⚠'}</span>
                      <span>
                        {groqTestResult.valid
                          ? 'Key valid'
                          : groqTestResult.status === 401
                            ? 'Invalid key. Verify and try again.'
                            : 'Connection failed. Check your internet connection.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auto-Improve Toggle */}
            {settings.aiProvider !== 'none' && (
              <div className="flex justify-between items-center py-2.5 border-b border-border/40 animate-fade-in">
                <div className="flex flex-col pr-4">
                  <span className="text-xs font-semibold text-text-primary">
                    Auto-Improve Dialogue
                  </span>
                  <span className="text-[11px] text-text-secondary mt-0.5">
                    Automatically trigger AI naturalization immediately on translation completion.
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('autoImprove', !settings.autoImprove)}
                  className={`w-10 h-[22px] rounded-full p-0.5 transition cursor-pointer relative ${
                    settings.autoImprove ? 'bg-accent' : 'bg-bg-hover border border-border'
                  }`}
                >
                  <div
                    className={`w-[16px] h-[16px] rounded-full bg-white transition shadow-button ${
                      settings.autoImprove ? 'translate-x-[18px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="flex flex-col gap-4">
            <div className="border-b border-border pb-2">
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Appearance Settings
              </h2>
            </div>

            {/* Bubble Opacity slider */}
            <div className="flex flex-col gap-2 py-2 border-b border-border/40">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary">Bubble Opacity</span>
                  <span className="text-[11px] text-text-secondary mt-0.5">
                    Adjust the opacity of floating translation bubbles.
                  </span>
                </div>
                <span className="text-xs font-bold bg-bg-hover text-accent px-1.5 py-0.5 rounded border border-border/40 min-w-[36px] text-center font-mono">
                  {Math.round(settings.bubbleOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.70"
                max="1.00"
                step="0.05"
                value={settings.bubbleOpacity}
                onChange={(e) => updateSetting('bubbleOpacity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-bg-hover rounded-lg border border-border appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Start on boot toggle */}
            <div className="flex justify-between items-center py-2.5 border-b border-border/40">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-semibold text-text-primary">Start on Boot</span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  Launch Mantra automatically when Windows starts.
                </span>
              </div>
              <button
                onClick={() => updateSetting('startOnBoot', !settings.startOnBoot)}
                className={`w-10 h-[22px] rounded-full p-0.5 transition cursor-pointer relative ${
                  settings.startOnBoot ? 'bg-accent' : 'bg-bg-hover border border-border'
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] rounded-full bg-white transition shadow-button ${
                    settings.startOnBoot ? 'translate-x-[18px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Minimize to tray toggle */}
            <div className="flex justify-between items-center py-2.5 border-b border-border/40">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-semibold text-text-primary">Minimize to Tray</span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  Hide settings to tray instead of quitting the application.
                </span>
              </div>
              <button
                onClick={() => updateSetting('minimizeToTray', !settings.minimizeToTray)}
                className={`w-10 h-[22px] rounded-full p-0.5 transition cursor-pointer relative ${
                  settings.minimizeToTray ? 'bg-accent' : 'bg-bg-hover border border-border'
                }`}
              >
                <div
                  className={`w-[16px] h-[16px] rounded-full bg-white transition shadow-button ${
                    settings.minimizeToTray ? 'translate-x-[18px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="border-b border-border pb-2">
                <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                  About Mantra
                </h2>
              </div>
              <div className="flex flex-col items-center py-4 bg-bg-card border border-border rounded-lg gap-1.5">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent text-white text-2xl font-black shadow-button mb-1 select-none">
                  M
                </div>
                <span className="text-base font-bold text-text-primary">Mantra</span>
                <span className="text-[11px] text-text-secondary uppercase tracking-wider font-bold">
                  Desktop Manga Translator
                </span>
                <span className="text-xs text-text-muted mt-0.5">Version 1.0.0</span>
              </div>
              <div className="text-xs text-text-secondary leading-relaxed bg-bg-card/40 border border-border/60 p-3.5 rounded-lg select-text">
                Mantra is a lightweight Windows manga reading helper. It captures clipboard texts
                extracted by Windows Click to Do OCR and leverages local LLMs (Ollama) or fast cloud
                models (Groq) to naturalize dialogues, preserving manga readability in real time.
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border/40 pt-4 mt-4">
              <div className="flex gap-4 font-semibold">
                <a
                  href="https://github.com/zynedion/Mantra"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-hover transition underline"
                >
                  GitHub
                </a>
                <a
                  href="https://github.com/zynedion/Mantra/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-hover transition underline"
                >
                  Changelog
                </a>
              </div>
              <span className="text-text-muted select-none">© 2026 Mantra. Open Source.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
