/**
 * GitHub integration service using Octokit
 */
import { Octokit } from '@octokit/rest'
import { safeStorage, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import type { GitHubRepository, GitHubAuthState } from '../../types/project'

const TOKEN_FILE_NAME = 'github-token.enc'

let octokit: Octokit | null = null
let cachedToken: string | null = null

/**
 * Get the path to the encrypted token file
 */
function getTokenFilePath(): string {
  return path.join(app.getPath('userData'), TOKEN_FILE_NAME)
}

/**
 * Store GitHub token securely using Electron safeStorage
 */
export async function storeGitHubToken(token: string): Promise<boolean> {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Safe storage encryption not available')
      return false
    }

    const encryptedToken = safeStorage.encryptString(token)
    const tokenPath = getTokenFilePath()
    await fs.promises.writeFile(tokenPath, encryptedToken)

    cachedToken = token
    octokit = new Octokit({ auth: token })

    return true
  } catch (error) {
    console.error('Failed to store GitHub token:', error)
    return false
  }
}

/**
 * Retrieve GitHub token from secure storage
 */
export async function getGitHubToken(): Promise<string | null> {
  if (cachedToken) {
    return cachedToken
  }

  try {
    const tokenPath = getTokenFilePath()
    const exists = await fs.promises
      .access(tokenPath, fs.constants.R_OK)
      .then(() => true)
      .catch(() => false)

    if (!exists) {
      return null
    }

    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Safe storage encryption not available')
      return null
    }

    const encryptedToken = await fs.promises.readFile(tokenPath)
    const token = safeStorage.decryptString(encryptedToken)

    cachedToken = token
    return token
  } catch (error) {
    console.error('Failed to retrieve GitHub token:', error)
    return null
  }
}

/**
 * Clear stored GitHub token
 */
export async function clearGitHubToken(): Promise<boolean> {
  try {
    const tokenPath = getTokenFilePath()
    await fs.promises.unlink(tokenPath).catch(() => {})

    cachedToken = null
    octokit = null

    return true
  } catch (error) {
    console.error('Failed to clear GitHub token:', error)
    return false
  }
}

/**
 * Get authenticated Octokit instance
 */
export async function getOctokit(): Promise<Octokit | null> {
  if (octokit) {
    return octokit
  }

  const token = await getGitHubToken()
  if (!token) {
    return null
  }

  octokit = new Octokit({ auth: token })
  return octokit
}

/**
 * Check if user is authenticated with GitHub
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getGitHubToken()
  if (!token) {
    return false
  }

  try {
    const client = await getOctokit()
    if (!client) return false

    await client.users.getAuthenticated()
    return true
  } catch {
    // Token might be invalid/expired
    return false
  }
}

/**
 * Get GitHub authentication state
 */
export async function getAuthState(): Promise<GitHubAuthState> {
  const token = await getGitHubToken()
  if (!token) {
    return { isAuthenticated: false }
  }

  try {
    const client = await getOctokit()
    if (!client) {
      return { isAuthenticated: false }
    }

    const { data: user } = await client.users.getAuthenticated()
    return {
      isAuthenticated: true,
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
      },
    }
  } catch {
    return { isAuthenticated: false }
  }
}

/**
 * Open GitHub OAuth authorization URL in browser
 */
export function openOAuthUrl(clientId: string, scopes: string[] = ['repo']): void {
  const scopeString = scopes.join(' ')
  const state = Math.random().toString(36).substring(7)
  const redirectUri = 'aerowork://oauth/callback'

  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', scopeString)
  url.searchParams.set('state', state)
  url.searchParams.set('redirect_uri', redirectUri)

  shell.openExternal(url.toString())
}

/**
 * Fetch accessible repositories for the authenticated user
 */
export async function getRepositories(): Promise<GitHubRepository[]> {
  const client = await getOctokit()
  if (!client) {
    throw new Error('Not authenticated with GitHub')
  }

  const repositories: GitHubRepository[] = []

  // Fetch user repositories (owned and collaborator)
  const userRepos = await client.paginate(client.repos.listForAuthenticatedUser, {
    visibility: 'all',
    affiliation: 'owner,collaborator,organization_member',
    sort: 'updated',
    per_page: 100,
  })

  for (const repo of userRepos) {
    // Skip archived repositories
    if (repo.archived) continue

    repositories.push({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
        type: repo.owner.type as 'User' | 'Organization',
      },
      private: repo.private,
      default_branch: repo.default_branch,
      clone_url: repo.clone_url,
      html_url: repo.html_url,
      description: repo.description,
      archived: repo.archived,
      permissions: repo.permissions
        ? {
            admin: repo.permissions.admin || false,
            push: repo.permissions.push || false,
            pull: repo.permissions.pull || false,
          }
        : undefined,
    })
  }

  // Sort by name
  repositories.sort((a, b) => a.full_name.localeCompare(b.full_name))

  return repositories
}

/**
 * Fetch a specific repository by owner and name
 */
export async function getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
  const client = await getOctokit()
  if (!client) {
    throw new Error('Not authenticated with GitHub')
  }

  try {
    const { data } = await client.repos.get({ owner, repo })

    if (data.archived) {
      return null // Don't allow archived repos
    }

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      owner: {
        login: data.owner.login,
        avatar_url: data.owner.avatar_url,
        type: data.owner.type as 'User' | 'Organization',
      },
      private: data.private,
      default_branch: data.default_branch,
      clone_url: data.clone_url,
      html_url: data.html_url,
      description: data.description,
      archived: data.archived,
      permissions: data.permissions
        ? {
            admin: data.permissions.admin || false,
            push: data.permissions.push || false,
            pull: data.permissions.pull || false,
          }
        : undefined,
    }
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Validate that the token has required scopes
 */
export async function validateTokenScopes(
  requiredScopes: string[] = ['repo']
): Promise<{ valid: boolean; missingScopes: string[] }> {
  const client = await getOctokit()
  if (!client) {
    return { valid: false, missingScopes: requiredScopes }
  }

  try {
    const response = await client.users.getAuthenticated()
    const scopeHeader = response.headers['x-oauth-scopes']

    if (!scopeHeader) {
      return { valid: false, missingScopes: requiredScopes }
    }

    const scopes = scopeHeader.split(',').map((s) => s.trim())
    const missingScopes = requiredScopes.filter((s) => !scopes.includes(s))

    return {
      valid: missingScopes.length === 0,
      missingScopes,
    }
  } catch {
    return { valid: false, missingScopes: requiredScopes }
  }
}
