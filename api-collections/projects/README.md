# Projects API Documentation

This document describes the IPC (Inter-Process Communication) APIs available for project management in Aero Work.

## Architecture

The API uses Electron's IPC mechanism:
- **Main Process**: Handles database operations, file system access, and GitHub API calls
- **Preload Script**: Exposes safe IPC channels via `contextBridge`
- **Renderer Process**: Accesses APIs through `window.electronAPI`

## API Domains

| Domain | Description | Documentation |
|--------|-------------|---------------|
| `projects` | CRUD operations for project records | [projects.md](./projects.md) |
| `github` | GitHub OAuth and repository operations | [github.md](./github.md) |
| `git` | Local Git repository operations | [git.md](./git.md) |
| `dialog` | Electron dialog operations | [dialog.md](./dialog.md) |

## Response Format

All API calls return a standardized `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Usage in Renderer

```typescript
// Example: List all projects
const response = await window.electronAPI.projects.list();
if (response.success) {
  console.log('Projects:', response.data);
} else {
  console.error('Error:', response.error);
}
```

## Usage with Services

Higher-level services are available in `src/modules/project-management/services/`:

```typescript
import { listProjects, createProjectFromRepository } from '@/modules/project-management/services';

// These services handle error unwrapping automatically
const projects = await listProjects();
```

## Database Schema

### `projects` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (UUID) | Primary key |
| `github_owner` | TEXT | GitHub owner/organization name |
| `github_repo` | TEXT | Repository name |
| `github_repo_id` | INTEGER | Unique GitHub repository ID |
| `local_path` | TEXT | Absolute path to local clone |
| `status` | TEXT | `linked`, `cloning`, or `error` |
| `is_private` | INTEGER | 0 (public) or 1 (private) |
| `default_branch` | TEXT | e.g., `main` |
| `created_at` | TEXT | ISO 8601 timestamp |
| `last_opened_at` | TEXT | ISO 8601 timestamp (nullable) |

## Security Notes

- GitHub tokens are stored using Electron's `safeStorage` API (OS-level encryption)
- Context isolation is enabled; renderer cannot access Node.js APIs directly
- All IPC channels are explicitly whitelisted in the preload script
