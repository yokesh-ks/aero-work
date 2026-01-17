/**
 * IPC handlers for Electron dialog operations
 */
import { ipcMain, dialog, IpcMainInvokeEvent, BrowserWindow } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { ApiResponse, DirectorySelectResult } from '../../types/project'

interface FileSystemEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modified?: string
}

interface PathValidationResult {
  exists: boolean
  isDirectory: boolean
  hasWritePermission: boolean
  hasGit: boolean
  error?: string
}

/**
 * Register all dialog-related IPC handlers
 */
export function registerDialogHandlers(): void {
  /**
   * Open directory selection dialog
   */
  ipcMain.handle(
    'dialog:selectDirectory',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<DirectorySelectResult>> => {
      try {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        const options: Electron.OpenDialogOptions = {
          properties: ['openDirectory', 'createDirectory'],
          title: 'Select Project Directory',
          buttonLabel: 'Select',
        }

        const result = focusedWindow
          ? await dialog.showOpenDialog(focusedWindow, options)
          : await dialog.showOpenDialog(options)

        return {
          success: true,
          data: {
            canceled: result.canceled,
            filePath: result.filePaths[0],
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
      }
    }
  )

  /**
   * Show message dialog
   */
  ipcMain.handle(
    'dialog:showMessage',
    async (
      _event: IpcMainInvokeEvent,
      options: Electron.MessageBoxOptions
    ): Promise<ApiResponse<{ response: number; checkboxChecked: boolean }>> => {
      try {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        const result = focusedWindow
          ? await dialog.showMessageBox(focusedWindow, options)
          : await dialog.showMessageBox(options)

        return {
          success: true,
          data: {
            response: result.response,
            checkboxChecked: result.checkboxChecked,
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
      }
    }
  )

  /**
   * Show error dialog
   */
  ipcMain.handle(
    'dialog:showError',
    async (
      _event: IpcMainInvokeEvent,
      title: string,
      content: string
    ): Promise<ApiResponse<void>> => {
      try {
        dialog.showErrorBox(title, content)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
      }
    }
  )

  /**
   * List directory contents
   */
  ipcMain.handle(
    'dialog:listDirectory',
    async (
      _event: IpcMainInvokeEvent,
      dirPath: string
    ): Promise<ApiResponse<FileSystemEntry[]>> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        const results: FileSystemEntry[] = []

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name)
          const stats = await fs.stat(fullPath)

          results.push({
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entry.isFile() ? stats.size : undefined,
            modified: stats.mtime.toISOString(),
          })
        }

        // Sort: directories first, then files, alphabetically
        results.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })

        return { success: true, data: results }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
      }
    }
  )

  /**
   * Validate path for project creation
   */
  ipcMain.handle(
    'dialog:validatePath',
    async (
      _event: IpcMainInvokeEvent,
      dirPath: string
    ): Promise<ApiResponse<PathValidationResult>> => {
      try {
        const stats = await fs.stat(dirPath)
        const isDirectory = stats.isDirectory()

        if (!isDirectory) {
          return {
            success: true,
            data: {
              exists: true,
              isDirectory: false,
              hasWritePermission: false,
              hasGit: false,
              error: 'Path is not a directory',
            },
          }
        }

        // Check write permissions
        let hasWritePermission = false
        try {
          const testFile = path.join(dirPath, '.aero-test')
          await fs.writeFile(testFile, 'test')
          await fs.unlink(testFile)
          hasWritePermission = true
        } catch {
          hasWritePermission = false
        }

        // Check for .git directory
        let hasGit = false
        try {
          await fs.access(path.join(dirPath, '.git'))
          hasGit = true
        } catch {
          hasGit = false
        }

        return {
          success: true,
          data: {
            exists: true,
            isDirectory: true,
            hasWritePermission,
            hasGit,
          },
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          return {
            success: true,
            data: {
              exists: false,
              isDirectory: false,
              hasWritePermission: false,
              hasGit: false,
            },
          }
        }

        const message = error instanceof Error ? error.message : 'Unknown error'
        return {
          success: true,
          data: {
            exists: false,
            isDirectory: false,
            hasWritePermission: false,
            hasGit: false,
            error: message,
          },
        }
      }
    }
  )

  /**
   * Get user home directory
   */
  ipcMain.handle(
    'dialog:getHomeDirectory',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<string>> => {
      try {
        const { app } = await import('electron')
        return { success: true, data: app.getPath('home') }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
      }
    }
  )
}
