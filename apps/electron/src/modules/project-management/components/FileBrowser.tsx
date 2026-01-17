import { useState, useEffect } from 'react'
import {
  Button,
  Input,
  ScrollArea,
  Card,
  CardContent,
} from '@aero-work/ui'
import {
  Folder,
  File,
  Home,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import type { FileSystemEntry, PathValidationResult } from '../../../types/project'

interface FileBrowserProps {
  selectedPath: string
  onPathChange: (path: string) => void
  validation: PathValidationResult | null
}

export function FileBrowser({ selectedPath, onPathChange, validation }: FileBrowserProps) {
  const [currentPath, setCurrentPath] = useState('')
  const [entries, setEntries] = useState<FileSystemEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [manualPath, setManualPath] = useState('')

  // Initialize with home directory
  useEffect(() => {
    loadHomeDirectory()
  }, [])

  // Load directory when currentPath changes
  useEffect(() => {
    if (currentPath) {
      loadDirectory(currentPath)
    }
  }, [currentPath])

  const loadHomeDirectory = async () => {
    try {
      const response = await window.electronAPI.dialog.getHomeDirectory()
      if (response.success && response.data) {
        setCurrentPath(response.data)
      }
    } catch (error) {
      console.error('Failed to get home directory:', error)
    }
  }

  const loadDirectory = async (path: string) => {
    setLoading(true)
    try {
      const response = await window.electronAPI.dialog.listDirectory(path)
      if (response.success && response.data) {
        setEntries(response.data)
      } else {
        setEntries([])
      }
    } catch (error) {
      console.error('Failed to load directory:', error)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setSearchQuery('')
  }

  const handleGoUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/'
    setCurrentPath(parentPath)
    setSearchQuery('')
  }

  const handleSelectEntry = (entry: FileSystemEntry) => {
    if (entry.type === 'directory') {
      handleNavigate(entry.path)
    } else {
      // For files, just update the selected path (though we validate it's a directory)
      onPathChange(entry.path)
    }
  }

  const handleManualPathSubmit = () => {
    if (manualPath.trim()) {
      onPathChange(manualPath.trim())
      setCurrentPath(manualPath.trim())
    }
  }

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getValidationIcon = () => {
    if (!validation) return null

    if (validation.exists && validation.isDirectory && validation.hasWritePermission) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (validation.exists && !validation.isDirectory) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getValidationMessage = () => {
    if (!validation) return null

    if (!validation.exists) {
      return 'Directory does not exist'
    }
    if (!validation.isDirectory) {
      return 'Path is not a directory'
    }
    if (!validation.hasWritePermission) {
      return 'No write permission'
    }
    if (validation.hasGit) {
      return 'Git repository detected'
    }
    return 'Valid directory'
  }

  return (
    <div className="space-y-4">
      {/* Current path and navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={loadHomeDirectory}
          title="Go to home directory"
        >
          <Home className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoUp}
          disabled={currentPath === '/'}
          title="Go up one level"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 font-mono text-sm bg-muted px-3 py-2 rounded border">
          {currentPath || 'Loading...'}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search current directory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Manual path entry */}
      <div className="flex gap-2">
        <Input
          placeholder="Or enter path manually..."
          value={manualPath}
          onChange={(e) => setManualPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualPathSubmit()}
        />
        <Button onClick={handleManualPathSubmit} disabled={!manualPath.trim()}>
          Go
        </Button>
      </div>

      {/* Selected path validation */}
      {selectedPath && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {getValidationIcon()}
              <div className="flex-1">
                <div className="font-medium text-sm">Selected Path:</div>
                <div className="font-mono text-xs text-muted-foreground break-all">
                  {selectedPath}
                </div>
              </div>
            </div>
            {validation && (
              <div className="text-xs text-muted-foreground mt-1">
                {getValidationMessage()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Directory listing */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No matches found' : 'Directory is empty'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredEntries.map((entry) => (
                  <button
                    key={entry.path}
                    onClick={() => handleSelectEntry(entry)}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    {entry.type === 'directory' ? (
                      <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{entry.name}</div>
                      {entry.type === 'file' && entry.size && (
                        <div className="text-xs text-muted-foreground">
                          {(entry.size / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
