/**
 * GitHub service for renderer process
 * Calls the Electron API exposed via preload
 */
import type { GitHubRepository, GitHubAuthState } from '../../../types/project';

/**
 * Store GitHub token securely
 */
export async function storeGitHubToken(token: string): Promise<boolean> {
  const response = await window.electronAPI.github.storeToken(token);
  if (!response.success) {
    throw new Error(response.error || 'Failed to store token');
  }
  return response.data || false;
}

/**
 * Clear stored GitHub token (logout)
 */
export async function clearGitHubToken(): Promise<boolean> {
  const response = await window.electronAPI.github.clearToken();
  if (!response.success) {
    throw new Error(response.error || 'Failed to clear token');
  }
  return response.data || false;
}

/**
 * Check if authenticated with GitHub
 */
export async function isAuthenticated(): Promise<boolean> {
  const response = await window.electronAPI.github.isAuthenticated();
  if (!response.success) {
    throw new Error(response.error || 'Failed to check authentication');
  }
  return response.data || false;
}

/**
 * Get GitHub authentication state
 */
export async function getAuthState(): Promise<GitHubAuthState> {
  const response = await window.electronAPI.github.getAuthState();
  if (!response.success) {
    throw new Error(response.error || 'Failed to get auth state');
  }
  return response.data || { isAuthenticated: false };
}

/**
 * Open GitHub OAuth authorization in browser
 */
export async function openOAuthUrl(clientId: string, scopes?: string[]): Promise<void> {
  const response = await window.electronAPI.github.openOAuthUrl(clientId, scopes);
  if (!response.success) {
    throw new Error(response.error || 'Failed to open OAuth URL');
  }
}

/**
 * Fetch all accessible GitHub repositories
 */
export async function getRepositories(): Promise<GitHubRepository[]> {
  const response = await window.electronAPI.github.getRepositories();
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch repositories');
  }
  return response.data || [];
}

/**
 * Fetch a specific GitHub repository
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepository | null> {
  const response = await window.electronAPI.github.getRepository(owner, repo);
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch repository');
  }
  return response.data || null;
}

/**
 * Validate that token has required scopes
 */
export async function validateTokenScopes(
  requiredScopes?: string[]
): Promise<{ valid: boolean; missingScopes: string[] }> {
  const response = await window.electronAPI.github.validateScopes(requiredScopes);
  if (!response.success) {
    throw new Error(response.error || 'Failed to validate scopes');
  }
  return response.data || { valid: false, missingScopes: requiredScopes || [] };
}
