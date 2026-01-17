import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Alert,
  AlertDescription,
  Textarea,
} from '@aero-work/ui'
import { Loader2, Github, AlertCircle, Lock, Unlock } from 'lucide-react'
import { getRepositories, getAuthState } from '../services/github-service'
import { createProjectFromRepository } from '../services/project-service'
import { FileBrowser } from './FileBrowser'
import type { GitHubRepository, PathValidationResult } from '../../../types/project'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

type Step = 'details' | 'path-select' | 'github-link' | 'creating'

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  console.log('CreateProjectDialog rendered, open:', open)
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  const [localPath, setLocalPath] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [repoSearch, setRepoSearch] = useState('')
  const [pathValidation, setPathValidation] = useState<PathValidationResult | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize dialog
  useEffect(() => {
    if (open) {
      setStep('details')
      setError(null)
    }
  }, [open])

  // Validate path when it changes
  useEffect(() => {
    if (localPath) {
      validatePath(localPath)
    } else {
      setPathValidation(null)
    }
  }, [localPath])

  const validatePath = async (path: string) => {
    try {
      const response = await window.electronAPI.dialog.validatePath(path)
      if (response.success) {
        setPathValidation(response.data || null)
      }
    } catch (error) {
      setPathValidation(null)
    }
  }

  const handlePathChange = (path: string) => {
    setLocalPath(path)
  }

  const handleCreateProject = async () => {
    try {
      setStep('creating')
      setLoading(true)
      setError(null)

      // Create project without GitHub first
      const projectData = {
        name: projectName.trim() || undefined,
        description: projectDescription.trim() || undefined,
        githubOwner: '', // Empty for non-GitHub projects
        githubRepo: '',
        githubRepoId: 0,
        localPath,
        isPrivate: false,
        defaultBranch: 'main',
      }

      console.log('Creating project with data:', projectData)

      const result = await window.electronAPI.projects.create(projectData)
      console.log('Project creation result:', result)

      if (result.success) {
        console.log('Project created successfully:', result.data)
        onProjectCreated()
        handleClose()
      } else {
        console.error('Project creation failed:', result.error)
        setError(result.error || 'Failed to create project')
        setStep('github-link')
      }
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err instanceof Error ? err.message : 'Failed to create project')
      setStep('github-link')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProjectWithGitHub = async () => {
    if (!selectedRepo) return

    try {
      setStep('creating')
      setLoading(true)
      setError(null)

      await createProjectFromRepository(
        selectedRepo,
        localPath,
        projectName.trim() || undefined,
        projectDescription.trim() || undefined
      )

      onProjectCreated()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      setStep('github-link')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('details')
    setSelectedRepo(null)
    setLocalPath('')
    setProjectName('')
    setProjectDescription('')
    setRepoSearch('')
    setPathValidation(null)
    setError(null)
    onOpenChange(false)
  }

  const checkGitHubAuth = async () => {
    try {
      const authState = await getAuthState()
      setIsAuthenticated(authState.isAuthenticated)
      if (authState.isAuthenticated) {
        setStep('github-link')
        loadRepositories()
      } else {
        // Open GitHub auth and stay on current step
        window.electronAPI.github.openOAuthUrl(process.env.GITHUB_CLIENT_ID || '', ['repo'])
      }
    } catch (err) {
      setError('Failed to check GitHub authentication')
    }
  }

  const loadRepositories = async () => {
    try {
      setLoading(true)
      setError(null)
      const repos = await getRepositories()
      setRepositories(repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const filteredRepos = repositories.filter((repo) =>
    repo.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  )

  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter a name for your project..."
              />
              <p className="text-sm text-muted-foreground mt-1">
                Required: Choose a name for your project.
              </p>
            </div>

            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter a brief description of your project..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Optional: Provide a short description for this project.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleClose} className="flex-1 bg-destructive">
                Cancel
              </Button>
              <Button
                onClick={() => setStep('path-select')}
                disabled={!projectName.trim()}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        )

      case 'path-select':
        return (
          <div className="space-y-4">
            <div>
              <Label>Local Directory</Label>
              <FileBrowser
                selectedPath={localPath}
                onPathChange={handlePathChange}
                validation={pathValidation}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep('github-link')}
                disabled={
                  !localPath.trim() ||
                  !pathValidation?.exists ||
                  !pathValidation?.isDirectory ||
                  !pathValidation?.hasWritePermission
                }
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        )

      case 'github-link':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect GitHub Repository</h3>
              <p className="text-muted-foreground mb-4">
                Optionally link this project to a GitHub repository.
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <Button onClick={checkGitHubAuth} className="w-full">
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub Account
                </Button>
                <Button variant="outline" onClick={handleCreateProject} className="w-full">
                  Skip & Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repo-search">Search Repositories</Label>
                  <Input
                    id="repo-search"
                    placeholder="Search by owner/repo name..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading repositories...</span>
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No repositories found
                    </div>
                  ) : (
                    filteredRepos.map((repo) => (
                      <Card
                        key={repo.id}
                        className={`cursor-pointer transition-colors ${
                          selectedRepo?.id === repo.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedRepo(repo)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={repo.owner.avatar_url} />
                              <AvatarFallback>
                                {repo.owner.login.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{repo.full_name}</span>
                                {repo.private ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Unlock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {repo.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline">{repo.default_branch}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('path-select')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateProjectWithGitHub}
                    disabled={!selectedRepo}
                    className="flex-1"
                  >
                    Create with GitHub
                  </Button>
                </div>

                <Button variant="ghost" onClick={handleCreateProject} className="w-full">
                  Skip GitHub & Create Project
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 'creating':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Creating Project</h3>
              <p className="text-muted-foreground">
                Setting up your project... This may take a few moments.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay">
          <div className="bg-secondary-background p-6 rounded-base border-2 border-border shadow-shadow max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading">Create New Project</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground size-8 flex items-center justify-center rounded-base border-2 border-transparent hover:border-border"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Link a GitHub repository to create a new project.
            </p>
            {renderStep()}
          </div>
        </div>
      )}
    </>
  )
}
