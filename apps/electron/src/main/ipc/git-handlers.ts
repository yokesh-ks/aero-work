/**
 * IPC handlers for Git operations
 */
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import {
  cloneRepository,
  validateRepositoryRemote,
  isGitRepository,
  getCurrentBranch,
  getRepositoryStatus,
  pullRepository,
  directoryExists,
  isDirectoryWritable,
  isDirectoryEmpty,
} from '../services/git-service';
import type { ApiResponse, GitOperationResult } from '../../types/project';

/**
 * Register all Git-related IPC handlers
 */
export function registerGitHandlers(): void {
  /**
   * Clone a GitHub repository
   */
  ipcMain.handle(
    'git:clone',
    async (
      _event: IpcMainInvokeEvent,
      owner: string,
      repo: string,
      targetPath: string
    ): Promise<ApiResponse<GitOperationResult>> => {
      try {
        const result = await cloneRepository(owner, repo, targetPath);
        return { success: result.success, data: result, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Validate that a repository's remote matches expected GitHub URL
   */
  ipcMain.handle(
    'git:validateRemote',
    async (
      _event: IpcMainInvokeEvent,
      dirPath: string,
      expectedOwner: string,
      expectedRepo: string
    ): Promise<ApiResponse<GitOperationResult>> => {
      try {
        const result = await validateRepositoryRemote(dirPath, expectedOwner, expectedRepo);
        return { success: result.success, data: result, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Check if a directory is a Git repository
   */
  ipcMain.handle(
    'git:isRepository',
    async (_event: IpcMainInvokeEvent, dirPath: string): Promise<ApiResponse<boolean>> => {
      try {
        const isRepo = await isGitRepository(dirPath);
        return { success: true, data: isRepo };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Get current branch name
   */
  ipcMain.handle(
    'git:getCurrentBranch',
    async (_event: IpcMainInvokeEvent, dirPath: string): Promise<ApiResponse<string | null>> => {
      try {
        const branch = await getCurrentBranch(dirPath);
        return { success: true, data: branch };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Get repository status
   */
  ipcMain.handle(
    'git:getStatus',
    async (
      _event: IpcMainInvokeEvent,
      dirPath: string
    ): Promise<
      ApiResponse<{
        isClean: boolean;
        current: string | null;
        tracking: string | null;
        ahead: number;
        behind: number;
      } | null>
    > => {
      try {
        const status = await getRepositoryStatus(dirPath);
        return { success: true, data: status };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Pull latest changes
   */
  ipcMain.handle(
    'git:pull',
    async (_event: IpcMainInvokeEvent, dirPath: string): Promise<ApiResponse<GitOperationResult>> => {
      try {
        const result = await pullRepository(dirPath);
        return { success: result.success, data: result, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Check if directory exists
   */
  ipcMain.handle(
    'git:directoryExists',
    async (_event: IpcMainInvokeEvent, dirPath: string): Promise<ApiResponse<boolean>> => {
      try {
        const exists = await directoryExists(dirPath);
        return { success: true, data: exists };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Check if directory is writable
   */
  ipcMain.handle(
    'git:isDirectoryWritable',
    async (_event: IpcMainInvokeEvent, dirPath: string): Promise<ApiResponse<boolean>> => {
      try {
        const writable = await isDirectoryWritable(dirPath);
        return { success: true, data: writable };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Check if directory is empty
   */
  ipcMain.handle(
    'git:isDirectoryEmpty',
    async (_event: IpcMainInvokeEvent, dirPath: string): Promise<ApiResponse<boolean>> => {
      try {
        const empty = await isDirectoryEmpty(dirPath);
        return { success: true, data: empty };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );
}
