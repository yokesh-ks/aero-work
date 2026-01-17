/**
 * IPC handlers for Electron dialog operations
 */
import { ipcMain, dialog, IpcMainInvokeEvent, BrowserWindow } from 'electron';
import type { ApiResponse, DirectorySelectResult } from '../../types/project';

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
        const focusedWindow = BrowserWindow.getFocusedWindow();
        const options: Electron.OpenDialogOptions = {
          properties: ['openDirectory', 'createDirectory'],
          title: 'Select Project Directory',
          buttonLabel: 'Select',
        };

        const result = focusedWindow
          ? await dialog.showOpenDialog(focusedWindow, options)
          : await dialog.showOpenDialog(options);

        return {
          success: true,
          data: {
            canceled: result.canceled,
            filePath: result.filePaths[0],
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

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
        const focusedWindow = BrowserWindow.getFocusedWindow();
        const result = focusedWindow
          ? await dialog.showMessageBox(focusedWindow, options)
          : await dialog.showMessageBox(options);

        return {
          success: true,
          data: {
            response: result.response,
            checkboxChecked: result.checkboxChecked,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

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
        dialog.showErrorBox(title, content);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );
}
