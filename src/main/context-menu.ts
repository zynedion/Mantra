import { exec } from 'child_process'
import { app } from 'electron'
import * as path from 'path'

export function registerContextMenu(): void {
  // Only register on Windows
  if (process.platform !== 'win32') return

  const isPackaged = app.isPackaged
  let commandVal = ''
  let iconVal = ''

  if (isPackaged) {
    const exePath = process.execPath
    commandVal = `\\"${exePath}\\" --translate-selection`
    iconVal = `${exePath},-1`
  } else {
    const projectPath = app.getAppPath()
    const electronCmd = path.join(projectPath, 'node_modules/.bin/electron.cmd')
    commandVal = `\\"${electronCmd}\\" \\"${projectPath}\\" --translate-selection`
    // Use default electron icon in dev
    iconVal = `${process.execPath},-1`
  }

  const cmdLabel = `reg add "HKCU\\Software\\Classes\\*\\shell\\MantraTranslate" /ve /d "Translate with Mantra" /f`
  const cmdIcon = `reg add "HKCU\\Software\\Classes\\*\\shell\\MantraTranslate" /v "Icon" /d "${iconVal}" /f`
  const cmdCommand = `reg add "HKCU\\Software\\Classes\\*\\shell\\MantraTranslate\\command" /ve /d "${commandVal}" /f`

  exec(cmdLabel, (err) => {
    if (err) console.error('Failed to register context menu label:', err)
  })
  exec(cmdIcon, (err) => {
    if (err) console.error('Failed to register context menu icon:', err)
  })
  exec(cmdCommand, (err) => {
    if (err) console.error('Failed to register context menu command:', err)
  })
}

export function unregisterContextMenu(): void {
  if (process.platform !== 'win32') return

  const cmdDelete = `reg delete "HKCU\\Software\\Classes\\*\\shell\\MantraTranslate" /f`
  exec(cmdDelete, (err) => {
    if (err) console.error('Failed to unregister context menu:', err)
  })
}
