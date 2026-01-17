/**
 * Git operations service using simple-git
 */
import simpleGit, { type SimpleGit, type CloneOptions } from 'simple-git';
import fs from 'node:fs';
import path from 'node:path';
import type { GitOperationResult } from '../../types/project';

/**
 * Check if a directory exists and is writable
 */
export async function isDirectoryWritable(dirPath: string): Promise<boolean> {
  try {
    await fs.promises.access(dirPath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a directory is empty
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const files = await fs.promises.readdir(dirPath);
    return files.length === 0;
  } catch {
    return false;
  }
}

/**
 * Check if a directory is a Git repository
 */
export async function isGitRepository(dirPath: string): Promise<boolean> {
  const gitPath = path.join(dirPath, '.git');
  try {
    const stats = await fs.promises.stat(gitPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get the remote origin URL of a Git repository
 */
export async function getRemoteOriginUrl(dirPath: string): Promise<string | null> {
  try {
    const git: SimpleGit = simpleGit(dirPath);
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');
    return origin?.refs?.fetch || null;
  } catch {
    return null;
  }
}

/**
 * Normalize GitHub URL for comparison
 * Handles both HTTPS and SSH formats
 */
export function normalizeGitHubUrl(url: string): string {
  // Remove trailing .git
  let normalized = url.replace(/\.git$/, '');

  // Convert SSH to HTTPS format
  const sshMatch = normalized.match(/^git@github\.com:(.+)$/);
  if (sshMatch) {
    normalized = `https://github.com/${sshMatch[1]}`;
  }

  // Ensure lowercase for comparison
  return normalized.toLowerCase();
}

/**
 * Validate that a repository's remote matches the expected GitHub URL
 */
export async function validateRepositoryRemote(
  dirPath: string,
  expectedOwner: string,
  expectedRepo: string
): Promise<GitOperationResult> {
  const isRepo = await isGitRepository(dirPath);
  if (!isRepo) {
    return {
      success: false,
      message: 'Directory is not a Git repository',
      error: 'NOT_GIT_REPO',
    };
  }

  const remoteUrl = await getRemoteOriginUrl(dirPath);
  if (!remoteUrl) {
    return {
      success: false,
      message: 'No remote origin configured',
      error: 'NO_REMOTE_ORIGIN',
    };
  }

  const expectedUrl = `https://github.com/${expectedOwner}/${expectedRepo}`;
  const normalizedRemote = normalizeGitHubUrl(remoteUrl);
  const normalizedExpected = normalizeGitHubUrl(expectedUrl);

  if (normalizedRemote !== normalizedExpected) {
    return {
      success: false,
      message: `Remote origin does not match. Expected: ${expectedUrl}, Found: ${remoteUrl}`,
      error: 'REMOTE_MISMATCH',
    };
  }

  return {
    success: true,
    message: 'Repository remote validated successfully',
  };
}

/**
 * Clone a GitHub repository to a local directory
 */
export async function cloneRepository(
  owner: string,
  repo: string,
  targetPath: string,
  onProgress?: (progress: number, message: string) => void
): Promise<GitOperationResult> {
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;

  try {
    // Check if parent directory exists and is writable
    const parentDir = path.dirname(targetPath);
    const parentExists = await directoryExists(parentDir);

    if (!parentExists) {
      return {
        success: false,
        message: 'Parent directory does not exist',
        error: 'PARENT_DIR_NOT_FOUND',
      };
    }

    const parentWritable = await isDirectoryWritable(parentDir);
    if (!parentWritable) {
      return {
        success: false,
        message: 'Parent directory is not writable',
        error: 'PARENT_DIR_NOT_WRITABLE',
      };
    }

    // Check if target already exists
    const targetExists = await directoryExists(targetPath);
    if (targetExists) {
      const isEmpty = await isDirectoryEmpty(targetPath);
      if (!isEmpty) {
        // Check if it's already the correct repository
        const isRepo = await isGitRepository(targetPath);
        if (isRepo) {
          const validation = await validateRepositoryRemote(targetPath, owner, repo);
          if (validation.success) {
            return {
              success: true,
              message: 'Repository already exists at target location',
            };
          }
          return {
            success: false,
            message: 'Directory contains a different Git repository',
            error: 'DIFFERENT_REPO_EXISTS',
          };
        }
        return {
          success: false,
          message: 'Target directory is not empty',
          error: 'TARGET_NOT_EMPTY',
        };
      }
    }

    onProgress?.(0, 'Starting clone...');

    const git: SimpleGit = simpleGit();
    const options: CloneOptions = {
      '--progress': null,
    };

    await git.clone(cloneUrl, targetPath, options);

    onProgress?.(100, 'Clone completed');

    return {
      success: true,
      message: `Repository cloned successfully to ${targetPath}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: 'Failed to clone repository',
      error: errorMessage,
    };
  }
}

/**
 * Pull latest changes from remote
 */
export async function pullRepository(dirPath: string): Promise<GitOperationResult> {
  try {
    const isRepo = await isGitRepository(dirPath);
    if (!isRepo) {
      return {
        success: false,
        message: 'Not a Git repository',
        error: 'NOT_GIT_REPO',
      };
    }

    const git: SimpleGit = simpleGit(dirPath);
    await git.pull();

    return {
      success: true,
      message: 'Repository updated successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: 'Failed to pull repository',
      error: errorMessage,
    };
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(dirPath: string): Promise<string | null> {
  try {
    const git: SimpleGit = simpleGit(dirPath);
    const branchSummary = await git.branch();
    return branchSummary.current || null;
  } catch {
    return null;
  }
}

/**
 * Check repository status
 */
export async function getRepositoryStatus(dirPath: string): Promise<{
  isClean: boolean;
  current: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
} | null> {
  try {
    const git: SimpleGit = simpleGit(dirPath);
    const status = await git.status();
    return {
      isClean: status.isClean(),
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
    };
  } catch {
    return null;
  }
}
