/**
 * IPC handlers for GitHub operations
 */
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import {
  storeGitHubToken,
  getGitHubToken,
  clearGitHubToken,
  isAuthenticated,
  getAuthState,
  getRepositories,
  getRepository,
  validateTokenScopes,
  openOAuthUrl,
} from '../services/github-service';
import type { ApiResponse, GitHubRepository, GitHubAuthState } from '../../types/project';

/**
 * Register all GitHub-related IPC handlers
 */
export function registerGitHubHandlers(): void {
  /**
   * Store GitHub token securely
   */
  ipcMain.handle(
    'github:storeToken',
    async (_event: IpcMainInvokeEvent, token: string): Promise<ApiResponse<boolean>> => {
      try {
        const success = await storeGitHubToken(token);
        if (!success) {
          return { success: false, error: 'Failed to store token securely' };
        }
        return { success: true, data: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Get stored GitHub token (for internal use only)
   */
  ipcMain.handle(
    'github:getToken',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<string | null>> => {
      try {
        const token = await getGitHubToken();
        return { success: true, data: token };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Clear stored GitHub token (logout)
   */
  ipcMain.handle(
    'github:clearToken',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<boolean>> => {
      try {
        const success = await clearGitHubToken();
        return { success: true, data: success };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Check if authenticated with GitHub
   */
  ipcMain.handle(
    'github:isAuthenticated',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<boolean>> => {
      try {
        const authenticated = await isAuthenticated();
        return { success: true, data: authenticated };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Get GitHub authentication state
   */
  ipcMain.handle(
    'github:getAuthState',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<GitHubAuthState>> => {
      try {
        const state = await getAuthState();
        return { success: true, data: state };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Open GitHub OAuth URL in browser
   */
  ipcMain.handle(
    'github:openOAuthUrl',
    async (
      _event: IpcMainInvokeEvent,
      clientId: string,
      scopes?: string[]
    ): Promise<ApiResponse<void>> => {
      try {
        openOAuthUrl(clientId, scopes);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Fetch all accessible repositories
   */
  ipcMain.handle(
    'github:getRepositories',
    async (_event: IpcMainInvokeEvent): Promise<ApiResponse<GitHubRepository[]>> => {
      try {
        const repositories = await getRepositories();
        return { success: true, data: repositories };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Fetch a specific repository
   */
  ipcMain.handle(
    'github:getRepository',
    async (
      _event: IpcMainInvokeEvent,
      owner: string,
      repo: string
    ): Promise<ApiResponse<GitHubRepository | null>> => {
      try {
        const repository = await getRepository(owner, repo);
        return { success: true, data: repository };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Validate token has required scopes
   */
  ipcMain.handle(
    'github:validateScopes',
    async (
      _event: IpcMainInvokeEvent,
      requiredScopes?: string[]
    ): Promise<ApiResponse<{ valid: boolean; missingScopes: string[] }>> => {
      try {
        const result = await validateTokenScopes(requiredScopes);
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );
}
