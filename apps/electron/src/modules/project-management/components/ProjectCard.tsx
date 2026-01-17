import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@aero-work/ui'
import { FolderGit2, Clock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import type { Project } from '../../../types/project'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusIcon = () => {
    switch (project.status) {
      case 'linked':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cloning':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    const variants = {
      linked: 'default',
      cloning: 'secondary',
      error: 'destructive',
    } as const

    return <Badge variant={variants[project.status]}>{project.status}</Badge>
  }

  const formatLastOpened = () => {
    if (!project.last_opened_at) return 'Never opened'

    const date = new Date(project.last_opened_at)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const truncatePath = (path: string, maxLength: number = 40) => {
    if (path.length <= maxLength) return path
    return '...' + path.slice(-(maxLength - 3))
  }

  return (
    <Card className="hover:shadow-md transition-shadow py-6">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {project.name || `${project.github_owner}/${project.github_repo}`}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground mb-1">{project.description}</p>
              )}
              {project.github_repo ? (
                <p className="text-sm text-muted-foreground">
                  {project.github_owner}/{project.github_repo} •{' '}
                  {project.is_private ? 'Private' : 'Public'} • {project.default_branch}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Local project • {project.default_branch}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatLastOpened()}</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-mono text-xs">{truncatePath(project.local_path)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-all">{project.local_path}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button asChild className="w-full bg-main">
          <Link to="/projects/$projectId" params={{ projectId: project.id }}>
            Open Board
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
