/**
 * Project service for renderer process
 * Calls the Electron API exposed via preload
 */
import type {
  Project,
  CreateProjectInput,
  ProjectFilter,
  ProjectStatus,
  GitHubRepository,
} from '../../../types/project'

/**
 * List all projects with optional filtering
 */
export async function listProjects(filter?: ProjectFilter): Promise<Project[]> {
  const response = await window.electronAPI.projects.list(filter)
  if (!response.success) {
    throw new Error(response.error || 'Failed to list projects')
  }
  return response.data || []
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const response = await window.electronAPI.projects.getById(id)
  if (!response.success) {
    throw new Error(response.error || 'Failed to get project')
  }
  return response.data || null
}

/**
 * Get a project by GitHub repository ID
 */
export async function getProjectByGitHubRepoId(githubRepoId: number): Promise<Project | null> {
  const response = await window.electronAPI.projects.getByGitHubRepoId(githubRepoId)
  if (!response.success) {
    throw new Error(response.error || 'Failed to get project')
  }
  return response.data || null
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const response = await window.electronAPI.projects.create(input)
  if (!response.success) {
    throw new Error(response.error || 'Failed to create project')
  }
  return response.data!
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<Project | null> {
  const response = await window.electronAPI.projects.updateStatus(id, status)
  if (!response.success) {
    throw new Error(response.error || 'Failed to update project status')
  }
  return response.data || null
}

/**
 * Update last opened timestamp for a project
 */
export async function updateLastOpened(id: string): Promise<Project | null> {
  const response = await window.electronAPI.projects.updateLastOpened(id)
  if (!response.success) {
    throw new Error(response.error || 'Failed to update last opened')
  }
  return response.data || null
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  const response = await window.electronAPI.projects.delete(id)
  if (!response.success) {
    throw new Error(response.error || 'Failed to delete project')
  }
  return response.data || false
}

/**
 * Check if a project exists for a GitHub repository
 */
export async function projectExistsByGitHubRepoId(githubRepoId: number): Promise<boolean> {
  const response = await window.electronAPI.projects.existsByGitHubRepoId(githubRepoId)
  if (!response.success) {
    throw new Error(response.error || 'Failed to check project existence')
  }
  return response.data || false
}

/**
 * Full project creation workflow:
 * 1. Select a GitHub repository
 * 2. Select or validate local directory
 * 3. Clone if needed
 * 4. Create project record
 */
export async function createProjectFromRepository(
  repository: GitHubRepository,
  localPath: string,
  name?: string,
  description?: string
): Promise<Project> {
  // Check if project already exists
  const exists = await projectExistsByGitHubRepoId(repository.id)
  if (exists) {
    throw new Error('A project already exists for this repository')
  }

  // Check if directory exists
  const dirExistsResponse = await window.electronAPI.git.directoryExists(localPath)
  if (!dirExistsResponse.success) {
    throw new Error(dirExistsResponse.error || 'Failed to check directory')
  }

  const directoryExists = dirExistsResponse.data

  if (directoryExists) {
    // Check if it's a git repository
    const isRepoResponse = await window.electronAPI.git.isRepository(localPath)
    if (!isRepoResponse.success) {
      throw new Error(isRepoResponse.error || 'Failed to check git repository')
    }

    if (isRepoResponse.data) {
      // Validate that remote matches
      const validateResponse = await window.electronAPI.git.validateRemote(
        localPath,
        repository.owner.login,
        repository.name
      )

      if (!validateResponse.success || !validateResponse.data?.success) {
        throw new Error(
          validateResponse.data?.message ||
            validateResponse.error ||
            'Repository remote does not match'
        )
      }
    } else {
      // Directory exists but is not a git repo
      const isEmptyResponse = await window.electronAPI.git.isDirectoryEmpty(localPath)
      if (!isEmptyResponse.success) {
        throw new Error(isEmptyResponse.error || 'Failed to check directory')
      }

      if (!isEmptyResponse.data) {
        throw new Error('Directory is not empty and is not a git repository')
      }

      // Clone into the empty directory
      const cloneResponse = await window.electronAPI.git.clone(
        repository.owner.login,
        repository.name,
        localPath
      )

      if (!cloneResponse.success || !cloneResponse.data?.success) {
        throw new Error(
          cloneResponse.data?.error || cloneResponse.error || 'Failed to clone repository'
        )
      }
    }
  } else {
    // Directory doesn't exist, clone
    const cloneResponse = await window.electronAPI.git.clone(
      repository.owner.login,
      repository.name,
      localPath
    )

    if (!cloneResponse.success || !cloneResponse.data?.success) {
      throw new Error(
        cloneResponse.data?.error || cloneResponse.error || 'Failed to clone repository'
      )
    }
  }

  // Create the project record
  const project = await createProject({
    name,
    description,
    githubOwner: repository.owner.login,
    githubRepo: repository.name,
    githubRepoId: repository.id,
    localPath,
    isPrivate: repository.private,
    defaultBranch: repository.default_branch,
  })

  return project
}
