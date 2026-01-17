// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type {
  CreateProjectInput,
  ProjectFilter,
  ProjectStatus,
  ApiResponse,
  Project,
  GitHubRepository,
  GitHubAuthState,
  GitOperationResult,
  DirectorySelectResult,
  FileSystemEntry,
  PathValidationResult,
} from './types/project';

/**
 * Electron API exposed to renderer process via contextBridge
 */
const electronAPI = {
  /**
   * Project operations
   */
  projects: {
    list: (filter?: ProjectFilter): Promise<ApiResponse<Project[]>> =>
      ipcRenderer.invoke('projects:list', filter),

    getById: (id: string): Promise<ApiResponse<Project | null>> =>
      ipcRenderer.invoke('projects:getById', id),

    getByGitHubRepoId: (githubRepoId: number): Promise<ApiResponse<Project | null>> =>
      ipcRenderer.invoke('projects:getByGitHubRepoId', githubRepoId),

    create: (input: CreateProjectInput): Promise<ApiResponse<Project>> =>
      ipcRenderer.invoke('projects:create', input),

    updateStatus: (id: string, status: ProjectStatus): Promise<ApiResponse<Project | null>> =>
      ipcRenderer.invoke('projects:updateStatus', id, status),

    updateLastOpened: (id: string): Promise<ApiResponse<Project | null>> =>
      ipcRenderer.invoke('projects:updateLastOpened', id),

    delete: (id: string): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('projects:delete', id),

    existsByGitHubRepoId: (githubRepoId: number): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('projects:existsByGitHubRepoId', githubRepoId),
  },

  /**
   * GitHub operations
   */
  github: {
    storeToken: (token: string): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('github:storeToken', token),

    getToken: (): Promise<ApiResponse<string | null>> =>
      ipcRenderer.invoke('github:getToken'),

    clearToken: (): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('github:clearToken'),

    isAuthenticated: (): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('github:isAuthenticated'),

    getAuthState: (): Promise<ApiResponse<GitHubAuthState>> =>
      ipcRenderer.invoke('github:getAuthState'),

    openOAuthUrl: (clientId: string, scopes?: string[]): Promise<ApiResponse<void>> =>
      ipcRenderer.invoke('github:openOAuthUrl', clientId, scopes),

    getRepositories: (): Promise<ApiResponse<GitHubRepository[]>> =>
      ipcRenderer.invoke('github:getRepositories'),

    getRepository: (owner: string, repo: string): Promise<ApiResponse<GitHubRepository | null>> =>
      ipcRenderer.invoke('github:getRepository', owner, repo),

    validateScopes: (
      requiredScopes?: string[]
    ): Promise<ApiResponse<{ valid: boolean; missingScopes: string[] }>> =>
      ipcRenderer.invoke('github:validateScopes', requiredScopes),
  },

  /**
   * Git operations
   */
  git: {
    clone: (owner: string, repo: string, targetPath: string): Promise<ApiResponse<GitOperationResult>> =>
      ipcRenderer.invoke('git:clone', owner, repo, targetPath),

    validateRemote: (
      dirPath: string,
      expectedOwner: string,
      expectedRepo: string
    ): Promise<ApiResponse<GitOperationResult>> =>
      ipcRenderer.invoke('git:validateRemote', dirPath, expectedOwner, expectedRepo),

    isRepository: (dirPath: string): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('git:isRepository', dirPath),

    getCurrentBranch: (dirPath: string): Promise<ApiResponse<string | null>> =>
      ipcRenderer.invoke('git:getCurrentBranch', dirPath),

    getStatus: (
      dirPath: string
    ): Promise<
      ApiResponse<{
        isClean: boolean;
        current: string | null;
        tracking: string | null;
        ahead: number;
        behind: number;
      } | null>
    > => ipcRenderer.invoke('git:getStatus', dirPath),

    pull: (dirPath: string): Promise<ApiResponse<GitOperationResult>> =>
      ipcRenderer.invoke('git:pull', dirPath),

    directoryExists: (dirPath: string): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('git:directoryExists', dirPath),

    isDirectoryWritable: (dirPath: string): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('git:isDirectoryWritable', dirPath),

    isDirectoryEmpty: (dirPath: string): Promise<ApiResponse<boolean>> =>
      ipcRenderer.invoke('git:isDirectoryEmpty', dirPath),
  },

  /**
   * Dialog operations
   */
  dialog: {
    selectDirectory: (): Promise<ApiResponse<DirectorySelectResult>> =>
      ipcRenderer.invoke('dialog:selectDirectory'),

    showMessage: (
      options: Electron.MessageBoxOptions
    ): Promise<ApiResponse<{ response: number; checkboxChecked: boolean }>> =>
      ipcRenderer.invoke('dialog:showMessage', options),

    showError: (title: string, content: string): Promise<ApiResponse<void>> =>
      ipcRenderer.invoke('dialog:showError', title, content),

    listDirectory: (dirPath: string): Promise<ApiResponse<FileSystemEntry[]>> =>
      ipcRenderer.invoke('dialog:listDirectory', dirPath),

    validatePath: (dirPath: string): Promise<ApiResponse<PathValidationResult>> =>
      ipcRenderer.invoke('dialog:validatePath', dirPath),

    getHomeDirectory: (): Promise<ApiResponse<string>> =>
      ipcRenderer.invoke('dialog:getHomeDirectory'),
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript type declaration for the exposed API
export type ElectronAPI = typeof electronAPI;
