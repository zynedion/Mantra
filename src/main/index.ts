import { app, BrowserWindow, Tray, Menu, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'

let bubbleWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

// Single Instance Lock
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showSettingsWindow()
  })
}

function showSettingsWindow(): void {
  if (settingsWindow) {
    if (settingsWindow.isMinimized()) settingsWindow.restore()
    settingsWindow.show()
    settingsWindow.focus()
  }
}

function updateBubbleWindowBounds(): void {
  if (!bubbleWindow) return
  const primaryDisplay = screen.getPrimaryDisplay()
  const { x, y, width, height } = primaryDisplay.workArea
  bubbleWindow.setBounds({ x, y, width, height })
}

function createBubbleWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { x, y, width, height } = primaryDisplay.workArea

  bubbleWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    focusable: false, // Bubbles should not steal focus on creation
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Prevent click-through issues when no bubbles are active
  bubbleWindow.setIgnoreMouseEvents(true, { forward: true })
  bubbleWindow.setAlwaysOnTop(true, 'screen-saver')

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    bubbleWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?window=bubble`)
  } else {
    bubbleWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { window: 'bubble' }
    })
  }

  bubbleWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      bubbleWindow?.hide()
    }
  })
}

function createSettingsWindow(): void {
  settingsWindow = new BrowserWindow({
    width: 560,
    height: 600,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}?window=settings`)
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: { window: 'settings' }
    })
  }

  settingsWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      settingsWindow?.hide()
    }
  })
}

function createTray(): void {
  // Resolve icon path. In dev mode, we look for resources/icon.png relative to project root.
  // When packaged, electron-builder copies resources/icon.png to resources/ folder.
  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(__dirname, '../../resources/icon.png')

  tray = new Tray(iconPath)
  tray.setToolTip('Mantra — Manga Translator')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Settings',
      click: (): void => {
        showSettingsWindow()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Mantra',
      click: (): void => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    showSettingsWindow()
  })
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.mantra.translator')

  // Watch shortcuts in dev
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createBubbleWindow()
  createSettingsWindow()
  createTray()

  // Register IPC handlers
  registerIpcHandlers(bubbleWindow, () => settingsWindow)

  // Listen for monitor changes to recalculate Bubble bounds
  screen.on('display-added', updateBubbleWindowBounds)
  screen.on('display-removed', updateBubbleWindowBounds)
  screen.on('display-metrics-changed', updateBubbleWindowBounds)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBubbleWindow()
      createSettingsWindow()
    }
  })
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
