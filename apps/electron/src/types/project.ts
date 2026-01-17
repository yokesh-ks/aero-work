/**
 * Project-related TypeScript types for the Projects API
 */

/**
 * Project status enum
 */
export type ProjectStatus = 'linked' | 'cloning' | 'error';

/**
 * Project entity stored in SQLite
 */
export interface Project {
  id: string;
  github_owner: string;
  github_repo: string;
  github_repo_id: number;
  local_path: string;
  status: ProjectStatus;
  is_private: boolean;
  default_branch: string;
  created_at: string;
  last_opened_at: string | null;
}

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  githubOwner: string;
  githubRepo: string;
  githubRepoId: number;
  localPath: string;
  isPrivate: boolean;
  defaultBranch: string;
}

/**
 * Filter options for listing projects
 */
export interface ProjectFilter {
  search?: string;
  owner?: string;
  status?: ProjectStatus;
  recentDays?: number;
}

/**
 * GitHub repository from Octokit API
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    type: 'User' | 'Organization';
  };
  private: boolean;
  default_branch: string;
  clone_url: string;
  html_url: string;
  description: string | null;
  archived: boolean;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

/**
 * Result from Git operations
 */
export interface GitOperationResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Result from directory selection dialog
 */
export interface DirectorySelectResult {
  canceled: boolean;
  filePath?: string;
}

/**
 * GitHub authentication state
 */
export interface GitHubAuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    login: string;
    avatar_url: string;
    name: string | null;
  };
}

/**
 * IPC API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
