# Projects API

CRUD operations for managing project records in the local SQLite database.

## Channels

### `projects:list`

List all projects with optional filtering.

**Parameters:**
```typescript
filter?: {
  search?: string;      // Fuzzy match on repo/owner name
  owner?: string;       // Exact match on GitHub owner
  status?: 'linked' | 'cloning' | 'error';
  recentDays?: number;  // Filter by last_opened_at within N days
}
```

**Response:**
```typescript
ApiResponse<Project[]>
```

**Example:**
```typescript
// List all projects
const all = await window.electronAPI.projects.list();

// Filter by owner
const filtered = await window.electronAPI.projects.list({ owner: 'aerowork' });

// Search by name
const searched = await window.electronAPI.projects.list({ search: 'api' });

// Recent projects (opened in last 7 days)
const recent = await window.electronAPI.projects.list({ recentDays: 7 });
```

---

### `projects:getById`

Get a single project by its UUID.

**Parameters:**
```typescript
id: string  // Project UUID
```

**Response:**
```typescript
ApiResponse<Project | null>
```

**Example:**
```typescript
const response = await window.electronAPI.projects.getById('550e8400-e29b-41d4-a716-446655440000');
if (response.success && response.data) {
  console.log('Project:', response.data.github_repo);
}
```

---

### `projects:getByGitHubRepoId`

Get a project by its GitHub repository ID.

**Parameters:**
```typescript
githubRepoId: number  // GitHub's unique repository ID
```

**Response:**
```typescript
ApiResponse<Project | null>
```

**Example:**
```typescript
const response = await window.electronAPI.projects.getByGitHubRepoId(123456789);
```

---

### `projects:create`

Create a new project record.

**Parameters:**
```typescript
input: {
  githubOwner: string;     // e.g., 'aerowork'
  githubRepo: string;      // e.g., 'aero-work'
  githubRepoId: number;    // From GitHub API
  localPath: string;       // Absolute filesystem path
  isPrivate: boolean;      // Repository visibility
  defaultBranch: string;   // e.g., 'main'
}
```

**Response:**
```typescript
ApiResponse<Project>
```

**Example:**
```typescript
const response = await window.electronAPI.projects.create({
  githubOwner: 'aerowork',
  githubRepo: 'aero-work',
  githubRepoId: 123456789,
  localPath: '/Users/dev/projects/aero-work',
  isPrivate: false,
  defaultBranch: 'main'
});
```

**Errors:**
- `A project already exists for this GitHub repository` - Duplicate githubRepoId

---

### `projects:updateStatus`

Update a project's status.

**Parameters:**
```typescript
id: string;
status: 'linked' | 'cloning' | 'error';
```

**Response:**
```typescript
ApiResponse<Project | null>
```

**Example:**
```typescript
// Mark project as having an error
await window.electronAPI.projects.updateStatus(projectId, 'error');

// Mark as successfully linked
await window.electronAPI.projects.updateStatus(projectId, 'linked');
```

---

### `projects:updateLastOpened`

Update the `last_opened_at` timestamp to current time.

**Parameters:**
```typescript
id: string  // Project UUID
```

**Response:**
```typescript
ApiResponse<Project | null>
```

**Example:**
```typescript
// Call when user opens a project
await window.electronAPI.projects.updateLastOpened(projectId);
```

---

### `projects:delete`

Delete a project record (does not delete local files).

**Parameters:**
```typescript
id: string  // Project UUID
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.projects.delete(projectId);
if (response.success && response.data) {
  console.log('Project deleted');
}
```

---

### `projects:existsByGitHubRepoId`

Check if a project exists for a given GitHub repository.

**Parameters:**
```typescript
githubRepoId: number
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.projects.existsByGitHubRepoId(123456789);
if (response.data) {
  console.log('Project already exists');
}
```

---

## Type Definitions

### Project

```typescript
interface Project {
  id: string;                          // UUID
  github_owner: string;                // e.g., 'aerowork'
  github_repo: string;                 // e.g., 'aero-work'
  github_repo_id: number;              // GitHub's repo ID
  local_path: string;                  // Absolute path
  status: 'linked' | 'cloning' | 'error';
  is_private: boolean;
  default_branch: string;              // e.g., 'main'
  created_at: string;                  // ISO 8601
  last_opened_at: string | null;       // ISO 8601 or null
}
```

### ProjectFilter

```typescript
interface ProjectFilter {
  search?: string;
  owner?: string;
  status?: 'linked' | 'cloning' | 'error';
  recentDays?: number;
}
```

### CreateProjectInput

```typescript
interface CreateProjectInput {
  githubOwner: string;
  githubRepo: string;
  githubRepoId: number;
  localPath: string;
  isPrivate: boolean;
  defaultBranch: string;
}
```
